import { BUILTIN, EDITOR_BINDINGS } from "./builtin.ts";
import { KEYMAP_EDITOR_BINDINGS } from "./edit.ts";
import { SETTINGS_BINDINGS } from "../settings/model.ts";
import { EXTENSIONS_BINDINGS } from "../extensions/model.ts";
import { THEME_SELECTOR_BINDINGS } from "../theme/selector.ts";
import { STATUS_BINDINGS } from "../shell/status.ts";
import { TAB_BINDINGS } from "../shell/tab-menu.ts";
import { NAV_BINDINGS } from "../workspace/nav-history.ts";
import { SIDEBAR_BINDINGS } from "../workspace/folders.ts";
import { Keymap, strokeOf, type ContextNode } from "./engine.ts";
import { rememberImeShortcut } from "../editor/ime.ts";

// D-5: Tauri 2.12.5 does not expose WebView2's AreBrowserAcceleratorKeysEnabled (wry has it,
// tauri/tauri-runtime-wry do not), so browser accelerators are stopped in a capture-phase keydown.
// 03-tauri R-20: the sure keys plus the keys to test. "ctrl-=" is Ctrl+Plus on layouts where + needs Shift.
export const BROWSER_KEYS: ReadonlySet<string> = new Set([
  "ctrl-p", "ctrl-f", "ctrl-r", "f5", "f3", "alt-left", "alt-right",
  "ctrl-+", "ctrl--", "ctrl-=", "ctrl-w", "ctrl-tab", "f1", "f6",
  "ctrl-shift-v", // paste as plain text: Zed binds it only to previews, so an unmatched press must not paste
  "f10", // WebView2 would enter the window-menu mode even when the keymap does not bind F10 (e.g. a null)
]);

export const keymap = new Keymap();
keymap.addSections("default", BUILTIN);
keymap.addSections("default", EDITOR_BINDINGS);
keymap.addSections("default", KEYMAP_EDITOR_BINDINGS);
keymap.addSections("default", SETTINGS_BINDINGS);
keymap.addSections("default", EXTENSIONS_BINDINGS);
keymap.addSections("default", THEME_SELECTOR_BINDINGS);
keymap.addSections("default", STATUS_BINDINGS);
keymap.addSections("default", NAV_BINDINGS);
keymap.addSections("default", TAB_BINDINGS);
keymap.addSections("default", SIDEBAR_BINDINGS);
/** Action name -> handler. Its keys are the actions keymap.json may name (K-085). */
export const commands = new Map<string, () => void>();
// Actions whose behavior arrives in a later Phase are registered as no-ops; that Phase replaces them with commands.set.
for (const { bindings } of [...BUILTIN, ...EDITOR_BINDINGS, ...KEYMAP_EDITOR_BINDINGS, ...EXTENSIONS_BINDINGS, ...THEME_SELECTOR_BINDINGS, ...STATUS_BINDINGS, ...NAV_BINDINGS, ...TAB_BINDINGS, ...SIDEBAR_BINDINGS]) for (const action of Object.values(bindings)) if (typeof action === "string") commands.set(action, () => {});

/** An open menu takes over a matched action here (I-520). Return true when it handled the action. */
export const hooks: { beforeCommand: ((action: string) => boolean) | null; context: (() => ContextNode[] | null) | null } = { beforeCommand: null, context: null };

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

export function onKeyDown(e: KeyboardEvent): void {
  if (e.target instanceof Element && e.target.closest("[data-keymap-recording]")) { pending = []; return; }
  const stroke = strokeOf(e);
  if (!stroke) return;
  // Search inputs use the app keymap for panel commands; ordinary text edits stay native.
  const searchStack = contextStack(e.target);
  if (searchStack.some((node) => node.has("EditorSearch")) && !e.isComposing && e.keyCode !== 229) {
    const result = keymap.dispatch([stroke], searchStack);
    if (result.type === "match" && /^editor::(Find|Replace|FindNext|FindPrevious|SearchCaseSensitive|SearchWholeWord|SearchRegexp|ReplaceNext|ReplaceAll|SelectSearchMatches|Cancel)$/.test(typeof result.action === "string" ? result.action : result.action[0])) {
      const name = typeof result.action === "string" ? result.action : result.action[0];
      if (!hooks.beforeCommand?.(name)) commands.get(name)?.();
      pending = [];
      e.preventDefault();
      return;
    }
  }
  const input = e.target instanceof HTMLInputElement;
  if (input) {
    // shortcut: inputs dispatch only modified, non-editing Workspace/global keys; extend for unmodified chords after Zed input-context verification.
    const editing = /^(backspace|delete|left|right|up|down|home|end|pageup|pagedown|insert|enter|escape|tab)$/.test(e.key.toLowerCase().replace(/^arrow/, "")) ||
      ((e.ctrlKey || e.metaKey) && !e.altKey && (e.shiftKey ? /^[avzy]$/i : /^[acxvzy]$/i).test(e.key));
    if (e.isComposing || e.keyCode === 229 || e.key === "Dead" || (e.ctrlKey && e.altKey) || editing) {
      pending = [];
      return;
    }
    if (!(e.ctrlKey || e.altKey || e.metaKey)) {
      pending = [];
      if (BROWSER_KEYS.has(stroke)) e.preventDefault();
      return;
    }
  }
  const sidebarSearch = input && stroke === "ctrl-f" && contextStack(e.target).some((node) => node.has("Sidebar"));
  const stack = input && !sidebarSearch ? [WORKSPACE_ROOT] : hooks.context?.() ?? contextStack(e.target);
  let strokes = [...pending, stroke];
  let result = keymap.dispatch(strokes, stack);
  // A stroke that does not continue the chord starts over on its own.
  if (result.type === "none" && pending.length) result = keymap.dispatch((strokes = [stroke]), stack);
  pending = result.type === "pending" ? strokes : [];
  if (result.type === "match") {
    const name = typeof result.action === "string" ? result.action : result.action[0];
    if (!hooks.beforeCommand?.(name)) commands.get(name)?.();
    rememberImeShortcut(e, stroke);
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
