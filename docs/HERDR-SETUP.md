# HERDR-SETUP — workbench-tauri 멀티 에이전트 구성안

- 상태: 승인됨 (2026-11-01, 사용자 승인 "승인. runner ×2로 구성안대로 구축해줘")
- 작성: wt-leader (2026-11-01)
- 가이드: D:\projects\docs\guides\herdr\README.md

## 1. 근거

- INTENT.md: "INTENT.md 없음". 구축을 마친 뒤 project-workflow-compact의 "1. 신규 시작"으로 만든다.
- 사용자 지시: "상위 workbench-gpui 와 유사하게 zed-like-editor 를 tauri 로 구현하는 프로젝트 워크스페이스 입니다. project-workflow-compact 에 의해 스펙 문서를 작성해야 하고, herdr 환경도 구축해야 합니다."
- 출발 문서: D:\projects\docs\guides\zed-like-editor\03-tauri\README.md. 명세 기준은 01-zed/다.
- 본보기: D:\projects\workbench-gpui\docs\HERDR-SETUP.md
- 사용자에게 확인한 것 (2026-11-01):
  - 페어 → "gpui와 같게". coder는 Opus 5.5 · medium, reviewer는 Codex sol · medium
  - 보조 역할 → scouter (agy Flash), checker (agy Argon), runner ×2 (승인 때 확정)
  - v0.1 범위 → 03-tauri 7절의 PoC 1~2단계
  - 루트 INTENT → workbench-gpui INTENT를 바탕으로 쓴다

## 2. 작업 유형

- 바탕 구성: 가이드 PLANNING.md 6.3 B. 앱·CLI 개발. 여기에 6.4 C 포팅의 동등성 검증 성격을 더했다.
- 페어: Claude 주력
- 바꾼 점 (workbench-gpui 구성과 같다):
  - coder를 Sonnet 5.5 · high에서 Opus 5.5 · medium으로 올린다. 사용자가 "gpui와 같게"를 골랐다. Zed와 거의 같아야 하므로 명세 해석 품질을 우선한다.
  - checker(Zed 일치도 검증)를 agy Gemini 4 Argon · medium으로 추가한다. coder(Claude), reviewer(Codex)와 다른 회사의 모델로 독립 검증한다. 단계 최종 판정만 high로 한다. agy 한도가 소진되면 Claude Sonnet 5.5 · high로 바꾼다.
  - writer는 두지 않는다. 작성 단계 문서(INTENT·DECISIONS·SPEC·PLAN)는 coder가 함께 쓴다.
  - runner를 2개 둔다. 하나는 빌드·테스트(cargo / npm), 다른 하나는 앱 실행(`npm run tauri dev`)용이다.

## 3. 탭·패널 배치

| 탭 | 이름 | 패널 |
| --- | --- | --- |
| 1 | control | wt-leader (현재 패널 wC:p1) |
| 2 | agents | wt-coder (왼쪽 위), wt-scouter (왼쪽 아래), wt-reviewer (오른쪽 위), wt-checker (오른쪽 아래) |
| 3 | run | wt-runner-build (위), wt-runner-app (아래) |

```
탭 2 agents                                       탭 3 run
┌──────────────────────┬──────────────────────┐  ┌──────────────────────┐
│ wt-coder             │ wt-reviewer          │  │ wt-runner-build      │
│                      │                      │  │ cargo / npm build    │
├──────────────────────┼──────────────────────┤  ├──────────────────────┤
│ wt-scouter           │ wt-checker           │  │ wt-runner-app        │
│                      │                      │  │ npm run tauri dev    │
└──────────────────────┴──────────────────────┘  └──────────────────────┘
```

## 4. 에이전트

| 이름 | kind | 모델 · effort | 위치 | 역할 | 파일 수정 범위 |
| --- | --- | --- | --- | --- | --- |
| wt-leader | claude | Opus 5.5 · medium | 1 control | 소통·조율, 작업 분해, 대리 응답 | docs/HERDR-SETUP.md, docs/HERDR-DECISIONS.md |
| wt-coder | claude | Opus 5.5 · medium | 2 agents 왼쪽 위 | 루트 INTENT·AGENTS·CLAUDE.md, specs/ 문서, Rust(src-tauri)·TypeScript 구현·테스트 | 프로젝트 전체 (HERDR-* 제외) |
| wt-scouter | agy | gemini-3.8-flash-low | 2 agents 왼쪽 아래 | Tauri·wry·WebView2·CodeMirror 6·web-tree-sitter 문서를 조사해 요약 (03-tauri 5절 R-항목) | 안 함 |
| wt-reviewer | codex | gpt-6.1-sol · medium | 2 agents 오른쪽 위 | Phase 끝에 `git diff` 적대적 코드 리뷰, specs 문서별 리뷰 | 안 함 |
| wt-checker | agy | gemini-4-argon-medium (최종 판정은 high, 대체 Sonnet 5.5 · high) | 2 agents 오른쪽 아래 | Zed 일치도 검증: 단계별 항목 ID(L-/I-/E-/P-/K-/X-/T-/A-)를 스크린샷·측정값과 대조한다. 기준은 04-COMPARISON 체크리스트, A-32(±1px), A-35 | 검증 보고서만 (`specs/<버전>/verify/`) |

