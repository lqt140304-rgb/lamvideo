import React from 'react';
import {
  Hero, poseAt, faceAt, kf, clamp, easeOut, camT, Glow, Dust, LightVeil, Foreground, Tabletop, ShotProps, HEAD, stand, reachAngle, FONT,
  Home, HomeTable, HOME, tableTop, Kitchen, Schoolyard, Workshop, WORK, BulbBoard, Building, BLD, Bus, Site, Bedroom, BedDuvet, bedSit, AlarmClock,
  Diploma, FormSheet, Paper, Envelope, Lunchbox, Phone, ArmIn, Bowl, Notes, Backpack, Boot,
} from '../../engine';
import { P, SITE_G, hipAt, WK, WN, ST, TE, MOM, MO, Blur, faceCam, handOf, Cap, LedgerScreen } from './common';

// Cảnh 5 (cuộc đời còn lại), 6 (bạn vẫn đi làm), 7 (tháng lương đầu): S29 - S49, S69 - S73.

// ---------- S29: wide, the graduation day in the school yard ----------
export const S29: React.FC<ShotProps> = ({ t, len }) => {
  const mk = (x: number, s: number, extra = {}) => P({ x, y: hipAt(s), scale: s, yaw: 0.2, ...extra });
  const boy = mk(960, 0.9, { armR: { a: 20, b: -10 } });
  const mo = mk(740, 0.85, { yaw: 0.5, armL: { a: 150, b: 10 }, armR: { a: 150, b: 10 } });
  const mom = mk(1210, 0.85, { yaw: -0.4, armR: { a: 12, b: -10 } });
  const h = handOf(boy);
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.12]]))}>
      <Schoolyard t={t} id="s29" grad />
      <Hero look={MO} pose={{ ...mo, expr: 'happy' }} rimId="rimR" shadow={0.6} />
      <Cap pose={mo} color="#2A2F44" />
      <Hero look={MOM} pose={{ ...mom, ...faceAt(t, [[0, 'happy']]) }} rimId="rimL" shadow={0.6} />
      <Hero look={ST} pose={{ ...boy, ...faceAt(t, [[0, 'neutral'], [20, 'happy']]) }} rimId="rimR" shadow={0.7} />
      <Cap pose={boy} />
      <rect x={h.x - 6} y={h.y - 4} width={64} height={12} rx={6} fill="#F4E9C9" stroke="#1A1410" strokeWidth={3} transform={`rotate(-30 ${h.x} ${h.y})`} />
    </g>
  );
};

// ---------- S30: macro, top-down: the vocational school form beside his diploma ----------
export const S30: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(960, 540, 1)}>
    <Tabletop edge={1400} />
    <Glow x={960} y={500} r={950} o={0.35} />
    <LightVeil id="s30v" lights={[[960, 540, 900]]} o={0.45} />
    <Diploma x={640} y={560} w={560} rot={-5} />
    <FormSheet x={kf(t, [[0, 1500], [16, 1260]])} y={kf(t, [[0, 600], [16, 560]])} w={400} rot={4} filled={kf(t, [[10, 0], [34, 1]])} />
    <ArmIn x={kf(t, [[0, 1700], [16, 1370]])} y={kf(t, [[0, 400], [16, 480]])} ang={-60} look={ST} len={800} />
    <rect x={1340} y={760} width={220} height={16} rx={8} fill="#2E3F66" transform="rotate(-18 1450 768)" />
  </g>
);

// ---------- S31: macro, top-down: a test paper with a correction in red ----------
export const S31: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(960, 540, 1)}>
    <Tabletop edge={1400} />
    <Glow x={960} y={500} r={900} o={0.35} />
    <LightVeil id="s31v" lights={[[960, 540, 900]]} o={0.45} />
    <Paper x={900} y={560} w={560} rot={-3} done fill={1} grade="8" />
    <g fontFamily={FONT.hand} fontWeight={700} fill="#D9534F" opacity={clamp((t - 6) / 8)}>
      <ellipse cx={1010} cy={420} rx={90} ry={34} fill="none" stroke="#D9534F" strokeWidth={6} />
      <path d="M 1100 420 q 40 -50 80 -6" stroke="#D9534F" strokeWidth={5} fill="none" strokeLinecap="round" />
      <text x={1190} y={410} fontSize={64}>sửa lại: 24</text>
    </g>
    <ArmIn x={kf(t, [[0, 1500], [20, 1210]])} y={kf(t, [[0, 120], [20, 400]])} ang={-30} look={ST} len={800} />
  </g>
);

