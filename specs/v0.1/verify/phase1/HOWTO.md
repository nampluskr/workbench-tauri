# Phase 1 검증 방법 (wt-coder, 2026-11-01)

SPEC R-1(03-tauri R-01)과 R-2(03-tauri R-02)를 검증하는 방법이다. 판정에 필요한 덤프는 앱 안의 개발용 진입점 `window.__poc`로 얻는다.

## 1. 준비

1. wt-runner-app의 `npm run tauri dev` 창(ZedLike)을 쓴다. 프런트엔드 변경은 HMR로 이미 반영되어 있다.
   - 화면 구성: 위에 Pane 두 개(`p0`: 탭 `a`·`b`, `p1`: 탭 `c`)가 가로로 놓인다.
   - 각 Pane은 탭 바와 CM6 편집기로 되어 있다.
   - 탭 이름 버튼은 활성화이고, `⇄` 버튼은 다른 Pane으로 옮기기다.
2. 창 안에서 우클릭한 뒤 "검사(Inspect)"를 눌러 개발자 도구를 연다. 디버그 빌드라 개발자 도구가 들어 있다.
3. Console 탭에서 `window.__poc`가 객체인지 확인한다.
   - `__poc`는 `import.meta.env.DEV`일 때만 설치된다.
   - 빌드 결과물에서 쓰려면 URL에 `?poc`를 붙인다.
4. 결과는 `copy(JSON.stringify(결과, null, 2))`로 복사해 이 폴더에 저장한다. 파일 이름 예: `r1-move.json`, `r2-measure.json`.

모든 함수는 `await`로 부른다. 내부에서 렌더 프레임을 기다린다.

## 2. R-1 — Pane 이동 뒤 EditorView 유지

```js
// 1) 탭 이동: 탭 a를 p0에서 p1로 옮긴다.
//    옮기기 전에 scrollTop=1200, 선택 2000..2100을 만들어 둔다.
r1move = await __poc.r1.runMoveTest()

// 2) 부모 구조 변경: Pane 컴포넌트가 모두 다시 만들어지게
//    감싸는 구조(row ↔ nested)를 바꾼다.
r1restructure = await __poc.r1.runRestructureTest()

// 옵션 예: 다른 탭, 다른 값
await __poc.r1.runMoveTest({ tab: "c", scrollTop: 800, anchor: 500, head: 520 })
```

결과의 주요 필드는 다음과 같다.

| `checks.` 필드 | 뜻 |
| --- | --- |
| `sameNode` | 옮긴 뒤의 `view.dom`이 옮기기 전의 같은 객체이고, 저장소의 인스턴스도 같다 |
| `sameInstance` | 옮긴 탭 자신의 인스턴스 번호(`data-poc-instance`)가 같다. 이동 중 다른 탭이 처음 만들어지는 것은 판정에 넣지 않는다 |
| `connectedBefore` / `connectedAfter` | 옮기기 전후 모두 편집기 DOM이 문서에 붙어 있다 |
| `inDestinationSlot` | 편집기 DOM의 실제 부모가 목적지 Pane의 슬롯(`data-poc-slot`)이고, store의 Pane도 같은 곳이다 |
| `scrollPreserved` | 옮기기 전 `scrollTop`이 0보다 크고, 전후 차이가 ±1 px 안이다(A-31.1) |
| `selectionPreserved` | 선택 범위(anchor·head 목록)가 같다 |
| `cursorPreserved` | 커서의 줄·열이 같다 |

결과의 다른 필드:
- `pass`: `checks`가 모두 참이다.
- `expectedPane`: 목적지 Pane id.
- `before` / `after`: 탭, store Pane, DOM 슬롯, 인스턴스, 연결 여부, scrollTop, 선택, 커서 덤프.

손으로 보는 방법도 있다. `⇄` 버튼으로 옮긴 뒤 Elements 탭에서 `.cm-editor[data-poc-instance]`의 번호가 그대로인지 본다. 번호는 생성 순서다.

## 3. R-2 — CM6 편집기 치수

```js
r2 = await __poc.r2.measure()        // pane 0의 활성 탭을 잰다
console.table(r2.rows)

// E-002의 5자리 경우: 10000줄 문서로 바꾼 뒤 다시 잰다
await __poc.r2.setLines(10000)
r2big = await __poc.r2.measure("a")
```

