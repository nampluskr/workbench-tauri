[DONE] ORDER-06 tauri

> 보고: ORDER-06 · 작성일: 2026-11-11 · 보낸 이: tauri-leader · 받는 이: leader-core

## 완료 기준
V3는 **release exe**(0.8.0, ORDER-06 빌드)로 쟀다. 근거는 `specs/v0.8/verify/ORDER-06/v3.json`과 캡처.

| 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|
| 1 스타일 없는 HTML | `<h1>`·`<p>`·`<a>`만 있는 HTML의 배경·글자·링크 = 같은 Preview 테마의 마크다운 미리보기, One Dark·One Light | 충족 | `c1_plain_OneDark`: 마크다운 bg rgb(40,44,51)·글자 rgb(220,224,229)·링크 rgb(116,173,232) = HTML 프레임 배경·글자·링크(`same` 셋 다 true), 문서 html·body 배경 투명, `color-scheme` 루트·프레임 dark, 캡처 픽셀 왼쪽 위 여백·오른쪽 아래 41,44,51. `c1_plain_OneLight`: rgb(250,250,250)·rgb(36,37,41)·rgb(92,120,226) 모두 같음, `color-scheme` light, 픽셀 250,250,250. `c1-plain-html-OneDark.png`·`c1-plain-html-OneLight.png` |
| 2 페이지 CSS가 이김 | `body{background:rgb(1,2,3);color:rgb(4,5,6)}`·`a{color:rgb(7,8,9)}` — 링크 CSS·`<style>`·`style=` 각각 | 충족 | `c2_page_wins` 세 파일 모두 body 배경 rgb(1,2,3)·글자 rgb(4,5,6)·링크 rgb(7,8,9), 캡처 픽셀 왼쪽 위 body 여백과 오른쪽 아래 모두 1,2,3(body에만 준 배경이 프레임 전체로 퍼짐). `c2-page-wins.png` |
| 3 테마 바꾸기 | 연 채로 One Dark ↔ One Light, 다시 열지 않고 배경·글자색·`color-scheme` 바뀜 | 충족 | `c3_theme_switch`: 탭 그대로(`panesDuringSwitch` `[["plain.html","Preview plain.html"]]`), dark → light: 프레임 배경 rgb(250,250,250)·글자 rgb(36,37,41)·링크 rgb(92,120,226)·`color-scheme` light·srcdoc 첫 `<style>` 값도 light로 바뀜 → back: dark 값으로 돌아옴. settings.json을 바꾼 뒤 Preview 테마 시트가 바뀌기까지 4번 모두 500 ms 이내(`themeWaits`). `c3-switch-dark.png`·`c3-switch-light.png` |
| 4 보안 그대로 | `tauri.conf.json` = `e295b71`, sandbox `allow-same-origin` 하나, JS·인터넷·이동 막기 각 한 사례 | 충족 | `git diff e295b71 -- src-tauri/` 0바이트. `c4_security`: evil.html 전역 null·script 0·sandbox `allow-same-origin`·콘솔 EVIL 0, net.html `example.com` 요청 0, links.html `#h`·`https://` 클릭 뒤 `about:srcdoc` 그대로·CDP 대상은 앱 page 하나·요청 0. `htmlSrcdoc` 정화 규칙은 그대로(C-12) |
| 5 회귀 | 마크다운(위치 연계)·ipynb·SVG·CSV·이미지·PDF·수식·Mermaid, release exe | 충족 | `c5_regress`: active-block "Section 3", 마크다운 배경 rgb(40,44,51), ipynb 셀 2·`[1]`·"one", SVG rgb(255,0,0), CSV "x\ny", 이미지 40, PDF iframe 1000×756 + 뷰어 1, 수식 1·Mermaid 노드 A·B. `c5-rich.png` |
| 6 빌드 | 0.8.0 설치 파일 새로, BUILD.md에 크기·시각 | 충족 | `workbench-tauri_0.8.0_x64-setup.exe` 7,463,747 B, 2026-11-11 10:00:05, ProductVersion 0.8.0(ORDER-05 빌드 대비 +4,725 B, 0.7.0 대비 +1,398,253 B, +23.05%). 앱 exe 18,290,176 B. `docs/BUILD.md` 4·5절 |
| 7 테스트 | 기본 스타일(우선순위가 페이지 CSS 앞, 테마 값) 테스트, 기존 통과, typecheck 0 | 충족 | `src/editor/html.test.ts` "I-11: default style is specificity 0, carries the theme values, and sits first in `<head>`"(선택자 전부 `:where()`, 값 반영, 배경 없음, `<head>` 첫 자식·페이지 `<style>`보다 앞, 속성 안 `<head>` 문자열에 속지 않음). `npm.cmd run test` 287/287, typecheck 0. Rust 변경 없음 |