// ---------- S32: macro: a night shift at the canteen: a stack of hot bowls ----------
export const S32: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(960, 560, 1)}>
    <Blur b={16}>
      <Kitchen t={t} id="k32" veil={0.65} />
    </Blur>
    <rect x={-300} y={-300} width={2600} height={1700} fill="#0A0814" opacity={0.3} />
    {[0, 1, 2].map((i) => (
      <Bowl key={i} x={960 + (i - 1) * 6} y={880 - i * 132} s={2.2} steam={i === 2 ? 1 : 0} f={t} />
    ))}
    <ArmIn x={640} y={720} ang={50} look={ST} len={800} />
    <ArmIn x={1290} y={720} ang={-50} look={ST} len={800} />
  </g>
);

// ---------- S33: wide, the workshop: the first try at wiring the practice board ----------
const WK_AT = stand(WORK, 0.42, 0.55, 0.62);
export const S33: React.FC<ShotProps> = ({ t }) => {
  const target = { x: 800, y: 500 };
  const p0 = P({ x: WK_AT.x, y: WK_AT.y, scale: WK_AT.scale, yaw: 0.4, look: 0.4 });
  const aim = reachAngle(p0, target);
  const pose = poseAt(t, [
    { f: 0, p: { ...p0, armR: { a: 12, b: -10 } } },
    { f: 10, p: { armR: { a: aim - 6, b: -6 }, handR: 'point' }, ease: easeOut },
    { f: 30, p: { armR: { a: aim + 2, b: -4 } } },
    { f: 38, p: { armR: { a: 40, b: -60 }, headTilt: 5 } },
    { f: 52, p: { armR: { a: aim - 4, b: -6 }, headTilt: 0 } },
    { f: 80, p: { armR: { a: aim + 2, b: -4 } } },
    { f: 120, p: { armR: { a: 40, b: -60 } } },
  ]);
  return (
    <g transform={camT(900, 560, 1.4)}>
      <Workshop t={t + 30} id="w33" board={<BulbBoard x={845} y={508} w={250} wired={t % 90 < 30 ? 0.5 : 1} f={t} />} />
      <Hero look={ST} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [34, 'oops'], [50, 'neutral']]) }} rimId="rimR" shadow={0} />
    </g>
  );
};

// ---------- S34: macro: the bulb on the practice board stays dark... and then, the third time, lights ----------
export const S34: React.FC<ShotProps> = ({ t }) => {
  const on = clamp((t - 84) / 3); // dark through the whole first view; the third try lights it
  const sw = t >= 80 ? 1 : 0;
  return (
    <g transform={camT(960, 560, 1)}>
      <Blur b={16}>
        <Workshop t={t} id="w34" />
      </Blur>
      <rect x={-300} y={-300} width={2600} height={1700} fill="#0A0814" opacity={0.45} />
      <BulbBoard x={960} y={560} w={1100} on={on} wired={t < 30 ? 0.5 : 1} sw={sw} f={t} />
      <ArmIn x={kf(t, [[0, 1760], [24, 1480], [30, 1440], [46, 1460], [60, 1700], [74, 1500], [80, 1440]])} y={kf(t, [[0, 100], [24, 360], [30, 420], [46, 380], [60, 150], [74, 380], [80, 420]])} ang={-48} look={ST} len={800} k={3.4} />
    </g>
  );
};

