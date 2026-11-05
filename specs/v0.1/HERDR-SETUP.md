> 버전: v0.1 · 작성일: 2026-11-05 · 상태: 확정 (2026-11-05)
>
> workbench-tauri v0.1의 herdr 멀티 에이전트 운영 구성이다. 운영 결정과 그 출처는 `HERDR-DECISIONS.md`에, Phase 순서는 `PLAN.md`에, 공통 규칙은 루트 `AGENTS.md`에 있다. 이 문서는 사용자 승인 뒤 `writer`가 쓴다(루트 `AGENTS.md` "HERDR 문서").

# HERDR-SETUP — workbench-tauri v0.1

## 0. 근거

- 에이전트 풀은 셋이고, Codex는 쓰지 않는다(사용자 결정 2026-11-04, H-3).
  - Claude Code Opus 5.5 medium
  - Claude Code Sonnet 5.5 high
  - agy gemini-3.8-flash-high
- 구성은 구독 현황과 토큰 부담으로 정한다(루트 `AGENTS.md` 레포 규칙).
- 구독 현황(사용자 확인 2026-11-05, H-13)
  - 구독은 Claude Max와 Gemini Pro(agy)다. workbench-gpui 기록과 같다.
  - 2026-11-05 `herdr workspace list`에서는 `workbench-gpui`(pane 1개)와 `workbench-tauri`가 보였다.
  - 한도가 바뀌어 구성을 바꾸면 다시 승인받는다.

---

## 1. 에이전트 구성

| 이름 | 역할 | 도구 | 모델 | effort | 위치 | 상태 |
|---|---|---|---|---|---|---|
| `leader` | 작업 카드 지시(herdr 프롬프트), 승인 처리, 커밋. 코드·문서는 쓰지 않는다 | Claude Code | Opus 5.5 | 세션 기본값 | wJ / control (`wJ:p1`) | 상시 |
| `writer` | 문서(`specs/v0.1/*.md`, 루트 `AGENTS.md`·`INTENT.md`) 작성 | Claude Code | Opus 5.5 | medium | wJ / docs (`wJ:p2`) | 상시 |
| `check` | 카드 산출물 검토, Phase 끝 diff 검토와 전체 테스트 1회 | agy | gemini-3.8-flash-high | - | wJ / check (`wJ:p4`) | 상시 |
| `impl` | 코드 구현 | Claude Code | Sonnet 5.5. R-9 dylink 우회·R-11 증분 연동 카드만 Opus 5.5 | high (Opus일 때 medium) | wJ / impl, main checkout(`master`) | 상시 |
| `measure` | V3 실측과 측정 스크립트 | Claude Code | Sonnet 5.5 | high | wJ / check 탭의 추가 pane | Phase 끝에만 |

- `impl`과 `measure`는 사용자가 승인했다(2026-11-05, H-11·H-12).
- 구현 담당은 `impl` 하나뿐이다. 그래서 worktree를 만들지 않는다.
- `measure`는 `impl`과 나눈다. 측정자는 직접 고치지 않는다(AGENTS 3A.4의 7).
- 리뷰 독립성: Claude 계열(`writer`, `impl`, `measure`)의 산출물은 agy인 `check`가 검토한다.
- 모델을 한도 소진 등으로 바꾸면 구성 변경이다. `HERDR-DECISIONS.md`에 적고 사용자 승인을 받는다.

---

## 2. herdr 레이아웃

```text
herdr session
└── workspace: wJ  workbench-tauri  (D:\projects\workbench-tauri, 브랜치 master)
    ├── tab: control   pane wJ:p1  leader   (Claude Code Opus 5.5)
    ├── tab: docs      pane wJ:p2  writer   (Claude Code Opus 5.5 medium)
    ├── tab: check     pane wJ:p4  check    (agy gemini-3.8-flash-high)
    │                  pane (Phase 끝에만)  measure  (Claude Code Sonnet 5.5 high)
    └── tab: impl      pane wJ:p5  impl     (Claude Code Sonnet 5.5 high)
```

- `measure` pane의 id는 띄울 때 herdr 응답의 실제 값을 이 절에 적는다.
- 같은 세션에 workspace `workbench-gpui`(wD)가 함께 떠 있다. 이 레포의 에이전트는 그 워크스페이스에 입력하지 않는다.

