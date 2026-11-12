// Render thử Nam 3D: node render.cjs <out.png> '<json show()>' [w h]
// Hoặc nhiều khung: node render.cjs --seq <thư mục> <số khung> [w h]  (xoay vòng + thở)
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const ROOT = __dirname, TYPES = { '.html': 'text/html', '.js': 'text/javascript' };
const srv = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port, a = process.argv.slice(2);
  const seq = a[0] === '--seq', w = +(a[seq ? 3 : 2] || 900), h = +(a[seq ? 4 : 3] || 1200);
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.on('console', (m) => m.type() === 'error' && console.error('page:', m.text()));
  page.on('pageerror', (e) => console.error('pageerror:', e.message));
  await page.goto(`http://127.0.0.1:${port}/scene.html?w=${w}&h=${h}${process.env.Q || ''}`);
  await page.waitForFunction('window.ready === true', null, { timeout: 60000 });
  const canvas = await page.$('canvas');
  if (!seq) {
    await page.evaluate((o) => window.show(o), JSON.parse(a[1] || '{}'));
    await canvas.screenshot({ path: a[0] });
  } else {
    fs.mkdirSync(a[1], { recursive: true });
    const n = +a[2];
    for (let i = 0; i < n; i++) {
      const t = i / 30;
      await page.evaluate((o) => window.show(o), { az: (i / n) * Math.PI * 2, t });
      await canvas.screenshot({ path: path.join(a[1], `f${String(i).padStart(4, '0')}.png`) });
    }
  }
  await browser.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
