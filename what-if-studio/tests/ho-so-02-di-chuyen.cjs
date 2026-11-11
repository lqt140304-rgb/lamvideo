// node tests/ho-so-02-di-chuyen.cjs — đường đi trên sàn, góc theo hướng đi, bước chân không trượt, thứ tự che khuất.
process.env.NODE_PATH = [require('node:path').resolve(__dirname, '../node_modules'), process.env.NODE_PATH].filter(Boolean).join(require('node:path').delimiter);
require('node:module').Module._initPaths();
require('./shared-assets.cjs');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const A = '../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/';
const m = require(A + 'di-chuyen'), room = require(A + 'boi-canh/boi-canh'), r = require(A + 'nhan-vat');

// Kế hoạch: đứng yên trước khi bắt đầu, đi đều, rẽ có xoay tại chỗ, dừng ở đích; tất định.
const plan = { points: [[40, 230], [200, 230], [200, 120], [390, 120]], speed: 90, start: 10, turn: 9 };
assert.deepEqual(m.walkState(plan, 3).at, [40, 230]);
assert.equal(m.walkState(plan, 3).moving, false);
const end = m.walkEnd(plan);
assert.deepEqual(m.walkState(plan, end + 50).at, [390, 120]);
assert.deepEqual(m.walkState(plan, 77), m.walkState(plan, 77));
let prev = m.walkState(plan, 10).at, maxStep = 0;
for (let f = 11; f <= end; f++) { const s = m.walkState(plan, f); maxStep = Math.max(maxStep, Math.hypot(s.at[0] - prev[0], s.at[1] - prev[1])); prev = s.at; }
assert.ok(maxStep <= (90 / 30) * 1.05, `không dịch nhanh hơn tốc độ khai báo: ${maxStep}`);

// Góc theo hướng đi nhìn từ máy 'wide' (nhìn dọc −z): đi về máy = +z → chính diện; ra xa → quay lưng; ngang → nghiêng, đúng chiều.
const F = (dir) => m.facingFor('wide', dir);
assert.equal(F([0, 1]).view, 'front'); assert.equal(F([0, -1]).view, 'back');
assert.deepEqual(F([1, 0]), { view: 'side', facing: 1 }); assert.deepEqual(F([-1, 0]), { view: 'side', facing: -1 });
assert.equal(F([1, 1]).view, 'three'); assert.equal(F([1, -1]).view, 'quarter'); assert.equal(F([-1, -1]).facing, -1);

// Rẽ gắt: góc đi qua các góc trung gian, không nhảy từ chính diện sang quay lưng.
const turnPlan = { points: [[100, 100], [100, 300], [300, 300]], speed: 90 };
const seen = new Set();
for (let f = 0; f < m.walkEnd(turnPlan); f++) { const w = m.walker('wide', turnPlan, f); seen.add(`${w.view}/${w.facing}`); }
assert.ok(seen.has('front/1') && (seen.has('three/1') || seen.has('side/1')), `rẽ đi qua góc trung gian: ${[...seen]}`);

// Bước chân không trượt: đi ngang ảnh, chân trụ (chân thấp hơn) đứng yên trên màn hình so với tốc độ thân.
const side = { points: [[40, 200], [420, 200]], speed: 90 };
const px = (f) => { const w = m.walker('wide', side, f), p = room.placeOn('wide', w.at), s = r.solveRig(w.pose), low = s.legR.end.y >= s.legL.end.y ? s.legR : s.legL; return { body: p.x, foot: p.x + (low.end.x + w.pose.x) * p.scale, low: s.legR.end.y >= s.legL.end.y ? 'R' : 'L', moving: w.moving }; };
let slide = 0, travel = 0, n = 0;
for (let f = 20; f < 100; f++) { const a = px(f), b = px(f + 1); if (a.low !== b.low || !a.moving) continue; slide += Math.abs(b.foot - a.foot); travel += Math.abs(b.body - a.body); n++; }
assert.ok(n > 40, 'đủ mẫu chân trụ');
assert.ok(slide / travel < 0.2, `chân trụ trượt ${(100 * slide / travel).toFixed(1)}% tốc độ thân (cần < 20%)`);
assert.ok(m.strideCm() > 50 && m.strideCm() < 90, `chu kỳ bước ${m.strideCm().toFixed(0)} cm (hai bước, người cao 168 cm)`);
const cadence = 90 / m.strideCm(); assert.ok(cadence > 0.9 && cadence < 1.8, `nhịp ${cadence.toFixed(2)} chu kỳ/giây`);

// Che khuất: đi sau nệm thì vẽ người TRƯỚC nệm (nệm che chân); đứng trước nệm thì vẽ SAU. Kiểm tra bằng thứ tự các nút trong SVG.
const order = (at) => {
  const html = renderToStaticMarkup(React.createElement(room.RoomScene, { view: 'wide', actors: [{ at, render: (p) => React.createElement('rect', { 'data-actor': 1, x: p.x, y: p.y, width: 10, height: 10 }) }] }));
  return html;
};
const bedMark = (html) => html.indexOf('data-actor');
const behindBed = order([350, 190]), frontBed = order([350, 420]);
assert.ok(behindBed.includes('data-actor') && frontBed.includes('data-actor'));
assert.ok(bedMark(behindBed) < bedMark(frontBed), 'người phía sau nệm được vẽ sớm hơn người đứng trước nệm');
// Bóng tiếp xúc theo vị trí: mỗi người đặt qua actors có bóng riêng, vệt cố định trong rig bị ẩn.
const sh = renderToStaticMarkup(React.createElement(room.RoomScene, { view: 'wide', actors: [{ at: [120, 300], render: (p) => React.createElement(r.StudentTwinBody, { ...p, mood: 'calm' }) }] }));
assert.ok(sh.includes('data-shadow="drawn-contact"]{display:none}'), 'ẩn bóng cố định của rig');
assert.ok(!sh.includes('NaN'));
console.log('di-chuyen ok: đường đi, góc theo hướng, bước không trượt, che khuất, bóng theo vị trí');
