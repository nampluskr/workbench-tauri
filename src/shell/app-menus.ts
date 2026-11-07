import type { Menu, MenuEntry, MenuItem } from "./menu.ts";

export const APP_NAME = "workbench-tauri";
export const REPOSITORY_URL = "https://github.com/nampluskr/workbench-tauri";
export const ISSUE_URL = `${REPOSITORY_URL}/issues/new`;

// Only implemented actions survive the pinned Zed menu order (4304dec732).
export function appMenus(markdownDisabled: () => boolean): Menu[] {
  const markdownItem = (label: string, action: string): MenuItem => ({ label, action, get disabled() { return markdownDisabled(); } });
  return [
    { name: APP_NAME, entries: [{ label: `Quit ${APP_NAME}`, action: "zed::Quit" }] },
    { name: "File", entries: [
      { label: "Open Folder...", action: "workspace::Open" },
      "separator",
      { label: "Save", action: "workspace::Save" },
      "separator",
      { label: "Close Editor", action: "workspace::CloseActiveItem", shortcut: "ctrl-w" }, // K-13: show Zed's key, keep close_pinned behavior.
      { label: "Close Window", action: "workspace::CloseWindow" },
    ] },
    { name: "Edit", entries: [
      { label: "Undo", action: "editor::Undo" },
      { label: "Redo", action: "editor::Redo" },
    ] },
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
    ] },
  ];
}

// Phase 6: implemented screens use actions; later screens keep their disabled shortcuts.
export const userMenu = (classic: () => boolean): MenuEntry[] => [
  { label: "Settings", action: "zed::OpenSettings" },
  { label: "Keymap", action: "zed::OpenKeymap" },
  { label: "Themes…", action: "theme_selector::Toggle" },
  { label: "Icon Themes…", disabled: true },
  { label: "Extensions", action: "zed::Extensions" },
  "separator",
  { label: "Panel Layout", get children() { return [
    { label: "Classic", action: "workspace::UseClassicLayout", checked: classic() },
    ...(!classic() ? [{ label: "Custom", checked: true, disabled: true }] : []),
  ]; } },
];
