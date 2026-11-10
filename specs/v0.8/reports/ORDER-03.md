[DONE] ORDER-03 tauri

> 보고: ORDER-03 · 작성일: 2026-11-11 · 보낸 이: tauri-leader · 받는 이: leader-core

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과 | 근거 (`specs/v0.8/verify/ORDER-03/`) |
|---|---|---|---|
| 1 보안 | 앞뒤 CSP가 보고에 있음, `style-src`·`dangerousDisableAssetCspModification`·`img-src data:`(leader-core 결정) 말고는 ORDER-02 끝과 같음, sandbox `allow-same-origin` 하나 | 충족 | 아래 "보안 설정 앞뒤". `git diff bea783a 6d15017 -- src-tauri/tauri.conf.json`: default·script·connect·frame-src, asset 범위 `**`, capability 불변. 빌드 exe의 실제 헤더 `v3-full.json` `c1_csp_header`(style-src에 nonce 없음, `'unsafe-inline'` 그대로). iframe `sandbox` = `allow-same-origin`, `src` 없음, `about:srcdoc`(`c2_open`·`c3_local`·`c5_net`, `v3-c6.json`) |
| 2 I-1 열기 | `.html`·`.htm` 눈 버튼·`Ctrl+Shift+V`·`Ctrl+K V`·트리 "Open Preview", Lock Preview | 충족 | `v3-full.json` `c2_open`: 두 확장자 모두 눈 버튼 있음, 눈 버튼·`Ctrl+Shift+V` → 같은 pane 미리보기 탭(h1 읽힘), `Ctrl+K V` → 옆 pane, 트리 메뉴 "Open Preview" → 미리보기 탭, Lock Preview `aria-pressed` "true"에서 열면 미리보기 탭만 |
| 3 I-1 로컬 자원 | 하위·상위 CSS, `<style>`, `style=`, 하위·상위·한글·공백 이미지 | 충족 | `c3_local`: h1 rgb(10,20,30)(`css/a.css`), p rgb(40,50,60)(`../b.css`), `<style>` 배경 rgb(70,80,90), `style=` rgb(100,110,120), 이미지 `img/a.png`·`../c.png`·`한글 그림.png`·`%ED%95%9C…%20…png` 넷 모두 naturalWidth 50. `c3-html-local.png` |
| 4 I-1 JS 막기 | script·onload/onerror·`javascript:` 링크를 열고 눌러도 흔적 없음 | 충족 | `c4_js`: iframe·부모 전역 4+1개 모두 null, title "" 그대로, script 0, on* 속성 0, `javascript:` href 지워짐, 클릭 전후 body 길이 229 같음, 콘솔 "EVIL" 0. `c4-html-evil.png` |
| 5 I-1 인터넷 막기 | `https://` CSS·`@import`·글꼴·배경·이미지·`//host` 요청 0 | 충족 | `c5_net` `example: []`(Network.requestWillBeSent 기록) |
| 6 I-1 이동 막기 | 상대·`https://`·`#id` 링크, 폼 제출, meta refresh → 문서 그대로, 외부 브라우저 없음, 요청 0 | 충족(K-03c 뒤) | 처음 잼 `v3-c6-r1.json`: `#h` 링크를 누르자 iframe이 `http://tauri.localhost/#h`로 이동(srcdoc의 조각 링크가 부모 URL 기준으로 풀려 앱 페이지가 미리보기에 들어옴) → K-03c로 `<a>`·`<area>` href를 `#id`까지 지움. 다시 잼 `v3-c6.json` `c6_steps`: href 4개 모두 없음, rel·web·anchor·submit 클릭 뒤 모두 `about:srcdoc`·h1 "Links", CDP 대상은 앱 page 하나(창·iframe 대상 더 없음), refresh 문서 그대로·meta 0, `example.com` 요청 0 |
| 7 I-1 갱신 | `<h1>` 글자·`<style>` 색을 고치면 미리보기 바뀜 | 충족 | `c7_live`: "Before"·rgb(255,0,0) → "After"·rgb(0,0,255). `c7-html-live.png` |
| 8 회귀 | 앱 화면 ORDER-02 끝과 같음, 마크다운 `style=` 지움, 마크다운·CSV·SVG·이미지·PDF 그대로 | 충족(PDF는 코드 확인) | CSP 변경 전 빌드 `c8-base-*.png` ↔ 뒤 `c8-after-*.png`: Settings 0px 차이. main·메뉴·About 차이는 모두 트리 열(x 200–438, `c8-diff-bbox.txt`)의 `site` 폴더 펼침(측정 순서 차이)이고 그 밖은 같음. `c8_regress`: 마크다운 위치 연계 active-block "Section 3", 미리보기 `[style]` 0, CSV 셀 "x\ny", SVG fill rgb(255,0,0), 이미지 40px. PDF는 측정 스크립트에서 빠져 재지 않음 — PDF 경로(`view-body.ts`·`frame-src`)는 이번에 바뀌지 않음(C-07 의견), V4 사용자 확인 목록에 둠 |
| 9 테스트 | `.html`·`.htm` 판별, 변환(상대 경로·스크립트), 기존 통과, typecheck 0 | 충족 | `src/editor/html.test.ts`(판별, `resourceUrl`·`rewriteCss`·`rewriteSrcset`, `navigates`, 마크다운 `style=` 지움). `npm.cmd run test` 274/274, typecheck 0. Rust 변경 없음 |

