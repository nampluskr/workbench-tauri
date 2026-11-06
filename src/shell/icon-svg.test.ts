import test from "node:test";
import assert from "node:assert/strict";
import { themedSvg } from "./icon-svg.ts";

test("Zed SVG colors follow the theme, keep transparent areas, and tolerate missing copies", () => {
  assert.equal(
    themedSvg('<svg fill="none"><path fill="black" stroke="#DCE0E5" stroke-width="1.2"/><path fill="currentColor"/></svg>'),
    '<svg fill="none"><path fill="currentColor" stroke="currentColor" stroke-width="1.2"/><path fill="currentColor"/></svg>',
  );
  assert.equal(themedSvg(undefined), "");
});
