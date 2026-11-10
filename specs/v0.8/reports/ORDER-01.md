[DONE] ORDER-01 tauri

> 보고: ORDER-01 · 작성일: 2026-11-10 · 보낸 이: tauri-leader · 받는 이: leader-core

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|
| 1 시작 | `specs/v0.8/` PROGRESS·I-n 대응·`reports/`·`verify/`, AGENTS 버전 v0.8, `core-leader` 없음, herdr 넷·탭 이름 | 충족 | `specs/v0.8/PLAN.md`(I-n ↔ Phase 대응)·`PROGRESS.md`·`HERDR-SETUP.md`·`reports/`·`verify/`. `AGENTS.md` 17행 "(v0.8)". `git grep -n core-leader -- . ':!spec' ':!specs/v0.[1-7]/**'` → 출력 없음(`spec/`는 core 복사본이라 고치지 않음). `herdr agent list`(wY): tauri-leader claude wY:p1 · tauri-writer claude wY:p2(`--model claude-opus-5-5 --effort medium`) · tauri-coder claude wY:p3(`--model sonnet --effort high`) · tauri-checker agy wY:p4(`--model gemini-3.8-flash-high --settings .agents\checker-settings.json`). `herdr tab list --workspace wY`: wY:t1 tauri-leader, wY:t2 tauri-writer, wY:t3 tauri-coder, wY:t4 tauri-checker. worktree 없음 |
| 2 공통 | `.csv` 눈 버튼·`Ctrl+Shift+V`·트리 "Open Preview"·View "Open Preview" → 표 미리보기, `Ctrl+K V`·"Open Preview to the Side" → 옆 pane | 충족 | `verify/ORDER-01/v3.json` `c2_eye`·`c2_ctrl_shift_v`·`c2_tree_menu`·`c2_tab_menu`·`c2_view_menu`·`c2_ctrl_k_v`·`c2_view_to_side`, `c2-csv-preview-eye.png`, `c2-csv-side.png` |
| 3 공통 | Lock Preview 켜고 `.tsv` → 미리보기 탭, 끄면 편집 탭 | 충족 | `v3.json` `c3_lock_tsv`, `c3-lock-tsv.png` |
| 4 공통 | `.txt`·`.json`(·`.html`·`.ipynb`·`.svg`) 눈 버튼 없음, View "Open Preview" 비활성, 트리·탭 메뉴 항목 없음 | 충족 | `verify/ORDER-01/v3-b.json` `c4_*`: eye null, View 둘 다 disabled, tabMenu·treeMenu [], Ctrl+Shift+V 뒤 미리보기 탭 0 |
| 5 공통 | 마크다운 동작 v0.7과 같음(눈 버튼·단축키·Lock Preview·위치 연계), 이름 "Open Preview"·"Open Preview to the Side"·"Lock Preview" | 충족 | `v3-b.json` `c5_md`: 눈 버튼·툴팁 "Open Preview", 탭·트리·View 이름, Ctrl+Shift+V 열고 다시 누르면 편집 탭, Ctrl+K V 옆 pane, 커서 15줄 "## Section 4" → active-block "Section 4"(`c5b-md-side-link.png`). Lock Preview 이름은 `c8_lock`(aria-label). 마크다운 Lock Preview는 `src/workspace/tabs.test.ts` `opensPreview`(.md 포함)로 확인 |
| 6 공통 | 사용자 키맵 `markdown::OpenPreview` 다른 키 → `.csv`에서 열림 | 충족 | `src/editor/csv.test.ts` "M-5: one check names the previewable files; a user binding of OpenPreview reaches .csv"(`alt-p`), `npm.cmd run test` 통과 |
| 7 공통 | CSV 미리보기 탭 상태 표시줄 종류 ≠ "Markdown" | 충족 | `v3.json` `c7_status`: CSV 편집·미리보기 "Plain Text", md 미리보기 "Markdown" |
| 8 I-10 | Lock Preview `eye`, 켜면 파란 켜짐, 끄면 기본색 | 충족 | `v3.json` `c8_lock`: svg = 편집 탭 eye(`sameAsEditorEye` true), on rgb(116,173,232), off rgb(169,175,188). `c8-lock-on.png`·`c8-lock-off.png` |
| 9 I-7 | 따옴표 필드(쉼표·줄바꿈·`""`), CRLF, 빈 셀, `.tsv`, `<b>x</b>` 글자 그대로 | 충족 | `src/editor/csv.test.ts` "I-7: quoted fields, CRLF, empty cells, TSV and markup stay literal text". 화면 보조 `v3.json` `c2_eye.cells`(boldInCells 0) |
| 10 I-7 | 1,001행 CSV → 데이터 1,000행, "Showing first 1,000 of 1,001 rows", 첫 줄 머리글 | 충족 | `v3.json` `c10_big`: bodyRows 1000, lastRow "1000v1000", note 일치, th 굵기 600. `c10-big-head.png`·`c10-big-end.png` |
| 11 I-7 | 편집 탭과 나란히 두고 셀 고치면 표가 바뀜 | 충족 | `v3.json` `c11_live`(Lee → Park), `c11-csv-edited.png` |
| 13 버전 | About Version 0.8.0, 설정 파일에 0.7.0 없음 | 충족 | `v3.json` `c13_about` "Version 0.8.0", `c13-about.png`. `git grep -n "0\.7\.0" -- . ':!specs' ':!docs/refs'` → `docs/BUILD.md` 79·81·85·86·94행(0.7.0 release 빌드 결과 기록)만 남음. 설정 파일 `src-tauri/tauri.conf.json` 0.8.0(package.json·Cargo.toml은 버전 칸 없음) |
| 12 테스트 | 판별·CSV 테스트, 기존 테스트 통과, typecheck 0 | 충족 | `src/editor/csv.test.ts` 3개. `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 262/262 통과 |

## 검증
- `npm.cmd run typecheck` → 오류 0. `npm.cmd run test` → tests 262, pass 262, fail 0. Rust 코드는 바뀌지 않음(`tauri.conf.json` 버전 한 줄).
- `npm.cmd run tauri build -- --debug --no-bundle` 성공(V3용 debug exe).
- V3: 화면 차례 [SCREEN-OK] ORDER-01 ~ [SCREEN-DONE]. debug exe, 임시 APPDATA·WebView 폴더, 창 1440×852, 100%, One Dark, CDP 합성 입력. 결과 `specs/v0.8/verify/ORDER-01/v3.json`·`v3-b.json`, PNG 11장(c2-csv-preview-eye, c2-csv-side, c3-lock-tsv, c5-md-side-link, c5b-md-side-link, c8-lock-off, c8-lock-on, c10-big-head, c10-big-end, c11-csv-edited, c13-about). 1회차에서 편집한 data.csv가 닫히지 않아 탭이 쌓여 #4·#5 값이 오염됐고, 그 둘만 2회차(`v3-b.json`)로 다시 쟀다.
- 판정: tauri-checker C-01 코드 검토 [PASS], C-02 V3 판정 [MEASURED] 10 PASS·불일치 0.

## 지운 것·더한 것·하지 않은 것
- 더함: `src/editor/preview-kind.ts`(판별 한 곳), `src/editor/csv.ts`·`csv.test.ts`. 지움: 흩어진 마크다운 정규식 7곳(`Pane.tsx`·`tree-menu.ts`·`tab-menu.ts`·`AppMenu.tsx`·`tabs.ts`·`markdown.ts` `classifyLink`·`keymap/builtin.ts` 문맥), 안 쓰게 된 아이콘 이름 `markdown`·`markdown_box`와 `IconButton.toggledName`.
- 하지 않음: 새 설정·의존성·CSP·capability 변경, 정렬·필터·셀 편집·가상 스크롤·구분자 추측, release 빌드(ORDER-05).
- 남은 위험: 키맵 문맥이 `md`에서 `md·markdown·csv·tsv`로 넓어져 `.markdown` 파일에서도 이제 `Ctrl+Shift+V`가 동작한다(v0.7은 `.md`만). 마크다운 판별을 한 곳으로 모은 결과다.

## tauri가 고른 것
- 빈 줄(한 칸짜리 빈 레코드)은 건너뛴다(`csv.ts` `shortcut:` 주석). 한 열짜리 파일의 빈 값 행이 빠지는 한계.
- CSV·TSV 미리보기의 상태 표시줄 종류는 편집 탭과 같은 값 "Plain Text"다(이 앱에 CSV 언어 항목이 없음). 카드는 "그 파일의 종류"를 요구했고 판정은 "Markdown이 아니다"라 편집 탭과 같은 값을 골랐다.
- 표 모양은 기존 마크다운 표 CSS(`.markdown-body table/th/td`)를 그대로 써서 미리보기 글꼴·테마·줄간격을 따른다. 새 CSS 없음.
- 안내 문구 "Showing first 1,000 of N rows"는 표 아래에 둔다.
- 내부 이름(`markdown-preview` 요소, `MarkdownPreview` 키맵 문맥, 탭 플래그 `markdown`)은 그대로 둔다. 이름만 마크다운이고 모든 미리보기 탭이 같이 쓴다. `opensMarkdownPreview`는 `opensPreview`로 이름만 바꿨다.

## 바꾼 파일
- 문서 `4ceea09`: `AGENTS.md`, `specs/v0.8/PLAN.md`·`HERDR-SETUP.md`·`PROGRESS.md`, `specs/v0.8/reports/.gitkeep`, `specs/v0.8/verify/.gitkeep`.
- 코드 `5c5ee72`: `src/editor/preview-kind.ts`(새)·`csv.ts`(새)·`csv.test.ts`(새)·`markdown.ts`, `src/keymap/builtin.ts`·`builtin.test.ts`, `src/shell/Pane.tsx`·`tree-menu.ts`·`tab-menu.ts`·`tab-menu.test.ts`·`AppMenu.tsx`·`app-menus.ts`·`app-menus.test.ts`·`markdown-preview.ts`·`status.ts`·`status.test.ts`·`Icon.tsx`·`about.test.ts`, `src/workspace/tabs.ts`·`tabs.test.ts`·`context.ts`, `src-tauri/tauri.conf.json`, `docs/BUILD.md`(112행 버전 규칙).
- V3 결과·PROGRESS·이 보고는 그 뒤 커밋에 넣는다.

## 미정
- 셀 안 줄바꿈은 바르게 나뉘지만 HTML 공백 규칙 때문에 화면에서는 한 칸 공백으로 보인다(`c10-big-head.png` 오른쪽 "line1 line2"). 판정 기준 밖이라 그대로 뒀다. 줄바꿈을 보이게 할지는 leader-core(사용자)가 정한다.
- CSV·TSV 미리보기 탭 아이콘은 마크다운 미리보기 탭과 같은 그림이다. 판정 기준 밖. leader-core가 정한다.
- 루트 `AGENTS.md` 레포 규칙 10·12행("v0.7 구성…", "core v0.7 ITEMS(I-1~I-13)")은 카드 3.1("레포 규칙 절의 문장은 바꾸지 않는다")대로 그대로 뒀다. v0.8로 고칠지는 leader-core가 정한다(v0.7에서는 ORDER-02 3A로 고쳤다).

## BLOCKED
- 없음
