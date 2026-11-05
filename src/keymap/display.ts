import type { ContextNode, Keymap } from "./engine.ts";

// Shortcut text for menus and tooltips (R-5, L-217~L-221).
// Order Fn -> Ctrl -> Win -> Alt -> Shift -> key (L-219). The engine has no Fn key, so it is left out.
const MODIFIER_ORDER = ["ctrl", "win", "alt", "shift"];
const KEY_NAMES: Record<string, string> = { pageup: "PageUp", pagedown: "PageDown" }; // L-220 exceptions
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "ctrl-k ctrl-shift-c" -> ["Ctrl-K", "Ctrl-Shift-C"]: one chunk per keystroke (L-221). */
export function displayChunks(keys: string): string[] {
  return keys.split(" ").map((stroke) => {
    const mods = new Set<string>();
    let key = stroke;
    for (let m; (m = /^(ctrl|alt|shift|win)-(?=.)/.exec(key)); key = key.slice(m[0].length)) mods.add(m[1]);
    return [...MODIFIER_ORDER.filter((mod) => mods.has(mod)).map(capitalize), KEY_NAMES[key] ?? capitalize(key)].join("-");
  });
}

/**
 * The shortcut to show for an action: the unshadowed last binding in the focus context (I-704),
 * else the last one anywhere in the window (I-307, I-510). Undefined means no shortcut area (L-223).
 */
export function shortcutFor(keymap: Keymap, action: string, stack: ContextNode[]): string[] | undefined {
  const keys = keymap.keyFor(action, stack) ?? keymap.keyForAnywhere(action, stack.slice(0, 1));
  return keys ? displayChunks(keys) : undefined;
}
