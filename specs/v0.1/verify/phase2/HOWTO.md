# Phase 2 검증 방법 (wt-coder, 2026-11-01)

SPEC R-3~R-9를 판정하기 위한 도구와 사용법이다. 명령은 모두 레포 루트에서 실행한다.

## 0. 도구

| 도구 | 하는 일 |
| --- | --- |
| `tools/cdp-eval.mjs` | 앱 WebView 안에서 JS를 평가한다(CDP 9222, Phase 1 HOWTO 4절). `window.__poc.*` 덤프를 얻는다 |
| `tools/win-input.ps1` | SendInput으로 실제 마우스·키 입력을 보내고 창 상태를 JSON으로 낸다. `-Out`을 주면 모니터 전체를 캡처한다(스냅 플라이아웃은 별도 창이라 화면 복사로 찍는다) |
| `tools/capture.ps1` | 창 사각형·DPI·최대화 여부 JSON과 창 PNG(PrintWindow)를 낸다. gpui 프로젝트의 같은 도구를 옮겼고 기본값만 ZedLike로 바꿨다 |
| `npm run test:keymap` | 키맵 규칙 엔진 자동 테스트(Node 24 `node --test`, 패키지 추가 없음) |

- CDP 합성 입력은 WebView2의 가속키 처리와 OS 비클라이언트 처리를 거치지 않을 수 있다. 그래서 R-3·R-4 hover·R-6은 `win-input.ps1`을 쓴다.
- `win-input.ps1` 좌표(`-X`, `-Y`, `-DX`, `-DY`)는 창 클라이언트 기준 논리 px(= CSS px)다. `__poc.shell.rects()`의 `css` 값과 같은 단위다.
- `win-input.ps1`은 입력 전에 창을 전면으로 가져온다. 창이 최소화되어 있으면 먼저 복원한다.
- `win-input.ps1`은 실제 마우스·키보드를 움직이므로 실행하는 동안 다른 입력을 하지 않는다. 시간 제한을 걸어 실행한다(예: `timeout 60 pwsh …`).
- 키 이름 목록은 `,`로 구분한 한 문자열로 준다(예: `-Keys "f5,ctrl+r"`). 숫자패드 +/−는 `numadd`/`numsub`다(예: `ctrl+numadd`).
- **대상 창 고정**: `win-input.ps1`은 `-ProcessId` 또는 `-TargetHwnd`로 대상을 고정한다. 주지 않으면 보이는 ZedLike 창이 정확히 하나일 때만 진행하고, 여럿이면 목록과 함께 오류로 끝낸다.
  - 결과 JSON의 `pid`·`hwnd`를 `capture.ps1 -Hwnd`에 그대로 넘긴다.
  - **CDP도 같은 앱에 고정한다**: `cdp-eval.mjs --pid <zedlike PID>`를 쓴다.
    - `--port`에서 리스닝하는 프로세스(`Get-NetTCPConnection`의 OwningProcess, `msedgewebview2.exe`)가 그 PID의 자손인지 확인하고, 아니면 프로세스 체인을 보여 주며 종료 코드 1로 끝난다.
    - 결과의 `target`에 `pid`, `port`, `listener`, `chain`이 남는다.
  - 한 번의 검증에서는 다음 순서로 같은 PID·HWND를 쓴다.
    1. `win-input.ps1 -Action state`로 `pid`·`hwnd`를 얻는다.
    2. 그 뒤로 모든 호출에 같은 값을 쓴다: `win-input.ps1 -ProcessId <pid>`(또는 `-TargetHwnd <hwnd>`), `cdp-eval.mjs --pid <pid> --port <port>`, `capture.ps1 -Hwnd <hwnd>`.
  - 창 크기 비교도 이 고정된 대상끼리만 한다.
    - `win-input.ps1 -ProcessId <pid>`의 `clientSize`(물리 px)
    - `cdp-eval.mjs --pid <pid> "__poc.caption()"`의 `native.clientWidth`·`clientHeight`(물리 px)
    - `capture.ps1 -Hwnd <hwnd>`의 `clientRect`
    - 세 값이 같아야 같은 창이다.
  - 예:
    ```
    timeout 60 pwsh -NoProfile -File tools/win-input.ps1 -Action state            # -> "pid": 17684, "hwnd": "0x760830"
    node tools/cdp-eval.mjs --pid 17684 "__poc.caption()"                          # target.pid 17684, port 9222
    pwsh -NoProfile -File tools/capture.ps1 -Hwnd 0x760830 -Out specs/v0.1/verify/phase2/x.png
    ```

