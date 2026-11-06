import React from 'react';
import {
  Hero, poseAt, faceAt, kf, clamp, easeOut, camT, Glow, Dust, LightVeil, Foreground, Tabletop, ShotProps, HEAD, stand, reachAngle, walkPose, toWorld, joints, FONT,
  Home, HomeTable, HOME, tableTop, Street, Kitchen, KitchenIsland, KITCHEN, Study, Desk, Schoolyard, Classroom, SchoolDesk, CLS, Paper,
  MedBag, Notes, NoticeSheet, Backpack, Boot, ArmIn, Strap, Tote, Bowl, Notebook,
} from '../../engine';
import { P, hipAt, WN, ST, MOM, MO, CHU, Blur, faceCam, handOf } from './common';

// Cảnh 3 (ngày cất chiếc cặp) và cảnh 4 (lần này, bạn đi học): S12 - S28, S68.

const MOM_AT = stand(HOME, 0.55, 0.2, 0.62);

// ---------- S12: wide, the little house: Mẹ counts money at the table, the school bag is under the bed ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => {
  const tp = tableTop(0.5, 0.4);
  const base = { x: MOM_AT.x, y: MOM_AT.y, scale: MOM_AT.scale, yaw: -0.25, headTilt: 12, look: -0.3 };
  const aim = reachAngle(P({ ...base }), { x: tp.x, y: tp.y });
  const mom = poseAt(t, [
    { f: 0, p: { ...base, armR: { a: aim, b: -4 }, armL: { a: aim + 8, b: -10 } } },
    { f: 20, p: { armL: { a: aim - 8, b: -6 } } },
    { f: 40, p: { armL: { a: aim + 8, b: -10 } } },
  ]);
  const kid = stand(HOME, 0.16, 0.7, 0.62);
  const boy = P({ x: kid.x, y: kid.y, scale: kid.scale, yaw: 0.5, headTilt: 8, look: 0.5, armR: { a: 10, b: -8 }, armL: { a: 8, b: -10 } });
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.02], [len, 1.12]]))}>
      <Home t={t + 40} id="h12" table={false} />
      <Hero look={MOM} pose={{ ...mom, ...faceAt(t, [[0, 'neutral']]) }} rimId="rimR" shadow={0} />
      <HomeTable />
      {[0.3, 0.45, 0.6].map((u, i) => {
        const p = tableTop(u, 0.45);
        return (
          <g key={i} transform={`translate(${p.x} ${p.y - 4}) scale(1 0.5)`}>
            <Notes x={0} y={0} w={64} h={3} c={i} />
          </g>
        );
      })}
      <Hero look={ST} pose={{ ...boy, ...faceAt(t, [[0, 'worried']]) }} rimId="rimR" shadow={0.5} />
    </g>
  );
};

// ---------- S13: low insert: the school bag lying under the bed ----------
export const S13: React.FC<ShotProps> = ({ t, len }) => {
  // low, under the bed rail: the bag lies there in the dark, a slice of door light reaches it
  const c = HOME.P(0.16, 1, 0.44);
  return (
    <g transform={camT(c.x + 30, c.y - 60, kf(t, [[0, 2.6], [len, 2.9]]))}>
      <Home t={t} id="h13" table={false} />
      <Glow x={c.x + 40} y={c.y - 30} r={200} o={0.35} />
    </g>
  );
};

// ---------- S14: macro, high angle: Bố's medicine on the table ----------
export const S14: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.06]]))}>
    <Tabletop edge={860} />
    <LightVeil id="s14v" lights={[[900, 420, 800]]} o={0.5} />
    <Glow x={900} y={380} r={760} o={0.4} />
    <ellipse cx={1500} cy={720} rx={90} ry={26} fill="#000" opacity={0.3} />
    <circle cx={1500} cy={690} r={70} fill="#C9D6DE" opacity={0.8} />
    <MedBag x={860} y={780} s={2.6} rot={kf(t, [[0, -2], [len, 1]])} />
    {[[1100, 810, 0], [1160, 790, 1], [1040, 840, 2], [1210, 836, 3]].map(([x, y, i]) => (
      <ellipse key={i} cx={x} cy={y} rx={26} ry={16} fill={['#D9534F', '#F2B33D', '#FFFFFF', '#8FB4D9'][i]} stroke="#8A9AA2" strokeWidth={3} />
    ))}
    <Paper x={1380} y={560} w={250} rot={-9} done fill={1} grade="" />
    <Foreground blur={10}>
      <path d="M -50 1100 Q 60 760 260 700 Q 200 900 240 1100 Z" fill="#0A0810" />
    </Foreground>
  </g>
);

