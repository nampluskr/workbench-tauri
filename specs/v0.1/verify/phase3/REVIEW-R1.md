# Phase 3 리뷰 1회차 지적 (wt-reviewer, 2026-11-01)

- 리뷰어: wt-reviewer (codex gpt-6.1-sol · medium), 대상: Phase 3 `git diff`(db5e9de 이후 미커밋 변경)
- leader 처리: 10건 모두 채택(HERDR-DECISIONS D-008). 조정 2건은 #5, #10이다.
- 반영 상태: 반영하던 중에 사용자 지시로 중지했다(2026-11-01 13:50쯤). 재개할 때 `git diff`로 지적마다 확인한다.

| # | 등급 | 위치 | 지적 | 권고 | leader 조정 | 반영 상태 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Major | tools/make-ext-fixture.ps1:27 | 문자열 접두사 검사여서 TEMP 자체나 이름이 비슷한 형제 경로까지 재귀 삭제를 허용한다 | 전용 하위 폴더와 경로 경계를 검증하고, TEMP 자체는 거부한다 | 최우선이다. 지금까지 실제로 지운 경로도 확인한다 | 반영된 것으로 보임: 경로 구성 요소 일치 비교, 표시 파일, 링크 거부. 리뷰로 확인하지 않았다. **확인 전 실행 금지** |
| 2 | Major | src-tauri/src/ext_protocol.rs:211 | 경로를 검증한 뒤 다시 연다. 그 사이 정션이 바뀌면 루트 밖 파일을 읽는 경쟁 조건이 있다 | 파일 핸들을 먼저 열고, 그 핸들의 최종 경로를 검증한 뒤 같은 핸들로 읽는다 | — | 미확인 |
| 3 | Major | src/syntax/grammar.ts:57 | dylink 길이와 LEB 경계를 검사하지 않는다. 손상된 WASM이면 검사기가 오래 붙잡힌다(200ms 제한 반례가 재현됨) | 버퍼 경계, 정수 범위, 반복 횟수를 제한한다 | — | 미확인 |
| 4 | Major | src/syntax/grammar.ts:97 | NEEDED가 libc.so라는 이유만으로 지운다. 실제 import가 충족되는지는 보지 않는다 | 지원 심볼과 ABI를 검증하고, 검증된 문법에만 우회를 적용한다 | 우회를 수용하는 조건이다(D-008 ③) | 미확인 |
| 5 | Major | src/poc/probe3.ts:163 | 다른 문법은 설치되어 있어도 "not tested yet"만 반환하고 로드하지 않는다 | 설치된 Markdown·JSON의 원본 로드와 우회 로드, 실패를 실제로 기록한다 | 설치되지 않은 문법은 D-9대로 "대기"를 유지한다 | 미확인 |
| 6 | Minor | src/syntax/highlight.ts:153 | 문법이 로드되기 전에 destroy되면, 그 뒤에 Parser·Tree를 만들고 이미 폐기된 view에 dispatch한다 | disposed 상태를 확인하고, 만든 자원을 정리한다 | — | 미확인 |
| 7 | Major | src/syntax/highlight.ts:199 | 여러 트랜잭션을 한 로그로 합쳐 마지막 번호만 남는다. R-12의 트랜잭션별 증거가 빠진다 | 트랜잭션마다 edit 호출과 이전 트리 전달 결과를 기록한다 | — | 미확인 |
| 8 | Major | src/poc/probe3.ts:308 | 404와 500도 deny로 통과시킨다. 파일이 없거나 서버 오류인 경우를 경로 차단 성공으로 잘못 판정한다 | 사례마다 기대 상태와 거부 이유까지 검사한다 | — | 미확인 |
| 9 | Minor | src/poc/probe3.ts:154 | 캡처 덤프가 이름과 테마 키만 낸다. R-10이 요구하는 원본 캡처 범위가 빠졌다 | 캡처마다 startIndex·endIndex와 위치를 출력한다 | — | 미확인 |
| 10 | Major | specs/v0.1/verify/phase3/P0-SUMMARY.md:23 | extension.wasm 호스트를 제외한 것을 문법 WASM을 코어에서 쓰는 것까지 금지한 것으로 단정해, D-8 비교를 생략했다 | 용도별 허용 범위를 확인하고 코어 대안과 비교한다 | 코어 대안은 구현하지 않는다. tree-sitter 크레이트에 wasmtime이 필요하고 3.1 "제외"와 충돌한다는 사실을 적는다 | 미확인 |
