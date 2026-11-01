# Phase 2 검증 보고서 — SPEC R-3 ~ R-9

- 검증자: wt-checker (Claude Sonnet 5.5, 대체 모델). 날짜: 2026-11-01. 코드는 고치지 않았다. 쓴 곳은 `specs/v0.1/verify/phase2/`뿐이다.
- 기준: `specs/v0.1/SPEC.md`의 "공통 판정 방식"과 R-3~R-9, `DECISIONS.md` D-5·D-6·D-7·D-11·D-13, `PROGRESS.md` Phase 2의 "R-8 대상 토큰·화면 샘플 목록 고정"(27개 토큰, S-1~S-13). 기대값은 01-zed 원문(`01-LAYOUT.md`, `02-INTERACTION.md`, `03-THEME-ICONS.md`)과 원본 테마 JSON에서 직접 가져왔다. 앱이 낸 `pass`는 근거로 쓰지 않았다.
- 대상: wt-runner-app의 `tauri dev` (zedlike.exe PID 17684, HWND 0x760830, CDP 9222). 모든 호출을 같은 PID·HWND로 고정했다(`cdp-eval.mjs --pid 17684`, `win-input.ps1 -ProcessId 17684`, `capture.ps1 -Hwnd 0x760830`). 창 크기 세 값(win-input `clientSize`, `__poc.caption().native.clientWidth/Height`, capture `clientRect`)이 모두 2880×1704 물리 px로 같았다.
- 환경: devicePixelRatio 2(200%), 창 1440×852 논리(= Mocha 기준 화면 2880×1704 물리와 같은 크기·배율). Latte는 창을 1224×740 논리(물리 2448×1479, 기준 2448×1480)로 줄여 찍었다. 시험 전 창 상태는 frame (−5, 9, 2884×1708), client 2880×1704, 최대화 아님이었고 시험 뒤 같은 값으로 되돌렸다. 앱 테마도 Catppuccin Mocha로 되돌렸다.
- 스크립트: 판정에 쓴 보조 스크립트를 이 폴더에 두었다(`r8-compare.mjs`, `r8-screen.mjs`, `r4-glyph.mjs`, `r5-corner.mjs`, `r7-i703-probe.mts`, `r8-parser-probe.mts`, `make-fragments.mjs` 등). 앱 코드는 건드리지 않았다.

## 색 판정에서 먼저 알아 둘 것 (판정자 해석)

이 PC에서 WebView2가 칠한 픽셀은 CSS 색과 채널당 1~4쯤 다르다. 어두운 색은 R+1, B−1 정도이고, 밝은 색·채도가 높은 색일수록 크다. 예: 편집기 바탕 CSS `#1e1e2e` → 픽셀 `#1f1e2d`, 닫기 hover CSS `#E81120` → 픽셀 `#ca322e`, 글자 `#cdd6f4` → `#d1d6f1`. 순백·순흑은 그대로다(`#ffffff`, `#000000`). 앱 밖에서 같은 CSS로 칠한 견본도 똑같이 바뀐다(`r4-swatch-cdp.png`). 화면 색 변환(디스플레이 프로파일) 때문으로 보이고, CDP 페이지 스크린샷·`PrintWindow`·모니터 캡처가 모두 같은 값을 낸다.

그래서 색은 두 가지로 판정했다.
1. 토큰 값 직접 대비: 앱 픽셀 vs 원본 JSON 값(알파 합성 계산). 채널당 ±1이면 통과. 단일색은 대부분 이 기준을 넘는다.
2. 기준 견본 대비: 같은 토큰 CSS를 임시 DOM 견본에 칠하고 같은 방법으로 잰 픽셀 vs 앱 픽셀. 같으면(±1) 앱 색은 토큰 그대로라고 본다.

알파 합성·글자 안티앨리어싱처럼 변환 오차가 겹쳐 1번이 ±1을 넘는 샘플(Mocha S-3·S-12·S-13, Latte S-3·S-4·S-10 비활성·S-12·S-13)은 2번이 0~1이라 **충족**으로 적었다. 1번을 그대로 적용하면 이 샘플들은 "불충족(차 2~4)"이 된다. 어느 쪽을 SPEC의 뜻(A-31.8)으로 볼지는 사람이 정할 일이다. 표에 두 값을 모두 적었다.

---

## R-3. 장식 없는 창에서 Windows 창 동작

| SPEC 항목 | 기대 | 실제 | 판정 | 증거 |
| --- | --- | --- | --- | --- |
| 최대화 버튼에 마우스를 올리면 스냅 레이아웃 팝업(L-83) | 팝업이 나온다 | 실제 SendInput hover 6초 동안 `native.hover: true`, `native.active: true`. 스냅 레이아웃 팝업이 최대화 버튼 바로 아래에 나왔다. 첫 시도는 hover 시점에 다른 입력이 포인터를 옮겨 실패했고(`hover: false`, 팝업 없음) 재시도에서 성공했다 | 충족 | `r3-snap-flyout.png`, `r3-snap-flyout-crop.png`, `r3-caption-hover.json`, `r3-hover.json` |
| 타이틀 바를 끌면 창이 이동한다. 바 전체가 이동 영역(L-81) | 끌기 거리만큼 frame 이동 | 타이틀 바 x=700에서 (+200, +100) 논리 끌기 → frame (−5,9) → (395,209): 정확히 (+400,+200) 물리. 추가로 사이드바 헤더 x=150, 타이틀 바 왼쪽 여백 x=304, 버튼 왼쪽 x=1300에서도 (+100,+50) 논리 끌기 → (+200,+100) 물리 이동. DOM에 `data-tauri-drag-region`이 `.zl-sidebar-header`(0..299), `.zl-titlebar`(300..1440), `.zl-titlebar-drag`(308..1332)에 있다(버튼 36×3개는 제외). 끌기 뒤 모두 원위치로 복귀 | 충족 | `r3-move.json`, `r3-move-before.png`, `r3-move-after.png`, `r3-move-after-screen.png`, `r3-drag-x150.json`, `r3-drag-x304.json`, `r3-drag-x1300.json`, `r3-drag-region-dom.json` |
| 창 가장자리를 끌면 크기가 바뀐다 | client 크기 변화 | 오른쪽 가장자리를 −200 논리 끌기 → client 2880 → 2480 물리(viewport 1240×852), 반대로 +200 끌어 2880 복귀. 위쪽 가장자리를 +112 논리 끌기 → 높이 1704 → 1479 물리, 반대로 끌어 복귀. 오른쪽 아래 모서리는 창 아래 끝이 작업 표시줄 밑이라 잡을 수 없어 시험하지 못했다(`win-input -Action resize`는 이동 없음) | 충족 (모서리 끌기는 시험 못 함) | `r3-resize.json`, `r3-resize-before.png`, `r3-resize-after.png`, `r3-resize-viewport.json`, `r8-latte-resize1.json`, `r8-latte-resize2.json` |
| PoC 결과표: 최대화했을 때의 여백 실측값 | 값이 적혀 있다 | 더블클릭 최대화 뒤 frame (0,0,2880×1704) = 모니터 workRect (0,0,2880×1704). client = frame, 눈에 보이는 여백 0. (`GetWindowRect`는 −13,−13,2906×1730으로 보이지 않는 프레임 13 물리 px가 더 있다.) 네이티브 최대화 버튼 클릭, 더블클릭 모두 최대화·복원이 된다 | 충족 | `r3-dbl-max.json`, `r3-maximized-capture.json`, `r3-maximized.png`, `r3-dbl-restore.json`, `r4-click-max.json`, `r4-click-restore.json` |
| PoC 결과표: 스냅 팝업에 `WM_NCHITTEST` 처리가 필요했는지와 방법(D-7) | 필요 여부와 방법이 적혀 있다 | 필요했다고 기록. 방법: `WRY_WEBVIEW` 자식 창의 최대화 버튼 칸을 `SetWindowRgn`으로 뚫고, 그 칸에서 최상위 창이 `WM_NCHITTEST`에 `HTMAXBUTTON`을 돌려주며 버튼을 GDI로 직접 그린다(`caption.rs` 헤더 주석, 264행). 실측: `regionApplied: true`, `buttonRect [2736,0,2808,64]`. 한계: 필요성은 창 구조(`Tauri Window → WRY_WEBVIEW → Chrome_WidgetWin_0/1`) 읽기에 근거하고, 처리 없이 팝업이 안 뜨는지 확인한 대조 실험은 없다(D-7의 "안 되면 더한다"가 아니라 처음부터 넣음) | 충족 (필요성은 구조 근거, 대조 실험 없음) | `r3-caption-initial.json`, `src-tauri/src/caption.rs` 1-12, 264행 |

