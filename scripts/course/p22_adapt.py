"""Reproduces src/content/blog/model-development-adapt-or-prompt.mdx.

Run: python3 scripts/course/p22_adapt.py   (torch, CPU)
LoRA parameter counts, zero initialization, merging, and rank recovery on a toy.
"""
import torch


def section(title):
    print(f"\n== {title}")


section("LoRA parameters for one 4096 x 4096 matrix")
d, r = 4096, 8
full, lora = d * d, r * d + d * r
print(f" full {full:,}; LoRA rank {r}: {lora:,} ({lora / full:.2%})")
assert lora == 65_536 and round(100 * lora / full, 2) == 0.39

section("LoRA on the query and value projections of Llama 3 8B (32 layers; K/V width 1024)")
L, dm, dkv = 32, 4096, 1024
per_layer = (r * dm + dm * r) + (r * dm + dkv * r)  # W_q: 4096x4096, W_v: 4096x1024
print(f" rank 8: {L * per_layer / 1e6:.2f}M trainable of 8.03B ({L * per_layer / 8.03e9:.3%})")
assert round(L * per_layer / 1e6, 2) == 3.41

section("zero init, training and merging on a toy layer")
torch.manual_seed(0)
din, dout, rank, alpha = 16, 16, 2, 4
W0 = torch.randn(dout, din)
target = W0 + torch.randn(dout, rank) @ torch.randn(rank, din) * 0.5   # the true change has rank 2
A = (torch.randn(rank, din) * 0.1).requires_grad_(True)
B = torch.zeros(dout, rank, requires_grad=True)
x = torch.randn(256, din)
y = x @ target.T
out0 = x @ (W0 + (alpha / rank) * B @ A).T
print(f" at initialization the adapted layer equals the base layer: {torch.allclose(out0, x @ W0.T)}")
opt = torch.optim.Adam([A, B], lr=0.05)
for step in range(1500):
    loss = ((x @ (W0 + (alpha / rank) * B @ A).T - y) ** 2).mean()
    opt.zero_grad(); loss.backward(); opt.step()
print(f" rank-2 LoRA fitting a rank-2 change: final loss {loss.item():.2e}")
merged = W0 + (alpha / rank) * (B @ A).detach()
same = torch.allclose(x @ merged.T, x @ W0.T + (alpha / rank) * (x @ A.detach().T) @ B.detach().T, atol=1e-5)
print(f" merged weight gives the same outputs as base + adapter: {same}")
assert loss.item() < 1e-4 and same

section("memory to fine-tune 8B (weights + gradients + optimizer state)")
N = 8.03e9
print(f" full fine-tuning at 16 B/param: {16 * N / 1e9:.0f} GB")
print(f" LoRA: BF16 frozen weights {2 * N / 1e9:.0f} GB + adapters {16 * 3.41e6 / 1e6:.0f} MB of state")
print(f" QLoRA: 4-bit frozen weights about {0.5 * N / 1e9:.1f} GB + adapters")
assert round(16 * N / 1e9) == 128 and round(2 * N / 1e9) == 16
