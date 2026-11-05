import type { Menu } from "./menu.ts";

export const APP_NAME = "workbench-tauri";

// The Phase 3 end state of the list pinned in PROGRESS (R-8, 02-INTERACTION 9.2). Open Folder..., the sidebar
// items and the File separator come with the folder Phase (D-13); the bar only has menus with items (I-306).
export const MENUS: Menu[] = [
  { name: APP_NAME, entries: [{ label: `Quit ${APP_NAME}`, action: "zed::Quit" }] }, // I-341
  { name: "File", entries: [{ label: "Close Window", action: "workspace::CloseWindow" }] }, // I-358
  {
    name: "View",
    entries: [
      { label: "Toggle Left Dock", action: "workspace::ToggleLeftDock" }, // I-391
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
