// Step-by-step player for Foundations figures. A figure describes its steps
// once; the player adds Back / Step / Play controls, a "Step k of n" counter
// and a narration line, and redraws the figure for each step. Play advances
// on the shared pausable clock, so Pause and Replay work like other figures.
import { setupFigure, wait, reduce } from "./figure-motion";
import { snapshot, morph } from "./morph";

export interface Step {
  /** One sentence saying what happens in this step. */
  say: string;
  /** The arithmetic shown under it, if any (e.g. "z = 0.5 × 2 + 0.3 = 1.3"). */
  math?: string;
  /** Set the figure's controls when the reader arrives at this step (not on redraws). */
  enter?: () => void;
}

/**
 * Wire a step player into `root`. `steps()` returns the current list (it can
 * change when sliders move); `draw(k)` renders the figure as it is after step
 * k, where k = -1 is the starting state. Returns a function that redraws the
 * current step, to call after inputs change.
 */
export function stepper(root: HTMLElement, steps: () => Step[], draw: (k: number) => void, opts: { delay?: number } = {}) {
  const bar = document.createElement("div");
  bar.className = "fig-stepper";
  bar.innerHTML = `
    <div class="fig-stepper__controls">
      <button type="button" class="fig-chip" data-sp-back aria-label="Previous step">◀ Back</button>
      <button type="button" class="fig-chip fig-stepper__next" data-sp-next aria-label="Next step">Step ▶</button>
      <button type="button" class="fig-chip" data-sp-reset>Start over</button>
      <span class="fig-stepper__count" data-sp-count></span>
    </div>
    <p class="fig-stepper__say" data-sp-say aria-live="polite"></p>
    <p class="fig-stepper__math" data-sp-math></p>`;
  const anchor = root.querySelector(".fig-panel") ?? root.querySelector("[data-replay]");
  if (anchor) anchor.parentNode!.insertBefore(bar, anchor); else root.append(bar);
  const $ = <T extends Element>(s: string) => bar.querySelector<T>(s)!;
  let k = -1, token = 0;
  function show() {
    const list = steps(), n = list.length;
    k = Math.max(-1, Math.min(n - 1, k));
    draw(k);
    $("[data-sp-count]").textContent = k < 0 ? `${n} steps` : `Step ${k + 1} of ${n}`;
    $("[data-sp-say]").textContent = k < 0 ? "Press Step to go through it one operation at a time." : list[k].say;
    const m = $<HTMLElement>("[data-sp-math]");
    m.textContent = k >= 0 && list[k].math ? list[k].math! : "";
    m.hidden = !m.textContent;
    $<HTMLButtonElement>("[data-sp-back]").disabled = k < 0;
    $<HTMLButtonElement>("[data-sp-next]").disabled = k >= n - 1;
  }
  // Changing step animates from the old picture to the new one; slider
  // redraws (the returned function) stay instant.
  const go = (to: number) => { const before = snapshot(root); k = to; steps()[k]?.enter?.(); show(); morph(root, before); };
  $("[data-sp-next]").addEventListener("click", () => { token++; go(k + 1); });
  $("[data-sp-back]").addEventListener("click", () => { token++; go(k - 1); });
  $("[data-sp-reset]").addEventListener("click", () => { token++; go(-1); });
  // Arrow keys step through when the figure has focus.
  root.tabIndex = root.tabIndex >= 0 ? root.tabIndex : 0;
  root.addEventListener("keydown", (e) => {
    if ((e.target as Element).closest("input, select, textarea")) return;
    if (e.key === "ArrowRight" && k < steps().length - 1) { token++; go(k + 1); e.preventDefault(); }
    if (e.key === "ArrowLeft" && k > -1) { token++; go(k - 1); e.preventDefault(); }
  });
  // Autoplay once on first view, then hand control to the reader.
  setupFigure(root, () => go(-1), async (alive) => {
    const my = ++token;
    for (let i = 0; i < steps().length; i++) {
      await wait(i === 0 ? 0.6 : opts.delay ?? 1.6);
      if (!alive() || my !== token) return;
      go(i);
    }
  });
  if (reduce) go(steps().length - 1); else show();
  return () => show();
}
