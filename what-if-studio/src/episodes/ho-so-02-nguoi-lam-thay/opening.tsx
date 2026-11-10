import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT } from '../../engine/fonts';
import { JointPose, mixPose, NguoiKia, PALETTE, sampleWalk, STAND_POSE, StudentTwinBody, TungSoccer, TWIN_POSES } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { placeOn, RoomScene } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';
import { Mirror } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/dao-cu';
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
const Cloth: React.FC<{ w: number; h: number; sway: number }> = ({ w, h, sway }) => {
  const x0 = -w / 2 - 14, x1 = w / 2 + 14, top = -h - 34, bot = -h * 0.5;
  const edge = `M${x0} ${bot + 10}Q${x0 + w * 0.2} ${bot + 34 + sway} ${x0 + w * 0.38} ${bot + 6}Q${x0 + w * 0.55} ${bot + 40 - sway} ${x0 + w * 0.72} ${bot + 14}Q${x0 + w * 0.88} ${bot + 30} ${x1} ${bot + 4}`;
  return (
    <g data-layer="vai-phu">
      <path d={`M${x0} ${top + 30}Q0 ${top - 40} ${x1} ${top + 30}V${bot + 4}L${x1} ${bot + 4}Q${x0 + w * 0.88} ${bot + 30} ${x0 + w * 0.72} ${bot + 14}Q${x0 + w * 0.55} ${bot + 40 - sway} ${x0 + w * 0.38} ${bot + 6}Q${x0 + w * 0.2} ${bot + 34 + sway} ${x0} ${bot + 10}Z`} fill="#7d6f73" />
      {/* nếp vải: vài mảng tối tự vẽ */}
      <path d={`M${x0 + w * 0.3} ${top + 10}Q${x0 + w * 0.26} ${bot - 80} ${x0 + w * 0.38} ${bot + 6}L${x0 + w * 0.45} ${bot + 8}Q${x0 + w * 0.36} ${bot - 90} ${x0 + w * 0.4} ${top + 6}Z`} fill="#5f5357" opacity={0.7} />
      <path d={`M${x0 + w * 0.7} ${top + 14}Q${x0 + w * 0.76} ${bot - 60} ${x0 + w * 0.72} ${bot + 14}L${x0 + w * 0.8} ${bot + 18}Q${x0 + w * 0.82} ${bot - 70} ${x0 + w * 0.76} ${top + 12}Z`} fill="#5f5357" opacity={0.6} />
      {Array.from({ length: 22 }, (_, i) => {
        const cx = x0 + 30 + ((i * 97) % (w - 20)), cy = top + 60 + ((i * 53) % (h * 0.42));
        return <g key={i} transform={`translate(${cx} ${cy})`} opacity={0.5}>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-7} rx={4} ry={7} fill="#a8949a" transform={`rotate(${a})`} />)}<circle r={3} fill="#c4b38c" /></g>;
      })}
      <path d={edge} fill="none" stroke="#5a4e52" strokeWidth={3} opacity={0.6} />
    </g>
  );
};

