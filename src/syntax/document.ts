import type { ChangeSet, Text } from "@codemirror/state";
import { Parser, type Query, type QueryMatch, type QueryOptions, type Tree } from "web-tree-sitter";
import type { LoadedLanguage } from "./assets.ts";
import { injectionLanguage, type LanguageConfig } from "./catalog.ts";
import { themeKey } from "./grammar.ts";
import { editTree, mostlyReplaced, parseDocSliced } from "./incremental.ts";

type Span = { from: number; to: number };
type Capture = Span & { name: string; depth: number; start?: number; end?: number };
export type Highlight = Span & { key: string };
type Layer = { syntax: LoadedLanguage; parser: Parser; tree: Tree; ranges?: Span[]; depth: number };

/** Zed syntax_map.rs:1472 and buffer.rs:5909: capture order, then the last mapped capture wins. */
export function resolveHighlights(captures: Capture[], keys: ReadonlySet<string>): Highlight[] {
  const sorted = captures.slice().sort((a, b) => (a.start ?? a.from) - (b.start ?? b.from) || (b.end ?? b.to) - (a.end ?? a.to) || a.depth - b.depth);
  const mapped = sorted.map((capture) => ({ ...capture, key: themeKey(capture.name, keys) }));
  const events = mapped.flatMap((capture, order) => capture.key && capture.to > capture.from
    ? [{ at: capture.from, order, start: true }, { at: capture.to, order, start: false }] : []);
  events.sort((a, b) => a.at - b.at);
  const active = new Set<number>();
  const stack: number[] = [];
  const result: Highlight[] = [];
  let previous = events[0]?.at ?? 0;
  for (let i = 0; i < events.length;) {
    const at = events[i].at;
    const top = stack.at(-1);
    if (top !== undefined && at > previous) {
      const key = mapped[top].key!;
      const last = result.at(-1);
      if (last?.to === previous && last.key === key) last.to = at;
      else result.push({ from: previous, to: at, key });
    }
    while (i < events.length && events[i].at === at) {
      const event = events[i++];
      if (event.start) {
        active.add(event.order);
        const index = stack.findIndex((order) => order > event.order);
        stack.splice(index < 0 ? stack.length : index, 0, event.order);
      } else active.delete(event.order);
    }
    while (stack.length && !active.has(stack.at(-1)!)) stack.pop();
    previous = at;
  }
  return result;
}

/** web-tree-sitter exposes this Zed predicate without evaluating it. */
function accepted(query: Query, match: QueryMatch): boolean {
  return query.predicates[match.patternIndex].every((predicate) => {
    if (predicate.operator !== "has-ancestor?") return false;
    const [capture, ...types] = predicate.operands;
    if (capture.type !== "capture") return false;
    return match.captures.filter((item) => item.name === capture.name).every(({ node }) => {
      for (let parent = node.parent; parent; parent = parent.parent) {
        if (types.some((type) => type.type === "string" && type.value === parent.type)) return true;
      }
      return false;
    });
  });
}

function captures(layer: Layer, options: QueryOptions) {
  const query = layer.syntax.highlights;
  const all = query.captures(layer.tree.rootNode, options);
  if (!query.predicates.some((predicates) => predicates.length)) return all;
  const allowed = new Set(query.matches(layer.tree.rootNode, options).filter((match) => accepted(query, match))
    .flatMap((match) => match.captures.map((capture) => `${match.patternIndex}:${capture.name}:${capture.node.id}`)));
  return all.filter((capture) => allowed.has(`${capture.patternIndex}:${capture.name}:${capture.node.id}`));
}

function clip(span: Span, ranges?: Span[]): Span[] {
  return ranges ? ranges.map((range) => ({ from: Math.max(span.from, range.from), to: Math.min(span.to, range.to) }))
    .filter((range) => range.to > range.from) : [span];
}

function merged(ranges: Span[]): Span[] {
  const result: Span[] = [];
  for (const range of ranges.sort((a, b) => a.from - b.from || a.to - b.to)) {
    const last = result.at(-1);
    if (last && range.from <= last.to) last.to = Math.max(last.to, range.to);
    else result.push({ ...range });
  }
  return result;
}

