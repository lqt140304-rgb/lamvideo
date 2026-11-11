import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT } from '../../engine/fonts';
import { JointPose, mixPose, NguoiKia, PALETTE, STAND_POSE, StudentTwinBody, StudentTwinHead, TWIN_POSES } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { placeOn, RoomScene } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';
import { EXTRA_POSES, FormalTwin, SupportingActor } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/nhan-vat-va-tu-the';
import { ComputerLab, corridorSpot, labSpot, MiniPitch, MirrorRealm, pitchSpot, UniversityCorridor } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/boi-canh';
import { Football } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/dao-cu';
import { Camera, FilmLook, LOOK, RAYS, seg } from './canh-01-demo';

/**
 * The Crack in Reality — Hồ sơ 02: Người trong gương — TEASER TỰ DO 28 giây, bản câm.
 * Không theo bảng phân cảnh: dựng theo nhịp chữ và hình (yêu cầu chủ repo 11/11/2026: "đẹp, hấp dẫn người xem").
 * Sáu nhịp: hai nửa gương · montage "NÓ…" · Nam nhạt dần · vệt quét đổi nốt ruồi · chìm trong gương · tựa phim.
 * Chữ trên hình là lời của teaser, chưa có giọng, nhạc, SFX.
 */
const B = [0, 120, 300, 450, 570, 720, 840];
export const FREESTYLE_TOTAL = B[6];
const BAR = 138;
const CYAN = '#5ff0e4', RED = '#ff4a3c', CREAM = '#f2ecdc';
const GREEN = PALETTE.nam.shirt, GREY = PALETTE.nam.sleepShirt;

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>{children}</svg>;
const Vignette: React.FC<{ k?: number }> = ({ k = 0.7 }) => <AbsoluteFill style={{ background: `radial-gradient(ellipse 62% 64% at 50% 52%, rgba(0,0,0,0) 40%, rgba(0,0,0,${k}) 100%)`, pointerEvents: 'none' }} />;
const Tint: React.FC<{ c: string; o: number; blend?: React.CSSProperties['mixBlendMode'] }> = ({ c, o, blend = 'multiply' }) => <AbsoluteFill style={{ background: c, opacity: o, mixBlendMode: blend, pointerEvents: 'none' }} />;
/** Chữ lớn lệch màu đỏ–lam, hiện bằng cách trượt lên. */
const Big: React.FC<{ t: number; size?: number; x?: number; y: number; align?: 'left' | 'center' | 'right'; color?: string; gap?: number; children: React.ReactNode }> = ({ t, size = 150, x = 0, y, align = 'center', color = CREAM, gap = 6, children }) => (
  <div style={{ position: 'absolute', left: align === 'left' ? x : 0, right: align === 'right' ? x : 0, top: y + 40 * (1 - t), textAlign: align, opacity: t, fontFamily: FONT.title, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: gap, color, textShadow: `${size / 40}px 0 rgba(255,60,48,.75), ${-size / 40}px 0 rgba(53,230,221,.75), 0 6px 24px rgba(0,0,0,.6)`, whiteSpace: 'nowrap' }}>{children}</div>
);
/** Nhiễu cắt cảnh: vài dải ngang lệch và lóe trong `len` frame quanh điểm cắt. */
const Glitch: React.FC<{ g: number }> = ({ g }) => {
  const d = Math.min(...B.slice(1, 6).map((b) => Math.abs(g - b + 0.5)));
  if (d > 3) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: 7 }, (_, i) => { const y = ((g * 131 + i * 197) % 780) + BAR, h = 8 + ((g * 17 + i * 29) % 46); return <div key={i} style={{ position: 'absolute', left: ((g * 53 + i * 311) % 500) - 100, width: 1500 + ((i * 173) % 600), top: y, height: h, background: i % 3 === 0 ? CYAN : i % 3 === 1 ? '#000' : RED, opacity: i % 3 === 1 ? 0.9 : 0.35, mixBlendMode: i % 3 === 1 ? 'normal' : 'screen' }} />; })}
      <AbsoluteFill style={{ background: '#dffffb', opacity: d < 1 ? 0.5 : 0.08, mixBlendMode: 'screen' }} />
    </AbsoluteFill>
  );
};

