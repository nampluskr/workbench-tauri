import { PREVIEW_EXTENSIONS } from "../editor/preview-kind.ts";
import type { KeymapSection } from "./engine.ts";

// R-17: document editing follows VS Code; keep the pinned Zed baseline separate.
export const EDITOR_BINDINGS: KeymapSection[] = [{ context: "Editor", bindings: {
  "ctrl-a": "editor::SelectAll",
  "ctrl-l": "editor::SelectLine",
  // U-13: VS Code's second pair; the menu shows the last key of an action (I-704), so Ctrl+Alt stays the displayed one.
  "ctrl-shift-up": "editor::AddCursorAbove",
  "ctrl-shift-down": "editor::AddCursorBelow",
  "ctrl-alt-up": "editor::AddCursorAbove",
  "ctrl-alt-down": "editor::AddCursorBelow",
  "ctrl-/": "editor::ToggleComment",
  "shift-alt-a": "editor::ToggleBlockComment",
  "ctrl-f": "editor::Find",
  "ctrl-h": "editor::Replace",
  "f3": "editor::FindNext",
  "shift-f3": "editor::FindPrevious",
  "ctrl-d": "editor::AddNextOccurrence",
  "ctrl-alt-l": "editor::ToggleLineNumbers", // core v0.7 I-6
  "alt-z": "editor::ToggleSoftWrap", // core v0.7 I-7 (VS Code editor.action.toggleWordWrap)
  "ctrl-shift-l": "editor::SelectSelectionMatches",
  "ctrl-k ctrl-d": "editor::SkipOccurrence",
  "escape": "editor::Cancel",
} }, { context: "EditorSearch", bindings: {
  "enter": "editor::FindNext",
  "shift-enter": "editor::FindPrevious",
  "alt-c": "editor::SearchCaseSensitive",
  "alt-w": "editor::SearchWholeWord",
  "alt-r": "editor::SearchRegexp",
  "alt-enter": "editor::SelectSearchMatches",
  "escape": "editor::Cancel",
} }, { context: "MarkdownPreview", bindings: { // core v0.8.1 I-9: the preview find bar, with the editor tab's keys
  "ctrl-f": "editor::Find",
  "f3": "editor::FindNext",
  "shift-f3": "editor::FindPrevious",
  "escape": "editor::Cancel",
} }, { context: "ReplaceInput", bindings: {
  "enter": "editor::ReplaceNext",
  "ctrl-alt-enter": "editor::ReplaceAll",
} }];

// Built-in keymap (D-2), checked for menu actions against Zed Windows 4304dec732 (K-13).
// The binding set still matches the v0.4 PROGRESS R-1 table; only Redo's display order changes below.
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
      // core v0.8.3 I-4: one toggle key per Sidebar (Folder, Tree, Outline); the focus actions keep no default key.
      "ctrl-alt-1": "multi_workspace::ToggleWorkspaceSidebar",
      "ctrl-alt-2": "workspace::ToggleLeftDock",
      "ctrl-alt-3": "outline_panel::Toggle",
      "ctrl-k ctrl-o": "workspace::Open",
      "f10": "app_menu::Toggle",
      "ctrl-s": "workspace::Save", // I-005
      // I-008: several keys for one action show the last one (I-704), Ctrl-W (L-240).
      "ctrl-f4": "pane::CloseActiveItem",
      "ctrl-w": "pane::CloseActiveItem",
      "ctrl-k ctrl-up": "workspace::ActivatePaneUp", // I-020
      "ctrl-k ctrl-down": "workspace::ActivatePaneDown",
      "ctrl-k ctrl-left": "workspace::ActivatePaneLeft",
      "ctrl-k ctrl-right": "workspace::ActivatePaneRight",
      "shift-escape": "workspace::ToggleZoom", // I-737
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
      // Several keys for one action: the menu shows the last one (I-704), so the key to show goes last, as in Zed's
      // default-windows keymap and workbench-gpui (02 11.2: Ctrl-C, Ctrl-V, Delete, Ctrl-Delete).
      "ctrl-insert": "project_panel::Copy",
      "ctrl-c": "project_panel::Copy",
      "ctrl-x": "project_panel::Cut",
      "shift-insert": "project_panel::Paste",
      "ctrl-v": "project_panel::Paste",
      "ctrl-z": "project_panel::Undo", // core I-3, Zed default-windows.json:1024-1025 (ProjectPanel)
      "ctrl-shift-z": "project_panel::Redo",
      "backspace": "project_panel::Trash",
      "delete": "project_panel::Trash",
      "shift-delete": "project_panel::Delete",
      "ctrl-backspace": "project_panel::Delete",
      "ctrl-delete": "project_panel::Delete",
      "shift-alt-c": "workspace::CopyPath",
      "ctrl-k ctrl-shift-c": "workspace::CopyRelativePath",
      "menu": "project_panel::DeployContextMenu",
      "shift-f10": "project_panel::DeployContextMenu",
      "shift-up": "project_panel::SelectPreviousExtend",
      "shift-down": "project_panel::SelectNextExtend",
      "ctrl-alt-r": "project_panel::RevealInFileManager",
      "ctrl-shift-enter": "project_panel::OpenWithSystem",
    },
  },
  {
    context: "ProjectPanel && not_editing",
    bindings: { "space": "project_panel::Open" },
  },
  {
    context: "Pane",
    bindings: {
      "ctrl-f4": "pane::CloseActiveItem",
      "ctrl-w": "pane::CloseActiveItem",
      "ctrl-pageup": "pane::ActivatePreviousItem", // I-010
      "ctrl-pagedown": "pane::ActivateNextItem",
      "ctrl-k shift-enter": "pane::TogglePinTab", // I-014
      "ctrl-k up": "pane::SplitUp", // I-019
      "ctrl-k down": "pane::SplitDown",
      "ctrl-k left": "pane::SplitLeft",
      "ctrl-k right": "pane::SplitRight",
    },
  },
  {
    context: "Editor",
    bindings: {
      "ctrl-z": "editor::Undo",
      "ctrl-shift-z": "editor::Redo",
      "ctrl-y": "editor::Redo", // K-13: Zed's first Redo key (default-windows.json:78); last wins display here.
      "tab": "editor::Tab", // I-059: indent, never a focus move
      "shift-tab": "editor::Backtab",
      "ctrl-\\": "pane::SplitRight", // I-018
    },
  },
  {
    context: `Editor && (${PREVIEW_EXTENSIONS.map((e) => `extension == ${e}`).join(" || ")})`, // I-044 (the file view adds `extension=…` to its context); v0.8 M-5: every previewable file
    bindings: {
      "ctrl-shift-v": "markdown::OpenPreview",
      "ctrl-k v": "markdown::OpenPreviewToTheSide",
    },
  },
  {
    context: "MarkdownPreview",
    bindings: { "ctrl-shift-v": "markdown::CloseAndReturnToEditor" }, // I-045
  },
];
