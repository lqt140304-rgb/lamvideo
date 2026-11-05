import React from 'react';
import {
  Hero, poseAt, faceAt, kf, clamp, easeOut, camT, LOOKS, Glow, Dust, LightVeil, Foreground, TitleCard, Phone, ShotProps, HEAD, rnd,
  Site, Schoolyard, Classroom, SchoolDesk, Boot, CementBag, ArmIn, Wheelbarrow, ChatScreen, ClassPhoto,
} from '../../engine';
import { P, SITE_G, hipAt, WK, WN, ST, GLOVE, Blur, faceCam, HeldPhone, handOf } from './common';

// Cảnh 1 (đôi giày) và cảnh 2 (câu hỏi): S1 - S11, S66, S67.

// ---------- S1: extreme close-up, low: dusty work boots; the screen is black, then opens ----------
export const S1: React.FC<ShotProps> = ({ t, len }) => {
  const black = kf(t, [[0, 1], [20, 1], [52, 0]]);
  const cx = kf(t, [[0, 880], [len, 940]]);
  return (
    <>
      <g transform={camT(cx, 740, kf(t, [[0, 1.2], [len, 1.36]]))}>
        <Blur b={16}>
          <Site t={t + 30} id="s1" />
        </Blur>
        <rect x={-500} y={860} width={3400} height={700} fill="#3E302E" />
        <rect x={-500} y={860} width={3400} height={46} fill="#6A5048" opacity={0.6} />
        <rect x={680} y={150} width={210} height={310} fill="#8A6B45" stroke="#1A1410" strokeWidth={5} />
        <rect x={668} y={440} width={236} height={34} fill="#6F5636" stroke="#1A1410" strokeWidth={5} />
        <Boot x={780} y={860} s={1.5} />
        <rect x={1040} y={250} width={170} height={250} fill="#8A6B45" stroke="#1A1410" strokeWidth={5} />
        <Boot x={1190} y={800} s={1.25} flip />
        <Dust t={t} seed={5} x0={400} y0={300} w={1100} h={600} n={30} />
        <Glow x={1500} y={620} r={800} o={0.35} />
        <LightVeil id="s1v" lights={[[1500, 640, 760]]} o={0.5} />
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill="#000" opacity={black} />
    </>
  );
};

// ---------- S2: macro insert: gloved hands drag a bag of cement ----------
export const S2: React.FC<ShotProps> = ({ t, len }) => {
  const pull = kf(t, [[0, 0], [30, 1], [len, 1.4]]);
  return (
    <g transform={camT(960, 640, kf(t, [[0, 1.05], [len, 1.18]]))}>
      <Blur b={16}>
        <Site t={t} id="s2" />
      </Blur>
      <CementBag x={560} y={870} s={1.3} rot={-3} />
      <CementBag x={1420} y={870} s={1.3} rot={4} />
      <CementBag x={1500} y={760} s={1.2} rot={8} />
      <CementBag x={960 - pull * 90} y={930} s={2.3} rot={-6 - pull * 8} />
      <ArmIn x={780 - pull * 90} y={610 + pull * 10} ang={40} look={GLOVE} len={800} />
      <ArmIn x={1120 - pull * 90} y={600 + pull * 10} ang={-40} look={GLOVE} len={800} />
      <Dust t={t} seed={7} x0={500} y0={300} w={1000} h={600} n={30} />
      <LightVeil id="s2v" lights={[[1450, 560, 700]]} o={0.4} />
    </g>
  );
};

// ---------- S3: medium: the phone in his pocket buzzes twice; he takes off one glove ----------
export const S3: React.FC<ShotProps> = ({ t, len }) => {
  // the phone buzzes in his pocket; he lifts it to his chest and wipes the dust off the screen with his bare hand
  const base = { x: 980, y: hipAt(1), scale: 1, yaw: 0.35, look: 0.5, headTilt: 10 };
  const wipe = t > 22 ? Math.sin((t - 22) / 2.6) * 14 : 0;
  const pose = poseAt(t, [
    { f: 0, p: { ...base, armR: { a: 14, b: -10 }, armL: { a: 8, b: -10 }, headTilt: 2 } },
    { f: 10, p: { armR: { a: 14, b: -10 }, headTilt: 6 } },
    { f: 18, p: { armR: { a: 38, b: -112 }, headTilt: 12 }, ease: easeOut },
    { f: 22, p: { armL: { a: 42, b: -96 } }, ease: easeOut },
  ]);
  const posed = { ...pose, armL: { a: pose.armL.a + wipe * 0.4, b: pose.armL.b } };
  const lifted = clamp((t - 10) / 8);
  const h = handOf(posed);
  const px = lifted < 1 ? 1020 + (h.x + 6 - 1020) * lifted : h.x + 6;
  const py = lifted < 1 ? base.y + 40 + (h.y - 22 - base.y - 40) * lifted : h.y - 22;
  const buzz = t < 10 && t % 8 < 4 ? 1 : 0;
  return (
    <g transform={camT(990, kf(t, [[0, 560], [24, 470]]), kf(t, [[0, 1.7], [24, 2.3]]))}>
      <Site t={t + 60} id="s3" />
      <Hero look={WK} pose={{ ...posed, ...faceAt(t, [[0, 'neutral'], [20, 'tired']]) }} rimId="rimR" shadow={0.7} />
      {lifted < 1 ? <Phone x={px} y={py} w={34} rot={6 - 6 * lifted} buzz={buzz} f={t} /> : <HeldPhone x={px} y={py} w={40} rot={-8} />}
      {buzz ? <Glow x={px} y={py} r={90} kind="cool" o={0.7} /> : null}
      {t > 22 ? <Dust t={t} seed={33} x0={px - 60} y0={py - 60} w={120} h={90} n={10} o={0.9} /> : null}
      <Foreground blur={10}>
        <rect x={1500} y={300} width={120} height={800} fill="#14101C" opacity={0.9} />
      </Foreground>
    </g>
  );
};

