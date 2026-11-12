import { batch, createSignal, type Accessor, type Setter } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import type { EditorState } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { createFileView } from "../editor/file-view.ts";
import { setEditable } from "../editor/extensions.ts";
import type { IconName } from "../shell/Icon.tsx";
import { cursorPosition, locationOffset } from "../editor/position.ts";
import { notify } from "../shell/toast.ts";
import { PANE_MAX_PREVIEW_TABS } from "../spec/metrics.ts";
import type { Validation } from "./names.ts";
import { diffRange, followListing, underOrSame } from "./changes.ts";
import { confirmClose, saveDoc, saveErrorText, type Ask, type Closing } from "./closing.ts";
import { Doc, type Editor, type Io, type Status } from "./doc.ts";
import { pathKey } from "./paths.ts";
import { relativePath } from "./ops.ts";
import { entryIndex, place } from "./drop.ts";
import { inDirection, leaves, remove, split, type Dir, type Node } from "./split.ts";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { LinkTarget } from "../editor/markdown.ts";
import { previewKind, viewKind, type ViewKind } from "../editor/preview-kind.ts";
import { createPreview, type Preview } from "../shell/markdown-preview.ts";
import { viewBody } from "../shell/view-body.ts";
import { activeAfterClose, closeTargets, type CloseMode, openTab, opensPreview, stepTab, togglePin, type TabInfo } from "./tabs.ts";
import { buildRows, collapseAll, joinPath, none, only, sortChildren, type Child, type Row, type Selection } from "./tree.ts";

// The work context of one folder (A-15, R-13): what its tree has expanded, selected and read, and its tabs. It stays in
// memory while the folder is registered and goes with it (R-14). Nothing here is saved to state.json.

/** A 1-based position; with `endLine`/`endColumn` the range is selected. */
export type FileLocation = { line: number; column: number; endLine?: number; endColumn?: number };

/**
 * What stays the same for a tab while its list entry is copied (promotion, rename): its file, editor and state. A Markdown
 * preview tab (R-11) has no editor: `element` is its body, `dispose` lets go of what it holds.
 */
export type TabFile = { doc: Doc; view: EditorView | null; readOnly?: boolean; editable?: boolean; status: Accessor<Status>; position?: Accessor<string>; toolPosition?: Accessor<string>; title?: Accessor<string>; icon?: IconName; iconSuccess?: boolean; location?: FileLocation; element?: HTMLElement; dispose?: () => void; reveal?: (line: number, heading?: number) => void; find?: (action: string) => boolean };
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

export const [lockPreview, setLockPreview] = createSignal(false);
/** core v0.8.1 I-4: the Doc whose text changed or got its first view last (the Outline of a notebook, which has no parse, follows it). */
export const [changedDoc, setChangedDoc] = createSignal<Doc | null>(null, { equals: false });

