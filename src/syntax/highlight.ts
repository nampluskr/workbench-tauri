// Pinned Zed grammars and recursive injections -> one themed mark per position.
import type { ChangeSet } from "@codemirror/state";
import { Decoration, ViewPlugin, type DecorationSet, type EditorView, type ViewUpdate } from "@codemirror/view";
import { syntaxClass } from "../theme/theme.ts";
import { syntaxKeys } from "../theme/apply.ts";
import { languages, loadSyntax } from "./assets.ts";
import type { LanguageConfig } from "./catalog.ts";
import { SyntaxDocument } from "./document.ts";

const marks = new Map<string, Decoration>();
const mark = (key: string) => {
  let value = marks.get(key);
  if (!value) marks.set(key, (value = Decoration.mark({ class: syntaxClass(key) })));
  return value;
};

export function syntaxHighlighting(config: LanguageConfig) {
  return ViewPlugin.fromClass(class {
    decorations: DecorationSet = Decoration.none;
    syntax = new SyntaxDocument(config, languages, loadSyntax);
    pending: ChangeSet | null = null;
    parsing = false;
    destroyed = false;
    themeKeys = syntaxKeys;

    constructor(readonly view: EditorView) { void this.parseAll(); }

    async parseAll(): Promise<void> {
      if (this.parsing || this.destroyed) return;
      this.parsing = true;
      try {
        for (;;) {
          const doc = this.view.state.doc;
          const complete = await this.syntax.update(doc, this.pending, () => this.destroyed || this.view.state.doc !== doc);
          if (this.destroyed) return;
          if (!complete) continue;
          this.pending = null;
          this.themeKeys = syntaxKeys;
          this.decorations = this.build();
          this.view.dispatch({});
          return;
        }
      } catch (error) {
        console.error(`Syntax ${config.id}`, error);
        this.syntax.destroy();
        this.decorations = Decoration.none;
        if (!this.destroyed) this.view.dispatch({});
      } finally {
        this.parsing = false;
        if (this.destroyed) this.syntax.destroy();
      }
    }

    update(update: ViewUpdate): void {
      if (update.docChanged) {
        this.pending = this.pending ? this.pending.compose(update.changes) : update.changes;
        this.decorations = this.decorations.map(update.changes);
        void this.parseAll();
      } else if (!this.pending && (update.viewportChanged || this.themeKeys !== syntaxKeys)) {
        this.themeKeys = syntaxKeys;
        this.decorations = this.build();
      }
    }

    build(): DecorationSet {
      return Decoration.set(this.view.visibleRanges.flatMap(({ from, to }) =>
        this.syntax.highlights(from, to, syntaxKeys).map((span) => mark(span.key).range(span.from, span.to))), true);
    }

    destroy(): void {
      this.destroyed = true;
      if (!this.parsing) this.syntax.destroy();
    }
  }, { decorations: (plugin) => plugin.decorations });
}
