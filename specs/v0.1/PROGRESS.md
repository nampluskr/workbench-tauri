> 버전: v0.1 · 작성일: 2026-11-01 · 상태: 진행 중
>
> 실제로 한 일과 검증 결과를 기록한다. 계획은 `PLAN.md`에, 요구는 `SPEC.md`에, 설계 결정은 `DECISIONS.md`에 있다.

# PROGRESS — workbench-tauri v0.1

## Phase별 진행

### Phase 0 — 프로젝트 뼈대

- **Tauri 2 + Solid + TypeScript + Vite 뼈대 생성과 빌드 확인** (2026-11-01)
  - 무엇을 했나: 대화형 생성기를 쓰지 않고 파일을 직접 썼다.
    - 프런트엔드(루트): `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/index.tsx`, `src/App.tsx`
    - 코어(`src-tauri/`): `Cargo.toml`, `build.rs`, `src/main.rs`, `src/lib.rs`, `tauri.conf.json`, `capabilities/default.json`, `icons/icon.png`·`icon.ico`
    - 앱 이름은 03-tauri 2.3의 임시 이름 `ZedLike`이고, identifier는 임시값 `dev.workbench.zedlike`다.
    - CSP를 켰다(D-10).
    - 창 설정은 기본값으로 두었다. Phase 2에서 정한다.
    - `.gitignore`에 `src-tauri/target/`를 더했다.
  - 결과:
    - 패키지는 03-tauri 3.1·3.2 후보와 지시받은 목록 안에서만 넣었다.
      - npm: `@tauri-apps/api` 2.12.4, `@tauri-apps/cli` 2.12.4, `solid-js` 1.9.18, `vite` 8.3.5, `vite-plugin-solid` 2.11.15, `typescript` 7.0.2
      - cargo: `tauri` 2.12.5, `tauri-build` 2.7.4
    - `tauri`와 `@tauri-apps/api`의 마이너 버전이 12로 같다(D-4, 03-tauri R-31).
    - `package-lock.json`과 `src-tauri/Cargo.lock`이 생겼다.
    - CSP 값:
      - `csp`: `default-src 'self' ipc: http://ipc.localhost`
      - `devCsp`: 위 값에 Vite HMR용 `connect-src 'self' ipc: http://ipc.localhost ws://localhost:1420`을 더한 것
  - 검증:
    - `npm install`은 0 vulnerabilities였다.
    - `npm run typecheck`는 오류가 없었다.
    - `npm run tauri build -- --debug --no-bundle`은 종료 코드 0, 경고 0건이었고 `src-tauri/target/debug/zedlike.exe`가 생겼다. 요약은 `specs/v0.1/verify/phase0/build.txt`에 있다.
    - 빌드 준비물(03-tauri R-30):
      - Node v24.19.0, npm 11.17.0
      - Rust 1.99.1 (`stable-x86_64-pc-windows-msvc`), cargo 1.99.1
      - MSVC: Visual Studio Build Tools 2022 17.14.37827.9 (VC.Tools.x86.x64 구성 요소 있음)
      - Windows SDK 10.0.26100.0
      - WebView2 런타임 156.0.4314.58 (HKLM EdgeUpdate 레지스트리)
  - 특이사항:
    - 03-tauri 3.1은 `tauri-build`를 2.12.5로 적었지만, crates.io에 그 버전이 없다. 2.x의 최신은 2.7.4다(`tauri-codegen`·`tauri-macros`도 2.7.4). 그래서 2.7.4를 썼다.
    - crates.io의 최신 `tauri`는 3.0.0-alpha.5다. 하지만 03-tauri의 기준 버전인 2.12.5를 썼다.
    - 아이콘은 Windows 리소스 생성에 필요해서 회색 단색 정사각형 자리 표시 아이콘을 Node 스크립트로 만들었다(Zed 아이콘 아님).
    - `npm run tauri dev`는 실행하지 않았다. 지시대로 leader가 wt-runner-app에서 실행한다.
    - 리뷰·검증·커밋 전이므로 Phase 0은 진행 중이다.

- **Phase 0 리뷰 1회차 지적 3건 반영** (2026-11-01)
  - 무엇을 했나: leader가 채택한 wt-reviewer 지적 3건을 반영했다.
    - 1/Major: `src-tauri/capabilities/default.json`에서 쓰지 않는 `core:default` 전체 권한을 뺐다. `permissions`를 빈 배열로 두었다. 프런트엔드는 아직 `@tauri-apps/api`·`invoke`를 쓰지 않는다(`src/` 검색으로 확인). 이후 Phase에서 필요한 명령만 개별로 더한다.
    - 2/Minor: `vite.config.ts`의 `envPrefix`에서 `TAURI_ENV_*`를 `TAURI_ENV_`로 고쳤다. envPrefix는 glob이 아니라 접두사다.
    - 3/Minor: `.gitignore`에 `src-tauri/gen/schemas/`를 더했다.
  - 결과: 위 세 파일이 바뀌었다.
    - devCsp(`connect-src … ws://localhost:1420`)는 Vite HMR용 개발 전용 설정이다. leader가 승인했다(2026-11-01). 배포 빌드에는 `csp`(`default-src 'self' ipc: http://ipc.localhost`)만 걸린다.
  - 검증:
    - `npm run build`(vite) 성공.
    - `npm run typecheck` 오류 없음.
    - `cargo build --manifest-path src-tauri/Cargo.toml` 성공(1m 18s, 경고 0건). 빈 권한의 capability도 tauri-build 검증을 통과했다.
    - wt-runner-app의 `npm run tauri dev`가 기본 target 폴더를 쓰고 있어서, 빌드는 scratchpad의 별도 target 폴더(`CARGO_TARGET_DIR`)로 했다.
  - 특이사항: `npm run tauri dev`는 건드리지 않았다. 다만 dev가 `src-tauri/` 변경을 감시하므로 capabilities 수정으로 다시 빌드되었을 수 있다.

- **Phase 0 리뷰·검증 결과와 완료** (2026-11-01)
  - 무엇을 했나: PLAN의 Phase 끝 순서(리뷰 → 검증 → PROGRESS → 커밋)에서 리뷰와 검증 결과를 기록했다.
  - 결과:
    - 리뷰(wt-reviewer):
      - 1회차 지적 3건(capabilities 1/Major, envPrefix 2/Minor, `.gitignore` 3/Minor)을 반영했다.
      - 2회차에서 3건 모두 해소되었고, 새 Major 지적은 없다.
    - 검증(wt-checker): `specs/v0.1/verify/phase0/REPORT.md`에 PLAN Phase 0 완료 조건의 판정표가 있다.
      - 1~6번 조건이 모두 충족이고, 불충족은 없다.
      - 7번(Phase 끝 순서)은 이 기록과 커밋으로 마무리된다.
      - 실행 증거는 `specs/v0.1/verify/phase0/window.png`다. 창 제목 `ZedLike`, 배율 200%(DPI 192), 클라이언트 영역 논리 800×600이다.
  - 검증: wt-checker 보고서의 판정표와 `window.png` 파일이 있는지 확인했다.
  - 특이사항: 커밋은 leader가 한다.
  - 상태: Phase 0 완료 (2026-11-01).

### Phase 1 — 프레임워크·편집기 기반 PoC

