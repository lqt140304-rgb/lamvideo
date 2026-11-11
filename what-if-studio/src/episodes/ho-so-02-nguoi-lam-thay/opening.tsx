import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT } from '../../engine/fonts';
import { JointPose, mixPose, NguoiKia, PALETTE, sampleWalk, STAND_POSE, StudentTwinBody, StudentTwinHead, TungSoccer, TWIN_POSES } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { placeOn, RoomScene } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';
import { Mirror } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/dao-cu';
import { EXTRA_POSES, gripAt } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/nhan-vat-va-tu-the';
import { MirrorRealm } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/boi-canh';
import { LaptopScreen } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/giao-dien';
import { Camera, FilmLook, HEAD_AT, lerpLens, Lens, LOOK, RAYS, seg, Sleeper, wideMove } from './canh-01-demo';

/**
 * The Crack in Reality — Hồ sơ 02: Người trong gương — OPENING 48 giây, bản dựng thử câm.
 * Nguồn: episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/KICH-BAN-TRAILER-VA-OPENING.md (Phần 1, Shot 0–5).
 * Kịch bản viết cho 24 fps; studio chạy 30 fps nên mốc giây giữ nguyên, số frame nhân 1,25.
 * Lời dẫn và độc thoại hiện bằng phụ đề tạm; chưa có giọng, nhạc, SFX.
 */
const S = [0, 150, 450, 780, 1140, 1320, 1440]; // mốc đầu mỗi shot (frame @30fps)
export const OPENING_TOTAL = S[6];

const BAR = 138; // viền đen 2.39:1 trên khung 16:9
const Letterbox: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: BAR, background: '#000' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR, background: '#000' }} />
  </AbsoluteFill>
);

/** Phụ đề tạm thay giọng; `who` để phân biệt lời dẫn / độc thoại / thì thầm. */
const Caption: React.FC<{ f: number; from: number; to: number; who?: string; children: React.ReactNode; tone?: 'warm' | 'cold' }> = ({ f, from, to, who, children, tone = 'warm' }) => {
  if (f < from || f >= to) return null;
  const o = Math.min(seg(f, from, from + 8), 1 - seg(f, to - 8, to));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: BAR + 26, textAlign: 'center', opacity: o, fontFamily: FONT.title, color: tone === 'cold' ? '#bfe9e2' : '#f1ead9', textShadow: '0 2px 6px #000' }}>
      {who && <div style={{ fontSize: 22, letterSpacing: 3, opacity: 0.75, marginBottom: 6 }}>{who}</div>}
      <div style={{ fontSize: 36, lineHeight: 1.35, padding: '0 220px', fontStyle: tone === 'cold' ? 'italic' : 'normal' }}>{children}</div>
    </div>
  );
};

// Vệt lóa ngang (anamorphic streak) quét qua khung.
const Streak: React.FC<{ t: number; color?: string; y?: number }> = ({ t, color = '#6fe3e6', y = 540 }) =>
  t <= 0 || t >= 1 ? null : (
    <div style={{ position: 'absolute', left: -600 + 3100 * t, top: y - 4, width: 1400, height: 8, borderRadius: 4, opacity: Math.sin(Math.PI * t) * 0.8, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, filter: 'blur(3px)', mixBlendMode: 'screen' }} />
  );

