"""Reproduces src/content/blog/model-development-evaluating-applications.mdx.

Run: python3 scripts/course/p24_evaluating.py   (pure Python)
Bootstrap interval for an accuracy, a paired comparison of two systems on the
same items (exact sign test on the disagreements), and the sample size needed.
"""
import math
import random


def section(title):
    print(f"\n== {title}")


section("two systems on the same 200 items")
# A right on 170, B right on 160; they disagree on 30 items: A-only 20, B-only 10.
n, a_only, b_only, both = 200, 20, 10, 150
A = [1] * both + [1] * a_only + [0] * b_only + [0] * (n - both - a_only - b_only)
B = [1] * both + [0] * a_only + [1] * b_only + [0] * (n - both - a_only - b_only)
print(f" accuracy A {sum(A) / n:.2f}, B {sum(B) / n:.2f}")
rng = random.Random(0)
diffs, accs = [], []
for _ in range(10_000):
    idx = [rng.randrange(n) for _ in range(n)]
    accs.append(sum(A[i] for i in idx) / n)
    diffs.append(sum(A[i] - B[i] for i in idx) / n)
accs.sort(); diffs.sort()
print(f" bootstrap 95% interval for A's accuracy: {accs[250]:.3f} to {accs[9750]:.3f}")
print(f" bootstrap 95% interval for A - B (paired): {diffs[250]:+.3f} to {diffs[9750]:+.3f}")
d = a_only + b_only
p_two = 2 * sum(math.comb(d, k) for k in range(a_only, d + 1)) / 2 ** d
print(f" exact sign test on the {d} disagreements ({a_only} vs {b_only}): two-sided p = {p_two:.3f}")
assert round(p_two, 3) == 0.099 and diffs[250] <= 0 < diffs[9750]

section("if the same gap held with more data: 60 A-only and 30 B-only disagreements")
p_big = 2 * sum(math.comb(90, k) for k in range(60, 91)) / 2 ** 90
print(f" two-sided p = {p_big:.4f}")
assert p_big < 0.01

section("judge position bias: score both orders")
print(" a judge that prefers the first answer 65% of the time on equal pairs gives A 65% when A is shown first and 35% when second; averaging both orders recovers 50%")
