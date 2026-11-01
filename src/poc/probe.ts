// Development entry point for the checker: window.__poc (see
// specs/v0.1/verify/phase1/HOWTO.md). Produces the dumps SPEC R-1 and R-2 ask
// for. Expected values come from ./specExpected (independent of the
// implementation constants); anything that cannot be measured is a failure.
import { EditorSelection } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { existingView, getView, instanceId, replaceDoc } from "./editorStore";
import { activateTab, layout, moveTab, paneOf, toggleStructure } from "./layout";
import * as SPEC from "./specExpected";
import { phase2Api } from "./probe2";

function frames(n = 3): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number) =>
      left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1));
    step(n);
  });
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

// ---------- CSP ----------

const cspViolations: Array<{ directive: string; blocked: string; sample: string }> = [];
document.addEventListener("securitypolicyviolation", (e) => {
  cspViolations.push({
    directive: e.effectiveDirective,
    blocked: e.blockedURI,
    sample: e.sample,
  });
});

function csp() {
  const carrier = document.getElementById("csp-nonce-carrier") as HTMLStyleElement | null;
  const styles = [...document.querySelectorAll("style")];
  return {
    origin: location.origin,
    carrierNonce: carrier?.nonce ? "present" : "absent",
    styleElements: styles.map((s) => ({
      id: s.id || null,
      nonce: s.nonce ? (s.nonce === carrier?.nonce ? "same-as-carrier" : "other") : "none",
      rules: s.sheet ? s.sheet.cssRules.length : null,
    })),
    violations: [...cspViolations],
  };
}

// ---------- R-1 ----------

interface EditorSnapshot {
  tab: string;
  storePane: string | null;
  domSlot: string | null;
  instance: number | undefined;
  connected: boolean;
  scrollTop: number;
  selection: Array<{ anchor: number; head: number }>;
  cursor: { line: number; col: number };
}

function snapshot(tab: string): EditorSnapshot {
  const view = getView(tab);
  const head = view.state.selection.main.head;
  const line = view.state.doc.lineAt(head);
  const index = paneOf(tab);
  return {
    tab,
    storePane: index >= 0 ? layout.panes[index].id : null,
    domSlot: (view.dom.parentElement as HTMLElement | null)?.dataset.pocSlot ?? null,
    instance: instanceId(view),
    connected: view.dom.isConnected,
    scrollTop: round(view.scrollDOM.scrollTop),
    selection: view.state.selection.ranges.map((r) => ({ anchor: r.anchor, head: r.head })),
    cursor: { line: line.number, col: head - line.from + 1 },
  };
}

interface PrepareOptions {
  tab?: string;
  scrollTop?: number;
  anchor?: number;
  head?: number;
}

async function prepare(opts: PrepareOptions) {
  const tab = opts.tab ?? "a";
  activateTab(tab);
  await frames();
  const view = getView(tab);
  view.dispatch({
    selection: EditorSelection.single(opts.anchor ?? 2000, opts.head ?? 2100),
  });
  view.scrollDOM.scrollTop = opts.scrollTop ?? 1200;
  await frames();
  return { tab, view };
}

function judge(
  name: string,
  view: EditorView,
  dom: HTMLElement,
  expectedPane: string,
  before: EditorSnapshot,
  after: EditorSnapshot,
) {
  const checks = {
    // The same EditorView object and DOM node are still the store's instance.
    sameNode: view.dom === dom && existingView(before.tab) === view,
    // Only the moved tab's own instance matters (other tabs may be created).
    sameInstance: before.instance !== undefined && before.instance === after.instance,
    connectedBefore: before.connected,
    connectedAfter: after.connected,
    // The DOM really sits in the destination pane's slot, as the store says.
    inDestinationSlot: after.domSlot === expectedPane && after.storePane === expectedPane,
    scrollPreserved:
      before.scrollTop > 0 && Math.abs(before.scrollTop - after.scrollTop) <= SPEC.TOLERANCE_PX,
    selectionPreserved: JSON.stringify(before.selection) === JSON.stringify(after.selection),
    cursorPreserved:
      before.cursor.line === after.cursor.line && before.cursor.col === after.cursor.col,
  };
  return {
    test: name,
    expectedPane,
    checks,
    pass: Object.values(checks).every(Boolean),
    before,
    after,
  };
}

