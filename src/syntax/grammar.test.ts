// ORDER-11 V1: ignored pinned copies only; no installed Zed files.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { Parser, type Language } from "web-tree-sitter";
import { compileQuery, loadLanguage, predicateRegex, skipDylinkNeeded, themeKey } from "./grammar.ts";

const root = new URL("../assets/zed-grammars/", import.meta.url);
const wasmPath = new URL("grammars/html.wasm", root);
const available = existsSync(wasmPath);
const scm = (name: string) => readFileSync(new URL(`languages/html/${name}.scm`, root), "utf8");

await Parser.init();
let html: Language;
if (available) html = await loadLanguage(new Uint8Array(readFileSync(wasmPath)));

test("D-12: the dylink workaround only retags NEEDED on an in-memory copy", async () => {
  const encode = (text: string) => [...new TextEncoder().encode(text)];
  const wasm = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 0, 20, 8, ...encode("dylink.0"), 2, 9, 1, 7, ...encode("libc.so")]);
  const before = wasm.slice();
  await assert.rejects(loadLanguage(new Uint8Array(0)));
  assert.deepEqual(wasm, before);
  assert.notDeepEqual(skipDylinkNeeded(wasm), wasm);
});

const parse = (source: string) => {
  const parser = new Parser();
  parser.setLanguage(html);
  return parser.parse(source)!;
};

test("the six .scm compile and highlights.scm yields captures", { skip: !available }, () => {
  for (const name of ["brackets", "highlights", "indents", "injections", "outline", "overrides"]) {
    assert.doesNotThrow(() => compileQuery(html, scm(name)), name);
  }
  const captures = compileQuery(html, scm("highlights")).captures(parse('<!doctype html><p class="a">x</p>').rootNode);
  assert.deepEqual(
    [...new Set(captures.map((c) => c.name))].sort(),
    ["attribute", "punctuation.bracket.html", "punctuation.delimiter.html", "string", "tag", "tag.doctype"],
  );
});

test("W-9 predicates P-1..P-7", { skip: !available }, () => {
  const injections = compileQuery(html, scm("injections"));
  const brackets = compileQuery(html, scm("brackets"));
  const injected = (source: string) =>
    injections.matches(parse(source).rootNode).map((m) => ({
      language: m.setProperties?.["injection.language"],
      content: m.captures.find((c) => c.name === "injection.content")?.node.text,
    }));
  assert.deepEqual(injected('<p style="color:red">'), [{ language: "css", content: "color:red" }]); // P-1
  assert.deepEqual(injected('<p class="color:red">'), []); // P-2
  assert.deepEqual(injected('<b onclick="go()">'), [{ language: "javascript", content: "go()" }]); // P-3
  assert.deepEqual(injected('<b onClick="go()">'), []); // P-4
  assert.deepEqual(injected("<script>let x = 1;</script>"), [{ language: "javascript", content: "let x = 1;" }]); // P-5
  const props = (source: string, open: string) =>
    brackets
      .matches(parse(source).rootNode)
      .filter((m) => m.captures.find((c) => c.name === "open")?.node.text === open)
      .map((m) => m.setProperties);
  assert.deepEqual(props('<a href="x">', '"'), [{ "rainbow.exclude": null }]); // P-6
  assert.deepEqual(props("<div></div>", "<div>"), [{ "newline.only": null, "rainbow.exclude": null }]); // P-7
});

test("T-27.1: longest dot-boundary prefix among theme syntax keys, else no style", () => {
  const keys = new Set(["tag", "tag.doctype", "punctuation", "punctuation.bracket", "string", "string.special", "keyword"]);
  assert.equal(themeKey("tag.doctype", keys), "tag.doctype"); // exact key
  assert.equal(themeKey("punctuation.bracket.html", keys), "punctuation.bracket"); // longest prefix
  assert.equal(themeKey("string.special", keys), "string.special");
  assert.equal(themeKey("keywordx", keys), null); // "keyword" is not a dot-boundary prefix
  assert.equal(themeKey("nothing.here", keys), null);
});

test("range units: QueryOptions indexes are bytes (code units x 2), Node indexes are code units", { skip: !available }, () => {
  const source = "<p>é</p><b>x</b>"; // `<b>` starts at code unit 8
  const query = compileQuery(html, scm("highlights"));
  const tags = (from: number, to: number) =>
    query.captures(parse(source).rootNode, { startIndex: from * 2, endIndex: to * 2 })
      .filter((c) => c.name === "tag").map((c) => [c.node.text, c.node.startIndex]);
  assert.deepEqual(tags(8, 16), [["b", 9], ["b", 14]]);
});

test("K-50: the two pinned regex forms preserve matching and rejection", () => {
  const jsdoc = new RegExp(predicateRegex("(?s)^/[*][*][^*].*[*]/$"));
  assert.ok(jsdoc.test("/** docs\nmore docs */"));
  assert.equal(jsdoc.test("/* ordinary comment */"), false);
  const sql = new RegExp(predicateRegex("^(#|#\\s+)(?i:sql)\\s*$"));
  assert.ok(sql.test("# SQL "));
  assert.equal(sql.test("# sqlite"), false);
});
