// npm run images -- <slug>
//
// Tải ảnh thật cho các trường `broll` trong videos/<slug>/script.json.
// Tìm trên Openverse (kho ảnh giấy phép mở: Wikimedia Commons, Flickr…), Openverse lỗi thì tìm thẳng
// trên Wikimedia Commons. Chỉ lấy ảnh được phép
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getJson = async (url) => {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

/** Openverse: thử vài kiểu tham số (máy chủ đôi khi trả lỗi 500), mỗi kiểu thử lại 2 lần. */
const searchOpenverse = async (query) => {
  const q = encodeURIComponent(query);
  const variants = [
    `${API}?q=${q}&license_type=commercial&page_size=20`,
    `${API}?q=${q}&page_size=20`,
    `${API}?q=${q}`,
  ];
  let last;
  for (const url of variants) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const data = await getJson(url);
        return (data.results ?? [])
          .filter(
            (r) =>
              OK_LICENSES.has(String(r.license).toLowerCase()) &&
              (!r.width || r.width >= 900) &&
              (!r.filetype || ["jpg", "jpeg", "png", "webp"].includes(String(r.filetype).toLowerCase())),
          )
          .map((r) => ({
            title: r.title,
            url: r.url,
            width: r.width,
            height: r.height,
            creator: r.creator,
            license: licenseName(r),
            licenseUrl: r.license_url,
            landing: r.foreign_landing_url ?? r.url,
            source: r.source,
          }));
      } catch (e) {
        last = e;
        await sleep(1500 * (attempt + 1));
      }
    }
  }
  throw new Error(`Openverse lỗi (${last?.message})`);
};

const stripHtml = (s) => String(s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

/** Wikimedia Commons: kho ảnh tự do, không cần tài khoản. Chỉ giữ CC0, Public domain, CC BY, CC BY-SA. */
const searchCommons = async (query) => {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "30",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1920",
  });
  const data = await getJson(`https://commons.wikimedia.org/w/api.php?${params}`);
  const pages = Object.values(data.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  return pages
    .map((p) => {
      const ii = p.imageinfo?.[0];
      if (!ii) return null;
      const m = ii.extmetadata ?? {};
      const lic = stripHtml(m.LicenseShortName?.value);
      return {
        title: stripHtml(m.ObjectName?.value) || String(p.title).replace(/^File:/, "").replace(/\.\w+$/, ""),
        url: ii.thumburl || ii.url,
        width: ii.width,
        height: ii.height,
        mime: ii.mime,
        creator: stripHtml(m.Artist?.value).slice(0, 80) || "không rõ tác giả",
        license: lic,
        licenseUrl: stripHtml(m.LicenseUrl?.value),
        landing: ii.descriptionurl,
        source: "wikimedia commons",
      };
    })
    .filter(
      (r) =>
        r &&
        /^image\/(jpeg|png|webp)$/.test(r.mime) &&
        r.width >= 900 &&
        /^(cc0|public domain|pd\b|cc by(-sa)? [\d.]+)/i.test(r.license) &&
        !/\b(nc|nd)\b/i.test(r.license),
    );
};

const search = async (query) => {
  let results = [];
  try {
    results = await searchOpenverse(query);
  } catch (e) {
    console.warn(`  ${e.message}, chuyển sang Wikimedia Commons…`);
  }
  if (!results.length) {
    try {
      results = await searchCommons(query);
    } catch (e) {
      console.warn(`  Wikimedia Commons lỗi (${e.message})`);
    }
  }
  return results;
};

const download = async (url, dest) => {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(60000) });
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
  // đổi từ khóa trong script thì tự tải lại ảnh (chỉ với ảnh do công cụ tải)
  if (fs.existsSync(dest) && credits[it.file]?.query && it.query && credits[it.file].query !== it.query) {
    console.log(`${tag}: từ khóa đã đổi ("${credits[it.file].query}" → "${it.query}"), tải lại.`);
    fs.rmSync(dest);
    delete credits[it.file];
  }
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
      .map((r, i) => `${i}\t${r.license}\t${r.width ?? "?"}x${r.height ?? "?"}\t${r.title ?? ""} — ${r.creator ?? "?"}\t${r.landing}`)
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
          short: `Ảnh: ${creator} · ${r.license}${source}`,
          full: `"${r.title ?? it.file}" – ${creator}, ${r.license}${r.licenseUrl ? ` (${r.licenseUrl})` : ""}, ${r.landing}`,
          license: r.license,
          landing: r.landing,
          query: it.query,
          pick: k,
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
