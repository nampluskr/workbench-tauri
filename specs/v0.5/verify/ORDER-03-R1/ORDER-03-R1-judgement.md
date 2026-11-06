# ORDER-03-R1 실측 판정표

- 작성일: 2026-11-07
- 판정자: tauri-checker
- 대상: ORDER-03-R1 (줄 번호 열 폭과 미리보기 코드 블록 크기)
- 상위 지침: `D:\projects\workbench-core\specs\v0.5\orders\ORDER-03-R1.md`
- 측정 조건: 1920×1080 100% (DPI 96), 창 클라이언트 1440×852, 폰트 Lilex 15px(에디터)/16px(미리보기 코드)
- 테마: Zed One Dark, Tauri Catppuccin Mocha (카드 조건: 색 판정 제외)
- 입력 자료:
  - 덤프: `tauri-gutter.json`(수정 전), `tauri-after-gutter.json`(수정 후), `tauri-code-preview.json`
  - 캡처: `zed-*.png`, `tauri-*.png`, `tauri-after-*.png`, `zed-code-preview.png`, `tauri-code-preview.png`

---

## 1. 줄 번호 열 폭 및 여백 판정 (완료 기준 1)

기준: 편집기 좌측 끝(0px) 기준 잉크 픽셀 위치 측정. 허용 오차 1px 이하.

| 자릿수 / 대상 파일 | 측정 항목 | Zed 기준 | Tauri 수정 전 | Tauri 수정 후 | 차이 (Zed vs 수정 후) | 판정 |
|---|---|---|---|---|---|---|
| **4자리 이하** (`SPEC.md`, `g50.txt`, `g1200.txt`) | 숫자 잉크 오른쪽 끝 | 57px | 62px (+5px) | **57px** | 0px | **충족 (PASS)** |
| 〃 | 본문 잉크 시작 | 92px | 104px (+12px) | **92px** | 0px | **충족 (PASS)** |
| 〃 | 숫자 잉크 왼쪽 끝 | 41px | 42px | **40px** | 1px | **충족 (PASS)** |
| **5자리** (`g12000.txt`, 12000줄) | 숫자 잉크 오른쪽 끝 | 66px | 71px (+5px) | **66px** | 0px | **충족 (PASS)** |
| 〃 | 본문 잉크 시작 | 101px | 113px (+12px) | **101px** | 0px | **충족 (PASS)** |
| 〃 | 자릿수 증가 폭 | +9px | +9px | **+9px** | 0px | **충족 (PASS)** |

### CDP 덤프 대조 수치 (`tauri-after-gutter.json`)
- **패딩 적용**:
  - `numberElStyle.pl`: `"22px"` (`--editor-gutter-padding-left`)
  - `numberElStyle.pr`: `"29px"` (`--editor-gutter-padding-right`)
  - `numberElStyle.minW`: `"36px"` (최소 4자리 폭, E-002)
  - `lineStyle.pl`: `"5px"` (margin = Lilex descent, E-005)
- **4자리 거터 전체 폭**: 22px + 36px + 29px = **87px** (`gutters.width: 87px`).
  - 본문 시작 위치 = 거터 87px + descent 5px = **92px** (Zed 92px와 완전 일치).
- **5자리 거터 전체 폭**: 22px + 45px + 29px = **96px** (`gutters.width: 96px`).
  - 본문 시작 위치 = 거터 96px + descent 5px = **101px** (Zed 101px와 완전 일치).

---

## 2. 미리보기 코드 블록 크기 및 줄 높이 판정 (완료 기준 2)

대조 파일: `%TEMP%\v05-gutter\code.md` (AGENTS.md 1절 첫 코드 블록, 64자 줄 포함).

| 항목 | Zed 실측 | Tauri CDP / 실측 | 차이 | 판정 |
|---|---|---|---|---|
| **코드 글꼴** | Lilex | `Lilex, "Malgun Gothic", monospace` (383 Lilex glyphs, 17 Malgun Gothic) | 같음 | **충족 (PASS)** |
| **글자 크기 (64자 잉크 폭)** | 612px | 612px (computed: `16px`) | 0px | **충족 (PASS)** |
| **줄 높이 (평균 간격)** | 26.0px | 25.857px (computed: `25.888px` = 16px × 1.618) | 7간격 누적 합 1px 차이 | **충족 (PASS)** |

---

## 3. 완료 기준 검증 결과

1. **기준 1 (줄 번호 열 폭과 여백)**: 자릿수별(4자리 이하, 5자리) 잉크 오른쪽 끝 및 본문 시작 위치가 Zed와 0px 오차로 일치하며, 숫자 왼쪽 끝 오차도 1px 이하임. -> **충족**
2. **기준 2 (미리보기 코드 블록 글자 크기와 줄 높이)**: 64자 라인 폭 612px 동일, 글자 크기 16px 및 1.618 줄 높이(평균 25.86px vs 26.0px, 누적 1px 미만 차이)로 일치함. -> **충족**
3. **기준 3 (기존 ORDER-03 충족 항목 보존)**: I-7(단일 경계/직각), I-8(자동 줄바꿈/가로스크롤 부재), I-9(스크롤바), I-13(줄바꿈 전체 강조), I-14(UI 및 에디터 글꼴 등) 정상 유지됨. -> **충족**