부수 확인: Win+Left 스냅·복원은 R-5에서 했고, 시험 뒤 창은 원래 frame으로 돌아왔다.

**R-3 종합: 충족.** (모서리 끌기 미시험, `WM_NCHITTEST` 필요성의 대조 실험 없음)

---

## R-4. 타이틀 바·창 버튼 치수·모양·색

| SPEC 항목 | 기대 | 실제 | 판정 | 증거 |
| --- | --- | --- | --- | --- |
| 타이틀 바 높이 (L-21, A-32.1) | 32 논리 px | `areas.titlebar.css.h` = 32, 계산된 `height` 32px (물리 64) | 충족 | `r9-rects.json`, `r9-dom.json` |
| 창 버튼 순서·위치 (L-39, L-83) | 최소화·최대화·닫기 순서, 오른쪽 끝 | 최소화 x 1332, 최대화(네이티브) x 1368, 닫기 x 1404, 닫기 오른쪽 끝 1440 (= 창 오른쪽 끝) | 충족 | `r9-rects.json`, `r3-caption-initial.json` |
| 창 버튼 크기 (L-39, A-32.2) | 각 36×32 | 최소화 36×32, 닫기 36×32 (css rect). 최대화는 `native.buttonRect` [2736,0,2808,64] ÷ scale 2 = 36×32 | 충족 | `r9-rects.json`, `r3-caption-initial.json` |
| 글리프 크기 | 10px | 최소화·닫기 `fontSize: 10px`, 네이티브는 `GLYPH_PX = 10`(caption.rs:45) | 충족 | `r9-rects.json`, `r4-glyph-compare.json` |
| 글리프 글꼴 (L-83) | `Segoe Fluent Icons` | 최소화·닫기 `fontFamily "Segoe Fluent Icons"`, `native.glyphFont: "Segoe Fluent Icons"` | 충족 | `r9-rects.json`, `r3-caption-initial.json` |
| 코드 근거: 글꼴·코드포인트 위치 | 파일·줄을 적는다 | 최소화 U+E921: `src/shell/Shell.tsx:15`, 닫기 U+E8BB: `Shell.tsx:16`, 최대화 U+E922: `src-tauri/src/caption.rs:47`, 복원 U+E923: `caption.rs:48`. 글꼴 이름: `Shell.tsx:38`(CSS), `caption.rs:221`(`CreateFontW`). 소스의 실제 코드포인트를 스크립트로 읽어 확인했다 | 충족 | `r4-glyph-compare.json` (`codePoints`) |
| 렌더 확인: 기준 글리프와 나란히 비교 | 같은 글꼴·코드포인트로 그린 글리프와 같다 | 같은 글꼴·크기로 U+E921/E922/E923/E8BB를 임시 DOM에 그린 기준과 비교: 최소화 HTML 버튼은 72×64 물리 px 전부 픽셀 차이 0, 닫기도 0. 네이티브 GDI 최대화(U+E922)·복원(U+E923)은 글리프 영역 22×20 물리 px, 위치 (25,22)로 기준과 같다(켜진 픽셀 수 204/208, 234/245는 렌더러가 달라 안티앨리어싱 차이) | 충족 | `r4-glyph-compare.json`, `r4-glyph-reference-cdp.png`, `r4-normal.png`, `r3-maximized.png` |
| 최대화하지 않으면 □(U+E922), 최대화하면 복원(U+E923) (L-312) | 상태에 따라 바뀐다 | 최대화 안 함: `native.glyph "U+E922"`, `zoomed: false`. 최대화(더블클릭·버튼 클릭 모두): `native.glyph "U+E923"`, `zoomed: true`. 캡처에서도 □ → 복원 모양 | 충족 | `r3-caption-initial.json`, `r4-caption-maximized.json`, `r4-normal.png`, `r3-maximized.png`, `r4-maximized-by-button.png` |
| 닫기 hover 배경 `#E81120`, 글자 흰색 (L-84) | `#E81120` / `#ffffff` | 실제 hover 중 계산된 스타일: 배경 `rgb(232, 17, 32)`, 글자 `rgb(255, 255, 255)`. 모니터 캡처 픽셀 `#ca322e`는 같은 `#E81120`을 칠한 기준 견본의 `#ca322e`와 같다(앞의 "색 판정에서 먼저 알아 둘 것" 참조). 글자 가장 진한 픽셀 `#ffffff`. 한 번은 같은 시험에서 `#e81120` 그대로 잡혔다(변환 없는 캡처) | 충족 | `r4-close-hover-computed.json`, `r4-hover-close.png`, `r4-hover-close-crop.png`, `r4-swatch-cdp.png` |
| 닫기 누름 80% 불투명 (L-84) | 배경·글자 알파 0.8 | 실제 누른 채(`:active: true`) 계산된 스타일: 배경 `rgba(232, 17, 32, 0.8)`, 글자 `rgba(255, 255, 255, 0.8)`. 누른 상태의 픽셀 캡처는 얻지 못했다(누른 채 CDP·PrintWindow 캡처가 `:active` 렌더를 담지 않았다). 기준 견본 합성값 `#a42b2a` | 충족 (계산된 스타일로 판정, 픽셀 증거 없음) | `r4-press-close-computed.json`, `r4-swatch-cdp.png` |
| 최소화 hover = `ghost_element.hover` (L-84) | 토큰 `#45475a4d`를 `title_bar.background`(`#11111b`) 위에 합성 = `#21212e` | 실제 hover 중 계산된 스타일 `rgba(69, 71, 90, 0.3)`(= 토큰). 모니터 캡처 픽셀 `#21212d`(토큰 계산과 차 1, 같은 CSS 견본 `#21212d`와 차 0) | 충족 | `r4-min-hover-computed.json`, `r4-hover-min.png`, `r8-mocha-swatches-cdp.png` |
| 최소화 누름 = `ghost_element.active` (L-84) | `#585b7099` 합성 = `#3c3d4e` | 실제 누른 채 계산된 스타일 `rgba(88, 91, 112, 0.6)`(= 토큰, 0x99/255 = 0.6). 픽셀 캡처 없음 | 충족 (계산된 스타일로 판정, 픽셀 증거 없음) | `r4-press-minimize-computed.json` |
| 최대화(네이티브) hover (L-84) | `ghost_element.hover` 합성 = `#21212e` | 실제 hover 중 `native.hover: true`, `lastColors.hover "#21212e"`. PrintWindow 픽셀 `#21212e`(GDI라 변환 없음, 정확히 같다) | 충족 | `r4-hover-max-pw.json`, `r4-hover-max-pw.png`, `r3-caption-hover.json` |
| 최대화(네이티브) 누름 (L-84) | `ghost_element.active` 합성 = `#3c3d4e` | `lastColors.pressed "#3c3d4e"`로 값은 같다. 네이티브 버튼은 누른 채 놓는 곳을 정하지 못하면 최대화가 일어나 상태를 흔들 수 있어 누른 채 캡처를 하지 않았다 | 판정 불가 (값만 확인, 누른 픽셀 없음) | `r3-caption-initial.json` |
| 나머지 버튼 글자색 | `text` | `windowButtons.*.color rgb(205, 214, 244)` = Mocha `text #cdd6f4` | 충족 | `r9-rects.json` |
| 창 버튼 연결 (03-tauri 4절) | minimize·toggleMaximize·close | 최소화 버튼 클릭 → 창 최소화됨(`r4-click-min.json`: 최소화 false→true). 최대화 버튼 클릭 → 최대화, 다시 클릭 → 복원. 닫기: `win.close()`(`Shell.tsx:63`)와 capability `core:window:allow-close`로만 확인했다. 닫으면 시험 대상 앱이 끝나서 누르지 않았다 | 충족 (닫기는 코드 근거) | `r4-click-min.json`, `r4-click-max.json`, `r4-click-restore.json` |
| 최대화·비최대화 스크린샷 | 두 상태가 있다 | 비최대화 `r4-normal.png`(PrintWindow), 최대화 `r3-maximized.png`, `r4-maximized-by-button.png` | 충족 | 위 파일 |

