import React from 'react';
import {
  Hero, Pose, poseAt, kf, rnd, camT, LOOKS, joints, toWorld, stand,
  AnHouse, Alley, alleyP, LivingRoom, LIVING, AnKitchen, ANKITCHEN, lampBlink, LampDim, Rain, Splashes, CloudBank, Foreground, Glow, ShotProps,
} from '../../engine';
import { OpenHand } from '../../engine/hands';
import { LEG_LEN } from '../../engine/rig';
import { P, talkAt, Back, ShopFront } from '../mua-100-c01/shots';
import { Flood, Attic, ATT, Duffel, Bundle, PlasticBag } from '../mua-100-c03/shots';

// Cảnh 4 — Ngày 18: Quá nhiều nước. The alley water (about 0,45 m) touches An's veranda; the back garden (+0,10 m)
// stands under about 0,35 m of water; the kitchen (+0,60 m) is dry. The plants drown slowly: some beds yellow, one
// raised bed still green. The storm is heavier than on day 7: more lamp stutters, and the first thunder.

const AN = LOOKS.an;
const HANH = LOOKS.hanh;
const LINH = LOOKS.linh;
const L = '#16141C';
const WATER = '#5E6E70';
/** Hip height for someone whose feet are on `floor`. */
const onFloor = (floor: number, scale: number) => floor - LEG_LEN * scale;

// ================================================================ effects
/** Lightning: a white flash over the frame (a stutter of two strikes) at each local frame in `at`; cue "thunder" a few frames later. */
const FLASH = [1, 0.25, 0.85, 0.5, 0.2, 0.08];
export const flashAt = (t: number, at: number[]) => {
  for (const e of at) {
    const d = t - e;
    if (d >= 0 && d < FLASH.length * 2) return FLASH[Math.floor(d / 2)];
  }
  return 0;
};
export const Flash: React.FC<{ f: number; bolt?: [number, number] }> = ({ f, bolt }) =>
  f > 0 ? (
    <g>
      {bolt && f > 0.5 ? (
        <path d={`M ${bolt[0]} ${bolt[1]} l -40 120 l 46 -10 l -60 150 l 44 -12 l -70 170`} stroke="#F4F8FF" strokeWidth={7} fill="none" strokeLinejoin="round" />
      ) : null}
      <rect x={-3000} y={-3000} width={8000} height={8000} fill="#E8F0FF" opacity={0.55 * f} style={{ mixBlendMode: 'screen' }} />
    </g>
  ) : null;

// ================================================================ props
/** A clay pot at (x, y = the ground under it): a few leaves, `yellow` 0..1 of them gone yellow, `full` water at the rim. */
const Pot: React.FC<{ x: number; y: number; s?: number; yellow?: number; full?: boolean; t?: number; seed?: number }> = ({ x, y, s = 1, yellow = 0.6, full = true, t = 0, seed = 1 }) => {
  const leaves = [[-50, -150, -40], [-14, -190, -12], [30, -170, 22], [60, -130, 50], [-70, -110, -70], [8, -130, 8]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={4} rx={70} ry={10} fill="#000" opacity={0.35} />
      {leaves.map(([lx, ly, r], i) => (
        <path key={`s${i}`} d={`M 0 -70 Q ${lx * 0.3} ${(ly - 70) / 2} ${lx} ${ly + 20}`} stroke="#4E5E2C" strokeWidth={5} fill="none" />
      ))}
      {leaves.map(([lx, ly, r], i) => {
        const yel = rnd(seed, i) < yellow;
        const sway = 3 * Math.sin(t * 0.08 + i);
        return (
          <g key={i} transform={`translate(${lx} ${ly + 20}) rotate(${r + sway + (yel ? 30 : 0)})`}>
            <path d="M 0 0 Q 18 -26 0 -60 Q -18 -26 0 0 Z" fill={yel ? '#C9A646' : '#5E8A3A'} stroke={yel ? '#7A5E22' : '#33481E'} strokeWidth={3} />
            <path d="M 0 -4 L 0 -52" stroke={yel ? '#8E7030' : '#3E5A26'} strokeWidth={2} />
            {yel ? <path d="M -6 -50 Q 0 -60 6 -50" stroke="#6A4A1E" strokeWidth={4} fill="none" /> : null}
          </g>
        );
      })}
      <path d="M -62 -70 L 62 -70 L 48 0 L -48 0 Z" fill="#B4643C" stroke={L} strokeWidth={4} strokeLinejoin="round" />
      <rect x={-70} y={-86} width={140} height={20} rx={5} fill="#C8744A" stroke={L} strokeWidth={4} />
      <path d="M 20 -66 L 12 -4" stroke="#8A4A2A" strokeWidth={8} opacity={0.5} />
      {full ? <ellipse cx={0} cy={-84} rx={60} ry={7} fill="#8FA4AC" stroke="#DDE8EC" strokeWidth={2} opacity={0.95} /> : null}
    </g>
  );
};

/** The green plastic watering can, held at its handle: (x, y) is where the hand grips. */
const Can: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -56 18 Q 0 -30 56 18" stroke={L} strokeWidth={16} fill="none" strokeLinecap="round" />
    <path d="M -56 18 Q 0 -30 56 18" stroke="#3E8E5E" strokeWidth={9} fill="none" strokeLinecap="round" />
    <path d="M 50 70 L 150 10 L 162 22 L 66 92 Z" fill="#3E8E5E" stroke={L} strokeWidth={4} strokeLinejoin="round" />
    <ellipse cx={158} cy={14} rx={10} ry={16} transform="rotate(-36 158 14)" fill="#2E6E46" stroke={L} strokeWidth={3} />
    <rect x={-70} y={16} width={140} height={110} rx={20} fill="#4FA06E" stroke={L} strokeWidth={4} />
    <rect x={-60} y={26} width={30} height={90} rx={10} fill="#fff" opacity={0.18} />
  </g>
);
const CAN_H = 126; // from the handle to the can's base, at s = 1

/** Rows of drowned seedlings: the tips standing out of the water, yellow, in the perspective of a bed seen from (vx, vy). */
const Rows: React.FC<{ t: number; vx: number; vy: number; y0: number; y1: number; n?: number; rows?: number; s?: number; seed?: number }> = ({ t, vx, vy, y0, y1, n = 9, rows = 7, s = 1, seed = 1 }) => (
  <g>
    {Array.from({ length: rows }).map((_, r) =>
      Array.from({ length: n }).map((_, i) => {
        const f = (i + 0.5) / n;
        const y = y0 + (y1 - y0) * f * f;
        const spread = (r - (rows - 1) / 2) * (y - vy) * 1.6;
        const x = vx + spread + 30 * (rnd(seed + r, i) - 0.5) * f;
        const k = s * (0.25 + 1.2 * f * f);
        const yel = rnd(seed + 9, r * n + i) < 0.75;
        return (
          <g key={`${r}-${i}`} transform={`translate(${x} ${y}) scale(${k}) rotate(${4 * Math.sin(t * 0.07 + i + r)})`}>
            <path d="M 0 0 Q -16 -20 -22 -34 M 0 0 Q 14 -24 20 -38 M 0 0 L 2 -30" stroke={yel ? '#B39A48' : '#5E8A3A'} strokeWidth={7} strokeLinecap="round" fill="none" />
            <ellipse cx={0} cy={2} rx={20} ry={4} fill="#C9D8DF" opacity={0.35} />
          </g>
        );
      }),
    )}
  </g>
);

