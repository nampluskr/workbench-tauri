[DONE] ORDER-02 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| 1 I-3 | UI One Dark·편집 One Light·미리보기 One Dark → 탭 바(편집 탭 이름 칸 포함)·Sidebar 어둡고, 편집 본문·경로 줄·찾기 줄 밝고, 미리보기 본문 어둡다(V3 계산값·캡처) | 충족 | `specs/v0.7/verify/ORDER-02/v3.json` c1_mixed: Sidebar·탭 바 47,52,62, 활성 탭(편집 탭 이름 칸) 40,44,51, 상태 바 59,65,77(One Dark). 편집 본문·거터·경로 줄 배경 250,250,250, 글자 36,37,41, 구문 강조 One Light. 미리보기 배경 40,44,51, 코드 블록 구문 강조 One Dark. 경로 줄·찾기 줄 안에 보이는 요소는 모두 One Light 색: 글자 36,37,41, 아이콘 88,88,90, 강조 92,120,226(`v3-inner.json`). 캡처 `c1-ui-dark-editor-light-preview-dark.png`, `c1-editor-toolbar-findbar.png` |
| 2 I-3 | Settings에서 편집 테마만 바꾸면 UI·미리보기 색은 그대로(V3) | 충족 | c6_c2_settings: Settings 창 Editor Theme 드롭다운에서 Gruvbox Dark를 골랐다. 파일은 `{"theme":"One Dark","editor_theme":"Gruvbox Dark","preview_theme":"One Dark"}`. 전후 비교: `uiSame` true, `previewSame` true, `editorChanged` true(편집 배경 250,250,250 → 40,40,40). `c2-editor-gruvbox.png` |
| 3 I-3 | 앱을 다시 열면 세 테마가 그대로(V3) | 충족 | c3_restart: 파일 세 값 그대로. 색은 다시 열기 전과 같다. 다른 것은 제목 줄 하나뿐이다(재기 전에는 Settings 창에 포커스가 있어 본창 제목 줄이 inactive 색이었다) |
| 4 I-3 | 테마 선택 창에서 One Light → 셋 모두 One Light(V3) | 충족 | c4_selector: 미리 보기 중(Gruvbox Light)에는 셋 모두 그 테마. Esc를 누르면 세 색과 파일이 원래대로 돌아온다. One Light를 확정하면 파일이 세 키 모두 One Light이고, 화면은 v0.6식 `theme: One Light` 하나로 연 화면과 같다(찾기 줄이 닫힌 것만 다름). `c4-selector-one-light.png` |
| 5 I-3 | 설정 없는 처음 상태 색이 v0.6과 같다. v0.6 설정 파일(`theme`만)로 열어도 셋 모두 그 테마(V3) | 충족 | 커밋 `104ce8a`(테마 하나)를 따로 빌드한 base exe와 같은 상태의 색 덤프를 비교했다. `c5_noSettings_equal` true(One Dark), `c5_v06ThemeOnly_equal` true(`{"theme":"One Light"}` → 셋 모두 One Light). `c5-*-base.png`·`c5-*-new.png` |
| 6 I-4 | UI(Theme·Icon Theme·Font Size) / Editor(Theme·Font Size) / Preview(Theme·Font Size) 순서, 검색 `preview` → 미리보기 테마·글꼴 크기만(V3) | 충족 | c6_c2_settings.all: 행 일곱이 그 순서다. 검색 `preview` → Preview Theme·Preview Font Size, `editor` → Editor 둘(`c6-settings.png`, `c6-search-preview.png`) |
| 8 AGENTS | 레포 규칙 10·12줄이 v0.7 구성·core v0.7 ITEMS를 가리키고 다른 레포 규칙 줄은 그대로(V0) | 충족 | `git diff`(커밋 `b4d801c`의 AGENTS.md): 2줄만 바뀌었다. 10줄은 "v0.7 구성은 v0.6 그대로다(core `specs/v0.7/PLAN.md` 운영): … `tauri-coder` Claude Code Sonnet 5.5 high … (사용자 2026-11-10)", 12줄은 "workbench-core v0.7 ITEMS(I-1~I-13)" |
| 7 테스트 | 테마 설정 읽기(셋, v0.6 파일의 `theme` 하나에서 셋으로), 선택 창이 셋을 함께 바꾸는 것에 테스트, 기존 테스트 통과(V1) | 충족 | `src/settings/model.test.ts`(셋 읽기, v0.6 파일, 잘못된 값은 `theme`으로, 한 번에 쓰기, 검색), `src/theme/selector.test.ts`(셋 함께 미리 보기·저장, 취소 시 복원), `src/theme/theme.test.ts`(범위 CSS). `npm.cmd run test` 239/239 |

