// Project panel tree logic with no DOM: sort (L-50 as in gpui), visible rows with folded paths (R-18, L-41~L-43),
// guides (L-38), the virtual window (D-9), and selection moves (R-19). The listing comes from the core asynchronously,
// so building rows also says which folders it still needs to read.

export type Child = { name: string; is_dir: boolean };

/** Case-insensitive natural order: digit runs compare by value, the rest by lower case; ties fall back to the raw text. */
export function naturalCmp(a: string, b: string): number {
  const part = /(\d+)|(\D+)/g;
  const pa = a.match(part) ?? [];
  const pb = b.match(part) ?? [];
  for (let i = 0; i < Math.min(pa.length, pb.length); i++) {
    const [x, y] = [pa[i], pb[i]];
    if (/^\d/.test(x) && /^\d/.test(y)) {
      const [tx, ty] = [x.replace(/^0+/, ""), y.replace(/^0+/, "")];
      if (tx.length !== ty.length) return tx.length - ty.length;
      if (tx !== ty) return tx < ty ? -1 : 1;
    } else {
      const [lx, ly] = [x.toLowerCase(), y.toLowerCase()];
      if (lx !== ly) return lx < ly ? -1 : 1;
    }
  }
  if (pa.length !== pb.length) return pa.length - pb.length;
  return a === b ? 0 : a < b ? -1 : 1;
}

/** Folders first, then natural order by name. */
export const sortChildren = (list: Child[]): Child[] =>
  [...list].sort((a, b) => Number(b.is_dir) - Number(a.is_dir) || naturalCmp(a.name, b.name));

export const joinPath = (dir: string, name: string): string => (dir.endsWith("\\") ? dir + name : `${dir}\\${name}`);

export type Segment = { name: string; path: string };
/** One bar of indent guides: only whether the row opens or closes the folder's child range (L-38). */
export type Guide = { first: boolean; last: boolean };
export type Row = {
  path: string; // the last segment of a folded path
  depth: number;
  isDir: boolean;
  isRoot: boolean;
  expanded: boolean;
  segments: Segment[]; // more than one when folded (L-42)
  guides: Guide[]; // guides[d] belongs to the folder at depth d
  isNew: boolean; // the empty row of a new file or folder being named (P-019); isDir says which, path is its parent
};

export type Listing = ReadonlyMap<string, Child[]>; // sorted children per read folder

/**
 * The visible rows. The root is the first row and is never folded (L-41). A folder whose only child is a folder joins
 * it into one row (L-42). `needs` are folders that must be read before the rows are final.
 */
export function buildRows(
  root: string,
  rootName: string,
  expanded: ReadonlySet<string>,
  listing: Listing,
  opts: { unfolded?: ReadonlySet<string>; newEntry?: { dir: string; isDir: boolean } | null } = {},
): { rows: Row[]; needs: string[] } {
  const { unfolded, newEntry } = opts;
  const rows: Row[] = [];
  const needs: string[] = [];
  const kids = (dir: string): Child[] | undefined => {
    const list = listing.get(dir);
    if (!list) needs.push(dir);
    return list;
  };
  rows.push({ path: root, depth: 0, isDir: true, isRoot: true, expanded: expanded.has(root), segments: [{ name: rootName, path: root }], guides: [], isNew: false });

  const newRow = (dir: string, depth: number, isDir: boolean): Row => ({ path: dir, depth, isDir, isRoot: false, expanded: false, segments: [], guides: [], isNew: true });

  const walk = (dir: string, depth: number) => {
    // P-019: a new folder goes first, a new file after the folders.
    let pending: boolean | null = newEntry?.dir === dir ? newEntry.isDir : null;
    if (pending === true) {
      rows.push(newRow(dir, depth, true));
      pending = null;
    }
    for (const child of kids(dir) ?? []) {
      const path = joinPath(dir, child.name);
      if (!child.is_dir) {
        if (pending !== null) {
          rows.push(newRow(dir, depth, pending));
          pending = null;
        }
        rows.push({ path, depth, isDir: false, isRoot: false, expanded: false, segments: [{ name: child.name, path }], guides: [], isNew: false });
        continue;
      }
      const segments: Segment[] = [{ name: child.name, path }];
      let last = path;
      for (;;) {
        if (unfolded?.has(last) || newEntry?.dir === last) break; // Unfold Directory (I-538); the folder being added to
        const sub = kids(last);
        if (sub?.length !== 1 || !sub[0].is_dir) break;
        last = joinPath(last, sub[0].name);
        segments.push({ name: sub[0].name, path: last });
      }
      const open = expanded.has(last);
      rows.push({ path: last, depth, isDir: true, isRoot: false, expanded: open, segments, guides: [], isNew: false });
      if (open) walk(last, depth + 1);
    }
    if (pending !== null) rows.push(newRow(dir, depth, pending));
  };
  if (rows[0].expanded) walk(root, 1);

  // L-38: an expanded folder's guide spans its first child to its last descendant.
  rows.forEach((row, i) => {
    if (!(row.isDir && row.expanded)) return;
    let end = i;
    while (end + 1 < rows.length && rows[end + 1].depth > row.depth) end++;
    for (let k = i + 1; k <= end; k++) rows[k].guides[row.depth] = { first: k === i + 1, last: k === end };
  });
  return { rows, needs: [...new Set(needs)] };
}

