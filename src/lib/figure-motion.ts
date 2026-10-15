// Shared plumbing for animated blog figures (Porcelain motion rules):
// play once when the figure scrolls into view, Replay restarts it, Pause
// freezes it, a newer run cancels an older one, and reduced motion skips
// straight to the final frame.
import { animate as motionAnimate } from "motion/mini";

export const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const dur = (seconds: number) => (reduce ? 0 : seconds);

type Alive = () => boolean;

// A run's clock. tween, wait and animate remember the run that called them and
// stop advancing while it is paused. Each resolves with `current` set back to
// its own run, so the figure's next call joins the same clock.
type Clock = { paused: boolean; listeners: Set<(paused: boolean) => void> };
let current: Clock | null = null;
const after = <T>(clock: Clock | null, value: T, done: (v: T) => void) => { current = clock; done(value); };

/** Resolve after `seconds` of unpaused time. */
export function wait(seconds: number) {
  const clock = current;
  return new Promise<void>((done) => {
    let left = reduce ? 0 : seconds * 1000, start = 0, id = 0;
    const finish = () => { clock?.listeners.delete(onPause); after(clock, undefined, done); };
    const go = () => { start = performance.now(); id = window.setTimeout(finish, left); };
    const onPause = (paused: boolean) => { if (paused) { clearTimeout(id); left -= performance.now() - start; } else go(); };
    clock?.listeners.add(onPause);
    if (!clock?.paused) go();
  });
}

/** motion's animate, paused and resumed with the run that started it. */
export function animate(...args: Parameters<typeof motionAnimate>) {
  const clock = current, controls = motionAnimate(...args) as any;
  if (!clock) return controls;
  const onPause = (paused: boolean) => (paused ? controls.pause() : controls.play());
  clock.listeners.add(onPause);
  if (clock.paused) controls.pause();
  return new Proxy(controls, {
    get(target, prop) {
      if (prop === "then") return (res?: (v: unknown) => unknown, rej?: (e: unknown) => unknown) => target.then((v: unknown) => { clock.listeners.delete(onPause); current = clock; return res ? res(v) : v; }, rej);
      const v = target[prop];
      return typeof v === "function" ? v.bind(target) : v;
    },
  });
}

/**
 * Wire a figure: `reset` puts it in its start state, `play` animates to the final
 * state and should return early whenever `alive()` turns false.
 */
export function setupFigure(root: HTMLElement, reset: () => void, play: (alive: Alive) => Promise<void>) {
  let token = 0, clock: Clock | null = null;
  const pause = pauseButton(root, (paused) => { if (!clock) return; clock.paused = paused; clock.listeners.forEach((f) => f(paused)); });
  const run = async () => {
    const my = ++token;
    clock = { paused: false, listeners: new Set() };
    pause.show(true);
    current = clock;
    reset();
    await play(() => my === token);
    if (my === token) { pause.show(false); current = null; }
  };
  root.querySelector("[data-replay]")?.addEventListener("click", run);
  if (reduce || !("IntersectionObserver" in window)) return;
  reset();
  // Start when most of the figure is visible, or, for figures taller than the
  // screen, when it fills half the viewport.
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.intersectionRatio >= 0.55 || e.intersectionRect.height >= window.innerHeight * 0.5)) {
      io.disconnect();
      run();
    }
  }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.55] });
  io.observe(root);
}

/** Prepare a stroke to be drawn on (pathLength 1) and hide it. */
export function hideStroke(el: SVGElement) {
  el.setAttribute("pathLength", "1");
  el.style.strokeDasharray = "1";
  el.style.strokeDashoffset = "1";
}

/** Draw a prepared stroke from start to end. */
export function drawStroke(el: SVGElement, seconds: number, ease: "linear" | number[] = [0.65, 0, 0.35, 1]) {
  return animate(el, { strokeDashoffset: [1, 0] }, { duration: dur(seconds), ease });
}

/** Translate keyframes that move an element whose origin is (0,0) along a path or line. */
export function alongPath(path: SVGGeometryElement, steps = 40) {
  const total = path.getTotalLength();
  return Array.from({ length: steps + 1 }, (_, i) => {
    const p = path.getPointAtLength((total * i) / steps);
    return `translate(${p.x}px, ${p.y}px)`;
  });
}

/** Call `step(t)` with eased t from 0 to 1 over `seconds`, for attribute-driven SVG. */
export function tween(seconds: number, step: (t: number) => void) {
  const clock = current;
  return new Promise<void>((done) => {
    const ms = dur(seconds) * 1000;
    if (!ms) { step(1); return after(clock, undefined, done); }
    let elapsed = 0, last = performance.now();
    const tick = (now: number) => {
      if (!clock?.paused) elapsed += now - last;
      last = now;
      const x = Math.min(1, Math.max(0, elapsed / ms));
      if (!clock?.paused) step(1 - (1 - x) ** 3);
      x < 1 ? requestAnimationFrame(tick) : after(clock, undefined, done);
    };
    requestAnimationFrame(tick);
  });
}

/**
 * Add a Pause / Resume button beside the figure's Replay button (or at the end
 * of the figure). `onToggle` receives the new paused state.
 */
function pauseButton(root: HTMLElement, onToggle: (paused: boolean) => void) {
  if (reduce) return { show: (_on: boolean, _delay?: number) => {} };
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "fig-replay fig-pause"; btn.textContent = "Pause"; btn.hidden = true;
  let paused = false;
  const set = (p: boolean) => { paused = p; btn.textContent = p ? "Resume" : "Pause"; btn.setAttribute("aria-pressed", String(p)); onToggle(p); };
  btn.addEventListener("click", () => set(!paused));
  const replay = root.querySelector<HTMLElement>("[data-replay]");
  const row = document.createElement("div"); row.className = "fig-controls";
  if (replay) { replay.replaceWith(row); row.append(btn, replay); } else { row.append(btn); root.append(row); }
  // Show the button only for runs that last: a flash on a one-second animation is noise.
  let timer = 0;
  return {
    show: (on: boolean, delay = 1200) => {
      clearTimeout(timer);
      if (on && paused) { paused = false; btn.textContent = "Pause"; btn.setAttribute("aria-pressed", "false"); }
      if (!on) { btn.hidden = true; return; }
      if (delay) timer = window.setTimeout(() => (btn.hidden = false), delay); else btn.hidden = false;
    },
  };
}

/**
 * Run `frame(seconds)` every animation frame while the figure is on screen.
 * Reduced motion draws one still frame. Returns a function that redraws now.
 */
export function whileVisible(root: HTMLElement, frame: (t: number) => void) {
  let on = false, paused = false, clockT = 0, last = performance.now(), raf = 0;
  const tick = (now: number) => { if (!paused) clockT += (now - last) / 1000; last = now; frame(clockT); if (on) raf = requestAnimationFrame(tick); };
  frame(0);
  if (reduce || !("IntersectionObserver" in window)) return () => frame(0);
  pauseButton(root, (p) => { paused = p; }).show(true, 0);
  new IntersectionObserver(([e]) => {
    const vis = e.isIntersecting;
    if (vis && !on) { on = true; last = performance.now(); raf = requestAnimationFrame(tick); }
    if (!vis) { on = false; cancelAnimationFrame(raf); }
  }).observe(root);
  return () => frame(clockT);
}
