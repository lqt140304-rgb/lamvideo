import React from 'react';
import {
  Hero, kf, rnd, camT, LOOKS, joints, toWorld, stand, makeRoom, RoomShell, Box, FloorShadow,
  AnHouse, Alley, alleyP, LivingRoom, LIVING, RoofRow, Areca, Dog, Radio, Rain, Splashes, CloudBank, Foreground, Glow, LightVeil, ShotProps,
} from '../../engine';
import { Bookcase, ShoeRack, Plant, NoticeBoard } from '../../engine/sets/school';
import { OpenHand } from '../../engine/hands';
import { LEG_LEN } from '../../engine/rig';
import { P, talkAt, Back, ShopFront } from '../mua-100-c01/shots';
import { Flood, Duffel, Bundle, PlasticBag, sit } from '../mua-100-c03/shots';

// Cảnh 5 — Ngày 26: Nơi cao chưa chắc an toàn. About 0,65 m in the alley, 0,05 m over An's living-room floor. A boat
// takes the family from the veranda to the higher head of the alley where the van waits. The short road up the hill is
// closed after a slide; the convoy waits for a confirmed route, then goes to the school on the high open ground.

const AN = LOOKS.an;
const HANH = LOOKS.hanh;
const LINH = LOOKS.linh;
const SAU = LOOKS.baSau;
const NAM = LOOKS.nam;
const RESCUE = { ...LOOKS.workerHat, skin: '#D9A880', skinShade: '#C08E66', hand: '#D9A880' };
const COORD = LOOKS.chu;
const L = '#16141C';
const WATER = '#5E6E70';
export const onFloor = (floor: number, scale: number) => floor - LEG_LEN * scale;
const hand = (pose: ReturnType<typeof P>, side: 'armL' | 'armR') => toWorld(pose, joints(pose)[side].end);

// ================================================================ camera feeling
/** Handheld: a small irregular drift, `a` pixels; strong only in the tense beats. */
export const shakeT = (t: number, a: number) => `translate(${a * (Math.sin(t * 1.7) + 0.6 * Math.sin(t * 3.1 + 1))} ${a * (Math.cos(t * 1.3) + 0.5 * Math.sin(t * 2.7))})`;
/** Wraps a shot: handheld shake `a` px and a Dutch tilt `tilt` degrees about the frame centre. */
export const Tense: React.FC<{ t: number; a?: number; tilt?: number; children: React.ReactNode }> = ({ t, a = 0, tilt = 0, children }) => (
  <g transform={`${shakeT(t, a)} rotate(${tilt} 960 540)`}>{children}</g>
);
/** Darkens the frame's edges so the eye goes to the middle; `o` 0..1. */
export const Vignette: React.FC<{ o?: number; id: string }> = ({ o = 0.5, id }) => (
  <g>
    <defs>
      <radialGradient id={`${id}vg`} cx="50%" cy="50%" r="70%">
        <stop offset="55%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={o} />
      </radialGradient>
    </defs>
    <rect x={-100} y={-100} width={2120} height={1280} fill={`url(#${id}vg)`} />
  </g>
);
/** Rain on the lens: soft drops in front of everything, for depth. */
export const LensRain: React.FC<{ t: number; n?: number; seed?: number }> = ({ t, n = 14, seed = 1 }) => (
  <Foreground blur={6}>
    {Array.from({ length: n }).map((_, i) => {
      const y = (rnd(seed, i) * 1300 + t * (0.6 + rnd(seed + 1, i))) % 1300 - 100;
      return <ellipse key={i} cx={rnd(seed + 2, i) * 1920} cy={y} rx={14 + 20 * rnd(seed + 3, i)} ry={18 + 26 * rnd(seed + 3, i)} fill="#DDE8EC" opacity={0.28} />;
    })}
  </Foreground>
);
/** A soft dark shape at the frame's edge, nearer than anything: a post, a wall end. */
export const NearEdge: React.FC<{ side: 1 | -1; w?: number; c?: string }> = ({ side, w = 260, c = '#1E2024' }) => (
  <Foreground blur={10}>
    <rect x={side < 0 ? -60 : 1920 - w + 60} y={-100} width={w} height={1300} fill={c} opacity={0.92} />
  </Foreground>
);

// ================================================================ props
/** The rescue boat, side-on, centred at (x, y = waterline). */
export const Boat: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode }> = ({ x, y, s = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {children}
    <ellipse cx={0} cy={20} rx={300} ry={22} fill="#000" opacity={0.25} />
    <path d="M -300 -30 Q -250 40 -150 40 L 200 40 Q 290 20 320 -40 L -300 -40 Z" fill="#D8692E" stroke={L} strokeWidth={6} />
    <path d="M -300 -40 L 320 -40" stroke="#F4F0E4" strokeWidth={14} />
    <path d="M -230 0 L 240 0" stroke="#A84E20" strokeWidth={6} opacity={0.6} />
  </g>
);

/** The rescue van, side-on, facing right, its wheels on the road at y. */
export const Van: React.FC<{ x: number; y: number; s?: number; t?: number; wipe?: boolean }> = ({ x, y, s = 1, t = 0, wipe = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={400} ry={20} fill="#000" opacity={0.35} />
    <path d="M -380 -60 L -380 -330 Q -380 -350 -360 -350 L 200 -350 Q 260 -350 300 -280 L 380 -180 L 390 -60 Z" fill="#E8E6DE" stroke={L} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 210 -330 L 270 -330 L 340 -200 L 210 -200 Z" fill="#6E8290" stroke={L} strokeWidth={5} />
    {[-340, -180, -20].map((wx) => <rect key={wx} x={wx} y={-320} width={130} height={110} rx={10} fill="#56687A" stroke={L} strokeWidth={5} />)}
    <rect x={-380} y={-180} width={770} height={34} fill="#D8692E" />
    <rect x={-380} y={-140} width={770} height={12} fill="#2E5E9A" />
    <path d="M 170 -340 L 170 -70" stroke={L} strokeWidth={4} opacity={0.5} />
    <rect x={330} y={-110} width={60} height={30} rx={6} fill="#F2E2A0" stroke={L} strokeWidth={3} />
    <rect x={-110} y={-380} width={120} height={30} rx={8} fill="#C8322A" stroke={L} strokeWidth={4} />
    {[-240, 250].map((wx) => (
      <g key={wx}>
        <circle cx={wx} cy={-40} r={60} fill="#22202A" stroke={L} strokeWidth={5} />
        <circle cx={wx} cy={-40} r={24} fill="#8E8A80" />
      </g>
    ))}
    {wipe ? <path d={`M 230 -210 l ${80 * Math.cos(Math.sin(t * 0.3) * 1.1 - 0.4)} ${-80 * Math.abs(Math.sin(Math.sin(t * 0.3) * 1.1 + 1.2))}`} stroke={L} strokeWidth={5} /> : null}
  </g>
);

/** A road-closed barrier: two trestles, a striped plank and the no-entry disc (as on day 7). */
const Barrier: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-340, 340].map((dx, i) => <path key={i} d={`M ${dx} -130 L ${dx - 50} 0 M ${dx} -130 L ${dx + 50} 0`} stroke="#3E2A18" strokeWidth={14} strokeLinecap="round" />)}
    {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={-400 + i * 100} y={-170} width={100} height={42} fill={i % 2 ? '#F4F0E4' : '#C8322A'} />)}
    <rect x={-400} y={-170} width={800} height={42} fill="none" stroke="#2A2018" strokeWidth={5} />
    <path d="M 0 -130 L 0 -270" stroke="#3E2A18" strokeWidth={10} />
    <circle cx={0} cy={-330} r={72} fill="#C8322A" stroke="#F4F0E4" strokeWidth={9} />
    <rect x={-50} y={-346} width={100} height={32} rx={4} fill="#F4F0E4" />
  </g>
);

