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
const r = spawnSync("npx", ["remotion", "render", "src/index.ts", slug, `out/${slug}.mp4`, ...extra], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(r.status ?? 1);
