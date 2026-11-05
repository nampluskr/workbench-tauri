// Phase 2 V3 (SPEC R-3, R-4, R-5, R-7, R-1 on the new layout). Edits nothing in src; the app is killed at the end.
// Usage: node tools/measure-p2.mjs <phases> [exe]    phases: colors,keys,ime,r1,window; M-2-R1 re-measure: tabs,native,snap (comma list)  -> JSON to stdout
// OS input only goes through tools/win-input.ps1 (pinned PID/HWND, foreground check before every event).
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { launchApp, metric } from "./cdp-lib.mjs";
import { decodePng, pixel, encodePng, crop } from "./png.mjs";
import { cssVar, expectedTokens, composite, parseHex } from "./theme-expect.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(root, "specs/v0.1/verify/phase2");
mkdirSync(OUT, { recursive: true });
const phases = new Set((process.argv[2] ?? "colors,keys,r1,window").split(","));
const tol = metric("verification.tolerance", "color_channel");

const app = await launchApp(process.argv[3]);
const { send, mouse, sleep } = app;
// Retry once if a navigation destroyed the execution context mid-call.
const evaluate = async (expr) => { for (let i = 0; ; i++) { try { return await app.evaluate(expr); } catch (e) { if (i < 4 && /context was destroyed|Cannot find context/.test(String(e))) { await sleep(700); continue; } e.message += " in: " + expr.slice(0, 120); throw e; } } };
const out = { phases: [...phases] };

/** One OS-input call. The tool refuses to send unless the target is the foreground window. */
function win(args) {
  try {
    return JSON.parse(execFileSync("pwsh", ["-NoProfile", "-File", resolve(root, "tools/win-input.ps1"), "-ProcessId", String(app.pid), ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
  } catch (e) {
    return { error: String(e.stderr || e.message).trim().slice(0, 600) };
  }
}
const shot = async () => decodePng(Buffer.from((await send("Page.captureScreenshot", { format: "png" })).data, "base64"));
const waitEditor = () => evaluate(`new Promise(r => { const t = setInterval(() => { if (document.querySelector(".cm-editor")) { clearInterval(t); r(); } }, 50); })`);
async function load(search = "") {
  await send("Page.navigate", { url: (await evaluate("location.origin")) + "/" + search });
  await sleep(1500);
  for (let i = 0; i < 60; i++) { try { await waitEditor(); break; } catch { await sleep(250); } }
  await sleep(600);
}
const dist = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])));

// ---------------------------------------------------------------- R-7 / S-1..S-23 (colors)
const LOCATE = `(() => {
  const R = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; };
  const q = (s, i = 0) => document.querySelectorAll(s)[i];
  const pt = (x, y) => ({ x: Math.floor(x), y: Math.floor(y) });
  const ink = (el, id) => { el.setAttribute("data-ink", id); const rg = document.createRange(); rg.selectNodeContents(el); const b = rg.getBoundingClientRect(); const cs = getComputedStyle(el);
    return { text: el.textContent, rect: { x: b.left, y: b.top, w: b.width, h: b.height }, font: cs.font, letterSpacing: cs.letterSpacing }; };
  const sc = R(q(".cm-scroller")), g = R(q(".cm-gutters")), tb = R(q(".title-bar")), wb = R(q(".workspace-body")), sb = R(q(".sidebar"));
  const dock = R(q(".dock-left")), tabs = R(q(".tabs")), act = q(".tab.active"), inact = document.getElementById("__inactive");
  const lines = [...document.querySelectorAll(".cm-line")].map(R), line2 = lines[2];
  const num = (t) => [...document.querySelectorAll(".cm-lineNumbers .cm-gutterElement")].find((e) => e.textContent === t && e.getBoundingClientRect().height > 0);
  const btn = [...document.querySelectorAll(".window-button")];
  const btnPt = (i) => { const b = R(btn[i]); return pt(b.x + 4, b.y + 4); };
  return {
    titlebar: pt(tb.x + 60, tb.y + 16), glyphMin: ink(btn[0], "S-3a"), glyphMax: ink(btn[1], "S-3b"), btnMin: btnPt(0), btnMax: btnPt(1),
    sidebar: pt(sb.x + 150, 400), dock: pt(dock.x + 100, 400),
    lineTitle: pt(700, wb.y), lineTabs: pt(tabs.x + tabs.w - 100, tabs.y + tabs.h - 1), lineStatus: pt(700, wb.y + wb.h - 1),
    lineSidebar: pt(sb.x + sb.w - 1, 400), lineDock: pt(dock.x + dock.w - 1, 400),
    tabbar: pt(tabs.x + tabs.w - 100, tabs.y + 10), tabActive: pt(R(act).x + 1, R(act).y + 1), tabActiveText: ink(act.querySelector("button"), "S-12"),
    tabInactive: inact ? pt(R(inact).x + 1, R(inact).y + 1) : null, tabInactiveText: inact ? ink(inact.querySelector("button"), "S-13*") : null,
    status: pt(700, R(q(".status-bar")).y + 15),
    editorBg: pt(sc.x + sc.w - 40, line2.y + line2.h / 2), editorText: ink(q(".cm-line", 2), "S-16"),
    gutterBg: pt(g.x + 2, line2.y + line2.h / 2), lineNumber: ink(num("3"), "S-18"), activeLineNumber: ink(num("1"), "S-19"),
    activeLine: pt(sc.x + sc.w - 40, R(q(".cm-activeLine")).y + 12), // x inside the visible scroller (the line box is wider than the pane)
    scroller: sc, track: pt(sc.x + sc.w - 8, sc.y + sc.h - 15 - 40), lines,
  };
})()`;

/**
 * Same-token references. Solid areas: swatch boxes at the same page coordinates (opaque layer first, translucent ones on top).
 * Text: the same glyphs repainted in place with the token as a literal colour. Two captures, because an overlay on top
 * turns off LCD text anti-aliasing for the whole page and the reference must be anti-aliased like the app.
 */
async function swatches(all) {
  const solids = all.filter((i) => !i.ink), inks = all.filter((i) => i.ink);
  const out = { solid: null, ink: null };
  if (inks.length) {
    await evaluate(`${JSON.stringify(inks.map((i) => [i.id, i.token]))}.forEach(([id, col]) => { document.querySelector('[data-ink="' + id + '"]').style.color = col; })`);
    await sleep(150);
    out.ink = await shot();
    await evaluate(`document.querySelectorAll("[data-ink]").forEach((e) => { e.style.color = ""; e.removeAttribute("data-ink"); })`);
  }
  if (solids.length) {
    await evaluate(`(() => {
      const items = ${JSON.stringify(solids)};
      const ov = document.createElement("div"); ov.id = "__sw";
      ov.style.position = "fixed"; ov.style.inset = "0"; ov.style.zIndex = "2147483647"; ov.style.pointerEvents = "none";
      for (const it of items) for (const col of [...it.layers, it.token]) {
        const d = document.createElement("div"); d.style.position = "fixed"; d.style.left = (it.pt.x - 5) + "px"; d.style.top = (it.pt.y - 5) + "px";
        d.style.width = "10px"; d.style.height = "10px"; d.style.background = col; ov.appendChild(d);
      }
      document.body.appendChild(ov);
    })()`);
    await sleep(150);
    out.solid = await shot();
    await evaluate(`document.getElementById("__sw").remove()`);
  }
  return out;
}

