import type { Menu } from "./menu.ts";

export const APP_NAME = "workbench-tauri";

// The Phase 4 end state of the list pinned in PROGRESS (R-8, 02-INTERACTION 9.2). The bar only has menus with items
// (I-306); the rest of 9.2 does not work in v0.2 and is left out (D-13).
export const MENUS: Menu[] = [
  { name: APP_NAME, entries: [{ label: `Quit ${APP_NAME}`, action: "zed::Quit" }] }, // I-341
  {
    name: "File",
    entries: [
      { label: "Open Folder...", action: "workspace::Open" }, // I-346
      "separator", // the one that is left of I-349, I-351, I-355 (I-306)
      { label: "Close Window", action: "workspace::CloseWindow" }, // I-358
    ],
  },
  {
    name: "View",
    entries: [
      { label: "Toggle Left Dock", action: "workspace::ToggleLeftDock" }, // I-391
      { label: "Toggle Folder Sidebar", action: "multi_workspace::ToggleWorkspaceSidebar" }, // I-472
      { label: "Focus Folder Sidebar", action: "multi_workspace::FocusWorkspaceSidebar" }, // I-473
      "separator", // I-400
      { label: "Project Panel", action: "project_panel::ToggleFocus" }, // I-401
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
