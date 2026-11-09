[DONE] ORDER-07 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| I-13 | 하위 폴더를 여럿 펼친 긴 트리를 같은 위치까지 스크롤한 Zed와 tauri 캡처에서 고정 줄이 같다 | 사용자 확인 대기(Zed 비교 캡처는 사용자가 Zed를 닫은 뒤) | 사용자 Zed는 쓰지 않았다(core-leader). 구현 기준: core `specs/v0.6/refs/I-13-zed.png`, `docs/refs/01-zed/01-LAYOUT.md` L-47·L-51, Zed 소스(커밋 14b7b0ef, 문서와 같은 커밋) `crates/ui/src/components/sticky_items.rs:139-322`, `crates/project_panel/src/project_panel.rs:659-676, 1415-1423, 6576-6600, 7378-7430`(읽기만, 복사 없음). tauri: `specs/v0.6/verify/ORDER-07/v3.json` deepScroll — gamma 안까지 스크롤하면 proj·alpha·beta·gamma 고정(top 0/26/52/78, 높이 26 = 일반 줄), `tree-deep-scroll.png`. `I-13-zed.png` 상태(첫 보이는 항목이 루트 바로 아래 자식)에서는 루트 줄 하나만 고정된다(같은 로직, C-11) |
| I-13 | (Zed가 고정하면) 상위 폴더들도 고정 | 충족(소스 기준) | Zed 소스는 맨 위 항목의 상위 폴더 사슬 전체를 고정한다(project_panel.rs 7378-7430). tauri도 같음: deepScroll 사슬 4줄. 마지막 자식이 지나가면 마지막 고정 줄이 밀려 올라간다(sticky_items.rs 285-322): `v3.json` drifting — gamma 78→58 뒤 사라지고 proj·alpha·beta 남음, `tree-after-drift.png` |
| I-13 | 고정된 줄을 누르면 Zed와 같은 동작 | 충족(소스 기준) | Zed: 펼치기/접기 없이 그 폴더가 고정 순번 자리에 오도록 스크롤하고 1px 보정(project_panel.rs 6576-6600). tauri: alpha 고정 줄 클릭 → 펼치기 상태 그대로(모두 true), 스크롤 (1−1)×26−1 → 0, 포커스 패널(`v3.json` clickSticky, `tree-after-sticky-click.png`). Zed 화면과의 비교는 사용자 확인 대기 |

## 폴더를 여럿 열었을 때
- Zed는 한 목록에 여러 worktree를 두고 각 루트를 깊이 0으로, 지금 맨 위 항목이 속한 worktree의 사슬만 고정한다(project_panel.rs 7394, 5977-6000).
- tauri는 등록 폴더마다 트리 하나다(기존 구조, 이번에 바꾸지 않음). 다른 등록 폴더로 바꾸면 그 폴더의 사슬만 고정된다: `v3.json` multiFolder.second — second·inner, `tree-second-folder.png`. Zed와 같은 조건 캡처는 사용자 확인 대기.

## 검증
- coder K-09: typecheck, node 테스트 35(깊이 사슬, 경계·1px drifting, 빈/한 줄, 루트 여럿, overlay 색 합성·테마 우선).
- checker C-11(커밋 직전 전체 1회): `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 215 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 21 통과. 코드 검토(Zed 소스 동작과 같음, 복사 없음)·V3 판정 PASS, 지적 없음.
- V3(`[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`): debug exe, 임시 APPDATA·WebView 데이터 폴더, One Light, 임시 폴더 proj(alpha/beta/gamma 깊이 3, 파일 다수)·second(inner). SendInput 클릭·휠, CDP 값 읽기. hover한 고정 줄만 `panel.overlay_hover` 색(`v3.json` hoverSticky).
- 결과 파일: `specs/v0.6/verify/ORDER-07/` `v3.json`, `tree-deep-scroll.png`, `tree-after-drift.png`, `tree-after-sticky-click.png`, `tree-second-folder.png`. (`v3.json` multiFolder.backToProj 줄은 leader 스크립트가 Sidebar 항목을 못 눌러 무효.)

## 지운 것·더한 것·하지 않은 것 (D-8)
- 더한 것: `stickyRows` 순수 함수(`src/workspace/tree.ts`)와 테스트, 트리 고정 레이어(높이 0 sticky, 일반 줄 렌더 재사용), 고정 줄 클릭 스크롤, `panel.overlay_background`/`overlay_hover` 토큰(`src/theme/theme.ts`, 테마 값 우선·없으면 T-26.1·T-26.2 합성), 키보드 선택 가림 방지. 새 의존성 없음.
- 지운 것: 없음.
- 하지 않은 것: 등록 폴더 여럿을 한 트리로 합치기, 스크롤바(Phase 4) 변경. 고정 레이어가 목록 높이를 바꾸지 않아 스크롤바 위치·thumb는 그대로다.
- 남은 위험: `docs/refs/01-zed/01-LAYOUT.md` L-51·L-127은 sticky scroll을 "제외"로 적고 있다(core I-13이 덮음, 문서는 고치지 않음). 키보드 선택 가림 방지는 코드·테스트로만 확인했다.

## 바꾼 파일
- 코드 커밋 `5f161e3`: `src/shell/ProjectTree.tsx`, `src/workspace/tree.ts`, `src/workspace/tree.test.ts`, `src/theme/theme.ts`, `src/theme/theme.test.ts`, `src/app.css`
- 기록 커밋 `f1433d1`: `specs/v0.6/PROGRESS.md`(Phase 7 절), `specs/v0.6/verify/ORDER-07/`
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- I-13 Zed 비교 캡처(고정 줄, 고정 줄 클릭, 폴더 여럿): 사용자 Zed를 쓰지 않았다. → 사용자(Zed를 닫은 뒤)
- `docs/refs/01-zed/01-LAYOUT.md` L-51·L-127의 sticky scroll "제외" 문구를 이번 결정에 맞게 고칠지(출발 문서는 core ITEMS가 우선한다, core D-9) → core-leader

## BLOCKED
- 없음