- **R-1·R-2 PoC와 검증용 진입점 구현** (2026-11-01)
  - 무엇을 했나: 앱 화면을 PoC로 바꿨다. Pane 두 개에 탭과 CM6 편집기가 있다. 검증용 개발 진입점 `window.__poc`를 만들었다.
    - `src/poc/editorStore.ts`: `EditorView`를 Solid 컴포넌트 트리 밖의 Map에 두고, Pane 슬롯에는 `view.dom`만 옮겨 붙인다(03-tauri 6절 대응). 노드를 떼면 scroll offset을 잃으므로, 마지막 `scrollSnapshot()`을 보관했다가 붙인 뒤 되돌린다.
    - `src/poc/layout.ts`: Pane·탭 상태 store(Solid `createStore`). 기능은 탭 이동과 감싸는 구조 바꾸기(row ↔ nested)다.
    - `src/poc/PocApp.tsx`: Pane 컴포넌트. props를 구조 분해하지 않았다(D-3 위험 항목). 스타일은 CSP에 맞게 CSSOM(`style` 객체)만 쓴다.
    - `src/poc/zedEditor.ts`: R-2용 CM6 확장.
      - 글꼴 `15px Consolas`(Q7 A), 줄 높이 15 × 1.618(E-010)
      - 줄 번호 칸 최소 4ch·왼쪽 3ch·오른쪽 4ch(E-002~E-004), 줄 왼쪽 여백 = |descent|(E-005)
      - 현재 줄 강조(E-011): 빈 커서 줄만 강조하고, 비어 있지 않은 선택이 걸린 줄은 뺀다. 거터 칸을 포함한다.
      - 둥근 선택 0.15 × 줄 높이(E-015), 스크롤바 15px(E-030)
      - 색은 Mocha 고정값이다.
    - `src/poc/probe.ts`: `__poc.r1.runMoveTest`, `__poc.r1.runRestructureTest`, `__poc.r2.measure`, `__poc.r2.setLines`.
    - `src/index.tsx`, `src/App.tsx`: PoC 연결. `body` margin은 CSSOM으로 0이다.
  - 결과:
    - 추가 패키지(03-tauri 3.2 목록 안): `@codemirror/view` 6.43.15, `@codemirror/state` 6.7.6(둘 다 MIT). 정확한 버전으로 고정했다.
    - 검증 방법은 `specs/v0.1/verify/phase1/HOWTO.md`에 있다.
  - 검증:
    - `npm run typecheck`는 오류가 없었다.
    - `npm run build`는 성공했다(JS 242.85 kB).
    - 앱에서 직접 실행해 확인하지는 못했다. `npm run tauri dev`는 지시대로 띄우지 않았고, Chrome 확장도 연결되지 않아 개발 서버 페이지로도 확인하지 못했다. 판정은 wt-checker가 HOWTO대로 한다.
  - 특이사항:
    - E-015의 "여러 줄 선택의 안쪽 꺾인 모서리 2배 반지름"은 구현하지 않았다. CM6 `drawSelection`은 사각형을 따로 그린다. measure 결과에 항상 `pass: false`로 남는 차이 항목이다.
    - 색 판정은 Phase 2 테마 로더 전이라 Mocha 고정값과 비교한다.
    - 리뷰·검증·커밋 전이므로 Phase 1은 진행 중이다.

- **검증 도구 `tools/cdp-eval.mjs` 추가** (2026-11-01)
  - 무엇을 했나: CDP로 앱 페이지에서 JS 식을 평가하는 명령줄 도구를 만들었다. Node 24 내장 `fetch`·`WebSocket`만 쓴다.
    - 옵션: `--out`, `--screenshot`(`Page.captureScreenshot`)
    - wt-runner-app이 `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222`로 앱을 띄운다(개발 검증 전용).
  - 결과: HOWTO 4절에 사용법을 적었다.
  - 검증: `node tools/cdp-eval.mjs "typeof window.__poc"`의 결과가 `{"ok": true, "type": "string", "value": "object"}`였다.
  - 특이사항: 없음.

- **Phase 1 리뷰 1회차 지적 7건 반영** (2026-11-01)
  - 무엇을 했나: leader가 전부 채택한 wt-reviewer 지적 7건을 반영했다.
    - 1/Major CSP:
      - `tauri dev`는 Vite 서버 페이지라 CSP가 걸리지 않는다. 빌드 앱에서는 CM6의 실행 중 `<style>`이 막힐 수 있었다.
      - Tauri 소스(tauri-utils `html.rs` `inject_nonce_token`, tauri `manager/mod.rs` `replace_csp_nonce`)를 확인했다. Tauri는 `index.html`의 모든 `<style>`에 페이지를 읽을 때마다 nonce를 넣고 `style-src 'self' 'nonce-…'`를 더한다.
      - 그래서 `index.html`에 `<style id="csp-nonce-carrier">`를 두고, 그 nonce를 `EditorView.cspNonce`로 넘겼다(`zedEditor.ts`). CSP는 완화하지 않았다.
      - 빌드 앱 확인에서 Solid의 정적 `style={{…}}` 리터럴이 템플릿 `style="…"` 속성으로 컴파일되어 `style-src-attr` 위반 2건이 나왔다. 그래서 스타일 객체를 모두 변수로 바꿔 CSSOM으로 적용되게 했다(`PocApp.tsx`).
    - 2/Major R-1 목적지 검증: `connectedBefore`·`connectedAfter`와 `inDestinationSlot`(DOM 부모 슬롯 `data-poc-slot`과 store의 Pane이 모두 목적지)을 판정에 넣었다. `scrollPreserved`는 이동 전 `scrollTop`이 0보다 커야 참이다.
    - 3/Major R-1 생성 횟수: 전체 생성 횟수 비교를 빼고, 옮긴 탭 자신의 인스턴스 번호와 저장소 객체만 비교한다.
    - 4/Major E-015 미구현:
      - `src/poc/selectionShape.ts`를 새로 만들었다. 선택 행을 하나의 외곽선으로 합쳐 SVG 경로로 그리는 CM6 layer다. 바깥 모서리 반지름은 r, 안쪽 꺾인 모서리는 2r다.
      - drawSelection의 사각형 층은 숨겼다. 커서는 drawSelection이 계속 그린다.
      - probe는 경로의 호를 읽어 한 줄(바깥 4개)과 세 줄(바깥 6개 + 안쪽 2개)을 판정한다.
    - 5/Major 독립 기대값: `src/poc/specExpected.ts`에 SPEC·01-zed 원문 값을 따로 두었다(구현이 import하지 않음). ch·descent는 편집기가 실제로 쓰는 글꼴로 잰다.
    - 6/Major 측정 누락: 잴 수 없으면 `unmeasurable` 실패 행을 남긴다. 필수 ID 8개 가운데 행이 없는 ID는 실패로 더한다. 결과에 `failed[]`를 넣었다.
    - 7/Minor cdp-eval: `--timeout`(기본 30000 ms)을 넣었다. `/json` 조회, WebSocket 연결, 요청마다 적용된다. close·error 때는 대기 중인 요청을 모두 거부한다. CSP 위반 확인용 `--logs`(CDP Log 도메인)도 넣었다.
  - 결과:
    - 위 파일들과 `index.html`, `src/poc/probe.ts`가 바뀌었다. HOWTO를 고쳤고, CSP 절(3a)을 더했다.
    - 증거는 `specs/v0.1/verify/phase1/csp-built-check.json`이다.
  - 검증:
    - `npm run typecheck` 오류 없음, `npm run build` 성공. 번들에 `style="` 문자열이 없다.
    - dev 인스턴스(9222)에서 `runMoveTest`·`runRestructureTest`가 모든 checks 참이었다. `measure()`는 33행 모두 통과, `failed: []`였다. 글꼴 Consolas 15px, ch 8.247, descent 4.
    - 빌드 앱(에셋 프로토콜 `http://tauri.localhost`, 포트 9223, 별도 WebView2 데이터 폴더)에서:
      - `__poc.csp()`의 violations가 0건, CDP Log의 security 항목도 0건이었다.
      - CM6 `<style>`이 carrier와 같은 nonce로 118 rules가 적용되었다.
      - 같은 실행에서 R-1 두 시험과 R-2가 모두 `pass: true`였다.
      - 대조 시험으로 nonce 없는 `<style>`을 넣으면 `style-src` 위반으로 막혔다. CSP가 실제로 걸려 있다.
    - cdp-eval은 없는 포트에서 바로 종료 코드 1로 끝났다.
  - 특이사항:
    - 검증용 빌드 앱은 scratchpad의 별도 target 폴더로 빌드해 잠깐 실행했고, 확인 뒤 닫았다(`window.close()` 후 백그라운드 작업 종료).
    - wt-runner-app의 dev 인스턴스는 건드리지 않았다.

- **Phase 1 리뷰·검증 결과와 완료** (2026-11-01)
  - 무엇을 했나: PLAN의 Phase 끝 순서(리뷰 → 검증 → PROGRESS → 커밋)에서 리뷰와 검증 결과를 기록했다.
  - 결과:
    - 리뷰(wt-reviewer): 1회차 지적 7건(CSP nonce, R-1 목적지·생성 횟수, E-015 구현, 독립 기대값, 측정 누락, cdp-eval 타임아웃)을 반영했다. 2회차에서 모두 해소되었고, 새 Major 지적은 없다.
    - 검증(wt-checker): agy 한도가 소진되어 HERDR-SETUP 4절의 대체 규칙대로 Sonnet 5.5 high로 바꿔 수행했다. 보고서는 `specs/v0.1/verify/phase1/REPORT.md`다.
      - R-1 충족. 탭 이동과 부모 구조 변경 모두에서 같은 `EditorView` 객체와 인스턴스가 유지되었다. 스크롤·선택·커서도 유지되었다. 앱 시험과 checker의 독립 시험이 모두 이 결과였다.
      - R-2 충족. 측정 글꼴은 Consolas 15px다(ch 8.2471, descent 4).
    - D-3(Solid)은 유지한다. R-1이 충족이라 PLAN Phase 1의 React 19 비교 조건(R-1 실패 시)에 해당하지 않으므로, React 비교는 하지 않는다.
  - 검증: wt-checker 보고서와 증거 파일(`r1-*.json`·`.png`, `r2-*.json`·`.png`)이 `specs/v0.1/verify/phase1/`에 있는지 확인했다.
  - 특이사항: 커밋은 leader가 한다.
  - 상태: Phase 1 완료 (2026-11-01). R-1, R-2 모두 충족이다(PLAN "Phase를 마친 것" 규칙).

