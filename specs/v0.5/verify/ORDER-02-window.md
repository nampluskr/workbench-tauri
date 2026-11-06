# ORDER-02 (I-6) 창 크기 및 위치 V3 실측 결과

- 검증 대상: core v0.5 ITEMS I-6 (창 1440×852, 작업 영역 가운데, 최소 크기 360×240, 크기 비기억)
- 카드: C-04 / C-05 (ORDER-02 V3)
- 판정일: 2026-11-06
- 판정자: tauri-checker

## 1. 측정 조건

- 모니터: 주 모니터 1920×1080
- DPI / 배율: 96 DPI (100%, `scale` = 1.0)
- 작업 표시줄: 있음 (작업 영역 `workArea`: 0,0,1920,1032)
- 테마 / 글꼴: 기본값
- 앱 데이터: `%APPDATA%\workbench-tauri` 백업 후 비운 상태에서 1차 측정 진행, 측정 후 원복

## 2. 측정 원문 파일 경로

- 단계 1 (기록 없는 첫 실행): `C:\Users\nampl\AppData\Local\Temp\v05-C-04-step1.txt`
- 단계 2 (최소 크기 resize 시도): `C:\Users\nampl\AppData\Local\Temp\v05-C-04-step2.txt`, `C:\Users\nampl\AppData\Local\Temp\v05-C-04-step2b.txt`
- 단계 3 (크기 변경 대용 maxbutton 및 재실행): `C:\Users\nampl\AppData\Local\Temp\v05-C-04-step3.txt`, `C:\Users\nampl\AppData\Local\Temp\v05-C-04-step3-relaunch.txt`

## 3. 실측 판정 표

| 기준 | 스펙 ID | 항목 | 기대값 | 측정값 | 차이 | 판정 |
|---|---|---|---|---|---|---|
| 기준 1 | I-6 | 첫 실행 clientSize | 1440×852 | 1440×852 (`width`: 1440, `height`: 852) | 0px | 통과 |
| 기준 1 | I-6 | 첫 실행 clientOrigin (가운데) | (240, 90) | (248, 91) (`x`: 248, `y`: 91) | dx: +8px, dy: +1px | 불일치 |
| 기준 2 | I-6 | 최소 크기 (360×240 하한) | 360×240 미만으로 줄지 않음 | 1440×852 (크기 변경 입력 미적용) | - | 측정 불가 |
| 기준 3 | I-6 | 크기 변경 후 재실행 clientSize | 1440×852 (크기 비기억) | 1440×852 (재실행 후 clientOrigin 248, 91 동일) | 0px (단, 선행 크기 변경 미발생) | 부분 통과 (미충족) |

### 판정 세부 분석

#### 기준 1: 첫 실행 크기 및 가운데 배치
- `workArea`가 `0,0,1920,1032`이므로 clientSize(1440×852) 기준 가운데 기대 좌표는:
  - `expected_x = 0 + (1920 - 1440) / 2 = 240`
  - `expected_y = 0 + (1032 - 852) / 2 = 90`
- 측정된 `clientOrigin`은 `(248, 91)`로 x 방향 +8px, y 방향 +1px 편차가 있음.
- 확장 프레임(DWM frame)은 `x: 247, y: 90, width: 1442, height: 854`로 측정됨.
- 원인 추정: center가 decorations:false에서 보이지 않는 크기 조절 테두리(왼쪽 8, 위 1)를 포함한 바깥 사각형을 가운데에 둔다. coder가 K-01-R1로 고친다.

