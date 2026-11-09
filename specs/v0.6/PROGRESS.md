> 버전: v0.6 · 작성일: 2026-11-10 · 상태: 초안
>
> 실제로 한 일과 검증 결과를 적는다. Phase 순서는 `PLAN.md`에, 요구와 판정 방법은 `SPEC.md`에, 에이전트 운영은 `HERDR-SETUP.md`에, core 보고는 `specs/v0.6/reports/`에 있다.

# PROGRESS — workbench-tauri v0.6

## Phase별 진행

### Phase 1 — tauri 준비

- **에이전트 환경** (2026-11-10, tauri-leader)
  - 무엇을 했나: workspace `wV`에 탭 셋(docs `wV:t2`, impl `wV:t3`, check `wV:t4`)을 만들고 control `wV:t1`과 함께 탭 배치를 control·docs·impl·check로 두었다. 서브 에이전트 셋(`tauri-writer` `wV:p2`, `tauri-coder` `wV:p3`, `tauri-checker` `wV:p4`)을 `HERDR-SETUP.md` 1장 명령으로 시작하고 역할만 확인시켰다.
  - 결과: `herdr agent list`에 `tauri-leader`(claude, `wV:p1`), `tauri-writer`(claude, `wV:p2`), `tauri-coder`(codex, `wV:p3`), `tauri-checker`(agy, `wV:p4`)가 있고, `herdr tab list`의 `wV` 탭 이름이 control·docs·impl·check다(tauri-writer 확인 2026-11-10). worktree 없음. v0.5 pane은 남아 있지 않아 닫은 pane은 없다.
  - 검증: 위 두 명령 출력. 모델·effort는 `herdr agent list`에 나오지 않아 실행 명령 기준이다.
  - 특이사항: 없음.
- **W-01 v0.6 문서 여섯** (2026-11-10)
  - 무엇을 했나: `specs/v0.6/`에 INTENT·DECISIONS·SPEC·PLAN·HERDR-SETUP·PROGRESS를 상태 "초안"으로 썼다(ORDER-01 3.1~3.3).
  - 결과: SPEC은 I-1~I-20을 R-1~R-20(같은 번호)으로 옮기고 판정 방법은 ITEMS 그대로다. C-1~C-9는 옮기지 않았다. PLAN은 core Phase 1~10과 번호를 같게 두고 대응 표, core D-5 진행 규칙, core D-8 구현 원칙을 넣었다. DECISIONS의 이 레포 결정은 없음이다. HERDR-SETUP은 ORDER-01 3.2·3.3대로 쓰고 gpui와 화면 차례를 나누던 내용을 뺐으며, v0.5 3장·5.5는 가리키기만 했다.
  - 검증: V0. 문서만 바뀌어 명령은 실행하지 않았다.
  - 특이사항: 루트 `INTENT.md`("workbench-gpui와 같아야 한다", "Zed와 같아야 한다")가 core D-1·D-6·D-7과 어긋난다. 혼자 맞추지 않고 `DECISIONS.md` 미결 사항에 두었다.
- **W-01 루트 AGENTS.md** (2026-11-10)
  - 무엇을 했나: 레포 규칙 "HERDR 구성은 core가 정한다"(core v0.6 D-4), "core ITEMS 우선"(core v0.6 ITEMS I-1~I-20), 1장 개요(gpui는 동결된 갈래, 현재 상태 v0.6 진행 중), 0장 읽을 것 경로, 카드 파일 이름(`v06-`), 3A.4·8장의 `specs/v0.6/` 경로를 고쳤다.
  - 결과: "사람이 정하고 묻는다", "지난 버전 폴더 불변", "Zed 코드 복사 금지", "자기 워크스페이스만 쓴다"와 "`spec/`의 원본은 `workbench-gpui`다" 문장은 그대로다(ORDER-01 3.1·5장).
  - 검증: V0. 문서만 바뀌어 명령은 실행하지 않았다.
  - 특이사항: 없음.
- C-01 checker 검토 [PASS], 지적 없음(보고 `C:\Users\nampl\AppData\Local\Temp\v06-C-01-report.md`) (2026-11-10)
- leader 커밋 `4fa27fc`(push 안 함), ORDER-01 보고는 `specs/v0.6/reports/ORDER-01.md` (2026-11-10)
- **W-02 tauri 지침을 core v0.6에 맞추기(ORDER-01-R1)** (2026-11-10)
  - 무엇을 했나: core D-9(사용자 2026-11-10)대로 루트 `INTENT.md`에서 gpui·Zed 원칙, 확장 설치, v0.5 ITEMS·D-12 예외 문장을 고쳤다. 루트 `AGENTS.md`에서 레포 규칙 10·11·12줄 괄호 근거, 19·40·44줄 "Zed 재현" 전제, 77·78·194·195·240줄의 v0.5 번호 예외와 `spec/` 원본을 고쳤다. `specs/v0.6/` INTENT·DECISIONS·HERDR-SETUP의 미정(새 파일 형식, `spec/` 원본, 루트 지침 넷, Codex 대체, `docs/BUILD.md` 작성자, 5.5 위임)을 반영했다.
  - 결과: 고친 문장마다 원래·고친 것·근거를 `%TEMP%\v06-W-02-report.md` 표에 적었다. 네 규칙("사람이 정하고 묻는다", "지난 버전 폴더 불변", "Zed 코드 복사 금지", "자기 워크스페이스만 쓴다") 본문은 그대로다. 상태 줄은 "초안"이다.
  - 검증: V0. 문서만 바뀌어 빌드·테스트는 실행하지 않았다. `spec/`는 tauri-leader가 `diff -rq spec D:\projects\workbench-core\spec`로 확인했다. 출력이 없었다(exit 0, 2026-11-10).
  - 특이사항: 없음.

## 사용자 요청 작업

없음.

## 버전 종료

진행 중.
