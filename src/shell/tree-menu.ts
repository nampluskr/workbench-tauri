import { MENU_KEYBOARD_OFFSET } from "../spec/metrics.ts";
import {
  canPaste,
  copyItems,
  copyPaths,
  duplicate,
  openInDefaultApp,
  paste,
  requestDelete,
  revealInExplorer,
  startNew,
  startRename,
} from "../workspace/actions.ts";
import { collapseEverything, expandAll, select, setSubtree, type FolderContext } from "../workspace/context.ts";
import { activeId, addFolder, removeFolder } from "../workspace/store.ts";
import { isDirPath, only, rowIndex } from "../workspace/tree.ts";
import { openContextMenu } from "./AppMenu.tsx";
import type { MenuEntry, MenuItem } from "./menu.ts";

// The project panel's right-click menu (R-23, 02-INTERACTION 11.2, I-530~I-557, I-660~I-662). A separator sits between
// groups that both have entries. Shortcuts are looked up through `action` for the focus the panel has when it opens.

const isMarkdown = (path: string) => /\.(md|markdown)$/i.test(path);

/** The groups of entries for `target` (the selected item; the root for the empty area). */
function groups(ctx: FolderContext, target: string): MenuItem[][] {
  const rows = ctx.rows().rows;
  const row = rows[rowIndex(rows, target)];
  const isRoot = target === ctx.root;
  const isDir = isDirPath(rows, target);
  const folded = !!row && row.segments.length > 1;
  // I-539: Fold Directory shows for a folder that Unfold Directory kept apart and that has one folder inside.
  const children = ctx.listing.get(target);
  const canFold = isDir && !isRoot && ctx.unfolded.has(target) && children?.length === 1 && children[0].is_dir;
  const item = (label: string, run: () => void, action?: string, disabled = false): MenuItem => ({ label, run, action, disabled });

  const open: MenuItem[] = [
    item("Reveal in File Explorer", () => revealInExplorer(ctx), "project_panel::RevealInFileManager"),
    item("Open in Default App", () => openInDefaultApp(ctx), "project_panel::OpenWithSystem"),
  ];
  if (!isDir && isMarkdown(target)) open.push(item("Open Markdown Preview", () => {}, undefined, true)); // D-15: shown, not available

  const fold: MenuItem[] = [];
  if (isDir && folded) fold.push(item("Unfold Directory", () => {
    row.segments.forEach((s) => ctx.unfolded.add(s.path));
    ctx.touch();
  }));
  if (canFold) fold.push(item("Fold Directory", () => {
    for (const path of [...ctx.unfolded]) if (path === target || path.startsWith(target + "\\")) ctx.unfolded.delete(path);
    ctx.touch();
  }));

  return [
    [item("New File", () => startNew(ctx, false), "project_panel::NewFile"), item("New Folder", () => startNew(ctx, true), "project_panel::NewDirectory")],
    open,
    fold,
    [
      item("Cut", () => copyItems(ctx, true), "project_panel::Cut"),
      item("Copy", () => copyItems(ctx, false), "project_panel::Copy"),
      item("Duplicate", () => void duplicate(ctx)),
      item("Paste", () => void paste(ctx), "project_panel::Paste", !canPaste()), // I-544
    ],
    [item("Copy Path", () => void copyPaths(ctx, false), "workspace::CopyPath"), item("Copy Relative Path", () => void copyPaths(ctx, true), "workspace::CopyRelativePath")],
    isRoot
      ? [
          item("Add Folders to Project…", () => void addFolder()),
          item("Remove from Project", () => activeId() && removeFolder(activeId()!)), // I-555: same as the sidebar's Remove
        ]
      : [
          item("Rename", () => startRename(ctx), "project_panel::Rename"),
          item("Trash", () => void requestDelete(ctx, false), "project_panel::Trash"),
          item("Delete", () => void requestDelete(ctx, true), "project_panel::Delete"),
        ],
    isDir
      ? [
          item("Expand All", () => void (isRoot ? expandAll(ctx) : setSubtree(ctx, target, true)), isRoot ? "project_panel::ExpandAllEntries" : undefined),
          item("Collapse All", () => (isRoot ? collapseEverything(ctx) : void setSubtree(ctx, target, false)), isRoot ? "project_panel::CollapseAllEntries" : undefined),
        ]
      : [],
  ];
}

export function treeMenu(ctx: FolderContext, target: string): MenuEntry[] {
  return groups(ctx, target)
    .filter((group) => group.length > 0)
    .flatMap((group, i): MenuEntry[] => (i === 0 ? group : ["separator", ...group]));
}

/** I-560: the pressed item becomes the selection (a marked item keeps the marks, I-562); the menu works on the selection. */
export function openTreeMenu(ctx: FolderContext, at: { x: number; y: number }, target: string): void {
  if (ctx.edit()) return;
  const sel = ctx.selection();
  select(ctx, sel.marked.includes(target) ? { ...sel, selected: target } : only(target));
  openContextMenu(at, treeMenu(ctx, target));
}

/** I-042, I-502: Menu key or Shift+F10 opens it beside the selected row, at its lower left corner. */
export function openTreeMenuAtSelection(ctx: FolderContext): void {
  const target = ctx.selection().selected ?? ctx.root;
  const row = [...document.querySelectorAll<HTMLElement>(".tree-row")].find((el) => el.dataset.path === target);
  const box = row?.getBoundingClientRect();
  openTreeMenu(ctx, { x: (box?.left ?? 0) + MENU_KEYBOARD_OFFSET.x, y: (box?.bottom ?? 0) + MENU_KEYBOARD_OFFSET.y }, target);
}
