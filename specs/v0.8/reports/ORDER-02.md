[DONE] ORDER-02 tauri

> 보고: ORDER-02 · 작성일: 2026-11-11 · 보낸 이: tauri-leader · 받는 이: leader-core

## 실측 (3.1)

| | 질문 | 결과 | 근거 (`specs/v0.8/verify/ORDER-02/`) |
|---|---|---|---|
| (a) | PDF를 asset URL로 WebView2 내장 PDF 뷰어에 띄울 수 있는가 | **된다(iframe)**. `<embed>`는 안 된다 | `m-ac.json` `a`: iframe 아래에 `chrome-extension://…/edge_pdf/index.html` 뷰어가 뜨고, `m-a-pdf-iframe-embed.png` 왼쪽에 PAGE ONE·"1 의 2"가 보인다. `<embed>`는 CSP 위반 "Loading plugin data … violates"(`object-src`가 `default-src 'self'`를 따름)로 오른쪽이 비었다. 파일 이름 `two pages 한글.pdf`(한글·공백) |
| (b) | Tauri 빌드가 `style-src`에 nonce·hash를 붙여 `'unsafe-inline'`이 무시되는가 | **된다(무시된다)** | ① HEAD 빌드(설정 그대로) `m-b-head.json`: 실제 헤더에 config에 없던 `style-src 'self' 'nonce-…'`이 붙는다. 인라인 `<style>`·`style=` 둘 다 막히고 위반 2건. ② 임시 `--config`로 `style-src 'self' 'unsafe-inline'` `m-b-b1-unsafe-inline.json`: 헤더가 `style-src 'self' 'unsafe-inline' 'nonce-…'`가 되어 `'unsafe-inline'`이 무시되고 인라인이 막힌다. ③ 임시로 ② + `dangerousDisableAssetCspModification: ["style-src"]` `m-b-b2-disable-mod.json`: `style-src`에 nonce가 붙지 않아 `style-src 'self' 'unsafe-inline'`이 그대로 걸리고 인라인이 적용된다(위반 0). `script-src`에는 hash가 그대로 붙고 지시어 다섯(default·script·connect·style·img)은 온전하다. 프로브는 `--config` 덮어쓰기로만 했고 파일은 바꾸지 않았다(되돌릴 것 없음). 이 카드 끝 빌드는 원래 설정이다 |
| (c) | 권한 없는 `sandbox` iframe의 `srcdoc` 안에서 로컬 상대 경로 CSS·이미지를 asset URL로 불러올 수 있는가 | **안 된다** | `m-ac.json` `c`·`m-c-sandbox-srcdoc.png`: `sandbox=""`에서 이미지가 깨지고 CSS가 적용되지 않는다. 대조 `m-c2.json`·`m-c2-controls.png`: `sandbox=""`는 이미지 안 뜸, `sandbox="allow-same-origin"`·sandbox 없음·메인 문서 `<img>`는 이미지가 뜬다(픽셀 파랑). CSS는 넷 모두 상속 CSP `style-src` 위반("Loading the stylesheet … violates … style-src", 요청 FAILED csp). 즉 권한 없는 sandbox에서는 asset 이미지가 막히고, 로컬 CSS는 sandbox와 상관없이 `style-src`에 asset 출처가 없어 막힌다 |

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|
| 1 실측 | (a)(b)(c) 된다/안 된다와 근거 | 충족 | 위 "실측" 절. C-05 판정 PASS |
| 2 보안 | 앞뒤 CSP·asset 범위, `script-src`·`connect-src`·`style-src` v0.7과 같음 | 충족 | 아래 "보안 설정 앞뒤". `git diff 86f938a 82c9547 -- src-tauri/tauri.conf.json`: script-src·connect-src·default-src 불변, `style-src` 없음(v0.7과 같음) |
| 3 I-8 | `.png`·`.jpg`·`.jpeg`·`.gif`·`.webp`·`.ico` → 편집 탭 없이 보기 탭, 깨진 글자 없음, Lock Preview 끄고 켜고 같음 | 충족 | `v3-part2.json` `c3_off_*`·`c3_on_*`(`lockPressedOn` "true"): 편집기 없음, 눈 버튼 없음, img naturalWidth>0, 깨진 글자 없음. `c3-*.png` |
| 4 I-8 | 큰 그림 비율 유지해 pane 안, 눈 버튼·Show Source 없음, `Ctrl+S`·`Ctrl+Shift+V` 무동작, 한 번 클릭 임시·두 번 클릭 고정 | 충족 | `c4_big`: 3000×2000 → 1000×667(pane 1000×756), `c4-big-fit.png`. `c4_small_not_upscaled` 40×40 그대로. `c4_tab_menu`에 Show Source 없음. `c4_keys`: 탭 그대로, 대화 상자 없음. `c4_click_once_twice`: 한 번 = 기울임, 다른 파일 한 번 = 대체, 두 번 = 기울임 아님 |
| 5 I-9 | 여러 쪽 `.pdf` → 보기 탭 첫 쪽, 스크롤로 다음 쪽, 한글·공백 이름 | 충족 | `c5_pdf`(iframe 1000×756, edge_pdf 대상), `c5-pdf-first.png`, `c5-pdf-scrolled.png`(쪽 표시 "3 의 3"). 파일 `two pages 한글.pdf`(3쪽) |
| 6 I-3 | `img/a.png`·`../b.png`·한글·공백 이미지 보임, `https://` 안 보임 | 충족 | `c6_md_images`: 하위·상위·`한글%20그림%20이름.png`·`<한글 그림 이름.png>` 넷 모두 naturalWidth 60. web 이미지 요소 없음, `example.com` 요청 0. `c6-md-images.png` |
| 7 I-6 | `.svg` 눈 버튼·`Ctrl+Shift+V`로 미리보기, `fill` 고치면 색 바뀜, `<script>`·`onload` 안 돌아감, 외부 href 안 불림 | 충족 | `v3-part1.json` `c7_svg_eye`·`c7_svg_single_ctrl_shift_v`, `v3-part2.json` `c7_fill` red → rgb(0,255,0)(`c7-svg-fill-changed.png`). `c7_svg_evil`: script 0·on* 속성 0·href []·`window.__svg*` 흔적 모두 null(클릭 포함)·외부 요청 0. 큰 SVG 4000 → 800 축소(`c7_svg_big`) |
| 8 회귀 | 마크다운(위치 연계)·CSV·TSV 그대로 | 충족 | `v3-part1.json` `c8_md_link`(커서 15줄 "## Section 4" → active-block "Section 4", `c8-md-link.png`), `c8_tsv` 표 미리보기. CSV는 #10 |
| 10 I-7 | 셀 `"line1\nline2"` 두 줄 | 충족 | `c10_cells`: white-space pre-wrap, 셀 높이 57px(줄 높이 24px의 두 줄). `c10-csv-cell-newline.png` |
| 11 AGENTS | 레포 규칙 절에 v0.7 문장 없음, v0.8 범위 | 충족 | `git diff 99a1de0 86f938a -- AGENTS.md`: 10행 "v0.8 구성은 v0.7 그대로다(core `specs/v0.8/PLAN.md` 운영)", 12행 "workbench-core v0.8 ITEMS(I-1~I-10)". 그 밖은 그대로 |
| 9 테스트 | 판별(이미지·PDF·SVG)·바이너리 분기·상대 경로 풀기 테스트, 기존 통과, typecheck 0, cargo test·clippy 0 | 충족 | `src/editor/view-kind.test.ts`(이미지·PDF는 보기 종류, 미리보기·편집 대상 아님), `src/editor/svg.test.ts`(.svg 판별·정화 정책), `src/editor/markdown.test.ts`(`localImagePath`: 하위·상위·공백·한글·인터넷 제외). `npm.cmd run test` 267/267, typecheck 0, `cargo clippy -- -D warnings` 0, `cargo test` 통과 |

