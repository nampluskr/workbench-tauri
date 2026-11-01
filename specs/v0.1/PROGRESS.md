> 버전: v0.1 · 작성일: 2026-11-01 · 상태: 진행 중
>
> 실제로 한 일과 검증 결과를 기록한다. 계획은 `PLAN.md`에, 요구는 `SPEC.md`에, 설계 결정은 `DECISIONS.md`에 있다.

# PROGRESS — workbench-tauri v0.1

## Phase별 진행

### Phase 0 — 프로젝트 뼈대

- **Tauri 2 + Solid + TypeScript + Vite 뼈대 생성과 빌드 확인** (2026-11-01)
  - 무엇을 했나: 대화형 생성기를 쓰지 않고 파일을 직접 썼다.
    - 프런트엔드(루트): `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/index.tsx`, `src/App.tsx`
    - 코어(`src-tauri/`): `Cargo.toml`, `build.rs`, `src/main.rs`, `src/lib.rs`, `tauri.conf.json`, `capabilities/default.json`, `icons/icon.png`·`icon.ico`
    - 앱 이름은 03-tauri 2.3의 임시 이름 `ZedLike`이고, identifier는 임시값 `dev.workbench.zedlike`다.
    - CSP를 켰다(D-10).
    - 창 설정은 기본값으로 두었다. Phase 2에서 정한다.
    - `.gitignore`에 `src-tauri/target/`를 더했다.
  - 결과:
    - 패키지는 03-tauri 3.1·3.2 후보와 지시받은 목록 안에서만 넣었다.
      - npm: `@tauri-apps/api` 2.12.4, `@tauri-apps/cli` 2.12.4, `solid-js` 1.9.18, `vite` 8.3.5, `vite-plugin-solid` 2.11.15, `typescript` 7.0.2
      - cargo: `tauri` 2.12.5, `tauri-build` 2.7.4
    - `tauri`와 `@tauri-apps/api`의 마이너 버전이 12로 같다(D-4, 03-tauri R-31).
    - `package-lock.json`과 `src-tauri/Cargo.lock`이 생겼다.
    - CSP 값:
      - `csp`: `default-src 'self' ipc: http://ipc.localhost`
      - `devCsp`: 위 값에 Vite HMR용 `connect-src 'self' ipc: http://ipc.localhost ws://localhost:1420`을 더한 것
  - 검증:
    - `npm install`은 0 vulnerabilities였다.
    - `npm run typecheck`는 오류가 없었다.
    - `npm run tauri build -- --debug --no-bundle`은 종료 코드 0, 경고 0건이었고 `src-tauri/target/debug/zedlike.exe`가 생겼다. 요약은 `specs/v0.1/verify/phase0/build.txt`에 있다.
    - 빌드 준비물(03-tauri R-30):
      - Node v24.19.0, npm 11.17.0
      - Rust 1.99.1 (`stable-x86_64-pc-windows-msvc`), cargo 1.99.1
      - MSVC: Visual Studio Build Tools 2022 17.14.37827.9 (VC.Tools.x86.x64 구성 요소 있음)
      - Windows SDK 10.0.26100.0
      - WebView2 런타임 156.0.4314.58 (HKLM EdgeUpdate 레지스트리)
  - 특이사항:
    - 03-tauri 3.1은 `tauri-build`를 2.12.5로 적었지만, crates.io에 그 버전이 없다. 2.x의 최신은 2.7.4다(`tauri-codegen`·`tauri-macros`도 2.7.4). 그래서 2.7.4를 썼다.
    - crates.io의 최신 `tauri`는 3.0.0-alpha.5다. 하지만 03-tauri의 기준 버전인 2.12.5를 썼다.
    - 아이콘은 Windows 리소스 생성에 필요해서 회색 단색 정사각형 자리 표시 아이콘을 Node 스크립트로 만들었다(Zed 아이콘 아님).
    - `npm run tauri dev`는 실행하지 않았다. 지시대로 leader가 wt-runner-app에서 실행한다.
    - 리뷰·검증·커밋 전이므로 Phase 0은 진행 중이다.

