import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ease, pop } from "../anim";
import { color, font } from "../brand";
import { Confetti, Sfx } from "../components/Fx";
import { Mascot } from "../components/Mascot";
import { Stage } from "../components/Headline";
import { Scribble } from "../components/Props";
import type { OutroScene as OutroData } from "../types";

export const OutroScene: React.FC<{ scene: OutroData; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const k = pop(frame, 0, 220);
  const ctaAt = Math.round(frames * 0.5);
  const cta = pop(frame, ctaAt);
  return (
    <AbsoluteFill>
      <Confetti at={12} />
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            fontFamily: font.display,
            fontWeight: 900,
            fontSize: 130,
            color: color.ink,
            transform: `scale(${0.5 + 0.5 * k}) rotate(-3deg)`,
            opacity: Math.min(1, k * 1.5),
          }}
        >
          {scene.kicker}
        </div>
        <div style={{ marginTop: -10 }}>
          <Scribble width={620} progress={ease(frame, 8, 14)} />
        </div>
        {scene.message.map((line, i) => {
          const p = pop(frame, 14 + i * 8);
          return (
            <div
              key={i}
              style={{
                marginTop: 18,
                fontFamily: font.display,
                fontWeight: 900,
                fontSize: 76,
                color: i === scene.message.length - 1 ? color.red : color.ink,
                opacity: Math.min(1, p * 1.4),
                transform: `translateY(${(1 - p) * 40}px)`,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
      <Stage>
        <Mascot pose="happy" x={290} y={1190} scale={0.8} enter={4} />
      </Stage>
      <div
        style={{
          position: "absolute",
          top: 880,
          left: 520,
          width: 470,
          padding: "26px 28px",
          background: color.white,
          border: `6px solid ${color.ink}`,
          borderRadius: 34,
          boxShadow: `9px 9px 0 ${color.ink}`,
          fontFamily: font.display,
          fontWeight: 900,
          fontSize: 50,
          lineHeight: 1.12,
          color: color.ink,
          textAlign: "center",
          opacity: frame < ctaAt ? 0 : Math.min(1, cta * 1.4),
          transform: `scale(${0.6 + 0.4 * cta}) rotate(${2 * cta}deg)`,
          transformOrigin: "left bottom",
        }}
      >
        {scene.cta}
      </div>
      <Sfx name="ding" at={2} volume={0.45} />
      <Sfx name="pop" at={ctaAt} volume={0.45} />
    </AbsoluteFill>
  );
};
