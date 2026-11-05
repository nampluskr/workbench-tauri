import type { KeymapSection } from "./engine.ts";

// Built-in keymap (D-2): the result of 01-zed 02-INTERACTION section 1 (Windows + VSCode overlay) for the
// v0.2 actions, re-typed in Zed's keymap.json shape. The expected rows are pinned in specs/v0.2/PROGRESS.md
// (Phase 2, R-1 table); builtin.test.ts compares this file with that table.
// Section order is the tie-break order at equal depth (later wins, I-702): `menu` first, as in workbench-gpui.
export const BUILTIN: KeymapSection[] = [
  {
    context: "menu",
    bindings: {
      "up": "menu::SelectPrevious",
      "down": "menu::SelectNext",
      "home": "menu::SelectFirst",
      "end": "menu::SelectLast",
      "tab": "menu::SelectNext",
      "shift-tab": "menu::SelectPrevious",
      "enter": "menu::Confirm",
      "escape": "menu::Cancel",
      "ctrl-n": "menu::SelectNext",
      "ctrl-p": "menu::SelectPrevious",
      "pageup": "menu::SelectFirst",
      "shift-pageup": "menu::SelectFirst",
      "pagedown": "menu::SelectLast",
      "shift-pagedown": "menu::SelectLast",
      "ctrl-c": "menu::Cancel",
      "right": "menu::SelectChild",
      "left": "menu::SelectParent",
    },
  },
  {
    bindings: {
      "ctrl-q": "zed::Quit",
      "ctrl-shift-w": "workspace::CloseWindow",
    },
  },
  {
    context: "Workspace",
    bindings: {
      "ctrl-b": "workspace::ToggleLeftDock",
      "ctrl-shift-e": "project_panel::ToggleFocus",
      "ctrl-alt-j": "multi_workspace::ToggleWorkspaceSidebar",
      "ctrl-alt-;": "multi_workspace::FocusWorkspaceSidebar",
      "ctrl-k ctrl-o": "workspace::Open",
      "f10": "app_menu::Toggle",
    },
  },
  {
    context: "Sidebar",
    bindings: {
      "up": "menu::SelectPrevious",
      "down": "menu::SelectNext",
      "enter": "menu::Confirm",
      "delete": "project_panel::RemoveFromProject",
    },
  },
  {
    context: "ProjectPanel",
    bindings: {
      "left": "project_panel::CollapseSelectedEntry",
      "right": "project_panel::ExpandSelectedEntry",
      "ctrl-left": "project_panel::CollapseAllEntries",
      "ctrl-right": "project_panel::ExpandAllEntries",
      "enter": "project_panel::Rename",
      "f2": "project_panel::Rename",
      "ctrl-n": "project_panel::NewFile",
      "alt-n": "project_panel::NewDirectory",
      "ctrl-c": "project_panel::Copy",
      "ctrl-insert": "project_panel::Copy",
      "ctrl-x": "project_panel::Cut",
      "ctrl-v": "project_panel::Paste",
      "shift-insert": "project_panel::Paste",
      "delete": "project_panel::Trash",
      "backspace": "project_panel::Trash",
      "shift-delete": "project_panel::Delete",
      "ctrl-delete": "project_panel::Delete",
      "ctrl-backspace": "project_panel::Delete",
      "shift-alt-c": "workspace::CopyPath",
      "ctrl-k ctrl-shift-c": "workspace::CopyRelativePath",
      "menu": "project_panel::DeployContextMenu",
      "shift-f10": "project_panel::DeployContextMenu",
      "shift-up": "project_panel::SelectPreviousExtend",
      "shift-down": "project_panel::SelectNextExtend",
    },
  },
  {
    context: "ProjectPanel && not_editing",
    bindings: { "space": "project_panel::Open" },
  },
];
