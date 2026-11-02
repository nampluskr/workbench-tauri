// Wires the theme engine to the editor (CM6 light/dark flag) and to the native
// maximize button colors (caption.rs). SPEC R-8 / R-4.
import { invoke } from "@tauri-apps/api/core";
import { EditorView } from "@codemirror/view";
import { allViews } from "../poc/editorStore";
import { applySyntaxTheme, syntaxRefresh } from "../syntax/highlight";
import { appearance } from "../poc/zedEditor";
import { composite, parseColor, toHex } from "./color";
import { onThemeChange, resolveTheme, type ThemeName } from "./theme";

function tokenValue(name: ThemeName, token: string): string | null {
  return resolveTheme(name)?.tokens.find((t) => t.token === token)?.value ?? null;
}

/** Colors for the native maximize button, alpha composited on the title bar. */
export function captionColors(name: ThemeName) {
  const bg = parseColor(tokenValue(name, "title_bar.background") ?? "#000000")!;
  const inactive = parseColor(tokenValue(name, "title_bar.inactive_background") ?? "#000000")!;
  const over = (token: string) => {
    const c = parseColor(tokenValue(name, token) ?? "#00000000");
    return toHex(c ? composite(c, bg) : bg);
  };
  const fg = parseColor(tokenValue(name, "text") ?? "#ffffff")!;
  return {
    background: toHex(bg),
    inactiveBackground: toHex(inactive),
    hover: over("ghost_element.hover"),
    pressed: over("ghost_element.active"),
    foreground: toHex(composite(fg, bg)),
  };
}

export const captionSync = { last: null as null | Record<string, string>, error: null as null | string };
let captionPending: Promise<boolean> = Promise.resolve(true);

/** Resolves when the last caption_set_colors call has finished (true = applied). */
export function captionApplied(): Promise<boolean> {
  return captionPending;
}

export function installThemeBridge(): void {
  onThemeChange((name, mode) => {
    applySyntaxTheme(name);
    for (const view of allViews()) {
      view.dispatch({
        effects: [appearance.reconfigure(EditorView.darkTheme.of(mode === "dark")), syntaxRefresh.of(null)],
      });
    }
    const colors = captionColors(name);
    captionSync.last = colors;
    captionPending = invoke("caption_set_colors", colors).then(
      () => {
        captionSync.error = null;
        return true;
      },
      (e) => {
        captionSync.error = String(e);
        return false;
      },
    );
  });
}
