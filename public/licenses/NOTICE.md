# Theme assets — sources and licenses

This folder is copied as-is into the build output (`dist/licenses/`, Vite `public/`), so the notices ship with the app (03-THEME-ICONS 7절 T-17).

| File | Source | Version | License |
| --- | --- | --- | --- |
| `src/theme/assets/one/one.json` (One Dark, One Light) | https://github.com/zed-industries/zed/blob/14b7b0ef3764d62a85070c8b5ccea105a2ad3235/assets/themes/one/one.json | Zed commit `14b7b0ef3764d62a85070c8b5ccea105a2ad3235` (the 01-zed spec baseline; sha256 `ed6cf88015f2f9b39691315840cf0615f35cdc1be4a61f9f0dba8183fa427695`) | MIT, Copyright (c) 2014 GitHub Inc. — per `assets/themes/LICENSES` of the same commit; the "One Dark" and "One Light" sections are reproduced in `zed-one-theme-LICENSE` |
| `src/theme/assets/catppuccin/catppuccin-mauve.json` | https://github.com/catppuccin/zed/blob/v0.2.27/themes/catppuccin-mauve.json | v0.2.27 (sha256 `b8f13dcb1e914f559666ccf0c39fa22d9d08aebb8461d75f88e05a03bb9ec1b1`, identical to the installed Zed extension `catppuccin` 0.2.27) | MIT, Copyright (c) 2021 Catppuccin — full text in `catppuccin-zed-LICENSE` (from https://github.com/catppuccin/zed/blob/v0.2.27/LICENSE) |

Only this theme data file is taken from the Zed repository (theme data under MIT, not Zed application code, which is GPL-3.0); no other Zed file is used (D-14, leader decision 2026-11-01).

The files are used unmodified. 01-zed 03-THEME-ICONS 7절 (T-17) lists the notices the distribution must carry.
