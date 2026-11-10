import test from "node:test";
import assert from "node:assert/strict";
import { fontTarget, stepEditorFontSize } from "./font-size.ts";
import { keymap } from "../keymap/keyboard.ts";
import { strokeOf } from "../keymap/engine.ts";

test("U-17: one px per step, clamped to 6..100, reset returns the setting", () => {
  assert.equal(stepEditorFontSize(15, 1, 15), 16);
  assert.equal(stepEditorFontSize(15, -1, 15), 14);
  assert.equal(stepEditorFontSize(6, -1, 15), 6);
  assert.equal(stepEditorFontSize(100, 1, 15), 100);
  assert.equal(stepEditorFontSize(40, 0, 18), 18);
});

test("I-1: the focused editor or preview is the zoom target, any other focus has none", () => {
  const stack = (...names: string[]) => [new Set(["Workspace"]), ...names.map((n) => new Set(n.split(" ")))];
  assert.equal(fontTarget(stack("Pane", "Editor extension=md")), "editor");
  assert.equal(fontTarget(stack("Pane", "Editor", "EditorSearch")), "editor");
  assert.equal(fontTarget(stack("Pane", "MarkdownPreview")), "preview");
  for (const other of [[], ["Sidebar"], ["Pane"], ["ProjectPanel menu not_editing"], ["KeymapEditor"]]) assert.equal(fontTarget(stack(...other)), null);
});

test("U-17: Ctrl+= / Ctrl+Shift+= / numpad + zoom in, Ctrl+- / numpad - zoom out, Ctrl+0 resets, from every focus", () => {
  const key = (init: Partial<KeyboardEvent>) => strokeOf({ key: "", code: "", ctrlKey: true, altKey: false, shiftKey: false, metaKey: false, ...init })!;
  const action = (stroke: string, ...contexts: string[]) => {
    const result = keymap.dispatch([stroke], [new Set(["Workspace"]), ...contexts.map((c) => new Set([c]))]);
    return result.type === "match" ? result.action : null;
  };
  const strokes = {
    "ctrl-=": key({ key: "=", code: "Equal" }),
    "ctrl-shift-=": key({ key: "+", code: "Equal", shiftKey: true }),
    "numpad +": key({ key: "+", code: "NumpadAdd" }),
    "ctrl--": key({ key: "-", code: "Minus" }),
    "numpad -": key({ key: "-", code: "NumpadSubtract" }),
    "ctrl-0": key({ key: "0", code: "Digit0" }),
    "numpad 0": key({ key: "0", code: "Numpad0" }),
  };
  for (const context of [[], ["Editor"], ["Sidebar"], ["Pane"]]) {
    for (const name of ["ctrl-=", "ctrl-shift-=", "numpad +"] as const) assert.equal(action(strokes[name], ...context), "zed::IncreaseBufferFontSize", name);
    for (const name of ["ctrl--", "numpad -"] as const) assert.equal(action(strokes[name], ...context), "zed::DecreaseBufferFontSize", name);
    for (const name of ["ctrl-0", "numpad 0"] as const) assert.equal(action(strokes[name], ...context), "zed::ResetBufferFontSize", name);
  }
});