// ---------- S15: macro, top-down: Mẹ counts the money into small piles ----------
const PILES = [
  { x: 520, y: 360, c: 0, h: 5 }, { x: 800, y: 360, c: 1, h: 3 }, { x: 1080, y: 360, c: 0, h: 4 }, { x: 1360, y: 360, c: 2, h: 2 },
  { x: 620, y: 700, c: 0, h: 6 }, { x: 940, y: 700, c: 1, h: 4 },
];
export const S15: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.08]]))}>
    <Tabletop edge={1400} />
    <Glow x={960} y={500} r={900} o={0.35} />
    <LightVeil id="s15v" lights={[[960, 520, 850]]} o={0.45} />
    {PILES.map((p, i) =>
      t > i * 5 ? (
        <g key={i} transform={`translate(0 ${t - i * 5 < 6 ? -(6 - (t - i * 5)) * 10 : 0})`}>
          <Notes x={p.x} y={p.y} w={230} h={p.h} c={p.c} rot={i % 2 ? 3 : -4} />
        </g>
      ) : null,
    )}
    <ArmIn x={kf(t, [[0, 700], [20, 640], [40, 760], [len, 700]])} y={kf(t, [[0, 500], [20, 600], [40, 480], [len, 520]])} ang={24} look={MOM} len={800} />
    <ArmIn x={kf(t, [[0, 1180], [30, 1080], [len, 1140]])} y={kf(t, [[0, 520], [30, 600], [len, 560]])} ang={-24} look={MOM} len={800} />
    <Foreground blur={10}>
      <rect x={1560} y={0} width={500} height={1200} fill="#0A0810" opacity={0.8} />
    </Foreground>
  </g>
);

// ---------- S16: macro, top-down: he folds the fee notice in half, and in half again ----------
export const S16: React.FC<ShotProps> = ({ t }) => {
  const fold = kf(t, [[8, 0], [34, 0.5], [58, 1]]);
  return (
    <g transform={camT(960, 540, 1)}>
      <Tabletop edge={1400} />
      <Glow x={960} y={520} r={900} o={0.3} />
      <LightVeil id="s16v" lights={[[960, 540, 850]]} o={0.45} />
      <NoticeSheet x={960} y={540} w={520} rot={-4} fold={fold} />
      <ArmIn x={kf(t, [[0, 1400], [20, 1210], [40, 1100], [58, 1080]])} y={kf(t, [[0, 80], [20, 330], [40, 560], [58, 560]])} ang={-30} look={ST} len={800} />
    </g>
  );
};

// ---------- S17: over the shoulder, the doorway: he hides the folded notice behind his back ----------
export const S17: React.FC<ShotProps> = ({ t, len }) => {
  const m = stand(HOME, 0.5, 0.2, 0.62);
  const mom = P({ x: m.x, y: m.y, scale: m.scale, yaw: 0.5, headTilt: 6, look: 0.8, armR: { a: 30, b: -40 }, armL: { a: 20, b: -20 } });
  const k = stand(HOME, 0.9, 0.55, 0.62);
  const boy = poseAt(t, [
    { f: 0, p: { x: k.x, y: k.y, scale: k.scale, yaw: -0.6, headTilt: 4, look: -0.7, armL: { a: 10, b: -10 }, armR: { a: 10, b: -10 } } },
    { f: 16, p: { armL: { a: -26, b: -12 }, armR: { a: -32, b: -10 }, headTilt: -2 }, ease: easeOut },
  ]);
  return (
    <g transform={camT(1050, 560, kf(t, [[0, 1.35], [len, 1.45]]))}>
      <Home t={t + 20} id="h17" table={false} />
      <Hero look={MOM} pose={{ ...mom, ...faceAt(t, [[0, 'neutral'], [20, 'worried']]) }} rimId="rimR" shadow={0} />
      <HomeTable />
      {/* the folded notice is behind his back: drawn before him so his body hides most of it */}
      <NoticeSheet x={k.x + 30 * k.scale} y={k.y - 20 * k.scale} w={70} rot={24} fold={1} />
      <Hero look={ST} pose={{ ...boy, ...faceAt(t, [[0, 'worried'], [30, 'neutral']]) }} rimId="rimR" shadow={0.5} />
      <Foreground blur={10}>
        <path d="M -200 1100 L -100 620 Q 120 560 300 640 L 360 1100 Z" fill="#0C0810" />
      </Foreground>
    </g>
  );
};