/** Zed injection groups: host first, then combined language, otherwise one group per match. */
function injections(layer: Layer, configs: LanguageConfig[]) {
  const groups = new Map<string, { config: LanguageConfig; ranges: Span[] }>();
  const query = layer.syntax.injections;
  if (!query) return [];
  // shortcut: injection queries scan the full tree; use changed ranges if injection-heavy files stall (parsers are sliced).
  for (const match of query.matches(layer.tree.rootNode)) {
    if (!accepted(query, match)) continue;
    const properties = match.setProperties ?? {};
    const name = properties["injection.language"] ?? match.captures.find((capture) => capture.name === "injection.language")?.node.text;
    const config = name ? injectionLanguage(configs, name) : undefined;
    if (!config) continue;
    const ranges = match.captures.filter((capture) => capture.name === "injection.content")
      .flatMap(({ node }) => clip({ from: node.startIndex, to: node.endIndex }, layer.ranges)).filter((range) => range.to > range.from);
    if (!ranges.length) continue;
    const host = match.captures.find((capture) => capture.name === "injection.host")?.node;
    const groupKey = host ? `${config.id}:host:${host.startIndex}:${host.endIndex}`
      : "injection.combined" in properties ? config.id : `${config.id}:${groups.size}`;
    const group = groups.get(groupKey);
    if (group) group.ranges.push(...ranges);
    else groups.set(groupKey, { config, ranges });
  }
  return [...groups.values()].map((group) => ({ ...group, ranges: merged(group.ranges) }));
}

// No spec ID: bound parser work per event-loop turn, as the previous highlighter did.
export const PARSE_SLICE_MS = 8;

/** One parser per layer per editor; an interrupted generation never publishes stale trees. */
export class SyntaxDocument {
  layers = new Map<string, Layer>();
  private doc?: Text;

  readonly config: LanguageConfig;
  readonly configs: LanguageConfig[];
  readonly load: (config: LanguageConfig) => Promise<LoadedLanguage | undefined>;
  constructor(config: LanguageConfig, configs: LanguageConfig[], load: (config: LanguageConfig) => Promise<LoadedLanguage | undefined>) {
    this.config = config; this.configs = configs; this.load = load;
  }

  async update(doc: Text, changes: ChangeSet | null, stop: () => boolean): Promise<boolean> {
    const next = new Map<string, Layer>();
    const usedParsers = new Set<Parser>();
    const newParsers = new Set<Parser>();
    const queue: { key: string; config: LanguageConfig; ranges?: Span[]; depth: number }[] = [{ key: "root", config: this.config, depth: 0 }];
    const seen = new Set<string>();
    let committed = false;
    try {
      for (let i = 0; i < queue.length; i++) {
        const plan = queue[i];
        const identity = `${plan.config.id}:${JSON.stringify(plan.ranges ?? [{ from: 0, to: doc.length }])}`;
        if (seen.has(identity)) continue; // Break same-range/self-injection cycles without an arbitrary depth limit.
        seen.add(identity);
        const syntax = await this.load(plan.config);
        if (stop()) return false;
        if (!syntax) continue;
        const previous = this.layers.get(plan.key);
        const reuse = previous?.syntax === syntax;
        const parser = reuse ? previous.parser : new Parser();
        if (!reuse) { parser.setLanguage(syntax.language); newParsers.add(parser); }
        usedParsers.add(parser);
        const old = reuse && changes && this.doc && !mostlyReplaced(changes) ? previous.tree.copy() : null;
        if (old && changes && this.doc) editTree(old, changes, this.doc, doc);
        const point = (position: number) => { const line = doc.lineAt(position); return { row: line.number - 1, column: position - line.from }; };
        let tree: Tree | null;
        try {
          tree = await parseDocSliced(parser, doc, PARSE_SLICE_MS, stop, old,
            plan.ranges?.map((range) => ({ startIndex: range.from, endIndex: range.to, startPosition: point(range.from), endPosition: point(range.to) })));
        } finally { old?.delete(); }
        if (tree) next.set(plan.key, { syntax, parser, tree, ranges: plan.ranges, depth: plan.depth });
        if (!tree || stop()) return false;
        const groups = injections(next.get(plan.key)!, this.configs);
        groups.forEach((group, index) => queue.push({ ...group, key: `${plan.key}/${index}`, depth: plan.depth + 1 }));
      }
      for (const layer of this.layers.values()) {
        layer.tree.delete();
        if (!usedParsers.has(layer.parser)) layer.parser.delete();
      }
      this.layers = next;
      this.doc = doc;
      committed = true;
      return true;
    } finally {
      if (!committed) {
        for (const layer of next.values()) layer.tree.delete();
        for (const parser of usedParsers) parser.reset();
        for (const parser of newParsers) parser.delete();
      }
    }
  }

  highlights(from: number, to: number, keys: ReadonlySet<string>): Highlight[] {
    const all: Capture[] = [];
    for (const layer of this.layers.values()) {
      for (const { name, node } of captures(layer, { startIndex: from * 2, endIndex: to * 2 })) {
        for (const span of clip({ from: node.startIndex, to: node.endIndex }, layer.ranges)) {
          all.push({ ...span, name, depth: layer.depth, start: node.startIndex, end: node.endIndex });
        }
      }
    }
    return resolveHighlights(all, keys).map((span) => ({ ...span, from: Math.max(from, span.from), to: Math.min(to, span.to) })).filter((span) => span.to > span.from);
  }

  destroy(): void {
    for (const layer of this.layers.values()) { layer.tree.delete(); layer.parser.delete(); }
    this.layers.clear();
  }
}
