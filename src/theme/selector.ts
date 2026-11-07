import type { KeymapSection } from "../keymap/engine.ts";
import type { PickerConfig } from "../shell/picker.ts";

// I-4: Ctrl-K Ctrl-T (Zed default-windows.json, Workspace context). Kept out of BUILTIN, whose test pins the v0.4 table.
export const THEME_SELECTOR_BINDINGS: KeymapSection[] = [{ context: "Workspace", bindings: { "ctrl-k ctrl-t": "theme_selector::Toggle" } }];

export type ThemeSelectorDeps = {
  themes: readonly string[];
  /** The theme in the settings when the picker opens. */
  current: string;
  /** Show a theme without saving it. */
  preview: (name: string) => void;
  /** Write `theme` to settings.json (comments kept) and apply it. */
  save: (name: string) => Promise<void>;
  /** A save failed. */
  fail: (error: unknown) => void;
  /** Open the Extensions tab on the Themes category. */
  installThemes: () => void;
};

/** "Select Theme..." (P-010, T-21): preview while moving, save on confirm, undo on any other close. */
export function themeSelector(d: ThemeSelectorDeps): PickerConfig {
  return {
    placeholder: "Select Theme...",
    items: d.themes,
    checked: d.current,
    footer: { label: "Install Themes", run: d.installThemes },
    preview: d.preview,
    confirm: async (name) => {
      try { await d.save(name); }
      catch (error) { d.fail(error); d.preview(d.current); }
    },
    revert: () => d.preview(d.current),
  };
}
