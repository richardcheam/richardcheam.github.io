// Shared maths for the flow matching review figures (Lipman et al. 2023).
// Data is point data: K centres, equal weights. Conditional paths are Gaussian,
// p_t(x | c) = N(a_t c, s_t^2 I), so Theorem 3 (Eq 15) gives
// u_t(x | c) = (s_t' / s_t)(x - a_t c) + a_t' c, and Eq 8 averages them.

export type Path = "ot" | "vp";
export type Vec = [number, number];

/** Seeded uniform generator (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal sampler built on a seeded generator (Box-Muller). */
export function gauss(seed: number) {
  const u = rng(seed);
  return () => Math.sqrt(-2 * Math.log(u() || 1e-12)) * Math.cos(2 * Math.PI * u());
}

/** The eight data points: a circle of radius 4 at angles k * 45 degrees. */
export const RING: Vec[] = Array.from({ length: 8 }, (_, k) => [4 * Math.cos((k * Math.PI) / 4), 4 * Math.sin((k * Math.PI) / 4)]);
export const RING_COLORS = ["#a33b3b", "#b8722c", "#8a7a1f", "#4F5D3A", "#2f6f6a", "#35588a", "#594578", "#8a3f6e"];

export const SIGMA_MIN = 0.01;
const BMIN = 0.1, BMAX = 20;
/** VP schedule from App E.1: T(s) = 0.1 s + 9.95 s^2, beta(s) = 0.1 + 19.9 s. */
export const vpT = (s: number) => BMIN * s + 0.5 * s * s * (BMAX - BMIN);
export const vpBeta = (s: number) => BMIN + s * (BMAX - BMIN);

/** Data coefficient a_t, noise width s_t and their time derivatives. */
export function coeffs(path: Path, t: number, smin = SIGMA_MIN) {
  if (path === "ot") return { a: t, da: 1, s: 1 - (1 - smin) * t, ds: -(1 - smin) };
  const r = 1 - t, a = Math.exp(-0.5 * vpT(r)), da = 0.5 * vpBeta(r) * a;
  const s = Math.sqrt(Math.max(1e-12, 1 - a * a)), ds = (-a * da) / s;
  return { a, da, s, ds };
}

/** Marginal velocity (Eq 8) at x for point data `cs`, plus the weights. */
export function marginal(path: Path, t: number, x: Vec, cs: Vec[] = RING, smin = SIGMA_MIN) {
  const { a, da, s, ds } = coeffs(path, t, smin);
  const logw = cs.map((c) => -((x[0] - a * c[0]) ** 2 + (x[1] - a * c[1]) ** 2) / (2 * s * s));
  const m = Math.max(...logw), w = logw.map((l) => Math.exp(l - m)), z = w.reduce((p, q) => p + q, 0);
  let u0 = 0, u1 = 0;
  cs.forEach((c, k) => {
    const wk = w[k] / z;
    u0 += wk * ((ds / s) * (x[0] - a * c[0]) + da * c[0]);
    u1 += wk * ((ds / s) * (x[1] - a * c[1]) + da * c[1]);
  });
  return { u: [u0, u1] as Vec, w: w.map((v) => v / z) };
}

export const T_END = 1 - 1e-5;

/** Reference steps: the VP field is stiff near t = 1 and needs many more. */
export const REF_STEPS = { ot: 200, vp: 4000 } as const;

/** Integrate the marginal ODE from t = 0 to T_END with a fixed-step solver. */
export function integrate(path: Path, x0: Vec, steps: number, solver: "euler" | "midpoint" | "rk4" = "rk4", keep = false, stride = 1) {
  const h = T_END / steps;
  let x: Vec = [x0[0], x0[1]];
  const traj: Vec[] = keep ? [[x[0], x[1]]] : [];
  const f = (t: number, p: Vec) => marginal(path, t, p).u;
  for (let k = 0; k < steps; k++) {
    const t = k * h;
    if (solver === "euler") {
      const v = f(t, x); x = [x[0] + h * v[0], x[1] + h * v[1]];
    } else if (solver === "midpoint") {
      const v1 = f(t, x), v2 = f(t + h / 2, [x[0] + (h / 2) * v1[0], x[1] + (h / 2) * v1[1]]);
      x = [x[0] + h * v2[0], x[1] + h * v2[1]];
    } else {
      const k1 = f(t, x);
      const k2 = f(t + h / 2, [x[0] + (h / 2) * k1[0], x[1] + (h / 2) * k1[1]]);
      const k3 = f(t + h / 2, [x[0] + (h / 2) * k2[0], x[1] + (h / 2) * k2[1]]);
      const k4 = f(t + h, [x[0] + h * k3[0], x[1] + h * k3[1]]);
      x = [x[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), x[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])];
    }
    if (keep && ((k + 1) % stride === 0 || k === steps - 1)) traj.push([x[0], x[1]]);
  }
  return keep ? traj : [x];
}

/** Draw n standard-normal 2-D points with a fixed seed. */
export function noiseCloud(n: number, seed = 7): Vec[] {
  const g = gauss(seed);
  return Array.from({ length: n }, () => [g(), g()] as Vec);
}

/** Straightness: distance from start to end divided by the length travelled. */
export function straightness(traj: Vec[]) {
  let len = 0;
  for (let i = 1; i < traj.length; i++) len += Math.hypot(traj[i][0] - traj[i - 1][0], traj[i][1] - traj[i - 1][1]);
  const a = traj[0], b = traj[traj.length - 1];
  return len ? Math.hypot(b[0] - a[0], b[1] - a[1]) / len : 1;
}

export const median = (v: number[]) => { const s = [...v].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
