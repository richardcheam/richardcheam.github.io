// Animated transitions between two renders of the same SVG. Figures redraw
// by replacing their markup, so a step change would otherwise jump. Take a
// snapshot before the redraw and call morph() after it:
//  - shapes are matched by tag and order; changed geometry, opacity and
//    colour glide from the old values to the new ones;
//  - text is matched by position; numbers count from the old value to the
//    new one (when the text keeps the same shape);
//  - anything new fades in, slightly staggered in drawing order.
import { reduce } from "./figure-motion";

const NUM_ATTRS = ["x", "y", "width", "height", "cx", "cy", "r", "rx", "ry", "x1", "y1", "x2", "y2", "fill-opacity", "stroke-opacity", "opacity", "stroke-width"];
const COLOR_ATTRS = ["fill", "stroke"];
const SHAPES = "rect,circle,ellipse,line,polyline,polygon,path";
const NUM = /[−-]?\d+(?:\.\d+)?/g;

interface Shape { tag: string; attrs: Record<string, string | null> }
export interface Snapshot { svgs: { shapes: Map<string, Shape>; texts: Map<string, string>; width: number }[] }

const running = new WeakMap<SVGSVGElement, () => void>();
const svgsOf = (root: Element) => Array.from(root.querySelectorAll<SVGSVGElement>("svg")).filter((s) => !s.parentElement?.closest("svg"));
const posKey = (t: Element) => `${Math.round(+(t.getAttribute("x") ?? 0))}:${Math.round(+(t.getAttribute("y") ?? 0))}`;
const shapeKeyed = (svg: SVGSVGElement) => { const count: Record<string, number> = {}; return Array.from(svg.querySelectorAll(SHAPES)).filter((el) => !el.closest("defs, marker, clipPath")).map((el) => { const tag = el.tagName; count[tag] = (count[tag] ?? 0) + 1; return [`${tag}:${count[tag]}`, el] as const; }); };

export function snapshot(root: Element): Snapshot {
  return {
    svgs: svgsOf(root).map((svg) => {
      running.get(svg)?.(); // finish any morph in flight so we read final values
      const shapes = new Map<string, Shape>();
      shapeKeyed(svg).forEach(([key, el]) => { const attrs: Record<string, string | null> = {}; [...NUM_ATTRS, ...COLOR_ATTRS, "points", "d"].forEach((a) => (attrs[a] = el.getAttribute(a))); shapes.set(key, { tag: el.tagName, attrs }); });
      const texts = new Map<string, string>();
      svg.querySelectorAll("text").forEach((t) => texts.set(posKey(t), t.textContent ?? ""));
      return { shapes, texts, width: svg.viewBox.baseVal?.width || 760 };
    }),
  };
}

