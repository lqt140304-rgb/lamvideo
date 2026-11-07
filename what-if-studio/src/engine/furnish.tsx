import React from 'react';
import { rnd } from './anim';
import { LEG_LEN } from './rig';
import { Room, S3, Pt } from './room';
import { WallTexture, RoomCorners, SkyView, Glow, Cone } from './light';
import { FONT } from './fonts';

// The room kit: build a new interior in a few lines. makeRoom gives the perspective, RoomShell draws the room,
// BackWindow, Pendant, WallLight, FloorPlant and WallFrame furnish it, Box adds furniture, and stand() puts a
// character on the floor at the right size for its depth. Plus Vietnamese home furniture & decor components.

const BODY_H = 378; // the rig's height at scale 1, from the top of the head to the soles

/** Where a character stands on the floor at (u, w): hip position and scale, so their height is k of the room's. */
export const stand = (r: Room, u: number, w: number, k = 0.62) => {
  const p = r.P(u, 1, w);
  const scale = (k * (r.back.y1 - r.back.y0) * r.s(w)) / BODY_H;
  return { x: p.x, y: p.y - LEG_LEN * scale, scale };
};

/** The room's walls, floor and ceiling. Floors: 'boards' (run toward the back wall), 'tiles' (a grid), or 'patterned' (classic Vietnamese encaustic floor tiles). */
export const RoomShell: React.FC<{
  r: Room;
  id: string;
  floor?: 'boards' | 'tiles' | 'patterned';
  wall?: string;
  side?: string;
  floorC?: string;
  ceiling?: string;
  lines?: string;
}> = ({
  r,
  id,
  floor = 'boards',
  wall = S3.wall,
  side = S3.wallSide,
  floorC = S3.floor,
  ceiling = S3.ceiling,
  lines = '#22181D',
}) => {
  const { P, Q, back: B } = r;
  const fl: React.ReactNode[] = [];
  if (floor === 'boards') {
    for (let i = 1; i < 14; i++) {
      const a = P(i / 14, 1, 0);
      const b = P(i / 14, 1, 1);
      fl.push(<path key={`fb${i}`} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke={lines} strokeWidth={2.5} />);
      for (let k = 0; k < 3; k++) {
        const w = 0.12 + rnd(i, k) * 0.8;
        const c = P(i / 14, 1, w);
        const d = P((i + 1) / 14, 1, w);
        fl.push(<path key={`fj${i}-${k}`} d={`M ${c.x} ${c.y} L ${d.x} ${d.y}`} stroke={lines} strokeWidth={1.6} />);
      }
    }
  } else {
    for (let i = 1; i < 12; i++) {
      const a = P(i / 12, 1, 0);
      const b = P(i / 12, 1, 1);
      fl.push(<path key={`ta${i}`} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke={lines} strokeWidth={2} />);
    }
    for (let j = 1; j < 14; j++) {
      const a = P(0, 1, j / 14);
      const b = P(1, 1, j / 14);
      fl.push(<path key={`tb${j}`} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke={lines} strokeWidth={2} />);
    }
    if (floor === 'patterned') {
      for (let i = 1; i < 11; i++) {
        for (let j = 1; j < 13; j++) {
          if ((i + j) % 2 === 0) {
            fl.push(
              <polygon
                key={`tp${i}-${j}`}
                points={Q([
                  [i / 12, 1, j / 14],
                  [(i + 1) / 12, 1, j / 14],
                  [(i + 1) / 12, 1, (j + 1) / 14],
                  [i / 12, 1, (j + 1) / 14],
                ])}
                fill="#FFFFFF"
                opacity={0.05}
              />,
            );
          }
        }
      }
    }
  }
  return (
    <g>
      <defs>
        <linearGradient id={`${id}L`} gradientUnits="userSpaceOnUse" x1={B.x0} y1={0} x2={B.x0 - 730} y2={0}>
          <stop offset="0%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.5} />
        </linearGradient>
        <linearGradient id={`${id}R`} gradientUnits="userSpaceOnUse" x1={B.x1} y1={0} x2={B.x1 + 730} y2={0}>
          <stop offset="0%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.5} />
        </linearGradient>
        <linearGradient id={`${id}F`} gradientUnits="userSpaceOnUse" x1={0} y1={B.y1} x2={0} y2={B.y1 + 460}>
          <stop offset="0%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.55} />
        </linearGradient>
      </defs>
      <rect x={-1500} y={-1500} width={5000} height={1500 + B.y0 + 60} fill={ceiling} />
      <polygon points={Q([[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]])} fill={ceiling} />
      <polygon points={Q([[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]])} fill={side} />
      <polygon points={Q([[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]])} fill={`url(#${id}L)`} />
      <polygon points={Q([[1, 0, 0], [1, 0, 1], [1, 1, 1], [1, 1, 0]])} fill={side} />
      <polygon points={Q([[1, 0, 0], [1, 0, 1], [1, 1, 1], [1, 1, 0]])} fill={`url(#${id}R)`} />
      <polygon points={Q([[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]])} fill={floorC} />
      {fl}
      <polygon points={Q([[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]])} fill={`url(#${id}F)`} />
      <rect x={B.x0} y={B.y0} width={B.x1 - B.x0} height={B.y1 - B.y0} fill={wall} />
      <WallTexture rect={[B.x0, B.y0, B.x1 - B.x0, B.y1 - B.y0]} />
      <WallTexture points={Q([[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]])} />
      <WallTexture points={Q([[1, 0, 0], [1, 0, 1], [1, 1, 1], [1, 1, 0]])} />
      <RoomCorners x0={B.x0} x1={B.x1} y0={B.y0} y1={B.y1} />
      <rect x={B.x0} y={B.y1 - 14} width={B.x1 - B.x0} height={14} fill={S3.trim} />
      <polygon points={Q([[0, 0.965, 0], [0, 0.965, 1], [0, 1, 1], [0, 1, 0]])} fill={S3.trim} />
      <polygon points={Q([[1, 0.965, 0], [1, 0.965, 1], [1, 1, 1], [1, 1, 0]])} fill={S3.trim} />
      <path d={`M ${B.x0} ${B.y0 + 2} L ${B.x1} ${B.y0 + 2}`} stroke="#2A2331" strokeWidth={5} />
    </g>
  );
};

/**
 * A window in the back wall onto the dusk (screen box x0..x1, y0..y1 on the back wall), with frame, mullions, sill,
 * the sun's bloom, optional curtains and its light falling on the floor. `sun` is where the sun sits in it.
 */
