# Phase 2 결과표 — R-3 · R-4 · R-5 · R-7 · R-1(새 레이아웃)

> 대상: SPEC R-3, R-4(V3), R-5, R-7(V3), R-1(새 영역 뼈대에서 다시), 그리고 `impl`의 Phase 2 V2 결과(P2-1~P2-3).
> V2 값은 `impl` 보고(`impl-p2-1.md`·`impl-p2-2.md`·`impl-p2-3.md`)에서 옮겼다. V3 값은 `measure`(M-2)가 `tools/measure-p2.mjs`로 쟀다.
> 판정은 허용 오차 `verification.tolerance.dimension`(1.0px)·`verification.tolerance.color_channel`(1 step)와 D-10 기준 견본 대비다.

## 측정 조건

| 항목 | 값 |
| --- | --- |
| 모니터·배율 | 데스크톱 주 모니터 1920x1080, 100%(`devicePixelRatio` 1, `GetDpiForWindow` 96). 두 번째 모니터는 쓰지 않았다 |
| 창 | 논리 1440x852(클라이언트), 최대화 안 함. DWM 프레임 1442x854(1px 테두리 포함). 작업 영역 0,0,1920,1032 |
| 대상 | `npm run tauri build -- --debug --no-bundle`의 `src-tauri/target/debug/workbench-tauri.exe`(소스보다 늦게 빌드된 것을 확인: exe 2026-11-05 11:24:45, 이후 바뀐 `src`·`src-tauri` 파일 없음), 주소 `http://tauri.localhost/`(CSP 적용) |
| 입력 방식 | CDP(`Input.dispatchMouseEvent`): 색 샘플의 hover·누름·선택 드래그, R-1. OS 입력(`tools/win-input.ps1`, SendInput): R-5 키·우클릭, R-3 스냅 팝업·이동·리사이즈·더블클릭·최대화 버튼 클릭 |
| 안전 | OS 입력은 PID·HWND를 고정하고 이벤트마다 직전에 전경 창이 대상인지 확인한다. 한 번 어긋나 입력이 거부된 적이 있다(개발 중 리사이즈 하단 가장자리 시험, 창이 화면 밖으로 나가 작업 표시줄이 전경이 됨). 그때 아무 입력도 가지 않았고 다른 창에 키가 들어간 일은 없다 |
| 전경으로 만들기 | `SetForegroundWindow`가 거부돼 `AttachThreadInput`으로 전경 스레드의 입력 상태를 잠깐 빌린 뒤 돌려주는 방식을 `win-input.ps1`에 더했다(입력 이벤트는 만들지 않는다) |
| 글꼴(편집기) | Consolas 15px(Phase 1과 같음). 타이틀 바 글리프는 Segoe Fluent Icons(`CSS.getPlatformFontsForNode`, 사용자 정의 글꼴 아님) |
| 키보드 | 레이아웃 0x0412(한국어). IME는 처음에 영문 모드였다 |
| 세션 | R-7·R-1·R-3·R-4는 한 세션(앱 1회 실행, `colors,r1,keys,window`)의 값이다. R-5는 같은 단계(`keys`)를 모니터 캡처(인쇄·찾기 화면 확인)를 더해 앱을 한 번 더 띄워 다시 돌린 값이다. 앞선 실행의 영문 모드 키 16개도 같은 결과였다. 개발 중 시험 실행이 여러 번 있었고 그 값은 쓰지 않았다 |
| 스크립트 | `tools/measure-p2.mjs`(단계 `colors`·`r1`·`keys`·`ime`·`window`), `tools/win-input.ps1`, `tools/png.mjs`, `tools/theme-expect.mjs`, `tools/cdp-lib.mjs` |

## 1. impl V2 결과 (옮김)

### R-4 V2 — 타이틀 바와 창 버튼 (P2-1, 최대화하지 않은 시작 상태, 창 1440x852, DPR 1)

| 스펙 ID | toml ID | 기대값 | 측정값 | 차이 | 판정 |
| --- | --- | --- | --- | --- | --- |
| L-21 | titlebar.height | 32 | 바 rect h 32 (x 0, y 0, w 1440) | 0 | 통과 |
| L-39 | titlebar.window_button.width | 36 | 세 버튼 모두 w 36 | 0 | 통과 |
| L-39 | titlebar.window_button.height | 32 | 세 버튼 모두 h 32 | 0 | 통과 |
| L-39 | titlebar.window_button.glyph_size | 10 | computed font-size 10px (세 버튼) | 0 | 통과 |
| A-32.2 / L-83 순서·위치 | (규칙) | 최소화·최대화·닫기 순, 오른쪽 끝 | x = 1332 / 1368 / 1404 (각 w 36), 닫기 우측 끝 1440 = 창 폭 | 0 | 통과 |
| L-81 | (규칙) | 바 전체 드래그 영역 | `data-tauri-drag-region` 속성이 `<header>`에 있음(속성 존재만) | — | 코드 확인. 실제 드래그는 아래 R-3 V3 |

- 글리프 코드포인트(덤프): U+E921 / U+E922 / U+E8BB. 시작 상태가 비최대화라 가운데 U+E922 = L-312와 일치. 렌더 글꼴은 Segoe Fluent Icons.
- 부수: 바 아래 Pane 시작 y 32, 첫 편집기 y 57(탭 바 25px).

### R-7 V1·V2 (P2-3)

- V1: `Catppuccin Mocha / Catppuccin Latte / One Light: the 24 target tokens equal the JSON value or the T-26 value` 3개와 `parseColor` 1개 통과. 세 테마 모두 `scrollbar.thumb.active_background`가 `null`/없음이라 T-26.3 경로가 쓰였다.
- V2(시작 테마 Mocha): 24개 `--…` 변수가 V1 계산 값과 알파까지 전부 일치(불일치 0). 루트 글자 크기 16px = `units.rem_size`, `rem()` 정의는 `src/spec/metrics.ts`(코드 확인).
- 색(V2 덤프, 시작 테마): `.cm-activeLine` rgba(205,214,244,0.07) = `editor.active_line.background` `#cdd6f412`, 거터 배경 rgb(30,30,46), 줄 번호 rgb(127,132,156)(커서 줄 거터 rgb(203,166,247)), 스크롤바 손잡이 rgba(88,91,112,0.5)=`#585b7080`, 트랙 rgb(17,17,27). 선택 영역·hover·누름은 V3로 넘겼다.

### R-8 V2 — 영역 뼈대 (P2-3, 창 1440x852, DPR 1)

