// Course progress for the model-development course, kept only in this
// browser (localStorage). Every access is guarded: private windows, blocked
// storage or a malformed value simply mean "nothing completed yet".
const KEY = "model-development-course:v1";

export function completed(): Set<string> {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

/** Mark or unmark a lesson; returns whether the change was saved. */
export function setCompleted(href: string, done: boolean): boolean {
  try {
    const set = completed();
    if (done) set.add(href); else set.delete(href);
    window.localStorage.setItem(KEY, JSON.stringify([...set]));
    window.dispatchEvent(new CustomEvent("course-progress"));
    return true;
  } catch {
    return false;
  }
}

/** Tick the course dots on a page: any element with data-course-dot="<href>". */
export function paintDots(root: ParentNode = document) {
  const done = completed();
  root.querySelectorAll<HTMLElement>("[data-course-dot]").forEach((el) => el.classList.toggle("is-done", done.has(el.dataset.courseDot!)));
}
