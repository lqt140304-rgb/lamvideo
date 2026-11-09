import React from 'react';
import { reachPalm } from './meadow_family';
import timeline from './timeline.json';
import { LOOKS, standPose, sitPose, joints, camT, clamp, lerp, Pose, ArmHand, OngLocShop, OngLocCounter, CustomerStool, OngLocForeground, LightVeil } from '../../engine';
import { Hero } from './actor';
import voiceTimeline from './timeline.json';

// Shared staging for episode 01: shop geometry, grounded seated/standing poses, inserts and the 2:1 bars.
// Kept out of shots.tsx so shots.tsx exports only shot components (the episode registers every export as a shot).

export type Mark = { shot: string; s: number; i: number; kind: string; at: number; len: number };
export const MARKS = (timeline as unknown as { marks: Mark[] }).marks;
/** Frame on `shot`'s own clock where item i of scene s starts (fallback keeps the shot drawable before a rebuild). */
export const mark = (shot: string, s: number, i: number, fallback = 0) => MARKS.find((m) => m.shot === shot && m.s === s && m.i === i) ?? { at: fallback, len: 60 };
/** Where item i of scene s falls on the film's own clock. */
export const beat = (s: number, i: number) => { const m = (MARKS as unknown as { s: number; i: number; f: number; len: number }[]).find((x) => x.s === s && x.i === i); return m ?? { s, i, f: 0, len: 60 }; };
export const S = 30; // frames per second
export const smooth = (v: number) => {
  const p = clamp(v);
  return p * p * (3 - 2 * p);
};
/** 0 → 1 between two clock frames. */
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / Math.max(1, b - a));

// ============================================================================
// SHARED STAGING — shop geometry and grounded poses
// ============================================================================

/** Sole height of a pose in world space (the shoe sole sits ~16 rig units under the ankle). */
export const soleY = (p: Pose) => {
  const j = joints(p);
  return p.y + (Math.max(j.legL.end.y, j.legR.end.y) + 16) * p.scale;
};

/**
 * A seated character on a customer stool built to fit them: the stool is sized from the pose so the seat is under
 * the hips and the soles land on the floor (or, for Thảo, on the footrest bar). No floating feet, no seat-less sits.
 */
export type StoolSpec = { x: number; y: number; s: number; footY?: number };
export const seated = (x: number, floorY: number, scale: number, facing: 1 | -1, rawOpts: Parameters<typeof sitPose>[4], stoolS?: number) => {
  // An explicit `undefined` would override the rig default and emit rotate(undefined) — the head then drops off the neck.
  const opts = Object.fromEntries(Object.entries(rawOpts ?? {}).filter(([, v]) => v !== undefined)) as Parameters<typeof sitPose>[4];
  const probe = sitPose(x, 0, scale, facing, opts);
  const drop = soleY(probe); // soles below the seat surface
  // Stool art: seat top at -96·s, floor at 0. Without a given size the stool is cut to this sitter's legs.
  const ss = stoolS ?? drop / 96;
  const seatY = floorY - 96 * ss;
  const sole = seatY + drop;
  // A shorter sitter on a shared-height stool rests the soles on a footrest bar fixed exactly at the sole line.
  const footY = sole < floorY - 6 ? sole : undefined;
  return { pose: sitPose(x, seatY, scale, facing, opts), stool: { x: x - 6 * facing * scale, y: floorY, s: ss, footY } as StoolSpec, seatY };
};

export const Stool: React.FC<StoolSpec> = ({ x, y, s, footY }) => (
  <g>
    <CustomerStool x={x} y={y} s={s} />
    {footY !== undefined ? (
      <g>
        <rect x={x - 40 * s} y={footY} width={80 * s} height={9 * s} rx={2.5} fill="#6A4130" stroke="#120E10" strokeWidth={2.2} />
        <line x1={x - 35 * s} y1={footY + 2} x2={x + 35 * s} y2={footY + 2} stroke="#F2B861" strokeWidth={1.5} opacity={0.5} />
      </g>
    ) : null}
  </g>
);

/** Palm-accurate reach for either arm (shared IK from the meadow rig). */
export const reach = (p: Pose, side: 'L' | 'R', target: { x: number; y: number }, amount = 1, reverse = false): Pose => {
  const key = side === 'L' ? 'armL' : 'armR';
  const to = reachPalm(p, side, target, reverse);
  const from = p[key];
  return { ...p, [key]: { a: lerp(from.a, to.a, amount), b: lerp(from.b, to.b, amount) } };
};

