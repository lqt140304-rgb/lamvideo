import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT } from '../../engine/fonts';
import { JointPose, mixPose, NguoiKia, PALETTE, STAND_POSE, StudentTwinBody, StudentTwinHead, TungHead, TungSoccer, TWIN_POSES } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { placeOn, RoomScene, RoomView } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';
import { BunCha, Football, Hammer, IdentityCard, Mirror, MoneyEnvelope, RiceBox } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/dao-cu';
import { EXTRA_POSES, FormalTwin, gripAt, SupportingActor } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/nhan-vat-va-tu-the';
import { ComputerLab, corridorSpot, labSpot, LectureHall, lectureSpot, MiniPitch, MirrorRealm, pitchSpot, UniversityCorridor } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/boi-canh';
import { FaceComparison, PhonePanel } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/giao-dien';
import { Camera, FilmLook, lerpLens, Lens, LOOK, RAYS, seg } from './canh-01-demo';

/**
 * The Crack in Reality — Hồ sơ 02: Người trong gương — TRAILER 60 giây, bản dựng thử câm.
 * Nguồn: episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/KICH-BAN-TRAILER-VA-OPENING.md (Phần 2, cảnh T01–T13).
 * Kịch bản viết cho 24 fps; studio chạy 30 fps nên mốc giây giữ nguyên, số frame nhân 1,25.
 * Thoại hiện bằng phụ đề tạm; chưa có giọng, nhạc, SFX.
 */
const T = [0, 120, 270, 450, 660, 810, 960, 1140, 1290, 1440, 1560, 1620, 1740, 1800]; // mốc đầu T01…T13 (frame @30fps)
export const TRAILER_TOTAL = T[13];

const BAR = 138; // viền đen 2.39:1 trên khung 16:9
const Letterbox: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: BAR, background: '#000' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR, background: '#000' }} />
  </AbsoluteFill>
);
const Caption: React.FC<{ f: number; from: number; to: number; who?: string; children: React.ReactNode; tone?: 'warm' | 'cold' }> = ({ f, from, to, who, children, tone = 'warm' }) => {
  if (f < from || f >= to) return null;
  const o = Math.min(seg(f, from, from + 6), 1 - seg(f, to - 6, to));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: BAR + 26, textAlign: 'center', opacity: o, fontFamily: FONT.title, color: tone === 'cold' ? '#bfe9e2' : '#f1ead9', textShadow: '0 2px 6px #000' }}>
      {who && <div style={{ fontSize: 22, letterSpacing: 3, opacity: 0.75, marginBottom: 6 }}>{who}</div>}
      <div style={{ fontSize: 36, lineHeight: 1.35, padding: '0 220px', fontStyle: tone === 'cold' ? 'italic' : 'normal' }}>{children}</div>
    </div>
  );
};
const Vignette: React.FC<{ k?: number }> = ({ k = 0.7 }) => <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 62% at 50% 52%, rgba(0,0,0,0) 40%, rgba(0,0,0,${k}) 100%)`, pointerEvents: 'none' }} />;
const Tint: React.FC<{ c: string; o: number; blend?: React.CSSProperties['mixBlendMode'] }> = ({ c, o, blend = 'multiply' }) => <AbsoluteFill style={{ background: c, opacity: o, mixBlendMode: blend, pointerEvents: 'none' }} />;
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>{children}</svg>;
const heartbeat = (t: number, from: number, rate: number) => (t < from ? 0 : Math.max(0, Math.sin(((t - from) / rate) * Math.PI * 2)) ** 8);
const talking = (f: number, on: boolean) => (on && f % 9 < 5 ? { shape: 'a' as const, open: 0.5 } : undefined);
type Spot = { x: number; y: number; scale: number };
/** Điểm cao `h` cm phía trên chân người đứng tại `at` trong phòng gốc (mặt bàn, mặt nệm). */
const above = (view: RoomView, at: [number, number], h: number) => { const p = placeOn(view, at); const pxcm = (p.scale * 590) / 168; return { x: p.x, y: p.y + 590 * p.scale - h * pxcm, s: pxcm }; };
/** Hạ rig xuống `cm` (ngồi mặt thấp hơn ghế chuẩn 45 cm). */
const drop = (p: Spot, cm: number): Spot => ({ ...p, y: p.y + (cm * p.scale * 590) / 168 });
const headLens = (p: Spot, z: number, dx = 0): Lens => ({ cx: p.x + dx, cy: p.y + 110 * p.scale, z });
const GREEN = PALETTE.nam.shirt, GREY = PALETTE.nam.sleepShirt;

// ---------- T01: cực cận mắt Nam, màn hình game phản chiếu trong con ngươi (0–4s) ----------
const T01: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.16 * seg(f, 0, 120);
  const blink = Math.sin(Math.PI * seg(f, 62, 76));
  const flick = f % 11 < 6 ? 1 : 0.78;
  const lid = 200 + 330 * blink;
  const open = `M330 560Q960 ${lid} 1590 560Q960 ${900 - 60 * blink} 330 560Z`;
  const veins = ['M350 560Q520 500 700 520', 'M420 600Q560 640 720 600', 'M470 500Q600 440 740 470', 'M1570 560Q1400 500 1230 524', 'M1500 610Q1360 650 1210 604', 'M1440 494Q1320 430 1190 468', 'M560 660Q700 700 800 650', 'M1360 670Q1230 700 1130 656'];
  const screen = (dx: number, col: string, o: number) => (
    <g transform={`translate(${898 + dx} 452) rotate(-7)`} opacity={o}>
      <rect width={128} height={196} rx={12} fill={col} />
    </g>
  );
  return (
    <AbsoluteFill style={{ background: '#241a1c' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${z}) rotate(-2deg)`, transformOrigin: '960px 545px' }}>
        <Stage>
          <defs>
            <clipPath id="t01-mat"><path d={open} /></clipPath>
            <radialGradient id="t01-da" cx=".5" cy=".5" r=".7"><stop offset="0" stopColor="#a87862" /><stop offset="1" stopColor="#3a2626" /></radialGradient>
            <radialGradient id="t01-trong" cx=".5" cy=".5" r=".6"><stop offset="0" stopColor="#efe2d6" /><stop offset=".8" stopColor="#d9b7ae" /><stop offset="1" stopColor="#b98078" /></radialGradient>
            <filter id="t01-khoi" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={38} /></filter>
          </defs>
          <rect x={-300} y={-300} width={2500} height={1700} fill="url(#t01-da)" />
          {/* quầng thâm dưới mắt, nếp mí */}
          <path d="M380 640Q960 1010 1540 640Q960 900 380 640Z" fill="#3b2330" opacity={0.55} />
          <path d={`M300 520Q960 ${lid - 150} 1620 520`} fill="none" stroke="#2a1a1c" strokeWidth={10} opacity={0.5} />
          <g clipPath="url(#t01-mat)">
            <rect x={300} y={150} width={1320} height={800} fill="url(#t01-trong)" />
            {veins.map((d, i) => <path key={i} d={d} fill="none" stroke="#b03a36" strokeWidth={5 - (i % 3)} strokeLinecap="round" opacity={0.75} />)}
            {veins.map((d, i) => <path key={`b${i}`} d={d} fill="none" stroke="#c9504a" strokeWidth={2} strokeLinecap="round" opacity={0.6} transform={`translate(0 ${14 + (i % 2) * 8})`} />)}
            <circle cx={960} cy={545} r={228} fill="#2c1d18" />
            <circle cx={960} cy={545} r={212} fill="#4a3226" />
            {Array.from({ length: 28 }, (_, i) => <path key={i} d="M0 -108V-204" stroke="#6a4a36" strokeWidth={5} opacity={0.5} transform={`translate(960 545) rotate(${i * 12.86})`} />)}
            <circle cx={960} cy={545} r={104} fill="#08080a" />
            {/* màn hình điện thoại phản chiếu trong con ngươi, lệch màu đỏ–lam ở mép */}
            {screen(-3, '#ff5a4a', 0.5 * flick)}
            {screen(3, '#59d8ff', 0.5 * flick)}
            {screen(0, '#cfeaff', 0.9 * flick)}
            <g transform="translate(898 452) rotate(-7)" opacity={flick}>
              <rect x={10} y={22} width={108} height={64} fill="#1c2733" />
              <text x={64} y={64} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={26} fill="#ff4638">DEFEAT</text>
              <rect x={22} y={106} width={84} height={12} rx={6} fill="#7d94a8" /><rect x={22} y={130} width={60} height={12} rx={6} fill="#7d94a8" />
            </g>
            <ellipse cx={1050} cy={470} rx={30} ry={20} fill="#fff" opacity={0.5} />
            {/* bóng mí trên đổ xuống tròng mắt */}
            <path d={`M300 150H1620V560Q960 ${lid + 150} 300 560Z`} fill="#1a0f12" opacity={0.42} />
          </g>
          <path d={`M330 560Q960 ${lid} 1590 560`} fill="none" stroke="#150d0f" strokeWidth={22} strokeLinecap="round" />
          {Array.from({ length: 13 }, (_, i) => { const t = (i + 1) / 14, x = 330 + 1260 * t, y = 560 + (lid - 560) * 2 * t * (1 - t); return <path key={i} d={`M${x} ${y}q${(t - 0.5) * 60} -46 ${(t - 0.5) * 110} -70`} stroke="#150d0f" strokeWidth={7} strokeLinecap="round" fill="none" />; })}
          <path d={`M330 560Q960 ${900 - 60 * blink} 1590 560`} fill="none" stroke="#5a3434" strokeWidth={8} opacity={0.7} />
          {/* khói trôi ngang ống kính */}
          <g filter="url(#t01-khoi)" opacity={0.2}>
            {[0, 1, 2].map((i) => <ellipse key={i} cx={((f * (5 + i * 2) + i * 700) % 2700) - 300} cy={330 + i * 230 + Math.sin(f / 20 + i) * 30} rx={380} ry={80} fill="#dfe9f2" />)}
          </g>
        </Stage>
      </div>
      <Tint c="#3f6fa8" o={0.35 * flick} blend="soft-light" />
      <Vignette k={0.8} />
    </AbsoluteFill>
  );
};

