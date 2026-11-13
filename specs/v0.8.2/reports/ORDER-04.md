[DONE] ORDER-04 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| 1 I-6 | HTML 편집 탭 Outline이 h1~h6 제목 트리, 클릭이 그 줄로 (V1 + V3) | V1 충족, V3 Phase 7에서 잼 | `src/syntax/outline.ts:141` `htmlOutline`(이미 돌던 html 질의 결과를 걸러 제목만), `src/shell/Outline.tsx:49`(`.html`·`.htm` 편집 탭만)·`:91`. 테스트 `src/syntax/outline.test.ts:177`(script·주석 안 `<h1>` 제외, 위치가 제목 줄) |
| 2 I-7 | ipynb 클릭·Outline 클릭 뒤 제목 줄 표시, 접힌 곳 안이면 펴서 표시 (V1 + V3) | V1 충족, V3 Phase 7에서 잼 | 클릭 → 제목 번호 `src/shell/markdown-preview.ts:484`, Outline 클릭도 같은 값 `src/workspace/context.ts:505·517`, 행 찾기 `Outline.tsx:186`, 접힌 곳 펴기 `Outline.tsx:189`. 테스트 `outline.test.ts:250` |
| 3 I-8 | 번호 규칙(H1 여럿·건너뜀·H1 없음·H5·H6), 드문 경우 규칙 보고, 저장 유지 (V1) | 충족 | `outline.ts:270` `headingNumbers`, `Outline.tsx:167·303`. 표 테스트 `outline.test.ts:188`, 저장 `src/settings/model.test.ts:240`. 규칙은 "tauri가 고른 것" 1·2 |
| 4 I-9 | 제목 Outline 메뉴 다섯 항목, 코드 Outline은 Expand All·Collapse All만 (V1 + V3) | 코드 확인 충족, V3 Phase 7에서 잼 | `Outline.tsx:242`(공용 `openContextMenu`, `MenuItem.checked`). 메뉴 구성 테스트는 ORDER-04 5절 목록 밖이라 없음 |
| 5 I-10 | 처음 깊이 2층, 사용자 상태 유지 (V1) | 충족 | `outline.ts:262` `initialCollapsed`, `Outline.tsx:133`(문서마다 한 번), 상태는 문서에 붙음 `context.ts:258`. 테스트 `outline.test.ts:200`(H1 시작·H2 시작·코드) |
| 6 I-11 | 켬: Outline=UI 테마 단계 색, 미리보기=Preview 테마 단계 색. 끔(기본) Phase 3 끝 모양. 저장 (V1 + V3) | V1 충족, 계산값 V3 Phase 7에서 잼 | `src/theme/theme.ts:164`, `src/theme/apply.ts:53`(`--heading-color-1..6`을 `:root`에 UI 테마, `.markdown-preview`에 Preview 테마), `src/settings/load.ts:44`(켬일 때만 클래스), `src/app.css:681~686`. 저장 `model.test.ts:240` |
| 7 본문 HTML 제목 | ORDER-03 본문 HTML 제목에도 번호·색·접기 (V1) | 충족 | `outline.test.ts:188`("HTML headings" 줄), `:209`(본문 `<h3>`, `<div>` 안 `<h3>`). 색은 `h1`~`h6` 태그 규칙이라 같이 걸림. 문단 안 인라인 제목은 목록에 없어 번호가 밀리지 않고 본문으로 접힘 |
| 8 I-18 접기 | 꺾쇠 늘 보임, 같거나 높은 단계 전까지(ipynb 코드 셀·출력 포함), Outline과 양방향 (V1 + V3) | V1 충족, V3 Phase 7에서 잼 | `outline.ts:287·304`, 꺾쇠 `markdown-preview.ts:376`·`:399`, 한 상태를 Outline과 모든 미리보기가 씀 `context.ts:263`, `app.css:845·852`. 테스트 `outline.test.ts:209` |
| 9 I-18 이동 | 찾기·Outline 클릭·`#id`·편집 탭 위치 연계가 펴고 이동 (V1) | 충족 | `outline.ts:321` `unfoldKeys`, `markdown-preview.ts:418`. 부르는 곳: 찾기 `src/shell/preview-search.ts:108`, 위치 연계 `markdown-preview.ts:457`, Outline 클릭·`#id` `:505`. 테스트 `outline.test.ts:209` |
| 10 회귀·성능 | v0.8.1 I-18 키보드 이동 테스트 그대로, 큰 파일에서 멈추지 않음 (V1, 8절: 코드 근거) | 충족(코드 근거) | 키보드 테스트 `outline.test.ts:162` 기대값 그대로 통과. 성능: 항목이 바뀔 때 행·키를 한 번 만들고(`Outline.tsx:163`) 번호·Collapse All·커서 경로가 이를 씀. 번호는 제목 수만큼 한 번. HTML 제목은 이미 돌던 질의 결과를 거름. 미리보기는 렌더가 만들던 `headings`를 받고 `querySelectorAll` 1회만 더함, 접기 바꿀 때 블록 수만큼만 돎. 마크다운 다시 파싱하는 곳 없음. `nestSections`는 제목 수 제곱 → 한 번 훑기로 줄임. 실제 시간은 Phase 7 |
| 11 테스트 | 전체 테스트·typecheck 0·보안 설정 diff 없음 (V1 + V0) | 충족 | 아래 "검증" |

