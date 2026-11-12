"""A complete small training run on CPU, behind src/content/blog/model-development-small-training-run.mdx.

Run: python3 scripts/course/p6_train.py /path/to/tinyshakespeare/input.txt
(input.txt from github.com/karpathy/char-rnn at commit 6f9487a, 1,115,394 bytes)

Trains a byte-level BPE tokenizer (2,048 entries) on the first 90% of the text,
then a 4-layer decoder (pre-norm RMSNorm, SwiGLU, RoPE, tied embeddings) for
600 steps of 16 x 128 tokens, several ways, and writes the curves to
scripts/course/data/p6_runs.json. About 10 minutes on an Apple M1 CPU.
"""
import json
import math
import os
import sys
import time

import torch
import torch.nn as nn
import torch.nn.functional as F
from tokenizers import Tokenizer, decoders, models, pre_tokenizers, trainers

torch.set_num_threads(4)
OUT = os.path.join(os.path.dirname(__file__), "data", "p6_runs.json")
os.makedirs(os.path.dirname(OUT), exist_ok=True)
V, D, L, H, FF, CTX = 2048, 128, 4, 4, 352, 128
BATCH, STEPS, EVAL_EVERY, EVAL_BATCHES = 16, 600, 25, 20

# -- 1. Data: tokenizer trained on the training split only, then contiguous splits ----------
text = open(sys.argv[1], encoding="utf-8").read()
cut = int(0.9 * len(text))
train_text, val_text = text[:cut], text[cut:]
tok = Tokenizer(models.BPE())
tok.pre_tokenizer = pre_tokenizers.ByteLevel(add_prefix_space=False)
tok.decoder = decoders.ByteLevel()
tok.train_from_iterator([train_text], trainers.BpeTrainer(vocab_size=V, initial_alphabet=pre_tokenizers.ByteLevel.alphabet(), show_progress=False))
train_ids = torch.tensor(tok.encode(train_text).ids)
val_ids = torch.tensor(tok.encode(val_text).ids)
assert tok.decode(tok.encode(val_text[:2000]).ids) == val_text[:2000]
print(f"vocab {tok.get_vocab_size()}, train {len(train_ids):,} tokens ({len(train_text) / len(train_ids):.2f} chars/token), val {len(val_ids):,}")


def batch(ids, gen):
    i = torch.randint(0, len(ids) - CTX - 1, (BATCH,), generator=gen)
    x = torch.stack([ids[j:j + CTX] for j in i])
    y = torch.stack([ids[j + 1:j + CTX + 1] for j in i])  # targets: inputs shifted by one
    return x, y


# -- 2. Model: the block from the architecture post -------------------------------------
class RMSNorm(nn.Module):
    def __init__(self, d):
        super().__init__(); self.w = nn.Parameter(torch.ones(d))

    def forward(self, x):
        return self.w * x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + 1e-6)


def rope(x, base=10_000.0):  # x: (B, H, T, hd); rotate pairs (2i, 2i+1)
    hd, T = x.shape[-1], x.shape[-2]
    inv = base ** (-torch.arange(0, hd, 2, dtype=torch.float32) / hd)
    ang = torch.arange(T, dtype=torch.float32)[:, None] * inv[None]
    cos, sin = ang.cos(), ang.sin()
    x1, x2 = x[..., 0::2], x[..., 1::2]
    return torch.stack((x1 * cos - x2 * sin, x1 * sin + x2 * cos), -1).flatten(-2)


