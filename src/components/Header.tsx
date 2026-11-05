import React from "react";
import { color, font, brand } from "../brand";

/** Nhãn kênh + chủ đề ở đầu khung, thanh tiến độ mỏng bên dưới. */
export const Header: React.FC<{ topic: string; progress: number; onDark?: boolean }> = ({ topic, progress, onDark }) => (
  <div style={{ position: "absolute", top: 150, left: 70, right: 70 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div
        style={{
          background: color.ink,
          color: color.yellow,
          fontFamily: font.display,
          fontWeight: 900,
          fontSize: 34,
          letterSpacing: 2,
          padding: "10px 20px",
          borderRadius: 14,
          transform: "rotate(-2deg)",
        }}
      >
        {brand.channel}
      </div>
      <div
        style={{
          fontFamily: font.display,
          fontWeight: 800,
          fontSize: 36,
          color: onDark ? "#F6F0E1" : color.ink,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {topic}
      </div>
    </div>
    <div style={{ marginTop: 22, height: 10, borderRadius: 5, background: onDark ? "rgba(246,240,225,0.25)" : color.paperDark, overflow: "hidden" }}>
      <div style={{ width: `${progress * 100}%`, height: "100%", background: onDark ? color.yellow : color.ink }} />
    </div>
  </div>
);