// ---------- S35: medium: "Con làm được rồi": he calls home with the news ----------
export const S35: React.FC<ShotProps> = ({ t, len }) => {
  const k = stand(WORK, 0.56, 0.5, 0.62);
  const pose = poseAt(t, [
    { f: 0, p: { x: k.x, y: k.y, scale: k.scale, yaw: 0.15, look: 0.2, armR: { a: 14, b: -10 }, armL: { a: 10, b: -10 } } },
    // the near hand comes up to the right ear: upper arm out and up, forearm folded back to the head
    { f: 14, p: { armR: { a: 120, b: 105 }, headTilt: 6 }, ease: easeOut },
  ]);
  const h = handOf(pose);
  return (
    <g transform={camT(980, 560, kf(t, [[0, 1.45], [len, 1.55]]))}>
      <Workshop t={t + 30} id="w35" board={<BulbBoard x={845} y={508} w={250} on={1} wired={1} f={t} />} />
      <Hero look={ST} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [12, 'happy']]) }} rimId="rimR" shadow={0} />
      {t >= 10 ? <Phone x={h.x - 4 * pose.scale} y={h.y - 14 * pose.scale} w={30 * pose.scale} rot={-14} /> : null}
    </g>
  );
};

// ---------- S36: medium: at home, Mẹ answers the phone ----------
export const S36: React.FC<ShotProps> = ({ t, len }) => {
  const k = stand(HOME, 0.55, 0.2, 0.62);
  const pose = poseAt(t, [
    { f: 0, p: { x: k.x, y: k.y, scale: k.scale, yaw: -0.15, look: -0.2, armL: { a: -120, b: -105 }, armR: { a: 10, b: -10 } } },
    { f: 60, p: { headTilt: -4 } },
  ]);
  const h = handOf(pose);
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 940]]), 560, kf(t, [[0, 1.5], [len, 1.7]]))}>
      <Home t={t + 40} id="h36" table={false} />
      <Hero look={MOM} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [30, 'happy']]) }} rimId="rimR" shadow={0} />
      <HomeTable />
      <Phone x={h.x + 4 * pose.scale} y={h.y - 14 * pose.scale} w={30 * pose.scale} rot={14} />
    </g>
  );
};

// ---------- S69: close-up: he smiles, with nothing more to say ----------
export const S69: React.FC<ShotProps> = ({ t }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: hipAt(2.6, 1130), scale: 2.6, yaw: 0.4, look: 0.3, headTilt: -3 } },
    { f: 40, p: { headTilt: 3 } },
  ]);
  return (
    <g transform={faceCam(pose, 1.05, 40)}>
      <Blur b={16}>
        <Workshop t={t} id="w69" />
      </Blur>
      <rect x={-300} y={-300} width={2600} height={1700} fill="#0A0814" opacity={0.3} />
      <Hero look={ST} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [10, 'happy']]) }} rimId="rimR" shadow={0} />
    </g>
  );
};

// ---------- S37: macro: the alarm clock rings in the dark ----------
export const S37: React.FC<ShotProps> = ({ t }) => {
  const sh = Math.sin(t * 5) * (t < 22 ? 7 : 0);
  return (
    <g transform={camT(960, 560, 1)}>
      <Blur b={16}>
        <Bedroom t={t} id="b37" clock="05:00" lamp={0.2} rented />
      </Blur>
      <rect x={-300} y={-300} width={2600} height={1700} fill="#05060F" opacity={0.5} />
      <g transform={`translate(${sh} 0)`}>
        <AlarmClock x={960} y={720} s={3.4} text="05:00" on={1} />
      </g>
      {t < 22
        ? [-1, 1].map((sd) => (
            <path key={sd} d={`M ${960 + sd * 330} 460 q ${sd * 50} 90 0 180 M ${960 + sd * 400} 420 q ${sd * 70} 130 0 260`} stroke="#FFB15A" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.75} />
          ))
        : null}
      <ArmIn x={kf(t, [[0, 1900], [20, 1900], [26, 1230]])} y={kf(t, [[0, 100], [20, 100], [26, 560]])} ang={-60} look={TE} len={800} />
    </g>
  );
};