## 검증
- typecheck 오류 0, `npm.cmd run test` 239 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 22 통과(커밋 직전 1회, 출력은 leader가 실행해 checker에 파일로 넘겼다). checker C-03 검토 [PASS].
- V3: `[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`. debug exe, 비교용 base exe(`104ce8a`를 scratch에 풀고, 무시 폴더의 테마·아이콘·문법 복사본도 복사해 빌드), 임시 APPDATA·임시 WebView 데이터 폴더, 창 1440×852, 100%. 상태마다 편집 탭과 옆 미리보기 탭을 띄우고, 편집 탭에 찾기 줄을 연 상태에서 쟀다. 입력은 CDP 합성 입력이다(SendInput이 "foreground window is 0x0"로 막힘, ORDER-01과 같음). checker C-04 [MEASURED]: 1~6 모두 PASS.
- 결과 파일: `specs/v0.7/verify/ORDER-02/` `v3.json`, `v3-inner.json`, `c1-ui-dark-editor-light-preview-dark.png`, `c1-editor-toolbar-findbar.png`, `c2-editor-gruvbox.png`, `c4-selector-one-light.png`, `c5-noSettings-base.png`, `c5-noSettings-new.png`, `c5-v06ThemeOnly-base.png`, `c5-v06ThemeOnly-new.png`, `c6-settings.png`, `c6-search-preview.png`.

## 지운 것·더한 것·하지 않은 것
- 더한 것:
  - 설정 키 `editor_theme`·`preview_theme`. 없거나 틀리면 그 파일의 `theme`을 쓴다.
  - 범위별 변수 묶음: UI는 `:root`, 편집은 `.cm-editor, .editor-toolbar`, 미리보기는 `.markdown-preview`.
  - 범위를 좁힌 구문 강조 클래스와 `previewSyntaxKeys`.
  - 한 번에 여러 키를 쓰는 `saveSettings`, Settings Editor·Preview Theme 행.
- 의존성·Rust·`spec/` 변경 없음. 아이콘 테마는 하나 그대로이고, 선택 창 UI도 그대로다.
- 하지 않은 것: 미리보기가 열린 채 테마가 바뀔 때 코드 블록을 다시 칠하기(v0.6과 같이 클래스 CSS만 새 테마로 바뀐다).
- 남은 위험: `.editor-toolbar` 요소 자신의 `color`는 UI 값을 물려받는다. 지금 그 안에 보이는 요소는 모두 자기 색을 정해 편집 테마 색으로 보인다. 다만 나중에 경로 줄에 `color`를 물려받는 요소를 더하면 UI 색이 된다.

## tauri가 고른 것
- Settings 설명 문구(VS Code 설정 설명 방식):
  - UI Theme: "Specifies the color theme used in the workbench."(ORDER-01 그대로)
  - Editor Theme: "Specifies the color theme used in the editor."
  - Preview Theme: "Specifies the color theme used in the Markdown preview."
- 새 설정 키 이름: `editor_theme`, `preview_theme`(UI는 지금 `theme` 그대로 — v0.6 파일과 테마 선택 창이 쓰던 키).
- 영역 경계:
  - 편집 탭 안 찾기 줄(입력란 포함)과 경로 줄은 편집 테마.
  - 미리보기 탭 빈 영역(패딩 포함 `.markdown-preview` 전체)은 미리보기 테마.
  - 스크롤바는 자기 탭의 테마(편집 `.cm-scroller`, 미리보기 `.markdown-preview`).
  - 편집·미리보기 위에 뜨는 메뉴·툴팁·컨텍스트 메뉴·토스트·선택 창은 UI 테마(body 쪽에 그려짐).
  - 탭이 없는 Pane 빈 영역, 탭 바(활성 탭 배경 포함), 분할선은 UI 테마.
  - Search·Keymap·Extensions·Licenses 탭 본문은 편집·미리보기 탭이 아니라 UI 테마.
  - 제목 줄·네이티브 최대화 버튼 색, 툴팁 그림자용 `data-appearance`는 UI 테마.
- 선택 창의 "현재 값" 표시는 `theme`(UI 테마)이다.

## 바꾼 파일
- 커밋 `b4d801c`: `AGENTS.md`(레포 규칙 10·12줄), `specs/v0.7/PLAN.md`(Phase 2 카드 표), `specs/v0.7/PROGRESS.md`, `specs/v0.7/verify/ORDER-02/*`, `src/settings/Settings.tsx`·`load.ts`·`model.ts`·`model.test.ts`, `src/shell/markdown-preview.ts`, `src/theme/apply.ts`·`commands.ts`·`selector.ts`·`selector.test.ts`·`theme.ts`·`theme.test.ts`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- 없음

## BLOCKED
- 없음
