import React from 'react';
import { lerp, easeInOut } from './anim';

// The cast, drawn entirely in code: one rig, and a costume (a Look) per character. Every character is built
// once here, so they look identical in every shot: that's the "drawn, not guessed" point. Original
// characters only: never a channel's own hero or anything that resembles a famous cartoon character.

export const C = {
  skin: '#F6EFE3',
  skinShade: '#E2D3BE',
  ink: '#1D2033',
  jacket: '#F2B33D',
  jacketShade: '#D4922A',
  shoe: '#2FB7A6',
  orange: '#FF8A3D',
  limb: '#EFE2CC',
};

/** A costume for the rig: the same body and animation, different colours and one optional extra piece. */
export type Look = {
  skin: string;
  skinShade: string;
  hand: string;
  jacket: string;
  jacketShade: string;
  accent: string;
  limb: string;
  line: string;
  shoe: string;
  face: string;
  hair: string;
  extra?: 'hood' | 'curls' | 'bunches' | 'bob' | 'suit' | 'hardhat' | 'crop' | 'bun';
  hat?: string; // hard-hat colour (extra 'hardhat')
  /** The film cast: fuller limbs, bare forearms and shins in their own colour, and hands with fingers. */
  limbW?: number;
  forearm?: string;
  shin?: string;
  fingers?: boolean;
};
export type CastName = 'pip' | 'pipHood' | 'pipInk' | 'mo' | 'sis' | 'mom' | 'suit' | 'worker' | 'workerHat' | 'student' | 'tech' | 'chu' | 'bac' | 'moi' | 'an' | 'hanh' | 'linh' | 'baSau' | 'nam';
export const LOOKS: Record<CastName, Look> = {
  // A: Pip as built
  pip: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: C.jacket, jacketShade: C.jacketShade, accent: C.jacketShade, limb: C.limb, line: C.ink, shoe: C.shoe, face: C.ink, hair: C.ink },
  // B: Pip in a dark hoodie with mustard drawstrings: the body goes dark and catches the rim light, the head stays the brightest thing
  pipHood: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#2E2B3D', jacketShade: '#24212F', accent: C.jacket, limb: '#2E2B3D', line: '#121019', shoe: C.shoe, face: C.ink, hair: C.ink, extra: 'hood' },
  // C: a dark head with light features, the genre's high-contrast convention, in Pip's mustard
  pipInk: { skin: '#26232F', skinShade: '#1C1A24', hand: '#26232F', jacket: C.jacket, jacketShade: C.jacketShade, accent: C.jacketShade, limb: '#26232F', line: '#121019', shoe: C.shoe, face: '#F6EFE3', hair: '#26232F' },
  // Mo, Pip's friend: a second recurring character with his own costume (curly hair, headphones round his neck)
  mo: { skin: '#C98E68', skinShade: '#B07A58', hand: '#C98E68', jacket: '#5E6E46', jacketShade: '#4C5A38', accent: '#E9C46A', limb: '#3A3446', line: '#1A1622', shoe: '#D9534F', face: C.ink, hair: '#2A1C18', extra: 'curls' },
  // the formula's recurring cast (beats 5 and 6): Pip's little sister (draw her at about 0.7 of Pip's scale), his mum,
  // and the man in a suit who notices the power. All three are ours: plain shapes, no famous silhouettes.
  sis: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#3E8C86', jacketShade: '#2F6E69', accent: '#F28C6A', limb: '#3A3446', line: '#14121C', shoe: '#F28C6A', face: C.ink, hair: '#3A2620', extra: 'bunches' },
  mom: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#8A5A6A', jacketShade: '#704858', accent: '#E9C46A', limb: '#3A3446', line: '#14121C', shoe: '#5A4A6A', face: C.ink, hair: '#5A3226', extra: 'bob' },
  // "Mưa liên tục 100 ngày": An (water-station technician), Hạnh, Linh (8: draw at about 0.62 of An), bà Sáu, Nam (her grandson).
  an: { skin: '#E6B98F', skinShade: '#CF9F76', hand: '#E6B98F', jacket: '#4F7486', jacketShade: '#3C5A6A', accent: '#2E4654', limb: '#3B3F4C', line: '#16141C', shoe: '#5A4636', face: C.ink, hair: '#1B1718', extra: 'crop', limbW: 21, forearm: '#E6B98F', fingers: true },
  hanh: { skin: '#EBC4A0', skinShade: '#D4A981', hand: '#EBC4A0', jacket: '#B5604F', jacketShade: '#934A3D', accent: '#E8C9A0', limb: '#3D3A4A', line: '#16141C', shoe: '#6B4A3A', face: C.ink, hair: '#1E1718', extra: 'bun', limbW: 18, forearm: '#EBC4A0', fingers: true },
  linh: { skin: '#F0CCA8', skinShade: '#DAB08C', hand: '#F0CCA8', jacket: '#E9D8B0', jacketShade: '#CDB98C', accent: '#D96C4F', limb: '#55718A', line: '#16141C', shoe: '#D96C4F', face: C.ink, hair: '#1C1516', extra: 'bunches', limbW: 19, forearm: '#F0CCA8', shin: '#F0CCA8', fingers: true },
  baSau: { skin: '#DDB08A', skinShade: '#C49670', hand: '#DDB08A', jacket: '#6E5B7E', jacketShade: '#574764', accent: '#CDB98C', limb: '#2F2B38', line: '#16141C', shoe: '#4A3E36', face: C.ink, hair: '#B9B4AE', extra: 'bun', limbW: 18, forearm: '#DDB08A', fingers: true },
  nam: { skin: '#E0B48C', skinShade: '#C89A72', hand: '#E0B48C', jacket: '#3F8A7C', jacketShade: '#2F6C60', accent: '#F2C14E', limb: '#44506A', line: '#16141C', shoe: '#E9E0CC', face: C.ink, hair: '#1A1516', extra: 'crop', limbW: 19, forearm: '#E0B48C', shin: '#E0B48C', fingers: true },
  suit: { skin: '#D9C6AE', skinShade: '#C2AE96', hand: '#D9C6AE', jacket: '#2B2F3A', jacketShade: '#20232C', accent: '#A8323E', limb: '#2B2F3A', line: '#0E0F14', shoe: '#14151A', face: C.ink, hair: '#17141A', extra: 'suit' },
  // "Nếu ngày đó bạn không bỏ học?": one face (Pip's), four costumes. The same head and hair in every one, so he is
  // recognisably the same person on the site, in uniform, in the workshop and in a technician's shirt.
  worker: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#B8742E', jacketShade: '#8E5620', accent: '#F0D58A', limb: '#8A6B45', line: '#1A1410', shoe: '#6B5A48', face: C.ink, hair: C.ink, extra: 'crop' },
  workerHat: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#B8742E', jacketShade: '#8E5620', accent: '#F0D58A', limb: '#8A6B45', line: '#1A1410', shoe: '#6B5A48', face: C.ink, hair: C.ink, extra: 'hardhat', hat: '#F2B33D' },
  student: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#EDE8DE', jacketShade: '#C9C2B4', accent: '#3E5C8A', limb: '#3A4A70', line: '#14121C', shoe: '#E6E1D6', face: C.ink, hair: C.ink, extra: 'crop' },
  tech: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#3F7090', jacketShade: '#2E5570', accent: '#F2B33D', limb: '#33465A', line: '#10141C', shoe: '#2B2B30', face: C.ink, hair: C.ink, extra: 'crop' },
  // the uncle who waits by the truck, the older foreman, and the newcomer who is still learning
  chu: { skin: '#C99B74', skinShade: '#AE8260', hand: '#C99B74', jacket: '#5C6B4A', jacketShade: '#475438', accent: '#F0D58A', limb: '#4A4F5A', line: '#14110E', shoe: '#4A3A30', face: C.ink, hair: '#2A1C18', extra: 'hardhat', hat: '#F2B33D' },
  bac: { skin: '#BE8C68', skinShade: '#A27452', hand: '#BE8C68', jacket: '#5E6F80', jacketShade: '#485765', accent: '#F0D58A', limb: '#4A4F5A', line: '#14110E', shoe: '#4A3A30', face: C.ink, hair: '#9A9AA0', extra: 'hardhat', hat: '#F4F1E8' },
  moi: { skin: '#E8C9A8', skinShade: '#CFAE8C', hand: '#E8C9A8', jacket: '#9A4A3A', jacketShade: '#7A382C', accent: '#F0D58A', limb: '#5A5666', line: '#14110E', shoe: '#7A6A5A', face: C.ink, hair: '#2A1C18', extra: 'hardhat', hat: '#E8763A' },
};