/** Move a tab to the other pane and check the EditorView survived. */
async function runMoveTest(opts: PrepareOptions & { toPane?: number } = {}) {
  const { tab, view } = await prepare(opts);
  const from = paneOf(tab);
  const toPane = opts.toPane ?? (from === 0 ? 1 : 0);
  const expectedPane = layout.panes[toPane]?.id ?? "(none)";
  const dom = view.dom;
  const before = snapshot(tab);
  moveTab(tab, toPane);
  await frames();
  return judge("move", view, dom, expectedPane, before, snapshot(tab));
}

/** Swap the wrapper structure (all pane components are recreated). */
async function runRestructureTest(opts: PrepareOptions = {}) {
  const { tab, view } = await prepare(opts);
  const expectedPane = layout.panes[paneOf(tab)].id;
  const dom = view.dom;
  const before = snapshot(tab);
  const structure = toggleStructure();
  await frames();
  return { structure, ...judge("restructure", view, dom, expectedPane, before, snapshot(tab)) };
}

// ---------- R-2 ----------

interface Row {
  id: string;
  check: string;
  expected: number | string;
  actual: number | string;
  pass: boolean;
}

function px(id: string, check: string, expected: number, actual: number): Row {
  return {
    id,
    check,
    expected: round(expected),
    actual: round(actual),
    pass: Number.isFinite(actual) && Math.abs(expected - actual) <= SPEC.TOLERANCE_PX,
  };
}

function unmeasurable(id: string, check: string, why: string): Row {
  return { id, check, expected: "(measurable)", actual: `unmeasurable: ${why}`, pass: false };
}

function rgba(hex: string): [number, number, number, number] {
  const h = hex.replace("#", "");
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
  return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
}

function parseCssColor(css: string): [number, number, number, number] | null {
  const m = css.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return [p[0], p[1], p[2], p[3] ?? 1];
}

function color(id: string, check: string, expectedHex: string, actualCss: string): Row {
  const e = rgba(expectedHex);
  const a = parseCssColor(actualCss);
  const pass =
    !!a &&
    e.slice(0, 3).every((v, i) => Math.abs(v - a[i]) <= 1) &&
    Math.abs(e[3] - a[3]) <= 1 / 255 + 0.001;
  return { id, check, expected: `${expectedHex}`, actual: actualCss, pass };
}

/** Font metrics of the font the editor actually uses (SPEC R-2: 그 글꼴의 메트릭). */
function actualFontMetrics(view: EditorView) {
  const cs = getComputedStyle(view.scrollDOM);
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return null;
  ctx.font = `${cs.fontSize} ${cs.fontFamily}`;
  const m = ctx.measureText("0");
  return {
    fontFamily: cs.fontFamily,
    fontSize: parseFloat(cs.fontSize),
    ch: m.width,
    descent: Math.abs(m.fontBoundingBoxDescent),
  };
}

interface Arc {
  r: number;
  sweep: 0 | 1;
}

function selectionArcs(view: EditorView): { arcs: Arc[]; fill: string | null; paths: number } {
  const paths = [...view.dom.querySelectorAll<SVGPathElement>(".zl-selectionShape path")];
  const arcs: Arc[] = [];
  for (const p of paths) {
    const d = p.getAttribute("d") ?? "";
    for (const m of d.matchAll(/A ([\d.]+) [\d.]+ 0 0 ([01])/g)) {
      arcs.push({ r: Number(m[1]), sweep: m[2] === "1" ? 1 : 0 });
    }
  }
  return {
    arcs,
    fill: paths[0] ? getComputedStyle(paths[0]).fill : null,
    paths: paths.length,
  };
}