export const shoulderPt = (p: Pose, side: 'L' | 'R') => {
  const r = joints(p)[side === 'L' ? 'armL' : 'armR'].root;
  return { x: p.x + r.x * p.scale, y: p.y + r.y * p.scale };
};

// Shop plan (SET-TIEM): counter top 650 / base 855 at x 450–1330; door at screen right; rear workbench at x≈1355.
export const COUNTER = { x: 890, y: 855, w: 880 };
export const COUNTER_TOP = 650;
export const SHOP_FLOOR = 950; // customer floor line used by both children
// Lộc behind the counter: hips just above the counter top, legs hidden by it (fixes the floating/too-tall stance).
export const LOC_S = 1.15;
export const LOC_AT_COUNTER = (x: number, t: number, opts: Partial<Pose> = {}) => standPose(x, COUNTER_TOP + 140 * LOC_S - 12, LOC_S, { t, seed: 3, ...opts });
// At the rear workbench Lộc sits on the technician stool behind the bench, facing us, working on the stopped clock.
export const LOC_AT_BENCH = (t: number, opts: Partial<Pose> = {}) => sitPose(1318, 532, 1.0, -1, { t, seed: 3, yaw: -0.2, lean: 10, ...opts });

/** Closes the workbench front in front of a seated Lộc (the set draws the bench under him). */
export const BenchFront: React.FC<{ clockWork?: number; hideClock?: boolean }> = ({ clockWork = 0, hideClock = false }) => (
  <g transform="translate(1355 715)">
    <rect x={-205} y={-194} width={410} height={194} fill="#33201A" stroke="#120E10" strokeWidth={3} />
    <rect x={-190} y={-180} width={380} height={168} rx={3} fill="#2A1A15" opacity={0.85} />
    <rect x={-218} y={-212} width={436} height={20} rx={4} fill="#6E4432" stroke="#120E10" strokeWidth={3.5} />
    <line x1={-212} y1={-210} x2={212} y2={-210} stroke="#F2B861" strokeWidth={2.5} opacity={0.7} />
    {/* The half-repaired mantel clock Lộc works on (stopped hands: no ticking) */}
    {hideClock ? null : <g transform={`translate(${150 - clockWork * 4} -238)`}>
      <rect x={-34} y={-22} width={68} height={26} rx={6} fill="#5C3A2C" stroke="#120E10" strokeWidth={2.5} />
      <circle cx={0} cy={-26} r={20} fill="#E9DFC8" stroke="#120E10" strokeWidth={2.5} />
      <line x1={0} y1={-26} x2={9} y2={-34} stroke="#2B1E18" strokeWidth={2} />
      <line x1={0} y1={-26} x2={-4} y2={-14} stroke="#2B1E18" strokeWidth={2} />
    </g>}
  </g>
);

/** Low shelf near the door with the small clock Thảo lifts and puts back (C1-A). */
export const DoorShelf: React.FC<{ clockHeld: boolean }> = ({ clockHeld }) => (
  <g transform="translate(1470 955)">
    <ellipse cx={0} cy={4} rx={110} ry={10} fill="#000" opacity={0.4} />
    <rect x={-95} y={-150} width={190} height={150} fill="#3A2419" stroke="#120E10" strokeWidth={3} />
    <rect x={-102} y={-160} width={204} height={14} rx={3} fill="#6E4432" stroke="#120E10" strokeWidth={3} />
    <rect x={-85} y={-80} width={170} height={8} fill="#4E2E22" />
    {clockHeld ? null : <SmallClock x={-30} y={-160} />}
    <SmallClock x={45} y={-160} s={0.8} />
  </g>
);
export const SmallClock: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-20} y={-6} width={40} height={6} rx={2} fill="#4A2E22" stroke="#120E10" strokeWidth={2} />
    <circle cx={0} cy={-24} r={18} fill="#E9DFC8" stroke="#120E10" strokeWidth={3} />
    <line x1={0} y1={-24} x2={0} y2={-35} stroke="#2B1E18" strokeWidth={2} />
    <line x1={0} y1={-24} x2={8} y2={-21} stroke="#2B1E18" strokeWidth={2} />
  </g>
);

