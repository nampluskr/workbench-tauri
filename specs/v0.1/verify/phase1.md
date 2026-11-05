# Phase 1 결과표 — R-1 · R-2 · CSP

> 대상: SPEC R-1, R-2(E-002~E-005·E-010·E-011·E-015·E-030), Phase 1 빌드 앱의 CSP.
> V2 값은 `impl`의 P1-1 보고(`impl-p1-1.md`)에서 옮겼다. V3 값은 `measure`가 `tools/measure-p1.mjs`로 쟀다.
> 판정은 허용 오차 `verification.tolerance.dimension`(1.0px) 기준이다. 색은 Phase 2(테마) 이후라 이 표에서 판정하지 않는다.

## 측정 조건

| 항목 | 값 |
| --- | --- |
| 모니터·배율 | 데스크톱 주 모니터 1920x1080, 100% (`devicePixelRatio` 1) |
| 창 | 논리 1440x852, 최대화 안 함 (`innerWidth` 1440, `innerHeight` 852) |
| V2 대상 | `npm run tauri dev` 1회, 조작 없이 CDP 덤프 (impl) |
| V3 대상 | `npm run tauri build -- --debug --no-bundle`의 `src-tauri/target/debug/workbench-tauri.exe`, 주소 `http://tauri.localhost/` (CSP 적용) |
| 글꼴 | Consolas (CDP `CSS.getPlatformFontsForNode`), 15px. "0" advance(1ch) 8.2470703125px, fontBoundingBox descent 4px |
| 입력 방식 | CDP `Input.dispatchMouseEvent`(WebView에 직접 전달). OS 입력을 보내지 않아 전경 창 확인 대상이 아니다 |
| 스크립트 | `tools/cdp-lib.mjs`(실행·CDP·toml 읽기), `tools/measure-p1.mjs`(이 표의 V3) |

## PoC 결과표

| 확인 항목 | 스펙 ID | 수준 | 기대 | 측정 | 차이 | 결과 | 다음 조치 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 편집기 줄 번호 폭 | E-002 | V2 | max(2자리, 4) × 8.2471 = 32.988px | 32.9883px | 0.00 | 됨 | 없음 |
| 거터 왼쪽 여백 | E-003 | V2 | 3 × 8.2471 = 24.741px | 24.7412px | 0.00 | 됨 | 없음 |
| 거터 오른쪽 여백 | E-004 | V2 | 4 × 8.2471 = 32.988px | 32.9883px | 0.00 | 됨 | 없음 |
| 거터 전체 폭 | E-002~E-004 합 | V2 | 90.717px | 90.703px | 0.01 | 됨 | 없음 |
| 거터–본문 간격 | E-005 | V2 | descent 4px | 4.000px | 0.00 | 됨 | 없음 (Chromium은 descent를 정수로 둥글린다. 환경이 바뀌면 재확인) |
| 줄 높이 | E-010 | V2 | 15 × 1.618 = 24.27px | 24.27px (줄 요소 24.2656px) | 0.004 | 됨 | 없음 |
| 현재 줄 강조 범위·높이 | E-011 | V2 | 거터 포함 가장자리부터 본문 끝, 높이 1줄 | 한 사각형 0~737.98px, 높이 24.266px | 0.004 | 됨(크기·범위) | 색은 Phase 2 이후 |
| 편집기 스크롤바 두께 | E-030 | V2 | 15px | 세로 15px, 가로 15px | 0 | 됨 | 없음 |
| 선택 영역 모서리 반지름 | E-015 | V3 | 24.27 × 0.15 = 3.6405px | 3.6405px (세 조각 모두, 이동 전·후 동일) | 0.0000 | 됨 | 선택 영역 색 `players[0].selection`은 Phase 2 이후 |
| 탭 이동 후 `EditorView` DOM 노드 | R-1 | V3 | 옮기기 전과 `===` | `.cm-editor` `===` true, `.cm-scroller` `===` true, `isConnected` true, 문서 안 `.cm-editor` 1개 | — | 됨 | 없음 |
| 탭 이동 자체 | R-1 | V3 | Pane 0 → Pane 1 | 이동 전 `paneIndex` 0, 이동 후 1 | — | 됨 | 없음 |
| 스크롤 위치 | R-1 | V3 | `scrollTop`·`scrollLeft` 동일 | 280 / 20 → 280 / 20 (한 프레임 뒤, 500ms 뒤 모두) | 0 | 됨 | 없음 |
| DOM 선택 영역 | R-1 | V3 | 동일 | 앵커·포커스 노드 `===` true, 오프셋 5·10 → 5·10, 선택 문자열 동일(65자), 범위 1개, 접힘 없음 | 0 | 됨 | 없음 |
| 커서 위치 | R-1 | V3 | 동일 | `.cm-cursor`와 선택 사각형 3개의 편집기 기준 좌표·크기 이동 전후 완전히 같음, `cm-focused` true 유지 | 0 | 됨 | 없음 |
| CSP 위반 | Phase 1 CSP | V3 | 0건 | `securitypolicyviolation` 0건, CDP Log·console·예외 0건 | — | 됨 | 없음 |
| CM6 `<style>` nonce | Phase 1 CSP | V3 | nonce로 적용 | CM6 `<style>` 1개, `nonce`가 carrier와 같음, 규칙 있음, `.cm-scroller` `overflow-x: auto`·`line-height: 24.27px` 적용 | — | 됨 | 없음 |

