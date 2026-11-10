"""Reproduces src/content/blog/model-development-retrieval-tools.mdx.

Run: python3 scripts/course/p21_retrieval.py   (pure Python)
BM25 over a tiny corpus with recall@k, a vocabulary-mismatch failure, and the
reliability of multi-step agent loops.
"""
import math
import re
from collections import Counter


def section(title):
    print(f"\n== {title}")


DOCS = {
    "refund": "Refunds are issued within 14 days of the return arriving at our warehouse.",
    "shipping": "Standard shipping takes 3 to 5 business days; express shipping takes 1 day.",
    "warranty": "Every device has a 2 year warranty covering manufacturing defects.",
    "battery": "Battery replacement is free during the warranty period.",
    "account": "You can reset your password from the account settings page.",
    "invoice": "Invoices are emailed after each order and can be downloaded from the account page.",
}
STEM = False
def tok(s):
    words = re.findall(r"[a-z0-9]+", s.lower())
    return [w[:-1] if STEM and len(w) > 3 and w.endswith("s") else w for w in words]


def index():
    global D, N, avgdl, df
    D = {k: tok(v) for k, v in DOCS.items()}
    N, avgdl = len(D), sum(map(len, D.values())) / len(D)
    df = Counter(w for d in D.values() for w in set(d))


def bm25(query, k1=1.5, b=0.75):
    scores = {}
    for name, d in D.items():
        tf = Counter(d)
        s = 0.0
        for w in tok(query):
            if w not in tf:
                continue
            idf = math.log(1 + (N - df[w] + 0.5) / (df[w] + 0.5))
            s += idf * tf[w] * (k1 + 1) / (tf[w] + k1 * (1 - b + b * len(d) / avgdl))
        scores[name] = s
    retrieved = [n for n in sorted(scores, key=scores.get, reverse=True) if scores[n] > 0]
    return retrieved, scores


QUERIES = {
    "how long until I get my refund": "refund",       # the document says "Refunds"
    "is battery replacement covered": "battery",
    "how fast is express shipping": "shipping",
    "when will my money come back": "refund",          # no shared words with the refund document
}
results = {}
for stem in (False, True):
    STEM = stem
    index()
    section(f"BM25 {'with' if stem else 'without'} a crude plural stemmer")
    hits = {1: 0, 3: 0}
    for q, gold in QUERIES.items():
        ranking, scores = bm25(q)
        print(f" {q!r}: retrieved {ranking[:3]} (gold {gold}, score {scores[gold]:.2f})")
        for k in hits:
            hits[k] += gold in ranking[:k]
    print(" " + ", ".join(f"recall@{k} = {v}/{len(QUERIES)}" for k, v in hits.items()))
    results[stem] = hits[1]
assert results == {False: 2, True: 3}

section("reliability of a multi-step loop")
for p in (0.99, 0.95, 0.90):
    for n in (1, 5, 10, 20):
        print(f" each step {p:.0%}, {n:>2} steps: {p ** n:.3f}")
print(f" activity: 8 steps at 95% = {0.95 ** 8:.3f}; with one verified retry per step ({1 - 0.05 ** 2:.4f} each) = {(1 - 0.05 ** 2) ** 8:.3f}")
assert round(0.95 ** 8, 3) == 0.663 and round((1 - 0.05 ** 2) ** 8, 3) == 0.980
