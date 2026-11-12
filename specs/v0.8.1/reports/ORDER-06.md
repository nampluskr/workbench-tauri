[DONE] ORDER-06 tauri

V3: tauri debug exe(간격 `9630b01` 이후 그대로, 찾기 최종 `e845831`), 주 모니터 1920×1080 100%, 창 1440×852, CDP 마우스·키(창을 앞으로). Zed는 1.27.0(c84af5b99cbc366d675064e52b23664a015b6e35, "Restart to Update"가 떠 있었고 업데이트·재시작하지 않음). 근거는 `specs/v0.8.1/verify/ORDER-06/`(캡처, `tauri-before.json`·`tauri-after.json`, `v3-find*.json`, 측정 `measure-spacing.mjs`·`measure-find.mjs`, Zed 창 도구 `zed-window.ps1`, 잉크 줄 분석 `rows.mjs`, 시험 파일 `spacing.md`).

**검토·판정은 대리다**: tauri-checker(agy) 사용 한도(07:32에 풀림)로 leader-core 결정대로 구현에 참여하지 않은 Claude Code 서브 에이전트(새 컨텍스트)가 C-11(코드 검토·V3 판정)을 했다. 같은 Claude 계열이라 독립성이 낮다.

## Zed를 잰 방법
- 사용자 Zed의 설정·테마·창을 바꾸지 않았다. 처음에 `zed --user-data-dir <scratchpad> -n spacing.md`로 따로 띄우려 했으나(`zed-capture.ps1`) CLI가 사용자 Zed 인스턴스(PID 18548)에 새 창을 열었다. 카드 2절이 허락한 "사용자 Zed에서 새 창으로 시험 파일 열기"로 쟀다.
- 새로 연 창 둘(`spacing.md`, `INTENT.md` 사본)만 제목으로 정확히 하나를 잡는 도구(`zed-window.ps1`)로 1440×852(클라이언트 1424×836)로 맞추고, `ctrl+shift+v`로 미리보기를 열어 화면을 복사했다. 다 쓴 뒤 그 두 창에만 WM_CLOSE를 보냈고, 원래 떠 있던 사용자 창(`workbench-core`)은 그대로다.
- 테마는 사용자 Zed 설정 그대로(One Light, ui_font_size 16)이고 tauri를 같은 One Light·미리보기 16px로 맞췄다.
- 픽셀 비교: 두 앱 모두 IBM Plex Sans 16px라 **같은 글자 줄끼리** 잉크 위끝 간 거리(px)를 비교했다(글자 모양 차이가 지워짐, `rows.mjs`). 대리 검토가 같은 PNG로 다시 계산해 0~1px로 일치했다.

## 실측 표 (px, 같은 글자 줄 → 다음 줄)
| 관계 | Zed | tauri 고치기 전 | tauri 고친 뒤 |
|---|---|---|---|
| H1 글자 아래끝 → 가로선 | 10 | 10 | 10 |
| H2 글자 아래끝 → 가로선 | 6 | 7 | 7 |
| H1·H2 가로선 → 다음 문단 잉크 위 | 19 | 7 | **19** |
| H3 → 다음 문단 | 19 | 8 | **19** |
| H4 → 다음 문단 | 20 | 8 | **20** |
| H5 → 다음 문단 | 19 | 9 | **19** |
| H6 → 다음 문단 | 19 | 7 | **19** |
| 문단 → H2 | 32 | 26 | **32** |
| 문단 → H3 | 32 | 25 | **32** |
| 문단 → H4 | 31 | 24 | **31** |
| 문단 → H5 | 30 | 23 | **30** |
| 문단 → H6 | 30 | 23 | **30** |
| 붙은 불릿 항목 → 다음 항목 | 26 | 36 | **26** |
| 감싼 항목 1줄 → 2줄(항목 안 줄 사이) | 22 | 24 | **22** |
| 감싼 항목 2줄 → 다음 항목 | 26 | 36 | **26** |
| 중첩: 부모 → 첫 자식 | 21 | 23 | **21** |
| 중첩: 자식 → 자식 | 26 | 36 | **26** |
| 중첩: 마지막 자식 → 다음 부모 | 31 | 41 | **31** |
| 번호 목록 항목 → 다음 | 26 | 36 | **26** |
| 느슨한 목록(빈 줄) 항목 → 다음 | 42 | 40 | **42** |
| 문단 → 첫 목록 항목 | 38 | 40 | 39 |
| 문단 → 문단 (바꾸지 않음) | 38 | 40 | 40 |
| 목록 끝 → 다음 문단 (바꾸지 않음) | 33~35 | 38~40 | 38~40 |
| 느슨한 목록 끝 → 다음 문단 (바꾸지 않음) | 50 | 40 | 39 |
| 가로선 | H1·H2만 1px #dfdfe0, 본문 폭 | 같음 | 같음 |
| H1 위 여백(문서 맨 위) | — | 0 | 0 (문서 중간 H1은 재지 않음) |

