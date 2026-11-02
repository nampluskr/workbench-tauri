// CM6 <-> Tree-sitter bridge (SPEC R-10, R-12; 03-tauri R-03, R-37).
//  - Every document transaction is turned into Tree.edit() calls and the
//    parse is given the previous tree (incremental parsing).
//  - Highlight marks are built only for the visible ranges (view.visibleRanges).
//  - Capture name -> theme syntax key by the T-27.1 rule (longest key that
//    matches at a dot boundary; none = no style, editor.foreground).
//  - No CM6 language package (Lezer) is installed or configured, so CM6 does
//    no highlighting of its own.
import { StateEffect, type ChangeSet, type Text, type Extension } from "@codemirror/state";
import { Decoration, ViewPlugin, type DecorationSet, type EditorView, type ViewUpdate } from "@codemirror/view";
import { Edit, Parser, type Point, type Query, type Tree } from "web-tree-sitter";
import { loadHtml } from "./grammar";
import { currentTheme, themeSyntax, type ThemeName } from "../theme/theme";
import { injectStyles } from "../shell/styles";

/** Re-render effect (grammar loaded, theme changed). */
export const syntaxRefresh = StateEffect.define<null>();

// ---------- T-27.1 ----------

export function syntaxKeyFor(capture: string, keys: ReadonlySet<string>): string | null {
  const parts = capture.split(".");
  for (let n = parts.length; n >= 1; n--) {
    const k = parts.slice(0, n).join(".");
    if (keys.has(k)) return k;
  }
  return null;
}

const sanitize = (k: string) => k.replace(/[^A-Za-z0-9_-]/g, "-");
const injected = new Set<string>();

/** CSS variables + classes for the current theme's syntax keys (CSP: nonce'd sheet + CSSOM vars). */
export function applySyntaxTheme(name: ThemeName): void {
  const syntax = themeSyntax(name);
  const root = document.documentElement.style;
  const rules: string[] = [];
  for (const [key, st] of Object.entries(syntax)) {
    const s = sanitize(key);
    if (st.color) root.setProperty(`--zl-syntax-${s}`, st.color);
    else root.removeProperty(`--zl-syntax-${s}`);
    root.setProperty(`--zl-syntax-${s}-fs`, st.font_style ?? "normal");
    root.setProperty(`--zl-syntax-${s}-fw`, st.font_weight ? String(st.font_weight) : "inherit");
    if (!injected.has(s)) {
      injected.add(s);
      rules.push(
        `.zl-syn-${s} { color: var(--zl-syntax-${s}); font-style: var(--zl-syntax-${s}-fs); font-weight: var(--zl-syntax-${s}-fw); }`,
      );
    }
  }
  if (rules.length) injectStyles(rules.join("\n"));
}

function syntaxKeys(): Set<string> {
  return new Set(Object.keys(themeSyntax(currentTheme()?.name ?? "Catppuccin Mocha")));
}

// ---------- incremental edits ----------

function pointAt(doc: Text, pos: number): Point {
  const line = doc.lineAt(pos);
  return { row: line.number - 1, column: pos - line.from };
}

/** Tree-sitter edits for a CM6 change set, in application order. */
export function editsFor(changes: ChangeSet, oldDoc: Text, newDoc: Text): Edit[] {
  const edits: Edit[] = [];
  changes.iterChanges((fromA, toA, fromB, toB) => {
    const startPosition = pointAt(newDoc, fromB);
    const lineFrom = oldDoc.lineAt(fromA);
    const lineTo = oldDoc.lineAt(toA);
    const oldEndPosition =
      lineFrom.number === lineTo.number
        ? { row: startPosition.row, column: startPosition.column + (toA - fromA) }
        : { row: startPosition.row + (lineTo.number - lineFrom.number), column: toA - lineTo.from };
    edits.push(
      new Edit({
        startIndex: fromB,
        oldEndIndex: fromB + (toA - fromA),
        newEndIndex: toB,
        startPosition,
        oldEndPosition,
        newEndPosition: pointAt(newDoc, toB),
      }),
    );
  });
  return edits;
}

function reader(doc: Text) {
  return (index: number) => {
    if (index >= doc.length) return undefined;
    return doc.sliceString(index, Math.min(doc.length, index + 65536));
  };
}

// ---------- log for the probe (SPEC R-12) ----------

export interface TxLogEntry {
  tab: string;
  tx: number;
  kind: "initial" | "edit";
  changes: number;
  treeEditCalls: number;
  oldTreePassed: boolean;
  fullReparse: boolean;
  parseMs: number;
  docLength: number;
}

export interface DecoLogEntry {
  tab: string;
  ms: number;
  ranges: Array<{ from: number; to: number }>;
  marks: number;
  markFrom: number | null;
  markTo: number | null;
}

