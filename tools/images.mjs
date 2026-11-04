// npm run images -- <slug>
//
// Tải ảnh thật cho các trường `broll` trong videos/<slug>/script.json.
// Tìm trên Openverse (kho ảnh giấy phép mở: Wikimedia Commons, Flickr…), chỉ lấy ảnh được phép
// dùng thương mại (CC0, Public Domain, CC BY, CC BY-SA), lưu vào public/<slug>/img/ và ghi
// nguồn vào public/<slug>/img/credits.json. Video tự hiện dòng ghi nguồn trên ảnh.
//
// - Ảnh đã có thì giữ nguyên. Muốn đổi ảnh: xóa file, đặt "pick": 1, 2… trong script rồi chạy lại.
//   Danh sách lựa chọn nằm ở public/<slug>/img/<tên>.candidates.txt.
// - Tự có ảnh (chụp, mua, Pexels/Unsplash…): đặt vào public/<slug>/img/<file> và ghi "credit" trong script.
import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2];
if (!slug) {
  console.error("Thiếu tên video. Ví dụ: npm run images -- xe-dien-ha-noi");
  process.exit(1);
}
const scriptPath = path.join("videos", slug, "script.json");
const script = JSON.parse(fs.readFileSync(scriptPath, "utf8"));
const imgDir = path.join("public", slug, "img");
fs.mkdirSync(imgDir, { recursive: true });
const creditsPath = path.join(imgDir, "credits.json");
const credits = fs.existsSync(creditsPath) ? JSON.parse(fs.readFileSync(creditsPath, "utf8")) : {};

const UA = "lamvideo-images/0.1 (+https://github.com/lqt140304-rgb/lamvideo)";
const API = "https://api.openverse.org/v1/images/";
const OK_LICENSES = new Set(["cc0", "pdm", "by", "by-sa"]);

const licenseName = (r) => {
  const l = String(r.license || "").toLowerCase();
  if (l === "cc0") return "CC0";
  if (l === "pdm") return "Public Domain";
  return `CC ${l.toUpperCase()} ${r.license_version ?? ""}`.trim();
};

const search = async (query) => {
  const url = `${API}?q=${encodeURIComponent(query)}&license_type=commercial&mature=false&page_size=20`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`Openverse trả lỗi ${res.status} cho "${query}"`);
  const data = await res.json();
  return (data.results ?? []).filter(
    (r) =>
      OK_LICENSES.has(String(r.license).toLowerCase()) &&
      (!r.width || r.width >= 900) &&
      (!r.filetype || ["jpg", "jpeg", "png", "webp"].includes(String(r.filetype).toLowerCase())),
  );
};

const download = async (url, dest) => {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  const type = res.headers.get("content-type") || "";
  if (!res.ok || !type.startsWith("image/")) throw new Error(`không tải được (${res.status} ${type})`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 20_000) throw new Error("ảnh quá nhỏ");
  fs.writeFileSync(dest, buf);
  return buf.length;
};

const items = script.scenes.flatMap((s, i) => {
  const b = s.broll ? (Array.isArray(s.broll) ? s.broll : [s.broll]) : [];
  return b.map((x) => ({ ...x, scene: i + 1 }));
});
if (!items.length) {
  console.log("Kịch bản chưa có ảnh nào (trường \"broll\").");
  process.exit(0);
}

let failed = 0;
for (const it of items) {
  const dest = path.join(imgDir, it.file);
  const tag = `[cảnh ${it.scene}] ${it.file}`;
  if (fs.existsSync(dest)) {
    if (!credits[it.file]) {
      credits[it.file] = { short: it.credit ?? "Ảnh: (chưa ghi nguồn)" };
      if (!it.credit) console.warn(`\x1b[33m${tag}: ảnh tự đặt nhưng chưa có "credit" trong script.\x1b[0m`);
    }
    console.log(`${tag}: đã có, giữ nguyên.`);
    continue;
  }
  if (!it.query) {
    console.warn(`\x1b[33m${tag}: chưa có file và không có "query" để tìm.\x1b[0m`);
    failed++;
    continue;
  }
  try {
    const results = await search(it.query);
    const list = results
      .map((r, i) => `${i}\t${licenseName(r)}\t${r.width ?? "?"}x${r.height ?? "?"}\t${r.title ?? ""} — ${r.creator ?? "?"}\t${r.foreign_landing_url ?? r.url}`)
      .join("\n");
    fs.writeFileSync(path.join(imgDir, `${it.file}.candidates.txt`), `Từ khóa: ${it.query}\n${list}\n`);
    if (!results.length) throw new Error(`không tìm thấy ảnh hợp lệ cho "${it.query}" (thử từ khóa tiếng Anh khác)`);
    let done = false;
    for (let k = it.pick ?? 0; k < results.length && !done; k++) {
      const r = results[k];
      try {
        const size = await download(r.url, dest);
        const creator = r.creator || "không rõ tác giả";
        const source = r.source ? ` / ${r.source}` : "";
        credits[it.file] = {
          short: `Ảnh: ${creator} · ${licenseName(r)}${source}`,
          full: `"${r.title ?? it.file}" – ${creator}, ${licenseName(r)} (${r.license_url ?? ""}), ${r.foreign_landing_url ?? r.url}`,
          license: licenseName(r),
          landing: r.foreign_landing_url ?? r.url,
        };
        console.log(`${tag}: tải lựa chọn #${k} (${Math.round(size / 1024)} KB) — ${credits[it.file].short}`);
        done = true;
      } catch (e) {
        console.warn(`  #${k}: ${e.message}, thử ảnh tiếp theo…`);
      }
    }
    if (!done) throw new Error("không tải được ảnh nào");
  } catch (e) {
    console.warn(`\x1b[33m${tag}: ${e.message}\x1b[0m`);
    failed++;
  }
}

fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 2));
console.log(`\nĐã ghi ${creditsPath}. Xem ảnh trong ${imgDir}, không ưng thì xóa file, đổi "pick" rồi chạy lại.`);
const lines = items.filter((it) => credits[it.file]).map((it) => `- ${credits[it.file].full ?? credits[it.file].short}`);
if (lines.length) console.log(`\nDán vào mô tả video (ghi nguồn ảnh):\nẢnh minh họa:\n${[...new Set(lines)].join("\n")}`);
if (failed) process.exitCode = 1;
