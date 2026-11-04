import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { atFrame, pop } from "../anim";
import { color, font } from "../brand";
import { Mascot } from "../components/Mascot";
import { Headline, Stage } from "../components/Headline";
import type { VerdictScene as VerdictData } from "../types";

const Column: React.FC<{ title: string; items: string[]; tint: string; start: number; tilt: number }> = ({
  title,
  items,
  tint,
  start,
  tilt,
}) => {
  const frame = useCurrentFrame();
  const p = pop(frame, start);
  return (
    <div
      style={{
        flex: 1,
        background: color.white,
        border: `6px solid ${color.ink}`,
        borderRadius: 28,
        boxShadow: `10px 10px 0 ${tint}`,
        padding: "0 0 22px",
        overflow: "hidden",
        opacity: frame < start ? 0 : Math.min(1, p * 1.4),
        transform: `translateY(${(1 - p) * 120}px) rotate(${tilt * p}deg)`,
      }}
    >
      <div
        style={{
          background: tint,
          borderBottom: `6px solid ${color.ink}`,
          padding: "18px 10px",
          textAlign: "center",
          fontFamily: font.display,
          fontWeight: 900,
          fontSize: 48,
          color: color.ink,
        }}
      >
        {title}
      </div>
      {items.map((it, i) => {
        const q = pop(frame, start + 8 + i * 8);
        return (
          <div
            key={i}
            style={{
              margin: "20px 22px 0",
              fontFamily: font.display,
              fontWeight: 800,
              fontSize: 42,
              lineHeight: 1.15,
              color: color.ink,
              opacity: Math.min(1, q * 1.4),
              display: "flex",
              gap: 12,
            }}
          >
            <span style={{ color: tint === color.yellow ? color.inkSoft : tint }}>●</span>
            <span>{it}</span>
          </div>
        );
      })}
    </div>
  );
};

export const VerdictScene: React.FC<{ scene: VerdictData; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const rightAt = atFrame(scene.rightAt ?? 0.55, frames);
  return (
    <AbsoluteFill>
      <Headline text={scene.headline} size={86} />
      <div style={{ position: "absolute", top: 470, left: 50, right: 50, display: "flex", gap: 30, alignItems: "flex-start" }}>
        <Column title={scene.left.title} items={scene.left.items} tint={color.green} start={6} tilt={-1.5} />
        <Column title={scene.right.title} items={scene.right.items} tint={color.yellow} start={rightAt} tilt={1.5} />
      </div>
      <Stage>
        <Mascot pose={frame < rightAt ? "present" : "ok"} x={540} y={1130} scale={0.62} enter={0} />
      </Stage>
    </AbsoluteFill>
  );
};
