import React from "react";
import { useCurrentFrame, staticFile } from "remotion";
import { pop } from "../anim";
import { MASCOT, type MascotPose } from "../mascot";

// Mascot của kênh: cậu bé tóc nâu đen, hoodie xanh, giày thể thao.
// Ảnh PNG nền trong suốt ở public/mascot/<tư thế>.png, cắt bằng tools/mascot_cutout.py.
// Mọi tư thế cùng tỉ lệ và cùng đường mặt đất, nên đổi tư thế giữa cảnh không bị nhảy hình.

/** `scale` = 1 tương đương mascot đứng cao ~520px. */
const BASE = 520 / 1040;

type Props = {
  pose?: MascotPose;
  /** Tọa độ điểm giữa hai bàn chân. */
  x: number;
  y: number;
  scale?: number;
  /** Lật ngang. Tránh dùng với tư thế có chữ (dấu "?" sẽ bị ngược). */
  flip?: boolean;
  /** Khung hình bắt đầu xuất hiện (hiệu ứng bật lên). */
  enter?: number;
  /** Khung hình đổi tư thế gần nhất, để nảy nhẹ khi đổi. */
  changedAt?: number;
  /** Xoay màu (độ) để phân biệt nhân vật. */
  hue?: number;
};

export const Mascot: React.FC<Props> = ({ pose = "stand", x, y, scale = 1, flip, enter = 0, changedAt, hue }) => {
  const frame = useCurrentFrame();
  const info = (MASCOT as Record<string, { w: number; h: number; footX: number; footY: number }>)[pose] ?? MASCOT.stand;
  const p = pop(frame, enter);
  const bounce = changedAt !== undefined && frame >= changedAt ? 1 + 0.06 * Math.max(0, 1 - (frame - changedAt) / 6) : 1;
  const s = scale * BASE * (0.6 + 0.4 * Math.min(p, 1.08));
  // nhún nhẹ: co giãn theo chiều dọc quanh bàn chân, không làm chân rời mặt đất
  const breathe = 1 + Math.sin(frame / 9) * 0.008;
  return (
    <g transform={`translate(${x} ${y})`} opacity={Math.min(1, p * 2)}>
      <ellipse cx={0} cy={0} rx={150 * s * 1.0} ry={18 * s} fill="rgba(29,27,25,0.13)" />
      <g transform={`scale(${s * (flip ? -1 : 1) * bounce} ${s * breathe * bounce})`}>
        <image href={staticFile(`mascot/${pose}.png`)} x={-info.footX} y={-info.footY} width={info.w} height={info.h} style={hue ? { filter: `hue-rotate(${hue}deg)` } : undefined} />
      </g>
    </g>
  );
};