| ID | 요소 | rect (x, y, w, h) | 판정 |
| --- | --- | --- | --- |
| L-11 | `#root` 자식 순서 sidebar → workspace, 오른쪽 사이드바 없음 | sidebar (0,0,300,852), workspace (300,0,1140,852) | 통과 |
| L-12 | 사이드바 창 전체 높이, 헤더 높이 = 타이틀 바 높이 32, 타이틀 바는 사이드바 오른쪽 | sidebar h 852; header content h 32(+아래 선 1 = rect 33), titleBar (300,0,1140,32) | 통과 |
| L-13 | Workspace 세로: 타이틀 바 → 본문 → 상태 표시줄 | titleBar y0 h32 / body y32 h790 / statusBar y822 h30(끝 852) | 통과 |
| L-14 | 본문 가로: 왼쪽 Dock → PaneGroup, 아래·오른쪽 Dock 없음 | dock (300,33,240,788), paneGroup (540,33,900,788) | 통과 |
| L-15 | Pane = 탭 바 + 활성 아이템 | pane0 (540,33,449.5,788): tabs h32, pane-body y65 h756 | 통과 |
| L-16 | 왼쪽 Dock 오른쪽 테두리 `window.border_dock_left` | border-right-width 1px, 색 rgb(49,50,68)=`border` | 통과 |
| L-301~303 | (참고) 본문 위·아래, 사이드바 오른쪽, 헤더 아래 1px | 각각 1px, 헤더 아래 선 y=32와 본문 위 선 y=32 일치 | 관찰 |

### R-5·R-6 (P2-2, V1·코드 확인)

- D-5 ① 설정 노출 여부: wry 0.57.1은 `with_browser_accelerator_keys(false)`(→ `SetAreBrowserAcceleratorKeysEnabled`)를 갖고 있으나 Tauri 2.12.5·tauri-runtime-wry 2.12.3·tauri-utils 2.10.2에는 없다(`AcceleratorKeys` grep 0건). **안 됨(Tauri가 노출하지 않음).** 우회(`with_webview` + `webview2-com`)는 03-tauri 3.1 목록 밖이라 채택하지 않았다.
- D-5 ② 채택: 최상위 캡처 단계 `keydown`에서 `BROWSER_KEYS`(14개)는 `preventDefault`하고 모든 키를 키맵 엔진으로 보낸다. 우클릭은 캡처 단계 `contextmenu`의 `preventDefault`. 위치: `src/keymap/keyboard.ts`, 설치 `src/index.tsx`.
- R-6 단위 테스트 6개와 기존 1개가 모두 통과(`npm run test` 7/7; 이후 P2-3이 4개를 더해 11/11).
  1. `I-702: deeper context wins; same depth -> later; no context counts as deepest; length does not matter`
  2. `I-703: a deep null unbinds shallower bindings; an overlay null keeps user bindings`
  3. `I-001: space-separated keys are a chord pressed in order`
  4. `I-704: display key skips shadowed keys, requires equal arguments, takes the last binding`
  5. `key normalization: empty code uses key; IME uses code; numpad +/- are zoom keys`
  6. `R-5: every browser accelerator key to block normalizes into BROWSER_KEYS`

## 2. V3 결과

### R-3 — 창 동작과 창 모서리·테두리 관찰 (D-6, D-7)

| 확인 항목 | 스펙 ID | 기대 | 측정 | 결과 | 증거 |
| --- | --- | --- | --- | --- | --- |
| 최대화 버튼 hover 스냅 레이아웃 팝업 | L-83 | 팝업이 나온다 | 최대화 버튼(클라이언트 1386,16)에 마우스를 올리고 2.5초 기다려 모니터를 캡처했다. 팝업이 없다. 버튼 hover 배경만 바뀐다 | **안 됨** → 재측정(M-2-R1)에서 **됨**(문서 맨 아래 "재측정" 절) | `snap-flyout-hover.png`(캡처 크롭). `WM_NCHITTEST`(HTMAXBUTTON) 처리가 필요하다 → D-6 단계 2(`windows` 크레이트) |
| 타이틀 바 드래그 이동 | L-81 | 바 어디를 끌어도 창이 이동 | 클라이언트 (700,16)에서 (+160,−100) 끌기: 프레임 (137,130) → (297,30), 크기 변화 없음 | **됨** | `win-input.ps1 drag`, 전후 DWM 프레임 |
| 오른쪽 가장자리 리사이즈 | — | 크기가 바뀐다 | 클라이언트 폭 1440 → 1360(−80) | **됨** | 클라이언트 오른쪽 밖 3px에서 끌기 |
| 아래 가장자리 | — | 〃 | 높이 852 → 792(−60) | **됨** | 〃 |
| 오른쪽 아래 모서리 | — | 〃 | 1360x792 → 1440x852(+80,+60) | **됨** | 〃 |
| 왼쪽 가장자리 | — | 〃 | 폭 1440 → 1400, 프레임 x +40 | **됨** | 클라이언트 왼쪽 밖 4px |
| 위 가장자리 | — | 〃 | 높이 852 → 822, 프레임 y +30 | **됨** | 클라이언트 위 1px |
| 클라이언트 안쪽 2px(오른쪽 아래) | — | (관찰) | 크기 변화 없음 | 관찰 | 리사이즈 영역은 창 밖 8px 투명 테두리다(`GetWindowRect`가 클라이언트보다 좌·우·아래로 8px, 위로 1px 더 큼) |
| 더블클릭 최대화 | L-81 | 바 더블클릭으로 최대화·복원 | 스냅된 창에서 더블클릭 → 최대화(1920x1032, `isZoomed`), 다시 더블클릭 → 복원(1402x824 프레임) | **됨** | `allow-internal-toggle-maximize` 권한이 동작한다 |
| 최대화 버튼 클릭 | R-4 | 최대화·복원 | 클릭 → 최대화(`isZoomed` 참, 페이지 1920x1032), 같은 버튼 다시 클릭 → 복원 | **됨** | OS 클릭 |
| 변을 스냅(Win+Left) | — | (관찰용 상태) | 프레임 (0,0,960,1032), 클라이언트 958x1030. 최대화 아님 | 상태 확보 | Snap Assist는 앱을 다시 전경으로 가져와 닫았다 |

최대화 여백 실측값(PoC 결과표 항목):

| 항목 | 값 |
| --- | --- |
| 작업 영역 | {"x":0,"y":0,"w":1920,"h":1032} |
| 최대화 프레임(DWM) | {"x":0,"y":0,"width":1920,"height":1032} |
| 최대화 클라이언트 | {"x":0,"y":0,"w":1920,"h":1032} |
| 프레임 − 작업 영역(좌·위·우·아래) | 0, 0, 0, 0 |
| 클라이언트 − 작업 영역 | 0, 0, 0, 0 |
| 페이지 `innerWidth`×`innerHeight` | 1920×1032 |

**여백은 사방 0px**이다. 최대화한 창이 작업 영역(작업 표시줄 제외)을 정확히 채운다.

스냅 팝업에 `WM_NCHITTEST` 처리가 필요했는가: **필요하다.** `decorations:false` + `shadow:true`만으로는 최대화 버튼에 마우스를 올려도 스냅 레이아웃 팝업이 나오지 않았다. 필요한 방법은 D-6 단계 2(`windows` 크레이트로 최대화 버튼 영역에 `HTMAXBUTTON` 반환)이며, 의존성 추가라 승인이 필요하다. 이 측정에서는 만들지 않았다.

세 창 상태의 모서리·테두리 관찰값(`window.unmaximized.*`(L-311)는 판정하지 않고 나란히 적기만 한다, D-7). 프레임 가장자리 바깥 3px부터 안쪽으로 픽셀을 읽었다(바깥 쪽은 바탕화면이라 값이 바탕에 따라 다르다).

