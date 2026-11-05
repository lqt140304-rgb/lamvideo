import React from 'react';
import {
  Hero, Pose, basePose, poseAt, kf, rnd, camT, LOOKS, blinkAt, joints, toWorld,
  flick, AnHouse, YARD, Alley, TownView, RoofRow, LivingRoom, AnKitchen, ANKITCHEN, stand, makeRoom, RoomShell, Box, FloorShadow, HEAD,
  Areca, Rain, Splashes, CloudBank, Dog, TearCalendar, TeaCup, Teapot, Foreground, Glow, LightVeil, Dust, FONT, ShotProps, Look,
} from '../../engine';

// Cảnh 1 — Ngày 1: Khi mây đen kéo tới. 37 shots; no two neighbours share a size or an angle (wide, macro, top-down,
// low, high, pan, over the shoulder, first person, from the object looking back at the character).

const AN = LOOKS.an;
const HANH = LOOKS.hanh;
const LINH = LOOKS.linh;
const SAU = LOOKS.baSau;
const CHILD = 0.62;

/** Alive when holding still: a breath, a slight head drift, the blink. */
const live = (pose: Pose, t: number, seed: number, talk = pose.talk ?? 0): Pose => ({
  ...pose,
  blink: blinkAt(t, seed),
  headTilt: pose.headTilt + 1.4 * Math.sin(t * 0.045 + seed),
  squash: pose.squash + 0.007 * Math.sin(t * 0.075 + seed),
  talk,
});
const P = (p: Partial<Pose>, t = 0, seed = 1): Pose => live({ ...basePose, ...p }, t, seed);
/** The mouth while the voice speaks this character's line (a to b on the shot's clock). */
const talkAt = (t: number, a: number, b: number) => (t < a || t > b ? 0 : Math.abs(Math.sin(t * 0.62)) * (0.5 + 0.5 * Math.abs(Math.sin(t * 0.21))));
const onDeck = (x: number, scale: number) => ({ x, y: YARD.floorHip(scale), scale });

/** A character from behind: the same rig with the face covered by the back of the head. */
const Back: React.FC<{ look: Look; pose: Pose }> = ({ look, pose }) => (
  <g>
    <Hero look={look} pose={pose} rimId="filmL" shadow={0} />
    {[-1, 1].map((sd) => <ellipse key={sd} cx={pose.x + sd * (HEAD.r + 2) * pose.scale} cy={pose.y + (HEAD.y + 6) * pose.scale} rx={9 * pose.scale} ry={14 * pose.scale} fill={look.skinShade} stroke={look.line} strokeWidth={3 * pose.scale} />)}
    <circle cx={pose.x} cy={pose.y + HEAD.y * pose.scale} r={(HEAD.r + 3) * pose.scale} fill={look.hair} />
    <ellipse cx={pose.x} cy={pose.y + (HEAD.y + HEAD.r - 9) * pose.scale} rx={30 * pose.scale} ry={12 * pose.scale} fill={look.skin} />
    <path d={`M ${pose.x - 40 * pose.scale} ${pose.y + (HEAD.y - 20) * pose.scale} Q ${pose.x} ${pose.y + (HEAD.y - 50) * pose.scale} ${pose.x + 40 * pose.scale} ${pose.y + (HEAD.y - 20) * pose.scale}`} stroke="#fff" strokeWidth={3 * pose.scale} opacity={0.1} fill="none" />
  </g>
);

/** The living room seen from the kitchen end: the front door in the middle onto the rain, the window on its right
 * (left from outside), the wooden set on the right, Linh's desk on the left. Same room as LivingRoom, turned round. */
const FRONT = makeRoom({ x: 960, y: 500 }, { x0: 420, x1: 1500, y0: 210, y1: 770 }, 3.3);
const LivingFront: React.FC<{ id: string; t: number; children?: React.ReactNode }> = ({ id, t, children }) => {
  const r = FRONT;
  const { P } = r;
  const k = r.s(0.46) / r.s(0);
  const tbl = P(0.76, 0.78, 0.46);
  const bulb = P(0.5, 0.2, 0.45);
  return (
    <g>
      <RoomShell r={r} id={id} floor="tiles" wall="#A98F4C" side="#8E7A3F" floorC="#6E5A48" ceiling="#3A3226" lines="#3E3226" />
      <rect x={800} y={300} width={320} height={470} fill="#92A0AC" />
      <rect x={800} y={690} width={320} height={80} fill="#5A5850" />
      <Rain t={t} seed={13} n={44} o={0.7} x0={800} y0={300} w={320} h={470} />
      <rect x={800} y={300} width={320} height={470} fill="none" stroke="#3A2616" strokeWidth={16} />
      <rect x={1210} y={350} width={230} height={200} fill="#8896A0" stroke="#5A4028" strokeWidth={11} />
      <Rain t={t} seed={5} n={22} o={0.6} x0={1216} y0={356} w={218} h={188} />
      <FloorShadow r={r} u={[0.56, 0.98]} w={[0.3, 0.62]} o={0.42} />
      <Box r={r} u={[0.88, 0.97]} v={[0.74, 0.79]} w={[0.3, 0.6]} front="#7A5636" top="#8E6A48" side="#6A4A2E" rim />
      <Box r={r} u={[0.96, 0.97]} v={[0.46, 0.79]} w={[0.3, 0.6]} front="#6A4A2E" side="#6A4A2E" />
      <Box r={r} u={[0.64, 0.84]} v={[0.76, 0.79]} w={[0.36, 0.56]} front="#7E5A3A" top="#94704E" side="#6A4A2E" rim />
      {[0.64, 0.825].map((u, i) => [0.37, 0.54].map((w, j) => <Box key={`${i}${j}`} r={r} u={[u, u + 0.015]} v={[0.79, 1]} w={[w, w + 0.015]} front="#4C3420" side="#3E2A18" />))}
      <Teapot x={tbl.x} y={tbl.y + 6} s={k * 0.72} />
      <Box r={r} u={[0.03, 0.3]} v={[0.7, 0.74]} w={[0, 0.16]} front="#6E4C30" top="#8E6A48" side="#5A3E26" rim />
      <Box r={r} u={[0.03, 0.05]} v={[0.74, 1]} w={[0.13, 0.16]} front="#553A24" side="#44301C" />
      <Box r={r} u={[0.28, 0.3]} v={[0.74, 1]} w={[0.13, 0.16]} front="#553A24" side="#44301C" />
      <path d={`M ${bulb.x} ${P(0.5, 0, 0.45).y} L ${bulb.x} ${bulb.y - 16}`} stroke="#1E1A16" strokeWidth={3} />
      <circle cx={bulb.x} cy={bulb.y} r={18} fill="#FFF0BE" />
      <LightVeil id={`${id}v`} lights={[[bulb.x, bulb.y + 60, 720], [960, 520, 300], [1325, 450, 220]]} o={0.56} />
      <Glow x={bulb.x} y={bulb.y} r={620} o={0.62 * flick(t)} />
      <Glow x={bulb.x} y={bulb.y} r={150} o={1} />
      <Glow x={960} y={520} r={340} kind="cool" o={0.3} />
      <Dust t={t} seed={8} x0={bulb.x - 300} y0={bulb.y} w={600} h={420} n={22} o={0.35} />
      {children}
    </g>
  );
};

/** The film's lettering, from the reference the channel owner chose: Comic Sans (it carries Vietnamese marks on Windows;
 * shortcut: a machine without it falls back to Patrick Hand, install the font before rendering elsewhere).
 * White, sentence case. It sinks slowly in from above, holds, dips a touch, then shoots back up out of frame. */
const LETTER = `'Comic Sans MS', ${FONT.hand}`;
const TitleDrop: React.FC<{ t: number; lines: [string, string][][]; small?: string; y?: number; hold?: number }> = ({ t, lines, small, y = 450, hold = 150 }) => {
  const dy = t < hold ? kf(t, [[0, -800], [64, 0]], (q) => 1 - Math.pow(1 - q, 2)) : kf(t, [[hold, 0], [hold + 7, 14]]) + kf(t, [[hold + 7, 0], [hold + 24, -1000]], (q) => q * q * q);
  return (
    <g transform={`translate(960 ${y + dy})`} textAnchor="middle" fontFamily={LETTER} fill="#FFFDF6" style={{ filter: 'drop-shadow(0 4px 10px rgba(20,10,0,0.85))' }}>
      {lines.map((l, i) => <text key={i} y={i * 165} fontSize={146} fontWeight={700} stroke="#2A1A10" strokeWidth={9} strokeLinejoin="round" style={{ paintOrder: 'stroke' }}>{l.map(([w, c], k) => <tspan key={k} fill={c}>{w}</tspan>)}</text>)}
      {small ? <text y={lines.length * 165 - 50} fontSize={50} stroke="#2A1A10" strokeWidth={5} strokeLinejoin="round" style={{ paintOrder: 'stroke' }}>{small}</text> : null}
    </g>
  );
};

// ---------- S1: extreme wide, the alley in the heat, the title over it ----------
export const S1: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.05]]))}>
      <Alley id="s1" t={t} w={0} shop />
      <Glow x={960} y={760} r={640} o={0.18} />
    </g>
    <TitleDrop t={t} lines={[[['Chuyện gì xảy ra nếu', '#FFF6DC']], [['mưa liên tục ', '#8FDcFF'], ['100 ngày?', '#FFC23D']]]} small="Giả định khoa học — nhân vật và lịch sự kiện là hư cấu" />
  </g>
);

