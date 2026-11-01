// App stylesheet under the CSP: a <style> element carrying the same nonce
// Tauri put on index.html's carrier (see src/poc/zedEditor.ts cspNonce()).
// Needed for rules CSSOM style objects cannot express (:hover, :active).
import { cspNonce } from "../poc/zedEditor";

let sheet: HTMLStyleElement | null = null;

export function injectStyles(css: string): void {
  if (!sheet) {
    sheet = document.createElement("style");
    sheet.id = "zl-app-styles";
    const nonce = cspNonce();
    if (nonce) sheet.nonce = nonce;
    document.head.appendChild(sheet);
  }
  sheet.textContent += css + "\n";
}

/** L-02: rems_from_px(px) = px / 16 (root font size = ui_font_size, L-01). */
export function rem(px: number): string {
  return `${px / 16}rem`;
}

/** L-01: root rem = ui_font_size (default 16px). */
export const UI_FONT_SIZE_PX = 16;
