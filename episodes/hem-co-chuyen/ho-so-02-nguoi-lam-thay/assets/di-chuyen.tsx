import { JointPose, STAND_POSE, View } from './nhan-vat';
import { RoomView, walkFacing, CameraMove } from './boi-canh/boi-canh';

/**
 * ĐI TRÊN SÀN PHÒNG (11/11/2026). Đường đi được khai báo bằng toạ độ sàn (cm, cùng hệ `placeOn` của bối cảnh):
 * điểm bắt đầu, các điểm rẽ, đích đến. Máy quay của shot mới chuyển nó thành vị trí/tỉ lệ trên ảnh (qua `placeOn` trong `RoomScene`).
 *
 *  - Vị trí theo thời gian: đi đều theo `speed` (cm/s), dừng xoay tại chỗ ở mỗi điểm rẽ gắt, đứng yên trước/sau khi đi.
 *  - Góc nhân vật khớp hướng đi NHÌN TỪ MÁY: đi về phía máy → chính diện, đi ngang → nghiêng, đi xa → quay lưng,
 *    giữa các góc thì 3/4 và 1/4; khi rẽ góc nhìn đổi dần qua các góc trung gian (không nhảy từ chính diện sang quay lưng).
 *  - Bước chân gắn với quãng đường: pha bước = quãng đường / độ dài một chu kỳ, độ dài chu kỳ đo từ chính bộ khớp
 *    (chân trụ lùi bao nhiêu thì sàn trôi bấy nhiêu) nên chân chạm sàn không trượt khi đi ngang ảnh.
 * Tất định theo số khung. Không tạo bóng hay che khuất: phần đó do `RoomScene` lo theo vị trí sàn (xem `actors`).
 */

export type Pt = [number, number];
export type WalkPlan = {
  /** Điểm trên sàn (cm): đầu tiên là chỗ đứng ban đầu, cuối cùng là đích. */
  points: Pt[];
  /** Tốc độ đi (cm/s). Mặc định 70. */
  speed?: number;
  /** Khung bắt đầu đi (trước đó đứng yên ở điểm đầu). Mặc định 0. */
  start?: number;
  /** Số khung xoay tại chỗ ở điểm rẽ gắt (> 35°). Mặc định 9. */
  turn?: number;
  /** Hướng đứng lúc đầu / lúc cuối (vector sàn). Mặc định: hướng đoạn đầu / đoạn cuối. */
  startFacing?: Pt;
  endFacing?: Pt;
  /** Khung hình/giây của cảnh (đổi cm/s sang cm/khung). Mặc định 30. */
  fps?: number;
};

const unit = (a: Pt, b: Pt): Pt => { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return [dx / l, dz / l]; };
const ang = (v: Pt) => Math.atan2(v[1], v[0]);
const angDiff = (a: number, b: number) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };

/** Số khung tăng tốc / giảm tốc ở đầu và cuối mỗi đoạn đi (không bắt đầu hay dừng đột ngột). */
const RAMP = 8;
/** Quãng đã đi (0…len) và tỉ lệ tốc độ (0…1 so với tốc độ đều) ở khung `t` của đoạn dài `n` khung: hình thang, tích phân liên tục. */
const trapezoid = (t: number, n: number, len: number) => {
  const R = Math.min(RAMP, n / 2), vmax = len / (n - R), x = Math.min(n, Math.max(0, t));
  const d = x < R ? (vmax * x * x) / (2 * R) : x < n - R ? vmax * (R / 2 + (x - R)) : len - (vmax * (n - x) * (n - x)) / (2 * R);
  const sp = x < R ? x / R : x < n - R ? 1 : (n - x) / R;
  return { d, sp };
};

type Seg = { kind: 'walk' | 'turn' | 'idle'; f0: number; f1: number; a: Pt; b: Pt; h0: number; h1: number; d0: number };
/** Dựng bảng thời gian: đoạn đi, đoạn xoay ở điểm rẽ gắt. Trả về các đoạn và tổng số khung. */
const timeline = (w: WalkPlan): { segs: Seg[]; end: number } => {
  const pts = w.points, v = ((w.speed ?? 70) / (w.fps ?? 30)), turn = w.turn ?? 9;
  const segs: Seg[] = [];
  let f = w.start ?? 0, dist = 0;
  const h0 = ang(w.startFacing ?? unit(pts[0], pts[1] ?? pts[0]));
  let h = h0;
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 1e-6) continue;
    const hh = ang(unit(a, b));
    const d = Math.abs(angDiff(h, hh));
    if (d > 0.01) { // xoay tại chỗ: đoạn dài theo góc (tối thiểu nửa thời gian cấu hình)
      const n = Math.max(2, Math.round(turn * Math.min(1, d / (Math.PI / 2)) * 1.0));
      segs.push({ kind: 'turn', f0: f, f1: f + n, a, b: a, h0: h, h1: h + angDiff(h, hh), d0: dist }); f += n; h = hh;
    }
    const n = Math.max(2, Math.ceil(len / v + RAMP)); // đoạn đi bắt đầu và kết thúc ở trạng thái nghỉ: tăng/giảm tốc RAMP khung
    segs.push({ kind: 'walk', f0: f, f1: f + n, a, b, h0: hh, h1: hh, d0: dist }); f += n; dist += len; h = hh;
  }
  const last = pts[pts.length - 1];
  if (w.endFacing) {
    const hh = ang(w.endFacing), d = angDiff(h, hh);
    if (Math.abs(d) > 0.01) { const n = Math.max(2, Math.round(turn * Math.min(1, Math.abs(d) / (Math.PI / 2)))); segs.push({ kind: 'turn', f0: f, f1: f + n, a: last, b: last, h0: h, h1: h + d, d0: dist }); f += n; }
  }
  return { segs, end: f };
};

