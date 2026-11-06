import React from 'react';
import {
  Hero, kf, rnd, camT, LOOKS, joints, toWorld, stand, LivingRoom, LIVING, RoofRow, Dog, Rain, Splashes, CloudBank, Foreground, Glow, LightVeil, ShotProps,
} from '../../engine';
import { Bookcase, ShoeRack, Plant, NoticeBoard } from '../../engine/sets/school';
import { OpenHand } from '../../engine/hands';
import { LEG_LEN } from '../../engine/rig';
import { P, talkAt, Back } from '../mua-100-c01/shots';
import { Flood, Duffel, Bundle, sit, ChairFor } from '../mua-100-c03/shots';
import { Tense, Vignette, LensRain, NearEdge, Van, School, SH, Shelter } from '../mua-100-c05/shots';

// Cảnh 6 — Ngày 40: Nước khắp nơi, thiếu nước sạch. Weeks at the school on its high ground (+2,0 m, dry yard). Down in
// the low town the water has been over the chair seats in An's row (about 0,45 m inside). The water station is drowned;
// drinking water comes from the treated tanks of the temporary unit, supplies arrive in batches. A light, warm scene with
// one laugh (the dog and the bowl), then back to the questions that must be answered every day.

const AN = LOOKS.an;
const HANH = LOOKS.hanh;
const LINH = LOOKS.linh;
const SAU = LOOKS.baSau;
const NAM = LOOKS.nam;
export const HELPER = { ...LOOKS.worker, skin: '#D9A880', skinShade: '#C08E66', hand: '#D9A880' };
const L = '#16141C';
const onFloor = (floor: number, scale: number) => floor - LEG_LEN * scale;
const hand = (pose: ReturnType<typeof P>, side: 'armL' | 'armR') => toWorld(pose, joints(pose)[side].end);
const FONT = 'Comic Sans MS, Comic Sans, cursive';

// ================================================================ the shelter, with the family's window on the left wall
/** The classroom shelter, plus the window on the left wall by the family's mat. */
export const Room: React.FC<{ t: number; id: string }> = ({ t, id }) => {
  const q = SH.Q([[0, 0.24, 0.32], [0, 0.24, 0.62], [0, 0.62, 0.62], [0, 0.62, 0.32]]);
  const a = SH.P(0, 0.24, 0.32);
  const b = SH.P(0, 0.62, 0.62);
  return (
    <g>
      <Shelter t={t} id={id} />
      <polygon points={q} fill="#8E9AA4" stroke="#5A4A30" strokeWidth={10} />
      <Rain t={t} n={24} o={0.55} x0={a.x} y0={a.y} w={b.x - a.x} h={b.y - a.y} seed={61} />
      <Glow x={(a.x + b.x) / 2} y={(a.y + b.y) / 2} r={360} kind="cool" o={0.35} />
    </g>
  );
};
/** Someone sitting on the floor mat at (u, w), the shelter's room. */
export const onMat = (u: number, w: number, k = 1) => {
  const s = stand(SH, u, w);
  const sc = s.scale * k;
  return { x: s.x, y: SH.P(u, 1, w).y - 88 * sc, scale: sc };
};

