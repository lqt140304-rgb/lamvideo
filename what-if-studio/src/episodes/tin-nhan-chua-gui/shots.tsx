import React from 'react';
import { MeadowFamily, meadowFamilyPoses } from './meadow_family';
import { mark, S, smooth, ramp, seated, reach, COUNTER_TOP, LOC_S, LOC_AT_COUNTER, LOC_AT_BENCH, SmallClock, drawKid, Shop, standingKids, seatedKids, Bars, InsertHand } from './staging';
import {
  Hero,
  LOOKS,
  standPose,
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
} from '../../engine';

// Episode 01 storyboard / animatic shots. One shot per source cue (ShC1_A = cue C1-A in DUNG-CANH.md), so the
// trial-code ids no longer drift from the script. Each shot is a pure function of its own clock t; timeline.json
// (built from KICH-BAN.md + cues.json) says which stretch of that clock plays when, and `mark()` finds the frame on
// the shot's clock where a given script line or [NGHỈ] pause starts, so actions sync to words, not hand-typed seconds.

// ============================================================================
// CẢNH 0 — 24 giây mở đầu, không lời
// ============================================================================

export const ShC0_A: React.FC<ShotProps> = ({ t }) => {
  const zoom = lerp(1.0, 1.03, clamp(t / 120));
  return (
    <g transform={camT(960, 420 + ramp(t, 80, 120) * 30, zoom)}>
      <StarryCitySkyline t={t} tiltY={0.04 + ramp(t, 80, 120) * 0.06} showTitle titleOpacity={1} showOwl={false} />
    </g>
  );
};

export const ShC0_B: React.FC<ShotProps> = ({ t }) => {
  const p = clamp(t / 120, 0, 1);
  const tilt = 0.1 + easeOut(p) * 0.66;
  const titleO = clamp(1 - p * 2.2, 0, 1);
  return (
    <g transform={camT(960, 540 + tilt * 140, 1.0 + tilt * 0.12)}>
      <StarryCitySkyline t={t} tiltY={tilt} showTitle={titleO > 0.02} titleOpacity={titleO} showOwl />
    </g>
  );
};

export const ShC0_C: React.FC<ShotProps> = ({ t }) => {
  const blink = t > 34 && t < 44 ? Math.sin(((t - 34) / 10) * Math.PI) : 0;
  return (
    <g transform={camT(960, 540, 1.02)}>
      <OwlEyeMacro w={1920} h={1080} blink={blink} lookX={0.22 + Math.sin(t / 22) * 0.05} lookY={0.26} />
    </g>
  );
};

// Ngõ theo asset mới: không người qua đường.
export const ShC0_D: React.FC<ShotProps> = ({ t }) => {
  const p = easeOut(clamp(t / 180));
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
  const p = easeOut(clamp(t / 150));
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
  const step = ramp(t, 24, 84); // one beat looking at each other, then they cross the threshold
  const { duy, thao } = alleyKids(t, step);
  return (
    <g transform={camT(1360 + step * 48, 760, 1.12)}>
      <AlleyExteriorScene t={t} showOwl={false} showPassersby={false} />
      <Hero look={LOOKS.duy} rimId="rimShopWarm" shadow={0.35} pose={duy} />
      <Hero look={LOOKS.thao} rimId="rimStreetlamp" shadow={0.3} pose={thao} />
    </g>
  );
};

// ============================================================================
// CẢNH 1 — Thiếu tiền
// ============================================================================

/** Lộc's path in C1-A: bench (t<10s) → counter (≈14s) … screwdriver down (100s) … back to bench (140–143s). */
const locC1 = (t: number) => {
  const toCounter = ramp(t, 10 * S, 14 * S);
  const toBench = ramp(t, 140 * S, 143 * S);
  if (toBench >= 1 || toCounter <= 0) return { pose: LOC_AT_BENCH(t, { expr: 'neutral', headTilt: 10 }), atBench: true };
  const away = toBench > 0;
  const k = away ? toBench : toCounter;
  if (k < 1) {
    // Walking between bench and counter behind the counter line.
    const x = away ? lerp(900, 1180, k) : lerp(1180, 900, k);
    return { pose: walkPose(x, t * 0.5, COUNTER_TOP + 140 * LOC_S - 12, LOC_S, { expr: 'neutral' }, away ? 1 : -1), atBench: false };
  }
  const tap = ramp(t, 100 * S, 100.5 * S) * (1 - ramp(t, 112 * S, 113 * S)); // screwdriver put down flat, hand still on it
  let p = LOC_AT_COUNTER(900, t, { yaw: 0.1, look: 0.35, expr: t > 108 * S ? 'smug' : 'neutral' });
  if (tap > 0) p = reach(p, 'R', { x: 980, y: COUNTER_TOP - 4 }, tap);
  return { pose: p, atBench: false, held: tap > 0 ? <ScrewdriverProp x={0} y={0} s={0.7} rot={70} /> : undefined };
};

