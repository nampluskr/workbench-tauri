[DONE] ORDER-08 tauri

`.agents/checker-settings.json` 허용 목록은 core-leader 답(사용자가 직접 고침, 기준 7은 삭제만 판정)대로 하지 않았다. 나머지는 모두 충족했다.

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| 1 I-22 | release exe·설치 파일·작업 표시줄 아이콘이 i-window, 16px에서 세 영역 구분(V3) | 충족 | `specs/v0.7/verify/ORDER-08/`의 아이콘 PNG 넷:<br>- `icon-app-exe.png`: release exe에서 뽑은 32px.<br>- `icon-app-exe-16.png`: release exe에서 뽑은 16px.<br>- `icon-setup-exe.png`: 설치 파일에서 뽑은 32px.<br>- `window-icon-small.png`: 실행 중 창의 아이콘(WM_GETICON/클래스 아이콘)이고, 작업 표시줄이 이 아이콘을 쓴다.<br>넷 모두 원본 i-window와 같은 그림이다. 중앙 픽셀 RGB 72,77,86이 원본 32px와 같다. 탐색기·작업 표시줄 화면 캡처는 데스크톱 입력이 막혀 아이콘 리소스 추출로 대신했다. checker C-16 PASS |
| 2 I-23 | 2줄 중간~3줄 중간 선택 → 토글 → 2줄 앞·3줄 뒤 일치도 범위 안(V3), VS Code 근거 | 충족 | `v3.json` `c2_scope.mid2_mid3`: 선택 "b1 cat b2\ncat c1" → `2/4`, 강조 줄 2·3(`c2-find-in-selection-lines.png`). `one_line`: 한 줄 안 선택은 그대로다("b1 ca" → `0/0`). `line2_to_line4_col1`: 끝이 4줄 열 1이면 4줄을 뺀다(`1/4`, 줄 2·3). 근거는 아래 "tauri가 고른 것" |
| 3 I-24 | 여러 줄 선택 → `Ctrl+F` → VS Code와 같은 값, 한 줄은 그 글(V3), VS Code 근거 | 충족 | `c3_seed`: 여러 줄 선택이면 입력란을 바꾸지 않는다(앞 값 유지). 한 줄 선택은 "b1 ca", 커서만 있으면 단어 "cat"이다(`c3-seed-multi-line.png`) |
| 4 I-25 | Licenses에 `tauri`·`windows` 등 Rust crate, `Cargo.lock` 배포 의존성과 맞음(V1·V3) | 충족 | `c8_about.licenses`: Rust 절이 있고 `tauri 2.12.5`, `windows 0.62.2`, `webview2-com 0.39.1`가 실려 있다(`c8-licenses.png`). V1: `tools/rust-licenses.test.mjs`가 목록 192 crate가 모두 `Cargo.lock`의 이름·버전과 같은지 본다 |
| 5 I-26 | 짧은 폴더 셋에 가로 스크롤바 없음, 너비를 바꿔도 같음(V3) | 충족 | `c5_sidebar_200`: scrollWidth 199 = clientWidth 199, 스크롤바 높이 0, 넘친 자식 없음. `c5_sidebar_320`: 319 = 319, 0. 캡처 `c5-sidebar-200.png`, `c5-sidebar-320.png` |
| 6 I-27 | 감춤 상태 글자 시작 x가 VS Code 대조 값, 보임 상태는 ORDER-03과 같음(V3) | 충족 | `c6_line_numbers`:<br>- 감춤: 편집 영역 왼쪽에서 50px = 줄 높이 24 + 26. `Ctrl+=` 뒤에는 51.59 = 25.59 + 26.<br>- 보임: content left 527, 첫 글자 532로 ORDER-03과 같다.<br>- 들여쓰기 선 간격 36은 그대로다.<br>캡처 `c6-line-numbers-shown.png`, `c6-line-numbers-hidden.png` |
| 7 정리 | `running-pid11268` 없음(V0, 8절: 삭제만 판정) | 충족 | PID 11268이 실행 중이 아님을 확인한 뒤 지웠다(`ls src-tauri/target/release | grep -c running` → 0). 허용 목록 추가는 auto mode가 Self-Modification으로 막았고, 우회하지 않았다. 사용자가 직접 고친다(core-leader 8절) |
| 8 빌드 | 설치 파일 새로 만듦(수정 시각), 0.7.0, 아이콘 i-window, `docs/BUILD.md` 새 결과(V1) | 충족 | `workbench-tauri_0.7.0_x64-setup.exe` 6,066,132 바이트, 2026-11-10 20:58:14, ProductVersion·FileVersion 0.7.0, 아이콘 i-window. 앱 exe 16,832,512 바이트. `docs/BUILD.md` 3·4·5·8장 |
| 9 테스트 | I-23·I-24 범위·입력란, I-25 목록 테스트, 기존 테스트 통과(V1) | 충족 | `src/editor/search.test.ts`(I-23·I-24), `tools/rust-licenses.test.mjs`(I-25), `src/shell/about.test.ts`·`app-menus.test.ts`(I-28·I-29). `npm.cmd run test` 256/256, `cargo test` 22 |
| 10 I-28 | 메뉴 줄 File·Edit·View·Help(V3), 탭 영역 ←·→와 단축키로 탭 이동(V3), 메뉴 테스트(V1) | 충족 | `c7_menus_tabs.bar`: 메뉴 줄 넷(`c7-menu-bar.png`). 탭: Go Back → deep.ts, Go Forward → second.ts, Ctrl+PageUp → deep.ts, Ctrl+PageDown → second.ts |
| 11 I-29 | Help에 About만, About에 머리·기술 정보·주요 목록·Copy·OK·전체 목록 버튼, Copy → 클립보드, 버튼 → Licenses(V3), 테스트(V1) | 충족 | `c7_menus_tabs.help` = ["About"](`c8-help-menu.png`). `c8_about`(`c8-about.png`):<br>- 머리: 아이콘 48px, workbench-tauri, Version 0.7.0.<br>- 기술 정보: Version 0.7.0, Date 2026-11-10, Host Tauri 2.12.5, WebView2 157.0.4341.42, OS Windows 11 x64.<br>- 주요 9개와 마지막 줄.<br>- 버튼 Copy·View All Licenses·OK, 포커스 OK.<br>Copy를 누르면 "Copied"가 뜨고 클립보드 글이 About 내용과 같다(`clipboardHasHeader` true). 측정 전 사용자 클립보드를 저장했고, 뒤에 되돌렸다(`clipboardRestored` true). View All Licenses를 누르면 About이 닫히고 Licenses가 열린다 |