/** items: { id, name, token, tokenKey, pt|ink, layers } -> verdict rows (app vs same-token reference, plus JSON reference). */
async function judge(theme, state, appImg, items) {
  const sw = await swatches(items);
  return items.map((it) => {
    let p, q;
    let note = "";
    if (it.ink) {
      const rc = it.ink.rect, x0 = Math.max(0, Math.floor(rc.x)), y0 = Math.max(0, Math.floor(rc.y)), x1 = Math.ceil(rc.x + rc.w), y1 = Math.ceil(rc.y + rc.h);
      const bg = pixel(appImg, x0, y0);
      let best = -1;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const d = dist(pixel(appImg, x, y), bg); if (d > best) { best = d; p = [x, y]; } }
      let maxd = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) maxd = Math.max(maxd, dist(pixel(appImg, x, y), pixel(sw.ink, x, y)));
      q = pixel(sw.ink, p[0], p[1]);
      note = `ink@${p} max diff over the text rect ${maxd}`;
      p = pixel(appImg, p[0], p[1]);
    } else {
      p = pixel(appImg, it.pt.x, it.pt.y);
      q = pixel(sw.solid, it.pt.x, it.pt.y);
    }
    // JSON reference: solid areas only (alpha composited over the layers); text pixels are anti-aliased, so no direct value.
    const json = it.ink ? null : composite([...it.layers, it.token]);
    const swatchDiff = dist(p, q), jsonDiff = json ? dist(p, json) : null;
    return { id: it.id, name: it.name, theme, state, token: it.tokenKey, app: p, swatch: q, swatchDiff, json, jsonDiff, ok: swatchDiff <= tol, note };
  });
}

async function colorsFor(themeName, search) {
  const exp = expectedTokens(themeName);
  const T = exp.tokens;
  await load(search);
  const res = { theme: themeName, appearance: exp.appearance, vars: [], rows: [], notes: [] };
  // V3: variable dump vs the original JSON / T-26.3 (exactly equal, A-31.8).
  const dump = await evaluate(`(() => { const cs = getComputedStyle(document.documentElement); return ${JSON.stringify(Object.keys(T).map(cssVar))}.map((n) => [n, cs.getPropertyValue(n).trim()]); })()`);
  Object.keys(T).forEach((tk, i) => {
    const got = dump[i][1], same = got.toLowerCase() === T[tk];
    res.vars.push({ token: tk, css: dump[i][0], expected: T[tk], got, ok: same });
  });
  if (themeName === "One Light") return res; // D-8: token values only

  res.hasFocus = await evaluate("document.hasFocus()");
  if (!res.hasFocus) throw new Error("page has no focus at start");
  // The inactive tab (S-11, S-13) does not exist in the app (one tab): measure an injected clone and label it so.
  await evaluate(`(() => { const t = document.querySelector(".tab.active"); const c = t.cloneNode(true); c.classList.remove("active"); c.id = "__inactive"; t.after(c); })()`);
  await evaluate(`document.querySelector(".cm-scroller").scrollTop = 0`);
  await sleep(200);
  const L = await evaluate(LOCATE);
  const C = (k) => T[k];
  const mk = (id, name, tokenKey, where, layers = []) => ({ id, name, tokenKey, token: C(tokenKey), layers: layers.map(C), ...where });
  const P = (pt) => ({ pt }), I = (ink) => ({ ink });
  const base = [
    mk("S-1", "title bar (focused)", "title_bar.background", P(L.titlebar)),
    mk("S-3a", "minimize glyph", "text", I(L.glyphMin), ["title_bar.background"]),
    mk("S-3b", "maximize glyph", "text", I(L.glyphMax), ["title_bar.background"]),
    mk("S-6", "sidebar", "panel.background", P(L.sidebar)),
    mk("S-7", "left dock", "panel.background", P(L.dock)),
    mk("S-8a", "line under title bar", "border", P(L.lineTitle)),
    mk("S-8b", "line under tab bar", "border", P(L.lineTabs)),
    mk("S-8c", "line above status bar", "border", P(L.lineStatus)),
    mk("S-8d", "line right of sidebar", "border", P(L.lineSidebar)),
    mk("S-8e", "line right of left dock", "border", P(L.lineDock)),
    mk("S-9", "tab bar", "tab_bar.background", P(L.tabbar)),
    mk("S-10", "active tab", "tab.active_background", P(L.tabActive)),
    mk("S-11*", "inactive tab (injected clone)", "tab.inactive_background", P(L.tabInactive)),
    mk("S-12", "active tab title", "text", I(L.tabActiveText), ["tab.active_background"]),
    mk("S-13*", "inactive tab title (injected clone)", "text.muted", I(L.tabInactiveText), ["tab.inactive_background"]),
    mk("S-14", "status bar", "status_bar.background", P(L.status)),
    mk("S-15", "editor background", "editor.background", P(L.editorBg)),
    mk("S-16", "editor text", "editor.foreground", I(L.editorText), ["editor.background"]),
    mk("S-17", "gutter background", "editor.gutter.background", P(L.gutterBg)),
    mk("S-18", "line number (not cursor line)", "editor.line_number", I(L.lineNumber), ["editor.gutter.background"]),
    mk("S-19", "line number (cursor line)", "editor.active_line_number", I(L.activeLineNumber), ["editor.gutter.background", "editor.active_line.background"]),
    mk("S-20", "current line highlight", "editor.active_line.background", P(L.activeLine), ["editor.background"]),
    mk("S-23", "scrollbar track", "scrollbar.track.background", P(L.track)),
  ];
  let img = await shot();
  res.rows.push(...(await judge(themeName, "default", img, base)));
  await evaluate(`document.getElementById("__inactive").remove()`);

  // S-22 scrollbar thumb: default (already scrolled to top), hover, pressed. Thumb found by scanning the track column.
  const col = Math.floor(L.scroller.x + L.scroller.w - 8);
  const trackPix = pixel(img, col, L.track.y);
  let ty0 = -1, ty1 = -1;
  for (let y = Math.floor(L.scroller.y); y < L.track.y; y++) {
    const d = dist(pixel(img, col, y), trackPix) > 0;
    if (d && ty0 < 0) ty0 = y;
    if (d) ty1 = y;
  }
  res.thumb = { x: col, y0: ty0, y1: ty1 };
  const thumbPt = { x: col, y: Math.floor((ty0 + ty1) / 2) };
  const thumbItem = (key, state) => mk("S-22", `scroll thumb ${state}`, key, P(thumbPt), ["scrollbar.track.background"]);
  res.rows.push(...(await judge(themeName, "thumb default", img, [thumbItem("scrollbar.thumb.background", "default")])));
  for (let i = 1; i <= 4; i++) await mouse("mouseMoved", thumbPt.x - 6 + i * 1.5, thumbPt.y);
  await mouse("mouseMoved", thumbPt.x, thumbPt.y);
  await sleep(300);
  img = await shot();
  res.rows.push(...(await judge(themeName, "thumb hover", img, [thumbItem("scrollbar.thumb.hover_background", "hover")])));
  await mouse("mousePressed", thumbPt.x, thumbPt.y, { buttons: 1, clickCount: 1 });
  await sleep(300);
  img = await shot();
  res.rows.push(...(await judge(themeName, "thumb pressed", img, [thumbItem("scrollbar.thumb.active_background", "pressed")])));
  await mouse("mouseReleased", thumbPt.x, thumbPt.y, { buttons: 0, clickCount: 1 });
  await mouse("mouseMoved", 700, 500);

  // S-4 / S-5 window button hover and pressed (min + max). The pointer leaves before release so nothing is clicked.
  for (const [name, p] of [["minimize", L.btnMin], ["maximize", L.btnMax]]) {
    const c = { x: p.x + 14, y: p.y + 12 };
    await mouse("mouseMoved", c.x, c.y);
    await sleep(250);
    img = await shot();
    res.rows.push(...(await judge(themeName, `${name} hover`, img, [mk("S-4", `${name} button hover`, "ghost_element.hover", P(p), ["title_bar.background"])])));
    await mouse("mousePressed", c.x, c.y, { buttons: 1, clickCount: 1 });
    await sleep(250);
    img = await shot();
    res.rows.push(...(await judge(themeName, `${name} pressed`, img, [mk("S-5", `${name} button pressed`, "ghost_element.active", P(p), ["title_bar.background"])])));
    await mouse("mouseMoved", 700, 500);
    await mouse("mouseReleased", 700, 500, { buttons: 0, clickCount: 1 });
    await sleep(150);
  }

  // S-21 selection: CDP drag across lines 1..4 of the editor, then the middle piece, right end.
  const gx = L.gutterBg.x;
  const a = { x: gx + 90 + 30, y: L.lines[1].y + L.lines[1].h / 2 }, b = { x: gx + 90 + 200, y: L.lines[4].y + L.lines[4].h / 2 };
  await mouse("mouseMoved", a.x, a.y);
  await mouse("mousePressed", a.x, a.y, { buttons: 1, clickCount: 1 });
  for (let i = 1; i <= 8; i++) await mouse("mouseMoved", a.x + ((b.x - a.x) * i) / 8, a.y + ((b.y - a.y) * i) / 8, { buttons: 1 });
  await mouse("mouseReleased", b.x, b.y, { buttons: 0, clickCount: 1 });
  await mouse("mouseMoved", 700, 700);
  await sleep(300);
  const sel = await evaluate(`[...document.querySelectorAll(".cm-selectionBackground")].map((e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; })`);
  res.selectionPieces = sel;
  const mid = sel.length >= 3 ? sel[1] : sel[0];
  img = await shot();
  const selPt = { x: L.editorBg.x, y: Math.floor(mid.y + mid.h / 2) };
  res.rows.push(...(await judge(themeName, "selection", img, [mk("S-21", "selection", "players[0].selection", P(selPt), ["editor.background"])])));
  res.rows.at(-1).note += ` piece=${JSON.stringify(mid)}`;

  // S-2 title bar when the window has lost focus (real blur: the taskbar takes the foreground, no input is sent).
  win(["-Action", "blur"]);
  await sleep(500);
  const focusedNow = await evaluate("document.hasFocus()");
  img = await shot();
  const tbItem = mk("S-2", "title bar (inactive)", "title_bar.inactive_background", P(L.titlebar));
  res.rows.push(...(await judge(themeName, "blurred", img, [tbItem])));
  res.rows.at(-1).note += ` document.hasFocus()=${focusedNow}`;
  win(["-Action", "foreground"]);
  await sleep(500);
  return res;
}

