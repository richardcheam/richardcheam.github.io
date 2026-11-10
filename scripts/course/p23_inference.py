"""Reproduces src/content/blog/model-development-inference-serving.mdx.

Run: python3 scripts/course/p23_inference.py   (torch, CPU)
H100 figures as in CS336 (989.5 TFLOP/s BF16, 3.35 TB/s, 80 GB); Llama 3 8B
shapes from its Table 3. All are upper bounds that ignore overheads.
"""
import torch


def section(title):
    print(f"\n== {title}")


PEAK, BW, HBM = 989.5e12, 3.35e12, 80e9
N = 8.03e9
KV_TOKEN = 131_072  # bytes per token, BF16, 32 layers x 8 KV heads x 128 x 2 (K,V) x 2 bytes

section("decode: reading the weights bounds the time per step")
for name, bytes_per in (("BF16", 2), ("INT8", 1), ("INT4", 0.5)):
    t = N * bytes_per / BW
    print(f" {name}: {N * bytes_per / 1e9:.1f} GB per step -> at least {t * 1e3:.2f} ms -> at most {1 / t:.0f} tokens/s for one sequence")
assert round(N * 2 / BW * 1e3, 1) == 4.8

section("batching: weights are read once per step for the whole batch")
ctx = 2048
for B in (1, 8, 32, 64):
    bytes_step = N * 2 + B * ctx * KV_TOKEN
    t = bytes_step / BW
    print(f" batch {B:>2} at {ctx} tokens of context: {t * 1e3:.1f} ms per step, {B / t:,.0f} tokens/s in total")
t1 = (N * 2 + ctx * KV_TOKEN) / BW
t64 = (N * 2 + 64 * ctx * KV_TOKEN) / BW
assert 64 / t64 > 20 / t1 and t64 > t1

section("KV-cache capacity on one 80 GB GPU")
for name, wbytes in (("BF16 weights", 2 * N), ("INT4 weights", 0.5 * N)):
    free = HBM - wbytes
    print(f" {name}: {free / 1e9:.0f} GB free -> {free / (KV_TOKEN * 8192):.0f} sequences of 8,192 tokens")
assert round((HBM - 2 * N) / (KV_TOKEN * 8192)) == 60

section("prefill: compute-bound; time to first token for a 2,000-token prompt at 50% MFU")
ttft = 2 * N * 2000 / (PEAK * 0.5)
print(f" 2 N x 2,000 = {2 * N * 2000:.2e} FLOPs -> {ttft * 1e3:.0f} ms")
assert round(ttft * 1e3) == 65

section("speculative decoding: expected tokens per target-model step = (1 - a^(g+1)) / (1 - a)")
for a in (0.6, 0.8, 0.9):
    for g in (2, 4, 8):
        print(f" acceptance {a}, draft {g}: {(1 - a ** (g + 1)) / (1 - a):.2f}")
assert round((1 - 0.8 ** 5) / 0.2, 2) == 3.36

section("INT8 weight quantization: one scale per tensor versus one per output channel")
torch.manual_seed(0)
W = torch.randn(64, 256) * torch.logspace(-2, 0, 64).unsqueeze(1)  # channels of very different size
def q8(w, scale):
    return torch.clamp(torch.round(w / scale), -127, 127) * scale
per_tensor = q8(W, W.abs().max() / 127)
per_channel = q8(W, W.abs().amax(1, keepdim=True) / 127)
rel = lambda Wq: ((Wq - W).norm(dim=1) / W.norm(dim=1))
print(f" smallest channel's relative error: per tensor {rel(per_tensor)[0]:.2f}, per channel {rel(per_channel)[0]:.4f}")
assert rel(per_tensor)[0] > 0.2 and rel(per_channel)[0] < 0.01

section("activity: 70B in BF16 on 80 GB GPUs")
W70 = 70e9 * 2
print(f" weights {W70 / 1e9:.0f} GB -> at least 2 GPUs; with INT4 {70e9 * 0.5 / 1e9:.0f} GB fits on one")
print(f" per-step weight read at BF16 on one GPU's bandwidth: {W70 / BW * 1e3:.0f} ms (split over 2 GPUs: ~{W70 / 2 / BW * 1e3:.0f} ms)")
