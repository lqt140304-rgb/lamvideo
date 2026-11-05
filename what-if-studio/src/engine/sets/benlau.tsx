import React from 'react';
import { rnd } from '../anim';
import { makeRoom, Box, Pt } from '../room';
import { Glow, Cone, LightVeil, Dust } from '../light';
import { RoomShell, FloorShadow } from '../furnish';

// Bến Lau, the fictional town of "Mưa liên tục 100 ngày": An's house, the alley, bà Sáu's shop, the river and the
// mountains. Layout follows the script's plan: alley > brick yard and areca palms > veranda and gutter > front door >
// living room (wooden set and radio left, Linh's desk and calendar by the window opposite) > kitchen > vegetable beds.
// Weather is a number: 0 the hot dry afternoon, 1 the storm light, 2 steady rain. Every light has a visible source.

export type Weather = 0 | 1 | 2;
/** A bulb on a weak rainy-day supply: a slow uneven breathing, never random. */
export const flick = (t: number) => 0.93 + 0.07 * Math.sin(t * 0.31) * Math.sin(t * 0.13 + 1);
const SKY = [
  { top: '#D98A3E', mid: '#F2B765', low: '#FBE2A6', cloud: '#E8B97C', dark: '#00000000' },
  { top: '#23252F', mid: '#3D4150', low: '#7A7464', cloud: '#2B2E3A', dark: '#10121A' },
  { top: '#333A47', mid: '#4C5564', low: '#6E7884', cloud: '#3C4452', dark: '#141A24' },
];
/** The day's tint laid over a whole exterior: hot and bright, or sunk into storm light. */
const TINT = [0, 0.42, 0.34];

// ---------- weather ----------
/** Rain in depth: long thin streaks falling at an angle, deterministic in t. `near` draws a few fat out-of-focus ones. */
export const Rain: React.FC<{ t: number; seed?: number; n?: number; o?: number; near?: boolean; x0?: number; y0?: number; w?: number; h?: number; slant?: number }> = ({ t, seed = 3, n = 150, o = 0.42, near = false, x0 = -200, y0 = -100, w = 2320, h = 1300, slant = 0.14 }) => (
  <g stroke={near ? '#E8EEF4' : '#C8D4DE'} strokeLinecap="round" opacity={o} filter={near ? 'url(#blur3)' : undefined}>
    {Array.from({ length: n }).map((_, i) => {
      const sp = (near ? 62 : 38) + rnd(seed, i) * 22;
      const L = (near ? 130 : 58) + rnd(seed + 1, i) * 40;
      const y = y0 + ((rnd(seed + 2, i) * h + t * sp) % h);
      const x = x0 + ((rnd(seed + 3, i) * w - t * sp * slant + w * 4) % w);
      return <line key={i} x1={x} y1={y} x2={x - L * slant} y2={y + L} strokeWidth={near ? 4 : 1.8} />;
    })}
  </g>
);

/** Little crowns where rain hits a surface between y0 and y1 (bigger toward the viewer). */
export const Splashes: React.FC<{ t: number; x0: number; x1: number; y0: number; y1: number; n?: number; seed?: number; o?: number }> = ({ t, x0, x1, y0, y1, n = 46, seed = 7, o = 0.6 }) => (
  <g stroke="#DCE6EE" fill="none" strokeLinecap="round" opacity={o}>
    {Array.from({ length: n }).map((_, i) => {
      const p = (t / (9 + rnd(seed, i) * 7) + rnd(seed + 1, i)) % 1;
      const yy = rnd(seed + 2, i);
      const x = x0 + rnd(seed + 3, i + Math.floor(t / 14)) * (x1 - x0);
      const y = y0 + yy * (y1 - y0);
      const s = 0.45 + yy * 1.1;
      return <ellipse key={i} cx={x} cy={y} rx={(5 + p * 18) * s} ry={(2 + p * 6) * s} strokeWidth={1.8} opacity={1 - p} />;
    })}
  </g>
);

/** A bank of cloud: overlapping soft lobes; `x` drifts it, `edge` the height of its underside. */
export const CloudBank: React.FC<{ x?: number; y: number; h?: number; w?: number; color: string; seed?: number; n?: number; lit?: string; blur?: 3 | 6 | 10 | 16 }> = ({ x = 0, y, h = 150, w = 2800, color, seed = 11, n = 26, lit, blur = 10 }) => (
  <g filter={`url(#blur${blur})`} transform={`translate(${x} 0)`}>
    {Array.from({ length: n }).map((_, i) => {
      const cx = -440 + (i / n) * w + rnd(seed, i) * 100;
      const r = h * (0.55 + rnd(seed + 1, i) * 0.7);
      const cy = y - rnd(seed + 2, i) * h * 0.55;
      return <circle key={i} cx={cx} cy={cy} r={r} fill={color} />;
    })}
    <rect x={-440} y={y - 600} width={w} height={600} fill={color} />
    {lit
      ? Array.from({ length: Math.round(n * 0.6) }).map((_, i) => (
          <ellipse key={`l${i}`} cx={-440 + (i / (n * 0.6)) * w + rnd(seed + 3, i) * 120} cy={y + h * 0.05 - rnd(seed + 4, i) * 30} rx={h * 0.7} ry={h * 0.13} fill={lit} opacity={0.5} />
        ))
      : null}
  </g>
);

const Sky: React.FC<{ id: string; w: Weather; horizon?: number }> = ({ id, w, horizon = 620 }) => (
  <g>
    <defs>
      <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={SKY[w].top} />
        <stop offset="0.6" stopColor={SKY[w].mid} />
        <stop offset="1" stopColor={SKY[w].low} />
      </linearGradient>
    </defs>
    <rect x={-500} y={-500} width={2920} height={horizon + 500} fill={`url(#${id}sky)`} />
  </g>
);

const Tint: React.FC<{ w: Weather }> = ({ w }) =>
  w ? <rect x={-500} y={-500} width={2920} height={2080} fill={SKY[w].dark} opacity={TINT[w]} style={{ mixBlendMode: 'multiply' }} /> : null;

