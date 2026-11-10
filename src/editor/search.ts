import { EditorSelection, EditorState, StateEffect, StateField, type StateCommand, type Text } from "@codemirror/state";
import { Decoration, EditorView, ViewPlugin, type Command, type DecorationSet, type Panel, type ViewUpdate } from "@codemirror/view";
import { simplifySelection } from "@codemirror/commands";
import {
  SearchQuery, closeSearchPanel, findNext, findPrevious, getSearchQuery, openSearchPanel,
  replaceAll, replaceNext, search, searchPanelOpen, selectMatches, selectNextOccurrence,
  selectSelectionMatches, setSearchQuery,
} from "@codemirror/search";
import { iconElement } from "../shell/icon-svg.ts";

const showReplace = StateEffect.define<boolean>();
const replaceVisible = StateField.define({
  create: () => false,
  update: (value: boolean, tr) => tr.effects.reduce((visible, effect) => effect.is(showReplace) ? effect.value : visible, value),
});

// "Find in selection": the range captured when the toggle is switched on. It follows edits and ends with the panel.
type Scope = { from: number; to: number } | null;
// I-23: a scope that spans lines covers whole lines, first line's start to last line's end; a range ending at the start of a later line leaves
// that line out. This is VS Code's findModel.research (re-done on every search, so it also holds after edits); one line stays as selected.
const lineScope = (doc: Text, from: number, to: number): Scope => {
  const first = doc.lineAt(from), last = doc.lineAt(to);
  if (first.number === last.number) return { from, to };
  return { from: first.from, to: to === last.from ? doc.line(last.number - 1).to : last.to };
};
const setScope = StateEffect.define<Scope>();
const scopeField = StateField.define<Scope>({
  create: () => null,
  update(scope, tr) {
    if (scope && tr.docChanged) scope = lineScope(tr.newDoc, tr.changes.mapPos(scope.from, 1), tr.changes.mapPos(scope.to, -1));
    for (const effect of tr.effects) if (effect.is(setScope)) scope = effect.value;
    return scope && searchPanelOpen(tr.state) ? scope : null;
  },
});
type Match = { from: number; to: number; match?: RegExpExecArray };
const scopeOf = (state: EditorState): Scope => state.field(scopeField, false) ?? null;
const matchesOf = (state: EditorState): Match[] => {
  const query = getSearchQuery(state), scope = scopeOf(state);
  if (!query.valid) return [];
  return Array.from({ [Symbol.iterator]: () => (scope ? query.getCursor(state, scope.from, scope.to) : query.getCursor(state)) as Iterator<Match> });
};

// I-11: with a scope on, only the matches inside it are highlighted, as VS Code does (findModel.research sets its highlights from the
// scope's matches). CM's own marks (.cm-searchMatch) are hidden by CSS while the editor has .cm-find-in-selection; these marks replace them.
export const scopedMatchRanges = (state: EditorState, visible: readonly { from: number; to: number }[]): { from: number; to: number }[] => {
  const query = getSearchQuery(state), scope = scopeOf(state);
  if (!scope || !query.valid) return [];
  const found: { from: number; to: number }[] = [];
  for (const range of visible) {
    const from = Math.max(range.from, scope.from), to = Math.min(range.to, scope.to);
    if (from < to) for (const m of { [Symbol.iterator]: () => query.getCursor(state, from, to) as Iterator<Match> }) if (m.to > m.from) found.push({ from: m.from, to: m.to });
  }
  return found;
};
const scopedHighlight = ViewPlugin.fromClass(class {
  decorations: DecorationSet;
  constructor(view: EditorView) { this.decorations = this.build(view); }
  update(u: ViewUpdate) {
    if (u.docChanged || u.viewportChanged || u.selectionSet || u.state.field(scopeField, false) !== u.startState.field(scopeField, false)
      || u.transactions.some((tr) => tr.effects.some((effect) => effect.is(setSearchQuery)))) this.decorations = this.build(u.view);
  }
  build({ state, visibleRanges }: EditorView) {
    return Decoration.set(scopedMatchRanges(state, visibleRanges).map(({ from, to }) => {
      const selected = state.selection.ranges.some((range) => range.from === from && range.to === to);
      return Decoration.mark({ class: selected ? "cm-scopedMatch cm-scopedMatch-selected" : "cm-scopedMatch" }).range(from, to);
    }));
  }
}, { decorations: (plugin) => plugin.decorations });

