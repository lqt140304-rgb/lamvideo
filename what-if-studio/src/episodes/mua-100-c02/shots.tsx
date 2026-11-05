import React from 'react';
import {
  Hero, Pose, poseAt, kf, rnd, camT, LOOKS, joints, toWorld, Radio, TeaCup, Teapot, TearCalendar,
  AnHouse, YARD, Alley, TownView, LivingRoom, LIVING, AnKitchen, ANKITCHEN, stand,
  Rain, Splashes, Foreground, Glow, LightVeil, ShotProps,
} from '../../engine';
import { live, P, talkAt, Back, LivingFront, ShopFront, HandTop, onDeck, CHILD } from '../mua-100-c01/shots';

// Cảnh 2 — Ngày 3: Quần áo chưa kịp khô. Quiet and domestic by day (long, near-still shots, as the script asks), then
// the first standing water at dusk. Water follows the script's table: about 0,10 m in the alley; An's veranda still dry.

const AN = LOOKS.an;
const HANH = LOOKS.hanh;
const LINH = LOOKS.linh;
const SAU = LOOKS.baSau;

/** Dusk over a whole frame: draw it last inside the camera group. */
const Dusk: React.FC<{ o?: number }> = ({ o = 0.34 }) => <rect x={-500} y={-500} width={2920} height={2080} fill="#141C30" opacity={o} style={{ mixBlendMode: 'multiply' }} />;

/** A person sitting: legs folded forward over a seat at hip height. */
const sit = (facing: 1 | -1): Partial<Pose> => ({ facing, legL: { a: 76, b: -76 }, legR: { a: 70, b: -70 } });