### Phase 2 — 창·단위·테마·키맵 기반

- **R-8 대상 토큰·화면 샘플 목록 고정** (2026-11-01, Phase 2 시작 때)
  - 무엇을 했나: SPEC R-8의 규칙대로 대상 토큰과 화면 샘플을 원문에서 뽑아 여기에 고정했다. 원문은 03-THEME-ICONS 1.3절(T-40), 1.2절(T-26), 2.3절(T-08)이다. 고정한 뒤에는 바꾸지 않는다. 판정 때 덤프에서 빠지면 실패다.
  - 결과:
    - **대상 토큰** — 1.3절(T-40) 가운데 v0.1 화면 요소에 쓰이는 것만 골랐다. v0.1 화면 요소는 R-4 타이틀 바·창 버튼, R-9 영역 뼈대, R-2 편집기다.
      | 출처 행 | 토큰 | v0.1 화면 요소 |
      | --- | --- | --- |
      | T-40.1 | `background` | 창 맨 바닥(L-11) |
      | T-40.2 | `border`, `border.variant` | 영역 사이 1px 선(L-16, A-11.2, A-11.5) |
      | T-40.5 | `ghost_element.hover`, `ghost_element.active` | 창 버튼 hover·누름(L-84) |
      | T-40.8 | `text` | 타이틀 바 글자, 창 버튼 글자(L-84, T-08.15·T-08.21) |
      | T-40.15 | `title_bar.background`, `title_bar.inactive_background` | 타이틀 바(L-81) |
      | T-40.16 | `status_bar.background` | 상태 표시줄 |
      | T-40.17 | `tab_bar.background`, `tab.active_background`, `tab.inactive_background` | Pane 탭 바와 탭(Phase 1 PoC 탭) |
      | T-40.19 | `panel.background` | 사이드바, 왼쪽 Dock |
      | T-40.21 | `scrollbar.thumb.background`, `scrollbar.thumb.hover_background`, `scrollbar.thumb.active_background`, `scrollbar.thumb.border`, `scrollbar.track.background`, `scrollbar.track.border` | 편집기 스크롤바 |
      | T-40.22 | `editor.background`, `editor.foreground` | 편집기 바탕·글자 |
      | T-40.23 | `editor.gutter.background`, `editor.line_number`, `editor.active_line_number`, `editor.active_line.background` | 줄 번호 칸, 현재 줄 |
      | T-40.26 | `players[0].cursor`, `players[0].selection` | 캐럿, 선택 영역 |
    - 1.3절의 나머지 행(T-40.3·4·6·7·9~14·18·20·24·25·27·28)은 v0.1 화면에 그 요소가 없어서 대상에서 뺐다.
    - **대체 규칙(1.2절 T-26)** — 위 토큰에 걸리는 것만이다.
      - T-26.3: `scrollbar.thumb.active_background` ← `scrollbar.thumb.background`. 6개 테마 모두다.
      - T-26.8: `scrollbar.thumb.border` ← `#3b3d45`. Catppuccin 4종(`null`)이다.
      - 위 토큰 가운데 원본에 값이 없거나 `null`인데 T-26에 규칙이 없는 것은 판정 때 덤프에 `missing`으로 남기고 실패로 본다.
    - **화면 샘플** — 스크린샷 색 판정 대상이다. Mocha와 Latte만 본다(D-11). 상태는 기본, 그리고 1.3절에 적힌 상태다.
      | 샘플 | 요소·상태 | 토큰 | Latte 관찰 항목 |
      | --- | --- | --- | --- |
      | S-1 | 타이틀 바 바탕, 창 활성 | `title_bar.background` | T-08.7 |
      | S-2 | 타이틀 바 바탕, 창 비활성 | `title_bar.inactive_background` | — |
      | S-3 | 창 버튼 글리프 | `text` | T-08.15, T-08.21 |
      | S-4 | 최소화 버튼 hover 배경 | `ghost_element.hover`를 `title_bar.background` 위에 합성 | — |
      | S-5 | 사이드바 바탕 | `panel.background` | T-08.8 |
      | S-6 | 왼쪽 Dock 바탕 | `panel.background` | T-08.8 |
      | S-7 | 상태 표시줄 바탕 | `status_bar.background` | T-08.9 |
      | S-8 | 영역 사이 선(타이틀 바 아래, 상태 표시줄 위, 사이드바 오른쪽) | `border` | T-08.13 |
      | S-9 | Pane 탭 바 바탕 | `tab_bar.background` | — |
      | S-10 | 활성 탭 / 비활성 탭 | `tab.active_background` / `tab.inactive_background` | T-08.11 / T-08.10 |
      | S-11 | 편집기 바탕 | `editor.background` | T-08.11 |
      | S-12 | 현재 줄 바탕 | `editor.active_line.background`를 `editor.background` 위에 합성 | — |
      | S-13 | 선택 영역 | `players[0].selection`을 `editor.background` 위에 합성 | — |
    - 닫기 버튼 hover `#E81120`(L-84)는 테마 토큰이 아니라서 이 목록이 아니라 R-4에서 본다.
  - 검증: 원문 표 행을 하나씩 대조해 옮겼다. 수치와 색 값은 적지 않았다. 값은 테마 JSON과 T-26 규칙에서 나온다.
  - 특이사항: One Light는 토큰 덤프만 본다(D-11). 화면 샘플은 없다.

