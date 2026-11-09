import { MENU_WINDOW_MARGIN } from "../spec/metrics.ts";
import { displayChunks, shortcutFor } from "../keymap/display.ts";
import type { ContextNode, Keymap } from "../keymap/engine.ts";

// Menu logic shared by the app menu and (Phase 5) the right-click menu: what can be selected, and where a popup goes.

/** An entry runs `run`, or else the command named `action`; `action` is also what the shortcut is looked up for. */
export type MenuItem = { label: string; action?: string; run?: () => void; disabled?: boolean; checked?: boolean; shortcut?: string; url?: string; children?: MenuEntry[] };
export type MenuEntry = MenuItem | "separator";
export type Menu = { name: string; entries: MenuEntry[] };

export const shortcutForEntry = (entry: MenuEntry, keymap: Keymap, stack: ContextNode[]): string[] | undefined =>
  entry === "separator" ? undefined : entry.shortcut !== undefined ? (entry.shortcut ? displayChunks(entry.shortcut) : undefined) : entry.action ? shortcutFor(keymap, entry.action, stack) : undefined;

/** A disabled sibling still dismisses the child, without becoming selected. */
export function hoverMenuItem(entry: MenuItem, index: number, childParent: number | null, inChild = false) {
  return {
    closeChild: !inChild && childParent !== null && childParent !== index,
    openChild: !inChild && !entry.disabled && !!entry.children && childParent !== index,
    select: !entry.disabled && (inChild || !entry.children),
  };
}

const selectable = (entry: MenuEntry): boolean => entry !== "separator" && !entry.disabled;

/**
 * The next selectable entry after `from` going `dir`, wrapping at the ends (I-518); separators and
 * disabled entries are skipped (I-515). From no selection, forward gives the first and backward the last.
 * Null when nothing can be selected.
 */
export function step(entries: MenuEntry[], from: number | null, dir: 1 | -1): number | null {
  const n = entries.length;
  for (let k = 1; k <= n; k++) {
    const i = from === null ? (dir === 1 ? k - 1 : n - k) : (((from + dir * k) % n) + n) % n;
    if (selectable(entries[i])) return i;
  }
  return null;
}

/** First / last selectable entry (Home, End and their aliases). */
export const first = (entries: MenuEntry[]): number | null => step(entries, null, 1);
export const last = (entries: MenuEntry[]): number | null => step(entries, null, -1);

/** Index of the menu `dir` away from `from`, wrapping (Left/Right in the horizontal bar, I-303). */
export const cycle = (count: number, from: number, dir: 1 | -1): number => (from + dir + count) % count;

/** Removing a focused submenu can blur before its parent receives focus. */
export function closeOnFocusOut(root: Pick<HTMLElement, "contains">, close: () => void): void {
  queueMicrotask(() => {
    if (!document.hasFocus() || !root.contains(document.activeElement)) close();
  });
}

type Point = { x: number; y: number };
type Size = { w: number; h: number };

/** Keep the popup inside the window with the window margin on every side (I-314, I-501). */
export function placeMenu(anchor: Point, size: Size, view: Size): Point {
  const keep = (v: number, extent: number, limit: number) => Math.max(MENU_WINDOW_MARGIN, Math.min(v, limit - MENU_WINDOW_MARGIN - extent));
  return { x: keep(anchor.x, size.w, view.w), y: keep(anchor.y, size.h, view.h) };
}

/** Open to the left when the parent's right edge has no room for the child. */
export function placeSubmenu(parent: { left: number; right: number; top: number }, size: Size, view: Size): Point {
  const x = parent.right + size.w <= view.w - MENU_WINDOW_MARGIN ? parent.right : parent.left - size.w;
  return placeMenu({ x, y: parent.top }, size, view);
}
