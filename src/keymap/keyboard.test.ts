import test from "node:test";
import assert from "node:assert/strict";
import { commands, hooks, keymap, onKeyDown, installKeyboard } from "./keyboard.ts";
import { strokeOf } from "./engine.ts";

test("K-11-R1: modified IME Process dispatches the physical shortcut and leaves composition alone", (t) => {
  class Element { dataset = { keymapContext: "Editor" }; parentElement = null; closest() { return null; } }
  class Input extends Element {}
  for (const [name, value] of Object.entries({ Element, HTMLInputElement: Input })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => { if (previous) Object.defineProperty(globalThis, name, previous); else Reflect.deleteProperty(globalThis, name); });
  }
  let calls = 0;
  const previous = commands.get("editor::ToggleComment");
  commands.set("editor::ToggleComment", () => { calls++; });
  t.after(() => { if (previous) commands.set("editor::ToggleComment", previous); else commands.delete("editor::ToggleComment"); });
  const event = { target: new Element(), key: "Process", code: "Slash", ctrlKey: true, altKey: false,
    shiftKey: false, metaKey: false, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
  assert.equal(strokeOf(event), "ctrl-/");
  onKeyDown(event as unknown as KeyboardEvent);
  assert.equal(calls, 1);
  assert.equal(event.defaultPrevented, true, "matched keydown suppresses composition input");
  assert.equal(strokeOf({ ...event, code: "KeyX" }), "ctrl-x");
  assert.equal(strokeOf({ ...event, code: "Digit1", ctrlKey: false, altKey: true }), "alt-1");
  const composing = { ...event, ctrlKey: false, defaultPrevented: false };
  assert.equal(strokeOf(composing), null);
  onKeyDown(composing as unknown as KeyboardEvent);
  assert.equal(composing.defaultPrevented, false);
  assert.equal(calls, 1);
});

test("R-17: editing and search keys dispatch only in Editor", (t) => {
  class Element { dataset: Record<string, string> = {}; parentElement: Element | null = null; closest() { return null; } }
  class Input extends Element {}
  for (const [name, value] of Object.entries({ Element, HTMLInputElement: Input })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => { if (previous) Object.defineProperty(globalThis, name, previous); else Reflect.deleteProperty(globalThis, name); });
  }
  const calls: string[] = [];
  for (const action of ["editor::SelectLine", "editor::AddCursorAbove", "sidebar::Search", "editor::Find", "editor::Replace", "editor::AddNextOccurrence"]) {
    const previous = commands.get(action);
    commands.set(action, () => { calls.push(action); });
    t.after(() => { if (previous) commands.set(action, previous); else commands.delete(action); });
  }
  const editor = new Element(), outside = new Element();
  editor.dataset.keymapContext = "Editor";
  outside.dataset.keymapContext = "Pane";
  const press = (target: Element, key: string, altKey = false) => {
    const event = { target, key, code: "", ctrlKey: true, altKey, shiftKey: false, metaKey: false,
      defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    onKeyDown(event as unknown as KeyboardEvent);
    return event.defaultPrevented;
  };
  assert.equal(press(editor, "l"), true);
  assert.equal(press(editor, "ArrowUp", true), true);
  assert.equal(press(outside, "l"), false);
  assert.equal(press(outside, "ArrowUp", true), false);
  assert.equal(press(editor, "f"), true);
  for (const key of ["h", "d"]) assert.equal(press(editor, key), true);
  assert.deepEqual(calls, ["editor::SelectLine", "editor::AddCursorAbove", "editor::Find", "editor::Replace", "editor::AddNextOccurrence"]);
});

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

test("R-19: Ctrl-F reaches Sidebar search only from Sidebar, including its inputs", (t) => {
  class Element {
    dataset: Record<string, string> = {};
    parentElement: Element | null = null;
    closest() { return null; }
  }
  class Input extends Element {}
  for (const [name, value] of Object.entries({ Element, HTMLInputElement: Input })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => { if (previous) Object.defineProperty(globalThis, name, previous); else Reflect.deleteProperty(globalThis, name); });
  }
  let calls = 0;
  const previous = commands.get("sidebar::Search");
  commands.set("sidebar::Search", () => { calls++; });
  t.after(() => { if (previous) commands.set("sidebar::Search", previous); else commands.delete("sidebar::Search"); });
  const press = (target: Element) => onKeyDown({ target, key: "f", code: "KeyF", ctrlKey: true,
    shiftKey: false, altKey: false, metaKey: false, isComposing: false, keyCode: 0, preventDefault() {} } as unknown as KeyboardEvent);
  const sidebar = new Element();
  sidebar.dataset.keymapContext = "Sidebar";
  const row = new Element(), input = new Input();
  row.parentElement = sidebar;
  input.parentElement = sidebar;
  press(row); press(input);
  assert.equal(calls, 2);
  for (const context of ["Editor", "ProjectPanel", "Pane", ""]) {
    const area = new Element();
    area.dataset.keymapContext = context;
    const input = new Input();
    input.parentElement = area;
    press(area); press(input);
  }
  assert.equal(calls, 2, "editor, tree, tab bar and their inputs never search Sidebar");
  press(sidebar);
  assert.equal(calls, 3);
});

