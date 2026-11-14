import type { Menu, MenuEntry, MenuItem } from "./menu.ts";

export const APP_NAME = "workbench-tauri";

// R-17: Edit follows workbench-kit.
export function appMenus(previewDisabled: () => boolean): Menu[] {
  const previewItem = (label: string, action: string): MenuItem => ({ label, action, get disabled() { return previewDisabled(); } });
  return [
    { name: "File", entries: [
      { label: "Open Folder...", action: "workspace::Open" },
      "separator",
      { label: "Save", action: "workspace::Save" },
      "separator",
      { label: "Close Editor", action: "workspace::CloseActiveItem", shortcut: "ctrl-w" }, // K-13: show Zed's key, keep close_pinned behavior.
      { label: "Close Window", action: "workspace::CloseWindow" },
      "separator",
      { label: "Quit", action: "zed::Quit" },
    ] },
    { name: "Edit", entries: ([
      { label: "Undo", action: "editor::Undo" },
      { label: "Redo", action: "editor::Redo" },
      "separator",
      { label: "Cut", action: "editor::Cut", shortcut: "ctrl-x" },
      { label: "Copy", action: "editor::Copy", shortcut: "ctrl-c" },
      { label: "Paste", action: "editor::Paste", shortcut: "ctrl-v" },
      "separator",
      { label: "Find", action: "editor::Find", shortcut: "ctrl-f" },
      { label: "Replace", action: "editor::Replace", shortcut: "ctrl-h" },
      "separator",
      { label: "Toggle Line Comment", action: "editor::ToggleComment" },
      { label: "Toggle Block Comment", action: "editor::ToggleBlockComment" },
      "separator",
      { label: "Select All", action: "editor::SelectAll" },
      { label: "Add Next Occurrence", action: "editor::AddNextOccurrence", shortcut: "ctrl-d" },
      { label: "Add Cursor Above", action: "editor::AddCursorAbove" },
      { label: "Add Cursor Below", action: "editor::AddCursorBelow" },
    ] satisfies MenuEntry[]).map((entry): MenuEntry => entry === "separator" ? entry : { ...entry, shortcutStyle: "vscode" }) },
    { name: "View", entries: [
      { label: "Toggle Tree Sidebar", action: "workspace::ToggleLeftDock" },
      { label: "Toggle Folder Sidebar", action: "multi_workspace::ToggleWorkspaceSidebar" },
      { label: "Toggle Outline Sidebar", action: "outline_panel::Toggle" },
      { label: "Editor Layout", children: [
        { label: "Split Up", action: "pane::SplitUp" },
        { label: "Split Down", action: "pane::SplitDown" },
        { label: "Split Left", action: "pane::SplitLeft" },
        { label: "Split Right", action: "pane::SplitRight" },
      ] },
      { label: "Maximize Pane", action: "workspace::ToggleZoom" },
      "separator",
      previewItem("Open Preview", "markdown::OpenPreview"),
      previewItem("Open Preview to the Side", "markdown::OpenPreviewToTheSide"),
    ] },
    // I-28: no Go menu; the tab arrows and the commands stay. I-29: Help is About alone, the Licenses are a button in it.
    { name: "Help", entries: [{ label: "About", action: "zed::About" }] },
  ];
}

// Phase 6: implemented screens use actions; later screens keep their disabled shortcuts.
export const userMenu = (classic: () => boolean): MenuEntry[] => [
  { label: "Settings", action: "zed::OpenSettings" },
  { label: "Keymap", action: "zed::OpenKeymap" },
  { label: "Themes…", action: "theme_selector::Toggle" },
  { label: "Icon Themes…", action: "icon_theme_selector::Toggle" },
  { label: "Extensions", action: "zed::Extensions" },
  "separator",
  { label: "Panel Layout", get children() { return [
    { label: "Classic", action: "workspace::UseClassicLayout", checked: classic() },
    ...(!classic() ? [{ label: "Custom", checked: true, disabled: true }] : []),
  ]; } },
];
