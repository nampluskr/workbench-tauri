// Phase 3 verification entry points (specs/v0.1/verify/phase3/HOWTO.md):
// window.__poc.syntax (R-10, R-12) and window.__poc.ext (R-11).
import { invoke } from "@tauri-apps/api/core";
import { Parser } from "web-tree-sitter";
import type { EditorView } from "@codemirror/view";
import { extUrl, loadHtml, QUERY_NAMES } from "../syntax/grammar";
import { clearSyntaxLogs, syntaxKeyFor, syntaxLogs, treeSitterPlugin } from "../syntax/highlight";
import { currentTheme, themeSyntax } from "../theme/theme";
import { bigHtml, getView, HTML_SAMPLE, setInitialDoc } from "./editorStore";
import { activateTab, addTab } from "./layout";

function frames(n = 2): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number) =>
      left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1));
    step(n);
  });
}
const r3 = (n: number) => Math.round(n * 1000) / 1000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------- R-10: grammar, queries ----------

async function load() {
  const g = await loadHtml();
  const parser = new Parser();
  let parse: { ok: boolean; rootType: string | null; hasError: boolean | null; error: string | null } = {
    ok: false,
    rootType: null,
    hasError: null,
    error: null,
  };
  if (g.language) {
    parser.setLanguage(g.language);
    const tree = parser.parse(HTML_SAMPLE);
    parse = { ok: !!tree, rootType: tree?.rootNode.type ?? null, hasError: tree?.rootNode.hasError ?? null, error: null };
    tree?.delete();
  } else parse.error = g.loadError;
  parser.delete();
  return {
    grammarUrl: g.grammarUrl,
    bytes: g.bytes,
    dylink: g.dylink,
    rawLoad: g.rawLoad,
    shim: g.shim,
    loaded: !!g.language,
    abiVersion: g.abiVersion,
    loadError: g.loadError,
    parseSample: parse,
  };
}

async function queries() {
  const g = await loadHtml();
  return QUERY_NAMES.map((n) => {
    const q = g.queries[n];
    return { name: n, ok: q.ok, error: q.error, patternCount: q.patternCount, captureNames: q.captureNames };
  });
}

/**
 * Predicate cases fixed in PROGRESS Phase 3 (from the six .scm files).
 * Expected values are written from the query text, not from the engine.
 */
async function predicates() {
  const g = await loadHtml();
  if (!g.language) return { ok: false, error: "language not loaded" };
  const parser = new Parser();
  parser.setLanguage(g.language);
  const run = (query: "injections" | "brackets", src: string) => {
    const tree = parser.parse(src)!;
    const ms = g.queries[query].query!.matches(tree.rootNode).map((m) => ({
      pattern: m.patternIndex,
      setProperties: m.setProperties ?? null,
      captures: m.captures.map((c) => ({ name: c.name, text: c.node.text })),
    }));
    tree.delete();
    return ms;
  };
  type Case = {
    id: string;
    predicate: string;
    file: string;
    input: string;
    expected: string;
    check: (ms: ReturnType<typeof run>) => boolean;
  };
  const content = (m: ReturnType<typeof run>[number]) => m.captures.find((c) => c.name === "injection.content")?.text;
  const lang = (m: ReturnType<typeof run>[number]) => m.setProperties?.["injection.language"];
  const cases: Case[] = [
    {
      id: "P-1", predicate: '#match? @_attribute_name "^style$"', file: "injections.scm",
      input: '<p style="color:red">x</p>', expected: 'match: injection.content "color:red", injection.language "css"',
      check: (ms) => ms.some((m) => lang(m) === "css" && content(m) === "color:red"),
    },
    {
      id: "P-2", predicate: '#match? @_attribute_name "^style$" (negative)', file: "injections.scm",
      input: '<p class="color:red">x</p>', expected: "no attribute match (class is not style)",
      check: (ms) => !ms.some((m) => m.captures.some((c) => c.name === "_attribute_name")),
    },
    {
      id: "P-3", predicate: '#match? @_attribute_name "^on[a-z]+$"', file: "injections.scm",
      input: '<b onclick="go()">x</b>', expected: 'match: injection.content "go()", injection.language "javascript"',
      check: (ms) => ms.some((m) => lang(m) === "javascript" && content(m) === "go()"),
    },
    {
      id: "P-4", predicate: '#match? @_attribute_name "^on[a-z]+$" (negative)', file: "injections.scm",
      input: '<b onClick="go()">x</b>', expected: "no attribute match (capital C is outside [a-z])",
      check: (ms) => !ms.some((m) => m.captures.some((c) => c.name === "_attribute_name")),
    },
    {
      id: "P-5", predicate: '#set! injection.language "javascript" (2 arguments)', file: "injections.scm",
      input: "<script>let x = 1;</script>", expected: 'setProperties {"injection.language":"javascript"} on raw_text "let x = 1;"',
      check: (ms) => ms.some((m) => lang(m) === "javascript" && content(m) === "let x = 1;"),
    },
    {
      id: "P-6", predicate: "#set! rainbow.exclude (1 argument)", file: "brackets.scm",
      input: '<a href="x">y</a>', expected: 'quote pair match with setProperties key "rainbow.exclude" (value null)',
      check: (ms) => ms.some((m) => m.captures.some((c) => c.text === '"') && m.setProperties != null && "rainbow.exclude" in m.setProperties && m.setProperties["rainbow.exclude"] === null),
    },
    {
      id: "P-7", predicate: "#set! newline.only (1 argument)", file: "brackets.scm",
      input: "<div></div>", expected: 'element start/end tag match with keys "newline.only" and "rainbow.exclude"',
      check: (ms) => ms.some((m) => m.setProperties != null && "newline.only" in m.setProperties && "rainbow.exclude" in m.setProperties),
    },
  ];
  const results = cases.map((c) => {
    const ms = run(c.file.startsWith("injections") ? "injections" : "brackets", c.input);
    return { id: c.id, predicate: c.predicate, file: c.file, input: c.input, expected: c.expected, actual: ms, pass: c.check(ms) };
  });
  parser.delete();
  return { ok: true, results, pass: results.every((r) => r.pass) };
}

