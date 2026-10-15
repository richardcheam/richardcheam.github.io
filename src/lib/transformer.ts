// Pieces of the Foundations post on the Transformer: a toy pre-norm block on
// three tokens, the residual-gradient stack, GELU, sinusoidal positions and
// RoPE rotation, and the GPT-2-style parameter count.
import { softmax } from "./attention";

export const rms = (v: number[]) => Math.sqrt(v.reduce((s, x) => s + x * x, 0) / v.length);
export const rmsNorm = (M: number[][]) => M.map((r) => { const s = rms(r); return r.map((x) => x / s); });
const erf = (x: number) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
export const gelu = (z: number) => 0.5 * z * (1 + erf(z / Math.SQRT2));

/** The toy block: identity Q/K/V/O, RMSNorm without gain, ReLU FFN of width 4. */
export const TOK = [[1, 0], [0, 1], [1, 1]], POS = [[0, 0], [0.5, 0], [0, 0.5]];
export const W1 = [[1, -1, 0, 1], [0, 1, -1, 1]], W2 = [[0.5, 0], [0, 0.5], [-0.5, 0], [0, -0.5]];
export function toyBlock(causal = false) {
  const x = TOK.map((t, i) => t.map((v, j) => v + POS[i][j]));
  const n1 = rmsNorm(x), sd = Math.SQRT2;
  const scores = n1.map((q, i) => n1.map((k, j) => (causal && j > i ? -Infinity : (q[0] * k[0] + q[1] * k[1]) / sd)));
  const w = scores.map(softmax), attn = w.map((r) => [0, 1].map((c) => r.reduce((s, a, j) => s + a * n1[j][c], 0)));
  const h = x.map((r, i) => r.map((v, c) => v + attn[i][c])), n2 = rmsNorm(h);
  const hid = n2.map((r) => W1[0].map((_, u) => r[0] * W1[0][u] + r[1] * W1[1][u]));
  const act = hid.map((r) => r.map((v) => Math.max(0, v)));
  const ffn = act.map((r) => [0, 1].map((c) => r.reduce((s, a, u) => s + a * W2[u][c], 0)));
  const y = h.map((r, i) => r.map((v, c) => v + ffn[i][c]));
  return { x, n1, scores, w, attn, h, n2, hid, act, ffn, y };
}

/** Gradient through a scalar stack of F(x) = tanh(w x), plain or residual. */
export function stackGradient(depth: number, w = 0.5, linear = false) {
  const F = (x: number) => (linear ? 0.5 * x : Math.tanh(w * x)), dF = (x: number) => (linear ? 0.5 : w * (1 - Math.tanh(w * x) ** 2));
  const run = (res: boolean) => { let x = 1, g = 1; const rows: { x: number; f: number; factor: number; g: number }[] = []; for (let i = 0; i < depth; i++) { const f = dF(x), factor = res ? 1 + f : f; g *= factor; rows.push({ x, f, factor, g }); x = res ? x + F(x) : F(x); } return rows; };
  return { plain: run(false), res: run(true) };
}

export const sinPE = (p: number, j: number, d: number) => { const i = Math.floor(j / 2), a = p / 10000 ** ((2 * i) / d); return j % 2 ? Math.cos(a) : Math.sin(a); };
export const rotate = ([a, b]: number[], ang: number) => [a * Math.cos(ang) - b * Math.sin(ang), a * Math.sin(ang) + b * Math.cos(ang)];

export function gptParams(o: { L: number; d: number; V: number; T: number; rope?: boolean; untied?: boolean }) {
  const attn = 4 * o.d * o.d + 4 * o.d, ffn = 8 * o.d * o.d + 5 * o.d, norms = 4 * o.d, block = attn + ffn + norms;
  const token = o.V * o.d, pos = o.rope ? 0 : o.T * o.d, finalNorm = 2 * o.d, head = o.untied ? o.V * o.d : 0;
  return { attn, ffn, norms, block, blocks: o.L * block, token, pos, finalNorm, head, total: o.L * block + token + pos + finalNorm + head };
}
