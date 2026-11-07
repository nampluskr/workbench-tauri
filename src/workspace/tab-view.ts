import { DIAGNOSTICS } from "../diagnostics/model.ts";
import type { Tip } from "../shell/tooltip.ts";
import { WHEEL_PIXELS_PER_LINE } from "../spec/metrics.ts";

/**
 * I-11: Zed's `tab_tooltip_text`. A file tab (and its Markdown preview, which asks its source) shows the absolute path, a
 * read-only one with the "Read-Only Tab" meta (pane.rs:3099); Project Search shows its query, else "Project Search"
 * (project_search.rs:1132); Diagnostics "Project Diagnostics" (diagnostics.rs:754). Other tool tabs have none.
 */
export function tabTooltip(tab: { path: string; tool?: boolean; title?: string; readOnly?: boolean }): Tip | null {
  if (tab.tool) {
    if (tab.path === DIAGNOSTICS.key) return { title: DIAGNOSTICS.key };
    return tab.path === "Project Search" ? { title: tab.title || "Project Search" } : null;
  }
  return tab.readOnly ? { title: tab.path, meta: "Read-Only Tab" } : { title: tab.path };
}

/** I-16: the sideways scroll of one wheel event over the tab row: `lineHeight` per wheel line; deltaMode 1 is already lines. */
export function tabWheelDelta(deltaY: number, deltaMode: number, lineHeight: number): number {
  return (deltaMode === 1 ? deltaY : deltaY / WHEEL_PIXELS_PER_LINE) * lineHeight;
}
