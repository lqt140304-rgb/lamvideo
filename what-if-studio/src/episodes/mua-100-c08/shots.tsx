import React from 'react';
import { Hero, kf, rnd, camT, LOOKS, joints, toWorld, stand, Rain, Dog, Glow, LightVeil, Foreground, CloudBank, Splashes, ShotProps, lampBlink, LampDim } from '../../engine';
import { OpenHand } from '../../engine/hands';
import { LEG_LEN } from '../../engine/rig';
import { Bookcase, ShoeRack, Plant, NoticeBoard } from '../../engine/sets/school';
import { P, talkAt, Back } from '../mua-100-c01/shots';
import { sit, ChairFor, Duffel, Bundle } from '../mua-100-c03/shots';
import { flashAt, Flash } from '../mua-100-c04/shots';
import { Tense, Vignette, LensRain, NearEdge, School, SH, Photo } from '../mua-100-c05/shots';
import { Room, onMat, Corridor, HELPER, Bowl, Jerry } from '../mua-100-c06/shots';
import { Eave, Notebook } from '../mua-100-c07/shots';

// Cảnh 8 — Những tuần sau: Đêm gió đổi giọng. Weeks in the shelter wear the mat thin; then the storm night: a window
// latch snaps, the shutter bangs in, water hits the mat; Linh wakes in the dark to an empty blanket. Torch light, a
// counted roll, a sign crashing in the cordoned yard. Grey dawn, the wet corner, a dry blanket handed over. The routine
// after; the forecast of the rain ending; a morning with no rain on the roof; and the radio.
// The night is shot to be breathless: strobing lightning, a hand-held camera that cannot keep still, a whip pan, a crash
// zoom on the scream, the child's own eyes in the dark, torch beams cutting the room, the floor seen from under a chair.

const AN = LOOKS.an;
const HANH = LOOKS.hanh;
const LINH = LOOKS.linh;
const SAU = LOOKS.baSau;
const NAM = LOOKS.nam;
const TAN = (l: typeof LOOKS.an, c: string) => ({ ...l, skin: c, skinShade: c, hand: c });
const EXTRA = [TAN(LOOKS.mom, '#E2B48C'), LOOKS.mo, TAN(LOOKS.student, '#D9A880'), TAN(LOOKS.tech, '#E6B98F')];
const L = '#16141C';
const FONT = 'Comic Sans MS, Comic Sans, cursive';
const onFloor = (floor: number, scale: number) => floor - LEG_LEN * scale;
const hand = (pose: ReturnType<typeof P>, side: 'armL' | 'armR') => toWorld(pose, joints(pose)[side].end);
/** Emotional close: start wide on the person, end tight on the face. */
const push = (t: number, len: number, x: number, z1 = 2.8) => camT(x, kf(t, [[0, 620], [len, 470]]), kf(t, [[0, 1.35], [len, z1]]));

// ================================================================ night and storm
/** The dark of the night: a heavy veil over everything drawn before it, with holes where light falls. */
const Night: React.FC<{ id: string; lights: [number, number, number][]; o?: number }> = ({ id, lights, o = 0.86 }) => <LightVeil id={id} lights={lights} o={o} />;
/** The battery lamp: a small box with a bright face and its glow. */
const Lamp: React.FC<{ x: number; y: number; s?: number; on?: number }> = ({ x, y, s = 1, on = 1 }) => (
  <g>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-40} y={-30} width={80} height={60} rx={10} fill="#3E4A56" stroke={L} strokeWidth={4} />
      <rect x={-30} y={-20} width={60} height={40} rx={6} fill={on > 0.5 ? '#FFF4D0' : '#6A6A60'} />
      <path d="M -26 -30 Q 0 -70 26 -30" stroke={L} strokeWidth={8} fill="none" />
    </g>
    {on > 0 ? <Glow x={x} y={y} r={420 * s} o={0.9 * on} /> : null}
  </g>
);
/** A torch beam: a soft cone from (x, y) towards angle `a` (degrees, 0 = right). */
const Beam: React.FC<{ x: number; y: number; a: number; len?: number; spread?: number; o?: number; id: string }> = ({ x, y, a, len = 1400, spread = 18, o = 0.4, id }) => {
  const r = (d: number) => (d * Math.PI) / 180;
  const p1 = [x + len * Math.cos(r(a - spread)), y + len * Math.sin(r(a - spread))];
  const p2 = [x + len * Math.cos(r(a + spread)), y + len * Math.sin(r(a + spread))];
  return (
    <g style={{ mixBlendMode: 'screen' }}>
      <defs>
        <linearGradient id={`${id}bm`} gradientUnits="userSpaceOnUse" x1={x} y1={y} x2={x + len * Math.cos(r(a))} y2={y + len * Math.sin(r(a))}>
          <stop offset="0" stopColor="#FFF4D0" stopOpacity={o} />
          <stop offset="1" stopColor="#FFF4D0" stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={`${x},${y} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`} fill={`url(#${id}bm)`} />
    </g>
  );
};
/** Driving rain: long streaks thrown sideways by the wind. */
const Storm: React.FC<{ t: number; seed?: number; n?: number; o?: number; slant?: number }> = ({ t, seed = 1, n = 160, o = 0.5, slant = 0.9 }) => (
  <g opacity={o}>
    {Array.from({ length: n }).map((_, i) => {
      const sp = 38 + 20 * rnd(seed, i);
      const y = ((t * sp + rnd(seed + 1, i) * 1600) % 1600) - 300;
      const x = ((rnd(seed + 2, i) * 2600 + t * sp * slant) % 2600) - 400;
      return <path key={i} d={`M ${x} ${y} l ${-90 * slant} -90`} stroke="#DDE6EC" strokeWidth={2 + 2 * rnd(seed + 3, i)} />;
    })}
  </g>
);
/** Whip-pan streaks: horizontal smears while the camera rushes, `k` 0..1 strength. */
const Whip: React.FC<{ k: number }> = ({ k }) =>
  k > 0.05 ? (
    <g opacity={k}>
      {Array.from({ length: 30 }).map((_, i) => <rect key={i} x={-200} y={i * 40 + 10 * rnd(9, i)} width={2400} height={8 + 14 * rnd(8, i)} fill={i % 3 ? '#1A1E28' : '#6A6458'} opacity={0.5} />)}
    </g>
  ) : null;
/** The left-wall window of the shelter room; `open` 0 shut .. 1 the shutter blown right into the room. */
const WIN = (v: number, w: number) => SH.P(0, v, w);
const Shutter: React.FC<{ open: number; t: number }> = ({ open, t }) => {
  const k = Math.min(1, open) + 0.05 * Math.sin(t * 1.3) * (open > 0.5 ? 1 : 0);
  const free = (v: number) => {
    const a = WIN(v, 0.62);
    const b = SH.P(0.26, v, 0.32);
    return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
  };
  const h0 = WIN(0.24, 0.32);
  const h1 = WIN(0.62, 0.32);
  const f0 = free(0.24);
  const f1 = free(0.62);
  return <polygon points={`${h0.x},${h0.y} ${f0.x},${f0.y} ${f1.x},${f1.y} ${h1.x},${h1.y}`} fill="#6A4A2E" stroke={L} strokeWidth={6} />;
};
/** Water thrown in through the open window onto the mat corner. */
const Blast: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (k <= 0) return null;
  const a = WIN(0.42, 0.47);
  return (
    <g opacity={k}>
      {Array.from({ length: 40 }).map((_, i) => {
        const ph = (t * 0.06 + rnd(4, i)) % 1;
        const tx = a.x + 520 * ph + 60 * rnd(5, i);
        const ty = a.y + 300 * ph * ph + 120 * (rnd(6, i) - 0.5);
        return <path key={i} d={`M ${tx} ${ty} l 50 14`} stroke="#DDE6EC" strokeWidth={4} opacity={1 - ph} />;
      })}
      <polygon points={SH.Q([[0.02, 1, 0.34], [0.2, 1, 0.34], [0.2, 1, 0.62], [0.02, 1, 0.62]])} fill="#5E6E70" opacity={0.55} />
    </g>
  );
};

/** The family's mat by the window with a blanket over a sleeper's legs; draw the person between `under` and the blanket. */
const Blanket: React.FC<{ u: number; w: number; s?: number; c?: string }> = ({ u, w, s = 1, c = '#B5604F' }) => {
  const p = SH.P(u, 1, w);
  const k = SH.s(w) / SH.s(0) * 0.5 * s;
  return <path d={`M ${p.x - 160 * k} ${p.y} Q ${p.x - 140 * k} ${p.y - 70 * k} ${p.x - 20 * k} ${p.y - 74 * k} L ${p.x + 200 * k} ${p.y - 60 * k} Q ${p.x + 230 * k} ${p.y - 20 * k} ${p.x + 210 * k} ${p.y} Z`} fill={c} stroke={L} strokeWidth={4} />;
};
/** Someone sitting up out of the blanket on the floor: hips at the floor. */
const upAt = (u: number, w: number, k = 1, rise = 1) => {
  const s = stand(SH, u, w);
  const sc = s.scale * k;
  return { x: s.x, y: SH.P(u, 1, w).y - 12 * sc, scale: sc, tilt: -55 * (1 - rise) };
};

/** The river board by the door: a painted gauge with a red level line, and the day's numbers. */
const RiverBoard: React.FC<{ level: number; t: number; marks?: number }> = ({ level, t, marks = 5 }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#C8BC94" />
    <rect x={560} y={140} width={800} height={820} rx={10} fill="#F4F4EE" stroke="#6A6A6A" strokeWidth={12} />
    <text x={960} y={230} fontFamily={FONT} fontSize={54} textAnchor="middle" fill="#2E5E9A">BẢNG MỰC SÔNG</text>
    {Array.from({ length: 9 }).map((_, i) => (
      <g key={i}>
        <path d={`M 640 ${860 - i * 70} L 700 ${860 - i * 70}`} stroke="#2A2A2A" strokeWidth={4} />
        <text x={720} y={872 - i * 70} fontFamily={FONT} fontSize={30} fill="#2A2A2A">{(i * 0.25).toFixed(2)} m</text>
      </g>
    ))}
    <rect x={900} y={860 - 280 * level} width={360} height={280 * level} fill="#6EA0C8" opacity={0.6} />
    <path d={`M 880 ${860 - 280 * level} L 1280 ${860 - 280 * level}`} stroke="#C8322A" strokeWidth={8} />
    {Array.from({ length: marks }).map((_, i) => <circle key={i} cx={940 + i * 70} cy={860 - 280 * (0.5 + 0.35 * Math.sin(i * 1.3))} r={10} fill="#2E5E9A" />)}
    <Glow x={960} y={300} r={800} o={0.3} />
  </g>
);