// ---------- S18: low insert: the school bag still holds his books; the zip runs shut ----------
export const S18: React.FC<ShotProps> = ({ t }) => {
  const zip = kf(t, [[10, 0], [36, 1]]);
  return (
    <g transform={camT(960, 560, 1)}>
      <Blur b={16}>
        <Home t={t} id="h18" table={false} />
      </Blur>
      <rect x={-300} y={-300} width={2600} height={1700} fill="#0A0814" opacity={0.35} />
      <Backpack x={900} y={960} s={2.6} zip={zip} />
      <ArmIn x={kf(t, [[0, 1250], [36, 1040]])} y={kf(t, [[0, 240], [36, 520]])} ang={-30} look={ST} len={800} />
    </g>
  );
};

// ---------- S19: close-up: he tells himself he will come back ----------
export const S19: React.FC<ShotProps> = ({ t }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: hipAt(2.6, 1130), scale: 2.6, yaw: 0.5, look: 0.5, headTilt: 5 } },
    { f: 46, p: { headTilt: -2, look: 0.2 } },
  ]);
  return (
    <g transform={faceCam(pose, 1.05, 40)}>
      <Blur b={16}>
        <Home t={t} id="h19" table={false} />
      </Blur>
      <rect x={-300} y={-300} width={2600} height={1700} fill="#0A0814" opacity={0.35} />
      <Hero look={ST} pose={{ ...pose, ...faceAt(t, [[0, 'worried'], [30, 'neutral']]) }} rimId="rimR" shadow={0} />
    </g>
  );
};

// ---------- S20: wide, the lane the next morning: Chú in a hard hat waits by the truck ----------
export const S20: React.FC<ShotProps> = ({ t, len }) => {
  const chu = P({ x: 940, y: hipAt(0.95, 800), scale: 0.95, yaw: -0.6, look: -0.5, armL: { a: -8, b: -96 }, armR: { a: 12, b: -10 } });
  const boy = poseAt(t, [
    { f: 0, p: { x: 360, y: hipAt(0.95, 800), scale: 0.95, yaw: 0.5, headTilt: 8, look: 0.4, armR: { a: 10, b: -8 }, armL: { a: 8, b: -10 } } },
    { f: 40, p: { headTilt: 12 } },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 900], [len, 780]]), 560, kf(t, [[0, 1.0], [len, 1.12]]))}>
      <Street t={t} id="st20" />
      <Hero look={CHU} pose={{ ...chu, ...faceAt(t, [[0, 'neutral']]) }} rimId="rimL" shadow={0.6} />
      <Hero look={WN} pose={{ ...boy, ...faceAt(t, [[0, 'worried']]) }} rimId="rimR" shadow={0.6} />
    </g>
  );
};

