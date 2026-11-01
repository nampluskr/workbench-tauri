// Phase 2 verification entry points (specs/v0.1/verify/phase2/HOWTO.md):
// window.__poc.theme / .shell / .keymap / .caption.
import { invoke } from "@tauri-apps/api/core";
import { applyTheme, currentTheme, resolveTheme, THEME_NAMES, type ThemeName } from "../theme/theme";
import { cssVar, TARGET_TOKENS } from "../theme/tokens";
import { captionSync, captionApplied } from "../theme/bootstrap";
import { browserSignals, clearKeyLog, contextPath, keyLog, keymap } from "../keymap/dispatch";

function frames(n = 2): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number) =>
      left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1));
    step(n);
  });
}
const r3 = (n: number) => Math.round(n * 1000) / 1000;

function rectOf(el: Element | null) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const dpr = window.devicePixelRatio;
  return {
    css: { x: r3(r.left), y: r3(r.top), w: r3(r.width), h: r3(r.height) },
    physical: {
      x: Math.round(r.left * dpr),
      y: Math.round(r.top * dpr),
      w: Math.round(r.width * dpr),
      h: Math.round(r.height * dpr),
    },
  };
}

// ---------- theme (SPEC R-8) ----------

function themeList() {
  return THEME_NAMES.map((name) => ({ name, bundled: resolveTheme(name) !== null }));
}

/** Resolved tokens of `name` (default: current) and, for the current theme, the applied CSS values. */
function themeDump(name?: ThemeName) {
  const target = name ?? currentTheme()?.name ?? "Catppuccin Mocha";
  const resolved = resolveTheme(target);
  if (!resolved) {
    return { name: target, ok: false, error: "theme not bundled (see public/licenses/NOTICE.md)" };
  }
  const isCurrent = currentTheme()?.name === target;
  const rootStyle = getComputedStyle(document.documentElement);
  return {
    name: target,
    ok: true,
    appearance: resolved.appearance,
    current: isCurrent,
    targetTokenCount: TARGET_TOKENS.length,
    tokens: resolved.tokens.map((t) => ({
      token: t.token,
      source: t.source,
      value: t.value,
      cssVar: cssVar(t.token),
      applied: isCurrent ? rootStyle.getPropertyValue(cssVar(t.token)).trim() || null : null,
    })),
  };
}

/** Switch theme and time the whole path: JSON read -> merge -> CSS vars -> CM6/caption -> painted. */
async function themeApply(name: ThemeName) {
  const t0 = performance.now();
  const r = applyTheme(name);
  const t1 = performance.now();
  if (!r.ok) return r;
  // The native maximize button gets its colors asynchronously (IPC); wait
  // until caption_set_colors has returned, then for two painted frames.
  const captionOk = await captionApplied();
  const t1b = performance.now();
  await frames(2);
  const t2 = performance.now();
  const timing = r.timing!;
  return {
    ok: true,
    name,
    timingMs: {
      readJson: r3(timing.readMs),
      merge: r3(timing.mergeMs),
      cssVariables: r3(timing.cssMs),
      cm6AndCaptionRequest: r3(timing.listenersMs),
      captionApplied: r3(t1b - t1),
      untilPainted: r3(t2 - t1b),
      total: r3(t2 - t0),
    },
    captionOk,
    note: "captionApplied = until caption_set_colors (native maximize button) returned; untilPainted = two requestAnimationFrame callbacks after that",
  };
}

