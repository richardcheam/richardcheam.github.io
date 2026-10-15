// Scaled dot-product attention for the Foundations post on attention.

export const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);
export function softmax(xs: number[]) {
  const finite = xs.filter(Number.isFinite), m = finite.length ? Math.max(...finite) : 0;
  const e = xs.map((x) => (Number.isFinite(x) ? Math.exp(x - m) : 0)), t = e.reduce((s, v) => s + v, 0);
  return e.map((v) => v / t);
}

/** softmax(QKᵀ/√d + mask) V, keeping every intermediate for display. */
export function attend(Q: number[][], K: number[][], V: number[][], o: { scale?: boolean; causal?: boolean } = {}) {
  const d = Q[0].length, sd = o.scale === false ? 1 : Math.sqrt(d);
  const raw = Q.map((q) => K.map((k) => dot(q, k)));
  const scaled = raw.map((r, i) => r.map((v, j) => (o.causal && j > i ? -Infinity : v / sd)));
  const w = scaled.map(softmax);
  const out = w.map((r) => V[0].map((_, c) => r.reduce((s, a, j) => s + a * V[j][c], 0)));
  return { raw, scaled, w, out, sd };
}

/** Seeded standard normal draws (Box-Muller on mulberry32). */
export function normals(seed: number) {
  let s = seed;
  const r = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
}
