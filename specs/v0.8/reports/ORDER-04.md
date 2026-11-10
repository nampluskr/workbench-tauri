[DONE] ORDER-04 tauri

> 보고: ORDER-04 · 작성일: 2026-11-11 · 보낸 이: tauri-leader · 받는 이: leader-core

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과 | 근거 (`specs/v0.8/verify/ORDER-04/`) |
|---|---|---|---|
| 1 열기 | 트리 → JSON 편집 탭, 눈 버튼·`Ctrl+Shift+V`·`Ctrl+K V`·트리 "Open Preview"·Lock Preview | 충족 | `v3.json` `c1_open`: 트리 두 번 클릭 → 탭 `nb.ipynb` 하나, 편집기 첫 줄 `{`, 미리보기 없음. 눈 버튼·`Ctrl+Shift+V` → 같은 pane 미리보기 탭(셀 9), `Ctrl+K V` → 옆 pane, 트리 메뉴 "Open Preview" → 미리보기 탭, Lock Preview `aria-pressed` "true"에서 열면 미리보기 탭만 |
| 2 셀 | markdown(제목·표·코드 블록)·code(python 색칠, `[n]`)·raw가 파일 순서, `source` 배열·문자열 같음 | 충족 | `c2_cells`: 순서 markdown·code·raw·code×5·markdown, `[n]` = null·[3]·null·[4]·[5]·null(번호 없음)·[7]·[8]·null. 마크다운 셀 h1 "NB Title"·표 2행·`language-python` 코드 블록 색칠 span 8·로컬 이미지 asset 40px. code 셀 `language-python` span 16(색 8가지). raw "RAW *not markdown*" 그대로(em 없음). 첫 셀 source 배열, 마지막 셀 문자열. `c2-nb-top.png`. 테스트 `notebook.test.ts` |
| 3 출력 글자 | stdout·stderr·`text/plain`, ANSI 글자 없음 | 충족 | `c3_text`: "hello red stdout", "warn stderr"(`--error` 색), "PLAIN-ONLY", `ansiLeft` false(`\x1b`·`[..m` 없음). 테스트 `stripAnsi` |
| 4 출력 그림 | png·jpeg·svg 그림, `tauri.conf.json` = `102c5f0` | 충족 | `c4_images`: png 30×20·jpeg 30×20(data URI, jpeg는 WebView 캔버스로 만든 것), svg rect rgb(0,128,0)·script 0·`__nbSvg` null. `c4-nb-images.png`. `git diff 102c5f0 -- src-tauri/tauri.conf.json` 0바이트 |
| 5 출력 HTML | pandas 표가 표로, script·onerror·iframe 실행·표시 없음 | 충족 | `c5_html`: `table.dataframe` 3행·td 1,x,2,y, `<style scoped>` 지워짐(style 요소 0·style 속성 0). 악성 출력 남은 HTML `<a id="jsl">js</a><b id="evilb">bold</b>` — script·iframe·img 0, on* 0, `javascript:` href 없음, 클릭 뒤 전역 6개 null, 콘솔 "EVIL" 0, `example.com` 요청 0, 탭 그대로. `c5-nb-html.png` |
| 6 오류·숨김 | `ename: evalue`+traceback, 위젯·javascript만 → "Output not shown (…)" | 충족 | `c6_error_hidden`: "ValueError: bad value", traceback 두 줄(ANSI 지움, `--error` 색), "Output not shown (application/javascript)", "Output not shown (application/vnd.jupyter.widget-view+json)". `c6-nb-error.png` |
| 7 MIME 고르기 | png+plain → 그림만, html+plain → HTML만 | 충족 | 테스트 `pickMime`. V3 `c3_text` `pngTextShown` false·`dfPlainShown` false |
| 8 잘못된 파일 | 깨진 JSON·`nbformat: 3` → 안내 한 줄, 앱 멈추지 않음 | 충족 | `c8_invalid`: `broken.ipynb` "Not a valid notebook", `v3real.ipynb`(nbformat 3 + `worksheets`) "Unsupported notebook format", `v3cells.ipynb`(nbformat 3 + `cells`) "Unsupported notebook format", 셋 다 편집 탭 그대로 열림, 앱 응답(`alive` 2). `c8-nb-broken.png`. 테스트 |
| 9 갱신 | 나란히 두고 markdown 셀 source 고치면 바뀜 | 충족 | `c9_live`: "Live Before" → "Live After". `c9-nb-live.png` |
| 10 회귀 | 마크다운(위치 연계)·CSV·SVG·HTML·이미지·PDF 그대로 | 충족 | `c10_regress`: 마크다운 커서 15줄 → active-block "Section 3", `[style]` 0. CSV 셀 "x\ny". SVG fill rgb(255,0,0). HTML sandbox `allow-same-origin`·h1 rgb(10,20,30)(링크 CSS)·이미지 40. 이미지 40px. PDF iframe asset 1000×756 + `edge_pdf` 뷰어 대상(`c10-pdf.png`) — ORDER-03에서 재지 못한 PDF도 여기서 잼 |
| 11 테스트 | 변환(셀 셋·출력 종류·MIME·ANSI·정화·잘못된 파일) 테스트, 기존 통과, typecheck 0 | 충족 | `src/editor/notebook.test.ts`(종류, 셀 순서·source 문자열/배열·`[n]`, 언어 고르기, ANSI, MIME 고르기, 정화 정책 상수·data URI 검사, 잘못된 파일). `npm.cmd run test` 281/281, typecheck 0. Rust 변경 없음 |

