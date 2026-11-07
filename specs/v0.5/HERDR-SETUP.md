> 버전: v0.5 · 작성일: 2026-11-06 · 상태: 확정 (core-leader 판정, 사용자 위임 2026-11-06)
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
| `tauri-checker` | 카드 리뷰(정확성, 카드 검증 수준만큼 빌드·테스트), 화면 검증(V2·V3)과 측정. `src/`는 고치지 않는다 | agy | gemini-3.8-flash-high | - | `agy --model gemini-3.8-flash-high --settings D:\projects\workbench-tauri\.agents\checker-settings.json` | 리뷰·검증 카드가 있을 때 |

- worktree는 두지 않는다. coder가 하나라 같은 checkout에서 겹치지 않는다(core D-2).
- 리뷰 독립성: coder(Codex)와 writer(Claude)의 산출물은 checker(agy)가 검토한다(core D-2).
- 측정자는 직접 고치지 않는다. checker는 불일치 목록을 leader에게 보고한다(루트 `AGENTS.md` 3A.4의 7).
- Codex는 coder에만 쓴다. 두 갈래 coder가 같은 Codex 구독을 나눠 쓴다.
- Codex 한도가 바닥날 때(사용자 결정, core D-16, 2026-11-07):
  - coder의 Codex 5시간 한도가 바닥나면 기다리거나 쿠폰을 쓰지 않고, coder를 Claude Code Sonnet 5.5 high로 바꿔 이어서 한다. impl 탭 coder pane에서 `claude --model sonnet --effort high`로 띄우고 이름은 그대로 `tauri-coder`다.
  - 바꾼 시각과 모델은 바꿀 때 leader가 writer 카드로 이 문서와 PROGRESS에 적게 한다.
  - Codex가 돌아온 뒤 되돌릴지는 leader가 카드 경계(진행 중인 카드가 끝난 때)에서 정한다.
  - checker(agy) 리뷰는 그대로다.
  - 바꾼 기록:
    - 2026-11-07 12:13: coder를 Codex gpt-6.1-sol medium에서 Claude Code Sonnet 5.5 high(`claude --model sonnet --effort high`, 이름 `tauri-coder` 유지, pane `wJ:pM`)로 바꿨다. 사유: Codex 5시간 한도가 6% 남아, K-17(ORDER-07 복사 스크립트)이 끝난 카드 경계에서 다음 카드 K-18(큰 카드) 중간에 바닥나는 것을 피하려고 leader가 바꿨다.
    - 되돌리기(사용자 결정, core-leader 전달): Codex 한도는 14:00에 초기화된다. 14:00 이후 진행 중인 카드가 끝나는 때에 coder를 Codex gpt-6.1-sol medium으로 되돌리고 그 시각을 이 문서와 PROGRESS에 적는다. 되돌린 시각: 미정.
    - 2026-11-07 14:08: K-22가 끝난 뒤 Sonnet 5.5 coder를 `/quit`로 종료했다. Codex gpt-6.1-sol medium 시작은 pane `wJ:pM`이 입력에 반응하지 않아 아직 못 했다(`herdr agent start` timeout 2회). 되돌린 시각은 끝나면 leader가 다시 알린다(지금은 이 상태 그대로 적음).
    - 2026-11-07 14:57: coder를 Codex gpt-6.1-sol medium으로 되돌렸다. 14:08 Sonnet 종료 뒤 pane에 입력이 줄 일부만 들어가 PowerShell이 계속 입력 상태로 멈춰 있던 것을 `Ctrl-C`로 풀고 `herdr agent start`로 띄웠다. 되돌린 시각: 14:57.
    - 2026-11-07 15:57: Codex gpt-6.1-sol medium의 5시간 한도가 바닥났다(K-29 진행 중, 다시 쓸 수 있는 시각 19:05). D-16대로 coder를 Claude Code Sonnet 5.5 high로 바꿨다(`herdr agent start tauri-coder --kind claude --pane wJ:pM -- --model sonnet --effort high`, 이름 `tauri-coder` 유지). K-29는 Sonnet이 작업 트리의 중간 결과에서 이어서 한다. 되돌릴지는 core-leader 지시를 따른다(앞 14:00 결정은 그 회차에만 적용).
    - 2026-11-07 19:21: 사용자 지시(core-leader 전달 [DECISION])로 coder를 Codex gpt-6.1-sol medium으로 되돌렸다. 진행 중인 카드가 없는 때(K-43 뒤) Sonnet 5.5 high를 `/exit`로 끝냈고, 셸이 프롬프트를 바로 돌려주지 않아 `Ctrl-C`로 풀고 같은 pane `wJ:pM`에서 `herdr agent start tauri-coder --kind codex --pane wJ:pM -- -m gpt-6.1-sol -c model_reasoning_effort=medium`로 띄웠다(이름 `tauri-coder` 유지, pane을 닫고 새로 띄우지 않음). `/model`로 GPT-6.1-Sol·Medium(current)을 확인했다(바꾸지 않음). 상태 줄 `GPT-6.1-Sol medium`.
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

