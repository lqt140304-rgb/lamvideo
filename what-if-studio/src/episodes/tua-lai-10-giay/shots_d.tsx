import React from 'react';
import {
  Hero, poseAt, faceAt, kf, clamp, easeOut, camT, Glow, Dust, LightVeil, Foreground, Tabletop, ShotProps, stand, reachAngle, walkPose, FONT,
  Home, HomeTable, HOME, Site, Bedroom, BedDuvet, bedSit, bedTop, LaptopBack, Lunchbox, Phone, ArmIn, Notebook, HardHat, Backpack, Boot, TapeMeasure, ChatScreen, ClassPhoto,
} from '../../engine';
import { P, SITE_G, hipAt, WK, WN, TE, MOI, BAC, CHU, GLOVE, Blur, faceCam, handOf } from './common';

// Cảnh 8 (những thứ bạn đã học), 9 (một câu hỏi khác), 10 (chiếc cặp): S50 - S65, S74 - S77.

// ---------- S50: medium: his first days on site, fumbling with the tape while the foreman looks on ----------
export const S50: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: hipAt(1), scale: 1, yaw: 0.5, look: 0.5, armR: { a: 80, b: -10 }, armL: { a: 70, b: -10 }, headTilt: 8 } },
    { f: 14, p: { armR: { a: 70, b: -20 }, armL: { a: 100, b: -20 }, headTilt: 10 } },
    { f: 30, p: { armR: { a: 84, b: -6 }, armL: { a: 64, b: -14 }, headTilt: 6 } },
    { f: 52, p: { armR: { a: 74, b: -16 }, armL: { a: 96, b: -16 } } },
  ]);
  const h = handOf(pose);
  const bac = P({ x: 1320, y: hipAt(0.95), scale: 0.95, yaw: -0.5, look: -0.4, armL: { a: 22, b: 96 }, armR: { a: 22, b: 96 } });
  return (
    <g transform={camT(1080, 580, kf(t, [[0, 1.5], [len, 1.62]]))}>
      <Site t={t + 40} id="s50" bricks={0.6} />
      <Hero look={BAC} pose={{ ...bac, expr: 'neutral' }} rimId="rimL" shadow={0.6} />
      <Hero look={WK} pose={{ ...pose, ...faceAt(t, [[0, 'worried'], [30, 'oops']]) }} rimId="rimR" shadow={0.7} />
      <TapeMeasure x={h.x + 40} y={h.y - 30} s={0.42} ext={kf(t, [[0, 40], [16, 300], [26, 90], [40, 220]])} rot={-8} />
    </g>
  );
};

// ---------- S51: macro: measure again before you cut ----------
export const S51: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(960, 540, 1)}>
    <Tabletop edge={1400} wood="#B08A5A" grain="#9A7648" lip="#8A6A40" />
    <Glow x={900} y={460} r={950} o={0.4} />
    <LightVeil id="s51v" lights={[[900, 520, 900]]} o={0.4} />
    <TapeMeasure x={300} y={610} s={2.0} ext={kf(t, [[0, 120], [26, 820]])} />
    <path d="M 1240 470 L 1240 660" stroke="#2A2420" strokeWidth={6} opacity={clamp((t - 24) / 8)} />
    <rect x={1150} y={800} width={260} height={16} rx={8} fill="#F2B33D" transform="rotate(-6 1280 808)" />
    <ArmIn x={kf(t, [[0, 1000], [26, 1220]])} y={400} ang={10} look={GLOVE} len={800} />
  </g>
);

// ---------- S52: over the shoulder: the foreman answers when he asks ----------
export const S52: React.FC<ShotProps> = ({ t, len }) => {
  const boy = poseAt(t, [
    { f: 0, p: { x: 1180, y: hipAt(1), scale: 1, yaw: -0.4, look: -0.6, headTilt: 4, armL: { a: 10, b: -10 } } },
    { f: 16, p: { armL: { a: 120, b: 30 }, headTilt: -4 }, ease: easeOut },
  ]);
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.5], [len, 1.6]]))}>
      <Site t={t + 50} id="s52" />
      <Hero look={WK} pose={{ ...boy, ...faceAt(t, [[0, 'worried'], [16, 'neutral']]) }} rimId="rimL" shadow={0.7} />
      <Foreground blur={10}>
        <Hero look={BAC} pose={P({ x: 380, y: hipAt(1.9), scale: 1.9, yaw: 0.35, look: 0.7, expr: 'neutral' })} rimId="rimR" shadow={0} />
      </Foreground>
    </g>
  );
};

