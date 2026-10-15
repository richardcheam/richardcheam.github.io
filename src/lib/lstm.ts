// One-unit LSTM and GRU for the Foundations post on gated recurrent cells:
// the forward equations, and an LSTM echo trainer with full backpropagation
// through time (same task as the plain RNN in src/lib/rnn.ts).

export const sig = (z: number) => 1 / (1 + Math.exp(-z));
export type Gate = "f" | "i" | "g" | "o";
export const GATES: Gate[] = ["f", "i", "g", "o"];
export interface LstmW { w: Record<Gate, number>; u: Record<Gate, number>; b: Record<Gate, number>; v: number }

export function lstmForward(W: LstmW, xs: number[]) {
  let h = 0, c = 0;
  return xs.map((x) => {
    const pre = Object.fromEntries(GATES.map((k) => [k, W.w[k] * x + W.u[k] * h + W.b[k]])) as Record<Gate, number>;
    const f = sig(pre.f), i = sig(pre.i), g = Math.tanh(pre.g), o = sig(pre.o), cPrev = c, hPrev = h;
    c = f * c + i * g; const tc = Math.tanh(c); h = o * tc;
    return { x, f, i, g, o, c, tc, h, cPrev, hPrev, pre };
  });
}

/** Scalar GRU in Chung et al.'s form: h = (1 − z) h_prev + z h̃, reset applied before the recurrent weight. */
export function gruForward(p: { wz: number; uz: number; bz: number; wr: number; ur: number; br: number; wh: number; uh: number; bh: number }, xs: number[]) {
  let h = 0;
  return xs.map((x) => {
    const z = sig(p.wz * x + p.uz * h + p.bz), r = sig(p.wr * x + p.ur * h + p.br), rh = r * h, cand = Math.tanh(p.wh * x + p.uh * rh + p.bh), hPrev = h;
    h = (1 - z) * hPrev + z * cand;
    return { x, z, r, rh, cand, kept: (1 - z) * hPrev, written: z * cand, h, hPrev };
  });
}

/** Echo task with a one-unit LSTM: start w = v = 0.5, u = 0, biases 0 except b_f. */
export function echoLstm(T: number, bf: number, eta = 0.3) {
  const W: LstmW = { w: { f: 0.5, i: 0.5, g: 0.5, o: 0.5 }, u: { f: 0, i: 0, g: 0, o: 0 }, b: { f: bf, i: 0, g: 0, o: 0 }, v: 0.5 };
  function evaluate() {
    const gw = { f: 0, i: 0, g: 0, o: 0 }, gu = { f: 0, i: 0, g: 0, o: 0 }, gb = { f: 0, i: 0, g: 0, o: 0 };
    let L = 0, gv = 0;
    for (const s of [1, -1]) {
      const xs = [s, ...Array(T - 1).fill(0)], fw = lstmForward(W, xs), hT = fw[T - 1].h, e = W.v * hT - s;
      L += (0.5 * e * e) / 2; gv += (e * hT) / 2;
      let dh = (e * W.v) / 2, dc = 0;
      for (let t = T - 1; t >= 0; t--) {
        const r = fw[t];
        const dO = dh * r.tc; dc += dh * r.o * (1 - r.tc ** 2);
        const dz = { f: dc * r.cPrev * r.f * (1 - r.f), i: dc * r.g * r.i * (1 - r.i), g: dc * r.i * (1 - r.g ** 2), o: dO * r.o * (1 - r.o) };
        let dhPrev = 0;
        for (const k of GATES) { gw[k] += dz[k] * r.x; gu[k] += dz[k] * r.hPrev; gb[k] += dz[k]; dhPrev += dz[k] * W.u[k]; }
        dc = dc * r.f; dh = dhPrev;
      }
    }
    return { L, gw, gu, gb, gv };
  }
  function step() {
    const e = evaluate();
    for (const k of GATES) { W.w[k] -= eta * e.gw[k]; W.u[k] -= eta * e.gu[k]; W.b[k] -= eta * e.gb[k]; }
    W.v -= eta * e.gv;
    return e;
  }
  return { W, evaluate, step, cells: (s: number) => lstmForward(W, [s, ...Array(T - 1).fill(0)]).map((r) => r.c) };
}
