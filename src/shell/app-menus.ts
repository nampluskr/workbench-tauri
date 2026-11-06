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
      { label: "Close Editor", action: "workspace::CloseActiveItem" },
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

// Phase 6 stage 1: show shortcuts without installing bindings for absent screens.
export const USER_MENU: MenuEntry[] = [
  { label: "Settings", shortcut: "ctrl-,", disabled: true },
  { label: "Keymap", shortcut: "ctrl-k ctrl-s", disabled: true },
  { label: "Themes…", shortcut: "ctrl-k ctrl-t", disabled: true },
  { label: "Icon Themes…", disabled: true },
  { label: "Extensions", shortcut: "ctrl-shift-x", disabled: true },
  "separator",
  { label: "Panel Layout", children: [
    { label: "Classic", disabled: true },
    { label: "Agentic", disabled: true },
  ] },
];
