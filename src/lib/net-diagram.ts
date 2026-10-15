// Draws the tiny 2-2-1 network as SVG markup for the forward, backward and
// update figures. Each figure decides which values are revealed, which parts
// glow, and which gradients or blame labels appear for its current step.
import { fmt, type Net, type Fwd } from "./tiny-net";

export const INK = "#22302E", MUTED = "#6B7775", JADE = "#2F6E5F", NEG = "#B5533C", GOLD = "#9A7420", TINT = "#E3EFE9", DEAD = "#EEF0EF";

const P: Record<string, [number, number]> = { x1: [80, 90], x2: [80, 260], h1: [380, 90], h2: [380, 260], o: [590, 175] };
// Edge key, from, to, weight lookup, where its label sits along the edge.
const E: [string, string, string, (n: Net) => number, number, number][] = [
  ["w11", "x1", "h1", (n) => n.W[0][0], 0.5, -12],
  ["w21", "x1", "h2", (n) => n.W[1][0], 0.22, 22],
  ["w12", "x2", "h1", (n) => n.W[0][1], 0.22, -12],
  ["w22", "x2", "h2", (n) => n.W[1][1], 0.5, 22],
  ["v1", "h1", "o", (n) => n.v[0], 0.5, -12],
  ["v2", "h2", "o", (n) => n.v[1], 0.5, 22],
];
const SUB: Record<string, string> = { w11: "w₁₁", w12: "w₁₂", w21: "w₂₁", w22: "w₂₂", v1: "v₁", v2: "v₂", b1: "b₁", b2: "b₂", c: "c" };
const NAME: Record<string, string> = { x1: "x₁", x2: "x₂", h1: "h₁", h2: "h₂", o: "ŷ" };

