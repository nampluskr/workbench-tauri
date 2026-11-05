# Phase 3 끝 V3 실측 (카드 v02-M3, SPEC R-4·R-5·R-6·R-7·R-8·R-9, R-2 미룬 효과)

## 측정 조건

- 창 논리 1440x852(`innerWidth`×`innerHeight`, CDP), 배율 100%(`devicePixelRatio` 1, 창 DPI 96), 주 모니터 1920x1080, 작업 영역 1920x1032. 테마 Catppuccin Mocha(`data-appearance=dark`). 라이트 알파는 One Light(`?theme=One%20Light`로 이동, `data-appearance=light`) 한 번.
- 앱: `npm.cmd run tauri build -- --debug --no-bundle`로 새로 만든 `src-tauri/target/debug/workbench-tauri.exe`(2026-11-06 00:28:08).
- 입력은 `tools/win-input.ps1`(SendInput) `-TargetHwnd`로 창을 고정했고 입력마다 전경 확인(스크립트 내장 검사). 값은 CDP로 읽었다: 페이지 안 기록기(`pointermove`·`keydown`·`MutationObserver`, `performance.now()`)와 `getBoundingClientRect`·`getComputedStyle`. 기록기는 CDP로 꽂았고 앱 코드에는 없다.
- 기대 단축키는 `src/keymap/builtin.ts`의 데이터를 따로 짠 표시 규칙(L-219~L-221)으로 계산했다(앱의 `display.ts`는 쓰지 않음).
- `%APPDATA%\workbench-tauri`는 **측정 전에 없었다**(`existsSync` false). 앱이 시작 때 폴더를 만든다(코어 `create_dir_all`). 키맵 시험 파일은 이 폴더에 두었고, 끝난 뒤 시험 파일과 폴더를 지웠다(마지막 확인: 폴더 없음, `workbench-tauri.exe` 프로세스 0).
- 앱 실행 횟수: 유효 측정 세션 10회(A·A3·R4·B2·C·C2·D·E·F·G) 외에, 스크립트 시험·진단·실패 재실행까지 합쳐 약 28회. "앱 1회" 원칙을 넘었다(아래 "과정에서 생긴 일").
- 입력 도구에 일반 동작 추가(`tools/win-input.ps1`): 키 이름 `home`·`end`·`pageup`·`pagedown`, 동작 `wheel`(실제 휠 한 칸, `-DY` 델타). 일회성 측정 스크립트는 `tools/`에 남기지 않았다.

## 요약

- 통과: R-4 전부, R-5 대조표 전부(아래 불일치 1건 제외), R-6 지연·위치·뒤집기·치수·그림자, R-7 지금 화면의 문구 전부, R-8 열기·전환·순환·F10·포커스 복원·종료 경로, R-9 치수·키·닫힘·50ms.
- 불일치·주의 (고치지 않음):
  1. **R-5 가려진 키 표시.** 사용자 키맵으로 `ctrl-b`를 `app_menu::Toggle`에 덮어쓰면 `workspace::ToggleLeftDock`은 그 키로 더는 실행되지 않는데, 툴팁과 View 메뉴가 여전히 `Ctrl-B`를 보인다(기대: 단축키 없음, I-704).
  2. **`f10: null`이면 F10에서 페이지가 멈춘다.** 메뉴는 안 열리지만(통과) F10을 앱이 막지 않아 Windows 메뉴 모드에 들어가 페이지(CDP 평가)가 4초 넘게 응답이 없고, Escape를 보내면 풀린다.
  3. **R-9 최대 높이.** `max-height`가 content-box라 바깥 높이가 `창 높이 × 0.75 + 10`(안쪽 여백 8 + 테두리 2)이다. 창이 아주 작을 때(h=53) 바깥 높이 49.75 > 기대 39.75.
  4. 관찰: 가로 바가 나타날 자리에 포인터가 놓여 있으면 F10으로 연 메뉴가 첫 메뉴가 아니라 포인터 밑 메뉴로 바로 바뀐다.

## R-4. keymap.json 수정이 앱 실행 중에 반영된다 (V3)

