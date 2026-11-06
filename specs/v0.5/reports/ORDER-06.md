[DONE] ORDER-06 1단계 tauri

Zed "v" 메뉴 확인 보고는 따로 둔다: `specs/v0.5/reports/ORDER-06-zed.md`.

## 완료 기준 (1단계)
| 항목 | 판정 방법 요약 | 결과(충족/미충족/BLOCKED/이미 같음) | 측정값·캡처 경로 |
|---|---|---|---|
| 1. I-17 `≡` 메뉴 | 순서 Zed, 마지막 Help, 구현된 항목만, 막대 뒤 폴더 이름 없음, 이름 간격 Zed와 같음, 항목 동작 | 충족(tauri). 두 갈래 표 일치는 아래 "gpui와 다른 점" | 판정 `specs/v0.5/verify/ORDER-06/ORDER-06-judgement.md`(checker C-21: 통과 13, 불일치 0). 덤프 `tauri-menus.json`, 캡처 `tauri-menubar*.png`, `tauri-menu-*.png`, `tauri-licenses.png` |
| 2. I-2 "v" 버튼·여섯 항목 | Zed와 같은 순서·단축키 표시, 동작 없는 항목이 앱을 망가뜨리지 않음 | 충족 | `tauri-user-menu*.png`, `tauri-menus.json`. Zed `zed-v-menu.png`, `zed-panel-layout.png` |
| 3. `ORDER-06-zed.md` | 여섯 항목의 동작·화면 구성·저장 위치·캡처 | 충족 | `specs/v0.5/reports/ORDER-06-zed.md`, `verify/ORDER-06/zed-*.png` |
| 4. 최종 보고 | — | 충족 | 이 파일 |

## I-17 `≡` 메뉴 (메뉴 표는 `specs/v0.5/SPEC.md` R-17)
- 메뉴 순서: `workbench-tauri` · File · Edit · View · Go · Window · Help. Zed 순서(`app_menus.rs`, 커밋 4304dec732)를 따랐다.
  - Selection·Run은 구현된 항목이 없어 메뉴째 뺐다.
  - 분할 네 항목은 Zed처럼 View → Editor Layout 하위 메뉴에 둔다.
- Help: View Dependency Licenses / (구분선) File Bug Report..., Request Feature... / (구분선) workbench-tauri Repository.
  - URL: 버그·기능 요청은 `https://github.com/nampluskr/workbench-tauri/issues/new`, 저장소는 `https://github.com/nampluskr/workbench-tauri`. 테스트로 확인했고 브라우저는 열지 않았다.
  - Zed는 버그 요청에 템플릿·환경 쿼리를 붙이고 기능 요청은 Discussions로 보낸다. 이 저장소에는 템플릿이 없고 카드가 이슈 작성 페이지를 지정해 그대로 했다.
  - Licenses: 앱 안의 읽기 전용 대화상자다. 글꼴 2개와 Zed 아이콘 LICENSES·GPL·Apache, Lucide 라이선스를 보인다.
    - 텍스트로만 넣는다(innerHTML 없음). 파일별로 실패를 처리하고, 복사본이 없으면 "License copy unavailable."를 보인다.
    - 실측: 열림, 60,917자, 누락 0, Escape로 닫힘.
- 메뉴 막대가 열리면 프로젝트 이름이 숨는다(`projectNameVisible:false`). Zed 소스 `title_bar.rs:302~319`와 Zed 화면 `zed-menubar.png`가 같다.
- **이름 간격**(글자 잉크 사이, 같은 조건 1440×852·100%):
  - Zed는 13~14px이었다(File→Edit 14, View→Go 13, Window→Help 13).
  - tauri는 수정 전 약 5px였다. 이름 버튼에 좌우 padding이 없었다.
  - 이름 버튼 좌우 padding을 스펙 `buttons.padding_x.default_compact` 4px(L-07)로 바꿔 12~13px가 됐다(File→Edit 13, View→Go 12, Window→Help 12). Zed와 1px 이내다. 막대 gap은 I-321 4px 그대로다.
- **화면 확인에서 찾아 고친 것**:
  - K-09-R1: View → Editor Layout 하위 메뉴가 열린 채 포인터를 다른 메뉴 이름(Go)으로 옮기면 메뉴 막대 전체가 닫혔다.
    - 원인: focusout이 하위 메뉴 전환 중의 일시적 포커스 이탈을 "메뉴 밖"으로 판정했다.
    - 공통 지점(`closeOnFocusOut`, 판정을 microtask로 미룸)에서 고쳤다. 수정 뒤 CDP 재현에서 막대가 열린 채 Go로 바뀐다.
  - K-09-R2: 위 이름 간격.
  - K-09-R3(checker C-21 지적): 하위 메뉴가 열린 채 비활성 형제 항목(Extensions)으로 옮기면 하위 메뉴가 닫히지 않았다.
    - 수정 뒤 화면 재확인: 하위 메뉴가 닫히고, 비활성 항목은 강조되지 않으며, 눌러도 아무 일이 없다.

