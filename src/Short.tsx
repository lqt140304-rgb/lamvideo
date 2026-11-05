import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS, color, font } from "./brand";
import { Captions } from "./components/Captions";
import { Header } from "./components/Header";
import { Paper } from "./components/Paper";
import { CompareScene } from "./scenes/CompareScene";
import { HookScene } from "./scenes/HookScene";
import { ListScene } from "./scenes/ListScene";
import { OutroScene } from "./scenes/OutroScene";
import { TimelineScene } from "./scenes/TimelineScene";
import { VerdictScene } from "./scenes/VerdictScene";
import { ZonesScene } from "./scenes/ZonesScene";
import { StoryScene, isDarkMood } from "./scenes/StoryScene";
import { DialogScene } from "./scenes/DialogScene";
import { MemoryScene } from "./scenes/MemoryScene";
import {
  ChatScene,
  CompareVariant,
  HookVariant,
  LadderScene,
  ListVariant,
  MythScene,
  ReceiptScene,
  ScaleVerdict,
  StatScene,
  StepsScene,
} from "./scenes/Layouts";
import { Broll, brollsOf, phraseAt } from "./components/Broll";
import { Sfx, Transition, transitionFor } from "./components/Fx";
import type { CamMove, ImageCredits, Scene, SceneTiming, VideoScript } from "./types";

export type ShortProps = {
  script: VideoScript;
  timings: SceneTiming[];
  /** Ảnh thật đã tải (public/<slug>/img/credits.json). */
  credits?: ImageCredits;
};

const SceneBody: React.FC<{ scene: Scene; frames: number; slug: string; lines?: { from: number; frames: number }[] }> = ({ scene, frames, slug, lines }) => {
  switch (scene.type) {
    case "memory":
      return <MemoryScene scene={scene} frames={frames} slug={slug} lines={lines ?? []} />;
    case "dialog":
      return <DialogScene scene={scene} frames={frames} slug={slug} lines={lines ?? []} />;
    case "story":
      return <StoryScene scene={scene} frames={frames} />;
    case "hook":
      return scene.layout && scene.layout !== "poster" ? <HookVariant scene={scene} frames={frames} /> : <HookScene scene={scene} frames={frames} />;
    case "zones":
      return <ZonesScene scene={scene} frames={frames} />;
    case "timeline":
      return <TimelineScene scene={scene} frames={frames} />;
    case "compare":
      return scene.layout && scene.layout !== "cards" ? <CompareVariant scene={scene} frames={frames} /> : <CompareScene scene={scene} frames={frames} />;
    case "list":
      return scene.layout && scene.layout !== "rows" ? <ListVariant scene={scene} frames={frames} /> : <ListScene scene={scene} frames={frames} />;
    case "verdict":
      return scene.layout === "scale" ? <ScaleVerdict scene={scene} frames={frames} /> : <VerdictScene scene={scene} frames={frames} />;
    case "stat":
      return <StatScene scene={scene} frames={frames} />;
    case "steps":
      return <StepsScene scene={scene} frames={frames} />;
    case "myth":
      return <MythScene scene={scene} frames={frames} />;
    case "chat":
      return <ChatScene scene={scene} frames={frames} />;
    case "receipt":
      return <ReceiptScene scene={scene} frames={frames} />;
    case "ladder":
      return <LadderScene scene={scene} frames={frames} />;
    case "outro":
      return <OutroScene scene={scene} frames={frames} />;
  }
};

const CAM_CYCLE: CamMove[] = ["in", "out", "drift", "in", "out", "drift"];

/**
 * Máy quay: zoom/lia nhẹ trong suốt cảnh để hình không đứng im.
 * Cảnh mở đầu giật zoom đúng lúc chốt ý (cue). Các cảnh sau xen kẽ vào / ra / trôi.
 */
const Camera: React.FC<{ scene: Scene; index: number; frames: number; children: React.ReactNode }> = ({ scene, index, frames, children }) => {
  const frame = useCurrentFrame();
  const move: CamMove = scene.cam ?? (scene.type === "hook" ? "punch" : scene.type === "outro" ? "out" : CAM_CYCLE[index % CAM_CYCLE.length]);
  const k = frames > 1 ? frame / (frames - 1) : 0;
  let scale = 1;
  let tx = 0;
  let ty = 0;
  if (move === "in") scale = 1 + 0.06 * k;
  else if (move === "out") scale = 1.07 - 0.07 * k;
  else if (move === "drift") {
    scale = 1.03 + 0.01 * k;
    tx = (k - 0.5) * -26;
    ty = Math.sin(k * Math.PI) * -10;
  } else if (move === "punch") {
    const speech = frames - Math.round((scene.pad ?? 0.35) * FPS);
    const fixed = scene.type === "hook" && !!scene.layout && scene.layout !== "poster"; // các hook không phải poster đóng dấu ở khung 16
    const cue = fixed ? null : phraseAt(scene.voice, scene.cue ?? (scene.type === "hook" ? "Khoan đã" : ""));
    const hit = fixed ? 16 : cue !== null ? Math.round(cue * speech) : scene.type === "hook" ? Math.round(frames * 0.42) : -1;
    scale = 1 + 0.03 * k;
    if (hit >= 0 && frame >= hit) {
      const u = Math.min(1, (frame - hit) / 12);
      scale += 0.09 * Math.sin(Math.PI * Math.min(1, u * 1.1)) * (1 - u * 0.5);
    }
  }
  return <AbsoluteFill style={{ transform: `translate(${tx}px ${ty}px) scale(${scale})`, transformOrigin: "50% 48%" }}>{children}</AbsoluteFill>;
};

