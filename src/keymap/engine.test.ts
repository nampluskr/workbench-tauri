// SPEC R-7 rule tests. Each case turns one sentence of 02-INTERACTION
// I-702 / I-703 / I-001 / I-704 into an example.
// Run: node --test src/keymap/engine.test.ts   (Node 24 type stripping)
import { test } from "node:test";
import assert from "node:assert/strict";
import { Keymap, keystrokeFromEvent, normalizeKeystroke } from "./engine.ts";
import type { ContextEntry } from "./context.ts";

const workspace: ContextEntry = { name: "Workspace" };
const pane: ContextEntry = { name: "Pane" };
const editor: ContextEntry = { name: "Editor" };
const PATH: ContextEntry[] = [workspace, pane, editor];

function action(km: Keymap, keys: string, path = PATH) {
  const seq = keys.split(" ");
  let r = km.press(seq[0], path);
  for (const k of seq.slice(1)) r = km.press(k, path);
  return r.kind === "action" ? r.action : r.kind;
}

// ---- I-702 ----

test("I-702: deeper matching context wins (Editor > Pane > Workspace)", () => {
  const km = new Keymap();
  km.add(
    { keys: "ctrl-w", action: "editor::Deeper", context: "Editor" },
    { keys: "ctrl-w", action: "workspace::Outer", context: "Workspace" },
    { keys: "ctrl-w", action: "pane::Middle", context: "Pane" },
  );
  assert.equal(action(km, "ctrl-w"), "editor::Deeper");
  assert.equal(action(km, "ctrl-w", [workspace, pane]), "pane::Middle");
  assert.equal(action(km, "ctrl-w", [workspace]), "workspace::Outer");
});

test("I-702: equal depth -> the binding registered later wins", () => {
  const km = new Keymap();
  km.add(
    { keys: "ctrl-p", action: "first", context: "Workspace" },
    { keys: "ctrl-p", action: "second", context: "Workspace" },
  );
  assert.equal(action(km, "ctrl-p"), "second");
});

test("I-702: a binding without context counts as the deepest", () => {
  const km = new Keymap();
  km.add(
    { keys: "ctrl-o", action: "editor::InEditor", context: "Editor" },
    { keys: "ctrl-o", action: "global::NoContext" },
  );
  // Same depth as Editor (deepest) and registered later -> wins.
  assert.equal(action(km, "ctrl-o"), "global::NoContext");
  const km2 = new Keymap();
  km2.add(
    { keys: "ctrl-o", action: "global::NoContext" },
    { keys: "ctrl-o", action: "workspace::Outer", context: "Workspace" },
  );
  // Registered later but shallower -> the context-less binding still wins.
  assert.equal(action(km2, "ctrl-o"), "global::NoContext");
});

test("I-702: a longer condition does not take priority by itself", () => {
  const km = new Keymap();
  km.add(
    { keys: "ctrl-e", action: "long", context: "Editor && !Terminal && !Picker" },
    { keys: "ctrl-e", action: "short", context: "Editor" },
  );
  assert.equal(action(km, "ctrl-e"), "short");
});

// ---- I-703 ----

test("I-703: null disables lower-priority candidates in that context", () => {
  const km = new Keymap();
  km.add(
    { keys: "ctrl-d", action: "default::Act", context: "Editor", source: "default" },
    { keys: "ctrl-d", action: null, context: "Editor", source: "base" },
  );
  assert.equal(action(km, "ctrl-d"), "none");
});

test("I-703: the overlay's null does not remove the user's binding", () => {
  const km = new Keymap();
  km.add(
    { keys: "ctrl-d", action: "user::Act", context: "Editor", source: "user" },
    { keys: "ctrl-d", action: null, context: "Editor", source: "base" },
  );
  assert.equal(action(km, "ctrl-d"), "user::Act");
});

