import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FRAME_KEYS, frameKey, frameMessage, frameRequest, PREVIEW_FIND_MAX_CHARS, type FrameKey, type FrameRequest } from "./html.ts";
import { attributeValue, classifyHtmlLink, copyRequest, defaultStyle, frameBaseStyle, headStart, navigates, PREVIEW_CSP, PREVIEW_RECOVER_LIMIT, PREVIEW_RECOVER_WINDOW_MS, previewHost, recordRecovery, resourceUrl, rewriteCss, rewriteSrcset, withHead } from "./html.ts";
import { MARKDOWN_HTML_ATTR, renderMarkdown } from "./markdown.ts";
import { codeBlockParts, codeLanguage } from "./code-block.ts";
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
  assert.deepEqual(policy.get("webrtc"), ["'block'"]); // I-15
  assert.ok(policy.get("script-src")?.includes("'unsafe-inline'"));
  for (const name of ["frame-src", "child-src", "worker-src", "object-src"]) assert.equal(policy.get(name), undefined, name); // falls back to 'none'
  for (const values of policy.values()) for (const v of values) assert.ok(v.startsWith("'") || ["asset:", "http://asset.localhost", "data:", "blob:"].includes(v), v);
  const head = headStart({ appearance: "dark", text: "#fff", accent: "#00f" }, 120.4, "tok");
  assert.ok(head.startsWith(`<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">`)); // before any page element
  assert.ok(head.includes("scrollTo(0,120)"));
  // K-07a-R2: the document announces itself first, before its load, so a re-attached frame's load is not a navigation.
  // I-15: WebRTC is removed before any page script runs.
  assert.ok(head.includes('<script>delete window.RTCPeerConnection;delete window.webkitRTCPeerConnection;parent.postMessage({previewReady:true},"*");'));
  // I-14: it answers the parent's ping, and only the parent's. core v0.8.2 I-12: it scrolls to a position only the parent sends.
  assert.ok(head.includes('addEventListener("message",e=>{if(e.source!==parent)return;if(e.data?.previewPing===true)parent.postMessage({previewPong:true},"*");if(typeof e.data?.previewScrollTo==="number")scrollTo(0,e.data.previewScrollTo)})'));
  assert.ok(headStart({ appearance: "dark", text: "#fff", accent: "#00f" }, Number.NaN, "tok").includes("scrollTo(0,0)"));
  // I-24: the link script removes itself (the token stays in its closure), listens first in the capture phase, cancels every
  // link click and reports trusted ones only, through built-ins kept before any page script runs.
  const link = head.slice(head.lastIndexOf("<script>"));
  assert.ok(link.startsWith('<script>(()=>{const T="tok",U=parent,A=Reflect.apply,P=U.postMessage,'));
  assert.ok(link.indexOf("document.currentScript.remove();") < link.indexOf("addEventListener"));
  assert.ok(link.includes('A(D,e,[]);if(e.isTrusted)A(P,U,[{previewLink:{token:T,href:h,alt:A(K,e,[])}},"*"])},true)'));
  assert.ok(link.includes('A(G,a,["data-preview-href"])'));
  assert.ok(!/[^A-Za-z](parent|e)\.(postMessage|preventDefault|target|closest|getAttribute)\(/.test(link.slice(link.indexOf("remove();")))); // no lookups a page can replace
});

test("I-24: a clicked HTML preview link is followed as a Markdown link, relative to the HTML file", () => {
  assert.deepEqual(classifyHtmlLink("other.html", SOURCE, false), { kind: "preview", path: "C:\\site\\pages\\other.html" });
  assert.deepEqual(classifyHtmlLink("../sub/page.HTM#x", SOURCE, false), { kind: "preview", path: "C:\\site\\sub\\page.HTM" });
  assert.deepEqual(classifyHtmlLink("other.html", SOURCE, true), { kind: "open", path: "C:\\site\\pages\\other.html" }); // Alt: an editor tab
  assert.deepEqual(classifyHtmlLink("docs/a.md", SOURCE, false), { kind: "preview", path: "C:\\site\\pages\\docs\\a.md" });
  assert.deepEqual(classifyHtmlLink("data/x.csv", SOURCE, false), { kind: "preview", path: "C:\\site\\pages\\data\\x.csv" }); // core v0.8.2 I-20
  assert.deepEqual(classifyHtmlLink("D:\\notes\\b.txt", SOURCE, false), { kind: "open", path: "D:\\notes\\b.txt" });
  assert.deepEqual(classifyHtmlLink(" https://example.com/a ", SOURCE, false), { kind: "external", url: "https://example.com/a" });
  assert.deepEqual(classifyHtmlLink("HTTP://example.com", SOURCE, false), { kind: "external", url: "HTTP://example.com" });
  for (const href of ["#top", " #top", "", "file:///C:/x.html", "javascript:alert(1)", "java\tscript:alert(1)", "mailto:a@b.c", "ftp://x.test/", "//x.test/a", "bad%zz.html"])
    assert.equal(classifyHtmlLink(href, SOURCE, false), null, href);
});