// ---------- SHOT 0: tấm vải phủ gương, giọt nước lăn ngược (0–5s) ----------
const MW = 420, MH = 900;
const Shot0: React.FC<{ f: number }> = ({ f }) => {
  const pan = interpolate(f, [0, 150], [150, -110]);
  const z = interpolate(f, [0, 150], [1.55, 1.8]);
  // giọt nước: trôi xuống → khựng → lăn NGƯỢC lên ~24px → rẽ nhánh chảy xuống
  const down = seg(f, 8, 70), up = seg(f, 86, 104), fall = seg(f, 116, 148);
  const dy = -330 + 70 * down - 26 * up + 120 * fall;
  const dx = 70 + 10 * fall;
  const trailTop = -330;
  return (
    <AbsoluteFill style={{ background: '#0e1517' }}>
      <svg width={1920} height={1080}>
        <g transform={`translate(${960 + pan} 540) rotate(-5) scale(${z}) translate(0 ${MH * 0.42})`}>
          <rect x={-1400} y={-1600} width={2800} height={2400} fill="#151d1f" />
          <Mirror w={MW} h={MH}>
            <rect width={MW} height={MH} fill="#1d2a2b" opacity={0.92} />
            <path d={`M0 ${MH * 0.62}L${MW} ${MH * 0.5}V${MH * 0.58}L0 ${MH * 0.72}Z`} fill="#7fb7c4" opacity={0.18} />
          </Mirror>
          <Cloth w={MW} h={MH} sway={Math.sin(f / 18) * 3} />
          {/* vệt nước đã đi qua */}
          <path d={`M${70} ${trailTop}L${70} ${Math.max(dy, -330 + 70 * down)}`} stroke="#cfe3de" strokeWidth={5} strokeLinecap="round" opacity={0.22} />
          {fall > 0 && <path d={`M70 ${-330 + 70 - 26}Q${72 + 8 * fall} ${dy - 40} ${dx} ${dy}`} stroke="#cfe3de" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.25} />}
          <g transform={`translate(${dx} ${dy})`}>
            <ellipse rx={11} ry={14} fill="#d9ece8" opacity={0.8} />
            <ellipse cx={-2.5} cy={-3.5} rx={2.4} ry={3} fill="#ffffff" opacity={0.85} />
          </g>
          {/* chữ khắc trên viền gỗ dưới */}
          <g transform={`translate(${-MW / 2 + 6} ${-MH * 0.5 + 64}) rotate(-3)`}><rect width={170} height={32} rx={4} fill="#8d6c4c" /><text x={85} y={22} textAnchor="middle" fontFamily={FONT.hand} fontSize={18} fill="#2e2218" opacity={0.85}>Đừng mở vải sau 0h</text></g>
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
const PhoneAlarm: React.FC<{ f: number }> = ({ f }) => {
  const shake = Math.sin(f * 2.1) * 3;
  return (
    <div style={{ position: 'absolute', left: 230, top: BAR + 70, width: 250, height: 420, borderRadius: 34, background: '#2a3436', padding: 10, transform: `rotate(${-4 + shake * 0.3}deg) translateX(${shake}px)`, boxShadow: '0 0 30px rgba(120,190,255,.35)' }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 26, background: '#1e2a33', border: '3px solid #d0533f', fontFamily: FONT.title, color: '#eef3f6', textAlign: 'center' }}>
        <div style={{ fontSize: 76, marginTop: 70 }}>07:00</div>
        <div style={{ fontSize: 22, marginTop: 10, letterSpacing: 1 }}>BÁO THỨC: ĐI HỌC</div>
        <div style={{ fontSize: 26, marginTop: 8, color: '#ff8a74' }}>(LẦN 5)</div>
        <div style={{ margin: '70px 30px 0', borderRadius: 30, background: '#d0533f', padding: '12px 0', fontSize: 22 }}>Dừng · Báo lại</div>
      </div>
    </div>
  );
};

// Insert gương: tay thật (tiền cảnh, nhoè) rút về trước, tay trong gương rút trễ 8 frame và khựng lại.
const MirrorLag: React.FC<{ f: number }> = ({ f }) => {
  const real = seg(f, 6, 26) * (1 - seg(f, 46, 60));
  const ghost = seg(f, 14, 34) * (1 - seg(f, 54 + 8, 74 + 8)); // trễ 8 frame (≈ 5 frame @24fps)
  const hang = f > 62 && f < 70 ? 1 : 0;
  const arm = (t: number) => `M${40} ${MH * 0.86}Q${120 + 60 * t} ${MH * 0.8 - 90 * t} ${150 + 150 * t} ${MH * 0.76 - 140 * t}`;
  return (
    <AbsoluteFill style={{ background: '#121a1b' }}>
      <svg width={1920} height={1080}>
        <g transform={`translate(960 1000) scale(${0.9 + 0.03 * seg(f, 0, 90)})`}>
          <rect x={-1200} y={-1200} width={2400} height={1300} fill="#1a2224" />
          <Mirror w={MW} h={MH}>
            <rect width={MW} height={MH} fill="#243233" />
            {/* nệm và chăn phản chiếu (đảo bên) */}
            <path d={`M${MW} ${MH * 0.78}H${MW * 0.1}Q${MW * 0.02} ${MH * 0.8} ${MW * 0.06} ${MH * 0.88}H${MW}Z`} fill="#4a5753" />
            <path d={`M${MW} ${MH * 0.74}Q${MW * 0.5} ${MH * 0.7} ${MW * 0.2} ${MH * 0.8}H${MW}Z`} fill="#5d6e62" />
            <path d={arm(Math.max(ghost, hang))} stroke={PALETTE.skin} strokeWidth={22} strokeLinecap="round" fill="none" opacity={ghost + hang > 0 ? 0.9 : 0} />
          </Mirror>
          <Cloth w={MW} h={MH} sway={1} />
        </g>
      </svg>
      {/* tay thật ở tiền cảnh, ngoài nét */}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, filter: 'blur(9px)' }}>
        <path d={`M-40 ${1000}Q${160 + 220 * real} ${900 - 120 * real} ${260 + 360 * real} ${820 - 200 * real}`} stroke="#c9946c" strokeWidth={78} strokeLinecap="round" fill="none" opacity={real > 0.02 ? 0.95 : 0} />
      </svg>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 50% 60% at 52% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,.6) 100%)' }} />
    </AbsoluteFill>
  );
};

