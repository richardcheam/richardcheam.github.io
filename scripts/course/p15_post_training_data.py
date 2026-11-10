"""Reproduces src/content/blog/model-development-post-training-data.mdx.

Run: python3 scripts/course/p15_post_training_data.py   (pure Python)
Best-of-K rejection sampling with a verifier: which prompts survive, and the
8-gram decontamination rule from Tulu 3 applied to toy strings.
"""
import random


def section(title):
    print(f"\n== {title}")


section("probability that at least one of K samples passes a verifier")
for p in (0.5, 0.25, 0.02):
    for K in (1, 4, 16):
        print(f" p = {p}, K = {K}: {1 - (1 - p) ** K:.3f}")
assert round(1 - 0.75 ** 16, 3) == 0.990 and round(1 - 0.98 ** 16, 3) == 0.276

section("activity: 1,000 easy prompts (p=0.5) and 1,000 hard prompts (p=0.02), K = 16")
easy, hard = 1000 * (1 - 0.5 ** 16), 1000 * (1 - 0.98 ** 16)
print(f" kept: easy {easy:.0f}, hard {hard:.0f}; hard share of the kept set {hard / (easy + hard):.0%} (it was 50% of prompts)")
print(f" generations spent: {2000 * 16:,}")
assert round(easy) == 1000 and round(hard) == 276 and round(100 * hard / (easy + hard)) == 22

section("simulated check of the formula")
rng = random.Random(0)
kept = sum(any(rng.random() < 0.02 for _ in range(16)) for _ in range(100_000)) / 100_000
print(f" simulated pass-at-16 for p = 0.02: {kept:.3f}")
assert abs(kept - (1 - 0.98 ** 16)) < 0.01

section("Tulu 3 8-gram decontamination rule on toy strings")


def overlap(test, train, n=8):
    t, r = test.split(), train.split()
    grams = {tuple(r[i:i + n]) for i in range(len(r) - n + 1)}
    hit = [False] * len(t)
    for i in range(len(t) - n + 1):
        if tuple(t[i:i + n]) in grams:
            for j in range(i, i + n):
                hit[j] = True
    return sum(hit) / len(t)


test = "a farmer has 12 cows and buys 7 more how many cows does the farmer have now"
same_numbers_changed = "a farmer has 15 cows and buys 9 more how many cows does the farmer have now"
reworded = "after buying 7 more cows a farmer who had 12 now owns how many"
for name, train in (("numbers changed", same_numbers_changed), ("reworded", reworded)):
    f = overlap(test, train)
    print(f" {name}: {f:.0%} of test tokens in shared 8-grams -> {'contaminated' if f > 0.5 else 'not flagged'}")
assert overlap(test, same_numbers_changed) > 0.5 and overlap(test, reworded) == 0
