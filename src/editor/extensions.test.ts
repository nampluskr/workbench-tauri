import test from "node:test";
import assert from "node:assert/strict";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { selectAll, selectLine, toggleBlockComment, toggleComment } from "@codemirror/commands";
import { languageConfigs } from "../syntax/catalog.ts";

test("I-13: menu paste reads through the reader, fills a focused text field, else sends CM6 a paste event; stale or locked views are skipped", async (t) => {
  let active: unknown = null, events = 0;
  class DataTransfer { text = ""; setData(type: string, text: string) { assert.equal(type, "text/plain"); this.text = text; } }
  class ClipboardEvent {
    type: string;
    options: { clipboardData: DataTransfer; bubbles: boolean; cancelable: boolean };
    constructor(type: string, options: ClipboardEvent["options"]) { this.type = type; this.options = options; }
  }
  class Event { type: string; constructor(type: string) { this.type = type; } }
  for (const [name, value] of Object.entries({ document: { get activeElement() { return active; } }, DataTransfer, ClipboardEvent, Event })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => { if (previous) Object.defineProperty(globalThis, name, previous); else Reflect.deleteProperty(globalThis, name); });
  }
  const { pasteClipboard } = await import("./extensions.ts");
  const view = { state: EditorState.create(), focus() {}, contentDOM: { dispatchEvent(event: ClipboardEvent) {
    assert.equal(event.type, "paste");
    assert.deepEqual(event.options, { clipboardData: Object.assign(new DataTransfer(), { text: "한글\n둘째" }), bubbles: true, cancelable: true });
    events++; return false;
  } } };
  const paste = (read = async () => "한글\n둘째") => pasteClipboard(view as unknown as EditorView, read);
  await paste();
  assert.equal(events, 1);
  await paste(async () => { view.state = EditorState.create(); return "한글\n둘째"; });
  assert.equal(events, 1, "stale clipboard reads cannot replace a newer selection/document");
  view.state = EditorState.create({ extensions: EditorState.readOnly.of(true) });
  await paste();
  assert.equal(events, 1, "a locked editor takes no paste");
  // A focused text field takes the text in place of its selection and hears an input event; line breaks become spaces.
  const input = { value: "abcd", readOnly: false, selectionStart: 1, selectionEnd: 3, heard: [] as string[],
    setRangeText(text: string, start: number, end: number) { this.value = this.value.slice(0, start) + text + this.value.slice(end); },
    dispatchEvent(event: Event) { this.heard.push(event.type); return true; } };
  active = input;
  await paste();
  assert.equal(input.value, "a한글 둘째d");
  assert.deepEqual(input.heard, ["input"]);
  assert.equal(events, 1, "the editor is not pasted into while a field has focus");
  input.readOnly = true;
  view.state = EditorState.create();
  await paste();
  assert.equal(events, 2, "a read-only field falls back to the editor");
  await assert.rejects(paste(async () => { throw new Error("denied"); }), /denied/);
});

test("R-17: pinned comment tokens drive CM6 commands, selection and read-only protection", () => {
  const configs = languageConfigs({
    "languages/ts/config.toml": 'name = "TypeScript"\ngrammar = "typescript"\nline_comments = ["// "]\nblock_comment = { start = "/*", prefix = "* ", end = "*/" }',
    "languages/python/config.toml": 'name = "Python"\ngrammar = "python"\nline_comments = ["# "]\nblock_comment = { start = "\\"\\"\\"", end = "\\"\\"\\"" }',
    "languages/plain/config.toml": 'name = "Plain"\ngrammar = "plain"',
  });
  assert.deepEqual(configs.map((c) => c.commentTokens), [
    { line: "//", block: { open: "/*", close: "*/" } },
    { line: "#", block: { open: '"""', close: '"""' } }, {},
  ]);
  let state = EditorState.create({ doc: "one\ntwo", extensions: [EditorState.languageData.of(() => [{ commentTokens: configs[0].commentTokens }])] });
  const target = { get state() { return state; }, dispatch(tr: Parameters<EditorState["update"]>[0]) { state = state.update(tr).state; } };
  assert.equal(toggleComment(target), true);
  assert.equal(state.doc.toString(), "// one\ntwo");
  toggleComment(target);
  selectLine(target);
  assert.equal(state.sliceDoc(state.selection.main.from, state.selection.main.to), "one\n");
  selectAll(target);
  toggleBlockComment(target);
  assert.equal(state.doc.toString(), "/* one\ntwo */");
  toggleBlockComment(target);
  assert.equal(state.doc.toString(), "one\ntwo");
  state = EditorState.create({ doc: "locked", extensions: EditorState.readOnly.of(true) });
  assert.equal(toggleComment(target), false);
  assert.equal(toggleBlockComment(target), false);
  assert.equal(state.doc.toString(), "locked");
});

