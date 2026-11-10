"""Reproduces src/content/blog/model-development-efficient-execution.mdx.

Run: python3 scripts/course/p12_efficient.py   (torch, CPU)
1. Tiled attention with an online softmax equals ordinary attention.
2. FP16, BF16 and FP8 ranges and rounding, as PyTorch 2.6 represents them.
3. FP8 with one scale for the whole tensor versus one scale per block of 128.
"""
import math

import torch


def section(title):
    print(f"\n== {title}")


section("online softmax, one query, keys in blocks of 2")
s = torch.tensor([1.0, 3.0, 2.0, 0.0])          # scores of one query against 4 keys
v = torch.tensor([10.0, 20.0, 30.0, 40.0])      # one value per key (1-d for clarity)
exact = (torch.softmax(s, 0) * v).sum()
m, l, acc = -math.inf, 0.0, 0.0                 # running max, running sum of exp, running weighted sum
for blk in (slice(0, 2), slice(2, 4)):
    m_new = max(m, s[blk].max().item())
    scale = math.exp(m - m_new) if m != -math.inf else 0.0
    e = torch.exp(s[blk] - m_new)
    l = l * scale + e.sum().item()
    acc = acc * scale + (e * v[blk]).sum().item()
    m = m_new
    print(f" after block {blk.start}-{blk.stop - 1}: max {m}, sum {l:.4f}, output so far {acc / l:.4f}")
print(f" tiled {acc / l:.4f} vs exact {exact:.4f}")
assert abs(acc / l - exact.item()) < 1e-5

section("tiled attention on random matrices")
torch.manual_seed(0)
N, d, B = 256, 64, 32
Q, K, V = torch.randn(N, d), torch.randn(N, d), torch.randn(N, d)
ref = torch.softmax(Q @ K.T / math.sqrt(d), -1) @ V
O = torch.zeros(N, d); M = torch.full((N, 1), -math.inf); L = torch.zeros(N, 1)
for j in range(0, N, B):
    S = Q @ K[j:j + B].T / math.sqrt(d)
    M_new = torch.maximum(M, S.max(-1, keepdim=True).values)
    P = torch.exp(S - M_new)
    corr = torch.exp(M - M_new)
    L = L * corr + P.sum(-1, keepdim=True)
    O = O * corr + P @ V[j:j + B]
    M = M_new
print(f" max |tiled - full| = {(O / L - ref).abs().max():.1e}; the {N}x{N} score matrix never existed at once (blocks of {N}x{B})")
assert torch.allclose(O / L, ref, atol=1e-5)

section("FlashAttention paper, Fig. 2 (GPT-2 medium attention, A100)")
print(" standard: 66.6 GFLOPs, 40.3 GB HBM traffic, 41.7 ms; FlashAttention: 75.2 GFLOPs, 4.4 GB, 7.3 ms")
print(f" {75.2 / 66.6 - 1:.0%} more FLOPs, {40.3 / 4.4:.1f}x less traffic, {41.7 / 7.3:.1f}x faster")
assert round(40.3 / 4.4, 1) == 9.2 and round(41.7 / 7.3, 1) == 5.7

section("number formats")
for t in (torch.float16, torch.bfloat16, torch.float8_e4m3fn, torch.float8_e5m2):
    f = torch.finfo(t)
    print(f" {str(t):>22}: max {f.max:.4g}, spacing above 1 = {f.eps}")
print(" fp16: 2^-25 ->", torch.tensor(2 ** -25, dtype=torch.float16).item(), "; 70,000 ->", torch.tensor(70000.0, dtype=torch.float16).item())
g = torch.tensor(2 ** -25)
print(" a gradient of 2^-25 scaled by 1024 survives fp16:", (g * 1024).half().float().item() / 1024 == 2 ** -25)
print(" bf16: 1 + 0.001 ->", (torch.tensor(1.0, dtype=torch.bfloat16) + 0.001).item())
assert torch.finfo(torch.float8_e4m3fn).max == 448 and torch.finfo(torch.float8_e5m2).max == 57344

section("FP8 E4M3 with one scale versus per-block scales")
torch.manual_seed(1)
x = torch.randn(1024) * 0.001
x[7] = 100.0                                    # one outlier, 100,000 times the typical value
def fp8(t, scale):
    return (t / scale).to(torch.float8_e4m3fn).float() * scale
one = fp8(x, x.abs().max() / 448)
blocks = torch.cat([fp8(b, b.abs().max() / 448) for b in x.split(128)])
mask = torch.arange(1024) >= 128                # blocks without the outlier
err = lambda y: ((y - x)[mask].abs() / x[mask].abs().clamp_min(1e-12)).median().item()
zero_one = (one[mask] == 0).float().mean().item()
print(f" one scale: {zero_one:.0%} of small values flushed to zero, median relative error {err(one):.2f}")
print(f" per-block scales: median relative error {err(blocks):.3f}")
assert err(blocks) < 0.05 and err(one) > 5 * err(blocks)
