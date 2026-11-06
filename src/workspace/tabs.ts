// Tab list rules of one folder's Pane (R-26, I-061~I-064, I-087). No DOM, no editor: the view lives beside the tab.

export type TabInfo = { path: string; preview: boolean };

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
): Opened<T> {
  const at = tabs.findIndex((t) => t.path === path);
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
  const index = active === null ? tabs.length : Math.min(active + 1, tabs.length);
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