// ---------------------------------------------------------------- R-5 browser keys (real OS key input) + context menu + Korean IME
const OBSERVER = `(() => {
  window.__obs = []; window.__marker = "m" + Math.random(); window.__pops = 0;
  history.pushState({ n: 1 }, "", "#a"); history.pushState({ n: 2 }, "", "#b");
  addEventListener("popstate", () => window.__pops++);
  // Registered after the app's own capture listener on the same target, so defaultPrevented shows what the app did.
  addEventListener("keydown", (e) => window.__obs.push({ key: e.key, code: e.code, ctrl: e.ctrlKey, alt: e.altKey, shift: e.shiftKey, dp: e.defaultPrevented }), true);
  addEventListener("contextmenu", (e) => window.__obs.push({ contextmenu: true, target: e.target.className || e.target.tagName, dp: e.defaultPrevented }), true);
})()`;
const PAGE_STATE = `({ marker: window.__marker ?? null, obs: window.__obs ?? null, pops: window.__pops ?? null, dpr: devicePixelRatio, w: innerWidth, h: innerHeight, scale: visualViewport.scale, href: location.href, focus: document.hasFocus(), active: document.activeElement?.className || document.activeElement?.tagName })`;
const winNames = (r) => (r.windows ?? []).map((w) => w.replace(/^0x[0-9A-F]+ /, ""));

async function focusEditor() {
  const p = await evaluate(`(() => { const l = document.querySelectorAll(".cm-line")[2].getBoundingClientRect(); return { x: l.left + 40, y: l.top + l.height / 2 }; })()`);
  await mouse("mousePressed", p.x, p.y, { buttons: 1, clickCount: 1 });
  await mouse("mouseReleased", p.x, p.y, { buttons: 0, clickCount: 1 });
  await sleep(200);
}

async function keysPhase() {
  const res = { rows: [], notes: [] };
  await load("");
  await focusEditor();
  await evaluate(OBSERVER);
  const base = win(["-Action", "windows"]);
  if (base.error) throw new Error("windows: " + base.error);
  res.baselineWindows = winNames(base);
  res.layout = base.after.layout;
  const fgOk = (r) => r.after?.foreground === true;

  // Which IME mode is the app in? A plain "p" gives key "p" in English mode and key "Process" (or a Hangul char) in Hangul mode.
  const modeOf = (o) => (o && (o.key === "Process" || o.key.charCodeAt(0) > 127) ? "hangul" : "english");
  async function probe(tag) {
    await focusEditor(); // IME only runs on an editable element; the typed character is irrelevant (the page is discarded afterwards)
    const r = win(["-Action", "keys", "-Keys", "p"]);
    await sleep(300);
    const st = await evaluate(PAGE_STATE);
    const obs = st.obs.filter((o) => !o.contextmenu);
    await evaluate("window.__obs.length = 0");
    (res.ime ??= { steps: [], rows: [] }).steps.push({ tag, error: r.error, plainP: obs });
    return modeOf(obs.at(-1));
  }
  const initialMode = await probe("initial");
  res.keysRanIn = initialMode;
  async function press(combo, label = combo) {
    const before = await evaluate(PAGE_STATE);
    const r = win(["-Action", "keys", "-Keys", combo, "-ListWindows"]);
    await sleep(600);
    if (r.error) return { combo: label, aborted: r.error };
    // Keys that would open browser UI (print dialog, find bar): also look at the whole monitor a second later.
    if (["ctrl+p", "ctrl+f", "f3"].includes(combo) && !label.includes("mode")) win(["-Action", "state", "-Out", resolve(process.env.TEMP ?? ".", "m2-key-" + combo.replace("+", "-") + ".png")]);
    let st;
    try { st = await evaluate(PAGE_STATE); } catch (e) { return { combo: label, error: "page not reachable after key: " + e.message.slice(0, 100) }; }
    const reloaded = st.marker === null;
    const newWindows = winNames(r).filter((w) => !res.baselineWindows.includes(w));
    const keydowns = reloaded ? [] : st.obs.filter((o) => !o.contextmenu);
    const row = { combo: label, keydowns, reloaded, dprChanged: st.dpr !== before.dpr, scale: st.scale, popstates: reloaded ? null : st.pops - before.pops, newWindows, foregroundAfter: fgOk(r), focusAfter: st.focus, size: [st.w, st.h] };
    if (reloaded) { await focusEditor(); await evaluate(OBSERVER); } else await evaluate("window.__obs.length = 0");
    return row;
  }

  // 03-tauri R-20 "sure" keys, then the keys to test. Ctrl+Plus is tried as Ctrl+Shift+= and Ctrl+=; numpad too.
  const full = phases.has("keys"); // phase "ime" alone reruns only the Korean IME part
  const list = !full ? [] : [["ctrl+p"], ["ctrl+f"], ["ctrl+r"], ["f5"], ["f3"], ["alt+left"], ["alt+right"], ["ctrl+shift+=", "Ctrl+Plus (Ctrl+Shift+=)"], ["ctrl+=", "Ctrl+= (Plus without Shift)"],
    ["ctrl+-", "Ctrl+Minus"], ["ctrl+numadd", "Ctrl+Numpad+"], ["ctrl+numsub", "Ctrl+Numpad-"], ["ctrl+w"], ["ctrl+tab"], ["f1"], ["f6"]];
  for (const [combo, label] of list) {
    const row = await press(combo, label);
    res.rows.push(row);
    if (row.aborted || row.error) { res.notes.push(`stopped at ${combo}: ${row.aborted ?? row.error}`); break; }
  }

  // Right click: real OS right button on the editor body and on the title bar.
  res.contextMenu = [];
  for (const [name, x, y] of full ? [["editor body", 800, 300], ["title bar", 700, 16]] : []) {
    const r = win(["-Action", "rightclick", "-X", String(x), "-Y", String(y), "-ListWindows"]);
    await sleep(700);
    if (r.error) { res.contextMenu.push({ name, aborted: r.error }); break; }
    const st = await evaluate(PAGE_STATE);
    res.contextMenu.push({ name, events: st.obs.filter((o) => o.contextmenu), newWindows: winNames(r).filter((w) => !res.baselineWindows.includes(w)), foregroundAfter: fgOk(r) });
    await evaluate("window.__obs.length = 0");
  }

  const fin = win(["-Action", "state", "-Out", resolve(process.env.TEMP ?? ".", full ? "m2-after-keys.png" : "m2-after-ime-only.png")]);
  res.finalScreenshot = fin.screenshot?.path;
  res.finalPage = await evaluate(PAGE_STATE);

  // Korean IME: the keys above ran in the IME mode found by `modeOf`; now flip Hangul (key goes to the app only),
  // prove the flip with a plain key, rerun the Ctrl+letter keys in the other mode, then flip back.
  res.ime.initialMode = initialMode;
  const toggle = async () => { const t = win(["-Action", "keys", "-Keys", "hangul"]); await sleep(600); return t.error ?? "ok"; };
  // The Hangul key takes effect with some delay/focus dependence here, so probe after each toggle and stop when the wanted mode shows.
  const reach = async (target) => { for (let i = 0; i < 4; i++) { if ((await probe(`seek ${target} #${i}`)) === target) return i; await toggle(); } return null; };
  const other = initialMode === "hangul" ? "english" : "hangul";
  res.ime.togglesToOther = await reach(other);
  res.ime.otherReached = res.ime.togglesToOther !== null;
  await focusEditor();
  for (const combo of ["ctrl+p", "ctrl+f", "ctrl+r", "ctrl+w"]) { const row = await press(combo, `${combo} (${other} mode)`); res.ime.rows.push(row); if (row.aborted || row.error) break; }
  await focusEditor();
  res.ime.togglesBack = await reach(initialMode);
  res.ime.restored = res.ime.togglesBack !== null;
  out.keys = res;
}

