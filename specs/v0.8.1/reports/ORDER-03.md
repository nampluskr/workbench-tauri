[DONE] ORDER-03 tauri

V3는 debug exe(커밋 `58a522c`, R1 뒤 `ef330b3`)로 쟀다. 주 모니터 1920×1080 100%, 창 1440×852(#7 끝은 1124), One Dark, CDP 마우스·키. 앱 데이터·WebView 데이터·픽스처 `o3ws`는 scratchpad의 별도 폴더. 근거는 `specs/v0.8.1/verify/ORDER-03/`(`v3.json`, `v3-c7b.json`, `v3-c8-drop.json`, PNG, `measure.mjs`·`measure-c7b.mjs`·`measure-c8-drop.mjs`).

**검토·판정은 대리다**: tauri-checker(agy)가 사용 한도에 걸려(약 3h35m) leader-core 결정(2026-11-13, (c))대로 tauri-leader가 구현에 참여하지 않은 Claude Code 서브 에이전트(새 컨텍스트)에 C-05(코드 검토)·C-06(V3 판정)을 맡겼다. 같은 Claude 계열이라 독립성이 낮다. herdr 구성은 바꾸지 않았다.

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|
| 1 I-5 임시 탭 | Lock Preview 켬, 트리에서 `.md` 셋 한 번씩 → 미리보기 탭 하나, 이탤릭 | 충족 | `v3.json` `c1_temp_preview`: `lockPressed` "true", m1·m2·m3 뒤 탭 = ["Preview m3.md", preview, italic] 하나. `c1-three-clicks.png` |
| 2 I-5 고정 | 같은 파일 한 번 더 클릭·탭 제목 더블클릭 → 이탤릭 해제, 다음 파일은 새 탭 | 충족(아래 미정 1) | `c2_keep.afterTitleDblClick`(m4 탭 제목 더블클릭 → italic 해제), `afterM5`(다음 파일 m5는 새 임시 탭, m4 고정 유지), `afterM5Middle`(가운데 클릭 → 고정). 트리 더블클릭 고정은 `openFile(preview=false)` 경로(편집 탭과 같음). 따로 떨어진 두 번째 한 번 클릭(`afterSecondClick`)은 고정하지 않는다 — 카드 3.1 "지금 편집 탭의 고정 규칙과 같게"를 따른 것(편집 탭도 같다) |
| 3 I-5 범위 | 눈 버튼·`Ctrl+Shift+V`·`Ctrl+K V`·View 메뉴는 고정, Lock 끄면 v0.8, 다른 대상도 같은 규칙 | 충족 | `c3_other_kinds`: `data.csv`·`nb.ipynb`도 임시 미리보기 탭으로 교체. `c3_lock_off_and_commands`: Lock 끔 → `m6.md` 임시 편집 탭(v0.8), `ctrlShiftV`·`ctrlKV`(옆 pane)로 연 "Preview m6.md"는 고정, 눈 버튼·View 메뉴도 고정 탭(이미 있던 고정 탭을 다시 활성 — 측정으로는 약하고 코드 확인: `temporary`는 `openFile` 트리 열기에서만 넘어감, 대리 검토 C-05 호출부 grep). `c3-commands.png` |
| 4 I-6 여러 개 | Search 버튼·`Ctrl+Shift+F` 번갈아 셋, 다른 검색어, 오가도 그대로 | 충족 | `c4_c5_search.runs`: 버튼 → `Ctrl+Shift+F` → 버튼으로 새 빈 Search 탭 셋(열 때 입력칸 `focused` true, 값 ""), 검색어 "m1"·"long-file-name-1"·"data"(이름 검색) 결과 1·7·1. `revisit`: 탭을 오가도 각 값·결과 그대로. `c4-three-searches.png` |
| 5 I-6 제목 | 검색 전 "Search", 뒤 검색어, 다른 도구 탭은 하나 | 충족 | `runs[*].opened.tabs` 마지막 "Search" → 검색 뒤 제목 "m1"·"long-file-name-1"·"data". `extensionsTabs` 1(User 메뉴 → Extensions 두 번). `c5-titles.png`. Settings는 이 앱에서 별도 창이라 탭이 아니다 |
| 6 I-13 원인 | 재현 절차와 원인(코드 위치) | 충족 | 재현: 탭이 탭 바를 넘게 열린 pane에서 포커스가 pane 밖(트리·상태 표시줄·메뉴)일 때 마지막 탭을 누르거나 그 밖에서 새 탭을 연다. 원인: `.tab-bar-edge.end`(New·Split·Zoom)는 포커스된 pane에만 그려진다(`src/shell/Pane.tsx` 535행 근처, `focusedPane`은 `focusin`으로 정함 148행). 탭 클릭은 onMouseDown에서 기본 동작을 막아 포커스가 pane 밖에 남은 채 `activateTab` → 활성 탭 effect가 버튼 영역이 **없는** 폭으로 `scrollIntoView({inline:"nearest"})`를 한 뒤 `focusPane` → `focusin`으로 버튼 영역이 나타나 `.tab-list`가 그만큼 줄고(`overflow:hidden`) 활성 탭 오른쪽(닫기 x)이 가려진다. effect는 활성 탭·탭 목록만 따라가 다시 돌지 않는다(창 너비 변화도 같음). 버튼 수는 탭 종류와 무관(Split은 disabled로 남음). 고침: `.tab-list`에 ResizeObserver를 달아 줄 폭이 바뀌면 같은 스크롤을 다시 한다(K-03); 휠로 밀어 둔 뒤에는 다시 하지 않는다(K-03-R1, I-16 유지) |
| 7 I-13 고침 | 넘치는 pane에서 마지막 탭(편집·미리보기·도구) 활성 시 닫기 x 오른쪽 < 버튼 영역 왼쪽, 창 너비 바꾼 뒤도 | 충족 | `v3.json` `c7_last_tab`(창을 앞에 둔 실행, 트리 포커스에서 마지막 탭 클릭): 편집 탭 `closeRight` 1348 < `edgeLeft` 1353, 미리보기 탭 1347.8 < 1353, 도구 탭(Search) 1348.2 < 1353; 창 1124로 줄인 뒤(SetWindowPos) 1032.2 < 1037. `v3-c7b.json`(`ef330b3`): 상태 표시줄 Search·User 메뉴 Extensions·View 메뉴 Open Preview로 연 새 탭과 트리 포커스에서 마지막 탭 클릭 모두 ≈1348 < 1353. 캡처 `c7-last-*.png`, `c7-narrow-last.png`, `c7b-*.png` |
| 8 회귀 | 탭 드래그, 트리 파일 놓아 열기, 휠 스크롤, 탭 메뉴, 임시 편집 탭, 위치 연계, 분할 pane 탭 바 | 충족 | `c8_regress`: 휠 scrollLeft 0 → 186, 탭 메뉴(Close…Pin Tab), 탭 드래그 순서 바뀜(R-10), Lock 끔 한 번 클릭 → 임시 편집 탭(italic), 미리보기 위치 연계 "Section 6", 분할 pane 각각 탭 바. `v3-c8-drop.json`: 트리 파일을 탭 위에 놓기 — Lock 끔 → 그 탭 앞 일반 탭 `m2.md`, Lock 켬 → 고정 미리보기 탭 `Preview m3.md`(ORDER-02 끝 동작). `v3-c7b.json` `r1`: 휠로 scrollLeft 1318 → 편집기 클릭(버튼 영역 나타남) 뒤 1318 그대로 |
| 9 테스트 | 임시 미리보기 탭 규칙·Search 제목 테스트, 전체 통과, typecheck 0 | 충족 | `ef330b3`에서 `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 294/294. 새 테스트: `tabs.test.ts`(임시 미리보기 탭 교체·고정), `tab-view.test.ts`(Search path·제목) |

## 검증
- `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 294/294(`ef330b3`). `npm.cmd run tauri build -- --debug --no-bundle` 성공.
- 화면 차례 세 번: 첫 측정(`58a522c`), 대리 판정 조건에 따른 다시 측정(`58a522c`), K-03-R1 뒤 다시 측정(`ef330b3`). 매번 `[SCREEN-REQ]`/`[SCREEN-OK]`/`[SCREEN-DONE]`.
- 측정 메모: 앱 창이 다른 창 뒤에 있으면 WebView에 포커스 이벤트가 오지 않아 버튼 영역이 나타나지 않는다. 첫 실행(c1~c5) 캡처의 새 탭 잘림은 이 때문이었고, 창을 앞에 두고 같은 경로를 다시 재서 확인했다(`v3-c7b.json`). `v3.json` `c8_regress.treeDropOnTab`은 스크립트 문제(끌기가 시작되지 않음)라 `v3-c8-drop.json`이 대신한다. Search는 파일 이름 검색이다. 창 너비는 `win-input.ps1 resize`가 바꾸지 못해 SetWindowPos로 바꿨다.
- **대리 검토**: C-05 [PASS](막는 지적 없음, 권고 R-1·R-2 → K-03-R1), C-06 조건부 PASS(조건 = 창을 앞에 두고 새 탭 경로 다시 재기 → 위에서 충족). 보고 `C:\Users\nampl\AppData\Local\Temp\v081-C-05-report.md`·`v081-C-06-report.md`. checker 한도가 풀리면 다음 카드부터 tauri-checker로 돌아간다.

## 지운 것·더한 것·하지 않은 것
- 더함: `openPreview`의 `temporary`(트리 열기에서만, 편집 탭의 `openTab`·`PANE_MAX_PREVIEW_TABS` 규칙 그대로), Search 탭 path `Search:<n>`·제목 = 검색어, `.tab-list` ResizeObserver(+ 휠로 밀면 따르지 않는 `follow` 플래그). 임시 미리보기 탭은 원본이 수정돼도 교체(미리보기 탭은 편집 내용을 갖지 않음). 의존성·설정·보안 변경 없음.
- 하지 않음: Search 탭 복원(원래 복원하지 않음), 버튼 영역을 늘 그리는 방식(I-706 포커스된 pane에만 버튼을 바꾸게 됨).
- 남은 위험: 측정하지 않은 것 — 긴 검색어 잘림(기존 탭 제목 잘림 함수 재사용), Search 토글 유지, 탭 바 메뉴로 Search 열기. 휠로 밀어 둔 뒤 창 너비를 바꾸면 활성 탭으로 돌아가지 않는다(I-16 유지를 우선).

## tauri가 고른 것
- Search 탭 제목이 바뀌는 때: 검색할 때(Enter, 토글로 다시 검색)의 검색어. 입력 중에는 바뀌지 않는다.
- Search 탭 path `Search:<n>`(앱이 켜진 동안 늘어나는 번호, 화면에 안 보임). 툴팁은 "Search".
- I-13 고침 방식: 줄 폭 변화에 다시 스크롤(ResizeObserver). 사용자가 휠로 밀어 둔 뒤에는 따르지 않는다.

## 바꾼 파일
- 코드 `58a522c`(K-03): `src/workspace/context.ts`, `src/search/Search.tsx`, `src/workspace/tab-view.ts`, `src/shell/Pane.tsx`, `src/workspace/tabs.test.ts`, `src/workspace/tab-view.test.ts`.
- 코드 `ef330b3`(K-03-R1): `src/shell/Pane.tsx`, `src/workspace/context.ts`.
- 문서·검증 `38f303c`: `specs/v0.8.1/PLAN.md`·`PROGRESS.md`, `specs/v0.8.1/verify/ORDER-03/`.

## 미정
- I-5 "같은 파일을 한 번 더 클릭하면 고정": 지금은 편집 탭 규칙(카드 3.1 "지금 편집 탭의 고정 규칙과 같게")대로 더블클릭·가운데 클릭·탭 제목 더블클릭으로 고정하고, 떨어진 두 번째 한 번 클릭은 고정하지 않는다. ITEMS 문장("한 번 더 클릭")을 따로 떨어진 클릭으로 읽으면 다르다 — 사용자 확인(leader-core).

## BLOCKED
- 없음(checker 한도 [BLOCKED]는 leader-core가 대리 검토로 풀었다)
