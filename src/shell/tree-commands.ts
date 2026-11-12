import { copyItems, copyPaths, openInDefaultApp, paste, redoDrop, requestDelete, revealInExplorer, startNew, startRename, undoDrop } from "../workspace/actions.ts";
import {
  collapseEverything,
  expandAll,
  openFile,
  select,
  setExpanded,
  setSubtree,
  type FolderContext,
} from "../workspace/context.ts";
import { activeFolder, contextOf, missingIds } from "../workspace/store.ts";
import { clickRange, clickToggle, collapseStep, expandStep, move, only, rowIndex, type Row, type Step } from "../workspace/tree.ts";
import { chain } from "./chain.ts";
import { openTreeMenuAtSelection } from "./tree-menu.ts";

// The keys and clicks of the project panel tree (R-19). Key actions share names with the menu and the sidebar, so
// they act only while focus is in the panel.

const panelFocused = () => !!document.querySelector(".project-panel")?.contains(document.activeElement);

/** The tree the panel shows: the active folder's, when its path exists. */
function current(): FolderContext | null {
  const folder = activeFolder();
  return folder && !missingIds().has(folder.id) ? contextOf(folder) : null;
}

const onTree = (name: string, handler: (ctx: FolderContext, rows: Row[]) => void) =>
  chain(name, panelFocused, () => {
    const ctx = current();
    if (ctx && !ctx.edit()) handler(ctx, ctx.rows().rows); // while a name is typed the tree keys do nothing (P-022)
  });

const go = (to: "next" | "prev" | "first" | "last", extend: boolean) => (ctx: FolderContext, rows: Row[]) => {
  const m = move(rows, ctx.selection(), to, extend);
  if (m) select(ctx, m.sel, rows[m.index].path);
};

function apply(ctx: FolderContext, step: Step | null): void {
  if (!step) return;
  if (step.expanded) setExpanded(ctx, step.expanded.path, step.expanded.open);
  if (step.select !== undefined) select(ctx, only(step.select), step.select);
}

onTree("menu::SelectNext", go("next", false)); // I-030, I-088: moving only selects and scrolls
onTree("menu::SelectPrevious", go("prev", false));
onTree("menu::SelectFirst", go("first", false));
onTree("menu::SelectLast", go("last", false));
onTree("project_panel::SelectNextExtend", go("next", true)); // I-043
onTree("project_panel::SelectPreviousExtend", go("prev", true));
onTree("project_panel::ExpandSelectedEntry", (ctx, rows) => apply(ctx, expandStep(rows, ctx.selection())));
onTree("project_panel::CollapseSelectedEntry", (ctx, rows) => apply(ctx, collapseStep(rows, ctx.selection())));
onTree("project_panel::CollapseAllEntries", (ctx) => collapseEverything(ctx));
onTree("project_panel::ExpandAllEntries", (ctx) => void expandAll(ctx));
// I-033: Space opens a file as a preview tab and leaves focus in the tree; on a folder it toggles it.
onTree("project_panel::Open", (ctx, rows) => {
  const row = rows[rowIndex(rows, ctx.selection().selected)];
  if (!row) return;
  if (row.isDir) setExpanded(ctx, row.path, !row.expanded);
  else openFile(ctx, row.path, true, false);
});

// R-20~R-23. Delete keys: Trash on Delete / Backspace, Delete on Shift+Delete / Ctrl+Delete / Ctrl+Backspace; the root does nothing (R-3).
onTree("project_panel::NewFile", (ctx) => startNew(ctx, false));
onTree("project_panel::NewDirectory", (ctx) => startNew(ctx, true));
onTree("project_panel::Rename", (ctx) => startRename(ctx));
onTree("project_panel::Trash", (ctx) => void requestDelete(ctx, false));
onTree("project_panel::Delete", (ctx) => void requestDelete(ctx, true));
onTree("project_panel::Copy", (ctx) => copyItems(ctx, false));
onTree("project_panel::Cut", (ctx) => copyItems(ctx, true));
onTree("project_panel::Paste", (ctx) => void paste(ctx));
onTree("project_panel::Undo", (ctx) => void undoDrop(ctx)); // core I-3: drag and drop only
onTree("project_panel::Redo", (ctx) => void redoDrop(ctx));
onTree("workspace::CopyPath", (ctx) => void copyPaths(ctx, false));
onTree("workspace::CopyRelativePath", (ctx) => void copyPaths(ctx, true));
onTree("project_panel::DeployContextMenu", (ctx) => openTreeMenuAtSelection(ctx));
onTree("project_panel::RevealInFileManager", (ctx) => revealInExplorer(ctx));
onTree("project_panel::OpenWithSystem", (ctx) => openInDefaultApp(ctx));

/** One left click on the piece `path` of `row` (I-087, I-089, I-090). `detail` is the click count. */
export function pressRow(ctx: FolderContext, rows: Row[], row: Row, path: string, mods: { shift: boolean; ctrl: boolean; alt: boolean }, detail: number): void {
  if (ctx.edit() || row.isNew) return; // the name input is open: the click only ends it (focus loss)
  if (mods.shift) return select(ctx, clickRange(rows, ctx.selection(), row.path));
  if (mods.ctrl) return select(ctx, clickToggle(ctx.selection(), row.path));
  select(ctx, only(path));
  if (row.isDir) void (mods.alt ? setSubtree(ctx, row.path, !row.expanded) : setExpanded(ctx, row.path, !row.expanded));
  else openFile(ctx, row.path, detail < 2, detail >= 2); // one click: preview; double click: normal tab and the editor
}

/** Middle click: select it and open a file as a normal tab with the editor focused (I-087). */
export function pressMiddle(ctx: FolderContext, row: Row): void {
  if (ctx.edit() || row.isNew) return;
  select(ctx, only(row.path));
  if (!row.isDir) openFile(ctx, row.path, false, true);
}
