> 버전: v0.1 · 작성일: 2026-11-05 · 상태: 진행 중
>
> 실제로 한 일과 검증 결과를 기록한다. 계획은 `PLAN.md`에, 설계 결정은 `DECISIONS.md`에 있다. 기존 기록은 지우지 않고 뒤에 더한다. 이전 PoC의 기록은 태그 `legacy-v0.1-poc`(9f83f8d)에만 있다.

# PROGRESS — workbench-tauri v0.1

## Phase별 진행

### Phase 0 — 프로젝트 뼈대

- **P0-1 Tauri 2 + Solid + Vite 뼈대** (2026-11-05)
  - 무엇을 했나: `impl`이 CSP를 켠 채 빌드되는 빈 Tauri 2 + Solid + Vite + npm 프로젝트를 만들었다.
    - 이전 PoC(`legacy-v0.1-poc`)의 `vite.config.ts`·`tsconfig.json`·`build.rs`·아이콘·`Cargo.lock`을 다시 썼다. `Cargo.lock`은 전이 의존성 버전을 고정하려고 가져왔다.
    - 데모 코드는 넣지 않았다.
  - 결과
    - 새 파일
      - 루트: `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `src/index.tsx`
      - `src-tauri/`: `Cargo.toml`, `Cargo.lock`, `build.rs`, `tauri.conf.json`, `capabilities/default.json`, `src/main.rs`, `src/lib.rs`, `icons/`
    - 의존성(정확한 버전 고정, 03-tauri 3.1·3.2 안)
      - npm dependencies: `@tauri-apps/api` 2.12.4, `solid-js` 1.9.18
      - npm devDependencies: `@tauri-apps/cli` 2.12.4, `typescript` 7.0.2, `vite` 8.3.5, `vite-plugin-solid` 2.11.15
      - Cargo: `tauri` =2.12.5, `tauri-build` =2.7.4
      - `tauri`와 `@tauri-apps/api`의 마이너(2.12)가 같다.
    - npm 스크립트: `test` → `node --test`, `typecheck` → `tsc --noEmit`, 그 밖에 `dev`·`build`·`tauri`. 루트 `AGENTS.md` 2장에 적었다.
    - CSP
      - `csp`: `default-src 'self' ipc: http://ipc.localhost`
      - `devCsp`: 같은 값에 `connect-src 'self' ipc: http://ipc.localhost ws://localhost:1420`(Vite HMR)을 더했다.
      - D-14의 세 항목은 아직 없다(PLAN Phase 0).
    - 창은 `main` 하나이고 1440x852, 기본 장식이다. 장식은 Phase 2에서 바꾼다. capability 권한은 비어 있다.
    - 이름
      - package·crate는 `workbench-tauri`, lib는 `workbench_tauri_lib`다.
      - identifier는 `dev.workbench.tauri`, productName은 `workbench-tauri`다.
      - 앱 이름은 레포 이름과 같은 `workbench-tauri`로 정했다(리더 결정, 사용자 위임 2026-11-05).
    - 빌드 준비물 버전(03-tauri R-30)
      - Node v22.22.3, npm 10.9.8
      - rustc·cargo 1.99.1(2026-10-13), toolchain `stable-x86_64-pc-windows-msvc`
      - Visual Studio 2022 Build Tools, MSVC 도구 14.44.35207(Redist 14.44.35112)
      - WebView2 런타임 156.0.4314.58
    - 첫 빌드 시간(캐시 없음): `cargo check` 1분 14초, tauri 디버그 빌드 1분 20초.
  - 검증
    - V0. `impl`의 확인 결과다.
      - `npx tsc --noEmit`: 에러 0
      - `cargo check`: 경고 0
      - `npm run tauri build -- --debug --no-bundle`: 성공. `workbench-tauri.exe` 11.6MB, 컴파일 경고 없음
      - `npm run test`: tests 0, exit 0
    - `check` C-9는 PASS다. Phase 0 완료 조건 일곱 가지를 모두 충족했다.
    - C-9가 전체 테스트를 1회 돌렸다: `npm.cmd run typecheck`, `npm.cmd run test`, `cargo check`가 모두 exit 0, 경고 0이었다.
    - 앱은 실행하지 않았다.
  - 특이사항
    - 03-tauri 표(`docs/refs/03-tauri/README.md`)에는 `tauri-build`가 2.12.5로 적혀 있지만, 실제 크레이트 버전은 2.7.x다. 그래서 이전 PoC 값 2.7.4를 썼다. `docs/refs/`는 고치지 않고 이 기록만 남긴다(리더 결정, 사용자 위임 2026-11-05).
    - C-9 지적 1·2를 루트 `AGENTS.md` 2장에 반영했다. 1은 npm 스크립트, 2는 실행 정책에 막힐 때 `npm.cmd`를 쓰는 것이다.

