# Phase 3 끝 V3 실측 (카드 v04-M3, SPEC R-8·R-9·R-10·R-11·R-14, 03-tauri R-01·R-04·R-09·R-32)

## 1. 측정 조건

- 앱: `npm run tauri build -- --debug --no-bundle`로 현재 작업 트리 소스를 새로 만든 debug exe(2026-11-06 09:54:00). 빌드 뒤 `src/`·`src-tauri/`·`package*.json`에 더 새 파일이 없음을 `find -newer`로 확인했다. 창 클라이언트 논리 1440×852, 배율 100%(DPI 96, `devicePixelRatio` 1), 주 모니터 1920×1080, 키보드 배열 `0x0412`(한국어), 테마·글꼴 기본.
- 시험 폴더: `%TEMP%\wb-v04-m3\root`만 썼다(a~g.txt, 500줄 `long.txt`, `same.txt`, `notes.md`(frontmatter·제목 6단·문단·목록·인용·표 3열 정렬·링크 5종·코드·60문단), `raw-fm.md`, `xss.md`, `anch.md`, `other.md`, 33자 이름의 md, `sub/`). 사용자 실제 폴더는 등록하지 않았다.
- 앱 데이터: `%APPDATA%\workbench-tauri`에는 `state.json`만 있었다(SHA-256 `77EF33FF…07C99`, `D:\projects`·`D:\projects\workbench-gpui` 등록). 사본을 떠 두고 시험 폴더만 적은 `state.json`으로 시작했다. 끝에 원래 파일로 되돌려 해시가 같음을 확인했다. `keymap.json`은 원래 없었다. 시험에서 만든 것은 시험 안에서 지웠고 끝에도 없음을 확인했다.
- 입력: 실제 OS 입력(SendInput). `tools/win-input.ps1`의 C# 입력 코드를 실행 때 꺼내 쓰는 상주 스크립트(scratch, 저장소 밖)로 보냈다. 대상 창은 PID로 고정했고 이벤트마다 전경 창을 확인하는 도구의 가드를 그대로 썼다(가드가 다른 창 때문에 입력을 거부한 일이 몇 번 있었고, 그때 입력은 아무 데도 가지 않았다). 최대화 버튼에는 마우스를 올리지 않았다. 닫기 질문(TaskDialog)에는 UI Automation으로 창과 버튼 포커스를 읽고 그 창이 전경일 때만 키(Shift+Tab, Enter)를 보냈다.
- 관측: 탭·분할 트리·메뉴·툴팁·미리보기는 CDP(`--remote-debugging-port=9222`)로 `getComputedStyle`·`getBoundingClientRect`·DOM 클래스·CM6 상태(`cmTile.view`)를 읽었다. 색은 테마 토큰(CSS 변수)을 같은 방법으로 풀어 계산값과 비교했다(픽셀 색 대조 없음). 측정 전용 코드를 앱에 넣지 않았다. 페이지에는 CDP로 이벤트 기록기와 보조 함수를 임시로 심었고 앱을 닫으면 사라진다. 허용 오차는 `verification.tolerance.dimension` 1px다.
- 앱 실행: 판정에 쓴 최종 일괄 실행은 34회(시나리오 17개 파일, 시나리오마다 앱을 새로 띄움). 탐색과 측정 도구 디버깅으로 이 밖에 여러 번 더 띄웠다. 이 가운데 F-1(아래)은 탐색 중에 원인을 찾은 것이다.
- 외부 링크 시험이 Windows의 '연결 프로그램 선택' 창을 띄웠다(5장). 그 창은 측정이 연 것이라 `WM_CLOSE`로 닫았다. 다른 프로세스는 종료하지 않았다. 앱 자체(내가 띄운 것)만 종료했다.
- 스크린샷 5장(필요한 영역만, 각 4~48KB): `phase3-markdown-preview.png`, `phase3-tab-drop-line.png`, `phase3-drop-overlay-left.png`, `phase3-zoomed.png`, `phase3-menu-view.png`.
- 정리: `state.json` 복구(SHA 일치), 시험 폴더 삭제, `keymap.json` 없음, 남은 `workbench-tauri`·`OpenWith` 프로세스 없음, `tools/` 변경 없음(`git status`).

## 2. 요약

- 판정 행 348개: 통과 325, 불일치 8행(원인 4건), 기록 13, 측정 불가(환경) 2.
- 불일치 4건은 아래 표다. 측정자가 고치지 않았다.
- 새 화면 요소의 수치·색·문구는 전부 맞았다(`pane.*`, `markdown_preview.*`, `toolbar.*`, 탭 핀 아이콘, 메뉴 행·단축키, 툴팁). 어긋난 것은 동작 쪽이다.

### 불일치 목록

| ID | 스펙 | 기대 | 측정 | 비고 |
| --- | --- | --- | --- | --- |
| F-1 | R-10, I-715 | 탭을 끌면 대상 탭에 삽입선(`pane.tab_drop_line_width`)과 배경이 그려지고, 놓은 뒤에도 탭 상태 표시가 맞다 | **눌렀던 자기 탭 위에서 시작해 작은 걸음으로 다른 탭으로 끌면(실제 사람의 끌기) 삽입선이 안 그려진다**(`S2`: 표시 0개). 같은 동작에서 예외 `TypeError: Cannot read properties of null (reading 'pane') at lineOn`이 4건 난다. 놓은 뒤 탭 `data-index`가 `["1:","2:","2:active","3:"]`처럼 겹치고 활성 표시가 낡는다(탐색 실행에서는 두 탭이 함께 `active`). 자기 탭으로 되돌아오면 이전 탭의 삽입선이 그대로 남는다(`SB7`: 표시 1개 잔존, 예외 2건). 드롭 자체(순서 바뀜)는 동작한다 | 재현 100%(최종 실행 2회 + 탐색 10회 이상). 시작에서 곧바로 대상 탭으로 한 번에 옮기면(한 번의 pointermove) 선·색·폭·위치가 모두 맞는다(R-10 표에서 `삽입선`·`target tab` 행). 원인 추정(소스 읽기만): `Pane.tsx` `lineOn`이 `d.target!.pane`을 먼저 읽는다. 끌기가 막 시작해 `d.target`이 null인 순간(포인터가 자기 탭 위, 탭 바 시작·빈 곳)에 던진다. 던진 렌더 효과는 이후 갱신을 못 받는다 |
| F-2 | R-9·R-10, 03-tauri R-01 | 탭을 옮긴 뒤 `view.dom` 같은 객체, `isConnected`, 스크롤·선택·커서가 같다 | DOM 객체(expando 표식)·`isConnected`·스크롤(777)은 같다. **선택이 `[114,117]` → `[0,0]`으로 사라진다**(가장자리 분할 `sC4` 2행). 스크롤 없음·휠 100·휠 800·`scrollTop` 777 어느 쪽이든 같다(탐색 5/5). 한 번 다른 탭으로 갔다 돌아온 뒤 끌면 선택이 남는다(1/1) | 에디터에서 글자를 선택한 직후 그 탭을 끌어 놓는 가장 흔한 경로가 걸린다. 원인 추정(소스 읽기만): 옮길 때 `replaceChildren`으로 DOM을 떼었다 붙이고 새 Pane에서 포커스를 받는 순간 CM이 사라진 DOM 선택을 읽어 0으로 돌리는 것으로 보인다 |
| F-3 | R-11, I-078 | Alt+Click(미리보기 버튼)·Ctrl+K V 뒤 포커스가 원문 편집기에 남는다 | Ctrl+K V는 남는다(통과). **Alt+Click은 `document.activeElement`가 `BODY`**다(편집기를 먼저 눌러 포커스를 준 뒤에도 같다). 키보드 입력이 아무 데도 가지 않는다 | 재현 2회. 버튼이 눌리며 포커스를 받고, 새 Pane이 생기며 버튼이 사라지는 것과 관련이 있어 보인다(추정) |
| F-4 | R-9, I-730·I-732 | 확대 중 다른 Pane이 활성이 되면 확대가 풀린다. Ctrl+K Ctrl+방향키로 이웃 Pane에 간다 | 분할 키(Ctrl+K Down)로 새 Pane이 활성이 되면 풀린다(통과). **확대한 상태에서 Ctrl+K Ctrl+Left는 아무 일도 없다**(확대 유지, 포커스 그대로) | `paneInDirection`이 화면 사각형을 쓰는데 확대된 Pane이 본문 전체를 덮어 "경계 너머" 후보가 없어서다(추정, `context.ts` `paneInDirection`). 확대 상태에서 키로 다른 Pane으로 나가는 길이 없다 |

## 3. 결과 표

판정 열: 통과 = 기대값과 측정값이 같다(허용 오차 안). 기록 = 기준 수치가 없어 값만 남겼다. 항목 이름은 측정 스크립트의 영어 문구를 그대로 두었고 앞의 R·I·L·E 번호가 스펙 ID다.

### R-8 임시·일반·핀 탭

