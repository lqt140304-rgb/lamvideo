import React from 'react';
import { Hero, kf, camT, LOOKS, toWorld, joints, CloudBank, Glow, ShotProps } from '../../engine';
import { OpenHand } from '../../engine/hands';
import { LEG_LEN } from '../../engine/rig';
import { Plant } from '../../engine/sets/school';
import { P, talkAt } from '../mua-100-c01/shots';
import { MapSheet } from '../mua-100-c03/shots';
import { Corridor } from '../mua-100-c06/shots';

// Cảnh 9 — Khi mưa vừa tạnh: Âm thanh cuối cùng. It opens on the radio of cảnh 8 (the upstream numbers), then the gauges and
// the steps at the school gate say the water is still coming. The rain has stopped (dry corridor, thinning cloud), the
// last drop leaves the eave, and Linh asks why they must still go. An crouches to her height; the old map comes back as
// the same insert, no new proof; she remembers his finger on the river; the roof is quiet and the river is not.

const AN = LOOKS.an;
const LINH = LOOKS.linh;
const L = '#16141C';
const FONT = 'Comic Sans MS, Comic Sans, cursive';
const MUD = '#8A6E4A';
const onFloor = (floor: number, scale: number) => floor - LEG_LEN * scale;
const hand = (pose: ReturnType<typeof P>, side: 'armL' | 'armR') => toWorld(pose, joints(pose)[side].end);
/** Emotional close: start wide on the person, end tight on the face. */
const push = (t: number, len: number, x: number, z1 = 2.7) => camT(x, kf(t, [[0, 620], [len, 470]]), kf(t, [[0, 1.35], [len, z1]]));
/** A squat: hips a little above the floor, knees folded. */
const squat = (floor: number, sc: number) => ({ y: floor - 58 * sc, legL: { a: 88, b: -130 }, legR: { a: 76, b: -130 } });

// ================================================================ pieces
/** The morning sky once the rain stops: thin, breaking cloud and a pale light that grows with `clear` (0..1). */
const Sky: React.FC<{ t: number; clear?: number }> = ({ t, clear = 0 }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1600} fill="#9AA8B2" />
    <rect x={-400} y={-400} width={2720} height={1600} fill="#F6F0D8" opacity={0.1 + 0.3 * clear} />
    <CloudBank x={t * 0.2} y={100} h={170} color="#7A8692" lit="#B4BEC6" seed={31} />
    <CloudBank x={t * 0.12 + 300} y={290} h={120} color="#8E9AA4" lit="#C8D0D6" seed={32} />
    <Glow x={1400} y={180} r={900} o={0.2 + 0.45 * clear} />
  </g>
);

/** The school seen from the gate: dry raised yard in front of the building, the road below under muddy water. */
const Outside: React.FC<{ t: number; water?: number; clear?: number }> = ({ t, water = 0.3, clear = 0.4 }) => (
  <g>
    <Sky t={t} clear={clear} />
    <path d="M -400 470 Q 300 380 900 450 Q 1500 410 2320 480 L 2320 700 L -400 700 Z" fill="#5E6E54" />
    <rect x={180} y={330} width={1520} height={280} fill="#E2D6A8" stroke="#6A5E3E" strokeWidth={6} />
    <polygon points="140,340 960,230 1740,340" fill="#9A4A3A" stroke="#5A2A20" strokeWidth={6} />
    {Array.from({ length: 7 }).map((_, i) => <rect key={i} x={240 + i * 210} y={380} width={120} height={100} fill="#E8B060" stroke="#6A5E3E" strokeWidth={5} />)}
    <rect x={-400} y={610} width={2720} height={150} fill="#C8BC94" />
    {[260, 700, 1180, 1560].map((x, i) => <Plant key={i} x={x} y={640} s={0.36} t={t} seed={i + 3} />)}
    <rect x={-400} y={760} width={2720} height={40} fill="#9A9488" />
    {/* below the yard wall: the road and the muddy water, rising with `water` */}
    <rect x={-400} y={800} width={2720} height={500} fill="#7A7468" />
    <path d={`M -400 ${1000 - 280 * water} Q 400 ${990 - 280 * water + 14 * Math.sin(t * 0.08)} 1000 ${1000 - 280 * water} T 2320 ${1000 - 280 * water} L 2320 1300 L -400 1300 Z`} fill={MUD} opacity={0.92} />
    <path d={`M 0 ${1030 - 280 * water} l 140 -10 M 700 ${1060 - 280 * water} l 180 8 M 1500 ${1040 - 280 * water} l 160 -8`} stroke="#B49A70" strokeWidth={6} opacity={0.6} />
  </g>
);

