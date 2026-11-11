> 버전: v0.8 · 작성일: 2026-11-10 · 상태: 초안
>
> workbench-core v0.8 ITEMS의 I-1~I-10과 공통 결정 M-1~M-11을 어떤 Phase 순서로 반영할지 적는 I-n 대응 문서다. v0.8은 INTENT·DECISIONS·SPEC을 쓰지 않는다(v0.7과 같음, core ITEMS 머리말). 요구·결정·판정 방법은 core `specs/v0.8/ITEMS.md`의 "정한 것"·"공통 결정"과 각 카드의 "완료 기준"을, Phase 순서와 이유는 core `specs/v0.8/PLAN.md`를, 카드 공통 규칙은 core `specs/v0.8/orders/COMMON.md`를 따른다. 에이전트 운영은 `HERDR-SETUP.md`에, 실제 진행은 `PROGRESS.md`에, core 보고는 `specs/v0.8/reports/`에 있다.

# PLAN — workbench-tauri v0.8

## 읽는 법

- 요구 번호는 따로 매기지 않는다. core ITEMS의 `I-n`·`M-n`을 그대로 쓴다(R-n 없음). `G-n`은 core ITEMS의 그룹이다.
- 이 레포의 Phase 번호는 core Phase 번호와 같다. Phase n은 core 카드 `ORDER-<nn>`(두 자리)을 받아 진행하고, 같은 Phase 안의 재지시는 `ORDER-<nn>-R<n>`이다.
- 판정 방법은 core ITEMS와 카드 4절 그대로이고 여기에 옮기지 않는다.
- 한 Phase 안의 작업 카드 나눔은 `tauri-leader`가 정한다.

## Phase 대응 표

| 이 레포 Phase | core Phase (카드) | 그룹 | core 항목 |
|---|---|---|---|
| Phase 1 — v0.8 시작, 미리보기 공통과 CSV·TSV 표 | Phase 1 (ORDER-01) | G-1 · G-4 | v0.8 시작(앱 버전 0.8.0) · 미리보기 공통(M-2·M-5·M-6·M-7) · I-10 · I-7 |
| Phase 2 — asset protocol·CSP, 이미지·PDF·마크다운 이미지·SVG | Phase 2 (ORDER-02) | G-3 | M-8·M-9 실측 · I-8 · I-9 · I-3 · I-6 |
| Phase 3 — HTML 미리보기 | Phase 3 (ORDER-03) | G-3 | I-1 |
| Phase 4 — ipynb 미리보기 | Phase 4 (ORDER-04) | G-2 | I-2 |
| Phase 5 — 수식·Mermaid, Licenses, 0.8.0 release 빌드 | Phase 5 (ORDER-05) | G-5 | I-4 · I-5 · Licenses 갱신 · 0.8.0 빌드·`docs/BUILD.md` |

- 보안 설정(CSP·asset protocol·capability)은 Phase 1·4에서 바꾸지 않는다. Phase 2에서 바꾸고, Phase 3·5는 필요하면 바꾼다(core PLAN, M-8·M-9).
- 사용자 확인은 Phase 5 뒤 한 번이다(core PLAN). tauri는 V4를 하지 않는다.

### Phase 1 작업 카드

| 카드 | 할 일 | core 항목 |
|---|---|---|
| W-01 | v0.8 문서(PLAN·HERDR-SETUP·PROGRESS, `reports/`·`verify/`)와 루트 `AGENTS.md`, core 리더 이름 `leader-core` | v0.8 시작 |
| K-01 | 미리보기 대상 판별 한 곳(`.md`·`.markdown`·`.csv`·`.tsv`), 열기 방식과 화면 이름 일반화, I-10 `eye` 아이콘, I-7 CSV·TSV 표, 앱 버전 0.8.0 | v0.8 시작 · M-2 · M-5 · M-6 · M-7 · I-10 · I-7 |
| C-01 | 검토·V3 | v0.8 시작 · M-2 · M-5 · M-6 · M-7 · I-10 · I-7 |

### Phase 2 작업 카드

