# BUILD — workbench-tauri 빌드·배포

- 작성일: 2026-11-08
- 기준 커밋: `f1231dc`

배포본(release exe·NSIS 설치 파일)을 만드는 과정이다. 값은 이 PC에서 2026-11-08에 확인한 것이다.

## 1. 필요한 도구와 버전

| 도구 | 버전 | 비고 |
|---|---|---|
| Windows | 11 x64 | Windows 전용 앱 |
| Rust | rustc/cargo 1.99.1, `x86_64-pc-windows-msvc` | `Cargo.toml` `rust-version = "1.90"`이 최소. MSVC 빌드 도구(Visual Studio Build Tools, C++ 워크로드) 필요 |
| Node.js / npm | v22.22.3 / 10.9.8 | `npm install`로 `@tauri-apps/cli` 2.12.4, vite 8.3.5, typescript 7.0.2 설치 |
| Tauri | crate `tauri` =2.12.5, `tauri-build` =2.7.4, `@tauri-apps/api` 2.12.4 | 버전은 `Cargo.toml`·`package.json`에 고정 |
| PowerShell | 7 이상 | fetch 스크립트가 `#Requires -Version 7.0` |
| git, curl.exe, tar.exe | Windows 기본/설치본 | fetch 스크립트가 씀 |
| tree-sitter CLI | 0.27.1 | **따로 설치하지 않는다.** `fetch-zed-grammars.ps1`이 SHA256을 검사해 임시 폴더에 받아 쓴다. CLI가 wasm 빌드용 wasi-sdk 34·binaryen 132를 받아 쓴다(`src/assets/zed-grammars/manifest.json` `toolchain`) |
| NSIS | 3.13 | 따로 설치하지 않는다. 첫 `tauri build` 때 Tauri가 `nsis_tauri_utils`와 함께 받는다(인터넷 필요) |
| WebView2 런타임 | 빌드 PC에 설치됨(이 PC 157.0.4341.42) | Windows 11 기본 포함 |

## 2. 복사본 채우기(gitignore된 폴더)

모두 인터넷이 필요하다. 커밋·버전은 스크립트에 고정돼 있다(Zed 커밋 `4304dec732a75505066de5ce2dbbfb2bec369498`).

1. `pwsh tools/fetch-zed-icons.ps1` → `src/assets/zed-icons/` (Zed UI 아이콘 299개 + file_icons 96개, LICENSE-GPL·LICENSE-APACHE)
2. `pwsh tools/fetch-zed-themes.ps1` → `src/theme/assets/zed/`(ayu·gruvbox), `src/theme/assets/catppuccin/`(0.2.27), `src/theme/assets/macos-classic/`(0.4.0), `src/assets/icon-themes/catppuccin-icons/`(1.24.0), `src/assets/icon-themes/zed/`. **1번 뒤에** 실행한다(zed-icons가 없으면 "run tools/fetch-zed-icons.ps1 first"로 멈춘다).
3. `pwsh tools/fetch-zed-grammars.ps1` → `src/assets/zed-grammars/` (언어 29, wasm 25, 라이선스·빌드 로그·manifest.json). 지난 실행 113.7초(manifest `seconds`). 순서 의존은 없다.

- 이 폴더들이 이미 있으면 다시 돌리지 않아도 된다. 2026-11-08 빌드는 기존 복사본으로 했다.

## 3. 빌드 명령

```powershell
npm install                     # 처음 한 번(PowerShell 실행 정책에 막히면 npm.cmd)
npm run tauri build             # release exe + NSIS 설치 파일
```

- `beforeBuildCommand`가 `npm run build`(vite)를 먼저 돌리고 `dist/`를 exe 안에 넣는다.
- 설치 파일은 `src-tauri/tauri.conf.json` `bundle.active=true`, `targets=["nsis"]`(K-59, 커밋 `f1231dc`)라서 함께 나온다. WebView2 설치 방식은 기본값 `downloadBootstrapper`.
- exe만 필요하면 `npm run tauri build -- --no-bundle`.
- 디버그 빌드: `npm run tauri build -- --debug --no-bundle`.

## 4. 결과 파일(2026-11-08)