// Tấm vải hoa cũ phủ nửa trên gương (toạ độ của Mirror: gốc ở chân giữa, kính từ -h tới 0).
// Vải đã cũ: bạc màu, hoa phai gần hết, vết ố loang, hai lỗ thủng nhỏ, một miếng vá khâu tay, mép dưới sờn tua chỉ.
// `breath` 0–1 phồng mép vải ra như có hơi thở từ phía sau kính.
const Cloth: React.FC<{ w: number; h: number; sway: number; breath?: number }> = ({ w, h, sway, breath = 0 }) => {
  const x0 = -w / 2 - 14, x1 = w / 2 + 14, top = -h - 34, bot = -h * 0.5 + 18 * breath;
  const b = 26 * breath;
  const body = `M${x0} ${top + 30}Q0 ${top - 40} ${x1} ${top + 30}V${bot + 4}Q${x0 + w * 0.88} ${bot + 30 + b} ${x0 + w * 0.72} ${bot + 14 + b}Q${x0 + w * 0.55} ${bot + 40 - sway + b} ${x0 + w * 0.38} ${bot + 6 + b}Q${x0 + w * 0.2} ${bot + 34 + sway} ${x0} ${bot + 10}Z`;
  return (
    <g data-layer="vai-phu">
      <path d={body} fill="#6b6366" />
      {/* nếp vải: vài mảng tối tự vẽ */}
      <path d={`M${x0 + w * 0.3} ${top + 10}Q${x0 + w * 0.26} ${bot - 80} ${x0 + w * 0.38} ${bot + 6 + b}L${x0 + w * 0.45} ${bot + 8 + b}Q${x0 + w * 0.36} ${bot - 90} ${x0 + w * 0.4} ${top + 6}Z`} fill="#4f484b" opacity={0.75} />
      <path d={`M${x0 + w * 0.7} ${top + 14}Q${x0 + w * 0.76} ${bot - 60} ${x0 + w * 0.72} ${bot + 14 + b}L${x0 + w * 0.8} ${bot + 18 + b}Q${x0 + w * 0.82} ${bot - 70} ${x0 + w * 0.76} ${top + 12}Z`} fill="#4f484b" opacity={0.65} />
      {/* hoa đã phai gần hết */}
      {Array.from({ length: 18 }, (_, i) => {
        const cx = x0 + 30 + ((i * 97) % (w - 20)), cy = top + 60 + ((i * 53) % (h * 0.4));
        return <g key={i} transform={`translate(${cx} ${cy})`} opacity={0.18 + (i % 3) * 0.06}>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-7} rx={4} ry={7} fill="#94868a" transform={`rotate(${a})`} />)}<circle r={3} fill="#a39a7c" /></g>;
      })}
      {/* vết ố vàng nâu loang */}
      <path d={`M${x0 + w * 0.12} ${top + h * 0.2}q30 -26 62 -4q28 22 6 46q-30 26 -58 4q-24 -20 -10 -46Z`} fill="#7a6a4c" opacity={0.35} />
      <path d={`M${x0 + w * 0.58} ${bot - 120}q40 -10 52 22q10 34 -28 40q-44 4 -46 -26q0 -26 22 -36Z`} fill="#6e5f45" opacity={0.3} />
      <path d={`M${x0 + w * 0.82} ${top + h * 0.12}q18 -8 26 10q6 20 -16 22q-18 0 -10 -32Z`} fill="#7a6a4c" opacity={0.28} />
      {/* miếng vá khâu tay */}
      <g transform={`translate(${x0 + w * 0.22} ${bot - 150}) rotate(-6)`}>
        <rect width={70} height={54} rx={4} fill="#5d6460" />
        <rect x={4} y={4} width={62} height={46} rx={3} fill="none" stroke="#a49c8a" strokeWidth={2} strokeDasharray="5 5" />
      </g>
      {/* lỗ thủng: thấy mặt kính tối phía sau */}
      <path d={`M${x0 + w * 0.64} ${top + h * 0.26}q10 -8 20 0q6 10 -4 16q-14 4 -16 -16Z`} fill="#141c1d" />
      <path d={`M${x0 + w * 0.4} ${bot - 46 + b}q7 -5 13 1q3 8 -5 10q-10 0 -8 -11Z`} fill="#141c1d" />
      {/* mép dưới sờn: tua chỉ rủ */}
      {Array.from({ length: 16 }, (_, i) => {
        const t = (i + 0.5) / 16, x = x0 + (x1 - x0) * t;
        const y = bot + 10 + Math.sin(t * Math.PI * 3) * 14 + b * Math.sin(t * Math.PI);
        return <path key={i} d={`M${x} ${y}l${(i % 3) - 1} ${8 + (i * 7) % 12}`} stroke="#5a5255" strokeWidth={2} strokeLinecap="round" opacity={0.8} />;
      })}
    </g>
  );
};

// ---------- SHOT 0: tấm vải cũ phủ gương, kính "thở" (0–5s) ----------
const MW = 420, MH = 900;
const Shot0: React.FC<{ f: number }> = ({ f }) => {
  const pan = interpolate(f, [0, 150], [150, -110]);
  const z = interpolate(f, [0, 150], [1.55, 1.85]);
  // hơi thở từ trong kính: mép vải phồng ra rồi xẹp (hai nhịp, nhịp sau mạnh hơn), mặt kính dưới vải mờ hơi sương
  const breath = 0.5 * Math.sin(Math.PI * seg(f, 40, 70)) + Math.sin(Math.PI * seg(f, 96, 136));
  const mist = Math.max(seg(f, 44, 64) * (1 - seg(f, 70, 92)), seg(f, 100, 118) * (1 - seg(f, 136, 150)));
  return (
    <AbsoluteFill style={{ background: '#0e1517' }}>
      <svg width={1920} height={1080}>
        <g transform={`translate(${960 + pan} 540) rotate(-5) scale(${z}) translate(0 ${MH * 0.42})`}>
          <rect x={-1400} y={-1600} width={2800} height={2400} fill="#151d1f" />
          <Mirror w={MW} h={MH}>
            <rect width={MW} height={MH} fill="#1d2a2b" opacity={0.92} />
            <path d={`M0 ${MH * 0.62}L${MW} ${MH * 0.5}V${MH * 0.58}L0 ${MH * 0.72}Z`} fill="#7fb7c4" opacity={0.18} />
            <filter id="suong" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={22} /></filter><g filter="url(#suong)" opacity={0.32 * mist}><ellipse cx={MW * 0.52} cy={MH * 0.56} rx={90 + 40 * mist} ry={40 + 16 * mist} fill="#d6ebe8" /><ellipse cx={MW * 0.38} cy={MH * 0.6} rx={50} ry={26} fill="#d6ebe8" /><ellipse cx={MW * 0.66} cy={MH * 0.6} rx={46} ry={22} fill="#d6ebe8" /></g>
          </Mirror>
          <Cloth w={MW} h={MH} sway={Math.sin(f / 18) * 3} breath={breath} />
        </g>
      </svg>
      {/* ánh xanh chạng vạng từ khe cửa sổ, phần còn lại chìm trong tối */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 45% 55% at 38% 46%, rgba(120,170,190,.10), rgba(0,0,0,.62) 100%)' }} />
      <Streak t={seg(f, 84, 124)} y={470} />
    </AbsoluteFill>
  );
};

