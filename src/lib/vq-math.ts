// Shared maths for the residual vector quantization figures: nearest-entry
// lookup, the residual chain, and codebook health numbers.
export type P2 = [number, number];

export const sq = (a: P2, b: P2) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

/** Index of the nearest entry (squared Euclidean distance) and its distance. */
export function nearest(z: P2, book: P2[]) {
  let k = 0, d = Infinity;
  book.forEach((c, j) => { const q = sq(z, c); if (q < d) { d = q; k = j; } });
  return { k, d };
}

/** Run the residual chain through each codebook in turn. */
export function rvq(z: P2, books: P2[][]) {
  let r: P2 = [z[0], z[1]], zh: P2 = [0, 0];
  return books.map((book) => {
    const { k } = nearest(r, book), c = book[k], before = r;
    r = [r[0] - c[0], r[1] - c[1]]; zh = [zh[0] + c[0], zh[1] + c[1]];
    return { k, c, before, r, zh, err: r[0] ** 2 + r[1] ** 2 };
  });
}

/** Perplexity 2^H of the usage counts, and how many entries were used. */
export function health(counts: number[]) {
  const n = counts.reduce((a, b) => a + b, 0) || 1;
  const H = counts.reduce((h, c) => (c ? h - (c / n) * Math.log2(c / n) : h), 0);
  return { ppl: 2 ** H, used: counts.filter((c) => c > 0).length, H };
}

/** The worked example's three codebooks: each half the size of the last. */
export const TOY_BOOKS: P2[][] = [
  [[4, 0], [0, 4], [-4, 0], [0, -4]],
  [[1, 1], [-1, 1], [-1, -1], [1, -1]],
  [[0.5, 0], [0, 0.5], [-0.5, 0], [0, -0.5]],
];

export const PALETTE = ["#a33b3b", "#35588a", "#4F5D3A", "#b8722c", "#594578", "#2f6f6a", "#8a3f6e", "#8a7a1f"];
