// The two-point toy of the Foundations post on diffusion and flow models:
// data is ±1, so the best denoiser and the best velocity field have exact
// formulas and stand in for a trained network.
import { mulberry } from "./tiny-net";

/** Seeded standard normals: sqrt(−2 ln(1 − u)) cos(2πv) from consecutive draws. */
export function gaussStream(seed: number) { const r = mulberry(seed); return () => { const u = r(), v = r(); return Math.sqrt(-2 * Math.log(1 - u)) * Math.cos(2 * Math.PI * v); }; }

// Diffusion convention: t = 0 is data, t = 1 is noise.
export const keep = (t: number) => Math.cos((Math.PI * t) / 2), noiseW = (t: number) => Math.sin((Math.PI * t) / 2);
export function denoise(x: number, t: number) { const a = keep(t), b = noiseW(t); if (b < 1e-12) return { x0: x, eps: 0 }; const x0 = Math.tanh((a * x) / (b * b)); return { x0, eps: (x - a * x0) / b }; }

/** One reverse step from t to s; z is the fresh noise for DDPM. */
export function reverseStep(x: number, t: number, s: number, z: number, ddim: boolean) {
  const { x0, eps } = denoise(x, t);
  if (s <= 0) return { next: x0, x0, eps, mean: x0, spread: 0 };
  const at = keep(t), bt2 = noiseW(t) ** 2, as = keep(s), bs2 = noiseW(s) ** 2, r = at / as, gap = bt2 - r * r * bs2;
  const mean = ((r * bs2) / bt2) * x + ((as * gap) / bt2) * x0, spread = Math.sqrt((gap * bs2) / bt2);
  return { next: ddim ? as * x0 + Math.sqrt(bs2) * eps : mean + spread * z, x0, eps, mean, spread, r, gap, w1: (r * bs2) / bt2, w2: (as * gap) / bt2 };
}

/** Run particles from noise to data with N reverse steps (seed 14, draw order: start then each z). */
export function sampleParticles(n: number, N: number, ddim: boolean, seed = 14) {
  const g = gaussStream(seed), paths: number[][] = [];
  for (let p = 0; p < n; p++) {
    let x = g(); const path = [x];
    for (let k = 0; k < N; k++) { const t = 1 - k / N, s = 1 - (k + 1) / N, z = s > 0 && !ddim ? g() : 0; x = reverseStep(x, t, s, z, ddim).next; path.push(x); }
    paths.push(path);
  }
  return paths;
}

// Flow convention: t = 0 is noise, t = 1 is data.
export function vStraight(x: number, t: number) { const x1 = Math.tanh((t * x) / (1 - t) ** 2); return { x1, v: (x1 - x) / (1 - t) }; }
export function vCurved(x: number, t: number) { const A = Math.sin((Math.PI * t) / 2), B = Math.cos((Math.PI * t) / 2); const x1 = Math.tanh((A * x) / (B * B)), x0 = (x - A * x1) / B; return { x1, v: (Math.PI / 2) * B * x1 - (Math.PI / 2) * A * x0 }; }
export function euler(x: number, N: number, field: (x: number, t: number) => { v: number }) { const h = 1 / N, pts = [x]; for (let k = 0; k < N; k++) { x = x + h * field(x, k * h).v; pts.push(x); } return pts; }
/** Where the exact flow ends: integrate finely to t = 0.999, then snap to ±1. */
export function exactEnd(x: number, field: (x: number, t: number) => { v: number }) {
  const T = 0.999, M = 20000, h = T / M;
  for (let i = 0; i < M; i++) { const t = i * h, k1 = field(x, t).v, k2 = field(x + (h / 2) * k1, t + h / 2).v, k3 = field(x + (h / 2) * k2, t + h / 2).v, k4 = field(x + h * k3, t + h).v; x += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4); }
  return Math.sign(x);
}
