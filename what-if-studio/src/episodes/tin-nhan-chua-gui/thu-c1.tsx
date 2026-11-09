import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { handWorld, LOOKS, standPose, walkPose, sitPose, poseAt, camT, clamp, lerp, Pose, OngLocShop, OngLocCounter, OngLocForeground, ScrewdriverProp, FONT } from '../../engine';
import { RoomFalloff, ramp, reach, COUNTER, COUNTER_TOP, LOC_S, SHOP_FLOOR, DUY_S, THAO_S, BenchFront, DoorShelf, TwoBills } from './staging';
import { Hero } from './actor';
import data from './thu-c1-data.json';

// Test clip for script v12, C1: Thảo offers the two bills → Lộc lays the screwdriver down → "Cất đi" → the sarcastic
// line → Thảo flinches and looks up at Duy → Duy turns, covers her and takes the bills → Lộc goes back to the bench.
// Two cuts of the same performance: ThuC1Tinh (locked camera, for acting) and ThuC1 (cuts, moves, focus, lamp light).
// Frames are on the clip clock; voice placement and mouth envelopes come from thu-c1.json (thu-c1-audio.cjs env).

type Line = { id: string; role: string; f: number; len: number; talk: number[]; shape: number[] };
const LINES = (data as { lines: Line[] }).lines;
/** Film shot clock → performance clock: the three spoken beats land on the real takes, everything between stretches to fit. */
export const perfClock = (t: number, ask: number, scold: number, mock: number, mockEnd: number) => {
  const a: [number, number][] = [[ask, 18], [scold, CAT], [mock, MIA], [mockEnd, MIA_END]];
  if (t <= a[0][0]) return Math.max(0, 18 - (a[0][0] - t));
  for (let i = 0; i < a.length - 1; i++) if (t <= a[i + 1][0]) return Math.round(a[i][1] + ((t - a[i][0]) / Math.max(1, a[i + 1][0] - a[i][0])) * (a[i + 1][1] - a[i][1]));
  return Math.round(MIA_END + (t - mockEnd));
};
export const THU_C1_TOTAL = (data as { total: number }).total;
const SHAPES = ['a', 'e', 'o', 'a', 'u', 'e', 'o'] as const;
const line = (id: string) => LINES.find((l) => l.id === id)!;

/** Mouth for `role` at frame f: open only inside that role's own takes, a new vowel per syllable peak, shut between. */
const mouth = (role: string, f: number): Partial<Pose> => {
  for (const l of LINES) {
    if (l.role !== role || f < l.f || f >= l.f + l.len) continue;
    const i = f - l.f;
    const talk = l.talk[i];
    return talk > 0.06 ? { talk: 0.25 + 0.75 * talk, mouthShape: SHAPES[l.shape[i] % SHAPES.length] } : { talk: 0, mouthShape: 'closed' };
  }
  return { talk: 0, mouthShape: 'auto' }; // listeners keep the expression's own mouth
};
const pulse = (f: number, a: number, peak: number, b: number) => (f < a || f > b ? 0 : f < peak ? ramp(f, a, peak) : 1 - ramp(f, peak, b));

const CAT = line('cat').f; // "Cất đi."
const MIA = line('mia').f; // sarcastic line
const MIA_END = MIA + line('mia').len;

// ---------------------------------------------------------------------------- acting
const LOC_GROUND = COUNTER_TOP + 140 * LOC_S - 12;