| 판정 | 항목 | 기대값 | 측정값 | 비고 |
| --- | --- | --- | --- | --- |
| 통과 | R8 I-061 tree single click opens a preview tab | ["a.txt[pv]*"] | ["a.txt[pv]*"] |  |
| 통과 | R8 I-064 preview tab title italic | italic | italic |  |
| 통과 | R8 I-062 next preview replaces the previous one in its slot | ["b.txt[pv]*"] | ["b.txt[pv]*"] |  |
| 통과 | R8 I-063 one click on a preview tab does not promote | ["b.txt[pv]*"] | ["b.txt[pv]*"] |  |
| 통과 | R8 I-063 double click on a preview tab promotes | ["b.txt*"] | ["b.txt*"] |  |
| 통과 | R8 I-067 new tab goes right after the active tab | ["b.txt","c.txt[pv]*"] | ["b.txt","c.txt[pv]*"] |  |
| 통과 | R8 I-062 preview replaced again, slot reused (index 1) | ["b.txt","d.txt[pv]*"] | ["b.txt","d.txt[pv]*"] |  |
| 통과 | R8 I-062 preview replaces the old preview slot even when the active tab is another (index 1 kept) | ["b.txt","e.txt[pv]*"] | ["b.txt","e.txt[pv]*"] |  |
| 통과 | R8 I-068 non-preview open of an open preview tab clears its preview state | ["b.txt","e.txt*"] | ["b.txt","e.txt*"] |  |
| 통과 | R8 I-067 double-click open: normal tab after the active one | ["b.txt","e.txt","f.txt*"] | ["b.txt","e.txt","f.txt*"] |  |
| 통과 | R8 I-068 an open tab is activated, not duplicated | ["b.txt*","e.txt","f.txt"] | ["b.txt*","e.txt","f.txt"] |  |
| 통과 | R8 I-063 editing a preview tab makes it a normal tab | false | false |  |
| 통과 | R8 I-065 Ctrl+K Shift+Enter pins and moves it to the pinned area start | e.txt[P]* | e.txt[P]* |  |
| 통과 | R8 I-073/L-66 pin icon shown without hover (opacity) | 1 (visible, mouse parked away) | {"opacity":"1","visibility":"visible","sw":14,"sh":14,"bw":14,"bh":14} |  |
| 통과 | R8 L-66 pin icon size = icons.size.small (14) | 14 | 14 |  |
| 통과 | R8 L-25 end slot size = tab.end_slot (14x14) | [14,14] | [14,14] |  |
| 통과 | R8 I-065 second pin goes at the end of the pinned area | ["e.txt[P]","f.txt[P]*"] | ["e.txt[P]","f.txt[P]*"] |  |
| 통과 | R8 I-067 new normal tab respects the pinned area boundary | same.txt* | same.txt* |  |
| 통과 | R8 I-066 Ctrl+W does not close a pinned tab | 5 | 5 |  |
| 통과 | R8 I-066 Ctrl+F4 does not close a pinned tab | 5 | 5 |  |
| 통과 | R8 I-066 middle click does not close a pinned tab | 5 | 5 |  |
| 통과 | R8 I-075/PROGRESS File>Close Editor closes a pinned tab | 4 | 4 |  |
| 통과 | R8 I-065 unpin: pinned count 2 -> 1 | 1 | 1 |  |
| 통과 | R8 I-065 unpinned tab sits right after the pinned area | e.txt | e.txt |  |
| 통과 | R8 I-065 pinning a preview tab clears preview state | [true,false] | [true,false] |  |
| 통과 | R8 I-076 Ctrl+PageDown steps through tabs in position order and wraps | ["b.txt","a.txt","e.txt","same.txt","g.txt","b.txt"] | ["b.txt","a.txt","e.txt","same.txt","g.txt","b.txt"] |  |
| 통과 | R8 Ctrl+PageDown: focus follows into the editor | true | true |  |
| 통과 | R8 I-076 Ctrl+PageUp wraps from first to last, then backwards | ["b.txt","g.txt","same.txt","e.txt","a.txt","b.txt"] | ["b.txt","g.txt","same.txt","e.txt","a.txt","b.txt"] |  |
| 통과 | R8 S-7 tab right-click menu has one item with the label by pin state | ["Unpin Tab"] | ["Unpin Tab"] |  |
| 기록 | R8 S-7 menu detail | label Unpin Tab, key Ctrl-K Shift-Enter | [[{"label":"Unpin Tab","keys":"Ctrl-K Shift-Enter","disabled":false}]] |  |
| 통과 | R8 S-7 closing the menu returns focus to where it was when the menu opened (the tab press had already moved it from the editor to the Pane) | ["SECTION",1] | ["SECTION",1] |  |
| 기록 | R8 S-7 unpinned tab menu | Pin Tab | [[{"label":"Pin Tab","keys":"Ctrl-K Shift-Enter","disabled":false}]] |  |
| 통과 | R8 S-7 focus after choosing the menu item | the focus the page had when the menu opened (Pane) | {"tag":"SECTION","cls":"pane","pane":1,"inEditor":false,"inPreview":false,"inMenu":false} | the editor itself is not focused after a tab press or the menu; typing goes nowhere until the editor is clicked |

### R-9 분할·크기 조절·확대·같은 버퍼