export const ShC1_A: React.FC<ShotProps> = ({ t }) => {
  const putBack = ramp(t, 0, 1.4 * S); // clock goes back on the shelf, then she steps behind Duy
  const tuck = ramp(t, 1.6 * S, 3.2 * S);
  const kids = standingKids(t, { thaoX: lerp(1335, 1245, tuck), clutch: tuck, thaoExpr: 'scared', duyExpr: 'worried' });
  let thao = kids.thao.pose;
  if (putBack < 1) thao = reach({ ...thao, yaw: 0.4, facing: 1 }, 'R', { x: 1440, y: 790 + putBack * 12 }, 1);
  const loc = locC1(t);
  const phoneDown = t > 40 * S;
  return (
    <Shop
      t={t}
      id="c1a"
      cam={[960, 540, 0.96]}
      loc={loc}
      benchWork={Math.sin(t / 9)}
      counter={{ phoneState: phoneDown ? 'cracked' : 'none', showMoney: t > 45 * S, showPouch: phoneDown }}
      shelf
      shelfClockHeld={putBack < 1}
      kids={
        <>
          {drawKid(kids.duy, LOOKS.duy)}
          <Hero pose={thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0.3} heldProps={putBack < 1 ? { R: <SmallClock x={0} y={18} s={0.9} /> } : undefined} />
        </>
      }
    />
  );
};

/** C1-B: Lộc at the rear bench, lamp on half his face; looks up cold, later turns back with the sly smile. */
export const ShC1_B: React.FC<ShotProps> = ({ t }) => {
  const smile = ramp(t, 24 * S, 25.2 * S);
  const lookUp = t < 8 * S || smile > 0;
  const pose = LOC_AT_BENCH(t, {
    expr: smile > 0.5 ? 'smug' : lookUp ? 'glanceOverGlasses' : 'neutral',
    headTilt: lookUp ? lerp(2, -4, smile) : 12,
    yaw: lerp(-0.2, 0.35, smile),
    look: lerp(-0.1, 0.6, smile),
  });
  return (
    <Shop t={t} id="c1b" cam={[1365, 470, 1.9]} loc={{ pose, atBench: true }} benchWork={lookUp ? 0 : Math.sin(t / 9)} />
  );
};

/** C1-C insert: Duy's hand sets the cracked phone on the cloth, then tips out his 186k on the left. */
export const ShC1_C: React.FC<ShotProps> = ({ t }) => {
  const down = ramp(t, 0, 1.2 * S);
  const lift = ramp(t, 1.8 * S, 2.6 * S);
  const money = ramp(t, 7 * S, 8.4 * S);
  const handOnPhone = lift < 1;
  return (
    <g>
      <OngLocCounterInsert t={t} cracked={1} screenOn={0} playing={0} showPhoto={false} receiptStage="none" showMoney={money > 0.5} showPouch showWallet={false} />
      {handOnPhone ? <InsertHand who="duy" tip={{ x: 960, y: lerp(560, 610, down) + lift * 160 }} rot={-4} /> : null}
      {money > 0 && money < 1 ? <InsertHand who="duy" tip={{ x: 600, y: lerp(980, 840, money) }} rot={-14} /> : null}
    </g>
  );
};

/** C1-D: the children medium. Before the scolding Thảo offers two bills; after it her eyes fill and Duy holds the bills. */
export const ShC1_D: React.FC<ShotProps> = ({ t }) => {
  const after = t >= 30 * S;
  const offer = after ? 0 : ramp(t, 9 * S, 10.5 * S);
  const kids = standingKids(t, {
    thaoExpr: after ? 'tearsHeldBack' : offer > 0 ? 'worried' : 'scared',
    duyExpr: after ? 'tearsHeldBack' : 'worried',
    offerBills: offer,
    duyHoldsBills: after,
    clutch: 1,
  });
  return <Shop t={t} id="c1d" cam={[1150, 640, 1.75]} loc={{ pose: LOC_AT_COUNTER(900, t, { yaw: 0.2, look: 0.4, expr: 'neutral' }) }} kids={<>{drawKid(kids.duy, LOOKS.duy)}{drawKid(kids.thao, LOOKS.thao, 'rimStreetlamp')}</>} />;
};