/** The inner room at night, for closes: a wall, a floor at `floor`, the dim shapes of chairs and bags. */
const DarkRoom: React.FC<{ floor: number }> = ({ floor }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#1E2230" />
    <rect x={-400} y={floor} width={2720} height={900} fill="#2A2E36" />
    <path d={`M -400 ${floor} L 2320 ${floor}`} stroke="#3A3E48" strokeWidth={6} />
    {[200, 1500, 1800].map((x, i) => <g key={i} opacity={0.5}><rect x={x} y={floor - 160} width={120} height={14} fill="#3A3428" /><rect x={x + 6} y={floor - 146} width={10} height={146} fill="#3A3428" /><rect x={x + 104} y={floor - 146} width={10} height={146} fill="#3A3428" /></g>)}
    <ellipse cx={600} cy={floor + 10} rx={90} ry={16} fill="#14161C" />
  </g>
);
/** Clip a figure at the floor line, so someone sitting up on the floor shows no legs below it. */
const AboveFloor: React.FC<{ y: number; id: string; children: React.ReactNode }> = ({ y, id, children }) => (
  <g>
    <clipPath id={`${id}af`}><rect x={-3000} y={-3000} width={8000} height={3000 + y} /></clipPath>
    <g clipPath={`url(#${id}af)`}>{children}</g>
  </g>
);

// ================================================================ the shots

