[DONE] ORDER-08 tauri

> 근거 경로의 `v/`는 `specs/v0.8.1/verify/ORDER-08/`, `lp/`는 `v/leader-probe/`. 중간 보고: `C:\Users\nampl\AppData\Local\Temp\v081-ORDER-08-interim.md`.

## 완료 기준
| 항목 | 판정 방법 한 줄 | 결과 | 근거 |
|---|---|---|---|
| 1 측정 먼저 | 측정 1~3의 방법·결과(프로세스 앞뒤, CPU, 30초 이상) | 충족 | 아래 "측정 1~3". `v/m-host-r1.json`(후보 A·B), `v/m-host.json`(C·D, 40초 CPU), `lp/probe.mjs`(A·B가 `chrome-error://`) |
| 2 루프 뒤 복구 | 루프 미리보기 → 닫기/고치기 → `page.html`·시안이 그려짐, 루프를 연 채 다른 pane도 그려짐 | 충족 | `v/v3.json` c2: 루프 알림 뒤 `page.html` "ran"(preview), 시안 "Outline 시안 5안" 6개(preview), 루프 파일 고친 뒤 "recovered successfully"(preview2), 루프 연 채 옆 pane `page.html` "ran"·루프 탭 다시 렌더 뒤에도 "ran". 캡처 `v/c2-after-loop-page.png`·`c2-after-loop-mockup.png`·`c2-loop-fixed-redraw.png`·`c2-split-pane-loop-and-page.png`. `lp/probe6.mjs`(앱 앞): 루프 탭 닫고 26초 뒤 webrtc.html·page.html pong 10/10 |
| 3 응답 없음 알림 | 루프 자리에 알림, 보통 페이지·빠른 탭 전환 10번에 알림 없음 | 충족 | `v/v3.json` c3_c4: 5초에 알림(`v/c3-hang-notice.png`). c3: 보통 페이지 10초·탭 전환 10번 알림·토스트 0. c3_background_window_test 보통 페이지: 다른 창이 앞 15초·앱 복귀 10초 알림 0(passed). 하네스 c6의 알림은 하네스 탓으로 판정 — 같은 페이지를 앱 앞에서 UI로 열면 알림 0·pong 6~10(`lp/probe7.json`, 아래 "c6 하네스 알림") |
| 4 앱 멈추지 않음 | 루프 동안 트리·탭·편집 동작, 루프 뒤 CPU | 충족 | `v/v3.json` c3_c4: 루프 중 앱 응답 1ms·편집/탭 조작 통과, 루프 렌더러(PID 45708) 0초 살아 있음 CPU 8.77s → 10·20·30초 없음(알림 때 프레임을 빼서 끝남). `lp/probe6.mjs`: 탭 닫고 3초 안에 끝남 |
| 5 I-7 격리 그대로 | ORDER-07 시험 HTML 다섯 결과가 같음 | 충족 | `v/v3.json` c5: 부모 DOM·top·저장소·cookie·`__TAURI__`·IPC 4종 모두 blocked(전역 `__TAURI_INTERNALS__`·`ipc`·`chrome.webview` 존재만 ORDER-07과 같이 REACHED, 호출은 실패), 인터넷 요청 0·8종 blocked, 이동 6종 뒤 "Started at" 그대로, meta refresh 무시, loopnav 5번 뒤 토스트. preview1 호스트에서도 isolation 스크립트·local.js 동작(alternate_host) |
| 6 유출 길 | WebRTC·`<link>` 넷·sendBeacon·EventSource 외부 요청 0(두 방식), WebRTC ICE·STUN 결과 | 충족(leader-core 판정 대기) | 아래 "I-15 근거". 요약: 엔진 인자 뒤 모든 WebRTC 길 ICE 후보 0, LAN STUN 수신기 0패킷(`lp/probe7.json`·`lp/probe5b.json`, `v/v3.json` c6 12길 STUN 0), CDP 외부 요청 0, 앱 트리 새 UDP 0(c6). link 넷·beacon·EventSource CDP 0·앱 트리 TCP 0(`v/v3-r1.json` c6 links, `lp/probe7.json` beacon "sendBeacon returned: true / EventSource error (blocked)") |
| 7 보안 설정 | 앞뒤 값, 앱 script-src·connect-src·capability·asset 그대로, 앱 인라인 스크립트 막힘 | 충족 | 아래 "보안 설정 앞뒤". `v/v3.json` c7 앱 인라인 `script-src-elem` 위반. C-16 `git diff HEAD -- src-tauri/capabilities` 0 |
| 8 v0.8 기능 | 스타일 없는 HTML 테마 색·테마 바꿈, 로컬 CSS·이미지, Tab 들고 나기 | 충족 | `v/v3-r1.json` c8 One Dark 프레임 글자 rgb(220,224,229)·링크 rgb(116,173,232)·iframe 배경 rgb(40,44,51), One Light iframe 배경 rgb(250,250,250) + 캡처 `v/c8-plain-onedark.png`·`c8-plain-onelight.png`(밝은 배경·어두운 글자·링크색). 로컬 CSS(dashed)·이미지(32px) `v/v3.json` c5 isolation. Tab: 앱 포커스 IFRAME → BUTTON(들고 나감, `v/v3-r1.json` c8 tabNavigation) |
| 9 문서 | checker 모델 글 | 충족 | `2f6b7ba`: `AGENTS.md` 10행, `HERDR-SETUP.md` 0·1·2장 `gemini-3.8-flash-high` |
| 10 테스트 | 새 로직 테스트, 기존 통과, typecheck·cargo test·clippy 0 | 충족 | C-16(`C:\Users\nampl\AppData\Local\Temp\v081-C-16-report.md`): typecheck 0, `npm test` 310/310, `cargo test` 24, clippy 0. 새 테스트: `previewHost`(보통·피함·멈춘 적 있음 대기), headStart pong·RTCPeerConnection 지우기, PREVIEW_CSP webrtc |

