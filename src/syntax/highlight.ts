// Tree-sitter highlighting for CM6 (SPEC R-9): capture -> T-27.1 theme key -> theme syntax class.
import { Parser, type Language, type Query, type Tree } from "web-tree-sitter";
import runtimeWasm from "web-tree-sitter/web-tree-sitter.wasm?url";
import { Decoration, ViewPlugin, type DecorationSet, type EditorView, type ViewUpdate } from "@codemirror/view";
import { syntaxClass } from "../theme/theme.ts";
import { syntaxKeys } from "../theme/apply.ts";
import { compileQuery, grammarPaths, loadLanguage, themeKey } from "./grammar.ts";
import { editTree, mostlyReplaced, parseDoc, parseDocSliced } from "./incremental.ts";

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
      parsing = false; // a sliced parse is waiting for its next slice and still owns the parser

      constructor(readonly view: EditorView) {
        grammar(id).then(({ language, highlights }) => {
          if (this.destroyed) return;
          // A parser per view: a sliced parse that is waiting for its next slice must not be touched by another view.
          this.parser = new Parser();
          this.parser.setLanguage(language);
          this.highlights = highlights;
          return this.parseAll();
        }, console.error);
      }

      /**
       * The full parse, in slices (R-30). If the text is replaced while it runs (a file read again, R-25) it starts over on
       * the new text. A tree comes out only when the text is still the one that was parsed.
       */
      async parseAll(): Promise<void> {
        const { view, parser } = this;
        this.parsing = true;
        let tree: Tree | null = null;
        while (parser && !tree && !this.destroyed) {
          const doc = view.state.doc;
          tree = await parseDocSliced(parser, doc, PARSE_SLICE_MS, () => this.destroyed || view.state.doc !== doc);
          if (tree && view.state.doc !== doc) {
            tree.delete(); // finished on the old text
            tree = null;
          }
        }
        this.parsing = false;
        if (this.destroyed) {
          tree?.delete();
          parser?.delete();
          return;
        }
        this.tree = tree;
        this.decorations = this.build();
        view.dispatch({}); // let CM6 pick up the decorations
      }

      update(update: ViewUpdate) {
        if (update.docChanged && this.tree && this.parser) {
          const old = this.tree;
          if (mostlyReplaced(update.changes)) {
            // shortcut: structural test only (less than half of the text kept); an incremental parse of a text that is new all
            // through is a full parse in one block. Parse it in slices again; the old colors, moved with the text, stay meanwhile.
            this.tree = null;
            old.delete();
            this.decorations = this.decorations.map(update.changes);
            void this.parseAll();
            return;
          }
          // R-11: report the changes, then parse incrementally from the edited old tree.
          editTree(old, update.changes, update.startState.doc, update.state.doc);
          this.tree = parseDoc(this.parser, update.state.doc, old);
          old.delete();
        }
        if (!this.tree) {
          if (update.docChanged) this.decorations = this.decorations.map(update.changes);
          return;
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
        if (!this.parsing) this.parser?.delete(); // a parse in flight deletes it when it sees destroyed
        this.parser = null;
      }
    },
    { decorations: (plugin) => plugin.decorations },
  );
}