- `tauri-checker`는 `agy --model gemini-3.8-flash-high --settings D:\projects\workbench-tauri\.agents\checker-settings.json`으로 띄운다(5.5).
- worktree: 없음. `git worktree list`가 본 트리 하나만 보였다(tauri-leader 확인 2026-11-06).
- v0.4 에이전트(`check`·`impl`·`impl-core`·`measure`)의 pane은 이번 세션에 남아 있지 않았다. 닫은 것은 없다(tauri-leader 확인 2026-11-06).
- 같은 세션에 workspace `workbench-core`·`workbench-gpui`가 함께 떠 있을 수 있다. 이 레포의 에이전트는 그 워크스페이스에 입력하지 않고 파일을 쓰지 않는다(core D-7).

---

## 3. 측정 조건

- V3: 데스크톱 주 모니터 1920x1080, 100%(루트 `AGENTS.md` 3A.4). 스펙(200% 기준)과는 논리 px로 비교한다.
- Zed와 비교하는 판정: 창 1440×852, 화면 배율 100%, 같은 폴더·파일·테마(core D-11).
- 입력 도구로 키·마우스를 보낼 때는 대상 PID·HWND를 고정하고, 입력 직전마다 전경 창을 확인한다(루트 `AGENTS.md` 3A.4).
- 측정 전에 앱 데이터 폴더(`%APPDATA%\workbench-tauri`)를 백업하고 끝나면 되돌린다(v0.4와 같음).
- 측정·확인 때는 자기가 띄운 프로세스만 닫는다. 띄운 프로세스의 PID를 기록해 두고, 가능하면 `CloseMainWindow`로, 아니면 `Stop-Process -Id <띄운 PID>`로 닫는다. 이미 열려 있던 Zed·앱 창과 프로세스는 닫거나 `Stop-Process`하지 않는다. 이름으로 모든 프로세스를 끝내지 않는다(`Stop-Process -Name` 금지). (core-leader 결정, 사용자 위임 core D-13, ORDER-03, 2026-11-07)
- Zed 측정은 `zed -n` 새 창으로 하고 그 HWND만 재고 그 창만 닫는다(core-leader 결정 2026-11-07).

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
- 마우스·키 입력이 필요한 확인: checker(agy)는 격리 데스크톱에서 돌아 입력이 들어가지 않는다. 그래서 `tauri-leader`가 화면 차례 안에서 `tools/win-input.ps1`(SendInput)을 실행하고 출력·캡처 파일을 남긴다. checker는 그 파일로 판정한다(ORDER-02에서 쓴 방식). (core-leader 결정, 사용자 위임 core D-13, ORDER-03, 2026-11-07)

### 5.4 기타

- Git Bash에서 `/`로 시작하는 문자열을 herdr로 보낼 때는 `MSYS_NO_PATHCONV=1`을 붙인다(ORDER-01 3.3).
- 문서가 확정되면 `tauri-writer`가 상태 줄만 바꾸고 `tauri-leader`가 커밋한다. 확정은 core-leader가 판정한 뒤 사용자가 정한다(ORDER-01 3.1).
- Phase 끝 순서는 `PLAN.md`를 따른다.

### 5.5 승인 처리

- 서브 에이전트(`tauri-writer`·`tauri-coder`·`tauri-checker`)의 승인 요청은 `tauri-leader`가 대신 응답한다(위임, 사용자 2026-11-06, core ORDER-01-R2).
- 위임에서 빠져 사용자에게 묻는 것:
  - 의존성 추가·제거·버전 변경(루트 `AGENTS.md` 9장)
  - HERDR 구성 변경(모델·effort·역할·pane, 루트 `AGENTS.md` 레포 규칙)
  - push
