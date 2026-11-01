// checker probe: T-01.7 parser behavior (6/8 digit, alpha) via the app's own parseColor
import { parseColor, toHex } from "../../../../src/theme/color.ts";
const cases = ["#9399b240", "#cdd6f412", "#27273b", "#FFFFFF", "#ffffffff", "#12345", "zzz", "#1234567"];
for (const c of cases) console.log(c, JSON.stringify(parseColor(c)));
