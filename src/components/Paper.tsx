import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { color } from "../brand";

/**
 * Nền giấy + bộ lọc "nét run" dùng chung. Mọi hình vẽ đặt filter="url(#boil)" sẽ rung nhẹ
 * như hoạt hình vẽ tay (đổi seed mỗi 4 khung hình).
 */
export const Paper: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 4) % 3;
  return (
    <AbsoluteFill style={{ backgroundColor: color.paper }}>
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="boil" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={seed} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
          </filter>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="7" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.07 0" />
          </filter>
        </defs>
        <rect width="1080" height="1920" filter="url(#grain)" />
        {/* vài nét kẻ mờ như giấy vở */}
        {Array.from({ length: 24 }, (_, i) => (
          <line key={i} x1="0" x2="1080" y1={120 + i * 76} y2={120 + i * 76} stroke={color.paperDark} strokeWidth="2" />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
