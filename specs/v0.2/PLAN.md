> 버전: v0.2 · 작성일: 2026-11-05 · 상태: 확정 (2026-11-05)
>
> Phase 순서와 Phase마다 무엇이 되면 끝인지를 담는다. 목적과 범위는 `INTENT.md`에, 설계 결정은 `DECISIONS.md`에, 요구와 판정 방법은 `SPEC.md`에, 에이전트 배정은 `HERDR-SETUP.md`에 있다. 실제로 한 일과 검증 결과는 `PROGRESS.md`에 기록한다.

# PLAN — workbench-tauri v0.2

## 읽는 법과 이 순서에 걸린 규칙

**번호 표기**
- `R-n`은 v0.2 `SPEC.md`의 요구 번호이고, `D-n`은 v0.2 `DECISIONS.md`의 결정 번호다. 지난 버전 번호는 `v0.1 D-n`처럼 쓴다.
- `03-tauri R-nn`은 `docs/refs/03-tauri/README.md` 5절의 조사 항목이다.
- 수치는 `spec/zed-metrics.toml`의 항목 ID로만 적는다(v0.1 D-1).

**역할**
- 이 문서에는 역할 이름만 적는다: `leader`, `writer`, `check`, 구현 담당, V3 측정 담당. 모델과 effort 배정은 `HERDR-SETUP.md`가 정한다.

**Phase 순서의 이유**
- Phase 1(뼈대)이 맨 앞이다. v0.1 PoC 화면을 빼고(INTENT 제외 범위) 사이드바·Dock·Pane 하나·탭 바·상태 표시줄을 L-22 이후 치수로 세워야, 그 위에 메뉴·툴팁·폴더·트리를 얹을 자리가 생긴다(SPEC R-10).
- Phase 2(키맵)가 Phase 3(메뉴·툴팁)보다 앞이다. 메뉴·툴팁의 단축키 표시와 사이드바·트리의 키가 모두 키맵 적용 결과에 기댄다(01-zed A-27.3·A-27.5). gpui v0.2 PLAN과 같은 이유다.
- Phase 4(사이드바·폴더·state.json)가 Phase 5(트리·파일 작업·탭)보다 앞이다. 트리는 활성 폴더 루트를 그리고(SPEC R-18), 시나리오 A-33.4는 폴더 둘이 등록되어야 한다(SPEC R-28).
- Phase 6(디스크 감시)은 마지막이다. 트리와 탭이 있어야 바깥 변경의 반영을 확인할 수 있다(SPEC R-25). gpui v0.2 PLAN과 같은 이유다.
- 측정 전용 Phase나 "나중을 위한" 뼈대를 만드는 Phase는 두지 않는다(v0.1 D-16, 루트 `AGENTS.md` 4.2).

**Phase 안의 작업**
- `leader`가 작업 카드를 herdr 프롬프트로 주고, 카드마다 검증 수준을 지정한다(AGENTS 3A).
- 카드 단위에서는 V0~V2만 한다. V3 실측은 Phase 끝에 한 번으로 묶는다(AGENTS 3A.3). 대상은 그 Phase에 대응하는 요구의 V3 항목과, 완료 보고에 쌓인 "실측 필요" 항목이다.
- SPEC이 "Phase를 시작할 때 PROGRESS에 고정"하라고 한 목록은 그 Phase의 첫 카드에서 고정한다. R-1의 기대 바인딩 표(Phase 2), R-8의 메뉴 항목 목록(Phase 3)이다.

**의존성**
- 의존성은 처음 쓰는 Phase에서 설치한다. 버전은 정확히 고정하고 lock 파일을 함께 올린다(SPEC 공통 판정 방식, 03-tauri R-31).
  - Phase 3: `notify` 8.2.1(D-7, `keymap.json` 감시)
  - Phase 4: `tauri-plugin-dialog` 2.8.4 + `@tauri-apps/plugin-dialog`(D-7), `windows` =0.62.2에 `Win32_Storage_FileSystem` feature(D-7, A-24.1)
  - Phase 5: `trash` 5.2.9(D-7), `windows`에 `TaskDialogIndirect`용 feature(D-7), `tauri-plugin-opener` 2.7.2 + `@tauri-apps/plugin-opener`(D-19)