export const BackWindow: React.FC<{
  r: Room;
  id: string;
  t: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  sun?: Pt;
  cols?: number;
  curtains?: boolean;
  red?: number;
  night?: boolean;
}> = ({ r, id, t, x0, x1, y0, y1, sun, cols = 2, curtains = true, red = 0, night = false }) => {
  const B = r.back;
  const u0 = (x0 - B.x0) / (B.x1 - B.x0);
  const u1 = (x1 - B.x0) / (B.x1 - B.x0);
  const w = x1 - x0;
  const h = y1 - y0;
  const s = sun ?? { x: x0 + w * 0.7, y: y1 - 12 };
  return (
    <g>
      <SkyView
        id={`${id}win`}
        clip={`M ${x0} ${y0} L ${x1} ${y0} L ${x1} ${y1} L ${x0} ${y1} Z`}
        box={{ x: x0, y: y0, w, h }}
        t={t}
        sun={s}
        sunR={Math.min(40, w * 0.1) * (night ? 0.75 : 1)}
        red={red}
        night={night}
      />
      <g fill="#1E1824">
        <rect x={x0 - 12} y={y0 - 12} width={w + 24} height={14} />
        <rect x={x0 - 12} y={y1 - 2} width={w + 24} height={10} />
        <rect x={x0 - 12} y={y0 - 12} width={14} height={h + 20} />
        <rect x={x1 - 2} y={y0 - 12} width={14} height={h + 20} />
        {Array.from({ length: cols - 1 }).map((_, i) => (
          <rect key={i} x={x0 + (w * (i + 1)) / cols - 5} y={y0} width={10} height={h} />
        ))}
        <rect x={x0} y={y0 + h * 0.32} width={w} height={7} />
      </g>
      <polygon
        points={r.Q([
          [u0 - 0.02, (y1 + 4 - B.y0) / (B.y1 - B.y0), 0],
          [u1 + 0.02, (y1 + 4 - B.y0) / (B.y1 - B.y0), 0],
          [u1 + 0.02, (y1 + 4 - B.y0) / (B.y1 - B.y0), 0.03],
          [u0 - 0.02, (y1 + 4 - B.y0) / (B.y1 - B.y0), 0.03],
        ])}
        fill="#6A5056"
      />
      <path d={`M ${x0 - 10} ${y1 + 8} L ${x1 + 10} ${y1 + 8}`} stroke={night ? '#A9C6FF' : S3.warm} strokeWidth={2} opacity={night ? 0.45 : 0.6} />
      <circle
        cx={s.x}
        cy={s.y}
        r={w * (night ? 0.9 : 1.3)}
        fill={night ? 'url(#kitMoonBloom)' : 'url(#kitBloom)'}
        opacity={(night ? 0.3 : 0.42) * (1 - red)}
      />
      {curtains
        ? [
            { x: x0 - 88, flip: 1 },
            { x: x1 - 6, flip: -1 },
          ].map((c, i) => (
            <g key={`cu${i}`}>
              <path
                d={`M ${c.x} ${y0 - 20} L ${c.x + 94} ${y0 - 20} L ${c.x + 94 - c.flip * 8} ${y1 + 110} Q ${c.x + 47} ${y1 + 118} ${c.x - c.flip * 6} ${y1 + 110} Z`}
                fill="#4E2F42"
              />
              {[0.22, 0.5, 0.78].map((k, j) => (
                <rect key={j} x={c.x + 94 * k - 6} y={y0 - 18} width={12} height={h + 126} fill={j % 2 ? '#40263A' : '#5E3A50'} opacity={0.8} />
              ))}
              <rect
                x={c.flip > 0 ? c.x + 90 : c.x}
                y={y0 - 18}
                width={4}
                height={h + 126}
                fill={night ? '#A9C6FF' : S3.warm}
                opacity={night ? 0.4 : 0.55}
              />
            </g>
          ))
        : null}
      {curtains ? <rect x={x0 - 100} y={y0 - 26} width={w + 200} height={8} rx={4} fill="#1A1420" /> : null}
      <polygon
        points={r.Q([
          [u0 + 0.02, 1, 0.02],
          [u1 - 0.02, 1, 0.02],
          [u1 + 0.08, 1, 0.55],
          [u0 - 0.08, 1, 0.55],
        ])}
        fill={night ? '#9FC0FF' : '#FFB46A'}
        opacity={night ? 0.08 : 0.1}
        style={{ mixBlendMode: 'screen' }}
      />
    </g>
  );
};

/** A pendant lamp hanging from the ceiling over the floor point (u, w), swaying a touch, with its cone and glow. */
export const Pendant: React.FC<{
  r: Room;
  u: number;
  w: number;
  v?: number;
  t: number;
  cone?: number;
  glow?: number;
}> = ({ r, u, w, v = 0.27, t, cone = 0.28, glow = 0.55 }) => {
  const top = r.P(u, 0, w);
  const sh = r.P(u, v, w);
  const k = r.s(w) / r.s(0.42);
  return (
    <g transform={`rotate(${Math.sin(t / 28) * 1.2} ${top.x} ${top.y})`}>
      <path d={`M ${top.x} ${top.y} L ${sh.x} ${sh.y - 30 * k}`} stroke="#120E16" strokeWidth={3} />
      <path
        d={`M ${sh.x - 16 * k} ${sh.y - 32 * k} L ${sh.x + 16 * k} ${sh.y - 32 * k} L ${sh.x + 44 * k} ${sh.y} L ${sh.x - 44 * k} ${sh.y} Z`}
        fill="#1C1620"
      />
      <ellipse cx={sh.x} cy={sh.y} rx={44 * k} ry={8 * k} fill="#FFE2B0" />
      <Cone
        d={`M ${sh.x - 40 * k} ${sh.y} L ${sh.x + 40 * k} ${sh.y} L ${sh.x + 240 * k} ${sh.y + 520 * k} L ${sh.x - 240 * k} ${sh.y + 520 * k} Z`}
        o={cone}
      />
      <Glow x={sh.x} y={sh.y + 6} r={220 * k} o={glow} />
    </g>
  );
};
/** Where a Pendant's light is, for the LightVeil and the glows on top: [x, y, radius]. */
export const pendantLight = (r: Room, u: number, w: number, v = 0.27): [number, number, number] => {
  const sh = r.P(u, v, w);
  return [sh.x, sh.y + 40, 460 * (r.s(w) / r.s(0.42))];
};

/** A wall light on a side wall (u 0 or 1) or the back wall (w 0), at height v. */
export const WallLight: React.FC<{ r: Room; u: number; v: number; w: number; o?: number }> = ({
  r,
  u,
  v,
  w,
  o = 0.55,
}) => {
  const p = r.P(u, v, w);
  const k = r.s(w) / r.s(0.66);
  return (
    <g>
      <rect x={p.x - 9 * k} y={p.y - 20 * k} width={18 * k} height={30 * k} rx={6 * k} fill="#2A2026" />
      <path
        d={`M ${p.x - 20 * k} ${p.y - 8 * k} L ${p.x + 20 * k} ${p.y - 8 * k} L ${p.x + 14 * k} ${p.y - 42 * k} L ${p.x - 14 * k} ${p.y - 42 * k} Z`}
        fill="#F2C08A"
      />
      <Glow x={p.x} y={p.y - 24 * k} r={230 * k} o={o} />
    </g>
  );
};

