import { commands } from "../keymap/keyboard.ts";
import { setCategory } from "../extensions/state.ts";
import type { Category } from "../extensions/model.ts";
import { saveSetting, settings, showTheme } from "../settings/load.ts";
import { closePicker, isPickerOpen, openPicker } from "../shell/Picker.tsx";
import { notify } from "../shell/toast.ts";
import { iconThemeNames, setAppliedIconTheme } from "./icons.ts";
import { iconThemeSelector, themeSelector } from "./selector.ts";
import { themeNames } from "./themes.ts";

const report = (error: unknown) => notify([String(error)]);
const openExtensions = (category: Category) => { setCategory(category); commands.get("zed::Extensions")?.(); };

// I-4: "v" > Themes… and Ctrl-K Ctrl-T. The same key again closes the modal and undoes the preview (P-001).
commands.set("theme_selector::Toggle", () => {
  if (isPickerOpen()) return closePicker();
  openPicker(themeSelector({
    themes: themeNames,
    current: settings().theme,
    preview: (name) => void showTheme(name).catch(report),
    save: (name) => saveSetting("theme", name),
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
