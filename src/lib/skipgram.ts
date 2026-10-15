// A tiny skip-gram with negative sampling, for the Foundations post on
// embeddings: eight words, sixteen (word, neighbour) pairs, 2-D vectors,
// seeded so every number in the post can be reproduced.
import { mulberry } from "./tiny-net";

export const VOCAB = ["cat", "dog", "milk", "ball", "car", "bus", "fuel", "road"];
const SENT = [["cat", "milk"], ["dog", "milk"], ["cat", "ball"], ["dog", "ball"], ["car", "fuel"], ["bus", "fuel"], ["car", "road"], ["bus", "road"]];
export const PAIRS = SENT.flatMap(([a, b]) => [[VOCAB.indexOf(a), VOCAB.indexOf(b)], [VOCAB.indexOf(b), VOCAB.indexOf(a)]]);
export const sig = (s: number) => 1 / (1 + Math.exp(-s));
export const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1];
export const cos = (a: number[], b: number[]) => dot(a, b) / (Math.hypot(...a) * Math.hypot(...b));

export interface PairLog { w: number; c: number; negs: number[]; rows: { t: number; label: number; d: number; p: number; g: number }[] }

export function makeModel(seed = 42, eta = 0.1, k = 2) {
  const r = mulberry(seed);
  const v = VOCAB.map(() => [r() - 0.5, r() - 0.5]), u = VOCAB.map(() => [r() - 0.5, r() - 0.5]);
  let pair = 0, epoch = 0;
  /** Train on the next pair; returns what happened, for display. */
  function step(): PairLog {
    const [w, c] = PAIRS[pair], negs: number[] = [];
    while (negs.length < k) { const n = Math.floor(r() * 8); if (n !== c && n !== w) negs.push(n); }
    const vw = [...v[w]], grad = [0, 0], rows: PairLog["rows"] = [];
    [[c, 1], ...negs.map((n) => [n, 0])].forEach(([t, label]) => {
      const d = dot(vw, u[t]), p = sig(d), g = p - label;
      rows.push({ t, label, d, p, g });
      grad[0] += g * u[t][0]; grad[1] += g * u[t][1];
      u[t] = [u[t][0] - eta * g * vw[0], u[t][1] - eta * g * vw[1]];
    });
    v[w] = [v[w][0] - eta * grad[0], v[w][1] - eta * grad[1]];
    pair = (pair + 1) % PAIRS.length; if (pair === 0) epoch++;
    return { w, c, negs, rows };
  }
  return { v, u, step, get epoch() { return epoch; }, get pair() { return pair; } };
}
