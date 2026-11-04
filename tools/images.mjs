// npm run images -- <slug>                      tải ảnh còn thiếu + tạo trang chọn ảnh
// npm run images -- <slug> --pick <file>=<số>   đổi sang ảnh số <số> trong trang chọn ảnh
// npm run images -- <slug> --review             tìm lại gợi ý cho mọi ảnh (kể cả ảnh đã có)
//
// Tải ảnh thật cho các trường `broll` trong videos/<slug>/script.json.
// Tìm trên Openverse (Wikimedia Commons, Flickr…) và Wikimedia Commons.
// Chỉ lấy ảnh được dùng thương mại (CC0, Public Domain, CC BY, CC BY-SA), lưu vào public/<slug>/img/,
// ghi nguồn vào credits.json. Mở public/<slug>/img/chon-anh.html để xem gợi ý theo từng câu thoại.
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--") && !a.includes("="));
if (!slug) {
  console.error("Thiếu tên video. Ví dụ: npm run images -- xe-dien-ha-noi");
  process.exit(1);
}
const review = args.includes("--review");
const picks = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--pick" && args[i + 1]) {
    const [f, n] = args[i + 1].split("=");
    picks[f] = Number(n);
    i++;
  }
}

const scriptPath = path.join("videos", slug, "script.json");
const script = JSON.parse(fs.readFileSync(scriptPath, "utf8"));
const imgDir = path.join("public", slug, "img");
fs.mkdirSync(imgDir, { recursive: true });
const creditsPath = path.join(imgDir, "credits.json");
const credits = fs.existsSync(creditsPath) ? JSON.parse(fs.readFileSync(creditsPath, "utf8")) : {};

