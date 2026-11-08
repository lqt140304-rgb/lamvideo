// node tests/episode-staging.cjs — geometry checks for the 35-cue storyboard/animatic of "Tin nhắn chưa gửi".
// They catch floating feet, seat-less sits, Lộc standing too tall at the counter and broken timing; they do not
// replace watching the animatic.
require('./meadow-poses.cjs'); // registers the TypeScript loader (via shared-assets) and keeps the meadow checks green
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const tl = require('../src/episodes/tin-nhan-chua-gui/timeline.json');
const shots = require('../src/episodes/tin-nhan-chua-gui/shots');
const st = require('../src/episodes/tin-nhan-chua-gui/staging');
const { joints } = require('../src/engine/rig');
let count = 0;
const check = (ok, msg) => { count++; assert.ok(ok, msg); };

// Timeline (script v13): every source cue present once as a shot, contiguous, 24 s silent opening, 88 s of written pauses.
check(tl.shots.length === 40, '40 cue shots');
check(tl.shots.findIndex((s) => s.id === 'ShC8_E') === tl.shots.findIndex((s) => s.id === 'ShC8_B') + 1, 'C8-E sits between C8-B and C8-C');
check(tl.shots.every((s) => typeof shots[s.id] === 'function'), 'Every cue has a shot component');
for (let i = 1; i < tl.segments.length; i++) check(tl.segments[i - 1].b === tl.segments[i].a, 'Contiguous segments');
check(tl.segments.filter((s) => s.shot.startsWith('ShC0_')).reduce((n, s) => n + s.b - s.a, 0) === 24 * 30, 'Opening is exactly 24 s');
check(Math.round(tl.marks.filter((m) => m.kind === 'pause').reduce((n, m) => n + m.len, 0) / 30) === 88, '88 s of written pauses');
check(!tl.marks.some((m) => (m.s === 6 || m.s === 7 || m.s === 9) && /^(?!“)/.test(m.text) && m.kind === 'line'), 'No narrator in C6, C7 or C9');
check(!tl.fx.some((f) => f.kind === 'flash'), 'No extra flash anywhere (one whiteout lives inside C5-D)');

// Every segment renders finite geometry at its start, middle and end.
for (const seg of tl.segments) for (const k of [0, 0.5, 0.999]) {
  const t = Math.round(seg.t0 + (seg.t1 - seg.t0) * k);
  const svg = renderToStaticMarkup(React.createElement('svg', null, React.createElement(shots[seg.shot], { t, len: seg.t1, f: seg.a })));
  check(!/NaN|Infinity|undefined/.test(svg), `${seg.shot} @${t}: finite geometry, no undefined attributes`);
}

// Seated children: Duy's soles on the floor; Thảo on the same-height stool with soles on its footrest (or floor).
const sole = (p) => { const j = joints(p); return p.y + (Math.max(j.legL.end.y, j.legR.end.y) + 16) * p.scale; };
for (const t of [0, 300, 900, 1800]) for (const o of [{}, { touch: 1 }, { sleeve: 1 }, { holdHands: 1 }, { duyLean: 16, duyHeadTilt: 8 }]) {
  const k = st.seatedKids(t, o);
  const [ds, ts] = k.stools;
  check(Math.abs(sole(k.duy) - ds.y) < 3, 'Duy soles land on the floor');
  check(ds.footY === undefined, 'Duy needs no footrest');
  check(Math.abs(ds.s - ts.s) < 1e-9, 'Both stools share one seat height');
  const footTarget = ts.footY ?? ts.y;
  check(Math.abs(sole(k.thao) - footTarget) < 3, 'Thảo soles land on the footrest bar or floor');
  check(Math.abs(k.duy.y + 6 * k.duy.scale - (ds.y - 96 * ds.s)) < 0.5, 'Duy hips sit on his stool seat');
  check(Math.abs(k.thao.y + 6 * k.thao.scale - (ts.y - 96 * ts.s)) < 0.5, 'Thảo hips sit on her stool seat');
  check(k.duy.x < k.thao.x, 'Duy left, Thảo right');
}

// Lộc at the counter: hips just above the counter top, soles hidden behind the counter body (not floating above it).
for (const x of [900, 1000]) {
  const p = st.LOC_AT_COUNTER(x, 0);
  check(p.y < st.COUNTER_TOP && p.y > st.COUNTER_TOP - 30, 'Counter top meets Lộc at the belt line');
  const s = sole(p);
  check(s > st.COUNTER_TOP + 60 && s < 855, 'Lộc feet stand on the floor hidden behind the counter');
}

// Standing children in C1 stand on the customer floor, Duy left of Thảo.
const sk = st.standingKids(0, {});
check(sk.duy.pose.x < sk.thao.pose.x, 'Standing: Duy left, Thảo right');
for (const p of [sk.duy.pose, sk.thao.pose]) check(Math.abs(sole(p) - (p === sk.duy.pose ? st.SHOP_FLOOR - 15 : st.SHOP_FLOOR + 5)) < 18, 'Standing soles on the floor');

console.log('Episode staging checks passed:', count);
