# ORDER-05 (I-1 · I-18 · R-1 · R-18) V3 실측 및 판정

- 측정 일시: 2026-11-07
- 측정 조건: 데스크톱 주 모니터 1920×1080 100% (DPI 96), 창 클라이언트 크기 1440×852
- 측정자 / 차례: tauri-leader (화면 차례 1회 안에서 tauri CDP 및 Zed 측정 수행, PID 2628만 종료)
- 판정자: tauri-checker
- 입력 자료:
  - Tauri CDP 아이콘 덤프: `specs/v0.5/verify/ORDER-05/tauri-icons.json` (PID 2628)
  - Tauri 캡처:
    - `tauri-1-start.png` (초기 실행 화면)
    - `tauri-2-file-preview.png` (사이드바 열림, paths.md 편집 및 미리보기 탭)
    - `tauri-3-sidebar-closed.png` (사이드바 닫힘)
  - Zed 캡처 (`zed -n` 새 창, Restricted Mode, 그 창만 WM_CLOSE):
    - `zed-1-file.png` (사이드바 닫힘, paths.md)
    - `zed-2-preview-sidebar.png` (사이드바 열림, 미리보기 탭)
  - 4배 확대 비교 캡처 (상단: tauri, 하단: Zed):
    - `zoom-open-statusbar.png` (tauri-2 vs zed-2 상태 바)
    - `zoom-open-tabbar.png` (tauri-2 vs zed-2 탭 바)
    - `zoom-open-titlebar.png` (tauri-2 vs zed-2 타이틀 바)
    - `zoom-open-tree.png` (tauri-2 vs zed-2 파일 트리)
    - `zoom-closed-statusbar.png` (tauri-3 vs zed-1 상태 바)
    - `zoom-closed-tabbar.png` (tauri-3 vs zed-1 탭 바)
    - `zoom-closed-titlebar.png` (tauri-3 vs zed-1 타이틀 바)
    - `zoom-closed-tree.png` (tauri-3 vs zed-1 파일 트리)
  - 코드 및 리뷰 보고:
    - coder 보고: `%TEMP%\v05-K-08-report.md`, `%TEMP%\v05-K-08-R1-report.md`
    - checker 리뷰: `%TEMP%\v05-C-18-report.md` (PASS)
    - 지침 / 결정: `D:\projects\workbench-core\specs\v0.5\orders\ORDER-05.md`, `specs/v0.5/DECISIONS.md` D-2, D-3, `specs/v0.5/SPEC.md` R-1, R-18
- 조건 차이 전제:
  - 테마 차이: tauri는 Catppuccin Mocha, Zed는 One Dark이므로 색상은 판정 대상에서 제외하고 아이콘의 모양(윤곽선, 채움 영역, 비율)만 대조한다.
  - 사용자 Zed 아이콘 테마 차이: 사용자 환경의 Zed 설정이 `Catppuccin Latte` 아이콘 테마로 되어 있어(사용자 설정 불변 규칙), 파일 트리의 폴더 및 파일 아이콘은 Zed 기본 아이콘 테마 소스 코드(`crates/file_icons/src/file_icons.rs:254~268`)와의 해시 및 코드 출처로 판정한다.

---

## 1. 종합 판정 요약

| 구분 | 대상 수 | 기준 충족 조건 | 결과 | 판정 |
|---|---|---|---|---|
| **화면 대조 UI 아이콘** | 10개 지점 (11개 동작 상태) | 4배 확대 캡처에서 Zed 화면과 모양(윤곽선, 비율, 획 두께) 일치 | 모든 비교 대상에서 Zed와 동일한 모양 확인 | **충족 (PASS)** |
| **I-18 상태 바 아이콘** | 2개 지점 | Project Panel 버튼이 트리 모양(`file_tree`), Add Project에 "+" 포함(`folder_add`) | 두 버튼 모두 Zed와 동일한 모양 및 요구 기호 확인 | **충족 (PASS)** |
| **코드 출처 판정 아이콘** | 3개 지점 (트리 폴더 2종, 사이드바 폴더) | Zed 고정 커밋(4304dec732) 원본 파일과 바이트 단위 일치 및 리더 결정(D-3) 부합 | SHA-256 해시 일치, gpui 갈래와 동일 구현 확인 | **충족 (PASS)** |
| **유지 / Phase 7 인계** | 2개 지점 (창 조절 글리프, 일반 파일) | 비-SVG 사유 및 후속 Phase 구현 사유 타당성 | Zed Windows 구현(Segoe 글리프) 일치, Phase 7 아이콘 테마 인계 확인 | **유지 확인 (PASS)** |
| **복사본 부재 시 안전성** | 덤프 및 코드 | 복사본 존재 시 빈 아이콘 없음(`empty: false`), 부재 시 크기 보존 빈 칸 처리 | 덤프 44개 인스턴스 전수 `empty: false`, 부재 시 에러 없이 빈 칸 렌더링 확인 | **충족 (PASS)** |