const Shot1: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const move = wideMove(180);
  const head = placeOn('wide', BED_HEAD, 33, move);
  const close: Lens = { cx: head.x - 40, cy: head.y + 40, z: 2.7 };
  const mid: Lens = { cx: head.x - 260, cy: head.y + 120, z: 1.6 };
  if (f >= 44 && f < 134) return <MirrorLag f={f - 44} />;
  const a = f < 44;
  // a: chuông reo, tay thò ra với máy. c: đã trùm chăn ngủ tiếp, máy lùi dần ra trung cảnh (dolly-out).
  const reach = a ? seg(f, 20, 40) : 0;
  const cover = a ? 0 : 0.55 * seg(f, 134, 150); // rụt vào chăn nhưng còn lộ tóc/mắt để lời dẫn giới thiệu Nam
  const lens = a ? close : lerpLens(close, mid, seg(f, 150, 300));
  return (
    <AbsoluteFill>
      <Camera lens={lens} f={g} hand={0.4}>
        <RoomScene rays={RAYS} falloff={0.9} view="wide" door="ajar" chair="bed" phone="hidden" mirror move={move} sleeper={Sleeper({ cover, breath: !a && f > 150 ? Math.sin(f / 15) * 5 : 0, reach, carry: 0, alarm: a, f, phone: true })} />
      </Camera>
      {a && <PhoneAlarm f={f} />}
      <Streak t={a ? seg(f, 4, 40) : 0} color="#7fb4ff" y={430} />
    </AbsoluteFill>
  );
};

// ---------- SHOT 2: ba lát cắt trì hoãn (15–26s) ----------
const DESK: [number, number] = [396, 112]; // SEATS.desk
const GAME: JointPose = { ...TWIN_POSES.sit, tilt: 8, neck: 6, armR: { a: -60, b: 120, rot: -1 }, armL: { a: -20, b: 120, rot: 1 }, wristR: -40, handR: 'hold', handL: 'hold', frontR: true, frontL: true, prop: 'phoneLandscape' };
const POINT: JointPose = { ...STAND_POSE, tilt: 6, neck: 4, armL: { a: 70, b: 10, rot: 1 }, handL: 'open', frontL: true };

const Slice2A: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const move = { push: 10 * seg(f, 0, 100), truck: 0 };
  const nam = { at: DESK, render: (p: { x: number; y: number; scale: number }) => <StudentTwinBody {...LOOK} {...p} mood={f > 40 ? 'annoyed' : 'calm'} pose={{ ...GAME, view: 'three', facing: -1 }} /> };
  const tung = { at: [300, 14] as [number, number], render: (p: { x: number; y: number; scale: number }) => <TungSoccer {...p} mood="annoyed" pose={{ ...POINT, view: 'three', facing: 1 }} /> };
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
  const nam = { at: [x, 66] as [number, number], render: (p: { x: number; y: number; scale: number }) => <StudentTwinBody {...LOOK} {...p} mood="annoyed" talk={wave > 0.5 && f % 8 < 4 ? { shape: 'a', open: 0.6 } : undefined} pose={{ ...pose, view: 'three', facing: -1 }} /> };
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

