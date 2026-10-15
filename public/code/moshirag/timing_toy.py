"""Toy 1: MoshiRAG timing budget in 80 ms frames. Pure numpy, no model.
Assumed distributions are labelled ASSUMED; paper constants are cited."""
import numpy as np
rng = np.random.default_rng(0)
FR = 12.5                 # Moshi frame rate, Hz (Sec 3.3.1)
FRAME = 1 / FR            # 0.08 s
ASR_WAIT = 0.5            # s, wait after <ret> (Sec 3.3.3)
print("== Frame arithmetic ==")
for s in [0.5, 1.5, 2.0, 3.1, 20.0]:
    print(f"{s:5.1f} s = {s*FR:6.2f} frames")

# Reference length -> injection window (Eq. 2): l frames, one encoder vector per frame.
# Reference docs are capped at 50 words (Table 15 prompt). ASSUMED ~1.3 tokens/word.
print("\n== Injection window for a 50-word reference (ASSUMED 1.3 tok/word -> 65 tokens) ==")
toks = 65
for name, ratio in [("T5 (no compression)", 1), ("ARC-Encoder x4", 4), ("ARC-Encoder x8", 8)]:
    l = int(np.ceil(toks / ratio))
    print(f"{name:22s} l = {l:3d} frames = {l*FRAME:4.2f} s")
print("(paper's own example: 250 tokens uncompressed = 20 s, Sec 3.3.1)")

# Monte Carlo: does the reference finish streaming in before the keyword?
# ASSUMED: backend LLM latency lognormal, median 0.8 s; keyword delay normal(3.1, 0.8) s
# with mean = MoshiRAG's KD in Table 1. <ret> is predicted at response onset (TTFAT ~ 0).
N = 200_000
llm = rng.lognormal(np.log(0.8), 0.35, N)
retrieval = ASR_WAIT + llm                      # paper's "retrieval delay" includes the ASR wait
kd = np.clip(rng.normal(3.1, 0.8, N), 0.8, None)
print("\n== Monte Carlo, N=200k (ASSUMED distributions) ==")
print(f"median retrieval delay = {np.median(retrieval):.2f} s, p90 = {np.percentile(retrieval,90):.2f} s")
for name, ratio in [("T5", 1), ("ARC x4", 4), ("ARC x8", 8)]:
    l = np.ceil(toks / ratio) * FRAME
    start_ok = (retrieval < kd).mean()
    full_ok = (retrieval + l < kd).mean()
    # fraction of the reference already consumed when the keyword is spoken
    frac = np.clip((kd - retrieval) / l, 0, 1).mean()
    print(f"{name:7s} injection starts before keyword: {start_ok:6.1%} | fully injected before keyword: {full_ok:6.1%} | mean fraction consumed: {frac:5.1%}")
print("\nSweep of backend median latency (ARC x4):")
l4 = np.ceil(toks/4)*FRAME
for med in [0.3, 0.8, 1.5, 2.5, 3.5]:
    r = ASR_WAIT + rng.lognormal(np.log(med), 0.35, N)
    print(f"  backend median {med:3.1f} s -> fully injected before keyword {(r + l4 < kd).mean():6.1%}")

# Training-time delay sampler, Eq. 3
print("\n== Eq. 3 training-delay sampler ==")
def sample_d(d_lead, p):
    if d_lead < 2 or p < 0.2:
        return rng.uniform(0, d_lead)
    return rng.uniform(1.0, d_lead - 1.0)
for d_lead in [1.5, 3.0, 5.0]:
    ds = np.array([sample_d(d_lead, rng.uniform()) for _ in range(50_000)])
    print(f"d_lead={d_lead}: mean d'={ds.mean():.2f} s, share leaving >=1 s buffer before body = {(ds <= d_lead-1).mean():.1%}")
