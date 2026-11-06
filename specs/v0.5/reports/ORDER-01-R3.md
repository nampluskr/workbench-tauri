[DONE] ORDER-01-R3 tauri (기준 2는 사용자 조치 대기, 대체 방식 적용)

## 완료 기준
| 번호 | 기준 | 결과 | 근거 |
|---|---|---|---|
| 1 | 허용 목록과 설정 위치가 HERDR-SETUP에 있다 | 충족 | `specs/v0.5/HERDR-SETUP.md` 5.5 "checker 명령 허용"(실제 동작과 대체 방식 포함), 1장·2장·6장 실행 명령 |
| 2 | 레포 설정에서 checker `git diff --stat`이 승인 없이 돈다 | 사용자 조치 대기(대체 방식 적용) | 아래 "확인"·"사용자 조치". 그동안은 HERDR-SETUP 5.5 대체 방식으로 일한다: coder 또는 leader가 명령을 실행해 출력을 `%TEMP%\v05-<카드ID>-*.txt`로 남기고, checker는 그 파일을 읽어 판정한다(core-leader 결정, 사용자 위임 2026-11-06, D-13) |
| 3 | "허용하지 않는다" 명령이 허용 목록에 없다 | 충족 | `.agents/checker-settings.json` `allow`에 commit·push·reset·checkout·브랜치·삭제·`src/` 쓰기·의존성 설치·내려받기 명령이 없다 |
| 4 | 이 보고 파일 | 충족 | `D:\projects\workbench-tauri\specs\v0.5\reports\ORDER-01-R3.md` |

## 설정
- 위치: 레포 `D:\projects\workbench-tauri\.agents\checker-settings.json`. checker를 `agy --model gemini-3.8-flash-high --settings D:\projects\workbench-tauri\.agents\checker-settings.json`으로 띄워 그 세션에만 적용한다.
  - agy 전역 설정은 `C:\Users\nampl\.gemini\antigravity-cli\settings.json`의 `permissions.allow`다. 레포 밖이라 고치지 않았다(D-7).
  - 레포 안 프로젝트 settings 파일은 agy 문서(`agy --help`, `agy changelog`)에 없다. 그 대신 `--settings <파일>` 플래그가 있다("Settings for this session only, never saved").
- 허용 목록(`allow`, 명령 단어 앞부분 일치):
  `git diff`, `git log`, `git status`, `git show`, `npm run build|typecheck|test`, `npm.cmd run build|typecheck|test`, `npx tsc --noEmit`, `cargo check|test|clippy --manifest-path src-tauri/Cargo.toml`, `node tools/count-lines.mjs|measure-m3.mjs|theme-expect.mjs`, `pwsh tools/capture-startup.ps1|hittest.ps1|win-input.ps1`
- 지금 파일에는 `deny`도 있다: `git commit|push|reset|checkout|switch|branch|rm`, `npm install`, `npm.cmd install`, `npm i`, `cargo add|remove`, `rm`, `del`, `Remove-Item`, `curl`, `Invoke-WebRequest`.
- 사용자가 할 일(전역): 없음. 레포 방식으로 된다(아래 결정만 필요).

## 확인
- 시험 1: `allow` + `deny`를 담은 레포 파일로 띄웠다. agy 로그 `CLI settings initialized: permissions=&{Allow:[command(git diff) …` 로 파일이 읽힌 것을 확인했다. 그런데 `git diff --stat`에 **승인 창이 떴다**. 승인하지 않고 취소했다.
- 시험 2: `allow`만 담은 임시 파일 `{"permissions":{"allow":["command(git diff)","command(git diff --stat)"]}}`로 띄웠다. `git diff --stat`이 **승인 창 없이 돌았다**. 임시 파일은 지웠다.
- 결론: 허용 방식 자체는 동작한다. 다만 `deny`가 함께 있으면 허용된 명령도 승인 창이 뜬다. `deny` 항목 가운데 무엇이 원인인지는 가려내지 않았다.
- 시험 2에는 `git diff --stat`의 정확한 항목도 함께 있었다. 그래서 `command(git diff)` 앞부분 일치만으로 통하는지는 아직 따로 확인하지 않았다.
- 지금 checker는 `allow` + `deny` 레포 파일로 떠 있다(승인 창이 뜨는 쪽, 안전한 상태).

## 사용자 조치 (core-leader가 최종 보고에 올린다)
- 원인: 시험 결과대로 레포 파일에서 `deny`를 빼면 완료 기준 2를 충족할 것으로 보인다. 그러나 tauri-leader 세션의 자동 모드 분류기가 writer에게 `deny`를 빼라고 보낸 지시를 "위험"으로 거부했다. 안전장치를 줄이는 변경이라서다. 그래서 진행하지 않았다.
- 필요한 것(core-leader 결정, D-13):
  - 안 A: `deny`를 빼고 `allow`만 둔다. 목록 밖 명령은 모두 승인 창이 뜬다. 금지 명령은 목록에 넣지 않는 것으로 지킨다(카드 완료 기준 3도 "허용 목록에 없다"이다).
  - 안 B: `deny`를 두고, 원인 항목을 시험으로 가려내 그것만 뺀다. 시험마다 checker를 다시 띄워야 한다.
  - 어느 안이든 tauri-leader가 지시를 보내려면 core-leader의 명시 결정(사용자 위임)이 필요하다.