**R-4 종합: 충족.** (판정 불가 1건: 네이티브 최대화 버튼 누름의 픽셀 확인. 닫기·최소화 누름은 계산된 스타일만, 닫기 클릭은 코드 근거만.)

---

## R-5. 창 모서리·테두리 관찰 (D-13)

관찰값만 기록한다. 모서리·테두리는 OS(DWM) 몫이라 통과/실패 기준이 없다(SPEC). 세 상태의 관찰값이 모두 있으므로 통과다.

| 상태 | 테두리 폭 | 모서리 | 관찰한 값 | 증거 |
| --- | --- | --- | --- | --- |
| 최대화하지 않은 창 | 위·오른쪽 모두 2 물리 px(= 1 논리 px). 색은 위쪽 `#3e4046`~`#404248`, 오른쪽 `#43454c`(OS가 그린 선, 앱 색이 아님) | 둥글다. 위쪽 직선이 끝나는 곳(x≈2866)에서 오른쪽 직선이 시작하는 곳(y≈21)까지 약 12 물리 px(≈6 논리 px)의 호. 눈대중이다 | frame (−5,9,2884×1708), client 오프셋 (+2,+2). 앱은 테두리·모서리를 그리지 않는다. 왼쪽 위 모서리는 화면 밖(x=−5)이라 오른쪽 위로 쟀다 | `r5-normal.png`, `r5-normal.json`, `r5-corner.mjs` |
| 한쪽 변을 스냅한 창 (Win+Left) | 4변 모두 2 물리 px, 색 `#757575`(중립 회색) | 직각(왼쪽 위 모서리 첫 픽셀부터 테두리색, 둥글림 없음) | frame (0,0,1440×1704), client (2,2) 오프셋 1436×1700. 시험 뒤 Win+Right로 원래 frame으로 복귀 | `r5-snapped.png`, `r5-snapped.json`, `r5-snapped-pw.png` |
| 최대화한 창 | 없음(0) | 직각 | frame (0,0,2880×1704), client = frame | `r5-maximized.png`, `r5-maximized.json` |

- A-30.6 Latte 기준 화면과 나란히: `r5-corner-latte-ref-vs-app.png`(왼쪽 Latte 기준, 오른쪽 우리 앱, 오른쪽 위 모서리 8배 확대). 둘 다 2 물리 px 테두리와 둥근 모서리가 있다. 03-THEME-ICONS T-08.19·T-08.20은 기준 화면에서 약 2 물리 px 테두리와 반지름 약 19 물리 px(계산)로 적었고, 우리 앱의 눈대중은 약 12 물리 px다. 반지름 값은 OS 몫이라 판정하지 않는다.
- 앱 상태(Mocha)와 기준(Latte)의 테마가 달라 모서리 안쪽 색은 다르다. 비교 대상은 테두리·모서리 모양이다.

**R-5 종합: 충족.**

---

## R-6. 브라우저 단축키가 자체 키맵 엔진에 도달 (03-tauri R-20)

| SPEC 항목 | 기대 | 실제 | 판정 | 증거 |
| --- | --- | --- | --- | --- |
| `AreBrowserAcceleratorKeysEnabled` 노출 여부와 고른 방식(D-6) | 결과표에 적혀 있다 | PROGRESS Phase 2: wry 0.57.1에는 `with_browser_accelerator_keys`가 있으나 Tauri 2.12.5는 설정·빌더로 노출하지 않음(registry 소스 검색) → `with_webview`는 목록 밖의 `webview2-com`이 필요 → D-6 ②(캡처 단계 `keydown`) 선택. 검증 앱에서 캡처 단계 처리(`src/keymap/dispatch.ts`)가 실제로 동작함을 키 로그로 확인 | 충족 (노출 여부는 기록으로 확인, 직접 재조사는 안 함) | PROGRESS.md Phase 2, `r6-keys-all.json` |
| 확실한 키: Ctrl+P, Ctrl+F, Ctrl+R, F5, F3, Alt+Left, Alt+Right, Ctrl+Plus, Ctrl+Minus | 키 로그에 `isTrusted: true`, `result: action`, `args`가 그 키, `prevented: true`. 브라우저 동작 없음 | 실제 SendInput 키 입력 9개 + 숫자패드 `Ctrl+numadd`·`Ctrl+numsub`가 모두 `isTrusted: true`, `action`, `args` = 해당 키, `prevented: true`. `ctrl-=`(Equal)·`ctrl--`(Minus)와 `ctrl-+`(NumpadAdd)·`ctrl--`(NumpadSubtract) 모두 별개로 도달 | 충족 | `r6-keys-all.json`, `r6-keys.json` |
| 시험할 키: Ctrl+W, Ctrl+Tab, F1, F6 | 모두 도달 | 4개 모두 `isTrusted: true`, `action`, `prevented: true` | 충족 | `r6-keys-all.json` |
| 브라우저 동작이 일어나지 않았다 | `pageLoads` 불변, `beforePrint` 0, `popState`·`pageHide` 0, `dprChanges` 빈 배열, `devicePixelRatio` 불변 | 시험 전 `pageLoads 1, beforePrint 0, pageHide 0, popState 0, dprChanges [], devicePixelRatio 2, visualViewportScale 1`, 시험 뒤 **같은 값**. 시험 뒤 화면에 찾기 바·인쇄 창·확대 표시가 없다 | 충족 | `r6-signals-before.json`, `r6-keys-all.json`, `r6-after-single-keys.png` |
| 브라우저 기본 우클릭 메뉴가 나오지 않는다 | 메뉴 없음 | 실제 우클릭(`mouse_event`)을 앱 창 위에 보냈다. `signals.contextMenusBlocked`가 0 → 1 → 2로 늘었고, 우클릭 뒤 모니터 캡처에 컨텍스트 메뉴가 없다 | 충족 | `r6-rightclick.png`, `r6-rightclick-crop.png` |