/** A potted plant on the floor at (u, w): a terracotta pot and five long leaves with midrib details. */
export const FloorPlant: React.FC<{ r: Room; u: number; w: number; size?: number }> = ({ r, u, w, size = 1 }) => {
  const b = r.P(u, 1, w);
  const k = (r.s(w) / r.s(0.07)) * size;
  return (
    <g>
      <ellipse cx={b.x + 6 * k} cy={b.y + 2} rx={56 * k} ry={12 * k} fill="#000" opacity={0.35} />
      <path d={`M ${b.x - 40 * k} ${b.y - 74 * k} L ${b.x + 40 * k} ${b.y - 74 * k} L ${b.x + 30 * k} ${b.y} L ${b.x - 30 * k} ${b.y} Z`} fill="#8A5040" />
      <path d={`M ${b.x + 10 * k} ${b.y - 74 * k} L ${b.x + 40 * k} ${b.y - 74 * k} L ${b.x + 30 * k} ${b.y} L ${b.x + 6 * k} ${b.y} Z`} fill="#000" opacity={0.2} />
      <rect x={b.x - 44 * k} y={b.y - 84 * k} width={88 * k} height={14 * k} rx={4 * k} fill="#6A3C30" />
      {[
        [-60, -150],
        [-20, -190],
        [30, -170],
        [64, -120],
        [-80, -90],
      ].map(([dx, dy], i) => {
        const o = { x: b.x, y: b.y - 80 * k };
        return (
          <g key={i}>
            <path
              d={`M ${o.x} ${o.y} Q ${o.x + dx * 0.3 * k} ${o.y + dy * 0.6 * k} ${o.x + dx * k} ${o.y + dy * k} Q ${o.x + dx * 0.7 * k} ${o.y + dy * 0.4 * k} ${o.x} ${o.y} Z`}
              fill={i % 2 ? '#3F5E44' : '#4E7350'}
            />
            <path
              d={`M ${o.x} ${o.y} Q ${o.x + dx * 0.5 * k} ${o.y + dy * 0.5 * k} ${o.x + dx * k} ${o.y + dy * k}`}
              stroke="#6B946D"
              strokeWidth={1.6 * k}
              fill="none"
              opacity={0.55}
            />
          </g>
        );
      })}
    </g>
  );
};

/** A framed picture on the back wall: a dark frame, a mount, and a simple dusk landscape, abstract, sailboat, or family portrait (`art = 3`). */
export const WallFrame: React.FC<{ x: number; y: number; w: number; h: number; art?: 0 | 1 | 2 | 3 }> = ({
  x,
  y,
  w,
  h,
  art = 0,
}) => (
  <g>
    <rect x={x + 4} y={y + 6} width={w} height={h} fill="#000" opacity={0.3} />
    <rect x={x} y={y} width={w} height={h} fill="#1E1824" />
    <rect x={x + 7} y={y + 7} width={w - 14} height={h - 14} fill="#E6D4B6" />
    {art === 0 ? (
      <g>
        <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} fill="#E4A27A" />
        <circle cx={x + w / 2} cy={y + h * 0.55} r={Math.min(w, h) * 0.12} fill="#FFE2B0" />
        <path
          d={`M ${x + 14} ${y + h - 14} L ${x + w * 0.35} ${y + h * 0.5} L ${x + w * 0.55} ${y + h - 26} L ${x + w * 0.7} ${y + h * 0.6} L ${x + w - 14} ${y + h - 14} Z`}
          fill="#6A3E5A"
        />
      </g>
    ) : art === 1 ? (
      <g>
        <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} fill="#4A5A7A" />
        <circle cx={x + w / 2 - w * 0.08} cy={y + h / 2 - h * 0.08} r={Math.min(w, h) * 0.16} fill="#E9C46A" />
        <circle cx={x + w / 2 + w * 0.12} cy={y + h / 2 + h * 0.12} r={Math.min(w, h) * 0.11} fill="#D9906A" />
      </g>
    ) : art === 2 ? (
      <g>
        <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} fill="#9FC0D6" />
        <rect x={x + 14} y={y + h - 34} width={w - 28} height={20} fill="#4A6A8A" />
        <path d={`M ${x + w * 0.45} ${y + h - 34} L ${x + w * 0.45} ${y + 26} L ${x + w * 0.66} ${y + h - 38} Z`} fill="#F4EEE0" />
      </g>
    ) : (
      <g>
        <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} fill="#786252" />
        {[-0.22, 0, 0.22].map((dx, i) => (
          <g key={i} transform={`translate(${x + w / 2 + dx * w} ${y + h * 0.68})`}>
            <path d={`M -16 14 Q -14 -8 0 -8 Q 14 -8 16 14 Z`} fill={i === 1 ? '#8C584C' : '#3C5E8C'} />
            <circle cx={0} cy={-18} r={10} fill="#E8C9A8" />
          </g>
        ))}
      </g>
    )}
  </g>
);

/** A round wall clock on the back wall. */
export const WallClock: React.FC<{ x: number; y: number; r?: number; t?: number }> = ({ x, y, r = 32, t = 0 }) => (
  <g>
    <circle cx={x + 2} cy={y + 3} r={r} fill="#000" opacity={0.3} />
    <circle cx={x} cy={y} r={r} fill="#EFE2CC" />
    <circle cx={x} cy={y} r={r} fill="none" stroke="#1E1824" strokeWidth={r * 0.19} />
    {[0, 3, 6, 9].map((hr) => {
      const a = (hr / 12) * Math.PI * 2;
      return (
        <circle
          key={hr}
          cx={x + Math.sin(a) * r * 0.72}
          cy={y - Math.cos(a) * r * 0.72}
          r={r * 0.055}
          fill="#3A303C"
        />
      );
    })}
    <path
      d={`M ${x} ${y} L ${x} ${y - r * 0.62} M ${x} ${y} L ${x + r * 0.44} ${y + r * 0.25}`}
      stroke="#1E1824"
      strokeWidth={r * 0.13}
      strokeLinecap="round"
      transform={`rotate(${t * 0.2} ${x} ${y})`}
    />
  </g>
);

/** A shadow on the floor under a box-shaped thing (a cabinet, a table): an offset dark quad. */
export const FloorShadow: React.FC<{ r: Room; u: [number, number]; w: [number, number]; o?: number }> = ({
  r,
  u: [u0, u1],
  w: [w0, w1],
  o = 0.35,
}) => <polygon points={r.Q([[u0, 1, w0], [u1 + 0.02, 1, w0], [u1 + 0.02, 1, w1 + 0.02], [u0, 1, w1 + 0.02]])} fill="#000" opacity={o} />;

/**
 * A table top seen from high above, filling the frame (a desk, a worktop): the surface with its grain running away
 * toward the top, its lit front edge at y `edge`, the floor far below past the edge, out of focus.
 */
export const Tabletop: React.FC<{
  edge?: number;
  wood?: string;
  grain?: string;
  lip?: string;
  floor?: string;
  floorLines?: string;
  kind?: 'wood' | 'stone';
}> = ({
  edge = 640,
  wood = '#6B4B42',
  grain = '#5C4038',
  lip = '#7A5747',
  floor = '#2E2228',
  floorLines = '#22181D',
  kind = 'wood',
}) => {
  const gx = (x0: number, y: number) => x0 + (960 - x0) * ((edge - y) / (edge + 1600));
  return (
    <g>
      <g filter="url(#blur3)">
        <rect x={-400} y={edge} width={2720} height={900} fill={floor} />
        {Array.from({ length: 40 }).map((_, i) => {
          const x = -500 + i * 72;
          return <path key={i} d={`M ${x} ${edge + 90} L ${960 + (x - 960) * 1.5} 1400`} stroke={floorLines} strokeWidth={3} />;
        })}
      </g>
      <rect x={-400} y={-400} width={2720} height={edge + 400} fill={wood} />
      {kind === 'wood'
        ? Array.from({ length: 30 }).map((_, i) => {
            const x0 = -800 + i * 130;
            return <path key={i} d={`M ${x0} ${edge} L ${gx(x0, -400)} -400`} stroke={grain} strokeWidth={i % 3 ? 2 : 4} opacity={0.75} />;
          })
        : Array.from({ length: 14 }).map((_, i) => (
            <path
              key={i}
              d={`M ${-400 + rnd(41, i) * 2700} ${-400 + rnd(42, i) * 1000} q ${120 + rnd(43, i) * 200} ${40 + rnd(44, i) * 60} ${300 + rnd(45, i) * 300} ${-20 + rnd(46, i) * 80}`}
              stroke={grain}
              strokeWidth={2 + rnd(47, i) * 3}
              fill="none"
              opacity={0.5}
            />
          ))}
      <rect x={-400} y={edge} width={2720} height={24} fill={lip} />
      <rect x={-400} y={edge} width={2720} height={3} fill={S3.warm} opacity={0.7} />
    </g>
  );
};

