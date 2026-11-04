// npm run make -- <slug>   → đọc giọng (VieNeu), tải ảnh thật, rồi render video, một lệnh.
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const slug = process.argv[2];
if (!slug) {
  console.error("Thiếu tên video. Ví dụ: npm run make -- xe-dien-ha-noi");
  process.exit(1);
}
if (!fs.existsSync(`videos/${slug}/script.json`)) {
  console.error(`Không thấy videos/${slug}/script.json. Bạn đã chạy "git pull" và đang ở thư mục D:\\lamvideo chưa?`);
  process.exit(1);
}
const run = (label, script) => {
  console.log(`\n=== ${label} ===`);
  return spawnSync("node", [script, slug], { stdio: "inherit" }).status ?? 1;
};

if (run("1/3 Đọc giọng", "tools/voice.mjs") !== 0) {
  console.error("\nDừng lại ở bước đọc giọng (xem lỗi ở trên).");
  process.exit(1);
}
// tải ảnh thật (lỗi mạng thì vẫn render, chỉ thiếu ảnh)
if (run("2/3 Tải ảnh", "tools/images.mjs") !== 0) console.warn("Một số ảnh chưa tải được, video sẽ bỏ qua các ảnh đó.");
const code = run("3/3 Render video", "tools/render.mjs");
if (code === 0) console.log(`\nXong: out/${slug}.mp4`);
else console.error("\nRender bị lỗi (xem ở trên).");
process.exit(code);