## 1. 구조 요약 (판정에 필요한 사실)

- 창: `decorations: false`, `shadow: true`, 1440×852 논리 px(A-30.2). 모서리는 DWM에 둥글게 요청한다(`DWMWCP_ROUND`). 테두리·모서리는 OS 몫이다(D-13).
- 타이틀 바는 HTML이다(`data-tauri-drag-region`). 끌기 이동과 더블클릭 최대화·복원은 Tauri 드래그 영역이 처리한다.
- 창 버튼:
  - 최소화·닫기는 HTML 버튼이다.
  - **최대화 버튼은 네이티브**다(`src-tauri/src/caption.rs`). 이유는 이렇다. Windows는 최상위 창이 `WM_NCHITTEST`에 `HTMAXBUTTON`을 돌려줄 때만 스냅 레이아웃 플라이아웃을 띄운다. 그런데 WebView의 입력 창은 WebView2 브라우저 프로세스 소유라 hit test를 가져간다. 그래서 `WRY_WEBVIEW` 자식 창에서 최대화 버튼 칸(오른쪽에서 두 번째 36×32)을 `SetWindowRgn`으로 뚫었다. 그 칸에서는 최상위 창이 `HTMAXBUTTON`을 돌려주고, 버튼을 GDI로 직접 그린다.
  - 그리는 값: 글꼴 `Segoe Fluent Icons` 10px, 최대화 U+E922 / 복원 U+E923.
  - 색은 테마에서 받는다(`caption_set_colors`). hover와 누름 색은 `ghost_element.hover`·`ghost_element.active`를 `title_bar.background` 위에 합성한 값이다.
- 키맵:
  - WebView의 캡처 단계 `keydown`이 모든 키를 자체 엔진(`src/keymap/engine.ts`)에 먼저 넘긴다.
  - 엔진이 쓰거나(바인딩·연속 키 대기) 03-tauri R-20의 브라우저 키이면 `preventDefault`한다.
  - Tauri 2.12.5는 `AreBrowserAcceleratorKeysEnabled`를 노출하지 않아서 D-6 ②를 택했다. PROGRESS Phase 2에 근거가 있다.
  - Phase 2 바인딩은 시험용이다. R-20의 키마다 `test::Key`(args = 키 이름)에 묶었고, `ctrl-k v` → `test::Chord`도 있다.
- 우클릭: 브라우저 기본 메뉴를 막는다. 그래서 개발자 도구는 우클릭으로 열 수 없다. CDP(`cdp-eval.mjs`)를 쓴다.
- 테마:
  - `src/theme/`에서 JSON 읽기 → T-26 대체 → `:root` CSS 변수(`--zl-…`) 순서로 적용한다. CM6는 이 변수를 쓰고, light/dark 플래그는 compartment로 바꾼다.
  - 시작 테마는 Catppuccin Mocha다(A-30.1).
  - 들어 있는 테마는 Catppuccin 4종과 One Dark·One Light다(D-14). 출처와 MIT 전문은 `public/licenses/`에 있고, 빌드하면 `dist/licenses/`로 그대로 복사되어 앱에 같이 들어간다(T-17).

## 2. R-3 — 장식 없는 창의 Windows 창 동작