// ---------- S38: medium: he sits up in the half dark, the same face but a different life ----------
export const S38: React.FC<ShotProps> = ({ t, len }) => {
  const b = bedSit(0.2);
  const pose = poseAt(t, [
    { f: 0, p: { x: b.x, y: b.y, scale: b.scale, yaw: 0.35, tilt: 14, headTilt: 12, blink: 0.7 } },
    { f: 18, p: { tilt: 0, headTilt: 3, blink: 0 }, ease: easeOut },
  ]);
  return (
    <g transform={camT(800, 560, kf(t, [[0, 1.45], [len, 1.55]]))}>
      <Bedroom t={t + 30} id="b38" duvet={false} clock="05:00" lamp={0.55} rented />
      <Hero look={TE} pose={{ ...pose, ...faceAt(t, [[0, 'tired']]) }} rimId="rimBlue" shadow={0} />
      <BedDuvet knees={1} />
    </g>
  );
};

// ---------- S39: macro, top-down: a lunch box opened; he glances at the phone and eats fast ----------
export const S39: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.06]]))}>
    <Tabletop edge={1400} kind="stone" wood="#8E8A80" grain="#7E7A70" lip="#6E6A60" />
    <Glow x={900} y={480} r={900} o={0.35} />
    <LightVeil id="s39v" lights={[[900, 520, 850]]} o={0.45} />
    <Lunchbox x={780} y={600} s={1.7} f={t} />
    <Phone x={1500} y={520} w={230} rot={14} on={1} caller="MẸ" buzz={t % 20 < 8 ? 1 : 0} f={t} />
    <ArmIn x={kf(t, [[0, 900], [20, 820], [40, 900]])} y={kf(t, [[0, 200], [20, 360], [40, 250]])} ang={20} look={TE} len={800} />
  </g>
);

// ---------- S40: macro: the end of the month, the phone shows the rent and the rest ----------
export const S40: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(960, 540, 0.85)}>
    <rect x={-600} y={-700} width={3200} height={2600} fill="#0A0814" />
    <LedgerScreen x={960} y={540} w={620} reveal={kf(t, [[2, 0], [26, 1]])} />
  </g>
);

// ---------- S41: medium: in the building almost finished he lets out a long breath ----------
export const S41: React.FC<ShotProps> = ({ t, len }) => {
  const k = stand(BLD, 0.5, 0.58, 0.62);
  const pose = poseAt(t, [
    { f: 0, p: { x: k.x, y: k.y, scale: k.scale, yaw: 0.3, look: 0.2, armR: { a: 14, b: -10 }, armL: { a: 8, b: -10 } } },
    // a sigh: the head drops and the shoulders sag, the arms just hang (no arm swing)
    { f: 22, p: { armR: { a: 5, b: -4 }, armL: { a: 3, b: -4 }, headTilt: 14, tilt: 4, squash: 0.02 }, ease: easeOut },
    { f: 44, p: { headTilt: 16 } },
  ]);
  return (
    <g transform={camT(980, 560, kf(t, [[0, 1.55], [len, 1.7]]))}>
      <Building t={t} id="bld41" />
      <Hero look={TE} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [18, 'tired']]) }} rimId="rimR" shadow={0.6} />
    </g>
  );
};

// ---------- S42: close-up: he asks himself whether another trade would have been better ----------
export const S42: React.FC<ShotProps> = ({ t }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: hipAt(2.6, 1130), scale: 2.6, yaw: 0.5, look: 0.6, headTilt: 4 } },
    { f: 60, p: { headTilt: -4, look: -0.2 } },
    { f: 120, p: { headTilt: 2, look: 0.4 } },
  ]);
  return (
    <g transform={faceCam(pose, kf(t, [[0, 1.05], [135, 1.25]]), 40)}>
      <Blur b={16}>
        <Building t={t} id="bld42" />
      </Blur>
      <rect x={-300} y={-300} width={2600} height={1700} fill="#0A0814" opacity={0.3} />
      <Hero look={TE} pose={{ ...pose, ...faceAt(t, [[0, 'tired'], [70, 'worried']]) }} rimId="rimR" shadow={0} />
    </g>
  );
};

