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
| D-007 | 2026-11-01 11:00~13:16 | wt-coder, wt-reviewer, wt-checker | Phase 2: One Light MIT 테마 가져오기 승인, 리뷰 지적 채택, R-7 I-703 을 Zed 동작으로 수정, 색 판정 기준, 입력 사고 대응, checker 를 agy Flash high 로 교체(사용자 지시), Codex 모델 전환 제안 거절 | 대리 응답 | 2026-11-01 |
| D-008 | 2026-11-01 13:20~13:50 | wt-coder, wt-reviewer | Phase 3: web-tree-sitter 0.27.1 추가·CSP 3항목 추가 수용, html.wasm libc.so 우회 조건부 수용, 리뷰 10건 채택(조정 2건), 사용자 지시로 작업 중지 | 대리 응답 | 2026-11-01 |
| D-009 | 2026-11-02 | wt-leader | 사용자 지시로 Phase 3 중지·인계: 리뷰 결과·leader 도구를 저장소로 옮기고 로컬 WIP 커밋, 패널 유지 | 사용자 지시 | 2026-11-02 |

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

### D-007 · 2026-11-01 11:00~13:16 · wt-coder, wt-reviewer, wt-checker (Phase 2)

- 상황: 질문, 검증 결과 해석, 사고
- 질문·사건:
  ① wt-coder가 "One Light(zed 저장소 assets/themes/one/one.json, MIT)를 가져올까, 뺄까"를 물었다.
  ② 리뷰 1회차 10건, 2회차 미해소 1건이 나왔다. 검증 후 수정분 리뷰에서 win-input 2건이 나왔다.
  ③ wt-checker가 R-7 I-703 불충족을 보고했다. 깊은 `null`이 얕은 바인딩을 끄지 않아 Zed와 다르다는 것이고, 해석은 사람 몫이라고 적었다.
  ④ 디스플레이 색 변환 때문에 토큰 값 직접 대비가 ±1을 넘는 샘플이 있었고, 판정 기준을 골라야 했다.
  ⑤ 검증 중 키·클릭 일부가 다른 앱(workbench-gpui 창)에 들어갔을 수 있다.
  ⑥ Codex가 한도 근접으로 gpt-6-luna 전환을 제안했다.
- 구분: 대리 응답 (2026-11-01 위임). checker 교체는 사용자 지시다.
- 답변:
  ① 가져오게 했다. 앱 코드가 아닌 MIT 데이터 파일이고, MIT 고지를 빌드 결과물에도 넣는다는 조건을 붙였다.
  ② 모두 채택했다. win-input 2건은 Codex 한도(1%) 때문에 leader가 코드를 읽어 해소를 확인했다(`Guard`가 모든 이동·버튼·키 직전에 있고, `finally`에서 `ReleaseAll`).
  ③ Zed 동작으로 고치게 했다. 재검증(agy Flash high)에서 충족이다.
  ④ 같은 CSS 기준 견본 대비 ±1을 주 기준으로 하고, 직접 대비는 참고값으로 둔다(DECISIONS에 기록).
  ⑤ win-input을 매 입력 직전 전경 확인으로 바꾸고, 눌린 입력은 반드시 해제하게 했다.
  ⑥ 거절하고 sol을 유지했다(리뷰 품질).
- 근거:
  - ① AGENTS의 복사 금지 대상은 Zed 앱 코드(GPL)다. 테마 파일은 assets/themes/LICENSES의 MIT 범위다.
  - ③ 루트 INTENT 원칙 "Zed와 같아야 한다". checker가 Zed 동작(test_disable_deeper)을 확인했다.
  - ④ 앱 밖 견본도 똑같이 변한다(REPORT 10~17행). 남는 차이는 앱이 아니라 화면 변환 때문이다.
  - ⑤ 다른 앱 입력은 사용자 작업을 해칠 수 있다.
