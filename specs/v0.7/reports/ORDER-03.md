[DONE] ORDER-03 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| 1 I-5 | 세 단계 TS·하위 목록 MD에서 단계마다 세로선, 빈 줄에서도 이어짐(캡처) / 커서 블록 선만 진한 색(계산값) / Settings 끔 → 두 파일 모두 사라지고 다시 열어도 꺼짐 / 복사에 안 들어감(V3) | 충족 | `specs/v0.7/verify/ORDER-03/v3.json` c1_c4_c5_first: deep.ts 선 셋, 간격 36px(=4칸), 높이 168/120/72px로 블록 안 빈 줄(5줄)을 지나 이어짐. 커서 4줄 → 가장 안쪽 선만 `cm-indentGuide-active`(27,29,35), 나머지는 59,61,69. 커서 1줄 → 바깥 선이 활성. list.md 하위 목록 선 둘, 빈 줄 뒤 "still three"까지 이어짐(`c1-ts-guides-cursor-inner.png`, `c1-md-guides.png`). Settings 체크박스 끔이 파일에 `"editor_indent_guides": false`로 저장됨. 끔 → ts 0·md 0, 다시 열어도 0. 복사 글 = 문서(`tsCopyEqualsDoc` true) |
| 2 I-6 | 단축키 → 줄 번호 칸 사라지고 본문 왼쪽으로, 다시 → 돌아옴 / Settings 끔 → 감춘 채 시작 / 단축키 뒤 다시 열면 Settings 값 / 연계 / 편집 탭 둘 함께(V3) | 충족 | `Ctrl+Alt+L`: 거터 87px → 없음, 본문 left 527 → 440(`c2-line-numbers-off.png`). settings.json은 그대로(파일 없음 유지). `v3-extra.json` two_editors: 나눈 Pane의 list.md·deep.ts 편집기 둘이 함께 꺼지고 함께 켜짐(`c2-two-editors-numbers-off.png`). Settings `editor_line_numbers: false` → 거터 없이 시작. 단축키로 바꾼 뒤 다시 열면 보임(Settings 값). 줄 번호를 끈 뒤 Section 6을 누르면 미리보기 활성 블록 Section 6 |
| 3 I-7 | MD 켬 → 접힘·가로 스크롤 없음, 단축키 끔 → 한 줄·가로 스크롤(캡처) / 접힌 줄 번호 하나 / TS는 켬이어도 가로 스크롤, `Alt+Z` 변화 없음 / 다시 열면 Settings 값 / 연계(V3) | 충족 | list.md: 처음 `cm-lineWrapping`, 가로 스크롤 없음 → `Alt+Z` → 접지 않음, 가로 스크롤 있음 → 다시 `Alt+Z` → 접힘(`c3-md-wrap-on.png`, `c3-md-wrap-off.png`). 접힌 긴 문단에도 줄 번호는 하나다(줄 47개, 번호 칸 48개 = 줄 47 + 거터 폭을 재는 숨은 칸 1). deep.ts: `Alt+Z` 전후 모두 접지 않음·가로 스크롤(`c3-ts-long-line.png`), 마크다운 탭도 그대로. 단축키 뒤 다시 열면 접힘(Settings 값). 줄바꿈 끔/켬 뒤 Section 7·11 연계 맞음(`v3-extra.json` sync_after_toggles) |
| 4 I-8 | 처음 글줄 높이 = 글꼴 × 1.6 / 0.1씩 바꾸면 글꼴 × 배수, 줄 번호 높이 같음 / 1.0 아래·3.0 위 안 감(V1) / `Ctrl+=` 뒤에도 배수 유지 / 연계(V3) | 충족 | 처음: 15px × 1.6 = 24px, 줄 번호 24px. 배수 1.0/1.7/2.5/3.0 → 15/25.5/37.5/45px, 줄 번호 같음. 배수 2.0에서 `Ctrl+=`×2 → 17px·34px(배수 2). Settings 창: + 1.6→1.7, 2.9→3.0, 3.0에서 + → 3.0; 1.1→1.0, 1.0에서 − → 1.0. V1 `src/settings/model.test.ts`(범위·0.1 단위). 줄간격 2.4에서 Section 2·9 연계 맞음 |
| 5 I-10 | 처음 기호 없음 / 켜면 셋 함께, 끄면 함께 사라짐(캡처) / 켠 채 복사·저장에 안 들어감 / 다시 열면 Settings 값(V3) | 충족 | ws.ts: 처음 0개. 켬 → `·` 10, `→` 1, `↵` 3, 색 78,90,95(`--editor-invisible`, `c5-whitespace-on.png`). 끔 → 0. 복사 글 = 문서, 기호 없음. 한 글자 더하고 `Ctrl+S` → 파일은 원문 + "!"(기호 없음). 켠 채 다시 열면 그대로 보임 |
| 6 기본값 | 설정 없음과 v0.6·ORDER-02 설정 파일에서 I-5·I-8 말고는 편집 탭 화면이 ORDER-02 빌드와 같다(V3) | 충족 | ORDER-02 빌드(`b4d801c`)와 이 빌드를 같은 상태로 띄워 deep.ts·list.md 편집기 값을 비교했다(글꼴, 거터 폭, 본문 위치, 줄바꿈, 가로 스크롤, 기호, 색). `c6_noSettings_equalExceptGuidesAndLineHeight` true, `c6_o02File_equalExceptGuidesAndLineHeight` true. 다른 것은 안내선(0 → 3)과 줄 높이(24.27 = 15×1.618 → 24)뿐이다(`c6-*-o02.png`·`c6-*-new.png`) |
| 7 테스트 | 새 설정 다섯 읽기·검증(I-8 범위·단위), 단축키 둘(I-6 모든 편집 탭, I-7 마크다운만), 기존 테스트 통과(V1) | 충족 | `src/settings/model.test.ts`(다섯 읽기·검증, I-8 범위·단위·가장 가까운 값), `src/editor/indent-guides.test.ts`(단계·빈 줄·활성 블록, `toggleApplies` I-6/I-7 대상). `npm.cmd run test` 243/243 |

