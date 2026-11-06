[DONE] ORDER-05 tauri

## 완료 기준
| 항목 | 판정 방법 요약 | 결과(충족/미충족/BLOCKED/이미 같음) | 측정값·캡처 경로 |
|---|---|---|---|
| 1. 갈래 문서에 출처·두는 곳·라이선스·다시 채우기·부재 시 모습 | 문서 | 충족 | `specs/v0.5/SPEC.md` R-1("아이콘 출처와 복사본", "대응 표", "유지한 자리"), `DECISIONS.md` D-2·D-3 |
| 2. I-1 아이콘 출처가 Zed 원본 SVG, 대응 표, 확대 캡처가 Zed와 같음 | 코드 출처 대조 + V3 | 충족(유지 2자리, 아래) | 대응 표 SPEC R-1. 판정 `specs/v0.5/verify/ORDER-05/ORDER-05-judgement.md`(checker C-19: 통과 16, 불일치 0). 확대 `zoom-open-*.png`, `zoom-closed-*.png` |
| 3. I-18 dock 여닫기 트리 모양, Add Project에 "+" | V3 확대 캡처 | 충족 | 상태 바 Project Panel/Close Left Dock = Zed `file_tree`, Add Project = Zed `folder_add`. `zoom-open-statusbar.png`, `zoom-closed-statusbar.png` |
| 4. 복사본이 없을 때 앱이 죽지 않고 정한 모습 | V1 | 충족 | 폴더를 치운 상태에서 typecheck·`npm test` 114/114·디버그 빌드 통과(coder K-08). 코드상 교체한 자리는 같은 크기의 빈 칸이고 버튼·툴팁·기능은 그대로다(checker C-18 확인). |
| 5. 복사본 미커밋 | `git status`·`git ls-files` | 충족 | `.gitignore`에 `src/assets/zed-icons/`. `git ls-files src/assets/zed-icons` 출력 없음(C-18) |
| 6. 보고 파일 | — | 충족 | 이 파일 |

## 아이콘 출처
- 커밋: Zed `zed-industries/zed` **`4304dec732a75505066de5ce2dbbfb2bec369498`**(2026-11-06T08:11:02Z, "Show feedback after copying agent responses (#64664)").
  - 받은 것: `assets/icons/`(UI svg 299개, `file_icons/` svg 96개, `LICENSES`), 루트 `LICENSE-GPL`·`LICENSE-APACHE`.
  - 이 PC의 Zed 설치 폴더에서는 읽지 않았다.
- 두는 곳: `src/assets/zed-icons/`(.gitignore). 라이선스 파일도 같은 폴더에 둔다.
- 다시 채우는 방법: 레포 루트에서 PowerShell 7로 `./tools/fetch-zed-icons.ps1`(커밋함)을 실행한 뒤 다시 빌드한다.
  - 스크립트는 해시를 고정하고 sparse checkout으로 해당 폴더만 받는다.
  - 개수(299/96)와 라이선스를 검사하고, 덮어쓴다.
  - `%TEMP%`의 GUID 폴더에서 받고, 그 폴더만 지운다.
  - SVG는 Vite eager glob으로 빌드 때 들어가므로 채운 뒤 다시 빌드해야 한다.
- 대응 표: `specs/v0.5/SPEC.md` R-1 "대응 표"(앱 자리 → Zed IconName → SVG → Zed 근거 파일:줄). 17개 이름이 모두 복사본에 있다(C-18).
- 색: Zed SVG의 고정 색(`black`, `#DCE0E5` 등)을 렌더링 문자열에서만 `currentColor`로 바꾼다. `fill="none"`은 보존하고, 원본 파일은 고치지 않는다(`src/shell/icon-svg.ts`, 테스트 1개).
- 두 갈래 대응: gpui 작업 중인 코드를 읽기만 하고 대조했다.
  - 같은 자리는 같은 이름이다: `threads_sidebar_left_open/closed`, `folder_add`, `file_tree`, 화살표, `split`, `plus`, `maximize/minimize`, `eye`, `file_doc`, `pin`, `close`, `menu`, `folder/folder_open`.
  - 등록 폴더 목록은 gpui가 Zed `folder`를 써서 tauri도 같게 맞췄다(K-08-R1, DECISIONS D-3). Zed 사이드바의 일반 프로젝트 행에는 아이콘이 없지만, 아이콘을 빼는 것은 레이아웃 변경이라 이번 범위 밖이다.

## Zed SVG가 아닌 채 남은 자리 (보고)
- **Windows 창 버튼(최소화·최대화·복원·닫기)**: tauri는 Segoe Fluent/MDL2 글리프 그대로다.
  - Zed도 Windows에서 SVG가 아니라 같은 글리프(U+E921/E922/E923/E8BB)를 쓴다(`crates/platform_title_bar/src/platforms/platform_windows.rs:15~30,78~83`).
  - **두 갈래가 다르다**: gpui 작업 중인 코드는 이 자리에 Zed SVG `generic_minimize/maximize/restore/close`를 쓴다(`workbench-gpui/src/ui/title_bar.rs:39~42`, 읽기만 함). 어느 쪽으로 맞출지 core-leader 판단이 필요하다. tauri는 Zed 실제 동작(글리프)을 근거로 유지했다.