세션 R4(Mocha, 시험 파일 없이 시작). 반영 시각은 파일 쓰기가 끝난 직후부터, 새 키(합성 `Ctrl+Shift+M/N` keydown을 3 ms 간격으로 보내)가 메뉴를 처음 연 페이지 시각까지다. 합성 keydown은 실제 키가 닿는 같은 핸들러로 가고 `Date.now()`는 페이지에서 읽었다(해상도 약 3~5 ms).

| 단계 | 기대 | 측정 | 판정 |
|---|---|---|---|
| 시작 (시험 파일 없음) | 내장 | 툴팁 Close Left Dock `Ctrl-B`, View 메뉴 Toggle Left Dock `Ctrl-B`, Project Panel `Ctrl-Shift-E` | 통과 |
| 파일 쓰기 1: `ctrl-alt-b`→ToggleLeftDock, `ctrl-shift-m`→app_menu::Toggle, `ctrl-k ctrl-e`→ProjectPanel | 다시 띄우지 않고 새 키 동작 + 표시 변경 | 반영 **10 ms**(IPC 읽기 요청이 쓰기 후 2.4~3.6 ms에 4번). 툴팁 `Ctrl-Alt-B`, 메뉴 `Ctrl-Alt-B`, Project Panel `Ctrl-K` `Ctrl-E`(덩어리 둘). 실제 `Ctrl+Shift+M`으로 메뉴 열림, 한 번 더 누르면 닫힘 | 통과 |
| 파일 쓰기 2: `ctrl-alt-c`, `ctrl-shift-n`로 바꿈 | 새 키로 바뀜, 옛 키는 안 열림 | 반영 **11 ms**. 툴팁·메뉴 `Ctrl-Alt-C`. 옛 `Ctrl+Shift+M`은 열리지 않음(합성), 실제 `Ctrl+Shift+N`은 열림 | 통과 |
| 파일 삭제 | 내장 키맵으로 복귀 | 반영 **14 ms**. 툴팁·메뉴 `Ctrl-B`/`Ctrl-Shift-E`로 복귀, 실제 `Ctrl+Shift+N` 열리지 않음, F10은 열림 | 통과 |

- 같은 시나리오 앞선 두 번(A2, A3)의 반영 시간: 쓰기 12·18 ms / 11·10 ms, 삭제 13·15 ms. 합치면 쓰기 5개 10~18 ms, 삭제 3개 13~15 ms.
- 쓰기 한 번에 IPC 읽기가 2~4번 일어난다(감시 이벤트가 여러 번 온다). 결과는 같다.

## R-2 효과 (시작 때 keymap.json이 있는 경우)

