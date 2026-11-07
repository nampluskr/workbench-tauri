#Requires -Version 7.0
$ErrorActionPreference = 'Stop'
$commit = '4304dec732a75505066de5ce2dbbfb2bec369498'
$cliVersion = '0.27.1'
$cliUrl = "https://github.com/tree-sitter/tree-sitter/releases/download/v$cliVersion/tree-sitter-windows-x64.gz"
$cliSha256 = 'e21184878f908f91c753b78a76a0766e61954e06627b46088d70d66233424531'
# The diff crate names a missing repository; its published commit is in this upstream.
$diffLicenseRepository = 'https://github.com/the-mikedavis/tree-sitter-diff'
$diffPublishedCommit = '4867e8470e1b0ad7364c4e3ffab762c361bbb635'
$tomlExtensionRepository = 'https://github.com/zed-extensions/toml'
$tomlExtensionCommit = '8e18e5045841f0f265f9c8b89f138c7f7dd09e2e' # v1.1.0
$destination = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../src/assets/zed-grammars'))
$temporary = Join-Path ([IO.Path]::GetTempPath()) ('workbench-zed-grammars-' + [guid]::NewGuid())
$oldEnvironment = @{}
$timer = [Diagnostics.Stopwatch]::StartNew()

function Invoke-Git {
    & git @args
    if ($LASTEXITCODE -ne 0) { throw "git failed: $args" }
}

function Receive-File([string]$Url, [string]$File, [string]$Hash = '', [switch]$AllowMissing) {
    $status = & curl.exe --location --silent --show-error --write-out '%{http_code}' --output $File $Url
    if ($LASTEXITCODE -ne 0) { throw "Download failed: $Url" }
    if ($status -eq '404' -and $AllowMissing) { return $false }
    if ($status -ne '200') { throw "HTTP $status : $Url" }
    if ($Hash -and (Get-FileHash -LiteralPath $File -Algorithm SHA256).Hash.ToLowerInvariant() -ne $Hash) {
        throw "SHA256 mismatch: $Url"
    }
    if ($AllowMissing) { return $true }
}

function Expand-Source([string]$Archive, [string]$Directory) {
    $entries = @(& tar.exe -tf $Archive)
    if ($LASTEXITCODE -ne 0) { throw "Cannot list archive: $Archive" }
    if ($entries | Where-Object { $_ -match '(^[/\\]|^[A-Za-z]:|(^|[/\\])\.\.([/\\]|$))' }) {
        throw "Unsafe archive path: $Archive"
    }
    New-Item -ItemType Directory -Path $Directory | Out-Null
    & tar.exe -xf $Archive -C $Directory
    if ($LASTEXITCODE -ne 0) { throw "Cannot extract: $Archive" }
    $roots = @(Get-ChildItem -LiteralPath $Directory -Directory)
    if ($roots.Count -ne 1) { throw "Expected one archive root: $Archive" }
    return $roots[0].FullName
}