/** The back garden seen from the kitchen's back door: fence, banana leaves, the beds under water, the one raised bed still green at right. `eye` the horizon line. */
const GardenOut: React.FC<{ t: number; eye?: number; rain?: number }> = ({ t, eye = 430, rain = 1 }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={eye + 420} fill="#76848C" />
    <CloudBank x={t * 0.4} y={eye - 300} h={140} color="#4C5560" lit="#66707C" seed={44} />
    <rect x={-400} y={eye - 150} width={2720} height={150} fill="#4A5248" />
    {Array.from({ length: 60 }).map((_, i) => <rect key={i} x={-400 + i * 46} y={eye - 130 - (i % 3) * 8} width={30} height={140 + (i % 3) * 8} fill={i % 2 ? '#7A6A48' : '#6E5E3E'} />)}
    <path d={`M -400 ${eye - 90} L 2320 ${eye - 90} M -400 ${eye - 40} L 2320 ${eye - 40}`} stroke="#4A3E28" strokeWidth={10} />
    {[[-120, 1], [1960, -1]].map(([x, d], i) => (
      <g key={i} transform={`translate(${x} ${eye + 40}) scale(${d} 1)`}>
        <path d="M 0 0 L 20 -420" stroke="#4E5A30" strokeWidth={34} />
        {[-60, -20, 25, 60].map((r, j) => <path key={j} d={`M 20 -420 q ${120 + j * 20} ${-60 + j * 40} ${260 + j * 30} ${60 + j * 50}`} stroke="#3E5A2E" strokeWidth={46} fill="none" strokeLinecap="round" transform={`rotate(${r * 0.3 + 3 * Math.sin(t * 0.04 + j)} 20 -420)`} />)}
      </g>
    ))}
    <rect x={-400} y={eye} width={2720} height={1500} fill={WATER} />
    <rect x={-400} y={eye} width={2720} height={4} fill="#C9D8DF" opacity={0.5} />
    {/* the raised bed at right, its leaves above the water and green */}
    <polygon points={`1240,${eye + 120} 2320,${eye + 90} 2320,${eye + 330} 1180,${eye + 300}`} fill="#4A3A26" />
    {Array.from({ length: 22 }).map((_, i) => {
      const x = 1240 + i * 50 + (i % 2) * 20;
      const y = eye + 150 + (i % 3) * 50;
      return (
        <g key={i} transform={`translate(${x} ${y}) scale(${1 + (i % 3) * 0.25}) rotate(${5 * Math.sin(t * 0.06 + i)})`}>
          <path d="M 0 0 Q -30 -20 -34 -54 Q -6 -40 0 0 Z M 0 0 Q 30 -26 30 -60 Q 6 -40 0 0 Z" fill="#5E8E3A" stroke="#2E4A1E" strokeWidth={3} />
        </g>
      );
    })}
    <Rows t={t} vx={760} vy={eye - 20} y0={eye + 20} y1={1100} n={8} rows={6} seed={3} />
    <Splashes t={t} x0={-300} x1={2220} y0={eye + 10} y1={1080} n={70} o={0.55 * rain} seed={21} />
    {rain > 0 ? <Rain t={t} o={0.4 * rain} seed={22} /> : null}
  </g>
);

/** The garden from straight above: beds as dark stripes with tips, the green raised bed at right, the fence at the top, the kitchen eave at the bottom. */
const GardenTop: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1900} fill={WATER} />
    {Array.from({ length: 6 }).map((_, i) => (
      <g key={i}>
        <rect x={140 + i * 230} y={120} width={130} height={820} fill="#4C5856" opacity={0.6} />
        {Array.from({ length: 11 }).map((_, j) => (
          <g key={j} transform={`translate(${205 + i * 230 + 18 * (rnd(i, j) - 0.5)} ${170 + j * 72}) rotate(${rnd(j, i) * 360})`}>
            <path d="M 0 0 L -14 -18 M 0 0 L 16 -14 M 0 0 L 2 20" stroke={rnd(i + 4, j) < 0.8 ? '#B39A48' : '#5E8A3A'} strokeWidth={6} strokeLinecap="round" />
          </g>
        ))}
      </g>
    ))}
    <rect x={1540} y={100} width={300} height={860} fill="#4A3A26" stroke="#2E2418" strokeWidth={6} />
    {Array.from({ length: 24 }).map((_, i) => (
      <g key={i} transform={`translate(${1590 + (i % 3) * 100} ${150 + Math.floor(i / 3) * 104}) rotate(${i * 40 + 4 * Math.sin(t * 0.05 + i)})`}>
        <path d="M 0 0 Q -30 -20 -34 -54 Q -6 -40 0 0 Z M 0 0 Q 30 -26 30 -60 Q 6 -40 0 0 Z M 0 0 Q 26 30 54 30 Q 30 6 0 0 Z" fill="#5E8E3A" stroke="#2E4A1E" strokeWidth={3} />
      </g>
    ))}
    <rect x={-400} y={-400} width={2720} height={470} fill="#5E4E34" />
    {Array.from({ length: 60 }).map((_, i) => <rect key={i} x={-400 + i * 46} y={10} width={30} height={60} fill="#7A6A48" />)}
    <rect x={-400} y={990} width={2720} height={500} fill="#6A4A34" />
    {Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M ${-400 + i * 92} 990 l 0 300`} stroke="#4E3424" strokeWidth={10} />)}
    <Splashes t={t} x0={-300} x1={2220} y0={80} y1={990} n={110} o={0.65} seed={31} />
  </g>
);

/** Inside the kitchen's back door: the step outside, the pot on it, the garden water lower down. Drawn over AnKitchen. */
const KD = { x0: 1040, x1: 1348, y0: 316, y1: 780 };
const DoorGarden: React.FC<{ t: number; can?: boolean; pots?: number }> = ({ t, can = false, pots = 1 }) => (
  <g>
    <clipPath id="c4door">
      <rect x={KD.x0} y={KD.y0} width={KD.x1 - KD.x0} height={KD.y1 - KD.y0} />
    </clipPath>
    <g clipPath="url(#c4door)">
      <rect x={KD.x0} y={640} width={KD.x1 - KD.x0} height={140} fill={WATER} />
      <rect x={KD.x0} y={640} width={KD.x1 - KD.x0} height={3} fill="#C9D8DF" opacity={0.6} />
      <Rows t={t} vx={1194} vy={620} y0={648} y1={720} n={4} rows={4} s={0.5} seed={7} />
      <Splashes t={t} x0={KD.x0} x1={KD.x1} y0={646} y1={730} n={14} o={0.6} seed={12} />
      <rect x={KD.x0} y={730} width={KD.x1 - KD.x0} height={50} fill="#8E8676" />
      <rect x={KD.x0} y={730} width={KD.x1 - KD.x0} height={6} fill="#B5AE9C" />
    </g>
    <Pot x={1130} y={762} s={0.5} t={t} />
    {pots > 1 ? <Pot x={1270} y={764} s={0.42} t={t} seed={4} yellow={0.4} /> : null}
    {can ? <Can x={1240} y={762 - CAN_H * 0.42} s={0.42} /> : null}
  </g>
);

/** The house's back wall seen from the garden: the lit door with whoever stands in it, the step, the water in front. */
const HouseBack: React.FC<{ t: number; children?: React.ReactNode; can?: boolean; flash?: number }> = ({ t, children, can = false, flash = 0 }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#5A606A" />
    <polygon points="-400,120 2320,60 2320,180 -400,220" fill="#3C424A" />
    <rect x={-400} y={200} width={2720} height={620} fill="#9A8656" />
    <rect x={-400} y={200} width={2720} height={60} fill="#000" opacity={0.3} />
    <rect x={260} y={330} width={220} height={170} fill="#3A3226" stroke="#5A3F28" strokeWidth={10} />
    {/* the doorway */}
    <rect x={760} y={290} width={400} height={520} fill="#E2B064" />
    <Glow x={960} y={480} r={420} o={0.55} />
    {children}
    <rect x={760} y={290} width={400} height={520} fill="none" stroke="#3E2A18" strokeWidth={18} />
    <rect x={700} y={800} width={520} height={60} fill="#8E8676" stroke="#5E5648" strokeWidth={4} />
    <Pot x={830} y={820} s={0.95} t={t} />
    <Pot x={1090} y={822} s={0.8} t={t} seed={4} yellow={0.4} />
    {can ? <Can x={980} y={820 - CAN_H * 0.8} s={0.8} /> : null}
    <rect x={-400} y={850} width={2720} height={700} fill={WATER} />
    <rect x={-400} y={850} width={2720} height={4} fill="#C9D8DF" opacity={0.6} />
    <Rows t={t} vx={960} vy={760} y0={880} y1={1180} n={6} rows={8} s={1.3} seed={9} />
    <Splashes t={t} x0={-300} x1={2220} y0={860} y1={1080} n={60} o={0.6} seed={33} />
    <Rain t={t} o={0.45} near seed={34} />
    <Flash f={flash} />
  </g>
);

// ================================================================ the shots
const kitchen = (id: string, t: number, lamp = 1) => (
  <g>
    <AnKitchen id={id} t={t} w={2} rain={1} lamp={lamp} />
    <DoorGarden t={t} />
  </g>
);

// ---------- S1: low wide: the house; the alley water at the very lip of the veranda ----------
export const S1: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 960]]), 640, kf(t, [[0, 1.25], [len, 1.32]]))}>
    <AnHouse id="c4s1" t={t} w={2} rain={1} chair={false} />
    <Flood t={t} y={752} x0={-400} x1={2300} o={0.92} h={700} seed={9} />
  </g>
);

// ---------- S2: close at the veranda's edge: the water licking the lip ----------
export const S2: React.FC<ShotProps> = ({ t, len }) => {
  const wy = 176 + 6 * Math.sin(t * 0.12);
  return (
    <g transform={camT(960, 420, kf(t, [[0, 1.0], [len, 1.1]]))}>
      <rect x={-200} y={-300} width={2320} height={1600} fill="#6A5A3A" />
      <rect x={-200} y={-300} width={2320} height={420} fill="#7E6E52" />
      {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M ${-200 + i * 280} -300 L ${-200 + i * 280} 120`} stroke="#5E5240" strokeWidth={4} opacity={0.5} />)}
      <rect x={-200} y={120} width={2320} height={46} fill="#B5A58A" />
      <rect x={-200} y={166} width={2320} height={600} fill="#8E7E68" />
      <Flood t={t} y={wy} x0={-200} x1={2120} o={0.94} h={900} seed={11} />
      <path d={`M -200 ${wy - 6} Q 300 ${wy - 22} 800 ${wy - 4} T 2120 ${wy - 10}`} stroke="#E6EEF2" strokeWidth={6} fill="none" opacity={0.75} />
      {[300, 900, 1500].map((x, i) => <path key={i} d={`M ${x + 30 * Math.sin(t * 0.1 + i)} ${wy - 6} q 40 -${10 + 8 * Math.sin(t * 0.2 + i)} 90 -4`} stroke="#E6EEF2" strokeWidth={4} fill="none" opacity={0.6} />)}
      <Rain t={t} n={90} near o={0.35} seed={41} />
    </g>
  );
};

