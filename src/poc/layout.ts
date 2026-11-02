// Pane/tab layout state for the R-1 PoC. Plain Solid store; components read
// it through props without destructuring.
import { createStore, produce } from "solid-js/store";

export interface PaneState {
  id: string;
  tabs: string[];
  active: string | null;
}

export type Structure = "row" | "nested";

export interface LayoutState {
  structure: Structure;
  panes: PaneState[];
}

const [layout, setLayout] = createStore<LayoutState>({
  structure: "row",
  panes: [
    { id: "p0", tabs: ["a", "b"], active: "a" },
    { id: "p1", tabs: ["c", "h"], active: "h" },
  ],
});

export { layout };

export function paneOf(tabId: string): number {
  return layout.panes.findIndex((p) => p.tabs.includes(tabId));
}

export function activateTab(tabId: string): void {
  const index = paneOf(tabId);
  if (index < 0) return;
  setLayout("panes", index, "active", tabId);
}

/** Open a new tab in a pane and make it active (Phase 3 probe). */
export function addTab(tabId: string, paneIndex: number): void {
  if (paneOf(tabId) >= 0) {
    activateTab(tabId);
    return;
  }
  setLayout(
    produce((s) => {
      const p = s.panes[paneIndex];
      p.tabs.push(tabId);
      p.active = tabId;
    }),
  );
}

/** Move a tab to another pane and make it active there. */
export function moveTab(tabId: string, toPane: number): void {
  const from = paneOf(tabId);
  if (from < 0 || from === toPane || !layout.panes[toPane]) return;
  setLayout(
    produce((s) => {
      const src = s.panes[from];
      src.tabs = src.tabs.filter((t) => t !== tabId);
      if (src.active === tabId) src.active = src.tabs[0] ?? null;
      const dst = s.panes[toPane];
      dst.tabs.push(tabId);
      dst.active = tabId;
    }),
  );
}

/** Switch between two wrapper structures so every pane component is recreated. */
export function toggleStructure(): Structure {
  const next: Structure = layout.structure === "row" ? "nested" : "row";
  setLayout("structure", next);
  return next;
}