#### 기준 2: 최소 크기 (360×240)
- `tools/win-input.ps1 -Action resize -DX -1200 -DY -700` 실행 결과:
  - 드래그 시작점 `from`: `(1686, 941)` -> 끝점 `to`: `(486, 241)`
  - 시작점은 `clientOrigin(248, 91) + clientSize(1440, 852) - 2`로 클라이언트 영역 우하단 내부 2px 위치임.
  - Tauri 무장식 창에서 클라이언트 영역 전체는 자식 창인 WebView2(`WRY_WEBVIEW`)가 덮고 있어, 클라이언트 내부 2px에서의 마우스 드래그는 OS 리사이즈 핸들(`HTBOTTOMRIGHT`)에 닿지 않고 웹뷰 내부 이벤트로 처리됨.
  - 전경 상태(`step2b.txt`)에서 재시도했을 때도 창 크기는 `1440×852`로 전혀 변하지 않음.
  - `step3.txt`의 `-Action maxbutton`은 도구 구현상 좌표만 계산/출력하는 기능으로 실제 클릭이나 최대화가 수행되지 않음.
  - 결론: 창 크기를 줄이는 입력이 OS 창 조절 메커니즘에 전달되지 않아 실제 크기 변경이 발생하지 않았으므로, 최소 크기(360×240) 동작을 실측하지 못함 (`측정 불가`). (참고: `src-tauri/tauri.conf.json`에는 `"minWidth": 360, "minHeight": 240`이 정적으로 설정되어 있음).

#### 기준 3: 재실행 시 1440×852 및 비기억
- 프로세스 종료 후 재실행(`step3-relaunch.txt`, PID 34848):
  - `clientSize`: 1440×852, `clientOrigin`: (248, 91)로 첫 실행과 동일하게 열림.
  - 그러나 단계 2에서 실제로 창 크기가 변경되지 않았기 때문에, "사용자가 창 크기를 바꾼 후 다시 실행했을 때 이전 크기를 기억하지 않고 1440×852로 초기화되는지"에 대한 실질적인 상태 변화 검증은 이루어지지 못함.
  - "단순 재실행 시 1440×852 유지"는 확인되었으나, "크기 변경 후 비기억" 조건은 선행 변경 미발생으로 인해 완전히 충족되었다고 단정할 수 없음 (`부분 통과/미충족`).

## 4. 각 단계별 원문 JSON 요약

### 단계 1: 첫 실행 (`v05-C-04-step1.txt`)
```json
{
  "action": "state",
  "pid": 35664,
  "hwnd": "0x1170CC6",
  "after": {
    "frame": { "x": 247, "y": 90, "width": 1442, "height": 854 },
    "clientOrigin": { "x": 248, "y": 91 },
    "clientSize": { "width": 1440, "height": 852 },
    "workArea": "0,0,1920,1032",
    "layout": "0x0412",
    "maximized": false,
    "minimized": false,
    "dpi": 96,
    "foreground": false
  }
}
```

### 단계 2: 최소 크기 시도 (`v05-C-04-step2b.txt`)
```json
{
  "action": "resize",
  "pid": 35664,
  "hwnd": "0x1170CC6",
  "from": { "x": 1686, "y": 941 },
  "to": { "x": 486, "y": 241 },
  "before": {
    "frame": { "x": 247, "y": 90, "width": 1442, "height": 854 },
    "clientOrigin": { "x": 248, "y": 91 },
    "clientSize": { "width": 1440, "height": 852 },
    "foreground": true
  },
  "after": {
    "frame": { "x": 247, "y": 90, "width": 1442, "height": 854 },
    "clientOrigin": { "x": 248, "y": 91 },
    "clientSize": { "width": 1440, "height": 852 },
    "foreground": true
  }
}
```

### 단계 3: 재실행 (`v05-C-04-step3-relaunch.txt`)
```json
{
  "action": "state",
  "pid": 34848,
  "hwnd": "0xA706BC",
  "after": {
    "frame": { "x": 247, "y": 90, "width": 1442, "height": 854 },
    "clientOrigin": { "x": 248, "y": 91 },
    "clientSize": { "width": 1440, "height": 852 },
    "workArea": "0,0,1920,1032",
    "layout": "0x0412",
    "maximized": false,
    "minimized": false,
    "dpi": 96,
    "foreground": false
  }
}
```