// ============================================================================
// VIETNAMESE HOME FURNITURE & INTERIOR DECORATION ASSETS
// ============================================================================

/**
 * Vietnamese family ancestral altar cabinet / shelf (`AncestralAltar` / Bàn thờ gia đình):
 * Includes carved dark rosewood frame, brass incense burner (bát hương) with rising smoke,
 * lotus vase, fruit plate, memorial frame, and two warm red-gold altar lamps.
 * Place at (x, y) = bottom center of the cabinet (or shelf bottom).
 */
export const AncestralAltar: React.FC<{
  x: number;
  y: number;
  w?: number;
  t?: number;
  cabinet?: boolean;
  glow?: number;
}> = ({ x, y, w = 280, t = 0, cabinet = true, glow = 0.85 }) => {
  const s = w / 280;
  const cabH = cabinet ? 190 * s : 28 * s;
  const topY = -cabH;
  return (
    <g transform={`translate(${x} ${y})`}>
      {cabinet ? <ellipse cx={0} cy={4 * s} rx={155 * s} ry={14 * s} fill="#000" opacity={0.42} /> : null}
      {/* Warm altar glow */}
      {glow > 0 ? <Glow x={0} y={topY - 56 * s} r={210 * s} o={0.42 * glow} /> : null}
      {/* Cabinet body or wall-mounted bracket */}
      {cabinet ? (
        <g>
          {/* Legs */}
          <rect x={-132 * s} y={-26 * s} width={18 * s} height={26 * s} fill="#2A1816" />
          <rect x={114 * s} y={-26 * s} width={18 * s} height={26 * s} fill="#2A1816" />
          {/* Main cabinet */}
          <rect x={-136 * s} y={topY} width={272 * s} height={cabH - 18 * s} rx={4 * s} fill="#462822" stroke="#1E1210" strokeWidth={3.5 * s} />
          <rect x={40 * s} y={topY} width={96 * s} height={cabH - 18 * s} fill="#000" opacity={0.22} />
          {/* Carved panels */}
          <rect x={-116 * s} y={topY + 22 * s} width={106 * s} height={cabH - 58 * s} rx={3 * s} fill="#381E1A" stroke="#6E4438" strokeWidth={2 * s} />
          <rect x={10 * s} y={topY + 22 * s} width={106 * s} height={cabH - 58 * s} rx={3 * s} fill="#381E1A" stroke="#6E4438" strokeWidth={2 * s} />
          {/* Gold medallion ornament */}
          <circle cx={0} cy={topY + (cabH - 18 * s) * 0.5} r={14 * s} fill="none" stroke="#C89B4B" strokeWidth={2.2 * s} opacity={0.75} />
        </g>
      ) : (
        <g>
          <path d={`M ${-110 * s} 0 L ${-110 * s} ${topY} L ${-78 * s} ${topY} Z`} fill="#2E1A16" />
          <path d={`M ${110 * s} 0 L ${110 * s} ${topY} L ${78 * s} ${topY} Z`} fill="#2E1A16" />
        </g>
      )}
      {/* Altar table top with curved upturned ends (tai cuốn thư) */}
      <path
        d={`M ${-154 * s} ${topY - 12 * s} Q ${-146 * s} ${topY - 2 * s} ${-132 * s} ${topY - 2 * s} L ${132 * s} ${topY - 2 * s} Q ${146 * s} ${topY - 2 * s} ${154 * s} ${topY - 12 * s} L ${146 * s} ${topY + 12 * s} L ${-146 * s} ${topY + 12 * s} Z`}
        fill="#58322A"
        stroke="#1E1210"
        strokeWidth={3 * s}
      />
      <path d={`M ${-142 * s} ${topY - 2 * s} L ${142 * s} ${topY - 2 * s}`} stroke="#FFB46A" strokeWidth={2 * s} opacity={0.55} />
      {/* Memorial portrait frame at back center */}
      <rect x={-32 * s} y={topY - 98 * s} width={64 * s} height={82 * s} rx={3 * s} fill="#3A221C" stroke="#C89B4B" strokeWidth={2.5 * s} />
      <rect x={-24 * s} y={topY - 90 * s} width={48 * s} height={66 * s} fill="#D9CFC0" />
      <circle cx={0} cy={topY - 64 * s} r={11 * s} fill="#7A6E62" />
      <path d={`M ${-16 * s} ${topY - 26 * s} Q 0 ${topY - 48 * s} ${16 * s} ${topY - 26 * s} Z`} fill="#4E4640" />
      {/* Flower vase on left */}
      <path
        d={`M ${-92 * s} ${topY - 2 * s} L ${-100 * s} ${topY - 46 * s} L ${-76 * s} ${topY - 46 * s} L ${-84 * s} ${topY - 2 * s} Z`}
        fill="#D8E0E8"
        stroke="#242028"
        strokeWidth={2 * s}
      />
      <circle cx={-94 * s} cy={topY - 58 * s} r={10 * s} fill="#E694A6" />
      <circle cx={-82 * s} cy={topY - 64 * s} r={11 * s} fill="#F2B8C6" />
      <circle cx={-88 * s} cy={topY - 50 * s} r={8 * s} fill="#4E7350" />
      {/* Fruit plate on right (mâm ngũ quả) */}
      <ellipse cx={88 * s} cy={topY - 6 * s} rx={28 * s} ry={6 * s} fill="#B84A3C" stroke="#241818" strokeWidth={2 * s} />
      <circle cx={78 * s} cy={topY - 16 * s} r={10 * s} fill="#6A944E" />
      <circle cx={96 * s} cy={topY - 15 * s} r={9 * s} fill="#E9A93A" />
      <circle cx={87 * s} cy={topY - 24 * s} r={8.5 * s} fill="#D9534F" />
      {/* Brass incense burner (bát hương) in front center */}
      <ellipse cx={0} cy={topY - 16 * s} rx={22 * s} ry={14 * s} fill="#D4A24C" stroke="#241A12" strokeWidth={2.2 * s} />
      <rect x={-14 * s} y={topY - 6 * s} width={28 * s} height={6 * s} rx={2 * s} fill="#9E742E" />
      {/* Three glowing incense sticks + curling smoke */}
      {[-5, 0, 5].map((ix, i) => (
        <g key={i}>
          <path d={`M ${ix * s} ${topY - 28 * s} L ${ix * 1.4 * s} ${topY - 58 * s}`} stroke="#B83A32" strokeWidth={2 * s} />
          <circle cx={ix * 1.4 * s} cy={topY - 59 * s} r={2.2 * s} fill="#FF6A3A" />
        </g>
      ))}
      <path
        d={`M 0 ${topY - 64 * s} q ${Math.sin(t / 12) * 10 * s} ${-24 * s} ${Math.cos(t / 17) * 6 * s} ${-48 * s} q ${-Math.sin(t / 14) * 12 * s} ${-24 * s} 0 ${-44 * s}`}
        stroke="#E6E0D6"
        strokeWidth={2.5 * s}
        fill="none"
        strokeLinecap="round"
        opacity={0.35}
      />
      {/* Two warm red altar lamps */}
      {[-124, 124].map((lx, i) => (
        <g key={i} transform={`translate(${lx * s} ${topY - 2 * s})`}>
          <rect x={-6 * s} y={-14 * s} width={12 * s} height={14 * s} fill="#9E742E" />
          <ellipse cx={0} cy={-26 * s} rx={10 * s} ry={14 * s} fill="#FF5A3A" opacity={0.9} />
          <circle cx={0} cy={-26 * s} r={4 * s} fill="#FFE8A8" />
        </g>
      ))}
    </g>
  );
};

