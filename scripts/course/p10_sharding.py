"""Reproduces src/content/blog/model-development-sharding-recomputation.mdx.

Run: python3 scripts/course/p10_sharding.py
1. ZeRO stage 1 executed on CPU: two gloo processes with PyTorch DDP and
   ZeroRedundancyOptimizer(AdamW) against a single-process AdamW reference;
   checks the parameters match and each rank holds about half the moments.
   (FSDP2 `fully_shard` in PyTorch 2.6 needs accelerator streams and was not run.)
2. Activation recomputation: bytes saved for backward with and without
   torch.utils.checkpoint, counted with saved-tensor hooks; gradients compared.
3. The memory and communication arithmetic in the post.
"""
import os

import torch
import torch.distributed as dist
import torch.multiprocessing as mp
import torch.nn as nn
from torch.distributed.optim import ZeroRedundancyOptimizer
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.checkpoint import checkpoint


def section(title):
    print(f"\n== {title}")


def net():
    torch.manual_seed(0)
    return nn.Sequential(*[nn.Sequential(nn.Linear(32, 32), nn.GELU()) for _ in range(4)])


def data(rank):
    torch.manual_seed(10 + rank)
    return torch.randn(8, 32)


def zero1_worker(rank, out):
    os.environ.update(MASTER_ADDR="127.0.0.1", MASTER_PORT="29551")
    dist.init_process_group("gloo", rank=rank, world_size=2)
    m = DDP(net())
    opt = ZeroRedundancyOptimizer(m.parameters(), optimizer_class=torch.optim.AdamW, lr=1e-2)
    for _ in range(3):
        opt.zero_grad()
        m(data(rank)).pow(2).mean().backward()
        opt.step()
    moments = sum(s[k].numel() for s in opt.optim.state.values() for k in ("exp_avg", "exp_avg_sq"))
    out[f"moments{rank}"] = moments
    if rank == 0:
        out["params"] = torch.cat([p.detach().flatten() for p in m.parameters()]).tolist()
    dist.destroy_process_group()


if __name__ == "__main__":
    section("ZeRO stage 1 on CPU (gloo, 2 ranks)")
    out = mp.Manager().dict()
    mp.spawn(zero1_worker, args=(out,), nprocs=2, join=True)
    ref = net()
    opt = torch.optim.AdamW(ref.parameters(), lr=1e-2)
    for _ in range(3):
        opt.zero_grad()
        ref(torch.cat([data(0), data(1)])).pow(2).mean().backward()
        opt.step()
    p_ref = torch.cat([p.detach().flatten() for p in ref.parameters()])
    full = 2 * sum(p.numel() for p in ref.parameters())
    diff = (torch.tensor(out["params"]) - p_ref).abs().max().item()
    print(f" moments held: rank 0 {out['moments0']:,}, rank 1 {out['moments1']:,}, unsharded {full:,}")
    print(f" max parameter difference after 3 steps vs single-process AdamW: {diff:.1e}")
    assert out["moments0"] + out["moments1"] == full and diff < 1e-5

    section("activation recomputation: bytes saved for backward")
    def saved_bytes(fn):
        total = [0]
        def pack(t):
            total[0] += t.numel() * t.element_size()
            return t
        with torch.autograd.graph.saved_tensors_hooks(pack, lambda t: t):
            loss = fn()
        loss.backward()
        return total[0]
    x = torch.randn(64, 32, requires_grad=True)
    m = net()
    plain = saved_bytes(lambda: m(x).pow(2).mean())
    g_plain = [p.grad.clone() for p in m.parameters()]
    m.zero_grad()
    def checkpointed_loss():
        h = x
        for block in m:  # keep only each block's input; recompute its inside during backward
            h = checkpoint(block, h, use_reentrant=False)
        return h.pow(2).mean()
    ckpt = saved_bytes(checkpointed_loss)
    g_ckpt = [p.grad for p in m.parameters()]
    print(f" saved during forward: {plain:,} bytes without checkpointing, {ckpt:,} with (outer graph only)")
    assert all(torch.allclose(a, b) for a, b in zip(g_plain, g_ckpt)) and ckpt < plain
    print(" gradients identical with recomputation")

    section("ZeRO per-GPU model-state memory, 7B parameters, 8 data-parallel GPUs (16 B/param)")
    P, n = 7e9, 8
    stages = {"0 (plain DP)": 16 * P, "1 (optimizer state)": 4 * P + 12 * P / n, "2 (+ gradients)": 2 * P + 14 * P / n, "3 (+ parameters)": 16 * P / n}
    for k, v in stages.items():
        print(f" stage {k}: {v / 1e9:.2f} GB")
    assert [round(v / 1e9, 2) for v in stages.values()] == [112.0, 38.5, 26.25, 14.0]
    print(f" stage 3 floor with 64 GPUs: {16 * P / 64 / 1e9:.2f} GB")

    section("communication per step, in units of the BF16 parameter bytes (2 bytes x N)")
    print(" one pass per update: DP / stage 1 / stage 2 = 2 psi; stage 3 = 3 psi (1.5 times)")
    m = 2  # microbatches per update
    totals = {"DP": 2, "stage 1": 2, "stage 2": m * 1 + 1, "stage 3": m * 3}
    print(f" {m} microbatches per update: " + ", ".join(f"{k} {v} psi" for k, v in totals.items()))
    assert totals == {"DP": 2, "stage 1": 2, "stage 2": 3, "stage 3": 6}

    section("recomputation compute")
    print(f" training 6N per token; full recomputation adds a forward pass, 2N: 8N/6N = {8 / 6:.2f}")
    print(f" GPT-3 shape (a=96, s=2048, h=12288): 5as/h = {5 * 96 * 2048 / 12288:.0f} vs 34")
    assert round(5 * 96 * 2048 / 12288) == 80

    section("activity")
    P = 13e9
    for n in (8, 16):
        print(f" 13B on {n} x 80 GB: stage 2 {(2 * P + 14 * P / n) / 1e9:.1f} GB, stage 3 {16 * P / n / 1e9:.1f} GB")
    assert round((2 * P + 14 * P / 8) / 1e9, 2) == 48.75 and 16 * P / 8 == 26e9
