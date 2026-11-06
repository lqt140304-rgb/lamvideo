import React from 'react';
import { Hero, kf, rnd, camT, LOOKS, joints, toWorld, Rain, Splashes, CloudBank, Foreground, Glow, ShotProps } from '../../engine';
import { OpenHand } from '../../engine/hands';
import { LEG_LEN } from '../../engine/rig';
import { P, talkAt } from '../mua-100-c01/shots';
import { Flood, sit, ChairFor } from '../mua-100-c03/shots';
import { Vignette, LensRain, NearEdge } from '../mua-100-c05/shots';
import { Room, onMat, Corridor, HELPER } from '../mua-100-c06/shots';

// Cảnh 7 — Ngày 60: Một tiếng chim dưới mái. Beyond the school fence the path into the woods is under water; a squirrel
// on a branch looks at water where it used to run. The old nest at the foot of the tree is gone, but a pair of birds is
// carrying twigs to the dry eave outside the classroom door. The children watch from behind the door, keep their distance,
// and Linh starts to write other things in her notebook. Calm, curious, small.

const AN = LOOKS.an;
const LINH = LOOKS.linh;
const NAM = LOOKS.nam;
const SAU = LOOKS.baSau;
const L = '#16141C';
const FONT = 'Comic Sans MS, Comic Sans, cursive';
const onFloor = (floor: number, scale: number) => floor - LEG_LEN * scale;

// ================================================================ nature
/** A small brown bird, side-on, facing right; `flap` 0..1 the wing up; `twig` a stalk in the beak. */
const Bird: React.FC<{ x: number; y: number; s?: number; flip?: 1 | -1; flap?: number; twig?: number; t?: number }> = ({ x, y, s = 1, flip = 1, flap = 0, twig = 0, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${flip * s} ${s})`}>
    <path d="M -40 6 L -78 -4 L -74 18 Z" fill="#6A4A2E" stroke={L} strokeWidth={3} strokeLinejoin="round" />
    <ellipse cx={0} cy={0} rx={44} ry={26} fill="#8A6440" stroke={L} strokeWidth={4} />
    <ellipse cx={6} cy={10} rx={30} ry={14} fill="#D8C8A0" />
    <circle cx={36} cy={-18} r={18} fill="#8A6440" stroke={L} strokeWidth={4} />
    <circle cx={42} cy={-22} r={4} fill={L} />
    <path d="M 52 -18 L 70 -14 L 52 -10 Z" fill="#E8B03C" stroke={L} strokeWidth={2} />
    <g transform={`rotate(${-50 * flap + 6 * Math.sin(t * 0.3)} -6 -8)`}>
      <path d="M -6 -8 Q -40 -30 -50 -4 Q -26 -6 -6 4 Z" fill="#6A4A2E" stroke={L} strokeWidth={3} />
    </g>
    {twig > 0 ? <path d={`M 56 -16 l ${50 * twig} ${-10 * twig} M 70 -18 l 14 -14`} stroke="#9A8A50" strokeWidth={4} strokeLinecap="round" /> : null}
    <path d="M -2 24 L -8 40 M 10 24 L 8 40" stroke="#5A3E26" strokeWidth={3} />
  </g>
);

/** A squirrel sitting up on a branch, facing left. */
const Squirrel: React.FC<{ x: number; y: number; s?: number; t?: number; look?: number }> = ({ x, y, s = 1, t = 0, look = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M 30 0 Q 110 -20 90 -110 Q 70 -170 ${20 + 6 * Math.sin(t * 0.2)} -150 Q 70 -110 40 -40 Z`} fill="#A0602E" stroke={L} strokeWidth={4} />
    <ellipse cx={0} cy={-40} rx={34} ry={44} fill="#B8703A" stroke={L} strokeWidth={4} />
    <ellipse cx={-6} cy={-30} rx={18} ry={28} fill="#E8C898" />
    <g transform={`rotate(${look * 12} -10 -84)`}>
      <circle cx={-14} cy={-92} r={26} fill="#B8703A" stroke={L} strokeWidth={4} />
      <path d="M -6 -114 L 2 -132 L 10 -112 Z" fill="#B8703A" stroke={L} strokeWidth={3} />
      <circle cx={-26} cy={-96} r={4} fill={L} />
      <circle cx={-38} cy={-88} r={3} fill="#3A2418" />
    </g>
    <path d="M -24 -30 L -30 -12 M -10 -26 L -14 -8" stroke="#8A4E20" strokeWidth={5} strokeLinecap="round" />
  </g>
);