// ---------- SHOT 1: báo thức lần 5, tay trong gương rút trễ (5–15s) ----------
const BED_HEAD: [number, number] = [424, 332];
// Khung báo thức riêng ở góc trên trái, tách khỏi cảnh giường bằng một vết cắt răng cưa hình tia sét.
// Khung có nền riêng (đỏ cam nháy theo nhịp chuông), điện thoại cận to và rung; chém vào nhanh lúc chuông reo, rút ra khi tắt chuông.
const BOLT = 'M0 138H980L860 300L930 312L700 520L780 534L460 760L540 772L0 942Z';
const PhoneAlarm: React.FC<{ f: number }> = ({ f }) => {
  const open = seg(f, 0, 5) * (1 - seg(f, 36, 42)); // chém vào / rút ra
  const ring = 0.5 + 0.5 * Math.sin(f * 0.9); // nhịp chuông
  const shake = Math.sin(f * 2.3) * 5 * open;
  const slide = (1 - open) * -420;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={1920} height={1080}>
        <defs>
          <clipPath id="khung-bao-thuc"><path d={BOLT} transform={`translate(${slide} ${slide * 0.4})`} /></clipPath>
          <radialGradient id="nen-bao-thuc" cx=".32" cy=".42" r=".7">
            <stop offset="0" stopColor="#ff7a45" />
            <stop offset=".55" stopColor="#b8322a" />
            <stop offset="1" stopColor="#3a0f12" />
          </radialGradient>
        </defs>
        <g clipPath="url(#khung-bao-thuc)">
          <rect width={1920} height={1080} fill="url(#nen-bao-thuc)" />
          <rect width={1920} height={1080} fill="#ffd7a8" opacity={0.18 * ring} />
          {/* vạch rung toả quanh máy */}
          {[0, 1, 2].map((i) => (
            <g key={i} stroke="#ffe3c4" strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.35 + 0.4 * ring}>
              <path d={`M${170 - i * 34} ${330 + i * 10}q-18 70 0 140`} />
              <path d={`M${560 + i * 34} ${330 + i * 10}q18 70 0 140`} />
            </g>
          ))}
          <g transform={`translate(${365 + shake} 560) rotate(${-8 + shake * 0.6})`}>
            <rect x={-150} y={-280} width={300} height={520} rx={42} fill="#1c2428" />
            <rect x={-134} y={-264} width={268} height={488} rx={32} fill="#18232c" stroke="#ff6b52" strokeWidth={5} />
            <text x={0} y={-150} textAnchor="middle" fontFamily={FONT.title} fontSize={92} fill="#f4f7f9">07:00</text>
            <text x={0} y={-96} textAnchor="middle" fontFamily={FONT.title} fontSize={26} fill="#e3e9ee" letterSpacing={1}>BÁO THỨC: ĐI HỌC</text>
            <text x={0} y={-58} textAnchor="middle" fontFamily={FONT.title} fontSize={30} fill="#ff8a74">(LẦN 5)</text>
            <rect x={-100} y={120} width={200} height={56} rx={28} fill="#d0533f" />
            <text x={0} y={157} textAnchor="middle" fontFamily={FONT.title} fontSize={24} fill="#fff">Dừng · Báo lại</text>
          </g>
        </g>
        {/* viền vết cắt sáng như tia sét */}
        <path d="M980 138L860 300L930 312L700 520L780 534L460 760L540 772L0 942" transform={`translate(${slide} ${slide * 0.4})`} fill="none" stroke="#fff6d8" strokeWidth={9} strokeLinejoin="miter" opacity={open} style={{ filter: 'drop-shadow(0 0 10px #ffd27a)' }} />
      </svg>
    </AbsoluteFill>
  );
};

// Insert gương: kính phản chiếu chính căn phòng (lật ngang). Tay thật đã rút về ở shot trước; tay trong gương còn duỗi, khựng lại rồi mới rút.
const reachReal = (t: number) => seg(t, 20, 40) * (1 - seg(t, 46, 60));
const MirrorLag: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const move = wideMove(180);
  const head = placeOn('wide', BED_HEAD, 33, move);
  const refl = 1 - seg(f, 18, 32); // f=0 là lúc tay thật vừa rút xong
  const vw = 560, vh = (vw * MH) / MW;
  return (
    <AbsoluteFill style={{ background: '#121a1b' }}>
      <svg width={1920} height={1080}>
        <g transform={`translate(960 889) scale(${1.55 + 0.05 * seg(f, 0, 74)})`}>
          <rect x={-1200} y={-1200} width={2400} height={1300} fill="#1a2224" />
          <Mirror w={MW} h={MH}>
            <g transform={`translate(${MW} 0) scale(-1 1)`}>
              <svg width={MW} height={MH} viewBox={`${head.x - vw * 0.55} ${head.y - vh * 0.74} ${vw} ${vh}`} preserveAspectRatio="xMidYMid slice">
                <RoomScene view="wide" door="ajar" chair="bed" phone="hidden" move={move} sleeper={Sleeper({ reach: refl, alarm: false, f: g, phone: true })} />
              </svg>
            </g>
            <rect width={MW} height={MH} fill="#0d1a1c" opacity={0.22} />
          </Mirror>
          <Cloth w={MW} h={MH} sway={1} />
        </g>
      </svg>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,.6) 100%)' }} />
    </AbsoluteFill>
  );
};

