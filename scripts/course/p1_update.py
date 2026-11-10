"""Reproduces every number in src/content/blog/model-development-one-update.mdx.

Run: python3 scripts/course/p1_update.py   (needs torch; transformers optional)
Each section matches one small example in the post. Assertions fail loudly
if a hand calculation in the post disagrees with PyTorch.
"""
import math
import torch

DT = torch.float64


def section(title):
    print(f"\n== {title}")


# -- Targets: shift by one, ignore padding and the document boundary --------
section("batch: 7 targets")
rows = [["<bos>", "the", "cat", "<eos>", "<bos>", "cat"], ["<bos>", "cat", "sat", "<eos>", "<pad>", "<pad>"]]
doc = [[0, 0, 0, 0, 1, 1], [0, 0, 0, 0, -1, -1]]
targets = []
for r, row in enumerate(rows):
    t_row = []
    for t in range(len(row)):
        nxt = t + 1
        ok = nxt < len(row) and doc[r][nxt] == doc[r][t] and doc[r][t] >= 0
        t_row.append(row[nxt] if ok else None)
    targets.append(t_row)
    print(f" row {r}:", t_row)
N = sum(x is not None for row in targets for x in row)
assert N == 7
print(" N =", N)

# -- Attention: a position that predicts a target, causal vs document mask --
section("attention at row 0, position 4 (<bos> of B, predicts 'cat')")
values = [1, 2, 3, 4, 1]          # one number per position 0..4
causal = sum(values[:5]) / 5      # sees positions 0-4
document = values[4] / 1          # sees only position 4
print(f" causal mean = {causal}, document mean = {document}")
assert targets[0][4] == "cat" and causal == 2.2 and document == 1.0

# -- Cross-entropy for one position --------------------------------------------
section("cross-entropy")
uniform = torch.log_softmax(torch.zeros(4, dtype=DT), 0)
print(f" four equal logits: p = 0.25, loss = ln 4 = {-uniform[0]:.3f}")
z = torch.tensor([math.log(2), 0.0, 0.0], dtype=DT)
p = torch.softmax(z, 0)
assert torch.allclose(p, torch.tensor([0.5, 0.25, 0.25], dtype=DT))
print(f" logits (ln 2, 0, 0): p = {p.tolist()}, loss of token 0 = ln 2 = {-math.log(p[0]):.3f}")

# -- Token mean versus row mean, and accumulation -----------------------------
section("normalization")
a, b = [1.0, 1.0, 1.0], [3.0]
token_mean = (sum(a) + sum(b)) / (len(a) + len(b))
row_mean = (sum(a) / len(a) + sum(b) / len(b)) / 2
assert token_mean == 1.5 and row_mean == 2.0
print(f" token mean = {token_mean}, mean of row means = {row_mean}")
# Same thing with gradients: loss_i = w * c_i for a scalar w at 1, so d loss_i / dw = c_i.
w = torch.tensor(1.0, dtype=DT, requires_grad=True)
losses = [w * c for c in a + b]
whole = torch.autograd.grad(sum(losses) / 4, w)[0]
# Correct accumulation: each microbatch sum divided by the step's total count.
acc = sum(torch.autograd.grad(sum(w * c for c in mb) / 4, w)[0] for mb in (a, b))
# Divide afterwards: accumulate summed gradients, normalize once before clipping.
after = sum(torch.autograd.grad(sum(w * c for c in mb), w)[0] for mb in (a, b)) / 4
# Mean-then-divide: each microbatch averaged, then divided by 2 microbatches.
wrong = sum(torch.autograd.grad(sum(w * c for c in mb) / len(mb), w)[0] for mb in (a, b)) / 2
print(f" gradient: token mean {whole}, sum/N per microbatch {acc}, normalize after {after}, mean-then-divide {wrong}")
assert whole == acc == after == 1.5 and wrong == 2.0

# -- Ignored targets still pass gradient to inputs --------------------------------
section("ignored target, input still gets gradient")
x0 = torch.tensor(1.0, dtype=DT, requires_grad=True)
x1 = torch.tensor(3.0, dtype=DT)
h1 = (x0 + x1) / 2                  # position 1 attends to positions 0 and 1
loss_pos1 = (h1 - 0.0) ** 2         # stand-in loss at position 1; position 0 has no target
g = torch.autograd.grad(loss_pos1, x0)[0]
print(f" d(loss at position 1)/d x0 = {g}  (nonzero although position 0 is ignored)")
assert g == 2.0

