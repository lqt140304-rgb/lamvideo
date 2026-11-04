import React from "react";
import { AbsoluteFill, Audio, Sequence, random, staticFile, useCurrentFrame } from "remotion";
import { color } from "../brand";
import { ease, pop } from "../anim";

// Hiệu ứng hình (VFX) và âm thanh (SFX) vẽ bằng code: không cần tải gì, không lo bản quyền.

export type SfxName = "whoosh" | "swoosh" | "pop" | "ding" | "stamp" | "tick" | "shutter";

const SFX_FRAMES: Record<SfxName, number> = { whoosh: 14, swoosh: 18, pop: 6, ding: 36, stamp: 12, tick: 4, shutter: 9 };

/** Phát một âm thanh hiệu ứng tại khung hình `at` (tính trong cảnh hiện tại). */
export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number }> = ({ name, at, volume = 0.5 }) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={SFX_FRAMES[name as SfxName] + 2} name={`sfx ${name}`}>
    <Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

/** Tia nét vẽ tay bung ra quanh một điểm (kiểu truyện tranh) khi có gì đó xuất hiện. Dùng trong <svg>. */
export const Burst: React.FC<{ x: number; y: number; at: number; r?: number; tint?: string; rays?: number; seed?: number }> = ({
  x,
  y,
  at,
  r = 70,
  tint = color.ink,
  rays = 8,
  seed = 1,
}) => {
  const frame = useCurrentFrame();
  const t = (frame - at) / 12;
  if (t < 0 || t > 1) return null;
  const grow = Math.sin(Math.min(1, t * 1.6) * (Math.PI / 2));
  return (
    <g opacity={1 - t ** 2}>
      {Array.from({ length: rays }, (_, i) => {
        const a = (i / rays) * Math.PI * 2 + random(`b${seed}-${i}`) * 0.4;
        const r0 = r * (0.55 + 0.45 * grow);
        const r1 = r0 + r * 0.55 * (1 - t) + 6;
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * r0}
            y1={y + Math.sin(a) * r0}
            x2={x + Math.cos(a) * r1}
            y2={y + Math.sin(a) * r1}
            stroke={tint}
            strokeWidth={7}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

/** Tia sốc tỏa từ một điểm, quay chậm (đặt sau nhân vật khi hoảng hốt). Dùng trong <svg>. */
export const ShockLines: React.FC<{ x: number; y: number; at: number; r?: number }> = ({ x, y, at, r = 360 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = ease(frame, at, 8);
  const spin = (frame - at) * 0.4;
  const n = 18;
  return (
    <g opacity={0.9 * p} transform={`translate(${x} ${y}) rotate(${spin})`}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * 360;
        const w = 9 + random(`s${i}`) * 9;
        return (
          <path
            key={i}
            d={`M${r * 0.42} ${-w} L${r * (0.95 + random(`l${i}`) * 0.25)} 0 L${r * 0.42} ${w} Z`}
            fill={i % 2 ? color.yellow : color.ink}
            opacity={i % 2 ? 0.85 : 0.18}
            transform={`rotate(${a})`}
          />
        );
      })}
    </g>
  );
};

/** Pháo giấy rơi (cảnh kết). Toàn khung hình. */
export const Confetti: React.FC<{ at: number; count?: number }> = ({ at, count = 46 }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return null;
  const palette = [color.yellow, color.red, color.green, color.ink, "#4C7BD9"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: count }, (_, i) => {
          const sx = 540 + (random(`cx${i}`) - 0.5) * 300;
          const vx = (random(`vx${i}`) - 0.5) * 34;
          const vy = -26 - random(`vy${i}`) * 22;
          const g = 1.15;
          const drag = Math.min(t, 40);
          const x = sx + vx * drag * 0.9 + Math.sin(t / 5 + i) * 18;
          const y = 980 + vy * drag + 0.5 * g * drag * drag + Math.max(0, t - 40) * 6;
          if (y > 2000) return null;
          const rot = t * (8 + random(`r${i}`) * 14) * (i % 2 ? 1 : -1);
          const w = 16 + random(`w${i}`) * 14;
          return (
            <rect
              key={i}
              x={-w / 2}
              y={-w / 4}
              width={w}
              height={w / 2}
              rx={3}
              fill={palette[i % palette.length]}
              transform={`translate(${x} ${y}) rotate(${rot}) scale(1 ${Math.cos(t / 3 + i)})`}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Chuyển cảnh: một dải vàng viền mực quét chéo qua màn hình trong ~9 khung. */
export const Wipe: React.FC<{ duration?: number }> = ({ duration = 9 }) => {
  const frame = useCurrentFrame();
  const t = frame / duration;
  if (t < 0 || t > 1) return null;
  const x = -1500 + 3200 * (1 - (1 - t) ** 2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${x} 960) rotate(-18)`}>
          <rect x={-170} y={-1400} width={340} height={2800} fill={color.yellow} stroke={color.ink} strokeWidth={10} />
          <rect x={200} y={-1400} width={46} height={2800} fill={color.ink} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Lóe sáng trắng ngắn (chụp ảnh). */
export const Flash: React.FC<{ at: number; frames?: number }> = ({ at, frames = 6 }) => {
  const frame = useCurrentFrame();
  const t = (frame - at) / frames;
  if (t < 0 || t > 1) return null;
  return <AbsoluteFill style={{ background: "#fff", opacity: (1 - t) ** 1.5 * 0.85, pointerEvents: "none" }} />;
};

/** Nảy nhẹ cho phần tử SVG/HTML khi xuất hiện, dùng lại cho các hiệu ứng khác. */
export const usePop = (at: number) => pop(useCurrentFrame(), at);