// ---------- S1: macro: the edge of the mat by the window, worn to threads ----------
export const S1: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 1020]]), 560, 1.0)}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#8A8270" />
    <rect x={-200} y={380} width={2320} height={900} fill="#C8A860" />
    {Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M ${-200 + i * 80} 380 L ${-200 + i * 80} 1300`} stroke="#A88E50" strokeWidth={6} />)}
    <rect x={-200} y={-200} width={2320} height={580} fill="#6E6A60" />
    {Array.from({ length: 50 }).map((_, i) => <path key={i} d={`M ${-180 + i * 48} 384 q ${20 * Math.sin(i)} -${40 + 50 * rnd(2, i)} ${30 * (rnd(3, i) - 0.5)} -${90 + 80 * rnd(4, i)}`} stroke={i % 3 ? '#B89A58' : '#8E7440'} strokeWidth={9} fill="none" strokeLinecap="round" />)}
    <path d="M -200 384 L 2120 384" stroke="#6E5A30" strokeWidth={8} strokeDasharray="60 40" />
    <Glow x={600} y={100} r={900} kind="cool" o={0.4} />
  </g>
);

// ---------- S2: the river board: the level falls a little, then rises again ----------
export const S2: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(1000, 520, kf(t, [[0, 1.0], [len, 1.15]]))}>
    <RiverBoard level={kf(t, [[0, 0.7], [len * 0.4, 0.55], [len, 0.78]])} t={t} />
  </g>
);

// ---------- S3: the corridor by day: people at their work ----------
export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(900, 600, 1.15)}>
    <Corridor t={t} id="c8s3">
      <Hero look={HELPER} pose={P({ x: 760, y: onFloor(980, 1.0), scale: 1.0, yaw: 0.4, look: 0.3, expr: 'neutral', armL: { a: 30, b: 60 }, armR: { a: 30, b: 60 } }, t, 6)} rimId="filmR" shadow={0} />
      <Jerry x={760} y={940} s={0.5} />
      <Hero look={SAU} pose={P({ x: 1300, y: onFloor(960, 0.95), scale: 0.95, yaw: -0.4, look: -0.3, expr: 'neutral', armL: { a: 30, b: 70 }, armR: { a: 30, b: 70 } }, t, 2)} rimId="filmR" shadow={0} />
    </Corridor>
  </g>
);

// ---------- S4: the wind changes its voice: everyone stops and looks up at the roof; slow push up ----------
export const S4: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <Tense t={t} a={kf(t, [[0, 0], [len, 3]])}>
      <g transform={camT(900, kf(t, [[0, 600], [len, 420]]), kf(t, [[0, 1.15], [len, 1.5]]))}>
        <Corridor t={t} id="c8s4">
          <Hero look={HELPER} pose={P({ x: 760, y: onFloor(980, 1.0), scale: 1.0, yaw: 0.2, look: 0.1, headTilt: -16, expr: 'worried', armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, 6)} rimId="filmR" shadow={0} />
          <Hero look={SAU} pose={P({ x: 1300, y: onFloor(960, 0.95), scale: 0.95, yaw: -0.2, look: 0, headTilt: 16, expr: 'worried', armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, 2)} rimId="filmR" shadow={0} />
        </Corridor>
        <Storm t={t} o={kf(t, [[0, 0.1], [len, 0.4]])} seed={4} slant={0.6} />
      </g>
    </Tense>
    <Vignette o={0.4} id="c8s4" />
  </g>
);

// ---------- S5: before the storm: Hạnh and a helper drag the mats away from the window ----------
export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[0, 0], [len, 1]]);
  const h = stand(SH, 0.2 + 0.18 * k, 0.5);
  const g = stand(SH, 0.08 + 0.18 * k, 0.62);
  return (
    <g transform={camT(760, 560, 1.25)}>
      <Room t={t} id="c8s5" />
      <polygon points={SH.Q([[0.02 + 0.18 * k, 1, 0.42], [0.22 + 0.18 * k, 1, 0.42], [0.22 + 0.18 * k, 1, 0.66], [0.02 + 0.18 * k, 1, 0.66]])} fill="#C8A860" stroke="#5A4A2E" strokeWidth={3} />
      <Hero look={HANH} pose={P({ x: h.x, y: h.y, scale: h.scale, yaw: 0.7, look: 0.5, tilt: 14, expr: 'neutral', armL: { a: -40, b: -40 }, armR: { a: -30, b: -50 } }, t, 3)} rimId="filmR" shadow={0} />
      <Hero look={HELPER} pose={P({ x: g.x, y: g.y, scale: g.scale, yaw: 0.7, look: 0.4, tilt: 14, expr: 'neutral', armL: { a: -40, b: -40 }, armR: { a: -30, b: -50 } }, t, 6)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S6: the inner room: An and a colleague stack the reserve of drinking water ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => {
  const up = kf(t, [[6, 0], [36, 1]]);
  return (
    <g transform={camT(980, 600, kf(t, [[0, 1.3], [len, 1.45]]))}>
      <Room t={t} id="c8s6" />
      {[0, 1, 2, 3, 4].map((i) => <Jerry key={i} x={1180 + i * 70} y={780} s={0.42} />)}
      {[0, 1, 2].map((i) => <Jerry key={i} x={1215 + i * 70} y={700} s={0.42} />)}
      <Jerry x={kf(t, [[6, 1000], [36, 1425]])} y={kf(t, [[6, 760], [36, 700]])} s={0.42} />
      <Hero look={AN} pose={P({ x: 960, y: onFloor(800, 0.9), scale: 0.9, yaw: 0.6, look: 0.5, tilt: 10 - 10 * up, expr: 'neutral', armL: { a: -40, b: -50 }, armR: { a: 40 + 20 * up, b: 50 } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={HELPER} pose={P({ x: 1600, y: onFloor(800, 0.9), scale: 0.9, yaw: -0.6, look: -0.5, expr: 'neutral', armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 6)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S7: the sheet taped by the door: the way to the community hall ----------
export const S7: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.2], [len, 1.4]]))}>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#C8BC94" />
    <rect x={200} y={-400} width={260} height={1900} fill="#8A6440" stroke="#5A3E26" strokeWidth={8} />
    <g transform="rotate(-2 960 540)">
      <rect x={620} y={180} width={680} height={760} fill="#F4F4EE" stroke="#8A8A8A" strokeWidth={4} />
      <text x={960} y={270} fontFamily={FONT} fontSize={44} textAnchor="middle" fill="#C8322A">KHI CÓ BÃO</text>
      <text x={960} y={330} fontFamily={FONT} fontSize={32} textAnchor="middle" fill="#2A2A2A">sang nhà sinh hoạt cộng đồng</text>
      <path d="M 700 820 Q 800 600 960 640 T 1200 420" stroke="#2E5E9A" strokeWidth={10} fill="none" strokeDasharray="30 20" />
      <path d="M 1200 420 l -40 10 l 22 30 Z" fill="#2E5E9A" />
      <rect x={680} y={780} width={110} height={80} fill="#B5604F" />
      <text x={735} y={890} fontFamily={FONT} fontSize={26} textAnchor="middle" fill="#2A2A2A">trường</text>
      <rect x={1140} y={360} width={130} height={90} fill="#5E8A3A" />
      <text x={1205} y={480} fontFamily={FONT} fontSize={26} textAnchor="middle" fill="#2A2A2A">nhà sinh hoạt</text>
      {[[650, 200], [1270, 200]].map(([x, y], i) => <rect key={i} x={x - 30} y={y - 20} width={80} height={36} fill="#E8E0B8" opacity={0.8} />)}
    </g>
  </g>
);

// ---------- S8: night, the school from outside: the storm, lightning, the trees bent flat ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => {
  const f = flashAt(t, [20, 70]);
  return (
    <g>
      <Tense t={t} a={6} tilt={kf(t, [[0, -2], [len, 3]])}>
        <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.12]]))}>
          <School t={t} />
          <Night id="c8s8" lights={[[960, 460, 500]]} o={0.85} />
          {[-200, 1800].map((x, i) => (
            <g key={i} transform={`translate(${x} 700) rotate(${(i ? -1 : 1) * (22 + 8 * Math.sin(t * 0.6 + i))})`}>
              <path d="M 0 0 L 0 -480" stroke="#141A14" strokeWidth={40} />
              <circle cx={0} cy={-500} r={170} fill="#141A14" />
            </g>
          ))}
          <Storm t={t} o={0.6} seed={8} />
        </g>
      </Tense>
      <Flash f={f} bolt={[1400, 0]} />
      <LensRain t={t} seed={8} n={20} />
      <Vignette o={0.6} id="c8s8" />
    </g>
  );
};

// ---------- S9: inside, at the window: sheets of rain hurled at the glass, the shutter straining ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <Tense t={t} a={7} tilt={-5}>
      <rect x={-200} y={-200} width={2320} height={1500} fill="#1A2028" />
      <rect x={400} y={160} width={1120} height={760} fill="#3A4654" />
      <Storm t={t} o={0.8} seed={9} n={220} slant={1.4} />
      <rect x={400} y={160} width={1120} height={760} fill="none" stroke="#3E2A18" strokeWidth={40} />
      <path d="M 960 160 L 960 920" stroke="#3E2A18" strokeWidth={26} />
      <rect x={940} y={500} width={40} height={60} rx={6} fill="#8A8A8A" stroke={L} strokeWidth={4} transform={`rotate(${8 * Math.sin(t * 1.7)} 960 530)`} />
      <Flash f={flashAt(t, [30]) * 0.7} />
    </Tense>
    <Vignette o={0.65} id="c8s9" />
  </g>
);

// ---------- S10: on the floor at the door: the wind whistles through the gap, spray scuds in under it ----------
export const S10: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <Tense t={t} a={4}>
      <rect x={-200} y={-200} width={2320} height={1500} fill="#14181E" />
      <rect x={-200} y={700} width={2320} height={600} fill="#3A3A34" />
      <rect x={300} y={-200} width={1320} height={900} fill="#2A2018" stroke="#0E0A08" strokeWidth={10} />
      <rect x={300} y={690} width={1320} height={18} fill="#8A9AA4" opacity={0.8} />
      {Array.from({ length: 50 }).map((_, i) => {
        const ph = (t * 0.08 + rnd(2, i)) % 1;
        return <path key={i} d={`M ${300 + 1320 * rnd(3, i)} ${708 + 300 * ph} l ${-40 + 80 * rnd(4, i)} 20`} stroke="#AABAC4" strokeWidth={3} opacity={(1 - ph) * 0.8} />;
      })}
    </Tense>
    <Vignette o={0.7} id="c8s10" />
  </g>
);

// ---------- S11: macro: the latch: a crack, and it snaps ----------
export const S11: React.FC<ShotProps> = ({ t, len }) => {
  const snap = kf(t, [[8, 0], [12, 1]]);
  return (
    <g>
      <Tense t={t} a={snap > 0 ? 16 * (1 - kf(t, [[12, 0], [30, 1]])) + 4 : 2}>
        <g transform={camT(960, 540, kf(t, [[0, 1.0], [10, 1.4], [len, 1.5]]))}>
          <rect x={-200} y={-200} width={2320} height={1500} fill="#2A2018" />
          <rect x={700} y={-200} width={120} height={1500} fill="#4E3A26" />
          <rect x={1100} y={-200} width={120} height={1500} fill="#4E3A26" transform={`translate(${200 * snap} 0) rotate(${10 * snap} 1160 540)`} />
          <rect x={780} y={500} width={140} height={60} rx={10} fill="#9A9A9A" stroke={L} strokeWidth={5} />
          <g transform={`translate(${380 * snap} ${-120 * snap}) rotate(${180 * snap} 1050 530)`}>
            <path d="M 900 530 L 1120 530" stroke="#B8B8B8" strokeWidth={22} strokeLinecap="round" />
            <path d="M 900 530 L 1120 530" stroke={L} strokeWidth={4} fill="none" />
          </g>
          {snap > 0 ? <path d="M 940 470 l 30 40 l -20 20 l 40 50" stroke="#F4F8FF" strokeWidth={6} fill="none" opacity={1 - kf(t, [[12, 0], [24, 1]])} /> : null}
        </g>
      </Tense>
      <Flash f={flashAt(t, [10]) * 0.8} />
      <Vignette o={0.6} id="c8s11" />
    </g>
  );
};

// ---------- S12: wide, the dark room: the shutter bursts in and bangs, water slams onto the mat corner; strobe ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => {
  const open = kf(t, [[0, 0], [8, 1.1], [14, 0.85], [22, 1]]);
  const f = flashAt(t, [2, 52]);
  const l = upAt(0.14, 0.62, 0.72, 0);
  return (
    <g>
      <Tense t={t} a={9} tilt={kf(t, [[0, 6], [len, -4]])}>
        <g transform={camT(700, 560, 1.25)}>
          <Room t={t} id="c8s12" />
          <AboveFloor y={SH.P(0.14, 1, 0.62).y - 6} id={'l' + String(len)}><Hero look={LINH} pose={P({ ...l, yaw: 0.4, look: 0.4, headTilt: -20, expr: 'tired', armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, 4)} rimId="filmR" shadow={0} /></AboveFloor>
          <Blanket u={0.14} w={0.62} s={0.9} />
          <Blanket u={0.26} w={0.6} c="#4F7486" />
          <Shutter open={open} t={t} />
          <Blast t={t} k={kf(t, [[4, 0], [10, 1]])} />
          <Night id="c8s12" lights={[[WIN(0.4, 0.47).x, WIN(0.4, 0.47).y, 300]]} o={0.84} />
          <Storm t={t} o={0.35} seed={12} slant={1.6} />
        </g>
      </Tense>
      <Flash f={f} />
      <LensRain t={t} seed={12} n={26} />
      <Vignette o={0.6} id="c8s12" />
    </g>
  );
};

// ---------- S13: Linh jolts up out of her blanket in the dark; each flash shows her face ----------
export const S13: React.FC<ShotProps> = ({ t, len }) => {
  const rise = kf(t, [[0, 0], [10, 1]]);
  const l = upAt(0.14, 0.62, 0.72, rise);
  return (
    <g>
      <Tense t={t} a={6}>
        <g transform={camT(l.x, l.y - 150 * l.scale, kf(t, [[0, 2.0], [len, 2.6]]))}>
          <Room t={t} id="c8s13" />
          <AboveFloor y={SH.P(0.14, 1, 0.62).y - 6} id={'l' + String(len)}><Hero look={LINH} pose={P({ ...l, yaw: 0.1, look: kf(t, [[0, 0], [16, 0.6], [30, -0.4]]), headTilt: 0, expr: 'shock', armL: { a: 30, b: 40 }, armR: { a: 20, b: 30 } }, t, 4)} rimId="filmR" shadow={0} /></AboveFloor>
          <Blanket u={0.14} w={0.62} s={0.9} />
          <Night id="c8s13" lights={[[l.x - 300, l.y - 200, 260]]} o={0.86} />
        </g>
      </Tense>
      <Flash f={flashAt(t, [4, 26]) * 0.8} />
      <Vignette o={0.7} id="c8s13" />
    </g>
  );
};

// ---------- S14: her eyes: her hand gropes across the blanket beside her in the dark: empty ----------
export const S14: React.FC<ShotProps> = ({ t, len }) => {
  const reach = kf(t, [[0, 0], [len, 1]]);
  return (
    <g>
      <Tense t={t} a={5}>
        <rect x={-200} y={-200} width={2320} height={1500} fill="#0C0E14" />
        <path d="M -200 600 Q 600 520 1200 600 T 2120 560 L 2120 1300 L -200 1300 Z" fill="#2A3442" />
        <path d="M 400 700 Q 900 640 1500 720" stroke="#3A4656" strokeWidth={20} fill="none" />
        <path d="M 600 820 Q 1100 760 1700 840" stroke="#3A4656" strokeWidth={20} fill="none" />
        <OpenHand x={kf(t, [[0, 500], [len, 1200]])} y={kf(t, [[0, 900], [len, 760]])} rot={-110 + 30 * Math.sin(reach * 6)} s={1.6} skin="#8A7464" />
        <path d={`M ${kf(t, [[0, 500], [len, 1200]])} ${kf(t, [[0, 900], [len, 760]])} l -600 600`} stroke="#0A0A0E" strokeWidth={230} strokeLinecap="round" />
        <path d={`M ${kf(t, [[0, 500], [len, 1200]])} ${kf(t, [[0, 900], [len, 760]])} l -600 600`} stroke="#5A564C" strokeWidth={214} strokeLinecap="round" />
      </Tense>
      <Flash f={flashAt(t, [18]) * 0.6} />
      <Vignette o={0.85} id="c8s14" />
    </g>
  );
};

// ---------- S15: crash zoom: Linh screams for her mother ----------
export const S15: React.FC<ShotProps> = ({ t, len }) => {
  const l = upAt(0.14, 0.62, 0.72, 1);
  return (
    <g>
      <Tense t={t} a={kf(t, [[0, 2], [6, 10], [len, 4]])}>
        <g transform={camT(l.x, l.y - 170 * l.scale, kf(t, [[0, 1.6], [6, 4.2], [len, 4.4]]))}>
          <Room t={t} id="c8s15" />
          <Hero look={LINH} pose={P({ ...l, yaw: -0.2, look: -0.3, headTilt: -6, expr: 'shock', talk: talkAt(t, 0, len) * 1.4, armL: { a: 20, b: 30 }, armR: { a: 20, b: 30 } }, t, 4)} rimId="filmR" shadow={0} />
          <Night id="c8s15" lights={[[l.x + 200, l.y - 200, 280]]} o={0.8} />
        </g>
      </Tense>
      <Flash f={flashAt(t, [6]) * 0.7} />
      <Vignette o={0.7} id="c8s15" />
    </g>
  );
};

// ---------- S16: Hạnh, a silhouette against the corridor's lamp, dragging the bags, turns straight back ----------
export const S16: React.FC<ShotProps> = ({ t, len }) => {
  const turn = kf(t, [[6, 0], [20, 1]]);
  return (
    <g>
      <Tense t={t} a={5}>
        <rect x={-200} y={-200} width={2320} height={1500} fill="#0C0E14" />
        <rect x={700} y={100} width={520} height={900} fill="#E8B060" />
        <Glow x={960} y={500} r={700} o={0.8} />
        <Hero look={HANH} pose={P({ x: 960, y: onFloor(1000, 1.3), scale: 1.3, yaw: 0.7 - 1.4 * turn, look: 0.6 - 1.2 * turn, expr: 'worried', tilt: 10 * (1 - turn), armL: { a: 30 * (1 - turn), b: 20 }, armR: { a: 10, b: 14 } }, t, 3)} rimId="filmR" shadow={0} />
        <Duffel x={1220} y={1000} s={0.9} />
        <rect x={-200} y={-200} width={2320} height={1500} fill="#000" opacity={0.25} />
      </Tense>
      <Vignette o={0.7} id="c8s16" />
    </g>
  );
};

// ---------- S17: close: a hand finds a hand in the dark ----------
export const S17: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[0, 0], [20, 1]]);
  return (
    <g>
      <Tense t={t} a={4}>
        <rect x={-200} y={-200} width={2320} height={1500} fill="#10141C" />
        <Glow x={1300} y={300} r={700} o={0.5} />
        <OpenHand x={kf(t, [[0, 2000], [20, 1240]])} y={360} rot={100} s={1.5} skin={HANH.skin} />
        <path d={`M ${kf(t, [[0, 2000], [20, 1240]])} 360 l 900 -100`} stroke={L} strokeWidth={190} strokeLinecap="round" />
        <path d={`M ${kf(t, [[0, 2000], [20, 1240]])} 360 l 900 -100`} stroke={HANH.jacket} strokeWidth={178} strokeLinecap="round" />
        <OpenHand x={kf(t, [[0, 300], [20, 640]])} y={560} rot={-80} s={1.2} skin={LINH.skin} />
        <path d={`M ${kf(t, [[0, 300], [20, 640]])} 560 l -800 80`} stroke={L} strokeWidth={156} strokeLinecap="round" />
        <path d={`M ${kf(t, [[0, 300], [20, 640]])} 560 l -800 80`} stroke={LINH.jacket} strokeWidth={144} strokeLinecap="round" />
      </Tense>
      <Vignette o={0.6} id="c8s17" />
    </g>
  );
};

// ---------- S18: whip pan: An lunges towards the banging window ----------
export const S18: React.FC<ShotProps> = ({ t, len }) => {
  const whip = kf(t, [[0, 1], [8, 0]]);
  const a = stand(SH, kf(t, [[0, 0.45], [len, 0.18]]), 0.5);
  return (
    <g>
      <Tense t={t} a={8} tilt={5}>
        <g transform={camT(kf(t, [[0, 1300], [8, 760], [len, 700]]), 560, 1.4)}>
          <Room t={t} id="c8s18" />
          <Shutter open={0.9 + 0.1 * Math.sin(t * 1.1)} t={t} />
          <Blast t={t} k={1} />
          <Hero look={AN} pose={P({ x: a.x, y: a.y, scale: a.scale, yaw: -0.7, look: -0.6, tilt: -14, expr: 'shock', legL: { a: 30 * Math.sin(t * 0.7), b: -20 }, legR: { a: -30 * Math.sin(t * 0.7), b: -20 }, armL: { a: 80, b: 10 }, armR: { a: -30, b: -20 } }, t, 1)} rimId="filmR" shadow={0} />
          <Night id="c8s18" lights={[[WIN(0.4, 0.47).x, WIN(0.4, 0.47).y, 360]]} o={0.82} />
          <Storm t={t} o={0.35} seed={18} slant={1.6} />
        </g>
      </Tense>
      <Whip k={whip} />
      <Flash f={flashAt(t, [22]) * 0.8} />
      <Vignette o={0.6} id="c8s18" />
    </g>
  );
};

// ---------- S19: the duty officer in the doorway shouts, the torch beam straight into the lens ----------
export const S19: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <Tense t={t} a={5} tilt={-4}>
      <g transform={camT(960, kf(t, [[0, 560], [len, 440]]), kf(t, [[0, 1.6], [len, 2.6]]))}>
        <rect x={-400} y={-400} width={2720} height={1900} fill="#0C0E14" />
        <rect x={700} y={140} width={520} height={900} fill="#3A3226" />
        <Hero look={HELPER} pose={P({ x: 960, y: 760, scale: 1.2, yaw: 0, look: 0, expr: 'shock', talk: talkAt(t, 0, len) * 1.4, armL: { a: 120, b: 30 }, armR: { a: 50, b: 60 } }, t, 6)} rimId="filmR" shadow={0} />
      </g>
    </Tense>
    <Beam x={1100} y={560} a={150} len={1600} spread={22} o={0.55} id="c8s19" />
    <Glow x={1100} y={560} r={260} o={0.95} />
    <Vignette o={0.6} id="c8s19" />
  </g>
);

// ---------- S20: An pulls his hand back and lifts the battery lamp: light blooms up over his face ----------
export const S20: React.FC<ShotProps> = ({ t, len }) => {
  const up = kf(t, [[0, 0], [20, 1]]);
  const pose = P({ x: 960, y: 760, scale: 1.2, yaw: 0.3, look: 0.2, headTilt: 6, expr: 'worried', armR: { a: 30 + 60 * up, b: 60 - 30 * up }, armL: { a: 12, b: 16 } }, t, 1);
  const h = hand(pose, 'armR');
  return (
    <g>
      <Tense t={t} a={3}>
        <g transform={camT(960, kf(t, [[0, 600], [len, 480]]), kf(t, [[0, 1.6], [len, 2.4]]))}>
          <DarkRoom floor={760 + LEG_LEN * 1.2} />
          <Hero look={AN} pose={pose} rimId="filmR" shadow={0} />
          <Night id="c8s20" lights={[[h.x, h.y - 20, 300 + 300 * up]]} o={0.85} />
          <Lamp x={h.x} y={h.y - 20} s={0.7} on={kf(t, [[6, 0], [10, 1]])} />
        </g>
      </Tense>
      <Vignette o={0.6} id="c8s20" />
    </g>
  );
};

// ---------- S21: the lamp's beam sweeps the aisle; family after family gets up ----------
export const S21: React.FC<ShotProps> = ({ t, len }) => {
  const sweep = kf(t, [[0, 200], [len, 340]]);
  const people = [[0.46, 0.5, EXTRA[0], 1], [0.56, 0.62, EXTRA[1], 1], [0.66, 0.72, EXTRA[2], 0.72], [0.5, 0.82, SAU, 1], [0.62, 0.86, NAM, 0.72]] as const;
  return (
    <g>
      <Tense t={t} a={4}>
        <g transform={camT(960, 600, 1.1)}>
          <Room t={t} id="c8s21" />
          {people.map(([u, w, lk, k], i) => {
            const s = stand(SH, u, w);
            const r = kf(t, [[10 + i * 14, 0], [24 + i * 14, 1]]);
            return <Hero key={i} look={lk} pose={P({ x: s.x, y: s.y + 80 * s.scale * k * (1 - r), scale: s.scale * k, yaw: 0.3 - 0.6 * (i % 2), look: 0, expr: 'worried', tilt: 20 * (1 - r), armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, i + 2)} rimId="filmR" shadow={0} />;
          })}
          <Night id="c8s21" lights={[[1500, 600, 260]]} o={0.85} />
        </g>
      </Tense>
      <Beam x={1700} y={520} a={sweep} len={1700} spread={14} o={0.45} id="c8s21" />
      <Lamp x={1700} y={520} s={0.6} />
      <Vignette o={0.6} id="c8s21" />
    </g>
  );
};

// ---------- S22: low, close: bà Sáu pushes herself up, and stops: the knee ----------
export const S22: React.FC<ShotProps> = ({ t, len }) => {
  const up = kf(t, [[0, 0], [20, 0.6], [34, 0.55]]);
  return (
    <g>
      <Tense t={t} a={3}>
        <g transform={camT(960, kf(t, [[0, 640], [len, 520]]), kf(t, [[0, 1.6], [len, 2.4]]))}>
          <rect x={-400} y={-400} width={2720} height={1900} fill="#1A1E28" />
          <rect x={-400} y={880} width={2720} height={900} fill="#2A2E36" />
          <Hero look={SAU} pose={P({ x: 960, y: 880 - 200 * up - 40, scale: 1.2, yaw: 0.3, look: 0.1, tilt: 30 - 20 * up, headTilt: 10, expr: up > 0.5 ? 'tired' : 'worried', armL: { a: 30, b: 40 }, armR: { a: -20, b: -50 } }, t, 2)} rimId="filmR" shadow={0} />
          <Night id="c8s22" lights={[[1300, 500, 500]]} o={0.8} />
        </g>
      </Tense>
      <Vignette o={0.6} id="c8s22" />
    </g>
  );
};

// ---------- S23: under the table: the bag's strap snagged on a table leg; Nam's hand yanks and yanks ----------
export const S23: React.FC<ShotProps> = ({ t, len }) => {
  const yank = Math.max(0, Math.sin(t * 0.9));
  return (
    <g>
      <Tense t={t} a={4} tilt={6}>
        <rect x={-200} y={-200} width={2320} height={1500} fill="#14181E" />
        <rect x={-200} y={760} width={2320} height={600} fill="#2E3038" />
        <rect x={500} y={-200} width={70} height={980} fill="#4C3420" />
        <rect x={1400} y={-200} width={70} height={980} fill="#4C3420" />
        <rect x={-200} y={-200} width={2320} height={160} fill="#3A2818" />
        <Duffel x={kf(t, [[0, 900], [len, 940]]) + 30 * yank} y={900} s={1.5} c="#3F8A7C" />
        <path d={`M ${780 + 30 * yank} 720 Q 640 640 560 560`} stroke="#2A2A2A" strokeWidth={14} fill="none" />
        <path d={`M 1120 760 Q ${1500 + 60 * yank} ${700 - 40 * yank} ${1780 + 80 * yank} ${640 - 60 * yank}`} stroke="#2A2A2A" strokeWidth={14} fill="none" />
        <OpenHand x={1880 + 80 * yank} y={540 - 60 * yank} rot={60} s={1.2} skin={NAM.skin} />
        <Night id="c8s23" lights={[[1100, 300, 600]]} o={0.75} />
      </Tense>
      <Vignette o={0.6} id="c8s23" />
    </g>
  );
};

// ---------- S24: Hạnh calls to Nam, side-lit by the lamp ----------
export const S24: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <Tense t={t} a={3}>
      <g transform={push(t, len, 960)}>
        <DarkRoom floor={700 + LEG_LEN * 1.2} />
        <Hero look={HANH} pose={P({ x: 960, y: 700, scale: 1.2, yaw: -0.5, look: -0.6, headTilt: -6, expr: 'worried', talk: talkAt(t, 2, len - 2) * 1.3, armL: { a: 60, b: 40 }, armR: { a: 12, b: 16 } }, t, 3)} rimId="filmR" shadow={0} />
        <Night id="c8s24" lights={[[700, 400, 500]]} o={0.8} />
      </g>
    </Tense>
    <Vignette o={0.6} id="c8s24" />
  </g>
);

// ---------- S25: hand-held, following: An and a duty man walk bà Sáu down the corridor; rain spraying in between the columns ----------
export const S25: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[0, 0], [len, 1]]);
  const step = (x: number, s: number, ph: number) => ({ x: x - 300 * k, y: onFloor(1000, s), scale: s, yaw: -0.6, look: -0.5, legL: { a: 14 * Math.sin(t * 0.4 + ph), b: -10 }, legR: { a: -14 * Math.sin(t * 0.4 + ph), b: -10 } });
  return (
    <g>
      <Tense t={t} a={6} tilt={-3}>
        <g transform={camT(kf(t, [[0, 1000], [len, 760]]), 620, 1.3)}>
          <Corridor t={t} id="c8s25" />
          <Hero look={AN} pose={P({ ...step(820, 1.0, 0), expr: 'worried', armL: { a: -50, b: -30 }, armR: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
          <Hero look={SAU} pose={P({ ...step(1000, 0.95, 1), expr: 'tired', tilt: 10, armL: { a: 30, b: 20 }, armR: { a: -30, b: -20 } }, t, 2)} rimId="filmR" shadow={0} />
          <Hero look={HELPER} pose={P({ ...step(1180, 1.0, 2), expr: 'worried', armL: { a: -50, b: -30 }, armR: { a: 12, b: 16 } }, t, 6)} rimId="filmR" shadow={0} />
          <Night id="c8s25" lights={[[800, 500, 420]]} o={0.8} />
          <Storm t={t} o={0.45} seed={25} slant={1.2} />
        </g>
      </Tense>
      <Lamp x={kf(t, [[0, 820], [len, 700]])} y={480} s={0.5} />
      <Vignette o={0.6} id="c8s25" />
    </g>
  );
};

// ---------- S26: floor level: the dog's claws skitter towards us, then past ----------
export const S26: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <Tense t={t} a={4}>
      <rect x={-200} y={-200} width={2320} height={1500} fill="#14181E" />
      <rect x={-200} y={760} width={2320} height={600} fill="#3A3A34" />
      {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M ${-200 + i * 330} 1300 L ${700 + i * 80} 760`} stroke="#4A4A44" strokeWidth={4} />)}
      <Dog x={kf(t, [[0, 1700], [len, 300]])} y={900 + 20 * Math.abs(Math.sin(t * 0.8))} s={kf(t, [[0, 1.2], [len, 2.4]])} look={0} head={0.2} t={t * 3} />
      <Night id="c8s26" lights={[[1200, 300, 700]]} o={0.7} />
    </Tense>
    <Vignette o={0.6} id="c8s26" />
  </g>
);