test("I-703: source rank user > base > default applies to null only", () => {
  const km = new Keymap();
  km.add(
    { keys: "ctrl-g", action: "base::Act", context: "Editor", source: "base" },
    { keys: "ctrl-g", action: null, context: "Editor", source: "user" },
  );
  assert.equal(action(km, "ctrl-g"), "none");
  // Rank is not mixed into the depth/order rule: a later default binding
  // still beats an earlier user binding at the same depth.
  const km2 = new Keymap();
  km2.add(
    { keys: "ctrl-h", action: "user::Early", context: "Editor", source: "user" },
    { keys: "ctrl-h", action: "default::Late", context: "Editor", source: "default" },
  );
  assert.equal(action(km2, "ctrl-h"), "default::Late");
});

test("I-703: a deeper null disables a shallower binding of the same key", () => {
  const km = new Keymap();
  km.add(
    { keys: "ctrl-j", action: "workspace::Act", context: "Workspace", source: "default" },
    { keys: "ctrl-j", action: null, context: "Editor", source: "base" },
  );
  // Focus in the editor: the Editor null comes first and disables the Workspace binding.
  assert.equal(action(km, "ctrl-j"), "none");
  // Outside the editor the null does not match, so the Workspace binding runs.
  assert.equal(action(km, "ctrl-j", [workspace, pane]), "workspace::Act");
});

test("I-703: a deeper null also disables a shallower binding registered later", () => {
  const km = new Keymap();
  km.add(
    { keys: "ctrl-l", action: null, context: "Editor", source: "default" },
    { keys: "ctrl-l", action: "workspace::Late", context: "Workspace", source: "default" },
  );
  assert.equal(action(km, "ctrl-l"), "none");
});

test("I-703: a shallower null cannot disable a deeper binding", () => {
  const km = new Keymap();
  km.add(
    { keys: "ctrl-m", action: "editor::Act", context: "Editor", source: "default" },
    { keys: "ctrl-m", action: null, context: "Workspace", source: "user" },
  );
  // The deeper Editor binding comes first in the order, before the null.
  assert.equal(action(km, "ctrl-m"), "editor::Act");
  // Where the Editor binding does not match, the null applies.
  assert.equal(action(km, "ctrl-m", [workspace, pane]), "none");
});

// ---- I-001 ----

test("I-001: 'ctrl-k v' is Ctrl+K then V pressed separately", () => {
  const km = new Keymap();
  km.add({ keys: "ctrl-k v", action: "markdown::OpenPreviewToTheSide" });
  const first = km.press("ctrl-k", PATH);
  assert.equal(first.kind, "pending");
  const second = km.press("v", PATH);
  assert.equal(second.kind === "action" && second.action, "markdown::OpenPreviewToTheSide");
  // Ctrl held on the second key is a different chord.
  km.press("ctrl-k", PATH);
  assert.equal(km.press("ctrl-v", PATH).kind, "none");
});

test("I-001: a non-continuing key ends the chord and is handled alone", () => {
  const km = new Keymap();
  km.add({ keys: "ctrl-k v", action: "chord" }, { keys: "x", action: "plain::X" });
  km.press("ctrl-k", PATH);
  const r = km.press("x", PATH);
  assert.equal(r.kind === "action" && r.action, "plain::X");
  assert.equal(km.pendingPrefix(), "");
});

// ---- I-704 ----

test("I-704: displayed key requires the same action and the same arguments", () => {
  const km = new Keymap();
  km.add(
    { keys: "ctrl-1", action: "pane::Activate", args: [0] },
    { keys: "ctrl-2", action: "pane::Activate", args: [1] },
  );
  assert.equal(km.displayKeys("pane::Activate", [1], PATH), "ctrl-2");
  assert.equal(km.displayKeys("pane::Activate", [0], PATH), "ctrl-1");
});

test("I-704: keys shadowed by another action in this context are dropped", () => {
  const km = new Keymap();
  km.add(
    { keys: "ctrl-b", action: "workspace::ToggleLeftDock", context: "Workspace" },
    { keys: "ctrl-alt-b", action: "workspace::ToggleLeftDock", context: "Workspace" },
    { keys: "ctrl-alt-b", action: "editor::Other", context: "Editor" },
  );
  // In the editor, ctrl-alt-b runs another action -> show ctrl-b.
  assert.equal(km.displayKeys("workspace::ToggleLeftDock", null, PATH), "ctrl-b");
});