const UA = "lamvideo-images/0.2 (+https://github.com/lqt140304-rgb/lamvideo)";
const OK_LICENSES = new Set(["cc0", "pdm", "by", "by-sa"]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getJson = async (url) => {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};
const stripHtml = (s) => String(s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

/** Đọc ngày từ chuỗi kiểu "2024-05-12 10:22", "2024:05:12", "May 2024"… → "2024-05-12" (thiếu thì lấy 01). */
const parseDate = (raw) => {
  const attr = String(raw ?? "").match(/datetime="([^"]+)"/); // Commons hay bọc ngày trong <time datetime="…">
  const s = attr ? attr[1] : stripHtml(raw);
  const m = s.match(/((?:19|20)\d{2})(?:[-:/.](\d{1,2}))?(?:[-:/.](\d{1,2}))?/);
  if (!m) return null;
  const mo = Math.min(12, Math.max(1, Number(m[2] ?? 1)));
  const d = Math.min(31, Math.max(1, Number(m[3] ?? 1)));
  return `${m[1]}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
};

const ovLicense = (r) => {
  const l = String(r.license || "").toLowerCase();
  if (l === "cc0") return "CC0";
  if (l === "pdm") return "Public Domain";
  return `CC ${l.toUpperCase()} ${r.license_version ?? ""}`.trim();
};

// ---- Tìm ảnh -----------------------------------------------------------------------------

const searchOpenverse = async (query) => {
  const q = encodeURIComponent(query);
  const base = "https://api.openverse.org/v1/images/";
  const variants = [`${base}?q=${q}&license_type=commercial&page_size=20`, `${base}?q=${q}&page_size=20`];
  let last;
  for (const url of variants) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const data = await getJson(url);
        return (data.results ?? [])
          .filter((r) => OK_LICENSES.has(String(r.license).toLowerCase()) && (!r.width || r.width >= 900))
          .map((r) => ({
            title: r.title ?? "",
            text: `${r.title ?? ""} ${(r.tags ?? []).map((t) => t.name).join(" ")}`,
            url: r.url,
            thumb: r.thumbnail ?? r.url,
            width: r.width,
            height: r.height,
            creator: r.creator || "không rõ tác giả",
            license: ovLicense(r),
            licenseUrl: r.license_url,
            landing: r.foreign_landing_url ?? r.url,
            source: r.source ?? "openverse",
            date: null, // Openverse không cho biết ngày chụp
          }));
      } catch (e) {
        last = e;
        await sleep(1500 * (attempt + 1));
      }
    }
  }
  throw new Error(`Openverse lỗi (${last?.message})`);
};

const commonsItem = (p) => {
  const ii = p.imageinfo?.[0];
  if (!ii) return null;
  const m = ii.extmetadata ?? {};
  const title = String(p.title).replace(/^File:/, "").replace(/\.\w+$/, "");
  return {
    title: stripHtml(m.ObjectName?.value) || title,
    text: `${title} ${stripHtml(m.ImageDescription?.value).slice(0, 300)} ${stripHtml(m.Categories?.value)}`,
    url: ii.thumburl || ii.url,
    thumb: (ii.thumburl || ii.url).replace(/\/\d+px-/, "/480px-"),
    width: ii.width,
    height: ii.height,
    mime: ii.mime,
    creator: stripHtml(m.Artist?.value).slice(0, 80) || "không rõ tác giả",
    license: stripHtml(m.LicenseShortName?.value),
    licenseUrl: stripHtml(m.LicenseUrl?.value),
    landing: ii.descriptionurl,
    source: "wikimedia commons",
    file: p.title,
    // ngày chụp (EXIF) nếu có, không thì ngày tải lên
    date: parseDate(m.DateTimeOriginal?.value) ?? parseDate(m.DateTime?.value),
  };
};
const commonsOk = (r) =>
  r &&
  /^image\/(jpeg|png|webp)$/.test(r.mime) &&
  r.width >= 900 &&
  /^(cc0|public domain|pd\b|cc by(-sa)? [\d.]+)/i.test(r.license) &&
  !/\b(nc|nd)\b/i.test(r.license);

const COMMONS = "https://commons.wikimedia.org/w/api.php";
const commonsParams = { action: "query", format: "json", prop: "imageinfo", iiprop: "url|size|mime|extmetadata", iiurlwidth: "1920" };

const searchCommons = async (query, newest = false) => {
  const params = new URLSearchParams({ ...commonsParams, generator: "search", gsrsearch: `${query} filetype:bitmap`, gsrnamespace: "6", gsrlimit: "40" });
  if (newest) params.set("gsrsort", "create_timestamp_desc"); // ảnh tải lên gần đây nhất trước
  const data = await getJson(`${COMMONS}?${params}`);
  const pages = Object.values(data.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  return pages.map(commonsItem).filter(commonsOk);
};

/** Lấy đích danh một file trên Commons, ví dụ "File:Hoan Kiem Lake.jpg". */
const fetchCommonsFile = async (name) => {
  const title = name.startsWith("File:") ? name : `File:${name}`;
  const params = new URLSearchParams({ ...commonsParams, titles: title });
  const data = await getJson(`${COMMONS}?${params}`);
  const r = commonsItem(Object.values(data.query?.pages ?? {})[0] ?? {});
  if (!r) throw new Error(`không thấy ${title} trên Commons`);
  if (!commonsOk(r)) throw new Error(`${title} có giấy phép "${r.license}", không dùng thương mại được`);
  return r;
};

/** Xếp hạng theo độ khớp với từ khóa; có `must` thì ảnh phải chứa ít nhất một từ trong đó mới được ưu tiên. */
const rank = (results, query, must, since, prefer) => {
  const words = norm(query).split(/\s+/).filter((w) => w.length > 2);
  const mustN = (must ?? []).map(norm);
  const scored = results.map((r, i) => {
    const text = norm(r.text);
    const hit = words.filter((w) => text.includes(w)).length;
    const ok = !mustN.length || mustN.some((m) => text.includes(m));
    const tall = r.width && r.height && r.height >= r.width ? 0.3 : 0; // ảnh dọc hợp khung 9:16 hơn
    // ảnh cũ hơn mốc `since` thì không dùng; không rõ ngày thì vẫn giữ nhưng xếp sau
    const old = since && r.date ? r.date < since : false;
    const unknown = (since || prefer === "newest") && !r.date;
    let fresh = 0;
    if (prefer === "newest" && r.date) {
      const ageYears = (Date.now() - Date.parse(r.date)) / (365.25 * 864e5);
      fresh = 2.5 * Math.max(0, 1 - ageYears / 6); // ảnh trong 6 năm gần đây được cộng điểm, càng mới càng cao
    }
    // có `since` thì BẮT BUỘC biết ngày chụp và ngày đó phải từ mốc trở đi (Openverse không có ngày nên bị loại)
    const undated = !!since && !r.date;
    return { r, ok: ok && !old && !undated, old: old || undated, score: hit + tall + fresh - (unknown ? 0.8 : 0) - i * 0.01 };
  });
  const good = scored.filter((s) => s.ok).sort((a, b) => b.score - a.score);
  const rest = scored.filter((s) => !s.ok).sort((a, b) => b.score - a.score);
  return { list: [...good, ...rest].map((s) => ({ ...s.r, match: s.ok, old: s.old })), matched: good.length };
};

const search = async (it) => {
  let results = [];
  try {
    results = await searchOpenverse(it.query);
  } catch (e) {
    console.warn(`  ${e.message}, dùng Wikimedia Commons…`);
  }
  const wantNew = !!it.since || it.prefer === "newest";
  for (const newest of wantNew ? [false, true] : [false]) {
    try {
      const more = await searchCommons(it.query, newest);
      const seen = new Set(results.map((r) => r.landing));
      results = [...results, ...more.filter((r) => !seen.has(r.landing))];
    } catch (e) {
      if (!results.length) console.warn(`  Wikimedia Commons lỗi (${e.message})`);
    }
  }
  return rank(results, it.query, it.must, it.since, it.prefer);
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

const creditOf = (r, it, k) => ({
  short: `Ảnh: ${r.creator} · ${r.license}${r.source ? ` / ${r.source}` : ""}`,
  date: r.date ?? null,
  full: `"${r.title || it.file}" – ${r.creator}${r.date ? ` (${r.date.slice(0, 4)})` : ""}, ${r.license}${r.licenseUrl ? ` (${r.licenseUrl})` : ""}, ${r.landing}`,
  license: r.license,
  landing: r.landing,
  query: it.query ?? null,
  commons: it.commons ?? null,
  since: it.since ?? null,
  pick: k ?? null,
});

// ---- Chạy ------------------------------------------------------------------------------------

const brollsOf = (s) => (s.broll ? (Array.isArray(s.broll) ? s.broll : [s.broll]) : []);
// Cài đặt chung cho cả video (script.json → "images": { "since": "2024-01-01", "prefer": "newest" }),
// từng ảnh có thể ghi đè; đặt "since": null cho ảnh không cần mới (phong cảnh, công trình).
const defaults = script.images ?? {};
const items = script.scenes.flatMap((s, i) =>
  brollsOf(s).map((x) => ({
    ...x,
    since: x.since !== undefined ? x.since : defaults.since ?? null,
    prefer: x.prefer ?? defaults.prefer ?? "relevant",
    scene: i + 1,
    voice: s.voice,
  })),
);
if (!items.length) {
  console.log('Kịch bản chưa có ảnh nào (trường "broll").');
  process.exit(0);
}

// --pick: ghi số ảnh đã chọn vào script.json rồi tải lại ảnh đó
if (Object.keys(picks).length) {
  for (const s of script.scenes) {
    for (const b of brollsOf(s)) {
      if (b.file in picks) {
        b.pick = picks[b.file];
        delete b.commons;
      }
    }
  }
  fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2) + "\n");
  for (const it of items) {
    if (it.file in picks) {
      it.pick = picks[it.file];
      delete it.commons;
    }
  }
}

let failed = 0;
for (const it of items) {
  const dest = path.join(imgDir, it.file);
  const candPath = path.join(imgDir, `${it.file}.candidates.json`);
  const tag = `[cảnh ${it.scene}] ${it.file}`;
  const prev = credits[it.file];
  const changed =
    !!prev?.landing &&
    ((prev.query ?? null) !== (it.query ?? null) ||
      (prev.commons ?? null) !== (it.commons ?? null) ||
      (prev.since ?? null) !== (it.since ?? null) ||
      (it.pick !== undefined && (prev.pick ?? null) !== it.pick));
  // ảnh đã tải từ trước nhưng không rõ ngày / quá cũ so với mốc `since` thì tải lại
  const stale =
    !!prev?.landing && !!it.since && it.pick === undefined && !it.commons && (!prev.date || prev.date < it.since);
  if (fs.existsSync(dest) && (changed || stale)) {
    if (stale && !changed) console.log(`${tag}: ảnh cũ hoặc không rõ ngày chụp (trước ${it.since}), tìm ảnh mới hơn.`);
    if (changed) console.log(`${tag}: đổi từ khóa / lựa chọn, tải lại.`);
    fs.rmSync(dest);
    delete credits[it.file];
  }

  // gợi ý cho trang chọn ảnh
  let ranked = null;
  if (it.query && (review || !fs.existsSync(dest) || !fs.existsSync(candPath))) {
    try {
      ranked = await search(it);
      fs.writeFileSync(candPath, JSON.stringify({ query: it.query, list: ranked.list.slice(0, 16) }, null, 1));
      if (!ranked.matched)
        console.warn(`  ${tag}: không có ảnh nào đạt yêu cầu${it.must ? ` (từ bắt buộc ${JSON.stringify(it.must)})` : ""}${it.since ? ` (từ ${it.since})` : ""}, nên đổi "query" hoặc nới "since".`);
    } catch (e) {
      console.warn(`  ${tag}: tìm gợi ý lỗi (${e.message})`);
    }
  }

  if (fs.existsSync(dest)) {
    if (!credits[it.file]) {
      credits[it.file] = { short: it.credit ?? "Ảnh: (chưa ghi nguồn)" };
      if (!it.credit) console.warn(`\x1b[33m${tag}: ảnh tự đặt nhưng chưa có "credit" trong script.\x1b[0m`);
    }
    console.log(`${tag}: đã có.`);
    continue;
  }

  try {
    if (it.commons) {
      const r = await fetchCommonsFile(it.commons);
      const size = await download(r.url, dest);
      credits[it.file] = creditOf(r, it, null);
      console.log(`${tag}: tải ${it.commons} (${Math.round(size / 1024)} KB) — ${credits[it.file].short}`);
      continue;
    }
    if (!it.query) throw new Error('chưa có file, cũng không có "query" hay "commons"');
    const list = ranked?.list ?? (fs.existsSync(candPath) ? JSON.parse(fs.readFileSync(candPath, "utf8")).list : []);
    if (!list.length) throw new Error(`không tìm thấy ảnh hợp lệ cho "${it.query}"`);
    let done = false;
    for (let k = it.pick ?? 0; k < list.length && !done; k++) {
      if (it.since && it.pick === undefined && list[k].match === false) {
        // có mốc ngày mà không còn ảnh đạt: thà bỏ ảnh còn hơn dùng ảnh cũ / sai chủ đề
        console.warn(`\x1b[33m${tag}: không có ảnh nào từ ${it.since} đạt yêu cầu → bỏ ảnh này (video vẫn render bình thường). Đổi "query" hoặc chọn tay trong chon-anh.html.\x1b[0m`);
        done = true;
        break;
      }
      try {
        const size = await download(list[k].url, dest);
        credits[it.file] = creditOf(list[k], it, k);
        console.log(
          `${tag}: ảnh #${k}${list[k].date ? ` (${list[k].date})` : ""}${list[k].match === false ? (list[k].old ? " (ẢNH CŨ, nên chọn lại)" : " (không đạt yêu cầu, nên chọn lại)") : ""} — ${list[k].title}`,
        );
        done = true;
      } catch (e) {
        console.warn(`  #${k}: ${e.message}`);
        if (it.pick !== undefined) break; // đã chọn đích danh thì không tự đổi sang ảnh khác
      }
    }
    if (!done) throw new Error("không tải được ảnh");
  } catch (e) {
    console.warn(`\x1b[33m${tag}: ${e.message}\x1b[0m`);
    failed++;
  }
}
fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 2));

