import { Text, type ChangeSet } from "@codemirror/state";
import { Parser, type Node, type Query, type QueryMatch, type QueryOptions, type Tree } from "web-tree-sitter";
import type { LoadedLanguage } from "./assets.ts";
import { injectionLanguage, type LanguageConfig } from "./catalog.ts";
import { themeKey } from "./grammar.ts";
import { editTree, mostlyReplaced, parseDocSliced } from "./incremental.ts";

type Span = { from: number; to: number };
type Capture = Span & { name: string; depth: number; start?: number; end?: number };
export type Highlight = Span & { key: string };
/** One injection query match: its content ranges and how Zed groups it (host, combined language, or alone). `id` follows it across edits. */
type Injection = { id: number; config: LanguageConfig; ranges: Span[]; host?: Span; combined: boolean; fresh: boolean };
type Layer = { syntax: LoadedLanguage; tree: Tree; ranges?: Span[]; depth: number; injections: Injection[] };

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

/**
 * The nodes a query should walk for the characters `from`..`to` (all of the tree when omitted). tree-sitter's query walk from a big
 * flat root costs about the whole tree even for a tiny range (a 15k-line .d.ts: 130 ms, against 0.5 ms from the top-level
 * declaration holding the range), so a tree with many top-level nodes is queried one top-level node at a time. No pinned query
 * pattern is rooted at the tree's root node, so nothing is missed (the fixtures test compares both ways).
 * shortcut: a pattern that relates two top-level siblings would not match; none of the pinned queries has one.
 */
function queryNodes(tree: Tree, from?: number, to?: number): Node[] {
  const root = tree.rootNode;
  if (root.childCount <= 32) return [root];
  if (from === undefined || to === undefined) return root.children.filter((child): child is Node => child !== null);
  let top = root.descendantForIndex(Math.max(0, from), Math.max(0, from));
  while (top && top.parent && top.parent.id !== root.id) top = top.parent;
  if (!top || top.id === root.id) return [root];
  const nodes: Node[] = [];
  for (let node: Node | null = top; node && node.startIndex <= to; node = node.nextSibling) nodes.push(node);
  return nodes;
}

