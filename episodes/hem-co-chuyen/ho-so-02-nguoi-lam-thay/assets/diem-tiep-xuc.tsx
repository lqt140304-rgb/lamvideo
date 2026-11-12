import { Build, DEFAULT_BUILD, JointPose, Limb, solveRig, STAND_POSE, View } from './nhan-vat';
import { armHint } from './tay-ik';
import { CameraMove, placeOn, RoomView, screenOf, SEATS, tiltCos } from './boi-canh/boi-canh';
import { facingFor, Pt } from './di-chuyen';
import { easePose } from './song-dong';
import { mixPose, TWIN_POSES } from './nhan-vat';

/**
 * ĐIỂM TIẾP XÚC CỐ ĐỊNH (11/11/2026): chân–sàn, hông–ghế, bàn tay–mặt bàn/đồ vật. Mỗi điểm là một toạ độ 3D của cảnh (cm);
 * máy quay đổi nó thành vị trí trên ảnh, rồi giải khớp để chi tiết người chạm đúng điểm đó. Hai đoạn khớp (vai–khuỷu–cổ tay) giải bằng
 * `armHint` (tìm góc có khuỷu gần hướng gợi ý), hai chân giải bằng công thức đóng (chiều cao hông = chiều cao mặt ghế), không cần IK tổng quát.
 *
 * Quy ước chiều cao: toạ độ y là chiều cao ĐÃ VẼ trong bối cảnh (mặt ghế 40 cm, mặt bàn 65 cm), không phải kích thước đồ thật,
 * vì bối cảnh hạ đồ theo tỉ lệ chân ngắn của rig. Lấy từ `SURFACES` hoặc `screenOf`.
 */
export type V3 = [number, number, number];

/** Các mặt tiếp xúc của phòng trọ (chiều cao đã vẽ). */
export const SURFACES = {
  /** mặt ghế */ seatTop: 40,
  /** mặt bàn học */ deskTop: 65,
  /** mặt nệm */ mattress: 24,
};
/** Trạng thái ghế so với chỗ gốc trong `SEATS`: trượt `dx`, `dz` (cm) và xoay `rot` (rad) — cùng giá trị truyền cho `RoomScene chairPush`. */
export type ChairState = { dx: number; dz: number; rot: number };
/** Chỗ ngồi: vị trí sàn của người ngồi và hướng nhìn (ghế gốc quay về phía mặt bàn là −z). Ghế bị kéo/xoay thì truyền `st`. */
export const seatAnchor = (chair: keyof typeof SEATS, st?: ChairState): { at: Pt; top: number; facing: Pt } => {
  const s = SEATS[chair], ca = s.a + (st?.rot ?? 0); // ca: góc của ghế trong RoomScene (lưng ghế ở (sin ca, cos ca) × 19,5 cm)
  return { at: [s.x + (st?.dx ?? 0), s.z + (st?.dz ?? 0)], top: SURFACES.seatTop, facing: [Math.sin(ca + Math.PI), Math.cos(ca + Math.PI)] };
};

const PELVIS = { x: 0, y: 345 };
/** Đế dép thấp hơn điểm cổ chân của rig (ANKLE_Y 555 → đáy 589). */
const SOLE = 34;
const rot = (x: number, y: number, deg: number) => { const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return { x: x * c - y * s, y: x * s + y * c }; };
/** `floorTilt`: cùng giá trị truyền cho `RoomScene` (người ngả theo mặt sàn co chiều cao theo cos θ quanh bàn chân). */
export type FrameOpts = { heightCm?: number; move?: CameraMove; floorTilt?: number; /** vóc dáng của bộ đồ (dáng tham chiếu của Nam 2.5D: `DANG_THAM_CHIEU`); mặc định dáng đã chốt */ build?: Partial<Build> };
const B = (o: FrameOpts): Build => ({ ...DEFAULT_BUILD, ...o.build });