/** Measure E-002 ~ E-030 on the active editor of pane 0 (or `tab`). */
async function measure(tab?: string) {
  const target = tab ?? layout.panes[0].active ?? "a";
  activateTab(target);
  await frames();
  const view = getView(target);
  const rows: Row[] = [];
  const font = actualFontMetrics(view);
  if (!font) {
    for (const id of SPEC.REQUIRED_R2_IDS) rows.push(unmeasurable(id, "font metrics", "no 2d canvas"));
    return finish(target, null, rows);
  }
  rows.push(px("E-010", "font size (L-08)", SPEC.FONT_SIZE_PX, font.fontSize));

  // E-002 ~ E-004: a visible line-number element (the spacer is hidden).
  const numEl = [
    ...view.dom.querySelectorAll<HTMLElement>(".cm-lineNumbers .cm-gutterElement"),
  ].find((el) => el.style.visibility !== "hidden" && el.textContent);
  if (numEl) {
    const cs = getComputedStyle(numEl);
    const padL = parseFloat(cs.paddingLeft);
    const padR = parseFloat(cs.paddingRight);
    const contentW = numEl.getBoundingClientRect().width - padL - padR;
    const digits = String(view.state.doc.lines).length;
    rows.push(
      px(
        "E-002",
        `line-number width, ${view.state.doc.lines} lines (${digits} digits)`,
        Math.max(digits, SPEC.MIN_LINE_NUMBER_DIGITS) * font.ch,
        contentW,
      ),
    );
    rows.push(px("E-003", "gutter left padding = 3 ch", SPEC.GUTTER_LEFT_CH * font.ch, padL));
    rows.push(px("E-004", "gutter right padding = 4 ch", SPEC.GUTTER_RIGHT_CH * font.ch, padR));
  } else {
    for (const id of ["E-002", "E-003", "E-004"]) {
      rows.push(unmeasurable(id, "line-number element", "not found"));
    }
  }

  // E-005: gutter right edge -> first character of the first visible line.
  const gutters = view.dom.querySelector(".cm-gutters")?.getBoundingClientRect() ?? null;
  const coords = view.coordsAtPos(view.state.doc.lineAt(view.viewport.from).from);
  if (gutters && coords) {
    rows.push(px("E-005", "gutter -> text gap = |descent|", font.descent, coords.left - gutters.right));
  } else {
    rows.push(unmeasurable("E-005", "gutter -> text gap", gutters ? "no coordsAtPos" : "no .cm-gutters"));
  }

  // E-010: line height.
  rows.push(px("E-010", "view.defaultLineHeight", SPEC.LINE_HEIGHT_PX, view.defaultLineHeight));
  const lineEl = view.contentDOM.querySelector(".cm-line");
  if (lineEl) rows.push(px("E-010", ".cm-line height", SPEC.LINE_HEIGHT_PX, lineEl.getBoundingClientRect().height));
  else rows.push(unmeasurable("E-010", ".cm-line height", "no .cm-line"));

  // E-011: current line highlight with an empty cursor.
  const probeLine = view.state.doc.lineAt(view.viewport.from).number + 3;
  const probeFrom = view.state.doc.line(probeLine).from;
  view.focus();
  view.dispatch({ selection: EditorSelection.cursor(probeFrom + 3) });
  await frames();
  const active = [...view.contentDOM.querySelectorAll<HTMLElement>(".zl-activeLine")];
  const activeGutter = view.dom.querySelector<HTMLElement>(".cm-gutterElement.zl-activeLineGutter");
  rows.push({
    id: "E-011",
    check: "empty cursor: highlighted lines / gutter cell",
    expected: "1 / yes",
    actual: `${active.length} / ${activeGutter ? "yes" : "no"}`,
    pass: active.length === 1 && !!activeGutter,
  });
  if (active[0] && activeGutter && gutters) {
    const a = active[0].getBoundingClientRect();
    const g = activeGutter.getBoundingClientRect();
    const editor = view.dom.getBoundingClientRect();
    const sc = view.scrollDOM.getBoundingClientRect();
    rows.push(px("E-011", "highlight left = editor left (gutter)", editor.left, g.left));
    rows.push(px("E-011", "content highlight starts at gutter edge", gutters.right, a.left));
    // E-011 "오른쪽 끝까지": the highlight must reach the visible right edge.
    // When a line is wider than the editor it continues to the content end,
    // so the check is "reaches at least", not equality.
    const visibleRight = sc.left + view.scrollDOM.clientWidth;
    rows.push({
      id: "E-011",
      check: "highlight reaches editor right edge (inside scrollbar)",
      expected: `>= ${round(visibleRight - SPEC.TOLERANCE_PX)}`,
      actual: round(a.right),
      pass: a.right >= visibleRight - SPEC.TOLERANCE_PX,
    });
    rows.push(px("E-011", "highlight height = 1 line", SPEC.LINE_HEIGHT_PX, a.height));
    rows.push(px("E-011", "gutter cell height = 1 line", SPEC.LINE_HEIGHT_PX, g.height));
    rows.push(color("E-011", "highlight color", SPEC.MOCHA_ACTIVE_LINE_BACKGROUND, getComputedStyle(active[0]).backgroundColor));
    rows.push(color("E-011", "gutter highlight color", SPEC.MOCHA_ACTIVE_LINE_BACKGROUND, getComputedStyle(activeGutter).backgroundColor));
  } else {
    rows.push(unmeasurable("E-011", "highlight geometry", "highlight or gutter cell missing"));
  }
  view.dispatch({ selection: EditorSelection.range(probeFrom + 1, probeFrom + 6) });
  await frames();
  const withSel = view.contentDOM.querySelectorAll(".zl-activeLine").length;
  rows.push({
    id: "E-011",
    check: "line with a non-empty selection: highlighted lines",
    expected: "0",
    actual: String(withSel),
    pass: withSel === 0,
  });

  // E-015 (a): single-line selection -> 4 outer corners of radius r.
  const single = selectionArcs(view);
  if (single.paths === 0) {
    rows.push(unmeasurable("E-015", "single-line selection shape", "no selection path"));
  } else {
    const outer = single.arcs.filter((x) => x.sweep === 1);
    rows.push({
      id: "E-015",
      check: "single line: corners (outer / inner)",
      expected: "4 / 0",
      actual: `${outer.length} / ${single.arcs.length - outer.length}`,
      pass: outer.length === 4 && single.arcs.length === 4,
    });
    for (const [i, arc] of outer.entries()) {
      rows.push(px("E-015", `single line: outer corner ${i + 1} radius`, SPEC.SELECTION_RADIUS_PX, arc.r));
    }
    if (single.fill) rows.push(color("E-015", "selection color", SPEC.MOCHA_PLAYER0_SELECTION, single.fill));
    else rows.push(unmeasurable("E-015", "selection color", "no fill"));
  }

  // E-015 (b): three-line selection, col 11 of line N -> col 21 of line N+2:
  // 6 outer corners (r) and 2 inner corners (2r).
  const l1 = view.state.doc.line(probeLine);
  const l3 = view.state.doc.line(probeLine + 2);
  view.dispatch({ selection: EditorSelection.range(l1.from + 10, l3.from + 20) });
  await frames();
  const multi = selectionArcs(view);
  if (multi.paths === 0) {
    rows.push(unmeasurable("E-015", "multi-line selection shape", "no selection path"));
  } else {
    const outer = multi.arcs.filter((x) => x.sweep === 1);
    const inner = multi.arcs.filter((x) => x.sweep === 0);
    rows.push({
      id: "E-015",
      check: "multi line: corners (outer / inner)",
      expected: "6 / 2",
      actual: `${outer.length} / ${inner.length}`,
      pass: multi.paths === 1 && outer.length === 6 && inner.length === 2,
    });
    for (const [i, arc] of outer.entries()) {
      rows.push(px("E-015", `multi line: outer corner ${i + 1} radius`, SPEC.SELECTION_RADIUS_PX, arc.r));
    }
    for (const [i, arc] of inner.entries()) {
      rows.push(px("E-015", `multi line: inner corner ${i + 1} radius (2r)`, SPEC.SELECTION_INNER_RADIUS_PX, arc.r));
    }
  }

  // E-030: vertical scrollbar thickness.
  const sc = view.scrollDOM;
  if (sc.scrollHeight > sc.clientHeight) {
    rows.push(px("E-030", "vertical scrollbar thickness", SPEC.SCROLLBAR_PX, sc.offsetWidth - sc.clientWidth));
  } else {
    rows.push(unmeasurable("E-030", "vertical scrollbar thickness", "document does not overflow"));
  }

  view.dispatch({ selection: EditorSelection.cursor(0) });
  return finish(target, font, rows);
}

