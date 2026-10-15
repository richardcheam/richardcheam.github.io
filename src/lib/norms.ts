// The 4-by-3 batch of the Foundations post on normalisation, and the three
// normalisers worked on it: batch norm (down each column), layer norm and
// RMSNorm (across each row). Variances divide by n; ε is 0 for display.

export const X = [[2, 1, 20], [4, 3, 60], [2, 3, 20], [4, 9, 60]];
export const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
export const variance = (v: number[]) => { const m = mean(v); return mean(v.map((x) => (x - m) ** 2)); };
export const col = (M: number[][], j: number) => M.map((r) => r[j]);

export function batchNorm(M: number[][], gamma = [1, 1, 1], beta = [0, 0, 0]) {
  const stats = M[0].map((_, j) => { const c = col(M, j), m = mean(c), v = variance(c); return { m, v, s: Math.sqrt(v) }; });
  return { stats, out: M.map((r) => r.map((x, j) => (gamma[j] * (x - stats[j].m)) / (stats[j].s || 1) + beta[j])) };
}
export function layerNorm(M: number[][]) {
  const stats = M.map((r) => { const m = mean(r), v = variance(r); return { m, v, s: Math.sqrt(v) }; });
  return { stats, out: M.map((r, i) => r.map((x) => (x - stats[i].m) / (stats[i].s || 1))) };
}
export function rmsNorm(M: number[][]) {
  const stats = M.map((r) => { const ms = mean(r.map((x) => x * x)); return { ms, rms: Math.sqrt(ms) }; });
  return { stats, out: M.map((r, i) => r.map((x) => x / (stats[i].rms || 1))) };
}
