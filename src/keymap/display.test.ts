import test from "node:test";
import assert from "node:assert/strict";
import { BUILTIN } from "./builtin.ts";
import { displayChunks, shortcutFor } from "./display.ts";
import { Keymap, type ContextNode } from "./engine.ts";

const node = (...names: string[]): ContextNode => new Set(names);

test("L-219~L-221: order Ctrl-Win-Alt-Shift-key, capitalized key, PageUp/PageDown, one chunk per stroke", () => {
  assert.deepEqual(displayChunks("ctrl-alt-j"), ["Ctrl-Alt-J"]);
  assert.deepEqual(displayChunks("ctrl-alt-;"), ["Ctrl-Alt-;"]);
  assert.deepEqual(displayChunks("ctrl-k ctrl-o"), ["Ctrl-K", "Ctrl-O"]);
  assert.deepEqual(displayChunks("ctrl-alt-shift-win-c"), ["Ctrl-Win-Alt-Shift-C"]);
  assert.deepEqual(displayChunks("shift-pageup"), ["Shift-PageUp"]);
  assert.deepEqual(displayChunks("pagedown"), ["PageDown"]);
  assert.deepEqual(displayChunks("ctrl--"), ["Ctrl--"]); // the minus key itself
  assert.deepEqual(displayChunks("f10"), ["F10"]);
});

test("R-5 / I-704: shortcut is the last unshadowed binding in the focus context, else any in the window, else none", () => {
  const km = new Keymap();
  km.addSections("default", BUILTIN);
  const workspace = [node("Workspace")];
  assert.deepEqual(shortcutFor(km, "workspace::ToggleLeftDock", workspace), ["Ctrl-Alt-2"]);
  assert.deepEqual(shortcutFor(km, "workspace::Open", workspace), ["Ctrl-K", "Ctrl-O"]);
  // Project panel actions are not bound in the Workspace context: the window-wide fallback finds the last one (02 11.2).
  for (const [action, key] of [["Copy", "Ctrl-C"], ["Paste", "Ctrl-V"], ["Trash", "Delete"], ["Delete", "Ctrl-Delete"]]) assert.deepEqual(shortcutFor(km, `project_panel::${action}`, workspace), [key]);
  assert.equal(shortcutFor(km, "pane::GoBack", workspace), undefined); // L-223
  // A user binding comes last and wins; a null on the same context hides the key of the shadowed default.
  km.addSections("user", [{ context: "Workspace", bindings: { "ctrl-shift-b": "workspace::ToggleLeftDock" } }]);
  assert.deepEqual(shortcutFor(km, "workspace::ToggleLeftDock", workspace), ["Ctrl-Shift-B"]);
  km.addSections("user", [{ context: "Workspace", bindings: { "ctrl-shift-b": "other::Action" } }]);
  assert.deepEqual(shortcutFor(km, "workspace::ToggleLeftDock", workspace), ["Ctrl-Alt-2"]); // shadowed key is skipped
  km.clear("user");
  assert.deepEqual(shortcutFor(km, "workspace::ToggleLeftDock", workspace), ["Ctrl-Alt-2"]);
});

test("I-704: a key shadowed by another action is not shown, not even by the window-wide fallback", () => {
  const km = new Keymap();
  km.addSections("default", BUILTIN);
  const workspace = [node("Workspace")];
  // The user gives Ctrl-Alt-2 to another action in the Workspace context: ToggleLeftDock has no visible key left.
  km.addSections("user", [{ context: "Workspace", bindings: { "ctrl-alt-2": "app_menu::Toggle" } }]);
  assert.equal(shortcutFor(km, "workspace::ToggleLeftDock", workspace), undefined);
  assert.deepEqual(shortcutFor(km, "app_menu::Toggle", workspace), ["Ctrl-Alt-2"]);
  // The fallback judges a ProjectPanel key in its own context: Ctrl-Insert is taken there, so Copy shows Ctrl-C.
  km.addSections("user", [{ context: "ProjectPanel", bindings: { "ctrl-insert": "other::Action" } }]);
  assert.deepEqual(shortcutFor(km, "project_panel::Copy", workspace), ["Ctrl-C"]);
  // A null removes the binding without taking the key for another action: nothing to show for it either.
  km.addSections("user", [{ context: "Workspace", bindings: { "ctrl-k ctrl-o": null } }]);
  assert.equal(shortcutFor(km, "workspace::Open", workspace), undefined);
});
