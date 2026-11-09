import React from 'react';
import { MeadowFamily, meadowFamilyPoses } from './meadow_family';
import { HomeFront, AuntEatery } from './house_fronts';
import { RoomFalloff, beat, mark, S, smooth, ramp, seated, reach, COUNTER, COUNTER_TOP, LOC_S, LOC_AT_COUNTER, LOC_AT_BENCH, headW, coverage, SHOP_FLOOR, DUY_S, THAO_S, SmallClock, drawKid, Shop, standingKids, seatedKids, Bars, InsertHand } from './staging';
import { Hero } from './actor';
import { Stage, cameraAt, perfClock, RepairClock } from './thu-c1';
import {
  LOOKS,
  standPose,
  poseAt,
  walkPose,
  camT,
  clamp,
  lerp,
  easeOut,
  easeIn,
  ShotProps,
  Pose,
  Dust,
  ArmHand,
  OwlEyeMacro,
  StarryCitySkyline,
  AlleyExteriorScene,
  SunsetRiceField,
  SunsetMeadowForeground,
  OngLocCounterInsert,
  MotherThaoHouse,
  MemoryReceipt,
  SignPen,
  MotherPhone,
  ScrewdriverProp,
  TimeVaultScene,
  ClockCreature,
  MemoryJar,
  ReverseClockwork,
  LightVeil,
  AntiquePortraitCameo,
  CameoJars,
  OngLocShop,
  OngLocCounter,
} from '../../engine';

// Episode 01 storyboard / animatic shots. One shot per source cue (ShC1_A = cue C1-A in DUNG-CANH.md), so the
// trial-code ids no longer drift from the script. Each shot is a pure function of its own clock t; timeline.json
// (built from KICH-BAN.md + cues.json) says which stretch of that clock plays when, and `mark()` finds the frame on
// the shot's clock where a given script line or [NGHỈ] pause starts, so actions sync to words, not hand-typed seconds.

// ============================================================================
// CẢNH 0 — 24 giây mở đầu, không lời
// ============================================================================

export const ShC0_A: React.FC<ShotProps> = ({ t }) => {
  const zoom = lerp(1.0, 1.03, clamp(t / 90));
  return (
    <g transform={camT(960, 420 + ramp(t, 55, 90) * 30, zoom)}>
      <StarryCitySkyline t={t} tiltY={0.04 + ramp(t, 55, 90) * 0.06} showTitle titleOpacity={1} showOwl={false} />
    </g>
  );
};

export const ShC0_B: React.FC<ShotProps> = ({ t }) => {
  const p = clamp(t / 60, 0, 1);
  const tilt = 0.1 + easeOut(p) * 0.66;
  const titleO = clamp(1 - p * 2.2, 0, 1);
  return (
    <g transform={camT(960, 540 + tilt * 140, 1.0 + tilt * 0.12)}>
      <StarryCitySkyline t={t} tiltY={tilt} showTitle={titleO > 0.02} titleOpacity={titleO} showOwl />
    </g>
  );
};

export const ShC0_C: React.FC<ShotProps> = ({ t }) => {
  const blink = t > 12 && t < 22 ? Math.sin(((t - 12) / 10) * Math.PI) : 0;
  return (
    <g transform={camT(960, 540, 1.02)}>
      <OwlEyeMacro w={1920} h={1080} blink={blink} lookX={0.22 + Math.sin(t / 22) * 0.05} lookY={0.26} />
    </g>
  );
};

// Ngõ theo asset mới: không người qua đường.
export const ShC0_D: React.FC<ShotProps> = ({ t }) => {
  const p = easeOut(clamp(t / 90));
  return (
    <g transform={camT(lerp(720, 960, p), 540, lerp(1.28, 1.0, p))}>
      <AlleyExteriorScene t={t} showOwl showPassersby={false} />
    </g>
  );
};

const alleyKids = (t: number, step: number) => {
  const duyX = 1245 + step * 120;
  const thaoX = 1120 + step * 112;
  const walking = step > 0 && step < 1;
  const duy = walking ? walkPose(duyX, t * 0.55, 930, 0.9, { expr: 'determined' }) : standPose(duyX, 930, 0.9, { t, seed: 1, yaw: 0.45, expr: 'worried', look: 0.5, headTilt: -3 });
  let thao = walking ? walkPose(thaoX, t * 0.62 + 1.4, 950, 0.7, { expr: 'worried' }) : standPose(thaoX, 950, 0.7, { t, seed: 2, yaw: 0.38, expr: 'scared', look: 0.4 });
  // Thảo holds the back of Duy's shirt; Duy carries the phone pouch in his far hand.
  thao = reach(thao, 'R', { x: duy.x - 30, y: duy.y - 60 }, walking ? 0.6 : 1);
  return { duy, thao };
};

export const ShC0_E: React.FC<ShotProps> = ({ t }) => {
  const p = easeOut(clamp(t / 90));
  const { duy, thao } = alleyKids(t, 0);
  return (
    <g transform={camT(lerp(1020, 1260, p), 740, lerp(1.0, 1.08, p))}>
      <AlleyExteriorScene t={t} showOwl={false} showPassersby={false} />
      <Hero look={LOOKS.duy} rimId="rimShopWarm" shadow={0.35} pose={duy} />
      <Hero look={LOOKS.thao} rimId="rimStreetlamp" shadow={0.3} pose={thao} />
      <Dust t={t} seed={88} x0={1040} y0={710} w={290} h={250} n={10} o={0.32} />
    </g>
  );
};

export const ShC0_F: React.FC<ShotProps> = ({ t }) => {
  const step = ramp(t, 12, 58); // one beat looking at each other, then they cross the threshold
  const { duy, thao } = alleyKids(t, step);
  return (
    <g transform={camT(1360 + step * 48, 760, 1.12)}>
      <AlleyExteriorScene t={t} showOwl={false} showPassersby={false} />
      <Hero look={LOOKS.duy} rimId="rimShopWarm" shadow={0.35} pose={duy} />
      <Hero look={LOOKS.thao} rimId="rimStreetlamp" shadow={0.3} pose={thao} />
    </g>
  );
};

/** A close-up framed on someone's head, a little low so the head sits in the upper third. */
const closeOn = (p: Pose, z = 2.35): [number, number, number] => { const h = headW(p); return [h.x + 10, h.y + 74, z]; };
/** Inserts creep in; nothing sits perfectly still on a detail the audience is reading. */
const Creep: React.FC<{ t: number; len: number; children: React.ReactNode }> = ({ t, len, children }) => {
  const z = 1 + 0.05 * smooth(t / Math.max(1, len));
  return <g transform={camT(960, 560, z)}>{children}</g>;
};

// ============================================================================
// CẢNH 1 — Thiếu tiền
// ============================================================================

// Seeds for a second viewing (F1–F3): the same portrait and jars return in C9. Faded, part-hidden, never the subject.
const PORTRAIT = <g opacity={0.72}><AntiquePortraitCameo x={1612} y={322} s={1.15} /></g>;
const ShelfJars: React.FC<{ t: number }> = ({ t }) => <g opacity={0.8}><CameoJars x={486} y={262} s={0.62} t={t} /></g>;

