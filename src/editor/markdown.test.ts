import test from "node:test";
import assert from "node:assert/strict";
import { blockAt, classifyLink, frontmatterOf, frontmatterRows, headingSlugs, localImagePath, MARKDOWN_HTML_ATTR, MARKDOWN_HTML_TAGS, renderMarkdown } from "./markdown.ts";
import { classifyHtmlLink } from "./html.ts";
import { NOTEBOOK_HTML_FORBID_ATTR, NOTEBOOK_HTML_FORBID_TAGS } from "./notebook.ts";

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
  assert.match(html, /<h1 data-line="3" data-line-end="4" data-heading="0">Title<\/h1>/); // core v0.8.2 I-24: headings are numbered
  assert.match(html, /<p data-line="5" data-line-end="6">para<\/p>/);
  assert.match(html, /<tr data-line="9" data-line-end="10">/); // rows carry lines (cells do not have their own)
  assert.match(html, /<th class="align-center">x<\/th>/);
  assert.match(html, /<td class="align-right">2<\/td>/);
  assert.doesNotMatch(html, /style=/);
  assert.match(renderMarkdown("---\ntags:\n  - a\n---\n"), /<pre class="frontmatter-raw" data-line="0" data-line-end="4"><code>tags:\n {2}- a<\/code><\/pre>/);
});

