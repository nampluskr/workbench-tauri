import { invoke } from "@tauri-apps/api/core";
import { notify } from "../shell/toast.ts";
import { commands, keymap } from "./keyboard.ts";
import { applyUserKeymap, ERR_LOAD } from "./user.ts";

/** Lay %APPDATA%\workbench-tauri\keymap.json over the built-in keymap; a missing file is silent (R-2). */
export async function loadUserKeymap(): Promise<void> {
  let errors: string[];
  try {
    const text = await invoke<string | null>("read_user_keymap");
    errors = text === null ? [] : applyUserKeymap(keymap, text, (name) => commands.has(name));
  } catch {
    errors = [ERR_LOAD];
  }
  if (errors.length) notify(errors);
}
