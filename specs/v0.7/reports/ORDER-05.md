[BLOCKED] ORDER-05 tauri

막힌 것은 완료 기준 4(v0.6 정리 두 가지)뿐이다. auto mode가 막았고 우회하지 않았다. 나머지 1·2·3·3A·5·6은 충족했다.

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| 1 I-11 | 범위 안 둘·밖 셋 문서에서 범위 선택 → 토글 → 입력 → 강조 둘, `x/2`(V3 캡처). 토글 끔 → 강조 다섯(V3). VS Code 대조 근거 | 충족 | `specs/v0.7/verify/ORDER-05/v3-find.json`: find.ts("cat a"~"cat e"), 2~3줄 선택 → Ctrl+F → Find in Selection 켬 → "cat". 결과: `1/2`, 범위 밖 일치 강조 0, 범위 안 둘(현재 일치는 선택 색, 나머지 하나는 일치 색). 끔 → `2/5`, 강조 다섯(`c1-find-in-selection-on.png`, `-off.png`). VS Code 근거는 아래 "tauri가 고른 것" |
| 2 I-12 | 돋보기에 마우스를 올리면 "Find"(V3 캡처) | 충족 | `v3.json` c2_tooltip: 툴팁 `["Find"]`, aria-label "Find"(`c2-find-tooltip.png`) |
| 3 I-13 | 새 WebView 데이터 폴더로 연 앱에서 메뉴 Edit → Paste → 권한 창 없이 클립보드 글(한국어·여러 줄) / `Ctrl+V`와 같은 결과(V3) | 충족 | 새 WebView 데이터 폴더, 클립보드 "한국어 첫 줄\n둘째 줄 English". 메뉴 Paste 뒤 1.2초 안에 편집 탭에 그대로 들어감(`menuDoc`). 네이티브 붙여넣기(CDP `paste` 편집 명령)로 들어간 글과 같다(`after`). 찾기 입력란에서 메뉴 Paste → "한국어 첫 줄 둘째 줄 English"(한 줄, `Ctrl+V`와 같음). `c3-menu-paste.png`, `c3-menu-paste-find-input.png`. 측정 한계: 네이티브 권한 창은 CDP 캡처에 찍히지 않는다. 대신 새 경로가 WebView 클립보드 API를 쓰지 않고, 메뉴 Paste가 기다림 없이 끝난 것을 근거로 삼았다 |
| 3A I-9 맞추기 | 문단 외부 26 → 문단 사이만 26, 문단 뒤 제목·코드 블록·인용·목록 블록 앞 16 그대로(V3 계산값). 기본값에서 ORDER-04 빌드와 미리보기 간격이 같다(V3) | 충족 | `v3.json` c3a_gap26: P>P 26, P>H2 16, P>PRE 16, P>BLOCKQUOTE 16, P>UL 16, P>TABLE 16. `c3a_default_equal` true(ORDER-04 빌드 `b808eec`와 블록 사이 간격 12개가 같다). `c3a-*.png` |
| 4 정리 | `checker-settings.json`에 네 명령, 쓰기 명령 없음(`git diff`). `running-pid11268` 파일 없음(V0) | BLOCKED | 허용 목록: coder가 고치려 했으나 auto mode가 Self-Modification으로 막았다. 파일은 그대로다(`git diff .agents/checker-settings.json` 0줄). 옛 exe: PID 11268이 실행 중이 아님을 확인하고 leader가 지우려 했으나 auto mode가 Irreversible Local Destruction으로 막았다. 파일이 남아 있다(16,972,800 바이트) |
| 5 빌드 | `workbench-tauri_0.7.0_x64-setup.exe`, 제품 버전 0.7.0, `docs/BUILD.md` 85·86행 0.7.0(V1) | 충족 | `src-tauri\target\release\bundle\nsis\workbench-tauri_0.7.0_x64-setup.exe` 6,020,919 바이트, ProductVersion·FileVersion 0.7.0. 앱 exe 16,742,912 바이트, 0.7.0. `docs/BUILD.md` 4장 두 행·표 위 문장, 5장 걸린 시간 한 줄 |
| 6 테스트 | I-11 강조 범위, I-13 붙여넣기 경로에 테스트, 기존 테스트 통과(V1) | 충족 | `src/editor/search.test.ts`(I-11 `scopedMatchRanges`: 범위 없음·켬·잘린 일치·끔), `src/editor/extensions.test.ts`(I-13 `pasteClipboard`: 한국어 여러 줄, 읽는 사이 상태 변경·읽기 전용 건너뜀, 입력란 대체·한 줄, 읽기 실패). `npm.cmd run test` 246/246 |