/** The clock Lộc is repairing: face open on its movement, back cover and two screws laid beside it. */
const CLOCK = { x: 968, y: COUNTER_TOP + 2 };
const BENCH_CLOCK = { x: 1318, y: 506 }; // on the rear bench top, in front of his seat
export const RepairClock: React.FC<{ f: number; inHand?: boolean; at?: { x: number; y: number; s: number }; hs?: number }> = ({ f, inHand = false, at, hs = 1.3 }) => (
  <g>
    {!inHand && !at ? (
      <g>
        <ellipse cx={1022} cy={COUNTER_TOP - 1} rx={17} ry={5} fill='#8A6A3E' stroke='#120E10' strokeWidth={2} />
        <circle cx={1046} cy={COUNTER_TOP - 2} r={2.2} fill='#C9C2B0' />
        <circle cx={1053} cy={COUNTER_TOP - 1} r={2.2} fill='#C9C2B0' />
      </g>
    ) : null}
    <g transform={inHand ? `scale(${hs})` : at ? `translate(${at.x} ${at.y}) scale(${at.s})` : `translate(${CLOCK.x} ${CLOCK.y}) scale(1.4)`}>
      <rect x={-20} y={-6} width={40} height={6} rx={2} fill='#4A2E22' stroke='#120E10' strokeWidth={2} />
      <circle cx={0} cy={-24} r={18} fill='#C7A15A' stroke='#120E10' strokeWidth={3} />
      <circle cx={0} cy={-24} r={13} fill='#3A2A1C' />
      <g transform={`rotate(${f * 3} -4 -26)`}>
        <circle cx={-4} cy={-26} r={7} fill='none' stroke='#E0B860' strokeWidth={3} strokeDasharray='2.2 1.6' />
      </g>
      <circle cx={6} cy={-19} r={4.5} fill='none' stroke='#D9C9A0' strokeWidth={2} strokeDasharray='1.6 1.2' />
      <circle cx={7} cy={-31} r={1.8} fill='#E9E2D0' />
    </g>
  </g>
);

const locAt = (f: number, film = false): { pose: Pose; atBench: boolean; held?: React.ReactNode; heldL?: React.ReactNode; clockOnCounter?: boolean; benchClock?: boolean } => {
  const m = film ? {} : mouth('loc', f); // in the film actor.tsx drives every mouth from the real takes
  const sit = ramp(f, 528, 548);
  const walk = clamp((f - 452) / (528 - 452));
  if (f >= 452) {
    // Turned away, walks behind the counter to the rear bench (depth: scale and ground recede), then sits.
    const x = lerp(930, 1300, walk);
    const sc = lerp(LOC_S, 1.0, walk);
    const g = lerp(LOC_GROUND, 752, walk);
    const stand = walk < 1 ? walkPose(x, (f - 452) * 0.2, g, sc, { expr: 'neutral', yaw: -0.55, headTilt: 4 }, 1) : standPose(1300, 752, 1.0, { t: f, seed: 3, facing: -1, yaw: -0.3, expr: 'neutral' });
    const seat = sitPose(1318, 532, 1.0, -1, { t: f, seed: 3, yaw: -0.04, lean: 10, expr: f > 572 ? 'glanceOverGlasses' : 'neutral', headTilt: f > 572 ? 1 : 10, look: f > 572 ? 0.5 : -0.1 });
    let pose = sit > 0 ? poseAt(sit, [{ f: 0, p: stand }, { f: 1, p: seat }]) : stand;
    if (sit >= 1) {
      // Back at work: left hand steadies the clock, right hand twists the screwdriver, then both pause for the glance up.
      const pause = ramp(f, 568, 574);
      const twist = Math.sin(f * 0.9) * (1 - pause);
      // Facing screen-left the left arm is the near one: it works the screwdriver; the far right hand steadies the clock.
      // Explicit angles (IK folds the elbows outward this close to the body): left hand holds the clock at his chest,
      // right elbow stays outside the torso so the forearm reads, its hand turns the screwdriver toward the clock.
      pose = { ...pose, armL: { a: 14, b: -84 }, armR: { a: 40, b: -90 + twist * 7 } };
      return {
        pose: { ...pose, ...m, handR: 'hold', handL: 'hold' },
        atBench: true,
        held: <ScrewdriverProp x={0} y={0} s={0.55} rot={196 + twist * 8} />,
        heldL: <RepairClock f={f} inHand hs={0.8} />,
        benchClock: false,
      };
    }
    return { pose: { ...pose, ...m, handR: sit < 0.5 ? 'hold' : pose.handR, handL: sit < 0.5 ? 'hold' : pose.handL }, atBench: sit > 0.5, held: <ScrewdriverProp x={0} y={0} s={0.7} rot={-60} />, heldL: sit < 0.5 ? <RepairClock f={f} inHand /> : undefined, benchClock: sit >= 0.5 };
  }
  // At the counter. Head down on the work, eyes come up to the bills, chin lifts before the scold, leans in to mock.
  const up = ramp(f, 40, 58);
  const chin = ramp(f, 226, 238); // the prep before "Cất đi"
  const jab = pulse(f, CAT + 2, CAT + 7, CAT + 18); // a short forward snap on the accent
  const mock = ramp(f, MIA - 6, MIA + 14) * (1 - ramp(f, MIA_END + 6, MIA_END + 24));
  const nod = pulse(f, MIA + 30, MIA + 38, MIA + 50); // a dip of the chin toward "số tiền đó"
  const turn = ramp(f, 438, 452);
  let p = standPose(lerp(900, 930, turn), LOC_GROUND, LOC_S, {
    t: f,
    seed: 3,
    yaw: lerp(lerp(0.05, 0.18, up), -0.55, turn),
    facing: turn > 0.5 ? -1 : 1,
    look: lerp(-0.1, 0.55, up),
    headTilt: lerp(9, 1, up) - 7 * chin * (1 - mock) + 5 * jab + 6 * mock + 4 * nod,
    tilt: 3 * mock + 2 * jab,
    shoulderLift: 0.25 * chin * (1 - mock) - 0.1 * mock,
    expr: f >= CAT - 8 && f < MIA - 6 ? 'angry' : f >= MIA - 6 && f < 438 ? 'smug' : up > 0.5 ? 'glanceOverGlasses' : 'neutral',
    ...m,
  });
  // Right hand: working the screwdriver on the counter, lays it flat (f 196–207), rests on it, picks it up at 426.
  const down = ramp(f, 196, 207);
  const lift = ramp(f, 426, 440);
  // Turning the screw: quick wrist twists in bursts with a short look between; slower once his eyes are on the bills.
  const burst = Math.max(0, Math.sin(f / 11));
  const twist = Math.sin(f * 0.9) * 14 * burst * (1 - down) * (1 - 0.6 * up);
  const screw = { x: 952 + Math.sin(f * 0.9) * 1.5 * burst * (1 - down), y: COUNTER_TOP - 62 };
  const laid = { x: 1000, y: COUNTER_TOP - 4 };
  const hR = { x: lerp(screw.x, laid.x, down), y: lerp(screw.y, laid.y, down) };
  p = reach(p, 'R', { x: lerp(hR.x, 975, lift), y: lerp(hR.y, COUNTER_TOP - 50, lift) }, 1);
  // Left hand holds the clock steady by its rim; takes it along when he leaves.
  const take = ramp(f, 430, 444);
  p = reach(p, 'L', { x: lerp(835, 925, take), y: lerp(COUNTER_TOP - 6, COUNTER_TOP - 50, take) }, 1); // far hand flat on the counter, outside his body so the arm reads
  return {
    pose: { ...p, handR: 'hold', handL: 'hold' },
    atBench: false,
    held: <ScrewdriverProp x={0} y={0} s={0.7} rot={lerp(lerp(115, 70, down) + twist, 10, lift)} />,
    heldL: f >= 434 ? <RepairClock f={f} inHand /> : undefined,
    clockOnCounter: f < 434,
  };
};

