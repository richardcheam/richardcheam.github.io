// One-number GANs for the Foundations post on GANs: an affine forger
// G(z) = a z + b against a logistic detective, trained by alternating steps
// on one seeded random stream (mulberry32 + Box-Muller), so the figures
// reproduce the post's numbers exactly.
import { mulberry } from "./tiny-net";

export const sigmoid = (s: number) => (s >= 0 ? 1 / (1 + Math.exp(-s)) : Math.exp(s) / (1 + Math.exp(s)));
export function gauss(r: () => number) { const u = r() || 1e-12, v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
/** The fixed 2000 noise draws used for every snapshot statistic. */
export const EVAL_Z = (() => { const r = mulberry(999); return Array.from({ length: 2000 }, () => gauss(r)); })();

export interface Detective { feats: (x: number) => number[]; dfeats: (x: number) => number[]; w: number[]; c: number }
export const quadDetective = (): Detective => ({ feats: (x) => [x * x, x], dfeats: (x) => [2 * x, 1], w: [0, 0], c: 0 });
const CENTRES = [-3, -2, -1, 0, 1, 2, 3];
export const bumpDetective = (): Detective => ({
  feats: (x) => CENTRES.map((c) => Math.exp(-((x - c) ** 2) / (2 * 0.25))),
  dfeats: (x) => CENTRES.map((c) => (-(x - c) / 0.25) * Math.exp(-((x - c) ** 2) / (2 * 0.25))),
  w: CENTRES.map(() => 0), c: 0,
});
export const D = (det: Detective, x: number) => sigmoid(det.feats(x).reduce((s, f, k) => s + f * det.w[k], det.c));

export function makeGan(o: { real: (r: () => number) => number; det: Detective; a: number; b: number; lrD: number; lrG: number; seed?: number; m?: number }) {
  const r = mulberry(o.seed ?? 7), m = o.m ?? 64, det = o.det;
  let a = o.a, b = o.b, step = 0;
  function iterate() {
    const real = Array.from({ length: m }, () => o.real(r)), zs = Array.from({ length: m }, () => gauss(r)), fake = zs.map((z) => a * z + b);
    // Detective step: binary cross-entropy averaged over 2m samples.
    const gw = det.w.map(() => 0); let gc = 0;
    [...real.map((x) => [x, 1]), ...fake.map((x) => [x, 0])].forEach(([x, y]) => { const e = D(det, x) - y, f = det.feats(x); f.forEach((v, k) => (gw[k] += e * v)); gc += e; });
    det.w = det.w.map((w, k) => w - (o.lrD * gw[k]) / (2 * m)); det.c -= (o.lrD * gc) / (2 * m);
    // Forger step on the same noise, non-saturating loss, with the updated detective.
    let ga = 0, gb = 0;
    zs.forEach((z) => { const x = a * z + b, d = D(det, x), dx = -(1 - d) * det.dfeats(x).reduce((s, v, k) => s + v * det.w[k], 0); ga += dx * z; gb += dx; });
    a -= (o.lrG * ga) / m; b -= (o.lrG * gb) / m; step++;
  }
  const stats = () => { const xs = EVAL_Z.map((z) => a * z + b), mean = xs.reduce((s, v) => s + v, 0) / xs.length; return { mean, spread: Math.sqrt(xs.reduce((s, v) => s + (v - mean) ** 2, 0) / xs.length), pos: xs.filter((v) => v > 0).length / xs.length, xs }; };
  return { iterate, stats, det, get a() { return a; }, get b() { return b; }, get step() { return step; } };
}
export const realOne = (r: () => number) => 3 + 0.5 * gauss(r);
export const realTwo = (r: () => number) => (r() < 0.5 ? 2 : -2) + 0.3 * gauss(r);
