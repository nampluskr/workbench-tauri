# BUILD — workbench-tauri 빌드·배포

- 작성일: 2026-11-11
- 기준 커밋: `2866205`(ORDER-06 코드)

배포본(release exe·NSIS 설치 파일)을 만드는 과정이다. 2026-11-11 0.8.0 release 빌드에 성공했고, 같은 날 ORDER-06(I-11)으로 다시 빌드했다. 도구·기존 측정은 각 절의 날짜를 따른다.

## 0. 노트북에서 처음부터

`git clone` 뒤 아래 순서대로 하면 된다. 각 단계의 자세한 내용은 링크한 절에 있다.

1. 도구 설치([1절](#1-필요한-도구와-버전))
2. 레포 받기:
   ```powershell
   git clone https://github.com/nampluskr/workbench-tauri
   cd workbench-tauri
   ```
3. 복사본 채우기([2절](#2-복사본-채우기gitignore된-폴더)): `pwsh tools/fetch-zed-icons.ps1` → `pwsh tools/fetch-zed-themes.ps1` → `pwsh tools/fetch-zed-grammars.ps1`
4. `npm ci`(lockfile 그대로 설치. 안 되면 `npm install`). PowerShell 실행 정책에 막히면 `npm.cmd ci`
5. `npm run tauri build`([3절](#3-빌드-명령)) → 결과는 [4절](#4-결과-파일) 경로

- 인터넷 필요: 2~5단계 모두(GitHub·crates.io·npm 레지스트리, 첫 빌드의 NSIS 도구).

## 1. 필요한 도구와 버전

| 도구 | 이 PC에서 확인한 버전 | 설치 |
|---|---|---|
| Windows | 11 x64 | Windows 전용 앱 |
| Git | 2.52.0.windows.1 | `winget install -e --id Git.Git` |
| PowerShell 7 | 7.6.9 | `winget install -e --id Microsoft.PowerShell` (fetch 스크립트는 `pwsh`로 실행. Windows PowerShell 5.1로는 안 됨: `#Requires -Version 7.0`) |
| Node.js 22 | v22.22.3 (npm 10.9.8) | `winget install -e --id OpenJS.NodeJS.22` (`OpenJS.NodeJS.LTS`는 지금 26.x라 쓰지 않음. 22.x면 됨) |
| Visual Studio Build Tools 2022 (C++) | — | `winget install -e --id Microsoft.VisualStudio.2022.BuildTools --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"` (MSVC 링커·Windows SDK. Rust MSVC 툴체인에 필요) |
| Rust | 1.99.1 `x86_64-pc-windows-msvc` | `winget install -e --id Rustlang.Rustup` 뒤 새 터미널에서 `rustup default stable`(최소 1.90, `Cargo.toml` `rust-version`). 같은 버전을 원하면 `rustup default 1.99.1` |
| WebView2 런타임 | 157.0.4341.42 | Windows 11 기본 포함. 없으면 `winget install -e --id Microsoft.EdgeWebView2Runtime` |
| curl.exe, tar.exe | curl 8.21.0, bsdtar 3.8.9 | Windows 10 1803+ 기본 포함. 따로 설치 안 함 |
| tree-sitter CLI 0.27.1, wasi-sdk 34, binaryen 132 | — | 설치 안 함. `fetch-zed-grammars.ps1`이 SHA256을 검사해 임시 폴더에 받아 쓴다(`src/assets/zed-grammars/manifest.json` `toolchain`) |
| NSIS 3.13 | — | 설치 안 함. 첫 `tauri build` 때 Tauri가 `nsis_tauri_utils`와 함께 받는다(인터넷 필요) |
| npm 패키지(@tauri-apps/cli 2.12.4 등) | — | `npm ci`가 `package-lock.json`대로 설치(vite 8.3.5, typescript 7.0.2, 0.8.0에서 더한 `katex` 0.18.11·`mermaid` 12.2.0 포함). 새로 설치할 도구는 없음 |
| Tauri | crate `tauri` =2.12.5, `tauri-build` =2.7.4, `@tauri-apps/api` 2.12.4 | 설치 안 함. 버전은 `Cargo.toml`·`package.json`에 고정 |

- 설치 확인 명령: `git --version`, `pwsh -v`, `node -v`, `npm -v`, `rustc -V`, `cargo -V`

## 2. 복사본 채우기(gitignore된 폴더)

모두 인터넷이 필요하다. 커밋·버전은 스크립트에 고정돼 있다(Zed 커밋 `4304dec732a75505066de5ce2dbbfb2bec369498`).

1. `pwsh tools/fetch-zed-icons.ps1` → `src/assets/zed-icons/` (Zed UI 아이콘 299개 + file_icons 96개, LICENSE-GPL·LICENSE-APACHE)
2. `pwsh tools/fetch-zed-themes.ps1` → `src/theme/assets/zed/`(ayu·gruvbox), `src/theme/assets/catppuccin/`(0.2.27), `src/theme/assets/macos-classic/`(0.4.0), `src/assets/icon-themes/catppuccin-icons/`(1.24.0), `src/assets/icon-themes/zed/`. **1번 뒤에** 실행한다(zed-icons가 없으면 "run tools/fetch-zed-icons.ps1 first"로 멈춘다).
3. `pwsh tools/fetch-zed-grammars.ps1` → `src/assets/zed-grammars/` (언어 29, wasm 25, 라이선스·빌드 로그·manifest.json). 지난 실행 113.7초(manifest `seconds`). 순서 의존은 없다.

- 이 폴더들이 이미 있으면 다시 돌리지 않아도 된다. 2026-11-08 빌드는 기존 복사본으로 했다.
- 복사본 폴더 목록(모두 `.gitignore`): `src/assets/zed-icons/`, `src/theme/assets/zed/`, `src/theme/assets/catppuccin/`, `src/theme/assets/macos-classic/`, `src/assets/icon-themes/catppuccin-icons/`, `src/assets/icon-themes/zed/`, `src/assets/zed-grammars/`(Zed 쿼리 포함). 이 일곱 개가 세 스크립트로 모두 채워진다.

### 이 PC에만 있는 것에 기대는가

tauri-leader가 세 스크립트 코드를 읽어 확인했다(2026-11-08). **이 PC에만 있는 것에 기대는 부분이 없다.**

- 모든 원본을 공개 출처의 고정 커밋/버전에서 받는다: Zed 저장소 `zed-industries/zed` 커밋 `4304dec732a75505066de5ce2dbbfb2bec369498`(아이콘·테마·쿼리·문법 목록), `catppuccin/zed` 0.2.27, `huacnlee/zed-theme-macos-classic` 0.4.0, `catppuccin/zed-icons` 1.24.0, `zed-extensions/toml` v1.1.0, `d1y/git_firefly` v0.1.9, 문법 원본은 Zed `Cargo.lock`의 고정 커밋(GitHub)·crates.io 체크섬, tree-sitter CLI는 GitHub 릴리스 + SHA256.
- 받은 것은 `%TEMP%\workbench-zed-*-<GUID>` 임시 폴더에 두고 끝나면 지운다. `D:\projects` 경로, 설치된 Zed·Zed 확장 폴더, 이전에 받은 캐시를 읽지 않는다. 문법 스크립트는 `LOCALAPPDATA`·`XDG_CACHE_HOME`·`XDG_CONFIG_HOME`을 임시 폴더로 바꿔 tree-sitter 캐시도 새로 받는다.
- 레포 안에서 쓰는 경로는 스크립트 위치 기준 상대 경로(`$PSScriptRoot/..`)뿐이라 clone 위치가 어디든 된다.
- 앱 코드(`src/`, `src-tauri/src/`, 설정)에도 이 PC 경로가 없다(테스트의 예시 경로 `D:\...`만 있음).
- 그래서 노트북에서 따로 준비할 것은 없다. 1절 도구와 인터넷만 있으면 된다.
- 참고(부분 확인): 깨끗한 clone에서 순서대로 돌려 본 결과 clone 7.6초, `fetch-zed-icons` 10초, `fetch-zed-themes` 76.1초로 성공했다. `fetch-zed-grammars`부터는 지시 정정으로 중단해 끝까지 확인하지 않았다(복제 폴더는 지움). 전체 clone 빌드는 미검증.

## 3. 빌드 명령

```powershell
npm ci                          # 처음 한 번, lockfile 그대로(안 되면 npm install, 실행 정책에 막히면 npm.cmd ci)
npm run tauri build             # release exe + NSIS 설치 파일
```

- `beforeBuildCommand`가 `npm run build`(vite)를 먼저 돌리고 `dist/`를 exe 안에 넣는다.
- 설치 파일은 `src-tauri/tauri.conf.json` `bundle.active=true`, `targets=["nsis"]`(K-59, 커밋 `f1231dc`)라서 함께 나온다. 설치 파일 아이콘은 `bundle.windows.nsis.installerIcon`(`icons/icon.ico`)으로 정한다(없으면 NSIS 기본 아이콘). WebView2 설치 방식은 기본값 `downloadBootstrapper`.
- exe만 필요하면 `npm run tauri build -- --no-bundle`.
- 디버그 빌드: `npm run tauri build -- --debug --no-bundle`.

## 4. 결과 파일

2026-11-11 tauri-coder(K-06b)의 0.8.0 release 다시 빌드 결과다(ORDER-06: I-11 HTML 미리보기 색을 Preview 테마에 맞춤). 앱 버전은 0.8.0 그대로다. 실행 중인 앱이 exe를 잠그면 빌드가 os error 5로 실패하므로 앱을 닫고 빌드한다.

| 파일 | 경로 | 크기·버전 |
|---|---|---|
| NSIS 설치 파일 | `src-tauri\target\release\bundle\nsis\workbench-tauri_0.8.0_x64-setup.exe` | 7,463,747 바이트(수정 시각 2026-11-11 10:00:05); ProductVersion `0.8.0` |
| 앱 exe | `src-tauri\target\release\workbench-tauri.exe` | 18,290,176 바이트(수정 시각 2026-11-11 10:00:05); ProductVersion `0.8.0` |
| 참고: 프런트엔드 `dist/` | exe 안에 압축돼 들어감 | 25,253,939 바이트(24.08 MiB), 파일 4,965개, JS 청크 190개(`dist/assets/*.js`) — ORDER-05 빌드(K-05c, 08:53) 기준, 이번에 다시 재지 않음 |

- 버전은 `(Get-Item …).VersionInfo`로 읽었다. 설치 파일·exe 아이콘은 이번에 바꾸지 않았고, exe zip은 이번에 만들지 않았다.
- 비교: ORDER-05 최종 빌드(K-05d, 09:00:48)는 설치 파일 7,459,022 B·exe 18,289,664 B(FileVersion도 `0.8.0`)였다. 이번 빌드는 설치 파일 +4,725 B, exe +512 B.

### 0.7.0 대비

| 파일 | 0.7.0 (2026-11-10 22:36, K-16) | 0.8.0 (ORDER-06 빌드) | 증가 |
|---|---|---|---|
| NSIS 설치 파일 | 6,065,494 B | 7,463,747 B | +1,398,253 B (+23.05%) |
| 앱 exe | 16,832,512 B | 18,290,176 B | +1,457,664 B (+8.66%) |

- 이유: `dist/`에 KaTeX 청크(258.9 kB)와 Mermaid 쪽 청크(약 5.2 MB, 비압축)가 더해지고 `index`가 Licenses 텍스트만큼(+107.5 kB) 커져, 압축돼 exe에 들어간 것이다. 두 라이브러리는 처음 쓸 때만 불러와 앱 시작에는 읽히지 않는다.
- 0.7.0 참고 값(2026-11-08 기록): exe zip(Compress-Archive Optimal) 7.66 MiB, `dist/` 18.57 MiB(이 중 문법 복사본 11.9 MB).

## 5. 걸린 시간(이 PC)

- 처음부터 release 빌드(`--no-bundle` 상태, 2026-11-08): 전체 200초, 그중 Rust 컴파일 3분 5초.
- NSIS 켠 빌드(Rust 일부 재컴파일 + NSIS 도구 첫 내려받기): 101.7초, Rust 56.1초.
- 0.8.0 release 다시 빌드(`npm.cmd run tauri build`, NSIS 켬, 2026-11-11 K-06b, ORDER-06): 전체 1분 17.5초(cargo release 52.76초, vite 7.73초, NSIS 포함). 새 경고 없음.
- 0.8.0 ORDER-05 최종 빌드(NSIS 켬, 2026-11-11 K-05d): 전체 70초(Rust 48.97초, vite 8.26초).
- 참고: 그 앞 0.8.0 빌드(K-05c)는 전체 119.9초(Rust 96초, vite 8.74초)였다. 이때 Rust는 `workbench-tauri` 크레이트만 다시 컴파일했다(의존 크레이트 캐시).
- 0.7.0 release 다시 빌드(`npm.cmd run tauri build`, NSIS 켬, ORDER-09 포함, 2026-11-10 K-16): 전체 67.7초(Rust 47.8초, vite 6.9초, NSIS 포함). 같은 날 앞선 빌드는 ORDER-08 K-12-R2 57.8초, K-12 57.8초(Rust 40.6초), ORDER-06·07(K-09) 66.4초.
- 아이콘 파일(`src-tauri/icons/icon.ico`)만 바꾸면 Cargo가 빌드 스크립트를 다시 돌리지 않아 exe에 옛 아이콘이 남는다. 이럴 땐 `src-tauri/build.rs`의 수정 시각만 갱신(`(Get-Item src-tauriuild.rs).LastWriteTime = Get-Date`)하고 다시 빌드한다. 내용은 안 바꾼다.
- 문법 복사본 채우기: 113.7초.
- 노트북은 PC 사양·회선에 따라 다르다.

## 6. 다른 PC로 옮기는 법

- 권장: 설치 파일 하나를 복사해 실행한다. 사용자별 설치(Tauri NSIS 기본). WebView2가 없으면 설치 중 인터넷으로 받는다.
- 또는 exe 하나만 복사한다(zip으로 묶어도 됨). WebView2가 이미 있는 PC(Windows 11 기본)에서는 그대로 뜬다. 추가 파일은 필요 없다: 프런트엔드·문법 wasm은 exe 안에 있고, exe는 WebView2Loader.dll·vcruntime140.dll을 참조하지 않으며 Windows 기본 UCRT만 쓴다.
- 확인: exe를 `%TEMP%`의 다른 폴더에 복사해 1회 실행 → 0.58초에 창 핸들, WebView2 자식 프로세스 생성, 정상 종료([`specs/v0.5/reports/RELEASE.md`](../specs/v0.5/reports/RELEASE.md)). 다른 PC 설치·실행은 미검증.
- 사용자 데이터: `%APPDATA%\workbench-tauri\`(keymap.json·settings.json·상태 파일). 없으면 앱이 만든다. 제거해도 남을 수 있다.

## 7. 알려진 제약

- NSIS 설치 파일과 앱 exe 모두 코드 서명을 하지 않는다. 처음 실행할 때 SmartScreen의 "Windows의 PC 보호" 경고가 나오면 "추가 정보 → 실행"을 누른다("알 수 없는 게시자" 표시).
- 런타임: WebView2 필요. 없는 PC는 설치할 때 인터넷이 필요하다(오프라인 설치는 `offlineInstaller`/`embedBootstrapper`, 지금 안 켬). exe만 옮기면 WebView2를 설치해 주지 않는다.
- 콘솔 창: release 빌드는 뜨지 않는다(`src-tauri/src/main.rs`의 `windows_subsystem = "windows"`). 그래서 release exe의 `eprintln!` 로그는 보이지 않는다. 디버그 빌드는 콘솔 창이 뜬다.
- Windows x64만.
- 앱 버전은 `src-tauri/tauri.conf.json`의 `version` 한 곳에서만 정한다. 버전을 끝낼 때마다 그 번호로 올린다(v0.8.1이면 `0.8.1`). Tauri가 이 값을 설치 파일 이름과 exe·설치 파일의 제품/파일 버전에 쓴다. private npm 패키지에는 `version`이 없고, Cargo 패키지는 생략 기본값을 쓴다. Help 메뉴의 "About workbench-tauri"가 `tauri.conf.json` 버전을 보인다.
- 빌드 경고(기존과 같은 종류, 0.8.0): Vite 500 kB 넘는 chunk(`index` 4,557.41 kB, 0.7.0은 3,863.55 kB; Mermaid 쪽 `elk` 1,462.86 kB·`chunk-NGNAAXSQ` 629.04 kB 등은 지연 로딩), web-tree-sitter direct eval. Rust 경고 없음.
- `cargo test`: `folder_watch::tests::missing_root_is_watched_after_creation_and_recreation`가 0.8.0 빌드 확인(K-05c)에서 1회 실패했다(`expected filesystem event: Timeout`). 코드 변경 없이 다시 돌리면 통과(3회 모두)해서 간헐 실패로 본다. 원인은 조사하지 않았다.
- 빌드 PC 네트워크: 첫 빌드의 NSIS 내려받기, fetch 스크립트 모두 인터넷이 필요하다. 샌드박스(예: Codex)에서는 네트워크가 막혀 실패한다(os error 10013).

## 8. 라이선스 주의

- 배포물(exe·설치 파일)에 아래 복사본이 **들어간다**.
  - Zed 언어 쿼리(`.scm`, Zed 저장소, GPL-3.0) — JS 번들에 문자열로 들어감
  - Zed UI·파일 아이콘(`src/assets/zed-icons/`, Zed 저장소 assets/icons, LICENSES 파일 참고)
  - Zed·Catppuccin·macOS Classic 테마, Catppuccin 아이콘 테마
  - tree-sitter 문법 wasm 25개(문법마다 라이선스, `src/assets/zed-grammars/licenses/`와 manifest)
- 배포 범위: **개인 용도, 다른 사람에게 나눠 주지 않음**(core I-3). 이 범위이므로 GPL 쿼리를 빼거나 외부 배포용 소스 공개 조건을 맞추는 작업은 하지 않는다.
- 라이선스 본문은 Dependency Licenses 화면에 포함된다: `AppMenu.tsx`의 raw glob(Zed 아이콘·테마·문법·`src/licenses/*.txt`)과 `licenses.ts`의 글꼴 목록을 쓴다. IBM Plex Sans·Lilex 글꼴 본문은 `public/fonts/`에서 `dist/fonts/`로 복사된다. Vite가 번들에 넣는 JS 의존성과 tree-sitter 런타임 본문은 `src/licenses/frontend-dependencies.txt`에 원문으로 두었다(패키지 버전을 바꾸면 이 복사본도 갱신). 0.8.0에서 KaTeX·Mermaid와 번들에 묶이는 하위 패키지까지 45개를 더했다(K-05b). 기준은 `vite build --sourcemap`의 소스 목록에 나오는 패키지이고, 라이선스 종류는 MIT·ISC·Apache-2.0·BSD-3-Clause·EPL-2.0(`elkjs`)이다. 앱 exe에 들어가는 Rust crate(Windows 대상, build·dev·proc-macro 제외)의 이름·버전·라이선스와 원문은 `src/licenses/rust-dependencies.txt`에 있다(`Cargo.lock`을 바꾸면 `node tools/rust-licenses.mjs`로 다시 만든다).
- Zed 앱 코드는 복사하지 않았다(레포 규칙).

## 9. GitHub에 올리지 않는 것

- 빌드 산출물(exe·zip·설치 파일·`target/`·`dist/`·`bundle/`)과 복사본 폴더는 올리지 않는다.
- `.gitignore` 확인(2026-11-08, `git check-ignore -v`):

  | 경로 | 결과 |
  |---|---|
  | `src-tauri/target/release/workbench-tauri.exe` | 막힘(`src-tauri/target/`) |
  | `src-tauri/target/release/bundle/nsis/*-setup.exe` | 막힘(`src-tauri/target/`) |
  | `dist/` | 막힘(`dist/`) |
  | `target/` | 막힘(`target/`) |
  | 레포 안 다른 곳에 둔 `*.exe`·`*.zip`(예: 루트 `workbench-tauri.zip`) | **막히지 않음** |

- 그래서 exe·zip·설치 파일을 레포 안으로 복사하지 말고 레포 밖(예: `%TEMP%`, 바탕화면)에 둔다. `.gitignore`에 `*.exe`·`*.zip`을 더할지는 사람이 정한다(미정).
- `git ls-files` 확인(2026-11-08): `.exe`·`.zip`·`.msi`·`.dll`·`.pdb`·`.wasm`, `target/`·`dist/`·`bundle/` 아래 추적 파일 **0개**. 복사본 폴더(`src/assets/zed-grammars`·`zed-icons`)도 추적 0개.
- 확인 명령:

```powershell
git check-ignore -v src-tauri/target/release/workbench-tauri.exe dist/index.html
git ls-files | Select-String '\.(exe|zip|msi|dll|pdb|wasm)$|(^|/)(target|dist|bundle)/'   # 출력 없어야 함
```