| 카드 | 할 일 | core 항목 |
|---|---|---|
| W-03 | 루트 `AGENTS.md` 레포 규칙 절의 v0.7 문장을 v0.8로(버전·범위만), 이 표 | ORDER-01에서 남은 것(AGENTS.md 레포 규칙) |
| K-02a | asset protocol 켜기 | M-8 |
| K-02b | 로컬 자원 CSP, I-8 이미지 보기, I-9 PDF 보기, I-3 마크다운 로컬 이미지, I-6 SVG 편집·미리보기, I-7 셀 줄바꿈 | M-8 · I-8 · I-9 · I-3 · I-6 · I-7 |
| C-03 | 검토 | M-8 · I-8 · I-9 · I-3 · I-6 · I-7 · AGENTS.md 레포 규칙 |
| C-04 | V3 판정 | M-8 · I-8 · I-9 · I-3 · I-6 · I-7 |

- 실측 3.1(a)(b)(c)(core ORDER-02)는 `tauri-leader`가 한다.

### Phase 3 작업 카드

| 카드 | 할 일 | core 항목 |
|---|---|---|
| K-03a | 보안 설정: csp·devCsp `style-src`, `dangerousDisableAssetCspModification` | M-12 · M-13 |
| K-03b | I-1 HTML 미리보기(`.html`·`.htm`, sandbox `allow-same-origin`) | I-1 · M-1 · M-5 · M-7 · M-8 · M-12 · M-13 |
| C-06 | 검토 | M-12 · M-13 · I-1 |
| C-07 | V3 판정 | I-1 |
| W-05 · W-06 | 문서 | ORDER-03 |

- K-03a는 auto mode에 막혀 `leader-core`가 처리한다.

### Phase 4 작업 카드

| 카드 | 할 일 | core 항목 |
|---|---|---|
| K-04a | I-2 ipynb 셀 미리보기(`.ipynb`, 실행 안 함, 출력 글자·그림·SVG·HTML 정화·오류, CSP 변경 없음) | I-2 · M-1 · M-5 · M-7 · M-11 |
| C-08 | 검토 | I-2 |
| C-09 | V3 판정 | I-2 |
| W-07 · W-08 | 문서 | ORDER-04 |

### Phase 5 작업 카드

| 카드 | 할 일 | core 항목 |
|---|---|---|
| K-05a | I-4 수식(KaTeX)·I-5 Mermaid(마크다운 미리보기·ipynb 마크다운 셀, `.mmd`·`.mermaid` 미리보기, `katex`·`mermaid` 의존성은 ORDER-05가 미리 허락, 처음 쓸 때 불러옴, CSP 변경 없음이 목표) | I-4 · I-5 · M-1 · M-3 · M-5 · M-7 |
| K-05b | Licenses 갱신(KaTeX·Mermaid와 앱에 묶이는 의존 패키지) | Licenses 갱신 |
| K-05c | 0.8.0 release 빌드(설치 파일) | 0.8.0 빌드 |
| C-10 | 검토 | I-4 · I-5 · Licenses 갱신 |
| C-11 | V3 판정(release exe) | I-4 · I-5 · Licenses 갱신 · 회귀 |
| W-09 | PLAN(이 표) | ORDER-05 |
| W-10 | `docs/BUILD.md`·PROGRESS | 0.8.0 빌드·`docs/BUILD.md` · ORDER-05 |

### Phase 6 작업 카드

- 사용자 확인(Phase 5 뒤) 다음에 더한 Phase다(core ORDER-06).

| 카드 | 할 일 | core 항목 |
|---|---|---|
| K-06a | I-11 HTML 미리보기 배경·글자·링크 색을 Preview 테마에 맞춤(0 특이성 기본 스타일, `color-scheme`이 Preview 테마를 따름, CSP·sandbox 그대로) | I-11 · M-1 · M-7 · M-13 |
| K-06b | 0.8.0 release 다시 빌드(설치 파일) | 0.8.0 빌드 |
| C-12 | 검토 | I-11 |
| C-13 | V3 판정(release exe) | I-11 · 회귀 |
| W-12 | PLAN(이 표) | ORDER-06 |
| W-13 | `docs/BUILD.md`·PROGRESS | 0.8.0 빌드·`docs/BUILD.md` · ORDER-06 |