시험 방법 메모(중요): 첫 일괄 입력(`r6-keys-run.json`)은 도중에 다른 앱 창이 앞으로 나와 `f5` 이후 키가 로그에 없었다. 그래서 남은 11개 키는 키마다 `win-input`을 따로 불러(그때마다 창을 앞으로 가져옴) 다시 보냈고, 마지막 로그에 15개가 모두 있다. 아래 "시험 중 생긴 문제"도 참고.

**R-6 종합: 충족.**

---

## R-7. 키맵 엔진이 Zed의 충돌·해제·연속 키 규칙대로 평가

실행: `npm run test:keymap` → **17/17 통과**(`ℹ tests 17`, `ℹ pass 17`, `ℹ fail 0`). 원본 출력은 `r7-test-keymap.txt`.

| SPEC 규칙 | 테스트 이름 | 결과 | 판정 |
| --- | --- | --- | --- |
| I-702 깊은 컨텍스트가 이긴다 | `I-702: deeper matching context wins (Editor > Pane > Workspace)` | 통과 | 충족 |
| I-702 깊이가 같으면 나중 등록 | `I-702: equal depth -> the binding registered later wins` | 통과 | 충족 |
| I-702 컨텍스트 없음 = 가장 깊음 | `I-702: a binding without context counts as the deepest` | 통과 | 충족 |
| I-702 조건식이 길다고 우선하지 않음 | `I-702: a longer condition does not take priority by itself` | 통과 | 충족 |
| I-703 `null`은 낮은 우선순위 후보를 해제 | `I-703: null disables lower-priority candidates in that context` | 통과 | **불충족** (아래) |
| I-703 덧씌움의 `null`은 사용자 설정을 지우지 않음 | `I-703: the overlay's null does not remove the user's binding` | 통과 | 충족 |
| I-703 출처 등급 사용자 > 덧씌움 > 기본, 깊이·순서와 섞지 않음 | `I-703: source rank user > base > default applies to null only` | 통과 | 충족 |
| I-703 다른 컨텍스트의 `null` | `I-703: null in one context leaves other contexts alone` | 통과 | **불충족** (아래) |
| I-001 `Ctrl+K V`는 따로 누른 연속 키 | `I-001: 'ctrl-k v' is Ctrl+K then V pressed separately`, `I-001: a non-continuing key ends the chord and is handled alone` | 통과 2건 | 충족 |
| I-704 액션 인수까지 같은 바인딩 | `I-704: displayed key requires the same action and the same arguments`, `I-704: argument objects compare structurally (key order ignored)` | 통과 2건 | 충족 |
| I-704 다른 액션에 가려진 키는 뺀다 | `I-704: keys shadowed by another action in this context are dropped`, `I-704: a chord whose prefix runs another action here is not shown` | 통과 2건 | 충족 |
| I-704 남은 후보 중 마지막 | `I-704: among the remaining candidates the last binding is shown` | 통과 | 충족 |
| (보조) null로 푼 연속 키·키 입력 정규화 | `I-703 + I-001: ...`, `keystrokes normalize modifiers and read DOM events by code` | 통과 2건 | 충족 |

**불충족 — I-703 "깊은 컨텍스트의 `null`이 얕은 컨텍스트의 바인딩을 해제하는가":**
- 01-zed I-703 원문: "`null`은 그 컨텍스트에서 낮은 우선순위 후보를 해제한다." 구현(`src/keymap/engine.ts` 118~130행)은 `null`과 **같은 깊이**의 후보만 해제한다.
- 재현(`r7-i703-probe.mts`, 출력 `r7-i703-probe.out.txt`): 포커스 경로 Workspace > Pane > Editor에서 `ctrl-j` → Workspace 바인딩(기본)과 Editor `null`(덧씌움)이 있을 때 엔진은 `workspace::Act`를 실행한다. 반대 경우(Workspace `null` + Editor 바인딩)는 `editor::Act`로 올바르다.
- 원문이 가리키는 Zed 소스(`crates/gpui/src/keymap.rs`, 고정 커밋 `14b7b0e`)를 읽어 동작만 확인했다(코드는 복사하지 않음): 깊이·등록 순서로 정렬한 뒤, 가장 앞선 `NoAction`을 만나면 **그보다 낮은 우선순위의 같은 키 후보를 모두**(깊이가 얕아도) 건너뛴다(출처 등급은 같거나 약한 것만). Zed 단위 테스트 `test_disable_deeper`가 "깊은 Editor `null`이 얕은 Workspace 바인딩을 끈다"를 확인하고, `test_fail_to_disable`이 반대(얕은 `null`은 깊은 바인딩을 못 끈다)를 확인한다. Zed 키 바인딩 문서도 "`null`은 같은 우선순위 규칙을 따르므로 트리 위쪽에서 맞는 바인딩도 모두 끈다"고 적는다.
- 엔진의 테스트 `I-703: null in one context leaves other contexts alone`는 이 동작을 "다른 컨텍스트는 건드리지 않는다"는 뜻으로 읽어 반대 결과(`workspace::Act`)를 기대값으로 고정했다. 즉 테스트는 통과하지만 규칙 해석이 Zed와 다르다. SPEC의 "그 컨텍스트에서"가 "`null`의 컨텍스트에서 포커스된 상태"인지 "같은 깊이만"인지는 문장만으로는 정해지지 않아, 해석은 사람이 정해야 한다. 판정은 Zed 소스·문서와 맞는 쪽(위 해석)을 따랐다.

**R-7 종합: 불충족** (17/17 통과이지만 I-703의 깊이를 가로지르는 `null` 해제가 Zed 원본과 다르다. 해석이 SPEC 문장에서 갈릴 수 있어 사람의 확인이 필요하다.)

---

## R-8. 테마 JSON → 누락 토큰 대체(T-26) → CSS 변수

### 파서·구조·대체 규칙