## 검증
- `npm.cmd run test`: tests 327, pass 327, fail 0. `npm.cmd run typecheck`: 오류 0. `git diff --stat -- src-tauri/tauri.conf.json src-tauri/capabilities`: 출력 없음. Rust 변경 없음(cargo 안 돌림). (coder K-04, 커밋 전 한 번)
- checker C-04 diff 리뷰: PASS(범위·보안 설정 불변, 번호 규칙과 테스트 일치, 처음 펼침 문서당 1회, 섹션 범위와 네 경로 펼침, ipynb 클릭이 에디터 커서를 움직이지 않음(M-1), 제목 색 기본 꺼짐에서 규칙 미적용, 저장값, 레포 규칙). 테스트는 다시 돌리지 않음(COMMON 8절).
- 화면 검증: 하지 않음. 6절 #1·#2·#4·#6·#8은 Phase 7에서 잼(COMMON 8절, ORDER-04 8절).

## 지운 것·더한 것·하지 않은 것
- 더함: HTML 편집 탭 제목 Outline, 숫자 방식, Outline 우클릭 메뉴, 처음 2층 펼침, 단계별 제목 색, 미리보기 섹션 접기(Outline과 한 상태), ipynb 클릭 표시. 저장값 둘. 새 명령 ID·새 수치·새 의존성 없음. Settings 화면 행은 더하지 않음(바꾸는 곳은 Outline 메뉴뿐).
- 바뀐 동작: `## 제목 ##`의 Outline 이름에서 닫는 `#`를 뗌(미리보기 글자와 같아야 접기 키가 맞음, `outline.ts:110`).
- 하지 않음: HTML 미리보기 탭(Outline·클릭 표시·색·접기), 큰 파일 시간 측정, 화면 측정.
- 남은 위험: 화면 쪽(꺾쇠 자리·접힘 CSS·번호 칸·메뉴·제목 색·커서 따라 펼침)은 실행해 보지 않음 — Phase 7에서 처음 확인. 미리보기 DOM 블록 나누기(`applyFolds`)는 DOM 테스트 환경이 없어 테스트 없음. Outline(tree-sitter)과 미리보기(markdown-it)가 제목 글자를 다르게 읽는 드문 제목은 양쪽이 따로 접힘.

