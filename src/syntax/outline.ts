// core v0.8.1 I-4: the Outline list. Code items come from the pinned Zed `outline.scm` run over the editor's own tree;
// a notebook lists only the headings of its markdown cells. Pure: the tree, the query and the text come in from outside.
import type { Node, Query, Tree } from "web-tree-sitter";
import { collapseStep, expandStep, move, only, type Row } from "../workspace/tree.ts";

export type OutlineKind = "heading" | "class" | "method" | "function" | "struct" | "enum" | "member" | "interface" | "impl" | "module"
  | "type" | "variable" | "macro" | "key" | "table" | "selector" | "rule" | "element" | "test";
/** `from`..`to`: the item's range (what it holds, for nesting and the cursor); `at`: where a click puts the cursor; `line`: its 0-based line. */
export type OutlineItem = { name: string; kind: OutlineKind; level?: number; from: number; to: number; at: number; line: number; heading?: number; children: OutlineItem[] };

// The @item node type of each outline.scm pattern. null: a property (field, object key), which the Outline leaves out (I-4).
const KINDS: Record<string, OutlineKind | null> = {
  section: "heading",
  class_definition: "class", class_declaration: "class", abstract_class_declaration: "class", class_specifier: "class",
  function_definition: "function", function_declaration: "function", generator_function_declaration: "function", function_item: "function",
  function_signature_item: "function", declaration: "function",
  method_definition: "method", method_declaration: "method", method_elem: "method", function_declarator: "method", reference_declarator: "method",
  struct_item: "struct", struct_specifier: "struct", union_specifier: "struct",
  enum_item: "enum", enum_specifier: "enum", enum_declaration: "enum",
  enum_variant: "member", enumerator: "member",
  interface_declaration: "interface", trait_item: "interface", concept_definition: "interface",
  impl_item: "impl",
  mod_item: "module", namespace_definition: "module", internal_module: "module",
  type_item: "type", type_alias_declaration: "type", type_definition: "type", associated_type: "type", type_spec: "type",
  macro_definition: "macro", preproc_def: "macro", preproc_function_def: "macro",
  block_mapping_pair: "key", table: "table", table_array_element: "table",
  rule_set: "selector", media_statement: "rule", import_statement: "rule",
  element: "element", call_expression: "test",
  field_declaration: null, public_field_definition: null, field_identifier: null, pointer_declarator: null,
};
// A variable under one of these is a local one (outline.scm of JS/TS/C++ has them; VS Code leaves them out, I-4).
const LOCAL_SCOPES = new Set(["statement_block", "compound_statement", "block"]);
const OWNERS = new Set<OutlineKind>(["class", "struct", "impl", "interface"]);

function kindOf(node: Node, language: string): OutlineKind | null {
  // JSON / TOML keys are the whole outline there; in JS / TS an object key is a property.
  if (node.type === "pair") return language === "json" || language === "jsonc" || language === "toml" ? "key" : null;
  // C++ `Foo* make();` in a class: a pointer declarator around a function declarator is a method, around a name a field.
  if (node.type === "pointer_declarator") {
    let inner: Node | null = node;
    while (inner?.type === "pointer_declarator") inner = inner.childForFieldName("declarator");
    return inner?.type === "function_declarator" ? "method" : null;
  }
  const kind = KINDS[node.type];
  if (kind !== undefined) return kind;
  return "variable"; // const / let / var declarators, Go var and const specs, C++ declarators
}

function inLocalScope(node: Node): boolean {
  for (let parent = node.parent; parent; parent = parent.parent) if (LOCAL_SCOPES.has(parent.type)) return true;
  return false;
}

/** Items nested by range: each goes under the innermost earlier item that holds it. */
function nest(items: OutlineItem[]): OutlineItem[] {
  items.sort((a, b) => a.from - b.from || b.to - a.to);
  const roots: OutlineItem[] = [];
  const stack: OutlineItem[] = [];
  for (const item of items) {
    while (stack.length && !(item.from >= stack.at(-1)!.from && item.to <= stack.at(-1)!.to)) stack.pop();
    (stack.at(-1)?.children ?? roots).push(item);
    stack.push(item);
  }
  return roots;
}

/** A function directly inside a class, struct, impl or trait is a method. */
function markMethods(items: OutlineItem[], owner?: OutlineItem): void {
  for (const item of items) {
    if (item.kind === "function" && owner && OWNERS.has(owner.kind)) item.kind = "method";
    markMethods(item.children, item);
  }
}

