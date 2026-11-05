import test from "node:test";
import assert from "node:assert/strict";
import { Keymap, strokeOf, type ContextNode, type KeyEventLike } from "./engine.ts";
import { BROWSER_KEYS } from "./keyboard.ts";

const node = (...names: string[]): ContextNode => new Set(names);
// Workspace > Pane > Editor
const stack = [node("Workspace"), node("Pane"), node("Editor")];
const press = (keymap: Keymap, keys: string[], s = stack) => keymap.dispatch(keys, s);
const ev = (key: string, code = "", mods: Partial<KeyEventLike> = {}): KeyEventLike =>
  ({ key, code, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, ...mods });

test("I-702: deeper context wins; same depth -> later; no context counts as deepest; length does not matter", () => {
  const km = new Keymap();
  km.add("default", [
    { keys: "ctrl-s", action: "workspace", context: "Workspace" },
    { keys: "ctrl-s", action: "editor", context: "Editor" },
  ]);
  assert.deepEqual(press(km, ["ctrl-s"]), { type: "match", action: "editor" });
  km.add("default", [{ keys: "ctrl-s", action: "anywhere" }]); // no context, registered later
  assert.deepEqual(press(km, ["ctrl-s"]), { type: "match", action: "anywhere" });
  km.add("default", [{ keys: "ctrl-s", action: "short", context: "Editor" }]); // same depth, later again
  assert.deepEqual(press(km, ["ctrl-s"]), { type: "match", action: "short" });
  km.add("default", [{ keys: "ctrl-s", action: "long", context: "Editor && !menu" }]); // longer expression, later
  assert.deepEqual(press(km, ["ctrl-s"]), { type: "match", action: "long" });
});

test("I-703: a deep null unbinds shallower bindings; an overlay null keeps user bindings", () => {
  const km = new Keymap();
  km.add("default", [
    { keys: "ctrl-b", action: "toggle-sidebar", context: "Workspace" },
    { keys: "ctrl-b", action: null, context: "Editor" }, // INTENT case: deep null
    { keys: "ctrl-d", action: "default-d", context: "Workspace" },
  ]);
  assert.deepEqual(press(km, ["ctrl-b"]), { type: "none" });
  assert.deepEqual(press(km, ["ctrl-b"], [node("Workspace"), node("Pane")]), { type: "match", action: "toggle-sidebar" });
  km.add("overlay", [{ keys: "ctrl-d", action: null, context: "Editor" }]);
  assert.deepEqual(press(km, ["ctrl-d"]), { type: "none" }); // overlay null beats the default binding
  km.add("user", [{ keys: "ctrl-d", action: "user-d", context: "Workspace" }]);
  assert.deepEqual(press(km, ["ctrl-d"]), { type: "match", action: "user-d" }); // ...but not the user's
});

test("I-001: space-separated keys are a chord pressed in order", () => {
  const km = new Keymap();
  km.add("default", [{ keys: "ctrl-k v", action: "preview" }]);
  assert.deepEqual(press(km, ["ctrl-k"]), { type: "pending" });
  assert.deepEqual(press(km, ["ctrl-k", "v"]), { type: "match", action: "preview" }); // second key has no ctrl
  assert.deepEqual(press(km, ["ctrl-k", "ctrl-v"]), { type: "none" });
});

test("I-704: display key skips shadowed keys, requires equal arguments, takes the last binding", () => {
  const km = new Keymap();
  km.add("default", [
    { keys: "ctrl-w", action: "close" },
    { keys: "ctrl-f4", action: "close" },
    { keys: "ctrl-shift-w", action: "close" },
    { keys: "ctrl-shift-w", action: "other", context: "Editor" }, // shadows ctrl-shift-w here
    { keys: "ctrl-1", action: ["goto", 1] },
    { keys: "ctrl-2", action: ["goto", 2] },
  ]);
  assert.equal(km.keyFor("close", stack), "ctrl-f4");
  assert.equal(km.keyFor("close", [node("Workspace")]), "ctrl-shift-w"); // not shadowed outside the editor
  assert.equal(km.keyFor(["goto", 2], stack), "ctrl-2");
});

test("key normalization: empty code uses key; IME uses code; numpad +/- are zoom keys", () => {
  assert.equal(strokeOf(ev("p", "", { ctrlKey: true })), "ctrl-p"); // synthetic input, code empty
  assert.equal(strokeOf(ev("ㅔ", "KeyP", { ctrlKey: true })), "ctrl-p"); // Korean layout
  assert.equal(strokeOf(ev("+", "NumpadAdd", { ctrlKey: true })), "ctrl-+");
  assert.equal(strokeOf(ev("-", "NumpadSubtract", { ctrlKey: true })), "ctrl--");
  assert.equal(strokeOf(ev("+", "Equal", { ctrlKey: true, shiftKey: true })), "ctrl-+"); // shift is part of "+"
  assert.equal(strokeOf(ev("P", "KeyP", { ctrlKey: true, shiftKey: true })), "ctrl-shift-p");
  assert.equal(strokeOf(ev("ArrowLeft", "ArrowLeft", { altKey: true })), "alt-left");
  assert.equal(strokeOf(ev("Control", "ControlLeft", { ctrlKey: true })), null);
});

test("R-5: every browser accelerator key to block normalizes into BROWSER_KEYS", () => {
  const keys: [KeyEventLike][] = [
    [ev("p", "KeyP", { ctrlKey: true })], [ev("f", "KeyF", { ctrlKey: true })], [ev("r", "KeyR", { ctrlKey: true })],
    [ev("F5", "F5")], [ev("F3", "F3")], [ev("ArrowLeft", "ArrowLeft", { altKey: true })], [ev("ArrowRight", "ArrowRight", { altKey: true })],
    [ev("+", "NumpadAdd", { ctrlKey: true })], [ev("-", "NumpadSubtract", { ctrlKey: true })],
    [ev("+", "Equal", { ctrlKey: true, shiftKey: true })], [ev("-", "Minus", { ctrlKey: true })],
    [ev("w", "KeyW", { ctrlKey: true })], [ev("Tab", "Tab", { ctrlKey: true })], [ev("F1", "F1")], [ev("F6", "F6")],
  ];
  for (const [e] of keys) assert.ok(BROWSER_KEYS.has(strokeOf(e)!), `${e.key} ${e.code}`);
});
