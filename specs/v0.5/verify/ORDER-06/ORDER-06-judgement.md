# ORDER-06 판정 — tauri-checker · 2026-11-07

상위: `D:\projects\workbench-core\specs\v0.5\orders\ORDER-06.md` (1단계: I-17 `≡` 메뉴 완성 및 I-2 "v" 메뉴 1단계)  
대상: K-09, K-09-R1, K-09-R2  
측정 파일: `specs/v0.5/verify/ORDER-06/tauri-menus.json`, `tauri-menubar.png`, `tauri-menubar-after.png`, `tauri-menu-*.png`, `tauri-licenses.png`, `tauri-user-menu*.png`, Zed 원문 캡처 `zed-*.png`  
검증 조건: Windows 주 모니터 1920×1080, 창 크기 1440×852, DPI 100% (I-6)

---

## 1. I-17 `≡` 메뉴 판정 표

| 검증 항목 | 기대 조건 (ORDER-06 3절 / Zed 실측) | tauri 실측 / 구현 결과 | 판정 |
|---|---|---|---|
| 메뉴 순서 | `workbench-tauri` · File · Edit · View · Go · Window · Help (마지막 Help) | `workbench-tauri`, `File`, `Edit`, `View`, `Go`, `Window`, `Help` (`tauri-menus.json`) | **PASS** |
| 구현된 항목만 포함 | Selection·Run 등 미구현 메뉴 및 미구현 항목 제외, 실제 동작 연결 | Selection/Run 제외. 구현된 항목만 포함 (아래 세부 동작 표 참조) | **PASS** |
| 프로젝트 이름 숨김 | 메뉴 막대가 열리면 타이틀 바 뒤의 폴더 이름 숨김 | `projectNameVisible: false` (`TitleBar.tsx` `<Show when={!appMenuExpanded()}>`) | **PASS** |
| 메뉴 이름 간격 | Zed 글자 잉크 간격과 1px 이내 (Zed: File→Edit 14, Edit→Selection 13, Selection→View 13, View→Go 13, Go→Run 14, Run→Window 13, Window→Help 13) | R2 수정 후: File→Edit 13, Edit→View 12, View→Go 12, Go→Window 12, Window→Help 12 (Zed 13px 기준 ±1px 이내) | **PASS** |
| 라이선스 대화상자 | Help > View Dependency Licenses 실행 시 표시, 안전한 텍스트 렌더링, 실패 처리 | `tauri-licenses.png`, 길이 60917자, unavailable 0, Escape 닫힘 및 이전 포커스 복원 확인 | **PASS** |
| Help 이슈/저장소 URL | GitHub 이슈 작성 URL 2개, 저장소 URL 1개 | `.../issues/new` (2개), `.../workbench-tauri` (1개) 코드 및 테스트 확인 | **PASS** |
| 하위 메뉴 전환 버그 | View > Editor Layout 열린 채 Go로 포인터 이동 시 메뉴 유지 | R1 수정 후 `open=[Go]`, `bar=true` 정상 전환 확인 (`tauri-menus.json`) | **PASS** |

### I-17 세부 동작 연결 확인 표
- `workbench-tauri`: Quit (`zed::Quit` → `appWindow.close()`)
- `File`: Open Folder... (`workspace::Open`), Save (`workspace::Save`), Close Editor (`workspace::CloseActiveItem` → `closeTab(..., true)`), Close Window (`workspace::CloseWindow`)
- `Edit`: Undo (`editor::Undo`), Redo (`editor::Redo`)
- `View`: Toggle Left Dock (`workspace::ToggleLeftDock`), Toggle Folder Sidebar (`multi_workspace::ToggleWorkspaceSidebar`), Focus Folder Sidebar (`multi_workspace::FocusWorkspaceSidebar`), Editor Layout 하위 Split 4개 (`pane::Split*`), Maximize Pane (`workspace::ToggleZoom`), Project Panel (`project_panel::ToggleFocus`), Markdown Preview 2개 (`markdown::OpenPreview*`)
- `Go`: Previous Tab (`pane::ActivatePreviousItem`), Next Tab (`pane::ActivateNextItem`)
- `Window`: Minimize (`zed::Minimize`), Zoom (`zed::Zoom`)
- `Help`: View Dependency Licenses (`zed::OpenLicenses`), Bug Report/Feature Request/Repo URL

---

## 2. I-2 "v" 메뉴 (1단계) 판정 표

