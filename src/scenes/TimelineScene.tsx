import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { atFrame, ease, pop } from "../anim";
import { color, font } from "../brand";
import { Headline, Stage } from "../components/Headline";
import { ZoneMap } from "../components/Props";
import { Sfx } from "../components/Fx";
import { BigArt, Icon, iconFor } from "../components/Art";
import type { TimelineScene as TimelineData } from "../types";

export const TimelineScene: React.FC<{ scene: TimelineData; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const starts = scene.steps.map((s) => atFrame(s.at, frames));
  let active = 0;
  starts.forEach((st, i) => {
    if (frame >= st) active = i;
  });
  const step = scene.steps[active];
  return (
    <AbsoluteFill>
      <Headline text={scene.headline} size={76} top={316} />
      <Stage>
        {(scene.art ?? "zone") === "zone" ? (
          <ZoneMap x={540} y={660} size={400} level={step.level ?? 1} reveal={ease(frame, starts[active], 14)} />
        ) : scene.art === "none" ? null : scene.art === "commute" ? (
          <Commute active={active} start={starts[active]} />
        ) : (
          <g transform={`translate(0 ${-(1 - pop(frame, starts[active], 260)) * 14})`}>
            <BigArt name={scene.art as never} x={540} y={640} scale={0.5 + 0.04 * Math.min(1, pop(frame, starts[active], 260))} />
          </g>
        )}
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
                <Icon name={i === 0 ? "calendar" : iconFor(s.when + " " + s.what)} size={38} />
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

/** Tan làm → nhắn nhóm → ra sân: ba hình lớn, hình đang nói tới được phóng to. */
const Commute: React.FC<{ active: number; start: number }> = ({ active, start }) => {
  const frame = useCurrentFrame();
  const ink = color.ink;
  const sc = (i: number) => 0.9 + 0.22 * (i === active ? pop(frame, start, 200) : 0);
  const op = (i: number) => (i === active ? 1 : 0.6);
  const hand = (deg: number, len: number, w: number) => (
    <path d={`M0 0 L${Math.sin((deg * Math.PI) / 180) * len} ${-Math.cos((deg * Math.PI) / 180) * len}`} stroke={ink} strokeWidth={w} strokeLinecap="round" />
  );
  const arrow = (x: number) => <path d={`M${x - 26} 650 H${x + 14} M${x - 2} 632 L${x + 18} 650 L${x - 2} 668`} fill="none" stroke={ink} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />;
  return (
    <g filter="url(#boil)">
      <g transform={`translate(190 650) scale(${sc(0)})`} opacity={op(0)}>
        <circle r="112" fill={color.white} stroke={ink} strokeWidth="10" />
        {[...Array(12)].map((_, k) => <path key={k} d={`M0 -98 V-84`} stroke={ink} strokeWidth="6" transform={`rotate(${k * 30})`} />)}
        {hand(180, 56, 11)}
        {hand((frame * 2) % 360 * (active === 0 ? 1 : 0) + 0, 80, 7)}
        <circle r="9" fill={color.red} stroke={ink} strokeWidth="4" />
        <text y="150" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="40" fill={ink}>18 giờ</text>
      </g>
      {arrow(365)}
      <g transform={`translate(540 650) scale(${sc(1)})`} opacity={op(1)}>
        <rect x="-82" y="-130" width="164" height="260" rx="28" fill="#2B2724" stroke={ink} strokeWidth="9" />
        <rect x="-68" y="-108" width="136" height="216" rx="14" fill="#DCEFFB" />
        <g transform={`translate(0 ${(1 - Math.min(1, (frame - start) / 14)) * 8})`}>
          <rect x="-58" y="-90" width="96" height="40" rx="14" fill="#ECE6D6" stroke={ink} strokeWidth="4" />
          <rect x="-38" y="-38" width="96" height="40" rx="14" fill={color.blue} stroke={ink} strokeWidth="4" />
          <rect x="-58" y="14" width="96" height="40" rx="14" fill="#ECE6D6" stroke={ink} strokeWidth="4" />
        </g>
        <text y="172" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="40" fill={ink}>Hẹn nhóm</text>
      </g>
      {arrow(715)}
      <g transform={`translate(890 650) scale(${sc(2)})`} opacity={op(2)}>
        <rect x="-96" y="-130" width="192" height="260" rx="8" fill="#9ED3A5" stroke={ink} strokeWidth="9" />
        <path d="M-96 0 H96 M-96 -86 H96 M-96 86 H96 M0 -86 V86 M-48 -130 V130 M48 -130 V130" stroke={color.white} strokeWidth="5" fill="none" />
        <path d="M-114 0 H114" stroke={ink} strokeWidth="9" strokeDasharray="12 8" />
        <g transform={`translate(${Math.sin(frame / 10) * 20} ${-40 + Math.cos(frame / 8) * 14}) rotate(-20)`}>
          <path d="M-10 0 L-18 -26 H18 L10 0 Z" fill={color.white} stroke={ink} strokeWidth="4" />
          <circle cy="8" r="10" fill="#F2D6A2" stroke={ink} strokeWidth="4" />
        </g>
        <text y="172" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="40" fill={ink}>Ra sân</text>
      </g>
    </g>
  );
};