/** The corridor outside the classrooms: columns on the rain side, doors on the wall side, the pet pen at the far end. */
export const Corridor: React.FC<{ t: number; id: string; children?: React.ReactNode }> = ({ t, id, children }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#7E8A94" />
    <CloudBank x={t * 0.3} y={60} h={140} color="#5A6470" lit="#727C88" seed={64} />
    <rect x={-400} y={140} width={2720} height={70} fill="#9A4A3A" />
    <rect x={-400} y={210} width={2720} height={20} fill="#6A2A20" />
    {/* the wall with classroom doors, at left, receding */}
    <polygon points="-400,230 900,330 900,760 -400,1100" fill="#E2D6A8" />
    {[[-200, 300, 150], [300, 380, 120]].map(([x, y0, w], i) => <rect key={i} x={x} y={y0} width={w} height={1100 - (x + w / 2 + 400) * 0.2615 - y0} fill="#8A6440" stroke="#5A3E26" strokeWidth={6} />)}
    {/* the floor */}
    <polygon points="-400,1100 900,760 1400,760 2320,1100 2320,1500 -400,1500" fill="#B8AC88" />
    {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M ${-400 + i * 340} 1500 L ${880 + i * 60} 760`} stroke="#9A8E6E" strokeWidth={3} />)}
    {/* columns on the rain side, the yard beyond in the rain */}
    <rect x={900} y={330} width={1420} height={430} fill="#8E9AA4" />
    <Rain t={t} n={60} o={0.55} x0={900} y0={300} w={1420} h={460} seed={65} />
    {[1000, 1250, 1600, 2100].map((x, i) => <rect key={i} x={x} y={230 - i * 20} width={40 + i * 18} height={530 + i * 60} fill="#D8CC9E" stroke="#8A7E5E" strokeWidth={4} />)}
    {/* the pet pen: a low wooden fence and a mat, at the far end */}
    <rect x={1080} y={690} width={300} height={70} fill="#8A6440" opacity={0.5} />
    {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={1080 + i * 40} y={660} width={12} height={100} fill="#6E4C30" />)}
    <rect x={1080} y={680} width={300} height={10} fill="#6E4C30" />
    <NoticeBoard x={640} y={520} s={0.6} />
    <ShoeRack x={600} y={838} s={0.55} />
    <ShoeRack x={60} y={970} s={0.8} seed={5} />
    {[[1060, 770, 0.42], [1330, 810, 0.5], [1700, 850, 0.6]].map(([x, y, s], i) => <Plant key={i} x={x} y={y} s={s} t={t} seed={i + 4} tall={i === 2} />)}
    {children}
    <Glow x={600} y={300} r={700} o={0.3} />
  </g>
);

/** The temporary water point in the yard: three blue tanks on a stand, taps, the labels: treated (green) and not yet (red). */
const Tanks: React.FC<{ t: number; label?: number; level?: number }> = ({ t, label = 1, level = 0.6 }) => (
  <g>
    <rect x={560} y={760} width={860} height={40} fill="#6E6A60" stroke={L} strokeWidth={5} />
    {[700, 990, 1280].map((x, i) => (
      <g key={i}>
        <rect x={x - 120} y={380} width={240} height={380} rx={40} fill="#3F6E9A" stroke={L} strokeWidth={6} />
        <rect x={x - 120} y={380} width={240} height={40} rx={20} fill="#2E5E8A" />
        {i === 1 ? <rect x={x + 70} y={430} width={26} height={300} rx={10} fill="#DDE8EC" stroke={L} strokeWidth={3} /> : null}
        {i === 1 ? <rect x={x + 74} y={430 + 300 * (1 - level)} width={18} height={300 * level} rx={6} fill="#6EA0C8" /> : null}
        <path d={`M ${x - 40} 720 L ${x - 40} 790 L ${x - 10} 790`} stroke="#8A8A8A" strokeWidth={12} fill="none" />
        <rect x={x - 90} y={520} width={150} height={70} rx={8} fill={i === 2 ? '#C8322A' : '#3E8E5E'} stroke={L} strokeWidth={4} opacity={i === 0 && label < 1 ? label : 1} />
        <text x={x - 15} y={565} fontFamily={FONT} fontSize={22} textAnchor="middle" fill="#fff">{i === 2 ? 'CHƯA XỬ LÝ' : 'ĐÃ XỬ LÝ'}</text>
      </g>
    ))}
  </g>
);

/** A yellow jerrycan; `mark` draws the chalk tick. */
const Jerry: React.FC<{ x: number; y: number; s?: number; mark?: number; c?: string }> = ({ x, y, s = 1, mark = 0, c = '#E8B03C' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={70} ry={10} fill="#000" opacity={0.3} />
    <rect x={-60} y={-170} width={120} height={170} rx={14} fill={c} stroke={L} strokeWidth={5} />
    <rect x={-40} y={-200} width={50} height={36} rx={8} fill={c} stroke={L} strokeWidth={5} />
    <rect x={20} y={-196} width={26} height={30} rx={6} fill="#3E3A30" />
    <path d="M -36 -150 L 36 -150 M -36 -110 L 36 -110" stroke="#000" strokeWidth={4} opacity={0.15} />
    {mark > 0 ? <path d={`M -26 -70 L -6 -46 L ${-6 + 40 * mark} ${-46 - 50 * mark}`} stroke="#F4F4F0" strokeWidth={9} fill="none" strokeLinecap="round" /> : null}
  </g>
);

/** A shallow tin bowl, side-on, rolling `rot` degrees. */
const Bowl: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -70 -36 L 70 -36 L 50 0 L -50 0 Z" fill="#B8BEC4" stroke={L} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={-36} rx={70} ry={10} fill="#8E969C" stroke={L} strokeWidth={4} />
  </g>
);

/** A portion of rice in a foam box. */
const Rice: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-60} y={-40} width={120} height={50} rx={8} fill="#F4F0E4" stroke={L} strokeWidth={4} />
    <ellipse cx={0} cy={-40} rx={56} ry={14} fill="#FFFDF4" stroke="#C8C0A8" strokeWidth={2} />
    <circle cx={-18} cy={-44} r={8} fill="#5E8A3A" />
  </g>
);

// ================================================================ the shots

// ---------- S1: the classroom corner by the window: their mat, their bags, the three of them settled ----------
export const S1: React.FC<ShotProps> = ({ t, len }) => {
  const a = onMat(0.1, 0.56);
  const h = onMat(0.24, 0.52);
  const l = onMat(0.32, 0.8, 0.72);
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 760]]), 580, kf(t, [[0, 1.05], [len, 1.3]]))}>
      <Room t={t} id="c6s1" />
      <ChairFor at={a} />
      <ChairFor at={h} back={1} />
      <ChairFor at={l} child />
      <Hero look={AN} pose={P({ ...a, yaw: 0.4, look: 0.3, expr: 'neutral', ...sit(1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={HANH} pose={P({ ...h, yaw: -0.3, look: -0.3, expr: 'neutral', ...sit(-1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 3)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P({ ...l, yaw: 0.2, look: 0.4, expr: 'neutral', ...sit(1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S2: down in the low town: the water over the chair seats in An's living room ----------
export const S2: React.FC<ShotProps> = ({ t, len }) => {
  const wy = LIVING.P(0.25, 0.86, 0.46).y;
  return (
    <g>
      <g transform={camT(kf(t, [[0, 820], [len, 960]]), 560, kf(t, [[0, 1.15], [len, 1.25]]))}>
        <LivingRoom id="c6s2" t={t} lamp={0} day="40" dog={false} veil={0.7} />
        <rect x={-400} y={wy} width={2720} height={900} fill="#5E6E70" opacity={0.78} />
        <path d={`M -400 ${wy} L 2320 ${wy}`} stroke="#C9D8DF" strokeWidth={5} opacity={0.6} />
        {Array.from({ length: 6 }).map((_, i) => <ellipse key={i} cx={300 + i * 280 + 20 * Math.sin(t * 0.03 + i)} cy={wy + 30 + (i % 3) * 40} rx={60} ry={6} fill="none" stroke="#DDE8EC" strokeWidth={3} opacity={0.5} />)}
      </g>
      <Vignette o={0.55} id="c6s2" />
    </g>
  );
};

// ---------- S3: high above the school yard: dry, on its high ground, in the rain ----------
export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 960], [len, 1060]]), kf(t, [[0, 640], [len, 560]]), kf(t, [[0, 1.15], [len, 1.0]]))}>
    <School t={t} />
  </g>
);

// ---------- S4: close along the wall: the bags lined up, the blanket folded square ----------
export const S4: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 400], [len, 560]]), 760, 2.4)}>
    <Room t={t} id="c6s4" />
    <Duffel x={360} y={790} s={0.55} />
    <Duffel x={480} y={796} s={0.5} c="#5E5C44" />
    <Bundle x={600} y={800} s={0.5} c="#4F7486" />
    <rect x={640} y={740} width={160} height={50} rx={6} fill="#B5604F" stroke={L} strokeWidth={4} />
    <rect x={650} y={720} width={140} height={22} rx={6} fill="#C8744A" stroke={L} strokeWidth={4} />
  </g>
);

// ---------- S5: across the aisle: bà Sáu and Nam on their mat ----------
export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const s1 = onMat(0.52, 0.62);
  const n = onMat(0.62, 0.7, 0.72);
  return (
    <g transform={camT(1080, 600, kf(t, [[0, 1.5], [len, 1.62]]))}>
      <Room t={t} id="c6s5" />
      <ChairFor at={s1} back={1} />
      <ChairFor at={n} child />
      <Hero look={SAU} pose={P({ ...s1, yaw: -0.3, look: -0.3, expr: 'neutral', ...sit(-1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 2)} rimId="filmR" shadow={0} />
      <Hero look={NAM} pose={P({ ...n, yaw: -0.3, look: -0.4, expr: 'happy', ...sit(-1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 5)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S6: the corridor: the dog in the pet pen; Hạnh looks out from the classroom door ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 760], [len, 880]]), 640, kf(t, [[0, 1.15], [len, 1.35]]))}>
    <Corridor t={t} id="c6s6">
      <Dog x={1230} y={740} s={0.7} look={0} head={0.3 * Math.max(0, Math.sin(t * 0.05))} t={t} />
      <Hero look={HANH} pose={P({ x: 430, y: onFloor(905, 0.9), scale: 0.9, yaw: 0.6, look: 0.6, expr: 'happy', armL: { a: 10, b: 14 }, armR: { a: 14, b: 20 } }, t, 3)} rimId="filmR" shadow={0} />
    </Corridor>
  </g>
);

// ---------- S7: from the yard's edge: below, the low town under water, roofs in rows ----------
export const S7: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <Tense t={t} a={1}>
      <g transform={camT(960, kf(t, [[0, 600], [len, 540]]), kf(t, [[0, 1.0], [len, 1.12]]))}>
        <rect x={-400} y={-400} width={2720} height={1900} fill="#7E8A94" />
        <CloudBank x={t * 0.3} y={150} h={160} color="#55606C" lit="#6E7884" seed={71} />
        <RoofRow y={620} s={0.8} seed={41} w={2} />
        <RoofRow y={720} s={1.0} seed={42} w={2} />
        <Flood t={t} y={690} x0={-400} x1={2320} o={0.85} h={800} seed={43} />
        <rect x={-400} y={900} width={2720} height={600} fill="#9A9488" />
        {Array.from({ length: 14 }).map((_, i) => <rect key={i} x={-300 + i * 180} y={820} width={20} height={100} fill="#6A6458" />)}
        <rect x={-400} y={820} width={2720} height={16} fill="#6A6458" />
        <Rain t={t} o={0.45} seed={72} />
      </g>
    </Tense>
    <LensRain t={t} seed={7} />
  </g>
);

// ---------- S8: the queue in the yard for drinking water, jerrycans in hand ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => {
  const step = kf(t, [[0, 0], [len, 1]]);
  const people: [typeof AN, number, number][] = [[HELPER, 1450, 1], [SAU, 1250, 0.95], [NAM, 1120, 0.7], [HANH, 960, 0.95], [AN, 780, 1.0]];
  return (
    <g transform={camT(1000, 560, 1.15)}>
      <School t={t} />
      <rect x={-400} y={700} width={2720} height={900} fill="#9A9488" />
      <Tanks t={t} />
      {people.map(([lk, x, s], i) => {
        const pose = P({ x: x - (i ? 40 * step : 0), y: onFloor(900 + 20 * i, s), scale: s, yaw: 0.6, look: 0.5, expr: 'neutral', armL: { a: 10, b: 14 }, armR: { a: 16, b: 10 } }, t, i + 1);
        const hnd = hand(pose, 'armR');
        return (
          <g key={i}>
            <Hero look={lk} pose={pose} rimId="filmR" shadow={0} />
            <Jerry x={hnd.x + 10} y={hnd.y + 160 * s * 0.55} s={s * 0.55} />
          </g>
        );
      })}
      <Rain t={t} o={0.3} seed={81} />
    </g>
  );
};

// ---------- S9: down in the town: the water station drowned to its windows ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.1]]))}>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#6E7884" />
      <CloudBank x={t * 0.3} y={140} h={150} color="#4C5560" lit="#66707C" seed={91} />
      <rect x={360} y={280} width={1200} height={560} fill="#B8B4A4" stroke="#6E6A5A" strokeWidth={8} />
      <rect x={560} y={220} width={800} height={90} rx={10} fill="#2E5E9A" stroke={L} strokeWidth={5} />
      <text x={960} y={280} fontFamily={FONT} fontSize={48} textAnchor="middle" fill="#fff">TRẠM CẤP NƯỚC</text>
      {[460, 780, 1100, 1380].map((x, i) => <rect key={i} x={x} y={380} width={140} height={150} fill="#3A4048" stroke="#6E6A5A" strokeWidth={6} />)}
      <circle cx={1660} cy={560} r={80} fill="#7E8C94" stroke={L} strokeWidth={6} />
      <path d="M 1580 560 L 1460 560" stroke="#7E8C94" strokeWidth={36} />
      <Flood t={t} y={600} x0={-400} x1={2320} o={0.9} h={900} seed={92} />
      <Rain t={t} o={0.45} seed={93} />
    </g>
    <Vignette o={0.5} id="c6s9" />
  </g>
);

// ---------- S10: An at the temporary water unit, pressing the "treated" label onto a tank ----------
export const S10: React.FC<ShotProps> = ({ t, len }) => {
  const press = kf(t, [[14, 0], [30, 1]]);
  return (
    <g transform={camT(860, 560, kf(t, [[0, 1.3], [len, 1.5]]))}>
      <School t={t} />
      <rect x={-400} y={700} width={2720} height={900} fill="#9A9488" />
      <Tanks t={t} label={press} />
      <Hero look={AN} pose={P({ x: 470, y: onFloor(880, 1.05), scale: 1.05, yaw: 0.6, look: 0.4, expr: 'neutral', armR: { a: 70 + 10 * press, b: 30 }, armL: { a: 10, b: 14 } }, t, 1)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S11: the supply van comes up into the yard ----------
export const S11: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, 1.0)}>
    <School t={t} van={kf(t, [[0, 0.05], [len, 0.75]])} />
  </g>
);

// ---------- S12: close: the tank's level glass, then An checking it against his sheet (the slow days) ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(kf(t, [[0, 1080], [len, 900]]), 540, kf(t, [[0, 3.2], [len, 2.0]]))}>
      <School t={t} />
      <rect x={-400} y={700} width={2720} height={900} fill="#9A9488" />
      <Tanks t={t} level={kf(t, [[0, 0.42], [len, 0.38]])} />
      <Hero look={AN} pose={P({ x: 780, y: onFloor(880, 1.05), scale: 1.05, yaw: 0.6, look: 0.3, headTilt: 10, expr: 'worried', armR: { a: 40, b: 70 }, armL: { a: 30, b: 60 } }, t, 1)} rimId="filmR" shadow={0} />
    </g>
    <Vignette o={0.4} id="c6s12" />
  </g>
);

// ---------- S13: low, from among the jerrycans: Linh and Nam ticking each can with chalk ----------
export const S13: React.FC<ShotProps> = ({ t, len }) => {
  const m = kf(t, [[6, 0], [len - 6, 3]]);
  return (
    <g>
      <g transform={camT(960, 500, kf(t, [[0, 1.0], [len, 1.1]]))}>
        <Corridor t={t} id="c6s13">
          <Hero look={LINH} pose={P({ x: 760, y: onFloor(980, 1.1), scale: 1.1, yaw: 0.4, look: 0.2, headTilt: 14, tilt: 12, expr: 'happy', armR: { a: 30, b: 50 }, armL: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
          <Hero look={NAM} pose={P({ x: 1160, y: onFloor(990, 1.1), scale: 1.1, yaw: -0.4, look: -0.2, headTilt: 12, tilt: -10, expr: 'happy', armL: { a: 30, b: 50 }, armR: { a: 10, b: 14 } }, t, 5)} rimId="filmR" shadow={0} />
        </Corridor>
      </g>
      <Jerry x={420} y={1180} s={1.9} mark={Math.min(1, m)} />
      <Jerry x={960} y={1220} s={2.1} mark={Math.min(1, Math.max(0, m - 1))} c="#D89A2C" />
      <Jerry x={1520} y={1180} s={1.9} mark={Math.min(1, Math.max(0, m - 2))} />
    </g>
  );
};

// ---------- S14: the temporary kitchen at the end of the row: Hạnh and the others dividing the meals ----------
export const S14: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.2], [len, 1.35]]))}>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#8E7A58" />
    <rect x={-400} y={160} width={2720} height={460} fill="#C8BC94" />
    <Glow x={960} y={200} r={800} o={0.5} />
    <rect x={300} y={600} width={1320} height={60} fill="#7A5636" stroke={L} strokeWidth={5} />
    <rect x={340} y={660} width={30} height={260} fill="#5E4128" />
    <rect x={1550} y={660} width={30} height={260} fill="#5E4128" />
    <ellipse cx={520} cy={560} rx={130} ry={40} fill="#5A5A5A" stroke={L} strokeWidth={5} />
    <rect x={390} y={480} width={260} height={80} fill="#6A6A6A" stroke={L} strokeWidth={5} />
    {Array.from({ length: 6 }).map((_, i) => <Rice key={i} x={800 + i * 130} y={598} s={0.8} />)}
    <Hero look={HELPER} pose={P({ x: 520, y: onFloor(940, 1.0), scale: 1.0, yaw: 0.2, look: 0.2, headTilt: 12, expr: 'neutral', armL: { a: 30, b: 60 }, armR: { a: 30, b: 60 } }, t, 6)} rimId="filmR" shadow={0} />
    <Hero look={HANH} pose={P({ x: 1100, y: onFloor(940, 1.0), scale: 1.0, yaw: -0.2, look: 0.1, headTilt: 10, expr: 'happy', armL: { a: 30 + 10 * Math.sin(t * 0.2), b: 60 }, armR: { a: 30, b: 60 } }, t, 3)} rimId="filmR" shadow={0} />
    {[[1560, 60], [-200, 0]].map(([x, d], i) => <rect key={i} x={x} y={-400} width={360} height={1900} fill="#3A3226" opacity={0.0 + d * 0} />)}
  </g>
);

// ---------- S15: the corridor, low: Linh sets the empty bowl down, the dog butts it, it rolls away ----------
export const S15: React.FC<ShotProps> = ({ t, len }) => {
  const put = kf(t, [[0, 0], [20, 1]]);
  const roll = kf(t, [[44, 0], [len, 1]]);
  const lPose = P({ x: 620, y: onFloor(900, 0.9), scale: 0.9, yaw: 0.6, look: 0.4, headTilt: 10, tilt: 20 * (1 - Math.abs(put - 0.5) * 2) + 6, expr: roll > 0.1 ? 'shock' : 'happy', armR: { a: 40 - 10 * put, b: 40 }, armL: { a: 10, b: 14 } }, t, 4);
  const hnd = hand(lPose, 'armR');
  const bx = put < 1 ? hnd.x + (780 - hnd.x) * put : 780 + 620 * roll;
  const by = put < 1 ? hnd.y + 20 + (900 - hnd.y - 20) * put : 900;
  return (
    <g transform={camT(kf(t, [[0, 820], [len, 1000]]), 700, 1.4)}>
      <Corridor t={t} id="c6s15">
        <Hero look={LINH} pose={lPose} rimId="filmR" shadow={0} />
        <Dog x={kf(t, [[0, 480], [30, 560], [44, 660], [60, 620]])} y={905} s={0.8} look={1} head={kf(t, [[38, 0], [44, -0.5], [54, 0.2]])} t={t} />
        <Bowl x={bx} y={by} s={0.7} rot={720 * roll} />
      </Corridor>
    </g>
  );
};

// ---------- S16: close: Linh, laughing at it ----------
export const S16: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(980, kf(t, [[0, 620], [len, 470]]), kf(t, [[0, 1.4], [len, 2.8]]))}>
    <Corridor t={t} id="c6s16" />
    <Hero look={LINH} pose={P({ x: 980, y: 700, scale: 1.2, yaw: 0.4, look: 0.5, headTilt: 6, expr: 'happy', talk: talkAt(t, 2, len - 2) * 1.2, armL: { a: 10, b: 14 }, armR: { a: 60, b: 50 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S17: on the floor, from behind the rolling bowl: Nam's sandal comes down and stops it ----------
export const S17: React.FC<ShotProps> = ({ t, len }) => {
  const stop = kf(t, [[10, 0], [18, 1]]);
  return (
    <g>
      <rect x={-200} y={-200} width={2320} height={1500} fill="#7E8A94" />
      <Rain t={t} n={50} o={0.5} seed={17} x0={-200} y0={-200} w={2320} h={700} />
      <rect x={-200} y={480} width={2320} height={900} fill="#B8AC88" />
      {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M ${-200 + i * 330} 1300 L ${700 + i * 80} 480`} stroke="#9A8E6E" strokeWidth={4} />)}
      {/* Nam's leg and sandal from above-right */}
      <g transform={`translate(${1250} ${kf(t, [[0, 300], [16, 690]])})`}>
        <rect x={-62} y={-900} width={124} height={300} fill={NAM.limb} stroke={L} strokeWidth={6} />
        <rect x={-44} y={-610} width={88} height={560} rx={30} fill={NAM.skin} stroke={L} strokeWidth={6} />
        <path d="M -50 -70 Q -140 -60 -150 -10 L 60 -10 Q 60 -60 40 -70 Z" fill={NAM.skin} stroke={L} strokeWidth={6} strokeLinejoin="round" />
        <rect x={-170} y={-12} width={250} height={26} rx={12} fill="#2E5E9A" stroke={L} strokeWidth={5} />
        <path d="M -110 -40 Q -60 -70 0 -40" stroke="#2E5E9A" strokeWidth={16} fill="none" />
      </g>
      <Bowl x={kf(t, [[0, 200], [14, 1080]])} y={760} s={2.2} rot={kf(t, [[0, 0], [14, 300]]) + 6 * stop * Math.sin(t)} />
      <Foreground blur={8}>
        <Bowl x={-120} y={1180} s={4} rot={0} />
      </Foreground>
    </g>
  );
};