test("K-13: search inputs dispatch panel keys while native input editing remains local", (t) => {
  class Element { dataset: Record<string, string> = {}; parentElement: Element | null = null; closest() { return null; } }
  class Input extends Element {}
  for (const [name, value] of Object.entries({ Element, HTMLInputElement: Input })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => { if (previous) Object.defineProperty(globalThis, name, previous); else Reflect.deleteProperty(globalThis, name); });
  }
  const calls: string[] = [];
  const actions = ["Find", "Replace", "FindNext", "FindPrevious", "SearchCaseSensitive", "SearchWholeWord", "SearchRegexp",
    "SelectSearchMatches", "ReplaceNext", "ReplaceAll", "Cancel", "Undo", "SelectAll", "AddNextOccurrence", "SelectSelectionMatches", "SkipOccurrence"];
  for (const name of actions) {
    const action = `editor::${name}`, previous = commands.get(action);
    commands.set(action, () => { calls.push(name); });
    t.after(() => { if (previous) commands.set(action, previous); else commands.delete(action); });
  }
  const editor = new Element(), panel = new Element(), row = new Element(), input = new Input(), replacement = new Input();
  editor.dataset.keymapContext = "Editor";
  panel.dataset.keymapContext = "EditorSearch";
  row.dataset.keymapContext = "ReplaceInput";
  panel.parentElement = editor; row.parentElement = panel; input.parentElement = panel; replacement.parentElement = row;
  const press = (target: Element, key: string, options: Partial<KeyboardEvent> = {}) => {
    const event = { target, key, code: "", ctrlKey: false, altKey: false, shiftKey: false, metaKey: false,
      isComposing: false, keyCode: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...options };
    onKeyDown(event as unknown as KeyboardEvent);
    return event.defaultPrevented;
  };
  press(input, "Enter"); press(input, "Enter", { shiftKey: true });
  for (const key of ["c", "w", "r"]) press(input, key, { altKey: true });
  press(input, "F3"); press(input, "F3", { shiftKey: true });
  press(input, "Enter", { altKey: true });
  press(replacement, "Enter"); press(replacement, "Enter", { ctrlKey: true, altKey: true });
  press(input, "Escape"); press(input, "f", { ctrlKey: true }); press(input, "h", { ctrlKey: true });
  assert.deepEqual(calls, ["FindNext", "FindPrevious", "SearchCaseSensitive", "SearchWholeWord", "SearchRegexp", "FindNext", "FindPrevious",
    "SelectSearchMatches", "ReplaceNext", "ReplaceAll", "Cancel", "Find", "Replace"]);
  calls.length = 0;
  for (const key of ["a", "c", "x", "v", "z", "y"]) assert.equal(press(input, key, { ctrlKey: true }), false);
  assert.equal(press(input, "Enter", { isComposing: true }), false);
  assert.deepEqual(calls, []);
  press(editor, "d", { ctrlKey: true }); press(editor, "l", { ctrlKey: true, shiftKey: true });
  press(editor, "k", { ctrlKey: true }); press(editor, "d", { ctrlKey: true });
  assert.deepEqual(calls, ["AddNextOccurrence", "SelectSelectionMatches", "SkipOccurrence"]);
});

test("I-9: Ctrl-Shift-V dispatches from the Pane and Markdown editor; unmatched browser paste stays blocked", (t) => {
  const calls: string[] = [];
  const previous = commands.get("markdown::OpenPreview");
  commands.set("markdown::OpenPreview", () => { calls.push("preview"); });
  t.after(() => { if (previous) commands.set("markdown::OpenPreview", previous); else commands.delete("markdown::OpenPreview"); });
  class Element { dataset: Record<string, string> = {}; parentElement: Element | null = null; closest() { return null; } }
  class Input {}
  for (const [name, value] of Object.entries({ Element, HTMLInputElement: Input })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => { if (previous) Object.defineProperty(globalThis, name, previous); else Reflect.deleteProperty(globalThis, name); });
  }
  const press = (target: object) => {
    const event = { target, key: "V", code: "KeyV", ctrlKey: true, shiftKey: true, altKey: false, metaKey: false, isComposing: false, keyCode: 0,
      defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    onKeyDown(event as unknown as KeyboardEvent);
    return event.defaultPrevented;
  };
  const pane = new Element();
  pane.dataset.keymapContext = "Pane";
  assert.ok(press(pane));
  assert.deepEqual(calls, ["preview"]);
  const editor = new Element();
  editor.dataset.keymapContext = "Editor extension=md";
  editor.parentElement = pane;
  assert.ok(press(editor));
  assert.deepEqual(calls, ["preview", "preview"]);
  const outside = new Element();
  calls.length = 0;
  assert.ok(press(outside));
  assert.deepEqual(calls, []);
});