const GLASS_WORKERS: { x: number; look: 'chu' | 'bac' | 'workerHat' | 'moi'; s: number; yaw: number }[] = [
  { x: 560, look: 'chu', s: 0.9, yaw: 0.5 },
  { x: 880, look: 'bac', s: 0.9, yaw: -0.4 },
  { x: 1220, look: 'workerHat', s: 0.9, yaw: -0.6 },
  { x: 1520, look: 'moi', s: 0.9, yaw: 0.4 },
];

// ---------- S43: wide, pulling back: through the glass, a group of workers ----------
export const S43: React.FC<ShotProps> = ({ t, len }) => {
  const k = stand(BLD, 0.42, 0.62, 0.62);
  const boy = P({ x: k.x, y: k.y, scale: k.scale, yaw: 0.25, look: 0.5, headTilt: 5, armR: { a: 12, b: -10 }, armL: { a: 8, b: -10 } });
  return (
    <g transform={camT(kf(t, [[0, 940], [90, 960]]), kf(t, [[0, 600], [90, 540]]), kf(t, [[0, 1.8], [90, 0.98]]))}>
      <Building t={t + 30} id="bld43" workers={GLASS_WORKERS} />
      <Hero look={TE} pose={{ ...boy, ...faceAt(t, [[0, 'tired'], [60, 'worried']]) }} rimId="rimR" shadow={0.6} />
    </g>
  );
};

// ---------- S70: wide: the glass wall, the group at work beyond it ----------
export const S70: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 960], [len, 1000]]), 540, kf(t, [[0, 0.98], [len, 1.12]]))}>
    <Building t={t + 120} id="bld70" workers={GLASS_WORKERS} />
  </g>
);

// ---------- S44: close-up, through the glass: a worker turns round, and he is the man you were ----------
export const S44: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: hipAt(2.0, 1080), scale: 2.0, yaw: -0.9, look: -0.6, headTilt: 0 } },
    { f: 34, p: { yaw: 0.15, look: 0.1 }, ease: easeOut },
    { f: 60, p: { yaw: 0.05 } },
  ]);
  return (
    <g transform={faceCam(pose, 1.0, 40)}>
      <Blur b={10}>
        <Site t={t} id="s44" bricks={1} veil={0.3} />
      </Blur>
      <Hero look={WK} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [36, 'tired']]) }} rimId="rimR" shadow={0} />
      {/* the glass between us: a sheen, a mullion, a smear */}
      <polygon points="300,-300 700,-300 300,1400 -100,1400" fill="#FFFFFF" opacity={0.06} />
      <rect x={1560} y={-300} width={34} height={1800} fill="#2A2830" />
    </g>
  );
};

// ---------- S71: macro: the first wage in an envelope in his shirt pocket ----------
export const S71: React.FC<ShotProps> = ({ t, len }) => {
  // close on him in the bus seat: the first wage sticks out of his shirt pocket, his hand pats it
  const s = 2.2;
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: 1000, scale: s, yaw: 0.3, look: -0.6, headTilt: 10, armR: { a: 8, b: -8 } } },
    { f: 16, p: { armR: { a: 20, b: -137 }, headTilt: 14 }, ease: easeOut },
    { f: 40, p: { headTilt: 12 } },
  ]);
  const px = pose.x + 14 * s;
  const py = pose.y - 74 * s;
  return (
    <g transform={camT(900, kf(t, [[0, 740], [len, 720]]), kf(t, [[0, 1.0], [len, 1.08]]))}>
      <Blur b={16}>
        <Bus t={t} id="bus71" />
      </Blur>
      <rect x={-300} y={-300} width={2600} height={1700} fill="#0A0814" opacity={0.25} />
      <Hero look={WN} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [18, 'happy']]) }} rimId="rimR" shadow={0} />
      <Envelope x={px + 4} y={py - 18} w={64 * s} rot={-10} />
      <rect x={px - 30 * s} y={py - 6} width={60 * s} height={40 * s} rx={4} fill="#8E5620" stroke="#1A1410" strokeWidth={4} />
    </g>
  );
};

