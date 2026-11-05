import React from 'react';
import {
  Hero, Pose, poseAt, kf, rnd, camT, LOOKS, joints, toWorld, makeRoom, RoomShell, Box, FloorShadow, stand,
  AnHouse, YARD, Alley, alleyP, TownView, LivingRoom, Rain, Splashes, CloudBank, Foreground, Glow, LightVeil, Dust, FONT, ShotProps,
} from '../../engine';
import { live, P, talkAt, Back, HandTop, ShopFront } from '../mua-100-c01/shots';
import { Seat } from '../mua-100-c02/shots';

// Cảnh 3 — Ngày 7: Nước chưa kịp tới. The water is a number, not a mood: about 0,30 m in the alley; bà Sáu's shop
// (floor +0,20 m) is in it, An's veranda (+0,45 m) and living room (+0,60 m) are still above it. Linh and her father
// talk upstairs on the gác, then the house starts to be packed.

const AN = LOOKS.an;
const HANH = LOOKS.hanh;
const LINH = LOOKS.linh;
const SAU = LOOKS.baSau;

const WATER = '#6A7A80';
/** A sheet of standing water: a tinted band with the rain's rings on it. */
const Flood: React.FC<{ t: number; y: number; x0?: number; x1?: number; o?: number; rain?: number; h?: number; seed?: number }> = ({ t, y, x0 = -300, x1 = 2220, o = 0.9, rain = 1, h = 700, seed = 3 }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={h} fill={WATER} opacity={o} />
    <rect x={x0} y={y} width={x1 - x0} height={5} fill="#C9D8DF" opacity={0.55} />
    <Splashes t={t} x0={x0} x1={x1} y0={y + 8} y1={y + h * 0.5} n={54} o={0.55 * rain} seed={seed} />
  </g>
);

const sit = (facing: 1 | -1): Partial<Pose> => ({ facing, legL: { a: 76, b: -76 }, legR: { a: 70, b: -70 } });

// ---------------------------------------------------------------- the gác
const ATT = makeRoom({ x: 960, y: 470 }, { x0: 500, x1: 1420, y0: 250, y1: 700 }, 3.1);
const WIN = { x0: 840, x1: 1200, y0: 320, y1: 580 };
const BULB = (() => {
  const p = ATT.P(0.5, 0.1, 0.46);
  return { x: p.x, y: p.y };
})();
/** Hip point and scale for someone sitting on the floor mat at (u, w). */
const sitAt = (u: number, w: number, k = 1) => {
  const s = stand(ATT, u, w);
  const floor = ATT.P(u, 1, w).y;
  const sc = s.scale * k;
  return { x: s.x, y: floor - 88 * sc, scale: sc, floor };
};
/** The chair under an adult (back behind him) and the stool under a child, drawn before the figure. */
const ChairFor: React.FC<{ at: { x: number; y: number; scale: number }; back?: number; child?: boolean }> = ({ at, back = -1, child = false }) => (
  <Seat x={at.x - 2 * at.scale} top={at.y + 12 * at.scale} floor={at.y + 88 * at.scale} w={(child ? 100 : 130) * at.scale} back={child ? 0 : back} />
);
/** Things to carry, drawn standing on the floor at (x, y = the floor under them). */
const Duffel: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = '#6E5B7E' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={96} ry={13} fill="#000" opacity={0.32} />
    <path d="M -70 -20 Q -70 -90 0 -92 Q 70 -90 70 -20 Q 70 0 40 0 L -40 0 Q -70 0 -70 -20 Z" fill={c} stroke="#16141C" strokeWidth={4} strokeLinejoin="round" />
    <path d="M 14 -90 Q 70 -86 70 -20 Q 70 0 40 0 L 20 0 Q 40 -40 14 -90 Z" fill="#000" opacity={0.2} />
    <path d="M -70 -48 Q 0 -40 70 -48" stroke="#16141C" strokeWidth={4} fill="none" opacity={0.6} />
    <path d="M -30 -92 Q 0 -128 30 -92" stroke="#16141C" strokeWidth={8} fill="none" strokeLinecap="round" />
    <rect x={-70} y={-34} width={30} height={36} rx={8} fill="#000" opacity={0.18} />
  </g>
);
/** A folded blanket rolled up and strapped. */
const Bundle: React.FC<{ x: number; y: number; s?: number; c?: string; lying?: boolean }> = ({ x, y, s = 1, c = '#B5604F', lying = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={92} ry={12} fill="#000" opacity={0.3} />
    <rect x={-80} y={-66} width={160} height={66} rx={30} fill={c} stroke="#16141C" strokeWidth={4} />
    <ellipse cx={-70} cy={-33} rx={14} ry={31} fill="#000" opacity={0.18} />
    {[-30, 30].map((dx) => <rect key={dx} x={dx - 5} y={-66} width={10} height={66} fill="#D8C8A0" stroke="#16141C" strokeWidth={2} />)}
    {lying ? null : null}
  </g>
);
const PlasticBag: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={3} rx={44} ry={8} fill="#000" opacity={0.3} />
    <path d="M -34 0 Q -44 -50 -12 -64 L -8 -80 L 8 -80 L 12 -64 Q 44 -50 34 0 Z" fill="#D8D4C4" stroke="#16141C" strokeWidth={3} strokeLinejoin="round" opacity={0.95} />
    <path d="M -14 -66 Q 0 -74 14 -66" stroke="#16141C" strokeWidth={3} fill="none" />
    <path d="M -20 -30 Q -4 -24 8 -34" stroke="#8E8A78" strokeWidth={3} fill="none" />
  </g>
);
/** The pile in the left corner: the bedding at first, then bags as the house is packed. */
const Pile: React.FC<{ r: typeof ATT; n: number }> = ({ r, n }) => {
  const f = r.P(0.1, 1, 0.42);
  const k = r.s(0.42) * 0.78;
  return (
    <g>
      <Bundle x={f.x - 20 * k} y={f.y} s={k} c="#4F7486" />
      {n >= 1 ? <Duffel x={f.x + 150 * k} y={f.y + 6 * k} s={k} /> : null}
      {n >= 1 ? <PlasticBag x={f.x + 60 * k} y={f.y + 26 * k} s={k} /> : null}
      {n >= 2 ? <Bundle x={f.x - 20 * k} y={f.y - 66 * k} s={k * 0.92} c="#B5604F" /> : null}
      {n >= 2 ? <Duffel x={f.x + 150 * k} y={f.y - 88 * k} s={k * 0.9} c="#5E5C44" /> : null}
    </g>
  );
};
const TABLE_TOP = (u: number, w: number) => ATT.P(u, 0.855, w);

