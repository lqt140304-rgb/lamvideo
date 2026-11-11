import { JointPose, Limb, mirrorPose, mixPose, solveRig, STAND_POSE, TWIN_POSES, View } from './nhan-vat';
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
  /** Tốc độ đi (cm/s). Mặc định 90. */
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

type Seg = { kind: 'walk' | 'turn' | 'idle'; f0: number; f1: number; a: Pt; b: Pt; h0: number; h1: number; d0: number };
/** Dựng bảng thời gian: đoạn đi, đoạn xoay ở điểm rẽ gắt. Trả về các đoạn và tổng số khung. */
const timeline = (w: WalkPlan): { segs: Seg[]; end: number } => {
  const pts = w.points, v = ((w.speed ?? 90) / (w.fps ?? 30)), turn = w.turn ?? 9;
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
    const n = Math.max(1, Math.round(len / v));
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
};
/** Vị trí, hướng và quãng đường tại khung `frame`. */
export const walkState = (w: WalkPlan, frame: number): WalkState => {
  const { segs, end } = timeline(w);
  const first = w.points[0], last = w.points[w.points.length - 1];
  const hStart = ang(w.startFacing ?? unit(first, w.points[1] ?? first));
  if (!segs.length) return { at: first, heading: [Math.cos(hStart), Math.sin(hStart)], moving: false, dist: 0, done: true };
  const s0 = segs[0];
  if (frame <= s0.f0) return { at: first, heading: [Math.cos(hStart), Math.sin(hStart)], moving: false, dist: 0, done: false };
  const total = segs.reduce((t, s) => t + (s.kind === 'walk' ? Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) : 0), 0);
  if (frame >= end) {
    const sl = segs[segs.length - 1];
    return { at: last, heading: [Math.cos(sl.h1), Math.sin(sl.h1)], moving: false, dist: total, done: true };
  }
  const s = segs.find((q) => frame >= q.f0 && frame < q.f1) ?? segs[segs.length - 1];
  const u = (frame - s.f0) / (s.f1 - s.f0);
  if (s.kind === 'turn') {
    const e = u * u * (3 - 2 * u), h = s.h0 + (s.h1 - s.h0) * e;
    return { at: s.a, heading: [Math.cos(h), Math.sin(h)], moving: false, dist: s.d0, done: false };
  }
  const len = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]);
  return { at: [s.a[0] + (s.b[0] - s.a[0]) * u, s.a[1] + (s.b[1] - s.a[1]) * u], heading: [Math.cos(s.h0), Math.sin(s.h0)], moving: true, dist: s.d0 + len * u, done: false };
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
// BƯỚC CHÂN KHÔNG TRƯỢT
// ---------------------------------------------------------------------------
// Chu kỳ bước riêng cho đi trên sàn: biên độ chân lớn hơn `sampleWalk` (bước ~33 cm thay vì ~23 cm) để nhịp chân không quá dồn ở tốc độ đi thật.
const SWING = 1.4;
const swingLimb = (l: Limb): Limb => ({ ...l, a: l.a * SWING });
const GAIT_STRIDE: JointPose = { ...TWIN_POSES.stride, legR: swingLimb(TWIN_POSES.stride.legR), legL: swingLimb(TWIN_POSES.stride.legL), armR: swingLimb(TWIN_POSES.stride.armR), armL: swingLimb(TWIN_POSES.stride.armL) };
const GAIT_PASS: JointPose = { ...STAND_POSE, tilt: 4, legR: { a: 2, b: 2 }, legL: { a: 16, b: 54 } };
const GAIT_KEYS = [GAIT_STRIDE, GAIT_PASS, mirrorPose(GAIT_STRIDE), mirrorPose(GAIT_PASS)];
/** Một chu kỳ bước (hai bước) ở pha 0–1, tuần hoàn. */
export const gaitPose = (phase: number): JointPose => {
  const t = (((phase % 1) + 1) % 1) * 4, i = Math.floor(t), u = t - i;
  return mixPose(GAIT_KEYS[i], GAIT_KEYS[(i + 1) % 4], u * u * (3 - 2 * u));
};

type GaitTable = { stride: number; off: number[]; n: number };
let gait: GaitTable | null = null;
/**
 * Bảng dáng bước, đo từ chính `gaitPose` bằng `solveRig` (chân thấp hơn là chân trụ):
 *  - `stride`: quãng chân trụ lùi trong một chu kỳ (đơn vị rig) = quãng thân tiến trong một chu kỳ.
 *  - `off[k]`: độ dịch ngang của thân so với đường đi (đơn vị rig) để chân trụ ĐỨNG YÊN trên sàn: thân chạy đều theo đường đi nhưng
 *    chu kỳ mẫu có vận tốc chân không đều, nên nếu chỉ tịnh tiến thân thì chân trượt. Bảng khép kín (đầu = cuối).
 */
