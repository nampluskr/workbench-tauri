> 버전: v0.5 · 작성일: 2026-11-06 · 상태: 초안
>
> workbench-tauri v0.5의 herdr 에이전트 구성, 레이아웃, 파일 소유권, 작업 프로토콜이다. 구성은 workbench-core `specs/v0.5/DECISIONS.md` D-2, 화면 차례는 core D-1·D-4, 카드는 core D-3을 따른다(ORDER-01 3.2·3.3). 공통 규칙은 루트 `AGENTS.md`에, Phase 순서는 `PLAN.md`에 있다. 지난 버전 구성은 `specs/v0.4/HERDR-SETUP.md`에 있다(읽기만 한다).

# HERDR-SETUP — workbench-tauri v0.5

## 0. 근거

- 구성은 core가 정한다(core D-2, 사용자 2026-11-06). leader 하나와 서브 에이전트 셋(writer·coder·checker)이다.
- 구독 현황(사용자 2026-11-06, core D-2 근거): Claude 여유(Opus 5.5 medium), Codex 여유(gpt-6.1-sol medium, 초기화 쿠폰 있음), agy 여유(gemini-3.8-flash-high, Argon 쓸 수 없음).
- v0.4 구성(`leader`, `writer`, `check`, `impl`, `impl-core`, `measure`)은 쓰지 않는다(core D-2 배제한 대안).
- 한도가 바뀌어 구성을 바꾸면 사용자 승인을 받는다(루트 `AGENTS.md` 레포 규칙).

---

## 1. 에이전트 구성

| 이름 | 하는 일 | 도구 | 모델 | effort | 실행 명령 | 띄우는 때 |
|---|---|---|---|---|---|---|
| `tauri-leader` | 카드 지시, 판정, 커밋, core-leader와 화면 차례 조율(core D-4). 코드·문서는 쓰지 않는다 | Claude Code | Opus 5.5 | 세션 기본값 | 기존 세션 | 상시 |
| `tauri-writer` | v0.5 문서(INTENT·DECISIONS·SPEC·PLAN·HERDR-SETUP)와 PROGRESS, 루트 `AGENTS.md`·`INTENT.md` | Claude Code | Opus 5.5 | medium | `claude --model claude-opus-5-5 --effort medium` | 문서 단계와 Phase 끝 |
| `tauri-coder` | 구현 전부(프런트엔드·코어를 나누지 않는다) | Codex | gpt-6.1-sol | medium | `codex -m gpt-6.1-sol -c model_reasoning_effort=medium` | 구현 Phase 동안 |
| `tauri-checker` | 카드 리뷰(정확성, 카드 검증 수준만큼 빌드·테스트), 화면 검증(V2·V3)과 측정. `src/`는 고치지 않는다 | agy | gemini-3.8-flash-high | - | `agy --model gemini-3.8-flash-high` | 리뷰·검증 카드가 있을 때 |

- worktree는 두지 않는다. coder가 하나라 같은 checkout에서 겹치지 않는다(core D-2).
- 리뷰 독립성: coder(Codex)와 writer(Claude)의 산출물은 checker(agy)가 검토한다(core D-2).
- 측정자는 직접 고치지 않는다. checker는 불일치 목록을 leader에게 보고한다(루트 `AGENTS.md` 3A.4의 7).
- Codex는 coder에만 쓴다. 두 갈래 coder가 같은 Codex 구독을 나눠 쓴다. 한도가 바닥나면 쿠폰을 직접 쓰지 않고 core-leader에게 `[BLOCKED]`로 알린다(ORDER-01 3.2).
- Phase가 바뀔 때 서브 에이전트의 컨텍스트를 비운다. 할 일이 없는 서브 에이전트는 닫아도 된다(core D-2). ORDER-01 완료 시점에는 셋 모두 떠 있어야 한다.
- 검증 수준(V0~V4)과 앱 실행 제한은 루트 `AGENTS.md` 3A를 그대로 쓴다.

---

## 2. herdr 레이아웃