### Phase 1 — 프레임워크·편집기 기반 PoC

- **P1-1 두 Pane·탭 이동과 CM6 편집기** (2026-11-05)
  - 무엇을 했나: `impl`이 두 Pane과 탭이 있는 PoC 화면과 CM6 편집기를 만들었다(R-1, R-2).
    - 탭마다 `EditorView`를 하나씩 둔다. Solid 밖(`store.ts`의 Map)에서 한 번만 만들고, Pane은 `view.dom`을 다시 붙이기만 한다.
    - 탭은 "→/←" 버튼으로 옮긴다.
    - 이동할 때는 스크롤을 찍어 두었다가 되살린 뒤 포커스를 준다.
  - 결과
    - 새 파일
      - `src/`: `App.tsx`, `app.css`, `spec/metrics.ts`
      - `src/editor/`: `extensions.ts`, `sample.ts`
      - `src/workbench/`: `panes.ts`, `panes.test.ts`, `store.ts`
    - 고친 파일: `src/index.tsx`, `index.html`, `package.json`·`package-lock.json`
      - `index.html`에는 CSP nonce carrier `<style>`을 더했다.
    - 의존성 추가: `@codemirror/state` 6.7.6, `@codemirror/view` 6.43.15. 정확한 버전으로 고정했고 03-tauri 3.2 목록 안이다(리더 승인).
    - 시작 상태: Pane 0에 HTML 예제(`index.html` 탭, 스크롤이 생기는 길이)가 열리고, 커서는 1행에 있다. 구문 강조는 Phase 3에서 넣는다.
    - 수치: toml ID를 키로 한 `src/spec/metrics.ts`가 `:root` CSS 변수로 내보낸다. 인라인 style은 없다.
      - E-005 간격은 캔버스 `fontBoundingBoxDescent`로 한 번 계산한다.
      - 편집기 글꼴은 시스템 고정폭 Consolas 15px다.
    - CSP 문자열은 Phase 0 그대로다. CM6의 `<style>`은 nonce carrier와 `EditorView.cspNonce`로 허용한다.
    - 색은 CSS 변수 이름만 걸었다. 값은 아직 정의하지 않았다.
  - 검증
    - V2(`impl`)
      - `npm run typecheck`: 에러 0
      - `npm run test`: 1 pass(`panes.test.ts`)
      - `cargo check`: 경고 0
      - `npm run build` 성공
      - `tauri dev`를 1회 띄워 조작 없이 CDP로 덤프했다.
      - E-002·E-003·E-004·E-005·E-010·E-011(크기·범위)·E-030이 모두 허용 오차 안에서 통과했다.
    - V3(`measure` M-1)
      - 빌드한 exe(CSP 적용)를 1회 실행했다. 창은 논리 1440x852, 1920x1080 100%다.
      - R-1: 탭 이동 전후로 `.cm-editor`가 `===`이고 `isConnected`다. 스크롤 280/20, DOM 선택 영역, 커서 좌표가 같았다. 한 프레임 뒤와 500ms 뒤 모두 같았다. **R-1 됨**. React 19 비교는 필요 없고, D-2(Solid)를 유지한다.
      - R-2 E-015: 선택 모서리 반지름 3.6405px로 기대값과 같다. 통과다.
      - CSP 위반은 0건이다. 양성 대조로 측정 방식을 확인했다. CM6 `<style>`의 nonce도 일치했다.
      - 결과표: `specs/v0.1/verify/phase1.md`
      - 스크립트: `tools/cdp-lib.mjs`, `tools/measure-p1.mjs`
    - `check` C-10은 PASS다.
      - Phase 1 완료 조건 다섯 가지를 모두 충족했다.
      - Solid 반응성 함정이 없다.
      - 전체 테스트를 1회 돌렸다: typecheck, test 1 pass, `cargo check` 경고 0.
    - R-2의 크기 항목은 모두 통과했다. 색 판정은 Phase 2로 넘겼다(아래 특이사항).
  - 특이사항
    - E-011·E-015·E-006 색과 스크롤바 색은 테마가 들어오는 Phase 2에서 판정한다. 테마 코드는 앞당기지 않는다. 임시 CSS 변수 이름(`--editor-active-line-background`, `--players-0-selection` 등)은 Phase 2에서 T-40 토큰 이름에 맞춘다(리더 결정, 사용자 위임 2026-11-05. C-10 지적 1).
    - E-005의 descent는 Chromium이 글꼴 메트릭을 정수로 둥글려 4px다. 글꼴이나 배율 환경이 바뀌면 다시 확인한다(C-10 지적 2).
    - V2 덤프 직전에 HMR 상태를 정리하려고 페이지를 한 번 리로드했다. nonce carrier는 덤프 뒤에 더했고, 그 확인은 V3에서 했다.
    - M-1의 입력은 OS 입력이 아니라 CDP `Input.dispatchMouseEvent`였다.