// CM6 keeps the old main range; VS Code's skip command needs the most recently added one.
export const addNextOccurrence: StateCommand = ({ state, dispatch }) => selectNextOccurrence({ state, dispatch(tr) {
  const index = tr.state.selection.ranges.findIndex((range) => !state.selection.ranges.some((old) => old.eq(range)));
  dispatch(index < 0 ? tr : state.update({ selection: EditorSelection.create(tr.state.selection.ranges, index), effects: tr.effects }));
} });

// U-13: CM's command needs a selection; VS Code also takes the cursor's word, matched as a whole word.
export const selectAllOccurrences: StateCommand = ({ state, dispatch }) => {
  const { main, ranges } = state.selection;
  if (ranges.length > 1 || !main.empty) return selectSelectionMatches({ state, dispatch });
  const word = state.wordAt(main.head);
  if (!word) return false;
  const query = new SearchQuery({ search: state.sliceDoc(word.from, word.to), literal: true, caseSensitive: true, wholeWord: true });
  const found = Array.from({ [Symbol.iterator]: () => query.getCursor(state) }, ({ from, to }: { from: number; to: number }) => EditorSelection.range(from, to));
  if (found.length > 1000) return false;
  dispatch(state.update({ selection: EditorSelection.create(found, found.findIndex((r) => r.from === word.from)), userEvent: "select.search.matches" }));
  return true;
};

export const skipOccurrence: StateCommand = ({ state, dispatch }) => {
  const { main, ranges, mainIndex } = state.selection;
  if (main.empty) return addNextOccurrence({ state, dispatch });
  const word = state.wordAt(main.from);
  const query = new SearchQuery({ search: state.sliceDoc(main.from, main.to), literal: true,
    caseSensitive: true, wholeWord: word?.from === main.from && word.to === main.to });
  for (const [from, to] of [[main.to, state.doc.length], [0, main.from]]) {
    for (const match of { [Symbol.iterator]: () => query.getCursor(state, from, to) }) {
      if (ranges.some((range) => range.from < match.to && range.to > match.from)) continue;
      const next = ranges.filter((_, index) => index !== mainIndex);
      next.push(EditorSelection.range(match.from, match.to));
      dispatch(state.update({ selection: EditorSelection.create(next, next.length - 1), scrollIntoView: true, userEvent: "select.search" }));
      return true;
    }
  }
  return false;
};

// I-24: what the Find field gets from the editor selection, as VS Code's getSelectionSearchString with editor.find.seedSearchStringFromSelection
// "always" (the default): a one-line selection is taken as it is, a cursor takes the word under it, a selection over several lines (or a cursor
// not on a word) leaves the field alone. VS Code caps the text at 524288 characters.
const SEED_MAX_LENGTH = 524288;
export const seedSearchString = (state: EditorState): string | null => {
  const { from, to, empty } = state.selection.main;
  if (state.doc.lineAt(from).number !== state.doc.lineAt(to).number) return null;
  if (!empty) return to - from < SEED_MAX_LENGTH ? state.sliceDoc(from, to) : null;
  const word = state.wordAt(from);
  return word ? state.sliceDoc(word.from, word.to) : null;
};
// CM seeds the field itself when it opens the bar (any selection up to 100 characters, newlines included), so the field is set again from
// the rule above. Ctrl+H (startFindReplace) only seeds an empty field; Ctrl+F (start) always does. A regexp field gets the text escaped.
const openWith = (replace: boolean): Command => (view) => {
  const before = getSearchQuery(view.state);
  view.dispatch({ effects: showReplace.of(replace) });
  const seed = replace && before.search ? null : seedSearchString(view.state);
  const opened = openSearchPanel(view);
  const search = seed === null ? before.search : before.regexp ? seed.replace(/[\\{}*+?|^$.[\]()]/g, "\\$&") : seed;
  if (getSearchQuery(view.state).search !== search) view.dispatch({ effects: setSearchQuery.of(new SearchQuery({ ...before, search })) });
  return opened;
};
const openFind = openWith(false), openReplace = openWith(true);
export const toggleSearch: Command = (view) => searchPanelOpen(view.state) ? closeSearchPanel(view) : openFind(view);

