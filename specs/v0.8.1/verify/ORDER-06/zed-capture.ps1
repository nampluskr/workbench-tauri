#Requires -Version 7
# ORDER-06 V3: open a markdown file in a separate Zed instance (own --user-data-dir, the user's settings are only read),
# size its window to 1440x852, open the markdown preview (ctrl+shift+v) and capture the window. The user's Zed processes
# are never touched: only a process that did not exist before this script is closed at the end.
param([string]$File, [string]$Out, [string]$DataDir, [int]$PreviewWaitMs = 4000, [switch]$KeepOpen)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices;
public static class ZW {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr a, int x, int y, int cx, int cy, uint f);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr h, ref POINT p);
  [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X, Y; }
}
'@
[void][ZW]::SetProcessDPIAware()
$zed = 'C:\Users\nampl\AppData\Local\Programs\Zed\bin\zed.exe'
$before = @(Get-Process Zed -ErrorAction SilentlyContinue | ForEach-Object Id)
New-Item -ItemType Directory -Force $DataDir | Out-Null
Start-Process -FilePath $zed -ArgumentList @('--user-data-dir', $DataDir, '-n', $File) -WindowStyle Hidden | Out-Null
$proc = $null
for ($i = 0; $i -lt 100 -and -not $proc; $i++) {
  Start-Sleep -Milliseconds 300
  $proc = Get-Process Zed -ErrorAction SilentlyContinue | Where-Object { $before -notcontains $_.Id -and $_.MainWindowHandle -ne [IntPtr]::Zero } | Select-Object -First 1
}
if (-not $proc) { throw "no new Zed window process appeared (the CLI may have used the user's running instance); nothing was captured or closed" }
$h = $proc.MainWindowHandle
Start-Sleep -Milliseconds 2500
[void][ZW]::SetWindowPos($h, [IntPtr]::Zero, 100, 60, 1440, 852, 0x0014)
Start-Sleep -Milliseconds 800
$hex = '0x{0:X}' -f $h.ToInt64()
$fg = pwsh -NoProfile -File (Join-Path 'D:\projects\workbench-tauri\tools' 'win-input.ps1') -Action foreground -TargetHwnd $hex 2>&1 | Out-String
Start-Sleep -Milliseconds 500
$keys = pwsh -NoProfile -File (Join-Path 'D:\projects\workbench-tauri\tools' 'win-input.ps1') -Action keys -Keys 'ctrl+shift+v' -TargetHwnd $hex 2>&1 | Out-String
Start-Sleep -Milliseconds $PreviewWaitMs
$cr = New-Object ZW+RECT; [void][ZW]::GetClientRect($h, [ref]$cr)
$o = New-Object ZW+POINT; [void][ZW]::ClientToScreen($h, [ref]$o)
$w = $cr.R - $cr.L; $ht = $cr.B - $cr.T
$bmp = New-Object System.Drawing.Bitmap $w, $ht
$g = [System.Drawing.Graphics]::FromImage($bmp); $g.CopyFromScreen($o.X, $o.Y, 0, 0, $bmp.Size); $g.Dispose()
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
$result = [pscustomobject]@{ pid = $proc.Id; userPids = $before; client = @($w, $ht); origin = @($o.X, $o.Y); out = $Out; keysOk = ($keys -match '"action"') }
if (-not $KeepOpen) {
  # only processes started after this script began (this instance and its helpers); the user's PIDs are kept
  $mine = @(Get-Process Zed -ErrorAction SilentlyContinue | Where-Object { $before -notcontains $_.Id } | ForEach-Object Id)
  $mine | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
  $result | Add-Member closed $mine
  $result | Add-Member userPidsAfter @(Get-Process Zed -ErrorAction SilentlyContinue | ForEach-Object Id)
}
$result | ConvertTo-Json -Compress
