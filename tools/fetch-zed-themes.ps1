#Requires -Version 7.0
$ErrorActionPreference = 'Stop'
$temporary = Join-Path ([IO.Path]::GetTempPath()) ('workbench-zed-themes-' + [guid]::NewGuid())
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$zedCommit = '4304dec732a75505066de5ce2dbbfb2bec369498'

function Invoke-Git {
    & git @args
    if ($LASTEXITCODE -ne 0) { throw "git failed: $args" }
}

function Get-Checkout($name, $repository, $ref, $commit, [string[]] $paths) {
    $checkout = Join-Path $temporary $name
    New-Item -ItemType Directory -Path $checkout | Out-Null
    Invoke-Git -C $checkout init --quiet
    Invoke-Git -C $checkout remote add origin "https://github.com/$repository.git"
    Invoke-Git -C $checkout config core.autocrlf false
    Invoke-Git -C $checkout sparse-checkout set --no-cone @paths
    Invoke-Git -C $checkout fetch --filter=blob:none --depth=1 origin $ref
    Invoke-Git -C $checkout checkout --quiet --detach FETCH_HEAD
    if ((& git -C $checkout rev-parse HEAD) -cne $commit) { throw "Unexpected commit: $repository" }
    Write-Host "$repository $ref : $commit"
    return $checkout
}

function Copy-Files($source, $destination, [string[]] $paths) {
    foreach ($path in $paths) {
        $file = Join-Path $source $path
        if (!(Test-Path -LiteralPath $file -PathType Leaf) -or (Get-Item -LiteralPath $file).Length -eq 0) {
            throw "Missing or empty asset: $file"
        }
        $target = Join-Path $destination $path
        New-Item -ItemType Directory -Path (Split-Path $target) -Force | Out-Null
        Copy-Item -LiteralPath $file -Destination $target -Force
    }
}

function Get-Themes($source, $folder, $expected) {
    $files = @(Get-ChildItem -LiteralPath (Join-Path $source $folder) -Filter '*.json' -File)
    $names = @()
    foreach ($file in $files) {
        $family = Get-Content -Raw -LiteralPath $file.FullName | ConvertFrom-Json -AsHashtable
        $names += @($family.themes | ForEach-Object { $_.name })
    }
    if ($names.Count -ne $expected -or @($names | Where-Object { !$_ }).Count -gt 0 -or
        @($names | Sort-Object -Unique).Count -ne $expected) { throw "Unexpected themes in $folder : $($names.Count)" }
    Write-Host "$folder : $($names.Count) themes"
    foreach ($name in $names) { Write-Host "  $name" }
    return @($files | ForEach-Object { "$folder/$($_.Name)" })
}

function Get-StringTable($source, $name, $expected, [switch] $Associations) {
    # Extract only string tuples from the pinned Rust constants; never copy Rust code.
    $block = [regex]::Match($source, "(?ms)^const $name\b[^=]*= &\[(.*?)^\];")
    if (!$block.Success) { throw "Missing string table: $name" }
    $body = $block.Groups[1].Value
    $pattern = if ($Associations) { '(?s)\(\s*"([^"]+)",\s*&\[(.*?)\],?\s*\)' } else { '\("([^"]+)",\s*"([^"]+)"\)' }
    if (([regex]::Replace($body, $pattern, '') -replace '[\s,]', '') -ne '') { throw "Unexpected table syntax: $name" }
    $table = [System.Collections.Specialized.OrderedDictionary]::new([StringComparer]::Ordinal)
    foreach ($entry in [regex]::Matches($body, $pattern)) {
        if ($Associations) {
            foreach ($value in [regex]::Matches($entry.Groups[2].Value, '"([^"]+)"')) {
                $table.Add($value.Groups[1].Value, $entry.Groups[1].Value)
            }
        } else { $table.Add($entry.Groups[1].Value, $entry.Groups[2].Value) }
    }
    if ($table.Count -ne $expected) { throw "Unexpected $name count: $($table.Count), expected $expected" }
    $line = 1 + [regex]::Matches($source.Substring(0, $block.Index), '\n').Count
    $endLine = $line + [regex]::Matches($block.Value, '\n').Count
    Write-Host "crates/theme/src/icon_theme.rs:$line-$endLine $name=$($table.Count)"
    return ,$table
}

