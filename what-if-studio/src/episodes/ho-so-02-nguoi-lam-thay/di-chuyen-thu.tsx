import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FONT } from '../../engine/fonts';
import { JointPose, STAND_POSE, PALETTE, TWIN_POSES } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { LIGHT_SOURCES, lightFor, RoomScene, screenOf } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';
import { easePose, speak } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/song-dong';
import { LivingNam25D } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/song-dong';
import { exprTrack } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/cam-xuc-2-5d';
import { walkEnd, walker, WalkPlan } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/di-chuyen';
import { reachWorld, seatAnchor, seatedAt, SURFACES, V3 } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/diem-tiep-xuc';

/**
 * Thử "hoà vào môi trường" (11/11/2026): Nam đi từ cửa tới bàn học, rẽ, ngồi xuống ghế, gõ phím rồi cầm điện thoại.
 * Mọi vị trí lấy từ toạ độ SÀN và điểm 3D của cảnh: đường đi (di-chuyen.tsx), hông–ghế, tay–mặt bàn, chân–sàn (diem-tiep-xuc.tsx).
 * Góc nhân vật theo hướng đi nhìn từ máy; che khuất và bóng tiếp xúc do RoomScene tính theo vị trí. Lớp chú thích (đường đi, điểm khoá)
 * bật bằng `guide` để thấy các điểm neo; tắt thì chỉ còn cảnh.
 */
const VIEW = 'wide' as const;
const PLAN: WalkPlan = { points: [[28, 218], [150, 175], [330, 140], [396, 160]], speed: 90, start: 14, endFacing: [0, -1] };
const WALK_END = walkEnd(PLAN);
const SIT0 = WALK_END + 8, SIT1 = SIT0 + 30, TYPE1 = SIT1 + 80, PHONE1 = TYPE1 + 28, END_HOLD = PHONE1 + 50;
export const DICHUYEN_TOTAL = END_HOLD;
const seat = seatAnchor('desk');
const SEATED = seatedAt(VIEW, 'desk', { hands: { R: [388, SURFACES.deskTop + 2, 64], L: [410, SURFACES.deskTop + 2, 65] } });
const ph = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const stateAt = (f: number): { at: [number, number]; pose: JointPose; cue: string } => {
  if (f < SIT0) { const w = walker(VIEW, PLAN, f); return { at: w.at, pose: w.pose, cue: w.moving ? 'đi' : 'đứng' }; }
  const standEnd = walker(VIEW, PLAN, WALK_END).pose;
  if (f < SIT1) {
    const u = clamp01((f - SIT0) / (SIT1 - SIT0));
    const from: [number, number] = [396, 160];
    return { at: [from[0] + (seat.at[0] - from[0]) * ph(u), from[1] + (seat.at[1] - from[1]) * ph(u)], pose: easePose({ ...STAND_POSE, view: standEnd.view, facing: standEnd.facing }, SEATED.pose, u, { anticipate: 2 }), cue: 'ngồi xuống' };
  }
  if (f < TYPE1) {
    const k = Math.sin(f * 1.7) * 0.5 + 0.5;
    return { at: SEATED.at, pose: { ...SEATED.pose, armR: { ...SEATED.pose.armR, a: SEATED.pose.armR.a + k * 2.5 }, armL: { ...SEATED.pose.armL, a: SEATED.pose.armL.a - k * 2 } }, cue: 'gõ phím' };
  }
  const t = ph(clamp01((f - TYPE1) / (PHONE1 - TYPE1)));
  const phone: V3 = [seat.at[0] - 4, 108, seat.at[1] - 26];
  let up: JointPose = { ...SEATED.pose, prop: 'phone', handR: 'phone', frontR: true };
  up = reachWorld(VIEW, seat.at, up, 'R', phone, { w: 0.15 });
  return { at: SEATED.at, pose: easePose(SEATED.pose, { ...up, neck: 2 }, t), cue: t > 0 ? 'cầm điện thoại' : 'gõ phím' };
};

const Guide: React.FC<{ cue: string; at: [number, number]; f: number }> = ({ cue, at, f }) => {
  const P = (x: number, z: number) => screenOf(VIEW, [x, 0, z]);
  const pts = PLAN.points.map(([x, z]) => P(x, z));
  const s = screenOf(VIEW, [seat.at[0], seat.top, seat.at[1]]);
  const hands = ([[388, 64], [410, 65]] as [number, number][]).map(([x, z]) => screenOf(VIEW, [x, SURFACES.deskTop + 2, z]));
  const cur = P(at[0], at[1]);
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#ffe27a" strokeWidth={4} strokeDasharray="12 10" opacity={0.85} />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={9} fill={i === 0 ? '#7be0a0' : i === pts.length - 1 ? '#ff7a7a' : '#ffe27a'} stroke="#1b1b1b" strokeWidth={2} />)}
      <ellipse cx={cur[0]} cy={cur[1]} rx={46} ry={10} fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.9} />
      <circle cx={s[0]} cy={s[1]} r={10} fill="#6fc3ff" stroke="#10202b" strokeWidth={3} />
      {hands.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={8} fill="#ff9ad5" stroke="#2a1020" strokeWidth={3} />)}
      <g fontFamily={FONT.title} fontSize={30} fill="#fff" style={{ paintOrder: 'stroke' }} stroke="#000" strokeWidth={5}>
        <text x={36} y={64}>HOÀ VÀO MÔI TRƯỜNG · thử đường đi + điểm khoá</text>
        <text x={36} y={104} fontSize={26}>{`khung ${f} · ${cue}`}</text>
        <text x={36} y={1040} fontSize={22}>vàng: đường đi trên sàn · xanh: mặt ghế · hồng: mặt bàn · trắng: điểm chân</text>
      </g>
    </svg>
  );
};

export const HoSo02DiChuyenThu: React.FC<{ guide?: boolean }> = ({ guide = true }) => {
  const f = useCurrentFrame();
  const st = stateAt(f), d = lightFor(VIEW, st.at, LIGHT_SOURCES.window);
  const talking = f > TYPE1 + 10 ? speak(f, TYPE1 + 14, PHONE1 + 40, 2) : undefined;
  const expr = exprTrack(f, [[0, 'binh-than-1'], [SIT1, 'quyet-tam-1'], [TYPE1, 'suy-luan-2'], [PHONE1, 'bat-ngo-1']], 14);
  const actor = {
    at: st.at, lit: false,
    render: (p: { x: number; y: number; scale: number }) => (
      <LivingNam25D {...p} frame={f} seed={2} pose={st.pose} expr={expr} talk={talking} lighting="ngay" lightDir={[d.x, d.y]} shirt={PALETTE.nam.sleepShirt} life={{ amount: st.cue === 'đi' ? 0.4 : 1 }} />
    ),
  };
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <RoomScene view={VIEW} rays={0.8} falloff={0.8} door="ajar" chair="desk" phone="hidden" kitchen="clean" frame={f} actors={[actor]} />
      {guide && <Guide cue={st.cue} at={st.at} f={f} />}
    </AbsoluteFill>
  );
};