/** Điểm 3D → toạ độ rig của THÂN (trước khi xoay theo tilt), dùng làm đích cho khớp tay. */
export const toRig = (view: RoomView, at: Pt, pose: JointPose, p3: V3, o: FrameOpts = {}): Pt => {
  const pl = placeOn(view, at, o.heightCm ?? 168, o.move), sc = pl.scale, [sx, sy] = screenOf(view, p3, o.move);
  const f = pose.facing ?? 1, dy = solveRig(pose, B(o)).dy, c = tiltCos(view, at, o.floorTilt, o.move), fy = pl.y + 590 * sc;
  const syU = fy + (sy - fy) / c; // bỏ co chiều cao do ngả theo sàn
  const lx = (sx - pl.x) / (sc * f) - pose.x, ly = (syU - pl.y) / sc - dy;
  const r = rot(lx - PELVIS.x, ly - PELVIS.y, -solveRig(pose, B(o)).tilt);
  return [r.x + PELVIS.x, r.y + PELVIS.y];
};
/** Ngược lại: điểm rig của thân → toạ độ ảnh (để đo sai số). */
export const rigToScreen = (view: RoomView, at: Pt, pose: JointPose, g: Pt, o: FrameOpts = {}): Pt => {
  const pl = placeOn(view, at, o.heightCm ?? 168, o.move), sc = pl.scale, f = pose.facing ?? 1, r = solveRig(pose, B(o));
  const q = rot(g[0] - PELVIS.x, g[1] - PELVIS.y, r.tilt), c = tiltCos(view, at, o.floorTilt, o.move), fy = pl.y + 590 * sc;
  const y = pl.y + sc * (q.y + PELVIS.y + r.dy);
  return [pl.x + f * sc * (q.x + PELVIS.x + pose.x), fy + (y - fy) * c];
};

/** Đưa cổ tay `side` chạm điểm 3D `target`; khuỷu gợi ý hạ xuống phía thân (mặc định) hoặc theo `elbow` (toạ độ rig của thân). */
export const reachWorld = (view: RoomView, at: Pt, pose: JointPose, side: 'R' | 'L', target: V3, o: FrameOpts & { elbow?: Pt; w?: number } = {}): JointPose => {
  const g = toRig(view, at, pose, target, o), r = solveRig(pose, B(o))[side === 'R' ? 'armR' : 'armL'].root;
  const mid: Pt = [(g[0] + r.x) / 2, (g[1] + r.y) / 2];
  const elbow = o.elbow ?? [mid[0] - (side === 'R' ? 26 : -26) * 0.4, mid[1] + 44];
  return armHint(pose, side, g, elbow, o.w ?? 0.25, B(o));
};
/** Sai số (px trên ảnh) giữa cổ tay `side` và điểm 3D. */
export const reachError = (view: RoomView, at: Pt, pose: JointPose, side: 'R' | 'L', target: V3, o: FrameOpts = {}) => {
  const end = solveRig(pose, B(o))[side === 'R' ? 'armR' : 'armL'].end, [x, y] = rigToScreen(view, at, pose, [end.x, end.y], o), [tx, ty] = screenOf(view, target, o.move);
  return Math.hypot(x - tx, y - ty);
};

/**
 * Hai chân khi ngồi: chiều cao hông (khớp háng) = mặt ghế + `pad` cm, cả hai bàn chân chạm sàn.
 * Đùi nghiêng `a` độ so với phương thẳng đứng (chân gần hơi cao hơn chân xa `stagger` độ để hai ống không chồng nhau), cẳng chân giải theo chiều cao hông.
 */