// ---------- S3: high, straight down over the back garden: the beds drowned, the rows lost; lightning ----------
export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(960, 540, kf(t, [[0, 1.05], [len, 1.15]]))}>
      <GardenTop t={t} />
    </g>
    <Flash f={flashAt(t, [89])} />
  </g>
);

// ---------- S4: at the water's surface: the tips of the seedlings standing out, a slow pan left to right ----------
export const S4: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 700], [len, 1220]]), 560, 1.25)}>
    <GardenOut t={t} eye={360} />
  </g>
);

// ---------- S5: the kitchen: its floor dry and lit; through the back door the garden lower down, under water ----------
export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const b = lampBlink(t, [66]);
  return (
    <g transform={camT(940, 520, kf(t, [[0, 1.0], [len, 1.05]]))}>
      {kitchen('c4s5', t, b)}
      <LampDim b={b} />
    </g>
  );
};

// ---------- S6: over Linh's shoulder in the doorway: the pot on the back step ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(1194, 600, kf(t, [[0, 2.0], [len, 2.15]]))}>{kitchen('c4s6', t)}</g>
    <Foreground blur={3}>
      <Back look={LINH} pose={P({ x: kf(t, [[0, 560], [len, 600]]), y: 1180, scale: 2.3, headTilt: 6, armL: { a: 8, b: 8 }, armR: { a: 8, b: 8 } })} />
    </Foreground>
  </g>
);

