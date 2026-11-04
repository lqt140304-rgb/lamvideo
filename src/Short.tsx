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
import type { Scene, SceneTiming, VideoScript } from "./types";

export type ShortProps = {
  script: VideoScript;
  timings: SceneTiming[];
};

const SceneBody: React.FC<{ scene: Scene; frames: number }> = ({ scene, frames }) => {
  switch (scene.type) {
    case "hook":
      return <HookScene scene={scene} frames={frames} />;
    case "zones":
      return <ZonesScene scene={scene} frames={frames} />;
    case "timeline":
      return <TimelineScene scene={scene} frames={frames} />;
    case "compare":
      return <CompareScene scene={scene} frames={frames} />;
    case "list":
      return <ListScene scene={scene} frames={frames} />;
    case "verdict":
      return <VerdictScene scene={scene} frames={frames} />;
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

export const Short: React.FC<ShortProps> = ({ script, timings }) => {
  const frame = useCurrentFrame();
  const total = timings.reduce((s, t) => s + t.frames, 0);
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
            <Captions text={scene.sub ?? scene.voice} speechFrames={Math.max(1, t.frames - pad)} />
            {t.audio ? <Audio src={staticFile(t.audio)} /> : null}
          </Sequence>
        );
      })}
      <Header topic={script.topic} progress={total ? frame / total : 0} />
      {script.music ? <Audio src={staticFile(script.music)} volume={script.musicVolume ?? 0.1} loop /> : null}
    </AbsoluteFill>
  );
};
