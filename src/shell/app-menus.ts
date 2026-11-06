import { activeTabOf, closeTab } from "../workspace/context.ts";
import { activeContext } from "../workspace/store.ts";
import type { Menu, MenuItem } from "./menu.ts";

export const APP_NAME = "workbench-tauri";

function closeEditor(): void {
  const ctx = activeContext();
  const tab = ctx && activeTabOf(ctx.pane());
  if (tab) void closeTab(ctx!, tab.file, true);
}

/** I-474 / I-475: only a Markdown editor can open a preview; otherwise the entry is disabled (leader decision, P3-1). */
const markdownItem = (label: string, action: string): MenuItem => ({
  label,
  action,
  get disabled() {
    const ctx = activeContext();
    const tab = ctx && activeTabOf(ctx.pane());
    return !tab || !!tab.markdown || !/\.(md|markdown)$/i.test(tab.path);
  },
});

// The list pinned in PROGRESS (v0.2 R-8, v0.4 Phase 3 "R-14 ☰ 메뉴 행 목록", 02-INTERACTION 9.2). The bar only has menus
// with items (I-306); the rest of 9.2 does not work yet and is left out (D-13). † = an entry we added (I-481).
export const MENUS: Menu[] = [
  { name: APP_NAME, entries: [{ label: `Quit ${APP_NAME}`, action: "zed::Quit" }] }, // I-341
  {
    name: "File",
    entries: [
      { label: "Open Folder...", action: "workspace::Open" }, // I-346
      "separator", // I-351 (the one of I-349 has no item left before it, I-306)
      { label: "Save", action: "workspace::Save" }, // I-352
      "separator", // I-355
      // I-356: `close_pinned = true` (it closes a pinned tab too) has no key, so the entry shows none.
      { label: "Close Editor", run: closeEditor },
      { label: "Close Window", action: "workspace::CloseWindow" }, // I-358
    ],
  },
  {
    name: "Edit",
    entries: [
      { label: "Undo", action: "editor::Undo" }, // I-359
      { label: "Redo", action: "editor::Redo" }, // I-360
    ],
  },
  {
    name: "View",
    entries: [
      { label: "Toggle Left Dock", action: "workspace::ToggleLeftDock" }, // I-391
      { label: "Toggle Folder Sidebar", action: "multi_workspace::ToggleWorkspaceSidebar" }, // I-472 †
      { label: "Focus Folder Sidebar", action: "multi_workspace::FocusWorkspaceSidebar" }, // I-473 †
      { label: "Split Up", action: "pane::SplitUp" }, // I-396 (ClonePane, I-711)
      { label: "Split Down", action: "pane::SplitDown" }, // I-397
      { label: "Split Left", action: "pane::SplitLeft" }, // I-398
      { label: "Split Right", action: "pane::SplitRight" }, // I-399
      { label: "Maximize Pane", action: "workspace::ToggleZoom" }, // I-476 †
      "separator", // I-400
      { label: "Project Panel", action: "project_panel::ToggleFocus" }, // I-401
      markdownItem("Open Markdown Preview", "markdown::OpenPreview"), // I-474 †
      markdownItem("Open Markdown Preview to the Side", "markdown::OpenPreviewToTheSide"), // I-475 †
    ],
  },
  {
    name: "Go",
    entries: [
      { label: "Previous Tab", action: "pane::ActivatePreviousItem" }, // I-477 †
      { label: "Next Tab", action: "pane::ActivateNextItem" }, // I-478 †
    ],
  },
  {
    name: "Window",
    entries: [
      { label: "Minimize", action: "zed::Minimize" }, // I-445
      { label: "Zoom", action: "zed::Zoom" }, // I-446
    ],
  },
];