## 검증
- typecheck 오류 0, `npm.cmd run test` 246 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 22 통과(커밋 직전 1회, leader가 실행해 출력 파일로 넘김). checker C-09 검토 [PASS]. `Cargo.lock` 변화 없음.
- V3: `[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`. debug exe와 비교용 ORDER-04 빌드 exe(scratchpad 사본), 임시 APPDATA·임시 WebView 데이터 폴더(I-13은 새 폴더), 창 1440×852, 100%, One Dark, CDP 합성 입력. checker C-10 [MEASURED]: 1·2·3·3A·5 PASS, 4 BLOCKED.
- I-13 측정 때문에 시스템 클립보드를 바꿨다. 측정 전 사용자 클립보드(글만 있었음, 46자)를 파일로 저장했고, 끝난 뒤 되돌렸다(`clipboardRestored` true, 46자 확인).
- I-11 첫 측정은 Ctrl+F가 선택 글을 찾기 입력란에 미리 채우는 기존 동작 때문에 입력이 섞였다. 입력란을 전체 선택한 뒤 다시 쟀다(`v3-find.json`).
- release 빌드(`npm.cmd run tauri build`, 62.3초)는 커밋 `8837af1`과 같은 코드로 했다(그 커밋과 다른 것은 문서뿐). 빌드 전 workbench-tauri 프로세스는 없었다(사용자 앱이 exe를 잠그지 않음).
- 결과 파일: `specs/v0.7/verify/ORDER-05/` `v3.json`, `v3-find.json`, PNG 8(c1-find-in-selection-on, c1-find-in-selection-off, c2-find-tooltip, c3-menu-paste, c3-menu-paste-find-input, c3a-default-o04, c3a-default-new, c3a-paragraph-gap-26).

## 지운 것·더한 것·하지 않은 것
- 더한 것:
  - `src-tauri/src/clipboard.rs`(Rust 명령 `read_clipboard_text`).
  - `windows` crate feature 셋(`Win32_System_DataExchange`·`Win32_System_Memory`·`Win32_System_Ole`).
  - `scopedMatchRanges`와 `.cm-find-in-selection` 규칙, I-9의 `p:has(+ p)`·`li p` 규칙.
- 새 crate·npm 패키지 없음. Licenses 화면 변경 없음. capability·CSP 변경 없음. 앱 아이콘 그대로.
- 지운 것: 메뉴 Paste의 `navigator.clipboard.readText` 경로, 붙여넣기 전 `view.focus()`.
- 하지 않은 것:
  - VS Code는 여러 줄 선택 범위를 줄 단위(시작 열 1 ~ 끝 줄 끝)로 넓히는데, 이 카드 범위 밖이라 지금 범위(선택 그대로)를 유지했다.
  - Ctrl+F가 여러 줄 선택을 찾기 입력란에 이어 붙여 채우는 기존 동작("cat b"+"cat c" → "cat bcat c")은 그대로다(찾기 줄의 다른 동작은 바꾸지 않음).
- 남은 위험:
  - 클립보드를 다른 앱이 열고 있으면 10ms 간격으로 5번 다시 시도한 뒤 오류 알림이 뜬다.
  - I-9 규칙은 `:has()`를 쓴다(WebView2 Chromium 지원).

