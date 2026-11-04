import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "./brand";
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
import { Broll, brollsOf } from "./components/Broll";
import { Sfx, Wipe } from "./components/Fx";
import type { ImageCredits, Scene, SceneTiming, VideoScript } from "./types";

export type ShortProps = {
  script: VideoScript;
  timings: SceneTiming[];
  /** Ảnh thật đã tải (public/<slug>/img/credits.json). */
  credits?: ImageCredits;
};

const SceneBody: React.FC<{ scene: Scene; frames: number }> = ({ scene, frames }) => {
  switch (scene.type) {
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
              <SceneBody scene={scene} frames={t.frames} />
            </SceneShell>
            {brollsOf(scene.broll).map((b, j) => (
              <Broll key={j} index={j} item={b} slug={script.id} frames={t.frames} credits={credits} scene={scene} />
            ))}
            <Captions text={scene.sub ?? scene.voice} speechFrames={Math.max(1, t.frames - pad)} />
            {t.audio ? <Audio src={staticFile(t.audio)} /> : null}
          </Sequence>
        );
      })}
      {/* chuyển cảnh: dải vàng quét + tiếng vút */}
      {timings.slice(1).map((t, i) => (
        <Sequence key={`w${i}`} from={t.from - 4} durationInFrames={10} name="chuyển cảnh">
          <Wipe />
          <Sfx name="whoosh" at={0} volume={0.35} />
        </Sequence>
      ))}
      <Header topic={script.topic} progress={total ? frame / total : 0} />
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
