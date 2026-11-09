import test from "node:test";
import assert from "node:assert/strict";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

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