// ---------- S18: close: Nam grins ----------
export const S18: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, kf(t, [[0, 620], [len, 470]]), kf(t, [[0, 1.4], [len, 2.8]]))}>
    <Corridor t={t} id="c6s18" />
    <Hero look={NAM} pose={P({ x: 960, y: 700, scale: 1.2, yaw: -0.4, look: -0.5, headTilt: -6, expr: 'happy', talk: talkAt(t, 2, len - 2), armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 5)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S19: Linh hugs the bowl back to her and protests ----------
export const S19: React.FC<ShotProps> = ({ t, len }) => {
  const pose = P({ x: 960, y: 700, scale: 1.2, yaw: 0.2, look: 0.2, headTilt: 8, expr: 'happy', talk: talkAt(t, 10, len - 2), armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } }, t, 4);
  const h1 = hand(pose, 'armL');
  const h2 = hand(pose, 'armR');
  return (
    <g transform={camT(960, kf(t, [[0, 600], [len, 480]]), kf(t, [[0, 1.4], [len, 2.6]]))}>
      <Corridor t={t} id="c6s19" />
      <Hero look={LINH} pose={pose} rimId="filmR" shadow={0} />
      <Bowl x={(h1.x + h2.x) / 2} y={(h1.y + h2.y) / 2 + 30} s={0.6} />
    </g>
  );
};

// ---------- S20: Hạnh comes out from the kitchen with two meals ----------
export const S20: React.FC<ShotProps> = ({ t, len }) => {
  const walk = kf(t, [[0, 0], [24, 1]]);
  const pose = P({ x: 1300 - 300 * walk, y: onFloor(880, 1.0), scale: 1.0, yaw: -0.6, look: -0.5, expr: 'happy', talk: talkAt(t, 26, len - 2), legL: { a: 18 * Math.sin(t * 0.45) * (1 - walk), b: -12 }, legR: { a: -18 * Math.sin(t * 0.45) * (1 - walk), b: -12 }, armL: { a: 40, b: 60 }, armR: { a: 40, b: 60 } }, t, 3);
  const h1 = hand(pose, 'armL');
  const h2 = hand(pose, 'armR');
  return (
    <g transform={camT(kf(t, [[0, 1150], [len, 1000]]), kf(t, [[0, 640], [len, 520]]), kf(t, [[0, 1.4], [len, 2.0]]))}>
      <Corridor t={t} id="c6s20" />
      <Hero look={HANH} pose={pose} rimId="filmR" shadow={0} />
      <Rice x={h1.x} y={h1.y - 6} s={0.6} />
      <Rice x={h2.x} y={h2.y - 10} s={0.6} />
    </g>
  );
};

// ---------- S21: wide: a few people in the corridor laugh ----------
export const S21: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(900, 600, 1.2)}>
    <Corridor t={t} id="c6s21">
      {[[300, SAU, 0.95, 2], [520, HELPER, 1.0, 6], [700, NAM, 0.7, 5], [860, LINH, 0.7, 4], [1020, HANH, 0.95, 3]].map(([x, lk, s, seed], i) => (
        <Hero key={i} look={lk as typeof AN} pose={P({ x: x as number, y: onFloor(950 + (i % 2) * 20, s as number), scale: s as number, yaw: i % 2 ? -0.3 : 0.3, look: 0, headTilt: 8 * Math.sin(t * 0.3 + i), expr: 'happy', talk: Math.abs(Math.sin(t * 0.5 + i)) * 0.6, armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, seed as number)} rimId="filmR" shadow={0} />
      ))}
      <Bowl x={760} y={920} s={0.5} />
    </Corridor>
  </g>
);

