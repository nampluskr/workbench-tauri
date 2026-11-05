import { BUILTIN } from "./builtin.ts";
import { Keymap, strokeOf, type ContextNode } from "./engine.ts";

// D-5: Tauri 2.12.5 does not expose WebView2's AreBrowserAcceleratorKeysEnabled (wry has it,
// tauri/tauri-runtime-wry do not), so browser accelerators are stopped in a capture-phase keydown.
// 03-tauri R-20: the sure keys plus the keys to test. "ctrl-=" is Ctrl+Plus on layouts where + needs Shift.
export const BROWSER_KEYS: ReadonlySet<string> = new Set([
  "ctrl-p", "ctrl-f", "ctrl-r", "f5", "f3", "alt-left", "alt-right",
  "ctrl-+", "ctrl--", "ctrl-=", "ctrl-w", "ctrl-tab", "f1", "f6",
  "f10", // WebView2 would enter the window-menu mode even when the keymap does not bind F10 (e.g. a null)
]);

export const keymap = new Keymap();
keymap.addSections("default", BUILTIN);
/** Action name -> handler. Its keys are the actions keymap.json may name (K-085). */
export const commands = new Map<string, () => void>();
// Actions whose behavior arrives in a later Phase are registered as no-ops; that Phase replaces them with commands.set.
for (const { bindings } of BUILTIN) for (const action of Object.values(bindings)) if (typeof action === "string") commands.set(action, () => {});

/** An open menu takes over a matched action here (I-520). Return true when it handled the action. */
export const hooks: { beforeCommand: ((action: string) => boolean) | null } = { beforeCommand: null };

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

/** Context stack of the focused element, as the keymap sees it (menus and tooltips look keys up here). */
export const focusStack = (): ContextNode[] => contextStack(document.activeElement);

function onKeyDown(e: KeyboardEvent): void {
  const stroke = strokeOf(e);
  if (!stroke) return;
  const stack = contextStack(e.target);
  let strokes = [...pending, stroke];
  let result = keymap.dispatch(strokes, stack);
  // A stroke that does not continue the chord starts over on its own.
  if (result.type === "none" && pending.length) result = keymap.dispatch((strokes = [stroke]), stack);
  pending = result.type === "pending" ? strokes : [];
  if (result.type === "match") {
    const name = typeof result.action === "string" ? result.action : result.action[0];
    if (!hooks.beforeCommand?.(name)) commands.get(name)?.();
  }
  if (result.type !== "none" || BROWSER_KEYS.has(stroke)) e.preventDefault();
}

export function installKeyboard(): void {
  window.addEventListener("keydown", onKeyDown, true);
  // A lone Alt press-and-release activates the window menu on Windows; nothing is bound to it here.
  window.addEventListener("keyup", (e) => e.key === "Alt" && e.preventDefault(), true);
  // The browser's own context menu must not appear (03-tauri 4절).
  window.addEventListener("contextmenu", (e) => e.preventDefault(), true);
}