# -- Backward: logits and an output matrix --------------------------------------
section("gradient with respect to logits and W")
y = 0
dz = (p - torch.nn.functional.one_hot(torch.tensor(y), 3).to(DT))
assert torch.allclose(dz, torch.tensor([-0.5, 0.25, 0.25], dtype=DT))
zz = z.clone().requires_grad_(True)
auto = torch.autograd.grad(-torch.log_softmax(zz, 0)[y], zz)[0]
assert torch.allclose(auto, dz)
print(" dL/dz =", dz.tolist(), "; divided by N = 4:", (dz / 4).tolist())
h = torch.tensor([1.0, 2.0], dtype=DT)
gW = torch.outer(h, dz / 4)
W = torch.zeros(2, 3, dtype=DT, requires_grad=True)
logits = h @ W + z                    # W = 0 keeps the logits at z
gW_auto = torch.autograd.grad(-torch.log_softmax(logits, 0)[y] / 4, W)[0]
assert torch.allclose(gW, gW_auto)
print(" dL/dW = h^T (p - e_y) / 4 =", gW.tolist())

# -- Clipping ---------------------------------------------------------------------
section("global-norm clipping")
P = torch.nn.Parameter(torch.zeros(2, dtype=DT)); P.grad = torch.tensor([3.0, 4.0], dtype=DT)
norm = torch.nn.utils.clip_grad_norm_([P], 1.0)
print(f" norm {float(norm)} -> clipped {P.grad.tolist()}")
assert float(norm) == 5.0 and torch.allclose(P.grad, torch.tensor([0.6, 0.8], dtype=DT), atol=1e-6)
for bad in (float("nan"), float("inf")):
    Q = torch.nn.Parameter(torch.zeros(2)); Q.grad = torch.tensor([bad, 1.0])
    n = torch.nn.utils.clip_grad_norm_([Q], 1.0)
    print(f" gradient with {bad}: norm {float(n)}, after clipping {Q.grad.tolist()}")

# -- AdamW on one scalar ---------------------------------------------------------
section("AdamW, one scalar: lr 0.1, betas (0.9, 0.99), eps 1e-8")


def adamw_steps(grads, wd=0.0, theta0=1.0):
    th = torch.nn.Parameter(torch.tensor([theta0], dtype=DT))
    opt = torch.optim.AdamW([th], lr=0.1, betas=(0.9, 0.99), eps=1e-8, weight_decay=wd)
    out = []
    for g in grads:
        th.grad = torch.tensor([g], dtype=DT)
        before = float(th)
        opt.step()
        out.append(before - float(th))
    return out, float(th)


for g in (0.2, 0.002):
    s, th = adamw_steps([g])
    print(f" first step with g = {g}: moves {s[0]:.4f}, theta = {th:.4f}")
    assert abs(s[0] - 0.1) < 1e-6
s_same, _ = adamw_steps([0.2, 0.2]); s_cur, _ = adamw_steps([0.2, 0.1]); s_both, _ = adamw_steps([0.1, 0.1])
print(f" second step: g = (0.2, 0.2) -> {s_same[1]:.4f}; only current halved (0.2, 0.1) -> {s_cur[1]:.4f}; both halved (0.1, 0.1) -> {s_both[1]:.4f}")
assert abs(s_same[1] - 0.1) < 1e-6 and abs(s_both[1] - 0.1) < 1e-6 and abs(s_cur[1] - 0.0933) < 1e-4
# Hand values for the halved-current case.
m = 0.9 * 0.02 + 0.1 * 0.1; v = 0.99 * 0.0004 + 0.01 * 0.01
mh, vh = m / (1 - 0.9 ** 2), v / (1 - 0.99 ** 2)
print(f"  hand: m = {m:.3f}, v = {v:.6f}, m_hat = {mh:.4f}, v_hat = {vh:.5f}, step = 0.1 * {mh / math.sqrt(vh):.4f}")
s, th = adamw_steps([0.2], wd=0.1)
print(f" with weight_decay 0.1: theta 1 -> 1 * (1 - 0.1 * 0.1) - 0.1 = {th:.4f}")
assert abs(th - 0.89) < 1e-6

# -- Empty step -----------------------------------------------------------------
section("a step with no targets")
empty = torch.tensor([], dtype=DT)
print(" mean over zero targets:", float(empty.sum() / empty.numel()) if empty.numel() else "undefined (0 / 0): skip the step")

# -- Hugging Face loss path -------------------------------------------------------
section("Hugging Face Transformers")
try:
    import transformers
    from transformers.loss.loss_utils import ForCausalLMLoss
    logits = torch.zeros(1, 3, 4)
    labels = torch.tensor([[1, 2, 3]])
    mean = ForCausalLMLoss(logits, labels, vocab_size=4)
    summed = ForCausalLMLoss(logits, labels, vocab_size=4, num_items_in_batch=2)
    print(f" transformers {transformers.__version__}: 3 labels -> 2 shifted targets; mean loss {float(mean):.3f} = ln 4; with num_items_in_batch=2 {float(summed):.3f}")
    assert abs(float(mean) - math.log(4)) < 1e-6 and abs(float(summed) - math.log(4)) < 1e-6
except ImportError:
    print(" transformers not installed; skipped")
