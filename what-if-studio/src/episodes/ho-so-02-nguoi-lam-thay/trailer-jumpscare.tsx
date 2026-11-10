import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { mixPose, sampleWalk, STAND_POSE, StudentTwinBody } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { placeOn, RoomNight } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';
import { Sleeper } from './canh-01-demo';

/**
 * Trailer P1.00 — O05 jumpscare, ngay trước tiếng báo thức. Chỉ cảnh đầu là toàn phòng; từ đó trở đi là mắt Nam.
 * W: toàn phòng ban đêm (tối hơn bản trước), Nam nằm ngủ (mẫu nằm toàn thân `Sleeper`). Bóng đen người kia đi bộ chậm từ cửa
 *    tới cạnh nệm, đứng im nhìn Nam; gần cuối cảnh hai đốm mắt trong bóng đen lóe sáng.
 * P: mắt Nam, mí còn nặng, mở dần, cảnh nhòe. Người kia, có mặt Nam, đi vào từ cửa; hai đốm mắt sáng lên khi Nam chớp mắt nhận ra.
 * C: im bặt một nhịp, cắt phụt vào mặt dọa (đen trắng, hốc mắt sâu, cười toác đầy răng), rung mạnh rồi mí Nam sập, đen. Không há miệng nuốt.
 * Báo thức và tên phim nằm ở timeline trailer, không trong clip này.
 * Âm: tiếng phòng ở W và P, tiếng ù thấp dâng cuối P, im 6 frame, tiếng hù đúng lúc cắt vào mặt (file thư viện chép vào public, xem P1.00).
 */
export const WIDE = 120; // 4 giây toàn phòng: người kia đi bộ chậm trong bóng tối tới cạnh nệm rồi đứng nhìn
export const POV = 150; // 5 giây mắt Nam: người kia tiến lại gần dần, máy zoom liền vào đầu
export const CLOSE = 20; // 0,67 giây: cắt phụt vào mặt dọa rồi sập tối, dứt khoát
export const BLACK = 16;
export const JUMP_TOTAL = WIDE + POV + CLOSE + BLACK;
export const SLAM_AT = 0.72; // phần của C mà mí sập xuống
export const EYES_ON = 100; // frame hai đốm mắt lóe sáng ở cảnh toàn phòng

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

/** Toàn phòng: t 0..1 là tiến độ đẩy máy, eyes 0..1 là độ sáng hai đốm mắt. Người kia đi từ cửa tới cạnh nệm trong bóng tối. */
export const JumpWide: React.FC<{ t: number; eyes?: number }> = ({ t, eyes = 0 }) => {
  const wk = clamp((t - 0.1) / 0.6);
  const at: [number, number] = [8 + 206 * wk, 215 + 75 * wk];
  const stop = clamp((wk - 0.9) / 0.1);
  const pose = { ...mixPose(sampleWalk(wk * 4.2), STAND_POSE, stop), view: 'three' as const, facing: 1 as const };
  const dark = 0.06 + 0.06 * wk; // đi vào càng gần đèn bàn càng lộ ra một chút
  return (
    <AbsoluteFill style={{ background: '#05070b' }}>
      <RoomNight
        door="open"
        kitchen="messy"
        move={{ push: 70 * t, truck: 45 }}
        sleeper={Sleeper({ phone: false, cover: 0, breath: Math.sin(t * 20) * 5, f: 0 })}
        actors={[{
          at,
          render: (p) => (
            <g>
              <g style={{ filter: `brightness(${dark.toFixed(3)}) saturate(.3)` }}>
                <StudentTwinBody identity="nguoi-kia" outfit="xanh" mood="calm" pose={pose} {...p} />
              </g>
              {eyes > 0 && <GlowEyes {...p} a={eyes} />}
            </g>
          ),
        }]}
      >
        <rect width={1920} height={1080} fill="#02040a" opacity={0.45} />
      </RoomNight>
    </AbsoluteFill>
  );
};

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
                  <StudentTwinBody identity="nguoi-kia" outfit="xanh" mood={u > 0.8 ? 'stare_grin' : u > 0.42 ? 'eerie_smirk' : 'calm'} pose={pose} {...p} />
                </g>
                {glow > 0 && <GlowEyes {...p} a={glow} />}
              </g>
            ),
          }]}
        >
          <rect width={1920} height={1080} fill="#02040a" opacity={0.42} />
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

