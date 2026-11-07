import { createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { render } from "solid-js/web";
import { Channel, invoke } from "@tauri-apps/api/core";
import { commands } from "../keymap/keyboard.ts";
import { allTabs, openFile, openTool } from "../workspace/context.ts";
import { activateFolder, contextOf, editorContext, flushWorkspaceState, folders } from "../workspace/store.ts";
import { underOrSame } from "../workspace/changes.ts";
import { baseName, pathKey } from "../workspace/paths.ts";
import { notify } from "../shell/toast.ts";
import { applyReplacement, type ReplacementEdit } from "./replace.ts";
import Icon, { type IconName } from "../shell/Icon.tsx";
import { displayChunks } from "../keymap/display.ts";
import { tooltip } from "../shell/tooltip.ts";
import { activeSpan, emptySearch, excerptsOf, highlightParts, nextMatch, relativeDir, receiveSearch, searchPosition, type SearchEvent, type SearchFile, type SearchMatch } from "./model.ts";
import "./search.css";

function ProjectSearch(props: { setTitle: (title: string) => void; setPosition: (position: string) => void }) {
  const [query, setQuery] = createSignal("");
  const [submitted, setSubmitted] = createSignal(false);
  const [caseSensitive, setCase] = createSignal(false);
  const [word, setWord] = createSignal(false);
  const [regex, setRegex] = createSignal(false);
  const [filters, setFilters] = createSignal(false);
  const [replace, setReplace] = createSignal(false);
  const [replacement, setReplacement] = createSignal("");
  const [replacing, setReplacing] = createSignal(false);
  const [include, setInclude] = createSignal("");
  const [exclude, setExclude] = createSignal("");
  const [onlyOpen, setOnlyOpen] = createSignal(false);
  const [ignored, setIgnored] = createSignal(false);
  const [state, setState] = createSignal(emptySearch());
  const [current, setCurrent] = createSignal(0);
  const [collapsed, setCollapsed] = createSignal<ReadonlySet<string>>(new Set());
  const matches = createMemo(() => state().files.flatMap((file) => file.matches.map((match) => ({ file, match }))));
  let generation = 0;
  let requestId = "";
  let confirmedOptions = "";
  let searchInput!: HTMLInputElement;
  let section!: HTMLElement;
  const open = (file: SearchFile, match: SearchMatch) => {
    const folder = folders().find((folder) => underOrSame(folder.path, file.path));
    if (!folder) return;
    activateFolder(folder.id);
    openFile(contextOf(folder), file.path, false, true, match);
  };
  const selected = () => matches()[current()];
  const searchOptions = () => ({ roots: folders().map((folder) => folder.path), query: query(), caseSensitive: caseSensitive(), word: word(), regex: regex(), include: include(), exclude: exclude(), onlyOpen: onlyOpen(), ignored: ignored() });
  createEffect(() => { const at = selected(); props.setPosition(at ? searchPosition(at.file, at.match) : ""); });
  const openSelected = () => { const at = selected(); if (at) open(at.file, at.match); };
  const move = (delta: number) => {
    const at = nextMatch(current(), matches().length, delta);
    setCurrent(at);
    const target = matches()[at];
    if (target) setCollapsed((old) => new Set([...old].filter((path) => path !== target.file.path)));
    queueMicrotask(() => section.querySelector(".search-line.current")?.scrollIntoView({ block: "nearest" }));
  };
  const run = async () => {
    const id = ++generation;
    const jobId = crypto.randomUUID();
    requestId = jobId;
    setSubmitted(true);
    setState({ ...emptySearch(), busy: true });
    setCurrent(0);
    setCollapsed(new Set<string>());
    props.setTitle(query().replaceAll("\n", "") || "Project Search");
    const openFiles = new Map<string, string>();
    for (const folder of folders()) for (const tab of allTabs(contextOf(folder))) {
      if (!tab.tool && !tab.markdown && tab.file.view && !tab.file.status().deleted && folders().some((folder) => underOrSame(folder.path, tab.path))) openFiles.set(tab.path, tab.file.view.state.doc.toString());
    }
    const channel = new Channel<SearchEvent>();
    channel.onmessage = (event) => { if (id === generation) setState((state) => receiveSearch(state, event)); };
    try {
      const params = searchOptions();
      confirmedOptions = JSON.stringify(params);
      const options = { ...params, id: jobId, openFiles: [...openFiles].map(([path, text]) => ({ path, text })) };
      await flushWorkspaceState();
      if (id !== generation) return;
      await invoke("project_search", { options, onEvent: channel });
    } catch (error) {
      if (id === generation) setState((state) => ({ ...state, busy: false, error: String(error) }));
    }
  };
  const tabsOf = (path: string) => folders().flatMap((folder) => allTabs(contextOf(folder))).filter((tab) => !tab.tool && !tab.markdown && pathKey(tab.path) === pathKey(path));
  const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));
  /**
   * Replace `count` results of one file from `start` in its editor Doc and leave it unsaved: Zed edits the buffers of the results and never saves
   * them. A file without an editor opens in a regular tab first. Returns an error text, or "" when done.
   */
  const replaceIn = async (id: string, file: SearchFile, start: number, count: number): Promise<string> => {
    const ready = () => tabsOf(file.path).find((tab) => tab.file.view);
    if (new Set(tabsOf(file.path).map((tab) => tab.file.doc)).size > 1) return "File is open in multiple workspaces. Close duplicate editors before replacing.";
    if (!tabsOf(file.path).length) {
      const folder = folders().find((folder) => underOrSame(folder.path, file.path));
      if (folder) openFile(contextOf(folder), file.path, false, false);
    }
    for (let waited = 0; !ready() && tabsOf(file.path).length && waited < 5000; waited += 25) await sleep(25); // the editor exists after the first read
    const tab = ready();
    const view = tab?.file.view;
    if (!tab || !view || view.state.readOnly) return "Open this file in an editable editor before replacing.";
    const expected = view.state.doc;
    try {
      const edits = await invoke<ReplacementEdit[]>("prepare_search_replace", { id, path: file.path, currentText: expected.toString(), range: [start, count], replacement: replacement() });
      if (id !== requestId || JSON.stringify(searchOptions()) !== confirmedOptions || tab.file.doc.closed || tab.file.view !== view || pathKey(tab.file.doc.path) !== pathKey(file.path) || !applyReplacement(view, expected, edits)) return "Editor or search changed. Search again before replacing.";
    } catch (error) { return String(error); }
    return "";
  };
  const replaceWith = async (work: (id: string) => Promise<void>) => {
    if (state().busy || state().error || replacing() || !matches().length) return;
    if (JSON.stringify(searchOptions()) !== confirmedOptions) { await run(); return; }
    setReplacing(true);
    try { await work(requestId); await run(); } finally { setReplacing(false); }
  };
  const replaceNext = () => replaceWith(async (id) => {
    const at = selected();
    const error = at && await replaceIn(id, at.file, at.file.matches.indexOf(at.match), 1);
    if (error) notify([error]);
  });
  // A file that cannot be replaced is skipped; the others are done, and the count is reported at the end (Zed has no such message).
  const replaceAll = () => replaceWith(async (id) => {
    let skipped = 0;
    let reason = "";
    for (const file of state().files) {
      const error = await replaceIn(id, file, 0, file.matches.length);
      if (error) { skipped++; reason ||= error; }
    }
    if (skipped) notify([`${skipped} file${skipped > 1 ? "s were" : " was"} not replaced. ${reason}`]);
  });
  onCleanup(() => { generation++; if (requestId) void invoke("cancel_project_search", { id: requestId }).catch(() => {}); });
  const collapseAll = () => setCollapsed(collapsed().size ? new Set<string>() : new Set(state().files.map((file) => file.path)));
  const toggleFile = (path: string) => setCollapsed((old) => { const next = new Set(old); if (!next.delete(path)) next.add(path); return next; });
  const toggleFilters = () => setFilters(!filters());
  const toggleReplace = () => setReplace(!replace());
  const shortcuts: Record<string, () => void> = { c: () => setCase(!caseSensitive()), w: () => setWord(!word()), r: () => setRegex(!regex()), f: toggleFilters, "shift-h": toggleReplace, enter: openSelected };
  const Toggle = (p: { label: string; icon: IconName; key: string; value: boolean; run: () => void }) => <button type="button" aria-label={p.label} aria-pressed={p.value} onClick={p.run} ref={(el) => tooltip(el, () => ({ title: p.label, shortcut: p.key }))}><Icon name={p.icon} /></button>;
  const guides = [
    { icon: "filter", text: "Include/exclude specific paths", key: "alt-f", run: toggleFilters },
    { icon: "replace", text: "Find and replace", key: "alt-shift-h", run: toggleReplace },
    { icon: "regex", text: "Match with regex", key: "alt-r", run: () => setRegex(!regex()) },
    { icon: "case_sensitive", text: "Match case", key: "alt-c", run: () => setCase(!caseSensitive()) },
    { icon: "whole_word", text: "Match whole words", key: "alt-w", run: () => setWord(!word()) },
  ] as const;
  return <section ref={section} class="project-search" aria-label="Project Search" data-keymap-context="ProjectSearch" tabindex="-1" onKeyDown={(event) => {
    if (event.isComposing || event.ctrlKey || event.metaKey) return;
    if (event.altKey) {
      const action = shortcuts[`${event.shiftKey ? "shift-" : ""}${event.key.toLowerCase()}`];
      if (action) { event.preventDefault(); action(); }
    } else if (event.key === "Enter" && event.target instanceof HTMLInputElement) { event.preventDefault(); void (event.target.getAttribute("aria-label") === "Replace in project" ? replaceNext() : run()); }
  }}>
    <div class="project-search-toolbar">
      <button type="button" aria-label="Collapse/Expand all results" onClick={collapseAll}><Icon name={collapsed().size ? "chevron_right" : "chevron_down"} /></button>
      <div class="project-search-input"><input ref={searchInput} data-text-input aria-label="Search all files" placeholder="Search all files…" value={query()} onInput={(e) => setQuery(e.currentTarget.value)} />
        <Toggle label="Match case" icon="case_sensitive" key="alt-c" value={caseSensitive()} run={() => setCase(!caseSensitive())} />
        <Toggle label="Match whole words" icon="whole_word" key="alt-w" value={word()} run={() => setWord(!word())} />
        <Toggle label="Match with regex" icon="regex" key="alt-r" value={regex()} run={() => setRegex(!regex())} />
      </div>
      <div class="project-search-modes">
        <Toggle label="Toggle Filters" icon="filter" key="alt-f" value={filters()} run={toggleFilters} />
        <Toggle label="Toggle Replace" icon="replace" key="alt-shift-h" value={replace()} run={toggleReplace} />
      </div>
      <div class="project-search-matches">
        <button type="button" aria-label="Previous result" disabled={!matches().length} onClick={() => move(-1)}><Icon name="chevron_left" /></button>
        <button type="button" aria-label="Next result" disabled={!matches().length} onClick={() => move(1)}><Icon name="chevron_right" /></button>
        <span class="search-count" classList={{ active: !!matches().length }} aria-live="polite">{matches().length ? current() + 1 : 0}/{matches().length}</span>
      </div>
    </div>
    <Show when={filters()}><div class="project-search-toolbar">
      <input data-text-input aria-label="Include paths" placeholder="Include: e.g. src/**/*.rs" value={include()} onInput={(e) => setInclude(e.currentTarget.value)} />
      <input data-text-input aria-label="Exclude paths" placeholder="Exclude: e.g. vendor/*, *.lock" value={exclude()} onInput={(e) => setExclude(e.currentTarget.value)} />
      <label><input type="checkbox" checked={onlyOpen()} onChange={(e) => setOnlyOpen(e.currentTarget.checked)} />Only Search Open Files</label>
      <label><input type="checkbox" checked={ignored()} onChange={(e) => setIgnored(e.currentTarget.checked)} />Also search files ignored by configuration</label>
    </div></Show>
    <Show when={replace()}><div class="project-search-toolbar"><input data-text-input aria-label="Replace in project" placeholder="Replace in project…" value={replacement()} onInput={(e) => setReplacement(e.currentTarget.value)} /><button type="button" disabled={state().busy || !!state().error || replacing() || !matches().length} onClick={() => void replaceNext()}>Replace next</button><button type="button" disabled={state().busy || !!state().error || replacing() || !matches().length} onClick={() => void replaceAll()}>Replace all</button></div></Show>
    <Show when={state().error}><p class="search-error" role="alert">{state().error}</p></Show>
    <Show when={state().busy}><p role="status">Searching…</p></Show>
    <Show when={state().limited}><p role="status">Search Limits Reached. Try narrowing your search.</p></Show>
    <Show when={submitted()} fallback={<div class="project-search-empty"><h2>Search All Files</h2><p>Start typing to search. For more options:</p><For each={guides}>{(guide) => <button type="button" onClick={() => { guide.run(); searchInput.focus(); }}><Icon name={guide.icon} /><span>{guide.text}</span><kbd>{displayChunks(guide.key).join(" ")}</kbd></button>}</For></div>}>
      <div class="project-search-results"><For each={state().files}>{(file) => {
        const root = () => folders().find((folder) => underOrSame(folder.path, file.path));
        const dir = () => { const at = root(); return at ? relativeDir(file.path, at.path, folders().length > 1 ? baseName(at.path) : undefined) : ""; };
        const isSelected = () => selected()?.file === file;
        return <article>
          <header class="search-file-header" classList={{ selected: isSelected() }} onClick={() => toggleFile(file.path)}>
            <button type="button" class="search-fold" aria-label={collapsed().has(file.path) ? "Unfold Excerpt" : "Fold Excerpt"} aria-expanded={!collapsed().has(file.path)}><Icon name={collapsed().has(file.path) ? "chevron_right" : "chevron_down"} /></button>
            <button type="button" class="search-file-name" onClick={(event) => { event.stopPropagation(); open(file, file.matches[0]); }}>{baseName(file.path)}</button>
            <span class="search-file-dir">{dir()}</span>
            <button type="button" class="search-open-file" onClick={(event) => { event.stopPropagation(); open(file, file.matches[0]); }} ref={(el) => tooltip(el, () => ({ title: "Open File", shortcut: "alt-enter" }))}>Open File<Show when={isSelected()}><kbd>{displayChunks("alt-enter").join(" ")}</kbd></Show></button>
          </header>
          <Show when={!collapsed().has(file.path)}><For each={excerptsOf(file.lines)}>{(excerpt) => <div class="search-excerpt"><For each={excerpt}>{(line, index) => <button type="button" class="search-line" classList={{ current: isSelected() && selected()?.match.line === line.number }} aria-label={`${baseName(file.path)} line ${line.number}`} onClick={() => {
            const match = file.matches.find((match) => match.line === line.number) ?? { line: line.number, column: 1, endLine: line.number, endColumn: 1 };
            open(file, match);
          }}><span class="search-line-gutter" aria-hidden="true"><Show when={index() === 0} fallback={<Show when={index() === excerpt.length - 1}><Icon name="expand_down" /></Show>}><Icon name="expand_up" /></Show></span><span class="search-line-number">{line.number}</span><code><For each={highlightParts(line.text, line.spans, activeSpan(isSelected() ? selected()?.match : undefined, line))}>{(part) => <span classList={{ "search-match": part.match, active: part.active }}>{part.text}</span>}</For></code></button>}</For></div>}</For></Show>
        </article>;
      }}</For>
      <Show when={!state().busy && !state().files.length && !state().error}><p>No results.</p></Show></div>
    </Show>
  </section>;
}

commands.set("pane::DeploySearch", () => {
  openTool(editorContext(), "Project Search", () => {
    const element = document.createElement("div");
    element.className = "project-search-tab";
    element.tabIndex = -1;
    element.onfocus = () => element.querySelector<HTMLInputElement>('input[aria-label="Search all files"]')?.focus();
    const [title, setTitle] = createSignal("Project Search");
    const [toolPosition, setPosition] = createSignal("");
    const dispose = render(() => <ProjectSearch setTitle={setTitle} setPosition={setPosition} />, element);
    return { element, dispose, title, toolPosition, icon: "magnifying_glass" };
  });
});
