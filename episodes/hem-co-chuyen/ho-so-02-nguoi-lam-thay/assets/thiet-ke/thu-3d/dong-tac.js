// Động tác cơ bản cho Nam 3D (bản thử). Tất định theo thời gian t (giây): cùng t → cùng dáng.
// Trả về { x, z, yaw, dy, pose } — x/z (cm) toạ độ sàn phòng, yaw quay người (0 = nhìn +z, về máy ở cảnh 'wide'),
// dy nâng/hạ hông, pose = góc khớp (rad) truyền vào `nam.pose()`.
// Quy ước khớp (trục x): chân/tay xoay x âm = đưa ra trước; gối x dương = gập; thân x dương = cúi tới.

import { LEG } from './nam-3d.js';
const LEG_LEN = LEG.thigh + LEG.shin;

export const BASE_POSE = {
  spine: [0.02, 0, 0], chest: [0, 0, 0], neck: [0.03, 0, 0], head: [-0.01, 0, 0], hips: [0, 0, 0],
  shoulderL: [0.03, 0, 0.12], shoulderR: [0.03, 0, -0.12], elbowL: [-0.1, 0, -0.04], elbowR: [-0.1, 0, 0.04],
  wristL: [0, 0, 0], wristR: [0, 0, 0],
  hipL: [0, 0, 0.02], hipR: [0, 0, -0.02], kneeL: [0, 0, -0.02], kneeR: [0, 0, 0.02], ankleL: [0, 0.12, 0], ankleR: [0, -0.12, 0],
};

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => t * t * (3 - 2 * t);
const ramp = (t, a, b) => ease(clamp((t - a) / (b - a)));
const lerp = (a, b, w) => a + (b - a) * w;
const add = (P, k, v) => { const o = P[k] || [0, 0, 0]; P[k] = [o[0] + v[0], o[1] + v[1], o[2] + v[2]]; };
const mixPose = (A, B, w) => Object.fromEntries(Object.keys(A).map((k) => [k, A[k].map((v, i) => lerp(v, B[k][i], w))]));
const clone = (P) => Object.fromEntries(Object.entries(P).map(([k, v]) => [k, [...v]]));

/** Dáng đi theo pha (chu kỳ = 2 bước). */
export function walkPose(phase, amt = 1) {
  const P = clone(BASE_POSE), a = 2 * Math.PI * phase, s = Math.sin(a);
  const swing = 0.42 * amt;
  add(P, 'hipL', [-swing * s, 0, 0]); add(P, 'hipR', [swing * s, 0, 0]);
  const kL = 0.08 + 0.62 * Math.max(0, Math.cos(a)) ** 1.4, kR = 0.08 + 0.62 * Math.max(0, -Math.cos(a)) ** 1.4; // gối gập khi chân đưa lên
  add(P, 'kneeL', [kL * amt, 0, 0]); add(P, 'kneeR', [kR * amt, 0, 0]);
  add(P, 'ankleL', [(swing * s - kL * 0.55) * amt * 0.6, 0, 0]); add(P, 'ankleR', [(-swing * s - kR * 0.55) * amt * 0.6, 0, 0]);
  add(P, 'shoulderL', [0.38 * s * amt, 0, 0]); add(P, 'shoulderR', [-0.38 * s * amt, 0, 0]);
  add(P, 'elbowL', [-0.22 * amt * (1 + s) * 0.5, 0, 0]); add(P, 'elbowR', [-0.22 * amt * (1 - s) * 0.5, 0, 0]);
  add(P, 'hips', [0, 0.09 * s * amt, 0.02 * Math.cos(a) * amt]); add(P, 'chest', [0, -0.12 * s * amt, 0]);
  add(P, 'spine', [0.05 * amt, 0, 0]);
  return { P, dy: amt * (1.0 * Math.cos(2 * a) - 1.0) * 0.5 };
}

/** Ngồi xổm/nhún theo góc đùi th (0 = đứng). Giữ bàn chân bám sàn: hạ hông đúng theo độ dài đùi + cẳng. */
export function squatPose(th, P0 = BASE_POSE) {
  const P = clone(P0);
  for (const k of ['L', 'R']) { add(P, 'hip' + k, [-th, 0, 0]); add(P, 'knee' + k, [2 * th, 0, 0]); add(P, 'ankle' + k, [-th, 0, 0]); }
  add(P, 'spine', [0.38 * th, 0, 0]); add(P, 'neck', [-0.15 * th, 0, 0]);
  add(P, 'shoulderL', [-0.85 * th, 0, 0]); add(P, 'shoulderR', [-0.85 * th, 0, 0]); // tay đưa trước giữ thăng bằng
  return { P, dy: -LEG_LEN * (1 - Math.cos(th)) };
}

// ---------------- Kịch bản 14 s ----------------
export const DURATION = 14;
const X0 = 55, X1 = 200, Z = 300, CYCLE = 50; // đi ngang trước giường bên trái, mỗi chu kỳ 2 bước ~50 cm (chân ngắn theo mẫu 3D)
const T = { look: [0, 2.2], turn1: [2.2, 2.7], walk: [2.7, 6.2], turn2: [6.2, 6.8], wave: [6.8, 9.0], stretch: [9.0, 11.0], squat: [11.0, 12.6], jump: [12.6, 14] };

