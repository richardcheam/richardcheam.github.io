"""Reproduces src/content/blog/model-development-data-parallelism.mdx on CPU.

Run: python3 scripts/course/p9_ddp.py
Starts two processes with torch.distributed (gloo backend) and PyTorch DDP, gives
them batches with different numbers of target tokens, and compares the averaged
gradients with a single process that sees the whole batch. Also checks the
batch and communication arithmetic in the post.
"""
import os

import torch
import torch.distributed as dist
import torch.multiprocessing as mp
import torch.nn as nn
import torch.nn.functional as F
from torch.nn.parallel import DistributedDataParallel as DDP

V, D = 6, 4


def model_and_data():
    torch.manual_seed(0)
    m = nn.Sequential(nn.Embedding(V, D), nn.Linear(D, V))
    # Rank 0: 3 target tokens; rank 1: 1 target token (-100 marks ignored positions).
    x = [torch.tensor([[1, 2, 3, 4]]), torch.tensor([[5, 1, 2, 3]])]
    y = [torch.tensor([[2, 3, 4, -100]]), torch.tensor([[1, -100, -100, -100]])]
    return m, x, y


def grads(m):
    return torch.cat([p.grad.flatten() for p in m.parameters()])


def worker(rank, world, mode, out):
    os.environ.update(MASTER_ADDR="127.0.0.1", MASTER_PORT="29531")
    dist.init_process_group("gloo", rank=rank, world_size=world)
    m, x, y = model_and_data()
    ddp = DDP(m)
    logits = ddp(x[rank])
    if mode == "local_mean":  # each rank averages over its own targets; DDP then averages ranks
        loss = F.cross_entropy(logits.reshape(-1, V), y[rank].reshape(-1), ignore_index=-100)
    else:  # global token mean: sum, divide by the global count, undo DDP's division by world size
        n_local = (y[rank] != -100).sum()
        n_global = n_local.clone(); dist.all_reduce(n_global)
        loss = F.cross_entropy(logits.reshape(-1, V), y[rank].reshape(-1), ignore_index=-100, reduction="sum") * world / n_global
    loss.backward()
    if rank == 0:
        out[mode] = grads(m).tolist()
    dist.barrier(); dist.destroy_process_group()


if __name__ == "__main__":
    # Reference: one process, the whole batch, token mean.
    m, x, y = model_and_data()
    logits = m(torch.cat(x))
    F.cross_entropy(logits.reshape(-1, V), torch.cat(y).reshape(-1), ignore_index=-100).backward()
    ref = grads(m)
    m, x, y = model_and_data()
    logits = m(torch.cat(x))
    per_row = [F.cross_entropy(logits[i].reshape(-1, V), y[i].reshape(-1), ignore_index=-100) for i in range(2)]
    (sum(per_row) / 2).backward()
    row_mean = grads(m)

    manager = mp.Manager(); out = manager.dict()
    for mode in ("local_mean", "global_mean"):
        mp.spawn(worker, args=(2, mode, out), nprocs=2, join=True)
    for mode in ("local_mean", "global_mean"):
        g = torch.tensor(out[mode])
        print(f"{mode:>12}: max |grad - token-mean reference| = {(g - ref).abs().max():.2e}; vs mean-of-rank-means = {(g - row_mean).abs().max():.2e}")
    assert torch.allclose(torch.tensor(out["global_mean"]), ref, atol=1e-6)
    assert torch.allclose(torch.tensor(out["local_mean"]), row_mean, atol=1e-6)
    assert not torch.allclose(ref, row_mean, atol=1e-3)
    print("DDP + per-rank mean = mean of rank means; DDP + global count = the single-process token mean")

    # Arithmetic in the post.
    micro, accum, world, seq = 4, 8, 64, 4096
    print(f"\nglobal batch: {micro} x {accum} x {world} = {micro * accum * world} sequences = {micro * accum * world * seq / 1e6:.1f}M tokens")
    assert micro * accum * world == 2048 and micro * accum * world * seq == 8_388_608
    N, n = 7e9, 8
    grad_bytes = 2 * N
    per_gpu = 2 * (n - 1) / n * grad_bytes
    print(f"ring all-reduce of {grad_bytes / 1e9:.0f} GB of BF16 gradients over {n} GPUs: each sends {per_gpu / 1e9:.1f} GB; at 100 GB/s, {per_gpu / 100e9:.2f} s")
    assert round(per_gpu / 1e9, 1) == 24.5 and round(per_gpu / 100e9, 2) == 0.24
    print(f"toy losses: rank means (1+1+1)/3 = 1 and 3/1 = 3 -> DDP average {(1 + 3) / 2}; token mean {(1 + 1 + 1 + 3) / 4}")
    print(f"try it: 3 + 1 targets as 1 + 3 targets after a reshuffle gives the same token mean but rank means 1 and 3 -> 2 again")
