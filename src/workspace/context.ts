import { batch, createSignal, type Accessor } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import type { EditorView } from "@codemirror/view";
import { createFileView, setEditable } from "../editor/file-view.ts";
import { notify } from "../shell/toast.ts";
import { PANE_MAX_PREVIEW_TABS } from "../spec/metrics.ts";
import type { Validation } from "./names.ts";
import { diffRange, followListing, underOrSame } from "./changes.ts";
import { confirmClose, saveDoc, saveErrorText, type Ask, type Closing } from "./closing.ts";
import { Doc, type Editor, type Io, type Status } from "./doc.ts";
import { relativePath } from "./ops.ts";
import { activeAfterClose, openTab, type TabInfo } from "./tabs.ts";
import { buildRows, collapseAll, joinPath, none, only, sortChildren, type Child, type Row, type Selection } from "./tree.ts";

// The work context of one folder (A-15, R-13): what its tree has expanded, selected and read, and its tabs. It stays in
// memory while the folder is registered and goes with it (R-14). Nothing here is saved to state.json.

/** What stays the same for a tab while its list entry is copied (promotion, rename): its file, editor and state. */
export type TabFile = { doc: Doc; view: EditorView | null; status: Accessor<Status> };
export type Tab = TabInfo & { file: TabFile; focus: boolean };


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
    recent: [] as TabFile[], // I-072: tabs in the order they were last active, the latest last
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