const Shot1: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const move = wideMove(180);
  const head = placeOn('wide', BED_HEAD, 33, move);
  const close: Lens = { cx: head.x - 140, cy: head.y + 60, z: 1.85 };
  const mid: Lens = { cx: head.x - 260, cy: head.y + 120, z: 1.6 };
  if (f >= 60 && f < 134) return <MirrorLag f={f - 60} g={g} />;
  const a = f < 60;
  // a: chuông reo, tay thò ra với máy. c: đã trùm chăn ngủ tiếp, máy lùi dần ra trung cảnh (dolly-out).
  const reach = a ? reachReal(f) : 0;
  const cover = a ? 0 : 0.55 * seg(f, 134, 150); // rụt vào chăn nhưng còn lộ tóc/mắt để lời dẫn giới thiệu Nam
  const lens = a ? close : lerpLens(close, mid, seg(f, 150, 300));
  return (
    <AbsoluteFill>
      <Camera lens={lens} f={g} hand={0.4}>
        <RoomScene rays={RAYS} falloff={0.9} view="wide" door="ajar" chair="bed" phone="hidden" mirror move={move} sleeper={Sleeper({ cover, breath: !a && f > 150 ? Math.sin(f / 15) * 5 : 0, reach, carry: 0, alarm: a && f < 42, f, phone: true })} />
      </Camera>
      {a && f < 42 && <PhoneAlarm f={f} />}
      <Streak t={a ? seg(f, 4, 40) : 0} color="#7fb4ff" y={430} />
    </AbsoluteFill>
  );
};

// ---------- SHOT 2: ba lát cắt trì hoãn (15–26s) ----------
const DESK: [number, number] = [396, 112]; // SEATS.desk
const GAME: JointPose = EXTRA_POSES['choi-game'];
const POINT: JointPose = { ...STAND_POSE, tilt: 6, neck: 6, armL: { a: 22, b: 14, rot: 1 }, handL: 'open', frontL: true };

const Slice2A: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const move = { push: 10 * seg(f, 0, 100), truck: 0 };
  const nam = { at: DESK, render: (p: { x: number; y: number; scale: number }) => <StudentTwinBody {...LOOK} {...p} mood="annoyed" face={f > 40 ? 'tuc-gian-02' : 'tuc-gian-01'} pose={{ ...GAME, view: 'three', facing: 1 }} /> };
  const tung = { at: [235, 250] as [number, number], render: () => { const p = placeOn('desk', [334, 60], 168, move); return <TungSoccer {...p} mood="annoyed" pose={{ ...POINT, view: 'three', facing: 1 }} />; } };
  return (
    <Camera lens={{ cx: 960, cy: 540, z: 1 }} f={g} hand={0.8}>
      <RoomScene rays={RAYS} sun={0} view="desk" chair="desk" move={move} actors={[tung, nam]} />
    </Camera>
  );
};

const Slice2B: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  // Nam đi ngang bồn rửa ngập bát, xua tay; whip pan ở cuối lát.
  const x = interpolate(f, [0, 110], [175, 55]);
  const walk = sampleWalk(f / 16);
  const wave = seg(f, 30, 40) * (1 - seg(f, 70, 80));
  const pose = mixPose(walk, { ...walk, armL: { a: 80, b: 60, rot: 1 }, handL: 'open', frontL: true }, wave);
  const nam = { at: [x, 66] as [number, number], render: (p: { x: number; y: number; scale: number }) => <StudentTwinBody {...LOOK} {...p} mood="annoyed" face="tuc-gian-01" talk={wave > 0.5 && f % 8 < 4 ? { shape: 'a', open: 0.6 } : undefined} pose={{ ...pose, view: 'three', facing: -1 }} /> };
  const whip = seg(f, 92, 110);
  return (
    <AbsoluteFill style={{ filter: whip > 0 ? `blur(${whip * 14}px)` : undefined }}>
      <div style={{ position: 'absolute', inset: 0, transform: `rotate(10deg) scale(1.12) translateX(${-whip * 600}px)` }}>
        <Camera lens={{ cx: 960, cy: 540, z: 1 }} f={g} hand={1.2}>
          <RoomScene sun={0.2} view="kitchen" kitchen="messy" actors={[nam]} />
        </Camera>
      </div>
    </AbsoluteFill>
  );
};

