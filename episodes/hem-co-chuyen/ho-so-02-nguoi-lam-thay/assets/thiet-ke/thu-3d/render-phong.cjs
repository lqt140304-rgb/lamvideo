// Render lớp Nam 3D (nền trong suốt) đặt trong phòng: node render-phong.cjs <thư mục> <từ khung> <đến khung> [fps=30]
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
  const [out, a, b, fps = 30] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', (e) => console.error('pageerror:', e.message));
  await page.goto(`http://127.0.0.1:${srv.address().port}/phong.html${process.env.Q || ''}`);
  await page.waitForFunction('window.ready === true', null, { timeout: 60000 });
  for (let f = +a; f <= +b; f++) {
    const url = await page.evaluate((t) => window.show(t), f / +fps);
    fs.writeFileSync(path.join(out, `f${String(f).padStart(4, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
  }
  await browser.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