/** Chuyển cảnh: cảnh mới phóng nhẹ từ 96% lên, cảnh cũ mờ đi ở 4 khung cuối. */
const SceneShell: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = interpolate(frame, [frames - 4, frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: Math.min(enter, exit), transform: `scale(${0.96 + 0.04 * enter})` }}>
      {children}
    </AbsoluteFill>
  );
};

/** Âm lượng nhạc nền: nhỏ lại khi có giọng đọc, to lên ở khoảng nghỉ, mở/kết mượt. */
const musicVolume = (f: number, base: number, timings: SceneTiming[], pads: number[], total: number) => {
  const RAMP = 8;
  let duck = 1;
  timings.forEach((t, i) => {
    const s = t.from + 2;
    const e = t.from + t.frames - pads[i];
    const k = interpolate(f, [s - RAMP, s, e, e + RAMP], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    duck = Math.min(duck, 1 - 0.6 * k);
  });
  const fade = interpolate(f, [0, 12, total - 45, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return base * duck * fade;
};

export const Short: React.FC<ShortProps> = ({ script, timings, credits = {} }) => {
  const frame = useCurrentFrame();
  const total = timings.reduce((s, t) => s + t.frames, 0);
  const pads = script.scenes.map((s) => Math.round((s.pad ?? 0.35) * FPS));
  return (
    <AbsoluteFill>
      <Paper />
      {script.scenes.map((scene, i) => {
        const t = timings[i];
        const pad = Math.round((scene.pad ?? 0.35) * FPS);
        return (
          <Sequence key={i} from={t.from} durationInFrames={t.frames} name={`${i + 1}. ${scene.type}`}>
            <SceneShell frames={t.frames}>
              {scene.type === "dialog" || scene.type === "memory" ? (
                <SceneBody scene={scene} frames={t.frames} slug={script.id} lines={t.lines} />
              ) : (
                <Camera scene={scene} index={i} frames={t.frames}>
                  <SceneBody scene={scene} frames={t.frames} slug={script.id} lines={t.lines} />
                </Camera>
              )}
            </SceneShell>
            {brollsOf(scene.broll).map((b, j) => (
              <Broll key={j} index={j} item={b} slug={script.id} frames={t.frames} credits={credits} scene={scene} />
            ))}
            {scene.source ? (
              <div style={{ position: "absolute", left: 60, right: 60, top: 1640, textAlign: "center", opacity: Math.min(1, frame < t.from ? 0 : (frame - t.from) / 10) }}>
                <span style={{ display: "inline-block", fontFamily: font.body, fontWeight: 700, fontSize: 32, color: color.ink, background: color.paperDark, border: `4px solid ${color.ink}`, borderRadius: 16, padding: "8px 22px" }}>
                  {scene.source}
                </span>
              </div>
            ) : null}
            {scene.type === "dialog" || scene.type === "memory" ? null : <Captions text={scene.sub ?? scene.voice} speechFrames={Math.max(1, t.frames - pad)} />}
            {t.audio ? <Audio src={staticFile(t.audio)} /> : null}
          </Sequence>
        );
      })}
      {/* chuyển cảnh: mỗi chỗ nối một kiểu khác nhau (quét vàng, mống mắt, thanh mực, lóe sáng) */}
      {timings.slice(1).map((t, i) => {
        const kind = transitionFor(i, script.scenes[i + 1].transition);
        if (kind === "none") return null;
        return (
          <Sequence key={`w${i}`} from={t.from - 4} durationInFrames={10} name={`chuyển cảnh ${kind}`}>
            <Transition kind={kind} />
            <Sfx name={kind === "flash" ? "shutter" : "whoosh"} at={0} volume={0.35} />
          </Sequence>
        );
      })}
      {script.hideHeader ? null : (
        <Header channel={script.channel} topic={script.topic} progress={total ? frame / total : 0} onDark={(() => { const i = timings.findIndex((t) => frame >= t.from && frame < t.from + t.frames); const sc = script.scenes[i]; return !!sc && ((sc.type === "story" && isDarkMood(sc.mood)) || sc.type === "dialog" || sc.type === "memory"); })()} />
      )}
      {script.music ? (
        <Audio
          src={staticFile(script.music)}
          volume={(f: number) => musicVolume(f, script.musicVolume ?? 0.22, timings, pads, total)}
          loop
        />
      ) : null}
    </AbsoluteFill>
  );
};
