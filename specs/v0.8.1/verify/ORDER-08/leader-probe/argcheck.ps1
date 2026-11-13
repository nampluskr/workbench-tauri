# leader probe (ORDER-08 K-08d): does the WebView2 browser process get --force-webrtc-ip-handling-policy?
# Mode "plain": app as shipped (no env). Mode "cdp": like tools/cdp-lib.mjs (WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222).
param([string]$Mode = "plain")
$exe = "D:\projects\workbench-tauri\src-tauri\target\debug\workbench-tauri.exe"
$root = "$env:TEMP\v081-argcheck-$Mode"
Remove-Item $root -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force "$root\ad\workbench-tauri" | Out-Null
$psi = [System.Diagnostics.ProcessStartInfo]::new($exe)
$psi.UseShellExecute = $false
$psi.Environment["APPDATA"] = "$root\ad"
$psi.Environment["WEBVIEW2_USER_DATA_FOLDER"] = "$root\wv"
if ($Mode -eq "cdp") { $psi.Environment["WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS"] = "--remote-debugging-port=9222" }
$app = [System.Diagnostics.Process]::Start($psi)
Start-Sleep -Seconds 6
$all = Get-CimInstance Win32_Process
$set = @($app.Id)
do { $n = $set.Count; $set = @($set + ($all | Where-Object { $set -contains $_.ParentProcessId } | ForEach-Object { $_.ProcessId }) | Select-Object -Unique) } while ($set.Count -ne $n)
$browser = $all | Where-Object { $set -contains $_.ProcessId -and $_.Name -eq "msedgewebview2.exe" -and ([string]$_.CommandLine) -notmatch "--type=" }
foreach ($b in $browser) {
  $cl = [string]$b.CommandLine
  "mode=$Mode pid=$($b.ProcessId) webrtcPolicy=$($cl -match 'force-webrtc-ip-handling-policy=disable_non_proxied_udp') debugPort=$($cl -match 'remote-debugging-port') disableFeatures=$($cl -match 'msSmartScreenProtection')"
}
$types = $all | Where-Object { $set -contains $_.ProcessId } | ForEach-Object { "$($_.ProcessId) $([regex]::Match([string]$_.CommandLine, '--type=\S+').Value) $([regex]::Match([string]$_.CommandLine, '--utility-sub-type=\S+').Value)" }
$types
taskkill /PID $app.Id /T /F | Out-Null