/** Mặt dọa: vẽ riêng cho cú hù, đen trắng tương phản mạnh, hốc mắt sâu, mắt nhỏ trừng, cười toác đầy răng, có hạt nhiễu.
 *  Giữ tóc có lọn xoăn và nốt ruồi bên phải để vẫn nhận ra là bản sao của Nam. k 0..1 trong đoạn C. */
const upperLip = (x: number) => { const t = (x - 600) / 720; return 770 - 130 * t * (1 - t); };
export const ScareFace: React.FC<{ k: number }> = ({ k }) => {
  const z = 1.3 + 0.18 * ease(clamp(k / SLAM_AT));
  const amp = 34 * (1 - clamp(k / SLAM_AT));
  const sx = Math.sin(k * 140) * amp, sy = Math.cos(k * 113) * amp * 0.6;
  const slam = clamp((k - SLAM_AT) / 0.12);
  const seed = Math.floor(k * 40) % 9 + 1;
  const up = Array.from({ length: 13 }, (_, j) => j - 6);
  const mouth = 'M600 770 Q960 640 1320 770 Q1190 1010 960 1012 Q730 1010 600 770 Z';
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <defs>
          <radialGradient id="sf-light" cx=".5" cy=".5" r=".55"><stop offset="0" stopColor="#ecebe6" /><stop offset=".36" stopColor="#bdbab3" /><stop offset=".62" stopColor="#3a3835" /><stop offset=".86" stopColor="#000" /></radialGradient>
          <radialGradient id="sf-socket"><stop offset="0" stopColor="#000" stopOpacity="1" /><stop offset=".55" stopColor="#000" stopOpacity=".92" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
          <radialGradient id="sf-vig" cx=".5" cy=".5" r=".62"><stop offset=".5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="1" /></radialGradient>
          <clipPath id="sf-mouth"><path d={mouth} /></clipPath>
          <filter id="sf-grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed={seed} /><feColorMatrix type="saturate" values="0" /></filter>
          <filter id="sf-soft"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        <g transform={`translate(${960 + sx} ${540 + sy}) scale(${z}) translate(-960 -540)`}>
          {/* Khối mặt sáng từ chính diện, tối dần ra mép */}
          <path d="M960 10 C1380 10 1500 360 1480 600 C1460 880 1250 1150 960 1160 C670 1150 460 880 440 600 C420 360 540 10 960 10 Z" fill="url(#sf-light)" />
          {/* Tóc tối hòa vào nền, có lọn xoăn trên đỉnh */}
          <path d="M420 330 Q450 40 960 -20 Q1470 40 1500 330 Q1360 190 1180 230 Q1060 170 960 200 Q850 160 720 230 Q560 190 420 330 Z" fill="#070707" />
          <path d="M900 -10 Q980 -120 1060 -40 Q1010 -70 980 -20 Z" fill="#070707" />
          {/* Hốc mắt sâu */}
          <ellipse cx={750} cy={455} rx={190} ry={150} fill="url(#sf-socket)" />
          <ellipse cx={1170} cy={455} rx={190} ry={150} fill="url(#sf-socket)" />
          {/* Mắt nhỏ trừng, con ngươi nhìn thẳng */}
          {[[760, 462], [1160, 462]].map(([x, y], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={44} ry={36} fill="#efede6" />
              <circle cx={x + (i ? -6 : 6)} cy={y + 2} r={15} fill="#060606" />
              <circle cx={x + (i ? -11 : 1)} cy={y - 4} r={4} fill="#ffffff" />
            </g>
          ))}
          {/* Lông mày hất cao */}
          <path d="M600 330 Q740 270 870 330" fill="none" stroke="#0a0a0a" strokeWidth={26} strokeLinecap="round" />
          <path d="M1050 330 Q1180 270 1320 330" fill="none" stroke="#0a0a0a" strokeWidth={26} strokeLinecap="round" />
          {/* Nốt ruồi bên phải (dấu của bản sao) */}
          <circle cx={1310} cy={420} r={10} fill="#0a0a0a" />
          {/* Mũi: sống mũi sáng, cánh mũi và lỗ mũi tối */}
          <path d="M930 520 Q960 600 925 660 Q960 690 995 660 Q960 600 990 520" fill="none" stroke="#3a3836" strokeWidth={10} opacity={0.5} filter="url(#sf-soft)" />
          <ellipse cx={928} cy={668} rx={20} ry={11} fill="#141312" />
          <ellipse cx={992} cy={668} rx={20} ry={11} fill="#141312" />
          {/* Rãnh má kéo căng về khoé miệng */}
          <path d="M880 640 Q700 690 610 780" fill="none" stroke="#1c1b1a" strokeWidth={16} opacity={0.6} filter="url(#sf-soft)" />
          <path d="M1040 640 Q1220 690 1310 780" fill="none" stroke="#1c1b1a" strokeWidth={16} opacity={0.6} filter="url(#sf-soft)" />
          {/* Miệng toác: lòng tối, lợi, hai hàm răng */}
          <path d={mouth} fill="#080505" />
          <g clipPath="url(#sf-mouth)">
            <path d="M600 770 Q960 640 1320 770 L1320 800 Q960 672 600 800 Z" fill="#5b4747" />
            {up.map((j) => { const x = 960 + j * 52, y = upperLip(x) + 18, h = 104 - Math.abs(j) * 6; return <rect key={`u${j}`} x={x - 24} y={y} width={48} height={h} rx={10} fill="#f0ede4" stroke="#1a1a1a" strokeWidth={4} />; })}
            {up.map((j) => { const x = 960 + j * 52 + 26, h = 84 - Math.abs(j) * 5; return <rect key={`l${j}`} x={x - 23} y={1000 - h - Math.abs(j) * 9} width={46} height={h + 40} rx={10} fill="#dedbd2" stroke="#1a1a1a" strokeWidth={4} />; })}
          </g>
          <path d={mouth} fill="none" stroke="#0d0b0b" strokeWidth={8} />
        </g>
        <rect width={1920} height={1080} filter="url(#sf-grain)" opacity={0.2} style={{ mixBlendMode: 'overlay' }} />
        <rect width={1920} height={1080} fill="url(#sf-vig)" />
        {slam > 0 && <Lids s={1 - ease(slam)} />}
        {slam >= 1 && <rect width={1920} height={1080} fill="#000" />}
      </svg>
    </AbsoluteFill>
  );
};