// ---------------------------------------------------------------- R-1 on the new layout (tab move keeps the EditorView)
async function r1Phase() {
  await load("");
  const res = {};
  await evaluate(`(() => { window.__node = document.querySelector(".cm-editor"); window.__scroller = document.querySelector(".cm-scroller"); window.__scroller.scrollTop = 300; window.__scroller.scrollLeft = 20; })()`);
  await sleep(300);
  const pts = await evaluate(`(() => {
    const sc = document.querySelector(".cm-scroller").getBoundingClientRect(), g = document.querySelector(".cm-gutters").getBoundingClientRect();
    const lines = [...document.querySelectorAll(".cm-line")].map((l) => l.getBoundingClientRect()).filter((r) => r.top >= sc.top + 5 && r.bottom <= sc.bottom - 5);
    return { x0: g.right + 30, y0: lines[1].top + lines[1].height / 2, x1: g.right + 200, y1: lines[4].top + lines[4].height / 2 };
  })()`);
  await mouse("mouseMoved", pts.x0, pts.y0);
  await mouse("mousePressed", pts.x0, pts.y0, { buttons: 1, clickCount: 1 });
  for (let i = 1; i <= 8; i++) await mouse("mouseMoved", pts.x0 + ((pts.x1 - pts.x0) * i) / 8, pts.y0 + ((pts.y1 - pts.y0) * i) / 8, { buttons: 1 });
  await mouse("mouseReleased", pts.x1, pts.y1, { buttons: 0, clickCount: 1 });
  await sleep(300);
  const snapFn = `(() => {
    const n = window.__node, sc = document.querySelector(".cm-scroller"), s = getSelection(), ed = document.querySelector(".cm-editor"), er = ed.getBoundingClientRect();
    const rel = (el) => { const r = el.getBoundingClientRect(); return [r.left - er.left, r.top - er.top, r.width, r.height].map((v) => +v.toFixed(2)); };
    const prev = window.__sel;
    return { sameNode: ed === n, isConnected: n.isConnected, editorCount: document.querySelectorAll(".cm-editor").length, sameScroller: sc === window.__scroller,
      paneIndex: [...document.querySelectorAll(".pane")].findIndex((p) => p.contains(n)), scrollTop: sc.scrollTop, scrollLeft: sc.scrollLeft, cmFocused: ed.classList.contains("cm-focused"),
      domSel: { rangeCount: s.rangeCount, isCollapsed: s.isCollapsed, anchorOffset: s.anchorOffset, focusOffset: s.focusOffset, text: s.toString(),
        sameAnchorNode: prev ? s.anchorNode === prev.anchorNode : null, sameFocusNode: prev ? s.focusNode === prev.focusNode : null },
      cursors: [...document.querySelectorAll(".cm-cursor")].map(rel), selRects: [...document.querySelectorAll(".cm-selectionBackground")].map(rel) };
  })()`;
  res.before = await evaluate(snapFn);
  await evaluate(`(() => { const s = getSelection(); window.__sel = { anchorNode: s.anchorNode, focusNode: s.focusNode }; })()`);
  const btn = await evaluate(`(() => { const b = document.querySelector(".pane .tab button[aria-label]"); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: b.textContent }; })()`);
  await mouse("mouseMoved", btn.x, btn.y);
  await mouse("mousePressed", btn.x, btn.y, { buttons: 1, clickCount: 1 });
  await mouse("mouseReleased", btn.x, btn.y, { buttons: 0, clickCount: 1 });
  await evaluate(`new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`);
  res.afterFrame = await evaluate(snapFn);
  await sleep(500);
  res.after500 = await evaluate(snapFn);
  const same = (a, b) => JSON.stringify([a.scrollTop, a.scrollLeft, a.domSel.anchorOffset, a.domSel.focusOffset, a.domSel.text, a.cursors, a.selRects]) === JSON.stringify([b.scrollTop, b.scrollLeft, b.domSel.anchorOffset, b.domSel.focusOffset, b.domSel.text, b.cursors, b.selRects]);
  res.verdict = { movedPane: res.before.paneIndex !== res.after500.paneIndex, nodeSame: res.afterFrame.sameNode && res.after500.sameNode && res.after500.sameScroller, connected: res.after500.isConnected && res.after500.editorCount === 1,
    domSelNodesSame: res.after500.domSel.sameAnchorNode && res.after500.domSel.sameFocusNode, stateSameAfterFrame: same(res.before, res.afterFrame), stateSameAfter500: same(res.before, res.after500), focused: res.after500.cmFocused };
  out.r1 = res;
}

// ---------------------------------------------------------------- R-3 window behaviour + R-4 V3 (glyphs, maximize tracking)
const tmpPng = (name) => resolve(process.env.TEMP ?? ".", "m2-" + name + ".png");
const hex = (p) => "#" + p.map((v) => v.toString(16).padStart(2, "0")).join("");

