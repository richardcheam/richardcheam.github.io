"""Course lesson P1: one causal-LM training example traced to an optimizer update.

Every number quoted in src/content/blog/model-development-one-update.mdx comes
from this script. Run:  python3 scripts/course/p1_update.py
Checked with torch 2.6.0 and transformers 4.51.3 (both optional checks are
skipped if a package is missing).

The toy model is small enough to follow by hand:
  vocabulary  <pad>=0 <bos>=1 the=2 cat=3 sat=4 <eos>=5   (V = 6)
  embedding   E: V x 2   (frozen in this example)
  mixing      c_t = mean of E[x_s] over the positions s that t may attend to
  hidden      h_t = E[x_t] + c_t
  logits      z_t = h_t W,  W: 2 x V  (the only trained parameter here)
The mixing step has no parameters; it exists so the attention mask matters.
"""
import math
import torch

torch.set_printoptions(precision=4, sci_mode=False)
DT = torch.float64
PAD, BOS, THE, CAT, SAT, EOS = range(6)
NAMES = ["<pad>", "<bos>", "the", "cat", "sat", "<eos>"]
V, D = 6, 2

E = torch.tensor([[0.0, 0.0], [0.5, -0.5], [1.0, 0.0], [0.0, 1.0], [-1.0, 0.5], [0.5, 0.5]], dtype=DT)
W0 = torch.tensor([[0.2, -0.1, 0.4, 0.0, -0.3, 0.1], [0.0, 0.3, -0.2, 0.5, 0.1, -0.4]], dtype=DT)

# Row 0 packs two documents; row 1 is one document padded at the end.
input_ids = torch.tensor([
    [BOS, THE, CAT, EOS, BOS, CAT],
    [BOS, CAT, SAT, EOS, PAD, PAD],
])
doc_ids = torch.tensor([[0, 0, 0, 0, 1, 1], [0, 0, 0, 0, -1, -1]])  # -1: padding
B, T = input_ids.shape

# Labels: a copy of the inputs with padding ignored (-100). The shift to
# next-token targets happens inside the loss, as in Hugging Face.
labels = input_ids.clone()
labels[input_ids == PAD] = -100
# Do not ask a document's last token to predict the next document's <bos>.
# (Implementation-dependent: many pipelines keep this target.)
boundary = torch.zeros_like(labels, dtype=torch.bool)
boundary[:, 1:] = (doc_ids[:, 1:] != doc_ids[:, :-1]) & (doc_ids[:, 1:] >= 0)
labels_masked = labels.clone()
labels_masked[boundary] = -100


def allowed(document_mask: bool) -> torch.Tensor:
    """allow[b, t, s]: may position t attend to position s?"""
    causal = torch.tril(torch.ones(T, T, dtype=torch.bool))
    allow = causal.expand(B, T, T).clone()
    if document_mask:
        same = doc_ids[:, :, None] == doc_ids[:, None, :]
        allow &= same
    allow &= (doc_ids >= 0)[:, None, :]  # never attend to padding
    return allow


def forward(W, document_mask=True):
    x = E[input_ids]                                   # B x T x D
    allow = allowed(document_mask).to(DT)
    counts = allow.sum(-1, keepdim=True).clamp(min=1)
    c = allow @ x / counts                             # mean over allowed s
    h = x + c                                          # B x T x D
    return h, h @ W                                    # logits B x T x V


def shifted_targets(lbl):
    """Hugging Face's shift: pad one -100 at the end, drop the first label."""
    return torch.cat([lbl[:, 1:], torch.full((B, 1), -100)], dim=1)


def per_token_loss(logits, targets):
    logp = torch.log_softmax(logits, -1)
    valid = targets != -100
    nll = torch.zeros(B, T, dtype=DT)
    nll[valid] = -logp[valid, targets[valid]]
    return nll, valid


def show(title):
    print(f"\n== {title}")


# ---- 1. inputs, targets and masks -------------------------------------------
show("inputs and shifted targets")
tgt = shifted_targets(labels_masked)
for b in range(B):
    print(f" row {b}: in  =", [NAMES[i] for i in input_ids[b]])
    print(f"        tgt =", [NAMES[i] if i >= 0 else "-" for i in tgt[b]])
print(" target count N =", int((tgt != -100).sum()))

# ---- 2. what the document mask changes ---------------------------------------
show("hidden state at row 0, position 5 ('cat' in document 2)")
h_doc, _ = forward(W0, True)
h_naive, _ = forward(W0, False)
print(" with document mask   :", h_doc[0, 5].tolist())
print(" plain causal mask    :", h_naive[0, 5].tolist())

# ---- 3. the loss, three ways --------------------------------------------------
show("losses")
h, logits = forward(W0, True)
nll, valid = per_token_loss(logits, tgt)
for b in range(B):
    print(f" row {b} per-token NLL:", [round(v, 4) for v in nll[b].tolist()])