// ---------- T02: người lạ ở bồn rửa quay lại — cùng một gương mặt (4–9s) ----------
const SINK: [number, number] = [118, 70], NAM_T02: [number, number] = [250, 330];
const T02: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const pk = placeOn('kitchen', SINK);
  if (f >= 84 && f < 118) {
    // crash zoom vào mặt Nam thật
    const k = f - 84, p = placeOn('wide', NAM_T02);
    const z = interpolate(k, [0, 5, 34], [1.3, 3.3, 3.5], { extrapolateRight: 'clamp' });
    const nam = { at: NAM_T02, render: () => <StudentTwinBody {...LOOK} {...p} shirt={GREY} mood="shocked" face={k < 8 ? 'bat-ngo-03' : 'so-hai-03'} talk={talking(k, k > 10)} pose={{ ...STAND_POSE, tilt: -6, neck: -4, view: 'three', facing: -1 }} /> };
    return (
      <AbsoluteFill style={{ filter: k < 5 ? `blur(${(5 - k) * 3}px)` : undefined }}>
        <Camera lens={headLens(p, z)} f={g} hand={1.4} shake={k < 10 ? Math.sin(k * 3) * (10 - k) : 0}>
          <RoomScene rays={RAYS} view="wide" door="ajar" chair="bed" phone="hidden" kitchen="clean" actors={[nam]} />
        </Camera>
      </AbsoluteFill>
    );
  }
  const close = f >= 118;
  const view = f < 46 ? 'back' : f < 50 ? 'side' : 'three';
  const nk = { at: SINK, render: () => <NguoiKia {...LOOK} {...pk} shirt={GREEN} mood="calm" blink={false} talk={talking(f, close && f < 142)} pose={{ ...(f < 46 ? TWIN_POSES.holdBowl : mixPose(TWIN_POSES.holdBowl, STAND_POSE, seg(f, 50, 66))), view, facing: 1 }} /> };
  const lens = close ? headLens(pk, 2.7) : lerpLens({ cx: 960, cy: 540, z: 1 }, headLens(pk, 1.5, 0), seg(f, 0, 84));
  return (
    <Camera lens={lens} f={g} hand={0.7}>
      <RoomScene sun={0.1} view="kitchen" kitchen="clean" actors={[nk]} />
    </Camera>
  );
};

