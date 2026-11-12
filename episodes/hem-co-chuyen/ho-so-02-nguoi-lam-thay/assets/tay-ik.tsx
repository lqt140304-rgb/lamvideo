import { Build, DEFAULT_BUILD, JointPose, solveRig } from './nhan-vat';

/**
 * Đặt bàn tay vào `hand` với khuỷu tay gần `elbow` nhất (toạ độ rig: vai gần máy ≈ (-68, 232), vai xa ≈ (62, 232),
 * tâm đầu ≈ (10, 105), miệng ≈ (10, 145), tai ≈ (-70, 112), hông ≈ y 345). Khác `armTo` cũ: cho phép khuỷu nâng cao hơn vai
 * và chọn đúng phía khuỷu, nên tay đưa lên đầu/mặt không bị gập ngược hay vắt chéo người.
 */
export const armHint = (p: JointPose, side: 'R' | 'L', hand: [number, number], elbow: [number, number], w = 0.35, build: Build = DEFAULT_BUILD): JointPose => {
  const k = side === 'R' ? 'armR' : 'armL';
  let best = { s: Infinity, a: 0, b: 0, rot: 1 as 1 | -1 };
  for (let a = -180; a <= 180; a += 3) for (let b = 0; b <= 150; b += 3) for (const rot of [1, -1] as const) {
    const r = solveRig({ ...p, [k]: { a, b, rot } }, build)[k];
    const s = Math.hypot(r.end.x - hand[0], r.end.y - hand[1]) + w * Math.hypot(r.mid.x - elbow[0], r.mid.y - elbow[1]);
    if (s < best.s) best = { s, a, b, rot };
  }
  return { ...p, [k]: { a: best.a, b: best.b, rot: best.rot } };
};
