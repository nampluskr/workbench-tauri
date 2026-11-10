import { EditorSelection, StateEffect, StateField, type StateCommand } from "@codemirror/state";
import { EditorView, type Command, type Panel } from "@codemirror/view";
import { simplifySelection } from "@codemirror/commands";
import {
  SearchQuery, closeSearchPanel, findNext, findPrevious, getSearchQuery, openSearchPanel,
  replaceAll, replaceNext, search, searchPanelOpen, selectMatches, selectNextOccurrence,
  selectSelectionMatches, setSearchQuery,
} from "@codemirror/search";

const showReplace = StateEffect.define<boolean>();
const replaceVisible = StateField.define({
  create: () => false,
  update: (value: boolean, tr) => tr.effects.reduce((visible, effect) => effect.is(showReplace) ? effect.value : visible, value),
});

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

export const SEARCH_COMMANDS: ReadonlyArray<readonly [string, Command]> = [
  ["editor::Find", openFind], ["editor::Replace", openReplace],
  ["editor::FindNext", findNext], ["editor::FindPrevious", findPrevious],
  ["editor::AddNextOccurrence", addNextOccurrence], ["editor::SelectSelectionMatches", selectSelectionMatches],
  ["editor::SkipOccurrence", skipOccurrence],
  ["editor::SearchCaseSensitive", toggleOption("caseSensitive")],
  ["editor::SearchWholeWord", toggleOption("wholeWord")], ["editor::SearchRegexp", toggleOption("regexp")],
  ["editor::ReplaceNext", replaceNext], ["editor::ReplaceAll", replaceAll],
  ["editor::SelectSearchMatches", (view) => { const result = selectMatches(view); if (result) { closeSearchPanel(view); view.focus(); } return result; }],
  ["editor::Cancel", (view) => closeSearchPanel(view) || simplifySelection(view)],
];

function createPanel(view: EditorView): Panel {
  const dom = document.createElement("div");
  dom.className = "document-search";
  dom.dataset.keymapContext = "EditorSearch";
  dom.setAttribute("role", "search");
  const row = document.createElement("div"), replaceRow = document.createElement("div");
  row.className = replaceRow.className = "document-search-row";
  replaceRow.dataset.keymapContext = "ReplaceInput";
  const input = (label: string) => {
    const field = document.createElement("input");
    field.placeholder = label;
    field.setAttribute("aria-label", label);
    field.addEventListener("input", () => {
      const query = new SearchQuery({ ...getSearchQuery(view.state), search: find.value, replace: replacement.value });
      view.dispatch({ effects: setSearchQuery.of(query) });
      if (field === find && query.valid) {
        const { selectionStart, selectionEnd, selectionDirection } = field;
        view.dispatch({ selection: EditorSelection.cursor(view.state.selection.main.from) });
        findNext(view);
        // findNext selects the search field; live typing must keep its own caret/selection.
        field.setSelectionRange(selectionStart, selectionEnd, selectionDirection ?? "none");
      }
    });
    return field;
  };
  const find = input("Find"), replacement = input("Replace");
  find.setAttribute("main-field", "true");
  const button = (parent: HTMLElement, text: string, label: string, run: Command) => {
    const element = document.createElement("button");
    element.type = "button";
    element.textContent = text;
    element.title = label;
    element.setAttribute("aria-label", label);
    element.addEventListener("click", () => run(view));
    parent.append(element);
    return element;
  };
  button(row, ">", "Toggle Replace", (view) => { view.dispatch({ effects: showReplace.of(!view.state.field(replaceVisible)) }); return true; });
  row.append(find);
  const options = ([ ["Aa", "Match Case (Alt+C)", "caseSensitive"], ["ab", "Match Whole Word (Alt+W)", "wholeWord"], [".*", "Use Regular Expression (Alt+R)", "regexp"] ] as const)
    .map(([text, label, option]) => [button(row, text, label, toggleOption(option)), option] as const);
  const count = document.createElement("span");
  count.setAttribute("aria-live", "polite");
  row.append(count);
  button(row, "↑", "Previous Match (Shift+F3)", findPrevious);
  button(row, "↓", "Next Match (F3)", findNext);
  button(row, "×", "Close (Escape)", closeSearchPanel);
  replaceRow.append(replacement);
  const replaceOne = button(replaceRow, "Replace", "Replace (Enter)", replaceNext);
  const replaceEvery = button(replaceRow, "All", "Replace All (Ctrl+Alt+Enter)", replaceAll);
  dom.append(row, replaceRow);
  let countedDoc = view.state.doc, countedQuery: SearchQuery | undefined, matches: { from: number; to: number }[] = [];
  const update = () => {
    const query = getSearchQuery(view.state);
    find.value = query.search;
    replacement.value = query.replace;
    find.setAttribute("aria-invalid", String(!!query.search && !query.valid));
    for (const [element, option] of options) element.setAttribute("aria-pressed", String(query[option]));
    replaceRow.hidden = !view.state.field(replaceVisible);
    replaceOne.disabled = replaceEvery.disabled = view.state.readOnly;
    if (countedDoc !== view.state.doc || !countedQuery?.eq(query)) {
      matches = query.valid ? Array.from({ [Symbol.iterator]: () => query.getCursor(view.state) }) : [];
      countedDoc = view.state.doc;
      countedQuery = query;
    }
    const main = view.state.selection.main;
    const index = matches.findIndex((match) => match.from === main.from && match.to === main.to);
    count.textContent = query.search && !query.valid ? "Invalid regex" : `${index + 1} of ${matches.length}`;
  };
  update();
  return { dom, top: true, mount() { find.focus(); find.select(); }, update };
}

export const documentSearch = [replaceVisible, search({ top: true, literal: true, createPanel })];