| 상태 | 프레임 | 테두리 | 모서리 | 비고 |
| --- | --- | --- | --- | --- |
| 최대화하지 않은 창 | 1442x854 | 1px `#0078d4`(Windows 강조색)가 네 변에 있다 | 네 모서리 모두 둥글다. 가장자리 행을 따라 안쪽 색이 시작하는 위치가 8·5·3·3·2·2·2·1px라 반지름은 약 8px | `corner-normal-topleft.png`·`corner-normal-bottomright.png`(10배 확대). 그림자는 앱이 그리지 않았고 DWM 몫 |
| 왼쪽 반을 스냅한 창 | 960x1032 | 1px `#0078d4` | 네 모서리 모두 직각(모든 행에서 1px 뒤 안쪽 색) | `corner-snapped-topleft.png`·`corner-snapped-topright.png` |
| 최대화한 창 | 1920x1032 | 없음(가장자리 첫 픽셀부터 안쪽 색) | 직각 | `corner-maximized-topleft.png`. 프레임 = 작업 영역 |

세 상태의 관찰값이 모두 있어 관찰 항목은 충족이다(SPEC R-3).

### R-4 — 창 버튼 V3

| 확인 항목 | 스펙 ID | 기대 | 측정 | 결과 |
| --- | --- | --- | --- | --- |
| 닫기 외 버튼 hover 배경 | L-84 | `ghost_element.hover` | 아래 R-7 표의 S-4(Mocha·Latte, 최소화·최대화 둘 다). 앱 픽셀과 기준 견본 차 0 | **통과** |
| 닫기 외 버튼 누름 배경 | L-84 | `ghost_element.active` | 아래 S-5(〃). 차 0 | **통과** |
| 글자(글리프) 색 | L-84 | `text` | 아래 S-3a·S-3b. 차 0 | **통과** |
| 최대화 상태의 가운데 글리프 | L-312 | U+E923(복원) | 더블클릭으로 최대화한 뒤 가운데 버튼 U+E923, `aria-label` Restore. 다시 복원하면 U+E922(Maximize). 버튼 클릭으로 최대화해도 같음(E923·E922) | **통과** |
| 최대화 상태 추적 | 03-tauri 4절 | `onResized` + `isMaximized`가 글리프를 바꾼다 | 위 전환 네 번 모두 페이지가 상태를 따라갔다(권한 `core:event:allow-listen`·`allow-is-maximized` 동작) | **통과** |
| 글리프 렌더(같은 글꼴·코드포인트 기준 글리프와 나란히) | L-83 | 같은 글꼴·코드포인트의 기준 글리프와 픽셀이 같다 | 같은 클래스의 버튼 복제본에 L-83·L-312 코드포인트를 직접 넣어 옆에 그려 비교: 비최대화 상태 최소화·최대화·닫기 U+E921 최대 픽셀 차 0 / U+E922 최대 픽셀 차 0 / U+E8BB 최대 픽셀 차 0, 최대화 상태 U+E921 차 0 / U+E923 차 0 / U+E8BB 차 0. 글꼴 Segoe Fluent Icons(사용자 정의 아님) | **통과** |

### R-5 — 브라우저 단축키 (OS 키 입력, 관찰 리스너는 측정 중에만 `tools/`에서 붙임, D-16)

조건: 편집기에 포커스를 둔 상태, IME 영문 모드. 관찰 리스너는 앱 리스너 뒤에 같은 대상(`window` 캡처)에 등록해 `defaultPrevented`가 앱이 한 결과를 보이게 했다. 브라우저 동작 확인: 새 창 없음(앱 프로세스 트리의 보이는 최상위 창 목록이 시작과 같음), 새로고침 없음(페이지 표식 유지), 확대 없음(`devicePixelRatio`·`visualViewport.scale` 그대로), 뒤로·앞으로 없음(`pushState` 두 번 뒤 `popstate` 0건), 키 입력 뒤에도 앱이 전경.

| 키 | 앱 keydown이 받은 것(key / code) | defaultPrevented | 브라우저 동작 | 판정 |
| --- | --- | --- | --- | --- |
| ctrl+p | p / KeyP | true | 없음(창 0·새로고침 없음·확대 없음·popstate 0) | 통과 |
| ctrl+f | f / KeyF | true | 없음(창 0·새로고침 없음·확대 없음·popstate 0) | 통과 |
| ctrl+r | r / KeyR | true | 없음(창 0·새로고침 없음·확대 없음·popstate 0) | 통과 |
| f5 | F5 / F5 | true | 없음(창 0·새로고침 없음·확대 없음·popstate 0) | 통과 |
| f3 | F3 / F3 | true | 없음(창 0·새로고침 없음·확대 없음·popstate 0) | 통과 |
| alt+left | ArrowLeft / ArrowLeft | true | 없음(창 0·새로고침 없음·확대 없음·popstate 0) | 통과 |
| alt+right | ArrowRight / ArrowRight | true | 없음(창 0·새로고침 없음·확대 없음·popstate 0) | 통과 |
| Ctrl+Plus (Ctrl+Shift+=) | + / Equal | true | 없음(창 0·새로고침 없음·확대 없음·popstate 0) | 통과 |
| Ctrl+= (Plus without Shift) | = / Equal | true | 없음(창 0·새로고침 없음·확대 없음·popstate 0) | 통과 |
| Ctrl+Minus | - / Minus | true | 없음(창 0·새로고침 없음·확대 없음·popstate 0) | 통과 |
| Ctrl+Numpad+ | + / NumpadAdd | true | 없음(창 0·새로고침 없음·확대 없음·popstate 0) | 통과 |
| Ctrl+Numpad- | - / NumpadSubtract | true | 없음(창 0·새로고침 없음·확대 없음·popstate 0) | 통과 |
| ctrl+w | w / KeyW | true | 없음(창 0·새로고침 없음·확대 없음·popstate 0) | 통과 |
| ctrl+tab | Tab / Tab | true | 없음(창 0·새로고침 없음·확대 없음·popstate 0) | 통과 |
| f1 | F1 / F1 | true | 없음(창 0·새로고침 없음·확대 없음·popstate 0) | 통과 |
| f6 | F6 / F6 | true | 없음(창 0·새로고침 없음·확대 없음·popstate 0) | 통과 |

- 화면 확인: `Ctrl+P`·`Ctrl+F`·`F3`를 보낸 1초 뒤 모니터 전체를 캡처해 눈으로 봤다(임시 폴더의 `m2-key-ctrl-p.png`·`m2-key-ctrl-f.png`·`m2-key-f3.png`). 인쇄 창·찾기 막대가 없고 편집기가 그대로다. 개인 바탕화면이 찍혀 있어 저장소에는 넣지 않았다. 모든 키 뒤 페이지 상태: `innerWidth`×`innerHeight` 1440×852, `devicePixelRatio` 1, 확대 배율 1.
- `Ctrl+=`(Shift 없는 Plus)는 SPEC 목록 밖 추가 차단 키다. 앱 keydown에 도달해 `defaultPrevented`다. 이 키를 차단 목록에서 빼도 되는지(브라우저가 확대하는지)는 재지 않았다.
- 숫자패드 +·−(`Ctrl+Numpad+`, `Ctrl+Numpad−`)는 key `+`/`-`, code `NumpadAdd`/`NumpadSubtract`로 도달하고 확대는 일어나지 않았다.

