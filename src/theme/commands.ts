import { commands } from "../keymap/keyboard.ts";
import { setCategory } from "../extensions/state.ts";
import type { Category } from "../extensions/model.ts";
import { saveSetting, saveSettings, settings, showTheme } from "../settings/load.ts";
import { closePicker, isPickerOpen, openPicker } from "../shell/Picker.tsx";
import { notify } from "../shell/toast.ts";
import { iconThemeNames, setAppliedIconTheme } from "./icons.ts";
import { iconThemeSelector, themeSelector } from "./selector.ts";
import { themeNames } from "./themes.ts";

const report = (error: unknown) => notify([String(error)]);
const openExtensions = (category: Category) => { setCategory(category); commands.get("zed::Extensions")?.(); };

// I-4: "v" > Themes… and Ctrl-K Ctrl-T. The same key again closes the modal and undoes the preview (P-001).
// I-3: one choice sets the UI, editor and preview themes together; closing without a choice restores the three opening values.
commands.set("theme_selector::Toggle", () => {
  if (isPickerOpen()) return closePicker();
  const { theme, editor_theme, preview_theme } = settings();
  openPicker(themeSelector({
    themes: themeNames,
    current: theme,
    preview: (name) => void showTheme(name).catch(report),
    revert: () => void showTheme(theme, editor_theme, preview_theme).catch(report),
    save: (name) => saveSettings({ theme: name, editor_theme: name, preview_theme: name }),
    fail: report,
    viewThemes: () => openExtensions("Themes"),
  }));
});

// I-3: "v" > Icon Themes… (no default key in Zed, P-010).
commands.set("icon_theme_selector::Toggle", () => {
  if (isPickerOpen()) return closePicker();
  openPicker(iconThemeSelector({
    themes: iconThemeNames,
    current: settings().icon_theme,
    preview: setAppliedIconTheme,
    save: (name) => saveSetting("icon_theme", name),
    fail: report,
    viewIconThemes: () => openExtensions("Icon Themes"),
  }));
});
