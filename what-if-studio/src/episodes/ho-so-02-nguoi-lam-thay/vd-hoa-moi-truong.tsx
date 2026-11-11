import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FONT } from '../../engine/fonts';
import { JointPose, PALETTE, STAND_POSE, TUNG_POSE, turnAt, TWIN_POSES } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { LIGHT_SOURCES, lightFor, RoomScene } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';
import { easePose, LivingNam25D, LivingTung25D, speak } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/song-dong';
import { exprTrack } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/cam-xuc-2-5d';
import { walkEnd, walker, WalkPlan } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/di-chuyen';
import { seatAnchor, seatedAt, sitLegs, SURFACES } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/diem-tiep-xuc';
import { armHint } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/tay-ik';

/**
 * VÍ DỤ NGẮN gom mọi thứ đã làm (11/11/2026), ban ngày, một cú máy toàn phòng, ~14 giây:
 *  - Nam đi từ cửa tới bàn theo đường trên sàn (góc nhìn đổi theo hướng đi, chân không trượt), rẽ, ngồi đúng ghế, tay đặt lên mặt bàn.
 *  - Tùng bước vào cửa, đi chéo về phía máy (che khuất sau nệm, bóng và độ ngả theo sàn), dừng lại vẫy tay.
 *  - Mặt 2.5D tham số: Nam bình thản → suy luận → bất ngờ → vui; Tùng nghiêm → vui, có khẩu hình tạm.
 *  - Dáng sống (thở, chớp, trôi), môi trường chuyển động (quạt, rèm, bụi trong nắng), ánh sáng theo từng mặt, ngả người theo mặt sàn.
 */
const VIEW = 'wide' as const, TILT = 1;
const NAM: WalkPlan = { points: [[28, 218], [150, 175], [330, 140], [396, 160]], speed: 90, start: 12, endFacing: [0, -1] };
const NAM_END = walkEnd(NAM), SIT0 = NAM_END + 8, SIT1 = SIT0 + 30, TYPE1 = SIT1 + 120;
const TUNG: WalkPlan = { points: [[24, 236], [110, 300], [200, 350]], speed: 100, start: SIT1 + 24, endFacing: [1, 1] };
const TUNG_END = walkEnd(TUNG);
export const VD_TOTAL = TUNG_END + 120;
const SWIVEL0 = TUNG_END - 46, SWIVEL1 = SWIVEL0 + 22;
const seat = seatAnchor('desk');
const SEATED = seatedAt(VIEW, 'desk', { hands: { R: [388, SURFACES.deskTop + 2, 64], L: [410, SURFACES.deskTop + 2, 65] }, floorTilt: TILT });
const ph = (t: number) => t * t * (3 - 2 * t);
const cl = (v: number) => Math.min(1, Math.max(0, v));

const namAt = (f: number): { at: [number, number]; pose: JointPose; walking: boolean } => {
  if (f < SIT0) { const w = walker(VIEW, NAM, f); return { at: w.at, pose: w.pose, walking: w.moving }; }
  const end = walker(VIEW, NAM, NAM_END).pose;
  if (f < SIT1) {
    const u = cl((f - SIT0) / (SIT1 - SIT0)), from: [number, number] = [396, 160];
    return { at: [from[0] + (seat.at[0] - from[0]) * ph(u), from[1] + (seat.at[1] - from[1]) * ph(u)], pose: easePose({ ...STAND_POSE, view: end.view, facing: end.facing }, SEATED.pose, u, { anticipate: 2 }), walking: false };
  }
  if (f >= SWIVEL0) {
    // quay ghế về phía Tùng: góc nhìn đi qua 1/4 → nghiêng → 3/4 (turnAt), hai tay rời bàn về lòng, chân giải lại theo góc mới
    const u = cl((f - SWIVEL0) / (SWIVEL1 - SWIVEL0)), r = turnAt({ view: 'back', facing: 1 }, { view: 'three', facing: -1 }, u);
    const legs3 = sitLegs(SURFACES.seatTop, { view: 'three', heightCm: 168 * 0.93 });
    const lap: JointPose = { ...TWIN_POSES.sit, ...legs3, view: 'three', facing: -1, tilt: 5, neck: 4 };
    const e = easePose(SEATED.pose, lap, ph(u), { anticipate: 0 });
    return { at: SEATED.at, pose: { ...e, view: r.view, facing: r.facing, ...(ph(u) > 0.5 ? { legR: legs3.legR, legL: legs3.legL } : {}) }, walking: false };
  }
  const k = Math.sin(f * 1.7) * 0.5 + 0.5, typing = f < TYPE1 + 40;
  return { at: SEATED.at, pose: { ...SEATED.pose, armR: { ...SEATED.pose.armR, a: SEATED.pose.armR.a + (typing ? k * 2.5 : 0) }, armL: { ...SEATED.pose.armL, a: SEATED.pose.armL.a - (typing ? k * 2 : 0) } }, walking: false };
};