// ---------- S7: low, from beside the pot: Linh in the doorway above, looking down at it ----------
export const S7: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.05]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#6E6450" />
    <rect x={560} y={-200} width={900} height={1060} fill="#D8A860" />
    <Glow x={1010} y={300} r={700} o={0.5} />
    <rect x={560} y={-200} width={900} height={1060} fill="none" stroke="#3E2A18" strokeWidth={34} />
    <rect x={560} y={760} width={900} height={100} fill="#8A6E4A" />
    <Hero look={LINH} pose={P({ x: 1040, y: onFloor(850, 1.55), scale: 1.55, yaw: -0.15, look: -0.2, headTilt: 14, expr: 'worried', armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
    <rect x={-200} y={860} width={2320} height={500} fill="#8E8676" />
    <rect x={-200} y={860} width={2320} height={10} fill="#B5AE9C" />
    <Pot x={330} y={1180} s={3.4} t={t} />
    <Rain t={t} n={70} near o={0.4} seed={5} />
  </g>
);

// ---------- S8: medium, side-on at the door: she lifts the watering can, then sets it down again ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => {
  const at = stand(ANKITCHEN, 0.56, 0.16);
  const lift = kf(t, [[8, 0], [22, 1], [48, 1], [62, 0]]);
  const pose = P({ x: at.x, y: at.y, scale: at.scale, yaw: 0.7, look: 0.5, headTilt: 6 + 6 * lift, expr: 'worried', armR: { a: 14 + 36 * lift, b: 8 + 50 * lift }, armL: { a: 10, b: 14 } }, t, 4);
  const h = toWorld(pose, joints(pose).armR.end);
  const floor = ANKITCHEN.P(0.56, 1, 0.16).y;
  const s = at.scale * 0.55;
  const y = Math.min(h.y, floor - CAN_H * s);
  return (
    <g transform={camT(1150, 560, 1.65)}>
      {kitchen('c4s8', t)}
      <Hero look={LINH} pose={pose} rimId="filmR" shadow={0} />
      <Can x={h.x} y={y} s={s} />
    </g>
  );
};

// ---------- S9: extreme close, straight down into the pot: full to the rim, rain rings, a yellow leaf afloat ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.12]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#7E7666" />
    {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M -200 ${-100 + i * 180} L 2120 ${-60 + i * 180}`} stroke="#6A6252" strokeWidth={6} />)}
    <circle cx={960} cy={540} r={430} fill="#B4643C" stroke={L} strokeWidth={8} />
    <circle cx={960} cy={540} r={372} fill="#C8744A" stroke={L} strokeWidth={6} />
    <circle cx={960} cy={540} r={350} fill="#6E8088" />
    <circle cx={960} cy={540} r={350} fill="none" stroke="#DDE8EC" strokeWidth={4} opacity={0.7} />
    {Array.from({ length: 6 }).map((_, i) => {
      const ph = (t * 0.04 + i * 0.37) % 1;
      const x = 960 + 260 * (rnd(5, i + Math.floor(t * 0.04 + i * 0.37)) - 0.5) * 2 * 0.7;
      const y = 540 + 260 * (rnd(6, i + Math.floor(t * 0.04 + i * 0.37)) - 0.5) * 2 * 0.7;
      return <circle key={i} cx={x} cy={y} r={10 + 90 * ph} fill="none" stroke="#E6EEF2" strokeWidth={4} opacity={0.7 * (1 - ph)} />;
    })}
    {[[-40, 0, 20], [30, -20, 120], [10, 40, 220], [-30, -40, 300]].map(([dx, dy, r], i) => (
      <g key={i} transform={`translate(${960 + dx} ${540 + dy}) rotate(${r + 3 * Math.sin(t * 0.05 + i)})`}>
        <path d="M 0 0 Q 50 -70 0 -190 Q -50 -70 0 0 Z" fill={i === 1 ? '#5E8A3A' : '#C9A646'} stroke={i === 1 ? '#33481E' : '#7A5E22'} strokeWidth={5} />
        <path d="M 0 -6 L 0 -176" stroke={i === 1 ? '#3E5A26' : '#8E7030'} strokeWidth={4} />
      </g>
    ))}
    <g transform={`translate(${kf(t, [[0, 1150], [len, 1110]])} ${700 + 6 * Math.sin(t * 0.07)}) rotate(${30 + 10 * Math.sin(t * 0.04)})`}>
      <path d="M 0 0 Q 36 -50 0 -130 Q -36 -50 0 0 Z" fill="#C9A646" stroke="#7A5E22" strokeWidth={4} />
    </g>
    <circle cx={960} cy={540} r={36} fill="#4E5E2C" />
  </g>
);

// ---------- S10: close: Linh turns to ask her father ----------
export const S10: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 470, kf(t, [[0, 2.6], [len, 2.7]]))}>
    {kitchen('c4s10', t)}
    <Hero look={LINH} pose={P({ x: 980, y: 780, scale: 1.2, yaw: kf(t, [[0, 0.4], [10, -0.3]]), look: kf(t, [[0, 0.4], [10, -0.4]]), headTilt: -4, expr: 'worried', talk: talkAt(t, 3, len - 4), armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S11: medium two-shot in the kitchen: An answers from beside the counter ----------
export const S11: React.FC<ShotProps> = ({ t, len }) => {
  const a = stand(ANKITCHEN, 0.4, 0.28);
  const l = stand(ANKITCHEN, 0.6, 0.2);
  return (
    <g transform={camT(1020, 520, 1.3)}>
      {kitchen('c4s11', t)}
      <Hero look={AN} pose={P({ x: a.x, y: a.y, scale: a.scale, yaw: 0.6, look: 0.5, headTilt: 4, expr: 'neutral', talk: talkAt(t, 2, len - 2), armL: { a: 10, b: 16 }, armR: { a: 26, b: 34 } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P({ x: l.x, y: l.y, scale: l.scale * 0.72, yaw: -0.55, look: -0.5, headTilt: -6, expr: 'worried', armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S12: close: An, thoughtful ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(860, 440, kf(t, [[0, 2.4], [len, 2.5]]))}>
    {kitchen('c4s12', t)}
    <Hero look={AN} pose={P({ x: 860, y: 690, scale: 1.1, yaw: 0.45, look: 0.4, headTilt: 6, expr: 'neutral', talk: talkAt(t, 2, len - 2), armL: { a: 10, b: 16 }, armR: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S13: macro, side-on at the pot: water over the soil, bubbles rising from the roots that cannot breathe ----------
export const S13: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.14]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#5E584A" />
    <Glow x={1200} y={100} r={900} kind="cool" o={0.3} />
    <rect x={-200} y={900} width={2320} height={400} fill="#8E8676" />
    <path d="M 560 330 L 1360 330 L 1280 910 L 640 910 Z" fill="#B4643C" stroke={L} strokeWidth={8} strokeLinejoin="round" />
    <rect x={520} y={260} width={880} height={90} rx={14} fill="#C8744A" stroke={L} strokeWidth={8} />
    <path d="M 1150 350 L 1100 900" stroke="#8A4A2A" strokeWidth={30} opacity={0.4} />
    <ellipse cx={960} cy={262} rx={420} ry={22} fill="#8FA4AC" stroke="#DDE8EC" strokeWidth={4} />
    {/* water spilling over the rim and down the side */}
    {[640, 1240].map((x, i) => <path key={i} d={`M ${x} 300 q ${i ? 30 : -30} 200 ${i ? 10 : -10} 600`} stroke="#8FA4AC" strokeWidth={10} fill="none" opacity={0.7} strokeDasharray="60 30" strokeDashoffset={-t * 3} />)}
    {Array.from({ length: 9 }).map((_, i) => {
      const ph = (t * 0.03 + i * 0.13) % 1;
      return <circle key={i} cx={720 + i * 60 + 10 * Math.sin(t * 0.1 + i)} cy={262 - 4 * ph} r={6 + 6 * ph} fill="none" stroke="#E6EEF2" strokeWidth={3} opacity={1 - ph} />;
    })}
    {[[-60, -40], [40, -10], [0, -90]].map(([dx, r], i) => (
      <g key={i} transform={`translate(${960 + dx * 3} 250) rotate(${r})`}>
        <path d="M 0 0 Q 60 -90 0 -260 Q -60 -90 0 0 Z" fill={i === 2 ? '#5E8A3A' : '#C9A646'} stroke={i === 2 ? '#33481E' : '#7A5E22'} strokeWidth={5} />
      </g>
    ))}
    <Rain t={t} n={60} near o={0.35} seed={14} />
  </g>
);

// ---------- S14: close: her fingertips touch a yellow leaf ----------
export const S14: React.FC<ShotProps> = ({ t, len }) => {
  const reach = kf(t, [[0, 0], [22, 1]]);
  const wx = 2060 - 960 * reach;
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.06]]))}>
      <rect x={-200} y={-200} width={2320} height={1500} fill="#4E4A40" />
      <Glow x={1300} y={200} r={900} o={0.35} />
      <path d={`M 300 1200 Q 520 800 760 ${560 + 10 * reach}`} stroke="#4E5E2C" strokeWidth={16} fill="none" />
      <g transform={`translate(760 ${560 + 10 * reach}) rotate(${-60 + 6 * reach + 2 * Math.sin(t * 0.06)})`}>
        <path d="M 0 0 Q 150 -170 0 -470 Q -150 -170 0 0 Z" fill="#C9A646" stroke="#7A5E22" strokeWidth={7} />
        <path d="M 0 -10 L 0 -440" stroke="#8E7030" strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M 0 ${-80 - i * 90} q ${50 - i * 6} -30 ${90 - i * 14} -70 M 0 ${-80 - i * 90} q ${-50 + i * 6} -30 ${-90 + i * 14} -70`} stroke="#8E7030" strokeWidth={4} fill="none" />)}
        <path d="M -30 -440 Q 0 -480 30 -440" stroke="#6A4A1E" strokeWidth={10} fill="none" />
      </g>
      <OpenHand x={wx} y={540} rot={98} s={1.2} skin={LINH.skin} />
      <rect x={wx - 10} y={430} width={900} height={220} rx={40} fill={LINH.jacket} stroke={L} strokeWidth={6} />
    </g>
  );
};