export interface NetView {
  net: Net; x: number[]; y: number; f: Fwd;
  /** Revealed values: x1 x2 z1 h1 z2 h2 o err L. */
  show: Set<string>;
  /** Parts that glow: edge keys, node keys, b1 b2 c, y, L. Empty means nothing is dimmed. */
  hl: Set<string>;
  /** Gradients written under weights and biases, by key. */
  grads?: Map<string, number>;
  /** Blame labels beside nodes, by node key. */
  blame?: Map<string, string>;
  /** Updated network: weights are written "old → new". */
  next?: Net;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const t = (x: number, y: number, s: string, a = "") => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" ${a}>${esc(s)}</text>`;

export function netSvg(v: NetView) {
  const { net, f, show, hl } = v;
  const any = hl.size > 0, on = (k: string) => !any || hl.has(k);
  const dead = (i: number) => show.has(`z${i + 1}`) && f.z[i] <= 0;
  let s = "";
  // Edges: thickness follows the size of the weight, colour its sign.
  for (const [k, a, b, w, at, dy] of E) {
    const [x1, y1] = P[a], [x2, y2] = P[b], val = w(net), lit = hl.has(k);
    s += `<line x1="${x1 + 28}" y1="${y1}" x2="${x2 - 28}" y2="${y2}" stroke="${val >= 0 ? JADE : NEG}" stroke-width="${(1.4 + Math.abs(val) * 2.2).toFixed(1)}" stroke-opacity="${on(k) ? (lit ? 1 : 0.75) : 0.18}"/>`;
    if (lit) s += `<line x1="${x1 + 28}" y1="${y1}" x2="${x2 - 28}" y2="${y2}" stroke="${GOLD}" stroke-width="9" stroke-opacity="0.22" stroke-linecap="round"/>`;
    const lx = x1 + 28 + (x2 - x1 - 56) * at, ly = y1 + (y2 - y1) * (at + (at > 0.5 ? 0.02 : 0)) + dy;
    const nv = v.next ? w(v.next) : null;
    const label = nv !== null && Math.abs(nv - val) > 1e-12 ? `${SUB[k]} ${fmt(val)} → ${fmt(nv)}` : `${SUB[k]} = ${fmt(val)}`;
    s += t(lx, ly, label, `text-anchor="middle" font-size="12" font-weight="${lit ? 700 : 600}" fill="${on(k) ? INK : "#B9C0BF"}" paint-order="stroke" stroke="#fff" stroke-width="4"`);
    const g = v.grads?.get(k);
    if (g !== undefined) s += t(lx, ly + (dy < 0 ? -15 : 15), `∂L/∂${SUB[k]} = ${fmt(g)}`, `text-anchor="middle" font-size="11.5" font-weight="700" fill="${GOLD}" paint-order="stroke" stroke="#fff" stroke-width="4"`);
  }
  // Nodes.
  for (const k of ["x1", "x2", "h1", "h2", "o"]) {
    const [x, y] = P[k], lit = hl.has(k), i = k === "h1" ? 0 : 1;
    const val = k === "x1" ? v.x[0] : k === "x2" ? v.x[1] : k === "o" ? f.yh : f.h[i];
    const shown = show.has(k), isDead = k[0] === "h" && dead(i);
    s += `<circle cx="${x}" cy="${y}" r="28" fill="${isDead ? DEAD : lit ? TINT : "#fff"}" stroke="${lit ? JADE : INK}" stroke-width="${lit ? 3 : 1.5}" stroke-opacity="${on(k) ? 1 : 0.3}"/>`;
    s += t(x, y - 7, NAME[k], `text-anchor="middle" font-size="11" fill="${MUTED}"`);
    s += t(x, y + 11, shown ? fmt(val) : "?", `text-anchor="middle" font-size="14" font-weight="700" fill="${shown ? INK : "#B9C0BF"}"`);
    if (k[0] === "h") {
      const zk = `z${i + 1}`, bk = `b${i + 1}`;
      s += t(x, y - 38, show.has(zk) ? `z${i ? "₂" : "₁"} = ${fmt(f.z[i])}${isDead ? " → ReLU off" : ""}` : `z${i ? "₂" : "₁"} = ?`, `text-anchor="middle" font-size="11.5" font-weight="${hl.has(zk) ? 700 : 400}" fill="${isDead ? NEG : show.has(zk) ? INK : "#B9C0BF"}"`);
      s += t(x, y + 46, `${SUB[bk]} = ${fmt(v.next && Math.abs(v.next.b[i] - net.b[i]) > 1e-12 ? net.b[i] : net.b[i])}${v.next && Math.abs(v.next.b[i] - net.b[i]) > 1e-12 ? ` → ${fmt(v.next.b[i])}` : ""}`, `text-anchor="middle" font-size="11.5" font-weight="${hl.has(bk) ? 700 : 400}" fill="${on(bk) ? INK : "#B9C0BF"}"`);
      const g = v.grads?.get(bk);
      if (g !== undefined) s += t(x, y + 61, `∂L/∂${SUB[bk]} = ${fmt(g)}`, `text-anchor="middle" font-size="11.5" font-weight="700" fill="${GOLD}"`);
    }
    if (k === "o") {
      s += t(x, y + 46, `c = ${fmt(net.c)}${v.next && Math.abs(v.next.c - net.c) > 1e-12 ? ` → ${fmt(v.next.c)}` : ""}`, `text-anchor="middle" font-size="11.5" font-weight="${hl.has("c") ? 700 : 400}" fill="${on("c") ? INK : "#B9C0BF"}"`);
      const g = v.grads?.get("c");
      if (g !== undefined) s += t(x, y + 61, `∂L/∂c = ${fmt(g)}`, `text-anchor="middle" font-size="11.5" font-weight="700" fill="${GOLD}"`);
    }
    const bl = v.blame?.get(k);
    if (bl) {
      const lines = bl.split("\n"), up = k !== "h2";
      lines.forEach((ln, j) => { s += t(x + (k === "o" ? 0 : 34), (up ? y - 52 - (lines.length - 1 - j) * 14 : y + 80 + j * 14) + (k === "o" ? -8 : 0), ln, `text-anchor="${k === "o" ? "middle" : "start"}" font-size="11.5" font-weight="700" fill="${GOLD}"`); });
    }
  }
  // Target and loss on the right.
  const [ox, oy] = P.o;
  s += `<line x1="${ox + 28}" y1="${oy}" x2="652" y2="${oy}" stroke="${INK}" stroke-opacity="${on("L") ? 0.5 : 0.15}"/>`;
  s += `<rect x="652" y="${oy - 34}" width="96" height="68" rx="6" fill="${hl.has("L") ? TINT : "#fff"}" stroke="${hl.has("L") ? JADE : INK}" stroke-width="${hl.has("L") ? 2.5 : 1.2}" stroke-opacity="${on("L") ? 1 : 0.3}"/>`;
  s += t(700, oy - 16, "loss L", `text-anchor="middle" font-size="11" fill="${MUTED}"`);
  s += t(700, oy + 4, show.has("L") ? fmt(f.L) : "?", `text-anchor="middle" font-size="15" font-weight="700" fill="${show.has("L") ? INK : "#B9C0BF"}"`);
  s += t(700, oy + 22, show.has("err") ? `error ${fmt(f.err)}` : "½(ŷ − y)²", `text-anchor="middle" font-size="10.5" fill="${MUTED}"`);
  s += t(700, oy - 48, `target y = ${fmt(v.y)}`, `text-anchor="middle" font-size="12" font-weight="${hl.has("y") ? 700 : 400}" fill="${on("y") ? INK : "#B9C0BF"}"`);
  const bl = v.blame?.get("L");
  if (bl) s += t(700, oy + 54, bl, `text-anchor="middle" font-size="11.5" font-weight="700" fill="${GOLD}"`);
  return s;
}
