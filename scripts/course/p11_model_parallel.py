"""Reproduces src/content/blog/model-development-model-parallelism.mdx.

Run: python3 scripts/course/p11_model_parallel.py
1. Tensor parallelism of an MLP, executed: split the first matrix by columns and
   the second by rows across two gloo processes; the all-reduced output must equal
   the unsplit MLP.
2. Pipeline bubble arithmetic from Narayanan et al. (2021), Sec. 2.2.
"""
import os

import torch
import torch.distributed as dist
import torch.multiprocessing as mp
import torch.nn.functional as F

D, FF = 8, 32


def weights():
    torch.manual_seed(0)
    return torch.randn(4, D), torch.randn(D, FF), torch.randn(FF, D)


def worker(rank, out):
    os.environ.update(MASTER_ADDR="127.0.0.1", MASTER_PORT="29561")
    dist.init_process_group("gloo", rank=rank, world_size=2)
    X, A, B = weights()
    cols = slice(rank * FF // 2, (rank + 1) * FF // 2)
    Y_part = F.gelu(X @ A[:, cols])          # column-parallel: no communication; GeLU applies per shard
    Z_part = Y_part @ B[cols, :]             # row-parallel: a partial sum of the output
    dist.all_reduce(Z_part)                  # the one all-reduce in the forward pass
    if rank == 0:
        out["Z"] = Z_part.tolist()
    dist.destroy_process_group()


if __name__ == "__main__":
    print("== tensor-parallel MLP across 2 processes")
    out = mp.Manager().dict()
    mp.spawn(worker, args=(out,), nprocs=2, join=True)
    X, A, B = weights()
    Z = F.gelu(X @ A) @ B
    diff = (torch.tensor(out["Z"]) - Z).abs().max().item()
    print(f" max difference from the unsplit MLP: {diff:.1e}")
    assert diff < 1e-4
    # Why the split must be by columns first: GeLU(X A1 + X A2) != GeLU(X A1) + GeLU(X A2).
    half = D // 2
    wrong = F.gelu(X[:, :half] @ A[:half]) + F.gelu(X[:, half:] @ A[half:])
    print(f" splitting A by rows instead: max error {(wrong - F.gelu(X @ A)).abs().max():.2f} (GeLU is not linear)")

    print("\n== pipeline bubble overhead (p - 1) / m relative to work; idle share (p - 1) / (m + p - 1)")
    for p, m in ((4, 4), (4, 16), (4, 64), (8, 64)):
        print(f" p = {p}, m = {m}: {(p - 1) / m:.3f}")
    assert (4 - 1) / 4 == 0.75 and (4 - 1) / 16 == 0.1875 and round((8 - 1) / 64, 3) == 0.109
    print(f" p = 8, m = 64, v = 2: {(8 - 1) / 64 / 2:.3f}")
    print(f" try it: p = 16, m = 32 -> overhead {15 / 32:.2f}, idle share {15 / 47:.2f}; with v = 4 -> overhead {15 / 32 / 4:.3f}, idle share {3.75 / 35.75:.3f}")
    print(f" p = 4, m = 4: overhead {3 / 4:.2f}, idle share of elapsed time {3 / 7:.3f}; p = 4, m = 64: {3 / 64:.3f}, {3 / 67:.3f}")
    assert round(3 / 7, 2) == 0.43 and round(15 / 47, 2) == 0.32 and round(3.75 / 35.75, 2) == 0.10
    assert round(15 / 32, 2) == 0.47 and round(15 / 32 / 4, 2) == 0.12

    print("\n== tensor-parallel communication per layer (forward): 2 all-reduces of b*s*h activations")
    b, s, h = 1, 4096, 8192
    print(f" one all-reduce of {b * s * h * 2 / 1e6:.0f} MB (BF16) per sub-layer, 2 per layer forward, 2 backward, for every microbatch")
    assert b * s * h * 2 == 67_108_864

    print("\n== layout activity: 64 GPUs in servers of 8, model needs 8-way splitting")
    t, pp = 8, 1
    print(f" tensor {t} within a server x data {64 // (t * pp)} = 64")
