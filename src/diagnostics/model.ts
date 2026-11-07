import type { IconName } from "../shell/Icon.tsx";

export const DIAGNOSTICS = { key: "Project Diagnostics", title: "No problems", icon: "check" as const, iconSuccess: true, message: "No problems in workspace" };

// Zed 4304dec732 diagnostics/toolbar_controls.rs and search/buffer_search.rs.
// D-17: there is no diagnostic source or language server, so these controls have no handlers.
export const DIAGNOSTICS_CONTROLS: { name: IconName; label: string; action?: string; warning?: boolean }[] = [
  { name: "chevron_down_up", label: "Collapse All Files", action: "editor::ToggleFoldAll" },
  { name: "magnifying_glass", label: "Buffer Search", action: "buffer_search::Deploy" },
  { name: "zed_assistant", label: "Inline Assist", action: "assistant::InlineAssist" },
  { name: "arrow_circle", label: "Refresh Diagnostics", action: "diagnostics::ToggleDiagnosticsRefresh" },
  { name: "warning", label: "Exclude Warnings", warning: true },
];
