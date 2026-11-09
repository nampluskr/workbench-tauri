[DONE] ORDER-02 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| I-4 | 언어 서버 프로세스가 뜨지 않는다, 의존성·코드에 언어 서버 클라이언트가 없다, 구문 강조는 v0.5와 같다 | 충족 | 앱 프로세스 트리 `workbench-tauri.exe`·`msedgewebview2.exe`뿐(`specs/v0.6/verify/ORDER-02/v3b.json` processTree). C-05: `package.json`·`Cargo.toml`·`src/`·`src-tauri/src/`에 LSP 클라이언트 없음(원래 없었다). 구문 강조 코드(`src/syntax/`)는 바꾸지 않았다 |
| I-5 | 툴팁 "Search", 클릭·`Ctrl-Shift-F`로 "Search" 탭 | 충족 | `v3.json` tooltip ["Search"], tabsAfterF ["Search"]. 캡처 `01-status-bar-search-tooltip.png`, `03-search-read.png`. `src/shell/status.ts:8,17` |
| I-5 | `read` → 이름에 read가 든 것만, `rdm` → README.md 안 나옴 | 충족 | V3: resultsRead ["README.md","reader","thread.ts"](other.txt·docs·guide.md·notes.txt 없음), resultsRdm [](`03`·`04` 캡처). V1: `src-tauri/src/name_search.rs` 테스트(`name_matches("README.md","rdm")` 거짓 포함), cargo test 21 통과 |
| I-5 | 파일 결과 → 열림, 폴더 결과 → 트리에서 펼쳐 보이고 선택 | 충족 | treeSelected ["reader"](`05-folder-result-reveal.png`), tabsAfterFile ["Search","README.md"]·activeTab ["README.md"](`06-file-result-open.png`). `src/search/Search.tsx:47-57` |
| I-5 | 내용 검색·Replace가 화면·키맵·코드에 없다 | 충족 | 지운 파일: `src-tauri/src/project_search.rs`, `src/search/model.ts`·`model.test.ts`·`replace.ts`·`replace.test.ts`. 검색 화면 버튼 0개(searchButtons []). C-05 검토 지적 없음 |
| I-5 | 대소문자 처리 보고 | — | 대소문자를 구분하지 않는다(`name.to_lowercase().contains(query)`, 검색어도 소문자로). 대소문자 버튼은 남기지 않았다(정규식·단어 버튼도 지움) |
| I-6 | 상태 바 진단 버튼 없음, `Ctrl-Shift-M` 무동작, 메뉴·키맵·코드에 Diagnostics 없음 | 충족 | statusButtons ["Close Left Dock","Search"], Ctrl-Shift-M 뒤 tabs [] → [], diagText false(`01`·`02` 캡처). `src/diagnostics/` 전체 지움. `src/shell/status.test.ts:31` dispatch(["ctrl-shift-m"]) = none. 버튼 자리는 비워 둠 |
| I-7 | 테마 창 "View Themes", 아이콘 테마 창 "View Icon Themes", "Install" 없음, 누르면 Extensions 각 범주 | 충족 | `v3b.json` themeFooter ["View Themes"]·themeInstall false → extCategoryAfterThemes ["Themes"]; iconFooter ["View Icon Themes"]·iconInstall false → extCategoryAfterIcons ["Icon Themes"]. 캡처 `07`~`10`. `src/theme/selector.ts:39,41`, `src/theme/commands.ts:23,36`. Extensions 화면 코드는 바꾸지 않았다. 테마 받기·추가 경로 없음(C-05) |