## I-2 "v" 메뉴 (1단계)
- 버튼: 타이틀 바 오른쪽, 최소화 버튼 바로 앞(22×22, 아이콘 14px). 아이콘은 Zed `ChevronDown`(`title_bar.rs:1262`)의 D-9 복사본 `chevron_down.svg`다.
- 항목(Zed `title_bar.rs:1374~1415`와 같은 순서): Settings `Ctrl-,` / Keymap `Ctrl-K Ctrl-S` / Themes… `Ctrl-K Ctrl-T` / Icon Themes… / Extensions `Ctrl-Shift-X` / (구분선) / Panel Layout ▸ Classic, Agentic.
- 아직 동작이 없는 항목은 **비활성**(흐리게, 눌러도 아무 일 없음)이다.
  - 대상: Settings·Keymap·Themes…·Icon Themes…·Extensions, Panel Layout의 Classic·Agentic.
  - 단축키는 표시만 하고 키맵에 새로 묶지 않았다. 비활성 Settings를 눌러도 앱은 정상이었다.
  - Themes·Icon Themes는 Phase 7(I-3·I-4)에서 선택 화면과 연결할 때까지 비활성이다.
  - Panel Layout 자체는 하위 메뉴를 보이도록 활성이다.
- Zed의 `Custom`은 Zed 배치가 Classic·Agentic 어느 것도 아닐 때만 나오는 비활성 표시라 넣지 않았다. 이 앱에는 그 상태가 없다.
- 로그인 관련 항목(Sign Out 등)은 넣지 않았다.

## gpui와 다른 점 (두 갈래 조율 필요)
- gpui 레포를 읽기만 하고 대조했다(`workbench-gpui/src/ui/app_menu.rs`, 그 SPEC R-2·R-17, coder K-09 작업 시점).
- **View의 분할 항목**: tauri는 Zed처럼 `Editor Layout` 하위 메뉴(Split Up/Down/Left/Right)로 묶었다. gpui는 읽은 시점에 View의 직접 항목이었다. 어느 쪽으로 맞출지 core-leader 판단이 필요하다. tauri는 Zed 원문(`app_menus.rs:31~40`)을 근거로 했다.
- 나머지 메뉴(File Save, Edit Undo/Redo, Go, Markdown Preview 두 항목, Help 구성)는 이름·순서·구분선이 같다.
- gpui의 "v" 메뉴는 읽은 시점에 `app_menu.rs`에 없었다. 다른 파일은 보지 않았다.

## Zed에서 확인한 것
`specs/v0.5/reports/ORDER-06-zed.md`:
- 여섯 항목이 각각 무엇을 여는지: Settings 별도 창, Keymap·Extensions 새 탭, Themes·Icon Themes 모달, Panel Layout 하위 메뉴.
- 각 화면의 구성과 저장 위치, 2단계를 위한 정리 표.
- 조건: `zed -n` 새 창, Restricted Mode. 사용자 설정 파일은 바뀌지 않았다.
- 특이사항: Zed 알림 창 1개에 WM_CLOSE를 보낸 일이 있다. 그 보고에 적었고 스크립트도 고쳤다.

## 글꼴 파일 (D-10)
변경 없음.

## 바꾼 파일
- 앱:
  - `src/shell/app-menus.ts`, `src/shell/AppMenu.tsx`, `src/shell/TitleBar.tsx`, `src/shell/menu.ts`, `src/shell/Icon.tsx`, `src/spec/metrics.ts`(I-601·I-608·I-609·I-611·I-612 "v" 버튼 값, L-07 버튼 padding), `src/app.css`.
  - 새 파일 `src/shell/licenses.ts`, 테스트 `src/shell/app-menus.test.ts`, `src/shell/menu.test.ts`.
- 문서: `specs/v0.5/SPEC.md`(R-2·R-17), `PLAN.md`(Phase 6 doing: 1단계 완료, 2단계 대기), `PROGRESS.md`.
- 보고: `specs/v0.5/reports/ORDER-06-zed.md`, 이 파일.
- 검증 결과: `specs/v0.5/verify/ORDER-06/`(Zed 8장, tauri 캡처·덤프, 판정 파일).
- 커밋: `git log -1 -- specs/v0.5/reports/ORDER-06.md`. push 안 함.

## 검토
- coder: K-09(메뉴·"v" 버튼·Licenses), K-09-R1·R2·R3(화면 확인 결과 수정).
- checker:
  - C-20: K-09 리뷰 PASS.
  - C-21: R1·R2 리뷰 PASS와 V3 판정(통과 13, 불일치 0). 지적 1건은 R3로 고쳤다.
- 전체 검사:
  - C-21(R2 뒤): typecheck 통과, test 120/120, cargo check 경고 0.
  - R3 뒤(coder): typecheck, test 121/121, 디버그 빌드 통과.
  - Rust 변경이 없어 clippy는 돌리지 않았다.
- 화면 차례 4회: Zed 확인, tauri 실측, R1·R2 재확인, R3 재확인.
  - tauri는 매번 launchApp PID만 닫았다(43492, 41508, 그 밖의 재현 실행, 17128).
  - 앱 데이터는 백업하고 복원했다.
  - Zed는 내가 연 새 창과 Settings 창만 HWND로 닫았다.
- 진행 중 사항: 허용 목록 밖 명령으로 승인 창이 떴다. 모두 읽기·검사이거나 카드가 요구한 판정 파일 생성이어서 leader가 매번 1회 승인했다(always allow 아님).
  - coder: Zed 고정 커밋 파일 `gh api` GET.
  - checker: git status/diff/grep, dir, Test-Path.
  - coder 승인 창이 화면 작업 중 5분 넘게 기다린 일이 있었다(core-leader 알림). 그 뒤로는 화면 단계 사이에도 coder를 보았다.

## 사용자 확인 필요(V4)
- 라이선스 대화상자 시각 품질(Phase 12).
- I-17 두 갈래 View 분할 항목 구성(core-leader 판단).

## BLOCKED
없음