/** The map on the table, flat: paper, mountains at the top, the river winding down to the town. */
const MapSheet: React.FC<{ flow?: number; trace?: number; big?: boolean }> = ({ flow = 0, trace = 0, big = false }) => {
  const d = 'M 130 40 C 150 130 60 150 100 240 S 220 300 190 400 S 120 470 170 540';
  return (
    <g>
      <rect x={0} y={0} width={320} height={600} rx={6} fill="#EBE0C4" stroke="#8A7A58" strokeWidth={5} />
      {[[40, 30, 70], [140, 14, 90], [230, 40, 60], [90, 70, 50], [190, 76, 56]].map(([x, y, w], i) => (
        <path key={i} d={`M ${x} ${y + w * 0.7} L ${x + w / 2} ${y} L ${x + w} ${y + w * 0.7} Z`} fill="#8E8A64" stroke="#5E5A3C" strokeWidth={3} />
      ))}
      <path d={d} stroke="#6A8FA6" strokeWidth={18} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#9CC3D8" strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray="22 26" strokeDashoffset={-flow * 2.2} />
      {[[210, 520], [236, 540], [250, 506], [200, 548]].map(([x, y], i) => <rect key={i} x={x} y={y} width={22} height={18} fill="#B5604F" stroke="#5E3228" strokeWidth={2} />)}
      <circle cx={170} cy={540} r={13} fill="none" stroke="#C8322A" strokeWidth={5} />
      {trace > 0 ? <path d={d} stroke="#C8322A" strokeWidth={5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${trace} 2`} opacity={0.85} /> : null}
      {big ? <path d="M 20 580 L 300 580" stroke="#8A7A58" strokeWidth={3} /> : null}
    </g>
  );
};

const Attic: React.FC<{ id: string; t: number; veil?: number; map?: boolean; flow?: number; bags?: number }> = ({ id, t, veil = 0.52, map = false, flow = 0, bags = 0 }) => {
  const r = ATT;
  const { P, Q } = r;
  const mat = Q([[0.16, 1, 0.34], [0.84, 1, 0.34], [0.9, 1, 0.86], [0.1, 1, 0.86]]);
  return (
    <g>
      <RoomShell r={r} id={id} floor="boards" wall="#9A8350" side="#7E6C42" floorC="#5E4A34" ceiling="#2E261C" lines="#3E3022" />
      {/* the roof's slope over the back wall */}
      <polygon points={`${P(0, 0, 0).x},${P(0, 0, 0).y} ${P(1, 0, 0).x},${P(1, 0, 0).y} ${P(1, 0.1, 0).x},${P(1, 0.1, 0).y} ${P(0, 0.1, 0).x},${P(0, 0.1, 0).y}`} fill="#3E3222" />
      {/* the window: grey rain over the flooded yard */}
      <rect x={WIN.x0} y={WIN.y0} width={WIN.x1 - WIN.x0} height={WIN.y1 - WIN.y0} fill="#8E9CA6" />
      <clipPath id={`${id}win`}>
        <rect x={WIN.x0} y={WIN.y0} width={WIN.x1 - WIN.x0} height={WIN.y1 - WIN.y0} />
      </clipPath>
      <g clipPath={`url(#${id}win)`}>
        <path d={`M ${WIN.x0} 450 L ${WIN.x0 + 80} 410 L ${WIN.x0 + 160} 446 L ${WIN.x0 + 250} 400 L ${WIN.x1} 440 L ${WIN.x1} ${WIN.y1} L ${WIN.x0} ${WIN.y1} Z`} fill="#4E5A5E" />
        <rect x={WIN.x0} y={500} width={WIN.x1 - WIN.x0} height={90} fill="#7E8A90" />
        <Rain t={t} seed={5} n={40} o={0.7} x0={WIN.x0 - 10} y0={WIN.y0 - 20} w={WIN.x1 - WIN.x0 + 20} h={WIN.y1 - WIN.y0 + 40} />
      </g>
      <rect x={WIN.x0} y={WIN.y0} width={WIN.x1 - WIN.x0} height={WIN.y1 - WIN.y0} fill="none" stroke="#5A4028" strokeWidth={12} />
      <path d={`M ${(WIN.x0 + WIN.x1) / 2} ${WIN.y0} L ${(WIN.x0 + WIN.x1) / 2} ${WIN.y1}`} stroke="#5A4028" strokeWidth={8} />
      {/* floor mat, blankets folded in a stack, the heavy stairs' hatch in the corner */}
      <polygon points={mat} fill="#6E3A34" />
      <polygon points={mat} fill="none" stroke="#3E1E1A" strokeWidth={4} />
      
      {/* the low table: a board on short legs */}
      <FloorShadow r={r} u={[0.34, 0.66]} w={[0.46, 0.72]} o={0.4} />
      <Box r={r} u={[0.34, 0.66]} v={[0.82, 0.86]} w={[0.46, 0.72]} front="#7E5A3A" top="#94704E" side="#6A4A2E" rim />
      {[[0.35, 0.47], [0.64, 0.47], [0.35, 0.7], [0.64, 0.7]].map(([u, w], i) => <Box key={i} r={r} u={[u - 0.012, u + 0.012]} v={[0.86, 1]} w={[w - 0.012, w + 0.012]} front="#4C3420" side="#3E2A18" />)}
      {map ? <polygon points={Q([[0.42, 0.818, 0.5], [0.58, 0.818, 0.5], [0.58, 0.818, 0.69], [0.42, 0.818, 0.69]])} fill="#EBE0C4" stroke="#8A7A58" strokeWidth={3} /> : null}
      <Pile r={r} n={bags} />
      <path d={`M ${BULB.x} ${P(0.5, 0, 0.46).y} L ${BULB.x} ${BULB.y - 16}`} stroke="#1E1A16" strokeWidth={3} />
      <circle cx={BULB.x} cy={BULB.y} r={17} fill="#FFF0BE" />
      <LightVeil id={`${id}v`} lights={[[BULB.x, BULB.y + 70, 640], [(WIN.x0 + WIN.x1) / 2, 450, 300]]} o={veil} />
      <Glow x={BULB.x} y={BULB.y} r={520} o={0.55} />
      <Glow x={BULB.x} y={BULB.y} r={130} o={1} />
      <Glow x={(WIN.x0 + WIN.x1) / 2} y={450} r={360} kind="cool" o={0.3} />
      <Dust t={t} seed={4} x0={BULB.x - 280} y0={BULB.y} w={560} h={400} n={20} o={0.3} />
    </g>
  );
};

// ================================================================ the alley and the house
// ---------- S1: low wide: the bến's steps going down into the river, the last ones already gone ----------
export const S1: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 1000]]), 560, kf(t, [[0, 1.0], [len, 1.08]]))}>
    <rect x={-300} y={-300} width={2520} height={900} fill="#7B8791" />
    <CloudBank x={t * 0.5} y={190} h={150} color="#4E5764" lit="#6C7683" seed={101} />
    <path d="M -300 470 L 300 420 L 800 460 L 1300 400 L 1900 450 L 2220 420 L 2220 640 L -300 640 Z" fill="#3E4B44" />
    <rect x={-300} y={560} width={2520} height={700} fill="#8A7458" />
    {Array.from({ length: 22 }).map((_, i) => <path key={i} d={`M ${-250 + i * 120 + 30 * Math.sin(t * 0.05 + i)} ${600 + rnd(3, i) * 380} q 40 -9 90 0`} stroke="#C9B896" strokeWidth={4} fill="none" opacity={0.45} />)}
    {/* the steps: six stone treads descending to the right; the bottom three under the brown water */}
    {Array.from({ length: 7 }).map((_, i) => {
      const x = 80 + i * 150;
      const y = 400 + i * 52;
      return (
        <g key={i}>
          <rect x={x} y={y} width={190} height={52} fill={['#8C8878', '#7E7A6A'][i % 2]} stroke="#4C4A40" strokeWidth={3} />
          <rect x={x} y={y} width={190} height={9} fill="#B5B09C" />
        </g>
      );
    })}
    <rect x={560} y={640} width={1700} height={600} fill="#8A7458" opacity={0.92} />
    <rect x={560} y={640} width={1700} height={5} fill="#E2D2B0" opacity={0.6} />
    <path d="M 1100 650 L 1100 330" stroke="#3E2A18" strokeWidth={16} />
    <path d="M 1100 650 q 6 22 0 44" stroke="#3E2A18" strokeWidth={14} opacity={0.4} />
    <Splashes t={t} x0={560} x1={2200} y0={660} y1={1060} n={60} o={0.6} />
    <Rain t={t} o={0.4} />
  </g>
);

