import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { FONT } from '../../engine/fonts';
import { JointPose, Light, mixPose, NamMood, NguoiKia, PALETTE, solveRig, STAND_POSE, StudentTwinBody, StudentTwinHead, Talk, turnAt, TWIN_POSES, View } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import type { FaceKey } from '../../../library/expressions/cartoon-soft/net-mat';
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
const STANDUP: [number, number] = [236, 212]; // đứng dậy sát ghế (SEATS.bed): đầu gối chạm mép mặt ghế lúc bật dậy
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
const LOWSIT: JointPose = TWIN_POSES.sitLow; // ngồi mép nệm thấp, gối cao hơn hông
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
const HEAD_AT: [number, number] = [150, -40]; // đỉnh đầu so với điểm neo gối, đơn vị rig
const LIE_ROT = 87; // trục người dọc mép nệm ở góc wide
const PHONE_RIG = { x: 92, y: 168 }; // điện thoại trên nệm trước mặt (khung rig chưa xoay; +x là phía máy quay)
const BLANKET_REST = 232; // mép chăn lúc ngủ: ngang ngực dưới nách (đơn vị rig, 0 = đỉnh đầu)
const BLANKET_OVER = -46; // trùm qua đỉnh đầu
type SleepState = { cover?: number; breath?: number; reach?: number; carry?: number; phone?: boolean; alarm?: boolean; f?: number };
/**
 * Nam nằm nghiêng bằng rig (TWIN_POSES.lie) xoay quanh đỉnh đầu, cùng một tấm chăn vẽ trong cùng khung xoay nên luôn ôm theo người.
 * `cover` 0–1 kéo mép chăn từ ngực lên trùm đầu; `reach` 0–1 với tay tới điện thoại; `carry` 0–1 tay kéo điện thoại về vào chăn.
 * Điện thoại đặt đúng chỗ bàn tay chạm khi với hết tay, nên tay và máy luôn khớp.
 */
