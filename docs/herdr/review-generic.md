Phase {N} 코드 리뷰 {R}회차. 파일은 고치지 않는다.
대상: D:\projects\workbench-tauri 의 미커밋 변경(git status / git diff, 새 파일 포함; lock 파일 본문·target 제외).
기준: specs/v0.1/PLAN.md "Phase {N}", 대응 SPEC R-n 의 정해진 결과·판정 방법, DECISIONS, AGENTS.md.
볼 것: SPEC 판정을 실제로 만족시키지 못하거나 증거 덤프가 판정을 속일 수 있는 구현(예: 항상 true 를 내는 검사), Solid 반응성 함정(D-3), 목록 밖 의존성, CSP·capabilities 완화, Zed 코드 복사 흔적, 메모리 누수·리스너 해제 누락.
{EXTRA}
출력은 지적마다 한 줄: "번호/Major|Minor/파일:줄/문제/제안" (각 150자 이내). 최대 10건. 끝에 "끝".
