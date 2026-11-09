[DONE] ORDER-01-R2 tauri (5번은 미정: auto mode가 막음, 아래)

## 완료 기준
| 번호 | 기준 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력) |
|---|---|---|---|
| 1 | 2장 1·3·4번 반영 | 충족 | `INTENT.md` 원칙 테마 두 줄 지움, `AGENTS.md:11` "(core v0.5 D-7)", `AGENTS.md:78` 창 크기·글꼴 표 줄. C-04 [PASS] |
| 2 | 2번 checker 확인과 194줄 | 충족 | C-03 [CONFIRMED](아래 "검토"). `AGENTS.md:195`(한 줄 밀림)를 카드 문장으로 바꾸고 커스텀 스킴·A-55.2 문장을 지움 |
| 3 | 5번 checker `git grep` | 미충족(미정) | 고정 형태는 정했다(아래). `.agents/checker-settings.json`에 넣는 일을 auto mode가 `[Self-Modification]`으로 막았다(leader 셸, writer 카드 둘 다). 우회하지 않았다. 사용자가 직접 넣기로 답했으나(2026-11-10) 아직 들어가지 않았다(`grep -n "git grep" .agents/checker-settings.json` 출력 없음). HERDR-SETUP에도 아직 적지 않았다 |
| 4 | checker 검토 PASS | 충족 | C-04 [PASS], 지적 없음 |
| 5 | 이 보고 파일 | 충족 | `specs/v0.6/reports/ORDER-01-R2.md` |

## 고친 문장
| 파일:줄 | 원래 | 고친 것 | 근거(D-n) |
|---|---|---|---|
| INTENT.md:29~30 | - 테마·아이콘 테마는 미리 넣어 둔 것 중에서 고르기만 한다. / 받기·추가 기능은 두지 않는다. | (두 줄 지움) | ORDER-01-R2 2장 1번, core D-9(core ITEMS 우선이 덮음) |
| AGENTS.md:11 | …읽기만 한다 (core v0.5 D-7, v0.6 D-1). | …읽기만 한다 (core v0.5 D-7). | 2장 3번 |
| AGENTS.md:78 (새 줄) | (없음) | - 창 크기(1440×852, 최소 360×240)와 글꼴 표는 v0.5에서 정한 값을 그대로 둔다(core v0.6 D-8). | 2장 4번, core D-8 |
| AGENTS.md:195 (옛 194) | - Zed 확장 파일은 프로젝트로 복사하지 않고 커스텀 스킴으로 읽는다. 단, `.gitignore` 폴더에 복사해 둔 Zed 테마·아이콘 테마·UI 아이콘과 core ITEMS가 복사본을 정한 것(예: I-17·I-18 codicon)은 예외(core v0.6 D-9). 경로는 확장 루트 기준 상대 경로만 허용하고, 절대 경로·`..`·루트 밖을 가리키는 링크는 거부한다(A-55.2). | - Zed 테마·아이콘 테마·UI 아이콘·문법은 `.gitignore` 폴더에 복사해 함께 빌드한다. 복사본은 core ITEMS가 정한 것만 둔다. | 2장 2번, C-03 [CONFIRMED] |
| specs/v0.6/PROGRESS.md | — | W-03·C-03·W-04 항목, 사용자 요청 작업 "ORDER-01-R1 결과 검토와 제안"(커밋 `fa7f648`), 보고 해시용 커밋을 그만두는 운영 변경 | — |

- INTENT "다루지 않는 것"과 5줄은 그대로다.
- `src/theme/icon-themes.ts:27-37` `resolveAsset`(아이콘 테마 JSON 안 상대 경로를 번들 자산 키로 맞추며 `..`·절대 경로·스킴을 거부)은 코드에 그대로 있다. 문서에서 지운 것은 쓰지 않는 커스텀 스킴 방식의 설명뿐이고 코드는 고치지 않았다.

## 5번 고정 형태 (넣기 전)
- allow 항목: `"command(git grep -n -E -f C:\\Users\\nampl\\AppData\\Local\\Temp\\v06-grep-patterns.txt)"`
- 실제 명령: `git grep -n -E -f C:\Users\nampl\AppData\Local\Temp\v06-grep-patterns.txt`. 패턴은 leader가 카드마다 그 파일에 한 줄에 하나씩 쓴다. pathspec이 없어 레포 추적 파일 전체를 찾고, checker가 결과에서 대상 파일만 본다. leader가 Git Bash에서 같은 형태(`-f` 패턴 파일)로 시험해 동작을 확인했다.
- 넣은 뒤 할 일: writer가 HERDR-SETUP 5.5 "checker 설정은 …" 아래에 위 형태와 쓰는 법을 한 항목으로 적고, checker를 `--settings`로 다시 띄워 승인 창 없이 실행되는지 leader가 대조한다.

## 바꾼 파일
- `INTENT.md`, `AGENTS.md`, `specs/v0.6/PROGRESS.md`, 이 보고 파일
- 커밋: `d2dfe37`(문서). 이 보고는 그 뒤 커밋에 넣는다(보고 해시용 커밋은 그만둠). push 안 함.

## 검토
- C-03 [CONFIRMED]: 커스텀 URI 스킴(`register_*_uri_scheme_protocol`)·asset protocol(`assetProtocol`, `convertFileSrc`, `asset:`)은 `src/`·`src-tauri/` 어디에도 없다. 테마 `src/theme/themes.ts:5`, 아이콘 테마 `src/theme/icons.ts:8-10`, UI 아이콘 `src/shell/Icon.tsx:2,16`, 문법 `src/syntax/assets.ts:2,7-9,24,28` 모두 `.gitignore` 폴더 복사본을 Vite `import.meta.glob`(`?raw`·`?url`·`?no-inline`)으로 함께 빌드한다. 실행 중 디스크에서 읽는 것은 문서 입출력(`src-tauri/src/files.rs:17-20`)뿐이다.
- C-04 [PASS]: 1~4번 모두 지적 없음. 다섯 곳 밖을 다시 쓴 곳 없음, PROGRESS 기존 항목 보존.
- 작업 중 사고(writer W-04): PROGRESS에 C-03 줄을 넣다가 셸 치환으로 C-01~W-03 항목이 잠시 지워졌고, writer가 `git show HEAD`와 원문으로 다시 붙였다. leader가 `git diff -U0`로 확인했다: 커밋된 줄 가운데 지워진 것은 바뀐 "없음." 한 줄뿐이다.
- 남은 지적: 없음.

## 미정
- 5번 checker `git grep` 설정: auto mode가 leader·writer의 권한 설정 변경을 막는다. 사용자가 `.agents/checker-settings.json`에 위 항목을 직접 넣어야 한다. 넣기 전까지는 지금 방식(leader·coder가 실행해 `%TEMP%` 파일로 넘김)을 쓴다. → 사용자(아침에)

## BLOCKED
- 없음(5번은 미정으로 남기고 나머지는 마쳤다, core D-10 공지 (2))
