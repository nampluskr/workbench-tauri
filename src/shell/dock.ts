import { createEffect, createSignal, onCleanup } from "solid-js";
import { PROJECT_PANEL_DEFAULT_WIDTH } from "../spec/metrics.ts";

export const [dockWidth, setDockWidth] = createSignal(PROJECT_PANEL_DEFAULT_WIDTH);
let resetWidth = () => {};
export const resetDockWidth = () => resetWidth();

/**
 * L-30: dragging the left Dock's resize handle sets its width; double-click resets it to
 * project_panel.default_width (L-32). The bounds (L-31) are min/max-width in app.css.
 * The width goes into an adopted sheet, not an inline style.
 */
export function resizeHandle(handle: HTMLDivElement, sidebar?: { width: () => number; setWidth: (width: number) => void; selector?: string }): void {
  const dock = handle.parentElement!;
  const selector = sidebar ? (sidebar.selector ?? ".sidebar") : ".dock-left"; // core v0.8.1 I-4: the Outline bar is kept like the Sidebar
  const setWidth = sidebar?.setWidth ?? setDockWidth;
  const sheet = new CSSStyleSheet();
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  onCleanup(() => { document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== sheet); });
  if (sidebar) createEffect(() => sheet.replaceSync(`${selector} { width: ${sidebar.width() / 16}rem; }`)); // L-01
  const reset = () => { if (!sidebar) sheet.replaceSync(""); setWidth(PROJECT_PANEL_DEFAULT_WIDTH); };
  if (!sidebar) resetWidth = reset;
  handle.onpointerdown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault(); // Prevent text selection and native text dragging from interrupting pointer capture after a double-click.
    handle.setPointerCapture(e.pointerId);
  };
  handle.onpointermove = (e) => {
    if (!handle.hasPointerCapture(e.pointerId)) return;
    // A negative width is invalid CSS and the declaration is dropped; clamp so min-width (L-31) applies.
    const width = Math.max(0, e.clientX - dock.getBoundingClientRect().left);
    sheet.replaceSync(`${selector} { width: ${width}px; }`);
    setWidth(dock.getBoundingClientRect().width * 16 / parseFloat(getComputedStyle(document.documentElement).fontSize)); // L-01: compare logical spec units.
  };
  handle.ondblclick = reset;
}