// ---------- T03: đập phong bì thị uy · húp mì đắc chí · dúi thẻ sinh viên (9–15s) ----------
const SLAM: JointPose = { ...STAND_POSE, tilt: 9, neck: 2, armR: { a: 46, b: 16 }, handR: 'open', frontR: true };
const OFFER: JointPose = { ...STAND_POSE, tilt: 4, neck: 2, armL: { a: 62, b: 22, rot: -1 }, handL: 'hold', frontL: true };
const EAT: JointPose = { ...TWIN_POSES.sitLow, armR: { a: 20, b: 75 }, armL: { a: 14, b: 100, rot: -1 }, handR: 'hold', handL: 'hold', frontR: true, frontL: true, prop: 'bowl' };
const NAM_2: [number, number] = [160, 222], NK_2: [number, number] = [268, 232];
const T03: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  if (f < 70) {
    const at: [number, number] = [338, 100], p = placeOn('desk', at), slam = seg(f, 18, 23);
    const NKA: [number, number] = [268, 66], pk = placeOn('desk', NKA);
    const env = above('desk', [392, 52], 62);
    const nam = { at, render: () => <StudentTwinBody {...LOOK} {...p} shirt={GREY} mood="agitated" face="tuc-gian-03" talk={talking(f, f > 24)} pose={{ ...mixPose(EXTRA_POSES['thi-uy'], SLAM, slam), view: 'three', facing: 1 }} /> };
    const nk = { at: NKA, render: () => <NguoiKia {...LOOK} {...pk} shirt={GREEN} mood="calm" blink={false} pose={{ ...STAND_POSE, neck: 2 + 9 * Math.max(0, Math.sin((f - 40) / 5)) * (f > 40 ? 1 : 0), view: 'three', facing: 1 }} /> };
    return (
      <Camera lens={{ cx: 960, cy: 540, z: 1 + 0.05 * seg(f, 0, 70) }} f={g} hand={0.8} shake={f >= 22 && f < 32 ? Math.sin(f * 3.1) * (32 - f) * 1.4 : 0}>
        <RoomScene rays={RAYS} view="desk" chair="bed" phone="hidden" kitchen="clean" actors={[nk, nam]} />
        {f >= 22 && <Stage><g transform={`translate(${env.x} ${env.y}) scale(${env.s * 0.11}) rotate(-8)`}><MoneyEnvelope /></g></Stage>}
      </Camera>
    );
  }
  if (f < 120) {
    const k = f - 70, at: [number, number] = [340, 384], p = drop(placeOn('wide', at), 0);
    const nam = { at, render: () => <StudentTwinBody {...LOOK} {...p} shirt={GREY} mood="neutral_smile" face="tu-man-03" talk={talking(k, k > 8)} pose={{ ...EAT, neck: -4 + 3 * Math.sin(k / 6), view: 'three', facing: -1 }} /> };
    return (
      <Camera lens={{ cx: p.x - 30, cy: p.y + 250 * p.scale, z: 1.9 + 0.1 * seg(k, 0, 50) }} f={g} hand={0.6}>
        <RoomScene rays={RAYS} view="wide" chair="desk" door="closed" phone="hidden" kitchen="clean" actors={[nam]} />
      </Camera>
    );
  }
  const k = f - 120, pn = placeOn('wide', NAM_2), pk = placeOn('wide', NK_2);
  const give = seg(k, 16, 34), taken = k >= 40;
  const takePose = EXTRA_POSES['nhan-do-tay-trai'];
  const namPose = mixPose(STAND_POSE, OFFER, taken ? 1 - seg(k, 44, 58) : give);
  const nkPose = mixPose(STAND_POSE, takePose, seg(k, 22, 38));
  const gp = taken ? gripAt(takePose, 'L') : gripAt(namPose, 'L'), who = taken ? pk : pn, dir = taken ? -1 : 1;
  const card = { x: who.x + dir * gp.x * who.scale, y: who.y + gp.y * who.scale, s: who.scale * 0.2 };
  const nam = { at: NAM_2, render: () => <StudentTwinBody {...LOOK} {...pn} shirt={GREY} mood="neutral_smile" face="tu-man-02" talk={talking(k, k > 34)} pose={{ ...namPose, handL: taken ? 'rest' : 'hold', view: 'three', facing: 1 }} /> };
  const nk = { at: NK_2, render: () => <NguoiKia {...LOOK} {...pk} shirt={GREEN} mood="calm" face="cuoi-che-giau-01" blink={false} talk={talking(k, k < 30)} pose={{ ...nkPose, view: 'three', facing: -1 }} /> };
  return (
    <Camera lens={{ cx: (pn.x + pk.x) / 2, cy: pn.y + 270 * pn.scale, z: 1.6 + 0.08 * seg(k, 0, 60) }} f={g} hand={0.5}>
      <RoomScene night view="wide" chair="bed" door="closed" phone="hidden" kitchen="clean" actors={[nam, nk]} />
      {give > 0.3 && <Stage><g transform={`translate(${card.x} ${card.y}) scale(${card.s}) rotate(${dir * 12})`}><IdentityCard /></g></Stage>}
    </Camera>
  );
};

