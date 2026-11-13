import { batch, createEffect, createMemo, createSignal, Index, on, onCleanup, Show } from "solid-js";
import { EditorView } from "@codemirror/view";
import type { Text } from "@codemirror/state";
import { Parser } from "web-tree-sitter";
import { openContextMenu } from "./AppMenu.tsx";
import Icon from "./Icon.tsx";
import { chain } from "./chain.ts";
import { resizeHandle } from "./dock.ts";
import type { MenuEntry } from "./menu.ts";
import { notify } from "./toast.ts";
import { MARKDOWN_PREVIEW_PARSE_DEBOUNCE_MS } from "../spec/metrics.ts";
import { htmlHeadingText, markdownHeadings } from "../editor/markdown.ts";
import { previewKind } from "../editor/preview-kind.ts";
import { languages, loadSyntax, outlineQuery } from "../syntax/assets.ts";
import { PARSE_SLICE_MS } from "../syntax/document.ts";
import { parsedView, syntaxOf } from "../syntax/highlight.ts";
import { parseDocSliced } from "../syntax/incremental.ts";
import { codeOutline, headingNumbers, htmlOutline, initialCollapsed, itemAt, itemOfHeading, notebookOutline, outlineRows, outlineStep, withHtmlHeadings, type OutlineItem, type OutlineKind, type OutlineMove } from "../syntax/outline.ts";
import { saveSetting, settings } from "../settings/load.ts";
import { HEADING_KEYS, syntaxClass } from "../theme/theme.ts";
import { activeTabOf, changedDoc, foldedKeys, foldsChanged, historyView, setFolded, type Tab } from "../workspace/context.ts";
import type { Doc } from "../workspace/doc.ts";
import { editorContext, outlineOpen, outlineWidth, resizeOutline } from "../workspace/store.ts";

// core v0.8.1 I-4: the Outline bar (mockup F). Rows are the project tree's rows (.tree-row and its parts), so they share its
// sizes, guides and colors; the badge is a letter in a syntax color of the UI theme (all bundled themes have these keys).

/** Badge letter and syntax key of each kind (the report's table). Headings use their level. */
const BADGES: Record<Exclude<OutlineKind, "heading">, [string, string]> = {
  class: ["C", "type"], method: ["m", "function"], function: ["f", "keyword"], struct: ["S", "type"], enum: ["E", "type"],
  member: ["e", "constant"], interface: ["I", "type"], impl: ["i", "type"], module: ["N", "title"], type: ["T", "type"],
  variable: ["v", "constant"], macro: ["M", "keyword"], key: ["k", "property"], table: ["[]", "title"], selector: ["s", "tag"],
  rule: ["@", "keyword"], element: ["<>", "tag"], test: ["t", "string"],
};
const badge = (item: OutlineItem): [string, string] =>
  item.kind === "heading" ? [`H${item.level}`, HEADING_KEYS[(item.level ?? 1) - 1] ?? "keyword"] : BADGES[item.kind];

/** `headings` (core v0.8.2 I-6, I-8): a heading Outline: a Markdown, notebook or HTML file, by its extension as the previews are. */
type Source = { tab: Tab; view: EditorView; notebook: boolean; headings: boolean };

/** What the active tab's Outline is read from; null (an empty Outline) for tools, images, PDFs, Search and other languages. */
function sourceOf(tab: Tab | undefined): Source | null {
  if (!tab || tab.tool) return null;
  const kind = previewKind(tab.path);
  if (tab.markdown && kind !== "markdown" && kind !== "ipynb") return null; // a CSV, SVG, HTML or Mermaid preview
  const view = tab.file.view ?? historyView(tab.file); // a preview reads the view of its source
  if (!view) return null;
  if (kind === "ipynb") return { tab, view, notebook: true, headings: true };
  return syntaxOf.has(view) ? { tab, view, notebook: false, headings: kind === "markdown" || kind === "html" } : null;
}

/** What the items of a source were made from: the editor's committed tree, or a notebook's text. A new one means update. */
const markOf = (source: Source): unknown => source.notebook ? source.view.state.doc : syntaxOf.get(source.view)?.root()?.tree;

