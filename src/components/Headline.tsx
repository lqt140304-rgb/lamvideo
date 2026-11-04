import React from "react";
import { useCurrentFrame } from "remotion";
import { pop } from "../anim";
import { color, font } from "../brand";

/** Tiêu đề lớn của cảnh, bật lên từ trên xuống. */
export const Headline: React.FC<{
  text: string;
  top?: number;
  size?: number;
  delay?: number;
  highlight?: boolean;
}> = ({ text, top = 330, size = 84, delay = 0, highlight = false }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, delay);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 70,
        right: 70,
        textAlign: "center",
        fontFamily: font.display,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.05,
        color: color.ink,
        opacity: Math.min(1, p * 1.5),
        transform: `translateY(${(1 - p) * -40}px) rotate(${(1 - p) * -3}deg)`,
      }}
    >
      <span
        style={
          highlight
            ? {
                background: color.yellow,
                padding: "0 18px",
                borderRadius: 12,
                boxDecorationBreak: "clone",
                WebkitBoxDecorationBreak: "clone",
              }
            : undefined
        }
      >
        {text}
      </span>
    </div>
  );
};

/** Lớp SVG phủ toàn khung để vẽ nhân vật, xe, bản đồ. */
export const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    {children}
  </svg>
);