## 결정 뒤 (core-leader 안 A, 사용자 위임 2026-11-06, D-13)
- tauri-leader가 writer에게 안 A(`deny` 빼기)를 지시하려 했다. 그런데 tauri-leader 세션(Claude Code 자동 모드)의 분류기가 다시 거부했다. 사유는 "[Self-Modification]"(에이전트가 에이전트 권한 설정을 바꾸는 것)이다.
- herdr로 온 core-leader 결정은 다른 에이전트가 전한 지시다. 그래서 이 세션의 분류기 판단을 풀지 못한다. leader가 직접 고치는 것도 같은 행위라 하지 않았다(우회하지 않음).
- 필요한 것(사람만 할 수 있음). 다음 중 하나:
  1. 사용자가 직접 `D:\projects\workbench-tauri\.agents\checker-settings.json`에서 `"deny": [...]` 배열과 그 앞 쉼표를 지운다. 그 뒤 tauri-leader에게 알리면 나머지(checker 재시작, `git diff --stat` 확인, HERDR-SETUP·PROGRESS 갱신, 커밋)를 이어서 한다.
  2. 사용자가 tauri-leader 세션(workbench-tauri, pane `wJ:p1`)에 직접 같은 지시를 입력한다. 사용자 본인의 지시면 분류기가 허용할 수 있다.

## 결정 2 (core-leader, 사용자 위임 2026-11-06, D-13)
- 분류기 거부를 우회하지 않는다. `checker-settings.json`은 지금(allow+deny) 그대로 둔다. 대체 방식을 HERDR-SETUP 5.5와 PROGRESS에 적었다.

## 바꾼 파일
- `.agents/checker-settings.json`(새 파일, allow+deny), `specs/v0.5/HERDR-SETUP.md`, `specs/v0.5/PROGRESS.md`, `specs/v0.5/reports/ORDER-01-R3.md`
- 커밋: `0dddf45`, 보고 표기 고침은 `git log -1 -- specs/v0.5/reports/ORDER-01-R3.md` (push 안 함)

## BLOCKED
없음 (기준 2는 사용자 조치 대기, 대체 방식 적용)

## 사용자 직접 승인 뒤 (core-leader 전달, 사용자 원문 2026-11-06 "checker가 승인 창 없이 명령을 실행하게 하는 설정하도록 승인합니다.")
- 한 것: writer가 `.agents/checker-settings.json`에서 `deny`를 빼고 `allow`만 남겼다. 이번에는 자동 모드가 막지 않았다. checker를 `--settings`로 다시 띄웠다.
- 확인: `git diff --stat`에 **승인 창이 떴다**. 취소했다. `command(git diff)`는 `git diff --stat`과 일치하지 않는다. 앞부분 일치가 아니다. 앞 시험 2에서는 정확한 항목 `command(git diff --stat)`이 있을 때 승인 없이 돌았다.
- 이어서 하려던 것: 와일드카드 항목 `command(git diff *)`를 더해 한 번 시험하려 했다. 그 뒤에 정확한 항목을 더할 생각이었다. 그런데 writer에게 보내는 지시를 tauri-leader 세션 자동 모드가 다시 "[Self-Modification]"으로 거부했다. 우회하지 않았다. 정확한 항목을 더하는 것도 같은 종류라 시도하지 않았다.
- 지금 상태: 파일은 `allow`만 있다(`deny` 없음). 목록 항목이 명령 전체와 정확히 같을 때만 승인 없이 도는 것으로 보인다. 지금 목록의 항목은 대부분 인자 없는 형태라 실제 명령과 맞지 않는다. 그래서 HERDR-SETUP 5.5 대체 방식을 계속 쓴다(문서에 반영).
- 기준 2: 여전히 사용자 조치 대기다.
- 사용자 조치(둘 중 하나):
  1. 사용자가 직접 `.agents/checker-settings.json` `allow`에 쓸 명령을 정확한 형태로 더한다. 예: `"command(git diff --stat)"`, `"command(git diff)"`, `"command(cargo test --manifest-path src-tauri/Cargo.toml)"`, `"command(cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings)"`, `"command(npm.cmd run test)"`. 와일드카드 문법이 있는지는 확인하지 못했다.
  2. tauri-leader 세션에 사용자가 직접 지시한다.
- 바꾼 파일(추가): `.agents/checker-settings.json`(deny 삭제), `specs/v0.5/HERDR-SETUP.md`, `specs/v0.5/PROGRESS.md`, 이 보고. 커밋은 `git log -1 -- specs/v0.5/reports/ORDER-01-R3.md`.
