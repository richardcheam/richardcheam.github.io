"""Reproduces src/content/blog/model-development-post-training-failures.mdx.

Run: python3 scripts/course/p18_failures.py   (pure Python)
A simulation of reward-model overoptimization by best-of-n selection when the
proxy reward likes length and the true reward does not (illustrative, in the
spirit of Gao et al. 2022), plus the Tulu 3 development-versus-unseen numbers.
"""
import random
import statistics


def section(title):
    print(f"\n== {title}")


section("best-of-n against a length-biased proxy (simulation)")
# Each response has quality q ~ N(0, 1) and length l ~ N(0, 1) (standardized).
# True reward: q - 0.5 * l**2 (readers increasingly dislike long padding). Proxy reward: q + 2 * l (the judge likes length).
rng = random.Random(0)
TRIALS = 4000
rows = []
for n in (1, 2, 4, 16, 64, 256):
    true, length, proxy = [], [], []
    for _ in range(TRIALS):
        cands = [(rng.gauss(0, 1), rng.gauss(0, 1)) for _ in range(n)]
        q, l = max(cands, key=lambda c: c[0] + 2 * c[1])
        true.append(q - 0.5 * l * l); length.append(l); proxy.append(q + 2 * l)
    rows.append((n, statistics.mean(proxy), statistics.mean(true), statistics.mean(length)))
    print(f" best of {n:>3}: proxy {rows[-1][1]:+.2f}, true {rows[-1][2]:+.2f}, length {rows[-1][3]:+.2f}")
peak = max(rows, key=lambda r: r[2])
print(f" true reward peaks at n = {peak[0]} ({peak[2]:+.2f}) and falls after; proxy keeps rising")
assert rows[-1][1] > rows[0][1] and rows[-1][2] < peak[2] and rows[-1][3] > 1.0

section("Tulu 3 SFT ablation, development versus unseen instruction following (Table 32)")
print(" IFEval (development): with persona data 72.8, without 53.6")
print(" IFEval-OOD (unseen): with persona data 17.6, without 18.0")

section("activity: the unit-test reward")
tests_visible = 3
print(f" a reward of 1 when the {tests_visible} visible tests pass can be earned by special-casing those inputs")
