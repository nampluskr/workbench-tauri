# ORDER-04 (I-20 · R-20) V3 측정 및 판정

- 측정 일시: 2026-11-07
- 측정 조건: 데스크톱 주 모니터 1920×1080 100% (DPI 96), 창 클라이언트 크기 1440×852
- 테스트 폴더: `%TEMP%\v05-i20` (`docs\refs\paths.md`), 등록 폴더 `D:\`
- 입력 자료:
  - Tauri CDP 덤프: `specs/v0.5/verify/ORDER-04/tauri-i20.json` (PID 28896)
  - Tauri 캡처:
    - `tauri-1-sidebar-tree.png` (사이드바 `D:\`, 트리 compact `docs\refs`)
    - `tauri-2-tree-tooltip.png` (트리 경로 툴팁)
    - `tauri-3-editor.png` (편집기 본문 경로 3행)
    - `tauri-4-dialog.png` (네이티브 미저장 확인 TaskDialog)
    - `tauri-5-preview.png` (Markdown 미리보기 본문 및 코드 블록)
    - `tauri-6-drive-root.png` (타이틀 바·사이드바·트리 루트 `D:\`)
  - 정적 조사 보고: `%TEMP%\v05-K-07-report.md`
- 상위 지침 / 결정: `D:\projects\workbench-core\specs\v0.5\orders\ORDER-04.md`, `specs/v0.5/SPEC.md` R-20, core-leader 결정 (2026-11-07, core D-13)

---

## 1. 종합 판정 요약

| 구분 | 대상 수 | 기준 충족 조건 | 결과 | 판정 |
|---|---|---|---|---|
| **앱 렌더링 측정 자리** | 8개 지점 (12개 항목) | 글자에 `\`가 있고 ₩가 없으며, Rendered Fonts에 Malgun Gothic이 없고(IBM Plex Sans 또는 Lilex), 캡처에서 `\` 모양 | 12개 항목 모두 `\` 렌더링, `hasWon: false`, 캡처 `\` 확인 | **충족 (PASS)** |
| **앱 렌더링 미측정 자리** | 5개 지점 (토스트, 트리입력, 메뉴 등) | 동일한 CSS 상속 및 글꼴 변수 경로(UI 글꼴 U) 공유 확인 | `src/app.css`, `src/spec/metrics.ts` 대조 확인 | **코드 확인 (같은 글꼴 경로)** |
| **네이티브 대화 상자** | 1개 지점 측정 + 4개 지점 조사 | OS 시스템 UI 글꼴(맑은 고딕)에 의한 ₩ 표시. I-20 판정 제외 (core D-13) | HWND 0x2B0274 확인, 캡처 `tauri-4-dialog.png` | **OS 표시 (Phase 12 V4)** |
| **미구현 항목 (I-11, I-12)** | 2개 항목 | 탭 경로 툴팁(I-11) 및 경로 줄(I-12)의 현재 존재 여부 확인 | 현재 구현 없음 | **Phase 9에서 다시 본다** |
| **I-14 글꼴 유지** | UI / 버퍼 글꼴 | UI는 IBM Plex Sans, 버퍼는 Lilex로 렌더링 유지 | 덤프의 모든 자리에서 지정 커스텀 글꼴 렌더링 확인 | **유지 확인 (PASS)** |

---

## 2. 측정한 자리별 상세 판정 표

- 판정 기준:
  - 텍스트에 역슬래시(`\`)가 존재하고 원화 기호(`₩`, U+20A9)가 없어야 함 (`hasWon: false`).
  - CDP `CSS.getPlatformFontsForNode` 측정 결과(Rendered Fonts)에 시스템 한글 글꼴(`Malgun Gothic`)이 없고, 번들 글꼴(`IBM Plex Sans` 또는 `Lilex`)로 렌더링되어야 함.
  - 캡처 화면에서 시각적으로 `\` 형태로 표시되어야 함 (눈대중 판정 금지, 덤프 검증 보조).
  - 네이티브 UI는 core-leader 결정(core D-13)에 따라 "OS 표시"로 판정하고 I-20 앱 판정에서 제외.

| 번호 | 자리 (Spot) | CSS 셀렉터 | 표시 글자 (Text) | 선언 font-family | Rendered Fonts (글리프 수) | hasWon | 캡처 확인 | 판정 |
|---|---|---|---|---|---|---|---|---|
| 1 | 사이드바 등록 폴더 (`sidebar-name`) | `.sidebar-item-name, .sidebar-item-parent` | `D:\` | `"IBM Plex Sans", "Malgun Gothic", sans-serif` | IBM Plex Sans (3) | false | `tauri-1-sidebar-tree.png`, `tauri-6-drive-root.png`에서 `\` 확인 | **충족** |
| 2 | 파일 트리 compact 폴더 (`tree-compact`) | `.tree-label` | `docs\refs` | `"IBM Plex Sans", "Malgun Gothic", sans-serif` | IBM Plex Sans (9) | false | `tauri-1-sidebar-tree.png`에서 `\` 확인 | **충족** |
| 3 | 파일 트리 경로 툴팁 (`tree-tooltip`) | `.tooltip-title` | `~\AppData\Local\Temp\v05-i20\docs\refs\paths.md` | `"IBM Plex Sans", "Malgun Gothic", sans-serif` | IBM Plex Sans (47) | false | `tauri-2-tree-tooltip.png`에서 `\` 확인 | **충족** |
| 4 | 편집기 일반 텍스트 (`editor` item 1) | `.cm-line` | `Plain: C:\Users\example\notes.txt` | `Lilex, "Malgun Gothic", monospace` | Lilex (33) | false | `tauri-3-editor.png`에서 `\` 확인 | **충족** |
| 5 | 편집기 인라인 코드 (`editor` item 2) | `.cm-line` | ``Inline: `D:\projects\workbench-tauri\src``` | `Lilex, "Malgun Gothic", monospace` | Lilex (41) | false | `tauri-3-editor.png`에서 `\` 확인 | **충족** |
| 6 | 편집기 코드 블록 (`editor` item 3) | `.cm-line` | `C:\Windows\System32\drivers\etc\hosts` | `Lilex, "Malgun Gothic", monospace` | Lilex (37) | false | `tauri-3-editor.png`에서 `\` 확인 | **충족** |
| 7 | 미리보기 일반 본문 (`preview-text` item 1) | `.markdown-body p` | `Plain: C:\Users\example\notes.txt` | `"IBM Plex Sans", "Malgun Gothic", sans-serif` | IBM Plex Sans (33) | false | `tauri-5-preview.png`에서 `\` 확인 | **충족** |
| 8 | 미리보기 인라인 본문 (`preview-text` item 2) | `.markdown-body p` | `Inline: D:\projects\workbench-tauri\src` | `"IBM Plex Sans", "Malgun Gothic", sans-serif` | Lilex (31), IBM Plex Sans (8) | false | `tauri-5-preview.png`에서 `\` 확인 | **충족** |
| 9 | 미리보기 인라인 코드 (`preview-code` item 1) | `.markdown-body code` | `D:\projects\workbench-tauri\src` | `Lilex, "Malgun Gothic", monospace` | Lilex (31) | false | `tauri-5-preview.png`에서 `\` 확인 | **충족** |
| 10 | 미리보기 코드 블록 (`preview-code` item 2) | `.markdown-body code` | `C:\Windows\System32\drivers\etc\hosts\n` | `Lilex, "Malgun Gothic", monospace` | Lilex (37) | false | `tauri-5-preview.png`에서 `\` 확인 | **충족** |
| 11 | 타이틀 바 프로젝트 이름 (`titlebar`) | `.project-name` | `D:\` | `"IBM Plex Sans", "Malgun Gothic", sans-serif` | IBM Plex Sans (3) | false | `tauri-6-drive-root.png`에서 `\` 확인 | **충족** |
| 12 | 파일 트리 루트 행 (`tree-root`) | `.tree-label` | `D:\` | `"IBM Plex Sans", "Malgun Gothic", sans-serif` | IBM Plex Sans (3) | false | `tauri-6-drive-root.png`에서 `\` 확인 | **충족** |
| 13 | 미저장 확인 대화 상자 (`dialog`) | TaskDialog (HWND `0x2B0274`, rect 769,393,1135,576) | ``docs₩refs₩paths.md` contains unsaved edits. Do you want to save it?` | OS 시스템 UI 글꼴 (맑은 고딕) | Malgun Gothic | true (시각적 ₩) | `tauri-4-dialog.png`에서 ₩ 확인 | **OS 표시** |

---

## 3. 미측정 자리 정적 조사 및 코드 확인

K-07 정적 조사 보고(`%TEMP%\v05-K-07-report.md`) 목록 중 이번 측정에 포함되지 않은 자리들의 글꼴 적용 경로 대조 결과:

### 3.1 앱 렌더링 영역 (WebView 내부)
1. **트리 새 파일·새 폴더·이름변경 입력란 (`input.tree-input`)**:
   - 코드 위치: `src/shell/ProjectTree.tsx:25, :34`
   - CSS 경로: `src/app.css:425~436` (`input.tree-input`에 font 미지정), `src/app.css:60` (`button, input, select, textarea { font-family: inherit; }`), `src/app.css:55` (`body { font-family: var(--ui-font-family); }`)
   - 글꼴 변수: `src/spec/metrics.ts:215, :233` (`--ui-font-family: "IBM Plex Sans", "Malgun Gothic", sans-serif`)
   - 판정: **코드 확인(같은 글꼴 경로, UI 글꼴 U)**
2. **저장 실패 토스트 및 일반 오류·알림 토스트 (`.toast > div`)**:
   - 코드 위치: `src/workspace/context.ts:508`, `src/workspace/closing.ts:20~25`, `src/workspace/store.ts:57`
   - CSS 경로: `src/shell/toast.ts:3~6`, `src/app.css:279` (`.toast` 및 하위 요소에 font 재지정 없음)
   - 글꼴 변수: body의 `var(--ui-font-family)` 상속
   - 판정: **코드 확인(같은 글꼴 경로, UI 글꼴 U)**
3. **앱 메뉴 및 사이드바/트리 컨텍스트 메뉴 (`.menu-item`, `.menu-name`, `.menu-shortcut`)**:
   - 코드 위치: `src/shell/app-menus.ts:26`, `src/shell/Sidebar.tsx:36`, `src/shell/tree-menu.ts:26`
   - CSS 경로: `src/app.css:336, :360, :373`
   - 글꼴 변수: body의 `var(--ui-font-family)` 상속
   - 판정: **코드 확인(같은 글꼴 경로, UI 글꼴 U)**
4. **기타 앱 툴팁 (`.tooltip-title`, `.tooltip-meta`, `.tooltip-key`)**:
   - 코드 위치: `src/shell/Icon.tsx:26`, `src/App.tsx:27`, `src/shell/Pane.tsx:343`
   - CSS 경로: `src/app.css:310, :317~320`
   - 글꼴 변수: body의 `var(--ui-font-family)` 상속
   - 판정: **코드 확인(같은 글꼴 경로, UI 글꼴 U)**

### 3.2 OS 네이티브 렌더링 영역
1. **여러 미저장 파일 닫기 확인 (`src/workspace/closing.ts:65`)**:
   - 네이티브 TaskDialog의 content 영역에 상대 경로 나열 (`src-tauri/src/files.rs:107`)
   - 판정: **OS 표시** (core D-13, Phase 12 V4)
2. **닫기 중 저장 실패 확인 (`src/workspace/closing.ts:72`)**:
   - 네이티브 TaskDialog의 main instruction에 실패 경로 출력
   - 판정: **OS 표시** (core D-13, Phase 12 V4)
3. **폴더 추가 선택 창 (`src/workspace/store.ts:147`)**:
   - Windows OS 탐색기 대화 상자 (`rfd` / Windows IFileDialog)
   - 판정: **OS 표시** (core D-13, Phase 12 V4)
4. **Markdown 링크의 title 툴팁 (`src/editor/markdown.ts:7`, `src/shell/markdown-preview.ts:35`)**:
   - 브라우저 기본 네이티브 title 팝업 글꼴 사용
   - 판정: **OS 표시** (core D-13, Phase 12 V4)

---

## 4. 미구현 항목 (I-11 · I-12)

1. **탭 본체의 경로 툴팁 (I-11)**:
   - `src/shell/Pane.tsx`: 현재 탭 제목 hover 시 파일 경로를 표시하는 툴팁은 미구현 상태임 (닫기·고정 해제 버튼 툴팁만 존재).
   - 조치: **Phase 9에서 다시 본다**.
2. **편집 영역 상단 경로 줄 (I-12)**:
   - `src/shell/Pane.tsx:399~419`: 현재 `.editor-toolbar`에는 Markdown Preview 버튼만 존재하며, breadcrumb 형태의 경로 줄은 미구현 상태임.
   - 조치: **Phase 9에서 다시 본다**.

---

## 5. I-14 글꼴 유지 검증

ORDER-03에서 확정된 I-14 글꼴 적용 상태가 유지되고 있는지 CDP 렌더링 글꼴을 대조함:

- **UI 글꼴 (U)**:
  - 선언: `metrics.ts` 및 `app.css`의 `var(--ui-font-family)` (`"IBM Plex Sans", "Malgun Gothic", sans-serif`)
  - 실측: 사이드바(`sidebar-name`), 트리(`tree-compact`, `tree-root`), 툴팁(`tree-tooltip`), 타이틀바(`titlebar`), 미리보기 본문(`preview-text` item 1)에서 `IBM Plex Sans` (`IBMPlexSans`, `isCustomFont: true`) 단독으로 렌더링됨.
  - 경로 및 영문/숫자 문자에 대해 `Malgun Gothic` 폴백 글리프 발생 없음 (`glyphCount: 0`).
- **버퍼 글꼴 (B)**:
  - 선언: `metrics.ts` 및 CodeMirror theme의 `var(--buffer-font-family)` (`"Lilex", "Malgun Gothic", monospace`)
  - 실측: 편집기 본문 3개 라인(`editor` item 1~3), 미리보기 인라인 코드(`preview-code` item 1), 미리보기 코드 블록(`preview-code` item 2)에서 `Lilex` (`Lilex-Regular`, `isCustomFont: true`) 단독으로 렌더링됨.
  - 미리보기 인라인 본문(`preview-text` item 2)에서도 `code` 태그 내 경로는 `Lilex` (31 glyphs), 본문 텍스트는 `IBM Plex Sans` (8 glyphs)로 정확히 분리되어 렌더링됨.
- **판정**: ORDER-03에서 검증된 I-14 글꼴 구성(UI는 IBM Plex Sans, 버퍼는 Lilex)이 완전히 유지되고 있음 (**통과**).

---

## 6. 결론

1. **R-20 / I-20 충족**:
   - WebView 내부에서 앱이 직접 렌더링하는 모든 경로 및 역슬래시 문자열(사이드바, 파일 트리 compact 행, 트리 루트, 트리 경로 툴팁, 타이틀 바, 편집기 본문, 마크다운 미리보기 본문/코드)에서 역슬래시가 정상적인 `\`로 표시되며, 원화 기호(`₩`)는 전혀 발생하지 않음 (`hasWon: false`).
   - 이는 Phase 3 (ORDER-03 / I-14)에서 도입된 영문 우선 번들 글꼴(`IBM Plex Sans` 및 `Lilex`)이 U+005C를 온전한 `\` 글리프로 렌더링하고, 영문/기호 영역에서 `Malgun Gothic`으로의 폴백이 발생하지 않기 때문임.
   - 따라서 별도의 추가 코드 수정 없이 I-20 요구사항이 완전히 충족됨.
2. **네이티브 대화 상자 분리**:
   - Windows OS가 직접 렌더링하는 TaskDialog 등 네이티브 창은 시스템 UI 글꼴(맑은 고딕)의 특성상 `₩`로 표시되나, 이는 core-leader 결정(core D-13)에 따라 I-20 판정 대상에서 제외하고 Phase 12 V4(사용자 확인)로 정상 인계함. 문구의 역슬래시 구분자는 유지함.
