[DONE] ORDER-01 tauri

V3는 debug exe(커밋 `0895dc7`, R2 뒤 `87bb2c1`)로 쟀다. 주 모니터 1920×1080 100%, 창 1440×852, CDP 입력만, 앱 데이터·WebView 데이터는 scratchpad의 별도 폴더, 열 폴더는 사용자 캡처와 같은 모양의 픽스처 `workbench-core`. 근거는 `specs/v0.8.1/verify/ORDER-01/`(`v3.json`, `v3-r2.json`, PNG, `measure.mjs`·`measure-r2.mjs`). 판정은 checker C-01(검토)·C-02(V3)다.

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|
| 1 시작 | `specs/v0.8.1/` PROGRESS·I-n 대응·`reports/`·`verify/`·HERDR-SETUP, AGENTS v0.8.1, v0.8 구성 없음, herdr 넷 | 충족 | `specs/v0.8.1/PLAN.md`(I-1~I-13 ↔ Phase 1~7)·`PROGRESS.md`·`HERDR-SETUP.md`(구성 표: leader·writer·coder Claude Code Opus 5.5 medium, checker agy `claude-sonnet-5-5-high` + `--settings`)·`reports/`·`verify/`. `AGENTS.md` 17행 "(v0.8.1)", 0장 `specs/v0.8.1/…`, 카드 `v081-`, 레포 규칙 "HERDR 구성"·"core ITEMS 우선(v0.8.1, I-1~I-13)". `git grep -n -e "Sonnet 5.5 high" -e gemini -e "v08-" -- AGENTS.md specs/v0.8.1` → 출력 없음(C-01 5절). `herdr agent list`: tauri-leader w0:p1 claude, tauri-writer w0:p2 claude, tauri-coder w0:p3 claude, tauri-checker w0:p4 agy. `herdr tab list --workspace w0`: w0:t1 tauri-leader, w0:t2 tauri-writer, w0:t3 tauri-coder, w0:t4 tauri-checker. worktree 없음 |
| 2 앱 버전 | About 0.8.1, 버전 칸 모두 0.8.1 | 충족 | `v3.json` `about` = "workbench-tauri \| Version 0.8.1", `about.png`. `src-tauri/tauri.conf.json` 0.8.1(버전은 이 한 곳, `docs/BUILD.md` 125행; package.json·Cargo.toml은 버전 칸 없음). `src/shell/about.test.ts` 0.8.1. `git grep -n "0\.8\.0" -- src src-tauri/tauri.conf.json` → `src/licenses/rust-dependencies.txt`의 bit-set/bit-vec 0.8.0(다른 crate)만. `docs/BUILD.md`의 나머지 0.8.0은 0.8.0 빌드 기록. 설치 파일 이름·제품 버전은 release 빌드(ORDER-07)에서 이 값으로 나온다 |
| 3 I-1 크기 | 새 파일·새 폴더·이름 바꾸기 입력 14px, 글자 세로 위치 1px 안 | 충족 | `i1_rename.info1`·`i1_newFile.empty`·`i1_newFolder_ime.empty` fontSize 14px, 보통 행 14px, 행 높이 26 같음, 글자 시작 x 67 같음. 이름 바꾸기 행 캡처(`i1-rename-before.png` ↔ `i1-rename-typed.png`)의 글자 픽셀 행 8~20이 같다(차이 0px; ink top 4·bottom 21은 캐럿). 새 파일 `i1-newfile-ref-row.png` ↔ `i1-newfile-typed-error.png`도 글자 행 8~20 같다 |
| 4 I-1 Sidebar | Sidebar 폴더 이름 입력 = 그 행 보통 글자 크기 | 충족 | 코드는 고치지 않았다: 입력이 `.sidebar-item`(14px, `--sidebar-item-font-size`) 안에서 `font: inherit`. `v3-r2.json` One Dark·One Light `sidebarInput.fontSize` 14px = `sidebarNormal.fontSize` 14px, `r2-sidebar-input-*.png` |
| 5 I-2 토큰 | Zed 상태별 토큰 근거 | 충족 | Zed 소스(커밋 14b7b0e, 읽기만): `crates/project_panel/src/project_panel.rs:7202-7203` 이름 색 = `entry_git_aware_label_color(git_status, is_ignored, is_marked)` → `crates/editor/src/items.rs:2284-2299`(git·ignored 아니면) `entry_label_color` `items.rs:2256-2262`(marked → `Color::Default`, 아니면 `Color::Muted`) → `crates/ui/src/styles/color.rs:92-93`(`text` / `text_muted`). 마우스 올림은 배경만(`project_panel.rs:6153-6163`). 활성 편집기 파일은 reveal 때 marked(`project_panel.rs:7278-7281, 7299-7303`). 접힌 경로 조각·구분자도 같은 색(`6139, 6811, 6993, 7091`). 이름 입력은 단일행 Editor `editor_foreground`(`crates/editor/src/editor.rs:11635-11636`). Zed 화면(사용자 캡처): One Dark 보통 이름 글자 픽셀 `#a9afbc`(= `text.muted`), One Light 보통 이름과 포커스 테두리만 있는 선택 폴더 `spec` 모두 `#58585a`(= `text.muted`) |
| 6 I-2 색 | One Dark·One Light 상태별 계산값 = Zed 값, 나란한 캡처 | 충족 | `v3.json` `colors_OneDark`/`colors_OneLight` textColor: 보통·마우스 올림·맨 클릭 폴더·키보드 커서만·접힌 경로 = `text.muted`(One Dark rgb(169,175,188) / One Light rgb(88,88,90)); 활성 파일(선택 여부 무관)·Ctrl 여러 개 = `text`(rgb(220,224,229) / rgb(36,37,41)); sticky 행 muted. 트리 입력칸 = `editor.foreground`(`v3-r2.json` rgb(172,178,190) / rgb(36,37,41)). 글꼴 IBM Plex Sans·400·14px, 아이콘 색(`icon.muted`)은 상태와 무관하게 그대로. 나란한 캡처: `side-OneDark-tauri-vs-zed.png`, `side-OneLight-tauri-vs-zed.png`(왼쪽 tauri, 오른쪽 사용자 Zed 캡처). tauri 글자 픽셀도 보통 `#aaafbc`/`#58585a`, 활성 `#dde0e5`/`#242529` |
| 7 회귀 | 선택·여러 개·포커스 테두리·정렬선·접힌 경로·sticky·우클릭 메뉴, 입력 Enter·Esc·한글·오류/경고 테두리 | 충족 | `regress`: 여러 개 `["ambiguous.md","INDEX.md"]`, 포커스 테두리 rgb(71,103,158), 정렬선 19, 우클릭 메뉴 14항목, 접힌 경로 `a\b`·`specs\v0.8\orders`, sticky 두 행(`regress-sticky.png`). Esc 취소(`i1_rename.cancelled`, `i1_newFile.afterEsc`), Enter 생성(`i1_newFile.created` true), 한글 조합(`composing.value` "한" 편집 유지 → "한글", 폴더 생성), 오류 테두리 rgb(208,114,119)·경고 rgb(222,193,132)(`i1-newfile-error.png`·`i1-newfile-warning.png`) |
| 8 테스트 | 기존 테스트 통과, typecheck 0 | 충족 | `87bb2c1`에서 `npm.cmd run typecheck` 오류 0, `npm.cmd run test` tests 287, pass 287, fail 0. 새 로직은 경로 같음 비교 한 줄(`activeFile`)이라 테스트를 더하지 않았다 |
| 9 README | 커밋에 README.md 없음, 작업 폴더 수정 남음 | 충족 | `git show --stat 798d696`·`b6c8683`·`0895dc7`·`87bb2c1`에 README.md 없음(C-01 6절). `git status -s` → ` M README.md` |

