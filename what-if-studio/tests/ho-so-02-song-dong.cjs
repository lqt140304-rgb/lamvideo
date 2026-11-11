// node tests/ho-so-02-song-dong.cjs — kiểm tra lớp "dáng sống": tất định theo số khung, biên độ nhỏ, không NaN, amount 0 trả lại dáng gốc,
// khớp vẫn trong giới hạn rig, chuyển dáng đi đúng điểm đầu/cuối. Không thay được việc xem chuyển động.
process.env.NODE_PATH = [require('node:path').resolve(__dirname, '../node_modules'), process.env.NODE_PATH].filter(Boolean).join(require('node:path').delimiter)
require('node:module').Module._initPaths();
require('./shared-assets.cjs');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const A = '../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/';
const r = require(A + 'nhan-vat'), s = require(A + 'song-dong');

// Tất định: cùng khung, cùng seed → cùng kết quả; khác seed → khác nhịp.
assert.deepEqual(s.lifePose(r.STAND_POSE, 123, { seed: 2 }), s.lifePose(r.STAND_POSE, 123, { seed: 2 }));
assert.notEqual(s.lifePose(r.STAND_POSE, 40, { seed: 1 }).tilt, s.lifePose(r.STAND_POSE, 40, { seed: 5 }).tilt);
// amount 0 → đúng dáng gốc
assert.deepEqual(s.lifePose(r.STAND_POSE, 77, { amount: 0 }), r.STAND_POSE);

// Biên độ nhỏ và khớp hợp lệ trên mọi dáng mẫu, hàng trăm khung
let maxDTilt = 0, maxDNeck = 0;
for (const [name, pose] of [...Object.entries(r.TWIN_POSES), ['tung', r.TUNG_POSE]]) {
  for (let f = 0; f < 900; f += 7) {
    const p = s.lifePose(pose, f, { seed: 3 });
    maxDTilt = Math.max(maxDTilt, Math.abs(p.tilt - pose.tilt)); maxDNeck = Math.max(maxDNeck, Math.abs(p.neck - pose.neck));
    const sol = r.solveRig(p);
    assert.ok(Object.values(sol).every((v) => JSON.stringify(v).indexOf('NaN') < 0), `${name} f${f} NaN`);
    assert.ok(p.armR.b >= 0 && p.armL.b >= 0, `${name} khuỷu gập ngược`);
  }
}
assert.ok(maxDTilt < 2 && maxDNeck < 3.5, `biên độ quá lớn: tilt ${maxDTilt} neck ${maxDNeck}`);

// Thở: có đổi dấu trong ~4 s, chu kỳ 3–4 s
let flips = 0, prev = Math.sign(s.breath(0, 4));
for (let f = 1; f < 300; f++) { const c = Math.sign(s.breath(f, 4)); if (c !== prev) { flips++; prev = c; } }
assert.ok(flips >= 4 && flips <= 8, `nhịp thở lạ: ${flips} lần đổi dấu trong 10 s`);

// Chớp mắt: không đều, trung bình 1 lần mỗi 2–6 s, mỗi lần 5 khung
let blinks = 0, run = 0, runs = [];
for (let f = 0; f < 3000; f++) { if (s.blinkAt(f, 1)) run++; else if (run) { runs.push(run); run = 0; blinks++; } }
assert.ok(blinks > 15 && blinks < 60, `số lần chớp trong 100 s: ${blinks}`);
assert.ok(runs.every((x) => x === 5), 'mỗi lần chớp dài 5 khung');

// Khẩu hình: ngoài khoảng thoại là undefined, trong khoảng có đổi hình và độ mở
assert.equal(s.speak(5, 10, 100), undefined);
const shapes = new Set(); for (let f = 10; f < 100; f++) { const t = s.speak(f, 10, 100); assert.ok(t); shapes.add(t.shape); }
assert.ok(shapes.size >= 3, 'khẩu hình tạm nên đổi hình');

// Chuyển dáng: đúng đầu và cuối, giữa chừng không NaN, có quá đà nhưng nằm trong giới hạn
const a = r.TWIN_POSES.stand, b = r.TWIN_POSES.reach;
assert.deepEqual(s.easePose(a, b, 0), a); assert.deepEqual(s.easePose(a, b, 1), b);
let over = 0;
for (let t = 0.05; t < 1; t += 0.05) { const p = s.easePose(a, b, t, { anticipate: 4 }); assert.ok(!JSON.stringify(p).includes('NaN')); over = Math.max(over, p.tilt - b.tilt); assert.ok(p.armR.b >= 0); }
assert.ok(over > 0 && over < 6, `quá đà tilt: ${over}`);
// vai trên đến đích trước, bàn tay sau cùng
const mid = s.easePose({ ...a, wristR: 0 }, { ...b, wristR: 60 }, 0.5);
assert.ok(mid.wristR / 60 < (mid.tilt - a.tilt) / (b.tilt - a.tilt), 'cổ tay phải trễ hơn thân');

// Dựng ra SVG không lỗi, có lớp thở khác nhau giữa hai khung
const html = (f) => renderToStaticMarkup(React.createElement('svg', null, React.createElement(s.LivingTwin, { frame: f, seed: 1, pose: r.TWIN_POSES.sit })));
assert.ok(!html(30).includes('NaN')); assert.notEqual(html(10), html(60));
assert.ok(!renderToStaticMarkup(React.createElement('svg', null, React.createElement(s.LivingTung, { frame: 20 }))).includes('NaN'));
assert.ok(!renderToStaticMarkup(React.createElement('svg', null, React.createElement(s.LivingCast, { frame: 100, role: 'giang-vien' }))).includes('NaN'));
console.log('song-dong ok: thở, chớp, trôi, khẩu hình, chuyển dáng có đà');