## 측정 1~3 (구현 전, 시제품)
1. **프로세스** — 후보 A `http://preview.localhost:<port>/`·B `http://preview.p<n>.localhost/`는 CSP 우회(+reload) 뒤에도 preview 처리기에 들어오지 않고 `chrome-error://chromewebdata/`(WebView2 요청 필터·wry 경로에 안 걸림) → 쓸 수 없음. 후보 D(scheme 이름 하나 더, `http://preview1.localhost/`)는 처리되고 별도 렌더러 프로세스(D 첫 프레임에 새 PID, 같은 호스트끼리는 한 프로세스).
2. **루프 뒤 CPU(40초)** — 루프 렌더러 2.5초에 CPU 3.6s(1코어). 루프를 연 채 같은 호스트 새 프레임은 응답 없음, 다른 호스트는 그려짐. 루프 iframe을 빼면 렌더러가 5~10초 사이에 끝남(10~40초 없음), 그 뒤 두 호스트 모두 그려짐. ORDER-07 R1의 막힘은 닫은 직후(끝나기 전) 같은 호스트에 새 프레임을 붙여 그 프로세스를 붙잡은 것.
3. **frame-src** — CSP host-source `*`는 맨 왼쪽 라벨만이라 B는 `http://*.localhost`(한정 안 됨)로만 허용 가능, A는 `http://preview.localhost:*`로 한정 가능하나 1에서 못 씀. D는 호스트마다 `preview1: http://preview1.localhost`를 하나씩 더해 미리보기 호스트로 한정됨.

