import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { STAND_POSE, StudentTwinBody, StudentTwinHead } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { BedCorner } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';

/**
 * Trailer P1.00 — O05 jumpscare, ngay trước tiếng báo thức.
 * J1: góc nệm ban đêm, Nam ngủ; một bóng người đứng im cạnh lối đi, máy đẩy chậm.
 * J2: cắt phụt vào cận mặt bóng người: gương mặt Nam, nốt ruồi đối bên, cười lạnh, ánh sáng hắt từ dưới.
 * J3: đen. Tên phim và báo thức nằm ở timeline trailer, không trong clip này.
 * Chưa có âm: tiếng "sting" đặt đúng frame đầu J2 (xem P1.00).
 */
export const J1 = 78; // 2,6 giây im lặng, đẩy máy
export const J2 = 12; // 0,4 giây cận mặt
export const J3 = 14; // đen
export const JUMP_TOTAL = J1 + J2 + J3;

const Sleeper = (p: { x: number; y: number; scale: number }) => (
  <g transform={`translate(${p.x} ${p.y}) rotate(-72)`}>
    <StudentTwinHead identity="nam" mood="sleepy" blink view="front" x={0} y={-92 * p.scale} scale={p.scale} id="jump-sleeper" />
  </g>
);

/** Khung rộng: t 0..1 là tiến độ đẩy máy. */
export const JumpWide: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: '#05070b' }}>
    <BedCorner
      night
      door="closed"
      move={{ push: 30 * t }}
      sleeper={Sleeper}
      actors={[{
        at: [214, 262],
        render: (p) => (
          <g style={{ filter: 'brightness(.16) saturate(.4)' }}>
            <StudentTwinBody identity="nguoi-kia" outfit="xanh" mood="eerie_smirk" pose={{ ...STAND_POSE, view: 'three', facing: 1 }} {...p} />
          </g>
        ),
      }]}
    >
      <defs>
        <filter id="jump-shadow"><feColorMatrix type="matrix" values=".07 0 0 0 .01  0 .08 0 0 .015  0 0 .12 0 .03  0 0 0 1 0" /></filter>
      </defs>
      <rect width={1920} height={1080} fill="#02040a" opacity={0.28} />
    </BedCorner>
  </AbsoluteFill>
);

/** Cận mặt: k 0..1 trong 12 frame; rung mạnh, phóng nhẹ. */
export const JumpFace: React.FC<{ k: number }> = ({ k }) => {
  const shake = Math.sin(k * 61) * 14 * (1 - k * 0.5);
  const zoom = 1 + k * 0.08;
  return (
    <AbsoluteFill style={{ background: '#030406' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <defs>
          <linearGradient id="jump-under" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#b9d4ff" stopOpacity=".55" /><stop offset=".55" stopColor="#0b1222" stopOpacity="0" /></linearGradient>
          <filter id="jump-face"><feColorMatrix type="matrix" values=".62 0 0 0 0  0 .66 0 0 .01  0 0 .82 0 .05  0 0 0 1 0" /></filter>
          <radialGradient id="jump-vig" cx=".5" cy=".48" r=".62"><stop offset=".45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".92" /></radialGradient>
        </defs>
        <g transform={`translate(${960 + shake} ${560 + shake * 0.4}) scale(${zoom}) translate(-960 -560)`}>
          <g filter="url(#jump-face)"><StudentTwinHead identity="nguoi-kia" mood="stare_grin" view="front" x={960} y={70} scale={5} id="jump-face-head" /></g>
          <rect width={1920} height={1080} fill="url(#jump-under)" style={{ mixBlendMode: 'screen' }} />
        </g>
        <rect width={1920} height={1080} fill="url(#jump-vig)" />
      </svg>
    </AbsoluteFill>
  );
};

export const HoSo02TrailerJumpscare: React.FC = () => {
  const f = useCurrentFrame();
  if (f < J1) return <JumpWide t={interpolate(f, [0, J1], [0, 1], { easing: (x) => x * x * (3 - 2 * x) })} />;
  if (f < J1 + J2) return <JumpFace k={(f - J1) / J2} />;
  return <AbsoluteFill style={{ background: '#000' }} />;
};

/** Ba khung tĩnh để duyệt: đầu J1, cuối J1, giữa J2. */
export const HoSo02JumpscareBoard: React.FC = () => (
  <div style={{ width: 1920, height: 1080, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', background: '#111' }}>
    {[<JumpWide t={0} />, <JumpWide t={1} />, <JumpFace k={0.3} />, <JumpFace k={0.9} />].map((el, i) => (
      <div key={i} style={{ width: 960, height: 540, overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: 1920, height: 1080, transform: 'scale(.5)', transformOrigin: '0 0', position: 'relative' }}>{el}</div>
      </div>
    ))}
  </div>
);
