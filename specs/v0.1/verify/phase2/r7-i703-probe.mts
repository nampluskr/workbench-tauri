// checker probe (not part of the app): deeper-context null vs shallower binding (I-703)
import { Keymap } from "../../../../src/keymap/engine.ts";
const path = [{ name: "Workspace" }, { name: "Pane" }, { name: "Editor" }];
const km = new Keymap();
km.add(
  { keys: "ctrl-j", action: "workspace::Act", context: "Workspace", source: "default" },
  { keys: "ctrl-j", action: null, context: "Editor", source: "base" },
);
console.log(JSON.stringify({ case: "Editor null (base) + Workspace binding (default), focus path Workspace>Pane>Editor", result: km.press("ctrl-j", path as any) }));
const km2 = new Keymap();
km2.add(
  { keys: "ctrl-j", action: "editor::Act", context: "Editor", source: "default" },
  { keys: "ctrl-j", action: null, context: "Workspace", source: "base" },
);
console.log(JSON.stringify({ case: "Workspace null (base) + Editor binding (default)", result: km2.press("ctrl-j", path as any) }));
