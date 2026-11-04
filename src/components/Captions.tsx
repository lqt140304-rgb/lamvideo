import React from "react";
import { useCurrentFrame } from "remotion";
import { color, font } from "../brand";

const MAX_WORDS = 6;

type Chunk = { words: string[]; weight: number };

/** Cắt phụ đề thành cụm ngắn (theo dấu câu, tối đa 6 chữ). */
export const chunkSubtitle = (text: string): Chunk[] => {
  // Chỉ cắt ở dấu câu đứng trước khoảng trắng, để "46.000đ" hay "1/7/2026" không bị tách.
  const phrases = text.split(/(?<=[.,!?:;])\s+/);
  const chunks: Chunk[] = [];
  for (const phrase of phrases) {
    const words = phrase.trim().split(/\s+/).filter(Boolean);
    if (!words.length) continue;
    const parts = Math.ceil(words.length / MAX_WORDS);
    const size = Math.ceil(words.length / parts);
    for (let i = 0; i < words.length; i += size) {
      const slice = words.slice(i, i + size);
      chunks.push({ words: slice, weight: slice.length + 0.6 });
    }
  }
  return chunks;
};

/**
 * Phụ đề kiểu Shorts: chữ trắng viền đen, chữ đang đọc tô vàng.
 * Thời gian chia theo số chữ trên độ dài giọng đọc của cảnh.
 */
export const Captions: React.FC<{ text: string; speechFrames: number }> = ({ text, speechFrames }) => {
  const frame = useCurrentFrame();
  const chunks = chunkSubtitle(text);
  const total = chunks.reduce((s, c) => s + c.weight, 0);
  let start = 0;
  let current = chunks[chunks.length - 1];
  let local = 1;
  for (const c of chunks) {
    const len = (c.weight / total) * speechFrames;
    if (frame < start + len) {
      current = c;
      local = (frame - start) / len;
      break;
    }
    start += len;
  }
  if (!current) return null;
  const spoken = Math.floor(local * (current.words.length + 0.6));
  const pop = Math.min(1, (local * speechFrames * (current.weight / total)) / 4);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 1360,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignContent: "flex-start",
        gap: "4px 20px",
        fontFamily: font.display,
        fontWeight: 900,
        fontSize: 70,
        lineHeight: 1.12,
        textAlign: "center",
        transform: `scale(${0.92 + 0.08 * pop})`,
      }}
    >
      {current.words.map((w, i) => (
        <span
          key={i}
          style={{
            color: i < spoken ? color.yellow : color.white,
            WebkitTextStroke: `10px ${color.ink}`,
            letterSpacing: 1,
            paintOrder: "stroke fill",
          }}
        >
          {w}
        </span>
      ))}
    </div>
  );
};