- **Phase 0 리뷰 1회차 지적 3건 반영** (2026-11-01)
  - 무엇을 했나: leader가 채택한 wt-reviewer 지적 3건을 반영했다.
    - 1/Major: `src-tauri/capabilities/default.json`에서 쓰지 않는 `core:default` 전체 권한을 뺐다. `permissions`를 빈 배열로 두었다. 프런트엔드는 아직 `@tauri-apps/api`·`invoke`를 쓰지 않는다(`src/` 검색으로 확인). 이후 Phase에서 필요한 명령만 개별로 더한다.
    - 2/Minor: `vite.config.ts`의 `envPrefix`에서 `TAURI_ENV_*`를 `TAURI_ENV_`로 고쳤다. envPrefix는 glob이 아니라 접두사다.
    - 3/Minor: `.gitignore`에 `src-tauri/gen/schemas/`를 더했다.
  - 결과: 위 세 파일이 바뀌었다.
    - devCsp(`connect-src … ws://localhost:1420`)는 Vite HMR용 개발 전용 설정이다. leader가 승인했다(2026-11-01). 배포 빌드에는 `csp`(`default-src 'self' ipc: http://ipc.localhost`)만 걸린다.
  - 검증:
    - `npm run build`(vite) 성공.
    - `npm run typecheck` 오류 없음.
    - `cargo build --manifest-path src-tauri/Cargo.toml` 성공(1m 18s, 경고 0건). 빈 권한의 capability도 tauri-build 검증을 통과했다.
    - wt-runner-app의 `npm run tauri dev`가 기본 target 폴더를 쓰고 있어서, 빌드는 scratchpad의 별도 target 폴더(`CARGO_TARGET_DIR`)로 했다.
  - 특이사항: `npm run tauri dev`는 건드리지 않았다. 다만 dev가 `src-tauri/` 변경을 감시하므로 capabilities 수정으로 다시 빌드되었을 수 있다.

- **Phase 0 리뷰·검증 결과와 완료** (2026-11-01)
  - 무엇을 했나: PLAN의 Phase 끝 순서(리뷰 → 검증 → PROGRESS → 커밋)에서 리뷰와 검증 결과를 기록했다.
  - 결과:
    - 리뷰(wt-reviewer):
      - 1회차 지적 3건(capabilities 1/Major, envPrefix 2/Minor, `.gitignore` 3/Minor)을 반영했다.
      - 2회차에서 3건 모두 해소되었고, 새 Major 지적은 없다.
    - 검증(wt-checker): `specs/v0.1/verify/phase0/REPORT.md`에 PLAN Phase 0 완료 조건의 판정표가 있다.
      - 1~6번 조건이 모두 충족이고, 불충족은 없다.
      - 7번(Phase 끝 순서)은 이 기록과 커밋으로 마무리된다.
      - 실행 증거는 `specs/v0.1/verify/phase0/window.png`다. 창 제목 `ZedLike`, 배율 200%(DPI 192), 클라이언트 영역 논리 800×600이다.
  - 검증: wt-checker 보고서의 판정표와 `window.png` 파일이 있는지 확인했다.
  - 특이사항: 커밋은 leader가 한다.
  - 상태: Phase 0 완료 (2026-11-01).

## 사용자 요청 작업

### 신규 시작과 v0.1 작성 단계 문서 초안 (2026-11-01)

- 요청: leader를 거친 사용자 지시다. WORKFLOW "1. 신규 시작"과 "2. 작성"에 따라 다음을 쓴다.
  - 루트 문서: `INTENT.md`, `AGENTS.md`, `CLAUDE.md`
  - v0.1 문서: `INTENT.md`, `DECISIONS.md`, `SPEC.md`, `PLAN.md`
- 조치: 다음 순서로 진행했다.
  1. 루트 `INTENT.md` 초안을 workbench-gpui INTENT를 바탕으로 썼다(사용자 결정 2026-11-01). 질문 Q1~Q6의 답을 반영했다.
  2. `AGENTS.md`와 `CLAUDE.md`(`@AGENTS.md` 한 줄)를 썼다.
  3. `specs/v0.1/`를 만들었다.
  4. v0.1 `INTENT.md`를 썼다. 범위는 03-tauri 7절 PoC 1~2단계와 P0의 R-01·R-02다(질문 Q10 B).
  5. `DECISIONS.md` D-1~D-12를 썼다. 질문 Q1~Q10의 답과, leader 비교 뒤 사용자가 고른 Solid를 반영했다.
  6. `SPEC.md` R-1~R-13과 `PLAN.md` Phase 0~3을 썼다.
  7. 원문으로 정할 수 없는 것은 "미정"으로 두고 질문 목록으로 올렸다(scratchpad `coder-questions3.md`).
