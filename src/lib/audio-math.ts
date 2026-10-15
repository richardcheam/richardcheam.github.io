// Small signal-processing kit for the audio-basics figures: FFT, Hann window,
// STFT, mel scale and filterbank, and a synthetic "see two" phrase.

export const hzToMel = (f: number) => 2595 * Math.log10(1 + f / 700);
export const melToHz = (m: number) => 700 * (10 ** (m / 2595) - 1);

export const hann = (n: number) => Float64Array.from({ length: n }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)));

/** Magnitudes of the real FFT of `x` zero-padded to `size` (a power of two); returns size/2+1 bins. */
export function fftMag(x: ArrayLike<number>, size: number) {
  const re = new Float64Array(size), im = new Float64Array(size);
  for (let i = 0; i < Math.min(x.length, size); i++) re[i] = x[i];
  for (let i = 1, j = 0; i < size; i++) {
    let bit = size >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= size; len <<= 1) {
    const a = (-2 * Math.PI) / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < size; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const p = i + k, q = p + len / 2;
        const tr = re[q] * cr - im[q] * ci, ti = re[q] * ci + im[q] * cr;
        re[q] = re[p] - tr; im[q] = im[p] - ti; re[p] += tr; im[p] += ti;
        [cr, ci] = [cr * wr - ci * wi, cr * wi + ci * wr];
      }
    }
  }
  return Float64Array.from({ length: size / 2 + 1 }, (_, k) => Math.hypot(re[k], im[k]));
}

export const nextPow2 = (n: number) => 2 ** Math.ceil(Math.log2(n));

/** Short-time magnitude spectra: one column per hop, bins spaced sr/window apart. */
export function stft(x: Float64Array, win: number, hop: number) {
  const w = hann(win), cols: Float64Array[] = [], frame = new Float64Array(win);
  for (let s = 0; s + win <= x.length; s += hop) {
    for (let i = 0; i < win; i++) frame[i] = x[s + i] * w[i];
    cols.push(dft(frame, win));
  }
  return cols;
}

/** Exact DFT magnitudes at k·sr/win (k = 0..win/2), via FFT when win is a power of two. */
function dft(frame: Float64Array, win: number) {
  if ((win & (win - 1)) === 0) return fftMag(frame, win);
  const half = Math.floor(win / 2), out = new Float64Array(half + 1);
  for (let k = 0; k <= half; k++) {
    let r = 0, i = 0;
    const a = (-2 * Math.PI * k) / win;
    for (let n = 0; n < win; n++) { r += frame[n] * Math.cos(a * n); i += frame[n] * Math.sin(a * n); }
    out[k] = Math.hypot(r, i);
  }
  return out;
}

/** Triangle filters evenly spaced in mel between 0 and fmax; weights over `bins` FFT bins. */
export function melBank(bands: number, bins: number, sr: number, fmax = sr / 2) {
  const top = hzToMel(fmax);
  const edges = Array.from({ length: bands + 2 }, (_, i) => melToHz((top * i) / (bands + 1)));
  const binHz = (sr / 2) / (bins - 1);
  return Array.from({ length: bands }, (_, b) => {
    const [lo, mid, hi] = [edges[b], edges[b + 1], edges[b + 2]];
    const w = new Float64Array(bins);
    for (let k = 0; k < bins; k++) {
      const f = k * binHz;
      w[k] = f <= lo || f >= hi ? 0 : f <= mid ? (f - lo) / (mid - lo) : (hi - f) / (hi - mid);
    }
    return { lo, mid, hi, w };
  });
}

/** Loudness of a vocal tract with formants at `fs` (Hz), as a 0..1 gain. */
export function formantGain(f: number, fs: number[]) {
  const bw = [90, 110, 150];
  let g = 0;
  fs.forEach((F, i) => { g += (i === 0 ? 1 : 0.7 - 0.15 * i) / (1 + ((f - F) / bw[i]) ** 2); });
  return Math.min(1, g) * Math.exp(-f / 6000) + 0.004;
}

export const VOWELS: Record<string, number[]> = {
  ee: [270, 2290, 3010],
  ah: [730, 1090, 2440],
  oo: [300, 870, 2240],
};

/** Deterministic noise. */
export function noise(seed = 7) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 31 - 1; };
}

/** A synthetic "see two" at `sr`: s-noise, ee, silence, t-burst, oo. Returns samples and segment times. */
export function seeTwo(sr = 16000, seconds = 1.2) {
  const n = Math.round(sr * seconds), x = new Float64Array(n), rnd = noise(11);
  let prev = 0;
  const seg = [
    { label: "s", a: 0.05, b: 0.25 },
    { label: "ee", a: 0.27, b: 0.6 },
    { label: "t", a: 0.7, b: 0.73 },
    { label: "oo", a: 0.75, b: 1.12 },
  ];
  const ramp = (t: number, a: number, b: number, r = 0.025) => Math.max(0, Math.min(1, (t - a) / r, (b - t) / r));
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr, w = rnd();
    // "s": high-passed noise (difference of neighbours).
    const hp = w - prev; prev = w;
    x[i] += 0.18 * hp * ramp(t, seg[0].a, seg[0].b, 0.04);
    // "t": a short broadband burst.
    x[i] += 0.5 * w * ramp(t, seg[2].a, seg[2].b, 0.004);
    // Vowels: harmonics of a gliding F0 shaped by the formants.
    const inEe = ramp(t, seg[1].a, seg[1].b), inOo = ramp(t, seg[3].a, seg[3].b);
    if (inEe || inOo) {
      const f0 = inEe ? 130 - 20 * ((t - seg[1].a) / (seg[1].b - seg[1].a)) : 115 - 10 * ((t - seg[3].a) / (seg[3].b - seg[3].a));
      phase += (2 * Math.PI * f0) / sr;
      const fs = inEe ? VOWELS.ee : VOWELS.oo;
      let v = 0;
      for (let h = 1; h * f0 < sr / 2; h++) v += formantGain(h * f0, fs) * Math.sin(h * phase) / Math.sqrt(h);
      x[i] += 0.12 * v * (inEe || inOo);
    }
  }
  return { x, seg };
}

/** Viridis-like colour ramp, t in 0..1. */
const STOPS = [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]];
export function ramp(t: number) {
  const u = Math.max(0, Math.min(1, t)) * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(u)), f = u - i;
  return STOPS[i].map((c, j) => Math.round(c + (STOPS[i + 1][j] - c) * f)) as [number, number, number];
}
