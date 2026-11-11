import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FONT } from '../../engine/fonts';
import { JointPose, NguoiKia, PALETTE, STAND_POSE, StudentTwinBody, StudentTwinHead } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { EXTRA_POSES, FormalTwin } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/nhan-vat-va-tu-the';
import { DonationCorner, DormHallNight, inFront, LectureHall, MiniPitch, rigIn } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/boi-canh';
import { camera, CamSpec, makeScene, V3 } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/kit3d';
import { FilmLook, LOOK, seg } from './canh-01-demo';

/**
 * The Crack in Reality — Hồ sơ 02: Người trong gương — TRAILER 3D 30 giây, bản câm.
 * Máy quay bay thật trong các bối cảnh 3D của bộ bổ sung (kit3d): mỗi frame dựng lại cảnh theo một camera mới,
 * nên có thị sai, lùi–tiến, cẩu máy, quay vòng và dolly zoom thật. Nhân vật vẫn là rig 2D, luôn quay mặt về máy.
 * Năm cảnh: hành lang trọ đêm · góc đồ cho tặng · sân bóng · giảng đường · vực gương (cảnh 3D dựng riêng cho trailer).
 */
const B = [0, 165, 315, 450, 600, 780, 900];
export const TRAILER3D_TOTAL = B[6];
const BAR = 138;
const CYAN = '#5ff0e4', RED = '#ff4a3c', CREAM = '#f2ecdc';
const GREEN = PALETTE.nam.shirt, GREY = PALETTE.nam.sleepShirt;

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>{children}</svg>;
const Vignette: React.FC<{ k?: number }> = ({ k = 0.7 }) => <AbsoluteFill style={{ background: `radial-gradient(ellipse 62% 64% at 50% 52%, rgba(0,0,0,0) 40%, rgba(0,0,0,${k}) 100%)`, pointerEvents: 'none' }} />;
const Tint: React.FC<{ c: string; o: number; blend?: React.CSSProperties['mixBlendMode'] }> = ({ c, o, blend = 'multiply' }) => <AbsoluteFill style={{ background: c, opacity: o, mixBlendMode: blend, pointerEvents: 'none' }} />;
const Big: React.FC<{ t: number; size?: number; x?: number; y: number; align?: 'left' | 'center' | 'right'; color?: string; gap?: number; children: React.ReactNode }> = ({ t, size = 64, x = 0, y, align = 'center', color = CREAM, gap = 8, children }) => (
  <div style={{ position: 'absolute', left: align === 'left' ? x : 0, right: align === 'right' ? x : 0, top: y + 30 * (1 - t), textAlign: align, opacity: t, fontFamily: FONT.title, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: gap, color, textShadow: `${size / 40}px 0 rgba(255,60,48,.7), ${-size / 40}px 0 rgba(53,230,221,.7), 0 4px 20px rgba(0,0,0,.8)`, whiteSpace: 'nowrap' }}>{children}</div>
);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mix3 = (a: V3, b: V3, t: number): V3 => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
/** Rung nhẹ kiểu máy cầm tay, tính bằng cm trong không gian cảnh. */
const sway = (g: number, k: number): V3 => [k * (Math.sin(g / 23) + 0.5 * Math.sin(g / 9.7)), k * 0.6 * (Math.sin(g / 29 + 2) + 0.4 * Math.sin(g / 11.3)), 0];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// ---------- 1. Hành lang trọ đêm: máy đi dọc hành lang, đèn chập chờn, có người đứng cuối dãy (0–5,5s) ----------
const Dorm: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const t = seg(f, 0, 165), turn = seg(f, 0, 60);
  const cam: CamSpec = { pos: add([72, 160, -70 + 760 * t], sway(g, 2.2)), look: mix3([-40, 130, 140], [88, 138, 2300], turn), mm: 22 };
  const dark = f >= 118 && f < 128; // đèn tắt hẳn một nhịp
  const flicker = dark ? 0.04 : f % 47 < 3 ? 0.2 : f % 31 < 2 ? 0.55 : 1;
  const at: V3 = f < 128 ? [96, 0, 1560] : [92, 0, cam.pos[2] + 330]; // sau nhịp tối, người đó đã ở ngay trước máy
  const p = rigIn(cam, at);
  return (
    <AbsoluteFill style={{ background: '#05090a' }}>
      <Stage>
        <DormHallNight cam={cam} flicker={flicker}>
          {inFront(cam, at) && <NguoiKia {...LOOK} {...p} shirt={GREEN} mood={f >= 128 ? 'stare_grin' : 'calm'} blink={false} pose={{ ...STAND_POSE, neck: f >= 128 ? -4 : 6, view: 'front' }} />}
        </DormHallNight>
      </Stage>
      <Tint c="#000" o={dark ? 0.85 : 0.1 * (1 - flicker)} blend="normal" />
      <Vignette k={0.8} />
      <Big t={seg(f, 14, 26) * (1 - seg(f, 100, 112))} y={820} size={50}>ĐÊM ĐÓ, CÓ NGƯỜI VỀ PHÒNG TRƯỚC BẠN.</Big>
    </AbsoluteFill>
  );
};