test("I-8: only Markdown enables CodeMirror line wrapping", async (t) => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { getElementById: () => null },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "document", previous);
    else Reflect.deleteProperty(globalThis, "document");
  });
  const { editorExtensions } = await import("./extensions.ts");
  for (const extension of ["md", "markdown", "txt", "html", "toml", "mdx", ""]) {
    const state = EditorState.create({ extensions: editorExtensions(extension) });
    const wrapping = state.facet(EditorView.contentAttributes).some(
      (attributes) => typeof attributes !== "function" && attributes.class?.includes("cm-lineWrapping"),
    );
    assert.equal(wrapping, extension === "md" || extension === "markdown", extension);
  }
});

test("I-9: read-only is per view, remains focusable, and does not block an editable peer's undo", async () => {
  const { editableExtension, setEditable, runHistory } = await import("./extensions.ts");
  const make = (editable: boolean) => {
    const view = {
      state: EditorState.create({ extensions: editableExtension(editable) }),
      dispatch(spec: Parameters<EditorState["update"]>[0]) { view.state = view.state.update(spec).state; },
    };
    return view as unknown as EditorView;
  };
  const keeper = make(false), peer = make(true);
  assert.equal(keeper.state.readOnly, true);
  assert.equal(keeper.state.facet(EditorView.editable), false);
  assert.ok(keeper.state.facet(EditorView.contentAttributes).some((a) => typeof a !== "function" && a.tabindex === "0"));
  let calls = 0;
  runHistory(keeper, keeper, () => { calls++; return true; });
  assert.equal(calls, 0);
  runHistory(peer, keeper, (target) => { assert.equal(target.state.readOnly, false); calls++; return true; });
  assert.equal(calls, 1);
  assert.equal(keeper.state.readOnly, true);
  assert.equal(peer.state.readOnly, false);
  assert.throws(() => runHistory(peer, keeper, () => { throw new Error("failed"); }), /failed/);
  assert.equal(keeper.state.readOnly, true);
  setEditable(keeper, true);
  assert.equal(keeper.state.readOnly, false);
  assert.equal(keeper.state.facet(EditorView.editable), true);
  assert.equal(peer.state.readOnly, false);
});

test("U-14: arrow keys move and extend every cursor, and keep all of them", async () => {
  const { multiCursorKeys } = await import("./extensions.ts");
  const { EditorSelection } = await import("@codemirror/state");
  const { Direction } = await import("@codemirror/view");
  let state = EditorState.create({ doc: "abcdef\nabcdef\nabcdef", selection: EditorSelection.create([0, 7, 14].map((p) => EditorSelection.cursor(p)), 0),
    extensions: EditorState.allowMultipleSelections.of(true) });
  // Only the DOM-measuring part of the view is stubbed: one character along the line.
  const view = { get state() { return state; }, dispatch: (tr: any) => { state = state.update(tr).state; }, textDirectionAt: () => Direction.LTR,
    moveByChar: (range: any, forward: boolean) => EditorSelection.cursor(range.head + (forward ? 1 : -1)) } as unknown as EditorView;
  const key = (name: string, shift = false) => { const b = multiCursorKeys.find((k) => k.key === name)!; return (shift ? b.shift : b.run)(view); };
  const spans = () => state.selection.ranges.map((r) => `${r.anchor}-${r.head}`);
  for (let i = 0; i < 3; i++) key("ArrowRight", true);
  assert.deepEqual(spans(), ["0-3", "7-10", "14-17"]);
  key("ArrowLeft", true);
  assert.deepEqual(spans(), ["0-2", "7-9", "14-16"]);
  key("ArrowRight");
  assert.deepEqual(spans(), ["2-2", "9-9", "16-16"]);
});

