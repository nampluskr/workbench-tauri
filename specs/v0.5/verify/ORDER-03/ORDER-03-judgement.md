# ORDER-03 (I-14 · I-7 · I-8 · I-13) V2·V3 측정 및 판정

- 측정 일시: 2026-11-07
- 측정 조건: 데스크톱 주 모니터 1920×1080 100% (DPI 96), 창 클라이언트 크기 1440×852
- 대상 문서: `specs/v0.5/SPEC.md`
- 적용 테마: Tauri Catppuccin Mocha / Zed One Dark (카드 조건: 색 판정 제외, core-leader 질의 중)
- 입력 자료:
  - Tauri CDP 덤프: `specs/v0.5/verify/ORDER-03/tauri-dump.json` (PID 43784)
  - Tauri 캡처: `tauri-I8-I13-spec-md.png`, `tauri-I13-cursor-wrapped.png`, `tauri-preview.png`, `tauri-I7-split.png`
  - Zed 캡처: `zed-spec-md-window.png`, `zed-I13-cursor-wrapped-window.png`, `zed-I7-split-window.png`
- 상위 지침: `D:\projects\workbench-core\specs\v0.5\orders\ORDER-03.md` 3.1~3.5, `specs/v0.5/SPEC.md` R-7·R-8·R-13·R-14

---

## 1. 종합 판정 요약

| 항목 | 요구 내용 | 기대값 (Zed 기준) | 측정값 (Tauri) | 판정 |
|---|---|---|---|---|
| **I-14 UI 글꼴** | UI 전체 글꼴·크기·굵기·합자 | IBM Plex Sans, 16px (rem 기준), 400, `"calt" 0` | `"IBM Plex Sans", "Malgun Gothic", sans-serif`, 16px, 400, `"calt" 0` | **통과 (PASS)** |
| **I-14 에디터 글꼴** | 버퍼 글꼴·크기·굵기·줄높이 | Lilex, 15px, 400, 1.618 (24.27px) | `Lilex, "Malgun Gothic", monospace`, 15px, 400, line-height 24.27px, calt 분리(normal) | **통과 (PASS)** |
| **I-14 미리보기 본문** | 본문 UI 글꼴, 제목 굵기 600 | UI 글꼴 상속, 16px, 제목 굵기 600 | `"IBM Plex Sans", ...`, 본문 16px/400/24px, h1(28px)/h2(22.4px) font-weight 600 | **통과 (PASS)** |
| **I-14 미리보기 코드 블록** | 코드 블록 에디터 글꼴 | Lilex, 15px, 400, 1.618 | SPEC.md 내 코드 블록(`pre`) 미존재로 DOM 미생성. inline code는 Lilex/14px 확인 | **미측정** |
| **I-14 한글 글꼴** | 본문 한글 고딕 계열(Malgun Gothic) | `Malgun Gothic` (맑은 고딕) | CSS.getPlatformFontsForNode: Lilex(57 glyph) + Malgun Gothic(16 glyph) | **통과 (PASS)** |
| **I-14 줄 번호 열 폭** | 줄 번호 열 폭 비교 | Zed 실측 약 64px | Tauri CDP 실측 99px (11ch: 4+3+4ch) | **불일치** (Zed와 다른 점) |
| **I-14 1번 줄 위 여백** | 1번 줄 상단 여백 비교 | 툴바 직하단 시작 (빈 줄 없음) | `firstLineTop` 100px === `scrollerTop` 100px (여백 0px) | **통과 (PASS)** |
| **I-7 편집 영역 경계** | pane 분할 경계 단일선·직각 모서리 | 1px 단일 분할선, 모서리 radius 0px | 1px 단일 경계선, `border: 0px`, `radius: 0px` | **통과 (PASS)** |
| **I-8 자동 줄바꿈** | 마크다운 긴 줄 자동 줄바꿈, 가로스크롤 부재 | 편집 폭 줄바꿈, 가로 스크롤 없음 | 3번 줄 3행 줄바꿈, `scrollWidth` 885px === `clientWidth` 885px | **통과 (PASS)** |
| **I-13 줄 강조** | 줄바꿈된 줄 전체 배경 및 줄 번호 강조 | 접힌 행 전체 배경 강조 + 줄 번호 강조 | 3행 전체 높이 72.8px 배경 강조 (`rgba(205,214,244,0.07)`), 번호 `3` 강조 | **통과 (PASS)** |

---

## 2. 항목별 상세 측정 데이터 및 근거

### 2.1 I-14 글꼴 4자리 값 (CDP computed)
- **UI (`body`, `.title-bar`, `.status-bar`)**:
  - `font-family`: `"\"IBM Plex Sans\", \"Malgun Gothic\", sans-serif"`
  - `font-size`: `16px` (rem 기준값, `.project-name`은 토큰에 따라 `14px`)
  - `font-weight`: `400`
  - `font-feature-settings`: `"\"calt\" 0"`
- **에디터 본문 (`.cm-editor`, `.cm-scroller`, `.cm-content`, `.cm-line`, `.cm-gutters`)**:
  - `font-family`: `Lilex, "Malgun Gothic", monospace`
  - `font-size`: `15px`
  - `font-weight`: `400`
  - `line-height`: `24.27px` (15px × 1.618 = 24.27px, `editor.line_height.comfortable_multiplier`)
  - `font-feature-settings`: `normal` (UI의 `calt 0`이 에디터로 전파되지 않음)
