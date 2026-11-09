[DONE] ORDER-01-R1 tauri

## 완료 기준
| 번호 | 기준 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력) |
|---|---|---|---|
| 1 | 루트 INTENT·AGENTS가 D-9와 맞음 | 충족 | `git grep -n -E "gpui와 같아야\|원본은 .?workbench-gpui\|D-12\|v0.5 ITEMS" -- INTENT.md AGENTS.md` → 출력 없음(exit 1). checker C-02 [PASS] |
| 2 | v0.6 문서 미정 반영 | 충족 | `grep -rn "미정" specs/v0.6/INTENT.md specs/v0.6/DECISIONS.md specs/v0.6/HERDR-SETUP.md` → 출력 없음(exit 1). 2장 여덟 답 반영 위치는 아래 "specs/v0.6" 표 |
| 3 | spec/가 core와 같음 | 충족 | `diff -rq spec D:/projects/workbench-core/spec` → 출력 없음(exit 0). `spec/`는 고치지 않음 |
| 4 | 이 보고 파일 | 충족 | `specs/v0.6/reports/ORDER-01-R1.md` |

## 고친 문장
줄 번호는 고치기 전 기준(writer W-02 보고에서 옮김).

### 고친 문장 — 루트 INTENT.md (줄 번호는 고치기 전 기준)

| 파일:줄 | 원래 | 고친 것 | 근거(D-n) |
|---|---|---|---|
| INTENT.md:5 | Zed의 기본 편집기 기능만 가진, 확장 가능한 기반 편집기 앱을 만든다. | Zed의 기본 편집기 기능을 바탕으로, 확장 가능한 기반 편집기 앱을 만든다. | D-9(편집기 기능을 강화하는 쪽으로 Zed와 다르게 함), D-6·D-7 |
| INTENT.md:6 | workbench-gpui와 외형·기능·레이아웃이 같은 결과물을 다른 방식으로 만든다. 두 갈래는 같은 앱이다. | workbench-gpui는 동결했다. gpui의 모습은 core ITEMS 항목이 가리킬 때만 반영한다. | D-1, D-9 |
| INTENT.md:7 | 사용감과 레이아웃은 Zed와 거의 같다. | 화면 틀과 외형은 Zed를 따르고, 편집기 기능은 강화하는 쪽으로 Zed와 다르게 할 수 있다. | D-7(화면 틀은 Zed), D-9 |
| INTENT.md:20~21 | - Zed와 같아야 한다. / 레이아웃·사용감·아이콘·테마를 Zed 기준으로 맞추고, 같은지는 명세와 대조해 확인한다. | - 무엇을 Zed와 같게 하고 무엇을 다르게 할지는 core ITEMS가 정한다. / Zed와 같게 하는 것은 Zed 실측 명세와 대조해 확인한다. | D-9 |
| INTENT.md:22~23 | - workbench-gpui와 같아야 한다. / 두 갈래의 외형·기능·레이아웃이 같아야 하고, 둘 다 같은 Zed 명세로 대조한다. | - core ITEMS가 이 레포의 INTENT·AGENTS와 그 밖의 지침보다 우선한다. / 부딪치면 이 레포의 지침을 고친다. | D-9("gpui와 같아야 한다"를 원칙으로 두지 않음, core ITEMS 우선) |
| INTENT.md:29 | - 확장은 Zed와 같은 방식으로 하고, 앱을 다시 빌드하지 않고 설치한다. | - 테마·아이콘 테마는 미리 넣어 둔 것 중에서 고르기만 한다. / 받기·추가 기능은 두지 않는다. | D-6, I-7 |
| INTENT.md:35 | - 프로젝트 전체 검색, 설정 UI 화면, 업데이트 확인, 오른쪽·하단 Dock. 단, core v0.5 ITEMS I-2(Settings·Panel Layout)·I-22(검색·진단 버튼)는 예외(core D-12). | (새 줄) - 언어 서버(LSP)와 진단 같은 전문 IDE 기능. 구문 강조만 둔다. / - 파일 내용을 찾는 프로젝트 전체 검색, 업데이트 확인, 오른쪽·하단 Dock. 파일·폴더 이름 검색은 둔다. | D-6, I-4·I-5·I-6, D-9(v0.5 번호 지움) |
| INTENT.md:36 | - 화면을 추가하는 확장, 온라인 확장 목록. 단, core v0.5 ITEMS I-2(Extensions)는 예외(core D-12). | - 화면을 추가하는 확장, 온라인 확장 목록. 넣어 둔 것을 보는 Extensions 화면과 설정 화면(Settings)은 둔다. | D-6, I-7(Extensions 보기 화면 유지), I-9(Settings 탭이 있음), D-9 |

