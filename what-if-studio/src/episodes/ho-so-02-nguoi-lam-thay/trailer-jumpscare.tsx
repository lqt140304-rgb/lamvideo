import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { mixPose, sampleWalk, STAND_POSE, StudentTwinBody, StudentTwinHead } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { RoomNight } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';
import { Sleeper } from './canh-01-demo';

/**
 * Trailer P1.00 — O05 jumpscare, ngay trước tiếng báo thức. Chỉ cảnh đầu là toàn phòng; từ đó trở đi là mắt Nam.
 * W: toàn phòng ban đêm, Nam nằm ngủ (mẫu nằm toàn thân `Sleeper` của cảnh 1), máy đẩy chậm.
 * P: mắt Nam, mí còn nặng, mở dần, cảnh nhòe. Người kia, có mặt Nam, đi vào từ cửa; Nam chớp mắt một lần khi nhận ra.
 * C: người kia cúi sát; cận mặt, há miệng thật rộng nuốt chửng Nam; khung rung dữ dội rồi đen.
 * Báo thức và tên phim nằm ở timeline trailer, không trong clip này.
 * Âm: tiếng phòng ở W và P, tiếng hù ở đầu C, tiếng nuốt khi miệng bắt đầu mở (file thư viện chép vào public, xem P1.00).
 */
export const WIDE = 42; // 1,4 giây toàn phòng
export const POV = 100; // 3,3 giây mắt Nam
export const CLOSE = 36; // 1,2 giây cận mặt đến nuốt
export const BLACK = 14;
export const JUMP_TOTAL = WIDE + POV + CLOSE + BLACK;
export const MOUTH_AT = 0.3; // phần của C mà miệng bắt đầu mở

const ease = (x: number) => x * x * (3 - 2 * x);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** Toàn phòng: t 0..1 là tiến độ đẩy máy. */
export const JumpWide: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: '#05070b' }}>
    <RoomNight door="closed" kitchen="messy" move={{ push: 70 * t, truck: 45 }} sleeper={Sleeper({ phone: false, cover: 0, breath: Math.sin(t * 14) * 5, f: 0 })}>
      <rect width={1920} height={1080} fill="#02040a" opacity={0.3} />
    </RoomNight>
  </AbsoluteFill>
);

/** Mí mắt: s 0..1 là độ mở. Rìa mí là hình thấu kính, hai khoé luôn khép nhỏ nhất. */
const Lids: React.FC<{ s: number }> = ({ s }) => {
  const G = clamp(s, 0.015, 1) * 1000;
  const c = 0.22 * G, m = 0.78 * G;
  return (
    <g>
      <path d={`M-40 -40 H1960 V540 H1920 V${540 - c} Q960 ${540 - m} 0 ${540 - c} V540 H-40 Z`} fill="#09050a" />
      <path d={`M-40 1120 H1960 V540 H1920 V${540 + c} Q960 ${540 + m} 0 ${540 + c} V540 H-40 Z`} fill="#09050a" />
      <path d={`M0 ${540 - c} Q960 ${540 - m} 1920 ${540 - c}`} fill="none" stroke="#3a1c1c" strokeWidth={10} opacity={0.7} />
      <path d={`M0 ${540 + c} Q960 ${540 + m} 1920 ${540 + c}`} fill="none" stroke="#3a1c1c" strokeWidth={10} opacity={0.7} />
    </g>
  );
};