// The sanitizing itself is DOMPurify's and needs a DOM (it does nothing under node, as in svg.test.ts), so each input is judged by
// what the preview hands it: only a tag of MARKDOWN_HTML_TAGS and an attribute of MARKDOWN_HTML_ATTR stay, a link is followed
// only through classifyLink, and an <img> stays only with a local path (markdownTree).
test("core v0.8.2 I-24: HTML in the body is drawn as HTML, kept only by the allow lists", () => {
  const src = "C:\\w\\docs\\a.md";
  // The first markdown cell of the user's notebook, and a heading in a Markdown body: heading elements, not text.
  assert.equal(renderMarkdown("<h1>LLM LangChain</h1>"), '<h1 data-line="0" data-line-end="1" data-heading="0">LLM LangChain</h1>');
  assert.match(renderMarkdown("text\n\n<h2>RAWHTML heading</h2>\n"), /<h2 data-line="2" data-line-end="3" data-heading="0">RAWHTML heading<\/h2>/);
  const removed: [input: string, tags: string[], attrs: string[]][] = [
    ["<script>alert(1)</script>", ["script"], []],
    ["<style>body { display: none }</style>", ["style"], []],
    ['<iframe src="https://example.com"></iframe>', ["iframe"], []],
    ['<form action="https://example.com"><input name="q"><button>go</button></form>', ["form", "input", "button"], ["action", "name"]],
    ['<p onclick="alert(1)" style="position:fixed">x</p>', [], ["onclick", "style"]],
    ['<img src="x.png" onerror="alert(1)" srcset="https://example.com/a.png 2x">', [], ["onerror", "srcset"]],
    ['<svg><image href="https://example.com/a.png"/></svg>', ["svg", "image"], []],
    ['<video src="https://example.com/a.mp4" poster="https://example.com/a.png"></video>', ["video", "audio", "source", "object", "embed"], ["poster"]],
    ['<map><area href="https://example.com"></map>', ["map", "area", "link", "meta", "base", "math"], []],
  ];
  for (const [input, tags, attrs] of removed) {
    assert.ok(renderMarkdown(input).includes(input.slice(input.indexOf(">"))), `reaches the sanitizer as HTML: ${input}`);
    for (const tag of tags) assert.ok(!MARKDOWN_HTML_TAGS.includes(tag), tag);
    for (const attr of attrs) assert.ok(!MARKDOWN_HTML_ATTR.includes(attr), attr);
  }
  assert.ok(!MARKDOWN_HTML_ATTR.some((name) => name.startsWith("on") || name === "style" || name === "id")); // no event attribute at all
  // Not looser than the rules of a notebook output.
  for (const tag of NOTEBOOK_HTML_FORBID_TAGS) assert.ok(!MARKDOWN_HTML_TAGS.includes(tag), tag);
  for (const attr of NOTEBOOK_HTML_FORBID_ATTR) assert.ok(!MARKDOWN_HTML_ATTR.includes(attr), attr);
  // A javascript: link does nothing when clicked (DOMPurify also drops its href); an image of any URL scheme is removed.
  assert.equal(classifyLink("javascript:alert(1)", src, false), null);
  assert.equal(localImagePath("http://example.com/a.png", src), null);
  assert.equal(localImagePath("https://example.com/a.png", src), null);
  // Kept: headings, tables, <br>, a local <img> (the same path rule as a Markdown image).
  for (const tag of ["h1", "h2", "h3", "h4", "h5", "h6", "table", "thead", "tbody", "tr", "th", "td", "br", "img", "p", "div", "span", "a", "pre", "code", "ul", "ol", "li", "details", "summary"])
    assert.ok(MARKDOWN_HTML_TAGS.includes(tag), tag);
  for (const attr of ["src", "alt", "href", "width", "height", "align", "colspan", "class", "data-line", "data-line-end", "data-heading"]) assert.ok(MARKDOWN_HTML_ATTR.includes(attr), attr);
  assert.equal(localImagePath("img/a.png", src), "C:\\w\\docs\\img\\a.png");
  // What markdown-it writes itself is inside the lists.
  const own = renderMarkdown("---\na: 1\n---\n# T\n\n| a |\n|:-:|\n| b |\n\n1. x\n\n> q\n\n```py\nx\n```\n\n**b** *i* ~~s~~ `c` [l](b.md) ![i](a.png) $x$\n\n---\n");
  for (const [, tag] of own.matchAll(/<([a-z][a-z0-9]*)/g)) assert.ok(MARKDOWN_HTML_TAGS.includes(tag), tag);
  for (const [, attr] of own.matchAll(/ ([a-z-]+)="/g)) assert.ok(MARKDOWN_HTML_ATTR.includes(attr), attr);
});

test("I-083 / I-084: the innermost block holding a line", () => {
  const blocks = [{ start: 0, end: 10 }, { start: 2, end: 4 }, { start: 5, end: 6 }];
  assert.equal(blockAt(blocks, 3), 1);
  assert.equal(blockAt(blocks, 4), 0);
  assert.equal(blockAt(blocks, 12), -1);
});

// Test-only ancestor stack for renderer-owned HTML; mirrors closest("[data-line]") without adding a DOM dependency.
function clickedBlock(source: string, target: string): { tag: string; line: number } {
  const html = renderMarkdown(source);
  const at = html.indexOf(target);
  assert.ok(at >= 0, `Missing target ${target}: ${html}`);
  const end = target.startsWith("<") ? html.indexOf(">", at) + 1 : at;
  const ancestors: { tag: string; line?: number }[] = [];
  for (const match of html.slice(0, end).matchAll(/<(\/?)([a-z][a-z0-9]*)\b([^>]*)>/g)) {
    const [, closing, tag, attrs] = match;
    if (closing) { ancestors.pop(); continue; }
    const line = /\bdata-line="(\d+)"/.exec(attrs)?.[1];
    if (!/^(hr|br|img)$/.test(tag) || match.index + match[0].length === end) {
      ancestors.push({ tag, line: line === undefined ? undefined : Number(line) + 1 });
    }
  }
  const block = ancestors.findLast((node) => node.line !== undefined);
  assert.ok(block, `No source block for ${target}: ${html}`);
  return { tag: block.tag, line: block.line! };
}

test("K-28: preview clicks use the innermost list item, loose paragraph and quoted paragraph", () => {
  assert.deepEqual(clickedBlock("- first\n- **itemTarget**\n  - **nestedTarget**\n", "itemTarget"), { tag: "li", line: 2 });
  assert.deepEqual(clickedBlock("- first\n- outer\n  - **nestedTarget**\n", "nestedTarget"), { tag: "li", line: 3 });
  assert.deepEqual(clickedBlock("- first paragraph\n\n  second **looseTarget**\n\n- next\n", "looseTarget"), { tag: "p", line: 3 });
  assert.deepEqual(clickedBlock("> first paragraph\n>\n> second **quoteTarget**\n", "quoteTarget"), { tag: "p", line: 3 });
});

test("K-28: code clicks use the fence or indented block start, regardless of the clicked code line", () => {
  const fenced = "intro\n\n```python\nfirstCodeTarget\nsecondCodeTarget\n```\n";
  assert.deepEqual(clickedBlock(fenced, "firstCodeTarget"), { tag: "code", line: 3 });
  assert.deepEqual(clickedBlock(fenced, "secondCodeTarget"), { tag: "code", line: 3 });
  const indented = "intro\n\n    firstIndentTarget\n    secondIndentTarget\n";
  assert.deepEqual(clickedBlock(indented, "secondIndentTarget"), { tag: "pre", line: 3 });
});

test("K-28: table cells currently use their tr source row, for both header and body", () => {
  const table = "intro\n\n| headerTarget | other |\n| --- | --- |\n| bodyTarget | value |\n| secondRowTarget | value |\n";
  assert.deepEqual(clickedBlock(table, "headerTarget"), { tag: "tr", line: 3 });
  assert.deepEqual(clickedBlock(table, "bodyTarget"), { tag: "tr", line: 5 });
  assert.deepEqual(clickedBlock(table, "secondRowTarget"), { tag: "tr", line: 6 });
});

test("K-28: paragraphs, headings, rules and both frontmatter renderings preserve their source start", () => {
  assert.deepEqual(clickedBlock("intro\n\nparagraph **paragraphTarget**\ncontinued\n", "paragraphTarget"), { tag: "p", line: 3 });
  assert.deepEqual(clickedBlock("intro\n\n## heading **headingTarget**\n", "headingTarget"), { tag: "h2", line: 3 });
  assert.deepEqual(clickedBlock("intro\n\n---\n", "<hr"), { tag: "hr", line: 3 });
  assert.deepEqual(clickedBlock("---\ntitle: frontTarget\n---\n\n# After\n", "frontTarget"), { tag: "div", line: 1 });
  assert.deepEqual(clickedBlock("---\ntags:\n  - rawFrontTarget\n---\n", "rawFrontTarget"), { tag: "pre", line: 1 });
});

test("I-085: links are relative to the source file; `#x` is a heading of this preview", () => {
  const src = "C:\\w\\docs\\a.md";
  assert.deepEqual(classifyLink("../README.md#top", src, false), { kind: "preview", path: "C:\\w\\README.md" });
  assert.deepEqual(classifyLink("./my%20notes.md", src, false), { kind: "preview", path: "C:\\w\\docs\\my notes.md" });
  assert.deepEqual(classifyLink("img/x.png", src, false), { kind: "open", path: "C:\\w\\docs\\img\\x.png" });
  assert.deepEqual(classifyLink("#intro", src, false), { kind: "anchor", id: "intro" });
});

// Lock Preview is not an input of the classification: "preview" opens the preview and "open" on a file that has one (Alt) opens
// its editor tab directly (followLink), so neither goes through the Lock Preview choice of openFile.
test("core v0.8.2 I-20: the link table: clicked in (md, ipynb, HTML) x target x Alt", () => {
  const dir = "C:\\w\\docs\\";
  const sources: [string, typeof classifyLink][] = [["a.md", classifyLink], ["a.ipynb", classifyLink], ["a.html", classifyHtmlLink]];
  // target, without Alt, with Alt
  const table: [href: string, plain: string | null, alt: string | null][] = [
    ["b.md", "preview", "open"],
    ["b.ipynb", "preview", "open"],
    ["b.html", "preview", "open"],
    ["b.csv", "preview", "open"],
    ["b.tsv", "preview", "open"],
    ["b.py", "open", "open"],
    ["https://example.com/a", "external", "external"],
    ["http://example.com/a", "external", "external"],
    ["file:///C:/w/docs/b.html", null, null],
    ["javascript:alert(1)", null, null],
    ["java\tscript:alert(1)", null, null],
    ["mailto:a@b.c", null, null],
    ["//example.com/a", null, null],
  ];
  for (const [name, classify] of sources) for (const [href, plain, alt] of table) for (const pressed of [false, true]) {
    const target = classify(href, dir + name, pressed);
    const where = `${name} -> ${href}${pressed ? " +Alt" : ""}`;
    assert.equal(target?.kind ?? null, pressed ? alt : plain, where);
    if (target?.kind === "preview" || target?.kind === "open") assert.equal(target.path, dir + href, where);
    if (target?.kind === "external") assert.equal(target.url, href, where);
  }
});

test("core v0.8.1 I-22: heading ids follow Zed's slug rule; repeats get -1, -2", () => {
  assert.deepEqual(headingSlugs(["  Hello World  ", "설치 방법", "C++ & Rust: v2.0!", "snake_case-name"]),
    ["hello-world", "설치-방법", "c--rust-v20", "snake_case-name"]);
  assert.deepEqual(headingSlugs(["Usage", "Usage", "Usage"]), ["usage", "usage-1", "usage-2"]);
  assert.deepEqual(headingSlugs(["A-1", "A", "A"]), ["a-1", "a", "a-2"]); // "a-1" is taken, so the second "A" skips it
  assert.deepEqual(headingSlugs(["!!!", "?"]), [null, "-1"]); // an empty id is none, its repeat is "-1" (as in Zed)
});

test("I-3: a preview image resolves to a local file next to the Markdown file; a URL of any scheme gives none", () => {
  const src = "C:\\w\\docs\\a.md";
  assert.equal(localImagePath("img/a.png", src), "C:\\w\\docs\\img\\a.png");
  assert.equal(localImagePath("./a.png", src), "C:\\w\\docs\\a.png");
  assert.equal(localImagePath("../b.png", src), "C:\\w\\b.png");
  assert.equal(localImagePath("../../../../b.png", src), "C:\\b.png"); // never above the drive
  assert.equal(localImagePath("my%20pics/%ED%95%9C%EA%B8%80.png?raw=1#x", src), "C:\\w\\docs\\my pics\\한글.png");
  assert.equal(localImagePath("D:\\pics\\c.png", src), "D:\\pics\\c.png");
  assert.equal(localImagePath("D:/pics/c.png", src), "D:\\pics\\c.png");
  for (const url of ["http://a.com/x.png", "https://a.com/x.png", "data:image/png;base64,AAAA", "file:///C:/x.png", "//a.com/x.png", "%E0%A4%A.png"]) assert.equal(localImagePath(url, src), null);
});