/**
 * Traditional Vietnamese wooden living-room set (`WoodenSofa` / Bộ bàn ghế salon gỗ):
 * Carved wooden bench with slatted backrest, armrests, low tea table, and optional tea set.
 * Place at (x, y) = floor contact center.
 */
export const WoodenSofa: React.FC<{
  x: number;
  y: number;
  w?: number;
  withTable?: boolean;
  wood?: string;
  woodShade?: string;
}> = ({ x, y, w = 480, withTable = true, wood = '#6E4230', woodShade = '#4E2D20' }) => {
  const s = w / 480;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={8 * s} rx={255 * s} ry={20 * s} fill="#000" opacity={0.4} />
      {/* Backrest frame */}
      <rect x={-220 * s} y={-192 * s} width={440 * s} height={112 * s} rx={8 * s} fill={wood} stroke="#1E1412" strokeWidth={4 * s} />
      <rect x={-204 * s} y={-174 * s} width={408 * s} height={78 * s} rx={4 * s} fill={woodShade} />
      {/* Carved vertical slats & decorative medallions */}
      {[-140, -70, 0, 70, 140].map((sx, i) => (
        <g key={i} transform={`translate(${sx * s} ${-135 * s})`}>
          <rect x={-22 * s} y={-34 * s} width={44 * s} height={68 * s} rx={4 * s} fill={wood} stroke="#2A1A14" strokeWidth={2 * s} />
          <circle cx={0} cy={0} r={11 * s} fill={woodShade} stroke="#8C5A44" strokeWidth={1.8 * s} />
        </g>
      ))}
      {/* Top rail highlight */}
      <path d={`M ${-214 * s} ${-190 * s} L ${214 * s} ${-190 * s}`} stroke="#FFB46A" strokeWidth={2.5 * s} opacity={0.55} />
      {/* Seat plank */}
      <polygon
        points={`${-220 * s},${-82 * s} ${220 * s},${-82 * s} ${236 * s},${-62 * s} ${-236 * s},${-62 * s}`}
        fill="#7E4E3A"
        stroke="#1E1412"
        strokeWidth={3.5 * s}
      />
      <rect x={-236 * s} y={-62 * s} width={472 * s} height={18 * s} rx={3 * s} fill={woodShade} stroke="#1E1412" strokeWidth={3 * s} />
      {/* Curved armrests */}
      {[-226, 226].map((ax, i) => (
        <g key={i}>
          <rect x={(ax - 12) * s} y={-132 * s} width={24 * s} height={16 * s} rx={5 * s} fill={wood} stroke="#1E1412" strokeWidth={3 * s} />
          <rect x={(ax - 9) * s} y={-116 * s} width={18 * s} height={54 * s} fill={woodShade} stroke="#1E1412" strokeWidth={3 * s} />
        </g>
      ))}
      {/* Bench legs */}
      {[-222, -196, 196, 222].map((lx, i) => (
        <rect
          key={i}
          x={(lx - 9) * s}
          y={-46 * s}
          width={18 * s}
          height={46 * s}
          rx={3 * s}
          fill={i % 2 === 0 ? wood : woodShade}
          stroke="#1E1412"
          strokeWidth={3 * s}
        />
      ))}
      {/* Optional low coffee table in front */}
      {withTable ? (
        <g transform={`translate(0 ${22 * s})`}>
          <ellipse cx={0} cy={4 * s} rx={155 * s} ry={12 * s} fill="#000" opacity={0.38} />
          <rect x={-132 * s} y={-52 * s} width={16 * s} height={52 * s} fill={woodShade} stroke="#1E1412" strokeWidth={3 * s} />
          <rect x={116 * s} y={-52 * s} width={16 * s} height={52 * s} fill={woodShade} stroke="#1E1412" strokeWidth={3 * s} />
          <rect x={-118 * s} y={-24 * s} width={236 * s} height={8 * s} fill={woodShade} />
          <polygon
            points={`${-138 * s},${-68 * s} ${138 * s},${-68 * s} ${150 * s},${-52 * s} ${-150 * s},${-52 * s}`}
            fill="#865640"
            stroke="#1E1412"
            strokeWidth={3 * s}
          />
          <rect x={-150 * s} y={-52 * s} width={300 * s} height={14 * s} rx={3 * s} fill={wood} stroke="#1E1412" strokeWidth={3 * s} />
        </g>
      ) : null}
    </g>
  );
};

/**
 * Vintage treadle sewing machine table (`SewingTable` / Bàn máy may cổ điển):
 * Cast-iron filigree legs, foot treadle, warm wooden tabletop, black & gold sewing machine head,
 * handwheel, spools of thread, and draped fabric. Essential for Bà Sáu in *Hẻm Có Chuyện*.
 * Place at (x, y) = floor contact center.
 */
