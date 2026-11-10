import test from "node:test";
import assert from "node:assert/strict";
import { EditorSelection, EditorState } from "@codemirror/state";
import { deleteCharBackward, history, insertNewlineAndIndent, redo, undo } from "@codemirror/commands";
import { editableExtension } from "../editor/extensions.ts";
import { FONT_LICENSES, licenseSources, licenseText } from "./licenses.ts";

test("I-30: the Licenses tab is made with editable=false: typing, deleting and undo leave the text alone", () => {
  // createFileView(text, "Licenses", false, …) puts exactly this extension on the view (needs a DOM, so the state is checked here).
  let state = EditorState.create({ doc: "MIT License", selection: EditorSelection.cursor(3), extensions: [editableExtension(false), history()] });
  assert.equal(state.readOnly, true);
  let doc = state.doc.toString();
  for (const command of [insertNewlineAndIndent, deleteCharBackward, undo, redo]) {
    command({ state, dispatch: (tr) => { state = tr.state; } });
    assert.equal(state.doc.toString(), doc);
  }
  const unlocked = EditorState.create({ doc, selection: EditorSelection.cursor(3), extensions: [editableExtension(true), history()] });
  let after = unlocked;
  insertNewlineAndIndent({ state: unlocked, dispatch: (tr) => { after = tr.state; } });
  assert.notEqual(after.doc.toString(), doc); // the same commands do edit a file tab
});

test("I-30: the tab text is the Licenses text: bundled copies first, the zed-icons notices that are missing, then the fonts", async () => {
  const sources = licenseSources({ "../licenses/a.txt": "Copy A", "../assets/zed-icons/LICENSES": "Zed list" });
  assert.deepEqual(Object.keys(sources), ["../licenses/a.txt", "../assets/zed-icons/LICENSES", "../assets/zed-icons/LICENSE-GPL", "../assets/zed-icons/LICENSE-APACHE", ...FONT_LICENSES]);
  const text = await licenseText(sources); // fonts are fetched from the app; here they are unavailable, as a missing copy is
  assert.equal(text, [
    "../licenses/a.txt\n\nCopy A", "../assets/zed-icons/LICENSES\n\nZed list",
    "../assets/zed-icons/LICENSE-GPL\n\nLicense copy unavailable.", "../assets/zed-icons/LICENSE-APACHE\n\nLicense copy unavailable.",
    ...FONT_LICENSES.map((path) => `${path}\n\nLicense copy unavailable.`),
  ].join("\n\n"));
});
