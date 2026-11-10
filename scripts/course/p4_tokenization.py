"""Reproduces the numbers in src/content/blog/model-development-tokenization.mdx.

Run: FLORES_DIR=/path/to/flores200_dataset python3 scripts/course/p4_tokenization.py
Needs `transformers` and network access the first time (tokenizer files only,
no model weights): openai-community/gpt2, FacebookAI/xlm-roberta-base,
Qwen/Qwen2.5-0.5B. FLORES-200: https://dl.fbaipublicfiles.com/nllb/flores200_dataset.tar.gz
Without FLORES_DIR only the arithmetic sections run.
"""
import os


def section(title):
    print(f"\n== {title}")


# -- Arithmetic used in the post -------------------------------------------------------
section("vocabulary size and parameters")
d = 4096
for V in (32_000, 128_000):
    print(f" V = {V:,}, d = {d}: one embedding matrix = {V * d / 1e6:.0f}M parameters")
assert round(32_000 * 4096 / 1e6) == 131 and round(128_000 * 4096 / 1e6) == 524

section("Qwen2.5-0.5B: share of parameters in the (tied) embedding, from its config.json")
V, d, L, ff, h, kv = 151_936, 896, 24, 4864, 14, 2
hd = d // h
attn = d * d + 2 * d * (kv * hd) + d * d + (d + 2 * kv * hd)  # q, k, v, o weights + q/k/v biases
mlp = 3 * d * ff
layer = attn + mlp + 2 * d  # two RMSNorm weights
total = V * d + L * layer + d
print(f" embedding {V * d / 1e6:.1f}M, layers {L * layer / 1e6:.1f}M, total {total / 1e6:.1f}M, embedding share {V * d / total:.0%}")
assert round(V * d / 1e6) == 136 and round(total / 1e6) == 494 and round(100 * V * d / total) == 28

section("context capacity: FLORES sentences in an 8,192-token window (counts measured below)")
for name, tokens in (("English, GPT-2", 27_044), ("Khmer, GPT-2", 410_586), ("Khmer, Qwen2.5", 178_697)):
    per = tokens / 1012
    print(f" {name}: {per:.1f} tokens per sentence -> {8192 / per:.0f} sentences")
assert [round(8192 / (t / 1012)) for t in (27_044, 410_586, 178_697)] == [307, 20, 46]

section("unigram segmentation of 'unhappy'")
P = {"un": 0.1, "happy": 0.05, "unh": 0.01, "appy": 0.02}
best = max([("un", "happy"), ("unh", "appy")], key=lambda seg: P[seg[0]] * P[seg[1]])
print(" un+happy", P["un"] * P["happy"], " unh+appy", P["unh"] * P["appy"], "->", best)
assert best == ("un", "happy") and abs(P["un"] * P["happy"] - 0.005) < 1e-15 and abs(P["unh"] * P["appy"] - 0.0002) < 1e-15

section("try it")
assert 0.2 * 0.2 < 0.05 and 64_000 * 2048 == 131_072_000
print(" a+b", 0.2 * 0.2, "< ab 0.05; 64,000 x 2,048 =", f"{64_000 * 2048:,}")

# -- Measured on FLORES-200 devtest ------------------------------------------------------
section("FLORES-200 devtest: tokens for the same 1,012 sentences")
root = os.environ.get("FLORES_DIR")
if not root:
    print(" FLORES_DIR not set; skipped")
else:
    from transformers import AutoTokenizer
    import transformers
    print(" transformers", transformers.__version__)
    langs = ["eng_Latn", "fra_Latn", "zho_Hans", "hin_Deva", "khm_Khmr"]
    text = {l: open(os.path.join(root, "devtest", f"{l}.devtest"), encoding="utf-8").read().splitlines() for l in langs}
    assert all(len(v) == 1012 for v in text.values())
    for name in ("openai-community/gpt2", "FacebookAI/xlm-roberta-base", "Qwen/Qwen2.5-0.5B"):
        tok = AutoTokenizer.from_pretrained(name)
        counts = {}
        for l, lines in text.items():
            ids = [tok.encode(s, add_special_tokens=False) for s in lines]
            n = sum(map(len, ids))
            nbytes = sum(len(s.encode("utf-8")) for s in lines)
            counts[l] = n
            rt = all(tok.decode(i) == s for i, s in zip(ids[:50], lines[:50]))
            if name.endswith("gpt2") and l == "khm_Khmr":
                print(f"   Khmer devtest is {nbytes:,} UTF-8 bytes")
            print(f" {name.split('/')[-1]:>17} {l}: {n:>7,} tokens, {nbytes / n:4.2f} bytes/token, {sum(map(len, lines)) / n:4.2f} chars/token, round-trip {rt}")
        print("   premium vs English:", {l: round(c / counts['eng_Latn'], 2) for l, c in counts.items()}, f"vocab {len(tok):,}")