```text
herdr session
└── workspace: wJ  workbench-tauri  (D:\projects\workbench-tauri, 브랜치 master, worktree 없음)
    ├── tab: control  wJ:t1  pane wJ:p1  tauri-leader   (Claude Code Opus 5.5)
    ├── tab: docs     wJ:t6  pane wJ:pK  tauri-writer   (Claude Code Opus 5.5 medium)
    ├── tab: impl     wJ:t7  pane wJ:pM  tauri-coder    (Codex gpt-6.1-sol medium)
    └── tab: check    wJ:t8  pane wJ:pN  tauri-checker  (agy gemini-3.8-flash-high)
```

- worktree: 없음. `git worktree list`가 본 트리 하나만 보였다(tauri-leader 확인 2026-11-06).
- v0.4 에이전트(`check`·`impl`·`impl-core`·`measure`)의 pane은 이번 세션에 남아 있지 않았다. 닫은 것은 없다(tauri-leader 확인 2026-11-06).
- 같은 세션에 workspace `workbench-core`·`workbench-gpui`가 함께 떠 있을 수 있다. 이 레포의 에이전트는 그 워크스페이스에 입력하지 않고 파일을 쓰지 않는다(core D-7).

---

## 3. 측정 조건

- V3: 데스크톱 주 모니터 1920x1080, 100%(루트 `AGENTS.md` 3A.4). 스펙(200% 기준)과는 논리 px로 비교한다.
- Zed와 비교하는 판정: 창 1440×852, 화면 배율 100%, 같은 폴더·파일·테마(core D-11).
- 입력 도구로 키·마우스를 보낼 때는 대상 PID·HWND를 고정하고, 입력 직전마다 전경 창을 확인한다(루트 `AGENTS.md` 3A.4).
- 측정 전에 앱 데이터 폴더(`%APPDATA%\workbench-tauri`)를 백업하고 끝나면 되돌린다(v0.4와 같음).

---

## 4. 파일 소유권

| 경로 | 쓰는 쪽 |
|---|---|
| `specs/v0.5/*.md`(INTENT·DECISIONS·SPEC·PLAN·PROGRESS·HERDR-SETUP), 루트 `AGENTS.md`·`INTENT.md` | `tauri-writer`(카드 지시 뒤) |
| `specs/v0.5/reports/ORDER-<n>.md` | `tauri-leader` |
| `src/`, `index.html`, `vite.config.ts`, `tsconfig.json`, `src-tauri/`, `package.json`·`package-lock.json`·`Cargo.toml`·`Cargo.lock` | `tauri-coder`. 의존성 변경은 사용자 승인, CSP·capability 완화는 승인(루트 `AGENTS.md` 9장) |
| `tools/`, `specs/v0.5/verify/` | `tauri-checker` |
| 커밋 | `tauri-leader`만. push는 core-leader 판정 뒤 사용자가 정한다(ORDER-01 7장) |
| 서브 에이전트 카드·보고 | 5장의 `%TEMP%` 파일 |
| `spec/`, `docs/refs/`, 지난 버전 폴더(v0.1~v0.4) | 아무도 고치지 않는다. 예외는 ORDER-01 3.0의 v0.4 종료 기록 두 파일뿐이다 |
| workbench-core, workbench-gpui | 읽기만 한다(core D-7) |

- 소유자가 아니면 그 파일을 고치지 않는다. 고쳐야 하면 `tauri-leader`에게 요청한다.

---

## 5. 작업 프로토콜

### 5.1 core와 tauri-leader

- core-leader가 `D:\projects\workbench-core\specs\v0.5\orders\ORDER-<n>.md` 경로를 herdr 프롬프트로 보낸다. 번호는 core Phase 번호와 같고 두 자리다(`ORDER-01`~`ORDER-12`). 같은 Phase 안의 재지시는 `-R<n>`을 붙인다(예: `ORDER-03-R1`). 보고 파일도 카드와 같은 이름을 쓴다(core D-3).
- `tauri-leader`가 결과를 이 레포 `specs/v0.5/reports/ORDER-<n>.md`에 쓰고, `herdr agent prompt core-leader "<보고 파일 절대 경로>"`로 경로만 보낸다(core D-3, D-7).
- 공통 전제와 다르면 혼자 맞추지 않고 `[BLOCKED]`로 보고한다(core D-3).

