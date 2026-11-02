# P0 요약표 — 초안 (wt-coder, 2026-11-01)

> SPEC R-13의 요약표 **초안**이다. 판정은 wt-checker가 한다. Phase 3 행(03-tauri R-03, R-19, R-36, R-37)의 "결과"는 wt-coder가 직접 확인한 값이고, checker 판정 전이다. Phase 1·2 행은 각 Phase의 검증 보고서 판정을 옮겼다.

| 항목 | 결과 | 근거 요구(R-n) · 보고서 위치 | 막혔을 때 영향받는 구조 | 다음 조치 |
| --- | --- | --- | --- | --- |
| 03-tauri R-01 (Solid에서 Pane 이동 뒤 EditorView 유지) | 됨 | R-1 · `specs/v0.1/verify/phase1/REPORT.md` R-1 절 | 프레임워크(D-3) | 없음 |
| 03-tauri R-02 (CM6로 Zed 편집기 치수) | 됨 | R-2 · `specs/v0.1/verify/phase1/REPORT.md` R-2 절 | 편집기(CM6) | E-032 손잡이 테두리 1px은 원문 값이 없다. 최종 보고에서 사용자 확인을 받는다(PROGRESS Phase 2) |
| 03-tauri R-03 (`web-tree-sitter`로 Zed HTML 확장의 문법 WASM과 `.scm` 읽기) | 됨 (조건: 메모리 안 우회) | R-10 · `specs/v0.1/verify/phase3/`(checker 보고서 예정), 자체 확인 `csp-built-check.json` | 구문 강조(D-8) | 아래 "R-19 관찰" 참고. 우회를 받아들일지 사용자 확인 |
| 03-tauri R-06 (장식 없는 창 스냅·이동·크기) | 됨 | R-3 · `specs/v0.1/verify/phase2/REPORT.md` R-3 절 | 창 구조(D-7) | 없음. 오른쪽 아래 모서리 끌기는 작업 표시줄 때문에 시험하지 못했다(보고서 기록) |
| 03-tauri R-19 (Zed 문법 WASM ↔ `web-tree-sitter` 호환: ABI·동적 링크) | 됨 (HTML, 조건: 메모리 안 우회) / Markdown·JSON 대기 | R-10 · 위와 같음 | 구문 강조(D-8) | Markdown·JSON은 사용자가 Zed 앱에서 확장을 설치하면 판정한다(D-9). 이 PC의 Zed에는 해당 확장 폴더가 없다(`ext_check` → `unknown-extension`) |
| 03-tauri R-20 (브라우저 단축키가 키맵 엔진에 도달) | 됨 | R-6 · `specs/v0.1/verify/phase2/REPORT.md` R-6 절 | 키 처리(D-5, D-6) | 없음 |
| 03-tauri R-36 (CSP 아래 WASM·`.scm`·SVG 로드) | 됨 | R-11 · 자체 확인 `specs/v0.1/verify/phase3/csp-built-check.json` (빌드 앱, 위반 0) | 확장 자산 공급(D-10, D-16) | checker 판정 대기 |
| 03-tauri R-37 (CM6 ↔ Tree-sitter 증분 연동) | 됨 | R-12 · `__poc.syntax.bigEdit`, `__poc.syntax.decorations` 결과(HOWTO 4절) | 편집기·구문 강조 | 10MB 측정값은 기록용이다(통과 기준 수치는 원문에 없음) |

## R-19 관찰 (판단 근거)

- 이 PC의 Zed HTML 확장 `grammars/html.wasm`(21,095 B)은 동적 링크 부속 모듈이고, `dylink.0`의 NEEDED에 `libc.so`가 있다.
- 파일을 그대로 `Language.load`에 넘기면 로더가 `libc.so`를 파일로 받으려다 실패한다. 브라우저에서는 `need to see wasm magic number`, Node에서는 `ENOENT libc.so`였다.
- 문법이 가져오는 함수(`malloc`, `free`, `memcpy`, `towupper`, `iswspace`, `iswalnum`, `strlen`, `memcmp`, `strncpy`, `calloc`, `realloc`)는 `web-tree-sitter` 런타임이 이미 내보낸다. `__assert_fail`만 없는데, 이 함수는 단언이 실패할 때만 불리고 지연 바인딩이다.
- 그래서 **메모리에 올린 사본에서만** NEEDED 하위 섹션의 종류 바이트(오프셋 26)를 쓰지 않는 값(0x7f)으로 바꿨다. 디스크의 파일은 바꾸지 않는다(D-9). 로더는 이 하위 섹션을 건너뛴다.
- 그 뒤 결과: ABI 14로 로드되었다. 예제 HTML 파싱에서 오류가 없었다. `.scm` 6개가 모두 컴파일되었다. 술어 7사례가 모두 맞았다.
- 코어 대안(D-8): `tree-sitter` 크레이트(03-tauri 3.1 목록)가 `.wasm` 문법을 읽으려면 `wasmtime` 기능이 필요하다. 그런데 `wasmtime`은 03-tauri 3.1에서 "쓰지 않는다"(A-46.5, R-13)로 제외되어 있다. 그러면 코어는 같은 `html.wasm` 파일을 읽을 수 없고, C 소스로 빌드한 문법만 쓸 수 있다. 그래서 코어 대안은 "같은 파일을 읽는다"는 R-19의 목적을 채우지 못한다. 시험하지 않고 분석만 했다.

## 구조 판단 (초안)

| 구조 | 판단 | 근거 행 |
| --- | --- | --- |
| 프레임워크 (Solid, D-3) | 유지 | R-01 |
| 편집기 (CM6) | 유지 | R-02, R-37 |
| 구문 강조 (WebView `web-tree-sitter`, D-8) | 유지 — **조건: 메모리 안 dylink 우회를 받아들이는 경우** | R-03, R-19, R-36, R-37 |

- "안 됨"인 행은 없다. 다만 R-03·R-19는 Zed 문법 파일을 **그대로는** 읽지 못하고, 메모리 안 1바이트 우회가 있어야 읽는다.
- 이 우회를 받아들일지는 사용자가 정할 일이라서 "다시 정함"으로 적지 않았다. 사용자에게 올리는 항목으로 표시했다. 받아들이지 않으면 구문 강조 구조(D-8)를 다시 정해야 한다. 검토할 수 있는 대안은 다음과 같다.
  - 문법을 웹용으로 다시 빌드한다. 이 경우 같은 파일이 아니다.
  - 코어에서 네이티브 문법을 쓴다. 이 경우 확장의 WASM을 쓰지 않는다.
  - `wasmtime` 제외 결정을 다시 본다.
- 대기 행: R-19의 Markdown·JSON. 기다리는 준비물은 사용자의 확장 설치다.