- JS 플러그인 패키지 버전은 설치할 때 크레이트와 짝이 맞는 것으로 정해 PROGRESS에 적는다(D-7, D-19).
- capability는 쓰는 권한만 개별로 더한다(`AGENTS.md` 5장). 더한 권한은 PROGRESS에 적는다.

**모든 Phase는 끝날 때 아래 순서를 밟는다.**
1. V3 측정 담당이 V3 실측을 하고, 결과를 `specs/v0.2/verify/`에 남긴다(AGENTS 3A.4).
2. `check`가 그 Phase의 diff를 검토하고 전체 테스트를 1회 실행한다(AGENTS 3A.5, INTENT 결정 기록 12). Solid 반응성 함정(props 구조 분해 등)과 측정 전용 코드가 없는지를 검토 항목에 넣는다(v0.1 D-2, D-18).
3. `writer`가 `PROGRESS.md`에 무엇을·결과·검증을 기록한다.
4. `leader`가 커밋한다. Phase가 끝날 때마다 커밋한다(사용자 결정 2026-11-05). push는 사용자 승인 뒤에 한다.

**Phase를 마치는 조건**
- 대응 R-n마다 다음 둘 중 하나여야 한다.
  - SPEC의 판정 방법대로 충족이다.
  - 사용자가 그 R-n을 범위에서 빼거나 다음 버전으로 넘기기로 정했고, 그 결정이 PROGRESS에 있다.
- SPEC이 "판정 불가"로 적어도 된다고 한 사례(R-21 휴지통이 없는 드라이브, R-22 두 번째 볼륨 없음)는 그 이유가 PROGRESS에 있으면 실패가 아니다.
- 검토나 검증에서 해결하지 못한 실패가 남으면 다음 Phase를 시작하지 않고 사용자에게 올린다(v0.1 PLAN과 같은 규칙).

**작업을 끝낼 때마다 `PROGRESS.md`에 기록한다(루트 `AGENTS.md`).** 계획 밖 작업은 사용자 요청 작업으로 적는다.

---

## Phase 1 — 뼈대: v0.1 PoC 화면 정리와 L-22 이후 치수

**목적** — v0.1 PoC 화면(예제 탭, 두 Pane, 고정 아이콘)을 빼고, 사이드바·왼쪽 Dock·Pane 하나·탭 바·상태 표시줄의 뼈대를 L-22 이후 치수로 세운다. 탭 바 끝 버튼은 비활성으로 두고, UI 아이콘은 Lucide SVG를 고지와 함께 들여온다. 시작 상태는 탭 없음이다.

**대응** — `R-10` · `D-1` · `D-20`

**완료 조건**
- R-10이 SPEC의 판정 방법대로 충족이고, 위 "Phase를 마치는 조건"을 만족한다.
- v0.1 PoC 화면이 없다. 앱을 띄우면 Pane 하나에 탭이 없다(SPEC 공통 판정 방식의 시작 상태).
- Lucide SVG는 v0.2 화면에 쓰는 것만 있고 `LICENSE-LUCIDE`가 함께 있다(D-20). 들여온 아이콘 이름 목록이 PROGRESS에 있다.
- v0.1 PoC 화면과 함께 쓰이지 않게 된 코드와 테스트는 지웠고, 그 목록과 이유가 PROGRESS에 있다. 기능과 함께 지우는 테스트는 `AGENTS.md` 9장의 "테스트를 통과시키기 위한 테스트 삭제"가 아니다(리더 결정(사용자 위임 2026-11-05)).
- 이 Phase는 v0.1 PoC 화면을 빼고 뼈대를 세우는 구현 Phase다. 측정 전용 Phase가 아니라서 따로 둔다(리더 결정(사용자 위임 2026-11-05)).
- 위의 Phase 끝 순서를 마쳤다.

---

## Phase 2 — 키맵 로더·액션·컨텍스트

**목적** — 앱 내장 키맵(02 1절 키 표의 적용 결과)과 사용자 `keymap.json`(JSONC)을 v0.1 키맵 엔진에 얹고, 키맵 읽기 오류를 알림으로 보인다.