export type WalkState = {
  /** Vị trí sàn (cm). */
  at: Pt;
  /** Hướng thân (vector sàn đơn vị). */
  heading: Pt;
  moving: boolean;
  /** Quãng đường đã đi (cm). */
  dist: number;
  /** Số khung hết đoạn cuối. */
  done: boolean;
  /** 0…1: tốc độ hiện tại so với tốc độ đều (0 khi đứng/xoay, tăng giảm mượt ở đầu/cuối mỗi đoạn). */
  speed: number;
};
/** Vị trí, hướng và quãng đường tại khung `frame`. */
export const walkState = (w: WalkPlan, frame: number): WalkState => {
  const { segs, end } = timeline(w);
  const first = w.points[0], last = w.points[w.points.length - 1];
  const hStart = ang(w.startFacing ?? unit(first, w.points[1] ?? first));
  if (!segs.length) return { at: first, heading: [Math.cos(hStart), Math.sin(hStart)], moving: false, dist: 0, done: true, speed: 0 };
  const s0 = segs[0];
  if (frame <= s0.f0) return { at: first, heading: [Math.cos(hStart), Math.sin(hStart)], moving: false, dist: 0, done: false, speed: 0 };
  const total = segs.reduce((t, s) => t + (s.kind === 'walk' ? Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) : 0), 0);
  if (frame >= end) {
    const sl = segs[segs.length - 1];
    return { at: last, heading: [Math.cos(sl.h1), Math.sin(sl.h1)], moving: false, dist: total, done: true, speed: 0 };
  }
  const s = segs.find((q) => frame >= q.f0 && frame < q.f1) ?? segs[segs.length - 1];
  const u = (frame - s.f0) / (s.f1 - s.f0);
  if (s.kind === 'turn') {
    const e = u * u * (3 - 2 * u), h = s.h0 + (s.h1 - s.h0) * e;
    return { at: s.a, heading: [Math.cos(h), Math.sin(h)], moving: false, dist: s.d0, done: false, speed: 0 };
  }
  const len = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]), tr = trapezoid(frame - s.f0, s.f1 - s.f0, len), k = tr.d / len;
  return { at: [s.a[0] + (s.b[0] - s.a[0]) * k, s.a[1] + (s.b[1] - s.a[1]) * k], heading: [Math.cos(s.h0), Math.sin(s.h0)], moving: true, dist: s.d0 + tr.d, done: false, speed: tr.sp };
};
/** Số khung của cả kế hoạch (đến khi dừng hẳn). */
export const walkEnd = (w: WalkPlan) => timeline(w).end;

// ---------------------------------------------------------------------------
// GÓC NHÌN THEO HƯỚNG ĐI
// ---------------------------------------------------------------------------
const RING: { view: View; facing: 1 | -1 }[] = [
  { view: 'front', facing: 1 }, { view: 'three', facing: 1 }, { view: 'side', facing: 1 }, { view: 'quarter', facing: 1 },
  { view: 'back', facing: 1 }, { view: 'quarter', facing: -1 }, { view: 'side', facing: -1 }, { view: 'three', facing: -1 },
];
/** Góc của rig (view + facing) cho góc φ trên màn hình (độ; xem `walkFacing`), làm tròn về 8 góc có sẵn. */
export const viewForAngle = (phi: number): { view: View; facing: 1 | -1 } => {
  const k = Math.round(phi / 45), i = ((k % 8) + 8) % 8;
  return RING[i];
};
/** Góc rig cho một vector đi trên sàn nhìn từ máy của shot. */
export const facingFor = (view: RoomView, heading: Pt, move?: CameraMove) => viewForAngle(walkFacing(view, heading, move));

