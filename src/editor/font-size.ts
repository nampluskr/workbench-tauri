import type { ContextNode } from "../keymap/engine.ts";
import { EDITOR_FONT_SIZE_MAX, EDITOR_FONT_SIZE_MIN, EDITOR_FONT_SIZE_STEP } from "../spec/metrics.ts";

/** U-17: next editor or preview font size (same step and range). direction 0 is reset: back to the setting value (`base`). */
export const stepEditorFontSize = (current: number, direction: -1 | 0 | 1, base: number): number =>
  direction === 0 ? base : Math.min(EDITOR_FONT_SIZE_MAX, Math.max(EDITOR_FONT_SIZE_MIN, current + direction * EDITOR_FONT_SIZE_STEP));

export type FontTarget = "editor" | "preview";

/** I-1: Ctrl+= / Ctrl+- / Ctrl+0 change the font of the editor or the Markdown preview that holds focus, and nothing else. */
export const fontTarget = (stack: readonly ContextNode[]): FontTarget | null =>
  stack.some((node) => node.has("Editor")) ? "editor" : stack.some((node) => node.has("MarkdownPreview")) ? "preview" : null;