// ---------- S45: medium, the bus: he counts the money again on the way home ----------
export const S45: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 690, scale: 1, yaw: 0.5, look: 0.5, headTilt: 12, legL: { a: 84, b: -86 }, legR: { a: 84, b: -86 }, armR: { a: 56, b: -80 }, armL: { a: 40, b: -70 } } },
    { f: 30, p: { headTilt: 14 } },
  ]);
  return (
    <g transform={camT(960, 520, kf(t, [[0, 1.55], [len, 1.7]]))}>
      <Bus t={t} id="bus45" />
      <Hero look={WN} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [20, 'happy']]) }} rimId="rimR" shadow={0} />
      <Envelope x={pose.x + 96} y={pose.y - 64} w={120} rot={-10} />
    </g>
  );
};

// ---------- S46: medium: back home he sets the envelope in front of Mẹ ----------
export const S46: React.FC<ShotProps> = ({ t, len }) => {
  const m = stand(HOME, 0.45, 0.2, 0.62);
  const mom = P({ x: m.x, y: m.y, scale: m.scale, yaw: 0.5, look: 0.5, headTilt: 4, armR: { a: 10, b: -10 } });
  const k = stand(HOME, 0.8, 0.52, 0.62);
  const tp = tableTop(0.75, 0.55);
  const p0 = P({ x: k.x, y: k.y, scale: k.scale, yaw: -0.6 });
  const aim = reachAngle(p0, { x: tp.x, y: tp.y - 10 });
  const boy = poseAt(t, [
    { f: 0, p: { ...p0, armL: { a: 20, b: -30 }, headTilt: 4 } },
    { f: 18, p: { armL: { a: aim, b: -4 } }, ease: easeOut },
  ]);
  return (
    <g transform={camT(1000, 560, kf(t, [[0, 1.3], [len, 1.42]]))}>
      <Home t={t + 20} id="h46" table={false} />
      <Hero look={MOM} pose={{ ...mom, ...faceAt(t, [[0, 'neutral'], [24, 'worried']]) }} rimId="rimR" shadow={0} />
      <HomeTable />
      <g transform={`translate(${tp.x} ${tp.y - 2}) scale(1 0.55)`}>
        <Envelope x={0} y={0} w={170} rot={-6} creased={kf(t, [[18, 1], [34, 0.1]])} />
      </g>
      <Hero look={WN} pose={{ ...boy, ...faceAt(t, [[0, 'neutral'], [18, 'smug']]) }} rimId="rimR" shadow={0.5} />
    </g>
  );
};

// ---------- S47: macro, top-down: Mẹ takes his hand and looks at the scrape on his finger ----------
export const S47: React.FC<ShotProps> = ({ t }) => {
  return (
    // close on the two hands: his comes in from the right, palm down; hers closes over his wrist, then the scrapes show
    <g transform={camT(kf(t, [[0, 980], [30, 1000]]), 620, kf(t, [[0, 1.45], [30, 1.7]]))}>
      <Tabletop edge={1400} />
      <Glow x={960} y={560} r={900} o={0.35} />
      <LightVeil id="s47v" lights={[[1000, 600, 700]]} o={0.45} />
      <ArmIn x={1050} y={620} ang={-80} look={WN} len={1100} />
      <ArmIn x={kf(t, [[0, 700], [24, 1110]], easeOut)} y={kf(t, [[0, 380], [24, 560]], easeOut)} ang={34} look={MOM} len={800} />
      <g opacity={clamp((t - 26) / 8)}>
        <g stroke="#C2453E" strokeWidth={5} strokeLinecap="round" fill="none">
          <path d="M 996 618 l 20 -8 M 1000 634 l 22 -8 M 994 650 l 16 -5" />
        </g>
        <rect x={962} y={636} width={34} height={14} rx={4} fill="#E8C9A8" stroke="#1A1410" strokeWidth={3} transform="rotate(-20 979 643)" />
      </g>
    </g>
  );
};

