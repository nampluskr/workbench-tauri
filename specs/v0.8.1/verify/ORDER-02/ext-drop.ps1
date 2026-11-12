#Requires -Version 7
# V3 (ORDER-02 #7): drag files like Windows Explorer onto the app at client point (X,Y) (CSS px) with real input (SendInput).
# Safety: the button goes down only while the helper window is foreground; before release the point must belong to the app
# window (WindowFromPoint root == app HWND), otherwise Esc cancels the drag. Buttons are always released in finally.
param([int]$AppPid, [int]$X, [int]$Y, [string[]]$Paths)
$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices;
public static class XD {
  [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X, Y; }
  [StructLayout(LayoutKind.Sequential)] public struct INPUT { public int type; public MOUSEKEYBDINPUT u; }
  [StructLayout(LayoutKind.Explicit)] public struct MOUSEKEYBDINPUT { [FieldOffset(0)] public MOUSEINPUT mi; [FieldOffset(0)] public KEYBDINPUT ki; }
  [StructLayout(LayoutKind.Sequential)] public struct MOUSEINPUT { public int dx, dy, mouseData, dwFlags, time; public IntPtr extra; }
  [StructLayout(LayoutKind.Sequential)] public struct KEYBDINPUT { public short vk, scan; public int flags, time; public IntPtr extra; public int pad1, pad2; }
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern uint SendInput(uint n, INPUT[] i, int size);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern IntPtr WindowFromPoint(POINT p);
  [DllImport("user32.dll")] public static extern IntPtr GetAncestor(IntPtr h, int flags);
  [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr h, ref POINT p);
  [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr h);
  public static void Mouse(int flags) { var a = new INPUT[1]; a[0].type = 0; a[0].u.mi.dwFlags = flags; SendInput(1, a, Marshal.SizeOf(typeof(INPUT))); }
  public static void Key(short vk, bool up) { var a = new INPUT[1]; a[0].type = 1; a[0].u.ki.vk = vk; a[0].u.ki.flags = up ? 2 : 0; SendInput(1, a, Marshal.SizeOf(typeof(INPUT))); }
}
'@
[void][XD]::SetProcessDPIAware()
$app = (Get-Process -Id $AppPid).MainWindowHandle
if ($app -eq [IntPtr]::Zero) { throw "no window for pid $AppPid" }
$scale = [XD]::GetDpiForWindow($app) / 96.0
$pt = New-Object XD+POINT; $pt.X = [int]($X * $scale); $pt.Y = [int]($Y * $scale); [void][XD]::ClientToScreen($app, [ref]$pt)
$ready = Join-Path $env:TEMP "v081-dragsrc-ready.txt"; Remove-Item $ready -ErrorAction SilentlyContinue
$out = Join-Path $env:TEMP "v081-dragsrc-out.txt"
$argList = @('-NoProfile', '-File', (Join-Path $PSScriptRoot 'drag-src.ps1'), '-ReadyFile', $ready, '-Joined', ('"' + ($Paths -join '|') + '"'))
$helper = Start-Process pwsh -ArgumentList $argList -PassThru -RedirectStandardOutput $out -WindowStyle Hidden
for ($i = 0; $i -lt 100 -and -not (Test-Path $ready); $i++) { Start-Sleep -Milliseconds 100 }
if (-not (Test-Path $ready)) { throw 'helper window did not start' }
$h = (Get-Content $ready).Split(' '); $src = [IntPtr][long]$h[0]; $sx = [int]$h[1] + [int]$h[3] / 2; $sy = [int]$h[2] + [int]$h[4] / 2
$down = $false; $status = 'not-started'
try {
  [void][XD]::SetCursorPos($sx, $sy); Start-Sleep -Milliseconds 200
  # Mouse input goes to the window under the cursor: press only when that is the helper.
  $sp = New-Object XD+POINT; $sp.X = $sx; $sp.Y = $sy
  if ([XD]::GetAncestor([XD]::WindowFromPoint($sp), 2) -ne $src) { throw 'helper is not under the cursor; nothing sent' }
  [XD]::Mouse(2); $down = $true; Start-Sleep -Milliseconds 300   # left down on the helper -> DoDragDrop
  for ($s = 1; $s -le 30; $s++) { [void][XD]::SetCursorPos([int]($sx + ($pt.X - $sx) * $s / 30), [int]($sy + ($pt.Y - $sy) * $s / 30)); Start-Sleep -Milliseconds 30 }
  Start-Sleep -Milliseconds 600
  $root = [XD]::GetAncestor([XD]::WindowFromPoint($pt), 2)
  if ($root -ne $app) { [XD]::Key(0x1B, $false); [XD]::Key(0x1B, $true); $status = "cancelled: point is over $root, not the app $app" }
  else { $status = 'dropped' }
  [XD]::Mouse(4); $down = $false
} finally { if ($down) { [XD]::Mouse(4) } }
$helper.WaitForExit(5000) | Out-Null
[pscustomobject]@{ status = $status; screen = @($pt.X, $pt.Y); helper = (Get-Content $out -ErrorAction SilentlyContinue) -join ' ' } | ConvertTo-Json -Compress