- **Phase 2 구현: 창·타이틀 바·키맵·테마·영역 뼈대** (2026-11-01)
  - 무엇을 했나:
    - 창(R-3, R-4, D-7, D-13):
      - `tauri.conf.json`을 `decorations: false`, `shadow: true`, 1440×852(A-30.2)로 바꿨다.
      - `src-tauri/src/caption.rs`를 새로 만들었다(`windows` 0.62.2, 03-tauri 3.1 목록).
        - DWM 둥근 모서리를 요청한다.
        - `WRY_WEBVIEW`에서 최대화 버튼 칸을 `SetWindowRgn`으로 뚫는다. 그 칸에서 최상위 창이 `WM_NCHITTEST` → `HTMAXBUTTON`을 돌려주고, 버튼(Segoe Fluent Icons U+E922/U+E923, 36×32, 10px)을 GDI로 그린다.
        - 누름·놓음을 직접 처리해 최대화·복원한다.
      - D-7은 "스냅 팝업이 안 되면 `WM_NCHITTEST`를 더한다"고 했다. 처음부터 넣은 이유는 이렇다. 창 구조를 읽기 전용으로 확인하니 `Tauri Window` → `WRY_WEBVIEW` → `Chrome_WidgetWin_0`(앱 스레드) → `Chrome_WidgetWin_1`(WebView2 브라우저 프로세스) 순서였다. 즉 HTML만으로는 hit test가 다른 프로세스 창으로 간다.
      - 명령 `caption_set_colors`, `caption_debug`를 넣었다(`serde_json`만 사용).
      - capability는 쓰는 것만 개별로 허용했다: `core:window:allow-minimize`, `allow-close`, `allow-start-dragging`, `allow-internal-toggle-maximize`.
    - 영역 뼈대(R-9):
      - `src/shell/Shell.tsx`, `src/shell/styles.ts`. 사이드바 | Workspace(타이틀 바 → 본문(왼쪽 Dock → 가운데) → 상태 표시줄) 구조이고, 오른쪽 사이드바와 오른쪽·아래 Dock은 없다.
      - 루트 글자 16px(L-01), `rem()` = px ÷ 16(L-02).
      - Phase 1 PoC를 가운데 영역으로 옮겼다.
      - `:hover` 규칙은 carrier nonce를 단 `<style>`(`zl-app-styles`)에 넣었다. CSP는 그대로다.
    - 테마(R-8, D-11):
      - `src/theme/`(`theme.ts`, `tokens.ts`, `color.ts`, `bootstrap.ts`). JSON → T-26 대체(T-26.3, T-26.8) → `:root` CSS 변수 순서로 적용한다. CM6 light/dark 플래그는 compartment로, 네이티브 최대화 버튼 색은 `caption_set_colors`로 바꾼다.
      - 편집기·탭·스크롤바 색은 모두 토큰 변수로 바꿨다.
      - 테마 JSON: catppuccin/zed v0.2.27 `catppuccin-mauve.json`과 LICENSE(MIT)를 `src/theme/assets/catppuccin/`에 넣었다. 받은 파일과 설치된 Zed 확장 파일의 sha256이 같다. 출처는 `src/theme/NOTICE.md`에 적었다.
    - 키맵(R-6, R-7, D-5, D-6):
      - `src/keymap/context.ts`, `engine.ts`가 I-702, I-703, I-001, I-704 규칙 엔진이다.
      - `engine.test.ts`는 Node 24 `node --test`로 돌린다(`npm run test:keymap`). 패키지는 더하지 않았다.
      - `dispatch.ts`: 캡처 단계 `keydown`으로 엔진에 먼저 넘기고, R-20 키를 막는다. 브라우저 우클릭 메뉴도 막는다. 키 로그와 브라우저 신호(새로고침·인쇄·이동·확대)를 기록한다.
      - D-6 ① 확인: wry 0.57.1에는 `with_browser_accelerator_keys`가 있다. 하지만 Tauri 2.12.5는 설정이나 빌더로 노출하지 않는다(registry 소스 검색). `with_webview`로 쓰려면 `webview2-com` 크레이트가 필요한데, 이는 목록 밖이다. 그래서 ②를 택했다.
    - 검증 수단:
      - `src/poc/probe2.ts`(`__poc.theme`, `.shell`, `.keymap`, `.caption`)
      - `tools/win-input.ps1`(SendInput, 스캔 코드 포함)
      - `tools/capture.ps1`(gpui 도구를 옮겼고 기본값만 바꿨다)
      - `specs/v0.1/verify/phase2/HOWTO.md`
  - 결과:
    - 추가 의존성(모두 03-tauri 3.1 목록): `windows` 0.62.2(cfg windows), `serde_json` 1.0.154. npm 패키지 추가는 없다.
    - `tsconfig.json`에 `resolveJsonModule`·`allowImportingTsExtensions`를 넣고, `*.test.ts`는 tsc 대상에서 뺐다.
  - 검증 (wt-coder 자체 확인, 판정은 wt-checker):
    - 기본 검사: `npm run typecheck` 오류 없음, `npm run build` 성공, 번들에 `style="` 없음, `cargo check` 경고 0, `npm run test:keymap` 14/14 통과.
    - R-3: dev 앱에서 SendInput으로 최대화 버튼에 머물렀을 때 스냅 레이아웃 플라이아웃이 버튼 아래에 나왔다(`native.hover: true`). 타이틀 바 더블클릭으로 최대화(frame 0,0,2880×1704)와 복원이 되었다.
    - R-6: 실제 키 입력 12개(Ctrl+P 제외)가 모두 `isTrusted`, `action`, `prevented`였고 새로고침·확대·이동 신호는 없었다.
    - R-8: Mocha·Latte 대상 토큰 27개가 모두 적용되었다(`missing` 0). 대체는 T-26.3·T-26.8 둘이다. 전환 시간 total은 약 30~33ms다(기록용).
    - 회귀: 새 셸 안에서 R-1 이동·구조 변경과 R-2 측정이 모두 `pass: true`였다.
  - 특이사항:
    - 자체 확인 중에 `caption.rs`의 교착을 찾아 고쳤다. 창을 복원할 때 WM_SIZE를 처리하면서 `STATE` lock을 잡은 채 `SetWindowRgn`을 부르면, 같은 스레드의 WebView subclass가 다시 lock을 기다려 dev 앱이 멈췄다. 창 프로시저는 `try_lock`만 쓰도록 바꿨다. 그 뒤 tauri dev가 다시 빌드해 새로 띄웠다.
    - SendInput에 스캔 코드가 없으면 `KeyboardEvent.code`가 비어 엔진이 키를 못 읽었다. 그때 F5·Ctrl+R로 새로고침이 일어났다. 도구에 스캔 코드를 넣고, 엔진은 `code`가 비면 `key`로 읽도록 고쳤다(테스트 추가).
    - One Light: 원본(`zed-industries/zed` `assets/themes/one/one.json`)은 MIT(`assets/themes/LICENSES`)지만 GPL 저장소 안에만 있다. 지시대로 가져오지 않고 사용자 결정을 기다린다. 그동안 R-8의 One Light 항목은 판정 대기다.
    - 리뷰·검증·커밋 전이므로 Phase 2는 진행 중이다.

- **One Light 테마 가져오기(D-14)와 R-8 마무리** (2026-11-01)
  - 무엇을 했나: leader 위임 결정(2026-11-01)에 따라 `zed-industries/zed` 커밋 `14b7b0ef3764d62a85070c8b5ccea105a2ad3235`의 `assets/themes/one/one.json` 하나만 `src/theme/assets/one/one.json`으로 가져왔다(sha256 `ed6cf880…7695`).
    - 같은 커밋 `assets/themes/LICENSES`의 One Dark·One Light 절(MIT 전문, Copyright (c) 2014 GitHub Inc.)과 출처 URL을 `src/theme/assets/one/LICENSE`에 남겼다. `LICENSES` 파일은 scratchpad에서 읽기만 했고 프로젝트에 넣지 않았다.
    - `src/theme/NOTICE.md`를 고쳤다. 테마 엔진에 One 패밀리를 더했다.
    - DECISIONS에 D-14를 더했다.
  - 결과: `__poc.theme.list()`에서 세 테마가 모두 `bundled: true`다.
  - 검증:
    - One Light 적용 뒤 대상 토큰 27개가 모두 `:root`에 적용되었다. 원본에 없는 것은 `scrollbar.thumb.active_background` 하나이고, T-26.3으로 `scrollbar.thumb.background` 값(`#383a414c`)을 받았다. 전환 total은 17.5ms였다(기록용). typecheck와 build를 통과했다.
    - Mocha로 되돌린 뒤 R-2 `measure()`에서 E-011 "강조 오른쪽 끝 = 편집기 오른쪽 끝" 항목이 실패했다. Phase 2 셸에서 Pane이 좁아져 줄이 편집기보다 길어졌고, 강조가 내용 끝까지 이어졌기 때문이다(1114 > 974).
    - E-011 원문 "오른쪽 끝까지"에 맞춰 probe 판정을 "보이는 오른쪽 끝에 닿는다(≥, ±1)"로 고쳤다. 다시 재니 R-2 `failed: []`, R-1 이동 `pass: true`였다.
  - 특이사항: 없음.

- **Phase 2 리뷰 1회차 지적 10건 반영** (2026-11-01)
  - 무엇을 했나: leader가 전부 채택한 wt-reviewer 지적 10건을 원문(01-zed ID)과 대조한 뒤 반영했다. CSP·capabilities는 그대로이고 패키지 추가는 없다.
    - 1/Major MIT 고지 누락: 고지 파일을 `public/licenses/`로 옮겼다. 빌드하면 `dist/licenses/`로 복사되어 앱에 같이 들어간다(T-17).
      - `NOTICE.md`(출처·커밋·sha256)
      - `catppuccin-zed-LICENSE`
      - `zed-one-theme-LICENSE`
    - 2/Major 전환 측정: `caption_set_colors` IPC가 끝날 때까지 기다린 뒤 두 프레임을 잰다. 결과에 `captionApplied`·`captionOk`가 있다(`bootstrap.ts` `captionApplied()`).
    - 3/Major 숫자패드 +: `ctrl-+`(NumpadAdd)를 예약 키와 시험 바인딩에 더했다. `win-input.ps1`에 `numadd`·`numsub`를 넣었다.
    - 4/Major null로 해제한 연속 키: 접두사 대기는 더 긴 시퀀스 가운데 I-703 적용 뒤에도 이기는 바인딩이 있을 때만 한다.
    - 5/Major 인수 비교: `sameArgs`를 구조 비교로 바꿨다(객체 키 순서 무시).
    - 6/Major WM_PRINT: `WM_PRINT`·`WM_PRINTCLIENT`에서 받은 HDC에 네이티브 최대화 버튼을 그린다(`paint_button_to`).
    - 7/Major 표시 키: I-704 조회에서, 접두사가 현재 컨텍스트에서 다른 액션을 실행해 입력할 수 없는 연속 키는 뺀다. 각 접두사가 `pending`이어야 한다.
    - 8/Major 대상 고정: `win-input.ps1`에 `-ProcessId`·`-TargetHwnd`를 넣었다. 지정이 없을 때 창이 여럿이면 오류로 끝난다. 결과에 `pid`·`hwnd`를 넣었다. HOWTO에 CDP 포트·capture `-Hwnd` 고정법을 적었다.
    - 9/Minor 닫기 누름: L-84 "누름은 각각 80% 불투명"에 따라 글자도 `rgba(255,255,255,0.8)`로 했다.
    - 10/Major 스크롤바 테두리: E-031에 따라 세로 트랙 왼쪽에 1px `scrollbar.track.border`를 넣었다. E-032에 따라 손잡이 테두리는 `scrollbar.thumb.border`, 각진 모서리로 했다. 손잡이 테두리 두께는 E-032에 적혀 있지 않아 1px로 정했다(판단, 사람 확인 필요).
  - 결과: 위 파일들과 HOWTO(0절, 5절, 7절, 7a절 신설)를 고쳤다.
  - 검증:
    - 기본 검사: `npm run test:keymap` 17/17 통과(새 테스트 3개: null 연속 키, 구조 인수 비교, 가려진 접두사). typecheck 오류 없음, build 성공, `dist/licenses/`에 파일 3개, `cargo check` 경고 0.
    - 실제 입력: `ctrl+numadd`·`ctrl+numsub`·`ctrl+=`·`ctrl+-`가 모두 `isTrusted`, `action`, `prevented`였다. 확대 신호는 없었다.
    - 테마 전환: Latte·Mocha 전환에서 `captionOk: true`, `captionApplied` 약 5ms였다.
    - 캡처: `capture.ps1`(PrintWindow)에 네이티브 최대화 버튼이 나왔다. 세로 스크롤바 왼쪽 2 물리 px가 `#1f1f29`(track.border 합성)였다.
    - 도구: `win-input.ps1 -Action state`가 `pid`·`hwnd`를 냈다. dev 앱이 다시 빌드되는 동안에는 창을 찾지 못해 오류로 끝났다(의도한 동작).
    - 회귀: R-1 두 시험과 R-2 `measure()`가 다시 통과했다.
  - 특이사항: 반영하지 않은 지적은 없다.

