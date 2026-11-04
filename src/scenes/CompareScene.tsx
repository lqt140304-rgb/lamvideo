import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { atFrame, formatVnd, pop } from "../anim";
import { color, font } from "../brand";
import { Headline } from "../components/Headline";
import { BigArt, Charger, GasPump, HAS_VEHICLE_PHOTOS, Scooter } from "../components/Art";
import { Sfx } from "../components/Fx";
import type { CompareCard, CompareScene as CompareData } from "../types";

const TINTS = { red: color.red, green: color.green, blue: color.blue, yellow: "#E8B923" } as const;
const tintOf = (c: CompareCard) => (c.kind === "generic" ? TINTS[c.tint ?? "blue"] : c.kind === "electric" ? color.green : color.red);

const Card: React.FC<{ card: CompareCard; start: number }> = ({ card, start }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, start);
  const count = interpolate(frame, [start + 6, start + 30], [0, card.amount ?? 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tint = tintOf(card);
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
      <svg width="400" height="270" viewBox="-200 -170 400 270" style={{ overflow: "hidden", marginTop: 10 }}>
        {card.kind === "generic" ? (
          <BigArt name={card.art ?? "money"} x={0} y={-24} scale={0.5} tint={card.kind === "generic" ? tint : undefined} />
        ) : (
          <>
            {card.kind === "electric" ? <Charger x={150} y={86} scale={0.62} /> : <GasPump x={150} y={86} scale={0.62} />}
            <Scooter kind={card.kind} x={-30} y={6} scale={0.62} moving rider={!HAS_VEHICLE_PHOTOS} />
          </>
        )}
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

      {(() => {
        const [a, b] = scene.cards;
        const pa = a.amount ?? 0;
        const pb = b.amount ?? (b.kind === "generic" ? 0 : 6700);
        const grow = (start: number) => Math.min(1, Math.max(0, (frame - start - 10) / 22));
        const rows = [
          { c: a, v: pa, w: 1, g: grow(atFrame(a.at, frames) + 20), tint: tintOf(a) },
          { c: b, v: pb, w: pb / (pa || 1), g: grow(vsAt + 10), tint: tintOf(b) },
        ];
        const save = pa && b.kind !== "generic" ? Math.round((1 - pb / pa) * 100) : 0;
        const badge = scene.badge ?? (save > 0 ? `Tiết kiệm ~${save}%` : "");
        if (scene.bars === false || !pa || !pb) return null;
        return (
          <div style={{ position: "absolute", top: 1166, left: 70, right: 70, opacity: frame > atFrame(a.at, frames) + 18 ? 1 : 0 }}>
            {rows.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                <div style={{ width: 150, fontFamily: font.display, fontWeight: 900, fontSize: 28, color: color.ink }}>{r.c.label}</div>
                <div style={{ flex: 1, height: 34, background: color.paperDark, border: `4px solid ${color.ink}`, borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ width: `${Math.max(7, r.w * 100) * r.g}%`, height: "100%", background: r.tint }} />
                </div>
              </div>
            ))}
            {badge ? (
              <div style={{ textAlign: "center", opacity: grow(vsAt + 20) }}>
                <span style={{ display: "inline-block", fontFamily: font.display, fontWeight: 900, fontSize: 34, color: color.white, background: color.green, border: `4px solid ${color.ink}`, borderRadius: 14, padding: "0 20px", transform: `rotate(-2deg) scale(${0.8 + 0.2 * grow(vsAt + 20)})` }}>
                  {badge}
                </span>
              </div>
            ) : null}
          </div>
        );
      })()}
      {scene.footnote ? (
        <div
          style={{
            position: "absolute",
            top: 1338,
            left: 70,
            right: 70,
            textAlign: "center",
            fontFamily: font.body,
            fontWeight: 600,
            fontSize: 21,
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
