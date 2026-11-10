import type { KeymapSection } from "../keymap/engine.ts";

export const NAV_BINDINGS: KeymapSection[] = [{ context: "Pane", bindings: { "alt-left": "pane::GoBack", "alt-right": "pane::GoForward" } }];
