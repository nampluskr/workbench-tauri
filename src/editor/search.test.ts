import test from "node:test";
import assert from "node:assert/strict";
import { EditorSelection, EditorState, Transaction, type TransactionSpec } from "@codemirror/state";
import { EditorView, showPanel, type Panel } from "@codemirror/view";
import { history, undo } from "@codemirror/commands";
import { SearchQuery, getSearchQuery, search, setSearchQuery, selectSelectionMatches } from "@codemirror/search";
import { addNextOccurrence, documentSearch, SEARCH_COMMANDS, skipOccurrence, toggleScope, toggleSearch } from "./search.ts";

function target(doc: string, locked = false) {
  const view = {
    state: EditorState.create({ doc, extensions: [search(), history(), EditorState.allowMultipleSelections.of(true), EditorState.readOnly.of(locked)] }),
    dispatch(tr: Transaction | TransactionSpec) { view.state = tr instanceof Transaction ? tr.state : view.state.update(tr).state; },
  };
  return view;
}
const run = (name: string, view: ReturnType<typeof target>) => SEARCH_COMMANDS.find(([action]) => action === `editor::${name}`)![1](view as unknown as EditorView);
const ranges = (view: ReturnType<typeof target>) => view.state.selection.ranges.map(({ from, to }) => [from, to]);

test("K-13: case, whole-word and regexp options use the CM query, including invalid patterns", () => {
  const view = target("cat Cat scatter cat1 cat");
  view.dispatch({ effects: setSearchQuery.of(new SearchQuery({ search: "cat", literal: true })) });
  const matches = () => {
    const query = getSearchQuery(view.state);
    return Array.from({ [Symbol.iterator]: () => query.getCursor(view.state) }).map(({ from }) => from);
  };
  assert.deepEqual(matches(), [0, 4, 9, 16, 21]);
  run("SearchCaseSensitive", view);
  assert.deepEqual(matches(), [0, 9, 16, 21]);
  run("SearchWholeWord", view);
  assert.deepEqual(matches(), [0, 21]);
  run("SearchRegexp", view);
  view.dispatch({ effects: setSearchQuery.of(new SearchQuery({ ...getSearchQuery(view.state), search: "cat\\d" })) });
  assert.deepEqual(matches(), [16]);
  view.dispatch({ effects: setSearchQuery.of(new SearchQuery({ search: "[", regexp: true })) });
  assert.equal(getSearchQuery(view.state).valid, false);
});

test("K-13: replace one, regexp replace all in one transaction, single undo and read-only guard", () => {
  const view = target("cat1 cat2 cat3");
  view.dispatch({ selection: EditorSelection.single(0, 4), effects: setSearchQuery.of(new SearchQuery({ search: "cat1", replace: "dog" })) });
  run("ReplaceNext", view);
  assert.equal(view.state.doc.toString(), "dog cat2 cat3");
  undo(view);
  assert.equal(view.state.doc.toString(), "cat1 cat2 cat3");
  view.dispatch({ effects: setSearchQuery.of(new SearchQuery({ search: "cat(\\d)", regexp: true, replace: "dog$1" })) });
  run("ReplaceAll", view);
  assert.equal(view.state.doc.toString(), "dog1 dog2 dog3");
  undo(view);
  assert.equal(view.state.doc.toString(), "cat1 cat2 cat3");
  const locked = target("cat", true);
  locked.dispatch({ selection: EditorSelection.single(0, 3), effects: setSearchQuery.of(new SearchQuery({ search: "cat", replace: "dog" })) });
  assert.equal(run("ReplaceNext", locked), false);
  assert.equal(run("ReplaceAll", locked), false);
  assert.equal(locked.state.doc.toString(), "cat");
});

test("K-13: Ctrl-D adds, skip drops the latest selection, wraps and preserves older ranges", () => {
  const view = target("cat cat cat cat");
  addNextOccurrence(view);
  assert.deepEqual(ranges(view), [[0, 3]]);
  addNextOccurrence(view);
  assert.deepEqual(ranges(view), [[0, 3], [4, 7]]);
  skipOccurrence(view);
  assert.deepEqual(ranges(view), [[0, 3], [8, 11]]);
  skipOccurrence(view);
  assert.deepEqual(ranges(view), [[0, 3], [12, 15]]);
  skipOccurrence(view);
  assert.deepEqual(ranges(view), [[0, 3], [4, 7]]);
  view.dispatch({ selection: EditorSelection.single(0, 3) });
  selectSelectionMatches(view);
  assert.deepEqual(ranges(view), [[0, 3], [4, 7], [8, 11], [12, 15]]);
  assert.equal(skipOccurrence(view), false);
  const single = target("cat");
  skipOccurrence(single);
  assert.deepEqual(ranges(single), [[0, 3]]);
  assert.equal(skipOccurrence(single), false);
});