class Block(nn.Module):
    def __init__(self):
        super().__init__()
        self.n1, self.n2 = RMSNorm(D), RMSNorm(D)
        self.qkv, self.o = nn.Linear(D, 3 * D, bias=False), nn.Linear(D, D, bias=False)
        self.gate, self.up, self.down = (nn.Linear(D, FF, bias=False), nn.Linear(D, FF, bias=False), nn.Linear(FF, D, bias=False))

    def forward(self, x):
        B, T, _ = x.shape
        q, k, v = self.qkv(self.n1(x)).view(B, T, 3, H, D // H).permute(2, 0, 3, 1, 4)
        a = F.scaled_dot_product_attention(rope(q), rope(k), v, is_causal=True)
        x = x + self.o(a.transpose(1, 2).reshape(B, T, D))
        h = self.n2(x)
        return x + self.down(F.silu(self.gate(h)) * self.up(h))


class LM(nn.Module):
    def __init__(self):
        super().__init__()
        self.emb = nn.Embedding(V, D)
        self.blocks = nn.ModuleList(Block() for _ in range(L))
        self.norm = RMSNorm(D)
        for n, p in self.named_parameters():
            if p.dim() == 2:
                nn.init.normal_(p, std=0.02)

    def forward(self, x):
        h = self.emb(x)
        for b in self.blocks:
            h = b(h)
        return self.norm(h) @ self.emb.weight.T  # tied output layer


# -- 3. Schedule and loop ----------------------------------------------------------------
def lr_at(step, peak, warmup):
    if step < warmup:
        return peak * (step + 1) / warmup
    t = (step - warmup) / max(1, STEPS - warmup)
    return peak * (0.1 + 0.9 * 0.5 * (1 + math.cos(math.pi * t)))  # cosine to 10% of peak


@torch.no_grad()
def evaluate(model):
    g = torch.Generator().manual_seed(1234)  # the same validation batches every time
    return sum(F.cross_entropy(model(x).reshape(-1, V), y.reshape(-1)).item() for x, y in (batch(val_ids, g) for _ in range(EVAL_BATCHES))) / EVAL_BATCHES


def make(seed=0):
    torch.manual_seed(seed)
    model = LM()
    decay = [p for p in model.parameters() if p.dim() >= 2]
    rest = [p for p in model.parameters() if p.dim() < 2]
    opt = torch.optim.AdamW([{"params": decay, "weight_decay": 0.1}, {"params": rest, "weight_decay": 0.0}], lr=1.0, betas=(0.9, 0.95))
    return model, opt, torch.Generator().manual_seed(seed)


def train(peak, warmup, start=None, stop=STEPS, log=True, clip=True):
    model, opt, gen = make()
    first = 0
    if start:  # resume from a checkpoint dictionary
        model.load_state_dict(start["model"]); opt.load_state_dict(start["opt"]); gen.set_state(start["gen"]); first = start["step"]
    curve = {"step": [], "train": [], "train_raw": [], "val": [], "lr": [], "grad_norm": []}
    for step in range(first, stop):
        if step % EVAL_EVERY == 0 or step == STEPS - 1:
            model.eval(); curve["val"].append([step, round(evaluate(model), 4)]); model.train()
        for g in opt.param_groups:
            g["lr"] = lr_at(step, peak, warmup)
        x, y = batch(train_ids, gen)
        loss = F.cross_entropy(model(x).reshape(-1, V), y.reshape(-1))
        opt.zero_grad(set_to_none=True)
        loss.backward()
        norm = torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0 if clip else float("inf"))
        opt.step()
        curve["step"].append(step); curve["train"].append(round(loss.item(), 4)); curve["train_raw"].append(loss.item())
        curve["lr"].append(lr_at(step, peak, warmup)); curve["grad_norm"].append(round(norm.item(), 4))
        if log and step % 100 == 0:
            print(f"  step {step}: train {loss.item():.3f}, lr {lr_at(step, peak, warmup):.2e}, grad norm {norm.item():.2f}")
    ckpt = {"model": model.state_dict(), "opt": opt.state_dict(), "gen": gen.get_state(), "step": stop}
    return model, curve, ckpt