`r2`에는 다음이 들어 있다.
- `font`: 편집기가 실제로 쓰는 글꼴(`.cm-scroller`의 계산된 스타일)의 `family`·`size`, 그리고 그 글꼴로 캔버스에서 잰 "0"의 폭(`ch`)과 descent 절댓값.
  - 기대 값은 이 메트릭과 `src/poc/specExpected.ts`의 SPEC 값으로 계산한다.
  - `specExpected.ts`는 구현 쪽이 import하지 않는 독립 상수다(E-010 24.27, E-015 3.64·7.28, E-030 15, E-002 4자리, E-003 3ch, E-004 4ch, 색 hex).
- `devicePixelRatio`
- `rows[]`: 항목마다 `id / check / expected / actual / pass`. px 항목은 ±1 px로 판정한다.
  - 잴 수 없는 항목은 `actual: "unmeasurable: …"`, `pass: false`로 남긴다.
  - 필수 ID(E-002, E-003, E-004, E-005, E-010, E-011, E-015, E-030)의 행이 없으면 실패 행을 더한다.
- `failed[]`: 실패한 행 목록.
- `pass`: 실패 행이 없다.

| ID | 재는 것 |
| --- | --- |
| E-002 | 줄 번호 칸의 내용 폭 vs max(자릿수 × ch, 4 × ch) |
| E-003 | 줄 번호 칸 왼쪽 padding vs 3 ch |
| E-004 | 줄 번호 칸 오른쪽 padding vs 4 ch |
| E-005 | 거터 오른쪽 끝 → 첫 글자 왼쪽 거리 vs \|descent\| |
| E-010 | `view.defaultLineHeight`와 `.cm-line` 높이 vs 15 × 1.618 = 24.27 |
| E-011 | 빈 커서일 때 강조 1줄과 거터 칸, 강조의 왼쪽(편집기 왼쪽 끝)·오른쪽(스크롤바 안쪽 끝)·높이·색. 비어 있지 않은 선택이 있는 줄은 강조 0줄 |
| E-015 | 선택 영역은 SVG 경로(`.zl-selectionShape path`)로 그린다. 경로의 호(`A` 명령)를 읽는다. ① 한 줄 선택: 바깥 모서리 4개, 반지름 3.64. ② 세 줄 선택(N줄 11열 → N+2줄 21열): 경로 1개에 바깥 모서리 6개(3.64)와 안쪽 꺾인 모서리 2개(2배 = 7.28). ③ 채움 색 `players[0].selection` |
| E-030 | 세로 스크롤바 두께(`offsetWidth - clientWidth`) vs 15 |

- 색 기대 값은 Catppuccin Mocha 값이다(03-THEME-ICONS 값 표).
  - `editor.active_line.background` `#cdd6f412`
  - `players[0].selection` `#9399b240`
- 테마 로더는 Phase 2(SPEC R-8) 몫이다. Phase 1에서는 이 두 값을 고정값으로 넣었다.
- 스크린샷: 편집기 탭이 보이는 창을 찍고, 위 덤프와 함께 이 폴더에 둔다(SPEC R-2 판정 방법). 기준 화면 두 장은 미리보기 탭이라 편집기 화면 대조는 하지 않는다.

## 3a. CSP 확인

- `tauri dev`는 Vite 개발 서버(`http://localhost:1420`)에서 페이지를 직접 읽는다. 그래서 Tauri의 CSP가 걸리지 않는다. nonce 없는 인라인 `<style>`도 적용되는 것을 확인했다(2026-11-01).
- CSP는 빌드한 앱(`http://tauri.localhost`, 에셋 프로토콜)에서 확인한다. 이 경우 Tauri가 동작한다.
  - Tauri는 `index.html`의 모든 `<style>`에 페이지를 읽을 때마다 새 nonce를 넣고, 같은 nonce를 `style-src`에 더한다.
  - 앱은 `<style id="csp-nonce-carrier">`의 nonce를 읽어 CM6 `EditorView.cspNonce`로 넘긴다. CSP는 완화하지 않았다.
- 확인 방법:
  1. `npm run tauri build -- --debug --no-bundle`로 빌드한다.
  2. 빌드한 exe를 다른 포트(예: 9223)와 별도 `WEBVIEW2_USER_DATA_FOLDER`로 실행한다.
  3. 아래를 실행한다.
     ```
     node tools/cdp-eval.mjs --port 9223 "location.replace('http://tauri.localhost/?poc'), 1"
     node tools/cdp-eval.mjs --port 9223 --logs "__poc.csp()"
     ```
