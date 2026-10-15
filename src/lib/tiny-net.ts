// The tiny network of the Foundations post on neurons and backpropagation:
// 2 inputs, 2 ReLU hidden neurons, 1 linear output, loss ½(ŷ − y)².
// Shared by the forward, backward and update figures so they always agree.

export interface Net { W: number[][]; b: number[]; v: number[]; c: number }
export const NET0: Net = { W: [[0.5, 0.25], [-1, 0.5]], b: [0, 0.5], v: [1, -1], c: 0.25 };
export const X0 = [1, 2], Y0 = 1, ETA0 = 0.1;

export const relu = (z: number) => Math.max(0, z);
export const clone = (n: Net): Net => ({ W: n.W.map((r) => [...r]), b: [...n.b], v: [...n.v], c: n.c });

export function forward(n: Net, x: number[], y: number) {
  const z = n.W.map((r, i) => r[0] * x[0] + r[1] * x[1] + n.b[i]);
  const h = z.map(relu);
  const yh = n.v[0] * h[0] + n.v[1] * h[1] + n.c;
  const err = yh - y;
  return { z, h, yh, err, L: 0.5 * err * err };
}
export type Fwd = ReturnType<typeof forward>;

export function backward(n: Net, f: Fwd, x: number[]) {
  const dyh = f.err;
  const dv = f.h.map((h) => dyh * h), dc = dyh;
  const dh = n.v.map((v) => dyh * v);
  const slope = f.z.map((z) => (z > 0 ? 1 : 0));
  const dz = dh.map((d, i) => d * slope[i]);
  const dW = dz.map((d) => [d * x[0], d * x[1]]);
  const db = [...dz];
  return { dyh, dv, dc, dh, slope, dz, dW, db };
}
export type Bwd = ReturnType<typeof backward>;

export function update(n: Net, g: Bwd, eta: number): Net {
  return {
    W: n.W.map((r, i) => r.map((w, j) => w - eta * g.dW[i][j])),
    b: n.b.map((b, i) => b - eta * g.db[i]),
    v: n.v.map((v, i) => v - eta * g.dv[i]),
    c: n.c - eta * g.dc,
  };
}

/** Loss after each of `steps` updates on the single example, starting from `n`. */
export function lossCurve(n: Net, x: number[], y: number, eta: number, steps = 20) {
  const out = [forward(n, x, y).L];
  let m = clone(n);
  for (let s = 0; s < steps; s++) {
    const f = forward(m, x, y);
    m = update(m, backward(m, f, x), eta);
    out.push(forward(m, x, y).L);
  }
  return out;
}

/** Readable numbers: up to `d` decimals, trailing zeros dropped, a true minus sign. */
export function fmt(v: number, d = 5) {
  if (!Number.isFinite(v)) return v > 0 ? "∞" : "−∞";
  // Round halves away from zero for both signs, so −0.8775 reads −0.878 like 0.8775 reads 0.878.
  let s = (Math.sign(v) * Math.round(Math.abs(v) * 10 ** d) / 10 ** d).toFixed(d).replace(/\.?0+$/, "");
  if (s === "-0") s = "0";
  return s.replace("-", "−");
}
/** A number in brackets when negative, for products like "−0.25 × (−1)". */
export const par = (v: number, d = 5) => (v < 0 ? `(${fmt(v, d)})` : fmt(v, d));

// The XOR trainer: 2 inputs, H hidden neurons, a sigmoid output, loss
// ½(ŷ − y)² averaged over the four points, full-batch gradient descent.
export const XOR = [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]];
export function mulberry(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export type Act = "tanh" | "relu" | "linear";
const act = (a: Act, z: number) => (a === "tanh" ? Math.tanh(z) : a === "relu" ? Math.max(0, z) : z);
const dact = (a: Act, z: number, h: number) => (a === "tanh" ? 1 - h * h : a === "relu" ? (z > 0 ? 1 : 0) : 1);
const sig = (z: number) => 1 / (1 + Math.exp(-z));

export function xorNet(seed: number, H: number) {
  const r = mulberry(seed), u = () => r() * 2 - 1;
  return { W: Array.from({ length: H }, () => [u(), u()]), b: Array.from({ length: H }, u), v: Array.from({ length: H }, u), c: u() };
}
export type XorNet = ReturnType<typeof xorNet>;
export function xorPredict(n: XorNet, a: Act, x1: number, x2: number) {
  const z = n.W.map((w, j) => w[0] * x1 + w[1] * x2 + n.b[j]);
  const h = z.map((v) => act(a, v));
  return { z, h, yh: sig(h.reduce((s, v, j) => s + v * n.v[j], n.c)) };
}
export function xorLoss(n: XorNet, a: Act) {
  return XOR.reduce((s, [x1, x2, y]) => s + 0.5 * (xorPredict(n, a, x1, x2).yh - y) ** 2, 0) / 4;
}
export const xorAllRight = (n: XorNet, a: Act) => XOR.every(([x1, x2, y]) => (xorPredict(n, a, x1, x2).yh > 0.5) === (y === 1));
/** One epoch: forward and backward on all four points, average, update in place. */
export function xorEpoch(n: XorNet, a: Act, eta: number) {
  const H = n.v.length, gW = n.W.map(() => [0, 0]), gb = Array(H).fill(0), gv = Array(H).fill(0);
  let gc = 0;
  for (const [x1, x2, y] of XOR) {
    const p = xorPredict(n, a, x1, x2);
    const dl = ((p.yh - y) / 4) * p.yh * (1 - p.yh);
    gc += dl;
    for (let j = 0; j < H; j++) {
      gv[j] += dl * p.h[j];
      const dz = dl * n.v[j] * dact(a, p.z[j], p.h[j]);
      gW[j][0] += dz * x1; gW[j][1] += dz * x2; gb[j] += dz;
    }
  }
  for (let j = 0; j < H; j++) { n.W[j][0] -= eta * gW[j][0]; n.W[j][1] -= eta * gW[j][1]; n.b[j] -= eta * gb[j]; n.v[j] -= eta * gv[j]; }
  n.c -= eta * gc;
}
