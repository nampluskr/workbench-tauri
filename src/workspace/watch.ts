import { createEffect, createMemo, createRoot, on, untrack } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { decodeText } from "../editor/file-view.ts";
import { diffRange, eventDirs, goneDirs } from "./changes.ts";
import { forget, refreshDirs, type FolderContext, type Tab } from "./context.ts";
import { pathKey } from "./paths.ts";
import { activeFolder, contextOf, markMissing, missingIds } from "./store.ts";
import { only, rowIndex } from "./tree.ts";

// Following the disk (R-25, A-16.3): the core watches the active folder and reports changed paths. They are gathered for
// one animation frame, then the folders they touch are read again and the open tabs whose file changed are read again.
// Reading again is idempotent, so the events of the app's own file work (R-20~R-22) only repeat what is already shown.

/** Read the folders again, drop what is gone, and keep the selection where it was (a vanished one moves to the row now in its place, D-17). */
async function syncTree(ctx: FolderContext, dirs: string[]): Promise<void> {
  if (dirs.length === 0) return;
  const before = ctx.selection();
  const index = rowIndex(ctx.rows().rows, before.selected);
  await refreshDirs(ctx, dirs);
  for (const dir of goneDirs(ctx.root, ctx.listing)) forget(ctx, dir);
  ctx.touch();
  const rows = ctx.rows().rows;
  const selected = ctx.selection(); // it may have been changed by the user while the folders were read
  if (selected.selected !== null && rowIndex(rows, selected.selected) < 0) {
    const row = rows[Math.min(Math.max(index, 0), rows.length - 1)];
    if (row) ctx.setSelection(only(row.path)); // no scroll: the disk moved the selection, not the person (R-25)
  } else if (selected.marked.some((path) => rowIndex(rows, path) < 0)) {
    ctx.setSelection({ ...selected, marked: selected.marked.filter((path) => rowIndex(rows, path) >= 0) });
  }
}

/** E-086: a tab whose file changed shows the new text. A file that cannot be read any more (deleted) stays as it is (D-10). */
async function reloadTab(path: string, view: Tab["view"]): Promise<void> {
  if (!view) return;
  let text: string;
  try {
    text = decodeText(await invoke<ArrayBuffer>("read_file", { path })).replace(/\r\n?/g, "\n"); // the document keeps "\n" only
  } catch {
    return;
  }
  const change = diffRange(view.state.doc.toString(), text);
  // One change from the first to the last difference: the scroll position and selection stay, and an incremental parse
  // re-highlights it (a whole new text starts the sliced parse again, R-30). The view is read-only for people, not for this.
  if (change.from < change.to || change.insert !== "") view.dispatch({ changes: change });
}

async function reloadTabs(ctx: FolderContext, keys: Set<string> | null): Promise<void> {
  await Promise.all(ctx.tabs().filter((tab) => keys === null || keys.has(pathKey(tab.path))).map((tab) => reloadTab(tab.path, tab.view)));
}

let pending = new Set<string>();
let frame = 0;

async function flush(): Promise<void> {
  frame = 0;
  const paths = [...pending];
  pending = new Set();
  const folder = activeFolder();
  if (!folder) return;
  await markMissing([folder]); // the root itself may be what went (A-16.3)
  if (missingIds().has(folder.id)) return;
  const ctx = contextOf(folder);
  await syncTree(ctx, eventDirs(ctx.root, paths, ctx.listing.keys()));
  await reloadTabs(ctx, new Set(paths.map(pathKey)));
}

/** A folder becomes the active one, or comes back: what changed while it was not watched is found by reading everything shown again. */
async function resync(ctx: FolderContext): Promise<void> {
  await syncTree(ctx, [...ctx.listing.keys()]);
  await reloadTabs(ctx, null);
}

/** Start following the active folder (once, after the first render). */
export async function installWatcher(): Promise<void> {
  await listen<{ paths: string[] }>("fs-changed", (event) => {
    event.payload.paths.forEach((path) => pending.add(path));
    if (!frame) frame = requestAnimationFrame(() => void flush()); // one animation frame: no delay constant of its own
  });
  createRoot(() => {
    const id = createMemo(() => activeFolder()?.id ?? null);
    const gone = createMemo(() => {
      const folder = activeFolder();
      return folder !== null && missingIds().has(folder.id);
    });
    createEffect(
      on([id, gone], () => {
        const folder = untrack(activeFolder);
        pending = new Set(); // paths of the folder that was watched before mean nothing now
        void invoke("watch_folder", { path: folder?.path ?? null }).catch(() => {}); // a folder that is gone cannot be watched
        if (folder && !untrack(gone)) void resync(contextOf(folder));
      }),
    );
  });
  // A root that came back is noticed here too when the core cannot watch a folder that does not exist.
  window.addEventListener("focus", () => {
    const folder = activeFolder();
    if (folder && missingIds().has(folder.id)) void markMissing([folder]);
  });
}
