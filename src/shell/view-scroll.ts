/**
 * core v0.8.2 I-12: Chromium resets the scroll offsets of an element taken out of the DOM, and CM6 puts its own back only on
 * a focus event (observers.focus), so a tab view lost its place when the Pane showed another tab. The Pane records every
 * scroll event under it here and puts the tab's scroller back when its view is shown again (also in another Pane).
 */
type Scroller = { scrollTop: number; scrollLeft: number };
const kept = new WeakMap<object, [number, number]>();

/** A capture listener for the Pane body: scroll events do not bubble. The reset on removal fires none, so it is never recorded. */
export const keepScroll = (e: Event): void => {
  const el = e.target as Partial<Scroller> | null;
  if (el && typeof el.scrollTop === "number" && typeof el.scrollLeft === "number") kept.set(el, [el.scrollTop, el.scrollLeft]);
};

/** After the view is in the DOM again. A later move (a link, an Outline click, a located line) runs after this and wins. */
export function restoreScroll(el: Scroller | null | undefined): void {
  const at = el && kept.get(el);
  if (!el || !at) return;
  el.scrollTop = at[0];
  el.scrollLeft = at[1];
}
