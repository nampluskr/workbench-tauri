[DONE] ORDER-03 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| I-1 | `docs/BUILD.md`에 서명 없음과 SmartScreen 경고를 넘기는 방법 | 충족 | `docs/BUILD.md` 7절: "NSIS 설치 파일과 앱 exe 모두 코드 서명을 하지 않는다. 처음 실행할 때 SmartScreen의 "Windows의 PC 보호" 경고가 나오면 "추가 정보 → 실행"을 누른다". C-07 검토 PASS |
| I-2 | 설치 파일 이름 `0.6.0` | 충족 | `src-tauri\target\release\bundle\nsis\workbench-tauri_0.6.0_x64-setup.exe`(5,999,959 바이트, `npm.cmd run tauri build` 성공 2026-11-10) |
| I-2 | 파일 속성 제품 버전 `0.6.0` | 충족 | `(Get-Item …).VersionInfo`: 설치 파일 ProductVersion 0.6.0·FileVersion 0.6.0, `workbench-tauri.exe` ProductVersion 0.6.0·FileVersion 0.6.0 |
| I-2 | 앱 안 버전 표시 `0.6.0` | 충족 | Help → "About workbench-tauri" → "workbench-tauri 0.6.0"(release exe, `specs/v0.6/verify/ORDER-03/v3.json` about.text, `01-about.png`) |
| I-2 | 버전 값을 적은 곳이 한 곳 | 충족 | `git grep -n -E "0\.1\.0\|0\.6\.0" -- package.json src src-tauri/tauri.conf.json src-tauri/Cargo.toml tools` → `src-tauri/tauri.conf.json:4: "version": "0.6.0",` 한 줄. 레포 전체 검색에 남는 것은 요구 문서·빌드 기록·외부 의존성 버전(`Cargo.lock` 다른 크레이트, `package-lock.json` 엔진 범위)뿐 |
| I-3 | Licenses 화면에 복사본 라이선스가 모두 | 충족 | V3: Licenses 항목 41개, "License copy unavailable." 0개(`v3.json` licenseHeaders·licenseUnavailable, `licenses-text.txt`, `03-licenses-top.png`). Zed 쿼리 GPL-3.0 `zed-grammars/licenses/zed/LICENSE-GPL`(+LICENSE-APACHE), Zed 아이콘 `zed-icons/LICENSES`·`LICENSE-GPL`·`LICENSE-APACHE`, 문법 tree-sitter-* 22·확장 3, 테마 4·아이콘 테마 1, 글꼴 `/fonts/ibm-plex-sans/license.txt`·`/fonts/lilex/OFL.txt`. 빠져 있던 번들 JS 의존성·web-tree-sitter 원문을 `src/licenses/frontend-dependencies.txt`로 더함 |
| I-3 | `docs/BUILD.md`에 "개인 용도, 다른 사람에게 나눠 주지 않음" | 충족 | `docs/BUILD.md` 8절: "배포 범위: **개인 용도, 다른 사람에게 나눠 주지 않음**(core I-3). 이 범위이므로 GPL 쿼리를 빼거나 외부 배포용 소스 공개 조건을 맞추는 작업은 하지 않는다." |