### Phase 2 — 창·단위·테마·키맵 기반

없음.

### Phase 3 — 문법 WASM 로드 PoC와 P0 정리

없음.

## 사용자 요청 작업

### W-1 이전 PoC 보관과 삭제 (2026-11-04)

- 요청: v0.1을 같은 범위로 처음부터 다시 쓴다. 이전 PoC는 태그로만 남긴다.
- 조치
  - 태그 `legacy-v0.1-poc`를 9f83f8d에 달았다.
  - 이전 코드와 문서 253개 파일을 지웠다(커밋 e35eb6a).
- 결과: 남은 파일은 `.gitignore`, `AGENTS.md`, `CLAUDE.md`, `INTENT.md`, `LICENSE` 다섯 개다.
- 검증: 커밋 통계가 253 files changed, 30291 deletions다. 태그가 9f83f8d를 가리킨다(`git rev-parse`).
- 상태: 완료.

### W-2 workbench-gpui 자산 들여오기 (2026-11-04)

- 요청: workbench-gpui의 `spec/`(수치 스펙)과 `docs/refs/`(Zed 명세)를 그대로 들여온다.
- 조치: gpui 자산 12개를 복사하고 `.gitignore`를 한 줄 고쳤다(커밋 616cda5).
  - `spec/` 셋
  - `docs/refs/01-zed/` 넷
  - `docs/refs/03-tauri/README.md`
  - `docs/refs/04-COMPARISON.md`
  - `docs/refs/README.md`
  - 기준 화면 PNG 둘
- 결과
  - `spec/`의 원본은 workbench-gpui로 둔다(D-1).
  - `docs/refs/README.md`의 `02-gpui/` 링크는 이 레포에서 끊겨 있다. `AGENTS.md`는 gpui 레포 경로로 참조한다.
- 검증: 복사한 12개 파일의 해시가 gpui 원본과 일치했다.
- 상태: 완료.

### W-3 루트 AGENTS.md 다시 쓰기와 INTENT 원칙 추가 (2026-11-04)