const tungAt = (f: number): { at: [number, number]; pose: JointPose; waving: boolean; moving: boolean } => {
  const w = walker(VIEW, TUNG, f, { idle: TUNG_POSE });
  let pose = w.pose;
  const wave = cl((f - TUNG_END - 6) / 14);
  if (wave > 0 && !w.moving) {
    // vẫy tay phải (bên trái màn hình khi nhìn chính diện) lên cao, lắc cổ tay
    const wig = Math.sin((f - TUNG_END) * 0.55) * 14 * wave;
    pose = armHint({ ...pose, handR: 'open', frontR: false }, 'R', [-96 + wig, 232 - 170 * wave], [-132, 232 - 80 * wave], 0.3);
    pose = { ...pose, wristR: wig * 1.2 };
  }
  return { at: w.at, pose, waving: wave > 0, moving: w.moving };
};

export const HoSo02VdHoaMoiTruong: React.FC = () => {
  const f = useCurrentFrame();
  const nam = namAt(f), tung = tungAt(f);
  const dn = lightFor(VIEW, nam.at, LIGHT_SOURCES.window), dt = lightFor(VIEW, tung.at, LIGHT_SOURCES.window);
  const namExpr = exprTrack(f, [[0, 'binh-than-1'], [SIT1, 'quyet-tam-1'], [TUNG.start! + 40, 'suy-luan-2'], [TUNG_END - 40, 'bat-ngo-2'], [TUNG_END + 12, 'vui-2']], 14);
  const tungExpr = exprTrack(f, [[0, 'quyet-tam-1'], [TUNG_END, 'vui-2'], [TUNG_END + 40, 'vui-3']], 12);
  const namTalk = f > TUNG_END + 30 ? speak(f, TUNG_END + 30, TUNG_END + 80, 2) : undefined;
  const tungTalk = f > TUNG_END + 10 ? speak(f, TUNG_END + 10, TUNG_END + 70, 5) : undefined;
  const actors = [
    { at: nam.at, lit: false, render: (p: { x: number; y: number; scale: number }) => <LivingNam25D {...p} frame={f} seed={2} pose={nam.pose} expr={namExpr} talk={namTalk} lighting="ngay" lightDir={[dn.x, dn.y]} shirt={PALETTE.nam.sleepShirt} life={{ amount: nam.walking ? 0.4 : 1 }} /> },
    ...(f >= TUNG.start! ? [{ at: tung.at, lit: false, render: (p: { x: number; y: number; scale: number }) => <LivingTung25D {...p} frame={f} seed={11} pose={tung.pose} expr={tungExpr} talk={tungTalk} lighting="ngay" lightDir={[dt.x, dt.y]} life={{ amount: tung.moving ? 0.4 : 1 }} /> }] : []),
  ];
  const cap = f < 60 ? 1 : 0;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <RoomScene view={VIEW} rays={0.8} falloff={0.8} door="ajar" chair="desk" phone="hidden" kitchen="clean" frame={f} floorTilt={TILT} actors={actors} />
      <div style={{ position: 'absolute', left: 36, bottom: 30, fontFamily: FONT.title, fontSize: 26, color: '#f4ecda', textShadow: '0 2px 8px #000', letterSpacing: 2, opacity: cap }}>VÍ DỤ NGẮN · đi, ngồi, che khuất, bóng, cảm xúc 2.5D</div>
    </AbsoluteFill>
  );
};