export const sitLegs = (seatTopCm = SURFACES.seatTop, o: { pad?: number; a?: number; stagger?: number; heightCm?: number; view?: View; build?: Partial<Build> } = {}): { legR: Limb; legL: Limb } => {
  const k = (o.heightCm ?? 168) / 590, H = (seatTopCm + (o.pad ?? 6)) / k - SOLE; // chiều cao hông so với cổ chân, đơn vị rig (đế dép thấp hơn cổ chân SOLE)
  // Giải theo chính `solveRig` của góc nhìn đang dùng (nhìn thẳng/sau lưng co đùi theo cos nên công thức đóng không đúng ở mọi góc).
  const view = o.view ?? 'three';
  const height = (a: number, b: number) => { const l = solveRig({ ...STAND_POSE, view, legR: { a, b } }, { ...DEFAULT_BUILD, ...o.build }).legR; return l.end.y - l.root.y; };
  const one = (a0: number): Limb => {
    // Người ngả theo sàn co chiều cao nên hông phải cao hơn trong hệ rig: nếu đùi nghiêng a0 độ không với tới thì nâng đùi dần (giảm a).
    for (let a = a0; a >= 15; a -= 2) {
      let best = { b: a, e: Infinity };
      for (let b = Math.max(0, a - 30); b <= Math.min(150, a + 90); b += 0.5) { const e = Math.abs(height(a, b) - H); if (e < best.e) best = { b, e }; }
      if (best.e < 1.5) return { a, b: best.b };
    }
    return { a: 15, b: 15 };
  };
  const a = o.a ?? 74, st = o.stagger ?? 8;
  return { legR: one(a - st / 2), legL: one(a + st / 2) };
};
/** Chiều cao hông thực của dáng so với mặt sàn (đáy dép), cm — để kiểm tra mặt ghế. */
export const hipHeightCm = (pose: JointPose, heightCm = 168) => {
  const r = solveRig({ ...pose, view: 'three' });
  return ((Math.max(r.legR.end.y, r.legL.end.y) - r.legR.root.y + SOLE) * heightCm) / 590;
};

export type Seated = { at: Pt; pose: JointPose };
/**
 * Người ngồi trên `chair`, hai bàn tay đặt lên mặt bàn tại `hands` (toạ độ 3D, mặc định gõ phím trước chỗ ngồi):
 * hông đúng mặt ghế, chân chạm sàn, mặt/thân quay đúng về phía bàn theo máy `view`.
 */
export const seatedAt = (view: RoomView, chair: keyof typeof SEATS, o: FrameOpts & { hands?: { R?: V3; L?: V3 }; lean?: number; base?: JointPose; /** ghế đang bị kéo/xoay */ chairState?: ChairState; /** hai tay để trong lòng (ngồi không dùng bàn) thay vì đặt lên mặt bàn */ lap?: boolean } = {}): Seated => {
  const s = seatAnchor(chair, o.chairState), { view: v, facing } = facingFor(view, s.facing, o.move);
  const legs = sitLegs(s.top, { heightCm: (o.heightCm ?? 168) * tiltCos(view, s.at, o.floorTilt, o.move), view: v as View, build: o.build });
  const hands = o.hands ?? { R: [SEATS[chair].x - 8, SURFACES.deskTop + 2, SEATS[chair].z - 48] as V3, L: [SEATS[chair].x + 14, SURFACES.deskTop + 2, SEATS[chair].z - 47] as V3 };
  let pose: JointPose = { ...(o.base ?? STAND_POSE), view: v as View, facing, ...legs, tilt: o.lean ?? 8, neck: -5, handR: 'type', handL: 'type', frontR: true, frontL: true };
  if (o.lap) {
    const sit = TWIN_POSES.sit;
    return { at: s.at, pose: { ...pose, armR: sit.armR, armL: sit.armL, handR: sit.handR, handL: sit.handL, tilt: o.lean ?? 5, neck: 0 } };
  }
  if (hands.R) pose = reachWorld(view, s.at, pose, 'R', hands.R, o);
  if (hands.L) pose = reachWorld(view, s.at, pose, 'L', hands.L, o);
  return { at: s.at, pose };
};

