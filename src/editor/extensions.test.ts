import test from "node:test";
import assert from "node:assert/strict";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { selectAll, selectLine, toggleBlockComment, toggleComment } from "@codemirror/commands";
import { languageConfigs } from "../syntax/catalog.ts";

test("R-17: menu paste uses CM6 events, skips changed/locked views and surfaces clipboard denial", async (t) => {
  let native = false, reads = 0, events = 0;
  let read = async () => "pasted";
  class DataTransfer { text = ""; setData(type: string, text: string) { assert.equal(type, "text/plain"); this.text = text; } }
  class ClipboardEvent {
    type: string;
    options: { clipboardData: DataTransfer; bubbles: boolean; cancelable: boolean };
    constructor(type: string, options: ClipboardEvent["options"]) { this.type = type; this.options = options; }
  }
  for (const [name, value] of Object.entries({ document: { execCommand: () => native },
    navigator: { clipboard: { readText: () => { reads++; return read(); } } }, DataTransfer, ClipboardEvent })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => { if (previous) Object.defineProperty(globalThis, name, previous); else Reflect.deleteProperty(globalThis, name); });
  }
  const { pasteClipboard } = await import("./extensions.ts");
  const view = { state: EditorState.create(), focus() {}, contentDOM: { dispatchEvent(event: ClipboardEvent) {
    assert.equal(event.type, "paste");
    assert.deepEqual(event.options, { clipboardData: Object.assign(new DataTransfer(), { text: "pasted" }), bubbles: true, cancelable: true });
    events++; return false;
  } } };
  const paste = () => pasteClipboard(view as unknown as EditorView);
  await paste();
  assert.equal(events, 1);
  native = true;
  await paste();
  assert.equal(reads, 1);
  native = false;
  read = async () => { view.state = EditorState.create(); return "pasted"; };
  await paste();
  assert.equal(events, 1, "stale clipboard reads cannot replace a newer selection/document");
  view.state = EditorState.create({ extensions: EditorState.readOnly.of(true) });
  await paste();
  assert.equal(reads, 2);
  view.state = EditorState.create();
  read = async () => { throw new Error("denied"); };
  await assert.rejects(paste(), /denied/);
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