## I-15 근거 (#6)
- WebView2는 프레임 CSP `webrtc 'block'`을 지키지 않는다: 지킨 상태에서 ICE host·**srflx(공인 IP)** 후보, STUN 나감(`lp/probe2.mjs`).
- 프레임 머리 스크립트에서 `RTCPeerConnection`·`webkitRTCPeerConnection`을 지우면 본문·about:blank 자식(SecurityError)·window.open(null)·Worker(오류)·프로토타입 체인(생성자 0)은 막히지만, **srcdoc 자식 창은 지우는 코드가 없어 되살아남**: srflx 후보, 앱 트리 **network.mojom.NetworkService**(utility) 프로세스에 ICE 후보와 같은 포트의 UDP(`lp/probe5.mjs`·`probe5.json`).
- 엔진 인자: `--force-webrtc-ip-handling-policy=disable_non_proxied_udp`는 브라우저 명령줄에 들어가지만(평소·CDP 실행 둘 다, `lp/argcheck.ps1`) 효과 없음 — LAN STUN 수신기에 6패킷. `--webrtc-ip-handling-policy=disable_non_proxied_udp`는 후보 0·STUN 0패킷(`lp/probe5b.mjs`·`probe5b.json`). 채택.
- 채택 뒤(커밋 `1c9a430` 코드) 앱 앞에서 UI로 길마다 열고 프레임을 CDP 대상에서 직접 읽음(`lp/probe7.json`): direct "none | undefined", blank SecurityError, **srcdoc "srcdoc pc created"(후보 0)**, open null, worker onerror, proto hits 0 — 모두 LAN STUN 0패킷, 알림 0. 하네스 c6(`v/v3.json`): 12길(LAN·google STUN 각각) STUN 수신 0, 후보 0, CDP 외부 0, 앱 트리 새 UDP 0.
- 남는 것: 인자를 지킨 상태에서도 srcdoc 자식이 `RTCPeerConnection`을 만들면 NetworkService가 UDP 끝점 한 쌍을 열지만 STUN은 보내지 않는다(`lp/probe5b.json`, 수신 0).
- 하네스 c6의 판정 불가 길(알림으로 프레임이 빠져 페이지 결과 못 읽음): `v/v3.json` c6 direct_local·blank_local·srcdoc_local·worker_local·proto_local·direct_google·blank_google·worker_google·proto_google·beacon(알림), open_local·srcdoc_google·links(결과 못 읽음). 이 길들의 페이지 결과는 `lp/probe7.json`이 대신한다(links는 probe7에서도 앞 탭을 읽어 무효 — links 근거는 `v/v3-r1.json` c6 CDP 0·앱 트리 TCP 0).
- 기준선: WebView2 자체 외부 TCP — 미리보기를 열지 않은 빈 앱도 약 50초에 NetworkService가 Microsoft·CDN에 연결(0.8.1 debug: 23.55.51.144:80·150.171.27.11:443, 0.8.0 release: 150.171.28.11:443·146.75.114.172:80; 40초 안에는 둘 다 0). `lp/baseline-tcp-*.txt`. c6의 52.97.x·40.104.x:443 연결(브라우저 프로세스)도 같은 종류로 보고 미리보기 탓으로 세지 않음.

## c6 하네스 알림
하네스(`v/measure-v3.mjs`)로 잴 때만 c6 페이지에 "응답 없음"이 떴다(앱이 앞이어도). 같은 exe·같은 페이지를 앱 앞에서 UI로 열면 알림 0·pong 정상(`lp/probe3.mjs`, `lp/probe6.mjs`, `lp/probe7.json`). 원인을 하네스의 전경 강제·OS 스냅숏 사이 프레임 지연으로 본다(확정 못 함). 실제 사용에서 뒤 창일 때의 거짓 알림은 K-08e(포커스 없으면 ping 멈춤)로 고쳤고 c3_background_window_test 보통 페이지에서 확인.

## 검증
- C-16: `npm.cmd run typecheck` 0, `npm.cmd run test` 310/310, `cargo test` 24/24, `cargo clippy -- -D warnings` 0. 코드 리뷰 PASS.
- V3: debug exe, 1920×1080 100%, One Dark(테마 바꿈 단계는 One Light). 결과 `v/v3.json`(6회차, 최종) — 무효 회차 `v3-r0`(두 호스트 오염 발견)·`v3-r1`·`v3-r2`(옆 pane 프레임 오독)·`v3-r3`(뒤 창 거짓 알림 발견). 캡처 `v/c2-*.png`·`c3-hang-notice.png`·`c5-*.png`·`c6-*.png`·`c8-*.png`. leader 측정 `lp/`.
- release 빌드는 하지 않음(카드).