/** The hillside behind the town: wet grass, a road cut along it; `slide` 0..1 the brown scar of mud across the road. */
export const Hill: React.FC<{ t: number; slide?: number; trickle?: number }> = ({ t, slide = 0, trickle = 0 }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#7C8993" />
    <CloudBank x={t * 0.4} y={120} h={140} color="#55606C" lit="#6E7884" seed={71} />
    <path d="M -400 760 L -100 360 Q 300 160 700 260 Q 1100 120 1500 300 Q 1900 380 2320 260 L 2320 1500 L -400 1500 Z" fill="#4E6248" />
    <path d="M -400 760 L -100 360 Q 300 160 700 260 Q 1100 120 1500 300 Q 1900 380 2320 260" stroke="#3E5038" strokeWidth={10} fill="none" />
    {Array.from({ length: 40 }).map((_, i) => <path key={i} d={`M ${-300 + i * 70} ${520 + 160 * rnd(4, i)} q 10 -30 20 0`} stroke="#3A4C34" strokeWidth={6} fill="none" />)}
    {/* the road cut across the slope */}
    <path d="M -400 820 L 2320 640 L 2320 720 L -400 910 Z" fill="#6E6A60" />
    <path d="M -400 820 L 2320 640" stroke="#8E8A80" strokeWidth={6} />
    {trickle > 0 ? Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M ${200 + i * 260} ${330 + 40 * rnd(9, i)} q 20 120 -10 260 t 10 200`} stroke="#9AB0BA" strokeWidth={5} fill="none" strokeDasharray="30 22" strokeDashoffset={-t * 4} opacity={0.75 * trickle} />) : null}
    {slide > 0 ? (
      <g opacity={slide}>
        <path d="M 1050 220 Q 1180 240 1300 300 Q 1360 520 1460 690 Q 1250 760 980 780 Q 1010 540 1050 220 Z" fill="#7A5A3A" stroke="#5A3E26" strokeWidth={6} />
        {Array.from({ length: 12 }).map((_, i) => <ellipse key={i} cx={1000 + i * 40} cy={700 + 30 * rnd(3, i)} rx={30} ry={18} fill="#8A8478" stroke="#4A4438" strokeWidth={3} />)}
        <path d="M 1100 260 L 1130 420 M 1200 290 L 1240 470" stroke="#5A3E26" strokeWidth={8} />
      </g>
    ) : null}
    <Rain t={t} o={0.4} seed={72} />
  </g>
);

/** The head of the alley, higher ground: a road rising out of the water, a solid wall at left, the van at right. */
const AlleyHead: React.FC<{ t: number; wind?: number; van?: boolean; id: string }> = ({ t, wind = 0, van = true, id }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#69737E" />
    <CloudBank x={t * (0.4 + wind)} y={120} h={140} color="#4C5560" lit="#66707C" seed={81} />
    <RoofRow y={520} s={1.1} seed={12} w={2} x0={-500} x1={2420} />
    <Areca x={1560} y={760} s={1.1} blow={wind} t={t} seed={3} />
    <polygon points="-400,1500 -400,800 2320,780 2320,1500" fill="#5E5E5A" />
    <path d="M -400 800 L 2320 780" stroke="#8E8A80" strokeWidth={6} />
    {/* the sturdy wall people shelter behind */}
    <rect x={-200} y={430} width={720} height={390} fill="#A8A08E" stroke="#5E5848" strokeWidth={8} />
    {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M -200 ${490 + i * 60} L 520 ${490 + i * 60}`} stroke="#8E8674" strokeWidth={4} />)}
    <rect x={-220} y={410} width={760} height={30} fill="#8E8674" />
    {van ? <Van x={1300} y={830} s={0.95} t={t} wipe /> : null}
    <Flood t={t} y={980} x0={-400} x1={2320} o={0.9} h={600} seed={id.length} />
    <Rain t={t} o={0.45 + 0.15 * wind} seed={83} slant={0.14 + 0.4 * wind} />
  </g>
);

/** Inside the van: a bench along the wall, the window with the rain and the town sliding away behind. */
const VanIn: React.FC<{ t: number; id: string; roofs?: number }> = ({ t, id, roofs = 1 }) => {
  const sc = t * 2.2;
  return (
    <g>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#3A3E46" />
      <clipPath id={`${id}w`}>
        <rect x={200} y={170} width={1520} height={400} rx={30} />
      </clipPath>
      <g clipPath={`url(#${id}w)`}>
        <rect x={0} y={0} width={1920} height={700} fill="#7E8A94" />
        <g transform={`translate(${-(sc % 1400)} 0)`} opacity={roofs}>
          {[0, 1, 2].map((k) => <g key={k} transform={`translate(${k * 1400} 0)`}><RoofRow y={520} s={0.8} seed={30 + k} w={2} x0={0} x1={1400} /></g>)}
        </g>
        <rect x={0} y={0} width={1920} height={700} fill="#9AA6B0" opacity={0.25 + 0.35 * (1 - roofs)} />
        {Array.from({ length: 26 }).map((_, i) => {
          const y = ((t * (3 + (i % 3)) + i * 61) % 460) + 160;
          return <path key={i} d={`M ${240 + i * 57} ${y} l -26 34`} stroke="#DDE6EC" strokeWidth={4} opacity={0.6} />;
        })}
      </g>
      {[200, 960, 1720].map((x) => <rect key={x} x={x - 14} y={160} width={28} height={420} fill="#22242A" />)}
      <rect x={180} y={150} width={1560} height={440} rx={34} fill="none" stroke="#22242A" strokeWidth={26} />
      <rect x={-400} y={590} width={2720} height={60} fill="#4A4E58" />
      <rect x={-400} y={880} width={2720} height={700} fill="#26282E" />
      <rect x={-400} y={740} width={2720} height={60} rx={14} fill="#2E5E9A" stroke={L} strokeWidth={5} />
      <rect x={-400} y={790} width={2720} height={100} fill="#24466E" />
      <Glow x={960} y={120} r={700} o={0.3} />
      <LightVeil id={`${id}v`} lights={[[960, 300, 900]]} o={0.4} />
    </g>
  );
};

/** The school on its open platform: the long single-storey block with its corridor, the yard, the flagpole. */
export const School: React.FC<{ t: number; van?: number }> = ({ t, van = -1 }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#7E8A94" />
    <CloudBank x={t * 0.3} y={120} h={140} color="#5A6470" lit="#727C88" seed={91} />
    <path d="M -400 520 Q 300 380 900 460 Q 1500 420 2320 500 L 2320 700 L -400 700 Z" fill="#56664C" />
    <rect x={180} y={360} width={1520} height={300} fill="#E2D6A8" stroke="#6A5E3E" strokeWidth={6} />
    <polygon points="140,370 960,250 1740,370" fill="#9A4A3A" stroke="#5A2A20" strokeWidth={6} />
    <rect x={180} y={540} width={1520} height={30} fill="#B8AC80" />
    {Array.from({ length: 7 }).map((_, i) => (
      <g key={i}>
        <rect x={240 + i * 210} y={410} width={120} height={110} fill="#E8B060" stroke="#6A5E3E" strokeWidth={5} />
        <path d={`M ${300 + i * 210} 410 L ${300 + i * 210} 520`} stroke="#6A5E3E" strokeWidth={4} />
      </g>
    ))}
    {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={200 + i * 186} y={520} width={16} height={140} fill="#B8AC80" stroke="#6A5E3E" strokeWidth={3} />)}
    <rect x={-400} y={660} width={2720} height={900} fill="#9A9488" />
    <path d="M 1840 660 L 1840 260" stroke="#4A4A4A" strokeWidth={10} />
    <path d={`M 1840 270 l 120 ${20 + 10 * Math.sin(t * 0.3)} l -120 40 Z`} fill="#C8322A" />
    {van >= 0 ? <Van x={-300 + 1200 * van} y={880} s={0.8} t={t} wipe /> : null}
    {[260, 640, 1020, 1400].map((x, i) => <Plant key={i} x={x} y={662} s={0.38} t={t} seed={i + 2} />)}
    <Glow x={960} y={460} r={700} o={0.35} />
    <Rain t={t} o={0.35} seed={92} />
  </g>
);

