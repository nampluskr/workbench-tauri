#Requires -Version 7
<#
.SYNOPSIS
  OS 수준 입력(SendInput)으로 ZedLike 창을 조작하고 결과를 JSON으로 낸다. Phase 2 검증용(SPEC R-3, R-4, R-6).

.DESCRIPTION
  CDP 합성 입력은 WebView2 가속키 처리와 OS 비클라이언트 처리(스냅 플라이아웃)를 거치지 않을 수 있다.
  그래서 이 도구는 실제 입력(SendInput)을 보낸다. 방식은 D:\projects\workbench-gpui\tools\verify-phase1.ps1
  (같은 사용자의 프로젝트)를 참고했다. 외부 모듈 없이 Add-Type(C# P/Invoke)만 쓴다.
  - 스레드를 PER_MONITOR_AWARE_V2 로 바꿔 모든 좌표를 물리 px 로 다룬다.
  - 좌표 인자(-X, -Y)는 창 클라이언트 영역 기준 논리 px 다(= CSS px, __poc.shell.rects() 의 css 값).
  - 대상 창: -TargetHwnd 또는 -ProcessId 로 고정한다. 주지 않으면 보이는 ZedLike 창이 정확히 하나일 때만 진행하고,
    여럿이면 목록과 함께 오류로 끝낸다. 결과 JSON 의 pid·hwnd 를 capture.ps1 -Hwnd 에 그대로 넘긴다.
  - 입력 전에 창을 전면으로 가져온다(최소화되어 있으면 복원한다). 실패하면 오류로 끝낸다.
    전면으로 가져올 때 다른 키(Alt 등)를 보내지 않는다.
  - 모든 입력(마우스 이동·버튼, 키 누름·뗌)은 하나씩 보내고, 보낼 때마다 직전에 GetForegroundWindow 가
    대상 HWND 인지 확인한다. 아니면 보내지 않고 오류로 끝난다(다른 앱에 입력이 들어가는 사고 방지).
  - 이 도구가 누른 버튼·키는 추적하고, 끝날 때(오류 포함) finally 에서 전경과 무관하게 모두 뗀다.
    뗀 것이 있으면 경고와 결과 JSON 의 releasedOnExit 에 남긴다.
  - 결과 JSON: 동작 전후의 창 사각형(DWM 확장 프레임), 클라이언트 크기, 최대화 여부, DPI, 화면 캡처 경로.

.PARAMETER Action
  hover      : (-X,-Y) 로 마우스를 천천히 옮긴 뒤 -HoldMs 만큼 기다리고 모니터 전체를 -Out 에 캡처한다.
               스냅 레이아웃 플라이아웃은 별도 창이라 화면 복사로 찍는다. 최대화 버튼 위치는 기본값.
  click      : (-X,-Y) 왼쪽 클릭.
  dblclick   : (-X,-Y) 더블클릭 (시스템 더블클릭 시간 안에 두 번).
  drag       : (-X,-Y) 에서 (-X + -DX, -Y + -DY) 까지 끌기. 논리 px.
  resize     : 창 오른쪽 아래 모서리(클라이언트 안쪽 2 물리 px)를 (-DX,-DY) 논리 px 만큼 끌기.
  keys       : -Keys 의 조합을 차례로 누른다. 예: "ctrl+p","f5","alt+left","ctrl+=","win+left".
               숫자패드 +/- 는 numadd / numsub (예: "ctrl+numadd").
               각 조합 사이 -GapMs. 앱이 아닌 OS 단축키(win+…)도 같은 방식으로 보낸다.
  state      : 입력 없이 창 상태만 낸다.
  maxbutton  : 최대화 버튼 중심의 논리 좌표를 낸다(오른쪽에서 두 번째 36x32 칸, L-39).

.PARAMETER Out
  hover 의 화면 캡처 PNG 경로. 다른 동작에서도 주면 동작 뒤 모니터 전체를 캡처한다.

.EXAMPLE
  pwsh -NoProfile -File tools/win-input.ps1 -Action hover -Out specs/v0.1/verify/phase2/snap-flyout.png
  pwsh -NoProfile -File tools/win-input.ps1 -Action dblclick -X 700 -Y 16
  pwsh -NoProfile -File tools/win-input.ps1 -Action keys -Keys "ctrl+p","f5","alt+left"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('hover', 'click', 'dblclick', 'drag', 'resize', 'keys', 'state', 'maxbutton')]
    [string]$Action,
    [double]$X = [double]::NaN,
    [double]$Y = [double]::NaN,
    [double]$DX = 0,
    [double]$DY = 0,
    [string[]]$Keys = @(),
    [int]$HoldMs = 1500,
    [int]$GapMs = 400,
    [string]$Out,
    [string]$ProcessName = 'zedlike',
    # Pin the target: with several ZedLike processes the tool refuses to guess.
    [int]$ProcessId = 0,
    [Alias('Hwnd')][string]$TargetHwnd,
    [string]$Title = 'ZedLike'
)

