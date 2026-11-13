[DONE] ORDER-06 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| 1 같은 모양 | 바탕 CSS가 마크다운 미리보기 CSS·변수와 같은 출처에서 온다(8절: 코드 근거 + 단위 테스트), 계산값 대조는 Phase 7 | 코드 근거 충족, 계산값 Phase 7에서 잼 | 실행 중인 앱의 미리보기 규칙 `cssText`를 모아 넣고 변수는 `.markdown-preview` 계산값으로 바꿈 `src/shell/markdown-preview.ts:182-199`, 선택자만 바꿈 `src/editor/html.ts:146-159`. 프레임 전용 규칙은 `html.ts:134-136` 셋뿐이고 같은 변수를 씀. 하위 목록 2em `src/app.css:872`, `src/spec/metrics.ts:232`. 테스트 `src/editor/html.test.ts` "the frame's base style is one cascade layer…" |
| 2 페이지 CSS 우선 | 페이지 CSS가 정한 속성은 페이지 값 (V1 + V3) | V1 충족, V3 Phase 7에서 잼 | 바탕 전체를 `@layer{…}` 하나로 감쌈 `html.ts:159`(레이어 밖 페이지 규칙이 특이도와 무관하게 이김). 같은 테스트 `startsWith("@layer{")` |
| 3 설정 반영 | 글자 크기·간격·테마·제목 색을 바꾸면 열린 HTML 미리보기에 반영 (V1 + V3) | V1 충족, V3 Phase 7에서 잼 | 알림 `src/theme/apply.ts:22,59`, `src/settings/load.ts:45,83`, 다시 그리기 `markdown-preview.ts:422,576`(새 스타일이 지난 것과 다를 때만). 테스트: 값이 바뀌면 스타일 문자열이 달라짐 |
| 4 코드 블록 | `language-python`에 구문 강조·언어 이름·복사, 언어 없는 `<pre>`는 복사만, 줄 번호 설정 (V1 + V3) | V1 충족(순수 부분), V3 Phase 7에서 잼 | 상자 `markdown-preview.ts:97`, 미리 칠하기 `:122`, 프레임용 `:165`, 복사 스크립트 `html.ts:205-209`. 테스트 "a code block's language, line numbers and Copy in the frame". 상자를 만드는 DOM 코드는 node에 DOM이 없어 테스트 없음 |
| 5 격리 | 격리 조건 다섯·외부 요청 0, 기존 격리 테스트 통과, 프레임 CSP diff·앞뒤 값, 앱 CSP·capability diff 없음, `sandbox` 그대로 (V1 + V0) | 충족 | 기존 `html.test.ts` 13개 무수정 통과(고친 곳은 import 두 줄과 새 테스트 3개). 프레임 CSP·`sandbox="allow-scripts"` 줄 +/- 없음(`markdown-preview.ts:343-344`). `git diff --stat -- src-tauri/tauri.conf.json src-tauri/capabilities` 비어 있음. 프레임 문서 앞뒤 값은 아래 |
| 6 새 메시지 | 프레임 → 앱 새 메시지 목록과 최악의 경우 (V0 + V1) | 충족 | 아래 "프레임 → 앱 새 메시지". 테스트 "a copy request is taken only from the preview's frame…" |
| 7 시안 페이지 | v0.8.1 시안 페이지가 달라졌는지 (V3) | 차이 목록 충족(코드로 읽음), 캡처 Phase 7에서 잼 | 아래 "시안 페이지" |
| 8 테스트 | 전체 테스트 통과, typecheck 0 (V1) | 충족 | 아래 "검증" |

### 프레임 CSP·프레임 문서 앞뒤 값
- 프레임 CSP(`PREVIEW_CSP`): 앞뒤 같음(바꾸지 않음). `sandbox="allow-scripts"` 그대로.
- 프레임 문서 `<head>` 맨 앞(`headStart`):
  - 앞: `<meta CSP>` `<style>:where 기본값 셋</style>` `<script>WebRTC 제거·ready·ping·scroll</script>` `<script>링크 클릭(토큰)</script>`
  - 뒤: `<meta CSP>` `<style>:where 기본값 셋</style>` `<style>@font-face(data:) … @layer{바탕 모양}</style>` `<script>(그대로)</script>` `<script>링크 클릭 + 복사 버튼 클릭(같은 IIFE, 같은 토큰)</script>`
