// Tiny character models for the "whole model at a glance" figures of the
// Foundations RNN and LSTM posts: vocabulary h, e, l, o; input "hell",
// targets "ello". Weights were trained offline with NumPy (seeds 8 and 9)
// and rounded to one decimal; src/data/foundations/char-models.json.
import M from "../data/foundations/char-models.json";

export const VOCAB = ["h", "e", "l", "o"], INPUT = "hell", TARGET = "ello";
export const RNN = M.rnn as Record<string, number[][] | number[]>;
export const LSTM = M.lstm as Record<string, number[][] | number[]>;
const mv = (W: number[][], x: number[]) => W.map((r) => r.reduce((s, w, j) => s + w * x[j], 0));
export const onehot = (i: number) => VOCAB.map((_, k) => (k === i ? 1 : 0));
export function softmax(z: number[]) { const m = Math.max(...z), e = z.map((v) => Math.exp(v - m)), s = e.reduce((a, b) => a + b, 0); return e.map((v) => v / s); }
const sig = (v: number) => 1 / (1 + Math.exp(-v));

export interface RnnStep { x: number; hPrev: number[]; wx: number[]; wh: number[]; pre: number[]; h: number[]; z: number[]; p: number[]; y: number; loss: number }
export function rnnRun(chars = INPUT, targets = TARGET): RnnStep[] {
  const Wx = RNN.Wx as number[][], Wh = RNN.Wh as number[][], b = RNN.b as number[], Wy = RNN.Wy as number[][], c = RNN.c as number[];
  let h = [0, 0, 0];
  return [...chars].map((ch, t) => {
    const x = VOCAB.indexOf(ch), wx = mv(Wx, onehot(x)), wh = mv(Wh, h), pre = wx.map((v, i) => v + wh[i] + b[i]), hn = pre.map(Math.tanh);
    const z = mv(Wy, hn).map((v, i) => v + c[i]), p = softmax(z), y = VOCAB.indexOf(targets[t] ?? "o");
    const s = { x, hPrev: h, wx, wh, pre, h: hn, z, p, y, loss: -Math.log(p[y]) };
    h = hn; return s;
  });
}

export interface LstmStep { x: number; hPrev: number[]; cPrev: number[]; f: number[]; i: number[]; o: number[]; g: number[]; c: number[]; h: number[]; z: number[]; p: number[]; y: number; loss: number }
export function lstmRun(chars = INPUT, targets = TARGET): LstmStep[] {
  const W = LSTM.W as number[][], U = LSTM.U as number[][], b = LSTM.b as number[], Wy = LSTM.Wy as number[][], cy = LSTM.cy as number[];
  let h = [0, 0], c = [0, 0];
  return [...chars].map((ch, t) => {
    const x = VOCAB.indexOf(ch), a = mv(W, onehot(x)).map((v, k) => v + mv(U, h)[k] + b[k]);
    // Rows are stacked as forget, input, output, candidate (two of each).
    const f = a.slice(0, 2).map(sig), i = a.slice(2, 4).map(sig), o = a.slice(4, 6).map(sig), g = a.slice(6, 8).map(Math.tanh);
    const cn = c.map((v, k) => f[k] * v + i[k] * g[k]), hn = cn.map((v, k) => o[k] * Math.tanh(v));
    const z = mv(Wy, hn).map((v, k) => v + cy[k]), p = softmax(z), y = VOCAB.indexOf(targets[t] ?? "o");
    const s = { x, hPrev: h, cPrev: c, f, i, o, g, c: cn, h: hn, z, p, y, loss: -Math.log(p[y]) };
    h = hn; c = cn; return s;
  });
}
