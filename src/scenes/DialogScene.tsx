import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { pop } from "../anim";
import { color, font } from "../brand";
import { Captions } from "../components/Captions";
import { MASCOT } from "../mascot";
import type { ActorPose, DialogScene as DialogData, Speaker } from "../types";
import castData from "../../public/lon-roi-hen-du-hoi/cast/cast.json";

type Info = { w: number; h: number; footX: number; footY: number; bodyH?: number };
const CAST = castData as unknown as { chars: Record<string, Record<string, Info>>; props: Record<string, { w: number; h: number }> };

/** Màu nhấn theo áo từng nhân vật (chữ tên + viền). */
export const SPEAKER_COLOR: Record<string, string> = { MINH: "#2F6FE0", BOM: "#17A98A", NA: "#8A55D0", TEO: "#E8761A" };
const NAME: Record<string, string> = { MINH: "Minh", BOM: "Bờm", NA: "Na", TEO: "Tèo" };
/** Chiều cao tương đối để bốn bạn không to nhỏ bất hợp lý. */
const REL: Record<Speaker, number> = { MINH: 1, BOM: 0.97, NA: 0.96, TEO: 1 };
const BODY = 520; // chiều cao thân (px) khi scale = 1
const MINH_POSE: Record<ActorPose, keyof typeof MASCOT> = {
  stand: "neutral", wave: "happy", point: "ok", think: "think", surprised: "surprised", cheer: "excited",
  sad: "sad", angry: "angry", walk: "walk", run: "run", sit: "neutral", phone: "neutral", happy: "smile",
};
const POSE_FALLBACK: Partial<Record<ActorPose, ActorPose>> = { happy: "cheer" };

const GRADE: Record<NonNullable<DialogData["bg"]["grade"]>, { overlay: string; filter: string }> = {
  past: { overlay: "rgba(255,176,90,0.22)", filter: "saturate(1.08) contrast(1.02)" },
  present: { overlay: "rgba(110,140,190,0.10)", filter: "saturate(0.96)" },
  warm: { overlay: "rgba(255,190,110,0.16)", filter: "saturate(1.05)" },
  night: { overlay: "rgba(20,24,60,0.38)", filter: "saturate(0.85) brightness(0.9)" },
};

export const Actor: React.FC<{
  slug: string; who: Speaker; pose: ActorPose; x: number; y: number; scale: number; flip?: boolean;
  speaking: boolean; changedAt?: number; enter: number; dx?: number; tile?: boolean;
}> = ({ slug, who, pose, x, y, scale, flip, speaking, changedAt, enter, dx = 0, tile }) => {
  const frame = useCurrentFrame();
  let src: string;
  let info: Info;
  let f: number;
  if (who === "MINH") {
    const p = MINH_POSE[pose] ?? "neutral";
    info = MASCOT[p] as Info;
    f = (BODY * scale * REL.MINH) / 1045;
    src = staticFile(`mascot/${p}.png`);
  } else {
    const set = CAST.chars[who.toLowerCase()];
    const p = set[pose] ? pose : POSE_FALLBACK[pose] && set[POSE_FALLBACK[pose] as string] ? (POSE_FALLBACK[pose] as ActorPose) : "stand";
    info = set[p];
    f = (BODY * scale * REL[who]) / (set.stand.bodyH ?? 336);
    src = staticFile(`${slug}/cast/${who.toLowerCase()}/${p}.png`);
  }
  const p = pop(frame, enter);
  const bob = speaking ? Math.sin(frame / 2.4) * 4 : Math.sin(frame / 14 + x) * 1.2;
  const lift = speaking ? 1.035 : 1;
  const sinceChange = changedAt !== undefined && frame >= changedAt ? Math.max(0, 1 - (frame - changedAt) / 7) : 0;
  const hop = -sinceChange * 14;
  const left = x + dx - info.footX * f;
  const top = y - info.footY * f + bob + hop;
  const col = SPEAKER_COLOR[who];
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none", opacity: Math.min(1, p * 2) }}>
      {!tile ? <div style={{ position: "absolute", left: x + dx - 150 * f * 0.9, top: y - 14, width: 300 * f * 0.9, height: 28, borderRadius: "50%", background: "rgba(20,16,10,0.28)", filter: "blur(5px)" }} /> : null}
      <div style={{ position: "absolute", left, top, width: info.w * f, height: info.h * f, transformOrigin: `${info.footX * f}px ${info.footY * f}px`, transform: `scale(${(flip ? -1 : 1) * lift}, ${lift})`, filter: speaking ? "none" : "brightness(0.93)" }}>
        <Img src={src} style={{ width: "100%", height: "100%" }} />
      </div>
      {speaking && !tile ? (
        <div style={{ position: "absolute", left: x + dx - 90, top: top - 56, width: 180, textAlign: "center", fontFamily: font.display, fontWeight: 900, fontSize: 38, color: col, textShadow: "0 0 8px #fff, 0 0 8px #fff, 0 2px 0 #fff" }}>
          {NAME[who]}
        </div>
      ) : null}
    </div>
  );
};