/** The items of `source`, or null when `stale` turned true on the way (a newer update is coming). */
async function compute(source: Source, stale: () => boolean): Promise<OutlineItem[] | null> {
  let sliceStart = performance.now();
  const pause = async () => {
    if (performance.now() - sliceStart <= PARSE_SLICE_MS) return stale();
    await new Promise((resolve) => setTimeout(resolve));
    sliceStart = performance.now();
    return stale();
  };
  if (source.notebook) {
    // The notebook editor has no grammar: its text is parsed as JSON here, for the line of each heading.
    // shortcut: a full parse per update; keep the old tree and edit it if big notebooks show it.
    const json = languages.find((config) => config.id === "json");
    const syntax = json && (await loadSyntax(json));
    if (!syntax || stale()) return syntax ? null : [];
    const doc: Text = source.view.state.doc;
    const parser = new Parser();
    try {
      parser.setLanguage(syntax.language);
      const tree = await parseDocSliced(parser, doc, PARSE_SLICE_MS, stale);
      if (!tree) return null;
      try { return notebookOutline(tree, doc.length, markdownHeadings); } finally { tree.delete(); }
    } finally { parser.delete(); }
  }
  const syntax = syntaxOf.get(source.view)!;
  const first = syntax.root();
  if (!first) return []; // not parsed yet: its commit updates the Outline
  const query = await outlineQuery(first.syntax);
  if (!query) return [];
  const root = syntax.root();
  if (!root || stale()) return null;
  const tree = root.tree.copy(); // the next commit deletes the editor's tree while this one is still being read
  let items: OutlineItem[] | null;
  try { items = await codeOutline(tree, query, root.syntax.config.id, (from, to) => root.doc.sliceString(from, to), pause); } finally { tree.delete(); }
  // core v0.8.2 I-6: an .html / .htm file lists its h1~h6 (the elements the query found, so nothing is read again), not its tags.
  if (items && source.headings && root.syntax.config.id === "html") {
    return htmlOutline(items, (item) => htmlHeadingText(root.doc.sliceString(item.at + item.name.length, item.to)), root.doc.length);
  }
  if (!items || root.syntax.config.id !== "markdown") return items;
  // core v0.8.2 I-24: the preview draws the body's HTML headings, so they are listed too (parsed only when the text has one).
  const text = root.doc.toString();
  return /<h[1-6][\s>]/i.test(text) ? withHtmlHeadings(items, markdownHeadings(text), (line) => root.doc.line(Math.min(line + 1, root.doc.lines)).from, root.doc.length) : items;
}

// core v0.8.2 I-10: the documents whose Outline was shown once: the first time, only two layers are open. The folds themselves
// (I-4: kept while the document is open) are the document's, shared with its previews (workspace/context.ts foldedKeys).
const shownOnce = new WeakSet<Doc>();
const NO_FOLDS: ReadonlySet<string> = new Set();

