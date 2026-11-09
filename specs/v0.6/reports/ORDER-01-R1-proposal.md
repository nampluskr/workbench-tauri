[PROPOSAL] ORDER-01-R1 tauri — 커밋 `b41c420` 검토 뒤 제안 (tauri-leader, 2026-11-10, 사용자 요청)

ORDER-01-R1 완료 기준은 충족했다(보고 `specs/v0.6/reports/ORDER-01-R1.md`). 고친 결과를 다시 읽고 core D-9 원문·코드와 맞춰 보니 아래가 남았다. tauri 지침을 바꾸는 일이라 tauri는 고치지 않았다. 받아들일 것을 카드(예: ORDER-01-R2)로 주면 writer가 고치고 checker가 검토한다.

## 제안

| 번호 | 지금 | 문제 | 제안 | 정할 사람 |
|---|---|---|---|---|
| 1 | 루트 `INTENT.md` "변하지 않는 원칙": "테마·아이콘 테마는 미리 넣어 둔 것 중에서 고르기만 한다. 받기·추가 기능은 두지 않는다." / "다루지 않는 것": "LSP와 진단 같은 전문 IDE 기능", "파일·폴더 이름 검색은 둔다", "Extensions 화면과 Settings는 둔다" | core v0.6 ITEMS(I-4~I-7)의 결정이 루트 기준점에 들어갔다. 다음 버전 ITEMS가 바꾸면 루트 INTENT도 고쳐야 한다. 이 경우는 이미 "무엇을 Zed와 같게·다르게 할지는 core ITEMS가 정한다"와 "core ITEMS 우선"이 덮는다. 5줄 "확장 가능한 기반 편집기"와 "받기·추가 기능은 두지 않는다"가 부딪쳐 읽힌다 | 원칙의 테마 문장을 지운다. "다루지 않는 것"은 v0.5 문장에서 core v0.5 예외 꼬리만 지운 형태로 둔다(버전 결정은 `specs/v0.6/INTENT.md`·SPEC에 이미 있다). 5줄 "확장 가능한"은 "Zed 테마·아이콘 테마를 넣어 쓸 수 있는" 정도로 좁힌다 | 사용자(루트 INTENT는 기준점) |
| 2 | `AGENTS.md` 5장 194줄: "Zed 확장 파일은 프로젝트로 복사하지 않고 커스텀 스킴으로 읽는다. 단, `.gitignore` 폴더에 복사해 둔 …은 예외. 경로는 확장 루트 기준 상대 경로만 허용 …(A-55.2)" | 코드에 커스텀 스킴이 없다(`src-tauri/src`·`tauri.conf.json`에서 protocol·scheme 등록을 찾지 못함). 테마·아이콘·문법은 모두 `.gitignore` 폴더(`src/theme/assets/*`, `src/assets/*`)에 복사해 함께 빌드한다. "예외"가 실제 방식 전부이고, 본문 규칙과 A-55.2 문장은 쓰지 않는 방식을 설명한다. I-7(받기·추가 없음)로 앞으로도 쓸 일이 없다 | "Zed 테마·아이콘 테마·UI 아이콘·문법은 `.gitignore` 폴더에 복사해 함께 빌드한다. 복사본은 core ITEMS가 정한 것만 둔다."로 바꾸고, 커스텀 스킴·A-55.2 문장은 지운다. `AGENTS.md` 4.3("보안 처리는 줄이지 않는다")과 닿으므로 승인이 필요하다 | core-leader(필요하면 사용자) |
| 3 | `AGENTS.md` 11줄 "(core v0.5 D-7, v0.6 D-1)" | core v0.6 D-1은 "tauri에만 지시, gpui 동결"이라 "다른 워크스페이스는 읽기만 한다"의 근거가 아니다(ORDER-01-R1이 이 문구를 정했다) | "(core v0.5 D-7)"만 남기거나 core v0.6의 맞는 번호로 바꾼다 | core-leader |
| 4 | `AGENTS.md` 3장 77줄 "단, core ITEMS가 직접 정한 값은 예외(core v0.6 D-9)" | 창 1440×852·최소 360×240과 글꼴 표는 v0.5 ITEMS가 정한 값이다. `spec/zed-metrics.toml`에도 v0.6 ITEMS에도 없어서, 지금 문장대로라면 기준 없는 하드코딩으로 읽힌다(ORDER-01-R1 보고 "미정"의 메모와 같음) | "창 크기·글꼴 표는 v0.5에서 정한 값을 그대로 둔다(core D-8)" 한 줄을 더하거나, core가 `spec/zed-metrics.toml`에 등록한다 | core-leader |
| 5 | checker 설정(`.agents/checker-settings.json`) allow 목록에 `git grep`이 없다 | C-02에서 checker가 grep 대신 파일을 직접 읽었다. 검토 카드마다 같다 | `git grep -n -E "<패턴>" -- <파일>`을 쓸 수 있게 더한다(allow는 명령 전체가 같아야 맞으므로 카드에서 쓸 형태를 정해 둔다) | core-leader·사용자(설정 변경은 tauri-leader가 못 한다) |

## tauri가 바로 바꾸는 것

- 보고 파일에 그 보고의 커밋 해시를 적으려고 커밋을 하나 더 만들던 것(`136c75f`, `2e02647`)을 그만둔다. 보고에는 문서 커밋 해시만 적고 보고 파일은 그 뒤 커밋에 넣는다.

## 확인하지 않은 것

- 2번 "커스텀 스킴이 없다"는 `src-tauri/src`·`tauri.conf.json` 검색과 `.gitignore`만 보고 판단했다. 프런트엔드가 파일을 읽는 경로는 끝까지 따라가지 않았다. 카드로 받으면 coder나 checker에게 먼저 확인시킨다.
