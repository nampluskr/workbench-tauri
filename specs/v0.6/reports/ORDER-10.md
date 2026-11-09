[DONE] ORDER-10 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| I-18 | 상태 바 돋보기 오른쪽에 codicon `markdown` 버튼, 툴팁 "Lock Preview" | 충족 | `specs/v0.6/verify/ORDER-10/first.json` statusButtons ["Close Left Dock","Search","Lock Preview"](Sidebar 버튼은 Sidebar가 열려 있어 안 보임), tooltip ["Lock Preview"], `first-status-tooltip.png`. 아이콘은 `src/assets/codicons/markdown.svg`(@vscode/codicons 0.0.46-24 그대로 복사, ORDER-09 방식) |
| I-18 | 누를 때마다 켜짐·꺼짐, 켜짐 표시는 Left Dock 버튼과 같은 방식 | 충족 | 같은 `IconButton` `toggled`(aria-pressed) 사용(`src/shell/status.ts`). toggleOn: pressed false → true, reopen-on에서 끄기: true → false. `first-lock-on.png` |
| I-18 | 아이콘 라이선스(codicon, CC BY 4.0)가 Licenses 화면에 | 충족 | `first.json` licenses: markdown.svg NOTICE 줄 있음, Attribution 4.0 International 본문 있음 |
| I-18 | 켜고 md 열기 → 미리보기 탭만, 끄고 열기 → 편집 탭, md 아닌 파일은 켜져 있어도 편집 탭 | 충족 | offMd: other.md → 편집 탭 "other.md"; onMd: notes.md → "Preview notes.md"만(편집 탭 없음); onTs: main.ts → 편집 탭 |
| I-18 | md 편집 탭을 연 채로 켜도 그 탭은 편집 탭 | 충족 | toggleOn 뒤 탭 ["other.md"] 그대로(편집 탭) |
| I-18 | 미리보기 탭에서 `Ctrl-Shift-V` → 같은 파일 편집 탭이 더 열린다 | 충족 | ctrlShiftV.again: ["other.md","Preview notes.md","notes.md","main.ts"], 활성 notes.md, 미리보기 그대로. (ctrlShiftV.first 줄은 leader 클릭이 미리보기 탭을 고르지 못해 무효) |
| I-18 | 켠 채 다시 열면 켜짐, 끈 채 다시 열면 꺼짐 | 충족 | `reopen-on.json` lockAtStart pressed "true", `reopen-off.json` pressed "false". 저장은 `state.json` `lock_preview`(없거나 잘못된 값이면 꺼짐) |
| I-18 | 편집·미리보기를 나란히 두고 편집에서 옮기면 미리보기가 따라가고 위치 표시가 v0.5와 같다, 미리보기에서 옮길 때도 같다(V1 기존 테스트 통과) | 충족 | 자동 미리보기(왼쪽)와 Ctrl-Shift-V로 더 연 편집 탭(오른쪽 분할): 편집에서 "## Section 3" 클릭 → 미리보기 active-block "Section 3"(`first-sync-editor-to-preview.png`); 미리보기 "Section 2" 클릭 → 편집 활성 줄 "## Section 2"(`first-sync-preview-to-editor.png`). 같은 Doc 공유 경로 재사용, 기존 마크다운 테스트 통과(C-14 npm test 222) |

