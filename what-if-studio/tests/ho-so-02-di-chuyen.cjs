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
const plan = { points: [[40, 230], [200, 230], [200, 120], [390, 120]], speed: 70, start: 10, turn: 9 };
assert.deepEqual(m.walkState(plan, 3).at, [40, 230]);
assert.equal(m.walkState(plan, 3).moving, false);
const end = m.walkEnd(plan);
assert.deepEqual(m.walkState(plan, end + 50).at, [390, 120]);
assert.deepEqual(m.walkState(plan, 77), m.walkState(plan, 77));
let prev = m.walkState(plan, 10).at, maxStep = 0;
for (let f = 11; f <= end; f++) { const s = m.walkState(plan, f); maxStep = Math.max(maxStep, Math.hypot(s.at[0] - prev[0], s.at[1] - prev[1])); prev = s.at; }
assert.ok(maxStep <= (70 / 30) * 1.05, `không dịch nhanh hơn tốc độ khai báo: ${maxStep}`);

// Góc theo hướng đi nhìn từ máy 'wide' (nhìn dọc −z): đi về máy = +z → chính diện; ra xa → quay lưng; ngang → nghiêng, đúng chiều.
const F = (dir) => m.facingFor('wide', dir);
assert.equal(F([0, 1]).view, 'front'); assert.equal(F([0, -1]).view, 'back');
assert.deepEqual(F([1, 0]), { view: 'side', facing: 1 }); assert.deepEqual(F([-1, 0]), { view: 'side', facing: -1 });
assert.equal(F([1, 1]).view, 'three'); assert.equal(F([1, -1]).view, 'quarter'); assert.equal(F([-1, -1]).facing, -1);

// Rẽ gắt: góc đi qua các góc trung gian, không nhảy từ chính diện sang quay lưng.
const turnPlan = { points: [[100, 100], [100, 300], [300, 300]], speed: 70 };
const seen = new Set();
for (let f = 0; f < m.walkEnd(turnPlan); f++) { const w = m.walker('wide', turnPlan, f); seen.add(`${w.view}/${w.facing}`); }
assert.ok(seen.has('front/1') && (seen.has('three/1') || seen.has('side/1')), `rẽ đi qua góc trung gian: ${[...seen]}`);

// Bước chân không trượt: đi ngang ảnh, chân trụ (chân thấp hơn) đứng yên trên màn hình so với tốc độ thân.
const side = { points: [[40, 200], [420, 200]], speed: 70 };
const px = (f) => { const w = m.walker('wide', side, f), p = room.placeOn('wide', w.at), s = r.solveRig(w.pose), low = s.legR.end.y >= s.legL.end.y ? s.legR : s.legL; return { body: p.x, foot: p.x + (low.end.x + w.pose.x) * p.scale, low: s.legR.end.y >= s.legL.end.y ? 'R' : 'L', moving: w.moving }; };
let slide = 0, travel = 0, n = 0;
for (let f = 20; f < 100; f++) { const a = px(f), b = px(f + 1); if (a.low !== b.low || !a.moving) continue; slide += Math.abs(b.foot - a.foot); travel += Math.abs(b.body - a.body); n++; }
assert.ok(n > 40, 'đủ mẫu chân trụ');
console.log(`  chân trụ trượt ${(100 * slide / travel).toFixed(1)}% tốc độ thân`);
assert.ok(slide / travel < 0.2, `chân trụ trượt ${(100 * slide / travel).toFixed(1)}% tốc độ thân (cần < 20%)`);
assert.ok(m.strideCm() > 45 && m.strideCm() < 90, `chu kỳ bước ${m.strideCm().toFixed(0)} cm (hai bước, người cao 168 cm)`);
const cadence = 70 / m.strideCm(); assert.ok(cadence > 0.9 && cadence < 1.8, `nhịp ${cadence.toFixed(2)} chu kỳ/giây`);

