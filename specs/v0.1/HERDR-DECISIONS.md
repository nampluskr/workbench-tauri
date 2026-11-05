> 버전: v0.1 · 작성일: 2026-11-05 · 상태: 확정 (2026-11-05)
>
> workbench-tauri v0.1의 herdr 운영 결정과 `leader`의 대리 판단을 기록한다. 구성은 `HERDR-SETUP.md`에, 설계 결정은 `DECISIONS.md`에 있다. 기록은 지우지 않고 뒤에 더한다.

# HERDR-DECISIONS — workbench-tauri v0.1

| 번호 | 날짜 | 결정 | 출처 |
|---|---|---|---|
| H-1 | 2026-11-04 | `leader`는 코드·문서를 쓰지 않는다. 작업 카드 지시, 승인 처리, 커밋만 한다. | 사용자 결정. 루트 `AGENTS.md` "HERDR 문서" |
| H-2 | 2026-11-04 | 커밋은 `leader`만 한다. `writer`와 구현 담당은 커밋하지 않는다. push는 매번 사용자 승인 뒤에 한다. | 사용자 결정. 루트 `AGENTS.md` "커밋은 leader만", D-19 |
| H-3 | 2026-11-04 | 에이전트 풀은 Claude Code Opus 5.5 medium, Claude Code Sonnet 5.5 high, agy gemini-3.8-flash-high이고, Codex는 쓰지 않는다. 구성은 구독·토큰 부담으로 정한다. | 사용자 결정. 루트 `AGENTS.md` "HERDR 구성" |
| H-4 | 2026-11-04 | `writer`는 Claude Code Opus 5.5 medium이다. 문서 작성만 맡는다. | 사용자 결정(사용자 지시) |
| H-5 | 2026-11-04 | `check`는 agy gemini-3.8-flash-high다. 카드 산출물을 검토하고, 커밋 직전 전체 테스트를 1회 실행한다. Claude 계열 산출물을 다른 계열이 검토하게 하려는 배치다. | 사용자 결정(사용자 지시). 루트 `AGENTS.md` 3A.5 |
| H-6 | 2026-11-04 | `ops`(Claude Code Sonnet 5.5 high)는 W-1(이전 PoC 보관·삭제)과 W-2(gpui 자산 들여오기)에만 쓰고 닫았다. | 사용자 결정(사용자가 승인한 계획) |
| H-7 | 2026-11-04 | 작업 카드는 `leader`가 herdr 프롬프트로 준다. 파일이 아니며 `TASKS.md`를 두지 않는다. 보고는 카드에 적힌 `%TEMP%` 파일에 쓰고 경로만 답한다. | 사용자 결정. 루트 `AGENTS.md` 0장, `leader` 카드 지시 |
| H-8 | 2026-11-04 | 승인 처리 방식은 둘로 나눈다. 읽기 전용 승인은 `leader`가 카드 범위 안에서 처리하고, 쓰기·push·범위 밖은 사용자에게 올린다. | 사용자 결정(사용자 답) |
| H-9 | 2026-11-04 | 탭과 pane 이름을 정했다. workspace는 `wJ`(workbench-tauri)다. 탭 control에는 `leader`(`wJ:p1`), 탭 docs에는 `writer`(`wJ:p2`), 탭 check에는 `check`(`wJ:p4`)를 둔다. | 사용자 결정(사용자 답) |
| H-10 | 2026-11-04 | 문서 확정 절차를 정했다. `writer` 초안 → `check` 검토(C-n) → REWORK면 `-R1`… → 사용자 확정 → `writer`가 상태 줄만 바꿈 → `leader` 커밋. | 운영 관행(W-3~W-4d), `leader` 카드 지시 |
| H-11 | 2026-11-05 | 구현 담당은 `impl`이다. 기본은 Claude Code Sonnet 5.5 high이고, R-9 dylink 우회와 R-11 증분 연동 카드만 Opus 5.5 medium으로 한다. 위치는 wJ의 새 탭 impl, main checkout이다. 소유는 `src/`, `src-tauri/`, 프런트엔드 설정, `package.json`·`package-lock.json`이다. | 사용자 결정(W-4e 안 승인) |
| H-12 | 2026-11-05 | V3 측정 담당은 `measure`(Claude Code Sonnet 5.5 high)다. check 탭에 pane을 더해 Phase 끝에만 띄운다. 소유는 `tools/`와 `specs/v0.1/verify/`다. | 사용자 결정(W-4e 안 승인) |
| H-13 | 2026-11-05 | 구독 현황을 확인했다. Claude Max와 Gemini Pro(agy)이고, workbench-gpui 기록과 같다. `leader`는 Claude Code Opus 5.5이며 effort는 세션 기본값으로 적는다. | 사용자 확인 |
| H-14 | 2026-11-05 | 사용자가 `leader`에게 권한을 위임했다. `leader`는 사용자 권한으로 Phase 0~3을 서브 에이전트로 진행한다. 쓰기·빌드 승인은 카드 범위 안에서 `leader`가 처리한다. git 쓰기, push, 시스템 설치, 범위 밖 삭제는 `leader`가 직접 판단한다. 위임으로 내린 판단은 출처를 "리더 결정(사용자 위임 2026-11-05)"으로 단다. | 사용자 위임("단계별로 서브 에이전트를 이용해 마지막 phase까지 진행") |
| H-15 | 2026-11-05 | P0 요약표 `specs/v0.1/verify/P0-SUMMARY.md`는 이번만 `writer`가 새로 쓴다(W-10). `verify/`의 소유자는 `measure`지만, 요약표는 측정이 아니라 문서 작업이라서다. | 리더 결정(사용자 위임 2026-11-05) |