// ---------- 2. Góc đồ cho tặng: cẩu máy từ trên cao hạ xuống trước chiếc gương (5,5–10,5s) ----------
const Donation: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const t = seg(f, 0, 150);
  const cam: CamSpec = { pos: add(mix3([-300, 258, -280], [120, 118, 40], t), sway(g, 1.5)), look: mix3([60, 30, 330], [196, 78, 380], t), mm: mix(19, 30, t) };
  const at: V3 = [150, 0, 262], p = rigIn(cam, at);
  return (
    <AbsoluteFill style={{ background: '#aeb8b6' }}>
      <Stage>
        <DonationCorner cam={cam}>
          <StudentTwinBody {...LOOK} {...p} shirt={GREY} mood="sleepy" blink={f % 70 < 3} pose={{ ...STAND_POSE, neck: 4, armR: { a: 40 * seg(f, 96, 130), b: 16 }, handR: 'open', view: 'back' }} />
        </DonationCorner>
      </Stage>
      <Tint c="#27404a" o={0.25 + 0.2 * t} />
      <Vignette k={0.55 + 0.25 * t} />
      <Big t={seg(f, 20, 32) * (1 - seg(f, 132, 146))} y={820} size={50}>MỘT CHIẾC GƯƠNG CŨ. AI CẦN THÌ LẤY.</Big>
    </AbsoluteFill>
  );
};

// ---------- 3. Sân bóng: máy quay vòng quanh kẻ thế thân đang ăn mừng (10,5–15s) ----------
const CHEER: JointPose = { ...STAND_POSE, tilt: -3, neck: -8, armR: { a: -150, b: 24 }, armL: { a: -146, b: 20, rot: -1 }, handR: 'fist', handL: 'fist', frontR: true, frontL: true };
const Pitch: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const t = seg(f, 0, 135), th = mix(-1.0, 0.75, t), R = mix(560, 400, t), C: V3 = [-120, 0, 900];
  const cam: CamSpec = { pos: add([C[0] + R * Math.sin(th), mix(120, 190, t), C[2] - R * Math.cos(th)], sway(g, 2)), look: [C[0], 105, C[2]], mm: 26 };
  const hop = Math.abs(Math.sin(f / 5.5)) * 16, at: V3 = [C[0], hop, C[2]], p = rigIn(cam, at);
  return (
    <AbsoluteFill style={{ background: '#a9d0d4' }}>
      <Stage>
        <MiniPitch cam={cam}>
          <NguoiKia {...LOOK} {...p} outfit="the-thao" mood="neutral_smile" face="vui-02" blink={false} pose={{ ...CHEER, tilt: -3 + 3 * Math.sin(f / 5.5), view: 'three', facing: 1 }} />
        </MiniPitch>
      </Stage>
      <Tint c="#ffc878" o={0.28} blend="soft-light" />
      <Vignette k={0.45} />
      <Big t={seg(f, 12, 22)} y={BAR + 60} size={110} x={130} align="left"><span style={{ color: CYAN }}>NÓ</span> SỐNG THAY BẠN.</Big>
      <Big t={seg(f, 62, 74)} y={BAR + 190} size={70} x={136} align="left" color={CYAN}>TỐT HƠN BẠN.</Big>
    </AbsoluteFill>
  );
};

// ---------- 4. Giảng đường: máy lùi ngược lối đi giữa các bậc trong khi siết tiêu cự (dolly zoom) (15–20s) ----------
const Lecture: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const t = seg(f, 0, 150);
  const cam: CamSpec = { pos: add([0, mix(196, 350, t), mix(1180, -60, t)], sway(g, 1.2)), look: [-70, 112, 1360], mm: mix(17, 44, t) };
  const at: V3 = [-70, 22, 1360], p = rigIn(cam, at);
  return (
    <AbsoluteFill style={{ background: '#dfe3df' }}>
      <Stage>
        <LectureHall failed cam={cam}>
          <FormalTwin identity="nam" mood="scared" pose={{ ...EXTRA_POSES['buc-giang'], tilt: 3 + Math.sin(f * 1.7) * 0.8 }} {...p} />
        </LectureHall>
      </Stage>
      <Tint c="#9fb9cc" o={0.3} />
      <Vignette k={0.5 + 0.3 * t} />
      <Big t={seg(f, 24, 36)} y={820} size={50}>ĐẾN LÚC BẠN MUỐN ĐÒI LẠI CHỖ CỦA MÌNH…</Big>
    </AbsoluteFill>
  );
};