// ---------- S2: the road to the school: a barrier of two trestles and a striped plank, a no-entry sign, the road going on into the water ----------
export const S2: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.06]]))}>
    <rect x={-300} y={-300} width={2520} height={900} fill="#7C8993" />
    <g filter="url(#blur6)">
      <rect x={-300} y={330} width={900} height={300} fill="#5E6A60" />
      <rect x={1500} y={290} width={800} height={340} fill="#58645C" />
    </g>
    <polygon points="760,630 1160,630 1560,1100 360,1100" fill="#5E5E5A" />
    <path d="M 960 630 L 960 1100" stroke="#D8D2BE" strokeWidth={6} strokeDasharray="38 44" opacity={0.6} />
    <Flood t={t} y={740} x0={-300} x1={2220} o={0.9} />
    <g transform="translate(0 4)">
      {[620, 1300].map((x, i) => (
        <g key={i}>
          <path d={`M ${x} 700 L ${x - 50} 830 M ${x} 700 L ${x + 50} 830`} stroke="#3E2A18" strokeWidth={14} strokeLinecap="round" />
          <ellipse cx={x} cy={832} rx={64} ry={9} fill="#2A2018" opacity={0.28} />
        </g>
      ))}
      {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={560 + i * 100} y={660} width={100} height={42} fill={i % 2 ? '#F4F0E4' : '#C8322A'} />)}
      <rect x={560} y={660} width={800} height={42} fill="none" stroke="#2A2018" strokeWidth={5} />
      <path d="M 960 700 L 960 560" stroke="#3E2A18" strokeWidth={10} />
      <circle cx={960} cy={500} r={72} fill="#C8322A" stroke="#F4F0E4" strokeWidth={9} />
      <rect x={910} y={484} width={100} height={32} rx={4} fill="#F4F0E4" />
    </g>
    <Rain t={t} o={0.45} />
  </g>
);

// ---------- S3: the electric pole opposite the house: a painted gauge on it, the water at thirty ----------
export const S3: React.FC<ShotProps> = ({ t, len }) => {
  const wy = 760 - kf(t, [[0, 0], [len, 6]]);
  return (
    <g transform={camT(960, kf(t, [[0, 700], [len, 560]]), kf(t, [[0, 1.2], [len, 1.5]]))}>
      <rect x={-300} y={-500} width={2520} height={1500} fill="#7C8993" />
      <g filter="url(#blur10)">
        <rect x={-300} y={240} width={700} height={560} fill="#6E6A5A" />
        <rect x={1400} y={200} width={900} height={600} fill="#66705F" />
        <rect x={1500} y={430} width={110} height={90} fill="#E2A258" opacity={0.7} />
      </g>
      <rect x={820} y={-500} width={150} height={1500} fill="#4A4036" />
      <rect x={820} y={-500} width={150} height={1500} fill="#000" opacity={0.18} />
      <path d="M 920 -500 L 920 1000" stroke="#6A5E50" strokeWidth={4} opacity={0.5} />
      {/* the gauge: a painted white band with a tick every ten centimetres */}
      <rect x={846} y={180} width={98} height={760} fill="#EDE8DA" stroke="#2A2018" strokeWidth={4} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const y = 760 - i * 112;
        return (
          <g key={i}>
            <path d={`M 846 ${y} L ${i % 2 ? 900 : 944} ${y}`} stroke="#2A2018" strokeWidth={6} />
            {i > 0 ? <text x={954} y={y + 12} fontFamily={FONT.ui} fontWeight={700} fontSize={36} fill="#EDE8DA" stroke="#2A2018" strokeWidth={6} style={{ paintOrder: 'stroke' }}>{i * 10}</text> : null}
          </g>
        );
      })}
      <rect x={846} y={wy - 330} width={98} height={330} fill="#2C3A44" opacity={0.28} />
      <Flood t={t} y={wy - 330 + 330} x0={-300} x1={2220} o={0.9} h={900} />
      <rect x={700} y={wy} width={380} height={14} fill="#B9C6CC" opacity={0.5} />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={895} cy={wy + 8} rx={70 + ((t * 1.4 + i * 22) % 60)} ry={9 + ((t * 0.3 + i * 5) % 9)} fill="none" stroke="#DCE6EE" strokeWidth={2.5} opacity={0.8} />)}
      <Rain t={t} o={0.5} />
    </g>
  );
};

// ---------- S4: bà Sáu's shop: water over the floor round the foot of the cabinet; she lifts a crate ----------
export const S4: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 1010, y: 560, scale: 1.15, yaw: -0.4, look: -0.4, tilt: 14, expr: 'worried', armL: { a: 36, b: 40 }, armR: { a: 30, b: 44 } } },
    { f: 34, p: { tilt: -4, armL: { a: 62, b: 50 }, armR: { a: 56, b: 52 } } },
  ]);
  const jh = joints(pose);
  const h1 = toWorld(pose, jh.armL.end);
  const h2 = toWorld(pose, jh.armR.end);
  const crate = { x: (h1.x + h2.x) / 2, y: (h1.y + h2.y) / 2 };
  return (
    <g transform={camT(kf(t, [[0, 1000], [len, 960]]), 560, kf(t, [[0, 1.3], [len, 1.36]]))}>
      <ShopFront id="c3s4" t={t} tarp={1} rain={0.5} />
      <rect x={380} y={560} width={150} height={220} fill="#3A2C1E" stroke="#6B4A2E" strokeWidth={6} />
      <rect x={1400} y={620} width={190} height={160} fill="#7A5636" stroke="#3E2A18" strokeWidth={5} />
      <Hero look={SAU} pose={live(pose, t, 2)} rimId="filmR" shadow={0} />
      <g transform={`translate(${crate.x - 80} ${crate.y - 56})`}>
        <rect x={0} y={0} width={160} height={90} fill="#B98A5A" stroke="#2A2018" strokeWidth={4} />
        {[0, 1, 2].map((i) => <path key={i} d={`M 0 ${22 + i * 26} L 160 ${22 + i * 26}`} stroke="#6E4E2E" strokeWidth={4} />)}
        <rect x={0} y={0} width={160} height={12} fill="#8A5E3A" />
      </g>
      <Flood t={t} y={738} x0={-100} x1={2000} o={0.86} h={520} seed={7} />
    </g>
  );
};

// ---------- S5: low from the yard: the house on its veranda, the water short of the edge ----------
export const S5: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 940], [len, 900]]), 700, kf(t, [[0, 1.5], [len, 1.62]]))}>
    <AnHouse id="c3s5" t={t} w={2} rain={0.8} chair={false} />
    <Flood t={t} y={850} x0={-400} x1={2300} o={0.9} h={600} seed={9} />
    <rect x={160} y={820} width={1500} height={5} fill="#E8EEF2" opacity={0.35} />
  </g>
);

