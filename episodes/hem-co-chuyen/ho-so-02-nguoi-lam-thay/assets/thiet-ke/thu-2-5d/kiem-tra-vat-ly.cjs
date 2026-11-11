// Kiểm tra vật lý thứ cấp (Hồ sơ 02): node episodes/.../thu-2-5d/kiem-tra-vat-ly.cjs
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const {createRequire} = require('node:module');
const studio = path.resolve(__dirname, '../../../../../../what-if-studio');
const req = createRequire(path.join(studio, 'package.json'));
process.env.NODE_PATH = path.join(studio, 'node_modules'); require('node:module').Module._initPaths();
const ts = req('typescript');
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {fileName: f, compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020}}).outputText, f);
const {simulate, PHYS_SCENES, DEFAULT_PHYS} = require('./vat-ly.tsx');
const {LIMIT, solveRig, STAND_POSE} = require('../../nhan-vat.tsx');
let n = 0;
// tỉ số giảm chấn ζ = c / (2√k): dưới tới hạn (còn dao động) nhưng không lắc mãi
for (const key of ['tilt', 'neck', 'arm', 'forearm', 'sq', 'hair', 'hem']) { const [k, c] = DEFAULT_PHYS[key]; const z = c / (2 * Math.sqrt(k)); assert.ok(z >= 0.25 && z < 1, `${key}: ζ=${z.toFixed(2)} phải trong [0,25; 1)`); n++; }
const ok = (c, m) => { assert.ok(c, m); n++; };
for (const sc of PHYS_SCENES) {
  const a = simulate(sc.base, sc.impacts, sc.total), b = simulate(sc.base, sc.impacts, sc.total);
  ok(JSON.stringify(a) === JSON.stringify(b), `${sc.id}: mô phỏng phải tất định`);
  let peak = 0;
  a.forEach((fr, f) => {
    const p = fr.pose;
    for (const v of [p.tilt, p.neck, p.armR.a, p.armR.b, p.armL.a, p.armL.b, p.legR.a, p.legR.b, p.legL.a, p.legL.b, fr.hair.rot, fr.hair.dx, fr.hair.dy, fr.hem.dx, fr.hem.dy, fr.squash.sx, fr.squash.sy]) ok(Number.isFinite(v), `${sc.id}[${f}]: số hữu hạn`);
    ok(Math.abs(fr.squash.sx * fr.squash.sy - 1) < 1e-9, `${sc.id}[${f}]: dẹt–vươn giữ thể tích`);
    ok(fr.squash.sy > 0.9 && fr.squash.sy < 1.1, `${sc.id}[${f}]: dẹt–vươn trong ±10%`);
    ok(p.armR.b >= 0 && p.armL.b >= 0 && p.legR.b >= 0 && p.legL.b >= 0, `${sc.id}[${f}]: khuỷu/gối không gập ngược`);
    // rig tự chặn theo LIMIT khi giải khớp; kiểm tra giải không văng NaN
    const r = solveRig({...p, view: 'three'});
    for (const j of [r.armR, r.armL, r.legR, r.legL]) ok(Number.isFinite(j.end.x) && Number.isFinite(j.end.y), `${sc.id}[${f}]: giải khớp hữu hạn`);
    peak = Math.max(peak, Math.abs(fr.pose.tilt - sc.base(f).tilt), Math.abs(fr.hair.rot), Math.abs(fr.squash.sy - 1) * 100);
  });
  ok(peak > 2, `${sc.id}: phải có phản ứng nhìn thấy được (đỉnh ${peak.toFixed(1)})`);
  // lặng lại: 12 khung cuối lệch khỏi tư thế gốc ≤ độ thở
  const tail = a.slice(-12).map((fr, i) => Math.abs(fr.pose.tilt - sc.base(sc.total - 12 + i).tilt));
  ok(Math.max(...tail) < DEFAULT_PHYS.breath + 0.8, `${sc.id}: dao động phải tắt dần (đuôi ${Math.max(...tail).toFixed(2)}°)`);
  const hairTail = Math.max(...a.slice(-12).map((fr) => Math.abs(fr.hair.rot)));
  ok(hairTail < 1.2, `${sc.id}: tóc phải lặng lại (đuôi ${hairTail.toFixed(2)}°)`);
}
// đứng yên không tác động: chỉ có hơi thở
const calm = simulate(() => ({...STAND_POSE, view: 'three', facing: 1}), [], 120);
ok(Math.max(...calm.map((fr) => Math.abs(fr.pose.tilt))) <= DEFAULT_PHYS.breath + 1e-6, 'đứng yên không tác động chỉ được thở');
ok(Math.max(...calm.map((fr) => Math.abs(fr.hair.rot) + Math.abs(fr.hem.dx))) < 1e-9, 'đứng yên không tác động thì tóc và vạt áo không động');
console.log(`ho-so-02 vat-ly ok (${n} kiểm tra, ${PHYS_SCENES.length} cảnh)`);