// ---------- S48: close-up: he pulls his hand back and smiles it off ----------
export const S48: React.FC<ShotProps> = ({ t }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 940, y: hipAt(2.5, 1120), scale: 2.5, yaw: 0.3, look: -0.4, headTilt: 0 } },
    { f: 40, p: { headTilt: 5, look: 0.2 } },
  ]);
  return (
    <g transform={faceCam(pose, 1.05, 40)}>
      <Blur b={16}>
        <Home t={t} id="h48" table={false} />
      </Blur>
      <rect x={-300} y={-300} width={2600} height={1700} fill="#0A0814" opacity={0.3} />
      <Hero look={WN} pose={{ ...pose, ...faceAt(t, [[0, 'oops'], [26, 'smug']]) }} rimId="rimR" shadow={0} />
      <Foreground blur={10}>
        <ArmIn x={kf(t, [[0, 560], [30, 380]])} y={kf(t, [[0, 900], [30, 1000]])} ang={50} look={MOM} len={800} />
      </Foreground>
    </g>
  );
};

// ---------- S72: medium: "Không. Mai nó khỏi.": his hand goes behind his back ----------
export const S72: React.FC<ShotProps> = ({ t, len }) => {
  const k = stand(HOME, 0.7, 0.5, 0.62);
  const pose = poseAt(t, [
    { f: 0, p: { x: k.x, y: k.y, scale: k.scale, yaw: -0.3, look: -0.2, armL: { a: 30, b: -30 } } },
    { f: 14, p: { armL: { a: -26, b: -12 }, armR: { a: -30, b: -10 }, headTilt: -3 }, ease: easeOut },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 1020], [len, 980]]), 570, 1.55)}>
      <Home t={t + 30} id="h72" table={false} />
      <HomeTable />
      <Hero look={WN} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [12, 'happy']]) }} rimId="rimR" shadow={0.5} />
      <Foreground blur={10}>
        <path d="M -200 1100 L -120 640 Q 100 580 260 650 L 330 1100 Z" fill="#14101A" />
      </Foreground>
    </g>
  );
};

// ---------- S49: wide: that evening they eat dinner, two bowls for him ----------
export const S49: React.FC<ShotProps> = ({ t, len }) => {
  const m = stand(HOME, 0.46, 0.2, 0.62);
  const b = stand(HOME, 0.64, 0.2, 0.62);
  const mom = P({ x: m.x, y: m.y, scale: m.scale, yaw: 0.4, look: 0.4, armR: { a: 40, b: -70 } });
  const boy = P({ x: b.x, y: b.y, scale: b.scale, yaw: -0.4, look: -0.4, armL: { a: 60, b: -80 }, headTilt: Math.sin(t / 6) * 3 });
  const pts = [tableTop(0.2, 0.6), tableTop(0.7, 0.6), tableTop(0.45, 0.35)];
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.12], [len, 1.24]]))}>
      <Home t={t + 20} id="h49" table={false} />
      <Hero look={MOM} pose={{ ...mom, ...faceAt(t, [[0, 'happy']]) }} rimId="rimR" shadow={0} />
      <Hero look={WN} pose={{ ...boy, ...faceAt(t, [[0, 'neutral'], [20, 'happy']]) }} rimId="rimL" shadow={0} />
      <HomeTable />
      {pts.map((p, i) => (
        <Bowl key={i} x={p.x} y={p.y + 2} s={0.3} steam={1} f={t + i * 10} full={i === 1 ? 0 : 1} />
      ))}
    </g>
  );
};

// ---------- S73: macro: two bowls, empty ----------
export const S73: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(960, 540, 1)}>
    <Tabletop edge={900} />
    <Glow x={900} y={400} r={800} o={0.4} />
    <LightVeil id="s73v" lights={[[900, 460, 800]]} o={0.5} />
    <Bowl x={700} y={780} s={2.5} full={0} steam={0} f={t} />
    <Bowl x={1220} y={760} s={2.5} full={0} steam={0} f={t} />
    <path d="M 560 560 L 1400 700" stroke="#8A5A3A" strokeWidth={10} strokeLinecap="round" opacity={0.9} />
    <Foreground blur={10}>
      <path d="M 1800 1100 Q 1700 800 1960 700 L 1960 1100 Z" fill="#0A0810" />
    </Foreground>
  </g>
);
