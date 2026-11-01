# HERDR-DECISIONS — workbench-tauri 대리 응답 기록

- 구성안: docs/HERDR-SETUP.md
- 기록자: wt-leader
- 가이드: D:\projects\docs\guides\herdr\README.md

## 목록

| 번호 | 시각 | 에이전트 | 요약 | 구분 | 보고 |
| --- | --- | --- | --- | --- | --- |
| D-001 | 2026-11-01 | wt-coder, wt-reviewer, wt-scouter, wt-checker | 시작할 때 나온 폴더 신뢰 확인 화면에서 신뢰를 승인 | 대리 응답 | 2026-11-01 |
| D-002 | 2026-11-01 09:24 | wt-reviewer | 기준 문서 읽기(Get-Content -Encoding UTF8 -LiteralPath) 실행 승인, 같은 접두 명령 상시 허용 | 대리 응답 | 2026-11-01 |
| D-003 | 2026-11-01 09:26 | wt-reviewer → wt-coder | 1회차 리뷰 지적 11건 중 1~10 채택·반영 지시, 11(루트 INTENT 기술 이름)은 사용자에게 올림 | 대리 응답 / 사람에게 올림 | 2026-11-01 |
| D-004 | 2026-11-01 09:31 | wt-reviewer → wt-coder | 2회차 미해소 지적 2(PLAN 완료 규칙) 채택·반영, 3회차에서 해소 확인 | 대리 응답 | 2026-11-01 |

## 기록

### D-001 · 2026-11-01 · wt-coder, wt-reviewer, wt-scouter, wt-checker

- 상황: blocked (승인 요청). `agent start`가 `agent_not_ready`를 반환했다(wt-coder, wt-scouter, wt-checker).
- 질문: Claude "Is this a project you created or one you trust?", Codex "Trust this folder?", agy "Do you trust the contents of this project?" (모두 D:\projects\workbench-tauri)
- 구분: 대리 응답
- 답변: 신뢰를 승인했다. wt-coder는 `send-keys down` 뒤 `enter`를 보냈고, 나머지는 기본 선택이 신뢰라 `enter`만 보냈다.
- 근거: HERDR-SETUP.md 7절에 따라 leader가 승인 권한을 위임받았다. 대상은 사용자가 지정한 이 프로젝트 폴더이고, 방금 git init 한 빈 폴더다. workbench-gpui D-001과 같은 경우다.
- 결과: 네 에이전트 모두 입력 대기 상태로 떴다.
- 보고: 2026-11-01

### D-002 · 2026-11-01 09:24 · wt-reviewer

- 상황: blocked (승인 요청). 샌드박스에서 PowerShell 실행이 액세스 거부로 실패한 뒤 나온 요청이다.
- 질문: "Would you like to run the following command?" — `Get-Content -Encoding UTF8 -LiteralPath 'D:\projects\workbench-tauri\AGENTS.md'` 등 리뷰 대상과 기준 문서 읽기
- 구분: 대리 응답
- 답변: "2. Yes, and don't ask again for commands that start with Get-Content -Encoding UTF8 -LiteralPath"를 골랐다 (`send-keys down enter`).
- 근거: HERDR-SETUP.md 7절 위임. 읽기 전용 명령이고, 리뷰에 필요하다. workbench-gpui D-002와 같은 경우다.
- 결과: 없음
- 보고: 2026-11-01

### D-003 · 2026-11-01 09:26 · wt-reviewer → wt-coder

- 상황: 질문 (리뷰 지적)
- 질문: 1회차 리뷰 11건 (Major 8, Minor 3). SPEC R-8·R-10·R-11·R-12·R-13의 판정 빈틈, PLAN 완료 조건, 창 크기 기준, D-7/SPEC R-5 결정 분산, 루트 INTENT의 기술 이름(DOCUMENTS 3절)
- 구분: 1~10은 대리 응답, 11은 사람에게 올림
- 답변: 1~10을 채택했다. wt-coder에게 "원문을 직접 확인하고, 맞지 않으면 반영하지 말고 이유를 답하라"는 조건으로 반영을 지시했다. 11은 사용자가 직접 말한 문구라 leader가 바꾸지 않고 사용자에게 물었다.
- 근거: HERDR-SETUP.md 7절 위임. 지적마다 원문 위치가 있다. DOCUMENTS 6절 "판정 방법이 없는 요구는 요구가 아니다"에 해당한다. 사용자가 확정한 문장은 사용자에게 올린다(AGENTS "사람이 정하고 묻는다", workbench-gpui D-003).
- 결과: 1~10을 반영했다(2회차에서 9건 해소, 2번 미해소). 11은 사용자 답 "기술 이름 빼기"에 따라 루트 INTENT에서 기술 이름을 빼고 DECISIONS D-1로 옮겼다.
- 보고: 2026-11-01

### D-004 · 2026-11-01 09:31 · wt-reviewer → wt-coder

- 상황: 질문 (리뷰 지적)
- 질문: 2회차 미해소 지적 2. PLAN 완료 규칙이 "해결 뒤 다시 판정"을 고르기만 해도 Phase 완료를 허용한다.
- 구분: 대리 응답
- 답변: 채택했다. Phase 완료는 R-n이 충족되었거나, 사용자의 범위 제외·이관 결정이 PROGRESS에 기록된 경우에만 성립하게 했다.
- 근거: 사용자 결정 Q12 "미해결 실패가 있으면 멈추고 사용자에게 올림"(2026-11-01). 사용자 지시로 왕복 한도를 3회로 늘렸다(HERDR-SETUP 변경 이력).
- 결과: 3회차 리뷰에서 해소를 확인했고, 새 Major는 없었다.
- 보고: 2026-11-01