// ---------- S53: medium: a newcomer's helmet strap is loose; he signals for him to fasten it ----------
export const S53: React.FC<ShotProps> = ({ t, len }) => {
  const moi = P({ x: 1240, y: hipAt(1), scale: 1, yaw: -0.5, look: -0.4, expr: 'neutral' });
  const hy = moi.y + -176 * moi.scale;
  const boy = poseAt(t, [
    { f: 0, p: { x: 780, y: hipAt(1), scale: 1, yaw: 0.5, look: 0.5, armR: { a: 14, b: -10 } } },
    { f: 12, p: { armR: { a: 128, b: 138 }, handR: 'point' }, ease: easeOut },
  ]);
  return (
    <g transform={camT(1010, 580, 1.55)}>
      <Site t={t} id="s53" />
      <Hero look={MOI} pose={moi} rimId="rimL" shadow={0.7} />
      {/* the unfastened strap swings free of the hat */}
      <path d={`M ${moi.x - 48} ${hy - 34} Q ${moi.x - 60 + Math.sin(t / 5) * 6} ${hy + 40} ${moi.x - 44} ${hy + 110} M ${moi.x + 48} ${hy - 34} Q ${moi.x + 62 + Math.sin(t / 5 + 1) * 6} ${hy + 44} ${moi.x + 44} ${hy + 110}`} stroke="#F0D58A" strokeWidth={6} fill="none" strokeLinecap="round" />
      <Hero look={WK} pose={{ ...boy, ...faceAt(t, [[0, 'neutral'], [12, 'smug']]) }} rimId="rimR" shadow={0.7} />
    </g>
  );
};

