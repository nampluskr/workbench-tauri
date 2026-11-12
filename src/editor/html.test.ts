import test from "node:test";
import assert from "node:assert/strict";
import { attributeValue, defaultStyle, headStart, navigates, PREVIEW_CSP, resourceUrl, rewriteCss, rewriteSrcset, withHead } from "./html.ts";
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

// I-7: the frame document has its own URL, so a link's `#id` scrolls within it (K-03c dropped it: in a srcdoc it loaded the app page).
test("links and form targets are dropped whole except a link's `#id`; `<use href=\"#id\">` stays", () => {
  for (const [tag, attr] of [["a", "href"], ["area", "href"], ["a", "xlink:href"], ["form", "action"], ["button", "formaction"]]) assert.equal(navigates(tag, attr, "other.html"), true, `${tag} ${attr}`);
  for (const [tag, attr] of [["use", "href"], ["img", "src"], ["link", "href"], ["use", "xlink:href"]]) assert.equal(navigates(tag, attr, "x.png"), false, `${tag} ${attr}`);
  for (const href of ["https://x.test/", "javascript:alert(1)", "other.html", ""]) assert.equal(attributeValue("a", "href", href, SOURCE, convert), null, href);
  assert.equal(attributeValue("a", "href", " #top", SOURCE, convert), "#top");
  assert.equal(attributeValue("form", "action", "#x", SOURCE, convert), null);
  assert.equal(resourceUrl("#id", SOURCE, convert), "#id");
});

// I-7: scripts run (inline, local src, event attributes); internet sources are dropped from the markup.
test("I-7: event attributes stay, script src is local only, ping goes", () => {
  for (const name of ["onclick", "onload", "id", "type"]) assert.equal(attributeValue("button", name, "draw()", SOURCE, convert), undefined, name);
  assert.equal(attributeValue("script", "src", "js/app.js", SOURCE, convert), "asset:C:\\site\\pages\\js\\app.js");
  assert.equal(attributeValue("script", "src", "https://x.test/a.js", SOURCE, convert), null);
  assert.equal(attributeValue("img", "src", "file:///D:/a.png", SOURCE, convert), null); // file: is not opened up
  assert.equal(attributeValue("a", "ping", "/p", SOURCE, convert), null);
});

// I-7 conditions 3 and 4: the frame document may load only inline or local (asset) sources, and connect nowhere.
test("I-7: preview CSP allows inline scripts and local sources only", () => {
  const policy = new Map(PREVIEW_CSP.split(";").map((d) => { const [name, ...values] = d.trim().split(/\s+/); return [name, values]; }));
  assert.deepEqual(policy.get("default-src"), ["'none'"]);
  assert.deepEqual(policy.get("connect-src"), ["'none'"]);
  assert.deepEqual(policy.get("form-action"), ["'none'"]);
  assert.deepEqual(policy.get("base-uri"), ["'none'"]);
  assert.ok(policy.get("script-src")?.includes("'unsafe-inline'"));
  for (const name of ["frame-src", "child-src", "worker-src", "object-src"]) assert.equal(policy.get(name), undefined, name); // falls back to 'none'
  for (const values of policy.values()) for (const v of values) assert.ok(v.startsWith("'") || ["asset:", "http://asset.localhost", "data:", "blob:"].includes(v), v);
  const head = headStart({ appearance: "dark", text: "#fff", accent: "#00f" }, 120.4);
  assert.ok(head.startsWith(`<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">`)); // before any page element
  assert.ok(head.includes("scrollTo(0,120)"));
  assert.ok(headStart({ appearance: "dark", text: "#fff", accent: "#00f" }, Number.NaN).includes("scrollTo(0,0)"));
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

// I-11: page defaults must lose to every page rule (specificity 0) and come before every page style.
test("I-11: default style is specificity 0, carries the theme values, and sits first in <head>", () => {
  const css = defaultStyle({ appearance: "light", text: "#383a42ff", accent: "#5c78e2ff" });
  assert.ok(css.includes("color-scheme:light") && css.includes("#383a42ff") && css.includes("#5c78e2ff"));
  assert.ok(!css.includes("background")); // the background is the iframe element's, so a page body background reaches the canvas
  for (const selector of css.split("{").slice(0, -1).flatMap((part) => part.split("}").slice(-1))) assert.match(selector, /^:where\(.*\)$/, selector);
  const page = '<html lang="en" data-x="<head>"><head><meta charset="utf-8"><style>body{color:red}</style></head><body>x</body></html>';
  const out = withHead(page, `<style>${css}</style>`);
  assert.ok(out.indexOf(`<head><style>${css}</style><meta`) > 0);
  assert.ok(out.indexOf(css) < out.indexOf("body{color:red}"));
  assert.ok(out.startsWith('<html lang="en" data-x="<head>"><head><style>'));
});

// The Markdown preview keeps its rule (no style attribute): raw HTML is escaped, table alignment is a class.
test("markdown output has no style attribute", () => {
  const out = renderMarkdown('<p style="color:red">x</p>\n\n| a |\n|:-:|\n| b |\n');
  assert.ok(!/<[^>]+\sstyle=/.test(out));
  assert.ok(out.includes("align-center"));
});
