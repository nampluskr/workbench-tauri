## 6. #11 결과 표 (checker가 JSON으로 정리, release exe `267cfa5`, 1920×1080 100%, One Dark)
근거: `v3-regress.json`, `v3-regress-fix.json`, `c11-release-regress.png`.
| 항목 | 값 | 판정 |
|---|---|---|
| I-1 입력 글자 | `14px` | PASS |
| I-2 트리 글자색 | `rgb(169,175,188)` = `#a9afbc` | PASS |
| I-3 트리 드래그·되돌리기 | 첫 시도 실패는 sticky(위 5절) 때문, 다시 잰 값 `moved true, oldGone true` | PASS |
| I-4 Outline | Python `C/A`, `m`, `f` 배지 줄 | PASS |
| I-5 Lock Preview | `pressed true`, 임시 미리보기 탭 `Preview other.md italic` | PASS |
| I-6 검색 탭 | `search_tabs 2` | PASS(기대값이 JSON에 없음, 값만 근거) |
| I-7 HTML 스크립트 | `I7_htmlScript ran` | PASS |
| I-8 마크다운 h2 | `22px`, 리스트 간격 `4px` | PASS |
| I-9 미리보기 찾기 | `I9_findBar true` | PASS |
| I-10 코드 글꼴 | 편집기 `"JetBrains Mono", "Malgun Gothic", monospace`, 코드 블록 `"JetBrains Mono"` | PASS |
| I-11 Preview 배경 | `rgb(47,52,62)`(코드 블록)·`rgb(40,44,51)` | PASS |
| I-12 코드 머리 줄 | 언어 `python` | PASS |
| I-13 마지막 탭 | `closeRight 1348 ≤ edgeLeft 1353` | PASS |
| 미리보기 종류 | 마크다운 위치 연계(옆 미리보기 블록 클릭 → 편집기 줄 `## End`, panes 2), CSV, SVG, HTML, ipynb(2), 이미지, PDF, 수식(`math true`), Mermaid(`mermaid true`) | PASS |
- 메모: `about.ver`가 `"workbench-tauri"`로 버전이 아니라 이름이다(release 앱 정보에서 0.8.1 확인 못 함). #9의 파일 ProductVersion 0.8.1로 갈음하나, 앱 정보 대화상자의 버전 표시를 보려면 `about_info`의 버전 필드를 읽는 값이 따로 필요하다. 판정에는 안 넣었다.
- `syncEditorLine: null`(첫 측정)은 다시 잰 `sync line "## End"`로 해소.

