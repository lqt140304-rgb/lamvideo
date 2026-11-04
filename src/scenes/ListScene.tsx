import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { atFrame, pop } from "../anim";
import { color, font } from "../brand";
import { Mascot } from "../components/Mascot";
import { Headline, Stage } from "../components/Headline";
import { CheckIcon } from "../components/Props";
import { Icon, iconFor } from "../components/Art";
import { Burst, Sfx } from "../components/Fx";
import type { ListScene as ListData } from "../types";

export const ListScene: React.FC<{ scene: ListData; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const good = scene.tone === "good";
  const n = scene.items.length;
  const at = scene.at ?? scene.items.map((_, i) => 0.08 + (i * 0.8) / n);
  return (
    <AbsoluteFill>
      <Headline text={scene.headline} highlight={good} size={92} />
      <div style={{ position: "absolute", top: 500, left: 70, right: 70, display: "flex", flexDirection: "column", gap: 26 }}>
        {scene.items.map((item, i) => {
          const start = atFrame(at[i], frames);
          const p = pop(frame, start);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                opacity: frame < start ? 0 : Math.min(1, p * 1.5),
                transform: `translateX(${(1 - p) * -160}px)`,
              }}
            >
              <div style={{ position: "relative", flex: "none", width: 90, height: 90 }}>
                <div style={{ width: 90, height: 90, borderRadius: 45, background: good ? "#CDEFD9" : "#F9D2CD", border: `5px solid ${color.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={iconFor(item)} size={52} />
                </div>
                <div style={{ position: "absolute", right: -14, bottom: -14 }}>
                  <CheckIcon good={good} size={44} />
                </div>
              </div>
              <div
                style={{
                  fontFamily: font.display,
                  fontWeight: 800,
                  fontSize: 54,
                  lineHeight: 1.12,
                  color: color.ink,
                  background: color.white,
                  border: `5px solid ${color.ink}`,
                  borderRadius: 20,
                  padding: "14px 24px",
                  boxShadow: `7px 7px 0 ${good ? color.green : color.red}`,
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </div>
      {at.map((a, i) => (
        <Sfx key={i} name="pop" at={atFrame(a, frames)} volume={0.45} />
      ))}
      <Stage>
        {at.map((a, i) => (
          <Burst key={i} x={107} y={552 + i * 126} at={atFrame(a, frames) + 2} r={52} tint={good ? color.green : color.red} seed={i} />
        ))}
        <Mascot pose={scene.pose ?? (good ? "excited" : "confused")} x={n <= 3 ? 880 : 925} y={1345} scale={n <= 3 ? 0.78 : 0.5} enter={2} />
      </Stage>
    </AbsoluteFill>
  );
};
