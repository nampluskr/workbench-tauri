# AGENTS

## 레포 규칙

- **사람이 정하고 묻는다** — 문서의 요구·결정은 사람이 정한다. 모르면 지어내지 말고 묻는다.
- **지난 버전 폴더 불변** — specs/ 아래 지난 버전 폴더는 읽기만 하고 고치지 않는다.
- **PROGRESS 기록** — 작업을 끝낼 때마다 PROGRESS에 무엇을·결과·검증을 남기고, 계획 밖 작업은 사용자 요청 작업으로 적는다.
- **Zed 코드 복사 금지** — Zed 앱 코드(GPL-3.0)는 동작 이해에만 참고하고 복사하지 않는다. (출처: `docs/refs/03-tauri/README.md` 1절)
- **HERDR 문서** — `specs/{version}/HERDR-SETUP.md`(v0.4까지는 `HERDR-DECISIONS.md`도)는 버전마다 따로 두고, 사용자 승인 뒤 `tauri-writer`가 쓴다. `tauri-leader`는 코드·문서를 쓰지 않는다.
- **HERDR 구성은 core가 정한다** — v0.5 구성은 workbench-core `specs/v0.5/DECISIONS.md` D-2다: `tauri-leader` Claude Code Opus 5.5, `tauri-writer` Claude Code Opus 5.5 medium, `tauri-coder` Codex gpt-6.1-sol medium, `tauri-checker` agy gemini-3.8-flash-high(사용자 2026-11-06). Codex는 coder에만 쓴다. 배정과 근거는 `specs/{version}/HERDR-SETUP.md`에 적고, 한도가 바뀌어 구성을 바꾸면 다시 승인받는다.
- **자기 워크스페이스만 쓴다** — 다른 워크스페이스의 파일은 읽기만 한다 (core D-7).
- **커밋은 tauri-leader만** — `tauri-leader`가 커밋만 한다(내용은 쓰지 않는다). `tauri-writer`·`tauri-coder`·`tauri-checker`는 커밋하지 않는다. push는 매번 사용자(또는 사용자에게 위임받은 tauri-leader) 승인 뒤에 한다.

---

# 에이전트 공통 지침 (v0.5)

Tauri 2 기반 Zed 재현 편집기의 에이전트 공통 지침이다. 모든 에이전트가 따른다.
`workbench-gpui`의 `AGENTS.md` 0·1·2·3·3A·4·5·8·9장을 TypeScript/Tauri에 맞게 고쳐 들여왔다.

- Claude Code: `CLAUDE.md`의 `@AGENTS.md` import로 이 문서를 읽는다. `CLAUDE.md`에는 다른 내용을 두지 않는다.
- agy: 이 `AGENTS.md`를 직접 읽는다.
- Codex: 이 `AGENTS.md`를 직접 읽는다.

## 0. 먼저 읽을 것

1. `specs/v0.5/HERDR-SETUP.md`: 에이전트 구성, 역할, 파일 소유권, 작업 프로토콜
2. `specs/v0.5/PLAN.md`: Phase별 목표, 완료 조건, 진행 현황
3. `spec/INDEX.md`: Zed 실측 문서와 스펙의 색인. 원문은 이 색인을 보고 필요한 절만 연다.

자기 역할은 `tauri-leader`의 지시나 최초 프롬프트로 정해진다. 역할이 불분명하면 작업하지 말고 질문한다.

**작업 카드**는 `tauri-leader`가 `%TEMP%\v05-<카드ID>-card.md` 파일로 쓰고 그 경로를 herdr 프롬프트로 주는 지시다. 보고는 `%TEMP%\v05-<카드ID>-report.md`에 쓰고 답으로 경로만 보낸다(`specs/v0.5/HERDR-SETUP.md` 5.2). 레포 안에 작업 보드 파일(`TASKS.md` 등)을 두지 않는다. 카드에는 카드 ID, 할 일, 관련 `R-n`·`D-n`, 검증 수준이 들어간다. PLAN·PROGRESS 같은 문서는 카드를 받은 `tauri-writer`가 쓰고, 구현은 `tauri-coder`, 리뷰·화면 검증은 `tauri-checker`가 한다.

