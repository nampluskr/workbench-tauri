import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { commands } from "../keymap/keyboard.ts";
import { allTabs, openFile } from "../workspace/context.ts";
import { eachContext, editorContext } from "../workspace/store.ts";
import { notify } from "../shell/toast.ts";

export const isSettingsPath = (path: string) => /[\\/]workbench-tauri[\\/]settings\.json$/i.test(path);

export async function installSettingsCommands(): Promise<void> {
  commands.set("zed::OpenSettings", () => void invoke("open_settings").catch((error) => notify([String(error)])));
  await listen("edit-user-settings", async () => {
    try { openFile(editorContext(), await invoke<string>("ensure_user_settings"), false, true); }
    catch (error) { notify([String(error)]); }
  });
  await listen("user-settings-changed", () => {
    eachContext((ctx) => {
      for (const doc of new Set(allTabs(ctx).filter((tab) => isSettingsPath(tab.path)).map((tab) => tab.file.doc))) void doc.read();
    });
  });
}
