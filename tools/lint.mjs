// npm run lint            kiểm tra mọi video     |   npm run lint -- <slug>   chỉ một video
// Bắt lỗi kịch bản hay gặp: câu lặp giữa các video, "say"/"cue" không khớp lời đọc, hook quá dài, ảnh thật quá nhiều.
import fs from "node:fs";
import path from "node:path";

const only = process.argv[2];
const slugs = fs.readdirSync("videos").filter((s) => fs.existsSync(path.join("videos", s, "script.json")));
const scripts = Object.fromEntries(slugs.map((s) => [s, JSON.parse(fs.readFileSync(path.join("videos", s, "script.json"), "utf8"))]));
const norm = (s) => String(s).toLowerCase().normalize("NFC").replace(/[.,!?:;"“”()]/g, " ").split(/\s+/).filter(Boolean);
const warn = [];
const W = (slug, msg) => (!only || only === slug) && warn.push(`  [${slug}] ${msg}`);

// 1) cụm 4 từ xuất hiện ở từ 3 video trở lên (bỏ cụm thương hiệu "tóm lại là")
const grams = new Map();
for (const [slug, s] of Object.entries(scripts)) {
  s.scenes.forEach((sc, i) => {
    const w = norm(sc.voice);
    for (let k = 0; k + 4 <= w.length; k++) {
      const g = w.slice(k, k + 4).join(" ");
      if (!grams.has(g)) grams.set(g, new Map());
      const m = grams.get(g);
      m.set(slug, `${i}`);
    }
  });
}
const BRAND = ["tóm lại là"];
const NUM = new Set(["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín", "mười", "tháng", "ngày", "từ", "triệu", "trăm", "nghìn", "phẩy", "phần"]);
const mostlyNumbers = (g) => g.split(" ").filter((x) => NUM.has(x)).length >= 3;
const seen = [];
for (const [g, m] of grams) {
  if (m.size < 3 || BRAND.some((b) => g.includes(b)) || mostlyNumbers(g)) continue;
  if (seen.some((x) => x.includes(g) || g.includes(x))) continue;
  seen.push(g);
  if (!only || m.has(only)) warn.push(`  [lặp] "${g}" xuất hiện ở ${m.size} video: ${[...m.keys()].join(", ")}`);
}

// 2) mở đầu / chuyển ý giống nhau giữa các video
const openers = new Map();
for (const [slug, s] of Object.entries(scripts)) {
  s.scenes.forEach((sc, i) => {
    const first = sc.voice.split(/(?<=[.?!:])\s/)[0].trim().toLowerCase();
    if (first.split(/\s+/).length > 7) return;
    if (!openers.has(first)) openers.set(first, []);
    openers.get(first).push(slug);
  });
}
for (const [o, l] of openers) if (new Set(l).size >= 2 && !only) warn.push(`  [lặp] câu mở "${o}" dùng ở: ${[...new Set(l)].join(", ")}`);

// 3) kiểm tra từng video
for (const [slug, s] of Object.entries(scripts)) {
  const hook = s.scenes[0];
  if (/khoan đã/i.test(hook.voice)) W(slug, 'hook còn câu "Khoan đã" quen thuộc: hãy đổi cách vào ý');
  if (/thế này\.?$/i.test(hook.voice.trim())) W(slug, 'hook kết bằng "thế này": nhàm, hãy kết bằng một câu có thông tin');
  if (hook.voice.split(/\s+/).length > 40) W(slug, "hook dài quá 40 từ (hơn ~9 giây), nên gọn lại");
  s.scenes.forEach((sc, i) => {
    const w = norm(sc.voice).join(" ");
    for (const b of [sc.broll].flat().filter(Boolean)) {
      if (b.say && !w.includes(norm(b.say).join(" "))) W(slug, `cảnh ${i}: broll.say "${b.say}" không có trong lời đọc`);
    }
    if (sc.cue && !w.includes(norm(sc.cue).join(" "))) W(slug, `cảnh ${i}: cue "${sc.cue}" không có trong lời đọc`);
    if (sc.sub && /\b(không|một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười)\s+(triệu|nghìn|phần trăm)/i.test(sc.sub)) W(slug, `cảnh ${i}: sub còn số viết bằng chữ, nên viết bằng số`);
    if (!sc.sub && /\d/.test(sc.voice)) W(slug, `cảnh ${i}: voice có chữ số, phải viết bằng chữ (và thêm sub)`);
  });
  const photos = s.scenes.filter((sc) => [sc.broll].flat().filter(Boolean).length).length;
  if (photos > 3) W(slug, `${photos} cảnh có ảnh thật; nên 2–3 để không rối`);
  const types = s.scenes.map((x) => x.type + (x.layout ? ":" + x.layout : ""));
  types.forEach((t, i) => i && t === types[i - 1] && W(slug, `cảnh ${i} và ${i + 1} cùng kiểu "${t}" liền nhau`));
  const heads = s.scenes.map((x) => x.headline).filter((h) => typeof h === "string");
  heads.forEach((h, i) => heads.indexOf(h) !== i && W(slug, `tiêu đề "${h}" trùng trong cùng video`));
}
console.log(warn.length ? `Có ${warn.length} điều nên xem:\n${warn.join("\n")}` : "Không phát hiện câu lặp hay lỗi kịch bản.");