R-1 판정: 노드 동일, 문서 연결, 스크롤, 선택, 커서가 모두 같다. SPEC R-1의 "셋 중 하나라도 다르면 안 됨" 조건에 걸리는 것이 없다. **R-1 됨** (React 19 비교 불필요).

## 측정 세부와 관찰

- 시작 상태: `scrollTop`을 300으로 지정했으나 문서 높이 1092px − 뷰포트 812px = 280이 한계라 280이 됐다. `scrollLeft`는 20. 이동 전후 같은 값이다.
- 선택 만들기: CDP 마우스 드래그, 보이는 줄 2번째 → 5번째. 선택 문자열 65자, 사각형 3조각(첫 줄·가운데·끝 줄).
- 이동: 탭의 "→" 버튼을 CDP 마우스 클릭(`mousePressed`·`mouseReleased`)으로 눌렀고, `requestAnimationFrame` 두 번 뒤(한 프레임 뒤)와 500ms 뒤에 두 번 읽었다. 두 값이 같다.
- E-015 표현: 반지름은 `.cm-selectionBackground`의 `getComputedStyle().borderTopLeftRadius`다. `--players-0-selection`이 아직 없어 배경이 투명이라 화면 픽셀로는 모서리를 볼 수 없다. 그래서 계산된 스타일 값으로 판정했다.
- CSP 헤더(`fetch(location.href)`): `script-src 'self' 'sha256-…'; style-src 'self' 'nonce-…'; default-src 'self' ipc: http://ipc.localhost`. 이 값이 적용된 상태에서 위반이 0건이다. `unsafe-inline`이 없다.
- CSP 측정 방식 검증(양성 대조): 위반 0건을 읽은 뒤에 nonce 없는 `<style>`을 일부러 하나 넣었더니 `securitypolicyviolation`(`style-src-elem`, `inline`)과 CDP Log 오류가 각각 1건 잡혔다. 측정 방식이 위반을 놓치지 않는다. 이 대조 위반은 위 0건 판정에 포함하지 않았다.
- CDP 연결은 로그를 놓치지 않도록 Log·Runtime을 켠 뒤 페이지를 한 번 새로 불러온(`Page.reload`) 다음 읽었다. 첫 로드에서 재생된 로그도 0건이다.
- 앱은 측정 끝에 종료했다(`workbench-tauri` 프로세스·9222 포트 없음 확인).

## 판정하지 않은 것

| 항목 | 이유 |
| --- | --- |
| E-011 색, E-015 색, 줄 번호 색(E-006), 스크롤바 색 | 테마 토큰은 Phase 2. `impl` 보고의 "실측 필요"와 같다 |
| E-032 두께 | INTENT 제외 범위(D-15) |
| 기준 화면 대조 | R-2는 편집기 화면 대조를 하지 않는다(SPEC R-2) |