// ---- Trang chọn ảnh ------------------------------------------------------------------------------

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const sections = items
  .map((it) => {
    const candPath = path.join(imgDir, `${it.file}.candidates.json`);
    if (!fs.existsSync(candPath)) return "";
    const c = JSON.parse(fs.readFileSync(candPath, "utf8"));
    const chosen = credits[it.file]?.pick;
    const voice = esc(it.voice);
    const say = it.say ? voice.replace(esc(it.say), `<mark>${esc(it.say)}</mark>`) : voice;
    const cards = c.list
      .map(
        (r, k) => `<button class="card${k === chosen ? " on" : ""}${r.match === false ? " off" : ""}" data-cmd="npm run images -- ${esc(slug)} --pick ${esc(it.file)}=${k}">
  <img loading="lazy" src="${esc(r.thumb)}" alt=""><b>#${k}${k === chosen ? " · đang dùng" : ""}</b><span>${esc(r.title).slice(0, 90)}</span><small>${r.date ? `📅 ${esc(r.date)}` : "📅 không rõ ngày"}${r.old ? " · CŨ" : ""} · ${esc(r.license)} · ${esc(r.source)}</small></button>`,
      )
      .join("\n");
    return `<section><h2>Cảnh ${it.scene} · <code>${esc(it.file)}</code></h2><p class="say">${say}</p><p class="q">Từ khóa: ${esc(c.query)}${
      it.must ? ` · bắt buộc có: ${esc(it.must.join(", "))}` : ""
    }${it.since ? ` · chỉ lấy ảnh từ ${esc(it.since)}` : ""}${it.prefer === "newest" ? " · ưu tiên ảnh mới" : ""}</p><div class="grid">${cards}</div></section>`;
  })
  .join("\n");