// ---------- the hero ----------
/** Mitten hands: open (a palm and a thumb) or pointing (a fist with the index finger out). */
export type HandKind = 'open' | 'point';
export type Expr = 'neutral' | 'happy' | 'smug' | 'shock' | 'worried' | 'oops' | 'cool' | 'dizzy' | 'tired' | 'sad' | 'cry' | 'smile' | 'relieved' | 'scared' | 'determined';
export type Limb = { a: number; b: number }; // a: upper segment angle, b: bend of the lower segment (degrees)
export type Pose = {
  x: number;
  y: number; // hip point
  scale: number;
  facing: 1 | -1;
  tilt: number; // torso lean around the hips, degrees, + leans screen-right
  spin: number; // whole-body rotation around the chest (tumbles)
  headTilt: number;
  armL: Limb;
  armR: Limb;
  legL: Limb;
  legR: Limb;
  expr: Expr;
  blink: number; // 0 open, 1 shut
  look: number; // -1..1 eye offset
  glasses: number; // 0..1
  yaw: number; // -1 profile facing screen-left, 0 front, 1 profile facing screen-right
  squash: number; // + squashes (landing), - stretches (jump), about the feet
  handL: HandKind;
  handR: HandKind;
  sway: number; // secondary motion: how far loose things (the hood's drawstrings) swing, degrees-ish
  glint?: number; // 0..1 the eyes light up in the power's colour (set it after poseAt: it isn't interpolated)
  glintColor?: string;
  talk?: number; // 0..1 the mouth open while speaking (set it after poseAt: it isn't interpolated)
};

export const basePose: Pose = {
  x: 960,
  y: 700,
  scale: 1,
  facing: 1,
  tilt: 0,
  spin: 0,
  headTilt: 0,
  armL: { a: 10, b: -8 },
  armR: { a: 10, b: -8 },
  legL: { a: 5, b: 0 },
  legR: { a: -5, b: 0 },
  expr: 'neutral',
  blink: 0,
  look: 0,
  glasses: 0,
  yaw: 0,
  squash: 0,
  handL: 'open',
  handR: 'open',
  sway: 0,
};

type Key = { f: number; p: Partial<Pose>; ease?: (t: number) => number };

/** Blinks that belong to the shot's clock: shut about 3 frames every 2.5 to 4 s, never random. */
export const blinkAt = (t: number, seed = 0) => {
  const period = 75 + ((seed * 37) % 45);
  return (t + seed * 17) % period < 3 ? 1 : 0;
};

const mixLimb = (a: Limb, b: Limb, t: number): Limb => ({ a: lerp(a.a, b.a, t), b: lerp(a.b, b.b, t) });

/** Interpolates every numeric part of a pose between keys; the face swaps (never morphs) at its key. */
export const poseAt = (f: number, keys: Key[], from: Pose = basePose): Pose => {
  // resolve each key into a full pose, carrying values forward
  const full: { f: number; p: Pose; ease?: (t: number) => number }[] = [];
  let cur = from;
  for (const k of keys) {
    cur = { ...cur, ...k.p };
    full.push({ f: k.f, p: cur, ease: k.ease });
  }
  if (f <= full[0].f) return full[0].p;
  for (let i = 0; i < full.length - 1; i++) {
    const A = full[i];
    const B = full[i + 1];
    if (f <= B.f) {
      const t = (B.ease ?? easeInOut)((f - A.f) / Math.max(1e-6, B.f - A.f));
      return {
        x: lerp(A.p.x, B.p.x, t),
        y: lerp(A.p.y, B.p.y, t),
        scale: lerp(A.p.scale, B.p.scale, t),
        facing: t < 0.5 ? A.p.facing : B.p.facing,
        tilt: lerp(A.p.tilt, B.p.tilt, t),
        spin: lerp(A.p.spin, B.p.spin, t),
        headTilt: lerp(A.p.headTilt, B.p.headTilt, t),
        armL: mixLimb(A.p.armL, B.p.armL, t),
        armR: mixLimb(A.p.armR, B.p.armR, t),
        legL: mixLimb(A.p.legL, B.p.legL, t),
        legR: mixLimb(A.p.legR, B.p.legR, t),
        expr: A.p.expr, // a face swaps when its own key lands, so hold the earlier one
        handL: A.p.handL,
        handR: A.p.handR,
        blink: lerp(A.p.blink, B.p.blink, t),
        look: lerp(A.p.look, B.p.look, t),
        glasses: lerp(A.p.glasses, B.p.glasses, t),
        yaw: lerp(A.p.yaw, B.p.yaw, t),
        squash: lerp(A.p.squash, B.p.squash, t),
        sway: lerp(A.p.sway, B.p.sway, t),
      };
    }
  }
  return full[full.length - 1].p;
};