// ---------- props ----------
const SHIRTS = [['#E9E4D6', '#C9C2B0'], ['#4F7486', '#3C5A6A'], ['#B5604F', '#934A3D'], ['#E9D8B0', '#CDB98C'], ['#7E8C74', '#646F5C']];
/** A shirt on a hanger, damp: dark at the hem, swaying, with a drip that keeps falling from it. */
const Shirt: React.FC<{ x: number; y: number; s?: number; c?: number; t: number; dry?: number; drip?: boolean }> = ({ x, y, s = 1, c = 0, t, dry = 0.3, drip = true }) => {
  const [a, b] = SHIRTS[c % SHIRTS.length];
  const p = (t / 26 + rnd(c + 3, 1)) % 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${1.6 * Math.sin(t * 0.07 + c)})`}>
      <path d="M 0 -30 q 0 -14 12 -14" stroke="#3A3A3E" strokeWidth={4} fill="none" />
      <path d="M -58 6 L 0 -24 L 58 6" stroke="#3A3A3E" strokeWidth={4} fill="none" />
      <path d="M -24 -16 Q 0 -2 24 -16 L 62 2 L 88 66 L 58 80 L 44 50 L 44 170 L -44 170 L -44 50 L -58 80 L -88 66 L -62 2 Z" fill={a} stroke="#16141C" strokeWidth={4} strokeLinejoin="round" />
      <path d="M 12 -8 L 24 -16 L 62 2 L 88 66 L 58 80 L 44 50 L 44 170 L 16 170 Z" fill={b} opacity={0.55} />
      <path d="M -44 170 L 44 170 L 44 112 Q 0 96 -44 118 Z" fill="#1B2C3C" opacity={0.42 * (1 - dry) + 0.1} />
      {drip ? <ellipse cx={-22 + (c % 3) * 22} cy={174 + p * 420} rx={5} ry={9} fill="#D8E8F2" opacity={1 - p * 0.5} /> : null}
    </g>
  );
};

const Fan: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={8} rx={70} ry={12} fill="#000" opacity={0.32} />
    <rect x={-46} y={-8} width={92} height={16} rx={8} fill="#7A8C8E" />
    <rect x={-6} y={-150} width={12} height={144} fill="#8E9C9E" />
    <g transform="translate(0 -230)">
      <circle r={86} fill="#20262A" opacity={0.28} />
      <g transform={`rotate(${t * 42})`} fill="#9CC4C8" opacity={0.75}>
        {[0, 120, 240].map((a) => <ellipse key={a} transform={`rotate(${a}) translate(0 -42)`} rx={22} ry={40} />)}
      </g>
      <circle r={13} fill="#5F7274" />
      <circle r={86} fill="none" stroke="#3C4A4C" strokeWidth={6} />
      {[0, 30, 60, 90, 120, 150].map((a) => <path key={a} transform={`rotate(${a})`} d="M 0 -86 L 0 86" stroke="#3C4A4C" strokeWidth={1.6} />)}
    </g>
  </g>
);

const Shoes: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-40, 40].map((dx) => (
      <g key={dx} transform={`translate(${dx} 0)`}>
        <path d="M -34 0 L -34 -20 Q -20 -34 2 -28 L 24 -18 Q 40 -12 42 0 Z" fill="#E8E4D8" stroke="#16141C" strokeWidth={4} strokeLinejoin="round" />
        <rect x={-36} y={-6} width={80} height={9} rx={4} fill="#3F7E8A" stroke="#16141C" strokeWidth={3} />
        <path d="M -6 -28 L 4 -18 M 4 -25 L 14 -15" stroke="#16141C" strokeWidth={3} />
      </g>
    ))}
  </g>
);

/** A wooden seat seen side-on. top: seat height, floor: where the legs land, back: -1/1 the side of the chair back, 0 a stool. */
const Seat: React.FC<{ x: number; top: number; floor: number; w: number; back?: number }> = ({ x, top, floor, w, back = 0 }) => {
  const u = w / 120;
  return (
    <g>
      <ellipse cx={x} cy={floor + 3} rx={w * 0.62} ry={9 * u} fill="#000" opacity={0.3} />
      <path d={`M ${x - w * 0.42} ${top + 8 * u} L ${x - w * 0.46} ${floor} M ${x + w * 0.42} ${top + 8 * u} L ${x + w * 0.46} ${floor}`} stroke="#4C3420" strokeWidth={12 * u} strokeLinecap="round" />
      <path d={`M ${x - w * 0.44} ${(top + floor) / 2 + 12 * u} L ${x + w * 0.44} ${(top + floor) / 2 + 12 * u}`} stroke="#3E2A18" strokeWidth={7 * u} />
      {back ? <path d={`M ${x + (back * w) / 2} ${top + 6 * u} L ${x + (back * w * 0.58)} ${top - 118 * u}`} stroke="#5E4128" strokeWidth={13 * u} strokeLinecap="round" /> : null}
      {back ? <path d={`M ${x + (back * w) / 2 - back * 2} ${top - 86 * u} L ${x + (back * w * 0.58) - back * 2} ${top - 86 * u}`} stroke="#5E4128" strokeWidth={13 * u} /> : null}
      <rect x={x - w / 2} y={top - 2 * u} width={w} height={13 * u} rx={3 * u} fill="#8E6A48" stroke="#2E2014" strokeWidth={2.5 * u} />
    </g>
  );
};

const SmallChair: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={2} rx={60} ry={9} fill="#000" opacity={0.3} />
    <path d="M -38 -56 L -42 0 M 38 -56 L 42 0 M -38 -56 L -38 -120 M 38 -56 L 38 -120" stroke="#4C3420" strokeWidth={9} strokeLinecap="round" />
    <rect x={-46} y={-64} width={92} height={12} rx={3} fill="#7A5636" />
    <rect x={-40} y={-124} width={80} height={20} rx={3} fill="#7A5636" />
  </g>
);

// ---------- S1: close: the tear-off leaf says 3, with the marks already made ----------
export const S1: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.1], [len, 1.0]]))}>
    <rect x={-100} y={-100} width={2200} height={1300} fill="#7E693A" />
    <Glow x={480} y={60} r={1200} o={0.5} />
    <TearCalendar x={960} y={560} s={4.2} day="3" />
    <Glow x={1600} y={300} r={700} kind="cool" o={0.28} />
  </g>
);

// ---------- S2: wide: the wooden set by the door, morning grey in the window, the two of them still in their places ----------
const SET_AN = stand(LIVING, 0.08, 0.46);
const AN_HIP = LIVING.P(0.08, 1, 0.46).y - 88 * SET_AN.scale;
const LINH_AT = LIVING.P(0.42, 1, 0.5);
export const S2: React.FC<ShotProps> = ({ t, len }) => {
  const s = SET_AN.scale;
  return (
    <g transform={camT(kf(t, [[0, 780], [len, 750]]), 600, kf(t, [[0, 1.12], [len, 1.18]]))}>
      <LivingRoom id="c2s2" t={t} lamp={0.75} day="3" dog={false} />
      <Seat x={SET_AN.x - 2 * s} top={AN_HIP + 12 * s} floor={AN_HIP + 88 * s} w={124 * s} back={-1} />
      <Hero look={AN} pose={P({ x: SET_AN.x, y: AN_HIP, scale: s, yaw: 0.6, look: kf(t, [[0, 0.1], [30, 0.1], [40, 0.7]]), headTilt: kf(t, [[30, 0], [40, 4]]), ...sit(1), armR: { a: 14, b: 32 }, armL: { a: -4, b: -30 } }, t, 1)} rimId="filmR" shadow={0} />
      <Seat x={LINH_AT.x + 4} top={LINH_AT.y - 58 * s * 0.72 + 10 * s * 0.72} floor={LINH_AT.y + 16 * s * 0.72} w={92 * s * 0.72} />
      <Hero look={LINH} pose={P({ x: LINH_AT.x, y: LINH_AT.y - 58 * s * 0.72, scale: s * 0.72, yaw: -0.6, look: -0.6, ...sit(-1), armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 4)} rimId="filmR" shadow={0} />
      <Foreground blur={10}><rect x={1370} y={-100} width={300} height={1300} fill="#17110C" /></Foreground>
    </g>
  );
};

// ---------- S3: macro: the tea still warm ----------
export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 980], [len, 940]]), 600, 1.04)}>
    <rect x={-100} y={-100} width={2200} height={900} fill="#574332" />
    <g filter="url(#blur16)">
      <rect x={1180} y={60} width={560} height={420} fill="#8896A0" />
      <rect x={260} y={120} width={300} height={560} fill="#E2A258" />
    </g>
    <Glow x={420} y={330} r={620} o={0.45} />
    <rect x={-100} y={760} width={2200} height={420} fill="#7E5A3A" />
    <rect x={-100} y={760} width={2200} height={16} fill="#A67C50" />
    {Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M -100 ${810 + i * 46} Q 900 ${820 + i * 46} 2100 ${804 + i * 46}`} stroke="#5A3E26" strokeWidth={5} fill="none" />)}
    <Teapot x={520} y={830} s={3} />
    <TeaCup x={1020} y={900} s={5.6} t={t} />
    <Glow x={1020} y={760} r={380} o={0.4} />
  </g>
);