**브라우저 기본 우클릭 메뉴(03-tauri 4절)**

| 위치 | contextmenu 이벤트 | defaultPrevented | 메뉴 창 | 판정 |
| --- | --- | --- | --- | --- |
| editor body | 1회(대상 `cm-line cm-activeLine`) | true | 새 창 0개 | 통과 |
| title bar | 1회(대상 `title-bar`) | true | 새 창 0개 | 통과 |

**한글 IME(0x0412)에서 Ctrl+글자** — 한글 키(`hangul`)는 앱이 전경일 때만 보냈다. 모드 확인은 편집기에 포커스를 둔 채 일반 `p`를 눌러 key가 `Process`로 오는지로 했다(영문이면 `p`). 개발 중에 한글 키를 보내도 모드가 바뀌지 않은 적이 있어, 한 번 보낼 때마다 모드를 확인하며 목표 모드에 도달할 때까지 눌렀다. 이 실행: 영문 → 한글 키 1번으로 한글 모드, 다시 1번으로 원래 모드 복귀(복원 확인).

| 키(한글 모드) | 앱 keydown(key / code) | defaultPrevented | 브라우저 동작 | 판정 |
| --- | --- | --- | --- | --- |
| ctrl+p | Process / KeyP, p / KeyP | true, true | 없음(창 0·새로고침 없음·확대 없음) | 통과 |
| ctrl+f | f / KeyF | true | 없음(창 0·새로고침 없음·확대 없음) | 통과 |
| ctrl+r | r / KeyR | true | 없음(창 0·새로고침 없음·확대 없음) | 통과 |
| ctrl+w | w / KeyW | true | 없음(창 0·새로고침 없음·확대 없음) | 통과 |

- 한글 모드에서 Ctrl을 누르면 key는 영문 소문자(`p`,`f`,`r`,`w`)로 온다. 첫 `Ctrl+P`에서는 조합이 끝나지 않은 글자(앞선 `p` 시험이 남긴 것) 때문에 `Process / ControlLeft`(수정키, `defaultPrevented` false)와 `Process / KeyP`(`defaultPrevented` true)가 먼저 오고 이어 `p / KeyP`가 온다. `code`가 그대로라 앱의 정규화(`strokeOf`)가 같은 stroke로 읽는다.
- `Ctrl+Plus`·숫자패드·`F` 키·`Alt+←/→`·`Ctrl+Tab`은 글자 키가 아니어서 IME 모드와 관계없이 같은 경로다. 한글 모드에서는 다시 재지 않았다.

**D-5 결과(PoC 결과표 항목)**: `AreBrowserAcceleratorKeysEnabled`는 Tauri·wry에서 wry만 노출하고 Tauri는 노출하지 않는다(P2-2 코드 확인). 채택한 방식은 D-5 ②(캡처 단계 `keydown`의 `preventDefault`)이며, 위 표대로 시험할 키를 포함해 전부 앱에 도달하고 브라우저 동작이 없었다. 그래서 D-5의 후속(`webview2-com` 우회)은 필요하지 않았다.

### R-7 — 테마 V3

**변수 덤프(정확히 같아야 한다, A-31.8)** — 세 테마를 `?theme=`로 다시 불러와 24개 토큰의 `--…` 변수를 읽고, 원본 JSON(또는 T-26.3)에서 따로 계산한 값(`tools/theme-expect.mjs`, 앱의 `theme.ts`를 쓰지 않음)과 비교했다.

| 테마 | appearance | 24개 중 일치 | 불일치 |
| --- | --- | --- | --- |
| Catppuccin Mocha | dark | 24/24 | 없음 |
| Catppuccin Latte | light | 24/24 | 없음 |
| One Light | light | 24/24 | 없음 |

- 예: `--border` #313244ff, `--title-bar-background` #11111bff, `--title-bar-inactive-background` #171725ff. 값은 모두 소문자 `#rrggbbaa`(6자리 JSON은 `ff` 알파).
- `scrollbar.thumb.active_background`는 세 테마 모두 JSON에 없거나 `null`이라 T-26.3(`scrollbar.thumb.background` 값)이 쓰였다. 그래서 S-22의 "끄는 중" 색은 기본 색과 같다.

**화면 색(S-1~S-23)** — 기준 견본 대비 ±1(`verification.tolerance.color_channel`)이 주 기준이다(D-10). 방식은 같은 캡처 경로(CDP `Page.captureScreenshot`)다.
- 단색 영역: 같은 위치에 같은 토큰 CSS(투명 토큰은 아래 색을 먼저 칠한 뒤)로 칠한 견본을 덧씌워 다시 캡처한 픽셀과 비교.
- 글자(S-3·S-12·S-13·S-16·S-18·S-19): 덧씌운 견본은 LCD 안티앨리어싱을 꺼서 쓸 수 없었다. 같은 글자를 제자리에서 토큰 리터럴 색으로 다시 칠해 비교했다. 글자 영역 전체(앱과 같은 위치 모든 픽셀)의 최대 차가 0이었다. 글자 픽셀은 안티앨리어싱이라 원본 JSON 직접 값은 "해당 없음"이다.
- 상태는 CDP 입력(hover=이동, 누름=버튼 누른 채 캡처 후 영역 밖에서 놓기, 선택=드래그)과 실제 창 포커스 잃음(`blur` 동작: 작업 표시줄을 전경으로 만듦, `document.hasFocus()` false)으로 만들었다.
- 샘플 위치: S-8은 다섯 선(타이틀 바 아래·탭 바 아래·상태 표시줄 위·사이드바 오른쪽·왼쪽 Dock 오른쪽) 각각의 1px 줄(S-8a~e). S-21은 선택 영역 가운데 조각, 편집기 보이는 오른쪽 끝 근처. S-22 손잡이는 트랙 열을 훑어 찾았다.
- **S-11·S-13(비활성 탭)**: 앱에는 탭이 하나뿐이고 탭을 더 여는 길이 없어 비활성 탭이 화면에 없다. 그래서 **앱에서는 측정 불가**다. 참고로 활성 탭 DOM을 복제해 `active` 클래스를 뺀 요소를 측정 중에만 주입해 쟀고, 차 0으로 통과했다. 주입 요소는 앱 상태가 아니므로 판정에 쓰지 않는다. 비활성 탭이 생기는 화면이 있어야 판정할 수 있다.
- 원본 JSON 직접 대비(참고)는 단색에서 채널당 0~2였고(최대 2: Mocha S-20 알파 합성), 판정에 쓰지 않는다.

**Mocha(Catppuccin Mocha, 기준 화면 A-30.1)**