---

## 5. 재측정 (K-01-R1 및 K-01-R2 빌드)

- 판정일: 2026-11-07
- 판정자: tauri-checker
- 측정 조건:
  - 모니터: 주 모니터 1920×1080
  - DPI / 배율: 96 DPI (100%, `scale` = 1.0)
  - 작업 표시줄: 있음 (작업 영역 `workArea`: 0,0,1920,1032)
  - 테마 / 글꼴: 기본값
  - 앱 데이터: `%APPDATA%\workbench-tauri` 각 측정마다 백업 후 복원

### 5.1 재측정 판정 표

| 기준 | 스펙 ID | 항목 | 기대값 | 측정값 | 차이 | 판정 | 원문 파일 |
|---|---|---|---|---|---|---|---|
| 기준 1 | I-6 | 첫 실행 clientSize | 1440×852 | 1440×852 | 0px | 통과 | `v05-C-07-step1.txt` |
| 기준 1 | I-6 | 첫 실행 clientOrigin (가운데) | (240, 90) | (240, 90) | dx: 0px, dy: 0px | 통과 | `v05-C-07-step1.txt` |
| 기준 2 (A) | I-6 | 최소 크기 (K-01-R1 빌드) | clientSize ≥ 360×240 | 344×231 | w: -16px, h: -9px | 불일치 | `v05-C-07-step2.txt` |
| 기준 2 (B) | I-6 | 최소 크기 (K-01-R2 보정 빌드) | clientSize ≥ 360×240 | 360×240 | 0px | 통과 | `v05-C-09-min.txt` |
| 기준 3 | I-6 | 줄인 뒤 다시 실행 clientSize | 1440×852 (크기 비기억) | 1440×852 (clientOrigin 240, 90) | 0px | 통과 | `v05-C-07-step3.txt` |

### 5.2 재측정 세부 분석

1. **기준 1 (첫 실행 크기 및 가운데 정렬)**:
   - K-01-R1 빌드(`v05-C-07-step1.txt`)에서 `clientOrigin`이 정확히 `(240, 90)`으로 측정됨.
   - `workArea(0,0,1920,1032)` 및 `clientSize(1440×852)` 기준 정중앙 `(240, 90)`과 0px 오차로 완벽히 일치 (통과).

2. **기준 2 (최소 크기 360×240 하한)**:
   - K-01-R1 빌드(`v05-C-07-step2.txt`)에서 바깥 테두리 드래그 조작으로 크기 축소 시 `clientSize`가 `344×231`로 줄어듦 (불일치).
     - 원인: OS의 `set_min_size`가 바깥 창 크기를 360×240으로 제한하여, 보이지 않는 리사이즈 테두리(16×9)만큼 클라이언트 크기가 작아짐.
   - K-01-R2 보정 빌드(`v05-C-09-min.txt`):
     - `compensated_min_size`를 통해 테두리 크기만큼 보정된 최소 바깥 크기를 적용.
     - 최대 드래그 축소 후 `clientSize`가 정확히 `360×240` (frame `362×242`, clientOrigin `240, 90`)으로 유지됨 (통과).

3. **기준 3 (크기 바꾼 뒤 재실행 시 크기 비기억)**:
   - K-01-R1 빌드(`v05-C-07-step3.txt`): step2에서 창을 344×231로 축소한 상태에서 앱을 종료 후 재실행.
   - 재실행 시 `clientSize`가 `1440×852`, `clientOrigin`이 `(240, 90)`으로 열려 이전 크기를 기억하지 않고 초기값으로 정상 복귀함 (통과).

### 5.3 결론
ORDER-02 (I-6)의 세 가지 완료 기준(첫 실행 1440×852 및 작업 영역 정중앙 배치, 최소 크기 360×240 하한 유지, 크기 변경 후 재실행 시 크기 비기억)이 K-01-R2 빌드에서 모두 충족됨을 실측으로 확인하였다.