```
# 스냅 레이아웃 플라이아웃: 최대화 버튼 중심으로 천천히 이동, 2초 머문 뒤 모니터 캡처
timeout 60 pwsh -NoProfile -File tools/win-input.ps1 -Action hover -HoldMs 2000 -Out specs/v0.1/verify/phase2/r3-snap-flyout.png
node tools/cdp-eval.mjs "__poc.caption()"          # native.hover 가 true 인지 (같은 hover 중)

# 이동: 타이틀 바 빈 곳(예: x=700, y=16)을 (+200, +100) 끌기. before/after 의 frame 비교
timeout 60 pwsh -NoProfile -File tools/win-input.ps1 -Action drag -X 700 -Y 16 -DX 200 -DY 100

# 크기 변경: 오른쪽 아래 모서리를 (-200, -150) 끌기
timeout 60 pwsh -NoProfile -File tools/win-input.ps1 -Action resize -DX -200 -DY -150

# 최대화했을 때의 여백 실측: 최대화 뒤 frame 과 모니터 workRect 비교
timeout 60 pwsh -NoProfile -File tools/win-input.ps1 -Action dblclick -X 700 -Y 16
pwsh -NoProfile -File tools/capture.ps1 -Out specs/v0.1/verify/phase2/r3-maximized.png
```

- 스냅 팝업에 `WM_NCHITTEST` 처리가 필요했는지는 `__poc.caption()`의 `native` 필드로 본다(D-7).
  - `regionApplied: true`이고 `buttonRect`에 구멍이 있으면 처리했다는 뜻이다. 근거는 1절과 `caption.rs` 주석이다.
- Win+방향키 스냅은 `-Action keys -Keys "win+left"` 등으로 볼 수 있다. 다만 OS 창 배치를 바꾸므로 끝나면 `win+up` 등으로 되돌린다.
- wt-coder의 자체 확인(2026-11-01):
  - hover 때 플라이아웃이 최대화 버튼 바로 아래에 나왔다. 버튼은 hover 색이었고 `native.hover`는 `true`였다.
  - 더블클릭으로 최대화되었고 frame은 0,0,2880×1704(= 모니터 workRect)였다. 다시 더블클릭하면 복원되었다.

## 3. R-4 — 타이틀 바·창 버튼 치수·모양·색

```
node tools/cdp-eval.mjs "__poc.shell.rects()"      # areas.titlebar, windowButtons(rect·glyph·font)
node tools/cdp-eval.mjs "__poc.caption()"          # 네이티브 최대화 버튼: buttonRect(물리 px), glyph, glyphFont, zoomed
pwsh -NoProfile -File tools/capture.ps1 -Out specs/v0.1/verify/phase2/r4-normal.png
```

- 높이: `areas.titlebar.css.h`가 32(L-21)다.
- 버튼:
  - 최소화·닫기는 `windowButtons.*.rect.css`가 36×32이고, `fontSize`는 10px, `fontFamily`는 "Segoe Fluent Icons"다.
  - 최대화는 `native.buttonRect` 물리 px ÷ `scale`이 36×32다. 위치는 최소화와 닫기 사이, 오른쪽 끝이다.
- 글리프:
  - 코드 근거는 `src/shell/Shell.tsx`의 `GLYPH_MINIMIZE`(U+E921)·`GLYPH_CLOSE`(U+E8BB), 그리고 `src-tauri/src/caption.rs`의 `GLYPH_MAXIMIZE`(U+E922)·`GLYPH_RESTORE`(U+E923)다.
  - 렌더는 캡처 PNG로 확인한다. 최대화 상태에서는 `native.glyph`가 `U+E923`이다(L-312).
- 색:
  - 닫기 hover: `win-input.ps1 -Action hover -X <닫기 중심> -Y 16 -Out …`으로 찍은 뒤 픽셀을 샘플한다. 기대값은 `#E81120`이고 글자는 흰색이다(L-84).
  - 최소화 hover: 같은 방법이다. 기대값은 `ghost_element.hover`를 `title_bar.background` 위에 합성한 값이다.
  - 최대화 hover·누름: 네이티브다. `__poc.caption().lastColors.hover/pressed`와 픽셀을 비교한다.
  - 누름 색은 누른 채로 찍어야 한다. `win-input.ps1`에는 누른 채로 두는 동작이 없으므로, 필요하면 판정 불가로 적고 코드 근거(CSS `:active` 규칙, `caption.rs` `pressed`)로 대신한다.

## 4. R-5 — 창 모서리·테두리 관찰 (D-13)

```
pwsh -NoProfile -File tools/capture.ps1 -Method Screen -Out specs/v0.1/verify/phase2/r5-normal.png
timeout 60 pwsh -NoProfile -File tools/win-input.ps1 -Action keys -Keys "win+left" -Out specs/v0.1/verify/phase2/r5-snapped.png
timeout 60 pwsh -NoProfile -File tools/win-input.ps1 -Action keys -Keys "win+up" -Out specs/v0.1/verify/phase2/r5-maximized.png
```

