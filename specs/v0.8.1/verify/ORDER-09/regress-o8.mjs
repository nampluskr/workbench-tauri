// v0.8.1 ORDER-09 regression: ORDER-08 (I-14 hang recovery, I-15 WebRTC/links leak block).
// Adapted from specs/v0.8.1/verify/ORDER-08/measure-v3.mjs with output directed to ORDER-09/regress/.
// Usage: node specs/v0.8.1/verify/ORDER-09/regress-o8.mjs [exePath] [stepFilter]

import { writeFileSync, mkdirSync, rmSync, cpSync, readFileSync, appendFileSync, existsSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import dgram from "node:dgram";
import os from "node:os";

const REPO = "D:/projects/workbench-tauri";
const EXE = process.argv[2] && process.argv[2] !== "-"
  ? resolve(process.argv[2])
  : resolve(REPO, process.env.TAURI_EXE || (process.env.USE_DEBUG ? "src-tauri/target/debug/workbench-tauri.exe" : "src-tauri/target/release/workbench-tauri.exe"));

const FILTER = process.argv[3] || null;

const TEMP = (process.env.TEMP || "C:/Users/nampl/AppData/Local/Temp").replace(/\\/g, "/");
const S = `${TEMP}/v081-regress-o8`;
const SW = S.replace(/\//g, "\\");
const OUT = resolve(REPO, "specs/v0.8.1/verify/ORDER-09/regress");
const W = `${S}/o8ws`, WW = `${SW}\\o8ws`;
const DATA = `${S}/appdata8/workbench-tauri`;
const WEBVIEW = `${S}/webview8`;

function getLocalLanIpv4() {
  const nets = os.networkInterfaces();
  const nonInternal = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      const isIpv4 = net.family === "IPv4" || net.family === 4;
      if (!net.internal) {
        nonInternal.push(net.address);
      }
    }
  }
  const lan = nonInternal.find((ip) => /^192\.168\./.test(ip) || /^10\./.test(ip) || /^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip));
  return lan || nonInternal[0] || "127.0.0.1";
}

const LAN_IP = getLocalLanIpv4();

rmSync(W, { recursive: true, force: true });
rmSync(`${S}/appdata8`, { recursive: true, force: true });
rmSync(WEBVIEW, { recursive: true, force: true });
mkdirSync(DATA, { recursive: true });
mkdirSync(W, { recursive: true });
mkdirSync(OUT, { recursive: true });

const o7Fixtures = resolve(REPO, "specs/v0.8.1/verify/ORDER-07/fixtures");
const o8Fixtures = resolve(REPO, "specs/v0.8.1/verify/ORDER-08/fixtures");
cpSync(o7Fixtures, W, { recursive: true });
cpSync(o8Fixtures, W, { recursive: true });
const mockupHtml = "D:/projects/workbench-core/specs/v0.8.1/mockups/outline/index.html";
cpSync(mockupHtml, `${W}/outline-mockup.html`);

for (const name of ["direct", "blank", "srcdoc", "open", "worker", "proto"]) {
  const origPath = resolve(o8Fixtures, `webrtc-${name}.html`);
  if (existsSync(origPath)) {
    const raw = readFileSync(origPath, "utf8");
    const replaced = raw.replace(/stun:stun\.l\.google\.com:19302/g, `stun:${LAN_IP}:3478`);
    writeFileSync(`${W}/webrtc-${name}.html`, replaced);
  }
}
writeFileSync(`${W}/page.html`, "<p id=\"ran\">no</p><script>document.getElementById('ran').textContent='ran'</script>\n");
writeFileSync(`${W}/plain.html`, "<h1>Plain</h1><p>Unstyled text with <a href=\"#x\">a link</a>.</p><p id=\"x\">x</p>\n");

writeFileSync(`${DATA}/settings.json`, JSON.stringify({ theme: "One Dark" }) + "\n");
writeFileSync(`${DATA}/state.json`, JSON.stringify({
  version: 1,
  windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }]
}));

process.env.APPDATA = `${SW}\\appdata8`;
process.env.WEBVIEW2_USER_DATA_FOLDER = `${SW}\\webview8`;

let stunSocket = null;
const stunPackets = [];

function startStunServer() {
  return new Promise((res, rej) => {
    try {
      stunSocket = dgram.createSocket("udp4");
      stunSocket.on("error", (err) => {
        console.warn(`[STUN-WARN] ${err.message}`);
      });
      stunSocket.on("message", (msg, rinfo) => {
        stunPackets.push({
          time: Date.now(),
          address: rinfo.address,
          port: rinfo.port,
          size: msg.length,
          hex: msg.toString("hex").slice(0, 40)
        });
      });
      stunSocket.bind(3478, "0.0.0.0", () => {
        res();
      });
    } catch (e) {
      rej(e);
    }
  });
}

function stopStunServer() {
  if (stunSocket) {
    try { stunSocket.close(); } catch {}
    stunSocket = null;
  }
}

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

const ensureForeground = () => {
  try {
    execFileSync("pwsh", ["-NoProfile", "-File", resolve(REPO, "tools/win-input.ps1"), "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" });
  } catch {}
};