## 검증
- coder K-01·K-02: typecheck, cargo check, clippy -D warnings, cargo test 21, 관련 node 테스트 통과.
- checker C-05(커밋 직전 전체 1회): `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 210 통과·0 실패, `cargo clippy … -D warnings` 경고 0, `cargo test` 21 통과. R-4~R-7 코드 검토 [PASS], 지적 없음. (regex 제거 뒤 clippy·test를 다시 돌렸다.)
- 빌드: `npm.cmd run tauri build -- --debug --no-bundle` 성공.
- V3(`[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`): 주 모니터 100%, One Light, Catppuccin Latte, 임시 APPDATA와 임시 폴더(README.md, thread.ts, other.txt, reader/notes.txt, docs/guide.md). 입력은 SendInput(`tools/win-input.ps1`), 값은 CDP 덤프. checker C-06 판정 [PASS] 10/10.
- 캡처: `specs/v0.6/verify/ORDER-02/` `01-status-bar-search-tooltip.png`, `02-ctrl-shift-m-nothing.png`, `03-search-read.png`, `04-search-rdm.png`, `05-folder-result-reveal.png`, `06-file-result-open.png`, `07-theme-selector.png`, `08-extensions-themes.png`, `09-icon-theme-selector.png`, `10-extensions-icon-themes.png`, `v3.json`, `v3b.json`.

## 지운 것·더한 것·하지 않은 것 (D-8)
- 지운 것: 내용 검색(Rust `project_search.rs`, 프런트 model·replace와 테스트, 검색 옵션·Replace·발췌 UI와 CSS, 쓰지 않는 검색 메트릭), Project Diagnostics(`src/diagnostics/` 전체, 버튼, `Ctrl-Shift-M`), `regex` 직접 의존성(`Cargo.toml`·`Cargo.lock` 한 줄, `src/licenses/regex-1.13.1-*.txt` 둘) — 근거: core D-8, core-leader 2026-11-10. regex는 tauri-utils·urlpattern의 간접 의존성이라 Cargo.lock에 패키지로 남는다(`cargo tree -i regex`).
- 더한 것: `src-tauri/src/name_search.rs`(이름 부분 일치 검색 `search_names`, 링크·junction 따라가지 않음, 창 폴더 루트 밖 거부, 결과 5,000개 제한)와 그 테스트. 새 의존성 없음(기존 `ignore` WalkBuilder 사용).
- 하지 않은 것: 진단 버튼 자리에 아무것도 넣지 않았다(Phase 10). 내용 검색 코드를 다시 쓰려고 남겨 두지 않았다.
- 남은 위험: 검색어를 바꿔 다시 찾으면 프런트는 이전 결과를 버리지만 이미 시작한 Rust 쪽 탐색은 끝날 때까지 돈다(큰 폴더에서 CPU를 잠시 더 씀). V3 두 세션 모두 SendInput `ctrl+k ctrl+t`로 테마 선택 창이 열리지 않아 사용자 메뉴로 열었다. ORDER-02는 이 바인딩을 바꾸지 않았고(`src/theme/selector.ts:6`, dispatch 테스트 통과), 원인은 확인하지 않았다.

## 바꾼 파일
- 코드 커밋 `04c7b0d`: `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`, `src-tauri/src/lib.rs`, `src-tauri/src/name_search.rs`(새), `src-tauri/src/project_search.rs`(지움), `src/App.tsx`, `src/index.tsx`, `src/diagnostics/*`(지움), `src/extensions/state.ts`, `src/licenses/regex-1.13.1-*.txt`(지움), `src/search/Search.tsx`, `src/search/search.css`, `src/search/model*.ts`·`replace*.ts`(지움), `src/shell/Icon.tsx`, `src/shell/status.ts`·`status.test.ts`, `src/spec/metrics.ts`, `src/theme/commands.ts`·`selector.ts`·`selector.test.ts`·`theme.ts`·`theme.test.ts`, `src/workspace/context.ts`·`tab-view.ts`·`tab-view.test.ts`
- 문서 커밋 `c58816a`: `specs/v0.6/PROGRESS.md`(Phase 2 절), `specs/v0.6/verify/ORDER-02/`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- checker 허용 목록(`.agents/checker-settings.json`)에 `git diff`가 없다. C-05에서 checker가 `git diff src-tauri/Cargo.toml` 허가 창에서 1시간 넘게 멈췄고, leader가 취소(No)한 뒤 diff를 직접 확인해 넘겼다. auto mode가 leader·writer의 설정 변경을 막으므로 넣지 않았다. → 사용자(ORDER-01-R2의 `git grep` 항목과 함께)
- SendInput `ctrl+k ctrl+t`로 테마 선택 창이 열리지 않은 원인(ORDER-02 범위 밖, 위 "남은 위험"). → core-leader(필요하면 다음 V3에서 확인)

## BLOCKED
- 없음(regex 제거는 [BLOCKED] 뒤 core-leader 답으로 진행)
