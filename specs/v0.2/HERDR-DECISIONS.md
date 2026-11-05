> 버전: v0.2 · 작성일: 2026-11-05 · 상태: 확정 (2026-11-05)
>
> workbench-tauri v0.2의 herdr 운영 결정과 `leader`의 대리 판단을 기록한다. 구성은 `HERDR-SETUP.md`에, 설계 결정은 `DECISIONS.md`에 있다. 기록은 지우지 않고 뒤에 더한다. v0.1의 기록은 `specs/v0.1/HERDR-DECISIONS.md`(H-1~H-15)에 있다(읽기만 한다).

# HERDR-DECISIONS — workbench-tauri v0.2

| 번호 | 날짜 | 결정 | 출처 |
|---|---|---|---|
| H-1 | 2026-11-05 | v0.1의 운영 결정 가운데 버전과 무관한 것을 잇는다. `leader`는 코드·문서를 쓰지 않고 카드 지시·승인 처리·커밋만 한다(v0.1 H-1). 커밋은 `leader`만, push는 매번 사용자 승인 뒤다(v0.1 H-2). 카드는 herdr 프롬프트이고 보고는 `%TEMP%` 파일에 쓴다(v0.1 H-7). 승인 처리는 읽기 전용만 `leader`가 처리한다(v0.1 H-8). 문서 확정 절차는 초안 → `check` 검토 → 확정 → `writer`가 상태 줄만 바꿈 → `leader` 커밋이다(v0.1 H-10). | v0.1 HERDR-DECISIONS H-1·H-2·H-7·H-8·H-10, 루트 `AGENTS.md` |
| H-2 | 2026-11-05 | 에이전트 풀에 Codex gpt-6.1-terra high를 더한다. 풀은 Claude Code Opus 5.5 medium, Claude Code Sonnet 5.5 high, agy gemini-3.8-flash-high, Codex gpt-6.1-terra high다. 루트 `AGENTS.md` 레포 규칙의 풀 줄도 v0.2부터 이렇게 고친다. | 사용자 결정 |
| H-3 | 2026-11-05 | 구독 현황: Claude Max, Gemini Pro(agy), Codex. Codex에서 gpt-6.1-terra high를 쓸 수 있다. | 사용자 확인 |
| H-4 | 2026-11-05 | 구성: `leader`(Claude Code Opus 5.5, `wJ:p1`), `writer`(Opus 5.5 medium, `wJ:p2`), `check`(agy gemini-3.8-flash-high, `wJ:p4`), `impl`(Claude Code Sonnet 5.5 high, 어려운 카드만 Opus 5.5 medium, `wJ:p5`), `impl-core`(Codex gpt-6.1-terra high, 새 탭 impl-core, pane id는 띄운 뒤 `leader`가 알려 줌), `measure`(Sonnet 5.5 high, Phase 끝에만). 소유: `impl`은 `src/`·`index.html`·vite/tsconfig·`package.json`/`package-lock.json`, `impl-core`는 `src-tauri/`(`Cargo.toml`·`Cargo.lock`·capabilities·`tauri.conf.json` 포함), `measure`는 `tools/`·`specs/v0.2/verify/`. | 사용자 결정(구성 승인) |
| H-5 | 2026-11-05 | worktree를 쓰지 않는다. 두 구현 담당은 같은 `master` checkout에서 파일 소유권을 나눠 일한다. 두 담당의 파일이 겹치지 않기 때문이다. | 리더 결정 |
| H-6 | 2026-11-05 | 리뷰 독립성: Claude 계열과 Codex(`impl-core`)의 산출물은 agy `check`가 검토한다. | 리더 결정 |
| H-7 | 2026-11-05 | 프런트엔드와 코어 사이의 명령 경계(`invoke` 이름·인자)는 `leader`가 카드에 적는다. 경계를 바꿔야 하면 구현 담당이 `leader`에게 요청한다. | 리더 결정 |
| H-8 | 2026-11-05 | v0.2 문서(INTENT·DECISIONS·SPEC·PLAN)의 질문 가운데 사용자가 직접 정하지 않은 것은 `leader`가 사용자 위임으로 정했다. 출처는 "리더 결정(사용자 위임 2026-11-05)"으로 단다. | 사용자 위임(카드 W-v02-1-R1 ~ W-v02-4-R1에 적힌 출처) |
| H-9 | 2026-11-05 | workbench-gpui `spec/zed-metrics.toml`에 01-zed 원문 값 13줄(A-12.1, A-12.5, L-212, L-221, I-520)을 `writer`가 더하고, 같은 파일을 이 레포 `spec/`로 복사했다(W-v02-3-R1). `spec/`는 원본 gpui에서만 바꾸는 규칙대로다. L-40은 원문이 추정이라 더하지 않았다. 두 레포 모두 커밋하지 않았다. | 사용자 승인(카드 W-v02-3-R1) |
| H-10 | 2026-11-05 | Phase가 끝날 때마다 `leader`가 커밋한다. | 사용자 결정. `PLAN.md` "모든 Phase는 끝날 때" |