/** The painted gauge post at the head of the alley, in brown water; `level` 0..1. */
const AlleyGauge: React.FC<{ level: number; t: number }> = ({ level, t }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#7E8480" />
    <rect x={-400} y={-400} width={2720} height={620} fill="#9AA6AE" />
    <polygon points="-400,200 700,260 700,880 -400,1100" fill="#B8AA86" />
    <polygon points="1300,260 2320,200 2320,1100 1300,880" fill="#A89A78" />
    <rect x={900} y={120} width={120} height={900} fill="#EDE8DA" stroke={L} strokeWidth={6} />
    {Array.from({ length: 8 }).map((_, i) => (
      <g key={i}>
        <path d={`M 900 ${940 - i * 100} L 960 ${940 - i * 100}`} stroke="#C8322A" strokeWidth={6} />
        <text x={968} y={952 - i * 100} fontFamily={FONT} fontSize={30} fill="#2A2A2A">{(i * 0.15).toFixed(2)}</text>
      </g>
    ))}
    <rect x={-400} y={880 - 560 * level} width={2720} height={700} fill={MUD} opacity={0.94} />
    <path d={`M -400 ${880 - 560 * level} Q 500 ${872 - 560 * level + 6 * Math.sin(t * 0.1)} 1200 ${880 - 560 * level} T 2320 ${880 - 560 * level}`} stroke="#B49A70" strokeWidth={8} fill="none" />
    <Glow x={1000} y={300} r={800} kind="cool" o={0.25} />
  </g>
);

/** The flight of steps down from the school gate to the road, side-on. `level` is the water line (y); the lowest steps are under it. */
const Steps: React.FC<{ level: number; t: number }> = ({ level, t }) => (
  <g>
    <Sky t={t} clear={0.4} />
    <rect x={-400} y={500} width={2720} height={200} fill="#6E7A64" />
    {Array.from({ length: 7 }).map((_, i) => (
      <g key={i}>
        <rect x={260 + i * 170} y={330 + i * 95} width={190} height={900} fill={i % 2 ? '#B8B09C' : '#C4BCA8'} stroke="#7A7260" strokeWidth={5} />
        {/* the wet band on the first dry step */}
        {330 + i * 95 > level - 130 && 330 + i * 95 < level ? <rect x={260 + i * 170} y={330 + i * 95} width={190} height={26} fill="#6E6450" opacity={0.7} /> : null}
      </g>
    ))}
    <rect x={-400} y={290} width={900} height={40} fill="#B8B09C" stroke="#7A7260" strokeWidth={5} />
    <path d="M 300 290 L 300 200 M 700 330 L 700 240" stroke="#4A4A4A" strokeWidth={10} />
    <rect x={-400} y={level} width={2720} height={900} fill={MUD} opacity={0.93} />
    <path d={`M -400 ${level} Q 500 ${level - 8 + 6 * Math.sin(t * 0.09)} 1200 ${level} T 2320 ${level}`} stroke="#B49A70" strokeWidth={8} fill="none" />
  </g>
);