// ---------- 1. Hai nửa gương: cùng một người, một bên chớp mắt trễ rồi mỉm cười (0–4s) ----------
const Halves: React.FC<{ f: number }> = ({ f }) => {
  const line = seg(f, 0, 16), push = 1 + 0.07 * seg(f, 0, 120);
  const smile = f >= 88, tilt = 5 * seg(f, 88, 104);
  return (
    <AbsoluteFill style={{ background: '#0a0f10' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '960px 560px' }}>
        <AbsoluteFill style={{ background: 'linear-gradient(90deg, #3a2e26 0%, #241d1a 50%, #0c2b2d 50%, #134043 100%)' }} />
        <Stage>
          <defs><clipPath id="fs-trai"><rect width={960} height={1080} /></clipPath><clipPath id="fs-phai"><rect x={960} width={960} height={1080} /></clipPath></defs>
          <g clipPath="url(#fs-trai)"><StudentTwinBody {...LOOK} x={640} y={210} scale={1.75} shirt={GREY} mood="sleepy" face="buon-01" blink={f >= 48 && f < 52} pose={{ ...STAND_POSE, view: 'front' }} /></g>
          <g clipPath="url(#fs-phai)"><NguoiKia {...LOOK} x={1280} y={210} scale={1.75} shirt={GREEN} mood="calm" face={smile ? 'cuoi-che-giau-02' : undefined} blink={f >= 58 && f < 62} pose={{ ...STAND_POSE, tilt, neck: -tilt, view: 'front' }} /></g>
          <rect x={958} y={540 - 540 * line} width={4} height={1080 * line} fill={CYAN} />
          <rect x={940} y={540 - 540 * line} width={40} height={1080 * line} fill={CYAN} opacity={0.12 + 0.06 * Math.sin(f / 3)} />
        </Stage>
        <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(255,190,120,.10) 0%, rgba(0,0,0,0) 50%, rgba(60,230,220,.14) 100%)', mixBlendMode: 'screen' }} />
      </div>
      <Vignette k={0.75} />
      {!smile && <Big t={seg(f, 18, 30)} size={54} y={830} gap={10}>CÓ MỘT NGƯỜI GIỐNG HỆT BẠN.</Big>}
      {smile && <Big t={seg(f, 90, 100)} size={54} y={830} gap={10} color={CYAN}>CHỈ LÀ… LÀM TỐT HƠN.</Big>}
    </AbsoluteFill>
  );
};