/** Two folded 20k notes (Thảo's), drawn in a hand. */
export const TwoBills: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = -20 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-13} y={-8} width={26} height={14} rx={2} fill="#7FA77A" stroke="#1E2A1C" strokeWidth={1.6} />
    <rect x={-10} y={-11} width={26} height={14} rx={2} fill="#8DB487" stroke="#1E2A1C" strokeWidth={1.6} />
  </g>
);

export type Kid = { pose: Pose; held?: React.ReactNode; heldSide?: 'L' | 'R' };
export const drawKid = (k: Kid, look: typeof LOOKS.duy, rim = 'rimShopWarm') => (
  <Hero pose={k.pose} look={look} rimId={rim} shadow={0.32} heldProps={k.held ? { [k.heldSide ?? 'R']: k.held } : undefined} />
);

/** Lens blur for one depth layer, in screen pixels; skipped when too small to see. */
export const DepthBlur: React.FC<{ id: string; px: number; z: number; children: React.ReactNode }> = ({ id, px, z, children }) =>
  px < 0.5 ? (
    <>{children}</>
  ) : (
    <g>
      <defs>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={px / z} />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{children}</g>
    </g>
  );

const LAMP_AT = { x: 1192, y: 452 };
const BOKEH: [number, number, number][] = [[470, 300, 18], [560, 250, 14], [640, 330, 20], [760, 280, 12], [1500, 330, 16], [1430, 260, 12], [1560, 420, 20], [1110, 300, 14]];
/** Practical light in the shop: bloom round the bench lamp, and out-of-focus highlights on the clock glass when the rear goes soft. */
export const LampGlow: React.FC<{ id: string; rearBlur: number; t: number }> = ({ id, rearBlur, t }) => {
  const soft = clamp(rearBlur / 6);
  const flick = 1 + Math.sin(t * 0.37) * 0.015;
  return (
    <g style={{ mixBlendMode: 'screen' }} pointerEvents="none">
      <defs>
        <radialGradient id={`${id}Bloom`}>
          <stop offset="0%" stopColor="#FFE2A6" stopOpacity={0.85} />
          <stop offset="18%" stopColor="#FFB45C" stopOpacity={0.42} />
          <stop offset="55%" stopColor="#E07A2E" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#E07A2E" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}Bokeh`}>
          <stop offset="0%" stopColor="#FFD08A" stopOpacity={0.5} />
          <stop offset="80%" stopColor="#FFC070" stopOpacity={0.32} />
          <stop offset="100%" stopColor="#FFC070" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={LAMP_AT.x} cy={LAMP_AT.y} rx={420 * flick} ry={330 * flick} fill={`url(#${id}Bloom)`} opacity={0.72} />
      <ellipse cx={LAMP_AT.x - 60} cy={LAMP_AT.y + 230} rx={520} ry={150} fill={`url(#${id}Bloom)`} opacity={0.32} />
      {soft > 0.02 ? BOKEH.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r * (1 + soft * 1.6)} fill={`url(#${id}Bokeh)`} opacity={soft * (0.55 + 0.25 * Math.sin(t * 0.05 + i))} />) : null}
    </g>
  );
};

/** Light falls off with distance from its sources, on the people as well as the room: bright by the lamps and bulb, dim in the far corners. */
export const RoomFalloff: React.FC<{ id: string }> = ({ id }) => (
  <LightVeil id={`${id}Fall`} o={0.5} lights={[[1192, 452, 560], [565, 620, 470], [940, 215, 620], [1815, 520, 400], [1240, 690, 560]]} />
);