// ---------- S2: macro at road level: heat shimmer over the concrete, a flip-flop mark, a dead leaf ----------
export const S2: React.FC<ShotProps> = ({ t, len }) => {
  const x = kf(t, [[0, 0], [len, -60]]);
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-100} y={-40} width={2200} height={460} fill="#F3C678" />
      <Glow x={1240} y={210} r={760} o={0.8} />
      <g filter="url(#blur6)">
        <rect x={-100} y={230} width={2200} height={190} fill="#BE9A68" />
        {[120, 520, 980, 1400, 1760].map((px, i) => <rect key={i} x={px} y={180 - i * 12} width={190} height={250} fill={['#CDAE80', '#B99F7C', '#D6BC8A', '#C4A47C', '#CDAE80'][i]} />)}
      </g>
      {Array.from({ length: 7 }).map((_, i) => {
        const yy = 300 + i * 22;
        return <path key={i} d={`M -100 ${yy} Q 300 ${yy - 10 + 8 * Math.sin(t * 0.3 + i)} 800 ${yy} T 2100 ${yy}`} stroke="#FFF2C8" strokeWidth={5} fill="none" opacity={0.26} />;
      })}
      <polygon points="-100,420 2100,420 2100,1120 -100,1120" fill="#A88E6E" />
      {Array.from({ length: 150 }).map((_, i) => {
        const yy = 430 + Math.pow(rnd(2, i), 1.7) * 660;
        const k = 0.35 + (yy - 430) / 420;
        return <ellipse key={i} cx={-100 + rnd(3, i) * 2200} cy={yy} rx={(3 + rnd(4, i) * 11) * k} ry={(1.5 + rnd(5, i) * 3) * k} fill={rnd(6, i) > 0.5 ? '#8C7458' : '#BFA686'} />;
      })}
      <path d="M 40 1120 L 460 660 L 610 520 M 460 660 L 340 640 M 460 660 L 520 790" stroke="#715A42" strokeWidth={7} fill="none" />
      <path d="M 1500 1120 L 1300 780 L 1240 610 M 1300 780 L 1420 760 M 1300 780 L 1200 830" stroke="#715A42" strokeWidth={6} fill="none" />
      <g transform="translate(980 790) rotate(-12)">
        <ellipse cx={8} cy={26} rx={150} ry={24} fill="#000" opacity={0.3} />
        <path d="M -140 8 Q -60 -56 70 -32 Q 150 -14 160 20 Q 40 44 -140 8 Z" fill="#8E6A34" />
        <path d="M -140 8 Q 20 -10 160 20 M -60 -6 L -40 -36 M 10 -4 L 40 -32 M 70 2 L 100 -22" stroke="#5E4620" strokeWidth={4} fill="none" />
      </g>
    </g>
  );
};

// ---------- S3: low angle up the trunks: the fronds hang limp against the white sky ----------
export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <rect width={1920} height={1080} fill="#F6D48C" />
    <Glow x={1320} y={260} r={900} o={0.95} />
    <Glow x={1320} y={260} r={220} o={1} />
    <g transform={`translate(0 ${kf(t, [[0, 40], [len, 0]])})`}>
      <Areca x={560} y={1860} s={2.7} droop={1} t={t} seed={9} leaf="#6A6E34" dark="#2E2618" />
      <Areca x={1560} y={1640} s={2} droop={1} t={t} seed={4} leaf="#7D7A3C" dark="#3E3220" />
    </g>
    <polygon points="-20,1100 -20,830 620,1000 720,1100" fill="#3A2A1E" />
    <polygon points="1940,1100 1940,880 1400,1040 1320,1100" fill="#3A2A1E" />
  </g>
);

// ---------- S4: top-down over the cracked vegetable bed ----------
const Crack: React.FC<{ seed: number }> = ({ seed }) => (
  <g stroke="#3A2518" strokeLinecap="round" fill="none">
    {Array.from({ length: 34 }).map((_, i) => {
      const x = rnd(seed, i) * 1960 - 20;
      const y = rnd(seed + 1, i) * 1120 - 20;
      const a = rnd(seed + 2, i) * 6.28;
      const l = 60 + rnd(seed + 3, i) * 150;
      const b = a + 0.9 - rnd(seed + 4, i) * 1.8;
      const mx = x + Math.cos(a) * l;
      const my = y + Math.sin(a) * l;
      return <path key={i} d={`M ${x} ${y} L ${mx} ${my} L ${mx + Math.cos(b) * l * 0.8} ${my + Math.sin(b) * l * 0.8}`} strokeWidth={4 + rnd(seed + 5, i) * 9} />;
    })}
  </g>
);
export const S4: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={`translate(960 540) rotate(${kf(t, [[0, -2], [len, 1]])}) scale(${kf(t, [[0, 1.06], [len, 1.14]])}) translate(-960 -540)`}>
    <rect x={-80} y={-80} width={2080} height={1240} fill="#A77B50" />
    {Array.from({ length: 60 }).map((_, i) => <ellipse key={i} cx={rnd(12, i) * 1920} cy={rnd(13, i) * 1080} rx={40 + rnd(14, i) * 90} ry={20 + rnd(15, i) * 40} fill={rnd(16, i) > 0.5 ? '#B58A5C' : '#94693F'} opacity={0.5} />)}
    <Crack seed={21} />
    {/* rows of dead seedlings across the bed */}
    {[260, 560, 860].map((y, r) =>
      Array.from({ length: 7 }).map((_, i) => {
        const x = 150 + i * 270 + r * 50;
        return (
          <g key={`${r}${i}`} transform={`translate(${x} ${y})`}>
            <ellipse cx={8} cy={8} rx={46} ry={16} fill="#000" opacity={0.25} />
            {[-1, -0.4, 0.4, 1].map((dx, k) => <path key={k} d={`M 0 0 Q ${dx * 30} -16 ${dx * 58} ${10 - rnd(r + 3, i + k) * 22}`} stroke={k % 2 ? '#8C7A3C' : '#7A6A34'} strokeWidth={9} fill="none" strokeLinecap="round" />)}
          </g>
        );
      }),
    )}
    {/* a low hard shadow of the fence falling across it */}
    <polygon points="-80,-80 2000,-80 2000,70 -80,190" fill="#2C1C10" opacity={0.42} />
  </g>
);

// ---------- S5: extreme wide, far over town: the storm edge rolls in from the left over the mountains ----------
export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const front = kf(t, [[0, 0.5], [len, 0.84]]);
  return (
    <g transform={camT(960, 500, 1.02)}>
      <TownView id="s5" t={t} w={0} horizon={560} />
      <defs>
        <linearGradient id="s5shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset={front - 0.3} stopColor="#141620" stopOpacity={0.88} />
          <stop offset={front + 0.12} stopColor="#141620" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={-100} y={-100} width={2120} height={1300} fill="url(#s5shade)" />
      {/* the storm's wall of cloud, its edge moving right */}
      <CloudBank x={(front - 1) * 1500} y={330} h={150} w={1900} n={34} color="#1C1F28" lit="#4C525E" seed={21} blur={16} />
      <CloudBank x={(front - 1) * 1500 + 60} y={210} h={110} w={1800} n={30} color="#14161E" seed={24} blur={16} />
      <Glow x={1680} y={250} r={420} o={0.55} />
    </g>
  );
};

// ---------- S6: pan left to right over the roofs under the closing sky ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 660], [len, 1260]]), 640, 1.3)}>
    <TownView id="s6" t={t + 90} w={1} horizon={420} river={false} />
    <CloudBank x={t * 0.8} y={360} h={120} color="#20232C" seed={73} blur={6} />
  </g>
);

// ---------- S7: over the shoulder of a neighbour at the head of the alley: grey to the end of sight, held through the pause ----------
export const S7: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 520, kf(t, [[0, 1.0], [len, 1.1]]))}>
    <Alley id="s7" t={t} w={1} wind={0.3} />
    <rect x={-200} y={-200} width={2320} height={700} fill="#000" opacity={0.18} />
    <Foreground blur={6}>
      <g transform={`translate(${kf(t, [[0, 310], [len, 360]])} 640) scale(1.75)`}>
        <path d="M -150 300 Q -150 90 -68 66 Q 0 50 68 66 Q 150 90 150 300 Z" fill="#20222A" />
        <circle cx={0} cy={-14} r={80} fill="#14141A" />
      </g>
    </Foreground>
  </g>
);

// ---------- S38: the other way, to the mountains behind town: a slow tilt up a sky with no end to it ----------
export const S38: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 1020]]), kf(t, [[0, 620], [len, 400]]), 1.2)}>
    <TownView id="s38" t={t + 200} w={1} horizon={560} river={false} />
    <CloudBank x={t * 0.7} y={320} h={150} color="#20232C" lit="#4C525E" seed={77} blur={10} />
    <CloudBank x={-t * 0.4} y={150} h={140} color="#191B24" seed={79} blur={16} />
  </g>
);