export const SewingTable: React.FC<{
  x: number;
  y: number;
  w?: number;
  t?: number;
  clothColor?: string;
}> = ({ x, y, w = 300, t = 0, clothColor = '#4A6E8A' }) => {
  const s = w / 300;
  const wheelRot = t * 4;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={6 * s} rx={160 * s} ry={14 * s} fill="#000" opacity={0.42} />
      {/* Cast-iron A-frame legs & treadle */}
      <path
        d={`M ${-118 * s} 0 L ${-102 * s} ${-148 * s} M ${-86 * s} 0 L ${-98 * s} ${-148 * s} M ${118 * s} 0 L ${102 * s} ${-148 * s} M ${86 * s} 0 L ${98 * s} ${-148 * s}`}
        stroke="#1C1B22"
        strokeWidth={8 * s}
        strokeLinecap="round"
      />
      <path d={`M ${-108 * s} ${-34 * s} L ${108 * s} ${-34 * s}`} stroke="#1C1B22" strokeWidth={6 * s} />
      {/* Cast-iron drive wheel under table */}
      <circle cx={42 * s} cy={-64 * s} r={28 * s} fill="none" stroke="#24222C" strokeWidth={5 * s} />
      <circle cx={42 * s} cy={-64 * s} r={6 * s} fill="#24222C" />
      {/* Treadle pedal */}
      <ellipse cx={-12 * s} cy={-26 * s} rx={36 * s} ry={6 * s} fill="#2A2834" stroke="#14121A" strokeWidth={2.5 * s} />
      {/* Wooden tabletop & drawers */}
      <rect x={-136 * s} y={-148 * s} width={64 * s} height={42 * s} rx={3 * s} fill="#5C3A2C" stroke="#1E1412" strokeWidth={3 * s} />
      <rect x={72 * s} y={-148 * s} width={64 * s} height={42 * s} rx={3 * s} fill="#5C3A2C" stroke="#1E1412" strokeWidth={3 * s} />
      <circle cx={-104 * s} cy={-127 * s} r={4 * s} fill="#C89B4B" />
      <circle cx={104 * s} cy={-127 * s} r={4 * s} fill="#C89B4B" />
      <rect x={-148 * s} y={-164 * s} width={296 * s} height={18 * s} rx={4 * s} fill="#7A4E3A" stroke="#1E1412" strokeWidth={3.5 * s} />
      <path d={`M ${-144 * s} ${-162 * s} L ${144 * s} ${-162 * s}`} stroke="#FFB46A" strokeWidth={2 * s} opacity={0.6} />
      {/* Draped fabric hanging over left edge */}
      <path
        d={`M ${-68 * s} ${-164 * s} L ${-18 * s} ${-164 * s} Q ${-28 * s} ${-110 * s} ${-44 * s} ${-76 * s} Q ${-66 * s} ${-84 * s} ${-82 * s} ${-102 * s} Z`}
        fill={clothColor}
        stroke="#1C2634"
        strokeWidth={2.5 * s}
      />
      {/* Vintage black sewing machine body */}
      <path
        d={`M ${-56 * s} ${-164 * s} L ${68 * s} ${-164 * s} L ${68 * s} ${-244 * s} Q ${68 * s} ${-258 * s} ${48 * s} ${-258 * s} L ${-42 * s} ${-258 * s} Q ${-60 * s} ${-258 * s} ${-60 * s} ${-238 * s} L ${-60 * s} ${-208 * s} L ${-34 * s} ${-208 * s} L ${-34 * s} ${-230 * s} L ${34 * s} ${-230 * s} L ${34 * s} ${-176 * s} L ${-56 * s} ${-176 * s} Z`}
        fill="#1E1D26"
        stroke="#0F0E14"
        strokeWidth={3.5 * s}
        strokeLinejoin="round"
      />
      {/* Gold vintage decals */}
      <path d={`M ${-28 * s} ${-244 * s} Q ${8 * s} ${-250 * s} ${44 * s} ${-244 * s}`} stroke="#D4A24C" strokeWidth={2.5 * s} fill="none" />
      <circle cx={48 * s} cy={-212 * s} r={7 * s} fill="none" stroke="#D4A24C" strokeWidth={2 * s} />
      {/* Needle bar & presser foot */}
      <path d={`M ${-46 * s} ${-208 * s} L ${-46 * s} ${-166 * s}`} stroke="#C8D2DC" strokeWidth={3.5 * s} />
      {/* Handwheel on right */}
      <g transform={`translate(${72 * s} ${-218 * s}) rotate(${wheelRot})`}>
        <circle cx={0} cy={0} r={20 * s} fill="none" stroke="#2C2A36" strokeWidth={6 * s} />
        <path d={`M ${-18 * s} 0 L ${18 * s} 0 M 0 ${-18 * s} L 0 ${18 * s}`} stroke="#2C2A36" strokeWidth={3 * s} />
        <circle cx={0} cy={0} r={5 * s} fill="#C89B4B" />
      </g>
      {/* Spools of thread */}
      <rect x={14 * s} y={-274 * s} width={10 * s} height={16 * s} rx={2 * s} fill="#D9534F" stroke="#1E1820" strokeWidth={2 * s} />
      <rect x={96 * s} y={-180 * s} width={12 * s} height={16 * s} rx={2 * s} fill="#E9C46A" stroke="#1E1820" strokeWidth={2 * s} />
      <rect x={112 * s} y={-178 * s} width={12 * s} height={14 * s} rx={2 * s} fill="#5AA08A" stroke="#1E1820" strokeWidth={2 * s} />
    </g>
  );
};

/**
 * Repair shop counter & shelf of antique clocks (`RepairBench` / Quầy tiệm sửa đồ ông Lộc):
 * Includes wooden workbench, articulated warm desk lamp, tools, and optional back wall shelf of clocks/radios.
 * Place at (x, y) = floor contact center of the counter.
 */
export const RepairBench: React.FC<{
  x: number;
  y: number;
  w?: number;
  t?: number;
  withShelf?: boolean;
  lampOn?: number;
}> = ({ x, y, w = 460, t = 0, withShelf = true, lampOn = 1 }) => {
  const s = w / 460;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* Optional wall shelf behind the counter */}
      {withShelf ? (
        <g transform={`translate(0 ${-360 * s})`}>
          <rect x={-210 * s} y={0} width={420 * s} height={14 * s} rx={3 * s} fill="#5C3A2C" stroke="#1E1412" strokeWidth={3 * s} />
          {/* Pendulum wall clock on left */}
          <rect x={-180 * s} y={-92 * s} width={56 * s} height={92 * s} rx={4 * s} fill="#4A2C22" stroke="#1E1412" strokeWidth={3 * s} />
          <circle cx={-152 * s} cy={-64 * s} r={18 * s} fill="#EFE2CC" stroke="#1E1412" strokeWidth={2.5 * s} />
          <path d={`M ${-152 * s} ${-64 * s} L ${-152 * s} ${-74 * s} M ${-152 * s} ${-64 * s} L ${-142 * s} ${-64 * s}`} stroke="#1E1412" strokeWidth={2 * s} />
          {/* Vintage radio in middle */}
          <rect x={-54 * s} y={-58 * s} width={96 * s} height={58 * s} rx={8 * s} fill="#7A4C38" stroke="#1E1412" strokeWidth={3 * s} />
          <rect x={-42 * s} y={-46 * s} width={48 * s} height={34 * s} rx={4 * s} fill="#D8C8A8" />
          <circle cx={22 * s} cy={-36 * s} r={8 * s} fill="#2A2220" />
          <circle cx={22 * s} cy={-18 * s} r={6 * s} fill="#C89B4B" />
          {/* Twin-bell alarm clock on right */}
          <circle cx={126 * s} cy={-30 * s} r={24 * s} fill="#3C5E8C" stroke="#1E1412" strokeWidth={3 * s} />
          <circle cx={126 * s} cy={-30 * s} r={18 * s} fill="#F4EEE0" />
          <path d={`M ${108 * s} ${-52 * s} A ${10 * s} ${10 * s} 0 0 1 ${122 * s} ${-56 * s}`} stroke="#C89B4B" strokeWidth={5 * s} fill="none" />
          <path d={`M ${144 * s} ${-52 * s} A ${10 * s} ${10 * s} 0 0 0 ${130 * s} ${-56 * s}`} stroke="#C89B4B" strokeWidth={5 * s} fill="none" />
        </g>
      ) : null}

      {/* Counter contact shadow */}
      <ellipse cx={0} cy={8 * s} rx={245 * s} ry={18 * s} fill="#000" opacity={0.42} />
      {/* Counter cabinet body */}
      <rect x={-225 * s} y={-180 * s} width={450 * s} height={180 * s} rx={4 * s} fill="#583628" stroke="#1E1412" strokeWidth={4 * s} />
      <rect x={60 * s} y={-180 * s} width={165 * s} height={180 * s} fill="#000" opacity={0.22} />
      {/* Recessed wooden panels */}
      {[-145, 0, 145].map((px, i) => (
        <rect
          key={i}
          x={(px - 58) * s}
          y={-152 * s}
          width={116 * s}
          height={128 * s}
          rx={4 * s}
          fill="#462A1E"
          stroke="#724836"
          strokeWidth={2.5 * s}
        />
      ))}
      {/* Countertop overhang */}
      <rect x={-238 * s} y={-198 * s} width={476 * s} height={20 * s} rx={4 * s} fill="#7A4E3A" stroke="#1E1412" strokeWidth={3.5 * s} />
      <path d={`M ${-234 * s} ${-196 * s} L ${234 * s} ${-196 * s}`} stroke="#FFB46A" strokeWidth={2.5 * s} opacity={0.65} />

      {/* Articulated work lamp on left of counter */}
      <g transform={`translate(${-168 * s} ${-198 * s})`}>
        <rect x={-22 * s} y={-10 * s} width={44 * s} height={10 * s} rx={4 * s} fill="#282634" stroke="#121018" strokeWidth={2.5 * s} />
        <path d={`M 0 ${-10 * s} L ${-22 * s} ${-68 * s} L ${26 * s} ${-112 * s}`} stroke="#3A384A" strokeWidth={6 * s} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={-22 * s} cy={-68 * s} r={6 * s} fill="#C89B4B" />
        <path d={`M ${14 * s} ${-118 * s} L ${38 * s} ${-118 * s} L ${54 * s} ${-92 * s} L ${6 * s} ${-92 * s} Z`} fill="#3E6B64" stroke="#121018" strokeWidth={3 * s} />
        <ellipse cx={30 * s} cy={-92 * s} rx={24 * s} ry={5 * s} fill="#FFE6A8" />
        {lampOn > 0 ? (
          <g>
            <Cone
              d={`M ${10 * s} ${-92 * s} L ${50 * s} ${-92 * s} L ${140 * s} 0 L ${-40 * s} 0 Z`}
              o={0.28 * lampOn * (0.95 + 0.05 * Math.sin(t / 9))}
            />
            <Glow x={36 * s} y={-60 * s} r={160 * s} o={0.55 * lampOn} />
          </g>
        ) : null}
      </g>
    </g>
  );
};