---

## 1. 프로젝트 개요

- 목적: Zed 편집기의 레이아웃과 동작을 재현하는 편집기를 Tauri 2로 만든다. `workbench-gpui`와 같은 앱의 다른 갈래다(루트 `INTENT.md`).
- 스택: Tauri 2(Rust 코어) + Solid + TypeScript + Vite, 편집기 CodeMirror 6, 구문 강조 `web-tree-sitter`. Windows 전용.
- 현재 상태: v0.5 진행 중이다. workbench-core v0.5 ITEMS의 I-1~I-23을 반영한다(`specs/v0.5/INTENT.md`). v0.4는 종료했다(2026-11-06). v0.3 번호는 쓰지 않는다(gpui와 버전 번호를 맞춤). v0.2는 종료했다(2026-11-06). v0.1은 종료했다(2026-11-05). 이전 PoC는 태그 `legacy-v0.1-poc`(9f83f8d)로만 남아 있다.
- 핵심 원칙
  - Zed 실측값은 요구사항이다.
  - 불필요한 코드와 테스트를 만들지 않는다(ponytail).
- 참고 문서
  - Tauri 출발 문서: `docs/refs/03-tauri/README.md`
  - Zed 명세 원문: `docs/refs/01-zed/`
  - gpui 출발 문서는 이 레포에 없다. gpui 레포 경로 `D:\projects\workbench-gpui\docs\refs\02-gpui\README.md`로 참조한다(`docs/refs/README.md`의 `02-gpui/` 링크는 이 레포에서 끊겨 있다).

---

## 2. 명령

```powershell
npm install
npm run tauri dev
npm run tauri build -- --debug --no-bundle
npm run typecheck                                    # 타입 검사 (tsc --noEmit)
npm run test                                         # 프런트엔드 테스트 (node --test)
cargo check --manifest-path src-tauri/Cargo.toml     # Rust 컴파일·경고
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
```

- PowerShell에서 `npm`(`npm.ps1`)이 실행 정책에 막히면 `npm.cmd`로 부른다(예: `npm.cmd run test`).
- 개발자 도구로 WebView 값을 읽어야 할 때만 `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222`를 주고 `tauri dev`를 실행한다.
- 테스트와 타입 검사가 통과하지 않은 상태로 완료 보고를 하지 않는다. `cargo` 경고(clippy 포함)를 남긴 채 완료 보고를 하지 않는다.
- **스크립트 언어**
  - 측정·검증 스크립트는 PowerShell 7로 쓴다.
  - Python이 꼭 필요하면 WinPython 인터프리터를 전체 경로로 부른다: `C:\winpython\WPy64-31180_cpu\python-3.11.8.amd64\python.exe`. 시스템 PATH의 `python`은 WindowsApps 스텁이라 쓰지 않는다.

---

## 3. Zed 실측값 규칙

- 모든 크기·간격·색상·폰트·동작 타이밍은 `spec/zed-metrics.toml`의 항목 ID로 참조한다. 수치의 기준은 이 toml 하나다.
- `spec/`의 원본은 `workbench-gpui`다. 이 레포에서는 `spec/`를 고치지 않는다. 값을 바꿔야 하면 gpui에서 바꾼 뒤 이 레포로 다시 복사한다.
- 원문 실측 문서(`docs/refs/01-zed/`)는 `spec/INDEX.md`를 통해 필요한 절만 읽는다.
- 코드에 수치를 하드코딩하지 않는다. CSS 값도 스펙 ID 이름의 상수나 CSS 변수로 둔다.
- 스펙에 없는 값이 필요하면 추정하지 말고 `tauri-leader`에게 보고한다.
- 실측값은 단순화·반올림·통합 대상이 아니다. 비슷한 두 값이라도 스펙 ID가 다르면 별개로 유지한다.
- Zed 소스에서 값을 확인할 수는 있지만 코드는 복사하지 않는다. 값만 참고한다.

---