### 5.2 tauri-leader와 서브 에이전트 (리더 결정, ORDER-01 3.3)

- 카드: `tauri-leader`가 `%TEMP%\v05-<카드ID>-card.md` 파일로 쓰고, 그 경로를 herdr 프롬프트로 보낸다. 카드 하나만 읽고 일할 수 있게 쓴다(core D-3).
- 보고: 서브 에이전트가 `%TEMP%\v05-<카드ID>-report.md`에 쓰고(루트 `AGENTS.md` 8장 형식), 답으로는 그 경로만 보낸다.
- 카드 ID: writer `W-nn`, coder `K-nn`, checker `C-nn`. 재지시는 `-R<n>`을 붙인다(예: `K-03-R1`).
- 카드에는 카드 ID, 할 일, 관련 R-n·core D-n·ORDER 번호, 검증 수준, 보고 파일 경로가 들어간다.
- checker 검토에서 REWORK이면 원래 카드에 `-R<n>`을 붙여 다시 보낸다.
- 진행 상태는 `PROGRESS.md`에 두고 세션 기억에 기대지 않는다(core D-3).

### 5.3 화면 차례 (core D-1, D-4)

1. checker가 화면 검증(V2·V3, 배율 변경 포함)이 필요하면 `tauri-leader`에게 알린다.
2. `tauri-leader`가 `herdr agent prompt core-leader "[SCREEN-REQ] tauri <카드 ID>"`를 보낸다.
3. core-leader가 `[SCREEN-OK] <카드 ID>`를 보낸 뒤에만 화면을 쓴다. 최대 30분 기다리고, 오지 않으면 `[BLOCKED]`로 core-leader에게 보고한다. 그동안 화면이 필요 없는 작업은 계속한다.
4. 끝나면 `herdr agent prompt core-leader "[SCREEN-DONE] tauri <카드 ID>"`를 보낸다.

- 화면을 다루는 확인(자동 검증 스크립트, 디스플레이 배율 변경, 앱 창 포커스·입력·캡처)은 같은 갈래 안에서도 한 번에 하나만 한다(core D-1).
- 사용자가 UI를 직접 확인하는 동안에는 core-leader가 `[SCREEN-OK]`를 보내지 않는다(core D-4).

### 5.4 기타

- Git Bash에서 `/`로 시작하는 문자열을 herdr로 보낼 때는 `MSYS_NO_PATHCONV=1`을 붙인다(ORDER-01 3.3).
- 문서가 확정되면 `tauri-writer`가 상태 줄만 바꾸고 `tauri-leader`가 커밋한다. 확정은 core-leader가 판정한 뒤 사용자가 정한다(ORDER-01 3.1).
- Phase 끝 순서는 `PLAN.md`를 따른다.

---

## 6. 최초 지시 프롬프트

```text
너는 workbench-tauri v0.5의 <이름>이다. 루트 AGENTS.md와 specs/v0.5/HERDR-SETUP.md(1장 역할, 4장 소유권, 5장 프로토콜)를 읽어라.
읽은 뒤 자기 역할을 한 줄로 확인하고 tauri-leader의 카드를 기다려라. 카드 전에는 파일을 고치거나 앱을 실행하지 않는다.
```

---

## 7. 정리 방법

- Phase가 바뀔 때 서브 에이전트의 컨텍스트를 비운다(core D-2).
- 할 일이 없는 서브 에이전트는 닫아도 된다. 다시 띄울 때는 1장의 실행 명령으로 띄우고 `herdr agent rename`으로 1장의 이름을 붙인 뒤 6장 프롬프트를 보낸다.
- `tauri-leader`의 control 탭은 사용자가 닫으라고 할 때까지 유지한다.
- 버전이 끝나면 다음 버전의 `specs/{새 버전}/HERDR-SETUP.md`를 새로 쓴다. 이 문서는 고치지 않는다.