/** Corner / edge observation from a monitor capture and the window's DWM frame (screen px). */
function observeWindow(file, st, tag) {
  const img = decodePng(readFileSync(file));
  const mon = st.monitor ?? { x: 0, y: 0 };
  const f = st.after.frame, ox = f.x - mon.x, oy = f.y - mon.y;
  const obs = { tag, frame: f, clientOrigin: st.after.clientOrigin, clientSize: st.after.clientSize, workArea: st.after.workArea, maximized: st.after.maximized, corners: {}, edges: {} };
  const grid = (cx, cy, dx, dy) => { // 14x14 window of pixels starting 3px outside the corner, going inward
    const rows = [];
    for (let j = 0; j < 14; j++) { const r = []; for (let i = 0; i < 14; i++) { const x = cx + (i - 3) * dx, y = cy + (j - 3) * dy; r.push(x >= 0 && y >= 0 && x < img.w && y < img.h ? hex(pixel(img, x, y)) : "off"); } rows.push(r); }
    return rows;
  };
  const corners = { topLeft: [ox, oy, 1, 1], topRight: [ox + f.width - 1, oy, -1, 1], bottomLeft: [ox, oy + f.height - 1, 1, -1], bottomRight: [ox + f.width - 1, oy + f.height - 1, -1, -1] };
  for (const [name, [cx, cy, dx, dy]] of Object.entries(corners)) {
    const g = grid(cx, cy, dx, dy);
    // interior colour = pixel 20px inside the corner; radius estimate = how far inside the first interior-coloured pixel sits on each of the first 12 rows
    const ref = pixel(img, cx + 20 * dx, cy + 20 * dy);
    const firstInterior = [];
    for (let j = 0; j < 12; j++) { let k = -1; for (let i = 0; i < 40; i++) { const x = cx + i * dx, y = cy + j * dy; if (dist(pixel(img, x, y), ref) <= 2) { k = i; break; } } firstInterior.push(k); }
    obs.corners[name] = { interiorRef: hex(ref), firstInteriorPxPerRow: firstInterior, outsideInward: g.slice(0, 8).map((r) => r.slice(0, 8).join(" ")) };
  }
  const line = (x, y, dx, dy) => Array.from({ length: 8 }, (_, i) => { const px = x + (i - 3) * dx, py = y + (i - 3) * dy; return px >= 0 && py >= 0 && px < img.w && py < img.h ? hex(pixel(img, px, py)) : "off"; });
  obs.edges.leftAtMidHeight = line(ox, oy + 300, 1, 0);
  obs.edges.rightAtMidHeight = line(ox + f.width - 1, oy + 300, -1, 0);
  obs.edges.topAtX700 = line(ox + 700, oy, 0, 1);
  obs.edges.bottomAtX700 = line(ox + 700, oy + f.height - 1, 0, -1);
  return { obs, img, ox, oy };
}
const saveCrop = (img, x, y, w, h, name, scale = 1) => writeFileSync(resolve(OUT, name), encodePng(crop(img, x, y, w, h), scale));

async function glyphCompare(tag) {
  // Reference glyphs: clones of the three buttons (same class, so same font/size/position grid) whose text is set from
  // the L-83 / L-312 code points written out here, placed to the left of the real ones (right-aligned flex keeps the real ones in place).
  const want = await evaluate(`(() => { const m = document.querySelector(".window-button[aria-label=Restore],.window-button[aria-label=Maximize]"); return { label: m.getAttribute("aria-label"), code: m.textContent.codePointAt(0).toString(16) }; })()`);
  const maximized = want.label === "Restore";
  const codes = ["e921", maximized ? "e923" : "e922", "e8bb"];
  const r = await evaluate(`(() => {
    const bar = document.querySelector(".title-bar"), btns = [...bar.querySelectorAll(".window-button")], first = btns[0], out = [];
    const codes = ${JSON.stringify(codes)};
    btns.forEach((b, i) => { const c = b.cloneNode(false); c.id = "__ref" + i; c.textContent = String.fromCodePoint(parseInt(codes[i], 16)); bar.insertBefore(c, first); });
    const R = (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
    return btns.map((b, i) => ({ real: R(b), ref: R(document.getElementById("__ref" + i)), realCode: b.textContent.codePointAt(0).toString(16), font: getComputedStyle(b).fontFamily, size: getComputedStyle(b).fontSize }));
  })()`);
  await mouse("mouseMoved", 700, 600);
  await sleep(250);
  const img = await shot();
  await evaluate(`[0, 1, 2].forEach((i) => document.getElementById("__ref" + i).remove())`);
  const fonts = await send("DOM.getDocument", {}).then(async (d) => {
    const n = await send("DOM.querySelector", { nodeId: d.root.nodeId, selector: ".window-button" });
    return (await send("CSS.getPlatformFontsForNode", { nodeId: n.nodeId })).fonts;
  }).catch((e) => String(e).slice(0, 80));
  const rows = r.map((g, i) => {
    let maxd = 0, ink = 0;
    for (let y = 0; y < g.real.h; y++) for (let x = 0; x < g.real.w; x++) {
      const a = pixel(img, Math.round(g.real.x) + x, Math.round(g.real.y) + y), b = pixel(img, Math.round(g.ref.x) + x, Math.round(g.ref.y) + y);
      maxd = Math.max(maxd, dist(a, b)); if (dist(a, pixel(img, Math.round(g.real.x), Math.round(g.real.y))) > 40) ink++;
    }
    return { button: ["minimize", "middle", "close"][i], expectedCode: codes[i], realCode: g.realCode, codeOk: g.realCode === codes[i], font: g.font, size: g.size, maxPixelDiff: maxd, inkPixels: ink, same: maxd <= tol };
  });
  return { tag, maximized, fonts, rows };
}

