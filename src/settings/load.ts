import { createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { EditorView } from "@codemirror/view";
import { applyMetrics, type PreviewGaps } from "../spec/metrics.ts";
import { applyTheme } from "../theme/apply.ts";
import { choices } from "./choices.ts";
import { setAppliedIconTheme } from "../theme/icons.ts";
import { notify } from "../shell/toast.ts";
import { remeasureForFont } from "../editor/extensions.ts";
import { eachView, setViewOptions, type ToggleOption } from "../editor/view-options.ts";
import { stepEditorFontSize, type FontTarget } from "../editor/font-size.ts";
import { DEFAULTS, parseSettings, updateSettings, type SettingKey, type SettingValue, type Settings } from "./model.ts";

export const [settings, setSettings] = createSignal({ ...DEFAULTS });
let queue = Promise.resolve();
// U-17: the Ctrl+= size, in memory only (Zed persist = false). null follows the buffer_font_size setting.
let editorFontSize: number | null = null;
// I-1: the same for the Markdown preview (one value for every preview tab). null follows the preview_font_size setting.
let previewFontSize: number | null = null;
// I-6 / I-7: the Ctrl+Alt+L and Alt+Z values, in memory only like the sizes above. null follows the editor_line_numbers / editor_word_wrap setting.
const temporary: Record<ToggleOption, boolean | null> = { lineNumbers: null, wordWrap: null };

const previewGaps = (s: Settings): PreviewGaps => ({ paragraphLine: s.preview_paragraph_line_gap, paragraph: s.preview_paragraph_gap, listLine: s.preview_list_line_gap, list: s.preview_list_gap });

async function reload(): Promise<void> {
  let next = settings();
  try { next = parseSettings(await invoke<string | null>("read_user_settings"), choices); }
  catch (error) { notify([String(error)]); }
  try {
    // A changed buffer_font_size is the newer choice, so it replaces the temporary size.
    if (next.buffer_font_size !== settings().buffer_font_size) editorFontSize = null;
    if (next.preview_font_size !== settings().preview_font_size) previewFontSize = null;
    if (next.editor_line_numbers !== settings().editor_line_numbers) temporary.lineNumbers = null;
    if (next.editor_word_wrap !== settings().editor_word_wrap) temporary.wordWrap = null;
    await applyMetrics(next.ui_font_size, next.buffer_font_size, editorFontSize ?? next.buffer_font_size, previewFontSize ?? next.preview_font_size, next.editor_line_height, previewGaps(next));
    if (next.editor_line_height !== settings().editor_line_height) remeasureEditors(); // I-8: the line height map and the gutter are measured, not read from the variable
    showViewOptions(next);
    await showTheme(next.theme, next.editor_theme, next.preview_theme);
    setAppliedIconTheme(next.icon_theme);
    setSettings(next);
  } catch (error) { notify([String(error)]); }
}

/** Apply themes in memory only (the Select Theme preview; one name for all three) and refresh what depends on the editor theme's syntax keys. */
export async function showTheme(ui: string, editor = ui, preview = ui): Promise<void> {
  await applyTheme(ui, editor, preview);
  document.querySelectorAll<HTMLElement>(".cm-editor").forEach((el) => {
    const view = EditorView.findFromDOM(el);
    view?.dispatch({}); // Rebuild visible syntax captures against the new theme's keys.
    view?.requestMeasure();
  });
}

const remeasureEditors = () => eachView(remeasureForFont);

const showViewOptions = (s: Settings) => setViewOptions({ lineNumbers: temporary.lineNumbers ?? s.editor_line_numbers, wordWrap: temporary.wordWrap ?? s.editor_word_wrap,
  indentGuides: s.editor_indent_guides, renderWhitespace: s.editor_render_whitespace });

/** I-6 / I-7: flip line numbers or Markdown wrapping in every open editor, without saving. A changed setting (reload) replaces it. */
export function toggleViewOption(option: ToggleOption): void {
  const s = settings();
  temporary[option] = !(temporary[option] ?? (option === "lineNumbers" ? s.editor_line_numbers : s.editor_word_wrap));
  showViewOptions(s);
}

/** U-17 / I-1: Zed IncreaseBufferFontSize (1), DecreaseBufferFontSize (-1), ResetBufferFontSize (0), all with persist = false; the target is the focused editor or preview. */
export function adjustFontSize(target: FontTarget, direction: -1 | 0 | 1): void {
  queue = queue.then(async () => {
    const { ui_font_size, buffer_font_size, preview_font_size } = settings();
    if (target === "editor") editorFontSize = direction === 0 ? null : stepEditorFontSize(editorFontSize ?? buffer_font_size, direction, buffer_font_size);
    else previewFontSize = direction === 0 ? null : stepEditorFontSize(previewFontSize ?? preview_font_size, direction, preview_font_size);
    try {
      await applyMetrics(ui_font_size, buffer_font_size, editorFontSize ?? buffer_font_size, previewFontSize ?? preview_font_size, settings().editor_line_height, previewGaps(settings()));
      if (target === "editor") remeasureEditors(); // line height and character width changed; the gutter, find highlights and cursors are redrawn from them
    } catch (error) { notify([String(error)]); }
  });
}

export function loadSettings(): Promise<void> {
  queue = queue.then(reload);
  return queue;
}

export async function watchSettings(): Promise<void> {
  await listen("user-settings-changed", () => void loadSettings());
}

/** Several keys in one write (the theme selector sets all three themes). */
export async function saveSettings(values: Partial<Record<SettingKey, SettingValue>>): Promise<void> {
  const expected = await invoke<string | null>("read_user_settings");
  await invoke("write_user_settings", { expected, json: updateSettings(expected, values, choices) });
  await loadSettings();
}

export const saveSetting = (key: SettingKey, value: SettingValue) => saveSettings({ [key]: value });