// ---------- S15: close, a little below her: Linh, sad ----------
export const S15: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(1000, 470, kf(t, [[0, 2.7], [len, 2.8]]))}>
    {kitchen('c4s15', t)}
    <Hero look={LINH} pose={P({ x: 1000, y: 800, scale: 1.2, yaw: 0.35, look: 0.2, headTilt: 10, expr: 'worried', talk: talkAt(t, 2, len - 3), armL: { a: 10, b: 14 }, armR: { a: 14, b: 30 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S16: medium: An takes the watering can out of her hand ----------
export const S16: React.FC<ShotProps> = ({ t, len }) => {
  const a = stand(ANKITCHEN, 0.42, 0.3);
  const l = stand(ANKITCHEN, 0.58, 0.24);
  const k = kf(t, [[10, 0], [30, 1]]);
  const lPose = P({ x: l.x, y: l.y, scale: l.scale * 0.72, yaw: -0.6, look: -0.5, headTilt: -8, expr: 'worried', armL: { a: 12, b: 14 }, armR: { a: -30 + 18 * k, b: -56 + 46 * k } }, t, 4);
  const aPose = P({ x: a.x, y: a.y, scale: a.scale, yaw: 0.6, look: 0.4, headTilt: 8, tilt: 6, expr: 'neutral', armR: { a: 50 - 20 * k, b: 30 + 20 * k }, armL: { a: 10, b: 16 } }, t, 1);
  const hl = toWorld(lPose, joints(lPose).armR.end);
  const ha = toWorld(aPose, joints(aPose).armR.end);
  const c = { x: hl.x + (ha.x - hl.x) * k, y: hl.y + (ha.y - hl.y) * k };
  return (
    <g transform={camT(1000, 560, 1.55)}>
      {kitchen('c4s16', t)}
      <Hero look={AN} pose={aPose} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={lPose} rimId="filmR" shadow={0} />
      <Can x={c.x} y={c.y} s={0.42} />
    </g>
  );
};

// ---------- S17: medium: An bends towards her, the can in his hand, and talks ----------
export const S17: React.FC<ShotProps> = ({ t, len }) => {
  const a = stand(ANKITCHEN, 0.42, 0.34);
  const l = stand(ANKITCHEN, 0.58, 0.26);
  const aPose = P({ x: a.x, y: a.y, scale: a.scale, yaw: 0.6, look: 0.5, headTilt: 10, tilt: 12, expr: 'neutral', talk: talkAt(t, 2, len - 2), armR: { a: 12, b: 20 }, armL: { a: 14, b: 30 } }, t, 1);
  const h = toWorld(aPose, joints(aPose).armR.end);
  return (
    <g transform={camT(1010, 520, kf(t, [[0, 1.6], [len, 1.7]]))}>
      {kitchen('c4s17', t)}
      <Hero look={AN} pose={aPose} rimId="filmR" shadow={0} />
      <Can x={h.x} y={h.y} s={0.42} />
      <Hero look={LINH} pose={P({ x: l.x, y: l.y, scale: l.scale * 0.72, yaw: -0.6, look: -0.6, headTilt: -10, expr: 'worried', armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S18: reverse, from the garden: the two of them in the lit doorway, the can set down on the step ----------
export const S18: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.1], [len, 1.2]]))}>
    <HouseBack t={t} can>
      <Hero look={AN} pose={P({ x: 890, y: onFloor(800, 0.86), scale: 0.86, yaw: -0.2, look: -0.1, headTilt: 6, expr: 'neutral', talk: talkAt(t, 2, len - 6), armL: { a: 10, b: 14 }, armR: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P({ x: 1050, y: onFloor(800, 0.62), scale: 0.62, yaw: 0.1, look: 0, headTilt: 10, expr: 'worried', armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
    </HouseBack>
  </g>
);

// ---------- S19: straight down on the kitchen table: the vegetable basket empty, one wilted leaf ----------
export const S19: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.12]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#7A5636" />
    {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M -200 ${-60 + i * 150} L 2120 ${-40 + i * 150}`} stroke="#6A4A2E" strokeWidth={8} />)}
    <Glow x={700} y={200} r={900} o={0.45} />
    <ellipse cx={960} cy={560} rx={430} ry={300} fill="#A88A58" stroke={L} strokeWidth={6} />
    <ellipse cx={960} cy={560} rx={370} ry={248} fill="#8E7044" />
    {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M ${960 + 370 * Math.cos((i / 14) * Math.PI * 2)} ${560 + 248 * Math.sin((i / 14) * Math.PI * 2)} L ${960 + 430 * Math.cos((i / 14) * Math.PI * 2)} ${560 + 300 * Math.sin((i / 14) * Math.PI * 2)}`} stroke="#6E5430" strokeWidth={6} />)}
    {Array.from({ length: 6 }).map((_, i) => <ellipse key={i} cx={960} cy={560} rx={370 - i * 55} ry={248 - i * 37} fill="none" stroke="#7E6038" strokeWidth={4} opacity={0.6} />)}
    <g transform="translate(900 600) rotate(-24)">
      <path d="M 0 0 Q 40 -60 0 -170 Q -40 -60 0 0 Z" fill="#A89A50" stroke="#6A5A26" strokeWidth={4} />
      <path d="M 0 0 L 0 -160" stroke="#6A5A26" strokeWidth={3} />
    </g>
    <path d="M 1450 250 Q 1600 220 1700 330 Q 1640 460 1480 430 Z" fill="#D8D4C4" stroke={L} strokeWidth={4} opacity={0.9} />
  </g>
);

// ---------- S20: the market stall An always goes to, its shutter down, rain on the tarp ----------
export const S20: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 960]]), 520, kf(t, [[0, 1.0], [len, 1.06]]))}>
    <ShopFront id="c4s20" t={t} tarp={0.6} wind={0.6} rain={1} />
    <rect x={380} y={230} width={980} height={560} fill="#7E8288" stroke="#3E4248" strokeWidth={8} />
    {Array.from({ length: 22 }).map((_, i) => <path key={i} d={`M 380 ${250 + i * 25} L 1360 ${250 + i * 25}`} stroke="#5E6268" strokeWidth={6} />)}
    <rect x={850} y={740} width={40} height={36} rx={6} fill="#B08A40" stroke={L} strokeWidth={4} />
    <rect x={1400} y={260} width={240} height={520} fill="#2C2218" />
    <Flood t={t} y={770} x0={-300} x1={2300} o={0.9} h={600} seed={19} />
    <Flash f={flashAt(t, [50])} />
  </g>
);

// ---------- S21: wide down the alley: An wades on along the edge, away from us ----------
export const S21: React.FC<ShotProps> = ({ t, len }) => {
  const d = kf(t, [[0, 0.18], [len, 0.36]]);
  const p = alleyP(0.5, d, 0);
  const k = Math.pow(1 - d, 1.25) * 1.15;
  const pose = P({ x: p.x, y: p.y - LEG_LEN * k + 20 * k, scale: k, headTilt: 4, tilt: 3 * Math.sin(t * 0.3), armL: { a: 16 + 10 * Math.sin(t * 0.3), b: 20 }, armR: { a: 16 - 10 * Math.sin(t * 0.3), b: 20 }, legL: { a: 14 * Math.sin(t * 0.3), b: -10 }, legR: { a: -14 * Math.sin(t * 0.3), b: -10 } });
  return (
    <g transform={camT(960, 600, 1.1)}>
      <Alley id="c4s21" t={t} w={2} rain={1} water={1} />
      <clipPath id="c4s21w">
        <rect x={-500} y={-500} width={3000} height={p.y - 40 * k + 500} />
      </clipPath>
      <g clipPath="url(#c4s21w)"><Back look={AN} pose={pose} /></g>
      <ellipse cx={p.x} cy={p.y - 40 * k} rx={70 * k} ry={10 * k} fill="none" stroke="#DDE8EC" strokeWidth={4 * k} opacity={0.7} />
    </g>
  );
};

// ---------- S22: the veranda: An steps up out of the water with the rice on his shoulder and a bag of tins; Hạnh takes the tins ----------
export const S22: React.FC<ShotProps> = ({ t, len }) => {
  const up = kf(t, [[0, 0], [24, 1]]);
  const s = 1.0;
  const aPose = P({ x: kf(t, [[0, 640], [24, 760]]), y: 748 - 140 * s + 40 * (1 - up), scale: s, yaw: 0.6, look: 0.5, tilt: 4 * (1 - up), expr: 'neutral', armL: { a: 150, b: 40 }, armR: { a: 40 - 10 * up, b: 30 }, legL: { a: 20 * (1 - up), b: -20 * (1 - up) }, legR: { a: -10 * (1 - up), b: -10 } }, t, 1);
  const hPose = P({ x: 1000, y: 748 - 140 * 0.95, scale: 0.95, yaw: -0.6, look: -0.5, expr: 'neutral', armL: { a: 10, b: 14 }, armR: { a: -36 * up, b: -40 * up } }, t, 3);
  const ja = joints(aPose);
  const hd = toWorld(aPose, ja.head);
  const sh = { x: hd.x - 6 * s, y: hd.y + 74 * s };
  const hr = toWorld(aPose, ja.armR.end);
  const hh = toWorld(hPose, joints(hPose).armR.end);
  const give = kf(t, [[30, 0], [44, 1]]);
  const bag = { x: hr.x + (hh.x - hr.x) * give, y: hr.y + (hh.y - hr.y) * give };
  return (
    <g transform={camT(860, 560, kf(t, [[0, 1.5], [len, 1.55]]))}>
      <AnHouse id="c4s22" t={t} w={2} rain={1} chair={false} />
      <Hero look={HANH} pose={hPose} rimId="filmL" shadow={0} />
      <g transform={`translate(${sh.x} ${sh.y}) rotate(-8) scale(0.85)`}>
        <rect x={-70} y={-60} width={140} height={74} rx={26} fill="#E2D6B4" stroke={L} strokeWidth={4} />
        <path d="M -40 -40 L 40 -40 M -40 -20 L 30 -20" stroke="#A8442E" strokeWidth={5} />
      </g>
      <Hero look={AN} pose={aPose} rimId="filmR" shadow={0} />
      <g transform={`translate(${bag.x} ${bag.y + 82})`}><PlasticBag x={0} y={0} s={0.9} /></g>
      <Flood t={t} y={752} x0={-400} x1={2300} o={0.92} h={700} seed={9} />
    </g>
  );
};