// ---------- S4: macro, the phone's screen: a message from the class group ----------
export const S4: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 360, kf(t, [[0, 1.2], [len, 1.3]]))}>
    <Blur b={16}>
      <Site t={t} id="s4" veil={0.6} />
    </Blur>
    <rect x={-300} y={-300} width={2600} height={1700} fill="#0A0814" opacity={0.55} />
    <ChatScreen x={960} y={540} w={620} msgs={t > 14 ? [{ who: 'a', text: 'Chủ nhật này họp lớp nhé!' }] : []} typing="" caret={false} />
    {/* dusty fingerprints on the glass */}
    {[[820, 760, 60], [1010, 840, 44], [900, 600, 30]].map(([x, y, r], i) => (
      <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.7} fill="#D9C9B0" opacity={0.1} />
    ))}
  </g>
);

// ---------- S66: macro: the message and the profile picture, still in a school uniform ----------
export const S66: React.FC<ShotProps> = ({ t, len }) => {
  // push in until the profile photo (in uniform) and the whole message both sit in frame
  const k = kf(t, [[0, 1.4], [len, 2.2]]);
  const cx = kf(t, [[0, 1000], [len, 1040]]);
  const cy = kf(t, [[0, 120], [len, 50]]);
  return (
    <g transform={camT(cx, cy, k)}>
      <rect x={-600} y={-700} width={3200} height={2400} fill="#0A0814" />
      <ChatScreen x={960} y={540} w={620} msgs={[{ who: 'a', text: 'Chủ nhật này họp lớp nhé!' }]} typing="" caret={false} />
    </g>
  );
};

// ---------- S5: close-up, a thumb on the screen: he types "Tao..." then deletes it ----------
export const S5: React.FC<ShotProps> = ({ t }) => {
  const word = 'Tao…';
  const n = t < 30 ? clamp(Math.floor((t - 3) / 3.5), 0, 4) : Math.max(0, 4 - Math.floor((t - 52) / 3));
  const thumb = kf(t, [[0, 40], [10, 0], [20, 6], [50, 6], [58, -4], [74, 30]]);
  return (
    <g transform={camT(960, 980, 1.9)}>
      <rect x={-600} y={-700} width={3200} height={2800} fill="#0A0814" />
      <ChatScreen x={960} y={540} w={620} msgs={[{ who: 'a', text: 'Chủ nhật này họp lớp nhé!' }]} typing={word.slice(0, n)} caret={Math.floor(t / 7) % 2 === 0} />
      <ArmIn x={1050} y={1080 + thumb} ang={-30} look={WN} len={700} k={3.6} />
    </g>
  );
};

// ---------- S67: close-up: his face lit by the screen; he lets his breath go ----------
export const S67: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: hipAt(1.9, 1040), scale: 1.9, yaw: 0.35, look: -0.3, headTilt: 3 } },
    { f: 40, p: { headTilt: -3, yaw: 0.2 } },
    { f: 70, p: { headTilt: 5 } },
  ]);
  return (
    <g transform={faceCam(pose, 1.15, 40)}>
      <Blur b={16}>
        <Site t={t} id="s67" veil={0.7} />
      </Blur>
      <rect x={-300} y={-300} width={2600} height={1700} fill="#0A0814" opacity={0.6} />
      <Hero look={WK} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [30, 'tired']]) }} rimId="rimBlue" shadow={0} />
      <Glow x={pose.x + 40} y={pose.y + HEAD.y * pose.scale + 160} r={420} kind="cool" o={0.55} />
    </g>
  );
};

// ---------- S6: medium: he scrolls through old photos on a break ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 980, y: hipAt(1), scale: 1, yaw: 0.6, look: 0.5, headTilt: 10, armR: { a: 55, b: -95 }, armL: { a: 20, b: -20 } } },
    { f: 24, p: { armR: { a: 58, b: -100 }, headTilt: 12 } },
    { f: 50, p: { armR: { a: 55, b: -95 } } },
  ]);
  const h = handOf(pose);
  return (
    <g transform={camT(1000, 560, kf(t, [[0, 1.6], [len, 1.8]]))}>
      <Site t={t + 20} id="s6" />
      <CementBag x={1250} y={SITE_G + 4} s={0.9} rot={4} />
      <Hero look={WK} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [26, 'worried']]) }} rimId="rimR" shadow={0.7} />
      <HeldPhone x={h.x + 18} y={h.y - 26} w={54} rot={-14} />
    </g>
  );
};

