// leader probe (ORDER-09): I-22 #slug links in the markdown preview, release exe, only the visible preview is read.
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const REPO = "D:/projects/workbench-tauri";
const EXE = process.argv[2] || resolve(REPO, "src-tauri/target/release/workbench-tauri.exe");
const S = `${process.env.TEMP.replace(/\\/g, "/")}/v081-probe-i22`, SW = S.replace(/\//g, "\\");
rmSync(S, { recursive: true, force: true });
mkdirSync(`${S}/ws`, { recursive: true });
mkdirSync(`${S}/appdata/workbench-tauri`, { recursive: true });
const filler = Array.from({ length: 40 }, (_, i) => `Filler paragraph ${i + 1}.\n`).join("\n");
writeFileSync(`${S}/ws/toc.md`, `# Doc\n\n- [한글 제목](#한글-제목)\n- [Usage 1](#usage)\n- [Usage 2](#usage-1)\n- [Missing](#nonexistent)\n\n${filler}\n## 한글 제목\n\n${filler}\n## Usage\n\n${filler}\n## Usage\n\n${filler}`);
const md = (src) => ({ cell_type: "markdown", metadata: {}, source: [src] });
writeFileSync(`${S}/ws/toc.ipynb`, JSON.stringify({ nbformat: 4, nbformat_minor: 5, metadata: {}, cells: [md(`# Notebook\n\n- [Go to Target](#cell-target)\n\n${filler}`), md(`## Cell Target\n\nTarget cell reached.\n\n${filler}`)] }));
writeFileSync(`${S}/appdata/workbench-tauri/settings.json`, JSON.stringify({ theme: "One Dark" }));
writeFileSync(`${S}/appdata/workbench-tauri/state.json`, JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: `${SW}\\ws`, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }] }));
process.env.APPDATA = `${SW}\\appdata`;
process.env.WEBVIEW2_USER_DATA_FOLDER = `${SW}\\webview`;

const { launchApp } = await import(pathToFileURL(resolve(REPO, "tools/cdp-lib.mjs")).href);
const app = await launchApp(EXE);
const ev = app.evaluate, sleep = app.sleep;
const out = {};
const P = `[...document.querySelectorAll(".markdown-preview")].find(e => e.offsetParent)`;
const clickAt = async (js) => {
  const p = await ev(`(()=>{const e=${js};if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+Math.min(r.width/2,30),y:r.y+r.height/2}})()`);
  if (!p) throw new Error("not found " + js);
  for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await app.mouse(type, p.x, p.y, { clickCount: 1 });
  await sleep(900);
};
try {
  await sleep(3000);
  const row = `[...document.querySelectorAll('.tree-window .tree-row')].find(e=>e.dataset.path===${JSON.stringify(`${SW}\\ws\\toc.md`)})`;
  await clickAt(row);
  await clickAt(`[...document.querySelectorAll('button[aria-label="Open Preview"]')].find(e=>e.offsetParent)`);
  await sleep(2000);
  // the element that scrolls: the visible preview or its first scrollable ancestor
  const scroller = `(()=>{let e=${P};while(e&&e.scrollHeight<=e.clientHeight)e=e.parentElement;return e})()`;
  const state = () => ev(`(()=>{const s=${scroller};const hs=[...${P}.querySelectorAll("h2")].map(h=>Math.round(h.getBoundingClientRect().top));return {scrollTop:s?Math.round(s.scrollTop):null,scroller:s?.className,h2Tops:hs,tabs:[...document.querySelectorAll('.pane .tab')].length}})()`);
  out.start = await state();
  const link = (t) => `[...${P}.querySelectorAll("a")].find(a=>a.textContent.trim()===${JSON.stringify(t)})`;
  for (const t of ["한글 제목", "Usage 1", "Usage 2"]) {
    await ev(`(()=>{const s=${scroller};if(s)s.scrollTop=0})()`);
    await sleep(400);
    await clickAt(link(t));
    out[t] = await state();
  }
  await ev(`(()=>{const s=${scroller};if(s)s.scrollTop=0})()`);
  await sleep(400);
  out.missingBefore = await state();
  await clickAt(link("Missing"));
  out.missingAfter = await state();
  // ipynb: a markdown cell's TOC link to a heading in a later markdown cell, with enough below it to scroll
  await clickAt(`[...document.querySelectorAll('.tree-window .tree-row')].find(e=>e.dataset.path===${JSON.stringify(`${SW}\\ws\\toc.ipynb`)})`);
  await sleep(1000);
  if (!(await ev(`!!${P}`))) await clickAt(`[...document.querySelectorAll('button[aria-label="Open Preview"]')].find(e=>e.offsetParent)`);
  await sleep(2500);
  await ev(`(()=>{const s=${scroller};if(s)s.scrollTop=0})()`);
  await sleep(400);
  const nbState = () => ev(`(()=>{const p=${P};const s=${scroller};const h=[...p.querySelectorAll("h2")].find(e=>e.textContent.trim()==="Cell Target");return {scrollTop:s?Math.round(s.scrollTop):null,previewTop:Math.round(p.getBoundingClientRect().top),targetTop:h?Math.round(h.getBoundingClientRect().top):null,kind:p.className}})()`);
  out.nbBefore = await nbState();
  await clickAt(link("Go to Target"));
  out.nbAfter = await nbState();
} catch (e) { out.error = String(e); }
app.kill();
writeFileSync(resolve(REPO, "specs/v0.8.1/verify/ORDER-09/leader-probe/probe-i22.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
