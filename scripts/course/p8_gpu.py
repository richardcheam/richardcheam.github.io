"""Reproduces the numbers in src/content/blog/model-development-gpu-memory-compute.mdx.

Run: python3 scripts/course/p8_gpu.py   (pure Python)
H100 figures as used in Stanford CS336 lecture 2 (from NVIDIA's datasheet):
989.5 TFLOP/s dense BF16 (1,979 with sparsity, halved), 3.35 TB/s, 80 GB.
Activation formula: Korthikanti et al. (2022), Eq. 1, for their GPT-style layer.
"""


def section(title):
    print(f"\n== {title}")


PEAK, BW, HBM = 1979e12 / 2, 3.35e12, 80e9

section("bytes per parameter for mixed-precision AdamW")
for name, parts in (("BF16 weights + grads, FP32 moments", (2, 2, 4, 4)), ("... plus FP32 master weights", (2, 2, 4, 4, 4))):
    print(f" {name}: {sum(parts)} bytes")
for N in (1.24e9, 7e9):
    print(f" N = {N / 1e9:g}B: 12 B/param -> {12 * N / 1e9:.1f} GB, 16 B/param -> {16 * N / 1e9:.1f} GB")
assert 16 * 7e9 == 112e9 and round(16 * 1.24e9 / 1e9, 1) == 19.8 and round(12 * 1.24e9 / 1e9, 1) == 14.9

section("activations of one GPT-style layer, BF16, no recomputation (Korthikanti Eq. 1)")
s, b, h, a = 4096, 1, 4096, 32
sbh = s * b * h
per_layer = sbh * 34 + 5 * a * s * s * b
print(f" sbh = {sbh / 1e6:.1f}M; 34 sbh = {34 * sbh / 1e9:.2f} GB; 5 a s^2 b = {5 * a * s * s * b / 1e9:.2f} GB; total {per_layer / 1e9:.2f} GB per layer, x32 = {32 * per_layer / 1e9:.0f} GB")
assert round(34 * sbh / 1e9, 2) == 0.57 and round(5 * a * s * s * b / 1e9, 2) == 2.68 and round(32 * per_layer / 1e9) == 104
print(f" at s = 1024: {(1024 * h * 34 + 5 * a * 1024 ** 2) / 1e9:.2f} GB per layer")

section("training time: 70B parameters, 15T tokens, 1,024 H100s at 50% MFU (CS336's example)")
C = 6 * 70e9 * 15e12
per_day = PEAK * 0.5 * 1024 * 86400
print(f" C = {C:.2e} FLOPs; {per_day:.2e} FLOPs/day; {C / per_day:.0f} days")
assert round(C / per_day) == 144

section("arithmetic intensity")
print(f" H100: {PEAK / BW:.0f} FLOPs per byte at the ridge")
n = 1024
mm = n * n * (2 * n - 1) / (3 * 2 * n * n)
mv = n * (2 * n - 1) / (2 * n + 2 * n * n + 2 * n)
relu = n / (2 * n + 2 * n)
print(f" n = {n}: matmul {mm:.0f}, matrix-vector {mv:.2f}, ReLU {relu:.2f} FLOPs per byte")
assert round(PEAK / BW) == 295 and round(mm) == 341 and round(mv, 2) == 1.0
t_mem, t_cmp = 2 * n * n / BW, n * (2 * n - 1) / PEAK
print(f" matrix-vector: memory {t_mem * 1e6:.2f} us vs compute {t_cmp * 1e9:.1f} ns")

section("activity: 1.24B model on a 24 GB GPU")
for bpp in (16, 12):
    print(f" {bpp} B/param: {bpp * 1.24:.1f} GB of state, {24 - bpp * 1.24:.1f} GB left for activations")
small = 1024 * 1 * 2048 * 34 + 5 * 32 * 1024 ** 2 * 1
print(f" one layer at s=1024, b=1, h=2048, a=32: {small / 1e6:.0f} MB; 16 layers {16 * small / 1e9:.2f} GB")
assert round(small / 1e6) == 239 and round(16 * small / 1e9, 2) == 3.83