const DUY_X = 1090;
const duyAt = (f: number, film = false): { pose: Pose; held?: React.ReactNode } => {
  const glance = pulse(f, 28, 40, 62); // looks down at the bills she takes out
  const flinch = pulse(f, CAT + 1, CAT + 4, CAT + 14);
  const toHer = ramp(f, 342, 356);
  const step = clamp((f - 360) / 30);
  const back = ramp(f, 432, 452); // eyes back on Lộc as he picks the screwdriver up
  const x = lerp(DUY_X, 1104, step);
  const base = {
    t: f,
    seed: 1,
    yaw: lerp(lerp(-0.38, 0.14, toHer), 0.06, back),
    look: lerp(lerp(-0.4 + 0.7 * glance, 0.55, toHer), -0.5, back),
    headTilt: -3 + 6 * glance - 4 * flinch + 5 * toHer * (1 - back),
    expr: (f >= CAT && f < 300 ? 'determined' : f >= 300 && f < 452 ? 'tearsHeldBack' : f >= 452 ? 'determined' : 'worried') as Pose['expr'],
    shoulderLift: -0.3 * flinch,
    ...(film ? {} : mouth('duy', f)),
  };
  let p = step > 0 && step < 1 ? walkPose(x, step * Math.PI, SHOP_FLOOR - 15, DUY_S, base, 1) : standPose(x, SHOP_FLOOR - 15, DUY_S, base);
  const th = thaoAt(f, film);
  // Right hand: near her shoulder, then cups her hand on the bills (396–416), keeps them low at his side.
  const cup = ramp(f, 394, 414);
  const keep = ramp(f, 422, 440);
  const handPt = handWorld(th.pose, 'L');
  const rest = { x: th.pose.x - 20 * THAO_S, y: th.pose.y - 95 * THAO_S };
  const target = keep > 0 ? { x: lerp(handPt.x, x + 30, keep), y: lerp(handPt.y, p.y + 30, keep) } : { x: lerp(rest.x, handPt.x + 4, cup), y: lerp(rest.y, handPt.y - 2, cup) };
  p = reach(p, 'R', target, 0.9);
  return { pose: { ...p, handR: f >= 412 ? 'pinch' : p.handR }, held: f >= 418 ? <TwoBills x={0} y={6} /> : undefined };
};

