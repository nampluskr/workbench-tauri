import { createMemo, createSignal, For, Show } from "solid-js";
import { render } from "solid-js/web";
import { commands } from "../keymap/keyboard.ts";
import { openTool } from "../workspace/context.ts";
import { editorContext } from "../workspace/store.ts";
import Icon from "../shell/Icon.tsx";
import { bundledExtensions, CATEGORIES, emptyExtensions, filterExtensions, INSTALL_FILTERS, type InstallFilter } from "./model.ts";
import { category, setCategory } from "./state.ts";
import { themeFiles } from "../theme/themes.ts";
import { iconThemeFiles } from "../theme/icons.ts";
import { openUrl } from "@tauri-apps/plugin-opener";
import { notify } from "../shell/toast.ts";
import "./extensions.css";

// The copied extension sets (core D-8/D-9, .gitignore folders); a missing copy just has no card. Paths are made
// comparable by dropping the leading "./" or "../" and giving theme files their src/theme prefix.
const manifests = import.meta.glob<string>(["../theme/assets/*/extension.toml", "../assets/icon-themes/*/extension.toml"], { query: "?raw", import: "default", eager: true });
const bare = (path: string) => path.replace(/^(\.\.?\/)+/, "");
const bundled = bundledExtensions(
  Object.fromEntries(Object.entries(manifests).map(([path, text]) => [bare(path), text])),
  [...Object.keys(themeFiles).map((path) => "theme/" + bare(path)), ...iconThemeFiles.map(bare)],
);

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
          <div class="extension-card-top"><div class="extension-card-name"><strong>{row.name}</strong><Show when={row.version}><span>v{row.version}</span></Show><For each={row.kinds}>{(kind) => <span class="extension-tag">{kind}</span>}</For></div><span class="extension-status">Installed</span></div>
          <div class="extension-description" title={row.description}>{row.description}</div>
          <div class="extension-card-bottom">
            <div class="extension-author" title={row.author}>{row.author}</div>
            <Show when={row.repository.startsWith("https://")}>
              <button aria-label={`Open ${row.name} repository`} title={row.repository} onClick={() => void openUrl(row.repository).catch((error) => notify([String(error)]))}><Icon name="github" /></button>
            </Show>
          </div>
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
