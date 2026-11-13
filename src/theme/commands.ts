import { commands } from "../keymap/keyboard.ts";
import { setCategory } from "../extensions/state.ts";
import type { Category } from "../extensions/model.ts";
import { saveSetting, saveSettings, settings, showAreaThemes, showTheme } from "../settings/load.ts";
import { areaTheme } from "../settings/model.ts";
import { closePicker, isPickerOpen, openPicker } from "../shell/Picker.tsx";
import { notify } from "../shell/toast.ts";
import { iconThemeNames, setAppliedIconTheme } from "./icons.ts";
import { iconThemeSelector, themeSelector } from "./selector.ts";
import { registry, themeNames } from "./themes.ts";
import { pickTheme } from "./registry.ts";

const report = (error: unknown) => notify([String(error)]);
const openExtensions = (category: Category) => { setCategory(category); commands.get("zed::Extensions")?.(); };

// I-4: "v" > Themes… and Ctrl-K Ctrl-T. The same key again closes the modal and undoes the preview (P-001).
// core v0.8.2 I-2: one choice goes into all three areas' dark (or light) theme setting and turns all three that way; closing without a
// choice restores the three opening themes. The list is dark themes, a line, light themes (themeNames is in that order).
commands.set("theme_selector::Toggle", () => {
  if (isPickerOpen()) return closePicker();
  openPicker(themeSelector({
    themes: themeNames,
    current: areaTheme(settings(), "theme"),
    appearance: (name) => pickTheme(registry, name).appearance,
    preview: (name) => void showTheme(name).catch(report),
    revert: () => void showAreaThemes().catch(report),
    saveAll: saveSettings,
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
