"""Reproduces src/content/blog/model-development-prompting-context.mdx.

Run: python3 scripts/course/p20_prompting.py   (pure Python)
1. Constrained decoding on a toy vocabulary: masking disallowed tokens guarantees
   valid JSON for the schema {"name": string, "age": number}.
2. Majority voting (self-consistency) when one sample is right 50% of the time.
"""
import math
import random
from itertools import product


def section(title):
    print(f"\n== {title}")


section("constrained decoding")
VOCAB = ['{', '}', '"name"', '"age"', ':', ',', '"Ana"', '"Bo"', '30', '41', 'Sure!', '<end>']
# A tiny finite-state machine for: { "name" : STRING , "age" : NUMBER }
FSM = {0: {'{': 1}, 1: {'"name"': 2}, 2: {':': 3}, 3: {'"Ana"': 4, '"Bo"': 4}, 4: {',': 5},
       5: {'"age"': 6}, 6: {':': 7}, 7: {'30': 8, '41': 8}, 8: {'}': 9}, 9: {'<end>': None}}
rng = random.Random(0)


def model_logits(prefix):
    # A stand-in "model" that is chatty: it likes 'Sure!' and otherwise picks at random.
    return {t: (2.0 if t == 'Sure!' else rng.gauss(0, 1)) for t in VOCAB}


def sample(constrained):
    state, out = 0, []
    for _ in range(12):
        logits = model_logits(out)
        if constrained:
            logits = {t: (v if t in FSM[state] else -math.inf) for t, v in logits.items()}
        z = max(logits.values())
        probs = {t: math.exp(v - z) for t, v in logits.items()}
        r, acc = rng.random() * sum(probs.values()), 0.0
        for t, p in probs.items():
            acc += p
            if acc >= r:
                break
        if t == '<end>':
            break
        out.append(t)
        state = FSM.get(state, {}).get(t, -1) if state != -1 else -1
        if state == -1 and constrained:
            raise AssertionError("constrained decoding left the grammar")
    return out, state == 9


free = [sample(False) for _ in range(1000)]
cons = [sample(True) for _ in range(1000)]
print(f" unconstrained: {sum(v for _, v in free) / 10:.1f}% valid; example {' '.join(free[0][0][:6])} ...")
print(f" constrained:   {sum(v for _, v in cons) / 10:.1f}% valid; example {' '.join(cons[0][0])}")
assert all(v for _, v in cons) and sum(v for _, v in free) == 0

section("majority vote of k samples; each is right with p = 0.5, wrong answers split over 3 alternatives")
def majority_accuracy(p, k):
    q = (1 - p) / 3  # each wrong answer
    total = 0.0
    for outcome in product(range(4), repeat=k):  # 0 = correct, 1..3 = wrong answers
        prob = math.prod(p if o == 0 else q for o in outcome)
        counts = [outcome.count(a) for a in range(4)]
        best = max(counts)
        winners = [a for a in range(4) if counts[a] == best]
        total += prob * (1 / len(winners) if 0 in winners else 0)
    return total
for k in (1, 3, 5):
    print(f" k = {k}: {majority_accuracy(0.5, k):.3f}")
assert round(majority_accuracy(0.5, 1), 3) == 0.5 and round(majority_accuracy(0.5, 3), 3) == 0.583 and round(majority_accuracy(0.5, 5), 3) == 0.674

section("context budget activity")
ctx, sys_p, q, out = 8192, 600, 200, 800
docs = (ctx - sys_p - q - out) // 450
print(f" {ctx} tokens - {sys_p} system - {q} question - {out} reserved for the answer = {ctx - sys_p - q - out} for documents: {docs} chunks of 450 tokens")
assert docs == 14