const getForegroundInfo = () => {
  try {
    const cmd = `
      $h = (Add-Type -MemberDefinition '[DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();' -Name "W$([Guid]::NewGuid().ToString('N').Substring(0,8))" -Namespace "U" -PassThru)::GetForegroundWindow()
      $p = Get-Process | Where-Object { $_.MainWindowHandle -eq $h }
      if ($p) {
        [PSCustomObject]@{ pid = $p.Id; name = $p.ProcessName; title = $p.MainWindowTitle; hwnd = ('0x{0:X}' -f [int64]$h) } | ConvertTo-Json -Compress
      } else {
        [PSCustomObject]@{ pid = $null; name = "unknown"; title = ""; hwnd = ('0x{0:X}' -f [int64]$h) } | ConvertTo-Json -Compress
      }
    `;
    const raw = execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", cmd], { encoding: "utf8", windowsHide: true }).trim();
    return JSON.parse(raw);
  } catch (e) {
    return { name: "err", pid: null, error: e.message };
  }
};

const step = async (name, fn) => {
  if (FILTER && !name.includes(FILTER)) return;
  try {
    log[name] = await fn();
  } catch (e) {
    log[name] = "ERR " + e.message;
  }
};

try {
  await startStunServer();
  app = await launchApp(EXE);
  await sleep(6000);
  ensureForeground();
  await sleep(600);

  // I-14: 무한 루프 알림 및 앱 반응성
  await step("c3_c4_hang_and_cpu", async () => {
    ensureForeground();
    await sleep(400);

    await click(row("loop.html"), true);
    await sleep(1000);
    await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {});
    
    ensureForeground();
    await sleep(400);

    const startTime = Date.now();
    let notice = null;
    let noticeDetectedAtSec = null;
    let noticeForeground = null;

    for (let i = 0; i < 20; i++) {
      await sleep(1000);
      if (i % 3 === 0) ensureForeground();
      const n = await ev("[...document.querySelectorAll('p')].find(p=>p.textContent.includes('This HTML page is not responding'))?.textContent || document.querySelector('.preview-hang-notice, .html-preview-hang, .toast')?.textContent || null");
      if (n) {
        notice = n;
        noticeDetectedAtSec = Math.round((Date.now() - startTime) / 100) / 10;
        noticeForeground = getForegroundInfo();
        break;
      }
    }

    ensureForeground();
    await sleep(300);
    const fgAtJudgement = getForegroundInfo();
    const docHasFocus = await ev("document.hasFocus()");
    const visState = await ev("document.visibilityState");

    await shot("c3-hang-notice");
    const appResponsive = (await ev("1+1")) === 2;

    const isForeground = fgAtJudgement?.pid === app.pid || fgAtJudgement?.name?.toLowerCase().includes("workbench");
    const undetermined = !isForeground || !docHasFocus;

    return {
      notice,
      noticeDetectedAtSec,
      noticeForeground,
      appResponsive,
      fgAtJudgement,
      docHasFocus,
      visState,
      isForeground,
      undetermined,
      verdict: undetermined ? "판정 불가" : (notice && appResponsive ? "PASS" : "FAIL")
    };
  });

  // I-14: 루프 후 새 페이지 및 pane 복구
  await step("c2_recovery_and_panes", async () => {
    ensureForeground();
    await sleep(400);

    // 탭 닫기 (이전 loop.html 프레임 및 탭 정리)
    await ev("document.querySelectorAll('.tab-close').forEach(c=>c.click())").catch(() => {});
    await sleep(1500);

    // page.html 열기
    await click(row("page.html"), true);
    await sleep(1000);
    await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {});
    await sleep(2500);

    ensureForeground();
    await sleep(300);
    const frameSrc = await ev("document.querySelector('iframe')?.src||null");
    const fgAtJudgement = getForegroundInfo();
    const docHasFocus = await ev("document.hasFocus()");

    return {
      pageRecovered: frameSrc !== null && /preview/.test(frameSrc),
      frameSrc,
      fgAtJudgement,
      docHasFocus
    };
  });

  // I-14: 보통 페이지 거짓 알림 없음
  await step("c3_no_false_positive", async () => {
    ensureForeground();
    await sleep(400);

    // 5초간 전경 유지하며 관찰
    for (let i = 0; i < 5; i++) {
      await sleep(1000);
      ensureForeground();
    }

    ensureForeground();
    await sleep(300);
    const fgAtJudgement = getForegroundInfo();
    const docHasFocus = await ev("document.hasFocus()");
    const visState = await ev("document.visibilityState");

    const notice = await ev("[...document.querySelectorAll('p')].find(p=>p.textContent.includes('This HTML page is not responding'))?.textContent || document.querySelector('.preview-hang-notice, .html-preview-hang')?.textContent || null");

    const isForeground = fgAtJudgement?.pid === app.pid || fgAtJudgement?.name?.toLowerCase().includes("workbench");
    const undetermined = !isForeground || !docHasFocus;

    return {
      noticeHasFalsePositive: notice !== null,
      notice,
      fgAtJudgement,
      docHasFocus,
      visState,
      isForeground,
      undetermined,
      verdict: undetermined ? "판정 불가" : (!notice ? "PASS" : "FAIL")
    };
  });

  // I-15: 보안 설정 및 WebRTC 누출 차단
  await step("c7_security_settings", async () => {
    const list = stunPackets.slice();
    return { stunPacketsCount: list.length, stunPackets: list };
  });

  // I-7 회귀: 스타일 없는 HTML 테마 반영
  await step("c8_plain_theme_and_tab", async () => {
    await click(row("plain.html"), true);
    await sleep(1200);
    await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {});
    await sleep(2500);
    const frameBg = await ev("(()=>{const f=document.querySelector('iframe');return f?getComputedStyle(f).backgroundColor:null})()");
    return { frameBg };
  });
} catch (e) {
  log.fatal = e.stack;
} finally {
  stopStunServer();
  app?.kill();
  const outPath = resolve(OUT, "v3-o8.json");
  writeFileSync(outPath, JSON.stringify(log, null, 2));
  console.log(`[O8] Result written to: ${outPath}`);
}
