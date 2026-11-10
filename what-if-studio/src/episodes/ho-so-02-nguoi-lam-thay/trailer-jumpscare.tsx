import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { mixPose, sampleWalk, STAND_POSE, StudentTwinBody, StudentTwinHead } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { placeOn, RoomNight } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';
import { Sleeper } from './canh-01-demo';

/**
 * Trailer P1.00 — O05 jumpscare, ngay trước tiếng báo thức. Chỉ cảnh đầu là toàn phòng; từ đó trở đi là mắt Nam.
 * W: toàn phòng ban đêm, Nam nằm ngủ (mẫu nằm toàn thân `Sleeper`). Bóng đen người đứng im cạnh nệm nhìn Nam;
 *    gần cuối cảnh hai đốm mắt trong bóng đen lóe sáng (giữ từ bản jumpscare đầu).
 * P: mắt Nam, mí còn nặng, mở dần, cảnh nhòe. Người kia, có mặt Nam, đi vào từ cửa; hai đốm mắt sáng lên khi Nam chớp mắt nhận ra.
 * C: người kia cúi sát, mặt lớn dần trong im lặng, nụ cười nở chậm; rồi một cú giật: khung rung, mí Nam sập xuống,
 *    trong bóng tối chỉ còn hai đốm mắt sáng rồi tắt. Không há miệng.
 * Báo thức và tên phim nằm ở timeline trailer, không trong clip này.
 * Âm: tiếng phòng ở W và P, tiếng ù thấp dâng ở C, tiếng hù đúng lúc mí sập (file thư viện chép vào public, xem P1.00).
 */
export const WIDE = 66; // 2,2 giây toàn phòng
export const POV = 150; // 5 giây mắt Nam: người kia tiến lại gần dần, máy zoom liền vào đầu
export const CLOSE = 66; // 2,2 giây cận mặt đến lúc sập mí
export const BLACK = 20;
export const JUMP_TOTAL = WIDE + POV + CLOSE + BLACK;
export const SLAM_AT = 0.82; // phần của C mà mí sập xuống
export const EYES_ON = 48; // frame hai đốm mắt lóe sáng ở cảnh toàn phòng

const ease = (x: number) => x * x * (3 - 2 * x);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** Hai đốm mắt sáng trên đầu người đứng; (x, y, scale) là điểm neo của rig như `placeOn`. */
const GlowEyes: React.FC<{ x: number; y: number; scale: number; a: number }> = ({ x, y, scale, a }) => (
  <g opacity={a}>
    {[[-11, 99], [30, 96]].map(([ex, ey], i) => (
      <g key={i}>
        <circle cx={x + ex * scale} cy={y + ey * scale} r={10 * scale} fill="#cfe2ff" opacity={0.25} />
        <circle cx={x + ex * scale} cy={y + ey * scale} r={3.2 * scale} fill="#eef5ff" />
      </g>
    ))}
  </g>
);

