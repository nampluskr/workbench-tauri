[DONE] ORDER-12 tauri

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과(충족/미충족/BLOCKED) | 근거(파일 경로, 명령과 출력, 캡처 경로) |
|---|---|---|---|
| U-6 | 오른쪽 클릭 메뉴 항목·서브 메뉴 항목(단축키 포함) 글꼴 = 툴팁 글꼴(V1, V3) | 충족 | V1: `src/app.css` `.menu { font-size: var(--tooltip-font-size) }`(오른쪽 클릭 메뉴·펼친 메뉴·서브 메뉴가 같은 `.menu`). V3 `specs/v0.6/verify/ORDER-12/v3.json`: 툴팁 14px(`--tooltip-font-size` 0.875rem); 탭 메뉴 항목·단축키 14px(`tab-context-menu.png`), 트리 메뉴 14px·14px(`tree-context-menu.png`), Sidebar 메뉴 항목 14px, 사용자 메뉴 Panel Layout 서브 메뉴 14px(`user-menu-sub.png`) |
| U-6 | 펼친 메뉴 항목·서브 메뉴 항목(단축키 포함) 글꼴 = 툴팁 글꼴(V1, V3) | 충족 | File 메뉴 항목·단축키 14px(`file-menu.png`), View → Editor Layout 서브 메뉴 항목·단축키 14px(`view-editor-layout-sub.png`). File 메뉴엔 서브 메뉴가 없어 View로 확인 |
| U-6 | Sidebar `Ctrl+F` 표시 글꼴 = 툴팁 글꼴(V1, V3) | 충족 | `.sidebar-search .menu-shortcut { font-size: var(--tooltip-font-size) }`, V3 "Ctrl+F" 14px(`sidebar-idle.png`) |
| U-6 | 메뉴 줄 File~Help는 기본 UI 글꼴 그대로(V3) | 충족 | File·Edit·View·Go·Window·Help 모두 16px = `--typography-ui-font-size`(`v3.json` fileMenu.menuNames) |

## 검증
- coder K-15(Claude Code Sonnet 5.5 high로 바꾼 뒤 첫 카드): typecheck 통과, 앱 실행 없음.
- checker C-17(커밋 직전 전체 1회): `npm.cmd run typecheck` 오류 0, `npm.cmd run test` 225 통과, `cargo clippy … -D warnings` 경고 0, `cargo test` 21 통과. 코드 검토 지적 없음, V3 판정 8항목 PASS.
- V3(`[SCREEN-REQ]`→`[SCREEN-OK]`→`[SCREEN-DONE]`): debug exe, 임시 APPDATA·임시 WebView 데이터 폴더, One Light, 1440×852. SendInput, CDP. 시스템 클립보드는 건드리지 않았다.
- 결과 파일: `specs/v0.6/verify/ORDER-12/` `v3.json`, `tab-context-menu.png`, `tree-context-menu.png`, `user-menu-sub.png`, `file-menu.png`, `view-editor-layout-sub.png`, `sidebar-idle.png`.

## 지운 것·더한 것·하지 않은 것 (D-8)
- 바꾼 것: `src/app.css` 두 줄(`.menu` 글꼴 `--typography-ui-font-size` → `--tooltip-font-size`, Sidebar `Ctrl+F` 표시에 `--tooltip-font-size`). 새 값·변수·의존성 없음.
- 함께 바뀐 것: Settings 창 드롭다운(`AppMenu popupOnly`)도 같은 `.menu`라 14px가 된다.
- 지운 것: 없음(쓰지 않게 된 크기 값 없음, `--typography-ui-font-size`는 메뉴 줄·본문에서 계속 씀).
- 하지 않은 것: 줄 높이·여백 등 다른 모양 변경.
- 남은 위험: 없음.

## 바꾼 파일
- 코드 커밋 `281de60`: `src/app.css`
- 기록 커밋 `e60d44c`: `specs/v0.6/PROGRESS.md`("사용자 요청 작업" 절 ORDER-12 소절), `specs/v0.6/verify/ORDER-12/`
- 함께 push할 앞 커밋: `183ce61`·`d8f59d9`(coder 모델 변경 기록과 날짜 바로잡기).
- 이 보고는 그 뒤 커밋에 넣는다. push 안 함.

## 미정
- 없음(이번 카드). v0.6 미정은 `reports/ORDER-10.md`·`ORDER-11.md` 미정 절 그대로.

## BLOCKED
- 없음
