"""Reproduces the numbers in src/content/blog/model-development-scaling-laws.mdx.

Run: python3 scripts/course/p7_scaling.py   (pure Python)
The parametric law uses the Chinchilla paper's published Approach 3 fit
(E=1.69, A=406.4, B=410.7, alpha=0.34, beta=0.28; App. D.2), which a later
replication found biased; it is used here only to illustrate the shape.
"""
import math


def section(title):
    print(f"\n== {title}")


section("C = 6ND against Chinchilla Table 3")
for N, D, table in ((1e9, 20.2e9, 1.21e20), (10e9, 205.1e9, 1.23e22)):
    print(f" N={N:.0e}, D={D:.3g}: 6ND = {6 * N * D:.3g} (Table 3: {table:.3g})")
    assert abs(6 * N * D / table - 1) < 0.01

section("wall-clock at an assumed sustained 400 TFLOP/s per GPU")
C = 6 * 1e9 * 20e9
print(f" 1B x 20B tokens = {C:.2g} FLOPs -> {C / 4e14 / 3600:.0f} GPU-hours")
assert C == 1.2e20 and round(C / 4e14 / 3600) == 83

section("compute-optimal with D = 20N")
C = 1.2e21
N = math.sqrt(C / 120)
print(f" C = {C:.1e}: N = sqrt(C/120) = {N / 1e9:.2f}B, D = 20N = {20 * N / 1e9:.0f}B")
assert round(N / 1e9, 2) == 3.16 and round(20 * N / 1e9) == 63

section("illustrative losses from the published Approach 3 fit, same C = 1.2e21")
E, A, B, a, b = 1.69, 406.4, 410.7, 0.34, 0.28
loss = lambda N, D: E + A / N ** a + B / D ** b
options = {"10B on 20B": (10e9, 20e9), "3.2B on 63B": (3.16e9, 63.2e9), "1B on 200B": (1e9, 200e9)}
for name, (N, D) in options.items():
    print(f" {name}: 6ND = {6 * N * D:.2e}, predicted loss {loss(N, D):.3f}")
for N, D in options.values():
    assert abs(6 * N * D / 1.2e21 - 1) < 0.01
L = {k: round(loss(*v), 2) for k, v in options.items()}
assert L == {"10B on 20B": 2.39, "3.2B on 63B": 2.32, "1B on 200B": 2.33}, L
# Exact optimum of this fitted law at this budget.
G = (a * A / (b * B)) ** (1 / (a + b))
Nopt = G * (C / 6) ** (b / (a + b))
print(f" optimum of the fitted law: N = {Nopt / 1e9:.2f}B, D = {C / 6 / Nopt / 1e9:.0f}B ({C / 6 / Nopt / Nopt:.0f} tokens per parameter)")

section("inference: 2N FLOPs per generated token, 1e13 tokens served")
T = 1e13
for name, (N, D) in options.items():
    inf = 2 * N * T
    print(f" {name}: training {6 * N * D:.1e}, inference {inf:.1e}, total {6 * N * D + inf:.2e}")
assert 2 * 1e9 * 1e13 == 2e22 and 2 * 10e9 * 1e13 == 2e23

section("Llama 3 405B")
print(f" 15.6T / 405B = {15.6e12 / 405e9:.1f} tokens per parameter; 6ND for 402B x 16.55T = {6 * 402e9 * 16.55e12:.2e} (budget 3.8e25)")
assert round(15.6e12 / 405e9) == 39

section("try it")
print(f" 7B at 20 tokens/param: D = 140B, C = {6 * 7e9 * 140e9:.2e}")
assert 6 * 7e9 * 140e9 == 5.88e21
print(f" doubling C under D = 20N: N grows by sqrt(2) = {math.sqrt(2):.2f}")
assert 2 * 7e10 * 1e12 == 1.4e23 and abs(6 * 7e10 * 3e11 - 1.26e23) < 1e9
print(" 70B serving 1e12 tokens: 1.4e23; training on 300B tokens: 1.26e23")