/** Everything from the door to the price, on the film's clock: the shots only choose where to look. */
const openingAct = (f: number, t: number) => {
  const [m0, m1, m2, m3, m5, m7, m9] = [0, 1, 2, 3, 5, 7, 9].map((i) => beat(1, i));
  const m4 = beat(1, 4);
  // ---- children
  const shield = ramp(f, m3.f + 10, m3.f + 34);
  const inD = clamp((f - m0.f) / (2.6 * S));
  const duyX = lerp(lerp(1380, 1060, smooth(inD)), 1090, shield);
  const walkingD = inD > 0 && inD < 1;
  const scared = f >= m2.f;
  const duyBase = { t, seed: 1, yaw: walkingD ? -0.8 : -0.36, look: -0.4, expr: (scared ? 'worried' : 'neutral') as Pose['expr'], headTilt: -3 };
  const duy = walkingD ? walkPose(duyX, t * 0.5, SHOP_FLOOR - 15, DUY_S, duyBase, -1) : shield > 0 && shield < 1 ? walkPose(duyX, shield * Math.PI, SHOP_FLOOR - 15, DUY_S, { ...duyBase, yaw: 0.1 }, 1) : standPose(duyX, SHOP_FLOOR - 15, DUY_S, duyBase);
  const inT = clamp((f - m0.f - 20) / (2.8 * S));
  const back = clamp((f - m3.f - 22) / (1.5 * S));
  const thaoX = back > 0 ? lerp(1362, 1218, smooth(back)) : lerp(1500, 1362, smooth(inT));
  const moving = (inT > 0 && inT < 1) || (back > 0 && back < 1);
  const pick = ramp(f, m1.f - 1.5 * S, m1.f - 0.9 * S);
  const putDown = m3.f + 14; // the base meets the shelf, then the fingers let go
  const holding = f >= m1.f - 0.9 * S && f < putDown;
  const startle = f < m2.f ? 0 : Math.sin(clamp((f - m2.f) / 16) * Math.PI);
  const wind = holding ? Math.sin(f * 0.5) * 7 * ramp(f, m1.f - 0.7 * S, m1.f - 0.3 * S) : 0;
  const reachOut = pick * (1 - ramp(f, putDown + 2, putDown + 12));
  const tOpts = {
    t, seed: 2, yaw: back > 0 ? -0.3 : 0.42, look: back > 0 ? -0.35 : 0.5, headTilt: 4 * (1 - back) - 7 * startle,
    expr: (scared ? 'scared' : 'neutral') as Pose['expr'], shoulderLift: 0.8 * startle + (scared ? 0.3 : 0),
  };
  let thao = moving ? walkPose(thaoX, t * 0.6, SHOP_FLOOR + 5, THAO_S, { ...tOpts, yaw: back > 0 ? -0.8 : -0.8 }, -1) : standPose(thaoX, SHOP_FLOOR + 5, THAO_S, tOpts);
  if (!moving && reachOut > 0) thao = { ...thao, armR: { a: lerp(12, -10, reachOut), b: lerp(-4, 110 + wind, reachOut) }, handR: 'hold' };
  // ---- Lộc: repairs at the rear bench until asked, walks to the counter, stays there
  const walkFrom = m5.f - 2.7 * S;
  const walk = clamp((f - walkFrom) / (2.7 * S));
  const scold = f >= m2.f - 8 && f <= m2.f + m2.len + 8;
  const twist = scold || f >= walkFrom ? 0 : Math.sin(t * 0.9);
  let loc: { pose: Pose; atBench: boolean; held?: React.ReactNode; heldL?: React.ReactNode };
  if (f < walkFrom) {
    const p = LOC_AT_BENCH(t, { expr: scold ? 'angry' : 'neutral', headTilt: scold ? 0 : 9, look: scold ? -0.5 : 0, yaw: -0.04 });
    loc = { atBench: true, pose: { ...p, armL: { a: 14, b: -84 }, armR: { a: 40, b: -90 + twist * 7 }, handL: 'hold', handR: 'hold' }, held: <ScrewdriverProp x={0} y={0} s={0.55} rot={196 + twist * 8} />, heldL: <RepairClock f={t} inHand hs={0.8} /> };
  } else if (walk < 1) {
    loc = { atBench: false, pose: walkPose(lerp(1318, 900, smooth(walk)), t * 0.42, lerp(752, COUNTER_TOP + 140 * LOC_S - 12, walk), lerp(1, LOC_S, walk), { expr: 'neutral', yaw: -0.7 }, -1) };
  } else {
    loc = { atBench: false, pose: { ...LOC_AT_COUNTER(900, t, { yaw: 0.14, look: 0.3, expr: 'neutral' }), armL: { a: 10, b: -12 }, armR: { a: 10, b: -12 } } };
  }
  const phoneDown = f >= m4.f + m4.len + 1.2 * S;
  return {
    loc, cast: { duy, thao },
    held: holding ? <SmallClock x={0} y={18} s={0.9} /> : undefined,
    shelfHeld: holding,
    counter: { phoneState: (phoneDown ? 'cracked' : 'none') as 'cracked' | 'none', showMoney: f >= m9.f + 20, showPouch: phoneDown },
    examining: f >= m7.f && f < m7.f + m7.len,
  };
};

const OpeningShop: React.FC<{ f: number; t: number; id: string; cam: [number, number, number]; focus?: number }> = ({ f, t, id, cam, focus = 0 }) => {
  const a = openingAct(f, t);
  return <Shop t={t} id={id} cam={cam} focus={focus} shelf shelfClockHeld={a.shelfHeld} cameo={id === 'c1b' ? PORTRAIT : undefined} loc={a.loc} counter={a.counter} kids={<><Hero pose={a.cast.duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0.32} /><Hero pose={a.cast.thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0.3} heldProps={a.held ? { R: a.held } : undefined} /></>} />;
};

/** C1-A: the master, one barely moving wide: the distance between the customers, the counter and the bench. */
export const ShC1_A: React.FC<ShotProps> = ({ t, f }) => <OpeningShop f={f} t={t} id="c1a" cam={[960 + clamp(t / 900) * 10, 540, 0.96 + clamp(t / 900) * 0.02]} focus={0.4} />;

/** C1-B: Lộc at the rear bench, lamp on half his face; looks up cold, later turns back with the sly smile. */
export const ShC1_B: React.FC<ShotProps> = ({ t, f }) => {
  if (f < beat(1, 14).f) return <OpeningShop f={f} t={t} id="c1b" cam={[1345, 400, 1.9]} focus={2} />; // the scold: half his face in the lamp
  const hint = mark('ShC1_B', 1, 19, 20 * S); // the sly smile comes after the line, never on it
  const smile = ramp(t, hint.at + hint.len - 0.2 * S, hint.at + hint.len + 0.9 * S);
  const lookUp = smile > 0;
  const pose = LOC_AT_BENCH(t, {
    expr: smile > 0.5 ? 'smug' : lookUp ? 'glanceOverGlasses' : 'neutral',
    headTilt: lookUp ? lerp(2, -4, smile) : 12,
    yaw: lerp(-0.2, 0.35, smile),
    look: lerp(-0.1, 0.6, smile),
  });
  const twist = lookUp ? 0 : Math.sin(t * 0.9);
  const worked: Pose = { ...pose, yaw: -0.04, armL: { a: 14, b: -84 }, armR: { a: 40, b: -90 + twist * 7 }, handL: 'hold', handR: lookUp ? 'rest' : 'hold' };
  return (
    <Shop t={t} id="c1b" cam={[1345, 400, 1.9]} focus={2} loc={{ pose: worked, atBench: true, held: lookUp ? undefined : <ScrewdriverProp x={0} y={0} s={0.55} rot={196 + twist * 8} />, heldL: <RepairClock f={t} inHand hs={0.8} /> }} cameo={PORTRAIT} />
  );
};

/** C1-C insert: Duy's hand sets the cracked phone on the cloth, then tips out his 186k on the left. */
export const ShC1_C: React.FC<ShotProps> = ({ t, len }) => {
  const down = ramp(t, 0, 0.8 * S);
  const lift = ramp(t, 1.05 * S, 1.7 * S);
  const look = mark('ShC1_C', 1, 7, 2 * S);
  const u = (t - look.at) / Math.max(1, look.len); // Lộc's two seconds with it: grips, tilts to the crack, presses power, sets it back
  const looking = u >= 0 && u <= 1;
  const tilt = looking ? Math.sin(clamp((u - 0.18) / 0.62) * Math.PI) * 14 : 0;
  const count = mark('ShC1_C', 1, 9, 2 * S).at; // the narrator names Duy's 186k
  const money = ramp(t, count, count + 1.4 * S);
  const handOnPhone = lift < 1;
  return (
    <Creep t={t} len={len}>
      <OngLocCounterInsert t={t} phoneRot={tilt} cracked={1} screenOn={0} playing={0} showPhoto={false} receiptStage="none" showMoney={money > 0.5} showPouch showWallet={false} />
      {looking ? <ArmHand x={lerp(1250, 1040, Math.min(1, u * 5) * Math.min(1, (1 - u) * 5))} y={lerp(300, 505, Math.min(1, u * 5) * Math.min(1, (1 - u) * 5))} rot={-28} s={0.8} skin={LOOKS.ongLoc.skin} sleeve={LOOKS.ongLoc.jacket} len={900} /> : null}
      {handOnPhone ? <InsertHand who="duy" tip={{ x: 960, y: lerp(560, 610, down) + lift * 160 }} rot={-4} /> : null}
      {money > 0 && money < 1 ? <InsertHand who="duy" tip={{ x: 600, y: lerp(980, 840, money) }} rot={-14} /> : null}
    </Creep>
  );
};

/** C1-D: the plea, the screwdriver laid down, the scold, the mockery, her flinch, Duy covering her, Lộc going back to the bench: one performance with its cuts. */
export const ShC1_D: React.FC<ShotProps> = ({ t, f }) => {
  if (f < beat(1, 14).f) return <OpeningShop f={f} t={t} id="c1d" cam={[1250, 640, 1.4]} />; // the shelf: she has it in her hands, then she does not
  const at = (i: number, fallback: number) => mark('ShC1_D', 1, i, fallback);
  const mock = at(18, 8 * S);
  const F = perfClock(t, at(15, 3 * S).at, at(17, 7 * S).at, mock.at, mock.at + mock.len);
  return <Stage f={F} cam={cameraAt(F)} light film />;
};

// ============================================================================
// CẢNH 2 — Cái giá sửa máy
// ============================================================================

