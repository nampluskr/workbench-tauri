[DONE] ORDER-03 tauri

> 화면 측정은 ORDER-03 8절·COMMON 8절대로 Phase 7로 옮겼고, 이 카드에서는 앱을 띄우지 않았다. checker는 diff 리뷰만 했다(정화 규칙 중심, PASS).

## 완료 기준

| 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|
| 1 I-24 그림 | md `<h2>`·노트북 markdown 셀 `<h1>`이 제목으로, 사용자 노트북 첫 줄이 제목 | 충족(V1, 변환 결과 DOM). V3는 Phase 7에서 잼 | `src/editor/markdown.ts:32`(`html: true`). 테스트 `src/editor/markdown.test.ts:34` — 사용자 노트북(`D:\projects\edu-ai-rag-agent\labs\01-llm-langchain\01-llm-langchain-lab.ipynb`) 첫 셀 `<h1>LLM LangChain</h1>`을 시험 입력으로 옮겨 적어 제목 요소로 나옴. 기존 "D-10: raw HTML … is text" 테스트를 대체 |
| 2 I-24 정화 | 허용·금지 목록, 시험 입력이 결과에 안 남음 | 충족(V1 — 허용 목록 판정, 아래 "미정" 1) | 허용 목록은 "tauri가 고른 것". 테스트 `src/editor/markdown.test.ts:34`: `script`·`style`·`iframe`·`form`·`onclick`·`onerror`가 허용 목록에 없음, 노트북 출력 금지 목록의 모든 항목이 본문 허용 목록에 없음, 허용 태그(제목·표·`br`·`img`)는 있음, `javascript:` 링크는 `classifyLink` → 열지 않음, 외부 `<img src="http…">`는 `localImagePath` → 요소 제거 |
| 3 I-24 보안 설정 | CSP·capability diff 없음, 정화 규칙 diff 파일·줄 | 충족 | `git diff c0609e5 -- src-tauri/tauri.conf.json src-tauri/capabilities` → `"version"` 한 줄. 정화 규칙 diff: `src/editor/markdown.ts:11-23`(허용 태그·속성), `:32`(`html: true`), `src/shell/markdown-preview.ts:58-59`(DOMPurify 설정), `:60-64`(이미지 로컬화·제거, 기존 코드 변경 없음), `src/editor/markdown.ts:196-207`(`classifyLink`). 이전 설정은 `FORBID_ATTR: ["style"], ALLOW_DATA_ATTR: true`(DOMPurify 기본 허용 전체) |
| 4 I-24 Outline | 본문 HTML 제목이 Outline에, 항목 → 스크롤 대상 대응 | 충족(V1) | 변환기가 `#` 제목과 본문 HTML 제목 모두에 문서 순서 번호 `data-heading`을 단다(`markdownHeadings`와 같은 목록). `.ipynb`는 "`data-heading`이 n인 요소"로 스크롤(`src/shell/markdown-preview.ts:433`, 번호는 셀을 넘어 이어짐 `:175`) — 정화로 요소가 빠져도 뒤 항목이 밀리지 않음. `.md`는 줄 번호 스크롤 그대로, Outline은 tree-sitter 항목에 본문 HTML 제목을 줄 순서로 끼워 넣음(`src/syntax/outline.ts:121-141`, `src/shell/Outline.tsx:84-88`, 본문에 `<h1`~`<h6`가 없으면 기존 경로). 테스트 `src/syntax/outline.test.ts:108` |
| 5 I-20 표 | 누른 곳 × 대상 × Alt, Lock Preview 무관 | 충족(V1) | 테스트 `src/editor/markdown.test.ts:141`. 표는 아래 "I-20 링크 분류". 분류는 `hasPreview`(`src/editor/preview-kind.ts`, M-7 한 곳)를 쓴다. Alt+클릭은 `openSource`로 직접(`src/workspace/context.ts:543-545`) — Lock Preview가 입력이 아님 |
| 6 I-20 화면 | 새 세 조합이 실제 클릭으로 미리보기 탭 | Phase 7에서 잼 | 앱 안 띄움(8절) |
| 7 I-20 조건 | 프레임 쪽 링크 확인 코드 diff 없음, `file:`·`javascript:` 안 열림 | 충족(V0 + V1) | 프레임 스크립트 `headStart`, 토큰 확인 `onFrameMessage`, sandbox, 프레임 CSP에 diff 없음. `src/editor/html.ts`의 변경은 앱 쪽 `classifyHtmlLink`를 `classifyLink` 위임으로 줄인 것과 안 쓰게 된 import 한 줄뿐. `src/editor/html.test.ts` 기존 I-24 테스트는 CSV 한 줄(편집 탭 → 미리보기, I-20)만 기대값을 바꾸고 `file:`·`javascript:`·`mailto:` null은 그대로 통과. checker C-03 2·3절 |
| 8 테스트 | 전체 test·typecheck | 충족 | `npm.cmd run test` 321 통과·실패 0·건너뜀 0, `npm.cmd run typecheck` 0(coder K-03, 커밋 `c85b317` 전 1회). Rust 안 건드림 → cargo 안 돌림 |
| 9 `<pre><code>` 안쪽 태그 | 안쪽 태그 유지 + 앞뒤 빈 줄 숨김 | 충족(V1) | `textContent`로 평평하게 하던 것을 코드 안 텍스트 노드에만 잘라 넣게 바꿈(`src/editor/code-block.ts:10-24` `trimBlankLinesIn`, `src/shell/markdown-preview.ts:99-105`). 복사·줄 번호는 같은 글자. 안쪽 태그가 있는 코드는 구문 색칠을 건너뜀(`:364`, 색칠이 안쪽 태그를 지우므로). 테스트 `src/editor/code-block.test.ts:21` |

