# leader probe (ORDER-08 #6): TCP connections of an app with no preview open, for 40 s. Exe = current debug or 0.8.0 release.
param([string]$Exe = "D:\projects\workbench-tauri\src-tauri\target\debug\workbench-tauri.exe", [string]$Tag = "debug", [int]$Rounds = 8)
$root = "$env:TEMP\v081-basetcp-$Tag"
Remove-Item $root -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force "$root\ad\workbench-tauri" | Out-Null
$psi = [System.Diagnostics.ProcessStartInfo]::new($Exe); $psi.UseShellExecute = $false
$psi.Environment["APPDATA"] = "$root\ad"; $psi.Environment["WEBVIEW2_USER_DATA_FOLDER"] = "$root\wv"
$app = [System.Diagnostics.Process]::Start($psi)
$seen = @{}
for ($i = 0; $i -lt $Rounds; $i++) {
  Start-Sleep -Seconds 5
  $all = Get-CimInstance Win32_Process; $set = @($app.Id)
  do { $n = $set.Count; $set = @($set + ($all | ? { $set -contains $_.ParentProcessId } | % { $_.ProcessId }) | select -Unique) } while ($set.Count -ne $n)
  Get-NetTCPConnection -ErrorAction SilentlyContinue | ? { $set -contains $_.OwningProcess -and $_.RemoteAddress -notmatch '^(127\.|::1|0\.0\.0\.0|::$)' } | % {
    $p = $all | ? ProcessId -eq $_.OwningProcess
    $k = "$($_.RemoteAddress):$($_.RemotePort)"
    if (-not $seen[$k]) { $seen[$k] = "t=$(($i+1)*5)s pid=$($_.OwningProcess) $($p.Name) $([regex]::Match([string]$p.CommandLine,'--type=\S+').Value) state=$($_.State)" }
  }
}
"tag=$Tag exe=$Exe external TCP remotes: $($seen.Count)"
$seen.GetEnumerator() | % { "  $($_.Key)  $($_.Value)" }
taskkill /PID $app.Id /T /F | Out-Null