- 프레임 문서 본문(앱이 비활성 DOM에서 바꿈): 모든 `<table>`을 `div.table-wrap`으로, 모든 `<pre>`를 `div.code-block`(머리 줄 + 줄 번호 칸 + 원래 `pre`)으로 감쌈. 언어가 있고 안에 태그가 없는 코드는 `span.cm-syntax-*`로 미리 칠함.

### 프레임 → 앱 새 메시지
- 하나: `{ previewCopy: { token, text } }`.
- 받는 조건(`html.ts:167` `copyRequest`, `markdown-preview.ts:333`): `e.source`가 이 미리보기의 프레임 창, `token`이 이 미리보기의 비밀 값, `text`가 문자열. 통과하면 `write_clipboard_text(text)`만 한다.
- 보내는 조건(head 스크립트): 사용자가 실제로 누른 클릭(`isTrusted`)이고 대상이 `button.code-block-copy`일 때만. 토큰은 링크 스크립트와 같은 클로저 안에 있고 스크립트는 스스로 지워진다(v0.8.1 I-24와 같은 근거).
- 최악의 경우: 페이지가 `button.code-block-copy`와 `.code-block > pre`를 직접 만들어 두고 사용자가 그 버튼을 직접 누르면 페이지가 고른 글자가 클립보드에 들어간다(보통 웹 페이지의 복사 버튼과 같음). 클릭 없이 쓰기, 클립보드 읽기, 다른 IPC는 안 된다.

## 검증
- K-07(커밋 `a66d40a`): `npm.cmd run test` tests 335, pass 335, fail 0. `npm.cmd run typecheck` 오류 0. `git diff --stat -- src-tauri/tauri.conf.json src-tauri/capabilities` 비어 있음. 프레임 CSP·sandbox 줄 diff 없음. Rust 변경 없음(cargo 안 돌림). 앱 안 띄움.
- checker C-07 diff 리뷰(프레임 쪽 중심, 격리 조건 다섯을 카드에 옮겨 적음): PASS, 지적 없음(CSP·sandbox 줄 무변경, `previewCopy`의 창·토큰·형식 검사와 `isTrusted`·토큰 은닉, 외부 URL 주입 길 없음, `</style>` 탈출 방지, 본문 바꾸기는 `textContent`만, `@layer`, 늦은 렌더 폐기, 기존 테스트 무수정). 테스트 재실행 없음(COMMON 8절).
- 화면 검증: 하지 않음. 6절 #1~#5·#7은 Phase 7에서 잼.

## 지운 것·더한 것·하지 않은 것
- 더함: HTML 프레임 바탕 모양(`@layer`, 앱 미리보기 규칙을 실행 중에 모음), 글꼴 `data:` `@font-face`, 설정·테마 바뀜 알림과 다시 그리기, 표 `table-wrap`·코드 블록 상자·미리 칠한 구문 강조, 복사 버튼과 `previewCopy` 메시지. 하위 목록 들여쓰기 2em(마크다운·ipynb·HTML).
- 하지 않음: HTML 미리보기 Outline·클릭 표시·`Ctrl`+`+`/`-`·찾기·섹션 접기(ORDER-07), 새 의존성, 프레임 순서 문제 둘(`load` 리스너와 `previewScrollTo` 줄 그대로), `@media` 안 중첩 규칙 모으기(지금 미리보기 규칙은 모두 최상위).
- 남은 위험: 프레임 안 실제 동작은 한 번도 실행하지 않음 — release 빌드에서 `cssRules`·`cssText`가 `var()`를 그대로 내주는지, `data:` 글꼴 로드, 비동기 렌더의 체감 속도, 복사 버튼 모양·클립보드, 페이지 자체 스타일 `<pre>`가 상자 안에서 어떻게 보이는지는 Phase 7에서 먼저 본다. 렌더가 동기에서 비동기로 바뀜(늦게 끝난 렌더는 버림). 페이지가 `.code-block`·`.table-wrap`·`.icon` 클래스를 직접 쓰면 바탕 규칙이 그 요소에도 걸림(`shortcut:` 주석). 옛 HTML 속성(`<img height>`·`<table width>`·`bgcolor`)은 바탕 규칙이 이김.

