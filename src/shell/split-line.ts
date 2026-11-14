/** The theme area a Pane's body is drawn in (theme/apply.ts): the editor or the preview. null: no document body (Welcome, a tool tab, a Sidebar, a nested split). */
export type Area = "edit" | "view";

/**
 * core v0.8.3 I-13: the colour of the line between two neighbours. Only the body part (below the tab bars) of a left-right split
 * between two document Panes takes their themes' border colour, and only when both have the same one; all else is the UI theme's.
 */
export function splitLineColor(part: "tabs" | "body", axis: "h" | "v", a: Area | null, b: Area | null, border: Record<Area | "ui", string>): string {
  return part === "body" && axis === "h" && a && b && border[a] === border[b] ? border[a] : border.ui;
}

/** The `data-areas` value of a split line (app.css), or undefined when a side is no document Pane. */
export function splitLineAreas(a: Area | null, b: Area | null): string | undefined {
  return a && b ? [a, b].sort().join("-") : undefined;
}
