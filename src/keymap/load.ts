import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { notify } from "../shell/toast.ts";
import { commands, keymap } from "./keyboard.ts";
import { applyUserKeymap, ERR_LOAD } from "./user.ts";

/**
 * Lay %APPDATA%\workbench-tauri\keymap.json over the built-in keymap; a missing file is silent (R-2).
 * It runs again on every change, so the previous user bindings go first (R-4). Menus and tooltips look
 * keys up each time they open, so nothing else needs refreshing.
 */
export async function loadUserKeymap(): Promise<void> {
  let errors: string[];
  try {
    const text = await invoke<string | null>("read_user_keymap");
    keymap.clear("user"); // only after a successful read: a failed read keeps the bindings in use
    errors = text === null ? [] : applyUserKeymap(keymap, text, (name) => commands.has(name));
  } catch {
    errors = [ERR_LOAD];
  }
  if (errors.length) notify(errors);
}

/** R-4: the core watches keymap.json and emits this event when it changes. */
export function watchUserKeymap(): Promise<unknown> {
  return listen("user-keymap-changed", () => void loadUserKeymap());
}