## 검증
- typecheck 오류 0, `npm.cmd run test` 243 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 22 통과(커밋 직전 1회, leader가 실행해 출력 파일로 넘김). checker C-05 검토 [PASS].
- V3: `[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`. debug exe와 비교용 ORDER-02 빌드 exe(scratchpad 사본), 임시 APPDATA·임시 WebView 데이터 폴더, 창 1440×852, 100%, One Dark(따로 적은 곳만 One Light). 입력은 CDP 합성 입력이다(SendInput이 전경 창 0x0으로 막힘). 복사는 CodeMirror copy 처리기에 따로 만든 DataTransfer를 넣어 확인했다(시스템 클립보드는 건드리지 않음). checker C-06 [MEASURED]: 1~6 모두 PASS.
- `v3.json`에서 측정 문제로 빈 값(첫 측정의 두 번째 `Ctrl+Alt+L`, 줄 번호를 끈 뒤 연계, 미리보기 없이 잰 I-8 연계)은 보충 측정 `v3-extra.json`으로 판정했다. 탭을 하나씩 열면 숨은 탭의 편집기가 DOM에 없어서, "편집 탭 둘"은 Pane을 둘로 나눠 쟀다.
- 결과 파일: `specs/v0.7/verify/ORDER-03/` `v3.json`, `v3-extra.json`, PNG 16(c1-md-guides, c1-one-dark-guides, c1-one-light-guides, c1-ts-guides-cursor-inner, c2-line-numbers-off, c2-two-editors-numbers-off, c3-md-wrap-off, c3-md-wrap-on, c3-ts-long-line, c5-whitespace-on, c6-noSettings-new, c6-noSettings-o02, c6-o02File-new, c6-o02File-o02, settings-editor, sync-after-toggles).
- 사용자 테스트 앱 PID 8744에는 입력·종료를 보내지 않았다. V3 뒤 8744가 실행 중이 아니어서 core-leader에게 [INFO]로 알렸다. tauri는 자기가 띄운 자식만 PID로 닫았다. 앱에 single-instance가 없고, Application 로그에 충돌 기록도 없다.

## 지운 것·더한 것·하지 않은 것
- 더한 것:
  - 설정 다섯과 Settings 행(체크박스, 0.1 단계 −/+).
  - `src/editor/view-options.ts`(줄 번호·줄바꿈·안내선·기호를 한 Compartment로, 임시 값, `eachView`), `indent-guides.ts`(CM layer), `whitespace.ts`.
  - 테마 토큰 `editor.indent_guide`·`editor.indent_guide_active`·`editor.invisible`, 메트릭 `editor.indent_guide.width`·`.active_width`(E-020), 키 둘.