| 검증 항목 | 기대 조건 (ORDER-06 4절 / Zed 실측) | tauri 실측 / 구현 결과 | 판정 |
|---|---|---|---|
| 버튼 위치 | 타이틀 바 오른쪽, 최소화 버튼 바로 앞 | `userButton.box`: [1310, 5, 22, 22], `minimizeLeft`: 1332, `nextIsMinimize: true` | **PASS** |
| 버튼 아이콘 | Zed `chevron_down` SVG (D-9 복사본) | `Icon name="chevron_down"` (`src/assets/zed-icons/chevron_down.svg`, 14px) | **PASS** |
| 항목 순서 | Settings → Keymap → Themes… → Icon Themes… → Extensions → 구분선 → Panel Layout | `Settings`, `Keymap`, `Themes…`, `Icon Themes…`, `Extensions`, `---`, `Panel Layout` (`tauri-menus.json`) | **PASS** |
| 단축키 표시 | Settings `Ctrl-,`, Keymap `Ctrl-K Ctrl-S`, Themes… `Ctrl-K Ctrl-T`, Extensions `Ctrl-Shift-X` | 단축키 4개 정확히 렌더링 (`tauri-menus.json`, `tauri-user-menu.png`) | **PASS** |
| Panel Layout 하위 | 하위 메뉴 Classic, Agentic | 하위 메뉴 2개 항목 정상 열림 (`tauri-user-menu-panel-layout.png`) | **PASS** |
| 비활성 및 안전성 | 미구현 5개 항목 및 Panel Layout 하위 2개 비활성, 클릭 시 예외 없음 | 미구현 항목 `[disabled]` 표시, Settings 클릭 후 앱 정상 유지 (`afterDisabledClick` 확인) | **PASS** |

---

## 3. R1·R2 코드 리뷰 결과

1. **K-09-R1 (포커스 이탈로 메뉴 바 닫힘 버그 수정)**
   - 원인: 하위 메뉴 DOM 제거 시 일시적으로 포커스가 이탈되는 순간 동기 `focusout` 이벤트가 전체 메뉴를 닫음.
   - 해결: `src/shell/menu.ts`에 `closeOnFocusOut(root, close)`를 두고 `queueMicrotask`로 동기 렌더링/포커스 전환이 완료된 후 `document.activeElement`의 `root.contains()` 여부를 판정하도록 수정.
   - 판정: 원인 발생 공통 지점에서 올바르게 수정되었으며, `src/shell/menu.test.ts`에 4가지 회귀 테스트가 추가되어 검증됨. 포커스 복원 및 기존 키보드 조작에 회귀 없음.

2. **K-09-R2 (메뉴 이름 좌우 padding 스펙 반영)**
   - 원인: Zed 메뉴 이름 버튼의 잉크 간격(~13px)에 비해 tauri 간격이 약 5px로 좁았음.
   - 해결: 스펙 `buttons.padding_x.default_compact = 4px` (L-07)을 `src/spec/metrics.ts`에 추가하고 `src/app.css`의 `.menu-name` 좌우 padding에 적용.
   - 판정: 버튼 패딩 4px + flex gap 4px + 버튼 패딩 4px = ~12-13px로 Zed 실측값(13px)과 1px 이내로 정확히 일치함.

---

## 4. 지적 및 참고 사항

### 하위 메뉴 열림 상태에서 비활성 형제 항목 hover 동작
- **현상**: "v" 메뉴에서 `Panel Layout` 하위 메뉴가 열린 상태에서 포인터를 비활성 상위 항목(`Extensions` 등)으로 이동하면, 하위 메뉴가 닫히지 않고 열린 상태가 유지됨 (`tauri-user-menu-panel-layout.png`, `afterDisabledClick.menus: 2`).
- **분석**:
  - Zed 원문에서는 "v" 메뉴의 최상위 항목들(`Settings`, `Keymap`, `Themes…`, `Icon Themes…`, `Extensions`)이 모두 활성 명령이므로, 마우스 hover 시 활성 항목으로 포커스/선택이 넘어가며 기존 하위 메뉴가 닫힙니다.
  - 현재 tauri 구현은 1단계 범위에 따라 해당 5개 항목이 `disabled: true` 상태입니다. `src/shell/AppMenu.tsx`의 `onPointerMove`에서 `I-515` ("비활성 항목은 hover·클릭 반응 없음") 규칙에 따라 `if (entry.disabled) return;`으로 조기 리턴하므로, `closeChild()`가 호출되지 않아 하위 메뉴가 열린 채 유지됩니다.
- **판정 및 권고**:
  - ORDER-06 2단계에서 이 화면들이 실제 구현되어 `disabled: false`가 되면 Zed와 동일하게 hover 시 자연스럽게 닫히게 됩니다.
  - 다만 1단계 비활성 상태나 향후 다른 비활성 항목/구분선으로 포인터가 나갔을 때도 직관적인 UX를 위해 `if (!props.child && child() && child()!.parent !== i()) closeChild();`를 disabled 가드보다 먼저 실행하도록 개선하는 방안을 권고합니다.