// ---------- S6: close at the veranda's step: its stained concrete face, an old tide-mark, the water a hand below the lip ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => {
  const wy = 700 + 5 * Math.sin(t * 0.1) - kf(t, [[0, 0], [len, -10]]);
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.08]]))}>
      <rect x={-200} y={-200} width={2320} height={1500} fill="#6A5A3A" />
      <Glow x={960} y={-60} r={1100} o={0.4} />
      <rect x={-200} y={-200} width={2320} height={330} fill="#4A4030" />
      {/* the deck's lip, then the step's face with its brick joints and a damp stain */}
      <rect x={-200} y={120} width={2320} height={46} fill="#B5A58A" />
      <rect x={-200} y={166} width={2320} height={640} fill="#8E7E68" />
      {Array.from({ length: 5 }).map((_, r) => (
        <path key={r} d={`M -200 ${236 + r * 112} L 2120 ${236 + r * 112}`} stroke="#5E5240" strokeWidth={5} />
      ))}
      {Array.from({ length: 16 }).map((_, i) => <path key={i} d={`M ${-60 + i * 150 + (i % 2) * 75} 166 l 0 112 M ${-60 + i * 150 + ((i + 1) % 2) * 75} 278 l 0 112`} stroke="#5E5240" strokeWidth={5} />)}
      <rect x={-200} y={wy - 150} width={2320} height={150} fill="#3E3428" opacity={0.42} />
      <path d={`M -200 ${wy - 150} Q 300 ${wy - 164} 800 ${wy - 148} T 2120 ${wy - 152}`} stroke="#4A3E2E" strokeWidth={5} fill="none" opacity={0.6} />
      <Flood t={t} y={wy} x0={-200} x1={2120} o={0.92} h={500} seed={11} />
      <path d={`M -200 ${wy - 4} Q 400 ${wy - 16} 900 ${wy - 2} T 2120 ${wy - 6}`} stroke="#E6EEF2" strokeWidth={5} fill="none" opacity={0.7} />
      <g transform={`translate(${kf(t, [[0, 520], [len, 880]])} ${wy + 22}) rotate(${14 * Math.sin(t * 0.05)})`}>
        <path d="M -40 0 Q 0 -26 40 0 Q 0 14 -40 0 Z" fill="#5C7A3A" stroke="#33481E" strokeWidth={3} />
        <path d="M -40 0 L 40 0" stroke="#33481E" strokeWidth={2} />
      </g>
      <Rain t={t} n={80} near o={0.3} seed={41} />
    </g>
  );
};

// ---------- S7: the living-room doorway: the floor inside dry and lit, a doormat and a pair of sandals, the water short of the sill ----------
export const S7: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.06]]))}>
    <rect x={-100} y={-100} width={2200} height={1300} fill="#5E4A3A" />
    <polygon points="-100,430 2100,430 2400,1180 -400,1180" fill="#6E5A48" />
    {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M ${-100 + i * 200} 430 L ${(i - 5.5) * 360 + 960} 1180`} stroke="#3E3226" strokeWidth={4} />)}
    {[530, 650, 810, 1020].map((y) => <path key={y} d={`M -400 ${y} L 2400 ${y}`} stroke="#3E3226" strokeWidth={4} />)}
    <rect x={-100} y={300} width={2200} height={130} fill="#3E2E20" />
    <rect x={-100} y={430} width={2200} height={22} fill="#A07C52" />
    <rect x={560} y={-100} width={800} height={400} fill="#8F9CA6" />
    <Rain t={t} seed={13} n={50} o={0.55} x0={560} y0={-100} w={800} h={420} />
    <rect x={560} y={-100} width={800} height={9} fill="#6A7A80" opacity={0} />
    <rect x={-100} y={-100} width={660} height={400} fill="#9A8350" />
    <rect x={1360} y={-100} width={760} height={400} fill="#9A8350" />
    <rect x={540} y={-100} width={30} height={420} fill="#4C3420" />
    <rect x={1350} y={-100} width={30} height={420} fill="#4C3420" />
    <rect x={560} y={296} width={800} height={14} fill="#6A7A80" opacity={0.9} />
    {/* a woven mat just inside, a pair of sandals set neatly on it, the broom against the frame */}
    <polygon points="720,640 1200,640 1260,740 660,740" fill="#8A5E3A" stroke="#4C3420" strokeWidth={5} />
    {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M ${740 + i * 80} 644 L ${700 + i * 90} 736`} stroke="#6A4528" strokeWidth={3} />)}
    {[820, 1000].map((x, i) => (
      <g key={i} transform={`translate(${x} 692)`}>
        <ellipse cx={0} cy={22} rx={62} ry={11} fill="#000" opacity={0.3} />
        <path d="M -56 0 Q 0 -30 56 0 Q 0 22 -56 0 Z" fill="#D96C4F" stroke="#7A3A2A" strokeWidth={4} />
        <path d="M -8 -8 L 0 -26 L 8 -8" stroke="#7A3A2A" strokeWidth={5} fill="none" />
      </g>
    ))}
    <path d="M 1440 330 L 1500 920" stroke="#5E4128" strokeWidth={12} />
    <polygon points="1470,900 1530,900 1520,990 1456,990" fill="#BFA25C" stroke="#6B5A2A" strokeWidth={3} />
    <LightVeil id="c3s7v" lights={[[960, 800, 720]]} o={0.42} />
    <Glow x={960} y={820} r={760} o={0.4} />
    <Glow x={960} y={80} r={900} kind="cool" o={0.25} />
  </g>
);

// ================================================================ upstairs
// ---------- S8: over Linh's shoulder at the window: the bến, the water ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(kf(t, [[0, 960], [len, 1010]]), 480, kf(t, [[0, 1.3], [len, 1.45]]))}>
      <Attic id="c3s8" t={t} />
    </g>
    <Foreground blur={3}>
      <Back look={LINH} pose={P({ x: kf(t, [[0, 520], [len, 560]]), y: 1230, scale: 2.4, headTilt: -4, armL: { a: 14, b: 8 }, armR: { a: 14, b: 8 } })} />
    </Foreground>
  </g>
);

// ---------- S9: what she sees: the yard where she plays with Nam, joined to the water; a flip-flop and a ball afloat ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.08]]))}>
    <rect x={-100} y={-100} width={2200} height={700} fill="#8A97A0" />
    <CloudBank x={t * 0.4} y={230} h={140} color="#5C6672" lit="#7C8794" seed={121} />
    <path d="M -100 360 L 380 280 L 800 340 L 1300 270 L 1800 330 L 2100 300 L 2100 520 L -100 520 Z" fill="#46544C" />
    <RoofRowShim />
    <rect x={-100} y={520} width={2200} height={700} fill="#7E7A66" />
    {/* the yard's chalked squares, still showing under the water; a swing post leaning out of it */}
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={520 + i * 150 - i * 12} y={800 + i * 22} width={130 + i * 10} height={80 + i * 6} fill="none" stroke="#E8E2C8" strokeWidth={5} opacity={0.35} />)}
    <rect x={1500} y={430} width={20} height={400} fill="#4A3A28" />
    <path d="M 1510 440 L 1740 440" stroke="#4A3A28" strokeWidth={10} />
    <path d="M 1740 440 L 1740 560" stroke="#6A5A44" strokeWidth={4} />
    <rect x={1700} y={560} width={80} height={14} fill="#8E6A48" />
    <rect x={-100} y={640} width={2200} height={700} fill={WATER} opacity={0.9} />
    <rect x={-100} y={640} width={2200} height={5} fill="#D6E0E4" opacity={0.6} />
    {/* the flip-flop turns slowly, the ball bobs */}
    <g transform={`translate(${660 + 24 * Math.sin(t * 0.03)} ${800 + 4 * Math.sin(t * 0.12)}) rotate(${t * 0.5})`}>
      <ellipse cx={0} cy={4} rx={56} ry={14} fill="#000" opacity={0.22} />
      <path d="M -52 0 Q 0 -22 52 0 Q 0 16 -52 0 Z" fill="#D96C4F" stroke="#7A3A2A" strokeWidth={3} />
    </g>
    <g transform={`translate(${1180 + 30 * Math.sin(t * 0.025)} ${760 + 6 * Math.sin(t * 0.1)})`}>
      <ellipse cx={0} cy={20} rx={40} ry={9} fill="#000" opacity={0.22} />
      <circle r={30} fill="#E9B830" stroke="#8E6F18" strokeWidth={3} />
      <path d="M -30 0 Q 0 -14 30 0" stroke="#8E6F18" strokeWidth={3} fill="none" />
    </g>
    <Splashes t={t} x0={-100} x1={2100} y0={656} y1={1050} n={70} o={0.6} seed={19} />
    <Rain t={t} o={0.45} />
    {/* the window frame around it */}
    <rect x={-20} y={-20} width={140} height={1120} fill="#3E2A18" />
    <rect x={1800} y={-20} width={140} height={1120} fill="#3E2A18" />
    <rect x={-20} y={-20} width={1960} height={90} fill="#3E2A18" />
    <rect x={-20} y={1000} width={1960} height={100} fill="#4C3420" />
  </g>
);
/** A row of far roofs for the window view. */
const RoofRowShim: React.FC = () => (
  <g>
    {Array.from({ length: 12 }).map((_, i) => {
      const x = -60 + i * 190;
      return (
        <g key={i}>
          <rect x={x} y={470 + (i % 3) * 14} width={150} height={90} fill={['#68675C', '#5C5E58', '#716C5A'][i % 3]} />
          <polygon points={`${x - 8},${470 + (i % 3) * 14} ${x + 75},${420 + (i % 3) * 14} ${x + 158},${470 + (i % 3) * 14}`} fill="#3C424C" />
        </g>
      );
    })}
  </g>
);