/** The woods past the school fence: trunks standing in water, the path gone under it. */
const Woods: React.FC<{ t: number; fence?: boolean; nest?: boolean }> = ({ t, fence = true, nest = false }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#8A9A9E" />
    <CloudBank x={t * 0.3} y={60} h={140} color="#6A7A80" lit="#8A969C" seed={7} />
    {Array.from({ length: 14 }).map((_, i) => {
      const x = -300 + i * 190 + 60 * rnd(3, i);
      const w = 30 + 30 * rnd(4, i);
      return (
        <g key={i} opacity={0.55 + 0.45 * rnd(5, i)}>
          <rect x={x} y={-100} width={w} height={900} fill="#4A4A3A" />
          <circle cx={x + w / 2} cy={60 + 80 * rnd(6, i)} r={140 + 60 * rnd(7, i)} fill="#4E6A44" />
        </g>
      );
    })}
    {/* the trunk of the old tree, right of centre, and its foot in the water */}
    <rect x={1180} y={-200} width={140} height={980} fill="#5A4A34" stroke={L} strokeWidth={5} />
    <path d="M 1180 700 Q 1120 760 1080 790 M 1320 700 Q 1380 760 1420 790" stroke="#5A4A34" strokeWidth={30} fill="none" />
    {nest ? <path d="M 1120 760 Q 1180 720 1250 760" stroke="#7A6A40" strokeWidth={10} fill="none" opacity={0.5} /> : null}
    <Flood t={t} y={500} x0={-400} x1={2320} o={0.88} h={1100} seed={11} />
    {/* the drowned trunks seen dimly through the water, and the rings where they leave it */}
    {Array.from({ length: 14 }).map((_, i) => {
      const x = -300 + i * 190 + 60 * rnd(3, i);
      const w = 30 + 30 * rnd(4, i);
      return <g key={i}><rect x={x} y={500} width={w} height={600} fill="#2E3A3A" opacity={0.25} /><ellipse cx={x + w / 2} cy={502} rx={w * 0.9} ry={6} fill="none" stroke="#DDE8EC" strokeWidth={3} opacity={0.6} /></g>;
    })}
    <rect x={1180} y={500} width={140} height={600} fill="#2E2A20" opacity={0.3} />
    <ellipse cx={1250} cy={503} rx={110} ry={9} fill="none" stroke="#DDE8EC" strokeWidth={4} opacity={0.7} />
    {[[300, 0], [820, 1], [1560, 2]].map(([x, i]) => <g key={i} transform={`translate(${x + 30 * Math.sin(t * 0.03 + i)} ${506 + 3 * Math.sin(t * 0.1 + i)})`}><path d="M -60 0 L 60 -4 M -30 2 l -14 -12 M 20 -2 l 10 -14" stroke="#5A4A34" strokeWidth={7} strokeLinecap="round" /></g>)}
    {/* the old path: a pale strip going under the water */}
    <path d="M 600 1100 Q 760 860 900 720" stroke="#A89A7A" strokeWidth={60} opacity={0.35} fill="none" />
    {fence ? (
      <g>
        <rect x={-400} y={820} width={2720} height={14} fill="#3A3A3A" />
        <rect x={-400} y={960} width={2720} height={14} fill="#3A3A3A" />
        {Array.from({ length: 28 }).map((_, i) => <rect key={i} x={-380 + i * 100} y={760} width={12} height={360} fill="#3A3A3A" />)}
      </g>
    ) : null}
    <Rain t={t} o={0.35} seed={12} />
  </g>
);