// ============================================================================
// CẢNH 2 — Cái giá sửa máy
// ============================================================================

/** C2-A: Lộc back at the counter; Duy returns the bills, pockets his money, sets Thảo's stool; both sit. */
export const ShC2_A: React.FC<ShotProps> = ({ t }) => {
  const back = ramp(t, 0, 2.5 * S);
  const lineSeat = mark('ShC2_A', 2, 4, 20 * S).at; // "Duy đưa lại tiền cho em … kéo ghế cho Thảo"
  const handBack = ramp(t, lineSeat, lineSeat + 1.5 * S);
  const sit = t > lineSeat + 4.5 * S;
  const locPose = back < 1 ? walkPose(lerp(1180, 900, back), t * 0.5, COUNTER_TOP + 140 * LOC_S - 12, LOC_S, { expr: 'neutral' }, -1) : LOC_AT_COUNTER(900, t, { yaw: 0.15, look: 0.3, expr: 'neutral' });
  if (!sit) {
    const kids = standingKids(t, { thaoExpr: 'worried', duyExpr: 'sad', duyHoldsBills: handBack < 0.5, offerBills: handBack >= 0.5 ? 1 : 0 });
    return <Shop t={t} id="c2a" cam={[960, 540, 0.96]} loc={{ pose: locPose }} counter={{ phoneState: 'cracked', showMoney: handBack < 0.8, showPouch: true }} kids={<>{drawKid(kids.duy, LOOKS.duy)}{drawKid(kids.thao, LOOKS.thao, 'rimStreetlamp')}</>} />;
  }
  const k = seatedKids(t, { duyExpr: 'sad', thaoExpr: 'worried' });
  return <Shop t={t} id="c2a" cam={[960, 540, 0.96]} loc={{ pose: locPose }} counter={{ phoneState: 'cracked', showMoney: false, showPouch: false }} stools={k.stools} kids={<><Hero pose={k.duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} /><Hero pose={k.thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>} />;
};

/** C2-B: medium two-shot seated. Duy grips the pen; later Thảo tugs his shirt hem: "Lúc đó em chỉ muốn anh ôm em thôi." */
export const ShC2_B: React.FC<ShotProps> = ({ t }) => {
  const tug = mark('ShC2_B', 2, 13, 40 * S).at;
  const sleeve = ramp(t, tug, tug + 0.8 * S);
  const pause = mark('ShC2_B', 2, 14, 44 * S).at;
  const k = seatedKids(t, { duyExpr: t > pause ? 'tearsHeldBack' : 'sad', thaoExpr: t > tug ? 'tearsHeldBack' : 'worried', sleeve });
  const penDown = t > pause;
  return (
    <Shop
      t={t}
      id="c2b"
      cam={[820, 650, 1.5]}
      loc={{ pose: LOC_AT_COUNTER(900, t, { yaw: 0.1, expr: 'neutral' }) }}
      counter={{ phoneState: 'cracked', showPhoto: t > 6 * S, receiptStage: 'blank', penOnPaper: penDown }}
      stools={k.stools}
      kids={<><Hero pose={k.duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} heldProps={penDown ? undefined : { R: <SignPen x={0} y={4} s={0.6} rot={-60} /> }} /><Hero pose={k.thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>}
    />
  );
};

/** C2-C insert: the photo comes out of the wallet beside the phone; blank G1 slip; pen set down before Lộc holds the edge. */
export const ShC2_C: React.FC<ShotProps> = ({ t }) => {
  const photo = ramp(t, 0.3 * S, 1.8 * S);
  const pen = ramp(t, 4 * S, 5 * S);
  return (
    <g>
      <OngLocCounterInsert t={t} cracked={1} screenOn={0} playing={0} showPhoto={photo > 0.95} photoX={540} receiptStage="blank" penOnPaper={pen < 1} showMoney={false} showPouch={false} showWallet />
      {photo < 0.95 ? <InsertHand who="duy" tip={{ x: lerp(330, 540, photo), y: lerp(760, 560, photo) }} rot={-18} /> : null}
      {pen > 0 && pen < 1 ? <InsertHand who="duy" tip={{ x: 1180, y: 680 + pen * 60 }} rot={-8} /> : null}
      {/* Lộc's fingers pin the slip's top edge once the pen is down (adult hand from the far side) */}
      {pen >= 1 ? <ArmHand x={1360} y={300} rot={0} s={0.8} skin={LOOKS.ongLoc.skin} sleeve={LOOKS.ongLoc.jacket} len={900} /> : null}
    </g>
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
  const touch = ramp(t, mark('ShC3_B', 3, 6, 6 * S).at + 2 * S, mark('ShC3_B', 3, 6, 6 * S).at + 3 * S);
  const sleeve = ramp(t, mark('ShC3_B', 3, 13, 40 * S).at, mark('ShC3_B', 3, 13, 40 * S).at + S);
  const smile = t > mark('ShC3_B', 3, 13, 40 * S).at && t < mark('ShC3_B', 3, 14, 50 * S).at;
  const k = seatedKids(t, { duyX: 700 + scoot * 26, duyExpr: smile ? 'smile' : 'sad', thaoExpr: 'tearsHeldBack', touch: touch * (1 - sleeve * 0.0), sleeve });
  return (
    <Shop
      t={t}
      id="c3b"
      cam={[830 + Math.sin(t / 180) * 8, 650, 1.5]}
      loc={{ pose: LOC_AT_COUNTER(900, t, { yaw: 0.1, expr: 'neutral' }) }}
      counter={{ phoneState: 'cracked', showPhoto: true, receiptStage: 'blank', penOnPaper: true }}
      stools={k.stools}
      kids={<><Hero pose={k.duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} /><Hero pose={k.thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>}
    />
  );
};

/** C3-C insert: photo already put away; Duy writes the G1 event, Lộc reads it back, Duy signs. */
export const ShC3_C: React.FC<ShotProps> = ({ t }) => {
  const write = ramp(t, 3 * S, 7 * S);
  const sign = ramp(t, 12 * S, 13.5 * S);
  const stage = sign >= 1 ? 'signed' : write > 0.6 ? 'written' : 'blank';
  const penTip = sign > 0 && sign < 1 ? { x: 1380 + sign * 40, y: 640 } : { x: 1300 + write * 90, y: 575 + Math.sin(t / 3) * 3 * (write < 1 ? 1 : 0) };
  const writing = (write > 0 && write < 1) || (sign > 0 && sign < 1);
  return (
    <g>
      <OngLocCounterInsert t={t} cracked={1} screenOn={0} playing={0} showPhoto={false} receiptStage={stage} penOnPaper={!writing} showMoney={false} showPouch={false} showWallet />
      {writing ? (
        <>
          <SignPen x={penTip.x + 30} y={penTip.y - 34} s={2.1} rot={-58} />
          <InsertHand who="duy" tip={{ x: penTip.x + 60, y: penTip.y - 20 }} rot={-22} />
        </>
      ) : null}
    </g>
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
  const shut = t > 3 * S && t < 7 * S;
  const shake = t > 7 * S && t < 9 * S ? Math.sin((t - 7 * S) / 4) * 6 : 0;
  const k = seatedKids(t, { duyExpr: t > 7 * S ? 'vacantSearch' : 'sad', thaoExpr: t > 30 * S && t < 50 * S ? 'tearsHeldBack' : 'worried', duyHeadTilt: shake });
  const duy = shut ? { ...k.duy, blink: 1 } : k.duy;
  return (
    <Shop
      t={t}
      id="c4b"
      cam={[820, 650, 1.5]}
      loc={{ pose: LOC_AT_COUNTER(900, t, { yaw: 0.1, expr: 'neutral' }) }}
      counter={{ phoneState: 'repaired', receiptStage: t > 20 * S ? 'none' : 'signed', penOnPaper: false }}
      stools={k.stools}
      kids={<><Hero pose={duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} /><Hero pose={k.thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>}
    />
  );
};

/** C4-C insert: G1 copies pulled apart (not torn), Duy folds his into the wallet, right index taps play; voice from the phone. */
export const ShC4_C: React.FC<ShotProps> = ({ t }) => {
  const rec = mark('ShC4_C', 4, 6, 9 * S);
  const fold = ramp(t, 3 * S, 5 * S);
  const tap = rec.at - 0.6 * S;
  const playing = t >= rec.at && t < rec.at + rec.len ? 1 : 0;
  const pressing = t > tap - 0.5 * S && t < rec.at + 0.3 * S;
  return (
    <g>
      <OngLocCounterInsert t={t} cracked={0} screenOn={1} playing={playing} showPhoto={false} receiptStage={fold < 0.5 ? 'signed' : 'none'} penOnPaper={false} showMoney={false} showPouch={false} showWallet />
      {fold > 0 && fold < 1 ? <InsertHand who="duy" tip={{ x: lerp(1360, 330, fold), y: lerp(620, 760, fold) }} rot={-10} /> : null}
      {pressing ? <InsertHand who="duy" tip={{ x: 1000, y: t < tap ? 560 : 590 }} rot={-12} /> : null}
    </g>
  );
};

/** C4-D: Lộc close at the counter, second cold smirk; eyes don't soften. */
export const ShC4_D: React.FC<ShotProps> = ({ t }) => (
  <Shop t={t} id="c4d" cam={[900, 470, 2.0]} loc={{ pose: LOC_AT_COUNTER(900, t, { yaw: 0.05, look: 0.4, expr: t > 0.8 * S ? 'smug' : 'glanceOverGlasses' }) }} counter={{ phoneState: 'repaired' }} />
);

// ============================================================================
// CẢNH 5 — Lần thứ hai
// ============================================================================

/** C5-A: three-shot, Lộc centre-deep. G2 price and that the spoken yes is binding; Duy holds Thảo's hand. Later Lộc leans to Thảo for G3. */
export const ShC5_A: React.FC<ShotProps> = ({ t }) => {
  const hold = ramp(t, mark('ShC5_A', 5, 6, 30 * S).at, mark('ShC5_A', 5, 6, 30 * S).at + S);
  const g3 = t >= 60 * S;
  const k = seatedKids(t, { duyExpr: g3 ? 'exhaustedClinch' : 'determined', thaoExpr: g3 ? 'determinedChild' : 'worried', holdHands: g3 ? 0 : hold, duyHeadTilt: g3 ? 8 : 0 });
  const lean = g3 ? ramp(t, 60 * S, 61.5 * S) : 0;
  const loc = LOC_AT_COUNTER(900 + lean * 20, t, { yaw: lerp(0.1, 0.3, lean), look: lerp(0.2, 0.6, lean), tilt: lean * 14, headTilt: lean * 6, expr: 'neutral' });
  return (
    <Shop t={t} id="c5a" cam={[880, 640, 1.25]} loc={{ pose: loc }} counter={{ phoneState: 'repaired' }} stools={k.stools} kids={<><Hero pose={k.duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} /><Hero pose={k.thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>} />
  );
};

/** C5-B: the subjective G2 warmth — same room, same stools; Duy drops his shoulders, Thảo leans in and exhales. */
export const ShC5_B: React.FC<ShotProps> = ({ t }) => {
  const ease = ramp(t, 0.5 * S, 3 * S);
  const k = seatedKids(t, { duyExpr: 'relieved', thaoExpr: 'relieved', holdHands: 1, duyLean: lerp(10, 6, ease), thaoLean: lerp(8, 14, ease) });
  const thao = t > mark('ShC5_B', 5, 9, 9 * S).at ? { ...k.thao, blink: 1 } : k.thao;
  return <Shop t={t} id="c5b" cam={[820, 650, 1.5]} loc={{ pose: LOC_AT_COUNTER(900, t, { expr: 'neutral' }) }} counter={{ phoneState: 'repaired' }} stools={k.stools} kids={<><Hero pose={k.duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} /><Hero pose={thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>} />;
};

/** C5-C: Duy close — the weight comes back. Roll 0→+2°→0 and ≤2/1 px sway only in the first 1.6 s of the 2 s pause. */
export const ShC5_C: React.FC<ShotProps> = ({ t }) => {
  const pause = mark('ShC5_C', 5, 11, 14 * S).at;
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
  const grab = t > mark('ShC5_C', 5, 12, 18 * S).at;
  const k = seatedKids(t, { duyExpr: 'exhaustedClinch', thaoExpr: grab ? 'worried' : 'relieved', duyLean: lerp(10, 16, slump), duyHeadTilt: 8 * slump, sleeve: grab ? 1 : 0 });
  // Duy's left hand grips the stool seat edge.
  const duy = reach(k.duy, 'L', { x: k.stools[0].x - 30 * k.stools[0].s, y: k.stools[0].y - 96 * k.stools[0].s }, slump);
  return <Shop t={t} id="c5c" cam={[760, 640, 2.1]} roll={roll} dx={dx} dy={dy} loc={null} counter={{ phoneState: 'repaired' }} stools={k.stools} kids={<><Hero pose={duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} /><Hero pose={k.thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>} />;
};

/** C5-D: Thảo close; her full "Cháu đồng ý!" first, then Duy lunges "Thảo, đừng…"; one whiteout in the 2 s pause. */
export const ShC5_D: React.FC<ShotProps> = ({ t }) => {
  const stop = mark('ShC5_D', 5, 16, 2 * S).at;
  const pause = mark('ShC5_D', 5, 17, 3.4 * S).at;
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
  const call = mark('ShC6_A', 6, 2, 6 * S).at;
  const open = ramp(t, call, call + S);
  let mom = standPose(960, FIELD_GROUND - 20, 0.9, { t, seed: 9, yaw: -0.05, expr: 'smile', look: 0 });
  mom = reach(reach(mom, 'L', { x: 900, y: mom.y - 30 }, open), 'R', { x: 1020, y: mom.y - 30 }, open);
  const kids = [standPose(760, FIELD_GROUND + 40, 0.95, { t, seed: 1, yaw: 0.5, expr: 'shock', look: 0.5 }), standPose(1170, FIELD_GROUND + 50, 0.74, { t, seed: 2, yaw: -0.5, expr: 'surprised', look: -0.5 })];
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
  const walk = ramp(t, mark('ShC6_B', 6, 4, 9 * S).at - 0.5 * S, mark('ShC6_B', 6, 4, 9 * S).at);
  const drift = t * 0.9 * walk;
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
      <g transform={camT(960 + drift, 600, 1.05)}>
        <SunsetRiceField t={t} whiteout={0} />
        <Hero look={LOOKS.duy} pose={duy} rimId="rimStreetlamp" />
        <Hero look={LOOKS.meDuyThao} pose={mom} rimId="rimStreetlamp" />
        <Hero look={LOOKS.thao} pose={thao} rimId="rimStreetlamp" />
      </g>
      <g transform={camT(960, 600, 1.05)}>
        <SunsetMeadowForeground t={t} shiftX={-drift * 1.3} />
      </g>
      <Bars />
    </g>
  );
};

/** C6-C: seated on the dry stone ledge of the ditch, thighs on the ledge, knees bent, calves hanging above the water. */
export const ShC6_C: React.FC<ShotProps> = ({ t }) => (
  <g>
    <g transform={camT(960, 600, 1.05)}>
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
    <g transform={camT(940, 690, 2.0)}>
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
    <g transform={camT(905, 640, 2.3)}>
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
  const grip = meadowFamilyPoses(Math.max(tt, 0), true, 0, Math.max(tt, 0)).grip ?? { x: 1027.5, y: 778 };
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
  const nod = mark('ShC8_A', 8, 6, 20 * S).at;
  const nodK = t > nod && t < nod + S ? Math.sin(((t - nod) / S) * Math.PI) * 8 : 0;
  const k = seatedKids(t, { duyExpr: t > 8 * S ? 'tearsHeldBack' : 'exhaustedClinch', thaoExpr: 'worried', holdHands: 1, duyLean: 16, duyHeadTilt: 6 });
  return (
    <g>
      <Shop t={t} id="c8a" cam={[880, 640, 1.25]} loc={{ pose: LOC_AT_COUNTER(1000, t, { yaw: 0.1, expr: 'neutral', headTilt: nodK }) }} counter={{ phoneState: 'repaired', receiptStage: t > 8 * S ? 'signed' : 'none' }} stools={k.stools} kids={<><Hero pose={k.duy} look={LOOKS.duy} rimId="rimShopWarm" shadow={0} /><Hero pose={k.thao} look={LOOKS.thao} rimId="rimStreetlamp" shadow={0} /></>} />
      <rect width={1920} height={1080} fill="#1e171a" opacity={1 - clamp(t / 14)} />
    </g>
  );
};

/** C8-B insert: G2 and G3 pushed over; Duy lays G1 from his wallet beside them, then stores all three. */
export const ShC8_B: React.FC<ShotProps> = ({ t }) => {
  const g1 = ramp(t, 6 * S, 8 * S);
  const store = ramp(t, 15 * S, 17.5 * S);
  return (
    <g>
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
    </g>
  );
};

/** C8-C: outside the home threshold. Father only as sound / a shadow behind the inner wall; Duy shields Thảo and calls Aunt Hạnh. */
export const ShC8_C: React.FC<ShotProps> = ({ t }) => {
  const stopK = ramp(t, 0.3 * S, 0.9 * S);
  const call = mark('ShC8_C', 8, 10, 10 * S).at;
  const phoneUp = ramp(t, call - 1.5 * S, call - 0.7 * S);
  const exhale = t > mark('ShC8_C', 8, 11, 16 * S).at;
  const zoom = lerp(1.0, 1.35, ramp(t, 5 * S, 8 * S)); // 28 mm wide → 50 mm medium on the call
  let duy = standPose(860, 990, 1.05, { t, seed: 1, yaw: 0.25, look: exhale ? 0.1 : -0.2, expr: exhale ? 'relieved' : 'determined' });
  let thao = standPose(1060, 1000, 0.8, { t, seed: 2, yaw: -0.4 + stopK * 0.2, expr: 'scared', look: -0.5 });
  thao = reach(thao, 'L', { x: duy.x + 40, y: duy.y - 60 }, stopK);
  if (phoneUp > 0) duy = reach(duy, 'L', { x: duy.x - 20, y: duy.y - 160 * duy.scale }, phoneUp);
  return (
    <g transform={camT(940, lerp(560, 720, ramp(t, 5 * S, 8 * S)), zoom)}>
      {/* House interior seen through the open front door; the children stay outside the sill. */}
      <defs>
        <clipPath id="c8cDoor">
          <rect x={560} y={160} width={800} height={780} />
        </clipPath>
      </defs>
      <rect x={-200} y={-200} width={2400} height={1500} fill="#141A26" />
      <g clipPath="url(#c8cDoor)">
        <MotherThaoHouse t={t} id="c8c" showFatherShadow veil={0.66} />
      </g>
      <rect x={520} y={120} width={40} height={830} fill="#2A2420" stroke="#0E0B0A" strokeWidth={3} />
      <rect x={1360} y={120} width={40} height={830} fill="#2A2420" stroke="#0E0B0A" strokeWidth={3} />
      <rect x={520} y={110} width={880} height={50} fill="#2A2420" stroke="#0E0B0A" strokeWidth={3} />
      <rect x={480} y={940} width={960} height={22} fill="#3A332C" stroke="#0E0B0A" strokeWidth={3} />
      <rect x={-200} y={962} width={2400} height={400} fill="#1C2230" />
      <Hero look={LOOKS.duy} pose={duy} rimId="rimShopWarm" shadow={0.35} heldProps={phoneUp > 0 ? { L: <MotherPhone x={0} y={0} w={40} rot={90} flat={false} cracked={0} screenOn={1} /> } : undefined} />
      <Hero look={LOOKS.thao} pose={thao} rimId="rimStreetlamp" shadow={0.3} />
    </g>
  );
};

/** C8-D: phone put away, then hand in hand they walk out of frame toward the warm light at the alley head. */
export const ShC8_D: React.FC<ShotProps> = ({ t }) => {
  const go = ramp(t, 3 * S, 4 * S);
  const x = 1040 - (t - 3 * S) * 1.6 * go;
  const ph = t * 0.5;
  let duy = go > 0 ? walkPose(x, ph, 930, 0.9, { expr: 'tired', yaw: -1 }, -1) : standPose(1040, 930, 0.9, { t, seed: 1, yaw: -0.3, expr: 'tired' });
  let thao = go > 0 ? walkPose(x + 120, ph * 1.12 + 1.5, 945, 0.7, { expr: 'worried', yaw: -1 }, -1) : standPose(1160, 945, 0.7, { t, seed: 2, yaw: -0.3, expr: 'worried' });
  const g = { x: (duy.x + thao.x) / 2 + 6, y: duy.y + 30 };
  duy = reach(duy, 'L', g, 1);
  thao = reach(thao, 'R', g, 1);
  return (
    <g transform={camT(980, 720, 1.05)}>
      <AlleyExteriorScene t={t} showOwl={false} showPassersby={false} />
      <Hero look={LOOKS.duy} pose={duy} rimId="rimShopWarm" shadow={0.35} />
      <Hero look={LOOKS.thao} pose={thao} rimId="rimStreetlamp" shadow={0.3} />
    </g>
  );
};