## 3A. 검증 정책

검증은 변경 유형에 맞는 최소 수준만 한다. 코드로 동작이 확실히 예상되는 부분은 실행해서 다시 확인하지 않는다. 실제 화면을 측정해 스펙과 대조하는 UI 실측(V3)은 정해진 시점에만 한다.

검증 수준은 `tauri-leader`가 작업 카드에 지정하며, 담당자는 그 이상을 습관적으로 더하지 않는다.

### 3A.1 검증 수준

| 수준 | 대상 | 수행 |
|---|---|---|
| V0 정적 | 이름 변경, 파일 이동, 같은 값의 상수·토큰 치환, 주석·문서 | 바뀐 쪽만: 프런트엔드는 `npx tsc --noEmit`, Rust는 `cargo check`. 주석·문서만 바뀌면 실행하지 않는다. |
| V1 단위 | 로직 변경(분기, 계산, 상태, 키 처리, 경로 검사, 파싱) | V0 + 관련 테스트만 실행 |
| V2 레이아웃 | 크기·간격·배치가 바뀔 수 있는 변경 | V1 + 카드에 적힌 스펙 ID 값을 WebView에서 덤프해 대조(3A.2 V2 예외 조건) |
| V3 UI 실측 | 3A.3의 필요 조건에 해당하는 경우 | 앱을 실행해 실제 화면을 측정하고 스펙과 대조(3A.4 절차) |
| V4 사용자 확인 | 측정으로 판단할 수 없는 시각 품질 | 버전 끝에 일괄 확인 |

### 3A.2 작업 단위 UI 실행 제한

- V2·V3로 지정되지 않은 작업에서는 앱을 띄우지 않는다. 기능을 하나씩 눌러 보지 않고, 스크린샷을 반복해서 찍어 확인하지 않는다.
- **V2 예외 조건** — V2 카드에서는 아래 조건으로만 앱을 띄운다.
  - 앱은 1회만 실행하고, 대조가 끝나면 바로 종료한다.
  - 마우스·키보드 조작을 하지 않는다. 앱을 띄운 직후의 상태에서 덤프만 읽는다.
  - 카드에 적힌 스펙 ID만 대조한다.
  - 덤프는 개발자 도구나 CDP(`WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222`)로 `getComputedStyle`·`getBoundingClientRect`를 평가해 읽는다. 측정 전용 코드를 앱에 넣지 않는다(4.2).
  - 조작이 필요한 상태(hover, 최대화, 다른 탭 등)의 값은 V2로 재지 않고 "실측 필요"에 적어 V3로 넘긴다.
- 코드상 결과가 명확한 변경은 실행 확인 없이 완료한다. 완료 보고의 확인 항목에 "코드 확인"이라고 적는다.
- 실제 화면 측정이 필요해 보이는 항목은 완료 보고의 "실측 필요" 목록에, 측정으로 판단할 수 없는 항목은 "사용자 확인 필요" 목록에 적는다.

### 3A.3 V3 필요 조건

`tauri-leader`는 아래 중 하나에 해당하면 V3 작업 카드를 지시한다. 화면 단위로 묶는다.

1. 새 화면이나 새 컴포넌트를 처음 구현했을 때
2. 테마·폰트·전역 간격·DPI 처리처럼 여러 화면에 영향을 주는 공통 값이 바뀌었을 때
3. 덤프로 확인할 수 없는 항목일 때(실제 글리프 렌더, 네이티브 창 동작, 스냅 팝업 등)
4. 사용자가 Zed와 차이를 보고했을 때
5. 각 Phase 종료 시점
6. 완료 보고의 "실측 필요" 항목이 쌓였을 때

### 3A.4 V3 수행 절차