// ---------- S27: under a chair: the dog's bowl left behind, rolling in a slow circle ----------
export const S27: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#14181E" />
    <rect x={-200} y={720} width={2320} height={600} fill="#2E3038" />
    <rect x={300} y={-200} width={60} height={920} fill="#4C3420" />
    <rect x={1500} y={-200} width={60} height={920} fill="#4C3420" />
    <rect x={-200} y={-200} width={2320} height={200} fill="#3A2818" />
    <Bowl x={900 + 120 * Math.cos(t * 0.15)} y={860 + 20 * Math.sin(t * 0.15)} s={2.2} rot={20 * Math.sin(t * 0.3)} />
    <Night id="c8s27" lights={[[960, 400, 600]]} o={0.7} />
    <Vignette o={0.6} id="c8s27" />
  </g>
);

// ---------- S28: Linh pulls to run back; Hạnh holds her ----------
export const S28: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <Tense t={t} a={5} tilt={4}>
      <g transform={camT(960, 560, kf(t, [[0, 1.6], [len, 1.9]]))}>
        <Corridor t={t} id="c8s28" />
        <Hero look={HANH} pose={P({ x: 820, y: onFloor(980, 1.0), scale: 1.0, yaw: 0.5, look: 0.5, expr: 'worried', armR: { a: 70, b: 20 }, armL: { a: 12, b: 16 } }, t, 3)} rimId="filmR" shadow={0} />
        <Hero look={LINH} pose={P({ x: 1060 + 20 * Math.sin(t * 0.4), y: onFloor(980, 0.75), scale: 0.75, yaw: 0.6, look: 0.6, tilt: -12, expr: 'worried', talk: talkAt(t, 4, len) , armL: { a: -50, b: -20 }, armR: { a: 40, b: 30 } }, t, 4)} rimId="filmR" shadow={0} />
        <Night id="c8s28" lights={[[900, 500, 420]]} o={0.8} />
      </g>
    </Tense>
    <Vignette o={0.6} id="c8s28" />
  </g>
);