$ErrorActionPreference = 'Stop'
# pwsh -File passes "a","b" as one string "a,b": split on commas.
$Keys = @($Keys | ForEach-Object { $_ -split ',' } | Where-Object { $_ -ne '' })
Add-Type -AssemblyName System.Drawing.Common
Add-Type -AssemblyName System.Drawing.Primitives

if (-not ('ZlInput.Native' -as [type])) {
    $refs = @('System.Runtime', 'System.Collections', 'System.Runtime.InteropServices',
        'System.Drawing.Common', 'System.Drawing.Primitives', 'System.ComponentModel.Primitives', 'System.Private.Windows.GdiPlus', 'System.Private.Windows.Core', 'System.Threading', 'System.Threading.Thread')
    Add-Type -ReferencedAssemblies $refs -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

namespace ZlInput {
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
    [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X, Y; }
    [StructLayout(LayoutKind.Sequential)] public struct MOUSEINPUT { public int dx, dy; public uint mouseData, dwFlags, time; public IntPtr dwExtraInfo; }
    [StructLayout(LayoutKind.Sequential)] public struct KEYBDINPUT { public ushort wVk, wScan; public uint dwFlags, time; public IntPtr dwExtraInfo; }
    [StructLayout(LayoutKind.Explicit)] public struct INPUTUNION { [FieldOffset(0)] public MOUSEINPUT mi; [FieldOffset(0)] public KEYBDINPUT ki; }
    [StructLayout(LayoutKind.Sequential)] public struct INPUT { public uint type; public INPUTUNION u; }

    public static class Native {
        public static readonly IntPtr PER_MONITOR_AWARE_V2 = new IntPtr(-4);
        const uint INPUT_MOUSE = 0, INPUT_KEYBOARD = 1;
        const uint MOVE = 0x0001, LEFTDOWN = 0x0002, LEFTUP = 0x0004, VIRTUALDESK = 0x4000, ABSOLUTE = 0x8000;
        const uint KEYUP = 0x0002, EXTENDED = 0x0001;

        [DllImport("user32.dll")] public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr ctx);
        [DllImport("user32.dll", SetLastError = true)] static extern uint SendInput(uint n, INPUT[] inputs, int size);
        [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc cb, IntPtr l);
        public delegate bool EnumProc(IntPtr h, IntPtr l);
        [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
        public static uint PidOf(IntPtr h) { uint p; GetWindowThreadProcessId(h, out p); return p; }
        [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
        [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
        [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
        [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr h, ref POINT p);
        [DllImport("user32.dll")] public static extern bool IsZoomed(IntPtr h);
        [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
        [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
        [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr h);
        [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
        [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
        [DllImport("user32.dll")] public static extern uint GetDoubleClickTime();
        [DllImport("user32.dll")] public static extern int GetSystemMetrics(int i);
        [DllImport("user32.dll")] public static extern IntPtr MonitorFromWindow(IntPtr h, uint flags);
        [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern bool GetMonitorInfo(IntPtr m, ref MONITORINFO mi);
        [DllImport("dwmapi.dll")] static extern int DwmGetWindowAttribute(IntPtr h, int attr, out RECT r, int size);

        [StructLayout(LayoutKind.Sequential)] public struct MONITORINFO { public int cbSize; public RECT rcMonitor, rcWork; public uint dwFlags; }

        public static IntPtr FindMain(uint pid, string title) {
            IntPtr found = IntPtr.Zero;
            EnumWindows((h, l) => {
                uint p; GetWindowThreadProcessId(h, out p);
                if (p != pid || !IsWindowVisible(h)) return true;
                var sb = new StringBuilder(256); GetWindowText(h, sb, 256);
                if (sb.ToString() == title) { found = h; return false; }
                return true;
            }, IntPtr.Zero);
            return found;
        }

        public static RECT Frame(IntPtr h) { RECT r; DwmGetWindowAttribute(h, 9 /*EXTENDED_FRAME_BOUNDS*/, out r, Marshal.SizeOf(typeof(RECT))); return r; }
        public static RECT Monitor(IntPtr h) { var mi = new MONITORINFO(); mi.cbSize = Marshal.SizeOf(typeof(MONITORINFO)); GetMonitorInfo(MonitorFromWindow(h, 2), ref mi); return mi.rcMonitor; }

        /// The window that must be in the foreground whenever any mouse or key
        /// event is sent (set from the script after the target is chosen).
        public static IntPtr Target = IntPtr.Zero;

        /// Buttons/keys this tool has pressed and not yet released; ReleaseAll
        /// (called from the script's finally) lets them go even after an error.
        static bool leftDown = false;
        static readonly List<ushort> keysDown = new List<ushort>();

        /// Refuse to send any input (moves, buttons, keys) unless the target is
        /// the foreground window, so input never lands in another application.
        public static void Guard(string what) {
            if (Target == IntPtr.Zero) throw new InvalidOperationException("target window not set");
            IntPtr fg = GetForegroundWindow();
            if (fg != Target)
                throw new InvalidOperationException(String.Format(
                    "not sending {0}: foreground window is 0x{1:X}, target is 0x{2:X}", what, fg.ToInt64(), Target.ToInt64()));
        }

        static void SendMouse(uint flags, int x, int y) {
            Guard(String.Format("mouse event 0x{0:X} at {1},{2}", flags, x, y));
            int vx = GetSystemMetrics(76), vy = GetSystemMetrics(77), vw = GetSystemMetrics(78), vh = GetSystemMetrics(79);
            var input = new INPUT { type = INPUT_MOUSE };
            input.u.mi.dx = (int)Math.Round((x - vx) * 65535.0 / (vw - 1));
            input.u.mi.dy = (int)Math.Round((y - vy) * 65535.0 / (vh - 1));
            input.u.mi.dwFlags = flags | MOVE | ABSOLUTE | VIRTUALDESK;
            if (SendInput(1, new[] { input }, Marshal.SizeOf(typeof(INPUT))) != 1) throw new InvalidOperationException("SendInput(mouse) failed: " + Marshal.GetLastWin32Error());
            if ((flags & LEFTDOWN) != 0) leftDown = true;
            if ((flags & LEFTUP) != 0) leftDown = false;
        }

        /// Release every button/key this tool still holds, without the
        /// foreground check (a stuck button or modifier is worse than a stray
        /// key-up). Called from the script's finally.
        public static string ReleaseAll() {
            var released = new List<string>();
            var size = Marshal.SizeOf(typeof(INPUT));
            if (leftDown) {
                var up = new INPUT { type = INPUT_MOUSE };
                up.u.mi.dwFlags = LEFTUP;
                SendInput(1, new[] { up }, size);
                leftDown = false;
                released.Add("mouse-left");
            }
            for (int i = keysDown.Count - 1; i >= 0; i--) {
                SendInput(1, new[] { Key(keysDown[i], true) }, size);
                released.Add(String.Format("vk 0x{0:X2}", keysDown[i]));
            }
            keysDown.Clear();
            return String.Join(",", released);
        }
        public static void MoveTo(int x, int y) { SendMouse(0, x, y); }
        public static void Glide(int x0, int y0, int x1, int y1, int steps, int stepMs) {
            for (int i = 1; i <= steps; i++) { MoveTo(x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps); Thread.Sleep(stepMs); }
        }
        public static void Click(int x, int y) { MoveTo(x, y); Thread.Sleep(30); SendMouse(LEFTDOWN, x, y); Thread.Sleep(30); SendMouse(LEFTUP, x, y); }
        public static void DoubleClick(int x, int y) { Click(x, y); Thread.Sleep((int)Math.Min(80, GetDoubleClickTime() / 4)); Click(x, y); }
        public static void Drag(int x0, int y0, int x1, int y1, int steps, int stepMs) {
            MoveTo(x0, y0); Thread.Sleep(50); SendMouse(LEFTDOWN, x0, y0); Thread.Sleep(80);
            Glide(x0, y0, x1, y1, steps, stepMs); Thread.Sleep(80); SendMouse(LEFTUP, x1, y1);
        }

        static ushort Vk(string k) {
            switch (k) {
                case "ctrl": return 0x11; case "alt": return 0x12; case "shift": return 0x10; case "win": return 0x5B;
                case "tab": return 0x09; case "esc": case "escape": return 0x1B; case "enter": return 0x0D; case "space": return 0x20;
                case "left": return 0x25; case "up": return 0x26; case "right": return 0x27; case "down": return 0x28;
                case "=": case "plus": return 0xBB; case "-": case "minus": return 0xBD;
                case "numadd": return 0x6B; case "numsub": return 0x6D;
            }
            if (k.Length == 1 && char.IsLetterOrDigit(k[0])) return (ushort)char.ToUpperInvariant(k[0]);
            if (k.StartsWith("f") && int.TryParse(k.Substring(1), out int n) && n >= 1 && n <= 24) return (ushort)(0x70 + n - 1);
            throw new ArgumentException("unknown key: " + k);
        }
        static bool IsExtended(ushort vk) { return vk >= 0x21 && vk <= 0x2E || vk == 0x5B; }
        [DllImport("user32.dll")] static extern uint MapVirtualKey(uint code, uint mapType);
        /// Fill the scan code too, like a real keyboard: Chromium derives
        /// KeyboardEvent.code from it (a VK-only event gets an empty code).
        static INPUT Key(ushort vk, bool up) {
            var i = new INPUT { type = INPUT_KEYBOARD };
            i.u.ki.wVk = vk;
            i.u.ki.wScan = (ushort)MapVirtualKey(vk, 0 /*MAPVK_VK_TO_VSC*/);
            i.u.ki.dwFlags = (up ? KEYUP : 0) | (IsExtended(vk) ? EXTENDED : 0);
            return i;
        }
        /// "ctrl+shift+p": press modifiers, the key, release in reverse order.
        public static void Combo(string combo) {
            var parts = combo.ToLowerInvariant().Split('+');
            // "ctrl++" -> last part empty: the plus key
            var keys = new List<ushort>();
            for (int i = 0; i < parts.Length; i++) {
                if (parts[i] == "" ) { if (i == parts.Length - 1) keys.Add(Vk("=")); continue; }
                keys.Add(Vk(parts[i]));
            }
            // One event at a time, each after a foreground check; presses are
            // tracked so ReleaseAll can undo them if a check fails midway.
            foreach (var k in keys) SendKey(k, false, combo);
            for (int i = keys.Count - 1; i >= 0; i--) SendKey(keys[i], true, combo);
        }

        static void SendKey(ushort vk, bool up, string combo) {
            Guard(String.Format("key 0x{0:X2} {1} ({2})", vk, up ? "up" : "down", combo));
            if (SendInput(1, new[] { Key(vk, up) }, Marshal.SizeOf(typeof(INPUT))) != 1)
                throw new InvalidOperationException("SendInput(key) failed: " + Marshal.GetLastWin32Error());
            if (up) keysDown.Remove(vk); else keysDown.Add(vk);
        }
        /// Bring the target to the front without sending any input (an Alt tap
        /// would go to whatever other application is in front).
        public static bool Foreground(IntPtr h) {
            if (IsIconic(h)) { ShowWindow(h, 9 /*SW_RESTORE*/); Thread.Sleep(300); }
            if (GetForegroundWindow() == h) return true;
            SetForegroundWindow(h);
            Thread.Sleep(150);
            return GetForegroundWindow() == h;
        }
        public static void SaveScreen(RECT r, string path) {
            using (var bmp = new Bitmap(r.Right - r.Left, r.Bottom - r.Top, PixelFormat.Format32bppArgb))
            using (var g = Graphics.FromImage(bmp)) {
                g.CopyFromScreen(r.Left, r.Top, 0, 0, bmp.Size);
                bmp.Save(path, ImageFormat.Png);
            }
        }
    }
}
'@
}

[void][ZlInput.Native]::SetThreadDpiAwarenessContext([ZlInput.Native]::PER_MONITOR_AWARE_V2)

# Target selection (review P2-1 #8): input, CDP and capture must hit the same
# window. Explicit -TargetHwnd or -ProcessId wins; otherwise exactly one
# visible "$Title" window of a "$ProcessName" process must exist.
if ($TargetHwnd) {
    $hwnd = [IntPtr][int64]($TargetHwnd.StartsWith('0x') ? [Convert]::ToInt64($TargetHwnd.Substring(2), 16) : [int64]$TargetHwnd)
    $targetPid = [ZlInput.Native]::PidOf($hwnd)
    if ($targetPid -eq 0) { throw "window $TargetHwnd not found" }
} else {
    $procs = if ($ProcessId) { @(Get-Process -Id $ProcessId -ErrorAction SilentlyContinue) } else { @(Get-Process -Name $ProcessName -ErrorAction SilentlyContinue) }
    $found = @()
    foreach ($p in $procs) {
        $h = [ZlInput.Native]::FindMain([uint32]$p.Id, $Title)
        if ($h -ne [IntPtr]::Zero) { $found += [pscustomobject]@{ Pid = $p.Id; Hwnd = $h } }
    }
    if ($found.Count -eq 0) { throw "no visible '$Title' window of process '$ProcessName'$(if ($ProcessId) { " (pid $ProcessId)" })" }
    if ($found.Count -gt 1) {
        $list = ($found | ForEach-Object { "pid $($_.Pid) hwnd 0x{0:X}" -f [int64]$_.Hwnd }) -join ', '
        throw "several '$Title' windows ($list): pass -ProcessId or -TargetHwnd"
    }
    $hwnd = $found[0].Hwnd
    $targetPid = $found[0].Pid
}

function Get-State {
    $f = [ZlInput.Native]::Frame($hwnd)
    $c = New-Object ZlInput.RECT
    [void][ZlInput.Native]::GetClientRect($hwnd, [ref]$c)
    $o = New-Object ZlInput.POINT
    [void][ZlInput.Native]::ClientToScreen($hwnd, [ref]$o)
    [ordered]@{
        frame       = [ordered]@{ x = $f.Left; y = $f.Top; width = $f.Right - $f.Left; height = $f.Bottom - $f.Top }
        clientOrigin = [ordered]@{ x = $o.X; y = $o.Y }
        clientSize  = [ordered]@{ width = $c.Right; height = $c.Bottom }
        maximized   = [ZlInput.Native]::IsZoomed($hwnd)
        minimized   = [ZlInput.Native]::IsIconic($hwnd)
        dpi         = [ZlInput.Native]::GetDpiForWindow($hwnd)
        foreground  = ([ZlInput.Native]::GetForegroundWindow() -eq $hwnd)
    }
}

# Client logical px -> screen physical px.
function To-Screen([double]$lx, [double]$ly) {
    $s = Get-State
    $scale = $s.dpi / 96.0
    return @([int][math]::Round($s.clientOrigin.x + $lx * $scale), [int][math]::Round($s.clientOrigin.y + $ly * $scale))
}

function Get-MaxButtonCenter {
    $s = Get-State
    $scale = $s.dpi / 96.0
    $wLogical = $s.clientSize.width / $scale
    # L-39: buttons are 36x32; maximize is second from the right.
    return @(($wLogical - 36 - 18), 16)
}

[ZlInput.Native]::Target = $hwnd
$before = Get-State
$result = [ordered]@{ action = $Action; pid = $targetPid; hwnd = ('0x{0:X}' -f [int64]$hwnd); before = $before }

if ($Action -ne 'state' -and $Action -ne 'maxbutton') {
    if (-not [ZlInput.Native]::Foreground($hwnd)) {
        throw 'could not bring the ZedLike window to the foreground (no input was sent). Click the ZedLike window once, then retry.'
    }
}

$released = ''
try {
switch ($Action) {
    'maxbutton' {
        $c = Get-MaxButtonCenter
        $result.maxButtonCenterLogical = [ordered]@{ x = $c[0]; y = $c[1] }
    }
    'hover' {
        if ([double]::IsNaN($X)) { $c = Get-MaxButtonCenter; $X = $c[0]; $Y = $c[1] }
        $start = To-Screen ($X - 200) ($Y + 200)
        $end = To-Screen $X $Y
        [ZlInput.Native]::MoveTo($start[0], $start[1])
        Start-Sleep -Milliseconds 200
        [ZlInput.Native]::Glide($start[0], $start[1], $end[0], $end[1], 20, 15)
        Start-Sleep -Milliseconds $HoldMs
        $result.pointerScreen = [ordered]@{ x = $end[0]; y = $end[1] }
    }
    'click' { $p = To-Screen $X $Y; [ZlInput.Native]::Click($p[0], $p[1]); $result.pointerScreen = [ordered]@{ x = $p[0]; y = $p[1] } }
    'dblclick' { $p = To-Screen $X $Y; [ZlInput.Native]::DoubleClick($p[0], $p[1]); $result.pointerScreen = [ordered]@{ x = $p[0]; y = $p[1] } }
    'drag' {
        $p0 = To-Screen $X $Y
        $p1 = To-Screen ($X + $DX) ($Y + $DY)
        [ZlInput.Native]::Drag($p0[0], $p0[1], $p1[0], $p1[1], 25, 15)
        $result.from = [ordered]@{ x = $p0[0]; y = $p0[1] }; $result.to = [ordered]@{ x = $p1[0]; y = $p1[1] }
    }
    'resize' {
        $s = Get-State
        $x0 = $s.clientOrigin.x + $s.clientSize.width - 2
        $y0 = $s.clientOrigin.y + $s.clientSize.height - 2
        $scale = $s.dpi / 96.0
        $x1 = [int][math]::Round($x0 + $DX * $scale); $y1 = [int][math]::Round($y0 + $DY * $scale)
        [ZlInput.Native]::Drag($x0, $y0, $x1, $y1, 25, 15)
        $result.from = [ordered]@{ x = $x0; y = $y0 }; $result.to = [ordered]@{ x = $x1; y = $y1 }
    }
    'keys' {
        $sent = @()
        foreach ($k in $Keys) {
            [ZlInput.Native]::Combo($k)
            $sent += $k
            Start-Sleep -Milliseconds $GapMs
        }
        $result.sent = $sent
    }
}
} finally {
    # Release anything still pressed, regardless of the foreground window.
    $released = [ZlInput.Native]::ReleaseAll()
    if ($released) { Write-Warning "released stuck input: $released" }
}
if ($released) { $result.releasedOnExit = $released }

Start-Sleep -Milliseconds 300
$result.after = Get-State
if ($Out) {
    $dir = Split-Path -Parent ([System.IO.Path]::GetFullPath($Out))
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
    $mon = [ZlInput.Native]::Monitor($hwnd)
    [ZlInput.Native]::SaveScreen($mon, [System.IO.Path]::GetFullPath($Out))
    $result.screenshot = [ordered]@{ path = [System.IO.Path]::GetFullPath($Out); monitor = [ordered]@{ x = $mon.Left; y = $mon.Top; width = $mon.Right - $mon.Left; height = $mon.Bottom - $mon.Top } }
}
$result | ConvertTo-Json -Depth 6
