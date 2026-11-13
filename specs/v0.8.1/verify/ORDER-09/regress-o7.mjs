// v0.8.1 ORDER-09 regression: ORDER-07 (USER-TEST #25 unstyled HTML theme, links, network isolation).
// Usage: node specs/v0.8.1/verify/ORDER-09/regress-o7.mjs [exePath]
import { writeFileSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const REPO = "D:/projects/workbench-tauri";
const EXE = process.argv[2] && process.argv[2] !== "-"
  ? resolve(process.argv[2])
  : resolve(REPO, process.env.TAURI_EXE || (process.env.USE_DEBUG ? "src-tauri/target/debug/workbench-tauri.exe" : "src-tauri/target/release/workbench-tauri.exe"));

const TEMP = (process.env.TEMP || "C:/Users/nampl/AppData/Local/Temp").replace(/\\/g, "/");
const S = `${TEMP}/v081-regress-o7`;
const SW = S.replace(/\//g, "\\");
const OUT = resolve(REPO, "specs/v0.8.1/verify/ORDER-09/regress");
const W = `${S}/o7ws`, WW = `${SW}\\o7ws`;
const DATA = `${S}/appdata7/workbench-tauri`;

rmSync(W, { recursive: true, force: true });
rmSync(`${S}/appdata7`, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(DATA, { recursive: true });

const fixtureDir = resolve(REPO, "specs/v0.8.1/verify/ORDER-07/fixtures");
cpSync(fixtureDir, W, { recursive: true });
const mockupHtml = "D:/projects/workbench-core/specs/v0.8.1/mockups/outline/index.html";
cpSync(mockupHtml, `${W}/outline-mockup.html`);

writeFileSync(`${W}/plain.html`, "<h1>Plain</h1><p>Unstyled text with <a href=\"#x\">a link</a>.</p><p id=\"x\">x</p>");
writeFileSync(`${W}/tiny.pdf`, "%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n");

const setSettings = (o) => writeFileSync(`${DATA}/settings.json`, JSON.stringify({ theme: "One Dark", ...o }) + "\n");
setSettings({});
writeFileSync(`${DATA}/state.json`, JSON.stringify({
  version: 1,
  windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }]
}));

process.env.APPDATA = `${SW}\\appdata7`;
process.env.WEBVIEW2_USER_DATA_FOLDER = `${SW}\\webview7`;

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
const pt = (js) => ev(`(()=>{const e=${js};if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:Math.round(r.x+Math.min(r.width/2,60)),y:Math.round(r.y+r.height/2)}})()`);
const click = async (js, dbl) => {
  const p = await pt(js);
  if (!p) throw new Error("not found " + js);
  for (let c = 1; c <= (dbl ? 2 : 1); c++) {
    await app.mouse("mouseMoved", p.x, p.y);
    await app.mouse("mousePressed", p.x, p.y, { button: "left", clickCount: c });
    await app.mouse("mouseReleased", p.x, p.y, { button: "left", clickCount: c });
  }
  await sleep(700);
};
const step = async (name, fn) => {
  try {
    log[name] = await fn();
  } catch (e) {
    log[name] = "ERR " + e.message;
  }
};

let fw = null, fwUrl = null, fid = 0;
async function frameTarget() {
  const list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
  const t = list.filter((x) => x.type === "iframe" && /preview/.test(x.url)).pop();
  if (!t) return null;
  if (fwUrl !== t.webSocketDebuggerUrl) {
    try { fw?.close(); } catch {}
    fw = new WebSocket(t.webSocketDebuggerUrl);
    fwUrl = t.webSocketDebuggerUrl;
    await new Promise((r) => (fw.onopen = r));
  }
  return t;
}
const fsend = (method, params = {}) => new Promise((res) => {
  const id = ++fid;
  const h = (m) => {
    const d = JSON.parse(m.data);
    if (d.id === id) {
      fw.removeEventListener("message", h);
      res(d.result ?? d);
    }
  };
  fw.addEventListener("message", h);
  fw.send(JSON.stringify({ id, method, params }));
});
const fev = async (expr) => {
  if (!(await frameTarget())) return { noFrame: true };
  const r = await fsend("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  return r.result?.value ?? r;
};

try {
  app = await launchApp(EXE);
  await sleep(6000);
  execFileSync("pwsh", ["-NoProfile", "-File", resolve(REPO, "tools/win-input.ps1"), "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" });
  await sleep(600);

  // USER-TEST #25: 스타일 없는 HTML 테마 색상 (One Dark -> One Light)
  await step("c7_plain_theme", async () => {
    await click(row("plain.html"), true);
    await sleep(1200);
    await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {});
    await sleep(2500);

    const readColors = async () => {
      const frameStyles = await fev("({body:getComputedStyle(document.body).color,link:getComputedStyle(document.querySelector('a')).color,bg:getComputedStyle(document.body).backgroundColor})");
      const iframeBg = await ev("getComputedStyle(document.querySelector('iframe[src*=\"preview\"]')).backgroundColor");
      return { ...frameStyles, iframeBg };
    };
    const onedark = await readColors();
    await shot("c7-plain-onedark");

    setSettings({ theme: "One Light" });
    await sleep(2000);
    const onelight = await readColors();
    await shot("c7-plain-onelight");

    setSettings({ theme: "One Dark" });
    await sleep(1500);
    return { onedark, onelight };
  });

  // USER-TEST #25: 인터넷 격리 (network.html 시험)
  await step("c4_network", async () => {
    await click(row("network.html"), true);
    await sleep(1200);
    await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {});
    await sleep(3000);
    const results = await fev("[...document.querySelectorAll('#results tr')].slice(1).map(r=>[...r.children].map(c=>c.textContent.trim()))");
    return { results };
  });

  // USER-TEST #25: 이동 격리 (navigate.html 시험)
  await step("c5_navigate_r1", async () => {
    await click(row("navigate.html"), true);
    await sleep(1200);
    await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {});
    await sleep(3000);

    const startedAt = await fev("document.querySelector('#started')?.textContent");
    await fev("document.querySelector('#ext-link')?.click()");
    await sleep(1000);
    const afterExtClick = await fev("document.querySelector('#started')?.textContent");

    await fev("document.querySelector('#hash-link')?.click()");
    await sleep(1000);
    const scrollY = await fev("window.scrollY");

    return { startedAt, afterExtClick, scrollY };
  });

  // 격리: 앱 객체 접근 차단 (isolation.html)
  await step("c3_isolation", async () => {
    await click(row("isolation.html"), true);
    await sleep(1200);
    await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {});
    await sleep(3000);
    const rows = await fev("[...document.querySelectorAll('#results tr')].slice(1).map(r=>[...r.children].map(c=>c.textContent.trim()))");
    return { rows };
  });
} catch (e) {
  log.fatal = e.stack;
} finally {
  app?.kill();
  const outPath = resolve(OUT, "v3-o7.json");
  writeFileSync(outPath, JSON.stringify(log, null, 2));
  console.log(`[O7] Result written to: ${outPath}`);
}
