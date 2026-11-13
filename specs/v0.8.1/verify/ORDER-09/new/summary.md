# ORDER-09 I-16~I-23 실측 준비 및 판정 요약

| # | 항목 | 판정 기준 (Target) | 결과 요약 | 상태 |
|---|---|---|---|---|
| 1 | I-16 트리 선택 배경 | 폴더 맨 클릭/커서 행 배경 없음, marked/active 행 배경 유지 | folderPlain bg: rgba(0, 0, 0, 0) | **PASS** |
| 2 | I-17 우클릭 Undo/Redo | Paste 뒤 Undo/Redo, 비활성/활성 상태 및 이동 복구 | initUndoDisabled: true, diskMoved: false, restored: true, reMoved: false | **PASS** |
| 3 | I-18 Outline 키보드 이동 | Tab 포커스, 방향키 이동, Enter 줄 점프, 커서 격리 유지 | jumpLine: ### Windows, preserved: true | **PASS** |
| 4 | I-19 코드 블록 테두리 | 21개 테마 border.variant 1px 테두리 및 배경 대비 | 21 themes border=1px solid: All 21 valid | **PASS** |
| 5 | I-20 ipynb 출력 음영 | nb-output / nb-traceback 배경 투명, 코드 셀 음영 유지 | outBg: rgba(0, 0, 0, 0), tbBg: rgba(0, 0, 0, 0) | **PASS** |
| 6 | I-21 느슨한 목록 간격 | 느슨한 목록 끝 -> 문단 잉크 간격 50±1px (margin stack 28px) | ink: 51px (stack: 28px) | **PASS** |
| 7 | I-22 #슬러그 링크 | 한글 제목/중복 -1 이동 (topDiff <= 2), 무효 id 스크롤 불변 | diffKorean: 0px, diffUsage1: 0px, diffUsage2: 0px, invalidUnchanged: true | **FAIL** |
| 8 | I-23 목록 간격 비례 | 미리보기 16/20/24px 비례 (4/5/6px, 6/7.5/9px), 설명 문구 | 16px: 4px, 24px: 6px | **PASS** |