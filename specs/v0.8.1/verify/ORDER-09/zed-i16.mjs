// v0.8.1 ORDER-09: Zed I-16 Project Panel Tree Capture & Side-by-Side Comparison Script
// Captures Zed project panel under identical conditions (1440x852, identical workspace)
// and produces 4 step-by-step side-by-side comparison images with Tauri's matching theme captures.
//
// Rules:
// 1. Never touches existing user Zed windows (e.g. PID 18548). Only operates on the newly launched window.
// 2. Closes ONLY the newly launched window at the end via WM_CLOSE.
// 3. Verifies foreground window before every input action (tools/win-input.ps1).
// 4. Does not alter user's Zed settings file (settings.json). Dynamically detects user's active theme.
// 5. Handles "Unrecognized Project — Restricted Mode" dialog by choosing "Stay in Restricted Mode"
//    (Ctrl-Alt-Shift-S / button click) without altering user trust settings.

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, cpSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { decodePng, encodePng } from "../../../../tools/png.mjs";

const REPO = "D:/projects/workbench-tauri";
const OUT_DIR = resolve(REPO, "specs/v0.8.1/verify/ORDER-09/new");
const FIXTURES_DIR = resolve(REPO, "specs/v0.8.1/verify/ORDER-09/new/fixtures");
const TEMP_WS = resolve(process.env.TEMP || "C:/Users/nampl/AppData/Local/Temp", "v081-zed-i16-ws");
const ZED_EXE = "C:\\Users\\nampl\\AppData\\Local\\Programs\\Zed\\bin\\Zed.exe";
const WIN_INPUT = resolve(REPO, "tools/win-input.ps1");

mkdirSync(OUT_DIR, { recursive: true });

