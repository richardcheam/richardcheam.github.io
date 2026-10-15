// The eight-point polynomial toy of the Foundations post on regularisation:
// fixed noisy samples of sin(2πx), least-squares and ridge fits of any degree
// (solved with Householder QR, since degree 7 is badly conditioned), and
// plain gradient descent for the early-stopping curve.

export const TRAIN_X = Array.from({ length: 8 }, (_, i) => i / 7);
export const TRAIN_Y = [-0.13, 0.75, 1.3, 0.56, -0.76, -0.97, -0.9, 0.03];
export const VAL_X = Array.from({ length: 7 }, (_, i) => (2 * i + 1) / 14);
export const VAL_Y = [0.11, 1.02, 0.83, 0.32, -0.72, -0.87, -0.73];

export const powers = (x: number, d: number) => Array.from({ length: d + 1 }, (_, j) => x ** j);
export const predict = (w: number[], x: number) => w.reduce((s, c, j) => s + c * x ** j, 0);
export const mse = (w: number[], xs: number[], ys: number[]) => xs.reduce((s, x, i) => s + (predict(w, x) - ys[i]) ** 2, 0) / xs.length;

/** Least squares min |A w − b|² by Householder QR. */
function lstsq(A: number[][], b: number[]) {
  const m = A.length, n = A[0].length, R = A.map((r) => [...r]), y = [...b];
  for (let k = 0; k < n; k++) {
    let norm = 0;
    for (let i = k; i < m; i++) norm += R[i][k] ** 2;
    norm = Math.sqrt(norm);
    if (norm === 0) continue;
    const alpha = R[k][k] > 0 ? -norm : norm, v = Array(m).fill(0);
    v[k] = R[k][k] - alpha;
    for (let i = k + 1; i < m; i++) v[i] = R[i][k];
    const vv = v.reduce((s, x) => s + x * x, 0);
    if (vv === 0) continue;
    for (let j = k; j < n; j++) { let d = 0; for (let i = k; i < m; i++) d += v[i] * R[i][j]; for (let i = k; i < m; i++) R[i][j] -= (2 * d * v[i]) / vv; }
    let d = 0; for (let i = k; i < m; i++) d += v[i] * y[i]; for (let i = k; i < m; i++) y[i] -= (2 * d * v[i]) / vv;
  }
  const w = Array(n).fill(0);
  for (let k = n - 1; k >= 0; k--) { let s = y[k]; for (let j = k + 1; j < n; j++) s -= R[k][j] * w[j]; w[k] = s / R[k][k]; }
  return w;
}

/**
 * Weights of degree d minimising training MSE + (λ/2) Σ_{j≥1} w_j². The
 * penalty becomes extra rows √(4λ) e_j, since MSE averages over 8 points.
 */
export function fit(d: number, lambda = 0) {
  const A = TRAIN_X.map((x) => powers(x, d)), b = [...TRAIN_Y];
  if (lambda > 0) for (let j = 1; j <= d; j++) { const r = Array(d + 1).fill(0); r[j] = Math.sqrt((lambda / 2) * TRAIN_X.length); A.push(r); b.push(0); }
  return lstsq(A, b);
}

/** Full-batch gradient descent on the degree-d training MSE from zero weights; logs at `marks`. */
export function descend(d: number, eta: number, epochs: number, every = 1) {
  const X = TRAIN_X.map((x) => powers(x, d)), n = X.length;
  let w = Array(d + 1).fill(0), best = { epoch: 0, val: Infinity, train: 0, w };
  const log: { epoch: number; train: number; val: number }[] = [];
  for (let e = 1; e <= epochs; e++) {
    const r = X.map((row, i) => row.reduce((s, x, j) => s + x * w[j], 0) - TRAIN_Y[i]);
    w = w.map((wj, j) => wj - (eta * 2 * X.reduce((s, row, i) => s + row[j] * r[i], 0)) / n);
    if (e % every === 0 || e === 1) {
      const tr = mse(w, TRAIN_X, TRAIN_Y), va = mse(w, VAL_X, VAL_Y);
      log.push({ epoch: e, train: tr, val: va });
      if (va < best.val) best = { epoch: e, val: va, train: tr, w: [...w] };
    }
  }
  return { log, best, w };
}