## 지운 것·더한 것·하지 않은 것
- 더함: scheme `preview1`·`preview2`(같은 처리기), 1초 ping·5초 응답 없음·20초 호스트 피함·멈춘 미리보기는 preview2만, 응답 없음 문단 알림, 프레임 RTCPeerConnection 지우기, WebView2 인자. 하지 않음: 스크립트 끄기 설정, 프로세스 kill, 미리보기 밖 동작 변경.
- 남은 위험: 같은 호스트의 다른 보통 미리보기도 함께 멈춰 "멈춘 적 있음"이 되어 preview2를 함께 씀. 서로 다른 루프 페이지 둘이 20초 안에 보통 호스트 둘을 멈추면 피하지 못함(`shortcut:` 주석, scheme을 늘리면 됨). 실제 페이지가 5초 넘게 스크립트를 돌리면 같은 알림이 뜸. 앱이 뒤에 있는 동안은 루프를 잡지 않고, 앱으로 돌아오면 5초 안에 잡힘(뒤 창 루프 시험은 알림이 3.8초에 떠 하네스의 5~7초 범위 밖으로 failed 표시 — 알림 자체는 떴다).

## tauri가 고른 것
- 응답 없음 기다림 5초(`PREVIEW_HANG_MS`), ping 1초(`PREVIEW_PING_MS`), 호스트 피함 20초(`PREVIEW_HOST_AVOID_MS`, 측정한 렌더러 종료 5~10초의 두 배). 스펙 값 아님(상수 주석).
- 알림 문구: "This HTML page is not responding. Its preview stops until the file or the theme changes."(계속 이동 토스트와 같은 꼴), 미리보기 자리 문단.
- 호스트 방식: scheme 이름을 늘림(포트·하위 도메인은 처리기에 안 들어옴). 셋(보통 둘 + 멈춘 미리보기 하나).
- I-15 엔진 인자 `--webrtc-ip-handling-policy=disable_non_proxied_udp`(앱 전체, 앱은 WebRTC를 쓰지 않음). wry 기본 `--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection` 유지, settings 창은 main 창 설정에서 같은 값을 읽음.

## 보안 설정 앞(`e9ae9aa`)뒤(`1c9a430`)
- 프레임 CSP: 끝에 `; webrtc 'block'`만 더함.
- 프레임 머리 스크립트: 맨 앞 `delete window.RTCPeerConnection;delete window.webkitRTCPeerConnection;`, ping→pong(`e.source===parent`) 더함. previewReady·스크롤 그대로.
- iframe 속성: `sandbox="allow-scripts"`·`csp`·`class` 같음. `src`만 `http://preview.localhost/<id>` → `preview`/`preview1`/`preview2` 중 하나(처음은 preview). `Allow-CSP-From: *` 같은 처리기.
- 앱 CSP `csp`·`devCsp`: `frame-src`에 `preview1: http://preview1.localhost preview2: http://preview2.localhost`만 더함. `script-src`·`connect-src`·capability·asset 그대로.
- 창 `additionalBrowserArgs`: 없음(wry 기본) → `--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection --webrtc-ip-handling-policy=disable_non_proxied_udp`(main·settings 같음).

## 바꾼 파일
- `src/editor/html.ts`, `src/editor/html.test.ts`, `src/shell/markdown-preview.ts`, `src-tauri/src/lib.rs`, `src-tauri/tauri.conf.json`, `specs/v0.8.1/verify/ORDER-08/**`, `specs/v0.8.1/PROGRESS.md`, `specs/v0.8.1/PLAN.md` — `1c9a430`
- `AGENTS.md`, `specs/v0.8.1/HERDR-SETUP.md` — `2f6b7ba`

## 미정
- #6 판정: leader-core(근거는 위 "I-15 근거", 하네스 판정 불가 길 목록 포함).
- V4 사용자 확인: 응답 없음 알림 문단이 미리보기 왼쪽 위 가장자리에 붙음(`.html-preview` padding 0, 여백 스펙 ID 없음), 알림 문구.
- 하네스 c6 알림의 정확한 원인(하네스 쪽, 확정 못 함) — 다음 측정 스크립트를 쓸 때 다룸.

## BLOCKED
- 없음