| 스펙 ID | 화면 요소·상태 | 토큰 | 앱 픽셀 | 기준 견본 | 차이(주) | 원본 JSON 합성(참고) | 차이(참고) | 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S-1 | title bar (focused) | `title_bar.background` | #12111b | #12111b | 0 | #11111b | 1 | 통과 |
| S-3a | minimize glyph | `text` | #aad2f4 | #aad2f4 | 0 | 해당 없음(글자 안티앨리어싱) | — | 통과 |
| S-3b | maximize glyph | `text` | #801d1b | #801d1b | 0 | 해당 없음(글자 안티앨리어싱) | — | 통과 |
| S-6 | sidebar | `panel.background` | #191825 | #191825 | 0 | #181825 | 1 | 통과 |
| S-7 | left dock | `panel.background` | #191825 | #191825 | 0 | #181825 | 1 | 통과 |
| S-8a | line under title bar | `border` | #323144 | #323144 | 0 | #313244 | 1 | 통과 |
| S-8b | line under tab bar | `border` | #323144 | #323144 | 0 | #313244 | 1 | 통과 |
| S-8c | line above status bar | `border` | #323144 | #323144 | 0 | #313244 | 1 | 통과 |
| S-8d | line right of sidebar | `border` | #323144 | #323144 | 0 | #313244 | 1 | 통과 |
| S-8e | line right of left dock | `border` | #323144 | #323144 | 0 | #313244 | 1 | 통과 |
| S-9 | tab bar | `tab_bar.background` | #12111b | #12111b | 0 | #11111b | 1 | 통과 |
| S-10 | active tab | `tab.active_background` | #1f1d2e | #1f1d2e | 0 | #1e1e2e | 1 | 통과 |
| S-11 | inactive tab (injected clone) | `tab.inactive_background` | #0b0b11 | #0b0b11 | 0 | #0b0b11 | 0 | 측정 불가(앱에 요소 없음). 주입 요소 참고값은 통과 → 재측정(M-2-R1)에서 실제 요소로 통과 |
| S-12 | active tab title | `text` | #85b9f4 | #85b9f4 | 0 | 해당 없음(글자 안티앨리어싱) | — | 통과 |
| S-13 | inactive tab title (injected clone) | `text.muted` | #bcc1de | #bcc1de | 0 | 해당 없음(글자 안티앨리어싱) | — | 측정 불가(앱에 요소 없음). 주입 요소 참고값은 통과 → 재측정(M-2-R1)에서 실제 요소로 통과 |
| S-14 | status bar | `status_bar.background` | #11111b | #12111b | 1 | #11111b | 0 | 통과 |
| S-15 | editor background | `editor.background` | #1f1d2e | #1f1d2e | 0 | #1e1e2e | 1 | 통과 |
| S-16 | editor text | `editor.foreground` | #add5f4 | #add5f4 | 0 | 해당 없음(글자 안티앨리어싱) | — | 통과 |
| S-17 | gutter background | `editor.gutter.background` | #1f1d2e | #1f1d2e | 0 | #1e1e2e | 1 | 통과 |
| S-18 | line number (not cursor line) | `editor.line_number` | #65839c | #65839c | 0 | 해당 없음(글자 안티앨리어싱) | — | 통과 |
| S-19 | line number (cursor line) | `editor.active_line_number` | #cca3f8 | #cca3f8 | 0 | 해당 없음(글자 안티앨리어싱) | — | 통과 |
| S-20 | current line highlight | `editor.active_line.background` | #2c2a3c | #2c2a3c | 0 | #2a2b3c | 2 | 통과 |
| S-23 | scrollbar track | `scrollbar.track.background` | #11111b | #12111b | 1 | #11111b | 0 | 통과 |
| S-22 | scroll thumb default (thumb default) | `scrollbar.thumb.background` | #363545 | #363545 | 0 | #353646 | 1 | 통과 |
| S-22 | scroll thumb hover (thumb hover) | `scrollbar.thumb.hover_background` | #6d6f86 | #6d6f86 | 0 | #6c7086 | 1 | 통과 |
| S-22 | scroll thumb pressed (thumb pressed) | `scrollbar.thumb.active_background` | #363545 | #363545 | 0 | #353646 | 1 | 통과 |
| S-4 | minimize button hover (minimize hover) | `ghost_element.hover` | #22212e | #22212e | 0 | #21212e | 1 | 통과 |
| S-5 | minimize button pressed (minimize pressed) | `ghost_element.active` | #3d3d4e | #3d3d4e | 0 | #3c3d4e | 1 | 통과 |
| S-4 | maximize button hover (maximize hover) | `ghost_element.hover` | #22212e | #22212e | 0 | #21212e | 1 | 통과 |
| S-5 | maximize button pressed (maximize pressed) | `ghost_element.active` | #3d3d4e | #3d3d4e | 0 | #3c3d4e | 1 | 통과 |
| S-21 | selection (selection) | `players[0].selection` | #3c3c4f | #3c3c4f | 0 | #3b3d4f | 1 | 통과 |
| S-2 | title bar (inactive) (blurred) | `title_bar.inactive_background` | #181625 | #181625 | 0 | #171725 | 1 | 통과 |

**Latte(Catppuccin Latte, 기준 화면 A-30.6)**

