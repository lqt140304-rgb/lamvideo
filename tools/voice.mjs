// npm run voice -- <slug> [--speaker "Hải Đăng"] [--force]
// Gọi tools/voice.py bằng Python đã cài VieNeu-TTS.
// Đặt biến môi trường VIENEU_PYTHON nếu Python đó không phải lệnh "python" mặc định,
// ví dụ: VIENEU_PYTHON="C:\VieNeu-TTS\.venv\Scripts\python.exe"
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
if (!args.length) {
  console.error('Thiếu tên video. Ví dụ: npm run voice -- xe-dien-ha-noi');
  process.exit(1);
}
const python = process.env.VIENEU_PYTHON || (process.platform === "win32" ? "python" : "python3");
const r = spawnSync(python, [path.join(here, "voice.py"), ...args], {
  stdio: "inherit",
  env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1" },
});
if (r.error) {
  console.error(`Không chạy được "${python}": ${r.error.message}`);
  process.exit(1);
}
process.exit(r.status ?? 1);