/** The whole shop at a camera: set, Lộc (behind counter or at the bench), counter, children, near layer, each at its own depth. */
export const Shop: React.FC<{
  t: number;
  id: string;
  cam: [number, number, number];
  loc?: { pose: Pose; atBench?: boolean; held?: React.ReactNode; heldL?: React.ReactNode } | null;
  counter?: Partial<React.ComponentProps<typeof OngLocCounter>>;
  shelf?: boolean;
  shelfClockHeld?: boolean;
  stools?: StoolSpec[];
  kids?: React.ReactNode;
  roll?: number;
  dx?: number;
  dy?: number;
  benchWork?: number;
  cameo?: React.ReactNode; // background detail drawn on the set, behind every character
  focus?: number; // 0 the children, 1 Lộc at the counter, 2 the rear bench
}> = ({ t, id, cam, loc, counter, shelf = false, shelfClockHeld = false, stools = [], kids, roll = 0, dx = 0, dy = 0, benchWork = 0, cameo, focus = 0 }) => {
  // Longer lenses (higher zoom) throw the other planes further out of focus.
  const blur = (depth: number) => Math.abs(depth - focus) * 1.15 * cam[2] * cam[2];
  const hero = loc ? <Hero look={LOOKS.ongLoc} pose={loc.pose} shadow={0} heldProps={{ R: loc.held, L: loc.heldL }} /> : null;
  return (
    <g transform={`translate(${dx} ${dy}) rotate(${roll} 960 540)`}>
      <g transform={camT(...cam)}>
        <DepthBlur id={`${id}Rear`} px={blur(2)} z={cam[2]}>
          <OngLocShop t={t} id={id} veil={0.36} />
          {cameo}
          {loc?.atBench ? hero : null}
          {loc?.atBench ? <BenchFront clockWork={benchWork} /> : null}
          {!loc?.atBench ? <BenchFront clockWork={0} hideClock={false} /> : null}
        </DepthBlur>
        <LampGlow id={`${id}Lamp`} rearBlur={blur(2)} t={t} />
        <DepthBlur id={`${id}Mid`} px={blur(1)} z={cam[2]}>
          {loc && !loc.atBench ? hero : null}
          <OngLocCounter x={COUNTER.x} y={COUNTER.y} w={COUNTER.w} t={t} phoneState="cracked" showPhoto={false} receiptStage="none" showMoney={false} showPouch={false} {...counter} />
        </DepthBlur>
        <DepthBlur id={`${id}Near`} px={blur(0)} z={cam[2]}>
          {shelf ? <DoorShelf clockHeld={shelfClockHeld} /> : null}
          {stools.map((s, i) => (
            <Stool key={i} {...s} />
          ))}
          {kids}
          <OngLocForeground shiftX={0} />
        </DepthBlur>
        <RoomFalloff id={id} />
      </g>
    </g>
  );
};

/** World position of a character's head centre, for framing a close-up on them. */
export const headW = (p: Pose) => {
  const h = joints(p).head;
  return { x: p.x + h.x * p.scale, y: p.y + h.y * p.scale };
};

type View = [number, number, number];
const VOICE = (voiceTimeline as unknown as { voice: { id: string; role: string }[] }).voice;
const speakerOf = (s: number, i: number) => VOICE.find((v) => v.id.startsWith(`${s}.${i}.`) && v.role !== 'narrator')?.role;

/**
 * Coverage for a seated conversation: never one two-shot throughout. Short lines stay wide; on a longer line we cut to the
 * speaker, then to whoever is hearing it, and back if it runs on. Cuts fall on line starts and turns of thought only.
 */
export const coverage = (shot: string, t: number, views: { two: View; duy?: View; thao?: View; loc?: View; me?: View }): { cam: View; focus: number } => {
  const own = MARKS.filter((m) => m.shot === shot).sort((a, b) => a.at - b.at);
  const m = own.find((x) => t >= x.at && t < x.at + x.len);
  const first = own[0] === m;
  let name: keyof typeof views = 'two';
  let from = m?.at ?? t;
  if (m && m.kind === 'line' && !first) {
    const who = speakerOf(m.s, m.i) as keyof typeof views | undefined;
    if (who && views[who] && m.len >= 75) {
      name = who;
      if (m.len >= 120 && t >= m.at + m.len * 0.55) {
        const listener = (who === 'duy' ? 'thao' : who === 'thao' ? 'duy' : 'thao') as keyof typeof views;
        if (views[listener]) { name = listener; from = m.at + m.len * 0.55; }
      }
      if (m.len >= 240 && t >= m.at + m.len * 0.82) { name = who; from = m.at + m.len * 0.82; }
    }
  }
  const v = views[name] ?? views.two;
  const k = clamp((t - from) / 150);
  return { cam: [v[0], v[1], v[2] * (1 + 0.04 * k * (2 - k))], focus: name === 'loc' ? 1 : 0 };
};