**대응** — `R-1` · `R-2` · `D-2` · `D-3` · `D-4` · `D-6` · `D-14` · `D-18`

**완료 조건**
- Phase를 시작할 때 R-1의 기대 바인딩 표와 우리가 지은 액션 이름 목록이 PROGRESS에 고정되어 있다(SPEC R-1, D-2).
- R-1, R-2가 SPEC의 판정 방법대로 충족이고, 위 "Phase를 마치는 조건"을 만족한다.
- 내장 키맵이 컨텍스트 술어 `>`·`key == value`를 쓰는지가 PROGRESS에 있다. 쓰면 엔진에 더했고 테스트가 있다(D-3).
- 위의 Phase 끝 순서를 마쳤다.

---

## Phase 3 — 툴팁·메뉴와 단축키 표시

**목적** — DOM 툴팁과 ☰ 앱 메뉴·메뉴 공통 동작을 01-zed 값에 맞추고, 메뉴·툴팁의 단축키 표시가 키맵 적용 결과와 일치하게 한다. `keymap.json`을 고치면 다시 읽어 표시를 다시 만든다.

**대응** — `R-4` · `R-5` · `R-6` · `R-7` · `R-8` · `R-9` · `D-5` · `D-7`(`notify`) · `D-13` · `D-16` · 03-tauri R-25

**완료 조건**
- Phase를 시작할 때 R-8의 메뉴 항목 목록을 02 9.2절과 대조해 PROGRESS에 고정했다. Open Folder...·Toggle Folder Sidebar·Focus Folder Sidebar처럼 동작이 Phase 4에서 생기는 항목은 그때 메뉴에 넣는다고 적었다(D-13).
- `notify` 8.2.1이 설치되어 있다.
- R-4 ~ R-9가 SPEC의 판정 방법대로 충족이고, 위 "Phase를 마치는 조건"을 만족한다. Phase 4 이후에 생기는 요소(사이드바 폴더 추가 버튼, 프로젝트 패널 항목 등)의 R-7 행은 그 요소가 생기는 Phase에서 판정한다고 PROGRESS에 적었다.
- R-5의 "화면 단축키 / 키맵 적용 결과" 대조표에 불일치가 없다.
- 위의 Phase 끝 순서를 마쳤다.

---

## Phase 4 — 사이드바 폴더 등록·선택·해제와 상태 저장

**목적** — 사이드바에 폴더를 등록·선택·해제하고, 순서 바꾸기·예외 상태·표시와 포커스 키·타이틀 바 폴더 이름을 만든다. 폴더마다 작업 문맥을 따로 두고, 등록 폴더 목록·순서·활성 폴더·사이드바 폭을 `state.json`에 A-24대로 원자적으로 저장·복원한다.

**대응** — `R-11` · `R-12` · `R-13` · `R-14` · `R-15` · `R-16` · `R-17` · `R-29` · `D-6` · `D-7`(`tauri-plugin-dialog`, `Win32_Storage_FileSystem`) · `D-8` · `D-11` · `D-14` · `D-16` · `D-18` · 03-tauri R-21

**완료 조건**
- `tauri-plugin-dialog` 2.8.4, `@tauri-apps/plugin-dialog`, `windows`의 `Win32_Storage_FileSystem` feature가 설치되어 있고, 더한 capability가 PROGRESS에 있다.
- R-11 ~ R-17, R-29가 SPEC의 판정 방법대로 충족이고, 위 "Phase를 마치는 조건"을 만족한다. 트리·탭에 기대는 판정(R-13의 폴더별 펼침·선택·탭, R-14의 해제 때 탭 닫기와 루트 항목 `Remove from Project`)은 Phase 5에서 판정한다고 PROGRESS에 적었다.
- Phase 3에서 미룬 ☰ 메뉴 항목과 R-7 행 가운데 이 Phase에서 생긴 것을 판정했다.
- `specs/v0.2/verify/`에 등록 해제 전후의 디스크 상태 비교와 재시작 전후의 `state.json`·복원 결과가 있다.
- 위의 Phase 끝 순서를 마쳤다.

---

## Phase 5 — 프로젝트 패널 트리·파일 작업·최소 탭과 시나리오

