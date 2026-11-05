// Tree-sitter highlighting for CM6 (SPEC R-9): capture -> T-27.1 theme key -> theme syntax class.
import { Parser, type Language, type Query, type Tree } from "web-tree-sitter";
import runtimeWasm from "web-tree-sitter/web-tree-sitter.wasm?url";
import { Decoration, ViewPlugin, type DecorationSet, type EditorView, type ViewUpdate } from "@codemirror/view";
import { syntaxClass } from "../theme/theme.ts";
import { syntaxKeys } from "../theme/apply.ts";
import { compileQuery, grammarPaths, loadLanguage, themeKey } from "./grammar.ts";
import { editTree, parseDoc, parseDocSliced } from "./incremental.ts";

// No spec ID: a slice shorter than a frame (R-30 gives no number for how long the main thread may be held).
const PARSE_SLICE_MS = 8;

const runtime = Parser.init({ locateFile: () => runtimeWasm });

async function fetchExt(path: string): Promise<Response> {
  const response = await fetch(`http://zlext.localhost/${path}`);
  if (!response.ok) throw new Error(`zlext ${path}: ${response.status} ${await response.text()}`);
  return response;
}

// One load per extension id, shared by every editor using it.
const grammars = new Map<string, Promise<{ language: Language; highlights: Query }>>();
function grammar(id: string) {
  let loaded = grammars.get(id);
  if (!loaded) {
    const paths = grammarPaths(id);
    loaded = (async () => {
      await runtime;
      const language = await loadLanguage(new Uint8Array(await (await fetchExt(paths.wasm)).arrayBuffer()));
      return { language, highlights: compileQuery(language, await (await fetchExt(paths.highlights)).text()) };
    })();
    grammars.set(id, loaded);
  }
  return loaded;
}

const marks = new Map<string, Decoration>();
const mark = (key: string) => {
  let m = marks.get(key);
  if (!m) marks.set(key, (m = Decoration.mark({ class: syntaxClass(key) })));
  return m;
};

/** Highlighting with the grammar of installed extension `id` (e.g. "html"). */
export function syntaxHighlighting(id: string) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet = Decoration.none;
      tree: Tree | null = null;
      highlights: Query | null = null;
      parser: Parser | null = null;

      destroyed = false;

      constructor(readonly view: EditorView) {
        grammar(id).then(async ({ language, highlights }) => {
          if (this.destroyed) return;
          // A parser per view: a sliced parse that is waiting for its next slice must not be touched by another view.
          const parser = new Parser();
          parser.setLanguage(language);
          const tree = await parseDocSliced(parser, view.state.doc, PARSE_SLICE_MS, () => this.destroyed); // the only full parse
          if (!tree) return parser.delete();
          [this.parser, this.highlights, this.tree] = [parser, highlights, tree];
          this.decorations = this.build();
          view.dispatch({}); // let CM6 pick up the first decorations
        }, console.error);
      }

      update(update: ViewUpdate) {
        if (update.docChanged && this.tree && this.parser) {
          // R-11: report the changes, then parse incrementally from the edited old tree.
          const old = this.tree;
          editTree(old, update.changes, update.startState.doc, update.state.doc);
          this.tree = parseDoc(this.parser, update.state.doc, old);
          old.delete();
        }
        if (update.docChanged || update.viewportChanged) this.decorations = this.build();
      }

      // Decorations only for the visible ranges.
      build(): DecorationSet {
        if (!this.tree || !this.highlights) return Decoration.none;
        const ranges = [];
        for (const { from, to } of this.view.visibleRanges) {
          // QueryOptions indexes are bytes = UTF-16 code units x 2; Node indexes are code units.
          for (const { name, node } of this.highlights.captures(this.tree.rootNode, { startIndex: from * 2, endIndex: to * 2 })) {
            const key = themeKey(name, syntaxKeys);
            if (key && node.endIndex > node.startIndex) ranges.push(mark(key).range(node.startIndex, node.endIndex));
          }
        }
        return Decoration.set(ranges, true);
      }

      destroy() {
        this.destroyed = true;
        this.tree?.delete();
        this.parser?.delete();
      }
    },
    { decorations: (plugin) => plugin.decorations },
  );
}