function parseColor(c: string | null): number[] | null {
  if (!c) return null;
  let m = c.match(/^#([0-9a-f]{3})$/i);
  if (m) return [...m[1]].map((h) => parseInt(h + h, 16));
  m = c.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map((i) => parseInt(m![1].slice(i, i + 2), 16));
  m = c.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
  return m ? [+m[1], +m[2], +m[3]] : null;
}
const toNum = (s: string) => +s.replace("−", "-");
const decimals = (s: string) => (s.split(".")[1] ?? "").length;
const fmtLike = (v: number, like: string) => { const d = decimals(like); let s = v.toFixed(d); if (/^-0(\.0*)?$/.test(s)) s = s.slice(1); return like.includes("−") || (v < 0 && !like.includes("-")) ? s.replace("-", "−") : s; };
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Animate `root`'s SVGs from the snapshot to what is drawn now. */
export function morph(root: Element, snap: Snapshot, ms = 560) {
  if (reduce) return;
  svgsOf(root).forEach((svg, si) => {
    const old = snap.svgs[si];
    if (!old) return;
    const tweens: ((t: number) => void)[] = [], finals: (() => void)[] = [];
    let fresh = 0;
    const fadeIn = (el: Element) => {
      const delay = Math.min(fresh++ * 14, 520);
      (el as SVGElement).animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: ms * 0.8, delay, easing: "ease-out", fill: "backwards" });
    };
    shapeKeyed(svg).forEach(([key, el]) => {
      const o = old.shapes.get(key);
      if (!o) return fadeIn(el);
      // A match that would fly across the figure is a different element: fade it in instead.
      const jump = ["x", "cx", "x1"].some((a) => { const p = o.attrs[a], q = el.getAttribute(a); return p != null && q != null && Math.abs(+p - +q) > old.width * 0.35; });
      if (jump) return fadeIn(el);
      NUM_ATTRS.forEach((a) => {
        const p = o.attrs[a], q = el.getAttribute(a);
        if (p == null || q == null || p === q || isNaN(+p) || isNaN(+q)) { if (p == null && q != null && a === "width" && el.tagName === "rect") { const to = +q; tweens.push((t) => el.setAttribute(a, String(to * t))); finals.push(() => el.setAttribute(a, q)); } return; }
        const from = +p, to = +q;
        const floor = /^(width|height|r|rx|ry|stroke-width|opacity|fill-opacity|stroke-opacity)$/.test(a) ? 0 : -Infinity;
        tweens.push((t) => el.setAttribute(a, String(Math.max(floor, from + (to - from) * t))));
        finals.push(() => el.setAttribute(a, q));
      });
      COLOR_ATTRS.forEach((a) => {
        const p = o.attrs[a], q = el.getAttribute(a);
        if (p === q) return;
        const c0 = parseColor(p), c1 = parseColor(q);
        if (!c0 || !c1) return;
        tweens.push((t) => el.setAttribute(a, `rgb(${c0.map((v, i) => Math.round(v + (c1[i] - v) * t)).join(",")})`));
        finals.push(() => el.setAttribute(a, q!));
      });
      ["points", "d"].forEach((a) => {
        const p = o.attrs[a], q = el.getAttribute(a);
        if (!p || !q || p === q || p.replace(NUM, "#") !== q.replace(NUM, "#")) { if (p !== q && q) fadeIn(el); return; }
        const n0 = p.match(NUM)!.map(toNum), n1 = q.match(NUM)!.map(toNum);
        tweens.push((t) => { let i = 0; el.setAttribute(a, q.replace(NUM, () => { const v = n0[i] + (n1[i] - n0[i]) * t; i++; return v.toFixed(2); })); });
        finals.push(() => el.setAttribute(a, q));
      });
    });
    svg.querySelectorAll("text").forEach((el) => {
      const now = el.textContent ?? "";
      if (!now.trim()) return;
      const was = old.texts.get(posKey(el));
      if (was === now) return;
      const n0 = was?.match(NUM), n1 = now.match(NUM);
      if (was && n0 && n1 && was.replace(NUM, "#") === now.replace(NUM, "#") && el.children.length === 0) {
        const a = n0.map(toNum), b = n1.map(toNum);
        tweens.push((t) => { let i = 0; el.textContent = now.replace(NUM, (tok) => { const v = a[i] + (b[i] - a[i]) * t; i++; return fmtLike(v, tok); }); });
        finals.push(() => (el.textContent = now));
      } else fadeIn(el);
    });
    if (!tweens.length) return;
    let raf = 0, done = false;
    const finish = () => { if (done) return; done = true; cancelAnimationFrame(raf); finals.forEach((f) => f()); running.delete(svg); };
    running.set(svg, finish);
    const t0 = performance.now();
    const frame = (now: number) => { if (done) return; const t = Math.min(1, (now - t0) / ms); const e = ease(t); tweens.forEach((f) => f(e)); if (t < 1) raf = requestAnimationFrame(frame); else finish(); };
    tweens.forEach((f) => f(0));
    raf = requestAnimationFrame(frame);
  });
}