// ---------- S8: road-level wide, the gust: dust and a sheet of paper race down the alley, the tarp bucks ----------
export const S8: React.FC<ShotProps> = ({ t }) => {
  const px = kf(t, [[0, -100], [70, 2020]]);
  return (
    <g transform={camT(960, 640, 1.12)}>
      <Alley id="s8" t={t} w={1} wind={1} />
      <g opacity={0.4} stroke="#D9D1BD" strokeLinecap="round">
        {Array.from({ length: 16 }).map((_, i) => {
          const x = ((rnd(4, i) * 2400 + t * (18 + rnd(5, i) * 18)) % 2400) - 200;
          const y = 720 + rnd(6, i) * 340;
          return <line key={i} x1={x} y1={y} x2={x - 90 - rnd(7, i) * 120} y2={y + 4} strokeWidth={2 + rnd(8, i) * 3} />;
        })}
      </g>
      <g transform={`translate(${px} ${900 - 150 * Math.abs(Math.sin(t * 0.13))}) rotate(${t * 9}) scale(1.2)`}>
        <rect x={-36} y={-24} width={72} height={50} fill="#E8E0CC" />
        <path d="M -26 -10 L 26 -10 M -26 2 L 26 2" stroke="#7A7464" strokeWidth={3} />
      </g>
    </g>
  );
};

// ---------- S9: low angle, bà Sáu steps out of the shop and looks up ----------
const ShopFront: React.FC<{ id: string; t: number; tarp?: number; wind?: number; rain?: number }> = ({ id, t, tarp = 1, wind = 0, rain = 0 }) => (
  <g>
    <rect x={-300} y={-300} width={2520} height={1000} fill="#3C4250" />
    <CloudBank x={t * 0.5} y={110} h={110} color="#272A34" seed={81} />
    <rect x={200} y={120} width={1520} height={660} fill="#7E7A5E" />
    <rect x={200} y={120} width={1520} height={80} fill="#000" opacity={0.35} />
    {/* shelves of the tạp hóa, lit by its own bulb */}
    <rect x={390} y={240} width={960} height={540} fill="#3A2C1E" />
    {[0, 1, 2].map((r) => (
      <g key={r}>
        <rect x={400} y={350 + r * 130} width={940} height={10} fill="#6B4A2E" />
        {Array.from({ length: 24 }).map((_, i) => {
          const h = 40 + rnd(r + 2, i) * 54;
          return <rect key={i} x={414 + i * 38} y={350 + r * 130 - h} width={30} height={h} rx={3} fill={['#C8503C', '#E0B040', '#3F8A7C', '#E8E0CC', '#5F7E96', '#B5604F'][Math.floor(rnd(r + 5, i) * 6)]} />;
        })}
      </g>
    ))}
    <rect x={1400} y={260} width={240} height={520} fill="#2C2218" stroke="#4E3826" strokeWidth={10} />
    <rect x={-300} y={780} width={2520} height={400} fill="#3E3F40" />
    {/* the counter and crates out front, the low stool */}
    <rect x={300} y={650} width={560} height={130} fill="#6B4E36" stroke="#3E2A18" strokeWidth={6} />
    <rect x={320} y={620} width={110} height={30} fill="#D9A24C" />
    <rect x={470} y={606} width={130} height={44} fill="#C8503C" />
    <rect x={1470} y={712} width={150} height={16} fill="#6B4A2E" />
    <path d="M 1484 728 L 1484 790 M 1606 728 L 1606 790" stroke="#4C3420" strokeWidth={10} />
    <path d="M 860 240 L 860 268" stroke="#1E1A16" strokeWidth={3} />
    <circle cx={860} cy={276} r={13} fill="#FFEDB8" />
    <LightVeil id={`${id}v`} lights={[[860, 400, 660]]} o={0.42} />
    <Glow x={860} y={276} r={560} o={0.7} />
    <Glow x={860} y={276} r={110} o={1} />
    {/* the tarp out over the front: `tarp` 1 up on its poles, 0 still rolled under the eaves */}
    <polygon points={`120,${124} 1800,${124} ${1860},${124 + 150 * tarp + wind * 14 * Math.sin(t * 0.5)} ${60},${124 + 150 * tarp - wind * 14 * Math.sin(t * 0.4)}`} fill="#3A7482" />
    {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M ${260 + i * 280} 124 L ${180 + i * 300} ${124 + 150 * tarp}`} stroke="#2A5864" strokeWidth={24} opacity={0.6} />)}
    {rain > 0 ? <g><Splashes t={t} x0={-100} x1={2020} y0={800} y1={1060} o={0.55 * rain} /><Rain t={t} o={0.38 * rain} /></g> : null}
  </g>
);
export const S9: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 1000, y: 640, scale: 1.02, yaw: -0.3, tilt: -3, headTilt: -14, look: -0.3, expr: 'worried', armR: { a: 18, b: 14 }, armL: { a: 22, b: 40 } } },
    { f: 40, p: { armL: { a: 70, b: 70 } } },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 980], [len, 1010]]), 480, kf(t, [[0, 1.4], [len, 1.5]]))}>
      <ShopFront id="s9" t={t} wind={0.9} tarp={0.7} />
      <Hero look={SAU} pose={live(pose, t, 2)} rimId="filmL" shadow={1} />
    </g>
  );
};

// ---------- S10: medium, the kitchen: Hạnh hauls the banging back door ----------
export const S10: React.FC<ShotProps> = ({ t, len }) => {
  const s = stand(ANKITCHEN, 0.6, 0.32);
  const pose = poseAt(t, [
    { f: 0, p: { x: s.x, y: s.y, scale: s.scale, yaw: 0.72, tilt: -4, look: 0.6, expr: 'worried', armR: { a: 74, b: 26 }, armL: { a: -66, b: -26 }, legL: { a: 22, b: 0 }, legR: { a: -18, b: 0 } } },
    { f: 26, p: { tilt: -13, armR: { a: 84, b: 12 }, armL: { a: -76, b: -12 } } },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 1040], [len, 1000]]), 560, kf(t, [[0, 1.4], [len, 1.46]]))}>
      <AnKitchen id="s10" t={t} w={1} door={kf(t, [[0, 0.55], [24, 0.85], [38, 0.7]])} />
      <Hero look={HANH} pose={live(pose, t, 3)} rimId="filmL" shadow={1} />
    </g>
  );
};

// ---------- S11: top-down over the desk: Linh's hand lets the pen fall on the exercise book ----------
const HandTop: React.FC<{ x: number; y: number; rot?: number; s?: number; skin?: string; sleeve?: string }> = ({ x, y, rot = 0, s = 1, skin = LINH.skin, sleeve = LINH.jacket }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 0 -150 L 0 -340 L 170 -640" stroke="#16141C" strokeWidth={112} fill="none" strokeLinejoin="round" />
    <path d="M 0 -150 L 0 -340 L 170 -640" stroke={sleeve} strokeWidth={102} fill="none" strokeLinejoin="round" />
    <path d="M -50 -176 L 50 -176" stroke="#16141C" strokeWidth={6} />
    <path d="M -40 -176 L 40 -176 L 46 -60 L -46 -60 Z" fill={skin} stroke="#16141C" strokeWidth={5} />
    {[-30, -11, 9, 28].map((fx, i) => (
      <g key={i}>
        <path d={`M ${fx} 28 L ${fx * 1.25} ${[86, 104, 104, 86][i]}`} stroke="#16141C" strokeWidth={24} strokeLinecap="round" />
        <path d={`M ${fx} 28 L ${fx * 1.25} ${[86, 104, 104, 86][i]}`} stroke={skin} strokeWidth={17} strokeLinecap="round" />
      </g>
    ))}
    <path d="M 40 -24 L 84 30" stroke="#16141C" strokeWidth={26} strokeLinecap="round" />
    <path d="M 40 -24 L 84 30" stroke={skin} strokeWidth={19} strokeLinecap="round" />
    <path d="M -46 -70 Q -60 10 -40 44 L 40 44 Q 60 10 46 -70 Z" fill={skin} stroke="#16141C" strokeWidth={5} />
  </g>
);
export const S11: React.FC<ShotProps> = ({ t, len }) => {
  const ly = kf(t, [[0, 620], [14, 610], [30, 300]]);
  return (
    <g transform={`translate(960 540) rotate(-3) scale(${kf(t, [[0, 1.0], [len, 1.05]])}) translate(-960 -540)`}>
      <rect x={-80} y={-80} width={2080} height={1240} fill="#6E4C30" />
      {Array.from({ length: 22 }).map((_, i) => <path key={i} d={`M -80 ${-60 + i * 54} Q 900 ${-48 + i * 54} 2000 ${-66 + i * 54}`} stroke="#5A3E26" strokeWidth={4} fill="none" />)}
      <g transform="translate(860 560) rotate(4)">
        <rect x={-430} y={-296} width={860} height={592} fill="#000" opacity={0.35} transform="translate(14 14)" />
        <rect x={-430} y={-296} width={860} height={592} fill="#F1EADA" />
        <path d="M 0 -296 L 0 296" stroke="#BDB39C" strokeWidth={6} />
        {Array.from({ length: 11 }).map((_, i) => <path key={i} d={`M -410 ${-256 + i * 50} L 410 ${-256 + i * 50}`} stroke="#9CB3C8" strokeWidth={3} />)}
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M -390 ${-216 + i * 50} q 60 -24 100 0 t 110 -6 t 90 4`} stroke="#2F4A7A" strokeWidth={6} fill="none" />)}
      </g>
      <g transform={`translate(${kf(t, [[0, 900], [14, 930]])} ${kf(t, [[0, 620], [14, 660]])}) rotate(${kf(t, [[0, 40], [14, 66], [20, 60]])})`}>
        <rect x={-120} y={-10} width={240} height={20} fill="#C8322A" />
        <polygon points="120,-10 150,0 120,10" fill="#E8D8B0" />
      </g>
      <HandTop x={kf(t, [[0, 1180], [16, 1180], [38, 2500]])} y={ly} rot={98} s={1.2} />
      {/* the window's grey, the lamp's warm */}
      <Glow x={1660} y={200} r={760} kind="cool" o={0.45} />
      <rect x={-80} y={-80} width={2080} height={1240} fill="#000" opacity={0.1} />
    </g>
  );
};