---

## 3. 측정 조건

- V3: 데스크톱 주 모니터 1920x1080, 100%(D-17). 스펙(200% 기준)과는 논리 px로 비교한다.
- 기준 화면과 대조하는 V3: 창을 최대화하지 않고 논리 1440x852로 고정한다(SPEC 공통 판정 방식).
- 입력 도구로 키·마우스를 보낼 때는 대상 PID·HWND를 고정하고, 입력 직전마다 전경 창을 확인한다(AGENTS 3A.4).
- 측정 스크립트가 도는 동안 사용자는 마우스·키보드를 쓰지 않는다.

---

## 4. 파일 소유권

| 경로 | 쓰는 쪽 |
|---|---|
| `specs/v0.1/*.md`(INTENT·DECISIONS·SPEC·PLAN·PROGRESS·HERDR-*), 루트 `AGENTS.md`·`INTENT.md` | `writer`(사용자 승인·카드 지시 뒤) |
| `src/`, `src-tauri/`, 프런트엔드 설정(`index.html`, `vite.config.ts`, `tsconfig.json`), `package.json`·`package-lock.json` | `impl`. 의존성 변경은 사용자 승인(AGENTS 9장) |
| `tools/`, `specs/v0.1/verify/` | `measure` |
| 커밋 | `leader`만(D-19) |
| 카드 보고·검토 결과 | 각 담당이 카드에 적힌 `%TEMP%` 파일(`writer-*.md`, `check-c*.md` 등)에 쓴다 |
| `spec/`, `docs/refs/`, 지난 버전 폴더 | 아무도 고치지 않는다(D-1, AGENTS) |

- 소유자가 아니면 그 파일을 고치지 않는다. 고쳐야 하면 `leader`에게 요청한다.

---

## 5. 작업 프로토콜

1. `leader`가 작업 카드를 herdr 프롬프트로 보낸다. 카드는 파일이 아니다(AGENTS 0장). 카드에는 다음이 들어간다.
   - 카드 ID와 할 일
   - 관련 R-n·D-n
   - 검증 수준
   - 보고 파일 경로
2. 담당자는 카드에 적힌 파일만 쓴다. 보고는 지정된 `%TEMP%` 파일에 쓰고, 답으로는 그 경로만 보낸다. 카드가 다른 답을 정하면 그것을 따른다.
3. `leader`가 `check`에게 검토 카드(C-n)를 보낸다. REWORK이면 원래 카드에 `-R1`, `-R2`를 붙여 다시 보낸다.
4. 문서는 사용자가 확정하면 `writer`가 상태 줄만 바꾸고, `leader`가 커밋한다.
5. Phase 끝 순서는 `PLAN.md`를 따른다.
   1. `measure`가 V3를 잰다.
   2. `check`가 검토하고 전체 테스트를 1회 돌린다.
   3. `writer`가 PROGRESS를 쓴다.
   4. `leader`가 커밋한다.

### 5.1 승인 처리

- 읽기 전용 승인(파일 읽기, `git show`·`git log` 같은 조회)은 `leader`가 카드 범위 안에서 처리한다.
- 다음은 사용자에게 올린다.
  - 쓰기 승인
  - push와 외부 전송
  - 카드 범위 밖의 작업
- 처리한 판단은 `HERDR-DECISIONS.md`에 남긴다.

---

## 6. 최초 지시 프롬프트

```text
너는 workbench-tauri v0.1의 <이름>이다. 루트 AGENTS.md와 specs/v0.1/HERDR-SETUP.md(1장 역할, 4장 소유권)를 읽어라.
읽은 뒤 자기 역할을 한 줄로 확인하고 leader의 작업 카드를 기다려라. 카드 전에는 파일을 고치지 않는다.
```

---

## 7. 정리 방법

- `measure`는 Phase 끝 측정이 끝나면 닫는다.
- 탭 control·docs·check·impl은 사용자가 닫으라고 할 때까지 유지한다.
- 버전이 끝나면 다음 버전의 `specs/{새 버전}/HERDR-SETUP.md`를 새로 쓴다. 이 문서는 고치지 않는다.
