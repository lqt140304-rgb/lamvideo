// npm run make -- <slug>   → đọc giọng (VieNeu) rồi render video, một lệnh.
import { spawnSync } from "node:child_process";

const slug = process.argv[2];
if (!slug) {
  console.error("Thiếu tên video. Ví dụ: npm run make -- xe-dien-ha-noi");
  process.exit(1);
}
const run = (script) =>
  spawnSync("node", [script, slug], { stdio: "inherit" }).status ?? 1;

if (run("tools/voice.mjs") !== 0) process.exit(1);
process.exit(run("tools/render.mjs"));