// ---------- S21: macro, low: his hand reaches the work boots; the picture stops ----------
export const S21: React.FC<ShotProps> = ({ t }) => {
  const u = Math.min(t, 44);
  const fz = clamp((t - 44) / 12) * 0.3;
  return (
    <>
      <g transform={camT(960, 700, 1.1)}>
        <Blur b={16}>
          <Street t={30} id="st21" />
        </Blur>
        <rect x={-500} y={840} width={3400} height={700} fill="#3E302E" />
        <Boot x={780} y={820} s={1.6} scuff={1} />
        <Boot x={1220} y={790} s={1.4} flip />
        <ArmIn x={kf(u, [[0, 1500], [30, 810], [44, 800]])} y={kf(u, [[0, 150], [30, 440], [44, 470]])} ang={-52} look={WN} len={900} />
        <Dust t={u} seed={3} x0={400} y0={300} w={1000} h={500} n={24} />
        <LightVeil id="s21v" lights={[[1500, 560, 700]]} o={0.45} />
      </g>
      <rect x={20} y={20} width={1880} height={1040} fill="none" stroke="#FFFFFF" strokeWidth={14} opacity={fz} />
    </>
  );
};

// ---------- S22: medium, the morning at home: this time he swings the school bag onto his shoulders ----------
export const S22: React.FC<ShotProps> = ({ t, len }) => {
  const k = stand(HOME, 0.64, 0.5, 0.62);
  const s = k.scale;
  const pose = poseAt(t, [
    { f: 0, p: { x: k.x, y: k.y, scale: s, yaw: 0.5, look: 0.6, headTilt: 6, armR: { a: 24, b: -10 }, armL: { a: 10, b: -10 } } },
    { f: 16, p: { armR: { a: 40, b: -140 }, headTilt: -2 }, ease: easeOut },
    { f: 22, p: { armR: { a: 36, b: -132 } } },
  ]);
  const up = clamp(t / 16);
  return (
    <g transform={camT(k.x - 30, k.y - 70 * s, kf(t, [[0, 1.8], [len, 1.95]]))}>
      <Home t={t + 30} id="h22" table={false} morning />
      <HomeTable />
      <Backpack x={k.x - 44 * s} y={k.y + (6 + (1 - up) * 90) * s} s={0.34 * s} rot={(1 - up) * -20} />
      <Hero look={ST} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [18, 'smug']]) }} rimId="rimR" shadow={0.5} />
      {up >= 1 ? <path d={`M ${k.x + 14 * s} ${k.y - 106 * s} Q ${k.x - 6 * s} ${k.y - 60 * s} ${k.x - 22 * s} ${k.y - 16 * s}`} stroke="#2E4768" strokeWidth={12 * s} fill="none" strokeLinecap="round" /> : null}
    </g>
  );
};

// ---------- S23: medium: the strap becomes the handle of Mẹ's tote: they walk out together ----------
export const S23: React.FC<ShotProps> = ({ t, len }) => {
  const x = kf(t, [[0, 740], [len, 1000]]);
  const mom = walkPose(x + 150, t * 0.55, 800, 0.95, {}, 1);
  const boy = walkPose(x - 90, t * 0.55 + 0.6, 800, 0.95, { headTilt: 8 }, 1);
  return (
    <g transform={camT(x + 40, 560, 1.5)}>
      <Street t={t} id="st23" />
      <Hero look={MOM} pose={{ ...mom, expr: 'neutral' }} rimId="rimR" shadow={0.6} />
      <Tote x={mom.x - 18} y={mom.y + 96} s={0.55} />
      <Hero look={ST} pose={{ ...boy, expr: 'worried' }} rimId="rimR" shadow={0.6} />
      <Backpack x={boy.x - 50} y={boy.y + 6} s={0.34} rot={0} />
    </g>
  );
};

// ---------- S24: medium, the canteen: in the afternoon he helps carry bowls ----------
export const S24: React.FC<ShotProps> = ({ t, len }) => {
  const k = stand(KITCHEN, 0.44, 0.4, 0.62);
  const boy = poseAt(t, [
    { f: 0, p: { x: k.x, y: k.y, scale: k.scale, yaw: 0.5, look: 0.6, armR: { a: 80, b: -70 }, armL: { a: 70, b: -60 }, headTilt: 2 } },
    { f: 20, p: { headTilt: 4 } },
  ]);
  const m = stand(KITCHEN, 0.16, 0.12, 0.62);
  const mom = P({ x: m.x, y: m.y, scale: m.scale, yaw: 0.4, headTilt: 6, armR: { a: 40, b: -90 } });
  const h = handOf(P({ ...boy }));
  return (
    <g transform={camT(960, 580, kf(t, [[0, 1.4], [len, 1.5]]))}>
      <Kitchen t={t + 40} id="k24" />
      <Hero look={MOM} pose={{ ...mom, expr: 'neutral' }} rimId="rimR" shadow={0} />
      <Hero look={ST} pose={{ ...boy, ...faceAt(t, [[0, 'tired']]) }} rimId="rimR" shadow={0} />
      <g transform={`translate(${h.x + 22} ${h.y - 8})`}>
        <rect x={-96} y={-4} width={190} height={12} rx={6} fill="#9AA3AB" stroke="#1A1410" strokeWidth={3} />
        {[-50, 0, 50].map((dx, i) => (
          <Bowl key={i} x={dx} y={-6} s={0.34} steam={1} f={t + i * 9} />
        ))}
      </g>
      <KitchenIsland />
    </g>
  );
};

