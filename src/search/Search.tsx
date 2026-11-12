import { createSignal, For, onCleanup, Show } from "solid-js";
import { render } from "solid-js/web";
import { commands } from "../keymap/keyboard.ts";
import { openTool } from "../workspace/context.ts";
import { activeId, editorContext, folders } from "../workspace/store.ts";
import { searchRoots } from "../workspace/folders.ts";
import { pathCrumb } from "../editor/breadcrumbs.ts";
import { baseName } from "../workspace/paths.ts";
import { searchPath, searchTitle } from "../workspace/tab-view.ts";
import FileIcon from "../shell/FileIcon.tsx";
import { IconButton } from "../shell/Icon.tsx";
import { nameRegExp } from "./name-regexp.ts";
import type { SearchEntry, SearchEvent } from "./entries.ts";
import { openEntry, searchNames } from "./names.ts";
import "./search.css";

const MAX_RESULTS = 5_000; // name_search.rs MAX_FILES; regexp results are cut here in the page

let opened = 0; // core I-6: numbers the Search tabs' paths

function Search(props: { searched: (query: string) => void }) {
  const [query, setQuery] = createSignal("");
  const [entries, setEntries] = createSignal<SearchEntry[]>([]);
  const [busy, setBusy] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [root, setRoot] = createSignal("");
  const [caseSensitive, setCaseSensitive] = createSignal(false);
  const [wholeWord, setWholeWord] = createSignal(false);
  const [regexp, setRegexp] = createSignal(false);
  const [searched, setSearched] = createSignal(false);
  let generation = 0;
  onCleanup(() => generation++);
  const run = async () => {
    const id = ++generation;
    setEntries([]);
    setMessage("");
    setBusy(true);
    setSearched(true);
    props.searched(query());
    // Regexp mode: Rust streams every name and the page keeps the matching ones; an invalid pattern just finds nothing.
    const matcher = regexp() ? nameRegExp(query(), { caseSensitive: caseSensitive(), wholeWord: wholeWord() }) : null;
    if (regexp() && !matcher) { setBusy(false); return; }
    const roots = searchRoots(folders(), activeId());
    setRoot(roots[0] ?? "");
    const onEvent = (event: SearchEvent) => {
      if (id !== generation) return;
      if (event.kind === "entry") {
        if (matcher && !matcher.test(baseName(event.entry.path))) return;
        setEntries((old) => [...old, event.entry]);
        if (matcher && entries().length >= MAX_RESULTS) { generation++; setBusy(false); setMessage("Search result limit reached."); }
      }
      else {
        setBusy(false);
        if (event.kind === "error") setMessage(event.message);
        else if (event.kind === "limit") setMessage("Search result limit reached.");
      }
    };
    try {
      const options = { roots, query: query(), caseSensitive: caseSensitive(), wholeWord: wholeWord(), all: !!matcher };
      await searchNames(options, onEvent, () => id !== generation);
    } catch (error) {
      if (id === generation) { setBusy(false); setMessage(String(error)); }
    }
  };
  const toggles = [
    ["case_sensitive", "Match Case (Alt+C)", "KeyC", caseSensitive, setCaseSensitive],
    ["whole_word", "Match Whole Word (Alt+W)", "KeyW", wholeWord, setWholeWord],
    ["regex", "Use Regular Expression (Alt+R)", "KeyR", regexp, setRegexp],
  ] as const;
  const flip = (setter: (update: (on: boolean) => boolean) => void) => { setter((on) => !on); if (query()) void run(); };
  return <section class="project-search" aria-label="Search" tabindex="-1">
    <div class="project-search-toolbar main">
      <div class="project-search-input"><input data-text-input aria-label="Search" placeholder="Search" value={query()} onInput={(e) => setQuery(e.currentTarget.value)} onKeyDown={(event) => {
        if (event.key === "Enter" && !event.isComposing) { event.preventDefault(); void run(); return; }
        const toggle = event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.isComposing && toggles.find(([, , code]) => code === event.code);
        if (toggle) { event.preventDefault(); flip(toggle[4]); }
      }} />
        <For each={toggles}>{([icon, label, , on, set]) => <IconButton name={icon} label={label} toggled={on()} onClick={() => flip(set)} />}</For>
      </div>
      <Show when={searched()}><span class="project-search-count" aria-live="polite">{entries().length}</span></Show>
    </div>
    <Show when={busy() || message()}><p class="search-message" role="status">{busy() ? "Searching…" : message()}</p></Show>
    <div class="project-search-results">
      <For each={entries()}>{(entry) => <button class="search-file-header" onClick={() => openEntry(root(), entry)}>
        <FileIcon name={baseName(entry.path)} dir={entry.isDir} />
        <span class="search-file-name">{baseName(entry.path)}</span>
        <span class="search-file-dir">{pathCrumb(root(), entry.path)}</span>
      </button>}</For>
    </div>
  </section>;
}

commands.set("pane::DeploySearch", () => {
  openTool(editorContext(), searchPath(++opened), () => {
    const element = document.createElement("div");
    element.className = "project-search-tab";
    element.tabIndex = -1;
    element.onfocus = () => element.querySelector<HTMLInputElement>('input[aria-label="Search"]')?.focus();
    const [searched, setSearched] = createSignal("");
    const dispose = render(() => <Search searched={setSearched} />, element);
    return { element, dispose, title: () => searchTitle(searched()), icon: "magnifying_glass" };
  });
});
