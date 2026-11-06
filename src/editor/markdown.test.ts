import test from "node:test";
import assert from "node:assert/strict";
import { blockAt, classifyLink, frontmatterOf, frontmatterRows, renderMarkdown } from "./markdown.ts";

test("L-110: frontmatter is a table only when every line is `key: value` without a leading space", () => {
  assert.deepEqual(frontmatterRows(["title: Hello", "tags: a, b"]), [["title", "Hello"], ["tags", "a, b"]]);
  assert.deepEqual(frontmatterRows(["url: http://x/y"]), [["url", "http://x/y"]]); // split at the first ": "
  assert.equal(frontmatterRows(["title: Hello", ""]), null); // an empty line
  assert.equal(frontmatterRows(["tags:", "  - a"]), null); // nested YAML
  assert.equal(frontmatterRows([" title: x"]), null); // leading space
  assert.equal(frontmatterRows(["title:"]), null); // empty value
  assert.equal(frontmatterRows([]), null);
  assert.deepEqual(frontmatterOf("---\na: b\n---\n# T"), { lines: ["a: b"], end: 3 });
  assert.equal(frontmatterOf("# T\n---\n"), null);
});

test("D-10: blocks carry their source lines, past the frontmatter too; table alignment is a class", () => {
  const html = renderMarkdown("---\na: b\n---\n# Title\n\npara\n\n| x | y |\n|:-:|--:|\n| 1 | 2 |\n");
  assert.match(html, /^<div class="frontmatter" data-line="0" data-line-end="3"><div class="fm-key">a<\/div><div class="fm-value">b<\/div><\/div>/);
  assert.match(html, /<h1 data-line="3" data-line-end="4">Title<\/h1>/);
  assert.match(html, /<p data-line="5" data-line-end="6">para<\/p>/);
  assert.match(html, /<tr data-line="9" data-line-end="10">/); // rows carry lines (cells do not have their own)
  assert.match(html, /<th class="align-center">x<\/th>/);
  assert.match(html, /<td class="align-right">2<\/td>/);
  assert.doesNotMatch(html, /style=/);
  assert.match(renderMarkdown("---\ntags:\n  - a\n---\n"), /<pre class="frontmatter-raw" data-line="0" data-line-end="4"><code>tags:\n {2}- a<\/code><\/pre>/);
});

test("D-10: raw HTML in the source is text, not markup (html: false)", () => {
  const html = renderMarkdown('<script>alert(1)</script>\n\n<img src=x onerror="alert(1)">\n\n<p style="color:red">x</p>\n');
  assert.doesNotMatch(html, /<script|<img|<p style/);
  assert.match(html, /&lt;script&gt;/);
});

test("I-083 / I-084: the innermost block holding a line", () => {
  const blocks = [{ start: 0, end: 10 }, { start: 2, end: 4 }, { start: 5, end: 6 }];
  assert.equal(blockAt(blocks, 3), 1);
  assert.equal(blockAt(blocks, 4), 0);
  assert.equal(blockAt(blocks, 12), -1);
});

test("I-085: external URLs, local Markdown into a preview (relative to the source), Alt skips it, other files open", () => {
  const src = "C:\\w\\docs\\a.md";
  assert.deepEqual(classifyLink("https://zed.dev", src, false), { kind: "external", url: "https://zed.dev" });
  assert.deepEqual(classifyLink("b.md", src, false), { kind: "preview", path: "C:\\w\\docs\\b.md" });
  assert.deepEqual(classifyLink("../README.md#top", src, false), { kind: "preview", path: "C:\\w\\README.md" });
  assert.deepEqual(classifyLink("./my%20notes.md", src, false), { kind: "preview", path: "C:\\w\\docs\\my notes.md" });
  assert.deepEqual(classifyLink("b.md", src, true), { kind: "open", path: "C:\\w\\docs\\b.md" });
  assert.deepEqual(classifyLink("img/x.png", src, false), { kind: "open", path: "C:\\w\\docs\\img\\x.png" });
  assert.deepEqual(classifyLink("#intro", src, false), { kind: "anchor", id: "intro" });
});