async function windowPhase() {
  const res = { steps: [] };
  await load("");
  await send("DOM.enable");
  await send("CSS.enable");
  const frameOf = (r) => r.after.frame;
  const log = (name, r, extra = {}) => { res.steps.push({ name, error: r.error, before: r.before?.frame, after: r.after?.frame, clientBefore: r.before?.clientSize, clientAfter: r.after?.clientSize, maximizedAfter: r.after?.maximized, foreground: r.after?.foreground, ...extra }); return r; };
  const page = () => evaluate(`({ w: innerWidth, h: innerHeight, dpr: devicePixelRatio, label: document.querySelector(".window-button[aria-label=Restore],.window-button[aria-label=Maximize]").getAttribute("aria-label"), glyph: document.querySelector(".window-button[aria-label=Restore],.window-button[aria-label=Maximize]").textContent.codePointAt(0).toString(16), maximizedClass: null })`);
  const shotWin = (name) => { const r = win(["-Action", "state", "-Out", tmpPng(name)]); r.monitor = r.screenshot?.monitor; return r; };
  const abort = (r, what) => { if (r.error) { res.notes = [...(res.notes ?? []), `${what}: ${r.error}`]; return true; } return false; };

  // 0. normal window: corners/edges and glyph render
  const n0 = shotWin("normal");
  res.glyphNormal = await glyphCompare("normal");
  const nObs = observeWindow(tmpPng("normal"), n0, "normal");
  res.normal = nObs.obs;
  res.normalPage = await page();
  saveCrop(nObs.img, nObs.ox - 12, nObs.oy - 12, 40, 40, "corner-normal-topleft.png", 10);
  saveCrop(nObs.img, nObs.ox + n0.after.frame.width - 28, nObs.oy + n0.after.frame.height - 28, 40, 40, "corner-normal-bottomright.png", 10);

  // 1. snap layout flyout on hover of the maximize button
  const mb = win(["-Action", "maxbutton"]);
  res.maxButton = mb.maxButtonCenterLogical;
  const hv = win(["-Action", "hover", "-HoldMs", "2500", "-Out", tmpPng("snap-hover")]);
  log("hover maximize button 2.5s", hv, { pointerScreen: hv.pointerScreen });
  if (!abort(hv, "hover")) {
    const img = decodePng(readFileSync(tmpPng("snap-hover")));
    const mon = hv.screenshot.monitor, px = hv.pointerScreen.x - mon.x, py = hv.pointerScreen.y - mon.y;
    saveCrop(img, Math.max(0, px - 300), Math.max(0, py - 40), 600, 360, "snap-flyout-hover.png");
    res.hoverCrop = "snap-flyout-hover.png";
  }
  win(["-Action", "foreground"]);

  // 2. drag by the title bar (client x=700,y=16), then resize on every side (resize borders are outside the client: 8px thick)
  const d = log("drag title bar +160,-100", win(["-Action", "drag", "-X", "700", "-Y", "16", "-DX", "160", "-DY", "-100"]));
  res.dragMoved = d.error ? null : { dx: frameOf(d).x - d.before.frame.x, dy: frameOf(d).y - d.before.frame.y, sizeChanged: frameOf(d).width !== d.before.frame.width };
  const sz = (r) => r.after.clientSize;
  const edge = async (name, x, y, dx, dy) => { const s0 = win(["-Action", "state"]); const r = win(["-Action", "drag", "-X", String(x), "-Y", String(y), "-DX", String(dx), "-DY", String(dy)]); log(name, r); return { name, client0: s0.after?.clientSize, client1: r.after?.clientSize, frame0: s0.after?.frame, frame1: r.after?.frame, error: r.error }; };
  const W = () => win(["-Action", "state"]).after.clientSize;
  res.resize = [];
  let c = await W();
  res.resize.push(await edge("right edge -80", c.width + 3, 300, -80, 0));
  c = await W();
  res.resize.push(await edge("bottom edge -60", 700, c.height + 3, 0, -60));
  c = await W();
  res.resize.push(await edge("bottom-right corner +80,+60", c.width + 3, c.height + 3, 80, 60));
  res.resize.push(await edge("left edge +40", -4, 300, 40, 0));
  res.resize.push(await edge("top edge +30 (y=-0.5)", 700, -1, 0, 30));
  const inner = win(["-Action", "resize", "-DX", "-50", "-DY", "-30"]);
  log("resize via 2px inside client BR corner (-50,-30)", inner);
  res.resize.push({ name: "2px inside client bottom-right", client0: inner.before?.clientSize, client1: inner.after?.clientSize, error: inner.error });

  // 3. snap to the left half (Win+Left), dismiss Snap Assist by re-activating the app (no input)
  const sn = log("Win+Left snap", win(["-Action", "keys", "-Keys", "win+left"]));
  await sleep(900);
  win(["-Action", "foreground"]);
  await sleep(500);
  const n1 = shotWin("snapped");
  res.snapped = abort(n1, "snap shot") ? null : observeWindow(tmpPng("snapped"), n1, "snapped-left").obs;
  if (res.snapped) { const o = observeWindow(tmpPng("snapped"), n1, "x"); saveCrop(o.img, o.ox - 12, o.oy - 12, 40, 40, "corner-snapped-topleft.png", 10); saveCrop(o.img, o.ox + n1.after.frame.width - 28, o.oy - 12, 40, 40, "corner-snapped-topright.png", 10); }
  res.snappedPage = await page();

  // 4. double-click the title bar -> maximize (OS input), check tracking, glyph, margins
  const dc = log("double-click title bar", win(["-Action", "dblclick", "-X", "700", "-Y", "16"]));
  await sleep(900);
  const n2 = shotWin("maximized");
  res.maximized = observeWindow(tmpPng("maximized"), n2, "maximized").obs;
  { const o = observeWindow(tmpPng("maximized"), n2, "x"); saveCrop(o.img, o.ox - 12, o.oy - 12, 40, 40, "corner-maximized-topleft.png", 10); }
  res.maximizedPage = await page();
  res.maximizeMargin = (() => { const f = n2.after.frame, cs = n2.after.clientSize, co = n2.after.clientOrigin, wa = n2.after.workArea.split(",").map(Number);
    return { frame: f, client: { x: co.x, y: co.y, w: cs.width, h: cs.height }, workArea: { x: wa[0], y: wa[1], w: wa[2], h: wa[3] },
      frameMinusWork: { left: f.x - wa[0], top: f.y - wa[1], right: (f.x + f.width) - (wa[0] + wa[2]), bottom: (f.y + f.height) - (wa[1] + wa[3]) },
      clientMinusWork: { left: co.x - wa[0], top: co.y - wa[1], right: (co.x + cs.width) - (wa[0] + wa[2]), bottom: (co.y + cs.height) - (wa[1] + wa[3]) } }; })();
  res.glyphMaximized = await glyphCompare("maximized");
  const dc2 = log("double-click title bar again", win(["-Action", "dblclick", "-X", "700", "-Y", "16"]));
  await sleep(900);
  res.restoredPage = await page();
  res.restoredState = win(["-Action", "state"]).after;

  // 5. the maximize button itself (OS click): maximize, then restore
  const mb2 = win(["-Action", "maxbutton"]).maxButtonCenterLogical;
  const b1 = log("click maximize button", win(["-Action", "click", "-X", String(mb2.x), "-Y", String(mb2.y)]));
  await sleep(900);
  res.afterButtonMaximize = { page: await page(), maximized: b1.after?.maximized };
  const mb3 = win(["-Action", "maxbutton"]).maxButtonCenterLogical;
  const b2 = log("click restore button", win(["-Action", "click", "-X", String(mb3.x), "-Y", String(mb3.y)]));
  await sleep(900);
  res.afterButtonRestore = { page: await page(), maximized: b2.after?.maximized };
  void sn; void dc; void dc2;
  out.window = res;
}

// ---------------------------------------------------------------- M-2-R1: second tab (S-11, S-13), native maximize button (R-4 S-4/S-5/glyph), snap flyout and window behaviour (R-3)
const monShot = (name, args = ["-Action", "state"]) => {
  const file = resolve(process.env.TEMP ?? ".", `m2r1-${name}.png`);
  const r = win([...args, "-Out", file]);
  if (r.error) return { r };
  const mon = r.screenshot.monitor, co = r.after.clientOrigin;
  return { r, img: decodePng(readFileSync(file)), file, ox: co.x - mon.x, oy: co.y - mon.y, client: r.after.clientSize };
};
const cellBox = (img, x, y, w = 36, h = 32) => {
  const bg = pixel(img, x + 1, y + 1);
  let minx = 1e9, miny = 1e9, maxx = -1, maxy = -1, ink = 0;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (dist(pixel(img, x + i, y + j), bg) > 40) { ink++; minx = Math.min(minx, i); maxx = Math.max(maxx, i); miny = Math.min(miny, j); maxy = Math.max(maxy, j); }
  return { bg: hex(bg), ink, bbox: ink ? [minx, miny, maxx, maxy] : null };
};

async function tabsPhase() {
  out.tabs = [];
  for (const [theme, search] of [["Catppuccin Mocha", ""], ["Catppuccin Latte", "?theme=Catppuccin%20Latte"]]) {
    const T = expectedTokens(theme).tokens;
    await load(search);
    await evaluate(`document.activeElement.blur?.()`);
    const L = await evaluate(`(() => {
      const R = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; };
      const tabs = [...document.querySelectorAll(".pane .tab")], inact = document.querySelector(".tab:not(.active)");
      if (!inact) return { count: tabs.length, titles: tabs.map((t) => t.querySelector("button").textContent), inactive: null };
      const el = inact.querySelector("button"); el.setAttribute("data-ink", "S-13");
      const rg = document.createRange(); rg.selectNodeContents(el); const b = rg.getBoundingClientRect(), cs = getComputedStyle(el);
      return { count: tabs.length, titles: tabs.map((t) => t.querySelector("button").textContent + (t.classList.contains("active") ? " (active)" : "")),
        inactive: { pt: { x: Math.floor(R(inact).x + 1), y: Math.floor(R(inact).y + 1) }, ink: { text: el.textContent, rect: { x: b.left, y: b.top, w: b.width, h: b.height }, font: cs.font, letterSpacing: cs.letterSpacing } } };
    })()`);
    if (!L.inactive) { out.tabs.push({ theme, error: "no inactive tab", L }); continue; }
    const img = await shot();
    const rows = await judge(theme, "default", img, [
      { id: "S-11", name: "inactive tab (real)", tokenKey: "tab.inactive_background", token: T["tab.inactive_background"], layers: [], pt: L.inactive.pt },
      { id: "S-13", name: "inactive tab title (real)", tokenKey: "text.muted", token: T["text.muted"], layers: [T["tab.inactive_background"]], ink: L.inactive.ink },
    ]);
    out.tabs.push({ theme, count: L.count, titles: L.titles, rows });
  }
}