// 2C: đêm, hai đứa đứng giữa phòng. Tùng đi làm về mệt, xoa gáy; Nam chìa cốc nước, Tùng đưa tay đón rồi cầm cốc về trước ngực.
const NAM_2C: [number, number] = [160, 222], TUNG_2C: [number, number] = [268, 232];
const OFFER_CUP: JointPose = { ...STAND_POSE, tilt: 4, neck: 2, armL: { a: 62, b: 22, rot: -1 }, handL: 'hold', frontL: true };
const TUNG_TIRED: JointPose = { ...STAND_POSE, tilt: 5, neck: 10, armR: { a: -40, b: 140, rot: -1 }, wristR: -40, handR: 'open', frontR: true }; // xoa gáy
const TUNG_TAKE: JointPose = { ...STAND_POSE, tilt: 3, neck: 4, armR: { a: 62, b: 22 }, handR: 'hold', frontR: true };
const Cup: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-20 -46H20L16 22Q0 30-16 22Z" fill="#cfe6e8" opacity={0.9} />
    <path d="M-18 -22H18L15 20Q0 26-15 20Z" fill="#9fd0d8" opacity={0.75} />
  </g>
);
const Slice2C: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const offer = seg(f, 20, 46);
  const take = seg(f, 46, 64); // Tùng vươn tay đón
  const handed = f >= 66; // cốc sang tay Tùng
  const bring = seg(f, 70, 92);
  const namPose = mixPose(STAND_POSE, OFFER_CUP, handed ? 1 - seg(f, 70, 90) : offer);
  // sau khi trao, Tùng giữ nguyên tay đón đang cầm cốc (cốc đứng yên đúng chỗ hai tay gặp nhau), Nam rút tay về
  const tungPose = handed ? { ...TUNG_TAKE, neck: TUNG_TAKE.neck - 4 * bring } : mixPose(mixPose(STAND_POSE, TUNG_TIRED, 1 - seg(f, 30, 44)), TUNG_TAKE, take);
  const pn = placeOn('wide', NAM_2C), pt = placeOn('wide', TUNG_2C);
  const gN = gripAt(handed ? OFFER_CUP : namPose, 'L');
  const cup = { x: pn.x + gN.x * pn.scale, y: pn.y + gN.y * pn.scale, s: pn.scale };
  const nam = { at: NAM_2C, render: () => <StudentTwinBody {...LOOK} {...pn} shirt={PALETTE.nam.sleepShirt} mood="calm" face={offer > 0.5 ? 'nhe-nhom-02' : 'buon-01'} blink={f % 80 < 3} pose={{ ...namPose, handL: handed ? 'rest' : 'hold', view: 'three', facing: 1 }} /> };
  const tung = { at: TUNG_2C, render: () => <TungSoccer {...pt} mood={handed ? 'normal' : 'annoyed'} blink={f % 64 < 3} pose={{ ...tungPose, view: 'three', facing: -1 }} /> };
  const mid = { cx: (pn.x + pt.x) / 2, cy: pn.y + 280 * pn.scale };
  return (
    <AbsoluteFill>
      <Camera lens={{ cx: mid.cx, cy: mid.cy, z: 1.55 + 0.08 * seg(f, 0, 120) }} f={g} hand={0.5}>
        <RoomScene night view="wide" chair="bed" door="closed" phone="hidden" actors={[nam, tung]} />
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}><Cup {...cup} /></svg>
      </Camera>
    </AbsoluteFill>
  );
};

const Shot2: React.FC<{ f: number; g: number }> = ({ f, g }) => (f < 100 ? <Slice2A f={f} g={g} /> : f < 210 ? <Slice2B f={f - 100} g={g} /> : <Slice2C f={f - 210} g={g} />);

