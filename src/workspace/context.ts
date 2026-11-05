import { batch, createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import type { EditorView } from "@codemirror/view";
import { createFileView, decodeText } from "../editor/file-view.ts";
import { PANE_MAX_PREVIEW_TABS } from "../spec/metrics.ts";
import type { Validation } from "./names.ts";
import { baseName } from "./paths.ts";
import { openTab, type TabInfo } from "./tabs.ts";
import { buildRows, collapseAll, joinPath, none, only, sortChildren, type Child, type Row, type Selection } from "./tree.ts";

// The work context of one folder (A-15, R-13): what its tree has expanded, selected and read, and its tabs. It stays in
// memory while the folder is registered and goes with it (R-14). Nothing here is saved to state.json.

export type Tab = TabInfo & { view: EditorView | null; focus: boolean };


/** The inline input of the tree (R-20): a new file or folder under `dir`, or a rename of `path`. Fixed while it is open. */
export type EditTarget = {
  kind: "new" | "rename";
  dir: string; // new: the folder it goes in; rename: the parent
  path: string | null; // rename: the item
  isDir: boolean;
  initial: string;
  select: [number, number];
  tempExpanded: boolean; // new: the folder was opened only to show the input
  prevSelected: string | null; // where the selection returns on cancel
};
/** The scroll target for the row of a new item, which has no path of its own. */
export const NEW_ROW = "\0new";

export type FolderContext = ReturnType<typeof newContext>;

export function newContext(root: string, rootName: string) {
  const [structure, setStructure] = createSignal(0); // bumped when what the rows are built from changes
  const [selection, setSelection] = createSignal<Selection>(none);
  const [tabs, setTabs] = createSignal<Tab[]>([]);
  const [active, setActive] = createSignal<number | null>(null);
  const [scrollTarget, setScrollTarget] = createSignal<string | null>(null); // a path the tree should bring into view
  const [edit, setEdit] = createSignal<EditTarget | null>(null);
  const [issue, setIssue] = createSignal<Validation | null>(null); // banner under the input row (P-021)
  const ctx = {
    root,
    rootName,
    expanded: new Set<string>([root]), // Zed starts with the root open
    unfolded: new Set<string>(), // folders that Unfold Directory kept from folding into one row (I-538)
    input: null as HTMLInputElement | null, // the inline input while it is mounted
    committing: false,
    draft: null as string | null, // what was typed, kept in case the tree redraws and the input is made again
    listing: new Map<string, Child[]>(),
    reading: new Set<string>(),
    scrollTop: 0, // A-15.2: kept per folder
    structure, selection, setSelection, tabs, active, scrollTarget, setScrollTarget, edit, setEdit, issue, setIssue,
    setTabs, setActive,
    touch: () => setStructure((n) => n + 1),
    rows: (): { rows: Row[]; needs: string[] } => {
      structure();
      const e = edit();
      return buildRows(root, rootName, ctx.expanded, ctx.listing, { unfolded: ctx.unfolded, newEntry: e?.kind === "new" ? { dir: e.dir, isDir: e.isDir } : null });
    },
  };
  return ctx;
}

/** Read one folder (once). A folder that cannot be read counts as empty. */
// shortcut: no cap on parallel reads; a folder with thousands of subfolders asks for each of them at once (folding needs
// their children). Queue the reads if that shows up.
export async function readDir(ctx: FolderContext, path: string): Promise<void> {
  if (ctx.listing.has(path) || ctx.reading.has(path)) return;
  ctx.reading.add(path);
  try {
    ctx.listing.set(path, sortChildren(await invoke<Child[]>("list_dir", { path })));
  } catch {
    ctx.listing.set(path, []);
  } finally {
    ctx.reading.delete(path);
    ctx.touch();
  }
}

/** Every folder under `dir`, `dir` included (reads what it must). Junctions and links are not folders to the core. */
async function foldersUnder(ctx: FolderContext, dir: string): Promise<string[]> {
  await readDir(ctx, dir);
  const out = [dir];
  for (const child of ctx.listing.get(dir) ?? []) if (child.is_dir) out.push(...(await foldersUnder(ctx, joinPath(dir, child.name))));
  return out;
}

/** Read the given folders again (those this context has read); the rows keep their place until the new list arrives. */
export async function refreshDirs(ctx: FolderContext, dirs: Iterable<string>): Promise<void> {
  await Promise.all(
    [...new Set(dirs)]
      .filter((dir) => ctx.listing.has(dir))
      .map(async (dir) => {
        try {
          ctx.listing.set(dir, sortChildren(await invoke<Child[]>("list_dir", { path: dir })));
        } catch {
          ctx.listing.set(dir, []);
        }
      }),
  );
  ctx.touch();
}

const underOrSame = (dir: string, path: string) => path === dir || path.startsWith(dir.endsWith("\\") ? dir : dir + "\\");

/** An item was renamed or moved: every path in this context that was in it follows (tree state, selection, tabs). */
export function followMove(ctx: FolderContext, from: string, to: string): void {
  const remap = (p: string) => (underOrSame(from, p) ? to + p.slice(from.length) : p);
  ctx.expanded = new Set([...ctx.expanded].map(remap));
  ctx.unfolded = new Set([...ctx.unfolded].map(remap));
  for (const [dir, list] of [...ctx.listing]) {
    if (underOrSame(from, dir)) {
      ctx.listing.delete(dir);
      ctx.listing.set(remap(dir), list);
    }
  }
  const sel = ctx.selection();
  ctx.setSelection({ selected: sel.selected && remap(sel.selected), marked: sel.marked.map(remap), anchor: sel.anchor && remap(sel.anchor) });
  const tabs = ctx.tabs();
  // New objects for the moved tabs: the tab list draws a title once per object, so changing the path in place would not show.
  if (tabs.some((t) => underOrSame(from, t.path))) ctx.setTabs(tabs.map((t) => (underOrSame(from, t.path) ? { ...t, path: remap(t.path) } : t)));
  ctx.touch();
}

/** Items were deleted: forget what this context knew below them. */
export function forget(ctx: FolderContext, path: string): void {
  for (const dir of [...ctx.listing.keys()]) if (underOrSame(path, dir)) ctx.listing.delete(dir);
  for (const set of [ctx.expanded, ctx.unfolded]) for (const p of [...set]) if (underOrSame(path, p)) set.delete(p);
}

export const select = (ctx: FolderContext, sel: Selection, target?: string) => {
  ctx.setSelection(sel);
  if (target !== undefined) ctx.setScrollTarget(target);
};

const below = (dir: string) => (dir.endsWith("\\") ? dir : dir + "\\");

/** A folder closed over the selection: the selection moves up to that folder (the nearest row still shown). */
function hideUnder(ctx: FolderContext, dir: string): void {
  const sel = ctx.selection();
  if (sel.selected?.startsWith(below(dir))) ctx.setSelection(only(dir));
  else if (sel.marked.some((p) => p.startsWith(below(dir)))) ctx.setSelection({ ...sel, marked: sel.marked.filter((p) => !p.startsWith(below(dir))) });
}

/** Open or close one folder row; `path` is the last piece of a folded row. */
export function setExpanded(ctx: FolderContext, path: string, open: boolean): void {
  if (open) ctx.expanded.add(path);
  else {
    ctx.expanded.delete(path);
    hideUnder(ctx, path);
  }
  ctx.touch();
}

/** Alt+click, Expand All: a folder and everything below it opens or closes (I-089). The root stays open. */
export async function setSubtree(ctx: FolderContext, dir: string, open: boolean): Promise<void> {
  if (open) {
    for (const path of await foldersUnder(ctx, dir)) ctx.expanded.add(path);
  } else {
    for (const path of [...ctx.expanded]) if (path === dir || path.startsWith(below(dir))) ctx.expanded.delete(path);
    ctx.expanded.add(ctx.root);
    hideUnder(ctx, dir);
  }
  ctx.touch();
}

/** Ctrl+Right (I-032). */
export const expandAll = (ctx: FolderContext) => setSubtree(ctx, ctx.root, true);

/** Ctrl+Left (I-032, D-17): everything but the root closes. */
export function collapseEverything(ctx: FolderContext): void {
  ctx.expanded = collapseAll(ctx.expanded, ctx.root);
  hideUnder(ctx, ctx.root);
  ctx.touch();
}

// --- tabs --------------------------------------------------------------------------------------------------------

async function load(ctx: FolderContext, path: string): Promise<void> {
  let text = "";
  try {
    text = decodeText(await invoke<ArrayBuffer>("read_file", { path }));
  } catch {
    // an unreadable file shows as an empty read-only tab
  }
  const tab = ctx.tabs().find((t) => t.path === path);
  if (!tab || tab.view) return; // closed or replaced while it was read, or read twice and already shown
  tab.view = createFileView(text, path);
  ctx.setTabs((list) => [...list]); // same tab objects, new array: the Pane picks up the view
  if (tab.focus && ctx.tabs()[ctx.active() ?? -1] === tab) tab.view.focus();
}

/** Show `path` in the tree: open its folders, select it, scroll to it. Focus stays where it is (R-24, I-096). */
export function reveal(ctx: FolderContext, path: string): void {
  if (!path.toLowerCase().startsWith(ctx.root.toLowerCase())) return;
  let at = ctx.root.length;
  for (;;) {
    at = path.indexOf("\\", at + 1);
    if (at < 0) break;
    ctx.expanded.add(path.slice(0, at));
  }
  ctx.touch();
  select(ctx, only(path), path);
}

/** R-26: open a file as a preview tab (one click, Space) or a normal one (double or middle click, `focusEditor`). */
export function openFile(ctx: FolderContext, path: string, preview: boolean, focusEditor: boolean): void {
  const opened = openTab(ctx.tabs(), ctx.active(), path, preview, PANE_MAX_PREVIEW_TABS, (): Tab => ({ path, preview, view: null, focus: false }));
  opened.replaced?.view?.destroy();
  batch(() => {
    ctx.setTabs(opened.tabs);
    ctx.setActive(opened.active);
  });
  const tab = opened.tabs[opened.active];
  tab.focus = focusEditor;
  if (focusEditor) tab.view?.focus();
  if (opened.created) void load(ctx, path);
  reveal(ctx, path);
}

/** A click on a tab makes it the active one; the tree follows (R-24). */
export function activateTab(ctx: FolderContext, index: number): void {
  ctx.setActive(index);
  reveal(ctx, ctx.tabs()[index].path);
}

/** The folder goes (R-14): its tabs close with it. */
export function disposeContext(ctx: FolderContext): void {
  for (const tab of ctx.tabs()) tab.view?.destroy();
}
