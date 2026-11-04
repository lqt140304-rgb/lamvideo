// npm run voice -- <slug> [--speaker "Hải Đăng"] [--force]
// Gọi tools/voice.py bằng Python đã cài VieNeu-TTS.
// Tìm Python theo thứ tự: biến VIENEU_PYTHON → file .vieneu-python (tự lưu lần trước)
// → các chỗ hay cài (…\VieNeu-TTS\.venv) → "python"/"py"/"python3".
// Python nào import được "vieneu" thì dùng, và lưu vào .vieneu-python để lần sau khỏi tìm.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const saved = path.join(root, ".vieneu-python");
const args = process.argv.slice(2);
if (!args.length) {
  console.error("Thiếu tên video. Ví dụ: npm run voice -- xe-dien-ha-noi");
  process.exit(1);
}

const win = process.platform === "win32";
const venvPy = (dir) => path.join(dir, ".venv", win ? "Scripts" : "bin", win ? "python.exe" : "python");

function candidates() {
  const list = [];
  if (process.env.VIENEU_PYTHON) list.push(process.env.VIENEU_PYTHON);
  try {
    const s = fs.readFileSync(saved, "utf8").trim();
    if (s) list.push(s);
  } catch {}
  const bases = [path.dirname(root), os.homedir(), path.join(os.homedir(), "Desktop"), path.join(os.homedir(), "Documents")];
  if (win) for (const d of "CDEF") bases.push(`${d}:\\`);
  for (const b of bases) for (const n of ["VieNeu-TTS", "vieneu-tts", "VieNeu"]) list.push(venvPy(path.join(b, n)));
  list.push(...(win ? ["python", "py", "python3"] : ["python3", "python"]));
  return [...new Set(list)];
}

function works(py) {
  if (py.includes(path.sep) && !fs.existsSync(py)) return false;
  const r = spawnSync(py, ["-c", "import vieneu"], { stdio: "ignore", timeout: 60000 });
  return !r.error && r.status === 0;
}

const python = candidates().find(works);
if (!python) {
  console.error(
    [
      "",
      "LỖI: Không tìm thấy Python nào có VieNeu-TTS (import vieneu thất bại).",
      "Cách sửa, chọn một:",
      '  1) Chỉ đường tới Python của VieNeu, ví dụ:  $env:VIENEU_PYTHON = "C:\\VieNeu-TTS\\.venv\\Scripts\\python.exe"',
      "     rồi chạy lại lệnh. (Lần chạy được, đường dẫn sẽ tự lưu vào file .vieneu-python, lần sau không cần đặt lại.)",
      "  2) Hoặc cài thẳng vào Python mặc định:  pip install vieneu",
      "",
    ].join("\n"),
  );
  process.exit(1);
}
try {
  fs.writeFileSync(saved, python + "\n");
} catch {}
console.log(`Giọng đọc: dùng ${python}`);

const r = spawnSync(python, [path.join(here, "voice.py"), ...args], {
  stdio: "inherit",
  env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1" },
});
if (r.error) {
  console.error(`Không chạy được "${python}": ${r.error.message}`);
  process.exit(1);
}
if (r.status !== 0) console.error(`LỖI: bước đọc giọng thoát với mã ${r.status}.`);
process.exit(r.status ?? 1);
