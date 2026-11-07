# ORDER-06-R2 보고 — tauri-leader · 2026-11-07

상위: `D:\projects\workbench-core\specs\v0.5\orders\ORDER-06-R2.md` 2장. tauri는 문서만 했다(writer W-12). 코드 변경, 앱 실행, push 없음.

## 1. 한 것 (완료 기준 2)
- `specs/v0.5/SPEC.md` R-2에 두 소절을 넣었다. gpui가 읽어 대조하는 용도다.
  - *Settings 행 문구 표*
    - Zed `crates/settings_ui/src/page_data.rs`(커밋 4304dec732)의 문구를 그대로 옮기고 줄 번호를 적었다. 코드는 옮기지 않았다.
    - 앱 표시와 Zed 문구를 두 칸으로 나눠 적었다.
  - *Extensions 화면 항목 표*
    - 설치 상태 전환과 범주 칩(순서·처음 값), 검색 대상과 규칙, 필터 조합, 정렬, 빈 상태 문구를 적었다.
    - 카드 필드별로 출처·빈 값 처리·표시를 적고, 치수 X-44~X-49를 적었다.
- `specs/v0.5/PROGRESS.md`에 한 항목을 더했다.
- 문서에 U+0000~0008·000B~001F 제어 문자가 없음을 확인했다.

## 2. Settings: 앱과 Zed 문구 대조
- 같은 것:
  - Appearance(1686)
  - 소제목 Theme(559)·Buffer Font(925)·UI Font(1104)
  - 네 행의 제목과 설명:
    - Theme Name: "The name of your selected theme." (627~628)
    - Icon Theme Name: "The name of your selected icon theme." (808~809)
    - UI Font Size: "Font size for UI elements." (1120~1121)
    - Buffer Font Size: "Font size for editor text." (941~942)
- 다른 것 (tauri 코드에 남은 차이):
  1. **소제목 순서**: Zed는 Theme → Buffer Font → UI Font(`concat_sections!` 1672~1675)이고, 앱은 Theme → UI Font → Buffer Font다.
  2. **Theme Mode(563~564)·Icon Theme(742~743) 선택 행**: Zed는 이 행에서 Static/Dynamic을 고르고, 앱은 Static일 때 보이는 행만 둔다(ORDER-06-R1 결정 "행 4개"를 따름).
  - 1은 Zed와 다르다. 이번 카드가 문서만이라 고치지 않았다. 고치려면 coder 카드 한 장(V1)이면 된다. gpui도 tauri SPEC을 읽고 같게 하므로, 두 갈래 모두 Zed 순서로 맞출지 결정을 바란다.
  - 2는 앞 결정대로 두었다.

## 3. gpui SPEC R-2 Extensions 표(217~245줄)와 다른 곳
1. 검색 대상: gpui는 이름·설명이고 tauri는 이름·설명·작성자다.
2. 검색 규칙: gpui SPEC에는 대소문자 무시만 있다. tauri는 공백으로 나눈 검색어가 모두 들어 있어야 한다.
3. 자원 목록: gpui는 `Default Light`(Themes)와 `Zed (Default)`, tauri는 `One Dark`·`One Light`(Themes)와 `Zed (Default)`다. 테마 자원이 다르고 Phase 7(ORDER-07)에서 맞출 대상이다.
4. 목록 구성: gpui는 `RESOURCES` 고정 목록이고, tauri는 빌드 때 `src/theme/assets/**/*.json`을 자동으로 읽는다.
5. 정렬: gpui SPEC에 규칙이 없다. tauri는 테마 파일 경로 순, 그다음 `themes` 배열 순이고, 아이콘 테마가 맨 뒤다.
6. 빈 상태 문구: gpui SPEC에 없다. tauri는 `No extensions`/`No installed extensions`/`No uninstalled extensions`이고, 검색어가 있으면 ` that match "…"`를 붙인다.
7. 버전 표시: gpui SPEC에 `v` 접두사와 빈 값일 때 숨김이 적혀 있지 않다.
8. 메타데이터 출처: gpui는 "확장 manifest 등"이고, tauri는 테마 JSON의 theme/family 필드다. 빈 값이면 비우는 것은 같다.
9. 치수: gpui는 X-45~X-49를 적었고, tauri는 X-44~X-49에 L-05~L-07을 더 적었다. 값은 같은 스펙 ID다.
- 같은 것:
  - 제목과 검색칸 문구
  - 상태 전환과 칩 셋, 그 순서
  - 오른쪽 "Installed"(버튼 아님)
  - `All`=`Installed`, `Not Installed`=빈 목록
  - 탭 열기(이미 있으면 그 탭으로)

## 4. 남은 차이 (완료 기준 3)
- tauri 쪽:
  - Settings 소제목 순서가 Zed와 다르다(2절 1). 결정을 기다린다.
- gpui 쪽 (gpui가 tauri SPEC 표를 읽어 맞출 것):
  - 3절 1~2, 5~8.
  - 3절 3~4는 Phase 7 대상이다.
- 공통으로 그대로 둔 것(ORDER-06-R2 3장):
  - Licenses 표시 방식 → Phase 12 V4.
  - Panel Layout 폭 240 → 같다.

## 5. 커밋
- 문서 커밋 1개("v0.5 Phase 6 ORDER-06-R2: ..."). push하지 않았다.
