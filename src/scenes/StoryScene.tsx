import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { atFrame, ease, pop } from "../anim";
import { color, font } from "../brand";
import { Mascot } from "../components/Mascot";
import type { StoryScene as StoryData } from "../types";

type Mood = StoryData["mood"];

/** Nền tối thì tiêu đề trên cùng đổi sang màu sáng. */
export const isDarkMood = (m: Mood) => m === "night" || m === "net";

const GROUND = 1300;

const PALETTE: Record<Mood, { sky: [string, string, string]; ground: string; far: string; glow: string; text: string; sun?: { x: number; y: number; r: number; c: string } }> = {
  warm: { sky: ["#FFEBC4", "#FFD39A", "#FFB873"], ground: "#E9AC6C", far: "#F2B87A", glow: "#FFF3D2", text: "#1D1B19", sun: { x: 790, y: 560, r: 200, c: "#FFF6DA" } },
  dusk: { sky: ["#FFD2A3", "#F1887D", "#5F5391"], ground: "#43385F", far: "#5A4C84", glow: "#FFD9A0", text: "#3A2748", sun: { x: 300, y: 1010, r: 160, c: "#FFE3A6" } },
  night: { sky: ["#10152E", "#222A58", "#3A4378"], ground: "#161B38", far: "#1E2548", glow: "#FFF1C8", text: "#F6F0E1", sun: { x: 880, y: 1010, r: 92, c: "#FFF6D8" } },
  net: { sky: ["#120F2B", "#2A1750", "#43225F"], ground: "#17122F", far: "#241A45", glow: "#8BE9FF", text: "#F6F0E1" },
  dawn: { sky: ["#FFF6D8", "#DDEFF2", "#BFE0F5"], ground: "#E4D8A6", far: "#CFE3C6", glow: "#FFF7D6", text: "#1D1B19", sun: { x: 540, y: 1040, r: 190, c: "#FFE9A8" } },
};

const Backdrop: React.FC<{ mood: Mood }> = ({ mood }) => {
  const frame = useCurrentFrame();
  const P = PALETTE[mood];
  const dark = isDarkMood(mood);
  const id = `sky-${mood}`;
  // đường chân trời: dãy nhà thấp
  const houses = Array.from({ length: 11 }, (_, i) => {
    const w = 110 + random(`h${mood}${i}`) * 70;
    const h = 120 + random(`hh${mood}${i}`) * 200;
    return { x: -20 + i * 105, w, h };
  });
  return (
    <AbsoluteFill>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={P.sky[0]} />
            <stop offset="0.55" stopColor={P.sky[1]} />
            <stop offset="1" stopColor={P.sky[2]} />
          </linearGradient>
          <radialGradient id={`glow-${mood}`}>
            <stop offset="0" stopColor={P.glow} stopOpacity="0.95" />
            <stop offset="1" stopColor={P.glow} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vig" cx="50%" cy="50%" r="75%">
            <stop offset="0.6" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity={dark ? 0.5 : 0.22} />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill={`url(#${id})`} />
        {P.sun ? (
          <g>
            <circle cx={P.sun.x} cy={P.sun.y} r={P.sun.r * 2.6} fill={`url(#glow-${mood})`} opacity={0.55 + Math.sin(frame / 40) * 0.05} />
            <circle cx={P.sun.x} cy={P.sun.y} r={P.sun.r} fill={P.sun.c} />
          </g>
        ) : null}
        {mood === "night"
          ? Array.from({ length: 26 }, (_, i) => (
              <circle key={i} cx={random(`sx${i}`) * 1080} cy={220 + random(`sy${i}`) * 820} r={2 + random(`sr${i}`) * 3} fill="#FFF6D8" opacity={0.35 + 0.45 * Math.abs(Math.sin(frame / (25 + i * 3) + i))} />
            ))
          : null}
        {mood === "net" ? (
          <g>
            <circle cx={180} cy={760} r={420} fill="#FF4FA3" opacity={0.16 + Math.sin(frame / 18) * 0.03} />
            <circle cx={930} cy={980} r={460} fill="#35D6FF" opacity={0.16 + Math.sin(frame / 22 + 1) * 0.03} />
            {/* dãy màn hình CRT */}
            {Array.from({ length: 6 }, (_, i) => (
              <g key={i} transform={`translate(${30 + i * 175} 1030)`}>
                <rect width="150" height="120" rx="10" fill="#0B0A1C" />
                <rect x="10" y="10" width="130" height="92" rx="6" fill={i % 2 ? "#3A7BFF" : "#7A4DFF"} opacity={0.55 + 0.25 * Math.abs(Math.sin(frame / (9 + i * 2) + i))} />
              </g>
            ))}
          </g>
        ) : (
          <g fill={P.far} opacity="0.9">
            {houses.map((h, i) => (
              <g key={i}>
                <rect x={h.x} y={GROUND - h.h} width={h.w} height={h.h} rx="6" />
                {dark && random(`w${i}`) > 0.45 ? <rect x={h.x + 24} y={GROUND - h.h + 36} width="22" height="30" fill="#FFD76A" opacity="0.85" /> : null}
              </g>
            ))}
          </g>
        )}
        <rect x="0" y={GROUND} width="1080" height={1920 - GROUND} fill={P.ground} />
        <rect x="0" y={GROUND} width="1080" height="10" fill="#000" opacity="0.12" />
        {/* hạt bụi / đom đóm bay chậm */}
        {Array.from({ length: 16 }, (_, i) => {
          const sp = 0.4 + random(`ps${i}`) * 0.8;
          const x = (random(`px${i}`) * 1080 + Math.sin(frame / (40 / sp) + i) * 40 + frame * 0.2 * sp) % 1080;
          const y = 300 + ((random(`py${i}`) * 1100 - frame * 0.7 * sp + 2200) % 1100);
          return <circle key={i} cx={x} cy={y} r={3 + random(`pr${i}`) * 4} fill={P.glow} opacity={dark ? 0.55 : 0.4} />;
        })}
        <rect width="1080" height="1920" fill="url(#vig)" />
      </svg>
    </AbsoluteFill>
  );
};