export const DialogScene: React.FC<{ scene: DialogData; frames: number; slug: string; lines: { from: number; frames: number }[] }> = ({ scene, frames, slug, lines }) => {
  const frame = useCurrentFrame();
  const g = GRADE[scene.bg.grade ?? "present"];
  const k = frames > 1 ? frame / (frames - 1) : 0;
  const zoom = (scene.bg.zoom ?? 1) * (1 + 0.04 * k);
  const pan = (scene.bg.pan ?? 0) * (k - 0.5);
  const FLOOR = scene.floor ?? 1250;
  // dòng đang nói / đã nói
  let cur = -1;
  lines.forEach((l, i) => { if (frame >= l.from) cur = i; });
  const active = cur >= 0 && frame < lines[cur].from + lines[cur].frames + 4 ? scene.lines[cur] : null;

  const poseOf = (who: Speaker, base: ActorPose = "stand") => {
    let pose = base;
    let changedAt: number | undefined;
    for (let i = 0; i <= cur; i++) {
      const ln = scene.lines[i];
      const np = ln.who === who ? ln.pose : ln.react?.[who];
      if (np && np !== pose) { pose = np; changedAt = lines[i].from; }
      else if (np) pose = np;
    }
    return { pose, changedAt };
  };
  const BAND_TOP = 280;
  const BAND_H = 1050;
  return (
    <AbsoluteFill style={{ background: "#2a2622" }}>
      {/* lớp nền mờ phủ kín khung dọc */}
      <Img src={staticFile(`${slug}/img/${scene.bg.file}`)} style={{ position: "absolute", left: -240, top: -120, width: 1560, height: 2160, objectFit: "cover", filter: "blur(34px) brightness(0.62) saturate(1.1)" }} />
      {/* ảnh thật: giữ nguyên tỉ lệ, trượt chậm */}
      <div style={{ position: "absolute", left: 0, top: BAND_TOP, width: 1080, height: BAND_H, overflow: "hidden", borderRadius: 0, boxShadow: "0 0 60px rgba(0,0,0,0.35)" }}>
        <Img src={staticFile(`${slug}/img/${scene.bg.file}`)} style={{ position: "absolute", left: "50%", top: "50%", height: BAND_H, minWidth: 1080, transform: `translate(calc(-50% + ${pan * 220}px), -50%) scale(${zoom})`, objectFit: "cover", filter: g.filter, transformOrigin: scene.bg.focus ?? "50% 50%" }} />
        <div style={{ position: "absolute", inset: 0, background: g.overlay }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)" }} />
      </div>

      {scene.label ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 292, textAlign: "center", opacity: interpolate(frame, [4, 16, frames - 20, frames - 6], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <span style={{ display: "inline-block", fontFamily: font.display, fontWeight: 900, fontSize: 46, color: "#fff", background: "rgba(29,27,25,0.82)", padding: "10px 30px", borderRadius: 40 }}>{scene.label}</span>
        </div>
      ) : null}
      {scene.chip ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 348, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: font.body, fontWeight: 800, fontSize: 36, color: color.ink, background: "rgba(255,255,255,0.92)", padding: "8px 26px", borderRadius: 30, border: `4px solid ${color.ink}` }}>{scene.chip}</span>
        </div>
      ) : null}

      {/* props phía sau */}
      {(scene.props ?? []).filter((p) => !p.front).map((p, i) => <Prop key={`b${i}`} slug={slug} p={p} cur={cur} lines={lines} />)}

      {scene.cast.map((c, i) => {
        const from = c.fromLine ?? 0;
        const to = c.toLine ?? scene.lines.length - 1;
        if (cur < from && frame < (lines[from]?.from ?? 0)) return null;
        if (cur > to) return null;
        const start = from === 0 ? 0 : lines[from]?.from ?? 0;
        const base = c.pose ?? "stand";
        const { pose, changedAt } = poseOf(c.who, base);
        let dx = 0;
        let useP: ActorPose = pose;
        if (c.path && c.path.length) {
          const T = 34;
          const u = interpolate(frame, [start, start + T], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          dx = (1 - u) * (c.path[0][0] - c.x);
          if (u < 1) useP = Math.abs(c.path[0][0] - c.x) > 400 ? "run" : "walk";
        }
        const speaking = !!active && active.who === c.who;
        if (c.tile) {
          const S = c.tile;
          const L = c.x - S / 2;
          const T = c.tileY ?? 400;
          const col = SPEAKER_COLOR[c.who];
          const e = pop(frame, start);
          return (
            <div key={`${c.who}${i}`} style={{ position: "absolute", left: L, top: T, width: S, height: S, borderRadius: S * 0.1, overflow: "hidden", border: `${speaking ? 8 : 4}px solid ${col}`, background: `linear-gradient(180deg, ${col}33, ${col}77)`, boxShadow: "0 10px 24px rgba(0,0,0,0.35)", opacity: Math.min(1, e * 2), transform: `scale(${0.85 + 0.15 * Math.min(1, e)})` }}>
              <div style={{ position: "absolute", left: -L, top: -T, width: 1080, height: 1920 }}>
                <Actor slug={slug} who={c.who} pose={pose} x={L + S / 2} y={T + S - 6} scale={(S / 300) * 0.5} flip={c.flip} speaking={speaking} changedAt={changedAt} enter={start} tile />
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 4, textAlign: "center", fontFamily: font.body, fontWeight: 800, fontSize: Math.max(22, S * 0.1), color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}>{NAME[c.who]}</div>
            </div>
          );
        }
        return (
          <Actor key={`${c.who}${i}`} slug={slug} who={c.who} pose={useP} x={c.x} dx={dx} y={FLOOR + (c.path && c.path[0][1] ? 0 : 0)} scale={c.scale ?? 1} flip={c.flip} speaking={speaking} changedAt={changedAt} enter={start} />
        );
      })}

      {(scene.props ?? []).filter((p) => p.front).map((p, i) => <Prop key={`f${i}`} slug={slug} p={p} cur={cur} lines={lines} />)}

      {(scene.inserts ?? []).map((ins, i) => {
        const a = lines[ins.fromLine]?.from ?? 0;
        const b = (lines[ins.toLine]?.from ?? 0) + (lines[ins.toLine]?.frames ?? 0);
        if (frame < a - 2 || frame > b + 6) return null;
        const e = interpolate(frame, [a, a + 8, b - 6, b + 4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ position: "absolute", left: 150, top: ins.y ?? 360, width: 780, opacity: e, transform: `rotate(${i % 2 ? 2 : -2}deg) scale(${0.94 + 0.06 * e})`, background: "#fff", padding: "20px 20px 56px", border: `5px solid ${color.ink}`, boxShadow: "0 18px 30px rgba(0,0,0,0.35)" }}>
            <Img src={staticFile(`${slug}/img/${ins.file}`)} style={{ width: "100%", height: 420, objectFit: "cover", display: "block" }} />
            {ins.caption ? <div style={{ position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center", fontFamily: font.body, fontWeight: 800, fontSize: 30, color: color.ink }}>{ins.caption}</div> : null}
          </div>
        );
      })}

      {/* phụ đề từng lượt, màu nhấn theo người nói */}
      {scene.lines.map((ln, i) => {
        const l = lines[i];
        const end = i + 1 < lines.length ? lines[i + 1].from : frames;
        const dur = Math.max(8, Math.min(end - l.from, l.frames + 10));
        if (frame < l.from || frame >= l.from + dur) return null;
        return (
          <div key={ln.id}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 1470, textAlign: "center" }}>
              <span style={{ fontFamily: font.body, fontWeight: 800, fontSize: 30, color: "#fff", background: SPEAKER_COLOR[ln.who], padding: "4px 20px", borderRadius: 22 }}>{NAME[ln.who]}</span>
            </div>
            <Captions text={ln.sub ?? ln.text} speechFrames={Math.max(1, l.frames)} />
          </div>
        );
      })}

      {scene.endCard ? <EndCard card={scene.endCard} start={Math.max(0, frames - 120)} /> : null}
      {scene.lines[cur]?.flash && cur >= 0 && frame - lines[cur].from < 8 ? <AbsoluteFill style={{ background: "rgba(255,225,160,0.45)", opacity: 1 - (frame - lines[cur].from) / 8 }} /> : null}
    </AbsoluteFill>
  );
};