// ---------- S7: macro, the old class photo on the screen: the camera drifts into the empty place by the window ----------
export const S7: React.FC<ShotProps> = ({ t, len }) => {
  const z = kf(t, [[0, 0.95], [len, 2.3]]);
  const cx = kf(t, [[0, 960], [len, 600]]);
  const cy = kf(t, [[0, 540], [len, 590]]);
  return (
    <g transform={camT(cx, cy, z)}>
      <rect x={-800} y={-800} width={3600} height={2800} fill="#0A0814" />
      <rect x={300} y={130} width={1320} height={820} rx={50} fill="#16151C" stroke="#3A3846" strokeWidth={8} />
      <g transform="translate(960 540)">
        <ClassPhoto x={0} y={0} w={1100} gap={kf(t, [[0, 0.6], [len, 1]])} glow={1} />
      </g>
      <Glow x={960} y={540} r={900} kind="cool" o={0.2} />
    </g>
  );
};

// ---------- S8: wide, the classroom: the seat by the window in the evening sun ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 640]]), 560, kf(t, [[0, 1.0], [len, 1.3]]))}>
    <Classroom t={t + 40} id="cls8" />
    <SchoolDesk x={560} />
    {/* the evening sun falls on that one place only */}
    <polygon points="140,120 300,120 760,860 330,860" fill="#FFC27A" opacity={0.22} style={{ mixBlendMode: 'screen' }} />
    <LightVeil id="s8v" lights={[[560, 700, 330]]} o={0.35} />
    <Glow x={560} y={720} r={360} o={0.75} />
    <rect x={500} y={744} width={120} height={8} fill="#FFE2B0" opacity={0.9} />
    <Dust t={t} seed={9} x0={300} y0={300} w={600} h={500} n={26} />
  </g>
);

// ---------- S9: medium, low: he looks down at his work clothes; a speck of dust floats UP ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: hipAt(1), scale: 1, yaw: 0.25, look: 0, headTilt: 4, armR: { a: 14, b: -10 }, armL: { a: 10, b: -8 } } },
    { f: 18, p: { headTilt: 16, armR: { a: 28, b: -28 }, armL: { a: 22, b: -24 } }, ease: easeOut },
    { f: 40, p: { headTilt: 18 } },
  ]);
  const up = Math.max(0, t - 22);
  return (
    <g transform={camT(960, 640, kf(t, [[0, 1.7], [len, 1.85]]))}>
      <Site t={t} id="s9" />
      <Hero look={WK} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [16, 'worried']]) }} rimId="rimR" shadow={0.7} />
      {/* the speck: it lifts off his shoulder, slow at first and then faster */}
      <g transform={`translate(${1010 + up * 0.8} ${580 - up * up * 0.55})`}>
        <circle r={22} fill="url(#g3warm)" opacity={0.8} style={{ mixBlendMode: 'screen' }} />
        <circle r={5} fill="#FFF3DC" />
      </g>
    </g>
  );
};

// ---------- S10: wide, REWIND: the site runs backwards (the barrow rolls back, the wall un-builds, his work shirt becomes a uniform) ----------
export const S10: React.FC<ShotProps> = ({ t }) => {
  const bricks = kf(t, [[0, 0.3], [120, 0.95]]);
  const bx = kf(t, [[0, 1180], [120, 520]]);
  const heroLook = t < 36 ? 'student' : 'workerHat';
  return (
    <g transform={camT(960, 560, 1.05)}>
      <Site
        t={t}
        id="s10"
        bricks={bricks}
        crane={t}
        workers={[
          { x: 1300, look: 'chu', s: 0.62, yaw: -0.5 },
          { x: 420 + t * 1.1, look: 'bac', s: 0.6, yaw: 0.6 },
          { x: kf(t, [[0, 780], [120, 1020]]), look: heroLook as 'student', s: 0.74, yaw: 0.6 },
        ]}
      />
      <Wheelbarrow x={bx} y={SITE_G + 4} s={0.8} load={kf(t, [[0, 0], [100, 1]])} flip />
    </g>
  );
};

// ---------- S11: title card over a wide of the school at dusk: NẾU NGÀY ĐÓ / BẠN KHÔNG BỎ HỌC? ----------
export const S11: React.FC<ShotProps> = ({ t, len }) => {
  const pose = P({ x: 1130, y: hipAt(0.55), scale: 0.55, yaw: 0.8, look: 0.4 });
  return (
    <g transform={camT(960, kf(t, [[0, 560], [len, 530]]), kf(t, [[0, 1.0], [len, 1.1]]))}>
      <Schoolyard t={t} id="s11" />
      <Hero look={ST} pose={{ ...pose, ...faceAt(t, [[0, 'neutral']]) }} rimId="rimL" shadow={0.7} />
      <TitleCard t={t - 4} lines={['NẾU NGÀY ĐÓ', 'BẠN KHÔNG BỎ HỌC?']} accent="KHÔNG" accentT={46} y={170} size={104} />
    </g>
  );
};
