import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { STAND_POSE, StudentTwinBody, StudentTwinHead } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { RoomNight } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';

/**
 * Trailer P1.00 — O05 jumpscare, ngay trước tiếng báo thức.
 * J1: toàn phòng ban đêm, Nam ngủ; một bóng đen đứng im ở lối đi cạnh nệm, gần như tan vào bóng tối. Máy đẩy rất chậm.
 *     Gần cuối J1, hai đốm mắt trong bóng đen sáng lên.
 * J2: cắt phụt vào cận mặt: gương mặt Nam (nốt ruồi bên phải), trừng mắt, cười toét, sáng hắt từ dưới, rung và lệch màu.
 * J3: đen. Tên phim và báo thức nằm ở timeline trailer, không trong clip này.
 * Âm: tiếng phòng ở J1, tiếng hù đúng frame đầu J2 (file thư viện chép vào public, xem P1.00).
 */
export const J1 = 78; // 2,6 giây gần như im lặng, đẩy máy
export const EYES_ON = 56; // frame hai đốm mắt sáng lên
export const J2 = 12; // 0,4 giây cận mặt
export const J3 = 14; // đen
export const JUMP_TOTAL = J1 + J2 + J3;
const FIGURE_AT: [number, number] = [218, 300];

const Sleeper = (p: { x: number; y: number; scale: number }) => (
  <g transform={`translate(${p.x} ${p.y}) rotate(-72)`}>
    <StudentTwinHead identity="nam" mood="sleepy" blink view="front" x={0} y={-92 * p.scale} scale={p.scale} id="jump-sleeper" />
  </g>
);

/** Khung rộng: t 0..1 là tiến độ đẩy máy, eyes 0..1 độ sáng hai đốm mắt. */
export const JumpWide: React.FC<{ t: number; eyes?: number }> = ({ t, eyes = 0 }) => (
  <AbsoluteFill style={{ background: '#05070b' }}>
    <RoomNight
      door="closed"
      kitchen="messy"
      move={{ push: 120 * t }}
      sleeper={Sleeper}
      actors={[{
        at: FIGURE_AT,
        render: (p) => (
          <g>
            <g filter="url(#jump-sil)">
              <StudentTwinBody identity="nguoi-kia" outfit="xanh" mood="calm" pose={{ ...STAND_POSE, view: 'three', facing: 1 }} {...p} />
            </g>
            {eyes > 0 && [[-11, 99], [30, 96]].map(([ex, ey], i) => (
              <g key={i} opacity={eyes}>
                <circle cx={p.x + ex * p.scale} cy={p.y + ey * p.scale} r={9 * p.scale} fill="#cfe2ff" opacity={0.25} />
                <circle cx={p.x + ex * p.scale} cy={p.y + ey * p.scale} r={3.2 * p.scale} fill="#eef5ff" />
              </g>
            ))}
          </g>
        ),
      }]}
    >
      <defs>
        <filter id="jump-sil"><feFlood floodColor="#07090f" /><feComposite in2="SourceAlpha" operator="in" /></filter>
      </defs>
      <rect width={1920} height={1080} fill="#02040a" opacity={0.3} />
    </RoomNight>
  </AbsoluteFill>
);

/** Cận mặt: k 0..1 trong 12 frame; rung mạnh, phóng nhanh, lệch màu đỏ/xanh. */
export const JumpFace: React.FC<{ k: number }> = ({ k }) => {
  const shake = Math.sin(k * 61) * 18 * (1 - k * 0.4);
  const zoom = 1 + k * 0.12;
  const head = (dx: number, tint?: string) => (
    <g transform={`translate(${dx} 0)`} filter={tint} style={tint ? { mixBlendMode: 'screen' } : undefined} opacity={tint ? 0.55 : 1}>
      <StudentTwinHead identity="nguoi-kia" mood="stare_grin" view="front" x={1010} y={-260} scale={7.2} id={`jump-face-${dx}`} />
    </g>
  );
  return (
    <AbsoluteFill style={{ background: '#020305' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <defs>
          <linearGradient id="jump-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity=".9" /><stop offset=".55" stopColor="#000" stopOpacity=".25" /><stop offset="1" stopColor="#000" stopOpacity="0" /></linearGradient>
          <linearGradient id="jump-under" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#bcd6ff" stopOpacity=".6" /><stop offset=".5" stopColor="#0b1222" stopOpacity="0" /></linearGradient>
          <filter id="jump-face"><feColorMatrix type="matrix" values=".5 0 0 0 0  0 .54 0 0 .01  0 0 .7 0 .04  0 0 0 1 0" /></filter>
          <filter id="jump-red"><feColorMatrix type="matrix" values="1 0 0 0 .2  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
          <filter id="jump-cyan"><feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 .1  0 0 1 0 .2  0 0 0 1 0" /></filter>
          <radialGradient id="jump-vig" cx=".5" cy=".55" r=".6"><stop offset=".4" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".95" /></radialGradient>
        </defs>
        <g transform={`translate(${960 + shake} ${560 + shake * 0.4}) scale(${zoom}) translate(-960 -560)`}>
          <g filter="url(#jump-face)">{head(0)}</g>
          {head(-14, 'url(#jump-red)')}
          {head(14, 'url(#jump-cyan)')}
          <rect width={1920} height={1080} fill="url(#jump-top)" />
          <rect width={1920} height={1080} fill="url(#jump-under)" style={{ mixBlendMode: 'screen' }} />
        </g>
        <rect width={1920} height={1080} fill="url(#jump-vig)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Âm thanh: file thư viện chép vào public/ho-so-02-nguoi-lam-thay/sfx/ (thư mục bị Git bỏ qua). */
const SFX = (name: string) => staticFile(`ho-so-02-nguoi-lam-thay/sfx/${name}`);
export const JumpAudio: React.FC = () => (
  <>
    <Sequence durationInFrames={J1}><Audio src={SFX('room_tone.mp3')} volume={0.45} /></Sequence>
    <Sequence from={J1}><Audio src={SFX('drone_hit.mp3')} volume={1} /></Sequence>
    <Sequence from={J1}><Audio src={SFX('glitch.mp3')} volume={0.6} /></Sequence>
  </>
);

export const HoSo02TrailerJumpscare: React.FC = () => {
  const f = useCurrentFrame();
  const ease = (x: number) => x * x * (3 - 2 * x);
  const view = f < J1
    ? <JumpWide t={interpolate(f, [0, J1], [0, 1], { easing: ease })} eyes={interpolate(f, [EYES_ON, EYES_ON + 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
    : f < J1 + J2 ? <JumpFace k={(f - J1) / J2} /> : <AbsoluteFill style={{ background: '#000' }} />;
  return <AbsoluteFill>{view}<JumpAudio /></AbsoluteFill>;
};

/** Ba khung tĩnh để duyệt: đầu J1, cuối J1, giữa J2. */
export const HoSo02JumpscareBoard: React.FC = () => (
  <div style={{ width: 1920, height: 1080, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', background: '#111' }}>
    {[<JumpWide t={0} />, <JumpWide t={1} eyes={1} />, <JumpFace k={0.3} />, <JumpFace k={0.9} />].map((el, i) => (
      <div key={i} style={{ width: 960, height: 540, overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: 1920, height: 1080, transform: 'scale(.5)', transformOrigin: '0 0', position: 'relative' }}>{el}</div>
      </div>
    ))}
  </div>
);
