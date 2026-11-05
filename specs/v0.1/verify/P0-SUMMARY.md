# P0 요약표 — workbench-tauri v0.1

> SPEC R-12 형식이다. 행은 03-tauri의 P0 여덟 항목이고, 결과는 됨·안 됨·판정 불가·대기 중 하나다. 작성은 `writer`가 했다(W-10, 리더 배정, HERDR-DECISIONS H-15). 근거는 이 폴더의 결과표와 `specs/v0.1/PROGRESS.md`다. 작성일은 2026-11-05다.

| 항목 | 결과(됨·안 됨·판정 불가·대기) | 근거 요구(R-n) | 근거 보고서 위치 | 막혔을 때 영향받는 구조 | 다음 조치 |
| --- | --- | --- | --- | --- | --- |
| 03-tauri R-01 프레임워크: Pane 사이 탭 이동 때 편집기 인스턴스 유지 | 됨 | R-1 | `verify/phase1.md`(M-1 V3: `===`, `isConnected`, 스크롤·선택·커서 같음), `verify/phase2.md` "R-1 — 새 영역 뼈대에서 탭 이동"(M-2) | 프레임워크(D-2 Solid) | 없음. D-2(Solid)를 유지한다 |
| 03-tauri R-02 CM6로 Zed 편집기 규격 | 됨 | R-2 | `verify/phase1.md`(V2 E-002~E-005·E-010·E-011·E-030, V3 E-015), `verify/phase2.md` "R-7 — 테마 V3"(E-006·E-011·E-015 색, S-17~S-23) | 편집기(CM6) | 없음. E-032 두께는 판정 제외다(D-15) |
| 03-tauri R-03 `web-tree-sitter`로 Zed 확장 문법 WASM·`.scm` 읽기 | 됨 | R-9 | PROGRESS Phase 3 "W-9"(술어 고정 표)·"P3-2"(로드, `.scm` 6개 컴파일 표, 술어 P-1~P-7, T-27.1, 범위 단위), PROGRESS "Phase 3 판정과 Phase 끝 검증"(C-12 테스트 출력) | 구문 강조(D-11 `web-tree-sitter`, D-12 dylink 우회) | 없음 |
| 03-tauri R-06 장식 없는 창의 스냅·모서리·테두리 | 됨 | R-3 | `verify/phase2.md` "R-3"과 "재측정 (M-2-R1)"(스냅 팝업, 이동, 리사이즈, 최대화 여백 0, 세 창 상태 관찰값), `verify/phase3.md` "R1-3"(숨김→표시 뒤 hit test·스냅 팝업) | 창 구조(D-6 장식 없는 창, D-7 OS가 모서리·테두리를 그림) | 없음. 스냅 팝업은 D-6 2단계(`WM_NCHITTEST`, `windows` 0.62.2)로 됐다 |
| 03-tauri R-19 Zed 문법 WASM과 `web-tree-sitter`의 호환(다른 문법 포함) | 됨(HTML·TOML 모두 로드, 실패 사례 없음) | R-9 | PROGRESS Phase 3 "P3-2"(HTML `html.wasm` 로드, D-12 우회 테스트)·"P3-5"(TOML 로드, `.scm` 8개 컴파일, 파싱 오류 없음, T-27.1 키 일치), `src/syntax/grammar.test.ts`의 TOML 테스트. 다른 문법을 TOML로 정한 것은 PROGRESS "W-11"(사용자 결정 2026-11-05) | 구문 강조(D-11, 실패하면 코어 `tree-sitter` 크레이트 비교) | 없음. 실패한 문법이 없어 D-11 코어 비교가 필요 없다 |
| 03-tauri R-20 브라우저 단축키·키맵 엔진 | 됨 | R-5, R-6 | `verify/phase2.md` "R-5 — 브라우저 단축키"(시험 키 16개, 한글 모드, 우클릭), PROGRESS Phase 2 "P2-2"(D-5 결과, R-6 단위 테스트 6개) | 프레임워크 쪽 키 처리(D-4 WebView 키맵 엔진, D-5 차단 순서) | 없음 |
| 03-tauri R-36 CSP·`zlext` 스킴·확장 경로 검사 | 대기(wasm·`.scm` 로드, 경로 검사, CSP 됨, 확장 SVG 표시 대기) | R-10 | PROGRESS Phase 3 "P3-1"(cargo test `path_checks_follow_a_55_2`, V2 CSP 위반 0건, 자산 요청 200), PROGRESS "Phase 3 판정과 Phase 끝 검증"(C-12 cargo test 출력) | 구문 강조와 확장 자산 로드(D-13 경로 참조, D-14 CSP·`zlext`) | 기다리는 준비물: 사용자가 Zed에서 아이콘 테마 확장을 설치한다. 설치 뒤 어떤 SVG를 어디에 보일지 리더가 정하고, 표시와 CSP 위반 0건을 확인한다 |
| 03-tauri R-37 CM6와 Tree-sitter 증분 연동 | 됨 | R-11 | `verify/phase3.md` "Phase 3 결과표 — R-11 증분 파싱 시간 (M-3)"(10MB 한 글자 증분 파싱 중앙값 0.618~0.657ms), PROGRESS Phase 3 "P3-3"(V1 테스트, Lezer 없음·`visibleRanges` 코드 확인) | 편집기와 구문 강조(CM6 + D-11) | 없음. 통과 기준 수치는 원문에 없어 측정값만 기록했다 |

구조 판단: 프레임워크 유지(R-01·R-20 행 됨), 편집기 유지(R-02·R-37 행 됨), 구문 강조 유지(R-03·R-19·R-37 행 됨. R-19는 HTML·TOML 모두 로드되어 D-11 코어 비교가 필요 없음).