/** A classroom turned shelter: the board, windows on the rain, desks stacked at the right, mats on the floor with bags between families. */
export const SH = makeRoom({ x: 960, y: 480 }, { x0: 420, x1: 1500, y0: 220, y1: 740 }, 3.2);
export const Shelter: React.FC<{ t: number; id: string }> = ({ t, id }) => {
  const r = SH;
  const { P, Q } = r;
  const k = r.s(0.5) / r.s(0) * 0.42;
  const mat = (u0: number, u1: number, w0: number, w1: number, c: string) => <polygon points={Q([[u0, 1, w0], [u1, 1, w0], [u1, 1, w1], [u0, 1, w1]])} fill={c} stroke="#5A4A2E" strokeWidth={3} />;
  return (
    <g>
      <RoomShell r={r} id={id} floor="tiles" wall="#C8BC94" side="#ABA07C" floorC="#8A8270" ceiling="#4A463C" lines="#6A6250" />
      <rect x={P(0.2, 0, 0).x} y={P(0, 0.2, 0).y} width={P(0.62, 0, 0).x - P(0.2, 0, 0).x} height={P(0, 0.52, 0).y - P(0, 0.2, 0).y} fill="#3E5A48" stroke="#6A4A2E" strokeWidth={10} />
      <rect x={P(0.68, 0, 0).x} y={P(0, 0.2, 0).y} width={P(0.95, 0, 0).x - P(0.68, 0, 0).x} height={P(0, 0.6, 0).y - P(0, 0.2, 0).y} fill="#8E9AA4" stroke="#5A4A30" strokeWidth={10} />
      <Rain t={t} n={30} o={0.5} x0={P(0.68, 0, 0).x} y0={P(0, 0.2, 0).y} w={P(0.95, 0, 0).x - P(0.68, 0, 0).x} h={P(0, 0.6, 0).y - P(0, 0.2, 0).y} seed={95} />
      {/* desks stacked at the right */}
      <FloorShadow r={r} u={[0.78, 1]} w={[0.1, 0.5]} />
      <Box r={r} u={[0.8, 0.99]} v={[0.72, 1]} w={[0.12, 0.3]} front="#8A6440" top="#A07A50" side="#6E4C30" rim />
      <Box r={r} u={[0.8, 0.99]} v={[0.44, 0.72]} w={[0.14, 0.3]} front="#8A6440" top="#A07A50" side="#6E4C30" rim />
      <Box r={r} u={[0.8, 0.99]} v={[0.72, 1]} w={[0.32, 0.48]} front="#7E5A3A" top="#94704E" side="#6A4A2E" rim />
      {/* mats, a family to each, bags between */}
      {mat(0.04, 0.34, 0.3, 0.9, '#C8A860')}
      {mat(0.38, 0.72, 0.3, 0.9, '#B89A58')}
      {mat(0.04, 0.34, 0.02, 0.26, '#A88E50')}
      <Duffel x={P(0.36, 1, 0.5).x} y={P(0.36, 1, 0.5).y} s={k} />
      <Bundle x={P(0.36, 1, 0.75).x} y={P(0.36, 1, 0.75).y} s={k * 1.1} c="#4F7486" />
      <PlasticBag x={P(0.36, 1, 0.3).x} y={P(0.36, 1, 0.3).y} s={k} />
      <Bookcase x={P(0.1, 1, 0.03).x} y={P(0.1, 1, 0.03).y} s={r.s(0.03) / r.s(0) * 0.62} />
      <ShoeRack x={P(0.74, 1, 0.03).x} y={P(0.74, 1, 0.03).y} s={r.s(0.03) / r.s(0) * 0.42} />
      <Plant x={P(0.65, 1, 0.04).x} y={P(0.65, 1, 0.04).y} s={r.s(0.04) / r.s(0) * 0.42} t={t} tall />
      <Plant x={P(0.97, 1, 0.62).x} y={P(0.97, 1, 0.62).y} s={r.s(0.62) / r.s(0) * 0.38} t={t} seed={7} />
      <Glow x={P(0.5, 0.05, 0.5).x} y={P(0.5, 0.05, 0.5).y} r={700} o={0.45} />
      <LightVeil id={`${id}v`} lights={[[P(0.5, 0.2, 0.5).x, P(0.5, 0.2, 0.5).y, 800], [P(0.82, 0.4, 0).x, P(0.82, 0.4, 0).y, 300]]} o={0.4} />
    </g>
  );
};

/** The family photo, and the clear zip bag it goes into. */
export const Photo: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-150} y={-110} width={300} height={220} fill="#F4F0E4" stroke={L} strokeWidth={4} />
    <rect x={-130} y={-90} width={260} height={160} fill="#8EB0C4" />
    <rect x={-130} y={10} width={260} height={60} fill="#7A9A5E" />
    {[[-70, AN], [-10, HANH], [50, LINH]].map(([dx, lk], i) => {
      const l = lk as typeof AN;
      const s2 = i === 2 ? 0.7 : 1;
      return (
        <g key={i} transform={`translate(${dx} ${10 - (i === 2 ? 0 : 10)})`}>
          <rect x={-14 * s2} y={-30 * s2} width={28 * s2} height={50 * s2} rx={8} fill={l.jacket} />
          <circle cx={0} cy={-48 * s2} r={22 * s2} fill={l.skin} />
          <path d={`M ${-22 * s2} ${-52 * s2} Q 0 ${-80 * s2} ${22 * s2} ${-52 * s2}`} fill={l.hair} />
        </g>
      );
    })}
  </g>
);
export const ZipBag: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-190} y={-150} width={380} height={300} rx={12} fill="#DDE8EC" opacity={0.35} stroke="#8EA4AE" strokeWidth={5} />
    <rect x={-190} y={-150} width={380} height={18} fill="#4F86C6" opacity={0.8} />
  </g>
);

// ================================================================ the shots

// ---------- S1: the living room: a skin of water over the whole floor ----------
const FloorWater: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <polygon points={LIVING.Q([[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]])} fill={WATER} opacity={0.42} />
    {Array.from({ length: 8 }).map((_, i) => {
      const p = LIVING.P(0.1 + i * 0.11, 1, 0.3 + 0.08 * (i % 4));
      return <ellipse key={i} cx={p.x + 10 * Math.sin(t * 0.04 + i)} cy={p.y} rx={60} ry={6} fill="none" stroke="#DDE8EC" strokeWidth={3} opacity={0.5} />;
    })}
  </g>
);
export const S1: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 860], [len, 1000]]), 540, kf(t, [[0, 1.05], [len, 1.12]]))}>
    <LivingRoom id="c5s1" t={t} lamp={0} day="26" dog={false} veil={0.6} />
    <FloorWater t={t} />
  </g>
);

// ---------- S2: close: a chair leg and the cabinet's foot standing in the water ----------
export const S2: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.08]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#7A6A48" />
    <rect x={1100} y={-200} width={900} height={1000} fill="#5E4128" stroke="#3E2A18" strokeWidth={8} />
    <rect x={1100} y={560} width={900} height={60} fill="#4A3320" />
    {[[380, 0], [700, 1]].map(([x, i]) => <rect key={i} x={x} y={-200} width={70} height={980} fill="#6B4A2E" stroke="#3E2A18" strokeWidth={6} />)}
    <rect x={-200} y={760} width={2320} height={600} fill="#6A6A60" />
    <rect x={-200} y={720} width={2320} height={600} fill={WATER} opacity={0.75} />
    <path d={`M -200 ${722 + 3 * Math.sin(t * 0.1)} L 2120 ${722 - 3 * Math.sin(t * 0.1)}`} stroke="#DDE8EC" strokeWidth={4} opacity={0.7} />
    {[415, 735, 1300].map((x, i) => <ellipse key={i} cx={x} cy={724} rx={70 + 10 * Math.sin(t * 0.1 + i)} ry={8} fill="none" stroke="#DDE8EC" strokeWidth={3} opacity={0.6} />)}
    <rect x={1100} y={700} width={900} height={20} fill="#3A2818" opacity={0.6} />
  </g>
);