// ---------- T04: montage vinh quang của kẻ thế thân, mỗi lát ~1,7s (15–22s) ----------
const KICK: JointPose = { ...STAND_POSE, tilt: -9, neck: 2, legL: { a: 58, b: 6 }, armR: { a: 46, b: 20 }, armL: { a: -34, b: 24, rot: -1 } };
const WIND: JointPose = { ...STAND_POSE, tilt: 8, legL: { a: -38, b: 64 }, armR: { a: -30, b: 20 }, armL: { a: 30, b: 20, rot: -1 } };
const Flash: React.FC<{ f: number; len?: number }> = ({ f, len = 5 }) => (f < len ? <AbsoluteFill style={{ background: '#fff', opacity: 0.8 * (1 - f / len), mixBlendMode: 'screen' }} /> : null);
const T04: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const i = Math.min(3, Math.floor(f / 52)), k = f - i * 52;
  let body: React.ReactNode;
  if (i === 0) {
    const p = labSpot();
    body = (
      <Camera lens={{ cx: p.x + 120, cy: p.y + 200 * p.scale, z: 1.9 + 0.15 * seg(k, 0, 52) }} f={g} hand={0.5}>
        <Stage><ComputerLab><FormalTwin pose={EXTRA_POSES['thuyet-trinh']} mood="neutral_smile" {...p} /></ComputerLab></Stage>
      </Camera>
    );
    body = <>{body}<div style={{ position: 'absolute', right: 230, top: 170, fontFamily: FONT.title, fontWeight: 800, fontSize: 250 * (0.7 + 0.3 * seg(k, 6, 16)), color: '#ffd45e', opacity: seg(k, 6, 12), textShadow: '0 0 40px rgba(255,190,60,.8), 0 6px 0 #7a4a12' }}>9.5</div></>;
  } else if (i === 1) {
    const p = pitchSpot(), kick = seg(k, 12, 17);
    const pose = k < 12 ? mixPose(STAND_POSE, WIND, seg(k, 2, 11)) : mixPose(WIND, KICK, kick);
    const fly = seg(k, 16, 40), bx = p.x + 70 * p.scale + (990 - p.x - 70 * p.scale) * fly, by = p.y + 540 * p.scale + (430 - p.y - 540 * p.scale) * fly - 160 * Math.sin(Math.PI * fly);
    body = (
      <Camera lens={{ cx: p.x + 60 + (bx - p.x) * 0.7 * fly, cy: p.y + 300 * p.scale - 80 * fly, z: 2.3 - 0.7 * fly }} f={g} hand={1} shake={k >= 16 && k < 22 ? Math.sin(k * 3) * 8 : 0}>
        <Stage>
          <MiniPitch><NguoiKia {...LOOK} {...p} outfit="the-thao" mood="neutral_smile" blink={false} pose={{ ...pose, view: 'three', facing: 1 }} /></MiniPitch>
          <g transform={`translate(${bx} ${by}) scale(${p.scale * (0.42 - 0.22 * fly)}) rotate(${k * 30})`}><Football /></g>
        </Stage>
      </Camera>
    );
  } else if (i === 2) {
    const a: [number, number] = [170, 250], b: [number, number] = [282, 246], pt = placeOn('wide', a), pk = placeOn('wide', b);
    const tp = EXTRA_POSES['tung-xach-com'], gt = gripAt(tp, 'L');
    const tung = { at: a, render: () => <TungSoccer {...pt} mood="normal" talk={talking(k, k > 6)} pose={{ ...tp, view: 'three', facing: 1 }} /> };
    const nk = { at: b, render: () => <NguoiKia {...LOOK} {...pk} shirt={GREEN} mood="neutral_smile" face="vui-01" blink={false} pose={{ ...STAND_POSE, neck: -3, view: 'three', facing: -1 }} /> };
    body = (
      <Camera lens={{ cx: (pt.x + pk.x) / 2, cy: pt.y + 280 * pt.scale, z: 1.55 + 0.08 * seg(k, 0, 52) }} f={g} hand={0.5}>
        <RoomScene rays={RAYS} view="wide" chair="desk" door="open" phone="hidden" kitchen="clean" actors={[tung, nk]} />
        <Stage><g transform={`translate(${pt.x + gt.x * pt.scale} ${pt.y + gt.y * pt.scale + 26 * pt.scale}) scale(${pt.scale * 0.3})`}><RiceBox /></g></Stage>
      </Camera>
    );
  } else {
    const ring = Math.sin(k * 1.7) * 5;
    body = (
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #5a4634, #17120f 75%)' }}>
        <Stage>
          <g transform={`translate(${960 + ring} 545) rotate(${-5 + ring * 0.3}) scale(${1.12 + 0.05 * seg(k, 0, 52)}) translate(-180 -320)`}><PhonePanel kind="clip-gia-dinh" /></g>
        </Stage>
        <Tint c="#ffb65e" o={0.2} blend="soft-light" />
      </AbsoluteFill>
    );
  }
  return <AbsoluteFill>{body}<Tint c="#ffcf87" o={0.16} blend="soft-light" /><Flash f={k} /></AbsoluteFill>;
};

// ---------- T05: cắt song song — bản sao rạng rỡ, Nam thật héo dần (22–27s) ----------
const CLUTCH: JointPose = { ...EXTRA_POSES['suy-sup'], tilt: 24, neck: 14, armR: { a: 12, b: 128 }, handR: 'fist', frontR: true };
const CUTS_T05 = [0, 30, 58, 80, 106, 122, 150];
const T05: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const i = CUTS_T05.findIndex((c, n) => f >= c && f < CUTS_T05[n + 1]), k = f - CUTS_T05[i];
  if (i % 2 === 0) {
    const p = corridorSpot(), s = p.scale;
    return (
      <AbsoluteFill>
        <Camera lens={{ cx: p.x + 30, cy: p.y + 230 * s, z: 1.5 + 0.1 * seg(k, 0, 30) }} f={g} hand={0.5}>
          <Stage>
            <UniversityCorridor>
              <SupportingActor role="sinh-vien-nu" x={p.x - 190 * s} y={p.y + 14 * s} scale={s * 0.97} />
              <SupportingActor role="sinh-vien-nam" x={p.x + 200 * s} y={p.y + 6 * s} scale={s} />
              <FormalTwin mood="neutral_smile" pose={{ ...EXTRA_POSES['thuyet-trinh'], neck: -3 }} {...p} />
            </UniversityCorridor>
          </Stage>
        </Camera>
        <Tint c="#ffc46a" o={0.3} blend="soft-light" />
        <Flash f={k} len={3} />
      </AbsoluteFill>
    );
  }
  const at: [number, number] = [340, 384], p = drop(placeOn('wide', at), 21), sick = (i - 1) / 4;
  const gasp = Math.sin(Math.PI * seg(k, 2, 16));
  const nam = { at, render: () => <StudentTwinBody {...LOOK} {...p} shirt={GREY} mood="scared" face={i >= 3 ? 'kiet-suc-03' : 'kiet-suc-02'} pose={{ ...mixPose(EXTRA_POSES['suy-sup'], CLUTCH, gasp), view: 'three', facing: -1 }} /> };
  return (
    <AbsoluteFill style={{ filter: `saturate(${0.55 - 0.3 * sick})` }}>
      <Camera lens={{ cx: p.x - 20, cy: p.y + 250 * p.scale, z: 1.9 + 0.25 * sick + 0.05 * gasp }} f={g} hand={0.9}>
        <RoomScene night view="wide" chair="desk" door="closed" phone="hidden" kitchen="messy" actors={[nam]} />
      </Camera>
      <Tint c="#1c3a34" o={0.45 + 0.2 * sick} />
      <Vignette k={0.75} />
    </AbsoluteFill>
  );
};

// ---------- T06: nửa đêm, người kia ngồi bất động giữa phòng (27–32s) ----------
const CHAIR: [number, number] = [195, 215];
const T06: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const pk = placeOn('wide', CHAIR), at: [number, number] = [345, 384], pn = drop(placeOn('wide', at), 21);
  const nk = { at: CHAIR, render: () => <NguoiKia {...LOOK} {...pk} shirt={GREEN} mood={f > 118 ? 'eerie_smirk' : 'calm'} face={f > 118 ? undefined : f > 84 ? 'cuoi-che-giau-02' : 'cuoi-che-giau-01'} blink={false} talk={talking(f, f > 90 && f < 140)} pose={{ ...EXTRA_POSES['nk-cho-doi'], neck: 0, tilt: 0, view: 'three', facing: 1 }} /> };
  const nam = { at, render: () => <StudentTwinBody {...LOOK} {...pn} shirt={GREY} mood="suspicious" face="nghi-ngo-02" blink={f % 70 < 3} talk={talking(f, f > 10 && f < 78)} pose={{ ...TWIN_POSES.sitLow, view: 'three', facing: -1 }} /> };
  const lens = lerpLens({ cx: (pk.x + pn.x) / 2 + 40, cy: pk.y + 300 * pk.scale, z: 1.45 }, headLens(pk, 3.4), seg(f, 60, 150));
  return (
    <AbsoluteFill>
      <Camera lens={lens} f={g} hand={0.4}>
        <RoomScene night view="wide" chair="door" door="closed" phone="desk" kitchen="clean" actors={[nk, nam]} />
      </Camera>
      <AbsoluteFill style={{ background: 'linear-gradient(270deg, rgba(80,170,200,.22) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,.45) 100%)' }} />
      <Vignette k={0.8} />
    </AbsoluteFill>
  );
};