/**
 * Standing electric fan (`StandingFan` / Quạt cây Việt Nam):
 * Pedestal base, height column, control buttons, protective wire cage, and rotating 3-blade rotor driven by `t`.
 */
export const StandingFan: React.FC<{
  x: number;
  y: number;
  s?: number;
  t?: number;
  speed?: number;
  color?: string;
}> = ({ x, y, s = 1, t = 0, speed = 1, color = '#4A7A8C' }) => {
  const rot = t * 18 * speed;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={4} cy={4} rx={68} ry={10} fill="#000" opacity={0.38} />
      {/* Base & column */}
      <path d="M -58 0 Q -50 -16 0 -16 Q 50 -16 58 0 Z" fill="#D8D2C5" stroke="#1E1C24" strokeWidth={3.5} />
      <rect x={-12} y={-148} width={24} height={134} rx={4} fill="#D8D2C5" stroke="#1E1C24" strokeWidth={3} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={-5} y={-88 + i * 14} width={10} height={8} rx={2} fill={i === 0 ? '#D9534F' : color} />
      ))}
      <rect x={-6} y={-216} width={12} height={72} fill="#B8C2CC" stroke="#1E1C24" strokeWidth={2.5} />
      {/* Fan head */}
      <g transform="translate(0 -226)">
        <circle cx={0} cy={0} r={68} fill="#E8EEF2" opacity={0.18} stroke="#2A2834" strokeWidth={4} />
        {/* Spinning blades */}
        <g transform={`rotate(${rot})`}>
          {[0, 120, 240].map((ang) => (
            <path
              key={ang}
              transform={`rotate(${ang})`}
              d="M 0 0 Q -22 -34 -8 -56 Q 16 -60 22 -34 Q 16 -12 0 0 Z"
              fill={color}
              opacity={0.82}
              stroke="#1E1C24"
              strokeWidth={2}
            />
          ))}
        </g>
        {/* Wire cage spokes */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI;
          return (
            <line
              key={i}
              x1={Math.cos(a) * -66}
              y1={Math.sin(a) * -66}
              x2={Math.cos(a) * 66}
              y2={Math.sin(a) * 66}
              stroke="#4A4856"
              strokeWidth={1.4}
              opacity={0.5}
            />
          );
        })}
        <circle cx={0} cy={0} r={42} fill="none" stroke="#4A4856" strokeWidth={1.6} opacity={0.55} />
        <circle cx={0} cy={0} r={16} fill="#D8D2C5" stroke="#1E1C24" strokeWidth={3} />
        <circle cx={0} cy={0} r={6} fill={color} />
      </g>
    </g>
  );
};

/**
 * Ceiling fan (`CeilingFan` / Quạt trần 3 cánh):
 * Mounts at ceiling point (x, y) and spins smoothly with `t`.
 */
export const CeilingFan: React.FC<{
  x: number;
  y: number;
  s?: number;
  t?: number;
  speed?: number;
  color?: string;
}> = ({ x, y, s = 1, t = 0, speed = 1, color = '#5A7A72' }) => {
  const phase = t * 0.14 * speed;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -16 0 L 16 0 L 10 14 L -10 14 Z" fill="#D8D2C5" stroke="#1E1C24" strokeWidth={2.5} />
      <rect x={-4} y={14} width={8} height={64} fill="#B8C2CC" stroke="#1E1C24" strokeWidth={2.5} />
      {[0, 1, 2].map((i) => {
        const a = phase + (i * Math.PI * 2) / 3;
        const bx = Math.cos(a) * 145;
        const by = 82 + Math.sin(a) * 16;
        return (
          <path
            key={i}
            d={`M 0 82 L ${bx} ${by - 7} Q ${bx * 1.06} ${by} ${bx} ${by + 7} L 0 86 Z`}
            fill={color}
            stroke="#1E1C24"
            strokeWidth={2.5}
          />
        );
      })}
      <ellipse cx={0} cy={82} rx={30} ry={11} fill="#E8E2D4" stroke="#1E1C24" strokeWidth={3} />
    </g>
  );
};

/**
 * Wall-mounted air conditioner (`WallAC` / Điều hòa treo tường):
 * Includes LED temperature readout and cool air flow wisps when `on > 0`.
 */
export const WallAC: React.FC<{
  x: number;
  y: number;
  w?: number;
  on?: number;
  temp?: string;
  t?: number;
}> = ({ x, y, w = 240, on = 1, temp = '26°', t = 0 }) => {
  const s = w / 240;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-116 * s} y={-34 * s} width={240 * s} height={76 * s} rx={12 * s} fill="#000" opacity={0.3} />
      <path
        d={`M ${-120 * s} ${-40 * s} L ${120 * s} ${-40 * s} Q ${124 * s} ${28 * s} ${112 * s} ${34 * s} L ${-112 * s} ${34 * s} Q ${-124 * s} ${28 * s} ${-120 * s} ${-40 * s} Z`}
        fill="#F0EDE6"
        stroke="#24202C"
        strokeWidth={3 * s}
      />
      <path d={`M ${-112 * s} ${14 * s} L ${112 * s} ${14 * s}`} stroke="#B8B2A6" strokeWidth={2 * s} />
      <path d={`M ${-108 * s} ${24 * s} L ${108 * s} ${24 * s}`} stroke="#24202C" strokeWidth={3 * s} />
      {on > 0 ? (
        <g>
          <text x={82 * s} y={2 * s} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={16 * s} fill="#5CE6B8">
            {temp}
          </text>
          {[-60, 0, 60].map((wx, i) => (
            <path
              key={i}
              d={`M ${wx * s} ${38 * s} q ${-14 * s} ${(24 + Math.sin(t / 8 + i) * 6) * s} ${-28 * s} ${48 * s}`}
              stroke="#CFE8FF"
              strokeWidth={2.5 * s}
              fill="none"
              strokeLinecap="round"
              opacity={0.28 * on}
            />
          ))}
        </g>
      ) : null}
    </g>
  );
};