// ---------- S23: hold on the raised bed: still green in the rain ----------
export const S23: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(1560, 600, kf(t, [[0, 1.6], [len, 1.7]]))}>
      <GardenOut t={t} eye={430} rain={0.7} />
    </g>
    <Flash f={flashAt(t, [8])} />
  </g>
);

// ---------- S24: the living room: Hạnh stacks the ready bags at the foot of the stair ----------
export const S24: React.FC<ShotProps> = ({ t, len }) => {
  const pile = LIVING.P(0.45, 1, 0.13);
  const k = LIVING.s(0.13) / LIVING.s(0) * 0.42;
  const h = stand(LIVING, 0.57, 0.22);
  const put = kf(t, [[10, 0], [40, 1]]);
  const hPose = P({ x: h.x, y: h.y, scale: h.scale, yaw: -0.7, look: -0.6, tilt: -16 * put, expr: 'neutral', armL: { a: 30 + 30 * put, b: 50 - 20 * put }, armR: { a: -30, b: -50 } }, t, 3);
  const hand = toWorld(hPose, joints(hPose).armL.end);
  const dest = { x: pile.x + 40 * k, y: pile.y - 60 * k };
  const set = kf(t, [[30, 0], [40, 1]]);
  const b = lampBlink(t, [96]);
  return (
    <g transform={camT(980, 560, kf(t, [[0, 1.3], [len, 1.36]]))}>
      <LivingRoom id="c4s24" t={t + 40} lamp={b < 0.5 ? 0 : 0.8 * b} day="18" dog />
      <Bundle x={pile.x - 40 * k} y={pile.y} s={k} c="#4F7486" />
      <Duffel x={pile.x + 90 * k} y={pile.y + 4 * k} s={k} />
      <Duffel x={hand.x + (dest.x - hand.x) * set} y={hand.y + 70 * h.scale * (1 - set) + (dest.y - hand.y) * set} s={k * 0.9} c="#5E5C44" />
      <Hero look={HANH} pose={hPose} rimId="filmR" shadow={0} />
      <LampDim b={b} />
    </g>
  );
};

// ---------- S25: straight down into the dry drawer upstairs: the seed packets Hạnh put away ----------
const PACKETS: [string, string][] = [['#C9A646', 'Mướp'], ['#5E8A3A', 'Cải'], ['#B5604F', 'Cà chua'], ['#3F7E8A', 'Rau muống'], ['#8E6AA0', 'Đậu']];
const Packet: React.FC<{ x: number; y: number; c: string; r?: number; s?: number; label?: string }> = ({ x, y, c, r = 0, s = 1, label }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-90} y={-130} width={180} height={260} rx={8} fill="#EDE4CC" stroke={L} strokeWidth={4} />
    <rect x={-90} y={-130} width={180} height={50} fill={c} />
    <circle cx={0} cy={10} r={44} fill={c} opacity={0.75} />
    <path d="M 0 54 L 0 -20 M 0 0 q -30 -10 -36 -40 M 0 -6 q 30 -12 34 -40" stroke="#33481E" strokeWidth={6} fill="none" />
    {label ? <rect x={-70} y={74} width={140} height={34} fill="#fff" stroke="#8A7A58" strokeWidth={2} /> : null}
  </g>
);
export const S25: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.1]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#5E4128" />
    <rect x={360} y={140} width={1200} height={800} fill="#8A6440" stroke="#3E2A18" strokeWidth={14} />
    <rect x={400} y={180} width={1120} height={720} fill="#6E4C30" />
    <Glow x={960} y={300} r={800} o={0.4} />
    {PACKETS.map(([c], i) => <Packet key={i} x={560 + i * 200} y={540 + (i % 2) * 60} c={c} r={(i - 2) * 6} s={1.05} />)}
    <rect x={360} y={940} width={1200} height={120} fill="#8A6440" stroke="#3E2A18" strokeWidth={10} />
    <rect x={900} y={980} width={120} height={30} rx={10} fill="#C8A060" stroke={L} strokeWidth={4} />
  </g>
);