try {
    New-Item -ItemType Directory -Path $temporary | Out-Null
    $checkout = Join-Path $temporary 'zed'
    $stage = Join-Path $temporary 'result'
    New-Item -ItemType Directory -Path $checkout, $stage | Out-Null
    Invoke-Git -C $checkout init --quiet
    Invoke-Git -C $checkout remote add origin https://github.com/zed-industries/zed.git
    Invoke-Git -C $checkout config core.autocrlf false
    Invoke-Git -C $checkout sparse-checkout init --no-cone
    Invoke-Git -C $checkout sparse-checkout set --no-cone /crates/grammars/src/ /extensions/html/extension.toml /extensions/html/languages/html/ /extensions/html/LICENSE-APACHE /Cargo.lock /LICENSE-GPL /LICENSE-APACHE
    Invoke-Git -C $checkout fetch --filter=blob:none --depth=1 origin $commit
    Invoke-Git -C $checkout checkout --quiet --detach FETCH_HEAD
    if ((& git -C $checkout rev-parse HEAD) -ne $commit) { throw 'Unexpected Zed commit' }

    $languageDir = Join-Path $stage 'languages'
    $grammarDir = Join-Path $stage 'grammars'
    $licenseDir = Join-Path $stage 'licenses'
    $logDir = Join-Path $stage 'build-logs'
    New-Item -ItemType Directory -Path $languageDir, $grammarDir, $licenseDir, $logDir | Out-Null
    $builtins = @(Get-ChildItem -LiteralPath (Join-Path $checkout 'crates/grammars/src') -Directory)
    if ($builtins.Count -ne 23) { throw "Unexpected built-in language count: $($builtins.Count)" }
    foreach ($folder in $builtins) { Copy-Item -LiteralPath $folder.FullName -Destination $languageDir -Recurse }
    Copy-Item -LiteralPath (Join-Path $checkout 'extensions/html/languages/html') -Destination $languageDir -Recurse
    Copy-Item -LiteralPath (Join-Path $checkout 'extensions/html/extension.toml') -Destination $stage
    New-Item -ItemType Directory -Path (Join-Path $licenseDir 'zed'), (Join-Path $licenseDir 'html-extension') | Out-Null
    Copy-Item -LiteralPath (Join-Path $checkout 'LICENSE-GPL'), (Join-Path $checkout 'LICENSE-APACHE') -Destination (Join-Path $licenseDir 'zed')
    $htmlLicense = Join-Path $checkout 'extensions/html/LICENSE-APACHE'
    # Windows checkouts may materialize this symlink as its relative target text.
    if ((Get-Content -Raw -LiteralPath $htmlLicense).Trim() -eq '../../LICENSE-APACHE') {
        $htmlLicense = Join-Path $checkout 'LICENSE-APACHE'
    }
    Copy-Item -LiteralPath $htmlLicense -Destination (Join-Path $licenseDir 'html-extension/LICENSE-APACHE')

    $tomlArchive = Join-Path $temporary 'toml-extension.tar.gz'
    Receive-File "https://codeload.github.com/zed-extensions/toml/tar.gz/$tomlExtensionCommit" $tomlArchive
    $tomlRoot = Expand-Source $tomlArchive (Join-Path $temporary 'toml-extension')
    $toml = Get-Content -Raw -LiteralPath (Join-Path $tomlRoot 'extension.toml')
    if ($toml -notmatch '(?m)^version = "1\.1\.0"$') { throw 'Unexpected TOML extension version' }
    Copy-Item -LiteralPath (Join-Path $tomlRoot 'languages/toml') -Destination $languageDir -Recurse
    $tomlMetadata = Join-Path $stage 'extensions/toml'
    $tomlLicenseDir = Join-Path $licenseDir 'toml-extension'
    New-Item -ItemType Directory -Path $tomlMetadata, $tomlLicenseDir | Out-Null
    Copy-Item -LiteralPath (Join-Path $tomlRoot 'extension.toml') -Destination $tomlMetadata
    $tomlLicenses = @(Get-ChildItem -LiteralPath $tomlRoot -File | Where-Object { $_.Name -match '^(LICENSE|COPYING)([.-]|$)' })
    if (!$tomlLicenses.Count) { throw 'Missing TOML extension license' }
    foreach ($license in $tomlLicenses) { Copy-Item -LiteralPath $license.FullName -Destination $tomlLicenseDir }

    $lock = Get-Content -Raw -LiteralPath (Join-Path $checkout 'Cargo.lock')
    $packages = @{}
    foreach ($block in ($lock -split '(?m)^\[\[package\]\]')) {
        if ($block -notmatch '(?m)^name = "(tree-sitter-[^"]+)"$') { continue }
        $packageName = $Matches[1]
        if ($block -notmatch '(?m)^version = "([^"]+)"$') { throw "Missing version: $packageName" }
        $version = $Matches[1]
        if ($block -notmatch '(?m)^source = "([^"]+)"$') { throw "Missing source: $packageName" }
        $source = $Matches[1]
        $checksum = if ($block -match '(?m)^checksum = "([^"]+)"$') { $Matches[1] } else { '' }
        $packages[$packageName] = @{ version = $version; source = $source; checksum = $checksum }
    }
    # Shared packages are downloaded once; their distinct parser directories are built separately.
    $specs = @(
        @('bash', 'tree-sitter-bash', ''), @('c', 'tree-sitter-c', ''),
        @('cpp', 'tree-sitter-cpp', ''), @('css', 'tree-sitter-css', ''),
        @('diff', 'tree-sitter-diff', ''), @('gitcommit', 'tree-sitter-gitcommit', ''),
        @('go', 'tree-sitter-go', ''), @('gomod', 'tree-sitter-gomod', ''),
        @('gowork', 'tree-sitter-gowork', ''), @('jsdoc', 'tree-sitter-jsdoc', ''),
        @('json', 'tree-sitter-json', ''), @('markdown', 'tree-sitter-md', 'tree-sitter-markdown'),
        @('markdown-inline', 'tree-sitter-md', 'tree-sitter-markdown-inline'),
        @('python', 'tree-sitter-python', ''), @('regex', 'tree-sitter-regex', ''),
        @('rust', 'tree-sitter-rust', ''), @('tsx', 'tree-sitter-typescript', 'tsx'),
        @('typescript', 'tree-sitter-typescript', 'typescript'), @('yaml', 'tree-sitter-yaml', ''),
        @('html', 'html-extension', ''), @('toml', 'tree-sitter-toml', '')
    )
    $html = Get-Content -Raw -LiteralPath (Join-Path $checkout 'extensions/html/extension.toml')
    if ($html -notmatch '(?ms)^\[grammars\.html\]\s+repository = "([^"]+)"\s+commit = "([a-f0-9]{40})"') { throw 'Missing HTML grammar source' }
    $packages['html-extension'] = @{ version = ''; source = "git+$($Matches[1])#$($Matches[2])"; checksum = '' }
    if ($toml -notmatch '(?ms)^\[grammars\.toml\]\s+repository = "([^"]+)"\s+(?:rev|commit) = "([a-f0-9]{40})"') { throw 'Missing TOML grammar source' }
    if ($Matches[2] -ne '342d9be207c2dba869b9967124c679b5e6fd0ebe') { throw 'Unexpected TOML grammar commit' }
    $packages['tree-sitter-toml'] = @{ version = ''; source = "git+$($Matches[1])#$($Matches[2])"; checksum = '' }

    foreach ($key in @('LOCALAPPDATA', 'XDG_CACHE_HOME', 'XDG_CONFIG_HOME')) {
        $oldEnvironment[$key] = [Environment]::GetEnvironmentVariable($key, 'Process')
        $value = Join-Path $temporary $key.ToLowerInvariant()
        New-Item -ItemType Directory -Path $value | Out-Null
        [Environment]::SetEnvironmentVariable($key, $value, 'Process')
    }
    $cliArchive = Join-Path $temporary 'tree-sitter.gz'
    Receive-File $cliUrl $cliArchive $cliSha256
    $cli = Join-Path $temporary 'tree-sitter.exe'
    $inputStream = [IO.File]::OpenRead($cliArchive)
    $gzip = [IO.Compression.GZipStream]::new($inputStream, [IO.Compression.CompressionMode]::Decompress)
    $outputStream = [IO.File]::Create($cli)
    try { $gzip.CopyTo($outputStream) } finally { $outputStream.Dispose(); $gzip.Dispose(); $inputStream.Dispose() }
    $versionText = & $cli --version
    if ($LASTEXITCODE -ne 0 -or $versionText -ne "tree-sitter $cliVersion") { throw "Unexpected CLI: $versionText" }

    $sources = @{}
    $grammars = [Collections.Generic.List[object]]::new()
    foreach ($spec in $specs) {
        $name, $packageName, $subdirectory = $spec
        $result = [ordered]@{ name = $name; package = $packageName; sourceUrl = ''; version = ''; rev = ''; archiveSha256 = ''; parserSha256 = ''; wasmSha256 = ''; bytes = 0; crateLicense = ''; crateVcsRevision = ''; licenseFiles = @(); licenseSource = $null; status = 'failed'; error = ''; log = "build-logs/$name.log" }
        $buildTimer = [Diagnostics.Stopwatch]::StartNew()
        try {
            $package = $packages[$packageName]
            if (!$package) { throw "Package missing from pinned lock: $packageName" }
            $result.version = $package.version
            if ($package.source -match '^git\+(https://github.com/[^?#]+)(?:\?[^#]+)?#([a-f0-9]{40})$') {
                $repository, $rev = $Matches[1], $Matches[2]
                $result.sourceUrl = $repository
                $result.rev = $rev
                $archiveUrl = "https://codeload.github.com/$($repository.Substring('https://github.com/'.Length))/tar.gz/$rev"
            } elseif ($package.source -eq 'registry+https://github.com/rust-lang/crates.io-index') {
                $result.sourceUrl = "https://static.crates.io/crates/$packageName/$packageName-$($package.version).crate"
                $archiveUrl = $result.sourceUrl
            } else { throw "Unsupported source: $($package.source)" }
            if (!$sources.ContainsKey($packageName)) {
                $archive = Join-Path $temporary "$packageName.tar.gz"
                Receive-File $archiveUrl $archive $package.checksum
                $sourceRoot = Expand-Source $archive (Join-Path $temporary $packageName)
                $sources[$packageName] = @{ root = $sourceRoot; hash = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant() }
            }
            $result.archiveSha256 = $sources[$packageName].hash
            $sourceRoot = $sources[$packageName].root
            $sourceDir = if ($subdirectory) { Join-Path $sourceRoot $subdirectory } else { $sourceRoot }
            $result.parserSha256 = (Get-FileHash -LiteralPath (Join-Path $sourceDir 'src/parser.c') -Algorithm SHA256).Hash.ToLowerInvariant()
            if ($package.source -eq 'registry+https://github.com/rust-lang/crates.io-index') {
                $cargo = Get-Content -Raw -LiteralPath (Join-Path $sourceRoot 'Cargo.toml')
                if ($cargo -match '(?m)^license\s*=\s*"([^"]+)"') { $result.crateLicense = $Matches[1] }
            }
            $licenses = @(Get-ChildItem -LiteralPath $sourceRoot -File | Where-Object { $_.Name -match '^(LICENSE|COPYING)([.-]|$)' })
            if ($licenses.Count -eq 0 -and $package.source -eq 'registry+https://github.com/rust-lang/crates.io-index') {
                if ($cargo -notmatch '(?m)^repository\s*=\s*"(https://github.com/[^"\s]+)"') { throw "Missing GitHub repository in crate: $packageName" }
                $licenseRepository = $Matches[1].TrimEnd('/') -replace '\.git$', ''
                if ($licenseRepository -notmatch '^https://github.com/[\w.-]+/[\w.-]+$') { throw "Unsupported license repository: $licenseRepository" }
                $vcs = Get-Content -Raw -LiteralPath (Join-Path $sourceRoot '.cargo_vcs_info.json') | ConvertFrom-Json
                $licenseCommit = [string]$vcs.git.sha1
                if ($licenseCommit -notmatch '^[a-f0-9]{40}$') { throw "Missing published commit: $packageName" }
                $result.crateVcsRevision = $licenseCommit
                $pathInVcs = [string]$vcs.path_in_vcs
                if ($pathInVcs -match '(^[/\\]|:|(^|[/\\])\.\.([/\\]|$))') { throw "Unsafe crate VCS path: $packageName" }
                $licenseArchive = Join-Path $temporary "$packageName-license.tar.gz"
                $licenseUrl = "https://codeload.github.com/$($licenseRepository.Substring('https://github.com/'.Length))/tar.gz/$licenseCommit"
                $foundCommit = Receive-File $licenseUrl $licenseArchive -AllowMissing
                if (!$foundCommit -and $packageName -eq 'tree-sitter-diff') {
                    if ($licenseCommit -ne $diffPublishedCommit) { throw 'Unexpected diff published commit' }
                    $licenseRepository = $diffLicenseRepository
                    $licenseUrl = "https://codeload.github.com/$($licenseRepository.Substring('https://github.com/'.Length))/tar.gz/$diffPublishedCommit"
                    $foundCommit = Receive-File $licenseUrl $licenseArchive -AllowMissing
                }
                if (!$foundCommit) { throw "License commit not found: $packageName $licenseCommit" }
                $licenseRoot = Expand-Source $licenseArchive (Join-Path $temporary "$packageName-license")
                $licenseSourceDir = if ($pathInVcs) { Join-Path $licenseRoot $pathInVcs } else { $licenseRoot }
                if ($subdirectory) { $licenseSourceDir = Join-Path $licenseSourceDir $subdirectory }
                $licenseParserHash = (Get-FileHash -LiteralPath (Join-Path $licenseSourceDir 'src/parser.c') -Algorithm SHA256).Hash.ToLowerInvariant()
                if ($licenseParserHash -ne $result.parserSha256) { throw "License commit parser.c differs from crate: $packageName $licenseCommit" }
                $licenses = @(Get-ChildItem -LiteralPath $licenseRoot -File | Where-Object { $_.Name -match '^(LICENSE|COPYING)([.-]|$)' })
                $result.licenseSource = @{ url = $licenseUrl; rev = $licenseCommit; parserSha256 = $licenseParserHash; archiveSha256 = (Get-FileHash -LiteralPath $licenseArchive -Algorithm SHA256).Hash.ToLowerInvariant() }
                # Only the license comes from the published commit; sourceDir remains the verified crate.
            }
            if ($licenses.Count -eq 0) { throw "Missing grammar license: $packageName" }
            $packageLicenseDir = Join-Path $licenseDir $packageName
            New-Item -ItemType Directory -Path $packageLicenseDir -Force | Out-Null
            foreach ($license in $licenses) {
                Copy-Item -LiteralPath $license.FullName -Destination $packageLicenseDir -Force
                $result.licenseFiles += "licenses/$packageName/$($license.Name)"
            }
            $wasm = Join-Path $grammarDir "$name.wasm"
            Push-Location $sourceDir
            try {
                & $cli build --wasm --verbose --output $wasm 2>&1 | Tee-Object -FilePath (Join-Path $stage $result.log) | Out-Host
                if ($LASTEXITCODE -ne 0) { throw "build --wasm exit $LASTEXITCODE" }
            } finally { Pop-Location }
            $result.wasmSha256 = (Get-FileHash -LiteralPath $wasm -Algorithm SHA256).Hash.ToLowerInvariant()
            $result.bytes = (Get-Item -LiteralPath $wasm).Length
            $result.status = 'built'
        } catch {
            $result.error = $_.Exception.Message
            $result.error | Add-Content -LiteralPath (Join-Path $stage $result.log)
            Write-Warning "$name : $($result.error)"
        }
        $result.seconds = $buildTimer.Elapsed.TotalSeconds
        $grammars.Add([pscustomobject]$result)
    }

    $languages = @(foreach ($folder in (Get-ChildItem -LiteralPath $languageDir -Directory | Sort-Object Name)) {
        $config = Get-Content -Raw -LiteralPath (Join-Path $folder.FullName 'config.toml')
        if ($config -notmatch '(?m)^grammar = "([^"]+)"') { throw "Missing grammar: $($folder.Name)" }
        $grammar = if ($Matches[1] -eq 'jsonc') { 'json' } else { $Matches[1] }
        if ($grammar -notin $grammars.name) { throw "Unmapped language: $($folder.Name) -> $grammar" }
        [ordered]@{ name = $folder.Name; grammar = $grammar }
    })
    $logs = (Get-ChildItem -LiteralPath $logDir -File | Get-Content) -join "`n"
    $toolchain = [ordered]@{ cli = @{ version = $cliVersion; url = $cliUrl; sha256 = $cliSha256 } }
    foreach ($tool in @(@('wasiSdk', 'Downloading clang from (https://\S+?)/wasi-sdk-([^/]+)/([^/\s]+)\.\.\.'), @('binaryen', 'Downloading wasm-opt from (https://\S+?)/version_([^/]+)/([^/\s]+)\.\.\.'))) {
        if ($logs -notmatch $tool[1]) { throw "Missing automatic tool download provenance: $($tool[0])" }
        $toolchain[$tool[0]] = @{ version = $Matches[2]; url = "$($Matches[1])/$(if ($tool[0] -eq 'wasiSdk') { 'wasi-sdk-' } else { 'version_' })$($Matches[2])/$($Matches[3])" }
    }
    $wasmCount = @(Get-ChildItem -LiteralPath $grammarDir -Filter '*.wasm' -File).Count
    $extensions = @(@{ name = 'toml'; version = '1.1.0'; sourceUrl = $tomlExtensionRepository; rev = $tomlExtensionCommit; archiveSha256 = (Get-FileHash -LiteralPath $tomlArchive -Algorithm SHA256).Hash.ToLowerInvariant(); licenseFiles = @($tomlLicenses | ForEach-Object { "licenses/toml-extension/$($_.Name)" }) })
    $manifest = [ordered]@{ zedCommit = $commit; extensions = $extensions; toolchain = $toolchain; languages = $languages; grammars = @($grammars.ToArray()); expectedLanguages = 25; expectedWasms = 21; seconds = $timer.Elapsed.TotalSeconds }
    $manifest | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $stage 'manifest.json') -Encoding utf8
    # Preserve successful builds and failure logs even when another grammar fails.
    New-Item -ItemType Directory -Path $destination -Force | Out-Null
    Copy-Item -Path (Join-Path $stage '*') -Destination $destination -Recurse -Force
    $publishedLanguages = @(Get-ChildItem -LiteralPath (Join-Path $destination 'languages') -Directory).Count
    $publishedWasms = @(Get-ChildItem -LiteralPath (Join-Path $destination 'grammars') -Filter '*.wasm' -File).Count
    if ($languages.Count -ne 25 -or $publishedLanguages -ne 25 -or $grammars.Count -ne 21 -or $wasmCount -ne 21 -or $publishedWasms -ne 21 -or @($grammars | Where-Object status -ne 'built').Count) {
        throw "Incomplete grammar copies: languages=$publishedLanguages/25 wasm=$wasmCount/21 published=$publishedWasms; see $destination/manifest.json and build-logs"
    }
    Write-Output "Zed $commit : languages=$publishedLanguages wasm=$publishedWasms; destination=$destination"
}
finally {
    foreach ($key in $oldEnvironment.Keys) { [Environment]::SetEnvironmentVariable($key, $oldEnvironment[$key], 'Process') }
    # Only remove this invocation's uniquely named directory directly under TEMP.
    $resolved = [IO.Path]::GetFullPath($temporary)
    $tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\', '/')
    if ([IO.Path]::GetDirectoryName($resolved) -ne $tempRoot -or [IO.Path]::GetFileName($resolved) -notlike 'workbench-zed-grammars-*') { throw 'Unsafe temporary cleanup path' }
    if (Test-Path -LiteralPath $resolved) { Remove-Item -LiteralPath $resolved -Recurse -Force }
}