// ---------- T07: Nam thật lên bục giảng và bị đào thải (32–38s) ----------
const T07: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const beat = heartbeat(f, 0, 24);
  if (f < 80) {
    const p = lectureSpot(), s = p.scale, fall = seg(f, 22, 34), cx = p.x + 62 * s;
    const cy = p.y + (330 + 255 * fall * fall) * s;
    return (
      <AbsoluteFill>
        <Camera lens={{ cx: p.x + 60, cy: p.y + 240 * s, z: 2.1 + 0.25 * seg(f, 0, 80) + 0.03 * beat }} f={g} hand={0.9}>
          <Stage>
            <LectureHall failed><FormalTwin identity="nam" mood="scared" pose={{ ...EXTRA_POSES['buc-giang'], tilt: 3 + Math.sin(f * 1.9) * 0.9 }} {...p} /></LectureHall>
            {f >= 22 && (fall < 1 ? <rect x={cx - 2 * s} y={cy} width={22 * s} height={5 * s} rx={2 * s} fill="#f4f1e6" transform={`rotate(${f * 40} ${cx} ${cy})`} /> : <g fill="#f4f1e6"><rect x={cx - 16 * s} y={cy} width={11 * s} height={5 * s} rx={2 * s} /><rect x={cx + 6 * s} y={cy - 2 * s} width={10 * s} height={5 * s} rx={2 * s} transform={`rotate(24 ${cx + 6 * s} ${cy})`} /></g>)}
          </Stage>
        </Camera>
        <Tint c="#bcd4e6" o={0.25} />
      </AbsoluteFill>
    );
  }
  if (f < 130) {
    const k = f - 80;
    return (
      <AbsoluteFill>
        <Camera lens={{ cx: 900, cy: 470, z: 1.1 + 0.2 * seg(k, 0, 50) + 0.03 * beat }} f={g} hand={0.6}>
          <Stage><LectureHall failed view="nguoc" /></Stage>
        </Camera>
        <Tint c="#bcd4e6" o={0.3} />
        <Vignette k={0.55} />
      </AbsoluteFill>
    );
  }
  const k = f - 130, p = corridorSpot(), s = p.scale, shove = Math.sin(Math.PI * seg(k, 8, 20));
  return (
    <AbsoluteFill>
      <Camera lens={{ cx: p.x + 90 * s, cy: p.y + 230 * s, z: 1.6 }} f={g} hand={1} shake={shove * 6}>
        <Stage>
          <UniversityCorridor>
            <FormalTwin identity="nam" mood="scared" pose={{ ...STAND_POSE, tilt: -4 - 6 * shove, neck: 12, view: 'three', facing: 1 }} x={p.x - 20 * s * shove} y={p.y} scale={s} />
            <TungSoccer x={p.x + 215 * s} y={p.y + 4 * s} scale={s} mood="annoyed" talk={talking(k, k > 6)} pose={{ ...STAND_POSE, tilt: 5, armL: { a: 20 + 50 * shove, b: 16, rot: 1 }, handL: 'open', frontL: true, view: 'three', facing: -1 }} />
          </UniversityCorridor>
        </Stage>
      </Camera>
      <Tint c="#9fb4c2" o={0.22} />
    </AbsoluteFill>
  );
};

// ---------- T08: manh mối nốt ruồi · Nam trước gương (38–43s) ----------
const MW = 420, MH = 900;
const T08: React.FC<{ f: number }> = ({ f }) => {
  if (f < 78) {
    const z = 1.35 + 0.2 * seg(f, 0, 78);
    return (
      <AbsoluteFill style={{ background: '#0c1114' }}>
        <Stage>
          <g transform={`translate(960 500) scale(${z}) translate(-470 -190)`}>
            <rect x={-30} y={-30} width={1000} height={440} rx={26} fill="#eef0e6" />
            <FaceComparison />
          </g>
        </Stage>
        <Vignette k={0.75} />
      </AbsoluteFill>
    );
  }
  const k = f - 78, z = 1 + 0.16 * seg(k, 0, 72) + 0.012 * heartbeat(k, 0, 22);
  return (
    <AbsoluteFill style={{ background: '#0b1211' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '1000px 480px' }}>
        <Stage>
          <g transform="translate(1390 1500) scale(1.6)">
            <Mirror w={MW} h={MH}>
              <rect width={MW} height={MH} fill="#101917" />
              <NguoiKia {...LOOK} x={MW * 0.5} y={MH * 0.12} scale={0.95} mood="calm" face={k > 40 ? 'cuoi-che-giau-02' : undefined} blink={false} pose={{ ...STAND_POSE, neck: -3, view: 'front' }} />
              <rect width={MW} height={MH} fill="#3cc6c0" opacity={0.1} />
            </Mirror>
          </g>
          <StudentTwinBody {...LOOK} x={760} y={150} scale={1.55} shirt={GREY} mood="scared" face={k > 30 ? 'so-hai-03' : 'so-hai-02'} talk={talking(k, k > 6 && k < 66)} pose={{ ...STAND_POSE, tilt: -3, neck: -2, view: 'three', facing: 1 }} />
        </Stage>
      </div>
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 40%, rgba(60,200,190,.1) 100%)' }} />
      <Vignette k={0.7} />
    </AbsoluteFill>
  );
};

