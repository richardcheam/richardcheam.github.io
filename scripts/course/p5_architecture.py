"""Reproduces the numbers in src/content/blog/model-development-decoder-architecture.mdx.

Run: python3 scripts/course/p5_architecture.py   (pure Python)
Configuration from Llama 3, Table 3 (8B column).
"""
import math


def section(title):
    print(f"\n== {title}")


L, d, ff, H, KV, V = 32, 4096, 14_336, 32, 8, 128_000
hd = d // H

section("Llama 3 8B parameters, from Table 3")
attn = d * d + 2 * d * (KV * hd) + d * d  # q, k, v, o (no biases)
mlp = 3 * d * ff  # SwiGLU: gate, up, down
per_layer = attn + mlp + 2 * d
emb = V * d
total = L * per_layer + 2 * emb + d  # separate input and output matrices, final norm
print(f" head dim {hd}; attention {attn / 1e6:.1f}M, MLP {mlp / 1e6:.1f}M per layer")
print(f" layers {L * per_layer / 1e9:.2f}B, two embedding matrices {2 * emb / 1e9:.2f}B, total {total / 1e9:.2f}B")
print(f" with tied embeddings it would be {(total - emb) / 1e9:.2f}B")
assert hd == 128 and round(attn / 1e6, 1) == 41.9 and round(mlp / 1e6, 1) == 176.2 and round(total / 1e9, 2) == 8.03
print(f" share of each layer in the MLP: {mlp / per_layer:.0%}")
assert round(100 * mlp / per_layer) == 81

section("SwiGLU width that matches a 4d ReLU MLP")
print(f" 2 * d * 4d = 3 * d * f  ->  f = 8d/3 = {8 * d / 3:.0f}; Llama 3 uses {ff} = {ff / d}d")
assert round(8 * 4096 / 3) == 10923 and ff / d == 3.5

section("KV cache per token, BF16")
kv = lambda heads: 2 * L * heads * hd * 2
print(f" GQA, 8 KV heads: {kv(8):,} bytes = {kv(8) // 1024} KiB; full multi-head (32): {kv(32) // 1024} KiB")
assert kv(8) == 131_072 and kv(32) == 4 * kv(8)
for ctx, batch in ((8192, 1), (8192, 16)):
    print(f" {batch} x {ctx} tokens: GQA {kv(8) * ctx * batch / 2**30:.0f} GiB, MHA {kv(32) * ctx * batch / 2**30:.0f} GiB")
assert kv(8) * 8192 == 2**30 and kv(8) * 8192 * 16 == 16 * 2**30

section("RoPE: angle of the slowest-rotating pair")
for base in (10_000, 500_000):
    theta_min = base ** (-(hd - 2) / hd)
    print(f" base {base:,}: slowest pair turns {theta_min:.2e} rad per position; one full turn every {2 * math.pi / theta_min:,.0f} positions")
assert round(2 * math.pi / 10_000 ** (-(hd - 2) / hd)) == 54_410

section("relative position: rotation by 60 degrees per position")
for m, n in ((2, 5), (10, 13)):
    print(f" query at {m}, key at {n}: angle difference {(n - m) * 60} degrees, score cos = {math.cos(math.radians((n - m) * 60)):.0f}")

section("mixture of experts: active fraction")
print(f" DeepSeek-V3: 37B of 671B active = {37 / 671:.1%}")
print(f" toy: 8 experts of 1B, top-2 -> {2}B expert parameters active of {8}B")

section("activity: a 1B-class model")
L2, d2, ff2, H2, KV2, V2 = 16, 2048, 8192, 32, 8, 128_000
hd2 = d2 // H2
attn2 = 2 * d2 * d2 + 2 * d2 * KV2 * hd2
mlp2 = 3 * d2 * ff2
layers2 = L2 * (attn2 + mlp2)
print(f" head dim {hd2}; per layer attention {attn2 / 1e6:.1f}M, MLP {mlp2 / 1e6:.1f}M; layers {layers2 / 1e9:.2f}B; embedding {V2 * d2 / 1e6:.0f}M (tied)")
print(f" total {(layers2 + V2 * d2) / 1e9:.2f}B; KV cache per token {2 * L2 * KV2 * hd2 * 2 // 1024} KiB")
assert hd2 == 64 and round(attn2 / 1e6, 1) == 10.5 and round(mlp2 / 1e6, 1) == 50.3 and round(layers2 / 1e9, 2) == 0.97
assert round(V2 * d2 / 1e6) == 262 and 2 * L2 * KV2 * hd2 * 2 == 32 * 1024