- `tauri-leader`가 처리한 판단은 출처 "리더 결정(사용자 위임 2026-11-06, core ORDER-01-R2)"을 달아 `PROGRESS.md`에 남긴다. `HERDR-DECISIONS.md`는 두지 않는다.
- checker 명령 설정(core ORDER-01-R3, 사용자 2026-11-06):
  - 위치: 레포 `.agents/checker-settings.json`. `agy --settings`로 `tauri-checker` 세션에만 적용한다(1장 실행 명령). agy 전역 설정(`C:\Users\nampl\.gemini\antigravity-cli\settings.json`)은 레포 밖이라 고치지 않는다(core D-7). 레포 안 파일을 checker 실행 때만 쓰는 것은 리더 결정이다(agy는 레포 안 프로젝트 settings 파일이 문서화되어 있지 않다).
  - 현재 파일 내용(`permissions.allow`만 있음, 항목마다 명령 전체): `git diff`·`git log`·`git status`·`git show`와 그 정확한 변형(`git diff --stat`·`--name-only`·`--cached`·`--cached --stat`·`HEAD`·`HEAD --stat`, `git status --short`·`-sb`, `git log --oneline`·`--oneline -5`·`--oneline -10`·`-1`·`-1 --stat`, `git show --stat`·`HEAD`·`HEAD --stat`), `npm test`·`npm run build`·`npm run typecheck`·`npm run test`(`npm.cmd` 포함), `npx tsc --noEmit`, `cargo check`·`cargo test`·`cargo clippy --manifest-path src-tauri/Cargo.toml`, `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings`, `tools/`의 검증·측정 스크립트(`node tools/count-lines.mjs`, `node tools/measure-m3.mjs`, `node tools/theme-expect.mjs`, `pwsh tools/capture-startup.ps1`, `pwsh tools/hittest.ps1`, `pwsh tools/win-input.ps1`). 화면을 다루는 스크립트는 5.3의 차례를 따로 받는다. 정확한 변형은 core-leader가 사용자 직접 요청으로 더했다(core D-7 예외, 사용자 요청 2026-11-06).
  - deny 제거: 사용자 직접 승인(core-leader 전달, 사용자 원문 2026-11-06 "checker가 승인 창 없이 명령을 실행하게 하는 설정하도록 승인합니다.")으로 `permissions.deny`를 빼고 allow만 남겼다(W-07). 그 전 deny에 있던 `git commit`·`push`·`reset`·`checkout`·`switch`·`branch`·`rm`, `npm install`·`npm i`, `cargo add`·`cargo remove`, `rm`·`del`·`Remove-Item`, `curl`·`Invoke-WebRequest`와 파일 삭제, `src/` 쓰기, 의존성 변경, 내려받기는 여전히 checker가 하지 않는다(core D-2, 루트 `AGENTS.md` 9장).
  - 보고 파일 쓰기는 카드가 정한 `%TEMP%\v05-*-report.md`만 한다. 레포 밖 파일 접근은 전역 `allowNonWorkspaceAccess`가 이미 허용한다.
  - 앱 실행(`npm run tauri dev`)은 파일에 넣지 않았다. 화면 검증 때 필요하면 그때 카드로 정한다.
- 설정의 실제 동작(tauri-leader 시험 2026-11-06):
  - allow 항목은 명령 전체가 정확히 같을 때만 일치한다. 앞부분 일치가 아니다(예: `command(git diff)`는 `git diff --stat`과 일치하지 않는다).
  - allow와 deny가 함께 있으면 허용 항목의 명령도 승인 창이 떴다. 지금 파일에는 deny가 없다.
  - 정확한 변형을 더한 뒤 checker를 `--settings`로 다시 띄우자 `git diff --stat`·`git status --short`·`git log --oneline -5`가 승인 창 없이 실행되었다.
- checker 명령 실행 규칙:
  - 목록에 있는 명령은 `tauri-checker`가 직접 실행한다.
  - 목록에 없는 명령은 승인 창이 뜨므로 대체 방식(core-leader 결정, 사용자 위임 2026-11-06, core D-13)을 쓴다. `tauri-coder` 또는 `tauri-leader`가 실행하고 출력을 `%TEMP%\v05-<카드ID>-*.txt` 파일로 남기며, `tauri-checker`는 그 파일만 읽어 판정한다.
  - 필요한 명령은 `tauri-leader`가 core-leader에게 알려 목록에 더한다. 목록 변경은 사용자 또는 core-leader가 한다(`tauri-leader` 세션 자동 모드는 이 파일 변경을 `[Self-Modification]`으로 거부했다, 2026-11-06).
- 그 밖의 승인 요청에는 아래 리더 결정을 따른다.
- 리더 결정: `tauri-leader` 세션의 자동 모드가 승인 키 입력을 막으면 그 명령을 승인하지 않는다. 읽기 전용 결과(예: `git diff`)는 `tauri-leader`가 `%TEMP%` 파일로 만들어 넘긴다. 그래도 안 되면 `[BLOCKED]`로 사용자에게 묻는다. 2026-11-06 C-01·C-02에서 `git diff` 승인 일부가 막혔다.

---

## 6. 최초 지시 프롬프트

```text
너는 workbench-tauri v0.5의 <이름>이다. 루트 AGENTS.md와 specs/v0.5/HERDR-SETUP.md(1장 역할, 4장 소유권, 5장 프로토콜)를 읽어라.
읽은 뒤 자기 역할을 한 줄로 확인하고 tauri-leader의 카드를 기다려라. 카드 전에는 파일을 고치거나 앱을 실행하지 않는다.
```

- 프롬프트를 보내기 전에 1장의 실행 명령으로 띄운다. `tauri-checker`는 `agy --model gemini-3.8-flash-high --settings D:\projects\workbench-tauri\.agents\checker-settings.json`이다(5.5).

---

## 7. 정리 방법

- Phase가 바뀔 때 서브 에이전트의 컨텍스트를 비운다(core D-2).
- 할 일이 없는 서브 에이전트는 닫아도 된다. 다시 띄울 때는 1장의 실행 명령으로 띄우고 `herdr agent rename`으로 1장의 이름을 붙인 뒤 6장 프롬프트를 보낸다.
- `tauri-leader`의 control 탭은 사용자가 닫으라고 할 때까지 유지한다.
- 버전이 끝나면 다음 버전의 `specs/{새 버전}/HERDR-SETUP.md`를 새로 쓴다. 이 문서는 고치지 않는다.