/** A tall areca palm: a thin ringed trunk and drooping fronds. `droop` 0..1: 1 is the wilted heat, `blow` swings it. */
export const Areca: React.FC<{ x: number; y: number; s?: number; droop?: number; blow?: number; t?: number; dark?: string; leaf?: string; seed?: number }> = ({ x, y, s = 1, droop = 0.4, blow = 0, t = 0, dark = '#3A3226', leaf = '#4F6B38', seed = 1 }) => {
  const sway = Math.sin(t * 0.05 + seed) * 2 + blow * (8 + 3 * Math.sin(t * 0.25 + seed));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M -9 0 Q ${-3 + sway * 0.8} -300 ${sway * 2 - 5} -600 L ${sway * 2 + 5} -600 Q ${5 + sway * 0.8} -300 9 0 Z`} fill={dark} />
      {[80, 170, 260, 350, 440, 530].map((yy, i) => (
        <path key={i} d={`M -8 ${-yy} L 8 ${-yy}`} stroke="#000" strokeWidth={2} opacity={0.25} />
      ))}
      <g transform={`translate(${sway * 2} -600)`}>
        {[-155, -125, -95, -70, -40, -15, 12, 40, 68].map((a0, i) => {
          const dir = Math.cos((a0 * Math.PI) / 180) >= 0 ? 1 : -1;
          const len = 190 + rnd(seed, i) * 60;
          const ex = dir * len * (0.92 - droop * 0.28) + blow * 26;
          const ey = -70 * (1 - droop) + (40 + droop * 170) * (0.6 + rnd(seed + 1, i) * 0.7);
          const qx = dir * len * 0.5 + blow * 10;
          const qy = -120 + droop * 50;
          return (
            <g key={i}>
              <path d={`M 0 0 Q ${qx} ${qy} ${ex} ${ey}`} stroke={leaf} strokeWidth={9} fill="none" strokeLinecap="round" />
              {Array.from({ length: 7 }).map((_, k) => {
                const p = (k + 1) / 8;
                const bx = 2 * (1 - p) * p * qx + p * p * ex;
                const by = 2 * (1 - p) * p * qy + p * p * ey;
                return <path key={k} d={`M ${bx} ${by} l ${dir * 14 + blow * 8} ${34 + droop * 24} M ${bx} ${by} l ${-dir * 8 + blow * 8} ${30 + droop * 22}`} stroke={leaf} strokeWidth={4} strokeLinecap="round" />;
              })}
            </g>
          );
        })}
      </g>
    </g>
  );
};

// ---------- far views ----------
const Mountains: React.FC<{ y: number; w: Weather; o?: number }> = ({ y, w, o = 1 }) => (
  <g opacity={o}>
    <path d={`M -500 ${y} L -260 ${y - 150} L -40 ${y - 70} L 240 ${y - 230} L 520 ${y - 100} L 820 ${y - 280} L 1140 ${y - 110} L 1420 ${y - 250} L 1720 ${y - 90} L 2020 ${y - 190} L 2420 ${y - 40} L 2420 ${y + 90} L -500 ${y + 90} Z`} fill={w === 0 ? '#8C7F68' : '#2C333B'} />
    <path d={`M -500 ${y + 30} L -140 ${y - 60} L 200 ${y - 10} L 560 ${y - 110} L 900 ${y - 20} L 1280 ${y - 120} L 1620 ${y - 20} L 2000 ${y - 80} L 2420 ${y} L 2420 ${y + 120} L -500 ${y + 120} Z`} fill={w === 0 ? '#6D6B50' : '#232A2F'} />
  </g>
);

/** A row of low houses seen across town: tin roofs, plaster walls, one lit window in rain. */
export const RoofRow: React.FC<{ y: number; s?: number; seed: number; w: Weather; x0?: number; x1?: number; lit?: number }> = ({ y, s = 1, seed, w, x0 = -500, x1 = 2420, lit = 0.28 }) => {
  const walls = w === 0 ? ['#D8BE8E', '#C9A77A', '#DDC9A4', '#B99F7C'] : ['#6A6A60', '#5A5C58', '#74705F', '#4E5350'];
  const roofs = w === 0 ? ['#8C5B3C', '#A47050', '#7C6A5C', '#94785E'] : ['#3C424C', '#343A44', '#4A4C50', '#2C323C'];
  const items: React.ReactNode[] = [];
  let x = x0;
  let i = 0;
  while (x < x1) {
    const bw = (150 + rnd(seed, i) * 130) * s;
    const bh = (70 + rnd(seed + 1, i) * 60) * s;
    const rh = (46 + rnd(seed + 2, i) * 28) * s;
    const wc = walls[Math.floor(rnd(seed + 3, i) * 4)];
    const rc = roofs[Math.floor(rnd(seed + 4, i) * 4)];
    const on = w > 0 && rnd(seed + 5, i) < lit;
    items.push(
      <g key={i}>
        <rect x={x} y={y - bh} width={bw} height={bh + 40 * s} fill={wc} />
        <rect x={x + bw * 0.62} y={y - bh} width={bw * 0.38} height={bh + 40 * s} fill="#000" opacity={0.13} />
        <polygon points={`${x - 8 * s},${y - bh} ${x + bw * 0.5},${y - bh - rh} ${x + bw + 8 * s},${y - bh}`} fill={rc} />
        <path d={`M ${x + bw * 0.5} ${y - bh - rh} L ${x + bw + 8 * s} ${y - bh}`} stroke="#000" strokeWidth={2.5 * s} opacity={0.25} />
        <rect x={x + bw * 0.28} y={y - bh * 0.72} width={26 * s} height={30 * s} fill={on ? '#FFC86E' : '#2A2C30'} />
        {on ? <Glow x={x + bw * 0.28 + 13 * s} y={y - bh * 0.72 + 15 * s} r={78 * s} o={0.5} /> : null}
      </g>,
    );
    x += bw + rnd(seed + 6, i) * 16;
    i++;
  }
  return <g>{items}</g>;
};

/** The town from high up: mountains, cloud, rows of roofs, the river. `cloud` pulls the storm's edge over from the left. */
export const TownView: React.FC<{ id: string; t: number; w: Weather; horizon?: number; river?: boolean; cloud?: number; rain?: number; palms?: boolean }> = ({ id, t, w, horizon = 500, river = true, cloud = 1, rain = 0, palms = true }) => (
  <g>
    <Sky id={id} w={w} horizon={horizon + 60} />
    {w === 0 ? <Glow x={1500} y={150} r={560} o={0.5} /> : null}
    <Mountains y={horizon} w={w} />
    {w > 0 ? <CloudBank x={(1 - cloud) * -2400 + t * 0.25} y={horizon - 150} h={190} color={SKY[1].cloud} lit="#555A66" seed={21} /> : null}
    {w > 0 ? <CloudBank x={(1 - cloud) * -2100 + t * 0.5} y={horizon - 290} h={140} color="#1C1F28" seed={24} blur={6} /> : null}
    <rect x={-500} y={horizon + 40} width={2920} height={700} fill={w === 0 ? '#8E7E58' : '#2D3132'} />
    {river ? (
      <g>
        <path d={`M -500 ${horizon + 88} Q 500 ${horizon + 58} 960 ${horizon + 74} T 2420 ${horizon + 64} L 2420 ${horizon + 130} Q 1400 ${horizon + 128} 960 ${horizon + 140} T -500 ${horizon + 146} Z`} fill={w === 0 ? '#A7B0A4' : '#59666E'} />
        <path d={`M 300 ${horizon + 102} L 620 ${horizon + 100} M 1050 ${horizon + 112} L 1420 ${horizon + 106}`} stroke="#fff" strokeWidth={3} opacity={0.25} />
      </g>
    ) : null}
    <RoofRow y={horizon + 186} s={0.62} seed={31} w={w} />
    <RoofRow y={horizon + 268} s={0.82} seed={35} w={w} />
    {palms ? [160, 520, 1040, 1380, 1760].map((x, i) => <Areca key={i} x={x} y={horizon + 330} s={0.42} droop={w ? 0.35 : 0.85} seed={i + 2} t={t} leaf={w ? '#2E3C2C' : '#5A6C38'} dark={w ? '#1E2020' : '#3A3226'} />) : null}
    <RoofRow y={horizon + 392} s={1.12} seed={39} w={w} />
    <RoofRow y={horizon + 560} s={1.5} seed={43} w={w} />
    {rain > 0 ? <Rain t={t} n={220} o={0.32 * rain} /> : null}
    <Tint w={w} />
  </g>
);

// ---------- the alley, looking down it toward the river ----------
const ALLEY = { vp: { x: 960, y: 500 }, y0: 1080 };
/** A point in the alley: side -1 left wall, +1 right wall, 0 the centre; d 0 near .. 1 at the far end; h up from the ground (0..1 of near wall). */
export const alleyP = (side: number, d: number, h = 0): Pt => {
  const k = Math.pow(1 - d, 1.25);
  const nx = 960 + side * 880;
  const ny = 1080 - h * 900;
  return { x: ALLEY.vp.x + (nx - ALLEY.vp.x) * k, y: ALLEY.vp.y + (ny - ALLEY.vp.y) * k };
};
const poly = (a: Pt[]) => a.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

export const Alley: React.FC<{ id: string; t: number; w: Weather; rain?: number; wind?: number; water?: number; lit?: boolean; shop?: boolean }> = ({ id, t, w, rain = 0, wind = 0, water = 0, lit = true, shop = true }) => {
  const seg = [-0.5, 0.22, 0.42, 0.58, 0.71, 0.81, 0.89];
  const wc = w === 0 ? ['#DCC394', '#CDAE80', '#E2CFA8', '#C4A47C', '#D6BC8A', '#BFA67E'] : ['#6F6E62', '#5F615A', '#777361', '#55595A', '#6A6B60', '#5B5D58'];
  const sideWall = (side: number, i: number) => {
    const d0 = seg[i];
    const d1 = seg[i] + (seg[i + 1] - seg[i]) * 0.96;
    const roofH = 0.62 + rnd(side + 5, i) * 0.16;
    const col = wc[(i + (side > 0 ? 2 : 0)) % 6];
    const onW = w > 0 && lit && (i + (side > 0 ? 1 : 0)) % 2 === 0;
    const dA = Math.max(d0, 0.04); // the first wall runs out of frame: its awning and door start inside it
    const dm = dA + (d1 - dA) * 0.34;
    const dn = dA + (d1 - dA) * 0.62;
    const wm = dA + (d1 - dA) * 0.42;
    const wn = dA + (d1 - dA) * 0.58;
    return (
      <g key={`${side}${i}`}>
        <polygon points={poly([alleyP(side, d0, 0), alleyP(side, d1, 0), alleyP(side, d1, roofH), alleyP(side, d0, roofH)])} fill={col} />
        {/* the wall's front end facing us: a darker return, so each house reads as a block */}
        <polygon points={poly([alleyP(side, d1, 0), alleyP(side * 1.5, d1, 0), alleyP(side * 1.5, d1, roofH), alleyP(side, d1, roofH)])} fill={col} />
        <polygon points={poly([alleyP(side, d1, 0), alleyP(side * 1.5, d1, 0), alleyP(side * 1.5, d1, roofH), alleyP(side, d1, roofH)])} fill="#000" opacity={0.3} />
        {/* the tin awning sticking out over the alley, then a lit or dark door/window */}
        <polygon points={poly([alleyP(side, d0, roofH - 0.035), alleyP(side, d1, roofH - 0.035), alleyP(side, d1, roofH), alleyP(side, d0, roofH)])} fill="#000" opacity={0.3} />
        <polygon points={poly([alleyP(side, wm, roofH - 0.08), alleyP(side, wn, roofH - 0.08), alleyP(side, wn, 0.47), alleyP(side, wm, 0.47)])} fill={onW ? '#E8A95C' : '#35302A'} />
        <polygon points={poly([alleyP(side, dA, 0.42), alleyP(side, d1, 0.42), alleyP(side * 0.87, d1, 0.385), alleyP(side * 0.87, dA, 0.385)])} fill={w === 0 ? '#8F6A4C' : '#343A42'} />
        <polygon points={poly([alleyP(side, dm, 0.34), alleyP(side, dn, 0.34), alleyP(side, dn, 0.02), alleyP(side, dm, 0.02)])} fill={onW ? '#FFC470' : '#2A2622'} />
        {onW ? <Glow x={alleyP(side, (dm + dn) / 2, 0.2).x} y={alleyP(side, (dm + dn) / 2, 0.2).y} r={260 * Math.pow(1 - d0, 1.3)} o={0.55} /> : null}
        <polygon points={poly([alleyP(side, d0, 0), alleyP(side, d1, 0), alleyP(side, d1, 0.07), alleyP(side, d0, 0.07)])} fill="#000" opacity={0.2} />
      </g>
    );
  };
  return (
    <g>
      <Sky id={id} w={w} horizon={520} />
      {w === 0 ? <Glow x={980} y={320} r={720} o={0.65} /> : null}
      <Mountains y={500} w={w} o={0.9} />
      {w > 0 ? <CloudBank x={t * 0.5} y={240} h={160} color={SKY[w].cloud} lit="#59606C" seed={51} /> : null}
      {/* the far end: the bến, a strip of river */}
      <rect x={820} y={470} width={280} height={60} fill={w === 0 ? '#AEB7A8' : '#5D6B73'} />
      {/* the ground */}
      <polygon points={poly([alleyP(-1, 0.99, 0), alleyP(1, 0.99, 0), { x: 2000, y: 1100 }, { x: -80, y: 1100 }])} fill={w === 0 ? '#A8927A' : '#3A3B3C'} />
      {Array.from({ length: 9 }).map((_, i) => {
        const a = alleyP(-1, i / 10, 0);
        const b = alleyP(1, i / 10, 0);
        return <path key={i} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke="#000" strokeWidth={1.6} opacity={0.16} />;
      })}
      {water > 0 ? (
        <g opacity={water}>
          <polygon points={poly([alleyP(-1, 0.99, 0), alleyP(1, 0.99, 0), { x: 2000, y: 1100 }, { x: -80, y: 1100 }])} fill="#667A86" />
          {/* the lit doors doubled in the water, long and broken */}
          {[-1, 1].map((side) => [0.18, 0.5, 0.74].map((d, i) => {
            const a = alleyP(side * 0.98, d, 0);
            const b = alleyP(side * 0.62, d - 0.1, 0);
            return <polygon key={`${side}${i}`} points={poly([a, { x: a.x + 26 * (1 - d), y: a.y }, { x: b.x + 26, y: b.y }, b])} fill="#FFC470" opacity={0.5} />;
          }))}
          {Array.from({ length: 16 }).map((_, i) => {
            const d = i / 18;
            const l = alleyP(-0.6, d, 0);
            const r = alleyP(0.6, d, 0);
            return <path key={i} d={`M ${l.x} ${l.y} L ${r.x} ${r.y}`} stroke="#D4E2EA" strokeWidth={1.6} opacity={0.34} />;
          })}
        </g>
      ) : null}
      {seg.slice(0, -1).reverse().map((_, k) => sideWall(-1, seg.length - 2 - k))}
      {seg.slice(0, -1).reverse().map((_, k) => sideWall(1, seg.length - 2 - k))}
      {/* the shop in the right foreground: its tarp over the alley, crates */}
      {shop ? (
        <g>
          <polygon points={poly([alleyP(1, 0.1, 0.62), alleyP(1, 0.3, 0.62), alleyP(0.55, 0.3, 0.42 + wind * 0.04 * Math.sin(t * 0.5)), alleyP(0.55, 0.1, 0.42 + wind * 0.05 * Math.sin(t * 0.4))])} fill={w === 0 ? '#3F7E8A' : '#2F5660'} />
          <polygon points={poly([alleyP(1, 0.13, 0.17), alleyP(1, 0.27, 0.17), alleyP(0.82, 0.27, 0.17), alleyP(0.82, 0.13, 0.17)])} fill="#6B4E36" />
          <polygon points={poly([alleyP(0.82, 0.13, 0), alleyP(0.82, 0.27, 0), alleyP(0.82, 0.27, 0.17), alleyP(0.82, 0.13, 0.17)])} fill="#4E3826" />
        </g>
      ) : null}
      {/* power poles and the wires across */}
      {[0.14, 0.46, 0.72].map((d, i) => {
        const a = alleyP(-0.92, d, 0);
        const b = alleyP(-0.92, d, 1.15);
        return (
          <g key={i}>
            <path d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke="#22201E" strokeWidth={Math.max(3, 16 * Math.pow(1 - d, 1.3))} />
            <path d={`M ${b.x - 40 * (1 - d)} ${b.y + 18 * (1 - d)} L ${b.x + 40 * (1 - d)} ${b.y + 18 * (1 - d)}`} stroke="#22201E" strokeWidth={Math.max(2, 9 * (1 - d))} />
          </g>
        );
      })}
      <path d={`M ${alleyP(-0.92, 0.14, 1.13).x} ${alleyP(-0.92, 0.14, 1.13).y} Q 700 340 ${alleyP(-0.92, 0.46, 1.13).x} ${alleyP(-0.92, 0.46, 1.13).y} Q 720 450 ${alleyP(-0.92, 0.72, 1.13).x} ${alleyP(-0.92, 0.72, 1.13).y}`} stroke="#22201E" strokeWidth={2.4} fill="none" />
      <path d={`M ${alleyP(-0.92, 0.14, 1.13).x} ${alleyP(-0.92, 0.14, 1.13).y} Q 1100 300 ${alleyP(0.95, 0.5, 0.9).x} ${alleyP(0.95, 0.5, 0.9).y}`} stroke="#22201E" strokeWidth={2.4} fill="none" />
      {rain > 0 ? <Splashes t={t} x0={500} x1={1420} y0={720} y1={1070} o={0.5 * rain} /> : null}
      <Tint w={w} />
      {rain > 0 ? <Rain t={t} o={0.38 * rain} /> : null}
    </g>
  );
};

// ---------- An's house from the yard ----------
export const YARD = { deck: 748, floorHip: (s: number) => 748 - 140 * s };
/** The door's warm slot (for rims and glows). */
export const YARD_DOOR: Pt = { x: 900, y: 560 };

export const AnHouse: React.FC<{ id: string; t: number; w: Weather; rain?: number; wind?: number; lamp?: number; palms?: number; chair?: boolean; pots?: boolean; basin?: boolean }> = ({ id, t, w, rain = 0, wind = 0, lamp = 1, palms = 0.4, chair = true, pots = true, basin = false }) => {
  const dim = w === 0;
  const wall = dim ? '#D8B860' : '#B3994E';
  const wallSh = dim ? '#BE9F4E' : '#93803F';
  const glow = dim ? 0.25 : lamp;
  return (
    <g>
      <Sky id={id} w={w} horizon={520} />
      {!dim ? <CloudBank x={t * 0.4} y={150} h={120} color={SKY[w].cloud} lit="#5A616C" seed={61} /> : <Glow x={1300} y={60} r={640} o={0.6} />}
      {/* the neighbours behind, shoulder to shoulder */}
      <rect x={-500} y={200} width={760} height={560} fill={dim ? '#C9AB7D' : '#55574F'} />
      <polygon points="-500,200 40,120 300,200" fill={dim ? '#94684A' : '#30363E'} />
      <rect x={1640} y={240} width={800} height={520} fill={dim ? '#BDA57F' : '#4E524C'} />
      <polygon points="1600,240 1960,140 2440,240" fill={dim ? '#8A6A52' : '#2C323A'} />
      {/* the attic: a small upper storey and its tin roof */}
      <rect x={600} y={150} width={620} height={230} fill={wallSh} />
      <polygon points="550,152 910,20 1270,152" fill={dim ? '#8C5B3C' : '#3C424C'} />
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d={`M ${910 + (i - 5.5) * 7} ${30} L ${910 + (i - 5.5) * 58} 152`} stroke="#000" strokeWidth={2} opacity={0.14} />
      ))}
      <rect x={830} y={196} width={160} height={120} fill={w && lamp ? '#E8A95C' : '#2C2E30'} stroke="#5A4630" strokeWidth={8} />
      <path d="M 910 196 L 910 316" stroke="#5A4630" strokeWidth={6} />
      {/* the ground floor wall */}
      <rect x={250} y={350} width={1320} height={400} fill={wall} />
      <rect x={250} y={350} width={1320} height={70} fill="#000" opacity={0.28} />
      {[[300, 620, 70], [1400, 470, 90], [660, 660, 40], [1500, 680, 50]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#6B5A2A" opacity={0.14} />
      ))}
      {/* window, door, light spilling out */}
      <rect x={440} y={430} width={250} height={190} fill={w ? '#3A2C1C' : '#3A3024'} stroke="#5A3F28" strokeWidth={10} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={452 + i * 58} y={442} width={52} height={166} fill={w ? '#E6A85E' : '#4E4232'} opacity={0.9} />
      ))}
      <rect x={770} y={410} width={260} height={340} fill="#5A3F28" />
      <rect x={784} y={424} width={232} height={326} fill={w ? '#EDB46C' : '#3C3024'} />
      {w ? <rect x={784} y={424} width={232} height={326} fill="#7A4E2A" opacity={0.25} /> : null}
      {/* the raincoat by the door */}
      <path d="M 1092 440 l 12 -12 l 12 12 q 30 10 36 54 l -8 92 l -80 0 l -8 -92 q 6 -44 36 -54 Z" fill="#E9B830" stroke="#8E6F18" strokeWidth={3} />
      <path d="M 1104 430 L 1104 416" stroke="#1E1A16" strokeWidth={4} />
      {/* the veranda deck, its step, and the yard's bricks */}
      <polygon points="200,748 1620,748 1660,786 160,786" fill={dim ? '#B5A38A' : '#6A6658'} />
      <rect x={160} y={786} width={1500} height={38} fill={dim ? '#8E7E68' : '#4C4A42'} />
      <rect x={-500} y={824} width={2920} height={300} fill={dim ? '#B5764E' : '#5A4238'} />
      {Array.from({ length: 6 }).map((_, r) => (
        <path key={r} d={`M -500 ${834 + r * r * 8 + r * 20} L 2420 ${834 + r * r * 8 + r * 20}`} stroke="#000" strokeWidth={2} opacity={0.22} />
      ))}
      {Array.from({ length: 34 }).map((_, i) => (
        <path key={`b${i}`} d={`M ${i * 62 - 60} 824 L ${(i - 17) * 120 + 960} 1100`} stroke="#000" strokeWidth={1.6} opacity={0.14} />
      ))}
      {/* the chair by the door, and pots along the veranda edge */}
      {chair ? (
        <g>
          <rect x={560} y={640} width={120} height={10} fill="#6B4A2E" />
          <path d="M 568 650 L 568 748 M 672 650 L 672 748 M 672 650 L 672 570 M 568 650 L 568 590" stroke="#4C3420" strokeWidth={10} />
          <path d="M 566 586 L 674 568" stroke="#6B4A2E" strokeWidth={11} />
        </g>
      ) : null}
      {pots
        ? [1190, 1270, 1356, 1446].map((x, i) => (
            <g key={i}>
              <ellipse cx={x} cy={752} rx={36} ry={7} fill="#000" opacity={0.3} />
              <path d={`M ${x - 28} 696 L ${x + 28} 696 L ${x + 20} 750 L ${x - 20} 750 Z`} fill={['#A85C3C', '#96502F', '#B26644', '#8C4A30'][i]} />
              <rect x={x - 32} y={688} width={64} height={12} rx={3} fill={['#B66A48', '#A45C38', '#BF7350', '#99553A'][i]} />
              {Array.from({ length: 6 }).map((_, k) => (
                <path key={k} d={`M ${x} 690 Q ${x + (k - 2.5) * 16} ${620 - rnd(i + 3, k) * 30} ${x + (k - 2.5) * 30} ${640 + rnd(i + 5, k) * 40}`} stroke={w ? '#3C5A34' : '#7A8240'} strokeWidth={7} fill="none" strokeLinecap="round" />
              ))}
            </g>
          ))
        : null}
      {basin ? (
        <g>
          <ellipse cx={1590} cy={790} rx={70} ry={16} fill="#000" opacity={0.3} />
          <path d="M 1530 750 L 1650 750 L 1636 794 L 1544 794 Z" fill="#5F7E96" />
          <ellipse cx={1590} cy={750} rx={60} ry={12} fill="#3C5468" />
        </g>
      ) : null}
      {/* the veranda's tin awning, its posts, the old gutter */}
      <polygon points="150,322 1670,322 1570,392 250,392" fill={dim ? '#94684A' : '#3A4048'} />
      {Array.from({ length: 24 }).map((_, i) => (
        <path key={`r${i}`} d={`M ${180 + i * 63} 322 L ${276 + i * 55} 392`} stroke="#000" strokeWidth={2} opacity={0.18} />
      ))}
      <rect x={140} y={392 - 74} width={1540} height={10} fill={dim ? '#7A7468' : '#50565C'} />
      <path d="M 1640 330 L 1590 330 L 1590 700" stroke={dim ? '#7A7468' : '#50565C'} strokeWidth={12} fill="none" />
      {[260, 1560].map((x, i) => (
        <rect key={i} x={x - 9} y={392} width={18} height={356} fill="#4A3524" />
      ))}
      {/* the bulb under the awning: the veranda's one lamp */}
      {!dim && lamp ? (
        <g>
          <path d="M 1215 392 L 1215 424" stroke="#1E1A16" strokeWidth={3} />
          <circle cx={1215} cy={432} r={13} fill="#FFE9B0" />
        </g>
      ) : null}
      <Tint w={w} />
      {!dim ? <LightVeil id={`${id}v`} lights={[[900, 590, 420], [1215, 480, 480], [560, 520, 260], [910, 256, 150]]} o={0.34} /> : null}
      {!dim && lamp ? (
        <g>
          <Glow x={1215} y={432} r={340} o={0.85 * flick(t)} />
          <Glow x={1215} y={432} r={90} o={1} />
          <Glow x={900} y={600} r={460} o={0.45 * glow} />
          <Glow x={565} y={525} r={260} o={0.28 * glow} />
          <Glow x={910} y={256} r={180} o={0.3 * glow} />
          <Cone d="M 790 750 L 1010 750 L 1180 1080 L 620 1080 Z" o={0.34 * glow} />
        </g>
      ) : null}
      {/* the palms stand in the yard, in front of the house */}
      <Areca x={110} y={880} s={1.5} droop={palms} blow={wind} t={t} seed={3} leaf={dim ? '#60703A' : '#2E4230'} dark={dim ? '#4A3E2C' : '#1E2020'} />
      <Areca x={1790} y={890} s={1.45} droop={palms} blow={wind} t={t} seed={5} leaf={dim ? '#60703A' : '#2E4230'} dark={dim ? '#4A3E2C' : '#1E2020'} />
      {rain > 0 ? (
        <g>
          <Splashes t={t} x0={-200} x1={2120} y0={835} y1={1070} o={0.65 * rain} />
          {/* a curtain of drips off the awning's edge */}
          {Array.from({ length: 44 }).map((_, i) => {
            const x = 170 + i * 35;
            const p = (t / 11 + rnd(9, i)) % 1;
            return <line key={i} x1={x} y1={326 + p * 460} x2={x} y2={346 + p * 460} stroke="#DCE8F2" strokeWidth={2.5} opacity={0.5 * rain} />;
          })}
          <Rain t={t} o={0.42 * rain} />
        </g>
      ) : null}
    </g>
  );
};

// ---------- the living room ----------
export const LIVING = makeRoom({ x: 960, y: 500 }, { x0: 420, x1: 1500, y0: 210, y1: 770 }, 3.3);
export const LIVING_WIN = { x0: 1185, x1: 1465, y0: 300, y1: 560 };
export const LIVING_CAL = { x: 1100, y: 372 };
export const LIVING_BULB: Pt = (() => {
  const p = LIVING.P(0.5, 0.2, 0.45);
  return { x: p.x, y: p.y };
})();

/** A calendar on the wall: the month's tear-off leaf with a big day number, a red mark drawn on with `mark` (0..1). */
export const TearCalendar: React.FC<{ x: number; y: number; s?: number; day?: string; mark?: number }> = ({ x, y, s = 1, day = '1', mark = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-62} y={-84} width={128} height={172} fill="#000" opacity={0.32} />
    <rect x={-66} y={-90} width={128} height={172} rx={3} fill="#F4EDDC" />
    <rect x={-66} y={-90} width={128} height={38} rx={3} fill="#B23A32" />
    <circle cx={-2} cy={-98} r={5} fill="#1E1A16" />
    <text x={-2} y={36} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={84} fill="#2A2420">{day}</text>
    <path d="M -46 56 L 42 56 M -46 66 L 18 66" stroke="#8A8070" strokeWidth={3} />
    {mark > 0 ? (
      <path d={`M -44 -22 L ${-44 + 84 * Math.min(1, mark * 2)} ${-22 + 84 * Math.min(1, mark * 2)}${mark > 0.5 ? ` M 40 -22 L ${40 - 84 * (mark - 0.5) * 2} ${-22 + 84 * (mark - 0.5) * 2}` : ''}`} stroke="#C8322A" strokeWidth={9} strokeLinecap="round" fill="none" />
    ) : null}
  </g>
);

export const Radio: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 20 -44 L 58 -92" stroke="#2A2A2C" strokeWidth={4} />
    <rect x={-54} y={-46} width={108} height={50} rx={7} fill="#6A4A30" stroke="#2E2014" strokeWidth={3} />
    <circle cx={-24} cy={-20} r={16} fill="#2E2014" />
    <circle cx={-24} cy={-20} r={10} fill="#44301E" />
    <rect x={2} y={-36} width={42} height={12} fill="#E8C47A" />
    <circle cx={12} cy={-12} r={5} fill="#D8C8A0" />
    <circle cx={32} cy={-12} r={5} fill="#D8C8A0" />
  </g>
);

export const Teapot: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={2} rx={40} ry={8} fill="#000" opacity={0.3} />
    <path d="M 26 -28 Q 46 -32 52 -48" stroke="#7E9A92" strokeWidth={9} fill="none" strokeLinecap="round" />
    <path d="M -30 -32 Q -56 -28 -32 -8" stroke="#7E9A92" strokeWidth={7} fill="none" />
    <path d="M -32 -2 Q -42 -30 -22 -44 L 22 -44 Q 42 -30 32 -2 Q 0 6 -32 -2 Z" fill="#94B0A6" />
    <path d="M 8 -44 Q 32 -30 32 -2 Q 20 2 10 3 Z" fill="#7C988E" />
    <ellipse cx={0} cy={-46} rx={22} ry={5} fill="#7E9A92" />
    <circle cx={0} cy={-52} r={5} fill="#5F7A72" />
  </g>
);

export const TeaCup: React.FC<{ x: number; y: number; s?: number; t?: number; steam?: number }> = ({ x, y, s = 1, t = 0, steam = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={3} rx={30} ry={6} fill="#000" opacity={0.3} />
    <path d="M -24 -30 L 24 -30 Q 22 -2 12 2 L -12 2 Q -22 -2 -24 -30 Z" fill="#E6DFCE" />
    <path d="M 8 -30 L 24 -30 Q 22 -2 12 2 L 6 2 Z" fill="#C9C0AC" />
    <ellipse cx={0} cy={-30} rx={24} ry={6} fill="#D2C8B0" />
    <ellipse cx={0} cy={-29} rx={20} ry={4.5} fill="#8A5A2C" />
    {steam > 0
      ? [-8, 6].map((sx, i) => (
          <path key={i} d={`M ${sx} -38 q ${6 * Math.sin(t * 0.08 + i)} -14 0 -28 q ${-6 * Math.sin(t * 0.08 + i)} -14 0 -28`} stroke="#fff" strokeWidth={3.5} fill="none" opacity={0.3 * steam} strokeLinecap="round" />
        ))
      : null}
  </g>
);

/** The living room in rain light. `lamp` (0..1) is the bulb. Camera faces the kitchen door from the front door. */
export const LivingRoom: React.FC<{ id: string; t: number; lamp?: number; veil?: number; rainWindow?: boolean; mark?: number; day?: string; dog?: boolean }> = ({ id, t, lamp = 1, veil = 0.5, rainWindow = true, mark = 0, day = '1', dog = true }) => {
  const r = LIVING;
  const { P, Q } = r;
  const k = (w: number) => r.s(w) / r.s(0);
  const table = P(0.24, 0.78, 0.46);
  const desk = P(0.82, 0.71, 0.12);
  const cab = P(0.29, 0.73, 0.05);
  const kx0 = P(0.44, 0.12, 0).x;
  const kx1 = P(0.58, 0.12, 0).x;
  return (
    <g>
      <RoomShell r={r} id={id} floor="tiles" wall="#A98F4C" side="#8E7A3F" floorC="#6E5A48" ceiling="#3A3226" lines="#3E3226" />
      {/* the kitchen door: warm depth at the back */}
      <rect x={kx0} y={P(0, 0.12, 0).y} width={kx1 - kx0} height={P(0, 1, 0).y - P(0, 0.12, 0).y} fill="#E2A258" />
      <rect x={kx0} y={P(0, 0.12, 0).y} width={kx1 - kx0} height={P(0, 1, 0).y - P(0, 0.12, 0).y} fill="none" stroke="#4E3722" strokeWidth={14} />
      <rect x={kx0 + 7} y={P(0, 0.72, 0).y} width={kx1 - kx0 - 14} height={P(0, 1, 0).y - P(0, 0.72, 0).y} fill="#7A5A3C" />
      <rect x={kx0 + 7} y={P(0, 0.72, 0).y} width={kx1 - kx0 - 14} height={9} fill="#A07C52" />
      {[0.25, 0.5, 0.75].map((f, i) => <rect key={i} x={kx0 + (kx1 - kx0) * f - 8} y={P(0, 0.72, 0).y - 26} width={16} height={26} rx={3} fill={['#8E4E34', '#3F7E8A', '#BFA25C'][i]} />)}
      {/* the stairs to the attic on the back wall's left */}
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i}>
          <polygon points={Q([[0.155 - i * 0.019, 1 - i * 0.082 - 0.082, 0.004], [0.155 - i * 0.019 + 0.019, 1 - i * 0.082 - 0.082, 0.004], [0.155 - i * 0.019 + 0.019, 1, 0.004], [0.155 - i * 0.019, 1, 0.004]])} fill={i % 2 ? '#6B4A2E' : '#5E4128'} />
          <polygon points={Q([[0.155 - i * 0.019, 1 - i * 0.082 - 0.082, 0.004], [0.155 - i * 0.019 + 0.019, 1 - i * 0.082 - 0.082, 0.004], [0.155 - i * 0.019 + 0.019, 1 - i * 0.082 - 0.082, 0.03], [0.155 - i * 0.019, 1 - i * 0.082 - 0.082, 0.03]])} fill="#94704E" />
        </g>
      ))}
      <path d={`M ${P(0.18, 0.7, 0.03).x} ${P(0.18, 0.7, 0.03).y} L ${P(0.02, 0.06, 0.03).x} ${P(0.02, 0.06, 0.03).y}`} stroke="#3E2A18" strokeWidth={7} />
      <path d={`M ${P(0.18, 0.7, 0.03).x} ${P(0.18, 0.7, 0.03).y} L ${P(0.18, 1, 0.03).x} ${P(0.18, 1, 0.03).y}`} stroke="#3E2A18" strokeWidth={7} />
      {/* low cabinet and the framed picture */}
      <FloorShadow r={r} u={[0.17, 0.4]} w={[0, 0.14]} />
      <Box r={r} u={[0.18, 0.4]} v={[0.72, 1]} w={[0, 0.1]} front="#5E4128" top="#7A5636" side="#4A3320" rim />
      <rect x={cab.x - 44} y={cab.y - 90} width={88} height={90} fill="#3E2A18" />
      <rect x={cab.x - 34} y={cab.y - 80} width={68} height={70} fill="#C8B69A" />
      <path d={`M ${cab.x - 24} ${cab.y - 22} L ${cab.x - 6} ${cab.y - 46} L ${cab.x + 6} ${cab.y - 32} L ${cab.x + 14} ${cab.y - 40} L ${cab.x + 26} ${cab.y - 22} Z`} fill="#7E6A52" />
      <circle cx={cab.x + 12} cy={cab.y - 62} r={7} fill="#E9D8B0" />
      {/* the window over Linh's desk: rain, grey light */}
      <rect x={LIVING_WIN.x0} y={LIVING_WIN.y0} width={LIVING_WIN.x1 - LIVING_WIN.x0} height={LIVING_WIN.y1 - LIVING_WIN.y0} fill="#7F8E98" />
      <clipPath id={`${id}winc`}>
        <rect x={LIVING_WIN.x0} y={LIVING_WIN.y0} width={LIVING_WIN.x1 - LIVING_WIN.x0} height={LIVING_WIN.y1 - LIVING_WIN.y0} />
      </clipPath>
      <g clipPath={`url(#${id}winc)`}>
        <path d={`M ${LIVING_WIN.x0} ${LIVING_WIN.y1 - 70} L ${LIVING_WIN.x0 + 90} ${LIVING_WIN.y1 - 110} L ${LIVING_WIN.x0 + 180} ${LIVING_WIN.y1 - 70} L ${LIVING_WIN.x1} ${LIVING_WIN.y1 - 90} L ${LIVING_WIN.x1} ${LIVING_WIN.y1} L ${LIVING_WIN.x0} ${LIVING_WIN.y1} Z`} fill="#4E5A5E" />
        {rainWindow ? <Rain t={t} seed={5} n={46} o={0.7} x0={LIVING_WIN.x0 - 20} y0={LIVING_WIN.y0 - 30} w={LIVING_WIN.x1 - LIVING_WIN.x0 + 40} h={LIVING_WIN.y1 - LIVING_WIN.y0 + 60} /> : null}
      </g>
      <rect x={LIVING_WIN.x0} y={LIVING_WIN.y0} width={LIVING_WIN.x1 - LIVING_WIN.x0} height={LIVING_WIN.y1 - LIVING_WIN.y0} fill="none" stroke="#5A4028" strokeWidth={12} />
      <path d={`M ${(LIVING_WIN.x0 + LIVING_WIN.x1) / 2} ${LIVING_WIN.y0} L ${(LIVING_WIN.x0 + LIVING_WIN.x1) / 2} ${LIVING_WIN.y1}`} stroke="#5A4028" strokeWidth={8} />
      <TearCalendar x={LIVING_CAL.x} y={LIVING_CAL.y} s={0.62} day={day} mark={mark} />
      {/* Linh's desk under the window: books, a pen pot, a chair */}
      <FloorShadow r={r} u={[0.68, 0.98]} w={[0, 0.2]} />
      <Box r={r} u={[0.7, 0.97]} v={[0.7, 0.74]} w={[0, 0.16]} front="#6E4C30" top="#8E6A48" side="#5A3E26" rim />
      <Box r={r} u={[0.7, 0.72]} v={[0.74, 1]} w={[0.13, 0.16]} front="#553A24" side="#44301C" />
      <Box r={r} u={[0.95, 0.97]} v={[0.74, 1]} w={[0.13, 0.16]} front="#553A24" side="#44301C" />
      <rect x={desk.x - 90} y={desk.y - 26} width={84} height={14} fill="#B8543E" />
      <rect x={desk.x - 86} y={desk.y - 38} width={76} height={12} fill="#3F7E8A" />
      <rect x={desk.x + 24} y={desk.y - 42} width={34} height={36} fill="#8A8A7A" />
      <path d={`M ${desk.x + 34} ${desk.y - 42} l -6 -30 M ${desk.x + 46} ${desk.y - 42} l 6 -26`} stroke="#D8452F" strokeWidth={5} />
      {/* the wooden set on the left: a long seat, a low table with the teapot and the radio */}
      <FloorShadow r={r} u={[0.02, 0.42]} w={[0.3, 0.62]} o={0.42} />
      <Box r={r} u={[0.02, 0.11]} v={[0.74, 0.79]} w={[0.3, 0.6]} front="#7A5636" top="#8E6A48" side="#6A4A2E" rim />
      <Box r={r} u={[0.02, 0.03]} v={[0.46, 0.79]} w={[0.3, 0.6]} front="#6A4A2E" side="#6A4A2E" />
      {[0.32, 0.58].map((w, i) => (
        <Box key={i} r={r} u={[0.02, 0.11]} v={[0.79, 1]} w={[w, w + 0.02]} front="#4C3420" side="#3E2A18" />
      ))}
      <Box r={r} u={[0.16, 0.36]} v={[0.76, 0.79]} w={[0.36, 0.56]} front="#7E5A3A" top="#94704E" side="#6A4A2E" rim />
      {[0.16, 0.345].map((u, i) => [0.37, 0.54].map((w, j) => <Box key={`${i}${j}`} r={r} u={[u, u + 0.015]} v={[0.79, 1]} w={[w, w + 0.015]} front="#4C3420" side="#3E2A18" />))}
      <Teapot x={table.x - 48 * k(0.46)} y={table.y + 6} s={k(0.46) * 0.72} />
      <Radio x={table.x + 52 * k(0.46)} y={table.y + 2} s={k(0.46) * 0.72} />
      {dog ? <Dog x={P(0.1, 1, 0.52).x + 30} y={P(0.1, 1, 0.52).y} s={k(0.52) * 0.62} look={0} t={t} /> : null}
      {/* a floor fan and a broom in the corner */}
      <path d={`M ${P(0.99, 1, 0.34).x - 40} ${P(0.99, 1, 0.34).y} L ${P(0.99, 1, 0.34).x - 52} ${P(0.99, 1, 0.34).y - 250}`} stroke="#8A6A3C" strokeWidth={7} />
      <polygon points={`${P(0.99, 1, 0.34).x - 60},${P(0.99, 1, 0.34).y} ${P(0.99, 1, 0.34).x - 22},${P(0.99, 1, 0.34).y} ${P(0.99, 1, 0.34).x - 36},${P(0.99, 1, 0.34).y - 60} ${P(0.99, 1, 0.34).x - 48},${P(0.99, 1, 0.34).y - 60}`} fill="#BFA25C" />
      {/* the bulb: a bare lamp on a flex */}
      <path d={`M ${LIVING_BULB.x} ${P(0.5, 0, 0.45).y} L ${LIVING_BULB.x} ${LIVING_BULB.y - 16}`} stroke="#1E1A16" strokeWidth={3} />
      <circle cx={LIVING_BULB.x} cy={LIVING_BULB.y} r={18} fill={lamp ? '#FFF0BE' : '#6A6A60'} />
      <LightVeil id={`${id}v`} lights={[[LIVING_BULB.x, LIVING_BULB.y + 60, 720 * Math.max(0.2, lamp)], [(LIVING_WIN.x0 + LIVING_WIN.x1) / 2, 450, 340], [(kx0 + kx1) / 2, 520, 240]]} o={veil} />
      {lamp ? (
        <g>
          <Glow x={LIVING_BULB.x} y={LIVING_BULB.y} r={620} o={0.62 * lamp * flick(t)} />
          <Glow x={LIVING_BULB.x} y={LIVING_BULB.y} r={150} o={1 * lamp} />
        </g>
      ) : null}
      <Glow x={(kx0 + kx1) / 2} y={560} r={260} o={0.35} />
      <Glow x={(LIVING_WIN.x0 + LIVING_WIN.x1) / 2} y={430} r={320} kind="cool" o={0.3} />
      <Dust t={t} seed={8} x0={LIVING_BULB.x - 300} y0={LIVING_BULB.y} w={600} h={420} n={22} o={0.35} />
    </g>
  );
};