// ---------- S29: close: Hạnh lifts the bag on her chest: the photos are here ----------
export const S29: React.FC<ShotProps> = ({ t, len }) => {
  const lift = kf(t, [[0, 0], [16, 1]]);
  return (
    <g>
      <g transform={camT(960, kf(t, [[0, 640], [len, 560]]), kf(t, [[0, 1.4], [len, 1.9]]))}>
        <DarkRoom floor={760 + LEG_LEN * 1.4} />
        <Hero look={HANH} pose={P({ x: 960, y: 760, scale: 1.4, yaw: 0.1, look: -0.2, headTilt: 10, expr: 'neutral', talk: talkAt(t, 10, len - 2), armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } }, t, 3)} rimId="filmR" shadow={0} />
        <rect x={860} y={700 - 60 * lift} width={200} height={150} rx={24} fill="#3F7E8A" stroke={L} strokeWidth={5} />
        <Night id="c8s29" lights={[[960, 600, 560]]} o={0.72} />
      </g>
      <Vignette o={0.5} id="c8s29" />
    </g>
  );
};

// ---------- S30: through the inner room's glass, water running down it: An's lamp stops at the door; he counts ----------
export const S30: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.12]]))}>
      <Corridor t={t} id="c8s30">
        <Hero look={AN} pose={P({ x: 960, y: onFloor(980, 1.0), scale: 1.0, yaw: 0, look: 0, expr: 'neutral', armR: { a: 60, b: 50 }, armL: { a: 30, b: 60 } }, t, 1)} rimId="filmR" shadow={0} />
      </Corridor>
      <Night id="c8s30" lights={[[1000, 640, 360]]} o={0.86} />
      <Lamp x={1000} y={640} s={0.5} />
    </g>
    <Foreground blur={3}>
      <rect x={-100} y={-100} width={2120} height={1280} fill="none" stroke="#2A2018" strokeWidth={180} />
      <path d="M 960 -100 L 960 1200" stroke="#2A2018" strokeWidth={60} />
      {Array.from({ length: 18 }).map((_, i) => <path key={i} d={`M ${100 + i * 100 + 20 * rnd(1, i)} ${((t * (3 + rnd(2, i) * 3) + rnd(3, i) * 900) % 1100) - 100} q 6 40 0 80`} stroke="#AABAC8" strokeWidth={6} fill="none" opacity={0.6} />)}
    </Foreground>
    <Vignette o={0.5} id="c8s30" />
  </g>
);

// ---------- S31: An, lit from below by the lamp, calls Linh's name ----------
export const S31: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={push(t, len, 960, 2.6)}>
      <DarkRoom floor={700 + LEG_LEN * 1.1} />
      <Hero look={AN} pose={P({ x: 960, y: 700, scale: 1.1, yaw: -0.2, look: -0.3, headTilt: 6, expr: 'neutral', talk: talkAt(t, 30, len), armR: { a: 30, b: 70 }, armL: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
      <Night id="c8s31" lights={[[960, 720, 380]]} o={0.85} />
      <Lamp x={1000} y={760} s={0.5} />
    </g>
    <Vignette o={0.5} id="c8s31" />
  </g>
);

// ---------- S32: low: Linh's hand goes up, high, into the lamp's light ----------
export const S32: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(960, kf(t, [[0, 560], [len, 400]]), kf(t, [[0, 1.4], [len, 1.8]]))}>
      <DarkRoom floor={760 + LEG_LEN * 1.3} />
      <Hero look={LINH} pose={P({ x: 960, y: 760, scale: 1.3, yaw: 0.2, look: 0.3, headTilt: -10, expr: 'neutral', armR: { a: 20 + 150 * kf(t, [[0, 0], [16, 1]]), b: 10 }, armL: { a: 12, b: 16 } }, t, 4)} rimId="filmR" shadow={0} />
      <Night id="c8s32" lights={[[1060, 300, 500]]} o={0.82} />
    </g>
    <Vignette o={0.5} id="c8s32" />
  </g>
);

