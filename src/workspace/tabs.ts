// Tab list rules of one folder's Pane (R-26, R-8, I-060~I-068, I-087). No DOM, no editor: the view lives beside the tab.
// Pinned tabs are the leading run of the list (I-065, I-719): pinning is a place in the Pane, not a file property.

/** `markdown`: a Markdown preview tab of `path` (R-11), a different item from the editor tab of the same path. */
export type TabInfo = { path: string; preview: boolean; pinned?: boolean; markdown?: boolean; tool?: boolean };

/** How many tabs the pin area holds. */
export function pinnedCount(tabs: TabInfo[]): number {
  let n = 0;
  while (n < tabs.length && tabs[n].pinned) n++;
  return n;
}

/** I-065 / I-014: pinning drops the preview state and moves the tab to the end of the pin area; unpinning moves it just after. */
export function togglePin<T extends TabInfo>(tabs: T[], index: number, active: number | null): { tabs: T[]; active: number | null } {
  const tab = tabs[index];
  const rest = tabs.filter((_, i) => i !== index);
  const at = pinnedCount(rest);
  const next = [...rest.slice(0, at), { ...tab, pinned: !tab.pinned, preview: false }, ...rest.slice(at)];
  return { tabs: next, active: active === null ? null : active === index ? at : next.indexOf(tabs[active]) };
}

/** I-010 / I-076: Ctrl+PageUp / PageDown move by position, wrapping at the ends. */
export const stepTab = (count: number, active: number | null, dir: 1 | -1): number | null =>
  count === 0 ? null : active === null ? (dir === 1 ? 0 : count - 1) : (active + dir + count) % count;

export type Opened<T extends TabInfo> = { tabs: T[]; active: number; created: boolean; replaced: T | null };

/**
 * Open `path`. An open tab is only activated (opening it normally promotes a preview tab, I-063). A new preview tab takes
 * the place of the existing preview tab when `maxPreview` of them are open (I-062); otherwise a new tab goes right after
 * the active tab, or at the end. A preview tab for which `keep` is true (modified, so replacing it would lose its text)
 * is never replaced: the new preview tab then goes in the normal place.
 */
export function openTab<T extends TabInfo>(
  tabs: T[],
  active: number | null,
  path: string,
  preview: boolean,
  maxPreview: number,
  make: () => T,
  keep: (tab: T) => boolean = () => false,
  markdown = false,
): Opened<T> {
  const at = tabs.findIndex((t) => t.path === path && !!t.markdown === markdown); // I-068 / I-079
  if (at >= 0) {
    const next = [...tabs];
    if (!preview && next[at].preview) next[at] = { ...next[at], preview: false };
    return { tabs: next, active: at, created: false, replaced: null };
  }
  const tab = make();
  if (preview) {
    const previews = tabs.flatMap((t, i) => (t.preview ? [i] : []));
    const at = previews.find((i) => !keep(tabs[i]));
    if (previews.length >= maxPreview && at !== undefined) {
      const next = [...tabs];
      const replaced = next[at];
      next[at] = tab;
      return { tabs: next, active: at, created: true, replaced };
    }
  }
  // I-067: right after the active tab, never inside the pin area.
  const index = Math.max(active === null ? tabs.length : Math.min(active + 1, tabs.length), pinnedCount(tabs));
  return { tabs: [...tabs.slice(0, index), tab, ...tabs.slice(index)], active: index, created: true, replaced: null };
}

/**
 * I-072 `activate_on_close` = history: the active tab after the tab at `closed` goes, as an index of the list without it.
 * Closing the active tab picks the most recently active tab still open (`recent`, oldest first), else the left neighbour.
 */
export function activeAfterClose<T>(tabs: T[], closed: number, active: number | null, recent: T[]): number | null {
  if (tabs.length <= 1) return null;
  const shift = (i: number) => (i > closed ? i - 1 : i);
  if (active !== closed) return active === null ? null : shift(active);
  for (let k = recent.length - 1; k >= 0; k--) {
    const at = tabs.indexOf(recent[k]);
    if (at >= 0 && at !== closed) return shift(at);
  }
  return Math.max(closed - 1, 0);
}

/** L-63: which sides of a tab show the border line; the others only keep 1px of padding. Position and the active tab decide. */
export function tabEdges(index: number, count: number, active: number | null): { left: boolean; right: boolean; bottom: boolean } {
  const isActive = index === active;
  if (isActive) return { left: index !== 0, right: true, bottom: false };
  if (index === 0) return { left: false, right: false, bottom: true };
  if (index === count - 1) return { left: false, right: true, bottom: true };
  return active !== null && index < active ? { left: true, right: false, bottom: true } : { left: false, right: true, bottom: true };
}