// ---------- S12: THE extreme close-up: one drop on hot brick, its crown and a stain ----------
const DROPS = [[16, 960, 716, 1], [64, 720, 800, 0.8], [100, 1220, 620, 0.6], [124, 860, 560, 0.5], [136, 1130, 830, 0.7]];
const BrickDrop: React.FC<{ t: number; at: number; x: number; y: number; k: number; seed: number }> = ({ t, at, x, y, k, seed }) => {
  const c = t - at;
  if (c < -16) return null;
  if (c < 0) {
    const dy = kf(t, [[at - 16, -220], [at, y - 150]], (q) => q * q);
    return (
      <g transform={`translate(${x} ${dy + 130}) scale(${k})`}>
        <path d="M 0 -130 Q 42 -40 42 0 A 42 42 0 1 1 -42 0 Q -42 -40 0 -130 Z" fill="#CFE4F2" opacity={0.92} />
        <ellipse cx={-14} cy={-6} rx={9} ry={16} fill="#fff" />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx={x} cy={y} rx={Math.min(210, 60 + c * 17) * k} ry={Math.min(58, 18 + c * 5) * k} fill="#5A2E1A" opacity={0.85} />
      <ellipse cx={x} cy={y} rx={(30 + c * 16) * k} ry={(8 + c * 4) * k} fill="none" stroke="#E8EEF4" strokeWidth={5} opacity={Math.max(0, 0.9 - c / 18)} />
      {Array.from({ length: 11 }).map((_, i) => {
        const a = (-Math.PI * (i + 0.5)) / 11;
        const r = c * (8 + rnd(9 + seed, i) * 8) * k;
        const px = x + Math.cos(a) * r * 1.6;
        const py = y + Math.sin(a) * r * 1.5 + c * c * 0.5 * k;
        return py < y + 14 ? <circle key={i} cx={px} cy={py} r={(9 - i % 4) * k} fill="#EAF2F8" opacity={0.92} /> : null;
      })}
    </g>
  );
};
export const S12: React.FC<ShotProps> = ({ t, len }) => {
  return (
    <g transform={camT(960, 640, kf(t, [[0, 1.9], [len, 2.1]]))}>
      <rect x={-100} y={-100} width={2120} height={500} fill="#3A3B44" />
      <Glow x={1500} y={200} r={700} kind="cool" o={0.28} />
      <g filter="url(#blur16)">
        <rect x={-100} y={320} width={2120} height={100} fill="#7A4E36" />
        {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={-100 + i * 300} y={370} width={280} height={60} fill="#8E5C40" />)}
      </g>
      <polygon points="-100,420 2020,420 2400,1180 -480,1180" fill="#A65E3A" />
      {[[-480, 560], [-240, 690], [120, 880]].map(([, y], r) => <path key={r} d={`M -480 ${y} L 2400 ${y}`} stroke="#5A2E1A" strokeWidth={8 + r * 7} />)}
      {Array.from({ length: 18 }).map((_, i) => <path key={i} d={`M ${-60 + i * 130} 420 L ${(i - 8.5) * 340 + 960} 1180`} stroke="#5A2E1A" strokeWidth={6} opacity={0.75} />)}
      {Array.from({ length: 90 }).map((_, i) => <circle key={i} cx={rnd(5, i) * 2000} cy={430 + rnd(6, i) * 720} r={1.5 + rnd(7, i) * 5} fill={rnd(8, i) > 0.5 ? '#C27A50' : '#7C4428'} opacity={0.7} />)}
      {DROPS.map(([at, x, y, k], i) => <BrickDrop key={i} t={t} at={at} x={x} y={y} k={k} seed={i} />)}
    </g>
  );
};

// ---------- S13: high wide, the rain arrives on every tin roof ----------
export const S13: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, kf(t, [[0, 640], [len, 590]]), 1.4)}>
    <TownView id="s13" t={t} w={2} horizon={250} rain={1} />
    <RoofRow y={1040} s={1.9} seed={47} w={2} />
    <Rain t={t} n={90} near o={0.45} seed={12} />
  </g>
);

// ---------- S14: ground-level close: the dry bed drinks; a green seedling straightens ----------
export const S14: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={`translate(${kf(t, [[0, 40], [len, -40]])} 0)`}>
    <rect x={-100} y={-100} width={2200} height={700} fill="#596069" />
    <g filter="url(#blur10)">
      <rect x={-100} y={320} width={2200} height={240} fill="#3E4A3A" />
      <rect x={1040} y={120} width={1200} height={460} fill="#5E5436" />
      <polygon points="980,120 1640,20 2300,120" fill="#333A44" />
      <rect x={1400} y={250} width={110} height={150} fill="#C88E4C" />
    </g>
    <Glow x={1455} y={325} r={300} o={0.35} />
    <polygon points="-100,560 2100,520 2100,1180 -100,1180" fill="#4A3224" />
    <clipPath id="s14soil"><polygon points="-100,560 2100,520 2100,1180 -100,1180" /></clipPath>
    <g clipPath="url(#s14soil)" opacity={0.6}><Crack seed={33} /></g>
    {[300, 760, 1240, 1680].map((x, i) => (
      <g key={i} transform={`translate(${x} ${680 + (i % 2) * 110}) scale(${1.5 + (i % 2) * 0.6}) rotate(${3 * Math.sin(t * 0.21 + i * 2)})`}>
        <ellipse cx={0} cy={6} rx={70} ry={14} fill="#2A1A10" />
        {[-1, -0.5, 0, 0.5, 1].map((dx, k) => (
          <path key={k} d={`M 0 0 Q ${dx * 26} -60 ${dx * 66} ${-96 + Math.abs(dx) * 40}`} stroke={k % 2 ? '#5C8A3A' : '#6E9C44'} strokeWidth={13} fill="none" strokeLinecap="round" />
        ))}
      </g>
    ))}
    <Splashes t={t} x0={-100} x1={2100} y0={600} y1={1080} n={70} o={0.7} />
    <Rain t={t} n={110} o={0.45} />
  </g>
);

// ---------- S15: a very wide, the reservoir in the hills starting to fill: the waterline rises on the stained bank ----------
export const S15: React.FC<ShotProps> = ({ t, len }) => {
  const lvl = kf(t, [[0, 730], [len, 700]]);
  return (
    <g transform={camT(kf(t, [[0, 900], [len, 1020]]), 540, 1.04)}>
      <rect x={-100} y={-100} width={2200} height={800} fill="#4F5966" />
      <CloudBank x={t * 0.4} y={190} h={160} color="#333A47" lit="#5C6470" seed={91} />
      <path d="M -100 600 L 200 330 L 480 520 L 860 260 L 1180 500 L 1500 310 L 2100 610 L 2100 800 L -100 800 Z" fill="#2E3A34" />
      <path d="M -100 730 Q 500 600 960 640 T 2100 720 L 2100 900 L -100 900 Z" fill="#6B5B48" />
      <path d="M -100 740 Q 500 640 960 670 T 2100 730 L 2100 900 L -100 900 Z" fill="#7E6C56" />
      <rect x={-100} y={lvl} width={2200} height={500} fill="#6A7B86" />
      <rect x={-100} y={lvl} width={2200} height={8} fill="#B8C6CE" opacity={0.7} />
      {/* the concrete intake tower and its walkway */}
      <rect x={1420} y={lvl - 170} width={100} height={210} fill="#7E7C72" />
      <rect x={1400} y={lvl - 190} width={140} height={22} fill="#5E5C54" />
      <path d={`M 1540 ${lvl - 180} L 2100 ${lvl - 260}`} stroke="#4E4C46" strokeWidth={10} />
      <circle cx={1470} cy={lvl - 205} r={10} fill="#FFE9B0" />
      <Glow x={1470} y={lvl - 205} r={240} o={0.8} />
      <Splashes t={t} x0={-100} x1={2100} y0={lvl + 30} y1={1060} n={60} o={0.6} />
      <Rain t={t} o={0.34} />
    </g>
  );
};