/** An item was renamed or moved: every path in this context that was in it follows (tree state, selection, tabs), in one update. */
export function followMove(ctx: FolderContext, from: string, to: string): void {
  const remap = (p: string) => (underOrSame(from, p) ? to + p.slice(from.length) : p);
  batch(() => {
    ctx.listing = followListing(ctx.root, ctx.listing, from, to);
    ctx.expanded = new Set([...ctx.expanded].map(remap));
    ctx.unfolded = new Set([...ctx.unfolded].map(remap));
    const sel = ctx.selection();
    ctx.setSelection({ selected: sel.selected && remap(sel.selected), marked: sel.marked.map(remap), anchor: sel.anchor && remap(sel.anchor) });
    const tabs = ctx.tabs();
    // New objects for the moved tabs: the tab list draws a title once per object, so changing the path in place would not show.
    for (const t of tabs) if (underOrSame(from, t.path)) t.file.doc.path = remap(t.path); // later reads and saves use the new path
    if (tabs.some((t) => underOrSame(from, t.path))) ctx.setTabs(tabs.map((t) => (underOrSame(from, t.path) ? { ...t, path: remap(t.path) } : t)));
    ctx.touch();
  });
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

const io: Io = {
  async read(path) {
    try {
      return new Uint8Array(await invoke<ArrayBuffer>("read_file", { path }));
    } catch (error) {
      const [exists] = await invoke<boolean[]>("paths_exist", { paths: [path] }).catch(() => [true]); // unsure: not "deleted"
      if (!exists) return null;
      throw error;
    }
  },
  save: async (path, text, format) =>
    new Uint8Array(await invoke<ArrayBuffer>("save_text", { path, text, encoding: format.encoding, lineEnding: format.lineEnding })),
};

/** D-6: the TaskDialog of the save questions (title E-080 "Warning", S-5). A dialog that cannot be shown is Cancel. */
export const askWarning: Ask = (main, content, buttons) =>
  invoke<number>("confirm_buttons", { title: "Warning", main, content, buttons }).catch(() => buttons.length - 1);

const tabOf = (ctx: FolderContext, file: TabFile) => ctx.tabs().find((t) => t.file === file);

/** A new tab entry and its file; the editor is made when the first read ends. */
function makeTab(ctx: FolderContext, path: string, preview: boolean): Tab {
  const [status, setStatus] = createSignal<Status>({ dirty: false, conflict: false, deleted: false });
  const editor: Editor = {
    text: () => file.view?.state.doc ?? null,
    set(text, editable) {
      if (!file.view) {
        file.view = createFileView(text, file.doc.path, editable, { changed: () => file.doc.refresh(), edited: () => promote(ctx, file) });
        ctx.setTabs((list) => [...list]); // same tab objects, new array: the Pane picks up the view
        const tab = tabOf(ctx, file);
        if (tab?.focus && ctx.tabs()[ctx.active() ?? -1] === tab) file.view.focus();
        return;
      }
      // One change from the first to the last difference: scroll and selection stay, and the parse is incremental (R-30).
      const change = diffRange(file.view.state.doc.toString(), text);
      if (change.from < change.to || change.insert !== "") file.view.dispatch({ changes: change });
      if (editable && file.view.state.readOnly) setEditable(file.view, true);
    },
  };
  const file: TabFile = { doc: new Doc(path, editor, io, setStatus), view: null, status };
  return { path, preview, file, focus: false };
}

/** I-063: an edit makes a preview tab a normal one. */
function promote(ctx: FolderContext, file: TabFile): void {
  if (tabOf(ctx, file)?.preview) ctx.setTabs((list) => list.map((t) => (t.file === file ? { ...t, preview: false } : t)));
}

function setActiveTab(ctx: FolderContext, index: number | null): void {
  ctx.setActive(index);
  const tab = index === null ? null : ctx.tabs()[index];
  if (tab) ctx.recent = [...ctx.recent.filter((f) => f !== tab.file), tab.file];
}

/** Take a tab out without asking (it was confirmed, or Close was chosen in E-085). The next active one is I-072's. */
function removeTab(ctx: FolderContext, file: TabFile): void {
  const tabs = ctx.tabs();
  const at = tabs.findIndex((t) => t.file === file);
  if (at < 0) return;
  const paneHadFocus = !!document.activeElement?.closest(".pane");
  const next = activeAfterClose(tabs.map((t) => t.file), at, ctx.active(), ctx.recent);
  file.doc.closed = true; // results still on the way are dropped (R-3)
  file.view?.destroy();
  ctx.recent = ctx.recent.filter((f) => f !== file);
  batch(() => {
    ctx.setTabs(tabs.filter((_, i) => i !== at));
    setActiveTab(ctx, next);
  });
  const tab = next === null ? null : ctx.tabs()[next];
  if (tab) reveal(ctx, tab.path);
  if (paneHadFocus) (tab?.file.view ?? document.querySelector<HTMLElement>(".pane"))?.focus();
}

/** The tabs of this folder as the close questions see them (E-081: the path relative to the folder). */
export const closingTabs = (ctx: FolderContext): Closing[] =>
  ctx.tabs().map((t) => ({ doc: t.file.doc, label: relativePath(ctx.root, ctx.rootName, t.path) }));

let closing = false; // one close question at a time

/** R-6: Ctrl+W, Ctrl+F4, the close button and the middle click all come here and ask first (I-073, I-075). */
export async function closeTab(ctx: FolderContext, file: TabFile): Promise<void> {
  const tab = tabOf(ctx, file);
  if (!tab || closing) return;
  closing = true;
  try {
    if (await confirmClose([{ doc: file.doc, label: relativePath(ctx.root, ctx.rootName, tab.path) }], askWarning)) removeTab(ctx, file);
  } finally {
    closing = false;
  }
}

/** R-4: Ctrl+S on the active tab. A failure is told with E-083's text. */
export async function saveActive(ctx: FolderContext): Promise<void> {
  const tab = ctx.tabs()[ctx.active() ?? -1];
  if (!tab) return;
  const saved = await saveDoc(tab.file.doc, askWarning);
  if (saved === "close") removeTab(ctx, tab.file);
  else if (typeof saved === "object") notify([saveErrorText(saved.failed)]);
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
  const opened = openTab(ctx.tabs(), ctx.active(), path, preview, PANE_MAX_PREVIEW_TABS, () => makeTab(ctx, path, preview), (t) => t.file.doc.dirty);
  if (opened.replaced) {
    opened.replaced.file.doc.closed = true;
    opened.replaced.file.view?.destroy();
    ctx.recent = ctx.recent.filter((f) => f !== opened.replaced!.file);
  }
  batch(() => {
    ctx.setTabs(opened.tabs);
    setActiveTab(ctx, opened.active);
  });
  const tab = opened.tabs[opened.active];
  tab.focus = focusEditor;
  if (focusEditor) tab.file.view?.focus();
  if (opened.created) void tab.file.doc.read();
  reveal(ctx, path);
}

/** A click on a tab makes it the active one; the tree follows (R-24). */
export function activateTab(ctx: FolderContext, index: number): void {
  setActiveTab(ctx, index);
  reveal(ctx, ctx.tabs()[index].path);
}

/** The folder goes (R-14): its tabs close with it. */
export function disposeContext(ctx: FolderContext): void {
  for (const tab of ctx.tabs()) {
    tab.file.doc.closed = true;
    tab.file.view?.destroy();
  }
}
