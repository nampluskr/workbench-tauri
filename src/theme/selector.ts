import type { KeymapSection } from "../keymap/engine.ts";
import type { PickerConfig } from "../shell/picker.ts";
import { themeForAll, type Appearance, type SettingKey, type SettingValue } from "../settings/model.ts";

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
  /** Undo the preview; default: preview `current` again. A selector that sets several things at once passes its own. */
  revert?: () => void;
};
/** core v0.8.2 I-2: `themes` is dark ones then light ones; a choice is saved as several settings in one write (themeForAll). */
export type ThemeSelectorDeps = Omit<SelectorDeps, "save"> & {
  /** Open the Extensions tab on the Themes category. */ viewThemes: () => void;
  appearance: (name: string) => Appearance;
  saveAll: (values: Partial<Record<SettingKey, SettingValue>>) => Promise<void>;
};
export type IconThemeSelectorDeps = SelectorDeps & { /** Open the Extensions tab on the Icon Themes category. */ viewIconThemes: () => void };

/** Preview while moving, save on confirm, undo on any other close (P-010, P-011, T-21). */
function selector(placeholder: string, label: string, run: () => void, d: SelectorDeps, divideBefore?: string): PickerConfig {
  const revert = d.revert ?? (() => d.preview(d.current));
  return {
    placeholder,
    items: d.themes,
    divideBefore,
    checked: d.current,
    footer: { label, run },
    preview: d.preview,
    confirm: async (name) => {
      try { await d.save(name); }
      catch (error) { d.fail(error); revert(); }
    },
    revert,
  };
}

/**
 * "Select Theme...". core v0.8.2 I-2: a line parts the dark themes from the light ones, and the chosen theme goes into the dark (or
 * light) theme setting of all three areas, which all turn that way.
 */
export const themeSelector = (d: ThemeSelectorDeps): PickerConfig => selector("Select Theme...", "View Themes", d.viewThemes,
  { ...d, save: (name) => d.saveAll(themeForAll(name, d.appearance(name))) }, d.themes.find((name) => d.appearance(name) === "light"));
/** "Select Icon Theme..." */
export const iconThemeSelector = (d: IconThemeSelectorDeps): PickerConfig => selector("Select Icon Theme...", "View Icon Themes", d.viewIconThemes, d);