// ---------- S54: medium: "Anh ơi...": the new man calls him over ----------
export const S54: React.FC<ShotProps> = ({ t, len }) => {
  const moi = P({ x: 700, y: hipAt(0.85), scale: 0.85, yaw: 0.3, look: 0.4, armR: { a: 150 + Math.sin(t / 3) * 14, b: -10 }, armL: { a: 8, b: -10 } });
  const boy = P({ x: 1250, y: hipAt(1.1), scale: 1.1, yaw: -0.3, look: -0.7, headTilt: 3, armL: { a: 10, b: -10 } });
  return (
    <g transform={camT(kf(t, [[0, 1020], [len, 960]]), 570, 1.4)}>
      <Site t={t + 80} id="s54" />
      <Hero look={MOI} pose={{ ...moi, expr: 'happy' }} rimId="rimR" shadow={0.7} />
      <Hero look={WK} pose={{ ...boy, ...faceAt(t, [[0, 'neutral']]) }} rimId="rimL" shadow={0.7} />
      <Foreground blur={10}>
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M ${1620 + i * 26} 1100 L ${1630 + i * 26} 520`} stroke="#14101A" strokeWidth={9} />
        ))}
      </Foreground>
    </g>
  );
};

// ---------- S55: close-up: someone calls "Anh", and he turns, with a smile ----------
export const S55: React.FC<ShotProps> = ({ t }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: hipAt(2.4, 1120), scale: 2.4, yaw: -0.8, look: -0.7 } },
    { f: 18, p: { yaw: 0.25, look: 0.2 }, ease: easeOut },
  ]);
  return (
    <g transform={faceCam(pose, 1.0, 40)}>
      <Blur b={16}>
        <Site t={t} id="s55" bricks={1} />
      </Blur>
      <rect x={-300} y={-300} width={2600} height={1700} fill="#0A0814" opacity={0.2} />
      <Hero look={WK} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [18, 'happy']]) }} rimId="rimR" shadow={0} />
    </g>
  );
};

// ---------- S56: wide: the crew eats lunch together under the shade ----------
export const S56: React.FC<ShotProps> = ({ t, len }) => {
  const sit = (x: number, look: number, extra = {}) => P({ x, y: SITE_G - 54, scale: 0.78, yaw: look, legL: { a: 82, b: -84 }, legR: { a: 82, b: -84 }, armR: { a: 56, b: -70 }, armL: { a: 40, b: -60 }, ...extra });
  const crew = [
    { x: 700, look: 0.6, who: CHU, f: 'happy' as const },
    { x: 880, look: 0.4, who: BAC, f: 'neutral' as const },
    { x: 1260, look: -0.4, who: MOI, f: 'happy' as const },
    { x: 1440, look: -0.6, who: WK, f: 'neutral' as const },
  ];
  return (
    <g transform={camT(1060, 580, kf(t, [[0, 1.1], [len, 1.3]]))}>
      <Site t={t} id="s56" bricks={1} lamp={false} />
      {/* a tarp on two poles throws a patch of shade */}
      <path d="M 620 560 L 1560 520 L 1600 600 L 580 640 Z" fill="#3E6A7A" stroke="#1A1410" strokeWidth={5} />
      <path d="M 640 570 L 640 836 M 1540 530 L 1540 836" stroke="#2E2438" strokeWidth={10} />
      <path d="M 600 650 L 1580 610 L 1600 830 L 560 830 Z" fill="#06040C" opacity={0.3} />
      {[760, 1000, 1330, 1500].map((x, i) => (
        <rect key={i} x={x - 60} y={SITE_G - 50} width={120} height={54} rx={6} fill="#6A4A34" stroke="#1A1410" strokeWidth={4} />
      ))}
      {crew.map((c, i) => (
        <Hero key={i} look={c.who} pose={{ ...sit(c.x, c.look), ...faceAt(t, [[0, c.f]]) }} rimId={i < 2 ? 'rimR' : 'rimL'} shadow={0.5} />
      ))}
      {[820, 1190].map((x, i) => (
        <Lunchbox key={i} x={x} y={SITE_G - 6} s={0.26} steam={1} f={t + i * 7} />
      ))}
    </g>
  );
};

// ---------- S74: close-up: he looks far off; he still wants to know what else he can learn ----------
export const S74: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: hipAt(2.6, 1130), scale: 2.6, yaw: 0.4, look: 0.5, headTilt: 2 } },
    { f: 80, p: { look: 0.9, headTilt: -2 } },
    { f: 160, p: { look: 0.6, headTilt: 3 } },
  ]);
  return (
    <g transform={faceCam(pose, kf(t, [[0, 1.0], [170, 1.22]]), 40)}>
      <Blur b={16}>
        <Site t={t} id="s74" bricks={1} />
      </Blur>
      <rect x={-300} y={-300} width={2600} height={1700} fill="#0A0814" opacity={0.25} />
      <Hero look={WK} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [100, 'tired']]) }} rimId="rimR" shadow={0} />
    </g>
  );
};

// ---------- S57: macro: the old photo closes, the group chat is behind it ----------
export const S57: React.FC<ShotProps> = ({ t }) => {
  const s = kf(t, [[0, 1], [14, 1], [32, 0.04]]);
  return (
    <g transform={camT(960, 360, 1.25)}>
      <rect x={-600} y={-700} width={3200} height={2600} fill="#0A0814" />
      <ChatScreen x={960} y={540} w={620} msgs={[{ who: 'a', text: 'Chủ nhật này họp lớp nhé!' }]} typing="" caret={false} />
      <g transform={`translate(960 540) scale(${s})`} opacity={clamp(1 - (t - 20) / 14)}>
        <rect x={-310} y={-440} width={620} height={880} rx={50} fill="#16151C" />
        <ClassPhoto x={0} y={0} w={560} gap={1} glow={1} />
      </g>
    </g>
  );
};

// ---------- S58: macro: he types the answer and sends it ----------
const REPLY = 'Chủ nhật tao tới. Nhớ chừa chỗ.';
export const S58: React.FC<ShotProps> = ({ t }) => {
  const n = clamp(Math.floor((t - 6) / 1.9), 0, REPLY.length);
  const sent = t >= 82;
  const msgs: { who: 'a' | 'b' | 'me'; text: string }[] = [{ who: 'a', text: 'Chủ nhật này họp lớp nhé!' }, { who: 'b', text: 'Mày đi không?' }];
  if (sent) msgs.push({ who: 'me', text: REPLY });
  return (
    <g transform={camT(960, 610, 1.0)}>
      <rect x={-600} y={-700} width={3200} height={2600} fill="#0A0814" />
      <ChatScreen x={960} y={540} w={620} msgs={msgs} typing={sent ? '' : REPLY.slice(0, n).slice(-21)} caret={!sent && Math.floor(t / 7) % 2 === 0} />
    </g>
  );
};

// ---------- S59: wide: at night in his rented room he looks up evening classes and trades ----------
export const S59: React.FC<ShotProps> = ({ t, len }) => {
  const b = bedSit(0.22);
  const pose = poseAt(t, [
    { f: 0, p: { x: b.x, y: b.y, scale: b.scale, yaw: 0.5, look: 0.6, headTilt: 8, armR: { a: 50, b: -40 } } },
    { f: 60, p: { headTilt: 10 } },
  ]);
  const lt = bedTop(0.3, 0.2);
  return (
    <g transform={camT(800, 560, kf(t, [[0, 1.3], [len, 1.4]]))}>
      <Bedroom t={t + 30} id="b59" duvet={false} clock="21:40" lamp={0.7} crossed={14} rented />
      <Hero look={TE} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [30, 'smug']]) }} rimId="rimBlue" shadow={0} />
      <BedDuvet knees={0.6} />
      <LaptopBack x={lt.x + 30} y={lt.y + 20} w={200} />
    </g>
  );
};

/** The sticky note with the training centre's details; `digits` is the phone number being written at the bottom. */
const NoteSheet: React.FC<{ x: number; y: number; k?: number; reveal?: number; digits?: string; rot?: number }> = ({ x, y, k = 1, reveal = 1, digits = '', rot = -4 }) => {
  const lines: [string, number][] = [['Trung tâm GDTX', 52], ['Tư vấn: 18h – 20h', 38], ['(thứ 3 và thứ 5)', 38], ['Địa chỉ: 12 đường Số 4', 38]];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}>
      <rect x={-250 + 10} y={-240 + 14} width={520} height={480} fill="#000" opacity={0.3} />
      <rect x={-260} y={-240} width={520} height={480} fill="#F2DE86" />
      <rect x={-260} y={-240} width={520} height={44} fill="#E0C968" />
      {lines.map(([s, fs], i) => (
        <text key={i} x={-220} y={-130 + i * 66} fontFamily={FONT.hand} fontWeight={700} fontSize={fs} fill="#2E3F66" opacity={clamp(reveal * lines.length - i)}>
          {s}
        </text>
      ))}
      <text x={-220} y={190} fontFamily={FONT.hand} fontWeight={700} fontSize={44} fill="#2E3F66">SĐT:</text>
      <path d="M -120 200 L 220 200" stroke="#6A6A7A" strokeWidth={3} />
      <text x={-110} y={190} fontFamily={FONT.hand} fontWeight={700} fontSize={46} fill="#2E3F66" letterSpacing={2}>{digits}</text>
    </g>
  );
};

const Schedule: React.FC<{ x: number; y: number; k?: number }> = ({ x, y, k = 1 }) => {
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const shifts: [number, number, string][] = [[0, 0, '#D9534F'], [0, 1, '#4A86C8'], [1, 0, '#D9534F'], [1, 1, '#4A86C8'], [2, 0, '#D9534F'], [3, 0, '#D9534F'], [3, 1, '#4A86C8'], [4, 0, '#D9534F'], [4, 1, '#4A86C8'], [5, 0, '#D9534F'], [5, 1, '#5AA05A'], [6, 1, '#5AA05A']];
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <rect x={-540 + 10} y={-300 + 14} width={1080} height={600} fill="#000" opacity={0.3} />
      <rect x={-540} y={-300} width={1080} height={600} fill="#F1ECDD" />
      <text x={-500} y={-250} fontFamily={FONT.title} fontWeight={800} fontSize={36} fill="#2E3F66">Lịch làm việc tuần này</text>
      {days.map((d, i) => (
        <text key={d} x={-440 + i * 150} y={-196} textAnchor="middle" fontFamily={FONT.ui} fontSize={26} fill="#5A5A6A">{d}</text>
      ))}
      {Array.from({ length: 3 }).map((_, r) =>
        days.map((d, c) => <rect key={`${r}${c}`} x={-505 + c * 150} y={-170 + r * 150} width={130} height={130} fill="none" stroke="#C9C2B4" strokeWidth={2} />),
      )}
      {shifts.map(([c, r, col], i) => (
        <rect key={i} x={-500 + c * 150} y={-165 + r * 150 + 40 * (r === 1 ? 0 : 0)} width={120} height={r === 0 ? 70 : 110} rx={8} fill={col} opacity={0.85} />
      ))}
      <text x={-500} y={250} fontFamily={FONT.hand} fontWeight={700} fontSize={34} fill="#8A2A2A">Tiền học: 1.200.000đ / tháng</text>
    </g>
  );
};

// ---------- S60: macro, top-down: the note with the centre's address and hours ----------
export const S60: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(960, 540, 1)}>
    <Tabletop edge={1400} />
    <Glow x={900} y={480} r={950} o={0.35} />
    <LightVeil id="s60v" lights={[[900, 520, 880]]} o={0.45} />
    <NoteSheet x={820} y={540} reveal={kf(t, [[2, 0], [46, 1]])} />
    <Phone x={1500} y={560} w={230} rot={12} on={0} />
    <ArmIn x={1250} y={kf(t, [[0, 120], [40, 380]])} ang={-30} look={TE} len={800} />
  </g>
);

// ---------- S75: macro, top-down: his work schedule, full, and what a course would cost ----------
export const S75: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.1]]))}>
    <Tabletop edge={1400} />
    <Glow x={900} y={480} r={950} o={0.35} />
    <LightVeil id="s75v" lights={[[960, 540, 900]]} o={0.45} />
    <Schedule x={960} y={540} />
  </g>
);

// ---------- S76: macro: the pen hovers over the note: he is not sure yet ----------
export const S76: React.FC<ShotProps> = ({ t, len }) => {
  // the pen tip hovers just above the empty "SĐT:" line; the pen leans up to the right, into his hand
  const sh = Math.sin(t / 3) * 3;
  const tx = 760 + sh;
  const ty = 714 + Math.cos(t / 4) * 3; // just above the SĐT line (~728)
  return (
    <g transform={camT(820, 640, kf(t, [[0, 1.5], [len, 1.75]]))}>
      <Tabletop edge={1400} />
      <Glow x={900} y={480} r={950} o={0.35} />
      <NoteSheet x={820} y={540} reveal={1} />
      <g transform={`translate(${tx} ${ty - 36}) rotate(28)`}>
        <rect x={-10} y={-300} width={20} height={300} rx={10} fill="#F2B33D" stroke="#1A1410" strokeWidth={4} />
        <path d="M -10 0 L 0 36 L 10 0 Z" fill="#E8DCBF" stroke="#1A1410" strokeWidth={3} />
        <rect x={-10} y={-300} width={20} height={50} rx={10} fill="#2E3F66" />
      </g>
      <ArmIn x={tx + 84} y={ty - 210} ang={-30} look={TE} len={800} />
    </g>
  );
};

// ---------- S61: macro: he writes the phone number down ----------
export const S61: React.FC<ShotProps> = ({ t }) => {
  // the number is written in ~40 frames; the pen tip follows the end of the writing on the "SĐT:" line
  const digits = '0123 456 789'.slice(0, Math.floor(kf(t, [[4, 0], [40, 12]])));
  const tx = 716 + digits.length * 25;
  const ty = 724 + Math.sin(t * 1.3) * 3;
  return (
    <g transform={camT(800, 660, 1.75)}>
      <Tabletop edge={1400} />
      <Glow x={900} y={480} r={950} o={0.35} />
      <NoteSheet x={820} y={540} reveal={1} digits={digits} />
      <g transform={`translate(${tx} ${ty - 36}) rotate(28)`}>
        <rect x={-10} y={-300} width={20} height={300} rx={10} fill="#F2B33D" stroke="#1A1410" strokeWidth={4} />
        <path d="M -10 0 L 0 36 L 10 0 Z" fill="#E8DCBF" stroke="#1A1410" strokeWidth={3} />
        <rect x={-10} y={-300} width={20} height={50} rx={10} fill="#2E3F66" />
      </g>
      <ArmIn x={tx + 84} y={ty - 210} ang={-30} look={TE} len={800} />
    </g>
  );
};

// ---------- S77: wide, top-down: the note beside the work schedule: both will have to fit into one week ----------
export const S77: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.1]]))}>
    <Tabletop edge={1400} />
    <Glow x={kf(t, [[0, 700], [len, 1100]])} y={460} r={950} o={0.35} />
    <LightVeil id="s77v" lights={[[900, 520, 950]]} o={0.45} />
    <Schedule x={1180} y={520} k={0.7} />
    <NoteSheet x={520} y={560} k={0.62} reveal={1} digits="0123 456 789" rot={-8} />
    <Phone x={1700} y={900} w={190} rot={-14} on={0} />
  </g>
);

// ---------- S62: macro, top-down: the next morning, the hard hat beside a new notebook ----------
export const S62: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.1]]))}>
    <Tabletop edge={1400} />
    <Glow x={kf(t, [[0, 300], [len, 1500]])} y={380} r={1000} o={0.45} />
    <LightVeil id="s62v" lights={[[kf(t, [[0, 300], [len, 1500]]), 400, 900]]} o={0.35} />
    <HardHat x={560} y={640} s={1.35} />
    <Notebook x={1120} y={520} w={300} rot={6} cover="#3C6E8C" title="VỞ MỚI" pen />
    <Foreground blur={10}>
      <path d="M 1860 1100 Q 1760 820 1960 740 L 1960 1100 Z" fill="#0A0810" opacity={0.6} />
    </Foreground>
  </g>
);

// ---------- S63: low insert: hat and notebook go in the bag; the zip closes ----------
export const S63: React.FC<ShotProps> = ({ t }) => {
  const zip = kf(t, [[8, 0], [34, 1]]);
  return (
    <g transform={camT(960, 560, 1)}>
      <Blur b={16}>
        <Home t={t} id="h63" table={false} morning />
      </Blur>
      <rect x={-300} y={-300} width={2600} height={1700} fill="#101828" opacity={0.25} />
      {/* drawn before the bag: they sink behind its open top and are gone before the zip closes (no fade) */}
      <g>
        <HardHat x={820} y={kf(t, [[0, 150], [20, 440]])} s={0.9} />
        <g transform={`translate(1060 ${kf(t, [[0, 170], [22, 470]])})`}>
          <rect x={-80} y={-110} width={170} height={220} rx={8} fill="#3C6E8C" stroke="#1A1410" strokeWidth={4} />
        </g>
      </g>
      <Backpack x={940} y={980} s={2.6} zip={zip} />
      <ArmIn x={kf(t, [[0, 1300], [34, 1040]])} y={kf(t, [[0, 240], [34, 540]])} ang={-30} look={TE} len={800} />
    </g>
  );
};

// ---------- S64: macro, low: the dusty boots from the start of the film; he steps into them ----------
export const S64: React.FC<ShotProps> = ({ t }) => {
  const d = kf(t, [[0, -240], [16, 0]], easeOut);
  return (
    <g transform={camT(940, 640, 1.05)}>
      <Blur b={16}>
        <Home t={t} id="h64" table={false} morning />
      </Blur>
      <rect x={-300} y={-300} width={2600} height={1700} fill="#101828" opacity={0.2} />
      <rect x={-400} y={880} width={3000} height={500} fill="#2E2228" />
      <Boot x={900} y={900} s={1.6} scuff={1} />
      <rect x={840} y={500 - 700 + d} width={170} height={700} fill="#33465A" stroke="#10141C" strokeWidth={5} />
      <rect x={826} y={480 + d} width={198} height={30} fill="#2A3A4C" stroke="#10141C" strokeWidth={5} />
      {t >= 16
        ? [0, 1, 2, 3].map((i) => <circle key={i} cx={760 + i * 120} cy={930 - (t - 16) * 2} r={14 + i * 4} fill="#CFC8BA" opacity={clamp(1 - (t - 16) / 14) * 0.5} />)
        : null}
    </g>
  );
};

// ---------- S65: wide: he walks out into the morning; the desk is left cleared, and the question stays on screen ----------
export const S65: React.FC<ShotProps> = ({ t, len }) => {
  const k = stand(HOME, 0.5, 0.3, 0.62);
  const x = kf(t, [[6, 880], [96, 1236]]);
  const pose = walkPose(x, t * 0.55, k.y + 140 * k.scale, k.scale, { headTilt: 3 }, 1);
  const fade = clamp((1262 - x) / 50);
  return (
    <>
      <g transform={camT(960, 560, kf(t, [[0, 1.05], [len, 1.12]]))}>
        <Home t={t} id="h65" table={false} morning />
        <g opacity={fade}>
          <Hero look={TE} pose={{ ...pose, expr: 'neutral' }} rimId="rimR" shadow={0.5} />
          <Backpack x={pose.x - 40 * k.scale} y={pose.y + 8 * k.scale} s={0.28} rot={0} />
        </g>
        <HomeTable />
        <Glow x={1250} y={560} r={400} o={0.35} />
      </g>
      <text x={960} y={940} textAnchor="middle" fontFamily={FONT.title} fontWeight={700} fontSize={72} fill="#F6EFE3" stroke="#1A1230" strokeWidth={10} paintOrder="stroke" opacity={clamp((t - 74) / 24)}>
        Bạn muốn viết tiếp điều gì?
      </text>
    </>
  );
};
