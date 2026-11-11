// Kiểm tra khói 2.5D (Hồ sơ 02): mọi nhân vật chính × góc × kiểu sáng × vài tư thế dựng được, hợp lệ và có đủ lớp.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const {createRequire} = require('node:module');
const studio = path.resolve(__dirname, '../../../../../../what-if-studio');
const req = createRequire(path.join(studio, 'package.json'));
process.env.NODE_PATH = path.join(studio, 'node_modules'); require('node:module').Module._initPaths();
const ts = req('typescript');
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {fileName: f, compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020}}).outputText, f);
const React = req('react'), {renderToStaticMarkup} = req('react-dom/server');
const {Nam25D, LIGHTS_25D} = require('./nam-2-5d.tsx');
const {NguoiKia25D, Tung25D} = require('./nhan-vat-khac-2-5d.tsx');
const {STAND_POSE, TWIN_POSES} = require('../../nhan-vat.tsx');
const who = {nam: Nam25D, kia: NguoiKia25D, tung: Tung25D};
const poses = {dung: STAND_POSE, ngoi: TWIN_POSES.sit, dien_thoai: TWIN_POSES.phone, di: TWIN_POSES.stride};
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };
for (const [name, C] of Object.entries(who)) for (const view of ['front', 'three', 'side', 'quarter', 'back']) for (const light of Object.keys(LIGHTS_25D)) for (const [pn, pose] of Object.entries(poses)) {
  if (!['three', 'front'].includes(view) && pn !== 'dung') continue;
  const tag = `${name}/${view}/${light}/${pn}`;
  const svg = renderToStaticMarkup(React.createElement('svg', null, React.createElement(C, {pose: {...pose, view, facing: 1}, lighting: light, x: 100, y: 20, scale: 0.8})));
  ok(!/NaN|undefined|Infinity/.test(svg), `${tag}: không NaN/undefined`);
  ok(svg.includes(`data-volume="${light}"`), `${tag}: có lớp 2.5D`);
  ok((svg.match(/<mask /g) || []).length >= 8, `${tag}: đủ mask các khối`);
  // volume={false} phải trả đúng nhân vật 2D, không có lớp 2.5D
  if (light === 'ngay' && pn === 'dung') { const flat = renderToStaticMarkup(React.createElement('svg', null, React.createElement(C, {pose: {...pose, view}, volume: false}))); ok(!flat.includes('data-volume'), `${tag}: volume=false không có lớp 2.5D`); }
}
// bảng màu khối: Tùng chọn được áo/quần/tóc theo màu của chính Tùng
const tungSvg = renderToStaticMarkup(React.createElement('svg', null, React.createElement(Tung25D, {pose: {...STAND_POSE, view: 'three'}})));
ok(tungSvg.includes('[fill="#1d4e89"]') && tungSvg.includes('[fill="#142842"]') && tungSvg.includes('[fill="#252728"]'), 'Tùng: bộ chọn khối theo màu áo, quần, tóc của Tùng');
console.log(`ho-so-02 2.5D ok (${n} kiểm tra, ${Object.keys(who).length} nhân vật)`);
