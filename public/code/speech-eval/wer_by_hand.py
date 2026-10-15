"""WER and CER by hand: Levenshtein table, backtrace, and the effect of
normalisation and of the character unit. Standard library only; if jiwer is
installed, the hand-made numbers are checked against it."""
import random
import unicodedata


def edit_ops(ref, hyp):
    """Return (substitutions, deletions, insertions) of the cheapest alignment."""
    n, m = len(ref), len(hyp)
    D = [[i if j == 0 else j if i == 0 else 0 for j in range(m + 1)] for i in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            D[i][j] = min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (ref[i - 1] != hyp[j - 1]))
    s = d = ins = 0
    i, j = n, m
    while i or j:
        if i and j and D[i][j] == D[i - 1][j - 1] + (ref[i - 1] != hyp[j - 1]):
            s += ref[i - 1] != hyp[j - 1]
            i, j = i - 1, j - 1
        elif i and D[i][j] == D[i - 1][j] + 1:
            d, i = d + 1, i - 1
        else:
            ins, j = ins + 1, j - 1
    return s, d, ins


def wer(ref, hyp):
    r = ref.split()
    return sum(edit_ops(r, hyp.split())) / len(r)


def cer(ref, hyp):
    return sum(edit_ops(list(ref), list(hyp))) / len(ref)


print("a cat sat / the cat ->", edit_ops("a cat sat".split(), "the cat".split()), f"WER {wer('a cat sat', 'the cat'):.3f}")

# Normalisation: same ASR output, different scoring rules.
ref, hyp = "Dr. Smith paid $5.", "doctor smith paid five dollars"
steps = [
    ("raw", lambda t: t),
    ("+ abbreviations", lambda t: t.replace("Dr.", "Doctor")),
    ("+ numbers", lambda t: t.replace("$5", "five dollars")),
    ("+ lowercase", str.lower),
    ("+ punctuation", lambda t: "".join(ch for ch in t if ch not in ".,!?$")),
]
r = ref
for name, f in steps:
    r = f(r)
    print(f"{name:16s} {r!r:34s} WER {wer(r, hyp):.0%}")

# The character unit: one Khmer cluster with a subscript consonant (coeng).
word = "ក្រ"  # KA + COENG + RO: three code points, one written cluster
print("code points in", word, "=", len(word), [unicodedata.name(c) for c in word])
print("CER of dropping the subscript, per code point:", f"{cer(word, 'ក'):.2f}")

try:
    import jiwer

    random.seed(0)
    vocab = "the cat sat on a mat dog ran far".split()
    for _ in range(50):
        a = random.choices(vocab, k=random.randint(3, 8))
        b = [w for w in a if random.random() > 0.2]
        b = [random.choice(vocab) if random.random() < 0.2 else w for w in b] + random.choices(vocab, k=random.randint(0, 2))
        assert abs(wer(" ".join(a), " ".join(b)) - jiwer.wer(" ".join(a), " ".join(b))) < 1e-9
    print("50 random pairs: matches jiwer")
except ImportError:
    print("jiwer not installed: skipped the cross-check")