test("I-14: a preview is drawn on a host that is not avoided, else the one free first; a once-stuck one on preview2 only", () => {
  assert.equal(previewHost(100, { preview: 0, preview1: 0, preview2: 0 }, false), "preview");
  assert.equal(previewHost(100, { preview: 100, preview1: 0, preview2: 0 }, false), "preview"); // its avoidance has ended
  assert.equal(previewHost(100, { preview: 200, preview1: 0, preview2: 0 }, false), "preview1");
  assert.equal(previewHost(100, { preview: 200, preview1: 300, preview2: 0 }, false), "preview"); // never preview2
  assert.equal(previewHost(100, { preview: 300, preview1: 200, preview2: 0 }, false), "preview1");
  assert.equal(previewHost(100, { preview: 0, preview1: 0, preview2: 0 }, true), "preview2");
  assert.equal(previewHost(100, { preview: 0, preview1: 0, preview2: 350 }, true), 250); // waits, never an ordinary host
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

// The Markdown preview keeps its rule (no style attribute): table alignment is a class, and a style typed in the body's HTML
// (core v0.8.2 I-24) is not an attribute the sanitizer keeps.
test("markdown output has no style attribute", () => {
  const out = renderMarkdown("| a |\n|:-:|\n| b |\n");
  assert.ok(!/<[^>]+\sstyle=/.test(out));
  assert.ok(out.includes("align-center"));
  assert.ok(!MARKDOWN_HTML_ATTR.includes("style"));
});

// K-07a-R1: every navigation away is undone, but a page that keeps navigating is shown again only a bounded number of times.
test("I-7: frame recoveries are bounded within the window, older ones expire", () => {
  let times: number[] = [];
  for (let i = 0; i < PREVIEW_RECOVER_LIMIT; i++) {
    const next = recordRecovery(times, i * 10);
    assert.ok(next, `recovery ${i + 1}`);
    times = next;
  }
  assert.equal(recordRecovery(times, PREVIEW_RECOVER_LIMIT * 10), null);
  assert.deepEqual(recordRecovery(times, PREVIEW_RECOVER_WINDOW_MS + 15), [20, 30, 40, PREVIEW_RECOVER_WINDOW_MS + 15]);
});

// core v0.8.2 I-14 (ORDER-06 #2, #3): the frame's base look is the app's own preview rules, weaker than any page rule, carrying the Settings and theme values.
const VALUES: Record<string, string> = { "--text": "#111", "--markdown-preview-max-width": "calc(50 * 14px)", "--markdown-preview-container-padding": "14px", "--ui-font-family": '"IBM Plex Sans", sans-serif',
  "--heading-color-1": "#a00", "--icons-size-small": "0.875rem", "--buttons-height-default": "1.375rem", "--units-rem-size": "16px", "--preview-code-line-numbers": "none" };
const RULES = ".markdown-body { max-width: var(--markdown-preview-max-width); color: var(--text); }.markdown-body.left-margin { padding-left: 64px; }"
  + ".heading-colors .outline-bar .heading-1, .heading-colors .markdown-body h1 { color: var(--heading-color-1); }.markdown-body :is(h1, h2) { color: var(--text); }"
  + ".markdown-preview .cm-syntax-keyword { color: rgb(1, 2, 3); }.code-block-header { --icon-size: var(--icons-size-small); }.icon { width: var(--icon-size); }"
  + ".icon-button { width: var(--button-size, var(--buttons-height-default)); }.code-line-numbers { display: var(--preview-code-line-numbers); }";
test("I-14: the frame's base style is one cascade layer of the preview's rules with the values put in", () => {
  const css = frameBaseStyle(RULES, (name) => VALUES[name] ?? "");
  assert.ok(css.startsWith("@layer{") && css.endsWith("}")); // a page rule (outside a layer) wins whatever its specificity
  assert.ok(css.includes(":root body { max-width: calc(50 * 14px); color: #111; }")); // the page's body is the Markdown body
  assert.ok(css.includes(":root body { padding-left: 64px; }")); // I-15
  assert.ok(css.includes('html{padding:14px}body{font-family:"IBM Plex Sans", sans-serif;')); // L-102, the app's text font
  assert.ok(css.includes(":root:root body h1 { color: #a00; }")); // I-11: still heavier than the plain heading colour that follows it
  assert.ok(css.includes(":root .cm-syntax-keyword { color: rgb(1, 2, 3); }"));
  assert.ok(css.includes(".code-block-header { --icon-size: calc(0.875 * 16px); }.icon { width: var(--icon-size); }")); // a variable the rules set stays; rem is the app's
  assert.ok(css.includes(".icon-button { width: calc(1.375 * 16px); }")); // an unset variable gives its fallback
  assert.ok(!/markdown-(body|preview)|var\(--(?!icon-size)/.test(css));
  assert.notEqual(css, frameBaseStyle(RULES, (name) => name === "--text" ? "#222" : VALUES[name] ?? "")); // a changed value is a changed style: the preview re-renders
  const head = headStart({ appearance: "light", text: "#111", accent: "#00f", base: css }, 0, "tok");
  assert.ok(head.indexOf(`<style>${css}</style>`) > head.indexOf("Content-Security-Policy") && head.indexOf(css) < head.indexOf("<script>"));
});

// core v0.8.2 I-14 / I-23 (ORDER-06 #4): the header's language comes from the class; the numbers follow the Settings variable; Copy is sent by the head script.
test("I-14: a code block's language, line numbers and Copy in the frame", () => {
  assert.equal(codeLanguage("hljs language-python"), "python");
  assert.equal(codeLanguage(""), ""); // no language: the header has the Copy button only
  assert.equal(codeBlockParts("\na = 1\nb = 2\n").numbers, "1\n2");
  for (const shown of ["block", "none"]) assert.ok(frameBaseStyle(RULES, (name) => name === "--preview-code-line-numbers" ? shown : "").includes(`.code-line-numbers { display: ${shown}; }`));
  const script = headStart({ appearance: "light", text: "#111", accent: "#00f" }, 0, "tok");
  assert.ok(script.includes('["button.code-block-copy"])}catch{}if(!b||!e.isTrusted)return;')); // only a click the user made
  assert.ok(script.includes('A(P,U,[{previewCopy:{token:T,text:A(X,p,[])}},"*"])'));
});

// core v0.8.2 I-14 (ORDER-06 #6): the one new frame -> app message; a made-up one is not taken.
test("I-14: a copy request is taken only from the preview's frame, with its token and a string", () => {
  const frame = {}, good = { previewCopy: { token: "tok", text: "a = 1" } };
  assert.equal(copyRequest({ source: frame, data: good }, frame, "tok"), "a = 1");
  assert.equal(copyRequest({ source: {}, data: good }, frame, "tok"), null); // another window
  assert.equal(copyRequest({ source: null, data: good }, null, "tok"), null); // the frame is gone
  for (const data of [null, "x", {}, { previewCopy: "a" }, { previewCopy: { text: "a" } }, { previewCopy: { token: "other", text: "a" } }, { previewCopy: { token: "tok", text: 1 } }, { previewCopy: { token: "tok" } }])
    assert.equal(copyRequest({ source: frame, data }, frame, "tok"), null, JSON.stringify(data));
});

// core v0.8.2 ORDER-07 #5 (I-7, I-19, I-25): what a frame may ask is a fixed few things; a made-up message is not taken.
test("ORDER-07: a frame request is one of the fixed few, from the preview's frame with its token", () => {
  const frame = {};
  type Message = { source: unknown; data: unknown };
  const act = (fields: object): Message => ({ source: frame, data: { previewAct: { token: "tok", ...fields } } });
  const table: [string, Message, FrameRequest | null][] = [
    ...FRAME_KEYS.map((key): [string, Message, FrameRequest] => [`key ${key}`, act({ key }), { key }]),
    ["heading", act({ heading: 3 }), { heading: 3 }],
    ["before the first heading", act({ heading: -1 }), { heading: -1 }],
    ["text", act({ text: "abc" }), { text: "abc" }],
    ["an app action's name", act({ key: "workspace::Save" }), null],
    ["a find action's name", act({ key: "editor::Find" }), null],
    ["an inherited name", act({ key: "constructor" }), null],
    ["a key that is not a string", act({ key: 1 }), null],
    ["a heading that is not a whole number", act({ heading: 1.5 }), null],
    ["a heading below -1", act({ heading: -2 }), null],
    ["a heading NaN", act({ heading: Number.NaN }), null],
    ["a heading as text", act({ heading: "3" }), null],
    ["text that is not a string", act({ text: ["a"] }), null],
    ["two at once", act({ key: "find", heading: 1 }), null],
    ["a field too many", act({ key: "find", action: "workspace::Save" }), null],
    ["nothing asked", act({}), null],
    ["another window", { source: {}, data: act({ key: "find" }).data }, null],
    ["no token", { source: frame, data: { previewAct: { key: "find" } } }, null],
    ["another token", { source: frame, data: { previewAct: { token: "other", key: "find" } } }, null],
    ["not an object", { source: frame, data: { previewAct: "find" } }, null],
    ["a bare action", { source: frame, data: { key: "find", token: "tok" } }, null],
    ["no data", { source: frame, data: null }, null],
    ["text data", { source: frame, data: "find" }, null],
  ];
  for (const [name, e, want] of table) assert.deepEqual(frameRequest(e, frame, "tok"), want, name);
  assert.equal(frameRequest({ source: null, data: act({ key: "find" }).data }, null, "tok"), null); // the frame is gone
  const long = frameRequest(act({ text: "a".repeat(PREVIEW_FIND_MAX_CHARS + 5) }), frame, "tok");
  assert.ok(long && "text" in long && long.text.length === PREVIEW_FIND_MAX_CHARS);

  // Inside the frame a key press becomes one of the same names, by the physical key (code, ctrl, shift, alt or win).
  const keys: [string, boolean, boolean, boolean, FrameKey | null][] = [
    ["Equal", true, false, false, "zoomIn"], ["Equal", true, true, false, "zoomIn"], ["NumpadAdd", true, false, false, "zoomIn"],
    ["Minus", true, false, false, "zoomOut"], ["NumpadSubtract", true, false, false, "zoomOut"], ["Digit0", true, false, false, "zoomReset"], ["Numpad0", true, false, false, "zoomReset"],
    ["KeyF", true, false, false, "find"], ["F3", false, false, false, "findNext"], ["F3", false, true, false, "findPrevious"], ["Escape", false, false, false, "cancel"],
    ["KeyF", true, true, false, null], ["KeyF", false, false, false, null], ["KeyF", true, false, true, null], ["Equal", false, false, false, null], ["KeyS", true, false, false, null], ["KeyP", true, false, false, null],
  ];
  for (const [code, ctrl, shift, other, want] of keys) assert.equal(frameKey(code, ctrl, shift, other), want, `${code} ${ctrl} ${shift} ${other}`);

  // The frame's script: ahead of the link script, it removes itself before it listens, takes only what the user did, and the
  // token leaves only through the built-ins kept at its start.
  const scripts = headStart({ appearance: "light", text: "#111", accent: "#00f", zoom: 1.25 }, 0, "tok").split("<script>").map((part) => part.split("</script>")[0]);
  const script = scripts.at(-2)!;
  assert.doesNotThrow(() => new Function(script)); // the functions put in by their source text parse
  assert.ok(script.startsWith('(()=>{const T="tok",U=parent,A=Reflect.apply,P=U.postMessage,'));
  assert.ok(script.includes('send=(k,v)=>A(P,U,[{previewAct:{token:T,[k]:v}},"*"])'));
  assert.equal(script.split(/[^A-Za-z]T[^A-Za-z]/).length, 3); // the token: set once, sent in one place
  assert.ok(script.indexOf("document.currentScript.remove();") < script.indexOf("addEventListener"));
  assert.ok(script.includes("Z(1.25);")); // I-19: the document starts at the previews' zoom
  for (const listener of ['addEventListener("keydown",e=>{if(!e.isTrusted)return;', 'addEventListener("click",e=>{if(!e.isTrusted)return;']) assert.ok(script.includes(listener), listener);
  assert.ok(script.includes('if(k!=="cancel")A(D,e,[]);send("key",k)},true)')); // the key is taken from the page and WebView2 (its find box), Escape is not
  assert.ok(script.includes('t.closest("a,area,button.code-block-copy"))return;')); // a link or Copy click moves no Outline mark
  assert.ok(script.includes('addEventListener("message",e=>{const d=e.data;if(e.source!==U||'));
});

// core v0.8.2 ORDER-07 #6: a page script reads what the app sends its frame, so the token (I-24: what makes a click the user's) never rides along.
test("ORDER-07: no message to the frame carries the preview's token", () => {
  const sent: Record<keyof typeof frameMessage, unknown[]> = {
    ping: [frameMessage.ping()], scrollTo: [frameMessage.scrollTo(12)], zoom: [frameMessage.zoom(1.25)], reveal: [frameMessage.reveal(3)],
    findRead: [frameMessage.findRead()], find: [frameMessage.find([0, 4, 9, 13], 1, true), frameMessage.find(null, 0, false)],
  };
  assert.deepEqual(Object.keys(sent).sort(), Object.keys(frameMessage).sort());
  for (const make of Object.values(frameMessage)) assert.ok(!/token/i.test(String(make)));
  for (const message of Object.values(sent).flat()) assert.ok(!/token/i.test(JSON.stringify(message)), JSON.stringify(message));
  assert.deepEqual(sent.find, [{ previewFind: { marks: [0, 4, 9, 13], at: 1, scroll: true } }, { previewFind: { at: 0, scroll: false } }]);
  // The preview posts to its frame in one place, and only these messages.
  const source = readFileSync(new URL("../shell/markdown-preview.ts", import.meta.url), "utf8");
  assert.deepEqual(source.match(/postMessage\([^)]*\)/g), ['postMessage(message, "*")']);
  assert.equal(source.match(/\bpost\((?!frameMessage\.)/g), null);
});
