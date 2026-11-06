[DONE] ORDER-01 tauri

## 완료 기준
| 번호 | 기준 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력) |
|---|---|---|---|
| 1 | specs/v0.5 문서 여섯 | 충족 | `specs/v0.5/` INTENT·DECISIONS·SPEC·PLAN·HERDR-SETUP·PROGRESS, 상태 줄 모두 "초안". SPEC R-1~R-23 = I-1~I-23 |
| 2 | 서브 에이전트 셋과 탭 배치 | 충족 | `herdr agent list`: tauri-writer `wJ:pK`, tauri-coder `wJ:pM`, tauri-checker `wJ:pN`. `herdr tab list --workspace wJ`: control `wJ:t1`, docs `wJ:t6`, impl `wJ:t7`, check `wJ:t8` |
| 3 | 이 보고 파일 | 충족 | `D:\projects\workbench-tauri\specs\v0.5\reports\ORDER-01.md` |
| 0 | (tauri만) v0.4 종료 기록, 커밋, 태그 `v0.4` | 충족 | `specs/v0.4/PROGRESS.md` "버전 종료"에 사용자 판단 원문과 남은 것(V4 16항목), `specs/v0.4/PLAN.md` Phase 3 커밋 칸 `72bdaa7`(git log로 Phase 3 커밋 확인). 커밋 `f7541ee`, `git tag --points-at f7541ee` → `v0.4` |

## 문서 경로
- `specs/v0.5/INTENT.md` — 상태: 초안
- `specs/v0.5/DECISIONS.md` — 상태: 초안
- `specs/v0.5/SPEC.md` — 상태: 초안
- `specs/v0.5/PLAN.md` — 상태: 초안
- `specs/v0.5/HERDR-SETUP.md` — 상태: 초안
- `specs/v0.5/PROGRESS.md` — 상태: 초안
- `AGENTS.md` — 레포 규칙(HERDR 구성 = core D-2, D-7 줄 추가, 역할 이름)과 역할 절을 v0.5로 고침

## 에이전트
| 이름 | pane | 탭 | 도구·모델 |
|---|---|---|---|
| tauri-leader | wJ:p1 | control (wJ:t1) | Claude Code Opus 5.5 |
| tauri-writer | wJ:pK | docs (wJ:t6) | Claude Code Opus 5.5 medium (`claude --model claude-opus-5-5 --effort medium`) |
| tauri-coder | wJ:pM | impl (wJ:t7) | Codex gpt-6.1-sol medium (`codex -m gpt-6.1-sol -c model_reasoning_effort=medium`, 상태 줄 "GPT-6.1-Sol medium") |
| tauri-checker | wJ:pN | check (wJ:t8) | agy gemini-3.8-flash-high (`agy --model gemini-3.8-flash-high`) |

- 닫은 v0.4 에이전트: 없음. 이 세션 시작 때 wJ에는 control 탭(leader)만 있었다.
- 남겨 둔 worktree: 없음(`git worktree list` → 본 트리 하나).
- coder·checker는 역할 확인만 했다(파일 수정·앱 실행 없음).
- 참고: Codex 시작 때 업데이트 안내(0.166.0 → 0.167.0)가 떠서 "Skip"을 골랐다(도구 버전을 바꾸지 않음).
- 참고: tauri-leader가 `herdr tab create`를 `--workspace` 없이 실행해 core 워크스페이스에 탭 `wM:t2`가 잠깐 생겼다. 바로 닫았다(`herdr tab close wM:t2`). 그 탭에서는 아무것도 실행하지 않았다.

## 바꾼 파일
- 커밋 `f7541ee` (태그 `v0.4`): `specs/v0.4/PROGRESS.md`, `specs/v0.4/PLAN.md`
- 이 보고와 같은 커밋: `AGENTS.md`, `specs/v0.5/INTENT.md`·`DECISIONS.md`·`SPEC.md`·`PLAN.md`·`HERDR-SETUP.md`·`PROGRESS.md`, `specs/v0.5/reports/ORDER-01.md` (해시는 `git log -1 -- specs/v0.5/reports/ORDER-01.md`)
- push하지 않았다.

## 검토
- C-01 (tauri-checker, agy): 항목 1~6(SPEC↔I-n과 판정 방법, PLAN↔core Phase 2~11, HERDR-SETUP↔D-2·D-4, DOCUMENTS 절 구성, AGENTS 규칙·D-7, 지어낸 값) 모두 PASS. 최종 판정 PASS. 남은 지적 없음.

## 미정
- 루트 `INTENT.md` "다루지 않는 것"과 부딪침: "설정 UI 화면" ↔ R-2(I-2 Settings), "프로젝트 전체 검색" ↔ R-22(I-22 검색 버튼). 혼자 맞추지 않았다. → 사용자(core-leader 경유)가 정한다.
- R-22: 이 레포에 진단(언어 서버) 기능이 없다. Phase 8에서 `[BLOCKED]`로 둘지 → 사용자/core-leader.
- 해당 Phase에서 tauri가 Zed로 확인할 것: R-2 Settings·Keymap·Extensions·Panel Layout이 여는 화면, R-5 열린 탭 없을 때 상태 바, R-9 스크롤 중 스크롤바, R-12 코드 파일 경로 줄 내용, R-14 한글 고딕 글꼴 이름, R-15 Zed 지원 형식 목록, R-16 탭 넘침 동작, R-23 탭 바 오른쪽 버튼 보임 조건. → tauri (해당 Phase)
- R-14: 글꼴 값의 `spec/zed-metrics.toml` ID가 있는지(없으면 원본 gpui에서 더함). → tauri-leader가 Phase 3에서 확인하고 보고
- D-8·D-9 복사본의 `.gitignore` 폴더 경로·없을 때 모습·다시 채우는 법(Phase 5·7), D-9 Zed 출처 커밋(Phase 5), D-10 굵기·스타일·버전, 웹뷰 로딩 방식, CSP 변경 필요 여부(Phase 3). → tauri-leader가 해당 Phase에서 정한다(CSP는 승인 필요)
- v0.4 V4 16항목의 사용자 판단, 고칠 항목을 v0.5에서 다룰지 → 사용자, v0.5 Phase 12
- 문서 확정(상태 "초안" → 확정) → core-leader 판정 뒤 사용자

## BLOCKED
없음
