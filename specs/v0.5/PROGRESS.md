> 버전: v0.5 · 작성일: 2026-11-06 · 상태: 초안
>
> 실제로 한 일과 검증 결과를 적는다. Phase 순서는 `PLAN.md`에, 요구와 판정 방법은 `SPEC.md`에, 에이전트 운영은 `HERDR-SETUP.md`에, core 보고는 `specs/v0.5/reports/`에 있다.

# PROGRESS — workbench-tauri v0.5

## Phase별 진행

### Phase 1 — 갈래 준비

- **W-01 v0.4 종료 기록** (2026-11-06)
  - 무엇을 했나: ORDER-01 3.0대로 `specs/v0.4/PROGRESS.md` "버전 종료"에 사용자 종료 판단을 그대로 옮기고 남은 것(V4 목록 16항목, 미정)을 적었다. `specs/v0.4/PLAN.md` 진행 현황 Phase 3 커밋 칸을 `72bdaa7`로 채웠다.
  - 결과: v0.4 두 파일의 해당 절만 바뀌었다. v0.4 다른 파일과 절은 그대로다.
  - 검증: V0. `git log --oneline -1 72bdaa7`이 `v0.4 Phase 3: 임시·핀 탭, 분할, 탭 드래그, 마크다운 미리보기 (R-8~R-11, R-14)`였다. 문서만 바뀌어 명령은 실행하지 않았다.
  - 특이사항: 커밋과 태그 `v0.4`는 tauri-leader가 한다(ORDER-01 3.0).
- **W-01 v0.5 문서 여섯** (2026-11-06)
  - 무엇을 했나: `specs/v0.5/`에 INTENT·DECISIONS·SPEC·PLAN·HERDR-SETUP·PROGRESS를 상태 "초안"으로 썼다(ORDER-01 3.1~3.3).
  - 결과: SPEC은 I-1~I-23을 R-1~R-23(같은 번호)으로 옮기고 판정 방법은 ITEMS 그대로다. PLAN은 core Phase 1~12와 번호를 같게 두고 대응 표를 넣었다. DECISIONS의 갈래 결정은 없음이다. HERDR-SETUP에 리더 결정(카드·보고 파일, 카드 ID)을 적었다.
  - 검증: V0. 문서만 바뀌어 명령은 실행하지 않았다.
  - 특이사항: 루트 `INTENT.md` "다루지 않는 것"(설정 UI 화면, 프로젝트 전체 검색)과 I-2 Settings·I-22 검색 버튼이 부딪칠 수 있다. 혼자 맞추지 않고 SPEC R-2·R-22에 미정으로 두었다.
- **W-01 루트 AGENTS.md** (2026-11-06)
  - 무엇을 했나: 레포 규칙 "HERDR 구성은…" 줄을 core D-2 구성으로 고치고, core D-7 줄을 더했다. 0장·1장·3A·8장의 `specs/v0.4/` 경로와 역할 이름을 v0.5와 D-2 이름(tauri-leader·writer·coder·checker)에 맞췄다.
  - 결과: "사람이 정하고 묻는다", "지난 버전 폴더 불변", "Zed 코드 복사 금지"는 바꾸지 않았다.
  - 검증: V0. 문서만 바뀌어 명령은 실행하지 않았다.
  - 특이사항: 없음.
- **C-01 검토 결과와 v0.4 종료 커밋** (2026-11-06)
  - 무엇을 했나: tauri-checker(agy)가 C-01로 ORDER-01 3.4의 W-01 산출물을 검토했다. tauri-leader가 v0.4 종료 기록을 커밋하고 태그를 붙였다.
  - 결과: C-01 판정 PASS. 항목 1~6 모두 PASS, 남은 지적 없음. v0.4 종료 커밋 `f7541ee`, 태그 `v0.4`.
  - 검증: C-01 보고 `C:\Users\nampl\AppData\Local\Temp\v05-C-01-report.md`. 커밋 해시와 태그는 tauri-leader 전달(W-01-R1).
  - 특이사항: 없음.