const Prop: React.FC<{ slug: string; p: NonNullable<DialogData["props"]>[number]; cur: number; lines: { from: number; frames: number }[] }> = ({ slug, p, cur, lines }) => {
  const frame = useCurrentFrame();
  const from = p.fromLine ?? 0;
  const to = p.toLine ?? 999;
  if (cur < from && frame < (lines[from]?.from ?? 0)) return null;
  if (cur > to) return null;
  const d = CAST.props[p.name];
  const f = (p.scale ?? 1) * 1.45;
  const s = pop(frame, from === 0 ? 0 : lines[from]?.from ?? 0);
  return (
    <div style={{ position: "absolute", left: p.x - (d.w * f) / 2, top: p.y - d.h * f, width: d.w * f, height: d.h * f, transform: `${p.flip ? "scaleX(-1) " : ""}scale(${0.7 + 0.3 * Math.min(1, s)})`, transformOrigin: "50% 100%", opacity: Math.min(1, s * 2) }}>
      <Img src={staticFile(`${slug}/cast/props/${p.name}.png`)} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

const EndCard: React.FC<{ card: NonNullable<DialogData["endCard"]>; start: number }> = ({ card, start }) => {
  const frame = useCurrentFrame();
  const e = interpolate(frame, [start, start + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: e }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1530, textAlign: "center", background: "rgba(29,27,25,0.9)", borderRadius: 36, padding: "26px 30px", transform: `translateY(${(1 - e) * 30}px)` }}>
        <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 54, lineHeight: 1.15, color: "#FFE9A8" }}>{card.text}</div>
        {card.small ? <div style={{ marginTop: 12, fontFamily: font.body, fontWeight: 700, fontSize: 36, color: "#fff" }}>{card.small}</div> : null}
      </div>
    </AbsoluteFill>
  );
};