const Sleeper = ({ cover = 0, breath = 0, reach = 0, carry = 0, phone = true, alarm = false, f = 0 }: SleepState) => (p: { x: number; y: number; scale: number; plug?: [number, number] }) => {
  const r = solveRig(TWIN_POSES.lie);
  const hx = p.x + HEAD_AT[0] * p.scale, hy = p.y + HEAD_AT[1] * p.scale;
  // Tay với: rig chỉ xoay phẳng nên tay rig giơ ra sẽ nhấc khỏi nệm; vẽ cánh tay riêng từ đúng khớp vai, bám mặt nệm tới điện thoại.
  const sh = { x: r.armR.root.x, y: r.armR.root.y };
  const rest = { x: sh.x + 40, y: sh.y + 150 };
  const ease = (t: number) => t * t * (3 - 2 * t);
  const t = ease(Math.max(reach, 0));
  const hand = { x: rest.x + (PHONE_RIG.x - rest.x) * t, y: rest.y + (PHONE_RIG.y - rest.y) * t };
  const elbow = { x: (sh.x + hand.x) / 2 + 34 * t, y: (sh.y + hand.y) / 2 + 30 };
  const ph = carry > 0 ? { x: PHONE_RIG.x + (rest.x - PHONE_RIG.x) * ease(carry), y: PHONE_RIG.y + (rest.y - PHONE_RIG.y) * ease(carry) } : PHONE_RIG;
  const edge = BLANKET_REST + (BLANKET_OVER - BLANKET_REST) * cover;
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin(f / 5));
  // Điểm khung rig (chưa xoay) → toạ độ màn hình, để nối cáp sạc tới ổ cắm trên tường.
  const rad = (LIE_ROT * Math.PI) / 180;
  const toScreen = (q: { x: number; y: number }) => ({ x: hx + (q.x * Math.cos(rad) - q.y * Math.sin(rad)) * p.scale, y: hy + (q.x * Math.sin(rad) + q.y * Math.cos(rad)) * p.scale });
  const phS = toScreen(ph);
  // Ánh sáng cửa sổ của góc wide, xoay ngược về khung thân nằm; tắt bóng tiếp đất vì người đang nằm trên nệm.
  const L = lit('wide', [400, 332]);
  const light: Light = { ...L, x: L.x * Math.cos(rad) + L.y * Math.sin(rad), y: -L.x * Math.sin(rad) + L.y * Math.cos(rad), ground: 0 };
  const rigGroup = (children: React.ReactNode) => <g transform={`rotate(${LIE_ROT} ${hx} ${hy}) translate(${hx} ${hy}) scale(${p.scale})`} stroke="#40443f" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">{children}</g>;
  return (
    <g>
      <g transform={`rotate(${LIE_ROT} ${hx} ${hy})`}>
        <g transform={`translate(0 ${-r.dy * p.scale})`}>
          <StudentTwinBody x={hx} y={hy} scale={p.scale} shirt={SLEEP} mood="sleepy" blink light={light} pose={{ ...TWIN_POSES.lie, view: 'three', facing: 1 }} />
        </g>
      </g>
      {/* Cáp sạc: từ điện thoại ra ổ cắm; lúc máy bị kéo vào chăn thì cáp chui theo dưới mép chăn. */}
      {phone && p.plug && <path d={`M ${phS.x} ${phS.y} Q ${(phS.x + p.plug[0]) / 2} ${Math.max(phS.y, p.plug[1]) + 18 * p.scale / 0.3} ${p.plug[0]} ${p.plug[1]}`} fill="none" stroke="#55655d" strokeWidth={2 * p.scale / 0.3} strokeLinecap="round" />}
      {rigGroup(
        <>
          {phone && (
            <g transform={`translate(${ph.x} ${ph.y})`} opacity={1 - carry}>
              {alarm && <ellipse cx={0} cy={0} rx={40} ry={74} fill="#fff3c4" opacity={0.35 * pulse} stroke="none" />}
              <rect x={-16} y={-26} width={32} height={52} rx={6} fill="#3a4a47" />
              {alarm && <rect x={-11} y={-20} width={22} height={38} rx={3} fill="#fffbe6" stroke="none" />}
            </g>
          )}
          {/* Một tấm chăn: phủ từ mép `edge` tới quá bàn chân; dải tối phía máy quay là bề dày chăn rủ xuống mặt nệm. */}
          <g transform={`translate(${breath} 0)`}>
            <path d={`M -88 ${edge + 6} Q 20 ${edge - 22} 132 ${edge + 4} Q 168 ${edge + 90} 178 380 Q 200 580 176 694 Q 30 716 -90 690 Q -112 540 -98 360 Q -100 ${edge + 70} -88 ${edge + 6} Z`} fill="#5b7870" />
            <path d={`M -88 ${edge + 6} Q 20 ${edge - 22} 132 ${edge + 4} Q 156 ${edge + 90} 150 380 Q 168 580 150 676 Q 30 700 -90 690 Q -112 540 -98 360 Q -100 ${edge + 70} -88 ${edge + 6} Z`} fill="#68877f" />
            <path d={`M 150 ${Math.max(edge + 60, 300)} Q 162 360 160 420 M 158 520 Q 168 600 156 660`} fill="none" stroke="#4e6c64" strokeWidth={3} />
            <path d={`M -70 ${edge + 30} Q 20 ${edge + 8} 120 ${edge + 30}`} fill="none" stroke="#8aa69f" strokeWidth={5} />
            <path d={`M 60 ${Math.max(edge + 90, 260)} Q 100 420 64 590 M -40 ${Math.max(edge + 120, 300)} Q -6 460 -46 610`} fill="none" stroke="#4e6c64" strokeWidth={3.5} />
            {reach > 0.01 && (
              <g>
                <path d={`M ${sh.x} ${sh.y} Q ${elbow.x} ${elbow.y} ${hand.x} ${hand.y}`} fill="none" stroke="#40443f" strokeWidth={44} />
                <path d={`M ${sh.x} ${sh.y} Q ${elbow.x} ${elbow.y} ${hand.x} ${hand.y}`} fill="none" stroke={PALETTE.skin} strokeWidth={36} />
                <path d={`M ${sh.x} ${sh.y} L ${sh.x + (elbow.x - sh.x) * 0.55} ${sh.y + (elbow.y - sh.y) * 0.55}`} fill="none" stroke={SLEEP} strokeWidth={50} />
                <circle cx={hand.x} cy={hand.y} r={22} fill={PALETTE.skin} />
              </g>
            )}
            {cover > 0 && cover < 1 && (
              <path d={`M 52 ${edge - 22} Q 82 ${edge - 30} 96 ${edge - 8} Q 100 ${edge + 16} 80 ${edge + 22} Q 60 ${edge + 26} 50 ${edge + 6} Z M 68 ${edge - 20} Q 66 ${edge} 72 ${edge + 20} M 84 ${edge - 18} Q 82 ${edge} 88 ${edge + 16}`} fill={PALETTE.skin} />
            )}
          </g>
        </>,
      )}
    </g>
  );
};

