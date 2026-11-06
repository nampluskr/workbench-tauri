> 버전: v0.4 · 작성일: 2026-11-06 · 상태: 확정 (2026-11-06)
>
> Phase 순서와 Phase마다 무엇이 되면 끝인지를 담는다. 목적과 범위는 `INTENT.md`에, 설계 결정은 `DECISIONS.md`에, 요구와 판정 방법은 `SPEC.md`에, 에이전트 배정은 `HERDR-SETUP.md`에 있다. 실제로 한 일과 검증 결과는 `PROGRESS.md`에 기록한다.

# PLAN — workbench-tauri v0.4

## 읽는 법과 이 순서에 걸린 규칙

**번호 표기**
- `R-n`은 v0.4 `SPEC.md`의 요구 번호이고, `D-n`은 v0.4 `DECISIONS.md`의 결정 번호다. "INTENT 결정 n"은 v0.4 INTENT "결정 기록"의 번호다. 지난 버전 번호는 `v0.2 R-n`처럼 쓴다.
- `03-tauri R-nn`은 `docs/refs/03-tauri/README.md` 5절의 조사 항목이다. 어느 요구에서 푸는지는 SPEC 공통 판정 방식의 표에 있다.
- 수치는 `spec/zed-metrics.toml`의 항목 ID로만 적는다.

**역할**
- 이 문서에는 역할 이름만 적는다: `leader`, `writer`, `check`, 구현 담당, V3 측정 담당. 모델과 effort 배정은 `HERDR-SETUP.md`가 정한다.

**Phase 순서의 이유**
- 순서는 gpui v0.4와 같은 정리 → 일치 → 기능이다(gpui D-2). gpui의 Phase 0(기준선과 새 화면 스펙)은 두지 않는다. 회귀 대조를 하지 않고(INTENT 결정 10), 새 화면 수치는 이미 `spec/`에 있다(INTENT 범위).
- Phase 1이 정리(clippy)와 일치(에디터 2건, 스펙 ID 없는 값)를 함께 한다. clippy는 코어만, 에디터 2건과 스펙 ID 값은 프런트엔드만 바꿔 파일이 겹치지 않는다. clippy만으로는 V3가 없어 Phase를 따로 두면 V3 없는 Phase 끝 절차만 한 번 늘어난다.
- Phase 1이 기능보다 앞이다. 이후 카드가 clippy `-D warnings` 0건 상태에서 시작하고(gpui PLAN과 같은 이유), 새 탭 화면이 맞춰진 편집기 위에 올라간다.
- Phase 2(탭 편집·저장)가 Phase 3(탭 기능)보다 앞이다. 미리보기 탭 승격, 분할의 같은 파일 두 뷰, 마크다운 실시간 반영이 수정한 버퍼를 다루므로 수정 판정·저장 질문·충돌 표시가 먼저 있어야 한다(gpui PLAN과 같은 이유).
- 측정 전용 Phase나 "나중을 위한" 뼈대를 만드는 Phase는 두지 않는다(루트 `AGENTS.md` 4.2).

**Phase 안의 작업**
- `leader`가 작업 카드를 herdr 프롬프트로 주고, 카드마다 검증 수준을 지정한다(루트 `AGENTS.md` 3A).
- 카드 단위에서는 V0~V2만 한다. V3 실측은 Phase 끝에 한 번으로 묶는다(3A.3). 대상은 그 Phase에 대응하는 요구의 V3 항목과, 완료 보고에 쌓인 "실측 필요" 항목이다. 다시 잴 때는 불일치 항목만 잰다(3A.4).
- SPEC이 "PLAN 카드에 적고"라고 한 항목별 기대 동작과 고정 목록은 그 Phase의 첫 카드에서 PROGRESS에 고정한다: R-8·R-9·R-10의 항목 ID별 기대 동작, R-13의 요청 대상 목록, R-14의 ☰ 메뉴 행 목록.
- 프런트엔드와 코어에 걸치는 카드는 `leader`가 명령 경계(`invoke` 이름·인자·반환, 이벤트 이름)를 카드에 적는다(`HERDR-SETUP.md` 4장).

**의존성**
- 의존성은 처음 쓰는 Phase에서 설치한다. 버전은 정확히 고정하고 lock 파일을 함께 올린다(D-2, SPEC 공통 판정 방식).
  - Phase 2: `encoding_rs`(D-2). 설치할 때 crates.io 최신 안정판으로 고정하고 그 버전을 `DECISIONS.md` D-2 표에 적는다(`writer`).
  - Phase 3: `markdown-it` 15.0.3, `dompurify` 3.4.17(D-2).
