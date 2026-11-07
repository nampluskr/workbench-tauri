import type { KeymapSection } from "../keymap/engine.ts";
import type { PickerConfig } from "../shell/picker.ts";

// I-4: Ctrl-K Ctrl-T (Zed default-windows.json, Workspace context). Kept out of BUILTIN, whose test pins the v0.4 table.
// The icon theme selector has no default key in Zed (P-010).
export const THEME_SELECTOR_BINDINGS: KeymapSection[] = [{ context: "Workspace", bindings: { "ctrl-k ctrl-t": "theme_selector::Toggle" } }];

type SelectorDeps = {
  themes: readonly string[];
  /** The setting's value when the picker opens. */
  current: string;
  /** Show a choice without saving it. */
  preview: (name: string) => void;
  /** Write the setting to settings.json (comments kept) and apply it. */
  save: (name: string) => Promise<void>;
  /** A save failed. */
  fail: (error: unknown) => void;
};
export type ThemeSelectorDeps = SelectorDeps & { /** Open the Extensions tab on the Themes category. */ installThemes: () => void };
export type IconThemeSelectorDeps = SelectorDeps & { /** Open the Extensions tab on the Icon Themes category. */ installIconThemes: () => void };

/** Preview while moving, save on confirm, undo on any other close (P-010, P-011, T-21). */
function selector(placeholder: string, install: string, run: () => void, d: SelectorDeps): PickerConfig {
  return {
    placeholder,
    items: d.themes,
    checked: d.current,
    footer: { label: install, run },
    preview: d.preview,
    confirm: async (name) => {
      try { await d.save(name); }
      catch (error) { d.fail(error); d.preview(d.current); }
    },
    revert: () => d.preview(d.current),
  };
}

/** "Select Theme..." */
export const themeSelector = (d: ThemeSelectorDeps): PickerConfig => selector("Select Theme...", "Install Themes", d.installThemes, d);
/** "Select Icon Theme..." */
export const iconThemeSelector = (d: IconThemeSelectorDeps): PickerConfig => selector("Select Icon Theme...", "Install Icon Themes", d.installIconThemes, d);