export function newContext(root: string, rootName: string) {
  const [structure, setStructure] = createSignal(0); // bumped when what the rows are built from changes
  const [selection, setSelection] = createSignal<Selection>(none);
  const first = newPane();
  const [tree, setTree] = createSignal<Node<PaneState>>(first); // D-8: the split tree, not saved (INTENT)
  const [pane, setPane] = createSignal<PaneState>(first); // the active Pane
  const [zoomed, setZoomed] = createSignal<PaneState | null>(null); // I-730
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
    structure, selection, setSelection, scrollTarget, setScrollTarget, edit, setEdit, issue, setIssue,
    tree, setTree, pane, setPane, zoomed, setZoomed,
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
    // Later reads and saves use the new path; once per file, however many Panes show it.
    for (const doc of new Set(allTabs(ctx).filter((t) => underOrSame(from, t.path)).map((t) => t.file.doc))) doc.path = remap(doc.path);
    // New objects for the moved tabs: the tab list draws a title once per object, so changing the path in place would not show.
    for (const pane of panesOf(ctx)) {
      const tabs = pane.tabs();
      if (tabs.some((t) => underOrSame(from, t.path))) pane.setTabs(tabs.map((t) => (underOrSame(from, t.path) ? { ...t, path: remap(t.path) } : t)));
    }
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

// --- panes and tabs (R-8, R-9, D-8) ------------------------------------------------------------------------------

/** One Pane: its tabs, the active one, and the order its tabs were last active (I-072). */
export type PaneState = {
  id: number;
  tabs: Accessor<Tab[]>;
  setTabs: Setter<Tab[]>;
  active: Accessor<number | null>;
  setActive: Setter<number | null>;
  recent: TabFile[];
};

let nextPane = 1;
export function newPane(): PaneState {
  const [tabs, setTabs] = createSignal<Tab[]>([]);
  const [active, setActive] = createSignal<number | null>(null);
  return { id: nextPane++, tabs, setTabs, active, setActive, recent: [] };
}

export const panesOf = (ctx: FolderContext): PaneState[] => leaves(ctx.tree());
export const allTabs = (ctx: FolderContext): Tab[] => panesOf(ctx).flatMap((p) => p.tabs());
export const activeTabOf = (pane: PaneState): Tab | undefined => pane.tabs()[pane.active() ?? -1];
const paneOf = (ctx: FolderContext, file: TabFile) => panesOf(ctx).find((p) => p.tabs().some((t) => t.file === file));
const tabIn = (pane: PaneState, file: TabFile) => pane.tabs().find((t) => t.file === file);
export const paneElement = (pane: PaneState) => document.querySelector<HTMLElement>(`[data-pane-id="${pane.id}"]`);

/** Focus the Pane's active editor (or preview), else the Pane itself. */
export const focusPane = (pane: PaneState) => {
  const file = activeTabOf(pane)?.file;
  (file?.view ?? file?.element ?? paneElement(pane))?.focus();
};

// D-8: one Doc per file, however many Panes show it. Each tab has its own view of it; the views pass their changes on.
const filesOf = new WeakMap<Doc, TabFile[]>();
const statusOf = new WeakMap<Doc, Accessor<Status>>();
const liveView = (doc: Doc) => filesOf.get(doc)?.find((f) => f.view)?.view ?? null;
/**
 * D-8: the view whose undo history is the file's: the first one. The others pass their edits into it and undo there.
 * shortcut: the history goes with that view (its tab closed); the next one then has only its own edits. Move the history
 * state over (historyField) if that matters.
 */
export const historyView = (file: TabFile) => liveView(file.doc);
// R-11: a preview of a file no editor tab shows reads it through a view of its own that is in no tab.
const hidden = new WeakSet<TabFile>();
const shownFiles = (doc: Doc) => (filesOf.get(doc) ?? []).filter((f) => !hidden.has(f));
// R-11 (I-082, I-083): the previews of a file follow its changes and its cursor.
const previewsOf = new WeakMap<Doc, Set<Preview>>();
const previews = (doc: Doc) => previewsOf.get(doc) ?? new Set<Preview>();

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

function makeView(ctx: FolderContext, file: TabFile, text: string, editable: boolean): void {
  const [position, setPosition] = createSignal("1:1");
  file.position = position;
  file.editable = editable;
  file.view = createFileView(text, file.doc.path, editable && !file.readOnly, {
    changed: () => {
      file.doc.refresh();
      for (const p of previews(file.doc)) p.changed();
      setChangedDoc(file.doc);
    },
    edited: () => promote(ctx, file),
    peers: () => (filesOf.get(file.doc) ?? []).flatMap((f) => (f !== file && f.view ? [f.view] : [])),
    keeper: () => liveView(file.doc),
    cursor: (line, state) => {
      setPosition(cursorPosition(state));
      if (!hidden.has(file)) for (const p of previews(file.doc)) p.cursor(line);
    },
  });
  if (file.location) locateFile(file, file.location);
}

function locateFile(file: TabFile, location: FileLocation): void {
  file.location = location;
  if (!file.view) return;
  const doc = file.view.state.doc;
  const head = location.endLine === undefined || location.endColumn === undefined ? undefined : locationOffset(doc, { line: location.endLine, column: location.endColumn });
  file.view.dispatch({ selection: { anchor: locationOffset(doc, location), head }, scrollIntoView: true });
  file.location = undefined;
}

/** A new file for a tab; the editors are made when the first read ends. */
function newFile(ctx: FolderContext, path: string): TabFile {
  const [status, setStatus] = createSignal<Status>({ dirty: false, conflict: false, deleted: false });
  const editor: Editor = {
    text: () => liveView(doc)?.state.doc ?? null,
    set(text, editable) {
      const files = filesOf.get(doc) ?? [];
      const live = liveView(doc);
      if (live) {
        // One change from the first to the last difference: scroll and selection stay, and the parse is incremental (R-30).
        const change = diffRange(live.state.doc.toString(), text);
        if (change.from < change.to || change.insert !== "") live.dispatch({ changes: change }); // the peers follow
        if (editable) for (const f of files) {
          f.editable = true;
          if (f.view) setEditable(f.view, !f.readOnly);
        }
      }
      const made = files.filter((f) => !f.view);
      if (made.length === 0) return;
      for (const f of made) makeView(ctx, f, text, editable);
      for (const p of previews(doc)) p.changed(); // a preview waiting for the first read
      setChangedDoc(doc);
      for (const pane of panesOf(ctx)) if (pane.tabs().some((t) => made.includes(t.file))) pane.setTabs((list) => [...list]); // the Pane picks up the view
      const tab = activeTabOf(ctx.pane());
      if (tab?.focus && made.includes(tab.file)) tab.file.view!.focus();
    },
  };
  const doc: Doc = new Doc(path, editor, io, setStatus);
  const file: TabFile = { doc, view: null, status };
  filesOf.set(doc, [file]);
  statusOf.set(doc, status);
  return file;
}

/** A second tab of the same file (ClonePane, or the file opened in another Pane): same Doc, its own view. */
function twinOf(ctx: FolderContext, file: TabFile): TabFile {
  const twin: TabFile = { doc: file.doc, view: null, status: statusOf.get(file.doc)! };
  filesOf.get(file.doc)!.push(twin);
  const original = filesOf.get(file.doc)!.find((f) => f.view);
  if (original?.view) makeView(ctx, twin, original.view.state.doc.toString(), original.editable !== false);
  return twin;
}

/** A tab's view goes; the Doc goes with its last view (its pending results are dropped, R-3). A preview lets go of its own. */
function release(file: TabFile): void {
  if (file.element) return file.dispose?.();
  file.view?.destroy();
  const rest = (filesOf.get(file.doc) ?? []).filter((f) => f !== file);
  filesOf.set(file.doc, rest);
  if (rest.length === 0) file.doc.closed = true;
}

/** I-063: an edit makes a preview tab a normal one. */
function promote(ctx: FolderContext, file: TabFile): void {
  const pane = paneOf(ctx, file);
  if (pane && tabIn(pane, file)?.preview) pane.setTabs((list) => list.map((t) => (t.file === file ? { ...t, preview: false } : t)));
}

function setActiveTab(pane: PaneState, index: number | null): void {
  const tab = index === null ? null : pane.tabs()[index];
  pane.setActive(index);
  if (tab) pane.recent = [...pane.recent.filter((f) => f !== tab.file), tab.file];
}

/** The Pane that gets what the tree opens and what the keys act on. Another Pane taking it ends the zoom of the old one. */
export function activatePane(ctx: FolderContext, pane: PaneState): void {
  if (ctx.pane() === pane) return;
  batch(() => {
    if (ctx.zoomed() && ctx.zoomed() !== pane) ctx.setZoomed(null);
    ctx.setPane(pane);
  });
  const tab = activeTabOf(pane);
  if (tab) reveal(ctx, tab.path);
}

/** I-728: an emptied Pane leaves the tree unless it is the only one; the Pane now in its place becomes the active one. */
function closePane(ctx: FolderContext, pane: PaneState, focus: boolean): void {
  const panes = panesOf(ctx);
  if (panes.length <= 1) return;
  const index = panes.indexOf(pane);
  const tree = remove(ctx.tree(), pane)!;
  const rest = leaves(tree);
  batch(() => {
    if (ctx.zoomed() === pane) ctx.setZoomed(null);
    ctx.setTree(tree);
    if (ctx.pane() === pane) ctx.setPane(rest[Math.min(index, rest.length - 1)]);
  });
  const tab = activeTabOf(ctx.pane());
  if (tab) reveal(ctx, tab.path);
  if (focus) focusPane(ctx.pane());
}

/** Take a tab out without asking (it was confirmed, or Close was chosen in E-085). The next active one is I-072's. */
function removeTab(ctx: FolderContext, file: TabFile, keepFile = false): void {
  const pane = paneOf(ctx, file);
  if (!pane) return;
  const tabs = pane.tabs();
  const at = tabs.findIndex((t) => t.file === file);
  const hadFocus = !!paneElement(pane)?.contains(document.activeElement);
  const next = activeAfterClose(tabs.map((t) => t.file), at, pane.active(), pane.recent);
  if (!keepFile) release(file);
  pane.recent = pane.recent.filter((f) => f !== file);
  batch(() => {
    pane.setTabs(tabs.filter((_, i) => i !== at));
    setActiveTab(pane, next);
  });
  if (pane.tabs().length === 0 && panesOf(ctx).length > 1) return closePane(ctx, pane, hadFocus);
  const tab = next === null ? null : pane.tabs()[next];
  if (tab && ctx.pane() === pane) reveal(ctx, tab.path);
  if (hadFocus) focusPane(pane);
}

/** The files of this folder as the close questions see them, once per file (E-081: the path relative to the folder). */
export function closingTabs(ctx: FolderContext): Closing[] {
  const seen = new Set<Doc>();
  const out: Closing[] = [];
  for (const t of allTabs(ctx)) {
    if (t.tool || t.markdown || seen.has(t.file.doc)) continue; // non-file tabs do not own modified text
    seen.add(t.file.doc);
    out.push({ doc: t.file.doc, label: relativePath(ctx.root, ctx.rootName, t.path) });
  }
  return out;
}

let closing = false; // one close question at a time

/**
 * R-6: Ctrl+W, Ctrl+F4, the close button and the middle click all come here and ask first (I-073, I-075). They leave a
 * pinned tab alone (I-066); only Close Editor in the menu passes `closePinned` (I-356). No question while another tab
 * still shows the same file (I-069).
 */
export async function closeTab(ctx: FolderContext, file: TabFile, closePinned = false): Promise<void> {
  const pane = paneOf(ctx, file);
  const tab = pane && tabIn(pane, file);
  if (!tab || closing || (tab.pinned && !closePinned)) return;
  if (tab.tool || tab.markdown || shownFiles(file.doc).length > 1) return removeTab(ctx, file);
  closing = true;
  try {
    if (!(await confirmClose([{ doc: file.doc, label: relativePath(ctx.root, ctx.rootName, tab.path) }], askWarning))) return;
    removeTab(ctx, file);
    // Don't Save while a preview still holds the file: the edits go, so the preview shows the disk again.
    if (file.doc.dirty && !file.doc.closed) void file.doc.read(true);
  } finally {
    closing = false;
  }
}

/** I-9: a tab lock is independent of disk readability and other views of the document. */
export function toggleTabReadOnly(file: TabFile): void {
  file.readOnly = !file.readOnly;
  if (file.view) setEditable(file.view, file.editable !== false && !file.readOnly);
}

/** I-9: reuse save confirmation for each target; Cancel stops the remaining closes. */
export async function closeTabGroup(ctx: FolderContext, pane: PaneState, file: TabFile, mode: CloseMode): Promise<void> {
  const tabs = pane.tabs();
  const index = tabs.findIndex((tab) => tab.file === file);
  if (index < 0) return;
  for (const tab of closeTargets(tabs, index, mode, (t) => !t.tool && !t.markdown && t.file.doc.dirty)) {
    await closeTab(ctx, tab.file);
    if (pane.tabs().some((t) => t.file === tab.file)) return;
  }
}

/**
 * R-11: open the preview of `path` (I-077; a file with no preview kind is ignored), in `from`'s Pane, or with `side` in its right neighbour or a new
 * Pane split to the right (I-078; focus then stays where it was). One already there is activated (I-079).
 */
export function openPreview(ctx: FolderContext, from: PaneState, path: string, side: boolean, focus = true, temporary = false): void {
  const kind = previewKind(path);
  if (!kind) return;
  let pane = from;
  if (side) {
    pane = paneInDirection(ctx, from, "right") ?? newPane();
    if (!panesOf(ctx).includes(pane)) ctx.setTree(split(ctx.tree(), from, "right", pane));
  }
  const make = (): Tab => {
    const source = allTabs(ctx).find((t) => t.path === path && !t.file.doc.closed);
    const holder = source ? twinOf(ctx, source.file) : newFile(ctx, path);
    hidden.add(holder);
    if (!source) void holder.doc.read();
    const [position, setPosition] = createSignal("1:1");
    const reveal = (line: number, heading?: number) => {
      preview.reveal(line, heading);
      if (heading === undefined) { setPosition(`${line + 1}:1`); selectSourceLine(holder.doc, line); } // as a click on the block (I-084)
    };
    const preview = createPreview({
      kind,
      text: () => liveView(holder.doc)?.state.doc.toString() ?? null,
      sourcePath: () => holder.doc.path,
      line: (line) => {
        // shortcut: preview clicks resolve to block starts; add token offsets if exact columns are required.
        setPosition(`${line + 1}:1`);
        selectSourceLine(holder.doc, line);
      },
      link: (target) => followLink(ctx, pane, target),
    });
    const set = previewsOf.get(holder.doc) ?? new Set<Preview>();
    previewsOf.set(holder.doc, set.add(preview));
    const [status] = createSignal<Status>({ dirty: false, conflict: false, deleted: false }); // a preview is never modified
    const dispose = () => {
      preview.dispose();
      set.delete(preview);
      release(holder);
    };
    return { path, preview: temporary, pinned: false, markdown: true, file: { doc: holder.doc, view: null, status, position, element: preview.element, dispose, reveal, find: preview.find }, focus: false };
  };
  // core I-5: a tree click (`temporary`) follows the editor tabs' temporary-tab rule, so it may replace one of them.
  // A preview tab never holds edits (its doc is the source's), so only a modified editor tab is kept.
  const opened = openTab(pane.tabs(), pane.active(), path, temporary, PANE_MAX_PREVIEW_TABS, make, (t) => !t.markdown && t.file.doc.dirty, true);
  if (opened.replaced) {
    release(opened.replaced.file);
    pane.recent = pane.recent.filter((f) => f !== opened.replaced!.file);
  }
  pane.setTabs(opened.tabs);
  if (side) {
    setActiveTab(pane, opened.active);
    focusPane(from); // the toolbar button took it, and a split draws `from` again
    return;
  }
  activateTab(ctx, pane, opened.active);
  if (focus) focusPane(pane);
}

/** I-084: the source's selection goes to the start of `line`, in the editor tabs that show it; focus does not move. */
function selectSourceLine(doc: Doc, line: number): void {
  for (const f of shownFiles(doc)) {
    const view = f.view;
    if (!view) continue;
    const at = view.state.doc.line(Math.min(line + 1, view.state.doc.lines)).from;
    view.dispatch({ selection: { anchor: at }, scrollIntoView: true });
  }
}

/** I-085: a local Markdown link opens its preview here, another local file an editor tab, a URL the system browser. */
function followLink(ctx: FolderContext, pane: PaneState, target: LinkTarget): void {
  if (target.kind === "preview") openPreview(ctx, pane, target.path, false);
  else if (target.kind === "open") {
    activatePane(ctx, pane);
    openFile(ctx, target.path, false, true);
  } else if (target.kind === "external") void openUrl(target.url).catch((error) => notify([String(error)])); // only http(s) is allowed
}

/** R-18: Show Source and Ctrl+Shift+V keep the preview and open or activate its source. */
export function openPreviewSource(ctx: FolderContext, file: TabFile): void {
  const pane = paneOf(ctx, file);
  const tab = pane && tabIn(pane, file);
  if (!pane || !tab?.markdown) return;
  activatePane(ctx, pane);
  const existing = panesOf(ctx).find((p) => p.tabs().some((t) => t.path === tab.path && !t.markdown && !t.tool));
  if (existing) activatePane(ctx, existing);
  openSource(ctx, tab.path, false, true);
}

/** The eye/OpenPreview toggle retains its existing close-and-return behavior. */
export function closePreviewToSource(ctx: FolderContext, file: TabFile): void {
  const pane = paneOf(ctx, file);
  const tab = pane && tabIn(pane, file);
  if (!pane || !tab?.markdown) return;
  activatePane(ctx, pane);
  openSource(ctx, tab.path, false, true);
  removeTab(ctx, file);
  focusPane(ctx.pane());
}

/**
 * I-732 / I-078: the Pane past `from`'s edge toward `dir`, by the Panes' places on screen. A Pane's place is its slot in
 * the tree: a zoomed one covers the others but keeps its slot (I-730), and moving to a neighbour ends the zoom (activatePane).
 */
export function paneInDirection(ctx: FolderContext, from: PaneState, dir: Dir): PaneState | null {
  const rects = panesOf(ctx).flatMap((pane) => {
    const r = paneElement(pane)?.parentElement?.getBoundingClientRect();
    return r ? [{ key: pane, left: r.left, top: r.top, right: r.right, bottom: r.bottom }] : [];
  });
  return inDirection(rects, from, dir);
}

/** R-4: Ctrl+S on the active tab. A failure is told with E-083's text. */
export async function saveActive(ctx: FolderContext): Promise<void> {
  const tab = activeTabOf(ctx.pane());
  if (!tab || tab.tool) return;
  const saved = await saveDoc(tab.file.doc, askWarning);
  if (saved === "close") removeTab(ctx, tab.file);
  else if (typeof saved === "object") notify([saveErrorText(saved.failed)]);
}

/** Show `path` in the tree: open its folders, select it, scroll to it. Focus stays where it is (R-24, I-096). */
export function reveal(ctx: FolderContext, path: string): void {
  if (!ctx.root) return;
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

/**
 * R-26: open a file in the active Pane as a preview tab (one click, Space) or a normal one (double or middle click,
 * `focusEditor`). A file already shown in another Pane gets a second view of the same Doc (D-8).
 */
export function openFile(ctx: FolderContext, path: string, preview: boolean, focusEditor: boolean, location?: FileLocation): void {
  const kind = viewKind(path);
  if (kind) return openView(ctx, path, kind, preview, focusEditor); // I-8 / I-9: before anything reads the file as text
  if (opensPreview(path, lockPreview())) {
    const existing = panesOf(ctx).find((p) => p.tabs().some((t) => t.path === path && !t.markdown && !t.tool));
    if (existing) activatePane(ctx, existing);
    else {
      openPreview(ctx, ctx.pane(), path, false, focusEditor, preview);
      return;
    }
  }
  openSource(ctx, path, preview, focusEditor, location);
}

function openSource(ctx: FolderContext, path: string, preview: boolean, focusEditor: boolean, location?: FileLocation): void {
  const pane = ctx.pane();
  const shown = allTabs(ctx).find((t) => t.path === path);
  const make = (): Tab => ({ path, preview, pinned: false, file: shown ? twinOf(ctx, shown.file) : newFile(ctx, path), focus: false });
  const opened = openTab(pane.tabs(), pane.active(), path, preview, PANE_MAX_PREVIEW_TABS, make, (t) => t.file.doc.dirty);
  if (opened.replaced) {
    release(opened.replaced.file);
    pane.recent = pane.recent.filter((f) => f !== opened.replaced!.file);
  }
  batch(() => {
    pane.setTabs(opened.tabs);
    setActiveTab(pane, opened.active);
  });
  const tab = opened.tabs[opened.active];
  if (location) locateFile(tab.file, location);
  tab.focus = focusEditor;
  if (focusEditor) tab.file.view?.focus();
  if (opened.created && !shown) void tab.file.doc.read();
  reveal(ctx, path);
}

/**
 * core v0.8 I-8 / I-9: an image or PDF has no editor and no source. It is a tab of the tool kind (no save, no toolbar, no
 * editor keys, closes without asking) whose path is the file's, so the tree follows it and a click makes it a temporary tab.
 * shortcut: the picture is not redrawn when the file changes on disk (the watcher skips tool tabs); reopen the tab to see it.
 */
function openView(ctx: FolderContext, path: string, kind: ViewKind, preview: boolean, focusEditor: boolean): void {
  for (const other of panesOf(ctx)) {
    const at = other.tabs().findIndex((t) => t.tool && t.path === path);
    if (at < 0) continue;
    if (!preview) keepTab(ctx, other.tabs()[at].file);
    activateTab(ctx, other, at);
    if (focusEditor) focusPane(other);
    return;
  }
  const pane = ctx.pane();
  const make = (): Tab => {
    const file = newFile(ctx, path);
    file.element = viewBody(path, kind);
    file.dispose = () => { file.doc.closed = true; filesOf.delete(file.doc); };
    return { path, preview, pinned: false, tool: true, file, focus: false };
  };
  const opened = openTab(pane.tabs(), pane.active(), path, preview, PANE_MAX_PREVIEW_TABS, make, (t) => t.file.doc.dirty);
  if (opened.replaced) {
    release(opened.replaced.file);
    pane.recent = pane.recent.filter((f) => f !== opened.replaced!.file);
  }
  pane.setTabs(opened.tabs);
  activateTab(ctx, pane, opened.active);
  if (focusEditor) focusPane(pane);
}

/** A click on a tab makes it and its Pane the active ones (a preview tab stays one, I-063); the tree follows (R-24). */
export function activateTab(ctx: FolderContext, pane: PaneState, index: number): void {
  activatePane(ctx, pane);
  setActiveTab(pane, index);
  reveal(ctx, pane.tabs()[index].path);
}

/**
 * Non-file tabs reuse Pane activation and closing without reading their title as a path. The body is an `element`, or an
 * editor `view` (a read-only text such as Licenses, I-30): the Pane shows its DOM, the settings and keys reach it as in a file tab.
 */
export function openTool(ctx: FolderContext, title: string, make: () => { element?: HTMLElement; view?: EditorView; dispose: () => void; title?: Accessor<string>; icon?: IconName; iconSuccess?: boolean; toolPosition?: Accessor<string> }): void {
  for (const pane of panesOf(ctx)) {
    const index = pane.tabs().findIndex((t) => t.tool && t.path === title);
    if (index >= 0) { activateTab(ctx, pane, index); focusPane(pane); return; }
  }
  const pane = ctx.pane();
  const body = make();
  const file = newFile(ctx, title);
  file.element = body.element;
  file.view = body.view ?? null; // release() destroys it with the tab, as it does a file's view
  file.title = body.title;
  file.icon = body.icon;
  file.iconSuccess = body.iconSuccess;
  file.toolPosition = body.toolPosition;
  file.dispose = () => { body.dispose(); file.doc.closed = true; filesOf.delete(file.doc); };
  const opened = openTab(pane.tabs(), pane.active(), title, false, PANE_MAX_PREVIEW_TABS,
    () => ({ path: title, preview: false, tool: true, file, focus: true }));
  pane.setTabs(opened.tabs);
  activateTab(ctx, pane, opened.active);
  focusPane(pane);
}

/** ORDER-11 U-2: move by tab bar position without changing the document cursor. */
export function goThroughHistory(ctx: FolderContext, pane: PaneState, mode: "back" | "forward"): void {
  const index = stepTab(pane.tabs().length, pane.active(), mode === "back" ? -1 : 1);
  if (index === null) return;
  activateTab(ctx, pane, index);
  focusPane(pane);
}

/** I-063: a double click on a tab makes it a normal one. */
export function keepTab(ctx: FolderContext, file: TabFile): void {
  paneOf(ctx, file)?.setTabs((list) => list.map((t) => (t.file === file && t.preview ? { ...t, preview: false } : t)));
}

/** I-014 / I-065: pin or unpin a tab; its place moves with the pin area's edge. */
export function togglePinTab(ctx: FolderContext, file: TabFile): void {
  const pane = paneOf(ctx, file);
  if (!pane) return;
  const next = togglePin(pane.tabs(), pane.tabs().findIndex((t) => t.file === file), pane.active());
  batch(() => {
    pane.setTabs(next.tabs);
    pane.setActive(next.active);
  });
}

/** I-010: Ctrl+PageUp / PageDown in the active Pane. */
export function stepActiveTab(ctx: FolderContext, dir: 1 | -1): void {
  const pane = ctx.pane();
  const index = stepTab(pane.tabs().length, pane.active(), dir);
  if (index === null) return;
  const inPane = !!paneElement(pane)?.contains(document.activeElement); // read before the old editor leaves the DOM
  activateTab(ctx, pane, index);
  if (inPane) focusPane(pane); // focus follows the tab
}

const opposite = { up: "down", down: "up", left: "right", right: "left" } as const;

/**
 * R-9: split `pane` toward `dir` (I-707~I-709). clone: the active item gets a second view in a new Pane. empty: a new
 * empty Pane. move: the active item goes to a new Pane, unless it is the only tab: then the empty Pane goes on the other
 * side and the item stays, which is the same layout. Focus goes where the item is.
 */
export function splitPane(ctx: FolderContext, pane: PaneState, dir: Dir, mode: "clone" | "empty" | "move"): void {
  const tab = activeTabOf(pane);
  if (mode !== "empty" && !tab) return; // I-708: nothing to clone or move
  if (mode === "clone" && (tab!.markdown || tab!.tool)) return;
  const fresh = newPane();
  let side: Dir = dir;
  let focus = fresh;
  if (mode === "clone") {
    fresh.setTabs([{ path: tab!.path, preview: false, pinned: false, file: twinOf(ctx, tab!.file), focus: true }]);
    setActiveTab(fresh, 0);
  } else if (mode === "move" && pane.tabs().length <= 1) {
    side = opposite[dir];
    focus = pane;
  } else if (mode === "move") {
    removeTab(ctx, tab!.file, true);
    fresh.setTabs([{ ...tab!, preview: false }]); // the same view moves (03-tauri R-01)
    setActiveTab(fresh, 0);
  }
  batch(() => {
    ctx.setZoomed(null);
    ctx.setTree(split(ctx.tree(), pane, side, fresh));
  });
  activatePane(ctx, focus);
  focusPane(focus);
}

/** Where a dragged tab goes (R-10): before a tab, the tab bar's end, the body's center, or a new Pane at an edge. */
export type DropWhere = { kind: "tab"; index: number } | { kind: "end" } | { kind: "center" } | { kind: "split"; dir: Dir };

/**
 * R-10 (I-715~I-720): drop the tab of `file` on `to`. A move takes the same Tab and EditorView (03-tauri R-01); `copy`
 * (Ctrl held, I-718) puts a second view of the file in `to` the way opening does, and leaves the original. A Pane that
 * already shows the file only activates its tab (I-068). The source Pane closes when it is left empty (I-728).
 */
export function dropTab(ctx: FolderContext, file: TabFile, to: PaneState, where: DropWhere, copy: boolean): void {
  const from = paneOf(ctx, file);
  const tab = from && tabIn(from, file);
  if (!from || !tab) return;
  if (tab.markdown || tab.tool) copy = false; // non-file tabs move instead of duplicating their state
  let target = to;
  if (where.kind === "split") {
    target = newPane();
    ctx.setTree(split(ctx.tree(), to, where.dir, target));
  } else if (from === to && (where.kind === "center" || copy)) return; // already there; a copy in the same Pane would duplicate it
  const there = target.tabs().find((t) => t.path === tab.path && !!t.markdown === !!tab.markdown && t.file !== file);
  if (there) {
    if (!copy) removeTab(ctx, file); // its file stays open in `there`, so only this view goes
    activateTab(ctx, target, target.tabs().indexOf(there));
  } else if (copy) {
    const twin: Tab = { path: tab.path, preview: false, pinned: false, file: twinOf(ctx, file), focus: false };
    const opened = openTab(target.tabs(), target.active(), tab.path, false, PANE_MAX_PREVIEW_TABS, () => twin); // no position (I-718)
    target.setTabs(opened.tabs);
    activateTab(ctx, target, opened.active);
  } else {
    if (from !== target) removeTab(ctx, file, true);
    const rest = target.tabs().filter((t) => t.file !== file);
    // A tab's index in the list before the move is also where the moved tab ends up, before or after that tab (I-715).
    const index = where.kind === "tab" ? where.index : where.kind === "center" ? (target.active() ?? -1) + 1 : rest.length;
    const placed = place(rest, index, tab);
    target.setTabs(placed.tabs);
    activateTab(ctx, target, placed.index);
  }
  focusPane(target);
}

/**
 * core I-3: a tree file dropped on `to` opens there as a normal tab (Zed handle_project_entry_drop), at the place a dragged
 * tab would land (R-10): before a tab (pinned when that tab is), at the end, after the active tab, or in a new Pane at an edge.
 */
export function dropEntry(ctx: FolderContext, path: string, to: PaneState, where: DropWhere): void {
  let target = to;
  if (where.kind === "split") {
    target = newPane();
    ctx.setTree(split(ctx.tree(), to, where.dir, target));
  }
  const before = target.tabs();
  activatePane(ctx, target);
  openFile(ctx, path, false, true);
  const tabs = target.tabs(), at = target.active();
  if ((where.kind !== "tab" && where.kind !== "end") || at === null || tabs[at]?.path !== path) return;
  // Reused, not made: whatever tab kind openTab matched (source, preview, tool) keeps its file; a new tab has a new one.
  const existed = before.some((t) => t.file === tabs[at].file);
  const rest = tabs.filter((_, i) => i !== at);
  const placed = place(rest, where.kind === "end" ? rest.length : entryIndex(where.index, at, existed), tabs[at]);
  target.setTabs(placed.tabs);
  activateTab(ctx, target, placed.index);
}

/** The folder goes (R-14): its tabs close with it. */
export function disposeContext(ctx: FolderContext): void {
  for (const tab of allTabs(ctx)) release(tab.file);
}
