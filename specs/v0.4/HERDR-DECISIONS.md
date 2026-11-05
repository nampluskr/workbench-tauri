> 버전: v0.4 · 작성일: 2026-11-06 · 상태: 확정 (2026-11-06)
>
> workbench-tauri v0.4의 herdr 운영 결정과 `leader`의 대리 판단을 기록한다. 구성은 `HERDR-SETUP.md`에, 설계 결정은 `DECISIONS.md`에 있다. 기록은 지우지 않고 뒤에 더한다. v0.2의 기록은 `specs/v0.2/HERDR-DECISIONS.md`(H-1~H-10)에 있다(읽기만 한다).

# HERDR-DECISIONS — workbench-tauri v0.4

| 번호 | 날짜 | 결정 | 출처 |
|---|---|---|---|
| H-1 | 2026-11-06 | v0.2의 운영 결정을 잇는다. `leader`는 코드·문서를 쓰지 않고 카드 지시·승인 처리·커밋만 한다. 카드는 herdr 프롬프트이고 보고는 `%TEMP%` 파일(v0.4는 `v04-*` 이름)에 쓴다. 문서 확정 절차는 초안 → `check` 검토 → 확정 → `writer`가 상태 줄만 바꿈 → `leader` 커밋이다. worktree 없이 파일 소유권을 나눈다(v0.2 H-5), 리뷰는 agy `check`(v0.2 H-6), 명령 경계는 `leader`가 카드에 적는다(v0.2 H-7), Phase마다 커밋한다(v0.2 H-10). push는 H-4대로 `leader`가 한다. | v0.2 HERDR-DECISIONS H-1·H-5~H-7·H-10 |
| H-2 | 2026-11-06 | 구성을 v0.2와 같게 잇는다: `leader`(Claude Code Opus 5.5, `wJ:p1`), `writer`(Opus 5.5 medium, `wJ:p2`), `check`(agy gemini-3.8-flash-high, `wJ:p4`), `impl`(Claude Code Sonnet 5.5 high, 어려운 카드만 Opus 5.5 medium, `wJ:p5`), `impl-core`(Codex gpt-6.1-terra high, `wJ:p9`), `measure`(Sonnet 5.5 high, Phase 끝에만, check 탭 아래 pane). 소유권도 v0.2와 같고 경로만 `specs/v0.4/`로 바뀐다. 구성 변경이 없어 새 승인은 받지 않았다. | v0.2 H-4, leader 전달(카드 W-v04-4) |
| H-3 | 2026-11-06 | v0.4 시작 때 네 에이전트(`writer`, `check`, `impl`, `impl-core`)의 컨텍스트를 비우고 v0.4 기준으로 다시 안내했다. | 사용자 요청 |
| H-4 | 2026-11-06 | 사용자 승인 권한을 `leader`에게 위임한다. 쓰기 승인·push·카드 범위 밖 판단도 `leader`가 처리하고, 사용자에게는 의존성 추가와 HERDR 구성 변경만 묻는다. 처리한 판단의 출처는 "리더 결정(사용자 위임 2026-11-06)"이다. | 사용자 위임 |
| H-5 | 2026-11-06 | 대기는 timeout 40분 이하로 하고, 그동안 승인 도우미 루프로 에이전트 pane의 승인 요청을 처리한다. | 리더 결정(사용자 위임 2026-11-06) |
| H-6 | 2026-11-06 | v0.4 문서(INTENT·DECISIONS·SPEC)의 질문 가운데 사용자가 직접 정하지 않은 것은 `leader`가 사용자 위임으로 정했다. 사용자가 직접 정한 것은 INTENT 결정 7·8(인코딩·`encoding_rs`, `markdown-it`·`dompurify`)이다. | 사용자 위임(카드 W-v04-1-R1 ~ W-v04-3-R1에 적힌 출처) |
| H-7 | 2026-11-06 | SPEC R-13의 toml ID 추가는 `writer`가 `leader` 승인 카드로 workbench-gpui `spec/zed-metrics.toml`에 01-zed 원문 값을 더하고, 같은 파일을 이 레포 `spec/`로 복사한다(v0.2 H-9와 같은 방식). 원문 근거가 없는 값은 더하지 않는다. | 리더 결정(사용자 위임 2026-11-06), 카드 W-v04-4-R1 P-2 |
| H-8 | 2026-11-06 | v0.4 PLAN은 3 Phase(정리와 일치 → 탭 편집과 저장 → 탭 기능)다. 루트 `AGENTS.md`의 push·CSP·capability 승인 문구를 "사용자(또는 사용자에게 위임받은 leader) 승인"으로 고쳤다(H-4에 맞춤). 구독 현황은 다시 확인하지 않는다(구성 변경 없음). | 리더 결정(사용자 위임 2026-11-06), 카드 W-v04-4-R1 P-1·P-3·P-4 |