### I-20 링크 분류 (테스트와 같은 표)

누른 곳 md·ipynb·HTML 세 곳 모두 같다. Lock Preview는 분류의 입력이 아니다.

| 대상 | 그냥 클릭 | Alt+클릭 |
|---|---|---|
| `.md` | 미리보기 | 편집 탭 |
| `.ipynb` | 미리보기 | 편집 탭 |
| `.html` | 미리보기 | 편집 탭 |
| `.csv` | 미리보기 | 편집 탭 |
| `.tsv` | 미리보기 | 편집 탭 |
| 그 밖(`.py`) | 편집 탭 | 편집 탭 |
| `http://`·`https://` | 브라우저 | 브라우저 |
| `file:` | 안 열림 | 안 열림 |
| `javascript:`(탭 문자 섞인 것 포함) | 안 열림 | 안 열림 |
| `mailto:`, `//host` | 안 열림 | 안 열림 |

- "미리보기가 있는 파일"은 `hasPreview` 그대로라 `.svg`·`.mmd`·`.mermaid`·`.htm`·`.markdown`도 미리보기로 열린다.
- `#id`: md·ipynb는 그 미리보기의 제목으로 스크롤, HTML은 페이지가 스스로 이동(둘 다 기존).

## 검증

- `npm.cmd run test` 321/321(건너뜀 0), `npm.cmd run typecheck` 0 (coder 출력, checker는 다시 돌리지 않음 — COMMON 8절).
- 보안 설정: `git diff c0609e5 -- src-tauri/tauri.conf.json src-tauri/capabilities` → version 한 줄.
- checker C-03 diff 리뷰 PASS(정화 규칙 — 위험 태그·속성 없음, 노트북 출력 규칙보다 엄격, `innerHTML`·`insertAdjacentHTML` 우회 경로 없음, 프레임 쪽 diff 없음). 보고 `C:\Users\nampl\AppData\Local\Temp\v082-C-03-report.md`.
- 화면: 없음(#1·#6 V3는 Phase 7에서 잼).

## 지운 것·더한 것·하지 않은 것

- 바꿈: 본문 HTML 정화를 DOMPurify 기본 허용 + `style` 금지에서 허용 목록으로. 더함: `markdownHeadings`·`data-heading`, `classifyLink`(md·ipynb·HTML 공통 앱 쪽 분류), `trimBlankLinesIn`.
- 바뀐 동작 둘(md·ipynb 미리보기): `mailto:`·`file://` 링크는 전에 "외부"로 열기 시도 → 권한 거부 알림이었으나 이제 아무 일도 없다(HTML 미리보기와 같은 규칙, v0.8.1 I-24 "외부는 http(s)만"). 잘못된 `%` 이스케이프 링크는 전에 예외였고 이제 무시된다. 덤: `markdownHeadings`가 미리보기와 같이 frontmatter를 비우고 읽는다(전에는 `---`로 시작하는 셀에서 Outline과 미리보기가 다를 수 있었음).
- 하지 않음: 제목 번호·색·접기(ORDER-04), HTML 미리보기 프레임 모양·상호작용(ORDER-06·07), 화면 측정(Phase 7), 새 태그(`details`·`center`·`font`) 모양 CSS.
- 남은 위험(알고 둠):
  - 문단·표 칸 **안**의 인라인 `<h1>`(예: `text <h3>x</h3>`)은 제목으로 그려지지만 Outline에는 안 나온다(`shortcut:` 주석 `src/editor/markdown.ts:42`). 번호를 명시적으로 달아 다른 항목의 스크롤은 어긋나지 않는다. 줄 처음·`<div>` 안의 블록 제목은 모두 나온다.
  - `class`를 허용하므로 문서가 앱의 클래스 이름을 흉내 내 모양을 바꿀 수 있다(동작은 없음, 노트북 출력도 같음). 변환기가 `class`를 쓰므로 통째로 막을 수 없다.
  - 문서가 `data-line`·`data-heading`을 직접 써도 변환기 값이 앞에 들어가 이긴다. 변환기가 표시하지 않는 요소에 쓰면 그 문서 안의 클릭 위치·스크롤만 이상해진다.
  - 닫는 태그나 주석으로 시작하는 HTML 블록은 위치 연계 표시가 없다(클릭해도 아무 일 없음).

## tauri가 고른 것

- **본문 HTML 정화 = 허용 목록**: `ALLOWED_TAGS: MARKDOWN_HTML_TAGS, ALLOWED_ATTR: MARKDOWN_HTML_ATTR, ALLOW_DATA_ATTR: false, ALLOW_ARIA_ATTR: false`.
  - 허용 태그(64): `h1`~`h6`, `p div span br hr blockquote pre code kbd samp var`, `em strong b i u s del ins mark small sub sup abbr cite q dfn time ruby rt rp wbr`, `a img`, `ul ol li dl dt dd`, `table thead tbody tfoot tr th td caption colgroup col`, `details summary figure figcaption center font`
  - 허용 속성(27): `href title src alt width height align valign colspan rowspan scope span start type reversed open class lang dir color size border cellpadding cellspacing` + 변환기가 쓰는 `data-line data-line-end data-heading`
  - 그 밖은 모두 금지. 노트북 출력 규칙(`src/editor/notebook.ts:20-21`, DOMPurify 기본 − 금지 목록)과 비교:

| 항목 | 노트북 출력 | 본문 HTML(새로) |
|---|---|---|
| 방식 | 기본 허용 − 금지 목록 | 허용 목록만 |
| `script` `iframe` `form` `style` | 금지 | 금지 |
| `input` `button` `select` `textarea` | 허용 | 금지 |
| `svg` `math` | 허용 | 금지 |
| `audio` `video` `source` `picture` `map` `area` | 허용 | 금지 |
| `on*` 이벤트 속성, `style` 속성 | 금지 | 금지 |
| `id` `name` `srcset` `poster` `background` | 허용 | 금지 |
| `data-*` | 허용 | 변환기 셋만 |
| `aria-*` | 허용 | 금지 |
| `javascript:` 주소 | DOMPurify가 속성 제거 | 같음 + 클릭 분류에서도 열지 않음 |
| `<img>` | `data:image/`만 | 로컬 파일만(asset 경로), 그 밖은 요소 제거 |

- **본문 HTML의 이미지·링크 = 마크다운과 같은 규칙**: `<img src>`는 마크다운 이미지와 같은 `localImagePath`를 지나 md 파일 기준 상대·절대 로컬 경로만 남고 스킴이 있는 주소(http·https·data·file)는 요소째 지워진다(외부 요청 없음, M-8). `<a href>`는 마크다운 링크와 같은 클릭 분류(`classifyLink`)를 지난다.
- `<svg>`·`<math>`·`<video>`·`<audio>`는 외부 요청 경로가 많아 허용하지 않았다.

## 바꾼 파일

- `c85b317` 코드: `src/editor/markdown.ts`·`markdown.test.ts`, `src/editor/markdown-it.d.ts`, `src/editor/html.ts`·`html.test.ts`, `src/editor/code-block.ts`·`code-block.test.ts`, `src/shell/markdown-preview.ts`, `src/shell/Outline.tsx`, `src/syntax/outline.ts`·`outline.test.ts`, `src/workspace/context.ts`
- `94a02a7` PROGRESS(ORDER-02 끝, ORDER-03 시작)
- 이 보고·PROGRESS·ITEMS-MAP: 다음 커밋

## 미정

1. **정화를 실제 DOMPurify로 돌린 결과는 확인하지 않았다.** `node --test`에는 DOM이 없어 DOMPurify가 아무것도 하지 않으므로(기존 `svg.test.ts`도 같은 이유로 정책 목록만 시험), #2 테스트는 "시험 입력의 태그·속성이 허용 목록에 없음"과 순수 함수(`classifyLink`·`localImagePath`)로 판정했다. jsdom 같은 devDependency는 의존성 추가라 하지 않았다. tauri 제안: ORDER-07 V3에서 시험 입력이 든 마크다운 한 장을 미리보기로 열어 정화된 DOM을 덤프로 한 번 확인(새 의존성 없음). 이것으로 할지 leader-core가 정한다.
2. ORDER-02 미정(HTML 프레임 순서 문제 (가)·(나))은 그대로 남아 있다.

## BLOCKED

- 없음
