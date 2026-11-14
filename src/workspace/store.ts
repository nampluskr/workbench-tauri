import { batch, createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { notify } from "../shell/toast.ts";
import { SIDEBAR_WIDTH, STATE_SAVE_DEBOUNCE_MS } from "../spec/metrics.ts";
import { addOrActivate, isSorted, move, moveCursor as nextCursor, remove, rename, sortFolders, type Folder, type FolderSort } from "./folders.ts";
import { askWarning, closingTabs, disposeContext, lockPreview, setLockPreview, newContext, type FolderContext } from "./context.ts";
import { closeEach, confirmClose } from "./closing.ts";
import { folderName, normalizePath } from "./paths.ts";
import { OUTLINE_DEFAULT, parseState, serializeState, type Outline, type PanelLayout } from "./state-file.ts";
import { addRecent, dropMissing, removeRecent } from "./recent.ts";

// The registered folders and the state.json that keeps them (R-11~R-16, R-29, D-8, D-11). Folders, their order and
// the active one are saved; the keyboard cursor and the existing-path marks are not.
const READ_ERROR = "Could not read the window state.";
const CANNOT_OPEN = "Cannot open this folder."; // A-16.4

const [folders, setFolders] = createSignal<Folder[]>([]);
const [activeId, setActiveId] = createSignal<string | null>(null);
const [cursorId, setCursorId] = createSignal<string | null>(null); // keyboard cursor of the sidebar (D-8)
const [missingIds, setMissingIds] = createSignal<ReadonlySet<string>>(new Set()); // folders whose path is gone (A-16.2)
const [sidebarWidth, setSidebarWidth] = createSignal(SIDEBAR_WIDTH.default);
const [outline, setOutline] = createSignal<Outline>(OUTLINE_DEFAULT); // core v0.8.1 I-4
const [recentFolders, setRecentFolders] = createSignal<string[]>([]); // core v0.8.2 I-3: paths, newest first
const [panelLayout, setLayout] = createSignal<PanelLayout>("left"); // core v0.8.3 I-17
export { folders, activeId, cursorId, missingIds, sidebarWidth, recentFolders, panelLayout };
export const outlineOpen = () => outline().open;
export const outlineWidth = () => outline().width;

export const activeFolder = (): Folder | null => folders().find((f) => f.id === activeId()) ?? null;

// Work context per folder (A-15): tree state and tabs. Made on first use, dropped with the folder (R-14).
const contexts = new Map<string, FolderContext>();
// A real Pane for utility tabs and their JSON files before a project is opened; never registered as a folder.
export const emptyContext = newContext("", "");
export const editorContext = (): FolderContext => activeContext() ?? emptyContext;
export function contextOf(folder: Folder): FolderContext {
  let ctx = contexts.get(folder.id);
  if (!ctx) contexts.set(folder.id, (ctx = newContext(folder.path, folderName(folder.path))));
  return ctx;
}

export const activeContext = (): FolderContext | null => {
  const folder = activeFolder();
  return folder ? contextOf(folder) : null;
};

// --- saving ------------------------------------------------------------------

type Raw = Parameters<typeof serializeState>[0];
export { write as flushWorkspaceState };
let raw: Raw = {};
let canWrite = false; // false until a state was read, and for good when the core or the file says read-only
let dirty = false;
let timer = 0;
let queue: Promise<void> = Promise.resolve();

function write(): Promise<void> {
  queue = queue.then(async () => {
    if (!dirty || !canWrite) return;
    dirty = false;
    try {
      await invoke("write_state", { json: serializeState(raw, { folders: folders(), activeId: activeId(), sidebarWidth: sidebarWidth(), lockPreview: lockPreview(), outline: outline(), panelLayout: panelLayout(), recent: recentFolders() }) });
    } catch (reason) {
      dirty = true; // memory keeps the state; the next change writes it again from the start (A-24.4)
      notify([String(reason)]);
    }
  });
  return queue;
}

/** Called after every saved change: write once the changes have stopped for the debounce time (A-24.2). */
function changed(): void {
  dirty = true;
  clearTimeout(timer);
  timer = window.setTimeout(() => void write(), STATE_SAVE_DEBOUNCE_MS);
}

/**
 * A-24.3: every way of closing (Quit, Close Window, the title bar button, Alt+F4, the taskbar) raises the window's
 * close request. Hold it, ask about modified tabs of every folder (R-6, D-6), write what is pending, then close for
 * good. A failed state write was already reported and must not keep the window open.
 */
export function guardClose(): Promise<unknown> {
  const appWindow = getCurrentWindow();
  let asking = false;
  return appWindow.onCloseRequested(async (event) => {
    event.preventDefault();
    if (asking) return; // a second request while the question is open
    asking = true;
    try {
      if (!(await confirmClose([emptyContext, ...contexts.values()].flatMap(closingTabs), askWarning))) return;
    } finally {
      asking = false;
    }
    clearTimeout(timer);
    await write();
    await appWindow.destroy().catch(() => {});
  });
}

// --- loading -----------------------------------------------------------------

export async function markMissing(list: Folder[]): Promise<void> {
  try {
    const exists = await invoke<boolean[]>("paths_exist", { paths: list.map((f) => f.path) });
    setMissingIds((old) => {
      const next = new Set(old);
      list.forEach((f, i) => (exists[i] === false ? next.add(f.id) : next.delete(f.id)));
      return next;
    });
  } catch {
    // the core could not tell: leave the marks as they are
  }
}

export async function loadWorkspace(): Promise<void> {
  try {
    const state = await invoke<{ json: string | null; notice: string | null; writable: boolean }>("read_state");
    if (state.notice) notify([state.notice]);
    const loaded = parseState(state.json);
    if (loaded.invalid) notify([READ_ERROR]);
    raw = loaded.raw;
    canWrite = state.writable && !loaded.readOnly;
    batch(() => {
      setFolders(loaded.folders);
      setActiveId(loaded.activeId);
      setCursorId(loaded.activeId);
      setSidebarWidth(loaded.sidebarWidth);
      setLockPreview(loaded.lockPreview);
      setOutline(loaded.outline);
      setLayout(loaded.panelLayout);
      setRecentFolders(loaded.recent);
    });
    await markMissing(loaded.folders);
    // core v0.8.2 I-3: a recent folder that is gone leaves the list (as Zed's does); a failed check keeps them all.
    const exists = await invoke<boolean[]>("paths_exist", { paths: loaded.recent }).catch((): boolean[] => []);
    if (exists.includes(false)) { setRecentFolders(dropMissing(loaded.recent, exists)); changed(); }
  } catch {
    notify([READ_ERROR]); // no state to build on, so nothing is written either
  }
}

// --- actions -----------------------------------------------------------------

/** A-13.3: make a folder the active one. The keyboard cursor follows; focus stays where it is (A-15.6). */
export function activateFolder(id: string): void {
  const folder = folders().find((f) => f.id === id);
  if (!folder) return;
  const switched = activeId() !== id;
  batch(() => {
    setActiveId(id);
    setCursorId(id);
  });
  if (switched) changed();
  void markMissing([folder]); // a folder can vanish while the app runs (A-16.3)
}

/** R-11: choose a folder in the OS dialog, check it in the core, register it last and activate it. */
export async function addFolder(): Promise<void> {
  let chosen: string | null;
  try {
    chosen = await open({ directory: true, multiple: false });
  } catch {
    return notify([CANNOT_OPEN]);
  }
  if (chosen === null) return; // cancelled (A-13.8)
  await openFolder(chosen);
}

/** The rest of R-11 for a known path: the dialog's choice, or a row of the Welcome screen's recent folders (core v0.8.2 I-3). */
export async function openFolder(chosen: string): Promise<void> {
  const path = normalizePath(chosen);
  try {
    if (path === null) throw new Error("not an absolute path");
    await invoke("check_folder", { path });
  } catch {
    // A recent folder that cannot be opened any more leaves the list.
    if (removeRecent(recentFolders(), chosen).length !== recentFolders().length) { setRecentFolders(removeRecent(recentFolders(), chosen)); changed(); }
    return notify([CANNOT_OPEN]);
  }
  const next = addOrActivate(folders(), path, () => ({ id: crypto.randomUUID(), path, added_at: new Date().toISOString() }));
  batch(() => {
    setFolders(next.folders);
    setActiveId(next.activeId);
    setCursorId(next.activeId);
    setRecentFolders(addRecent(recentFolders(), path)); // core v0.8.2 I-3: opened last, so first
  });
  changed();
  void markMissing(next.folders.filter((f) => f.id === next.activeId));
}

/**
 * R-14: take a folder off the list; the disk is not touched. Its tabs go with it, so modified ones are asked about first
 * like closing them (R-6, E-081 / E-082); Cancel keeps the folder (false).
 */
export async function removeFolder(id: string): Promise<boolean> {
  const ctx = contexts.get(id);
  if (ctx && !(await confirmClose(closingTabs(ctx), askWarning))) return false;
  const next = remove(folders(), id, activeId());
  if (next.folders === folders()) return true;
  const index = folders().findIndex((f) => f.id === id);
  batch(() => {
    setFolders(next.folders);
    setActiveId(next.activeId);
    // the cursor goes to the same place the active folder would (below, else above)
    setCursorId(cursorId() === id ? (next.folders[index] ?? next.folders[index - 1])?.id ?? null : cursorId());
    setMissingIds((old) => new Set([...old].filter((m) => m !== id)));
  });
  const gone = contexts.get(id);
  if (gone) disposeContext(gone); // its tabs go with it (A-14, R-14)
  contexts.delete(id);
  changed();
  return true;
}

/** core v0.8.3 I-7: Close Others / Close All, in list order. */
export const closeFolders = (ids: string[]): Promise<void> => closeEach(ids, removeFolder);

export function renameFolder(id: string, name: string): void {
  setFolders(rename(folders(), id, name));
  changed();
}

export function resizeSidebar(width: number): void {
  setSidebarWidth(width);
  changed();
}

export function resizeOutline(width: number): void {
  setOutline((o) => ({ ...o, width }));
  changed();
}

export function setOutlineOpen(open: boolean): void {
  setOutline((o) => ({ ...o, open }));
  changed();
}

export function toggleLockPreview(): void {
  setLockPreview((locked) => !locked);
  changed();
}

/** R-10: persist the dropped order without changing the active folder or its context. */
export function moveFolder(id: string, target: string): void {
  const next = move(folders(), id, target);
  if (next === folders()) return;
  setFolders(next);
  changed();
}

/** core v0.8.3 I-6 / I-7: sort once and save the order; later drops and new folders are not sorted again. */
export function sortFolderList(by: FolderSort): void {
  if (isSorted(folders(), by)) return;
  setFolders(sortFolders(folders(), by));
  changed();
}

/** core v0.8.3 I-17: only the side changes; what is open and how wide stays. */
export function setPanelLayout(side: PanelLayout): void {
  if (side === panelLayout()) return;
  setLayout(side);
  changed();
}

export const moveCursor = (dir: 1 | -1, list = folders()): void => void setCursorId(nextCursor(list, cursorId(), dir));
export const setCursor = (id: string): void => void setCursorId(id);

/** Run `fn` on every folder's context (a rename or move can touch the tabs and trees of several folders). */
export const eachContext = (fn: (ctx: FolderContext) => void): void => { fn(emptyContext); contexts.forEach(fn); };
