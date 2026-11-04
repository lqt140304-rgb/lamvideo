import React from "react";
import { AbsoluteFill, interpolate, Easing, useCurrentFrame } from "remotion";
import { pop } from "../anim";
import { color, font } from "../brand";
import { Mascot } from "../components/Mascot";
import { Stage } from "../components/Headline";
import { Scooter, Stamp } from "../components/Props";
import { Burst, ShockLines, Sfx } from "../components/Fx";
import { introEnd, phraseAt } from "../components/Broll";
import { FPS } from "../brand";
import type { HookScene as HookData } from "../types";

export const HookScene: React.FC<{ scene: HookData; frames: number }> = ({ scene, frames }) => {
  // Có ảnh thật ở đầu cảnh thì phần hoạt hình bắt đầu sau ảnh.
  const intro = introEnd(scene, frames);
  const frame = useCurrentFrame() - intro;
  const drive = interpolate(frame, [0, 28], [-260, 380], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  // Dấu "CẤM?" đóng đúng lúc đọc "Khoan đã" (nếu có trong lời đọc), không thì ở 42% cảnh.
  const speech = frames - Math.round((scene.pad ?? 0.35) * FPS);
  const khoan = phraseAt(scene.voice, "Khoan đã");
  const stampAt = Math.max(14, (khoan !== null ? Math.round(khoan * speech) : Math.round(frames * 0.42)) - intro);
  const stamp = scene.stamp ? interpolate(frame, [stampAt, stampAt + 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const shake = frame >= stampAt && frame < stampAt + 8 ? Math.sin(frame * 3) * 10 : 0;

  return (
    <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
      <div style={{ position: "absolute", top: 320, left: 60, right: 60, textAlign: "center" }}>
        {scene.headline.map((line, i) => {
          const p = pop(frame, 4 + i * 7, 200);
          const last = i === scene.headline.length - 1;
          return (
            <div
              key={i}
              style={{
                fontFamily: font.display,
                fontWeight: 900,
                fontSize: 112,
                lineHeight: 1.08,
                color: color.ink,
                opacity: Math.min(1, p * 1.4),
                transform: `scale(${0.6 + 0.4 * p}) rotate(${(i % 2 ? 1.5 : -1.5) * p}deg)`,
              }}
            >
              <span
                style={
                  last
                    ? { background: color.yellow, padding: "0 20px", borderRadius: 14 }
                    : undefined
                }
              >
                {line}
              </span>
            </div>
          );
        })}
      </div>
      <Sfx name="swoosh" at={intro} volume={0.3} />
      {scene.headline.map((_, i) => (
        <Sfx key={i} name="pop" at={intro + 4 + i * 7} volume={0.3} />
      ))}
      {scene.stamp ? <Sfx name="stamp" at={intro + stampAt} volume={0.75} /> : null}
      <Stage>
        <ShockLines x={850} y={930} at={intro + stampAt} r={430} />
        <Scooter kind="petrol" x={drive} y={1110} scale={1.3} moving={frame < 34 || frame > stampAt + 8} />
        <Stamp text={scene.stamp ?? ""} x={380} y={1010} progress={stamp} />
        {scene.stamp ? <Burst x={380} y={1010} at={intro + stampAt + 2} r={190} tint={color.red} rays={12} /> : null}
        <Mascot pose={frame > stampAt ? "shocked" : "surprised"} changedAt={intro + stampAt} x={850} y={1185} scale={0.98} enter={intro + 8} />
      </Stage>
    </AbsoluteFill>
  );
};