/** Capture -> theme key (T-27.1) for the sample, with the theme's syntax keys. */
async function themeKeys() {
  const g = await loadHtml();
  if (!g.language || !g.queries.highlights.query) return { ok: false };
  const parser = new Parser();
  parser.setLanguage(g.language);
  const tree = parser.parse(HTML_SAMPLE)!;
  const theme = currentTheme()?.name ?? "Catppuccin Mocha";
  const keys = new Set(Object.keys(themeSyntax(theme)));
  const seen = new Map<string, string | null>();
  for (const c of g.queries.highlights.query.captures(tree.rootNode)) {
    if (!seen.has(c.name)) seen.set(c.name, syntaxKeyFor(c.name, keys));
  }
  tree.delete();
  parser.delete();
  return {
    ok: true,
    theme,
    themeSyntaxKeys: [...keys].sort(),
    captures: [...seen.entries()].map(([capture, key]) => ({ capture, chosenKey: key })),
  };
}

/** R-19 other grammars (Markdown, JSON): wait until the user installs them (D-9). */
async function otherGrammars() {
  const out = [];
  for (const id of ["markdown", "json"]) {
    const r = (await invoke("ext_check", { id, rel: "extension.toml" })) as { allowed: boolean; reason?: string };
    out.push({ id, installed: r.allowed, result: r.allowed ? "installed: not tested yet" : "대기", reason: r.reason ?? null });
  }
  return out;
}

// ---------- R-12: incremental parsing, visible-range decorations ----------

function htmlView(tab: string): EditorView {
  activateTab(tab);
  return getView(tab);
}

async function waitInitial(tab: string, timeoutMs = 60000) {
  const t0 = performance.now();
  while (performance.now() - t0 < timeoutMs) {
    const e = syntaxLogs().transactions.find((x) => x.tab === tab && x.kind === "initial");
    if (e) return e;
    await sleep(100);
  }
  return null;
}

