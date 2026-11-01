// Keyboard dispatch in the WebView (SPEC R-6, D-5, D-6 ②).
// Tauri 2.12.5 does not expose WebView2's AreBrowserAcceleratorKeysEnabled
// (wry 0.57.1 has `with_browser_accelerator_keys`, but no Tauri config or
// builder passes it through), so browser shortcuts are stopped with a
// capture-phase keydown listener that hands every keystroke to the keymap
// engine first. Phase 2 uses test bindings only (SPEC R-7, question Q6 A).
import { Keymap, keystrokeFromEvent, type Resolution } from "./engine.ts";
import type { ContextEntry } from "./context.ts";

/** 03-tauri R-20: keys WebView2 handles first ("확실한 키") and keys to test ("시험할 키"). */
export const BROWSER_KEYS_CERTAIN = [
  "ctrl-p",
  "ctrl-f",
  "ctrl-r",
  "f5",
  "f3",
  "alt-left",
  "alt-right",
  "ctrl-=",
  "ctrl-shift-=",
  "ctrl-+", // numpad plus (NumpadAdd)
  "ctrl--", // minus and numpad minus
] as const;
export const BROWSER_KEYS_TO_TEST = ["ctrl-w", "ctrl-tab", "f1", "f6"] as const;

/** Test bindings (Phase 2): one action per browser key so arrival is visible. */
function testBindings(km: Keymap) {
  for (const k of [...BROWSER_KEYS_CERTAIN, ...BROWSER_KEYS_TO_TEST]) {
    km.add({ keys: k, action: `test::Key`, args: k, context: "Workspace" });
  }
  km.add({ keys: "ctrl-k v", action: "test::Chord", context: "Workspace" });
}

export interface KeyLogEntry {
  t: number;
  keystroke: string | null;
  code: string;
  key: string;
  isTrusted: boolean;
  context: string;
  result: Resolution["kind"];
  action: string | null;
  args: unknown;
  prevented: boolean;
}

const LOG_LIMIT = 500;
const log: KeyLogEntry[] = [];
export const keymap = new Keymap();

/** Focus context path from the focused element (I-002). */
export function contextPath(el: Element | null): ContextEntry[] {
  const path: ContextEntry[] = [{ name: "Workspace" }];
  if (el?.closest("[data-poc-pane]")) path.push({ name: "Pane" });
  if (el?.closest(".cm-editor")) path.push({ name: "Editor" });
  return path;
}

const RESERVED = new Set<string>([...BROWSER_KEYS_CERTAIN, ...BROWSER_KEYS_TO_TEST]);

function onKeyDown(e: KeyboardEvent) {
  const ks = keystrokeFromEvent(e);
  const path = contextPath(document.activeElement);
  const r: Resolution = ks ? keymap.press(ks, path) : { kind: "none" };
  const consumed = r.kind !== "none" || (ks !== null && RESERVED.has(ks));
  if (consumed) {
    e.preventDefault();
    e.stopPropagation();
  }
  log.push({
    t: Math.round(performance.now()),
    keystroke: ks,
    code: e.code,
    key: e.key,
    isTrusted: e.isTrusted,
    context: path.map((p) => p.name).join(" > "),
    result: r.kind,
    action: r.kind === "action" ? r.action : null,
    args: r.kind === "action" ? r.args : null,
    prevented: e.defaultPrevented,
  });
  if (log.length > LOG_LIMIT) log.shift();
}

// ---- signals that a browser shortcut ran anyway ----

const SESSION_KEY = "zl-poc-page-loads";
function bumpLoads(): number {
  try {
    const n = Number(sessionStorage.getItem(SESSION_KEY) ?? "0") + 1;
    sessionStorage.setItem(SESSION_KEY, String(n));
    return n;
  } catch {
    return -1;
  }
}

const signals = {
  /** Page loads in this session (a reload by F5/Ctrl+R bumps it). */
  pageLoads: 0,
  beforePrint: 0,
  pageHide: 0,
  popState: 0,
  /** Zoom changes show up as devicePixelRatio changes. */
  dprChanges: [] as number[],
  contextMenusBlocked: 0,
};

export function installKeyboard(): void {
  testBindings(keymap);
  window.addEventListener("keydown", onKeyDown, { capture: true });
  // R-6: no browser context menu (03-tauri 4절 "메뉴" 행).
  window.addEventListener(
    "contextmenu",
    (e) => {
      e.preventDefault();
      signals.contextMenusBlocked++;
    },
    { capture: true },
  );
  signals.pageLoads = bumpLoads();
  window.addEventListener("beforeprint", () => signals.beforePrint++);
  window.addEventListener("pagehide", () => signals.pageHide++);
  window.addEventListener("popstate", () => signals.popState++);
  const watchDpr = () => {
    const mq = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    mq.addEventListener("change", () => {
      signals.dprChanges.push(window.devicePixelRatio);
      watchDpr();
    }, { once: true });
  };
  watchDpr();
}

export function keyLog(since = 0): KeyLogEntry[] {
  return log.filter((e) => e.t >= since);
}

export function clearKeyLog(): void {
  log.length = 0;
}

export function browserSignals() {
  return {
    ...signals,
    dprChanges: [...signals.dprChanges],
    devicePixelRatio: window.devicePixelRatio,
    visualViewportScale: window.visualViewport?.scale ?? null,
  };
}
