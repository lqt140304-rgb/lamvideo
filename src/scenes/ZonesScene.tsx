import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ease, pop } from "../anim";
import { Mascot } from "../components/Mascot";
import { Headline, Stage } from "../components/Headline";
import { ZoneMap } from "../components/Props";
import type { ZonesScene as ZonesData } from "../types";

export const ZonesScene: React.FC<{ scene: ZonesData; frames: number }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const map = pop(frame, 6);
  return (
    <AbsoluteFill>
      <Headline text={scene.headline} highlight size={80} />
      <Stage>
        <g transform={`translate(0 ${(1 - map) * 80})`} opacity={Math.min(1, map * 1.5)}>
          <ZoneMap x={600} y={860} size={640} level={scene.level} reveal={ease(frame, 14, 16)} />
        </g>
        <Mascot pose={scene.pose ?? "ok"} x={175} y={1150} scale={0.8} enter={4} />
      </Stage>
    </AbsoluteFill>
  );
};
