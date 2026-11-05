import { BUILTIN } from "./builtin.ts";
import { Keymap, strokeOf, type ContextNode } from "./engine.ts";

// D-5: Tauri 2.12.5 does not expose WebView2's AreBrowserAcceleratorKeysEnabled (wry has it,
// tauri/tauri-runtime-wry do not), so browser accelerators are stopped in a capture-phase keydown.
// 03-tauri R-20: the sure keys plus the keys to test. "ctrl-=" is Ctrl+Plus on layouts where + needs Shift.
export const BROWSER_KEYS: ReadonlySet<string> = new Set([
  "ctrl-p", "ctrl-f", "ctrl-r", "f5", "f3", "alt-left", "alt-right",
  "ctrl-+", "ctrl--", "ctrl-=", "ctrl-w", "ctrl-tab", "f1", "f6",
]);

export const keymap = new Keymap();
keymap.addSections("default", BUILTIN);
/** Action name -> handler. Its keys are the actions keymap.json may name (K-085). */
export const commands = new Map<string, () => void>();
// Actions whose behavior arrives in a later Phase are registered as no-ops; that Phase replaces them with commands.set.
for (const { bindings } of BUILTIN) for (const action of Object.values(bindings)) if (typeof action === "string") commands.set(action, () => {});

let pending: string[] = [];

// Zed's window-level base context: Workspace bindings match wherever focus is, including on no element.
const WORKSPACE_ROOT: ContextNode = new Set(["Workspace"]);

/** Context stack from `data-keymap-context="A B"` attributes, root first, under the Workspace base. */
function contextStack(target: EventTarget | null): ContextNode[] {
  const stack: ContextNode[] = [];
  for (let el = target instanceof Element ? target : null; el; el = el.parentElement) {
    const names = (el as HTMLElement).dataset?.keymapContext;
    if (names) stack.unshift(new Set(names.split(" ")));
  }
  return [WORKSPACE_ROOT, ...stack];
}

function onKeyDown(e: KeyboardEvent): void {
  const stroke = strokeOf(e);
  if (!stroke) return;
  const stack = contextStack(e.target);
  let strokes = [...pending, stroke];
  let result = keymap.dispatch(strokes, stack);
  // A stroke that does not continue the chord starts over on its own.
  if (result.type === "none" && pending.length) result = keymap.dispatch((strokes = [stroke]), stack);
  pending = result.type === "pending" ? strokes : [];
  if (result.type === "match") commands.get(typeof result.action === "string" ? result.action : result.action[0])?.();
  if (result.type !== "none" || BROWSER_KEYS.has(stroke)) e.preventDefault();
}

export function installKeyboard(): void {
  window.addEventListener("keydown", onKeyDown, true);
  // The browser's own context menu must not appear (03-tauri 4절).
  window.addEventListener("contextmenu", (e) => e.preventDefault(), true);
}