/** Under the dry eave outside the classroom door: the beam, the corner where the birds build, the doorway at left. */
const Eave: React.FC<{ t: number; nest?: number }> = ({ t, nest = 0.3 }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#8E9AA4" />
    <Rain t={t} o={0.5} seed={21} x0={600} y0={300} w={1800} h={900} />
    <rect x={-400} y={-400} width={2720} height={560} fill="#9A4A3A" />
    {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-400 + i * 290} y={-400} width={26} height={560} fill="#6A2A20" />)}
    <rect x={-400} y={140} width={2720} height={60} fill="#7A5636" stroke={L} strokeWidth={4} />
    <rect x={-400} y={200} width={900} height={1300} fill="#E2D6A8" />
    <rect x={120} y={300} width={300} height={760} fill="#8A6440" stroke="#5A3E26" strokeWidth={8} />
    <rect x={-400} y={1060} width={2720} height={600} fill="#B8AC88" />
    <path d="M -400 1060 L 2320 1060" stroke="#8A7E5E" strokeWidth={6} />
    {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M ${-300 + i * 300} 1060 L ${-500 + i * 340} 1500`} stroke="#9A8E6E" strokeWidth={4} />)}
    {/* the nest in the corner of beam and wall */}
    <g transform="translate(560 210)">
      <path d={`M -80 0 Q -60 ${70 * nest} 0 ${80 * nest} Q 60 ${70 * nest} 80 0`} fill="#9A8A50" stroke="#5A4A26" strokeWidth={4} />
      {Array.from({ length: Math.round(12 * nest) }).map((_, i) => <path key={i} d={`M ${-70 + i * 12} ${10 + (i % 3) * 8} l ${30 - (i % 2) * 60} ${10 + (i % 4) * 4}`} stroke="#7A6A38" strokeWidth={3} />)}
    </g>
  </g>
);

/** The notebook, open flat: the tally of rainy days on the left, Linh's lines on the right as `lines` (0..3) grows. */
const Notebook: React.FC<{ lines?: number; tally?: number }> = ({ lines = 0, tally = 60 }) => {
  const rows = ['Hôm nay giao đủ nước cho phòng bên.', 'Hôm nay một người nhận được tin gia đình.', 'Hôm nay nghe thấy chim.'];
  return (
    <g>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#7A5A3A" />
      <rect x={180} y={120} width={1560} height={860} rx={10} fill="#F4EEDC" stroke={L} strokeWidth={6} />
      <path d="M 960 120 L 960 980" stroke="#C8BC9C" strokeWidth={10} />
      {Array.from({ length: 16 }).map((_, i) => <path key={i} d={`M 220 ${190 + i * 50} L 1700 ${190 + i * 50}`} stroke="#C8D4E0" strokeWidth={2} />)}
      {/* the tally: groups of five */}
      {Array.from({ length: Math.min(tally, 70) }).map((_, i) => {
        const g = Math.floor(i / 5);
        const k = i % 5;
        const gx = 250 + (g % 6) * 110;
        const gy = 230 + Math.floor(g / 6) * 100;
        return k < 4 ? <path key={i} d={`M ${gx + k * 18} ${gy} l 0 60`} stroke="#3A4A6A" strokeWidth={5} /> : <path key={i} d={`M ${gx - 8} ${gy + 50} l 80 -40`} stroke="#3A4A6A" strokeWidth={5} />;
      })}
      {rows.map((r, i) => (
        <text key={i} x={1000} y={290 + i * 120} fontFamily={FONT} fontSize={38} fill="#2A2A3A" opacity={Math.max(0, Math.min(1, lines - i))}>{r}</text>
      ))}
      {lines > 2.6 ? (
        <g transform="translate(1520 640) scale(0.9)" opacity={Math.min(1, (lines - 2.6) * 3)}>
          <Bird x={0} y={0} s={0.9} />
        </g>
      ) : null}
    </g>
  );
};

// ================================================================ the shots

// ---------- S1: from inside the school fence: the woods past it, the path gone under water ----------
export const S1: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(kf(t, [[0, 820], [len, 960]]), 600, kf(t, [[0, 1.0], [len, 1.1]]))}>
      <Woods t={t} />
    </g>
    <NearEdge side={-1} w={200} c="#2A2A2A" />
    <LensRain t={t} seed={3} n={8} />
  </g>
);

// ---------- S2: low, from the water's surface: the squirrel on its branch looks down at the water ----------
export const S2: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 1000], [len, 1020]]), kf(t, [[0, 520], [len, 380]]), kf(t, [[0, 1.5], [len, 2.3]]))}>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#8A9A9E" />
    <rect x={1400} y={-400} width={160} height={1500} fill="#4A3A2A" />
    <path d="M 1480 420 Q 1100 400 700 470" stroke="#4A3A2A" strokeWidth={46} strokeLinecap="round" fill="none" />
    <path d="M 900 440 q -60 -60 -120 -70 M 1100 420 q -30 -80 -90 -110" stroke="#4A3A2A" strokeWidth={16} fill="none" />
    {Array.from({ length: 8 }).map((_, i) => <ellipse key={i} cx={820 + i * 80} cy={360 - (i % 3) * 30} rx={50} ry={20} fill="#5E7A44" />)}
    <Squirrel x={1040} y={420} s={1.4} t={t} look={kf(t, [[0, 0], [30, 1]])} />
    <Flood t={t} y={600} x0={-400} x1={2320} o={0.88} h={1000} seed={23} />
    <rect x={1400} y={600} width={160} height={600} fill="#2E2A20" opacity={0.3} />
    <ellipse cx={1480} cy={603} rx={120} ry={9} fill="none" stroke="#DDE8EC" strokeWidth={4} opacity={0.7} />
    <Rain t={t} o={0.35} seed={24} />
  </g>
);

// ---------- S3: the foot of the old tree: where the nest was, only water and a few loose straws ----------
export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(1250, 520, kf(t, [[0, 1.6], [len, 2.1]]))}>
      <Woods t={t} fence={false} nest />
      {Array.from({ length: 5 }).map((_, i) => <path key={i} d={`M ${1100 + i * 50 + 20 * Math.sin(t * 0.05 + i)} ${505 + (i % 2) * 6} l 30 4`} stroke="#9A8A50" strokeWidth={4} />)}
    </g>
    <Vignette o={0.45} id="c7s3" />
  </g>
);

// ---------- S4: morning in the classroom: Linh on her chair hears a small sound and turns to the door ----------
export const S4: React.FC<ShotProps> = ({ t, len }) => {
  const l = onMat(0.2, 0.7, 0.72);
  return (
    <g transform={camT(l.x, kf(t, [[0, 640], [len, l.y - 120]]), kf(t, [[0, 1.3], [len, 2.6]]))}>
      <Room t={t} id="c7s4" />
      <ChairFor at={l} child />
      <Hero look={LINH} pose={P({ ...l, yaw: kf(t, [[0, 0.2], [30, -0.6]]), look: kf(t, [[0, 0.2], [30, -0.7]]), headTilt: kf(t, [[20, 0], [40, -10]]), expr: 'neutral', ...sit(1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S5: low, under the dry eave: a pair of birds bring twigs to the corner of the beam; hold ----------
export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const a = kf(t, [[0, 0], [40, 1]]);
  const b = kf(t, [[50, 0], [95, 1]]);
  return (
    <g transform={camT(kf(t, [[0, 900], [len, 700]]), kf(t, [[0, 420], [len, 300]]), kf(t, [[0, 1.4], [len, 2.1]]))}>
      <Eave t={t} nest={0.3 + 0.2 * kf(t, [[0, 0], [len, 1]])} />
      <Bird x={1600 - 1000 * a} y={260 + 120 * Math.sin(a * Math.PI) * -1 + 40} s={0.9} flip={-1} flap={a < 1 ? Math.abs(Math.sin(t * 0.8)) : 0} twig={1} t={t} />
      <Bird x={1800 - 1140 * b} y={300 - 140 * Math.sin(b * Math.PI) + 20} s={0.8} flip={-1} flap={b < 1 ? Math.abs(Math.sin(t * 0.9 + 1)) : 0} twig={1} t={t} />
    </g>
  );
};

// ---------- S6: the corridor: Linh tugs Nam by the hand to come and look ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[0, 0], [len, 1]]);
  const walk = (x: number, s: number, ph: number) => ({ x: x - 160 * k, y: onFloor(980, s), scale: s, yaw: -0.6, look: -0.5, legL: { a: 20 * Math.sin(t * 0.5 + ph), b: -14 }, legR: { a: -20 * Math.sin(t * 0.5 + ph), b: -14 } });
  return (
    <g transform={camT(kf(t, [[0, 900], [len, 780]]), 640, 1.4)}>
      <Corridor t={t} id="c7s6" />
      <Hero look={LINH} pose={P({ ...walk(780, 0.8, 0), expr: 'happy', armL: { a: 14, b: 16 }, armR: { a: -60, b: -10 } }, t, 4)} rimId="filmR" shadow={0} />
      <Hero look={NAM} pose={P({ ...walk(960, 0.8, 2), expr: 'neutral', armL: { a: 60, b: 10 }, armR: { a: 14, b: 16 } }, t, 5)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S7: from the nest, looking down: two faces peeking round the classroom door ----------
export const S7: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.12]]))}>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#B8AC88" />
      {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M ${-200 + i * 300} -400 L ${-100 + i * 300} 1500`} stroke="#9A8E6E" strokeWidth={4} />)}
      <rect x={280} y={-400} width={500} height={1900} fill="#E2D6A8" />
      <rect x={700} y={-400} width={100} height={1900} fill="#8A6440" stroke="#5A3E26" strokeWidth={6} />
      <Hero look={LINH} pose={P({ x: 980, y: 740, scale: 1.3, yaw: 0.5, look: 0.2, headTilt: -24, expr: 'happy', armL: { a: 30, b: 60 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
      <Hero look={NAM} pose={P({ x: 700, y: 860, scale: 1.4, yaw: 0.5, look: 0.2, headTilt: -22, expr: 'happy', armL: { a: 30, b: 60 }, armR: { a: 10, b: 14 } }, t, 5)} rimId="filmR" shadow={0} />
    </g>
    <Foreground blur={8}>
      <path d="M -100 -100 Q 600 140 1400 -40 L 1400 -100 Z" fill="#9A8A50" />
      {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M ${i * 110} ${20 + (i % 3) * 20} l 80 30`} stroke="#7A6A38" strokeWidth={10} />)}
    </Foreground>
    <Vignette o={0.4} id="c7s7" />
  </g>
);

// ---------- S8: close: Linh whispers ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, kf(t, [[0, 600], [len, 470]]), kf(t, [[0, 1.4], [len, 2.9]]))}>
    <Corridor t={t} id="c7s8" />
    <Hero look={LINH} pose={P({ x: 960, y: 700, scale: 1.2, yaw: 0.5, look: 0.6, headTilt: -10, expr: 'happy', talk: talkAt(t, 2, len - 2) * 0.6, armL: { a: 10, b: 14 }, armR: { a: 110, b: 60 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S9: Nam inches forward and asks if they could set a box for it ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 980]]), kf(t, [[0, 660], [len, 640]]), kf(t, [[0, 1.5], [len, 2.0]]))}>
    <Corridor t={t} id="c7s9" />
    <Hero look={LINH} pose={P({ x: 780, y: onFloor(980, 0.8), scale: 0.8, yaw: 0.5, look: 0.5, expr: 'neutral', armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
    <Hero look={NAM} pose={P({ x: kf(t, [[0, 940], [20, 1010]]), y: onFloor(980, 0.8), scale: 0.8, yaw: 0.5, look: 0.6, headTilt: -8, expr: 'happy', talk: talkAt(t, 8, len - 2), armL: { a: 10, b: 14 }, armR: { a: 40, b: 40 } }, t, 5)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S10: close: Linh, whispering: don't go near ----------
export const S10: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(960, kf(t, [[0, 600], [len, 470]]), kf(t, [[0, 1.4], [len, 3.0]]))}>
      <Corridor t={t} id="c7s10" />
      <Hero look={LINH} pose={P({ x: 960, y: 700, scale: 1.2, yaw: 0.3, look: 0.5, headTilt: 6, expr: 'worried', talk: talkAt(t, 2, len - 2) * 0.6, armL: { a: 10, b: 14 }, armR: { a: 60, b: 40 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
    <Vignette o={0.3} id="c7s10" />
  </g>
);

// ---------- S11: An comes along the corridor and stops behind the two of them ----------
export const S11: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[0, 0], [40, 1]]);
  return (
    <g transform={camT(860, 620, 1.2)}>
      <Corridor t={t} id="c7s11" />
      <Hero look={LINH} pose={P({ x: 900, y: onFloor(980, 0.8), scale: 0.8, yaw: 0.5, look: 0.6, expr: 'happy', armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
      <Hero look={NAM} pose={P({ x: 1010, y: onFloor(980, 0.8), scale: 0.8, yaw: 0.5, look: 0.6, expr: 'happy', armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 5)} rimId="filmR" shadow={0} />
      <Hero look={AN} pose={P({ x: 300 + 400 * k, y: onFloor(1000, 1.05), scale: 1.05, yaw: 0.6, look: 0.5, expr: 'neutral', legL: { a: 20 * Math.sin(t * 0.45) * (1 - k), b: -14 }, legR: { a: -20 * Math.sin(t * 0.45) * (1 - k), b: -14 }, armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S12: close: An, softly: watching from here is enough; let them choose ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(940, kf(t, [[0, 620], [len, 450]]), kf(t, [[0, 1.4], [len, 2.7]]))}>
    <Corridor t={t} id="c7s12" />
    <Hero look={AN} pose={P({ x: 940, y: 700, scale: 1.1, yaw: 0.5, look: 0.4, headTilt: 10, expr: 'happy', talk: talkAt(t, 2, len - 2), armL: { a: 10, b: 16 }, armR: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S13: Linh steps back against the door frame, leaving the space before the nest clear ----------
export const S13: React.FC<ShotProps> = ({ t, len }) => {
  const back = kf(t, [[0, 0], [30, 1]]);
  return (
    <g transform={camT(720, 600, 1.05)}>
      <Eave t={t} nest={0.6} />
      <Hero look={LINH} pose={P({ x: 640 - 220 * back, y: onFloor(1060, 1.0), scale: 1.0, yaw: 0.6, look: 0.5, headTilt: -14, expr: 'happy', armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
      <Bird x={560} y={190} s={0.7} flip={-1} t={t} />
    </g>
  );
};

// ---------- S14: cleaning time in the corridor: brooms, and Linh's raised hand: keep your distance ----------
const Broom: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 0 0 L 0 260" stroke="#8A6A3C" strokeWidth={9} />
    <path d="M -36 260 L 36 260 L 50 330 L -50 330 Z" fill="#BFA25C" stroke={L} strokeWidth={3} />
  </g>
);
export const S14: React.FC<ShotProps> = ({ t, len }) => {
  const sw = Math.sin(t * 0.3);
  const hPose = P({ x: 1200, y: onFloor(1000, 1.0), scale: 1.0, yaw: -0.5, look: -0.4, headTilt: 10, tilt: 10, expr: 'neutral', armL: { a: 40 + 10 * sw, b: 50 }, armR: { a: -40 - 10 * sw, b: -50 } }, t, 6);
  const h = toWorld(hPose, joints(hPose).armL.end);
  return (
    <g transform={camT(900, 600, 1.15)}>
      <Corridor t={t} id="c7s14" />
      <Hero look={HELPER} pose={hPose} rimId="filmR" shadow={0} />
      <Broom x={h.x} y={h.y} s={1} rot={20 + 10 * sw} />
      <Hero look={SAU} pose={P({ x: 1500, y: onFloor(980, 0.95), scale: 0.95, yaw: -0.4, look: -0.4, expr: 'happy', armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 2)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P({ x: 640, y: onFloor(1000, 0.8), scale: 0.8, yaw: 0.6, look: 0.5, expr: 'neutral', talk: talkAt(t, 10, len - 4) * 0.7, armL: { a: 10, b: 14 }, armR: { a: 100, b: 40 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S15: straight down on the notebook: the tally of rainy days ----------
export const S15: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 560], [len, 760]]), 560, kf(t, [[0, 1.5], [len, 1.3]]))}>
    <Notebook lines={0} tally={kf(t, [[0, 55], [len, 60]])} />
  </g>
);

// ---------- S16: Linh at the window, writing something new in it ----------
export const S16: React.FC<ShotProps> = ({ t, len }) => {
  const l = onMat(0.2, 0.7, 0.72);
  const pose = P({ ...l, yaw: 0.3, look: 0.2, headTilt: 18, tilt: 6, expr: 'happy', ...sit(1), armL: { a: 30 + 4 * Math.sin(t * 0.6), b: 70 }, armR: { a: -30, b: -70 } }, t, 4);
  const j = joints(pose);
  const h1 = toWorld(pose, j.armL.end);
  const h2 = toWorld(pose, j.armR.end);
  const nx = (h1.x + h2.x) / 2;
  const ny = Math.max(h1.y, h2.y);
  return (
    <g transform={camT(l.x + 40, kf(t, [[0, 600], [len, l.y - 60]]), kf(t, [[0, 1.6], [len, 2.4]]))}>
      <Room t={t} id="c7s16" />
      <ChairFor at={l} child />
      <Hero look={LINH} pose={pose} rimId="filmR" shadow={0} />
      <rect x={nx - 50 * l.scale} y={ny - 6 * l.scale} width={100 * l.scale} height={60 * l.scale} rx={4} fill="#F4EEDC" stroke={L} strokeWidth={3} transform={`rotate(-8 ${nx} ${ny})`} />
      <path d={`M ${nx - 30 * l.scale} ${ny + 10 * l.scale} l ${50 * l.scale} -4`} stroke="#3A4A6A" strokeWidth={3} />
    </g>
  );
};

// ---------- S17: the notebook: three lines, one after another; the last: "heard the birds"; hold ----------
export const S17: React.FC<ShotProps> = ({ t, len }) => {
  const lines = kf(t, [[4, 0], [64, 1], [80, 1], [150, 2], [160, 2], [196, 3]]);
  const row = Math.min(2, Math.floor(lines));
  const f = lines - Math.floor(lines);
  const pen = { x: 1000 + (lines >= 3 ? 600 : 620 * f), y: 280 + row * 120 };
  return (
    <g transform={camT(kf(t, [[0, 1250], [len, 1180]]), 500, kf(t, [[0, 1.8], [len, 1.6]]))}>
      <Notebook lines={lines} tally={60} />
      <g transform={`translate(${pen.x} ${pen.y}) rotate(-38)`}>
        <rect x={-10} y={-240} width={20} height={230} rx={8} fill="#E8B03C" stroke={L} strokeWidth={4} />
        <path d="M -10 -10 L 0 14 L 10 -10 Z" fill="#E8D8B0" stroke={L} strokeWidth={3} />
      </g>
      <OpenHand x={pen.x - 130} y={pen.y - 170} rot={-38} s={0.62} skin={LINH.skin} />
      <path d={`M ${pen.x - 130} ${pen.y - 170} l -230 -300`} stroke={L} strokeWidth={128} strokeLinecap="round" />
      <path d={`M ${pen.x - 130} ${pen.y - 170} l -230 -300`} stroke={LINH.jacket} strokeWidth={116} strokeLinecap="round" />
    </g>
  );
};

export const SHOTS = { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17 };
