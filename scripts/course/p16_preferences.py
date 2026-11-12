"""Reproduces src/content/blog/model-development-preference-optimization.mdx.

Run: python3 scripts/course/p16_preferences.py   (torch, CPU)
Bradley-Terry, the KL-regularized optimal policy, and DPO on a three-response toy.
"""
import math

import torch
import torch.nn.functional as F

sig = lambda x: 1 / (1 + math.exp(-x))


def section(title):
    print(f"\n== {title}")


section("Bradley-Terry")
print(f" reward gap 1 -> P(A preferred) = sigma(1) = {sig(1):.3f}; gap 0 -> {sig(0)}; gap 3 -> {sig(3):.3f}")
print(f" A preferred 3 times out of 4 -> gap = ln(3) = {math.log(3):.2f}")
assert round(sig(1), 3) == 0.731 and round(math.log(3), 2) == 1.10

section("KL-regularized optimum: pi* proportional to pi_ref * exp(r / beta)")
ref = torch.tensor([0.5, 0.3, 0.2]); r = torch.tensor([0.0, 1.0, 2.0])
for beta in (0.5, 1.0, 2.0, 100.0):
    pi = ref * torch.exp(r / beta); pi = pi / pi.sum()
    print(f" beta = {beta}: pi* = {[round(x, 3) for x in pi.tolist()]}")
pi1 = ref * torch.exp(r); pi1 = pi1 / pi1.sum()
assert [round(x, 3) for x in pi1.tolist()] == [0.179, 0.292, 0.529]
# The reward is recoverable from the policy up to a constant: r = beta log(pi*/pi_ref) + beta log Z.
rec = torch.log(pi1 / ref)
print(f" log(pi*/pi_ref) = {[round(x, 3) for x in rec.tolist()]}: rewards 0, 1, 2 shifted by -log Z = {rec[0].item():.3f}")
assert torch.allclose(rec - rec[0], r)

section("DPO on a three-response policy (prefer response 2 over response 0), beta = 0.1")
beta = 0.1
logits = torch.log(ref).clone().requires_grad_(True)
logp_ref = torch.log(ref)
w, l = 2, 0
opt = torch.optim.SGD([logits], lr=1.0)
for step in range(4):
    logp = F.log_softmax(logits, 0)
    margin = beta * ((logp[w] - logp_ref[w]) - (logp[l] - logp_ref[l]))
    loss = -F.logsigmoid(margin)
    opt.zero_grad(); loss.backward()
    if step == 0:
        g = logits.grad.clone()
        # analytic: dL/dlogits = -beta * sigma(-margin) * (onehot(w) - onehot(l))  (softmax terms cancel for the difference)
        analytic = -beta * torch.sigmoid(-margin.detach()) * (F.one_hot(torch.tensor(w), 3) - F.one_hot(torch.tensor(l), 3)).float()
        print(f" step 0: loss {loss.item():.4f} (= ln 2), gradient {[round(x, 4) for x in g.tolist()]}, analytic {[round(x, 4) for x in analytic.tolist()]}")
        assert torch.allclose(g, analytic, atol=1e-6) and abs(loss.item() - math.log(2)) < 1e-6
    opt.step()
p = F.softmax(logits, 0).tolist()
print(f" after 4 steps: probabilities {[round(x, 3) for x in p]} (start {ref.tolist()})")
assert p[2] > 0.2 and p[0] < 0.5 and abs(p[1] - 0.3) < 0.02

section("activity: DPO loss for given log-ratios")
for cw, cl in ((0.0, 0.0), (0.2, -0.1), (-0.5, -1.5)):
    m = 0.1 * (cw - cl)
    print(f" log ratio chosen {cw:+}, rejected {cl:+}: margin {m:.2f}, loss {-math.log(sig(m)):.3f}")
assert round(-math.log(sig(0.03)), 3) == 0.678 and round(-math.log(sig(0.1)), 3) == 0.644

section("length normalization: summed log-probabilities scale with length")
print(" a 100-token answer at -0.5 per token: -50; a 20-token answer at -1.0 per token: -20")
print(" per token: -0.5 vs -1.0, so the longer answer is more likely per token though less likely in total")

section("agreement between noisy annotators is not a ceiling")
acc = 0.8
print(f" two independent annotators, each right {acc:.0%}: agree {acc ** 2 + (1 - acc) ** 2:.0%}; an oracle agrees with each {acc:.0%}")
assert round(acc ** 2 + (1 - acc) ** 2, 2) == 0.68