// ---------- SHOT 3: độc thoại, phản chiếu lệch dần (26–38s) ----------
// Đầu shot bóng trong gương là phản chiếu thật (cùng Nam, lật ngang). Lúc gãi mắt: bóng làm trễ 6 frame,
// nốt ruồi chớp đổi bên (lóe 2 frame mặt Người Kia), rồi bóng thôi bắt chước: Nam cúi gục, bóng ngẩng lên nhìn thẳng máy.
const SCRATCH: JointPose = { ...STAND_POSE, neck: 4, armR: { a: -45, b: 138 }, wristR: -50, handR: 'fist', frontR: true };
const SLUMP: JointPose = { ...STAND_POSE, tilt: 4, neck: 16 };
const namPose3 = (t: number) => mixPose(mixPose(STAND_POSE, SCRATCH, seg(t, 150, 175) * (1 - seg(t, 238, 258))), SLUMP, seg(t, 262, 290));
const namFace3 = (t: number) => (t < 60 ? 'buon-01' : t < 150 ? 'buon-02' : 'buon-03') as 'buon-01' | 'buon-02' | 'buon-03';
const heartbeat = (t: number, from: number, rate: number) => (t < from ? 0 : Math.max(0, Math.sin(((t - from) / rate) * Math.PI * 2)) ** 8);
const Shot3: React.FC<{ f: number }> = ({ f }) => {
  const swap = f >= 162; // từ đây cái bóng là Người Kia: nốt ruồi nằm bên kia
  const glitch = f >= 160 && f < 166;
  const flash = f === 161 || f === 162;
  const free = seg(f, 268, 286); // bóng thôi bắt chước
  const lagT = f < 150 ? f : f - 6;
  const reflPose = mixPose(namPose3(lagT), { ...STAND_POSE, neck: -6 }, free);
  const pulse = heartbeat(f, 170, 26) * 0.012;
  const z = interpolate(f, [0, 360], [1, 1.2]) + pulse;
  const talk = f > 40 && f < 340 && f % 10 < 5 ? { shape: 'closed' as const, open: 0.25 } : undefined;
  const blink = f % 90 < 3;
  return (
    <AbsoluteFill style={{ background: '#0b1211' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${z}) translateX(${glitch ? (f % 2 ? 14 : -10) : 0}px)`, transformOrigin: '1000px 480px' }}>
        <svg width={1920} height={1080}>
          <defs><linearGradient id="uplight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity=".75" /><stop offset=".2" stopColor="#000" stopOpacity=".35" /><stop offset=".34" stopColor="#000" stopOpacity="0" /><stop offset=".7" stopColor="#3ff0d8" stopOpacity=".14" /><stop offset="1" stopColor="#3ff0d8" stopOpacity=".3" /></linearGradient></defs>
          <g transform="translate(1390 1500) scale(1.6)">
            <Mirror w={MW} h={MH}>
              <rect width={MW} height={MH} fill="#101917" />
              {swap ? (
                <NguoiKia {...LOOK} x={MW * 0.5} y={MH * 0.12} scale={0.95} face={free > 0.5 ? undefined : namFace3(lagT)} mood={free > 0.5 ? 'stare_grin' : 'calm'} blink={free > 0.5 ? false : blink} pose={{ ...reflPose, view: free > 0.5 ? 'front' : 'three', facing: -1 }} />
              ) : (
                <StudentTwinBody {...LOOK} x={MW * 0.5} y={MH * 0.12} scale={0.95} face={namFace3(f)} mood="sleepy" blink={blink} talk={talk} pose={{ ...reflPose, view: 'three', facing: -1 }} />
              )}
              <rect width={MW} height={MH} fill="#3cc6c0" opacity={0.05 + 0.08 * free} />
              <rect width={MW} height={MH} fill="url(#uplight)" opacity={free} />
            </Mirror>
          </g>
          <StudentTwinBody {...LOOK} x={760} y={150} scale={1.55} face={namFace3(f)} mood="sleepy" blink={blink} talk={talk} pose={{ ...namPose3(f), view: 'three', facing: 1 }} />
        </svg>
        {/* laptop tiền cảnh trái, hắt sáng xanh lạnh */}
        <div style={{ position: 'absolute', left: 60, bottom: BAR + 10, width: 460, height: 260, transform: 'perspective(800px) rotateY(28deg)', filter: 'blur(2px)', boxShadow: '0 0 90px rgba(110,220,230,.45)' }}>
          <svg width={460} height={260} viewBox="0 0 1920 1080"><LaptopScreen /></svg>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', fontFamily: FONT.title, fontSize: 30, color: '#ff4b3a', textShadow: '0 0 14px #ff5a3a', opacity: f % 30 < 20 ? 1 : 0.55 }}>Hạn chót: 23:59 — THIẾU BÀI TẬP</div>
        </div>
      </div>
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(70,170,180,.16) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,.4) 62%, rgba(0,0,0,.2) 100%)' }} />
      {/* lóe 2 frame: cận mặt Người Kia cười lạnh */}
      {flash && (
        <AbsoluteFill style={{ background: '#d8fff8' }}>
          <svg width={1920} height={1080}><StudentTwinHead identity="nguoi-kia" mood="eerie_smirk" view="front" x={960} y={140} scale={5.2} /></svg>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: '#000', opacity: 0.25 * free * (f % 7 < 2 ? 1 : 0.4) }} />
    </AbsoluteFill>
  );
};

// ---------- SHOT 4: bàn tay xuyên kính, dolly zoom (38–44s) ----------
// Bố cục: mép sàn–tường chạy chéo từ góc dưới trái lên chân gương; gương đặt cao, lùi xa bên phải.
// Nam đứng quay lưng trước gương, quay lại rồi đi thẳng về phía máy theo đường sàn (to dần).
// Trong kính là thế giới gương 3D (MirrorRealm). Cánh tay vươn ra là tay rig của chính cái bóng:
// vẽ bóng 2 lần cùng phép đặt — bản trong kính, và bản ngoài kính (vẽ sau Nam) chỉ lộ phần vượt mép trái kính.
const MIR_AT = { x: 1270, y: 760, s: 0.7, r: -3 }; // chân gương trên đường sàn
const MIR = `translate(${MIR_AT.x} ${MIR_AT.y}) scale(${MIR_AT.s}) rotate(${MIR_AT.r})`;
const FLOOR = 'M-300 1300L1100 772H2400V1500H-300Z'; // sàn phía trước, mép chéo về chân gương
const REACH_ARM = (k: number): JointPose => ({ ...STAND_POSE, tilt: 6 * k, armR: { a: 80 * k, b: 8 * k }, wristR: 32 * k, handR: k > 0.2 ? 'open' : 'rest', frontR: true });
const Shot4: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 180;
  const push = 1 + 0.22 * t; // dolly-in
  const realmZoom = 1 + 0.5 * t; // zoom-out phía trong kính: thế giới gương lùi ra xa
  const lift = seg(f, 24, 56), grin = f > 56;
  const ripple = seg(f, 50, 90);
  const reach = seg(f, 72, 104) * (1 - seg(f, 128, 146));
  const turn = seg(f, 14, 28);
  // Nam đi dọc đường sàn về phía máy: chậm lúc tay đặt lên vai, nhanh dần sau khi tay rút
  const walk = interpolate(f, [28, 112, 178], [0, 0.16, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const feet = { x: 1060 + (560 - 1060) * walk, y: 792 + (1040 - 792) * walk };
  const ns = 0.74 + 0.48 * walk;
  const walkP = f > 28 ? sampleWalk((f - 28) / 18) : STAND_POSE;
  const shake = heartbeat(f, 40, 18) * 6 + (reach > 0.9 ? Math.sin(f * 3) * 3 : 0);
  const reflPose: JointPose = { ...REACH_ARM(reach), neck: 16 * (1 - lift), view: 'three', facing: -1 };
  const rx = MW * 0.3, ryIn = 250, rs = 1;
  const vw = 1920 * realmZoom, vh = 1080 * realmZoom;
  const realm = (
    <svg x={-60} y={-60} width={MW + 120} height={MH + 120} viewBox={`${1160 - vw * 0.32} ${880 - vh * 0.9} ${vw} ${vh}`} preserveAspectRatio="xMidYMid slice">
      <MirrorRealm ripple={f / 40} floating={false} />
    </svg>
  );
  const shadowOut = (
    <g transform={`translate(${-MW / 2} ${-MH})`}>
      <clipPath id="ngoai-kinh"><rect x={-2000} y={-500} width={2026} height={MH + 1000} /></clipPath>
      {reach > 0.05 && <g clipPath="url(#ngoai-kinh)"><NguoiKia {...LOOK} x={rx} y={ryIn} scale={rs} mood="stare_grin" blink={false} pose={reflPose} /></g>}
    </g>
  );
  return (
    <AbsoluteFill style={{ background: '#060d0c' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${shake}px, ${shake * 0.4}px) rotate(-5deg) scale(${push})`, transformOrigin: '1000px 700px' }}>
        <svg width={1920} height={1080}>
          <rect x={-600} y={-600} width={3100} height={2300} fill="#0c1615" />
          <path d={FLOOR} fill="#142220" />
          <path d="M-300 1300L1100 772H2400" fill="none" stroke="#1d302d" strokeWidth={4} />
          <g transform={MIR}>
            <Mirror w={MW} h={MH} progress={ripple} phase={f / 6}>
              <rect x={-60} y={-60} width={MW + 120} height={MH + 120} fill="#03100f" />
              {realm}
              <NguoiKia {...LOOK} x={rx} y={ryIn} scale={rs} mood={grin ? 'stare_grin' : 'calm'} face={grin ? undefined : 'cuoi-che-giau-01'} blink={false} pose={reflPose} />
            </Mirror>
          </g>
          {/* Nam: quay lưng nhìn gương → quay lại → đi thẳng về phía máy, không hay biết */}
          <StudentTwinBody {...LOOK} x={feet.x} y={feet.y - 589 * ns} scale={ns} mood="sleepy" face={reach > 0.6 ? 'nghi-ngo-01' : 'buon-02'} blink={f % 70 < 3} pose={{ ...walkP, view: turn < 0.5 ? 'back' : 'three', facing: -1 }} />
          {/* tay cái bóng thò ra khỏi kính, vẽ sau Nam: bàn tay úp lên vai */}
          <g transform={MIR}>{shadowOut}</g>
        </svg>
        <div style={{ position: 'absolute', left: MIR_AT.x - 190, top: MIR_AT.y - 640, width: 380, height: 660, borderRadius: 180, background: 'radial-gradient(ellipse, rgba(80,255,210,.3), rgba(0,0,0,0) 70%)', opacity: ripple, mixBlendMode: 'screen' }} />
      </div>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 62% at 52% 52%, rgba(0,0,0,0) 40%, rgba(0,0,0,.7) 100%)' }} />
      <Streak t={seg(f, 56, 100)} color="#5affd2" y={500} />
    </AbsoluteFill>
  );
};

