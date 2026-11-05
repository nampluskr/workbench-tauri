> 버전: v0.1 · 작성일: 2026-11-05 · 상태: 확정 (2026-11-05)
>
> Phase 순서와 Phase마다 무엇이 되면 끝인지를 담는다. 요구와 판정 방법은 `SPEC.md`에, 설계 결정은 `DECISIONS.md`에, 에이전트 배정은 `HERDR-SETUP.md`에 있다. 실제로 한 일과 검증 결과는 `PROGRESS.md`에 기록한다.

# PLAN — workbench-tauri v0.1

## 읽는 법과 이 순서에 걸린 규칙

**번호 표기**
- `R-n`은 v0.1 `SPEC.md`의 요구 번호이고, `D-n`은 v0.1 `DECISIONS.md`의 결정 번호다.
- `03-tauri R-nn`은 `docs/refs/03-tauri/README.md` 5절의 조사 항목이다.

**역할**
- 이 문서에는 역할 이름만 적는다: `leader`, `writer`, `check`, 구현 담당. 모델과 effort 배정은 `HERDR-SETUP.md`가 정한다.
- 구현 담당과 V3 측정 담당의 이름은 `HERDR-SETUP.md`에서 정한다(사용자 결정 2026-11-05). 이 문서에서는 미정으로 둔다.

**Phase 순서의 이유**
- Phase 0(뼈대)을 따로 둔다.
  - 모든 PoC는 빌드되는 Tauri 2 + Solid + Vite 프로젝트 위에서 한다.
  - CSP는 첫 빌드부터 켜야 한다(D-14).
  - Phase 0은 03-tauri 7절에 없는 단계다.
- Phase 1(프레임워크·편집기)을 7절 1단계보다 앞에 둔다. R-1이 실패하면 D-2가 React로 바뀌고, 그 위에 만든 UI를 다시 써야 하기 때문이다(03-tauri 5.1). 이전 PLAN의 순서와 같다(사용자 결정 2026-11-01).
- Phase 2·3은 03-tauri 7절 PoC 1·2단계를 그 순서대로 따른다.
- Phase는 이 넷뿐이다. 측정 전용 코드나 "나중을 위한" 뼈대를 만드는 단계는 두지 않는다(D-16, 루트 `AGENTS.md` 4.2).

**Phase 안의 작업**
- `leader`가 작업 카드를 herdr 프롬프트로 주고, 카드마다 검증 수준을 지정한다(AGENTS 3A).
- 카드 단위에서는 V0~V2만 한다.
- V3 실측은 Phase 끝에 한 번으로 묶는다(AGENTS 3A.3). 대상은 그 Phase의 SPEC에서 V3로 지정된 항목과, 완료 보고에 쌓인 "실측 필요" 항목이다.

**모든 Phase는 끝날 때 아래 순서를 밟는다.**
1. V3 실측을 하고, 결과를 `specs/v0.1/verify/`에 남긴다(AGENTS 3A.4).
2. `check`가 그 Phase의 diff를 검토하고 전체 테스트를 1회 실행한다(AGENTS 3A.5). Solid 반응성 함정(props 구조 분해 등)을 검토 항목에 넣는다(D-2).
3. `writer`가 `PROGRESS.md`에 무엇을·결과·검증을 기록한다.
4. `leader`가 Phase 끝에 한 번 커밋한다(D-19, 사용자 결정 2026-11-05). push는 사용자 승인 뒤에 한다.

**Phase를 마치는 조건**
- 대응 R-n마다 다음 둘 중 하나여야 한다.
  - SPEC의 판정 방법대로 충족이다.
  - 사용자가 그 R-n을 범위에서 빼거나 다음 버전으로 넘기기로 정했고, 그 결정이 PROGRESS에 있다.
- 검토나 검증에서 해결하지 못한 실패가 남으면 다음 Phase를 시작하지 않고 사용자에게 올린다(이전 PLAN의 규칙을 잇는다, 사용자 결정 2026-11-05).
- 03-tauri 조사 항목의 결과 "안 됨"·"판정 불가"는 SPEC이 충족 조건으로 정한 기록이 있으면 실패가 아니다.
- "대기"는 미해결 실패가 아니다.

**작업을 끝낼 때마다 `PROGRESS.md`에 기록한다(루트 `AGENTS.md`).** 계획 밖 작업은 사용자 요청 작업으로 적는다.

---

## Phase 0 — 프로젝트 뼈대

**목적** — Tauri 2 + Solid + Vite + npm 프로젝트를 만들고, CSP를 켠 채로 빌드되는 빈 창을 띄운다.

**대응** — 직접 대응하는 요구는 없다. `D-2` · `D-3` · `D-14`를 실행할 준비다. 관련: 03-tauri R-30 · 03-tauri R-31

**완료 조건**
- 레포 루트에 `package.json`·`package-lock.json`이 있고, `src-tauri/`에 `Cargo.toml`·`Cargo.lock`이 있다(D-3).
- 의존성은 `solid-js`, Vite, `tauri`, `@tauri-apps/api`다. `tauri`와 `@tauri-apps/api`의 마이너 버전이 같다. 의존성은 03-tauri 3.1·3.2 목록 안에서만 고르고, 추가는 사용자 승인을 받는다(AGENTS 5·9장).
- 프런트엔드 테스트 npm 스크립트가 `node --test`를 부르고, 그 이름이 루트 `AGENTS.md` 2장에 적혀 있다(SPEC 공통 판정 방식).
- Tauri 설정에 CSP가 켜져 있다(D-14). 이 단계의 CSP에는 D-14의 세 항목을 아직 더하지 않는다. 세 항목은 Phase 3에서 더한다(사용자 결정 2026-11-05).
- 빌드 준비물(Node, WebView2 런타임, MSVC, Rust)의 버전이 PROGRESS에 있다(03-tauri R-30).
- `npx tsc --noEmit`와 `cargo check`가 경고 없이 통과하고, `npm run tauri build -- --debug --no-bundle`이 성공한다.
- 위의 Phase 끝 순서를 마쳤다. 이 Phase에는 V3 대상이 없다.

