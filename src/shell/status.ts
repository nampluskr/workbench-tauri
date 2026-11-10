import { filetype } from "../editor/filetype.ts";
import type { Tab } from "../workspace/context.ts";
import type { KeymapSection } from "../keymap/engine.ts";
import type { IconName } from "./Icon.tsx";

// Zed 4304dec732 default-windows.json, Workspace context; later cards replace the registered no-op handlers.
export const STATUS_BINDINGS: KeymapSection[] = [{ context: "Workspace", bindings: {
  "ctrl-shift-f": "pane::DeploySearch",
  // U-17 / I-386~388: Zed binds Zoom In to Ctrl+= and Ctrl+Shift+= (the stroke "ctrl-+", also the numpad +), Ctrl+- (also the numpad -) and Ctrl+0.
  // The last key of an action is the one a menu shows (I-704).
  "ctrl-+": "zed::IncreaseBufferFontSize",
  "ctrl-=": "zed::IncreaseBufferFontSize",
  "ctrl--": "zed::DecreaseBufferFontSize",
  "ctrl-0": "zed::ResetBufferFontSize",
} }];

type StatusButton = { name: IconName; label: string; action: string; toggled?: boolean; dividerAfter?: boolean | "toggle" };

export function statusButtons(sidebarOpen: boolean, dockOpen: boolean, lockPreview: boolean): StatusButton[] {
  return [
    ...(!sidebarOpen ? [{ name: "threads_sidebar_left_closed" as const, label: "Open Folder Sidebar", action: "multi_workspace::ToggleWorkspaceSidebar", dividerAfter: "toggle" as const }] : []),
    { name: "file_tree", label: dockOpen ? "Close Left Dock" : "Project Panel", action: dockOpen ? "workspace::ToggleLeftDock" : "project_panel::ToggleFocus", toggled: dockOpen, dividerAfter: true },
    { name: "magnifying_glass", label: "Search", action: "pane::DeploySearch" },
    { name: "markdown", label: "Lock Preview", action: "markdown::ToggleLockPreview", toggled: lockPreview },
  ];
}

export function statusItems(tab: Tab | undefined): { position: string; filetype: string } | undefined {
  if (tab?.tool) {
    const position = tab.file.toolPosition?.();
    return position ? { position, filetype: "" } : undefined;
  }
  if (!tab || !tab.file.position) return;
  return { position: tab.file.position(), filetype: tab.markdown ? "Markdown" : filetype(tab.path) };
}
