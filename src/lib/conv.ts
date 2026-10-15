// Convolution arithmetic for the Foundations post on convolutions. Like
// every deep learning library, "convolution" here is cross-correlation: the
// kernel is not flipped.

export interface ConvOpts { pl?: number; pr?: number; s?: number; d?: number }

/** 1-D cross-correlation with zero padding, stride and dilation. Returns each output's input positions too. */
export function conv1d(x: number[], w: number[], o: ConvOpts = {}) {
  const pl = o.pl ?? 0, pr = o.pr ?? 0, s = o.s ?? 1, d = o.d ?? 1, k = w.length;
  const padded = [...Array(pl).fill(0), ...x, ...Array(pr).fill(0)];
  const span = d * (k - 1) + 1, n = Math.floor((padded.length - span) / s) + 1;
  const out: number[] = [], taps: number[][] = [];
  for (let i = 0; i < Math.max(0, n); i++) {
    const idx = w.map((_, j) => i * s + j * d);
    taps.push(idx);
    out.push(idx.reduce((acc, p, j) => acc + w[j] * padded[p], 0));
  }
  return { padded, out, taps };
}

/** Output length rule, as in PyTorch's Conv1d. */
export const outLen = (L: number, k: number, p: number, s: number, d: number) => Math.floor((L + 2 * p - d * (k - 1) - 1) / s) + 1;

/** Valid 2-D cross-correlation. */
export function conv2d(x: number[][], w: number[][]) {
  const k = w.length, n = x.length - k + 1, m = x[0].length - k + 1;
  return Array.from({ length: n }, (_, r) => Array.from({ length: m }, (_, c) => w.reduce((acc, row, i) => acc + row.reduce((a2, v, j) => a2 + v * x[r + i][c + j], 0), 0)));
}

/** Receptive field and jump after each layer. */
export function receptive(layers: { k: number; s: number; d: number }[]) {
  let r = 1, J = 1;
  return layers.map(({ k, s, d }) => { r = r + (d * (k - 1)) * J; J = J * s; return { r, J }; });
}

/** Round away float noise for display. */
export const clean = (v: number) => Math.round(v * 1e6) / 1e6;