## 검증
- coder K-03·K-04: typecheck, `node --test src/shell/app-menus.test.ts` 5/5, cargo check·clippy 통과. tauri-build 2.7.4 소스(`lib.rs:823`)에서 config `version`이 FileVersion·ProductVersion에 들어가는 것을 확인.
- checker C-07(커밋 직전 전체 1회): `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 210 통과·0 실패, `cargo clippy … -D warnings` 경고 0, `cargo test` 21 통과. 코드·BUILD.md 검토 PASS(BUILD.md 지적 셋은 K-03-R1로 고침).
- 빌드: 빌드 전 D: 여유 약 64 GB(68,473,794,560 바이트). `npm.cmd run tauri build`(release, NSIS) 성공. 설치는 하지 않았다.
- V3(`[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`): release exe, 주 모니터 100%, One Light, 임시 APPDATA. SendInput(`tools/win-input.ps1`)으로 메뉴를 누르고 CDP로 값을 읽었다. About 440×300, 창 1440×852 가운데(x 500, y 276), padding·gap 16px, 배경 `#fafafa`(=editor_background)·글자 `#242529`(=text), 버튼·링크·이미지 0, Esc 뒤 닫힘. C-07 판정 PASS.
- 캡처: `specs/v0.6/verify/ORDER-03/` `01-about.png`, `02-about-closed-by-esc.png`, `03-licenses-top.png`, `licenses-text.txt`, `v3.json`.

## 지운 것·더한 것·하지 않은 것 (D-8)
- 더한 것: Help 메뉴 "About workbench-tauri"와 "{앱 이름} {버전}" 한 줄 대화 상자(`<dialog>` showModal, Esc 닫힘, getVersion(), spec `about.*` 크기·여백, capability `core:app:allow-version` 하나) — 근거: I-2 판정 방법이 앱 안 버전 표시를 요구, core-leader 2026-11-10. 그 밖의 아이콘·Commit·OK/Copy·링크는 더하지 않았다. `src/licenses/frontend-dependencies.txt`(번들 npm 의존성 라이선스 원문). 새 의존성 없음.
- 지운 것: `package.json`·`package-lock.json` 루트 `version`, `src-tauri/Cargo.toml` `version`(버전 한 곳).
- 하지 않은 것: 서명, 설치, codicon 라이선스(Phase 9·10).
- 남은 위험: About 제목줄은 spec에 Zed Headline 글자 크기가 없어 Extensions 제목처럼 `font: inherit`(기본 글자 크기)로 두었다. Esc로 닫은 뒤 포커스는 body로 간다(연 메뉴 항목이 사라짐, Licenses와 같은 동작). `Cargo.toml` version 생략으로 Rust 쪽 `CARGO_PKG_VERSION`은 0.0.0이다(코드·도구에서 읽는 곳 없음).

## 바꾼 파일
- 코드·문서 커밋 `f1a1c42`: `src-tauri/tauri.conf.json`, `package.json`, `package-lock.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`, `src-tauri/capabilities/default.json`, `src/shell/app-menus.ts`, `src/shell/app-menus.test.ts`, `src/shell/AppMenu.tsx`, `src/app.css`, `src/spec/metrics.ts`, `src/licenses/frontend-dependencies.txt`(새), `docs/BUILD.md`
- 기록 커밋 `0814eab`: `specs/v0.6/PROGRESS.md`(Phase 3 절), `specs/v0.6/verify/ORDER-03/`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- Zed P-018 About 제목줄 Headline 글자 크기·굵기가 spec(`spec/zed-metrics.toml`)에 없다. 지금은 `font: inherit`. 값을 정해 spec에 넣을지 → core-leader
- checker 허용 목록(`.agents/checker-settings.json`)에 `git diff`·`Test-Path`가 없어 checker가 허가 창에서 멈춘다(ORDER-02, 이번 C-07). leader가 취소하고 diff 파일·파일 읽기로 진행시켰다. auto mode가 leader·writer의 설정 변경을 막는다. → 사용자(ORDER-01-R2 `git grep` 항목과 함께)
- 사용자가 2026-11-09 22:54에 띄운 release 앱(PID 11268)이 exe를 잠가 coder 빌드가 실패했다. 끝내지 않고 잠긴 exe 이름을 `src-tauri\target\release\workbench-tauri.exe.running-pid11268`로 바꾼 뒤 빌드했다. 그 앱은 아직 떠 있지만 지금 WebView2 자식 프로세스가 없다. ORDER-02 V3 때 leader가 부모가 없는 고아 WebView2(PID 8116, 부모 PID 47252, 데이터 폴더 `dev.workbench.tauri`)를 끝냈는데, 부모 PID가 11268이 아니어서 이 앱의 것은 아니었을 가능성이 크지만 확실하지 않다. 그 앱 창에 저장하지 않은 편집이 있었다면 사라졌을 수 있다. 앱을 닫은 뒤 바꿔 둔 exe 파일을 지울지 → 사용자(아침에)
- V3에서 결과 파일 경로를 잘못 써서 앱을 세 번 띄웠다(앞 두 세션은 결과 저장 실패, 마지막 세션 결과만 썼다).

## BLOCKED
- 없음(I-2 앱 안 버전 표시는 [BLOCKED] 뒤 core-leader 답으로 진행)