// ---------- S10: Linh turns from the window to ask ----------
export const S10: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 1010], [len, 980]]), 480, kf(t, [[0, 2.5], [len, 2.65]]))}>
    <Attic id="c3s10" t={t + 40} />
    <Hero look={LINH} pose={P({ x: 960, y: 700, scale: 1.2, yaw: kf(t, [[0, 0.55], [14, -0.4]]), look: kf(t, [[0, 0.7], [14, -0.6]]), headTilt: -5, expr: 'worried', talk: talkAt(t, 16, 84), armL: { a: 12, b: 20 }, armR: { a: 12, b: 24 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S11: wide: Linh by the window, her father's step on the stair behind her ----------
export const S11: React.FC<ShotProps> = ({ t, len }) => {
  const s = stand(ATT, 0.7, 0.16);
  const a = stand(ATT, 0.1, 0.5);
  return (
    <g transform={camT(960, 520, kf(t, [[0, 1.05], [len, 1.1]]))}>
      <Attic id="c3s11" t={t + 80} />
      <Hero look={LINH} pose={P({ x: s.x, y: s.y, scale: s.scale * 0.7, yaw: 0.3, look: 0.4, expr: 'worried', talk: talkAt(t, 0, 24), armL: { a: 14, b: 14 }, armR: { a: 14, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
      <Hero look={AN} pose={P({ x: kf(t, [[0, a.x - 120], [len, a.x + 60]]), y: a.y, scale: a.scale, yaw: -0.5, look: -0.4, expr: 'neutral', legL: { a: 22 * Math.sin(t * 0.5), b: -14 }, legR: { a: -22 * Math.sin(t * 0.5), b: -14 }, armL: { a: 10, b: 20 }, armR: { a: 22, b: 30 } }, t, 1)} rimId="filmR" shadow={1} />
    </g>
  );
};

// ---------- S12: wide: he sits by her on the mat and unrolls the working map on the low table ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => {
  const a = sitAt(0.34, 0.54);
  const l = sitAt(0.7, 0.54, 0.72);
  const roll = kf(t, [[26, 0], [60, 1]]);
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.12], [len, 1.18]]))}>
      <Attic id="c3s12" t={t + 120} />
      <polygon points={ATT.Q([[0.42, 0.818, 0.5], [0.42 + 0.16 * roll, 0.818, 0.5], [0.42 + 0.16 * roll, 0.818, 0.69], [0.42, 0.818, 0.69]])} fill="#EBE0C4" stroke="#8A7A58" strokeWidth={3} />
      <ChairFor at={a} />
      <ChairFor at={l} child />
      <Hero look={AN} pose={P({ x: a.x, y: a.y, scale: a.scale, yaw: 0.6, look: 0.5, ...sit(1), armR: { a: 40 + 30 * roll, b: 20 }, armL: { a: -6, b: -30 } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P({ x: l.x, y: l.y, scale: l.scale, yaw: -0.6, look: -0.5, ...sit(-1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S13: top-down: his finger follows the river from the mountains down to the town ----------
export const S13: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[0, 0], [len - 6, 1]]);
  return (
    <g transform={`translate(960 540) rotate(${kf(t, [[0, -2], [len, 2]])}) scale(${kf(t, [[0, 1.0], [len, 1.06]])}) translate(-960 -540)`}>
      <rect x={-100} y={-100} width={2200} height={1300} fill="#7E5A3A" />
      {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M -100 ${-80 + i * 90} Q 900 ${-70 + i * 90} 2100 ${-90 + i * 90}`} stroke="#5E4128" strokeWidth={4} fill="none" />)}
      <g transform="translate(760 60) scale(1.64)"><MapSheet trace={k} flow={t} big /></g>
      <HandTop x={780 + 150 * Math.sin(k * 5.2) + 80 * k} y={130 + 800 * k} rot={186} s={1.05} skin={AN.skin} sleeve={AN.jacket} />
      <Glow x={1500} y={80} r={800} o={0.4} />
    </g>
  );
};

// ---------- S14: over Linh's shoulder: An explains where the water comes from ----------
export const S14: React.FC<ShotProps> = ({ t, len }) => {
  const a = sitAt(0.34, 0.54);
  return (
    <g>
      <g transform={camT(kf(t, [[0, 760], [len, 740]]), 560, kf(t, [[0, 1.9], [len, 2.0]]))}>
        <Attic id="c3s14" t={t + 160} map />
        <ChairFor at={a} />
        <Hero look={AN} pose={P({ x: a.x, y: a.y, scale: a.scale, yaw: 0.45, look: 0.5, headTilt: 5, expr: 'neutral', talk: talkAt(t, 2, 92), ...sit(1), armR: { a: 36, b: 28 }, armL: { a: -4, b: -30 } }, t, 1)} rimId="filmR" shadow={0} />
      </g>
      <Foreground blur={3}>
        <Back look={LINH} pose={P({ x: kf(t, [[0, 1560], [len, 1600]]), y: 1300, scale: 2.5, armL: { a: 8, b: 6 }, armR: { a: 8, b: 6 } })} />
      </Foreground>
    </g>
  );
};

// ---------- S15: macro: rain falling on the mountains of the map, the water running down the river toward the town ----------
export const S15: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, kf(t, [[0, 250], [len, 760]]), 1.0)}>
    <rect x={-100} y={-300} width={2200} height={1800} fill="#6E4C30" />
    <g transform="translate(660 -60) scale(2.0)"><MapSheet flow={t * 2.6} big /></g>
    <Rain t={t} n={60} o={0.35} seed={31} x0={600} y0={-300} w={700} h={800} />
    <Glow x={1500} y={-100} r={900} o={0.4} />
  </g>
);

/** Fingers side by side: outlines first, then the fills, so one silhouette with thin dark lines between the fingers. */
const Digits: React.FC<{ d: string[]; w: number; skin: string }> = ({ d, w, skin }) => (
  <g fill="none" strokeLinecap="round">
    {d.map((p) => <path key={p} d={p} stroke="#16141C" strokeWidth={w + 11} />)}
    {d.map((p) => <path key={p} d={p} stroke={skin} strokeWidth={w} />)}
  </g>
);
/** An's sleeve hanging with his relaxed hand below it, and Linh's small hand closed over the edge of the cloth: four fingers lying on the sleeve, the thumb behind it. open 0 = holding, 1 = let go. */
const SleeveGrip: React.FC<{ open: number; sway?: number }> = ({ open, sway = 0 }) => {
  const L = '#16141C';
  const off = `translate(${-open * 190} ${open * 150}) rotate(${-open * 10} 560 560) translate(720 420) scale(0.8) translate(-720 -420)`;
  return (
    <g transform={`translate(${sway} 0)`}>
      {/* his hand first: the wrist goes up inside the cuff */}
      <Digits d={['M 806 740 Q 800 790 804 836', 'M 846 748 Q 844 810 846 868', 'M 886 748 Q 888 806 888 860', 'M 924 738 Q 926 784 924 822']} w={32} skin={AN.skin} />
      <Digits d={['M 804 650 Q 748 700 762 776']} w={36} skin={AN.skin} />
      <rect x={790} y={560} width={152} height={190} fill={AN.skin} />
      <path d="M 790 560 L 790 634 M 790 706 L 790 750 M 942 560 L 942 750" stroke={L} strokeWidth={5.5} fill="none" strokeLinecap="round" />
      {/* her thumb goes behind the cloth */}
      <g transform={off}>
        <Digits d={['M 610 540 Q 660 560 730 520']} w={38} skin={LINH.skin} />
      </g>
      <path d="M 700 -120 L 700 540 Q 700 576 736 576 L 984 576 Q 1020 576 1020 540 L 1020 -120 Z" fill={AN.jacket} stroke={L} strokeWidth={6} />
      <path d="M 940 -120 L 940 560 L 1020 540 L 1020 -120 Z" fill={AN.jacketShade} opacity={0.55} />
      {[0, 1, 2].map((k) => <path key={k} d={`M 706 ${40 + k * 110} q 150 -26 308 -2`} stroke={AN.jacketShade} strokeWidth={7} fill="none" opacity={0.5} />)}
      <rect x={690} y={520} width={340} height={64} rx={14} fill={AN.jacketShade} stroke={L} strokeWidth={6} />
      {/* the cloth pulled tight towards her fingers */}
      <g opacity={1 - open} stroke={AN.jacketShade} strokeWidth={7} fill="none" strokeLinecap="round">
        <path d="M 800 330 Q 880 270 960 250" />
        <path d="M 840 390 Q 910 370 985 372" />
        <path d="M 836 462 Q 900 478 970 500" />
      </g>
      <g transform={off}>
        {/* her sleeve, then the wrist and the back of the hand, one shape */}
        <path d="M 150 1240 L 462 690" stroke={L} strokeWidth={128} strokeLinecap="round" />
        <path d="M 150 1240 L 462 690" stroke={LINH.jacket} strokeWidth={116} strokeLinecap="round" />
        <Digits d={['M 642 362 Q 710 330 776 336', 'M 668 400 Q 744 372 812 382', 'M 692 438 Q 766 414 830 428', 'M 712 476 Q 770 462 818 474']} w={35} skin={LINH.skin} />
        <path d="M 624 346 L 730 490 L 590 610 L 520 700 L 420 640 L 490 530 Z" fill={LINH.skin} stroke={L} strokeWidth={5.5} strokeLinejoin="round" />
        <g fill="none" strokeLinecap="round" stroke={LINH.skin} strokeWidth={35}>
          <path d="M 642 362 Q 710 330 776 336" />
          <path d="M 668 400 Q 744 372 812 382" />
          <path d="M 692 438 Q 766 414 830 428" />
          <path d="M 712 476 Q 770 462 818 474" />
        </g>
        <path d="M 416 642 L 516 700" stroke={L} strokeWidth={30} strokeLinecap="round" />
        <path d="M 416 642 L 516 700" stroke={LINH.jacket} strokeWidth={19} strokeLinecap="round" />
      </g>
    </g>
  );
};

// ---------- S16: extreme close: Linh's small fingers take hold of his sleeve ----------
export const S16: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(900, 520, kf(t, [[0, 1.0], [len, 1.1]]))}>
    <rect x={-300} y={-300} width={2400} height={1700} fill="#5E4A30" />
    <Glow x={1400} y={80} r={900} o={0.3} />
    <SleeveGrip open={kf(t, [[0, 1], [14, 0]])} sway={2 * Math.sin(t * 0.2)} />
  </g>
);

// ---------- S17: close: Linh's face, worried ----------
export const S17: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(980, 470, kf(t, [[0, 2.8], [len, 3.0]]))}>
    <Attic id="c3s17" t={t + 200} veil={0.5} />
    <Hero look={LINH} pose={P({ x: 980, y: 760, scale: 1.2, yaw: -0.12, look: 0.3, headTilt: -4, expr: 'worried', talk: talkAt(t, 2, 52), armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S18: side-on: he turns his whole body from the map to her ----------
export const S18: React.FC<ShotProps> = ({ t, len }) => {
  const a = sitAt(0.34, 0.54);
  const l = sitAt(0.7, 0.54, 0.72);
  const turn = kf(t, [[6, 0], [30, 1]]);
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.4], [len, 1.5]]))}>
      <Attic id="c3s18" t={t + 240} map />
      <ChairFor at={{ ...a, x: a.x + 30 * turn }} />
      <ChairFor at={l} child />
      <Hero look={AN} pose={P({ x: a.x + 30 * turn, y: a.y, scale: a.scale, yaw: 0.6 - 0.9 * turn, tilt: 4 * turn, look: 0.5 - 0.7 * turn, ...sit(1), armR: { a: 50 - 36 * turn, b: 24 }, armL: { a: -4, b: -30 } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P({ x: l.x, y: l.y, scale: l.scale, yaw: -0.6, look: -0.5, expr: 'worried', ...sit(-1), armL: { a: 52, b: 22 }, armR: { a: -4, b: -30 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S19: close: An's face, calm, as he says what they will do ----------
export const S19: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 470, kf(t, [[0, 2.7], [len, 2.9]]))}>
    <Attic id="c3s19" t={t + 280} veil={0.5} />
    <Hero look={AN} pose={P({ x: 960, y: 760, scale: 1.2, yaw: 0.2, look: 0.3, headTilt: 3, expr: 'neutral', talk: talkAt(t, 2, 134), armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 1)} rimId="filmL" shadow={0} />
  </g>
);

// ---------- S20: wide from the stair end: the bags already by the hatch; both listen ----------
export const S20: React.FC<ShotProps> = ({ t, len }) => {
  const a = sitAt(0.34, 0.54);
  const l = sitAt(0.7, 0.54, 0.72);
  return (
    <g transform={camT(kf(t, [[0, 900], [len, 1000]]), 560, 1.1)}>
      <Attic id="c3s20" t={t + 300} map bags={1} />
      <ChairFor at={a} />
      <ChairFor at={l} child />
      <Hero look={AN} pose={P({ x: a.x, y: a.y, scale: a.scale, yaw: 0.3, look: 0.4, expr: 'neutral', talk: talkAt(t, 2, 112), ...sit(1), armR: { a: 20, b: 40 }, armL: { a: -4, b: -30 } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P({ x: l.x, y: l.y, scale: l.scale, yaw: -0.55, look: -0.4, expr: 'neutral', ...sit(-1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S21: close: Linh, quietly, her eyes down: what she is afraid of ----------
export const S21: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(980, 470, kf(t, [[0, 3.0], [len, 3.15]]))}>
    <Attic id="c3s21" t={t + 320} veil={0.55} />
    <Hero look={LINH} pose={P({ x: 980, y: 760, scale: 1.2, yaw: 0.1, look: -0.5, headTilt: 7, expr: 'worried', talk: talkAt(t, 2, 80), armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S22: wide: he shifts across the mat until they touch ----------
export const S22: React.FC<ShotProps> = ({ t, len }) => {
  const l = sitAt(0.7, 0.54, 0.72);
  const a0 = sitAt(0.34, 0.54);
  const a1 = sitAt(0.52, 0.54);
  const k = kf(t, [[2, 0], [30, 1]]);
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.12], [len, 1.18]]))}>
      <Attic id="c3s22" t={t + 340} map />
      <ChairFor at={{ ...a0, x: a0.x + (a1.x - a0.x) * k }} />
      <ChairFor at={l} child />
      <Hero look={AN} pose={P({ x: a0.x + (a1.x - a0.x) * k, y: a0.y, scale: a0.scale, yaw: 0.7, look: 0.5, ...sit(1), armR: { a: 20, b: 40 }, armL: { a: -4, b: -30 } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P({ x: l.x, y: l.y, scale: l.scale, yaw: -0.6, look: -0.4, expr: 'worried', ...sit(-1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S23: over her shoulder: An tells her he will wake her and take her along, and say where he goes ----------
export const S23: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(kf(t, [[0, 780], [len, 760]]), 520, kf(t, [[0, 2.2], [len, 2.3]]))}>
      <Attic id="c3s23" t={t + 360} map />
      <ChairFor at={{ x: 700, y: 650, scale: 1.1 }} />
      <Hero look={AN} pose={P({ x: 700, y: 650, scale: 1.1, yaw: 0.35, look: 0.4, headTilt: 6, expr: 'neutral', talk: talkAt(t, 2, 210), ...sit(1), armR: { a: 22, b: 30 }, armL: { a: -4, b: -30 } }, t, 1)} rimId="filmR" shadow={0} />
    </g>
    <Foreground blur={3}>
      <Back look={LINH} pose={P({ x: 1560, y: 1300, scale: 2.5, armL: { a: 8, b: 6 }, armR: { a: 8, b: 6 } })} />
    </Foreground>
  </g>
);

// ---------- S24: close: his big hand rests on her head: "I will say where I am going" ----------
export const S24: React.FC<ShotProps> = ({ t, len }) => {
  const press = kf(t, [[0, 0], [20, 1]]);
  return (
    <g transform={camT(960, 520, kf(t, [[0, 1.0], [len, 1.06]]))}>
      <Attic id="c3s24" t={t + 380} veil={0.55} />
      <Hero look={LINH} pose={P({ x: 960, y: 780, scale: 2.1, yaw: 0.5, look: 0.3, headTilt: 5 + 4 * press, expr: 'neutral', armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} />
      <HandTop x={1010 + 6 * press} y={140 + 26 * press} rot={0} s={1.05} skin={AN.skin} sleeve={AN.jacket} />
    </g>
  );
};

// ---------- S25: macro: her fingers let go of his sleeve, slowly; held through the pause ----------
export const S25: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(900, 520, kf(t, [[0, 1.05], [len, 1.0]]))}>
    <rect x={-300} y={-300} width={2400} height={1700} fill="#5E4A30" />
    <Glow x={1400} y={80} r={900} o={0.3} />
    <SleeveGrip open={kf(t, [[6, 0], [len - 12, 1]])} sway={1.5 * Math.sin(t * 0.15)} />
  </g>
);

// ---------- S26: the fuse board by the door: a hand pushes the switch down ----------
export const S26: React.FC<ShotProps> = ({ t, len }) => {
  const sw = kf(t, [[14, 0], [24, 1]]);
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.08]]))}>
      <rect x={-100} y={-100} width={2200} height={1300} fill="#7E6C42" />
      <Glow x={1500} y={80} r={900} kind="cool" o={0.25} />
      <rect x={640} y={160} width={640} height={820} rx={20} fill="#BDB8A8" stroke="#3E3A30" strokeWidth={10} />
      <rect x={700} y={230} width={520} height={620} fill="#8E8A7A" stroke="#3E3A30" strokeWidth={6} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${790 + i * 170} 320)`}>
          <rect x={-40} y={0} width={80} height={380} rx={10} fill="#2E2A22" />
          <rect x={-26} y={i === 1 ? 50 + 200 * sw : 50} width={52} height={150} rx={8} fill={i === 1 && sw > 0.5 ? '#8E8A7A' : '#E8E4D0'} stroke="#16141C" strokeWidth={4} />
        </g>
      ))}
      <rect x={700} y={880} width={520} height={30} fill="#3E3A30" />
      <HandTop x={960 + 0 * sw} y={kf(t, [[0, 1250], [14, 660], [24, 840]])} rot={176} s={1.2} skin={AN.skin} sleeve={AN.jacket} />
    </g>
  );
};

// ---------- S27: wide: the two of them carry blankets and papers up to the gác, the stair between ----------
export const S27: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[0, 0], [len, 1]]);
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.1]]))}>
      <LivingRoom id="c3s27" t={t + 20} lamp={0.8} day="7" dog />
      <Hero look={AN} pose={P({ x: 640 + 520 * k, y: 600 - 30 * k, scale: 1.0, yaw: 0.8, facing: 1, look: 0.5, tilt: 5, expr: 'neutral', legL: { a: 22 * Math.sin(t * 0.5), b: -16 }, legR: { a: -22 * Math.sin(t * 0.5), b: -16 }, armL: { a: 26, b: 58 }, armR: { a: 30, b: 56 } }, t, 1)} rimId="filmL" shadow={0} />
      <Bundle x={640 + 520 * k + 90} y={600 - 30 * k + 130} s={0.7} c="#B5604F" />
      <Hero look={HANH} pose={P({ x: 340 + 520 * k, y: 640 - 30 * k, scale: 0.92, yaw: 0.8, facing: 1, look: 0.5, tilt: 4, expr: 'neutral', legL: { a: 22 * Math.sin(t * 0.5 + 2), b: -16 }, legR: { a: -22 * Math.sin(t * 0.5 + 2), b: -16 }, armL: { a: 14, b: 34 }, armR: { a: 30, b: 50 } }, t, 3)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S28: wide: what stays: the heavy table, the cabinet, the wooden set, in the middle of a swept room ----------
export const S28: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 1000]]), 560, kf(t, [[0, 1.0], [len, 1.1]]))}>
    <LivingRoom id="c3s28" t={t + 60} lamp={0.8} day="7" dog={false} />
    <Rain t={t} seed={13} n={30} o={0.25} x0={1185} y0={300} w={280} h={260} />
  </g>
);

