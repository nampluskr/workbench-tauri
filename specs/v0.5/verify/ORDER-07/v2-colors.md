# ORDER-07 V2 색 대조 (tauri, 21 테마 × 12 자리)

- 측정: CDP getComputedStyle(CSS 변수·계산 색) + 캡처 픽셀(자리 중심 ±12px×3 최빈 색). 기대값 = 테마 JSON 토큰(반투명은 아래 배경과 합성). 원자료 `tauri-main.json`.
- css=json: 표기(대소문자·#rgb/#rgba·rgb())를 맞춘 뒤 CSS 값이 JSON 값과 같은 자리 수.
- 차이: 그려진 픽셀과 기대값의 채널 최대 차이. 평면 = selection 밖 11자리, 선택 = 반투명 players[0].selection.

| 테마 | css=json | 최대 차이(평면) | 최대 차이(선택) | 대체값 사용 토큰 |
|---|---|---|---|---|
| Catppuccin Latte | 12/12 | 1 | 1 | 없음 |
| Catppuccin Frappé | 12/12 | 1 | 2 | 없음 |
| Catppuccin Macchiato | 12/12 | 1 | 2 | 없음 |
| Catppuccin Mocha | 12/12 | 2 | 1 | 없음 |
| Catppuccin Latte - No Italics | 12/12 | 1 | 1 | 없음 |
| Catppuccin Frappé - No Italics | 12/12 | 1 | 2 | 없음 |
| Catppuccin Macchiato - No Italics | 12/12 | 1 | 2 | 없음 |
| Catppuccin Mocha - No Italics | 12/12 | 2 | 1 | 없음 |
| macOS Classic Light | 12/12 | 0 | 6 | 없음 |
| macOS Classic Dark | 11/12 | 0 | 3 | text.accent → #74ade8ff (대체) |
| One Dark | 12/12 | 1 | 3 | 없음 |
| One Light | 12/12 | 0 | 3 | 없음 |
| Ayu Dark | 12/12 | 2 | 7 | 없음 |
| Ayu Light | 12/12 | 0 | 6 | 없음 |
| Ayu Mirage | 12/12 | 1 | 4 | 없음 |
| Gruvbox Dark | 12/12 | 1 | 1 | 없음 |
| Gruvbox Dark Hard | 12/12 | 1 | 1 | 없음 |
| Gruvbox Dark Soft | 12/12 | 1 | 1 | 없음 |
| Gruvbox Light | 12/12 | 3 | 4 | 없음 |
| Gruvbox Light Hard | 12/12 | 3 | 6 | 없음 |
| Gruvbox Light Soft | 12/12 | 3 | 4 | 없음 |

자리: title_bar (title_bar.background), status_bar (status_bar.background), panel (panel.background), tab_bar (tab_bar.background), tab_active (tab.active_background), editor (editor.background), active_line (editor.active_line.background), selection (players[0].selection), text (editor.foreground), line_number (editor.line_number), border (border), accent (text.accent).

합계: css=json 251/252 (나머지는 JSON에 없는 토큰의 대체값).
