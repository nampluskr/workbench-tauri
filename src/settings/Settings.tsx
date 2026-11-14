import { createMemo, createSignal, For, Show } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import TitleBar from "../shell/TitleBar.tsx";
import Icon from "../shell/Icon.tsx";
import AppMenu, { isContextMenuOpen, openContextMenu } from "../shell/AppMenu.tsx";
import { commands } from "../keymap/keyboard.ts";
import { SETTINGS_DROPDOWN_OFFSET_Y } from "../spec/metrics.ts";
import { choices } from "./choices.ts";
import { CATEGORIES, filterSettings, isChoiceKey, isToggleKey, settingMenu, settingNumber, settingStep, type ChoiceKey, type SettingKey, type SettingValue } from "./model.ts";
import { resetSettings, saveSettings, settings } from "./load.ts";
import "./settings.css";

export default function SettingsWindow() {
  document.title = "Settings";
  const [query, setQuery] = createSignal("");
  const [error, setError] = createSignal("");
  const [saving, setSaving] = createSignal(false);
  const rows = createMemo(() => filterSettings(query()));
  const [current, setCurrent] = createSignal<(typeof CATEGORIES)[number]>("UI");
  // I-16: with no search the page is the chosen category; a search shows every category's matching rows, grouped by title.
  const searching = () => query().trim() !== "";
  const shown = () => searching() ? CATEGORIES.filter((category) => rows().some((r) => r.category === category)) : [current()];
  // I-17: the category the confirm dialog asks about, and the button to give focus back to.
  const [restoring, setRestoring] = createSignal<(typeof CATEGORIES)[number]>("UI");
  let confirm!: HTMLDialogElement;
  let opener: HTMLElement | undefined;
  const writeFile = async (write: () => Promise<void>) => {
    if (saving()) return;
    setSaving(true);
    try { await write(); setError(""); }
    catch (error) { setError(String(error)); }
    finally { setSaving(false); }
  };
  const save = (key: SettingKey, value: SettingValue) => writeFile(() => saveSettings({ [key]: value }));
  return <div class="settings-window">
    <TitleBar settings />
    <div class="settings-body">
      <nav class="settings-nav" aria-label="Settings categories">
        <div class="settings-search"><Icon name="magnifying_glass" /><input type="search" placeholder="Search settings…" aria-label="Search settings" value={query()} onInput={(e) => setQuery(e.currentTarget.value)} /></div>
        <For each={CATEGORIES}>{(category) =>
          <button class="settings-category" aria-current={current() === category ? "page" : undefined} onClick={() => { setQuery(""); setCurrent(category); }}><Icon name="chevron_right" />{category}</button>
        }</For>
      </nav>
      <main class="settings-content">
        <div class="settings-toolbar"><span class="settings-scope" aria-label="Settings scope: User">User</span><button onClick={() => void invoke("edit_user_settings").catch((error) => setError(String(error)))}>Edit in settings.json</button></div>
        <Show when={error()}><p role="alert">{error()}</p></Show>
        <For each={shown()}>{(category) => <>
          <div class="settings-heading">
            <h1 id={`category-${category}`}>{category}</h1>
            <Show when={!searching()}><button onClick={(e) => { opener = e.currentTarget; setRestoring(category); confirm.showModal(); }}>Load Defaults</button></Show>
          </div>
          <For each={rows().filter((r) => r.category === category)}>{(row) => <div class="settings-row">
            <div class="settings-copy"><label id={`label-${row.key}`} for={`setting-${row.key}`}>{row.name}</label><p id={`description-${row.key}`}>{row.description}</p></div>
            <Show when={isChoiceKey(row.key)} fallback={
              <Show when={isToggleKey(row.key)} fallback={
                <div class="settings-number">
                  <button aria-label={`Decrease ${row.category} ${row.name}`} disabled={saving()} onClick={() => void save(row.key, settingNumber(row.key, Number(settings()[row.key]) - settingStep(row.key), settings().buffer_font_size))}>−</button>
                  <input id={`setting-${row.key}`} aria-describedby={`description-${row.key}`} type="number" step="any" value={settings()[row.key] as number} disabled={saving()} onChange={(e) => void save(row.key, settingNumber(row.key, e.currentTarget.valueAsNumber, settings().buffer_font_size))} />
                  <button aria-label={`Increase ${row.category} ${row.name}`} disabled={saving()} onClick={() => void save(row.key, settingNumber(row.key, Number(settings()[row.key]) + settingStep(row.key), settings().buffer_font_size))}>+</button>
                </div>
              }>
                <input id={`setting-${row.key}`} class="settings-toggle" type="checkbox" aria-describedby={`description-${row.key}`} checked={settings()[row.key] as boolean} disabled={saving()} onChange={(e) => void save(row.key, e.currentTarget.checked)} />
              </Show>
            }>
              {(() => {
                let items: ReturnType<typeof settingMenu> = [];
                const open = (button: HTMLButtonElement, last = false) => {
                  if (saving()) return;
                  items = settingMenu(row.key as ChoiceKey, String(settings()[row.key]), (value) => void save(row.key, value), choices);
                  const at = button.getBoundingClientRect();
                  openContextMenu({ x: at.right, y: at.bottom + SETTINGS_DROPDOWN_OFFSET_Y }, items, true);
                  commands.get(last ? "menu::SelectLast" : "menu::SelectFirst")?.();
                };
                return <button id={`setting-${row.key}`} class="settings-dropdown" aria-labelledby={`label-${row.key} value-${row.key}`} aria-describedby={`description-${row.key}`} aria-haspopup="menu" aria-controls="context-menu" aria-expanded={isContextMenuOpen(items)} aria-disabled={saving()}
                  onClick={(e) => open(e.currentTarget)} onKeyDown={(e) => {
                    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); open(e.currentTarget, e.key === "ArrowUp"); }
                  }}><span id={`value-${row.key}`}>{settings()[row.key]}</span><Icon name="chevron_up_down" /></button>;
              })()}
            </Show>
          </div>}</For>
        </>}</For>
        <Show when={!rows().length}><p>No settings found.</p></Show>
      </main>
    </div>
    <dialog class="settings-confirm" ref={confirm} aria-labelledby="confirm-title" aria-describedby="confirm-detail" aria-modal="true" onClose={() => opener?.focus()}>
      <h2 id="confirm-title">Restore all {restoring()} settings to their defaults?</h2>
      <p id="confirm-detail">This cannot be undone.</p>
      <div class="settings-confirm-buttons">
        <button onClick={() => { confirm.close(); void writeFile(() => resetSettings(restoring())); }}>Load Defaults</button>
        <button autofocus onClick={() => confirm.close()}>Cancel</button>
      </div>
    </dialog>
    <AppMenu popupOnly />
  </div>;
}