const walkDist = (t) => { // quãng đi (cm) có tăng/giảm tốc
  const [a, b] = T.walk, u = clamp((t - a) / (b - a)), acc = 0.18;
  const v = u < acc ? (u * u) / (2 * acc) : u < 1 - acc ? u - acc / 2 : (1 - acc) - ((1 - u) ** 2) / (2 * acc);
  return (X1 - X0) * v / (1 - acc);
};

export function motionAt(t) {
  let x = X0, yaw = 0.45, dy = 0, P = clone(BASE_POSE);
  // 1. nhìn quanh (đầu xoay nhiều, cổ ít)
  if (t < T.look[1]) {
    const hy = 0.55 * Math.sin(Math.PI * clamp(t / 0.9)) * (t < 0.9 ? 1 : 0) - 0.5 * Math.sin(Math.PI * clamp((t - 0.9) / 1.1)) * (t >= 0.9 ? 1 : 0);
    add(P, 'head', [0, hy * 0.7, 0]); add(P, 'neck', [0, hy * 0.3, 0]);
  }
  // 2. quay sang phải để đi
  if (t >= T.turn1[0]) yaw = lerp(0.45, Math.PI / 2, ramp(t, ...T.turn1));
  // 3. đi
  if (t >= T.walk[0]) {
    const d = walkDist(t), amt = clamp(Math.min((t - T.walk[0]) / 0.35, (T.walk[1] - t) / 0.35)), w = walkPose(d / CYCLE, amt);
    x = X0 + d; P = w.P; dy = w.dy;
    if (t < T.walk[1]) { add(P, 'head', [0, 0, 0]); }
  }
  // 4. dừng, quay về máy
  if (t >= T.turn2[0]) { yaw = lerp(Math.PI / 2, 0.12, ramp(t, ...T.turn2)); P = clone(BASE_POSE); dy = 0; x = X1; }
  // 5. vẫy tay phải
  if (t >= T.wave[0] && t < T.wave[1]) {
    const up = ramp(t, T.wave[0], T.wave[0] + 0.45) * (1 - ramp(t, T.wave[1] - 0.45, T.wave[1]));
    const wv = Math.sin(2 * Math.PI * 2.2 * (t - T.wave[0]));
    add(P, 'shoulderR', [-0.12 * up, 0, -1.3 * up]); add(P, 'elbowR', [0, 0, (-1.05 + 0.38 * wv) * up]); // cánh tay ngang, cẳng tay dựng, lắc qua lại
    add(P, 'chest', [0, 0, 0.05 * up]); add(P, 'head', [0, -0.12 * up, 0.08 * up]);
  }
  // 6. vươn vai
  if (t >= T.stretch[0] && t < T.stretch[1]) {
    const k = ramp(t, T.stretch[0], T.stretch[0] + 0.7) * (1 - ramp(t, T.stretch[1] - 0.6, T.stretch[1]));
    add(P, 'shoulderL', [-0.1 * k, 0, 2.25 * k]); add(P, 'shoulderR', [-0.1 * k, 0, -2.25 * k]); // tay chibi ngắn: dang chéo lên thành chữ V
    add(P, 'elbowL', [0, 0, 0.12 * k]); add(P, 'elbowR', [0, 0, -0.12 * k]);
    add(P, 'spine', [-0.14 * k, 0, 0]); add(P, 'neck', [-0.2 * k, 0, 0]); add(P, 'head', [-0.25 * k, 0, 0]);
    dy += 1.2 * k;
  }
  // 7. ngồi xổm rồi đứng dậy
  if (t >= T.squat[0] && t < T.squat[1]) {
    const k = ramp(t, T.squat[0], T.squat[0] + 0.6) * (1 - ramp(t, T.squat[1] - 0.6, T.squat[1]));
    const s = squatPose(1.05 * k, P); P = s.P; dy = s.dy;
  }
  // 8. nhảy nhẹ: lấy đà – bật – trên không – tiếp đất nhún – đứng
  if (t >= T.jump[0]) {
    const u = t - T.jump[0];
    const crouch = u < 0.32 ? 0.55 * ease(u / 0.32) : u < 0.4 ? 0.55 * (1 - ease((u - 0.32) / 0.08)) : u < 0.78 ? 0.18 * Math.sin(Math.PI * (u - 0.4) / 0.38) : u < 0.9 ? 0.5 * ease((u - 0.78) / 0.12) : 0.5 * (1 - ease(clamp((u - 0.9) / 0.4)));
    const s = squatPose(crouch, P); P = s.P; dy = s.dy;
    if (u >= 0.4 && u < 0.78) { const v = (u - 0.4) / 0.38; dy += 16 * 4 * v * (1 - v); }
    const arms = u < 0.32 ? 0.6 * ease(u / 0.32) : u < 0.55 ? lerp(0.6, -2.4, ease((u - 0.32) / 0.23)) : u < 0.9 ? lerp(-2.4, 0, ease((u - 0.55) / 0.35)) : 0;
    add(P, 'shoulderL', [arms + 0.85 * crouch, 0, 0]); add(P, 'shoulderR', [arms + 0.85 * crouch, 0, 0]); // tay vung sau rồi lên
  }
  // thở nhẹ luôn có
  const br = Math.sin(t * 2 * Math.PI / 3.2);
  add(P, 'chest', [0.012 * br, 0, 0]);
  return { x, z: Z, yaw, dy, pose: P, breath: br };
}