- 모서리 반지름과 테두리 폭은 관찰값만 기록한다(앱은 그리지 않는다).
- 끝나면 창을 원래 상태로 돌린다.

## 5. R-6 — 브라우저 단축키가 키맵 엔진에 도달

```
node tools/cdp-eval.mjs "(__poc.keymap.clear(), __poc.keymap.signals())"
timeout 120 pwsh -NoProfile -File tools/win-input.ps1 -Action keys -GapMs 300 -Keys "ctrl+p,ctrl+f,ctrl+r,f5,f3,alt+left,alt+right,ctrl+=,ctrl+-,ctrl+w,ctrl+tab,f1,f6"
node tools/cdp-eval.mjs "({ log: __poc.keymap.log(), signals: __poc.keymap.signals() })" --out specs/v0.1/verify/phase2/r6-keys.json
```

- 각 키가 다음을 모두 만족하면 도달한 것이다.
  - `log`에 `keystroke`가 있다.
  - `isTrusted: true`(실제 입력)다.
  - `result: "action"`, `args`가 그 키다.
  - `prevented: true`다.
- 브라우저 동작이 일어나지 않았는지는 `signals`로 본다.
  - 새로고침: `pageLoads`가 그대로다. 새로고침되면 1 늘고, 그 전의 `log`도 사라진다.
  - 인쇄: `beforePrint`가 0이다.
  - 뒤로/앞으로: `popState`·`pageHide`가 0이다.
  - 확대: `dprChanges`가 빈 배열이고 `devicePixelRatio`가 그대로다. 확대 키는 `ctrl+=`, `ctrl+-`와 숫자패드 `ctrl+numadd`, `ctrl+numsub`를 모두 보낸다.
  - 찾기 바·인쇄 창은 화면에도 없어야 한다. `-Out`으로 찍는다.
- Ctrl+P는 막히지 않으면 인쇄 창이 떠서 입력을 가로챈다. 그럴 경우에는 수동으로 닫는다.
- 우클릭: `-Action click`은 왼쪽 클릭뿐이다. 우클릭 메뉴는 사람이 확인하거나, `signals.contextMenusBlocked`가 늘어나는지로 본다.
- wt-coder 자체 확인(2026-11-01): Ctrl+P를 뺀 12개 키가 모두 `isTrusted: true`, `action`, `prevented: true`였다. `pageLoads`는 그대로였고 확대·이동 신호는 없었다.

## 6. R-7 — 키맵 규칙 엔진

```
npm run test:keymap
```

- 출력은 TAP 형식이다. 마지막의 `ℹ tests` / `ℹ pass` / `ℹ fail`이 통과 수/전체 수다.
- 테스트 이름은 I-702·I-703·I-001·I-704 규칙 문장을 하나씩 사례로 옮긴 것이다(`src/keymap/engine.test.ts`).
- 앱 안에서는 `__poc.keymap.display(action, args)`로 I-704 표시 키를 조회할 수 있다.

## 7. R-8 — 테마

```
node tools/cdp-eval.mjs "__poc.theme.list()"
node tools/cdp-eval.mjs "__poc.theme.apply('Catppuccin Mocha').then(r => ({ apply: r, dump: __poc.theme.dump() }))" --out specs/v0.1/verify/phase2/r8-mocha.json
node tools/cdp-eval.mjs "__poc.theme.apply('Catppuccin Latte').then(r => ({ apply: r, dump: __poc.theme.dump() }))" --out specs/v0.1/verify/phase2/r8-latte.json
node tools/cdp-eval.mjs "__poc.theme.samples()"
```

- `dump().tokens[]`의 필드:
  - `token`
  - `source`: `json` / `fallback:T-26.n` / `missing`
  - `value`: 원본 값 또는 대체 값
  - `applied`: `:root`의 실제 CSS 변수 값