// ---------- S16: macro, the tea on the sill: steam, lamp behind, rain on the far side of the glass ----------
export const S16: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 920], [len, 980]]), 560, 1.04)}>
    <rect x={-100} y={-100} width={2200} height={900} fill="#5F6A74" />
    <g filter="url(#blur16)">
      <rect x={-100} y={460} width={2200} height={340} fill="#2F3A30" />
      {[200, 760, 1400, 1760].map((x, i) => <rect key={i} x={x} y={120 + i * 22} width={22} height={520} fill="#20262A" />)}
    </g>
    <Rain t={t} n={80} near o={0.3} seed={17} />
    <rect x={-100} y={-100} width={220} height={900} fill="#2E2014" />
    <rect x={1820} y={-100} width={300} height={900} fill="#2E2014" />
    <rect x={-100} y={760} width={2200} height={420} fill="#6E4C30" />
    <rect x={-100} y={760} width={2200} height={18} fill="#A67C50" />
    {Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M -100 ${810 + i * 46} Q 900 ${820 + i * 46} 2100 ${804 + i * 46}`} stroke="#5A3E26" strokeWidth={5} fill="none" />)}
    <TeaCup x={960} y={880} s={5.4} t={t} />
    <Teapot x={1470} y={840} s={3.2} />
    {/* the lamp's warmth comes from camera left and pools on the wood */}
    <Glow x={480} y={560} r={880} o={0.5} />
    <Glow x={960} y={740} r={420} o={0.5} />
  </g>
);

// ---------- S17: from behind An under the veranda: the rain softens the palms ----------
export const S17: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.05]]))}>
    <rect width={1920} height={1080} fill="#7D8A95" />
    <g filter="url(#blur6)">
      <rect x={-100} y={330} width={2120} height={420} fill="#6C7277" />
      {[[100, 280], [1400, 300]].map(([x, h], i) => <rect key={i} x={x} y={560 - h} width={500} height={h + 200} fill="#5C5F5E" />)}
      <polygon points="50,290 340,190 650,290" fill="#3E454E" />
      <polygon points="1350,270 1660,170 1960,270" fill="#3E454E" />
    </g>
    <g opacity={0.9} filter="url(#blur3)">
      {[350, 960, 1560].map((x, i) => <Areca key={i} x={x} y={1000} s={1.15} droop={0.25} t={t} seed={i + 2} leaf="#3C5A3C" dark="#2A2A28" />)}
    </g>
    <rect y={760} width={1920} height={320} fill="#5A4238" />
    <Splashes t={t} x0={0} x1={1920} y0={770} y1={960} o={0.7} />
    <Rain t={t} o={0.55} />
    {/* the veranda: dark awning overhead, deck below, posts: a frame in the frame */}
    <polygon points="-40,-20 1960,-20 1960,110 -40,190" fill="#22262E" />
    {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={80 + i * 196} y1={110 + (9 - i) * 8} x2={80 + i * 196} y2={110 + (9 - i) * 8 + 40 + ((t * 2.8 + i * 13) % 26)} stroke="#D8E4EC" strokeWidth={3} opacity={0.65} />)}
    <rect x={-40} y={968} width={2000} height={150} fill="#2A2824" />
    <rect x={1630} y={100} width={80} height={880} fill="#1A1410" />
    <Glow x={960} y={80} r={700} o={0.4} />
    {/* An himself: his back, a warm rim from the door behind us */}
    <Back look={AN} pose={P({ x: 640, y: 800, scale: 2.1, armL: { a: 8, b: 6 }, armR: { a: 8, b: 6 } })} />
    <LightVeil id="s17v" lights={[[1000, 480, 880]]} o={0.3} />
  </g>
);

// ---------- S18: high angle: the alley's end, two rows of low roofs, the river with a moored boat ----------
export const S18: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 780], [len, 1090]]), 540, 1.18)}>
    <rect x={-300} y={-300} width={2520} height={1800} fill="#3C3E3A" />
    {/* the river across the top */}
    <polygon points="-300,-300 2220,-300 2220,190 -300,250" fill="#6D7E88" />
    {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M ${-250 + i * 420 + rnd(3, i) * 60} ${60 + rnd(2, i) * 120} q 90 -8 190 0`} stroke="#AAB9C2" strokeWidth={3} fill="none" opacity={0.5} />)}
    <g transform="translate(980 120) rotate(-6)">
      <path d="M -90 0 Q -60 34 0 34 L 90 26 Q 118 8 110 -8 L -90 -8 Z" fill="#6B4A2E" />
      <rect x={-20} y={-34} width={64} height={28} fill="#D8C8A0" />
    </g>
    <path d="M -300 250 L 2220 190 L 2220 230 L -300 290 Z" fill="#5E5A4E" />
    {/* two rows of low houses, from straight above and a little to the side */}
    {[[330, 0], [620, 1]].map(([y, r]) => Array.from({ length: 9 }).map((_, i) => {
      const x = -280 + i * 276 + (r ? 90 : 0);
      const c = ['#5C4A3E', '#6A5A4C', '#4E4A46', '#62503F'][Math.floor(rnd(r + 3, i) * 4)];
      return (
        <g key={`${r}${i}`}>
          <polygon points={`${x},${y} ${x + 242},${y} ${x + 262},${y + 150} ${x + 20},${y + 150}`} fill={c} />
          <polygon points={`${x + 120},${y} ${x + 242},${y} ${x + 262},${y + 150} ${x + 136},${y + 150}`} fill="#000" opacity={0.22} />
          {Array.from({ length: 9 }).map((_, k) => <path key={k} d={`M ${x + 12 + k * 26} ${y} L ${x + 26 + k * 26} ${y + 150}`} stroke="#000" strokeWidth={2} opacity={0.1} />)}
          <rect x={x + 22} y={y + 150} width={240} height={46} fill="#5A5C50" />
          {(i + r) % 3 === 0 ? <g><rect x={x + 120} y={y + 158} width={44} height={36} fill="#FFC470" /><Glow x={x + 142} y={y + 180} r={120} o={0.5} /></g> : null}
        </g>
      );
    }))}
    {/* the alley between, An's house at the bottom */}
    <rect x={-300} y={840} width={2520} height={120} fill="#4A4C4E" />
    <polygon points="760,970 1270,970 1300,1160 730,1160" fill="#3C424C" />
    <Areca x={690} y={1220} s={0.6} droop={0.25} t={t} seed={7} leaf="#2E4230" dark="#1E2020" />
    <Rain t={t} o={0.4} slant={0.05} />
  </g>
);

// ---------- S19: front wide of the house in rain: the whole set-up, tầng trệt and the gác, warm windows ----------
export const S19: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 960]]), 480, kf(t, [[0, 0.98], [len, 1.03]]))}>
    <AnHouse id="s19" t={t} w={2} rain={1} palms={0.25} />
    <Hero look={AN} pose={P({ ...onDeck(1030, 0.82), yaw: kf(t, [[0, 0.2], [50, 0.5], [120, 0.2]]), look: 0.2, headTilt: kf(t, [[0, 0], [50, -7], [120, 0]]), armL: { a: 12, b: 10 }, armR: { a: 12, b: 10 } }, t, 1)} rimId="filmL" />
    <Foreground blur={16}>
      <path d="M -120 1120 L -80 760 Q 40 650 150 760 Q 210 860 240 1120 Z" fill="#14120E" />
    </Foreground>
  </g>
);

// ---------- S20: wide inside: the swept living room, the bulb really burning ----------
export const S20: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 520, kf(t, [[0, 0.96], [len, 1.02]]))}>
    <LivingRoom id="s20" t={t} />
  </g>
);

// ---------- S21: pan left to right along the room: the wooden set, the door, Linh's desk ----------
export const S21: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 640], [len, 1270]]), 640, 1.95)}>
    <LivingRoom id="s21" t={t + 200} />
    <Foreground blur={10}>
      <rect x={kf(t, [[0, 760], [len, 820]])} y={200} width={70} height={900} fill="#1A120C" />
    </Foreground>
  </g>
);

// ---------- S22: through the kitchen door to the vegetable beds: a frame inside a frame ----------
export const S22: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 1040], [len, 1100]]), 520, kf(t, [[0, 1.5], [len, 1.62]]))}>
    <AnKitchen id="s22" t={t} w={2} rain={1} veil={0.56} />
    <Foreground blur={10}>
      <rect x={480} y={-100} width={170} height={1300} fill="#17110C" />
    </Foreground>
  </g>
);

// ---------- S23: medium side-on: Linh squats by the pots ----------
export const S23: React.FC<ShotProps> = ({ t, len }) => {
  const s = 0.72;
  return (
    <g transform={camT(kf(t, [[0, 1260], [len, 1240]]), 590, kf(t, [[0, 1.98], [len, 2.06]]))}>
      <AnHouse id="s23" t={t} w={2} rain={1} chair={false} />
      <Hero look={LINH} pose={P({ x: 1072, y: 724, scale: s, yaw: 0.72, look: 0.7, expr: 'happy', tilt: 16, armR: { a: 62 + 6 * Math.sin(t * 0.14), b: 20 }, armL: { a: -54 - 5 * Math.sin(t * 0.14 + 1), b: -24 }, legL: { a: 88, b: -130 }, legR: { a: 76, b: -130 } }, t, 4)} rimId="filmL" shadow={0} />
      <ellipse cx={1090} cy={766} rx={62} ry={9} fill="#000" opacity={0.32} />
    </g>
  );
};