checker 운영 규칙
- 명세 전체가 아니라 그 단계의 항목 ID 절만 넘긴다.
- 판정은 증거로 한다.
  - wt-runner-app으로 앱을 실행한다.
  - 창 스크린샷을 찍는다. 창 크기와 DPI는 기준 화면과 같게 한다.
  - 측정값(px, hex 색, 키 바인딩 덤프)을 남긴다. WebView 쪽 값은 DevTools·스크립트로 덤프한다.
  - 이것을 기준 PNG(`D:\projects\docs\guides\zed-like-editor\01-zed\assets\zed-reference*.png`)와 명세 수치에 대조한다.
- 불일치는 "항목 ID / 명세 값 / 실제 값 / 증거 파일" 형식으로만 보고한다. leader가 coder에게 전달한다.

## 5. runner

| 이름 | 용도 | 주인 | 작업 폴더 |
| --- | --- | --- | --- |
| wt-runner-build | cargo build / test / clippy, npm install / build / test | wt-leader | D:/projects/workbench-tauri |
| wt-runner-app | `npm run tauri dev` 앱 실행 (검증용 스크린샷) | wt-leader | D:/projects/workbench-tauri |

## 6. 토큰 부담

| 구독 | 이 워크스페이스 | 동시에 도는 다른 워크스페이스 |
| --- | --- | --- |
| Claude | ◐ leader, ● coder(Opus) | projects(wA): leader 1개, idle / workbench-gpui(wB): leader + coder(Opus) |
| Codex | ◐ reviewer (Phase 끝) | workbench-gpui(wB): reviewer(sol) |
| agy | ◐ checker(Argon), ○ scouter(Flash). 같은 한도를 나눠 쓰며 checker가 우선이다 | workbench-gpui(wB): checker(Argon), scouter(Flash) |

- 세 워크스페이스가 모두 Claude 주력 페어다. BUILDING 6.3은 3개일 때 Codex 주력을 하나 두라고 권하지만, 사용자가 "gpui와 같게"를 골랐다(2026-11-01).
- 한도가 빠듯하면 동시에 돌리지 않고 차례를 둔다(BUILDING 6.3).
  - reviewer와 checker의 검증은 wB와 겹치지 않게 순서를 둔다.
  - 그래도 부족하면 coder를 Sonnet 5.5 · high로 되돌리는 것을 검토한다. 구성 변경이므로 다시 승인받는다.

## 7. 대리 응답 범위

- 가이드 OPERATING.md 1절 기준을 따른다.
- 이 프로젝트에서 따로 정한 것 (workbench-gpui와 같은 기본값, 승인으로 확정):
  - leader가 사용자 승인 권한을 가진다. 하위 에이전트의 결정 요청을 검토해 승인하거나 수정을 요청하고, 판단마다 근거를 HERDR-DECISIONS.md에 남긴다.
  - 단, specs 문서의 요구·결정 내용은 사용자에게 묻는다(AGENTS "사람이 정하고 묻는다").
  - 위임 밖: 파일·폴더 삭제, push 등 외부 전송, git 원격 설정
  - git: `git init`만 한다 (push·원격 없음).
  - 새 크레이트·npm 패키지: 03-tauri 3.1·3.2절 후보 목록 안이면 승인한다. 목록 밖은 2026-11-01 위임 이후 leader가 라이선스·필요성을 확인해 결정하고 HERDR-DECISIONS에 근거를 남긴다.
  - (2026-11-01 사용자 위임) PLAN Phase 1~3을 leader가 순서대로 진행하고, 필요한 승인을 leader가 결정해 근거를 HERDR-DECISIONS에 남긴다. 모든 단계를 마친 뒤 사용자에게 보고한다. PLAN의 "미해결 실패가 있으면 멈추고 사용자에게 올린다" 규칙은 그대로 따른다.
  - 같은 에이전트와의 검증 왕복은 최대 3회다 (사용자 지시 2026-11-01, 가이드 PLANNING 4절의 2회 대신).

## 8. 정리 방법

- 닫을 탭·패널: 탭 2 agents, 탭 3 run. 사용자가 닫으라고 할 때까지 유지한다.
- 지울 worktree: 없음
- 남길 것: 탭 1 control (wt-leader)

## 9. 변경 이력

| 날짜 | 내용 | 승인 |
| --- | --- | --- |
| 2026-11-01 | 초안 작성, runner ×2 확정 후 승인 | 사용자 승인 |
| 2026-11-01 | 검증 왕복 최대 2회 → 3회로 변경 (사용자 지시 "리뷰어 왕복을 2회 -> 3회까리로 변경") | 사용자 지시 |
| 2026-11-01 | Phase 1~3 순차 진행과 승인 결정을 leader에게 위임 (사용자 지시 "리더 에이젼트가 플랜을 기반으로 순차적으로 진행해 주세요. 필요한 승인은 리더가 결정하고 근거를 문서에 남겨 주세요.") | 사용자 지시 |
| 2026-11-01 | wt-checker 를 agy Argon → Claude Sonnet 5.5 · high 로 교체 (agy 한도 소진, 4절 대체안). wt-scouter 는 같은 이유로 사용 불가 | leader (위임) |
