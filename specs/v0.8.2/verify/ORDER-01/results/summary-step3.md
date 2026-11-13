# ORDER-01 V3 Measurement Results

- 측정일시: 2026-11-13T15:04:21.755Z
- 대상 버전: 0.8.2 (`D:\projects\workbench-tauri\src-tauri\target\debug\workbench-tauri.exe`)
- 대조 버전: 0.8.1 (`C:\nonexistent.exe`)
- 창 크기: 1440x852 (100%)
- 테마: One Dark (기본값)

## 완료 기준별 판정 표

| # | 완료 기준 | 기대값 | 측정값 | 판정 | 근거 파일 |
|---|---|---|---|---|---|
| 2 | About 버전 | Version 0.8.2 | 측정 불가 | 측정 불가 | src-tauri/tauri.conf.json:3, src/shell/About.tsx:51 |
| 3 | 설정 없을 때 기본값 | 에디터 14, 미리보기 14, 본문 너비 700, 여백 14, 간격: 7, 14, 5.25, 3.5 | 에디터 nullpx, 미리보기 nullpx, 너비 nullpx, 간격 7/14/5.25/3.5 | 측정 불가 | src/settings/model.ts:11, src/spec/metrics.ts:447 |
| 4 | 저장된 값 & 키 이관 | 15/16 보존, 0.8.1 대조 간격 오차 <= 0.2px, Settings 변경 시 새 키+주석 보존 | 측정 불가 | 측정 불가 | src/settings/model.ts:90-110, src/settings/model.test.ts:75-115 |
| 5 | 미리보기 18px | 간격 9, 18, 6.75, 4.5, 너비 900, 여백 18, 설명에 16px 문장 없음 | 측정 불가 | 측정 불가 | src/spec/metrics.ts:430, src/settings/model.ts:50-55 |
| 6 | 0.8.1 원인 재현 | 휠: 편집 탭 유지 / 미리보기 0 리셋, CDP 대입: 편집 탭 0 리셋 | 측정 불가 (편집 휠 유지: undefined, 미리보기 휠 리셋: undefined, CDP 리셋: undefined) | 측정 불가 | ORDER-01 K-01 보고 5절 5번, src/shell/view-scroll.ts:2-5 |
| 7 | 같은 pane 탭 전환 (0.8.2) | 6종 탭 모두 갔다 온 앞뒤 차이 <= 1px (win-input 휠) | 측정 불가 | 측정 불가 | src/shell/Pane.tsx:441, src/shell/view-scroll.ts:16 |
| 8 | 분할 pane 탭 전환 (0.8.2) | 분할 pane 오갈 때, 탭 전환, 재분할 후 위치 보존 (오차 <= 1px) | 측정 불가 | 측정 불가 | src/shell/Pane.tsx:441, src/workspace/context.ts:130 |
| 9 | 회귀 검증 | M-1 연계, #id 링크, Outline 클릭, 다시 그리기, HTML 격리 5조건+요청 0 | 측정 불가 | 측정 불가 | src/shell/markdown-preview.ts:167, src/editor/html.ts:163 |

## 원시 데이터 (JSON)

```json
{
  "c6": {
    "criterion": "#6 Cause reproduction (0.8.1)",
    "status": "측정 불가",
    "reason": "0.8.1 exe not found"
  },
  "c3": {
    "criterion": "#3 Default values (no config)",
    "status": "측정 불가",
    "expected": "14px font, 700px width, 14px padding, 7/14/5.25/3.5 gaps",
    "measured": {
      "editorFontSize": null,
      "previewMetrics": {
        "previewFontSize": null,
        "maxWidth": null,
        "padding": null,
        "paragraphLineGap": 7,
        "paragraphGap": 14,
        "listLineGap": 5.25,
        "listGap": 3.5
      },
      "settingsValues": {
        "editorFontSize": null,
        "previewFontSize": null,
        "paragraphLineSpacing": null,
        "paragraphSpacing": null,
        "listLineSpacing": null,
        "listSpacing": null
      }
    },
    "reason": "Could not read computed styles from DOM elements"
  }
}
```
