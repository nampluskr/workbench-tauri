[DONE] ORDER-02 tauri

V3는 debug exe(커밋 `53de8d5`)로 쟀다. 주 모니터 1920×1080 100%, 창 1440×852, One Dark. 트리·pane 조작은 CDP 마우스·키, 탐색기 놓기는 실제 OLE 파일 끌기(도우미 창 + SendInput; 놓기 직전 그 점이 앱 창인지 확인하고 아니면 Esc로 취소). 앱 데이터·WebView 데이터·픽스처 폴더 `o2ws`는 scratchpad의 별도 폴더. 근거는 `specs/v0.8.1/verify/ORDER-02/`(`v3.json`, `v3-c7.json`, PNG, `measure.mjs`·`measure-c7.mjs`·`ext-drop.ps1`·`drag-src.ps1`). 판정은 checker C-03(검토, REWORK → K-02-R1)·C-04(검토 PASS + V3 판정 #2~#8 통과)다. K-02-R2(C-04 권고)는 화면 동작을 바꾸지 않는 판단 두 곳이라 V1로 확인했다.

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|
| 1 Zed 확인 | 놓을 곳 표시·파일 위·같은 이름·복사 키·여러 개 근거 | 충족 | Zed 소스(커밋 14b7b0e, 읽기만) `crates/project_panel/src/project_panel.rs`: 놓을 곳 표시 6201-6226·6281-6286(대상 폴더 행과 그 아래 행에 `drop_target.background`), 표시 안 하는 곳 6022-6090, 빈 곳 = 루트 7990-8001·8044-8067, 파일 위 = 그 파일의 폴더 6052-6059·4321-4325, 접힌 경로 조각 6902-6965·7040-7085, sticky 행은 끌기·놓기 없음 6278-6279, 같은 이름 = 알림 "Failed to move … A file or folder already exists there."·옮기지 않음 8429-8435·4337-4342, 복사 키 = Ctrl(Windows) 5203-5206·5277-5333(같은 이름이면 copy 이름), 여러 개 = 누른 항목이 marked 안이면 marked 전부 `crates/workspace/src/pane.rs:72-80`·`project_panel.rs:4368`, 자기 자신 4307-4309, 이미 든 폴더 4337-4338, 머물면 펼침 500ms 6413-6450·6428, 가장자리 스크롤 7585-7633, 되돌리기 2554-2560·5327·5440(`crates/project_panel/src/undo.rs`), 외부 파일 = 복사 5037-5158, pane에 놓기 `pane.rs:4048-4146`(폴더는 열리지 않음 4087-4093). 키 `assets/keymaps/default-windows.json:1024-1025`(ProjectPanel `ctrl-z`·`ctrl-shift-z`) |
| 2 옮기기 | 파일·폴더·여러 개를 폴더와 루트로, 앞뒤 캡처·디스크 | 충족 | `v3.json` `c2_file_to_folder.disk`(src/a.txt → dst), `c2_folder_to_folder.disk`(src/sub → dst, `dstSub` true), `c2_multi_to_root`(b.txt·c.txt 두 개 선택 → 루트, `over.root` true, `src` []). 캡처 `00-start.png`·`c3-over-dst.png`·`c2-after-file.png`·`c2-multi-over-root.png`·`c2-after-multi.png`. 마지막 `Get-ChildItem`(`getChildItem`): `dst\a.txt = A-src`, `dst\sub\d.txt = D`, `b.txt = B`, `c.txt = C` 등 내용 그대로 |
| 3 놓을 곳 표시 | 끄는 동안 대상 표시, 자기 자신·하위에서는 없음 | 충족 | `c2_file_to_folder.overDst.rows` = [dst, dst\keep.txt], `bg` rgba(131,137,148,0.5) = 토큰 `--drop-target-background` #83899480; 파일 위(`overDstFile`)도 그 폴더. `c3_c4_not_allowed.srcOverOwnFile`·`srcOverChild`·`srcOverSelf`·`keepOverSameFolder` 모두 표시 없음(`c3-no-target-self.png`) |
| 4 막기 | 자기 자신·하위·이미 든 폴더는 아무 일 없음, 같은 이름이면 기존 내용 그대로 | 충족 | `c3_c4_not_allowed.disk` 변화 없음(실제로 놓음). `c4_same_name`: 알림 "Failed to move `dst\a.txt` to `dst2\a.txt`. A file or folder already exists there.", `dst2a` "EXISTING-A", `dstA` "A-src". V1: `ops.test.ts` "I-3: a drop does nothing…"·"I-3: a tree drag carries…", Rust `names_and_recursive_copy_do_not_overwrite`(배타 이동·copy 이름) |
| 5 열린 탭 | 옮긴 파일·폴더의 탭 경로·툴팁 새 위치, 저장 안 한 편집 남음 | 충족 | `c5_open_tab_file`: 툴팁 `…\docs\doc.md` → `…\dst\doc.md`, dirty true, 본문 "# docEDIT1 ", 활성 파일 행 `…\dst\doc.md` rgb(220,224,229). `c5_open_tab_folder`: 툴팁 `…\dst\proj\f.md`, 본문 "# fEDIT2 ", dirty true. 되돌리기 `undo_redo`: 트리에서 Ctrl+Z → proj 복귀·툴팁 `…\proj\f.md`, Ctrl+Shift+Z → 다시 `…\dst\proj\f.md`, 편집기 포커스 Ctrl+Z는 트리를 바꾸지 않음 |
| 6 놓아 열기 | pane 본문·탭 바에 놓으면 그 pane, 가장자리는 분할(R-10) | 충족 | `c6_pane_drop`: 본문 가운데(`overlay` center) → 같은 pane 끝에 o1.txt(`t1`), 탭 위(`tabLine` drop-left) → 그 탭 앞에 o2.txt(`t2`), 오른쪽 가장자리(`overlay` right) → 분할된 새 pane에 o3.txt(`t3`), 폴더 → 변화 없음(`t4`, Zed와 같이 열리지 않음). 캡처 `c6-over-body.png`·`c6-over-tab.png`·`c6-over-right-edge.png`·`c6-after.png`. 새 탭을 뒤쪽 탭 위에 놓는 자리(C-03 F-1)는 `drop.test.ts` "I-3: a tree file dropped on a tab…" |
| 7 탐색기에서 | 파일·폴더를 트리 폴더에 놓으면 복사, 원본 남음, 같은 이름이면 기존 그대로 | 충족 | `v3-c7.json`: 실제 OLE 끌기 `status` dropped·`effect=Copy`. 같은 이름 파일 → `ext copy.txt`(내용 EXT-NEW), 기존 `ext.txt` "EXT-OLD" 그대로; 폴더 `extdir` 복사(`g` "G"); 원본 `ext-src` 그대로(`originals`). 파일 하나라 탭으로 열림(Zed와 같음). `c7-after-file.png`·`c7-after-folder.png` |
| 8 회귀 | 클릭·여러 개·이름 바꾸기·우클릭·고정 행, 탭 드래그, 임시 탭, 활성 파일 글자색, 짧은 클릭 | 충족 | `c8_regress`: 한 번 클릭 → 선택 + 임시 탭(preview true), 행 안에서 3px 흔들린 클릭 → 끌기 없음·선택만, Ctrl 여러 개, F2 입력·Esc, 우클릭 메뉴 13항목, 탭 드래그(R-10) 순서 바뀜, sticky 행 2개·끌기 안 됨(`c8-sticky.png`), 활성 파일 행은 옮긴 뒤 새 위치에서 rgb(220,224,229)(#5). 가장자리 자동 스크롤 `f2_edge_scroll`: scrollTop 0 → 775, 놓기 직전 포인터 밑 폴더(openme)로 옮겨짐 |
| 9 테스트 | 판단·같은 이름 테스트, 기존 통과, typecheck 0, cargo test·clippy 0 | 충족 | `ca2b33a`에서 `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 292/292, `cargo clippy -- -D warnings` 경고 0, `cargo test` 23/23. 새 테스트: `ops.test.ts` 2, `drop.test.ts` 1, `undo.test.ts` 2, Rust `trash_lookup_ignores_letter_case` |
| 10 보안 설정 | CSP·asset protocol이 `de17d49`과 같음, capability 앞뒤 | 충족 | `git diff de17d49 -- src-tauri/tauri.conf.json src-tauri/capabilities` 출력 없음(C-03·C-04). capability 변경 없음(`core:event:allow-listen`은 원래 있음, 새 Rust 명령은 앱 명령) |

## 검증
- `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 292/292, `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings` 경고 0, `cargo test --manifest-path src-tauri/Cargo.toml` 23/23(`ca2b33a`). `npm.cmd run tauri build -- --debug --no-bundle` 성공(`53de8d5`).
- 화면 차례 한 번(`[SCREEN-REQ]`/`[SCREEN-OK]`/`[SCREEN-DONE]`). 스크립트 문제(본문 가운데 대신 가장자리, 탭 하나 pane, 가려진 행, 도우미 창 숨김, 앱 창이 다른 창에 가림 → 안전 확인이 끌기를 취소)로 같은 차례 안에서 다시 쟀다. 결과 파일은 마지막 실행 것(`v3.json`의 `c7_explorer` ERR는 `v3-c7.json`이 대체).
- 검토: C-03 REWORK(F-1 탭 위 자리, F-2·F-3) → K-02-R1, C-04 PASS(권고 R-1·R-2 → K-02-R2, R-3 하지 않음).

## 지운 것·더한 것·하지 않은 것
- 더함: 트리 포인터 끌기(누른 행 밖으로 나가면 시작), 놓을 곳 표시(`.tree-row.drop-target`·`.tree-segment.drop-target`·`.tree-scroll.drop-target`), 트리 안 옮기기(배타 이동)·Ctrl 복사(copy 이름), 머물면 펼침, 가장자리 자동 스크롤, pane에 놓아 열기(R-10 판정·표시 재사용), 탐색기 놓기(`onDragDropEvent`, 기존 `paste_paths` 복사), 되돌리기·다시 하기(`project_panel::Undo/Redo`, ProjectPanel `ctrl-z`/`ctrl-shift-z`; 옮기기 ↔ 되돌려 옮기기, 복사본 → 휴지통 ↔ 복원; 덮어쓰지 않고 알림), Rust 명령 `trash_for_undo`·`restore_trashed`. 의존성·설정·capability·CSP 변경 없음.
- 하지 않음: 트리에서 밖으로 끌어 내기, 잘라내기/붙여넣기 단축키, 드래그 설정, 끄는 동안 따라다니는 그림·커서 모양, 우클릭 메뉴의 Undo/Redo 항목(Zed에는 있음), C-04 R-3(되돌리기 기다리는 동안 새 drop이 끼는 순서).
- Zed와 다른 점: 하위 폴더로 옮기기는 표시·알림 없이 아무 일 없음(Zed는 파일 시스템 오류 알림 — leader-core 결정 "아무 일도 없음"), 탐색기 같은 이름은 Zed의 Replace/Cancel 물음 대신 copy 이름(덮어쓰지 않음 결정), 탭 위 표시는 Zed 탭 배경 대신 R-10 선, 끌기 시작 문턱은 Zed 값을 확인 못 해(gpui) "누른 행 밖으로".
- 남은 위험: 복사 되돌리기(휴지통 확인창이 네이티브 창)는 화면에서 재지 못하고 코드 검토만 했다. pane에 폴더를 끌면 가운데 표시는 뜨지만 놓으면 아무 일 없다(Zed 표시 여부 미확정). 휴지통 항목 id는 보내기 전후 목록 차이로 찾는다(같은 순간 다른 프로그램이 같은 경로를 휴지통에 넣으면 드물게 어긋남).

## tauri가 고른 것
- 끌기 시작 문턱: 누른 행의 사각형 밖으로 나가면 시작(스펙에 px 값이 없고 Zed gpui 값을 확인 못 함). 짧은·흔들린 클릭은 클릭으로 남는다.
- 표시 색: 탭 드래그와 같은 테마 토큰 `drop_target.background`.
- 실패 알림 문구: Zed 문구(같은 이름, 되돌리기 실패 "Undo Failed"/"Redo Failed" 등). rename 자체 실패는 "Could not move the item.", 복사 실패는 기존 "Could not paste the item.".
- 되돌리기 이력: 창에 하나(경로가 절대 경로라 폴더 사이에서도 맞음; Zed는 패널마다), 한도 10,000(Zed `undo.rs:335`).
- Zed 소스 값 상수(leader-core가 core `spec/zed-metrics.toml`에 넣는다, 앱 이름은 `src/spec/metrics.ts`):

  | 상수 | 값 | Zed 소스 |
  |---|---|---|
  | 닫힌 폴더 위 머물면 펼침 | 500 ms | `project_panel.rs:6428` |
  | 가장자리 스크롤 near 구역 | 목록 높이 5% | `project_panel.rs:7600, 7604` |
  | 가장자리 스크롤 far 구역 | 15% | `project_panel.rs:7602, 7606` |
  | near 한 번 이동 | 8 px | `project_panel.rs:7601, 7605` |
  | far 한 번 이동 | 5 px | `project_panel.rs:7603, 7607` |
  | 스크롤 간격 | 16 ms | `project_panel.rs:7631` |
  | 되돌리기 이력 한도 | 10,000 | `undo.rs:335` |

## 바꾼 파일
- 코드 `0c858aa`(K-02): `src/shell/ProjectTree.tsx`, `src/shell/Pane.tsx`, `src/workspace/actions.ts`, `src/workspace/context.ts`, `src/workspace/ops.ts`, `src/workspace/ops.test.ts`, `src/spec/metrics.ts`, `src/app.css`.
- 코드 `2c9d3ef`(K-02b): `src/workspace/undo.ts`(새), `src/workspace/undo.test.ts`(새), `src/workspace/actions.ts`, `src/shell/tree-commands.ts`, `src/keymap/builtin.ts`, `src/keymap/builtin.test.ts`, `src/spec/metrics.ts`, `src-tauri/src/files.rs`, `src-tauri/src/lib.rs`.
- 코드 `53de8d5`(K-02-R1): `src/workspace/drop.ts`, `src/workspace/drop.test.ts`, `src/workspace/context.ts`, `src/shell/ProjectTree.tsx`.
- 코드 `ca2b33a`(K-02-R2): `src/workspace/context.ts`, `src-tauri/src/files.rs`.
- 문서·검증 `f3727eb`: `specs/v0.8.1/PLAN.md`·`PROGRESS.md`, `specs/v0.8.1/verify/ORDER-02/`.

## 미정
- 우클릭 메뉴 Undo/Redo 항목(Zed에 있음, 카드는 키만 정함)을 넣을지 — leader-core.
- 상수 표의 core `spec/zed-metrics.toml` 등록 — leader-core(이미 정함).

## BLOCKED
- 없음(되돌리기 [BLOCKED]는 leader-core가 2026-11-13 결정으로 풀었다)