// I-20: whole word here means a letter-or-digit boundary, so "_" and "-" both separate words ("my_read" matches "read"). CM judges
// whole words with its own categorizer, where "_" is a word character and nothing can change that, so the toggle is kept as this
// test on the query and CM's own wholeWord stays off. Ctrl+D and the other occurrence commands keep CM's rule.
const isWordChar = (c: string | undefined) => !!c && /[\p{L}\p{N}]/u.test(c);
export const wholeWordTest = (match: string, state: EditorState, from: number, to: number): boolean => {
  if (!match) return true;
  const before = Array.from(state.sliceDoc(Math.max(0, from - 2), from)).pop(), after = Array.from(state.sliceDoc(to, to + 2))[0];
  return (!isWordChar(before) || !isWordChar(Array.from(match)[0])) && (!isWordChar(after) || !isWordChar(Array.from(match).pop()));
};
export const wholeWordOn = (query: SearchQuery) => query.test === wholeWordTest;
const toggleOption = (option: "caseSensitive" | "wholeWord" | "regexp"): Command => (view) => {
  const query = getSearchQuery(view.state);
  const next = option === "wholeWord" ? { test: wholeWordOn(query) ? undefined : wholeWordTest } : { [option]: !query[option] };
  view.dispatch({ effects: setSearchQuery.of(new SearchQuery({ ...query, ...next })), userEvent: option === "wholeWord" ? WHOLE_WORD_EVENT : undefined });
  return true;
};
// CM builds a new query when the find bar opens or is refocused over a selection (defaultQuery): it copies the old wholeWord flag but not
// the test, so the toggle would silently turn off. Every setSearchQuery that drops it, except our own toggle, gets it back.
const WHOLE_WORD_EVENT = "search.wholeword";
const keepWholeWord = EditorState.transactionExtender.of((tr) => {
  if (tr.isUserEvent(WHOLE_WORD_EVENT) || !wholeWordOn(getSearchQuery(tr.startState))) return null;
  const set = tr.effects.find((effect) => effect.is(setSearchQuery));
  return set && !wholeWordOn(set.value) ? { effects: setSearchQuery.of(new SearchQuery({ ...set.value, test: wholeWordTest })) } : null;
});