- 고친 계산값(16px): h1 0/12, h2 22/12, h3 23/11, h4 23/12, h5 23/10, h6 23/12(margin-top/bottom, 미리보기 글자 크기 비례 `prem`), 목록 줄 높이 22(= 1em + `preview_list_line_gap` 6), 항목 사이 `preview_list_gap` 4. 미리보기 20px에서 h2 27.5/15, 목록 줄 26(`tauri-after.json` `size20`).
- 바꾸지 않고 적는 차이(사용자가 말하지 않은 값, 카드 3.1): 문단 간격 38 vs 40, 목록 끝 → 다음 문단 33~35 vs 38~40, 느슨한 목록 끝 50 vs 39. `INTENT.md` 나란히 캡처에서 Zed의 본문 글자·불릿 들여쓰기가 tauri보다 작게 보이고 한글 대체 글꼴이 다르다(줄바꿈 위치가 다름).

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|
| 1 Zed 실측 | 값 표(Zed·고치기 전·고친 뒤)·잰 방법·Zed 버전·캡처 | 충족 | 위 "Zed를 잰 방법"·"실측 표". 캡처 `zed-spacing-1/2/3.png`, `zed-intent.png`, `tauri-before-spacing-*.png`, `tauri-after-spacing-*.png` |
| 2 제목 | H1~H3 위·아래 여백·가로선이 Zed와 1px 안 | 충족 | 실측 표 H1~H6 모두 0~1px(H2 글자→선 7 vs 6). 나란히 `side-headings-tauri-vs-zed.png` |
| 3 목록 | 처음 상태에서 항목 사이·항목 안 줄 사이 Zed와 1px 안, 설정 값이 있으면 그 값 | 충족 | 실측 표 목록 행 모두 0px(문단→첫 항목 1px). `side-lists-tauri-vs-zed.png`. 설정 파일 `preview_list_gap: 12`·`preview_list_line_gap: 8` → 변수 12px·8px(`tauri-after.json` `userListValues`). V1 `src/settings/model.test.ts`(새 기본값 6·4, 사용자 값 우선) |
| 4 사용자 문서 | INTENT.md tauri·Zed 나란히 | 충족 | `side-intent-tauri-vs-zed.png`(왼쪽 tauri 고친 뒤, 오른쪽 Zed) |
| 5 찾기 열기 | md·ipynb·CSV·TSV에서 Ctrl+F 열림·Esc 닫힘, HTML·SVG·이미지·PDF·.mmd는 안 열림 | 충족(이미지·PDF는 코드) | `v3-find-md.json` `c5_md_open` 열림·포커스, `c5_esc` 닫힘. `v3-find.json` `c5_kinds`: ipynb·CSV·TSV 열림, HTML·SVG·`.mmd` 안 열림. 이미지·PDF는 시험 파일이 없어 코드 확인(찾기 바는 `markdown-preview.ts`가 md·markdown·ipynb·csv·tsv에만 만듦, 다른 탭에는 `find`가 없음) |
| 6 찾기 동작 | 표시·`n/m`, 이전/다음 스크롤, 토글 셋, 한글 | 충족 | `v3-find-md.json` `c6_toggles`: "apple" 1/6, 대소문자 1/4, 단어 1/4, 정규식 켬 "app.e" 1/6·끔 0/0, "한글" 1/2. `c6_next_prev`: Enter로 2/6…6/6(먼 곳에서 scrollTop 0 → 2327), 다시 1/6, Shift+Enter 6/6. 하이라이트: 지금 찾은 곳 1개, 나머지 n−1개(`hl`·`cur`). V1 `src/editor/preview-find.test.ts`(토글 셋·개수·한글·빈 검색어·잘못된 정규식·하이라이트 지우기) |
| 7 찾기 범위 | 머리 줄 글자·`[n]` 안 찾아짐, 수식·Mermaid 결과 | 충족 | "python" 1/1(본문 한 번, 코드 블록 머리 줄의 "python"은 안 셈), ipynb "[7]" 0/0·"kiwi" 3(셀·출력·markdown). 수식 "x2"(x^2) 1/1 — MathML 글자가 이어져 찾아짐(TeX 원문 annotation은 뺌), Mermaid "Alpha" 1/1 — SVG 글자 찾아짐(`mermaidSvgText` 2). SVG 글자 위 하이라이트 그림은 캡처로 확인하지 않음 |
| 8 갱신 | 편집 탭과 나란히, 원본을 고치면 결과·개수 바뀜 | 충족 | `v3-find-hl.json` 나란히(오른쪽 pane 미리보기): 1/6 → " apple apple " 입력 뒤 1/8. 같은 pane(미리보기가 숨은 동안 고침)도 R2 뒤 1/6 → 1/8, 하이라이트 7+1(`v3-find-pane.json`). `c8-side-by-side.png` |
| 9 회귀 | 편집 탭 찾기·바꾸기, 위치 연계, 미리보기 링크, Outline 스크롤, 코드 블록 복사, ipynb·CSV 모양, `spec/` 무변경 | 충족(링크는 이전부터의 한계) | 편집 탭 Ctrl+F 바·Ctrl+H 바꾸기 줄(`c9_regress`). 코드 블록 복사 원문 같음(바 닫힘, `v3-find-pane.json` `copyBarClosed`). 바 열린 채 Outline 제목 클릭 → 제목이 바 아래 보임(`outlineWithBar2` headingTop 289 ≥ barBottom 110, 문서 끝이라 끝까지 스크롤된 상태). `git diff 07e11d8 -- spec` 출력 없음. 안쪽 링크(`#far-section`)는 스크롤되지 않는다 — v0.4 `72bdaa7`부터 `anchor` 링크를 처리하는 코드가 없고 제목에 id도 없다(이 카드 전과 같음) |
| 10 테스트 | 찾기(토글 셋·개수)·목록 간격 기본값 테스트, 전체 통과, typecheck 0 | 충족 | `e845831`에서 `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 306/306 |

## 검증
- `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 306/306(`e845831`). `npm.cmd run tauri build -- --debug --no-bundle` 성공.
- 화면 차례 네 번: Zed·tauri 고치기 전 측정 → K-06a·b 뒤 측정(하이라이트·같은 pane 결함 발견) → R1 뒤 → R2 뒤. 매번 `[SCREEN-REQ]`/`[SCREEN-OK]`/`[SCREEN-DONE]`.
- 측정 메모: 첫 시험 파일은 빈 줄로 나뉜 목록이 하나의 느슨한 목록이 되어 다시 썼다. 미리보기 블록을 클릭하면 포커스가 편집기로 가서 Ctrl+F가 편집 탭 찾기로 가므로, 미리보기 포커스는 JS `focus()`로 줬다. `v3-find-md.json`의 `c8_refresh`(같은 pane)·`copy` "x"(바가 버튼을 가림)는 R2 전 기록이고 R2로 고쳤다.
- **대리 검토**: C-11 1부 PASS(권고 넷), 2부 V3 #1~#10 PASS. 보고 `C:\Users\nampl\AppData\Local\Temp\v081-C-11-report.md`.

