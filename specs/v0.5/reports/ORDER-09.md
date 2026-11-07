[DONE] ORDER-09 tauri

## 완료 기준
| 항목 | 판정 방법 요약 | 결과(충족/미충족/BLOCKED/이미 같음) | 측정값·캡처 경로 |
|---|---|---|---|
| I-10 뒤로·앞으로 | 툴팁·단축키가 Zed와 같고 버튼·키로 이동 기록을 따라감 | 충족 | 툴팁 `Go Back Alt-Left`·`Go Forward Alt-Right`(Zed `zed-tip-back.png`·`zed-tip-forward.png`), 기록 없으면 비활성. 이동: AGENTS 5:23 → App.tsx 열기 1:1 → Ctrl-End 75:1 → Alt-Left 1:1 → Alt-Left AGENTS 5:23 → Alt-Right 1:1 → Alt-Right 75:1(`tauri-v3-one.json` nav) — Zed 규칙과 같음. 규칙(Zed 소스): pane별 기록, 최대 1024(pane.rs:323), 탭을 떠날 때 기록(items.rs:906-908), 10줄 이상 커서 이동 기록(MIN_NAVIGATION_HISTORY_ROW_DELTA editor.rs:307), 닫힌 탭 위치로 가면 다시 엶, 키 Pane `alt-left`/`alt-right`(default-windows.json 518·521). V1 테스트가 Zed 캡처 순서 그대로 재현(`nav-history.test.ts`). SPEC R-10 788행 |
| I-11 탭 툴팁 | 탭에 올리면 절대 경로 툴팁 | 충족 | `D:\projects\workbench-tauri\AGENTS.md`(역슬래시), 탭 아래(`tauri-one-tip-tab.png` / `zed-tip-tab.png`). 도구 탭 규칙도 Zed대로(Project Search는 검색어, Diagnostics는 `Project Diagnostics`, Settings·Keymap·Extensions 없음, 읽기 전용은 `Read-Only Tab` 메타). SPEC R-11 858행 |
| I-12 경로 줄 | 같은 파일·커서에서 글자가 Zed와 같음(폴더 하나·둘, 마크다운·코드) | 충족(코드 심볼은 core 결정대로 Phase 11) | 마크다운: 열자마자 `AGENTS.md › # AGENTS`, 5행 `AGENTS.md › # AGENTS › ## 레포 규칙`(`tauri-one-bc-h2.png` / `zed-bc-md-h2.png`, 글꼴·색·구분자 같음). 코드: `src\App.tsx`(경로만). 폴더 둘: `workbench-tauri\AGENTS.md › # AGENTS`(`tauri-two-bc-agents.png` / `zed-bc-two-tauri.png`). 분할 pane은 각자 커서(편집기마다 신호, 코드 확인). 오른쪽은 미리보기 버튼만. 글자 시작 x: tauri 8 → K-42에서 Zed와 같은 12(툴바 8 + 버튼 안쪽 4, 코드 확인, 재측정 안 함). SPEC R-12 901행 |
| I-16 탭 넘침 | 많이 열었을 때 모습·동작이 Zed와 같음 | 충족 | 탭 13개: 원래 폭 한 줄, 좌우 잘림, 화살표·목록·스크롤바 없음, 뒤로·앞으로와 오른쪽 버튼 고정(`tauri-one-overflow.png` / `zed-overflow.png`). 휠 한 칸 78px(scrollLeft 587→665; Zed 약 77~80, 소스 3줄×줄 높이 = 77.7). 탭을 바꾸면 활성 탭이 보이게 스크롤(activeVisible true). SPEC R-16 1051행 |
| I-23 오른쪽 버튼 조건 | 보이는 조건이 Zed와 같음 | 충족(이미 같음, 확인) | Zed: 그 pane에 포커스가 있을 때만, 패널 포커스면 탭 바·편집 영역 hover에도 안 보임, 분할은 포커스 pane만. tauri: 편집기 포커스 때 3개 보임, 패널 클릭 뒤 숨김, 탭 바 hover에도 숨김(`tauri-v3-one.json` buttons_panel_focus). SPEC R-23 1533행 |
| I-20 역슬래시 | 탭 툴팁·경로 줄이 `\` | 충족 | `D:\projects\workbench-tauri\AGENTS.md`, `src\App.tsx`, `workbench-tauri\AGENTS.md` |
| 앞 Phase | 결과 유지 | 충족 | npm test 196/196, cargo test 25, clippy 0(checker C-26 PASS) |

- 공통 조건: 1920×1080, 배율 100%, 클라이언트 1440×852, One Dark. Zed는 `zed -n` 새 창 4개(각 그 창만 닫음), 파일은 Ctrl-P로 열기만, 편집·저장 없음. tauri는 앱 데이터 백업·시험 데이터·복원(매번 차이 0), 띄운 PID만 닫음.

## Zed 확인 (2장, tauri가 먼저 확인해 SPEC에 적음 — gpui 읽기용)
- 위치: `specs/v0.5/SPEC.md` R-10 806행, R-11 876행, R-12 921행, R-16 1071행, R-23 1553행의 "Zed 확인(2026-11-07)". 캡처 `specs/v0.5/verify/ORDER-09/zed-*.png`.
- **코드 파일 경로 줄(PLAN 완료 조건 2)**: Zed는 `src\App.tsx › function App()`처럼 커서 위치의 심볼 계층을 문법 색으로 보인다(66행, `zed-bc-code.png`). 심볼 밖(1행)은 경로만. core 결정(2026-11-07)대로 Phase 9는 경로만, **심볼 계층은 Phase 11(ORDER-11)에서 문법 기반과 함께 마무리**. 실행 중 Zed 설치 폴더에서 문법을 읽는 지금 방식은 D-8에 어긋나 Phase 11에서 복사본으로 바꾼다(DECISIONS 기록).
- 기타: 새 탭은 활성 탭 바로 오른쪽에 열림. `+` 툴팁 `New…`(키 없음). 사용자 Zed는 VSCode 기본 키맵.

## 레포 상태 확인 (core-leader 지시)
- Zed 확인 전·후와 tauri 실행 전·후에 두 레포 `git status`를 봤다. `.zed` 폴더는 두 레포 모두 없다. workbench-tauri의 새 파일은 측정 캡처(`specs/v0.5/verify/ORDER-09/`)뿐이다.
- workbench-core는 측정 동안 Zed·앱이 만든 파일이 없다. 확인 뒤 보인 변화(`specs/v0.5/orders/ORDER-10.md` 새 파일, `specs/v0.5/PROGRESS.md` 수정 17:30)는 core-leader의 작업이다(앞서 정정 알림).

## 남은 차이
- 코드 파일 심볼 계층: Phase 11.
- Go to Line이 이 앱에 없어 그 점프의 기록은 없다(규칙은 Zed와 같고 큰 커서 이동으로 같은 기록이 생김). 삭제된 파일 기록 제거는 모델에만 있고 파일 삭제 감시에 연결 안 함(`shortcut:`).
- tauri는 프로젝트 패널이 한 번에 한 폴더만 보여 둘째 폴더 파일의 경로 줄은 측정하지 않았다(규칙 함수는 테스트로 확인: `workbench-core\specs\v0.5\ITEMS.md`).
- K-42(경로 줄 글자 시작 12px)는 코드 확인만, 다음 화면 차례에 확인.

## 운영
- tauri 앱 4회 실행: 1차(폴더 하나·둘)에서 측정 스크립트가 스크롤된 트리 항목 자리의 상태 바 진단 버튼을 눌러 Diagnostics 탭이 열렸고(앱 문제 아님), 경로 줄 제목이 안 나오는 버그를 찾아 K-41로 고친 뒤 2차(폴더 하나·둘)로 다시 쟀다.
- checker C-26 PASS. 참고: folder_watch 테스트 하나가 부하 때 늦을 수 있음(재실행 통과).
- coder는 Sonnet 5.5 high(15:57 교체) 그대로.
- 커밋(push 안 함): b52f848 ~ ab87036, 그리고 이 보고.