// ---------- S25: macro, top-down: the evening's homework he does not understand ----------
export const S25: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.06]]))}>
    <Tabletop edge={1400} />
    <Glow x={900} y={460} r={900} o={0.35} />
    <LightVeil id="s25v" lights={[[900, 520, 820]]} o={0.5} />
    <Notebook x={820} y={540} w={330} open rot={-2} written={kf(t, [[0, 0.2], [len, 0.6]])} />
    {[[560, 380, -10], [820, 560, 8], [1030, 430, -6]].map(([x, y, r], i) => (
      <text key={i} x={x} y={y} fontFamily={FONT.hand} fontWeight={700} fontSize={110} fill="#D9534F" transform={`rotate(${r} ${x} ${y})`} opacity={clamp((t - 6 - i * 8) / 6)}>?</text>
    ))}
    <Paper x={1500} y={520} w={300} rot={-7} done={false} />
    <circle cx={1560} cy={920} r={90} fill="#000" opacity={0.3} />
    <circle cx={1550} cy={910} r={84} fill="#CFC8BA" />
    <circle cx={1550} cy={910} r={64} fill="#8A5A3A" />
    <ArmIn x={kf(t, [[0, 640], [len, 700]])} y={kf(t, [[0, 330], [len, 380]])} ang={26} look={ST} len={800} />
    <rect x={kf(t, [[0, 650], [len, 710]])} y={kf(t, [[0, 360], [len, 410]])} width={14} height={150} rx={7} fill="#F2B33D" stroke="#1A1410" strokeWidth={3} transform="rotate(-16 700 400)" />
  </g>
);

// ---------- S26: medium: he falls asleep on his notebook at the night desk ----------
export const S26: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 712, scale: 1, yaw: 0.1, tilt: 8, headTilt: 6, blink: 0.5, armR: { a: 76, b: -60 }, armL: { a: -76, b: 60 } } },
    { f: 26, p: { tilt: 30, headTilt: 30, blink: 1, y: 724 }, ease: easeOut },
  ]);
  return (
    <g transform={camT(960, 600, kf(t, [[0, 1.75], [len, 1.9]]))}>
      <Study t={t + 80} id="s26" night />
      {/* faceAt would reset blink to 0: keep the eyes shut from the pose */}
      <Hero look={ST} pose={{ ...pose, expr: 'tired', blink: pose.blink }} rimId="rimBlue" shadow={0} />
      <Desk x0={560} x1={1360} y={700} laptop={false} />
      {[0, 1, 2].map((i) => (
        <text key={i} x={1060 + i * 34} y={420 - ((t * 1.4 + i * 22) % 90)} fontFamily={FONT.title} fontWeight={800} fontSize={44 + i * 12} fill="#C9CCE0" opacity={clamp((t - 22) / 8) * 0.8}>z</text>
      ))}
    </g>
  );
};

