[DONE] ORDER-01 tauri

## 완료 기준
| # | 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|---|
| 1 | 시작 | specs/v0.8.3 문서·폴더, AGENTS.md v0.8.3·허락 승인 규칙, herdr 이름 | 충족 | `specs/v0.8.3/`(PROGRESS·ITEMS-MAP(I-1~I-17, core Phase)·HERDR-SETUP(w15 구성, leader-core w14:p1)·`reports/`·`verify/`). `git grep -n 'v0\.8\.3\|v083-\|허락 승인' -- AGENTS.md` → 10·12·14·18·29·30·35·43·131·135·222행(14행 = 허락 승인 규칙). `herdr agent list` → `tauri-leader` w15:p1, `tauri-writer` w15:p2, `tauri-coder` w15:p3, `tauri-checker` w15:p4 |
| 2 | 앱 버전 | v0.8.2 ORDER-01이 바꾼 자리가 0.8.3 | 충족 (About 화면은 Phase 5에서 잼) | `git grep -n '0\.8\.3'` → `src-tauri/tauri.conf.json:4`, `src/shell/about.test.ts:33,35`. `package.json`·`Cargo.toml`엔 버전 자리 없음 |
| 3 | I-2 두께 | 세 선이 `max(1px, …)` | 충족 (화면은 Phase 5에서 잼) | `src/app.css:371`(`.split-handle` `--split-line: max(1px, var(--pane-split-line-thickness))`, h·v 둘 다 이 변수), `src/app.css:331`(`.status-divider`), `src/shell/picker.css:56`(`.picker-divider`). `--pane-split-line-mouse-hitbox` 값 그대로, `::before`는 실제 두께 기준 가운데. `spec/metrics.ts` 값은 그대로(`--picker-input-divider-width`를 입력 줄 테두리도 써서 쓰는 자리에만 걸었다) |
| 4 | I-13 색 | 색 규칙 경우 여섯 단위 테스트, 테마 따라감 | 충족 (픽셀 색은 Phase 5에서 잼) | `src/shell/split-line.ts`(`splitLineColor`), `src/shell/split-line.test.ts`(경우 여섯 + 테마 바뀜 한 줄), `src/theme/apply.ts`(테마를 걸 때 `--split-line-edit-edit/edit-view/view-view`), `src/shell/Pane.tsx`(`areaOf`·`data-areas`), `src/app.css:372-377` |
| 5 | I-15 위치 | 미리보기 `{줄}`, 편집·도구 그대로, ipynb "Jupyter Notebook", Outline 읽기 | 충족 (화면은 Phase 5에서 잼) | `src/workspace/context.ts:500,504,512`(미리보기만), `src/editor/filetypes.json`(ipynb 한 줄), `status.test.ts`·`filetype.test.ts` 새 값. Outline `src/shell/Outline.tsx:180` `Number(position?.split(":")[0])` — `"8"` → 8, 같은 줄(코드 근거). 미리보기 위치를 `:`로 읽는 곳은 이 한 곳 |
| 6 | 회귀 | 닿는 테스트·typecheck, 보안 diff | 충족 | `node --test src/shell/split-line.test.ts src/shell/about.test.ts src/shell/status.test.ts src/editor/filetype.test.ts` → 9 pass 0 fail, `npm.cmd run typecheck` exit 0 (출력 `%TEMP%\v083-K-01-tests.txt`). `git diff d8f9438 --stat -- src-tauri/tauri.conf.json src-tauri/capabilities` → tauri.conf.json 1줄(버전)뿐 |

## 검증
- 위 #6 명령. checker(agy Gemini 3.8 Flash) 코드 리뷰 C-01 PASS(테스트 재실행 없음, coder 출력 근거).
- 앱 실행·화면 측정 없음(COMMON 8절, ORDER-05로).

## 지운 것·더한 것·하지 않은 것
- 더함: `src/shell/split-line.ts`·테스트 하나, 영역 쌍 CSS 변수 셋, filetypes 한 줄. `cargo`는 Rust를 안 건드려 돌리지 않음. 전체 `npm run test` 안 돌림(ORDER-05).
- 남은 위험: I-13 경계가 `--tab-bar-height`(탭 줄과 같은 변수)라 맞아야 하나 화면 확인 전. 한쪽이 중첩 분할(예: 오른쪽이 상하 분할)이면 그 좌우 선은 UI 색 그대로(`Pane.tsx` `areaOf` shortcut 주석) — "양쪽 창이 모두 문서 창"이 아니라고 봤다.

## tauri가 고른 것
- I-13 구간 나누기: 구분선 요소는 하나로 두고(끌기·두 번 누르기·잡는 영역이 한 요소에 걸려 있어서) 배경을 `linear-gradient(var(--pane-group-border) var(--tab-bar-height), var(--split-line-body) 0)`로 탭 줄 높이에서 끊었다. 구분선은 pane 밖이라 창의 테마 변수를 물려받지 못하므로 `applyTheme`이 영역 쌍별 본문 색을 `:root` 변수로 내고, 좌우 선의 `data-areas`(양쪽이 편집/미리보기일 때만)로 고른다. 테두리 색 = 그 창 테마의 `pane_group.border`(없으면 `border`). 편집 창 경로 줄(`.editor-toolbar`)은 편집 테마 영역이라 본문 구간에 넣었다.
- 문서 창 판정: 활성 탭이 편집 탭이면 edit, 미리보기 탭이면 view, 도구 탭(Keymap 편집기·Extensions 등 `openTool`)·빈 pane(Welcome)·중첩 분할이면 UI. Settings는 별도 창이라 pane에 없고, `settings.json`을 파일로 열면 편집 탭(edit)이다.
- tauri v0.8.3 문서: core처럼 INTENT·DECISIONS·SPEC·PLAN은 두지 않고 ITEMS-MAP이 Phase 대응을 맡는다(v0.8.2와 같음).

## 바꾼 파일
- 문서 `3faa224`: `AGENTS.md`, `specs/v0.8.3/HERDR-SETUP.md`·`ITEMS-MAP.md`·`PROGRESS.md`·`reports/.gitkeep`·`verify/.gitkeep`
- 코드 `8aa9073`: `src-tauri/tauri.conf.json`, `src/app.css`, `src/shell/picker.css`, `src/shell/Pane.tsx`, `src/shell/split-line.ts`(새), `src/shell/split-line.test.ts`(새), `src/theme/apply.ts`, `src/workspace/context.ts`, `src/editor/filetypes.json`, `src/editor/filetype.ts`, `src/editor/filetype.test.ts`, `src/shell/status.test.ts`, `src/shell/about.test.ts`

## 미정
- 중첩 분할 옆 좌우 선도 본문 색을 따라야 하는지 — leader-core(사용자 확인 때). 필요하면 선에 닿는 pane들을 모두 보도록 넓힌다.

## BLOCKED
- 없음
