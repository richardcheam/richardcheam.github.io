"""Reproduces src/content/blog/model-development-base-checkpoint.mdx.

Run: python3 scripts/course/p13b_checkpoint.py   (pure Python; the checkpoint losses are illustrative)
"""


def section(title):
    print(f"\n== {title}")


# Illustrative per-token validation loss (nats) for two checkpoints, by domain, and each
# domain's share of the validation tokens.
share = {"web": 0.80, "code": 0.15, "khmer": 0.05}
ckpt_a = {"web": 2.40, "code": 1.90, "khmer": 2.20}
ckpt_b = {"web": 2.35, "code": 1.88, "khmer": 2.40}

section("aggregate validation loss hides a slice that gets worse")
agg = {name: sum(share[d] * c[d] for d in share) for name, c in (("A", ckpt_a), ("B", ckpt_b))}
for d in share:
    print(f" {d:5s} ({share[d]:.0%} of tokens): A {ckpt_a[d]:.2f} -> B {ckpt_b[d]:.2f} ({ckpt_b[d] - ckpt_a[d]:+.2f})")
print(f" aggregate: A {agg['A']:.3f} -> B {agg['B']:.3f} ({agg['B'] - agg['A']:+.3f})")
assert round(agg["A"], 3) == 2.315 and round(agg["B"], 3) == 2.282
contrib = {d: share[d] * (ckpt_b[d] - ckpt_a[d]) for d in share}
print(" contribution to the aggregate change: " + ", ".join(f"{d} {v:+.4f}" for d, v in contrib.items()))
assert round(contrib["khmer"], 3) == 0.010 and round(contrib["web"], 3) == -0.040

section("log-likelihood multiple choice: which option does the model prefer?")
# Summed log-probabilities of three answer options to one question (illustrative).
options = {"A": {"correct": -4.1, "d1": -3.6, "d2": -5.0}, "B": {"correct": -3.5, "d1": -3.7, "d2": -5.2}}
for name, lp in options.items():
    best = max(lp, key=lp.get)
    print(f" checkpoint {name}: highest log-probability option = {best}; margin of correct over best distractor {lp['correct'] - max(lp['d1'], lp['d2']):+.1f}")
assert max(options["A"], key=options["A"].get) == "d1" and max(options["B"], key=options["B"].get) == "correct"

section("bits per byte, to compare across tokenizers")
nll_nats, n_bytes = 30.0, 54  # summed NLL of an answer, and its UTF-8 length
import math
bpb = nll_nats / math.log(2) / n_bytes
print(f" {nll_nats} nats over {n_bytes} bytes = {bpb:.3f} bits per byte")
assert round(bpb, 3) == 0.801

section("try it: a second pair of checkpoints")
c, d = {"web": 2.30, "code": 1.85, "khmer": 2.10}, {"web": 2.28, "code": 1.86, "khmer": 2.05}
change = sum(share[k] * (d[k] - c[k]) for k in share)
print(f" aggregate change {change:+.4f}")
assert round(change, 4) == -0.0170