// ---------- 2. Montage chữ: NÓ rửa bát · làm bài · thuyết trình · ghi bàn · được khen (4–10s) ----------
const CUTS = [0, 34, 66, 96, 124, 150, 180];
const WORDS = ['RỬA BÁT.', 'LÀM BÀI.', 'THUYẾT TRÌNH.', 'GHI BÀN.', 'ĐƯỢC KHEN.'];
const KICK: JointPose = { ...STAND_POSE, tilt: -9, neck: 2, legL: { a: 58, b: 6 }, armR: { a: 46, b: 20 }, armL: { a: -34, b: 24, rot: -1 } };
const WIND: JointPose = { ...STAND_POSE, tilt: 8, legL: { a: -38, b: 64 }, armR: { a: -30, b: 20 }, armL: { a: 30, b: 20, rot: -1 } };
const Montage: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const i = Math.max(0, CUTS.findIndex((c, n) => f >= c && f < CUTS[n + 1])), k = f - CUTS[i], len = CUTS[i + 1] - CUTS[i];
  if (i === 5) {
    const text = 'NÓ SỐNG CUỘC ĐỜI CỦA BẠN.', n = Math.floor(seg(k, 0, 18) * text.length);
    return <AbsoluteFill style={{ background: '#000' }}><Big t={1} size={92} y={490} gap={8}><span style={{ color: CYAN }}>{text.slice(0, Math.min(2, n))}</span>{text.slice(2, n)}</Big></AbsoluteFill>;
  }
  const punch = 1.06 - 0.06 * seg(k, 0, 8) + 0.04 * seg(k, 0, len);
  let body: React.ReactNode;
  if (i === 0) {
    const at: [number, number] = [118, 70], p = placeOn('kitchen', at);
    const nk = { at, render: () => <NguoiKia {...LOOK} {...p} shirt={GREEN} mood="neutral_smile" blink={false} pose={{ ...TWIN_POSES.holdBowl, neck: -3, view: 'three', facing: 1 }} /> };
    body = <Camera lens={{ cx: p.x + 160, cy: p.y + 150 * p.scale, z: 1.15 * punch }} f={g} hand={0.6}><RoomScene sun={0.1} rays={RAYS} view="kitchen" kitchen="clean" actors={[nk]} /></Camera>;
  } else if (i === 1) {
    const at: [number, number] = [396, 112], p = placeOn('desk', at);
    const nk = { at, render: (q: { x: number; y: number; scale: number }) => <NguoiKia {...LOOK} {...q} shirt={GREEN} mood="calm" blink={false} pose={{ ...TWIN_POSES.type, view: 'three', facing: 1 }} /> };
    body = <Camera lens={{ cx: p.x - 120, cy: p.y + 170 * p.scale, z: 1.05 * punch }} f={g} hand={0.5}><RoomScene night view="desk" chair="desk" phone="hidden" kitchen="clean" actors={[nk]} /></Camera>;
  } else if (i === 2) {
    const p = labSpot();
    body = <Camera lens={{ cx: p.x + 140, cy: p.y + 190 * p.scale, z: 1.9 * punch }} f={g} hand={0.5}><Stage><ComputerLab><FormalTwin pose={EXTRA_POSES['thuyet-trinh']} mood="neutral_smile" {...p} /></ComputerLab></Stage></Camera>;
  } else if (i === 3) {
    const p = pitchSpot(), pose = k < 8 ? mixPose(STAND_POSE, WIND, seg(k, 0, 7)) : mixPose(WIND, KICK, seg(k, 8, 12));
    const fly = seg(k, 11, 28), bx = p.x + 70 * p.scale + (990 - p.x - 70 * p.scale) * fly, by = p.y + 540 * p.scale + (430 - p.y - 540 * p.scale) * fly - 160 * Math.sin(Math.PI * fly);
    body = (
      <Camera lens={{ cx: p.x + 90 + (bx - p.x) * 0.5 * fly, cy: p.y + 290 * p.scale - 60 * fly, z: (2.2 - 0.5 * fly) * punch }} f={g} hand={1} shake={k >= 11 && k < 16 ? Math.sin(k * 3) * 8 : 0}>
        <Stage>
          <MiniPitch><NguoiKia {...LOOK} {...p} outfit="the-thao" mood="neutral_smile" blink={false} pose={{ ...pose, view: 'three', facing: 1 }} /></MiniPitch>
          <g transform={`translate(${bx} ${by}) scale(${p.scale * (0.42 - 0.22 * fly)}) rotate(${k * 30})`}><Football /></g>
        </Stage>
      </Camera>
    );
  } else {
    const p = corridorSpot(), s = p.scale;
    body = (
      <Camera lens={{ cx: p.x + 30, cy: p.y + 230 * s, z: 1.5 * punch }} f={g} hand={0.5}>
        <Stage>
          <UniversityCorridor>
            <SupportingActor role="sinh-vien-nu" x={p.x - 190 * s} y={p.y + 14 * s} scale={s * 0.97} />
            <SupportingActor role="sinh-vien-nam" x={p.x + 200 * s} y={p.y + 6 * s} scale={s} />
            <FormalTwin mood="neutral_smile" pose={{ ...EXTRA_POSES['thuyet-trinh'], neck: -3 }} {...p} />
          </UniversityCorridor>
        </Stage>
      </Camera>
    );
  }
  return (
    <AbsoluteFill>
      {body}
      <Tint c="#ffc878" o={0.22} blend="soft-light" />
      <AbsoluteFill style={{ background: 'linear-gradient(0deg, rgba(0,0,0,.72) 12%, rgba(0,0,0,0) 55%)' }} />
      <Big t={seg(k, 0, 5)} size={i === 2 ? 150 : 180} x={130} y={640} align="left"><span style={{ color: CYAN }}>NÓ</span> {WORDS[i]}</Big>
      {k < 4 && <AbsoluteFill style={{ background: '#fff', opacity: 0.7 * (1 - k / 4), mixBlendMode: 'screen' }} />}
    </AbsoluteFill>
  );
};

