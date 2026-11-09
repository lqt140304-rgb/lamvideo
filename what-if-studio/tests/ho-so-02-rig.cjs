// node tests/ho-so-02-rig.cjs — kiểm tra khớp của rig Hồ sơ 2: xương không đổi độ dài, khớp không gập ngược, chân chạm sàn.
// Không thay được việc xem chuyển động (composition HoSo02RigSheet).
require('./shared-assets.cjs'); // đăng ký loader TypeScript
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const r = require('../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat');

const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-6, `${msg}: ${a} vs ${b}`);
const len = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const cross = (c) => (c.mid.x - c.root.x) * (c.end.y - c.mid.y) - (c.mid.y - c.root.y) * (c.end.x - c.mid.x);

for (const [name, pose] of [...Object.entries(r.TWIN_POSES), ['tung', r.TUNG_POSE]]) {
  const s = r.solveRig(pose);
  for (const arm of [s.armR, s.armL]) { near(len(arm.root, arm.mid), r.BONE.upperArm, `${name} upper arm`); near(len(arm.mid, arm.end), r.BONE.foreArm, `${name} forearm`); }
  for (const leg of [s.legR, s.legL]) { near(len(leg.root, leg.mid), r.BONE.thigh, `${name} thigh`); near(len(leg.mid, leg.end), r.BONE.shin, `${name} shin`); }
  near(Math.max(s.legR.end.y, s.legL.end.y) + s.dy, 555, `${name} planted foot`);
  const html = renderToStaticMarkup(React.createElement('svg', null, React.createElement(r.StudentTwinBody, { pose })));
  assert.ok(!html.includes('NaN'), `${name} has NaN`);
}

// Góc vượt giới hạn bị chặn: khuỷu/gối không gập ngược, không gập quá 150°.
const bad = r.solveRig({ ...r.STAND_POSE, armR: { a: 0, b: -80 }, legR: { a: 10, b: -60 }, legL: { a: 10, b: 400 } });
near(bad.armR.deg, 3, 'elbow cannot hyperextend');
near(bad.legR.deg, -10, 'knee cannot hyperextend');
near(bad.legL.deg, -10 + 150, 'knee stops at limit');

// Gối chỉ gập một chiều với mọi độ gập hợp lệ.
for (let b = 10; b <= 150; b += 20) assert.ok(cross(r.solveRig({ ...r.STAND_POSE, legR: { a: 30, b } }).legR) > 0, `knee direction at ${b}`);

// Bàn chân đứng phẳng khi ống chân gần thẳng, bị kéo theo khi ống chân ngả quá giới hạn cổ chân.
assert.equal(r.solveRig(r.STAND_POSE).footR, 0);
near(r.solveRig({ ...r.STAND_POSE, legR: { a: 0, b: 90 } }).footR, 55, 'ankle limit lifts the heel');

console.log('ho-so-02 rig ok');
