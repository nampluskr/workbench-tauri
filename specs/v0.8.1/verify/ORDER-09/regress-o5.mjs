// v0.8.1 ORDER-09 regression: ORDER-05 (USER-TEST #18, #19, #20).
// Usage: node specs/v0.8.1/verify/ORDER-09/regress-o5.mjs [exePath]
import { writeFileSync, mkdirSync, rmSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const REPO = "D:/projects/workbench-tauri";
const EXE = process.argv[2] && process.argv[2] !== "-"
  ? resolve(process.argv[2])
  : resolve(REPO, process.env.TAURI_EXE || (process.env.USE_DEBUG ? "src-tauri/target/debug/workbench-tauri.exe" : "src-tauri/target/release/workbench-tauri.exe"));

const TEMP = (process.env.TEMP || "C:/Users/nampl/AppData/Local/Temp").replace(/\\/g, "/");
const S = `${TEMP}/v081-regress-o5`;
const SW = S.replace(/\//g, "\\");
const OUT = resolve(REPO, "specs/v0.8.1/verify/ORDER-09/regress");
const W = `${S}/o5ws`, WW = `${SW}\\o5ws`;
const DATA = `${S}/appdata5/workbench-tauri`;

rmSync(W, { recursive: true, force: true });
rmSync(`${S}/appdata5`, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(DATA, { recursive: true });

const put = (f, t) => {
  mkdirSync(`${W}/${f}`.replace(/\/[^/]+$/, ""), { recursive: true });
  writeFileSync(`${W}/${f}`, t);
};

const PY = "def greet(name):\n\t# 한글 주석입니다\n\treturn f\"hi {name}\"\n";
put("doc.md", [
  "# Code", "", "Inline `code` here.", "", "```python", PY + "```", "",
  "```", "plain fence", "```", "", "    indented block", "",
  "```mermaid", "graph TD; A-->B", "```", "", "$$", "x^2", "$$", "", "## Later", "", "end", ""
].join("\n"));
put("nb.ipynb", JSON.stringify({
  cells: [{
    cell_type: "code",
    metadata: {},
    execution_count: 3,
    source: ["print('hi')\n", "# 주석"],
    outputs: [{ output_type: "stream", name: "stdout", text: ["hi\n"] }]
  }],
  metadata: { language_info: { name: "python" } },
  nbformat: 4,
  nbformat_minor: 5
}));
put("long.ts", "const a = 1; // " + "x".repeat(70) + " end\nconst b = 2;\n");

const SETTINGS = `${DATA}/settings.json`;
const writeSettings = (obj) => writeFileSync(SETTINGS, JSON.stringify(obj, null, 2) + "\n");
writeSettings({ theme: "One Dark" });
writeFileSync(`${DATA}/state.json`, JSON.stringify({
  version: 1,
  windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }]
}));

process.env.APPDATA = `${SW}\\appdata5`;
process.env.WEBVIEW2_USER_DATA_FOLDER = `${SW}\\webview5`;

const { launchApp } = await import(pathToFileURL(resolve(REPO, "tools/cdp-lib.mjs")).href);
const log = {};
let app;
const ev = (js) => app.evaluate(js);
const sleep = (ms) => app.sleep(ms);
const shot = async (n) => {
  const r = await app.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${OUT}/${n}.png`, Buffer.from(r.data, "base64"));
};
const P = (rel) => `${WW}\\${rel.replace(/\//g, "\\")}`;
const row = (rel) => `([...document.querySelectorAll('.tree-window .tree-row')].find(e => (e.dataset.path || e.getAttribute('data-path')) === ${JSON.stringify(P(rel))}) || document.querySelector('.tree-window .tree-row[data-path=${JSON.stringify(JSON.stringify(P(rel))).slice(1, -1)}]'))`;
const pt = (js, center) => ev(`(()=>{const e=${js};if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:Math.round(r.x+${center ? "r.width/2" : "Math.min(r.width/2,60)"}),y:Math.round(r.y+r.height/2)}})()`);
const click = async (js, o = {}) => {
  const p = await pt(js, o.center);
  if (!p) throw new Error("not found " + js);
  for (let c = 1; c <= (o.dbl ? 2 : 1); c++) {
    await app.mouse("mouseMoved", p.x, p.y);
    await app.mouse("mousePressed", p.x, p.y, { button: "left", clickCount: c });
    await app.mouse("mouseReleased", p.x, p.y, { button: "left", clickCount: c });
  }
  await sleep(o.wait ?? 700);
};
const step = async (name, fn) => {
  try {
    log[name] = await fn();
  } catch (e) {
    log[name] = "ERR " + e.message;
  }
};
const preview = "[...document.querySelectorAll('.markdown-preview')].find(e=>e.offsetParent)";
const editor = "[...document.querySelectorAll('.cm-editor')].find(e=>e.offsetParent)";
const tabByTitle = (t) => "[...document.querySelectorAll('.pane .tab')].find(x=>x.querySelector('.tab-title').textContent.trim()===" + JSON.stringify(t) + ")";
const fam = (js) => `(e=>e?getComputedStyle(e).fontFamily:null)(${js})`;
const size = (js) => `(e=>e?getComputedStyle(e).fontSize:null)(${js})`;

const platformFonts = async (js) => {
  await app.send("DOM.enable");
  await app.send("CSS.enable");
  const { root } = await app.send("DOM.getDocument", { depth: -1 });
  const { result } = await app.send("Runtime.evaluate", { expression: js });
  if (!result.objectId) return null;
  const { nodeId } = await app.send("DOM.requestNode", { objectId: result.objectId });
  const r = await app.send("CSS.getPlatformFontsForNode", { nodeId });
  return r.fonts.map((f) => f.familyName + ":" + f.glyphCount);
};
const koreanSpan = (scope) => "(()=>{const w=document.createTreeWalker(" + scope + ",NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))if(/한글|주석/.test(n.textContent))return n.parentElement;return null})()";

try {
  app = await launchApp(EXE);
  await sleep(6000);
  execFileSync("pwsh", ["-NoProfile", "-File", resolve(REPO, "tools/win-input.ps1"), "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" });
  await sleep(600);

  await click(row("doc.md"), { dbl: true });
  await sleep(1500);
  await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {});
  await sleep(2500);

  // USER-TEST #19: 코드 블록 음영 (One Dark, One Light 등)
  await step("c8_shading", async () => {
    const checkTheme = async (theme) => {
      writeSettings({ theme, preview_theme: theme });
      await sleep(1500);
      const bg = await ev(`(()=>{const p=${preview};const b=p?.querySelector('.code-block');return {block:b?getComputedStyle(b).backgroundColor:null,page:p?getComputedStyle(p).backgroundColor:null}})()`);
      return { theme, ...bg, diff: bg?.block !== bg?.page };
    };
    const onedark = await checkTheme("One Dark");
    const onelight = await checkTheme("One Light");
    writeSettings({ theme: "One Dark" });
    await sleep(1500);
    return { onedark, onelight };
  });

  // USER-TEST #19: 코드 블록 머리 줄 (언어 라벨, 복사 버튼, 수식/mermaid 제외)
  await step("c9_headers", async () => {
    return ev(`(()=>{const p=${preview};if(!p)return {blocks:[],mermaidHeader:false,mathHeader:false};const blocks=[...p.querySelectorAll('.code-block')].map(b=>({lang:b.querySelector('.code-block-language')?.textContent||null,hasCopy:!!b.querySelector('button[aria-label="Copy Code"], button[aria-label="Copied"], .code-block-copy'),height:b.querySelector('.code-block-header')?.getBoundingClientRect().height||0}));return {blocks,mermaidHeader:!!p.querySelector('.mermaid-diagram .code-block-header'),mathHeader:!!p.querySelector('.katex .code-block-header, .math-display .code-block-header')}})()`);
  });

  // USER-TEST #19: 코드 블록 복사 (클립보드 원문 일치, 아이콘 변화)
  await step("c10_copy", async () => {
    await click(`${preview}?.querySelector('.code-block button, .code-block .code-block-copy')`, { center: true });
    await sleep(800);
    const copiedIcon = await ev(`${preview}?.querySelector('.code-block button, .code-block .code-block-copy')?.getAttribute('aria-label')`);

    // Read via Rust command read_clipboard_text (app IPC)
    const clipIpc = await ev(`window.__TAURI_INTERNALS__.invoke("read_clipboard_text")`).catch(() => null);
    // Also read via pwsh UTF-8 Get-Clipboard -Raw
    const clipPwsh = execFileSync("pwsh", ["-NoProfile", "-Command", "[Console]::OutputEncoding=[Text.Encoding]::UTF8; Get-Clipboard -Raw"], { encoding: "utf8" }).replace(/\r?\n$/, "");
    const clip = typeof clipIpc === "string" ? clipIpc : clipPwsh;

    const norm = (t) => (t || "").replace(/\r\n/g, "\n");
    const equal = norm(clip) === PY || norm(clip) + "\n" === PY || norm(clip).trim() === PY.trim();
    return {
      expected: PY,
      clip,
      clipIpc,
      clipPwsh,
      equal,
      clipLength: clip ? clip.length : 0,
      copiedIcon
    };
  });

  // USER-TEST #18: 5개 글꼴 설정 변경 반영
  await step("c3_fonts", async () => {
    const fonts = ["JetBrains Mono", "Hack", "Ubuntu Mono", "D2Coding", "Lilex"];
    const r = {};
    for (const f of fonts) {
      writeSettings({ theme: "One Dark", preview_code_font_family: f, buffer_font_family: f });
      await sleep(1500);
      r[f] = {
        pre: await ev(fam(`${preview}?.querySelector('.code-block > pre')`)),
        preSize: await ev(size(`${preview}?.querySelector('.code-block > pre')`)),
        inline: await ev(fam(`${preview}?.querySelector(':not(pre) > code')`))
      };
    }
    writeSettings({ theme: "One Dark" });
    await sleep(1000);
    return r;
  });

  // USER-TEST #18: 한글 글꼴 렌더 (JetBrains Mono vs D2Coding)
  await step("c5_korean_editor", async () => {
    await click(tabByTitle("doc.md")).catch(() => click(row("doc.md"), { dbl: true }));
    await sleep(800);
    const r = {};
    for (const f of ["JetBrains Mono", "D2Coding"]) {
      writeSettings({ theme: "One Dark", buffer_font_family: f });
      await sleep(2500);
      r[f] = await platformFonts(koreanSpan(editor));
    }
    writeSettings({ theme: "One Dark" });
    await sleep(1500);
    return {
      "JetBrains Mono": r["JetBrains Mono"],
      "D2Coding": r["D2Coding"],
      jetbrains: r["JetBrains Mono"],
      d2coding: r["D2Coding"]
    };
  });

  // USER-TEST #20: Licenses 창에 4개 글꼴 라이선스 포함
  await step("c12_licenses", async () => {
    await click(`document.querySelector('[aria-label="Open Application Menu"]')`);
    await click(`[...document.querySelectorAll('.menu-name, [role=menuitem]')].find(e=>/^Help/.test(e.textContent.trim()))`).catch(() => {});
    await click(`[...document.querySelectorAll('[role=menuitem], .menu-item')].find(e=>/About/.test(e.textContent))`);
    await sleep(1000);
    const list = await ev("[...document.querySelectorAll('.about-attributions li, .about-credits li')].map(l=>l.textContent).filter(t=>/JetBrains|Hack|Ubuntu|D2Coding/i.test(t))");
    await shot("c12-about");
    await click("[...document.querySelectorAll('.about-buttons button, button')].find(b=>b.textContent==='View All Licenses')").catch(() => {});
    await sleep(1500);
    const text = await ev("[...document.querySelectorAll('.cm-content, .licenses, pre')].map(e=>e.textContent).join('\\n')");
    const scan = {
      jetbrains: /JetBrains Mono/.test(text) || list.some((t) => /JetBrains/i.test(t)),
      hack: (/Hack/.test(text) && /Bitstream Vera/.test(text)) || list.some((t) => /Hack/i.test(t)),
      ubuntu: /UBUNTU FONT LICENCE|Ubuntu Mono/i.test(text) || list.some((t) => /Ubuntu/i.test(t)),
      d2coding: /D2Coding/i.test(text) || list.some((t) => /D2Coding/i.test(t))
    };
    return { aboutList: list, licensesScan: scan, licensesHas: scan, licensesLen: text.length };
  });
} catch (e) {
  log.fatal = e.stack;
} finally {
  app?.kill();
  const outPath = resolve(OUT, "v3-o5.json");
  writeFileSync(outPath, JSON.stringify(log, null, 2));
  console.log(`[O5] Result written to: ${outPath}`);
}