- **Phase 2 리뷰 2회차 미해소 지적 8 반영: CDP 대상 고정** (2026-11-01)
  - 무엇을 했나: leader 채택에 따라 `tools/cdp-eval.mjs`에 `--pid <zedlike PID>`를 넣었다.
    - `--port`에서 리스닝하는 프로세스와 그 조상 체인을 PowerShell로 구한다(`Get-NetTCPConnection` OwningProcess, `Win32_Process` ParentProcessId). 패키지는 추가하지 않았다.
    - 그 PID가 체인에 없으면 체인을 보여 주며 종료 코드 1로 끝난다.
    - 결과 JSON의 `target`에 `pid`, `port`, `listener`, `chain`을 남긴다.
    - HOWTO 0절에 고정 절차를 적었다. 순서는 `win-input.ps1 -Action state`로 pid·hwnd를 얻고, `-ProcessId`, `--pid`, `capture.ps1 -Hwnd`에 같은 값을 쓰는 것이다. 창 크기 비교도 이렇게 고정한 대상끼리만 하도록 고쳤다.
  - 결과: `tools/cdp-eval.mjs`와 HOWTO가 바뀌었다.
  - 검증:
    - `--pid 17684`(dev 앱): 통과했다. 체인은 msedgewebview2.exe(11236) ← zedlike.exe(17684)였다.
    - `--pid 4`: 체인을 보여 주고 종료 코드 1로 끝났다.
  - 특이사항: 없음.

- **Phase 2 검증 결과 반영: I-703 수정, 색 판정 해석(D-15), win-input 전면 창 확인** (2026-11-01)
  - 무엇을 했나: leader 위임 결정에 따라 세 가지를 고쳤다.
    1. R-7 I-703(REPORT 116~122행 불충족): 루트 INTENT 원칙 "Zed와 같아야 한다"에 따라 `src/keymap/engine.ts`의 null 처리를 Zed 동작으로 바꿨다. Zed 코드는 복사하지 않았고 동작만 맞췄다.
       - 후보를 I-702 순서(깊이 → 나중 등록)로 정렬한다.
       - 그 순서에서 앞선 null은 뒤의 같은 키 후보를 모두 해제한다. 깊이가 얕아도 해제하고, 출처 등급이 같거나 낮은 것만 해제한다.
       - 얕은 null은 깊은 바인딩을 못 끈다. 그 바인딩이 null보다 앞에 오기 때문이다.
       - 출처 등급 규칙(사용자 > 덧씌움 > 기본, null에만 적용)은 그대로다.
       - 테스트를 고쳤다. 잘못 고정된 `I-703: null in one context leaves other contexts alone`를 `I-703: a deeper null disables a shallower binding of the same key`로 바꾸고 기대값을 `none`으로 바로잡았다. 포커스가 Editor 밖이면 Workspace 바인딩이 실행되는 사례도 넣었다.
       - 테스트를 더했다: 깊은 null ↔ 나중에 등록된 얕은 바인딩, 얕은 null ↔ 깊은 바인딩.
    2. 색 판정(R-8): REPORT 10~17행의 디스플레이 색 변환 관찰에 따라 DECISIONS에 D-15를 더했다. 주 기준은 같은 토큰 CSS를 칠한 기준 견본과 같은 방법으로 잰 값 대비 ±1이고, 원본 JSON 직접 대비는 참고값이다.
    3. `tools/win-input.ps1`:
       - 키 조합과 마우스 버튼(누름·뗌)을 보낼 때마다 직전에 `GetForegroundWindow`가 대상 HWND인지 확인한다(`Guard`). 아니면 보내지 않고 오류로 끝난다.
       - 전면으로 가져올 때 쓰던 Alt 탭을 없앴다. 그 Alt는 그때 앞에 있던 다른 앱으로 들어갈 수 있었다. 전면으로 가져오지 못하면 아무 입력도 보내지 않고 오류로 끝난다.
  - 결과: `engine.ts`, `engine.test.ts`, `win-input.ps1`, DECISIONS(D-15)가 바뀌었다.
  - 검증:
    - `npm run test:keymap` 19/19 통과, typecheck 오류 없음.
    - checker의 재현 스크립트(`r7-i703-probe.mts`)에서 "Editor null + Workspace 바인딩"은 `none`, "Workspace null + Editor 바인딩"은 `editor::Act`였다.
    - `win-input.ps1 -Action state`가 대상 창 전면에서 정상 동작했다. 거부 경로는 다른 앱에 포커스를 줘야 시험할 수 있어 실제로 일으키지 않았다. 코드 근거는 `Guard`, `SendMouse`, `Combo`다.
  - 특이사항: R-7은 다시 검증받아야 한다.

- **tools/win-input.ps1 리뷰 지적 2건 반영** (2026-11-01)
  - 무엇을 했나: leader가 채택한 지적 2건을 반영했다.
    - 1/Major: 전경 확인이 버튼 입력에만 있어 `MoveTo`·`Glide`는 전경이 바뀐 뒤에도 마우스 이동을 보냈다. `SendMouse`가 이동을 포함한 모든 마우스 입력 직전에 `Guard`를 부르도록 바꿨다. `Combo`는 키 누름·뗌을 `SendKey`로 하나씩 보내고, 매번 직전에 `Guard`를 부른다.
    - 2/Major: `LEFTDOWN` 뒤 전경이 바뀌면 `LEFTUP`의 `Guard`가 예외를 던져 버튼이 눌린 채 끝날 수 있었다. 이 도구가 누른 마우스 왼쪽 버튼과 키를 추적하게 했다(`SendMouse`, `SendKey`). 스크립트의 `finally`에서 `ReleaseAll`이 전경과 무관하게 모두 뗀다. 뗀 것이 있으면 경고와 결과 JSON `releasedOnExit`에 남긴다.
  - 결과: `tools/win-input.ps1`이 바뀌었다(`Guard` 주석, `SendMouse`, `Combo`, 새 `SendKey`·`ReleaseAll`, 스크립트 try/finally, 도움말).
  - 검증:
    - `-Action state`가 정상 동작했다.
    - `-Action keys -Keys "f6"`을 보내니 앱 키 로그에 `f6 true action true`가 남았고, `releasedOnExit`는 없었다.
    - 거부 경로와 강제 해제 경로는 다른 앱에 포커스를 줘야 일으킬 수 있어 실제로 시험하지 않았다.
  - 특이사항: 없음.