---

## 2. 자리별 상세 실측 및 판정 표

| 번호 | 자리 (Spot) | 코드 위치 | tauri 아이콘 (SVG 이름) | Zed 화면 / 원본 대응 | 확대 캡처 확인 결과 | 판정 |
|---|---|---|---|---|---|---|
| 1 | 상태 바 사이드바 토글 (열림) | `src/App.tsx:24` | `threads_sidebar_left_open.svg` | Zed 열린 사이드바 토글 (`ThreadsSidebarLeftOpen`) | `zoom-open-statusbar.png`: 좌측 절반이 채워진 분할 사각형 윤곽선 형태 일치 | **같음 (PASS)** |
| 2 | 상태 바 사이드바 토글 (닫힘) | `src/App.tsx:53` | `threads_sidebar_left_closed.svg` | Zed 닫힌 사이드바 토글 (`ThreadsSidebarLeftClosed`) | `zoom-closed-statusbar.png`: 중앙 분할선이 있는 빈 사각형 윤곽선 형태 일치 | **같음 (PASS)** |
| 3 | Add Project (사이드바 / 상태 바) | `src/App.tsx:34, 58` | `folder_add.svg` | Zed Add Project (`FolderAdd`) | `zoom-open-statusbar.png`, `zoom-closed-statusbar.png`: 둥근 폴더 우측 하단에 "+"가 결합된 형태 일치 | **같음 (PASS)** |
| 4 | Project Panel (왼쪽 dock 여닫기) | `src/App.tsx:63, 65` | `file_tree.svg` | Zed Project Panel (`FileTree`) | `zoom-open-statusbar.png`, `zoom-closed-statusbar.png`: 좌측 수직선과 뻗어나온 노드 블록의 트리 모양 일치 | **같음 (PASS)** |
| 5 | 탭 바 뒤로 (Go Back) | `src/shell/Pane.tsx:380` | `arrow_left.svg` | Zed Go Back (`ArrowLeft`) | `zoom-open-tabbar.png`, `zoom-closed-tabbar.png`: 왼쪽 방향 직선 화살표 획 두께 및 각도 일치 | **같음 (PASS)** |
| 6 | 탭 바 앞으로 (Go Forward) | `src/shell/Pane.tsx:383` | `arrow_right.svg` | Zed Go Forward (`ArrowRight`) | `zoom-open-tabbar.png`, `zoom-closed-tabbar.png`: 오른쪽 방향 직선 화살표 획 두께 및 각도 일치 | **같음 (PASS)** |
| 7 | 탭 바 New… (+) | `src/shell/Pane.tsx:392` | `plus.svg` | Zed New… (`Plus`) | `zoom-closed-tabbar.png`: 탭 바 우측 "+" 기호 획 두께 및 비율 일치 | **같음 (PASS)** |
| 8 | 탭 바 Split Pane (창 분할) | `src/shell/Pane.tsx:345` | `split.svg` | Zed Split Pane (`Split`) | `zoom-closed-tabbar.png`: 둥근 모서리 사각형 중앙 수직 분할 창 형태 일치 | **같음 (PASS)** |
| 9 | 탭 바 확대 (Zoom In / Maximize) | `src/shell/Pane.tsx:361` | `maximize.svg` | Zed Maximize (`Maximize`) | `zoom-closed-tabbar.png`: 대각선 양방향 화살표 형태 일치 | **같음 (PASS)** |
| 10 | 미리보기 탭 아이콘 (Preview Tab) | `src/shell/Pane.tsx:255` | `file_doc.svg` | Zed Preview Tab (`FileDoc`) | `zoom-open-tabbar.png`: 탭 텍스트 앞 펼쳐진 문서/책 모양 형태 일치 | **같음 (PASS)** |
| 11 | 타이틀 바 앱 메뉴 | `src/shell/AppMenu.tsx:218` | `menu.svg` | Zed Application Menu (`Menu`) | `zoom-open-titlebar.png`, `zoom-closed-titlebar.png`: 세 개의 가로 평행선(햄버거) 간격 및 두께 일치 | **같음 (PASS)** |
| 12 | 파일 트리 닫힌 폴더 | `src/shell/ProjectTree.tsx:158` | `folder.svg` | Zed 기본 파일 테마 `Folder` (`folder.svg`) | 사용자 Zed는 Catppuccin Latte 테마이나, Zed 기본 테마 파일과 바이트 일치 (SHA256: `49FFC6E8...845B`) | **비교 조건 다름 (코드 출처로 판정, PASS)** |
| 13 | 파일 트리 열린 폴더 | `src/shell/ProjectTree.tsx:158` | `folder_open.svg` | Zed 기본 파일 테마 `FolderOpen` (`folder_open.svg`) | 사용자 Zed는 Catppuccin Latte 테마이나, Zed 기본 테마 파일과 바이트 일치 (SHA256: `4E15D512...DBC9`) | **비교 조건 다름 (코드 출처로 판정, PASS)** |
| 14 | 사이드바 등록 폴더 목록 | `src/shell/Sidebar.tsx:77` | `folder.svg` | Zed 사이드바 (아이콘 없음) / gpui 갈래 동기화 | Zed 원본엔 아이콘 없으나 레이아웃 변경 방지 위해 gpui 갈래와 동일하게 Zed `folder.svg` 적용 (리더 결정 D-3) | **비교 조건 다름 (코드 출처로 판정, PASS)** |
| 15 | 파일 트리 일반 파일 | `src/shell/ProjectTree.tsx:158` | `file.svg` (자체 유지) | Zed 파일 아이콘 테마 (다중 확장자 분기) | Zed는 확장자별 테마 적용(`paths.md`에 `[M↓]` 표시). 단일 SVG 매핑 불가로 Phase 7(아이콘 테마)에서 구현 | **Phase 7 (PASS)** |
| 16 | Windows 창 조절 버튼 (최소화/최대화/닫기) | `src/shell/TitleBar.tsx:48~55` | Segoe Fluent Icons 글리프 (``, ``, ``) | Zed Windows 구현 (`platform_windows.rs`) | Zed Windows 구현에서도 SVG가 아닌 동일한 Segoe Fluent Icons 글꼴 글리프 사용. ORDER-05 유지 지침 충족 | **유지 (Zed도 SVG 아님, PASS)** |