// ---------- SHOT 5: kính đông cứng, cắt đen, vết nứt và tựa phim (44–48s) ----------
const CRACK = 'M180 560L420 520L560 588L760 500L930 556L1080 470L1240 548L1420 486L1600 560L1760 512';
const Shot5: React.FC<{ f: number }> = ({ f }) => {
  if (f < 30) {
    const vw = 1920 * 0.7, vh = 1080 * 0.7;
    return (
      <AbsoluteFill style={{ background: '#0b1514' }}>
        <svg width={1920} height={1080}>
          <g transform={`translate(960 1420) scale(${1.45 + 0.004 * f})`}>
            <Mirror w={MW} h={MH}>
              <svg x={-60} y={-60} width={MW + 120} height={MH + 120} viewBox={`${1160 - vw * 0.5} ${880 - vh * 0.8} ${vw} ${vh}`} preserveAspectRatio="xMidYMid slice"><MirrorRealm floating={false} /></svg>
              <NguoiKia {...LOOK} x={MW * 0.5} y={MH * 0.1} scale={0.95} mood="stare_grin" blink={false} pose={{ ...STAND_POSE, neck: -5, view: 'front' }} />
            </Mirror>
          </g>
        </svg>
      </AbsoluteFill>
    );
  }
  const k = f - 30;
  const crack = seg(k, 0, 8), glow = seg(k, 6, 20), title = seg(k, 14, 30), tag = seg(k, 34, 50);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <path d={CRACK} fill="none" stroke="#7ff6ef" strokeWidth={4} strokeDasharray={2200} strokeDashoffset={2200 * (1 - crack)} style={{ filter: 'drop-shadow(0 0 12px #4fe6e0)' }} />
        <path d="M760 500L790 430M1080 470L1060 400M1240 548L1270 610M560 588L540 640" fill="none" stroke="#7ff6ef" strokeWidth={2} opacity={crack} />
      </svg>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 30% at 50% 50%, rgba(60,230,220,.25), rgba(0,0,0,0) 70%)', opacity: glow }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontFamily: FONT.title, color: '#e8fbf8', opacity: title }}>
        <div style={{ fontSize: 74, letterSpacing: 26, fontWeight: 700 }}>THE CRACK IN REALITY</div>
        <div style={{ fontSize: 40, letterSpacing: 8, marginTop: 160, color: '#9fe6df' }}>HỒ SƠ 02: NGƯỜI TRONG GƯƠNG</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', fontFamily: FONT.title, fontSize: 28, fontStyle: 'italic', color: '#c9cfd2', opacity: tag * 0.85 }}>Có những chiếc bóng... không bao giờ nên để bước ra ngoài.</div>
    </AbsoluteFill>
  );
};