## 검증
- `npm.cmd run typecheck` 0, `npm.cmd run test` 287/287, `npm.cmd run tauri build`(release, NSIS) 성공. 빌드 전 실행 중인 workbench-tauri 없음 확인(사용자 0.8.0 창에 영향 없음).
- V3: 주 모니터 1920×1080 100%, 창 1440×852, Theme One Dark, Preview 테마는 settings.json `preview_theme`로 바꿈, release exe, CDP 입력만. 첫 두 번은 측정 스크립트 버그(설정 파일 경로의 역슬래시가 빠져 다른 파일에 씀)로 테마가 바뀌지 않았다 — 앱이 아니라 스크립트 문제임을 따로 확인(같은 exe에서 올바른 경로로 쓰면 8초 안에 바뀜)하고 고쳐 다시 쟀다. 결과 파일은 마지막 실행 것.
- 검토: C-12(K-06a·K-06b) PASS, C-13(V3 판정 #1~#7) PASS.

## 지운 것·더한 것·하지 않은 것
- 더한 것: srcdoc `<head>` 맨 앞 0 특이성 `<style>`(`:where(:root){color-scheme}`·`:where(html){color}`·`:where(a){color}`), Preview 테마 바뀜 알림(`onPreviewThemeChange`, 값이 바뀔 때만) → HTML 미리보기 `changed()`(기존 디바운스 경로), `.html-frame { background: var(--editor-background); color-scheme: var(--preview-color-scheme) }`.
- 지운 것: `.html-frame`의 `color-scheme: dark` 고정.
- 하지 않은 것: HTML 미리보기 전용 설정, 페이지 CSS 덮어쓰기, 링크 밑줄 등 L-108의 나머지 값(M-7). CSP·sandbox·정화 규칙 변경 없음.
- 남은 위험: 테마를 바꾼 직후 배경·`color-scheme`(CSS)은 바로, 글자·링크색(srcdoc 다시 그리기)은 디바운스 뒤 바뀐다 — 그 사이 잠깐 어색한 조합이 보일 수 있다.

## tauri가 고른 것
- 기본 **배경은 iframe 요소**에 두고 문서는 투명하게: ORDER-06의 예(`:where(html)`)대로 문서에 배경을 넣으면 페이지가 `body`에만 배경을 줄 때 body 배경이 캔버스로 퍼지지 않아(브라우저 규칙) 테마 배경 띠가 남는다. coder(K-06a)가 짚었고 leader가 K-06b로 바꿨다. 가장 약한 우선순위라는 결정 범위 안이고, V3에서 body만 배경을 준 페이지가 프레임 전체를 채우는 것을 확인했다.
- iframe 요소와 문서 루트의 `color-scheme`을 같은 값으로(다르면 Chromium이 불투명 캔버스를 그려 요소 배경을 가림). 요소 쪽은 CSS 변수 `--preview-color-scheme`(마크다운 미리보기 자체의 `color-scheme`은 바꾸지 않으려고 변수로).
- 값 출처: 마크다운 미리보기와 같은 토큰(`editor.background`→`--editor-background`, `text`, `text.accent`). 글자·링크색은 `applyTheme`가 푼 토큰 값(정규화된 `#rrggbbaa`라 srcdoc을 깰 문자열이 들어갈 수 없음, C-12).

## 바꾼 파일
- `src/editor/html.ts`, `src/editor/html.test.ts`, `src/theme/apply.ts`, `src/shell/markdown-preview.ts`, `src/app.css`, `specs/v0.8/PLAN.md` — `2866205`
- `specs/v0.8/verify/ORDER-06/`, `docs/BUILD.md`, `specs/v0.8/PROGRESS.md` — `678836a`

## 미정
- 사용자 확인: 테마 바꾼 직후 잠깐의 색 조합, UI 테마와 Preview 테마가 다를 때(One Dark UI + One Light 미리보기) 모양.

## BLOCKED
- 없음.