function finish(
  tab: string,
  font: { fontFamily: string; fontSize: number; ch: number; descent: number } | null,
  rows: Row[],
) {
  // Every required ID must be present; a missing ID is a failure.
  for (const id of SPEC.REQUIRED_R2_IDS) {
    if (!rows.some((r) => r.id === id)) rows.push(unmeasurable(id, "required ID", "no row produced"));
  }
  const failed = rows.filter((r) => !r.pass).map((r) => `${r.id}: ${r.check}`);
  return {
    tab,
    font: font && {
      family: font.fontFamily,
      size: font.fontSize,
      ch: round(font.ch),
      descent: round(font.descent),
    },
    devicePixelRatio: window.devicePixelRatio,
    rows,
    failed,
    pass: failed.length === 0,
  };
}

/** Replace a tab's document with `lines` lines (e.g. 10000 for the 5-digit case). */
async function setLines(lines: number, tab = "a") {
  replaceDoc(tab, lines);
  await frames();
  return { tab, lines: getView(tab).state.doc.lines };
}

export function installProbe(): void {
  const api = {
    csp,
    r1: { snapshot, runMoveTest, runRestructureTest, moveTab, toggleStructure, activateTab },
    r2: { measure, setLines },
    layout: () => JSON.parse(JSON.stringify(layout)),
    ...phase2Api,
  };
  (window as unknown as { __poc: typeof api }).__poc = api;
}