// ---------- 5. Vực gương: mặt nước phát sáng, những khung gương trôi, Nam chìm dần; máy quay vòng và hạ thấp (20–26s) ----------
const MIRRORS: [number, number, number, number][] = [[-420, 330, 60, 24], [380, 420, 90, -30], [-180, 640, 130, 12], [520, 120, 40, -55], [-620, -40, 100, 60], [140, 820, 70, -8], [-360, 900, 160, 30], [700, 620, 120, -40], [-760, 520, 50, 48], [300, -260, 80, -70], [-240, -340, 120, 75]];
const Void: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const t = seg(f, 0, 180), th = mix(0.75, -0.28, t), R = mix(760, 500, t);
  const cam: CamSpec = { pos: add([R * Math.sin(th), mix(300, 120, t), -R * Math.cos(th)], sway(g, 1.5)), look: [0, mix(70, 50, t), 40], mm: 24 };
  const S = makeScene(camera(cam), { sun: [0.2, -0.9, 0.3], amb: 0.55, diff: 0.3, fog: { color: '#020a0c', dist: 1250, max: 0.96 } });
  // mặt nước và các vòng gợn lan ra từ chỗ Nam chìm
  S.quad([[-4000, 0, -4000], [4000, 0, -4000], [4000, 0, 4000], [-4000, 0, 4000]], '#0b3f44', { n: [0, 1, 0], layer: 0, edge: false, emit: true });
  for (let k = 0; k < 6; k++) {
    const ph = (k + f / 34) % 6 / 6, r = 40 + ph * 1000, N = 44;
    for (let i = 0; i < N; i++) { const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2; S.line([r * Math.cos(a0), 0.4, r * Math.sin(a0)], [r * Math.cos(a1), 0.4, r * Math.sin(a1)], '#8ff7ec', 2.4 * (1 - ph) + 0.6, { op: 0.75 * (1 - ph), layer: 0.5 }); }
  }
  for (let i = 0; i < 70; i++) { const x = ((i * 397) % 2400) - 1200, z = ((i * 211) % 2400) - 1000; S.line([x, 0.5, z], [x + 3, 0.5, z], '#c9fff6', 2.2, { op: 0.25 + ((i * 13) % 10) / 22, layer: 0.5 }); }
  // khung gương trôi lơ lửng, mỗi cái nghiêng một hướng và dập dềnh
  MIRRORS.forEach(([x, z, h, yaw], i) => {
    const y = h + 14 * Math.sin(f / 26 + i * 1.7), w = 30 + (i % 3) * 6, hh = 130 + (i % 4) * 14, pv: [number, number] = [x, z];
    S.box({ x: [x - w, x + w], y: [y, y + hh], z: [z - 3, z + 3], c: '#6d5038', yaw: yaw + f * 0.12 * (i % 2 ? 1 : -1), pivot: pv });
    S.box({ x: [x - w + 5, x + w - 5], y: [y + 5, y + hh - 5], z: [z - 3.6, z + 3.6], c: i % 3 ? '#8fd9d0' : '#c9f7f0', emit: true, edge: false, yaw: yaw + f * 0.12 * (i % 2 ? 1 : -1), pivot: pv });
    S.glow([x, 2, z], 44, '#5ff0e4', 0.07);
  });
  // gương lớn phía sau, kẻ thế thân đứng trên mặt nước nhìn xuống
  S.box({ x: [-70, 70], y: [20, 330], z: [236, 244], c: '#6d5038' });
  S.box({ x: [-62, 62], y: [28, 322], z: [234, 246], c: '#bff3ec', emit: true, edge: false });
  S.glow([0, 170, 230], 110, '#5ff0e4', 0.1);
  const pk = S.rigAt([0, 0, 190], 168);
  S.sprite([0, 80, 190], <NguoiKia {...LOOK} {...pk} shirt={GREEN} mood={f > 110 ? 'stare_grin' : 'calm'} blink={false} pose={{ ...STAND_POSE, neck: 10, view: 'front' }} />);
  // Nam chìm dần: cắt phần thân dưới mặt nước theo đường nước tại chỗ đứng
  const sink = mix(30, 150, t), pn = S.rigAt([0, -sink, 0], 168), water = S.cam.project([0, 0, -6])[1], reach = seg(f, 30, 90);
  S.glow([0, 2, 0], 70, '#8ff7ec', 0.18);
  S.sprite([0, 60, 0], (
    <g>
      <clipPath id="t3d-nuoc"><rect x={-3000} y={-3000} width={8000} height={3000 + water} /></clipPath>
      <g clipPath="url(#t3d-nuoc)"><StudentTwinBody {...LOOK} {...pn} shirt={GREY} mood="scared" face="so-hai-03" talk={f % 12 < 6 ? { shape: 'a', open: 0.8 } : undefined} pose={{ ...STAND_POSE, tilt: -4, neck: -10, armR: { a: -150 * reach, b: 20 }, armL: { a: -140 * reach, b: 24, rot: -1 }, handR: 'open', handL: 'open', frontR: true, frontL: true, view: 'front' }} /></g>
      <ellipse cx={pn.x} cy={water} rx={150 * pn.scale * 1.6} ry={16 * pn.scale * 1.6} fill="none" stroke="#d9fffa" strokeWidth={3} opacity={0.8} />
    </g>
  ));
  return (
    <AbsoluteFill style={{ background: '#01070a' }}>
      <Stage>{S.render('t3d-void', <rect width={1920} height={1080} fill="#01070a" />)}</Stage>
      <Tint c="#0a3a3c" o={0.25} blend="screen" />
      <Vignette k={0.7} />
      <Big t={seg(f, 40, 54) * (1 - seg(f, 150, 164))} y={BAR + 60} size={60} color="#d9fffa">…THÌ KHÔNG CÒN CHỖ CHO BẠN NỮA.</Big>
    </AbsoluteFill>
  );
};

