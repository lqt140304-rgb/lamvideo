import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { atFrame, formatVnd, pop } from "../anim";
import { color, font } from "../brand";
import { Headline } from "../components/Headline";
import { Scooter } from "../components/Props";
import { Sfx } from "../components/Fx";
import type { CompareCard, CompareScene as CompareData } from "../types";

const Card: React.FC<{ card: CompareCard; start: number }> = ({ card, start }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, start);
  const count = interpolate(frame, [start + 6, start + 30], [0, card.amount ?? 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tint = card.kind === "electric" ? color.green : color.red;
  return (
    <div
      style={{
        flex: 1,
        borderRadius: 30,
        border: `6px solid ${color.ink}`,
        background: color.white,
        boxShadow: `10px 10px 0 ${color.ink}`,
        padding: "26px 18px 30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: frame < start ? 0 : Math.min(1, p * 1.4),
        transform: `translateY(${(1 - p) * 140}px) rotate(${(card.kind === "electric" ? 2 : -2) * p}deg)`,
      }}
    >
      <div
        style={{
          fontFamily: font.display,
          fontWeight: 900,
          fontSize: 50,
          color: color.white,
          background: tint,
          padding: "6px 26px",
          borderRadius: 16,
          border: `5px solid ${color.ink}`,
        }}
      >
        {card.label}
      </div>
      <svg width="400" height="250" viewBox="-200 -150 400 250" style={{ overflow: "hidden", marginTop: 10 }}>
        <Scooter kind={card.kind} x={20} y={0} scale={1.05} moving />
      </svg>
      <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 82, color: tint, lineHeight: 1, marginTop: 6 }}>
        {card.amountText ?? `${formatVnd(count)}đ`}
      </div>
      <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 38, color: color.ink, marginTop: 10 }}>{card.unit}</div>
      {card.note ? (
        <div style={{ fontFamily: font.body, fontWeight: 600, fontSize: 30, color: color.inkSoft, marginTop: 14, textAlign: "center" }}>
          {card.note}
        </div>
      ) : null}
    </div>
  );
};

export const CompareScene: React.FC<{ scene: CompareData; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const vsAt = atFrame(scene.cards[1].at, frames);
  const vs = pop(frame, vsAt - 4, 260);
  return (
    <AbsoluteFill>
      <Headline text={scene.headline} highlight size={80} />
      <div style={{ position: "absolute", top: 520, left: 50, right: 50, display: "flex", gap: 34 }}>
        {scene.cards.map((card, i) => (
          <Card key={i} card={card} start={atFrame(card.at, frames)} />
        ))}
      </div>
      {scene.cards.map((card, i) => (
        <React.Fragment key={i}>
          <Sfx name="pop" at={atFrame(card.at, frames)} volume={0.45} />
          {card.kind === "electric" ? <Sfx name="ding" at={atFrame(card.at, frames) + 24} volume={0.3} /> : null}
        </React.Fragment>
      ))}
      <Sfx name="stamp" at={vsAt - 4} volume={0.35} />
      <div
        style={{
          position: "absolute",
          top: 760,
          left: 540 - 62,
          width: 124,
          height: 124,
          borderRadius: 62,
          background: color.yellow,
          border: `6px solid ${color.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: font.display,
          fontWeight: 900,
          fontSize: 50,
          color: color.ink,
          transform: `scale(${vs}) rotate(${(1 - vs) * 90}deg)`,
        }}
      >
        VS
      </div>
      {scene.footnote ? (
        <div
          style={{
            position: "absolute",
            top: 1250,
            left: 70,
            right: 70,
            textAlign: "center",
            fontFamily: font.body,
            fontWeight: 600,
            fontSize: 28,
            color: color.inkSoft,
            opacity: frame > vsAt ? 1 : 0,
          }}
        >
          {scene.footnote}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