/**
 * Living room TV and media cabinet (`TVStand` / Kệ Tivi phòng khách):
 * Wooden low cabinet with drawers, router/set-top box, and flatscreen TV with ambient screen glow.
 * Place at (x, y) = floor contact center.
 */
export const TVStand: React.FC<{
  x: number;
  y: number;
  w?: number;
  on?: number;
}> = ({ x, y, w = 360, on = 1 }) => {
  const s = w / 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={6 * s} rx={190 * s} ry={14 * s} fill="#000" opacity={0.4} />
      {/* Legs */}
      <rect x={-166 * s} y={-20 * s} width={14 * s} height={20 * s} fill="#2A1A14" />
      <rect x={152 * s} y={-20 * s} width={14 * s} height={20 * s} fill="#2A1A14" />
      {/* Cabinet body */}
      <rect x={-180 * s} y={-88 * s} width={360 * s} height={70 * s} rx={5 * s} fill="#5C3A2C" stroke="#1E1412" strokeWidth={3.5 * s} />
      <rect x={-168 * s} y={-76 * s} width={102 * s} height={46 * s} rx={3 * s} fill="#462A1E" stroke="#7A4E3A" strokeWidth={2 * s} />
      <rect x={66 * s} y={-76 * s} width={102 * s} height={46 * s} rx={3 * s} fill="#462A1E" stroke="#7A4E3A" strokeWidth={2 * s} />
      <rect x={-54 * s} y={-76 * s} width={108 * s} height={46 * s} rx={3 * s} fill="#221818" />
      <rect x={-36 * s} y={-44 * s} width={72 * s} height={10 * s} rx={2 * s} fill="#2C2C38" />
      <circle cx={24 * s} cy={-39 * s} r={2.2 * s} fill="#4CC774" />
      {/* TV stand neck & screen */}
      <rect x={-42 * s} y={-96 * s} width={84 * s} height={8 * s} rx={3 * s} fill="#24222E" />
      <rect x={-10 * s} y={-114 * s} width={20 * s} height={20 * s} fill="#1C1A24" />
      {on > 0 ? <Glow x={0} y={-188 * s} r={210 * s} o={0.4 * on} /> : null}
      <rect x={-136 * s} y={-262 * s} width={272 * s} height={152 * s} rx={6 * s} fill="#181720" stroke="#343242" strokeWidth={3.5 * s} />
      <rect
        x={-128 * s}
        y={-254 * s}
        width={256 * s}
        height={136 * s}
        rx={3 * s}
        fill={on > 0 ? '#2C4268' : '#0E0D14'}
      />
      {on > 0 ? (
        <g opacity={on}>
          <circle cx={40 * s} cy={-204 * s} r={28 * s} fill="#FFE2B0" opacity={0.35} />
          <path d={`M ${-128 * s} ${-118 * s} L ${-40 * s} ${-184 * s} L ${30 * s} ${-146 * s} L ${128 * s} ${-196 * s} L ${128 * s} ${-118 * s} Z`} fill="#1E2C46" />
        </g>
      ) : (
        <path d={`M ${-100 * s} ${-246 * s} L ${-20 * s} ${-246 * s} L ${-90 * s} ${-130 * s} Z`} fill="#FFF" opacity={0.05} />
      )}
    </g>
  );
};

/**
 * Vietnamese red-and-gold tear-off block calendar (`CalendarBlock` / Lịch bloc treo tường):
 * Classic crimson board with gold trim and tear-off date pad.
 */
export const CalendarBlock: React.FC<{
  x: number;
  y: number;
  w?: number;
  day?: string;
  month?: string;
}> = ({ x, y, w = 96, day = '14', month = 'THÁNG 3' }) => {
  const s = w / 96;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-44 * s} y={4 * s} width={96 * s} height={148 * s} rx={6 * s} fill="#000" opacity={0.35} />
      <path d={`M ${-18 * s} 0 L 0 ${-16 * s} L ${18 * s} 0`} stroke="#C89B4B" strokeWidth={2.5 * s} fill="none" />
      <circle cx={0} cy={-16 * s} r={3.5 * s} fill="#1E1824" />
      <rect x={-48 * s} y={0} width={96 * s} height={148 * s} rx={6 * s} fill="#B82E2A" stroke="#E6B85C" strokeWidth={3 * s} />
      <circle cx={0} cy={36 * s} r={22 * s} fill="none" stroke="#E6B85C" strokeWidth={2 * s} opacity={0.85} />
      <text x={0} y={43 * s} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={20 * s} fill="#FFE29A">
        PHÚC
      </text>
      {/* Tear-off paper block */}
      <rect x={-34 * s} y={72 * s} width={68 * s} height={64 * s} rx={3 * s} fill="#F8F4EA" stroke="#2A2020" strokeWidth={2 * s} />
      <rect x={-34 * s} y={72 * s} width={68 * s} height={16 * s} fill="#2E6E5E" />
      <text x={0} y={84 * s} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={9.5 * s} fill="#FFF">
        {month}
      </text>
      <text x={0} y={122 * s} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={32 * s} fill="#B82E2A">
        {day}
      </text>
    </g>
  );
};

/**
 * Vietnamese accordion folding iron door (`FoldingIronDoor` / Cửa xếp sắt nhà phố & tiệm sửa đồ):
 * Draws a doorway from (x, y) = bottom center with width `w`, height `h`, and `open` (0 = shut, 1 = pushed to sides).
 */
export const FoldingIronDoor: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  open?: number;
  color?: string;
}> = ({ x, y, w = 360, h = 420, open = 0.65, color = '#4A6E68' }) => {
  const panelW = (w * 0.5) * (1 - open * 0.72);
  const bars = 6;
  const renderLeaf = (side: -1 | 1) => {
    const xEdge = side * (w / 2);
    const xInner = xEdge - side * panelW;
    const step = panelW / bars;
    return (
      <g key={side}>
        <rect
          x={Math.min(xEdge, xInner)}
          y={-h}
          width={panelW}
          height={h}
          fill="#1A2226"
          opacity={0.35}
        />
        {Array.from({ length: bars + 1 }).map((_, i) => {
          const bx = xEdge - side * i * step;
          return (
            <g key={i}>
              <line x1={bx} y1={-h} x2={bx} y2={0} stroke={color} strokeWidth={5} />
              {i < bars ? (
                <g stroke="#3A5852" strokeWidth={3.5}>
                  <line x1={bx} y1={-h * 0.82} x2={bx - side * step} y2={-h * 0.58} />
                  <line x1={bx} y1={-h * 0.58} x2={bx - side * step} y2={-h * 0.82} />
                  <line x1={bx} y1={-h * 0.42} x2={bx - side * step} y2={-h * 0.18} />
                  <line x1={bx} y1={-h * 0.18} x2={bx - side * step} y2={-h * 0.42} />
                </g>
              ) : null}
            </g>
          );
        })}
        <rect x={Math.min(xEdge, xInner)} y={-h} width={panelW} height={10} fill={color} />
        <rect x={Math.min(xEdge, xInner)} y={-12} width={panelW} height={12} fill={color} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 - 12} y={-h - 12} width={w + 24} height={14} fill="#2A242C" />
      <rect x={-w / 2 - 12} y={-h - 12} width={14} height={h + 12} fill="#2A242C" />
      <rect x={w / 2 - 2} y={-h - 12} width={14} height={h + 12} fill="#2A242C" />
      {renderLeaf(-1)}
      {renderLeaf(1)}
    </g>
  );
};