// Mượt: toàn bộ khớp đổi liên tục qua đứng → tăng tốc → bước → rẽ → dừng (không giật ở đầu/cuối đoạn đi hay lúc đổi chân).
{
  const keys = ['legR.a', 'legR.b', 'legL.a', 'legL.b', 'armR.a', 'armR.b', 'armL.a', 'armL.b', 'tilt', 'neck', 'y'];
  const get = (p, k) => k.split('.').reduce((o, q) => o[q], p);
  const demo = { points: [[40, 300], [200, 300], [200, 150], [380, 150]], speed: 70, start: 6, turn: 9 };
  const N = m.walkEnd(demo) + 10, series = Array.from({ length: N }, (_, f) => m.walker('wide', demo, f).pose);
  let maxV = 0, maxA = 0, worst = '';
  for (let f = 2; f < N; f++) for (const k of keys) {
    const v = get(series[f], k) - get(series[f - 1], k), a2 = get(series[f], k) - 2 * get(series[f - 1], k) + get(series[f - 2], k);
    const sc = k === 'y' ? 3 : 1; // y theo đơn vị rig, khớp theo độ
    if (Math.abs(v) / sc > maxV) { maxV = Math.abs(v) / sc; }
    if (Math.abs(a2) / sc > maxA) { maxA = Math.abs(a2) / sc; worst = `${k}@${f}`; }
  }
  console.log(`  khớp: đổi tối đa ${maxV.toFixed(2)}°/khung, gia tốc tối đa ${maxA.toFixed(2)}°/khung² (${worst})`);
  assert.ok(maxV < 16, `khớp đổi quá nhanh ${maxV}`);
  assert.ok(maxA < 16, `khớp giật (gia tốc) ${maxA} tại ${worst}`);
}
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

