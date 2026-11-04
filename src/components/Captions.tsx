import React from "react";
import { useCurrentFrame } from "remotion";
import { color, font } from "../brand";

// ---- Cắt phụ đề: luôn một dòng, không để sót chữ lẻ ---------------------------------------

const FONT_SIZE = 70;
const MIN_FONT_SIZE = 52;
/** Khung phụ đề rộng 940px; chừa lề cho nét viền chữ. */
const BUDGET = 900;
const WORD_GAP = 20;
const LETTER_SPACING = 1;

// Độ rộng (đơn vị em) của từng ký tự trong Inter Display Black, đo từ file font.
// Chữ có dấu tính theo chữ gốc (NFD), riêng "đ" có mục riêng.
const EM: Record<string, number> = {
  "!": 0.27, "%": 1.018, "(": 0.359, ")": 0.359, ",": 0.266, "-": 0.459, ".": 0.266, "/": 0.396,
  "0": 0.682, "1": 0.413, "2": 0.63, "3": 0.638, "4": 0.69, "5": 0.618, "6": 0.646, "7": 0.579,
  "8": 0.642, "9": 0.646, ":": 0.266, ";": 0.267, "?": 0.605,
  A: 0.764, B: 0.65, C: 0.73, D: 0.711, E: 0.632, F: 0.605, G: 0.74, H: 0.727, I: 0.281, J: 0.585,
  K: 0.729, L: 0.575, M: 0.925, N: 0.738, O: 0.746, P: 0.648, Q: 0.746, R: 0.666, S: 0.685,
  T: 0.656, U: 0.705, V: 0.75, W: 1.037, X: 0.741, Y: 0.73, Z: 0.652,
  a: 0.583, b: 0.625, c: 0.583, d: 0.625, e: 0.583, f: 0.426, g: 0.625, h: 0.618, i: 0.279,
  j: 0.28, k: 0.587, l: 0.279, m: 0.922, n: 0.618, o: 0.607, p: 0.625, q: 0.625, r: 0.416,
  s: 0.559, t: 0.418, u: 0.618, v: 0.59, w: 0.875, x: 0.562, y: 0.59, z: 0.561,
  "Đ": 0.711, "đ": 0.625, "–": 0.5,
};
const DEFAULT_EM = 0.6;

const wordWidth = (word: string, size = FONT_SIZE) => {
  let em = 0;
  for (const ch of word) {
    em += EM[ch] ?? EM[ch.normalize("NFD")[0]] ?? DEFAULT_EM;
  }
  return em * size + word.length * LETTER_SPACING;
};

const wordsWidth = (words: string[], size = FONT_SIZE) =>
  words.reduce((s, w) => s + wordWidth(w, size), 0) + Math.max(0, words.length - 1) * WORD_GAP;

type Chunk = { words: string[]; weight: number };

/** Chia `words` thành đúng k đoạn sao cho đoạn rộng nhất hẹp nhất; mỗi đoạn ≥ 2 chữ nếu đủ chữ. */
const splitBalanced = (words: string[], k: number, canCut: (p: number) => boolean): string[][] | null => {
  const n = words.length;
  const minLen = n >= 2 * k ? 2 : 1;
  const INF = Number.POSITIVE_INFINITY;
  // best[j][i] = độ rộng lớn nhất nhỏ nhất khi chia i chữ đầu thành j đoạn
  const best: number[][] = Array.from({ length: k + 1 }, () => Array(n + 1).fill(INF));
  const cut: number[][] = Array.from({ length: k + 1 }, () => Array(n + 1).fill(0));
  best[0][0] = 0;
  for (let j = 1; j <= k; j++) {
    for (let i = j * minLen; i <= n; i++) {
      for (let p = (j - 1) * minLen; p <= i - minLen; p++) {
        if (best[j - 1][p] === INF) continue;
        if (p > 0 && !canCut(p)) continue;
        const cost = Math.max(best[j - 1][p], wordsWidth(words.slice(p, i)));
        if (cost < best[j][i]) {
          best[j][i] = cost;
          cut[j][i] = p;
        }
      }
    }
  }
  if (best[k][n] === INF) return null;
  const parts: string[][] = [];
  let i = n;
  for (let j = k; j >= 1; j--) {
    const p = cut[j][i];
    parts.unshift(words.slice(p, i));
    i = p;
  }
  return parts;
};

/**
 * Cắt phụ đề thành các cụm vừa một dòng (rộng ≤ BUDGET ở cỡ chữ 70).
 * Ưu tiên cắt ở dấu câu; cụm dài thì chia đều, không để sót một chữ lẻ.
 */
export const chunkSubtitle = (text: string): Chunk[] => {
  const phrases = text
    .trim()
    .split(/(?<=[.,!?:;])\s+/)
    .map((p) => p.split(/\s+/).filter(Boolean))
    .filter((w) => w.length);

  // Cụm chỉ có 1 chữ thì dính vào cụm kế (hoặc cụm trước nếu là cụm cuối).
  const merged: string[][] = [];
  for (let i = 0; i < phrases.length; i++) {
    const cur = phrases[i];
    if (cur.length === 1 && i + 1 < phrases.length) {
      phrases[i + 1] = [...cur, ...phrases[i + 1]];
    } else if (cur.length === 1 && merged.length) {
      merged[merged.length - 1] = [...merged[merged.length - 1], ...cur];
    } else {
      merged.push(cur);
    }
  }

  const chunks: Chunk[] = [];
  for (const words of merged) {
    const k = Math.max(1, Math.ceil(wordsWidth(words) / BUDGET));
    // Có thể cần thêm một đoạn nếu chia đều vẫn tràn.
    // Không cắt giữa chữ và con số đi liền sau nó ("mức | 3"), hay giữa số và đơn vị ("100 | km").
    const isNum = (w: string) => /^\d[\d.,/]*[a-zA-Zđ%]*$/.test(w);
    const glued = (p: number) => !isNum(words[p]) && !/^\d[\d.,]*$/.test(words[p - 1]);
    const split = (parts: number) =>
      splitBalanced(words, parts, glued) ?? splitBalanced(words, parts, () => true)!;
    let parts = split(Math.min(k, words.length));
    while (parts.some((p) => wordsWidth(p) > BUDGET) && parts.length < words.length) {
      parts = split(parts.length + 1);
    }
    for (const part of parts) chunks.push({ words: part, weight: part.length + 0.6 });
  }
  return chunks;
};

// ---- Hiển thị ---------------------------------------------------------------------------

/**
 * Phụ đề kiểu Shorts: chữ trắng viền đen, chữ đang đọc tô vàng, luôn một dòng.
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
  // Cụm không thể chia nhỏ hơn mà vẫn dài thì thu nhỏ chữ cho vừa một dòng.
  const width = wordsWidth(current.words);
  const size = width > BUDGET ? Math.max(MIN_FONT_SIZE, Math.floor((FONT_SIZE * BUDGET) / width)) : FONT_SIZE;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 1360,
        display: "flex",
        flexWrap: "nowrap",
        justifyContent: "center",
        whiteSpace: "nowrap",
        gap: WORD_GAP * (size / FONT_SIZE),
        fontFamily: font.display,
        fontWeight: 900,
        fontSize: size,
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
            letterSpacing: LETTER_SPACING,
            paintOrder: "stroke fill",
          }}
        >
          {w}
        </span>
      ))}
    </div>
  );
};
