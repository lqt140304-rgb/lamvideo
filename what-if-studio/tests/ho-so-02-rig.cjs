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

// Hai nhân vật trong cùng SVG không được dùng chung mã clip mắt.
const twoBodies = renderToStaticMarkup(React.createElement('svg', null, React.createElement(r.StudentTwinBody, { mood: 'shocked' }), React.createElement(r.StudentTwinBody, { mood: 'calm' }), React.createElement(r.TungSoccer)));
const ids = twoBodies.match(/id="[^"]+"/g);
assert.equal(ids.length, 3, 'one eye clip per head');
assert.equal(new Set(ids).size, 3, 'eye clip ids are unique');

// Mọi biểu cảm kịch bản dùng đều vẽ được.
for (const mood of ['annoyed', 'hesitant', 'scared', 'agitated']) {
  const html = renderToStaticMarkup(React.createElement('svg', null, React.createElement(r.StudentTwinHead, { mood })));
  assert.ok(html.length > 500 && !html.includes('NaN'), mood);
}

// Góc nhìn: xương giữ nguyên độ dài; nghiêng thì khuỷu luôn gập ra trước, kể cả pose viết cho 3/4.
for (const view of ['three', 'front', 'side', 'quarter', 'back']) {
  const s = r.solveRig({ ...r.STAND_POSE, view });
  near(len(s.armR.root, s.armR.mid), r.BONE.upperArm, view + ' upper arm');
  assert.ok(Math.abs(len(s.legL.mid, s.legL.end) - r.BONE.shin) < 1, view + ' shin');
  for (const facing of [1, -1]) for (const mood of ['sleepy', 'scared']) {
    const html = renderToStaticMarkup(React.createElement('svg', null, React.createElement(r.StudentTwinBody, { mood, pose: { ...r.STAND_POSE, view, facing } })));
    assert.ok(!html.includes('NaN'), view + ' NaN');
  }
}
const bent = r.solveRig({ ...r.STAND_POSE, view: 'side', armL: { a: 0, b: 60, rot: -1 } }).armL;
assert.ok(bent.end.x > bent.mid.x, 'side elbow bends forward');
const frontL = r.solveRig({ ...r.STAND_POSE, view: 'front', armL: { a: 0, b: 60 } }).armL;
assert.ok(frontL.end.x < frontL.mid.x, 'front elbow bends toward the body');

// Nhìn từ trước: bước chân không xoè ngang, đùi ngắn đi theo góc.
const walk = r.solveRig({ ...r.STAND_POSE, view: 'front', legR: { a: 40, b: 0 } }).legR;
assert.ok(Math.abs(walk.mid.x - walk.root.x) < 15, 'front stride stays narrow');
assert.ok(len(walk.root, walk.mid) < r.BONE.thigh * 0.9, 'front stride foreshortens');

// Nốt ruồi: quay trái 3/4 chuyển sang đuôi mày bên xa, nghiêng trái và sau lưng không thấy.
const mole = (props) => (renderToStaticMarkup(React.createElement('svg', null, React.createElement(r.StudentTwinHead, props))).match(/r="2.2"/g) || []).length;
assert.equal(mole({ view: 'three', facing: -1 }), 1);
assert.equal(mole({ view: 'side', facing: 1 }), 1);
assert.equal(mole({ view: 'side', facing: -1 }), 0);
assert.equal(mole({ view: 'back' }), 0);
assert.equal(mole({ view: 'quarter', facing: 1 }), 1);
assert.equal(mole({ view: 'quarter', facing: -1 }), 0);

// R/L theo giải phẫu: nhìn từ sau tay phải ở bên phải màn hình; quay trái thì đổi vế.
assert.ok(r.solveRig({ ...r.STAND_POSE, view: 'front' }).armR.root.x < 0);
assert.ok(r.solveRig({ ...r.STAND_POSE, view: 'back' }).armR.root.x > 0);
const swapped = r.mirrorPose({ ...r.STAND_POSE, armR: { a: 10, b: 1 }, armL: { a: 20, b: 2, rot: -1 } });
assert.equal(swapped.armR.a, 20);
assert.equal(swapped.armR.rot, undefined);
assert.equal(swapped.armL.a, 10);
assert.equal(swapped.armL.rot, -1);

// Xoay theo vòng góc, đi đường ngắn nhất.
assert.equal(r.turnAt({ view: 'front' }, { view: 'side' }, 0.5).view, 'three');
assert.equal(r.turnAt({ view: 'front' }, { view: 'side' }, 1).view, 'side');
assert.deepEqual(r.turnAt({ view: 'three', facing: 1 }, { view: 'three', facing: -1 }, 0.5), { view: 'front', facing: 1 });
assert.equal(r.turnAt({ view: 'side' }, { view: 'back' }, 0.5).view, 'quarter');

// Tùng đủ góc, mọi góc nói và chớp mắt được.
for (const view of ['three', 'front', 'side', 'quarter', 'back']) for (const facing of [1, -1]) for (const talk of [undefined, { shape: 'a', open: 0.7 }, { shape: 'closed' }]) {
  for (const C of [r.StudentTwinBody, r.TungSoccer]) {
    const html = renderToStaticMarkup(React.createElement('svg', null, React.createElement(C, { pose: { ...r.STAND_POSE, view, facing }, talk, blink: true })));
    assert.ok(!html.includes('NaN') && !html.includes('undefined'), view + ' render');
  }
}

// Dáng chuyển từ rig cũ: đủ góc, không lỗi số; đạo cụ chỉ hiện khi khai báo và đi theo bàn tay.
for (const n of ['wary', 'phone', 'offer', 'type', 'holdBowl']) for (const view of ['three', 'front', 'side', 'quarter', 'back']) for (const facing of [1, -1]) {
  const html = renderToStaticMarkup(React.createElement('svg', null, React.createElement(r.StudentTwinBody, { pose: { ...r.TWIN_POSES[n], view, facing } })));
  assert.ok(!html.includes('NaN') && !html.includes('undefined'), n + ' ' + view);
}
const body = (pose) => renderToStaticMarkup(React.createElement('svg', null, React.createElement(r.StudentTwinBody, { pose })));
const PHONE = '#7f8f94';
assert.ok(body(r.TWIN_POSES.phone).includes(PHONE));
assert.ok(!body(r.STAND_POSE).includes(PHONE));
const phoneAt = (html) => html.match(/<g transform="(translate[^"]+)"[^>]*><rect[^>]*#7f8f94/)[1];
assert.notEqual(phoneAt(body(r.TWIN_POSES.phone)), phoneAt(body({ ...r.TWIN_POSES.phone, armR: { ...r.TWIN_POSES.phone.armR, a: -20 } })));

// Vòng bước khép kín, khớp không vượt giới hạn.
assert.deepEqual(r.sampleWalk(0), r.sampleWalk(1));
for (let i = 0; i < 40; i++) {
  const s = r.solveRig(r.sampleWalk(i / 40));
  assert.ok(Number.isFinite(s.legR.end.x + s.legL.end.y + s.armR.end.x + s.armL.end.y), 'walk ' + i);
}

console.log('ho-so-02 rig ok');