// ---------- S24: medium: Hạnh at the kitchen table, both hands in the basin; on her second run she looks up and calls ----------
const RICE_FLOOD = '#E4E3D6';
export const S24: React.FC<ShotProps> = ({ t, len }) => {
  const calling = kf(t, [[96, 0], [104, 1]]);
  const stir = Math.sin(t * 0.26);
  const pose = P({
    x: 930, y: 690, scale: 1.25,
    yaw: -0.35 * calling, look: -0.6 * calling, headTilt: 9 * (1 - calling), tilt: 3 * (1 - calling),
    expr: calling > 0.5 ? 'neutral' : 'happy',
    talk: talkAt(t, 98, 145),
    armL: { a: -8 + 6 * stir, b: -8 }, armR: { a: -8 - 6 * stir, b: -8 },
  }, t, 3);
  const j = joints(pose);
  // her forearms are drawn again over the basin's back rim, so only they enter it: her body stays behind table and basin
  const forearm = (o: { mid: { x: number; y: number }; end: { x: number; y: number } }, k: number) => {
    const a = toWorld(pose, o.mid);
    const b = toWorld(pose, o.end);
    return (
      <g key={k}>
        <path d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke={HANH.line} strokeWidth={31} strokeLinecap="round" />
        <path d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke={HANH.skin} strokeWidth={22} strokeLinecap="round" />
      </g>
    );
  };
  return (
    <g transform={camT(930, kf(t, [[0, 575], [len, 560]]), kf(t, [[0, 1.42], [len, 1.5]]))}>
      <AnKitchen id="s24" t={t} w={2} rain={1} />
      <clipPath id="s24body"><rect x={300} y={0} width={1300} height={640} /></clipPath>
      <g clipPath="url(#s24body)">
        <Hero look={HANH} pose={pose} rimId="filmR" shadow={0} />
      </g>
      {/* the table stands in front of her: top, front and legs; a rice sack and the pot beside the basin */}
      <ellipse cx={930} cy={1020} rx={560} ry={40} fill="#000" opacity={0.3} />
      <polygon points="470,640 1390,640 1490,800 370,800" fill="#8E6A48" />
      <polygon points="370,800 1490,800 1490,842 370,842" fill="#5E4128" />
      <path d="M 410 842 L 410 1060 M 1450 842 L 1450 1060" stroke="#4C3420" strokeWidth={26} />
      <path d="M 1210 680 Q 1200 590 1260 570 L 1330 570 Q 1390 590 1380 680 Q 1300 700 1210 680 Z" fill="#CDBB94" stroke="#6E5A3C" strokeWidth={4} />
      <path d="M 1260 570 Q 1295 550 1330 570" stroke="#6E5A3C" strokeWidth={5} fill="none" />
      <ellipse cx={540} cy={695} rx={70} ry={15} fill="#3A3A3E" />
      <path d="M 470 695 L 480 640 L 600 640 L 610 695 Z" fill="#4C4C52" />
      <ellipse cx={540} cy={640} rx={60} ry={12} fill="#2A2A2E" />
      {/* the whole basin sits on the table in front of her: rim, cloudy water, grains */}
      <ellipse cx={930} cy={790} rx={210} ry={18} fill="#000" opacity={0.32} />
      <ellipse cx={930} cy={702} rx={222} ry={50} fill="#3C5468" />
      <ellipse cx={930} cy={706} rx={200} ry={39} fill={RICE_FLOOD} />
      {Array.from({ length: 70 }).map((_, i) => {
        const a = rnd(3, i) * 6.28 + t * 0.012;
        const r = Math.sqrt(rnd(4, i));
        return <ellipse key={i} cx={930 + Math.cos(a) * r * 184} cy={706 + Math.sin(a) * r * 32} rx={7} ry={3} fill="#FFFFFF" stroke="#BDB8A2" strokeWidth={1} />;
      })}
      {[j.armL, j.armR].map(forearm)}
      {/* water closes over her hands, rings spread from them, then the basin's near wall */}
      <ellipse cx={930} cy={722} rx={150} ry={20} fill={RICE_FLOOD} />
      {[0, 1].map((i) => <ellipse key={i} cx={930} cy={708} rx={46 + ((t * 2.4 + i * 60) % 130)} ry={10 + ((t * 0.6 + i * 15) % 26)} fill="none" stroke="#fff" strokeWidth={2.5} opacity={0.8} />)}
      <path d="M 708 702 Q 722 780 800 794 L 1060 794 Q 1138 780 1152 702 Q 930 782 708 702 Z" fill="#5F7E96" stroke="#2C3C48" strokeWidth={4} />
      <path d="M 1060 794 Q 1138 780 1152 702 Q 1110 722 1040 738 Z" fill="#000" opacity={0.15} />
    </g>
  );
};

// ---------- S39: top-down insert: two hands turn the rice in the cloudy water ----------
export const S39: React.FC<ShotProps> = ({ t, len }) => {
  const a = t * 0.2;
  return (
    <g transform={`translate(960 540) rotate(${kf(t, [[0, -3], [len, 2]])}) scale(${kf(t, [[0, 1.0], [len, 1.05]])}) translate(-960 -540)`}>
      <rect x={-80} y={-80} width={2080} height={1240} fill="#6A5A48" />
      {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M ${-80 + i * 260} -80 L ${-80 + i * 260} 1160`} stroke="#4C4034" strokeWidth={5} />)}
      <ellipse cx={980} cy={586} rx={560} ry={520} fill="#000" opacity={0.35} />
      <circle cx={960} cy={560} r={540} fill="#5F7E96" />
      <circle cx={960} cy={560} r={505} fill="#3C5468" />
      <circle cx={960} cy={560} r={480} fill={RICE_FLOOD} />
      <clipPath id="s39w"><circle cx={960} cy={560} r={480} /></clipPath>
      <g clipPath="url(#s39w)">
        {Array.from({ length: 260 }).map((_, i) => {
          const ang = rnd(5, i) * 6.28 + t * (0.012 + rnd(6, i) * 0.012);
          const r = Math.sqrt(rnd(7, i)) * 470;
          const x = 960 + Math.cos(ang) * r;
          const y = 560 + Math.sin(ang) * r;
          return <ellipse key={i} cx={x} cy={y} rx={20} ry={8} fill="#FFFFFF" stroke="#B7B29C" strokeWidth={2} transform={`rotate(${rnd(8, i) * 180 + t * 0.4} ${x} ${y})`} />;
        })}
        <HandTop x={720 + 70 * Math.sin(a)} y={480 + 60 * Math.cos(a)} rot={24} s={1.25} skin={HANH.skin} sleeve={HANH.jacket} />
        <HandTop x={1200 - 70 * Math.sin(a + 1)} y={500 - 60 * Math.cos(a + 1)} rot={-24} s={1.25} skin={HANH.skin} sleeve={HANH.jacket} />
        <circle cx={960} cy={560} r={480} fill={RICE_FLOOD} opacity={0.28} />
        {[0, 1, 2].map((i) => <circle key={i} cx={960} cy={560} r={120 + ((t * 7 + i * 120) % 360)} fill="none" stroke="#fff" strokeWidth={4} opacity={0.5} />)}
      </g>
      <Glow x={1500} y={120} r={760} o={0.42} />
    </g>
  );
};

// ---------- S25: floor level under the wooden seat: the dog lifts his head as the spray comes in ----------
export const S25: React.FC<ShotProps> = ({ t, len }) => {
  const head = kf(t, [[0, 0], [28, 0], [36, 1]]);
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 980]]), 560, 1)}>
      <rect x={-100} y={-100} width={2200} height={1300} fill="#3A2C20" />
      {/* the yard beyond the door, bright and rainy, soft */}
      <g filter="url(#blur6)">
        <rect x={1120} y={100} width={700} height={660} fill="#8A97A2" />
        <rect x={1120} y={560} width={700} height={200} fill="#5A4238" />
      </g>
      <Rain t={t} seed={9} n={46} o={0.55} x0={1120} y0={100} w={700} h={640} />
      <rect x={1090} y={70} width={50} height={700} fill="#20160E" />
      <rect x={1800} y={70} width={50} height={700} fill="#20160E" />
      <Glow x={1460} y={500} r={620} kind="cool" o={0.4} />
      {/* the floor tiles run to camera */}
      <polygon points="-100,760 2100,760 2700,1200 -700,1200" fill="#6E5A48" />
      {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M ${i * 170 - 60} 760 L ${(i - 5.5) * 380 + 960} 1200`} stroke="#3E3226" strokeWidth={3} />)}
      {[830, 960].map((y, i) => <path key={i} d={`M -700 ${y} L 2700 ${y}`} stroke="#3E3226" strokeWidth={3} />)}
      <polygon points="1100,770 1860,770 2280,1200 800,1200" fill="#9AA7B0" opacity={0.2} />
      {/* the underside of the seat, chair legs: a dark frame */}
      <Dog x={560} y={850} s={2.3} look={1} head={head} t={t} />
      <rect x={-100} y={-100} width={2200} height={200} fill="#17110C" />
      <rect x={120} y={-20} width={70} height={1000} fill="#2A1C12" />
      <rect x={1010} y={-20} width={60} height={930} fill="#2A1C12" />
      <Foreground blur={10}>
        <rect x={-140} y={-100} width={210} height={1300} fill="#110C08" />
      </Foreground>
      <Glow x={760} y={100} r={520} o={0.26} />
    </g>
  );
};

// ---------- S26: wide over An's shoulder across the alley: bà Sáu hauls up the tarp and calls over ----------
export const S26: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 1040, y: 660, scale: 0.9, yaw: -0.5, look: -0.5, expr: 'happy', armL: { a: 158, b: 6 }, armR: { a: 150, b: 12 } } },
    { f: 40, p: { armL: { a: 150, b: 10 }, armR: { a: 164, b: 4 } } },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 1000], [len, 960]]), 460, 1.14)}>
      <ShopFront id="s26" t={t} rain={1} tarp={kf(t, [[0, 0.65], [70, 1]])} />
      <Hero look={SAU} pose={live(pose, t, 2, talkAt(t, 128, 182))} rimId="filmR" />
      <Foreground blur={6}>
        <Back look={AN} pose={P({ x: kf(t, [[0, 330], [len, 270]]), y: 980, scale: 1.75, armL: { a: 8, b: 6 }, armR: { a: 8, b: 6 } })} />
      </Foreground>
    </g>
  );
};