// ---------- S29: Hạnh at the door calls across the alley ----------
export const S29: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: YARD.floorHip(0.98), scale: 0.98, yaw: 0.7, look: 0.6, tilt: 3, expr: 'neutral', armR: { a: 20, b: 18 }, armL: { a: 20, b: 18 } } },
    { f: 22, p: { armR: { a: 104, b: 52 }, tilt: 6 } },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 900], [len, 940]]), 600, kf(t, [[0, 1.6], [len, 1.7]]))}>
      <AnHouse id="c3s29" t={t} w={2} rain={0.8} chair={false} />
      <Hero look={HANH} pose={live({ ...pose, talk: talkAt(t, 8, 40) }, t, 3)} rimId="filmL" shadow={1} />
      <Flood t={t} y={846} x0={-300} x1={2300} o={0.9} h={500} seed={13} />
    </g>
  );
};

// ---------- S30: over Hạnh's shoulder: across the water, bà Sáu's shop ----------
export const S30: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(kf(t, [[0, 940], [len, 980]]), 520, kf(t, [[0, 1.0], [len, 1.1]]))}>
      <ShopFront id="c3s30" t={t} tarp={1} rain={0.8} />
      <Hero look={SAU} pose={live(P({ x: 1030, y: 640, scale: 0.9, yaw: -0.4, look: -0.4, expr: 'worried', armL: { a: 20, b: 20 }, armR: { a: 20, b: 20 } }, t, 2), t, 2)} rimId="filmR" shadow={0} />
      <Flood t={t} y={756} x0={-300} x1={2300} o={0.9} h={600} seed={15} />
    </g>
    <Foreground blur={3}>
      <Back look={HANH} pose={P({ x: kf(t, [[0, 330], [len, 290]]), y: 1280, scale: 2.4, armL: { a: 8, b: 6 }, armR: { a: 8, b: 6 } })} />
    </Foreground>
  </g>
);

