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
assert.ok(maxDTilt < 3.6 && maxDNeck < 5.5, `biên độ quá lớn: tilt ${maxDTilt} neck ${maxDNeck}`);

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
// Nam 2.5D sống: dựng được, không NaN, đổi giữa hai khung; lớp sống động chồng lên vật lý thứ cấp (NamVatLy) vẫn hợp lệ
const n25 = (f) => renderToStaticMarkup(React.createElement('svg', null, React.createElement(s.LivingNam25D, { frame: f, seed: 1, pose: r.TWIN_POSES.stand, lighting: 'den-vang' })));
assert.ok(!n25(20).includes('NaN')); assert.notEqual(n25(10), n25(70));
const vl = require(A + 'thiet-ke/thu-2-5d/vat-ly');
const track = vl.simulate((f) => s.lifePose(r.TWIN_POSES.stand, f, { seed: 1 }), [{ f: 40, kind: 'va', dir: 1 }], 120);
assert.ok(track.length === 120 && !JSON.stringify(track).includes('NaN'), 'vật lý chồng lớp sống động');
// Người Kia 2.5D, Tùng 2.5D, và gói dáng sống + vật lý thành một thành phần
const html2 = (el) => renderToStaticMarkup(React.createElement('svg', null, el));
const nk = html2(React.createElement(s.LivingNguoiKia25D, { frame: 30, seed: 3, pose: r.TWIN_POSES.stand, lighting: 'dem-xanh' }));
assert.ok(!nk.includes('NaN') && nk.length > 1000, 'Người Kia 2.5D');
const tg = html2(React.createElement(s.LivingTung25D, { frame: 30, lighting: 'den-vang' }));
assert.ok(!tg.includes('NaN') && tg.includes('data-volume'), 'Tùng 2.5D có lớp sáng');
assert.notEqual(tg, html2(React.createElement(s.LivingTung25D, { frame: 80, lighting: 'den-vang' })));
const sv = (f, extra = {}) => html2(React.createElement(s.NamSongVatLy, { frame: f, total: 120, base: () => r.TWIN_POSES.stand, impacts: [{ f: 40, kind: 'va', dir: 1 }], seed: 1, ...extra }));
assert.ok(!sv(10).includes('NaN') && !sv(44).includes('NaN') && !sv(100).includes('NaN'));
assert.notEqual(sv(38), sv(46), 'cú va phải đổi hình');
assert.notEqual(sv(44), sv(44, { physics: false }), 'physics=false khác có vật lý');
// Tùng có vật lý thứ cấp: cú va đổi hình, vạt áo đấu lệch, physics=false khác, không NaN
const tv = (f, extra = {}) => html2(React.createElement(s.TungSongVatLy, { frame: f, total: 120, impacts: [{ f: 40, kind: 'giat-minh', mag: 1.6, dir: 1 }], seed: 4, ...extra }));
assert.ok(!tv(10).includes('NaN') && !tv(44).includes('NaN') && !tv(100).includes('NaN'));
assert.notEqual(tv(38), tv(45), 'giật mình phải đổi hình Tùng');
assert.notEqual(tv(45), tv(45, { physics: false }));
const tgOutfit = require(A + 'thiet-ke/thu-2-5d/tung-2-5d').tungOutfitSway;
assert.deepEqual(tgOutfit(undefined).hem, r.TUNG_OUTFIT.hem); assert.notDeepEqual(tgOutfit({ dx: 6, dy: 4 }).hem, r.TUNG_OUTFIT.hem);
assert.deepEqual(tgOutfit({ dx: 6, dy: 4 }).hem.slice(0, 2), r.TUNG_OUTFIT.hem.slice(0, 2), 'hai điểm trên eo giữ nguyên');
// Cử chỉ theo cảm xúc và dáng chuyển trạng thái: không NaN, đầu/cuối đúng khoá, nét mặt mới có trong thư viện
const cc = require(A + 'cu-chi'), nm = require('../library/expressions/cartoon-soft/bo-sung-cot-truyen/net-mat');
for (const [g, poses] of Object.entries(cc.GESTURES)) {
  assert.equal(poses.length, 3, g);
  poses.forEach((p, i) => { assert.ok(nm.STORY_FACES[`${g}-0${i + 1}`], `thiếu nét mặt ${g}-0${i + 1}`); assert.ok(!JSON.stringify(r.solveRig(p)).includes('NaN'), `${g} mức ${i + 1}`); });
}
for (const tr of cc.TRANSITIONS) {
  for (let t = 0; t <= 1.0001; t += 0.05) { const p = cc.transitionPose(tr.id, t); assert.ok(!JSON.stringify(r.solveRig(p)).includes('NaN'), `${tr.id} t=${t}`); }
  assert.equal(cc.transitionPose(tr.id, 1).tilt, tr.keys[tr.keys.length - 1].pose.tilt, `${tr.id} kết thúc đúng khoá cuối`);
}
assert.equal(nm.STORY_GROUPS.length, 12);

// Cảm xúc 2.5D tham số: 24 nhóm × 3 mức, trộn/chuyển/sống tất định, khoá cũ đổi sang mặt mới, vẽ không NaN, ID không trùng.
const cx = require(A + 'cam-xuc-2-5d');
assert.equal(cx.FAMILY_IDS.length, 24);
const finite = (e) => Object.values(e).every((v) => typeof v !== 'number' || Number.isFinite(v));
for (const f of cx.FAMILY_IDS) for (const lv of [1, 2, 3]) assert.ok(finite(cx.exprOf(f, lv)), `${f}-${lv}`);
assert.deepEqual(cx.exprAmount('vui', 1), cx.exprOf('vui', 3));
assert.deepEqual(cx.shiftExpr(cx.exprOf('vui', 1), cx.exprOf('so-hai', 3), 1), cx.exprOf('so-hai', 3));
assert.deepEqual(cx.liveExpr(cx.exprOf('buon', 2), 50, { amount: 0 }), cx.exprOf('buon', 2));
assert.deepEqual(cx.liveExpr(cx.NEUTRAL, 333, { seed: 4 }), cx.liveExpr(cx.NEUTRAL, 333, { seed: 4 }));
assert.deepEqual(cx.exprFrom('so-hai-03'), cx.exprOf('so-hai', 3));
assert.deepEqual(cx.exprFrom(undefined, 'scared'), cx.exprOf('so-hai', 2));
let blinked = 0; for (let f = 0; f < 900; f++) { const b = cx.blinkAmount(f, 2); assert.ok(b >= 0 && b <= 1); if (b > 0.9) blinked++; }
assert.ok(blinked > 10, 'có chớp mắt trong 30 s');
for (let t = 0; t <= 1; t += 0.05) assert.ok(finite(cx.shiftExpr(cx.exprOf('buon', 3), cx.exprOf('vui', 3), t)));
for (const f of cx.FAMILY_IDS) for (const view of ['three', 'front']) {
  const html = renderToStaticMarkup(React.createElement('svg', null, React.createElement(require(A + 'thiet-ke/thu-2-5d/nam-2-5d').Nam25DHead, { expr: cx.liveExpr(cx.exprOf(f, 3), 37, { seed: 1 }), view, id: `t-${f}-${view}` })));
  assert.ok(!/NaN|Infinity|undefined/.test(html), `${f} ${view}`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, new Set(ids).size, `${f} ${view} trùng id`);
  assert.ok(html.includes('data-face25d'), `${f} dùng mặt mới`);
}
console.log('song-dong ok: thở, chớp, trôi, khẩu hình, chuyển dáng có đà, cảm xúc 2.5D 24×3');
