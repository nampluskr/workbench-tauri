// core v0.8.3 I-1: a scroll area's vertical scrollbar shows on input in that area and hides after the Scrollbar Hide Delay.
// The drawing is CSS (app.css, --scrollbar-opacity); this file decides which areas are shown.

/** Scrollbar Hide Delay 0: nothing hides (the 0.8.2 look). */
export const autoHides = (delaySeconds: number): boolean => delaySeconds > 0;

/** When each shown area hides (ms), and the area whose scrollbar the pointer rests on: that one does not hide. */
export type ScrollbarState<A> = { hideAt: Map<A, number>; held: A | null };

/** The pointer moved or the wheel turned over `area` (null: over no scroll area, or outside the window); `onBar`: over the area's own scrollbar. */
export function pointerInput<A>(s: ScrollbarState<A>, area: A | null, onBar: boolean, now: number, delay: number): void {
  if (s.held !== null && !(onBar && s.held === area)) { s.hideAt.set(s.held, now + delay); s.held = null; }
  if (area === null) return;
  s.hideAt.set(area, now + delay);
  if (onBar) s.held = area;
}

/** A key was pressed with focus in `area` (null: in no scroll area). */
export function keyInput<A>(s: ScrollbarState<A>, area: A | null, now: number, delay: number): void {
  if (area !== null) s.hideAt.set(area, now + delay);
}

/** The areas whose delay has passed at `now`, taken out of the state. */
export function expired<A>(s: ScrollbarState<A>, now: number): A[] {
  const out = [...s.hideAt].filter(([area, at]) => at <= now && area !== s.held).map(([area]) => area);
  for (const area of out) s.hideAt.delete(area);
  return out;
}

/** When the next area hides (Infinity: none will). */
export const nextExpiry = <A>(s: ScrollbarState<A>): number => Math.min(...[...s.hideAt].filter(([area]) => area !== s.held).map(([, at]) => at));

/** The nearest element from `target` up that scrolls vertically and has something to scroll. An HTML preview's page is another document: never reached. */
function scrollArea(target: EventTarget | null): HTMLElement | null {
  for (let el = target instanceof Element ? target : null; el; el = el.parentElement) {
    if (el instanceof HTMLElement && el.scrollHeight > el.clientHeight && /auto|scroll/.test(getComputedStyle(el).overflowY)) return el;
  }
  return null;
}

/** Mark the area with input `data-scrollbar="on"` and, once its delay has passed, `"off"`. `delaySeconds` is the setting, read on every input. */
export function installScrollbarHide(delaySeconds: () => number): void {
  const state: ScrollbarState<HTMLElement> = { hideAt: new Map(), held: null };
  let timer: number | undefined;
  const sync = () => {
    for (const el of expired(state, performance.now())) el.dataset.scrollbar = "off";
    clearTimeout(timer);
    const next = nextExpiry(state);
    if (next < Infinity) timer = window.setTimeout(sync, Math.max(0, next - performance.now()));
  };
  const show = (area: HTMLElement | null) => {
    if (area && area.dataset.scrollbar !== "on") area.dataset.scrollbar = "on";
    sync();
  };
  // One look per frame: a mouse move is frequent, and the last one before the pointer rests must not be dropped.
  let last: MouseEvent | null | undefined;
  const flush = () => {
    const e = last;
    last = undefined;
    const delay = delaySeconds() * 1000;
    if (e === undefined || !autoHides(delay)) return;
    const area = e && scrollArea(e.target);
    // The scrollbar is the part of the area's box right of its content (the event's target is then the area itself).
    const onBar = !!e && !!area && e.target === area && e.clientX >= area.getBoundingClientRect().left + area.clientLeft + area.clientWidth;
    pointerInput(state, area, onBar, performance.now(), delay);
    show(area);
  };
  const pointer = (e: MouseEvent | null) => { if (last === undefined) requestAnimationFrame(flush); last = e; };
  // mouseover: entering an HTML preview's frame gives no mouse move here, only this on the frame element.
  for (const type of ["mousemove", "mouseover", "wheel"] as const) document.addEventListener(type, pointer, { capture: true, passive: true });
  document.documentElement.addEventListener("mouseleave", () => pointer(null));
  document.addEventListener("keydown", () => {
    const delay = delaySeconds() * 1000;
    if (!autoHides(delay)) return;
    const area = scrollArea(document.activeElement);
    keyInput(state, area, performance.now(), delay);
    show(area);
  }, true);
}
