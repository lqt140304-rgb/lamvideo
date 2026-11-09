import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { HoSo02CharacterMasterBoard, JointPose, STAND_POSE, StudentTwinBody, TungSoccer, TWIN_POSES } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';

// Bảng kiểm tra khớp Hồ sơ 2: mỗi nhân vật đi từ dáng đứng sang một tư thế rồi quay về (120 frame).
export const RIG_SHEET_TOTAL = 120;
const NAMES = ['stand', 'sit', 'stride', 'crouch', 'reach', 'holdBowl', 'stop'] as const;

const mixLimb = (a: JointPose['armR'], b: JointPose['armR'], t: number) => ({ a: a.a + (b.a - a.a) * t, b: a.b + (b.b - a.b) * t, rot: b.rot });
const mixPose = (a: JointPose, b: JointPose, t: number): JointPose => ({
  ...b,
  tilt: a.tilt + (b.tilt - a.tilt) * t, neck: a.neck + (b.neck - a.neck) * t,
  armR: mixLimb(a.armR, b.armR, t), armL: mixLimb(a.armL, b.armL, t), legR: mixLimb(a.legR, b.legR, t), legL: mixLimb(a.legL, b.legL, t),
  wristR: a.wristR + (b.wristR - a.wristR) * t, wristL: a.wristL + (b.wristL - a.wristL) * t,
});

export const HoSo02CastBoard: React.FC = () => <AbsoluteFill><HoSo02CharacterMasterBoard /></AbsoluteFill>;

export const HoSo02RigSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 45, 75, 120], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#f6f1e8' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {NAMES.map((n, i) => (
          <g key={n}>
            <StudentTwinBody id={`sheet-${n}`} mood={n === 'stop' ? 'shocked' : 'sleepy'} pose={mixPose(STAND_POSE, TWIN_POSES[n], t)} x={150 + i * 235} y={40} scale={0.72} />
            <text x={150 + i * 235} y={500} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={26} fontWeight={700} fill="#515956">{n}</text>
          </g>
        ))}
        <TungSoccer x={300} y={540} scale={0.85} />
        <TungSoccer x={700} y={540} scale={0.85} pose={mixPose(STAND_POSE, TWIN_POSES.stride, t)} />
        <TungSoccer x={1100} y={540} scale={0.85} pose={mixPose(STAND_POSE, TWIN_POSES.reach, t)} />
        <StudentTwinBody id="sheet-big" mood="calm" pose={mixPose(STAND_POSE, TWIN_POSES.holdBowl, t)} x={1560} y={540} scale={0.85} />
      </svg>
    </AbsoluteFill>
  );
};