## 보안 설정 앞뒤
- CSP 앞: `default-src 'self' ipc: http://ipc.localhost; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self' ipc: http://ipc.localhost; img-src 'self'`
- CSP 뒤: `default-src 'self' ipc: http://ipc.localhost; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self' ipc: http://ipc.localhost; img-src 'self' asset: http://asset.localhost; frame-src asset: http://asset.localhost`
- devCsp: 같은 두 곳만 바꿨다(`connect-src`의 `ws://localhost:1420`은 그대로).
- asset protocol: 앞은 없음(꺼짐) → 뒤 `"assetProtocol": { "enable": true, "scope": ["**"] }`. `**`는 Windows 드라이브·UNC 경로에 걸린다(tauri 2.12.5 `src/scope/fs.rs` 419-446 `is_allowed`, 92- `push_pattern`; glob 0.3.4 같은 옵션으로 `C:\a\b.png`·`D:\…`·`\\?\C:\…` 확인 — K-02c 보고).
- Cargo: `tauri` features `["protocol-asset"]`(버전 그대로). Cargo.lock에 이 feature가 끌어온 `http-range 0.1.6` 하나 추가.
- capability: 바꾸지 않음. `style-src`: config에 없음(v0.7과 같음). 인터넷 이미지는 CSP에 http(s)가 없어 계속 막히고, 마크다운에서는 비로컬 img 요소를 지운다.

## 검증
- `npm.cmd run typecheck` 0, `npm.cmd run test` 267/267, `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings` 0, `cargo test` 통과, `npm.cmd run tauri build -- --debug --no-bundle` 성공.
- V3: [SCREEN-OK] ORDER-02 ~ [SCREEN-DONE]. debug exe, 임시 APPDATA·WebView 폴더, 1440×852, 100%, One Dark, CDP 합성 입력·주입. JSON 7개(`m-b-head`·`m-b-b1-unsafe-inline`·`m-b-b2-disable-mod`·`m-ac`·`m-c2`·`v3-part1`·`v3-part2`), PNG 22장. part1의 fill 변경 단계는 측정 스크립트 오류(Ctrl+S 키 표 누락)로 part2 `c7_fill`에서 다시 쟀다.
- 판정: C-03 [PASS](K-02b·W-03), C-04 [PASS](K-02c·K-02d), C-05 [MEASURED] 8 PASS·불일치 0.