- **Phase 2 리뷰·검증 결과와 완료** (2026-11-01)
  - 무엇을 했나: PLAN의 Phase 끝 순서(리뷰 → 검증 → PROGRESS → 커밋)에서 리뷰·검증 결과와 leader 결정을 기록했다.
  - 결과:
    - 리뷰(wt-reviewer):
      - 1회차 지적 10건을 모두 반영했다. 2회차에서 9건이 해소되었고, 남은 8번(CDP 대상 고정)은 3회차에서 해소되었다.
      - 검증 뒤 수정분(I-703 키맵, win-input 전경 확인) 리뷰: keymap은 지적이 없었다. win-input 지적 2건(이동 입력 전경 확인, 눌림 상태 해제)은 반영했고 leader가 코드로 해소를 확인했다. Codex 한도가 1%만 남아 재리뷰 대신 leader가 확인했다.
    - 검증(wt-checker): `specs/v0.1/verify/phase2/REPORT.md`
      - R-3, R-4, R-5, R-6, R-8, R-9는 충족이다.
      - R-7은 불충족이었다(I-703 깊은 `null`이 얕은 바인딩을 해제하지 않음). 엔진을 Zed 동작대로 고친 뒤 `specs/v0.1/verify/phase2/REPORT-R7-rerun.md`에서 충족이 되었다. 재검증은 agy Flash high checker가 했다.
    - leader 결정(위임, 2026-11-01):
      - 색 판정: 같은 토큰 CSS를 칠한 기준 견본 대비 ±1을 주 기준으로 한다(D-15). 원본 JSON 직접 대비는 참고값이다.
      - E-032 손잡이 테두리 1px: 원문에 값이 없어 구현에서 정한 값이다. 최종 보고에서 사용자 확인을 요청한다.
      - R-4 네이티브 최대화 버튼 누름 픽셀: 누른 채로 찍을 수 없어 판정 불가다. 색 값은 `caption_debug`·`lastColors`의 `pressed`가 토큰 합성값과 일치한다(값만 일치).
    - 사고와 대응: 검증 중 `win-input.ps1`의 입력이 다른 앱(workbench-gpui 창)에 들어간 일이 있었다. 대응으로 `win-input.ps1`을 다음과 같이 보강했다.
      - 대상 PID·HWND 고정, CDP `--pid` 고정
      - 모든 마우스·키 입력 직전 전경 확인(`Guard`)
      - 전면으로 가져올 때 Alt 탭 제거
      - 누른 버튼·키를 추적하고 `finally`에서 해제(`ReleaseAll`)
  - 검증: 두 보고서 파일이 있는지 확인했다. `npm run test:keymap` 19/19 통과다.
  - 특이사항: 커밋은 leader가 한다.
  - 상태: Phase 2 완료 (2026-11-01). R-3~R-9 모두 충족이다(R-7은 재검증 충족, PLAN "Phase를 마친 것" 규칙).

### Phase 3 — 문법 WASM 로드 PoC와 P0 정리

- **R-10 술어 목록 고정** (2026-11-01, Phase 3 시작 때)
  - 무엇을 했나: SPEC R-10 규칙대로, 이 PC의 Zed HTML 확장(`C:/Users/nampl/AppData/Local/Zed/extensions/installed/html/languages/html/`, 확장 0.3.2)에서 `.scm` 6개에 실제로 쓰인 술어를 원문으로 뽑아 여기에 고정했다. 고정한 뒤에는 바꾸지 않는다.
  - 결과:
    | 술어 | 파일·쓰임 | 고정 사례(입력 → 기대) |
    | --- | --- | --- |
    | `#match?` | injections.scm: `@_attribute_name "^style$"` | P-1 `<p style="color:red">` → injection.content "color:red", injection.language "css" / P-2 `<p class="color:red">` → 속성 매치 없음 |
    | `#match?` | injections.scm: `@_attribute_name "^on[a-z]+$"` | P-3 `<b onclick="go()">` → injection.content "go()", injection.language "javascript" / P-4 `<b onClick="go()">` → 속성 매치 없음(대문자 C) |
    | `#set!`(인수 2개) | injections.scm: `injection.language` ×5 | P-5 `<script>let x = 1;</script>` → setProperties {"injection.language":"javascript"}, content "let x = 1;" |
    | `#set!`(인수 1개) | brackets.scm: `rainbow.exclude` ×5 | P-6 `<a href="x">` 따옴표 쌍 → setProperties에 키 "rainbow.exclude"(값 null) |
    | `#set!`(인수 1개) | brackets.scm: `newline.only` ×1 | P-7 `<div></div>` → 시작·끝 태그 쌍에 키 "newline.only"와 "rainbow.exclude" |
    - 03-tauri R-03이 든 `#any-of?`는 이 6개 파일에 쓰이지 않는다.
    - highlights.scm, indents.scm, outline.scm, overrides.scm에는 술어가 없다.
    - overrides.scm에는 Zed 고유 지시문(`.inclusive` 등)이 없고, 일반 캡처(`@comment`, `@string`, `@default`)만 있다.
  - 검증: 파일 6개 원문을 읽어 옮겼다.
  - 특이사항: 없음.

- **Phase 3 구현: 문법 WASM 로드, 경로 검사 프로토콜, CSP, 증분 강조, P0 요약 초안** (2026-11-01)
  - 무엇을 했나:
    - 코어(R-11, D-9, D-16): `src-tauri/src/ext_protocol.rs`를 새로 만들었다.
      - 커스텀 스킴 `zlext`(`http://zlext.localhost/<id>/<rel>`)로 확장 파일을 준다.
      - A-55.2 검사: 확장 루트별 상대 경로만 허용하고, 절대 경로·`..`·루트 밖을 가리키는 링크를 거부한다. 링크는 정규화한 경로로 판정한다.
      - CORS는 앱 출처에만 연다. 거부 이유는 `X-Zedlike-Denied` 헤더(expose)에 담는다.
      - 단위 테스트 `a55_2_rules`를 넣었다.
      - 명령: `ext_check`, `ext_roots`, `dev_ext_add_root`(디버그 빌드 전용)
    - CSP(D-16): `script-src 'self' 'wasm-unsafe-eval'`, `connect-src`·`img-src`에 `http://zlext.localhost`만 더했다(`csp`, `devCsp`).
    - 문법(R-10, D-8, D-9): `src/syntax/grammar.ts`를 새로 만들었다.
      - `web-tree-sitter` 0.27.1(03-tauri 3.2 목록, MIT)로 Zed HTML 확장의 `grammars/html.wasm`과 `.scm` 6개를 `zlext`로 받는다. 파일은 복사하지 않는다.
      - 받은 그대로 로드하면 실패한다. `dylink.0` NEEDED에 `libc.so`가 있어 로더가 그 파일을 받으려 하기 때문이다.
      - 그래서 **메모리 사본에서만** NEEDED 하위 섹션의 종류 바이트(오프셋 26)를 0x7f로 바꿔 건너뛰게 했다. 문법이 쓰는 libc 함수는 런타임이 이미 내보낸다(`__assert_fail`만 없고 지연 바인딩이다). 이 우회는 `rawLoad`·`shim`으로 덤프에 남긴다.
    - 강조와 증분 연동(R-10, R-12): `src/syntax/highlight.ts`를 새로 만들었다.
      - CM6 ViewPlugin이 트랜잭션마다 `Tree.edit`를 부르고, 이전 트리를 넘겨 `parse`한다(입력은 콜백으로 64KB씩).
      - 장식은 `visibleRanges` 안에서만 만든다.
      - 캡처 → 테마 키는 T-27.1 규칙이다. 테마별 `syntax` 색은 `:root` 변수와 nonce를 단 클래스로 준다. 테마를 바꾸면 다시 그린다.
      - Lezer(`@codemirror/language`)는 쓰지 않는다.
    - 탭: `h`(새로 쓴 HTML 예제), `hbig`(약 10MB, `bigEdit`가 만든다)
    - 검증 수단:
      - `src/poc/probe3.ts`(`__poc.syntax`, `__poc.ext`)
      - `tools/make-ext-fixture.ps1`(임시 폴더의 시험 확장, 정션·심볼릭 링크)
      - `specs/v0.1/verify/phase3/HOWTO.md`
      - R-13 요약 초안 `specs/v0.1/verify/phase3/P0-SUMMARY.md`
  - 결과:
    - 추가 패키지: npm `web-tree-sitter` 0.27.1(정확한 버전 고정)
    - cargo 의존성 추가는 없다(`tauri::http` 사용).
  - 검증 (wt-coder 자체 확인, 판정은 wt-checker):
    - 기본 검사: typecheck 오류 없음, build 성공(`web-tree-sitter.wasm` 포함), `cargo check` 경고 0, `cargo test --lib` 1/1, `npm run test:keymap` 19/19
    - R-10 (dev 앱, CDP `--pid` 고정):
      - `rawLoad` 실패, `shim` 적용 뒤 ABI 14로 로드되었다. 예제 HTML 파싱에 오류가 없었다.
      - `.scm` 6개가 모두 컴파일되었다(패턴 수 5/8/3/5/2/3).
      - 술어 P-1~P-7이 모두 맞았다.
      - T-27.1 키: `punctuation.bracket.html`→`punctuation.bracket`, `punctuation.delimiter.html`→`punctuation.delimiter`, 나머지는 같은 이름이었다(Mocha·Latte).
      - Markdown·JSON은 `unknown-extension`이라 대기다.
    - R-11:
      - 프로토콜 C-1~C-9가 모두 기대대로였다. C-9는 정션을 통한 루트 밖 접근으로 `link-escapes-extension-root` 거부였다.
      - 명령 K-1~K-5도 모두 기대대로였다.
      - 확장 SVG(`catppuccin-icons/icons/latte/_file.svg`)가 16×16으로 로드되었다.
      - 빌드 앱(`http://tauri.localhost`, CSP 적용)에서 CSP 위반 0, security 로그 0이었다(`specs/v0.1/verify/phase3/csp-built-check.json`).
    - R-12 (10MB, 루트 `document`, 오류 없음):
      - 첫 파싱 1551ms
      - 트랜잭션 5개 모두 `treeEditCalls: 1`, `oldTreePassed: true`
      - 증분 파싱 중앙값 98ms, 장식 1.2ms, 화면 반영 중앙값 117ms
      - 맨 위·가운데 모두 보이는 범위 밖 장식 0
    - 회귀: R-1 두 시험, R-2 `measure()`(`failed: []`), 테마 전환(`captionOk: true`)이 통과했다.
  - 특이사항:
    - `web-tree-sitter` 0.27.1 단위: `QueryOptions.startIndex/endIndex`는 바이트(코드 단위 × 2)이고, Node·Edit은 코드 단위다. Node로 재현했다. 처음에는 이를 몰라 가운데 범위 장식이 0이었고, 범위를 × 2로 넘겨 고쳤다.
    - 측정용 큰 HTML 생성기가 처음에 `<body>` 줄을 반복해 루트가 ERROR가 되었다. 그래서 가운데 장식 0, 증분 파싱 약 250ms가 나왔다. 생성기를 고친 뒤 다시 쟀다.
    - 심볼릭 링크는 이 계정 권한으로 만들지 못해(관리자 권한 필요) 디렉터리 정션으로 시험했다.
    - 첫 `addRoot` 호출에서 경로 이스케이프를 잘못해 엉뚱한 루트 하나가 이 dev 세션의 루트 목록에 남았다. 존재하지 않는 경로라 영향은 없고, 앱을 다시 시작하면 사라진다.
    - 코어 대안(D-8): `tree-sitter` 크레이트로 `.wasm` 문법을 읽으려면 03-tauri 3.1에서 제외된 `wasmtime`이 필요하다. 그래서 시험하지 않고 분석만 했다(P0-SUMMARY "R-19 관찰").
    - **사용자 확인 필요**: 구문 강조 구조(D-8)를 유지하는 조건은 메모리 안 dylink 우회를 받아들이는 것이다. 판단은 P0-SUMMARY "구조 판단"에 있다.
    - 리뷰·검증·커밋 전이므로 Phase 3은 진행 중이다.

