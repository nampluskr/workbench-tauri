#Requires -Version 7
<#
.SYNOPSIS
  SPEC R-11 링크 사례용 시험 확장 폴더를 임시 폴더에 만든다. 이 PC 의 Zed 폴더는 건드리지 않는다.

.DESCRIPTION
  위치는 고정이다: <TEMP>\zedlike-ext-fixture (TEMP = [System.IO.Path]::GetTempPath()).
  만드는 구조:
    zedlike-ext-fixture\.zedlike-ext-fixture   이 스크립트가 만든 폴더임을 표시하는 파일
    zedlike-ext-fixture\root\linky\extension.toml  시험용 확장 (id = linky)
    zedlike-ext-fixture\root\linky\ok.txt          확장 안의 정상 파일
    zedlike-ext-fixture\root\linky\out-junction -> outside  디렉터리 정션 (권한 없이 만들 수 있다)
    zedlike-ext-fixture\root\linky\out-symlink  -> outside  디렉터리 심볼릭 링크 (권한이 없으면 만들지 못하고 기록한다)
    zedlike-ext-fixture\outside\secret.txt     확장 밖 파일
  앱에는 __poc.ext.addRoot('<root>') 로 이 root 를 더한다(디버그 빌드 전용 명령).

  삭제 안전 장치 (리뷰 P3-1 #1):
  - 지우는 대상은 위 고정 경로 하나뿐이다. 경로를 바꾸는 인자는 없다.
  - 그 경로가 TEMP 자체가 아니고, 부모가 정확히 TEMP 이고, 마지막 이름이 정확히 zedlike-ext-fixture 일 때만 진행한다.
  - 이미 있으면 표시 파일(.zedlike-ext-fixture)이 있을 때만 지운다. 없으면 지우지 않고 오류로 끝낸다.
  - 폴더 자체가 링크(재분석 지점)이면 지우지 않는다.
  - 안의 링크(정션·심볼릭 링크)는 대상까지 따라가지 않도록 링크만 먼저 지우고, 그다음 폴더를 지운다.

.EXAMPLE
  pwsh -NoProfile -File tools/make-ext-fixture.ps1
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$FixtureName = 'zedlike-ext-fixture'
$MarkerName = '.zedlike-ext-fixture'

$temp = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd('\', '/')
$Base = [System.IO.Path]::GetFullPath((Join-Path $temp $FixtureName)).TrimEnd('\', '/')

# Path checks on exact components, not string prefixes.
$parent = [System.IO.Path]::GetDirectoryName($Base)
$leaf = [System.IO.Path]::GetFileName($Base)
if ([string]::Equals($Base, $temp, [StringComparison]::OrdinalIgnoreCase)) { throw "refusing: fixture path equals TEMP ($temp)" }
if (-not [string]::Equals($parent, $temp, [StringComparison]::OrdinalIgnoreCase)) { throw "refusing: parent of $Base is not TEMP ($temp)" }
if (-not [string]::Equals($leaf, $FixtureName, [StringComparison]::Ordinal)) { throw "refusing: folder name is '$leaf', expected '$FixtureName'" }

$removed = $null
if (Test-Path -LiteralPath $Base) {
    $item = Get-Item -LiteralPath $Base -Force
    if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) { throw "refusing: $Base is itself a link" }
    if (-not (Test-Path -LiteralPath (Join-Path $Base $MarkerName))) {
        throw "refusing: $Base exists but has no $MarkerName marker; it was not made by this script. Remove it by hand if intended."
    }
    # Remove links first without following them, then the tree.
    $links = Get-ChildItem -LiteralPath $Base -Recurse -Force -Attributes ReparsePoint -ErrorAction SilentlyContinue
    foreach ($l in ($links | Sort-Object { $_.FullName.Length } -Descending)) {
        [System.IO.Directory]::Delete($l.FullName, $false)
    }
    Remove-Item -LiteralPath $Base -Recurse -Force
    $removed = $Base
}

$root = Join-Path $Base 'root'
$ext = Join-Path $root 'linky'
$outside = Join-Path $Base 'outside'
New-Item -ItemType Directory -Force $ext, $outside | Out-Null
Set-Content -LiteralPath (Join-Path $Base $MarkerName) -Value 'created by tools/make-ext-fixture.ps1' -Encoding utf8
Set-Content -LiteralPath (Join-Path $ext 'extension.toml') -Value "id = `"linky`"`nname = `"Link test`"`nversion = `"0.0.0`"`nschema_version = 1" -Encoding utf8
Set-Content -LiteralPath (Join-Path $ext 'ok.txt') -Value 'inside' -Encoding utf8
Set-Content -LiteralPath (Join-Path $outside 'secret.txt') -Value 'outside' -Encoding utf8

New-Item -ItemType Junction -Path (Join-Path $ext 'out-junction') -Target $outside | Out-Null
$symlink = [ordered]@{ created = $false; error = $null }
try {
    New-Item -ItemType SymbolicLink -Path (Join-Path $ext 'out-symlink') -Target $outside -ErrorAction Stop | Out-Null
    $symlink.created = $true
} catch {
    $symlink.error = $_.Exception.Message
}

[ordered]@{
    base = $Base
    removedBefore = $removed
    root = $root
    extension = 'linky'
    inside = 'ok.txt'
    outsideViaJunction = 'out-junction/secret.txt'
    outsideViaSymlink = if ($symlink.created) { 'out-symlink/secret.txt' } else { $null }
    symlink = $symlink
    outsideFile = (Join-Path $outside 'secret.txt')
} | ConvertTo-Json -Depth 4