| SPEC 항목 | 기대 | 실제 | 판정 | 증거 |
| --- | --- | --- | --- | --- |
| 파서가 `#RRGGBB`·`#RRGGBBAA`를 받고 6자리는 알파 1 (T-01.7) | 6·8자리 모두 받고 6자리 알파 1 | 앱의 `parseColor`로 직접 확인: `#9399b240` → (147,153,178, 0.251), `#cdd6f412` → (205,214,244, 0.0706), `#27273b` → 알파 1, `#FFFFFF`·`#ffffffff` → 알파 1, 5자리·7자리·`zzz`는 `null` | 충족 | `r8-parser-probe.out.txt` |
| 테마 파일 구조 (T-01.1~T-01.6) | `themes[].name/appearance/style` | 세 테마가 `themes[]`에서 이름으로 읽히고 `appearance`가 `dark`(Mocha)·`light`(Latte, One Light), 값은 `style`의 점으로 이은 키·`players[0]`에서 읽힌다 | 충족 | `r8-mocha.json`, `r8-latte.json`, `r8-one-light.json` |
| 누락·`null` 토큰 대체 (T-26.1~T-26.17) | 대상 토큰에 걸리는 규칙만(T-26.3, T-26.8) | `scrollbar.thumb.active_background`: 세 테마 모두 원본에 없거나 `null` → `scrollbar.thumb.background` 값(T-26.3), `source: fallback:T-26.3`. `scrollbar.thumb.border`: Catppuccin 두 테마 `null` → `#3b3d45`(T-26.8), `source: fallback:T-26.8`. One Light는 원본에 값이 있어 `json`. 그 밖의 대상 토큰에 `missing`은 없다 | 충족 | `r8-token-compare.json` |
| 원본 JSON 파일이 원문과 같다 | 설치된 확장 파일·문서 표와 같다 | `catppuccin-mauve.json`·`one.json`의 값을 03-THEME-ICONS 값 표(T-02~T-05)와 직접 대조: 대상 27개 중 25개가 표의 JSON 값과 같고 2개(`scrollbar.thumb.active_background`, `scrollbar.thumb.border`)는 표에서 `null`/`—` → T-26 규칙. `one.json` sha256 `ed6cf880…7695` = PROGRESS 기록과 같다 | 충족 | `r8-token-compare.json`, `r8-compare.mjs` |

### 대상 토큰 27개 × 세 테마 (원본 JSON/T-26 값 → 적용된 CSS 변수)

덤프의 `value`와 `:root` CSS 변수 `applied`를 모두 원본 값과 대조했다(알파 포함, `applied`는 `rgba()` 표기를 0~255로 환산해 ±1). 세 테마 모두 **27/27 일치, 빠진 토큰 0**. One Light 원본 값은 8자리(`ff`)이고 덤프는 6자리로 줄여 적었다(알파 1 같음).

| 토큰 | Mocha 기대(원본 JSON/T-26) → 덤프 applied | Latte 기대 → 덤프 applied | One Light 기대 → 덤프 applied | 판정 |
| --- | --- | --- | --- | --- |
| `background` | `#27273b` → `#27273b` | `#d7dce5` → `#d7dce5` | `#dcdcddff` → `#dcdcdd` | 충족 |
| `border` | `#313244` → `#313244` | `#ccd0da` → `#ccd0da` | `#c9c9caff` → `#c9c9ca` | 충족 |
| `border.variant` | `#2c293d` → `#2c293d` | `#e7e2f5` → `#e7e2f5` | `#dfdfe0ff` → `#dfdfe0` | 충족 |
| `ghost_element.hover` | `#45475a4d` → `rgba(69, 71, 90, 0.302)` | `#bcc0cc4d` → `rgba(188, 192, 204, 0.302)` | `#dfdfe0ff` → `#dfdfe0` | 충족 |
| `ghost_element.active` | `#585b7099` → `rgba(88, 91, 112, 0.6)` | `#acb0be99` → `rgba(172, 176, 190, 0.6)` | `#cacacaff` → `#cacaca` | 충족 |
| `text` | `#cdd6f4` → `#cdd6f4` | `#4c4f69` → `#4c4f69` | `#242529ff` → `#242529` | 충족 |
| `title_bar.background` | `#11111b` → `#11111b` | `#dce0e8` → `#dce0e8` | `#dcdcddff` → `#dcdcdd` | 충족 |
| `title_bar.inactive_background` | `#171725` → `#171725` | `#e6e9ee` → `#e6e9ee` | `#ebebecff` → `#ebebec` | 충족 |
| `status_bar.background` | `#11111b` → `#11111b` | `#dce0e8` → `#dce0e8` | `#dcdcddff` → `#dcdcdd` | 충족 |
| `tab_bar.background` | `#11111b` → `#11111b` | `#dce0e8` → `#dce0e8` | `#ebebecff` → `#ebebec` | 충족 |
| `tab.active_background` | `#1e1e2e` → `#1e1e2e` | `#eff1f5` → `#eff1f5` | `#fafafaff` → `#fafafa` | 충족 |
| `tab.inactive_background` | `#0b0b11` → `#0b0b11` | `#d2d7e2` → `#d2d7e2` | `#ebebecff` → `#ebebec` | 충족 |
| `panel.background` | `#181825` → `#181825` | `#e6e9ef` → `#e6e9ef` | `#ebebecff` → `#ebebec` | 충족 |
| `scrollbar.thumb.background` | `#585b7080` → `rgba(88, 91, 112, 0.502)` | `#acb0be80` → `rgba(172, 176, 190, 0.502)` | `#383a414c` → `rgba(56, 58, 65, 0.298)` | 충족 |
| `scrollbar.thumb.hover_background` | `#6c7086` → `#6c7086` | `#9ca0b0` → `#9ca0b0` | `#dfdfe0ff` → `#dfdfe0` | 충족 |
| `scrollbar.thumb.active_background` | `#585b7080` (T-26.3) → `rgba(88, 91, 112, 0.502)` | `#acb0be80` (T-26.3) → `rgba(172, 176, 190, 0.502)` | `#383a414c` (T-26.3) → `rgba(56, 58, 65, 0.298)` | 충족 |
| `scrollbar.thumb.border` | `#3b3d45` (T-26.8) → `#3b3d45` | `#3b3d45` (T-26.8) → `#3b3d45` | `#dfdfe0ff` → `#dfdfe0` | 충족 |
| `scrollbar.track.background` | `#11111b` → `#11111b` | `#dce0e8` → `#dce0e8` | `#00000000` → `rgba(0, 0, 0, 0)` | 충족 |
| `scrollbar.track.border` | `#cdd6f412` → `rgba(205, 214, 244, 0.071)` | `#4c4f6912` → `rgba(76, 79, 105, 0.071)` | `#eeeeeeff` → `#eeeeee` | 충족 |
| `editor.background` | `#1e1e2e` → `#1e1e2e` | `#eff1f5` → `#eff1f5` | `#fafafaff` → `#fafafa` | 충족 |
| `editor.foreground` | `#cdd6f4` → `#cdd6f4` | `#4c4f69` → `#4c4f69` | `#242529ff` → `#242529` | 충족 |
| `editor.gutter.background` | `#1e1e2e` → `#1e1e2e` | `#eff1f5` → `#eff1f5` | `#fafafaff` → `#fafafa` | 충족 |
| `editor.line_number` | `#7f849c` → `#7f849c` | `#8c8fa1` → `#8c8fa1` | `#b4b4bb` → `#b4b4bb` | 충족 |
| `editor.active_line_number` | `#cba6f7` → `#cba6f7` | `#8839ef` → `#8839ef` | `#44454b` → `#44454b` | 충족 |
| `editor.active_line.background` | `#cdd6f412` → `rgba(205, 214, 244, 0.071)` | `#4c4f6912` → `rgba(76, 79, 105, 0.071)` | `#ebebecbf` → `rgba(235, 235, 236, 0.749)` | 충족 |
| `players[0].cursor` | `#f5e0dc` → `#f5e0dc` | `#dc8a78` → `#dc8a78` | `#5c78e2ff` → `#5c78e2` | 충족 |
| `players[0].selection` | `#9399b240` → `rgba(147, 153, 178, 0.251)` | `#7c7f934d` → `rgba(124, 127, 147, 0.302)` | `#5c78e23d` → `rgba(92, 120, 226, 0.239)` | 충족 |