// ---------- 6. Loé mặt người kia · tựa phim (26–30s) ----------
const CRACK = 'M180 470L420 430L560 498L760 410L930 466L1080 380L1240 458L1420 396L1600 470L1760 422';
const Title: React.FC<{ f: number }> = ({ f }) => {
  if (f < 4) return <AbsoluteFill style={{ background: '#d8fff8' }}><Stage><StudentTwinHead identity="nguoi-kia" mood="stare_grin" view="front" x={960} y={60} scale={6.4} /></Stage></AbsoluteFill>;
  const k = f - 16, crack = seg(k, 0, 8), title = seg(k, 6, 18), sub = seg(k, 22, 34), ask = seg(k, 44, 58);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Stage>
        <path d={CRACK} fill="none" stroke="#7ff6ef" strokeWidth={4} strokeDasharray={2200} strokeDashoffset={2200 * (1 - crack)} style={{ filter: 'drop-shadow(0 0 12px #4fe6e0)' }} />
        <path d="M760 410L790 340M1080 380L1060 310M1240 458L1270 520M560 498L540 550" fill="none" stroke="#7ff6ef" strokeWidth={2} opacity={crack} />
      </Stage>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 262, textAlign: 'center', fontFamily: FONT.title, color: '#e8fbf8' }}>
        <div style={{ fontSize: 72, letterSpacing: 24 + 6 * (1 - title), fontWeight: 700, opacity: title }}>THE CRACK IN REALITY</div>
        <div style={{ fontSize: 40, letterSpacing: 8, marginTop: 210, color: '#9fe6df', opacity: sub }}>HỒ SƠ 02 · NGƯỜI TRONG GƯƠNG</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center', fontFamily: FONT.title, fontWeight: 700, fontSize: 36, letterSpacing: 3, color: RED, opacity: ask, textShadow: '0 0 18px rgba(255,60,40,.55)' }}>NẾU NÓ SỐNG TỐT HƠN BẠN… BẠN CÒN CẦN TỒN TẠI KHÔNG?</div>
    </AbsoluteFill>
  );
};

/** Một frame của trailer 3D, không phụ thuộc hook nên chụp tĩnh được. */
export const Trailer3DFrame: React.FC<{ g: number }> = ({ g }) => {
  const i = Math.max(0, B.findIndex((b, n) => g >= b && g < B[n + 1])), f = g - B[i];
  const shots = [<Dorm f={f} g={g} />, <Donation f={f} g={g} />, <Pitch f={f} g={g} />, <Lecture f={f} g={g} />, <Void f={f} g={g} />, <Title f={f} />];
  const cut = Math.min(...B.slice(1, 5).map((b) => Math.abs(g - b + 0.5)));
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {shots[i]}
      {i < 5 && <FilmLook f={g} total={B[6] + 400} />}
      {cut < 3 && <AbsoluteFill style={{ background: '#dffffb', opacity: 0.55 * (1 - cut / 3), mixBlendMode: 'screen' }} />}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: BAR, background: '#000' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR, background: '#000' }} />
      </AbsoluteFill>
      <div style={{ position: 'absolute', right: 26, top: BAR + 14, fontFamily: FONT.title, fontSize: 16, letterSpacing: 2, color: 'rgba(255,255,255,.4)' }}>TRAILER 3D · BẢN DỰNG THỬ · CÂM</div>
    </AbsoluteFill>
  );
};
export const HoSo02Trailer3D: React.FC = () => <Trailer3DFrame g={useCurrentFrame()} />;