const THAO_X = 1218;
// Her near (left) arm by explicit shoulder/elbow angles: the IK picks a folded elbow this close to the body.
// pocket → offered toward Lộc → sinks as her voice drops → snatched to her stomach → given into Duy's palm → grips her bag strap.
const ARM = { pocket: { a: 12, b: -4 }, offer: { a: 74, b: 12 }, low: { a: 52, b: 22 }, hold: { a: -6, b: 128 }, strap: { a: 0, b: 110 } };
const mixArm = (A: Pose['armL'], B: Pose['armL'], k: number) => ({ a: lerp(A.a, B.a, k), b: lerp(A.b, B.b, k) });
const thaoArm = (f: number) => {
  let arm = mixArm(ARM.pocket, ARM.offer, ramp(f, 0, 24));
  arm = mixArm(arm, ARM.low, ramp(f, 150, 190));
  arm = mixArm(arm, ARM.hold, ramp(f, CAT + 1, CAT + 10));
  return mixArm(arm, ARM.strap, ramp(f, 418, 434));
};

const thaoAt = (f: number, film = false): { pose: Pose; held?: React.ReactNode } => {
  const plead = ramp(f, 20, 60) * (1 - ramp(f, 150, 190)); // leans in to ask, shrinks as her voice drops
  const shrink = ramp(f, 140, 190);
  const tap = pulse(f, 207, 209, 218); // small flinch at the screwdriver
  const startle = pulse(f, CAT + 1, CAT + 4, CAT + 16);
  const lookUp = ramp(f, 326, 342) * (1 - ramp(f, 430, 444) * 0.6);
  const press = ramp(f, 404, 430); // presses into Duy after letting go
  const welling = f >= MIA + 14;
  let p = standPose(THAO_X, SHOP_FLOOR + 5, THAO_S, {
    t: f,
    seed: 2,
    yaw: lerp(-0.3, -0.62, lookUp), // turns to Duy in a clear 3/4
    look: lerp(lerp(-0.35, -0.6, lookUp), -0.2, press * 0.5),
    headTilt: 3 - 4 * plead + 7 * shrink * (1 - lookUp) - 6 * startle - 14 * lookUp + 5 * press,
    tilt: -3 * plead - 2 * startle - 7 * press,
    squash: -0.05 * startle,
    shoulderLift: 0.35 * shrink + 0.9 * startle + 0.5 * tap + 0.45 * (f > CAT ? 1 : 0) * (1 - press * 0.4),
    expr: f < CAT ? (shrink > 0.5 ? 'sad' : 'worried') : welling ? 'tearsHeldBack' : 'scared',
    lipTremble: welling ? Math.sin(f * 1.7) * 0.7 : 0,
    ...(film ? {} : mouth('thao', f)),
  });
  // Far arm hangs behind her body (a clutching far hand would draw over Duy); the near arm carries the bills.
  p = { ...p, armL: thaoArm(f) };
  return { pose: { ...p, handL: 'hold' }, held: f < 418 ? <TwoBills x={0} y={6} /> : undefined };
};
const duyX = (f: number) => lerp(DUY_X, 1104, clamp((f - 360) / 30));

// ---------------------------------------------------------------------------- camera, focus, light
type Cam = { cx: number; cy: number; z: number; focus: number }; // focus: 0 children, 1 counter/Lộc, 2 rear bench
const ease = (v: number) => {
  const p = clamp(v);
  return p * p * p * (p * (p * 6 - 15) + 10); // smootherstep: gentle start, carried middle, soft landing
};
const mix = (a: Cam, b: Cam, k: number): Cam => ({ cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), z: lerp(a.z, b.z, k), focus: lerp(a.focus, b.focus, k) });