- 의존성·Rust·`spec/` 변경 없음. CM `highlightWhitespace`는 쓰지 않았다(기호 색이 확장 안에 고정되어 테마 토큰을 쓸 수 없고, 줄 끝 기호가 없다).
- 하지 않은 것: 접힘(fold)·RTL 처리.
- 남은 위험:
  - 활성 블록은 커서 주변을 최대 25000줄까지 훑는다(Zed 한도와 같음). 아주 긴 파일에서 느려질 수 있다.
  - Settings 검색 `ui`에 Indent Guides가 걸린다("guides"에 ui가 들어 있다, 부분 문자열 검색).

## tauri가 고른 것
- I-6 단축키: `Ctrl+Alt+L`(`editor::ToggleLineNumbers`). 지금 키맵과 브라우저 키에서 비어 있고, L은 Line을 뜻한다. 편집 탭에 포커스가 있을 때만 동작한다(`Ctrl+=`와 같은 방식).
- I-7 단축키: `Alt+Z`(`editor::ToggleSoftWrap`, VS Code와 같음). 마크다운 편집 탭에 포커스가 있을 때만 동작한다.
- I-10 기호: 공백 `·`, 탭 `→`, 줄 끝 `↵`. 색은 편집 테마 토큰 `editor.invisible`.
- Settings Editor 행(Theme·Font Size 뒤, 이 순서; 설명은 VS Code 설정 설명 방식):
  - Line Height `editor_line_height` 1.6 — "Controls the line height as a multiple of the font size."
  - Line Numbers `editor_line_numbers` 켬 — "Controls the display of line numbers."
  - Word Wrap `editor_word_wrap` 켬 — "Controls whether long lines wrap in Markdown files. Code files never wrap."
  - Indent Guides `editor_indent_guides` 켬 — "Controls whether the editor should render indent guides."
  - Render Whitespace `editor_render_whitespace` 끔 — "Controls whether the editor renders spaces, tabs and line breaks as symbols."
- I-8 범위 밖 값: 파일 값이 1.0~3.0·0.1 단위가 아니면 무효로 보고 기본 1.6을 쓴다(다른 설정과 같은 방식). Settings 화면의 −/+·직접 입력은 가장 가까운 허용 값으로 맞춰 저장한다.
- I-5 Zed 대조:
  - 선 폭·색 규칙: `docs/refs/01-zed/01-LAYOUT.md` E-020(폭 1px, 활성 1px, `editor_indent_guide`/`_active`)·E-117. 색 기본값: `03-THEME-ICONS.md` T-26.9·T-26.10(`spec/zed-metrics.toml` theme.fallback).
  - "커서가 있는 블록" 판정: Zed 소스(14b7b0e) `crates/editor/src/indent_guides.rs` `find_active_indent_guide_indices`와 `crates/multi_buffer/src/multi_buffer.rs` `MultiBuffer::enclosing_indent`의 동작만 따랐다(코드 복사 없음).
    - 블록을 여는 줄은 다음 깊은 줄의 블록이다.
    - 빈 줄은 위·아래 중 깊은 쪽을 따른다.
    - 깊이 0이면 활성 선이 없다.
  - Zed의 "커서가 문서 마지막 줄이면 활성 없음"은 따르지 않았다.
  - 화면 대조는 하지 않았다(Zed 앱을 띄워 같은 파일로 비교하지 않음).

## 바꾼 파일
- 커밋 `9b11900`: `specs/v0.7/PLAN.md`(Phase 3 카드 표), `specs/v0.7/PROGRESS.md`, `specs/v0.7/verify/ORDER-03/*`, `src/App.tsx`, `src/editor/extensions.ts`, `src/editor/indent-guides.ts`(새)·`indent-guides.test.ts`(새)·`view-options.ts`(새)·`whitespace.ts`(새), `src/keymap/builtin.ts`, `src/settings/Settings.tsx`·`load.ts`·`model.ts`·`model.test.ts`·`settings.css`, `src/spec/metrics.ts`, `src/theme/theme.ts`·`theme.test.ts`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- One 테마(One Dark·One Light) 파일에 `editor.indent_guide`·`editor.indent_guide_active` 키가 없다. 그래서 스펙 fallback(#3b3d45/#1b1d23, 다크 값)이 쓰인다. One Light에서는 선이 거의 검게 진하고, 활성 선과 나머지 선의 차이가 작다(`c1-one-light-guides.png`). One Dark에서는 활성 선(#1b1d23)이 배경보다 어두운 선으로 보인다(`c1-one-dark-guides.png`). 스펙에 라이트 값이 없어 추정하지 않았다. 라이트 값을 정할지 → core-leader·사용자(V4).
- 사용자 테스트 앱 PID 8744가 V3 뒤 실행 중이 아님(위 [INFO]) → core-leader 확인.

## BLOCKED
- 없음