1. 측정할 화면 상태와 스펙 ID 목록을 먼저 작성한다. 목록에 없는 항목은 측정하지 않는다.
2. 측정 조건을 고정한다. 데스크톱 주 모니터 1920x1080, 100%다(사용자 2026-11-04, `specs/v0.5/HERDR-SETUP.md` 3장). 테마와 창 크기는 측정 목록에 적는다. 스펙의 측정 조건(200% 기준)과는 논리 px로 비교한다.
3. 앱은 측정 세션당 1회만 실행하고, 목록의 상태에 도달하는 데 필요한 만큼만 조작한다.
4. 눈대중으로 판단하지 않는다. WebView 값 덤프를 먼저 쓰고, 필요할 때만 스크린샷 픽셀을 잰다.
5. 입력 도구로 키·마우스를 보낼 때는 대상 PID·HWND를 고정하고, 입력 직전마다 전경 창이 대상인지 확인한다(이전 PoC에서 다른 앱 창으로 입력이 들어간 사고가 있었다).
6. `specs/v0.5/verify/`에 스펙 ID, 기대값, 측정값, 차이, 판정을 표로 남긴다.
7. 측정자가 직접 고치지 않는다. 불일치 목록을 `tauri-leader`에게 보고한다. 다시 측정할 때는 불일치 항목만 잰다.

### 3A.5 실행 범위

- 작업 중에는 변경과 관련된 테스트만 실행한다. 전체 테스트는 커밋 직전 `tauri-checker`가 1회만 실행한다.
- 이미 통과한 검증을 같은 코드에 대해 반복하지 않는다. 변경하지 않은 영역은 다시 검증하지 않는다.

---

## 4. ponytail 규칙

모든 코드 작업에 적용한다. 강도는 full이며 ultra는 쓰지 않는다. Claude Code는 플러그인 훅으로 자동 적용되고, agy는 이 장을 그대로 따른다.

### 4.1 작성 전 확인 순서

아래 순서로 확인하고 처음으로 해결되는 단계에서 멈춘다. 수정 대상 코드와 호출 흐름을 끝까지 읽은 뒤에 적용한다.

1. 정말 필요한가. 추측성 요구라면 만들지 않고 한 줄로 알린다.
2. 이 저장소에 이미 있는가. 헬퍼, 컴포넌트, 패턴을 먼저 찾아 재사용한다.
3. 웹 플랫폼(DOM, CSS, 브라우저 API)이나 Rust 표준 라이브러리로 되는가.
4. Tauri 2, Solid, CodeMirror 6, `web-tree-sitter` 기능으로 되는가.
5. 이미 설치된 의존성으로 되는가. 몇 줄로 되는 일에 새 의존성을 추가하지 않는다.
6. 한 줄로 되는가.
7. 그 외에만 동작하는 최소 코드를 작성한다.

### 4.2 작성 규칙

- 구현이 하나뿐인 인터페이스, 하나만 만드는 factory, 바뀌지 않는 값의 설정화를 만들지 않는다.
- "나중을 위한" 스캐폴딩을 만들지 않는다.
- **측정·검증 전용 코드를 앱에 넣지 않는다.** 값 확인은 개발자 도구 덤프나 `tools/`의 스크립트로 한다.
- 추가보다 삭제를 우선한다. 파일 수와 diff를 최소화한다. 단, 잘못된 위치의 작은 수정은 두 번째 버그다.
- 버그 수정은 증상이 아닌 원인에서 한다. 수정할 함수의 모든 호출부를 확인하고 공통 지점에서 한 번 고친다.
- 의도적 단순화는 한계와 확장 조건을 `shortcut:` 주석으로 남긴다.

```ts
// shortcut: linear scan over bindings, switch to a trie if bindings exceed 1k
```

### 4.3 줄이지 않는 것

- Zed 실측값과 그에 따른 분기
- 데이터 손실을 막는 오류 처리
- 입력 검증과 보안 관련 처리(CSP, 확장 경로 검사)
- 접근성 기본 요소(키보드 탐색, 포커스)
- 사용자 또는 `tauri-leader`가 명시적으로 요청한 기능

### 4.4 테스트

- 비자명한 로직(키맵 규칙, 경로 검사, 테마 토큰 대체, 파싱)에만 실패를 잡는 최소 테스트를 하나 남긴다.
- 한 줄짜리 자명한 코드에는 테스트를 만들지 않는다.
- 화면 값(크기·간격·색)은 테스트 코드로 만들지 않고 V2 덤프 대조나 V3 실측으로 확인한다. 기대값은 스펙 ID에서 가져온다.

