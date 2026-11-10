import test from "node:test";
import assert from "node:assert/strict";
import { scalable, themedSvg } from "./icon-svg.ts";

test("Zed SVG colors follow the theme, keep transparent areas, and tolerate missing copies", () => {
  assert.equal(
    themedSvg('<svg fill="none"><path fill="black" stroke="#DCE0E5" stroke-width="1.2"/><path fill="currentColor"/></svg>'),
    '<svg fill="none"><path fill="currentColor" stroke="currentColor" stroke-width="1.2"/><path fill="currentColor"/></svg>',
  );
  assert.equal(themedSvg(undefined), "");
});

test("I-32: a 16x16 copy without viewBox gets one, so it scales into a smaller icon box; others stay as they are", () => {
  assert.equal(scalable('<svg xmlns="x" width="16" height="16" fill="none"><path/></svg>'), '<svg viewBox="0 0 16 16" xmlns="x" width="16" height="16" fill="none"><path/></svg>');
  const done = '<svg width="16" height="16" viewBox="0 0 16 16"><path/></svg>';
  assert.equal(scalable(done), done);
  assert.equal(scalable(undefined), undefined);
});