- **미리보기 본문 (`.markdown-body`, `p`, `h1`, `h2`)**:
  - 본문: `"IBM Plex Sans", ...`, `16px`, `400`, `line-height: 24px` (16px × 1.5)
  - 제목 h1: `28px`, `font-weight: 600`, `line-height: 35px`
  - 제목 h2: `22.4px`, `font-weight: 600`, `line-height: 28px`
- **미리보기 코드 블록 (`pre`, `pre code`)**:
  - `tauri-dump.json` 상 `pre`: `"missing": true`. 대상 파일인 `SPEC.md`에 fenced code block이 없어 DOM에 요소가 생성되지 않아 측정 불가.
  - 단, inline `code`는 `Lilex, "Malgun Gothic", monospace`, `14px`, `400`, `line-height: 21px`로 적용됨 확인.

### 2.2 I-14 한글 렌더링 폰트 (CSS.getPlatformFontsForNode)
- **에디터 본문 한글 라인 (`.cm-line[data-o3=hangul]` / SPEC.md 1번 줄)**:
  - `Lilex` (`Lilex-Regular`, 커스텀 글꼴): 57 glyphs (영문, 숫자, 기호)
  - `Malgun Gothic` (`MalgunGothic`, 시스템 글꼴): 16 glyphs (한글 "버전: 작성일: 상태: 확정 사용자 위")
- **미리보기 본문 (`.markdown-body p`)**:
  - `IBM Plex Sans` (`IBMPlexSans`): 55 glyphs
  - `Malgun Gothic` (`MalgunGothic`): 16 glyphs
- **판정**: 한글이 굴림체로 폴백되지 않고 Zed의 Windows DirectWrite 결과와 일치하는 `Malgun Gothic`으로 정확히 렌더링됨.

### 2.3 I-14 줄 번호 열 폭 및 1번 줄 상단 여백
- **줄 번호 열 폭 (Gutter Width)**:
  - Tauri: CDP 측정값 **99px**. (CodeMirror `editor/extensions.ts`의 E-002 4자리 + E-003 좌 3ch + E-004 우 4ch = 11ch × Lilex 15px '0'폭 9px = 99px).
  - Zed: `zed-spec-md-window.png` 실측 약 **64px** (약 7ch).
  - 차이: Tauri가 약 35px 더 넓음. Lilex 글꼴 적용 후에도 E-002~E-004 고정 배분으로 인해 Zed와의 열 폭 차이는 유지됨 (ORDER-03 3.1에 따라 Zed와 다른 점으로 보고).
- **1번 줄 위 여백**:
  - Tauri: `firstLineTop` 100px, `scrollerTop` 100px (차이 **0px**). 툴바 직하단에 1번 줄이 즉시 시작됨.
  - Zed: `zed-spec-md-window.png`에서 툴바 하단에 1번 줄이 즉시 위치함.
  - 판정: 불필요한 빈 줄 여백 없음 확인 (통과).

### 2.4 I-7 편집 영역 경계 및 모서리
- Tauri CDP: `pane_borders` 측정 결과 `border: "0px none"`, `radius: "0px"`, `parentRadius: "0px"`.
- 분할선: 좌우 pane 사이 1px 단일 분할선 (`pane.split_line_thickness`).
- 캡처 대조: `tauri-I7-split.png`와 `zed-I7-split-window.png` 모두 분할 pane의 모서리가 직각(radius 0px)이며 이중 테두리 없이 1px 단일 경계선으로 일치함.

### 2.5 I-8 마크다운 자동 줄바꿈
- Tauri CDP: `scrollWidth: 885px`, `clientWidth: 885px` (가로 오버플로 0px, 가로 스크롤바 없음).
- 캡처 대조: `SPEC.md` 3번 줄 긴 문장이 편집 폭(885px) 내에서 3개 시각적 행으로 자동 줄바꿈됨 (`tauri-I8-I13-spec-md.png`). Zed 역시 편집 폭에 맞춰 soft wrap 적용됨 (`zed-spec-md-window.png`).

### 2.6 I-13 줄바꿈된 줄 전체 강조 및 줄 번호 강조
- Tauri CDP: 3번 줄 클릭 시 `cursor_wrapped` 높이 `72.796875px`, `active_line.activeLineHeight: 72.796875px` (줄 높이 24.27px × 3행 = 약 72.8px).
- 배경 및 거터:
  - `bg`: `rgba(205, 214, 244, 0.07)` (3행 전체를 덮는 단일 배경 덩어리)
  - `gutterBg`: `rgba(205, 214, 244, 0.07)` (거터 역시 3행 높이만큼 강조)
  - `gutterColor`: `rgb(203, 166, 247)` (Mauve 번호 강조)
- 캡처 대조: `tauri-I13-cursor-wrapped.png`와 `zed-I13-cursor-wrapped-window.png` 대조 시 줄바꿈된 행 전체와 해당 줄 번호가 한 덩어리로 강조되는 동작이 Zed와 완전히 일치함.