try {
    New-Item -ItemType Directory -Path $temporary | Out-Null
    $zed = Get-Checkout 'zed' 'zed-industries/zed' $zedCommit $zedCommit @('/assets/themes/', '/crates/theme/src/icon_theme.rs')
    $themeDestination = Join-Path $root 'src/theme/assets/zed'
    Get-Themes $zed 'assets/themes/ayu' 3 | Out-Null
    Get-Themes $zed 'assets/themes/gruvbox' 6 | Out-Null
    Copy-Files (Join-Path $zed 'assets/themes') $themeDestination @('ayu/ayu.json', 'gruvbox/gruvbox.json', 'LICENSES')
    Write-Host "License: $themeDestination/LICENSES"

    foreach ($extension in @(
        @{ Name = 'catppuccin'; Repository = 'catppuccin/zed'; Version = '0.2.27'; Commit = '83fe57ba356a3b4dc4ac78b8d98d8ae95e093e45'; Folder = 'themes'; Count = 8; Destination = 'src/theme/assets/catppuccin' },
        @{ Name = 'macos-classic'; Repository = 'huacnlee/zed-theme-macos-classic'; Version = '0.4.0'; Commit = '22266e11c4b8962be2e259011251b4016ff00552'; Folder = 'themes'; Count = 2; Destination = 'src/theme/assets/macos-classic' },
        @{ Name = 'catppuccin-icons'; Repository = 'catppuccin/zed-icons'; Version = '1.24.0'; Commit = 'fe864c992c5da1e417e5897b741b7de9b90830e0'; Folder = 'icon_themes'; Count = 8; Destination = 'src/assets/icon-themes/catppuccin-icons' }
    )) {
        $checkout = Get-Checkout $extension.Name $extension.Repository "refs/tags/v$($extension.Version)" $extension.Commit @("/$($extension.Folder)/", '/extension.toml', '/LICENSE')
        $manifest = Get-Content -Raw -LiteralPath (Join-Path $checkout 'extension.toml')
        $version = [regex]::Match($manifest, '(?m)^version\s*=\s*"([^"]+)"\s*$').Groups[1].Value
        if ($version -cne $extension.Version) { throw "Unexpected $($extension.Name) version: $version" }
        $files = @(Get-Themes $checkout $extension.Folder $extension.Count)
        if ($extension.Folder -eq 'icon_themes') {
            $icons = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
            foreach ($file in $files) {
                $json = Get-Content -Raw -LiteralPath (Join-Path $checkout $file)
                # Paths in icon themes are relative to the extension root, including named folders and chevrons.
                foreach ($match in [regex]::Matches($json, '"(?:path|collapsed|expanded)"\s*:\s*("(?:[^"\\]|\\.)*")')) {
                    $path = ConvertFrom-Json $match.Groups[1].Value
                    if ($path -cnotmatch '^(?:\./)?icons/[a-zA-Z0-9_/-]+\.svg$' -or $path.Split('/') -contains '..') {
                        throw "Unsafe icon path: $path"
                    }
                    [void] $icons.Add(($path -replace '^\./', ''))
                }
            }
            if ($icons.Count -eq 0) { throw 'No Catppuccin icons found' }
            Invoke-Git -C $checkout sparse-checkout add /icons/
            $files += @($icons | Sort-Object)
            Write-Host "Referenced Catppuccin icon files: $($icons.Count)"
        }
        $destination = Join-Path $root $extension.Destination
        Copy-Files $checkout $destination ($files + @('extension.toml', 'LICENSE'))
        Write-Host "License: $destination/LICENSE"
    }

    $source = Get-Content -Raw -LiteralPath (Join-Path $zed 'crates/theme/src/icon_theme.rs')
    $stems = Get-StringTable $source 'FILE_STEMS_BY_ICON_KEY' 5 -Associations
    $suffixes = Get-StringTable $source 'FILE_SUFFIXES_BY_ICON_KEY' 293 -Associations
    $definitions = Get-StringTable $source 'FILE_ICONS' 92
    $fileIcons = [ordered]@{}
    foreach ($key in $definitions.Keys) {
        $path = $definitions[$key]
        if ($path -cnotmatch '^icons/file_icons/[a-z0-9_]+\.svg$') { throw "Unexpected Zed icon path: $path" }
        $fileIcons[$key] = @{ path = $path -replace '^icons/', '../../zed-icons/' }
    }
    $directories = [regex]::Match($source, '(?s)directory_icons: DirectoryIcons\s*\{\s*collapsed: Some\("([^"]+)"\.into\(\)\),\s*expanded: Some\("([^"]+)"\.into\(\)\),\s*\}')
    if (!$directories.Success -or $directories.Groups[1].Value -cne 'icons/file_icons/folder.svg' -or
        $directories.Groups[2].Value -cne 'icons/file_icons/folder_open.svg') { throw 'Unexpected Zed directory icons' }
    $directoryLine = 1 + [regex]::Matches($source.Substring(0, $directories.Index), '\n').Count
    Write-Host "crates/theme/src/icon_theme.rs:$directoryLine directory_icons=2"
    $theme = [ordered]@{
        name = 'Zed (Default)'
        appearance = 'dark'
        file_stems = $stems
        file_suffixes = $suffixes
        file_icons = $fileIcons
        directory_icons = @{
            collapsed = $directories.Groups[1].Value -replace '^icons/', '../../zed-icons/'
            expanded = $directories.Groups[2].Value -replace '^icons/', '../../zed-icons/'
        }
    }
    # The pinned upstream maps bak to backup without defining a backup icon; preserve that data.
    $undefined = @(@($stems.Values) + @($suffixes.Values) | Sort-Object -Unique | Where-Object { !$fileIcons.Contains($_) })
    if ($undefined.Count -ne 1 -or $undefined[0] -cne 'backup' -or $suffixes['bak'] -cne 'backup' -or
        $suffixes['r'] -cne 'r' -or $suffixes['R'] -cne 'r' -or $stems['Dockerfile'] -cne 'docker' -or
        $fileIcons['default'].path -cne '../../zed-icons/file_icons/file.svg') { throw 'Unexpected Zed associations' }
    Write-Host 'Upstream undefined icon key preserved: bak -> backup (use default fallback)'
    $destination = Join-Path $root 'src/assets/icon-themes/zed'
    foreach ($path in @($fileIcons.Values | ForEach-Object { $_.path }) + @($theme.directory_icons.Values)) {
        if (!(Test-Path -LiteralPath (Join-Path $destination $path) -PathType Leaf)) { throw "Missing Phase 5 icon: $path; run tools/fetch-zed-icons.ps1 first" }
    }
    New-Item -ItemType Directory -Path $destination -Force | Out-Null
    $json = @{ name = 'Zed (Default)'; themes = @($theme) } | ConvertTo-Json -Depth 20
    $roundtrip = ConvertFrom-Json $json -AsHashtable
    if ($roundtrip.themes[0].file_suffixes.Count -ne 293 -or $roundtrip.themes[0].file_stems.Count -ne 5 -or
        $roundtrip.themes[0].file_icons.Count -ne 92) { throw 'Zed JSON roundtrip failed' }
    Set-Content -LiteralPath (Join-Path $destination 'zed-default.json') -Value $json -Encoding utf8
    Write-Host 'Zed (Default): 1 icon theme; stems=5; suffixes=293; file_icons=92; directory_icons=2'
    Write-Host "License: $root/src/assets/zed-icons/LICENSES (Phase 5); no SVG copied again"
}
finally {
    # Only remove the uniquely named temporary checkout created by this invocation.
    $resolved = [IO.Path]::GetFullPath($temporary)
    $tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
    if (!$resolved.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase) -or
        [IO.Path]::GetFileName($resolved) -cnotmatch '^workbench-zed-themes-[0-9a-f-]{36}$') { throw 'Unsafe temporary cleanup path' }
    if (Test-Path -LiteralPath $resolved) { Remove-Item -LiteralPath $resolved -Recurse -Force }
}