## 검증
- `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 287/287(`87bb2c1`). `npm.cmd run tauri build -- --debug --no-bundle` 성공(경고는 기존 Vite chunk 크기 종류).
- 화면 차례 세 번(첫 측정 → K-01-R1 → 다시 측정 → K-01-R2 → 다시 측정), 매번 `[SCREEN-REQ]`/`[SCREEN-OK]`/`[SCREEN-DONE]`.
- 캡처: `tree-OneDark*.png`·`tree-OneLight*.png`(보통·여러 개·폴더 클릭 뒤 키보드 커서), `side-*-tauri-vs-zed.png`, `i1-*.png`, `sidebar-rename-input.png`, `r2-*.png`, `regress-*.png`, `about.png`.
- 검토: C-01 PASS(지적 F-1 → K-01-R2), C-02 PASS(측정 불가 두 건 중 One Light 입력칸 색은 R2 뒤 다시 잼).

## 지운 것·더한 것·하지 않은 것
- 더함: `.tree-row .tree-input`(14px, editor.foreground), `.tree-row.marked, .tree-row.active-file { color: text }`, `.tree-row` 기본 글자색 text.muted, `ProjectTree.tsx`의 `active-file` 클래스(활성 Pane 활성 탭 경로와 같은 행). 의존성·CSP·capability·설정 변경 없음.
- 하지 않음: 맨 클릭한 폴더의 선택 **배경**은 Zed에 없지만 그대로 두었다(요청은 글자색만). Zed는 폴더를 맨 클릭하면 marks를 비워 활성 파일 행도 그다음 reveal까지 muted가 되지만, tauri는 활성 파일 행을 늘 text로 둔다(새 상태가 필요해 만들지 않음).
- 위험: 활성 탭이 마크다운 미리보기 탭이면 원본 md 행이 text가 된다(Zed 미리보기 항목의 reveal 여부는 확인하지 않음).

## tauri가 고른 것
- 이름 입력칸 글자색 = `editor.foreground`(Zed 단일행 Editor와 같음). 트리 안 입력에만 주고 Sidebar 입력은 v0.8 그대로(`text`) — "Sidebar 글자색 변경 안 함".
- Zed의 "marked"에 대응하는 tauri 상태 = `.marked`(Ctrl/Shift 여러 개) + 활성 탭 파일 행. 커서만 있는 `.selected`는 muted.
- Zed 비교 화면은 사용자 캡처를 썼다. 실제 Zed를 같은 폴더·두 테마로 띄우려면 사용자 Zed 테마 설정을 바꿔야 해서 하지 않았다. 대신 Zed 소스 규칙과 캡처 글자 픽셀로 맞췄다.

## 바꾼 파일
- 문서 `798d696`: `AGENTS.md`, `specs/v0.8.1/PLAN.md`·`PROGRESS.md`·`HERDR-SETUP.md`·`reports/.gitkeep`·`verify/.gitkeep`.
- 코드 `b6c8683`: `src-tauri/tauri.conf.json`, `src/shell/about.test.ts`, `docs/BUILD.md`(125행), `src/app.css`.
- 코드 `0895dc7`: `src/app.css`, `src/shell/ProjectTree.tsx`.
- 코드 `87bb2c1`: `src/app.css`.
- 문서·검증 `c51f7d9`: `specs/v0.8.1/PLAN.md`·`PROGRESS.md`, `specs/v0.8.1/verify/ORDER-01/`.

## 미정
- 맨 클릭 폴더의 선택 배경을 Zed처럼 없앨지(별도 항목 필요) — leader-core·사용자.

## BLOCKED
- 없음