### 화면 색 (S-1 ~ S-13) — Catppuccin Mocha (창 1440×852, Mocha 기준 화면과 같은 크기·배율)

기준 화면 `zed-reference.png`의 픽셀도 직접 읽어 토큰 값과 같음을 확인했다: (1200,10) 타이틀 바 `#11111b`, (200,1300) 사이드바 `#181825`, (1700,110) 활성 탭·편집기 `#1e1e2e`, (1100,110) 비활성 탭 `#0b0b11`, (1500,1000) 영역 선 `#313244`.

| 샘플 | 기대(토큰 계산) | 앱 픽셀(CDP 스크린샷) | 토큰 대비 최대 채널 차 | 기준 견본 픽셀(같은 토큰 CSS) | 견본 대비 차 | 판정 | 증거 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S-1 타이틀 바(활성) | `#11111b` | `#11111a` | 1 | `#11111a` | 0 | 충족 | r8-mocha-screen.json |
| S-2 타이틀 바(비활성) | `#171725` | `#181724` | 1 | `#181724` | 0 | 충족 | r8-mocha-screen.json |
| S-3 창 버튼 글리프(최소화 글리프 가장 진한 픽셀) | `#cdd6f4` | `#d1d6f1` | 4 | `#d1d6f1` | 0 | 충족 | r8-mocha-screen.json |
| S-4 최소화 hover | `#21212e` | `#21212d` (모니터 캡처, 실제 hover) | 1 | `#21212d` | 0 | 충족 | r4-hover-min.png |
| S-5 사이드바 | `#181825` | `#191824` | 1 | `#191824` | 0 | 충족 | r8-mocha-screen.json |
| S-6 왼쪽 Dock | `#181825` | `#191824` | 1 | `#191824` | 0 | 충족 | r8-mocha-screen.json |
| S-7 상태 표시줄 | `#11111b` | `#11111a` | 1 | `#11111a` | 0 | 충족 | r8-mocha-screen.json |
| S-8 영역 사이 선 (타이틀 바 아래·상태 표시줄 위·사이드바 오른쪽·왼쪽 Dock 오른쪽, 4곳) | `#313244` | `#323243`, `#323243`, `#323243`, `#323243` | 1 | (견본 비교 없음 — 토큰 대비 ±1 안) | - | 충족 | r8-mocha-screen.json (borderScan) |
| S-9 Pane 탭 바 | `#11111b` | `#11111a` | 1 | `#11111a` | 0 | 충족 | r8-mocha-screen.json |
| S-10 활성 탭 | `#1e1e2e` | `#1f1e2d` | 1 | `#1f1e2d` | 0 | 충족 | r8-mocha-screen.json |
| S-10 비활성 탭 | `#0b0b11` | `#0b0b10` | 1 | `#0b0b10` | 0 | 충족 | r8-mocha-screen.json |
| S-11 편집기 바탕 | `#1e1e2e` | `#1f1e2d` | 1 | `#1f1e2d` | 0 | 충족 | r8-mocha-screen.json |
| S-12 현재 줄 | `#2a2b3c` | `#2c2b3b` | 2 | `#2c2b3b` | 0 | 충족 | r8-mocha-screen.json |
| S-13 선택 영역 | `#3b3d4f` | `#3d3c4e` | 2 | `#3d3c4e` | 0 | 충족 | r8-mocha-screen.json |

### 화면 색 — Catppuccin Latte (창 1224×740 논리, Latte 기준 화면 2448×1480 물리와 ±1 물리 px)

기준 화면 `zed-reference-latte.png`의 픽셀도 직접 읽어 토큰 값과 같음을 확인했다: T-08.7 (1200,10) `#dce0e8`, T-08.8 (200,1300) `#e6e9ef`, T-08.9 (1200,1450) `#dce0e8`, T-08.10 (1100,110) `#d2d7e2`, T-08.11 (1700,110)·(1500,1000) `#eff1f5`, T-08.13 영역 선 (400,1000)·(1200,64)·(1200,128)·(1200,1416) `#ccd0da`.

| 샘플 | 기대(토큰 계산) | 앱 픽셀(CDP 스크린샷) | 토큰 대비 최대 채널 차 | 기준 견본 픽셀(같은 토큰 CSS) | 견본 대비 차 | 판정 | 증거 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S-1 타이틀 바(활성) | `#dce0e8` | `#dde0e7` | 1 | `#dde0e7` | 0 | 충족 | r8-latte-screen.json |
| S-2 타이틀 바(비활성) | `#e6e9ee` | `#e7e9ed` | 1 | `#e7e9ed` | 0 | 충족 | r8-latte-screen.json |
| S-3 창 버튼 글리프(최소화 글리프 가장 진한 픽셀) | `#4c4f69` | `#4e4f67` | 2 | `#4e4f67` | 0 | 충족 | r8-latte-screen.json |
| S-4 최소화 hover | `#d2d6e0` | `#d3d6de` (모니터 캡처, 실제 hover) | 2 | `#d4d6df` | 1 | 충족 | r8-latte-s4-hover.png, r8-latte-s4-swatch-cdp.png |
| S-5 사이드바 | `#e6e9ef` | `#e7e9ee` | 1 | `#e7e9ee` | 0 | 충족 | r8-latte-screen.json |
| S-6 왼쪽 Dock | `#e6e9ef` | `#e7e9ee` | 1 | `#e7e9ee` | 0 | 충족 | r8-latte-screen.json |
| S-7 상태 표시줄 | `#dce0e8` | `#dde0e7` | 1 | `#dde0e7` | 0 | 충족 | r8-latte-screen.json |
| S-8 영역 사이 선 (타이틀 바 아래·상태 표시줄 위·사이드바 오른쪽·왼쪽 Dock 오른쪽, 4곳) | `#ccd0da` | `#cdd0d9`, `#cdd0d9`, `#cdd0d9`, `#cdd0d9` | 1 | (견본 비교 없음 — 토큰 대비 ±1 안) | - | 충족 | r8-latte-screen.json (borderScan) |
| S-9 Pane 탭 바 | `#dce0e8` | `#dde0e7` | 1 | `#dde0e7` | 0 | 충족 | r8-latte-screen.json |
| S-10 활성 탭 | `#eff1f5` | `#f0f1f5` | 1 | `#f0f1f5` | 0 | 충족 | r8-latte-screen.json |
| S-10 비활성 탭 | `#d2d7e2` | `#d4d7e1` | 2 | `#d4d7e1` | 0 | 충족 | r8-latte-screen.json |
| S-11 편집기 바탕 | `#eff1f5` | `#f0f1f5` | 1 | `#f0f1f5` | 0 | 충족 | r8-latte-screen.json |
| S-12 현재 줄 | `#e3e6eb` | `#e5e6eb` | 2 | `#e5e6eb` | 0 | 충족 | r8-latte-screen.json |
| S-13 선택 영역 | `#cccfd7` | `#ceced7` | 2 | `#ceced7` | 0 | 충족 | r8-latte-screen.json |