// ---------- S27: wide, the school gate: the next morning he stops outside the classroom door, one beat late ----------
export const S27: React.FC<ShotProps> = ({ t, len }) => {
  const boy = P({ x: 900, y: hipAt(0.8), scale: 0.8, yaw: 0.7, look: 0.5, headTilt: 3, armR: { a: 10, b: -8 }, armL: { a: 8, b: -10 } });
  return (
    <g transform={camT(kf(t, [[0, 900], [len, 1000]]), 560, kf(t, [[0, 1.0], [len, 1.15]]))}>
      <Schoolyard t={t} id="s27" morning />
      {[0, 1, 2].map((i) => {
        const kidx = ((t * 3.4 + i * 330 + 200) % 1900) - 200;
        return <Hero key={i} look={i === 1 ? MO : ST} pose={{ ...walkPose(kidx, t * 0.6 + i, 830, 0.7, {}, 1), expr: 'neutral' }} rimId="rimR" shadow={0.5} />;
      })}
      <Hero look={ST} pose={{ ...boy, ...faceAt(t, [[0, 'worried']]) }} rimId="rimR" shadow={0.6} />
      <Backpack x={boy.x - 40} y={boy.y + 6} s={0.3} rot={0} />
    </g>
  );
};

// ---------- S28: medium: a friend pulls out the chair by the window for him ----------
export const S28: React.FC<ShotProps> = ({ t, len }) => {
  // the chair stands in front of the window desk; Mo, holding its back, slides it out toward the camera side
  const cx = kf(t, [[0, 560], [22, 700]], easeOut);
  const mo = poseAt(t, [
    { f: 0, p: { x: cx + 170, y: hipAt(0.95, 930), scale: 0.95, yaw: -0.5, look: -0.6, armL: { a: -40, b: -20 } } },
    { f: 22, p: { armL: { a: -52, b: -16 }, headTilt: -4 } },
  ]);
  const moP = { ...mo, x: cx + 170 };
  return (
    <g transform={camT(kf(t, [[0, 700], [len, 680]]), 640, 1.45)}>
      <Classroom t={t + 40} id="cls28" />
      <SchoolDesk x={560} />
      <g>
        <ellipse cx={cx + 6} cy={934} rx={80} ry={10} fill="#000" opacity={0.35} />
        <path d={`M ${cx - 50} 862 L ${cx - 56} 932 M ${cx + 50} 862 L ${cx + 56} 932`} stroke="#5E5A6C" strokeWidth={9} strokeLinecap="round" />
        <rect x={cx - 64} y={846} width={128} height={18} rx={5} fill="#8A6A44" stroke="#1A1410" strokeWidth={4} />
        <path d={`M ${cx - 52} 846 L ${cx - 52} 740 M ${cx + 52} 846 L ${cx + 52} 740`} stroke="#5E4A34" strokeWidth={10} strokeLinecap="round" />
        <rect x={cx - 60} y={736} width={120} height={48} rx={6} fill="#8A6A44" stroke="#1A1410" strokeWidth={4} />
        <path d={`M ${cx - 56} 740 L ${cx + 56} 740`} stroke="#FFB46A" strokeWidth={3} opacity={0.6} />
      </g>
      <Hero look={MO} pose={{ ...moP, ...faceAt(t, [[0, 'happy']]) }} rimId="rimL" shadow={0.6} />
      <Glow x={560} y={700} r={380} o={0.4} />
    </g>
  );
};

// ---------- S68: medium: the seat by the window still has someone in it: him ----------
export const S68: React.FC<ShotProps> = ({ t, len }) => {
  const boy = poseAt(t, [
    { f: 0, p: { x: 560, y: 748, scale: 0.9, yaw: 0.3, look: 0.4, headTilt: 2 } },
    { f: 40, p: { headTilt: -3 } },
  ]);
  const mo = P({ x: 810, y: hipAt(0.9, 830), scale: 0.9, yaw: -0.4, look: -0.4 });
  return (
    <g transform={camT(kf(t, [[0, 640], [len, 600]]), 590, kf(t, [[0, 1.5], [len, 1.65]]))}>
      <Classroom t={t + 40} id="cls68" />
      <Hero look={ST} pose={{ ...boy, ...faceAt(t, [[0, 'neutral'], [24, 'happy']]) }} rimId="rimR" shadow={0} />
      <SchoolDesk x={560} />
      <Hero look={MO} pose={{ ...mo, expr: 'happy' }} rimId="rimL" shadow={0.5} />
      <Glow x={480} y={560} r={460} o={0.5} />
    </g>
  );
};
