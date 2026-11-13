import { filetype } from "../editor/filetype.ts";
import type { Tab } from "../workspace/context.ts";
import type { KeymapSection } from "../keymap/engine.ts";
import type { IconName } from "./Icon.tsx";

// Zed 4304dec732 default-windows.json, Workspace context; later cards replace the registered no-op handlers.
export const STATUS_BINDINGS: KeymapSection[] = [{ context: "Workspace", bindings: {
  "ctrl-shift-f": "pane::DeploySearch",
  "ctrl-e": "file_finder::Toggle", // U-22: Zed binds it in Workspace; the keymap editor's own ctrl-e (EditInJson) sits deeper and wins there
  // U-17 / I-386~388: Zed binds Zoom In to Ctrl+= and Ctrl+Shift+= (the stroke "ctrl-+", also the numpad +), Ctrl+- (also the numpad -) and Ctrl+0.
  // The last key of an action is the one a menu shows (I-704).
  "ctrl-+": "zed::IncreaseBufferFontSize",
  "ctrl-=": "zed::IncreaseBufferFontSize",
  "ctrl--": "zed::DecreaseBufferFontSize",
  "ctrl-0": "zed::ResetBufferFontSize",
} }];

import type { Appearance, Settings, ThemeArea } from "../settings/model.ts";

type StatusButton = { name: IconName; label: string; action: string; toggled?: boolean; dividerAfter?: boolean | "toggle" };

/**
 * I-22; core v0.8.1 I-4: sidebar | tree | Outline | Search and Lock Preview, a divider after each of the first three.
 * core v0.8.2 I-1: all five are toggles (`toggled` draws the pressed cell): the sidebar button is always there and on while the folder
 * sidebar is open, Search is on while the folder has a Search tab in any pane (`searchOpen`).
 */
export function statusButtons(sidebarOpen: boolean, dockOpen: boolean, lockPreview: boolean, outlineOpen: boolean, searchOpen: boolean): StatusButton[] {
  return [
    { name: sidebarOpen ? "threads_sidebar_left_open" : "threads_sidebar_left_closed", label: sidebarOpen ? "Close Folder Sidebar" : "Open Folder Sidebar", action: "multi_workspace::ToggleWorkspaceSidebar", toggled: sidebarOpen, dividerAfter: "toggle" },
    { name: "file_tree", label: dockOpen ? "Close Left Dock" : "Project Panel", action: dockOpen ? "workspace::ToggleLeftDock" : "project_panel::ToggleFocus", toggled: dockOpen, dividerAfter: true },
    { name: "list_tree", label: outlineOpen ? "Close Outline" : "Outline", action: "outline_panel::Toggle", toggled: outlineOpen, dividerAfter: true },
    { name: "magnifying_glass", label: "Search", action: "pane::DeploySearch", toggled: searchOpen },
    { name: "eye", label: "Lock Preview", action: "markdown::ToggleLockPreview", toggled: lockPreview },
  ];
}

/**
 * core v0.8.2 I-2: the UI | Edit | View buttons at the right end, each showing its area's mode (moon: dark, sun: light). No pressed
 * cell: only the icon changes.
 */
export function themeButtons(s: Settings): { area: ThemeArea; text: string; mode: Appearance; name: IconName; label: string }[] {
  return ([["theme", "UI", "UI"], ["editor_theme", "Edit", "Editor"], ["preview_theme", "View", "Preview"]] as const).map(([area, text, title]) => {
    const mode = s[`${area}_mode`];
    return { area, text, mode, name: mode === "dark" ? "moon" : "sun", label: `${title}: ${mode === "dark" ? "Dark" : "Light"} Theme` };
  });
}

export function statusItems(tab: Tab | undefined): { position: string; filetype: string } | undefined {
  if (tab?.tool) {
    const position = tab.file.toolPosition?.();
    return position ? { position, filetype: "" } : undefined;
  }
  if (!tab || !tab.file.position) return;
  return { position: tab.file.position(), filetype: filetype(tab.path) };
}
