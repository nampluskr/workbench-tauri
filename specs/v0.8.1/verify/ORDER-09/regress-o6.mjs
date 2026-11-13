// v0.8.1 ORDER-09 regression: ORDER-06 (USER-TEST #23 I-9 preview find bar).
// Usage: node specs/v0.8.1/verify/ORDER-09/regress-o6.mjs [exePath]
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const REPO = "D:/projects/workbench-tauri";
const EXE = process.argv[2] && process.argv[2] !== "-"
  ? resolve(process.argv[2])
  : resolve(REPO, process.env.TAURI_EXE || (process.env.USE_DEBUG ? "src-tauri/target/debug/workbench-tauri.exe" : "src-tauri/target/release/workbench-tauri.exe"));

const TEMP = (process.env.TEMP || "C:/Users/nampl/AppData/Local/Temp").replace(/\\/g, "/");
const S = `${TEMP}/v081-regress-o6`;
const SW = S.replace(/\//g, "\\");
const OUT = resolve(REPO, "specs/v0.8.1/verify/ORDER-09/regress");
const W = `${S}/o6ws`, WW = `${SW}\\o6ws`;
const DATA = `${S}/appdata6/workbench-tauri`;

rmSync(W, { recursive: true, force: true });
rmSync(`${S}/appdata6`, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(DATA, { recursive: true });

const put = (f, t) => {
  mkdirSync(`${W}/${f}`.replace(/\/[^/]+$/, ""), { recursive: true });
  writeFileSync(`${W}/${f}`, t);
};

let filler = "";
for (let i = 0; i < 60; i++) filler += `Filler line ${i} without the word.\n\n`;
put("find.md", [
  "# Find Test", "", "[jump](#far-section)", "",
  "Apple apple applesauce APPLE and pineapple.", "",
  "한글 검색 문장입니다. 한글은 두 번.", "",
  "Body mentions python once.", "",
  "```python", "def fruit():", "    return 'banana'", "```", "",
  "$$", "x^2+1", "$$", "",
  "```mermaid", "graph TD; Alpha-->Beta", "```", "",
  filler,
  "## Far Section", "", "last apple here", ""
].join("\n"));
put("find.ipynb", JSON.stringify({
  cells: [
    { cell_type: "code", metadata: {}, execution_count: 7, source: ["x = 'kiwi'"], outputs: [{ output_type: "stream", name: "stdout", text: ["kiwi printed\n"] }] },
    { cell_type: "markdown", metadata: {}, source: ["## Notes on kiwi"] }
  ],
  metadata: { language_info: { name: "python" } },
  nbformat: 4,
  nbformat_minor: 5
}));
put("data.csv", "name,fruit\nann,apple\nbob,pear\n");
put("data.tsv", "name\tfruit\nann\tapple\n");
put("page.html", "<p>apple html</p>");
put("pic.svg", '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><text x="5" y="20">apple</text></svg>');
put("d.mmd", "graph TD; apple-->pear");

writeFileSync(`${DATA}/settings.json`, JSON.stringify({ theme: "One Dark" }) + "\n");
writeFileSync(`${DATA}/state.json`, JSON.stringify({
  version: 1,
  windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }]
}));

process.env.APPDATA = `${SW}\\appdata6`;
process.env.WEBVIEW2_USER_DATA_FOLDER = `${SW}\\webview6`;

const { launchApp } = await import(pathToFileURL(resolve(REPO, "tools/cdp-lib.mjs")).href);
const log = {};
let app;
const ev = (js) => app.evaluate(js);
const sleep = (ms) => app.sleep(ms);
const shot = async (n) => {
  const r = await app.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${OUT}/${n}.png`, Buffer.from(r.data, "base64"));
};
const row = (rel) => `document.querySelector('.tree-window .tree-row[data-path=' + JSON.stringify(JSON.stringify(${JSON.stringify(WW + "\\") + " + " + JSON.stringify(rel.replace(/\//g, "\\"))})).slice(1, -1) + ']')`;
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

const KEYS = {
  f: ["f", "KeyF", 70],
  enter: ["Enter", "Enter", 13],
  esc: ["Escape", "Escape", 27],
  f3: ["F3", "F3", 114]
};
const press = async (k, mod = 0) => {
  const [key, code, vk] = KEYS[k];
  await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code, windowsVirtualKeyCode: vk, modifiers: mod });
  if (k === "enter") await app.send("Input.dispatchKeyEvent", { type: "char", text: "\r", key, code, windowsVirtualKeyCode: vk });
  await app.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: vk, modifiers: mod });
  await sleep(500);
};
const step = async (name, fn) => {
  try {
    log[name] = await fn();
  } catch (e) {
    log[name] = "ERR " + e.message;
  }
};
const preview = "[...document.querySelectorAll('.markdown-preview')].find(e=>e.offsetParent)";
const bar = `${preview}?.querySelector('.preview-search')`;
const state = () => ev(`(()=>{const p=${preview};const b=p?.querySelector('.preview-search');return {open:!!b&&!!b.offsetParent,count:b?.querySelector('.document-search-count')?.textContent??null,focused:!!b&&b.contains(document.activeElement),hl:CSS.highlights?.get('preview-find')?.size??null,cur:CSS.highlights?.get('preview-find-current')?.size??null,scrollTop:p?Math.round(p.scrollTop):null}})()`);
const setQuery = async (q) => {
  await ev(`(()=>{const i=${bar}.querySelector('input');i.focus();const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(i,${JSON.stringify(q)});i.dispatchEvent(new Event('input',{bubbles:true}))})()`);
  await sleep(500);
  return state();
};

try {
  app = await launchApp(EXE);
  await sleep(6000);
  execFileSync("pwsh", ["-NoProfile", "-File", resolve(REPO, "tools/win-input.ps1"), "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" });
  await sleep(600);

  // USER-TEST #23: 미리보기 열기 및 Ctrl+F
  await click(row("find.md"), { dbl: true });
  await sleep(1000);
  await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {});
  await sleep(2500);

  await step("c5_md_open", async () => {
    await ev(`${preview}.focus()`);
    await press("f", 2);
    return state();
  });

  await step("c6_toggles", async () => {
    const q1 = await setQuery("apple");
    await click(`${bar} button[aria-label="Match Case"]`);
    const q2 = await state();
    await click(`${bar} button[aria-label="Match Whole Word"]`);
    const q3 = await state();
    await click(`${bar} button[aria-label="Match Case"]`);
    await click(`${bar} button[aria-label="Match Whole Word"]`);
    await click(`${bar} button[aria-label="Use Regular Expression"]`);
    const q4 = await setQuery("app.e");
    await click(`${bar} button[aria-label="Use Regular Expression"]`);
    const q5 = await state();
    const q6 = await setQuery("한글");
    return { apple: q1, caseSensitive: q2, wholeWord: q3, regexOn: q4, regexOff: q5, korean: q6 };
  });

  await step("c6_next_prev", async () => {
    await setQuery("apple");
    const counts = [await state()];
    for (let i = 0; i < 5; i++) {
      await press("enter");
      counts.push(await state());
    }
    await press("enter", 8); // Shift+Enter
    counts.push(await state());
    return counts;
  });

  await step("c7_scope", async () => {
    const pythonCount = await setQuery("python");
    return { pythonCount };
  });

  await step("c5_esc", async () => {
    await press("esc");
    return state();
  });
} catch (e) {
  log.fatal = e.stack;
} finally {
  app?.kill();
  const outPath = resolve(OUT, "v3-o6.json");
  writeFileSync(outPath, JSON.stringify(log, null, 2));
  console.log(`[O6] Result written to: ${outPath}`);
}