test("I-9: Pane chords dispatch and an open menu retains the clicked preview context", (t) => {
  class Element {
    dataset: Record<string, string> = {};
    parentElement: Element | null = null;
    closest() { return null; }
  }
  class Input {}
  for (const [name, value] of Object.entries({ Element, HTMLInputElement: Input })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => { if (previous) Object.defineProperty(globalThis, name, previous); else Reflect.deleteProperty(globalThis, name); });
  }
  const calls: string[] = [];
  for (const action of ["pane::CloseItemsToTheLeft", "workspace::CopyPath", "pane::RevealInProjectPanel", "markdown::CloseAndReturnToEditor"]) {
    const previous = commands.get(action);
    commands.set(action, () => { calls.push(action); });
    t.after(() => { if (previous) commands.set(action, previous); else commands.delete(action); });
  }
  const pane = new Element();
  pane.dataset.keymapContext = "Pane";
  const press = (target: Element, key: string, ctrlKey = false, shiftKey = false) => {
    const event = { target, key, code: "", ctrlKey, shiftKey, altKey: false, metaKey: false, isComposing: false, keyCode: 0, preventDefault() {} };
    onKeyDown(event as unknown as KeyboardEvent);
  };
  press(pane, "k", true); press(pane, "e");
  press(pane, "k", true); press(pane, "p");
  press(pane, "E", true, true);
  assert.deepEqual(calls, ["pane::CloseItemsToTheLeft", "workspace::CopyPath", "pane::RevealInProjectPanel"]);
  const menu = new Element();
  menu.dataset.keymapContext = "menu";
  const previousContext = hooks.context, previousCommand = hooks.beforeCommand;
  t.after(() => { hooks.context = previousContext; hooks.beforeCommand = previousCommand; });
  hooks.context = () => [new Set(["Workspace"]), new Set(["Pane"]), new Set(["MarkdownPreview"]), new Set(["menu"])];
  const intercepted: string[] = [];
  hooks.beforeCommand = (action) => { intercepted.push(action); return true; };
  press(menu, "V", true, true);
  press(menu, "k", true); press(menu, "e");
  assert.deepEqual(intercepted, ["markdown::CloseAndReturnToEditor", "pane::CloseItemsToTheLeft"]);
  assert.equal(calls.length, 3, "menu callbacks take precedence over active-tab commands");
});

test("K-07-R1: installed listeners keep chords across modifier keyup/keydown and dispatch both second strokes", (t) => {
  class Element {
    dataset: Record<string, string> = {};
    parentElement: Element | null = null;
    closest() { return null; }
  }
  class Input extends Element {}
  const win = new EventTarget();
  for (const [name, value] of Object.entries({ Element, HTMLInputElement: Input, window: win })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => { if (previous) Object.defineProperty(globalThis, name, previous); else Reflect.deleteProperty(globalThis, name); });
  }
  const previousContext = hooks.context, previousCommand = hooks.beforeCommand;
  hooks.context = null;
  hooks.beforeCommand = null;
  t.after(() => { hooks.context = previousContext; hooks.beforeCommand = previousCommand; });
  const calls: string[] = [];
  for (const action of ["pane::CloseItemsToTheRight", "theme_selector::Toggle"]) {
    const previous = commands.get(action);
    commands.set(action, () => { calls.push(action); });
    t.after(() => { if (previous) commands.set(action, previous); else commands.delete(action); });
  }
  const pane = new Element(), editor = new Element();
  pane.dataset.keymapContext = "Pane";
  editor.dataset.keymapContext = "Editor extension=md";
  editor.parentElement = pane;
  installKeyboard();
  const observed: string[] = [];
  win.addEventListener("keydown", (event) => observed.push((event as KeyboardEvent).key), true);
  const send = (type: "keydown" | "keyup", key: string, code: string, ctrlKey: boolean, time: number) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { key, code, ctrlKey, shiftKey: false, altKey: false, metaKey: false });
    Object.defineProperty(event, "target", { value: editor });
    Object.defineProperty(event, "timeStamp", { value: time });
    win.dispatchEvent(event);
    return event.defaultPrevented;
  };
  const prefix = () => {
    assert.equal(send("keydown", "Control", "ControlLeft", true, 0), false);
    assert.equal(send("keydown", "k", "KeyK", true, 1), true);
    assert.equal(send("keyup", "k", "KeyK", true, 2), false);
    assert.equal(send("keyup", "Control", "ControlLeft", false, 3), false);
  };
  prefix();
  assert.deepEqual(calls, []);
  assert.equal(send("keydown", "t", "KeyT", false, 403), true);
  send("keyup", "t", "KeyT", false, 404);
  assert.deepEqual(calls, ["pane::CloseItemsToTheRight"]);
  prefix();
  assert.equal(send("keydown", "Control", "ControlLeft", true, 403), false);
  assert.equal(send("keydown", "t", "KeyT", true, 404), true);
  send("keyup", "t", "KeyT", true, 405);
  send("keyup", "Control", "ControlLeft", false, 406);
  assert.deepEqual(calls, ["pane::CloseItemsToTheRight", "theme_selector::Toggle"]);
  assert.deepEqual(observed, ["Control", "k", "t", "Control", "k", "Control", "t"]);
  assert.equal(send("keydown", "x", "KeyX", false, 407), false, "a completed chord leaves no pending stroke");
});