---

## 3. I-18 (상태 바 왼쪽 아이콘) 집중 검증

- **왼쪽 dock 여닫기 (Project Panel) 아이콘 모양**:
  - 스펙 요구: 상태 바의 dock 여닫기 버튼이 Zed처럼 트리 모양이어야 함.
  - 실측 결과: `src/App.tsx:63, 65`에서 `name="file_tree"`를 사용하며, 4배 확대 캡처(`zoom-open-statusbar.png`, `zoom-closed-statusbar.png`)에서 Zed의 `FileTree` 아이콘과 동일한 수직선 및 노드 분기 트리 형태를 렌더링함.
  - 판정: **충족 (PASS)**.
- **Add Project 아이콘 모양**:
  - 스펙 요구: Add Project 버튼 아이콘에 Zed처럼 "+" 기호가 결합되어 있어야 함.
  - 실측 결과: 사이드바 푸터(`src/App.tsx:34`) 및 사이드바 닫힌 상태의 상태 바(`src/App.tsx:58`) 모두 `name="folder_add"`를 사용하며, 4배 확대 캡처에서 둥근 폴더 아이콘 우측 하단에 "+"가 명확히 결합된 `folder_add.svg` 형태를 렌더링함.
  - 판정: **충족 (PASS)**.

---

## 4. 복사본 부재 시 안전성 및 덤프 무결성 검증

1. **복사본 존재 시 빈 슬롯 여부**:
   - `specs/v0.5/verify/ORDER-05/tauri-icons.json` CDP 실측 덤프 대조:
     - `start` 상태: 10개 아이콘 전수 `empty: false`
     - `open` 상태 (사이드바 열림): 18개 아이콘 전수 `empty: false`
     - `sidebarClosed` 상태 (사이드바 닫힘): 16개 아이콘 전수 `empty: false`
   - 전체 측정 상태에서 누락되거나 빈 SVG 슬롯(`empty: true`)이 단 1건도 없음.
2. **복사본 부재 시 동작 검증**:
   - `src/assets/zed-icons/` 디렉터리가 제거되거나 일부 SVG 파일이 누락된 환경에서도:
     - Vite eager glob이 빈 객체 또는 `undefined`를 반환하고,
     - `themedSvg(undefined)`가 `""`를 반환하여 `<span class="icon" aria-hidden="true" innerHTML="" />`로 처리됨.
     - 런타임 예외나 충돌 없이 기존 CSS 레이아웃 크기(14×14 또는 16×16)를 유지하는 빈 칸으로 렌더링되며 버튼의 접근성 라벨, 툴팁, 클릭 이벤트는 정상 작동함(K-08 및 C-18 빌드/테스트 검증 통과).
   - 판정: **충족 (PASS)**.

---

## 5. 최종 결론

- **ORDER-05 (I-1, I-18, R-1, R-18) V3 검증 통과 (PASS)**.
- UI 내 모든 아이콘이 Zed 원본 고정 커밋(`4304dec732a75505066de5ce2dbbfb2bec369498`)의 SVG 복사본으로 전환되었으며, 화면 확대 캡처 대조에서 Zed 원본과 동일한 형상으로 표시됨을 실측 검증함.
- 남겨진 비-Zed 출처 2건(일반 파일용 `file.svg`, Windows 창 컨트롤 글리프)은 Zed의 구현 방식 및 상위 지침(Phase 7 아이콘 테마 인계, OS 글꼴 글리프 사용)에 완벽히 부합함.
