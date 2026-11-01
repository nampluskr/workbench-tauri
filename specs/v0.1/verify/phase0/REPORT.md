# Phase 0 검증 보고서 (wt-checker, 2026-11-01)

- 기준 문서: `specs/v0.1/PLAN.md` — "Phase 0 — 프로젝트 뼈대" 완료 조건
- 관련 결정·조사 항목: `D-3` · `D-4` · `D-10` · `03-tauri R-30` · `03-tauri R-31`

## 완료 조건 판정표

| # | 조건 | 판정 | 증거 |
|---|---|---|---|
| 1 | 레포 루트에 `package.json`과 `src-tauri/Cargo.toml`이 있다. | 충족 | 루트 `package.json`(`"name": "zedlike"`, `"version": "0.1.0"`)과 `src-tauri/Cargo.toml`(`name = "zedlike"`, `version = "0.1.0"`, `edition = "2021"`) 존재 확인. |
| 2 | 의존성에 `solid-js`와 Vite가 있고, `@tauri-apps/api`와 `tauri`의 마이너 버전이 같다(D-3, D-4, 03-tauri R-31). | 충족 | `package.json`: `"solid-js": "1.9.18"`, `"vite": "8.3.5"`, `"vite-plugin-solid": "2.11.15"`, `"@tauri-apps/api": "2.12.4"`, `"@tauri-apps/cli": "2.12.4"`. `src-tauri/Cargo.toml`: `tauri = { version = "2.12.5", features = [] }`. `@tauri-apps/api`(`2.12.4`)와 `tauri`(`2.12.5`) 모두 마이너 버전 `2.12`로 일치. |
| 3 | `package-lock.json`과 `Cargo.lock`이 저장소에 있다(D-4, 03-tauri R-31). | 충족 | `package-lock.json`(74,457 bytes) 및 `src-tauri/Cargo.lock`(103,973 bytes) 파일 존재 확인. |
| 4 | Tauri 설정에 CSP가 켜져 있다(D-10). | 충족 | `src-tauri/tauri.conf.json`의 `app.security`: `"csp": "default-src 'self' ipc: http://ipc.localhost"`, `"devCsp": "default-src 'self' ipc: http://ipc.localhost; connect-src 'self' ipc: http://ipc.localhost ws://localhost:1420"`. (`null`이나 비활성이 아닌 명시적 CSP 문자열 설정 확인) |
| 5 | 빌드 준비물(Node, WebView2 런타임, MSVC, Rust)의 설치 여부와 버전이 PROGRESS에 기록되어 있다(03-tauri R-30). | 충족 | `specs/v0.1/PROGRESS.md` 32~37행에 기록 확인: Node `v24.19.0`(npm `11.17.0`), Rust `1.99.1`(`stable-x86_64-pc-windows-msvc`, cargo `1.99.1`), MSVC Visual Studio Build Tools 2022 `17.14.37827.9`(`VC.Tools.x86.x64`, Windows SDK `10.0.26100.0`), WebView2 런타임 `156.0.4314.58`. |
| 6 | `npm run tauri dev`로 창이 뜬다. 빌드 출력과 실행 스크린샷이 증거로 남아 있다. | 충족 | 빌드 출력: `specs/v0.1/verify/phase0/build.txt` (종료 코드 0, 경고 0건). 실행 창 및 스크린샷: `zedlike.exe`(PID `19100`, HWND `5244834`, 클래스 `Tauri Window`) 창 제목 `"ZedLike"`, 크기(DPI 192 / 200% 배율 물리 픽셀 기준 `WindowRect` `1626×1271`, `ExtendedFrameBounds` `1604×1260`, `ClientRect` `1600×1200` / 논리 `800×600`) 확인 및 `specs/v0.1/verify/phase0/window.png`(20,175 bytes) 캡처 저장. |
| 7 | 위의 Phase 끝 순서(리뷰 → 검증 → PROGRESS → 커밋)를 마쳤다. | 진행 중 | 검증(`specs/v0.1/verify/phase0/REPORT.md`) 단계 수행 중이며, 이후 PROGRESS 기록 및 Phase 커밋이 남아 있음. |

## 실행 창 캡처 상세 (`window.png`)

- 프로세스: `zedlike.exe` (PID `19100`, `npm run tauri dev` 하위 실행)
- 창 핸들(HWND): `5244834` (Window Class: `Tauri Window`)
- 창 제목(Title): `ZedLike`
- 창 크기:
  - DPI: `192` (200% 배율)
  - `WindowRect` (물리 픽셀): `1626 × 1271` (`Left=1197, Top=343, Right=2823, Bottom=1614`, 논리 `813 × 636`)
  - `ExtendedFrameBounds` (물리 픽셀): `1604 × 1260`
  - `ClientRect` (물리 픽셀): `1600 × 1200` (논리 `800 × 600`)
- 캡처 파일: `specs/v0.1/verify/phase0/window.png` (20,175 bytes, `PrintWindow` `PW_RENDERFULLCONTENT` 캡처)
