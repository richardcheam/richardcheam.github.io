// The baked glyph autoencoders of the Foundations post on autoencoders and
// VAEs (trained offline with NumPy, seed 12; see src/data/foundations).
import G from "../data/foundations/glyph-autoencoders.json";

export const GLYPHS = G.glyphs as number[][], NAMES = G.names as string[];
export type Model = "plain" | "vae";
export const codes = (m: Model) => G[m].codes as number[][];
export const priorNear = (m: Model) => G[m].priorNear as number;

/** The VAE encoder's spread σ for each training glyph (its centre is codes("vae")). */
export const sigmas = () => G.vae.sigma as number[][];
/** The decoder's 16 hidden values for a code z. */
export function decodeHidden(m: Model, z: number[]) {
  const P = G[m];
  return P.b3.map((b: number, j: number) => Math.tanh(z[0] * P.W3[0][j] + z[1] * P.W3[1][j] + b)) as number[];
}
export function decode(m: Model, z: number[]) {
  const P = G[m];
  const h = decodeHidden(m, z);
  return P.b4.map((b: number, k: number) => 1 / (1 + Math.exp(-(h.reduce((s: number, v: number, j: number) => s + v * P.W4[j][k], 0) + b))));
}
export function nearest(img: number[]) {
  let best = 0, bd = Infinity;
  GLYPHS.forEach((g, i) => { const d = g.reduce((s, v, k) => s + (v - img[k]) ** 2, 0); if (d < bd) { bd = d; best = i; } });
  return { i: best, d: bd };
}
/** A 5 × 5 glyph as SVG cells, grey levels from the values. */
export function glyphSvg(img: number[], x: number, y: number, cell: number) {
  return img.map((v, k) => { const g = Math.round(245 - v * 215); return `<rect x="${x + (k % 5) * cell}" y="${y + Math.floor(k / 5) * cell}" width="${cell - 1}" height="${cell - 1}" fill="rgb(${g},${g},${g})"/>`; }).join("");
}