## 검증
- typecheck 오류 0, `npm.cmd run test` 256 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 22 통과. 출력 파일은 leader가 만들었다(`%TEMP%\v07-C-15-*.txt`). checker C-15 검토 [PASS]. `Cargo.toml`·`Cargo.lock`·`package.json` 변화 없음.
- V3: `[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]` 순서로 했다.
  - debug exe, 임시 APPDATA·WebView 폴더, 창 1440×852, 100%, One Dark, CDP 합성 입력.
  - checker C-16 [MEASURED]: 9 PASS, 불일치 0.
- release 빌드는 두 번 다시 했다(K-12-R2가 최종, 57.8초). 커밋 `2fbb8de`와 같은 코드이고, 다른 것은 문서뿐이다. 빌드 전 workbench-tauri 프로세스는 없었다(사용자 앱 PID 20908은 손대지 않음).
- 결과 파일: `specs/v0.7/verify/ORDER-08/v3.json`, PNG(c1~c8 캡처, `window-icon-small`, `icon-setup-exe`, `icon-app-exe`, `icon-app-exe-16`).

## 지운 것·더한 것·하지 않은 것
- 더한 것:
  - `src-tauri/icons/icon.ico`·`icon.png`를 i-window로 바꿨다. `tauri.conf.json`에 `bundle.windows.nsis.installerIcon`을 더했다.
  - `tools/rust-licenses.mjs`와 생성 파일 `src/licenses/rust-dependencies.txt`.
  - About 창(`About.tsx`·`about.ts`).
  - Rust 명령 `write_clipboard_text`·`about_info`.
  - `vite.config.ts` `__BUILD_DATE__`.
  - 감춤 여백 변수(`metrics.ts`).