/** List all visible Zed windows with HWND, PID, and title */
function listZedWindows() {
  const cmd = `
    $pids = @(Get-Process Zed -ErrorAction SilentlyContinue | ForEach-Object Id)
    if ($pids.Count -eq 0) { return "[]" }
    Add-Type -TypeDefinition @'
    using System; using System.Text; using System.Collections.Generic; using System.Runtime.InteropServices;
    public static class ZEnumW {
      public delegate bool EnumProc(IntPtr h, IntPtr l);
      [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc f, IntPtr l);
      [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
      [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
      [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
      public static List<object> Get(uint[] pids) {
        var list = new List<object>();
        var set = new HashSet<uint>(pids);
        EnumWindows((h, l) => {
          uint pid; GetWindowThreadProcessId(h, out pid);
          if (set.Contains(pid) && IsWindowVisible(h)) {
            var sb = new StringBuilder(512); GetWindowText(h, sb, 512);
            if (sb.Length > 0) list.Add(new { hwnd = ("0x" + h.ToInt64().ToString("X")), pid = (int)pid, title = sb.ToString() });
          }
          return true;
        }, IntPtr.Zero);
        return list;
      }
    }
'@
    $list = [ZEnumW]::Get([uint32[]]$pids)
    $list | ConvertTo-Json -Compress
  `;
  try {
    const raw = execFileSync("pwsh", ["-NoProfile", "-Command", cmd], { encoding: "utf8" }).trim();
    if (!raw || raw === "[]") return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

/** Position and resize window to 1440x852 */
function setWindowPos(hwndHex, x = 100, y = 60, w = 1440, h = 852) {
  const cmd = `
    Add-Type -TypeDefinition @'
    using System; using System.Runtime.InteropServices;
    public static class ZPos {
      [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr a, int x, int y, int cx, int cy, uint f);
    }
'@
    $h = [IntPtr][Convert]::ToInt64("${hwndHex}", 16)
    [void][ZPos]::SetWindowPos($h, [IntPtr]::Zero, ${x}, ${y}, ${w}, ${h}, 0x0014)
  `;
  execFileSync("pwsh", ["-NoProfile", "-Command", cmd], { encoding: "utf8" });
}

/** Bring specific window to foreground using win-input.ps1 */
function ensureForeground(hwndHex) {
  try {
    execFileSync("pwsh", ["-NoProfile", "-File", WIN_INPUT, "-Action", "foreground", "-TargetHwnd", hwndHex], { encoding: "utf8" });
  } catch (e) {
    console.warn(`[WARN] ensureForeground failed: ${e.message}`);
  }
}

/** Capture window client area to a PNG file using GDI CopyFromScreen */
function captureClientArea(hwndHex, outPath) {
  const cmd = `
    Add-Type -AssemblyName System.Drawing
    Add-Type -TypeDefinition @'
    using System; using System.Runtime.InteropServices;
    public static class ZCap {
      [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
      [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X, Y; }
      [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
      [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
      [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr h, ref POINT p);
    }
'@
    [void][ZCap]::SetProcessDPIAware()
    $h = [IntPtr][Convert]::ToInt64("${hwndHex}", 16)
    $cr = New-Object ZCap+RECT; [void][ZCap]::GetClientRect($h, [ref]$cr)
    $o = New-Object ZCap+POINT; [void][ZCap]::ClientToScreen($h, [ref]$o)
    $w = $cr.R - $cr.L; $ht = $cr.B - $cr.T
    $bmp = New-Object System.Drawing.Bitmap $w, $ht
    $g = [System.Drawing.Graphics]::FromImage($bmp); $g.CopyFromScreen($o.X, $o.Y, 0, 0, $bmp.Size); $g.Dispose()
    $bmp.Save("${outPath.replace(/\\/g, "/")}", [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
  `;
  execFileSync("pwsh", ["-NoProfile", "-Command", cmd], { encoding: "utf8" });
}

/** Send click via win-input.ps1 after foreground guard */
function zedClick(hwndHex, x, y, o = {}) {
  ensureForeground(hwndHex);
  const args = ["-NoProfile", "-File", WIN_INPUT, "-Action", o.dbl ? "dblclick" : "click", "-X", String(x), "-Y", String(y), "-TargetHwnd", hwndHex];
  if (o.ctrl) args.push("-Mods", "ctrl");
  execFileSync("pwsh", args, { encoding: "utf8" });
}

/** Send key via win-input.ps1 after foreground guard */
function zedKey(hwndHex, k) {
  ensureForeground(hwndHex);
  execFileSync("pwsh", ["-NoProfile", "-File", WIN_INPUT, "-Action", "keys", "-Keys", k, "-TargetHwnd", hwndHex], { encoding: "utf8" });
}

/** Close target window safely via WM_CLOSE (PostMessage) */
function closeTargetWindow(hwndHex, pid, isNewProcess) {
  console.log(`[ZED-CLEANUP] Closing target window ${hwndHex} (PID: ${pid}, isNewProcess: ${isNewProcess})`);
  try {
    const cmd = `
      Add-Type -TypeDefinition @'
      using System; using System.Runtime.InteropServices;
      public static class ZClose {
        [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, uint m, IntPtr w, IntPtr l);
      }
'@
      $h = [IntPtr][Convert]::ToInt64("${hwndHex}", 16)
      [void][ZClose]::PostMessage($h, 0x0010, [IntPtr]::Zero, [IntPtr]::Zero)
    `;
    execFileSync("pwsh", ["-NoProfile", "-Command", cmd], { encoding: "utf8" });
  } catch {}

  // If a brand new process was spawned and didn't close gracefully, terminate it
  if (isNewProcess) {
    try {
      execFileSync("powershell", ["-NoProfile", "-Command", `
        Start-Sleep -Milliseconds 1500
        $p = Get-Process -Id ${pid} -ErrorAction SilentlyContinue
        if ($p) { Stop-Process -Id ${pid} -Force -ErrorAction SilentlyContinue }
      `], { encoding: "utf8" });
    } catch {}
  }
}

/** Get pixel RGB at (x, y) */
function getPixel(img, x, y) {
  if (x < 0 || x >= img.w || y < 0 || y >= img.h) return [0, 0, 0];
  const idx = (y * img.w + x) * 4;
  return [img.data[idx], img.data[idx + 1], img.data[idx + 2]];
}

/** Crop rectangular area from image */
function crop(img, x, y, w, h) {
  const clampedW = Math.max(0, Math.min(w, img.w - x));
  const clampedH = Math.max(0, Math.min(h, img.h - y));
  const out = Buffer.alloc(clampedW * clampedH * 4);

  for (let row = 0; row < clampedH; row++) {
    const srcY = y + row;
    if (srcY < 0 || srcY >= img.h) continue;
    const srcIdx = (srcY * img.w + x) * 4;
    const dstIdx = row * clampedW * 4;
    img.data.copy(out, dstIdx, srcIdx, srcIdx + clampedW * 4);
  }
  return { w: clampedW, h: clampedH, data: out };
}

/** Combine two images side-by-side with separator */
function combineSideBySide(leftImg, rightImg, separatorWidth = 17, separatorRgb = [93, 120, 153]) {
  const h = Math.min(leftImg.h, rightImg.h);
  const totalW = leftImg.w + separatorWidth + rightImg.w;
  const out = Buffer.alloc(totalW * h * 4);

  for (let row = 0; row < h; row++) {
    const leftOffset = row * totalW * 4;
    leftImg.data.copy(out, leftOffset, row * leftImg.w * 4, (row + 1) * leftImg.w * 4);

    for (let s = 0; s < separatorWidth; s++) {
      const sepIdx = leftOffset + leftImg.w * 4 + s * 4;
      out[sepIdx] = separatorRgb[0];
      out[sepIdx + 1] = separatorRgb[1];
      out[sepIdx + 2] = separatorRgb[2];
      out[sepIdx + 3] = 255;
    }

    const rightOffset = leftOffset + (leftImg.w + separatorWidth) * 4;
    rightImg.data.copy(out, rightOffset, row * rightImg.w * 4, (row + 1) * rightImg.w * 4);
  }

  return { w: totalW, h, data: out };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Handle "Unrecognized Project — Restricted Mode" dialog if present.
 * Uses "Stay in Restricted Mode" (Ctrl-Alt-Shift-S / button click).
 * Never touches "Trust and Continue" or "Trust all projects in" (preserves user trust configuration).
 */
async function handleRestrictedModeDialog(hwndHex) {
  const beforeShot = resolve(OUT_DIR, "zed-dialog-before.png");
  captureClientArea(hwndHex, beforeShot);
  console.log(`[ZED-DIALOG] Captured pre-check screenshot: ${beforeShot}`);

  let dialogDetected = false;
  try {
    const buf = readFileSync(beforeShot);
    const img = decodePng(buf);
    // Modal card in Zed spans x: ~393..1030, y: ~81..352
    const centerCardPixel = getPixel(img, 700, 150);
    // In light theme, the dialog card background is high brightness (> 235, 235, 235)
    // while the scrim dims the rest of the window.
    dialogDetected = centerCardPixel[0] >= 230 && centerCardPixel[1] >= 230 && centerCardPixel[2] >= 230;
    console.log(`[ZED-DIALOG] Modal check: pixel at (700, 150) = [${centerCardPixel.join(", ")}], dialogDetected = ${dialogDetected}`);
  } catch (e) {
    console.warn(`[WARN] Pre-check decode failed: ${e.message}`);
  }

  // Always attempt dismissal using "Stay in Restricted Mode" (Ctrl-Alt-Shift-S)
  console.log("[ZED-DIALOG] Sending shortcut: Ctrl-Alt-Shift-S (Stay in Restricted Mode)...");
  zedKey(hwndHex, "ctrl+alt+shift+s");
  await sleep(1000);

  let afterShot = resolve(OUT_DIR, "zed-dialog-after.png");
  captureClientArea(hwndHex, afterShot);
  console.log(`[ZED-DIALOG] Captured post-dismissal screenshot: ${afterShot}`);

  // Secondary check: if modal card is still visible, try direct button click at (490, 338)
  try {
    const afterBuf = readFileSync(afterShot);
    const afterImg = decodePng(afterBuf);
    const panelPix = getPixel(afterImg, 120, 200);
    // If scrim is still present, panel pixel is dimmer than normal panel background
    if (panelPix[0] < 220 && dialogDetected) {
      console.log("[ZED-DIALOG] Scrim still detected after shortcut, attempting click on 'Stay in Restricted Mode' button (490, 338)...");
      zedClick(hwndHex, 490, 338);
      await sleep(1000);
      captureClientArea(hwndHex, afterShot);
      console.log(`[ZED-DIALOG] Captured updated post-click screenshot: ${afterShot}`);
    }
  } catch {}

  return {
    detected: dialogDetected,
    action: "Stay in Restricted Mode",
    shortcut: "Ctrl-Alt-Shift-S",
    fallbackClick: { x: 490, y: 338 },
    beforeShot,
    afterShot
  };
}

/**
 * Estimate Zed active theme by sampling project panel background pixel.
 */
function estimateZedTheme(hwndHex) {
  const probeShot = resolve(OUT_DIR, "zed-i16-theme-probe.png");
  captureClientArea(hwndHex, probeShot);

  try {
    const buf = readFileSync(probeShot);
    const img = decodePng(buf);
    // Sample panel background at (120, 200) inside project panel (x: 0~240, y: 33~800)
    const rgb = getPixel(img, 120, 200);
    const lum = Math.round(0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]);
    const isLight = lum > 128;
    const themeTag = isLight ? "OneLight" : "OneDark";
    const themeDisplay = isLight ? "One Light" : "One Dark";

    console.log(`[ZED-THEME] Sampled panel pixel at (120, 200): [${rgb.join(", ")}], luminance: ${lum} -> Theme: ${themeDisplay}`);
    return {
      themeDisplay,
      themeTag,
      pixel: rgb,
      luminance: lum,
      isLight
    };
  } catch (e) {
    console.warn(`[WARN] Theme estimation failed, defaulting to One Light: ${e.message}`);
    return {
      themeDisplay: "One Light",
      themeTag: "OneLight",
      pixel: [235, 235, 236],
      luminance: 235,
      isLight: true
    };
  }
}

async function main() {
  console.log("==================================================================");
  console.log(" v0.8.1 ORDER-09: Zed I-16 Project Panel Capture & Side-by-Side");
  console.log("==================================================================");

  // 1. Record existing Zed windows (must never touch these)
  const beforeWindows = listZedWindows();
  const beforeHwnds = new Set(beforeWindows.map((w) => w.hwnd));
  const beforePids = new Set(beforeWindows.map((w) => w.pid));
  console.log(`[ZED-INIT] Found ${beforeWindows.length} existing Zed window(s): ${beforeWindows.map((w) => `${w.title} (${w.hwnd})`).join(", ") || "none"}`);

  // 2. Prepare identical workspace fixtures in temp folder
  console.log(`[ZED-INIT] Setting up fixture workspace at: ${TEMP_WS}`);
  rmSync(TEMP_WS, { recursive: true, force: true });
  mkdirSync(TEMP_WS, { recursive: true });
  if (existsSync(FIXTURES_DIR)) {
    cpSync(FIXTURES_DIR, TEMP_WS, { recursive: true });
  }
  mkdirSync(resolve(TEMP_WS, "folder/sub"), { recursive: true });
  writeFileSync(resolve(TEMP_WS, "folder/keep.txt"), "keep this file\n");
  writeFileSync(resolve(TEMP_WS, "folder/sub/child.txt"), "child file\n");
  writeFileSync(resolve(TEMP_WS, "move.txt"), "file to move for I-17\n");
  writeFileSync(resolve(TEMP_WS, "root-file.txt"), "root level text file\n");

  let targetHwnd = null;
  let targetPid = null;
  let isNewProcess = false;
  const outLog = {
    date: new Date().toISOString(),
    beforeWindows,
    restrictedDialog: null,
    themeEstimation: null,
    steps: {},
    sideBySide: {}
  };

  try {
    // 3. Launch new Zed window
    console.log(`[ZED-LAUNCH] Spawning Zed on temp workspace: ${TEMP_WS}`);
    spawn(ZED_EXE, ["-n", TEMP_WS], { detached: true, stdio: "ignore" });

    // 4. Poll for the newly created window (up to 30 seconds)
    console.log("[ZED-LAUNCH] Waiting for new window to appear...");
    for (let i = 0; i < 60; i++) {
      await sleep(500);
      const current = listZedWindows();
      const newlyAppeared = current.filter((w) => !beforeHwnds.has(w.hwnd));
      if (newlyAppeared.length > 0) {
        const matching = newlyAppeared.find((w) => w.title.includes("v081-zed-i16-ws")) || newlyAppeared[0];
        targetHwnd = matching.hwnd;
        targetPid = matching.pid;
        isNewProcess = !beforePids.has(targetPid);
        break;
      }
    }

    if (!targetHwnd) {
      throw new Error("New Zed window did not appear within 30 seconds.");
    }

    console.log(`[ZED-TARGET] Acquired target window: HWND ${targetHwnd}, PID ${targetPid} (isNewProcess: ${isNewProcess})`);
    await sleep(2500);

    // 5. Size window to 1440x852 and position at (100, 60)
    console.log("[ZED-LAYOUT] Setting window size to 1440x852...");
    setWindowPos(targetHwnd, 100, 60, 1440, 852);
    await sleep(800);
    ensureForeground(targetHwnd);
    await sleep(600);

    // 6. Handle "Unrecognized Project — Restricted Mode" dialog
    console.log("[ZED-DIALOG] Checking and handling Restricted Mode dialog...");
    outLog.restrictedDialog = await handleRestrictedModeDialog(targetHwnd);
    await sleep(800);

    // 7. Estimate active Zed theme from panel background pixel
    const themeInfo = estimateZedTheme(targetHwnd);
    outLog.themeEstimation = themeInfo;
    const themeTag = themeInfo.themeTag; // "OneLight" or "OneDark"

    // 8. Execute 4 test states on Zed project panel:
    // State 1: Folder clicked (plain folder click)
    console.log("[ZED-ACTION] Step 1: Plain folder click...");
    zedClick(targetHwnd, 80, 70);
    await sleep(800);
    const zedShot1 = resolve(OUT_DIR, "zed-i16-1-folder.png");
    captureClientArea(targetHwnd, zedShot1);
    console.log(`[ZED-SHOT] Captured: ${zedShot1}`);
    outLog.steps["1-folder"] = zedShot1;

    // State 2: Down arrow key cursor movement
    console.log("[ZED-ACTION] Step 2: Down arrow cursor movement...");
    zedKey(targetHwnd, "down");
    await sleep(800);
    const zedShot2 = resolve(OUT_DIR, "zed-i16-2-cursor-down.png");
    captureClientArea(targetHwnd, zedShot2);
    console.log(`[ZED-SHOT] Captured: ${zedShot2}`);
    outLog.steps["2-cursor-down"] = zedShot2;

    // State 3: Ctrl+click multiple selection on root-file.txt
    console.log("[ZED-ACTION] Step 3: Ctrl+click multiple selection...");
    zedClick(targetHwnd, 80, 140, { ctrl: true });
    await sleep(800);
    const zedShot3 = resolve(OUT_DIR, "zed-i16-3-ctrl-click.png");
    captureClientArea(targetHwnd, zedShot3);
    console.log(`[ZED-SHOT] Captured: ${zedShot3}`);
    outLog.steps["3-ctrl-click"] = zedShot3;

    // State 4: Double click to open active file, then click editor outside tree
    console.log("[ZED-ACTION] Step 4: Open file & focus editor outside tree...");
    zedClick(targetHwnd, 80, 140, { dbl: true });
    await sleep(1500);
    zedClick(targetHwnd, 400, 300); // click editor content area outside tree
    await sleep(800);
    const zedShot4 = resolve(OUT_DIR, "zed-i16-4-active-outside.png");
    captureClientArea(targetHwnd, zedShot4);
    console.log(`[ZED-SHOT] Captured: ${zedShot4}`);
    outLog.steps["4-active-outside"] = zedShot4;

    // 9. Compose 4 side-by-side comparison images
    console.log(`[ZED-COMPOSER] Composing side-by-side comparison images (theme: ${themeInfo.themeDisplay})...`);

    // Determine crop rectangles:
    // Zed project panel: x: 0, y: 33, w: 240, h: 767
    // Tauri project panel: x: 200, y: 33, w: 240, h: 767 (from .project-panel rect in Tauri)
    let tauriCropX = 200;
    let tauriCropY = 33;
    let tauriCropW = 240;
    let tauriCropH = 767;

    const v3NewJsonPath = resolve(OUT_DIR, "v3-new.json");
    if (existsSync(v3NewJsonPath)) {
      try {
        const v3Data = JSON.parse(readFileSync(v3NewJsonPath, "utf8"));
        const pr = v3Data.step_i16_tree_selection?.[themeTag === "OneLight" ? "oneLight" : "oneDark"]?.projectPanelRect
          || v3Data.step_i16_tree_selection?.projectPanelRect;
        if (pr && typeof pr.x === "number" && typeof pr.w === "number") {
          tauriCropX = pr.x;
          tauriCropY = pr.y;
          tauriCropW = pr.w;
          tauriCropH = pr.h;
          console.log(`[ZED-COMPOSER] Using measured Tauri projectPanelRect: x=${tauriCropX}, y=${tauriCropY}, w=${tauriCropW}, h=${tauriCropH}`);
        }
      } catch {}
    }

    const comparisonSteps = [
      {
        key: "1-folder",
        desc: "폴더 맨 클릭 (단일 선택)",
        tauriCandidates: [
          resolve(OUT_DIR, `i16-tauri-${themeTag}-1-folder.png`),
          resolve(OUT_DIR, `i16-tree-${themeTag.toLowerCase()}.png`)
        ],
        zedPath: zedShot1,
        outPath: resolve(OUT_DIR, "i16-side-1-folder.png")
      },
      {
        key: "2-cursor-down",
        desc: "↓ 방향키 커서 행 이동",
        tauriCandidates: [
          resolve(OUT_DIR, `i16-tauri-${themeTag}-2-cursor-down.png`),
          resolve(OUT_DIR, `i16-tree-${themeTag.toLowerCase()}.png`)
        ],
        zedPath: zedShot2,
        outPath: resolve(OUT_DIR, "i16-side-2-cursor-down.png")
      },
      {
        key: "3-ctrl-click",
        desc: "Ctrl+클릭 다중 선택",
        tauriCandidates: [
          resolve(OUT_DIR, `i16-tauri-${themeTag}-3-ctrl-click.png`),
          resolve(OUT_DIR, `i16-tree-${themeTag.toLowerCase()}.png`)
        ],
        zedPath: zedShot3,
        outPath: resolve(OUT_DIR, "i16-side-3-ctrl-click.png")
      },
      {
        key: "4-active-outside",
        desc: "파일 열기 및 에디터 포커스 (트리 밖)",
        tauriCandidates: [
          resolve(OUT_DIR, `i16-tauri-${themeTag}-4-active-outside.png`),
          resolve(OUT_DIR, `i16-tree-${themeTag.toLowerCase()}.png`)
        ],
        zedPath: zedShot4,
        outPath: resolve(OUT_DIR, "i16-side-4-active-outside.png")
      }
    ];

    for (const step of comparisonSteps) {
      const tauriPath = step.tauriCandidates.find((p) => existsSync(p));
      if (!tauriPath || !existsSync(step.zedPath)) {
        console.warn(`[WARN] Missing source images for step ${step.key}: tauriPath=${tauriPath}, zedExists=${existsSync(step.zedPath)}`);
        continue;
      }

      const tauriBuf = readFileSync(tauriPath);
      const zedBuf = readFileSync(step.zedPath);
      const tauriImg = decodePng(tauriBuf);
      const zedImg = decodePng(zedBuf);

      // Clamp cropping dimensions to avoid out-of-bounds
      const cropW = 240;
      const cropH = Math.min(tauriCropH, 767, zedImg.h - 33, tauriImg.h - tauriCropY);

      const tauriCrop = crop(tauriImg, tauriCropX, tauriCropY, cropW, cropH);
      const zedCrop = crop(zedImg, 0, 33, cropW, cropH);

      const combined = combineSideBySide(tauriCrop, zedCrop, 17, [93, 120, 153]);
      const combinedPng = encodePng(combined);

      writeFileSync(step.outPath, combinedPng);
      console.log(`[ZED-COMPOSER] Saved side-by-side [${step.key}]: ${step.outPath} (${combined.w}x${combined.h})`);

      outLog.sideBySide[step.key] = {
        desc: step.desc,
        outPath: step.outPath,
        tauriSource: tauriPath,
        zedSource: step.zedPath,
        dimensions: { w: combined.w, h: combined.h }
      };
    }

    // Also write master side-by-side image: i16-side-${themeTag}.png
    const masterSidePath = resolve(OUT_DIR, `i16-side-${themeTag}.png`);
    const preferredMaster = outLog.sideBySide["4-active-outside"]?.outPath || outLog.sideBySide["1-folder"]?.outPath;
    if (preferredMaster && existsSync(preferredMaster)) {
      copyFileSync(preferredMaster, masterSidePath);
      console.log(`[ZED-COMPOSER] Master side-by-side saved: ${masterSidePath}`);
      outLog.sideBySide.master = masterSidePath;
    }

  } catch (e) {
    console.error(`[ERROR] zed-i16 execution failed: ${e.message}`);
    outLog.error = e.message;
  } finally {
    // 10. Safely close ONLY target window
    if (targetHwnd) {
      closeTargetWindow(targetHwnd, targetPid, isNewProcess);
    }
    const jsonOut = resolve(OUT_DIR, "zed-i16.json");
    writeFileSync(jsonOut, JSON.stringify(outLog, null, 2));
    console.log(`[ZED-DONE] Results logged in: ${jsonOut}`);
  }
}

if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("zed-i16.mjs")) {
  await main();
}
