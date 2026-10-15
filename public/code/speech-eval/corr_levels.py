"""System-level vs clip-level Spearman correlation between a metric and human
scores. 5 systems x 40 clips; human = quality + clip effect + rater noise;
metric = quality + clip effect + metric noise. Needs numpy and scipy."""
import numpy as np
from scipy.stats import spearmanr

rng = np.random.default_rng(0)
S, K = 5, 40
q = 3.0 + 0.3 * np.arange(S)
sys = np.repeat(np.arange(S), K)

print("metric noise | clip-level rho | system-level rho (median over 500 runs, 5-95%)")
for sd in [0.0, 0.4, 0.8, 1.2]:
    clip, syst = [], []
    for _ in range(500):
        u = 0.4 * rng.standard_normal(S * K)
        human = q[sys] + u + 0.5 * rng.standard_normal(S * K)
        metric = q[sys] + u + sd * rng.standard_normal(S * K)
        clip.append(spearmanr(human, metric)[0])
        hm = [human[sys == s].mean() for s in range(S)]
        mm = [metric[sys == s].mean() for s in range(S)]
        syst.append(spearmanr(hm, mm)[0])
    c, s_ = np.array(clip), np.array(syst)
    print(f"{sd:12.1f} | {np.median(c):14.2f} | {np.median(s_):5.2f}  [{np.percentile(s_, 5):.2f}, {np.percentile(s_, 95):.2f}]")