- 결과: Phase 2 R-3~R-9 모두 충족이다(R-7은 재판정). 사용자 확인 필요 항목: E-032 손잡이 테두리 1px(원문 값 없음), ⑤ 입력 사고(workbench-gpui 창 상태).
- 보고: 2026-11-01 (최종 보고에 포함)

### D-008 · 2026-11-01 13:20~13:50 · wt-coder, wt-reviewer (Phase 3, 중지됨)

- 상황: 구현 결과 판단, 리뷰 지적
- 질문·사건:
  ① 패키지 web-tree-sitter 0.27.1(MIT, 03-tauri 3.2 목록)이 추가됐다.
  ② CSP에 `script-src 'wasm-unsafe-eval'`과 `connect-src`·`img-src`의 `http://zlext.localhost`가 더해졌다(D-16).
  ③ Zed html.wasm이 NEEDED `libc.so` 때문에 그대로는 로드되지 않아, 메모리 안에서 우회했다.
  ④ 리뷰 1회차 10건(Major 8, Minor 2). 그중 1번은 테스트 fixture 스크립트의 재귀 삭제 검사가 TEMP 자체·형제 경로까지 허용한다는 것이다.
- 구분: 대리 응답
- 답변:
  ① ② 수용했다. 목록 안 패키지이고, WASM 컴파일과 확장 자산 출처에 필요한 최소 허용이다. 빌드 앱 위반은 0건이다.
  ③ 조건부로 수용했다. 실제 import가 런타임에 모두 있는지 검증한 문법에만 적용한다(리뷰 4번). R-13 구조 판단은 "유지(우회 조건)"이고, 최종 보고에서 사용자에게 알린다.
  ④ 10건 모두 채택했다. 다음 둘은 조정했다.
     - 5번: 미설치 문법은 D-9대로 "대기"를 유지한다.
     - 10번: 코어 대안은 구현하지 않는다. R-10 실패가 아니라서 D-8 조건이 아니다. 대신 wasmtime 필요성과 3.1 "제외"와의 충돌을 사실대로 적게 했다.
- 근거:
  - HERDR-SETUP 7절 위임, D-8·D-9·D-10.
  - 1번은 사용자 파일 삭제 위험이 있어 최우선으로 처리하고, 지금까지 지운 경로를 확인하게 했다.
- 결과: 반영 작업 중에 사용자가 "현재 작업 중지"를 지시해 wt-coder를 중단했다(13:50쯤). 반영은 일부만 됐거나 안 됐을 수 있다. Phase 3 변경은 미커밋이다.
- 보고: 2026-11-01

### D-009 · 2026-11-02 · wt-leader (Phase 3 중지·인계)

- 상황: 사용자 지시 "우선 순위에서 다른 작업을 먼저 해야 함니다. 현상태로 마무리하고, 다음에 새 세션에서 작업할 수 있도록 마무리 해 주세요."
- 구분: 사용자 지시 (인계 계획은 사용자가 승인함)
- 조치:
  - 세션 전용 scratchpad에만 있던 파일을 저장소로 옮겼다.
    - 리뷰 1회차 결과 → `specs/v0.1/verify/phase3/REVIEW-R1.md`
    - leader 도구 `approve-loop.sh`, `review-generic.md` → `docs/herdr/`
  - PROGRESS Phase 3에 "중지·인계" 항목(상태, 재개 순서, 사용자 확인 항목)을 적었다.
  - 미커밋 Phase 3 변경을 로컬 WIP 커밋으로 남겼다. push는 하지 않았다.
  - 패널과 에이전트는 HERDR-SETUP 8절대로 유지했다. 모두 idle이거나 done 상태다. 앱 창과 dev 서버는 닫혀 있다.
- 다음 세션: leader는 `wC:p1`에서 시작한다. 재개 순서는 PROGRESS Phase 3 "중지·인계"에 있다. 1번은 REVIEW-R1 #1(fixture 삭제 검사)을 확인하는 것이다.
- 보고: 2026-11-02