/** The edge of the tin roof from below: grooves, a lip, and one drop that forms, hangs and falls into a puddle. */
const EaveDrop: React.FC<{ t: number; period?: number; last?: number }> = ({ t, period = 44, last = 0 }) => {
  const ph = ((t % period) / period);
  const k = last ? Math.min(1, t / last) : ph;
  const form = Math.min(1, k / 0.55);
  const fall = Math.max(0, (k - 0.55) / 0.45);
  const y = 300 + 30 * form + 520 * fall * fall;
  return (
    <g>
      <Sky t={t} clear={0.2} />
      <rect x={-400} y={-400} width={2720} height={650} fill="#8A949C" stroke={L} strokeWidth={6} />
      {Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M ${-380 + i * 90} -400 L ${-380 + i * 90} 250`} stroke="#6E7880" strokeWidth={10} />)}
      <rect x={-400} y={240} width={2720} height={34} fill="#6A747C" stroke={L} strokeWidth={4} />
      <rect x={-400} y={800} width={2720} height={500} fill="#8E8A7C" />
      <ellipse cx={960} cy={880} rx={170} ry={26} fill="#5E6A72" opacity={0.7} />
      {fall > 0.98 || (last === 0 && ph < 0.1) ? <ellipse cx={960} cy={880} rx={60 + 200 * ((ph * 8) % 1)} ry={10 + 24 * ((ph * 8) % 1)} fill="none" stroke="#C8D4DA" strokeWidth={4} opacity={0.7} /> : null}
      {k < 1 ? <path d={`M 960 ${y - 38 + 18 * fall} q 20 40 0 52 q -20 -12 0 -52 Z`} fill="#C8DCE8" stroke="#6A8EA0" strokeWidth={3} opacity={0.95} /> : null}
    </g>
  );
};

/** Linh's folded shirt, held at her chest between her hands. */
const Shirt: React.FC<{ pose: ReturnType<typeof P> }> = ({ pose }) => {
  const a = hand(pose, 'armL');
  const b = hand(pose, 'armR');
  const x = (a.x + b.x) / 2;
  const y = (a.y + b.y) / 2;
  const s = pose.scale;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-46} y={-34} width={92} height={68} rx={8} fill="#F0E6C8" stroke={L} strokeWidth={4} />
      <path d="M -16 -34 L 0 -14 L 16 -34" fill="none" stroke="#C8B888" strokeWidth={4} />
      <rect x={-46} y={6} width={92} height={5} fill="#D8C8A0" />
    </g>
  );
};

/** Linh with the folded shirt still between her hands. */
const LinhH: React.FC<{ pose: ReturnType<typeof P> }> = ({ pose }) => (
  <g>
    <Hero look={LINH} pose={pose} rimId="filmR" shadow={0} />
    <Shirt pose={pose} />
  </g>
);

// ================================================================ the shots

// ---------- S1: macro: the radio on An's belt, still hand in hand; the number crackles out ----------
export const S1: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.15], [len, 1.3]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill={AN.jacket} />
    <rect x={-200} y={760} width={2320} height={600} fill={AN.limb} />
    <rect x={-200} y={740} width={2320} height={40} fill="#3A2A1A" />
    <rect x={1140} y={420} width={150} height={300} rx={20} fill="#22202A" stroke={L} strokeWidth={6} />
    <rect x={1250} y={300} width={22} height={140} rx={8} fill="#22202A" />
    <rect x={1165} y={450} width={100} height={60} rx={6} fill="#1E3A2E" />
    <path d="M 1180 470 l 18 0 M 1180 490 l 40 0" stroke="#7EE0A0" strokeWidth={5} opacity={0.5 + 0.4 * Math.sin(t * 0.5)} />
    <circle cx={1215} cy={560} r={14} fill={Math.sin(t * 0.8) > 0 ? '#3EE07E' : '#1E6E3E'} />
    {[0, 1, 2].map((i) => {
      const ph = (t * 0.05 + i / 3) % 1;
      return <path key={i} d={`M ${1310 + ph * 100} ${520 - ph * 30} q 30 60 0 120`} stroke="#F4E8C0" strokeWidth={6} fill="none" opacity={1 - ph} />;
    })}
    <OpenHand x={700} y={1300} rot={190} s={1.4} skin={LINH.skin} />
    <OpenHand x={600} y={500} rot={10} s={1.6} skin={AN.skin} />
  </g>
);

// ---------- S2: the upstream station's board: the level is still climbing ----------
export const S2: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(1000, 520, kf(t, [[0, 1.0], [len, 1.12]]))}>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#C8BC94" />
    <rect x={560} y={140} width={800} height={820} rx={10} fill="#F4F4EE" stroke="#6A6A6A" strokeWidth={12} />
    <text x={960} y={230} fontFamily={FONT} fontSize={50} textAnchor="middle" fill="#2E5E9A">TRẠM THƯỢNG NGUỒN</text>
    {Array.from({ length: 9 }).map((_, i) => (
      <g key={i}>
        <path d={`M 640 ${860 - i * 70} L 700 ${860 - i * 70}`} stroke="#2A2A2A" strokeWidth={4} />
        <text x={720} y={872 - i * 70} fontFamily={FONT} fontSize={30} fill="#2A2A2A">{(i * 0.5).toFixed(1)} m</text>
      </g>
    ))}
    <rect x={900} y={860 - 300 * kf(t, [[0, 0.62], [len, 0.74]])} width={360} height={300 * kf(t, [[0, 0.62], [len, 0.74]])} fill="#6EA0C8" opacity={0.6} />
    <path d={`M 880 ${860 - 300 * kf(t, [[0, 0.62], [len, 0.74]])} L 1280 ${860 - 300 * kf(t, [[0, 0.62], [len, 0.74]])}`} stroke="#C8322A" strokeWidth={8} />
    <Glow x={960} y={300} r={800} o={0.3} />
  </g>
);

// ---------- S3: the post at the head of the alley: the line creeps up a mark ----------
export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, kf(t, [[0, 640], [len, 560]]), kf(t, [[0, 1.0], [len, 1.15]]))}>
    <AlleyGauge level={kf(t, [[0, 0.5], [len, 0.62]])} t={t} />
  </g>
);

// ---------- S4: the steps down to the road: the lowest are under, the next is going dark with wet ----------
export const S4: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 760], [len, 960]]), 640, 1.2)}>
    <Steps level={kf(t, [[0, 770], [len, 748]])} t={t} />
  </g>
);

// ---------- S5: from the gate: the yard is dry, but the water has taken the road at its foot ----------
export const S5: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 1000]]), 640, kf(t, [[0, 1.0], [len, 1.1]]))}>
    <Outside t={t} water={kf(t, [[0, 0.38], [len, 0.5]])} clear={0.3} />
  </g>
);

// ---------- S6: the last drop leaves the edge of the tin roof ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.15]]))}>
    <EaveDrop t={t} last={len * 0.8} />
  </g>
);

// ---------- S7: the cloud thinning, the light creeping up; only a slow drip off the eave (the held pause) ----------
export const S7: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 1000], [len, 900]]), 600, kf(t, [[0, 1.0], [len, 1.12]]))}>
    <Outside t={t} water={0.5} clear={kf(t, [[0, 0.3], [len, 0.75]])} />
  </g>
);

// ---------- S8: Linh in the corridor, the folded shirt in her hands, looks up at her father ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => {
  const pose = P({ x: 960, y: 720, scale: 1.15, yaw: 0.2, look: kf(t, [[0, -0.2], [len, 0.6]]), headTilt: kf(t, [[0, -4], [len, -12]]), expr: 'sad', armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } }, t, 4);
  return (
    <g transform={camT(960, kf(t, [[0, 700], [len, 600]]), kf(t, [[0, 1.3], [len, 1.9]]))}>
      <Corridor t={t} id="c9s8" dry />
      <Hero look={LINH} pose={pose} rimId="filmR" shadow={0} />
      <Shirt pose={pose} />
    </g>
  );
};

// ---------- S9: close: "But it's stopped. Why must we go somewhere else?" ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={push(t, len, 960, 2.9)}>
    <Corridor t={t} id="c9s9" dry />
    <LinhH pose={P({ x: 960, y: 700, scale: 1.2, yaw: 0.25, look: 0.5, headTilt: -10, expr: 'sad', talk: talkAt(t, 2, len - 2), armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } }, t, 4)} />
  </g>
);

// ---------- S10: An crouches to her height, the corridor behind ----------
export const S10: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[0, 0], [30, 1]]);
  const floor = 990;
  const sq = squat(floor, 1.0);
  return (
    <g transform={camT(850, 640, kf(t, [[0, 1.35], [len, 1.55]]))}>
      <Corridor t={t} id="c9s10" dry />
      <Hero look={AN} pose={P({ x: 700, y: kf(t, [[0, onFloor(floor, 1.0)], [30, sq.y]]), scale: 1.0, yaw: 0.6, look: 0.6, headTilt: 8, tilt: 10 * k, expr: 'neutral', legL: { a: 5 + 83 * k, b: -130 * k }, legR: { a: -5 + 81 * k, b: -130 * k }, armL: { a: 30, b: 50 }, armR: { a: 10, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P({ x: 930, y: onFloor(floor, 0.78), scale: 0.78, yaw: -0.5, look: -0.5, headTilt: -8, expr: 'sad', armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S11: close: An, at her height, begins: the water on the mountain is still coming ----------
export const S11: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={push(t, len, 960, 2.6)}>
    <Corridor t={t} id="c9s11" dry />
    <Hero look={AN} pose={P({ x: 960, y: 700, scale: 1.1, yaw: -0.25, look: -0.4, headTilt: 8, expr: 'neutral', talk: talkAt(t, 2, len - 2), armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S12: the old map again, the same insert: mountains at the top, the river down to the town ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.1]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#7A5A3A" />
    {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M ${-200 + i * 240} -200 L ${-200 + i * 240} 1300`} stroke="#5E4128" strokeWidth={6} />)}
    <Glow x={960} y={300} r={900} o={0.4} />
    <g transform="translate(700 50) scale(1.5)">
      <rect x={6} y={8} width={320} height={600} rx={6} fill="#000" opacity={0.25} />
      <MapSheet flow={t} />
    </g>
  </g>
);

