import React from 'react';
import { CameraMove, FAN_HEAD, fanYaw, placeOn, RoomView } from './boi-canh/boi-canh';

/**
 * TƯƠNG TÁC NHÂN VẬT – BỐI CẢNH (Hồ sơ 02, 11/11/2026).
 *
 * Bối cảnh tự chuyển động (`RoomScene frame`) và nhân vật tự sống (`song-dong.tsx`, `vat-ly.tsx`) nhưng hai bên chưa tác động
 * lên nhau. Mô-đun này nối hai chiều, mọi thứ TẤT ĐỊNH theo số khung (Remotion render lại khung bất kỳ ra cùng kết quả):
 *  - người → đồ vật: va vào ghế thì ghế trượt, xoay rồi dừng do ma sát (`pushedObject` → `RoomScene chairPush`);
 *  - người → sàn: mỗi bước chân, chỗ ghế trượt cào sàn tung bụi nhỏ (`Dust`);
 *  - môi trường → người: gió quạt (đúng vị trí và hướng quay của quạt trong phòng) thổi tóc, vạt áo (`fanWind`);
 *  - va chạm → máy quay: rung máy ngắn tắt dần (`cameraShake` → `RoomScene move`).
 * Đơn vị: cm trong phòng, số khung ở 30 fps.
 */

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// ---------------------------------------------------------------------------
// Đồ vật bị xô: trượt + xoay, ma sát sàn làm dừng hẳn (không bật lại như lò xo)
// ---------------------------------------------------------------------------
export type Shove = { f: number; vx: number; vz: number; spin: number }; // vận tốc truyền vào lúc va (cm/khung, rad/khung)
export type ObjState = { dx: number; dz: number; rot: number; speed: number };
/** Ma sát mỗi khung: 0,86 ≈ ghế gỗ trên gạch, trượt ~15–20 cm sau cú va đi bộ. */
export const pushedObject = (frame: number, shoves: Shove[], friction = 0.86, spinFriction = 0.84): ObjState => {
  let dx = 0, dz = 0, rot = 0, vx = 0, vz = 0, w = 0;
  for (let f = 0; f <= frame; f++) {
    for (const s of shoves) if (s.f === f) { vx += s.vx; vz += s.vz; w += s.spin; }
    dx += vx; dz += vz; rot += w;
    vx *= friction; vz *= friction; w *= spinFriction;
    if (Math.hypot(vx, vz) < 0.02) { vx = 0; vz = 0; } // ma sát tĩnh: dưới ngưỡng thì đứng hẳn
    if (Math.abs(w) < 0.0005) w = 0;
  }
  return { dx, dz, rot, speed: Math.hypot(vx, vz) };
};

// ---------------------------------------------------------------------------
// Rung máy khi va chạm
// ---------------------------------------------------------------------------
export const cameraShake = (frame: number, hits: { f: number; amp: number }[]): CameraMove => {
  let truck = 0, push = 0;
  for (const h of hits) {
    const t = frame - h.f;
    if (t < 0 || t > 24) continue;
    const e = Math.exp(-t / 5) * h.amp;
    truck += e * Math.sin(t * 1.9);
    push += 0.5 * e * Math.sin(t * 2.7 + 1);
  }
  return { truck, push };
};

// ---------------------------------------------------------------------------
// Gió quạt: lấy đúng hướng quay của quạt trong phòng tại khung đó
// ---------------------------------------------------------------------------
/** Độ mạnh gió 0–1 tại chỗ đứng `at` (cm): trong nón ~50° trước quạt, giảm theo khoảng cách, có cơn giật nhẹ. */
export const fanWind = (frame: number, at: [number, number], reach = 320) => {
  const yaw = fanYaw(frame), nx = Math.sin(yaw), nz = Math.cos(yaw); // trục thổi của quạt (cùng công thức với hình quạt)
  const dx = at[0] - FAN_HEAD[0], dz = at[1] - FAN_HEAD[2], d = Math.hypot(dx, dz) || 1;
  const cos = (dx * nx + dz * nz) / d;
  const cone = clamp((cos - 0.62) / 0.3, 0, 1), fall = clamp(1 - d / reach, 0, 1);
  const gust = 0.75 + 0.25 * Math.sin(frame / 7.3) * Math.sin(frame / 3.1 + 1.3);
  return { strength: cone * fall * gust, dirX: nx, dirZ: nz };
};
/** Đổi gió thành độ lệch tóc/vạt áo cho nhân vật quay mặt `facing` (1 = sang phải màn hình). */
export const windSway = (frame: number, at: [number, number], facing: 1 | -1 = 1) => {
  const w = fanWind(frame, at);
  const side = Math.sign(w.dirX) * facing; // gió từ sau lưng thổi tới trước = +1
  const flutter = Math.sin(frame / 2.3) * 0.35 + Math.sin(frame / 1.7 + 2) * 0.2;
  return {
    hair: { rot: side * w.strength * (6 + 2.5 * flutter), dx: side * w.strength * 2.2, dy: -w.strength * 0.8 },
    hem: { dx: side * w.strength * (5 + 2 * flutter), dy: -w.strength * 1.5 },
    strength: w.strength,
  };
};

// ---------------------------------------------------------------------------
// Bụi: bước chân, chân ghế cào sàn
// ---------------------------------------------------------------------------
export type DustEvent = { f: number; at: [number, number]; amount?: number; dir?: number };
const hash = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
/** Vẽ các cụm bụi đang còn sống ở khung `frame` (đặt trong `RoomScene` children hoặc sau phòng, cùng `view`/`move`). */
export const Dust: React.FC<{ frame: number; events: DustEvent[]; view: RoomView; move?: CameraMove; life?: number; color?: string }> = ({ frame, events, view, move, life = 22, color = '#efe5d3' }) => (
  <g data-layer="dust" pointerEvents="none">
    {events.flatMap((e, ei) => {
      const t = (frame - e.f) / life;
      if (t < 0 || t > 1) return [];
      const n = Math.round(5 * (e.amount ?? 1));
      return Array.from({ length: n }, (_, i) => {
        const r1 = hash(ei * 31 + i), r2 = hash(ei * 17 + i * 3 + 5);
        const ang = (e.dir ?? 0) + (r1 - 0.5) * 2.4, sp = 6 + 10 * r2; // cm bay ra theo mặt sàn
        const ease = 1 - (1 - t) * (1 - t);
        const p = placeOn(view, [e.at[0] + Math.cos(ang) * sp * ease, e.at[1] + Math.sin(ang) * sp * ease * 0.6], 168, move);
        const pxcm = p.scale * (590 / 168);
        const floorY = p.y + 590 * p.scale;
        const rise = (3 + 6 * r2) * ease * pxcm;
        const rad = (2.5 + 6 * t + 3 * r1) * pxcm * (e.amount ?? 1) ** 0.5;
        return <ellipse key={`${ei}-${i}`} cx={p.x} cy={floorY - rise} rx={rad} ry={rad * 0.55} fill={color} opacity={0.6 * (1 - t) * (1 - t)} />;
      });
    })}
  </g>
);

/** Khung đặt chân khi đi theo `sampleWalk(phase)`: hai bước mỗi chu kỳ (pha 0 và 0,5). */
export const footFalls = (from: number, to: number, phaseAt: (f: number) => number) => {
  const out: number[] = [];
  for (let f = from + 1; f <= to; f++) if (Math.floor(phaseAt(f) * 2) !== Math.floor(phaseAt(f - 1) * 2)) out.push(f);
  return out;
};