- 결과: 위 7개 파일이 있다. 루트 세 파일은 사용자 답을 반영했고, v0.1 네 문서는 초안(사람 확인 대기)이다.
- 검증:
  - 저장한 뒤 다시 읽어 UTF-8로 깨지지 않았는지 확인했다.
  - Zed HTML 확장 경로를 읽기 전용으로 확인했다(`C:\Users\nampl\AppData\Local\Zed\extensions\installed\html\`).
- 상태: 진행 중. SPEC·PLAN의 미정 항목은 사람의 답을 기다린다.

### SPEC 질문 Q1~Q12 답 반영과 루트 INTENT의 두 갈래 지시 반영 (2026-11-01)

- 요청: 두 가지다.
  - SPEC 질문 Q1~Q12의 답을 반영해 SPEC·PLAN·DECISIONS의 "미정"을 채운다.
  - 사용자 지시 원문 "zed like editor 에 대하 gpui kit / tauri 기반의 2갈래 동일한 외형/기능/레이아웃을 가진 결과물이 나와야 합니다."를 루트 INTENT에 반영한다.
- 조치:
  - 루트 `INTENT.md`
    - "무엇을 하는가"의 문장을 "workbench-gpui(gpui-kit 기반)와 외형·기능·레이아웃이 같은 결과물을 Tauri 기반으로 만든다. 두 갈래는 같은 앱이다."로 바꿨다.
    - "변하지 않는 원칙"에 "workbench-gpui와 같아야 한다."를 더했다.
  - v0.1 `INTENT.md`: 배경에 위 지시와 "같은 Zed 명세로 대조한다"를 한 줄 더했다.
  - `DECISIONS.md`
    - D-11의 대상에 Catppuccin Latte를 더했다(Q1).
    - D-9에 HTML 확장 경로, 경로 참조(Q11), Markdown·JSON 확장 설치 전 대기(Q10)를 적었다.
    - 미결 사항은 "없음"이 되었다.
  - `SPEC.md`: 결과 값에 "대기"를 더했고, R-2·R-5·R-6·R-7·R-8·R-9·R-10·R-11·R-13의 미정 자리를 Q1~Q7·Q10·Q11의 답으로 채웠다.
  - `PLAN.md`
    - Phase 0과 Phase 순서를 사용자 선택으로 고쳤다(Q8·Q9).
    - Phase 단위 커밋과 미해결 실패 시 멈춤을 더했다(Q12).
    - "대기"는 미해결 실패가 아니라는 규칙을 더했다.
- 결과: 위 문서에서 질문 답으로 채울 "미정"이 남아 있지 않다.
- 검증: 저장한 뒤 "미정" 문자열을 검색했고, UTF-8로 깨지지 않았는지 확인했다.
- 상태: 완료. v0.1 문서는 계속 초안(사람 확인 대기)이다.

### wt-reviewer 문서 리뷰 지적 1~10 반영 (2026-11-01)

- 요청: leader가 채택한 wt-reviewer의 v0.1 문서 리뷰 지적 1~10을 반영한다(HERDR-DECISIONS 위임 범위). 지적 11(루트 INTENT의 기술 이름)은 사용자에게 올려 보류한다.
- 조치: 지적마다 근거 원문(03-tauri 5절·5.1, 01-zed 04-APP-SPEC A-30·A-31.8·A-55.2·4.11절, 01-LAYOUT L-310·L-311, 03-THEME-ICONS 1.2·1.3절·T-27.1, DOCUMENTS.md 5~7절)을 직접 확인하고 다음을 고쳤다.
  - 1 — SPEC R-13: 근거 보고서 위치, 결과별 필수 내용, 구조 판단 줄과 일관성을 판정 조건에 넣었다.
  - 2 — PLAN: "판정을 마친 것"과 "Phase를 마친 것"을 나눴다. Phase 1~3 완료 조건에 "통과, 또는 사용자가 처리를 정함"을 넣었다.
  - 3 — SPEC R-12: 트랜잭션별 `Tree.edit`·이전 트리 전달 로그와 viewport 밖 장식 부재 검사를 넣었다.
  - 4 — SPEC R-10: 술어별 입력·기대·실제 결과와 T-27.1 기대 키 대조를 넣고, 불일치는 실패로 정했다. 술어 목록은 Phase 3 시작 때 PROGRESS에 고정한다.
  - 5 — SPEC R-10: D-9의 `.scm` 여섯 개마다 컴파일 결과를 요구했다.
  - 6 — SPEC R-8: 전환 측정 구간을 03-tauri R-11 확인 방법의 전 단계로 정했다. 끝은 화면에 그려진 시점이다.
  - 7 — SPEC R-11: 허용 단위를 확장 루트로 정하고, 정상 상대·절대·`..`·외부 심볼릭 링크 사례별 허용/거부를 판정하게 했다.
  - 8 — SPEC R-8: 대상 토큰·화면 샘플 목록을 Phase 2 시작 때 1.3절(T-40)·1.2절(T-26)에서 뽑아 PROGRESS에 고정하고, 누락은 실패로 정했다. 목록 자체는 지어내지 않았다.
  - 9 — SPEC 공통 판정 방식: 기준 화면별 창 크기를 나눴다. Mocha는 1440×852(A-30.2), Latte는 1224×740(L-310, 200% 가정)이다.
  - 10 — DECISIONS에 D-13(창 모서리·테두리는 OS에 맡김)을 새로 만들고, SPEC R-5는 D-13을 인용하게 했다.
- 결과: SPEC·PLAN·DECISIONS를 고쳤다. 지적 1~10을 모두 반영했다.
- 검증: 저장한 뒤 다시 읽어 UTF-8로 깨지지 않았는지 확인했다.
- 특이 사항: 지시받은 지적 원문 파일(`review1-findings.txt`)이 비어 있었다(0바이트). 그래서 같은 폴더의 `review1.txt`(wt-reviewer 출력)에 있는 지적 1~11을 원문으로 썼다.
- 상태: 완료. 지적 11은 보류다.

### 리뷰 지적 11 반영: 루트 INTENT에서 기술 이름을 빼고 D-1로 옮김 (2026-11-01)

- 요청: 사용자 결정으로 리뷰 지적 11(루트 INTENT에 구현 기술 이름이 있다, DOCUMENTS.md 3절)을 반영한다.
- 조치:
  - 루트 `INTENT.md` "무엇을 하는가"의 줄을 "workbench-gpui와 외형·기능·레이아웃이 같은 결과물을 다른 방식으로 만든다. 두 갈래는 같은 앱이다."로 바꿨다.
  - gpui-kit 기반·Tauri 기반 두 갈래라는 기술 사실은 v0.1 `DECISIONS.md` D-1의 선택·근거로 옮겼다. 사용자 지시 원문을 인용했다.
- 결과: 루트 INTENT에 기술 이름이 없다. 두 갈래의 기술 사실은 D-1에 있다.
- 검증: 저장한 뒤 다시 읽어 UTF-8로 깨지지 않았는지 확인했다.
- 상태: 완료.

### 리뷰 2회차 미해소 지적 2 반영: Phase 완료 조건 강화 (2026-11-01)

- 요청: leader가 채택한 리뷰 2회차의 미해소 지적 2를 반영한다. 근거는 사용자 결정 Q12 A("미해결 실패가 있으면 멈추고 사용자에게 올림")다.
- 조치: `PLAN.md`를 고쳤다.
  - 공통 규칙 "판정을 마친 것과 Phase를 마친 것은 다르다": Phase 완료는 대응 R-n마다 ① 충족이거나 ② 사용자가 그 R-n을 범위에서 빼거나 다음 버전으로 넘기기로 정해 PROGRESS에 기록된 경우에만 성립한다. "해결 뒤 다시 판정"을 고른 것은 완료가 아니며, 재판정이 충족될 때까지 Phase는 진행 중이다. "대안 채택"은 완료 사유에서 뺐다.
  - Phase 1~3의 완료 조건을 같은 규칙으로 고쳤다.
  - Phase 1의 R-1 실패 조건은 React 비교 결과만 요구하게 바꿨다. D-3을 다시 정한 경우에만 그 DECISIONS 기록을 요구한다.
- 결과: Phase 1~3은 실패한 R-n을 사용자에게 올리기만 해서는 끝낼 수 없다.
- 검증: 저장한 뒤 다시 읽어 UTF-8로 깨지지 않았는지 확인했다.
- 상태: 완료.

### 문서 확정 (2026-11-01)

- 요청: 사용자가 문서를 확정했다(2026-11-01). 원문은 "문서 확정하고 첫 커밋해줘"다.
- 조치:
  - `specs/v0.1/`의 INTENT·DECISIONS·SPEC·PLAN 맨 위 인용 블록의 상태를 "확정 (2026-11-01)"로 바꿨다.
  - PROGRESS는 일을 하면서 쓰는 문서라 템플릿 기준대로 상태를 "진행 중"으로 두었다.
  - 커밋은 하지 않았다. leader가 한다.
- 결과: v0.1 작성 단계 문서 네 개가 확정되었다. 다음은 PLAN Phase 0이다.
- 검증: 다섯 문서의 첫 줄을 다시 읽어 상태를 확인했다.
- 상태: 완료(커밋은 leader 몫).

## 버전 종료

- 사용자 종료 판단: 진행 중.
- 남은 것: 진행 중.