test("K-13: custom panel edits queries, counts matches, toggles replace and closes per view", (t) => {
  class Node {
    className = ""; dataset: Record<string, string> = {}; attrs: Record<string, string> = {};
    children: Node[] = []; listeners: Record<string, () => void> = {};
    private text = "";
    selectionStart = 0; selectionEnd = 0; selectionDirection = "none";
    get value() { return this.text; }
    set value(value: string) {
      if (value !== this.text) { this.text = value; this.setSelectionRange(value.length, value.length); }
    }
    textContent = ""; hidden = false; disabled = false; type = ""; title = ""; placeholder = "";
    append(...children: Node[]) { this.children.push(...children); }
    setAttribute(name: string, value: string) { this.attrs[name] = value; }
    addEventListener(name: string, callback: () => void) { this.listeners[name] = callback; }
    focus() { root.activeElement = this; }
    select() { this.setSelectionRange(0, this.value.length); }
    setSelectionRange(start: number, end: number, direction = "none") {
      this.selectionStart = start; this.selectionEnd = end; this.selectionDirection = direction;
    }
    typeText(text: string) {
      const cursor = this.selectionStart + text.length;
      this.value = this.value.slice(0, this.selectionStart) + text + this.value.slice(this.selectionEnd);
      this.setSelectionRange(cursor, cursor);
      this.listeners.input();
    }
    contains(node: Node) { return this === node || this.children.some((child) => child.contains(node)); }
    innerHTML = "";
    all(): Node[] { return [this, ...this.children.flatMap((child) => child.all())]; }
    querySelector() { return this.all().find((node) => node.attrs["main-field"]); }
  }
  const root = { activeElement: null as Node | null };
  const previous = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", { configurable: true, value: { createElement: () => new Node() } });
  t.after(() => { if (previous) Object.defineProperty(globalThis, "document", previous); else Reflect.deleteProperty(globalThis, "document"); });
  let panel: Panel | undefined;
  const view = {
    state: EditorState.create({ doc: "foo foo cat cat", extensions: documentSearch }), root,
    dispatch(tr: TransactionSpec) { view.state = view.state.update(tr).state; panel?.update?.({} as never); },
    plugin() { return panel ? { specs: view.state.facet(showPanel), panels: [panel] } : null; },
    focus() { root.activeElement = null; },
  };
  const editor = view as unknown as EditorView;
  const command = (name: string) => SEARCH_COMMANDS.find(([action]) => action === `editor::${name}`)![1](editor);
  command("Find");
  const factory = view.state.facet(showPanel).find((factory) => factory)!;
  panel = factory(editor);
  panel!.mount!();
  const dom = panel!.dom as unknown as Node;
  const byLabel = (label: string) => dom.all().find((node) => node.attrs["aria-label"] === label)!;
  const replacementRow = dom.children[1], count = dom.all().find((node) => node.className === "document-search-count")!;
  assert.equal(replacementRow.hidden, true);
  const find = byLabel("Find"), replace = byLabel("Replace");
  for (const [index, letter] of [..."foo"].entries()) {
    find.typeText(letter);
    assert.equal(find.value, "foo".slice(0, index + 1));
    assert.deepEqual([find.selectionStart, find.selectionEnd], [index + 1, index + 1]);
    assert.equal(getSearchQuery(view.state).search, find.value);
    assert.deepEqual([view.state.selection.main.from, view.state.selection.main.to], [0, index + 1]);
  }
  // Replacing selected input text must preserve the caret for the next keystroke too.
  find.setSelectionRange(1, 3);
  find.typeText("o");
  assert.equal(find.value, "fo");
  assert.deepEqual([find.selectionStart, find.selectionEnd], [2, 2]);
  find.typeText("o");
  assert.equal(find.value, "foo");
  view.dispatch({ selection: EditorSelection.cursor(8) });
  find.value = "cat"; find.listeners.input();
  assert.equal(getSearchQuery(view.state).search, "cat");
  assert.equal(count.textContent, "1/2");
  command("FindNext");
  assert.deepEqual([view.state.selection.main.from, view.state.selection.main.to], [12, 15]);
  command("FindPrevious");
  assert.deepEqual([view.state.selection.main.from, view.state.selection.main.to], [8, 11]);
  command("Replace");
  assert.equal(replacementRow.hidden, false);
  replace.value = "dog"; replace.listeners.input();
  byLabel("Replace (Enter)").listeners.click();
  assert.equal(view.state.doc.toString(), "foo foo dog cat");
  assert.equal(count.textContent, "1/1");
  byLabel("Toggle Replace (Ctrl+H)").listeners.click();
  assert.equal(replacementRow.hidden, true);
  assert.equal(toggleSearch(editor), true);
  assert.equal(view.state.facet(showPanel).some(Boolean), false);
  assert.equal(root.activeElement, null);
});

test("U-7: find in selection counts, steps and replaces only inside the selected range", () => {
  const view = {
    state: EditorState.create({ doc: "cat cat cat cat", extensions: [documentSearch, history()], selection: EditorSelection.single(4, 11) }),
    dispatch(tr: TransactionSpec) { view.state = view.state.update(tr).state; },
    plugin: () => null,
  };
  const editor = view as unknown as EditorView;
  run("Find", view);
  view.dispatch({ selection: EditorSelection.single(4, 11), effects: setSearchQuery.of(new SearchQuery({ search: "cat", literal: true, replace: "dog" })) });
  assert.equal(toggleScope(editor), true);
  run("FindNext", view);
  assert.deepEqual(ranges(view), [[4, 7]]);
  run("FindNext", view);
  assert.deepEqual(ranges(view), [[8, 11]]);
  run("FindNext", view); // wraps inside the range, never to 0 or 12
  assert.deepEqual(ranges(view), [[4, 7]]);
  run("FindPrevious", view);
  assert.deepEqual(ranges(view), [[8, 11]]);
  run("ReplaceAll", view);
  assert.equal(view.state.doc.toString(), "cat dog dog cat");
  assert.equal(toggleScope(editor), true); // off again: the whole document counts again
  view.dispatch({ selection: EditorSelection.single(0) });
  run("FindNext", view);
  run("FindNext", view);
  assert.deepEqual(ranges(view), [[12, 15]]); // outside the old range, now reachable
});