- **중지·인계 (2026-11-02, 사용자 지시)**
  - 무엇을 했나: 사용자가 "우선 순위에서 다른 작업을 먼저 해야 함니다. 현상태로 마무리하고, 다음에 새 세션에서 작업할 수 있도록 마무리 해 주세요."라고 지시했다. 그래서 현재 상태를 로컬 WIP 커밋으로 남겼다(push는 하지 않았다).
    - 리뷰 1회차 지적을 `specs/v0.1/verify/phase3/REVIEW-R1.md`로 옮겼다.
    - leader 도구(`approve-loop.sh`, `review-generic.md`)를 `docs/herdr/`로 옮겼다.
  - 상태:
    - 구현과 wt-coder 자체 확인은 끝났다.
    - 리뷰 1회차 10건은 반영하던 중에 중지했다(2026-11-01 13:50쯤). 지적마다 반영되었는지는 확인하지 않았다.
    - 리뷰 2·3회차, wt-checker 판정(R-10~R-13), Phase 3 완료 커밋이 남았다.
  - 재개 순서:
    1. `git diff db5e9de -- tools/ src/ src-tauri/ specs/v0.1/verify/phase3/`를 REVIEW-R1.md와 대조해 지적별 반영 상태를 확정한다.
       - #1(fixture 삭제 검사)이 해소되었다고 확인하기 전에는 `tools/make-ext-fixture.ps1`을 실행하지 않는다.
       - TEMP 아래에서 실제로 지워진 것이 있는지도 확인한다.
    2. 남은 지적을 wt-coder에게 반영시킨다. 그다음 wt-reviewer 2회차·3회차를 돈다(최대 3회).
    3. wt-runner-app(`wC:p7`)에서 `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222`를 주고 `npm run tauri dev`를 실행한다. 검증 방법은 `verify/phase3/HOWTO.md`에 있다.
    4. wt-checker(agy gemini-3.8-flash-high)가 R-10~R-13을 판정한다.
    5. PROGRESS와 HERDR-DECISIONS를 기록하고, Phase 3 완료 커밋을 한 뒤 사용자에게 최종 보고를 한다.
  - 최종 보고 때 사용자에게 확인받을 것:
    - E-032 손잡이 테두리 1px: 원문 값이 없다.
    - html.wasm `libc.so` 메모리 우회를 받아들일지 (D-8 유지 조건)
    - Phase 2 입력 사고 뒤 workbench-gpui 창 상태
    - R-4 기본 최대화 버튼 눌림 픽셀: 판정 불가
    - Markdown·JSON 문법: 확장이 설치되지 않아 대기
  - 검증: 커밋 뒤 `git status`가 깨끗했다. 고친 문서는 UTF-8로 다시 읽어 확인했다.

## 사용자 요청 작업

### 신규 시작과 v0.1 작성 단계 문서 초안 (2026-11-01)

- 요청: leader를 거친 사용자 지시다. WORKFLOW "1. 신규 시작"과 "2. 작성"에 따라 다음을 쓴다.
  - 루트 문서: `INTENT.md`, `AGENTS.md`, `CLAUDE.md`
  - v0.1 문서: `INTENT.md`, `DECISIONS.md`, `SPEC.md`, `PLAN.md`
- 조치: 다음 순서로 진행했다.
  1. 루트 `INTENT.md` 초안을 workbench-gpui INTENT를 바탕으로 썼다(사용자 결정 2026-11-01). 질문 Q1~Q6의 답을 반영했다.
  2. `AGENTS.md`와 `CLAUDE.md`(`@AGENTS.md` 한 줄)를 썼다.
  3. `specs/v0.1/`를 만들었다.
  4. v0.1 `INTENT.md`를 썼다. 범위는 03-tauri 7절 PoC 1~2단계와 P0의 R-01·R-02다(질문 Q10 B).
  5. `DECISIONS.md` D-1~D-12를 썼다. 질문 Q1~Q10의 답과, leader 비교 뒤 사용자가 고른 Solid를 반영했다.
  6. `SPEC.md` R-1~R-13과 `PLAN.md` Phase 0~3을 썼다.
  7. 원문으로 정할 수 없는 것은 "미정"으로 두고 질문 목록으로 올렸다(scratchpad `coder-questions3.md`).