// ---------- S26: the gác: Linh, beside her mother, asks to take the seeds along ----------
export const S26: React.FC<ShotProps> = ({ t, len }) => {
  const h = stand(ATT, 0.4, 0.82);
  const l = stand(ATT, 0.6, 0.82);
  return (
    <g transform={camT(1000, 600, 1.2)}>
      <Attic id="c4s26" t={t + 100} bags={2} />
      <Hero look={HANH} pose={P({ x: h.x, y: h.y, scale: h.scale, yaw: 0.5, look: 0.5, headTilt: 8, expr: 'neutral', armL: { a: 10, b: 16 }, armR: { a: 30, b: 60 } }, t, 3)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P({ x: l.x, y: l.y, scale: l.scale * 0.72, yaw: -0.5, look: -0.6, headTilt: -10, expr: 'worried', armL: { a: -30, b: -60 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S27: the living room, by the stair: Linh holds a small pot next to the full bag ----------
export const S27: React.FC<ShotProps> = ({ t, len }) => {
  const l = stand(LIVING, 0.56, 0.26);
  const pile = LIVING.P(0.45, 1, 0.13);
  const k = LIVING.s(0.13) / LIVING.s(0) * 0.42;
  const pose = P({ x: l.x, y: l.y, scale: l.scale * 0.72, yaw: -0.6, look: -0.5, headTilt: 8, expr: 'worried', armL: { a: 30, b: 60 }, armR: { a: -30, b: -60 } }, t, 4);
  const jh = joints(pose);
  const h1 = toWorld(pose, jh.armL.end);
  const h2 = toWorld(pose, jh.armR.end);
  return (
    <g transform={camT(960, 600, 1.6)}>
      <LivingRoom id="c4s27" t={t + 60} lamp={0.8} day="18" dog={false} />
      <Bundle x={pile.x - 40 * k} y={pile.y} s={k} c="#4F7486" />
      <Duffel x={pile.x + 90 * k} y={pile.y + 4 * k} s={k * 1.08} />
      <Duffel x={pile.x + 40 * k} y={pile.y - 60 * k} s={k * 0.9} c="#5E5C44" />
      <Hero look={LINH} pose={pose} rimId="filmR" shadow={0} />
      <Pot x={(h1.x + h2.x) / 2} y={Math.max(h1.y, h2.y) + 8} s={0.26} t={t} yellow={0.5} />
    </g>
  );
};

// ---------- S28: medium two-shot: An hands her a small box ----------
const Box2: React.FC<{ x: number; y: number; s?: number; tape?: number }> = ({ x, y, s = 1, tape = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-80} y={-50} width={160} height={100} rx={10} fill="#D8C8A0" stroke={L} strokeWidth={5} />
    <rect x={-84} y={-58} width={168} height={22} rx={6} fill="#C8B488" stroke={L} strokeWidth={5} />
    {tape > 0 ? <rect x={-84} y={-52} width={168 * tape} height={16} fill="#E8E0B8" opacity={0.85} stroke="#A89A70" strokeWidth={2} /> : null}
  </g>
);
export const S28: React.FC<ShotProps> = ({ t, len }) => {
  const a = stand(LIVING, 0.5, 0.3);
  const l = stand(LIVING, 0.66, 0.3);
  const k = kf(t, [[14, 0], [34, 1]]);
  const aPose = P({ x: a.x, y: a.y, scale: a.scale, yaw: 0.6, look: 0.5, headTilt: 10, tilt: 8, expr: 'happy', armR: { a: 40 - 10 * k, b: 50 }, armL: { a: 10, b: 16 } }, t, 1);
  const lPose = P({ x: l.x, y: l.y, scale: l.scale * 0.72, yaw: -0.6, look: -0.6, headTilt: -10, expr: 'neutral', armR: { a: -30 * k, b: -60 * k }, armL: { a: 30 * k, b: 60 * k } }, t, 4);
  const ha = toWorld(aPose, joints(aPose).armR.end);
  const jl = joints(lPose);
  const hl1 = toWorld(lPose, jl.armL.end);
  const hl2 = toWorld(lPose, jl.armR.end);
  const hl = { x: (hl1.x + hl2.x) / 2, y: (hl1.y + hl2.y) / 2 };
  const give = kf(t, [[26, 0], [36, 1]]);
  return (
    <g transform={camT(1110, 540, 1.6)}>
      <LivingRoom id="c4s28" t={t + 80} lamp={0.8} day="18" dog={false} />
      <Hero look={AN} pose={aPose} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={lPose} rimId="filmR" shadow={0} />
      <Box2 x={ha.x + (hl.x - ha.x) * give} y={ha.y + (hl.y - ha.y) * give - 10} s={0.36} />
    </g>
  );
};

// ---------- S29: close, low three-quarter: An, warmly ----------
export const S29: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(900, 470, kf(t, [[0, 2.5], [len, 2.6]]))}>
    <LivingRoom id="c4s29" t={t + 100} lamp={0.8} day="18" dog={false} />
    <Hero look={AN} pose={P({ x: 900, y: 690, scale: 1.1, yaw: 0.5, look: 0.5, headTilt: 10, expr: 'happy', talk: talkAt(t, 2, len - 2), armL: { a: 10, b: 16 }, armR: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S30: over An's shoulder: Linh, the box held to her, worried about the pots ----------
export const S30: React.FC<ShotProps> = ({ t, len }) => {
  const pose = P({ x: 1100, y: 700, scale: 1.25, yaw: -0.3, look: -0.3, headTilt: -6, expr: 'worried', talk: talkAt(t, 2, len - 3), armL: { a: 30, b: 70 }, armR: { a: -30, b: -70 } }, t, 4);
  const jl = joints(pose);
  const h1 = toWorld(pose, jl.armL.end);
  const h2 = toWorld(pose, jl.armR.end);
  return (
    <g>
      <g transform={camT(1060, 540, 1.3)}>
        <LivingRoom id="c4s30" t={t + 120} lamp={0.8} day="18" dog={false} />
        <Hero look={LINH} pose={pose} rimId="filmR" shadow={0} />
        <Box2 x={(h1.x + h2.x) / 2} y={(h1.y + h2.y) / 2 - 20} s={0.62} />
      </g>
      <Foreground blur={3}>
        <Back look={AN} pose={P({ x: kf(t, [[0, 400], [len, 370]]), y: 1300, scale: 2.5, armL: { a: 8, b: 6 }, armR: { a: 8, b: 6 } })} />
      </Foreground>
    </g>
  );
};

// ---------- S31: his eyes: through the back door, the pots on the step in the rain; the kitchen lamp stutters ----------
export const S31: React.FC<ShotProps> = ({ t, len }) => {
  const b = lampBlink(t, [45]);
  return (
    <g transform={camT(1194, 580, kf(t, [[0, 1.9], [len, 2.3]]))}>
      <AnKitchen id="c4s31" t={t} w={2} rain={1} lamp={b} />
      <DoorGarden t={t} pots={2} can />
      <LampDim b={b} />
    </g>
  );
};

// ---------- S32: close, side-on: An, his head down a moment, then he answers ----------
export const S32: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(940, 470, kf(t, [[0, 2.5], [len, 2.6]]))}>
    <LivingRoom id="c4s32" t={t + 140} lamp={0.8} day="18" dog={false} />
    <Hero look={AN} pose={P({ x: 940, y: 690, scale: 1.1, yaw: 0.8, look: 0.6, headTilt: kf(t, [[0, 14], [20, 6]]), expr: 'neutral', talk: talkAt(t, 2, len - 2), armL: { a: 10, b: 16 }, armR: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S33: insert: the full bag open: water bottles, the medicine pouch, clothes; no room ----------
export const S33: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.1]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#5A4430" />
    <Glow x={900} y={100} r={900} o={0.4} />
    <path d="M 420 980 Q 380 520 520 420 L 1400 420 Q 1540 520 1500 980 Z" fill="#6E5B7E" stroke={L} strokeWidth={8} />
    <path d="M 520 420 Q 960 340 1400 420" stroke={L} strokeWidth={8} fill="none" />
    {[[620, 300, 0], [760, 280, 8], [900, 300, -6]].map(([x, y, r], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
        <rect x={-46} y={0} width={92} height={260} rx={30} fill="#A8C8D8" stroke={L} strokeWidth={5} opacity={0.95} />
        <rect x={-24} y={-36} width={48} height={40} rx={6} fill="#3F7E8A" stroke={L} strokeWidth={4} />
      </g>
    ))}
    <rect x={1000} y={330} width={200} height={130} rx={14} fill="#E8E0CC" stroke={L} strokeWidth={5} />
    <path d="M 1100 360 L 1100 430 M 1065 395 L 1135 395" stroke="#C8322A" strokeWidth={14} />
    <path d="M 1200 380 Q 1300 300 1380 400 Q 1300 440 1200 440 Z" fill="#B5604F" stroke={L} strokeWidth={5} />
    <rect x={420} y={640} width={1080} height={60} fill="#000" opacity={0.15} />
  </g>
);

// ---------- S34: close: Linh asks if they can plant again when they come back ----------
export const S34: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(980, 470, kf(t, [[0, 2.6], [len, 2.75]]))}>
    <LivingRoom id="c4s34" t={t + 160} lamp={0.8} day="18" dog={false} />
    <Hero look={LINH} pose={P({ x: 980, y: 700, scale: 1.2, yaw: -0.3, look: -0.4, headTilt: -8, expr: 'worried', talk: talkAt(t, 2, len - 3), armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S35: medium: An crouches to her, hopeful ----------
export const S35: React.FC<ShotProps> = ({ t, len }) => {
  const a = stand(LIVING, 0.42, 0.34);
  const l = stand(LIVING, 0.58, 0.3);
  return (
    <g transform={camT(1080, 540, kf(t, [[0, 1.5], [len, 1.6]]))}>
      <LivingRoom id="c4s35" t={t + 180} lamp={0.8} day="18" dog={false} />
      <Hero look={AN} pose={P({ x: a.x, y: a.y, scale: a.scale, yaw: 0.6, look: 0.6, headTilt: 10, tilt: 14, expr: 'happy', talk: talkAt(t, 2, len - 2), armL: { a: 14, b: 30 }, armR: { a: 40, b: 50 } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P({ x: l.x, y: l.y, scale: l.scale * 0.72, yaw: -0.6, look: -0.6, headTilt: -10, expr: 'neutral', armL: { a: 30, b: 60 }, armR: { a: -30, b: -60 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S36: straight down: the packets on the floor: some go into the box, the rest stay out for later ----------
export const S36: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[8, 0], [40, 1]]);
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.08]]))}>
      <rect x={-200} y={-200} width={2320} height={1500} fill="#7A5A3A" />
      {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M ${-200 + i * 240} -200 L ${-200 + i * 240} 1300`} stroke="#5E4128" strokeWidth={6} />)}
      <Glow x={960} y={300} r={900} o={0.4} />
      <rect x={1080} y={300} width={560} height={420} rx={20} fill="#C8B488" stroke={L} strokeWidth={6} />
      <rect x={1110} y={330} width={500} height={360} rx={14} fill="#8E7A54" />
      {PACKETS.map(([c], i) => {
        const keep = i < 3;
        const sx = 320 + i * 150;
        const ex = keep ? 1200 + i * 150 : sx;
        const ey = keep ? 500 : 780;
        const x = sx + (ex - sx) * (keep ? k : 0);
        const y = 760 + (ey - 760) * (keep ? k : 1);
        return <Packet key={i} x={x} y={y} c={c} r={keep ? 0 : (i - 3) * 12} s={0.8} />;
      })}
      <OpenHand x={kf(t, [[0, 400], [40, 1250]])} y={-60} rot={0} s={1.3} skin={AN.skin} />
      <rect x={kf(t, [[0, 400], [40, 1250]]) - 110} y={-500} width={200} height={460} fill={AN.jacket} stroke={L} strokeWidth={6} />
    </g>
  );
};

// ---------- S37: extreme close: her two hands run the tape along the box's lid ----------
export const S37: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[6, 0], [len - 10, 1]]);
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.06]]))}>
      <rect x={-200} y={-200} width={2320} height={1500} fill="#5E4128" />
      <Glow x={960} y={200} r={900} o={0.45} />
      <rect x={420} y={420} width={1080} height={520} rx={30} fill="#D8C8A0" stroke={L} strokeWidth={8} />
      <rect x={400} y={380} width={1120} height={110} rx={18} fill="#C8B488" stroke={L} strokeWidth={8} />
      <rect x={400} y={410} width={1120 * k} height={60} fill="#EDE6C4" opacity={0.85} stroke="#A89A70" strokeWidth={3} />
      <OpenHand x={360} y={150} rot={-30} s={1.15} skin={LINH.skin} />
      <OpenHand x={420 + 1120 * k} y={120} rot={-20} s={1.15} skin={LINH.skin} />
      <rect x={180} y={-300} width={200} height={430} fill={LINH.jacket} stroke={L} strokeWidth={6} transform="rotate(-30 360 150)" />
      <rect x={320 + 1120 * k} y={-330} width={200} height={430} fill={LINH.jacket} stroke={L} strokeWidth={6} transform={`rotate(-20 ${420 + 1120 * k} 120)`} />
    </g>
  );
};

// ---------- S38: close: Linh: "call me when you plant them" ----------
export const S38: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(1000, 470, kf(t, [[0, 2.5], [len, 2.6]]))}>
    <LivingRoom id="c4s38" t={t + 200} lamp={0.8} day="18" dog={false} />
    <Hero look={LINH} pose={P({ x: 1000, y: 700, scale: 1.2, yaw: -0.35, look: -0.5, headTilt: -12, expr: 'happy', talk: talkAt(t, 2, len - 3), armL: { a: 30, b: 70 }, armR: { a: -30, b: -70 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S39: wider two-shot: "Ừ, bố nhớ." He nods ----------
export const S39: React.FC<ShotProps> = ({ t, len }) => {
  const a = stand(LIVING, 0.5, 0.34);
  const l = stand(LIVING, 0.64, 0.3);
  return (
    <g transform={camT(1060, 520, 1.25)}>
      <LivingRoom id="c4s39" t={t + 220} lamp={0.8} day="18" dog />
      <Hero look={AN} pose={P({ x: a.x, y: a.y, scale: a.scale, yaw: 0.6, look: 0.6, headTilt: 10 + 8 * Math.max(0, Math.sin(t * 0.25)) * kf(t, [[0, 1], [30, 0]]), tilt: 6, expr: 'happy', talk: talkAt(t, 2, 22), armL: { a: 14, b: 30 }, armR: { a: 12, b: 20 } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P({ x: l.x, y: l.y, scale: l.scale * 0.72, yaw: -0.6, look: -0.6, headTilt: -10, expr: 'happy', armL: { a: 30, b: 70 }, armR: { a: -30, b: -70 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S40: straight down: she writes the name of each seed on its label ----------
export const S40: React.FC<ShotProps> = ({ t, len }) => {
  const n = kf(t, [[4, 0], [len - 6, 3]]);
  const i = Math.min(2, Math.floor(n));
  const f = n - Math.floor(n);
  const pen = { x: 560 + i * 400 - 60 + 140 * f, y: 680 + 8 * Math.sin(f * 30) };
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.06]]))}>
      <rect x={-200} y={-200} width={2320} height={1500} fill="#7A5A3A" />
      <Glow x={960} y={300} r={900} o={0.45} />
      {PACKETS.slice(0, 3).map(([c, name], j) => (
        <g key={j}>
          <Packet x={560 + j * 400} y={560} c={c} s={1.6} label={name} />
          <text x={560 + j * 400} y={705} fontFamily="Comic Sans MS, Comic Sans, cursive" fontSize={34} textAnchor="middle" fill="#2A2A3A" clipPath="none" opacity={j < i ? 1 : j === i ? f : 0}>{name}</text>
        </g>
      ))}
      <g transform={`translate(${pen.x} ${pen.y}) rotate(-38)`}>
        <rect x={-10} y={-260} width={20} height={250} rx={8} fill="#3F6E9A" stroke={L} strokeWidth={4} />
        <path d="M -10 -10 L 0 14 L 10 -10 Z" fill="#E8E0CC" stroke={L} strokeWidth={3} />
      </g>
      <OpenHand x={pen.x - 150} y={pen.y - 200} rot={-38} s={0.7} skin={LINH.skin} />
      <path d={`M ${pen.x - 150} ${pen.y - 200} l -250 -320`} stroke={L} strokeWidth={142} strokeLinecap="round" />
      <path d={`M ${pen.x - 150} ${pen.y - 200} l -250 -320`} stroke={LINH.jacket} strokeWidth={130} strokeLinecap="round" />
    </g>
  );
};

// ---------- S41: from the garden: the pots left on the step in the rain; lightning ----------
export const S41: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 640, kf(t, [[0, 1.5], [len, 1.4]]))}>
    <HouseBack t={t} can flash={flashAt(t, [47])} />
  </g>
);

// ---------- S42: the back door: Linh sets the watering can down by the pots; then only the rain ----------
export const S42: React.FC<ShotProps> = ({ t, len }) => {
  const down = kf(t, [[6, 0], [30, 1]]);
  const pose = P({ x: 1050, y: onFloor(800, 0.62), scale: 0.62, yaw: 0.3, look: 0.1, headTilt: 10 + 8 * down, tilt: 14 * down * (1 - kf(t, [[40, 0], [56, 1]])), expr: 'neutral', armR: { a: 30 - 16 * down, b: 50 - 40 * down }, armL: { a: 10, b: 14 } }, t, 4);
  const h = toWorld(pose, joints(pose).armR.end);
  const cy = Math.min(h.y, 820 - CAN_H * 0.8);
  return (
    <g transform={camT(960, 600, kf(t, [[0, 1.3], [len, 1.2]]))}>
      <HouseBack t={t} flash={flashAt(t, [131])}>
        <Hero look={LINH} pose={pose} rimId="filmR" shadow={0} />
      </HouseBack>
      {down < 1 || t < 40 ? <Can x={h.x} y={cy} s={0.8} /> : <Can x={h.x} y={820 - CAN_H * 0.8} s={0.8} />}
    </g>
  );
};

export const SHOTS = {
  S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21,
  S22, S23, S24, S25, S26, S27, S28, S29, S30, S31, S32, S33, S34, S35, S36, S37, S38, S39, S40, S41, S42,
};
