import test from "node:test";
import assert from "node:assert/strict";
import { navigates, resourceUrl, rewriteCss, rewriteSrcset } from "./html.ts";
import { renderMarkdown } from "./markdown.ts";
import { hasPreview, previewKind } from "./preview-kind.ts";

const SOURCE = "C:\\site\\pages\\index.html";
const convert = (path: string) => `asset:${path}`;

test("html and htm files have a preview", () => {
  assert.equal(previewKind("a\\b.HTML"), "html");
  assert.equal(previewKind("a\\b.htm"), "html");
  assert.ok(hasPreview("x.html"));
  assert.equal(previewKind("x.xhtml"), null);
});

test("local resources resolve against the HTML file, anywhere on disk", () => {
  assert.equal(resourceUrl("img/a.png", SOURCE, convert), "asset:C:\\site\\pages\\img\\a.png");
  assert.equal(resourceUrl("../style.css?v=1", SOURCE, convert), "asset:C:\\site\\style.css");
  assert.equal(resourceUrl("D:\\other\\a.png", SOURCE, convert), "asset:D:\\other\\a.png");
  assert.equal(resourceUrl("#top", SOURCE, convert), "#top");
});

// K-03c: `#id` links used to stay and loaded the app page into the frame (srcdoc resolves `#id` against the parent URL).
test("links and form targets are dropped whole, `#id` included; `<use href=\"#id\">` stays", () => {
  for (const [tag, attr] of [["a", "href"], ["area", "href"], ["a", "xlink:href"], ["form", "action"], ["button", "formaction"]]) assert.equal(navigates(tag, attr), true, `${tag} ${attr}`);
  for (const [tag, attr] of [["use", "href"], ["img", "src"], ["link", "href"], ["use", "xlink:href"]]) assert.equal(navigates(tag, attr), false, `${tag} ${attr}`);
  assert.equal(resourceUrl("#id", SOURCE, convert), "#id");
});

test("internet, scripted and empty resources are dropped", () => {
  for (const value of ["http://x.test/a.png", "https://x.test/a.css", "//x.test/a.png", "javascript:alert(1)", "java\tscript:alert(1)", "data:image/png;base64,AA", "", "  "])
    assert.equal(resourceUrl(value, SOURCE, convert), null, value);
});

test("css: url() is pointed at asset URLs, @import and internet urls go", () => {
  const css = '@import "x.css"; @import url(https://x.test/f.css);\na { background: url(img/a.png) } b { background: url( "https://x.test/b.png" ) } c { fill: url(#g) }';
  const out = rewriteCss(css, SOURCE, convert);
  assert.ok(!out.includes("@import"));
  assert.ok(out.includes('url("asset:C:\\site\\pages\\img\\a.png")'));
  assert.ok(out.includes('b { background: url("") }'));
  assert.ok(out.includes('url("#g")'));
  assert.ok(!out.includes("x.test"));
});

test("srcset keeps local candidates with their descriptors", () => {
  assert.equal(rewriteSrcset("a.png 1x, https://x.test/b.png 2x, c.png 3x", SOURCE, convert), "asset:C:\\site\\pages\\a.png 1x, asset:C:\\site\\pages\\c.png 3x");
  assert.equal(rewriteSrcset("https://x.test/b.png 2x", SOURCE, convert), "");
});

// The Markdown preview keeps its rule (no style attribute): raw HTML is escaped, table alignment is a class.
test("markdown output has no style attribute", () => {
  const out = renderMarkdown('<p style="color:red">x</p>\n\n| a |\n|:-:|\n| b |\n');
  assert.ok(!/<[^>]+\sstyle=/.test(out));
  assert.ok(out.includes("align-center"));
});