## 지운 것·더한 것·하지 않은 것
- 더함: 미리보기 찾기 바(`src/shell/preview-search.ts`, 찾기 로직 `src/editor/preview-find.ts`, CSS Custom Highlight API — DOM 무변경), 미리보기 키 문맥 Ctrl+F·F3·Shift+F3·Esc, 바가 열린 동안 `scroll-padding-top`. 제목 margin 상수 12개(`src/spec/metrics.ts`, Zed 1.27.0 실측 출처), 목록 규칙(`li` flow-root, 중첩 목록 아래 = 항목 간격, 마지막 항목 끝 0), 목록 기본값 `preview_list_line_gap` 8 → 6·`preview_list_gap` 12 → 4(키·범위·Settings는 그대로).
- 하지 않음: 바꾸기, Select All·Find in Selection(Zed 미리보기 바에도 없음), 문단·목록 끝 간격(위 표), 안쪽 링크 처리(이전부터 없음).
- 남은 위험(대리 검토 권고): 바가 열린 동안 MutationObserver가 비동기 그리기(코드 색칠·수식·Mermaid)마다 전체를 다시 찾는다(큰 문서에서 느려질 수 있음, 디바운스 없음). `scroll-padding-top`이 찾기 바 높이를 변수로 따로 계산한다(바 크기 변수가 바뀌면 같이 고쳐야 함). 숨은 글자(`display:none`, 닫힌 `details`)도 개수에 든다. 미리보기 글자 크기를 바꾸면 제목 여백은 비례하지만 목록 간격은 px 그대로다(설정 단위가 px).