// ---------- S3: the radio on the cabinet: the evacuation notice ----------
export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 520, kf(t, [[0, 1.0], [len, 1.06]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#8E7A48" />
    <Glow x={900} y={300} r={700} o={0.3} />
    <rect x={-200} y={700} width={2320} height={600} fill="#5E4128" />
    <rect x={-200} y={690} width={2320} height={20} fill="#7A5636" />
    <Radio x={960} y={700} s={2.6} />
    {[0, 1, 2].map((i) => {
      const ph = (t * 0.05 + i / 3) % 1;
      return <path key={i} d={`M ${1260 + ph * 120} ${420 - ph * 30} q 30 60 0 120`} stroke="#F4E8C0" strokeWidth={6} fill="none" opacity={1 - ph} />;
    })}
  </g>
);

// ---------- S4: the veranda: the rescue boat comes alongside, a rescuer reaching out ----------
export const S4: React.FC<ShotProps> = ({ t, len }) => {
  const bx = kf(t, [[0, 1900], [36, 1200]]);
  return (
    <g transform={camT(940, 600, kf(t, [[0, 1.3], [len, 1.36]]))}>
      <AnHouse id="c5s4" t={t} w={2} rain={1} chair={false} pots={false} />
      <Hero look={HANH} pose={P({ x: 860, y: onFloor(748, 0.95), scale: 0.95, yaw: 0.5, look: 0.5, expr: 'worried', armL: { a: 10, b: 14 }, armR: { a: 14, b: 20 } }, t, 3)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P({ x: 760, y: onFloor(748, 0.7), scale: 0.7, yaw: 0.5, look: 0.5, expr: 'worried', armL: { a: 30, b: 60 }, armR: { a: -30, b: -60 } }, t, 4)} rimId="filmR" shadow={0} />
      <Flood t={t} y={728} x0={-400} x1={2300} o={0.9} h={700} seed={9} />
      <Boat x={bx} y={800} s={0.9}>
        <Hero look={RESCUE} pose={P({ x: 120, y: 20 - LEG_LEN, scale: 1.0, yaw: -0.6, look: -0.5, expr: 'neutral', armR: { a: -30, b: -40 }, armL: { a: 70 * kf(t, [[30, 0], [44, 1]]), b: 20 } }, t, 6)} rimId="filmR" shadow={0} />
      </Boat>
    </g>
  );
};

// ---------- S5: from UNDER the water, looking up: the boat's belly slides over, the pole stabs down, bubbles rise and fish cross the lens ----------
const Fish: React.FC<{ x: number; y: number; s?: number; c?: string; flip?: 1 | -1; t?: number }> = ({ x, y, s = 1, c = '#C9D2D6', flip = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${flip * s} ${s})`}>
    <g transform={`rotate(${14 * Math.sin(t * 0.6)} -52 0)`}>
      <path d="M -52 0 L -112 -34 Q -96 0 -112 34 Z" fill={c} stroke="#2A3A40" strokeWidth={4} strokeLinejoin="round" />
    </g>
    <ellipse cx={0} cy={0} rx={68} ry={26} fill={c} stroke="#2A3A40" strokeWidth={4} />
    <path d="M -44 8 Q 0 24 50 8" stroke="#F4F6F4" strokeWidth={10} fill="none" opacity={0.6} />
    <path d="M -10 -24 L 14 -48 L 34 -22 Z" fill={c} stroke="#2A3A40" strokeWidth={3} strokeLinejoin="round" />
    <circle cx={40} cy={-6} r={6} fill="#14181C" />
  </g>
);
const UnderWater: React.FC<{ t: number; len: number }> = ({ t, len }) => {
  const hx = kf(t, [[0, 220], [len, 1480]]);
  const sway = 5 * Math.sin(t * 0.07);
  return (
    <g transform={`translate(0 ${sway})`}>
      <defs>
        <linearGradient id="c5uw" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6E9AA0" />
          <stop offset="0.35" stopColor="#3E6670" />
          <stop offset="1" stopColor="#14282F" />
        </linearGradient>
      </defs>
      <rect x={-100} y={-100} width={2120} height={1280} fill="url(#c5uw)" />
      {/* light shafts from the rippled surface */}
      {Array.from({ length: 7 }).map((_, i) => (
        <polygon key={i} points={`${100 + i * 280},0 ${160 + i * 280},0 ${60 + i * 280 + 140 * Math.sin(t * 0.03 + i)},1100 ${-60 + i * 280 + 140 * Math.sin(t * 0.03 + i)},1100`} fill="#CFE8EC" opacity={0.07} />
      ))}
      {/* the surface seen from below: a bright wavy ceiling */}
      <path d={`M -100 -100 L 2020 -100 L 2020 120 ${Array.from({ length: 22 }).map((_, i) => `L ${2020 - i * 100} ${130 + 16 * Math.sin(t * 0.12 + i * 1.3)}`).join(' ')} Z`} fill="#B8D8DC" opacity={0.85} />
      <path d={`M -100 140 ${Array.from({ length: 22 }).map((_, i) => `L ${-100 + i * 100} ${140 + 16 * Math.sin(t * 0.12 + i * 1.3)}`).join(' ')}`} stroke="#EAF6F8" strokeWidth={8} fill="none" opacity={0.8} />
      {/* rain dimples on the ceiling */}
      {Array.from({ length: 10 }).map((_, i) => {
        const ph = (t * 0.07 + i * 0.31) % 1;
        return <ellipse key={i} cx={100 + 190 * i + 40 * rnd(2, i)} cy={150 + 20 * rnd(3, i)} rx={14 + 60 * ph} ry={5 + 12 * ph} fill="none" stroke="#EAF6F8" strokeWidth={4} opacity={0.7 * (1 - ph)} />;
      })}
      {/* the boat's belly, dark, with its orange rim, sliding across */}
      <g transform={`translate(${hx} 140)`}>
        <path d="M -420 0 Q -300 120 -80 130 L 220 130 Q 400 110 480 0 Z" fill="#7A3A1C" stroke="#2A140A" strokeWidth={8} strokeLinejoin="round" />
        <path d="M -380 20 Q -280 100 -80 108 L 200 108 Q 360 94 440 20" stroke="#A8541E" strokeWidth={10} fill="none" opacity={0.7} />
        {[-240, -100, 40, 180].map((x, i) => <path key={i} d={`M ${x} 20 L ${x + 14} 118`} stroke="#4A2410" strokeWidth={6} opacity={0.6} />)}
      </g>
      {/* the pole: a dark line stabbing down into the murk, a ring of foam where it enters */}
      <path d={`M ${hx + 330} 150 L ${hx + 470 + 20 * Math.sin(t * 0.1)} 820`} stroke="#2A1C10" strokeWidth={22} strokeLinecap="round" />
      <ellipse cx={hx + 334} cy={146} rx={50} ry={10} fill="none" stroke="#EAF6F8" strokeWidth={5} opacity={0.8} />
      {/* bubbles streaming up from the pole and drifting through the frame */}
      {Array.from({ length: 28 }).map((_, i) => {
        const ph = (t * (0.012 + 0.01 * rnd(4, i)) + rnd(5, i)) % 1;
        const x = (i % 2 ? hx + 440 : 160 + rnd(6, i) * 1600) + 28 * Math.sin(t * 0.08 + i);
        const y = 980 - ph * 860;
        const r = 5 + 16 * rnd(7, i);
        return <circle key={i} cx={x} cy={y} r={r} fill="none" stroke="#E8F6F8" strokeWidth={3} opacity={0.75 * (1 - ph * 0.5)} />;
      })}
      {/* fish crossing, some far, one big and near */}
      {[[0.16, 360, 0.5, '#B8C6CA', 1, 11], [0.1, 520, 0.7, '#D8A862', -1, 3], [0.22, 700, 0.55, '#B8C6CA', 1, 17], [0.14, 440, 0.4, '#C8D0D2', -1, 23]].map(([sp, y, sc, c, dir, off], i) => {
        const x = (dir as number) > 0 ? ((t * (sp as number) * 60 + (off as number) * 90) % 2500) - 300 : 2300 - ((t * (sp as number) * 60 + (off as number) * 90) % 2500);
        return <Fish key={i} x={x} y={(y as number) + 14 * Math.sin(t * 0.1 + i)} s={sc as number} c={c as string} flip={dir as 1 | -1} t={t + i * 5} />;
      })}
      <Foreground blur={8}>
        <Fish x={kf(t, [[0, -300], [len, 2300]])} y={kf(t, [[0, 700], [len, 640]])} s={2.2} c="#C9D2D6" flip={1} t={t} />
      </Foreground>
      <rect x={-100} y={-100} width={2120} height={1280} fill="#0A1418" opacity={0.18} />
    </g>
  );
};
export const S5: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <Tense t={t} a={1.5} tilt={kf(t, [[0, 2], [len, -2]])}>
      <UnderWater t={t} len={len} />
    </Tense>
    <Vignette o={0.65} id="S5" />
  </g>
);

// ---------- S6: the head of the alley, higher: the road out of the water, the van waiting ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 1050]]), 560, 1.0)}>
    <AlleyHead t={t} id="c5s6" />
  </g>
);

// ---------- S7: bà Sáu and Nam waiting against the wall ----------
export const S7: React.FC<ShotProps> = ({ t, len }) => (
<g>
<Tense t={t} a={0} tilt={0}>
  <g transform={camT(560, 600, kf(t, [[0, 1.5], [len, 1.56]]))}>
    <AlleyHead t={t} id="c5s7" />
    <Hero look={SAU} pose={P({ x: 400, y: onFloor(860, 1.0), scale: 1.0, yaw: 0.4, look: 0.5, expr: 'worried', armL: { a: 30, b: 60 }, armR: { a: -30, b: -60 } }, t, 2)} rimId="filmR" shadow={0} />
    <Duffel x={250} y={864} s={0.5} c="#6E5B7E" />
    <Hero look={NAM} pose={P({ x: 560, y: onFloor(866, 0.7), scale: 0.7, yaw: 0.3, look: 0.6, expr: 'neutral', armL: { a: 14, b: 14 }, armR: { a: 14, b: 14 } }, t, 5)} rimId="filmR" shadow={0} />
  </g>
</Tense>
<LensRain t={t} seed={3} />
<NearEdge side={-1} />
</g>
);

// ---------- S8: close: Hạnh's hand on the dog's leash, the dog at her feet ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.06]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#6E6A60" />
    <rect x={-200} y={760} width={2320} height={600} fill="#5E5E5A" />
    <Dog x={760} y={860} s={2.6} look={1} head={0.5 * Math.max(0, Math.sin(t * 0.08))} t={t} />
    <path d={`M 1060 ${640 + 10 * Math.sin(t * 0.1)} Q 1250 ${430} 1420 ${170}`} stroke="#C8322A" strokeWidth={10} fill="none" />
    <OpenHand x={1580} y={-40} rot={30} s={1.1} skin={HANH.skin} />
    <path d="M 1580 -40 l 200 -340" stroke={L} strokeWidth={152} strokeLinecap="round" />
    <path d="M 1580 -40 l 200 -340" stroke={HANH.jacket} strokeWidth={140} strokeLinecap="round" />
    <Rain t={t} n={70} near o={0.35} seed={8} />
  </g>
);

// ---------- S9: Linh hugging the bag with the photos and the seeds ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => {
  const pose = P({ x: 960, y: 760, scale: 1.4, yaw: 0.2, look: 0.1, headTilt: 8, expr: 'worried', armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } }, t, 4);
  const h1 = hand(pose, 'armL');
  const h2 = hand(pose, 'armR');
  return (
<g>
<Tense t={t} a={0} tilt={0}>
    <g transform={camT(960, kf(t, [[0, 640], [len, 520]]), kf(t, [[0, 1.15], [len, 2.4]]))}>
      <AlleyHead t={t} id="c5s9" van={false} />
      <Hero look={LINH} pose={pose} rimId="filmR" shadow={0} />
      <rect x={(h1.x + h2.x) / 2 - 90} y={(h1.y + h2.y) / 2 - 80} width={180} height={140} rx={24} fill="#3F7E8A" stroke={L} strokeWidth={5} />
      <path d={`M ${(h1.x + h2.x) / 2 - 60} ${(h1.y + h2.y) / 2 - 80} q 60 -60 120 0`} stroke={L} strokeWidth={8} fill="none" />
    </g>
</Tense>
<LensRain t={t} seed={4} />
<NearEdge side={1} />
</g>
  );
};

// ---------- S10: a gust: the rain goes sideways, the areca bends ----------
export const S10: React.FC<ShotProps> = ({ t, len }) => (
<g>
<Tense t={t} a={kf(t, [[0, 2], [14, 12]])} tilt={kf(t, [[0, 0], [14, 4]])}>
  <g transform={camT(1200, 560, kf(t, [[0, 1.1], [len, 1.16]]))}>
    <AlleyHead t={t} id="c5s10" wind={kf(t, [[0, 0.3], [14, 1]])} />
  </g>
</Tense>
<LensRain t={t} seed={5} />
</g>
);

// ---------- S11: bà Sáu's tarp snaps taut, then tears at the edge ----------
export const S11: React.FC<ShotProps> = ({ t, len }) => {
  const tear = kf(t, [[40, 0], [52, 1]]);
  return (
<g>
<Tense t={t} a={3 + 9 * kf(t, [[40, 0], [48, 1], [70, 0.3]])} tilt={-3}>
    <g transform={camT(960, 360, kf(t, [[0, 1.2], [len, 1.26]]))}>
      <ShopFront id="c5s11" t={t} tarp={1} wind={2 + 2 * tear} rain={1} />
      <Flood t={t} y={740} x0={-300} x1={2300} o={0.9} h={600} seed={19} />
      {tear > 0 ? (
        <g transform={`translate(1780 ${200}) rotate(${40 * tear + 12 * Math.sin(t * 0.8)})`}>
          <path d="M 0 0 L 160 30 L 120 70 L 170 110 L 20 90 Z" fill="#3A7482" stroke="#2A5864" strokeWidth={4} />
        </g>
      ) : null}
    </g>
</Tense>
<LensRain t={t} seed={6} />
</g>
  );
};

// ---------- S12: Nam startles and grabs his grandmother's hand ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => {
  const grab = kf(t, [[4, 0], [12, 1]]);
  return (
<g>
<Tense t={t} a={2 + 8 * kf(t, [[4, 0], [10, 1], [30, 0]])} tilt={2}>
    <g transform={camT(520, 560, 1.7)}>
      <AlleyHead t={t} id="c5s12" wind={0.8} />
      <Hero look={SAU} pose={P({ x: 400, y: onFloor(860, 1.0), scale: 1.0, yaw: 0.4, look: 0.6, expr: 'worried', armL: { a: 14, b: 14 }, armR: { a: 20 + 10 * grab, b: 20 } }, t, 2)} rimId="filmR" shadow={0} />
      <Hero look={NAM} pose={P({ x: 540 - 30 * grab, y: onFloor(866, 0.7), scale: 0.7, yaw: -0.4, look: -0.5, expr: grab > 0.5 ? 'shock' : 'neutral', armL: { a: 14, b: 14 }, armR: { a: -40 * grab, b: -30 * grab } }, t, 5)} rimId="filmR" shadow={0} />
    </g>
</Tense>

</g>
  );
};

// ---------- S13: a rescuer leads the group in behind the solid wall ----------
export const S13: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[0, 0], [len, 1]]);
  const walk = (x: number, s: number, seed: number) => ({ x: x - 260 * k, y: onFloor(870, s), scale: s, yaw: -0.6, look: -0.5, expr: 'neutral' as const, legL: { a: 18 * Math.sin(t * 0.45 + seed), b: -14 }, legR: { a: -18 * Math.sin(t * 0.45 + seed), b: -14 }, armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } });
  return (
    <g transform={camT(800, 560, 1.15)}>
      <AlleyHead t={t} id="c5s13" wind={0.6} />
      <Hero look={RESCUE} pose={P({ ...walk(900, 1.0, 0), armL: { a: -60, b: -20 } }, t, 6)} rimId="filmR" shadow={0} />
      <Hero look={SAU} pose={P(walk(1100, 0.95, 1), t, 2)} rimId="filmR" shadow={0} />
      <Hero look={NAM} pose={P(walk(1210, 0.68, 2), t, 5)} rimId="filmR" shadow={0} />
      <Hero look={HANH} pose={P(walk(1380, 0.95, 3), t, 3)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P(walk(1490, 0.68, 4), t, 4)} rimId="filmR" shadow={0} />
      <Hero look={AN} pose={P(walk(1640, 1.0, 5), t, 1)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S14: close: the rescuer calls out over the rain ----------
export const S14: React.FC<ShotProps> = ({ t, len }) => (
<g>
<Tense t={t} a={4} tilt={-4}>
  <g transform={camT(960, kf(t, [[0, 560], [len, 400]]), kf(t, [[0, 1.3], [len, 2.8]]))}>
    <AlleyHead t={t} id="c5s14" van={false} wind={0.4} />
    <Hero look={RESCUE} pose={P({ x: 960, y: 700, scale: 1.1, yaw: -0.2, look: -0.1, expr: 'shock', talk: talkAt(t, 2, len - 2) * 1.3, armL: { a: 14, b: 16 }, armR: { a: 120, b: 40 } }, t, 6)} rimId="filmR" shadow={0} />
  </g>
</Tense>
<LensRain t={t} seed={7} />
</g>
);

// ---------- S15: behind the wall: Hạnh draws Linh's hood down and holds her close ----------
export const S15: React.FC<ShotProps> = ({ t, len }) => {
  const pull = kf(t, [[4, 0], [20, 1]]);
  const lPose = P({ x: 600, y: onFloor(870, 0.72) + 4, scale: 0.72, yaw: 0.3, look: 0.4, headTilt: -6 * pull, expr: 'worried', armL: { a: 30, b: 60 }, armR: { a: -30, b: -60 } }, t, 4);
  const hd = toWorld(lPose, joints(lPose).head);
  return (
    <g transform={camT(560, 560, 1.8)}>
      <AlleyHead t={t} id="c5s15" wind={0.5} />
      <Hero look={HANH} pose={P({ x: 470, y: onFloor(870, 1.0), scale: 1.0, yaw: 0.5, look: 0.5, headTilt: 10, expr: 'worried', armL: { a: 10, b: 14 }, armR: { a: 44 + 8 * pull, b: 64 } }, t, 3)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={lPose} rimId="filmR" shadow={0} />
      <path d={`M ${hd.x - 62} ${hd.y + 10} Q ${hd.x} ${hd.y - 86 - 20 * (1 - pull)} ${hd.x + 62} ${hd.y + 10} L ${hd.x + 54} ${hd.y + 40} Q ${hd.x} ${hd.y - 50} ${hd.x - 54} ${hd.y + 40} Z`} fill="#D8692E" stroke={L} strokeWidth={4} opacity={0.95} />
    </g>
  );
};

// ---------- S16: An takes bà Sáu's bag and steadies her elbow over the dry step ----------
export const S16: React.FC<ShotProps> = ({ t, len }) => {
  const step = kf(t, [[20, 0], [50, 1]]);
  const sPose = P({ x: 820 + 60 * step, y: onFloor(870 - 30 * step, 0.95), scale: 0.95, yaw: 0.5, look: 0.4, tilt: 6, expr: 'worried', legL: { a: 20 * Math.sin(step * 3), b: -12 }, legR: { a: -10, b: -10 }, armL: { a: 12, b: 16 }, armR: { a: 30, b: 30 } }, t, 2);
  const aPose = P({ x: 1100, y: onFloor(840, 1.0), scale: 1.0, yaw: -0.5, look: -0.4, expr: 'neutral', armR: { a: -40, b: -40 }, armL: { a: 30, b: 50 } }, t, 1);
  const bag = hand(aPose, 'armL');
  return (
    <g transform={camT(960, 600, 1.55)}>
      <AlleyHead t={t} id="c5s16" />
      <rect x={760} y={840} width={500} height={34} fill="#8E8A80" stroke="#5E5A50" strokeWidth={4} />
      <Hero look={SAU} pose={sPose} rimId="filmR" shadow={0} />
      <Hero look={AN} pose={aPose} rimId="filmR" shadow={0} />
      <Duffel x={bag.x} y={bag.y + 80} s={0.45} c="#6E5B7E" />
    </g>
  );
};

// ---------- S17: wide behind the wall: everyone calling, saying it twice over the rain ----------
export const S17: React.FC<ShotProps> = ({ t, len }) => (
<g>
<Tense t={t} a={3} tilt={0}>
  <g transform={camT(700, 560, 1.15)}>
    <AlleyHead t={t} id="c5s17" wind={0.4} />
    {[[200, RESCUE, 1.0, 6], [380, SAU, 0.95, 2], [500, NAM, 0.68, 5], [700, HANH, 0.95, 3], [820, LINH, 0.68, 4], [1000, AN, 1.0, 1]].map(([x, lk, s, seed], i) => (
      <Hero key={i} look={lk as typeof AN} pose={P({ x: x as number, y: onFloor(870, s as number), scale: s as number, yaw: i % 2 ? 0.3 : -0.3, look: i % 2 ? 0.4 : -0.4, expr: 'worried', talk: talkAt(t + i * 7, 0, len) * (i % 2 ? 1 : 0.7), armL: { a: 12, b: 16 }, armR: { a: i === 0 ? 120 : 14, b: 30 } }, t, seed as number)} rimId="filmR" shadow={0} />
    ))}
  </g>
</Tense>
<LensRain t={t} seed={8} />
<NearEdge side={1} />
</g>
);

// ---------- S18: close: Linh, looking for Nam ----------
export const S18: React.FC<ShotProps> = ({ t, len }) => (
<g>
<Tense t={t} a={2} tilt={0}>
  <g transform={camT(960, kf(t, [[0, 600], [len, 480]]), kf(t, [[0, 1.3], [len, 2.9]]))}>
    <AlleyHead t={t} id="c5s18" van={false} />
    <Hero look={LINH} pose={P({ x: 960, y: 700, scale: 1.2, yaw: kf(t, [[0, 0.5], [16, -0.3]]), look: kf(t, [[0, 0.6], [16, -0.4]]), expr: 'worried', talk: talkAt(t, 8, len - 2), armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
</Tense>
<Vignette o={0.35} id="S18" />
</g>
);

// ---------- S19: close: Hạnh answers, pointing behind bà Sáu ----------
export const S19: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(900, kf(t, [[0, 600], [len, 470]]), kf(t, [[0, 1.3], [len, 2.8]]))}>
    <AlleyHead t={t} id="c5s19" />
    <Hero look={HANH} pose={P({ x: 900, y: 700, scale: 1.1, yaw: 0.3, look: 0.4, headTilt: 8, expr: 'neutral', talk: talkAt(t, 2, len - 2), armL: { a: 10, b: 14 }, armR: { a: 80, b: 10 } }, t, 3)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S20: over Hạnh's shoulder: Linh looks up at her mother ----------
export const S20: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(1000, 560, 1.8)}>
      <AlleyHead t={t} id="c5s20" van={false} />
      <Hero look={LINH} pose={P({ x: 1050, y: onFloor(870, 0.72), scale: 0.72, yaw: -0.2, look: -0.2, headTilt: -14, expr: 'neutral', armL: { a: 30, b: 60 }, armR: { a: -30, b: -60 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
    <Foreground blur={3}>
      <Back look={HANH} pose={P({ x: kf(t, [[0, 520], [len, 490]]), y: 1300, scale: 2.4, armL: { a: 8, b: 6 }, armR: { a: 8, b: 6 } })} />
    </Foreground>
  </g>
);

// ---------- S21: the van about to go; the coordinator steps out and raises his hand ----------
export const S21: React.FC<ShotProps> = ({ t, len }) => {
  const stop = kf(t, [[18, 0], [30, 1]]);
  return (
<g>
<Tense t={t} a={2 + 6 * kf(t, [[18, 0], [28, 1]])} tilt={kf(t, [[18, 0], [30, 5]])}>
    <g transform={camT(1200, 560, 1.15)}>
      <AlleyHead t={t} id="c5s21" />
      <Hero look={COORD} pose={P({ x: 1820, y: onFloor(840, 1.0), scale: 1.0, yaw: -0.4, look: -0.5, expr: 'worried', armR: { a: 12, b: 16 }, armL: { a: 20 + 84 * stop, b: 20 + 32 * stop } }, t, 7)} rimId="filmR" shadow={0} />
    </g>
</Tense>
<Vignette o={0.45} id="S21" />
</g>
  );
};

// ---------- S22: the short road up the hill: closed, the barrier and the sign ----------
export const S22: React.FC<ShotProps> = ({ t, len }) => (
<g>
<Tense t={t} a={1.5} tilt={0}>
  <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.06]]))}>
    <Hill t={t} />
    <Barrier x={960} y={900} s={0.9} />
  </g>
</Tense>
<Vignette o={0.5} id="S22" />
<LensRain t={t} seed={9} />
</g>
);

// ---------- S23: the slope: the soil soaked for days, water seeping out of it ----------
export const S23: React.FC<ShotProps> = ({ t, len }) => (
<g>
<Tense t={t} a={0} tilt={0}>
  <g transform={camT(700, 500, kf(t, [[0, 1.5], [len, 1.6]]))}>
    <Hill t={t} trickle={1} />
  </g>
</Tense>
<Vignette o={0.5} id="S23" />
</g>
);

// ---------- S24: further on, from a safe distance: the slide across the road ----------
export const S24: React.FC<ShotProps> = ({ t, len }) => (
<g>
<Tense t={t} a={3} tilt={0}>
  <g transform={camT(1150, 520, kf(t, [[0, 1.1], [len, 1.2]]))}>
    <Hill t={t} slide={1} trickle={0.6} />
  </g>
</Tense>
<Vignette o={0.55} id="S24" />
</g>
);

// ---------- S25: the van waits; the coordinator on his radio for the other route ----------
export const S25: React.FC<ShotProps> = ({ t, len }) => (
<g>
<Tense t={t} a={0} tilt={0}>
  <g transform={camT(1300, 560, 1.3)}>
    <AlleyHead t={t} id="c5s25" />
    <Hero look={COORD} pose={P({ x: 1820, y: onFloor(840, 1.0), scale: 1.0, yaw: -0.3, look: -0.2, headTilt: 10, expr: 'neutral', talk: talkAt(t, 10, 60), armR: { a: 12, b: 16 }, armL: { a: 40, b: 120 } }, t, 7)} rimId="filmR" shadow={0} />
  </g>
</Tense>
<LensRain t={t} seed={10} />
<NearEdge side={-1} />
</g>
);

// ---------- S26: inside the van: An counts the group, one by one ----------
const seated = (x: number, look: typeof AN, s: number, seed: number, t: number, extra: Partial<ReturnType<typeof P>> = {}) => (
  <Hero look={look} pose={P({ x, y: 740 - 70 * s, scale: s, yaw: 0.1, look: 0.1, expr: 'neutral', ...sit(1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 }, ...extra }, t, seed)} rimId="filmR" shadow={0} />
);
export const S26: React.FC<ShotProps> = ({ t, len }) => {
  const n = Math.min(3, Math.floor(kf(t, [[20, 0], [len - 8, 4]])));
  const xs = [520, 760, 1060, 1300];
  return (
    <g transform={camT(960, 520, 1.1)}>
      <VanIn t={t} id="c5s26" roofs={0.6} />
      {seated(520, HANH, 1.0, 3, t)}
      {seated(760, LINH, 0.72, 4, t)}
      {seated(1060, SAU, 0.95, 2, t)}
      {seated(1300, NAM, 0.7, 5, t)}
      <Hero look={AN} pose={P({ x: 1640, y: onFloor(1000, 1.2), scale: 1.2, yaw: -0.6, look: -0.6, expr: 'neutral', armL: { a: 70 + 6 * n, b: 10 }, armR: { a: 10, b: 14 } }, t, 1)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S27: he sits down at last and breathes out ----------
export const S27: React.FC<ShotProps> = ({ t, len }) => {
  const down = kf(t, [[6, 0], [24, 1]]);
  const breathe = kf(t, [[34, 0], [60, 1], [90, 0]]);
  return (
    <g transform={camT(1000, 480, kf(t, [[30, 2.0], [len, 1.6]]))}>
      <VanIn t={t} id="c5s27" roofs={0.6} />
      <Hero look={AN} pose={P({ x: 1000, y: 740 - 70 * 1.1 - 100 * (1 - down), scale: 1.1, yaw: 0.2, look: 0.1, headTilt: 10 * breathe, tilt: -6 * breathe, expr: breathe > 0.4 ? 'tired' : 'neutral', ...(down > 0.6 ? sit(1) : {}), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 1)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S28: from INSIDE the bag looking up: Linh's face above, her hands on the opening, the photo at the camera's feet ----------
export const S28: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[0, 1.0], [len, 1.18]]);
  const peek = kf(t, [[0, 0], [24, 1]]);
  const pose = P({ x: 960, y: 1010, scale: 3.3, yaw: 0.05, look: 0.0, headTilt: 6 + 5 * peek, tilt: -3, expr: 'worried', armL: { a: 58, b: 34 }, armR: { a: 58, b: 34 } }, t, 4);
  return (
    <g>
      <Tense t={t} a={2.5} tilt={0}>
        <g transform={camT(960, 540, k)}>
          <rect x={-300} y={-300} width={2520} height={1700} fill="#4A4E58" />
          <Glow x={960} y={60} r={900} o={0.55} />
          <Glow x={960} y={60} r={220} o={0.9} />
          <Hero look={LINH} pose={pose} rimId="filmR" shadow={0} />
        </g>
      </Tense>
      {/* the bag's inside: dark teal fabric all round the opening, the zip's teeth along the rim */}
      <path fillRule="evenodd" d="M -200 -200 L 2120 -200 L 2120 1280 L -200 1280 Z M 960 40 C 1500 40 1860 300 1860 600 C 1860 900 1560 1080 960 1080 C 360 1080 60 900 60 600 C 60 300 420 40 960 40 Z" fill="#1E5058" />
      <path d="M 960 40 C 1500 40 1860 300 1860 600 C 1860 900 1560 1080 960 1080 C 360 1080 60 900 60 600 C 60 300 420 40 960 40 Z" fill="none" stroke="#E8E0CC" strokeWidth={14} strokeDasharray="10 8" opacity={0.9} />
      {[[120, 420, 70], [1800, 500, -70], [260, 900, 40], [1660, 920, -40], [960, 1180, 0]].map(([x, y, r], i) => (
        <path key={i} d={`M ${x} ${y} q 60 -120 20 -260`} transform={`rotate(${r} ${x} ${y})`} stroke="#0E3238" strokeWidth={26} fill="none" strokeLinecap="round" opacity={0.7} />
      ))}
      {/* her hands holding the opening open, one each side */}
            <Foreground blur={6}>
        <Photo x={1280} y={1010} s={1.1 * kf(t, [[0, 0.8], [20, 1]])} r={-14} />
      </Foreground>
      <Vignette o={0.55} id="S28" />
    </g>
  );
};

// ---------- S29: back home, meanwhile: the empty heavy frame on the low cabinet, the table and chairs in the water ----------
export const S29: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 560], [len, 640]]), 600, 1.9)}>
    <LivingRoom id="c5s29" t={t} lamp={0} day="26" dog={false} veil={0.6} />
    <FloorWater t={t} />
    <rect x={LIVING.P(0.29, 0.73, 0.05).x - 34} y={LIVING.P(0.29, 0.73, 0.05).y - 80} width={68} height={70} fill="#2A2420" />
  </g>
);

// ---------- S30: An's hands check the medicine pouch and the water ----------
export const S30: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.06]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#2E5E9A" />
    <rect x={-200} y={-200} width={2320} height={300} fill="#24466E" />
    <rect x={700} y={420} width={300} height={200} rx={20} fill="#E8E0CC" stroke={L} strokeWidth={6} />
    <path d="M 850 470 L 850 570 M 800 520 L 900 520" stroke="#C8322A" strokeWidth={22} />
    {[1150, 1270, 1390].map((x, i) => (
      <g key={i}>
        <rect x={x - 46} y={300} width={92} height={330} rx={30} fill="#A8C8D8" stroke={L} strokeWidth={5} />
        <rect x={x - 24} y={262} width={48} height={42} rx={6} fill="#3F7E8A" stroke={L} strokeWidth={4} />
      </g>
    ))}
    <OpenHand x={kf(t, [[0, 600], [30, 760], [60, 1200]])} y={-60} rot={0} s={1.2} skin={AN.skin} />
    <rect x={kf(t, [[0, 600], [30, 760], [60, 1200]]) - 110} y={-500} width={200} height={460} fill={AN.jacket} stroke={L} strokeWidth={6} />
  </g>
);

// ---------- S31: low: the dog curled at Hạnh's feet beside its bag of food ----------
export const S31: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 600, kf(t, [[0, 1.0], [len, 1.05]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#26282E" />
    <rect x={-200} y={-200} width={2320} height={500} fill="#24466E" />
    <path d="M 1400 -200 L 1400 820 M 1600 -200 L 1640 820" stroke={HANH.limb} strokeWidth={90} />
    <ellipse cx={1420} cy={830} rx={70} ry={26} fill={HANH.shoe} />
    <ellipse cx={1650} cy={830} rx={70} ry={26} fill={HANH.shoe} />
    <Dog x={860} y={860} s={2.4} look={0} head={-0.1} t={t * 0.3} />
    <g transform="translate(400 860)">
      <path d="M -110 0 L -120 -260 Q 0 -300 120 -260 L 110 0 Z" fill="#C8A060" stroke={L} strokeWidth={5} />
      <circle cx={0} cy={-140} r={50} fill="#8A5E38" />
    </g>
  </g>
);

// ---------- S32: close: Linh asks if they really left the frame ----------
export const S32: React.FC<ShotProps> = ({ t, len }) => (
<g>
<Tense t={t} a={0} tilt={0}>
  <g transform={camT(940, kf(t, [[0, 600], [len, 470]]), kf(t, [[0, 1.3], [len, 3.0]]))}>
    <VanIn t={t} id="c5s32" />
    <Hero look={LINH} pose={P({ x: 940, y: 700, scale: 1.2, yaw: 0.3, look: 0.4, headTilt: -8, expr: 'worried', talk: talkAt(t, 2, len - 3), armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
</Tense>
<Vignette o={0.4} id="S32" />
</g>
);

// ---------- S33: through the van's window: the roofs of the neighbourhood fading into the rain ----------
export const S33: React.FC<ShotProps> = ({ t, len }) => (
<g>
<Tense t={t} a={0} tilt={0}>
  <g transform={camT(960, 380, kf(t, [[0, 1.9], [len, 2.0]]))}>
    <VanIn t={t} id="c5s33" roofs={kf(t, [[0, 1], [len, 0.15]])} />
  </g>
</Tense>
<NearEdge side={1} />
</g>
);

// ---------- S34: close: An, softly, remembering ----------
export const S34: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(980, kf(t, [[0, 600], [len, 450]]), kf(t, [[0, 1.3], [len, 2.8]]))}>
    <VanIn t={t} id="c5s34" />
    <Hero look={AN} pose={P({ x: 980, y: 690, scale: 1.1, yaw: -0.4, look: -0.3, headTilt: 8, expr: 'neutral', talk: talkAt(t, 2, len - 2), armL: { a: 10, b: 16 }, armR: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S35: close: Linh: "I wanted it up before Mum came home" ----------
export const S35: React.FC<ShotProps> = ({ t, len }) => (
<g>
<Tense t={t} a={0} tilt={0}>
  <g transform={camT(940, kf(t, [[0, 600], [len, 470]]), kf(t, [[0, 1.3], [len, 3.0]]))}>
    <VanIn t={t} id="c5s35" />
    <Hero look={LINH} pose={P({ x: 940, y: 700, scale: 1.2, yaw: 0.35, look: 0.4, headTilt: 6, expr: 'worried', talk: talkAt(t, 2, len - 3), armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
</Tense>
<Vignette o={0.4} id="S35" />
</g>
);

// ---------- S36: extreme close: An's hand smooths the edge of the photo bag ----------
export const S36: React.FC<ShotProps> = ({ t, len }) => {
  const x = kf(t, [[0, 520], [len, 1240]]);
  return (
    <g transform={camT(960, 560, 1.0)}>
      <rect x={-200} y={-200} width={2320} height={1500} fill="#24466E" />
      <rect x={360} y={360} width={1200} height={560} rx={40} fill="#3F7E8A" stroke={L} strokeWidth={8} />
      <path d="M 360 470 L 1560 470" stroke="#2E5E66" strokeWidth={10} />
      <path d={`M 380 470 L ${x} 470`} stroke="#5E9EA8" strokeWidth={10} />
      <OpenHand x={x} y={170} rot={-8} s={1.1} skin={AN.skin} />
      <rect x={x - 110} y={-300} width={200} height={470} fill={AN.jacket} stroke={L} strokeWidth={6} transform={`rotate(-8 ${x} 170)`} />
    </g>
  );
};

// ---------- S37: two-shot on the bench: An explains why the frame stayed ----------
export const S37: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 500, 1.6)}>
    <VanIn t={t} id="c5s37" />
    {seated(820, LINH, 0.72, 4, t, { yaw: 0.4, look: 0.5, headTilt: -8, expr: 'worried', armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } })}
    {seated(1080, AN, 1.1, 1, t, { yaw: -0.4, look: -0.5, headTilt: 8, talk: talkAt(t, 2, len - 2) })}
  </g>
);

// ---------- S38: extreme close: the photo in the bag: the three of them ----------
export const S38: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.12]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#3F7E8A" />
    <Glow x={900} y={400} r={800} o={0.35} />
    <Photo x={960} y={540} s={2.6} r={-3} />
  </g>
);

// ---------- S39: close: Linh, the photo in her lap: "Con vẫn tiếc" ----------
export const S39: React.FC<ShotProps> = ({ t, len }) => (
<g>
<Tense t={t} a={0} tilt={0}>
  <g transform={camT(940, kf(t, [[0, 600], [len, 470]]), kf(t, [[0, 1.3], [len, 3.0]]))}>
    <VanIn t={t} id="c5s39" />
    <Hero look={LINH} pose={P({ x: 940, y: 700, scale: 1.2, yaw: 0.1, look: 0, headTilt: 16, expr: 'worried', talk: talkAt(t, 30, len - 2), armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
</Tense>
<Vignette o={0.45} id="S39" />
</g>
);

// ---------- S40: two-shot: "Bố cũng tiếc" — he draws her close ----------
export const S40: React.FC<ShotProps> = ({ t, len }) => {
  const close = kf(t, [[10, 0], [36, 1]]);
  return (
    <g transform={camT(980, 500, 1.6)}>
      <VanIn t={t} id="c5s40" />
      {seated(820 + 60 * close, LINH, 0.72, 4, t, { yaw: 0.3, look: 0.4, headTilt: 8 * close, expr: 'neutral', armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } })}
      {seated(1080, AN, 1.1, 1, t, { yaw: -0.4, look: -0.5, headTilt: 8, expr: 'neutral', talk: talkAt(t, 2, len - 2), armR: { a: 14, b: 32 }, armL: { a: -20 - 40 * close, b: -50 } })}
    </g>
  );
};

// ---------- S41: straight down: she slides the photo into the zip bag, beside the seed box ----------
export const S41: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[6, 0], [40, 1]]);
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.06]]))}>
      <rect x={-200} y={-200} width={2320} height={1500} fill="#3F7E8A" />
      <ZipBag x={760} y={560} s={1.6} />
      <rect x={1240} y={420} width={420} height={260} rx={14} fill="#D8C8A0" stroke={L} strokeWidth={6} />
      <rect x={1230} y={404} width={440} height={50} rx={10} fill="#C8B488" stroke={L} strokeWidth={6} />
      <Photo x={760} y={560 + 520 * (1 - k)} s={1.5} />
      <OpenHand x={600} y={560 + 520 * (1 - k) + 200} rot={180} s={1.0} skin={LINH.skin} />
      <OpenHand x={920} y={560 + 520 * (1 - k) + 200} rot={180} s={1.0} skin={LINH.skin} />
    </g>
  );
};

// ---------- S42: An by the window, side-on: this time he names no day ----------
export const S42: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(900, kf(t, [[0, 580], [len, 440]]), kf(t, [[0, 1.4], [len, 2.5]]))}>
    <VanIn t={t} id="c5s42" roofs={0.2} />
    <Hero look={AN} pose={P({ x: 900, y: 690, scale: 1.1, yaw: 0.85, look: 0.8, headTilt: 4, expr: 'neutral', armL: { a: 10, b: 16 }, armR: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S43: the van comes up to the school on the high ground ----------
export const S43: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, 1.0)}>
    <School t={t} van={kf(t, [[0, 0], [len, 0.85]])} />
  </g>
);

// ---------- S44: high wide: the school on its open platform; the slope with its scar far off ----------
export const S44: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 1020]]), 520, 0.9)}>
    <School t={t} />
    <g transform="translate(1700 280) scale(0.35)">
      <path d="M 0 400 Q 300 0 700 200 L 900 400 Z" fill="#4E6248" />
      <path d="M 380 80 Q 450 200 520 380 L 420 400 Q 400 240 380 80 Z" fill="#7A5A3A" />
    </g>
  </g>
);

// ---------- S45: the classroom turned shelter: desks pushed aside, a mat for each family, bags between ----------
export const S45: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 860], [len, 1060]]), 540, 1.05)}>
    <Shelter t={t} id="c5s45" />
    <Hero look={SAU} pose={P({ ...stand(SH, 0.55, 0.62), yaw: -0.3, look: -0.4, expr: 'neutral', ...sit(-1), y: SH.P(0.55, 1, 0.62).y - 88 * stand(SH, 0.55, 0.62).scale, armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 2)} rimId="filmR" shadow={0} />
    <Hero look={NAM} pose={P({ ...stand(SH, 0.64, 0.7), scale: stand(SH, 0.64, 0.7).scale * 0.72, yaw: -0.3, look: -0.4, expr: 'neutral', ...sit(-1), y: SH.P(0.64, 1, 0.7).y - 88 * stand(SH, 0.64, 0.7).scale * 0.72, armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 5)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S46: Hạnh spreads the blanket on their mat ----------
export const S46: React.FC<ShotProps> = ({ t, len }) => {
  const h = stand(SH, 0.2, 0.62);
  const spread = kf(t, [[4, 0], [26, 1]]);
  const pose = P({ x: h.x, y: h.y, scale: h.scale, yaw: 0.4, look: 0.3, tilt: 26 - 16 * spread, headTilt: 10, expr: 'neutral', armL: { a: 40 + 20 * spread, b: 30 }, armR: { a: 40 + 20 * spread, b: 30 } }, t, 3);
  const a = hand(pose, 'armL');
  const b = hand(pose, 'armR');
  const floor = SH.P(0.2, 1, 0.62).y;
  return (
    <g transform={camT(760, 560, 1.4)}>
      <Shelter t={t} id="c5s46" />
      <path d={`M ${a.x} ${a.y} L ${b.x} ${b.y} L ${b.x + 40 * spread} ${floor} L ${a.x - 40 * spread} ${floor} Z`} fill="#B5604F" stroke={L} strokeWidth={4} opacity={0.95} />
      <Hero look={HANH} pose={pose} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S47: Linh sits down on the blanket, both hands round the bag; she zips it and leans on her father ----------
export const S47: React.FC<ShotProps> = ({ t, len }) => {
  const l = stand(SH, 0.22, 0.72);
  const a = stand(SH, 0.12, 0.7);
  const lean = kf(t, [[len - 90, 0], [len - 50, 1]]);
  const lScale = l.scale * 0.72;
  const lPose = P({ x: l.x - 40 * lean, y: SH.P(0.22, 1, 0.72).y - 70 * lScale, scale: lScale, yaw: -0.2, look: -0.2, headTilt: -10 * lean, expr: 'neutral', ...sit(1), armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } }, t, 4);
  const h1 = hand(lPose, 'armL');
  const h2 = hand(lPose, 'armR');
  return (
    <g transform={camT(kf(t, [[0, 900], [len, 760]]), kf(t, [[0, 600], [len, 620]]), kf(t, [[0, 1.2], [len, 1.9]]))}>
      <Shelter t={t} id="c5s47" />
      <polygon points={SH.Q([[0.08, 1, 0.6], [0.3, 1, 0.6], [0.3, 1, 0.86], [0.08, 1, 0.86]])} fill="#B5604F" stroke={L} strokeWidth={3} />
      <Hero look={AN} pose={P({ x: a.x, y: SH.P(0.12, 1, 0.7).y - 70 * a.scale, scale: a.scale, yaw: 0.3, look: 0.3, expr: 'neutral', ...sit(1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={lPose} rimId="filmR" shadow={0} />
      <rect x={(h1.x + h2.x) / 2 - 70} y={(h1.y + h2.y) / 2 - 60} width={140} height={110} rx={20} fill="#3F7E8A" stroke={L} strokeWidth={5} />
      <path d={`M ${(h1.x + h2.x) / 2 - 64} ${(h1.y + h2.y) / 2 - 40} L ${(h1.x + h2.x) / 2 - 64 + 128 * kf(t, [[20, 0], [50, 1]])} ${(h1.y + h2.y) / 2 - 40}`} stroke="#E8E0CC" strokeWidth={6} />
    </g>
  );
};

export const SHOTS = {
  S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24,
  S25, S26, S27, S28, S29, S30, S31, S32, S33, S34, S35, S36, S37, S38, S39, S40, S41, S42, S43, S44, S45, S46, S47,
};