/** Native (GDI) maximize button: default/hover/pressed colour vs same-token DOM swatches in the same monitor capture; glyph vs a DOM reference glyph. */
async function nativePhase() {
  out.native = [];
  for (const [theme, search] of [["Catppuccin Mocha", ""], ["Catppuccin Latte", "?theme=Catppuccin%20Latte"]]) {
    const T = expectedTokens(theme).tokens, res = { theme, rows: [] };
    await load(search);
    const bar = await evaluate(`(() => { const b = document.querySelectorAll(".window-button")[1].getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height, label: document.querySelectorAll(".window-button")[1].getAttribute("aria-label") }; })()`);
    const away = () => win(["-Action", "hover", "-X", "700", "-Y", "500", "-HoldMs", "300"]);
    away();
    // glyph: reference clone of the minimize button (same class and font) carrying the maximize code point, placed to the left of the real buttons
    await evaluate(`(() => { const bar = document.querySelector(".title-bar"), first = bar.querySelector(".window-button"), c = first.cloneNode(false); c.id = "__ref"; c.textContent = String.fromCodePoint(0xe922); bar.insertBefore(c, first); })()`);
    await sleep(200);
    const refBox = await evaluate(`(() => { const b = document.getElementById("__ref").getBoundingClientRect(); return { x: b.left, y: b.top }; })()`);
    let m = monShot("native-glyph");
    if (m.r.error) throw new Error(m.r.error);
    const nat = { x: m.ox + Math.round(bar.x), y: m.oy + Math.round(bar.y) }, ref = { x: m.ox + Math.round(refBox.x), y: m.oy + Math.round(refBox.y) };
    const bn = cellBox(m.img, nat.x, nat.y), br = cellBox(m.img, ref.x, ref.y);
    let maxd = 0, best = { dy: 0, d: 1e9 };
    for (let dy = -2; dy <= 2; dy++) {
      let d = 0;
      for (let j = 3; j < 29; j++) for (let i = 0; i < 36; i++) d = Math.max(d, dist(pixel(m.img, nat.x + i, nat.y + j), pixel(m.img, ref.x + i, ref.y + j + dy)));
      if (dy === 0) maxd = d;
      if (d < best.d) best = { dy, d };
    }
    res.glyph = { native: bn, reference: br, maxPixelDiff: maxd, bestShift: best, bboxDelta: bn.bbox && br.bbox ? bn.bbox.map((v, i) => v - br.bbox[i]) : null };
    await evaluate(`document.getElementById("__ref").remove()`);
    // colours: swatches of the same tokens over the title bar (token over token), captured with the same monitor path
    await evaluate(`(() => { const ov = document.createElement("div"); ov.id = "__sw"; ov.style.position = "fixed"; ov.style.inset = "0"; ov.style.pointerEvents = "none"; ov.style.zIndex = "2147483647";
      const box = (x, cols) => { for (const c of cols) { const d = document.createElement("div"); d.style.position = "fixed"; d.style.left = x + "px"; d.style.top = "6px"; d.style.width = "20px"; d.style.height = "20px"; d.style.background = c; ov.appendChild(d); } };
      box(400, [${JSON.stringify(T["title_bar.background"])}]); box(440, [${JSON.stringify(T["title_bar.background"])}, ${JSON.stringify(T["ghost_element.hover"])}]); box(480, [${JSON.stringify(T["title_bar.background"])}, ${JSON.stringify(T["ghost_element.active"])}]);
      document.body.appendChild(ov); })()`);
    const sw = (img, k) => pixel(img, m.ox + 410 + k * 40, m.oy + 16);
    const cellPt = (img) => [pixel(img, nat.x + 4, nat.y + 4), pixel(img, nat.x + 31, nat.y + 27)];
    const row = (state, img, k, layers, token, id) => {
      const [p1, p2] = cellPt(img), q = sw(img, k), json = composite([...layers, token]);
      res.rows.push({ id, state, tokenKey: id === "S-4" ? "ghost_element.hover" : id === "S-5" ? "ghost_element.active" : "title_bar.background", app: p1, app2: p2, swatch: q, swatchDiff: Math.max(dist(p1, q), dist(p2, q)), json, jsonDiff: dist(p1, json), ok: Math.max(dist(p1, q), dist(p2, q)) <= tol });
    };
    await sleep(200);
    m = monShot("native-default");
    row("default (no hover)", m.img, 0, [], T["title_bar.background"], "base");
    const hv = win(["-Action", "hover", "-X", String(Math.round(bar.x + 18)), "-Y", "16", "-HoldMs", "1200", "-Out", resolve(process.env.TEMP ?? ".", "m2r1-native-hover.png")]);
    if (hv.error) throw new Error(hv.error);
    row("hover", decodePng(readFileSync(resolve(process.env.TEMP ?? ".", "m2r1-native-hover.png"))), 1, [T["title_bar.background"]], T["ghost_element.hover"], "S-4");
    const ph = win(["-Action", "presshold", "-X", String(Math.round(bar.x + 18)), "-Y", "16", "-DX", "-300", "-DY", "300", "-HoldMs", "700", "-MidOut", resolve(process.env.TEMP ?? ".", "m2r1-native-press.png")]);
    if (ph.error) throw new Error(ph.error);
    row("pressed (released outside)", decodePng(readFileSync(resolve(process.env.TEMP ?? ".", "m2r1-native-press.png"))), 2, [T["title_bar.background"]], T["ghost_element.active"], "S-5");
    await sleep(500);
    res.afterPressOutside = { maximized: ph.after.maximized, label: await evaluate(`document.querySelectorAll(".window-button")[1].getAttribute("aria-label")`) };
    await evaluate(`document.getElementById("__sw").remove()`);
    away();
    out.native.push(res);
  }
}

