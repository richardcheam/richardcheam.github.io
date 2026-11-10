"""Reproduces src/content/blog/model-development-choosing-a-model.mdx.

Run: python3 scripts/course/p19_choosing.py   (pure Python; prices are illustrative)
"""
import math


def section(title):
    print(f"\n== {title}")


section("cost per 1,000 requests (illustrative prices per million tokens)")
tin, tout = 1500, 300
models = {"large": (3.00, 15.00, 0.92), "small": (0.15, 0.60, 0.85)}
cost = {}
for name, (pin, pout, acc) in models.items():
    per_req = tin * pin / 1e6 + tout * pout / 1e6
    errors = 1000 * (1 - acc)
    review = errors * 0.50
    cost[name] = (1000 * per_req, errors, review)
    print(f" {name}: ${1000 * per_req:.2f} in tokens, {errors:.0f} errors, ${review:.0f} to review errors at $0.50 each, total ${1000 * per_req + review:.2f}")
assert round(cost["large"][0], 2) == 9.00 and round(cost["small"][0], 3) == 0.405
assert round(cost["large"][0] + cost["large"][2], 2) == 49.0 and round(cost["small"][0] + cost["small"][2], 2) == 75.41

section("uncertainty of an accuracy measured on n examples")
for p in (0.92, 0.85):
    for n in (100, 1000):
        se = math.sqrt(p * (1 - p) / n)
        print(f" p = {p}, n = {n}: standard error {se:.3f}, 95% interval about +/- {1.96 * se:.3f}")
assert round(1.96 * math.sqrt(0.92 * 0.08 / 100), 3) == 0.053 and round(1.96 * math.sqrt(0.85 * 0.15 / 100), 3) == 0.070

section("same text, different languages (premiums measured in the tokenization post)")
for lang, prem in (("English", 1.0), ("Khmer, Qwen2.5 tokenizer", 6.47)):
    print(f" {lang}: {1500 * prem:,.0f} input tokens for the same request")