**목적** — 활성 폴더의 트리(고정 행 높이 가상 스크롤)와 누르기·키보드 동작, 최소 탭(보기 전용, html·toml 강조), 인라인 생성·이름 변경, 휴지통·영구 삭제(TaskDialog), 잘라내기·복사·붙여넣기(P3-D1·P3-D2, 실패 알림), 우클릭 메뉴(opener 포함), 자동 표시를 만든다. 큰 파일 열기와 복사·이동이 UI를 막지 않게 하고, 시나리오 A-33.2·A-33.4를 끝까지 한다.

**대응** — `R-3` · `R-18` · `R-19` · `R-20` · `R-21` · `R-22` · `R-23` · `R-24` · `R-26` · `R-27` · `R-28` · `R-30` · `D-7`(`trash`, TaskDialog feature) · `D-9` · `D-10` · `D-12` · `D-14` · `D-15` · `D-17` · `D-19` · `D-20` · 03-tauri R-08 · 03-tauri R-10 · 03-tauri R-15

**완료 조건**
- `trash` 5.2.9, `windows`의 `TaskDialogIndirect`용 feature, `tauri-plugin-opener` 2.7.2, `@tauri-apps/plugin-opener`가 설치되어 있고, 더한 capability가 PROGRESS에 있다.
- R-30의 시험 폴더 크기가 PROGRESS에 고정되어 있다(SPEC R-30). Phase 5 첫 카드에서 V3 측정 담당이 제안하고 `leader`가 정한다(리더 결정(사용자 위임 2026-11-05)).
- R-3, R-18 ~ R-24, R-26 ~ R-28, R-30이 SPEC의 판정 방법대로 충족이고, 위 "Phase를 마치는 조건"을 만족한다. Phase 4에서 미룬 R-13·R-14의 트리·탭 판정과 남은 R-7 행도 판정했다.
- 03-tauri R-15 결과(`TaskDialogIndirect`로 사용자 문구 버튼과 기본 버튼 취소가 되는지)가 PROGRESS에 있다(SPEC R-21).
- P3-D 한계를 적은 `shortcut:` 주석의 위치가 PROGRESS에 있다(D-17).
- `specs/v0.2/verify/`에 파일 작업마다 디스크 상태 비교(휴지통 포함)와 두 시나리오의 단계별 증거가 있다.
- 위의 Phase 끝 순서를 마쳤다.

---

## Phase 6 — 디스크 감시

**목적** — 활성 폴더와 열린 파일을 `notify`로 감시해, 바깥에서 생기거나 지워지거나 바뀐 것을 트리에 반영하고, 탭으로 연 파일은 다시 읽는다. 한 번의 변경에 여러 이벤트가 와도, 앱 자신의 파일 작업이 낸 이벤트가 와도 트리가 한 번에 맞게 보인다.

**대응** — `R-25` · `D-7`(`notify`) · `D-10` · 03-tauri R-24

**완료 조건**
- R-25가 SPEC의 판정 방법대로 충족이고, 위 "Phase를 마치는 조건"을 만족한다.
- R-16의 "실행 중 폴더가 사라짐"(A-16.3)을 이 Phase의 감시로 다시 확인했다.
- `specs/v0.2/verify/`에 바깥 변경마다 반영까지 걸린 시간이 있다.
- 위의 Phase 끝 순서를 마쳤다.

---

## 진행 현황

| Phase | 대응 R | 상태 | 커밋 | 비고 |
| --- | --- | --- | --- | --- |
| Phase 1 — 뼈대 | R-10 | done | - | 없음 |
| Phase 2 — 키맵 | R-1 · R-2 | todo | 미정 | 없음 |
| Phase 3 — 툴팁·메뉴 | R-4 ~ R-9 | todo | 미정 | 없음 |
| Phase 4 — 사이드바·state.json | R-11 ~ R-17 · R-29 | todo | 미정 | 없음 |
| Phase 5 — 트리·파일 작업·탭 | R-3 · R-18 ~ R-24 · R-26 ~ R-28 · R-30 | todo | 미정 | 없음 |
| Phase 6 — 디스크 감시 | R-25 | todo | 미정 | 없음 |
