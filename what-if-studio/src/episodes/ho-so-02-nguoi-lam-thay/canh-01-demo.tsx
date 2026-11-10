import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { FONT } from '../../engine/fonts';
import { JointPose, Light, mixPose, NamMood, NguoiKia, Outline, PALETTE, solveRig, STAND_POSE, StudentTwinBody, StudentTwinHead, Talk, turnAt, TWIN_POSES, View } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import type { FaceKey } from '../../../library/expressions/cartoon-soft/net-mat';
import { CameraMove, lightFor, placeOn, RoomScene, RoomView } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';

/**
 * The Crack in Reality — Hồ sơ 02: Người trong gương — demo animatic Cảnh 1 (MAY-A, A01–A05), bản câm: phụ đề tạm thay giọng, chưa có âm.
 * Nguồn lời: episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/THAO-LUAN-CANH.md; góc máy: DUNG-CANH.md#may-a.
 * Cận cảnh là phóng khung trên cùng camera của phòng (tiến cận giả lập), không phải lens thật.
 */
// Đoạn thức dậy A02B chèn sau báo thức; các shot sau giữ mốc cũ và lùi lại WAKE_LEN frame.
const WAKE_AT = 400, WAKE_LEN = 225;
export const CANH01_TOTAL = 1170 + WAKE_LEN;

const SLEEP = PALETTE.nam.sleepShirt;
const SINK: [number, number] = [94, 92];
const SEAT: [number, number] = [276, 240]; // hông trên mép nệm phía cửa, chân chạm sàn
const STANDUP: [number, number] = [236, 212]; // đứng dậy sát ghế (SEATS.bed): đầu gối chạm mép mặt ghế lúc bật dậy
const NEAR: [number, number] = [262, 360]; // khoá xếp lớp: Nam vẽ sau khối nệm/ghế, vì nệm được xếp theo tâm
const PHONE: [number, number][] = [[282, 256], [289, 256], [289, 270], [282, 270]];

// 11/11: bóng là mảng vẽ tay trong rig; giữ Light để tương thích cỡ nét, không tính bóng từ vị trí đèn.
const lit = (_view: RoomView, _at: [number, number], _top = 160): Light => ({ x: 0, y: 0, amount: 0, rim: 0, back: 0, line: 0.65 });
export const RAYS = 0.9; // vệt nắng xiên từ cửa sổ (RoomScene rays)

const ease = Easing.inOut(Easing.cubic);
export const seg = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
const TALK = ['a', 'closed', 'o', 'e', 'closed', 'u', 'a', 'closed'] as const;
const talkAt = (f: number, from: number, to: number): Talk | undefined => (f >= from && f < to ? { shape: TALK[Math.floor((f - from) / 4) % TALK.length], open: 0.7 } : undefined);
const blinkAt = (f: number, seed = 0) => (f + seed) % 84 < 3;

// Ngồi mép nệm thấp (24 cm): đùi hơi dốc lên, cẳng chân thẳng xuống sàn.
const LOWSIT: JointPose = TWIN_POSES.sitLow; // ngồi mép nệm thấp, gối cao hơn hông
const RUB: JointPose = { ...LOWSIT, armR: { a: -45, b: 138 }, wristR: -50, // bắp tay thả, cẳng tay gập lên mặt: giơ cả bắp tay về máy làm vai phồng thành cục
  handR: 'fist', frontR: true };
const RUB_SIDE: JointPose = { ...LOWSIT, armR: { a: 84, b: 122 }, wristR: -40, handR: 'fist', frontR: true }; // nhìn nghiêng: tay đưa lên mặt về phía trước, không lộn ra sau lưng
const TOUCH: JointPose = { ...RUB, wristR: -55, handR: 'open' };
const REACH: JointPose = { ...LOWSIT, tilt: 2, armR: { a: -34, b: 12 }, handR: 'open' };
const GRAB: JointPose = { ...REACH, handR: 'phone', prop: 'phone' };
const HOLD: JointPose = { ...STAND_POSE, tilt: -4, neck: 4, armR: { a: -30, b: 130 }, wristR: -20, handR: 'phone', prop: 'phone', frontR: true, armL: { a: 6, b: 14, rot: -1 }, handL: 'open', legR: { a: 8, b: 10 }, legL: { a: -8, b: 6 } };
const SEAT_DY = solveRig(LOWSIT).dy;

