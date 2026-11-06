[DONE] ORDER-04 tauri

## 완료 기준
| 항목 | 판정 방법 요약 | 결과(충족/미충족/BLOCKED/이미 같음) | 측정값·캡처 경로 |
|---|---|---|---|
| 1. 경로를 보이는 모든 앱 자리에서 `\` | V3 캡처 + CDP Rendered Fonts | 이미 같음(충족, 코드 변경 없음) | 아래 위치별 표. 덤프 `specs/v0.5/verify/ORDER-04/tauri-i20.json`, 판정 `specs/v0.5/verify/ORDER-04/ORDER-04-judgement.md`(checker C-17) |
| 2. 원인·고친 방법 | 보고 | 고친 것 없음 | Phase 3 글꼴(I-14) 덕분에 그대로 `\`다. 앱 자리의 Rendered Fonts는 IBM Plex Sans 또는 Lilex뿐이고 Malgun Gothic은 0이다. 두 글꼴은 U+005C를 `\`로 그린다. |
| 3. I-11·I-12 자리 | 보고 | Phase 9에서 다시 본다 | 탭 경로 툴팁(I-11)과 경로 줄(I-12)은 지금 없다(K-07 코드 조사). 탭에는 닫기·고정 해제 툴팁만 있고, 편집 영역 위 toolbar에는 Preview Markdown 버튼만 있다. |
| 4. I-14 글꼴 유지 | 덤프 | 충족 | UI 자리는 IBM Plex Sans, 버퍼 자리(편집기·코드)는 Lilex로 렌더된다(아래 표). 이번 카드에서 코드 변경은 없다. |

### 위치별 결과 (CDP `CSS.getPlatformFontsForNode`, `₩`(U+20A9) 포함 여부)
| 자리 | 보인 글자 | Rendered Fonts | 결과 | 캡처 |
|---|---|---|---|---|
| 파일 트리 compact 행 | `docs\refs` | IBM Plex Sans 9 | `\` | `tauri-1-sidebar-tree.png` |
| 파일 트리 경로 툴팁 | `~\AppData\Local\Temp\v05-i20\docs\refs\paths.md` | IBM Plex Sans 47 | `\` | `tauri-2-tree-tooltip.png` |
| 사이드바 폴더 이름(드라이브 루트) | `D:\` | IBM Plex Sans 3 | `\` | `tauri-1-sidebar-tree.png` |
| 타이틀 바 프로젝트 이름 | `D:\` | IBM Plex Sans 3 | `\` | `tauri-6-drive-root.png` |
| 파일 트리 루트 행 | `D:\` | IBM Plex Sans 3 | `\` | `tauri-6-drive-root.png` |
| 편집기 본문(3줄) | `C:\Users\example\notes.txt` 등 | Lilex 33·41·37 | `\` | `tauri-3-editor.png` |
| 미리보기 본문 | `Plain: C:\Users\example\notes.txt` | IBM Plex Sans 33 | `\` | `tauri-5-preview.png` |
| 미리보기 코드(인라인·블록) | `D:\projects\workbench-tauri\src`, `C:\Windows\System32\drivers\etc\hosts` | Lilex 31·37 | `\` | `tauri-5-preview.png` |
| 네이티브 미저장 닫기 확인(TaskDialog) | `` `docs₩refs₩paths.md` contains unsaved edits. Do you want to save it? `` | OS 시스템 UI 글꼴(측정 불가, 맑은 고딕 추정) | **OS 표시**(판정 제외) | `tauri-4-dialog.png` |

- 측정하지 않은 앱 자리는 코드 확인으로 판정했다. 트리 입력란, 토스트, 메뉴, 기타 툴팁이 해당하며, 모두 같은 UI 글꼴 경로다(`--ui-font-family` 상속, C-17 3.1).
- 그 밖의 네이티브 자리도 "OS 표시"다. 여러 파일 미저장 확인, 저장 실패 확인, 폴더 선택 창, 미리보기 링크의 title 팝업이 해당한다.
  - 근거: core-leader 결정 2026-11-07(D-13). OS 시스템 UI 글꼴(맑은 고딕)이 U+005C를 ₩로 그리고, 앱이 그 글꼴을 바꿀 수 없다. 문구의 구분자는 바꾸지 않았다.
  - 이 자리들은 Phase 12 사용자 확인(V4)에 올린다.
- 조건:
  - 1920×1080, 100%, 클라이언트 1440×852, 테마 Catppuccin Mocha.
  - 테스트 폴더 `%TEMP%\v05-i20`(`docs\refs\paths.md`). 사이드바·타이틀 바·트리 루트에 `\`가 보이도록 `D:\`를 등록 폴더로 넣었다.
  - 자리 목록은 coder 코드 조사 K-07(전 표시 자리 29개)에서 뽑았다.
- 개인 정보: `D:\` 트리 캡처는 드라이브 폴더 이름이 보여 위 64px만 남겼고, 덤프에서도 그 목록을 뺐다.

## Zed에서 확인한 것
해당 없음(카드 4장: Zed와 비교하지 않는다). Zed는 띄우지 않았다.

## 글꼴 파일 (D-10)
변경 없음.

## 바꾼 파일
- 앱: 없음.
- 문서: `specs/v0.5/SPEC.md`(R-20 실측 결과·근거·OS 표시 제외·I-11·I-12는 Phase 9), `specs/v0.5/PLAN.md`(Phase 4 done), `specs/v0.5/PROGRESS.md`.
- 검증 결과: `specs/v0.5/verify/ORDER-04/`(캡처 6장, `tauri-i20.json`, `ORDER-04-judgement.md`).
- 커밋: `git log -1 -- specs/v0.5/reports/ORDER-04.md`. push 안 함.

## 검토
- coder K-07: 경로 표시 자리 정적 조사(코드 변경 없음).
- 화면 차례 1회. 앱은 측정 세션당 1회 실행했고 launchApp PID 28896만 닫았다.
  - TaskDialog는 그 PID가 가진 창만 찾아 캡처했다. 닫을 때는 WM_CLOSE(Cancel)를 그 창에만 보냈다. 편집은 되돌렸고 파일은 저장하지 않았다.
- 앱 데이터 `%APPDATA%\workbench-tauri`는 백업하고 복원했다.
- checker 판정 C-17: 앱 자리 12항목 충족, 불일치 0. 네이티브 자리는 OS 표시, I-11·I-12는 Phase 9.
- 전체 검사: 코드 변경이 없어 다시 돌리지 않았다(ORDER-03-R1 커밋 직전 검사 그대로).
- 진행 중 사항: checker(agy)가 허용 목록 밖의 읽기 명령에 승인을 물었다. `Get-ChildItem`으로 verify 폴더 목록을 두 번 읽으려 했고, 판정 파일 생성도 물었다. leader가 각각 1회만 승인했다(always allow 아님).

## 사용자 확인 필요(V4)
- 네이티브 대화 상자의 `₩` 표시(OS 표시): 미저장·저장 실패 확인 TaskDialog, 폴더 선택 창, 미리보기 링크 title 팝업. 캡처는 `tauri-4-dialog.png`.

## BLOCKED
없음