// ---------- 3. Còn bạn: Nam thật gục trong phòng tối, máy lùi ra, người nhạt dần (10–15s) ----------
const Fading: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const at: [number, number] = [340, 384], p0 = placeOn('wide', at), p = { ...p0, y: p0.y + (21 * p0.scale * 590) / 168 };
  const fade = 1 - 0.6 * seg(f, 60, 150), back = seg(f, 0, 150);
  const nam = { at, render: () => <g opacity={fade}><StudentTwinBody {...LOOK} {...p} shirt={GREY} mood="scared" face={f > 70 ? 'kiet-suc-03' : 'kiet-suc-02'} pose={{ ...EXTRA_POSES['suy-sup'], view: 'three', facing: -1 }} /></g> };
  return (
    <AbsoluteFill style={{ filter: 'saturate(.45)' }}>
      <Camera lens={{ cx: p.x - 20 - 180 * back, cy: p.y + 250 * p.scale - 60 * back, z: 2.5 - 1.35 * back }} f={g} hand={0.7}>
        <RoomScene night view="wide" chair="desk" door="closed" phone="hidden" kitchen="messy" actors={[nam]} />
      </Camera>
      <Tint c="#143530" o={0.55} />
      <Vignette k={0.8} />
      <Big t={seg(f, 8, 18)} size={170} x={150} y={300} align="left">CÒN BẠN?</Big>
      <Big t={seg(f, 74, 88)} size={56} x={156} y={500} align="left" gap={8} color="#9fb8b2">NẰM ĐÓ. VÀ NHẠT DẦN.</Big>
    </AbsoluteFill>
  );
};

