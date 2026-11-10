[DONE] ORDER-14 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| U-9 | Search 탭 입력란 네 모서리가 둥글고 왼쪽 테두리가 보인다(V3 확대 캡처, 사용자 캡처와 같은 자리) | 충족 | `specs/v0.6/verify/ORDER-14/search-input-left-zoom.png`(탭 왼쪽 가장자리·입력란 왼쪽 위·아래 3배 확대), `search-input-right-zoom.png`. `v3.json` searchTab.field: 높이 32, 네 모서리 6px, 왼쪽 테두리 1px solid, 왼쪽 여백 8px — 편집기 찾기 줄 입력란(findBar)과 같은 값. 안쪽 `<input>` 배경 투명 |
| U-9 | 결과 줄·탭 둥근 모서리(ORDER-11 U-1) 그대로 | 충족 | `.project-search-tab`·`.project-search` 네 모서리 6px, 결과 줄 테두리·모서리 2px 그대로(`search-tab.png`) |
| U-10 | 결과 항목 계산 높이 26px, 항목 사이 간격 4px(V3 측정·캡처) | 충족 | `v3.json` searchTab.items: Readme.md·notes.md·readme-old.md 각 높이 26 = 트리 한 줄(treeRowH) 26, 간격 [4, 4], margin "2px 4px", 테두리 1px·모서리 2px·글꼴 16px 그대로. `search-results-zoom.png` |
| U-10 | 결과를 누르면 여는 동작 그대로(V3 한 번) | 충족 | notes.md 결과 클릭 → 활성 탭 ["notes.md"] |

## 카드가 보고하라고 한 것
- U-9 원인: 입력란 안 `<input>`이 불투명한 사각 배경(`--editor-background`)이라, 둥근 테두리 칸의 왼쪽 위·아래 모서리와 테두리 곡선을 덮었다(왼쪽 여백이 input 안쪽 padding이라 input 상자가 테두리 바로 안쪽까지 닿음). 여백·최소 높이를 바깥 칸으로 옮기고 input 배경을 투명으로 해 편집기 찾기 줄 입력란과 같은 구조로 했다. 새 값 없음.
- U-10 값: 항목 높이는 기존 `project_panel.item.height`(26px, `--project-panel-item-height`). 위아래 바깥 여백 2px는 사용자 결정 값이라 spec/를 고치지 않고 `src/spec/metrics.ts`에 `search_results.header.margin_y` = 2px(출처 주석: ORDER-14 U-10, 사용자 2026-11-10)로 두었다.

## 검증
- coder K-18(U-9, CSS만, 코드 확인), K-18-R1(U-10): typecheck 통과, npm test 227.
- checker C-20(U-9) PASS. U-10을 더한 뒤 C-20-R1(커밋 직전 전체 1회): `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 227 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 22 통과. 코드 검토 지적 없음, V3 U-9·U-10 PASS.
- V3(`[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`, U-9 한 번·U-10 더한 뒤 한 번): debug exe(`src-tauri/target/debug`), 임시 APPDATA·임시 WebView 데이터 폴더, One Light, 1440×852. SendInput, CDP. 시스템 클립보드는 건드리지 않았다. 사용자 테스트 앱(PID 20280)은 건드리지 않았다(첫 측정 전후에는 실행 중, 두 번째 측정 전에는 이미 실행 중이 아니었다).
- 결과 파일: `specs/v0.6/verify/ORDER-14/` `v3.json`, `search-tab.png`, `search-input-left-zoom.png`, `search-input-right-zoom.png`, `search-results-zoom.png`. 두 번째 측정이 첫 측정의 파일을 덮었다(U-9 값은 두 번째에서도 같음).

## 지운 것·더한 것·하지 않은 것 (D-8)
- 바꾼 것: `src/search/search.css`(입력란 구조, 결과 항목 높이·위아래 여백), `src/spec/metrics.ts`(`search_results.header.margin_y` 추가).
- 지운 것: 입력란 input의 여백·불투명 배경 규칙, 쓰지 않게 된 `search_results.header.lines`와 `--search-line-height`.
- 하지 않은 것: 결과 줄 좌우 여백·테두리·모서리·글꼴, 탭 둥근 모서리 변경. 새 의존성·spec/ 수정 없음.
- 남은 위험: 없음.

## 바꾼 파일
- 코드 커밋 `3c8e235`: `src/search/search.css`, `src/spec/metrics.ts`
- 기록 커밋 `04ce0e7`: `specs/v0.6/PROGRESS.md`("사용자 요청 작업" 절 ORDER-14 소절), `specs/v0.6/verify/ORDER-14/`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- 없음(이번 카드).

## BLOCKED
- 없음