// Điểm tiếp xúc: ngồi đúng mặt ghế, hai bàn tay chạm mặt bàn, chân chạm sàn — đo bằng px trên ảnh ở nhiều góc máy.
const ct = require(A + 'diem-tiep-xuc');
for (const view of ['desk', 'wide', 'bed']) {
  const sd = ct.seatedAt(view, 'desk'), s = ct.seatAnchor('desk');
  const hands = { R: [388, 67, 64], L: [410, 67, 65] };
  const { pose, at } = ct.seatedAt(view, 'desk', { hands });
  const frontal = pose.view === 'front' || pose.view === 'back'; // rig không biểu diễn được tay đưa tới trước theo chiều sâu khi nhìn thẳng/sau lưng
  console.log(`  ${view}: ngồi nhìn ${pose.view}/${pose.facing}`, frontal ? '(không đo tay: góc thẳng/sau lưng)' : ['R', 'L'].map((q) => ct.reachError(view, at, pose, q, hands[q]).toFixed(1) + 'px').join(' '));
  for (const side of frontal ? [] : ['R', 'L']) {
    const e = ct.reachError(view, at, pose, side, hands[side]);
    assert.ok(e < 8, `${view}: bàn tay ${side} cách mặt bàn ${e.toFixed(1)} px`);
  }
  const k = room.placeOn(view, at).scale; // px / đơn vị rig
  const hip = ct.rigToScreen(view, at, pose, [0, 345])[1], seatTop = room.screenOf(view, [s.at[0], s.top, s.at[1]])[1];
  const padPx = 6 * (590 / 168) * k; // hông cao hơn mặt ghế 6 cm
  assert.ok(Math.abs(seatTop - hip - padPx) < 6, `${view}: hông lệch mặt ghế ${(seatTop - hip - padPx).toFixed(1)} px`);
  const low = Math.max(r.solveRig(pose).legR.end.y, r.solveRig(pose).legL.end.y), sole = ct.rigToScreen(view, at, pose, [0, low + 34])[1];
  const floor = room.placeOn(view, at); assert.ok(Math.abs(sole - (floor.y + 590 * floor.scale)) < 8, `${view}: chân chạm sàn lệch ${(sole - (floor.y + 590 * floor.scale)).toFixed(1)} px`);
  assert.ok(!JSON.stringify(pose).includes('NaN'));
}
// Vóc dáng khác (Nam dáng tham chiếu: chân 99/99): tiếp xúc vẫn khớp khi truyền `build`.
{
  const dang = { upperArm: 78, foreArm: 72, thigh: 99, shin: 99, shoulderX: 0.9, arm: [17.5, 15.5, 13.5], hand: 1.18, sleeve: [24, 26, 26], pants: [28, 26, 26], pantsEnd: 0.84, foot: 1 };
  const hands = { R: [388, 67, 64], L: [410, 67, 65] };
  const { pose, at } = ct.seatedAt('desk', 'desk', { hands, build: dang });
  for (const side of ['R', 'L']) assert.ok(ct.reachError('desk', at, pose, side, hands[side], { build: dang }) < 8, `dáng tham chiếu: tay ${side}`);
  const s = ct.seatAnchor('desk'), k = room.placeOn('desk', at).scale;
  const hip = ct.rigToScreen('desk', at, pose, [0, 345], { build: dang })[1], seatTop = room.screenOf('desk', [s.at[0], s.top, s.at[1]])[1];
  assert.ok(Math.abs(seatTop - hip - 6 * (590 / 168) * k) < 6, 'dáng tham chiếu: hông đúng mặt ghế');
}
assert.ok(Math.abs(ct.hipHeightCm({ ...r.STAND_POSE, ...ct.sitLegs(40) }) - 46) < 2, 'sitLegs đưa hông tới mặt ghế + 6 cm');
// Ngả theo mặt sàn: người co chiều cao theo cos θ; điểm tiếp xúc vẫn khớp khi truyền cùng floorTilt.
for (const floorTilt of [1]) {
  const c = room.tiltCos('wide', [396, 112], floorTilt); assert.ok(c < 1 && c > 0.8, `cos θ = ${c}`);
  assert.equal(room.tiltCos('wide', [396, 112], 0), 1);
  assert.ok(room.tiltCos('wide', [150, 380], floorTilt) < room.tiltCos('wide', [150, 60], floorTilt), 'người gần máy ngả nhiều hơn người xa');
  const hands = { R: [388, 67, 64], L: [410, 67, 65] };
  const { pose, at } = ct.seatedAt('desk', 'desk', { hands, floorTilt });
  for (const side of ['R', 'L']) assert.ok(ct.reachError('desk', at, pose, side, hands[side], { floorTilt }) < 8, `ngả sàn: tay ${side}`);
  const k = room.placeOn('desk', at).scale, s = ct.seatAnchor('desk'), cc = room.tiltCos('desk', at, floorTilt), pl = room.placeOn('desk', at);
  const hip = ct.rigToScreen('desk', at, pose, [0, 345], { floorTilt })[1], seatTop = room.screenOf('desk', [s.at[0], s.top, s.at[1]])[1];
  assert.ok(Math.abs(seatTop - hip - 6 * (590 / 168) * k) < 6, `ngả sàn: hông lệch ${(seatTop - hip - 6 * (590 / 168) * k).toFixed(1)} px`);
  const html = renderToStaticMarkup(React.createElement(room.RoomScene, { view: 'wide', floorTilt, actors: [{ at: [200, 300], render: (p) => React.createElement(r.StudentTwinBody, { ...p, mood: 'calm' }) }] }));
  assert.ok(/scale\(1 0\.[89]\d+\)/.test(html), 'người được ngả theo sàn');
}
// Chuyển dáng giữa hai chiều gập khuỷu khác nhau: khuỷu duỗi qua thẳng, không lật cẳng tay đột ngột ở giữa chặng.
{
  const sg = require(A + 'song-dong');
  const a = { ...r.STAND_POSE, armL: { a: 20, b: 60, rot: 1 } }, b = { ...r.STAND_POSE, armL: { a: 20, b: 60, rot: -1 } };
  let prevB = 60;
  for (let t = 0; t <= 1.0001; t += 0.05) { const p = sg.easePose(a, b, t), p2 = r.mixPose(a, b, t); assert.ok(Math.abs(p.armL.b - prevB) < 25, `easePose khuỷu nhảy ở t=${t.toFixed(2)}`); prevB = p.armL.b; assert.ok(p2.armL.b <= 60.001 && p2.armL.b >= 0, 'mixPose khuỷu hợp lệ'); }
  assert.ok(Math.min(...[0.4, 0.5, 0.6].map((t) => r.mixPose(a, b, t).armL.b)) < 15, 'mixPose duỗi gần thẳng ở giữa chặng đổi chiều gập');
}
console.log('di-chuyen ok: điểm tiếp xúc ghế, bàn, sàn, ngả theo mặt sàn');