function captures(layer: Layer, options: QueryOptions) {
  const query = layer.syntax.highlights;
  const nodes = queryNodes(layer.tree, (options.startIndex ?? 0) / 2, (options.endIndex ?? 0) / 2);
  const all = nodes.flatMap((node) => query.captures(node, options));
  if (!query.predicates.some((predicates) => predicates.length)) return all;
  const allowed = new Set(nodes.flatMap((node) => query.matches(node, options)).filter((match) => accepted(query, match))
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

let injectionIds = 0;
const hull = (injection: Injection): Span => ({ from: Math.min(...injection.ranges.map((range) => range.from), injection.host?.from ?? Infinity), to: Math.max(...injection.ranges.map((range) => range.to), injection.host?.to ?? -Infinity) });
const touches = (a: Span, b: Span) => a.from <= b.to && b.from <= a.to;

/** The injection query matches of a layer, over its whole tree or only where `options` limit it. */
function injectionMatches(layer: Layer, configs: LanguageConfig[], node: Node, options?: QueryOptions): Injection[] {
  const query = layer.syntax.injections;
  const result: Injection[] = [];
  if (!query) return result;
  for (const match of query.matches(node, options)) {
    if (!accepted(query, match)) continue;
    const properties = match.setProperties ?? {};
    const name = properties["injection.language"] ?? match.captures.find((capture) => capture.name === "injection.language")?.node.text;
    const config = name ? injectionLanguage(configs, name) : undefined;
    if (!config) continue;
    const ranges = match.captures.filter((capture) => capture.name === "injection.content")
      .flatMap(({ node }) => clip({ from: node.startIndex, to: node.endIndex }, layer.ranges)).filter((range) => range.to > range.from);
    if (!ranges.length) continue;
    const host = match.captures.find((capture) => capture.name === "injection.host")?.node;
    result.push({ id: injectionIds++, config, ranges, host: host && { from: host.startIndex, to: host.endIndex }, combined: "injection.combined" in properties, fresh: true });
  }
  return result;
}

/**
 * The layer's injections after an edit (Zed syntax_map.rs: only the changed ranges are queried again). Old ones that do not touch
 * `changed` (new coordinates) are kept, moved by `changes`; the rest are queried again there, and one that starts where a dropped
 * one of the same language did keeps its id, so typing inside an injected block still reuses that block's old tree.
 */
function updatedInjections(layer: Layer, configs: LanguageConfig[], previous: Injection[], changes: ChangeSet, changed: Span[]): Injection[] {
  const moved = (span: Span) => ({ from: changes.mapPos(span.from, 1), to: changes.mapPos(span.to, -1) });
  const kept: Injection[] = [];
  const dropped: Injection[] = [];
  for (const old of previous) {
    const injection = { ...old, ranges: old.ranges.map(moved), host: old.host && moved(old.host), fresh: false };
    (changed.some((range) => touches(hull(injection), range)) ? dropped : kept).push(injection);
  }
  const identity = (injection: Injection) => `${injection.config.id}:${JSON.stringify(injection.ranges)}:${JSON.stringify(injection.host)}`;
  const known = new Set(kept.map(identity));
  for (const range of changed) {
    // One more character each side: an empty range (a deletion) matches nothing.
    const from = Math.max(0, range.from - 1), to = range.to + 1;
    const found = queryNodes(layer.tree, from, to).flatMap((node) => injectionMatches(layer, configs, node, { startIndex: from * 2, endIndex: to * 2 }));
    for (const injection of found) {
      if (known.has(identity(injection))) continue;
      known.add(identity(injection));
      const again = dropped.findIndex((old) => old.config === injection.config && old.ranges[0].from === injection.ranges[0].from);
      if (again >= 0) injection.id = dropped.splice(again, 1)[0].id;
      kept.push(injection);
    }
  }
  return kept;
}

/** Zed injection groups: host first, then combined language, otherwise one group per match. */
function injectionGroups(injections: Injection[]) {
  const groups = new Map<string, { config: LanguageConfig; ranges: Span[]; untouched: boolean }>();
  for (const injection of injections.slice().sort((a, b) => a.ranges[0].from - b.ranges[0].from)) {
    const { config, host } = injection;
    const key = host ? `${config.id}:host:${host.from}:${host.to}` : injection.combined ? config.id : `${config.id}#${injection.id}`;
    const group = groups.get(key);
    if (group) { group.ranges.push(...injection.ranges); group.untouched &&= !injection.fresh; }
    else groups.set(key, { config, ranges: [...injection.ranges], untouched: !injection.fresh });
  }
  return [...groups].map(([key, group]) => ({ key, ...group, ranges: merged(group.ranges) }));
}

/**
 * K-53: the colour ranges of one Markdown fenced code block, by its info word (Zed markdown.rs:1284 language_for_name_or_extension,
 * the same name/extension rule as injections). No such language, or no copy of it, gives no ranges (plain text).
 * shortcut: markdown-it hands over only the first word of the info string, which is also where Zed's whitespace fallback ends up.
 */
export async function codeBlockHighlights(name: string, code: string, configs: LanguageConfig[],
  load: (config: LanguageConfig) => Promise<LoadedLanguage | undefined>, keys: ReadonlySet<string>): Promise<Highlight[]> {
  const config = injectionLanguage(configs, name);
  if (!config) return [];
  const doc = Text.of(code.split("\n"));
  const syntax = new SyntaxDocument(config, configs, load);
  try { return await syntax.update(doc, null, () => false) ? syntax.highlights(0, doc.length, keys) : []; } finally { syntax.destroy(); }
}

// No spec ID: bound parser work per event-loop turn, as the previous highlighter did.
export const PARSE_SLICE_MS = 8;

/** An update the caller no longer wants was noticed between slices of work. */
class Stopped extends Error {}

/** One parser per language per editor (a tree needs no parser of its own; hundreds of layers share them); an interrupted generation never publishes stale trees. */
export class SyntaxDocument {
  layers = new Map<string, Layer>();
  private parsers = new Map<LoadedLanguage, Parser>();
  private doc?: Text;

  readonly config: LanguageConfig;
  readonly configs: LanguageConfig[];
  readonly load: (config: LanguageConfig) => Promise<LoadedLanguage | undefined>;
  constructor(config: LanguageConfig, configs: LanguageConfig[], load: (config: LanguageConfig) => Promise<LoadedLanguage | undefined>) {
    this.config = config; this.configs = configs; this.load = load;
  }

  /** A layer's injections over its whole tree, one top-level node at a time with the main thread given back in between. */
  private async allInjections(layer: Layer, slice: () => Promise<boolean>): Promise<Injection[]> {
    const result: Injection[] = [];
    if (!layer.syntax.injections) return result;
    for (const node of queryNodes(layer.tree)) {
      result.push(...injectionMatches(layer, this.configs, node));
      if (await slice()) throw new Stopped();
    }
    return result;
  }

  async update(doc: Text, changes: ChangeSet | null, stop: () => boolean): Promise<boolean> {
    const next = new Map<string, Layer>();
    const usedParsers = new Set<Parser>();
    const queue: { key: string; config: LanguageConfig; ranges?: Span[]; depth: number; untouched?: boolean }[] = [{ key: "root", config: this.config, depth: 0 }];
    const seen = new Set<string>();
    let committed = false;
    try {
      let sliceStart = performance.now();
      // true: the result is no longer wanted. Gives the main thread back once a slice of work has passed (a Windows timer tick is ~15 ms).
      const slice = async () => {
        if (performance.now() - sliceStart <= PARSE_SLICE_MS) return false;
        await new Promise((resolve) => setTimeout(resolve));
        sliceStart = performance.now();
        return stop();
      };
      for (let i = 0; i < queue.length; i++) {
        const plan = queue[i];
        // Hundreds of small injected layers never trip the per-parse slice: give the main thread back between layers too.
        if (await slice()) return false;
        const identity = `${plan.config.id}:${JSON.stringify(plan.ranges ?? [{ from: 0, to: doc.length }])}`;
        if (seen.has(identity)) continue; // Break same-range/self-injection cycles without an arbitrary depth limit.
        seen.add(identity);
        const syntax = await this.load(plan.config);
        if (stop()) return false;
        if (!syntax) continue;
        const previous = this.layers.get(plan.key);
        const reuse = previous?.syntax === syntax;
        let parser = this.parsers.get(syntax);
        if (!parser) { parser = new Parser(); parser.setLanguage(syntax.language); this.parsers.set(syntax, parser); }
        usedParsers.add(parser);
        const old = reuse && changes && this.doc && !mostlyReplaced(changes) ? previous.tree.copy() : null;
        if (old && changes && this.doc) editTree(old, changes, this.doc, doc);
        // An injected layer whose text and ranges are untouched by the edit keeps its old tree, moved by the edit: no parse (Zed reuses such layers).
        if (old && changes && plan.untouched && plan.ranges && JSON.stringify(previous!.ranges?.map((range) => ({ from: changes.mapPos(range.from, 1), to: changes.mapPos(range.to, -1) }))) === JSON.stringify(plan.ranges)) {
          // shortcut: web-tree-sitter 0.27.1 answers node.text (query predicates) from the tree's own textCallback, which is the old text; point it at the new one. Recheck on a web-tree-sitter upgrade.
          (old as unknown as { textCallback: (index: number) => string | undefined }).textCallback = (index) => (index < doc.length ? doc.sliceString(index, index + 4096) : undefined);
          const layer: Layer = { syntax, tree: old, ranges: plan.ranges, depth: plan.depth, injections: [] };
          next.set(plan.key, layer);
          if (previous!.injections.length) { // most injected layers (a code block, a script) inject nothing further
            layer.injections = updatedInjections(layer, this.configs, previous!.injections, changes, []);
            for (const group of injectionGroups(layer.injections)) queue.push({ ...group, key: `${plan.key}/${group.key}`, depth: plan.depth + 1 });
          }
          continue;
        }
        const point = (position: number) => { const line = doc.lineAt(position); return { row: line.number - 1, column: position - line.from }; };
        let tree: Tree | null;
        let changed: Span[] | null = null; // where the new tree differs from the edited old one; null: no old tree to compare
        try {
          tree = await parseDocSliced(parser, doc, PARSE_SLICE_MS, stop, old,
            plan.ranges?.map((range) => ({ startIndex: range.from, endIndex: range.to, startPosition: point(range.from), endPosition: point(range.to) })));
          if (tree && old && changes) {
            changed = old.getChangedRanges(tree).map((range) => ({ from: range.startIndex, to: range.endIndex }));
            changes.iterChangedRanges((_fromA, _toA, fromB, toB) => { changed!.push({ from: fromB, to: toB }); });
          }
        } finally { old?.delete(); }
        if (!tree || stop()) { tree?.delete(); return false; }
        const layer: Layer = { syntax, tree, ranges: plan.ranges, depth: plan.depth, injections: [] };
        next.set(plan.key, layer);
        layer.injections = changed && changes && previous
          ? updatedInjections(layer, this.configs, previous.injections, changes, changed)
          : await this.allInjections(layer, slice);
        for (const group of injectionGroups(layer.injections)) queue.push({ ...group, key: `${plan.key}/${group.key}`, depth: plan.depth + 1 });
      }
      for (const layer of this.layers.values()) layer.tree.delete();
      for (const [syntax, parser] of this.parsers) if (!usedParsers.has(parser)) { parser.delete(); this.parsers.delete(syntax); }
      this.layers = next;
      this.doc = doc;
      committed = true;
      return true;
    } catch (error) {
      if (error instanceof Stopped) return false;
      throw error;
    } finally {
      if (!committed) {
        for (const layer of next.values()) layer.tree.delete();
        for (const parser of usedParsers) parser.reset();
      }
    }
  }

  /** core v0.8.1 I-4: the last committed tree of the document itself (no injections) and the text it was parsed from. */
  root(): { syntax: LoadedLanguage; tree: Tree; doc: Text } | undefined {
    const layer = this.layers.get("root");
    return layer && this.doc && { syntax: layer.syntax, tree: layer.tree, doc: this.doc };
  }

  highlights(from: number, to: number, keys: ReadonlySet<string>): Highlight[] {
    const all: Capture[] = [];
    for (const layer of this.layers.values()) {
      if (layer.ranges && !layer.ranges.some((range) => range.to > from && range.from < to)) continue; // an injected layer elsewhere (thousands in a big file)
      for (const { name, node } of captures(layer, { startIndex: from * 2, endIndex: to * 2 })) {
        for (const span of clip({ from: node.startIndex, to: node.endIndex }, layer.ranges)) {
          all.push({ ...span, name, depth: layer.depth, start: node.startIndex, end: node.endIndex });
        }
      }
    }
    return resolveHighlights(all, keys).map((span) => ({ ...span, from: Math.max(from, span.from), to: Math.min(to, span.to) })).filter((span) => span.to > span.from);
  }

  destroy(): void {
    for (const layer of this.layers.values()) layer.tree.delete();
    for (const parser of this.parsers.values()) parser.delete();
    this.layers.clear();
    this.parsers.clear();
  }
}