// ---------- S33: the yard, seen from the window: the sign crashes down onto the cordoned concrete ----------
export const S33: React.FC<ShotProps> = ({ t, len }) => {
  const fall = kf(t, [[6, 0], [16, 1]]);
  return (
    <g>
      <Tense t={t} a={fall >= 1 ? 14 * (1 - kf(t, [[16, 0], [34, 1]])) + 3 : 3}>
        <g transform={camT(960, 560, 1.1)}>
          <School t={t} />
          <rect x={-400} y={700} width={2720} height={900} fill="#5A5A54" />
          {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M ${500 + i * 120} 900 l 60 0`} stroke={i % 2 ? '#F4F0E4' : '#C8322A'} strokeWidth={10} />)}
          <g transform={`translate(${960} ${380 + 480 * fall * fall}) rotate(${70 * fall})`}>
            <rect x={-220} y={-60} width={440} height={120} fill="#2E5E9A" stroke={L} strokeWidth={6} />
            <text x={0} y={16} fontFamily={FONT} fontSize={44} textAnchor="middle" fill="#fff">TRƯỜNG TIỂU HỌC</text>
          </g>
          {fall >= 1 ? Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M ${960 + (i - 6) * 40} 880 l ${(i - 6) * 20} ${-40 - 30 * rnd(2, i)}`} stroke="#DDE6EC" strokeWidth={5} opacity={1 - kf(t, [[16, 0], [30, 1]])} />) : null}
          <Night id="c8s33" lights={[[960, 700, 500]]} o={0.8} />
          <Storm t={t} o={0.55} seed={33} />
        </g>
      </Tense>
      <Flash f={flashAt(t, [14])} />
      <NearEdge side={-1} w={260} c="#2A2018" />
      <NearEdge side={1} w={260} c="#2A2018" />
      <Vignette o={0.6} id="c8s33" />
    </g>
  );
};

// ---------- S34: Linh flinches; An sits down between her and the window ----------
export const S34: React.FC<ShotProps> = ({ t, len }) => {
  const sitd = kf(t, [[6, 0], [30, 1]]);
  return (
    <g>
      <Tense t={t} a={3}>
        <g transform={camT(960, 600, 1.6)}>
          <rect x={-400} y={-400} width={2720} height={1900} fill="#1A1E28" />
          <rect x={-400} y={940} width={2720} height={600} fill="#2A2E36" />
          <Hero look={LINH} pose={P({ x: 1100, y: 940 - 100, scale: 0.8, yaw: -0.4, look: -0.4, tilt: 8, headTilt: -14, expr: 'worried', armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } }, t, 4)} rimId="filmR" shadow={0} />
          <Hero look={AN} pose={P({ x: kf(t, [[0, 700], [30, 860]]), y: 940 - 120 - 20 * sitd, scale: 1.1, yaw: 0.5, look: 0.5, tilt: 6, expr: 'neutral', armR: { a: 50, b: 40 }, armL: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
          <Night id="c8s34" lights={[[1000, 600, 500]]} o={0.75} />
        </g>
      </Tense>
      <Vignette o={0.55} id="c8s34" />
    </g>
  );
};

// ---------- S35, S36, S37: the three closes in the inner room, father and daughter ----------
const innerClose = (look: typeof AN, yaw: number, expr: 'neutral' | 'worried' | 'happy', seed: number) => {
  const C: React.FC<ShotProps> = ({ t, len }) => (
    <g>
      <g transform={push(t, len, 960, 2.8)}>
        <DarkRoom floor={700 + LEG_LEN * (look === LINH ? 1.2 : 1.1)} />
        <Hero look={look} pose={P({ x: 960, y: 700, scale: look === LINH ? 1.2 : 1.1, yaw, look: yaw, headTilt: 6, expr, talk: talkAt(t, 2, len - 2), armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, seed)} rimId="filmR" shadow={0} />
        <Night id={`c8in${seed}`} lights={[[1200, 600, 520]]} o={0.7} />
      </g>
      <Vignette o={0.5} id={`c8in${seed}`} />
    </g>
  );
  return C;
};
export const S35 = innerClose(AN, -0.3, 'neutral', 1);
export const S36 = innerClose(LINH, 0.3, 'worried', 4);
export const S37 = innerClose(AN, -0.35, 'happy', 11);

// ---------- S38: grey dawn: the broken window, the soaked corner of the mat, rain still falling; slow, quiet ----------
export const S38: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 700]]), 600, kf(t, [[0, 1.1], [len, 1.3]]))}>
    <Room t={t} id="c8s38" />
    <Shutter open={0.95} t={0} />
    <polygon points={SH.Q([[0.02, 1, 0.34], [0.2, 1, 0.34], [0.2, 1, 0.62], [0.02, 1, 0.62]])} fill="#5E6E70" opacity={0.5} />
    <rect x={-400} y={-400} width={2720} height={1900} fill="#6E7E90" opacity={0.18} />
  </g>
);

// ---------- S39: macro: clothes that did not get moved, lying in the splashed water ----------
export const S39: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.1]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#8A8270" />
    <rect x={-200} y={300} width={2320} height={1000} fill="#5E6E70" opacity={0.7} />
    <path d="M 500 500 Q 700 420 900 520 L 1100 480 Q 1300 560 1200 760 L 700 820 Q 480 720 500 500 Z" fill="#B5604F" stroke={L} strokeWidth={5} />
    <path d="M 1150 650 Q 1400 600 1600 700 L 1500 860 Q 1300 880 1180 800 Z" fill="#3F7E8A" stroke={L} strokeWidth={5} />
    {Array.from({ length: 6 }).map((_, i) => {
      const ph = (t * 0.05 + i / 6) % 1;
      return <ellipse key={i} cx={400 + i * 240} cy={420 + (i % 3) * 120} rx={10 + 80 * ph} ry={4 + 20 * ph} fill="none" stroke="#DDE8EC" strokeWidth={3} opacity={1 - ph} />;
    })}
  </g>
);

// ---------- S40: Hạnh wrings out a towel, looks at the lightened bag, and sits down without a word ----------
export const S40: React.FC<ShotProps> = ({ t, len }) => {
  const down = kf(t, [[len - 50, 0], [len - 20, 1]]);
  const pose = P({ x: 960, y: 700 + 60 * down, scale: 1.1, yaw: 0.3, look: 0.1, headTilt: 12, tilt: 8, expr: 'tired', armL: { a: 40 + 6 * Math.sin(t * 0.5), b: 80 }, armR: { a: -40 - 6 * Math.sin(t * 0.5), b: -80 } }, t, 3);
  const h1 = hand(pose, 'armL');
  const h2 = hand(pose, 'armR');
  return (
    <g transform={camT(960, kf(t, [[0, 600], [len, 520]]), kf(t, [[0, 1.4], [len, 2.0]]))}>
      <Room t={t} id="c8s40" />
      <Hero look={HANH} pose={pose} rimId="filmR" shadow={0} />
      <path d={`M ${h1.x} ${h1.y} Q ${(h1.x + h2.x) / 2} ${(h1.y + h2.y) / 2 + 30} ${h2.x} ${h2.y}`} stroke="#E8E0CC" strokeWidth={24} fill="none" strokeLinecap="round" />
      {[0, 1, 2].map((i) => <circle key={i} cx={(h1.x + h2.x) / 2 + (i - 1) * 14} cy={(h1.y + h2.y) / 2 + 40 + ((t * 6 + i * 20) % 120)} r={5} fill="#AAC4D4" />)}
    </g>
  );
};

// ---------- S41: bà Sáu shuffles over and holds out a dry blanket, folded double ----------
export const S41: React.FC<ShotProps> = ({ t, len }) => {
  const give = kf(t, [[6, 0], [30, 1]]);
  const s = onMat(0.3, 0.6);
  const h = onMat(0.18, 0.6);
  const sPose = P({ ...s, yaw: -0.5, look: -0.5, expr: 'happy', talk: talkAt(t, 40, len - 4), ...sit(-1), armL: { a: 14, b: 32 }, armR: { a: -30 - 30 * give, b: -60 } }, t, 2);
  const hs = hand(sPose, 'armR');
  return (
    <g transform={camT(kf(t, [[0, 820], [len, 760]]), 600, kf(t, [[0, 1.5], [len, 1.8]]))}>
      <Room t={t} id="c8s41" />
      <ChairFor at={s} back={1} />
      <ChairFor at={h} />
      <Hero look={HANH} pose={P({ ...h, yaw: 0.4, look: 0.4, headTilt: 10, expr: 'tired', ...sit(1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 3)} rimId="filmR" shadow={0} />
      <Hero look={SAU} pose={sPose} rimId="filmR" shadow={0} />
      <rect x={hs.x - 70} y={hs.y - 20} width={140} height={60} rx={10} fill="#4F7486" stroke={L} strokeWidth={4} />
    </g>
  );
};

// ---------- S42: close: Hạnh takes the blanket; she has to turn her face away a moment; hold ----------
export const S42: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={push(t, len, 960, 2.7)}>
      <Room t={t} id="c8s42" />
      <Hero look={HANH} pose={P({ x: 960, y: 700, scale: 1.2, yaw: kf(t, [[0, 0.3], [40, -0.7]]), look: kf(t, [[0, 0.3], [40, -0.8]]), headTilt: kf(t, [[0, 6], [40, 16]]), expr: 'tired', talk: talkAt(t, 4, 24), armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } }, t, 3)} rimId="filmR" shadow={0} />
    </g>
    <Vignette o={0.45} id="c8s42" />
  </g>
);

// ---------- S43: after that night: bags already at the aisle, ready ----------
export const S43: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 700], [len, 1000]]), 640, 1.4)}>
    <Room t={t} id="c8s43" />
    {[0.3, 0.42, 0.54, 0.66].map((u, i) => {
      const p = SH.P(u, 1, 0.92);
      const k = SH.s(0.92) / SH.s(0) * 0.42;
      return i % 2 ? <Duffel key={i} x={p.x} y={p.y} s={k} c={['#6E5B7E', '#3F7E8A'][i % 2]} /> : <Bundle key={i} x={p.x} y={p.y} s={k} c="#4F7486" />;
    })}
  </g>
);