// ---------- 4. Vệt quét: cùng gương mặt, nốt ruồi đổi bên (15–19s) ----------
const Scan: React.FC<{ f: number }> = ({ f }) => {
  const x = interpolate(f, [16, 62], [520, 1400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const done = f >= 62, grin = f >= 92, flick = grin && f % 5 < 2 ? 0.35 : 0;
  const head = (id: 'nam' | 'nguoi-kia') => <StudentTwinHead identity={id} mood={id === 'nam' ? 'calm' : grin ? 'stare_grin' : 'calm'} view="front" blink={false} x={960} y={130} scale={4.8} />;
  return (
    <AbsoluteFill style={{ background: '#0d1514' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + 0.06 * seg(f, 0, 120)})`, transformOrigin: '960px 520px' }}>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 45% 60% at 50% 48%, #24403d, #0b1211 80%)' }} />
        <Stage>
          <defs><clipPath id="fs-quet-a"><rect x={x} width={1920} height={1080} /></clipPath><clipPath id="fs-quet-b"><rect width={x} height={1080} /></clipPath></defs>
          <g clipPath="url(#fs-quet-a)">{head('nam')}</g>
          <g clipPath="url(#fs-quet-b)">{head('nguoi-kia')}</g>
          {!done && <><rect x={x - 3} width={6} height={1080} fill="#eafffb" /><rect x={x - 46} width={92} height={1080} fill={CYAN} opacity={0.22} /></>}
        </Stage>
      </div>
      <Tint c="#000" o={flick} blend="normal" />
      <Vignette k={0.8} />
      <Big t={seg(f, 4, 12) * (1 - seg(f, 50, 60))} size={70} x={170} y={BAR + 60} align="right" gap={12}>NỐT RUỒI BÊN TRÁI</Big>
      <Big t={seg(f, 62, 70)} size={70} x={170} y={BAR + 60} align="left" gap={12} color={RED}>…SAO GIỜ BÊN PHẢI?</Big>
    </AbsoluteFill>
  );
};

// ---------- 5. Chìm trong gương (19–24s) ----------
const Sink: React.FC<{ f: number }> = ({ f }) => {
  const down = 330 * seg(f, 20, 150), reach = seg(f, 40, 90);
  const pose: JointPose = { ...STAND_POSE, tilt: -4, neck: -10, armR: { a: -150 * reach, b: 20 }, armL: { a: -140 * reach, b: 24, rot: -1 }, handR: 'open', handL: 'open', frontR: true, frontL: true, view: 'front' };
  return (
    <AbsoluteFill style={{ background: '#02090b' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${1.02 + 0.14 * seg(f, 0, 150)})`, transformOrigin: '1060px 700px' }}>
        <Stage>
          <MirrorRealm ripple={f / 38} at={[1060, 870]}>
            <StudentTwinBody {...LOOK} x={1060} y={250 + down} scale={1.05} shirt={GREY} mood="scared" face="so-hai-03" talk={f % 12 < 6 ? { shape: 'a', open: 0.8 } : undefined} pose={pose} />
          </MirrorRealm>
        </Stage>
      </div>
      <Vignette k={0.6} />
      <Big t={seg(f, 70, 86)} size={96} y={BAR + 70} gap={14} color="#d9fffa">AI MỚI LÀ BẢN SAO?</Big>
    </AbsoluteFill>
  );
};

// ---------- 6. Loé mặt người kia · tựa phim (24–28s) ----------
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
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 26% at 50% 42%, rgba(60,230,220,.22), rgba(0,0,0,0) 70%)', opacity: title }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 262, textAlign: 'center', fontFamily: FONT.title, color: '#e8fbf8' }}>
        <div style={{ fontSize: 72, letterSpacing: 24 + 6 * (1 - title), fontWeight: 700, opacity: title }}>THE CRACK IN REALITY</div>
        <div style={{ fontSize: 40, letterSpacing: 8, marginTop: 210, color: '#9fe6df', opacity: sub }}>HỒ SƠ 02 · NGƯỜI TRONG GƯƠNG</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center', fontFamily: FONT.title, fontWeight: 700, fontSize: 36, letterSpacing: 3, color: RED, opacity: ask, textShadow: '0 0 18px rgba(255,60,40,.55)' }}>NẾU NÓ SỐNG TỐT HƠN BẠN… BẠN CÒN CẦN TỒN TẠI KHÔNG?</div>
    </AbsoluteFill>
  );
};

/** Một frame của teaser, không phụ thuộc hook nên chụp tĩnh được. */
export const FreestyleFrame: React.FC<{ g: number }> = ({ g }) => {
  const i = Math.max(0, B.findIndex((b, n) => g >= b && g < B[n + 1])), f = g - B[i];
  const beats = [<Halves f={f} />, <Montage f={f} g={g} />, <Fading f={f} g={g} />, <Scan f={f} />, <Sink f={f} />, <Title f={f} />];
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {beats[i]}
      {i < 5 && <FilmLook f={g} total={B[6] + 400} />}
      <Glitch g={g} />
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: BAR, background: '#000' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR, background: '#000' }} />
      </AbsoluteFill>
      <div style={{ position: 'absolute', right: 26, top: BAR + 14, fontFamily: FONT.title, fontSize: 16, letterSpacing: 2, color: 'rgba(255,255,255,.4)' }}>TEASER TỰ DO · BẢN DỰNG THỬ · CÂM</div>
    </AbsoluteFill>
  );
};
export const HoSo02TrailerFreestyle: React.FC = () => <FreestyleFrame g={useCurrentFrame()} />;
