// npm run render -- <slug>   → out/<slug>.mp4 (1080x1920, 30 fps)
import { spawnSync } from "node:child_process";

const slug = process.argv[2];
if (!slug) {
  console.error("Thiếu tên video. Ví dụ: npm run render -- xe-dien-ha-noi");
  process.exit(1);
}
const extra = process.argv.slice(3);
const r = spawnSync("npx", ["remotion", "render", "src/index.ts", slug, `out/${slug}.mp4`, ...extra], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(r.status ?? 1);