/** Âm thanh: file thư viện chép vào public/ho-so-02-nguoi-lam-thay/sfx/ (thư mục bị Git bỏ qua). */
const SFX = (name: string) => staticFile(`ho-so-02-nguoi-lam-thay/sfx/${name}`);
export const JumpAudio: React.FC = () => (
  <>
    <Sequence durationInFrames={WIDE + POV - 6}><Audio src={SFX('room_tone.mp3')} volume={0.5} /></Sequence>
    <Sequence from={WIDE + POV - 40} durationInFrames={34}><Audio src={SFX('power_hum.mp3')} volume={0.35} /></Sequence>
    {[22, 40, 58, 76, 94].map((f) => <Sequence key={f} from={f} durationInFrames={12}><Audio src={SFX('step.mp3')} volume={0.35} /></Sequence>)}
    {/* 6 frame im bặt trước cú hù */}
    <Sequence from={WIDE + POV}><Audio src={SFX('drone_hit.mp3')} volume={1} /></Sequence>
    <Sequence from={WIDE + POV}><Audio src={SFX('glitch.mp3')} volume={0.5} /></Sequence>
  </>
);

export const HoSo02TrailerJumpscare: React.FC = () => {
  const f = useCurrentFrame();
  const view = f < WIDE
    ? <JumpWide t={interpolate(f, [0, WIDE], [0, 1])} eyes={interpolate(f, [EYES_ON, EYES_ON + 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
    : f < WIDE + POV ? <PovFrame u={(f - WIDE) / POV} />
    : f < WIDE + POV + CLOSE ? <ScareFace k={(f - WIDE - POV) / CLOSE} />
    : <AbsoluteFill style={{ background: '#000' }} />;
  return <AbsoluteFill>{view}<JumpAudio /></AbsoluteFill>;
};

/** Sáu khung tĩnh để duyệt: người kia tiến lại gần, zoom vào đầu, mặt méo dần, mí sập. */
export const HoSo02JumpscareBoard: React.FC = () => {
  const panels: React.ReactNode[] = [<JumpWide t={0.3} />, <JumpWide t={0.55} />, <JumpWide t={1} eyes={1} />, <PovFrame u={0.62} />, <PovFrame u={0.96} />, <ScareFace k={0.4} />];
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