// Find in selection: with a scope on, the match commands work on the scope's matches; otherwise they are CM's own.
// Turning it on takes the selection as VS Code's toggle does: one that ends at column 1 of a later line stops at the end of the line before,
// and what is then empty is no scope.
export const toggleScope: Command = (view) => {
  const { doc, selection: { main } } = view.state;
  const on = !!scopeOf(view.state);
  const to = main.to > main.from && main.to === doc.lineAt(main.to).from && doc.lineAt(main.from).number < doc.lineAt(main.to).number ? main.to - 1 : main.to;
  if (!on && main.from === to) return false;
  view.dispatch({ effects: setScope.of(on ? null : lineScope(doc, main.from, to)) });
  return true;
};
const step = (forward: boolean): Command => (view) => {
  if (!scopeOf(view.state)) return forward ? findNext(view) : findPrevious(view);
  const matches = matchesOf(view.state), { from, to } = view.state.selection.main;
  const hit = forward ? matches.find((m) => m.from >= to) ?? matches[0] : matches.filter((m) => m.to <= from).pop() ?? matches[matches.length - 1];
  if (!hit) return false;
  view.dispatch({ selection: EditorSelection.single(hit.from, hit.to), scrollIntoView: true, userEvent: "select.search" });
  return true;
};
// Same `$&`, `$$` and `$n` expansion CM applies to a regexp replacement.
const expand = (query: SearchQuery, { match }: Match) => !query.regexp || !match ? query.replace : query.replace.replace(/\$([$&]|\d+)/g, (all, token: string) => {
  if (token === "&") return match[0];
  if (token === "$") return "$";
  for (let length = token.length; length > 0; length--) {
    const n = +token.slice(0, length);
    if (n > 0 && n < match.length) return match[n] + token.slice(length);
  }
  return all;
});
const replaceIn = (all: boolean): Command => (view) => {
  if (!scopeOf(view.state)) return all ? replaceAll(view) : replaceNext(view);
  if (view.state.readOnly) return false;
  const query = getSearchQuery(view.state), { from, to } = view.state.selection.main;
  const targets = matchesOf(view.state).filter((m) => all || (m.from === from && m.to === to));
  if (targets.length) view.dispatch({ changes: targets.map((m) => ({ from: m.from, to: m.to, insert: expand(query, m) })), userEvent: "input.replace" });
  return all ? targets.length > 0 : step(true)(view);
};
const selectAllMatches: Command = (view) => {
  if (!scopeOf(view.state)) return selectMatches(view);
  const matches = matchesOf(view.state);
  if (!matches.length) return false;
  view.dispatch({ selection: EditorSelection.create(matches.map((m) => EditorSelection.range(m.from, m.to))), userEvent: "select.search.matches" });
  return true;
};
const findNextMatch = step(true), findPreviousMatch = step(false);
const selectAndClose: Command = (view) => { const result = selectAllMatches(view); if (result) { closeSearchPanel(view); view.focus(); } return result; };

export const SEARCH_COMMANDS: ReadonlyArray<readonly [string, Command]> = [
  ["editor::Find", openFind], ["editor::Replace", openReplace],
  ["editor::FindNext", findNextMatch], ["editor::FindPrevious", findPreviousMatch],
  ["editor::AddNextOccurrence", addNextOccurrence], ["editor::SelectSelectionMatches", selectAllOccurrences],
  ["editor::SkipOccurrence", skipOccurrence],
  ["editor::SearchCaseSensitive", toggleOption("caseSensitive")],
  ["editor::SearchWholeWord", toggleOption("wholeWord")], ["editor::SearchRegexp", toggleOption("regexp")],
  ["editor::ReplaceNext", replaceIn(false)], ["editor::ReplaceAll", replaceIn(true)],
  ["editor::SelectSearchMatches", selectAndClose],
  ["editor::Cancel", (view) => closeSearchPanel(view) || simplifySelection(view)],
];

// The Pane's magnifier button shows "on" while its tab's panel is open; it learns that from here.
let panelWatcher: ((view: EditorView, open: boolean) => void) | undefined;
export const watchSearchPanel = (watcher: (view: EditorView, open: boolean) => void) => { panelWatcher = watcher; };