/** Computed colors and rects of the fixed screen samples (PROGRESS Phase 2, S-1 ~ S-13). */
function themeSamples() {
  const q = (s: string) => document.querySelector(s);
  const bg = (el: Element | null) => (el ? getComputedStyle(el).backgroundColor : null);
  const tabs = [...document.querySelectorAll<HTMLElement>("[data-poc-pane] button[data-active]")];
  const activeTab = tabs.find((b) => b.dataset.active === "true") ?? null;
  const inactiveTab = tabs.find((b) => b.dataset.active === "false") ?? null;
  const minimize = q('[data-zl-winbtn="minimize"]');
  const body = q(".zl-body");
  return {
    theme: currentTheme()?.name ?? null,
    windowActive: document.documentElement.getAttribute("data-window-active"),
    samples: {
      "S-1/S-2 title bar": { color: bg(q(".zl-titlebar")), rect: rectOf(q(".zl-titlebar-drag")) },
      "S-3 window button glyph": {
        color: minimize ? getComputedStyle(minimize).color : null,
        rect: rectOf(minimize),
      },
      "S-4 minimize hover": { rect: rectOf(minimize), note: "hover with tools/win-input.ps1, then sample" },
      "S-5 sidebar": { color: bg(q(".zl-sidebar")), rect: rectOf(q(".zl-sidebar-list")) },
      "S-6 left dock": { color: bg(q(".zl-dock")), rect: rectOf(q(".zl-dock")) },
      "S-7 status bar": { color: bg(q(".zl-statusbar")), rect: rectOf(q(".zl-statusbar")) },
      "S-8 border (title bar bottom = body top)": {
        color: body ? getComputedStyle(body).borderTopColor : null,
        rect: rectOf(body),
      },
      "S-9 tab bar": { color: bg(q("[data-poc-pane] > div")), rect: rectOf(q("[data-poc-pane] > div")) },
      "S-10 active tab": { color: bg(activeTab), rect: rectOf(activeTab) },
      "S-10 inactive tab": { color: bg(inactiveTab), rect: rectOf(inactiveTab) },
      "S-11 editor": { color: bg(q(".cm-editor")), rect: rectOf(q(".cm-content")) },
      "S-12 current line": { color: bg(q(".zl-activeLine")), rect: rectOf(q(".zl-activeLine")) },
      "S-13 selection": {
        color: q(".zl-selectionShape path") ? getComputedStyle(q(".zl-selectionShape path")!).fill : null,
      },
    },
    note: "Screenshot pixel colors are the judged values (SPEC R-8); these computed values help locate and cross-check.",
  };
}

// ---------- shell (SPEC R-4, R-9) ----------

function shellRects() {
  const areas: Record<string, unknown> = {};
  for (const el of document.querySelectorAll<HTMLElement>("[data-zl-area]")) {
    areas[el.dataset.zlArea!] = rectOf(el);
  }
  const buttons: Record<string, unknown> = {};
  for (const el of document.querySelectorAll<HTMLElement>("[data-zl-winbtn]")) {
    const cs = getComputedStyle(el);
    buttons[el.dataset.zlWinbtn!] = {
      rect: rectOf(el),
      glyph: el.textContent ? "U+" + el.textContent.codePointAt(0)!.toString(16).toUpperCase() : null,
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      color: cs.color,
    };
  }
  return {
    devicePixelRatio: window.devicePixelRatio,
    viewport: { w: window.innerWidth, h: window.innerHeight },
    rootFontSize: getComputedStyle(document.documentElement).fontSize,
    areas,
    windowButtons: buttons,
  };
}

// ---------- keymap (SPEC R-6, R-7) ----------

const keymapApi = {
  log: (since = 0) => keyLog(since),
  clear: () => clearKeyLog(),
  signals: () => browserSignals(),
  context: () => contextPath(document.activeElement).map((c) => c.name),
  display: (action: string, args: unknown = null) =>
    keymap.displayKeys(action, args, contextPath(document.activeElement)),
};

// ---------- caption (native maximize button) ----------

async function caption() {
  try {
    return {
      ok: true,
      native: await invoke("caption_debug"),
      lastColors: captionSync.last,
      setColorsError: captionSync.error,
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export const phase2Api = {
  theme: { list: themeList, dump: themeDump, apply: themeApply, samples: themeSamples },
  shell: { rects: shellRects },
  keymap: keymapApi,
  caption,
};