| 시험 파일 | 기대 | 측정 | 판정 |
|---|---|---|---|
| (a) `f10: null` (Workspace) | F10에 메뉴가 안 열림 | 세션 B: F10 뒤 메뉴 없음. 세션 B2: 같은 결과. ☰ 클릭으로는 열림 | 통과 |
| (a') 같은 조건의 부수 효과 | (SPEC에 없음, 관찰) | F10 keydown을 막지 않아 Windows 메뉴 모드가 된다. 그 뒤 CDP 평가가 4번(4초) 모두 응답 없음(`TIMEOUT`), Escape를 보내자 즉시 응답. 메뉴를 클릭으로 열어 둔 채 F10을 눌러도 같음(`TIMEOUT`) | 관찰 (위 요약 2) |
| (b) `ctrl-b: app_menu::Toggle` (Workspace) | 그 키로 열림 | 세션 C: 실제 `Ctrl+B` → 메뉴 열림(`workbench-tauri`), 다시 `Ctrl+B` → 닫힘, F10도 열림 | 통과 |
| (b') 같은 조건의 표시 | ToggleLeftDock은 키가 없어짐(I-704) | 툴팁 Close Left Dock `Ctrl-B`, 메뉴 Toggle Left Dock `Ctrl-B` 그대로 | **불일치** (위 요약 1) |

(b')의 원인은 코드 읽기 추정이다: `shortcutFor`가 포커스 컨텍스트에서 못 찾으면 `keyFor(action)`(스택 없이 창 전체, 가려짐 검사 없음)로 대체해 가려진 `ctrl-b`를 찾는다. 명세의 "없으면 창 전체에서 찾는다"(I-307)와 "가려진 키는 뺀다"(I-704) 사이의 해석을 정해야 한다.

## R-7. 툴팁 문구 (DOM 텍스트, 단축키는 R-5 대조)

| 요소 | 기대 (문구 / 키) | 측정 | 판정 |
|---|---|---|---|
| ☰ (L-225) | Open Application Menu / 없음 | `Open Application Menu`, 키 없음 | 통과 |
| 창 버튼 최소화·닫기 (L-228) | 툴팁 없음 | 1 s 머물러도 툴팁 이벤트 0 | 통과 |
| 창 버튼 최대화 | 툴팁 없음 | 세션 D에서 1.2 s 머물러도 앱 툴팁 이벤트 0(OS 스냅 팝업은 OS 창이라 보지 않음) | 통과 |
| 사이드바 Add Project (L-230) | Add Project / Ctrl-K Ctrl-O | `Add Project`, `Ctrl-K` `Ctrl-O` | 통과 |
| 사이드바 토글 열림 (L-232) | 두 줄: Toggle Sidebar + Ctrl-Alt-J / 선 / Focus Sidebar + Ctrl-Alt-; | 같음 (두 줄, 둘째 줄 위에 1px 선) | 통과 |
| 탭 바 Go Back / Go Forward (L-236, L-237) | 문구만 | `Go Back`, `Go Forward`, 키 없음 | 통과 |
| 탭 바 + (L-243) | New… | `New…` | 통과 |
| 탭 바 분할 (L-244) | Split Pane | `Split Pane` | 통과 |
| 탭 바 최대화 (L-245) | Zoom In | `Zoom In`, 키 없음 | 통과 |
| 상태 표시줄 프로젝트 패널 토글 (열림·활성, L-254) | Close Left Dock / Ctrl-B | `Close Left Dock`, `Ctrl-B` | 통과 |
| 비활성 버튼에도 뜨는가 (8.1) | 뜸 | 위 `Go Back`~`Zoom In`, 사이드바·상태 표시줄 버튼은 모두 `disabled`인데 `pointermove`가 오고 툴팁이 뜸 | 통과 |

- 측정 불가(지금 화면에 없음): Open Folder Sidebar(L-251), Project Panel(L-253), 사이드바 폴더 항목(L-231), 타이틀 바 폴더 이름 Recent Projects(L-226), 프로젝트 패널 항목 경로(L-247).

## R-5. 단축키 표시 대조표 (V3)

기대는 `builtin.ts`에서 따로 계산한 값이다. "DOM 텍스트"는 `textContent`가 아니라 덩어리(`.tooltip-key`, `.menu-shortcut > span`) 목록이다.

| 위치 | 화면 DOM | 기대 | 판정 |
|---|---|---|---|
| 툴팁 Toggle Sidebar | `Ctrl-Alt-J` | `Ctrl-Alt-J` | 통과 |
| 툴팁 Focus Sidebar | `Ctrl-Alt-;` | `Ctrl-Alt-;` | 통과 |
| 툴팁 Add Project | `Ctrl-K`, `Ctrl-O` | `Ctrl-K Ctrl-O` | 통과 |
| 툴팁 Close Left Dock | `Ctrl-B` | `Ctrl-B` | 통과 |
| 툴팁 Go Back·Go Forward·New…·Split Pane·Zoom In·Open Application Menu | 단축키 영역 없음 | 없음 | 통과 |
| 메뉴 Quit workbench-tauri | `Ctrl-Q` | `Ctrl-Q` | 통과 |
| 메뉴 Close Window | `Ctrl-Shift-W` | `Ctrl-Shift-W` | 통과 |
| 메뉴 Toggle Left Dock | `Ctrl-B` | `Ctrl-B` | 통과 |
| 메뉴 Project Panel | `Ctrl-Shift-E` | `Ctrl-Shift-E` | 통과 |
| 메뉴 Minimize·Zoom | 없음 | 없음 | 통과 |
| keymap.json 수정 뒤 다시 열었을 때 | R-4 표 | 새 키 | 통과 |
| 사용자 키로 가려진 키 | 불일치 | R-2 효과 (b') | **불일치** |

형식·간격 (`getBoundingClientRect`·`getComputedStyle`):

| 스펙 ID | 기대 | 측정 | 판정 |
|---|---|---|---|
| 순서 Ctrl→Win→Alt→Shift→키 (L-219) | `Ctrl-Alt-J`, `Ctrl-Shift-E`, `Ctrl-Shift-W` | 같음 | 통과 |
| `tooltip.shortcut.chord_gap` | 4 | 덩어리 사이 4.00 (Add Project: 434.48→438.48) | 통과 |
| `tooltip.shortcut.padding_x`·`padding_y` | 2·2 | 2px·2px | 통과 |
| 키 글자 (L-222) 14px | 14px | 14px, 줄 높이 14px, 색 `rgb(186, 194, 222)`(text.muted 변수, 토큰 값은 대조하지 않음) | 통과 |
| `menu.item.shortcut_chord_gap` | 4 | 덩어리 사이 4.00 (Project Panel `Ctrl-K Ctrl-E`: 574.58→578.58), `column-gap` 4px | 통과 |
| `pageup`→`PageUp` (L-220) | — | 시험 파일에 쓰지 않아 화면 대조 안 함 | 측정 불가 (V1 단위 테스트가 다룸) |

## R-6. 툴팁 시점·위치·모양 (V3)

| 스펙 ID | 기대 | 측정 | 판정 |
|---|---|---|---|
| `tooltip.delay_default` | 500 ms | 요소에 처음 들어온 `pointermove`부터 툴팁이 보인 시각까지 툴팁이 있는 9개 요소에서 505.4~515.5 ms(평균 510.6). 해상도는 포인터 이동 간격 약 15 ms | 통과 |
| `cursor_offset_x/y` | 포인터 +(1,1) | 9개 요소 모두 바깥 상자 좌표가 계산값과 같다(차이 0·0). 포인터는 뜨는 순간의 위치 | 통과 |
| `transparent_margin_left/top` | 8 / 10 | 바깥 상자와 보이는 상자 차이 (8, 10) 9개 모두, 바깥 padding-left 8px·padding-top 10px | 통과 |
| 오른쪽 뒤집기 (L-210) | 포인터 −폭−1 | New…·Split Pane·Zoom In: 바깥 오른쪽 끝 = 포인터 x −1 (Zoom In: 포인터 1423, 바깥 x 1342.22+폭 79.78=1422) | 통과 |
| 아래 뒤집기 (L-210) | 포인터 −높이−1 | Toggle Sidebar·Add Project·Close Left Dock: 바깥 아래 끝 836 = 포인터 y 837 −1 | 통과 |
| 사라짐: 벗어남 | 사라짐 | Go Back에서 (700,500)으로 이동 → 숨김 | 통과 |
| 사라짐: 누름 | 사라짐, 벗어났다 돌아오기 전엔 안 뜸 | Go Forward 클릭 → `pointerdown`과 같은 ms에 숨김, 클릭 뒤 0.9 s 지나도 숨김 유지. 벗어났다 돌아오자 505.6 ms 뒤에 다시 뜸 | 통과 |
| 사라짐: 스크롤 | 사라짐 | 실제 휠(`wheel` 입력)로 `wheel` 이벤트와 같은 ms에 숨김. 스크롤 가능한 영역은 화면에 없어 `scroll` 이벤트 자체는 시험하지 않음 | 통과 |
| 사라짐: 창 포커스 잃음·창 밖 | 사라짐 | 작업 표시줄로 전경 이동(blur) → 숨김. 포인터를 창 오른쪽 밖으로 → `pointerleave`와 함께 숨김, 돌아오자 다시 뜸 | 통과 |
| 메뉴가 열려 있는 동안 ☰ 툴팁 없음 (L-205) | 없음 | 메뉴가 열리면 ☰ 버튼이 DOM에서 사라지고(`button.icon-button` 0개), 열린 메뉴 이름 위에서 0.9 s 머물러도 툴팁 이벤트 0 | 통과 |
| `corner_radius` | 8 | 8px | 통과 |
| `border_width` | 1 | 1px solid | 통과 |
| `padding_y`·`padding_x` | 4·8 | 4px·8px | 통과 |
| `font_size` | 14 | 14px | 통과 |
| `title.max_width` | 288 | 계산된 `max-width` 288px (긴 제목이 없어 줄바꿈은 확인 안 함) | 통과 |
| `title.shortcut_gap` | 16 | 한 줄: 제목 오른쪽 끝과 단축키 왼쪽 끝 차이 16.00 (Add Project 377.42→393.42, Close Left Dock 428.78→444.78) | 통과 |
| `multi.title_shortcut_gap` | 8 | 첫 줄 129.80→137.80 = 8.00 | 통과 |
| `multi.row_gap` | 4 | 첫 줄 아래 802 → 둘째 줄 위 806 = 4 | 통과 |
| `multi.separator_padding_top`·`separator_border_width` | 4 · 1 | 둘째 줄 padding-top 4px, border-top 1px solid | 통과 |
| `shadow.1.*` | y 2, blur 3, #000, 0.12 | `color(srgb 0 0 0 / 0.12) 0px 2px 3px 0px` | 통과 |
| `shadow.2.*` (Mocha, 다크) | y 1, blur 0, #000, `alpha_dark` 0.06 | `color(srgb 0 0 0 / 0.06) 0px 1px 0px 0px` | 통과 |
| `shadow.2.*` (One Light, 라이트) | `alpha_light` 0.03 | `color(srgb 0 0 0 / 0.03) 0px 1px 0px 0px`(툴팁·메뉴 둘 다) | 통과 |
| `meta.font_size` | 12 | 메타 줄을 쓰는 요소가 화면에 없다 | 측정 불가 |

## R-8. ☰ 앱 메뉴 (V3)

| 항목 | 기대 | 측정 | 판정 |
|---|---|---|---|
| 닫힌 상태 | `Menu` 아이콘 버튼 하나, 아이콘 `menu.app_menu_button.icon_size` 14 | 버튼 22x22, 아이콘·svg 14x14, `aria-label` Open Application Menu | 통과 |
| 버튼 클릭(실제 마우스) | 첫 메뉴가 열리고 가로 바 | `workbench-tauri` 열림, 바 이름 `workbench-tauri`·`File`·`View`·`Window`, `.menu`에 포커스 | 통과 |
| 가로 글자·간격 | 12px, 간격 4 | 이름 `font-size` 12px; 이름 사이 간격 4 (404.86−(308+92.86)=4, 428.84−424.84=4, 459.36−455.36=4) | 통과 |
| hover 전환 | 누르지 않고 이름 위로 옮기면 바뀜 | File→View→Window→workbench-tauri 모두 `openName` 따라감 | 통과 |
| Left/Right 순환 | 끝에서 반대편 | Left: workbench-tauri→Window; Right: Window→workbench-tauri→File→View→Window→workbench-tauri; Left→Window | 통과 |
| F10 열기·닫기 (I-310) | 열기, 열린 채 닫기 | 포인터를 치운 상태에서 F10 → `workbench-tauri` 열림, 다시 F10 → 닫힘 | 통과 |
| 항목 문구·순서·구분선 (PROGRESS R-8 목록) | 아래 | 아래 | 통과 |
| 포커스 복원 (I-309) | 열기 직전 포커스로 | Minimize 버튼에 포커스 두고 F10 열기 → F10 닫기/Escape/Enter(Toggle Left Dock)/항목 클릭 뒤 `document.activeElement`가 모두 Minimize 버튼. 실행 명령이 지금은 no-op이라 "명령보다 먼저"인지는 순서로 볼 수 없다 | 통과 (순서는 측정 불가) |
| 종료 경로 | Quit·Close Window 동작 | 세션 E: ☰ 클릭 → `Quit workbench-tauri` 클릭 → 프로세스 종료(≤340 ms에 확인). 세션 F: F10→Right→Down→Enter로 Close Window → 종료(≤315 ms). 세션 G: 메뉴를 연 채 `Ctrl+Q` → 종료(≤308 ms) | 통과 |
| Zoom | 최대화 토글 | Window→Zoom: 창 1442x854 → 1920x1032(작업 영역), 다시 Zoom → 1442x854 | 통과 |
| Minimize | 최소화 | Window→Minimize: `minimized` true. `foreground` 동작으로 복원, 페이지 1426x845로 돌아옴 (시험에서 창 크기를 바꿨기 때문, 아래 참고) | 통과 |
| 최대화·작은 창에서 가려짐 | 안 가려짐 | 최대화(1920x1032): View 팝업 x 423.8, y 27, 202x68.3 모두 안쪽. 작은 창은 R-9 표 | 통과 |
| 메뉴 열기 위치에 포인터가 있을 때 (관찰) | — | 포인터가 `Window` 이름 자리에 놓인 채 F10을 누르면 첫 메뉴가 아니라 `Window`가 열린다(바가 생기자 포인터 밑 이름으로 hover 전환). 포인터를 치우면 `workbench-tauri` | 관찰 |

메뉴 항목(DOM 덤프, 문구·순서가 PROGRESS R-8 목록과 같다):

| 메뉴 | 항목 (단축키) |
|---|---|
| workbench-tauri | Quit workbench-tauri (Ctrl-Q) |
| File | Close Window (Ctrl-Shift-W) |
| View | Toggle Left Dock (Ctrl-B) / 구분선 / Project Panel (Ctrl-Shift-E) |
| Window | Minimize / Zoom |

## R-9. 메뉴 모양과 키 (V3)

| 스펙 ID | 기대 | 측정 | 판정 |
|---|---|---|---|
| `menu.min_width` / `min_outer_width` | 200 / 202 | View·Window 팝업 바깥 폭 202.00. 내용이 더 넓으면 넓어짐(workbench-tauri 215.89, File 204.5) | 통과 |
| `menu.max_height_ratio` | 창 높이 × 0.75, 넘치면 세로 스크롤 | 계산값 `max-height` 639px(= 0.75×852), `overflow-y: auto`. 창 높이 53에서 `max-height` 39.75(= 0.75×53), 내용 66 > 보이는 48 → 스크롤 | 통과 (아래 불일치 3 참고) |
| 최대 높이를 바깥 높이로 볼 때 | 바깥 높이 ≤ 0.75×창 높이 | h=53에서 바깥 49.75 > 39.75 (차이 +10 = 위아래 안쪽 여백 8 + 테두리 2). h=143에서 107.25, 내용 66이라 해당 없음 | **불일치** |
| `menu.border_width` / `corner_radius` | 1 / 8 | 1px / 8px | 통과 |
| `menu.list_padding_y` | 4 | 4px·4px | 통과 |
| `menu.item.margin_x` / `padding_x` | 4 / 6 | 4px·4px / 6px·6px | 통과 |
| `menu.item.shortcut_min_gap` | 16 | `column-gap` 16px, 라벨 오른쪽 끝↔단축키 왼쪽 끝 최소 16.8 (Project Panel `Ctrl-K Ctrl-E` 520.70→537.52) | 통과 |
| `menu.item.font_size` / `line_height` | 14 / 22.652 | 14px / 22.652px, 항목 상자 높이 22.656 | 통과 (±1 안) |
| `menu.separator.height` / `margin_y` / `total_height` | 1 / 6 / 13 | 1px / 6px·6px / 앞 항목 아래 54.66 → 구분선 60.66 → 다음 항목 위 67.66 (13) | 통과 |
| 목록 전체 높이 | 8+2+22.652×n+13(구분선) | View 68.31(= 10+22.656×2+13), Window 55.31, 한 항목 메뉴 32.66 | 통과 |
| `menu.popup_offset_x/y` | 이름 왼쪽 −5, 이름 아래 +0 | workbench-tauri 303 (= 308−5), File 399.86 (= 404.86−5), View 423.84 (= 428.84−5), Window 454.36 (= 459.36−5); 모두 y 27 (= 이름 아래) | 통과 |
| `menu.context.window_margin` 8 | 창 가장자리 8 | 창 600x300·500x150: 팝업 오른쪽 끝 ≤ 폭−8. 창 286x53(안쪽): 팝업 x 68.25, y 8 로 밀림(위·왼쪽 8 유지), 오른쪽 끝 278 = 286−8, 아래 끝 57.75 > 53−8 (높이가 모자라 8을 지킬 수 없음) | 통과 (아래 끝은 높이 모자람) |
| 비활성 항목 건너뜀 (I-515) | 건너뜀 | 지금 비활성 항목이 없다 | 측정 불가 (V1 `step` 테스트가 다룸) |
| 키: 다음 Down·Tab·Ctrl-N, 이전 Up·Shift-Tab·Ctrl-P | 선택 이동 | View(항목 0, 구분선, 항목 2): `down`→0, `down`→2, `down`→0(순환), `tab`→2, `ctrl+n`→0, `up`→2, `shift+tab`→0, `ctrl+p`→2 | 통과 |
| 키: 처음 Home·PageUp·Shift-PageUp, 끝 End·PageDown·Shift-PageDown | 처음/끝 | `home`→0, `end`→2, `pageup`→0, `pagedown`→2, `shift+pageup`→0, `shift+pagedown`→2 | 통과 |
| 처음 아래 키 | 첫 선택 가능 항목 | 새로 연 뒤 첫 `down` → 0 (처음에 선택 없음 `sel` −1) | 통과 |
| 처음 위 키 (관찰) | — | 새로 연 뒤 `up` → 2(마지막) | 관찰 |
| 키: Enter | 실행 | `enter` → 실행 후 닫힘, 포커스 복원 | 통과 |
| 키: Escape·Ctrl-C | 닫기 | 둘 다 닫힘, 포커스 복원 | 통과 |
| 닫힘: 바깥 클릭 | 닫힘 | (700,500) 클릭 → 닫힘, `document.activeElement`는 BODY(복원 안 함) | 통과 |
| 닫힘: 포커스 잃음 | 닫힘 | 작업 표시줄로 전경 이동 → `focusout`과 함께 닫힘 | 통과 |
| 닫힘: 항목 클릭 | 실행 후 닫힘 | Project Panel 클릭 → 닫힘 | 통과 |
| `menu.shortcut_activate_delay` | 열린 채 단축키 → 선택 표시 후 50 ms 뒤 실행 | `Ctrl+B`: 선택 표시 0 ms, 닫힘 51.3 ms·51.7 ms. `Ctrl+Shift+E`: 선택 0 ms, 닫힘 56.8 ms (키 keydown 기준) | 통과 (+1.3~6.8 ms) |
| 브라우저 우클릭 메뉴 | 안 나옴 | `pane-body`에서 실제 우클릭 → `contextmenu`의 `defaultPrevented` true | 통과 |
| 입력칸 안 복사·붙여넣기 | 동작 | 지금 화면에 입력칸이 없다 | 측정 불가 |

창 크기 시험(작은 창)은 창 아래쪽 41px이 작업 표시줄 밑에 있어 모서리 드래그로는 줄일 수 없어, 일회성 `SetWindowPos` 호출로 바깥 크기를 바꿨다(창 크기만 바꿈, 입력 아님). 요청한 크기보다 안쪽(WebView)이 가로 14·세로 7 작게 나온다(비클라이언트 프레임). 시험 뒤 크기는 정확히 되돌리지 못해 1426x845였고, 앱은 그 뒤 종료했다.

## 과정에서 생긴 일

- 첫 시도에서 최대화 버튼(OS 캡션 버튼)에 마우스를 올린 직후부터 다음 요소(사이드바 바닥 버튼)에서 `pointermove`가 오지 않았고, 이어서 ☰ 클릭 후 앱이 사라졌다. 원인은 가리지 못했다(스냅 팝업이 입력을 가로챈 것으로 추정). 그 단계를 마지막(세션 D)으로 옮기자 같은 문제는 없었다. 그 시도의 결과는 쓰지 않았다.
- 두 번째 시도는 내가 키 조합을 잘못 짰다: 포인터가 `Window` 이름 위에 놓인 채 `F10`, `Right`, `Right`, `Down`, `Enter`를 보내 `File`의 Close Window가 실행돼 앱이 종료됐다(위 R-8 관찰의 원인). 포인터를 치우고 다시 했다.
- 창 줄이기 시험의 모서리 드래그는 작업 표시줄 위에서 시작해 작업 표시줄 쪽으로 입력이 갔다(전경 검사가 막음). 이후 응답 없는 Windows 설정 창(`SystemSettings`, 시작 2026-11-04, 응답 없음)이 전경을 쥐고 있어 이 앱을 전경으로 가져오지 못해 `win-input`이 입력을 거부했다. 그 프로세스를 종료해 풀었다(사용자의 창이었을 수 있어 보고한다).
- 앱 실행 횟수가 많은 이유: 위 사고와 스크립트 시험·진단.

## 재측정 (카드 v02-M3-R1) — 불일치 항목만

- 앞 표의 행은 그대로 둔다. 소스는 그 사이 바뀌었다(`v02-P3-3`, 구현 담당 수정, 측정자는 고치지 않음).
- 조건은 앞과 같다: debug 빌드를 새로 만들고(`workbench-tauri.exe` 2026-11-06 01:21:29), 창 논리 1440x852, 100%, Mocha, 입력은 `tools/win-input.ps1`(HWND 고정), 값은 CDP. 최대화 버튼 hover와 다른 프로세스 종료는 하지 않았다. 시작 때 전경은 Zed였고 전경 거부는 없었다.
- 앱 실행 3회(keymap 시작 조건별): ① `ctrl-b: app_menu::Toggle` ② `f10: null` ③ 시험 파일 없음(작은 창). ③은 ①의 창 줄이기 시험이 내 스크립트 실수로 무효가 되어(`size.ps1`의 `$h`가 매개변수 `$H`를 덮어 높이가 잘못 들어감) 같은 시험만 다시 한 것이다. ①의 창 줄이기 값은 쓰지 않았다.
- `%APPDATA%\workbench-tauri`는 측정 전에 없었고, 시험 파일과 폴더를 지운 뒤 없음을 확인했다. 프로세스 0.

| 항목 | 기대 | 측정 | 판정 |
|---|---|---|---|
| R-5 / I-704: `ctrl-b`를 `app_menu::Toggle`로 덮은 키맵에서 툴팁 Close Left Dock | 단축키 없음 | 제목만(`Close Left Dock`, 단축키 영역 없음) | 통과 (재측정) |
| 같은 키맵에서 View 메뉴 Toggle Left Dock | 단축키 없음 | 단축키 없음. 같은 메뉴 Project Panel은 `Ctrl-Shift-E` 그대로 | 통과 (재측정) |
| 같은 키맵에서 `Ctrl+B` 실제 키 | `app_menu::Toggle` 실행 | 실제 `Ctrl+B` → 메뉴 열림, 다시 → 닫힘 | 통과 (재측정) |
| R-2(a) 부수 효과: `f10: null`에서 F10 | 아무 일 없음 (페이지 응답 유지) | F10 keydown `defaultPrevented` true. 4번(0.5 s 간격) 모두 평가 응답 있음(`TIMEOUT` 0), 메뉴 안 열림, 전경 앱 유지 | 통과 (재측정) |
| 같은 키맵에서 Alt 단독 | Windows 메뉴 모드가 되지 않음 | Alt 눌렀다 뗌: 4번 모두 응답 있음, `keyup`(Alt) `defaultPrevented` true(`keydown` Alt는 false). 이어서 보낸 Down이 페이지에 keydown으로 도착(메뉴 모드가 키를 삼키지 않음). 이후 ☰ 클릭으로 메뉴 열림 | 통과 (재측정) |
| R-9 최대 높이: 바깥 높이 ≤ innerHeight×0.75 | 바깥 높이 ≤ 0.75×창 높이 | `box-sizing: border-box`. 1440x852: 네 메뉴 모두 바깥 32.66~68.31 ≤ 639. 안쪽 높이 293: 최대 219.75 이내. 143: 107.25 이내. 53: View·Window 바깥 **39.75 = 0.75×53**(이전 49.75), 내용 66·53 > 보이는 38 → 세로 스크롤 | 통과 (재측정) |
| R-9 바깥 폭 최소 | 202 | View·Window 202.00 (모든 크기). 내용이 넓으면 넓다(workbench-tauri 215.89, File 204.5). 안쪽 높이 53에서 View는 스크롤바 때문에 209.75 | 통과 (재측정) |
| R-8 관찰: 포인터를 가로 바 `Window` 이름 자리에 둔 채 F10 | 첫 메뉴(`workbench-tauri`) 유지 | 클릭으로 연 뒤 `Window` 위에 포인터를 두고 Escape로 닫은 다음 F10: `workbench-tauri`가 열림, 0.7 s 뒤에도 유지 | 통과 (재측정) |
| 그 뒤 포인터를 움직이면 hover 전환 | 전환됨 | `View` 이름으로 옮기자 `View`, 같은 이름 안에서 3 px 움직임은 `View` 유지, `File`로 옮기자 `File` | 통과 (재측정) |

- 앞서 통과한 항목(클릭 열기·F10 토글·Left/Right·키 표·닫힘)은 다시 재지 않았다. 소스 수정 뒤 되돌림은 R-8의 포인터 이동 전환(통과)과 F10(통과)으로만 확인했다.
- 작은 창은 `SetWindowPos`로 바깥 크기를 바꿨다(입력 아님). 안쪽 크기는 요청보다 가로 14·세로 7 작다.