test("U-17 R2: a font-size change reconfigures the editor, the way CM learns it must measure the lines again", async (t) => {
  const { editorExtensions, remeasureForFont } = await import("./extensions.ts");
  const previous = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", { configurable: true, value: { getElementById: () => null } });
  t.after(() => { if (previous) Object.defineProperty(globalThis, "document", previous); else Reflect.deleteProperty(globalThis, "document"); });
  let state = EditorState.create({ doc: "a", extensions: editorExtensions("ts") });
  const reconfigured: boolean[] = [];
  const view = { dispatch: (spec: any) => { const tr = state.update(spec); reconfigured.push(tr.reconfigured); state = tr.state; } } as unknown as EditorView;
  remeasureForFont(view);
  remeasureForFont(view);
  assert.deepEqual(reconfigured, [true, true], "every call must change the theme facet, not only the first");
});

test("U-19: Up / Down / Page / Ctrl+Home keys move and extend every cursor and keep the wanted column", async () => {
  const { multiCursorKeys } = await import("./extensions.ts");
  const { EditorSelection } = await import("@codemirror/state");
  // "abcdef" lines with a short one in the middle; cursors in column 4 of lines 1, 3 and 5.
  const doc = "abcdef\nab\nabcdef\nab\nabcdef\nabcdef";
  const at = (line: number, col: number) => doc.split("\n").slice(0, line - 1).join("\n").length + (line > 1 ? 1 : 0) + col;
  let state = EditorState.create({ doc, selection: EditorSelection.create([1, 3, 5].map((l) => EditorSelection.cursor(at(l, 4))), 0),
    extensions: EditorState.allowMultipleSelections.of(true) });
  // Only the DOM-measuring parts of the view are stubbed: moving a number of lines (a page is 2 lines), keeping the goal column.
  const view = { get state() { return state; }, dispatch: (tr: any) => { state = state.update(tr).state; }, defaultLineHeight: 10,
    scrollDOM: { clientHeight: 5, scrollHeight: 5 }, dom: { ownerDocument: { defaultView: { innerHeight: 25 } } },
    moveToLineBoundary: (range: any, forward: boolean) => { const l = state.doc.lineAt(range.head); return EditorSelection.cursor(forward ? l.to : l.from); },
    moveVertically: (range: any, forward: boolean, distance?: number) => {
      const l = state.doc.lineAt(range.head), col = range.goalColumn ?? range.head - l.from;
      const to = Math.max(1, Math.min(state.doc.lines, l.number + (forward ? 1 : -1) * (distance ? Math.round(distance / 10) : 1)));
      if (to === l.number) return range;
      const t = state.doc.line(to);
      return EditorSelection.cursor(t.from + Math.min(col, t.length), -1, undefined, col);
    } } as unknown as EditorView;
  const key = (name: string, shift = false) => { const b = multiCursorKeys.find((k) => k.key === name)!; return (shift ? b.shift : b.run)(view); };
  const spans = () => state.selection.ranges.map((r) => `${r.anchor}-${r.head}`);
  key("ArrowDown");
  assert.deepEqual(spans(), [`${at(2, 2)}-${at(2, 2)}`, `${at(4, 2)}-${at(4, 2)}`, `${at(6, 4)}-${at(6, 4)}`]); // the short lines clamp to column 2, the long last line keeps 4
  assert.equal(state.selection.ranges.length, 3);
  key("ArrowUp");
  assert.deepEqual(spans(), [1, 3, 5].map((l) => `${at(l, 4)}-${at(l, 4)}`)); // the wanted column 4 returns
  key("ArrowDown", true);
  assert.deepEqual(spans(), [`${at(1, 4)}-${at(2, 2)}`, `${at(3, 4)}-${at(4, 2)}`, `${at(5, 4)}-${at(6, 4)}`]);
  key("ArrowUp", true);
  assert.deepEqual(spans(), [1, 3, 5].map((l) => `${at(l, 4)}-${at(l, 4)}`));
  key("PageDown");
  assert.deepEqual(spans(), [3, 5, 6].map((l) => `${at(l, 4)}-${at(l, 4)}`)); // two lines each; the last one clamps to the last line
  key("PageDown", true);
  key("Mod-Home", true);
  assert.equal(state.selection.ranges.length, 1);
  assert.equal(state.selection.main.from, 0);
  key("Mod-End");
  assert.deepEqual(spans(), [`${doc.length}-${doc.length}`]);
});
