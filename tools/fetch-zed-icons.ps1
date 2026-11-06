#Requires -Version 7.0
$ErrorActionPreference = 'Stop'
$commit = '4304dec732a75505066de5ce2dbbfb2bec369498'
$destination = Join-Path $PSScriptRoot '../src/assets/zed-icons'
$temporary = Join-Path ([IO.Path]::GetTempPath()) ('workbench-zed-icons-' + [guid]::NewGuid())

function Invoke-Git {
    & git @args
    if ($LASTEXITCODE -ne 0) { throw "git failed: $args" }
}

try {
    New-Item -ItemType Directory -Path $temporary | Out-Null
    Invoke-Git -C $temporary init --quiet
    Invoke-Git -C $temporary remote add origin https://github.com/zed-industries/zed.git
    Invoke-Git -C $temporary config core.autocrlf false
    Invoke-Git -C $temporary sparse-checkout init --no-cone
    Invoke-Git -C $temporary sparse-checkout set --no-cone /assets/icons/ /LICENSE-GPL /LICENSE-APACHE
    Invoke-Git -C $temporary fetch --filter=blob:none --depth=1 origin $commit
    Invoke-Git -C $temporary checkout --quiet --detach FETCH_HEAD
    if ((& git -C $temporary rev-parse HEAD) -ne $commit) { throw 'Unexpected Zed commit' }

    $icons = Join-Path $temporary 'assets/icons'
    $uiCount = @(Get-ChildItem -LiteralPath $icons -Filter '*.svg' -File).Count
    $fileCount = @(Get-ChildItem -LiteralPath (Join-Path $icons 'file_icons') -Filter '*.svg' -File).Count
    if ($uiCount -ne 299 -or $fileCount -ne 96) { throw "Unexpected icon counts: UI=$uiCount file_icons=$fileCount" }
    foreach ($license in @('assets/icons/LICENSES', 'LICENSE-GPL', 'LICENSE-APACHE')) {
        if (!(Test-Path -LiteralPath (Join-Path $temporary $license))) { throw "Missing license: $license" }
    }

    New-Item -ItemType Directory -Path $destination -Force | Out-Null
    Copy-Item -Path (Join-Path $icons '*') -Destination $destination -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $temporary 'LICENSE-GPL'), (Join-Path $temporary 'LICENSE-APACHE') -Destination $destination -Force
    Write-Output "Zed $commit : UI svg=$uiCount; file_icons svg=$fileCount"
    Write-Output "Destination: $([IO.Path]::GetFullPath($destination))"
}
finally {
    # Only remove the uniquely named temporary checkout created by this invocation.
    $resolved = [IO.Path]::GetFullPath($temporary)
    $tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
    if (!$resolved.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase)) { throw 'Temporary path is outside TEMP' }
    if (Test-Path -LiteralPath $resolved) { Remove-Item -LiteralPath $resolved -Recurse -Force }
}