/**
 * The outline of a tree by `query` (the language's outline.scm). The name is the text from the first to the last @name
 * capture (so `impl Display for Foo` reads "Display for Foo", a CSS selector list keeps its commas), on one line.
 * I-4 #10: a tree with many top-level nodes is queried one of them at a time (`pause` between them gives the main thread back
 * and says true when the result is no longer wanted: null is returned); the patterns rooted at the tree's root (JS `program`,
 * Go `source_file`, CSS `stylesheet`) run once from the root with maxStartDepth 0.
 * shortcut: the whole tree is queried on each update and one huge top-level node is one slice; query only the changed
 * top-level nodes if a big file shows it.
 */
export async function codeOutline(tree: Tree, query: Query, language: string, slice: (from: number, to: number) => string,
  pause: () => Promise<boolean> = async () => false): Promise<OutlineItem[] | null> {
  const items: OutlineItem[] = [];
  const seen = new Set<string>();
  const root = tree.rootNode;
  const matches = root.childCount <= 32 ? query.matches(root) : query.matches(root, { maxStartDepth: 0 });
  if (root.childCount > 32) for (const node of root.children) {
    if (!node) continue;
    matches.push(...query.matches(node));
    if (await pause()) return null;
  }
  for (const match of matches) {
    const names = match.captures.filter((capture) => capture.name === "name").map((capture) => capture.node);
    if (!names.length) continue;
    const first = names[0], last = names.at(-1)!;
    // Some patterns put @item on the declarator inside a bigger @item: the smallest one that holds the name is the item.
    const item = match.captures.filter((capture) => capture.name === "item").map((capture) => capture.node)
      .filter((node) => node.startIndex <= first.startIndex && last.endIndex <= node.endIndex)
      .sort((a, b) => (a.endIndex - a.startIndex) - (b.endIndex - b.startIndex))[0];
    if (!item) continue;
    const kind = kindOf(item, language);
    if (!kind || (kind === "variable" && inLocalScope(item))) continue;
    const key = `${item.startIndex}:${item.endIndex}:${first.startIndex}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const level = kind === "heading" ? Number(/^atx_h(\d)_marker$/.exec(item.firstNamedChild?.firstChild?.type ?? "")?.[1] ?? 1) : undefined;
    // A heading's closing `##` is not part of its text (the preview does not draw it; the same name gives the same key, I-18).
    const name = tidy(slice(first.startIndex, last.endIndex));
    items.push({ name: level ? name.replace(/(^| )#+$/, "").trimEnd() : name, kind, level, from: item.startIndex, to: item.endIndex,
      at: first.startIndex, line: first.startPosition.row, children: [] });
  }
  const roots = nest(items);
  markMethods(roots);
  return roots;
}

export type Heading = { level: number; text: string; line: number; html?: boolean };

const tidy = (text: string): string => text.replace(/\s+/g, " ").trim();
/** Every item in document order, each a copy without children. */
const flat = (list: OutlineItem[]): OutlineItem[] => list.flatMap((item) => [{ ...item, children: [] }, ...flat(item.children)]);

/** Headings in document order as sections: each runs to the next heading of the same or a higher level, and holds the ones inside. One pass. */
function nestSections(items: OutlineItem[], length: number): OutlineItem[] {
  const open: OutlineItem[] = [];
  for (const item of items) {
    while (open.length && (open.at(-1)!.level ?? 1) >= (item.level ?? 1)) open.pop()!.to = item.from;
    open.push(item);
  }
  for (const item of open) item.to = length;
  return nest(items);
}

/**
 * core v0.8.2 I-6: the outline of an HTML file is its h1~h6 elements as sections (the Markdown shape), not the tag tree.
 * `elements`: codeOutline by the html outline.scm (every element, named by its tag); `text`: the heading text of one of them.
 */
export function htmlOutline(elements: OutlineItem[], text: (element: OutlineItem) => string, length: number): OutlineItem[] {
  return nestSections(flat(elements).flatMap((item): OutlineItem[] => {
    const level = /^h([1-6])$/i.exec(item.name)?.[1];
    return level ? [{ ...item, name: tidy(text(item)), kind: "heading", level: Number(level) }] : [];
  }), length);
}

/**
 * core v0.8.2 I-24: a Markdown outline (`items`: the `#` headings, from outline.scm) with the body's HTML headings (the `html` ones
 * of `headings`, the preview's own list) put among them by line. An HTML heading's place is the start of its line.
 */
export function withHtmlHeadings(items: OutlineItem[], headings: Heading[], lineStart: (line: number) => number, length: number): OutlineItem[] {
  const html = headings.filter((heading) => heading.html);
  if (!html.length) return items;
  const added = html.map((heading): OutlineItem => {
    const at = lineStart(heading.line);
    return { name: tidy(heading.text), kind: "heading", level: heading.level, from: at, to: length, at, line: heading.line, children: [] };
  });
  return nestSections([...flat(items), ...added].sort((a, b) => a.from - b.from), length);
}

const pairValue = (object: Node | null | undefined, key: string): Node | null => {
  for (const pair of object?.namedChildren ?? []) {
    if (pair?.type !== "pair") continue;
    const name = pair.childForFieldName("key");
    if (name && stringOf(name) === key) return pair.childForFieldName("value");
  }
  return null;
};
const stringOf = (node: Node): string | null => {
  if (node.type !== "string") return null;
  try { return JSON.parse(node.text) as string; } catch { return null; }
};

/**
 * core v0.8.1 I-4: a notebook's outline is the headings of its markdown cells (by `headings`, the preview's own Markdown
 * parser), each pointing at the JSON line that holds it; code cells give nothing. `tree` is the notebook text as JSON.
 * A heading's range runs to the next heading of the same or a higher level, so the cursor and the nesting follow sections.
 */
export function notebookOutline(tree: Tree, length: number, headings: (markdown: string) => Heading[]): OutlineItem[] {
  const items: OutlineItem[] = [];
  const cells = pairValue(tree.rootNode.firstNamedChild, "cells");
  for (const cell of cells?.type === "array" ? cells.namedChildren : []) {
    if (cell?.type !== "object") continue;
    const type = pairValue(cell, "cell_type");
    if (!type || stringOf(type) !== "markdown") continue;
    const source = pairValue(cell, "source");
    const parts = (source?.type === "array" ? source.namedChildren : [source]).filter((node): node is Node => node?.type === "string");
    // The source line each part starts on, to find the part (the JSON line) a heading is on.
    const starts: number[] = [];
    let text = "";
    let lines = 0;
    for (const part of parts) {
      starts.push(lines);
      const value = stringOf(part) ?? "";
      text += value;
      lines += value.split("\n").length - 1;
    }
    for (const heading of headings(text)) {
      let index = 0;
      while (index + 1 < starts.length && starts[index + 1] <= heading.line) index++;
      const node = parts[index];
      if (!node) continue;
      // Inside the part, past one escaped line break per line before the heading (a part may hold several lines).
      let at = 1;
      for (let k = heading.line - starts[index]; k > 0; k--) {
        const next = node.text.indexOf("\\n", at);
        if (next < 0) break;
        at = next + 2;
      }
      items.push({ name: tidy(heading.text), kind: "heading", level: heading.level, from: node.startIndex + at, to: length,
        at: node.startIndex + at, line: node.startPosition.row, heading: items.length, children: [] });
    }
  }
  return nestSections(items, length);
}

/** The innermost item holding `offset`. */
export function itemAt(items: OutlineItem[], offset: number): OutlineItem[] {
  for (const item of items) if (item.from <= offset && offset <= item.to) return [item, ...itemAt(item.children, offset)];
  return [];
}

/** core v0.8.2 I-7: the path to the item of heading number `heading` (a notebook's items carry it); empty when there is none. */
export function itemOfHeading(items: OutlineItem[], heading: number): OutlineItem[] {
  for (const item of items) {
    if (item.heading === heading) return [item];
    const below = itemOfHeading(item.children, heading);
    if (below.length) return [item, ...below];
  }
  return [];
}

export type OutlineRow = { item: OutlineItem; key: string; depth: number; open: boolean; guides: { first: boolean; last: boolean }[] };

/**
 * The shown rows: an item's children follow it unless its key is in `collapsed`. A key is the parent's key plus the name and
 * its count among same-named siblings, so it survives edits elsewhere. `guides[d]` marks the rows under the open item at depth d
 * (the project tree's L-38 rule).
 */
export function outlineRows(items: OutlineItem[], collapsed: ReadonlySet<string>): OutlineRow[] {
  const rows: OutlineRow[] = [];
  const walk = (list: OutlineItem[], depth: number, parent: string) => {
    const count = new Map<string, number>();
    for (const item of list) {
      const n = count.get(item.name) ?? 0;
      count.set(item.name, n + 1);
      const key = `${parent}/${item.name}#${n}`;
      const open = item.children.length > 0 && !collapsed.has(key);
      const at = rows.length;
      rows.push({ item, key, depth, open, guides: Array.from({ length: depth }, () => ({ first: false, last: false })) });
      if (!open) continue;
      walk(item.children, depth + 1, key);
      for (let k = at + 1; k < rows.length; k++) rows[k].guides[depth] = { first: k === at + 1, last: k === rows.length - 1 };
    }
  };
  walk(items, 0, "");
  return rows;
}

/** core v0.8.2 I-10: what is folded when an Outline is first shown: the items of the second layer, so two layers show (VS Code's fold level 2). */
export const initialCollapsed = (items: OutlineItem[]): string[] =>
  outlineRows(items, new Set()).filter((row) => row.depth === 1 && row.item.children.length > 0).map((row) => row.key);

/**
 * core v0.8.2 I-8: the number of each heading, by its level, in document order. H1 has none and starts the count again; H2 is `1`,
 * H3 `1.1`, one more part per level down to H6 (five parts). A level that was skipped counts 0 (H1 then H3: `0.1`), so the
 * number of parts always says the level.
 */
export function headingNumbers(levels: number[]): string[] {
  const count = [0, 0, 0, 0, 0]; // H2..H6
  return levels.map((level) => {
    if (level <= 1) { count.fill(0); return ""; }
    count[level - 2]++;
    count.fill(0, level - 1);
    return count.slice(0, level - 1).join(".");
  });
}

/** Of heading i (document order): its Outline key, the heading it is under (-1: none), the first heading past its section. */
export type Section = { key: string; parent: number; end: number };

/**
 * core v0.8.2 I-18: the sections of a preview's headings (markdownHeadings: `#` and HTML ones, a notebook's over its cells), with
 * the keys outlineRows gives the same headings in the Outline, so a fold is one state for both.
 */
export function headingSections(headings: { level: number; text: string }[]): Section[] {
  const items = nestSections(headings.map((heading, i): OutlineItem =>
    ({ name: tidy(heading.text), kind: "heading", level: heading.level, from: i, to: i, at: i, line: 0, heading: i, children: [] })), headings.length);
  const sections: Section[] = [];
  const above: number[] = [];
  for (const row of outlineRows(items, new Set())) {
    above[row.depth] = row.item.from;
    sections[row.item.from] = { key: row.key, parent: row.depth ? above[row.depth - 1] : -1, end: row.item.to };
  }
  return sections;
}

/**
 * I-18: which of a preview's blocks are hidden. `blocks`: per drawn block in order, the number of the heading it is, or -1 (a
 * paragraph, a list, a notebook's code cell with its outputs...). A folded heading hides what follows it up to the next heading
 * of the same or a higher level; the heading itself stays.
 */
export function foldedBlocks(blocks: number[], sections: Section[], collapsed: ReadonlySet<string>): boolean[] {
  let end = -1; // hiding up to this heading; -1: not hiding
  return blocks.map((heading) => {
    if (heading >= end) end = -1;
    const hidden = end >= 0;
    if (!hidden && heading >= 0 && collapsed.has(sections[heading].key)) end = sections[heading].end;
    return hidden;
  });
}

/** core v0.8.2 I-7: the heading whose section holds block `at` (the block itself when it is one), -1 before the first heading. */
export function headingOfBlock(blocks: number[], at: number): number {
  for (let i = at; i >= 0; i--) if (blocks[i] >= 0) return blocks[i];
  return -1;
}

/** I-18: the keys to unfold so that block `at` shows: every heading it is under (a heading's own fold does not hide it). */
export function unfoldKeys(blocks: number[], sections: Section[], at: number): string[] {
  const keys: string[] = [];
  for (let heading = blocks[at] >= 0 ? sections[blocks[at]].parent : headingOfBlock(blocks, at); heading >= 0; heading = sections[heading].parent) keys.push(sections[heading].key);
  return keys;
}

export type OutlineMove = "next" | "prev" | "first" | "last" | "expand" | "collapse";

/**
 * core v0.8.1 I-18: the project tree's key rules (tree.ts move / expandStep / collapseStep) on the Outline rows: Up / Down /
 * Home / End move; Right opens a closed item, else goes to its first child; Left closes an open item, else goes to its parent.
 * Returns the key to select, or the key to open or close.
 */
export function outlineStep(rows: OutlineRow[], selected: string | null, action: OutlineMove): { select: string } | { toggle: string } | null {
  const tree: Row[] = rows.map((row) => ({
    path: row.key, depth: row.depth, isDir: row.item.children.length > 0, isRoot: false, expanded: row.open,
    segments: [{ name: row.item.name, path: row.key }], guides: row.guides, isNew: false,
  }));
  if (action === "expand" || action === "collapse") {
    const step = (action === "expand" ? expandStep : collapseStep)(tree, only(selected));
    return step?.expanded ? { toggle: step.expanded.path } : step?.select !== undefined ? { select: step.select } : null;
  }
  const moved = move(tree, only(selected), action, false);
  return moved && { select: tree[moved.index].path };
}