- 결과: 위 7개 파일이 있다. 루트 세 파일은 사용자 답을 반영했고, v0.1 네 문서는 초안(사람 확인 대기)이다.
- 검증:
  - 저장한 뒤 다시 읽어 UTF-8로 깨지지 않았는지 확인했다.
  - Zed HTML 확장 경로를 읽기 전용으로 확인했다(`C:\Users\nampl\AppData\Local\Zed\extensions\installed\html\`).
- 상태: 진행 중. SPEC·PLAN의 미정 항목은 사람의 답을 기다린다.

### SPEC 질문 Q1~Q12 답 반영과 루트 INTENT의 두 갈래 지시 반영 (2026-11-01)

- 요청: 두 가지다.
  - SPEC 질문 Q1~Q12의 답을 반영해 SPEC·PLAN·DECISIONS의 "미정"을 채운다.
  - 사용자 지시 원문 "zed like editor 에 대하 gpui kit / tauri 기반의 2갈래 동일한 외형/기능/레이아웃을 가진 결과물이 나와야 합니다."를 루트 INTENT에 반영한다.
- 조치:
  - 루트 `INTENT.md`
    - "무엇을 하는가"의 문장을 "workbench-gpui(gpui-kit 기반)와 외형·기능·레이아웃이 같은 결과물을 Tauri 기반으로 만든다. 두 갈래는 같은 앱이다."로 바꿨다.
    - "변하지 않는 원칙"에 "workbench-gpui와 같아야 한다."를 더했다.
  - v0.1 `INTENT.md`: 배경에 위 지시와 "같은 Zed 명세로 대조한다"를 한 줄 더했다.
  - `DECISIONS.md`
    - D-11의 대상에 Catppuccin Latte를 더했다(Q1).
    - D-9에 HTML 확장 경로, 경로 참조(Q11), Markdown·JSON 확장 설치 전 대기(Q10)를 적었다.
    - 미결 사항은 "없음"이 되었다.
  - `SPEC.md`: 결과 값에 "대기"를 더했고, R-2·R-5·R-6·R-7·R-8·R-9·R-10·R-11·R-13의 미정 자리를 Q1~Q7·Q10·Q11의 답으로 채웠다.
  - `PLAN.md`
    - Phase 0과 Phase 순서를 사용자 선택으로 고쳤다(Q8·Q9).
    - Phase 단위 커밋과 미해결 실패 시 멈춤을 더했다(Q12).
    - "대기"는 미해결 실패가 아니라는 규칙을 더했다.
- 결과: 위 문서에서 질문 답으로 채울 "미정"이 남아 있지 않다.
- 검증: 저장한 뒤 "미정" 문자열을 검색했고, UTF-8로 깨지지 않았는지 확인했다.
- 상태: 완료. v0.1 문서는 계속 초안(사람 확인 대기)이다.

### wt-reviewer 문서 리뷰 지적 1~10 반영 (2026-11-01)

- 요청: leader가 채택한 wt-reviewer의 v0.1 문서 리뷰 지적 1~10을 반영한다(HERDR-DECISIONS 위임 범위). 지적 11(루트 INTENT의 기술 이름)은 사용자에게 올려 보류한다.
- 조치: 지적마다 근거 원문(03-tauri 5절·5.1, 01-zed 04-APP-SPEC A-30·A-31.8·A-55.2·4.11절, 01-LAYOUT L-310·L-311, 03-THEME-ICONS 1.2·1.3절·T-27.1, DOCUMENTS.md 5~7절)을 직접 확인하고 다음을 고쳤다.
  - 1 — SPEC R-13: 근거 보고서 위치, 결과별 필수 내용, 구조 판단 줄과 일관성을 판정 조건에 넣었다.
  - 2 — PLAN: "판정을 마친 것"과 "Phase를 마친 것"을 나눴다. Phase 1~3 완료 조건에 "통과, 또는 사용자가 처리를 정함"을 넣었다.
  - 3 — SPEC R-12: 트랜잭션별 `Tree.edit`·이전 트리 전달 로그와 viewport 밖 장식 부재 검사를 넣었다.
  - 4 — SPEC R-10: 술어별 입력·기대·실제 결과와 T-27.1 기대 키 대조를 넣고, 불일치는 실패로 정했다. 술어 목록은 Phase 3 시작 때 PROGRESS에 고정한다.
  - 5 — SPEC R-10: D-9의 `.scm` 여섯 개마다 컴파일 결과를 요구했다.
  - 6 — SPEC R-8: 전환 측정 구간을 03-tauri R-11 확인 방법의 전 단계로 정했다. 끝은 화면에 그려진 시점이다.
  - 7 — SPEC R-11: 허용 단위를 확장 루트로 정하고, 정상 상대·절대·`..`·외부 심볼릭 링크 사례별 허용/거부를 판정하게 했다.
  - 8 — SPEC R-8: 대상 토큰·화면 샘플 목록을 Phase 2 시작 때 1.3절(T-40)·1.2절(T-26)에서 뽑아 PROGRESS에 고정하고, 누락은 실패로 정했다. 목록 자체는 지어내지 않았다.
  - 9 — SPEC 공통 판정 방식: 기준 화면별 창 크기를 나눴다. Mocha는 1440×852(A-30.2), Latte는 1224×740(L-310, 200% 가정)이다.
  - 10 — DECISIONS에 D-13(창 모서리·테두리는 OS에 맡김)을 새로 만들고, SPEC R-5는 D-13을 인용하게 했다.
- 결과: SPEC·PLAN·DECISIONS를 고쳤다. 지적 1~10을 모두 반영했다.
- 검증: 저장한 뒤 다시 읽어 UTF-8로 깨지지 않았는지 확인했다.
- 특이 사항: 지시받은 지적 원문 파일(`review1-findings.txt`)이 비어 있었다(0바이트). 그래서 같은 폴더의 `review1.txt`(wt-reviewer 출력)에 있는 지적 1~11을 원문으로 썼다.
- 상태: 완료. 지적 11은 보류다.

### 리뷰 지적 11 반영: 루트 INTENT에서 기술 이름을 빼고 D-1로 옮김 (2026-11-01)

- 요청: 사용자 결정으로 리뷰 지적 11(루트 INTENT에 구현 기술 이름이 있다, DOCUMENTS.md 3절)을 반영한다.
- 조치:
  - 루트 `INTENT.md` "무엇을 하는가"의 줄을 "workbench-gpui와 외형·기능·레이아웃이 같은 결과물을 다른 방식으로 만든다. 두 갈래는 같은 앱이다."로 바꿨다.
  - gpui-kit 기반·Tauri 기반 두 갈래라는 기술 사실은 v0.1 `DECISIONS.md` D-1의 선택·근거로 옮겼다. 사용자 지시 원문을 인용했다.
- 결과: 루트 INTENT에 기술 이름이 없다. 두 갈래의 기술 사실은 D-1에 있다.
- 검증: 저장한 뒤 다시 읽어 UTF-8로 깨지지 않았는지 확인했다.
- 상태: 완료.

### 리뷰 2회차 미해소 지적 2 반영: Phase 완료 조건 강화 (2026-11-01)

- 요청: leader가 채택한 리뷰 2회차의 미해소 지적 2를 반영한다. 근거는 사용자 결정 Q12 A("미해결 실패가 있으면 멈추고 사용자에게 올림")다.
- 조치: `PLAN.md`를 고쳤다.
  - 공통 규칙 "판정을 마친 것과 Phase를 마친 것은 다르다": Phase 완료는 대응 R-n마다 ① 충족이거나 ② 사용자가 그 R-n을 범위에서 빼거나 다음 버전으로 넘기기로 정해 PROGRESS에 기록된 경우에만 성립한다. "해결 뒤 다시 판정"을 고른 것은 완료가 아니며, 재판정이 충족될 때까지 Phase는 진행 중이다. "대안 채택"은 완료 사유에서 뺐다.
  - Phase 1~3의 완료 조건을 같은 규칙으로 고쳤다.
  - Phase 1의 R-1 실패 조건은 React 비교 결과만 요구하게 바꿨다. D-3을 다시 정한 경우에만 그 DECISIONS 기록을 요구한다.
- 결과: Phase 1~3은 실패한 R-n을 사용자에게 올리기만 해서는 끝낼 수 없다.
- 검증: 저장한 뒤 다시 읽어 UTF-8로 깨지지 않았는지 확인했다.
- 상태: 완료.

### 문서 확정 (2026-11-01)

- 요청: 사용자가 문서를 확정했다(2026-11-01). 원문은 "문서 확정하고 첫 커밋해줘"다.
- 조치:
  - `specs/v0.1/`의 INTENT·DECISIONS·SPEC·PLAN 맨 위 인용 블록의 상태를 "확정 (2026-11-01)"로 바꿨다.
  - PROGRESS는 일을 하면서 쓰는 문서라 템플릿 기준대로 상태를 "진행 중"으로 두었다.
  - 커밋은 하지 않았다. leader가 한다.
- 결과: v0.1 작성 단계 문서 네 개가 확정되었다. 다음은 PLAN Phase 0이다.
- 검증: 다섯 문서의 첫 줄을 다시 읽어 상태를 확인했다.
- 상태: 완료(커밋은 leader 몫).

### Phase 3 중지·인계 정리 (2026-11-02)

- 요청: "우선 순위에서 다른 작업을 먼저 해야 함니다. 현상태로 마무리하고, 다음에 새 세션에서 작업할 수 있도록 마무리 해 주세요."
- 조치: Phase 3 절의 "중지·인계" 항목을 쓰고, REVIEW-R1.md와 docs/herdr/를 저장소로 옮기고, 로컬 WIP 커밋을 했다.
- 상태: 완료. 작업 재개는 사용자가 요청할 때 한다.

## 버전 종료

- 사용자 종료 판단: 진행 중.
- 남은 것: 진행 중.