// ---------------------------------------------------------------------------
// BƯỚC CHÂN: chu kỳ giải tích, liên tục, chân trụ không trượt
// ---------------------------------------------------------------------------
/**
 * Chu kỳ bước dựng bằng công thức (không nội suy giữa vài khoá nên không có điểm dừng-khựng):
 *  - Hông giữ độ cao gần như đều (nhấp nhô nhẹ), bàn chân là thứ được lập lịch: chân trụ (62% chu kỳ) lùi ĐỀU từ +X về −X so với hông,
 *    đúng bằng tốc độ thân nên bàn chân đứng yên trên sàn; chân đưa (38%) vòng ra trước theo đường cong Hermite khớp tốc độ ở hai đầu,
 *    nhấc lên theo sin² rồi hạ.
 *  - Hai khớp đùi–cẳng chân giải bằng IK hai đoạn (cùng độ dài) từ vị trí bàn chân → không bao giờ gập ngược.
 *  - Tay đánh ngược chân cùng phía theo đúng vị trí bàn chân (liên tục), khuỷu gập nhẹ theo nhịp.
 * Một chu kỳ = hai bước; pha 0–1 tuần hoàn. `leg`: độ dài đùi/cẳng chân của bộ đồ đang dùng (dáng tham chiếu 99/99, dáng chốt 105/105).
 */
export type LegLen = { thigh: number; shin: number };
const DEFAULT_LEG: LegLen = { thigh: 105, shin: 105 };
const STANCE = 0.6, LIFT = 13, BOB = 2.5, ARM_SWING = 26;
const stepX = (len: number) => 0.28 * len; // nửa quãng chân trụ lùi so với hông (đơn vị rig)
const hermite = (p0: number, p1: number, m0: number, m1: number, s: number) => {
  const s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * p0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * p1 + (s3 - s2) * m1;
};
/** Vị trí bàn chân so với hông ở pha u (0–1) của MỘT chân: x về phía trước (+), lift = độ nhấc. */
const foot = (u: number, X: number) => {
  const m = ((-2 * X) / STANCE); // vận tốc chân trụ theo đơn vị pha
  if (u < STANCE) return { x: X + m * u, lift: 0 };
  const s = (u - STANCE) / (1 - STANCE);
  return { x: hermite(-X, X, 0.5 * m * (1 - STANCE), 0.5 * m * (1 - STANCE), s), lift: LIFT * Math.sin(Math.PI * s) ** 2 };
};
/** IK hai đoạn bằng nhau: bàn chân ở (x, y) so với hông (y xuống dưới) → góc đùi `a` và độ gập gối `b` theo quy ước rig. */
const ik = (x: number, y: number, leg: LegLen) => {
  const L = (leg.thigh + leg.shin) / 2, d = Math.min(Math.hypot(x, y), 2 * L - 0.01), th = Math.atan2(x, y), k = Math.acos(d / (2 * L));
  return { a: ((th + k) * 180) / Math.PI, b: ((2 * k) * 180) / Math.PI };
};
/** Độ dài một chu kỳ bước (hai bước), đơn vị rig: chân trụ lùi 2X trong STANCE của chu kỳ nên thân tiến 2X / STANCE. */
export const strideRig = (leg: LegLen = DEFAULT_LEG) => (2 * stepX(leg.thigh + leg.shin)) / STANCE;
/** Độ dài một chu kỳ bước (hai bước) tính bằng cm của người cao `heightCm`. */
export const strideCm = (heightCm = 168, leg: LegLen = DEFAULT_LEG) => (strideRig(leg) * heightCm) / 590;
/** Dáng bước ở pha `phase` (0–1, tuần hoàn). `amp` 0–1: biên độ (0 = đứng, dùng khi tăng/giảm tốc). */
export const gaitPose = (phase: number, leg: LegLen = DEFAULT_LEG, amp = 1): JointPose => {
  const X = stepX(leg.thigh + leg.shin) * amp, tt = (((phase % 1) + 1) % 1);
  const bob = BOB * Math.cos(4 * Math.PI * tt) * amp; // hông thấp nhất khi hai chân cùng chạm sàn (pha 0 và 0,5)
  const H = 0.94 * (leg.thigh + leg.shin) - bob; // chiều cao hông so với mặt sàn trong hệ chân
  const feet = [foot(tt, X), foot((tt + 0.5) % 1, X)];
  const legs = feet.map((f) => ik(f.x, H - f.lift * amp, leg));
  const xn = feet.map((f) => (X > 0 ? f.x / X : 0));
  const arm = (i: 0 | 1) => ({ a: -ARM_SWING * xn[i] * amp + 2, b: 14 + 10 * ((1 - xn[i]) / 2) * amp });
  const aR = arm(0), aL = arm(1);
  const stand = STAND_POSE;
  const ankleY = 555 - 345; // cổ chân so với hông khi đứng (rig 345 → 555)
  return {
    ...stand, planted: false,
    tilt: 3 * amp + 1.2 * Math.sin(4 * Math.PI * tt) * amp, neck: -1.5 * amp,
    legR: { a: legs[0].a, b: legs[0].b }, legL: { a: legs[1].a, b: legs[1].b },
    armR: { ...stand.armR, a: aR.a, b: aR.b }, armL: { ...stand.armL, a: aL.a, b: aL.b },
    y: ankleY - H, // hạ hông xuống đúng mức để chân trụ chạm sàn (không dùng `planted`: nó nhảy khi đổi chân thấp nhất)
  };
};