| 파일 | 경로 | 크기 |
|---|---|---|
| NSIS 설치 파일 | `src-tauri\target\release\bundle\nsis\workbench-tauri_0.1.0_x64-setup.exe` | 6,052,343 바이트(5.77 MiB) |
| 앱 exe | `src-tauri\target\release\workbench-tauri.exe` | 16,972,800 바이트(16.19 MiB) |
| exe zip(Compress-Archive Optimal) | 직접 만듦(레포 밖 `%TEMP%`에서 측정) | 7.66 MiB |
| 참고: 프런트엔드 `dist/` | exe 안에 압축돼 들어감 | 18.57 MiB(이 중 문법 복사본 11.9 MB) |

## 5. 걸린 시간(이 PC)

- 처음부터 release 빌드(`--no-bundle` 상태, 2026-11-08): 전체 200초, 그중 Rust 컴파일 3분 5초.
- NSIS 켠 빌드(Rust 일부 재컴파일 + NSIS 도구 첫 내려받기): 101.7초, Rust 56.1초.
- 문법 복사본 채우기: 113.7초.

## 6. 다른 PC로 옮기는 법

- 권장: 설치 파일 하나를 복사해 실행한다. 사용자별 설치(Tauri NSIS 기본). WebView2가 없으면 설치 중 인터넷으로 받는다.
- 또는 exe 하나만 복사한다(zip으로 묶어도 됨). WebView2가 이미 있는 PC(Windows 11 기본)에서는 그대로 뜬다. 추가 파일은 필요 없다: 프런트엔드·문법 wasm은 exe 안에 있고, exe는 WebView2Loader.dll·vcruntime140.dll을 참조하지 않으며 Windows 기본 UCRT만 쓴다.
- 확인: exe를 `%TEMP%`의 다른 폴더에 복사해 1회 실행 → 0.58초에 창 핸들, WebView2 자식 프로세스 생성, 정상 종료([`specs/v0.5/reports/RELEASE.md`](../specs/v0.5/reports/RELEASE.md)). 다른 PC 설치·실행은 미검증.
- 사용자 데이터: `%APPDATA%\workbench-tauri\`(keymap.json·settings.json·상태 파일). 없으면 앱이 만든다. 제거해도 남을 수 있다.

## 7. 알려진 제약

- 코드 서명 없음 → SmartScreen "알 수 없는 게시자" 경고.
- 런타임: WebView2 필요. 없는 PC는 설치할 때 인터넷이 필요하다(오프라인 설치는 `offlineInstaller`/`embedBootstrapper`, 지금 안 켬). exe만 옮기면 WebView2를 설치해 주지 않는다.
- 콘솔 창: release 빌드는 뜨지 않는다(`src-tauri/src/main.rs`의 `windows_subsystem = "windows"`). 그래서 release exe의 `eprintln!` 로그는 보이지 않는다. 디버그 빌드는 콘솔 창이 뜬다.
- Windows x64만.
- 버전 `0.1.0`(tauri.conf.json `version`)이 설치 파일 이름에 나온다. 바꿀지 미정.
- 빌드 경고(기존 그대로): Vite 500 kB 넘는 chunk(index JS 3,863.55 kB), web-tree-sitter direct eval. Rust 경고 없음.
- 빌드 PC 네트워크: 첫 빌드의 NSIS 내려받기, fetch 스크립트 모두 인터넷이 필요하다. 샌드박스(예: Codex)에서는 네트워크가 막혀 실패한다(os error 10013).

## 8. 라이선스 주의

- 배포물(exe·설치 파일)에 아래 복사본이 **들어간다**.
  - Zed 언어 쿼리(`.scm`, Zed 저장소, GPL-3.0) — JS 번들에 문자열로 들어감
  - Zed UI·파일 아이콘(`src/assets/zed-icons/`, Zed 저장소 assets/icons, LICENSES 파일 참고)
  - Zed·Catppuccin·macOS Classic 테마, Catppuccin 아이콘 테마
  - tree-sitter 문법 wasm 25개(문법마다 라이선스, `src/assets/zed-grammars/licenses/`와 manifest)
- 이 복사본은 **개인 용도**로 받은 것이다(core D-8·D-9). 배포본을 남에게 넘기면 GPL-3.0 등 각 라이선스 의무(소스 제공, 고지)가 생긴다. 라이선스 원문 파일은 지금 `dist/`에 따로 들어가지 않는다.
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