- 통과 기준은 셋이다.
  - `violations`가 빈 배열이다.
  - `logs`에 `source: "security"` 항목이 없다.
  - CM6 `<style>`의 `nonce`가 `same-as-carrier`이고 `rules`가 0보다 크다.
- 2026-11-01 결과: `csp-built-check.json`.
  - 위반 0건, CM6 style 118 rules가 nonce로 적용되었다.
  - 같은 실행에서 R-1 이동·구조 변경과 R-2 측정이 모두 `pass: true`였다.
  - 대조 시험으로 nonce 없는 `<style>`을 넣으면 `style-src` 위반으로 막히는 것도 확인했다. 즉 CSP가 실제로 걸려 있다.
- `__poc.csp()`는 다음을 돌려준다.
  - `carrierNonce`: 있음/없음
  - `style` 요소별 `nonce`(carrier와 같은지)와 `rules` 수
  - `securitypolicyviolation` 이벤트 기록(`violations`)

## 4. 명령줄로 검증하기: `tools/cdp-eval.mjs`

개발자 도구를 열지 않고 명령줄에서 위 함수를 부르는 도구다. Node 24 내장 `fetch`·`WebSocket`만 쓰고 패키지를 더하지 않는다.

**준비** — 앱은 원격 디버깅 포트를 연 상태로 떠 있어야 한다. 개발 검증 전용이고, wt-runner-app이 이렇게 띄운다.

```
WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222 npm run tauri dev
```

**사용법**

```
node tools/cdp-eval.mjs "<JS 식>" [--out <파일>] [--screenshot <png>] [--logs] [--port 9222] [--title ZedLike] [--timeout 30000]
```

- `--logs`: CDP `Log` 도메인을 켜고, 그때까지 쌓인 항목과 새 항목을 결과의 `logs`에 넣는다. CSP 위반은 `source: "security"`로 나온다.
- `--timeout <ms>`: `/json` 조회, WebSocket 연결, CDP 요청마다 걸리는 시간 제한이다. 기본값은 30000이다.
  - 시간을 넘기거나 연결이 닫히면, 대기 중인 요청을 모두 오류로 끝내고 종료 코드 1로 끝난다.

- `http://127.0.0.1:9222/json`에서 제목이 `ZedLike`인 페이지를 찾는다.
- 그 페이지에서 `Runtime.evaluate`(`awaitPromise: true`, `returnByValue: true`)로 식을 평가한다.
- 결과는 `{ "ok": true, "type": ..., "value": ... }` 형태의 JSON으로 stdout에 쓴다. `--out`을 주면 그 파일에도 쓴다.
  - 예외가 나면 `{ "ok": false, "error": ... }`를 쓰고 종료 코드 1로 끝난다.
- `--screenshot <png>`를 주면 평가한 뒤 `Page.captureScreenshot`으로 페이지를 찍는다. 식 없이 `--screenshot`만 줄 수도 있다.

**예시** (레포 루트에서)

```
node tools/cdp-eval.mjs "typeof window.__poc"
node tools/cdp-eval.mjs "__poc.r1.runMoveTest()" --out specs/v0.1/verify/phase1/r1-move.json
node tools/cdp-eval.mjs "__poc.r1.runRestructureTest()" --out specs/v0.1/verify/phase1/r1-restructure.json
node tools/cdp-eval.mjs "__poc.r2.measure()" --out specs/v0.1/verify/phase1/r2-measure.json --screenshot specs/v0.1/verify/phase1/r2-editor.png
node tools/cdp-eval.mjs "__poc.r2.setLines(10000).then(() => __poc.r2.measure('a'))" --out specs/v0.1/verify/phase1/r2-measure-10000.json
```

- `Page.captureScreenshot`은 WebView 내용만 찍는다. OS 창 테두리와 타이틀 바는 들어가지 않는다.
- 동작 확인(2026-11-01): `node tools/cdp-eval.mjs "typeof window.__poc"`의 결과는 `{"ok": true, "type": "string", "value": "object"}`였다. `--out`과 `--screenshot`도 파일이 만들어지는 것을 확인했다.

## 5. 주의

- `measure()`는 측정하려고 해당 탭의 선택과 포커스를 바꾸고, 끝나면 커서를 문서 처음으로 되돌린다.
- `setLines()`는 문서를 바꾼다. 다른 R-1 시험 앞에서는 창을 다시 열거나(HMR 새로고침) `setLines(300)`으로 되돌린다.
- 화면 레이아웃(타이틀 바·뼈대)은 Phase 2 몫이다. Phase 1 화면은 PoC 전용이다.