N = int(valid.sum())
token_mean = nll.sum() / N
seq_means = torch.stack([nll[b].sum() / valid[b].sum() for b in range(B)])
print(f" token mean (sum / N={N})      = {token_mean:.4f}")
print(f" mean of per-sequence means    = {seq_means.mean():.4f}   per-seq {seq_means.tolist()}")
# Gradient accumulation with each microbatch = one row, each normalized by its own count, then / 2.
accum_wrong = seq_means.mean()
print(f" accumulate 2 microbatches, mean-then-/2 = {accum_wrong:.4f} (same as mean of means)")
print(f" token weights: token mean gives every target 1/{N}; mean of means gives row 0's targets 1/(2*{int(valid[0].sum())}) and row 1's 1/(2*{int(valid[1].sum())})")
print(f" accumulate with global count: sum each row / N = {nll.sum() / N:.4f}")

# ---- 4. backward by hand, checked against autograd ---------------------------
show("gradient of the token-mean loss with respect to W")
p = torch.softmax(logits, -1)
onehot = torch.zeros_like(p)
onehot[valid] = torch.nn.functional.one_hot(tgt[valid], V).to(DT)
dz = (p - onehot) * valid[..., None] / N           # dL/dlogits, zero where ignored
gW_hand = torch.einsum("btd,btv->dv", h, dz)
W = W0.clone().requires_grad_(True)
_, lg = forward(W, True)
loss = per_token_loss(lg, tgt)[0].sum() / N
loss.backward()
assert torch.allclose(W.grad, gW_hand, atol=1e-12), "hand gradient disagrees with autograd"
print(" dL/dz at row 0, pos 1 (target 'cat'):", [round(v, 4) for v in dz[0, 1].tolist()])
print(" grad W row 0:", [round(v, 4) for v in gW_hand[0].tolist()])
print(" grad W row 1:", [round(v, 4) for v in gW_hand[1].tolist()])
print(" autograd agrees: yes")

# ---- 5. clipping ---------------------------------------------------------------
show("gradient clipping, max_norm = 0.1")
g = gW_hand.clone()
total = g.norm()
coef = min(1.0, 0.1 / (float(total) + 1e-6))
print(f" total norm = {total:.4f}, clip coefficient = {coef:.4f}")
g_clipped = g * coef
Wt = W0.clone().requires_grad_(True)
Wt.grad = g.clone()
returned = torch.nn.utils.clip_grad_norm_([Wt], 0.1)
assert torch.allclose(Wt.grad, g_clipped) and abs(float(returned) - float(total)) < 1e-12

# ---- 6. one AdamW step, by hand and by torch.optim.AdamW -----------------------
show("AdamW step 1: lr = 1e-3, betas = (0.9, 0.95), eps = 1e-8, weight_decay = 0.1")
lr, b1, b2, eps, wd = 1e-3, 0.9, 0.95, 1e-8, 0.1
m = (1 - b1) * g_clipped
v = (1 - b2) * g_clipped ** 2
m_hat, v_hat = m / (1 - b1), v / (1 - b2)
decayed = W0 * (1 - lr * wd)
W1_hand = decayed - lr * m_hat / (v_hat.sqrt() + eps)
opt = torch.optim.AdamW([Wt], lr=lr, betas=(b1, b2), eps=eps, weight_decay=wd)
opt.step()
assert torch.allclose(Wt.detach(), W1_hand, atol=1e-15), "hand AdamW disagrees with torch"
for (i, j) in [(0, 2), (1, 3), (1, 4)]:
    print(f" W[{i},{j}]: {W0[i, j]:+.4f}  grad {g_clipped[i, j]:+.6f}  m_hat/sqrt(v_hat) = {float(m_hat[i, j] / (v_hat[i, j].sqrt() + eps)):+.6f}"
          f"  -> {W1_hand[i, j]:+.7f}  (change {W1_hand[i, j] - W0[i, j]:+.7f})")
print(" torch.optim.AdamW agrees: yes")
print(f" every coordinate with a nonzero gradient moves by about lr = {lr} on step 1, whatever its gradient's size")

# ---- 7. the real Hugging Face path ---------------------------------------------
show("Hugging Face Transformers loss path")
try:
    import transformers
    from transformers.loss.loss_utils import ForCausalLMLoss
    hf_mean = ForCausalLMLoss(logits, labels_masked, vocab_size=V)
    print(f" transformers {transformers.__version__}: ForCausalLMLoss (mean) = {float(hf_mean):.4f}  matches token mean to FP32 precision: {abs(float(hf_mean) - float(token_mean)) < 1e-6}")
    trainer_count = int(labels_masked.ne(-100).sum())       # what Trainer.get_batch_samples counts
    hf_sum = ForCausalLMLoss(logits, labels_masked, vocab_size=V, num_items_in_batch=trainer_count)
    print(f" Trainer-style count labels.ne(-100).sum() = {trainer_count} (true targets: {N})")
    print(f" ForCausalLMLoss with that count = {float(hf_sum):.4f}  (= token mean x {N}/{trainer_count})")
except ImportError:
    print(" transformers not installed; skipped")