- `markdown-it`의 타입은 레포의 작은 `.d.ts`로 둔다(D-2). 새 의존성을 더하지 않는다.
- capability·CSP는 바꾸지 않는다. 외부 링크는 v0.2의 opener 권한을 쓴다(D-10, SPEC R-11).

**모든 Phase는 끝날 때 아래 순서를 밟는다.**
1. V3 측정 담당이 V3 실측을 하고, 결과를 `specs/v0.4/verify/`에 남긴다(루트 `AGENTS.md` 3A.4).
2. `check`가 그 Phase의 diff를 검토하고 전체 테스트(`npm run test`, `cargo test`)와 `cargo clippy -- -D warnings`를 1회 실행한다(3A.5). Solid 반응성 함정(props 구조 분해 등)과 측정 전용 코드가 없는지를 검토 항목에 넣는다(v0.2 PLAN과 같다).
3. `writer`가 `PROGRESS.md`에 무엇을·결과·검증을 기록한다. 측정으로 판단할 수 없는 항목은 PROGRESS의 V4 목록에 쌓는다.
4. `leader`가 커밋하고 push한다(사용자 위임 2026-11-06, v0.2와 같음).

**V4 사용자 확인은 버전 끝에 한꺼번에 받는다**(INTENT 결정 12, 루트 `AGENTS.md` 3A.1). Phase마다 쌓은 V4 목록을 마지막 Phase가 끝난 뒤 `leader`가 사용자에게 한 번에 올리고, `writer`가 결과를 PROGRESS에 적는다.

**Phase를 마치는 조건**
- 대응 R-n마다 다음 둘 중 하나여야 한다.
  - SPEC의 판정 방법대로 충족이다.
  - 사용자가 그 R-n을 범위에서 빼거나 다음 버전으로 넘기기로 정했고, 그 결정이 PROGRESS에 있다.
- 원문에 통과 기준이 없어 측정값 기록으로 충족인 항목(SPEC 공통 판정 방식)은 그 값이 PROGRESS에 있다.
- 검토나 검증에서 해결하지 못한 실패가 남으면 다음 Phase를 시작하지 않고 사용자에게 올린다(v0.2 PLAN과 같다).

**작업을 끝낼 때마다 `PROGRESS.md`에 기록한다(루트 `AGENTS.md`).** 계획 밖 작업은 사용자 요청 작업으로 적는다.

---

## Phase 1 — 정리와 일치: clippy, 편집기 커서 폭·열 선택, 스펙 ID 없는 값

**목적** — 코어의 clippy 경고를 0건으로 만들고, 편집기의 커서 폭과 Ctrl+Shift 끌기 열 선택을 Zed 값에 맞춘다. v0.2에서 스펙 ID 없이 기본값으로 둔 값은 원문 근거가 있는 것만 gpui에 toml ID를 요청하고, ID가 생긴 것만 그 값으로 바꾼다.

**대응** — `R-1` · `R-12` · `R-13` · `D-11` · `D-12` · INTENT 결정 2·4·5·6

**완료 조건**
- Phase 첫 카드에서 clippy 기준선(경고 수)과 R-13의 요청 대상 목록(항목, 01-zed 근거)이 PROGRESS에 고정되어 있다.
- R-13의 toml ID는 `writer`가 `leader` 승인 카드로 workbench-gpui `spec/zed-metrics.toml`에 01-zed 원문 값을 더하고, 같은 파일을 이 레포 `spec/`로 복사한다(v0.2 H-9와 같은 방식, `HERDR-DECISIONS.md` H-7). 더한 줄과 복사 기록이 PROGRESS에 있다.
- R-1, R-12, R-13이 SPEC의 판정 방법대로 충족이고, 위 "Phase를 마치는 조건"을 만족한다.
- gpui에서 ID가 생기지 않은 R-13 항목은 기본값 그대로이고, 그 사실이 PROGRESS에 있다.
- 위의 Phase 끝 순서를 마쳤다.

---

## Phase 2 — 탭 편집과 저장

