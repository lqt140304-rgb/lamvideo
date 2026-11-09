import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { HoSo02CharacterMasterBoard, JointPose, mixPose, PALETTE, sampleWalk, STAND_POSE, StudentTwinBody, TungSoccer, turnAt, TWIN_POSES } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';

// Bảng kiểm tra khớp Hồ sơ 2: mỗi nhân vật đi từ dáng đứng sang một tư thế rồi quay về (120 frame).
export const RIG_SHEET_TOTAL = 120;
const NAMES = ['stand', 'sit', 'stride', 'crouch', 'reach', 'holdBowl', 'stop'] as const;
const NAMES2 = ['wary', 'phone', 'offer', 'type'] as const;
const MOODS = ['sleepy', 'hesitant', 'annoyed', 'scared', 'agitated', 'suspicious', 'shocked'] as const; // mỗi tư thế một biểu cảm để soi luôn mặt

// Bảng các góc theo ảnh mẫu goc-quay-mau.png; giữa clip chuyển sang dáng bước để soi khớp.
const TURN: { label: string; view: NonNullable<JointPose['view']>; facing?: 1 | -1 }[] = [
  { label: 'CHÍNH DIỆN', view: 'front' }, { label: '3/4', view: 'three' }, { label: 'NGHIÊNG', view: 'side' }, { label: '1/4', view: 'quarter' }, { label: 'SAU LƯNG', view: 'back' },
  { label: '1/4 TRÁI', view: 'quarter', facing: -1 }, { label: 'NGHIÊNG TRÁI', view: 'side', facing: -1 }, { label: '3/4 TRÁI', view: 'three', facing: -1 },
];
const COL = 232;
export const HoSo02Turnaround: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 45, 75, 120], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#f6f1e8' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {TURN.map((c, i) => {
          const pose = { ...mixPose(STAND_POSE, TWIN_POSES.stride, t), view: c.view, facing: c.facing };
          return (
            <g key={c.label}>
              <StudentTwinBody pose={pose} x={148 + i * COL} y={24} scale={0.74} />
              <TungSoccer pose={pose} x={148 + i * COL} y={544} scale={0.74} mood="normal" />
              <text x={148 + i * COL} y={500} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={22} fontWeight={700} fill="#515956">{c.label}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// Xoay tròn tại chỗ, vừa nói vừa chớp mắt: mỗi góc giữ 4 frame.
export const SPIN_TOTAL = 64;
const TALK = ['a', 'closed', 'o', 'e', 'closed', 'u'] as const;
export const HoSo02Spin: React.FC = () => {
  const frame = useCurrentFrame();
  const one = turnAt({ view: 'front' }, { view: 'back' }, Math.min(1, (frame % 32) / 16));
  const back = turnAt({ view: 'back' }, { view: 'front' }, Math.max(0, ((frame % 32) - 16) / 16));
  const v = (frame % 32) < 16 ? one : back; // hai nửa vòng nối nhau thành một vòng xoay liền
  const talk = { shape: TALK[Math.floor(frame / 4) % TALK.length], open: 0.7 };
  const blink = frame % 24 < 2;
  const pose = { ...STAND_POSE, view: v.view, facing: v.facing };
  return (
    <AbsoluteFill style={{ background: '#f6f1e8' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <StudentTwinBody pose={pose} x={560} y={90} scale={1.4} talk={talk} blink={blink} />
        <TungSoccer pose={{ ...pose, armL: STAND_POSE.armL, handL: 'rest' }} x={1360} y={90} scale={1.4} mood="normal" talk={talk} blink={blink} />
      </svg>
    </AbsoluteFill>
  );
};

export const HoSo02CastBoard: React.FC = () => <AbsoluteFill><HoSo02CharacterMasterBoard /></AbsoluteFill>;

export const HoSo02RigSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 45, 75, 120], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#f6f1e8' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {NAMES.map((n, i) => (
          <g key={n}>
            <StudentTwinBody mood={MOODS[i]} pose={mixPose(STAND_POSE, TWIN_POSES[n], t)} x={150 + i * 235} y={40} scale={0.72} />
            <text x={150 + i * 235} y={500} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={26} fontWeight={700} fill="#515956">{n}</text>
          </g>
        ))}
        {NAMES2.map((n, i) => (
          <g key={n}>
            <StudentTwinBody mood={i === 0 ? 'suspicious' : 'calm'} pose={mixPose(STAND_POSE, TWIN_POSES[n], t)} x={190 + i * 230} y={540} scale={0.72} />
            <text x={190 + i * 230} y={1015} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={26} fontWeight={700} fill="#515956">{n}</text>
          </g>
        ))}
        <StudentTwinBody mood="calm" pose={sampleWalk(frame / 30)} x={1110} y={540} scale={0.72} />
        <text x={1110} y={1015} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={26} fontWeight={700} fill="#515956">walk</text>
        <TungSoccer x={1325} y={540} scale={0.72} pose={mixPose(STAND_POSE, TWIN_POSES.reach, t)} />
        <StudentTwinBody mood="calm" shirt={PALETTE.nam.sleepShirt} pose={mixPose(STAND_POSE, TWIN_POSES.holdBowl, t)} x={1560} y={540} scale={0.72} />
      </svg>
    </AbsoluteFill>
  );
};
