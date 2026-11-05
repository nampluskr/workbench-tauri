// Phase 1 V3: R-1 (tab move keeps EditorView), R-2 E-015 (selection corner radius), CSP/nonce on the built exe.
// Usage: node tools/measure-p1.mjs [exe]   -> prints JSON. Edits nothing; the app is killed at the end.
import { launchApp, metric } from "./cdp-lib.mjs";

const app = await launchApp(process.argv[2]);
const { send, evaluate, mouse, sleep } = app;
const out = {};

try {
  // Collectors are attached before the reload so first-load log entries are replayed too.
  const logs = [];
  app.on((m) => {
    if (m.method === "Log.entryAdded") logs.push({ src: "Log", level: m.params.entry.level, source: m.params.entry.source, text: m.params.entry.text });
    if (m.method === "Runtime.consoleAPICalled") logs.push({ src: "console", level: m.params.type, text: m.params.args.map((a) => a.value ?? a.description).join(" ") });
    if (m.method === "Runtime.exceptionThrown") logs.push({ src: "exception", text: m.params.exceptionDetails.text + " " + (m.params.exceptionDetails.exception?.description ?? "") });
  });
  await send("Page.enable");
  await send("Log.enable");
  await send("Runtime.enable");
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `window.__csp = []; document.addEventListener("securitypolicyviolation", (e) => window.__csp.push({ directive: e.violatedDirective, blocked: e.blockedURI, sample: e.sample }), true);`,
  });
  await sleep(1500);
  const firstLoadLogs = logs.length;
  await send("Page.reload");
  await sleep(2500);
  await evaluate(`new Promise(r => { const t = setInterval(() => { if (document.querySelector(".cm-editor")) { clearInterval(t); r(); } }, 50); })`);

  out.window = await evaluate(`({ href: location.href, innerWidth, innerHeight, dpr: devicePixelRatio, hasFocus: document.hasFocus() })`);

  // --- CSP / nonce ---
  out.csp = await evaluate(`(async () => {
    const carrier = document.getElementById("csp-nonce-carrier");
    const cm = [...document.querySelectorAll("style")].filter((s) => (s.textContent || "").includes(".cm-"));
    const scroller = getComputedStyle(document.querySelector(".cm-scroller"));
    const res = await fetch(location.href);
    return {
      header: res.headers.get("content-security-policy"),
      carrierNonceSet: !!carrier.nonce,
      cmStyleCount: cm.length,
      cmStylesWithMatchingNonce: cm.filter((s) => s.nonce && s.nonce === carrier.nonce).length,
      cmStylesWithRules: cm.filter((s) => s.sheet && s.sheet.cssRules.length > 0).length,
      applied: { scrollerOverflowX: scroller.overflowX, scrollerLineHeight: scroller.lineHeight, scrollerFontFamily: scroller.fontFamily },
    };
  })()`);

  // --- R-1 setup: scroll, then drag-select among visible lines ---
  await evaluate(`(() => { window.__node = document.querySelector(".cm-editor"); window.__scroller = document.querySelector(".cm-scroller");
    window.__scroller.scrollTop = 300; window.__scroller.scrollLeft = 20; })()`);
  await sleep(300);
  const pts = await evaluate(`(() => {
    const sc = document.querySelector(".cm-scroller").getBoundingClientRect();
    const g = document.querySelector(".cm-gutters").getBoundingClientRect();
    const lines = [...document.querySelectorAll(".cm-line")].map((l) => l.getBoundingClientRect()).filter((r) => r.top >= sc.top + 5 && r.bottom <= sc.bottom - 5);
    return { x0: g.right + 30, y0: lines[1].top + lines[1].height / 2, x1: g.right + 200, y1: lines[4].top + lines[4].height / 2 };
  })()`);
  await mouse("mouseMoved", pts.x0, pts.y0);
  await mouse("mousePressed", pts.x0, pts.y0, { buttons: 1, clickCount: 1 });
  for (let i = 1; i <= 8; i++) await mouse("mouseMoved", pts.x0 + ((pts.x1 - pts.x0) * i) / 8, pts.y0 + ((pts.y1 - pts.y0) * i) / 8, { buttons: 1 });
  await mouse("mouseReleased", pts.x1, pts.y1, { buttons: 0, clickCount: 1 });
  await sleep(300);

  const snapFn = `(() => {
    const n = window.__node, sc = document.querySelector(".cm-scroller"), s = getSelection(), ed = document.querySelector(".cm-editor");
    const er = ed.getBoundingClientRect();
    const rel = (el) => { const r = el.getBoundingClientRect(); return [r.left - er.left, r.top - er.top, r.width, r.height].map((v) => +v.toFixed(2)); };
    const prev = window.__sel;
    return {
      sameNode: ed === n, isConnected: n.isConnected, editorCount: document.querySelectorAll(".cm-editor").length,
      sameScroller: sc === window.__scroller,
      paneIndex: [...document.querySelectorAll(".pane")].findIndex((p) => p.contains(n)),
      scrollTop: sc.scrollTop, scrollLeft: sc.scrollLeft,
      cmFocused: ed.classList.contains("cm-focused"),
      domSel: { rangeCount: s.rangeCount, isCollapsed: s.isCollapsed, anchorOffset: s.anchorOffset, focusOffset: s.focusOffset, text: s.toString(),
        anchorInEditor: n.contains(s.anchorNode), focusInEditor: n.contains(s.focusNode),
        sameAnchorNode: prev ? s.anchorNode === prev.anchorNode : null, sameFocusNode: prev ? s.focusNode === prev.focusNode : null },
      cursors: [...document.querySelectorAll(".cm-cursor")].map(rel),
      selRects: [...document.querySelectorAll(".cm-selectionBackground")].map(rel),
      radii: [...document.querySelectorAll(".cm-selectionBackground")].map((e) => getComputedStyle(e).borderTopLeftRadius),
      lineHeight: getComputedStyle(sc).lineHeight,
    };
  })()`;
  out.before = await evaluate(snapFn);
  // keep the DOM selection endpoints (nodes) for === comparison after the move
  await evaluate(`(() => { const s = getSelection(); window.__sel = { anchorNode: s.anchorNode, focusNode: s.focusNode }; })()`);

  // --- move the tab Pane 0 -> 1 with a real mouse click on the arrow button ---
  const btn = await evaluate(`(() => { const b = document.querySelector(".pane .tab button[aria-label]"); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: b.textContent }; })()`);
  out.button = btn;
  await mouse("mouseMoved", btn.x, btn.y);
  await mouse("mousePressed", btn.x, btn.y, { buttons: 1, clickCount: 1 });
  await mouse("mouseReleased", btn.x, btn.y, { buttons: 0, clickCount: 1 });
  await evaluate(`new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`);
  out.afterFrame = await evaluate(snapFn);
  await sleep(500);
  out.after500 = await evaluate(snapFn);

  // --- E-015 expected values (spec/zed-metrics.toml) ---
  const lineHeight = metric("typography", "buffer_font_size") * metric("editor", "line_height.comfortable_multiplier");
  out.e015 = { lineHeight, multiplier: metric("editor", "selection.corner_radius_multiplier"), tolerance: metric("verification.tolerance", "dimension") };
  out.e015.expected = lineHeight * out.e015.multiplier;

  // --- CSP counts, then a positive control (an un-nonced <style> must be reported) ---
  const cspText = () => logs.filter((l) => /content security policy|csp|refused to/i.test(l.text)).length;
  out.cspCounts = { violationEvents: await evaluate(`window.__csp.length`), logEntriesFirstLoad: firstLoadLogs, logEntriesTotal: logs.length, cspTextMatches: cspText(), errors: logs.filter((l) => l.level === "error" || l.src === "exception").length, all: logs };
  await evaluate(`(() => { const s = document.createElement("style"); s.textContent = "body{}"; document.head.appendChild(s); })()`);
  await sleep(500);
  out.positiveControl = { violationEvents: await evaluate(`window.__csp.length`), sample: await evaluate(`window.__csp`), cspTextMatches: cspText() };
} catch (e) {
  out.error = String(e.stack ?? e);
} finally {
  app.kill();
}
console.log(JSON.stringify(out, null, 2));