// ---------- S13: wider: An, crouched, points through the open side at the yard and the low road ----------
export const S13: React.FC<ShotProps> = ({ t, len }) => {
  const floor = 990;
  const sq = squat(floor, 1.0);
  return (
    <g transform={camT(kf(t, [[0, 860], [len, 780]]), 650, 1.4)}>
      <Corridor t={t} id="c9s13" dry />
      <Hero look={AN} pose={P({ x: 700, y: sq.y, scale: 1.0, yaw: 0.6, look: 0.7, headTilt: 6, tilt: 10, expr: 'neutral', talk: talkAt(t, 2, len - 2) * 0.7, legL: sq.legL, legR: sq.legR, armL: { a: 30, b: 50 }, armR: { a: kf(t, [[0, 40], [20, 100]]), b: kf(t, [[0, 40], [20, 10]]) } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P({ x: 930, y: onFloor(floor, 0.78), scale: 0.78, yaw: 0.5, look: 0.6, headTilt: -6, expr: 'worried', armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S14: close: An: "if we go while the road still works it is safer" ----------
export const S14: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={push(t, len, 960, 2.7)}>
    <Corridor t={t} id="c9s14" dry />
    <Hero look={AN} pose={P({ x: 960, y: 700, scale: 1.1, yaw: 0.3, look: 0.4, headTilt: 6, expr: 'worried', talk: talkAt(t, 2, len - 2), armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S15: close: Linh: "Will you come with me?" ----------
export const S15: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={push(t, len, 960, 3.0)}>
    <Corridor t={t} id="c9s15" dry />
    <Hero look={LINH} pose={P({ x: 960, y: 700, scale: 1.2, yaw: -0.2, look: -0.4, headTilt: -8, expr: 'worried', talk: talkAt(t, 2, len - 2), armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S16: medium: An, crouched, lays out the plan: Mẹ first, then the water machine, then you two ----------
export const S16: React.FC<ShotProps> = ({ t, len }) => {
  const floor = 990;
  const sq = squat(floor, 1.0);
  return (
    <g transform={camT(kf(t, [[0, 760], [len, 840]]), 640, 1.55)}>
      <Corridor t={t} id="c9s16" dry />
      <Hero look={AN} pose={P({ x: 700, y: sq.y, scale: 1.0, yaw: 0.6, look: 0.6, headTilt: 8, tilt: 10, expr: 'neutral', talk: talkAt(t, 2, len - 2), legL: sq.legL, legR: sq.legR, armL: { a: 30 + 20 * Math.sin(t * 0.12), b: 50 }, armR: { a: 10, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P({ x: 930, y: onFloor(floor, 0.78), scale: 0.78, yaw: -0.5, look: -0.5, headTilt: -6, expr: 'sad', armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S17: over Linh's shoulder: her father, close, the end of the plan: "I will come to you two" ----------
export const S17: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={push(t, len, 960, 2.5)}>
    <Corridor t={t} id="c9s17" dry />
    <Hero look={AN} pose={P({ x: 940, y: 700, scale: 1.1, yaw: -0.3, look: -0.4, headTilt: 8, expr: 'smile', talk: talkAt(t, 2, len - 2), armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
    <g transform="translate(1520 840)">
      <Hero look={LINH} pose={P({ x: 0, y: 0, scale: 1.3, yaw: 0.55, look: 0.5, headTilt: -8, expr: 'sad', armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
    <rect x={1150} y={0} width={900} height={1500} fill="#1E1C24" opacity={0.28} />
  </g>
);

// ---------- S18: close on the hands: she squeezes his hand ----------
export const S18: React.FC<ShotProps> = ({ t, len }) => {
  const sq = kf(t, [[0, 0], [10, 1], [len, 1.03]]);
  return (
    <g transform={camT(960, 640, kf(t, [[0, 1.0], [len, 1.15]]))}>
      <rect x={-200} y={-200} width={2320} height={1500} fill="#B8AC88" />
      <rect x={-200} y={900} width={2320} height={600} fill="#9A8E6E" />
      <Glow x={960} y={300} r={900} o={0.35} />
      <OpenHand x={900} y={140} rot={6} s={2.1} skin={AN.skin} />
      <g transform={`translate(0 ${-60 * sq})`}>
        <OpenHand x={1010} y={1350} rot={186} s={1.7} skin={LINH.skin} />
      </g>
    </g>
  );
};

// ---------- S19: close: Linh: "Tell Mẹ if you have to change places" ----------
export const S19: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={push(t, len, 960, 3.0)}>
    <Corridor t={t} id="c9s19" dry />
    <LinhH pose={P({ x: 960, y: 700, scale: 1.2, yaw: 0.3, look: 0.4, headTilt: -10, expr: 'worried', talk: talkAt(t, 2, len - 2), armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } }, t, 4)} />
  </g>
);

// ---------- S20: close: An, a hand to the radio on his belt: he will have it with him ----------
export const S20: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={push(t, len, 960, 2.5)}>
    <Corridor t={t} id="c9s20" dry />
    <Hero look={AN} pose={P({ x: 960, y: 700, scale: 1.1, yaw: -0.25, look: -0.3, headTilt: 8, expr: 'smile', talk: talkAt(t, 2, len - 2), armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S21: the map insert again: his finger down the river, as on day seven ----------
export const S21: React.FC<ShotProps> = ({ t, len }) => {
  const tr = kf(t, [[0, 0], [len * 0.85, 1]]);
  const pts: [number, number][] = [[130, 40], [110, 130], [100, 240], [190, 330], [190, 400], [150, 480], [170, 540]];
  const f = tr * (pts.length - 1);
  const i = Math.min(pts.length - 2, Math.floor(f));
  const px = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * (f - i);
  const py = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * (f - i);
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.12]]))}>
      <rect x={-200} y={-200} width={2320} height={1500} fill="#7A5A3A" />
      {Array.from({ length: 10 }).map((_, i2) => <path key={i2} d={`M ${-200 + i2 * 240} -200 L ${-200 + i2 * 240} 1300`} stroke="#5E4128" strokeWidth={6} />)}
      <Glow x={960} y={300} r={900} o={0.4} />
      <g transform="translate(700 50) scale(1.5)">
        <rect x={6} y={8} width={320} height={600} rx={6} fill="#000" opacity={0.25} />
        <MapSheet flow={t} trace={tr} />
        <OpenHand x={px + 18} y={py + 70} rot={160} s={1.0} skin={AN.skin} />
      </g>
    </g>
  );
};

// ---------- S22: Linh stands at the corridor edge, listening to a roof that has gone quiet ----------
export const S22: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 1000], [len, 960]]), kf(t, [[0, 660], [len, 560]]), kf(t, [[0, 1.5], [len, 2.3]]))}>
    <Corridor t={t} id="c9s22" dry />
    <LinhH pose={P({ x: 960, y: 720, scale: 1.15, yaw: 0.55, look: kf(t, [[0, 0.3], [len, 0.8]]), headTilt: kf(t, [[0, -6], [len, -16]]), expr: 'sad', armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } }, t, 4)} />
  </g>
);

// ---------- S23: wide from the gate: no rain, a dry yard, and the river at the foot, still taking the road ----------
export const S23: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 1000], [len, 960]]), 640, kf(t, [[0, 1.15], [len, 0.95]]))}>
    <Outside t={t} water={kf(t, [[0, 0.5], [len, 0.58]])} clear={0.8} />
  </g>
);

// ---------- S24: the steps one last time: the water has climbed onto the next one ----------
export const S24: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 960], [len, 1000]]), 660, kf(t, [[0, 1.2], [len, 1.05]]))}>
    <Steps level={kf(t, [[0, 750], [len, 700]])} t={t} />
  </g>
);

export const SHOTS = { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24 };