// ---------- S44: close: the roll-call book beside the lamp ----------
export const S44: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.12]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#7A5636" />
    <rect x={500} y={300} width={760} height={520} rx={10} fill="#F4EEDC" stroke={L} strokeWidth={6} />
    <text x={880} y={380} fontFamily={FONT} fontSize={42} textAnchor="middle" fill="#2E5E9A">ĐIỂM DANH</text>
    {['An', 'Hạnh', 'Linh', 'Bà Sáu', 'Nam'].map((n, i) => (
      <g key={i}>
        <text x={560} y={450 + i * 70} fontFamily={FONT} fontSize={36} fill="#2A2A3A">{n}</text>
        <path d={`M 1080 ${440 + i * 70} l 20 20 l 40 -40`} stroke="#3E8E5E" strokeWidth={8} fill="none" />
      </g>
    ))}
    <Lamp x={1450} y={520} s={1.2} on={0.6} />
  </g>
);

// ---------- S45: the corridor: An and the duty team check the route to the reserve shelter ----------
export const S45: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(800, 620, 1.4)}>
    <Corridor t={t} id="c8s45">
      <Hero look={AN} pose={P({ x: 620, y: onFloor(980, 1.0), scale: 1.0, yaw: 0.5, look: 0.4, headTilt: 10, expr: 'neutral', talk: talkAt(t, 10, 60) * 0.6, armL: { a: 40, b: 70 }, armR: { a: 40, b: 70 } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={HELPER} pose={P({ x: 900, y: onFloor(980, 1.0), scale: 1.0, yaw: -0.5, look: -0.4, headTilt: 10, expr: 'neutral', armL: { a: 12, b: 16 }, armR: { a: 40, b: 70 } }, t, 6)} rimId="filmR" shadow={0} />
      <rect x={700} y={640} width={140} height={100} fill="#F4F4EE" stroke={L} strokeWidth={3} />
      <path d="M 712 720 Q 760 670 828 660" stroke="#2E5E9A" strokeWidth={5} fill="none" strokeDasharray="10 6" />
    </Corridor>
  </g>
);

// ---------- S46: the news on the radio: the rain may end soon; faces turn ----------
export const S46: React.FC<ShotProps> = ({ t, len }) => {
  const people = [[0.3, 0.6, HANH, 1, 3], [0.42, 0.66, SAU, 1, 2], [0.54, 0.7, NAM, 0.72, 5], [0.24, 0.74, LINH, 0.72, 4], [0.66, 0.62, EXTRA[0], 1, 8]] as const;
  return (
    <g transform={camT(860, 600, 1.2)}>
      <Room t={t} id="c8s46" />
      {people.map(([u, w, lk, k, seed], i) => {
        const p = onMat(u, w, k);
        return (
          <g key={i}>
            <ChairFor at={p} child={k < 1} />
            <Hero look={lk} pose={P({ ...p, yaw: -0.3, look: -0.4, expr: 'happy', ...sit(-1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, seed)} rimId="filmR" shadow={0} />
          </g>
        );
      })}
    </g>
  );
};

// ---------- S47: the river board: still updated every day ----------
export const S47: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(1050, 520, kf(t, [[0, 1.1], [len, 1.3]]))}>
    <RiverBoard level={0.72} t={t} marks={6} />
    <OpenHand x={kf(t, [[0, 1500], [20, 1260]])} y={380} rot={60} s={1.0} skin={AN.skin} />
  </g>
);

// ---------- S48: An's hands: medicine pouch, lamp, water; the route sheet folded into his shirt pocket ----------
export const S48: React.FC<ShotProps> = ({ t, len }) => {
  const fold = kf(t, [[len - 60, 0], [len - 20, 1]]);
  return (
    <g transform={camT(960, 560, 1.0)}>
      <rect x={-200} y={-200} width={2320} height={1500} fill="#4F7486" />
      <rect x={300} y={500} width={260} height={180} rx={20} fill="#E8E0CC" stroke={L} strokeWidth={6} />
      <path d="M 430 540 L 430 640 M 380 590 L 480 590" stroke="#C8322A" strokeWidth={20} />
      <Lamp x={800} y={620} s={1.2} on={0} />
      {[1150, 1270].map((x, i) => <Jerry key={i} x={x} y={760} s={0.9} />)}
      <rect x={1400 - 200 * fold} y={300 + 100 * fold} width={300 - 200 * fold} height={360 - 220 * fold} fill="#F4F4EE" stroke={L} strokeWidth={4} />
      <OpenHand x={kf(t, [[0, 400], [len * 0.4, 1000], [len, 1500]])} y={-60} rot={0} s={1.3} skin={AN.skin} />
      <rect x={kf(t, [[0, 400], [len * 0.4, 1000], [len, 1500]]) - 110} y={-500} width={200} height={460} fill={AN.jacket} stroke={L} strokeWidth={6} />
    </g>
  );
};

// ---------- S49: Linh looks at the photo of the house ----------
export const S49: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.12]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#3F7E8A" />
    <Photo x={960} y={540} s={2.4} r={-3} />
    <OpenHand x={500} y={980} rot={170} s={1.0} skin={LINH.skin} />
    <OpenHand x={1420} y={980} rot={190} s={1.0} skin={LINH.skin} />
  </g>
);

// ---------- S50–S54: on the mat, the talk about going home ----------
const matClose = (look: typeof AN, yaw: number, expr: 'neutral' | 'worried' | 'happy', seed: number) => {
  const C: React.FC<ShotProps> = ({ t, len }) => (
    <g transform={push(t, len, 960, 2.7)}>
      <Room t={t} id={`c8m${seed}`} />
      <Hero look={look} pose={P({ x: 960, y: 700, scale: look === LINH ? 1.2 : 1.1, yaw, look: yaw, headTilt: 6, expr, talk: talkAt(t, 2, len - 2), armL: { a: 10, b: 14 }, armR: { a: 10, b: 14 } }, t, seed)} rimId="filmR" shadow={0} />
    </g>
  );
  return C;
};
export const S50 = matClose(LINH, 0.35, 'happy', 4);
export const S51 = matClose(AN, -0.35, 'neutral', 1);
export const S52 = matClose(LINH, 0.3, 'worried', 14);

// ---------- S53: Hạnh sits down to fold clothes with her ----------
export const S53: React.FC<ShotProps> = ({ t, len }) => {
  const h = onMat(0.2, 0.62);
  const l = onMat(0.32, 0.66, 0.72);
  return (
    <g transform={camT(kf(t, [[0, 760], [len, 720]]), kf(t, [[0, 620], [len, 540]]), kf(t, [[0, 1.5], [len, 2.0]]))}>
      <Room t={t} id="c8s53" />
      <ChairFor at={h} />
      <ChairFor at={l} child />
      <Hero look={HANH} pose={P({ ...h, yaw: 0.5, look: 0.5, headTilt: 8, expr: 'happy', talk: talkAt(t, 2, len - 2), ...sit(1), armL: { a: 30, b: 70 }, armR: { a: -30, b: -70 } }, t, 3)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P({ ...l, yaw: -0.5, look: -0.5, expr: 'neutral', ...sit(-1), armL: { a: 30, b: 70 }, armR: { a: -30, b: -70 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S54: close: Linh holds up the shirt washed and kept so long ----------
export const S54: React.FC<ShotProps> = ({ t, len }) => {
  const pose = P({ x: 960, y: 700, scale: 1.2, yaw: 0.2, look: 0.1, headTilt: 12, expr: 'worried', talk: talkAt(t, 6, len - 2), armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } }, t, 4);
  const h1 = hand(pose, 'armL');
  const h2 = hand(pose, 'armR');
  return (
    <g transform={push(t, len, 960, 2.4)}>
      <Room t={t} id="c8s54" />
      <Hero look={LINH} pose={pose} rimId="filmR" shadow={0} />
      <path d={`M ${h1.x - 60} ${h1.y - 10} L ${h2.x + 60} ${h2.y - 10} L ${h2.x + 40} ${h2.y + 120} L ${h1.x - 40} ${h1.y + 120} Z`} fill="#E8C0D0" stroke={L} strokeWidth={4} />
      <path d={`M ${(h1.x + h2.x) / 2 - 30} ${h1.y} q 30 30 60 0`} stroke="#B8708A" strokeWidth={5} fill="none" />
    </g>
  );
};

// ---------- S55: top-down: the bag open; An's hand makes room; Linh lays the best shirt on top ----------
export const S55: React.FC<ShotProps> = ({ t, len }) => {
  const lay = kf(t, [[len * 0.4, 0], [len * 0.8, 1]]);
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.1]]))}>
      <rect x={-200} y={-200} width={2320} height={1500} fill="#B89A58" />
      <rect x={520} y={260} width={880} height={600} rx={60} fill="#3F7E8A" stroke={L} strokeWidth={8} />
      <rect x={580} y={320} width={760} height={480} rx={40} fill="#2E5E66" />
      <rect x={620} y={360} width={680} height={180} rx={14} fill="#C8B488" />
      <rect x={640} y={560} width={300} height={200} rx={14} fill="#8E7AA0" />
      <path d={`M 700 ${600 - 500 * (1 - lay)} L 1220 ${600 - 500 * (1 - lay)} L 1200 ${780 - 500 * (1 - lay)} L 720 ${780 - 500 * (1 - lay)} Z`} fill="#E8C0D0" stroke={L} strokeWidth={5} />
      <OpenHand x={1500} y={320} rot={60} s={1.0} skin={AN.skin} />
    </g>
  );
};

