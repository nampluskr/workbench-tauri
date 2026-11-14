[DONE] ORDER-02 tauri

## 완료 기준
| # | 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|---|
| 1 | I-9 여백 | 미리보기 14 + 44 = 58px(글자에 비례), 줄 번호 끈 에디터 같은 값, 실행 번호 넘침 CSS | 충족 (화면은 Phase 5에서 잼) | `src/spec/metrics.ts` `markdown_preview.left_margin` = `44 / 14 × 미리보기 글자`(바깥 `container_padding` 그대로). 줄 번호 끈 에디터는 두 변수의 합(`src/editor/extensions.ts` `bodyStart`), HTML 미리보기는 같은 규칙(`src/editor/html.ts:154`). `.nb-count` `width` → `min-width`, `right: 100%`라 긴 번호는 왼쪽 바깥 여백으로 자람(`src/app.css`). `metrics.test.ts` 새 값으로 통과 |
| 2 | I-10 간격 | 두 버튼 영역 간격 0·여백 4px, 버튼 크기 그대로 | 충족 (화면은 Phase 5에서 잼) | `src/spec/metrics.ts` `tab.end_buttons_area.gap` `rem(0)`, `padding_x` `rem(4)`. 버튼 크기·경계선 값 diff 없음 |
| 3 | I-11 설정 | 기본 12, 범위 밖 값 처리, 저장·읽기와 주석·알 수 없는 키 보존(새 테스트 하나), Ctrl+= 비율·밑선 CSS | 충족 (화면은 Phase 5에서 잼) | `src/settings/model.ts`(Editor 분류 "Line Number Font Size", 키 `editor_line_number_font_size`, 기본 12, 8 미만·숫자 아님 → 기본, Settings 입력은 8~`buffer_font_size`로 맞춤), `src/settings/model.test.ts` 새 테스트. 그리는 크기 `lineNumberFontSize` = min(설정, `buffer_font_size`) × Ctrl+= 크기 ÷ `buffer_font_size`(`src/spec/metrics.ts`, 14 → 21이면 12 → 18). 밑선: 번호 칸에 에디터 글자 크기의 폭 0 인라인 상자(`::before` `\200b`)를 두어 기준선이 본문과 같음(`src/editor/extensions.ts`). 번호 폭은 그 칸의 `1ch`(줄 번호 글꼴 기준) |
| 4 | I-12 시작선 | 켬·끔 시작선 같음, 경우 넷 계산값 표(단위 테스트), 확인 요청 둘 | 충족 (화면은 Phase 5에서 잼) | `src/spec/metrics.test.ts`. `.cm-gutters` `min-width` = 본문 여백, 번호 칸 = 왼쪽 10 + 자릿수×1ch(최소 4) + 오른쪽 최소 8, 남는 폭은 빈 채움 gutter(`cm-gutter-fill`, flex-grow 1). 하강 여백 `--editor-gutter-margin`과 canvas 측정 지움(`src/`에 남은 곳 없음). 표는 아래 |
| 5 | 회귀 | 닿는 테스트·typecheck, 저장된 설정 영향, 보안 diff | 충족 | `node --test src/spec/metrics.test.ts src/settings/model.test.ts src/editor/extensions.test.ts src/editor/indent-guides.test.ts` → 27 pass 0 fail, `npm.cmd run typecheck` 0(`%TEMP%\v083-K-02-tests.txt`). 더한 키 하나뿐이고 기존 키의 읽기·검증·기본값은 그대로(`model.ts` diff) → 저장된 사용자 설정을 읽어도 이 카드 밖 화면은 그대로. `git diff d8f9438 --stat -- src-tauri/tauri.conf.json src-tauri/capabilities` → ORDER-01의 버전 한 줄뿐(이 카드에서 diff 없음) |

I-12 계산값(px, JetBrains Mono 1ch = 0.6em, 켬 = max(본문 여백, 10 + 자릿수×1ch + 8)):

| 경우 | 끔(본문 여백) | 숫자 폭 | 숫자 오른쪽 | 켬 | 켬 = 끔 |
|---|---|---|---|---|---|
| 기본(줄 번호 12, 미리보기 14) | 58 | 28.8 | 19.2 | 58 | 같음 |
| 줄 번호 16(에디터 글자 16) | 58 | 38.4 | 9.6 | 58 | 같음 |
| 미리보기 글자 18 | 74.57 | 28.8 | 35.77 | 74.57 | 같음 |
| 줄 수 10만(여섯 자리) | 58 | 43.2 | 8(최소) | 61.2 | 3.2 밀림 |