if __name__ == "__main__":
    model, _, _ = make()
    n_params = sum(p.numel() for p in model.parameters())
    with torch.no_grad():
        x, y = batch(val_ids, torch.Generator().manual_seed(0))
        init_loss = F.cross_entropy(model(x).reshape(-1, V), y.reshape(-1)).item()
    print(f"parameters {n_params:,}; loss at initialization {init_loss:.3f} vs ln V = {math.log(V):.3f}")
    runs = {"meta": {"params": n_params, "vocab": V, "train_tokens": len(train_ids), "val_tokens": len(val_ids),
                     "tokens_per_step": BATCH * CTX, "steps": STEPS, "init_loss": round(init_loss, 3), "ln_V": round(math.log(V), 3)}}
    for name, peak, warmup, clip in (("baseline", 3e-3, 50, True), ("no_warmup", 3e-3, 0, True), ("lr_high", 3e-2, 50, True), ("lr_very_high", 1e-1, 50, True), ("lr_very_high_no_clip", 1e-1, 50, False)):
        t0 = time.time(); print(f"run {name}: peak lr {peak}, warmup {warmup}, clipping {clip}")
        m, curve, ckpt = train(peak, warmup, clip=clip)
        runs[name] = curve
        print(f"  final train {curve['train'][-1]:.3f}, val {curve['val'][-1][1]:.3f}, {time.time() - t0:.0f}s")
        if name == "baseline":
            base_curve, base_model, base_ckpt = curve, m, ckpt
    # Resume test: stop at step 300, save, rebuild everything, continue to 600.
    _, first_half, ckpt = train(3e-3, 50, stop=300, log=False)
    path = os.path.join(os.path.dirname(OUT), "p6_ckpt.pt")
    torch.save(ckpt, path); ckpt = torch.load(path, weights_only=False); os.remove(path)
    _, second_half, end_ckpt = train(3e-3, 50, start=ckpt, log=False)
    # Strict comparison: unrounded float losses at every step, and every tensor of the final
    # model and optimizer state, compared bit for bit with the uninterrupted run.
    losses_equal = first_half["train_raw"] + second_half["train_raw"] == base_curve["train_raw"]
    model_equal = all(torch.equal(a, b) for a, b in zip(end_ckpt["model"].values(), base_ckpt["model"].values()))
    sa, sb = end_ckpt["opt"]["state"], base_ckpt["opt"]["state"]
    opt_equal = sa.keys() == sb.keys() and all(torch.equal(sa[k][n], sb[k][n]) for k in sa for n in sa[k])
    same = losses_equal and model_equal and opt_equal
    print(f"resume at 300: unrounded losses identical {losses_equal}, final weights identical {model_equal}, optimizer state identical {opt_equal}")
    assert same
    runs["meta"]["resume_identical"] = same
    for c in runs.values():
        if isinstance(c, dict):
            c.pop("train_raw", None)
    # Precision: what BF16 does to a small update and to the validation loss.
    w = torch.tensor(1.0, dtype=torch.bfloat16)
    print(f"bf16: 1.0 + 0.001 = {(w + 0.001).item()}, spacing above 1 = {2 ** -7}; fp32: {(torch.tensor(1.0) + 0.001).item():.4f}")
    base_model.eval()
    with torch.no_grad(), torch.autocast("cpu", dtype=torch.bfloat16):
        bf = evaluate(base_model)
    fp = evaluate(base_model)
    print(f"validation loss fp32 {fp:.4f}, bf16 autocast {bf:.4f}")
    runs["meta"].update({"val_fp32": round(fp, 4), "val_bf16": round(bf, 4)})
    sample = base_model.emb.weight.new_tensor(tok.encode("ROMEO:").ids, dtype=torch.long)[None]
    g = torch.Generator().manual_seed(0)
    with torch.no_grad():
        for _ in range(60):
            p = F.softmax(base_model(sample[:, -CTX:])[0, -1] / 0.8, -1)
            sample = torch.cat([sample, torch.multinomial(p, 1, generator=g)[None]], 1)
    runs["meta"]["sample"] = tok.decode(sample[0].tolist())
    print("sample:", runs["meta"]["sample"])
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(runs, open(OUT, "w"))
    print("wrote", OUT)
    # Compact copy for the figure: validation curves, 25-step moving average of training loss, gradient norms.
    smooth = lambda xs, k=25: [sum(xs[max(0, i - k + 1):i + 1]) / len(xs[max(0, i - k + 1):i + 1]) for i in range(len(xs))]
    fig = {"meta": {k: runs["meta"][k] for k in ("params", "vocab", "train_tokens", "val_tokens", "tokens_per_step", "steps", "init_loss", "ln_V")}, "runs": {}}
    for name in ("baseline", "no_warmup", "lr_high", "lr_very_high", "lr_very_high_no_clip"):
        c = runs[name]; tr = smooth(c["train"])
        fig["runs"][name] = {"val": c["val"], "train": [[s, round(tr[s], 3)] for s in range(0, STEPS, 10)] + [[STEPS - 1, round(tr[-1], 3)]],
                             "grad_norm": [[s, round(max(c["grad_norm"][s:s + 5]), 3)] for s in range(0, STEPS, 5)]}  # max per 5 steps keeps spikes
    fig_path = os.path.join(os.path.dirname(__file__), "..", "..", "src", "data", "model-development", "p6-curves.json")
    json.dump(fig, open(fig_path, "w"), separators=(",", ":"))