// ---------- S31: low medium: bà Sáu at her threshold, the water round her ankles ----------
export const S31: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 1000], [len, 1020]]), 520, kf(t, [[0, 1.5], [len, 1.6]]))}>
    <ShopFront id="c3s31" t={t} tarp={1} rain={0.8} />
    <Hero look={SAU} pose={live(P({ x: 1010, y: 580, scale: 1.1, yaw: -0.3, look: -0.4, expr: 'neutral', armL: { a: 14, b: 18 }, armR: { a: 14, b: 18 } }, t, 2), t, 2)} rimId="filmR" shadow={0} />
    <Flood t={t} y={740} x0={-300} x1={2300} o={0.86} h={600} seed={17} />
    {[0, 1].map((i) => <ellipse key={i} cx={1000 + i * 30} cy={742} rx={26 + ((t * 1.2 + i * 18) % 40)} ry={6 + ((t * 0.3 + i * 5) % 8)} fill="none" stroke="#DCE6EE" strokeWidth={2.5} opacity={0.8} />)}
  </g>
);

// ---------- S32: close: bà Sáu says where the medicine is, and not to wade ----------
export const S32: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(1010, 500, kf(t, [[0, 3.0], [len, 3.2]]))}>
    <ShopFront id="c3s32" t={t} tarp={1} rain={0.7} />
    <Hero look={SAU} pose={P({ x: 1010, y: 580, scale: 1.1, yaw: -0.3, look: -0.4, headTilt: 3, expr: 'worried', talk: talkAt(t, 2, 150), armL: { a: 14, b: 18 }, armR: { a: 14, b: 18 } }, t, 2)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S33: wide down the alley: a boat poled in from the far end, between the lit doors ----------
export const S33: React.FC<ShotProps> = ({ t, len }) => {
  const d = kf(t, [[0, 0.72], [len, 0.16]]);
  const p = alleyP(0, d, 0);
  const k = Math.pow(1 - d, 1.25);
  return (
    <g transform={camT(960, 640, kf(t, [[0, 1.1], [len, 1.0]]))}>
      <Alley id="c3s33" t={t} w={2} rain={0.8} water={1} />
      <g transform={`translate(${p.x} ${p.y + 20 * k}) scale(${k * 1.3})`}>
        <ellipse cx={0} cy={26} rx={190} ry={20} fill="#000" opacity={0.3} />
        <path d="M -190 -10 Q -150 34 -80 34 L 120 34 Q 190 10 210 -22 L -190 -22 Z" fill="#6B4A2E" stroke="#2A1A10" strokeWidth={5} />
        <rect x={-60} y={-60} width={140} height={40} rx={8} fill="#D8C8A0" stroke="#2A1A10" strokeWidth={4} />
        <g transform="translate(150 -22)">
          <circle cx={0} cy={-120} r={26} fill="#2A2630" />
          <path d="M 0 -94 L -4 -10" stroke="#2A2630" strokeWidth={26} strokeLinecap="round" />
          <path d="M 10 -80 L 120 70" stroke="#3E2A18" strokeWidth={9} strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};

// ---------- S34: Hạnh answers across the water: she'll keep the bag by her; call when there's a vehicle ----------
export const S34: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 930], [len, 900]]), 530, kf(t, [[0, 1.7], [len, 1.85]]))}>
    <AnHouse id="c3s34" t={t} w={2} rain={0.8} chair={false} />
    <Hero look={HANH} pose={P({ x: 900, y: YARD.floorHip(1.05), scale: 1.05, yaw: 0.55, look: 0.6, headTilt: 2, expr: 'neutral', talk: talkAt(t, 2, 150), armR: { a: 70, b: 40 + 8 * Math.sin(t * 0.15) }, armL: { a: 12, b: 18 } }, t, 3)} rimId="filmL" shadow={0} />
  </g>
);