## tauri가 고른 것
- I-13 방법: 메뉴 Paste가 Rust 명령으로 Windows 클립보드 글(CF_UNICODETEXT)을 읽는다. 이미 직접 의존 중인 `windows` crate(=0.62.2, v0.5부터 직접 의존)에 feature 셋만 더했다(I-13 사전 허락 범위). 새로 더한 의존성은 없어서 Licenses 화면은 고치지 않았다. 다만 `windows` crate는 지금 Licenses 화면(`src/licenses/`)에 따로 실려 있지 않다(이번 카드 전부터 그랬다).
  - 편집 탭에는 CodeMirror `paste` 이벤트로 넣는다(`Ctrl+V`와 같은 처리).
  - 찾기 입력란 등에는 선택을 대체한다. 여러 줄은 한 칸으로 바꾼다.
  - 원인은 이전 경로가 `navigator.clipboard.readText`를 써서 WebView2가 첫 사용 때 권한을 물은 것이다.
- I-11 VS Code 근거: 이 PC의 VS Code 1.117.0 번들(`%LOCALAPPDATA%\Programs\Microsoft VS Code\a44adf7f53\resources\app\out\vs\workbench\workbench.desktop.main.js`). 공개 소스 위치는 `microsoft/vscode` `src/vs/editor/contrib/find/browser/findModel.ts` `research()`와 `findDecorations.ts` `set()`이다. Find in Selection이 켜지면 범위 안 일치만 구하고 강조한다. VS Code 앱을 띄워 화면으로 대조하지는 않았다.
- 허용 목록에 더하려던 명령(BLOCKED, 지금 파일의 명령 전체 일치 형식): `command(git status -s)`, `command(git grep)`, `command(Test-Path)`, `command(Get-ChildItem)`, `command(Get-ChildItem -Path "D:\projects\workbench-tauri\specs\v0.7\verify\ORDER-02")`. 마지막 줄은 v0.7에서 checker가 실제로 멈춘 명령이다. 전체 일치라 `git grep`·`Test-Path`·`Get-ChildItem`은 인자 없는 형태만 통과한다. 접두 일치 문법은 확인하지 않았다.
- 설치 파일: `D:\projects\workbench-tauri\src-tauri\target\release\bundle\nsis\workbench-tauri_0.7.0_x64-setup.exe`, 6,020,919 바이트(5.74 MiB).

## 바꾼 파일
- 커밋 `8837af1`: `docs/BUILD.md`, `specs/v0.7/PLAN.md`(Phase 5 행·카드 표), `specs/v0.7/PROGRESS.md`, `specs/v0.7/verify/ORDER-05/*`, `src-tauri/Cargo.toml`, `src-tauri/src/clipboard.rs`(새)·`lib.rs`, `src/app.css`, `src/editor/extensions.ts`·`extensions.test.ts`·`search.ts`·`search.test.ts`, `src/shell/Pane.tsx`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- checker 허용 목록 추가: 사용자가 `.agents/checker-settings.json`에 위 줄을 직접 넣거나, 이 수정을 허용하는 규칙을 주어야 한다 → 사용자.
- `src-tauri\target\release\workbench-tauri.exe.running-pid11268` 삭제: 사용자가 직접 지우거나 삭제를 허용해야 한다(PID 11268은 실행 중이 아님) → 사용자.
- VS Code의 여러 줄 선택 범위 줄 단위 확장, Ctrl+F의 여러 줄 선택 미리 채우기를 맞출지 → 사용자(카드 밖).
- Licenses 화면에 Rust crate(`windows` 등)가 따로 실려 있지 않다. 넣을지 → core-leader(카드 밖, 이번에 생긴 일은 아님).

## BLOCKED
- 원인: 완료 기준 4의 두 작업을 auto mode 분류기가 막았다(허용 목록 수정 = Self-Modification, 옛 exe 삭제 = Irreversible Local Destruction).
- 필요한 것: 사용자가 직접 하거나, 두 작업을 허용하는 권한 규칙.
