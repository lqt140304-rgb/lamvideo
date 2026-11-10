import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { FONT } from '../../engine/fonts';
import { JointPose, Light, mixPose, NamMood, NguoiKia, PALETTE, solveRig, STAND_POSE, StudentTwinBody, StudentTwinHead, Talk, turnAt, TWIN_POSES, View } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { lightFor, placeOn, RoomScene, RoomView } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';

/**
 * Hồ sơ 2 — demo animatic Cảnh 1 (MAY-A, A01–A05), bản câm: phụ đề tạm thay giọng, chưa có âm.
 * Nguồn lời: episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/THAO-LUAN-CANH.md; góc máy: DUNG-CANH.md#may-a.
 * Cận cảnh là phóng khung trên cùng camera của phòng (tiến cận giả lập), không phải lens thật.
 */
export const CANH01_TOTAL = 1170;

const SLEEP = PALETTE.nam.sleepShirt;
const SINK: [number, number] = [94, 92];
const SEAT: [number, number] = [276, 240]; // hông trên mép nệm phía cửa, chân chạm sàn
const STANDUP: [number, number] = [244, 222]; // đứng dậy, ghế (SEATS.bed) ngay trước đầu gối
const NEAR: [number, number] = [262, 360]; // khoá xếp lớp: Nam vẽ sau khối nệm/ghế, vì nệm được xếp theo tâm
const PHONE: [number, number][] = [[282, 256], [289, 256], [289, 270], [282, 270]];

// Ánh sáng duyệt: hướng theo cửa sổ qua camera của shot, viền ấm, nét mảnh 0.65.
const lit = (view: RoomView, at: [number, number]): Light => ({ rim: 0.45, amount: 0.42, depth: 24, line: 0.65, ...lightFor(view, at) });

const ease = Easing.inOut(Easing.cubic);
const seg = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
const TALK = ['a', 'closed', 'o', 'e', 'closed', 'u', 'a', 'closed'] as const;
const talkAt = (f: number, from: number, to: number): Talk | undefined => (f >= from && f < to ? { shape: TALK[Math.floor((f - from) / 4) % TALK.length], open: 0.7 } : undefined);
const blinkAt = (f: number, seed = 0) => (f + seed) % 84 < 3;

// Ngồi mép nệm thấp (24 cm): đùi hơi dốc lên, cẳng chân thẳng xuống sàn.
const LOWSIT: JointPose = { ...STAND_POSE, tilt: 8, neck: -2, armR: { a: 22, b: 46 }, armL: { a: 10, b: 58, rot: -1 }, legR: { a: 96, b: 110 }, legL: { a: 88, b: 98 } };
const RUB: JointPose = { ...LOWSIT, armR: { a: -114, b: 121, rot: -1 }, wristR: -40, handR: 'fist', frontR: true };
const RUB_SIDE: JointPose = { ...LOWSIT, armR: { a: 84, b: 122 }, wristR: -40, handR: 'fist', frontR: true }; // nhìn nghiêng: tay đưa lên mặt về phía trước, không lộn ra sau lưng
const TOUCH: JointPose = { ...RUB, wristR: -55, handR: 'open' };
const REACH: JointPose = { ...LOWSIT, tilt: 2, armR: { a: -34, b: 12 }, handR: 'open' };
const GRAB: JointPose = { ...REACH, handR: 'phone', prop: 'phone' };
const HOLD: JointPose = { ...STAND_POSE, tilt: -4, neck: 4, armR: { a: -70, b: 95 }, handR: 'phone', prop: 'phone', frontR: true, armL: { a: 6, b: 14, rot: -1 }, handL: 'open', legR: { a: 8, b: 10 }, legL: { a: -8, b: 6 } };
const SEAT_DY = solveRig(LOWSIT).dy;