const RUB_CALF: JointPose = { ...TWIN_POSES.sitLow, tilt: 24, neck: 8, armR: { a: 40, b: 30 }, armL: { a: 30, b: 34, rot: -1 }, handR: 'open', handL: 'open', frontR: true };
const OFFER_CUP: JointPose = { ...TWIN_POSES.sitLow, tilt: 6, neck: 2, armL: { a: 60, b: 30, rot: 1 }, handL: 'hold', frontL: true };
const Slice2C: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const rub = Math.sin(f / 4) * 6;
  const push = seg(f, 50, 80);
  const tung = { at: [276, 240] as [number, number], render: (p: { x: number; y: number; scale: number }) => <TungSoccer {...p} mood="normal" blink={f % 70 < 3} pose={{ ...RUB_CALF, tilt: RUB_CALF.tilt + rub * 0.3, view: 'three', facing: -1 }} /> };
  const nam = { at: [326, 252] as [number, number], render: (p: { x: number; y: number; scale: number }) => (
    <g>
      <StudentTwinBody {...LOOK} {...p} shirt={PALETTE.nam.sleepShirt} mood="calm" pose={{ ...mixPose(TWIN_POSES.sitLow, OFFER_CUP, push), view: 'three', facing: 1 }} />
      {/* cốc nước: đẩy dần sang phía Tùng */}
      <g transform={`translate(${p.x + (60 + 120 * push) * p.scale} ${p.y + 360 * p.scale}) scale(${p.scale})`}>
        <path d="M-22 -40H22L17 20Q0 28-17 20Z" fill="#cfe6e8" opacity={0.85} />
        <path d="M-19 -18H19L16 18Q0 24-16 18Z" fill="#9fd0d8" opacity={0.7} />
      </g>
    </g>
  ) };
  return (
    <Camera lens={{ cx: 820, cy: 720, z: 1.35 + 0.05 * seg(f, 0, 120) }} f={g} hand={0.5}>
      <RoomScene night view="bed" chair="bed" door="closed" actors={[nam, tung]} />
    </Camera>
  );
};

const Shot2: React.FC<{ f: number; g: number }> = ({ f, g }) => (f < 100 ? <Slice2A f={f} g={g} /> : f < 210 ? <Slice2B f={f - 100} g={g} /> : <Slice2C f={f - 210} g={g} />);

// ---------- SHOT 3: độc thoại, phản chiếu đảo bên (26–38s) ----------
const SCRATCH: JointPose = { ...STAND_POSE, neck: 4, armR: { a: -45, b: 138 }, wristR: -50, handR: 'fist', frontR: true };
const Shot3: React.FC<{ f: number }> = ({ f }) => {
  const z = interpolate(f, [0, 360], [1, 1.14]);
  const sc = seg(f, 150, 175) * (1 - seg(f, 250, 270)); // gãi đuôi mắt
  const stare = seg(f, 280, 296); // cái bóng quay ra nhìn khán giả
  const pose = mixPose(STAND_POSE, SCRATCH, sc);
  const reflPose = mixPose(STAND_POSE, SCRATCH, seg(f, 154, 179) * (1 - seg(f, 250, 270)));
  return (
    <AbsoluteFill style={{ background: '#0b1211' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '900px 520px' }}>
        <svg width={1920} height={1080}>
          {/* gương bên phải, cái bóng mặc áo xanh như Nam nhưng nốt ruồi ở bên kia */}
          <g transform="translate(1390 1500) scale(1.6)">
            <Mirror w={MW} h={MH}>
              <rect width={MW} height={MH} fill="#16211f" />
              <NguoiKia {...LOOK} x={MW * 0.5} y={MH * 0.12} scale={0.95} mood={stare > 0.5 ? 'calm' : 'hesitant'} blink={false} pose={{ ...reflPose, view: stare > 0.5 ? 'front' : 'three', facing: -1 }} />
              <rect width={MW} height={MH} fill="#3cc6c0" opacity={0.06} />
            </Mirror>
          </g>
          {/* Nam: trung cận, nhìn vào gương */}
          <StudentTwinBody {...LOOK} x={760} y={150} scale={1.55} mood="sleepy" blink={f % 90 < 3} talk={f > 60 && f < 340 && f % 10 < 5 ? { shape: 'closed', open: 0.2 } : undefined} pose={{ ...pose, view: 'three', facing: 1 }} />
        </svg>
        {/* laptop tiền cảnh trái, hắt sáng xanh lạnh lên nửa mặt */}
        <div style={{ position: 'absolute', left: 60, bottom: BAR + 10, width: 460, height: 260, transform: 'perspective(800px) rotateY(28deg)', filter: 'blur(2px)', boxShadow: '0 0 90px rgba(110,220,230,.45)' }}>
          <svg width={460} height={260} viewBox="0 0 1920 1080"><LaptopScreen /></svg>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', fontFamily: FONT.title, fontSize: 30, color: '#ff4b3a', textShadow: '0 0 14px #ff5a3a' }}>Hạn chót: 23:59 — THIẾU BÀI TẬP</div>
        </div>
      </div>
      {/* Chiaroscuro: sáng lạnh từ trái, nửa phải chìm tối */}
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(70,170,180,.18) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,.35) 60%, rgba(0,0,0,.15) 100%)' }} />
    </AbsoluteFill>
  );
};