- **파일 트리 일반 파일**: 자체 `file.svg`(Lucide, `LICENSE-LUCIDE`)를 유지했다.
  - Zed는 확장자·파일 이름별로 아이콘 테마에서 고르므로 하나로 대응할 수 없다. Phase 7(I-3 아이콘 테마 "Zed 기본")에서 바꾼다.
  - 파일 트리 폴더(열림·닫힘)는 Zed 기본 아이콘 테마의 folder.svg/folder_open.svg로 바꿨다. UI 폴더 SVG와 바이트가 같다(SHA-256 일치).

## Zed에서 확인한 것
- 조건: `zed -n %TEMP%\v05-i20` 새 창, 클라이언트 1440×852, 100%, 테마 One Dark. 파일 `docs\refs\paths.md`는 Ctrl+P로 열었다.
  - 캡처 `zed-1-file.png`(사이드바 닫힘), `zed-2-preview-sidebar.png`(사이드바 열림·미리보기).
  - 내가 연 창만 WM_CLOSE로 닫았다. 사용자 Zed(PID 20788·18016)와 그 창은 건드리지 않았다.
- Zed가 "Unrecognized Project" 신뢰 창을 띄웠다. 신뢰 목록에 더하지 않도록 **Stay in Restricted Mode**(Ctrl+Alt+Shift+S)를 골랐다. 아이콘 판정에는 영향이 없다.
- **조건 차이**: 사용자 Zed 설정의 아이콘 테마가 **Catppuccin Latte**다(`%APPDATA%\Zed\settings.json`, 읽기만 하고 바꾸지 않음).
  - 그래서 파일 트리의 폴더·파일 아이콘은 화면으로 비교하지 않았다. 폴더는 코드 출처(Zed 기본 테마 `file_icons.rs:254~268`)로 판정했다.
  - 색은 테마가 달라 판정하지 않았다(tauri Catppuccin Mocha, Zed One Dark).
- 같음(4배 확대 대조, C-19):
  - 상태 바: 사이드바 토글(열림·닫힘), Add Project(folder_add), Project Panel(file_tree).
  - 탭 바: 뒤로·앞으로, +, 분할, 확대.
  - 미리보기 탭 아이콘, 타이틀 바 메뉴.

## 글꼴 파일 (D-10)
변경 없음.

## 바꾼 파일
- 앱:
  - `src/shell/Icon.tsx`: Zed 복사본 조회, 부재 시 빈 칸. 새 파일 `src/shell/icon-svg.ts`와 테스트 `icon-svg.test.ts`.
  - 아이콘 이름 변경: `src/App.tsx`, `src/shell/Pane.tsx`, `src/shell/ProjectTree.tsx`.
  - 자체 SVG 15개 삭제(`file.svg`·`LICENSE-LUCIDE`만 남음). `.gitignore`.
- 도구: `tools/fetch-zed-icons.ps1`.
- 문서: `specs/v0.5/SPEC.md`(R-1·R-18), `DECISIONS.md`(D-2·D-3), `PLAN.md`(Phase 5 done), `PROGRESS.md`.
- 검증 결과: `specs/v0.5/verify/ORDER-05/`(캡처, `tauri-icons.json`, `zoom-*.png`, `ORDER-05-judgement.md`, 232KB).
- 커밋: `git log -1 -- specs/v0.5/reports/ORDER-05.md`. push 안 함. 복사본은 커밋하지 않았다.

## 검토
- coder K-08(복사·대응·교체)과 K-08-R1(등록 폴더 목록을 gpui와 같게).
- checker:
  - 코드 리뷰 C-18 PASS. 출처, 색 처리, innerHTML이 레포 안 고정 파일만 쓰는지, 부재 시 동작, 스크립트, 미추적, 범위 밖 변경 없음을 봤다.
  - 판정 C-19는 통과 16, 불일치 0이다. CDP 덤프로 보이는 아이콘 44개 모두 빈 칸이 아니다.
- 커밋 직전 검사(C-18):
  - typecheck 통과, `npm.cmd run test` 114/114, `cargo check` 경고 0.
  - Rust 코드 변경이 없어 clippy는 ORDER-03-R1 결과 그대로다.
- 화면 차례 1회:
  - tauri는 launchApp으로 1회 띄웠고 PID 2628만 닫았다.
  - Zed는 새 창 3개를 각각 그 창만 닫았다(1회는 단계 전달 오류로 다시 찍음).
  - 앱 데이터는 백업하고 복원했다.
- 진행 중 사항: 허용 목록 밖 명령이라 승인 창이 떴고, 모두 읽기·검사이거나 카드가 요구한 판정 파일 생성이어서 leader가 매번 1회 승인했다(always allow 아님).
  - coder: Zed 고정 커밋 파일을 읽는 `gh api` GET 여러 번, `tools/fetch-zed-icons.ps1` 실행. 스크립트는 내용을 읽고 승인했다.
  - checker: `git grep`·`git diff`·`git ls-files`·`git check-ignore`·`Get-ChildItem`·`Test-Path`·`node --test`.

## 사용자 확인 필요(V4)
- Windows 창 버튼 아이콘: 두 갈래가 다르다(tauri Segoe 글리프 = Zed 실제, gpui Zed SVG `generic_*`). core-leader 판단 필요.
- 파일 트리 일반 파일 아이콘은 Phase 7까지 자체 SVG다.

## BLOCKED
없음
