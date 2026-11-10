"""Reproduces every number in src/content/blog/model-development-pretraining-corpus.mdx.

Run: python3 scripts/course/p2_corpus.py
Pure Python. If datatrove 0.10.1 is importable, the toy documents are also run
through its real FineWebQualityFilter, MinHash shingling and PIIFormatter.
"""
import hashlib
import math
import random

TERMINAL = (".", "!", "?", '"', "'")  # the subset of datatrove's TERMINAL_PUNCTUATION the toy needs


def section(title):
    print(f"\n== {title}")


# -- Heuristic filters on one toy page -------------------------------------------
section("FineWeb quality filter on the flights page")
FLIGHTS = "\n".join([
    "Cheap flights Paris",
    "Cheap flights Rome",
    "Cheap flights Berlin",
    "Book now and save on every route this summer!",
    "Cheap flights Madrid",
])
lines = [l for l in FLIGHTS.split("\n") if l.strip()]
punct = sum(l.endswith(TERMINAL) for l in lines) / len(lines)
short = sum(len(l) <= 30 for l in lines) / len(lines)
words = len(FLIGHTS.split())
newline_ratio = FLIGHTS.count("\n") / words
print(f" lines ending in punctuation: {punct} (removed if < 0.12)")
print(f" lines of at most 30 characters: {short} (removed if > 0.67)")
print(f" newlines per word: {FLIGHTS.count(chr(10))}/{words} = {newline_ratio:.2f} (removed if > 0.3)")
assert punct == 0.2 and short == 0.8 and words == 21

# -- Shingles and Jaccard similarity -------------------------------------------------
section("Jaccard similarity of shingles")


def shingles(text, n):
    w = text.split()
    return {" ".join(w[i:i + n]) for i in range(len(w) - n + 1)}


def jaccard(a, b):
    return len(a & b) / len(a | b)


A, B = "the cat sat on the mat", "the cat sat on a mat"
for n in (2, 5):
    sa, sb = shingles(A, n), shingles(B, n)
    print(f" n = {n}: |A| = {len(sa)}, |B| = {len(sb)}, shared {len(sa & sb)}, union {len(sa | sb)}, J = {jaccard(sa, sb):.3f}")
assert jaccard(shingles(A, 2), shingles(B, 2)) == 3 / 7 and jaccard(shingles(A, 5), shingles(B, 5)) == 0

# A 100-word document with one word changed, 5-gram shingles (all words distinct).
doc = [f"w{i}" for i in range(100)]
edit1 = doc.copy(); edit1[50] = "CHANGED"
s0, s1 = shingles(" ".join(doc), 5), shingles(" ".join(edit1), 5)
print(f" 100 words, one changed: {len(s0)} shingles each, shared {len(s0 & s1)}, union {len(s0 | s1)}, J = {jaccard(s0, s1):.3f}")
assert (len(s0), len(s0 & s1), len(s0 | s1)) == (96, 91, 101)
edit2 = edit1.copy(); edit2[20] = "ALSO"
s2 = shingles(" ".join(edit2), 5)
J2 = jaccard(s0, s2)
print(f" two words changed far apart: shared {len(s0 & s2)}, union {len(s0 | s2)}, J = {J2:.3f}")
assert (len(s0 & s2), len(s0 | s2)) == (86, 106)

# -- MinHash: the minimum under a random order lands in both sets with probability J --
section("MinHash estimate")
rng = random.Random(0)
sa, sb = shingles(A, 2), shingles(B, 2)
union = sorted(sa | sb)
trials, agree = 100_000, 0
for _ in range(trials):
    order = union[:]; rng.shuffle(order)
    rank = {s: i for i, s in enumerate(order)}
    agree += min(sa, key=rank.get) == min(sb, key=rank.get)
print(f" random orders where both minima agree: {agree / trials:.3f} (J = 3/7 = {3 / 7:.3f})")
assert abs(agree / trials - 3 / 7) < 0.01
# With 112 hash functions the fraction of agreeing minhashes estimates J.
P = (1 << 61) - 1
params = [(rng.randrange(1, P), rng.randrange(0, P)) for _ in range(112)]
h = lambda s: int.from_bytes(hashlib.sha1(s.encode()).digest()[:8], "little") % P  # 64-bit shingle hash, as datatrove
sig = lambda S: [min((a * h(x) + b) % P for x in S) for a, b in params]
est = sum(x == y for x, y in zip(sig(s0), sig(s1))) / 112
print(f" 112 hashes on the 100-word pair: {est:.2f} agree (J = {jaccard(s0, s1):.2f})")

# -- Banding: 14 buckets of 8 hashes ------------------------------------------------
section("probability of being matched, 14 buckets x 8 hashes")


