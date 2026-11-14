import test from "node:test";
import assert from "node:assert/strict";
import { splitLineAreas, splitLineColor } from "./split-line.ts";

test("core v0.8.3 I-13: only the body of a left-right line between document Panes of one border colour takes that colour", () => {
  const border = { ui: "#474b57", edit: "#464b57", view: "#c9c9ca" };
  assert.equal(splitLineColor("body", "h", "view", "view", border), "#c9c9ca"); // two document Panes, the same theme
  assert.equal(splitLineColor("body", "h", "edit", "view", border), "#474b57"); // two document Panes, different themes
  assert.equal(splitLineColor("body", "h", "edit", "view", { ...border, edit: "#c9c9ca" }), "#c9c9ca"); // ... the same colour again: a theme change follows
  assert.equal(splitLineColor("body", "v", "view", "view", border), "#474b57"); // a top-bottom split
  assert.equal(splitLineColor("body", "h", null, "view", border), "#474b57"); // the Sidebar's edge: no Pane on one side
  assert.equal(splitLineColor("body", "h", "edit", null, border), "#474b57"); // a Pane showing a UI screen (Welcome, Settings, Keymap editor, Extensions)
  assert.equal(splitLineColor("tabs", "h", "view", "view", border), "#474b57"); // the tab bar part
  assert.equal(splitLineAreas("view", "edit"), "edit-view");
  assert.equal(splitLineAreas("edit", null), undefined);
});