---

## Phase 1 — 프레임워크·편집기 기반 PoC

**목적** — 03-tauri 5.1의 P0 가운데 R-01·R-02를 푼다. Solid에서 CM6 `EditorView`가 Pane 이동 뒤에도 살아남는지 확인하고, CM6로 Zed 편집기 규격을 맞출 수 있는지 측정한다.

**대응** — `R-1` · `R-2` · `D-1` · `D-2`

**완료 조건**
- 앱을 띄우면 HTML 예제 파일이 편집기에 열린다. 이것은 SPEC 공통 판정 방식이 요구하는 시작 상태의 일부이며, 강조와 SVG는 Phase 3에서 채운다.
- R-1, R-2가 SPEC의 판정 방법대로 판정되어 있고, 위 "Phase를 마치는 조건"을 만족한다.
- R-1이 "안 됨"이면 React 19 비교 결과가 있고, 사용자가 D-2를 다시 정했다면 그 결정이 PROGRESS에 있다.
- `specs/v0.1/verify/`에 Phase 1의 PoC 결과표와 V3 측정표가 있다.
- 위의 Phase 끝 순서를 마쳤다.

---

## Phase 2 — 창·단위·테마·키맵 기반 (03-tauri 7절 PoC 1단계)

**목적** — 03-tauri 7절 PoC 1단계를 한다.
- `decorations: false` 32px 타이틀 바와 창 스냅(03-tauri R-06)
- 브라우저 단축키 차단과 키맵 엔진(03-tauri R-20)
- 테마 JSON → CSS 변수(03-tauri R-11)
- 영역 뼈대

**대응** — `R-3` · `R-4` · `R-5` · `R-6` · `R-7` · `R-8` · `D-4` · `D-5` · `D-6` · `D-7` · `D-8` · `D-9` · `D-10`

**완료 조건**
- Phase 2를 시작할 때 R-7의 대상 토큰 목록과 화면 샘플 목록이 PROGRESS에 고정되어 있다(SPEC R-7).
- R-3 ~ R-8이 SPEC의 판정 방법대로 판정되어 있고, 위 "Phase를 마치는 조건"을 만족한다.
- One Light 테마 JSON이 MIT 고지와 함께 들어와 있다(D-9).
- `specs/v0.1/verify/`에 Phase 2의 PoC 결과표, V3 측정표, 테스트 결과가 있다. 기준 화면 대조는 SPEC 공통 판정 방식의 창 크기로 했다.
- 위의 Phase 끝 순서를 마쳤다.

---

## Phase 3 — 문법 WASM 로드 PoC와 P0 정리 (03-tauri 7절 PoC 2단계)

**목적** — 03-tauri 7절 PoC 2단계를 한다.
- `web-tree-sitter`로 설치된 Zed 확장의 문법 WASM과 `.scm`을 로드한다.
- CSP에 D-14의 세 항목을 더하고, `zlext` 스킴으로 자산을 불러온다.
- CM6와 증분 연동을 만든다.

그 뒤 P0 여덟 항목의 결과를 정리하고, 버전 끝 줄 수 비교를 한다.

이 Phase를 시작하기 전에 사용자가 Zed 앱에서 Markdown·JSON 확장을 설치한다(D-13, 사용자 결정 2026-11-05). 설치되지 않았으면 R-9의 그 항목은 "대기"로 적는다.

**대응** — `R-9` · `R-10` · `R-11` · `R-12` · `D-11` · `D-12` · `D-13` · `D-14` · `D-18`

**완료 조건**
- Phase 3를 시작할 때 R-9의 술어 목록이 PROGRESS에 고정되어 있다(SPEC R-9).
- 앱을 띄우면 SPEC 공통 판정 방식의 시작 상태가 모두 갖춰진다. HTML 예제가 열리고, 강조가 입혀지고, 확장 SVG가 보인다.
- R-9 ~ R-12가 SPEC의 판정 방법대로 판정되어 있고, 위 "Phase를 마치는 조건"을 만족한다.
- R-9에서 로드가 실패한 문법이 있으면 코어 대안 비교 결과가 있다(D-11).
- R-12의 구조 판단에 "다시 정함"이 있으면 그 결정이 사용자에게 올라가 있다.
- 줄 수 비교 결과가 PROGRESS에 있다(D-18).
  - 비교 대상은 태그 `legacy-v0.1-poc`다.
  - 앱 코드(`src/`, `src-tauri/src/`), 테스트, `tools/`를 따로 센다.
  - 문서는 세지 않는다.
  - 센 명령도 함께 적는다.
- 위의 Phase 끝 순서를 마쳤다.

---

## 진행 현황

| Phase | 대응 R | 상태 | 커밋 | 비고 |
| --- | --- | --- | --- | --- |
| Phase 0 — 프로젝트 뼈대 | 없음 | 시작 전 | 없음 | 없음 |
| Phase 1 — 프레임워크·편집기 | R-1 · R-2 | 시작 전 | 없음 | 없음 |
| Phase 2 — 창·단위·테마·키맵 | R-3 ~ R-8 | 시작 전 | 없음 | 없음 |
| Phase 3 — 문법 WASM·P0 정리 | R-9 ~ R-12 | 시작 전 | 없음 | 시작 전 Markdown·JSON 확장 설치(사용자) |
