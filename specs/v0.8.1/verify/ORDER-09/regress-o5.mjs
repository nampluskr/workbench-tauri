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
const row = (rel) => `document.querySelector('.tree-window .tree-row[data-path=' + JSON.stringify(JSON.stringify(${JSON.stringify(P(rel))})).slice(1, -1) + ']')`;
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
const fam = (js) => `(e=>e?getComputedStyle(e).fontFamily:null)(${js})`;
const size = (js) => `(e=>e?getComputedStyle(e).fontSize:null)(${js})`;

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
    const pre = `${preview} .code-block`;
    const checkTheme = async (theme) => {
      writeSettings({ theme });
      await sleep(1500);
      const bg = await ev(`({block:getComputedStyle(document.querySelector(${JSON.stringify(pre)})).backgroundColor,page:getComputedStyle(document.querySelector(${JSON.stringify(preview)})).backgroundColor})`);
      return { theme, ...bg, diff: bg.block !== bg.page };
    };
    const onedark = await checkTheme("One Dark");
    const onelight = await checkTheme("One Light");
    writeSettings({ theme: "One Dark" });
    await sleep(1500);
    return { onedark, onelight };
  });

  // USER-TEST #19: 코드 블록 머리 줄 (언어 라벨, 복사 버튼, 수식/mermaid 제외)
  await step("c9_headers", async () => {
    return ev(`(()=>{const p=document.querySelector(${JSON.stringify(preview)});const blocks=[...p.querySelectorAll('.code-block')].map(b=>({lang:b.querySelector('.code-block-language')?.textContent||null,hasCopy:!!b.querySelector('button[aria-label="Copy Code"], button[aria-label="Copied"]'),height:b.querySelector('.code-block-header')?.getBoundingClientRect().height||0}));return {blocks,mermaidHeader:!!p.querySelector('.mermaid-diagram .code-block-header'),mathHeader:!!p.querySelector('.katex .code-block-header')}})()`);
  });

  // USER-TEST #19: 코드 블록 복사 (클립보드 원문 일치, 아이콘 변화)
  await step("c10_copy", async () => {
    const copyBtn = `${preview} .code-block button[aria-label="Copy Code"]`;
    await click(copyBtn);
    await sleep(800);
    const copiedIcon = await ev(`document.querySelector(${JSON.stringify(preview)} + ' .code-block button')?.getAttribute('aria-label')`);
    const clip = execFileSync("powershell", ["-NoProfile", "-Command", "Get-Clipboard"], { encoding: "utf8" });
    const normalizedClip = clip.replace(/\r\n/g, "\n");
    const equal = normalizedClip === PY || normalizedClip.trim() === PY.trim();
    return { copiedIcon, equal, clipLength: clip.length };
  });

  // USER-TEST #18: 5개 글꼴 설정 변경 반영
  await step("c3_fonts", async () => {
    const fonts = ["JetBrains Mono", "Hack", "Ubuntu Mono", "D2Coding", "Lilex"];
    const r = {};
    for (const f of fonts) {
      writeSettings({ theme: "One Dark", preview_code_font_family: f, buffer_font_family: f });
      await sleep(1500);
      r[f] = {
        pre: await ev(fam(`${preview} pre`)),
        preSize: await ev(size(`${preview} pre`)),
        inline: await ev(fam(`${preview} code:not(pre code)`))
      };
    }
    writeSettings({ theme: "One Dark" });
    await sleep(1000);
    return r;
  });

  // USER-TEST #18: 한글 글꼴 렌더 (JetBrains Mono vs D2Coding)
  await step("c5_korean_editor", async () => {
    await click(row("doc.md"), { dbl: true });
    await sleep(1000);
    writeSettings({ theme: "One Dark", buffer_font_family: "JetBrains Mono" });
    await sleep(1500);
    const jbFonts = await app.send("CSS.getPlatformFontsForNode", {
      nodeId: (await app.send("DOM.querySelector", { nodeId: (await app.send("DOM.getDocument")).root.nodeId, selector: ".cm-line" })).nodeId
    }).catch(() => null);

    writeSettings({ theme: "One Dark", buffer_font_family: "D2Coding" });
    await sleep(1500);
    const d2Fonts = await app.send("CSS.getPlatformFontsForNode", {
      nodeId: (await app.send("DOM.querySelector", { nodeId: (await app.send("DOM.getDocument")).root.nodeId, selector: ".cm-line" })).nodeId
    }).catch(() => null);

    writeSettings({ theme: "One Dark" });
    return { jetbrains: jbFonts?.fonts?.map((f) => `${f.familyName}:${f.glyphCount}`), d2coding: d2Fonts?.fonts?.map((f) => `${f.familyName}:${f.glyphCount}`) };
  });

  // USER-TEST #20: Licenses 창에 4개 글꼴 라이선스 포함
  await step("c12_licenses", async () => {
    await click(`document.querySelector('[aria-label="Open Application Menu"]')`);
    await click(`[...document.querySelectorAll('.menu-name, [role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith("Help"))`);
    await click(`[...document.querySelectorAll('.menu-name, [role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith("About"))`);
    await sleep(1000);
    const aboutList = await ev("[...document.querySelectorAll('.about-credits li, .about-license-item, .licenses-list li')].map(e=>e.textContent.trim())");
    const btn = "[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Licenses'))";
    if (await ev(`!!${btn}`)) {
      await click(btn);
      await sleep(1500);
    }
    const licensesScan = await ev("(()=>{const text=document.body.innerText;return {jetbrains:text.includes('JetBrains Mono'),hack:text.includes('Hack'),ubuntu:text.includes('Ubuntu Mono'),d2coding:text.includes('D2Coding')}})()");
    return { aboutList, licensesScan };
  });
} catch (e) {
  log.fatal = e.stack;
} finally {
  app?.kill();
  const outPath = resolve(OUT, "v3-o5.json");
  writeFileSync(outPath, JSON.stringify(log, null, 2));
  console.log(`[O5] Result written to: ${outPath}`);
}