## tauri가 고른 것
- 찾기 표시: CSS Custom Highlight API(나머지 `ghost_element.selected`, 지금 찾은 곳 `players.0.selection` — 편집 탭과 같은 토큰). DOM을 고치지 않아 위치 연계·복사·Outline에 영향 없음.
- 찾는 글자: 미리보기 본문 텍스트 노드에서 `.code-block-header`·`.nb-count`·`style`·`script`·`annotation` 제외, 블록 경계는 줄바꿈(블록을 넘는 결과 없음).
- 키·문구: 편집 탭과 같은 명령 ID와 문구(`n/m`, `0/0`, `Invalid regex`). F3·Shift+F3은 바가 닫혀 있으면 바를 연다(미리보기에는 커서가 없음). 열 때 미리보기 안 한 줄 선택이 있으면 검색어가 된다.
- 지금 찾은 곳 스크롤: 바 아래 보이는 영역 밖일 때만 가운데로.
- 목록 간격 단위: Settings가 px로 정한 값이라 px 그대로(제목 여백은 미리보기 글자 크기 비례).

## 바꾼 파일
- 코드 `9630b01`(K-06a·K-06b): `src/editor/preview-find.ts`(새), `src/editor/preview-find.test.ts`(새), `src/shell/preview-search.ts`(새), `src/shell/markdown-preview.ts`, `src/workspace/context.ts`, `src/shell/Pane.tsx`, `src/keymap/builtin.ts`, `src/app.css`, `src/spec/metrics.ts`, `src/settings/model.ts`, `src/settings/model.test.ts`.
- 코드 `63edec6`(K-06-R1): `src/editor/preview-find.ts`, `src/editor/preview-find.test.ts`, `src/shell/preview-search.ts`.
- 코드 `e845831`(K-06-R2): `src/shell/preview-search.ts`, `src/app.css`.
- 문서·검증 `a5b532f`: `specs/v0.8.1/PLAN.md`·`PROGRESS.md`, `specs/v0.8.1/verify/ORDER-06/`.

## 미정
- 제목 여백 실측값(위 표, `markdown_preview.h1~h6.margin_top/bottom`)의 core `spec/zed-metrics.toml` 반영 — core(leader-core).
- 바꾸지 않은 차이(문단 간격, 목록 끝 → 다음 문단, 느슨한 목록 끝, 본문 글자·불릿 들여쓰기 크기)를 다음 항목으로 삼을지 — leader-core.
- 안쪽 링크(`#id`)가 미리보기에서 스크롤되지 않는 것(v0.4부터) — leader-core.
- 미리보기 글자 크기를 바꿀 때 목록 간격도 비례시킬지(지금은 Settings px) — leader-core.

## BLOCKED
- 없음
