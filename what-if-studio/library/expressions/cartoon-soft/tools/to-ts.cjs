// Gom 28 SVG nét mặt thành module TS để rig React ghép trực tiếp (chuỗi SVG theo từng lớp). Chạy lại sau khi export.py cập nhật SVG.
// node what-if-studio/library/expressions/cartoon-soft/tools/to-ts.cjs
const fs = require('node:fs'), path = require('node:path');
const dir = path.join(__dirname, '..'), svgDir = path.join(dir, 'svg');
const LAYERS = ['color', 'eyes', 'brows', 'nose', 'mouth', 'details'];
// Lấy nguyên khối <g ...>...</g> bắt đầu tại `start`, đếm cặp thẻ g lồng nhau.
const block = (s, start) => {
  const open = s.slice(start, s.indexOf('>', start) + 1);
  if (open.endsWith('/>')) return open; // lớp rỗng
  const re = /<g\b[^>]*>|<\/g>/g; re.lastIndex = start; let depth = 0, m;
  while ((m = re.exec(s))) {
    if (m[0].endsWith('/>')) continue;
    depth += m[0] === '</g>' ? -1 : 1;
    if (depth === 0) return s.slice(start, m.index + 4);
  }
  throw new Error('unbalanced g');
};
const out = {};
for (const file of fs.readdirSync(svgDir).filter((f) => f.endsWith('.svg')).sort()) {
  const key = file.replace('.svg', ''), s = fs.readFileSync(path.join(svgDir, file), 'utf8');
  const defs = (s.match(/<defs>[\s\S]*?<\/defs>/) || [''])[0];
  const fi = s.indexOf(`<g id="${key}-features"`); if (fi < 0) throw new Error(`${key}: no features group`);
  const wrap = s.slice(fi, s.indexOf('>', fi) + 1);
  const layers = {};
  for (const l of LAYERS) { const i = s.indexOf(`<g id="${key}-${l}"`); if (i < 0) throw new Error(`${key}: no ${l}`); layers[l] = block(s, i); }
  out[key] = { defs, wrap, layers };
}
const keys = Object.keys(out);
if (keys.length !== 28) throw new Error(`expected 28 expressions, got ${keys.length}`);
fs.writeFileSync(path.join(dir, 'net-mat.ts'), `// TỰ SINH bởi tools/to-ts.cjs từ svg/*.svg — không sửa tay.\n// viewBox nguồn -65 -50 130 120; gốc (0,0) gần giữa hai mắt, mắt (-23,2)/(23,-1), giữa miệng (6,41).\nexport type FaceLayer = ${LAYERS.map((l) => `'${l}'`).join(' | ')};\nexport type FaceKey = ${keys.map((k) => `'${k}'`).join(' | ')};\nexport const FACES: Record<FaceKey, { defs: string; wrap: string; layers: Record<FaceLayer, string> }> = ${JSON.stringify(out, null, 1)};\n`);
console.log('net-mat.ts', keys.length, 'nét mặt');
