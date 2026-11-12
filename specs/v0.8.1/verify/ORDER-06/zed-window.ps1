#Requires -Version 7
# ORDER-06 V3: work on ONE Zed window that this session opened (found by its title, e.g. "spacing.md — spacing.md").
# Actions: prep (size 1440x852, foreground, ctrl+shift+v), capture (client area to PNG), close (WM_CLOSE to that window only).
# Refuses when the title does not match exactly one window, so the user's own Zed windows are never touched.
param([ValidateSet('prep', 'capture', 'close', 'list')][string]$Action, [string]$TitleLike, [string]$Out, [int]$WaitMs = 3500)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition @'
using System; using System.Text; using System.Collections.Generic; using System.Runtime.InteropServices;
public static class ZW2 {
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X, Y; }
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc f, IntPtr l);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr a, int x, int y, int cx, int cy, uint f);
  [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr h, ref POINT p);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, uint m, IntPtr w, IntPtr l);
  public static List<KeyValuePair<IntPtr,string>> Windows(uint pid) {
    var list = new List<KeyValuePair<IntPtr,string>>();
    EnumWindows((h, l) => { uint p; GetWindowThreadProcessId(h, out p); if (p == pid && IsWindowVisible(h)) { var sb = new StringBuilder(512); GetWindowText(h, sb, 512); if (sb.Length > 0) list.Add(new KeyValuePair<IntPtr,string>(h, sb.ToString())); } return true; }, IntPtr.Zero);
    return list;
  }
}
'@
[void][ZW2]::SetProcessDPIAware()
$zedPids = @(Get-Process Zed -ErrorAction SilentlyContinue | ForEach-Object Id)
$all = foreach ($p in $zedPids) { [ZW2]::Windows([uint32]$p) | ForEach-Object { [pscustomobject]@{ pid = $p; hwnd = $_.Key; title = $_.Value } } }
if ($Action -eq 'list') { $all | ForEach-Object { [pscustomobject]@{ pid = $_.pid; hwnd = ('0x{0:X}' -f $_.hwnd.ToInt64()); title = $_.title } } | ConvertTo-Json -Compress; return }
$match = @($all | Where-Object { $_.title -like $TitleLike })
if ($match.Count -ne 1) { throw "expected exactly one Zed window like '$TitleLike', found $($match.Count): $(($all | ForEach-Object title) -join ' | ')" }
$h = $match[0].hwnd; $hex = '0x{0:X}' -f $h.ToInt64()
$tool = 'D:\projects\workbench-tauri\tools\win-input.ps1'
switch ($Action) {
  'prep' {
    [void][ZW2]::SetWindowPos($h, [IntPtr]::Zero, 100, 60, 1440, 852, 0x0014); Start-Sleep -Milliseconds 800
    pwsh -NoProfile -File $tool -Action foreground -TargetHwnd $hex -ProcessName Zed -Title $match[0].title | Out-Null; Start-Sleep -Milliseconds 500
    $k = pwsh -NoProfile -File $tool -Action keys -Keys 'ctrl+shift+v' -TargetHwnd $hex -ProcessName Zed -Title $match[0].title 2>&1 | Out-String
    Start-Sleep -Milliseconds $WaitMs
    [pscustomobject]@{ hwnd = $hex; title = $match[0].title; keys = ($k -split "`n" | Select-Object -First 3) -join ' ' } | ConvertTo-Json -Compress
  }
  'capture' {
    $cr = New-Object ZW2+RECT; [void][ZW2]::GetClientRect($h, [ref]$cr)
    $o = New-Object ZW2+POINT; [void][ZW2]::ClientToScreen($h, [ref]$o)
    $w = $cr.R - $cr.L; $ht = $cr.B - $cr.T
    $bmp = New-Object System.Drawing.Bitmap $w, $ht
    $g = [System.Drawing.Graphics]::FromImage($bmp); $g.CopyFromScreen($o.X, $o.Y, 0, 0, $bmp.Size); $g.Dispose()
    $bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
    [pscustomobject]@{ hwnd = $hex; title = $match[0].title; client = @($w, $ht); out = $Out } | ConvertTo-Json -Compress
  }
  'close' { [void][ZW2]::PostMessage($h, 0x0010, [IntPtr]::Zero, [IntPtr]::Zero); Start-Sleep -Milliseconds 1500; [pscustomobject]@{ closed = $hex; title = $match[0].title; remaining = @(foreach ($p in $zedPids) { [ZW2]::Windows([uint32]$p) | ForEach-Object Value }) } | ConvertTo-Json -Compress }
}
