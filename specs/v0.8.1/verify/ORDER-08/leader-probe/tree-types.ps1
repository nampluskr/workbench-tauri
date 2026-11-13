param([int]$RootPid)
$all = Get-CimInstance Win32_Process
$set = @($RootPid)
do { $n = $set.Count; $set = @($set + ($all | Where-Object { $set -contains $_.ParentProcessId } | ForEach-Object { $_.ProcessId }) | Select-Object -Unique) } while ($set.Count -ne $n)
$all | Where-Object { $set -contains $_.ProcessId } | ForEach-Object { "$($_.ProcessId) $([regex]::Match([string]$_.CommandLine, '--type=\S+').Value) $([regex]::Match([string]$_.CommandLine, '--utility-sub-type=\S+').Value)" }