## 검증
- 위 #5 명령. checker 코드 리뷰 C-02 PASS(기준선 CSS, 활성 줄 배경이 채움 gutter로 끊기지 않음, 지운 변수의 다른 호출부 없음, 테스트 기대값 변경의 정당성 확인. 테스트 재실행 없음).
- 앱 실행·화면 측정 없음(ORDER-05로).

## 지운 것·더한 것·하지 않은 것
- 지움: Zed 번호 칸 여백 22/29px, 글꼴 하강 여백 `--editor-gutter-margin`과 그 canvas 측정. 더함: 설정 하나, 빈 채움 gutter 하나, 값 `markdown_preview.notebook_count_gap`(아래).
- 남은 위험: 시작선 테스트는 `applyMetrics`가 내는 변수 값으로 같은 식을 계산한다 — 값 바뀜은 잡지만 CSS 배치 규칙 자체의 잘못은 못 잡는다(화면은 ORDER-05). 미리보기 코드 글꼴을 크게 잡으면(Code Font Size 100% 이상) `[10000]`이 58px를 넘을 수 있다.

## tauri가 고른 것
- I-11 키 이름 `editor_line_number_font_size`: 에디터 본문 보기 설정이 `editor_` 앞붙이(`editor_line_numbers`, `editor_line_height`)이고 글자 크기 키는 `_font_size`로 끝난다. 에디터 글자보다 큰 파일 값은 지우지 않고 그릴 때만 에디터 글자로 맞춘다(에디터 글자가 나중에 커질 수 있어서). Settings 화면의 ±·입력은 8~에디터 글자로 맞춰 저장.
- I-12 확인 요청 1(번호 칸의 다른 것): 없다. 에디터 gutter는 `lineNumbers()`와 이번에 더한 빈 채움 칸뿐(접기·진단 표시 없음). 채움 칸은 활성 줄에만 요소가 생겨 활성 줄 배경만 그린다 — 활성 줄 배경은 전처럼 번호 칸 왼쪽 끝부터 본문까지 이어진다.
- I-12 확인 요청 2(최소 여백): 숫자 오른쪽 **8px**(고정 px). I-9에서 `[999]`와 본문 사이가 약 8px인 것과 맞췄다. 이 값이면 기본 설정에서 다섯 자리(10 + 36 + 8 = 54px)는 58px 안에 들어가 밀리지 않고 여섯 자리부터 밀린다. ITEMS I-12 "다섯 자리 이상에서는 칸이 늘어난다"와 다르다 — 다섯 자리부터 밀리게 하려면 최소 여백이 12px를 넘어야 한다. "들어가지 않을 때만 늘어난다"는 규칙을 앞세워 8px로 했다(미정에 적음).
- I-9 실행 번호와 코드 칸 사이 `markdown_preview.notebook_count_gap` **7px**(미리보기 글자 14px 기준 비례, 카드 밖 값): 전처럼 코드 블록 안쪽 여백(10.5px)을 쓰면 `[999]`(36.1px)가 44px 칸을 넘고 `[10000]`(50.6px)이 58px를 넘어 잘린다. 7px이면 `[999]` 43.1 ≤ 44, `[10000]` 57.6 ≤ 58. ITEMS의 "약 8px"보다 1px 작다(8이면 `[10000]`이 0.6px 넘음).

## 바꾼 파일
- 코드 `056d606`: `src/spec/metrics.ts`, `src/spec/metrics.test.ts`, `src/editor/extensions.ts`, `src/editor/view-options.ts`, `src/app.css`, `src/settings/model.ts`, `src/settings/model.test.ts`, `src/settings/load.ts`, `src/settings/Settings.tsx`

## 미정
- I-12 최소 여백 8px로 다섯 자리 줄 번호는 칸이 늘지 않는다(ITEMS "다섯 자리 이상"과 다름). 다섯 자리부터 늘려야 하면 최소 여백을 12px 넘게 — leader-core(사용자 확인 때).
- `[n]` 틈 7px(ITEMS "약 8px")를 받아들일지 — leader-core.

## BLOCKED
- 없음
