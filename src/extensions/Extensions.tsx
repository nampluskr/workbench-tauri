import { createMemo, createSignal, For, Show } from "solid-js";
import { render } from "solid-js/web";
import { commands } from "../keymap/keyboard.ts";
import { openTool } from "../workspace/context.ts";
import { editorContext } from "../workspace/store.ts";
import Icon from "../shell/Icon.tsx";
import { bundledExtensions, CATEGORIES, emptyExtensions, filterExtensions, INSTALL_FILTERS, type InstallFilter } from "./model.ts";
import { category, setCategory } from "./state.ts";
import { themeFiles } from "../theme/themes.ts";
import "./extensions.css";

const icons = import.meta.glob<string>("../assets/zed-icons/*.svg", { query: "?raw", import: "default", eager: true });
const bundled = bundledExtensions(themeFiles, Object.keys(icons).length > 0);

function Extensions() {
  const [search, setSearch] = createSignal("");
  const [installed, setInstalled] = createSignal<InstallFilter>("All");
  const rows = createMemo(() => filterExtensions(bundled, search(), category(), installed()));
  return <section class="extensions" aria-label="Extensions">
    <header class="extensions-header">
      <h1>Extensions</h1>
      <div class="extensions-search-row">
        <label class="extensions-search"><Icon name="magnifying_glass" /><input data-text-input aria-label="Search extensions" placeholder="Search extensions…" value={search()} onInput={(e) => setSearch(e.currentTarget.value)} /></label>
        <div class="extensions-filters" role="group" aria-label="Installation status"><For each={INSTALL_FILTERS}>{(filter) =>
          <button aria-pressed={installed() === filter} onClick={() => setInstalled(filter)}>{filter}</button>
        }</For></div>
      </div>
    </header>
    <div class="extensions-categories" role="group" aria-label="Extension categories"><For each={CATEGORIES}>{(filter) =>
      <button aria-pressed={category() === filter} onClick={() => setCategory(filter)}>{filter}</button>
    }</For></div>
    <div class="extensions-list">
      <Show when={rows().length} fallback={<p class="extensions-empty" role="status">{emptyExtensions(search(), installed())}</p>}>
        <For each={rows()}>{(row) => <article class="extension-card" aria-label={row.name}>
          <div class="extension-card-top"><div class="extension-card-name"><strong>{row.name}</strong><Show when={row.version}><span>v{row.version}</span></Show><span class="extension-tag">{row.category}</span></div><span class="extension-status">Installed</span></div>
          <div class="extension-description" title={row.description}>{row.description}</div>
          <div class="extension-author" title={row.author}>{row.author}</div>
        </article>}</For>
      </Show>
    </div>
  </section>;
}

commands.set("zed::Extensions", () => {
  openTool(editorContext(), "Extensions", () => {
    const element = document.createElement("div");
    element.className = "extensions-tab";
    element.tabIndex = -1;
    element.onfocus = () => element.querySelector<HTMLInputElement>("input")?.focus();
    const dispose = render(() => <Extensions />, element);
    return { element, dispose };
  });
});