const gaitTable = (): GaitTable => {
  if (gait) return gait;
  const N = 240, endX: number[] = [], low: ('R' | 'L')[] = [];
  const at = (i: number) => { const r = solveRig({ ...gaitPose(i / N), view: 'three', facing: 1 }); const L = r.legR.end.y >= r.legL.end.y ? 'R' : 'L'; return { L, x: (L === 'R' ? r.legR : r.legL).end.x, xr: r.legR.end.x, xl: r.legL.end.x }; };
  const raw = Array.from({ length: N + 1 }, (_, i) => at(i));
  // chân trụ lùi: tổng độ lùi (−Δx) khi chân trụ không đổi
  let back = 0;
  for (let i = 1; i <= N; i++) if (raw[i].L === raw[i - 1].L) back += raw[i - 1].x - raw[i].x;
  const stride = Math.max(back, 1);
  // off(φ) = c − S·φ − x_trụ(φ); tại chỗ đổi chân giữ off liên tục
  const off: number[] = new Array(N + 1);
  let c = 0;
  off[0] = 0; c = off[0] + stride * 0 + raw[0].x;
  for (let i = 1; i <= N; i++) {
    const a = raw[i - 1], b = raw[i];
    if (b.L !== a.L) c = off[i - 1] + (stride * (i - 1)) / N + b.x; // chân mới chạm sàn: giữ nguyên độ dịch thân
    off[i] = c - (stride * i) / N - b.x;
  }
  const drift = off[N] - off[0];
  for (let i = 0; i <= N; i++) off[i] -= drift * (i / N);
  endX.length = 0; low.length = 0;
  gait = { stride, off, n: N };
  return gait;
};
/** Độ dài một chu kỳ bước (đơn vị rig). */
export const strideRig = () => gaitTable().stride;
/** Độ dài một chu kỳ bước (hai bước) tính bằng cm của người cao `heightCm`. */
export const strideCm = (heightCm = 168) => (strideRig() * heightCm) / 590;
/** Độ dịch thân (đơn vị rig) giữ chân trụ đứng yên ở pha `phase` (0–1, tuần hoàn). */
export const gaitOffset = (phase: number) => {
  const g = gaitTable(), t = (((phase % 1) + 1) % 1) * g.n, i = Math.floor(t), u = t - i;
  return g.off[i] + (g.off[Math.min(i + 1, g.n)] - g.off[i]) * u;
};

export type Walker = {
  at: Pt;
  pose: JointPose;
  /** Góc rig đang dùng. */
  view: View; facing: 1 | -1;
  moving: boolean;
  state: WalkState;
};
export type WalkerOpts = { heightCm?: number; move?: CameraMove; /** dáng đứng khi dừng */ idle?: JointPose };
/**
 * Dáng + vị trí của người đi theo `plan` ở khung `frame`, nhìn từ máy `view`. Dùng thẳng trong `actors` của `RoomScene`:
 * `{ at: w.at, render: (p) => <Nam25D {...p} pose={w.pose} /> }`. Khi dừng trả về `idle` (mặc định đứng) cùng góc theo hướng thân.
 */
export const walker = (view: RoomView, plan: WalkPlan, frame: number, o: WalkerOpts = {}): Walker => {
  const st = walkState(plan, frame);
  const { view: v, facing } = facingFor(view, st.heading, o.move);
  const cm = strideCm(o.heightCm ?? 168);
  // Pha bước theo quãng đường NHÌN TỪ MÁY: chân chỉ vung trong mặt phẳng ảnh, nên đi chéo/ngang thì quãng thân tiến trên ảnh là
  // quãng đi × |sin φ|. Cộng dồn theo từng đoạn thẳng (mỗi đoạn một hướng) để pha liên tục qua chỗ rẽ.
  let acc = 0;
  for (const sg of timeline(plan).segs) {
    if (sg.kind !== 'walk' || frame <= sg.f0) continue;
    const len = Math.hypot(sg.b[0] - sg.a[0], sg.b[1] - sg.a[1]), u = Math.min(1, (frame - sg.f0) / (sg.f1 - sg.f0));
    const phi = walkFacing(view, [sg.b[0] - sg.a[0], sg.b[1] - sg.a[1]], o.move), k = Math.abs(Math.sin((phi * Math.PI) / 180));
    acc += len * u * (Math.abs(phi) % 180 < 30 || Math.abs(phi) % 180 > 150 ? 1 : k);
  }
  const phase = acc / cm;
  const base = st.moving ? gaitPose(phase) : (o.idle ?? STAND_POSE);
  const frontal = st.moving && (v === 'front' || v === 'back');
  const sway = frontal ? Math.sin(phase * Math.PI * 2) : 0;
  const lateral = st.moving && !frontal;
  const pose: JointPose = frontal
    ? { ...base, view: v, facing, tilt: base.tilt + sway * 2.2, neck: base.neck - sway * 1.2,
        legR: { ...base.legR, b: base.legR.b + Math.max(0, sway) * 26 }, legL: { ...base.legL, b: base.legL.b + Math.max(0, -sway) * 26 } }
    : { ...base, view: v, facing, x: base.x + (lateral ? gaitOffset(phase) : 0) };
  return { at: st.at, pose, view: v, facing, moving: st.moving, state: st };
};