// body measurements (local space: hips at 0,0, y down)
const UPPER_ARM = 62;
const FORE_ARM = 58;
const THIGH = 72;
const SHIN = 68;
const SHOULDER = { x: 42, y: -108 };
const HIP = { x: 17, y: 0 };
export const HEAD = { x: 0, y: -176, r: 62 };
export const LEG_LEN = THIGH + SHIN;

const rad = (d: number) => (d * Math.PI) / 180;
type P = { x: number; y: number };
const rot = (p: P, deg: number, c: P = { x: 0, y: 0 }): P => {
  const r = rad(deg);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return { x: c.x + dx * Math.cos(r) - dy * Math.sin(r), y: c.y + dx * Math.sin(r) + dy * Math.cos(r) };
};

/** Joint positions in local space (before the hip translate/scale), so scenes can attach props to hands. */
export const joints = (pose: Pose) => {
  const side = (s: 1 | -1, limb: Limb, root: P, l1: number, l2: number, isLeg: boolean) => {
    // arms swing outward (away from the body) on their own side; legs swing forward in the facing direction
    const dir = isLeg ? pose.facing : s;
    const d1 = { x: dir * Math.sin(rad(limb.a)), y: Math.cos(rad(limb.a)) };
    const mid = { x: root.x + d1.x * l1, y: root.y + d1.y * l1 };
    const a2 = limb.a + limb.b;
    const d2 = { x: dir * Math.sin(rad(a2)), y: Math.cos(rad(a2)) };
    return { root, mid, end: { x: mid.x + d2.x * l2, y: mid.y + d2.y * l2 } };
  };
  const torsoRot = (p: P) => rot(p, pose.tilt);
  const sp = limbSpread(pose.yaw);
  const shL = { x: -SHOULDER.x * sp + pose.yaw * 6, y: SHOULDER.y };
  const shR = { x: SHOULDER.x * sp + pose.yaw * 6, y: SHOULDER.y };
  const armL = side(-1, pose.armL, shL, UPPER_ARM, FORE_ARM, false);
  const armR = side(1, pose.armR, shR, UPPER_ARM, FORE_ARM, false);
  const legL = side(-1, pose.legL, { x: -HIP.x * sp, y: 0 }, THIGH, SHIN, true);
  const legR = side(1, pose.legR, { x: HIP.x * sp, y: 0 }, THIGH, SHIN, true);
  const r = (o: { root: P; mid: P; end: P }) => ({ root: torsoRot(o.root), mid: torsoRot(o.mid), end: torsoRot(o.end) });
  return { armL: r(armL), armR: r(armR), legL, legR, head: torsoRot(HEAD) };
};

/** How wide the body reads as it turns: full width face-on, about 60% in profile. */
export const turnWidth = (yaw: number) => 1 - 0.4 * Math.min(1, Math.abs(yaw));
/** Shoulders and hips close up as he turns, so in profile the limbs overlap the body. */
export const limbSpread = (yaw: number) => 1 - 0.85 * Math.min(1, Math.abs(yaw));

/** Face swaps happen through a blink: two frames shut either side of each change, as in the genre. */
export const faceAt = (f: number, keys: [number, Expr][]): { expr: Expr; blink: number } => {
  let expr = keys[0][1];
  let blink = 0;
  for (let i = 0; i < keys.length; i++) {
    const [k, e] = keys[i];
    if (f >= k) expr = e;
    if (i > 0 && f >= k - 2 && f < k + 1) blink = 1;
  }
  return { expr, blink };
};

/** A local point to world space, for attaching props (the mug in Pip's hand). */
export const toWorld = (pose: Pose, p: P): P => {
  const spun = rot(p, pose.spin, { x: 0, y: -90 });
  return { x: pose.x + spun.x * pose.scale, y: pose.y + spun.y * pose.scale };
};

/** Straight-arm reach: the right arm angle (local) that points the hand at a world target. */
export const reachAngle = (pose: Pose, target: P) => {
  const sh = toWorld(pose, rot({ x: SHOULDER.x * limbSpread(pose.yaw) + pose.yaw * 6, y: SHOULDER.y }, pose.tilt));
  const world = (Math.atan2(target.x - sh.x, target.y - sh.y) * 180) / Math.PI; // 0 = straight down
  return world - pose.tilt;
};