export const HoSo02Opening: React.FC = () => {
  const g = useCurrentFrame();
  const at = (i: number) => g - S[i];
  let shot: React.ReactNode;
  if (g < S[1]) shot = <Shot0 f={at(0)} />;
  else if (g < S[2]) shot = <Shot1 f={at(1)} g={g} />;
  else if (g < S[3]) shot = <Shot2 f={at(2)} g={g} />;
  else if (g < S[4]) shot = <Shot3 f={at(3)} />;
  else if (g < S[5]) shot = <Shot4 f={at(4)} />;
  else shot = <Shot5 f={at(5)} />;
  const vo = g - S[1];
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {shot}
      {g < S[5] + 30 && <FilmLook f={g} total={S[5] + 30} />}
      <Letterbox />
      <Caption f={vo} from={150} to={300} who="LỜI DẪN">Đây là Nam. Sinh viên năm hai, đang “tạm trú” ở một phòng trọ nhỏ cùng Tùng — thằng bạn thân nghiêm túc đến phát mệt.</Caption>
      <Caption f={g} from={S[2] + 40} to={S[2] + 96} who="NAM">Chờ nốt combat này!</Caption>
      <Caption f={g} from={S[2] + 128} to={S[2] + 196} who="NAM">Tí nữa tao rửa!</Caption>
      <Caption f={g} from={S[2] + 262} to={S[2] + 326} who="NAM">Uống đi cho đỡ mệt.</Caption>
      <Caption f={g} from={S[2] + 2} to={S[2] + 38} who="LỜI DẪN">Nam không phải người xấu. Cậu chỉ mắc một căn bệnh của tuổi trẻ: trì hoãn.</Caption>
      <Caption f={g} from={S[2] + 200} to={S[2] + 258} who="LỜI DẪN">Nhưng ở cùng một thằng lười như Nam… thi thoảng cũng thấy dễ chịu.</Caption>
      <Caption f={g} from={S[3] + 40} to={S[3] + 200} who="NAM · ĐỘC THOẠI">Làm người lớn mệt mỏi vãi chưởng… Deadline dí, học lại, áp lực gia đình…</Caption>
      <Caption f={g} from={S[3] + 200} to={S[3] + 350} who="NAM · ĐỘC THOẠI">Ước gì có ai đó gánh hết phiền toái, sống hộ mình cái cuộc đời này…</Caption>
      <Caption f={g} from={S[4] + 70} to={S[4] + 178} who="NGƯỜI TRONG GƯƠNG · THÌ THẦM" tone="cold">Mày thấy mệt mỏi rồi đúng không?… Cuộc đời ngoài kia… để tao sống thay cho.</Caption>
      <div style={{ position: 'absolute', right: 26, top: BAR + 14, fontFamily: FONT.title, fontSize: 16, letterSpacing: 2, color: 'rgba(255,255,255,.45)' }}>OPENING · BẢN DỰNG THỬ · CÂM</div>
    </AbsoluteFill>
  );
};