// ---------- SHOT 4: bàn tay xuyên kính, dolly zoom (38–44s) ----------
const Shot4: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 180;
  const fg = 1 + 0.18 * t, bg = 1 - 0.22 * t; // dolly-in + zoom-out: tiền cảnh to ra, hậu cảnh co lại
  const walkX = interpolate(f, [10, 170], [0, -260], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const lift = seg(f, 30, 70), smirk = f > 70;
  const ripple = seg(f, 60, 100);
  const reach = seg(f, 90, 140) * (1 - seg(f, 168, 180));
  const handTip = { x: 1250 - 330 * reach, y: 560 + 10 * reach };
  return (
    <AbsoluteFill style={{ background: '#081211' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `rotate(-15deg) scale(${bg * 1.25})`, transformOrigin: '960px 540px' }}>
        <svg width={1920} height={1080}>
          <rect x={-400} y={-400} width={2700} height={1900} fill="#101b1a" />
          <path d="M-400 880H2300V1500H-400Z" fill="#162321" />
          <g transform="translate(1260 1150) scale(1.15)">
            <Mirror w={MW} h={MH} progress={ripple} phase={f / 6}>
              <rect width={MW} height={MH} fill="#0f2421" />
              <NguoiKia {...LOOK} x={MW * 0.5} y={MH * 0.1} scale={0.95} mood={smirk ? 'eerie_smirk' : 'calm'} pose={{ ...STAND_POSE, neck: 14 * (1 - lift), view: 'front' }} />
            </Mirror>
          </g>
        </svg>
        {/* ánh lân tinh xanh từ mặt gương */}
        <div style={{ position: 'absolute', left: 1020, top: 160, width: 480, height: 900, borderRadius: 200, background: 'radial-gradient(ellipse, rgba(80,255,210,.28), rgba(0,0,0,0) 70%)', opacity: ripple, mixBlendMode: 'screen' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `rotate(-15deg) scale(${fg})`, transformOrigin: '960px 540px' }}>
        <svg width={1920} height={1080}>
          {/* Nam quay lưng bước đi */}
          <StudentTwinBody {...LOOK} x={820 + walkX} y={120} scale={1.25} mood="sleepy" pose={{ ...sampleWalk(f / 18), view: 'back', facing: -1 }} />
          {/* bàn tay áo sơ mi xanh thò ra khỏi kính, chạm gáy Nam */}
          {reach > 0.01 && (
            <g>
              <path d={`M1260 600L${handTip.x + 40} ${handTip.y}`} stroke="#4f7fa8" strokeWidth={44} strokeLinecap="round" />
              <ellipse cx={handTip.x} cy={handTip.y} rx={30} ry={22} fill={PALETTE.skin} />
              {[0, 1, 2, 3].map((i) => <path key={i} d={`M${handTip.x - 20} ${handTip.y - 12 + i * 8}l-${26 - i * 3} -${2 + i}`} stroke={PALETTE.skin} strokeWidth={9} strokeLinecap="round" />)}
            </g>
          )}
        </svg>
      </div>
      <Streak t={seg(f, 70, 120)} color="#5affd2" y={560} />
    </AbsoluteFill>
  );
};

// ---------- SHOT 5: kính đông cứng, cắt đen, vết nứt và tựa phim (44–48s) ----------
const CRACK = 'M180 560L420 520L560 588L760 500L930 556L1080 470L1240 548L1420 486L1600 560L1760 512';
const Shot5: React.FC<{ f: number }> = ({ f }) => {
  if (f < 30) {
    return (
      <AbsoluteFill style={{ background: '#0b1514' }}>
        <svg width={1920} height={1080}>
          <g transform="translate(960 1420) scale(1.45)">
            <Mirror w={MW} h={MH}>
              <rect width={MW} height={MH} fill="#132321" />
              <NguoiKia {...LOOK} x={MW * 0.5} y={MH * 0.1} scale={0.95} mood="neutral_smile" blink={false} pose={{ ...STAND_POSE, view: 'front' }} />
            </Mirror>
          </g>
        </svg>
      </AbsoluteFill>
    );
  }
  const k = f - 30;
  const crack = seg(k, 0, 10), glow = seg(k, 6, 20), title = seg(k, 14, 30), tag = seg(k, 34, 50);
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
