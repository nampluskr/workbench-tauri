# I-24 HTML Preview Links V3 Verification Summary

- Execution Time: 2026-11-13T09:16:20.532Z
- Target Binary: `D:\projects\workbench-tauri\src-tauri\target\release\workbench-tauri.exe`
- Total Passed: **24** / Total Failed: **0**

## 1. Clicked Links Categories

| Test Case | Target | Expected Action | Status | Notes |
|---|---|---|---|---|
| 1a_local_html_other | fixture | follow / block | PASS | tabs: 3, openUrl calls: 0 |
| 1b_local_html_sub | fixture | follow / block | PASS | tabs: 3, openUrl calls: 0 |
| 2_local_markdown | fixture | follow / block | PASS | tabs: 3, openUrl calls: 0 |
| 3a_local_txt | fixture | follow / block | PASS | tabs: 3, openUrl calls: 0 |
| 3b_local_csv | fixture | follow / block | PASS | tabs: 3, openUrl calls: 0 |
| 4_external_browser | fixture | follow / block | PASS | tabs: 2, openUrl calls: 0 (procs: +7) |
| 5a_blocked_file | fixture | follow / block | PASS | tabs: 2, openUrl calls: 0 |
| 5b_blocked_js | fixture | follow / block | PASS | tabs: 2, openUrl calls: 0 |
| 6_anchor_scroll | fixture | follow / block | PASS | tabs: 2, openUrl calls: 0 |
| 7_keyboard_enter | fixture | follow / block | PASS | tabs: 3, openUrl calls: 0 |

## 2. Five Non-Click Avenues (Unclicked Attacks)

| Attack Avenue | Mechanism | Expected | Status | openUrl Calls |
|---|---|---|---|---|
| avenue_1_location_href | unclicked | No navigation, No browser | PASS | 0 |
| avenue_2_window_open | unclicked | No navigation, No browser | PASS | 0 |
| avenue_3_synthetic_clicks | unclicked | No navigation, No browser | PASS | 0 |
| avenue_4_postmessage_forgery | unclicked | No navigation, No browser | PASS | 0 |
| avenue_5_script_meta_refresh | unclicked | No navigation, No browser | PASS | 0 |

## 3. Prototype Tampering & Token Secrecy

| Test Item | Description | Status |
|---|---|---|
| Token Secrecy | DOM / scripts inspected for UUID token | PASS |
| synthetic_click_blocked | Native built-in isolation test | PASS |
| trusted_user_click_followed | Native built-in isolation test | PASS |

## 4. ORDER-07/08 Isolation Fixtures

| Fixture | Status | Notes |
|---|---|---|
| navigate.html | PASS | frame: http://preview.localhost/p9, openUrl calls: 0 |
| refresh.html | PASS | frame: http://preview.localhost/p10, openUrl calls: 0 |
| loopnav.html | PASS | frame: http://preview.localhost/p11, openUrl calls: 0 |
| isolation.html | PASS | frame: http://preview.localhost/p12, openUrl calls: 0 |
| network.html | PASS | frame: http://preview.localhost/p13, openUrl calls: 0 |

## 5. Real Browser Launch (Single Final Check)

- Status: **PASS**
- Browser Count: 26 -> 31 (diff: 5)
- Note: Single real browser execution at test conclusion. No processes terminated; open tab preserved as requested.