// ---------- S4: low on the veranda, looking up along the line: shirts that have not dried, drips, rain beyond ----------
export const S4: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <rect width={1920} height={1080} fill="#7C8A95" />
    <g filter="url(#blur6)">
      <rect y={620} width={1920} height={460} fill="#5A4238" />
      <rect x={-20} y={330} width={520} height={340} fill="#5C5F5E" />
      <rect x={1380} y={280} width={600} height={390} fill="#5C5F5E" />
    </g>
    <Rain t={t} o={0.5} />
    <polygon points="-40,-20 1960,-20 1960,70 -40,170" fill="#22262E" />
    <path d={`M -40 196 L 1960 ${kf(t, [[0, 96], [len, 110]])}`} stroke="#E9E4D6" strokeWidth={5} />
    <g transform={`translate(${kf(t, [[0, 0], [len, -70]])} 0)`}>
      {[[180, 280, 1.9, 0], [640, 245, 1.65, 3], [1040, 214, 1.4, 1], [1370, 190, 1.2, 2], [1640, 172, 1.05, 4], [1860, 158, 0.92, 0]].map(([x, y, s, c], i) => <Shirt key={i} x={x} y={y} s={s} c={c} t={t + i * 9} />)}
    </g>
    <rect y={990} width={1920} height={100} fill="#2A2824" />
    <Glow x={140} y={40} r={620} o={0.34} />
  </g>
);

// ---------- S5: medium: Hạnh sets the fan down, the uniform on the chair back ----------
const S5_S = stand(LIVING, 0.66, 0.5);
export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { ...S5_S, x: S5_S.x + 110, yaw: -0.55, look: -0.5, tilt: -6, expr: 'neutral', armL: { a: 54, b: 34 }, armR: { a: -30, b: -30 } } },
    { f: 28, p: { x: S5_S.x, tilt: -18, armL: { a: 74, b: 14 }, armR: { a: -52, b: -16 } } },
    { f: 52, p: { tilt: -4, armL: { a: 20, b: 18 }, armR: { a: -8, b: -14 } } },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 930]]), 590, kf(t, [[0, 1.5], [len, 1.56]]))}>
      <LivingRoom id="c2s5" t={t} lamp={0.75} day="3" dog={false} />
      <Fan x={kf(t, [[0, 960], [28, 830]])} y={kf(t, [[0, 800], [28, 880]])} s={1.15} t={t} />
      <SmallChair x={520} y={920} s={1.55} />
      <g transform="translate(520 722) scale(0.82)"><Shirt x={0} y={0} c={3} t={t} drip={false} /></g>
      <Hero look={HANH} pose={live(pose, t, 3)} rimId="filmL" shadow={1} />
    </g>
  );
};