// Standing children in C1 (Duy left, Thảo right toward the door, half a step behind his shoulder).
export const DUY_S = 1.12;
export const THAO_S = 0.86;
export const standingKids = (t: number, o: { duyExpr?: Pose['expr']; thaoExpr?: Pose['expr']; thaoX?: number; offerBills?: number; duyHoldsBills?: boolean; clutch?: number } = {}) => {
  let duy = standPose(1080, SHOP_FLOOR - 15, DUY_S, { t, seed: 1, yaw: -0.38, look: -0.4, expr: o.duyExpr ?? 'worried', headTilt: -3 });
  let thao = standPose(o.thaoX ?? 1245, SHOP_FLOOR + 5, THAO_S, { t, seed: 2, yaw: -0.3, look: -0.35, expr: o.thaoExpr ?? 'scared', headTilt: 3 });
  // Thảo's left hand bunches Duy's shirt at his back; Duy's right hand stays near her.
  const clutch = o.clutch ?? 1;
  if (clutch > 0) thao = reach(thao, 'L', { x: duy.x + 34 * DUY_S, y: duy.y - 70 * DUY_S }, clutch);
  duy = reach(duy, 'R', { x: thao.x - 20 * THAO_S, y: thao.y - 95 * THAO_S }, 0.85);
  let thaoHeld: React.ReactNode;
  if (o.offerBills && o.offerBills > 0) {
    thao = reach(thao, 'R', { x: thao.x - 40, y: thao.y - 150 * THAO_S }, o.offerBills);
    thaoHeld = <TwoBills x={0} y={6} />;
  }
  return {
    duy: { pose: duy, held: o.duyHoldsBills ? <TwoBills x={0} y={6} /> : undefined, heldSide: 'R' as const },
    thao: { pose: thao, held: thaoHeld, heldSide: 'R' as const },
  };
};

// Seated children from C2 on: Duy left (x 700), Thảo right (x 900) on a footrest stool; they turn toward each other.
export const seatedKids = (t: number, o: { duyExpr?: Pose['expr']; thaoExpr?: Pose['expr']; duyX?: number; duyLean?: number; thaoLean?: number; touch?: number; sleeve?: number; holdHands?: number; duyYaw?: number; thaoYaw?: number; duyHeadTilt?: number } = {}) => {
  const a = seated(o.duyX ?? 700, SHOP_FLOOR, DUY_S, 1, { t, seed: 1, yaw: o.duyYaw ?? 0.42, look: 0.35, expr: o.duyExpr ?? 'sad', lean: o.duyLean ?? 10, headTilt: -7 + (o.duyHeadTilt ?? 0) }); // offset from the rig's seated default
  const b = seated(930, SHOP_FLOOR + 6, THAO_S, -1, { t, seed: 2, yaw: o.thaoYaw ?? -0.42, look: -0.35, expr: o.thaoExpr ?? 'worried', lean: o.thaoLean ?? 8 }, a.stool.s); // same stool height as Duy's, footrest at her soles
  let duy = a.pose;
  let thao = b.pose;
  if (o.sleeve) thao = reach(thao, 'L', { x: duy.x + 52 * DUY_S, y: duy.y - 78 * DUY_S }, o.sleeve); // Thảo's left hand on Duy's right sleeve
  if (o.touch) duy = reach(duy, 'R', { ...shoulderPt(thao, 'L'), y: shoulderPt(thao, 'L').y + 3 }, o.touch); // Duy's right palm on her left shoulder
  if (o.holdHands) {
    const g = { x: (duy.x + thao.x) / 2, y: Math.max(duy.y, thao.y) - 4 };
    duy = reach(duy, 'R', { x: g.x - 3, y: g.y }, o.holdHands, true);
    thao = reach(thao, 'L', { x: g.x + 3, y: g.y + 2 }, o.holdHands, true);
  }
  return { duy, thao, stools: [a.stool, b.stool] };
};

export const LETTER = 60; // 2:1 picture inside the 1920×1080 frame for C6-A … C7-C
export const Bars: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1920} height={LETTER} fill="#000" />
    <rect x={0} y={1080 - LETTER} width={1920} height={LETTER} fill="#000" />
  </g>
);

/** A child's forearm and hand entering an insert from the bottom of frame, fingertips on `tip` (never a hand alone). */
export const InsertHand: React.FC<{ tip: { x: number; y: number }; who: 'duy' | 'thao'; rot?: number; s?: number }> = ({ tip, who, rot = 0, s }) => {
  const look = LOOKS[who];
  const sc = s ?? (who === 'thao' ? 0.62 : 0.78);
  const a = ((180 + rot) * Math.PI) / 180;
  // ArmHand's fingertips are ~300 units down its local +y; turned 180° they point up the frame.
  const wx = tip.x + Math.sin(a) * 300 * sc;
  const wy = tip.y - Math.cos(a) * 300 * sc;
  return <ArmHand x={wx} y={wy} rot={180 + rot} s={sc} skin={look.skin} sleeve={look.jacket} len={1300} flip={who === 'thao'} />;
};

