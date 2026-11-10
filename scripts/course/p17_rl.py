"""Reproduces src/content/blog/model-development-reinforcement-learning.mdx.

Run: python3 scripts/course/p17_rl.py   (torch, CPU)
Policy gradients on a four-answer toy, baselines and variance, GRPO advantages,
PPO clipping, and a short GRPO run with a KL penalty.
"""
import math
import statistics

import torch
import torch.nn.functional as F


def section(title):
    print(f"\n== {title}")


section("policy gradient on a four-answer toy: answer 2 earns reward 1")
pi = torch.tensor([0.4, 0.3, 0.2, 0.1])
R = torch.tensor([0.0, 0.0, 1.0, 0.0])
# Exact gradient of E[R] with respect to the logits: sum_y pi(y) R(y) (e_y - pi)
exact = sum(pi[y] * R[y] * (F.one_hot(torch.tensor(y), 4).float() - pi) for y in range(4))
print(f" exact gradient {[round(x, 3) for x in exact.tolist()]}  (expected reward {float((pi * R).sum()):.2f})")
assert torch.allclose(exact, torch.tensor([-0.08, -0.06, 0.16, -0.02]))
g = torch.Generator().manual_seed(0)
samples = torch.multinomial(pi, 200_000, replacement=True, generator=g)
est = torch.stack([R[y] * (F.one_hot(y, 4).float() - pi) for y in samples[:20_000]]).mean(0)
print(f" estimate from 20,000 samples {[round(x, 3) for x in est.tolist()]}")
assert torch.allclose(est, exact, atol=0.01)

section("variance of a one-sample estimate of the gradient for answer 2, with and without a baseline")
def per_sample(y, b):
    return float((R[y] - b) * ((y == 2).float() - pi[2]))
for b in (0.0, 0.2):
    vals = [per_sample(y, b) for y in samples[:20_000]]
    print(f" baseline {b}: mean {statistics.mean(vals):.3f}, variance {statistics.pvariance(vals):.4f}")
v0 = statistics.pvariance([per_sample(y, 0.0) for y in samples[:20_000]])
v1 = statistics.pvariance([per_sample(y, 0.2) for y in samples[:20_000]])
assert v1 < v0

section("GRPO advantages: (r - mean) / std within a group of 4")
for rewards in ([1, 0, 0, 1], [1, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1]):
    m, s = statistics.mean(rewards), statistics.pstdev(rewards)
    adv = [round((r - m) / s, 2) if s > 0 else 0.0 for r in rewards]
    print(f" rewards {rewards}: advantages {adv}")
assert [round((r - 0.25) / statistics.pstdev([1, 0, 0, 0]), 2) for r in (1, 0)] == [1.73, -0.58]

section("PPO clipping, epsilon = 0.2: objective min(ratio*A, clip(ratio)*A)")
for ratio, A in ((1.5, 1.0), (1.1, 1.0), (0.5, -1.0), (1.5, -1.0)):
    val = min(ratio * A, max(min(ratio, 1.2), 0.8) * A)
    print(f" ratio {ratio}, advantage {A:+}: {val:+.2f}")
assert min(1.5 * 1, 1.2 * 1) == 1.2 and min(0.5 * -1, 0.8 * -1) == -0.8 and min(1.5 * -1, 1.2 * -1) == -1.5

section("a short GRPO run on the toy, with and without a KL penalty to the starting policy")
def run(beta, steps=60, G=8, lr=0.5):
    logits = torch.log(pi).clone().requires_grad_(True)
    ref = torch.log(pi)
    gen = torch.Generator().manual_seed(1)
    for _ in range(steps):
        p = F.softmax(logits, 0)
        ys = torch.multinomial(p.detach(), G, replacement=True, generator=gen)
        r = R[ys]
        s = r.std(unbiased=False)
        adv = (r - r.mean()) / s if s > 0 else torch.zeros(G)
        logp = F.log_softmax(logits, 0)
        kl = (p * (logp - ref)).sum()
        loss = -(adv * logp[ys]).mean() + beta * kl
        logits.grad = None; loss.backward()
        with torch.no_grad():
            logits -= lr * logits.grad
    p = F.softmax(logits, 0)
    return p[2].item(), float((p * (torch.log(p) - ref)).sum())
for beta in (0.0, 0.5):
    p2, kl = run(beta)
    print(f" beta {beta}: P(correct) 0.20 -> {p2:.2f}, KL to start {kl:.2f}")
a, b = run(0.0), run(0.5)
assert a[0] > b[0] > 0.2 and a[1] > b[1]

section("activity: groups of 8 for prompts the model solves 0%, 50%, 95% of the time")
for p in (0.0, 0.5, 0.95):
    print(f" p = {p}: chance a group of 8 has mixed rewards (non-zero signal) = {1 - p ** 8 - (1 - p) ** 8:.3f}")
assert round(1 - 0.95 ** 8 - 0.05 ** 8, 3) == 0.337