// ---------- S56: An sees it, leaves it on top, and lays the raincoat beside the bag; hold ----------
export const S56: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 960], [len, 1100]]), 540, kf(t, [[0, 1.1], [len, 1.25]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#B89A58" />
    <rect x={320} y={260} width={880} height={600} rx={60} fill="#3F7E8A" stroke={L} strokeWidth={8} />
    <path d="M 500 520 L 1020 520 L 1000 700 L 520 700 Z" fill="#E8C0D0" stroke={L} strokeWidth={5} />
    <g transform={`translate(${kf(t, [[0, 2000], [30, 1480]])} 560)`}>
      <path d="M -180 -260 L 180 -260 L 240 280 L -240 280 Z" fill="#E8C030" stroke={L} strokeWidth={6} />
      <path d="M -60 -260 Q 0 -200 60 -260" stroke={L} strokeWidth={5} fill="none" />
    </g>
  </g>
);

// ---------- S57: a morning: Linh wakes because something is different; grey-white light ----------
export const S57: React.FC<ShotProps> = ({ t, len }) => {
  const rise = kf(t, [[0, 0], [30, 1]]);
  const l = upAt(0.14, 0.62, 0.72, rise);
  return (
    <g transform={camT(l.x + 100, kf(t, [[0, 640], [len, 540]]), kf(t, [[0, 1.6], [len, 2.2]]))}>
      <Room t={t} id="c8s57" />
      <AboveFloor y={SH.P(0.14, 1, 0.62).y - 6} id={'l' + String(len)}><Hero look={LINH} pose={P({ ...l, yaw: 0.1, look: kf(t, [[30, 0], [60, -0.5]]), headTilt: -10, expr: 'neutral', armL: { a: 30, b: 40 }, armR: { a: 20, b: 30 } }, t, 4)} rimId="filmR" shadow={0} /></AboveFloor>
      <Blanket u={0.14} w={0.62} s={0.9} />
      <rect x={-400} y={-400} width={2720} height={1900} fill="#F4F8FF" opacity={0.12} />
    </g>
  );
};

// ---------- S58: wide: Hạnh still asleep; at the classroom door, An with a cup of water ----------
export const S58: React.FC<ShotProps> = ({ t, len }) => {
  const a = stand(SH, 0.7, 0.2);
  return (
    <g transform={camT(kf(t, [[0, 760], [len, 900]]), 600, 1.15)}>
      <Room t={t} id="c8s58" />
      <Blanket u={0.26} w={0.6} c="#4F7486" />
      <Hero look={AN} pose={P({ x: a.x, y: a.y, scale: a.scale, yaw: -0.4, look: -0.4, expr: 'neutral', armR: { a: 40, b: 80 }, armL: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
      <rect x={-400} y={-400} width={2720} height={1900} fill="#F4F8FF" opacity={0.12} />
    </g>
  );
};

// ---------- S59: the window: no more rain beating on it; the last drops slide down and stop ----------
export const S59: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.08]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill="#2A2018" />
    <rect x={400} y={160} width={1120} height={760} fill="#B8C8D4" />
    <path d="M 400 700 Q 700 640 960 680 T 1520 660 L 1520 920 L 400 920 Z" fill="#8A9AA4" />
    {Array.from({ length: 10 }).map((_, i) => {
      const y = Math.min(840, 220 + (t * (1.4 + rnd(2, i))) * (1 - kf(t, [[0, 0], [len, 0.9]])) + rnd(3, i) * 300);
      return <ellipse key={i} cx={460 + i * 105} cy={y} rx={8} ry={12} fill="#E8F0F4" opacity={0.8} />;
    })}
    <rect x={400} y={160} width={1120} height={760} fill="none" stroke="#3E2A18" strokeWidth={40} />
    <path d="M 960 160 L 960 920" stroke="#3E2A18" strokeWidth={26} />
    <Glow x={960} y={400} r={700} kind="cool" o={0.4} />
  </g>
);

// ---------- S60: bà Sáu sits up across the aisle and asks, softly, if it has really stopped ----------
export const S60: React.FC<ShotProps> = ({ t, len }) => {
  const s = upAt(0.5, 0.62, 1, kf(t, [[0, 0], [24, 1]]));
  return (
    <g transform={camT(s.x, kf(t, [[0, 600], [len, s.y - 140 * s.scale]]), kf(t, [[0, 1.5], [len, 2.4]]))}>
      <Room t={t} id="c8s60" />
      <AboveFloor y={SH.P(0.5, 1, 0.62).y - 6} id="c8s60"><Hero look={SAU} pose={P({ ...s, yaw: -0.3, look: -0.3, headTilt: 10, expr: 'neutral', talk: talkAt(t, 20, len), armL: { a: 20, b: 30 }, armR: { a: 20, b: 30 } }, t, 2)} rimId="filmR" shadow={0} /></AboveFloor>
      <Blanket u={0.5} w={0.62} c="#8E7AA0" />
      <rect x={-400} y={-400} width={2720} height={1900} fill="#F4F8FF" opacity={0.1} />
    </g>
  );
};

// ---------- S61: Nam runs out to look at the yard, stops under the eave when she calls ----------
export const S61: React.FC<ShotProps> = ({ t, len }) => {
  const run = kf(t, [[0, 0], [30, 1]]);
  return (
    <g transform={camT(760, 600, 1.05)}>
      <Eave t={t} nest={0.7} />
      <Hero look={NAM} pose={P({ x: 300 + 460 * run, y: onFloor(1060, 1.0), scale: 1.0, yaw: 0.6, look: 0.5, tilt: -8 * (1 - run), expr: 'happy', legL: { a: 26 * Math.sin(t * 0.7) * (1 - run), b: -20 }, legR: { a: -26 * Math.sin(t * 0.7) * (1 - run), b: -20 }, armL: { a: 30 * (1 - run), b: 20 }, armR: { a: -30 * (1 - run), b: -20 } }, t, 5)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S62: close: footsteps on the corridor floor, loud now in the quiet ----------
export const S62: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 760, kf(t, [[0, 1.2], [len, 1.3]]))}>
    <Corridor t={t} id="c8s62">
      {[0, 1].map((i) => (
        <Hero key={i} look={[HELPER, EXTRA[2]][i]} pose={P({ x: kf(t, [[0, 400 + i * 300], [len, 1100 + i * 300]]), y: onFloor(1000, 1.1), scale: 1.1, yaw: 0.6, look: 0.5, expr: 'neutral', legL: { a: 20 * Math.sin(t * 0.45 + i * 2), b: -14 }, legR: { a: -20 * Math.sin(t * 0.45 + i * 2), b: -14 }, armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, 6 + i)} rimId="filmR" shadow={0} />
      ))}
    </Corridor>
  </g>
);

// ---------- S63: close: Linh with the folded shirt: "it's stopped! no more rain!" ----------
export const S63: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={push(t, len, 960, 2.7)}>
    <Corridor t={t} id="c8s63" />
    <Hero look={LINH} pose={P({ x: 960, y: 700, scale: 1.2, yaw: -0.3, look: -0.4, headTilt: -8, expr: 'happy', talk: talkAt(t, 2, len - 2) * 1.2, armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S64: An nods: he hears it ----------
export const S64: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={push(t, len, 960, 2.6)}>
    <Corridor t={t} id="c8s64" />
    <Hero look={AN} pose={P({ x: 960, y: 700, scale: 1.1, yaw: 0.3, look: 0.4, headTilt: 6 + 8 * Math.max(0, Math.sin(t * 0.3)) * kf(t, [[0, 1], [30, 0]]), expr: 'happy', talk: talkAt(t, 10, len - 2), armL: { a: 10, b: 16 }, armR: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S65: she tugs his hand towards the porch; they start out together ----------
export const S65: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[0, 0], [len, 1]]);
  const walk = (x: number, s: number, ph: number) => ({ x: x + 200 * k, y: onFloor(990, s), scale: s, yaw: 0.6, look: 0.5, legL: { a: 18 * Math.sin(t * 0.45 + ph), b: -14 }, legR: { a: -18 * Math.sin(t * 0.45 + ph), b: -14 } });
  return (
    <g transform={camT(kf(t, [[0, 820], [len, 1000]]), 620, 1.4)}>
      <Corridor t={t} id="c8s65" />
      <Hero look={AN} pose={P({ ...walk(700, 1.0, 0), expr: 'happy', armR: { a: 40, b: 10 }, armL: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={LINH} pose={P({ ...walk(900, 0.75, 2), expr: 'happy', armL: { a: -60, b: -10 }, armR: { a: 12, b: 16 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S66: close: the radio on his belt crackles; he stops to listen, his hand still in hers ----------
export const S66: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.2]]))}>
    <rect x={-200} y={-200} width={2320} height={1500} fill={AN.jacket} />
    <rect x={-200} y={760} width={2320} height={600} fill={AN.limb} />
    <rect x={-200} y={740} width={2320} height={40} fill="#3A2A1A" />
    <rect x={1140} y={420} width={150} height={300} rx={20} fill="#22202A" stroke={L} strokeWidth={6} />
    <rect x={1250} y={300} width={22} height={140} rx={8} fill="#22202A" />
    <circle cx={1215} cy={480} r={18} fill={Math.sin(t * 0.9) > 0 ? '#3EE07E' : '#1E6E3E'} />
    {[0, 1, 2].map((i) => {
      const ph = (t * 0.05 + i / 3) % 1;
      return <path key={i} d={`M ${1310 + ph * 100} ${520 - ph * 30} q 30 60 0 120`} stroke="#F4E8C0" strokeWidth={6} fill="none" opacity={1 - ph} />;
    })}
    <OpenHand x={700} y={1300} rot={190} s={1.4} skin={LINH.skin} />
    <OpenHand x={600} y={500} rot={10} s={1.6} skin={AN.skin} />
  </g>
);

export const SHOTS = {
  S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28, S29, S30, S31, S32, S33,
  S34, S35, S36, S37, S38, S39, S40, S41, S42, S43, S44, S45, S46, S47, S48, S49, S50, S51, S52, S53, S54, S55, S56, S57, S58, S59, S60, S61, S62, S63, S64, S65, S66,
};