- **W-02 ORDER-01-R1 core ITEMS 우선: 지침 충돌 정리** (2026-11-06)
  - 무엇을 했나: 루트 `INTENT.md`·`AGENTS.md`·`docs/refs/` 지침 문서에서 core ITEMS I-1~I-23과 부딪치는 문장을 찾았다. 갈래 지침(루트 INTENT·AGENTS)의 부딪치는 문장은 지우지 않고 "단, core v0.5 ITEMS I-n은 예외(core D-12)"를 붙였다(리더 결정: 이력 보존). 루트 `AGENTS.md` 레포 규칙에 "core ITEMS 우선" 줄을 더했다. v0.5 INTENT·SPEC·PLAN·DECISIONS에서 I-2·I-22 충돌을 "미정"으로 둔 곳을 정리하고, PLAN Phase 8에 진단을 빼지 않고 막히면 `[BLOCKED]`로 남긴다고 적었다.
  - 결과: 고친 곳은 루트 `INTENT.md` 2줄(I-2·I-22), 루트 `AGENTS.md` 4곳(레포 규칙 1줄 추가, 3장 toml 기준 I-6·I-14, 5장 확장 파일 복사 I-1·I-3·I-4·I-18, 5장 의존성 목록 I-22). SPEC R-2·R-22는 ITEMS의 기대와 판정 방법대로 요구로 둔다. 위 W-01 "v0.5 문서 여섯" 특이사항의 미정은 이것으로 풀렸다. `docs/refs/`(03-tauri README 1절, refs README 1절·3절, 01-zed 04-APP-SPEC A-05·A-18.3)와 `spec/INDEX.md`의 부딪치는 문장은 고치지 않았다(카드 W-02, 원문·원본 gpui).
  - 검증: V0. 문서만 바뀌어 명령은 실행하지 않았다. `specs/v0.5/`에서 "루트 INTENT"·"부딪" 검색으로 남은 미정이 없음을 확인했다(이 PROGRESS의 지난 기록은 덧붙이기 원칙대로 그대로 둔다).
  - 특이사항: checker 검토(ORDER-01-R1 3장 6)는 아직이다.
  - 리더 결정(W-02-R1): `docs/refs/`는 `HERDR-SETUP.md` 4장 소유권(아무도 고치지 않음)대로 고치지 않고, 루트 `AGENTS.md` "core ITEMS 우선" 줄에 docs/refs/ 출발 문서(`03-tauri/README.md`·`README.md`)도 이 레포 지침에 포함됨을 밝혔다.
- **W-03 ORDER-01-R2 승인 위임** (2026-11-06)
  - 무엇을 했나: core ORDER-01-R2 2장 A대로 `HERDR-SETUP.md` 5장에 "5.5 승인 처리"를 더했다. 서브 에이전트 승인 요청은 tauri-leader가 대신 응답하고(사용자 2026-11-06, core ORDER-01-R2), 의존성 변경·HERDR 구성 변경·push는 사용자에게 묻는다. leader 판단은 출처를 달아 PROGRESS에 남기고 HERDR-DECISIONS는 두지 않는다. 자동 모드가 승인 키 입력을 막을 때의 리더 결정(승인하지 않음, 읽기 전용 결과는 `%TEMP%` 파일로, 그래도 안 되면 `[BLOCKED]`)을 적었다.
  - 결과: 5.5 절이 생겼다. 0장 구독 현황은 이미 core D-2 근거("여유", 수치 없음)라 고치지 않았다(2장 B 해당 없음). 4장 "push는 core-leader 판정 뒤 사용자가 정한다"와 5.4는 5.5와 어긋나지 않아 그대로 두었다.
  - 검증: V0. 문서만 바뀌어 명령은 실행하지 않았다.
  - 특이사항: 2장 C·D는 gpui만 해당한다(tauri 해당 없음).

## 사용자 요청 작업

없음.

## 버전 종료

- 사용자 종료 판단: 진행 중.
- 남은 것: 진행 중.