// ---------- S27: close on the near hands: An sets the basin under the gutter, the first spout rings in it ----------
export const S27: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 1450, y: YARD.deck - 112, scale: 0.88, yaw: 0.8, tilt: 6, look: 0.6, expr: 'happy', armR: { a: 40, b: 30 }, armL: { a: -30, b: -30 }, legL: { a: 6, b: 0 }, legR: { a: -4, b: 0 } } },
    { f: 34, p: { y: YARD.deck - 40, tilt: 34, armR: { a: 66, b: -6 }, armL: { a: -56, b: -6 }, legL: { a: 28, b: -42 }, legR: { a: -14, b: -24 } } },
    { f: 84, p: { y: YARD.deck - 40, tilt: 34 } },
    { f: 112, p: { y: YARD.deck - 123, tilt: 3, yaw: 0.55, look: 0.3, headTilt: -8, expr: 'neutral', armR: { a: 12, b: 14 }, armL: { a: -4, b: 14 }, legL: { a: 6, b: 0 }, legR: { a: -4, b: 0 } } },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 1480], [len, 1510]]), kf(t, [[0, 620], [34, 680], [84, 680], [112, 625]]), kf(t, [[0, 2.2], [len, 2.28]]))}>
      <AnHouse id="s27" t={t} w={2} rain={1} />
      <g transform={`translate(${kf(t, [[0, -120], [34, 0]])} ${kf(t, [[0, -150], [34, 0]])})`}>
        <ellipse cx={1590} cy={790} rx={70} ry={16} fill="#000" opacity={0.3 * kf(t, [[20, 0], [34, 1]])} />
        <path d="M 1530 750 L 1650 750 L 1636 794 L 1544 794 Z" fill="#5F7E96" />
        <ellipse cx={1590} cy={750} rx={60} ry={12} fill="#3C5468" />
      </g>
      <Hero look={AN} pose={live(pose, t, 1)} rimId="filmL" />
      <line x1={1590} y1={700} x2={1590} y2={760} stroke="#DCE8F2" strokeWidth={13} opacity={0.75} />
      {t > 34 ? [0, 1].map((i) => <ellipse key={i} cx={1590} cy={756} rx={22 + ((t * 1.3 + i * 12) % 24)} ry={5 + ((t * 0.4 + i * 3) % 7)} fill="none" stroke="#DCE8F2" strokeWidth={3} opacity={0.8} />) : null}
    </g>
  );
};

// ---------- S28: FIRST PERSON, Linh's eyes: her small hand out past the awning, drops bursting on the palm; a blink ----------
export const S28: React.FC<ShotProps> = ({ t, len }) => {
  const b = blinkAt(t, 5);
  return (
    <g>
      <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.05]]))}>
        <rect x={-100} y={-100} width={2200} height={1300} fill="#7C8A95" />
        <g filter="url(#blur10)">
          <rect x={-100} y={460} width={2200} height={700} fill="#5A4238" />
          <rect x={-100} y={200} width={560} height={320} fill="#5C5F5E" />
          <rect x={1320} y={160} width={700} height={380} fill="#5C5F5E" />
          {[250, 980, 1560].map((x, i) => <rect key={i} x={x} y={-40} width={24} height={560} fill="#24241F" />)}
          {[250, 980, 1560].map((x, i) => <ellipse key={`f${i}`} cx={x + 12} cy={40} rx={230} ry={90} fill="#37503C" />)}
        </g>
        <Rain t={t} o={0.5} />
        <Rain t={t} n={36} near o={0.4} seed={15} />
        <polygon points="-120,-120 2040,-120 2040,60 -120,120" fill="#1E2228" />
        {/* her forearm reaches from the bottom of frame: her own hand, palm up */}
        <g transform="translate(980 840) scale(2)">
          <path d="M -44 240 Q -46 90 -38 0 L 40 0 Q 50 90 56 240 Z" fill={LINH.skin} stroke="#16141C" strokeWidth={4} />
          <path d="M -60 260 L -48 164 L 58 160 L 72 260 Z" fill={LINH.jacket} stroke="#16141C" strokeWidth={4} />
          {[-34, -13, 11, 32].map((fx, i) => (
            <g key={i}>
              <path d={`M ${fx} -30 L ${fx * 1.3} ${[-86, -112, -112, -92][i]}`} stroke="#16141C" strokeWidth={26} strokeLinecap="round" />
              <path d={`M ${fx} -30 L ${fx * 1.3} ${[-86, -112, -112, -92][i]}`} stroke={LINH.skin} strokeWidth={19} strokeLinecap="round" />
            </g>
          ))}
          <path d="M 50 -6 L 94 -40" stroke="#16141C" strokeWidth={28} strokeLinecap="round" />
          <path d="M 50 -6 L 94 -40" stroke={LINH.skin} strokeWidth={21} strokeLinecap="round" />
          <path d="M -50 -44 Q -56 20 -38 30 L 40 30 Q 62 20 54 -44 Q 0 -66 -50 -44 Z" fill={LINH.skin} stroke="#16141C" strokeWidth={4} />
          <path d="M -30 -4 Q 0 12 34 -8 M -22 -24 Q 8 -14 30 -28" stroke={LINH.skinShade} strokeWidth={3.5} fill="none" />
          {[0, 1, 2, 3].map((i) => {
            const c = (t + i * 7) % 20;
            const x = [-12, 16, 2, 28][i];
            const y = [-14, -30, 8, 2][i];
            return <g key={i}><circle cx={x} cy={y} r={4 + c * 0.4} fill="none" stroke="#fff" strokeWidth={2.5} opacity={1 - c / 20} /><circle cx={x} cy={y} r={3.6} fill="#EAF4FB" opacity={0.9} /></g>;
          })}
        </g>
      </g>
      {/* the eyelids: first-person blink */}
      {b ? <rect width={1920} height={1080} fill="#100A08" /> : null}
    </g>
  );
};

// ---------- S29: over Linh's shoulder (from below, her height): An looks down at her and answers ----------
export const S29: React.FC<ShotProps> = ({ t, len }) => (
  <g>
  <g transform={camT(kf(t, [[0, 870], [len, 830]]), 440, kf(t, [[0, 2.06], [len, 2.16]]))}>
    <AnHouse id="s29" t={t} w={2} rain={1} chair={false} />
    <Hero look={AN} pose={P({ ...onDeck(960, 0.96), yaw: 0.42, look: 0.5, headTilt: 11, expr: 'happy', talk: talkAt(t, 2, 124), armL: { a: 12, b: 16 }, armR: { a: 16, b: 22 } }, t, 1)} rimId="filmL" />
  </g>
    <Foreground blur={3}>
      <Back look={LINH} pose={P({ x: kf(t, [[0, 1470], [len, 1530]]), y: 1290, scale: 2.5, armL: { a: 8, b: 6 }, armR: { a: 8, b: 6 } })} />
    </Foreground>
  </g>
);

