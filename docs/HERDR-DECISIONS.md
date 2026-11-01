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
| D-005 | 2026-11-01 09:42 | wt-coder, wt-reviewer, wt-checker | Phase 0: devCsp 승인, 읽기 전용·검증 명령 승인, 리뷰 지적 3건 채택 | 대리 응답 | 2026-11-01 |
| D-006 | 2026-11-01 10:20~10:56 | wt-coder, wt-reviewer, wt-checker | Phase 1: CDP 원격 디버깅으로 dev 재시작, 검증 도구 추가, 리뷰 7건 채택, agy 한도 소진으로 checker 를 Sonnet 으로 교체, 승인 요청 처리 | 대리 응답 | 2026-11-01 |

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

### D-005 · 2026-11-01 09:42~10:00 · wt-coder, wt-reviewer, wt-checker (Phase 0)

- 상황: 질문·승인 요청
- 질문: ① wt-coder가 지시에 없던 `devCsp`(Vite HMR `ws://localhost:1420`을 `connect-src`에 허용)를 넣고 "필요 없으면 빼겠다"고 물었다. ② wt-reviewer가 읽기 전용 git status/diff 실행 승인을 요청했다. ③ wt-checker가 파일 확인·창 캡처 PowerShell 명령과 REPORT.md 쓰기 승인을 요청했다. ④ Phase 0 리뷰 지적 3건(core:default 과다 권한, envPrefix, gen/schemas ignore)
- 구분: 대리 응답
- 답변: ① 그대로 둔다. ② ③ 이번 검증 범위 안에서 한 번씩 승인했다(삭제·설치·외부 전송·git 쓰기가 들어간 명령은 승인 대상에서 뺐다). ④ 3건 모두 채택해 반영을 지시했다.
- 근거: HERDR-SETUP.md 7절 위임. ① 개발 서버에만 적용되고, 빌드 CSP(D-10)는 그대로다. ② ③ 읽기 전용이거나 checker의 쓰기 범위(`specs/<버전>/verify/`) 안이다. ④ 지적마다 파일 근거가 있다. 권한을 줄이는 방향이라 D-10·A-55의 취지에 맞는다.
- 결과: 2회차 리뷰에서 3건 모두 해소됐다. checker 보고는 불충족 없음이다.
- 보고: 2026-11-01

### D-006 · 2026-11-01 10:20~10:56 · wt-coder, wt-reviewer, wt-checker (Phase 1)

- 상황: 진행 판단, 승인 요청, 한도 소진
- 질문·사건:
  ① checker가 앱 안 `window.__poc` 덤프를 얻을 방법이 필요했다.
  ② 리뷰 1회차 지적 7건(Major 6, Minor 1)이 나왔다. CM6 동적 style이 CSP에 막히는 문제와, 판정 코드가 거짓 통과를 낼 수 있는 문제가 들어 있었다.
  ③ wt-reviewer·wt-checker가 읽기·검증 명령 승인을 요청했다.
  ④ wt-checker(agy Argon)가 "Individual quota reached … Resets in 121h"로 멈췄다.
- 구분: 대리 응답 (2026-11-01 사용자 위임: Phase 1~3 진행과 승인 결정)
- 답변:
  ① wt-runner-app의 `tauri dev`를 `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222`로 다시 띄웠다. wt-coder가 패키지 없이 `tools/cdp-eval.mjs`를 만들게 했다.
  ② 7건 모두 채택했다. CSP는 완화하지 말고 nonce로 풀라고 조건을 붙였다. 결과는 `EditorView.cspNonce`이고, 빌드 앱에서 위반 0건이었다.
  ③ 삭제·설치·외부 전송·git 쓰기가 없는 명령만 승인했다(leader 승인 루프로 화면의 위험 명령을 검사).
  ④ HERDR-SETUP 4절의 대체안대로 p5 패널의 agy를 끝내고, 같은 이름 wt-checker를 claude Sonnet 5.5 · high로 다시 띄웠다.
- 근거:
  - HERDR-SETUP 7절 위임.
  - ① CDP는 로컬 127.0.0.1에만 열리고 개발 실행에만 쓴다. 앱 설정·CSP는 바뀌지 않는다.
  - ② DOCUMENTS 6절 "판정 방법"과 D-10.
  - ④ 구성안에 적힌 대체 모델이다.
- 결과: R-1, R-2 모두 충족이다(`specs/v0.1/verify/phase1/REPORT.md`). D-3(Solid)을 유지한다. wt-scouter도 같은 agy 한도라 쓸 수 없는데, 지금까지 조사 일이 없어 대체하지 않았다.
- 보고: 2026-11-01 (최종 보고에 포함)