def p_match(s, r=8, b=14):
    return 1 - (1 - s ** r) ** b


s = 0.75
print(f" s = 0.75: one bucket {s ** 8:.3f}, no bucket {(1 - s ** 8) ** 14:.3f}, matched {p_match(s):.3f}")
assert round(p_match(0.75), 2) == 0.77
for s in (0.5, 0.7, 0.8, 0.85, 0.9, round(J2, 3)):
    print(f" s = {s}: {p_match(s):.4f}")
assert round(p_match(0.7), 2) == 0.56 and round(p_match(0.8), 2) == 0.92 and round(p_match(0.85), 3) == 0.988
print(f" steepest near (1/14)^(1/8) = {(1 / 14) ** (1 / 8):.2f}")

# -- Global versus per-snapshot deduplication, toy ----------------------------------
section("global versus per-snapshot dedup (illustrative)")
# Three snapshots of 10 pages: 6 stable good pages recrawled every time, and 4
# pages seen only once (1 good, 3 junk).
snaps = []
for y in ("2013", "2018", "2023"):
    snaps.append([("stable", f"g{i}", True) for i in range(6)] + [(y, f"{y}-g", True)] + [(y, f"{y}-j{i}", False) for i in range(3)])
seen, kept_global = set(), []
for snap in reversed(snaps):  # newest first, as in the paper
    keep = [p for p in snap if p[1] not in seen]
    seen |= {p[1] for p in snap}
    kept_global.append(keep)
oldest = kept_global[-1]
print(f" oldest snapshot keeps {len(oldest)} of 10 pages, {sum(p[2] for p in oldest)} good")
glob = [p for k in kept_global for p in k]
per = [p for s in snaps for p in s]
share = lambda ps: sum(p[2] for p in ps) / len(ps)
print(f" global: {len(glob)} pages, good share {share(glob):.0%};  per snapshot: {len(per)} pages, good share {share(per):.0%}")
assert len(oldest) == 4 and sum(p[2] for p in oldest) == 1 and share(glob) == 0.5 and share(per) == 0.7

# -- Contamination by word n-gram overlap --------------------------------------------
section("benchmark overlap, word 3-grams")
Q = "which gas do plants absorb from the air"
D1 = "students learn which gas do plants absorb from the air during photosynthesis"
D2 = "plants take in carbon dioxide from the air"
q3 = shingles(Q, 3)
for d in (D1, D2):
    hit = len(q3 & shingles(d, 3))
    print(f" {hit}/{len(q3)} of the question's 3-grams appear in: {d!r}")
assert len(q3) == 6 and len(q3 & shingles(D1, 3)) == 6 and len(q3 & shingles(D2, 3)) == 1

# -- Scale --------------------------------------------------------------------------
section("FineWeb token counts (paper)")
print(f" FineWeb-Edu keeps 1.3T of 15T tokens = {1.3 / 15:.1%}")

# -- Optional: the real datatrove code ------------------------------------------------
section("datatrove")
try:
    import importlib.metadata as md
    from datatrove.data import Document
    from datatrove.pipeline.filters import FineWebQualityFilter
    from datatrove.pipeline.formatters import PIIFormatter
    print(" datatrove", md.version("datatrove"))
    res = FineWebQualityFilter().filter(Document(text=FLIGHTS, id="0"))
    print(" FineWebQualityFilter on the flights page:", res)
    assert res == (False, "short_line_ratio")
    pii = PIIFormatter().format("Write to jane.doe@gmail.com or ping 8.8.8.8; my name is Jane Doe.")
    print(" PIIFormatter:", pii)
    # Language ID needs fastText's lid.176 model, which datatrove downloads on first use.
    from datatrove.pipeline.filters import LanguageFilter
    lid = LanguageFilter(languages=["en"])
    PAGES = {
        "english": "The temple was built in the twelfth century and is visited by thousands of people every year.",
        "mixed": "Angkor Wat ត្រូវបានសាងសង់នៅសតវត្សទីដប់ពីរ and is visited by thousands of people every year. ប្រាសាទនេះមានទំហំធំណាស់។",
        "khmer": "ប្រាសាទអង្គរវត្តត្រូវបានសាងសង់នៅសតវត្សទីដប់ពីរ ហើយមានភ្ញៀវទេសចររាប់ពាន់នាក់មកទស្សនារៀងរាល់ឆ្នាំ។",
    }
    for name, text in PAGES.items():
        d = Document(text=text, id=name)
        kept = lid.filter(d) is True
        print(f" LanguageFilter, {name}: {d.metadata['language']} {d.metadata['language_score']:.3f} -> {'kept' if kept else 'removed'}")
except ImportError as e:
    print(" datatrove not installed; skipped", e)