/** Decorations of the plugin vs the view's visible ranges, at the current scroll position. */
function decorationCheck(view: EditorView) {
  const plugin = view.plugin(treeSitterPlugin);
  const visible = view.visibleRanges.map((r) => ({ from: r.from, to: r.to }));
  let total = 0;
  let outside = 0;
  const examples: Array<{ from: number; to: number }> = [];
  if (plugin) {
    const iter = plugin.decorations.iter();
    while (iter.value) {
      total++;
      const inside = visible.some((r) => iter.from >= r.from && iter.to <= r.to);
      if (!inside) {
        outside++;
        if (examples.length < 5) examples.push({ from: iter.from, to: iter.to });
      }
      iter.next();
    }
  }
  return {
    scrollTop: Math.round(view.scrollDOM.scrollTop),
    viewport: { from: view.viewport.from, to: view.viewport.to },
    visibleRanges: visible,
    docLength: view.state.doc.length,
    decorations: total,
    outsideVisible: outside,
    outsideExamples: examples,
    pass: plugin !== null && total > 0 && outside === 0,
  };
}

/** Two scroll positions on a tab: top and middle. */
async function decorations(tab = "h") {
  const view = htmlView(tab);
  await waitInitial(tab);
  await frames(3);
  view.scrollDOM.scrollTop = 0;
  await frames(4);
  const top = decorationCheck(view);
  view.scrollDOM.scrollTop = Math.max(0, (view.scrollDOM.scrollHeight - view.scrollDOM.clientHeight) / 2);
  await frames(4);
  const middle = decorationCheck(view);
  return { tab, top, middle, pass: top.pass && middle.pass };
}

/**
 * R-12 measurement: open a ~mb MB HTML tab, wait for the first parse, then
 * type one character in the visible area and read the incremental parse and
 * decoration times from the logs.
 */
async function bigEdit(mb = 10, tab = "hbig", edits = 5) {
  const bytes = Math.round(mb * 1024 * 1024);
  setInitialDoc(tab, bigHtml(bytes));
  addTab(tab, 1);
  const view = getView(tab);
  const initial = await waitInitial(tab, 120000);
  await frames(3);
  view.scrollDOM.scrollTop = Math.max(0, (view.scrollDOM.scrollHeight - view.scrollDOM.clientHeight) / 2);
  await frames(4);
  const before = syntaxLogs();
  const txBefore = before.transactions.length;
  const decoBefore = before.decorations.length;
  const runs: Array<{ pos: number; dispatchMs: number; untilPaintedMs: number }> = [];
  let pos = 0;
  for (let i = 0; i < edits; i++) {
    pos = view.state.doc.lineAt(view.viewport.from + Math.floor((view.viewport.to - view.viewport.from) / 2)).from + 2;
    const t0 = performance.now();
    view.dispatch({ changes: { from: pos, insert: "x" }, userEvent: "input.type" });
    const tDispatch = performance.now();
    await frames(2);
    runs.push({ pos, dispatchMs: r3(tDispatch - t0), untilPaintedMs: r3(performance.now() - t0) });
    await sleep(50);
  }
  const after = syntaxLogs();
  const tx = after.transactions.slice(txBefore).filter((e) => e.tab === tab);
  const deco = after.decorations.slice(decoBefore).filter((e) => e.tab === tab);
  const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);
  const median = (xs: number[]) => (xs.length ? sorted(xs)[Math.floor(xs.length / 2)] : null);
  return {
    tab,
    docLength: view.state.doc.length,
    docMB: r3(view.state.doc.length / 1024 / 1024),
    initialParseMs: initial ? r3(initial.parseMs) : null,
    edits: runs,
    transactions: tx.map((e) => ({ ...e, parseMs: r3(e.parseMs) })),
    decorationUpdates: deco.map((e) => ({ ms: r3(e.ms), marks: e.marks, ranges: e.ranges })),
    medianMs: {
      incrementalParse: median(tx.filter((e) => e.kind === "edit").map((e) => r3(e.parseMs))),
      decorations: median(deco.map((e) => r3(e.ms))),
      dispatch: median(runs.map((r) => r.dispatchMs)),
      untilPainted: median(runs.map((r) => r.untilPaintedMs)),
    },
    visibleCheck: decorationCheck(view),
    note: "parseMs = incremental parse with the previous tree after Tree.edit; dispatchMs includes the plugin update (edit + parse + decorations).",
  };
}

// ---------- R-11: protocol path checks, SVG ----------

type ProtoCase = { id: string; url: string; expect: "allow" | "deny"; why: string };

