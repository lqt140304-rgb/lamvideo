import { Build, DEFAULT_BUILD, JointPose, Limb, solveRig, STAND_POSE, View } from './nhan-vat';
import { armHint } from './tay-ik';
import { CameraMove, placeOn, RoomView, screenOf, SEATS, tiltCos } from './boi-canh/boi-canh';
import { facingFor, Pt } from './di-chuyen';

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
/** Chỗ ngồi: vị trí sàn của người ngồi và hướng nhìn (về phía mặt bàn là −z). */
export const seatAnchor = (chair: keyof typeof SEATS): { at: Pt; top: number; facing: Pt } => {
  const s = SEATS[chair];
  return { at: [s.x, s.z], top: SURFACES.seatTop, facing: [Math.sin(s.a + Math.PI), Math.cos(s.a + Math.PI)] };
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
export const seatedAt = (view: RoomView, chair: keyof typeof SEATS, o: FrameOpts & { hands?: { R?: V3; L?: V3 }; lean?: number; base?: JointPose } = {}): Seated => {
  const s = seatAnchor(chair), { view: v, facing } = facingFor(view, s.facing, o.move);
  const legs = sitLegs(s.top, { heightCm: (o.heightCm ?? 168) * tiltCos(view, s.at, o.floorTilt, o.move), view: v as View, build: o.build });
  const hands = o.hands ?? { R: [SEATS[chair].x - 8, SURFACES.deskTop + 2, SEATS[chair].z - 48] as V3, L: [SEATS[chair].x + 14, SURFACES.deskTop + 2, SEATS[chair].z - 47] as V3 };
  let pose: JointPose = { ...(o.base ?? STAND_POSE), view: v as View, facing, ...legs, tilt: o.lean ?? 8, neck: -5, handR: 'type', handL: 'type', frontR: true, frontL: true };
  if (hands.R) pose = reachWorld(view, s.at, pose, 'R', hands.R, o);
  if (hands.L) pose = reachWorld(view, s.at, pose, 'L', hands.L, o);
  return { at: s.at, pose };
};