function createPanel(view: EditorView): Panel {
  const make = (className: string, tag = "div") => {
    const element = document.createElement(tag);
    element.className = className;
    return element;
  };
  const dom = make("document-search");
  dom.dataset.keymapContext = "EditorSearch";
  dom.setAttribute("role", "search");
  const row = make("document-search-row"), replaceRow = make("document-search-row");
  replaceRow.dataset.keymapContext = "ReplaceInput";
  const field = make("document-search-field"), replaceField = make("document-search-field");
  const input = (label: string) => {
    const element = document.createElement("input");
    element.placeholder = label;
    element.setAttribute("aria-label", label);
    element.addEventListener("input", () => {
      const query = new SearchQuery({ ...getSearchQuery(view.state), search: find.value, replace: replacement.value });
      view.dispatch({ effects: setSearchQuery.of(query) });
      if (element === find && query.valid) {
        const { selectionStart, selectionEnd, selectionDirection } = element;
        view.dispatch({ selection: EditorSelection.cursor(view.state.selection.main.from) });
        findNextMatch(view);
        // CM's findNext selects the search field; live typing must keep its own caret/selection.
        element.setSelectionRange(selectionStart, selectionEnd, selectionDirection ?? "none");
      }
    });
    return element;
  };
  const find = input("Find"), replacement = input("Replace");
  find.setAttribute("main-field", "true");
  const button = (parent: HTMLElement, icon: string, label: string, run: Command) => {
    const element = document.createElement("button");
    element.type = "button";
    element.title = label;
    element.setAttribute("aria-label", label);
    element.append(iconElement(icon));
    element.addEventListener("click", () => run(view));
    parent.append(element);
    return element;
  };
  field.append(find);
  const options = ([ ["case_sensitive", "Match Case (Alt+C)", "caseSensitive"], ["whole_word", "Match Whole Word (Alt+W)", "wholeWord"], ["regex", "Use Regular Expression (Alt+R)", "regexp"] ] as const)
    .map(([icon, label, option]) => [button(field, icon, label, toggleOption(option)), option] as const);
  row.append(field);
  const toggleReplace = button(row, "replace", "Toggle Replace (Ctrl+H)", (view) => { view.dispatch({ effects: showReplace.of(!view.state.field(replaceVisible)) }); return true; });
  button(row, "select_all", "Select All Matches (Alt+Enter)", selectAndClose);
  const inSelection = button(row, "list_selection", "Find in Selection", toggleScope);
  row.append(make("document-search-separator", "span"));
  button(row, "chevron_left", "Previous Match (Shift+F3)", findPreviousMatch);
  button(row, "chevron_right", "Next Match (F3)", findNextMatch);
  const count = make("document-search-count", "span");
  count.setAttribute("aria-live", "polite");
  row.append(count);
  button(row, "close", "Close (Escape)", closeSearchPanel).className = "document-search-close";
  replaceField.append(replacement);
  replaceRow.append(replaceField);
  const replaceOne = button(replaceRow, "replace_next", "Replace (Enter)", replaceIn(false));
  const replaceEvery = button(replaceRow, "replace_all", "Replace All (Ctrl+Alt+Enter)", replaceIn(true));
  dom.append(row, replaceRow);
  let countedDoc = view.state.doc, countedQuery: SearchQuery | undefined, countedScope: Scope = null, matches: Match[] = [];
  const update = () => {
    const query = getSearchQuery(view.state), scope = scopeOf(view.state);
    find.value = query.search;
    replacement.value = query.replace;
    find.setAttribute("aria-invalid", String(!!query.search && !query.valid));
    for (const [element, option] of options) element.setAttribute("aria-pressed", String(option === "wholeWord" ? wholeWordOn(query) : query[option]));
    toggleReplace.setAttribute("aria-pressed", String(view.state.field(replaceVisible)));
    inSelection.setAttribute("aria-pressed", String(!!scope));
    replaceRow.hidden = !view.state.field(replaceVisible);
    replaceOne.disabled = replaceEvery.disabled = view.state.readOnly;
    if (countedDoc !== view.state.doc || !countedQuery?.eq(query) || countedScope !== scope) {
      matches = matchesOf(view.state);
      countedDoc = view.state.doc;
      countedQuery = query;
      countedScope = scope;
    }
    const main = view.state.selection.main;
    const index = matches.findIndex((match) => match.from === main.from && match.to === main.to);
    count.textContent = query.search && !query.valid ? "Invalid regex" : `${index + 1}/${matches.length}`;
  };
  update();
  return {
    dom, top: true, update,
    mount() { panelWatcher?.(view, true); find.focus(); find.select(); },
    destroy() { panelWatcher?.(view, false); },
  };
}

export const documentSearch = [keepWholeWord, replaceVisible, scopeField, scopedHighlight,
  EditorView.editorAttributes.compute([scopeField], (state) => ({ class: scopeOf(state) ? "cm-find-in-selection" : "" })),
  search({ top: true, literal: true, createPanel })];
