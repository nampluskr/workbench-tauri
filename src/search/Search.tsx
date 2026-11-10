import { createSignal, For, onCleanup, Show } from "solid-js";
import { render } from "solid-js/web";
import { Channel, invoke } from "@tauri-apps/api/core";
import { commands } from "../keymap/keyboard.ts";
import { openFile, openTool, reveal, setExpanded } from "../workspace/context.ts";
import { activateFolder, activeId, contextOf, editorContext, flushWorkspaceState, folders } from "../workspace/store.ts";
import { searchRoots } from "../workspace/folders.ts";
import { pathCrumb } from "../editor/breadcrumbs.ts";
import { baseName, pathKey } from "../workspace/paths.ts";
import { setDockOpen } from "../shell/panels.ts";
import FileIcon from "../shell/FileIcon.tsx";
import "./search.css";

type SearchEntry = { path: string; isDir: boolean };
type SearchEvent = { kind: "entry"; entry: SearchEntry } | { kind: "done" | "limit" } | { kind: "error"; message: string };

function Search() {
  const [query, setQuery] = createSignal("");
  const [entries, setEntries] = createSignal<SearchEntry[]>([]);
  const [busy, setBusy] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [root, setRoot] = createSignal("");
  let generation = 0;
  onCleanup(() => generation++);
  const run = async () => {
    const id = ++generation;
    setEntries([]);
    setMessage("");
    setBusy(true);
    const roots = searchRoots(folders(), activeId());
    setRoot(roots[0] ?? "");
    const channel = new Channel<SearchEvent>();
    channel.onmessage = (event) => {
      if (id !== generation) return;
      if (event.kind === "entry") setEntries((old) => [...old, event.entry]);
      else {
        setBusy(false);
        if (event.kind === "error") setMessage(event.message);
        else if (event.kind === "limit") setMessage("Search result limit reached.");
      }
    };
    try {
      const options = { roots, query: query() };
      await flushWorkspaceState();
      if (id !== generation) return;
      await invoke("search_names", { options, onEvent: channel });
    } catch (error) {
      if (id === generation) { setBusy(false); setMessage(String(error)); }
    }
  };
  const open = (entry: SearchEntry) => {
    const folder = folders().find((folder) => pathKey(folder.path) === pathKey(root()));
    if (!folder) return;
    activateFolder(folder.id);
    const ctx = contextOf(folder);
    if (entry.isDir) {
      setDockOpen(true);
      setExpanded(ctx, ctx.root, true);
      reveal(ctx, entry.path);
    } else openFile(ctx, entry.path, false, true);
  };
  return <section class="project-search" aria-label="Search" tabindex="-1">
    <div class="project-search-toolbar main">
      <div class="project-search-input"><input data-text-input aria-label="Search" placeholder="Search" value={query()} onInput={(e) => setQuery(e.currentTarget.value)} onKeyDown={(event) => {
        if (event.key === "Enter" && !event.isComposing) { event.preventDefault(); void run(); }
      }} /></div>
    </div>
    <Show when={busy() || message()}><p class="search-message" role="status">{busy() ? "Searching…" : message()}</p></Show>
    <div class="project-search-results">
      <For each={entries()}>{(entry) => <button class="search-file-header" onClick={() => open(entry)}>
        <FileIcon name={baseName(entry.path)} dir={entry.isDir} />
        <span class="search-file-name">{baseName(entry.path)}</span>
        <span class="search-file-dir">{pathCrumb(root(), entry.path)}</span>
      </button>}</For>
    </div>
  </section>;
}

commands.set("pane::DeploySearch", () => {
  openTool(editorContext(), "Search", () => {
    const element = document.createElement("div");
    element.className = "project-search-tab";
    element.tabIndex = -1;
    element.onfocus = () => element.querySelector<HTMLInputElement>('input[aria-label="Search"]')?.focus();
    const dispose = render(() => <Search />, element);
    return { element, dispose, title: () => "Search", icon: "magnifying_glass" };
  });
});
