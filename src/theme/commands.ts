import { commands } from "../keymap/keyboard.ts";
import { setCategory } from "../extensions/state.ts";
import { saveSetting, settings, showTheme } from "../settings/load.ts";
import { closePicker, isPickerOpen, openPicker } from "../shell/Picker.tsx";
import { notify } from "../shell/toast.ts";
import { themeSelector } from "./selector.ts";
import { themeNames } from "./themes.ts";

const report = (error: unknown) => notify([String(error)]);

// I-4: "v" > Themes… and Ctrl-K Ctrl-T. The same key again closes the modal and undoes the preview (P-001).
commands.set("theme_selector::Toggle", () => {
  if (isPickerOpen()) return closePicker();
  openPicker(themeSelector({
    themes: themeNames,
    current: settings().theme,
    preview: (name) => void showTheme(name).catch(report),
    save: (name) => saveSetting("theme", name),
    fail: report,
    installThemes: () => { setCategory("Themes"); commands.get("zed::Extensions")?.(); },
  }));
});