const Phone: React.FC<{ phone: NonNullable<StoryData["phone"]>; frames: number; mood: Mood }> = ({ phone, frames, mood }) => {
  const frame = useCurrentFrame();
  const enter = pop(frame, 2, 150);
  const dark = isDarkMood(mood);
  const L = 265;
  const T = 235;
  const W = 550;
  const H = 780;
  return (
    <div
      style={{
        position: "absolute",
        left: L,
        top: T,
        width: W,
        height: H,
        borderRadius: 64,
        background: "#15131F",
        padding: 16,
        boxShadow: dark ? "0 0 120px 30px rgba(140,190,255,0.35), 14px 18px 0 rgba(0,0,0,0.25)" : "14px 18px 0 rgba(29,27,25,0.55)",
        transform: `rotate(-2.5deg) scale(${0.6 + 0.4 * Math.min(enter, 1.04)})`,
        opacity: Math.min(1, enter * 1.6),
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: 50, background: "#F4F1EA", overflow: "hidden", position: "relative" }}>
        <div style={{ background: "#fff", borderBottom: "3px solid #E3DED2", padding: "26px 26px 16px", fontFamily: font.display, fontWeight: 900, fontSize: 34, color: "#1D1B19" }}>
          {phone.name ?? "Nhóm chat"}
          <div style={{ fontFamily: font.body, fontWeight: 600, fontSize: 22, color: "#8A8478" }}>đang hoạt động</div>
        </div>
        <div style={{ padding: "22px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          {phone.msgs.map((m, i) => {
            const p = pop(frame, atFrame(m.at, frames), 200);
            const me = m.from === "me";
            return (
              <div
                key={i}
                style={{
                  alignSelf: me ? "flex-end" : "flex-start",
                  maxWidth: 400,
                  background: me ? color.yellow : "#fff",
                  border: "3px solid #1D1B19",
                  borderRadius: 26,
                  padding: "14px 22px",
                  fontFamily: font.body,
                  fontWeight: 700,
                  fontSize: 36,
                  lineHeight: 1.2,
                  color: "#1D1B19",
                  opacity: Math.min(1, p * 2),
                  transform: `translateY(${(1 - Math.min(p, 1)) * 30}px) scale(${0.85 + 0.15 * Math.min(p, 1)})`,
                  display: frame < atFrame(m.at, frames) ? "none" : "block",
                }}
              >
                {m.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const StoryScene: React.FC<{ scene: StoryData; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const P = PALETTE[scene.mood];
  const cast = scene.cast ?? [];
  const pose = (c: NonNullable<StoryData["cast"]>[number]) => c.pose ?? "stand";
  const posOf = (c: NonNullable<StoryData["cast"]>[number]) => {
    const x0 = c.x * 1080;
    if (c.toX === undefined) return x0;
    const s = atFrame(c.at ?? 0, frames);
    return interpolate(frame, [s, frames - 8], [x0, c.toX * 1080], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  };
  return (
    <AbsoluteFill>
      <Backdrop mood={scene.mood} />
      {scene.phone ? <Phone phone={scene.phone} frames={frames} mood={scene.mood} /> : null}

      {/* nhân vật */}
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {cast.map((c, i) => {
          const sc = c.scale ?? 0.9;
          const x = posOf(c);
          const enter = atFrame(c.at ?? 0, frames) + 3 + i * 3;
          const walking = pose(c) === "walk" || pose(c) === "run";
          const bob = walking ? Math.abs(Math.sin(frame / 3.2)) * -12 : 0;
          return (
            <g key={i}>
              {c.box ? (
                <g>
                  <rect x={x - 175} y={GROUND - 520 * sc - 60} width="350" height={520 * sc + 92} rx="34" fill="#0C0B1E" stroke="#6FA8FF" strokeWidth="5" opacity="0.92" />
                  <rect x={x - 150} y={GROUND - 520 * sc - 36} width="300" height={520 * sc + 42} rx="22" fill="#4A7BFF" opacity={0.22 + 0.08 * Math.sin(frame / 10 + i)} />
                </g>
              ) : null}
              <g transform={`translate(0 ${bob})`}>
                <Mascot pose={pose(c)} x={x} y={GROUND + 10} scale={sc} flip={c.flip} enter={enter} hue={c.hue} />
              </g>
            </g>
          );
        })}
      </svg>

      {/* dòng chữ lớn */}
      {scene.lines?.length ? (
        <div style={{ position: "absolute", left: 80, right: 80, top: scene.phone ? 1010 : 320, textAlign: "center" }}>
          {scene.lines.map((l, i) => {
            const k = ease(frame, atFrame(l.at, frames), 14);
            const last = i === scene.lines!.length - 1 || frame < atFrame(scene.lines![i + 1].at, frames);
            return (
              <div
                key={i}
                style={{
                  fontFamily: font.display,
                  fontWeight: 900,
                  fontSize: 68,
                  lineHeight: 1.18,
                  marginBottom: 16,
                  color: P.text,
                  textShadow: isDarkMood(scene.mood) ? "0 4px 24px rgba(0,0,0,0.55)" : "0 3px 18px rgba(255,255,255,0.5)",
                  opacity: k * (last ? 1 : 0.55),
                  transform: `translateY(${(1 - k) * 28}px)`,
                }}
              >
                {l.text}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* bóng thoại */}
      {scene.bubbles?.map((b, i) => {
        const c = cast[b.who];
        if (!c) return null;
        const sc = c.scale ?? 0.9;
        const cx = posOf(c);
        const at = atFrame(b.at, frames);
        const p = pop(frame, at, 220);
        if (frame < at) return null;
        const w = Math.min(470, 60 + b.text.length * 26);
        const left = Math.max(40, Math.min(1080 - 40 - w, cx - w / 2));
        const bottom = 1920 - (GROUND - 520 * sc - 22) + (i % 2) * 120;
        const think = b.tone === "think";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left,
              bottom,
              width: w,
              background: "#fff",
              border: "5px solid #1D1B19",
              borderRadius: think ? 44 : 34,
              padding: "16px 22px",
              fontFamily: font.display,
              fontWeight: 900,
              fontSize: 46,
              lineHeight: 1.15,
              color: "#1D1B19",
              textAlign: "center",
              boxShadow: "8px 10px 0 rgba(0,0,0,0.22)",
              transform: `scale(${0.4 + 0.6 * Math.min(p, 1.05)}) rotate(${(i % 2 ? 1 : -1) * 1.5}deg)`,
              transformOrigin: `${Math.max(10, Math.min(90, ((cx - left) / w) * 100))}% 100%`,
              opacity: Math.min(1, p * 2),
            }}
          >
            {b.text}
            <div
              style={{
                position: "absolute",
                bottom: -20,
                left: Math.max(24, Math.min(w - 60, cx - left - 18)),
                width: 30,
                height: 30,
                background: "#fff",
                borderRight: "5px solid #1D1B19",
                borderBottom: "5px solid #1D1B19",
                transform: "rotate(45deg)",
              }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
