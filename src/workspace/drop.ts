import type { Dir } from "./split.ts";
import { pinnedCount, type TabInfo } from "./tabs.ts";

// Where a dragged tab lands (R-10, I-712~I-720). Pure: the pointer code gives sizes and indices.

/**
 * I-712 / I-713: a drop on the Pane body (the area under the tab bar, `w` x `h`, point `x`,`y` from its top left). Within
 * d = min(w, h) * ratio of an edge it splits toward the nearest edge; on the boundary, and inside, it is the center (null).
 * shortcut: equal distances take up, right, down, left in that order (the order I-713 lists the edges); the source leaves ties open.
 */
export function bodyDrop(w: number, h: number, x: number, y: number, ratio: number): Dir | null {
  const d = Math.min(w, h) * ratio;
  if (!(x < d || x > w - d || y < d || y > h - d)) return null;
  const distances: [Dir, number][] = [["up", y], ["right", w - x], ["down", h - y], ["left", x]];
  return distances.reduce((best, cur) => (cur[1] < best[1] ? cur : best))[0];
}

/**
 * I-715: the 2px line on a tab dropped on: left when that tab is before the dragged one, right when after. A tab of
 * another Pane takes the dragged tab before it (left). Null on the dragged tab itself.
 */
export function dropSide(index: number, samePane: boolean, from: number): "left" | "right" | null {
  if (!samePane) return "left";
  return index < from ? "left" : index > from ? "right" : null;
}

/**
 * I-715: the line on tab `index` of `pane` during a drag from tab `fromIndex` of `from`: only while the target is that
 * tab. The target is null over the dragged tab itself, the start of a tab bar and other empty places.
 */
export function lineSide<P>(target: { pane: P; where: { kind: string; index?: number } } | null, pane: P, index: number, from: P, fromIndex: number): "left" | "right" | null {
  if (!target || target.pane !== pane || target.where.kind !== "tab" || target.where.index !== index) return null;
  return dropSide(index, pane === from, fromIndex);
}

/**
 * I-715 / I-716 / I-719 / I-720: put `tab` into `tabs` (which no longer holds it) at `index`. Pinned is decided by the new
 * place: inside the pin area it is pinned, past it it is not; right at the area's end it keeps what it was (so a pinned
 * tab put first in a Pane without pins stays pinned). A dragged preview tab becomes a normal one (I-717).
 */
export function place<T extends TabInfo>(tabs: T[], index: number, tab: T): { tabs: T[]; index: number } {
  const at = Math.max(0, Math.min(index, tabs.length));
  const pins = pinnedCount(tabs);
  const pinned = at < pins ? true : at > pins ? false : !!tab.pinned;
  return { tabs: [...tabs.slice(0, at), { ...tab, pinned, preview: false }, ...tabs.slice(at)], index: at };
}
