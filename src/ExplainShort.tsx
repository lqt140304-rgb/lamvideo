import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FPS, font } from "./brand";
import { ease, pop } from "./anim";
import type { ExplainScene, SceneTiming, VideoScript } from "./types";

export const EXPLAIN_W = 1920;
export const EXPLAIN_H = 1080;

const INK = "#1B1B1B";
const TAGS: Record<string, { text: string; color: string }> = {
  "dinh-nghia": { text: "ĐỊNH NGHĨA", color: "#3C82E8" },
  "vi-du": { text: "VÍ DỤ", color: "#22A86B" },
  dua: { text: "ĐÙA CHÚT", color: "#F59E0B" },
  chot: { text: "TÓM LẠI", color: "#E5483B" },
  "doi-thuong": { text: "ĐỜI THƯỜNG", color: "#8A55D0" },
  ket: { text: "KẾT", color: "#1D1B19" },
};

export type ExplainProps = { script: VideoScript; timings: SceneTiming[] };

/** Nhân vật tạm (SVG) để thử bố cục khi chưa có sheet biểu cảm thật. Không phải nhân vật chốt. */
const PlaceholderChar: React.FC<{ expr: string; size: number }> = ({ expr, size }) => {
  const has = (...names: string[]) => names.includes(expr);
  const sad = has("buon-nhe", "buon", "khoc", "chan", "met", "kiet-suc", "so", "lo", "mat-dong-xu");
  const angry = has("gian", "noi-dien", "noi-dien-lua", "can-loi", "khong-chiu");
  const shock = has("ngac-nhien", "soc", "hoang-loan", "het-om-ma");
  const think = has("suy-nghi", "boi-roi", "roi-nao");
  const big = has("cuoi-lan", "vui-tuoi", "cuoi-guong");
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 300 345">
      <path d="M70 345 C70 250 100 220 150 220 C200 220 230 250 230 345 Z" fill="#7FB8F0" stroke={INK} strokeWidth="7" strokeLinejoin="round" />
      <circle cx="150" cy="130" r="95" fill="#FFE0BD" stroke={INK} strokeWidth="7" />
      <path d="M62 120 C70 40 230 40 238 120 C200 80 100 80 62 120Z" fill="#6B4A2B" stroke={INK} strokeWidth="7" strokeLinejoin="round" />
      {shock ? (<><circle cx="112" cy="130" r="16" fill="#fff" stroke={INK} strokeWidth="6" /><circle cx="188" cy="130" r="16" fill="#fff" stroke={INK} strokeWidth="6" /><circle cx="112" cy="130" r="5" fill={INK} /><circle cx="188" cy="130" r="5" fill={INK} /></>) : (<><circle cx="112" cy="132" r="9" fill={INK} /><circle cx="188" cy="132" r="9" fill={INK} /></>)}
      <path d={angry ? "M92 108 L130 120 M208 108 L170 120" : sad ? "M92 118 L130 108 M208 118 L170 108" : think ? "M92 112 L130 112 M208 100 L170 108" : "M95 108 Q112 98 130 108 M170 108 Q188 98 205 108"} stroke={INK} strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d={shock ? "M135 185 Q150 215 165 185 Q150 170 135 185Z" : big ? "M105 170 Q150 225 195 170 Z" : sad || angry ? "M120 195 Q150 170 180 195" : "M120 175 Q150 202 180 175"} fill={shock || big ? "#fff" : "none"} stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Caption: React.FC<{ text: string; frames: number }> = ({ text, frames }) => {
  const frame = useCurrentFrame();
  const words = text.trim().split(/\s+/);
  const chunk = 6;
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunk) chunks.push(words.slice(i, i + chunk).join(" "));
  const active = Math.min(chunks.length - 1, Math.floor((frame / Math.max(1, frames - 6)) * chunks.length));
  return (
    <div style={{ position: "absolute", left: 120, right: 120, bottom: 52, textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: 46, color: INK, lineHeight: 1.25 }}>
      <span style={{ background: "linear-gradient(transparent 58%, #FFE066 58%)", padding: "0 8px" }}>{chunks[active]}</span>
    </div>
  );
};