const PhoneOnMat: React.FC<{ view: RoomView }> = ({ view }) => {
  const pts = PHONE.map((c) => placeOn(view, c, 24.6));
  return <path d={`M${pts.map((q) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join('L')}Z`} fill="#3a4a47" stroke="#282b2b" strokeWidth={2} strokeLinejoin="round" />;
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
// Nét mặt theo mốc frame; mỗi lần đổi chuyển dần trong 4 frame (mặt cũ mờ dần, mặt mới hiện dần).
type FaceCue = { face: FaceKey; faceFrom?: FaceKey; faceMix: number };
const faceAt = (f: number, steps: [number, FaceKey][], dur = 4): FaceCue => {
  let i = 0;
  while (i + 1 < steps.length && f >= steps[i + 1][0]) i++;
  return { face: steps[i][1], faceFrom: i > 0 ? steps[i - 1][1] : undefined, faceMix: i > 0 ? Math.min(1, (f - steps[i][0]) / dur) : 1 };
};

const namActor = (view: RoomView, o: { pose: JointPose; at: [number, number]; rise?: number; mood: NamMood; face?: FaceCue; look: { view: View; facing: 1 | -1 }; talk?: Talk; blink?: boolean }) => ({
  at: NEAR,
  render: () => {
    const p = placeOn(view, o.at);
    return <StudentTwinBody x={p.x} y={p.y + (o.rise ?? 0) * p.scale} scale={p.scale} light={lit(view, o.at)} shirt={SLEEP} mood={o.mood} {...o.face} pose={{ ...o.pose, view: o.look.view, facing: o.look.facing }} talk={o.talk} blink={o.blink} />;
  },
});

const A01: React.FC<{ f: number }> = ({ f }) => (
  <Camera lens={{ cx: 960, cy: 540, z: 1 }}>
    <RoomScene view="wide" door="ajar" chair="bed" phone="hidden" sleeper={Sleeper({ alarm: true, f })} actors={[washer(f, 'wide')]} />
  </Camera>
);

const A02: React.FC<{ f: number }> = ({ f }) => {
  const head = placeOn('wide', [424, 332], 33);
  const lens = { cx: head.x - 40, cy: head.y + 40, z: 2.6 + 0.15 * seg(f, 180, 400) };
  // Tay thò khỏi chăn với điện thoại trên đầu nệm, tắt chuông (f226–236), kéo máy về vào chăn (f238–252), rồi kéo chăn trùm đầu.
  const reach = seg(f, 206, 226) * (1 - seg(f, 238, 254));
  const carry = seg(f, 240, 252);
  return (
    <Camera lens={lens}>
      <RoomScene view="wide" door="ajar" chair="bed" phone="hidden" sleeper={Sleeper({ cover: seg(f, 254, 272), breath: f > 272 ? Math.sin(f / 15) * 5 : 0, reach, carry, alarm: f < 236, f })} actors={[washer(f, 'wide')]} />
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
  // Nét mặt phân mức (chỉ hiện ở 3/4; lúc quay nghiêng ra cửa dùng `mood`): bực nhẹ → kinh ngạc → sững lại; A04B: bất an.
  const face = faceAt(f, a03 ? [[0, 'tuc-gian-01'], [492, 'bat-ngo-03'], [512, 'bat-ngo-02']] : [[0, 'so-hai-01'], [724, 'nghi-ngo-01'], [762, 'so-hai-01']]);
  return (
    <Camera lens={seatLens(1.95)}>
      <RoomScene view="bed" door="ajar" chair="bed" phone="hidden" actors={[{ at: [300, 300], render: () => <PhoneOnMat view="bed" /> }, namActor('bed', { pose, at: SEAT, rise, mood, face, look, talk: talkAt(f, 440, 492), blink: f > 500 ? false : blinkAt(f) })]} />
    </Camera>
  );
};

const A04: React.FC<{ f: number }> = ({ f }) => {
  const p = placeOn('kitchen', SINK);
  const look = turnAt({ view: 'quarter', facing: 1 }, { view: 'three', facing: 1 }, seg(f, 560, 570));
  return (
    <Camera lens={{ cx: p.x + 40 * p.scale, cy: p.y + 150 * p.scale, z: 1.55 }}>
      <RoomScene view="kitchen" door="ajar" chair="bed" actors={[{ at: SINK, render: (q) => <NguoiKia {...q} light={lit('kitchen', SINK)} mood="calm" face="binh-than-00" blink={blinkAt(f, 30)} pose={{ ...TWIN_POSES.holdBowl, view: look.view, facing: look.facing }} /> }]} />
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
  // Sững người → dò hỏi → nghe đúng giọng mình thì sợ → bật dậy hoảng hốt.
  const face = faceAt(f, [[0, 'bat-ngo-02'], [870, 'nghi-ngo-02'], [1018, 'so-hai-02'], [1080, 'so-hai-03']]);
  const shake = f >= 1098 && f < 1103 ? (f % 2 ? 3 : -3) : 0; // xung 3 px, tắt trong 0,15 giây
  return (
    <Camera lens={{ cx: 600, cy: 640, z: 1.3 }} shake={shake}>
      <RoomScene view="bed" door="ajar" chair="bed" phone="hidden" actors={[...(f < 1068 ? [{ at: [300, 300] as [number, number], render: () => <PhoneOnMat view="bed" /> }] : []), namActor('bed', { pose, at, mood, face, look: { view: 'three', facing: -1 }, talk: talkAt(f, 874, 926), blink: f > 1018 ? false : blinkAt(f) })]} />
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