- 지운 것:
  - Go 메뉴.
  - Help의 View Dependency Licenses·File Bug Report...·Request Feature...·Repository와 그 URL 상수·`MenuItem.url` 분기.
  - `running-pid11268`.
- 바꾼 것: `.sidebar-list`에 `overflow-x: hidden`.
- 새 의존성 없음, `windows` feature 추가 없음, capability·CSP 변경 없음.
- 남은 위험:
  - 아이콘만 바꾸면 Cargo가 `build.rs`를 다시 돌리지 않아 exe에 옛 아이콘이 남는다(K-12 첫 빌드에서 생김). `build.rs` 수정 시각을 갱신해 해결했고, `docs/BUILD.md` 5장에 적었다.
  - Rust crate 넷(`alloc-stdlib`, `selectors`, `webview2-com`, `webview2-com-sys`)은 패키지에 라이선스 원문이 없다. 그래서 SPDX 식만 실었다.
  - About의 Date는 빌드한 날(로컬 날짜)이다.

## tauri가 고른 것
- 아이콘 변환 방법: 변환하지 않고 복사했다.
  - core `icons/opus/ico/i-window.ico`(16·24·32·48·256 포함) → `src-tauri/icons/icon.ico`.
  - `png/i-window-256.png` → `icon.png`.
  - 창·작업 표시줄 아이콘은 Tauri가 exe의 ico 리소스를 쓴다(`tauri-codegen` 기본). 설치 파일은 `installerIcon`으로 지정했다.
- I-23 VS Code 근거: 이 PC의 VS Code 1.117.0 번들(`%LOCALAPPDATA%\Programs\Microsoft VS Code\a44adf7f53\resources\app\out\vs\workbench\workbench.desktop.main.js`)을 읽었다. 공개 소스는 `src/vs/editor/contrib/find/browser/findController.ts`·`findModel.ts`다.
  - 토글을 켤 때 선택 끝이 열 1이고 여러 줄이면, 끝을 앞 줄 끝으로 당긴다. 그 결과 범위가 비면 버린다.
  - `research()`는 여러 줄 범위를 첫 줄 열 1부터 끝 줄 끝까지로 넓힌다. 한 줄 범위는 선택 그대로다.
  - 이 앱도 같은 두 단계로 했다. 측정값은 `2/4`, 한 줄 `0/0`, 끝이 열 1이면 그 줄을 뺀다.
- I-24 VS Code 근거: 같은 번들의 `getSelectionSearchString(editor, "single")`와 `FindController._start`, 기본 설정 `editor.find.seedSearchStringFromSelection: "always"`다.
  - 한 줄 선택은 그 글(524288자 미만)로 채운다. 커서만 있으면 커서 아래 단어로 채운다.
  - 여러 줄 선택이면 입력란을 바꾸지 않는다.
  - `Ctrl+H`는 입력란이 비어 있을 때만 채운다.
  - 이전 동작과 다른 점:
    - 여러 줄을 이어 붙이던 것을 없앴다.
    - 커서만 있을 때도 단어를 채운다.
    - 길이 한도를 100자에서 524288자로 바꿨다.
- I-27 VS Code 근거: 같은 번들의 `EditorLayoutInfoComputer.computeLayout`다. 계산식은 `contentLeft = glyphMarginWidth + lineNumbersWidth + decorationsWidth`다.
  - `lineNumbers: "off"`이면 줄 번호 폭이 0이다.
  - `glyphMargin`(기본 true)이 켜져 있으면 줄 높이만큼 더한다.
  - `lineDecorationsWidth`는 10이다. `folding`(기본 true)이 켜져 있고 `showFoldingControls`가 "mouseover"이면 16을 더한다.
  - 그래서 글자 시작은 줄 높이 + 26px이다. 기본 15px × 1.6에서 50px이다.
  - 10·16은 `src/spec/metrics.ts`의 이름 있는 변수로 두었다. 보임 상태는 그대로다.
