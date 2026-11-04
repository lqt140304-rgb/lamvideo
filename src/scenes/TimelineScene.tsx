import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { atFrame, ease, pop } from "../anim";
import { color, font } from "../brand";
import { Headline, Stage } from "../components/Headline";
import { ZoneMap } from "../components/Props";
import { Sfx } from "../components/Fx";
import { Icon, iconFor } from "../components/Art";
import type { TimelineScene as TimelineData } from "../types";

export const TimelineScene: React.FC<{ scene: TimelineData; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const starts = scene.steps.map((s) => atFrame(s.at, frames));
  let active = 0;
  starts.forEach((st, i) => {
    if (frame >= st) active = i;
  });
  const step = scene.steps[active];
  void iconFor;
  return (
    <AbsoluteFill>
      <Headline text={scene.headline} size={76} top={316} />
      <Stage>
        <ZoneMap x={540} y={660} size={400} level={step.level} reveal={ease(frame, starts[active], 14)} />
      </Stage>
      {/* trục thời gian */}
      <div style={{ position: "absolute", top: 960, left: 94, width: 8, height: 400, background: color.paperDark, border: `3px solid ${color.ink}`, borderRadius: 6 }}>
        <div style={{ width: "100%", height: `${Math.min(100, ((active + ease(frame, starts[active], 14)) / scene.steps.length) * 100)}%`, background: color.red, borderRadius: 6 }} />
      </div>
      <div style={{ position: "absolute", top: 900, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 14 }}>
        {scene.steps.map((s, i) => {
          const p = pop(frame, starts[i]);
          const isActive = i === active;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                minHeight: 112,
                padding: "10px 22px",
                borderRadius: 22,
                border: `5px solid ${color.ink}`,
                background: isActive ? color.white : color.paper,
                boxShadow: isActive ? `8px 8px 0 ${color.ink}` : "none",
                opacity: frame < starts[i] ? 0 : (isActive ? 1 : 0.55) * Math.min(1, p * 1.4),
                transform: `translateX(${(1 - p) * 120}px)`,
              }}
            >
              <div style={{ flex: "none", width: 64, height: 64, borderRadius: 32, background: isActive ? color.yellow : color.paperDark, border: `5px solid ${color.ink}`, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: -18 }}>
                <Icon name={i === 0 ? "calendar" : i === 1 ? "scooter" : "pin"} size={38} />
              </div>
              <div
                style={{
                  flex: "none",
                  minWidth: 170,
                  textAlign: "center",
                  fontFamily: font.display,
                  fontWeight: 900,
                  fontSize: 42,
                  color: color.white,
                  background: isActive ? color.red : color.inkSoft,
                  borderRadius: 14,
                  padding: "6px 10px",
                }}
              >
                {s.when}
              </div>
              <div style={{ fontFamily: font.body, fontWeight: 600, fontSize: 34, lineHeight: 1.16, color: color.ink, textWrap: "balance" }}>
                {s.what}
              </div>
            </div>
          );
        })}
      </div>
      {starts.map((st, i) => (
        <Sfx key={i} name="tick" at={st} volume={0.6} />
      ))}
    </AbsoluteFill>
  );
};