- 대상 토큰은 PROGRESS Phase 2에 고정한 27개다. 원본 JSON(`src/theme/assets/catppuccin/catppuccin-mauve.json`, v0.2.27)과 checker가 직접 대조한다.
- 전환 시간은 `apply().timingMs`에 있다. 16ms는 기준이 아니다(Q4 A).
  - 항목: `readJson`, `merge`, `cssVariables`, `cm6AndCaptionRequest`, `captionApplied`, `untilPainted`, `total`.
  - `captionApplied`는 네이티브 최대화 버튼 색 요청(`caption_set_colors`)이 끝날 때까지다.
  - `untilPainted`는 그 뒤 두 번의 rAF다.
  - `captionOk: false`이면 버튼 색 적용이 실패한 것이다.
- 화면 샘플(S-1~S-13): `samples()`가 각 요소의 위치(물리 px)와 계산된 색을 준다. 판정은 `capture.ps1` PNG 픽셀로 한다.
- Latte 기준 화면은 최대화하지 않은 창이다. 창 크기를 1224×740 논리로 맞추는 도구는 없으므로 `resize`로 근사한다.
- 끝나면 `__poc.theme.apply('Catppuccin Mocha')`로 되돌린다. R-2 측정은 Mocha 기준이다.
- One Light: 토큰 덤프만 판정한다(D-11). 원본은 `src/theme/assets/one/one.json`(Zed 커밋 14b7b0e, D-14)이다.
  ```
  node tools/cdp-eval.mjs "__poc.theme.apply('One Light').then(r => ({ apply: r, dump: __poc.theme.dump() }))" --out specs/v0.1/verify/phase2/r8-one-light.json
  ```
- `__poc.r2.measure()`의 E-011 오른쪽 끝 항목은 "보이는 오른쪽 끝에 닿는다(≥)"로 판정한다. Phase 2 셸에서는 Pane이 좁아 줄이 편집기보다 길면 강조가 내용 끝까지 이어지기 때문이다.

## 7a. 스크롤바 테두리 (E-031, E-032)

- 세로 트랙만 왼쪽 1px `scrollbar.track.border`가 있다(E-031).
  - 의사 요소의 `:vertical` 상태는 `getComputedStyle`로 읽을 수 없다. 그래서 `capture.ps1` PNG에서 세로 스크롤바 왼쪽 끝 픽셀로 본다.
  - 기대값은 `track.border`를 `track.background` 위에 합성한 색이다. Mocha에서 wt-coder가 잰 값은 2 물리 px, `#1f1f29`였다.
- 손잡이 테두리는 `scrollbar.thumb.border`다(E-032). `getComputedStyle(scroller, '::-webkit-scrollbar-thumb').border`로 읽을 수 있다.
  - 두께는 E-032에 없어서 1px로 정했다(판단, PROGRESS 기록).

## 8. R-9 — 영역 뼈대

```
node tools/cdp-eval.mjs "__poc.shell.rects()" --out specs/v0.1/verify/phase2/r9-rects.json
pwsh -NoProfile -File tools/capture.ps1 -Out specs/v0.1/verify/phase2/r9-layout.png
```

- `rootFontSize`는 `16px`다(L-01). rem 변환은 `src/shell/styles.ts`의 `rem()`이 px ÷ 16으로 한다(L-02).
- `areas`의 키:
  - `window`
  - `sidebar`(`sidebar-header`, `sidebar-list`, `sidebar-footer`)
  - `workspace`
  - `titlebar`
  - `body`
  - `dock-left`
  - `center`
  - `statusbar`
- 배치(L-11~L-16):
  - 사이드바가 창 전체 높이의 왼쪽 열이고, 헤더 높이가 타이틀 바와 같다.
  - 타이틀 바는 사이드바 오른쪽에서 시작한다.
  - Workspace는 타이틀 바 → 본문 → 상태 표시줄 순서다.
  - 본문은 왼쪽 Dock → 가운데 순서다.
  - 왼쪽 Dock 오른쪽에 1px `border`가 있다.
  - 오른쪽 사이드바와 오른쪽·아래 Dock은 없다.
- 가운데의 Pane 두 개(탭 바 + 편집기)는 Phase 1 PoC다. R-1·R-2 probe(`__poc.r1.*`, `__poc.r2.*`)는 그대로 쓸 수 있다.