// ---------------------------------------------------------------------------
// NGỒI VÀO GHẾ ĐANG KÉO RA, XOAY GHẾ VỀ PHÍA BÀN, KÉO GHẾ VÀO
// ---------------------------------------------------------------------------
export type SeatingPlan = {
  chair: keyof typeof SEATS;
  /** chỗ đứng cạnh ghế (sàn, cm) trước khi ngồi: lưng quay về phía ghế, nhìn cùng hướng với người ngồi */
  standAt: Pt;
  /** ghế đang bị kéo ra / xoay lúc bắt đầu ngồi */
  pulled: ChairState;
  /** khung bắt đầu ngồi xuống */
  t0: number;
  /** số khung ngồi xuống (mặc định 24), nghỉ (mặc định 12), xoay + kéo ghế vào (mặc định 34) */
  sit?: number; hold?: number; swivel?: number;
};
const smooth = (t: number) => t * t * (3 - 2 * t);
const c01 = (v: number) => Math.min(1, Math.max(0, v));
/** Khung kết thúc của kế hoạch ngồi (đã ngồi vào bàn). */
export const seatingEnd = (p: SeatingPlan) => p.t0 + (p.sit ?? 24) + (p.hold ?? 12) + (p.swivel ?? 34);
/**
 * Người ngồi xuống ghế đang kéo ra rồi quay ghế về bàn và kéo ghế vào:
 *  1. ngồi xuống: lùi từ `standAt` vào mặt ghế, dáng đứng → ngồi (hai tay trong lòng), hông đúng mặt ghế đang ở chỗ kéo;
 *  2. nghỉ một nhịp;
 *  3. xoay ghế (`rot` về 0) và trượt ghế vào (`dx`, `dz` về 0, chậm dần): góc nhìn của người đổi theo hướng ghế qua các góc trung gian, chân giải lại theo góc,
 *     hai tay rời lòng đặt lên mặt bàn khi ghế đã gần quay về phía bàn;
 *  4. ngồi gõ phím.
 * Trả về trạng thái ghế (truyền cho `RoomScene chairPush`), vị trí sàn và dáng người. Tất định theo số khung.
 */
/**
 * Người ngồi trên ghế ở trạng thái `st` bất kỳ (kéo/xoay): hông đúng mặt ghế, góc nhìn theo hướng ghế, chân giải theo góc;
 * tay đặt lên mặt bàn khi ghế quay về phía bàn (`rot` → 0) và về lòng khi ghế quay đi (trộn dần, khuỷu duỗi qua thẳng khi đổi chiều gập).
 */
export const seatedBlend = (view: RoomView, chair: keyof typeof SEATS, st: ChairState, o: FrameOpts = {}): Seated => {
  const lap = seatedAt(view, chair, { ...o, chairState: st, lap: true }), desk = seatedAt(view, chair, { ...o, chairState: st });
  const w = smooth(c01((1.2 - Math.abs(st.rot)) / 1.2)), m = mixPose(lap.pose, desk.pose, w);
  return { at: lap.at, pose: { ...lap.pose, armR: m.armR, armL: m.armL, handR: w > 0.5 ? desk.pose.handR : lap.pose.handR, handL: w > 0.5 ? desk.pose.handL : lap.pose.handL, tilt: lap.pose.tilt + (desk.pose.tilt - lap.pose.tilt) * w, neck: lap.pose.neck + (desk.pose.neck - lap.pose.neck) * w } };
};
export const seating = (view: RoomView, plan: SeatingPlan, frame: number, o: FrameOpts = {}): { chair: ChairState; at: Pt; pose: JointPose; phase: 'sit' | 'hold' | 'swivel' | 'seated' } => {
  const sit = plan.sit ?? 24, hold = plan.hold ?? 12, sw = plan.swivel ?? 34, t1 = plan.t0 + sit, t2 = t1 + hold;
  const u = c01((frame - t2) / sw), uRot = smooth(u), uSlide = 1 - Math.pow(1 - c01((frame - t2 - 4) / (sw + 4)), 3); // ghế quay trước, trượt vào chậm dần
  const chair: ChairState = { dx: plan.pulled.dx * (1 - uSlide), dz: plan.pulled.dz * (1 - uSlide), rot: plan.pulled.rot * (1 - uRot) };
  const lap = seatedAt(view, plan.chair, { ...o, chairState: chair, lap: true });
  if (frame < t1) {
    const k = c01((frame - plan.t0) / sit), seat = lap.at, fromView = facingFor(view, seatAnchor(plan.chair, plan.pulled).facing, o.move);
    const stand = { ...STAND_POSE, view: fromView.view, facing: fromView.facing };
    return { chair, at: [plan.standAt[0] + (seat[0] - plan.standAt[0]) * smooth(k), plan.standAt[1] + (seat[1] - plan.standAt[1]) * smooth(k)], pose: easePose(stand, lap.pose, k, { anticipate: 2 }), phase: 'sit' };
  }
  if (frame < t2) return { chair, at: lap.at, pose: lap.pose, phase: 'hold' };
  const { pose } = seatedBlend(view, plan.chair, chair, o);
  return { chair, at: lap.at, pose, phase: u >= 1 ? 'seated' : 'swivel' };
};