화면 샘플 S-1~S-13이 두 테마 모두 빠짐 없이 측정되었다. 앱 픽셀은 CDP 페이지 스크린샷을 1차 증거로, `PrintWindow` 캡처를 보조로 두었다(같은 값). S-8의 선은 물리 2 px(= 1 논리 px)이다. 단, 가운데 Pane 쪽 두 선(타이틀 바 아래, 상태 표시줄 위)과 왼쪽 Dock 오른쪽은 Phase 1 PoC Pane의 1px 테두리(`#313244` 고정)와 겹쳐 물리 4 px로 보인다(R-9 참조).

### 전환 시간 (기록용, 통과 기준 없음 — 사용자 결정 Q4 A)

Mocha ↔ One Light를 코드로 6번씩(12회) 교대로 바꿔 쟀다(`r8-switch-timing.json`). 12회 모두 `ok`, `captionOk: true`. 단계가 하나도 빠지지 않았다.

| 단계 | 최소 ms | 중앙값 ms | 최대 ms |
| --- | --- | --- | --- |
| `readJson` (JSON은 번들되어 이미 메모리에 있음) | 0.0 | 0.0 | 0.1 |
| `merge` | 0.0 | 0.0 | 0.2 |
| `cssVariables` | 0.0 | 0.1 | 0.2 |
| `cm6AndCaptionRequest` | 0.7 | 0.8 | 1.2 |
| `captionApplied` (`caption_set_colors` IPC 완료) | 2.3 | 2.8 | 4.6 |
| `untilPainted` (이후 rAF 두 번) | 12.9 | 29.5 | 30.1 |
| `total` | 18.8 | 33.3 | 33.5 |

- One Light는 토큰 덤프만 판정한다(D-11). 화면 샘플은 없다.

### 종합

| SPEC 항목 | 판정 |
| --- | --- |
| 토큰 값: 대상 27개 × 세 테마 | 충족 |
| 화면 색: Mocha 샘플 S-1~S-13 (기준 견본 대비) | 충족 (토큰 직접 대비는 S-3·S-12·S-13이 차 2~4로 ±1 초과 — "색 판정에서 먼저 알아 둘 것") |
| 화면 색: Latte 샘플 S-1~S-13 (기준 견본 대비) | 충족 (토큰 직접 대비는 S-3·S-4·S-10 비활성·S-12·S-13이 차 2로 ±1 초과) |
| 전환 시간 측정값(단계별·전체) | 충족 |

**R-8 종합: 충족.**

---

## R-9. 영역 뼈대

| SPEC 항목 | 기대 | 실제 | 판정 | 증거 |
| --- | --- | --- | --- | --- |
| 루트 글자 크기, px → rem = px ÷ 16 (L-01, L-02) | 루트 16px, 변환 함수 정의 위치 | `rootFontSize "16px"`. 변환: `src/shell/styles.ts:20` `rem(px) = px/16 + "rem"`. 적용된 CSS 규칙에 실제로 rem이 쓰였다: `.zl-sidebar width: 18.75rem`(300 ÷ 16), `.zl-titlebar height: 2rem`, `.zl-winbtn width: 2.25rem`, `.zl-dock width: 15rem`, `.zl-statusbar height: 1.875rem` | 충족 | `r9-rects.json`, `r9-dom.json` |
| L-11 창 최상위: [왼쪽 사이드바] → [Workspace], 오른쪽 사이드바 없음 | 가로로 사이드바 → Workspace | `.zl-root`의 자식 순서 `zl-sidebar`, `zl-workspace`. 사이드바 x 0~300, Workspace x 300~1440. 오른쪽 사이드바 요소 0개 | 충족 | `r9-dom.json`, `r9-rects.json` |
| L-12 사이드바는 창 전체 높이, 헤더 높이 = 타이틀 바 높이, 타이틀 바는 사이드바 오른쪽에서 시작 | 사이드바 h 852, 헤더 h = 타이틀 바 h | 사이드바 y 0 h 852, `sidebar-header` h 32 = `titlebar` h 32, 타이틀 바 x 300 (사이드바 오른쪽 끝) | 충족 | `r9-rects.json` |
| L-13 Workspace: 타이틀 바 → 본문 → 상태 표시줄 | 세로 순서 | `.zl-workspace`의 자식 `zl-titlebar`(y 0, h 32), `zl-body`(y 32, h 790), `zl-statusbar`(y 822, h 30) | 충족 | `r9-dom.json`, `r9-rects.json` |
| L-14 본문: 왼쪽 Dock → 가운데, 아래·오른쪽 Dock 없음 | 가로 순서 | `.zl-body`의 자식 `zl-dock`(x 300, w 240), `zl-center`(x 540~1440). 오른쪽·아래 Dock 요소 0개 | 충족 | `r9-dom.json`, `r9-rects.json` |
| L-15 가운데의 각 Pane = 탭 바 + 활성 아이템 | Pane 2개 각각 탭 바 + 편집기 | `[data-poc-pane]` 2개, 각각 탭 바(첫 자식)와 `.cm-editor` 슬롯 | 충족 | `r8-mocha-active.png`, `r9-layout-vs-zed-reference-mocha.png` |
| L-16 왼쪽 Dock 오른쪽 테두리 `border_r_1` | 오른쪽 1px 테두리, 다른 변 없음 | `.zl-dock` 계산된 `borderRightWidth 1px solid rgb(49, 50, 68)`(= `border` 토큰), 왼쪽·위·아래 0px | 충족 | `r9-dom.json` |
| 기준 화면과 같은 창 크기·배율의 스크린샷 | 1440×852 논리, 배율 200% | 창 client 2880×1704 물리, devicePixelRatio 2. 같은 크기로 기준 화면(왼쪽)과 우리 화면(오른쪽)을 나란히 놓았다 | 충족 | `r9-layout-vs-zed-reference-mocha.png`, `r8-mocha-active.png` |
| 뼈대 치수(A-32.3 이후, L-22~L-35)는 판정하지 않는다(Q3 A) | 판정 대상 아님 | 판정하지 않았다. 관찰만: 사이드바 폭이 기준 화면(Latte 200)과 다르게 300, 탭 바 높이 약 33.5 | 해당 없음 | `r9-rects.json` |

관찰(판정 밖): 왼쪽 Dock 오른쪽의 선이 물리 4 px(= 2 논리 px)로 보인다. Dock의 1px 테두리 옆에 Phase 1 PoC Pane의 `border: 1px solid #313244`(고정 색, `src/poc/PocApp.tsx`)가 겹치기 때문이다. 타이틀 바 아래·상태 표시줄 위도 같은 이유로 가운데 구간에서 2 논리 px다. 사이드바 오른쪽은 1px(물리 2 px)로 정상이다. PoC Pane은 Phase 1 산출물이라 R-9 판정에는 넣지 않았다.

**R-9 종합: 충족.**

---

## 요청받은 개별 판정

### E-032 스크롤바 손잡이 테두리 두께 — 원문 값 없음(구현 판단 1px)

01-LAYOUT E-032는 테두리 색(`scrollbar_thumb_border`)만 적고 두께를 적지 않았다. 구현자가 1px로 정했다(PROGRESS Phase 2 리뷰 1회차 10번, "판단, 사람 확인 필요"). 이 값은 **원문에 없으므로 판정 불가가 아니라 "원문 값 없음(구현 판단 1px)"으로 적는다.** 관찰: 손잡이 계산된 스타일 `border 1px solid rgb(59, 61, 69)`(= `#3b3d45`, T-26.8), 픽셀로는 위·아래 각 2 물리 px(1 논리 px) `#3c3d44`, 안쪽 `#353644`. 모두 같은 CSS를 칠한 기준 견본(`#3c3d44`, `#353644`)과 일치.