## 지운 것·더한 것·하지 않은 것
- 더함: `src/editor/svg.ts`(DOMPurify SVG 정화), `src/shell/view-body.ts`(이미지 `<img>`·PDF `<iframe>` 보기 본체), `preview-kind.ts`의 `svg` 종류와 `viewKind`(image·pdf), `markdown.ts` `localImagePath`. 지움: `shortcut:` S-9 주석과 CSS 이미지 숨김.
- 하지 않음: 확대·이동·정보 패널, PDF.js, `style-src` 변경, `<embed>`.
- 남은 위험: 보기 탭(이미지·PDF)은 파일이 바뀌어도 다시 그리지 않는다(닫고 다시 열면 맞다, `shortcut:` 주석). 이름을 바꾼 뒤에는 열린 보기 탭의 그림 주소가 옛 경로로 남는다. PDF 뷰어 안에 포커스가 있으면 앱 단축키가 닿지 않는다(WebView2 기본 동작). asset scope `**`는 모든 로컬 파일을 앱 페이지가 읽을 수 있게 한다(M-8대로).

## tauri가 고른 것
- PDF는 `<iframe>`(실측 (a): `<embed>`는 `object-src`에 막힘). 그래서 CSP에 `frame-src asset: http://asset.localhost`를 더했다.
- 이미지 맞춤: `max-width/max-height: 100%` + `object-fit: contain`. 큰 그림은 줄이고 작은 그림은 원래 크기, 배경은 `--editor-background`.
- 보기 탭은 기존 tool 탭 방식이다. 그래서 저장·눈 버튼·Show Source·Split·Copy Path·탭 툴팁이 없고, 상태 표시줄 위치·종류 칸은 비운다.
- SVG는 DOMPurify(SVG 프로필 + `script`·`style`·`foreignObject`·`style` 속성 금지 + 외부 `href`·`url(http…)` 제거)로 정화해 인라인 `<svg>`로 넣는다(CSP `img-src`가 `data:`·`blob:`를 막아서). 잘못된 SVG면 "Not a valid SVG". `viewBox`만 있으면 그 너비를 `width` 속성으로 줘서 키우지 않는다.
- 마크다운의 비로컬 이미지(`http:`·`https:`·`data:`·`file:`·`//host`)는 img 요소를 지워 깨진 그림 상자도 남기지 않는다.

## 바꾼 파일
- `86f938a`: `AGENTS.md`, `specs/v0.8/PLAN.md`, `src/editor/preview-kind.ts`·`svg.ts`(새)·`svg.test.ts`(새)·`csv.test.ts`, `src/shell/markdown-preview.ts`, `src/app.css`.
- `82c9547`: `src-tauri/Cargo.toml`·`Cargo.lock`·`tauri.conf.json`, `src/editor/preview-kind.ts`·`markdown.ts`·`markdown.test.ts`·`view-kind.test.ts`(새), `src/shell/view-body.ts`(새)·`markdown-preview.ts`, `src/workspace/context.ts`, `src/app.css`.
- V3 결과·PROGRESS·이 보고는 그 뒤 커밋에 넣는다.

## 미정
- (b) 결과로 보면 ORDER-03(HTML)·ORDER-05(KaTeX·Mermaid)에서 인라인 스타일이 필요할 때 `style-src`에 `'unsafe-inline'`만 더해서는 안 되고 `dangerousDisableAssetCspModification: ["style-src"]`도 함께 둬야 한다(앱 자체의 nonce `<style>`도 그때는 nonce 없이 `'unsafe-inline'`로 허용된다). 보안 결정이라 그 카드에서 leader-core(사용자)가 정한다.
- (c) 결과로 보면 ORDER-03 HTML 미리보기에서 로컬 이미지는 `allow-same-origin`이 있어야 뜨고, 로컬 CSS는 `style-src`에 asset 출처가 있어야 뜬다. 둘 다 보안 결정이라 ORDER-03에서 정한다.
- 보기 탭에서 파일이 바뀔 때 다시 그릴지, Copy Path·Reveal·분할을 넣을지는 카드 밖이라 하지 않았다. 필요하면 leader-core가 정한다.

## BLOCKED
- 처음에 asset protocol 편집이 auto mode에 막혀 [BLOCKED]로 알렸다. 사용자 승인(leader-core가 tauri-coder를 manual mode로 바꾼 뒤 사용자가 승인 창 둘을 허용)으로 풀렸다. 지금 남은 BLOCKED는 없음.