// ---------- T09–T10: búa sắt trước gương · kính hoá nước nuốt Nam (43–52s) ----------
const MIR = { x: 1330, y: 930, s: 0.8 };
const MIRT = `translate(${MIR.x} ${MIR.y}) scale(${MIR.s}) rotate(-2)`;
const DarkRoom: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Stage>
    <rect x={-600} y={-600} width={3100} height={2300} fill="#0c1615" />
    <path d="M-300 1240L900 930H2400V1500H-300Z" fill="#142220" />
    <path d="M-300 1240L900 930H2400" fill="none" stroke="#1d302d" strokeWidth={4} />
    {children}
  </Stage>
);
const T09: React.FC<{ f: number }> = ({ f }) => {
  const q = Math.floor(f / 2) * 2; // cửa trập 90°: chuyển động giật từng nấc
  const lunge = seg(q, 20, 70), raise = EXTRA_POSES['giu-bua'], grip = gripAt(raise, 'R');
  const nx = 520 + 330 * lunge, ns = 1.02, ny = 930 - 589 * ns, sway = Math.sin(q / 4) * 4;
  const nkTalk = f > 96;
  return (
    <AbsoluteFill style={{ background: '#060d0c' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${Math.sin(q * 2.3) * (f < 90 ? 7 : 2)}px, ${Math.cos(q * 1.7) * 3}px) scale(${1.04 + 0.08 * lunge})`, transformOrigin: '1000px 640px' }}>
        <DarkRoom>
          <g transform={MIRT}>
            <Mirror w={MW} h={MH} progress={0.08} phase={f / 8}>
              <rect width={MW} height={MH} fill="#07201f" />
              <rect width={MW} height={MH} fill="#3cc6c0" opacity={0.12 + 0.05 * Math.sin(f / 5)} />
            </Mirror>
          </g>
          <NguoiKia {...LOOK} x={1640} y={930 - 589 * 1.0} scale={1} shirt={GREEN} mood={nkTalk ? 'eerie_smirk' : 'calm'} blink={false} talk={talking(f, nkTalk && f < 146)} pose={{ ...STAND_POSE, neck: -4, view: 'three', facing: -1 }} />
          <g transform={`translate(${nx} ${ny}) scale(${ns})`}>
            <StudentTwinBody {...LOOK} shirt={GREY} mood="agitated" face="tuc-gian-03" talk={talking(q, f > 8 && f < 90)} pose={{ ...raise, tilt: (raise.tilt ?? 0) - 6 + sway + 8 * lunge, view: 'three', facing: 1 }} />
            <g transform={`translate(${grip.x} ${grip.y}) rotate(${31 + sway * 2})`}><Hammer /></g>
          </g>
        </DarkRoom>
      </div>
      <Tint c="#ff3a2a" o={f < 90 && q % 12 === 0 ? 0.16 : 0} blend="screen" />
      <Vignette k={0.75} />
    </AbsoluteFill>
  );
};
const ARMS = [[-40, 300, -260, 380], [10, 420, -230, 470], [-30, 560, -250, 520], [20, 660, -210, 610], [-10, 760, -220, 700], [30, 230, -180, 330], [0, 500, -280, 440]];
const T10: React.FC<{ f: number }> = ({ f }) => {
  const dropH = seg(f, 0, 14), ripple = seg(f, 16, 46) * (1 - seg(f, 100, 116));
  const reach = seg(f, 30, 52), pull = seg(f, 54, 92), flat = seg(f, 104, 118);
  const touch = EXTRA_POSES['ap-kinh'];
  const nx = 850 + 60 * seg(f, 0, 22) + 330 * pull, ns = 1.02 - 0.2 * pull, ny = 930 - 589 * ns - 30 * pull;
  const hx = 760, hy = 420 + 505 * dropH * dropH;
  const slow = f / 2; // quay chậm
  return (
    <AbsoluteFill style={{ background: '#060d0c' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${f >= 13 && f < 20 ? Math.sin(f * 4) * 9 : 0}px, 0) scale(${1.12 + 0.1 * pull})`, transformOrigin: '1200px 620px' }}>
        <DarkRoom>
          <g transform={MIRT}>
            <Mirror w={MW} h={MH} progress={ripple} phase={slow / 3}>
              <rect width={MW} height={MH} fill="#041413" />
              <svg x={-60} y={-60} width={MW + 120} height={MH + 120} viewBox="560 0 800 1080" preserveAspectRatio="xMidYMid slice" opacity={0.25 + 0.75 * ripple}><MirrorRealm ripple={slow / 20} floating={false} /></svg>
              {/* bong bóng khí nổi lên sau khi Nam chìm */}
              {pull > 0.6 && Array.from({ length: 9 }, (_, i) => { const t = ((f - 76 + i * 5) % 40) / 40; return <circle key={i} cx={MW * (0.3 + 0.05 * i) + Math.sin(f / 4 + i) * 8} cy={MH * (0.75 - 0.6 * t)} r={5 + (i % 3) * 4} fill="none" stroke="#bff8ef" strokeWidth={2.5} opacity={(1 - t) * (1 - flat)} />; })}
            </Mirror>
          </g>
          <g opacity={1 - seg(f, 70, 92)}>
            <g transform={`translate(${nx} ${ny}) scale(${ns})`}>
              <StudentTwinBody {...LOOK} shirt={GREY} mood="scared" face="so-hai-03" talk={f > 40 && f < 90 ? { shape: 'a', open: 0.9 } : undefined} pose={{ ...mixPose(STAND_POSE, touch, seg(f, 6, 24)), tilt: 4 + 14 * pull, view: 'three', facing: 1 }} />
            </g>
            {pull > 0 && <rect x={nx - 200} y={ny} width={500} height={640} fill="#0c2b2a" opacity={0.5 * pull} style={{ mixBlendMode: 'multiply' }} />}
          </g>
          {/* những cánh tay nhợt nhạt vươn ra từ mặt kính, tóm lấy Nam */}
          <g transform={MIRT} opacity={(1 - seg(f, 84, 100)) * 0.95}>
            {ARMS.map(([x0, y0, x1, y1], i) => {
              const k = Math.max(0, Math.min(1, reach * 1.4 - i * 0.06)), back = pull * 0.9;
              const ex = x0 + (x1 - x0) * k * (1 - back), ey = -MH + y0 + (y1 - y0) * k;
              const sx = -MW / 2 + 20 + x0 * 0.3 + MW * 0.5 * (i % 2), sy = -MH + y0;
              return k <= 0 ? null : (
                <g key={i}>
                  <path d={`M${sx} ${sy}Q${(sx + ex) / 2} ${(sy + ey) / 2 + 40 * Math.sin(f / 6 + i)} ${ex} ${ey}`} fill="none" stroke="#a9cfc6" strokeWidth={30 - i * 1.5} strokeLinecap="round" />
                  {[-22, -8, 6, 20].map((a) => <path key={a} d={`M${ex} ${ey}l${-34 * Math.cos((a * Math.PI) / 60)} ${a}`} stroke="#a9cfc6" strokeWidth={9} strokeLinecap="round" />)}
                </g>
              );
            })}
          </g>
          {/* búa tuột tay rơi xuống sàn */}
          <g transform={`translate(${hx} ${hy}) rotate(${31 + 240 * dropH})`}><Hammer /></g>
        </DarkRoom>
        <div style={{ position: 'absolute', left: MIR.x - 220, top: MIR.y - 760, width: 440, height: 780, borderRadius: 200, background: 'radial-gradient(ellipse, rgba(80,255,210,.32), rgba(0,0,0,0) 70%)', opacity: ripple, mixBlendMode: 'screen' }} />
      </div>
      {f >= 13 && f < 34 && <div style={{ position: 'absolute', left: 560, top: 700, fontFamily: FONT.title, fontWeight: 800, fontSize: 86, color: '#f3f6f2', opacity: 1 - seg(f, 22, 34), letterSpacing: 6, transform: `scale(${1 + 0.3 * seg(f, 13, 34)}) rotate(-6deg)` }}>KENG!</div>}
      <Vignette k={0.75} />
    </AbsoluteFill>
  );
};

