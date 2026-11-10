import test from "node:test";
import assert from "node:assert/strict";
import { hasPreview, previewKind, viewKind } from "./preview-kind.ts";

// openFile asks viewKind first, so these files never reach the text read (decode) nor get an editor tab or the preview toggle.
test("I-8 / I-9: images and PDF are view-only: a view kind, no preview kind", () => {
  for (const [path, kind] of [["C:\\a.PNG", "image"], ["a.jpg", "image"], ["a.jpeg", "image"], ["a.gif", "image"], ["a.webp", "image"], ["a.ico", "image"], ["C:\\x y\\한글.pdf", "pdf"]]) {
    assert.equal(viewKind(path), kind);
    assert.equal(previewKind(path), null);
    assert.equal(hasPreview(path), false);
  }
  for (const path of ["a.svg", "a.md", "a.txt", "a.png.txt", "png", "C:\\a.png\\b"]) assert.equal(viewKind(path), null);
});
