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
