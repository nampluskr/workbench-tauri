import { createMemo, createSignal, For, Show } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import TitleBar from "../shell/TitleBar.tsx";
import Icon from "../shell/Icon.tsx";
import AppMenu, { isContextMenuOpen, openContextMenu } from "../shell/AppMenu.tsx";
import { commands } from "../keymap/keyboard.ts";
import { SETTINGS_DROPDOWN_OFFSET_Y } from "../spec/metrics.ts";
import { filterSettings, settingMenu, type SettingKey } from "./model.ts";
import { saveSetting, settings } from "./load.ts";
import "./settings.css";

export default function SettingsWindow() {
  document.title = "Settings";
  const [query, setQuery] = createSignal("");
  const [error, setError] = createSignal("");
  const [saving, setSaving] = createSignal(false);
  const rows = createMemo(() => filterSettings(query()));
  const save = async (key: SettingKey, value: string | number) => {
    if (saving()) return;
    setSaving(true);
    try { await saveSetting(key, value); setError(""); }
    catch (error) { setError(String(error)); }
    finally { setSaving(false); }
  };
  return <div class="settings-window">
    <TitleBar settings />
    <div class="settings-body">
      <nav class="settings-nav" aria-label="Settings categories">
        <div class="settings-search"><Icon name="magnifying_glass" /><input type="search" placeholder="Search settings…" aria-label="Search settings" value={query()} onInput={(e) => setQuery(e.currentTarget.value)} /></div>
        <Show when={rows().length}><button class="settings-category" aria-current="page" onClick={() => document.getElementById("appearance")?.scrollIntoView()}><Icon name="chevron_right" />Appearance</button></Show>
      </nav>
      <main class="settings-content">
        <div class="settings-toolbar"><span class="settings-scope" aria-label="Settings scope: User">User</span><button onClick={() => void invoke("edit_user_settings").catch((error) => setError(String(error)))}>Edit in settings.json</button></div>
        <h1 id="appearance">Appearance</h1>
        <Show when={error()}><p role="alert">{error()}</p></Show>
        <For each={["Theme", "Buffer Font", "UI Font"]}>{(section) => <Show when={rows().some((r) => r.section === section)}>
          <h2>{section}</h2>
          <For each={rows().filter((r) => r.section === section)}>{(row) => <div class="settings-row">
            <div class="settings-copy"><label id={`label-${row.key}`} for={`setting-${row.key}`}>{row.name}</label><p id={`description-${row.key}`}>{row.description}</p></div>
            <Show when={row.key === "theme" || row.key === "icon_theme"} fallback={
              <div class="settings-number">
                <button aria-label={`Decrease ${row.section} Font Size`} disabled={saving()} onClick={() => void save(row.key, Number(settings()[row.key]) - 1)}>−</button>
                <input id={`setting-${row.key}`} aria-describedby={`description-${row.key}`} type="number" step="any" value={settings()[row.key]} disabled={saving()} onChange={(e) => void save(row.key, e.currentTarget.valueAsNumber)} />
                <button aria-label={`Increase ${row.section} Font Size`} disabled={saving()} onClick={() => void save(row.key, Number(settings()[row.key]) + 1)}>+</button>
              </div>
            }>
              {(() => {
                let items: ReturnType<typeof settingMenu> = [];
                const open = (button: HTMLButtonElement, last = false) => {
                  if (saving()) return;
                  items = settingMenu(row.key as "theme" | "icon_theme", String(settings()[row.key]), (value) => void save(row.key, value));
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
        </Show>}</For>
        <Show when={!rows().length}><p>No settings found.</p></Show>
      </main>
    </div>
    <AppMenu popupOnly />
  </div>;
}