/** Mắt Nam: u 0..1 trong đoạn P. */
export const PovFrame: React.FC<{ u: number }> = ({ u }) => {
  const dip = u > 0.6 && u < 0.7 ? Math.sin(((u - 0.6) / 0.1) * Math.PI) : 0; // chớp mắt khi nhận ra mình
  const open = (0.06 + 0.72 * ease(u) + 0.035 * Math.sin(u * 38)) * (1 - 0.97 * dip);
  const blur = 9 - 7 * ease(clamp(u * 1.15)) + dip * 4;
  const walk = clamp((u - 0.08) / 0.82);
  const fx = -25 + 135 * ease(walk), fz = 215 + 50 * ease(walk);
  const stop = clamp((walk - 0.8) / 0.2);
  const pose = { ...mixPose(sampleWalk(walk * 3.2), STAND_POSE, stop), view: 'front' as const };
  const bright = 0.25 + 0.5 * ease(clamp((u - 0.3) / 0.7));
  const sway = Math.sin(u * 9) * 0.6, swayX = Math.sin(u * 6) * 7;
  return (
    <AbsoluteFill style={{ background: '#030406' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${swayX}px, 0) rotate(${sway}deg) scale(1.06)`, filter: `blur(${blur.toFixed(1)}px)` }}>
        <RoomNight
          door="open"
          kitchen="messy"
          view="pov"
          actors={[{
            at: [fx, fz],
            render: (p) => (
              <g style={{ filter: `brightness(${bright.toFixed(2)}) saturate(.8)` }}>
                <StudentTwinBody identity="nguoi-kia" outfit="xanh" mood={u > 0.72 ? 'eerie_smirk' : 'calm'} pose={pose} {...p} />
              </g>
            ),
          }]}
        >
          <rect width={1920} height={1080} fill="#02040a" opacity={0.3} />
        </RoomNight>
      </div>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="pov-vig" cx=".5" cy=".5" r=".7"><stop offset=".35" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".85" /></radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#pov-vig)" />
        <Lids s={open} />
      </svg>
    </AbsoluteFill>
  );
};

/** Cận mặt rồi nuốt chửng: k 0..1 trong đoạn C. */
export const CloseFrame: React.FC<{ k: number }> = ({ k }) => {
  const s = 5.4 + 2.6 * ease(clamp(k / 0.9));
  const hx = 1010, hy = 300 - 78 * s;
  const mx = hx - 3 * s, my = hy + 142 * s;
  const m = ease(clamp((k - MOUTH_AT) / (1 - MOUTH_AT)));
  const g = Math.pow(m, 2.3);
  const rx = 40 + 2700 * g, ry = 22 + 1800 * g;
  const amp = 8 + 70 * k * k;
  const shx = Math.sin(k * 97) * amp, shy = Math.cos(k * 83) * amp * 0.7, rot = Math.sin(k * 71) * (1 + 3 * k);
  const head = (id: string, dx: number, mood: 'eerie_smirk' | 'stare_grin') => (
    <g transform={`translate(${dx} 0)`}><StudentTwinHead identity="nguoi-kia" mood={mood} view="front" x={hx} y={hy} scale={s} id={id} /></g>
  );
  return (
    <AbsoluteFill style={{ background: '#020305' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <defs>
          <linearGradient id="cl-under" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#bcd6ff" stopOpacity=".5" /><stop offset=".5" stopColor="#0b1222" stopOpacity="0" /></linearGradient>
          <filter id="cl-face"><feColorMatrix type="matrix" values=".5 0 0 0 0  0 .54 0 0 .01  0 0 .7 0 .04  0 0 0 1 0" /></filter>
          <filter id="cl-red"><feColorMatrix type="matrix" values="1 0 0 0 .2  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
          <filter id="cl-cyan"><feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 .1  0 0 1 0 .2  0 0 0 1 0" /></filter>
          <radialGradient id="cl-vig" cx=".5" cy=".55" r=".6"><stop offset=".4" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".95" /></radialGradient>
        </defs>
        <g transform={`translate(${960 + shx} ${540 + shy}) rotate(${rot}) translate(-960 -540)`}>
          <g filter="url(#cl-face)">{head('cl-head', 0, k < 0.2 ? 'eerie_smirk' : 'stare_grin')}</g>
          <g filter="url(#cl-red)" style={{ mixBlendMode: 'screen' }} opacity={0.5}>{head('cl-head-r', -14, 'stare_grin')}</g>
          <g filter="url(#cl-cyan)" style={{ mixBlendMode: 'screen' }} opacity={0.5}>{head('cl-head-c', 14, 'stare_grin')}</g>
          <rect x={-200} y={-200} width={2320} height={1480} fill="url(#cl-under)" style={{ mixBlendMode: 'screen' }} />
          {m > 0 && (
            <g>
              <ellipse cx={mx} cy={my} rx={rx + 22 + 20 * m} ry={ry + 16 + 14 * m} fill="#f1ece0" />
              <ellipse cx={mx} cy={my} rx={rx} ry={ry} fill="#1a0609" />
              <ellipse cx={mx} cy={my + ry * 0.42} rx={rx * 0.58} ry={ry * 0.34} fill="#a85553" opacity={0.92} />
              <ellipse cx={mx} cy={my - ry * 0.12} rx={rx * 0.2} ry={ry * 0.28} fill="#050102" opacity={0.7} />
            </g>
          )}
        </g>
        <rect width={1920} height={1080} fill="url(#cl-vig)" />
        <rect width={1920} height={1080} fill="#000" opacity={clamp((k - 0.9) / 0.1)} />
      </svg>
    </AbsoluteFill>
  );
};

/** Âm thanh: file thư viện chép vào public/ho-so-02-nguoi-lam-thay/sfx/ (thư mục bị Git bỏ qua). */
const SFX = (name: string) => staticFile(`ho-so-02-nguoi-lam-thay/sfx/${name}`);
const MOUTH_FRAME = WIDE + POV + Math.round(CLOSE * MOUTH_AT);
export const JumpAudio: React.FC = () => (
  <>
    <Sequence durationInFrames={WIDE + POV}><Audio src={SFX('room_tone.mp3')} volume={0.5} /></Sequence>
    <Sequence from={WIDE + POV}><Audio src={SFX('drone_hit.mp3')} volume={1} /></Sequence>
    <Sequence from={MOUTH_FRAME}><Audio src={SFX('glitch.mp3')} volume={0.6} /></Sequence>
    <Sequence from={MOUTH_FRAME}><Audio src={SFX('fall_whoosh.mp3')} volume={0.8} /></Sequence>
  </>
);

export const HoSo02TrailerJumpscare: React.FC = () => {
  const f = useCurrentFrame();
  const view = f < WIDE
    ? <JumpWide t={interpolate(f, [0, WIDE], [0, 1])} />
    : f < WIDE + POV ? <PovFrame u={(f - WIDE) / POV} />
    : f < WIDE + POV + CLOSE ? <CloseFrame k={(f - WIDE - POV) / CLOSE} />
    : <AbsoluteFill style={{ background: '#000' }} />;
  return <AbsoluteFill>{view}<JumpAudio /></AbsoluteFill>;
};

/** Sáu khung tĩnh để duyệt: toàn phòng, mắt Nam mở dần, nhận ra, cận mặt, nuốt. */
export const HoSo02JumpscareBoard: React.FC = () => {
  const panels: React.ReactNode[] = [<JumpWide t={0.5} />, <PovFrame u={0.2} />, <PovFrame u={0.55} />, <PovFrame u={0.98} />, <CloseFrame k={0.22} />, <CloseFrame k={0.72} />];
  return (
    <div style={{ width: 1920, height: 1080, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr', background: '#111' }}>
      {panels.map((el, i) => (
        <div key={i} style={{ width: 640, height: 360, overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: 1920, height: 1080, transform: 'scale(.3333)', transformOrigin: '0 0', position: 'relative' }}>{el}</div>
        </div>
      ))}
    </div>
  );
};