// ---------- T11: ba khung hình loé (52–54s) ----------
const Palm: React.FC<{ x: number; y: number; r: number; s: number }> = ({ x, y, r, s }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill="#e9d2c0" opacity={0.92}>
    <ellipse cx={0} cy={18} rx={30} ry={34} />
    {[[-24, -30, -14], [-9, -48, -4], [7, -50, 4], [22, -40, 14]].map(([a, b, c], i) => <ellipse key={i} cx={a} cy={b} rx={7.5} ry={23} transform={`rotate(${c} ${a} ${b})`} />)}
    <ellipse cx={-36} cy={10} rx={7.5} ry={19} transform="rotate(-40 -36 10)" />
  </g>
);
const T11: React.FC<{ f: number }> = ({ f }) => {
  const n = f >= 6 && f < 9 ? 1 : f >= 24 && f < 27 ? 2 : f >= 42 && f < 45 ? 3 : 0;
  if (n === 1) return (
    <AbsoluteFill style={{ background: '#0a2a2c' }}>
      <Stage>
        <StudentTwinHead identity="nam" mood="scared" face="so-hai-03" view="front" talk={{ shape: 'a', open: 1 }} x={960} y={130} scale={5} />
        <Palm x={430} y={600} r={-12} s={3.4} /><Palm x={1500} y={620} r={14} s={-3.4} />
        <rect width={1920} height={1080} fill="#1fa39c" opacity={0.32} />
        <path d="M0 300L1920 180V260L0 420Z" fill="#d8fff8" opacity={0.12} />
      </Stage>
      <Vignette k={0.8} />
    </AbsoluteFill>
  );
  if (n === 2) return (
    <AbsoluteFill style={{ background: '#1b1612' }}>
      <Stage>
        <g transform="translate(960 560) rotate(-3)">
          <rect x={-560} y={-360} width={1120} height={720} fill="#6d4f34" />
          <rect x={-520} y={-320} width={1040} height={640} fill="#d9cdb4" />
          <g transform="translate(-300 -200) scale(2.3)"><TungHead mood="normal" id="t11-tung" view="front" /></g>
          {/* chỗ của Nam trong ảnh: chỉ còn khoảng trống nham nhở */}
          <path d="M120 -190q150 -60 230 60q60 130 -20 260q-110 110 -230 20q-90 -110 -40 -250q20 -60 60 -90Z" fill="#141110" />
          {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${70 + i * 26} ${-200 + (i % 4) * 30}l${40 - i * 4} ${360 - (i % 3) * 60}`} stroke="#d9cdb4" strokeWidth={3} opacity={0.55} />)}
        </g>
      </Stage>
      <Tint c="#3a2a1a" o={0.35} />
    </AbsoluteFill>
  );
  if (n === 3) return (
    <AbsoluteFill style={{ background: '#d8fff8' }}>
      <Stage><StudentTwinHead identity="nguoi-kia" mood="stare_grin" view="front" x={960} y={60} scale={6.4} /></Stage>
      <Vignette k={0.55} />
    </AbsoluteFill>
  );
  return <AbsoluteFill style={{ background: '#000' }}><AbsoluteFill style={{ background: '#0d3a3a', opacity: 0.25 * heartbeat(f, 0, 18) }} /></AbsoluteFill>;
};

// ---------- T12: Tùng về phòng, tay trái đón đồ, câu hỏi về nốt ruồi (54–58s) ----------
const TUNG_AT: [number, number] = [152, 236], NK_AT: [number, number] = [262, 232];
const T12: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  if (f >= 112) return <AbsoluteFill style={{ background: '#000' }}>{f < 118 && <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: FONT.title, fontWeight: 800, fontSize: 150, letterSpacing: 14, color: '#e9ecea', transform: `translate(${Math.sin(f * 5) * 16}px, 0)` }}>RẦM!</div>}</AbsoluteFill>;
  if (f >= 74) {
    const k = f - 74, cold = k >= 12;
    return (
      <AbsoluteFill style={{ background: '#101716' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + 0.1 * seg(k, 0, 38)})`, transformOrigin: '960px 520px' }}>
          <Stage><StudentTwinHead identity="nguoi-kia" mood={cold ? 'calm' : 'neutral_smile'} view="front" blink={false} talk={talking(k, k > 14 && k < 34)} x={960} y={150} scale={4.6} /></Stage>
        </div>
        <Tint c="#0a2422" o={cold ? 0.6 : 0.15} />
        <Vignette k={cold ? 0.9 : 0.6} />
      </AbsoluteFill>
    );
  }
  const pt = placeOn('wide', TUNG_AT), pk = placeOn('wide', NK_AT), close = f >= 42;
  const tp = EXTRA_POSES['tung-xach-com'], gt = gripAt(tp, 'L'), take = seg(f, 12, 30);
  const tung = { at: TUNG_AT, render: () => <TungSoccer {...pt} mood={close ? 'focused' : 'normal'} blink={false} talk={talking(f, f < 36 || f > 46)} pose={{ ...tp, neck: close ? -6 : 0, view: 'three', facing: 1 }} /> };
  const nk = { at: NK_AT, render: () => <NguoiKia {...LOOK} {...pk} shirt={GREEN} mood="neutral_smile" face="vui-01" blink={false} pose={{ ...mixPose(STAND_POSE, EXTRA_POSES['nhan-do-tay-trai'], take), view: 'three', facing: -1 }} /> };
  const lens = close ? headLens(pt, 3.4, 20) : { cx: (pt.x + pk.x) / 2, cy: pt.y + 280 * pt.scale, z: 1.6 + 0.06 * seg(f, 0, 42) };
  return (
    <AbsoluteFill>
      <Camera lens={lens} f={g} hand={close ? 0.8 : 0.5}>
        <RoomScene night view="wide" chair="desk" door="open" phone="hidden" kitchen="clean" actors={[tung, nk]} />
        <Stage><g transform={`translate(${pt.x + gt.x * pt.scale} ${pt.y + gt.y * pt.scale + 26 * pt.scale}) scale(${pt.scale * 0.3})`}><BunCha /></g></Stage>
      </Camera>
      <Vignette k={0.6} />
    </AbsoluteFill>
  );
};

