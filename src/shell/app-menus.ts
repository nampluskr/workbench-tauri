import type { Menu, MenuEntry, MenuItem } from "./menu.ts";

export const APP_NAME = "workbench-tauri";
export const REPOSITORY_URL = "https://github.com/nampluskr/workbench-tauri";
export const ISSUE_URL = `${REPOSITORY_URL}/issues/new`;

// R-17: Edit follows workbench-kit; search actions await @codemirror/search approval.
export function appMenus(markdownDisabled: () => boolean): Menu[] {
  const markdownItem = (label: string, action: string): MenuItem => ({ label, action, get disabled() { return markdownDisabled(); } });
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
      { label: "Find", action: "editor::Find", shortcut: "ctrl-f", disabled: true },
      { label: "Replace", action: "editor::Replace", shortcut: "ctrl-h", disabled: true },
      "separator",
      { label: "Toggle Line Comment", action: "editor::ToggleComment" },
      { label: "Toggle Block Comment", action: "editor::ToggleBlockComment" },
      "separator",
      { label: "Select All", action: "editor::SelectAll" },
      { label: "Add Next Occurrence", action: "editor::AddNextOccurrence", shortcut: "ctrl-d", disabled: true },
      { label: "Add Cursor Above", action: "editor::AddCursorAbove" },
      { label: "Add Cursor Below", action: "editor::AddCursorBelow" },
    ] satisfies MenuEntry[]).map((entry): MenuEntry => entry === "separator" ? entry : { ...entry, shortcutStyle: "vscode" }) },
    { name: "View", entries: [
      { label: "Toggle Left Dock", action: "workspace::ToggleLeftDock" },
      { label: "Toggle Folder Sidebar", action: "multi_workspace::ToggleWorkspaceSidebar" },
      { label: "Focus Folder Sidebar", action: "multi_workspace::FocusWorkspaceSidebar" },
      { label: "Editor Layout", children: [
        { label: "Split Up", action: "pane::SplitUp" },
        { label: "Split Down", action: "pane::SplitDown" },
        { label: "Split Left", action: "pane::SplitLeft" },
        { label: "Split Right", action: "pane::SplitRight" },
      ] },
      { label: "Maximize Pane", action: "workspace::ToggleZoom" },
      "separator",
      { label: "Project Panel", action: "project_panel::ToggleFocus" },
      markdownItem("Open Markdown Preview", "markdown::OpenPreview"),
      markdownItem("Open Markdown Preview to the Side", "markdown::OpenPreviewToTheSide"),
    ] },
    { name: "Go", entries: [
      { label: "Previous Tab", action: "pane::ActivatePreviousItem" },
      { label: "Next Tab", action: "pane::ActivateNextItem" },
    ] },
    { name: "Window", entries: [
      { label: "Minimize", action: "zed::Minimize" },
      { label: "Zoom", action: "zed::Zoom" },
    ] },
    { name: "Help", entries: [
      { label: "View Dependency Licenses", action: "zed::OpenLicenses" },
      "separator",
      { label: "File Bug Report...", url: ISSUE_URL },
      { label: "Request Feature...", url: ISSUE_URL },
      "separator",
      { label: `${APP_NAME} Repository`, url: REPOSITORY_URL },
      { label: `About ${APP_NAME}`, action: "zed::About" },
    ] },
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