- I-25 목록 만드는 방법: `node tools/rust-licenses.mjs`. 안에서 다음 명령을 돌린다.
  ```
  cargo metadata --format-version 1 --filter-platform x86_64-pc-windows-msvc --locked --manifest-path src-tauri/Cargo.toml
  ```
  - 앱 crate에서 normal 의존만 따라간다. build·dev 의존, proc-macro crate, proc-macro만 끌고 오는 crate는 뺀다.
  - 각 crate 폴더의 LICENSE·COPYING·NOTICE 원문을 같은 글끼리 묶어 싣는다. 결과는 192 crate다.
  - 새 도구 설치는 없다. Licenses 화면은 `src/licenses/*.txt`를 이미 모두 읽으므로 화면 코드는 바꾸지 않았다.
- I-26 원인: `.sidebar-list`는 `overflow-y: auto`만 있다. 이 경우 CSS 규칙상 `overflow-x`가 visible에서 auto로 바뀐다. 그래서 1px 넘침에도 가로 스크롤바가 생겼다.
  - 이름은 말줄임이라 가로로 볼 내용이 없다. 그래서 `overflow-x: hidden`으로 고쳤다.
  - 정확히 어느 자식이 넘쳤는지는 고친 뒤라 측정에서 다시 보지 못했다. 고친 뒤 측정에서 넘친 자식은 0개다.
- I-29: About 버튼은 "Copy", "View All Licenses", "OK"이고 기본 포커스는 OK다.
  - 주요 목록 9개: Tauri, Solid, CodeMirror, web-tree-sitter, markdown-it, Catppuccin Icons, Codicons, IBM Plex Sans, Lilex. 모두 앱 실행에 들어가는 틀·UI·편집기·구문·미리보기·아이콘·글꼴이다. 값은 Licenses 데이터에서 읽는다(글꼴 둘만 고정).
  - Date는 빌드 날짜다.
  - Copy는 Rust `write_clipboard_text`(CF_UNICODETEXT)로 쓴다. WebView 권한 창이 뜰 가능성을 없애려고 I-13처럼 Rust로 했다. 이미 켜진 `windows` feature만 쓴다.
  - 형식은 workbench-kit `src/core/about.ts`를 읽고 따랐고, 코드는 복사하지 않았다.
- 설치 파일: `D:\projects\workbench-tauri\src-tauri\target\release\bundle\nsis\workbench-tauri_0.7.0_x64-setup.exe`, 6,066,132 바이트(5.79 MiB), 2026-11-10 20:58:14.

## 바꾼 파일
- 커밋 `2fbb8de`:
  - `docs/BUILD.md`
  - `specs/v0.7/PLAN.md`, `specs/v0.7/PROGRESS.md`, `specs/v0.7/verify/ORDER-08/*`
  - `src-tauri/icons/icon.ico`·`icon.png`, `src-tauri/tauri.conf.json`, `src-tauri/src/clipboard.rs`·`lib.rs`
  - `src/app.css`
  - `src/editor/extensions.ts`·`indent-guides.ts`·`search.ts`·`search.test.ts`·`view-options.ts`
  - `src/licenses/rust-dependencies.txt`(새)
  - `src/shell/About.tsx`(새)·`about.ts`(새)·`about.test.ts`(새)·`AppMenu.tsx`·`app-menus.ts`·`app-menus.test.ts`·`menu.ts`
  - `src/spec/metrics.ts`
  - `tools/rust-licenses.mjs`(새)·`rust-licenses.test.mjs`(새)
  - `vite.config.ts`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- `.agents/checker-settings.json` 허용 목록 → 사용자(직접 고침, core-leader 8절).
- 메뉴 드롭다운이 열린 찾기 줄에 가릴 수 있는 건(ORDER-07 미정) → 사용자에게 묻는 중.
- 설치 프로그램 화면의 사이드바·헤더 그림(`sidebarImage`·`headerImage`)은 NSIS 기본 그대로다 → core-leader(카드 밖).

## BLOCKED
없음. 3.7 허용 목록 수정은 막혔지만, 8절에 따라 판정에서 빠졌다.
