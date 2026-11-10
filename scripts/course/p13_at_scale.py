"""Reproduces src/content/blog/model-development-running-at-scale.mdx.

Run: python3 scripts/course/p13_at_scale.py   (torch, CPU)
1. MFU from measured throughput; Llama 3 Table 4 layouts.
2. Checkpoint interval from Young's approximation with Llama 3's interruption rate.
3. torch.profiler on one training step of the small model from p6_train.py.
4. The layout activity.
"""
import math

import torch
import torch.nn.functional as F


def section(title):
    print(f"\n== {title}")


PEAK = 989.5e12

section("MFU from throughput")
N, tps = 7e9, 10_000
print(f" 7B at {tps:,} tokens/s per GPU: 6 N x tokens/s = {6 * N * tps / 1e12:.0f} TFLOP/s = {6 * N * tps / PEAK:.0%} MFU")
assert round(6 * N * tps / PEAK, 2) == 0.42
print(f" Llama 3 Table 4: 400 TFLOPs/GPU -> {400e12 / PEAK:.0%} of 989.5 (reported 41% BF16 MFU)")

section("Llama 3 405B layouts (Table 4)")
for tp, cp, pp, dp, seq, bpd in ((8, 1, 16, 64, 8192, 32), (8, 1, 16, 128, 8192, 16), (8, 16, 16, 8, 131072, 16)):
    print(f" TP{tp} x CP{cp} x PP{pp} x DP{dp} = {tp * cp * pp * dp:,} GPUs; tokens per batch {seq * bpd * dp / 1e6:.1f}M")
assert 8 * 16 * 128 == 16384 and 8 * 16 * 16 * 8 == 16384

section("checkpoint interval, Young (1974): sqrt(2 x checkpoint cost x mean time between failures)")
mtbf_h = 54 * 24 / 419
cost_min = 5
tau = math.sqrt(2 * cost_min * mtbf_h * 60)
print(f" 419 unexpected interruptions in 54 days -> one every {mtbf_h:.1f} h")
print(f" with an illustrative {cost_min}-minute checkpoint: interval ~ {tau:.0f} min")
print(f" expected loss per failure ~ half an interval ({tau / 2:.0f} min) plus restart time")
assert round(mtbf_h, 1) == 3.1 and round(tau) == 43
print(f" daily: {24 * 60 / tau * cost_min:.0f} min writing checkpoints, {24 / mtbf_h * tau / 2:.0f} min of lost work")

section("profiling one training step of a 1M-parameter model (CPU)")
from torch.profiler import ProfilerActivity, profile
import torch.nn as nn
D, V, CTX = 128, 2048, 128


def profiled_step(dropout):
    torch.manual_seed(0)
    blocks = nn.ModuleList(nn.TransformerEncoderLayer(D, 4, 352, dropout=dropout, batch_first=True, norm_first=True) for _ in range(4))
    emb, head = nn.Embedding(V, D), nn.Linear(D, V)
    params = [*emb.parameters(), *blocks.parameters(), *head.parameters()]
    opt = torch.optim.AdamW(params, lr=1e-3)
    x, y = torch.randint(0, V, (16, CTX)), torch.randint(0, V, (16, CTX))
    mask = nn.Transformer.generate_square_subsequent_mask(CTX)

    def step():
        h = emb(x)
        for blk in blocks:
            h = blk(h, src_mask=mask, is_causal=True)
        loss = F.cross_entropy(head(h).view(-1, V), y.view(-1))
        opt.zero_grad(); loss.backward(); opt.step()
    step()  # warm up before measuring
    with profile(activities=[ProfilerActivity.CPU]) as prof:
        step()
    ev = prof.key_averages()
    total = sum(e.self_cpu_time_total for e in ev)
    return {e.key: e.self_cpu_time_total / total for e in ev}, total


for dropout in (0.1, 0.0):  # nn.TransformerEncoderLayer defaults to dropout=0.1
    shares, total = profiled_step(dropout)
    top = sorted(shares.items(), key=lambda kv: -kv[1])[:4]
    print(f" dropout {dropout}: step {total / 1e3:.0f} ms of self CPU time; top: " + ", ".join(f"{k} {v:.0%}" for k, v in top))

section("activity: 70B on 256 GPUs (8 per server, 80 GB)")
state = 16 * 70e9
for tp, pp in ((8, 1), (8, 4)):
    print(f" TP{tp} x PP{pp}: {state / (tp * pp) / 1e9:.0f} GB of state per GPU before ZeRO; DP = {256 // (tp * pp)}")
zero1 = 4 * 70e9 / 32 + 12 * 70e9 / (32 * 8)
print(f" TP8 x PP4 x DP8 with ZeRO-1 over DP: {zero1 / 1e9:.1f} GB")
assert state / 32 / 1e9 == 35 and round(zero1 / 1e9, 1) == 12.0