## tauri가 고른 것
1. 바탕 CSS의 출처: 값을 베끼지 않고 실행 중인 앱의 스타일 규칙(`document.styleSheets`·`adoptedStyleSheets`)에서 미리보기 규칙의 `cssText`를 모아 넣는다. 변수는 `.markdown-preview` 프로브의 계산값으로 바꿔 넣는다 — 페이지가 `--text`·`--border` 같은 이름을 직접 정의해도 바탕 규칙에 섞이지 않게.
2. 페이지보다 약하게: `:where()` 대신 cascade layer 하나. 레이어 밖 페이지 규칙이 늘 이기고, 바탕 규칙끼리의 우선순위는 마크다운 미리보기와 같다.
3. 글꼴: 앱이 자기 글꼴 파일(same-origin `/fonts/...`, 앱 CSP `connect-src 'self'` 안)을 읽어 `data:` `@font-face`로 넣는다. 프레임 CSP `font-src data:` 그대로. `asset:`은 asset protocol이 앱 origin에만 CORS를 답해 프레임(불투명 origin)에서 못 쓴다. [BLOCKED]가 아니라 실제 로드는 Phase 7에서 확인.
4. 하위 목록 2em은 하위 목록(`li > ul, ol`)에만. 최상위 목록 들여쓰기는 지금(40px) 그대로(카드가 "하위 목록"만 말함).
5. 표는 마크다운처럼 `div.table-wrap`으로 감쌈(같은 규칙, 넓은 표는 그 안에서 가로 스크롤).
6. 구문 강조는 앱에서 미리 칠해 넣음(프레임 안에서 하려면 파서 wasm을 프레임에 실어야 해 더 큼).
7. 설정 반영: 테마 적용·설정 다시 읽기·미리보기 글자 크기 단축키 뒤에 알리고, 새 스타일이 지난 것과 다를 때만 다시 그림.

## 시안 페이지 (`D:\projects\workbench-core\specs\v0.8.1\mockups\outline\index.html`, 코드로 읽음)
페이지가 정한 것(`body` margin·padding·font·color·background, `h1`·`h2` 크기·여백, `.summary` 표의 테두리·글자 크기 등)은 그대로다. 정하지 않은 곳에 바탕이 들어가 달라 보인다:
1. 본문 너비(가장 큰 차이): `body`에 `max-width`가 없어 700px이 걸리고, 페이지 `margin:0`이 이겨 가운데가 아니라 왼쪽에 붙는다. 780px짜리 `.app` 시안 그림이 본문 밖으로 삐져나오고, 다크·라이트 두 칸(`.themes`)이 나란히가 아니라 위아래로 쌓인다.
2. `html`에 바깥 여백 14px이 더해진다.
3. `h1`·`h2` 아래 밑줄, 굵기 600·줄 높이 1.25, 색이 Preview 테마 글자색(제목 색 켬이면 단계별 색). 페이지 배경은 OS 다크/라이트를 따르므로 Preview 테마와 어긋나면 제목 대비가 나빠질 수 있다.
4. 표 `.summary`: 너비 100%, 바깥 테두리·둥근 모서리, 머리 행 배경, 짝수 행 음영.
5. `p` 줄 높이가 설정값으로 바뀐다.
6. `<pre>`는 없어 코드 블록 영향 없음.

## 바꾼 파일
- `src/editor/html.ts`·`html.test.ts`, `src/editor/code-block.ts`, `src/shell/markdown-preview.ts`, `src/theme/apply.ts`, `src/settings/load.ts`, `src/app.css`, `src/spec/metrics.ts`. 코드 커밋 `a66d40a`.

## 미정
- 글꼴을 렌더마다 프레임 문서에 싣는 비용: 기본 글꼴로 base64 약 0.9MB, 코드 글꼴 D2Coding이면 약 5.6MB. 편집 중 200ms 디바운스마다 다시 보낸다. 느리면 대안은 preview scheme에서 글꼴을 주는 길(Rust + 프레임 CSP `font-src` 변경) — leader-core가 정함. Phase 7에서 체감 속도를 먼저 본다.
- 최상위 목록 들여쓰기도 2em으로 할지 — leader-core.
- 시안 페이지 1번(본문 700px 때문에 시안 그림이 넘치고 두 칸이 쌓임)을 받아들일지 — leader-core/사용자.

## BLOCKED
- 없음
