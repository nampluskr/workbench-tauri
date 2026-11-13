> 버전: v0.8.1 · 작성일: 2026-11-13 · 상태: 초안
>
> workbench-tauri v0.8.1의 herdr 에이전트 구성, 레이아웃, 파일 소유권, 작업 프로토콜이다. 구성은 사용자가 2026-11-13에 정했고 leader-core가 띄웠다(core `specs/v0.8.1/orders/ORDER-01.md` 3.1). 화면 차례·보고·커밋과 push는 core v0.8.1 `orders/COMMON.md` 4·5·6절을 따른다. 공통 규칙은 루트 `AGENTS.md`에, Phase 순서는 `PLAN.md`에 있다. 지난 구성은 `specs/v0.8/HERDR-SETUP.md`에 있다(읽기만 한다).

# HERDR-SETUP — workbench-tauri v0.8.1

## 0. 근거

- 구성은 사용자가 정했다(사용자 2026-11-13, core ORDER-01 3.1, core `specs/v0.8.1/PLAN.md` 운영). v0.8과 다른 점은 coder 모델(→ Opus 5.5 medium)이다. checker 모델은 처음에 agy의 `claude-sonnet-5-5-high`로 띄웠다가 2026-11-13 사용자 요청으로 agy `/model`에서 `gemini-3.8-flash-high`로 바꿨다(다시 띄우지 않음, `--settings` 그대로, core ORDER-08 3.3). v0.8과 같은 모델이다. v0.8 구성은 `specs/v0.8/HERDR-SETUP.md` 1장에 있다.
- 대상은 tauri 하나다. gpui는 동결이라 gpui와 화면 차례를 나누지 않는다.
- core 리더 이름은 `leader-core`이고 패널은 `wT:p1`이다. 아래 프로토콜의 받는 이는 모두 `leader-core`다.
- 한도가 바뀌어 구성을 바꾸면 사용자 승인을 받는다(루트 `AGENTS.md` 레포 규칙).

---

## 1. 에이전트 구성

| 이름 | 패널 | 하는 일 | 도구 | 모델 | effort | 실행 명령 | 띄우는 때 |
|---|---|---|---|---|---|---|---|
| `tauri-leader` | w0:p1 | 카드 지시, 판정, 커밋, leader-core와 화면 차례 조율. 코드·문서는 쓰지 않는다 | Claude Code | Opus 5.5 | medium | `claude --model claude-opus-5-5 --effort medium` | 상시 |
| `tauri-writer` | w0:p2 | v0.8.1 문서(PLAN·HERDR-SETUP)와 PROGRESS, 루트 `AGENTS.md` | Claude Code | Opus 5.5 | medium | `claude --model claude-opus-5-5 --effort medium` | 문서 단계와 Phase 끝 |
| `tauri-coder` | w0:p3 | 구현 전부 | Claude Code | Opus 5.5 | medium | `claude --model claude-opus-5-5 --effort medium` | 구현 Phase 동안 |
| `tauri-checker` | w0:p4 | 카드 리뷰(정확성, 카드 검증 수준만큼 빌드·테스트), 화면 검증(V2·V3)과 측정. `src/`는 고치지 않는다 | agy | `gemini-3.8-flash-high` | - | `agy --model gemini-3.8-flash-high --settings D:\projects\workbench-tauri\.agents\checker-settings.json` | 리뷰·검증 카드가 있을 때 |

- 넷 모두 leader-core가 2026-11-13에 띄웠다. checker는 `claude-sonnet-5-5-high`로 띄운 뒤 같은 날 agy `/model`로 Gemini 3.8 Flash (High)로 바꿨다(사용자 2026-11-13, core ORDER-08 3.3). 표의 checker 실행 명령은 다시 띄울 때 쓴다.
- worktree는 두지 않는다.
- 리뷰 독립성: writer·coder(Claude Code Opus 5.5)의 산출물은 다른 모델(Gemini 3.8 Flash)·다른 도구(agy)의 checker가 검토한다.
- 측정자는 직접 고치지 않는다. checker는 불일치 목록을 leader에게 보고한다(루트 `AGENTS.md` 3A.4의 7).
- 지금은 Codex를 쓰지 않는다.
- Phase가 바뀔 때 서브 에이전트의 컨텍스트를 비운다(core COMMON 1절).
- 검증 수준(V0~V4)과 앱 실행 제한은 루트 `AGENTS.md` 3A를 그대로 쓴다.

---

## 2. herdr 레이아웃

탭 이름은 에이전트 이름과 같다(사용자 2026-11-13, core ORDER-01 3.1).