| 스펙 ID | 화면 요소·상태 | 토큰 | 앱 픽셀 | 기준 견본 | 차이(주) | 원본 JSON 합성(참고) | 차이(참고) | 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S-1 | title bar (focused) | `title_bar.background` | #dde0e8 | #dde0e8 | 0 | #dce0e8 | 1 | 통과 |
| S-3a | minimize glyph | `text` | #4e4e69 | #4e4e69 | 0 | 해당 없음(글자 안티앨리어싱) | — | 통과 |
| S-3b | maximize glyph | `text` | #afdde8 | #afdde8 | 0 | 해당 없음(글자 안티앨리어싱) | — | 통과 |
| S-6 | sidebar | `panel.background` | #e7e9ef | #e7e9ef | 0 | #e6e9ef | 1 | 통과 |
| S-7 | left dock | `panel.background` | #e7e9ef | #e7e9ef | 0 | #e6e9ef | 1 | 통과 |
| S-8a | line under title bar | `border` | #cdd0da | #cdd0da | 0 | #ccd0da | 1 | 통과 |
| S-8b | line under tab bar | `border` | #cdd0da | #cdd0da | 0 | #ccd0da | 1 | 통과 |
| S-8c | line above status bar | `border` | #cdd0da | #cdd0da | 0 | #ccd0da | 1 | 통과 |
| S-8d | line right of sidebar | `border` | #cdd0da | #cdd0da | 0 | #ccd0da | 1 | 통과 |
| S-8e | line right of left dock | `border` | #cdd0da | #cdd0da | 0 | #ccd0da | 1 | 통과 |
| S-9 | tab bar | `tab_bar.background` | #dde0e8 | #dde0e8 | 0 | #dce0e8 | 1 | 통과 |
| S-10 | active tab | `tab.active_background` | #eff1f5 | #eff1f5 | 0 | #eff1f5 | 0 | 통과 |
| S-11 | inactive tab (injected clone) | `tab.inactive_background` | #d3d7e2 | #d3d7e2 | 0 | #d2d7e2 | 1 | 측정 불가(앱에 요소 없음). 주입 요소 참고값은 통과 → 재측정(M-2-R1)에서 실제 요소로 통과 |
| S-12 | active tab title | `text` | #4e4e7b | #4e4e7b | 0 | 해당 없음(글자 안티앨리어싱) | — | 통과 |
| S-13 | inactive tab title (injected clone) | `text.muted` | #5e5e77 | #5e5e77 | 0 | 해당 없음(글자 안티앨리어싱) | — | 측정 불가(앱에 요소 없음). 주입 요소 참고값은 통과 → 재측정(M-2-R1)에서 실제 요소로 통과 |
| S-14 | status bar | `status_bar.background` | #dde0e8 | #dde0e8 | 0 | #dce0e8 | 1 | 통과 |
| S-15 | editor background | `editor.background` | #eff1f5 | #eff1f5 | 0 | #eff1f5 | 0 | 통과 |
| S-16 | editor text | `editor.foreground` | #4e4e92 | #4e4e92 | 0 | 해당 없음(글자 안티앨리어싱) | — | 통과 |
| S-17 | gutter background | `editor.gutter.background` | #eff1f5 | #eff1f5 | 0 | #eff1f5 | 0 | 통과 |
| S-18 | line number (not cursor line) | `editor.line_number` | #a68ea1 | #a68ea1 | 0 | 해당 없음(글자 안티앨리어싱) | — | 통과 |
| S-19 | line number (cursor line) | `editor.active_line_number` | #8c24f0 | #8c24f0 | 0 | 해당 없음(글자 안티앨리어싱) | — | 통과 |
| S-20 | current line highlight | `editor.active_line.background` | #e3e6eb | #e3e6eb | 0 | #e3e6eb | 0 | 통과 |
| S-23 | scrollbar track | `scrollbar.track.background` | #dde0e8 | #dde0e8 | 0 | #dce0e8 | 1 | 통과 |
| S-22 | scroll thumb default (thumb default) | `scrollbar.thumb.background` | #c5c8d3 | #c5c8d3 | 0 | #c4c8d3 | 1 | 통과 |
| S-22 | scroll thumb hover (thumb hover) | `scrollbar.thumb.hover_background` | #9d9fb0 | #9d9fb0 | 0 | #9ca0b0 | 1 | 통과 |
| S-22 | scroll thumb pressed (thumb pressed) | `scrollbar.thumb.active_background` | #c5c8d3 | #c5c8d3 | 0 | #c4c8d3 | 1 | 통과 |
| S-4 | minimize button hover (minimize hover) | `ghost_element.hover` | #d3d6e0 | #d3d6e0 | 0 | #d2d6e0 | 1 | 통과 |
| S-5 | minimize button pressed (minimize pressed) | `ghost_element.active` | #c0c3cf | #c0c3cf | 0 | #bfc3cf | 1 | 통과 |
| S-4 | maximize button hover (maximize hover) | `ghost_element.hover` | #d3d6e0 | #d3d6e0 | 0 | #d2d6e0 | 1 | 통과 |
| S-5 | maximize button pressed (maximize pressed) | `ghost_element.active` | #c0c3cf | #c0c3cf | 0 | #bfc3cf | 1 | 통과 |
| S-21 | selection (selection) | `players[0].selection` | #cdced7 | #cdced7 | 0 | #cccfd7 | 1 | 통과 |
| S-2 | title bar (inactive) (blurred) | `title_bar.inactive_background` | #e7e9ee | #e7e9ee | 0 | #e6e9ee | 1 | 통과 |

