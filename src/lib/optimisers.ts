// The optimisers of the Foundations post on SGD, momentum, RMSProp and Adam,
// written once so every figure and the checks in the post use the same code.
// The landscapes are bowls L = a w₁² + b w₂² with gradient (2a w₁, 2b w₂).

export type Vec = number[];
export type Kind = "plain" | "momentum" | "rmsprop" | "adam";
export interface Opts { eta: number; beta?: number; beta1?: number; beta2?: number; eps?: number; correct?: boolean }
export const EPS = 1e-8;

/** One optimiser's full state after a step, with every intermediate kept for display. */
export interface StepLog { t: number; w: Vec; g: Vec; state: Record<string, Vec>; step: Vec; next: Vec }

export function bowl(a: number, b: number) {
  return { L: (w: Vec) => a * w[0] ** 2 + b * w[1] ** 2, grad: (w: Vec) => [2 * a * w[0], 2 * b * w[1]] };
}

/** Run `n` steps of an optimiser from `w0`; `etaAt(t)` can apply a schedule (t from 1). */
export function run(kind: Kind, grad: (w: Vec) => Vec, w0: Vec, o: Opts, n: number, etaAt: (t: number) => number = () => o.eta): StepLog[] {
  const d = w0.length, eps = o.eps ?? EPS, out: StepLog[] = [];
  let w = [...w0], v = Array(d).fill(0), s = Array(d).fill(0), m = Array(d).fill(0);
  for (let t = 1; t <= n; t++) {
    const g = grad(w), eta = etaAt(t), state: Record<string, Vec> = {};
    let step: Vec;
    if (kind === "plain") step = g.map((x) => eta * x);
    else if (kind === "momentum") { v = v.map((x, i) => (o.beta ?? 0.9) * x + g[i]); state.v = [...v]; step = v.map((x) => eta * x); }
    else if (kind === "rmsprop") { const B = o.beta ?? 0.9; s = s.map((x, i) => B * x + (1 - B) * g[i] ** 2); state.s = [...s]; step = g.map((x, i) => (eta * x) / (Math.sqrt(s[i]) + eps)); }
    else {
      const b1 = o.beta1 ?? 0.9, b2 = o.beta2 ?? 0.999, c = o.correct ?? true;
      m = m.map((x, i) => b1 * x + (1 - b1) * g[i]); v = v.map((x, i) => b2 * x + (1 - b2) * g[i] ** 2);
      const c1 = c ? 1 - b1 ** t : 1, c2 = c ? 1 - b2 ** t : 1, mh = m.map((x) => x / c1), vh = v.map((x) => x / c2);
      state.m = [...m]; state.v = [...v]; state.mh = mh; state.vh = vh; state.c = [c1, c2];
      step = mh.map((x, i) => (eta * x) / (Math.sqrt(vh[i]) + eps));
    }
    const next = w.map((x, i) => x - step[i]);
    out.push({ t, w, g, state, step, next });
    w = next;
  }
  return out;
}

/** Nesterov momentum: the gradient is taken at the look-ahead point w − η β v. */
export function nesterov(grad: (w: Vec) => Vec, w0: Vec, eta: number, beta: number, n: number) {
  let w = [...w0], v = Array(w0.length).fill(0);
  const out: { look: Vec; g: Vec; v: Vec; next: Vec }[] = [];
  for (let t = 0; t < n; t++) {
    const look = w.map((x, i) => x - eta * beta * v[i]), g = grad(look);
    v = v.map((x, i) => beta * x + g[i]);
    w = w.map((x, i) => x - eta * v[i]);
    out.push({ look, g, v: [...v], next: [...w] });
  }
  return out;
}

/** The bumpy 1-D curve with a small dip near w = 3. */
export const hill = { L: (w: number) => 0.1 * w * w - 0.5 * Math.exp(-2 * (w - 3) ** 2), dL: (w: number) => 0.2 * w + 2 * (w - 3) * Math.exp(-2 * (w - 3) ** 2) };

/** Learning-rate schedules over T steps with peak `peak`. */
export const schedules = {
  step: (t: number, peak: number, m1 = 50, m2 = 75, f = 0.1) => peak * f ** ((t >= m1 ? 1 : 0) + (t >= m2 ? 1 : 0)),
  cosine: (t: number, peak: number, T = 100) => 0.5 * peak * (1 + Math.cos((Math.PI * Math.min(t, T)) / T)),
  warmup: (t: number, peak: number, T = 100, W = 10) => (t < W ? (peak * t) / W : 0.5 * peak * (1 + Math.cos((Math.PI * Math.min(t - W, T - W)) / (T - W)))),
};