async function protocolCases(fixture?: { ext: string; inside: string; outsideViaLink: string }) {
  const base = "http://zlext.localhost";
  const cases: ProtoCase[] = [
    { id: "C-1", url: `${base}/html/grammars/html.wasm`, expect: "allow", why: "relative path inside the extension root" },
    { id: "C-2", url: `${base}/html/languages/html/highlights.scm`, expect: "allow", why: "relative path inside the extension root" },
    { id: "C-3", url: `${base}/html/C:%2FWindows%2Fwin.ini`, expect: "deny", why: "absolute path (A-55.2)" },
    { id: "C-4", url: `${base}/html/%5C%5Cserver%5Cshare%5Cx`, expect: "deny", why: "absolute UNC path (A-55.2)" },
    { id: "C-5", url: `${base}/html/..%2Fcatppuccin%2Fextension.toml`, expect: "deny", why: "'..' to another extension in the same root (A-55.2)" },
    { id: "C-6", url: `${base}/html/languages%2F..%2F..%2F..%2Fsettings.json`, expect: "deny", why: "'..' out of the extensions folder (A-55.2)" },
    { id: "C-7", url: `${base}/..%2Fhtml/extension.toml`, expect: "deny", why: "'..' in the extension id" },
  ];
  if (fixture) {
    cases.push(
      { id: "C-8", url: `${base}/${fixture.ext}/${fixture.inside}`, expect: "allow", why: "fixture: normal file inside a temporary test extension" },
      { id: "C-9", url: `${base}/${fixture.ext}/${fixture.outsideViaLink}`, expect: "deny", why: "fixture: link inside the extension pointing outside it (04-APP-SPEC 4.11)" },
    );
  }
  const results = [];
  for (const c of cases) {
    try {
      const r = await fetch(c.url, { cache: "no-store" });
      const actual = r.ok ? "allow" : "deny";
      results.push({ ...c, status: r.status, reason: r.headers.get("X-Zedlike-Denied"), actual, pass: actual === c.expect });
    } catch (e) {
      results.push({ ...c, status: null, reason: String(e), actual: "error", pass: false });
    }
  }
  return { roots: await invoke("ext_roots"), results, pass: results.every((r) => r.pass) };
}

/** Same cases through the command (exact rel strings, no URL parsing). */
async function checkCases(list: Array<{ id: string; ext: string; rel: string; expect: "allow" | "deny" }>) {
  const out = [];
  for (const c of list) {
    const r = (await invoke("ext_check", { id: c.ext, rel: c.rel })) as { allowed: boolean; reason?: string; resolved?: string };
    out.push({ ...c, actual: r.allowed ? "allow" : "deny", reason: r.reason ?? null, pass: (r.allowed ? "allow" : "deny") === c.expect });
  }
  return { results: out, pass: out.every((r) => r.pass) };
}

/** Load an extension SVG as an <img> (img-src under the CSP). */
async function svg(rel = "icons/latte/_file.svg", id = "catppuccin-icons") {
  const url = extUrl(id, rel);
  const img = new Image();
  const loaded = await new Promise<boolean>((resolve) => {
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
  return { url, loaded, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight };
}

/** Tree state of a tab around `pos` (debugging aid for R-12). */
function treeInfo(tab = "hbig", pos?: number) {
  const view = getView(tab);
  const plugin = view.plugin(treeSitterPlugin);
  const tree = plugin?.currentTree;
  if (!tree) return { ok: false };
  const p = pos ?? view.viewport.from;
  const node = tree.rootNode.descendantForIndex(p, p);
  const chain: string[] = [];
  for (let n: typeof node | null = node; n && chain.length < 8; n = n.parent) chain.push(`${n.type}[${n.startIndex},${n.endIndex}]`);
  return {
    ok: true,
    docLength: view.state.doc.length,
    rootType: tree.rootNode.type,
    rootEnd: tree.rootNode.endIndex,
    rootHasError: tree.rootNode.hasError,
    rootChildren: tree.rootNode.childCount,
    pos: p,
    chain,
  };
}

export const phase3Api = {
  syntax: {
    load,
    queries,
    predicates,
    themeKeys,
    otherGrammars,
    decorations,
    bigEdit,
    logs: syntaxLogs,
    treeInfo,
    clearLogs: clearSyntaxLogs,
  },
  ext: {
    roots: () => invoke("ext_roots"),
    addRoot: (path: string) => invoke("dev_ext_add_root", { path }),
    check: checkCases,
    protocol: protocolCases,
    svg,
  },
};
