import React from "react";
import { useCurrentFrame, staticFile } from "remotion";
import { color } from "../brand";
import { pop } from "../anim";
import type { MascotPose } from "../types";

// Mascot của kênh: cậu bé tóc đen, áo hoodie xám, chân que. Ảnh PNG nền trong suốt trong public/mascot/.
// Mặt luôn "lạnh tanh" nên cảm xúc thể hiện bằng tư thế + biểu tượng nhỏ (emote) bên cạnh.

const W = 520;
const H = 720;
/** `scale` = 1 tương đương mascot cao ~520px. */
const BASE = 520 / H;

export type Emote = "alert" | "sweat" | "none";

type Props = {
  pose?: MascotPose;
  emote?: Emote;
  /** Bắt đầu hiện emote ở khung hình này (mặc định hiện ngay). */
  emoteAt?: number;
  /** Tọa độ giữa hai bàn chân. */
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  /** Khung hình bắt đầu xuất hiện (hiệu ứng bật lên). */
  enter?: number;
};

export const Mascot: React.FC<Props> = ({ pose = "arms", emote = "none", emoteAt = 0, x, y, scale = 1, flip, enter = 0 }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, enter);
  const s = scale * BASE * (0.6 + 0.4 * Math.min(p, 1.08));
  const bob = Math.sin(frame / 8) * 3;
  const side = flip ? -1 : 1;
  const e = pop(frame, emoteAt + 2, 220);
  const shake = emote === "alert" && frame >= emoteAt ? Math.sin(frame * 1.7) * 3 * Math.max(0, 1 - (frame - emoteAt) / 24) : 0;
  return (
    <g transform={`translate(${x + shake} ${y}) scale(${s * side} ${s})`} opacity={Math.min(1, p * 2)}>
      <g transform={`translate(0 ${bob / s})`}>
        <image href={staticFile(`mascot/${pose}.png`)} x={-W / 2} y={-H} width={W} height={H} />
        {emote === "alert" && frame >= emoteAt && (
          <g transform={`translate(-170 -620) scale(${e * 1.25 * side} ${e * 1.25})`}>
            <path
              d="M0 -70 L18 -30 L62 -48 L40 -6 L84 14 L36 28 L50 70 L8 44 L-22 80 L-26 36 L-76 40 L-44 6 L-80 -26 L-34 -24 Z"
              fill={color.yellow}
              stroke={color.ink}
              strokeWidth={8}
              strokeLinejoin="round"
            />
            <text x={2} y={22} textAnchor="middle" fontSize={78} fontWeight={900} fill={color.ink} style={{ fontFamily: "Inter Display, Inter, sans-serif" }}>
              ?!
            </text>
          </g>
        )}
        {emote === "sweat" && frame >= emoteAt && (
          <g transform={`translate(${-150} ${-540 + (1 - e) * -30}) scale(${e * side} ${e})`}>
            <path d="M0 -44 C20 -12 34 6 34 24 A34 34 0 0 1 -34 24 C-34 6 -20 -12 0 -44 Z" fill="#8FD3F4" stroke={color.ink} strokeWidth={7} strokeLinejoin="round" />
          </g>
        )}
      </g>
    </g>
  );
};