| SPEC 항목 | 기대 | 실제 | 판정 | 증거 |
| --- | --- | --- | --- | --- |
| E-031 세로 트랙만 왼쪽 1px `scrollbar.track.border`, 트랙 배경 `scrollbar_track_background` | 세로 트랙 왼쪽 1px, 색 = `track.border`(`#cdd6f412`)를 `track.background`(`#11111b`) 위에 합성 = `#1f1f2a` | 세로 스크롤바 왼쪽 2 물리 px(= 1 논리 px) `#1f1f29`(기준 견본 `#1f1f29`와 같음), 그 안쪽은 트랙 `#11111a`(견본 `#11111a`). 두께 15 논리 px | 충족 | `r2-scrollbar-css.json`, `e031-scrollbar-cdp.png`, `e031-swatches-cdp.png` |
| E-032 손잡이 색: 기본·hover·active, 테두리, 각진 모서리 | `scrollbar.thumb.background` 등, 모서리 0 | 기본 `rgba(88, 91, 112, 0.5)`, `borderRadius 0px`. hover(`#6c7086`)·active(= background, T-26.3)는 CSS 변수와 `:hover`·`:active` 규칙(`src/poc/zedEditor.ts` 182·185행)으로만 확인(포인터를 의사 요소에 올려 계산된 스타일을 읽을 수 없다) | 충족 (기본 상태 픽셀 확인, hover·active는 규칙·변수 확인) | `r2-scrollbar-css.json` |
| E-032 테두리 두께 | 원문 값 없음 | 구현 판단 1px | 원문 값 없음(구현 판단 1px) | 위 설명 |

### R-2 E-011 오른쪽 끝 기준 변경(같다 → 보이는 오른쪽 끝에 닿는다 ≥)이 원문 E-011과 맞는가

- 원문 E-011: "`current_line_highlight` 기본 `"all"`: 편집기 왼쪽 끝(거터 포함)부터 **오른쪽 끝까지**, 높이 1줄, 색 `editor_active_line_background`."
- 변경: 이전 기준은 "강조 오른쪽 끝 = 편집기 오른쪽 끝"이었다. Phase 2 셸에서 Pane이 좁아져 줄이 편집기보다 길어지면 강조가 내용 끝까지 이어져 "같다"가 깨졌다(PROGRESS: 1114 > 974).
- 확인(`r2-e011-phase2.json`, `r2-e011-overflow.json`):
  - 줄이 넘치지 않을 때: 강조 오른쪽 끝 1424 = 보이는 오른쪽 끝(스크롤바 안쪽) 1424, 강조 왼쪽 끝 541 = 편집기 왼쪽 끝(거터 칸).
  - 줄 하나를 480자 길게 늘린 뒤(임시, 시험 뒤 `setLines(300)`로 되돌림) 가로 스크롤 `scrollLeft` 0·300·최대에서 강조 오른쪽 끝이 5064 / 4764 / 1424(최대에서 정확히 보이는 오른쪽 끝)로, 모두 보이는 오른쪽 끝 1424 **이상**이다. 거터 칸 왼쪽은 항상 541이다.
  - `__poc.r2.measure()`는 `pass: true`, `failed: []`(E-011 9행 모두 통과).
- 판정: 내용이 보이는 폭보다 길 때 "오른쪽 끝까지"는 "보이는 오른쪽 끝에 닿는다"와 같은 뜻이므로 `≥` 기준은 원문 E-011과 맞는다. 모든 스크롤 위치에서 보이는 오른쪽 끝에 닿는다. 한 가지 남는 해석은 Phase 1 보고서와 같다: 오른쪽 끝을 스크롤바 안쪽 끝(여기서는 1424)으로 보는 것은 원문이 확정하지 않는다(편집기 박스 오른쪽 끝은 1439). **충족.**

---

## 시험 중 생긴 문제 (사람에게 알릴 것)

1. **다른 프로젝트의 터미널에 우클릭이 들어갔을 수 있다.** R-6 우클릭 시험 중 두 번째 `mouse_event` 우클릭을, 우리 창이 앞에 있다는 확인 없이 보냈다. 그 순간 화면에는 workbench-gpui 쪽 Windows Terminal이 앞에 있었고(`r6-rightclick.png` 첫 판), 우클릭이 그 터미널에 들어갔을 수 있다(Windows Terminal에서 우클릭은 붙여넣기). 내용은 확인하지 못했다. 이후 우클릭은 포어그라운드·포인터 아래 창이 우리 창일 때만 보내도록 스크립트를 고쳐 다시 했다.
2. **첫 일괄 키 입력 중 다른 앱 창이 앞으로 나왔다.** `f5` 이후의 키(`f3`, `alt+left`, `alt+right`, `ctrl+=`, `ctrl+-`, `ctrl+numadd`, `ctrl+numsub`, `ctrl+w`, `ctrl+tab`, `f1`, `f6`)가 어느 창에 갔는지 알 수 없다. 그 시점 화면(`r6-after-keys.png`)에는 workbench-gpui 앱(별도 프로세스 12212)이 앞에 있었다. 그 앱에 키가 들어갔을 수 있다(`ctrl+w`, `alt+left` 등).
3. **창 이동이 한 번 의도와 다르게 남았다.** 사이드바 헤더·왼쪽 여백·버튼 왼쪽 끌기 시험 뒤 복귀 끌기가 한 번 실패해 창이 (195,109)에 남았다가, 다시 끌어 원래 frame (−5,9,2884×1708)으로 되돌렸다(마지막 확인: `r3-final-state-restored.json` — frame −5,9,2884×1708, client 2880×1704, 최대화 아님. `r3-final-state.json`은 복귀 전 중간 상태).
4. 작업 중 다른 입력(포인터 이동·창 전면 변경)이 여러 번 끼어들었다. 입력이 필요한 시험은 앞에서 말한 확인을 넣어 다시 했다. 그래도 R-4의 누름·hover 픽셀 캡처는 여러 번 재시도했다.

---

## 종합

| 요구 | 판정 | 불충족·판정 불가 |
| --- | --- | --- |
| R-3 장식 없는 창의 창 동작 | 충족 | 모서리 끌기 미시험, `WM_NCHITTEST` 필요성의 대조 실험 없음(판정에는 영향 없음) |
| R-4 타이틀 바·창 버튼 | 충족 | 판정 불가: 네이티브 최대화 버튼 누름의 픽셀 확인 |
| R-5 창 모서리·테두리 관찰 | 충족 | 없음 |
| R-6 브라우저 단축키 | 충족 | 없음 |
| R-7 키맵 규칙 엔진 | **불충족** | I-703: 깊은 컨텍스트의 `null`이 얕은 컨텍스트의 바인딩을 해제하지 않음(Zed 원본과 다름) |
| R-8 테마 | 충족 | 없음 (색 판정 해석은 사람 확인 필요) |
| R-9 영역 뼈대 | 충족 | 없음 |
| E-032 손잡이 테두리 두께 | 원문 값 없음(구현 판단 1px) | — |
| R-2 E-011 기준 변경 | 충족(원문과 맞음) | — |