export type Lens = { cx: number; cy: number; z: number };
const clampLens = ({ cx, cy, z }: Lens): Lens => ({ z, cx: Math.min(1920 - 960 / z, Math.max(960 / z, cx)), cy: Math.min(1080 - 540 / z, Math.max(540 / z, cy)) });
// Máy cầm tay: dao động chậm vài px và nghiêng rất nhẹ, để khung không đứng im như animation phẳng.
const handheld = (f: number, amp: number) => ({
  x: amp * (Math.sin(f / 23) + 0.6 * Math.sin(f / 9.7 + 1.3) + 0.25 * Math.sin(f / 4.1)),
  y: amp * (Math.sin(f / 29 + 2) + 0.5 * Math.sin(f / 11.3) + 0.2 * Math.sin(f / 5.3 + 0.7)),
  r: amp * 0.05 * Math.sin(f / 31 + 0.4),
});
export const Camera: React.FC<{ lens: Lens; shake?: number; f?: number; hand?: number; children: React.ReactNode }> = ({ lens, shake = 0, f = 0, hand = 0, children }) => {
  const l = clampLens(lens);
  const h = handheld(f, hand);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#d9cfb9' }}>
      {/* phóng thêm 2% để lúc rung/nghiêng không lộ mép khung */}
      <div style={{ position: 'absolute', width: 1920, height: 1080, transformOrigin: '960px 540px', transform: `translate(${h.x + shake}px, ${h.y}px) rotate(${h.r}deg) scale(1.02)` }}>
        <div style={{ position: 'absolute', width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${960 - l.cx * l.z}px, ${540 - l.cy * l.z}px) scale(${l.z})` }}>{children}</div>
      </div>
    </AbsoluteFill>
  );
};
export const lerpLens = (a: Lens, b: Lens, t: number): Lens => ({ cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t, z: a.z + (b.z - a.z) * t });

// Khung phim: viền đen 2:1, tối bốn góc, hạt phim đổi theo frame; mở/kết bằng màn đen.
export const FilmLook: React.FC<{ f: number; total: number }> = ({ f, total }) => {
  const black = 1 - seg(f, 0, 14) + seg(f, total - 18, total - 1);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 62%, rgba(20,16,12,.28) 100%)' }} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.16 }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={f % 24} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={1920} height={1080} filter="url(#grain)" />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 60, background: '#000' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 60, background: '#000' }} />
      <AbsoluteFill style={{ background: '#000', opacity: Math.min(1, black) }} />
    </AbsoluteFill>
  );
};

// Đầu Nam nằm trên gối (đầu hướng tường phải); `cover` 0–1 kéo chăn trùm qua đầu.
export const HEAD_AT: [number, number] = [150, -40]; // đỉnh đầu so với điểm neo gối, đơn vị rig
const LIE_ROT = 87; // trục người dọc mép nệm ở góc wide
const PHONE_RIG = { x: 92, y: 168 }; // điện thoại trên nệm trước mặt (khung rig chưa xoay; +x là phía máy quay)
const BLANKET_REST = 232; // mép chăn lúc ngủ: ngang ngực dưới nách (đơn vị rig, 0 = đỉnh đầu)
const BLANKET_OVER = -46; // trùm qua đỉnh đầu
const BLANKET_TOSSED = 430; // hất xuống: chăn chỉ còn trên đùi–chân
// Thức dậy: `toss` hất chăn xuống chân, `rise` ngồi dậy (xoay quanh hông), `slide` lết ra mép nệm tới `seat` (điểm đứng của SEAT trên màn hình).
type Wake = { toss: number; rise: number; slide: number; stretch?: number; yawn?: number; rub?: number; seat: { x: number; y: number; scale: number } };
// Chống tay lết: hai tay chống xuống nệm cạnh hông, đổ người tới để nhấc hông.
const PUSH: JointPose = { ...TWIN_POSES.sitLow, tilt: 18, neck: -4, armR: { a: 14, b: 6 }, armL: { a: 8, b: 8, rot: -1 }, handR: 'open', handL: 'open', frontR: true, frontL: false };
// Vươn vai khi ngồi: một tay giơ cao quá đầu, ngửa người ra sau một chút.
const STRETCH: JointPose = { ...TWIN_POSES.sitLow, tilt: -8, neck: 9, armR: { a: 170, b: 28 }, handR: 'fist', frontR: true }; // một tay vươn quá đầu (tay xa không giơ cao hơn ngang vai được trong rig phẳng)
type SleepState = { cover?: number; breath?: number; reach?: number; carry?: number; phone?: boolean; alarm?: boolean; f?: number; wake?: Wake };
// Kiểu viền đã chốt cho phim: không viền bao; tách lớp bằng tương phản sáng–tối (xem toneBack/toneFront trong rig).
export const LOOK = { outline: 'none', headOutline: 'none' } as const;
/**
 * Nam nằm nghiêng bằng rig (TWIN_POSES.lie) xoay quanh đỉnh đầu, cùng một tấm chăn vẽ trong cùng khung xoay nên luôn ôm theo người.
 * `cover` 0–1 kéo mép chăn từ ngực lên trùm đầu; `reach` 0–1 với tay tới điện thoại; `carry` 0–1 tay kéo điện thoại về vào chăn.
 * Điện thoại đặt đúng chỗ bàn tay chạm khi với hết tay, nên tay và máy luôn khớp.
 */
export const Sleeper = ({ cover = 0, breath = 0, reach = 0, carry = 0, phone = true, alarm = false, f = 0, wake }: SleepState) => (p: { x: number; y: number; scale: number; plug?: [number, number] }) => {
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
  const edge = BLANKET_REST + (BLANKET_OVER - BLANKET_REST) * cover + (BLANKET_TOSSED - BLANKET_OVER) * ease(wake?.toss ?? 0);
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin(f / 5));
  // Điểm khung rig (chưa xoay) → toạ độ màn hình, để nối cáp sạc tới ổ cắm trên tường.
  const rad = (LIE_ROT * Math.PI) / 180;
  const toScreen = (q: { x: number; y: number }) => ({ x: hx + (q.x * Math.cos(rad) - q.y * Math.sin(rad)) * p.scale, y: hy + (q.x * Math.sin(rad) + q.y * Math.cos(rad)) * p.scale });
  const phS = toScreen(ph);
  // Ánh sáng cửa sổ của góc wide, xoay ngược về khung thân nằm; tắt bóng tiếp đất vì người đang nằm trên nệm.
  const L = lit('wide', [400, 332]);
  const light: Light = { ...L, x: L.x * Math.cos(rad) + L.y * Math.sin(rad), y: -L.x * Math.sin(rad) + L.y * Math.cos(rad), ground: 0 };
  const rigGroup = (children: React.ReactNode) => <g transform={`rotate(${LIE_ROT} ${hx} ${hy}) translate(${hx} ${hy}) scale(${p.scale})`} stroke="#40443f" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">{children}</g>;
  // Thân đặt theo hông: nằm = xoay LIE_ROT quanh hông (đỉnh đầu rơi đúng điểm gối); ngồi dậy = xoay về 0 và trộn sang dáng sitLow,
  // rồi lết hông tới mép nệm. Cùng một hình cho cả quá trình nên không nhảy cảnh.
  const k = ease(wake?.rise ?? 0);
  // Lết ra mép nệm theo 3 lần nhích: chống tay + đổ người (30%) → nhấc hông và nhích (45%) → hạ người, nảy nhẹ (25%).
  const sl = Math.min(1, Math.max(0, wake?.slide ?? 0)), N = 3;
  const si = Math.min(N - 1, Math.floor(sl * N)), stT = sl >= 1 ? 1 : sl * N - si;
  const moveT = ease(Math.min(1, Math.max(0, (stT - 0.3) / 0.45)));
  const m = sl <= 0 ? 0 : (si + moveT) / N;
  const press = sl <= 0 || sl >= 1 ? 0 : stT < 0.3 ? ease(stT / 0.3) : stT < 0.75 ? 1 : 1 - ease((stT - 0.75) / 0.25);
  const lift = Math.sin(Math.PI * moveT) * 16, dip = stT > 0.75 && sl < 1 ? Math.sin((Math.PI * (stT - 0.75)) / 0.25) * 5 : 0;
  const sit = k > 0 ? mixPose(TWIN_POSES.lie, TWIN_POSES.sitLow, k) : TWIN_POSES.lie;
  const st = ease(wake?.stretch ?? 0), yw = ease(wake?.yawn ?? 0), rbv = ease(wake?.rub ?? 0);
  const pose = mixPose(mixPose(mixPose(sit, STRETCH, st), { ...RUB, wristR: RUB.wristR + 10 * Math.sin(f / 2.5) }, rbv), PUSH, press);
  const rb = solveRig(pose);
  const th = LIE_ROT * (1 - k), thr = (th * Math.PI) / 180;
  const hipLie = { x: hx - 345 * p.scale * Math.sin(rad), y: hy + 345 * p.scale * Math.cos(rad) };
  const seat = wake?.seat;
  const hipSeat = seat ? { x: seat.x, y: seat.y + (345 + solveRig(TWIN_POSES.sitLow).dy) * seat.scale } : hipLie;
  const sc = p.scale + ((seat?.scale ?? p.scale) - p.scale) * m;
  const hip = { x: hipLie.x + (hipSeat.x - hipLie.x) * m, y: hipLie.y + (hipSeat.y - hipLie.y) * m - (lift - dip) * (p.scale + ((seat?.scale ?? p.scale) - p.scale) * m) };
  const look = turnAt({ view: 'three', facing: 1 }, { view: 'three', facing: -1 }, Math.min(1, Math.max(0, (k - 0.45) / 0.4)));
  // Chỗ nằm không có nắng; lết ra mép nệm (vùng nắng) thì khối sáng–tối hiện dần theo `slide`.
  const Ls = lit('wide', SEAT, 95);
  const bodyLight: Light = { ...Ls, x: Ls.x * Math.cos(thr) + Ls.y * Math.sin(thr), y: -Ls.x * Math.sin(thr) + Ls.y * Math.cos(thr), amount: (Ls.amount ?? 0) * m, rim: (Ls.rim ?? 0) * m, back: (Ls.back ?? 0) * m, ground: k > 0.9 ? 0.6 : 0 };
  const body = (
    <g transform={`rotate(${th} ${hip.x} ${hip.y})`}>
      <StudentTwinBody {...LOOK} x={hip.x} y={hip.y - (345 + rb.dy) * sc} scale={sc} shirt={SLEEP} mood={m > 0.05 ? 'annoyed' : 'sleepy'} blink={k < 0.15 || yw > 0.2 || rbv > 0.4 || (f % 84 < 3)} talk={yw > 0.05 ? { shape: 'o', open: 0.35 + 0.65 * yw } : undefined} face={m > 0.05 ? 'tuc-gian-01' : undefined} light={wake ? bodyLight : light} pose={{ ...pose, view: look.view, facing: look.facing }} />
    </g>
  );
  return (
    <g>
      {!wake && body}
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
          {/* hất chăn: tấm chăn xẹp xuống mặt nệm (ép dày về phía lưng), không dựng thành khối */}
          <g transform={`translate(${breath + -90 + 90 * (1 - 0.6 * ease(wake?.toss ?? 0))} 0) scale(${1 - 0.6 * ease(wake?.toss ?? 0)} 1)`}>
            <path d={`M -88 ${edge + 6} Q 20 ${edge - 22} 132 ${edge + 4} Q 168 ${edge + 90} 178 380 Q 200 580 176 694 Q 30 716 -90 690 Q -112 540 -98 360 Q -100 ${edge + 70} -88 ${edge + 6} Z`} fill="#5b7870" />
            <path d={`M -88 ${edge + 6} Q 20 ${edge - 22} 132 ${edge + 4} Q 156 ${edge + 90} 150 380 Q 168 580 150 676 Q 30 700 -90 690 Q -112 540 -98 360 Q -100 ${edge + 70} -88 ${edge + 6} Z`} fill="#68877f" />
            <path d={`M 150 ${Math.max(edge + 60, 300)} Q 162 360 160 420 M 158 520 Q 168 600 156 660`} fill="none" stroke="#4e6c64" strokeWidth={3} />
            <path d={`M -70 ${edge + 30} Q 20 ${edge + 8} 120 ${edge + 30}`} fill="none" stroke="#8aa69f" strokeWidth={5} />
            <path d={`M 60 ${Math.max(edge + 90, 260)} Q 100 420 64 590 M -40 ${Math.max(edge + 120, 300)} Q -6 460 -46 610`} fill="none" stroke="#4e6c64" strokeWidth={3.5} />
            {reach > 0.01 && (
              <g>
                <path d={`M ${sh.x} ${sh.y} Q ${elbow.x} ${elbow.y} ${hand.x} ${hand.y}`} fill="none" stroke="#8f6a4f" strokeWidth={44} />
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
      {/* ngồi dậy: thân nhô lên khỏi chăn nên vẽ sau chăn */}
      {wake && body}
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
  { from: 0, code: 'A01', label: 'toàn phòng · dolly vào chậm' },
  { from: 180, code: 'A02', label: 'đẩy liền vào cận báo thức' },
  { from: 400, code: 'A03', label: 'trung cận Nam · snap-zoom lúc nhận mặt' },
  { from: 560, code: 'A04', label: 'qua vai Nam → người kia' },
  { from: 650, code: 'A04B', label: 'lặp A03 · đẩy chậm' },
  { from: 830, code: 'A05', label: 'trung rộng nệm và ghế' },
  { from: 935, code: 'A05R', label: 'ngược góc qua vai Nam → người kia đáp' },
  { from: 1018, code: 'A05', label: 'trung rộng nệm và ghế' },
];

const Overlay: React.FC<{ f: number; wake?: boolean; w?: number }> = ({ f, wake, w = 0 }) => {
  const shot = wake ? { code: 'A02B', label: 'thức dậy · ngáp · lết ra mép nệm (liền máy A02)' } : [...SHOTS].reverse().find((s) => f >= s.from)!;
  const cue: Cue | undefined = wake ? { from: 0, to: 0, text: w < 44 ? 'hất chăn · ngồi dậy lờ đờ' : w < 96 ? 'vươn vai · ngáp dài' : 'dụi mắt · tiếng chén va · lết ra mép nệm', sfx: true } : CUES.find((c) => f >= c.from && f < c.to);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* nhãn shot nằm trong viền đen trên, không đè lên hình */}
      <div style={{ position: 'absolute', left: 36, top: 16, fontFamily: FONT.ui, fontSize: 20, color: 'rgba(246,239,227,.75)' }}>
        {shot.code} · {shot.label}
      </div>
      <div style={{ position: 'absolute', right: 36, top: 16, fontFamily: FONT.ui, fontSize: 18, color: 'rgba(246,239,227,.55)' }}>
        THE CRACK IN REALITY — HỒ SƠ 02: NGƯỜI TRONG GƯƠNG · CẢNH 1 · ANIMATIC CÂM, PHỤ ĐỀ TẠM
      </div>
      {cue && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 84, display: 'flex', justifyContent: 'center' }}>
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
  return { at: SINK, render: (p: { x: number; y: number; scale: number }) => <NguoiKia {...p} {...LOOK} light={lit(view, SINK)} mood="calm" pose={{ ...TWIN_POSES.holdBowl, view: 'back', tilt: 3 + 2 * w, armR: { a: 20 + 8 * w, b: 75 }, armL: { a: 14 - 8 * w, b: 100, rot: -1 } }} /> };
};

// Nam ngồi mép nệm / đứng dậy, cùng cách tính cho mọi view.
// Nét mặt theo mốc frame; mỗi lần đổi chuyển dần trong 4 frame (mặt cũ mờ dần, mặt mới hiện dần).
type FaceCue = { face: FaceKey; faceFrom?: FaceKey; faceMix: number };
const faceAt = (f: number, steps: [number, FaceKey][], dur = 4): FaceCue => {
  let i = 0;
  while (i + 1 < steps.length && f >= steps[i + 1][0]) i++;
  return { face: steps[i][1], faceFrom: i > 0 ? steps[i - 1][1] : undefined, faceMix: i > 0 ? Math.min(1, (f - steps[i][0]) / dur) : 1 };
};

const namActor = (view: RoomView, o: { pose: JointPose; at: [number, number]; rise?: number; mood: NamMood; face?: FaceCue; look: { view: View; facing: 1 | -1 }; talk?: Talk; blink?: boolean; move?: CameraMove; top?: number }) => ({
  at: NEAR,
  render: () => {
    const p = placeOn(view, o.at, 168, o.move);
    return <StudentTwinBody {...LOOK} x={p.x} y={p.y + (o.rise ?? 0) * p.scale} scale={p.scale} light={lit(view, o.at, o.top ?? 95)} shirt={SLEEP} mood={o.mood} {...o.face} pose={{ ...o.pose, view: o.look.view, facing: o.look.facing }} talk={o.talk} blink={o.blink} />;
  },
});

// A01: máy dolly thật vào phòng (có thị sai), rồi A02 đẩy liền vào cận báo thức — một chuyển động, không cắt.
export const WIDE_LENS: Lens = { cx: 960, cy: 540, z: 1 };
export const wideMove = (f: number): CameraMove => {
  const t = interpolate(f, [0, 180], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return { push: 22 * t, truck: 14 * t };
};
const A01: React.FC<{ f: number }> = ({ f }) => (
  <Camera lens={WIDE_LENS} f={f} hand={0.7}>
    <RoomScene rays={RAYS} falloff={0.9} view="wide" door="ajar" chair="bed" phone="hidden" move={wideMove(f)} sleeper={Sleeper({ alarm: true, f })} actors={[washer(f, 'wide')]} />
  </Camera>
);

const A02: React.FC<{ f: number }> = ({ f }) => {
  const move = wideMove(180);
  const head = placeOn('wide', [424, 332], 33, move);
  const close = { cx: head.x - 40, cy: head.y + 40, z: 2.6 + 0.15 * seg(f, 216, 400) };
  const lens = lerpLens(WIDE_LENS, close, seg(f, 180, 216));
  // Tay thò khỏi chăn với điện thoại, tắt chuông (f226–236), kéo máy về vào chăn (f238–252), rồi kéo chăn trùm đầu.
  const reach = seg(f, 206, 226) * (1 - seg(f, 238, 254));
  const carry = seg(f, 240, 252);
  return (
    <Camera lens={lens} f={f} hand={1}>
      <RoomScene rays={RAYS} falloff={0.9} view="wide" door="ajar" chair="bed" phone="hidden" move={move} sleeper={Sleeper({ cover: seg(f, 254, 272), breath: f > 272 ? Math.sin(f / 15) * 5 : 0, reach, carry, alarm: f < 236, f })} actors={[washer(f, 'wide')]} />
    </Camera>
  );
};

// A02B (5 giây): cùng máy A02. Hất chăn chậm → ngồi dậy lờ đờ (máy lùi ra) → vươn vai, ngáp dài (máy đẩy vào cận mặt)
// → dụi mắt → nghe tiếng chén, cau mặt, lết ra mép nệm (máy lùi ra trung cảnh) — rồi cắt theo hành động vào A03.
const A02B: React.FC<{ w: number; f: number }> = ({ w, f }) => {
  const move = wideMove(180);
  const head = placeOn('wide', [424, 332], 33, move);
  const seat = placeOn('wide', SEAT, 168, move);
  const s = head.scale * (168 / 33); // cỡ rig của người nằm (Sleeper dùng 168 cm)
  const r = (LIE_ROT * Math.PI) / 180;
  const hx = head.x + HEAD_AT[0] * s, hy = head.y + HEAD_AT[1] * s;
  const hip = { x: hx - 345 * s * Math.sin(r), y: hy + 345 * s * Math.cos(r) };
  const close = { cx: head.x - 40, cy: head.y + 40, z: 2.75 };
  const sitMid = { cx: hip.x, cy: hip.y - 140 * s, z: 1.95 };
  const face = { cx: hip.x + 10 * s, cy: hip.y - 215 * s, z: 3.1 };
  const end = { cx: (hip.x + seat.x) / 2, cy: seat.y + 330 * seat.scale, z: 1.75 };
  let lens = lerpLens(close, sitMid, seg(w, 6, 42));
  lens = lerpLens(lens, face, seg(w, 44, 60));
  lens = lerpLens(lens, end, seg(w, 100, 200));
  const wake = { toss: seg(w, 0, 16), rise: seg(w, 12, 44), stretch: seg(w, 46, 62) * (1 - seg(w, 84, 96)), yawn: seg(w, 50, 64) * (1 - seg(w, 80, 92)), rub: seg(w, 96, 104) * (1 - seg(w, 112, 120)), slide: interpolate(w, [114, 214], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), seat };
  return (
    <Camera lens={lens} f={f} hand={w > 44 && w < 96 ? 1 : 1.4}>
      <RoomScene rays={RAYS} falloff={0.9} view="wide" door="ajar" chair="bed" phone="hidden" move={move} sleeper={Sleeper({ cover: 1, phone: false, f, wake })} actors={[washer(f, 'wide')]} />
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
  const rise = 0; // đã ngồi sẵn từ A02B
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
  // A03: đẩy chậm, rồi giật zoom nhanh đúng lúc nhận ra mặt (f492); A04B: đẩy chậm suốt shot.
  const snap = interpolate(f, [492, 500], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const zoom = a03 ? 1.95 + 0.06 * seg(f, 400, 492) + 0.24 * snap : 1.95 + 0.14 * seg(f, 650, 830);
  return (
    <Camera lens={seatLens(zoom)} f={f} hand={1.3}>
      <RoomScene rays={RAYS} falloff={0.9} view="bed" door="ajar" chair="bed" phone="hidden" actors={[{ at: [300, 300], render: () => <PhoneOnMat view="bed" /> }, namActor('bed', { pose, at: SEAT, rise, mood, face, look, talk: talkAt(f, 440, 492), blink: f > 500 ? false : blinkAt(f) })]} />
    </Camera>
  );
};

// Góc qua vai Nam nhìn về bồn rửa: lùi máy góc bếp ra sau để lưng/vai Nam (ngồi mép nệm) chiếm tiền cảnh.
const OTS_MOVE = { push: -140, truck: 40 };
const OverShoulder: React.FC<{ f: number; nk: { look: { view: View; facing: 1 | -1 }; talk?: Talk }; drift: number }> = ({ f, nk, drift }) => {
  const move: CameraMove = { push: OTS_MOVE.push + drift, truck: OTS_MOVE.truck };
  const p = placeOn('kitchen', SINK, 168, move);
  return (
    <Camera lens={{ cx: p.x + 60 * p.scale, cy: p.y + 170 * p.scale, z: 1.35 }} f={f} hand={1.1}>
      <RoomScene rays={RAYS} falloff={0.9} view="kitchen" door="ajar" chair="bed" move={move} actors={[
        { at: SINK, render: (q) => <NguoiKia {...q} {...LOOK} light={lit('kitchen', SINK)} mood="calm" face="binh-than-00" blink={blinkAt(f, 30)} talk={nk.talk} pose={{ ...TWIN_POSES.holdBowl, view: nk.look.view, facing: nk.look.facing }} /> },
        namActor('kitchen', { pose: LOWSIT, at: SEAT, mood: 'hesitant', look: { view: 'quarter', facing: -1 }, move }),
      ]} />
    </Camera>
  );
};
const A04: React.FC<{ f: number }> = ({ f }) => <OverShoulder f={f} drift={12 * seg(f, 560, 650)} nk={{ look: turnAt({ view: 'quarter', facing: 1 }, { view: 'three', facing: 1 }, seg(f, 566, 578)) }} />;
const A05R: React.FC<{ f: number }> = ({ f }) => <OverShoulder f={f} drift={12 + 10 * seg(f, 935, 1018)} nk={{ look: { view: 'three', facing: 1 }, talk: talkAt(f, 940, 1016) }} />;

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
  // Đẩy chậm vào Nam; khi bật dậy (f1080+) máy lùi nhẹ theo, cầm tay rung mạnh hơn.
  const z = 1.3 + 0.08 * seg(f, 830, 1080) - 0.06 * seg(f, 1080, 1110);
  return (
    <Camera lens={{ cx: 600, cy: 640, z }} shake={shake} f={f} hand={f > 1080 ? 2.2 : 1.2}>
      <RoomScene rays={RAYS} falloff={0.9} view="bed" door="ajar" chair="bed" phone="hidden" actors={[...(f < 1068 ? [{ at: [300, 300] as [number, number], render: () => <PhoneOnMat view="bed" /> }] : []), namActor('bed', { pose, at, top: 95 + 65 * up, mood, face, look: { view: 'three', facing: -1 }, talk: talkAt(f, 874, 926), blink: f > 1018 ? false : blinkAt(f) })]} />
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

// Bảng shot: `mix` = số frame hoà tan từ shot trước (đổi cỡ cùng chủ thể); `dip` = tối dần qua đen rồi sáng lại (nhảy thời gian);
// còn lại cắt thẳng (thuận–ngược góc trong đối thoại).
const CUT_LIST: { from: number; mix?: number; dip?: number; render: (f: number) => React.ReactNode }[] = [
  { from: 0, render: (f) => <A01 f={f} /> },
  { from: 180, render: (f) => <A02 f={f} /> },
  { from: 400, render: (f) => <NamClose f={f} start={400} /> },
  { from: 560, render: (f) => <A04 f={f} /> },
  { from: 650, render: (f) => <NamClose f={f} start={650} /> },
  { from: 830, mix: 8, render: (f) => <A05 f={f} /> },
  { from: 935, render: (f) => <A05R f={f} /> },
  { from: 1018, render: (f) => <A05 f={f} /> },
];

export const HoSo02Canh01Demo: React.FC = () => {
  const real = useCurrentFrame();
  const waking = real >= WAKE_AT && real < WAKE_AT + WAKE_LEN;
  const f = real < WAKE_AT ? real : real - WAKE_LEN; // mốc của bảng shot/phụ đề cũ
  if (waking) {
    return (
      <AbsoluteFill style={{ background: '#d9cfb9' }}>
        <A02B w={real - WAKE_AT} f={real} />
        <FilmLook f={real} total={CANH01_TOTAL} />
        <Overlay f={f} wake w={real - WAKE_AT} />
      </AbsoluteFill>
    );
  }
  let i = 0;
  while (i + 1 < CUT_LIST.length && f >= CUT_LIST[i + 1].from) i++;
  const cur = CUT_LIST[i];
  const t = cur.mix ? seg(f, cur.from, cur.from + cur.mix) : 1;
  const next = CUT_LIST[i + 1];
  const dark = Math.max(cur.dip ? 1 - seg(f, cur.from, cur.from + cur.dip) : 0, next?.dip ? seg(f, next.from - next.dip, next.from) : 0);
  return (
    <AbsoluteFill style={{ background: '#d9cfb9' }}>
      {t < 1 && i > 0 && CUT_LIST[i - 1].render(f)}
      <AbsoluteFill style={{ opacity: t }}>{cur.render(f)}</AbsoluteFill>
      {dark > 0 && <AbsoluteFill style={{ background: '#000', opacity: dark }} />}
      <FilmLook f={real} total={CANH01_TOTAL} />
      <Overlay f={f} />
    </AbsoluteFill>
  );
};

// Thử kiểu viền nhân vật (chưa áp vào phim): mỗi frame một kiểu — 0–2 cận Nam ở nệm, 3–5 góc qua vai về bồn rửa.
const OUTLINES: { mode: Outline; label: string }[] = [
  { mode: 'ink', label: 'VIỀN ĐEN (HIỆN TẠI)' },
  { mode: 'tint', label: 'VIỀN MÀU — TÔNG TỐI CỦA MẢNG' },
  { mode: 'none', label: 'KHÔNG VIỀN — CHỈ KHỐI MÀU + SÁNG' },
];
export const OUTLINE_TEST_TOTAL = 6;
export const HoSo02VienThu: React.FC = () => {
  const f = useCurrentFrame();
  const { mode, label } = OUTLINES[f % 3];
  const bed = f < 3;

  const move: CameraMove = { push: OTS_MOVE.push + 12, truck: OTS_MOVE.truck };
  const q = placeOn('kitchen', SINK, 168, move);
  const seatNam = (view: RoomView, look: { view: View; facing: 1 | -1 }, m?: CameraMove) => ({
    at: NEAR,
    render: () => {
      const s = placeOn(view, SEAT, 168, m);
      return <StudentTwinBody x={s.x} y={s.y} scale={s.scale} light={lit(view, SEAT)} shirt={SLEEP} mood="shocked" face="bat-ngo-02" outline={mode} pose={{ ...LOWSIT, view: look.view, facing: look.facing }} />;
    },
  });
  return (
    <AbsoluteFill>
      {bed ? (
        <Camera lens={seatLens(1.95)}>
          <RoomScene view="bed" door="ajar" chair="bed" phone="hidden" actors={[seatNam('bed', { view: 'three', facing: -1 })]} />
        </Camera>
      ) : (
        <Camera lens={{ cx: q.x + 60 * q.scale, cy: q.y + 170 * q.scale, z: 1.35 }}>
          <RoomScene view="kitchen" door="ajar" chair="bed" move={move} actors={[
            { at: SINK, render: (r) => <NguoiKia {...r} light={lit('kitchen', SINK)} mood="calm" face="binh-than-00" outline={mode} pose={{ ...TWIN_POSES.holdBowl, view: 'three', facing: 1 }} /> },
            seatNam('kitchen', { view: 'quarter', facing: -1 }, move),
          ]} />
        </Camera>
      )}
      <div style={{ position: 'absolute', left: 36, top: 28, fontFamily: FONT.ui, fontSize: 30, color: '#f6efe3', background: 'rgba(28,36,32,.7)', padding: '10px 16px', borderRadius: 10 }}>{label}</div>
    </AbsoluteFill>
  );
};

// Xem nhanh bối cảnh theo từng góc máy (mỗi frame một góc), có nắng cửa sổ và tối dần như trong phim.
const ROOM_VIEWS: RoomView[] = ['wide', 'door', 'hallway', 'corridor', 'bed', 'kitchen', 'desk'];
export const ROOM_VIEW_TOTAL = ROOM_VIEWS.length;
export const HoSo02BoiCanhGoc: React.FC = () => {
  const view = ROOM_VIEWS[useCurrentFrame() % ROOM_VIEWS.length];
  return (
    <AbsoluteFill>
      <RoomScene rays={RAYS} falloff={0.9} view={view} door="ajar" chair="bed" />
      <div style={{ position: 'absolute', left: 36, top: 28, fontFamily: FONT.ui, fontSize: 28, color: '#f6efe3', background: 'rgba(28,36,32,.7)', padding: '10px 16px', borderRadius: 10 }}>{view}</div>
    </AbsoluteFill>
  );
};