// ---------- S6: close: the air from the fan moves the uniform; a thread of scent goes past it to the cup ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 520, kf(t, [[0, 1.0], [len, 1.07]]))}>
    <rect x={-100} y={-100} width={2200} height={1300} fill="#6A5C38" />
    <Glow x={1460} y={80} r={980} o={0.5} />
    <g filter="url(#blur10)"><rect x={-100} y={760} width={2200} height={500} fill="#3E3226" /></g>
    <path d="M -100 8 L 2100 8" stroke="#3E2A18" strokeWidth={16} />
    <g transform={`translate(860 150) rotate(${3 * Math.sin(t * 0.17)}) skewX(${-3 - 3 * Math.sin(t * 0.17)})`}>
      <Shirt x={0} y={0} s={3.3} c={3} t={t} drip={false} />
    </g>
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M ${1240 + i * 40} ${860 - i * 30} q ${40 + 26 * Math.sin(t * 0.06 + i)} -160 ${-20} -300 q ${-50 + 20 * Math.cos(t * 0.05 + i)} -130 ${30} -300`} stroke="#F2EFE2" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.2} />
    ))}
    <TeaCup x={1420} y={960} s={3.6} t={t} />
  </g>
);

// ---------- S7: macro: the radio, its dial lit, the news coming out of it ----------
export const S7: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 1000]]), 560, 1.05)}>
    <rect x={-100} y={-100} width={2200} height={1300} fill="#463628" />
    <g filter="url(#blur16)"><rect x={1420} y={80} width={520} height={460} fill="#8896A0" /></g>
    <Rain t={t} seed={9} n={30} o={0.25} x0={1420} y0={80} w={520} h={460} />
    <rect x={-100} y={800} width={2200} height={400} fill="#7E5A3A" />
    <rect x={-100} y={800} width={2200} height={16} fill="#A67C50" />
    <Radio x={950} y={810} s={6.2} />
    <Glow x={1080} y={620} r={230} o={0.62} />
    {[0, 1, 2].map((i) => {
      const p = (t / 34 + i / 3) % 1;
      return <path key={i} d={`M ${660 - p * 200} ${490 - p * 100} q ${-34 - p * 40} ${130 + p * 40} 0 ${260 + p * 90}`} stroke="#E8C47A" strokeWidth={5} fill="none" opacity={0.5 * (1 - p)} />;
    })}
  </g>
);

// ---------- S8: extreme wide: one more band of rain walks over town toward us ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 1180], [len, 800]]), 600, 1.24)}>
    <TownView id="c2s8" t={t} w={2} horizon={420} rain={1} river={false} />
    <g transform={`translate(${kf(t, [[0, -300], [len, 500]])} 0)`} filter="url(#blur10)" opacity={0.42}>
      <polygon points="300,-100 980,-100 780,1200 80,1200" fill="#2C3440" />
    </g>
  </g>
);

// ---------- S9: extreme close: An's fingers turn the volume down ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 620, kf(t, [[0, 1.0], [len, 1.04]]))}>
    <rect x={-100} y={-100} width={2200} height={1400} fill="#6A4A30" />
    {[220, 300, 380].map((y) => <path key={y} d={`M -100 ${y} L 700 ${y}`} stroke="#2E2014" strokeWidth={14} />)}
    <rect x={820} y={180} width={760} height={190} fill="#E8C47A" stroke="#2E2014" strokeWidth={10} />
    {Array.from({ length: 13 }).map((_, i) => <path key={i} d={`M ${860 + i * 54} 205 L ${860 + i * 54} ${i % 3 ? 240 : 270}`} stroke="#2E2014" strokeWidth={5} />)}
    <rect x={1200 - t * 0.5} y={190} width={8} height={170} fill="#C8322A" />
    <Glow x={1200} y={270} r={440} o={0.5} />
    <g transform="translate(1180 700)">
      <circle r={190} fill="#D8C8A0" stroke="#2E2014" strokeWidth={10} />
      <g transform={`rotate(${kf(t, [[0, 40], [28, -90]])})`}><path d="M 0 -170 L 0 -90" stroke="#2E2014" strokeWidth={18} strokeLinecap="round" /></g>
    </g>
    <HandTop x={1230 + kf(t, [[0, 40], [28, 0]])} y={700} rot={118} s={1.5} skin={AN.skin} sleeve={AN.jacket} />
  </g>
);

// ---------- S10: from down by the shoes: An lifts them past us to the high shelf ----------
export const S10: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: 760, scale: 1.7, yaw: 0.5, look: 0.5, tilt: 26, headTilt: 6, expr: 'neutral', armR: { a: 40, b: 8 }, armL: { a: -8, b: 22 } } },
    { f: 34, p: { tilt: 0, headTilt: -10, armR: { a: 148, b: 8 }, armL: { a: 8, b: 20 } } },
  ]);
  const hand = toWorld(pose, joints(pose).armR.end);
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 1000]]), kf(t, [[0, 620], [34, 400], [len, 400]]), 1)}>
      <rect x={-100} y={-400} width={2200} height={1700} fill="#907A40" />
      <polygon points="-100,1010 2100,1010 2100,1300 -100,1300" fill="#5E4E3E" />
      <Glow x={420} y={-60} r={800} o={0.5} />
      <rect x={960} y={378} width={900} height={22} fill="#7A5636" />
      <rect x={960} y={400} width={900} height={12} fill="#5E4128" />
      <path d="M 1040 412 L 1040 500 M 1780 412 L 1780 500" stroke="#4C3420" strokeWidth={14} />
      <rect x={1400} y={298} width={120} height={80} fill="#B8543E" />
      <rect x={1540} y={278} width={150} height={100} fill="#3F7E8A" />
      <rect x={-100} y={640} width={2200} height={370} fill="#766437" />
      <rect x={-100} y={632} width={2200} height={14} fill="#5E4128" />
      <rect x={110} y={20} width={400} height={410} fill="#8896A0" stroke="#5A4028" strokeWidth={16} />
      <path d="M 310 20 L 310 430 M 110 225 L 510 225" stroke="#5A4028" strokeWidth={9} />
      <Rain t={t} seed={5} n={40} o={0.6} x0={120} y0={30} w={380} h={390} />
      <Glow x={310} y={225} r={420} kind="cool" o={0.3} />
      <rect x={570} y={90} width={120} height={150} fill="#3E2A18" />
      <rect x={582} y={102} width={96} height={126} fill="#C8B69A" />
      <path d="M 1300 520 L 1820 520" stroke="#5E4128" strokeWidth={12} />
      {[1370, 1520, 1670].map((x) => <path key={x} d={`M ${x} 520 l 0 26`} stroke="#2A2622" strokeWidth={6} />)}
      <path d="M 1490 546 L 1550 546 L 1566 700 L 1474 700 Z" fill="#3F7E8A" stroke="#16141C" strokeWidth={4} strokeLinejoin="round" />
      <path d="M 1640 546 C 1616 590 1616 650 1636 720 L 1704 720 C 1724 650 1724 590 1700 546 Z" fill="#B5604F" stroke="#16141C" strokeWidth={4} strokeLinejoin="round" />
      <Hero look={AN} pose={live(pose, t, 1)} rimId="filmL" shadow={0} />
      <Shoes x={hand.x + 6} y={hand.y + (t < 34 ? 60 : -10)} s={1.6} />
      {t < 2 ? null : <path d="M 1300 1010 L 1500 1010" stroke="#3E3226" strokeWidth={0} />}
      <Foreground blur={10}><ellipse cx={1720} cy={1130} rx={330} ry={170} fill="#17110C" /></Foreground>
    </g>
  );
};

// ---------- S11: medium: Hạnh holds up the still-damp uniform and says so ----------
export const S11: React.FC<ShotProps> = ({ t, len }) => {
  const lift = kf(t, [[0, 0], [30, 1]]);
  const pose = P({ x: 800, y: 620, scale: 1.45, yaw: 0.4, look: 0.5, headTilt: 3 - 5 * (1 - lift), expr: 'worried', talk: talkAt(t, 70, 215), armL: { a: -14 - 30 * lift, b: -16 - 24 * lift }, armR: { a: 22 + 44 * lift, b: 8 + 14 * lift } }, t, 3);
  const hand = toWorld(pose, joints(pose).armR.end);
  return (
    <g transform={camT(kf(t, [[0, 940], [len, 900]]), 460, kf(t, [[0, 1.46], [len, 1.54]]))}>
      <LivingRoom id="c2s11" t={t + 70} lamp={0.75} day="3" dog={false} />
      <rect x={-200} y={-200} width={2320} height={1600} fill="#000" opacity={0.16} />
      <Hero look={HANH} pose={pose} rimId="filmL" shadow={0} />
      <Shirt x={hand.x + 30} y={hand.y - 6} s={1.15} c={3} t={t} dry={0.2} />
    </g>
  );
};

// ---------- S12: close: Linh turns to her father ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(980, kf(t, [[0, 470], [len, 455]]), kf(t, [[0, 2.5], [len, 2.65]]))}>
    <LivingRoom id="c2s12" t={t + 90} lamp={0.75} day="3" dog={false} veil={0.42} />
    <g style={{ filter: 'blur(3px)' }}><rect x={-200} y={-200} width={1} height={1} /></g>
    <Hero look={LINH} pose={P({ x: 1010, y: 740, scale: 1.2, yaw: kf(t, [[0, 0.5], [16, -0.45]]), look: kf(t, [[0, 0.6], [16, -0.7]]), headTilt: -5, expr: 'worried', talk: talkAt(t, 42, 90), armL: { a: 10, b: 20 }, armR: { a: 12, b: 24 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S13: over Linh's shoulder: An, seated, answers honestly ----------
export const S13: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(kf(t, [[0, 700], [len, 670]]), 500, kf(t, [[0, 2.0], [len, 2.1]]))}>
      <LivingRoom id="c2s13" t={t + 110} lamp={0.75} day="3" dog={false} veil={0.42} />
      <Seat x={610} top={694} floor={790} w={130} back={-1} />
      <Hero look={AN} pose={P({ x: 620, y: 682, scale: 1.05, yaw: 0.45, look: 0.5, headTilt: 7, expr: 'neutral', talk: talkAt(t, 2, 165), ...sit(1), armR: { a: 14, b: 32 }, armL: { a: -4, b: -30 } }, t, 1)} rimId="filmR" shadow={0} />
    </g>
    <Foreground blur={3}>
      <Back look={LINH} pose={P({ x: kf(t, [[0, 1500], [len, 1550]]), y: 1300, scale: 2.5, armL: { a: 8, b: 6 }, armR: { a: 8, b: 6 } })} />
    </Foreground>
  </g>
);

// ---------- S14: table height, past the blurred teapot and the open exercise book: Linh teases him, pen in the air ----------
export const S14: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.05]]))}>
      <rect x={-100} y={-100} width={2200} height={1300} fill="#5E4E2E" />
      <g filter="url(#blur10)">
        <rect x={1240} y={100} width={560} height={420} fill="#8896A0" />
        <path d="M 1240 310 L 1800 310" stroke="#3E2A18" strokeWidth={14} />
        <rect x={-100} y={60} width={420} height={760} fill="#E2A258" opacity={0.6} />
      </g>
      <Glow x={700} y={-20} r={980} o={0.5} />
      <Hero look={LINH} pose={P({ x: 960, y: 1000, scale: 2.5, yaw: 0.35, look: 0.5, headTilt: 6, expr: 'smug', talk: talkAt(t, 2, 132), armL: { a: 12, b: 26 }, armR: { a: 100 + 7 * Math.sin(t * 0.21), b: 72 - 10 * Math.sin(t * 0.21) } }, t, 4)} rimId="filmL" shadow={0} />
    </g>
    <rect y={880} width={1920} height={200} fill="#7E5A3A" />
    <rect y={880} width={1920} height={12} fill="#A67C50" />
    <polygon points="470,1080 760,900 1190,900 1410,1080" fill="#F1EADA" />
    <path d="M 950 900 L 940 1080" stroke="#BDB39C" strokeWidth={5} />
    {[930, 975, 1030].map((y, i) => <path key={i} d={`M ${650 - i * 50} ${y} L ${900} ${y} M ${990} ${y} L ${1240 + i * 40} ${y}`} stroke="#9CB3C8" strokeWidth={3} />)}
    <Foreground blur={16}><Teapot x={190} y={1040} s={5} /></Foreground>
  </g>
);

// ---------- S15: side-on across the low table: he gives in with a laugh; the door's grey behind them ----------
export const S15: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 960], [len, 980]]), 590, kf(t, [[0, 1.46], [len, 1.52]]))}>
    <rect x={-300} y={-300} width={2520} height={1700} fill="#8E7A3F" />
    <rect x={700} y={230} width={540} height={560} fill="#8E9CA8" />
    <Rain t={t} seed={13} n={50} o={0.6} x0={700} y0={230} w={540} h={560} />
    <rect x={700} y={690} width={540} height={100} fill="#7A766A" />
    {[[770, 280, 0.9, 0], [950, 262, 0.9, 3], [1140, 280, 0.9, 1]].map(([x, y, s, c], i) => <Shirt key={i} x={x} y={y} s={s} c={c} t={t} />)}
    <rect x={700} y={230} width={540} height={560} fill="none" stroke="#3A2616" strokeWidth={18} />
    <polygon points="-300,790 2220,790 2220,1400 -300,1400" fill="#5E4E3E" />
    <LightVeil id="c2s15v" lights={[[960, 460, 460], [480, 200, 640]]} o={0.38} />
    <Glow x={480} y={110} r={620} o={0.5} />
    <Seat x={606} top={732} floor={826} w={136} back={-1} />
    <Hero look={AN} pose={P({ x: 620, y: 720, scale: 1.08, yaw: 0.72, look: 0.5, tilt: 3 + (t < 40 ? 2.5 * Math.sin(t * 0.8) : 0), expr: t < 60 ? 'happy' : 'neutral', talk: talkAt(t, 2, 82), ...sit(1), armR: { a: 14, b: 32 }, armL: { a: -4, b: -30 } }, t, 1)} rimId="filmL" shadow={0} />
    <Seat x={1312} top={768} floor={830} w={98} />
    <Hero look={LINH} pose={P({ x: 1300, y: 760, scale: 0.78, yaw: -0.72, look: -0.6, expr: 'happy', ...sit(-1), legL: { a: 76, b: -76 + 12 * Math.sin(t * 0.3) }, legR: { a: 70, b: -70 - 12 * Math.sin(t * 0.3) }, armL: { a: 14, b: 32 }, armR: { a: -4, b: -30 } }, t, 4)} rimId="filmR" shadow={0} />
    <path d="M 720 800 L 1190 800" stroke="#7E5A3A" strokeWidth={24} />
    <path d="M 760 810 L 760 930 M 1150 810 L 1150 930" stroke="#4C3420" strokeWidth={14} />
    <rect x={850} y={776} width={190} height={12} fill="#F1EADA" />
    <TeaCup x={1090} y={786} s={0.8} t={t} />
  </g>
);

// ---------- S16: what he is looking at: the same shirts through the door, no drier. Held through the pause ----------
export const S16: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 500, kf(t, [[0, 1.72], [len, 1.9]]))}>
    <LivingFront id="c2s16" t={t + 40} />
    {[[850, 335, 0.72, 0], [960, 325, 0.72, 3], [1070, 335, 0.72, 1]].map(([x, y, s, c], i) => <Shirt key={i} x={x} y={y} s={s} c={c} t={t + i * 11} />)}
    <Foreground blur={6}><rect x={kf(t, [[0, 520], [len, 400]])} y={-100} width={120} height={1300} fill="#17110C" /></Foreground>
  </g>
);

// ---------- S17: high wide at dusk: a skin of water down the whole alley, lit doors doubled in it ----------
export const S17: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, kf(t, [[0, 640], [len, 600]]), kf(t, [[0, 1.16], [len, 1.1]]))}>
    <Alley id="c2s17" t={t} w={2} rain={0.8} water={1} />
    <Dusk o={0.1} />
  </g>
);

// ---------- S18: close at water level: bà Sáu's low stool, its legs gone ----------
export const S18: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 1520], [len, 1560]]), 720, kf(t, [[0, 2.5], [len, 2.7]]))}>
    <ShopFront id="c2s18" t={t} tarp={1} />
    <rect x={200} y={726} width={1800} height={500} fill="#3E4C56" opacity={0.92} />
    <ellipse cx={1545} cy={732} rx={92} ry={11} fill="#000" opacity={0.3} />
    <rect x={1460} y={704} width={170} height={22} rx={4} fill="#B98A5A" stroke="#2E2014" strokeWidth={3} />
    <rect x={1500} y={662} width={90} height={42} rx={3} fill="#D9A24C" stroke="#2E2014" strokeWidth={3} />
    <rect x={1460} y={734} width={170} height={16} fill="#8C6A44" opacity={0.5} />
    {[1480, 1610].map((x, i) => <path key={i} d={`M ${x} 736 q ${5 * Math.sin(t * 0.2 + i)} 24 0 46 q ${-5 * Math.sin(t * 0.2 + i)} 24 0 46`} stroke="#6B4E36" strokeWidth={9} fill="none" opacity={0.5} />)}
    {[0, 1].map((i) => <ellipse key={i} cx={1480 + i * 130} cy={730} rx={12 + ((t + i * 20) % 30)} ry={3 + ((t * 0.4 + i * 6) % 6)} fill="none" stroke="#DCE6EE" strokeWidth={1.5} opacity={0.75} />)}
    <Splashes t={t} x0={1240} x1={1900} y0={732} y1={960} n={40} o={0.65} />
    <Rain t={t} o={0.3} x0={1100} y0={420} w={900} h={660} n={60} />
    <Glow x={1300} y={640} r={460} o={0.5} />
    <Dusk o={0.12} />
  </g>
);

// ---------- S19: from the yard, low: water sits short of An's veranda, which is still dry ----------
export const S19: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 1000], [len, 960]]), 780, kf(t, [[0, 2.0], [len, 2.12]]))}>
    <AnHouse id="c2s19" t={t} w={2} rain={0.8} chair={false} />
    <rect x={-300} y={846} width={2520} height={400} fill="#46565F" opacity={0.86} />
    <rect x={160} y={846} width={1500} height={5} fill="#BFD0DA" opacity={0.6} />
    <polygon points="790,850 1010,850 1120,1100 680,1100" fill="#E8B46C" opacity={0.22} />
    <Splashes t={t} x0={300} x1={1700} y0={856} y1={1090} n={46} o={0.65} />
    <Dusk o={0.24} />
  </g>
);

// ---------- S20: medium in the kitchen: a new drip; Hạnh slides the basin under it ----------
export const S20: React.FC<ShotProps> = ({ t, len }) => {
  const s = stand(ANKITCHEN, 0.56, 0.42);
  const pose = poseAt(t, [
    { f: 0, p: { ...s, yaw: 0.65, look: 0.4, headTilt: -8, tilt: 4, expr: 'worried', armR: { a: 50, b: 30 }, armL: { a: -34, b: -30 } } },
    { f: 30, p: { y: s.y + 26, tilt: 30, headTilt: 2, armR: { a: 62, b: 0 }, armL: { a: -50, b: -2 } } },
    { f: 66, p: { y: s.y, tilt: 4, headTilt: -10, armR: { a: 16, b: 18 }, armL: { a: -6, b: -18 } } },
  ]);
  const p = (t % 24) / 24;
  const bx = 1270;
  const by = 900;
  return (
    <g transform={camT(kf(t, [[0, 1010], [len, 1040]]), 560, kf(t, [[0, 1.3], [len, 1.36]]))}>
      <AnKitchen id="c2s20" t={t} w={2} rain={1} />
      <path d={`M ${bx - 70} 196 q 70 -18 140 4 q 8 28 -30 40 q -58 16 -100 -8 Z`} fill="#3A3424" opacity={0.75} />
      <Hero look={HANH} pose={live(pose, t, 3)} rimId="filmL" shadow={1} />
      <g transform={`translate(${kf(t, [[0, -180], [30, 0]])} 0)`}>
        <ellipse cx={bx} cy={by + 40} rx={110} ry={16} fill="#000" opacity={0.32} />
        <path d={`M ${bx - 100} ${by} L ${bx + 100} ${by} L ${bx + 80} ${by + 42} L ${bx - 80} ${by + 42} Z`} fill="#5F7E96" stroke="#2C3C48" strokeWidth={4} />
        <ellipse cx={bx} cy={by} rx={100} ry={17} fill="#3C5468" />
      </g>
      <ellipse cx={bx} cy={220 + p * 680} rx={7} ry={13} fill="#D8E8F2" />
      {p < 0.2 ? <ellipse cx={bx} cy={by} rx={18 + p * 240} ry={3 + p * 40} fill="none" stroke="#DCE6EE" strokeWidth={3} opacity={1 - p * 4} /> : null}
      <Dusk o={0.16} />
    </g>
  );
};

// ---------- S21: low at the door: An wipes the step dry; the rain comes on again behind him and he looks up ----------
export const S21: React.FC<ShotProps> = ({ t, len }) => {
  const up = kf(t, [[46, 0], [62, 1]]);
  const wipe = Math.sin(t * 0.32) * (1 - up);
  const s = 1.02;
  return (
    <g transform={camT(kf(t, [[0, 880], [len, 920]]), 690, kf(t, [[0, 2.04], [len, 2.1]]))}>
      <AnHouse id="c2s21" t={t} w={2} rain={kf(t, [[0, 0.45], [58, 1.25]])} chair={false} />
      <Hero look={AN} pose={P({ x: 800, y: YARD.deck - 62, scale: s, yaw: 0.72, look: 0.5 + 0.3 * up, headTilt: -12 * up + 8 * (1 - up), tilt: 34 - 28 * up, expr: 'neutral', legL: { a: 86, b: -128 }, legR: { a: 74, b: -128 }, armR: { a: 68 - 44 * up + 10 * wipe, b: 4 + 24 * up }, armL: { a: -40, b: -24 } }, t, 1)} rimId="filmL" shadow={0} />
      {up < 0.6 ? <path transform={`translate(${920 + 42 * wipe} 750)`} d="M -46 2 Q -30 -12 -6 -7 Q 18 -14 44 -4 Q 50 6 34 10 Q 8 14 -18 10 Q -44 12 -46 2 Z M -22 -4 Q -10 4 2 -2 M 10 -6 Q 20 2 32 0" fill="#7E8C94" stroke="#16141C" strokeWidth={3} strokeLinejoin="round" /> : null}
      <ellipse cx={850} cy={762} rx={100} ry={10} fill="#000" opacity={0.3} />
      <rect x={-300} y={846} width={2520} height={400} fill="#46565F" opacity={0.86} />
      <Rain t={t} n={70} near o={0.34 * kf(t, [[34, 0], [58, 1]])} seed={19} />
      <Dusk o={0.22} />
    </g>
  );
};

// ---------- S22: from inside, facing the door: Linh hauls her little chair in backward, away from the rain ----------
export const S22: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[0, 0], [len, 1]]);
  const s = 0.86 + k * 0.5;
  const x = 1040 + k * 40;
  const floor = 850 + k * 130;
  return (
    <g transform={camT(960, kf(t, [[0, 520], [len, 560]]), kf(t, [[0, 1.16], [len, 1.22]]))}>
      <LivingFront id="c2s22" t={t + 90} />
      <SmallChair x={x - 225 * s} y={floor - 14 * s} s={s * 1.5} />
      <Back look={LINH} pose={P({ x: x + 20 * Math.sin(t * 0.28), y: floor - 140 * s, scale: s, tilt: -7, armL: { a: 66, b: 8 }, armR: { a: 10, b: 14 }, legL: { a: 14 * Math.sin(t * 0.28), b: -8 }, legR: { a: -14 * Math.sin(t * 0.28), b: -8 } })} />
      <Dusk o={0.2} />
    </g>
  );
};

// ---------- S23: behind her, close, in the doorway: the rain a hand's reach away. Her hands stay at her sides. Held ----------
export const S23: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(960, 520, kf(t, [[0, 2.0], [len, 1.84]]))}>
      <LivingFront id="c2s23" t={t + 120} />
      <Dusk o={0.3} />
    </g>
    <Back look={LINH} pose={P({ x: 660, y: 1040, scale: 2.2, armL: { a: 8, b: 6 }, armR: { a: 8, b: 6 } })} />
    <Rain t={t} n={30} near o={0.22} seed={23} x0={700} y0={-60} w={700} h={1160} />
  </g>
);

export const SHOTS = { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23 };
