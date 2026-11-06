[DONE] ORDER-02 tauri

## 완료 기준
| 번호 | 기준 | 결과(충족/미충족/BLOCKED) | 측정값·근거 |
|---|---|---|---|
| 1 | 기록 없는 첫 실행: 클라이언트 논리 1440×852, 작업 영역 가운데 | 충족 | clientOrigin (240, 90), clientSize 1440×852. 기대 (240, 90), 차이 0. 원문 `v05-C-07-step1.txt`, `v05-C-09-min.txt` |
| 2 | 360×240보다 작게 줄어들지 않는다 | 충족 | 바깥 테두리에서 오른쪽 아래 모서리를 끝까지 끌었다. clientSize 360×240(그 아래로 줄지 않음). 원문 `v05-C-09-min.txt` |
| 3 | 크기를 바꾸고 다시 실행해도 1440×852 | 충족 | 344×231로 줄인 뒤 다시 실행했다. clientSize 1440×852, clientOrigin (240, 90). 원문 `v05-C-07-step3.txt` |
| 4 | 측정 조건과 숫자 | 충족 | 아래 "측정", 결과표 `specs/v0.5/verify/ORDER-02-window.md` |

## 측정
- 조건: 주 모니터 1920×1080, 배율 100%(dpi 96), 작업 표시줄 있음. 작업 영역 left 0, top 0, width 1920, height 1032.
- 앱 데이터 `%APPDATA%\workbench-tauri`는 측정마다 이름을 바꿔 비우고, 끝나면 되돌렸다.
- 측정 도구: `tools/win-input.ps1 -Action state`(Win32 클라이언트 원점·크기, 작업 영역), `-Action drag`. 원문 JSON은 `C:\Users\nampl\AppData\Local\Temp\v05-C-04-*.txt`, `v05-C-07-*.txt`, `v05-C-09-min.txt`에 있다.
- 처음 실행:
  - 최종 빌드: 창 위치 frame (239, 89) 1442×854, clientOrigin (240, 90), clientSize 1440×852.
  - 이력(1차, Tauri `center`만 쓴 빌드): clientOrigin (248, 91). +8, +1 불일치였다.
    - 원인: decorations:false 창의 보이지 않는 크기 조절 테두리(왼쪽 8, 위 1)를 포함한 바깥 사각형이 가운데에 놓였다.
    - 수정: setup에서 실제 바깥·안쪽 위치 차이를 빼서 클라이언트 영역을 가운데에 둔다.
- 최소 크기 시험:
  - 최종 빌드: 360×240.
  - 이력(2차 빌드): 344×231. −16, −9 불일치였다.
    - 원인: 같은 테두리가 최소 창 크기에 들어가 클라이언트가 그만큼 더 작아졌다.
    - 수정: setup에서 실제 바깥−안쪽 크기 차이를 최소 크기에 더한다. 360·240은 `tauri.conf.json` 한 곳에만 둔다.
  - 1차 측정의 `-Action resize`(클라이언트 안쪽 2px에서 끌기)는 WebView 안에 떨어져 창 크기 조절이 안 됐다. 그래서 바깥 테두리에서 끄는 `-Action drag -X 1444 -Y 856 -DX -1300 -DY -800`으로 쟀다.
- 크기 바꾼 뒤 다시 실행: 창 위치 frame (239, 89), clientOrigin (240, 90), clientSize 1440×852.
- 캡처: 없음(수치 덤프만 썼다).
- 화면 차례: `[SCREEN-REQ]`·`[SCREEN-OK]`·`[SCREEN-DONE]` 3회. 측정에 띄운 앱은 매번 종료했다(`Get-Process workbench-tauri` 0).

## 바꾼 파일
- `src-tauri/tauri.conf.json`: `minWidth` 360, `minHeight` 240 추가. `center`는 쓰지 않는다.
- `src-tauri/src/lib.rs`: setup에서 클라이언트 영역 가운데 배치와 최소 크기 테두리 보정. 순수 함수 2개와 단위 테스트 2개.
- `specs/v0.5/verify/ORDER-02-window.md`, `specs/v0.5/PROGRESS.md`, `specs/v0.5/PLAN.md`(Phase 2 done), 이 보고.
- 커밋: `git log -1 -- specs/v0.5/reports/ORDER-02.md` (push 안 함). 같은 시기 별도 커밋 `b476a87`은 core-leader가 더한 checker 허용 목록이다.

## 검토
- checker 코드 리뷰: C-03(K-01), C-06(K-01-R1), C-08(K-01-R2) 모두 PASS.
- V1: `cargo test --manifest-path src-tauri/Cargo.toml` 19 passed, `cargo clippy … -- -D warnings` 경고 0, `npm.cmd run tauri build -- --debug --no-bundle` 통과(coder 보고 `v05-K-01-R2-cmd.txt`).
- V3 판정: checker C-05·C-09(`specs/v0.5/verify/ORDER-02-window.md`).
  - C-05에서 checker가 1차 +8, +1을 "대체로 일치(통과)"로 적었다. leader가 "불일치"로 고치게 했다(AGENTS 3장: 반올림 금지).
- 대체 방식: 측정 명령은 leader가 실행했다(HERDR-SETUP 5.5). checker의 첫 `-Action state`가 창이 보이기 전에 불려 실패했고, `drag`는 허용 목록에 없다.

## 사용자 확인 필요(V4)
없음

## BLOCKED
없음

## 참고
- setup에서 창의 모니터를 못 얻으면(`current_monitor()`가 None) 앱 시작이 실패한다. Windows 데스크톱에서는 거의 일어나지 않는다고 판단해 두었다(C-06 의견).
- 최소 크기 보정은 시작할 때의 테두리 값으로 한다. 배율이 다른 모니터로 옮길 때 다시 계산하지 않는다(`shortcut:` 주석).
- checker 허용 목록에 `-Action drag -X 1444 -Y 856 -DX -1300 -DY -800`이 있으면 다음부터 checker가 직접 잴 수 있다. core-leader 판단.