## 검증
- `npm.cmd run typecheck` 0, `npm.cmd run test` 281/281, `npm.cmd run tauri build -- --debug --no-bundle` 성공(K-04b 포함).
- V3: 주 모니터 1920×1080 100%, 창 1440×852, One Dark, 디버그 빌드 exe, CDP 입력만, 앱 1회 실행. 결과 `v3.json`, 캡처 `c2-nb-top.png`, `c4-nb-images.png`, `c5-nb-html.png`, `c6-nb-error.png`, `c8-nb-broken.png`, `c9-nb-live.png`, `c10-pdf.png`.
- 검토: C-08(K-04a) PASS, C-09(K-04b·V3 판정 #1~#11) PASS.

## 지운 것·더한 것·하지 않은 것
- 더한 것: `src/editor/notebook.ts`(순수 변환: `parseNotebook`·`pickMime`·`pickOutput`·`stripAnsi`·`notebookLanguage`·`joinSource`), `markdown-preview.ts`의 ipynb 분기(마크다운 셀은 마크다운 미리보기와 같은 `markdownTree`, code 셀은 기존 코드 블록 색칠, SVG는 `svgElement`, HTML은 DOMPurify), `.nb-*` CSS(기존 토큰만).
- 하지 않은 것: 실행·커널·위젯·셀 접기·셀 편집 UI·ANSI 색 재현·출력 크기 설정(M-7). CSP 변경 없음.
- 남은 위험: DOMPurify 정화와 DOM 생성은 node에 DOM이 없어 단위 테스트가 없다(V3로만 확인). `stripAnsi`는 CSI만 지운다 — OSC(터미널 링크 등)는 글자로 남을 수 있다(textContent라 보안 위험 없음, C-08 의견).

## tauri가 고른 것
- 보일 것이 없는 출력: `Output not shown (<MIME 전부를 ", "로>)` 한 줄.
- `image/png`·`jpeg` 값이 base64가 아니면 그림을 만들지 않고 `Output not shown (image/png)`. `<svg>` 없는 SVG도 같은 한 줄.
- HTML 출력: 마크다운 미리보기 규칙에 더해 `<style>`도 지움 — pandas `<style scoped>`가 `style-src 'unsafe-inline'`(ORDER-03) 아래서 앱 전체에 번질 수 있어서. HTML 안 `<img>`는 `data:image/`만 남김.
- 마크다운 셀은 `data-line`을 지워 블록을 눌러도 편집기 선택이 움직이지 않음(M-1, 셀 줄 번호가 파일 줄이 아님).
- `[n]`은 code 블록 위 왼쪽 한 줄. 오류·stderr 색은 `--error`.
- 잘못된 파일: `nbformat` 키가 있고 4가 아니면 `cells` 유무와 상관없이 "Unsupported notebook format"(K-04b — 실제 nbformat 3 파일은 `worksheets`라서), JSON 아님·객체 아님·`cells` 없음은 "Not a valid notebook".

## 바꾼 파일
- `src/editor/notebook.ts`(새), `src/editor/notebook.test.ts`(새), `src/editor/preview-kind.ts`, `src/shell/markdown-preview.ts`, `src/app.css`, `src/editor/csv.test.ts`(`.ipynb` 미리보기 대상 기대값), `specs/v0.8/PLAN.md` — `acbae85`
- `specs/v0.8/verify/ORDER-04/`, `specs/v0.8/PROGRESS.md` — `bc04ca3`

## 미정
- 모양(V4 사용자 확인): 셀 사이 구분선 없음(여백으로만 구분), `[n]` 위치(코드 블록 위 한 줄), 오류·stderr 색 `--error`, 그림 여러 개 세로 나열.

## BLOCKED
- 없음.