// ---------- S22: An wedges the bowl into a corner and sits down with the two of them ----------
export const S22: React.FC<ShotProps> = ({ t, len }) => {
  const down = kf(t, [[40, 0], [70, 1]]);
  return (
    <g transform={camT(860, 620, 1.5)}>
      <Corridor t={t} id="c6s22" />
      <ChairFor at={{ x: 820, y: 900 - 88 * 0.75, scale: 0.75 }} child />
      <ChairFor at={{ x: 960, y: 900 - 88 * 0.75, scale: 0.75 }} child />
      <ChairFor at={{ x: 640, y: 900 - 88 * 1.05, scale: 1.05 }} />
      <Bowl x={300} y={905} s={0.6} />
      <Hero look={LINH} pose={P({ x: 820, y: 900 - 88 * 0.75, scale: 0.75, yaw: 0.3, look: 0.3, expr: 'happy', ...sit(1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 4)} rimId="filmR" shadow={0} />
      <Hero look={NAM} pose={P({ x: 960, y: 900 - 88 * 0.75, scale: 0.75, yaw: -0.3, look: -0.3, expr: 'happy', ...sit(-1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 5)} rimId="filmR" shadow={0} />
      <Hero look={AN} pose={P({ x: kf(t, [[0, 400], [40, 640]]), y: down > 0.5 ? 900 - 88 * 1.05 : onFloor(900, 1.05) + 60 * down, scale: 1.05, yaw: 0.5, look: 0.3, tilt: 10 * (1 - down), expr: 'happy', ...(down > 0.5 ? sit(1) : {}), armL: { a: 14, b: 32 }, armR: { a: down < 0.1 ? 60 : -4, b: down < 0.1 ? 20 : -30 } }, t, 1)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S23: close: An, curious: how many cans this morning? ----------
export const S23: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(940, kf(t, [[0, 620], [len, 470]]), kf(t, [[0, 1.4], [len, 2.7]]))}>
    <Corridor t={t} id="c6s23" />
    <Hero look={AN} pose={P({ x: 940, y: 700, scale: 1.1, yaw: 0.4, look: 0.5, headTilt: 8, expr: 'happy', talk: talkAt(t, 2, len - 2), armL: { a: 10, b: 16 }, armR: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S24: Nam holds up both hands, ten fingers, and looks to Linh for help ----------
export const S24: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.6], [len, 1.9]]))}>
    <Corridor t={t} id="c6s24" />
    <Hero look={NAM} pose={P({ x: 860, y: 700, scale: 1.0, yaw: kf(t, [[0, -0.1], [30, 0.5]]), look: kf(t, [[0, 0], [30, 0.6]]), expr: 'oops', armL: { a: 150, b: 20 }, armR: { a: 150, b: 20 } }, t, 5)} rimId="filmR" shadow={0} />
    <Hero look={LINH} pose={P({ x: 1160, y: 712, scale: 0.98, yaw: -0.4, look: -0.5, expr: 'happy', armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S25: close: Linh answers, quick and sure: twelve, and they checked again ----------
export const S25: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, kf(t, [[0, 600], [len, 470]]), kf(t, [[0, 1.4], [len, 2.8]]))}>
    <Corridor t={t} id="c6s25" />
    <Hero look={LINH} pose={P({ x: 960, y: 700, scale: 1.2, yaw: -0.3, look: -0.4, headTilt: -6, expr: 'smug', talk: talkAt(t, 2, len - 2), armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S26: An, warmly: checking again is right; he'll look at the book with them after they eat ----------
export const S26: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 860], [len, 780]]), kf(t, [[0, 640], [len, 560]]), kf(t, [[0, 1.5], [len, 2.1]]))}>
    <Corridor t={t} id="c6s26" />
      <ChairFor at={{ x: 820, y: 900 - 88 * 0.75, scale: 0.75 }} child />
      <ChairFor at={{ x: 960, y: 900 - 88 * 0.75, scale: 0.75 }} child />
      <ChairFor at={{ x: 640, y: 900 - 88 * 1.05, scale: 1.05 }} />
    <Hero look={LINH} pose={P({ x: 820, y: 900 - 88 * 0.75, scale: 0.75, yaw: 0.3, look: 0.5, expr: 'happy', ...sit(1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 4)} rimId="filmR" shadow={0} />
    <Hero look={NAM} pose={P({ x: 960, y: 900 - 88 * 0.75, scale: 0.75, yaw: -0.3, look: -0.3, expr: 'happy', ...sit(-1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 5)} rimId="filmR" shadow={0} />
    <Hero look={AN} pose={P({ x: 640, y: 900 - 88 * 1.05, scale: 1.05, yaw: 0.5, look: 0.4, headTilt: 8, expr: 'happy', talk: talkAt(t, 2, len - 2), ...sit(1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 1)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S27: over An's shoulder: back at the board, the marker in his hand ----------
const Board: React.FC<{ t: number; q?: number }> = ({ t, q = 0 }) => (
  <g>
    <rect x={360} y={160} width={1200} height={700} rx={10} fill="#F4F4EE" stroke="#8A8A8A" strokeWidth={12} />
    <text x={420} y={250} fontFamily={FONT} fontSize={52} fill="#2E5E9A">Ngày 40</text>
    <text x={420} y={360} fontFamily={FONT} fontSize={46} fill="#2A2A2A">Nước sạch còn: 2 bồn rưỡi</text>
    <text x={420} y={450} fontFamily={FONT} fontSize={46} fill="#2A2A2A">Can đã giao: 12</text>
    <text x={420} y={540} fontFamily={FONT} fontSize={46} fill="#2A2A2A">Chuyến hàng sau:</text>
    <text x={880} y={540} fontFamily={FONT} fontSize={46} fill="#C8322A" opacity={q}>chưa xác nhận ?</text>
    <path d="M 420 600 L 1500 600" stroke="#C8C8C0" strokeWidth={4} />
  </g>
);
export const S27: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(960, 520, kf(t, [[0, 1.0], [len, 1.12]]))}>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#C8BC94" />
      <Glow x={960} y={200} r={900} o={0.4} />
      <Board t={t} />
    </g>
    <Foreground blur={4}>
      <Back look={AN} pose={P({ x: kf(t, [[0, 360], [len, 330]]), y: 1320, scale: 2.5, armL: { a: 8, b: 6 }, armR: { a: 30, b: 60 } })} />
    </Foreground>
  </g>
);

// ---------- S28: close on the board: the questions, a red "not confirmed" written in ----------
export const S28: React.FC<ShotProps> = ({ t, len }) => {
  const q = kf(t, [[30, 0], [60, 1]]);
  return (
    <g>
      <g transform={camT(kf(t, [[0, 700], [len, 900]]), 470, kf(t, [[0, 1.8], [len, 2.1]]))}>
        <rect x={-400} y={-400} width={2720} height={1900} fill="#C8BC94" />
        <Board t={t} q={q} />
        <g transform={`translate(${880 + 380 * q} 520) rotate(-30)`}>
          <rect x={-12} y={-180} width={24} height={170} rx={6} fill="#C8322A" stroke={L} strokeWidth={4} />
        </g>
        <OpenHand x={880 + 380 * q - 150} y={260} rot={-30} s={0.7} skin={AN.skin} />
        <path d={`M ${880 + 380 * q - 150} 260 l -200 -346`} stroke={L} strokeWidth={142} strokeLinecap="round" />
        <path d={`M ${880 + 380 * q - 150} 260 l -200 -346`} stroke={AN.jacket} strokeWidth={130} strokeLinecap="round" />
      </g>
      <Vignette o={0.35} id="c6s28" />
    </g>
  );
};

// ---------- S29: wide, pulling back: An at the board, the classroom, the rain at the window; hold ----------
export const S29: React.FC<ShotProps> = ({ t, len }) => {
  const a = stand(SH, 0.4, 0.3);
  return (
    <g transform={camT(kf(t, [[0, 820], [len, 960]]), kf(t, [[0, 460], [len, 520]]), kf(t, [[0, 1.7], [len, 1.05]]))}>
      <Room t={t} id="c6s29" />
      <Hero look={AN} pose={P({ x: a.x, y: a.y, scale: a.scale, yaw: -0.85, look: -0.8, headTilt: 6, expr: 'neutral', armL: { a: 60, b: 70 }, armR: { a: 10, b: 14 } }, t, 1)} rimId="filmR" shadow={0} />
    </g>
  );
};

export const SHOTS = {
  S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28, S29,
};
