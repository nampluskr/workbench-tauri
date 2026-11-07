import test from "node:test";
import assert from "node:assert/strict";
import { commands, keymap, onKeyDown } from "./keyboard.ts";

test("K-15: input editing stays local while modified Workspace/global bindings dispatch", (t) => {
  class Element {
    dataset: Record<string, string> = {};
    parentElement: Element | null = null;
    recording = false;
    closest() { return this.recording ? this : null; }
  }
  class Input extends Element {}
  for (const [name, value] of Object.entries({ Element, HTMLInputElement: Input })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, name, previous);
      else Reflect.deleteProperty(globalThis, name);
    });
  }
  const calls: string[] = [];
  for (const action of ["zed::OpenSettings", "zed::OpenKeymap", "zed::Extensions", "workspace::ToggleLeftDock", "test::local", "test::global"]) {
    const previous = commands.get(action);
    commands.set(action, () => { calls.push(action); });
    t.after(() => { if (previous) commands.set(action, previous); else commands.delete(action); });
  }
  keymap.addSections("user", [
    { context: "ProjectPanel", bindings: { "ctrl-b": "test::local", "alt-n": "test::local" } },
    { bindings: { "ctrl-g": "test::global", "ctrl-a": "test::global", "ctrl-z": "test::global", "a": "test::global", "enter": "test::global", "ctrl-alt-q": "test::global" } },
  ]);
  t.after(() => keymap.clear("user"));
  const press = (target: Element, key: string, options: Partial<KeyboardEvent> = {}) => {
    const event = { target, key, code: "", ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, isComposing: false, keyCode: 0,
      defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...options };
    onKeyDown(event as unknown as KeyboardEvent);
    return event.defaultPrevented;
  };
  const parent = new Element();
  parent.dataset.keymapContext = "ProjectPanel";
  const input = new Input();
  input.parentElement = parent;
  // Covers marked tree/search/filter inputs and unmarked Settings inputs.
  for (const dataset of [{ textInput: "" }, {}]) {
    input.dataset = dataset;
    calls.length = 0;
    for (const key of [",", "b", "g"]) assert.ok(press(input, key, { ctrlKey: true }));
    assert.ok(press(input, "k", { ctrlKey: true }));
    assert.ok(press(input, "s", { ctrlKey: true }));
    assert.ok(press(input, "x", { ctrlKey: true, shiftKey: true }));
    assert.deepEqual(calls, ["zed::OpenSettings", "workspace::ToggleLeftDock", "test::global", "zed::OpenKeymap", "zed::Extensions"]);
    calls.length = 0;
    for (const key of ["a", "Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown", "Enter", "Escape", "Tab"]) {
      assert.equal(press(input, key), false, key);
      assert.equal(press(input, key, { ctrlKey: true }), false, `ctrl-${key}`);
    }
    for (const key of ["a", "c", "x", "v", "z", "y"])
      assert.equal(press(input, key, { ctrlKey: true }), false, `editing ${key}`);
    for (const key of ["a", "v", "z", "y"])
      assert.equal(press(input, key, { ctrlKey: true, shiftKey: true }), false, `editing shift-${key}`);
    assert.equal(press(input, "n", { altKey: true }), false, "ProjectPanel binding must not leak into the input");
    assert.equal(press(input, "q", { ctrlKey: true, altKey: true }), false, "AltGr belongs to text entry");
    assert.equal(press(input, ",", { ctrlKey: true, isComposing: true }), false);
    assert.equal(press(input, ",", { ctrlKey: true, keyCode: 229 }), false);
    assert.equal(press(input, "F5"), true, "unmodified browser accelerators remain blocked");
    assert.deepEqual(calls, []);
  }
  // Local edits cancel a pending chord, rather than completing it with a later key.
  press(input, "k", { ctrlKey: true });
  press(input, "a");
  press(input, "s", { ctrlKey: true });
  assert.deepEqual(calls, []);
  input.recording = true;
  assert.equal(press(input, ",", { ctrlKey: true }), false);
  assert.equal(press(input, "w", { ctrlKey: true }), false);
  assert.deepEqual(calls, []);
  // Non-input contexts keep their deeper bindings.
  assert.ok(press(parent, "b", { ctrlKey: true }));
  assert.deepEqual(calls, ["test::local"]);
});