// ---------- S35: high wide: the alley under rain, doors lit, the water a skin the length of it; nobody knows when it will end ----------
export const S35: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, kf(t, [[0, 600], [len, 560]]), kf(t, [[0, 1.2], [len, 1.1]]))}>
    <Alley id="c3s35" t={t} w={2} rain={1} water={1} />
  </g>
);

// ---------- S36: upstairs again: An sets the last duffel on the pile in the corner, Hạnh folds a blanket; the rain at the window; hold ----------
export const S36: React.FC<ShotProps> = ({ t, len }) => {
  const pile = ATT.P(0.1, 1, 0.42);
  const k = ATT.s(0.42) * 0.78;
  const a = stand(ATT, 0.36, 0.5);
  const h = stand(ATT, 0.66, 0.58);
  const put = kf(t, [[0, 0], [36, 1]]);
  const aPose = P({ x: a.x, y: a.y, scale: a.scale, yaw: -0.55, look: -0.4, expr: 'neutral', tilt: -10 * put, armL: { a: 74 - 24 * put, b: 40 }, armR: { a: 12, b: 20 } }, t, 1);
  const ja = joints(aPose);
  const hl = toWorld(aPose, ja.armL.end);
  const hr = toWorld(aPose, ja.armR.end);
  const hand = { x: hl.x, y: hl.y };
  const dest = { x: pile.x + 150 * k, y: pile.y - 88 * k };
  const bag = { x: hand.x + (dest.x - hand.x) * put, y: hand.y + 40 + (dest.y - hand.y) * put };
  const fold = Math.sin(t * 0.08);
  return (
    <g transform={camT(960, 520, kf(t, [[0, 1.0], [len, 1.08]]))}>
      <Attic id="c3s36" t={t + 400} bags={1} map />
      <Hero look={AN} pose={aPose} rimId="filmL" shadow={0} />
      {put < 1 ? <Duffel x={bag.x} y={bag.y + 60 * a.scale} s={a.scale * 0.8} c="#5E5C44" /> : <Duffel x={dest.x} y={dest.y + 88 * k * 0.0} s={k * 0.9} c="#5E5C44" />}
      <Hero look={HANH} pose={P({ x: h.x, y: h.y, scale: h.scale, yaw: 0.4, look: 0.5, tilt: 24, headTilt: 8, expr: 'neutral', armL: { a: 8, b: 30 }, armR: { a: 40 + 6 * fold, b: 44 - 6 * fold } }, t, 3)} rimId="filmR" shadow={0} />
      <rect x={h.x - 120 * h.scale} y={h.y + 120 * h.scale} width={220 * h.scale} height={30 * h.scale} rx={8} fill="#B5604F" stroke="#16141C" strokeWidth={3} />
    </g>
  );
};

export const SHOTS = {
  S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28, S29, S30, S31, S32, S33, S34, S35, S36,
};
