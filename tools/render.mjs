// npm run render -- <slug>   → out/<slug>.mp4 (1080x1920, 30 fps)
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2];
if (!slug) {
  console.error("Thiếu tên video. Ví dụ: npm run render -- xe-dien-ha-noi");
  process.exit(1);
}
const extra = process.argv.slice(3);

// Cảnh báo trước khi render nếu chưa có giọng đọc (video sẽ không có tiếng).
const manifestPath = path.join("public", slug, "voice", "voice.json");
const scriptPath = path.join("videos", slug, "script.json");
const warnSilent = (why) =>
  console.warn(
    `\n\x1b[33m⚠ ${why}\n  Video sẽ KHÔNG có tiếng. Chạy trước: npm run voice -- ${slug}\x1b[0m\n`,
  );
if (!fs.existsSync(manifestPath)) {
  warnSilent(`Chưa có giọng đọc (${manifestPath}).`);
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const script = JSON.parse(fs.readFileSync(scriptPath, "utf8"));
  const missing = manifest.scenes.filter((s) => !fs.existsSync(path.join("public", slug, "voice", s.file)));
  if (manifest.scenes.length !== script.scenes.length) {
    warnSilent(`Kịch bản có ${script.scenes.length} cảnh nhưng giọng đọc có ${manifest.scenes.length} câu (đã sửa kịch bản mà chưa đọc lại).`);
  } else if (missing.length) {
    warnSilent(`Thiếu file giọng: ${missing.map((s) => s.file).join(", ")}.`);
  } else {
    console.log(`Giọng đọc: ${manifest.scenes.length} câu, giọng ${manifest.speaker}.`);
  }
}
const raw = `out/${slug}.raw.mp4`;
const final = `out/${slug}.mp4`;
const r = spawnSync("npx", ["remotion", "render", "src/index.ts", slug, raw, ...extra], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (r.status !== 0) process.exit(r.status ?? 1);

// Chuẩn hóa độ to về -14 LUFS (mức TikTok / Reels / YouTube hay dùng), đo 2 lượt cho chính xác.
// Hình giữ nguyên (copy), chỉ xử lý tiếng. Dùng ffmpeg đi kèm Remotion nên không cần cài thêm.
const ffmpeg = (args, capture = false) =>
  spawnSync("npx", ["remotion", "ffmpeg", ...args], {
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    shell: process.platform === "win32",
  });
const TARGET = "I=-14:TP=-1.5:LRA=11";
console.log("Chuẩn hóa âm lượng về -14 LUFS…");
const probe = ffmpeg(["-hide_banner", "-i", raw, "-af", `loudnorm=${TARGET}:print_format=json`, "-f", "null", "-"], true);
const m = (probe.stderr || "").match(/\{[^{}]*"input_i"[^{}]*\}/);
if (!m) {
  console.warn("\x1b[33mKhông đo được âm lượng, giữ nguyên bản gốc.\x1b[0m");
  fs.copyFileSync(raw, final);
} else {
  const s = JSON.parse(m[0]);
  const af = `loudnorm=${TARGET}:measured_I=${s.input_i}:measured_TP=${s.input_tp}:measured_LRA=${s.input_lra}:measured_thresh=${s.input_thresh}:offset=${s.target_offset}:linear=true`;
  const n = ffmpeg(["-hide_banner", "-loglevel", "error", "-y", "-i", raw, "-c:v", "copy", "-af", af, "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", final]);
  if (n.status !== 0) {
    console.warn("\x1b[33mChuẩn hóa âm lượng lỗi, giữ nguyên bản gốc.\x1b[0m");
    fs.copyFileSync(raw, final);
  } else {
    console.log(`Âm lượng: ${s.input_i} LUFS → -14 LUFS`);
  }
}
fs.rmSync(raw, { force: true });
console.log(`\nXong: ${final}`);
