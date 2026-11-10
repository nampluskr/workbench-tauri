import { EditorSelection, EditorState, StateEffect, StateField, type StateCommand } from "@codemirror/state";
import { EditorView, type Command, type Panel } from "@codemirror/view";
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
const setScope = StateEffect.define<Scope>();
const scopeField = StateField.define<Scope>({
  create: () => null,
  update(scope, tr) {
    if (scope && tr.docChanged) scope = { from: tr.changes.mapPos(scope.from, 1), to: tr.changes.mapPos(scope.to, -1) };
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

// CM6 keeps the old main range; VS Code's skip command needs the most recently added one.
export const addNextOccurrence: StateCommand = ({ state, dispatch }) => selectNextOccurrence({ state, dispatch(tr) {
  const index = tr.state.selection.ranges.findIndex((range) => !state.selection.ranges.some((old) => old.eq(range)));
  dispatch(index < 0 ? tr : state.update({ selection: EditorSelection.create(tr.state.selection.ranges, index), effects: tr.effects }));
} });

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

const openFind: Command = (view) => {
  view.dispatch({ effects: showReplace.of(false) });
  return openSearchPanel(view);
};
const openReplace: Command = (view) => {
  view.dispatch({ effects: showReplace.of(true) });
  return openSearchPanel(view);
};
export const toggleSearch: Command = (view) => searchPanelOpen(view.state) ? closeSearchPanel(view) : openFind(view);
const toggleOption = (option: "caseSensitive" | "wholeWord" | "regexp"): Command => (view) => {
  const query = getSearchQuery(view.state);
  view.dispatch({ effects: setSearchQuery.of(new SearchQuery({ ...query, [option]: !query[option] })) });
  return true;
};

// Find in selection: with a scope on, the match commands work on the scope's matches; otherwise they are CM's own.
export const toggleScope: Command = (view) => {
  const { from, to, empty } = view.state.selection.main;
  const on = !!scopeOf(view.state);
  if (!on && empty) return false;
  view.dispatch({ effects: setScope.of(on ? null : { from, to }) });
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
  ["editor::AddNextOccurrence", addNextOccurrence], ["editor::SelectSelectionMatches", selectSelectionMatches],
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
    for (const [element, option] of options) element.setAttribute("aria-pressed", String(query[option]));
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

export const documentSearch = [replaceVisible, scopeField, search({ top: true, literal: true, createPanel })];