test("I-704: among the remaining candidates the last binding is shown", () => {
  const km = new Keymap();
  km.add(
    { keys: "ctrl-shift-e", action: "project_panel::ToggleFocus" },
    { keys: "ctrl-alt-e", action: "project_panel::ToggleFocus" },
  );
  assert.equal(km.displayKeys("project_panel::ToggleFocus", null, PATH), "ctrl-alt-e");
});

test("I-703 + I-001: a chord unbound with null is not a pending prefix", () => {
  const km = new Keymap();
  km.add(
    { keys: "ctrl-k v", action: "default::Chord", context: "Editor", source: "default" },
    { keys: "ctrl-k v", action: null, context: "Editor", source: "base" },
  );
  assert.equal(km.press("ctrl-k", PATH).kind, "none");
  assert.equal(km.pendingPrefix(), "");
});

test("I-704: argument objects compare structurally (key order ignored)", () => {
  const km = new Keymap();
  km.add({ keys: "ctrl-3", action: "pane::Split", args: { direction: "right", focus: true } });
  assert.equal(km.displayKeys("pane::Split", { focus: true, direction: "right" }, PATH), "ctrl-3");
  assert.equal(km.displayKeys("pane::Split", { focus: false, direction: "right" }, PATH), null);
});

test("I-704: a chord whose prefix runs another action here is not shown", () => {
  const km = new Keymap();
  km.add(
    { keys: "ctrl-k ctrl-s", action: "zed::OpenKeymap", context: "Workspace" },
    { keys: "ctrl-k", action: "editor::Other", context: "Editor" },
    { keys: "ctrl-alt-s", action: "zed::OpenKeymap", context: "Workspace" },
  );
  // In the editor ctrl-k runs editor::Other, so the chord cannot be typed.
  assert.equal(km.displayKeys("zed::OpenKeymap", null, PATH), "ctrl-alt-s");
  // Outside the editor the chord is reachable; it is registered earlier, so
  // the last remaining candidate (ctrl-alt-s) is still the one shown.
  const km2 = new Keymap();
  km2.add({ keys: "ctrl-k ctrl-s", action: "zed::OpenKeymap", context: "Workspace" });
  assert.equal(km2.displayKeys("zed::OpenKeymap", null, PATH), "ctrl-k ctrl-s");
});

// ---- keystroke normalization ----

test("keystrokes normalize modifiers and read DOM events by code", () => {
  assert.equal(normalizeKeystroke("shift-ctrl-P"), "ctrl-shift-p");
  assert.equal(normalizeKeystroke("ctrl--"), "ctrl--");
  const ev = (code: string, mods: Partial<Record<"ctrlKey" | "altKey" | "shiftKey" | "metaKey", boolean>> = {}) =>
    keystrokeFromEvent({ key: "", code, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, ...mods });
  assert.equal(ev("KeyP", { ctrlKey: true }), "ctrl-p");
  assert.equal(ev("F5"), "f5");
  assert.equal(ev("ArrowLeft", { altKey: true }), "alt-left");
  assert.equal(ev("Equal", { ctrlKey: true }), "ctrl-=");
  assert.equal(ev("Minus", { ctrlKey: true }), "ctrl--");
  assert.equal(ev("NumpadAdd", { ctrlKey: true }), "ctrl-+");
  assert.equal(ev("NumpadSubtract", { ctrlKey: true }), "ctrl--");
  assert.equal(ev("Tab", { ctrlKey: true }), "ctrl-tab");
  assert.equal(ev("ControlLeft", { ctrlKey: true }), null);
  // Empty code (e.g. synthetic input without a scan code) falls back to key.
  const evk = (key: string, mods: Partial<Record<"ctrlKey" | "altKey", boolean>> = {}) =>
    keystrokeFromEvent({ key, code: "", ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, ...mods });
  assert.equal(evk("F5"), "f5");
  assert.equal(evk("r", { ctrlKey: true }), "ctrl-r");
  assert.equal(evk("ArrowLeft", { altKey: true }), "alt-left");
  assert.equal(evk("Control", { ctrlKey: true }), null);
});