// ---------- S30: from above An's eyeline: Linh's cheeky upturned face (high angle close) ----------
export const S30: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(960, 660, 1)}>
      <rect x={-100} y={-100} width={2200} height={1300} fill="#6A6658" />
      {/* the veranda floor tiles behind her, seen from above */}
      {Array.from({ length: 13 }).map((_, i) => <path key={i} d={`M ${i * 190 - 200} -100 L ${(i - 6) * 150 + 960} 1200`} stroke="#3C3A30" strokeWidth={3} />)}
      {Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M -100 ${i * 190 + 40} L 2100 ${i * 190 + 40}`} stroke="#3C3A30" strokeWidth={3} />)}
      <polygon points="1320,-100 2100,-100 2100,1200 1720,1200" fill="#46423A" />
      {[1500, 1680].map((x, i) => (
        <g key={i} transform={`translate(${x} ${180 + i * 340}) scale(1.6)`}>
          <ellipse cx={0} cy={0} rx={62} ry={58} fill="#3C5A34" />
          <ellipse cx={0} cy={0} rx={36} ry={32} fill="#964F31" />
          <circle cx={0} cy={0} r={22} fill="#2C2018" />
        </g>
      ))}
      <Glow x={380} y={170} r={760} o={0.5} />
      {/* the camera looks down: big head, foreshortened body */}
      <Hero look={LINH} pose={P({ x: 900 + 10 * Math.sin(t * 0.05), y: kf(t, [[0, 1190], [len, 1170]]), scale: 3.6, yaw: 0.26, look: -0.42, headTilt: -8, expr: 'smug', talk: talkAt(t, 2, 132), armL: { a: 10, b: 20 }, armR: { a: 10, b: 20 } }, t, 4)} rimId="filmL" shadow={0} />
    </g>
    <Foreground blur={16}><path d="M -20 880 Q 180 740 320 1100 L -20 1100 Z" fill="#141110" /></Foreground>
  </g>
);

// ---------- S31: the two of them side-on: An laughs and hooks the low stool in; rain falls behind them both ----------
export const S31: React.FC<ShotProps> = ({ t, len }) => {
  const s = 0.86;
  const pose = poseAt(t, [
    { f: 0, p: { ...onDeck(790, s), yaw: 0.65, look: 0.5, tilt: 8, headTilt: 3, expr: 'happy', armR: { a: 18, b: 22 }, armL: { a: -8, b: 22 } } },
    { f: 45, p: { tilt: 26, armR: { a: 50, b: 8 }, armL: { a: -44, b: -8 } } },
    { f: 72, p: { tilt: 26, armR: { a: 50, b: 8 }, armL: { a: -44, b: -8 } } },
    { f: 92, p: { tilt: 6, armR: { a: 20, b: 20 }, armL: { a: -6, b: 20 } } },
  ]);
  const linh = poseAt(t, [
    { f: 0, p: { ...onDeck(1050, CHILD * s), yaw: -0.65, facing: -1, look: -0.7, headTilt: -9, expr: 'happy', armL: { a: 22, b: 34 }, armR: { a: 16, b: 24 } } },
    { f: 72, p: { x: 1050 } },
    { f: 98, p: { x: 948, legL: { a: 18, b: -20 }, legR: { a: -14, b: -10 } } },
    { f: 116, p: { y: YARD.deck - 62, legL: { a: 62, b: -62 }, legR: { a: 56, b: -56 } } },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 900], [len, 950]]), 540, kf(t, [[0, 1.54], [len, 1.6]]))}>
      <AnHouse id="s31" t={t} w={2} rain={1} chair={false} />
      <Hero look={AN} pose={live(pose, t, 1, talkAt(t, 108, 252))} rimId="filmL" />
      <g transform={`translate(${kf(t, [[40, 1000], [70, 930]])} ${YARD.deck - 54})`}>
        <ellipse cx={0} cy={66} rx={62} ry={9} fill="#000" opacity={0.3} />
        <rect x={-52} y={0} width={104} height={12} fill="#7A5636" />
        <path d="M -40 12 L -46 64 M 40 12 L 46 64" stroke="#4C3420" strokeWidth={10} />
      </g>
      <Hero look={LINH} pose={live(linh, t, 4)} rimId="filmR" shadow={t < 100 ? 1 : 0} />
    </g>
  );
};

// ---------- S32: from deep in the house, past Hạnh in the kitchen door: the two small on the bright veranda ----------
export const S32: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.05]]))}>
    <g style={{ filter: `blur(${kf(t, [[18, 0], [38, 7]])}px)` }}>
    <LivingFront id="s32" t={t + 300}>
      <Hero look={AN} pose={P({ x: 915, y: 650, scale: 0.72, yaw: 0.7, look: 0.4, armL: { a: 16, b: 12 }, armR: { a: 24, b: 26 } }, t, 1)} rimId="rimBlue" shadow={0} />
      <Hero look={LINH} pose={P({ x: 1020, y: 690, scale: 0.46, yaw: -0.7, armR: { a: 16, b: 14 } }, t, 4)} rimId="rimBlueL" shadow={0} />
    </LivingFront>
    </g>
    <Hero look={HANH} pose={P({ x: 340, y: 760, scale: 2.32, yaw: 0.58, look: 0.7, headTilt: 2, expr: 'happy', talk: talkAt(t, 41, 152), armR: { a: 118 + 7 * Math.sin(t * 0.22), b: 26 }, armL: { a: 12, b: 32 } }, t, 3)} rimId="filmR" shadow={0} />
    <Foreground blur={16}><rect x={1700} y={-60} width={300} height={1200} fill="#120C08" /></Foreground>
  </g>
);

// ---------- S33: close: Linh turns her head back inside, bright under the bulb ----------
export const S33: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 1020], [len, 990]]), 500, kf(t, [[0, 3.05], [len, 3.16]]))}>
    <AnHouse id="s33" t={t} w={2} rain={1} chair={false} pots={false} />
    <Hero look={LINH} pose={P({ x: 1000, y: 640, scale: 0.68, yaw: kf(t, [[0, 0.6], [16, -0.5]]), look: kf(t, [[0, 0.7], [16, -0.7]]), headTilt: -5, expr: 'happy', talk: talkAt(t, 39, 92), armR: { a: kf(t, [[0, 14], [24, 70]]), b: kf(t, [[0, 10], [24, 70]]) } }, t, 4)} rimId="filmR" shadow={0} />
    <Glow x={1000} y={420} r={180} o={0.28} />
  </g>
);

// ---------- S34: macro insert: under the pot, a drop leaves the drain hole (held through the pause) ----------
export const S34: React.FC<ShotProps> = ({ t, len }) => {
  const p = (t % 42) / 42;
  const fall = p < 0.55 ? 0 : (p - 0.55) / 0.45;
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.06]]))}>
      <rect width={1920} height={1080} fill="#29241E" />
      <Glow x={1500} y={130} r={720} o={0.5} />
      <g filter="url(#blur10)">
        <rect x={1180} y={40} width={720} height={640} fill="#8C6A42" opacity={0.5} />
      </g>
      <path d="M 500 -40 L 1420 -40 L 1270 430 Q 960 490 650 430 Z" fill="#A85C3C" />
      <path d="M 1110 -40 L 1420 -40 L 1270 430 Q 1180 452 1090 462 Z" fill="#7E4228" />
      <ellipse cx={960} cy={448} rx={94} ry={26} fill="#1A0F08" />
      <polygon points="-20,900 1940,900 2300,1100 -380,1100" fill="#5C5448" />
      <path d="M -20 900 L 1940 900" stroke="#2A2620" strokeWidth={7} />
      <ellipse cx={960} cy={906} rx={250} ry={22} fill="#A8B5BE" opacity={0.32} />
      <path d={`M 960 ${452 + fall * 440 - 60 * (1 - fall)} q 34 66 34 100 a 34 34 0 1 1 -68 0 q 0 -34 34 -100 Z`} fill="#D8E8F2" opacity={0.95} />
      {p > 0.92 ? <ellipse cx={960} cy={906} rx={40 + (p - 0.92) * 900} ry={6 + (p - 0.92) * 90} fill="none" stroke="#fff" strokeWidth={4} opacity={0.7} /> : null}
    </g>
  );
};

// ---------- S35: from the wall, past the calendar: Linh runs in, pen up, and looks right at it ----------
export const S35: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 640, y: 830, scale: 1.1, yaw: 0.76, look: 0.8, tilt: 8, expr: 'happy', armR: { a: 44, b: 48 }, armL: { a: 30, b: 44 }, legL: { a: 26, b: -32 }, legR: { a: -20, b: -8 } } },
    { f: 40, p: { x: 1050, y: 880, scale: 1.85, tilt: 2, yaw: 0.45, armR: { a: 112, b: 26 }, handR: 'open', legL: { a: 6, b: 0 }, legR: { a: -4, b: 0 } } },
  ]);
  const running: Partial<Pose> = t < 40 ? { legL: { a: 28 * Math.sin(t * 0.6), b: -24 }, legR: { a: -28 * Math.sin(t * 0.6), b: -24 } } : { armR: { a: 112 + 4 * Math.sin(t * 0.5), b: 26 } };
  const linh = { ...pose, ...running };
  const pen = toWorld(linh, joints(linh).armR.end);
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.04]]))}>
      {/* the room as seen from the calendar's wall: the veranda door far left, Bulb overhead, the desk's edge */}
      <LivingFront id="s35" t={t + 400} />
      <Hero look={LINH} pose={live(linh, t, 4)} rimId="filmR" />
      <g transform={`translate(${pen.x} ${pen.y}) rotate(38)`}>
        <rect x={-6} y={-46} width={12} height={84} fill="#C8322A" stroke="#16141C" strokeWidth={3} />
      </g>
      {/* the back of the tear-off calendar, huge and soft in the near corner */}
      <Foreground blur={10}>
        <rect x={1360} y={-60} width={640} height={1200} fill="#1A130C" />
        <rect x={1340} y={190} width={420} height={560} fill="#D8CDB6" />
        <rect x={1340} y={190} width={420} height={110} fill="#8C2E28" />
      </Foreground>
    </g>
  );
};

// ---------- S36: close-up, the calendar leaf: the red mark is drawn on, the hand with the pen ----------
export const S36: React.FC<ShotProps> = ({ t, len }) => {
  const m = kf(t, [[4, 0], [26, 1]]);
  return (
    <g transform={camT(980, 560, kf(t, [[0, 1.0], [len, 1.05]]))}>
      <rect x={-100} y={-100} width={2200} height={1300} fill="#7E693A" />
      {[[500, 300, 70], [1500, 620, 110], [1180, 180, 50]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#5E4E2A" opacity={0.25} />)}
      <Glow x={480} y={60} r={1200} o={0.55} />
      <TearCalendar x={960} y={560} s={4.2} day="1" mark={m} />
      <g transform={`translate(${kf(t, [[30, 0], [50, 560]])} ${kf(t, [[30, 0], [50, 700]])})`}><g transform={`translate(${m < 0.5 ? 775 + m * 2 * 353 : 1128 - (m - 0.5) * 2 * 353} ${468 + (m < 0.5 ? m * 2 : (m - 0.5) * 2) * 353 - 34})`}>
        <g transform="rotate(38)">
          <rect x={-13} y={-200} width={26} height={196} fill="#C8322A" stroke="#16141C" strokeWidth={4} />
          <polygon points="-13,-4 13,-4 0,34" fill="#E8D8B0" stroke="#16141C" strokeWidth={3} />
        </g>
        <HandTop x={150} y={-150} rot={128} s={0.84} />
      </g></g>
    </g>
  );
};

// ---------- S37: pull back: the calendar small on the wall, the rain window dark and the bulb lowering into dusk; hold ----------
export const S37: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 1120], [len, 960]]), kf(t, [[0, 400], [len, 500]]), kf(t, [[0, 2.5], [len, 1.0]]))}>
    <LivingRoom id="s37" t={t + 500} veil={0.66} mark={1} />
    <rect x={-300} y={-300} width={2520} height={1700} fill="#1A1E2C" opacity={kf(t, [[0, 0], [len, 0.26]])} />
  </g>
);

export const SHOTS = { S39, S38, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28, S29, S30, S31, S32, S33, S34, S35, S36, S37 };