export default function OutlineBar() {
  // Read the tabs here, not through one memo of the tab: a tab gets its view later, in a copy of the same list.
  const activeTab = () => activeTabOf(editorContext().pane());
  const source = createMemo(() => {
    // A preview's source view appears when the file is read (changedDoc) or, with a grammar, when it is first parsed.
    parsedView();
    changedDoc();
    return outlineOpen() ? sourceOf(activeTab()) : null;
  }, null, { equals: (a, b) => a?.tab.file === b?.tab.file && a?.view === b?.view }); // a pinned, kept or renamed tab is a copy of the same file
  const [items, setItems] = createSignal<OutlineItem[]>([]);
  let timer = 0;
  let generation = 0;
  let shown: unknown = null; // markOf the source when the shown items were made
  let wanted: unknown = null; // markOf the source when the pending update was scheduled
  let current: Source | null = null;
  const cancel = () => { clearTimeout(timer); generation++; };
  onCleanup(cancel);

  const refresh = (src: Source, delay: number) => {
    cancel();
    const id = generation;
    wanted = markOf(src);
    timer = window.setTimeout(async () => {
      const mark = markOf(src);
      const result = await compute(src, () => id !== generation);
      if (id !== generation || !result) return;
      shown = mark;
      const doc = src.tab.file.doc;
      batch(() => {
        if (result.length && !shownOnce.has(doc)) { shownOnce.add(doc); setFolded(doc, initialCollapsed(result), true); }
        setItems(result);
      });
    }, delay);
  };

  // A new tab: at once (none: nothing pending may still fill the list). Edits: a code file once its parse is committed, a
  // notebook once its text changed (also from another view of it), after I-082's parse debounce. An update already on its
  // way for the same mark is not started again (A-4: other editors' commits re-run this).
  createEffect(() => {
    const src = source();
    if (src) { if (src.notebook) changedDoc(); else parsedView(); }
    if (src !== current) {
      current = src;
      shown = wanted = null;
      setItems([]);
      return src ? refresh(src, 0) : cancel();
    }
    const mark = src && markOf(src);
    if (src && mark !== shown && mark !== wanted) refresh(src, MARKDOWN_PREVIEW_PARSE_DEBOUNCE_MS);
  });

  const doc = () => source()?.tab.file.doc;
  const collapsed = () => {
    foldsChanged();
    const d = doc();
    return d ? foldedKeys(d) : NO_FOLDS;
  };
  const rows = createMemo(() => outlineRows(items(), collapsed()));
  /** Every item in document order with its key, folded or not: once per new items, for the numbers, Collapse All and the cursor's path. */
  const allRows = createMemo(() => outlineRows(items(), NO_FOLDS));
  const keyOf = createMemo(() => new Map(allRows().map((row) => [row.item, row.key])));
  const fold = (key: string) => { const d = doc(); if (d) setFolded(d, [key], !collapsed().has(key)); };
  /** core v0.8.2 I-8: the number of each heading item when the numbers are shown, else null (the badges). */
  const numbers = createMemo(() => {
    if (!source()?.headings || !settings().outline_heading_numbers) return null;
    const all = allRows();
    const list = headingNumbers(all.map((row) => row.item.level ?? 1));
    return new Map(all.map((row, i) => [row.item, list[i]]));
  });

  /** The cursor: the editor's main selection head; for a preview, the line its own position shows (block and Outline clicks). */
  const cursor = createMemo(() => {
    const src = source();
    if (!src) return -1;
    const position = src.tab.file.position?.();
    if (src.tab.file.view) return src.tab.file.view.state.selection.main.head;
    const line = Number(position?.split(":")[0]);
    const doc = src.view.state.doc;
    return line >= 1 && line <= doc.lines ? doc.line(line).from : -1;
  });
  /** core v0.8.2 I-7: a notebook preview has no source line: its place is the heading of the clicked block or Outline row. */
  const heading = () => { const src = source(); return src?.notebook ? src.tab.file.heading : undefined; };
  const cursorPath = createMemo(() => { const at = heading(); return at ? itemOfHeading(items(), at()) : itemAt(items(), cursor()); });
  // I-7: a new place inside folded items opens them, so its own row shows (as VS Code's Outline follows the cursor). A fold made
  // after that stays until the place changes again.
  createEffect(on(() => heading()?.() ?? cursor(), () => {
    const d = doc();
    if (!d) return;
    const closed = cursorPath().slice(0, -1).map((item) => keyOf().get(item)!).filter((key) => collapsed().has(key));
    if (closed.length) setFolded(d, closed, false);
  }, { defer: true }));
  /** I-4: the innermost item under the cursor; inside a folded item (folded after the cursor came there), that folded item. */
  const cursorKey = createMemo(() => {
    const path = cursorPath();
    const keys = new Map(rows().map((row) => [row.item, row.key]));
    for (let i = path.length - 1; i >= 0; i--) if (keys.has(path[i])) return keys.get(path[i])!;
    return null;
  });
  let list!: HTMLDivElement;
  // core v0.8.1 I-18: while the list has focus the keys pick a row; the cursor (I-4) takes over again when focus leaves.
  const [picked, setPicked] = createSignal<string | null>(null);
  const shownKey = () => { const key = picked(); return key !== null && rows().some((row) => row.key === key) ? key : cursorKey(); };
  const listFocused = () => list.contains(document.activeElement);
  const scrollToShown = () => list.querySelector<HTMLElement>(".tree-row.selected")?.scrollIntoView({ block: "nearest" });
  createEffect(on(cursorKey, (key) => { if (key && !listFocused()) scrollToShown(); }));

  const go = (item: OutlineItem) => {
    const src = source();
    if (!src) return;
    const { view, reveal, element } = src.tab.file;
    if (view) {
      const at = Math.min(item.at, view.state.doc.length); // the items may be a parse behind the text
      view.dispatch({ selection: { anchor: at }, effects: EditorView.scrollIntoView(at, { y: "center" }) });
      view.focus();
    } else {
      reveal?.(item.line, item.heading);
      element?.focus();
    }
  };

  const press = (action: OutlineMove | "confirm") => {
    if (action === "confirm") {
      const row = rows().find((r) => r.key === shownKey());
      if (row) go(row.item); // as a click
      return;
    }
    const step = outlineStep(rows(), shownKey(), action);
    if (!step) return;
    if ("toggle" in step) { setPicked(step.toggle); fold(step.toggle); } else setPicked(step.select);
    scrollToShown();
  };
  // Registered when the bar is made (once, like the Sidebar's), so it sits in front of the menu and tree handlers.
  for (const [name, action] of [["menu::SelectNext", "next"], ["menu::SelectPrevious", "prev"], ["menu::SelectFirst", "first"], ["menu::SelectLast", "last"],
    ["menu::SelectChild", "expand"], ["menu::SelectParent", "collapse"], ["menu::Confirm", "confirm"]] as const) {
    chain(name, listFocused, () => press(action));
  }

  /** core v0.8.2 I-9: Expand All and Collapse All for every Outline; a heading Outline also picks badges or numbers (I-8) and the heading colours (I-11). */
  const openMenu = (e: MouseEvent) => {
    const src = source();
    const d = doc();
    if (!src || !d) return;
    const save = (key: "outline_heading_numbers" | "outline_heading_colors", value: boolean) => void saveSetting(key, value).catch((error) => notify([String(error)]));
    const folding: MenuEntry[] = [
      { label: "Expand All", run: () => setFolded(d, foldedKeys(d), false) },
      { label: "Collapse All", run: () => setFolded(d, allRows().filter((row) => row.item.children.length > 0).map((row) => row.key), true) },
    ];
    const { outline_heading_numbers: byNumber, outline_heading_colors: colors } = settings();
    openContextMenu({ x: e.clientX, y: e.clientY }, !src.headings ? folding : [
      { label: "Show Icons", checked: !byNumber, run: () => save("outline_heading_numbers", false) },
      { label: "Show Numbers", checked: byNumber, run: () => save("outline_heading_numbers", true) },
      "separator",
      ...folding,
      "separator",
      { label: "Show Heading Colors", checked: colors, run: () => save("outline_heading_colors", !colors) },
    ]);
  };

  const name = () => { const path = source() && activeTab()?.path; return path ? path.slice(path.lastIndexOf("\\") + 1) : ""; };
  return (
    <aside class="outline-bar" hidden={!outlineOpen()}>
      <div class="dock-resize-handle" ref={(el) => resizeHandle(el, { width: outlineWidth, setWidth: resizeOutline, selector: ".outline-bar" })} />
      {/* Mockup F: "Outline · file name". */}
      <div class="outline-header">
        <Icon name="list_tree" />
        <span>Outline</span>
        <Show when={name()}><span>·</span><span class="outline-doc">{name()}</span></Show>
      </div>
      <div class="outline-list" ref={list} role="tree" tabindex="0" data-keymap-context="OutlinePanel menu" onContextMenu={openMenu}
        onFocusOut={(e) => { if (!list.contains(e.relatedTarget as Node | null)) setPicked(null); }}>
        <Show when={rows().length} fallback={<div class="outline-empty">No outline</div>}>
          <Index each={rows()}>{(row) => {
            const [letter, key] = [() => badge(row().item)[0], () => badge(row().item)[1]];
            return (
              <div
                class="tree-row"
                classList={{ selected: shownKey() === row().key, marked: shownKey() === row().key }}
                role="treeitem"
                aria-level={row().depth + 1}
                aria-expanded={row().item.children.length ? row().open : undefined}
                aria-selected={shownKey() === row().key}
                onClick={() => go(row().item)}
              >
                <div class="tree-guides">
                  <Index each={row().guides}>{(guide) => <span class="tree-guide" classList={{ first: guide().first, last: guide().last }} />}</Index>
                </div>
                <div class="tree-item">
                  <Index each={row().guides}>{() => <span class="tree-indent" />}</Index>
                  <div class="tree-main">
                    <Show when={row().item.children.length} fallback={<span class="icon" />}>
                      <span class="outline-toggle" onClick={(e) => { e.stopPropagation(); fold(row().key); }}>
                        <Icon name={row().open ? "chevron_down" : "chevron_right"} />
                      </span>
                    </Show>
                    <Show when={numbers()} fallback={
                      <span class="icon outline-badge-slot">
                        <span class={`outline-badge ${syntaxClass(key())}`} classList={{ heading: row().item.kind === "heading" }}>{letter()}</span>
                      </span>
                    }>
                      <span class={`outline-number ${syntaxClass(key())}`}>{numbers()!.get(row().item)}</span>
                    </Show>
                    {/* I-11: the level, for Show Heading Colors (app.css) */}
                    <span class={row().item.kind === "heading" ? `tree-label heading-${row().item.level ?? 1}` : "tree-label"}>{row().item.name}</span>
                  </div>
                </div>
              </div>
            );
          }}</Index>
        </Show>
      </div>
    </aside>
  );
}
