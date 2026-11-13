// leader probe (ORDER-09): I-17 tree context menu Undo/Redo after Paste, release exe. Judged by menu state and disk.
import { writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const REPO = "D:/projects/workbench-tauri";
const EXE = process.argv[2] || resolve(REPO, "src-tauri/target/release/workbench-tauri.exe");
const S = `${process.env.TEMP.replace(/\\/g, "/")}/v081-probe-i17`, SW = S.replace(/\//g, "\\");
rmSync(S, { recursive: true, force: true });
mkdirSync(`${S}/ws/folder`, { recursive: true });
mkdirSync(`${S}/appdata/workbench-tauri`, { recursive: true });
writeFileSync(`${S}/ws/folder/keep.txt`, "keep\n");
writeFileSync(`${S}/ws/move.txt`, "move\n");
writeFileSync(`${S}/appdata/workbench-tauri/settings.json`, JSON.stringify({ theme: "One Dark" }));
writeFileSync(`${S}/appdata/workbench-tauri/state.json`, JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: `${SW}\\ws`, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }] }));
process.env.APPDATA = `${SW}\\appdata`;
process.env.WEBVIEW2_USER_DATA_FOLDER = `${SW}\\webview`;

const { launchApp } = await import(pathToFileURL(resolve(REPO, "tools/cdp-lib.mjs")).href);
const app = await launchApp(EXE);
const ev = app.evaluate, sleep = app.sleep;
const row = (rel) => `[...document.querySelectorAll('.tree-window .tree-row')].find(e=>e.dataset.path===${JSON.stringify(`${SW}\\ws${rel ? "\\" + rel : ""}`)})`;
const at = (js) => ev(`(()=>{const e=${js};if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x+Math.min(r.width/2,60)),y:Math.round(r.y+r.height/2)}})()`);
const click = async (js, button = "left") => {
  const p = await at(js);
  if (!p) throw new Error("not found " + js);
  for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await app.mouse(type, p.x, p.y, { button, clickCount: 1 });
  await sleep(700);
};
const menu = () => ev(`[...document.querySelectorAll('#context-menu .menu-item')].map(e=>({label:e.firstElementChild?.textContent.trim(),keys:e.querySelector('.menu-shortcut')?.textContent.trim()??null,disabled:e.getAttribute('aria-disabled')==='true'}))`);
const pick = (items) => { const i = items.findIndex((m) => m.label === "Paste"); return { paste: items[i], next: items.slice(i + 1, i + 3) }; };
const esc = async () => { for (const type of ["rawKeyDown", "keyUp"]) await app.send("Input.dispatchKeyEvent", { type, key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 }); await sleep(400); };
const disk = () => ({ inFolder: existsSync(`${S}/ws/folder/move.txt`), atRoot: existsSync(`${S}/ws/move.txt`) });
const out = {};
try {
  await sleep(3000);
  execFileSync("pwsh", ["-NoProfile", "-File", resolve(REPO, "tools/win-input.ps1"), "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" });
  await sleep(500);
  if (!process.env.SKIP_INITIAL) {
  await click(row("move.txt"), "right");
  out.initial = pick(await menu());
  await esc();
  }
  out.menuOpenAfterEsc = await ev(`!!document.querySelector("#context-menu .menu-item")`);
  if (!process.env.NO_FOLDER_CLICK) { await click(row("folder"));
  await sleep(500); }
  // drag move.txt onto folder (mouse moves with the button held, as ORDER-02 measure.mjs)
  const a = await at(row("move.txt")), k = (await at(row("folder\\keep.txt"))) ?? (await at(row("folder"))), b = await at(row("folder"));
  await app.mouse("mouseMoved", a.x, a.y);
  await app.mouse("mousePressed", a.x, a.y, { clickCount: 1 });
  let c = a;
  for (const t of [k, b]) { for (let s = 1; s <= 10; s++) { await app.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: Math.round(c.x + (t.x - c.x) * s / 10), y: Math.round(c.y + (t.y - c.y) * s / 10), button: "left", buttons: 1 }); await sleep(25); } c = t; await sleep(250); }
  await sleep(400);
  out.dropState = await ev(`({under:document.elementFromPoint(${b.x},${b.y})?.closest(".tree-row")?.dataset.path,rows:[...document.querySelectorAll(".tree-row.drop-target")].map(r=>r.dataset.path),root:!!document.querySelector(".tree-scroll.drop-target")})`);
  await app.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: b.x, y: b.y, button: "left", clickCount: 1 });
  await sleep(1500);
  out.afterMove = disk();
  await click(row("folder"), "right");
  out.menuAfterMove = pick(await menu());
  await click(`[...document.querySelectorAll('#context-menu .menu-item')].find(e=>e.firstElementChild?.textContent.trim()==='Undo')`);
  await sleep(1000);
  out.afterUndo = disk();
  await click(row("folder"), "right");
  out.menuAfterUndo = pick(await menu());
  await click(`[...document.querySelectorAll('#context-menu .menu-item')].find(e=>e.firstElementChild?.textContent.trim()==='Redo')`);
  await sleep(1000);
  out.afterRedo = disk();
  await click(row("folder"), "right");
  out.menuAfterRedo = pick(await menu());
  await esc();
} catch (e) { out.error = String(e); }
app.kill();
writeFileSync(resolve(REPO, "specs/v0.8.1/verify/ORDER-09/leader-probe/probe-i17.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out));
