import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS, color, font } from "../brand";
import { atFrame, pop } from "../anim";
import type { Broll as BrollData, ImageCredits, Scene } from "../types";
import { Flash, Sfx } from "./Fx";

/** Danh sách ảnh thật của một cảnh (trường `broll` trong script.json có thể là 1 ảnh hoặc mảng). */
export const brollsOf = (b: BrollData | BrollData[] | undefined): BrollData[] => (!b ? [] : Array.isArray(b) ? b : [b]);

const tokens = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFC")
    .replace(/[.,!?:;"“”()]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

/** Vị trí (0..1) của cụm từ trong câu đọc, tính theo số chữ. Không thấy thì trả về null. */
export const phraseAt = (voice: string, phrase: string): number | null => {
  const v = tokens(voice);
  const p = tokens(phrase);
  if (!p.length) return null;
  for (let i = 0; i + p.length <= v.length; i++) {
    if (p.every((w, j) => v[i + j] === w)) return i / v.length;
  }
  return null;
};

/** Khung hình bắt đầu/kết thúc của một ảnh trong cảnh. `say` = hiện đúng lúc giọng đọc tới cụm từ đó. */
export const brollWindow = (item: BrollData, scene: Scene, frames: number): { start: number; end: number } => {
  const speech = frames - Math.round((scene.pad ?? 0.35) * FPS);
  const at = item.say ? phraseAt(scene.voice, item.say) : null;
  if (at !== null) {
    const start = Math.max(0, Math.round(at * speech) - 4);
    const end = item.to !== undefined ? atFrame(item.to, frames) : start + Math.round((item.hold ?? 2.2) * FPS);
    return { start, end: Math.min(end, frames - 2) };
  }
  return { start: atFrame(item.from ?? 0, frames), end: atFrame(item.to ?? 0.4, frames) };
};

/** Khoảng nghỉ tối thiểu giữa hai ảnh trong cùng cảnh, và thời gian hiện ngắn nhất của một ảnh. */
const GAP = 24;
const MIN_SHOW = 30;

/**
 * Thời điểm hiện của mọi ảnh trong cảnh, đã xếp để KHÔNG chồng lên nhau:
 * ảnh sau chỉ hiện khi ảnh trước tắt hẳn + nghỉ GAP khung; ảnh còn quá ngắn thì bỏ.
 */
export const sceneWindows = (scene: Scene, frames: number): ({ start: number; end: number } | null)[] => {
  // mỗi cảnh chỉ dùng 1 ảnh tổng quan (ảnh đầu tiên)
  const list = brollsOf(scene.broll).slice(0, 1).map((b, i) => ({ i, ...brollWindow(b, scene, frames) }));
  const out: ({ start: number; end: number } | null)[] = list.map(() => null);
  let lastEnd = -GAP;
  for (const w of [...list].sort((a, b) => a.start - b.start)) {
    const start = Math.max(w.start, lastEnd + GAP);
    if (w.end - start < MIN_SHOW) continue;
    out[w.i] = { start, end: w.end };
    lastEnd = w.end;
  }
  return out;
};

/** Khung hình kết thúc của ảnh mở đầu cảnh (để phần hoạt hình bắt đầu sau ảnh). */
export const introEnd = (scene: Scene, frames: number) => {
  const first = sceneWindows(scene, frames).find((w) => w && w.start <= 2);
  return first ? first.end : 0;
};

type Props = { item: BrollData; index: number; slug: string; frames: number; credits: ImageCredits; scene: Scene };

/**
 * Chèn ảnh thật vào giữa cảnh hoạt hình.
 * - style "full": ảnh tràn màn hình, zoom chậm (Ken Burns), có nhãn vàng và dòng ghi nguồn.
 * - style "card": ảnh trong khung polaroid dán băng keo, bật lên giữa cảnh.
 * Ảnh chưa tải (chưa có trong credits.json) thì bỏ qua, video vẫn render bình thường.
 */
export const Broll: React.FC<Props> = ({ item, index, slug, frames, credits, scene }) => {
  const frame = useCurrentFrame();
  const info = credits[item.file];
  if (!info) return null;
  const w = sceneWindows(scene, frames)[index];
  if (!w) return null;
  const { start, end } = w;
  if (end - start < 6) return null;
  const src = staticFile(`${slug}/img/${item.file}`);
  const credit = item.credit ?? info.short;
  const sfx = <Sfx name="shutter" at={start} volume={0.45} />;
  if (frame < start - 1 || frame > end + 1) return sfx;
  const local = frame - start;
  const len = end - start;
  const out = interpolate(frame, [end - 6, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  if ((item.style ?? "full") === "card") {
    const p = pop(frame, start, 190);
    const tilt = (item.tilt ?? -3) + Math.sin(local / 20) * 0.6;
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {sfx}
        <div
          style={{
            position: "absolute",
            left: 540 - 330,
            top: (item.y ?? 520),
            width: 660,
            padding: "26px 26px 22px",
            background: "#FFFDF7",
            border: `5px solid ${color.ink}`,
            borderRadius: 10,
            boxShadow: `14px 14px 0 rgba(29,27,25,0.85)`,
            transform: `translateX(${out * 900}px) rotate(${tilt + out * 12}deg) scale(${0.5 + 0.5 * Math.min(p, 1.06)})`,
            opacity: Math.min(1, p * 1.5),
          }}
        >
          <div style={{ position: "absolute", top: -26, left: 230, width: 200, height: 52, background: "rgba(255,200,58,0.85)", transform: "rotate(-4deg)", border: `3px solid rgba(29,27,25,0.25)` }} />
          <div style={{ width: 608, height: 456, overflow: "hidden", borderRadius: 4, border: `4px solid ${color.ink}` }}>
            <Img
              src={src}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: item.focus ?? "50% 50%",
                transform: `scale(${1.12 - 0.12 * Math.min(1, local / len)})`,
              }}
            />
          </div>
          {item.caption ? (
            <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 44, color: color.ink, textAlign: "center", marginTop: 14 }}>{item.caption}</div>
          ) : null}
          <div style={{ fontFamily: font.body, fontSize: 20, color: color.inkSoft, textAlign: "right", marginTop: 6 }}>{credit}</div>
        </div>
      </AbsoluteFill>
    );
  }

  // style "full"
  const k = Math.min(1, local / len);
  const zoom = 1.14 - 0.12 * k;
  const pan = (item.pan ?? 1) * (k - 0.5) * 40;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", transform: `translateX(${-out * 1100}px)`, opacity: 1 - out * 0.3 }}>
      {sfx}
      <AbsoluteFill style={{ background: color.ink, overflow: "hidden" }}>
        <Img
          src={src}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: item.focus ?? "50% 50%",
            transform: `scale(${zoom}) translateX(${pan}px)`,
            filter: "saturate(1.08) contrast(1.04)",
          }}
        />
        {/* tối dần trên/dưới để chữ đọc rõ */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(20,18,16,0.55) 0%, rgba(20,18,16,0) 22%, rgba(20,18,16,0) 55%, rgba(20,18,16,0.6) 78%, rgba(20,18,16,0.75) 100%)",
          }}
        />
        {/* viền giấy để ảnh hợp với nền vẽ tay */}
        <AbsoluteFill style={{ boxShadow: `inset 0 0 0 22px ${color.paper}, inset 0 0 0 28px ${color.ink}` }} />
      </AbsoluteFill>
      {item.caption ? (
        <div
          style={{
            position: "absolute",
            top: 250,
            left: 70,
            maxWidth: 940,
            padding: "10px 26px 14px",
            background: color.yellow,
            border: `6px solid ${color.ink}`,
            borderRadius: 14,
            boxShadow: `8px 8px 0 ${color.ink}`,
            fontFamily: font.display,
            fontWeight: 900,
            fontSize: 58,
            lineHeight: 1.08,
            color: color.ink,
            transform: `rotate(-2deg) translateY(${(1 - Math.min(1, pop(frame, start + 4))) * -40}px)`,
            opacity: Math.min(1, pop(frame, start + 4) * 1.5),
          }}
        >
          {item.caption}
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          right: 50,
          bottom: 52,
          maxWidth: 900,
          fontFamily: font.body,
          fontWeight: 600,
          fontSize: 22,
          color: "rgba(255,255,255,0.88)",
          textShadow: "0 1px 3px rgba(0,0,0,0.8)",
          textAlign: "right",
        }}
      >
        {credit}
      </div>
      <Flash at={start} />
    </AbsoluteFill>
  );
};
