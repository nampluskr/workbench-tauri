#Requires -Version 7
<#
.SYNOPSIS
  Phase 3 V3 (M-4): screen-capture the app window from the moment it appears, to see whether an unthemed frame is ever shown.
.DESCRIPTION
  Prints READY, waits for a new workbench-tauri process, then copies the screen under its window every ~15 ms for -Seconds.
  A frame is saved as PNG only when its 6x4 pixel signature differs from the previous frame (max 40 files).
  Reads the screen only: no input is sent, the window is not touched. The app is started and stopped by the caller.
  Last stdout line: JSON { pid, frames, saved: [ { t_ms, file, rect, visible, sample } ], firstWindowMs }.
  t_ms is milliseconds since the process start time.
#>
param([string]$OutDir, [int]$Seconds = 6, [string]$ProcessName = 'workbench-tauri')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices;
public static class Cap {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
}
'@
[void][Cap]::SetProcessDPIAware()
New-Item -ItemType Directory -Force $OutDir | Out-Null
if (Get-Process $ProcessName -ErrorAction SilentlyContinue) { throw "$ProcessName is already running; close it first" }
Write-Output 'READY'
$p = $null
while (-not $p) { $p = Get-Process $ProcessName -ErrorAction SilentlyContinue | Select-Object -First 1; Start-Sleep -Milliseconds 2 }
$start = $p.StartTime
$deadline = [DateTime]::Now.AddSeconds($Seconds)
$frames = 0; $saved = @(); $prev = ''; $firstWindow = $null
while ([DateTime]::Now -lt $deadline) {
  $p.Refresh()
  $h = $p.MainWindowHandle
  if ($h -eq [IntPtr]::Zero) { continue }
  $r = New-Object Cap+RECT
  if (-not [Cap]::GetWindowRect($h, [ref]$r)) { continue }
  $w = $r.Right - $r.Left; $ht = $r.Bottom - $r.Top
  if ($w -le 0 -or $ht -le 0 -or $r.Left -lt -10000) { continue }
  $t = [int]([DateTime]::Now - $start).TotalMilliseconds
  if ($null -eq $firstWindow) { $firstWindow = $t }
  $bmp = New-Object System.Drawing.Bitmap $w, $ht
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CopyFromScreen($r.Left, $r.Top, 0, 0, $bmp.Size)
  $g.Dispose()
  $frames++
  $sample = foreach ($j in 0..3) { foreach ($i in 0..5) { $c = $bmp.GetPixel([int](($i + 0.5) * $w / 6), [int](($j + 0.5) * $ht / 4)); '#{0:x2}{1:x2}{2:x2}' -f $c.R, $c.G, $c.B } }
  $sig = "$w x $ht " + ($sample -join ',')
  if ($sig -ne $prev -and $saved.Count -lt 40) {
    $file = Join-Path $OutDir ('frame-{0:d2}-{1}ms.png' -f $saved.Count, $t)
    $bmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
    $saved += [pscustomobject]@{ t_ms = $t; file = $file; rect = @($r.Left, $r.Top, $w, $ht); visible = [Cap]::IsWindowVisible($h); sample = @($sample) }
    $prev = $sig
  }
  $bmp.Dispose()
}
[pscustomobject]@{ pid = $p.Id; frames = $frames; firstWindowMs = $firstWindow; saved = $saved } | ConvertTo-Json -Depth 5 -Compress