/** Toàn phòng: t 0..1 là tiến độ đẩy máy, eyes 0..1 là độ sáng hai đốm mắt. */
export const JumpWide: React.FC<{ t: number; eyes?: number }> = ({ t, eyes = 0 }) => (
  <AbsoluteFill style={{ background: '#05070b' }}>
    <RoomNight
      door="closed"
      kitchen="messy"
      move={{ push: 70 * t, truck: 45 }}
      sleeper={Sleeper({ phone: false, cover: 0, breath: Math.sin(t * 14) * 5, f: 0 })}
      actors={[{
        at: [214, 290],
        render: (p) => (
          <g>
            <g style={{ filter: 'brightness(.09) saturate(.3)' }}>
              <StudentTwinBody identity="nguoi-kia" outfit="xanh" mood="calm" pose={{ ...STAND_POSE, view: 'three', facing: 1 }} {...p} />
            </g>
            {eyes > 0 && <GlowEyes {...p} a={eyes} />}
          </g>
        ),
      }]}
    >
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
  const blur = 9 - 8 * ease(clamp(u * 1.15)) + dip * 4;
  const walk = clamp((u - 0.08) / 0.7);
  const fx = -25 + 160 * walk, fz = 215 + 60 * walk; // tiến đều, chậm
  const end = placeOn('pov', [135, 275], 168);
  const hx0 = end.x, hy0 = end.y + 95 * end.scale; // tâm đầu lúc dừng
  const zm = ease(clamp((u - 0.78) / 0.22));
  const zoom = 1 + 3.6 * zm, dx = (990 - hx0) * zm, dy = (420 - hy0) * zm;
  const stop = clamp((walk - 0.85) / 0.15);
  const pose = { ...mixPose(sampleWalk(walk * 3.2), STAND_POSE, stop), view: 'front' as const };
  const bright = 0.25 + 0.6 * ease(clamp((u - 0.3) / 0.6));
  const glow = ease(clamp((u - 0.55) / 0.12));
  const sway = Math.sin(u * 9) * 0.6, swayX = Math.sin(u * 6) * 7;
  return (
    <AbsoluteFill style={{ background: '#030406' }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: `${hx0}px ${hy0}px`, transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${zoom.toFixed(3)})` }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${swayX}px, 0) rotate(${sway}deg) scale(1.06)`, filter: `blur(${blur.toFixed(1)}px)` }}>
        <RoomNight
          door="open"
          kitchen="messy"
          view="pov"
          actors={[{
            at: [fx, fz],
            render: (p) => (
              <g>
                <g style={{ filter: `brightness(${bright.toFixed(2)}) saturate(.8)` }}>
                  <StudentTwinBody identity="nguoi-kia" outfit="xanh" mood={u > 0.72 ? 'eerie_smirk' : 'calm'} pose={pose} {...p} />
                </g>
                {glow > 0 && <GlowEyes {...p} a={glow} />}
              </g>
            ),
          }]}
        >
          <rect width={1920} height={1080} fill="#02040a" opacity={0.3} />
        </RoomNight>
      </div>
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

