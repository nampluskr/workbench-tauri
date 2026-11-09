import test from "node:test";
import assert from "node:assert/strict";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { history, redo, toggleComment, undo, undoDepth } from "@codemirror/commands";
import { EDITOR_UNDO_GROUP_INTERVAL_MS } from "../spec/metrics.ts";

test("K-11-R2: only a handled IME shortcut's immediate matching composition is discarded before history", async (t) => {
  let observers: Parameters<typeof EditorView.domEventObservers>[0] = {};
  const original = EditorView.domEventObservers;
  t.mock.method(EditorView, "domEventObservers", (handlers: typeof observers) => {
    observers = handlers;
    return original(handlers);
  });
  let now = 1000;
  t.mock.method(Date, "now", () => now);
  class Element {
    dataset = { keymapContext: "Editor" };
    parentElement = null;
    closest(selector: string) { return selector === ".cm-content" ? this : null; }
  }
  class Input extends Element {}
  for (const [name, value] of Object.entries({ Element, HTMLInputElement: Input })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => { if (previous) Object.defineProperty(globalThis, name, previous); else Reflect.deleteProperty(globalThis, name); });
  }
  const { imeShortcutInput } = await import("./ime.ts");
  const { onKeyDown, commands } = await import("../keymap/keyboard.ts");
  const view = {
    contentDOM: new Element(),
    state: EditorState.create({ doc: "x = 2", extensions: [history(), imeShortcutInput,
      EditorState.languageData.of(() => [{ commentTokens: { line: "#" } }])] }),
    dispatch(spec: Parameters<EditorState["update"]>[0]) { view.state = view.state.update(spec).state; },
  };
  const target = view as unknown as EditorView;
  const previous = commands.get("editor::ToggleComment");
  commands.set("editor::ToggleComment", () => { toggleComment(target); });
  t.after(() => { if (previous) commands.set("editor::ToggleComment", previous); else commands.delete("editor::ToggleComment"); });
  const press = (ctrlKey = true) => onKeyDown({ target: view.contentDOM, key: "Process", code: "Slash",
    ctrlKey, altKey: false, shiftKey: false, metaKey: false, preventDefault() {} } as unknown as KeyboardEvent);
  const input = (text: string, inputType = "insertCompositionText", receiving = target) => {
    observers.beforeinput?.call({}, { inputType, data: text } as InputEvent, receiving);
    const from = receiving.state.doc.length;
    const insert = () => receiving.state.update({ changes: { from, insert: text }, userEvent: "input.type.compose" });
    const handled = receiving.state.facet(EditorView.inputHandler).some((handler) => handler(receiving, from, from, text, insert));
    if (!handled) receiving.dispatch(insert());
    return handled;
  };
  press();
  assert.equal(view.state.doc.toString(), "# x = 2");
  assert.equal(input("/"), true);
  assert.equal(view.state.doc.toString(), "# x = 2");
  assert.equal(undoDepth(view.state), 1);
  undo(target);
  assert.equal(view.state.doc.toString(), "x = 2");
  assert.equal(undoDepth(view.state), 0);
  redo(target);
  assert.equal(view.state.doc.toString(), "# x = 2", "redo contains only the comment toggle");
  assert.equal(input("/"), false, "the guard is consumed once");
  press();
  assert.equal(input("한"), false, "different Korean composition is untouched");
  press();
  assert.equal(input("/", "insertText"), false, "ordinary typing is untouched");
  press();
  now += EDITOR_UNDO_GROUP_INTERVAL_MS + 1;
  assert.equal(input("/"), false, "expired composition is untouched");
  press(false);
  assert.equal(input("/"), false, "unmodified Process does not arm a guard");
  press();
  const other = { ...view, contentDOM: new Element() } as unknown as EditorView;
  assert.equal(input("/", "insertCompositionText", other), false, "a different editor is untouched");
});