## 검증
- coder K-12: typecheck, node 테스트 40(열기 분기, 미리보기 유지·편집 탭 선택, 상태 왕복·옛 값, 기존 마크다운·키맵·메뉴).
- checker C-14(커밋 직전 전체 1회): `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 222 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 21 통과. 코드 검토·V3 판정 PASS, 지적 없음.
- V3(`[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`): debug exe, 임시 APPDATA·임시 WebView 데이터 폴더, One Light, 임시 폴더(notes.md·other.md·main.ts). SendInput, CDP. 세션 셋(첫 실행, 켠 채 다시 열기, 끈 채 다시 열기). 시스템 클립보드는 건드리지 않았다.
- 결과 파일: `specs/v0.6/verify/ORDER-10/` `first.json`, `reopen-on.json`, `reopen-off.json`, `first-status-tooltip.png`, `first-lock-on.png`, `first-sync-editor-to-preview.png`, `first-sync-preview-to-editor.png`.

## 지운 것·더한 것·하지 않은 것 (D-8)
- 더한 것: codicon `markdown.svg`(NOTICE 한 줄, CC BY 4.0 본문은 ORDER-09 것 재사용), 상태 바 Lock Preview 버튼, `state.json` `lock_preview`, 공통 openFile 한 곳의 분기(.md/.markdown), 미리보기에서 편집 탭을 더 여는 `openPreviewSource`. 새 의존성 없음.
- 바꾼 것(leader 결정): 미리보기 탭의 `Ctrl-Shift-V`와 탭 메뉴 Show Source(ORDER-05에서 Zed `markdown::CloseAndReturnToEditor` = 미리보기를 닫고 편집 탭으로)를 R-18대로 "같은 파일 편집 탭을 더 열기(있으면 선택), 미리보기 유지"로 바꿨다. R-18이 나중 요구이고, Show Source 메뉴의 단축키 표시(`Ctrl-Shift-V`)와 동작을 맞추려고 둘 다 바꿨다. action 이름은 그대로.
- 하지 않은 것: HTML 등 다른 형식 미리보기 버튼, 경로 줄 눈 아이콘·`Ctrl-K V` 변경.
- 남은 위험: 잠금이 켜진 채 같은 파일의 편집 탭이 이미 있으면 새 미리보기 대신 그 편집 탭을 고른다(다른 Pane 포함, coder 결정).

## 바꾼 파일
- 코드 커밋 `1e56cb2`: `src/shell/status.ts`·`status.test.ts`, `src/shell/Icon.tsx`, `src/shell/Pane.tsx`, `src/App.tsx`, `src/workspace/context.ts`, `src/workspace/state-file.ts`, `src/workspace/store.ts`, `src/workspace/tabs.ts`·`tabs.test.ts`, `src/workspace/workspace.test.ts`, `src/assets/codicons/markdown.svg`(새), `src/assets/codicons/NOTICE.txt`
- 기록 커밋 `b8a7a3e`: `specs/v0.6/PROGRESS.md`(Phase 10 절), `specs/v0.6/verify/ORDER-10/`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정 (v0.6 전체에서 아직 풀리지 않은 것)
이번 카드:
- 미리보기 탭 `Ctrl-Shift-V`·Show Source 동작을 R-18대로 바꾼 leader 결정(위 "바꾼 것")을 받아들일지 → core-leader

앞 카드에서 남은 것:
- **ORDER-09 BLOCKED — `@codemirror/search@6.7.2` 추가 승인**(MIT, unpacked 137,655바이트, 하위 의존성은 이미 있는 crelt·view·state뿐; 직접 구현은 TS 약 400~600줄이라 하지 않음). 승인되면 찾기·바꾸기 창, `Ctrl+F`·`Ctrl+H`·`F3`·`Alt+C/W/R`·바꾸기·`Alt+Enter`·`Ctrl+D`·`Ctrl+Shift+L`·`Ctrl+K Ctrl+D`, Edit 메뉴 세 항목·찾기 아이콘 활성, I-19 편집 영역 `Ctrl+F` 확인, workbench-kit 비교 캡처(할 일 목록은 `reports/ORDER-09.md` BLOCKED 절). → 사용자
- ORDER-09 메뉴 Edit → Paste의 WebView 클립보드 권한 창: (1) `tauri-plugin-clipboard-manager` 추가, (2) 처음 메뉴 Paste 때 권한 창을 받아들임(지금 상태), (3) 메뉴 Paste 비활성. → 사용자
- ORDER-09 workbench-kit을 띄워 비교하지 않았다(소스·VS Code 기본 동작으로 비교). → 사용자
- ORDER-05·ORDER-07 Zed 비교 캡처: I-9 탭 메뉴(파일·미리보기·그 밖의 탭)와 탭 종류별 차이, I-12 이 PC Zed 탐색 기록 동작, I-13 트리 고정 줄·고정 줄 클릭·폴더 여럿. 이 PC Zed가 사용자 것으로 떠 있어 쓰지 않았다(문서·참고 캡처·Zed 소스로 구현). → 사용자(Zed를 닫은 뒤)
- ORDER-05 사용자 Zed 최근 작업 영역 기록에 'o5'(임시 폴더)가 남았을 수 있다(Zed CLI 시도 중 사용자 Zed에 창 두 개가 열려 leader가 그 창만 닫음). 고치지 않았다. → 사용자
- ORDER-05 V3 중 WebView 클립보드 읽기 권한 창이 한 번 떴다(leader 스크립트, 그때는 사용자 앱과 같은 WebView 데이터 폴더 `%LOCALAPPDATA%\dev.workbench.tauri`). 누르지 않았고 거부로 끝났다. 그 결정이 프로필에 남았는지는 확인하지 않았다. 이후 V3는 임시 WebView 폴더를 썼다. → 사용자
- ORDER-03 사용자가 2026-11-09 22:54에 띄운 release 앱(PID 11268)이 exe를 잠가, leader가 잠긴 exe 이름을 `src-tauri\target\release\workbench-tauri.exe.running-pid11268`로 바꾸고 빌드했다. 그 앱은 WebView2 자식 프로세스가 없는 상태였다(ORDER-02 V3에서 leader가 끝낸 고아 WebView2 PID 8116의 부모는 47252로 11268이 아니었지만 확실하지 않다). 그 앱 창의 저장하지 않은 편집이 사라졌을 수 있다. 앱을 닫은 뒤 바꿔 둔 exe 파일을 지울지 → 사용자
- ORDER-09 V3 중 메뉴 Copy 시험이 시스템 클립보드를 "const a = 1;"로 덮어썼다(ORDER-10부터는 클립보드를 건드리지 않음). → 기록만
- checker 허용 목록(`.agents/checker-settings.json`)에 `git grep`(ORDER-01-R2에서 정한 고정 형태)·`git diff`·`Test-Path`가 없어 checker가 허가 창에서 멈췄다(ORDER-02·ORDER-03). 이후 카드에 diff 파일과 "허용 밖 명령 금지"를 적어 피했다. auto mode가 leader·writer의 설정 변경을 막는다. → 사용자
- ORDER-03 About 제목줄의 Zed Headline 글자 크기·굵기가 `spec/zed-metrics.toml`에 없어 `font: inherit`로 두었다. → core-leader
- ORDER-06 Sidebar 검색 입력란 전용 spec 값이 없어 Extensions 검색(X-46) 값을 썼다. Zed Sidebar 값으로 spec에 넣을지 → core-leader
- ORDER-01-R1 루트 `INTENT.md`를 core v0.6에 맞게 고친 문장(이 레포의 기준점)을 사용자가 확인해야 한다. → 사용자
- 버전 종료(PROGRESS "버전 종료" 절)와 V4 사용자 확인은 사람이 한다. → 사용자

## BLOCKED
- 없음(이번 카드). v0.6 전체로는 ORDER-09의 `@codemirror/search` 승인 대기 하나가 남아 있다(위 미정 첫 줄).
