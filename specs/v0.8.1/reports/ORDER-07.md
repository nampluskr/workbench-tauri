[BLOCKED] ORDER-07 tauri

(ORDER-07-R1로 다시 쓴 보고. 막힌 것은 #8의 한 사례 — 무한 루프 HTML 미리보기를 닫은 뒤 새 HTML 미리보기가 그려지지 않음. 나머지 기준은 충족, 아래.)

I-7 V3는 debug exe(`4a47bb2` → R1 `eb987f2` → R2 `267cfa5`), #11 전체 회귀는 0.8.1 release exe(`267cfa5`)로 쟀다. 주 모니터 1920×1080 100%, 창 1440×852, One Dark, CDP 마우스·키(창을 앞으로). 교차 원점 프레임 안의 값은 프레임 대상(별도 프로세스)에 CDP로 붙어 읽었다. 근거는 `specs/v0.8.1/verify/ORDER-07/`(시험 HTML `fixtures/`, `v3.json`·`v3-nav.json`·`v3-c.json`·`v3-regress.json`·`v3-regress-fix.json`, PNG, `measure.mjs`·`measure-c.mjs`·`measure-regress.mjs`). 검토·판정은 tauri-checker(07:32 한도가 풀려 돌아옴): C-12 REWORK → C-13(결과는 아래 "검증").

## 고른 방식 (I-7)
- 미리보기 문서를 앱과 다른 원점의 별도 문서로 띄운다: Rust `preview` URI 스킴(`http://preview.localhost/p<n>`, `src-tauri/src/preview.rs`)이 저장된 id에만 200, 그 밖은 204. iframe `sandbox="allow-scripts"`(allow-same-origin 없음 → 불투명 원점). 프레임 CSP를 문서 `<meta>`와 iframe `csp` 속성(CSP Embedded Enforcement, 응답 `Allow-CSP-From: *`) 두 곳에 건다 — `csp` 속성 때문에 페이지가 프레임을 asset URL(정화·CSP 없는 원본)로 옮기는 탈출이 막힌다.
- 이유: v0.8의 `srcdoc`(그리고 blob:·data:)은 앱 CSP를 물려받아 앱 `script-src`를 넓히지 않고는 인라인 스크립트가 돌 수 없다(조건 5와 부딪침).
- 이동: 프레임에 든 문서가 미리보기 자신의 문서인지(문서 머리 스크립트의 `previewReady` 알림)로 판정해, 아니면 미리보기 문서를 다시 띄운다. 5초에 5번을 넘으면 멈추고 토스트("This HTML page keeps navigating away…"). 커스텀 스킴 204는 WebView2에서 이동을 막지 못해 load에서 고쳤다(R1). 탭 전환으로 다시 붙은 load는 세지 않는다(R2).

## 보안 설정 앞(`20cbbf2` = v0.8 끝 `e46a172`)·뒤
| 항목 | 앞 | 뒤 |
|---|---|---|
| `tauri.conf.json` `csp` | `default-src 'self' ipc: http://ipc.localhost; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self' ipc: http://ipc.localhost; img-src 'self' data: asset: http://asset.localhost; frame-src asset: http://asset.localhost; style-src 'self' 'unsafe-inline' asset: http://asset.localhost` | 같음, 단 `frame-src asset: http://asset.localhost preview: http://preview.localhost` |
| `devCsp` | 위 + `connect-src`에 `ws://localhost:1420` | 같음, 단 `frame-src`에 `preview: http://preview.localhost` |
| iframe | `sandbox="allow-same-origin"`, `srcdoc` | `sandbox="allow-scripts"`, `csp="<프레임 CSP>"`, `src=http://preview.localhost/p<n>` |
| 프레임 CSP | 없음(앱 CSP 상속) | `default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' asset: http://asset.localhost; style-src 'unsafe-inline' asset: http://asset.localhost; img-src data: blob: asset: http://asset.localhost; font-src data: asset: http://asset.localhost; media-src asset: http://asset.localhost; connect-src 'none'; form-action 'none'; base-uri 'none'` |
| preview 응답 | (없음) | 저장된 id 200 + `Allow-CSP-From: *`·`Cache-Control: no-store`, 그 밖 204 |
| 정화(html.ts, DOMParser 규칙) | `script`·`on*` 지움, 링크 href 통째로 지움 | `script`·`on*` 남김, 링크는 `#id`만 남김, 외부·`javascript:`·`file:` URL 제거·`base`·`iframe`·`embed`·`object`·`meta refresh` 제거·로컬 파일 → asset URL 은 그대로, `script`의 crossorigin·integrity 지움 |
- 앱의 `script-src`·`connect-src`는 그대로다. capability 변경 없음(앱 명령 `preview_set`·`preview_drop`만 더함). 의존성 변경 없음.

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|
| 1 실측 먼저 | 방식이 조건 다섯을 지키는지 본 실측 | 충족 | 시험 HTML(`fixtures/isolation·network·navigate·refresh·loopnav.html`)로 `4a47bb2` 시제품을 재서 이동 결함을 찾아 R1·R2로 고친 뒤 다시 쟀다(`v3.json` → `v3-nav.json`·`v3-c.json`) |
| 2 스크립트 실행 | 시안 F~E 그림, 브라우저 캡처와 나란히, 인라인 스크립트 시험, 원본 고치면 다시 그림 | 충족 | `c2_mockup` designs 6·svg 500·행 350, `c2-mockup-drawings.png`(그림 영역) ↔ `..\ORDER-04\mockup-F.png`(같은 파일 Edge headless). `c3_isolation` "inline script ran"·"local.js ran", 원본에 줄 추가 → `redrawAfterEdit` "edited marker". 시안 글꼴(`file:///D:/…`)은 `file:` URL을 지워 대체 글꼴(IBM Plex Sans)로 보인다 |
| 3 격리: 앱 | parent·top document, localStorage, `__TAURI__`, `__TAURI_INTERNALS__`, ipc fetch 모두 실패 | 충족 | `c3_isolation.table`: parent/top document·location SecurityError, localStorage·sessionStorage·indexedDB·cookie SecurityError(sandbox), `__TAURI__` undefined, `fetch ipc://localhost/…`·`http://ipc.localhost/…` 실패, `__TAURI_INTERNALS__.invoke` 응답 없음, `chrome.webview.postMessage` 응답 없음. `__TAURI_INTERNALS__`·`window.ipc` 객체는 프레임에 있다(wry가 하위 프레임에 넣음) — 호출 경로는 모두 막힘. `c3-isolation.png` |
| 4 격리: 인터넷 | fetch·XHR·WebSocket·외부 script·img 막힘, 요청 0 | 충족 | `c4_network` 표 8행 모두 blocked. 프레임 대상에 붙은 기록 `v3-c.json` `b4_frame_network`: fetch·XHR·WebSocket·script·img 모두 blocked, `securitypolicyviolation` connect-src(fetch·XHR·WebSocket)·script-src-elem·img-src, Log에 CSP 위반 — 요청은 CSP에서 막혔다(나가지 않음) |
| 5 격리: 이동 | 링크·location·window.open·폼·meta refresh가 미리보기·앱을 바꾸지 못함, `#id`는 페이지 안 | 충족 | `v3-nav.json` `c5_navigate_r1`: 외부·로컬 링크 반응 없음, `#bottom` scrollY 1272, `location.href`(https·refresh.html)·`location = asset URL` 뒤 미리보기 문서로 돌아옴(Started at 새로), `window.open`·`form.submit()`·submit 버튼·`top.location` 변화 없음, 앱 탭·URL 그대로. `c5_loopnav` 계속 이동 → 5번 뒤 토스트, 앱 응답. `c5_refresh_r1` 페이지 그대로. 탭 6번 오가도 토스트 없음(`a_tab_switch`) |
| 6 보안 설정 | 앞뒤 값, 앱 script-src·connect-src 무변경, 앱 창 인라인 스크립트 안 돎 | 충족 | 위 표. `c6_app_inline_blocked`: 앱 문서에 넣은 인라인 스크립트 `__x` null, `script-src-elem` 위반 |
| 7 v0.8 기능 | 스타일 없는 HTML 배경·글자·링크색 = Preview 테마, 바꾸면 따라감, 로컬 CSS·이미지, Tab | 충족 | `c7_plain_theme`: One Dark 글자 rgb(220,224,229)·링크 rgb(116,173,232)·iframe 배경 rgb(40,44,51)·color-scheme dark → One Light rgb(36,37,41)·rgb(92,120,226)·rgb(250,250,250)·light, 문서 배경 투명. 로컬 CSS 점선·pic.png 32px(`c3_isolation`). Tab으로 프레임에 들어가고(IFRAME) 나옴(`c7_tab_into_frame`) |
| 8 멈춤 | 탭 닫으면 타이머 멈춤, 무한 루프 결과 | **BLOCKED**(무한 루프 뒤 새 HTML 미리보기). 보통 타이머는 충족 — R1: `v3-r1.json` `r1_after_loop_new_preview` 루프 페이지를 닫고 `page.html`을 열면 iframe(`src` p3)은 있으나 프레임 대상이 없고 5초 뒤에도 스크립트 결과 없음, 화면 빈칸(`r1-after-loop-new-preview.png`), 앱은 응답. 아래 C-13 메모 | 탭을 닫으면 프레임 제거·preview 문서 지움, 다시 열면 새 문서(`b8_stop`). 무한 루프: 프레임이 별도 렌더러 프로세스라 앱은 1 ms 안에 응답(`c8_loop_and_stop`). **알려진 한계**: 루프가 도는 채 탭을 닫아도 그 렌더러 프로세스는 CPU 1코어를 계속 쓴다(`b8_loop_close` 닫은 뒤 4초에 CPU 4.65초) — 앱은 응답하고, 앱을 다시 열 때까지 남는다 |
| 9 빌드 | 0.8.1 설치 파일, BUILD.md 크기·시각·버전·증가량, ProductVersion 0.8.1 | 충족 | `src-tauri\target\release\bundle\nsis\workbench-tauri_0.8.1_x64-setup.exe` 10,579,907 B(2026-11-13 07:44:58, ProductVersion·FileVersion 0.8.1), exe 21,538,304 B. 0.8.0 대비 설치 파일 +3,116,160 B(+41.75%)·exe +3,248,128 B(+17.76%), 대부분 ORDER-05 글꼴 넷. `docs/BUILD.md` 4A절. 빌드 전 release exe를 띄운 프로세스 없음 |
| 10 README | 실행 절, 경로 파일이 있음, 바뀌는 값은 BUILD.md 링크 | 충족 | `README.md` "실행" 절: release exe·NSIS 설치 파일(0.8.1)·디버그 exe 경로, 크기·시각은 BUILD.md 4A 링크. 세 경로 `Test-Path` True(K-07b·K-07c). 작업 폴더에 남아 있던 v0.8 초안을 0.8.1로 마무리해 커밋했다 |
| 11 전체 회귀 | release exe로 I-1~I-13 대표 동작, 미리보기 종류 | 충족(따로 적은 것 하나) | 아래 표 |
| 12 테스트 | 프레임 문서 테스트, 전체 통과, typecheck 0, cargo test·clippy 0 | 충족 | `src/editor/html.test.ts`(스크립트 보존·CSP 문자열·이동·인터넷 규칙·`recordRecovery`·`previewReady`), Rust `preview` 테스트. typecheck·test·cargo test·clippy 결과는 C-13 |

### #11 release exe 회귀 (`v3-regress.json`, `v3-regress-fix.json`)
| 항목 | 대표 동작 | 결과 |
|---|---|---|
| I-1 | 트리 이름 바꾸기 입력 글자 | 14px |
| I-2 | 트리 보통 이름 글자색 | rgb(169,175,188) = `text.muted` |
| I-3 | 파일을 다른 폴더로 끌어 놓기 | 옮겨짐(놓을 곳 표시 1). **따로 적음**: 펼친 첫 폴더(루트 바로 아래 첫 줄)에는 스크롤 0에서도 sticky 행이 그 줄 위에 겹쳐(`stickyAtTop` "folder@59") 놓을 곳이 되지 않는다 — ORDER-02부터, sticky 행은 놓기를 받지 않는 규칙(Zed) 때문 |
| I-4 | Outline(Python) | C A > m m, f f |
| I-5 | Lock Preview 켬 + 트리 한 번 클릭 | "Preview other.md" 이탤릭(임시) |
| I-6 | Search 버튼 두 번 | Search 탭 2개 |
| I-7 | HTML 인라인 스크립트 | 프레임 `#ran` = "ran" |
| I-8 | 미리보기 h2 위 여백·목록 간격 | 22px·4px |
| I-9 | 미리보기 Ctrl+F | 찾기 바 열림 |
| I-10 | 편집기·코드 블록 글꼴 | JetBrains Mono |
| I-11 | 코드 블록 배경 | rgb(47,52,62) ≠ 페이지 rgb(40,44,51) |
| I-12 | 코드 블록 머리 줄 | "python" |
| I-13 | 넘친 탭 줄의 마지막 탭 | 닫기 오른쪽 1348 < 버튼 영역 1353 |
| 마크다운 위치 연계 | 옆 미리보기 제목 클릭 → 편집기 줄 | `## End` |
| 수식·Mermaid | 미리보기 | KaTeX·Mermaid SVG 있음 |
| CSV·SVG·ipynb·HTML·이미지·PDF | 미리보기·보기 | 표·그림·셀 2·스크립트 실행·이미지·PDF iframe 모두 있음 |

## 검증
- 화면 차례 다섯 번(`[SCREEN-REQ]`/`[SCREEN-OK]`/`[SCREEN-DONE]`): 시제품 측정 → R1 뒤 이동 → R2 뒤 C-12 보강·탭 전환 → release 회귀(두 번에 나눔).
- 측정 메모: 같은 스크립트 안에서 화면 밖 요소 클릭·키 입력 문맥 문제로 몇 항목을 다시 쟀다(`v3-regress-fix.json`). 릴리스 회귀의 첫 I-3 실패는 펼친 첫 폴더 위 sticky 겹침이었고 debug exe에서도 같아 release 문제가 아니다.
- 검토: C-12(tauri-checker) REWORK — A 탭 전환 이중 로드·거짓 알림(→ R2), B 근거 보강 #2·#4·#8(→ `v3-c.json`); #3·#5·#6·#7 PASS. C-13(tauri-checker) REWORK(재측정 2건, 코드 변경 요구 없음) — B와 #9·#10·#11 통과, A의 V3가 빠른 탭 전환을 증명하지 못함, 루프 CPU를 한계로 내리려면 루프 뒤 새 미리보기 확인 필요. C-13 6절 #11 표는 `verify/ORDER-07/c13-regress-table.md`로 옮겼다. sticky 겹침은 C-13이 Zed와 같은 동작(결함 아님, R-13 "natural sticky slot")으로 판단.
- **ORDER-07-R1 재측정**(`v3-r1.json`·`v3-r1-about.json`, `measure-r1.mjs`): (1) 빠른 탭 전환 10번 2.8초 — 토스트 없음, 문서 그대로(`r1_fast_tabs`); 그 뒤 버튼 이동 3종 되돌림(`r1_nav_after_tabs`)·loopnav 5번 제한·토스트(`r1_loopnav_after_tabs`) 그대로. 전환당 preview 요청 수는 프레임 문서 "Started at" 변화로 봤다(10번 전환 동안 1회 다시 로드). (2) 무한 루프 페이지를 닫은 뒤 새 HTML 미리보기 — **그려지지 않음 → [BLOCKED]**(위 #8). (3) release exe Help → About "Version 0.8.1"(`c9-release-about.png`).

## 지운 것·더한 것·하지 않은 것
- 더함: `preview` URI 스킴과 앱 명령 `preview_set`·`preview_drop`(Rust), 프레임 문서 만들기(머리에 CSP meta·`previewReady`·스크롤 알림·I-11 기본 스타일), iframe sandbox·csp 속성, 이동 되돌림·횟수 제한, `frame-src`에 preview. README 실행 절, BUILD.md 4A.
- 하지 않음: 스크립트 켜고 끄는 설정, 개발자 도구, 인터넷 허용, HTML 미리보기 찾기(카드 3.1).
- 알려진 한계: 스크립트가 만든 상대 URL(`img.src = "pic.png"`)은 안 뜬다(마크업 URL만 asset으로 바뀜). `type="module"` 로컬 스크립트는 안 돈다(asset 응답 CORS). 1초보다 느리게 계속 이동하는 페이지는 제한에 걸리지 않고 계속 돌아온다. 무한 루프 렌더러는 탭을 닫아도 CPU를 쓴다(#8). 시안 `file:` 글꼴은 대체 글꼴. `script-src asset:`·asset 범위 `**`라 스크립트가 만든 `<script src=asset…>`은 디스크의 파일을 스크립트로 실행해 볼 수 있다(내용은 못 읽고 나갈 길이 없음, C-12 참고). `<link rel=preconnect>`·WebRTC는 CSP가 막지 않는 알려진 구멍(미실측).

## tauri가 고른 것
- 방식: 별도 원점 문서 + `sandbox="allow-scripts"` + 프레임 CSP(meta + `csp` 속성) + 204, 이유는 위.
- 프레임 CSP에 `'unsafe-eval'`(eval·new Function 쓰는 페이지가 브라우저처럼 보이게, 같은 격리 안).
- 계속 이동 제한: 5초에 5번(`PREVIEW_RECOVER_WINDOW_MS`·`PREVIEW_RECOVER_LIMIT`, tauri 값), 넘으면 토스트로 알리고 다음 렌더까지 멈춤.
- 스크롤 유지: 프레임이 `postMessage({previewScrollY})`로 알리고 다음 문서가 복원(부모는 `e.source === frame.contentWindow`와 숫자만 받음).

## 바꾼 파일
- 코드 `4a47bb2`(K-07a): `src-tauri/src/preview.rs`(새), `src-tauri/src/lib.rs`, `src-tauri/tauri.conf.json`, `src/editor/html.ts`, `src/editor/html.test.ts`, `src/shell/markdown-preview.ts`, `src/app.css`·`src/theme/apply.ts`(주석).
- 코드 `eb987f2`(K-07a-R1): `src/shell/markdown-preview.ts`, `src/editor/html.ts`, `src/editor/html.test.ts`.
- 코드 `267cfa5`(K-07a-R2): `src/shell/markdown-preview.ts`, `src/editor/html.ts`, `src/editor/html.test.ts`.
- 문서 `970ad01`(K-07b): `README.md`, `docs/BUILD.md`. `88e2acf`(K-07c): `docs/BUILD.md`.
- 문서·검증 `f3bfde9`: `docs/BUILD.md`(알려진 한계), `specs/v0.8.1/PLAN.md`·`PROGRESS.md`, `specs/v0.8.1/verify/ORDER-07/`.

## 미정
- 펼친 첫 폴더 위 sticky 겹침으로 그 폴더에 놓을 수 없는 것(ORDER-02부터) — 고칠지 leader-core.
- 무한 루프 렌더러가 탭을 닫아도 CPU를 쓰는 것 — 알려진 한계로 둘지 leader-core.
- 사용자 확인(V4): 시안·실제 HTML 페이지가 브라우저와 같게 보이는지, 계속 이동 페이지 토스트 문구.

## BLOCKED
- 원인: 무한 루프(`while(true){}`)가 도는 HTML 미리보기를 닫아도 그 렌더러 프로세스가 계속 바쁘고(CPU 1코어), 그 뒤 연 HTML 미리보기(같은 `preview.localhost` 사이트)가 그 프로세스에 들어가 그려지지 않는 것으로 보인다(프레임 대상이 DevTools에 안 잡힘). 앱 창·다른 미리보기 종류는 응답한다. 앱을 다시 열면 풀린다.
- 필요한 것: 고칠 방향 결정(예: 미리보기마다 다른 호스트 이름으로 사이트를 나눠 새 프로세스에 넣기 `p<n>.preview.localhost`, 또는 알려진 한계로 받기) — leader-core.
- leader-core 결정(2026-11-13): 결함으로 보고 I-7 #8만 BLOCKED로 남긴다. 고치려면 프레임 프로세스 처리(범위 확대)라 사용자 결정 — 마지막 보고에서 묻는다. 지금 코드는 되돌리지 않는다(보통 HTML은 동작, 앱 다시 시작으로 풀림). 한계는 `docs/BUILD.md`와 PROGRESS에 적었다.
