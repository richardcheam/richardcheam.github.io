// The one-unit recurrent network of the Foundations post on recurrent
// networks: h_t = tanh(w_x x_t + w_h h_{t−1} + b), backpropagation through
// time, and the deterministic "remember the first input" trainer.

export function rnnForward(wx: number, wh: number, b: number, xs: number[]) {
  let h = 0;
  const out: { z: number; h: number; hPrev: number }[] = [];
  for (const x of xs) { const z = wx * x + wh * h + b, hPrev = h; h = Math.tanh(z); out.push({ z, h, hPrev }); }
  return out;
}

/** Echo task: x = (s, 0, …, 0) of length T, target s at the end, loss ½(y − s)² averaged over s = ±1. */
export function echoModel(T: number, wh0: number, eta: number) {
  let wx = 0.5, wh = wh0, wo = 0.5, pass = 0;
  function evaluate() {
    let L = 0, gx = 0, gh = 0, go = 0;
    for (const s of [1, -1]) {
      const xs = [s, ...Array(T - 1).fill(0)], f = rnnForward(wx, wh, 0, xs), hT = f[T - 1].h, y = wo * hT, e = y - s;
      L += 0.5 * e * e / 2; go += (e * hT) / 2;
      let dh = (e * wo) / 2;
      for (let k = T - 1; k >= 0; k--) { const dz = dh * (1 - f[k].h ** 2); gx += dz * xs[k]; gh += dz * f[k].hPrev; dh = dz * wh; }
    }
    return { L, gx, gh, go };
  }
  function step() { const e = evaluate(); wx -= eta * e.gx; wh -= eta * e.gh; wo -= eta * e.go; pass++; return e; }
  return { evaluate, step, get w() { return { wx, wh, wo }; }, get pass() { return pass; }, hidden: (s: number) => rnnForward(wx, wh, 0, [s, ...Array(T - 1).fill(0)]).map((r) => r.h) };
}
