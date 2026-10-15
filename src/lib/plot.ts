// Small helpers for hand-drawn SVG charts in the Foundations figures: a
// coordinate box that maps data to pixels, gridlines with labels, and text.
import { fmt } from "./tiny-net";
import { MUTED } from "./net-diagram";

export interface Box { l: number; t: number; w: number; h: number; x0: number; x1: number; y0: number; y1: number }

export function frame(b: Box) {
  const X = (v: number) => b.l + ((v - b.x0) / (b.x1 - b.x0)) * b.w;
  const Y = (v: number) => b.t + b.h - ((v - b.y0) / (b.y1 - b.y0)) * b.h;
  const clampY = (v: number) => Math.max(b.t, Math.min(b.t + b.h, Y(v)));
  /** Gridlines at the given values; zero lines a little darker. */
  const grid = (xs: number[], ys: number[], d = 2) => {
    let s = "";
    for (const v of xs) s += `<line x1="${X(v)}" x2="${X(v)}" y1="${b.t}" y2="${b.t + b.h}" stroke="${v === 0 ? "#cfd5d4" : "#eef0f0"}"/><text x="${X(v)}" y="${b.t + b.h + 15}" font-size="10.5" text-anchor="middle" fill="${MUTED}">${fmt(v, d)}</text>`;
    for (const v of ys) s += `<line x1="${b.l}" x2="${b.l + b.w}" y1="${Y(v)}" y2="${Y(v)}" stroke="${v === 0 ? "#cfd5d4" : "#eef0f0"}"/><text x="${b.l - 6}" y="${Y(v) + 4}" font-size="10.5" text-anchor="end" fill="${MUTED}">${fmt(v, d)}</text>`;
    return s;
  };
  /** A polyline of f over the box's x range, clipped to its height. */
  const curve = (f: (x: number) => number, attrs: string, n = 200, from = b.x0, to = b.x1) =>
    `<polyline fill="none" ${attrs} points="${Array.from({ length: n + 1 }, (_, i) => { const x = from + ((to - from) * i) / n; return `${X(x).toFixed(1)},${clampY(f(x)).toFixed(1)}`; }).join(" ")}"/>`;
  return { X, Y, clampY, grid, curve };
}

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
export const txt = (x: number, y: number, s: string, a = "") => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" ${a}>${esc(s)}</text>`;
export const arrow = (x1: number, y1: number, x2: number, y2: number, col: string, w = 2) => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
  const p = (da: number) => `${(x2 - h * Math.cos(a + da)).toFixed(1)},${(y2 - h * Math.sin(a + da)).toFixed(1)}`;
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="${w}"/><polygon points="${x2.toFixed(1)},${y2.toFixed(1)} ${p(0.45)} ${p(-0.45)}" fill="${col}"/>`;
};

/** Contour ellipses of the bowl a w₁² + b w₂² = c, for each level c, centred on the origin. */
export function bowlContours(F: ReturnType<typeof frame>, a: number, b: number, levels: number[], col: string) {
  return levels.map((c) => `<ellipse cx="${F.X(0)}" cy="${F.Y(0)}" rx="${Math.abs(F.X(Math.sqrt(c / a)) - F.X(0))}" ry="${Math.abs(F.Y(Math.sqrt(c / b)) - F.Y(0))}" fill="none" stroke="${col}" stroke-opacity="0.3"/>`).join("");
}
export const OPT_COL = { plain: "#22302E", momentum: "#B5533C", rmsprop: "#3E6E9E", adam: "#9A7420" } as const;
export const OPT_NAME = { plain: "Plain descent", momentum: "Momentum", rmsprop: "RMSProp", adam: "Adam" } as const;