const SceneView: React.FC<{ scene: ExplainScene; slug: string; frames: number; placeholder: boolean }> = ({ scene, slug, frames, placeholder }) => {
  const frame = useCurrentFrame();
  const center = scene.pos === "center";
  const charSize = center ? 620 : 470;
  const enter = pop(frame, 0);
  const tag = scene.tag ? TAGS[scene.tag] : undefined;
  const items = scene.text ?? [];
  const stepEvery = Math.max(10, Math.floor((frames - FPS) / Math.max(1, items.length)));
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      {tag ? (
        <div style={{ position: "absolute", left: 100, top: 70, transform: `scale(${pop(frame, 2)})`, transformOrigin: "left center", background: tag.color, color: "#fff", fontFamily: font.display, fontWeight: 900, fontSize: 34, padding: "8px 26px", borderRadius: 14 }}>{tag.text}</div>
      ) : null}
      {scene.title ? (
        <div style={{ position: "absolute", left: 100, right: center ? 100 : 640, top: 150, fontFamily: font.display, fontWeight: 900, fontSize: 84, lineHeight: 1.12, color: INK, textAlign: center ? "center" : "left", opacity: ease(frame, 4, 10), transform: `translateY(${(1 - ease(frame, 4, 10)) * 24}px)` }}>{scene.title}</div>
      ) : null}
      {!center && items.length ? (
        <div style={{ position: "absolute", left: 100, width: 1050, top: scene.title ? 440 : 260, display: "flex", flexDirection: "column", gap: 22 }}>
          {items.map((t, i) => {
            const p = pop(frame, 14 + i * stepEvery);
            return (
              <div key={i} style={{ opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * -40}px)`, fontFamily: font.display, fontWeight: 800, fontSize: 56, color: INK }}>
                <span style={{ background: "linear-gradient(transparent 60%, #FFE066 60%)" }}>{t}</span>
              </div>
            );
          })}
        </div>
      ) : null}
      {scene.image ? (
        <Img src={staticFile(`${slug}/hinh/${scene.image}`)} style={{ position: "absolute", left: 1000, top: 330, width: 420, height: 420, objectFit: "contain", opacity: ease(frame, 10, 10) }} />
      ) : null}
      <div style={{ position: "absolute", left: center ? (EXPLAIN_W - charSize) / 2 : EXPLAIN_W - charSize - 80, bottom: 150, transform: `scale(${enter}) rotate(${Math.sin(frame / 9) * 1.2}deg)`, transformOrigin: "50% 100%" }}>
        {placeholder ? <PlaceholderChar expr={scene.expr} size={charSize} /> : <Img src={staticFile(`${slug}/nhan-vat/${scene.expr}.png`)} style={{ width: charSize }} />}
      </div>
      <Caption text={scene.sub ?? scene.voice} frames={frames} />
    </AbsoluteFill>
  );
};

export const ExplainShort: React.FC<ExplainProps> = ({ script, timings }) => {
  const scenes = script.scenes as unknown as ExplainScene[];
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      {scenes.map((scene, i) => {
        const t = timings[i];
        return (
          <Sequence key={scene.id} from={t.from} durationInFrames={t.frames} name={`${i + 1}. ${scene.expr}`}>
            <SceneView scene={scene} slug={script.id} frames={t.frames} placeholder={!!script.placeholderChar} />
            {t.audio ? <Audio src={staticFile(t.audio)} /> : null}
          </Sequence>
        );
      })}
      {script.music ? <Audio src={staticFile(script.music)} volume={script.musicVolume ?? 0.1} loop /> : null}
    </AbsoluteFill>
  );
};
