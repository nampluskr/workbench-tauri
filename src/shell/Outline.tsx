import { createEffect, createMemo, createSignal, Index, on, onCleanup, Show } from "solid-js";
import { EditorView } from "@codemirror/view";
import type { Text } from "@codemirror/state";
import { Parser } from "web-tree-sitter";
import Icon from "./Icon.tsx";
import { resizeHandle } from "./dock.ts";
import { MARKDOWN_PREVIEW_PARSE_DEBOUNCE_MS } from "../spec/metrics.ts";
import { markdownHeadings } from "../editor/markdown.ts";
import { previewKind } from "../editor/preview-kind.ts";
import { languages, loadSyntax, outlineQuery } from "../syntax/assets.ts";
import { PARSE_SLICE_MS } from "../syntax/document.ts";
import { parsedView, syntaxOf } from "../syntax/highlight.ts";
import { parseDocSliced } from "../syntax/incremental.ts";
import { codeOutline, itemAt, notebookOutline, outlineRows, type OutlineItem, type OutlineKind } from "../syntax/outline.ts";
import { syntaxClass } from "../theme/theme.ts";
import { activeTabOf, changedDoc, historyView, type Tab } from "../workspace/context.ts";
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
const HEADING_KEYS = ["title", "number", "string", "type", "function", "keyword"]; // H1..H6, mockup F
const badge = (item: OutlineItem): [string, string] =>
  item.kind === "heading" ? [`H${item.level}`, HEADING_KEYS[(item.level ?? 1) - 1] ?? "keyword"] : BADGES[item.kind];

type Source = { tab: Tab; view: EditorView; notebook: boolean };

/** What the active tab's Outline is read from; null (an empty Outline) for tools, images, PDFs, Search and other languages. */
function sourceOf(tab: Tab | undefined): Source | null {
  if (!tab || tab.tool) return null;
  const kind = previewKind(tab.path);
  if (tab.markdown && kind !== "markdown" && kind !== "ipynb") return null; // a CSV, SVG, HTML or Mermaid preview
  const view = tab.file.view ?? historyView(tab.file); // a preview reads the view of its source
  if (!view) return null;
  if (kind === "ipynb") return { tab, view, notebook: true };
  return syntaxOf.has(view) ? { tab, view, notebook: false } : null;
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
  try { return await codeOutline(tree, query, root.syntax.config.id, (from, to) => root.doc.sliceString(from, to), pause); } finally { tree.delete(); }
}

// I-4: a folded item stays folded while its document is open.
const collapsedOf = new WeakMap<Doc, Set<string>>();

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
  const [folds, setFolds] = createSignal(0);
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
      setItems(result);
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

  const collapsed = () => {
    folds();
    const doc = source()?.tab.file.doc;
    if (!doc) return new Set<string>();
    let set = collapsedOf.get(doc);
    if (!set) collapsedOf.set(doc, (set = new Set()));
    return set;
  };
  const rows = createMemo(() => outlineRows(items(), collapsed()));
  const fold = (key: string) => {
    const set = collapsed();
    if (!set.delete(key)) set.add(key);
    setFolds((n) => n + 1);
  };

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
  /** I-4: the innermost item under the cursor; inside a folded item, that folded item (it is not opened). */
  const cursorKey = createMemo(() => {
    const path = itemAt(items(), cursor());
    const keys = new Map(rows().map((row) => [row.item, row.key]));
    for (let i = path.length - 1; i >= 0; i--) if (keys.has(path[i])) return keys.get(path[i])!;
    return null;
  });
  let list!: HTMLDivElement;
  createEffect(on(cursorKey, (key) => { if (key) list.querySelector<HTMLElement>(".tree-row.selected")?.scrollIntoView({ block: "nearest" }); }));

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
      <div class="outline-list" ref={list} role="tree">
        <Show when={rows().length} fallback={<div class="outline-empty">No outline</div>}>
          <Index each={rows()}>{(row) => {
            const [letter, key] = [() => badge(row().item)[0], () => badge(row().item)[1]];
            return (
              <div
                class="tree-row"
                classList={{ selected: cursorKey() === row().key, marked: cursorKey() === row().key }}
                role="treeitem"
                aria-level={row().depth + 1}
                aria-expanded={row().item.children.length ? row().open : undefined}
                aria-selected={cursorKey() === row().key}
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
                    <span class="icon outline-badge-slot">
                      <span class={`outline-badge ${syntaxClass(key())}`} classList={{ heading: row().item.kind === "heading" }}>{letter()}</span>
                    </span>
                    <span class="tree-label">{row().item.name}</span>
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