// ---------- Hạnh's kitchen ----------
export const ANKITCHEN = makeRoom({ x: 880, y: 500 }, { x0: 380, x1: 1480, y0: 200, y1: 780 }, 3.2);
const KBULB: Pt = (() => {
  const p = ANKITCHEN.P(0.32, 0.16, 0.35);
  return { x: p.x, y: p.y };
})();
export const AN_KITCHEN_BULB = KBULB;

/** The kitchen: tiled counter and basin on the left, an open back door on the right onto the vegetable beds. */
export const AnKitchen: React.FC<{ id: string; t: number; w: Weather; door?: number; veil?: number; rain?: number }> = ({ id, t, w, door = 0, veil = 0.5, rain = 0 }) => {
  const r = ANKITCHEN;
  const { P, Q } = r;
  const dx0 = P(0.6, 0, 0).x;
  const dx1 = P(0.88, 0, 0).x;
  const dy0 = P(0, 0.2, 0).y;
  const dy1 = P(0, 1, 0).y;
  const shelf = P(0.25, 0.42, 0.03);
  return (
    <g>
      <RoomShell r={r} id={id} floor="tiles" wall="#8E8058" side="#786C4A" floorC="#5A5048" ceiling="#2E2A22" lines="#332C26" />
      {/* the door opening: the garden in weather */}
      <rect x={dx0} y={dy0} width={dx1 - dx0} height={dy1 - dy0} fill={w === 0 ? '#EFD79C' : '#7E8C94'} />
      <clipPath id={`${id}d`}>
        <rect x={dx0} y={dy0} width={dx1 - dx0} height={dy1 - dy0} />
      </clipPath>
      <g clipPath={`url(#${id}d)`}>
        <rect x={dx0} y={dy1 - 190} width={dx1 - dx0} height={190} fill={w === 0 ? '#9E7A50' : '#4A4238'} />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M ${dx0 - 30} ${dy1 - 150 + i * 42} L ${dx1 + 30} ${dy1 - 160 + i * 42}`} stroke={w === 0 ? '#7C5C3A' : '#3C5A34'} strokeWidth={14} strokeDasharray="22 12" />
        ))}
        <path d={`M ${dx0} ${dy1 - 190} L ${dx0 + 90} ${dy1 - 280} L ${dx1 - 60} ${dy1 - 240} L ${dx1} ${dy1 - 280} L ${dx1} ${dy1 - 190} Z`} fill={w === 0 ? '#7E7A4A' : '#2E3A30'} />
        {rain > 0 ? <Rain t={t} seed={6} n={40} o={0.7} x0={dx0 - 20} y0={dy0 - 30} w={dx1 - dx0 + 40} h={dy1 - dy0 + 60} /> : null}
      </g>
      {/* the door leaf, swung by the wind (door 0 shut against the wall .. 1 being pulled closed) */}
      <polygon points={`${dx1},${dy0} ${dx1 + (dx0 - dx1) * (0.15 + door * 0.5)},${dy0 - 30 + door * 18} ${dx1 + (dx0 - dx1) * (0.15 + door * 0.5)},${dy1 + 40 - door * 22} ${dx1},${dy1}`} fill="#5E4128" />
      <rect x={dx0} y={dy0} width={dx1 - dx0} height={dy1 - dy0} fill="none" stroke="#3E2A18" strokeWidth={14} />
      {/* counter, basin, jars, the shelf */}
      <FloorShadow r={r} u={[0, 0.55]} w={[0, 0.3]} />
      <Box r={r} u={[0, 0.52]} v={[0.64, 1]} w={[0, 0.2]} front="#6A6658" top="#94907E" side="#5A5648" rim />
      {[0.08, 0.2, 0.32, 0.44].map((u, i) => (
        <path key={i} d={`M ${P(u, 0.64, 0.2).x} ${P(u, 0.64, 0.2).y} L ${P(u, 1, 0.2).x} ${P(u, 1, 0.2).y}`} stroke="#000" strokeWidth={2} opacity={0.24} />
      ))}
      <Box r={r} u={[0.02, 0.5]} v={[0.38, 0.4]} w={[0, 0.05]} front="#5E4128" top="#7A5636" side="#4A3320" />
      {[0.06, 0.13, 0.2, 0.3, 0.38, 0.45].map((u, i) => {
        const p = P(u, 0.38, 0.03);
        return <rect key={i} x={p.x - 16} y={p.y - 50 - (i % 2) * 14} width={32} height={50 + (i % 2) * 14} rx={5} fill={['#A85C3C', '#3F7E8A', '#BFA25C', '#7E8C74', '#C87A3C', '#6E5B7E'][i]} />;
      })}
      {[0.09, 0.16].map((u, i) => {
        const p = P(u, 0.5, 0);
        return <path key={i} d={`M ${p.x} ${p.y} l 0 34`} stroke="#2A2622" strokeWidth={3} />;
      })}
      {/* the bulb */}
      <path d={`M ${KBULB.x} ${P(0.32, 0, 0.35).y} L ${KBULB.x} ${KBULB.y - 16}`} stroke="#1E1A16" strokeWidth={3} />
      <circle cx={KBULB.x} cy={KBULB.y} r={17} fill="#FFF0BE" />
      <LightVeil id={`${id}v`} lights={[[KBULB.x, KBULB.y + 90, 620], [(dx0 + dx1) / 2, 520, 300]]} o={veil} />
      <Glow x={KBULB.x} y={KBULB.y} r={560} o={0.62 * flick(t)} />
      <Glow x={KBULB.x} y={KBULB.y} r={130} o={1} />
      <Glow x={(dx0 + dx1) / 2} y={500} r={300} kind="cool" o={0.32} />
      <Dust t={t} seed={4} x0={KBULB.x - 260} y0={KBULB.y} w={520} h={380} n={18} o={0.3} />
    </g>
  );
};

// ---------- the dog ----------
export const Dog: React.FC<{ x: number; y: number; s?: number; look?: number; head?: number; t?: number }> = ({ x, y, s = 1, look = 0, head = 0, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={8} rx={112} ry={12} fill="#000" opacity={0.35} />
    <path d="M -96 4 Q -112 -22 -86 -30 Q -60 -68 12 -60 Q 62 -58 76 -28 Q 84 -6 70 6 L -88 8 Z" fill="#C49664" stroke="#2A1E14" strokeWidth={4} />
    <g transform={`rotate(${8 * Math.sin(t * 0.3)} -86 -30)`}>
      <path d="M -86 -30 Q -128 -44 -116 -66" stroke="#2A1E14" strokeWidth={13} fill="none" strokeLinecap="round" />
      <path d="M -86 -30 Q -126 -42 -116 -66" stroke="#C49664" strokeWidth={7} fill="none" strokeLinecap="round" />
    </g>
    <path d="M -40 -6 Q -36 -40 0 -40" stroke="#A67C4E" strokeWidth={5} fill="none" />
    <g transform={`translate(70 ${-22 - head * 26}) rotate(${head * -14})`}>
      <path d="M -24 8 Q -38 -42 2 -50 Q 40 -54 54 -18 Q 66 -4 58 8 Q 30 26 -24 8 Z" fill="#C49664" stroke="#2A1E14" strokeWidth={4} />
      <path d="M -10 -46 Q -34 -34 -26 -4 Q -8 -14 -4 -40 Z" fill="#8A5E38" stroke="#2A1E14" strokeWidth={3.5} />
      <ellipse cx={58} cy={-8} rx={9} ry={7} fill="#1E1612" />
      <circle cx={22 + look * 4} cy={-22} r={6} fill="#1E1612" />
      <circle cx={24 + look * 4} cy={-24} r={1.8} fill="#fff" />
      <path d="M 36 8 Q 46 12 54 6" stroke="#2A1E14" strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
    <path d="M 40 6 q 26 -2 38 8 q -24 8 -38 4 Z" fill="#C49664" stroke="#2A1E14" strokeWidth={3.5} />
  </g>
);