const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Chọn ảnh · ${esc(slug)}</title><style>
body{font:15px/1.45 system-ui,sans-serif;margin:0;background:#f6f0e1;color:#1d1b19}
header{position:sticky;top:0;background:#1d1b19;color:#fff;padding:12px 16px;z-index:2}
header code{background:#ffc83a;color:#1d1b19;padding:3px 8px;border-radius:6px;font-size:14px;word-break:break-all}
section{padding:12px 16px 20px;border-bottom:2px dashed #c9bfa8}
h2{margin:6px 0;font-size:18px}.say{margin:4px 0;font-size:16px}mark{background:#ffc83a;padding:0 3px}.q{color:#5b554c;margin:2px 0 10px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}
.card{all:unset;cursor:pointer;background:#fff;border:3px solid #1d1b19;border-radius:10px;overflow:hidden;display:flex;flex-direction:column}
.card img{width:100%;height:150px;object-fit:cover;background:#ddd}.card b{padding:4px 8px 0}.card span{padding:0 8px;font-size:13px}.card small{padding:2px 8px 8px;color:#5b554c}
.card.on{border-color:#22a86b;box-shadow:0 0 0 4px #22a86b}.card.off{opacity:.5}.card:hover{transform:translateY(-2px)}
</style></head><body><header>Bấm vào ảnh khớp với phần tô vàng của câu thoại → lệnh hiện ở đây (đã chép sẵn), dán vào PowerShell rồi render lại:<br><code id="cmd">(chưa chọn)</code></header>
${sections || "<p style='padding:16px'>Chưa có gợi ý. Chạy: npm run images -- " + esc(slug) + " --review</p>"}
<script>document.querySelectorAll('.card').forEach(b=>b.onclick=()=>{const c=b.dataset.cmd;document.getElementById('cmd').textContent=c;navigator.clipboard&&navigator.clipboard.writeText(c).catch(()=>{});});</script>
</body></html>`;
const htmlPath = path.join(imgDir, "chon-anh.html");
fs.writeFileSync(htmlPath, html);

console.log(`\nTrang chọn ảnh: ${path.resolve(htmlPath)}`);
const lines = [...new Set(items.filter((it) => credits[it.file]?.full).map((it) => `- ${credits[it.file].full}`))];
if (lines.length) console.log(`\nDán vào mô tả video (ghi nguồn ảnh):\nẢnh minh họa:\n${lines.join("\n")}`);
if (failed) process.exitCode = 1;