## 보안 설정 앞뒤
- 사용자가 tauri-coder pane에서 직접 적용(K-03s). leader의 카드 전송이 auto mode에 막혀 [BLOCKED] → leader-core → 사용자.
- `csp` 앞: `default-src 'self' ipc: http://ipc.localhost; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self' ipc: http://ipc.localhost; img-src 'self' asset: http://asset.localhost; frame-src asset: http://asset.localhost`
- `csp` 뒤: `default-src 'self' ipc: http://ipc.localhost; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self' ipc: http://ipc.localhost; img-src 'self' data: asset: http://asset.localhost; frame-src asset: http://asset.localhost; style-src 'self' 'unsafe-inline' asset: http://asset.localhost`
- `devCsp`: 위와 같고 `connect-src`에 `ws://localhost:1420`만 더 있음(앞뒤 모두).
- 더한 것: `app.security.dangerousDisableAssetCspModification: ["style-src"]` — Tauri가 `style-src`에 nonce를 붙이면 `'unsafe-inline'`이 무시된다(ORDER-02 실측 (b)). `script-src`에는 hash가 그대로 붙는다(`c1_csp_header`).
- 이유: `style-src` asset·`'unsafe-inline'` = HTML 미리보기의 로컬 CSS·`<style>`·`style=`(srcdoc는 부모 CSP를 물려받음). `img-src data:` = ORDER-04 ipynb 그림(leader-core 결정, ORDER-04에서 CSP를 다시 바꾸지 않음).
- iframe `sandbox="allow-same-origin"`(다른 토큰 없음), srcdoc만.
- 마크다운 미리보기 정화(DOMPurify, style 속성 금지)는 그대로 — `c8_regress` `mdStyleAttrs` [0], 테스트.
- v0.8은 DECISIONS를 쓰지 않아 값과 이유는 이 보고와 PROGRESS에 둔다.

## 검증
- `npm.cmd run typecheck` 0, `npm.cmd run test` 274/274, `npm.cmd run tauri build -- --debug --no-bundle` 성공(K-03s 뒤, K-03c 뒤 두 번).
- V3: 주 모니터 1920×1080 100%, 창 1440×852, One Dark, 디버그 빌드 exe, CDP 입력만. 결과 `v3-base.json`(CSP 변경 전 화면), `v3-full.json`, `v3-c6-r1.json`, `v3-c6.json`. 캡처 `c3-html-local.png`, `c4-html-evil.png`, `c7-html-live.png`, `c8-base-{main,menu,about,settings}.png`, `c8-after-*.png`.
- 검토: C-06(K-03b) PASS, C-07(보안 diff·K-03c·V3 판정 #1~#9) PASS.

## 지운 것·더한 것·하지 않은 것
- 더한 것: `.html`·`.htm` 미리보기(`src/editor/html.ts` `htmlSrcdoc`: DOMParser로 script·base·iframe·frame·object·embed·applet·meta refresh·on*·ping 지움, 스타일시트 아닌 `<link>` 지움, URL 속성은 로컬이면 asset URL·그 밖은 지움, 링크·폼 대상은 모두 지움, CSS `@import` 지움·`url()` 바꿈).
- 하지 않은 것: 개발자 도구·기기 프레임·`@import` 따로 풀기(M-7).
- 남은 위험: 링크된 CSS 파일 **안의** 상대 `url()`은 풀리지 않는다(asset URL이 경로 전체를 한 성분으로 인코딩, `shortcut:` 주석). `style-src 'unsafe-inline'`은 앱 문서에도 걸린다 — 앱 코드의 인라인 style 금지 규칙(AGENTS 5장)은 그대로 둔다.

## tauri가 고른 것
- 링크 막는 방법: href·action·formaction을 지움(부모에서 클릭을 가로채지 않음). `#id`도 지움(이동 결함, 위 #6). SVG `<use href="#id">` 같은 비탐색 `#id`는 남김.
- `.html-frame`에 `color-scheme: dark` — 배경을 지정하지 않은 HTML이 흰 캔버스 대신 어두운 캔버스로 보인다(One Dark와 맞춤).

## 바꾼 파일
- `src/editor/preview-kind.ts`, `src/editor/html.ts`(새), `src/editor/html.test.ts`(새), `src/shell/markdown-preview.ts`, `src/app.css`(`.html-preview`·`.html-frame`), `src/editor/csv.test.ts`·`src/workspace/tabs.test.ts`(미리보기 대상 목록 기대값에 html·htm), `specs/v0.8/PLAN.md` — `f62ed74`
- `src-tauri/tauri.conf.json`(K-03s), `src/editor/html.ts`·`html.test.ts`(K-03c) — `6d15017`
- `specs/v0.8/verify/ORDER-03/`, `specs/v0.8/PROGRESS.md` — `6af61d0`

## 미정
- `.html-frame` `color-scheme: dark`로 HTML 기본 배경을 어둡게 둘지, 브라우저처럼 흰색으로 둘지 — 사용자(V4).
- PDF 보기 회귀 화면, iframe 안 키보드 포커스(Tab으로 들어가고 나오기) — 사용자 확인(V4).

## BLOCKED
- 없음(K-03s의 [BLOCKED]는 사용자 적용으로 풀림).
