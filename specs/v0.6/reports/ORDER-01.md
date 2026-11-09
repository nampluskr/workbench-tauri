[DONE] ORDER-01 tauri

## 완료 기준
| 번호 | 기준 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력) |
|---|---|---|---|
| 1 | specs/v0.6 문서 여섯 | 충족 | `specs/v0.6/` INTENT·DECISIONS·SPEC·PLAN·HERDR-SETUP·PROGRESS(상태 줄 모두 "초안"). checker C-01 [PASS] |
| 2 | 서브 에이전트 셋과 탭 배치 | 충족 | `herdr agent list`: tauri-writer `wV:p2`, tauri-coder `wV:p3`, tauri-checker `wV:p4`. `herdr tab list --workspace wV`: control·docs·impl·check |
| 3 | 이 보고 파일 | 충족 | `specs/v0.6/reports/ORDER-01.md` |

## 문서 경로
- `specs/v0.6/INTENT.md` — 버전: v0.6 · 작성일: 2026-11-10 · 상태: 초안
- `specs/v0.6/DECISIONS.md` — 같음 (이 레포의 결정: 없음, 미결 사항 4개)
- `specs/v0.6/SPEC.md` — 같음 (R-1~R-20)
- `specs/v0.6/PLAN.md` — 같음 (Phase 1~10)
- `specs/v0.6/HERDR-SETUP.md` — 같음
- `specs/v0.6/PROGRESS.md` — 같음

## 대응 확인
- SPEC: I-n ↔ R-n 1:1, 같은 번호. `SPEC.md` 줄: R-1 18, R-2 38, R-3 58, R-4 78, R-5 98, R-6 126, R-7 146, R-8 166, R-9 189, R-10 215, R-11 241, R-12 261, R-13 281, R-14 301, R-15 321, R-16 341, R-17 361, R-18 412, R-19 443, R-20 465. 판정 방법은 ITEMS 문장 그대로(checker 대조). C-1~C-9 없음(`grep -c "C-[1-9]"` = 0).
- PLAN: 대응 표(tauri Phase ↔ core Phase(ORDER) ↔ G-n ↔ R-n(I-n)) `PLAN.md` 24~36줄. core D-5 규칙 41~45줄, D-8 구현 원칙 57~66줄. tauri Phase 번호 = core Phase 번호.

## 에이전트
| 이름 | pane | 탭 | 도구·모델 (시작 인자) |
|---|---|---|---|
| tauri-leader | `wV:p1` | control `wV:t1` | Claude Code Opus 5.5 (지금 세션) |
| tauri-writer | `wV:p2` | docs `wV:t2` | Claude Code `--model claude-opus-5-5 --effort medium` (상태 줄 Opus 5.5 (medium)) |
| tauri-coder | `wV:p3` | impl `wV:t3` | Codex `-m gpt-6.1-sol -c model_reasoning_effort=medium` (상태 줄 GPT-6.1-Sol medium) |
| tauri-checker | `wV:p4` | check `wV:t4` | agy `--model gemini-3.8-flash-high --settings D:\projects\workbench-tauri\.agents\checker-settings.json` (상태 줄 Gemini 3.8 Flash (High)) |

- coder·checker는 역할만 확인하고 다음 카드를 기다린다(파일 수정·앱 실행 없음).
- 닫은 pane: 없음(v0.5 pane은 이 세션에 남아 있지 않았다). worktree: 없음(`git worktree list` = 본 트리 하나).

## 바꾼 파일
- 새 파일: `specs/v0.6/INTENT.md`·`DECISIONS.md`·`SPEC.md`·`PLAN.md`·`HERDR-SETUP.md`·`PROGRESS.md`, 이 보고 파일
- 고친 파일: 루트 `AGENTS.md`(v0.6 참조: 현재 상태, core ITEMS 우선, HERDR 구성 D-4, 0장·카드 파일명·3A.4·8장 경로, gpui 동결된 갈래)
- 커밋: `4fa27fc`(문서 여섯 + AGENTS.md). PROGRESS 두 줄과 이 보고는 `439b12d`. push 안 함.

## 검토
- checker C-01: [PASS]. 3.4의 네 항목과 AGENTS.md 범위 모두 PASS, 지적 없음. 남은 지적 없음.

## 지운 것·더한 것·하지 않은 것 (D-8)
- 더한 것: 문서 여섯과 AGENTS.md 참조 갱신뿐. 지운 것 없음. HERDR-SETUP의 측정 조건·승인 처리는 v0.5 절을 가리키고 바뀐 것만 적었다. 앱 코드·의존성·지난 버전 폴더는 건드리지 않았다.

## 미정
- `spec/` 원본 위치: AGENTS.md "`spec/`의 원본은 `workbench-gpui`다" vs core 루트 INTENT "원본은 core". 문장은 고치지 않았다. → 사용자
- 루트 `INTENT.md`가 core v0.6과 어긋난다: "workbench-gpui와 같아야 한다"·"두 갈래는 같은 앱이다"(core D-1 gpui 동결), "Zed와 같아야 한다"(core D-6·D-7, R-14~R-17은 Zed와 다르게 한다). 고치지 않았다. → 사용자
- AGENTS.md "core ITEMS 우선"의 근거가 core v0.5 D-12인데 core v0.6에 같은 결정이 없다(줄에 "미정"으로 적음). → 사용자(core-leader)
- AGENTS.md의 다른 v0.5 번호 참조: 3장·5장의 "core D-12"·"core v0.5 ITEMS I-n" 예외, 레포 규칙 "(core D-7)"(v0.6 D-7은 다른 결정), 5장 "I-22 진단"(v0.6 I-6에서 없어진다). 카드 목록 밖이라 그대로 두었다. → 사용자(core-leader)
- Codex 한도가 바닥날 때 v0.5 core D-16의 Sonnet 5.5 대체를 v0.6에도 쓸지(ORDER-01은 [BLOCKED]로 알리라고만 한다). 지금은 [BLOCKED]로 알린다. → 사용자
- v0.5 HERDR-SETUP 5.5의 서브 에이전트 승인 위임(사용자 2026-11-06)이 v0.6에도 걸리는지. → 사용자
- `docs/BUILD.md`(R-1·R-3) 작성자: HERDR-SETUP 4장에 coder로 두고 "미정". → core-leader 또는 사용자
- 새 파일 형식(PDF·동영상·이미지) 기능을 이번 버전에 넣을지: core INTENT대로 미정. → 사용자

## BLOCKED
- 없음