```text
herdr session
└── workspace: w0  workbench-tauri  (D:\projects\workbench-tauri, 브랜치 master, worktree 없음)
    ├── tab: tauri-leader   w0:t1  pane w0:p1  (Claude Code Opus 5.5 medium)
    ├── tab: tauri-writer   w0:t2  pane w0:p2  (Claude Code Opus 5.5 medium)
    ├── tab: tauri-coder    w0:t3  pane w0:p3  (Claude Code Opus 5.5 medium)
    └── tab: tauri-checker  w0:t4  pane w0:p4  (agy gemini-3.8-flash-high)
```

- worktree: 없음.
- 탭·pane은 leader-core가 2026-11-13에 띄웠다. tauri는 새로 띄우지 않는다.
- 같은 세션에 core 워크스페이스(`leader-core`, `wT:p1`)가 함께 떠 있다. 이 레포의 에이전트는 그 워크스페이스에 입력하지 않고 파일을 쓰지 않는다.

---

## 3. 측정 조건

`specs/v0.5/HERDR-SETUP.md` 3장을 그대로 쓴다(1920x1080 100%, Zed 비교는 창 1440×852, 입력 전 전경 창 확인, 앱 데이터 폴더 백업, 자기가 띄운 프로세스만 닫기, Zed는 `zed -n` 새 창). 캡처는 `specs/v0.8.1/verify/` 아래에 둔다(core COMMON 4절).

---

## 4. 파일 소유권

| 경로 | 쓰는 쪽 |
|---|---|
| `specs/v0.8.1/*.md`(PLAN·PROGRESS·HERDR-SETUP), 루트 `AGENTS.md` | `tauri-writer`(카드 지시 뒤) |
| `specs/v0.8.1/reports/<카드 ID>.md` | `tauri-leader` |
| `src/`, `index.html`, `vite.config.ts`, `tsconfig.json`, `src-tauri/`, `docs/BUILD.md`, `README.md`, `package.json`·`package-lock.json`·`Cargo.toml`·`Cargo.lock` | `tauri-coder`. 의존성 변경은 사용자 승인(카드가 미리 허락한 것만 예외, core COMMON 3절), 보안 설정(CSP·asset protocol·capability·sandbox) 변경은 Phase 7 카드가 허락한 것만(루트 `AGENTS.md` 9장, core COMMON 3절) |
| `tools/`, `specs/v0.8.1/verify/` | `tauri-checker` |
| 커밋 | `tauri-leader`만. push는 leader-core의 `[PUSH]` 뒤에 한다(core COMMON 6절) |
| 서브 에이전트 카드·보고 | 5.2의 `%TEMP%` 파일 |
| `spec/`, `docs/refs/`, 지난 버전 폴더(v0.1~v0.8) | 아무도 고치지 않는다 |
| workbench-core, workbench-gpui, workbench-kit | 읽기만 한다 |

- `docs/BUILD.md`는 `tauri-coder`가 쓰고 `tauri-checker`가 검토한다. 빌드를 돌려 값을 아는 쪽이 coder다(v0.8 HERDR-SETUP 4장과 같음).
- 작업 폴더의 커밋되지 않은 `README.md` 수정은 Phase 7(ORDER-07)까지 건드리지 않고 다른 커밋에 넣지 않는다(core ORDER-01 2절).
- 소유자가 아니면 그 파일을 고치지 않는다. 고쳐야 하면 `tauri-leader`에게 요청한다.

---

## 5. 작업 프로토콜

### 5.1 core와 tauri-leader

- leader-core가 `D:\projects\workbench-core\specs\v0.8.1\orders\ORDER-<nn>.md` 경로를 herdr 프롬프트로 보낸다. 카드 번호는 core Phase 번호와 같고 두 자리다. 같은 Phase 안에서 다시 지시하면 `-R<n>`을 붙인다. 카드는 core `orders/COMMON.md`와 함께 읽는다.
- `tauri-leader`가 결과를 이 레포 `specs/v0.8.1/reports/<카드 ID>.md`에 core COMMON 5절 형식으로 쓰고 `herdr agent prompt leader-core "<보고 파일 절대 경로>"`로 경로만 보낸다.
- 보고를 보낸 뒤에는 다음 카드를 기다린다. 다음 Phase를 스스로 시작하지 않는다(core COMMON 6절).
- 전제와 다르면 혼자 맞추지 않고 `herdr agent prompt leader-core "[BLOCKED] <카드 ID> <한 줄 이유>"`로 알린다. 막히지 않은 부분은 계속한다(core COMMON 1절).

### 5.2 tauri-leader와 서브 에이전트

