import test from "node:test";
import assert from "node:assert/strict";
import { Keymap, type ContextNode } from "./engine.ts";
import { BUILTIN } from "./builtin.ts";
import { applyUserKeymap, ERR_LOAD, parseUserKeymap, stripJsonc } from "./user.ts";

const node = (...names: string[]): ContextNode => new Set(names);
const stack = [node("Workspace"), node("Pane")];
const known = (name: string) => name.startsWith("known::");
const loaded = () => { const km = new Keymap(); km.addSections("default", BUILTIN); return km; };

test("D-4: JSONC comments and trailing commas go; // and /* inside strings stay", () => {
  const text = `// head
[ /* block
 comment */ { "context": "A", // tail
  "bindings": { "ctrl-a": "known::url//x", "ctrl-b": "known::/*y*/", "ctrl-c": "q\\"//z", },
 }, ]`;
  assert.deepEqual(JSON.parse(stripJsonc(text)), [{ context: "A", bindings: { "ctrl-a": "known::url//x", "ctrl-b": "known::/*y*/", "ctrl-c": 'q"//z' } }]);
  assert.throws(() => JSON.parse(stripJsonc("[1 /* open")));
});

test("R-2: user binding overrides the built-in one at the same depth; a null unbinds it", () => {
  const km = loaded();
  assert.deepEqual(km.dispatch(["ctrl-alt-2"], stack), { type: "match", action: "workspace::ToggleLeftDock" });
  const errors = applyUserKeymap(km, `[{ "context": "Workspace", "bindings": { "ctrl-alt-2": "known::mine", "ctrl-alt-1": null } }]`, known);
  assert.deepEqual(errors, []);
  assert.deepEqual(km.dispatch(["ctrl-alt-2"], stack), { type: "match", action: "known::mine" });
  assert.deepEqual(km.dispatch(["ctrl-alt-1"], stack), { type: "none" });
});

test("D-14: unknown actions and malformed items give one line each; the rest still applies", () => {
  const km = loaded();
  const errors = applyUserKeymap(km, `[
    { "bindings": { "ctrl-1": "nope::A", "ctrl-2": "known::ok", "ctrl-3": "nope::B", "ctrl-4": ["known::x", {}] } },
    { "context": 5, "bindings": {} },
    { "context": "Workspace &&", "bindings": { "ctrl-5": "known::ok" } },
    { "bindings": [] },
    "x"
  ]`, known);
  assert.deepEqual(errors, ["Action 'nope::A' not found", "Action 'nope::B' not found", ERR_LOAD, ERR_LOAD, ERR_LOAD, ERR_LOAD, ERR_LOAD]);
  assert.deepEqual(km.dispatch(["ctrl-2"], stack), { type: "match", action: "known::ok" });
  assert.deepEqual(km.dispatch(["ctrl-1"], stack), { type: "none" });
});

test("R-2: broken JSON or a non-array top level is one load error with nothing applied; empty text is fine", () => {
  assert.deepEqual(parseUserKeymap(`[{ "bindings": { "a": 1 }`, known), { sections: [], errors: [ERR_LOAD] });
  assert.deepEqual(parseUserKeymap(`{ "bindings": {} }`, known), { sections: [], errors: [ERR_LOAD] });
  assert.deepEqual(parseUserKeymap(" \n", known), { sections: [], errors: [] });
});