| 판정 | 항목 | 기대값 | 측정값 | 비고 |
| --- | --- | --- | --- | --- |
| 통과 | R9 I-706 start (no focus): no end buttons area | 0 | 0 |  |
| 통과 | R9 I-706 end buttons order + (gap) with focus: New…, Split Pane, Zoom In | ["New…(disabled)","Split Pane","Zoom In"] | ["New…(disabled)","Split Pane","Zoom In"] |  |
| 통과 | R9 L-27 end buttons gap (tab.end_buttons_area.gap=4) | [4,4] | [4,4] |  |
| 통과 | R9 L-27 end area padding_x = 6 | ["6px","6px"] | ["6px","6px"] |  |
| 통과 | R9 L-27 end area border_end_left=1, border_bottom=1 | ["1px","1px"] | ["1px","1px"] |  |
| 통과 | R9 I-708/I-731 Ctrl+ = Split Right clones the active item only (original tabs kept) | [["a.txt","b.txt"],["b.txt"]] | [["a.txt","b.txt"],["b.txt"]] |  |
| 통과 | R9 I-723 Right: one h group with 2 panes (left original) | ["h",[1,2]] | ["h",[1,2]] |  |
| 기록 | R9 I-708 focus after Split Right | (Zed: the new Pane gets focus) | {"tag":"DIV","cls":"cm-content","pane":2,"inEditor":true,"inPreview":false,"inMenu":false} |  |
| 통과 | R9 I-725 split line thickness (pane.split_line_thickness=1) | 1 | 1 |  |
| 통과 | R9 I-725 split line color = --pane-group-border | rgb(49, 50, 68) | rgb(49, 50, 68) |  |
| 통과 | R9 I-725 cursor on a left/right split = col-resize | col-resize | col-resize |  |
| 통과 | R9 I-725 hit area width = pane.split_line_mouse_hitbox (4) | 4px | 4px |  |
| 통과 | R9 I-725 hit area = 4 whole pixels, centred on the line (2px each side of its centre) | [4,988,992] | [4,988,992] |  |
| 통과 | R9 I-723 Down on P2: P2 wrapped into a v group (other axis), P2 first | ["v",2] | ["v",2] |  |
| 통과 | R9 I-724 new v group has equal heights | true | true |  |
| 통과 | R9 I-723 Left on P3: P3 wrapped in an h group with the new pane BEFORE it | ["h",3] | ["h",3] |  |
| 통과 | R9 I-723 Up on P1: v group, new pane BEFORE P1 | ["v",1] | ["v",1] |  |
| 통과 | R9 I-708 every clone holds only the active item (b.txt) | true | true |  |
| 통과 | R9 I-724 three siblings end up with equal widths (flex all 1) | true | true |  |
| 통과 | R9 I-726 dragging right: pane 2 at min_drag_width | 80 | 80 |  |
| 통과 | R9 I-726 then the farther sibling (pane 3) gives down to min_drag_width | 80 | 80 |  |
| 통과 | R9 I-726 pane 1 took the rest | true | true |  |
| 통과 | R9 I-726 dragging left from the second line: pane 2 at min | 80 | 80 |  |
| 통과 | R9 I-726 handed to the farther sibling: pane 1 down to min_drag_width | 80 | 80 |  |
| 통과 | R9 I-726 pane 3 took the rest | true | true |  |
| 통과 | R9 I-727 double click on a line makes the group's panes equal | true | true |  |
| 통과 | R9 I-726 dragging a horizontal line up: upper pane at min_drag_height | 100 | 100 |  |
| 통과 | R9 I-726 dragging it down: lower pane at min_drag_height | 100 | 100 |  |
| 통과 | R9 I-726 nested minimum: the v group holding a row of 2 panes after dragging its left line far right | each pane in the nested row >= 80 (2 x 80 + line) | {"pane5":79.5,"pane4":79.5,"vgroup":160} | tolerance.dimension 1px: 79.5 = 80 - 0.5 (the 1px line sits inside the 160) |
| 통과 | R9 I-726 nested: pane above a nested row at min_drag_height | 100 | 100 |  |
| 통과 | R9 I-726 nested: nested row below the line at min_drag_height | 100 | 100 |  |
| 통과 | R9 I-726 unequal ratios: pane 2 not below min_drag_width | true | true |  |
| 통과 | R9 I-726 unequal ratios: pane 1 not below min_drag_width | true | true |  |
| 통과 | R9 I-730 Shift+Escape zooms the active Pane | true | true |  |
| 통과 | R9 pane.zoomed_padding = 8 on all four sides of the body | [8,8,8,8] | [8,8,8,8] |  |
| 통과 | R9 pane.zoomed_border = 1px solid | ["1px","solid"] | ["1px","solid"] |  |
| 통과 | R9 zoomed border color = --border | rgb(49, 50, 68) | rgb(49, 50, 68) |  |
| 통과 | R9 zoom covers the body (Dock included when open) | zoomed pane left = .workspace-body left + 8 | {"paneL":308,"bodyL":300,"dockHidden":false,"dockL":300,"dockR":540} |  |
| 통과 | R9 I-730 zoomed: button label Zoom Out + selected | ["Zoom Out",true] | ["Zoom Out",true] |  |
| 통과 | R9 zoomed button background = --ghost-element-selected | rgba(111, 114, 141, 0.4) | rgba(111, 114, 141, 0.4) |  |
| 통과 | R9 L-245 tooltip while zoomed: Zoom Out + Shift-Escape | [{"title":"Zoom Out","keys":"Shift-Escape","meta":null}] | [{"title":"Zoom Out","keys":"Shift-Escape","meta":null}] |  |
| 통과 | R9 I-737 Shift+Escape again un-zooms | false | false |  |
| 통과 | R9 unzoomed button: Zoom In, not selected | ["Zoom In",false] | ["Zoom In",false] |  |
| 기록 | R9 L-245 observation: tooltip text after Shift+Escape toggled the zoom with the pointer still on the button | (info) | Zoom Out Shift-Escape |  |
| 통과 | R9 L-245 tooltip unzoomed: Zoom In + Shift-Escape | [{"title":"Zoom In","keys":"Shift-Escape","meta":null}] | [{"title":"Zoom In","keys":"Shift-Escape","meta":null}] |  |
| 통과 | R9 zoom button click zooms its pane | 2 | 2 |  |
| **불일치** | R9 I-730/I-732 while zoomed, Ctrl+K Ctrl+Left makes the left Pane active and releases the zoom | {"zoomed":false,"focusPane":"1"} | {"zoomed":true,"focusPane":"2"} |  |
| 통과 | R9 I-730 a split made from the zoomed Pane: new Pane becomes active, zoom releases | zoom released | {"before":2,"after":{"zoomed":null,"active":"3"}} |  |
| 통과 | R9 I-707 popup order: Split Right, Left, Up, Down | ["Split Right","Split Left","Split Up","Split Down"] | ["Split Right","Split Left","Split Up","Split Down"] |  |
| 기록 | R9 I-706 popup shows each item's key | key per item | ["Split Right Ctrl-K Right","Split Left Ctrl-K Left","Split Up Ctrl-K Up","Split Down Ctrl-K Down"] |  |
| 통과 | R9 I-706 popup anchored at its top right: popup right edge = button right edge | 957.5 | 957.5 |  |
| 통과 | R9 I-706 popup top = button bottom | 59.5 | 59.5 |  |
| 통과 | R9 L-244 no tooltip while the menu is open | true | true |  |
| 통과 | R9 I-707 popup Split Down on an editor = ClonePane: pane 1 becomes v[1, new] | v | v |  |
| 통과 | R9 I-708 clone holds only the active item | ["b.txt"] | ["b.txt"] |  |
| 통과 | R9 L-244 tooltip: Split Pane (text only) | [{"title":"Split Pane","keys":null,"meta":null}] | [{"title":"Split Pane","keys":null,"meta":null}] |  |
| 통과 | R9 L-243 tooltip: New… (text only) | [{"title":"New…","keys":null,"meta":null}] | [{"title":"New…","keys":null,"meta":null}] |  |
| 통과 | R9 I-706 end buttons only on the focused Pane | ["1"] | ["1"] |  |
| 통과 | R9 I-706 with the split menu open (focus in the menu) the buttons stay on that Pane | ["1"] | ["1"] |  |
| 통과 | R9 I-713/I-732 Right from the tall left Pane: the Pane under the edge's middle point (3), not the first in reading order (2) | 3 | 3 |  |
| 통과 | R9 I-732 Up from Pane 3 | 2 | 2 |  |
| 통과 | R9 I-732 Down from Pane 2 | 3 | 3 |  |
| 통과 | R9 I-732 Left from Pane 3 | 1 | 1 |  |
| 통과 | R9 I-732 Left from the short Pane 2: the one Pane on that side (1) | 1 | 1 |  |
| 통과 | R9 I-732 Left from the leftmost Pane (edge) | stays (no Pane past the edge; the Dock/sidebar jump is not in R-9's list) | {"pane":1} |  |
| 통과 | R9 I-732 Right from the rightmost Pane stays | 3 | 3 |  |
| 통과 | R9 I-732 the moved focus lands in the Pane's editor | true | true |  |
| 통과 | R9 I-728 last tab closed: the Pane leaves the group, the one remaining sibling folds into its parent | [1,2] | [1,2] |  |
| 통과 | R9 I-728 folded group: equal widths again | true | true |  |
| 통과 | R9 I-728 down to one Pane: the group is gone (single Pane root) | 1 | 1 |  |
| 통과 | R9 I-728 the only root Pane stays as an empty area (window not closed) | [1,[]] | [1,[]] |  |
| 통과 | R9 I-707 empty Pane: the split button is disabled | disabled (end buttons show only with focus) | {"disabled":true} |  |
| 통과 | R9 I-707 empty Pane with focus: the split button is disabled | disabled | {"disabled":true} |  |
| 통과 | R9 I-708 Ctrl+\ in an empty Pane makes no new Pane | 1 | 1 |  |
| 통과 | D-8 typing in Pane 1 shows at once in Pane 2 | same 1 of the file\|same 2 of theZ file\|same 3 of the file | same 1 of the file\|same 2 of theZ file\|same 3 of the file |  |
| 통과 | D-8 the modified dot is on both tabs | [[true],[true]] | [[true],[true]] |  |
| 기록 | D-8 observation: Ctrl+Z in Pane 2 (the view that did not type) | (info) undo of an edit typed in the other view | {"pane1":true,"pane2":true} | no undo: the edit stays in both |
| 통과 | D-8 Ctrl+Z in Pane 1 (where it was typed) undoes it in both views | ["same 1 of the file\|same 2 of the file\|same 3 of the file","same 1 of the file\|same 2 of the file\|same 3 of the file"] | ["same 1 of the file\|same 2 of the file\|same 3 of the file","same 1 of the file\|same 2 of the file\|same 3 of the file"] |  |
| 통과 | D-8 undo back to the saved text clears the dot in both (one saved state) | [[false],[false]] | [[false],[false]] |  |
| 통과 | I-069 closing one view of a modified buffer shown elsewhere asks nothing (tab closed at once, single Pane left) | 1 | 1 |  |
| 통과 | I-069 the other view keeps the unsaved edit | ["same.txt:true"] | ["same.txt:true"] |  |
| 통과 | I-707 a preview (cannot be cloned) with 2 tabs in the Pane: the split button is enabled (MovePane) | {"disabled":false} | {"disabled":false} |  |
| 통과 | I-709 MovePane: the preview moves to the new right Pane, the source stays (not copied) | [["notes.md"],["Preview notes.md"]] | [["notes.md"],["Preview notes.md"]] |  |
| 통과 | I-707 a lone preview tab in a Pane: the split button is disabled | {"disabled":true} | {"disabled":true} |  |
| 통과 | I-708 Ctrl+K Right with a preview as the active item makes no new Pane | 2 | 2 |  |
| 통과 | R10 console errors during "SB6 split by MovePane / disabled for a lone preview / self drops" | 0 exceptions | [] |  |
| **불일치** | R10 dropping on its own tab: no drop mark while over it, and nothing moves | [0,"a.txt,b.txt,c.txt"] | [1,"a.txt,b.txt,c.txt"] |  |
| 통과 | R10 dropping on the center of its own Pane: nothing happens (no overlay, no move, no split) | [null,"a.txt,b.txt,c.txt",1] | [null,"a.txt,b.txt,c.txt",1] |  |
| **불일치** | R10 console errors during "SB7 no-op drops (own tab, own Pane center) and a drag without a target" | 0 exceptions | ["TypeError: Cannot read properties of null (reading 'pane')     at lineOn (http://tauri.localhost/assets/index-DkqoEHjK.js:268:18603)","TypeError: Cannot read properties of null (reading 'pane')     at lineOn (http://tauri.local… |  |

### R-10 탭 드래그와 03-tauri R-01

| 판정 | 항목 | 기대값 | 측정값 | 비고 |
| --- | --- | --- | --- | --- |
| 통과 | R10 I-715 target tab after the dragged one: line on its RIGHT | ["1",2,"right"] | ["1",2,"right"] |  |
| 통과 | R10 pane.tab_drop_line_width = 2 | 2px | 2px |  |
| 통과 | R10 I-715 right line at the tab's right edge | 0px | 0px |  |
| 통과 | R10 I-715 line color = --drop-target-border | rgb(215, 218, 223) | rgb(215, 218, 223) |  |
| 통과 | R10 I-715 target tab background = --drop-target-background | rgba(49, 50, 68, 0.4) | rgba(49, 50, 68, 0.4) |  |
| 통과 | R10 I-715 same Pane reorder lands in the target's place | b.txt,c.txt,a.txt,d.txt | b.txt,c.txt,a.txt,d.txt |  |
| 통과 | R10 I-715 target tab before the dragged one: line on its LEFT | ["1",0,"left"] | ["1",0,"left"] |  |
| 통과 | R10 left line at the tab's left edge | 0px | 0px |  |
| 통과 | R10 I-715 reorder: d goes to b's place | d.txt,b.txt,c.txt,a.txt | d.txt,b.txt,c.txt,a.txt |  |
| 기록 | R10 Escape during a tab drag cancels (order and active tab unchanged) | d.txt*,b.txt,c.txt,a.txt | d.txt,b.txt*,c.txt,a.txt | 순서는 그대로(취소 성립). 놓을 때 누른 탭이 활성이 됨(click 합성). 01-zed에 취소 뒤 활성 탭 규칙이 없어 기록만 한다 |
| 통과 | R10 Escape: no drop marks remain | false | false |  |
| 통과 | R10 I-716 free tab-bar space is an end target (this Pane) | 1 | 1 |  |
| 통과 | R10 pane.tab_bar_end_drop_min_width = 24 (flex-basis; grows, no shrink) | 24px,1,0 | 24px,1,0 |  |
| 통과 | R10 I-716 end area height = tab.bar_height (32) | 32 | 32 |  |
| 통과 | R10 I-716 end target background = --drop-target-background | rgba(49, 50, 68, 0.4) | rgba(49, 50, 68, 0.4) |  |
| 통과 | R10 I-716 dropped at the very end | b.txt,c.txt,a.txt,d.txt | b.txt,c.txt,a.txt,d.txt |  |
| 통과 | R10 console errors during "S1 reorder + marks" | 0 exceptions | [] |  |
| **불일치** | R10 I-715 natural drag a -> c (small moves from the own tab): the drop line is drawn on c | ["2"] | [] |  |
| 통과 | R10 after the drop exactly one tab carries the active class | 1 | 1 |  |
| **불일치** | R10 console errors during "S2 natural drag from the own tab" | 0 exceptions | ["TypeError: Cannot read properties of null (reading 'pane')     at lineOn (http://tauri.localhost/assets/index-DkqoEHjK.js:268:18603)","TypeError: Cannot read properties of null (reading 'pane')     at lineOn (http://tauri.local… |  |
| 통과 | R10 I-712/I-713 pointer left zone (1011,443): overlay = left | left | left |  |
| 통과 | R10 I-714 left overlay: left half of the body (w = 50%, h = 100%, at 0,0) | [0,0,224.75,756] | [0,0,224.75,756] |  |
| 통과 | R10 I-712/I-713 pointer right zone (1420,443): overlay = right | right | right |  |
| 통과 | R10 I-714 right overlay: right half of the body | [224.75,0,224.75,756] | [224.75,0,224.75,756] |  |
| 통과 | R10 I-712/I-713 pointer top zone (1215,85): overlay = up | up | up |  |
| 통과 | R10 I-714 up overlay: top half | [0,0,449.5,378] | [0,0,449.5,378] |  |
| 통과 | R10 I-712/I-713 pointer bottom zone (1215,801): overlay = down | down | down |  |
| 통과 | R10 I-714 down overlay: bottom half | [0,378,449.5,378] | [0,378,449.5,378] |  |
| 통과 | R10 I-712/I-713 pointer center (1215,443): overlay = center | center | center |  |
| 통과 | R10 I-714 center overlay: the whole body | [0,0,449.5,756] | [0,0,449.5,756] |  |
| 통과 | R10 I-714 overlay color = --drop-target-background, no border, no radius | ["rgba(49, 50, 68, 0.4)","0px","0px"] | ["rgba(49, 50, 68, 0.4)","0px","0px"] |  |
| 통과 | R10 I-712/I-713 pointer just inside the left zone (1079,443): overlay = left | left | left |  |
| 통과 | R10 I-712/I-713 pointer just outside the left zone (1082,443): overlay = center | center | center |  |
| 통과 | R10 I-712/I-713 pointer just inside the top zone (1215,153): overlay = up | up | up |  |
| 통과 | R10 I-712/I-713 pointer just outside the top zone (1215,156): overlay = center | center | center |  |
| 통과 | R10 I-712/I-713 pointer top-left corner 30/30 (1021,95): overlay = up | up | up |  |
| 통과 | R10 I-712/I-713 pointer top-left 10/40 (1001,105): overlay = left | left | left |  |
| 통과 | R10 I-712/I-713 pointer top-left 40/10 (1031,75): overlay = up | up | up |  |
| 통과 | R10 I-712/I-713 pointer bottom-right 30/30 (1410,791): overlay = right | right | right |  |
| 통과 | R10 I-712/I-713 pointer bottom-left 30/30 (1021,791): overlay = down | down | down |  |
| 통과 | R10 I-712/I-713 pointer top-right 30/30 (1410,95): overlay = up | up | up |  |
| 통과 | R10 Escape in the body zone: nothing was moved | ["a.txt,b.txt,c.txt,d.txt"] | ["a.txt,b.txt,c.txt,d.txt"] |  |
| 통과 | R10 console errors during "S3a overlays on the other Pane's body" | 0 exceptions | [] |  |
| 통과 | R10 I-715 other Pane's tab: line on its LEFT | ["2",0,"left"] | ["2",0,"left"] |  |
| 통과 | R10 I-715 moved to that tab's place in the other Pane (source loses it) | ["a.txt,c.txt,d.txt","b.txt,d.txt"] | ["a.txt,c.txt,d.txt","b.txt,d.txt"] |  |
| 통과 | R10 I-717 body center: lands right after the active tab | a.txt | a.txt |  |
| 통과 | R10 I-717 body center: source Pane lost the tab | c.txt,d.txt | c.txt,d.txt |  |
| 통과 | R10 I-718 Ctrl at release: the source keeps the tab | c.txt,d.txt | c.txt,d.txt |  |
| 통과 | R10 I-718 Ctrl at release: the target gains one more tab | 4 | 4 |  |
| 기록 | R10 I-718 where the copy is put (no position given) | (info) end vs after the active tab | {"before":"b.txt,a.txt,d.txt","after":"b.txt,a.txt,c.txt,d.txt"} |  |
| 통과 | R10 I-717 right edge: a new Pane right of P2 in the same row (equal flex) | 1,2,3 | 1,2,3 |  |
| 통과 | R10 I-717 right edge: the new Pane holds only the moved tab | ["c.txt"] | ["c.txt"] |  |
| 통과 | R10 I-724 a new sibling in a same-axis group resets flex: equal widths | true | true |  |
| 통과 | R10 I-723 top edge: P1 is wrapped in a v group, the new Pane above it | v | v |  |
| 통과 | R10 I-717 EmptyPane+move: the new upper Pane holds only the moved tab | 1 | 1 |  |
| 통과 | R10 console errors during "S3b drops: edge split, center move, Ctrl copy, preview becomes normal" | 0 exceptions | [] |  |
| 통과 | R10 I-717 dragged tab was a preview tab (precondition) and is now a normal tab | [true,false] | [true,false] |  |
| 통과 | R10 console errors during "S3c preview tab dragged becomes normal; pin boundary" | 0 exceptions | [] |  |
| 통과 | R10 I-713 tie top-left 30/30 (up = left): distances to up/right/down/left = 30/419.5/726/30 -> up | up | up |  |
| 통과 | R10 I-713 tie bottom-left 30/30 (down = left): distances to up/right/down/left = 726/419.5/30/30 -> down | down | down |  |
| 통과 | R10 I-713 tie top-left 20/20: distances to up/right/down/left = 20/429.5/736/20 -> up | up | up |  |
| 통과 | R10 console errors during "S4a exact ties in P1 (integer left edge)" | 0 exceptions | [] |  |
| 통과 | R-01 precondition: scrolled (>0) and a non-empty selection | [true,true] | [true,true] |  |
| 통과 | R-01 edge split: the same DOM object, still connected, in the new Pane | [true,2] | [true,2] |  |
| 통과 | R-01 edge split: scrollTop equal | 777 | 777 |  |
| **불일치** | R-01 edge split: selection equal | [114,117] | [0,0] |  |
| 통과 | R-01 DOM path of the editor | .pane-body > .pane-item > .cm-editor | pane-item > cm-editor / pane-body |  |
| 통과 | R-01 tab move: the same DOM object, connected, in Pane 1 | [true,1] | [true,1] |  |
| 통과 | R-01 tab move: scrollTop equal | 777 | 777 |  |
| **불일치** | R-01 tab move: selection equal | [114,117] | [0,0] |  |
| 통과 | R-01 an editor sits in .pane-body > .pane-item > .cm-editor | true | true |  |
| 통과 | R-01 after the moves the editor still takes input (doc +1) | 10393 | 10393 |  |
| 통과 | R10 console errors during "S4b R-01 EditorView survives moves (identity, scroll, selection)" | 0 exceptions | [] |  |
| 통과 | R10 I-719 normal tab dropped inside the pinned area becomes pinned (pinned count 3) | [true,3] | [true,3] |  |
| 통과 | R10 I-719 pinned tab dropped past the pinned area becomes normal (pinned count 2) | [false,2] | [false,2] |  |
| 통과 | R10 I-720 a pinned tab put at index 0 of another Pane stays pinned | ["a.txt",true] | ["a.txt",true] |  |
| 통과 | R10 I-720 a pinned tab put into the normal part of another Pane (bar end) is not pinned | false | false |  |
| 통과 | R10 console errors during "S4c pins and drops" | 0 exceptions | [] |  |

### R-11 마크다운 미리보기

| 판정 | 항목 | 기대값 | 측정값 | 비고 |
| --- | --- | --- | --- | --- |
| 통과 | E-038 toolbar exists on a Markdown editor tab | true | true |  |
| 통과 | E-038 toolbar.padding_y / padding_x (6 / 8) | ["6px","6px","8px","8px"] | ["6px","6px","8px","8px"] |  |
| 통과 | E-038 toolbar.border_bottom = 1 in --border-variant | ["1px","rgb(44, 41, 61)"] | ["1px","rgb(44, 41, 61)"] |  |
| 통과 | E-038 toolbar.min_height = 32 (min-height; the box is 6+22+6+1 = 35 tall) | ["32px",true] | ["32px",true] |  |
| 통과 | E-038 toolbar background = --toolbar-background | rgb(30, 30, 46) | rgb(30, 30, 46) |  |
| 통과 | E-038 quick actions gap = 1 | 1px | 1px |  |
| 통과 | E-039 preview button icon = icons.size.small (14) | 14 | 14 |  |
| 통과 | E-039 button aria-label | Preview Markdown | Preview Markdown |  |
| 통과 | E-039 tooltip: Preview Markdown + Ctrl-Shift-V + meta line | [{"title":"Preview Markdown","keys":"Ctrl-Shift-V","meta":"Alt-Click to open in a split"}] | [{"title":"Preview Markdown","keys":"Ctrl-Shift-V","meta":"Alt-Click to open in a split"}] |  |
| 통과 | E-038 no toolbar on a non-Markdown tab | 0 | 0 |  |
| 통과 | I-077/I-080 button: a 'Preview notes.md' tab opens in the same Pane, source tab stays | ["notes.md","Preview notes.md*"] | ["notes.md","Preview notes.md*"] |  |
| 통과 | L-69 preview tab icon = FileDoc, Small (14), Muted (--icon-muted) | [true,14,"rgb(127, 132, 156)"] | [true,14,"rgb(127, 132, 156)"] |  |
| 통과 | I-064/L-68 preview tab title is not italic | normal | normal |  |
| 통과 | I-079 opening the same source's preview again activates the existing tab (still 1) | [1,"Preview notes.md"] | [1,"Preview notes.md"] |  |
| 통과 | I-077 focus goes to the preview | preview | {"tag":"DIV","cls":"markdown-preview","pane":1,"inEditor":false,"inPreview":true,"inMenu":false} |  |
| 통과 | L-102 markdown_preview.container_padding = 16 (all sides) | ["16px","16px","16px","16px"] | ["16px","16px","16px","16px"] |  |
| 통과 | L-101 markdown_preview.max_width = 800 | 800 | 800 |  |
| 통과 | L-101 body is centred in the preview's client area (gap left = gap right of the scrollbar) | true | true |  |
| 통과 | L-103 body.font_size = 16 | 16px | 16px |  |
| 통과 | L-103 body.line_height_multiplier 1.5 -> 24px | 24px | 24px |  |
| 통과 | L-103 paragraph_gap = 16 (between two paragraphs) | 16 | 16 |  |
| 통과 | L-103 list_gap = 12 (read as the gap between list items) | 12 between li and li (PROGRESS: 'li + li' reading) | {"gap":12} | the source does not say which gap list_gap is (P3-4) |
| 통과 | L-104 h1.font_size = 28 | 28 | 28 |  |
| 통과 | L-104 h1 font-weight 600, line-height = size x 1.25 | ["600",35] | ["600",35] |  |
| 통과 | L-105 h1 padding_bottom 8 + border_bottom 1 in --border-variant | ["8px","1px","rgb(44, 41, 61)"] | ["8px","1px","rgb(44, 41, 61)"] |  |
| 통과 | L-104 h2.font_size = 22.4 | 22.4 | 22.4 |  |
| 통과 | L-104 h2 font-weight 600, line-height = size x 1.25 | ["600",28] | ["600",28] |  |
| 통과 | L-105 h2 padding_bottom 4 + border_bottom 1 in --border-variant | ["4px","1px","rgb(44, 41, 61)"] | ["4px","1px","rgb(44, 41, 61)"] |  |
| 통과 | L-104 h3.font_size = 19.2 | 19.2 | 19.2 |  |
| 통과 | L-104 h3 font-weight 600, line-height = size x 1.25 | ["600",24] | ["600",24] |  |
| 통과 | L-104 h4.font_size = 16 | 16 | 16 |  |
| 통과 | L-104 h4 font-weight 600, line-height = size x 1.25 | ["600",20] | ["600",20] |  |
| 통과 | L-104 h5.font_size = 14 | 14 | 14 |  |
| 통과 | L-104 h5 font-weight 600, line-height = size x 1.25 | ["600",17.5] | ["600",17.5] |  |
| 통과 | L-104 h6.font_size = 13.6 | 13.6 | 13.6 |  |
| 통과 | L-104 h6 font-weight 600, line-height = size x 1.25 | ["600",17] | ["600",17] |  |
| 통과 | L-104 h6 color = --text-muted | rgb(186, 194, 222) | rgb(186, 194, 222) |  |
| 통과 | L-106 blockquote padding_left 16, border_left 4 in --border, text --text-muted | ["16px","4px","rgb(49, 50, 68)","rgb(186, 194, 222)"] | ["16px","4px","rgb(49, 50, 68)","rgb(186, 194, 222)"] |  |
| 통과 | L-107 table.border_outer = 1.5 in --border | 1.5px (computed value at DPR 1 is snapped by the engine) | {"width":"1px","color":"rgb(49, 50, 68)","want":"rgb(49, 50, 68)"} | device-pixel snapping: 1.5px is drawn as 1px at 100% (within tolerance.dimension 1px) |
| 통과 | L-107 table.corner_radius = 4 | 4px | 4px |  |
| 통과 | L-107 cell padding 4 x 10 | ["4px","10px","4px","10px"] | ["4px","10px","4px","10px"] |  |
| 통과 | L-107 table.cell_border = 1 in --border | ["1px","rgb(49, 50, 68)"] | ["1px","rgb(49, 50, 68)"] |  |
| 통과 | L-107 header cell weight 600 | 600 | 600 |  |
| 통과 | L-107 header row background = --title-bar-background (th, row or thead) | rgb(17, 17, 27) | rgb(17, 17, 27) |  |
| 통과 | L-107 zebra: odd body rows (0-based even index, 0, 2) have no fill; the 'odd-numbered' rows (index 1) --panel-background | [false,true,false] | [false,true,false] |  |
| 통과 | L-107 alignment classes (left / center / right) -> text-align | ["align-left:left","align-center:center","align-right:right"] | ["align-left:left","align-center:center","align-right:right"] |  |
| 통과 | L-108 link color = --text-accent | rgb(203, 166, 247) | rgb(203, 166, 247) |  |
| 통과 | L-108 link underline: thickness 1, opacity 0.5 | underline, 1px, color = accent at alpha 0.5 | {"line":"underline","thickness":"1px","color":"color(srgb 0.796078 0.65098 0.968627 / 0.5)","accent":"rgb(203, 166, 247)"} |  |
| 통과 | L-109 inline_code.font_size = 14 | 14px | 14px |  |
| 통과 | L-109 inline_code.background_opacity = 0.08 | 0.08 | 0.08 |  |
| 통과 | L-109 code_block.padding = 12 | ["12px","12px","12px","12px"] | ["12px","12px","12px","12px"] |  |
| 통과 | L-109 code_block.margin_y = 16 | ["16px","16px"] | ["16px","16px"] |  |
| 통과 | L-109 code_block.corner_radius = 6 | 6px | 6px |  |
| 기록 | L-109 code block background | (source gives no color) | rgba(0, 0, 0, 0) | P3-4: not set by the renderer |
| 통과 | L-110/L-111 frontmatter block is a two-column table (grid) with title/author rows | [true,2,"Hello"] | [true,2,"Hello"] |  |
| 통과 | L-111 frontmatter.border 1 in --border, corner_radius 4 | ["1px","rgb(49, 50, 68)","4px"] | ["1px","rgb(49, 50, 68)","4px"] |  |
| 통과 | L-111 frontmatter key cell weight 600, value cell border_left 1 | ["600","1px"] | ["600","1px"] |  |
| 통과 | L-111 frontmatter.row_border_top = 1 (2nd row; first row has none) | ["0px","1px"] | ["0px","1px"] |  |
| 기록 | L-111 frontmatter cell padding | (source gives no value; P3-4: 0) | ["0px","0px"] |  |
| 통과 | R-04 blocks carry data-line / data-line-end (frontmatter 0-4, h1 at 5) | ["DIV:0-4","H1:5-6"] | ["DIV:0-4","H1:5-6"] |  |
| 통과 | R10 console errors during "SD1 preview styles" | 0 exceptions | [] |  |
| 통과 | L-110 front matter with a blank line / nested YAML is not a table: shown as a code box with the original text | [false,"title: Hello\n\nnested:\n  a: 1"] | [false,"title: Hello\n\nnested:\n  a: 1"] |  |
| 통과 | R-04 line numbers after a frontmatter stay the file's (file: --- / 4 front lines / --- / blank / # Body = 0-based line 7) | 7 | 7 |  |
| 통과 | D-10 rendered DOM: no <script>, no event attributes, no style attributes | [0,[],[]] | [0,[],[]] |  |
| 통과 | D-10 no javascript: links survive; the allowed relative link stays | [[],true] | [[],true] |  |
| 통과 | D-10 nothing from the document ran (window.__xss unset) | null | null |  |
| 통과 | D-10 raw HTML in the source is shown as text, not parsed (the script text is visible) | true | true |  |
| 통과 | R-11 table alignment uses classes (align-center / align-right), no style | ["align-center","align-right","align-center","align-right"] | ["align-center","align-right","align-center","align-right"] |  |
| 통과 | R-11 CSP violations while rendering these documents: 0 | [] | [] |  |
| 통과 | L-69/L-26 preview tab title keeps the first tab.max_title_chars (24) characters, then an ellipsis | [24,24,"…"] | [24,24,"…"] |  |
| 통과 | D-10 project panel right-click on a .md has 'Open Markdown Preview', enabled | [true,false] | [true,false] |  |
| 통과 | D-10 choosing it opens 'Preview other.md' in the active Pane | true | true |  |
| 통과 | D-10 a non-Markdown file's menu has no 'Open Markdown Preview' | false | false |  |
| 통과 | R10 console errors during "SD2 frontmatter raw, XSS document, title truncation, tree menu" | 0 exceptions | [] |  |
| 통과 | I-078 Alt+Click on the preview button with no right neighbour: a new right split | ["h",["notes.md"],["Preview notes.md"]] | ["h",["notes.md"],["Preview notes.md"]] |  |
| **불일치** | I-078 focus stays in the source editor (Pane 1) | [1,true] | [null,false] |  |
| 통과 | I-082 the edit shows in the preview without saving | true | true |  |
| 통과 | I-082 the source tab is still modified (preview did not wait for a save) | true | true |  |
| 통과 | I-082 time from key to the preview update (3 edits, ms), parse_debounce 200 | recorded; about parse_debounce (200 ms) + render | [220.2,220.6,221.1] | median 220.6 ms |
| 통과 | I-083 the block holding the cursor line gets the active class (source line 7 = '## Heading 2') | ["H2","7"] | ["H2","7"] |  |
| 기록 | I-083 active block look | (source gives no style value; class only) | {"bg":"rgba(0, 0, 0, 0)","outline":"none"} | P3-4: not drawn |
| 기록 | I-083 cursor on a blank line between blocks | (info) no block marked | {"blank":true} |  |
| 통과 | I-083 cursor moved far down (4 x PageDown): the active block is a Filler paragraph and the preview scrolled so it is in view | [true,true] | [true,true] |  |
| 통과 | I-083 cursor back to the top: scrolls back so the block shows | true | true |  |
| 통과 | I-084 click on a block moves the source cursor to that block's first line start | [9,0] | [9,0] |  |
| 통과 | I-084 focus is not moved to the source editor (source has no focus; focus is in the preview Pane) | [false,2] | [false,2] |  |
| 통과 | I-085 local .md link: opens 'Preview other.md' in the same Pane (relative to the source's folder) | true | true |  |
| 통과 | I-085 Alt+click on a local .md link: opens the file as an editor tab (deep.md, not 'Preview deep.md') | [true,false] | [true,false] |  |
| 통과 | I-085 local non-Markdown link: editor tab a.txt | true | true |  |
| 통과 | I-085 mailto: link | a notification (opener refuses the scheme; text is the opener's error) | ["Not allowed to open url mailto:a@b.c"] |  |
| 통과 | R10 console errors during "SD3 preview behaviors" | 0 exceptions | [] |  |
| 통과 | I-078 Ctrl+K V with a right neighbour: the preview opens in that Pane (still 2 Panes; right Pane gets the 3rd tab) | [2,3,true] | [2,3,true] |  |
| 통과 | I-078 Ctrl+K V keeps the focus in the source editor | [1,true] | [1,true] |  |
| 통과 | I-077/I-044 Ctrl+Shift+V in a Markdown editor: a preview tab next to the source in the same Pane, focus in the preview | [true,true] | [true,true] |  |
| 통과 | I-086 Ctrl+Shift+V in the preview: preview closed, source tab active with focus, edit kept | [false,"notes.md",true,true] | [false,"notes.md",true,true] |  |
| 통과 | I-086 precondition: 'Preview other.md' open, no 'other.md' editor tab | [true,false] | [true,false] |  |
| 통과 | I-086 source tab not open: Ctrl+Shift+V opens it (other.md), preview closed | [true,false,true] | [true,false,true] |  |
| 통과 | R10 console errors during "SD4a Ctrl+K V, Ctrl+Shift+V cases" | 0 exceptions | [] |  |
| 측정 불가(환경) | I-085 an http URL link reaches the OS (probe server request) | /probe requested by the default browser | [] | no browser request arrived |
| 측정 불가(환경) | I-085 what Windows did with the link | the default browser opens | {"openWithProcessesLeft":0,"foreground":"OpenWith/Open With","pickerClosed":true} | Windows' 'Open with' picker came up (class 'Open With', process OpenWith); the measurement closed it |
| 통과 | I-085 no leftover picker after closing it | 0 | 0 |  |
| 통과 | R10 console errors during "SD4b external link opens the default browser (probe server)" | 0 exceptions | [] |  |
| 통과 | precondition: the unsaved edit is shown in the preview | true | true |  |
| 통과 | the source tab 'notes.md' is closed (only the preview remains) | true | true |  |
| 통과 | the remaining preview shows the disk text again (no EDIT) | false | false |  |
| 통과 | R10 console errors during "SD5 Don't Save returns the preview to the disk text" | 0 exceptions | [] |  |

### R-14 메뉴·툴팁·키맵

| 판정 | 항목 | 기대값 | 측정값 | 비고 |
| --- | --- | --- | --- | --- |
| 통과 | R-14 menu bar: app name, File, Edit, View, Go, Window (no Selection / Help: I-306) | ["workbench-tauri","File","Edit","View","Go","Window"] | ["workbench-tauri","File","Edit","View","Go","Window"] |  |
| 통과 | R-14 app menu | Quit workbench-tauri \| Ctrl-Q | ["Quit workbench-tauri\|Ctrl-Q"] |  |
| 통과 | R-14 File menu rows and keys (no tab open) | ["Open Folder...","---","Save\|Ctrl-S","---","Close Editor","Close Window\|Ctrl-Shift-W"] | ["Open Folder...","---","Save\|Ctrl-S","---","Close Editor","Close Window\|Ctrl-Shift-W"] |  |
| 통과 | R-14 Edit menu rows and keys (no tab open) | ["Undo\|Ctrl-Z","Redo\|Ctrl-Shift-Z"] | ["Undo\|Ctrl-Z","Redo\|Ctrl-Shift-Z"] |  |
| 통과 | R-14 View menu rows and keys (no tab open) | ["Toggle Left Dock\|Ctrl-B","Toggle Folder Sidebar\|Ctrl-Alt-J","Focus Folder Sidebar\|Ctrl-Alt-;","Split Up\|Ctrl-K Up","Split Down\|Ctrl-K Down","Split Left\|Ctrl-K Left","Split Right\|Ctrl-\\","Maximize Pane\|Shift-Escape","--… | ["Toggle Left Dock\|Ctrl-B","Toggle Folder Sidebar\|Ctrl-Alt-J","Focus Folder Sidebar\|Ctrl-Alt-;","Split Up\|Ctrl-K Up","Split Down\|Ctrl-K Down","Split Left\|Ctrl-K Left","Split Right\|Ctrl-\\","Maximize Pane\|Shift-Escape","--… |  |
| 통과 | R-14 Go menu rows and keys (no tab open) | ["Previous Tab\|Ctrl-PageUp","Next Tab\|Ctrl-PageDown"] | ["Previous Tab\|Ctrl-PageUp","Next Tab\|Ctrl-PageDown"] |  |
| 통과 | R-14 Window menu rows and keys (no tab open) | ["Minimize","Zoom"] | ["Minimize","Zoom"] |  |
| 기록 | R-14 † markers in labels | (info) the dagger marks Zed-only rows in the table | {"shown":false} |  |
| 통과 | R-14 no tab open: the two Open Markdown Preview rows are disabled | ["Open Markdown Preview","Open Markdown Preview to the Side"] | ["Open Markdown Preview","Open Markdown Preview to the Side"] |  |
| 통과 | R-14 non-Markdown tab: the Markdown preview rows are disabled | ["Open Markdown Preview","Open Markdown Preview to the Side"] | ["Open Markdown Preview","Open Markdown Preview to the Side"] |  |
| 통과 | R-14 txt editor focus: View shows Redo/Split Right keys the same (Edit Redo) | ["Redo\|Ctrl-Shift-Z","Split Right\|Ctrl-\\"] | ["Redo\|Ctrl-Shift-Z","Split Right\|Ctrl-\\"] |  |
| 통과 | R-14 Maximize Pane / Project Panel shown unchanged with an editor focused | ["Maximize Pane\|Shift-Escape"] | ["Maximize Pane\|Shift-Escape"] |  |
| 통과 | R-14 Markdown editor tab: both preview rows enabled | [] | [] |  |
| 통과 | R-14 Markdown editor focus: keys shown for preview rows | ["Open Markdown Preview\|Ctrl-Shift-V","Open Markdown Preview to the Side\|Ctrl-K V"] | ["Open Markdown Preview\|Ctrl-Shift-V","Open Markdown Preview to the Side\|Ctrl-K V"] |  |
| 통과 | I-515 keyboard Down skips the disabled preview rows (they are never selected) | false | false |  |
| 통과 | R-14 a preview tab active: the preview rows are disabled | ["Open Markdown Preview","Open Markdown Preview to the Side"] | ["Open Markdown Preview","Open Markdown Preview to the Side"] |  |
| 통과 | R10 console errors during "SE1 menu rows" | 0 exceptions | [] |  |
| 통과 | I-711 View > Split Right: clone of the active item in a new right Pane | ["h",["a.txt","notes.md"],["notes.md"]] | ["h",["a.txt","notes.md"],["notes.md"]] |  |
| 통과 | I-711 View > Split Down on the right Pane: v group | v | v |  |
| 통과 | I-737 View > Maximize Pane zooms the active Pane | true | true |  |
| 통과 | I-737 View > Maximize Pane again un-zooms | false | false |  |
| 통과 | I-010 Go > Next Tab / Previous Tab step through the Pane's tabs | 3 | 3 |  |
| 통과 | I-010 Go > Next Tab then Previous Tab | tab changes and comes back | ["notes.md","a.txt","notes.md"] |  |
| 통과 | R-14 Edit > Undo / Redo act on the active editor | typed text removed by Undo, back by Redo | ["Z---\ntitle: ","---\ntitle: H","Z---\ntitle: "] |  |
| 통과 | R-14 File > Save writes the active tab (modified dot gone) | [true,false] | [true,false] |  |
| 통과 | R-14 View > Open Markdown Preview opens the preview in this Pane | true | true |  |
| 통과 | R10 console errors during "SE2 menu actions" | 0 exceptions | [] |  |
| 통과 | L-240 close × tooltip on the ACTIVE tab: Close Tab + Ctrl-W | [{"title":"Close Tab","keys":"Ctrl-W","meta":null}] | [{"title":"Close Tab","keys":"Ctrl-W","meta":null}] |  |
| 통과 | L-240 close × tooltip on an inactive tab: Close Tab, no key | [{"title":"Close Tab","keys":null,"meta":null}] | [{"title":"Close Tab","keys":null,"meta":null}] |  |
| 통과 | L-241 pin button tooltip on the active pinned tab: Unpin Tab + Ctrl-K Shift-Enter | [{"title":"Unpin Tab","keys":"Ctrl-K Shift-Enter","meta":null}] | [{"title":"Unpin Tab","keys":"Ctrl-K Shift-Enter","meta":null}] |  |
| 통과 | L-236/L-237 Go Back / Go Forward: text only (disabled buttons) | [[{"title":"Go Back","keys":null,"meta":null}],[{"title":"Go Forward","keys":null,"meta":null}]] | [[{"title":"Go Back","keys":null,"meta":null}],[{"title":"Go Forward","keys":null,"meta":null}]] |  |
| 통과 | baseline: zoom button tooltip key before keymap.json | [{"title":"Zoom In","keys":"Shift-Escape","meta":null}] | [{"title":"Zoom In","keys":"Shift-Escape","meta":null}] |  |
| 통과 | R-14 user keymap: the zoom button tooltip shows the new key (Ctrl-Alt-Z) | [{"title":"Zoom In","keys":"Ctrl-Alt-Z","meta":null}] | [{"title":"Zoom In","keys":"Ctrl-Alt-Z","meta":null}] |  |
| 통과 | R-14 user keymap: the tab menu shows 'Pin Tab' with Ctrl-Alt-P | [[{"label":"Pin Tab","keys":"Ctrl-Alt-P","disabled":false}]] | [[{"label":"Pin Tab","keys":"Ctrl-Alt-P","disabled":false}]] |  |
| 통과 | R-14 user keymap: View > Maximize Pane shows Ctrl-Alt-Z | true | true |  |
| 통과 | R-14 user keymap: Shift+Escape (unbound with null) does nothing | false | false |  |
| 통과 | R-14 user keymap: Ctrl+Alt+Z zooms | true | true |  |
| 통과 | R-14 user keymap: Ctrl+K Shift+Enter (null) does nothing; Ctrl+Alt+P toggles the pin | [1,1,0] | [1,1,0] |  |
| 통과 | R-14 user keymap: Ctrl+Shift+V in a Markdown editor (null) opens no preview | 3 | 3 |  |
| 통과 | R-14 user keymap: View > Open Markdown Preview shows no key after null (Ctrl-K V row stays) | ["Open Markdown Preview","Open Markdown Preview to the Side\|Ctrl-K V"] | ["Open Markdown Preview","Open Markdown Preview to the Side\|Ctrl-K V"] |  |
| 통과 | R-14 user keymap: deleting keymap.json restores Shift-Escape in the tooltip | [{"title":"Zoom In","keys":"Shift-Escape","meta":null}] | [{"title":"Zoom In","keys":"Shift-Escape","meta":null}] |  |
| 통과 | R10 console errors during "SE3 tooltips of the new screen elements, then keymap.json override" | 0 exceptions | [] |  |

## 4. 렌더러가 못 맞춘 값 (`%TEMP%\v04-p3-4.md` 목록 대조)

항목별로 측정값을 붙였다. "원문에 값 없음"인 것은 판정 대상이 아니라 현재 모양만 적는다.

| 항목 | 렌더러 보고 | 측정 | 판정 |
| --- | --- | --- | --- |
| L-104 제목 위 24·아래 12 | 원문이 추정, toml ID 없음, 넣지 않음 | `h1`·`h2` `margin-top`·`margin-bottom` 모두 `0px`, 제목 `id` 없음 | 반영 안 됨(SPEC 제외 범위 "원문에 추정으로 적힌 값") |
| L-103 목록 간격 12 | `li + li`로 읽음 | 항목 사이 간격 12px | 해석 의존(원문이 어느 간격인지 불명). 읽은 대로는 맞음 |
| L-109 코드 블록 배경 | 원문에 색 없음, 배경 없음 | `rgba(0, 0, 0, 0)` | 기록 |
| L-109 hover 복사 버튼 | 넣지 않음 | `pre` 안 `button` 0개 | 미구현 확인 |
| L-107 셀 선 색 | 원문에 색 없음, `--border`로 함 | 계산색 = `--border` 토큰 | 기록(토큰은 일치) |
| L-107 `table.border_outer` 1.5 | (언급 없음) | 계산값 `1px`(100%에서 엔진이 1.5px를 1px로 그림) | 허용 오차 1px 안. 200% 기준 값이라 100%에서는 1px |
| L-111 frontmatter 셀 padding | 원문에 값 없음, 0 | `0px` | 기록 |
| L-103 글꼴 | UI 글꼴은 v0.2와 같음, 코드는 버퍼 글꼴 | 본문 `"Noto Sans KR"`, 코드 `Consolas, monospace` | 기록(Zed 글꼴은 범위 밖) |
| L-69 같은 이름 겹침 설명 | 넣지 않음 | 같은 이름 두 md의 미리보기를 열어 보지 않음 | 미측정(구현 없음은 보고대로) |
| I-083 블록 강조 모양 | 스타일 값 없어 클래스만 | `.active-block` 배경 투명·`outline: none` | 기록(화면에 안 보임) |
| I-085 제목·줄/열 대상 | 앵커·줄 이동 안 함 | `[go](#heading-two)` 클릭: `scrollTop` 0 → 0, 탭 변화 없음. `a.txt#L3` 클릭: `a.txt` 편집기 탭만 열림(줄 이동 없음, 알림 없음) | 보고와 같음 |
| 표 줄무늬 | `tbody tr:nth-child(even)` | 본문 행 3개 중 두 번째만 `--panel-background`(0, 1, 0 순) | 읽은 대로 맞음 |
| 이미지 | S-9로 숨김 | (이 카드의 측정 목록에 없음) | V4 목록 |

## 5. 측정 불가·미측정

- 외부 링크(I-085, `http://127.0.0.1:19091/probe`): **기본 브라우저가 열리지 않았다.** 이 PC에서는 Windows가 '연결 프로그램 선택'(`OpenWith.exe`, 창 클래스 `Open With`)을 띄웠다. 앱 없이 `Start-Process 'http://127.0.0.1:19091/probe'`만 해도 같은 창이 뜨고 요청이 오지 않는다(기본 앱 설정의 문제로 보이며 앱 결함이 아니다). 앱 쪽은 알림 없이 `openUrl`이 지나간 것까지 보았다(capability `http://*`·`https://*` 허용). `mailto:` 링크는 알림 `Not allowed to open url mailto:a@b.c`가 떴다(통과). 내 확인 창은 닫았다. **브라우저가 실제로 열리는지는 이 환경에서 못 쟀다.**
- I-713 "가운데 점이 닿는 Pane이 없을 때 겹침이 긴 Pane → 읽는 순서": 타일 레이아웃에서 만들기 어려워 재지 않았다. V1 `split.test.ts`(63~66줄)가 덮는다.
- I-712 등호 경계: 물리 px 정수 좌표로 `d`(89.9px)와 같은 값을 만들 수 없어 ±1.5px 양쪽(가장자리/중앙)만 쟀다. 등호는 V1 `drop.test.ts`.
- I-713 완전 동거리 모서리는 정수 좌표가 가능한 P1(왼쪽 가장자리 540px)에서 위·왼쪽, 아래·왼쪽 두 쌍만 쟀다(위, 아래가 이김). 오른쪽·위, 오른쪽·아래 동거리는 폭이 449.5px라 정수 좌표를 만들 수 없어 재지 않았다.
- 폰트 렌더·실제 화면 모양(미리보기 전체, 탭 바 등)은 눈으로 판정하지 않았다(V4).
- 사용자 `keymap.json`이 틀렸을 때(없는 액션, 문법 오류) 동작은 이 카드 범위 밖이라 재지 않았다.

## 6. 메모 (leader 판단용, 불일치로 세지 않음)

- **탭을 누르면 편집기 포커스가 Pane으로 옮겨진다.** 편집기에서 글자를 선택한 뒤 탭을 한 번 누르거나 우클릭 메뉴를 열었다 닫으면 `document.activeElement`가 `SECTION.pane`이고, 편집기를 다시 눌러야 입력이 들어간다(`R8 S-7`의 "열 때의 포커스로 돌아간다"는 이 Pane 포커스로 돌아간 것이라 규칙대로다). Zed에서 어떻게 되는지는 이 카드에서 대조하지 않았다. 판단이 필요하다.
- **같은 파일을 두 Pane에서 볼 때 Ctrl+Z는 글자를 친 쪽 뷰에서만 되돌린다.** 친 쪽에서 Ctrl+Z → 양쪽이 되돌아가고 수정 점이 양쪽에서 사라진다. 다른 쪽 뷰에서 Ctrl+Z는 아무 일도 없다(`D-8 observation`). 되돌리기 기록이 뷰별로 있는 것으로 보인다.
- **Ctrl+End가 문서 끝으로 가지 않는다**(편집기, 이 카드 범위 밖). 500줄 `long.txt`에서 Ctrl+End → 37줄, 한 번 더 → 53줄(문서 끝은 501줄). 재현 2회.
- Escape로 끌기를 취소한 뒤 마우스를 놓으면 **눌렀던 탭이 활성이 된다**(click이 이어서 합성됨). 순서는 그대로다.
- Ctrl 놓기 복제는 대상 Pane의 **활성 탭 바로 다음**에 들어간다(I-718 "위치 지정 없음"이 원문에서 어디인지는 못 확인).
- 키(Shift+Escape)로 확대를 바꾸면 포인터가 아직 확대 버튼 위일 때 이미 떠 있는 툴팁 문구("Zoom Out")가 그대로 남는다. 포인터를 치우고 다시 올리면 맞다.
- 분할 팝업의 단축키 표시는 버튼을 누른 뒤 포커스(Pane)에서 찾아 `Split Right  Ctrl-K Right`이고, ☰ View의 같은 항목은 편집기 포커스에서 `Ctrl-\`다. v0.2의 "열 때의 포커스 컨텍스트에서 찾는다" 규칙대로다. 미리보기가 포커스일 때 ☰ View의 Split Right는 `Ctrl-K Right`다.
- 끌기 시작 임계가 없어(V4 목록) 누르고 1px만 움직여도 끌기가 시작된다. F-1이 이 순간에 난다.
- 미리보기 갱신 시간(`parse_debounce` 200ms): 키 입력 → 미리보기 DOM 변경 207.1 / 221.3 / 222.6ms (세 번, 중앙값 221.3ms).
- 편집기 툴바 높이 35px(6+22+6+1). `toolbar.min_height` 32는 최소 높이라 맞다.
- 확대한 Pane은 Dock까지 덮는다(본문 `.workspace-body` 안쪽 기준 사방 8px, 테두리 1px `--border`).

## 7. 정리

- `%APPDATA%\workbench-tauri\state.json`: 원래 파일로 복구, SHA-256 `77EF33FF…07C99` 일치. 다른 파일 없음(`keymap.json` 삭제).
- 시험 폴더 `%TEMP%\wb-v04-m3\` 삭제. 남은 `workbench-tauri`·`OpenWith` 프로세스 없음.
- 측정용 스크립트와 도구(`drv.ps1`, 시나리오 `.mjs`, UIA·창 목록 보조)는 모두 scratchpad(저장소 밖)에 두었다. `tools/`는 읽기만 했고 바뀐 것이 없다.
- 이 문서와 스크린샷 5장 외에 저장소 파일을 바꾸지 않았다.

## 8. 재측정 (카드 v04-M3-R1, `%TEMP%\v04-p3-6.md`의 수정 뒤)

### 8.1 조건

- 앱: 수정이 들어간 작업 트리로 `npm run tauri build -- --debug --no-bundle`를 새로 돌린 exe(2026-11-06 11:36:18, 이후 소스 변경 없음). 창·배율·입력·관측 방법·시험 폴더·`%APPDATA%` 처리는 1장과 같다.
- 불일치 F-1~F-4와 관찰 1~3만 쟀다(재측정 시나리오 4개 파일, 앱 10회). 고친 코드가 닿은 영역(탭 끌기·확대·방향 포커스·탭 클릭·메뉴 포커스·미리보기 열기)은 지난 시나리오 7개 파일(앱 12회)을 다시 돌려 회귀만 보았다.
- 정리: `state.json` 복구(SHA-256 `77EF33FF…07C99` 일치), `keymap.json` 없음, 시험 폴더 삭제, 남은 `workbench-tauri`·`OpenWith` 프로세스 없음, `tools/` 변경 없음.

### 8.2 결과

| 항목 | 기대 | 측정 | 판정 |
| --- | --- | --- | --- |
| F-1 자기 탭 위에서 작은 걸음 끌기(a→c, 20걸음) | 삽입선 c 오른쪽 2px, 배경, 콘솔 예외 0 | 선 `["1",2,"right"]`·폭 2px·배경 `rgba(49, 50, 68, 0.4)`, 예외 0 | 통과 |
| F-1 끌던 중 자기 탭으로 되돌아왔다 다시 c로 | 되돌아오면 표시 0, 다시 c에 1 | 0, 1 | 통과 |
| F-1 놓은 뒤 탭 표시 | `data-index` 0~3 한 번씩, `active` 하나, 표시 없음 | `["0","1","2A","3"]` 계열, 위 조건 모두 | 통과 |
| F-1 빈 탭 바로 끌기 + Escape | 끝 영역 표시, 취소 뒤 표시 0·active 하나 | 표시 1, 취소 뒤 0·1·인덱스 유일 | 통과 |
| F-2 선택 `[114,117]` 직후 같은 Pane 오른쪽 가장자리 분할 → 다른 탭 위로 이동 | 같은 DOM 객체·선택·스크롤 유지 | 스크롤 0 / 100(휠 1칸) / 800(휠 8칸, 선택이 화면 밖) 세 경우 모두 `[114,117]`, 스크롤 그대로, 같은 객체 | 통과 |
| F-2 다른 Pane 본문 가운데로 이동 | 선택 유지 | `[114,117]` 유지 | 통과 |
| F-2 옮긴 뒤 입력 | 선택이 있으면 그 3글자가 바뀜(문서 길이 −2) | 10392 → 10390 | 통과(스크립트의 기대값이 +1로 잘못 적혀 한 행이 불일치로 찍혔다. 선택이 유지된 채 입력이 그것을 대체한 결과로 맞다) |
| F-3 Alt+Click 뒤 | 오른쪽 분할, `activeElement`가 원문 편집기(Pane 1), 바로 입력 가능 | 분할됨, `DIV.cm-content` Pane 1, 입력 시 수정 점 | 통과 |
| F-3 Ctrl+K V | 원문 편집기에 포커스 | 편집기 Pane 1 | 통과 |
| F-4 확대 중 Ctrl+K Ctrl+Left/Right/Up/Down | 이웃으로 이동하고 확대가 풀림 | 오른쪽 Pane 확대 → Left: Pane 1 편집기·확대 해제. 왼쪽 확대 → Right: Pane 2·해제. 위/아래 열에서도 같음 | 통과 |
| F-4 확대 중 이웃이 없는 방향 | 확대·포커스 유지 | Pane 1 확대에서 Left: 그대로 | 통과 |
| F-4 높이가 다른 열에서 확대한 큰 Pane의 Right | 가장자리 가운데 점이 닿는 Pane | 큰 쪽(아래) Pane | 통과 |
| 관찰 1 탭 클릭(비활성·활성) | 편집기에 포커스, 바로 입력 | 편집기·입력 시 수정 점 | 통과 |
| 관찰 1 탭 메뉴 Esc, 메뉴 항목 선택 | 열 때의 포커스(편집기)로 복귀, 바로 입력 | 둘 다 편집기, 입력 가능 | 통과 |
| 관찰 1 포커스가 Pane 밖(트리)일 때 탭 우클릭 → Esc | 그 Pane 편집기 | 편집기 | 통과 |
| 관찰 1 메뉴를 바깥(트리) 클릭으로 닫기 | (기록) | 포커스는 누른 곳(`sidebar-list`) | 기록 |
| 관찰 1 끌기 중·놓은 뒤 포커스 | 끌기 중 그대로, 놓은 뒤 대상 편집기 | 끌기 중 Pane 1 편집기, 놓은 뒤 Pane 2 편집기 | 통과 |
| 관찰 2 같은 파일 두 Pane: P1 `AB`, P2 `CD` 뒤 Ctrl+Z/Ctrl+Y/Ctrl+Shift+Z를 번갈아 | 어느 쪽에서 눌러도 버퍼의 마지막 편집부터 되돌림·다시함 | P1에서 Ctrl+Z → `CD` 사라짐(양쪽), P2에서 Ctrl+Z → `AB` 사라짐, 수정 점 양쪽에서 사라짐. Ctrl+Y는 P1에서 `AB`, P2에서 `CD`. Ctrl+Shift+Z도 같음 | 통과 |
| 관찰 2 묶음 단위 | 연속 입력 한 번이 한 단계 | `XY` 한 번이 다른 쪽 뷰의 Ctrl+Z 한 번으로 사라짐 | 통과 |
| 관찰 2 되돌린 뒤 커서·스크롤 | (V4 메모) | 이 짧은 파일에서는 두 뷰 모두 줄·스크롤 변화 없음(31줄·2줄, 스크롤 0). 긴 파일에서는 재지 않음 | 기록 |
| 관찰 3 500줄(501줄) 파일 Ctrl+End | 문서 끝(501줄, head=길이 10392), 끝까지 스크롤 | 501줄·10392, 스크롤 끝, 한 번 더 눌러도 그대로 | 통과 |
| 관찰 3 Ctrl+Home | 문서 처음 | 1줄·0·스크롤 0 | 통과 |
| 관찰 3 Ctrl+Shift+End / Ctrl+Shift+Home | 현재 위치에서 문서 끝/처음까지 선택, 끝에서는 문서 전체 | `[40,10392]`, `[40,0]`, `[10392,0]` | 통과 |
| 관찰 3 짧은 파일 Ctrl+End | 문서 끝 | 21줄·411 | 통과 |

### 8.3 회귀

지난 시나리오 7개 파일(A, B4, B5, C2, C3, C4, D3) 다시 실행: 통과 165행, 불일치로 찍힌 것 3행. 앞의 두 행은 의도한 변경이고 셋째는 지난번과 같은 기록 행이다.

- `R8 S-7` 두 행: 지난번 기대값이 "메뉴를 닫으면 Pane 섹션(그때 편집기에서 탭을 누르면 포커스가 Pane으로 갔음)"이었는데, 관찰 1 수정으로 편집기에 돌아간다(8.2의 관찰 1 행이 새 기대값).
- `Escape 취소 뒤 활성 탭`: 지난번과 같다(순서 그대로, 눌렀던 탭이 활성). 기록으로 둔 항목이다.
- 지난번 불일치였던 F-1(C2 `S2`; SB7은 다시 돌리지 않았고 8.2의 F-1 행이 같은 동작을 덮는다), F-2(C4 두 행), F-3(D3), F-4(B4)는 같은 시나리오에서 이번에 모두 통과했다.
- 확인한 것: 같은 시나리오에서 콘솔 예외 0(삽입선·분할·확대·미리보기 포함).
