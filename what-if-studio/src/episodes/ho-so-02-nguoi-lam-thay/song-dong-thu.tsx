import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FONT } from '../../engine/fonts';
import { mixPose, STAND_POSE, StudentTwinBody, TungSoccer, TWIN_POSES } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { RoomScene } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';
import { easePose, faceBlend, LivingTung, LivingTwin, speak } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/song-dong';

/**
 * Thử "dáng sống" (11/11/2026): Nam ngồi ở bàn học ban đêm, 6 giây. Trái: tư thế như trước (đứng yên, miệng luân phiên, trộn dáng tuyến tính).
 * Phải: lớp sống động (thở, chớp, đầu trôi, tóc, chuyển dáng có đà, khẩu hình có nhịp). Cùng một kịch bản diễn xuất cho cả hai.
 */
export const SONGDONG_TOTAL = 180;
const LOOK = { outline: 'none', headOutline: 'none' } as const;
const TYPE = { ...TWIN_POSES.type, view: 'three' as const, facing: 1 as const };
const LEAN = { ...TWIN_POSES.sit, view: 'three' as const, facing: 1 as const, tilt: 6, neck: -4 };
const lerpT = (f: number, a: number, b: number) => Math.min(1, Math.max(0, (f - a) / (b - a)));

const Pane: React.FC<{ f: number; live: boolean; title: string }> = ({ f, live, title }) => {
  const t = lerpT(f, 100, 124);
  const face = faceBlend(f, 70, 'buon-01', 'suy-luan-02');
  const talkOld = f >= 130 && f < 175 && f % 10 < 5 ? { shape: 'closed' as const, open: 0.25 } : undefined;
  const actor = {
    at: [396, 112] as [number, number],
    render: (p: { x: number; y: number; scale: number }) => live
      ? <LivingTwin {...LOOK} {...p} frame={f} seed={2} mood="sleepy" pose={easePose(TYPE, LEAN, t, { anticipate: 3 })} talk={speak(f, 130, 175, 2)} {...face} />
      : <StudentTwinBody {...LOOK} {...p} mood="sleepy" pose={mixPose(TYPE, LEAN, t)} talk={talkOld} face={f >= 70 ? 'suy-luan-02' : 'buon-01'} />,
  };
  return (
    <div style={{ position: 'relative', width: 960, height: 540, overflow: 'hidden' }}>
      <svg width={960} height={540} viewBox="800 230 1120 630" style={{ position: 'absolute', inset: 0 }}>
        <RoomScene night phone="desk" kitchen="clean" chair="desk" view="desk" frame={live ? f : null} actors={[actor]} />
      </svg>
      <div style={{ position: 'absolute', left: 18, top: 14, fontFamily: FONT.title, fontSize: 26, color: '#f1ead9', textShadow: '0 2px 6px #000', letterSpacing: 2 }}>{title}</div>
    </div>
  );
};
export const HoSo02SongDongThu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#000', flexDirection: 'row' }}>
      <Pane f={f} live={false} title="TRƯỚC · đứng yên" />
      <Pane f={f} live title="SAU · dáng sống" />
    </AbsoluteFill>
  );
};

// --- Bản khung rộng: hai người đứng trong phòng, thấy thở ở vai, dịch trọng tâm, đổi dáng có đà. `amount` 1,3. ---
export const SONGDONG_WIDE_TOTAL = 210;
const STAND = { ...STAND_POSE, view: 'three' as const, facing: 1 as const };
const REACH = { ...TWIN_POSES.stop, view: 'three' as const, facing: 1 as const };
const PaneWide: React.FC<{ f: number; live: boolean; title: string }> = ({ f, live, title }) => {
  const t = lerpT(f, 110, 140), back = lerpT(f, 160, 190);
  const nam = {
    at: [200, 240] as [number, number],
    render: (p: { x: number; y: number; scale: number }) => live
      ? <LivingTwin {...LOOK} {...p} frame={f} seed={2} life={{ amount: 1.3 }} mood="sleepy" pose={easePose(easePose(STAND, REACH, t, { anticipate: 3 }), STAND, back)} talk={speak(f, 40, 100, 2)} {...faceBlend(f, 100, 'buon-01', 'tuc-gian-01')} />
      : <StudentTwinBody {...LOOK} {...p} mood="sleepy" pose={mixPose(mixPose(STAND, REACH, t), STAND, back)} talk={f >= 40 && f < 100 && f % 10 < 5 ? { shape: 'closed' as const, open: 0.25 } : undefined} face={f >= 100 ? 'tuc-gian-01' : 'buon-01'} />,
  };
  const tung = {
    at: [300, 250] as [number, number],
    render: (p: { x: number; y: number; scale: number }) => live
      ? <LivingTung {...p} frame={f} life={{ amount: 1.3 }} mood="annoyed" />
      : <TungSoccer {...p} mood="annoyed" />,
  };
  return (
    <div style={{ position: 'relative', width: 960, height: 540, overflow: 'hidden' }}>
      <svg width={960} height={540} viewBox="300 140 1200 675" style={{ position: 'absolute', inset: 0 }}>
        <RoomScene door="ajar" chair="bed" kitchen="clean" rays={0.9} frame={live ? f : null} actors={[tung, nam]} />
      </svg>
      <div style={{ position: 'absolute', left: 18, top: 14, fontFamily: FONT.title, fontSize: 26, color: '#f1ead9', textShadow: '0 2px 6px #000', letterSpacing: 2 }}>{title}</div>
    </div>
  );
};
export const HoSo02SongDongRong: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#000', flexDirection: 'row' }}>
      <PaneWide f={f} live={false} title="TRƯỚC · đứng yên" />
      <PaneWide f={f} live title="SAU · dáng sống" />
    </AbsoluteFill>
  );
};