**목적** — 탭 편집기의 읽기 전용을 풀고, 수정 판정·수정 점, 겹친 요청 처리, 원자적 저장, 인코딩 왕복, 닫기 저장 질문, 디스크 충돌·지워진 파일 표시와 저장 때 확인창을 Zed 규칙대로 만든다. 저장(Ctrl+S)과 탭 닫기(Ctrl+W·Ctrl+F4)의 키와 ☰ 메뉴 항목도 이 Phase에서 더한다(판정은 R-14, Phase 3).

**대응** — `R-2` · `R-3` · `R-4` · `R-5` · `R-6` · `R-7` · `D-2`(`encoding_rs`) · `D-3` · `D-4` · `D-5` · `D-6` · `D-7` · 03-tauri R-08 · R-10 · R-15 · R-24 · R-38

**완료 조건**
- `encoding_rs`가 정확한 버전으로 설치되어 있고, 그 버전이 `DECISIONS.md` D-2 표에 있다.
- R-2 ~ R-7이 SPEC의 판정 방법대로 충족이고, 위 "Phase를 마치는 조건"을 만족한다.
- R-5의 인코딩 시험 바이트(인코딩·BOM·줄 끝별) 목록이 PROGRESS에 있고, 디코딩(`node --test`)과 인코딩(`cargo test`)이 같은 시험 바이트를 쓴다.
- 03-tauri R-15 결과(`TaskDialogIndirect`로 세 버튼·사용자 문구·기본 버튼 취소·창 제목 `Warning`이 되는지)가 PROGRESS에 있다(SPEC R-6).
- R-2의 10MB 파일 입력 반영 시간이 PROGRESS에 있다(03-tauri R-10).
- D-5·D-6·SPEC R-2가 정한 `shortcut:` 주석(혼합 줄 끝 통일, `CLOSE_SAVE_WAIT_LIMIT`, 수정 판정의 Zed 차이)의 위치가 PROGRESS에 있다.
- 위의 Phase 끝 순서를 마쳤다.

---

## Phase 3 — 탭 기능: 임시·핀 탭, 분할, 탭 드래그, 마크다운 미리보기

**목적** — I-060~I-076의 임시·일반·핀 탭과 탭 우클릭 메뉴, I-706~I-739의 재귀 분할(크기 조절·확대·같은 파일 두 뷰), 포인터 이벤트 탭 드래그, `markdown-it` + `dompurify` 마크다운 미리보기(I-077~I-086)를 만든다. v0.4 새 동작의 키맵·메뉴·툴팁을 마무리해 판정한다.

**대응** — `R-8` · `R-9` · `R-10` · `R-11` · `R-14` · `D-1` · `D-2`(`markdown-it`, `dompurify`) · `D-8` · `D-9` · `D-10` · 03-tauri R-01 · R-04 · R-09 · R-32

**완료 조건**
- `markdown-it` 15.0.3과 `dompurify` 3.4.17이 설치되어 있다. capability·CSP 변경이 없다.
- Phase 첫 카드에서 R-8·R-9·R-10의 항목 ID별 기대 동작과 R-14의 ☰ 메뉴 행 목록(02 9.2절 대조)이 PROGRESS에 고정되어 있다.
- R-8 ~ R-11, R-14가 SPEC의 판정 방법대로 충족이고, 위 "Phase를 마치는 조건"을 만족한다. Phase 2에서 더한 저장·닫기 키와 메뉴 항목도 R-14로 판정했다.
- 렌더러가 맞추지 못한 `markdown_preview` 값이 있으면 V3 불일치 목록에 항목별로 있다(SPEC R-11).
- D-10·SPEC R-11이 정한 `shortcut:` 주석(frontmatter 중첩 YAML 미지원, 미리보기 이미지 안 보임, `markdown-it` 타입 선언)의 위치가 PROGRESS에 있다.
- 위의 Phase 끝 순서를 마쳤다.
- 버전 끝 V4 목록(Phase 1~3에서 쌓은 것)을 사용자에게 올렸다.

---

## 진행 현황

| Phase | 대응 R | 상태 | 커밋 | 비고 |
| --- | --- | --- | --- | --- |
| Phase 1 — 정리와 일치 | R-1 · R-12 · R-13 | done | 3432ba5 | 없음 |
| Phase 2 — 탭 편집과 저장 | R-2 ~ R-7 | done | 60813dc | 없음 |
| Phase 3 — 탭 기능 | R-8 ~ R-11 · R-14 | done | - | 없음 |

- 상태: todo | doing | done