## tauri가 고른 것
1. I-8 드문 경우 번호: 자리 수는 늘 `단계 − 1`. H1이 나오면 아래 카운터 0으로. 건너뛴 단계는 `0`(H1 다음 H3 → `0.1`, H2 아래 H4 → `1.0.1`). H1 없는 문서는 H2부터 `1`. H5 `1.1.1.1`, H6 `1.1.1.1.1`. 이유: 번호만 보고 단계를 알 수 있고 큰 규칙("단계마다 한 자리")을 지킴(LaTeX·Word 방식).
2. 번호 칸 너비: 번호 길이만큼(최소 배지 칸 `--icon-size`), 길면 제목 글자가 말줄임으로 양보. 글자 크기·굵기·색은 배지 것. 이유: 고정 폭이면 긴 번호가 잘림, 새 수치가 필요 없음.
3. 저장 키: `settings.json`의 `outline_heading_numbers`(기본 `false`=아이콘), `outline_heading_colors`(기본 `false`). 기존 `saveSetting`(주석·알 수 없는 키 보존).
4. 새 명령 ID: 없음(메뉴 항목은 함수로 실행).
5. I-10 "2층": 처음에 둘째 층의 자식 있는 항목만 접음. 펴면 그 아래는 다 보임(VS Code "Fold Level 2"와 같음).
6. I-18과 처음 2층 펼침의 관계(연동 규칙 그대로의 결과): 접힘은 문서마다 하나이고 Outline과 그 문서의 모든 미리보기가 같이 씀. Outline이 그 문서를 처음 보일 때 둘째 층이 접히므로, H1로 시작하는 문서는 미리보기에서도 하위 제목(H3)이 있는 H2 섹션이 제목 줄만 남고 접혀 보인다. 하위 제목이 없는 H2는 펼친 그대로. Outline을 한 번도 열지 않은 문서는 접힘이 생기지 않아 미리보기가 다 펼쳐져 있고, 나중에 Outline을 열면 그때 접힘.
7. I-7 "접힌 곳 안을 클릭하면 폄"의 범위: 커서 위치가 바뀔 때마다(키 이동 포함) 그 위치를 가린 접힌 항목을 폄. 에디터에서 클릭과 키 이동을 구분하는 신호가 Outline까지 오지 않아서(VS Code Outline Follow Cursor와 같은 동작).
8. 꺾쇠 자리: 본문 왼쪽 여백(I-15) 안, 제목 첫 줄 높이. 제목 글자 위치는 그대로.
9. Collapse All은 자식 있는 Outline 항목을 모두 접고, Expand All은 미리보기에서 접은 것까지 모두 폄.

## 바꾼 파일
- `src/syntax/outline.ts`·`outline.test.ts`, `src/shell/Outline.tsx`, `src/shell/markdown-preview.ts`, `src/shell/preview-search.ts`, `src/workspace/context.ts`, `src/settings/model.ts`·`model.test.ts`·`load.ts`, `src/theme/theme.ts`·`apply.ts`, `src/editor/markdown.ts`(`htmlHeadingText` export만), `src/app.css`. 코드 커밋 `499bab6`.

## 미정
- "tauri가 고른 것" 6: Outline이 열려 있으면 미리보기도 처음에 하위 제목 있는 둘째 층 섹션이 접혀 열린다. 뜻한 바인지 — 사용자 확인(leader-core).
- "tauri가 고른 것" 7: 에디터에서 키로 커서를 옮겨도 Outline·미리보기의 접힌 곳이 펴진다 — 사용자 확인(leader-core).
- "tauri가 고른 것" 1: 단계 건너뛴 문서의 `0.1` 번호 — 사용자 확인(leader-core).
- Phase 7에서 같이 볼 것(코드 확인만 한 곳): 꺾쇠가 여백 안·제목 첫 줄 높이에 맞는지, 긴 번호 줄 모양, 접힌 ipynb의 빈 markdown 셀 틈, 접힌 섹션 안 mermaid가 뒤늦게 그려져도 숨는지.

## BLOCKED
- 없음
