import { createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { EditorView } from "@codemirror/view";
import { applyMetrics } from "../spec/metrics.ts";
import { applyTheme } from "../theme/apply.ts";
import { themeNames } from "../theme/themes.ts";
import { notify } from "../shell/toast.ts";
import { DEFAULTS, parseSettings, updateSetting, type SettingKey } from "./model.ts";

export const [settings, setSettings] = createSignal({ ...DEFAULTS });
let queue = Promise.resolve();

async function reload(): Promise<void> {
  let next = settings();
  try { next = parseSettings(await invoke<string | null>("read_user_settings"), themeNames); }
  catch (error) { notify([String(error)]); }
  try {
    await applyMetrics(next.ui_font_size, next.buffer_font_size);
    await applyTheme(next.theme);
    setSettings(next);
    document.querySelectorAll<HTMLElement>(".cm-editor").forEach((el) => {
      const view = EditorView.findFromDOM(el);
      view?.dispatch({}); // Rebuild visible syntax captures against the new theme's keys.
      view?.requestMeasure();
    });
  } catch (error) { notify([String(error)]); }
}

export function loadSettings(): Promise<void> {
  queue = queue.then(reload);
  return queue;
}

export async function watchSettings(): Promise<void> {
  await listen("user-settings-changed", () => void loadSettings());
}

export async function saveSetting(key: SettingKey, value: string | number): Promise<void> {
  const expected = await invoke<string | null>("read_user_settings");
  await invoke("write_user_settings", { expected, json: updateSetting(expected, key, value, themeNames) });
  await loadSettings();
}