/** R-3 / R-4 after the native button: snap flyout (+ pick a cell), button click inside/outside, double click, move, resize. */
async function snapPhase() {
  const res = { steps: [] };
  await load("");
  const T = expectedTokens("Catppuccin Mocha").tokens;
  const st = (name, r, extra = {}) => { res.steps.push({ name, error: r.error, frame: r.after?.frame, client: r.after?.clientSize, maximized: r.after?.maximized, foreground: r.after?.foreground, ...extra }); return r; };
  const dom = () => evaluate(`({ w: innerWidth, h: innerHeight, label: document.querySelectorAll(".window-button")[1].getAttribute("aria-label"), glyph: document.querySelectorAll(".window-button")[1].textContent.codePointAt(0).toString(16) })`);
  const s0 = win(["-Action", "state"]);
  res.start = s0.after;
  // 1. flyout on hover (and pick a cell when the offset is known)
  const mb = win(["-Action", "maxbutton"]).maxButtonCenterLogical;
  const file = resolve(process.env.TEMP ?? ".", "m2r1-flyout.png");
  const args = ["-Action", "hoverclick", "-HoldMs", "2500", "-MidOut", file];
  const cell = process.env.M2_SNAP_CELL ? process.env.M2_SNAP_CELL.split(",").map(Number) : null; // dx,dy from the hover point, screen px
  let hc;
  if (cell) {
    const probe = win(["-Action", "state"]);
    const mon0 = { x: 0, y: 0 };
    const hx = probe.after.clientOrigin.x + mb.x, hy = probe.after.clientOrigin.y + mb.y;
    hc = win([...args, "-SX", String(hx + cell[0]), "-SY", String(hy + cell[1])]);
    void mon0;
  } else hc = win(args);
  st("hover max button 2.5s" + (cell ? " then click flyout cell" : ""), hc, { hoverScreen: hc.hoverScreen, clicked: hc.clickedScreen });
  if (!hc.error) {
    const img = decodePng(readFileSync(file)), mon = hc.midMonitor, px = hc.hoverScreen.x - mon.x, py = hc.hoverScreen.y - mon.y;
    saveCrop(img, Math.max(0, px - 330), Math.max(0, py - 40), 660, 400, "snap-flyout-hover-r1.png");
    res.flyoutCrop = "snap-flyout-hover-r1.png";
    res.hoverScreen = hc.hoverScreen;
  }
  await sleep(900);
  win(["-Action", "foreground"]); // dismiss Snap Assist (no input)
  await sleep(500);
  const afterSnap = win(["-Action", "state"]);
  st("state after flyout step", afterSnap);
  res.afterFlyout = afterSnap.after;
  res.afterFlyoutDom = await dom();
  // 2. double-click maximize / restore (from whatever state)
  const d1 = st("double-click title bar", win(["-Action", "dblclick", "-X", "700", "-Y", "16"]));
  await sleep(900);
  res.afterDbl1 = { maximized: d1.after?.maximized, dom: await dom() };
  const d2 = st("double-click title bar again", win(["-Action", "dblclick", "-X", "700", "-Y", "16"]));
  await sleep(900);
  res.afterDbl2 = { maximized: d2.after?.maximized, dom: await dom() };
  // make sure the window is a normal, fully visible window for the next steps
  if (d2.after?.maximized) win(["-Action", "dblclick", "-X", "700", "-Y", "16"]);
  const base = win(["-Action", "state"]).after;
  res.normalAgain = base;
  // 3. native button: press/release outside (nothing), press/release inside (maximize), glyph in maximized state, click again (restore)
  const bx = base.clientSize.width - 54, by = 16; // maximize button centre (L-39: second from the right)
  const po = st("press on max button, release outside", win(["-Action", "presshold", "-X", String(bx), "-Y", String(by), "-DX", "-300", "-DY", "300", "-HoldMs", "400"]));
  await sleep(700);
  res.releaseOutside = { maximized: po.after?.maximized, frameSame: JSON.stringify(po.after?.frame) === JSON.stringify(base.frame), dom: await dom() };
  const pi = st("press and release on max button (inside)", win(["-Action", "presshold", "-X", String(bx), "-Y", String(by), "-HoldMs", "400"]));
  await sleep(1000);
  res.releaseInside = { maximized: pi.after?.maximized, dom: await dom() };
  // glyph (U+E923) of the native button in the maximized state vs a DOM reference glyph
  win(["-Action", "hover", "-X", "700", "-Y", "500", "-HoldMs", "300"]);
  await evaluate(`(() => { const bar = document.querySelector(".title-bar"), first = bar.querySelector(".window-button"), c = first.cloneNode(false); c.id = "__ref"; c.textContent = String.fromCodePoint(0xe923); bar.insertBefore(c, first); })()`);
  await sleep(200);
  const rb = await evaluate(`(() => { const b = document.getElementById("__ref").getBoundingClientRect(), n = document.querySelectorAll(".window-button")[2].getBoundingClientRect(); return { rx: b.left, ry: b.top, nx: n.left, ny: n.top }; })()`);
  const m = monShot("native-glyph-max");
  if (!m.r.error) {
    const nat = { x: m.ox + Math.round(rb.nx), y: m.oy + Math.round(rb.ny) }, ref = { x: m.ox + Math.round(rb.rx), y: m.oy + Math.round(rb.ry) };
    const bn = cellBox(m.img, nat.x, nat.y), br = cellBox(m.img, ref.x, ref.y);
    let d0 = 0, best = { dy: 0, d: 1e9 };
    for (let dy = -2; dy <= 2; dy++) { let d = 0; for (let j = 3; j < 29; j++) for (let i = 0; i < 36; i++) d = Math.max(d, dist(pixel(m.img, nat.x + i, nat.y + j), pixel(m.img, ref.x + i, ref.y + j + dy))); if (dy === 0) d0 = d; if (d < best.d) best = { dy, d }; }
    res.glyphMax = { native: bn, reference: br, maxPixelDiff: d0, bestShift: best, bboxDelta: bn.bbox && br.bbox ? bn.bbox.map((v, i) => v - br.bbox[i]) : null, maximized: m.r.after.maximized };
  } else res.glyphMax = { error: m.r.error };
  await evaluate(`document.getElementById("__ref").remove()`);
  const bx2 = win(["-Action", "state"]).after.clientSize.width - 54;
  const pr = st("click max button again (restore)", win(["-Action", "click", "-X", String(bx2), "-Y", "16"]));
  await sleep(1000);
  res.restoreByButton = { maximized: pr.after?.maximized, dom: await dom() };
  // 4. move and resize still work (window must be visible on screen: move up first)
  // Moving up only as far as needed: dragging the pointer to the top screen edge would trigger Aero Snap.
  const fr0 = win(["-Action", "state"]).after.frame, bottom0 = fr0.y + fr0.height;
  const dyMove = bottom0 > 1000 ? -(bottom0 - 1000) : 0; // keep the bottom edge clear of the taskbar so the corner grip stays reachable
  const dr = st(`drag title bar +160,${dyMove}`, win(["-Action", "drag", "-X", "700", "-Y", "16", "-DX", "160", "-DY", String(dyMove)]));
  res.dragMoved = dr.error ? null : { dx: dr.after.frame.x - dr.before.frame.x, dy: dr.after.frame.y - dr.before.frame.y, sizeChanged: dr.after.frame.width !== dr.before.frame.width };
  let c = win(["-Action", "state"]).after.clientSize;
  const e1 = st("right edge -80", win(["-Action", "drag", "-X", String(c.width + 3), "-Y", "300", "-DX", "-80", "-DY", "0"]));
  c = win(["-Action", "state"]).after.clientSize;
  const e2 = st("bottom-right corner +80,+60", win(["-Action", "drag", "-X", String(c.width + 3), "-Y", String(c.height + 3), "-DX", "80", "-DY", "60"]));
  c = win(["-Action", "state"]).after.clientSize;
  const e3 = st("top-right: drag at the right edge beside the button row (y=16) -30", win(["-Action", "drag", "-X", String(c.width + 3), "-Y", "16", "-DX", "-30", "-DY", "0"]));
  res.resize = [[e1, "right edge -80"], [e2, "bottom-right +80,+60"], [e3, "right edge at title bar height -30"]].map(([r, n]) => ({ name: n, before: r.before?.clientSize, after: r.after?.clientSize, error: r.error }));
  out.snap = res;
}

// ---------------------------------------------------------------- run
try {
  await send("Page.enable");
  await send("Log.enable");
  await send("Runtime.enable");
  const logs = [];
  app.on((m) => {
    if (m.method === "Log.entryAdded") logs.push(`${m.params.entry.level} ${m.params.entry.text}`);
    if (m.method === "Runtime.exceptionThrown") logs.push("exception " + m.params.exceptionDetails.text);
  });
  await waitEditor();
  await sleep(800);
  const fg = win(["-Action", "foreground"]);
  if (fg.error) throw new Error("cannot bring the app to the foreground: " + fg.error);
  out.start = { win: { pid: fg.pid, hwnd: fg.hwnd, after: fg.after }, page: await evaluate(`({ href: location.href, w: innerWidth, h: innerHeight, dpr: devicePixelRatio, focus: document.hasFocus() })`) };

  if (phases.has("colors")) {
    out.colors = [];
    for (const [name, search] of [["Catppuccin Mocha", ""], ["Catppuccin Latte", "?theme=Catppuccin%20Latte"], ["One Light", "?theme=One%20Light"]]) out.colors.push(await colorsFor(name, search));
  }
  if (phases.has("r1")) await r1Phase();
  if (phases.has("keys") || phases.has("ime")) await keysPhase();
  if (phases.has("window")) await windowPhase();
  if (phases.has("tabs")) await tabsPhase();
  if (phases.has("native")) await nativePhase();
  if (phases.has("snap")) await snapPhase();
  out.logs = logs;
} catch (e) {
  out.error = String(e.stack ?? e);
} finally {
  app.kill();
}
writeFileSync(process.env.M2_OUT ?? resolve(process.env.TEMP ?? ".", "m2-result.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify({ error: out.error, colorsRows: out.colors?.flatMap((c) => c.rows.map((r) => `${c.theme} ${r.id} ${r.state}: ${r.ok ? "ok" : "FAIL"} d=${r.swatchDiff} json=${r.jsonDiff}`)), vars: out.colors?.map((c) => `${c.theme}: ${c.vars.filter((v) => v.ok).length}/${c.vars.length}`) }, null, 1));
