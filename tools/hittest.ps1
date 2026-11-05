#Requires -Version 7
<#
.SYNOPSIS
  Read-only WM_NCHITTEST query against the top-level window of -ProcessId (M-4-R1). No input is sent; the window is not touched.
.DESCRIPTION
  Points are client logical px (CSS px). Output JSON: for each point the screen px asked and the HT* code the window answered
  (1 HTCLIENT, 2 HTCAPTION, 9 HTMAXBUTTON). Also visibility and the client size used for the button positions (L-39: 36x32 buttons).
#>
param([Parameter(Mandatory)][int]$ProcessId)
$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices;
public static class Ht {
  [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X, Y; }
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr h, ref POINT p);
  [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll", SetLastError = true)] public static extern IntPtr SendMessageTimeout(IntPtr h, uint msg, IntPtr w, IntPtr l, uint flags, uint timeout, out IntPtr result);
}
'@
[void][Ht]::SetProcessDPIAware()
$p = Get-Process -Id $ProcessId
$h = $p.MainWindowHandle
if ($h -eq [IntPtr]::Zero) { throw "process $ProcessId has no visible main window" }
$c = New-Object Ht+RECT; [void][Ht]::GetClientRect($h, [ref]$c)
$o = New-Object Ht+POINT; [void][Ht]::ClientToScreen($h, [ref]$o)
$scale = [Ht]::GetDpiForWindow($h) / 96.0
$w = $c.Right / $scale
$points = [ordered]@{
  'minimize (center)'       = @(($w - 90), 16)
  'maximize (center)'       = @(($w - 54), 16)
  'maximize (left edge+1)'  = @(($w - 72 + 1), 16)
  'maximize (right edge-1)' = @(($w - 36 - 1), 16)
  'close (center)'          = @(($w - 18), 16)
  'title bar'               = @(700, 16)
  'editor'                  = @(700, 400)
}
$rows = foreach ($k in $points.Keys) {
  $sx = [int][math]::Round($o.X + $points[$k][0] * $scale)
  $sy = [int][math]::Round($o.Y + $points[$k][1] * $scale)
  $r = [IntPtr]::Zero
  $lp = [IntPtr](($sy -shl 16) -bor ($sx -band 0xFFFF))
  $ok = [Ht]::SendMessageTimeout($h, 0x84, [IntPtr]::Zero, $lp, 2, 2000, [ref]$r) # WM_NCHITTEST, SMTO_ABORTIFHUNG
  [pscustomobject]@{ point = $k; logical = @($points[$k]); screen = @($sx, $sy); answered = ($ok -ne [IntPtr]::Zero); code = [int]$r }
}
[pscustomobject]@{ pid = $ProcessId; visible = [Ht]::IsWindowVisible($h); dpi = [Ht]::GetDpiForWindow($h); clientPx = @($c.Right, $c.Bottom); rows = @($rows) } | ConvertTo-Json -Depth 4 -Compress
