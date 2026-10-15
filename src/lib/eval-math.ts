// Small numeric helpers shared by the speech-evaluation figures: edit distance
// with a backtrace, ranks, Spearman, and a seeded generator for simulations.

export type Op = "match" | "sub" | "del" | "ins";
export type Step = { op: Op; ref?: string; hyp?: string; i: number; j: number };

/** Levenshtein table D[i][j] over token arrays, plus the cheapest alignment. */
export function editDistance(ref: string[], hyp: string[]) {
  const D = Array.from({ length: ref.length + 1 }, (_, i) =>
    Array.from({ length: hyp.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= ref.length; i++)
    for (let j = 1; j <= hyp.length; j++)
      D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (ref[i - 1] === hyp[j - 1] ? 0 : 1));
  // Backtrace from the corner; prefer diagonal moves, then deletions.
  const path: Step[] = [];
  let i = ref.length, j = hyp.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + (ref[i - 1] === hyp[j - 1] ? 0 : 1)) {
      path.push({ op: ref[i - 1] === hyp[j - 1] ? "match" : "sub", ref: ref[i - 1], hyp: hyp[j - 1], i, j });
      i--; j--;
    } else if (i > 0 && D[i][j] === D[i - 1][j] + 1) {
      path.push({ op: "del", ref: ref[i - 1], i, j });
      i--;
    } else {
      path.push({ op: "ins", hyp: hyp[j - 1], i, j });
      j--;
    }
  }
  path.reverse();
  const count = { sub: 0, del: 0, ins: 0 };
  path.forEach((s) => { if (s.op !== "match") count[s.op]++; });
  return { D, path, count, dist: D[ref.length][hyp.length] };
}

/** Average ranks (1-based), ties share their mean rank. */
export function ranks(xs: number[]) {
  const idx = xs.map((x, i) => [x, i] as const).sort((a, b) => a[0] - b[0]);
  const r = new Array(xs.length);
  for (let k = 0; k < idx.length; ) {
    let m = k;
    while (m + 1 < idx.length && idx[m + 1][0] === idx[k][0]) m++;
    for (let t = k; t <= m; t++) r[idx[t][1]] = (k + m) / 2 + 1;
    k = m + 1;
  }
  return r as number[];
}

export function pearson(a: number[], b: number[]) {
  const n = a.length, ma = a.reduce((s, x) => s + x, 0) / n, mb = b.reduce((s, x) => s + x, 0) / n;
  let sab = 0, saa = 0, sbb = 0;
  for (let i = 0; i < n; i++) { sab += (a[i] - ma) * (b[i] - mb); saa += (a[i] - ma) ** 2; sbb += (b[i] - mb) ** 2; }
  return sab / Math.sqrt(saa * sbb || 1);
}

export const spearman = (a: number[], b: number[]) => pearson(ranks(a), ranks(b));

/** Linear congruential generator: the same seed gives every reader the same first view. */
export function rng(seed: number) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}

export function gauss(r: () => number) {
  const u = Math.max(r(), 1e-12), v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
