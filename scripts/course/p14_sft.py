"""Reproduces src/content/blog/model-development-supervised-fine-tuning.mdx.

Run: python3 scripts/course/p14_sft.py
Needs `transformers` and, the first time, network access for the tokenizer files
of allenai/Llama-3.1-Tulu-3-8B (no weights). Checks the rendered chat template,
assistant-only labels, and the per-token versus per-sequence weighting example.
"""


def section(title):
    print(f"\n== {title}")


section("chat template and assistant-only labels (Tulu 3 tokenizer)")
try:
    from transformers import AutoTokenizer
    tok = AutoTokenizer.from_pretrained("allenai/Llama-3.1-Tulu-3-8B")
    msgs = [{"role": "user", "content": "What is 2+3?"}, {"role": "assistant", "content": "2+3 = 5."}]
    text = tok.apply_chat_template(msgs, tokenize=False)
    ids = tok.apply_chat_template(msgs, tokenize=True)
    prefix = tok.apply_chat_template(msgs[:1], tokenize=True, add_generation_prompt=True)
    assert ids[:len(prefix)] == prefix  # the prompt is a prefix of the full conversation
    labels = [-100] * len(prefix) + ids[len(prefix):]
    trained = tok.decode([t for t, l in zip(ids, labels) if l != -100])
    print(" rendered:", repr(text))
    print(f" {len(ids)} tokens: {len(prefix)} masked, {len(ids) - len(prefix)} trained -> {trained!r}")
    assert text == "<|user|>\nWhat is 2+3?\n<|assistant|>\n2+3 = 5.<|end_of_text|>"
    assert trained == "2+3 = 5.<|end_of_text|>" and (len(ids), len(prefix)) == (25, 17)
except ImportError:
    print(" transformers not installed; skipped")

section("per-token versus per-sequence weighting of two conversations")
# Conversation A: response of 100 tokens with mean loss 1.0; B: response of 10 tokens with mean loss 2.0.
nA, lA, nB, lB = 100, 1.0, 10, 2.0
token_mean = (nA * lA + nB * lB) / (nA + nB)
seq_mean = (lA + lB) / 2
print(f" token mean {token_mean:.3f}; mean of sequence means {seq_mean:.2f}")
print(f" weight of one B token: per token 1/{nA + nB}, per sequence 1/{2 * nB}; ratio {(1 / (2 * nB)) / (1 / (nA + nB)):.1f}")
assert round(token_mean, 3) == 1.091 and seq_mean == 1.5 and round((1 / 20) / (1 / 110), 1) == 5.5

section("Tulu 3 SFT ablations quoted (Table 10, 8B)")
full = {"avg": 60.1, "AE2": 12.4, "GSM": 76.2, "MATH": 31.5, "Safety": 93.1}
for name, row in (("w/o WildChat", {"avg": 58.9, "AE2": 7.5}), ("w/o Safety", {"avg": 58.0, "Safety": 74.7}), ("w/o Math", {"avg": 58.2, "GSM": 64.1, "MATH": 23.5})):
    print(f" {name}: " + ", ".join(f"{k} {full[k]} -> {v}" for k, v in row.items()))
print(" seeds (Table 14): 59.9, 59.8, 59.8; best soup 60.2")

section("activity: trace the labels of a two-turn conversation")
turns = [("system", 10), ("user", 20), ("assistant", 30), ("user", 15), ("assistant", 40)]
# Assistant content plus its end-of-text token is trained; everything else, including role headers, is masked.
trained_all = sum(n + 1 for r, n in turns if r == "assistant")
trained_last = 40 + 1
print(f" all assistant turns: {trained_all} trained tokens; last turn only: {trained_last}")
assert trained_all == 72 and trained_last == 41
