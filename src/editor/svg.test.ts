import test from "node:test";
import assert from "node:assert/strict";
import { loadsExternal, SVG_FORBID_ATTR, SVG_FORBID_TAGS } from "./svg.ts";
import { hasPreview, previewKind } from "./preview-kind.ts";

test("svg files have a preview", () => {
  assert.equal(previewKind("a/b.SVG"), "svg");
  assert.ok(hasPreview("x.svg"));
});

// svgElement itself needs a DOM (DOMPurify does nothing under node), so the policy it applies is tested here.
test("svg sanitizing forbids script, style, foreignObject and style attributes", () => {
  for (const tag of ["script", "style", "foreignObject"]) assert.ok(SVG_FORBID_TAGS.includes(tag));
  assert.ok(SVG_FORBID_ATTR.includes("style"));
});

test("only same-document references are kept", () => {
  assert.equal(loadsExternal("href", "https://example.com/a.png"), true);
  assert.equal(loadsExternal("xlink:href", "//example.com/a.png"), true);
  assert.equal(loadsExternal("href", "#shape"), false);
  assert.equal(loadsExternal("fill", "url(http://example.com/p)"), true);
  assert.equal(loadsExternal("filter", "url( 'https://example.com/f.svg#a' )"), true);
  assert.equal(loadsExternal("fill", "url(#grad)"), false);
  assert.equal(loadsExternal("fill", "red"), false);
});
