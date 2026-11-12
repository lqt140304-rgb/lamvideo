// Kiểm tra tương tác nhân vật – bối cảnh (Hồ sơ 02): node tests/ho-so-02-tuong-tac.cjs
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
process.env.NODE_PATH = path.join(__dirname, '..', 'node_modules'); require('node:module').Module._initPaths(); // tệp tập nằm ngoài studio
const ts = require('typescript');
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {fileName: f, compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020}}).outputText, f);
const T = require('../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/tuong-tac.tsx');
const {fanYaw} = require('../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh.tsx');
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };

// đồ vật bị xô: đứng yên trước cú va, trượt theo hướng xô, dừng hẳn do ma sát, tất định
const shove = [{f: 10, vx: 4, vz: -1, spin: 0.08}];
ok(JSON.stringify(T.pushedObject(9, shove)) === JSON.stringify({dx: 0, dz: 0, rot: 0, speed: 0}), 'ghế đứng yên trước cú va');
const a = T.pushedObject(60, shove), b = T.pushedObject(60, shove), c = T.pushedObject(200, shove);
ok(JSON.stringify(a) === JSON.stringify(b), 'tất định');
ok(a.dx > 15 && a.dx < 40 && a.dz < 0 && a.rot > 0, `trượt theo hướng xô (${a.dx.toFixed(1)} cm, ${a.rot.toFixed(2)} rad)`);
ok(a.speed === 0 && c.dx === a.dx && c.rot === a.rot, 'ma sát làm dừng hẳn, không trôi tiếp');
let prev = 0; for (let f = 10; f < 60; f++) { const s = T.pushedObject(f, shove); ok(s.dx >= prev - 1e-9, `không bật ngược (khung ${f})`); prev = s.dx; }

// rung máy: chỉ quanh lúc va, tắt dần
ok(T.cameraShake(5, [{f: 10, amp: 2}]).truck === 0, 'chưa va thì máy đứng yên');
ok(Math.abs(T.cameraShake(40, [{f: 10, amp: 2}]).truck) === 0, 'rung tắt sau ~0,8 s');
const peak = Math.max(...Array.from({length: 24}, (_, i) => Math.abs(T.cameraShake(10 + i, [{f: 10, amp: 2}]).truck)));
ok(peak > 0.5 && peak <= 2, `biên độ rung hợp lý (${peak.toFixed(2)} cm)`);

// gió quạt: theo hướng quạt thật; sau lưng quạt không có gió; xa thì yếu
for (const f of [0, 50, 120]) {
  const yaw = fanYaw(f), ahead = [32 + Math.sin(yaw) * 120, 388 + Math.cos(yaw) * 120], behind = [32 - Math.sin(yaw) * 120, 388 - Math.cos(yaw) * 120];
  ok(T.fanWind(f, ahead).strength > 0.2, `trước quạt có gió (khung ${f})`);
  ok(T.fanWind(f, behind).strength === 0, `sau lưng quạt không có gió (khung ${f})`);
  const far = [32 + Math.sin(yaw) * 300, 388 + Math.cos(yaw) * 300];
  ok(T.fanWind(f, far).strength < T.fanWind(f, ahead).strength, `xa quạt gió yếu hơn (khung ${f})`);
}
const ws = T.windSway(30, [140, 430], 1);
ok([ws.hair.rot, ws.hair.dx, ws.hair.dy, ws.hem.dx, ws.hem.dy].every(Number.isFinite), 'độ lệch tóc/vạt áo hữu hạn');
ok(Math.abs(ws.hair.rot) <= 9 && Math.abs(ws.hem.dx) <= 8, 'gió không thổi lệch quá tay');

// bước chân: hai bước mỗi chu kỳ
const steps = T.footFalls(0, 60, (f) => f / 30);
ok(steps.length === 4 && steps.every((s, i) => i === 0 || s - steps[i - 1] === 15), `bước chân đều (${steps.join(',')})`);
console.log(`ho-so-02 tuong-tac ok (${n} kiểm tra)`);