type Lens = { cx: number; cy: number; z: number };
const clampLens = ({ cx, cy, z }: Lens): Lens => ({ z, cx: Math.min(1920 - 960 / z, Math.max(960 / z, cx)), cy: Math.min(1080 - 540 / z, Math.max(540 / z, cy)) });
const Camera: React.FC<{ lens: Lens; shake?: number; children: React.ReactNode }> = ({ lens, shake = 0, children }) => {
  const l = clampLens(lens);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#d9cfb9' }}>
      <div style={{ position: 'absolute', width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${960 - l.cx * l.z + shake}px, ${540 - l.cy * l.z}px) scale(${l.z})` }}>{children}</div>
    </AbsoluteFill>
  );
};

// Đầu Nam nằm trên gối (đầu hướng tường phải); `cover` 0–1 kéo chăn trùm qua đầu.
const Sleeper = (cover: number, breath = 0) => (p: { x: number; y: number; scale: number }) => (
  <g>
    {/* Vai và cổ áo ngủ nằm dưới đầu: thân nằm dọc theo nệm (đầu phải, chân trái), hai vai vắt ngang gối; chăn vẽ sau che phần dưới. */}
    <g transform={`translate(${p.x} ${p.y}) scale(${p.scale})`} stroke="#40443f" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
      {/* hai vai gồ lên khỏi mép chăn, cổ áo sát đầu; chăn kéo lên tới nách ở phía chân */}
      <path d="M 38 -26 Q 24 -96 -34 -104 Q -90 -108 -124 -60 Q -142 -20 -130 34 Q -90 56 -50 52 Q 14 50 44 18 Z" fill={SLEEP} />
      <path d="M 30 -30 Q 8 -8 28 18" fill="none" strokeWidth={3} />
      <path d="M -40 -98 Q -20 -60 -52 -30" fill="none" strokeWidth={2.5} />
    </g>
    <g transform={`rotate(80 ${p.x} ${p.y})`}>
      <StudentTwinHead mood="sleepy" blink view="three" facing={-1} id="a01-sleeper" x={p.x} y={p.y - 85 * p.scale} scale={p.scale} />
    </g>
    {cover > 0 && (
      <g transform={`translate(0 ${breath * p.scale})`}>
        <path transform={`translate(${p.x - (1 - cover) * 150 * p.scale} ${p.y}) scale(${p.scale})`} d="M -150 40 Q -170 -40 -60 -80 Q 40 -110 110 -60 Q 150 -20 120 50 Q 40 80 -150 40 Z" fill="#68877f" stroke="#40443f" strokeWidth={4} />
        {/* nếp chăn mới kéo lên và bàn tay nắm mép chăn (chỉ thấy lúc đang kéo) */}
        <path transform={`translate(${p.x - (1 - cover) * 150 * p.scale} ${p.y}) scale(${p.scale})`} d="M -90 -40 Q -10 -62 70 -34 M -120 10 Q -20 -10 90 8" fill="none" stroke="#4e6c64" strokeWidth={3} strokeLinecap="round" />
        {cover < 1 && (
          <g transform={`translate(${p.x + (150 * cover - 150 + 112) * p.scale} ${p.y - 54 * p.scale}) scale(${p.scale})`} stroke="#40443f" strokeWidth={4} strokeLinejoin="round">
            <path d="M -30 -6 Q -14 -20 -4 -14 L 0 14 Q -14 22 -30 16 Z" fill={SLEEP} />
            <path d="M -6 -16 Q 26 -18 34 -2 Q 38 16 24 24 Q 8 30 -4 16 Z" fill={PALETTE.skin} />
            <path d="M 10 -10 Q 14 4 8 18 M 22 -6 Q 26 6 20 20" fill="none" strokeWidth={2.5} />
          </g>
        )}
      </g>
    )}
  </g>
);

const PhoneOnMat: React.FC<{ view: RoomView }> = ({ view }) => {
  const pts = PHONE.map((c) => placeOn(view, c, 24.6));
  return <path d={`M${pts.map((q) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join('L')}Z`} fill="#3a4a47" stroke="#282b2b" strokeWidth={2} strokeLinejoin="round" />;
};

// Màn báo thức sáng trên điện thoại cạnh gối (phone="mat" của phòng, tâm khoảng [392, 367]).
const AlarmGlow: React.FC<{ view: RoomView; on: boolean; f: number }> = ({ view, on, f }) => {
  if (!on) return null;
  const p = placeOn(view, [392.5, 367.5], 25.5);
  const k = p.scale / 0.3;
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin(f / 5));
  return (
    <g>
      <ellipse cx={p.x} cy={p.y} rx={34 * k} ry={14 * k} fill="#fff3c4" opacity={0.35 * pulse} />
      <ellipse cx={p.x} cy={p.y} rx={12 * k} ry={5 * k} fill="#fffbe6" opacity={0.9} />
    </g>
  );
};

type Cue = { from: number; to: number; who?: string; text: string; sfx?: boolean };
const CUES: Cue[] = [
  { from: 10, to: 175, text: 'báo thức reo · nước chảy · chén va nhau', sfx: true },
  { from: 190, to: 240, text: 'màn hình: “7 giờ — đi học”', sfx: true },
  { from: 285, to: 372, who: 'NAM (ngái ngủ, càu nhàu)', text: 'Tùng, nhẹ tay chút coi. Tao đang ngủ.' },
  { from: 375, to: 400, text: 'tiếng nước ngừng · không ai đáp', sfx: true },
  { from: 440, to: 500, who: 'NAM (bực, chưa nhìn rõ mặt)', text: 'Ê, áo đó của tao…' },
  { from: 662, to: 722, text: 'không ai bước vào · chỉ còn tiếng quạt', sfx: true },
  { from: 872, to: 932, who: 'NAM (ngập ngừng)', text: 'Tùng thuê mày hù tao hả?' },
  { from: 940, to: 1018, who: 'NGƯỜI KIA (bình thường)', text: 'Không. Tao thấy chén chưa rửa nên làm luôn.' },
  { from: 1018, to: 1046, text: 'đúng giọng Nam', sfx: true },
  { from: 1098, to: 1130, text: 'đầu gối va ghế', sfx: true },
];

const SHOTS: { from: number; code: string; label: string }[] = [
  { from: 0, code: 'A01', label: 'toàn phòng · 35 mm' },
  { from: 180, code: 'A02', label: 'cận báo thức · 65 mm' },
  { from: 400, code: 'A03', label: 'trung cận Nam · 50 mm' },
  { from: 560, code: 'A04', label: 'cận mặt người kia · 65 mm' },
  { from: 650, code: 'A04B', label: 'lặp A03 · 50 mm' },
  { from: 830, code: 'A05', label: 'trung rộng nệm và ghế · 35 mm' },
];

const Overlay: React.FC<{ f: number }> = ({ f }) => {
  const shot = [...SHOTS].reverse().find((s) => f >= s.from)!;
  const cue = CUES.find((c) => f >= c.from && f < c.to);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 36, top: 28, fontFamily: FONT.ui, fontSize: 24, color: '#f6efe3', background: 'rgba(28,36,32,.62)', padding: '8px 14px', borderRadius: 10 }}>
        {shot.code} · {shot.label}
      </div>
      <div style={{ position: 'absolute', right: 36, top: 28, fontFamily: FONT.ui, fontSize: 20, color: '#f6efe3', background: 'rgba(28,36,32,.5)', padding: '8px 14px', borderRadius: 10 }}>
        HỒ SƠ 2 · CẢNH 1 · ANIMATIC CÂM, PHỤ ĐỀ TẠM
      </div>
      {cue && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 56, display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: 1400, textAlign: 'center', background: 'rgba(20,26,24,.72)', borderRadius: 14, padding: '14px 28px', color: '#fbf6ec', fontFamily: FONT.title }}>
            {cue.who && <div style={{ fontFamily: FONT.ui, fontSize: 22, opacity: 0.75, marginBottom: 6 }}>{cue.who}</div>}
            <div style={{ fontSize: cue.sfx ? 34 : 46, fontStyle: cue.sfx ? 'italic' : 'normal', fontWeight: cue.sfx ? 400 : 600 }}>{cue.sfx ? `[${cue.text}]` : cue.text}</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// Người kia ở bồn rửa, quay lưng; tay rửa chén nhịp nhẹ tới khi nước ngừng.
const washer = (f: number, view: RoomView) => {
  const w = f < 375 ? Math.sin(f / 6) : 0;
  return { at: SINK, render: (p: { x: number; y: number; scale: number }) => <NguoiKia {...p} light={lit(view, SINK)} mood="calm" pose={{ ...TWIN_POSES.holdBowl, view: 'back', tilt: 3 + 2 * w, armR: { a: 20 + 8 * w, b: 75 }, armL: { a: 14 - 8 * w, b: 100, rot: -1 } }} /> };
};

// Nam ngồi mép nệm / đứng dậy, cùng cách tính cho mọi view.
const namActor = (view: RoomView, o: { pose: JointPose; at: [number, number]; rise?: number; mood: NamMood; look: { view: View; facing: 1 | -1 }; talk?: Talk; blink?: boolean }) => ({
  at: NEAR,
  render: () => {
    const p = placeOn(view, o.at);
    return <StudentTwinBody x={p.x} y={p.y + (o.rise ?? 0) * p.scale} scale={p.scale} light={lit(view, o.at)} shirt={SLEEP} mood={o.mood} pose={{ ...o.pose, view: o.look.view, facing: o.look.facing }} talk={o.talk} blink={o.blink} />;
  },
});

const A01: React.FC<{ f: number }> = ({ f }) => (
  <Camera lens={{ cx: 960, cy: 540, z: 1 }}>
    <RoomScene view="wide" door="ajar" chair="bed" sleeper={Sleeper(0)} actors={[washer(f, 'wide')]}>
      <AlarmGlow view="wide" on f={f} />
    </RoomScene>
  </Camera>
);

const A02: React.FC<{ f: number }> = ({ f }) => {
  const head = placeOn('wide', [424, 332], 33);
  const lens = { cx: head.x - 40, cy: head.y + 40, z: 2.6 + 0.15 * seg(f, 180, 400) };
  // Tay thò ra khỏi chăn tắt chuông (f226–236), kéo điện thoại vào trong chăn (f238–252) rồi rụt về.
  const reach = seg(f, 206, 226) * (1 - seg(f, 246, 256));
  const drag = seg(f, 237, 249);
  const dx = -22 * drag, dz = -12 * drag;
  const phoneOpacity = 1 - seg(f, 243, 249);
  const corners: [number, number][] = [[388 + dx, 362 + dz], [397 + dx, 362 + dz], [397 + dx, 373 + dz], [388 + dx, 373 + dz]];
  const pq = corners.map((c) => placeOn('wide', c, 24.6));
  const hand = placeOn('wide', [392.5 + dx, 367.5 + dz], 26);
  const shoulder = placeOn('wide', [338, 350], 28);
  const k = hand.scale / 0.3;
  const hx = shoulder.x + (hand.x - shoulder.x) * reach, hy = shoulder.y + (hand.y - shoulder.y) * reach;
  const ex = (shoulder.x + hx) / 2, ey = Math.min(shoulder.y, hy) - 14 * k * reach;
  const press = f >= 226 && f < 236 ? 1.5 * k : 0;
  return (
    <Camera lens={lens}>
      <RoomScene view="wide" door="ajar" chair="bed" phone="hidden" sleeper={Sleeper(seg(f, 250, 268), f > 268 ? Math.sin(f / 15) * 4 : 0)} actors={[washer(f, 'wide')]}>
        <path d={`M${pq.map((q) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join('L')}Z`} fill="#3a4a47" stroke="#282b2b" strokeWidth={2} strokeLinejoin="round" opacity={phoneOpacity} />
        <AlarmGlow view="wide" on={f < 236} f={f} />
        {reach > 0.02 && (
          <g strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d={`M${shoulder.x} ${shoulder.y} Q${ex} ${ey} ${hx} ${hy + press}`} stroke="#40443f" strokeWidth={46 * k} />
            <path d={`M${shoulder.x} ${shoulder.y} Q${ex} ${ey} ${hx} ${hy + press}`} stroke={SLEEP} strokeWidth={36 * k} />
            <circle cx={hx} cy={hy + press} r={17 * k} fill={PALETTE.skin} stroke="#40443f" strokeWidth={3 * k} />
          </g>
        )}
      </RoomScene>
    </Camera>
  );
};

const seatLens = (zoom: number): Lens => {
  const p = placeOn('bed', SEAT);
  return { cx: p.x - 160 * p.scale, cy: p.y + (190 + SEAT_DY) * p.scale, z: zoom };
};

// A03 / A04B: trung cận Nam ngồi mép nệm, nhìn về bếp (3/4 trái) hoặc ra cửa (nghiêng trái).
const NamClose: React.FC<{ f: number; start: number }> = ({ f, start }) => {
  const a03 = start === 400;
  const rise = a03 ? 260 * (1 - seg(f, 400, 416)) : 0;
  let mood: NamMood = a03 ? (f < 492 ? 'annoyed' : 'shocked') : 'shocked';
  let pose = LOWSIT;
  let look: { view: View; facing: 1 | -1 } = { view: 'three', facing: -1 };
  if (!a03) {
    look = f < 655 ? look : f < 760 ? turnAt({ view: 'three', facing: -1 }, { view: 'side', facing: -1 }, seg(f, 655, 663)) : turnAt({ view: 'side', facing: -1 }, { view: 'three', facing: -1 }, seg(f, 760, 768));
    const rub = seg(f, 724, 734) * (1 - seg(f, 752, 762));
    pose = mixPose(LOWSIT, { ...RUB_SIDE, wristR: RUB_SIDE.wristR + 10 * Math.sin(f / 2.5) }, rub);
    mood = f < 724 ? 'shocked' : f < 762 ? 'hesitant' : 'shocked';
  }
  return (
    <Camera lens={seatLens(1.95)}>
      <RoomScene view="bed" door="ajar" chair="bed" phone="hidden" actors={[{ at: [300, 300], render: () => <PhoneOnMat view="bed" /> }, namActor('bed', { pose, at: SEAT, rise, mood, look, talk: talkAt(f, 440, 492), blink: f > 500 ? false : blinkAt(f) })]} />
    </Camera>
  );
};

const A04: React.FC<{ f: number }> = ({ f }) => {
  const p = placeOn('kitchen', SINK);
  const look = turnAt({ view: 'quarter', facing: 1 }, { view: 'three', facing: 1 }, seg(f, 560, 570));
  return (
    <Camera lens={{ cx: p.x + 40 * p.scale, cy: p.y + 150 * p.scale, z: 1.55 }}>
      <RoomScene view="kitchen" door="ajar" chair="bed" actors={[{ at: SINK, render: (q) => <NguoiKia {...q} light={lit('kitchen', SINK)} mood="calm" blink={blinkAt(f, 30)} pose={{ ...TWIN_POSES.holdBowl, view: look.view, facing: look.facing }} /> }]} />
    </Camera>
  );
};

const A05: React.FC<{ f: number }> = ({ f }) => {
  const touch = seg(f, 832, 846) * (1 - seg(f, 862, 874));
  const reach = seg(f, 1046, 1056) * (1 - seg(f, 1058, 1064)); // quơ trượt
  const grab = seg(f, 1066, 1076);
  const up = seg(f, 1080, 1098);
  let pose = mixPose(LOWSIT, TOUCH, touch);
  if (f >= 1044) pose = mixPose(LOWSIT, REACH, reach);
  if (f >= 1064) pose = mixPose(LOWSIT, GRAB, grab);
  if (f >= 1078) pose = mixPose(GRAB, HOLD, up);
  const at: [number, number] = [SEAT[0] + (STANDUP[0] - SEAT[0]) * up, SEAT[1] + (STANDUP[1] - SEAT[1]) * up];
  const mood: NamMood = f < 870 ? 'shocked' : f < 1018 ? 'hesitant' : f < 1080 ? 'shocked' : 'scared';
  const shake = f >= 1098 && f < 1103 ? (f % 2 ? 3 : -3) : 0; // xung 3 px, tắt trong 0,15 giây
  return (
    <Camera lens={{ cx: 600, cy: 640, z: 1.3 }} shake={shake}>
      <RoomScene view="bed" door="ajar" chair="bed" phone="hidden" actors={[...(f < 1068 ? [{ at: [300, 300] as [number, number], render: () => <PhoneOnMat view="bed" /> }] : []), namActor('bed', { pose, at, mood, look: { view: 'three', facing: -1 }, talk: talkAt(f, 874, 926), blink: f > 1018 ? false : blinkAt(f) })]} />
    </Camera>
  );
};

// Thử ánh sáng nhân vật trong phòng: mỗi frame một mức để so (0–2 góc nệm, 3–5 góc bếp).
const MORNING: Partial<Light> = { rim: 0.45, amount: 0.42, depth: 24 }; // hướng lấy từ lightFor theo vị trí người và cửa sổ
const LIGHT_STEPS: { label: string; light?: Light }[] = [
  { label: 'HIỆN TẠI — PHẲNG' },
  { label: 'CÓ KHỐI + BÓNG TIẾP ĐẤT (NÉT GIỮ)' },
  { label: 'CÓ KHỐI + BÓNG + NÉT MẢNH 0.65' },
];
LIGHT_STEPS[1].light = MORNING as Light;
LIGHT_STEPS[2].light = { ...MORNING, line: 0.65 } as Light;
export const LIGHT_TEST_TOTAL = 6;
export const HoSo02AnhSangThu: React.FC = () => {
  const f = useCurrentFrame();
  const step = LIGHT_STEPS[f % 3];
  const bed = f < 3;
  const p = placeOn(bed ? 'bed' : 'kitchen', bed ? STANDUP : SINK);
  return (
    <AbsoluteFill>
      {bed ? (
        <Camera lens={{ cx: 600, cy: 640, z: 1.3 }}>
          <RoomScene view="bed" door="ajar" chair="bed" phone="hidden" actors={[{ at: NEAR, render: () => <StudentTwinBody x={p.x} y={p.y} scale={p.scale} shirt={SLEEP} mood="scared" light={step.light && { ...step.light, ...lightFor('bed', STANDUP) }} pose={{ ...HOLD, view: 'three', facing: -1 }} /> }]} />
        </Camera>
      ) : (
        <Camera lens={{ cx: p.x + 40 * p.scale, cy: p.y + 230 * p.scale, z: 1.15 }}>
          <RoomScene view="kitchen" door="ajar" chair="bed" actors={[{ at: SINK, render: (q) => <NguoiKia {...q} mood="calm" light={step.light && { ...step.light, ...lightFor('kitchen', SINK) }} pose={{ ...TWIN_POSES.holdBowl, view: 'three', facing: 1 }} /> }]} />
        </Camera>
      )}
      <div style={{ position: 'absolute', left: 36, top: 28, fontFamily: FONT.ui, fontSize: 28, color: '#f6efe3', background: 'rgba(28,36,32,.7)', padding: '10px 16px', borderRadius: 10 }}>{step.label}</div>
    </AbsoluteFill>
  );
};

export const HoSo02Canh01Demo: React.FC = () => {
  const f = useCurrentFrame();
  const shot = f < 180 ? <A01 f={f} /> : f < 400 ? <A02 f={f} /> : f < 560 ? <NamClose f={f} start={400} /> : f < 650 ? <A04 f={f} /> : f < 830 ? <NamClose f={f} start={650} /> : <A05 f={f} />;
  return (
    <AbsoluteFill style={{ background: '#d9cfb9' }}>
      {shot}
      <Overlay f={f} />
    </AbsoluteFill>
  );
};