- One Light는 토큰 값(위 변수 덤프)만 본다(D-8).
- `background`(창 맨 바닥)는 W-7 Q-7대로 화면 샘플 없이 변수 값만 본다(세 테마 일치).
- S-22 끄는 중(pressed)은 T-26.3 때문에 기본 색과 같은 값이라, 이 비교는 "끄는 중에도 같은 토큰을 쓴다"는 뜻이다. hover는 색이 바뀌었다(Mocha #6d6f86, 기본 #363545).
- 개발 중 지적된 것: 표 만들기 초기에 S-20·S-21 샘플 점이 보이는 편집기 밖(`.cm-activeLine` 상자가 창보다 넓음)에 찍혀 불일치처럼 보였다. 점을 보이는 스크롤러 안으로 옮겨 해결했고, 위 표는 그 뒤 값이다. 앱 문제는 아니다.

### R-1 — 새 영역 뼈대에서 탭 이동

| 확인 항목 | 이동 전 | 이동 직후(한 프레임 뒤) | 500ms 뒤 | 결과 |
| --- | --- | --- | --- | --- |
| 탭이 있는 Pane | 0 | 1 | 1 | 이동함 |
| `.cm-editor` 노드 `===` | — | true | true | **됨** |
| `.cm-scroller` 노드 `===` | — | — | true | **됨** |
| 문서에 연결·`.cm-editor` 개수 | true·1 | true·1 | true·1 | **됨** |
| `scrollTop`·`scrollLeft` | 300·20 | 300·20 | 300·20 | **됨** |
| DOM 선택(앵커·포커스 오프셋, 선택 글자 수) | 5·26·59 | 5·26·59 | 5·26·59 | **됨** |
| DOM 선택 앵커·포커스 노드 `===` | — | true·true | true·true | **됨** |
| 커서·선택 사각형(편집기 기준) | 커서 1, 선택 3조각 | 같음 | 같음 | **됨** |
| 포커스(`cm-focused`) | true | true | true | **됨** |

**R-1 새 영역 뼈대(PaneGroup)에서도 됨.** Phase 1 V3와 같은 조작(스크롤 300/20, CDP 드래그로 선택, "→" 클릭)이다. 이번 뼈대에서 `scrollTop`이 300까지 올라간 것은 Pane 본문 높이가 756이라서다(Phase 1은 280).

## 3. 측정 불가·판정하지 않은 것

| 항목 | 상태 | 사유·다음 조치 |
| --- | --- | --- |
| S-11·S-13 비활성 탭의 화면 색(Mocha·Latte) | 측정 불가 → 재측정(M-2-R1)에서 통과 | 앱에 탭이 하나뿐이라 요소가 없다. 주입한 복제 요소는 통과(참고). 판정하려면 탭을 둘 이상 만드는 화면이 필요하다(`impl` 또는 W-7 표 3 정정은 `leader` 결정) |
| 스냅 레이아웃 팝업 | **안 됨** → 재측정(M-2-R1)에서 됨 | D-6 단계 2(`WM_NCHITTEST`, `windows` 크레이트) 후속 카드와 의존성 승인이 필요하다 |
| 닫기 버튼 hover·누름 색(L-84) | 판정하지 않음 | SPEC 공통 판정 방식의 제외 항목 |
| 모서리 반지름·테두리 폭 | 관찰만 | `window.unmaximized.*`(L-311)는 판정하지 않는다(D-7) |
| `Ctrl+=` 차단이 꼭 필요한지 | 재지 않음 | SPEC 목록 밖 추가 키(`impl` 보고의 사용자 확인 항목) |
| 4K·다른 배율 | 재지 않음 | 측정 조건은 1920x1080 100% 하나다 |

## 4. 한눈에 보는 결과

- 안 됨: **R-3 스냅 레이아웃 팝업**(1건) → 재측정(M-2-R1)에서 됨.
- 통과: R-3 이동·가장자리 리사이즈·더블클릭 최대화·최대화 여백(0)·세 창 상태 관찰값, R-4 V3 전부, R-5 전부(시험할 키 포함 16개 + 한글 모드 4개 + 우클릭), R-7 변수 덤프 72/72와 화면 색 S-1~S-23(비활성 탭 제외), R-1.
- 측정 불가: S-11·S-13(앱에 비활성 탭이 없음) → 재측정(M-2-R1)에서 통과.
- 개발 중 고친 측정 도구 문제: `win-input.ps1`의 `SetForegroundWindow` 거부(→ `AttachThreadInput`), 글자 색 기준 렌더, 샘플 점 위치. 앱 코드는 고치지 않았다.

---

# 재측정 (M-2-R1) — 최대화 버튼 네이티브화(P2-4)와 둘째 탭

> 대상: `impl` P2-4 보고(`impl-p2-4.md`)에서 바뀐 것과 지난 불일치·측정 불가 항목만이다. 이미 통과한 다른 항목은 다시 재지 않았다. 위 본문의 지난 행(R-3 스냅 팝업 "안 됨", S-11·S-13 "측정 불가")은 지우지 않고 "→ 재측정" 표시를 붙였다.
> 조건은 위 측정 조건과 같다(1920x1080 100%, 창 논리 1440x852, 안전 규칙 같음: PID·HWND 고정, 입력 직전 전경 확인). 대상 exe는 P2-4 빌드(2026-11-05 12:03:32, 이후 바뀐 소스 없음).
> 스크립트: `tools/measure-p2.mjs` 단계 `tabs`·`native`·`snap`, `tools/win-input.ps1`에 `presshold`(누른 채 캡처 후 놓기)·`hoverclick`(hover 캡처 후 화면 좌표 클릭)를 더했다.
> 세션: `tabs,native,snap` 한 번에 돌린 실행의 `tabs`·`native` 값을 쓴다. `snap` 단계는 이동·리사이즈 시험 방식(창이 위쪽이면 포인터가 화면 위 가장자리로 가 Aero Snap이 걸리거나 아래쪽이면 작업 표시줄에 걸림)을 고쳐 두 번 더 돌렸고(앱 3번 추가 실행, 가드가 입력을 거부한 것은 모두 작업 표시줄 위였고 다른 창에 키가 가지 않았다), 아래 R-3 값은 마지막 실행이다.

## R-3 재측정

| 확인 항목 | 스펙 ID | 기대 | 측정 | 결과 | 증거 |
| --- | --- | --- | --- | --- | --- |
| 최대화 버튼 hover 스냅 레이아웃 팝업 | L-83 | 팝업이 나온다 | 최대화 버튼(클라이언트 끝에서 두 번째 칸)에 2.5초 hover한 뒤 모니터를 캡처했다. 스냅 레이아웃 팝업(여섯 배치, 3x3 격자 형태)이 나온다 | **됨** | `snap-flyout-hover-r1.png`. 지난 "안 됨"(HTML 버튼)은 P2-4의 네이티브 버튼(`HTMAXBUTTON`)으로 해결 |
| 팝업 칸 선택으로 스냅 | L-83 | 칸을 누르면 그 배치로 스냅 | 가운데 줄 왼쪽 "반반" 배치의 왼쪽 칸을 클릭: 프레임 (0,0) 960x1032, 클라이언트 958x1030(작업 영역의 왼쪽 반), 최대화 아님. 앱 DOM 크기 958x1030 | **됨** | 포인터를 팝업 칸으로 옮기는 동안 전경 창이 앱에서 바뀌지 않았다(가드 통과). Snap Assist는 앱을 전경으로 가져와 닫음 |
| 최대화 버튼 클릭: 버튼 위에서 놓기 | L-83·L-312 | 최대화(복원) | 눌렀다 같은 버튼 위에서 놓음 → 최대화(`isZoomed` true, 프레임 0,0,1920x1032), DOM 버튼 U+E923·`Restore`. 같은 방식으로 다시 누름 → 복원(원래 프레임 189,182 1442x854), DOM U+E922 | **됨** | 최대화·복원 모두 |
| 최대화 버튼 클릭: 버튼 밖에서 놓기 | — | 아무 일도 없다 | 버튼을 누른 채 (−300,+300)으로 옮겨 놓음 → 최대화 아님, 프레임 그대로(true), DOM U+E922·`Maximize` | **됨** | 취소 동작 정상 |
| 더블클릭 최대화·복원 | L-81 | 되는 채로 | 스냅된 창에서 더블클릭 → 최대화(true, DOM U+E923), 다시 더블클릭 → 복원(true, 프레임 1442x854, DOM U+E922) | **됨** | 영역 뚫기(hole)가 더블클릭을 깨지 않았다 |
| 타이틀 바 드래그 이동 | L-81 | 되는 채로 | (+160,-36) 끌기 → 프레임 이동 (dx 160, dy -36), 크기 변화 없음(포인터가 화면 위 가장자리로 가 Aero Snap이 걸리지 않게 세로 이동은 필요한 만큼만) | **됨** | |
| 가장자리 리사이즈 | — | 되는 채로 | 오른쪽 가장자리 −80: 클라이언트 폭 1440 → 1360. 오른쪽 아래 모서리 +80,+60: 1360x852 → 1440x1030(아래 가장자리가 작업 영역 끝에 닿아 Windows가 세로를 작업 영역 높이 1032로 맞춤). 타이틀 바 높이의 오른쪽 가장자리(최대화 버튼 옆) −30: 1440 → 1410 | **됨** | 최대화 버튼 칸 옆에서도 리사이즈 됨 |

스냅 팝업 `WM_NCHITTEST` 처리 방법(PoC 결과표 항목): P2-4 보고대로 `WRY_WEBVIEW` 자식 창에서 최대화 버튼 칸을 `SetWindowRgn`으로 뚫고 최상위 창 서브클래스가 `HTMAXBUTTON`을 돌려준다(D-6 단계 2, `windows` 크레이트 0.62.2). 그 칸은 GDI로 그린다. 이 측정은 방법이 아니라 결과(팝업·선택 스냅·클릭·이동·리사이즈)를 확인했다.

## R-4 재측정 — 네이티브 최대화 버튼

최대화 버튼의 hover·누름은 이제 HTML이 아니라 네이티브(GDI)라 CDP 마우스로는 일어나지 않는다. 실제 OS 마우스(`win-input.ps1`)로 올리고 누르고, 모니터 캡처에서 버튼 칸 픽셀을 읽었다. 기준 견본은 같은 모니터 캡처 안에 DOM으로 칠한 같은 토큰 색 상자(바 왼쪽, 타이틀 바 배경 위)다. 버튼 칸의 두 점(칸 안 (4,4)·(31,27), 글리프 밖)을 읽었다. 누름은 버튼 위에서 누른 채 700ms 뒤 캡처하고 밖에서 놓았다(클릭 안 됨, 최대화 아님·`Maximize` 확인).

| 스펙 ID | 테마 | 상태 | 토큰 | 앱 픽셀(두 점) | 기준 견본 | 차이(주) | 원본 JSON 합성(참고) | 차이(참고) | 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| (기본) | Mocha | default (no hover) | `title_bar.background` | #11111b, #11111b | #12111b | 1 | #11111b | 0 | 통과 |
| S-4 | Mocha | hover | `ghost_element.hover` | #21212e, #21212e | #22212e | 1 | #21212e | 0 | 통과 |
| S-5 | Mocha | pressed (released outside) | `ghost_element.active` | #3c3d4e, #3c3d4e | #3d3d4e | 1 | #3c3d4e | 0 | 통과 |
| (기본) | Latte | default (no hover) | `title_bar.background` | #dce0e8, #dce0e8 | #dde0e8 | 1 | #dce0e8 | 0 | 통과 |
| S-4 | Latte | hover | `ghost_element.hover` | #d2d6e0, #d2d6e0 | #d3d6e0 | 1 | #d2d6e0 | 0 | 통과 |
| S-5 | Latte | pressed (released outside) | `ghost_element.active` | #bfc3cf, #bfc3cf | #c0c3cf | 1 | #bfc3cf | 0 | 통과 |

- 기준 견본이 앱 픽셀보다 R 채널로 1 높게 나온다(DOM 상자가 같은 캡처 경로에서 +1). 허용 오차 ±1 안이다. 앱의 네이티브 색은 원본 JSON 합성값과 채널 차 0이다.
- 기본(hover 아님) 배경이 타이틀 바 배경과 같다(`base` 행): 버튼 칸이 주변과 이어진다.

**글리프 렌더(최대화 버튼, U+E922)** — 같은 글꼴·코드포인트의 DOM 기준 글리프(최소화 버튼 복제본에 U+E922)와 나란히 비교.

| 테마·상태 | 글리프 먹 범위(네이티브  대  기준, 칸 안 좌표 x0,y0,x1,y1) | 범위 차(네이티브 − 기준) | 먹 픽셀 수(네이티브  대  기준) | 최대 픽셀 차(0 위치) | 세로 ±2 이동 최선 | 판정 |
| --- | --- | --- | --- | --- | --- | --- |
| Mocha, 비최대화 U+E922 | [12,11,23,20]  대  [12,11,23,20] | [0,0,0,0] | 68  대  70 | 59 | dy 0, 59 | 통과(관찰 기록): 위치·크기 같음, 픽셀 값은 렌더러 차이 |
| Latte, 비최대화 U+E922 | [13,11,23,20]  대  [12,11,23,20] | [1,0,0,0] | 52  대  68 | 12 | dy 0, 12 | 통과(관찰 기록): 위치·크기 같음, 픽셀 값은 렌더러 차이 |
| Mocha, 최대화 상태 U+E923 | [12,11,23,20]  대  [12,11,23,20] | [0,0,0,0] | 74  대  78 | 65 | dy 0, 65 | 통과(관찰 기록): 위치·크기 같음, 픽셀 값은 렌더러 차이 |

- 세로 위치: 네이티브 글리프와 기준 글리프의 먹 범위가 세로로 같다(y 11~20). impl이 예고한 1px 세로 차는 없었다. 라이트 테마(Latte)는 왼쪽 끝이 1px 짧다(GDI가 더 가늘게 그려 먹 픽셀 52 대 68).
- 최대 픽셀 차 59(Mocha)·12(Latte)·65(Mocha 최대화)는 GDI(ClearType)와 Chromium의 안티앨리어싱 차이다. 수직 이동 보정으로도 줄지 않는다(최선 59). 원문에 통과 수치가 없어 측정값과 관찰을 기록하는 것으로 충족한다(SPEC 공통 판정 방식). 앞 절(HTML 버튼 시절)의 "픽셀 차 0"은 최소화·닫기 버튼에는 여전히 맞고, 최대화 버튼에는 이 표가 대체한다.
- 최대화 상태: 가운데(최대화) 버튼 DOM이 U+E923(`Restore`)로 바뀌었고, 네이티브 칸의 글리프는 기준 U+E923과 먹 범위가 같고(픽셀 차 65로 비최대화 때 59와 같은 수준) 먹 픽셀 수가 비최대화(68)와 달라 모양이 바뀐 것과 맞는다. 모양을 눈으로 비교한 것은 아니다.
- 최소화·닫기 버튼은 이번에 바뀌지 않았다(재측정 제외).

## S-11 · S-13 재측정 — 비활성 탭(둘째 탭 `style.css`)

앱 상태에 실제 비활성 탭이 생겼다(탭: index.html (active), style.css). 주입 요소가 아니라 앱의 실제 요소를 쟀다. 방식은 위 R-7과 같다(바탕은 같은 토큰 견본 대비, 글자는 같은 글자를 토큰 리터럴 색으로 제자리에서 다시 칠해 대비).

| 스펙 ID | 테마 | 화면 요소 | 토큰 | 앱 픽셀 | 기준 견본 | 차이(주) | 원본 JSON 합성(참고) | 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S-11 | Mocha | inactive tab (real) | `tab.inactive_background` | #0b0b11 | #0b0b11 | 0 | #0b0b11 (차 0) | 통과 |
| S-13 | Mocha | inactive tab title (real) | `text.muted` | #94c1de | #94c1de | 0 | 해당 없음(글자) | 통과 |
| S-11 | Latte | inactive tab (real) | `tab.inactive_background` | #d3d7e2 | #d3d7e2 | 0 | #d2d7e2 (차 1) | 통과 |
| S-13 | Latte | inactive tab title (real) | `text.muted` | #875e77 | #875e77 | 0 | 해당 없음(글자) | 통과 |

- 글자(S-13)는 글자 영역 전체의 최대 차가 0이다. 지난 주입 요소 값과 같다.
- **S-11·S-13: 측정 가능해졌고 통과.** 이로써 S-1~S-23 모두 앱 상태에서 쟀다.

## 재측정 요약

- 안 됨이던 R-3 스냅 레이아웃 팝업: **됨**(팝업, 칸 선택 스냅까지). 최대화 버튼 클릭(안·밖에서 놓기), 더블클릭 최대화·복원, 이동, 가장자리 리사이즈는 영향 없음.
- R-4 최대화 버튼 hover·누름 색(S-4·S-5, Mocha·Latte): 통과(네이티브). 글리프: 위치·크기 같음, 픽셀 값은 GDI와 Chromium 차이(관찰 기록). 최대화 상태 U+E923: 통과.
- S-11·S-13: 통과. 측정 불가가 남은 항목 없음.
- 재지 않은 것(impl 보고가 이미 한계로 적음): 비활성 창에서 최대화 버튼 hover 시 배경(활성 배경 기준 합성), 100%가 아닌 화면 배율.

> 정리(M-5): 이 표를 만든 `tools/measure-p2.mjs`는 작업 트리에서 지웠다. 커밋 6dd9580(Phase 2)의 git 기록에 남아 있다(`git show 6dd9580:tools/measure-p2.mjs`).