export type Walker = {
  at: Pt;
  pose: JointPose;
  /** Góc rig đang dùng. */
  view: View; facing: 1 | -1;
  moving: boolean;
  state: WalkState;
};
export type WalkerOpts = { heightCm?: number; move?: CameraMove; /** dáng đứng khi dừng */ idle?: JointPose; /** độ dài chân của bộ đồ (Nam dáng tham chiếu 99/99) */ leg?: LegLen };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/**
 * Dáng + vị trí của người đi theo `plan` ở khung `frame`, nhìn từ máy `view`. Dùng thẳng trong `actors` của `RoomScene`:
 * `{ at: w.at, render: (p) => <Nam25D {...p} pose={w.pose} /> }`. Dừng thì trả về `idle`; tăng/giảm tốc thì biên độ bước tăng/giảm liên tục
 * (không chuyển đột ngột giữa đứng và đi).
 */
export const walker = (view: RoomView, plan: WalkPlan, frame: number, o: WalkerOpts = {}): Walker => {
  const st = walkState(plan, frame);
  const { view: v, facing } = facingFor(view, st.heading, o.move);
  const leg = o.leg ?? DEFAULT_LEG, cm = strideCm(o.heightCm ?? 168, leg);
  // Pha bước theo quãng đường NHÌN TỪ MÁY: chân chỉ vung trong mặt phẳng ảnh, nên đi chéo/ngang thì quãng thân tiến trên ảnh là
  // quãng đi × |sin φ|. Cộng dồn theo từng đoạn thẳng (mỗi đoạn một hướng) để pha liên tục qua chỗ rẽ.
  let acc = 0;
  for (const sg of timeline(plan).segs) {
    if (sg.kind !== 'walk' || frame <= sg.f0) continue;
    const len = Math.hypot(sg.b[0] - sg.a[0], sg.b[1] - sg.a[1]), d = trapezoid(frame - sg.f0, sg.f1 - sg.f0, len).d;
    const phi = walkFacing(view, [sg.b[0] - sg.a[0], sg.b[1] - sg.a[1]], o.move), a180 = Math.abs(phi) % 180;
    acc += d * (a180 < 30 || a180 > 150 ? 1 : Math.abs(Math.sin((phi * Math.PI) / 180)));
  }
  const phase = acc / cm, amp = st.speed; // biên độ theo tốc độ: dừng = 0
  const idle = o.idle ?? STAND_POSE;
  const gait = gaitPose(phase, leg, 1);
  const w = amp * amp * (3 - 2 * amp); // trộn mượt giữa đứng và bước
  const blend = (a: number, b: number) => lerp(a, b, w);
  const mix = (x: { a: number; b: number; rot?: 1 | -1 }, y: { a: number; b: number; rot?: 1 | -1 }) => ({ a: blend(x.a, y.a), b: blend(x.b, y.b), rot: y.rot ?? x.rot });
  const base: JointPose = {
    ...idle, planted: false,
    tilt: blend(idle.tilt, gait.tilt), neck: blend(idle.neck, gait.neck),
    legR: mix(idle.legR, gait.legR), legL: mix(idle.legL, gait.legL), armR: mix(idle.armR, gait.armR), armL: mix(idle.armL, gait.armL),
    y: blend(idle.y + (idle.planted ? 0 : 0), gait.y),
  };
  // đứng yên: planted như dáng gốc (chân đứng thẳng) — chỉ tắt `planted` khi đang trong chu kỳ bước (w > 0)
  const out: JointPose = w <= 0 ? { ...idle } : base;
  const frontal = v === 'front' || v === 'back';
  const sway = frontal ? Math.sin(phase * Math.PI * 2) * w : 0;
  const pose: JointPose = frontal && w > 0
    ? { ...out, view: v, facing, tilt: out.tilt + sway * 2.2, neck: out.neck - sway * 1.2,
        legR: { ...out.legR, b: out.legR.b + Math.max(0, sway) * 10 }, legL: { ...out.legL, b: out.legL.b + Math.max(0, -sway) * 10 } }
    : { ...out, view: v, facing };
  return { at: st.at, pose, view: v, facing, moving: st.moving, state: st };
};