const txLog: TxLogEntry[] = [];
const decoLog: DecoLogEntry[] = [];
const LOG_LIMIT = 200;
const push = <T>(arr: T[], e: T) => {
  arr.push(e);
  if (arr.length > LOG_LIMIT) arr.shift();
};

export function syntaxLogs() {
  return { transactions: [...txLog], decorations: [...decoLog] };
}

export function clearSyntaxLogs() {
  txLog.length = 0;
  decoLog.length = 0;
}

// ---------- plugin ----------

class TreeSitterHighlighter {
  decorations: DecorationSet = Decoration.none;
  private parser: Parser | null = null;
  private query: Query | null = null;
  private tree: Tree | null = null;
  private tx = 0;
  private readonly view: EditorView;

  private get tab(): string {
    return this.view.dom.dataset.pocTab ?? "?";
  }

  constructor(view: EditorView) {
    this.view = view;
    loadHtml().then((g) => {
      const q = g.queries.highlights.query;
      if (!g.language || !q) return;
      this.parser = new Parser();
      this.parser.setLanguage(g.language);
      this.query = q;
      const t0 = performance.now();
      this.tree = this.parser.parse(reader(view.state.doc));
      push(txLog, {
        tab: this.tab,
        tx: this.tx,
        kind: "initial",
        changes: 0,
        treeEditCalls: 0,
        oldTreePassed: false,
        fullReparse: true,
        parseMs: performance.now() - t0,
        docLength: view.state.doc.length,
      });
      view.dispatch({ effects: syntaxRefresh.of(null) });
    });
  }

  update(u: ViewUpdate) {
    if (!this.parser || !this.tree) return;
    if (u.docChanged) {
      // One Tree.edit per change, in order, for every transaction.
      let calls = 0;
      let changes = 0;
      for (const tr of u.transactions) {
        if (!tr.docChanged) continue;
        this.tx++;
        for (const e of editsFor(tr.changes, tr.startState.doc, tr.state.doc)) {
          this.tree.edit(e);
          calls++;
        }
        changes++;
      }
      const t0 = performance.now();
      const old = this.tree;
      const next = this.parser.parse(reader(u.state.doc), old);
      const parseMs = performance.now() - t0;
      if (next) {
        old.delete();
        this.tree = next;
      }
      push(txLog, {
        tab: this.tab,
        tx: this.tx,
        kind: "edit",
        changes,
        treeEditCalls: calls,
        oldTreePassed: true,
        fullReparse: false,
        parseMs,
        docLength: u.state.doc.length,
      });
    }
    const refresh = u.transactions.some((t) => t.effects.some((e) => e.is(syntaxRefresh)));
    if (u.docChanged || u.viewportChanged || refresh) this.decorations = this.build(u.view);
  }

  private build(view: EditorView): DecorationSet {
    if (!this.tree || !this.query) return Decoration.none;
    const t0 = performance.now();
    const keys = syntaxKeys();
    const marks = [];
    const ranges = view.visibleRanges.map((r) => ({ from: r.from, to: r.to }));
    let lo: number | null = null;
    let hi: number | null = null;
    for (const r of ranges) {
      // web-tree-sitter 0.27.1: Node/Edit indices are UTF-16 code units, but
      // QueryOptions.startIndex/endIndex are passed to C unconverted, i.e. in
      // bytes of the UTF-16 text (2 per code unit). Measured in Phase 3.
      for (const c of this.query.captures(this.tree.rootNode, { startIndex: r.from * 2, endIndex: r.to * 2 })) {
        if (c.name.startsWith("_")) continue;
        const key = syntaxKeyFor(c.name, keys);
        if (!key) continue;
        // Clip to the visible range: only visible text gets marks.
        const from = Math.max(c.node.startIndex, r.from);
        const to = Math.min(c.node.endIndex, r.to);
        if (to <= from) continue;
        marks.push(Decoration.mark({ class: `zl-syn-${sanitize(key)}`, attributes: { "data-capture": c.name } }).range(from, to));
        lo = lo === null ? from : Math.min(lo, from);
        hi = hi === null ? to : Math.max(hi, to);
      }
    }
    const set = Decoration.set(marks, true);
    push(decoLog, { tab: this.tab, ms: performance.now() - t0, ranges, marks: marks.length, markFrom: lo, markTo: hi });
    return set;
  }

  destroy() {
    this.tree?.delete();
    this.parser?.delete();
  }

  /** Current syntax tree (for the probe). */
  get currentTree() {
    return this.tree;
  }
}

export const treeSitterPlugin = ViewPlugin.fromClass(TreeSitterHighlighter, {
  decorations: (v) => v.decorations,
});

export function htmlSyntax(): Extension {
  return treeSitterPlugin;
}