const Face: React.FC<{ expr: Expr; blink: number; look: number; glasses: number; yaw?: number; ink?: string; glint?: number; glintColor?: string; talk?: number }> = ({ expr, blink, look, glasses, yaw = 0, ink = C.ink, glint = 0, glintColor = '#8FF0FF', talk = 0 }) => {
  const ex = look * 7;
  const ay = Math.min(1, Math.abs(yaw));
  const farHidden = ay > 0.72;
  const farSide = yaw > 0 ? -1 : 1; // facing screen-right hides the screen-left eye
  const eyeY = HEAD.y - 4;
  // heavy lids: half shut when smug or cool, more than half when tired (with dark rings under the eyes)
  const lid = expr === 'smug' || expr === 'cool' ? 0.45 : expr === 'tired' ? 0.58 : 0;
  const open = Math.max(0.08, 1 - Math.max(blink, lid));
  const eye = (cx: number) => {
    if (farHidden && Math.sign(cx) === farSide) return null;
    if (expr === 'happy') return <path d={`M ${cx - 10} ${eyeY + 3} Q ${cx} ${eyeY - 9} ${cx + 10} ${eyeY + 3}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />;
    if (expr === 'oops') return <path d={`M ${cx - 9} ${eyeY - 6} L ${cx + 4} ${eyeY} L ${cx - 9} ${eyeY + 6}`} transform={cx > 0 ? `translate(${2 * cx},0) scale(-1,1)` : undefined} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (expr === 'dizzy') return <g stroke={ink} strokeWidth={5} strokeLinecap="round"><path d={`M ${cx - 7} ${eyeY - 7} L ${cx + 7} ${eyeY + 7} M ${cx + 7} ${eyeY - 7} L ${cx - 7} ${eyeY + 7}`} /></g>;
    const sg = cx < 0 ? 1 : -1; // + for the screen-left eye: its inner corner is on the right
    if (expr === 'relieved') return <path d={`M ${cx - 10} ${eyeY - 1} Q ${cx} ${eyeY + 9} ${cx + 10} ${eyeY - 1}`} stroke={ink} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    // shut (a blink's middle frame, or asleep): the closed lid's curve, with the tired rings kept
    if (blink >= 0.95)
      return (
        <g>
          <path d={`M ${cx - 12} ${eyeY + 1} Q ${cx} ${eyeY + 8} ${cx + 12} ${eyeY + 1}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          {expr === 'tired' ? <path d={`M ${cx - 12} ${eyeY + 15} Q ${cx} ${eyeY + 22} ${cx + 12} ${eyeY + 15}`} stroke="#8C7AA6" strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={0.85} /> : null}
        </g>
      );
    const big = expr === 'shock' || expr === 'scared';
    const sadEye = expr === 'sad' || expr === 'cry';
    const rx = expr === 'scared' ? 9 : big ? 11 : 7;
    const ry = (big ? 13 : sadEye || expr === 'determined' ? 8.5 : expr === 'smile' ? 9 : 10) * open;
    return (
      <g>
        <ellipse cx={cx + ex} cy={eyeY + (lid ? 3 : 0)} rx={rx} ry={ry} fill={ink} />
        {big && open > 0.5 ? <circle cx={cx + ex + 3.5} cy={eyeY - 4} r={3.4} fill="#fff" /> : null}
        {sadEye && open > 0.5 ? <circle cx={cx + ex + 2.5} cy={eyeY - 1} r={2.6} fill="#fff" opacity={0.9} /> : null}
        {sadEye ? <path d={`M ${cx - 12 * sg} ${eyeY + 1} Q ${cx} ${eyeY - 4} ${cx + 12 * sg} ${eyeY - 6}`} stroke={ink} strokeWidth={4} strokeLinecap="round" fill="none" /> : null}
        {expr === 'determined' ? <path d={`M ${cx - 12 * sg} ${eyeY - 7} L ${cx + 12 * sg} ${eyeY - 1}`} stroke={ink} strokeWidth={4} strokeLinecap="round" fill="none" /> : null}
        {expr === 'smile' ? <path d={`M ${cx - 10} ${eyeY + 13} Q ${cx} ${eyeY + 7} ${cx + 10} ${eyeY + 13}`} stroke={ink} strokeWidth={3.5} strokeLinecap="round" fill="none" opacity={0.7} /> : null}
        {expr === 'cry' ? <path d={`M ${cx + 2 * sg} ${eyeY + 10} Q ${cx + 8 * sg} ${eyeY + 28} ${cx + 4 * sg} ${eyeY + 46}`} stroke="#8FD3FF" strokeWidth={6} strokeLinecap="round" fill="none" /> : null}
        {expr === 'sad' ? <path d={`M ${cx - 4 * sg} ${eyeY + 11} q 3 7 0 11 q -3 -4 0 -11 Z`} fill="#8FD3FF" opacity={0.9} /> : null}
        {lid ? <path d={expr === 'tired' ? `M ${cx - 13} ${eyeY - 1} Q ${cx} ${eyeY - 5} ${cx + 13} ${eyeY - 1}` : `M ${cx - 12} ${eyeY - 4} L ${cx + 12} ${eyeY - 2}`} stroke={ink} strokeWidth={4} strokeLinecap="round" fill="none" /> : null}
        {expr === 'tired' ? <path d={`M ${cx - 12} ${eyeY + 14} Q ${cx} ${eyeY + 21} ${cx + 12} ${eyeY + 14}`} stroke="#8C7AA6" strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={0.85} /> : null}
      </g>
    );
  };
  const brows: Record<Expr, string> = {
    neutral: '',
    happy: '',
    smug: `M -34 ${eyeY - 22} L -12 ${eyeY - 20} M 12 ${eyeY - 26} L 34 ${eyeY - 30}`,
    shock: `M -32 ${eyeY - 28} Q -21 ${eyeY - 36} -10 ${eyeY - 29} M 10 ${eyeY - 29} Q 21 ${eyeY - 36} 32 ${eyeY - 28}`,
    worried: `M -32 ${eyeY - 18} L -12 ${eyeY - 26} M 12 ${eyeY - 26} L 32 ${eyeY - 18}`,
    oops: `M -32 ${eyeY - 20} L -12 ${eyeY - 16} M 12 ${eyeY - 16} L 32 ${eyeY - 20}`,
    cool: '',
    dizzy: '',
    tired: `M -33 ${eyeY - 17} Q -22 ${eyeY - 21} -11 ${eyeY - 19} M 11 ${eyeY - 19} Q 22 ${eyeY - 21} 33 ${eyeY - 17}`,
    sad: `M -33 ${eyeY - 14} Q -22 ${eyeY - 19} -11 ${eyeY - 27} M 11 ${eyeY - 27} Q 22 ${eyeY - 19} 33 ${eyeY - 14}`,
    cry: `M -34 ${eyeY - 12} Q -22 ${eyeY - 18} -10 ${eyeY - 29} M 10 ${eyeY - 29} Q 22 ${eyeY - 18} 34 ${eyeY - 12}`,
    smile: `M -32 ${eyeY - 23} Q -21 ${eyeY - 29} -10 ${eyeY - 25} M 10 ${eyeY - 25} Q 21 ${eyeY - 29} 32 ${eyeY - 23}`,
    relieved: `M -32 ${eyeY - 21} Q -21 ${eyeY - 26} -10 ${eyeY - 22} M 10 ${eyeY - 22} Q 21 ${eyeY - 26} 32 ${eyeY - 21}`,
    scared: `M -32 ${eyeY - 30} L -11 ${eyeY - 38} M 11 ${eyeY - 38} L 32 ${eyeY - 30}`,
    determined: `M -35 ${eyeY - 29} L -9 ${eyeY - 20} M 9 ${eyeY - 20} L 35 ${eyeY - 29}`,
  };
  const mY = HEAD.y + 28;
  const mouth: Record<Expr, React.ReactNode> = {
    neutral: <path d={`M -10 ${mY} Q 0 ${mY + 4} 10 ${mY}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    happy: <path d={`M -18 ${mY - 4} Q 0 ${mY + 20} 18 ${mY - 4} Z`} fill={ink} />,
    smug: <path d={`M -12 ${mY + 2} Q 4 ${mY + 8} 16 ${mY - 6}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    shock: <ellipse cx={0} cy={mY + 4} rx={10} ry={14} fill={ink} />,
    worried: <path d={`M -16 ${mY + 4} Q -8 ${mY - 4} 0 ${mY + 4} Q 8 ${mY + 12} 16 ${mY + 4}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    oops: <g><rect x={-18} y={mY - 6} width={36} height={16} rx={6} fill={ink} /><path d={`M -14 ${mY + 2} L 14 ${mY + 2}`} stroke="#fff" strokeWidth={3} /></g>,
    cool: <path d={`M -12 ${mY + 2} Q 4 ${mY + 8} 16 ${mY - 6}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    dizzy: <path d={`M -14 ${mY + 4} Q -7 ${mY - 4} 0 ${mY + 4} Q 7 ${mY + 12} 14 ${mY + 4}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    tired: <path d={`M -11 ${mY + 4} Q 0 ${mY} 11 ${mY + 4}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    sad: <path d={`M -13 ${mY + 7} Q 0 ${mY - 5} 13 ${mY + 7}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    cry: <path d={`M -15 ${mY + 11} Q 0 ${mY - 8} 15 ${mY + 11} Q 0 ${mY + 3} -15 ${mY + 11} Z`} fill={ink} stroke={ink} strokeWidth={3} strokeLinejoin="round" />,
    smile: <path d={`M -15 ${mY - 2} Q 0 ${mY + 13} 15 ${mY - 2}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    relieved: <path d={`M -11 ${mY} Q 0 ${mY + 9} 11 ${mY}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    scared: <ellipse cx={0} cy={mY + 5} rx={11} ry={9} fill={ink} />,
    determined: <path d={`M -12 ${mY + 3} L 12 ${mY + 3}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />,
  };
  return (
    <g transform={`translate(${yaw * 30} 0) scale(${1 - 0.28 * ay} 1)`}>
      {eye(-21)}
      {eye(21)}
      {brows[expr] ? <path d={brows[expr]} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
      {talk > 0.08 ? <ellipse cx={0} cy={mY + 4} rx={13} ry={2.5 + 12 * talk} fill={ink} /> : mouth[expr]}
      {expr === 'shock' || expr === 'oops' || expr === 'scared' ? <path d={`M 52 ${HEAD.y - 30} q 6 10 0 16 q -6 -6 0 -16 Z`} fill="#8FD3FF" /> : null}
      {/* a power lighting the eyes: a soft halo, a bright iris, a white catchlight (none while the lids are shut) */}
      {glint > 0.01 && blink < 0.95
        ? [-21, 21].map((cx) =>
            farHidden && Math.sign(cx) === farSide ? null : (
              <g key={`gl${cx}`} opacity={Math.min(1, glint)}>
                <circle cx={cx + ex} cy={eyeY} r={17} fill={glintColor} opacity={0.2} />
                <circle cx={cx + ex} cy={eyeY} r={12} fill={glintColor} opacity={0.28} />
                <ellipse cx={cx + ex} cy={eyeY + (lid ? 3 : 0)} rx={8} ry={Math.max(2, 11 * open)} fill={glintColor} />
                <circle cx={cx + ex + 2.5} cy={eyeY - 3} r={2.6} fill="#FFFFFF" />
              </g>
            ),
          )
        : null}
      {glasses > 0.01 ? (
        <g opacity={glasses} transform={`translate(0 ${(1 - glasses) * -60})`}>
          {/* classic shades: a full bar across, two big lenses, one bright glint so it reads at feed size */}
          <path d={`M -58 ${eyeY - 12} L 58 ${eyeY - 12}`} stroke={ink} strokeWidth={6} strokeLinecap="round" />
          <path d={`M -50 ${eyeY - 14} L -6 ${eyeY - 14} L -10 ${eyeY + 8} Q -28 ${eyeY + 18} -46 ${eyeY + 8} Z`} fill="#0D0F1C" stroke={ink} strokeWidth={3} />
          <path d={`M 6 ${eyeY - 14} L 50 ${eyeY - 14} L 46 ${eyeY + 8} Q 28 ${eyeY + 18} 10 ${eyeY + 8} Z`} fill="#0D0F1C" stroke={ink} strokeWidth={3} />
          <path d={`M -40 ${eyeY + 2} L -26 ${eyeY - 10} M 16 ${eyeY + 2} L 30 ${eyeY - 10}`} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
        </g>
      ) : null}
    </g>
  );
};

/**
 * Hair over the back of a turned head. Face on, nothing shows; as the head turns (|yaw| 0 to 1) the hair spreads from
 * the rim across the side of the head, to just behind the ear in profile. `bottom` is how far down the nape it runs,
 * `flare` pushes the outline out (a bob, curls), `extra` reaches further across the head.
 */
/** Where a bunch sits as the head turns: both high on the sides face-on; turned, both slide round to the back of the head (the far one goes hidden behind it). */
const bunchAt = (sd: number, yaw: number) => {
  const a = Math.min(1, Math.abs(yaw));
  const back = yaw === 0 ? 0 : -Math.sign(yaw);
  const far = sd !== back && a > 0;
  return { x: 58 * sd * (1 - a) + back * 58 * a, band: far ? Math.max(0, 1 - a * 3) : 1 };
};
const SideHair: React.FC<{ yaw: number; hair: string; line: string; bottom?: number; flare?: number; extra?: number; stroke?: number }> = ({ yaw, hair, line, bottom = 30, flare = 0, extra = 0, stroke = 3 }) => {
  const a = Math.abs(yaw);
  if (a < 0.12) return null;
  const s = -Math.sign(yaw);
  const th = (a <= 0.5 ? 52 * a : 26 + 62 * (a - 0.5)) + extra * Math.min(1, a * 1.4);
  const x0 = s * Math.min(58, 62 - th);
  const y = HEAD.y;
  const R = 62 + flare; // the outline is a true arc of the head, so the hair hugs the skull instead of floating beside it
  const yT = y - Math.sqrt(Math.max(1, R * R - x0 * x0));
  const xb = s * Math.sqrt(Math.max(1, R * R - bottom * bottom));
  return (
    <path
      d={`M ${x0} ${yT} A ${R} ${R} 0 0 ${s > 0 ? 1 : 0} ${xb} ${y + bottom} Q ${(xb + x0) / 2} ${y + bottom + 6} ${x0} ${y + bottom - 12} Q ${x0 - s * 8} ${y - 10} ${x0} ${yT} Z`}
      fill={hair}
      stroke={line}
      strokeWidth={stroke}
      strokeLinejoin="round"
      opacity={Math.min(1, (a - 0.12) * 5)}
    />
  );
};

export const Hero: React.FC<{ pose: Pose; shadow?: number; rimId?: string; look?: Look }> = ({ pose, shadow = 1, rimId = 'rimR', look = LOOKS.pipHood }) => {
  const j = joints(pose);
  const L = look;
  // limbs are light with a dark outline, so they read on the dark sets (navy limbs vanished on navy walls)
  const limb = (o: { root: P; mid: P; end: P }, w0: number, lower?: string) => {
    const w = L.limbW ?? w0;
    const d = `M ${o.root.x} ${o.root.y} L ${o.mid.x} ${o.mid.y} L ${o.end.x} ${o.end.y}`;
    return (
      <g>
        <path d={d} stroke={L.line} strokeWidth={w + 7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} stroke={L.limb} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {lower ? <path d={`M ${o.mid.x} ${o.mid.y} L ${o.end.x} ${o.end.y}`} stroke={lower} strokeWidth={w - 3} fill="none" strokeLinecap="round" /> : null}
      </g>
    );
  };
  const arm = (o: { root: P; mid: P; end: P }) => limb(o, 11, L.forearm);
  const leg = (o: { root: P; mid: P; end: P }) => limb(o, 12, L.shin);
  const shoe = (o: { root: P; mid: P; end: P }) => (
    <ellipse cx={o.end.x + pose.facing * 9} cy={o.end.y + 4} rx={22} ry={11} fill={L.shoe} stroke={L.line} strokeWidth={4} />
  );
  // a mitten along the forearm: the palm, the thumb toward the body, two knuckle marks; or a pointing fist
  const hand = (o: { mid: P; end: P }, side: 1 | -1, kind: HandKind) => {
    const ang = (Math.atan2(o.end.x - o.mid.x, o.end.y - o.mid.y) * 180) / Math.PI;
    return (
      <g transform={`translate(${o.end.x} ${o.end.y}) rotate(${-ang})`}>
        {L.fingers && kind === 'open' ? (
          // a real hand: the palm, four fingers and a thumb on the body's side
          <g>
            {[-9, -3, 3, 9].map((fx, k) => (
              <path key={k} d={`M ${fx} 12 L ${fx * 1.25} ${k === 0 ? 27 : k === 3 ? 28 : 32}`} stroke={L.line} strokeWidth={8.5} strokeLinecap="round" />
            ))}
            <path d={`M ${side * 11} 2 L ${side * 19} 14`} stroke={L.line} strokeWidth={9} strokeLinecap="round" />
            <ellipse cx={0} cy={6} rx={13} ry={12} fill={L.hand} stroke={L.line} strokeWidth={3.5} />
            {[-9, -3, 3, 9].map((fx, k) => (
              <path key={k} d={`M ${fx} 12 L ${fx * 1.25} ${k === 0 ? 27 : k === 3 ? 28 : 32}`} stroke={L.hand} strokeWidth={5} strokeLinecap="round" />
            ))}
            <path d={`M ${side * 11} 2 L ${side * 19} 14`} stroke={L.hand} strokeWidth={5.5} strokeLinecap="round" />
          </g>
        ) : kind === 'point' ? (
          <g>
            <rect x={-4} y={10} width={8} height={24} rx={4} fill={L.hand} stroke={L.line} strokeWidth={3.5} />
            <path d="M -11 -2 Q -14 14 -6 18 L 7 18 Q 14 14 11 -2 Z" fill={L.hand} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
            <ellipse cx={side * 10} cy={6} rx={4.5} ry={7} fill={L.hand} stroke={L.line} strokeWidth={3.5} />
          </g>
        ) : (
          <g>
            <ellipse cx={side * 10} cy={3} rx={5.5} ry={9} transform={`rotate(${side * -28} ${side * 10} 3)`} fill={L.hand} stroke={L.line} strokeWidth={4} />
            <ellipse cx={0} cy={10} rx={11} ry={15} fill={L.hand} stroke={L.line} strokeWidth={4} />
            <path d="M -4 17 L -4 23 M 3 18 L 3 24" stroke={L.line} strokeWidth={2} opacity={0.45} strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  };
  const kw = turnWidth(pose.yaw);
  const torso = (
    <g transform={`rotate(${pose.tilt}) translate(${pose.yaw * 6} 0) scale(${kw} 1)`}>
      <path d="M -46 -112 Q 0 -124 46 -112 L 40 2 Q 0 12 -40 2 Z" fill={L.jacket} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 10 -116 Q 30 -114 46 -112 L 40 2 Q 26 8 12 9 Z" fill={L.jacketShade} opacity={0.55} />
      <path d="M 0 -112 L 0 4" stroke={L.jacketShade} strokeWidth={4} />
      {L.extra === 'suit' ? (
        // a white shirt in the V of the jacket and a tie in the accent colour
        <g>
          <path d="M -24 -116 L 0 -54 L 24 -116 Z" fill="#EDE8DE" />
          <path d="M -7 -112 L 7 -112 L 9 -100 L 5 -64 L 0 -56 L -5 -64 L -9 -100 Z" fill={L.accent} />
          <path d="M -26 -116 L 0 -54 M 26 -116 L 0 -54" stroke={L.line} strokeWidth={4} />
        </g>
      ) : (
        <path d="M -22 -118 Q 0 -100 22 -118" stroke={L.accent} strokeWidth={6} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
  const head = (
    <g transform={`rotate(${pose.tilt}) rotate(${pose.headTilt} 0 ${HEAD.y + 40})`}>
      {L.extra === 'bunches'
        ? [-1, 1].map((sd) => {
            const b = bunchAt(sd, pose.yaw);
            return (
              <g key={sd} transform={`rotate(${pose.sway * 0.5} ${b.x} ${HEAD.y - 52})`}>
                <circle cx={b.x} cy={HEAD.y - 52} r={27} fill={L.hair} stroke={L.line} strokeWidth={4} />
              </g>
            );
          })
        : null}
      <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r} fill={L.skin} stroke={L.line} strokeWidth={4} />
      <path d={`M ${HEAD.x + 14} ${HEAD.y + 58} A ${HEAD.r} ${HEAD.r} 0 0 0 ${HEAD.x + 60} ${HEAD.y + 14} A 70 70 0 0 1 ${HEAD.x + 14} ${HEAD.y + 58} Z`} fill={L.skinShade} />
      {L.extra === 'bunches' || L.extra === 'bob' || L.extra === 'suit' || L.extra === 'crop' || L.extra === 'hardhat' || L.extra === 'bun' ? null : (
        <path transform={`translate(${-pose.yaw * 16} 0)`} d={`M -6 ${HEAD.y - 60} q 10 -26 30 -18 q -16 2 -14 16 q -8 -10 -16 2 Z`} fill={L.hair} />
      )}
      {/* short hair for the grown-up costumes: a cap on top that slides to the back of the head as it turns, a nape patch under a hard hat */}
      {(L.extra === 'crop' || L.extra === 'bun' || L.extra === 'hardhat') && (() => {
        const a = Math.abs(pose.yaw);
        const s = pose.yaw === 0 ? 0 : -Math.sign(pose.yaw);
        const top = HEAD.y - 6;
        return (
          <g>
            {L.extra === 'crop' || L.extra === 'bun' ? (
              <g>
                {L.extra === 'bun' ? <circle cx={-pose.yaw * 44} cy={HEAD.y - 68} r={23} fill={L.hair} stroke={L.line} strokeWidth={3} /> : null}
                <path d={`M -64 ${top} A 64 64 0 0 1 64 ${top} Q ${44 + pose.yaw * 10} ${HEAD.y - 34} ${14 + pose.yaw * 10} ${HEAD.y - 46} Q ${-16 + pose.yaw * 10} ${HEAD.y - 40} -64 ${top} Z`} fill={L.hair} stroke={L.line} strokeWidth={2} strokeLinejoin="round" />
                <path d={`M -20 ${HEAD.y - 46} Q 2 ${HEAD.y - 56} 26 ${HEAD.y - 50}`} stroke={L.line} strokeWidth={3} fill="none" opacity={0.3} strokeLinecap="round" />
              </g>
            ) : null}
            <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={L.extra === 'hardhat' ? 34 : 30} stroke={0} />
            {L.extra === 'hardhat' ? (
              <g fill={L.hair} stroke={L.line} strokeWidth={2.5} opacity={1 - a * 0.6}>
                <path d={`M -60 ${HEAD.y - 34} Q -64 ${HEAD.y - 6} -52 ${HEAD.y + 4} Q -52 ${HEAD.y - 14} -44 ${HEAD.y - 32} Z`} />
                <path d={`M 60 ${HEAD.y - 34} Q 64 ${HEAD.y - 6} 52 ${HEAD.y + 4} Q 52 ${HEAD.y - 14} 44 ${HEAD.y - 32} Z`} />
              </g>
            ) : null}
          </g>
        );
      })()}
      {L.extra === 'bunches' ? (
        // the hair covers the skull like the crop (fringe, then the back of the head as she turns); a coral band ties each bunch where it leaves the head
        <g>
          <path d={`M -64 ${HEAD.y - 6} A 64 64 0 0 1 64 ${HEAD.y - 6} Q ${46 + pose.yaw * 12} ${HEAD.y - 30} ${22 + pose.yaw * 12} ${HEAD.y - 38} Q ${pose.yaw * 12} ${HEAD.y - 32} ${-22 + pose.yaw * 12} ${HEAD.y - 38} Q ${-46 + pose.yaw * 12} ${HEAD.y - 30} -64 ${HEAD.y - 6} Z`} fill={L.hair} stroke={L.line} strokeWidth={2} strokeLinejoin="round" />
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={30} stroke={0} />
          {[-1, 1].map((sd) => {
            const b = bunchAt(sd, pose.yaw);
            return b.band > 0 ? <ellipse key={sd} cx={b.x * 0.74} cy={HEAD.y - 40} rx={7} ry={11} transform={`rotate(${b.x * 0.74 * 0.9} ${b.x * 0.74} ${HEAD.y - 40})`} fill={L.accent} stroke={L.line} strokeWidth={2.5} opacity={b.band} /> : null;
          })}
        </g>
      ) : null}
      {L.extra === 'bob' ? (
        // a chin-length bob framing the face, a side parting; turned, it sweeps back and covers the back of the head
        <g>
        <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={36} flare={8} extra={6} stroke={0} />
        <path
          transform={`translate(${-pose.yaw * 14} 0) scale(${1 - 0.22 * Math.abs(pose.yaw)} 1)`}
          d={`M -74 ${HEAD.y + 34} Q -84 ${HEAD.y - 70} 0 ${HEAD.y - 72} Q 84 ${HEAD.y - 70} 74 ${HEAD.y + 34} L 56 ${HEAD.y + 34} Q 60 ${HEAD.y - 20} 40 ${HEAD.y - 40} Q 10 ${HEAD.y - 34} -16 ${HEAD.y - 48} Q -52 ${HEAD.y - 30} -56 ${HEAD.y + 34} Z`}
          fill={L.hair}
          stroke={L.line}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        </g>
      ) : null}
      {L.extra === 'suit' ? (
        // short combed-back hair with a hard side parting
        <path transform={`translate(${-pose.yaw * 14} 0)`} d={`M -60 ${HEAD.y - 18} Q -64 ${HEAD.y - 70} 4 ${HEAD.y - 68} Q 64 ${HEAD.y - 64} 60 ${HEAD.y - 18} Q 52 ${HEAD.y - 44} 18 ${HEAD.y - 46} L 12 ${HEAD.y - 54} L 6 ${HEAD.y - 46} Q -44 ${HEAD.y - 46} -60 ${HEAD.y - 18} Z`} fill={L.hair} />
      ) : null}
      <Face expr={pose.expr} blink={pose.blink} look={pose.look} glasses={pose.glasses} yaw={pose.yaw} ink={L.face} glint={pose.glint} glintColor={pose.glintColor} talk={pose.talk} />
      {L.extra === 'hardhat' ? (
        // a hard hat: dome, a ridge, a brim that leans the way the head turns
        <g transform={`translate(${-pose.yaw * 12} 0)`}>
          <path d={`M -62 ${HEAD.y - 38} Q -66 ${HEAD.y - 96} 0 ${HEAD.y - 98} Q 66 ${HEAD.y - 96} 62 ${HEAD.y - 38} Z`} fill={L.hat ?? '#F2B33D'} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M -14 ${HEAD.y - 96} L -14 ${HEAD.y - 44} M 14 ${HEAD.y - 96} L 14 ${HEAD.y - 44}`} stroke={L.line} strokeWidth={3} opacity={0.35} />
          <path d={`M -46 ${HEAD.y - 60} Q -42 ${HEAD.y - 84} -18 ${HEAD.y - 90}`} stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.45} />
          <rect x={-78 - pose.yaw * 8} y={HEAD.y - 46} width={156} height={13} rx={6} fill={L.hat ?? '#F2B33D'} stroke={L.line} strokeWidth={4} />
        </g>
      ) : null}
      {L.extra === 'curls' ? <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={26} extra={4} stroke={0} /> : null}
      {L.extra === 'curls' ? (
        <g transform={`translate(${-pose.yaw * 12} 0)`}>
          {[-150, -125, -100, -78, -55, -30].map((deg, k) => {
            const a = (deg * Math.PI) / 180;
            return <circle key={k} cx={Math.cos(a) * 54} cy={HEAD.y + Math.sin(a) * 54} r={24} fill={L.hair} />;
          })}
          {/* turned away from the camera, curls wrap round the back of the head */}
          {Math.abs(pose.yaw) > 0.2
            ? [[-26, 50, 21], [-2, 58, 20], [22, 50, 17]].map(([dy, dx, r], k) => (
                <circle key={`bk${k}`} cx={-Math.sign(pose.yaw) * dx * 0.9} cy={HEAD.y + dy} r={r} fill={L.hair} opacity={Math.min(1, (Math.abs(pose.yaw) - 0.2) * 4)} />
              ))
            : null}
        </g>
      ) : null}
    </g>
  );
  return (
    <g>
      {shadow > 0 ? <ellipse cx={pose.x} cy={pose.y + LEG_LEN * pose.scale + 10} rx={70 * pose.scale} ry={12 * pose.scale} fill="#000" opacity={0.25 * shadow} /> : null}
      <g transform={`translate(${pose.x} ${pose.y}) scale(${pose.scale}) rotate(${pose.spin} 0 -90)`} filter={`url(#${rimId})`}>
        <g transform={`translate(0 ${LEG_LEN}) scale(${1 + 0.6 * pose.squash} ${1 - pose.squash}) translate(0 ${-LEG_LEN})`}>
          {/* the far side is drawn first, so a turned body overlaps itself the right way */}
          {pose.yaw < 0 ? <>{leg(j.legR)}{shoe(j.legR)}{leg(j.legL)}{shoe(j.legL)}</> : <>{leg(j.legL)}{shoe(j.legL)}{leg(j.legR)}{shoe(j.legR)}</>}
          {pose.yaw < 0 ? <>{arm(j.armR)}{hand(j.armR, -1, pose.handR)}</> : <>{arm(j.armL)}{hand(j.armL, 1, pose.handL)}</>}
          {torso}
          {pose.yaw < 0 ? <>{arm(j.armL)}{hand(j.armL, 1, pose.handL)}</> : <>{arm(j.armR)}{hand(j.armR, -1, pose.handR)}</>}
          {L.extra === 'hood' ? (
            <g transform={`rotate(${pose.tilt}) rotate(${pose.headTilt * 0.5} 0 ${HEAD.y + 40})`}>
              <path d={`M -70 ${HEAD.y + 14} Q -80 ${HEAD.y - 74} 0 ${HEAD.y - 80} Q 80 ${HEAD.y - 74} 70 ${HEAD.y + 14} Q 52 -100 0 -106 Q -52 -100 -70 ${HEAD.y + 14} Z`} fill={L.jacket} stroke={L.line} strokeWidth={4} />
              {(() => {
                const sw = pose.sway * 0.7 - pose.tilt * 0.6;
                return (
                  <g>
                    <path d={`M -12 -108 Q ${-14 + sw * 0.3} -88 ${-16 + sw} -66 M 12 -108 Q ${14 + sw * 0.3} -88 ${16 + sw} -66`} stroke={L.accent} strokeWidth={5} strokeLinecap="round" fill="none" />
                    <circle cx={-16 + sw} cy={-64} r={5} fill={L.accent} />
                    <circle cx={16 + sw} cy={-64} r={5} fill={L.accent} />
                  </g>
                );
              })()}
            </g>
          ) : null}
          {L.extra === 'curls' ? (
            <g transform={`rotate(${pose.tilt}) translate(${pose.yaw * 6} 0) scale(${kw} 1)`}>
              {/* headphones round the neck: the band follows the body as it turns, the cups come together in profile */}
              <path d="M -46 -110 Q 0 -86 46 -110" stroke="#E06A5A" strokeWidth={8} fill="none" strokeLinecap="round" />
              <rect x={-60} y={-126} width={20 / Math.max(0.6, kw)} height={32} rx={8} fill="#E06A5A" stroke={L.line} strokeWidth={4} />
              <rect x={40 - (20 / Math.max(0.6, kw) - 20)} y={-126} width={20 / Math.max(0.6, kw)} height={32} rx={8} fill="#E06A5A" stroke={L.line} strokeWidth={4} />
            </g>
          ) : null}
          {head}
        </g>
      </g>
    </g>
  );
};


/** A character is the rig in a costume: <Actor> is the same as <Hero>, named for scenes with more than one person. */
export const Actor = Hero;

/**
 * A walk in profile. `phase` advances about 0.6 a frame for a normal walk; `ground` is the floor height under the hips
 * (a number, or a function of x for stairs and slopes). Leans into the step, bobs the head, bends the elbows, swings
 * loose things (the drawstrings) a beat behind the body.
 */
export const walkPose = (x: number, phase: number, ground: number | ((x: number) => number), scale = 0.9, extra: Partial<Pose> = {}, facing: 1 | -1 = 1): Pose => {
  const s = Math.sin(phase);
  const g = typeof ground === 'number' ? ground : ground(x);
  return {
    ...basePose,
    x,
    y: g - LEG_LEN * scale - Math.abs(Math.cos(phase)) * 7,
    scale,
    facing,
    yaw: facing,
    tilt: 5 * facing,
    headTilt: 2 * Math.sin(phase * 2),
    sway: 10 * Math.sin(phase + 0.8),
    legL: { a: 28 * s, b: -Math.max(0, 40 * Math.sin(phase + 1.2)) },
    legR: { a: -28 * s, b: -Math.max(0, 40 * Math.sin(phase + 1.2 + Math.PI)) },
    armL: { a: 24 * s, b: 12 + 14 * Math.abs(s) },
    armR: { a: 24 * s, b: 12 + 14 * Math.abs(s) },
    ...extra,
  };
};

/** Where the feet are for a pose standing at hip y: use it to put a character on a floor (y = floor - feetBelowHips). */
export const feetBelowHips = (scale: number) => LEG_LEN * scale;