- 카드: `tauri-leader`가 `%TEMP%\v081-<카드ID>-card.md` 파일로 쓰고, 그 경로를 herdr 프롬프트로 보낸다. 카드 하나만 읽고 일할 수 있게 쓴다.
- 보고: 서브 에이전트가 `%TEMP%\v081-<카드ID>-report.md`에 쓰고(루트 `AGENTS.md` 8장 형식), 답으로는 그 경로만 보낸다.
- 카드 ID: writer `W-nn`, coder `K-nn`, checker `C-nn`. 재지시는 `-R<n>`을 붙인다.
- 카드에는 카드 ID, 할 일, 관련 core I-n·ORDER 번호, 검증 수준, 보고 파일 경로가 들어간다.
- checker 검토에서 REWORK이면 원래 카드에 `-R<n>`을 붙여 다시 보낸다.
- 진행 상태는 `PROGRESS.md`에 두고 세션 기억에 기대지 않는다.

### 5.3 화면 차례 (core COMMON 4절)

1. checker가 화면 검증(V2·V3, 배율 변경 포함)이 필요하면 `tauri-leader`에게 알린다.
2. `tauri-leader`가 `herdr agent prompt leader-core "[SCREEN-REQ] tauri <카드 ID>"`를 보낸다.
3. `[SCREEN-OK] <카드 ID>`를 받은 뒤에만 화면을 쓴다. 최대 30분 기다리고, 오지 않으면 `[BLOCKED]`로 보고한다. 그동안 화면이 필요 없는 작업은 계속한다.
4. 끝나면 `herdr agent prompt leader-core "[SCREEN-DONE] tauri <카드 ID>"`를 보낸다.

- 사용자가 앱을 직접 확인하는 동안에는 `[SCREEN-OK]`가 오지 않는다.
- 마우스·키 입력이 필요한 확인은 v0.5처럼 `tauri-leader`가 화면 차례 안에서 `tools/win-input.ps1`을 실행해 출력·캡처 파일을 남기고, checker가 그 파일로 판정한다(`specs/v0.5/HERDR-SETUP.md` 5.3).

### 5.4 기타

- Git Bash에서 `/`로 시작하는 문자열을 herdr로 보낼 때는 `MSYS_NO_PATHCONV=1`을 붙인다.
- 문서 상태 줄은 "초안"이다. 확정은 leader-core가 판정한 뒤 사용자가 정하고, 그때 `tauri-writer`가 상태 줄만 바꾸고 `tauri-leader`가 커밋한다.

### 5.5 승인 처리

`specs/v0.5/HERDR-SETUP.md` 5.5를 그대로 쓴다. 바뀐 것만 적는다.

- 서브 에이전트의 승인 요청은 `tauri-leader`가 대신 응답한다. 의존성 변경, HERDR 구성 변경, push는 사용자에게 묻는다(v0.5 5.5의 위임, 사용자 2026-11-06). tauri는 사용자에게 묻는 선택 창을 띄우지 않고, 막히면 leader-core에게 `[BLOCKED]`를 보낸다(core COMMON 1절). auto mode가 막는 일은 우회하지 않고 보고의 "미정"에 남긴다.
- checker 설정은 레포 `.agents/checker-settings.json`(allow 목록만, 명령 전체 일치)이고 `agy --settings`로 checker에만 적용한다. 목록에 없는 명령은 `tauri-coder` 또는 `tauri-leader`가 실행하고 출력을 `%TEMP%\v081-<카드ID>-*.txt`로 남기며, checker는 그 파일만 읽어 판정한다.
- checker 보고 파일 쓰기는 카드가 정한 `%TEMP%\v081-*-report.md`만 한다.

---

## 6. 최초 지시 프롬프트

```text
너는 workbench-tauri v0.8.1의 <이름>이다. 루트 AGENTS.md와 specs/v0.8.1/HERDR-SETUP.md(1장 역할, 4장 소유권, 5장 프로토콜)를 읽어라.
읽은 뒤 자기 역할을 한 줄로 확인하고 tauri-leader의 카드를 기다려라. 카드 전에는 파일을 고치거나 앱을 실행하지 않는다.
```

- 다시 띄울 때는 1장의 실행 명령으로 띄우고 `herdr agent rename`으로 1장의 이름을 붙인 뒤 이 프롬프트를 보낸다. 탭 이름도 같은 이름으로 한다(2장).

---

## 7. 정리 방법

- Phase가 바뀔 때 서브 에이전트의 컨텍스트를 비운다.
- 할 일이 없는 서브 에이전트는 닫아도 된다. 다시 띄울 때는 1장 실행 명령, `herdr agent rename`, 6장 프롬프트 순서로 한다.
- 이 구성에 없는 pane은 닫는다.
- `tauri-leader` 탭은 사용자가 닫으라고 할 때까지 유지한다.
- 버전이 끝나면 다음 버전의 `specs/{새 버전}/HERDR-SETUP.md`를 새로 쓴다. 이 문서는 고치지 않는다.
