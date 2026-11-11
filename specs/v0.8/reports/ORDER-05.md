[DONE] ORDER-05 tauri

> 보고: ORDER-05 · 작성일: 2026-11-11 · 보낸 이: tauri-leader · 받는 이: leader-core

## 완료 기준
V3는 모두 **release exe**(0.8.0)로 쟀다. 근거 파일은 `specs/v0.8/verify/ORDER-05/`.

| 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|
| 1 I-4 그리기 | 마크다운·ipynb 마크다운 셀에서 `$E=mc^2$`·`$$\int_0^1 x\,dx$$`·분수·행렬이 수식 | 충족 | `v3.json` `c1_c2_c3_math`: 인라인 `E=mc^2`·`\frac{a}{b}`(mfrac 1)는 `<math>`, 블록 두 개 `math[display=block]`(적분 msubsup 1, 행렬 mtable 1). ipynb 마크다운 셀 수식 `c4_mermaid_block.nb.math` 1. `c1-math-top.png`, `c4-nb-math-mermaid.png` |
| 2 I-4 오인 막기 | 코드 스팬·코드 블록 안, `\$5`, `$5 and $6`, `$ x $`는 수식 아님, `$\frac{$`는 원문+오류, 나머지 그대로 | 충족 | `N1`~`N5` 모두 `math` 0. `BAD`: 원문 `$\frac{$` + 오류 "Unexpected end of input in a macro argument…"(`--error` 색 rgb(208,114,119)), 같은 문단 `$y$`는 수식, 뒤 문단 `TAIL` 굵게 그대로. `c2-math-not.png`. 테스트 `src/editor/math.test.ts` |
| 3 I-4 보안 | `$\href{https://example.com}{x}$`가 링크 아님, 요청 0 | 충족 | `HREF` 문단 링크 0(명령어 글자만 오류 색), 그 자리를 눌러도 탭·CDP 대상 그대로, `example.com` 요청 0, 콘솔 오류·CSP 위반 0. `trust: false` |
| 4 I-5 블록 | 마크다운·ipynb 마크다운 셀 ` ```mermaid ` `graph TD; A-->B`가 다이어그램, 문법 오류는 원문+오류 한 줄 | 충족 | `c4_mermaid_block`: 다이어그램 1(노드 A·B, svg), 오류 블록은 원문 `graph TD; A-->` 남고 "Parse error on line 3:" 한 줄, 뒤 문단 그대로, body에 남는 Mermaid 요소 0, 콘솔 오류 0, 외부 요청 0. ipynb 셀 노드 P·Q. `c4-mermaid-block.png`, `c4-nb-math-mermaid.png` |
| 5 I-5 파일 | `.mmd`·`.mermaid` 눈 버튼·`Ctrl+Shift+V`로 다이어그램, 고치면 바뀜 | 충족 | `c5_mermaid_file`: 두 확장자 모두 편집 탭 먼저, 눈 버튼·`Ctrl+Shift+V` → 같은 pane 미리보기(노드 A·B / X·Y), `data-line` 0(위치 연계 없음). 고치기 A·B → A·Z. `c5-mmd-live.png` |
| 6 I-5 보안·테마 | `click A callback`·`click B "https://…"` 눌러도 무동작·요청 0, One Dark → `dark`, 밝은 테마 → `default` | 충족(K-05d 뒤) | 처음 잼(`v3.json` c6, K-05d 전): 클릭 무동작·요청 0은 맞았으나 링크 노드 B가 다이어그램 (0,0)에 잘려 그려짐 → K-05d. 다시 잼 `v3-c6.json`: 노드 A y105·B y193(제자리), 남은 `<a>` 속성 `data-look,transform`(href·xlink:href·target 없음), A·B 클릭 뒤 탭·CDP 대상 그대로, `example.com` 요청 0, 콜백 오류 0. 노드 fill: One Dark rgb(31,32,32)(Mermaid dark), One Light rgb(236,236,255)(Mermaid default). `c6-mermaid-dark.png`, `c6-mermaid-light.png` |
| 7 지연 로딩 | 수식·Mermaid 없는 마크다운만 열면 두 청크 안 불러옴 | 충족 | `c7_lazy_plain`: 시작 뒤·`plain.md` 미리보기 뒤 resource 목록에 katex·mermaid 청크 0, 네트워크 0. 그 뒤 `math.md`를 열자 `katex-a6gDtQ-e.js`, `mermaid.md`에서 `mermaid.core-…`·`flowDiagram-…`·`elk-…`가 불림 |
| 8 Licenses | View All Licenses에 KaTeX·Mermaid | 충족 | `c8_licenses`: Licenses 탭 글에 `node_modules/katex@0.18.11`·`node_modules/mermaid@12.2.0`. About 주요 라이브러리 목록에 "KaTeX 0.18.11 — MIT", "Mermaid 12.2.0 — MIT"(`c8-about.png` — 스크립트의 About 글자 읽기는 선택자가 틀려 false로 남았고 캡처로 판정), `c8-licenses-mermaid.png` |
| 9 빌드 | 0.8.0 설치 파일, `docs/BUILD.md`에 크기·시각·제품 버전·0.7.0 대비 증가량 | 충족 | `src-tauri\target\release\bundle\nsis\workbench-tauri_0.8.0_x64-setup.exe` 7,459,022 B, 2026-11-11 09:00:48, ProductVersion 0.8.0(leader가 파일 속성으로 다시 확인). 0.7.0 6,065,494 B 대비 **+1,393,528 B(+22.97%)**. 앱 exe 18,289,664 B(+1,457,152 B, +8.66%). `docs/BUILD.md` 4·5·7·8절 |
| 10 회귀 | 마크다운(위치 연계)·CSV·SVG·HTML·ipynb·이미지·PDF, release exe | 충족 | `c10_regress`: 커서 15줄 → active-block "Section 3", 마크다운 `[style]` 0, CSV 셀 "x\ny", SVG fill rgb(255,0,0), HTML sandbox `allow-same-origin`·h1 rgb(10,20,30)·이미지 40, ipynb 셀 2·`[1]`·출력 "one", 이미지 40px, PDF iframe asset 1000×756 + `edge_pdf` 뷰어 1. `c10-pdf.png`. c10은 K-05d 전 release exe(차이는 `rich-blocks.ts` 링크 처리 한 줄) |
| 11 테스트 | 수식 구분 규칙 테스트, 기존 통과, typecheck 0, cargo test·clippy 0 | 충족 | `src/editor/math.test.ts`(오인 사례 14가지, 블록 `data-line`, 잘못된 수식, `trust: false` 출력, `.mmd`·`.mermaid` 판별). `npm.cmd run test` 286/286, typecheck 0, `cargo test` 22 통과, `cargo clippy -- -D warnings` 0 |

## 검증
- `npm.cmd run typecheck` 0, `npm.cmd run test` 286/286, `cargo test` 22/22, `cargo clippy -- -D warnings` 0, `npm.cmd run tauri build`(release, NSIS) 성공 두 번(K-05c, K-05d 뒤).
- `cargo test`는 K-05c 첫 실행에서 `folder_watch::tests::missing_root_is_watched_after_creation_and_recreation`이 한 번 시간 초과로 실패했고, 코드 변경 없이 다시 돌린 네 번은 모두 통과했다(이 카드는 Rust를 바꾸지 않음, BUILD.md 7절).
- V3: 주 모니터 1920×1080 100%, 창 1440×852, One Dark(c6 밝은 쪽은 `preview_theme` "One Light"), release exe, CDP 입력만. 결과 `v3.json`, `v3-c6.json`, 캡처 10장.
- 검토: C-10(K-05a) PASS, C-11(K-05b~d, V3 판정 #1~#11) PASS. C-11 보고가 근거로 든 JSON 키 이름 일부가 실제 `v3.json`과 달라서 위 표의 근거는 leader가 실제 값으로 다시 적었다.

## 지운 것·더한 것·하지 않은 것
- 더한 것: 의존성 `katex` 0.18.11·`mermaid` 12.2.0(그 밖 없음), `src/editor/math.ts`(markdown-it 규칙 2개, 플러그인 없음), `src/shell/rich-blocks.ts`(지연 로딩·그리기), `.mmd`·`.mermaid` 미리보기, Licenses 45개 패키지 원문(+107,534 B).
- 하지 않은 것: `\(…\)`·매크로·수식 번호, 다이어그램 확대·이동·내보내기(M-7). CSP 변경 없음(`git diff 08c588b -- src-tauri/` 비어 있음).
- 남은 위험: KaTeX 출력은 DOMPurify를 거치지 않는다(KaTeX가 escape하고 `trust: false`로 속성 만드는 명령이 꺼짐 — DOMPurify는 MathML `annotation`을 지워 TeX가 보이게 됨, C-10 확인). DOM 교체·세대 번호·캐시는 node 테스트가 없고 V3로만 확인. 첫 flowchart에서 `elk` 청크 1.46 MB도 불러온다(지연 로딩 범위 안, 시작에는 안 읽힘).

## tauri가 고른 것
- 수식 출력: **MathML**(`output: "mathml"`). WebView2가 MathML Core를 그리므로 KaTeX CSS·글꼴 60개를 묶지 않는다 — 글꼴을 인터넷에서 받을 일 없음, KaTeX 청크 258.91 kB(gzip 77.68 kB)뿐. 대가: 글리프는 Windows 수학 글꼴(Cambria Math, 계산값 font-family `math`)이라 KaTeX HTML 출력과 모양이 다르다.
- KaTeX 0.18.11(0.19 아님): Mermaid 12.2.0이 `katex ^0.18`을 요구해 한 벌만 묶이게.
- 수식 구분: 닫는 `$`는 처음 나오는 이스케이프 안 된 `$` 하나(Pandoc과 같음). 로드 전엔 원문이 보이고 로드되면 바뀜.
- 잘못된 수식: 원문 + 오류 메시지 한 줄(`--error` 색, 본문 크기).
- Mermaid: 결과 SVG는 Mermaid `strict`의 내부 DOMPurify를 거친 것을 넣고, 그 위에 `<a>`의 href·xlink:href·target을 지움(K-05d — `<a>`가 노드 위치 transform을 가져서 풀면 안 됨). 같은 그림은 32개까지 캐시해 타이핑 중 깜빡임을 줄임. 오류는 메시지 첫 줄만.
- Licenses 기준: `vite build --sourcemap`에서 번들에 실제로 들어간 패키지(중첩 다른 버전 5개 포함). 라이선스 MIT·ISC·Apache-2.0·BSD-3-Clause·EPL-2.0(`elkjs`).

## 바꾼 파일
- `package.json`, `package-lock.json`, `src/editor/math.ts`(새), `src/editor/math.test.ts`(새), `src/shell/rich-blocks.ts`(새), `src/katex.d.ts`(새), `src/editor/markdown-it.d.ts`, `src/editor/markdown.ts`, `src/editor/preview-kind.ts`, `src/shell/markdown-preview.ts`, `src/theme/apply.ts`, `src/app.css`, `src/licenses/frontend-dependencies.txt`, `src/shell/about.ts`, `src/shell/about.test.ts`, `specs/v0.8/PLAN.md` — `fbaac1e`
- `specs/v0.8/verify/ORDER-05/`, `docs/BUILD.md`, `specs/v0.8/PROGRESS.md` — `aa0e088`

## 미정
- 사용자 확인(V4): 수식 글리프 모양(MathML·Cambria Math), Mermaid 다이어그램 색(One Dark·One Light), 첫 Mermaid 그림의 로드 시간. 앞 카드에서 넘어온 것: HTML 기본 배경 `color-scheme: dark`, PDF 보기 화면, iframe 키보드 포커스, ipynb 셀 구분선·`[n]` 위치.
- `src/licenses/frontend-dependencies.txt`에 지금 번들에 없는 옛 항목 몇 개(`argparse`·`@codemirror/language` 등)가 남아 있다 — 지울지는 leader-core·사용자.
- v0.8 카드 ORDER-01~05가 모두 끝났다. 버전 종료 판단은 사람.

## BLOCKED
- 없음.
