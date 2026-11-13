import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FONT } from '../../engine/fonts';
import { JointPose, PALETTE, TUNG_POSE } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { LIGHT_SOURCES, lightFor, RoomScene } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';
import { LivingNam25D, LivingTung25D, speak } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/song-dong';
import { exprTrack } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/cam-xuc-2-5d';
import { walkEnd, walker, WalkPlan } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/di-chuyen';
import { ChairState, seatedBlend, seating, SeatingPlan, seatingEnd } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/diem-tiep-xuc';
import { DANG_THAM_CHIEU } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/thiet-ke/thu-2-5d/nam-2-5d';
import { TUNG_DANG } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/thiet-ke/thu-2-5d/nhan-vat-khac-2-5d';
import { DEFAULT_BUILD } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { armHint } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/tay-ik';

/**
 * VÍ DỤ NGẮN gom mọi thứ đã làm (11/11/2026), ban ngày, một cú máy toàn phòng, ~14 giây:
 *  - Nam đi từ cửa tới bàn theo đường trên sàn (góc nhìn đổi theo hướng đi, chân không trượt), đứng cạnh chiếc ghế đang kéo ra, lùi người ngồi xuống,
 *    xoay ghế về phía bàn và kéo ghế vào (ghế trượt và quay thật), tay đặt lên mặt bàn.
 *  - Tùng bước vào cửa, đi chéo về phía máy (che khuất sau nệm, bóng và độ ngả theo sàn), dừng lại vẫy tay.
 *  - Mặt 2.5D tham số: Nam bình thản → suy luận → bất ngờ → vui; Tùng nghiêm → vui, có khẩu hình tạm.
 *  - Dáng sống (thở, chớp, trôi), môi trường chuyển động (quạt, rèm, bụi trong nắng), ánh sáng theo từng mặt, ngả người theo mặt sàn.
 */
const VIEW = 'wide' as const, TILT = 1;
const NAM_LEG = { thigh: DANG_THAM_CHIEU.thigh ?? 105, shin: DANG_THAM_CHIEU.shin ?? 105 }, TUNG_LEG = { thigh: TUNG_DANG.thigh ?? 105, shin: TUNG_DANG.shin ?? 105 };
const NAM: WalkPlan = { points: [[28, 218], [150, 175], [330, 140], [372, 146]], speed: 70, start: 12, endFacing: [-1, 0] };
const NAM_END = walkEnd(NAM);
// ghế kéo ra và xoay về phía cửa: Nam đứng cạnh, lùi người ngồi xuống, rồi xoay ghế về bàn và kéo ghế vào
const SEATING: SeatingPlan = { chair: 'desk', standAt: [372, 146], pulled: { dx: 0, dz: 34, rot: Math.PI / 2 }, t0: NAM_END + 4, sit: 26, hold: 14, swivel: 36 };
const SEAT_END = seatingEnd(SEATING);
const TUNG: WalkPlan = { points: [[24, 236], [110, 300], [200, 350]], speed: 80, start: SEAT_END + 14, endFacing: [1, 1] };
const TUNG_END = walkEnd(TUNG);
export const VD_TOTAL = TUNG_END + 130;
const SWIVEL0 = TUNG_END - 54, SWIVEL_ROT = 2.0; // quay ghế sang trái về phía Tùng
const fo = { build: DANG_THAM_CHIEU, floorTilt: TILT };
const ph = (t: number) => t * t * (3 - 2 * t);
const cl = (v: number) => Math.min(1, Math.max(0, v));

const namAt = (f: number): { at: [number, number]; pose: JointPose; walking: boolean; chair: ChairState } => {
  if (f < SEATING.t0) { const w = walker(VIEW, NAM, f, { leg: NAM_LEG }); return { at: w.at, pose: w.pose, walking: w.moving, chair: SEATING.pulled }; }
  if (f < SEAT_END) { const s = seating(VIEW, SEATING, f, fo); return { at: s.at, pose: s.pose, walking: false, chair: s.chair }; }
  if (f >= SWIVEL0) {
    // quay ghế về phía Tùng: ghế xoay (RoomScene chairPush), góc nhìn đi qua các góc trung gian, tay rời bàn về lòng
    const u = ph(cl((f - SWIVEL0) / 24)), st: ChairState = { dx: 0, dz: 0, rot: SWIVEL_ROT * u }, b = seatedBlend(VIEW, 'desk', st, fo);
    return { at: b.at, pose: b.pose, walking: false, chair: st };
  }
  const st: ChairState = { dx: 0, dz: 0, rot: 0 }, b = seatedBlend(VIEW, 'desk', st, fo), k = Math.sin(f * 1.7) * 0.5 + 0.5, typing = f < SWIVEL0 - 8;
  return { at: b.at, pose: { ...b.pose, armR: { ...b.pose.armR, a: b.pose.armR.a + (typing ? k * 2.5 : 0) }, armL: { ...b.pose.armL, a: b.pose.armL.a - (typing ? k * 2 : 0) } }, walking: false, chair: st };
};

const tungAt = (f: number): { at: [number, number]; pose: JointPose; waving: boolean; moving: boolean } => {
  const w = walker(VIEW, TUNG, f, { idle: TUNG_POSE, leg: TUNG_LEG });
  let pose = w.pose;
  const wave = cl((f - TUNG_END - 6) / 14);
  if (wave > 0 && !w.moving) {
    // vẫy tay phải (bên trái màn hình khi nhìn chính diện) lên cao, lắc cổ tay
    const wig = Math.sin((f - TUNG_END) * 0.55) * 14 * wave;
    pose = armHint({ ...pose, handR: 'open', frontR: false }, 'R', [-96 + wig, 232 - 170 * wave], [-132, 232 - 80 * wave], 0.3, { ...DEFAULT_BUILD, ...TUNG_DANG });
    pose = { ...pose, wristR: wig * 1.2 };
  }
  return { at: w.at, pose, waving: wave > 0, moving: w.moving };
};

export const HoSo02VdHoaMoiTruong: React.FC = () => {
  const f = useCurrentFrame();
  const nam = namAt(f), tung = tungAt(f);
  const dn = lightFor(VIEW, nam.at, LIGHT_SOURCES.window), dt = lightFor(VIEW, tung.at, LIGHT_SOURCES.window);
  const namExpr = exprTrack(f, [[0, 'binh-than-1'], [SEAT_END, 'quyet-tam-1'], [TUNG.start! + 40, 'suy-luan-2'], [TUNG_END - 40, 'bat-ngo-2'], [TUNG_END + 12, 'vui-2']], 14);
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
      <RoomScene view={VIEW} rays={0.8} falloff={0.8} door="ajar" chair="desk" chairPush={nam.chair} phone="hidden" kitchen="clean" frame={f} floorTilt={TILT} actors={actors} />
      <div style={{ position: 'absolute', left: 36, bottom: 30, fontFamily: FONT.title, fontSize: 26, color: '#f4ecda', textShadow: '0 2px 8px #000', letterSpacing: 2, opacity: cap }}>VÍ DỤ NGẮN · đi, ngồi, che khuất, bóng, cảm xúc 2.5D</div>
    </AbsoluteFill>
  );
};