/** C2-A: Lộc back at the counter; Duy returns the bills, pockets his money, sets Thảo's stool; both sit. */
export const ShC2_A: React.FC<ShotProps> = ({ t }) => {
  const back = ramp(t, 0, 2.5 * S);
  const lineSeat = 2.5 * S; // once Lộc is back at the counter: Duy returns the bills, then sets her stool
  const handBack = ramp(t, lineSeat, lineSeat + 1.5 * S);
  const go = ramp(t, lineSeat + 1.6 * S, lineSeat + 3.6 * S); // to the stools in front of the counter
  const settle = ramp(t, lineSeat + 3.6 * S, lineSeat + 4.4 * S);
  const locPose = back < 1 ? walkPose(lerp(1180, 900, back), t * 0.5, COUNTER_TOP + 140 * LOC_S - 12, LOC_S, { expr: 'neutral' }, -1) : LOC_AT_COUNTER(900, t, { yaw: 0.15, look: 0.3, expr: 'neutral' });
  const k = seatedKids(t, { duyExpr: 'sad', thaoExpr: 'worried' });
  const room = { id: 'c2a', cam: [960, 540, 0.96] as [number, number, number], cameo: <ShelfJars t={t} />, loc: { pose: locPose } };
  if (go <= 0) {
    const kids = standingKids(t, { thaoExpr: 'worried', duyExpr: 'sad', duyHoldsBills: handBack < 0.5, offerBills: handBack >= 0.5 ? 1 : 0 });
    return <Shop t={t} {...room} counter={{ phoneState: 'cracked', showMoney: handBack < 0.8, showPouch: true }} kids={<>{drawKid(kids.duy, LOOKS.duy)}{drawKid(kids.thao, LOOKS.thao, 'rimStreetlamp')}</>} />;
  }
  const seatX = [k.duy.x, k.thao.x];
  const ground = [SHOP_FLOOR - 15, SHOP_FLOOR + 5];
  const stand = (x: number, g: number, sc: number, seed: number, yaw: number): Pose => standPose(x, g, sc, { t, seed, yaw, expr: seed === 1 ? 'sad' : 'worried', look: yaw });
  const walking = go < 1;
  const dx = lerp(1080, seatX[0], smooth(go));
  const tx = lerp(1245, seatX[1], smooth(go));
  const duyS = walking ? walkPose(dx, t * 0.5, ground[0], DUY_S, { expr: 'sad', yaw: -0.9 }, -1) : stand(dx, ground[0], DUY_S, 1, 0.42);
  const thaoS = walking ? walkPose(tx, t * 0.58, ground[1], THAO_S, { expr: 'worried', yaw: -0.9 }, -1) : stand(tx, ground[1], THAO_S, 2, -0.42);
  const duy = settle > 0 ? poseAt(settle, [{ f: 0, p: duyS }, { f: 1, p: k.duy }]) : duyS;
  const thao = settle > 0 ? poseAt(settle, [{ f: 0, p: thaoS }, { f: 1, p: k.thao }]) : thaoS;
  return <Shop t={t} {...room} counter={{ phoneState: 'cracked', showMoney: false, showPouch: false }} stools={k.stools} kids={<><Hero pose={duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} /><Hero pose={thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>} />;
};

/** C2-B: medium two-shot seated. Duy grips the pen; later Thảo tugs his shirt hem: "Lúc đó em chỉ muốn anh ôm em thôi." */
export const ShC2_B: React.FC<ShotProps> = ({ t }) => {
  const want = mark('ShC2_B', 2, 9, 10 * S); // "Em chỉ muốn anh ôm em thôi."
  const tug = want.at;
  const sleeve = ramp(t, tug, tug + 0.8 * S);
  const pause = want.at + want.len;
  const k = seatedKids(t, { duyExpr: t > pause ? 'tearsHeldBack' : 'sad', thaoExpr: t > tug ? 'tearsHeldBack' : 'worried', sleeve });
  const penDown = t > pause;
  return (
    <Shop
      t={t}
      id="c2b"
      {...coverage('ShC2_B', t, { two: [820, 650, 1.5], duy: closeOn(k.duy), thao: closeOn(k.thao) })}
      loc={{ pose: LOC_AT_COUNTER(900, t, { yaw: 0.1, expr: 'neutral' }) }}
      counter={{ phoneState: 'cracked', showPhoto: true, receiptStage: 'blank', penOnPaper: penDown }}
      stools={k.stools}
      kids={<><Hero pose={k.duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} heldProps={penDown ? undefined : { R: <SignPen x={0} y={4} s={0.6} rot={-60} /> }} /><Hero pose={k.thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>}
    />
  );
};

/** C2-C insert: the photo comes out of the wallet beside the phone; blank G1 slip; pen set down before Lộc holds the edge. */
export const ShC2_C: React.FC<ShotProps> = ({ t, len }) => {
  const photo = ramp(t, 0.3 * S, 1.8 * S);
  const pen = ramp(t, 4 * S, 5 * S);
  return (
    <Creep t={t} len={len}>
      <OngLocCounterInsert t={t} cracked={1} screenOn={0} playing={0} showPhoto={photo > 0.95} photoX={540} receiptStage="blank" penOnPaper={pen < 1} showMoney={false} showPouch={false} showWallet />
      {photo < 0.95 ? <InsertHand who="duy" tip={{ x: lerp(330, 540, photo), y: lerp(760, 560, photo) }} rot={-18} /> : null}
      {pen > 0 && pen < 1 ? <InsertHand who="duy" tip={{ x: 1180, y: 680 + pen * 60 }} rot={-8} /> : null}
      {/* Lộc's fingers pin the slip's top edge once the pen is down (adult hand from the far side) */}
      {pen >= 1 ? <ArmHand x={1360} y={300} rot={0} s={0.8} skin={LOOKS.ongLoc.skin} sleeve={LOOKS.ongLoc.jacket} len={900} /> : null}
    </Creep>
  );
};

// ============================================================================
// CẢNH 3 — Lần thứ nhất
// ============================================================================

/** C3-A: Thảo's hand near, turning the crack toward herself on the cloth (phone never leaves the cloth). */
export const ShC3_A: React.FC<ShotProps> = ({ t }) => {
  const turn = ramp(t, mark('ShC3_A', 3, 1, 3 * S).at, mark('ShC3_A', 3, 1, 3 * S).at + 1.2 * S);
  const rot = lerp(-8, 14, turn);
  const a = (rot * Math.PI) / 180;
  const corner = { x: 960 + Math.cos(a) * 130, y: 600 + Math.sin(a) * 130 };
  return (
    <g>
      <OngLocCounterInsert t={t} phoneRot={rot} cracked={1} screenOn={0} playing={0} showPhoto photoX={520} receiptStage="blank" penOnPaper={false} showMoney={false} showPouch={false} />
      <InsertHand who="thao" tip={corner} rot={18} />
    </g>
  );
};

/** C3-B: two-shot. Duy shifts his stool 10 cm toward her, touches her shoulder; she holds his sleeve; 3 s decision. */
export const ShC3_B: React.FC<ShotProps> = ({ t }) => {
  const scoot = ramp(t, 0.3 * S, 1.3 * S);
  const at = (i: number, f: number) => mark('ShC3_B', 3, i, f * S).at;
  const touch = ramp(t, at(3, 0) + 2 * S, at(3, 0) + 3 * S); // on his apology
  const sleeve = ramp(t, at(9, 40), at(9, 40) + S) * (1 - ramp(t, at(11, 50), at(11, 50) + S)); // holds on at "Thôi anh", lets go in the pause
  const smile = t > at(7, 30) && t < at(8, 35); // remembering how they made up
  const nearer = ramp(t, at(3, 0) + 3.2 * S, at(3, 0) + 4.4 * S);
  const k = seatedKids(t, { duyX: 700 + scoot * 26, duyExpr: smile ? 'smile' : 'sad', thaoExpr: 'tearsHeldBack', touch: touch * (1 - sleeve * 0.0), sleeve, thaoLean: lerp(8, 15, nearer), duyHeadTilt: 7 * (1 - scoot) });
  return (
    <Shop
      t={t}
      id="c3b"
      {...coverage('ShC3_B', t, { two: [830 + Math.sin(t / 180) * 8, 650, 1.5], duy: closeOn(k.duy), thao: closeOn(k.thao) })}
      loc={{ pose: LOC_AT_COUNTER(900, t, { yaw: 0.1, expr: 'neutral' }) }}
      counter={{ phoneState: 'cracked', showPhoto: true, receiptStage: 'blank', penOnPaper: true }}
      stools={k.stools}
      kids={<><Hero pose={k.duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} /><Hero pose={k.thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>}
    />
  );
};

/** C3-C insert: photo already put away; Duy writes the G1 event, Lộc reads it back, Duy signs. */
export const ShC3_C: React.FC<ShotProps> = ({ t, len }) => {
  const write = ramp(t, 0.2 * S, 3.2 * S);
  const last = mark('ShC3_C', 3, 14, 9 * S).at; // signs before Lộc's last "Vẫn đổi?"
  const sign = ramp(t, last - 1.4 * S, last);
  const stage = sign >= 1 ? 'signed' : write > 0.6 ? 'written' : 'blank';
  const penTip = sign > 0 && sign < 1 ? { x: 1380 + sign * 40, y: 640 } : { x: 1300 + write * 90, y: 575 + Math.sin(t / 3) * 3 * (write < 1 ? 1 : 0) };
  const writing = (write > 0 && write < 1) || (sign > 0 && sign < 1);
  return (
    <Creep t={t} len={len}>
      <OngLocCounterInsert t={t} cracked={1} screenOn={0} playing={0} showPhoto={false} receiptStage={stage} penOnPaper={!writing} showMoney={false} showPouch={false} showWallet />
      {writing ? (
        <>
          <SignPen x={penTip.x + 30} y={penTip.y - 34} s={2.1} rot={-58} />
          <InsertHand who="duy" tip={{ x: penTip.x + 60, y: penTip.y - 20 }} rot={-22} />
        </>
      ) : null}
    </Creep>
  );
};

// ============================================================================
// CẢNH 4 — Máy sáng, câu hỏi khác
// ============================================================================

/** C4-A: Lộc repairs at the bench in view (time cut), carries the lit phone back, sets it on the cloth and lets go. */
export const ShC4_A: React.FC<ShotProps> = ({ t }) => {
  const atBench = t < 3 * S;
  const walk = ramp(t, 3 * S, 5.5 * S);
  const lit = t > 2 * S;
  const place = ramp(t, 5.5 * S, 6.4 * S);
  const k = seatedKids(t, { duyExpr: 'worried', thaoExpr: 'worried' });
  const phoneInHand = !atBench && place < 1;
  let pose: Pose;
  if (atBench) pose = LOC_AT_BENCH(t, { expr: 'neutral', headTilt: 12 });
  else if (walk < 1) pose = walkPose(lerp(1180, 900, walk), t * 0.5, COUNTER_TOP + 140 * LOC_S - 12, LOC_S, { expr: 'neutral' }, -1);
  else pose = reach(LOC_AT_COUNTER(900, t, { yaw: 0.1, expr: 'neutral' }), 'R', { x: 895, y: COUNTER_TOP - 10 }, 1 - ramp(t, 6.4 * S, 7.2 * S));
  return (
    <Shop
      t={t}
      id="c4a"
      cam={[1000, 560, 1.15]}
      loc={{ pose, atBench, held: phoneInHand && !atBench ? <MotherPhone x={0} y={10} w={60} rot={80} flat={false} cracked={0} screenOn={1} /> : undefined }}
      benchWork={atBench ? Math.sin(t / 5) * 2 : 0}
      counter={{ phoneState: place >= 1 ? 'repaired' : 'none', receiptStage: 'signed', penOnPaper: false }}
      stools={k.stools}
      kids={<><Hero pose={k.duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} /><Hero pose={k.thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>}
    />
  );
};

/** C4-B: memory check. Thảo asks; Duy shuts his eyes, waits, shakes his head — still knows who he is. */
export const ShC4_B: React.FC<ShotProps> = ({ t }) => {
  const search = mark('ShC4_B', 4, 1, 3 * S); // the 2 s he spends looking for the memory
  const shakeAt = search.at + search.len * 0.65;
  const shut = t > search.at && t < shakeAt;
  const shake = t > shakeAt && t < search.at + search.len ? Math.sin((t - shakeAt) / 4) * 6 : 0;
  const k = seatedKids(t, { duyExpr: t > shakeAt ? 'vacantSearch' : 'sad', thaoExpr: t > 30 * S && t < 50 * S ? 'tearsHeldBack' : 'worried', duyHeadTilt: shake });
  const duy = shut ? { ...k.duy, blink: 1 } : k.duy;
  return (
    <Shop
      t={t}
      id="c4b"
      {...coverage('ShC4_B', t, { two: [820, 650, 1.5], duy: closeOn(k.duy), thao: closeOn(k.thao) })}
      loc={{ pose: LOC_AT_COUNTER(900, t, { yaw: 0.1, expr: 'neutral' }) }}
      counter={{ phoneState: 'repaired', receiptStage: t > 20 * S ? 'none' : 'signed', penOnPaper: false }}
      stools={k.stools}
      kids={<><Hero pose={duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} /><Hero pose={k.thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>}
    />
  );
};

/** C4-C insert: G1 copies pulled apart (not torn), Duy folds his into the wallet, right index taps play; voice from the phone. */
export const ShC4_C: React.FC<ShotProps> = ({ t, len }) => {
  const rec = mark('ShC4_C', 4, 5, 6 * S); // the mother's recording
  const keep = mark('ShC4_C', 4, 4, 0);
  const fold = ramp(t, keep.at + keep.len, keep.at + keep.len + 2 * S);
  const tap = rec.at - 0.6 * S;
  const playing = t >= rec.at && t < rec.at + rec.len ? 1 : 0;
  const pressing = t > tap - 0.5 * S && t < rec.at + 0.3 * S;
  return (
    <Creep t={t} len={len}>
      <OngLocCounterInsert t={t} cracked={0} screenOn={1} playing={playing} showPhoto={false} receiptStage={fold < 0.5 ? 'signed' : 'none'} penOnPaper={false} showMoney={false} showPouch={false} showWallet />
      {fold > 0 && fold < 1 ? <InsertHand who="duy" tip={{ x: lerp(1360, 330, fold), y: lerp(620, 760, fold) }} rot={-10} /> : null}
      {pressing ? <InsertHand who="duy" tip={{ x: 1000, y: t < tap ? 560 : 590 }} rot={-12} /> : null}
    </Creep>
  );
};

/** C4-D: Lộc close at the counter, second cold smirk; eyes don't soften. */
export const ShC4_D: React.FC<ShotProps> = ({ t }) => (
  <Shop t={t} id="c4d" cam={[900, 470, 2.0]} cameo={<ShelfJars t={t} />} loc={{ pose: LOC_AT_COUNTER(900, t, { yaw: 0.05, look: 0.4, expr: t > 0.8 * S ? 'smug' : 'glanceOverGlasses' }) }} counter={{ phoneState: 'repaired' }} />
);

// ============================================================================
// CẢNH 5 — Lần thứ hai
// ============================================================================

/** C5-A: three-shot, Lộc centre-deep. G2 price and that the spoken yes is binding; Duy holds Thảo's hand. Later Lộc leans to Thảo for G3. */
export const ShC5_A: React.FC<ShotProps> = ({ t }) => {
  const hold = ramp(t, mark('ShC5_A', 5, 5, 30 * S).at, mark('ShC5_A', 5, 5, 30 * S).at + S);
  const g3 = t >= 60 * S;
  const k = seatedKids(t, { duyExpr: g3 ? 'exhaustedClinch' : 'determined', thaoExpr: g3 ? 'determinedChild' : 'worried', holdHands: g3 ? 0 : hold, duyHeadTilt: g3 ? 8 : 0 });
  const lean = g3 ? ramp(t, 60 * S, 61.5 * S) : 0;
  const loc = LOC_AT_COUNTER(900 + lean * 20, t, { yaw: lerp(0.1, 0.3, lean), look: lerp(0.2, 0.6, lean), tilt: lean * 14, headTilt: lean * 6, expr: 'neutral' });
  return (
    <Shop t={t} id="c5a" {...coverage('ShC5_A', t, { two: [880, 640, 1.25], duy: closeOn(k.duy), thao: closeOn(k.thao), loc: closeOn(loc, 2.1) })} loc={{ pose: loc }} counter={{ phoneState: 'repaired' }} stools={k.stools} kids={<><Hero pose={k.duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} /><Hero pose={k.thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>} />
  );
};

/** C5-B: the subjective G2 warmth — same room, same stools; Duy drops his shoulders, Thảo leans in and exhales. */
export const ShC5_B: React.FC<ShotProps> = ({ t }) => {
  const ease = ramp(t, 0.5 * S, 3 * S);
  const k = seatedKids(t, { duyExpr: 'relieved', thaoExpr: 'relieved', holdHands: 1, duyLean: lerp(10, 6, ease), thaoLean: lerp(8, 14, ease) });
  const thao = t > mark('ShC5_B', 5, 7, 2 * S).at ? { ...k.thao, blink: 1 } : k.thao;
  return <Shop t={t} id="c5b" cam={[820, 650, 1.5]} loc={{ pose: LOC_AT_COUNTER(900, t, { expr: 'neutral' }) }} counter={{ phoneState: 'repaired' }} stools={k.stools} kids={<><Hero pose={k.duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} /><Hero pose={thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>} />;
};

/** C5-C: Duy close — the weight comes back. Roll 0→+2°→0 and ≤2/1 px sway only in the first 1.6 s of the 2 s pause. */
export const ShC5_C: React.FC<ShotProps> = ({ t }) => {
  const pause = mark('ShC5_C', 5, 8, 0).at;
  const u = (t - pause) / S; // seconds into the pause
  let roll = 0;
  let dx = 0;
  let dy = 0;
  if (u >= 0 && u <= 1.6) {
    roll = u < 0.35 ? 2 * smooth(u / 0.35) : u < 1.1 ? 2 : 2 * (1 - smooth((u - 1.1) / 0.5));
    const env = Math.min(smooth(u / 0.3), 1 - smooth((u - 1.2) / 0.4));
    dx = Math.sin(u * 2 * Math.PI * 1.2) * 2 * env;
    dy = Math.sin(u * 2 * Math.PI * 1.35 + 1) * 1 * env;
  }
  const slump = ramp(t, 0, 2.5 * S);
  const grab = t > mark('ShC5_C', 5, 9, 2 * S).at;
  const k = seatedKids(t, { duyExpr: 'exhaustedClinch', thaoExpr: grab ? 'worried' : 'relieved', duyLean: lerp(10, 16, slump), duyHeadTilt: 8 * slump, sleeve: grab ? 1 : 0 });
  // Duy's left hand grips the stool seat edge.
  const duy = reach(k.duy, 'L', { x: k.stools[0].x - 30 * k.stools[0].s, y: k.stools[0].y - 96 * k.stools[0].s }, slump);
  return <Shop t={t} id="c5c" cam={[760, 640, 2.1]} roll={roll} dx={dx} dy={dy} loc={null} counter={{ phoneState: 'repaired' }} stools={k.stools} kids={<><Hero pose={duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} /><Hero pose={k.thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>} />;
};

/** C5-D: Thảo close; her full "Cháu đồng ý!" first, then Duy lunges "Thảo, đừng…"; one whiteout in the 2 s pause. */
export const ShC5_D: React.FC<ShotProps> = ({ t }) => {
  const stop = mark('ShC5_D', 5, 14, 12 * S).at;
  const pause = mark('ShC5_D', 5, 15, 14 * S).at;
  const lunge = ramp(t, stop, stop + 0.5 * S);
  const white = easeIn(clamp((t - pause) / (0.6 * S)));
  const k = seatedKids(t, { duyExpr: 'shock', thaoExpr: 'determinedChild', duyLean: lerp(12, 20, lunge), duyHeadTilt: 6 });
  const duy = lunge > 0 ? reach(k.duy, 'R', { x: k.thao.x - 30, y: k.thao.y - 70 }, lunge * 0.8) : k.duy;
  return (
    <g>
      <Shop t={t} id="c5d" cam={[870, 650, 2.0]} loc={null} counter={{ phoneState: 'repaired' }} stools={k.stools} kids={<><Hero pose={duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} /><Hero pose={k.thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>} />
      {white > 0 ? <rect width={1920} height={1080} fill="#FFFDF8" opacity={white} /> : null}
    </g>
  );
};

// ============================================================================
// CẢNH 6–7 — Cánh đồng (2:1 suốt từ C6-A tới hết C7-C)
// ============================================================================

const FIELD_GROUND = 830;

/** C6-A: white recedes over the gold field; mother ahead calls them, both hands out. */
export const ShC6_A: React.FC<ShotProps> = ({ t }) => {
  const whiteRecede = clamp(1 - t / (1.4 * S), 0, 1);
  const call = mark('ShC6_A', 6, 0, 1.5 * S).at;
  const open = ramp(t, call, call + S);
  let mom = standPose(960, FIELD_GROUND - 20, 0.9, { t, seed: 9, yaw: -0.05, expr: 'smile', look: 0 });
  mom = reach(reach(mom, 'L', { x: 900, y: mom.y - 30 }, open), 'R', { x: 1020, y: mom.y - 30 }, open);
  // Thảo runs first; Duy stands frozen a beat, then follows. Only on arrival do the hands reach and touch.
  const go = mark('ShC6_A', 6, 2, 3 * S).at;
  const run = clamp((t - go) / (2.4 * S));
  const follow = clamp((t - go - 1.3 * S) / (3 * S));
  const moving = (k: number) => k > 0 && k < 1;
  const thaoX = lerp(1170, 1098, smooth(run));
  const duyX = lerp(760, 836, smooth(follow));
  const thao0 = moving(run) ? walkPose(thaoX, t * 0.62, FIELD_GROUND + 50, 0.74, { expr: 'happy', yaw: -0.8 }, -1) : standPose(thaoX, FIELD_GROUND + 50, 0.74, { t, seed: 2, yaw: -0.5, expr: run >= 1 ? 'happy' : 'surprised', look: -0.5 });
  const duy0 = moving(follow) ? walkPose(duyX, t * 0.4, FIELD_GROUND + 40, 0.95, { expr: 'tearsHeldBack', yaw: 0.8 }, 1) : standPose(duyX, FIELD_GROUND + 40, 0.95, { t, seed: 1, yaw: 0.5, expr: follow >= 1 ? 'tearsHeldBack' : 'shock', look: 0.5 });
  const touchT = ramp(t, go + 2.4 * S, go + 3.1 * S);
  const touchD = ramp(t, go + 4.3 * S, go + 5 * S);
  const kids = [reach(duy0, 'R', { x: 900, y: mom.y - 28 }, touchD), reach(thao0, 'L', { x: 1020, y: mom.y - 28 }, touchT)];
  return (
    <g>
      <g transform={camT(960, 540, 0.96)}>
        <SunsetRiceField t={t} whiteout={whiteRecede} />
        <Hero look={LOOKS.meDuyThao} pose={mom} rimId="rimStreetlamp" />
        <Hero look={LOOKS.duy} pose={kids[0]} rimId="rimStreetlamp" />
        <Hero look={LOOKS.thao} pose={kids[1]} rimId="rimStreetlamp" />
        <SunsetMeadowForeground t={t} shiftX={0} />
      </g>
      <Bars />
    </g>
  );
};

/** C6-B: walking with mother from the front — mother centre, Duy left, Thảo right; real walk cycles, hands joined. */
export const ShC6_B: React.FC<ShotProps> = ({ t }) => {
  const start = mark('ShC6_B', 6, 3, 0).at - 0.5 * S;
  const walk = ramp(t, start, start + 0.5 * S);
  // Distance walked since they set off (not the absolute clock, which would jump them forward); camera stays put so
  // the field's edges never show.
  const drift = Math.max(0, t - start) * 0.9;
  const ph = t * 0.32;
  const momX = 960;
  // Profile walk (toward screen right) keeps feet planted on the path; the camera dollies back with them.
  let mom = walk > 0 ? walkPose(momX + drift, ph, FIELD_GROUND, 0.9, { expr: 'smile', yaw: 0.5 }, 1) : standPose(momX, FIELD_GROUND, 0.9, { t, seed: 9, yaw: 0.1, expr: 'smile' });
  let duy = walk > 0 ? walkPose(momX - 170 + drift, ph + 1.1, FIELD_GROUND + 12, 0.95, { expr: 'smile', yaw: 0.5 }, 1) : standPose(momX - 170, FIELD_GROUND + 12, 0.95, { t, seed: 1, yaw: 0.3, expr: 'tearsHeldBack' });
  let thao = walk > 0 ? walkPose(momX + 150 + drift, ph * 1.15 + 2, FIELD_GROUND + 18, 0.74, { expr: 'happy', yaw: 0.5 }, 1) : standPose(momX + 150, FIELD_GROUND + 18, 0.74, { t, seed: 2, yaw: -0.2, expr: 'happy' });
  // Hands: mother's left in Duy's right, mother's right in Thảo's left (anatomical sides).
  const gl = { x: (mom.x + duy.x) / 2 + 5, y: mom.y + 8 };
  const gr = { x: (mom.x + thao.x) / 2 - 5, y: thao.y - 10 };
  mom = reach(reach(mom, 'L', gl), 'R', gr);
  duy = reach(duy, 'R', gl);
  thao = reach(thao, 'L', gr);
  return (
    <g>
      <g transform={camT(960, 600, 1.05)}>
        <SunsetRiceField t={t} whiteout={0} />
        <Hero look={LOOKS.duy} pose={duy} rimId="rimStreetlamp" />
        <Hero look={LOOKS.meDuyThao} pose={mom} rimId="rimStreetlamp" />
        <Hero look={LOOKS.thao} pose={thao} rimId="rimStreetlamp" />
      </g>
      <g transform={camT(960, 600, 1.05)}>
        <SunsetMeadowForeground t={t} shiftX={0} />
      </g>
      <Bars />
    </g>
  );
};

/** Cuts between the three on the ledge by who is speaking; the wide returns between exchanges. */
const fieldCam = (shot: string, t: number, two: [number, number, number]): [number, number, number] => {
  const { mother, duy, thao } = meadowFamilyPoses(t, false, 1);
  return coverage(shot, t, { two, duy: closeOn(duy, 2.2), thao: closeOn(thao, 2.4), me: closeOn(mother, 2.1) }).cam;
};

/** C6-C: seated on the dry stone ledge of the ditch, thighs on the ledge, knees bent, calves hanging above the water. */
export const ShC6_C: React.FC<ShotProps> = ({ t }) => (
  <g>
    <g transform={camT(...fieldCam('ShC6_C', t, [960, 600, 1.05]))}>
      <SunsetRiceField t={t} seatedBank />
      <MeadowFamily t={t} motherOpacity={1} />
      <SunsetMeadowForeground t={t} />
    </g>
    <Bars />
  </g>
);

/** C6-D: close on the children laughing, mother at the frame edge. */
export const ShC6_D: React.FC<ShotProps> = ({ t }) => (
  <g>
    <g transform={camT(...fieldCam('ShC6_D', t, [940, 690, 2.0]))}>
      <SunsetRiceField t={t} seatedBank />
      <MeadowFamily t={t} motherOpacity={1} />
    </g>
    <Bars />
  </g>
);

/** C7-A: mother's palms on the outer shoulder tops of both children; they lean in. */
export const ShC7_A: React.FC<ShotProps> = ({ t }) => (
  <g>
    <g transform={camT(960, 600, 1.05)}>
      <SunsetRiceField t={t} seatedBank />
      <MeadowFamily t={t} grieving />
      <SunsetMeadowForeground t={t} />
    </g>
    <Bars />
  </g>
);

/** C7-B: mother and Duy, medium close; keep his eyes visible. */
export const ShC7_B: React.FC<ShotProps> = ({ t }) => (
  <g>
    <g transform={camT(...fieldCam('ShC7_B', t, [905, 640, 2.3]))}>
      <SunsetRiceField t={t} seatedBank />
      <MeadowFamily t={t} grieving />
    </g>
    <Bars />
  </g>
);

/**
 * C7-C: the approved farewell (VFX-ME-TAN): clock < 0 holds the embrace under the last lines; 0–4 s soft dissolve;
 * then the 8 s wordless wipe → hand-clasp → push into the hands → gentle fade to dark. No second flash.
 */
export const ShC7_C: React.FC<ShotProps> = ({ t }) => {
  const tt = Math.max(t, -30 * S);
  const close = clamp((tt - 270) / 60);
  const push = close * close * (3 - 2 * close);
  const grip = meadowFamilyPoses(Math.max(tt, 0), true, 0, Math.max(tt, 0)).grip ?? { x: 1035, y: 795 };
  return (
    <g>
      <g transform={camT(lerp(960, grip.x, push), lerp(600, grip.y - 5, push), lerp(1.05, 6.2, push))}>
        <SunsetRiceField t={tt} seatedBank />
        <MeadowFamily t={tt} dissolveT={tt < 0 ? undefined : tt} grieving />
        <SunsetMeadowForeground t={tt} />
      </g>
      <rect width="1920" height="1080" fill="#1e171a" opacity={clamp((tt - 338) / 22)} />
      <Bars />
    </g>
  );
};

// ============================================================================
// CẢNH 8 — Trở về cùng nhau (16:9 ngay khi mở)
// ============================================================================

/** C8-A: open from dark on the same stools, hands still joined; Duy pale and spent. Lộc nods later. */
export const ShC8_A: React.FC<ShotProps> = ({ t }) => {
  const laugh = mark('ShC8_A', 8, 5, 12 * S); // no comfort: he sends them off, then laughs
  const laughing = t >= laugh.at - 0.2 * S;
  const shake = laughing ? Math.sin(t * 0.85) : 0;
  const k = seatedKids(t, { duyExpr: t > 8 * S ? 'tearsHeldBack' : 'exhaustedClinch', thaoExpr: laughing ? 'scared' : 'worried', holdHands: 1, duyLean: 16, duyHeadTilt: 6 });
  const C8_LOC = LOC_AT_COUNTER(1000, t, {});
  return (
    <g>
      <Shop t={t} id="c8a" {...coverage('ShC8_A', t, { two: [880, 640, 1.25], duy: closeOn(k.duy), thao: closeOn(k.thao), loc: closeOn(C8_LOC, 2.1) })} loc={{ pose: LOC_AT_COUNTER(1000, t, { yaw: 0.1, expr: laughing ? 'smug' : 'neutral', headTilt: laughing ? -5 + shake * 2.5 : 0, shoulderLift: laughing ? 0.25 + shake * 0.3 : 0, ...(laughing ? { talk: 0.55 + shake * 0.3, mouthShape: 'a' as const } : {}) }) }} counter={{ phoneState: 'repaired', receiptStage: t > 8 * S ? 'signed' : 'none' }} stools={k.stools} kids={<><Hero pose={k.duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} /><Hero pose={k.thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>} />
      <rect width={1920} height={1080} fill="#1e171a" opacity={1 - clamp(t / 14)} />
    </g>
  );
};

/** C8-B insert: G2 and G3 pushed over; Duy lays G1 from his wallet beside them, then stores all three. */
export const ShC8_B: React.FC<ShotProps> = ({ t, len }) => {
  const g1 = ramp(t, 3.5 * S, 5.5 * S);
  const store = ramp(t, 14.3 * S, 16.8 * S);
  return (
    <Creep t={t} len={len}>
      <OngLocCounterInsert t={t} cracked={0} screenOn={0} playing={0} showPhoto={false} receiptStage="none" penOnPaper={false} showMoney={false} showPouch={false} showWallet />
      {store < 1 ? (
        <g opacity={1 - store}>
          <MemoryReceipt x={1180} y={640} w={250} rot={2} deal="G2" stage="signed" />
          <MemoryReceipt x={1470} y={660} w={250} rot={6} deal="G3" stage="signed" />
          {g1 > 0.5 ? <MemoryReceipt x={890} y={650} w={250} rot={-4} deal="G1" stage="signed" /> : null}
        </g>
      ) : null}
      {g1 > 0 && g1 < 1 ? <InsertHand who="duy" tip={{ x: lerp(330, 890, g1), y: lerp(780, 680, g1) }} rot={-14} /> : null}
      {store > 0 && store < 1 ? <InsertHand who="duy" tip={{ x: lerp(1200, 330, store), y: lerp(680, 780, store) }} rot={-10} /> : null}
    </Creep>
  );
};

/** C8-C: outside the home threshold. Father only as sound / a shadow behind the inner wall; Duy shields Thảo and calls Aunt Hạnh. */
export const ShC8_C: React.FC<ShotProps> = ({ t }) => {
  const stopK = ramp(t, 0.3 * S, 0.9 * S);
  const call = mark('ShC8_C', 8, 7, 5 * S).at;
  const phoneUp = ramp(t, call - 1.5 * S, call - 0.7 * S);
  const exhale = t > mark('ShC8_C', 8, 8, 10 * S).at;
  const zoom = lerp(1.0, 1.35, ramp(t, 5 * S, 8 * S)); // 28 mm wide → 50 mm medium on the call
  let duy = standPose(860, 990, 1.05, { t, seed: 1, yaw: 0.25, look: exhale ? 0.1 : -0.2, expr: exhale ? 'relieved' : 'determined' });
  let thao = standPose(lerp(1040, 966, stopK), 1000, 0.8, { t, seed: 2, yaw: -0.4 + stopK * 0.2, expr: 'scared', look: -0.5 });
  thao = reach(thao, 'L', { x: duy.x + 42, y: duy.y - 24 }, stopK, true); // bunches his shirt at the waist
  if (phoneUp > 0) duy = reach(duy, 'L', { x: duy.x - 20, y: duy.y - 160 * duy.scale }, phoneUp);
  return (
    <g transform={camT(940, lerp(560, 720, ramp(t, 5 * S, 8 * S)), zoom)}>
      {/* House interior seen through the open front door; the children stay outside the sill. */}
      <defs>
        <clipPath id="c8cDoor">
          <rect x={560} y={160} width={800} height={780} />
        </clipPath>
      </defs>
      <HomeFront />
      <g clipPath="url(#c8cDoor)">
        <MotherThaoHouse t={t} id="c8c" showFatherShadow veil={0.66} />
      </g>
      <rect x={520} y={120} width={40} height={830} fill="#2A2420" stroke="#0E0B0A" strokeWidth={3} />
      <rect x={1360} y={120} width={40} height={830} fill="#2A2420" stroke="#0E0B0A" strokeWidth={3} />
      <rect x={520} y={110} width={880} height={50} fill="#2A2420" stroke="#0E0B0A" strokeWidth={3} />
      <rect x={480} y={940} width={960} height={22} fill="#3A332C" stroke="#0E0B0A" strokeWidth={3} />
      <rect x={-200} y={962} width={2400} height={400} fill="#1A202C" />
      <line x1={-200} y1={1010} x2={2200} y2={1010} stroke="#242B39" strokeWidth={5} />
      <ellipse cx={1500} cy={1040} rx={190} ry={18} fill="#2A3445" />
      <Hero look={LOOKS.duy} pose={duy} rimId="rimShopWarm" shadow={0.35} heldProps={phoneUp > 0 ? { L: <MotherPhone x={0} y={0} w={40} rot={90} flat={false} cracked={0} screenOn={1} /> } : undefined} />
      <Hero look={LOOKS.thao} pose={thao} rimId="rimStreetlamp" shadow={0.3} />
      <LightVeil id="c8cFall" o={0.55} lights={[[960, 460, 760]]} />
    </g>
  );
};

/** C8-D: tired, hand in hand toward the lit eatery. Thảo looks up at him, he looks down and holds on; at the door they stop, he lets his breath go, she leans in. */
export const ShC8_D: React.FC<ShotProps> = ({ t }) => {
  const told = mark('ShC8_D', 8, 9, 0);
  const hold = mark('ShC8_D', 8, 10, 11 * S);
  const stopAt = hold.at + 1.4 * S;
  const moved = Math.min(t, stopAt);
  const stopped = t >= stopAt;
  const x = 1640 - moved * 1.25;
  const lookUp = ramp(t, told.at + 2 * S, told.at + 3 * S) * (1 - ramp(t, told.at + 7.5 * S, told.at + 8.5 * S));
  const eased = ramp(t, stopAt, stopAt + 1.2 * S);
  const breath = Math.sin(clamp((t - stopAt) / (1.6 * S)) * Math.PI);
  const ph = t * 0.24;
  const dO = { expr: (eased > 0.4 ? 'relieved' : 'tired') as Pose['expr'], yaw: -0.85, headTilt: 7 * lookUp + 3 * eased };
  const tO = { expr: (eased > 0.4 ? 'relieved' : lookUp > 0.3 ? 'tearsHeldBack' : 'worried') as Pose['expr'], yaw: -0.85, headTilt: -11 * lookUp, look: -0.6 - 0.3 * lookUp };
  let duy = stopped ? standPose(x, 960, 0.92, { t, seed: 1, ...dO, shoulderLift: -0.4 * breath }) : walkPose(x, ph, 960, 0.92, dO, -1);
  let thao = stopped ? standPose(x + 112, 976, 0.72, { t, seed: 2, ...tO, tilt: -7 * eased }) : walkPose(x + 122, ph * 1.12 + 1.5, 976, 0.72, tO, -1);
  const g = { x: (duy.x + thao.x) / 2 + 6, y: duy.y + 30 };
  duy = reach(duy, 'L', g, 1);
  thao = reach(thao, 'R', g, 1);
  return (
    <g transform={camT(lerp(960, 930, clamp(t / 420)), 540, lerp(1.0, 1.05, clamp(t / 420)))}>
      <AuntEatery t={t} wave={ramp(t, stopAt - 0.4 * S, stopAt + 0.6 * S)} />
      <Hero look={LOOKS.duy} rimId="rimShopWarm" shadow={0.35} pose={duy} />
      <Hero look={LOOKS.thao} rimId="rimStreetlamp" shadow={0.3} pose={thao} />
      <LightVeil id="c8dFall" o={0.6} lights={[[680, 640, 880]]} />
    </g>
  );
};

// ============================================================================
// CẢNH 8-E và CẢNH 9 — Tiệm biến mất, nguyên hình và kho lọ (không lời)
// ============================================================================

/** C8-E: same door as the opening. The two come out and leave hand in hand; the camera stays; the shutter comes down and the shop goes. */
export const ShC8_E: React.FC<ShotProps> = ({ t }) => {
  const stay = mark('ShC8_E', 8, 6, 4.2 * S).at; // the written 3 s begins once they have left the frame
  const close = ramp(t, stay + 0.1 * S, stay + 1.3 * S);
  const gone = ramp(t, stay + 1.4 * S, stay + 2.5 * S);
  const wallMark = ramp(t, stay + 2.2 * S, stay + 3.0 * S);
  const walk = clamp(t / stay);
  const x = lerp(1400, 470, walk); // from the threshold of the same door they went in by
  const ph = t * 0.4;
  let duy = walkPose(x, ph, 930, 0.9, { expr: 'tired', yaw: -1 }, -1);
  let thao = walkPose(x + 118, ph * 1.12 + 1.5, 950, 0.7, { expr: 'worried', yaw: -1 }, -1);
  const hold = { x: (duy.x + thao.x) / 2 + 6, y: duy.y + 30 };
  duy = reach(duy, 'L', hold, 1);
  thao = reach(thao, 'R', hold, 1);
  return (
    <g transform={camT(1180, 740, 1.2)}>
      <AlleyExteriorScene t={t} showOwl={false} showPassersby={false} shopClose={close} shopGone={gone} shopMark={wallMark} />
      {walk < 1 ? <Hero look={LOOKS.duy} rimId="rimShopWarm" shadow={0.35} pose={duy} /> : null}
      {walk < 1 ? <Hero look={LOOKS.thao} rimId="rimStreetlamp" shadow={0.3} pose={thao} /> : null}
    </g>
  );
};

const LOC_BARE = { ...LOOKS.ongLoc, glassesDefault: false };
const Spectacles: React.FC<{ x?: number; y?: number; s?: number; rot?: number }> = ({ x = 0, y = 0, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} fill="none" stroke="#1B1412" strokeWidth={3.2}>
    <circle cx={-15} cy={0} r={11} fill="#CFE3E6" fillOpacity={0.28} />
    <circle cx={15} cy={0} r={11} fill="#CFE3E6" fillOpacity={0.28} />
    <path d="M -4 -2 Q 0 -6 4 -2 M -26 -2 L -38 -7 M 26 -2 L 38 -7" />
  </g>
);

// Vault plan: the creature hovers left of centre, three new jars start on a low slab at right and end on the ledge above it.
const VAULT_JARS = [{ kind: 'g1', x: 1170 }, { kind: 'g2', x: 1320 }, { kind: 'g3', x: 1470 }] as const;
const SLAB_Y = 790;
const LEDGE_Y = 520;
const JAR_FOOT = 96; // jar origin to the bottom of its base at s = 1
const JAR_S = 1.25;
const RACK = { x0: 1060, x1: 1580, ledge: LEDGE_Y + JAR_FOOT * JAR_S, slab: SLAB_Y + JAR_FOOT * JAR_S };
type VaultProps = { smirk?: number; lean?: number; creature?: boolean; t: number; cam: [number, number, number]; gaze?: [number, number]; shut?: [number, number, number]; lift?: [number, number, number]; field?: [number, number, number]; focus?: number; bgBlur?: number };
const VaultStage: React.FC<VaultProps> = ({ smirk = 1, lean = 0, creature = true, t, cam, gaze = [0.2, 0.1], shut, lift = [0, 0, 0], field = [0, 0, 0], focus = -1, bgBlur = 0 }) => (
  <g transform={camT(...cam)}>
    <defs>
      <filter id="vaultSoft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={bgBlur} /></filter>
    </defs>
    <g filter={bgBlur > 0 ? 'url(#vaultSoft)' : undefined}>
      <TimeVaultScene t={t} showJars={false} showCreature={false} />
      <ReverseClockwork x={640} y={330} s={1.1} t={t} opacity={0.4} />
      {creature ? <g transform={`rotate(${lean} 840 470)`}><ClockCreature x={840} y={470} s={1.14} t={t} hover eyeGazeX={gaze[0]} eyeGazeY={gaze[1]} smirk={smirk} showJars={false} eyesShut={shut} /></g> : null}
    </g>
    {/* a stone rack: the ledge stands on pillars rising from the slab, so every jar rests on something solid */}
    <rect x={RACK.x0 + 8} y={RACK.ledge} width={36} height={RACK.slab - RACK.ledge} fill="#1F1230" stroke="#8A5A20" strokeWidth={2.5} />
    <rect x={RACK.x1 - 44} y={RACK.ledge} width={36} height={RACK.slab - RACK.ledge} fill="#1F1230" stroke="#8A5A20" strokeWidth={2.5} />
    <rect x={RACK.x0 - 16} y={RACK.slab - 2} width={RACK.x1 - RACK.x0 + 32} height={40} rx={5} fill="#241433" stroke="#D4A24C" strokeWidth={2.8} />
    <rect x={RACK.x0} y={RACK.ledge - 2} width={RACK.x1 - RACK.x0} height={26} rx={4} fill="#2B1A3D" stroke="#D4A24C" strokeWidth={2.5} />
    {VAULT_JARS.map((j, i) => {
      const y = lerp(SLAB_Y, LEDGE_Y, lift[i]);
      return (
        <g key={j.kind}>
          {field[i] > 0.01 ? <ellipse cx={j.x} cy={y + 6} rx={122} ry={168} fill="#2DD4BF" opacity={0.14 * field[i]} stroke="#99F6E4" strokeOpacity={0.75 * field[i]} strokeWidth={2.5} /> : null}
          <MemoryJar x={j.x} y={y} s={JAR_S} kind={j.kind} glow={focus === i ? 1.35 : 0.7} t={t + i * 9} showAura={focus === i} />
        </g>
      );
    })}
  </g>
);

const easeCam = (v: number) => {
  const p = clamp(v);
  return p * p * p * (p * (p * 6 - 15) + 10);
};

const C9A_LEN = 420; // 14 s: zoom into the wall sign, the laugh, the change part by part, then the place changes
const SHOP9 = { x: 900, y: 500 };
const HEAD9 = { x: 926, y: 398 }; // Lộc's head centre at the counter
const VAULT_CAM = { x: 960, y: 500, z: 1.35 };
const prj = (c: { x: number; y: number; z: number }, p: { x: number; y: number }) => ({ x: 960 + (p.x - c.x) * c.z, y: 540 + (p.y - c.y) * c.z });
const zigzag = (y: number) => {
  let d = `M -300 -300 L 2300 -300 L 2300 ${y}`;
  for (let i = 0; i <= 90; i++) d += ` L ${2300 - i * 29} ${y + (i % 2 ? -11 : 11)}`;
  return d + ' Z';
};
const zigzagBelow = (y: number) => {
  let d = `M -300 ${y}`;
  for (let i = 0; i <= 90; i++) d += ` L ${-300 + i * 29} ${y + (i % 2 ? -11 : 11)}`;
  return d + ' L 2300 1500 L -300 1500 Z';
};

/**
 * C9-A. 0–3 s: the camera closes on the sign left on the wall; it fills the frame and we are inside the shop.
 * Lộc laughs wildly; the change then runs top-down, one part at a time, behind a ragged amber seam: eyes, head, arms,
 * body; then it lifts off the floor. Only once it is whole does the vault spread out from it.
 */
export const ShC9_A: React.FC<ShotProps> = ({ t }) => {
  const ZOOM_END = 90;
  if (t < 104) {
    const k = easeCam(t / ZOOM_END);
    const kp = easeCam(t / 66);
    const z = 1.2 * Math.pow(9 / 1.2, k);
    const veil = ramp(t, 80, 98);
    return (
      <g>
        <g transform={camT(lerp(1180, 1580, kp), lerp(740, 432, kp), z)}>
          <AlleyExteriorScene t={t + 1700} showOwl={false} showPassersby={false} shopGone={1} shopMark={1} />
        </g>
        <rect width={1920} height={1080} fill="#1A0E06" opacity={veil} />
      </g>
    );
  }
  const tc = (t - 104) / (C9A_LEN - 104);
  const cam = { x: SHOP9.x, y: SHOP9.y, z: lerp(1.6, 1.74, easeCam(tc * 1.4)) };
  const laugh = ramp(t, 112, 122) * (1 - ramp(t, 196, 206));
  const shake = Math.sin(t * 0.95) * laugh;
  const eyes = ramp(t, 206, 232);
  const wHead = ramp(t, 236, 272);
  const wArms = ramp(t, 278, 314);
  const wBody = ramp(t, 320, 356);
  const hover = ramp(t, 356, 380);
  const env = ramp(t, 372, 414);
  const whole = wBody >= 1;
  const wipeY = whole ? 2400 : 318 + 160 * wHead + 92 * wArms + 80 * wBody;
  const wipeS = prj(cam, { x: 0, y: wipeY }).y;
  const dark = 1 - ramp(t, 104, 122);
  let p = LOC_AT_COUNTER(900, t, {
    yaw: 0.02,
    look: 0,
    headTilt: -13 * laugh + shake * 4 + 0 * eyes,
    tilt: -4 * laugh,
    shoulderLift: 0.45 * laugh + shake * 0.35,
    expr: laugh > 0.1 ? 'smug' : 'neutral',
    ...(laugh > 0.05 ? { talk: 0.78 + 0.22 * Math.sin(t * 0.95), mouthShape: 'a' as const } : {}),
  });
  // Arms hang loose and shake with him: reaching for the counter by IK folds the elbows out like hands on hips.
  p = { ...p, armL: { a: 10 + shake * 5, b: -12 }, armR: { a: 10 - shake * 5, b: -12 } };
  // the creature, in screen space so it can carry from this room into the vault without a cut
  const headS = prj(cam, HEAD9);
  const vaultS = prj(VAULT_CAM, { x: 840, y: 470 });
  const sShop = (lerp(lerp(0.5, 0.62, wHead), 0.78, wBody) + 0.0) * cam.z;
  const lift = hover * 70 * cam.z;
  const e = easeCam(env);
  const cx = lerp(headS.x, vaultS.x, e);
  const cy = lerp(headS.y + 20 - lift, vaultS.y, e);
  const cs = lerp(sShop * (1 + 0.14 * hover), 1.14 * VAULT_CAM.z, e);
  const R = e * 2000;
  const sparks = Array.from({ length: 12 }).map((_, i) => ({ x: ((i * 173 + t * 5) % 1500) + 200, y: wipeS + Math.sin(t * 0.3 + i) * 16 - ((t * 3 + i * 30) % 90) }));
  const seam = wBody < 1 && wHead > 0;
  return (
    <g>
      <g>
        <g transform={camT(cam.x, cam.y, cam.z)}>
          <OngLocShop t={t} id="c9a" veil={0.36} />
          <ShelfJars t={t} />
          <OngLocCounter x={COUNTER.x} y={COUNTER.y} w={COUNTER.w} t={t} phoneState="none" showPhoto={false} receiptStage="none" showMoney={false} showPouch={false} />
          <Spectacles x={872} y={COUNTER_TOP - 2} s={0.95} />
        </g>
        <defs>
          <clipPath id="c9Below"><path d={zigzagBelow(wipeS)} /></clipPath>
          <clipPath id="c9Above"><path d={zigzag(wipeS)} /></clipPath>
          <clipPath id="c9Reveal"><circle cx={cx} cy={cy} r={R} /></clipPath>
        </defs>
        {!whole ? (
          <g transform={camT(cam.x, cam.y, cam.z)}>
            <g clipPath="url(#c9Below)" transform={`translate(${-(cam.x * 0)} 0)`}>
              <Hero look={LOC_BARE} pose={p} shadow={0} />
              {eyes > 0 ? <LocEyesChange x={HEAD9.x} y={HEAD9.y} k={eyes} t={t} /> : null}
            </g>
          </g>
        ) : null}
        <g transform={camT(cam.x, cam.y, cam.z)}><RoomFalloff id="c9a" /></g>
        <rect width={1920} height={1080} fill="#07040D" opacity={0.5 * env} />
        {env > 0 ? (
          <g clipPath="url(#c9Reveal)">
            <VaultStage creature={false} t={t} cam={[VAULT_CAM.x, VAULT_CAM.y, VAULT_CAM.z]} />
          </g>
        ) : null}
        {env > 0 && env < 1 ? (
          <g style={{ mixBlendMode: 'screen' }}>
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="#FFC567" strokeWidth={9} opacity={0.85 * (1 - env * 0.6)} />
            <circle cx={cx} cy={cy} r={R + 14} fill="none" stroke="#2DD4BF" strokeWidth={26} opacity={0.22} />
          </g>
        ) : null}
        <g clipPath={!whole ? 'url(#c9Above)' : undefined}>
          {wHead > 0 ? <g transform={`translate(${cx} ${cy}) scale(${cs})`}><ClockCreature x={0} y={0} s={1} t={t} hover={whole} eyeGazeX={0} eyeGazeY={0} smirk={laugh > 0 ? 1 : 0.6 + 0.4 * wBody} showJars={false} /></g> : null}
        </g>
        {seam ? (
          <g style={{ mixBlendMode: 'screen' }}>
            <path d={`M -300 ${wipeS} ` + Array.from({ length: 90 }).map((_, i) => `L ${-300 + (i + 1) * 29} ${wipeS + (i % 2 ? -11 : 11)}`).join(' ')} fill="none" stroke="#FFC567" strokeWidth={5} opacity={0.95} />
            <path d={`M -300 ${wipeS} ` + Array.from({ length: 90 }).map((_, i) => `L ${-300 + (i + 1) * 29} ${wipeS + (i % 2 ? -11 : 11)}`).join(' ')} fill="none" stroke="#2DD4BF" strokeWidth={16} opacity={0.2} />
            {sparks.map((q, i) => <circle key={i} cx={q.x} cy={q.y} r={2.4 + (i % 3)} fill="#FFE2A6" opacity={0.75} />)}
          </g>
        ) : null}
        <rect width={1920} height={1080} fill="#1A0E06" opacity={dark} />
      </g>
    </g>
  );
};

/** The old man's eyes go amber and a third eye opens in his forehead before anything else changes. */
const LocEyesChange: React.FC<{ x: number; y: number; k: number; t: number }> = ({ x, y, k, t }) => {
  const glow = Math.min(1, k * 2);
  const third = clamp((k - 0.45) / 0.55);
  return (
    <g>
      {[-29, 29].map((dx) => (
        <g key={dx}>
          <ellipse cx={x + dx} cy={y - 4} rx={13} ry={9} fill="#F59E0B" opacity={0.9 * glow} />
          <ellipse cx={x + dx} cy={y - 4} rx={5} ry={2.2} fill="#120603" opacity={glow} />
        </g>
      ))}
      <ellipse cx={x} cy={y - 50} rx={15 * third} ry={Math.max(0.01, 10 * third)} fill="#F59E0B" stroke="#3E2718" strokeWidth={3} opacity={third > 0 ? 1 : 0} />
      <ellipse cx={x} cy={y - 50} rx={5 * third} ry={Math.max(0.01, 2.4 * third)} fill="#120603" />
      <circle cx={x} cy={y - 4} r={70} fill="#FFB65C" opacity={0.1 * glow + Math.sin(t * 0.4) * 0.02} style={{ mixBlendMode: 'screen' }} />
    </g>
  );
};

/** C9-B: the true form, held long enough to take in; then all three eyes travel to the jars. */
export const ShC9_B: React.FC<ShotProps> = ({ t }) => {
  const k = easeCam(t / (7 * S));
  const look = ramp(t, 4 * S, 5.2 * S);
  // It takes in what it has become: eyes open one after another, a slow look about, the grin widening, then the jars.
  const wake = (a: number) => 1 - ramp(t, a, a + 0.5 * S);
  const around = Math.sin(clamp((t - 0.8 * S) / (2.6 * S)) * Math.PI * 2) * (1 - look);
  return <VaultStage t={t + C9A_LEN} cam={[lerp(960, 985, k), lerp(500, 520, k), lerp(1.35, 1.2, k)]} gaze={[lerp(around * 0.9, 1, look), lerp(0, 0.9, look)]} focus={look > 0.5 ? 0 : -1} shut={[wake(0.1 * S), wake(0.3 * S), wake(0.5 * S)]} smirk={lerp(1, 1.3, ramp(t, 2.6 * S, 4 * S))} lean={lerp(around * 2.5, 5, look)} />;
};

/** C9-C: one jar at a time: read it, the field lifts it, it slows, its base touches the ledge, the field goes out. */
export const ShC9_C: React.FC<ShotProps> = ({ t }) => {
  const LEN = 80;
  const lift = [0, 1, 2].map((i) => easeCam((t - (i * LEN + 24)) / 46)) as [number, number, number];
  const field = [0, 1, 2].map((i) => {
    const a = i * LEN + 14;
    return Math.min(ramp(t, a, a + 10), 1 - ramp(t, a + 56, a + 66));
  }) as [number, number, number];
  const focus = Math.min(2, Math.floor(t / LEN));
  const cx = 1170 + 150 * easeCam((t - 66) / 26) + 35 * easeCam((t - 146) / 26); // the last jar stays in frame without passing the set edge
  return <VaultStage t={t + 390} cam={[cx, 660, 1.7]} gaze={[0.75 + focus * 0.13, 0.8 - focus * 0.05]} lift={lift} field={field} focus={focus} bgBlur={3.5} lean={4 + focus * 1.5} smirk={1.2 + Math.max(...field) * 0.15} />;
};

/** C9-D: pulling back from the three jars; sand and hand run backward; the eyes close out of step; the strange light stays. */
export const ShC9_D: React.FC<ShotProps> = ({ t }) => {
  const k = easeCam(t / (5.4 * S));
  const shut: [number, number, number] = [ramp(t, 4.4 * S, 5 * S), ramp(t, 4.9 * S, 5.5 * S), ramp(t, 5.3 * S, 5.9 * S)];
  return (
    <g>
      {/* The work done, it turns its eyes straight out at us, grins, and only then closes them, one at a time. */}
      <VaultStage t={t + 630} cam={[lerp(1355, 960, k), lerp(660, 540, k), lerp(1.7, 1.0, k)]} gaze={[lerp(1, 0, ramp(t, 2 * S, 3.2 * S)), lerp(0.8, 0, ramp(t, 2 * S, 3.2 * S))]} lift={[1, 1, 1]} shut={shut} bgBlur={lerp(3.5, 0, k)} lean={lerp(9, 0, ramp(t, 2 * S, 3.2 * S))} smirk={lerp(1.2, 1.5, ramp(t, 3.2 * S, 4.2 * S))} />
      <rect width={1920} height={1080} fill="#07040D" opacity={clamp((t - 6.2 * S) / (0.8 * S))} />
    </g>
  );
};