// ---------- T13: tựa phim và câu hỏi (58–60s) ----------
const CRACK = 'M180 430L420 390L560 458L760 370L930 426L1080 340L1240 418L1420 356L1600 430L1760 382';
const T13: React.FC<{ f: number }> = ({ f }) => {
  const crack = seg(f, 0, 6), title = seg(f, 4, 12), ask = seg(f, 16, 26), knock = heartbeat(f, 30, 9);
  return (
    <AbsoluteFill style={{ background: '#000', transform: `scale(${1 + 0.01 * knock})` }}>
      <Stage>
        <path d={CRACK} fill="none" stroke="#7ff6ef" strokeWidth={4} strokeDasharray={2200} strokeDashoffset={2200 * (1 - crack)} style={{ filter: 'drop-shadow(0 0 12px #4fe6e0)' }} />
        <path d="M760 370L790 300M1080 340L1060 270M1240 418L1270 480M560 458L540 510" fill="none" stroke="#7ff6ef" strokeWidth={2} opacity={crack} />
      </Stage>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 236, textAlign: 'center', fontFamily: FONT.title, color: '#e8fbf8', opacity: title }}>
        <div style={{ fontSize: 70, letterSpacing: 24, fontWeight: 700 }}>THE CRACK IN REALITY</div>
        <div style={{ fontSize: 38, letterSpacing: 8, marginTop: 200, color: '#9fe6df' }}>HỒ SƠ 02: NGƯỜI TRONG GƯƠNG</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: FONT.title, fontWeight: 700, fontSize: 38, lineHeight: 1.5, color: '#ff4a3c', opacity: ask, textShadow: '0 0 18px rgba(255,60,40,.55)' }}>
        NẾU CÓ MỘT BẢN SAO HOÀN HẢO HƠN CỦA BẠN XUẤT HIỆN…<br />LIỆU BẠN CÓ CÒN ĐỦ TƯ CÁCH ĐỂ TỒN TẠI?
      </div>
    </AbsoluteFill>
  );
};

/** Một frame của trailer, không phụ thuộc hook nên chụp tĩnh được. */
export const TrailerFrame: React.FC<{ g: number }> = ({ g }) => {
  const i = Math.max(0, T.findIndex((t, n) => g >= t && g < T[n + 1])), f = g - T[i];
  const shots = [<T01 f={f} />, <T02 f={f} g={g} />, <T03 f={f} g={g} />, <T04 f={f} g={g} />, <T05 f={f} g={g} />, <T06 f={f} g={g} />, <T07 f={f} g={g} />, <T08 f={f} />, <T09 f={f} />, <T10 f={f} />, <T11 f={f} />, <T12 f={f} g={g} />, <T13 f={f} />];
  const c = (n: number, a: number, b: number, who: string, text: string, tone?: 'warm' | 'cold') => <Caption key={`${n}-${a}`} f={g} from={T[n] + a} to={T[n] + b} who={who} tone={tone}>{text}</Caption>;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {shots[i]}
      {i < 12 && i !== 10 && <FilmLook f={g} total={T[13] + 400} />}
      <Letterbox />
      {c(0, 8, 64, 'NAM', 'Làm người lớn mệt mỏi vãi chưởng… Deadline dí, học lại, gia đình soi mói…')}
      {c(0, 66, 118, 'NAM', 'Ước gì cứ nằm một chỗ chơi game ăn mì tôm cả đời!')}
      {c(1, 90, 118, 'NAM', 'Mày… mày là ai?!')}
      {c(1, 120, 150, 'NGƯỜI KIA', 'Tao tên Nam.', 'cold')}
      {c(2, 24, 70, 'NAM', 'Phòng này tao là nóc nhà! Mày làm thuê thì biết điều, cấm đụng vào đồ tao!')}
      {c(2, 76, 120, 'NAM', 'Có thằng hầu hạ nhàn vãi chưởng!')}
      {c(2, 122, 152, 'NGƯỜI KIA · THÌ THẦM', 'Mày ngại thuyết trình Lab 402 đúng không? Để tao lên nói cho.', 'cold')}
      {c(2, 154, 180, 'NAM', 'Lên lấy điểm A hộ tao rồi lượn lẹ nhé!')}
      {c(3, 108, 156, 'TÙNG', 'Nay phòng sạch bong, bài nộp trước hạn, mai mặt trời mọc đằng tây à?')}
      {c(3, 160, 208, 'BÁC HAI', 'Cả họ xem thằng Nam nay chững chạc chưa này!')}
      {c(5, 10, 80, 'NAM', 'Ê mày, rốt cuộc mày từ đâu chui ra đấy? Đừng bảo là clone trốn trại nhé?')}
      {c(5, 90, 150, 'NGƯỜI KIA', 'Mày thấy mệt thì cứ nằm đây nghỉ đi… Cuộc đời ngoài kia, để tao sống thay cho.', 'cold')}
      {c(6, 36, 78, 'SINH VIÊN', '“Ủa, nay Nam bị lag mạng à?” — “Hôm trước xài hết mana rồi à?”')}
      {c(6, 84, 128, 'GIẢNG VIÊN', 'Trừ 2 điểm chuyên cần cả nhóm!')}
      {c(6, 134, 180, 'TÙNG', 'Đang phong độ tốt tự dưng thụt lùi, làm cả nhóm bị trừ điểm oan là sao?!')}
      {c(7, 84, 150, 'NAM', 'Nếu nó làm mọi thứ tốt hơn mình… thì mình là cái thứ gì đang đứng ở đây?!')}
      {c(8, 8, 90, 'NAM', 'Nó là Người Trong Gương! Tao sẽ đập nát cái gương này!')}
      {c(8, 96, 150, 'NGƯỜI KIA', 'Mày đập gương rồi định lấy cái thân xác ăn hại này ra làm khổ họ tiếp à?', 'cold')}
      {c(9, 44, 88, 'NAM', 'Không… cứu…!')}
      {c(11, 2, 40, 'TÙNG', 'Nam ơi, ăn bún chả đi rồi tối tao kèm lại bài cho!')}
      {c(11, 44, 74, 'TÙNG', 'Ủa Nam… nốt ruồi bên mắt mày… sao nay lại nằm bên phải?')}
      {c(11, 86, 112, 'NGƯỜI TRONG GƯƠNG', 'Mày nhìn nhầm rồi… Tao mới là Nam thật.', 'cold')}
      <div style={{ position: 'absolute', right: 26, top: BAR + 14, fontFamily: FONT.title, fontSize: 16, letterSpacing: 2, color: 'rgba(255,255,255,.45)' }}>TRAILER · BẢN DỰNG THỬ · CÂM</div>
    </AbsoluteFill>
  );
};
export const HoSo02Trailer: React.FC = () => <TrailerFrame g={useCurrentFrame()} />;
