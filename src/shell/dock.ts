import { createSignal } from "solid-js";
import { PROJECT_PANEL_DEFAULT_WIDTH } from "../spec/metrics.ts";

export const [dockWidth, setDockWidth] = createSignal(PROJECT_PANEL_DEFAULT_WIDTH);
let resetWidth = () => {};
export const resetDockWidth = () => resetWidth();

/**
 * L-30: dragging the left Dock's resize handle sets its width; double-click resets it to
 * project_panel.default_width (L-32). The bounds (L-31) are min/max-width in app.css.
 * The width goes into an adopted sheet, not an inline style.
 */
export function resizeHandle(handle: HTMLDivElement): void {
  const dock = handle.parentElement!;
  const sheet = new CSSStyleSheet();
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  resetWidth = () => { sheet.replaceSync(""); setDockWidth(PROJECT_PANEL_DEFAULT_WIDTH); };
  handle.onpointerdown = (e) => handle.setPointerCapture(e.pointerId);
  handle.onpointermove = (e) => {
    if (!handle.hasPointerCapture(e.pointerId)) return;
    // A negative width is invalid CSS and the declaration is dropped; clamp so min-width (L-31) applies.
    const width = Math.max(0, e.clientX - dock.getBoundingClientRect().left);
    sheet.replaceSync(`.dock-left { width: ${width}px; }`);
    setDockWidth(dock.getBoundingClientRect().width * 16 / parseFloat(getComputedStyle(document.documentElement).fontSize)); // L-01: compare logical spec units.
  };
  handle.ondblclick = resetDockWidth;
}