---

## 5. TypeScript / Tauri 코딩 규칙

- 코드 주석은 영어로 작성한다.
- CSP를 끄지 않는다. 허용 범위는 필요한 것만 더하고, 더한 값과 이유를 `specs/{version}/DECISIONS.md`(설계 결정, `HERDR-DECISIONS.md`가 아니다)에 적는다.
- 인라인 `style` 속성을 쓰지 않는다. 동적 스타일은 nonce를 단 `<style>`이나 CSS 변수로 준다.
- 색상과 테마 값은 테마 토큰의 CSS 변수로만 쓴다.
- Zed 확장 파일은 프로젝트로 복사하지 않고 커스텀 스킴으로 읽는다. 경로는 확장 루트 기준 상대 경로만 허용하고, 절대 경로·`..`·루트 밖을 가리키는 링크는 거부한다(A-55.2).
- 의존성은 `docs/refs/03-tauri/README.md` 3.1·3.2 목록 안에서만 고른다. `tauri`와 `@tauri-apps/api`의 마이너 버전을 맞춘다.
- Tauri capability는 쓰는 권한만 개별로 허용한다.
- Rust 코어에서 `unwrap()`은 테스트와 불변 조건이 명확한 경우에만 쓴다.
- 경고를 숨기지 않는다(`#[allow]`, `// @ts-ignore`). 불가피하면 사유를 주석으로 남긴다.

---

## 8. 완료 보고 형식

```text
[DONE] <task-id>
- 변경: <파일 목록>
- 재사용: <재사용한 기존 코드/컴포넌트>
- 생략: <생략한 것과 추가 조건>
- 검증 수준: V0 | V1 | V2 | V3
- 확인: <실행한 명령과 결과, 또는 "코드 확인">
- 실측 필요: <스펙 ID와 화면 상태, 없으면 "없음">
- 사용자 확인 필요: <측정으로 판단할 수 없는 항목, 없으면 "없음">
```

V3 실측 결과는 다음 형식으로 보고한다.

```text
[MEASURED] <task-id>
- 측정 조건: <모니터·창 크기, DPI 배율, 테마, 폰트>
- 결과 파일: specs/v0.5/verify/<파일>
- 통과: <개수>
- 불일치: <스펙 ID, 기대값, 측정값, 차이 목록>
- 측정 불가: <항목과 사유>
```

막혔을 때는 다음 형식으로 보고하고 작업을 멈춘다.

```text
[BLOCKED] <task-id>
- 원인: <무엇이 막혔는지>
- 필요한 것: <결정, 스펙 값, 권한 등>
```

---

## 9. 금지 사항

- 승인 없는 의존성 추가·제거·버전 변경(`package.json`, `package-lock.json`, `src-tauri/Cargo.toml`, `Cargo.lock`)
- 사용자(또는 사용자에게 위임받은 tauri-leader) 승인 없는 CSP·capability 완화
- 소유하지 않은 파일 수정, `spec/` 수정(원본은 workbench-gpui)
- `tauri-leader` 외의 커밋, 사용자(또는 사용자에게 위임받은 tauri-leader) 승인 없는 push, 강제 푸시
- 스펙에 없는 수치의 추정 입력
- 테스트를 통과시키기 위한 테스트 삭제나 기대값 변경
- 작업 범위 밖의 리팩토링
- V2·V3로 지정되지 않은 작업에서 앱을 실행하는 것, V2에서 3A.2 예외 조건을 벗어나는 것(조작, 카드 밖 스펙 ID 대조, 재실행)
- V3 실측에서 측정 목록에 없는 항목 측정, 눈대중 판정
- 작업 카드의 검증 수준을 넘는 추가 검증
- 긴 원문 문서(`docs/refs/01-zed/*.md` 등)를 `AGENTS.md`나 `CLAUDE.md`에 import하는 것
- 지난 버전 폴더에 쓰는 것