- 요청: 루트 `AGENTS.md`를 v0.1 재작성에 맞게 다시 쓰고, 루트 `INTENT.md`에 ponytail 원칙 두 줄을 더한다.
- 조치
  - `AGENTS.md`의 레포 규칙과 "에이전트 공통 지침" 0·1·2·3·3A·4·5·8·9장을 다시 썼다.
  - V2는 사용자 결정으로 되살렸다. 예외 조건은 조작 없는 1회 덤프다.
  - `INTENT.md`의 "변하지 않는 원칙"에 두 줄을 더했다.
  - 고친 차례: W-3, W-3-R1, W-3-R2.
- 결과: 커밋 b3f6d6d.
- 검증
  - `check` C-1은 REWORK였다(지적 10건). W-3-R1·R2로 고쳤다.
  - C-2는 PASS였다(10건 모두 해소, 새 문제 없음).
- 상태: 완료.

### W-4a 버전 INTENT (2026-11-04)

- 요청: `specs/v0.1/INTENT.md`를 쓴다.
- 조치
  - 초안을 썼다.
  - W-4a-R1에서 사용자 답을 반영했다: E-032 판정 제외, Markdown·JSON 판정 포함, 제외 셋 확정, 줄 수 비교 대상.
- 결과: 확정, 커밋 5708518.
- 검증
  - C-3은 REWORK였다(지적 3건: 제외 범위의 미정 문장, E-032 위치, R-19 범위).
  - C-4는 PASS였다(3건 해소).
- 상태: 완료.

### W-4b 버전 DECISIONS (2026-11-04)

- 요청: `specs/v0.1/DECISIONS.md`를 쓴다. 이전 D-1~D-16을 골라 새 번호로 다시 쓰고, 2026-11-04 사용자 결정을 넣는다.
- 조치
  - D-1~D-19를 썼다.
  - 이전 결정은 9개를 그대로 잇고, 4개를 고쳐 잇고, 3개를 버렸다.
  - W-4b-R1에서 미결 넷을 반영했다: 확장 루트 하나, cargo 정션 테스트, E-032 관찰값 기록 안 함, 이전 D-1·D-2 버림.
  - C-5 권고대로 "이전 결정 처리 표"를 "미결 사항" 앞으로 옮겼다.
- 결과: 확정, 커밋 c9eec6f.
- 검증: C-5는 PASS였다. 권고 1건(절 순서)은 반영했다.
- 상태: 완료.

### W-4c 버전 SPEC (2026-11-05)

- 요청: `specs/v0.1/SPEC.md`를 쓴다. 수치는 toml ID로만 적고, 측정 전용 코드에 기대는 판정은 쓰지 않는다.
- 조치
  - R-1~R-12를 썼다.
  - W-4c-R1에서 사용자 답을 반영했다.
    - 판정 제외: L-84 닫기 버튼 색, 테마 전환 시간, 10MB 장식 갱신 시간
    - V2 시작 상태를 요구로 둠
    - V3 대조 창 논리 1440x852
    - V1 프런트엔드 테스트 `node --test`
- 결과: 확정, 커밋 1fb6cde.
- 검증: C-6은 PASS였다(지적 없음).
- 상태: 완료.

### W-4d 버전 PLAN (2026-11-05)

- 요청: `specs/v0.1/PLAN.md`를 쓴다. 이전 PLAN의 Phase 나눔을 참고하되 ponytail로 줄인다.
- 조치
  - Phase 0~3과 진행 현황 표를 썼다.
  - W-4d-R1에서 사용자 답을 반영했다: Markdown·JSON 설치는 Phase 3 전, 미해결 실패 규칙 유지, 담당 이름은 HERDR-SETUP에서, CSP 세 항목은 Phase 3, 커밋은 Phase 끝 1회.
- 결과: 확정, 커밋 1a15baa.
- 검증: C-7은 PASS였다(지적 없음).
- 상태: 완료.

## 버전 종료

- 사용자 종료 판단: 진행 중.
- 남은 것: 진행 중.