const STATIC: Cam = { cx: 1015, cy: 600, z: 1.36, focus: 0.5 };
/** Cuts on action/look: wide → Lộc close on the chin lift → Thảo close under the mockery → follow her eyes to Duy → wide as Lộc picks up the tool → bench. */
export const cameraAt = (f: number): Cam => {
  if (f < 54) return { ...mix({ cx: 945, cy: 575, z: 2.5, focus: 1 }, { cx: 945, cy: 570, z: 2.6, focus: 1 }, ease(f / 54)) }; // close on the hands at work
  if (f < 232) {
    const k = ease((f - 54) / 178);
    const c = mix({ cx: 1050, cy: 610, z: 1.26, focus: 0 }, { cx: 1035, cy: 595, z: 1.36, focus: 0 }, k);
    return { ...c, focus: lerp(0, 1, ease((f - 192) / 26)) }; // attention to Lộc's hand and face as he lays the tool down
  }
  if (f < 300) return { cx: 915, cy: 455, z: 2.35, focus: 1 };
  if (f < 426) {
    const close: Cam = { cx: 1196, cy: 660, z: 2.55, focus: 0 };
    const two: Cam = { cx: 1150, cy: 640, z: 1.95, focus: 0 };
    return mix(close, two, ease((f - 338) / 64)); // starts with her look, lands as his hand reaches hers
  }
  if (f < 548) {
    const c = mix({ cx: 1090, cy: 585, z: 1.2, focus: 0 }, { cx: 1120, cy: 570, z: 1.24, focus: 0 }, ease((f - 426) / 122));
    return { ...c, focus: lerp(0, 2, ease((f - 470) / 60)) };
  }
  return { cx: 1120, cy: 570, z: 1.24, focus: 2 };
};

/** Defocus in screen pixels for a layer at `depth`; longer lenses (zoom) give shallower focus. */
const blurPx = (cam: Cam, depth: number) => Math.abs(depth - cam.focus) * 2.6 * cam.z;
const Blur: React.FC<{ id: string; px: number; z: number; children: React.ReactNode }> = ({ id, px, z, children }) =>
  px < 0.35 ? (
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

const LAMP = { x: 1192, y: 452 }; // rear bench lamp bulb (world)
/** Warm practical light: bloom around the bench lamp, out-of-focus highlights on the clock glass when the rear is soft. */
const LampLight: React.FC<{ bgBlur: number; f: number }> = ({ bgBlur, f }) => {
  const bokeh = clamp(bgBlur / 7);
  const flick = 1 + Math.sin(f * 0.37) * 0.015;
  const spots: [number, number, number][] = [
    [470, 300, 18], [560, 250, 14], [640, 330, 20], [760, 280, 12], [1500, 330, 16], [1430, 260, 12], [1560, 420, 20], [1110, 300, 14],
  ];
  return (
    <g style={{ mixBlendMode: 'screen' }} pointerEvents="none">
      <defs>
        <radialGradient id="thuLampBloom">
          <stop offset="0%" stopColor="#FFE2A6" stopOpacity={0.85} />
          <stop offset="18%" stopColor="#FFB45C" stopOpacity={0.42} />
          <stop offset="55%" stopColor="#E07A2E" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#E07A2E" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="thuBokeh">
          <stop offset="0%" stopColor="#FFD08A" stopOpacity={0.5} />
          <stop offset="80%" stopColor="#FFC070" stopOpacity={0.32} />
          <stop offset="100%" stopColor="#FFC070" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={LAMP.x} cy={LAMP.y} rx={420 * flick} ry={330 * flick} fill="url(#thuLampBloom)" opacity={0.75} />
      <ellipse cx={LAMP.x - 60} cy={LAMP.y + 230} rx={520} ry={150} fill="url(#thuLampBloom)" opacity={0.35} />
      {bokeh > 0.02 ? spots.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r * (1 + bokeh * 1.6)} fill="url(#thuBokeh)" opacity={bokeh * (0.55 + 0.25 * Math.sin(f * 0.05 + i))} />) : null}
    </g>
  );
};