/** Rows to draw for a scroll position: the visible ones plus `overscan` on both sides. */
export function visibleRange(scrollTop: number, viewport: number, rowHeight: number, count: number, overscan: number): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(count, Math.ceil((scrollTop + viewport) / rowHeight) + overscan);
  return { start, end: Math.max(start, end) };
}

// --- selection --------------------------------------------------------------------------------------------------

/** What the tree remembers per folder besides what it read from disk. */
export type Selection = { selected: string | null; marked: string[]; anchor: string | null };
export const none: Selection = { selected: null, marked: [], anchor: null };
export const only = (path: string | null): Selection => ({ selected: path, marked: [], anchor: path });

/** The parent folder of `path` inside the tree rooted at `root` (a drive or share root keeps its trailing backslash). */
export function parentOf(root: string, path: string): string {
  const parent = path.slice(0, path.lastIndexOf("\\"));
  return root.endsWith("\\") && parent + "\\" === root ? root : parent;
}

/** What an action works on: the marked items when the selection is among them, else the selected item (I-562). */
export const targetsOf = (sel: Selection): string[] =>
  sel.selected !== null && sel.marked.length > 0 && sel.marked.includes(sel.selected) ? sel.marked : sel.selected !== null ? [sel.selected] : [];

/** Whether `path` shows as a folder: a folder row, or a piece before the last of a folded path. */
export const isDirPath = (rows: Row[], path: string): boolean => {
  const row = rows[rowIndex(rows, path)];
  return !!row && (row.isDir || row.path !== path);
};

/** The row that shows `path`, which may be one segment of a folded path. */
export const rowIndex = (rows: Row[], path: string | null): number => (path === null ? -1 : rows.findIndex((r) => r.segments.some((s) => s.path === path)));

/** A range selection from the anchor to row `to` (I-043, I-090). */
function range(rows: Row[], sel: Selection, to: number): Selection {
  const anchor = sel.anchor ?? sel.selected ?? rows[to].path;
  const a = rowIndex(rows, anchor);
  const [lo, hi] = a < 0 ? [to, to] : [Math.min(a, to), Math.max(a, to)];
  return { selected: rows[to].path, marked: rows.slice(lo, hi + 1).map((r) => r.path), anchor };
}

/**
 * Up / Down / Home / End (I-030, I-088): they stop at the ends. With nothing selected, Down and Home give the first row, Up
 * and End the last. `extend` is Shift+Up/Down. Returns the new selection and the row index to scroll to.
 */
export function move(rows: Row[], sel: Selection, to: "next" | "prev" | "first" | "last", extend: boolean): { sel: Selection; index: number } | null {
  if (rows.length === 0) return null;
  const cur = rowIndex(rows, sel.selected);
  const last = rows.length - 1;
  const index =
    to === "first" ? 0 : to === "last" ? last : cur < 0 ? (to === "next" ? 0 : last) : Math.max(0, Math.min(last, cur + (to === "next" ? 1 : -1)));
  return { sel: extend ? range(rows, sel, index) : only(rows[index].path), index };
}

/** Shift+click: the range from the anchor. */
export const clickRange = (rows: Row[], sel: Selection, path: string): Selection => {
  const i = rowIndex(rows, path);
  return i < 0 ? sel : range(rows, sel, i);
};

/** Ctrl+click: toggle one item in the marked set (I-090). The cursor goes to the last marked item when one is removed. */
export function clickToggle(sel: Selection, path: string): Selection {
  const marked = sel.marked.length === 0 && sel.selected !== null ? [sel.selected] : [...sel.marked];
  const at = marked.indexOf(path);
  if (at >= 0) {
    marked.splice(at, 1);
    const selected = marked.at(-1) ?? null;
    return { selected, marked, anchor: selected };
  }
  return { selected: path, marked: [...marked, path], anchor: path };
}

export type Step = { expanded?: { path: string; open: boolean }; select?: string };

/** Right (I-089, I-031): the next piece of a folded path, else open a closed folder, else the next row. */
export function expandStep(rows: Row[], sel: Selection): Step | null {
  const i = rowIndex(rows, sel.selected);
  if (i < 0) return null;
  const row = rows[i];
  const at = row.segments.findIndex((s) => s.path === sel.selected);
  if (at + 1 < row.segments.length) return { select: row.segments[at + 1].path };
  if (!row.isDir) return null;
  if (!row.expanded) return { expanded: { path: row.path, open: true } };
  return i + 1 < rows.length ? { select: rows[i + 1].path } : null;
}

/** Left (I-089, I-031): close an open folder, else the previous piece of a folded path, else the parent row. */
export function collapseStep(rows: Row[], sel: Selection): Step | null {
  const i = rowIndex(rows, sel.selected);
  if (i < 0) return null;
  const row = rows[i];
  const at = Math.max(0, row.segments.findIndex((s) => s.path === sel.selected));
  if (row.isDir && row.expanded && at + 1 === row.segments.length) return { expanded: { path: row.path, open: false } };
  if (at > 0) return { select: row.segments[at - 1].path };
  if (row.isRoot) return null;
  for (let k = i - 1; k >= 0; k--) if (rows[k].depth < row.depth) return { select: rows[k].path }; // the parent row
  return null;
}

/** Ctrl+Left closes everything except the root (I-032, D-17). */
export const collapseAll = (expanded: ReadonlySet<string>, root: string): Set<string> => new Set([...expanded].filter((p) => p === root));