/** Cận mặt: k 0..1 trong đoạn C. Lún dần vào mặt, nụ cười nở chậm; đến SLAM_AT thì giật, mí sập, chỉ còn hai đốm mắt. */
export const CloseFrame: React.FC<{ k: number }> = ({ k }) => {
  const lean = ease(clamp(k / SLAM_AT));
  const s = 4.4 + 2.2 * lean;
  const hx = 1010, hy = 300 - 78 * s;
  const slam = clamp((k - SLAM_AT) / 0.05); // mí sập trong ~3 frame
  const after = k >= SLAM_AT + 0.05;
  const kick = k >= SLAM_AT && k < SLAM_AT + 0.12 ? Math.sin((k - SLAM_AT) * 260) * 60 * (1 - (k - SLAM_AT) / 0.12) : 0;
  const tremor = Math.sin(k * 140) * 2.5 * lean;
  const lids = 1 - ease(slam); // 1 mở, 0 khép
  const eyeA = after ? 1 - clamp((k - SLAM_AT - 0.1) / 0.1) : 0;
  const ex = (dx: number) => hx + (dx - 10) * s, ey = hy + 99 * s;
  const w = ease(clamp((k - 0.4) / (SLAM_AT - 0.4))); // độ méo hình, tăng dần tới lúc dọa
  const cy = hy + 95 * s;
  const warp = `translate(${hx} ${cy}) rotate(${(-9 * w).toFixed(2)}) skewX(${(-7 * w).toFixed(2)}) scale(${(1 - 0.08 * w).toFixed(3)} ${(1 + 0.34 * w).toFixed(3)}) translate(${-hx} ${-cy})`;
  const seed = Math.floor(k * 66) % 7 + 1;
  return (
    <AbsoluteFill style={{ background: '#020305' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <defs>
          <linearGradient id="cl-under" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#bcd6ff" stopOpacity=".5" /><stop offset=".5" stopColor="#0b1222" stopOpacity="0" /></linearGradient>
          <radialGradient id="cl-vig" cx=".5" cy=".55" r=".6"><stop offset=".4" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".95" /></radialGradient>
          <radialGradient id="cl-socket"><stop offset="0" stopColor="#05060a" stopOpacity="0" /><stop offset=".5" stopColor="#05060a" stopOpacity="0" /><stop offset=".72" stopColor="#05060a" stopOpacity=".7" /><stop offset="1" stopColor="#05060a" stopOpacity="0" /></radialGradient>
          <filter id="cl-warp" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".006 .018" numOctaves="2" seed={seed} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={46 * w} xChannelSelector="R" yChannelSelector="G" /></filter>
          <filter id="cl-face"><feColorMatrix type="matrix" values=".5 0 0 0 0  0 .54 0 0 .01  0 0 .7 0 .04  0 0 0 1 0" /></filter>
        </defs>
        <g transform={`translate(${960 + kick + tremor} ${540 + kick * 0.5}) translate(-960 -540)`}>
          {!after && (
            <g>
              <g filter={w > 0.05 ? 'url(#cl-warp)' : undefined}>
                <g transform={warp}>
                  <g filter="url(#cl-face)"><StudentTwinHead identity="nguoi-kia" mood={k < 0.45 ? 'eerie_smirk' : 'stare_grin'} view="front" x={hx} y={hy} scale={s} id="cl-head" /></g>
                  {w > 0 && [-11, 30].map((dx, i) => (
                    <ellipse key={i} cx={ex(dx)} cy={ey + 4 * s} rx={34 * s} ry={38 * s} fill="url(#cl-socket)" opacity={w} />
                  ))}
                </g>
              </g>
              <rect x={-200} y={-200} width={2320} height={1480} fill="url(#cl-under)" style={{ mixBlendMode: 'screen' }} />
            </g>
          )}
        </g>
        <rect width={1920} height={1080} fill="url(#cl-vig)" />
        {k >= SLAM_AT && <Lids s={lids} />}
        {after && eyeA > 0 && (
          <g opacity={eyeA} transform={`translate(${kick + tremor} ${kick * 0.5})`}>
            {[-11, 30].map((dx, i) => (
              <g key={i}><circle cx={ex(dx)} cy={ey} r={10 * s} fill="#cfe2ff" opacity={0.2} /><circle cx={ex(dx)} cy={ey} r={1.7 * s} fill="#f2f7ff" /></g>
            ))}
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

/** Âm thanh: file thư viện chép vào public/ho-so-02-nguoi-lam-thay/sfx/ (thư mục bị Git bỏ qua). */
const SFX = (name: string) => staticFile(`ho-so-02-nguoi-lam-thay/sfx/${name}`);
const SLAM_FRAME = WIDE + POV + Math.round(CLOSE * SLAM_AT);
export const JumpAudio: React.FC = () => (
  <>
    <Sequence durationInFrames={WIDE + POV}><Audio src={SFX('room_tone.mp3')} volume={0.5} /></Sequence>
    <Sequence from={WIDE + POV - 12} durationInFrames={SLAM_FRAME - (WIDE + POV - 12)}><Audio src={SFX('power_hum.mp3')} volume={0.35} /></Sequence>
    <Sequence from={SLAM_FRAME}><Audio src={SFX('drone_hit.mp3')} volume={1} /></Sequence>
    <Sequence from={SLAM_FRAME}><Audio src={SFX('glitch.mp3')} volume={0.5} /></Sequence>
  </>
);

export const HoSo02TrailerJumpscare: React.FC = () => {
  const f = useCurrentFrame();
  const view = f < WIDE
    ? <JumpWide t={interpolate(f, [0, WIDE], [0, 1])} eyes={interpolate(f, [EYES_ON, EYES_ON + 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
    : f < WIDE + POV ? <PovFrame u={(f - WIDE) / POV} />
    : f < WIDE + POV + CLOSE ? <CloseFrame k={(f - WIDE - POV) / CLOSE} />
    : <AbsoluteFill style={{ background: '#000' }} />;
  return <AbsoluteFill>{view}<JumpAudio /></AbsoluteFill>;
};

/** Sáu khung tĩnh để duyệt: người kia tiến lại gần, zoom vào đầu, mặt méo dần, mí sập. */
export const HoSo02JumpscareBoard: React.FC = () => {
  const panels: React.ReactNode[] = [<PovFrame u={0.4} />, <PovFrame u={0.72} />, <PovFrame u={0.97} />, <CloseFrame k={0.2} />, <CloseFrame k={0.7} />, <CloseFrame k={0.87} />];
  return (
    <div style={{ width: 1920, height: 720, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr', background: '#111' }}>
      {panels.map((el, i) => (
        <div key={i} style={{ width: 640, height: 360, overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: 1920, height: 1080, transform: 'scale(.3333)', transformOrigin: '0 0', position: 'relative' }}>{el}</div>
        </div>
      ))}
    </div>
  );
};