/** Screen-space finish: warm lamp grade, a soft orange wash from the lamp side and a dark warm vignette, as in the reference still. */
const Finish: React.FC = () => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <defs>
      <radialGradient id="thuVig" cx="52%" cy="46%" r="72%">
        <stop offset="55%" stopColor="#1A0B05" stopOpacity={0} />
        <stop offset="100%" stopColor="#140804" stopOpacity={0.72} />
      </radialGradient>
      <linearGradient id="thuWash" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF9A4A" stopOpacity={0.1} />
        <stop offset="100%" stopColor="#3A1A10" stopOpacity={0.12} />
      </linearGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#thuWash)" style={{ mixBlendMode: 'soft-light' }} />
    <rect width={1920} height={1080} fill="url(#thuVig)" />
  </svg>
);

// ---------------------------------------------------------------------------- the stage
export const Stage: React.FC<{ f: number; cam: Cam; light: boolean; film?: boolean }> = ({ f, cam, light, film = false }) => {
  const loc = locAt(f, film);
  const duy = duyAt(f, film);
  const thao = thaoAt(f, film);
  const bg = light ? blurPx(cam, 2) : 0;
  const mid = light ? blurPx(cam, 1) : 0;
  const fg = light ? blurPx(cam, 0) : 0;
  const lochero = <Hero look={LOOKS.ongLoc} pose={loc.pose} shadow={0} handLayer={loc.atBench ? 'defer' : 'normal'} heldProps={{ R: loc.held, L: loc.heldL }} />;
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <g transform={camT(cam.cx, cam.cy, cam.z)}>
        <Blur id="thuBg" px={bg} z={cam.z}>
          <OngLocShop t={f} id="thu" veil={0.36} />
          {loc.benchClock ? <RepairClock f={f} at={{ ...BENCH_CLOCK, s: 0.9 }} /> : null}
          {loc.atBench ? lochero : null}
          {loc.atBench ? <Hero look={LOOKS.ongLoc} pose={loc.pose} shadow={0} handLayer="only" heldProps={{ R: loc.held, L: loc.heldL }} /> : null}
          <BenchFront hideClock />
        </Blur>
        {light ? <LampLight bgBlur={bg} f={f} /> : null}
        <Blur id="thuMid" px={mid} z={cam.z}>
          {!loc.atBench ? lochero : null}
          <OngLocCounter x={COUNTER.x} y={COUNTER.y} w={COUNTER.w} t={f} phoneState="cracked" showPhoto={false} receiptStage="none" showMoney={false} showPouch />
          {loc.clockOnCounter ? <RepairClock f={loc.clockOnCounter && f < 196 ? f : 196} /> : null}
        </Blur>
        <Blur id="thuFg" px={fg} z={cam.z}>
          <DoorShelf clockHeld={false} />
          <Hero pose={duy.pose} look={LOOKS.duy} rimId="rimShopWarm" shadow={0.32} heldProps={duy.held ? { R: duy.held } : undefined} />
          <Hero pose={thao.pose} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0.3} heldProps={thao.held ? { L: thao.held } : undefined} />
          <OngLocForeground shiftX={0} />
        </Blur>
        <RoomFalloff id="thu" />
      </g>
    </svg>
  );
};

const GRADE = 'contrast(1.15) sepia(0.22) saturate(1.12) brightness(0.97)'; // shopMystery at full level

const Tag: React.FC<{ f: number; label: string }> = ({ f, label }) => (
  <div style={{ position: 'absolute', top: 18, left: 22, padding: '4px 12px', borderRadius: 6, background: 'rgba(0,0,0,.55)', color: '#F6E6B4', fontFamily: FONT.ui, fontSize: 26 }}>
    THỬ C1 · kịch bản 12 · {label} · {(f / 30).toFixed(1)} s
  </div>
);

export const ThuC1Tinh: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#0E0C1E' }}>
      <AbsoluteFill style={{ filter: GRADE }}>
        <Stage f={f} cam={STATIC} light={false} />
      </AbsoluteFill>
      <Tag f={f} label="máy tĩnh, duyệt diễn" />
    </AbsoluteFill>
  );
};

export const ThuC1: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#0E0C1E' }}>
      <AbsoluteFill style={{ filter: GRADE }}>
        <Stage f={f} cam={cameraAt(f)} light />
      </AbsoluteFill>
      <Finish />
      <Tag f={f} label="góc máy + nét + ánh đèn" />
    </AbsoluteFill>
  );
};