- "설정 UI 화면"은 다루지 않는 것에서 빼고, 36줄에 "Settings는 둔다"로 옮겼다. v0.5에서 만든 Settings 화면을 v0.6 ITEMS가 없애지 않았고, I-9 판정이 Settings 탭을 쓰기 때문이다(D-8 지금 동작 유지).

### 고친 문장 — 루트 AGENTS.md

| 파일:줄 | 원래 | 고친 것 | 근거(D-n) |
|---|---|---|---|
| AGENTS.md:10 | …`specs/v0.6/DECISIONS.md` D-4(= core v0.5 D-2 그대로)다: | …`specs/v0.6/DECISIONS.md` D-4다: | D-9(v0.5 번호 참조 지움) |
| AGENTS.md:11 | …읽기만 한다 (core D-7). | …읽기만 한다 (core v0.5 D-7, v0.6 D-1). | ORDER-01-R1 3.2(괄호 근거만, 규칙 본문 그대로) |
| AGENTS.md:12 | …보다 우선한다 (근거는 core v0.5 D-12, 사용자 2026-11-06. core v0.6 DECISIONS에 같은 결정은 없다: 미정). | 이 레포 지침(루트 `INTENT.md`·`AGENTS.md`, docs/refs/ … 포함)보다 우선한다. 부딪치면 이 레포의 지침을 고친다 (core v0.6 D-9, 사용자 2026-11-10). | D-9 |
| AGENTS.md:19 | Tauri 2 기반 Zed 재현 편집기의 에이전트 공통 지침이다. | Tauri 2 기반 편집기의 에이전트 공통 지침이다. | D-9(zed-like 아님) |
| AGENTS.md:40 | 목적: Zed 편집기의 레이아웃과 동작을 재현하는 편집기를 Tauri 2로 만든다. | 목적: Zed의 기본 편집기 기능을 바탕으로 한 편집기를 Tauri 2로 만든다. 무엇을 Zed와 같게 하고 다르게 할지는 core ITEMS가 정한다(core v0.6 D-9). | D-9 |
| AGENTS.md:44 | Zed 실측값은 요구사항이다. | Zed와 같게 하는 곳에서는 Zed 실측값이 요구사항이다. | D-9 |
| AGENTS.md:77 | 단, core v0.5 ITEMS I-6(창 1440×852·최소 360×240)·I-14(글꼴 표)가 직접 정한 값은 예외(core D-12). | 단, core ITEMS가 직접 정한 값은 예외(core v0.6 D-9). | D-9(v0.5 번호 지움) |
| AGENTS.md:78 | `spec/`의 원본은 `workbench-gpui`다. 이 레포에서는 `spec/`를 고치지 않는다. 값을 바꿔야 하면 gpui에서 바꾼 뒤 이 레포로 다시 복사한다. | `spec/`의 원본은 core `D:\projects\workbench-core\spec\`이고, 이 레포의 `spec/`는 복사본이다. 이 레포에서는 `spec/`를 고치지 않는다. 값을 바꿀 일이 있으면 core-leader에게 알린다(core v0.6 D-9). | D-9 |
| AGENTS.md:194 | 단, core v0.5 ITEMS I-3·I-4(core D-8: …복사)와 I-1·I-18(core D-9: Zed UI 아이콘 복사)은 예외(core D-12). | 단, `.gitignore` 폴더에 복사해 둔 Zed 테마·아이콘 테마·UI 아이콘과 core ITEMS가 복사본을 정한 것(예: I-17·I-18 codicon)은 예외(core v0.6 D-9). | D-9, I-3·I-17·I-18 |
| AGENTS.md:195 | 단, core v0.5 ITEMS I-n(예: I-22 진단) 구현에 목록 밖 의존성이 필요하면 예외(core D-12)이고, | 단, core ITEMS I-n 구현에 목록 밖 의존성이 필요하면 예외(core v0.6 D-9)이고, | D-9, I-6(진단 없앰) |
| AGENTS.md:240 | `spec/` 수정(원본은 workbench-gpui) | `spec/` 수정(원본은 core `D:\projects\workbench-core\spec\`) | D-9 |

- 네 규칙(5·6·8·11줄)의 본문은 그대로다. 11줄은 괄호만 바꿨다.
- 그대로 둔 것: 20줄 "gpui AGENTS.md를 들여왔다"(출처 이력), 42줄 "v0.3 번호는 쓰지 않는다(gpui와 버전 번호를 맞춤)"(버전 이력), 49줄 gpui 출발 문서 경로(읽기만 하는 참조). "두 갈래는 같다"를 전제로 한 문장이 아니라서 두었다.
- 메모(AGENTS.md:77): v0.5 I-6·I-14가 정한 창 크기와 글꼴 값에 붙어 있던 이름 있는 예외가 없어졌다. 이 값들은 이미 구현되어 있고 core D-8(지금 동작 유지)이 덮는다. 다만 이 줄만 읽으면 그 값들이 toml에 없다는 사실이 보이지 않는다. 다시 적을지는 core-leader가 정한다.

### specs/v0.6

| 파일 | 원래 | 고친 것 | 근거 |
|---|---|---|---|
| INTENT.md 제외 범위 | 새 파일 형식 기능: 미정 | 새 파일 형식 기능을 제외 범위로 옮김 | 사용자 2026-11-10, core D-9 |
| INTENT.md 제외 범위 | `spec/` 원본 미정 | 원본은 core `spec/`, 이 레포는 복사본 | 사용자 2026-11-10, core D-9 |
| DECISIONS.md | 따르는 core 결정 D-1~D-8 / 미결 사항 넷 | D-9 줄을 더함 / 미결 사항 "없음."과 정해진 경위 한 줄 | 사용자 2026-11-10, core D-9 |
| HERDR-SETUP.md 1장 | Sonnet 대체: 미정 | 대체 모델 없음, 한도가 바닥나면 [BLOCKED] | 사용자 2026-11-10, core D-9 |
| HERDR-SETUP.md 4장 | `docs/BUILD.md` 작성자 미정 | coder가 쓰고 checker가 검토 | 사용자 2026-11-10, core D-9·ORDER-01-R1 2장 |
| HERDR-SETUP.md 5.5 | v0.6 위임: 미정 | v0.6에도 걸림 | 사용자 2026-11-10, core D-9 |
| PROGRESS.md | — | W-02 항목(leader `diff -rq` 결과 포함) | — |

상태 줄은 모두 "초안"이다.

## 바꾼 파일
- `INTENT.md`, `AGENTS.md`, `specs/v0.6/INTENT.md`·`DECISIONS.md`·`HERDR-SETUP.md`·`PROGRESS.md`(6 files, +35 −30), 이 보고 파일
- 커밋: `b41c420`(문서 변경). 이 보고는 `c26552c`. push 안 함.

## 검토
- checker C-02: [PASS], 다섯 항목 모두 지적 없음. checker는 `git grep`이 checker 설정 allow 목록에 없어 두 파일을 직접 읽어 확인했고, leader가 같은 grep을 돌려 출력 없음을 확인했다(위 1번).
- 확인 내용: AGENTS.md:194의 I-17·I-18 codicon 예외가 core ITEMS에 있음, INTENT의 Settings·Extensions 유지가 I-7·I-9와 맞음, 네 규칙 본문 그대로(11줄은 괄호만).
- AGENTS.md에 남은 `gpui`·`v0.5`는 이력·참조뿐이다: 20줄(gpui AGENTS.md에서 들여온 이력), 40줄(동결된 갈래), 42줄(버전 이력), 49줄(gpui 출발 문서 경로), 11줄(카드가 정한 "core v0.5 D-7, v0.6 D-1").
- 남은 지적: 없음.

## 미정
- AGENTS.md:77 메모(writer): v0.5 I-6(창 1440×852·최소 360×240)·I-14(글꼴 표) 값의 이름 있는 예외를 "core ITEMS가 직접 정한 값은 예외(core v0.6 D-9)"로 줄였다. 값은 이미 구현되어 있고 core D-8(지금 동작 유지)이 덮지만, 이 줄만 보면 그 값들이 `spec/zed-metrics.toml`에 없다는 것이 보이지 않는다. 다시 적을지 → core-leader
- 루트 INTENT 변경은 이 레포의 기준점이다. 위 표의 문장을 사용자가 확인해야 한다 → 사용자

## BLOCKED
- 없음
