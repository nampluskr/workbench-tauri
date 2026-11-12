// core v0.8.1 I-4: the Outline list. Code items come from the pinned Zed `outline.scm` run over the editor's own tree;
// a notebook lists only the headings of its markdown cells. Pure: the tree, the query and the text come in from outside.
import type { Node, Query, Tree } from "web-tree-sitter";

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
    items.push({ name: slice(first.startIndex, last.endIndex).replace(/\s+/g, " ").trim(), kind, level, from: item.startIndex, to: item.endIndex,
      at: first.startIndex, line: first.startPosition.row, children: [] });
  }
  const roots = nest(items);
  markMethods(roots);
  return roots;
}

export type Heading = { level: number; text: string; line: number };

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
    for (const part of parts) {
      starts.push(text.split("\n").length - 1);
      text += stringOf(part) ?? "";
    }
    for (const heading of headings(text)) {
      let index = 0;
      while (index + 1 < starts.length && starts[index + 1] <= heading.line) index++;
      const node = parts[index];
      if (!node) continue;
      items.push({ name: heading.text.replace(/\s+/g, " ").trim(), kind: "heading", level: heading.level, from: node.startIndex, to: length,
        at: node.startIndex + 1, line: node.startPosition.row, heading: items.length, children: [] });
    }
  }
  items.forEach((item, i) => { item.to = items.slice(i + 1).find((next) => next.level! <= item.level!)?.from ?? length; });
  return nest(items);
}

/** The innermost item holding `offset`. */
export function itemAt(items: OutlineItem[], offset: number): OutlineItem[] {
  for (const item of items) if (item.from <= offset && offset <= item.to) return [item, ...itemAt(item.children, offset)];
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
