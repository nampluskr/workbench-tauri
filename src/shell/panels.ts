import { createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { commands } from "../keymap/keyboard.ts";
import { notify } from "./toast.ts";
import { focusPane } from "../workspace/context.ts";
import { editorContext, outlineOpen, setOutlineOpen } from "../workspace/store.ts";

// Showing and focusing the sidebar and the left Dock (R-17, A-17.1/2/7/8, I-098~I-100). Showing and focusing are
// separate: Ctrl+Alt+J / Ctrl+B show and hide, Ctrl+Alt+; / Ctrl+Shift+E move focus.
export const [sidebarOpen, setSidebarOpen] = createSignal(true); // A-11.7
export const [dockOpen, setDockOpen] = createSignal(true);

const sidebarEl = () => document.querySelector<HTMLElement>(".sidebar-list");
const panelEl = () => document.querySelector<HTMLElement>(".project-panel");
// Focus goes to the active Pane's editor, not to the Pane element: that one has no Editor keymap context (K-33).
const focusActivePane = () => focusPane(editorContext().pane());
const holds = (area: HTMLElement | null) => !!area && area.contains(document.activeElement);

// Where focus was before it went into the sidebar or the panel, so it can go back there.
let sidebarFrom: HTMLElement | null = null;
let panelFrom: HTMLElement | null = null;
const here = () => (document.activeElement instanceof HTMLElement ? document.activeElement : null);
const back = (from: HTMLElement | null) => (from?.isConnected ? from.focus() : focusActivePane());

export function focusSidebar(): void {
  if (!holds(sidebarEl())) sidebarFrom = here();
  setSidebarOpen(true);
  sidebarEl()?.focus();
}

/** Ctrl+Alt+J: open (and focus), or close; closing from inside goes back to where focus was, else to the Pane. */
export function toggleSidebar(): void {
  if (!sidebarOpen()) return focusSidebar();
  const inside = holds(sidebarEl());
  setSidebarOpen(false);
  if (inside) back(sidebarFrom);
  else focusActivePane();
}

/** Ctrl+Alt+;: open if closed and focus; if focus is already inside, give it back but keep the sidebar. */
export function toggleSidebarFocus(): void {
  if (sidebarOpen() && holds(sidebarEl())) back(sidebarFrom);
  else focusSidebar();
}

/** Ctrl+B: show or hide the left Dock. */
export function toggleDock(): void {
  const inside = holds(panelEl());
  setDockOpen(!dockOpen());
  if (inside && !dockOpen()) focusActivePane();
}

/** Ctrl+Shift+E: from outside open the Dock and focus the panel; from inside go back to the Pane, panel stays. */
export function togglePanelFocus(): void {
  if (dockOpen() && holds(panelEl())) return back(panelFrom);
  focusPanel();
}

/** The focus half of Ctrl+Shift+E; also a click on the Tree Sidebar's title (core v0.8.3 I-16). */
export function focusPanel(): void {
  if (!holds(panelEl())) panelFrom = here();
  setDockOpen(true);
  panelEl()?.focus();
}

/** core v0.8.1 I-4: the status bar button shows or hides the Outline bar (no key); closing it from inside gives focus to the Pane. */
export function toggleOutline(): void {
  const inside = holds(document.querySelector<HTMLElement>(".outline-bar"));
  setOutlineOpen(!outlineOpen());
  if (inside) focusActivePane();
}

// core v0.8.3 I-14 Zen Mode: F11 only, in memory only (a new window starts without it). The title bar is gone while it is on,
// so the native maximize button over its place goes too (src-tauri/src/caption.rs) and the tab bars move the window instead.
export const [zenMode, setZenMode] = createSignal(false);
/** The `data-tauri-drag-region` of a tab bar part: in Zen Mode a press on the part itself (not on a tab or a button in it) drags the window, a double press maximizes. */
export const zenDragRegion = (): "" | undefined => (zenMode() ? "" : undefined);
commands.set("workspace::ToggleZenMode", () => {
  setZenMode(!zenMode());
  void invoke("caption_set_visible", { visible: !zenMode() }).catch((error) => notify([String(error)]));
});
commands.set("multi_workspace::ToggleWorkspaceSidebar", toggleSidebar);
commands.set("multi_workspace::FocusWorkspaceSidebar", toggleSidebarFocus);
commands.set("workspace::ToggleLeftDock", toggleDock);
commands.set("project_panel::ToggleFocus", togglePanelFocus);
commands.set("outline_panel::Toggle", toggleOutline);
