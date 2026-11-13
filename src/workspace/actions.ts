import { batch, createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { openPath, revealItemInDir } from "@tauri-apps/plugin-opener";
import { APP_NAME } from "../shell/app-menus.ts";
import { notify } from "../shell/toast.ts";
import { followMove, forget, NEW_ROW, openFile, refreshDirs, reveal, select, type EditTarget, type FolderContext } from "./context.ts";
import { confirmName, renameSelection, validationFor } from "./names.ts";
import { baseName } from "./paths.ts";
import { deletePrompt, dropJobs, failureText, moveTakenText, pasteJobs, relativePath, targetDir } from "./ops.ts";
import { eachContext } from "./store.ts";
import { UndoHistory, type Change } from "./undo.ts";
import { PROJECT_PANEL_UNDO_LIMIT } from "../spec/metrics.ts";
import { isDirPath, joinPath, only, parentOf, rowIndex, targetsOf, type Child } from "./tree.ts";

// What the project panel does to files (R-20~R-23): name an item in the tree, delete, copy and paste, copy paths, open
// outside. The core does the disk work; every call here is awaited, so input stays responsive during long work (R-30).

const focusPanel = () => document.querySelector<HTMLElement>(".project-panel")?.focus();
const everywhere = (fn: (ctx: FolderContext) => void) => eachContext(fn);
const refreshEverywhere = async (dirs: string[]) => {
  const all: Promise<void>[] = [];
  everywhere((ctx) => all.push(refreshDirs(ctx, dirs)));
  await Promise.all(all);
};
const exists = async (path: string): Promise<boolean> => (await invoke<boolean[]>("paths_exist", { paths: [path] }).catch(() => [false]))[0];
const under = (dir: string, parts: string[]) => parts.reduce(joinPath, dir);

// --- naming (R-20) ---------------------------------------------------------------------------------------------

/** P-019: Ctrl+N / Alt+N. The input goes in the selected folder (or the folder of the selected file, else the root). */
export function startNew(ctx: FolderContext, isDir: boolean): void {
  if (ctx.edit()) return;
  const selected = ctx.selection().selected;
  const dir = targetDir(ctx.root, ctx.rows().rows, selected);
  const tempExpanded = !ctx.expanded.has(dir);
  ctx.expanded.add(dir);
  ctx.draft = null;
  const target: EditTarget = { kind: "new", dir, path: null, isDir, initial: "", select: [0, 0], tempExpanded, prevSelected: selected };
  batch(() => {
    ctx.setIssue(null);
    ctx.setEdit(target);
  });
  ctx.touch();
  ctx.setScrollTarget(NEW_ROW);
}

/** P-019: Enter / F2. The root cannot be renamed (I-091). */
export function startRename(ctx: FolderContext): void {
  const path = ctx.selection().selected;
  if (ctx.edit() || path === null || path === ctx.root) return;
  const isDir = isDirPath(ctx.rows().rows, path);
  const name = baseName(path);
  ctx.draft = null;
  batch(() => {
    ctx.setIssue(null);
    ctx.setEdit({ kind: "rename", dir: parentOf(ctx.root, path), path, isDir, initial: name, select: renameSelection(name, isDir), tempExpanded: false, prevSelected: path });
  });
  ctx.setScrollTarget(path);
}

let latest = 0;
/** P-021: the banner under the input, checked on every change (the newest answer wins). */
export async function revalidate(ctx: FolderContext): Promise<void> {
  const edit = ctx.edit();
  const input = ctx.input;
  if (!edit || !input) return;
  const mine = ++latest;
  const confirmed = confirmName(input.value, edit.kind === "new", edit.kind === "new" && edit.isDir);
  if (!confirmed) {
    ctx.setIssue(null);
    return;
  }
  const target = under(edit.dir, confirmed.parts);
  const taken = edit.kind === "rename" && target.toLowerCase() === edit.path!.toLowerCase() ? false : await exists(target);
  if (mine === latest) ctx.setIssue(validationFor(input.value, confirmed.parts.at(-1)!, taken));
}

/** P-022 Escape, or a refused confirmation on losing focus: drop the input, close what it opened, restore the selection. */
export function cancelEdit(ctx: FolderContext, toPanel: boolean): void {
  const edit = ctx.edit();
  if (!edit) return;
  if (edit.tempExpanded) ctx.expanded.delete(edit.dir);
  batch(() => {
    ctx.setEdit(null);
    ctx.setIssue(null);
    ctx.setSelection(only(edit.prevSelected));
  });
  ctx.touch();
  if (toPanel) focusPanel();
}

type Made = { select: string; open: boolean; toPanel: boolean; dirs: string[] };

/** The disk part of a confirmation. Null: refused, the input stays (P-022). */
async function make(ctx: FolderContext, edit: EditTarget, value: string): Promise<Made | null> {
  try {
    if (edit.kind === "new") {
      const confirmed = confirmName(value, true, edit.isDir);
      if (!confirmed) return null;
      const target = under(edit.dir, confirmed.parts);
      if (await exists(target)) return null;
      const dirs = [edit.dir];
      let at = edit.dir;
      for (const part of confirmed.parts.slice(0, -1)) {
        at = joinPath(at, part);
        if (!(await exists(at))) {
          await invoke("create_dir", { path: at });
          dirs.push(at);
        }
      }
      await invoke(confirmed.isDir ? "create_dir" : "create_file", { path: target });
      return { select: target, open: !confirmed.isDir, toPanel: confirmed.isDir, dirs };
    }
    const confirmed = confirmName(value, false, false);
    if (!confirmed) return null;
    const from = edit.path!;
    const to = joinPath(edit.dir, confirmed.parts[0]);
    if (to === from) return { select: from, open: false, toPanel: true, dirs: [] };
    if (to.toLowerCase() !== from.toLowerCase() && (await exists(to))) return null;
    await invoke("rename_path", { from, to });
    everywhere((other) => followMove(other, from, to)); // tabs and open folders follow the new name
    return { select: to, open: false, toPanel: true, dirs: [edit.dir] };
  } catch {
    return null;
  }
}

/** P-022 Enter, or the input losing focus. A created file opens as a normal tab with the editor focused (I-097). */
export async function commitEdit(ctx: FolderContext, fromBlur: boolean): Promise<void> {
  const edit = ctx.edit();
  const input = ctx.input;
  if (!edit || !input || ctx.committing) return;
  ctx.committing = true;
  try {
    const made = await make(ctx, edit, input.value);
    if (!made) {
      if (fromBlur) cancelEdit(ctx, false);
      else await revalidate(ctx);
      return;
    }
    await refreshEverywhere(made.dirs);
    batch(() => {
      ctx.setEdit(null);
      ctx.setIssue(null);
    });
    reveal(ctx, made.select);
    if (made.toPanel && !fromBlur) focusPanel();
    if (made.open) openFile(ctx, made.select, false, !fromBlur);
  } finally {
    ctx.committing = false;
  }
}

// --- delete (R-21) ---------------------------------------------------------------------------------------------

let asking = false;

/** Trash or Delete the selected items (never the root), after the confirmation. */
export async function requestDelete(ctx: FolderContext, permanent: boolean): Promise<void> {
  const targets = targetsOf(ctx.selection()).filter((p) => p !== ctx.root);
  if (ctx.edit() || asking || targets.length === 0) return;
  const prompt = deletePrompt(targets.map(baseName), permanent, APP_NAME);
  asking = true;
  let confirmed = false;
  try {
    confirmed = await invoke<boolean>("confirm", { title: prompt.title, main: prompt.main, content: prompt.content, okLabel: prompt.okLabel, details: null });
  } finally {
    asking = false;
  }
  if (!confirmed) return;
  const index = rowIndex(ctx.rows().rows, targets[0]);
  const { failed } = await invoke<{ failed: number }>(permanent ? "delete_paths" : "trash_paths", { paths: targets });
  if (failed > 0) notify([failureText(permanent, failed, targets.length)]);
  else everywhere((other) => targets.forEach((path) => forget(other, path)));
  await refreshEverywhere(targets.map((path) => parentOf(ctx.root, path)));
  // The row now in the place of the first deleted one is selected (D-17). Open tabs stay as they are.
  const rows = ctx.rows().rows;
  const row = rows[Math.min(Math.max(index, 0), rows.length - 1)];
  if (row) select(ctx, only(row.path), row.path);
}

// --- copy, cut, paste, duplicate, paths (R-22) -----------------------------------------------------------------

const [clipboard, setClipboard] = createSignal<{ paths: string[]; cut: boolean } | null>(null); // one for the window
export const canPaste = (): boolean => (clipboard()?.paths.length ?? 0) > 0; // I-544
let generation = 0; // a newer copy or cut keeps an older paste from touching the clipboard

export function copyItems(ctx: FolderContext, cut: boolean): void {
  const paths = targetsOf(ctx.selection()).filter((p) => !cut || p !== ctx.root);
  if (ctx.edit() || paths.length === 0) return;
  generation++;
  setClipboard({ paths, cut });
}

/** What a paste or duplicate made: refresh, open the files as normal tabs (focus stays in the panel), select the last (I-097). */
async function showCreated(ctx: FolderContext, created: string[], dirs: string[]): Promise<void> {
  await refreshEverywhere(dirs);
  for (const path of created) {
    if (ctx.listing.get(parentOf(ctx.root, path))?.find((child) => child.name === baseName(path))?.is_dir === false) openFile(ctx, path, false, false);
  }
  if (created.length > 0) reveal(ctx, created[created.length - 1]);
}

export async function paste(ctx: FolderContext): Promise<void> {
  const held = clipboard();
  if (ctx.edit() || !held) return;
  const dir = targetDir(ctx.root, ctx.rows().rows, ctx.selection().selected);
  const { run, refused } = pasteJobs(held.paths, dir, held.cut, ctx.root);
  if (held.cut) {
    setClipboard(null); // taken now, so a second paste cannot move the same items; what failed is put back below
    generation++;
  }
  const mine = generation;
  const failed = [...refused];
  const created: string[] = [];
  const moved: [string, string][] = [];
  for (const source of run) {
    try {
      const result = await invoke<{ created: string[]; failed: number }>("paste_paths", { sources: [source], targetDir: dir, cut: held.cut });
      if (result.failed > 0) failed.push(source);
      created.push(...result.created);
      if (held.cut && result.created[0]) moved.push([source, result.created[0]]);
    } catch {
      failed.push(source);
    }
  }
  if (failed.length > 0) notify(["Could not paste the item."]); // one notice however many failed
  if (held.cut && mine === generation) setClipboard(failed.length > 0 ? { paths: failed, cut: true } : null);
  for (const [from, to] of moved) everywhere((other) => followMove(other, from, to));
  await showCreated(ctx, created, [dir, ...held.paths.map((path) => parentOf(ctx.root, path))]);
}

export async function duplicate(ctx: FolderContext): Promise<void> {
  const targets = targetsOf(ctx.selection()).filter((p) => p !== ctx.root);
  if (ctx.edit() || targets.length === 0) return;
  const created: string[] = [];
  let failed = 0;
  for (const path of targets) {
    try {
      created.push(await invoke<string>("duplicate_path", { path }));
    } catch {
      failed++;
    }
  }
  if (failed > 0) notify(["Could not duplicate the item."]);
  await showCreated(ctx, created, targets.map((path) => parentOf(ctx.root, path)));
}

// --- drag and drop (core I-3) ------------------------------------------------------------------------------------

const history = new UndoHistory(PROJECT_PANEL_UNDO_LIMIT); // one for the window, like the clipboard
const shown = (ctx: FolderContext, path: string) => relativePath(ctx.root, ctx.rootName, path);

/** Move without replacing anything (an exclusive rename); tabs and trees follow. Throws Zed's text when it cannot. */
async function moveExclusive(ctx: FolderContext, from: string, to: string): Promise<void> {
  if (!(await exists(from))) throw new Error(`Failed to move \`${shown(ctx, from)}\`. It no longer exists.`);
  if (await exists(to)) throw new Error(moveTakenText(shown(ctx, from), shown(ctx, to)));
  await invoke("rename_path", { from, to }).catch(() => { throw new Error("Could not move the item."); }); // a name taken meanwhile fails too
  everywhere((other) => followMove(other, from, to));
}

/**
 * A tree drag dropped into `dir` (Zed drag_onto): a move, or a copy with Ctrl (Zed is_copy_modifier_set on Windows). A move
 * never takes a name that is there (Zed: a notice, nothing moves); tabs follow the move. A copy takes a free copy name.
 * What it did is one undo step (Zed undo_manager.record).
 */
export async function dropItems(ctx: FolderContext, items: string[], dir: string, copy: boolean): Promise<void> {
  const run = dropJobs(items, dir, copy, ctx.root);
  if (ctx.edit() || run.length === 0) return;
  const parents = run.map((path) => parentOf(ctx.root, path));
  if (copy) return copyInto(ctx, run, dir, parents, false);
  const lines: string[] = [];
  const moved: Change[] = [];
  for (const from of run) {
    const to = joinPath(dir, baseName(from));
    try {
      await moveExclusive(ctx, from, to);
      moved.push({ kind: "moved", from, to });
    } catch (error) {
      lines.push((error as Error).message);
    }
  }
  history.record(moved);
  if (lines.length > 0) notify(lines);
  await refreshEverywhere([dir, ...parents]); // also after a failure: the tree shows what is on disk
}

/** Files and folders from Explorer dropped into `dir` are copied (Zed drop_external_files); a taken name gets a copy name. */
export const dropExternal = (ctx: FolderContext, paths: string[], dir: string): Promise<void> => copyInto(ctx, paths, dir, [], paths.length === 1);

async function copyInto(ctx: FolderContext, sources: string[], dir: string, dirs: string[], openOne: boolean): Promise<void> {
  let created: string[] = [];
  try {
    const result = await invoke<{ created: string[]; failed: number }>("paste_paths", { sources, targetDir: dir, cut: false });
    created = result.created;
    if (result.failed > 0) notify(["Could not paste the item."]);
  } catch {
    notify(["Could not paste the item."]);
  }
  history.record(created.map((path) => ({ kind: "created", path })));
  await refreshEverywhere([dir, ...dirs]);
  const last = created.at(-1);
  if (!last) return;
  // Zed opens one dropped file (auto_open.on_drop) and else selects the last item made.
  const listed = openOne ? await invoke<Child[]>("list_dir", { path: dir }).catch(() => []) : []; // the folder may never have been read
  if (listed.find((child) => child.name === baseName(last))?.is_dir === false) openFile(ctx, last, false, true);
  else reveal(ctx, last);
}

/**
 * The inverse of a step, last change first (Zed Change::to_inverse): a move goes back, a copy goes to the Recycle Bin after
 * one confirmation (null when declined), a binned copy comes back. Nothing is replaced; a failure throws Zed's text.
 */
async function invert(ctx: FolderContext, step: Change[]): Promise<Change[] | null> {
  const binned = step.flatMap((c) => (c.kind === "created" ? [c.path] : []));
  if (binned.length > 0) {
    if (asking) return null;
    const prompt = deletePrompt(binned.map(baseName), false, APP_NAME);
    asking = true;
    try {
      if (!(await invoke<boolean>("confirm", { title: prompt.title, main: prompt.main, content: prompt.content, okLabel: prompt.okLabel, details: null }))) return null;
    } finally {
      asking = false;
    }
  }
  const done: Change[] = [];
  const dirs = new Set<string>();
  try {
    for (const change of [...step].reverse()) {
      const path = change.kind === "moved" ? change.to : change.path;
      dirs.add(parentOf(ctx.root, path));
      if (change.kind === "moved") {
        await moveExclusive(ctx, change.to, change.from);
        dirs.add(parentOf(ctx.root, change.from));
        done.push({ kind: "moved", from: change.to, to: change.from });
      } else if (change.kind === "created") {
        if (!(await exists(path))) throw new Error(`Failed to trash \`${shown(ctx, path)}\`. It no longer exists.`);
        const id = await invoke<string>("trash_for_undo", { path }).catch(() => { throw new Error(`Failed to trash \`${shown(ctx, path)}\`.`); });
        everywhere((other) => forget(other, path));
        done.push({ kind: "trashed", path, id });
      } else {
        if (await exists(path)) throw new Error(`Failed to restore \`${shown(ctx, path)}\`. Something already exists at its original location.`);
        await invoke("restore_trashed", { id: change.id }).catch(() => { throw new Error(`Failed to restore \`${shown(ctx, path)}\`. It may have been permanently deleted.`); });
        done.push({ kind: "created", path });
      }
    }
  } finally {
    await refreshEverywhere([...dirs]);
  }
  return done;
}

/** project_panel::Undo / Redo (Zed ctrl-z / ctrl-shift-z in the ProjectPanel context): only drag and drop is recorded. */
export const undoDrop = (ctx: FolderContext): Promise<void> => history.undo((step) => invert(ctx, step)).catch((error) => notify(["Undo Failed", (error as Error).message]));
export const redoDrop = (ctx: FolderContext): Promise<void> => history.redo((step) => invert(ctx, step)).catch((error) => notify(["Redo Failed", (error as Error).message]));
export const canUndoDrop = (): boolean => history.canUndo();
export const canRedoDrop = (): boolean => history.canRedo();

/** I-548, I-549: absolute or relative paths of the selected items as text, several joined by line breaks. */
export async function copyPaths(ctx: FolderContext, relative: boolean): Promise<void> {
  const paths = targetsOf(ctx.selection());
  if (paths.length === 0) return;
  const text = paths.map((path) => (relative ? relativePath(ctx.root, ctx.rootName, path) : path)).join("\n");
  await navigator.clipboard.writeText(text).catch(() => {}); // no spec text for a refused clipboard write
}

// --- outside the app (R-23, D-19) -------------------------------------------------------------------------------

export function revealInExplorer(ctx: FolderContext): void {
  const path = ctx.selection().selected;
  if (path) void revealItemInDir(path).catch(() => {});
}

export function openInDefaultApp(ctx: FolderContext): void {
  const path = ctx.selection().selected;
  if (path) void openPath(path).catch(() => {});
}
