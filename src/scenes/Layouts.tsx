import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { atFrame, ease, formatVnd, pop } from "../anim";
import { color, font } from "../brand";
import { BigArt, Charger, GasPump, Icon, iconFor } from "../components/Art";
import { Burst, Sfx } from "../components/Fx";
import { Headline, Stage } from "../components/Headline";
import { Mascot } from "../components/Mascot";
import { CheckIcon } from "../components/Props";
import type {
  ArtName,
  ChatScene as ChatData,
  CompareCard,
  CompareScene as CompareData,
  HookScene as HookData,
  LadderScene as LadderData,
  ListScene as ListData,
  MythScene as MythData,
  ReceiptScene as ReceiptData,
  StatScene as StatData,
  StepsScene as StepsData,
  VerdictScene as VerdictData,
} from "../types";

const ink = color.ink;
const TINTS = { red: color.red, green: color.green, blue: color.blue, yellow: "#E8B923" } as const;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Hình BigArt đặt trong khung HTML. */
const ArtBox: React.FC<{ name: ArtName; size: number; tint?: string }> = ({ name, size, tint }) => (
  <svg width={size} height={size} viewBox="-230 -230 460 460" style={{ flex: "none", overflow: "visible" }}>
    <BigArt name={name} x={0} y={0} scale={1} tint={tint} />
  </svg>
);

/** Hình cho thẻ so sánh: hình BigArt, hoặc cây xăng / trụ sạc cho xe xăng, xe điện. */
const CardArt: React.FC<{ card: CompareCard; size: number; tint?: string }> = ({ card, size, tint }) => {
  if (card.art) return <ArtBox name={card.art} size={size} tint={tint} />;
  if (card.kind === "generic") return null;
  return (
    <svg width={size} height={size} viewBox="-230 -230 460 460" style={{ flex: "none", overflow: "visible" }}>
      {card.kind === "electric" ? <Charger x={0} y={170} scale={1.35} /> : <GasPump x={0} y={170} scale={1.35} />}
    </svg>
  );
};

/** Chạy đếm phần số trong một chuỗi: "15,5 triệu" → 0 … 15,5 triệu. */
const countText = (value: string, p: number) => {
  const m = value.match(/\d[\d.,]*/);
  if (!m) return value;
  const raw = m[0].replace(/[.,]$/, "");
  const thousands = /^\d{1,3}(\.\d{3})+$/.test(raw);
  let num: number;
  let dec = 0;
  if (thousands) num = parseInt(raw.replace(/\./g, ""), 10);
  else {
    num = parseFloat(raw.replace(",", "."));
    dec = raw.includes(",") ? raw.split(",")[1].length : 0;
  }
  const cur = num * Math.min(1, p);
  const txt = thousands ? formatVnd(cur) : cur.toFixed(dec).replace(".", ",");
  return value.replace(raw, txt);
};

const box = (shadow: string = ink): React.CSSProperties => ({
  background: color.white,
  border: `6px solid ${ink}`,
  borderRadius: 28,
  boxShadow: `9px 9px 0 ${shadow}`,
});

/* ===================================================================== STAT */

export const StatScene: React.FC<{ scene: StatData; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const R = 215;
  const CY = 800;
  const fs = scene.value.length > 7 ? 130 : scene.value.length > 4 ? 160 : 200;
  const circ = 2 * Math.PI * R;
  const ringP = ease(frame, 8, 40);
  const numP = ease(frame, 10, 34);
  const pct = scene.ring ?? 0.78;
  const chips = scene.chips ?? [];
  return (
    <AbsoluteFill>
      <Headline text={scene.headline} size={78} />
      <Stage>
        <g filter="url(#boil)">
          <circle cx={540} cy={CY} r={R + 46} fill={color.white} stroke={ink} strokeWidth={6} />
          <circle cx={540} cy={CY} r={R} fill="none" stroke={color.paperDark} strokeWidth={40} />
          <circle
            cx={540}
            cy={CY}
            r={R}
            fill="none"
            stroke={color.yellow}
            strokeWidth={40}
            strokeLinecap="round"
            strokeDasharray={`${circ * pct * ringP} ${circ}`}
            transform="rotate(-90 540 800)"
          />
        </g>
        <Mascot pose={scene.pose ?? "thumbs"} x={945} y={1065} scale={0.5} enter={20} />
      </Stage>
      <div
        style={{
          position: "absolute",
          left: 300,
          right: 300,
          top: CY - fs * 0.55,
          textAlign: "center",
          fontFamily: font.display,
          fontWeight: 900,
          fontSize: fs,
          lineHeight: 1,
          color: ink,
          transform: `scale(${0.8 + 0.2 * Math.min(1, numP * 1.2)})`,
          whiteSpace: "nowrap",
          marginLeft: -60,
          marginRight: -60,
        }}
      >
        {countText(scene.value, numP)}
      </div>
      {scene.unit ? (
        <div
          style={{
            position: "absolute",
            left: 200,
            right: 200,
            top: CY + fs * 0.42,
            textAlign: "center",
            fontFamily: font.display,
            fontWeight: 800,
            fontSize: 52,
            color: color.inkSoft,
            opacity: ease(frame, 30, 10),
          }}
        >
          {scene.unit}
        </div>
      ) : null}
      <div style={{ position: "absolute", top: 1130, left: 60, right: 60, justifyContent: "center", display: "flex", flexWrap: "wrap", gap: 16 }}>
        {chips.map((c, i) => {
          const start = atFrame(c.at, frames);
          const p = pop(frame, start);
          return (
            <div
              key={i}
              style={{
                fontFamily: font.display,
                fontWeight: 800,
                fontSize: 40,
                color: ink,
                background: i % 2 ? color.sky : color.yellow,
                border: `5px solid ${ink}`,
                borderRadius: 999,
                padding: "8px 26px",
                opacity: frame < start ? 0 : Math.min(1, p * 1.5),
                transform: `scale(${0.6 + 0.4 * p}) rotate(${(i % 2 ? 2 : -2) * p}deg)`,
              }}
            >
              {c.text}
            </div>
          );
        })}
      </div>
      {chips.map((c, i) => (
        <Sfx key={i} name="pop" at={atFrame(c.at, frames)} volume={0.45} />
      ))}
      <Sfx name="ding" at={44} volume={0.4} />
    </AbsoluteFill>
  );
};

/* ===================================================================== STEPS */

export const StepsScene: React.FC<{ scene: StepsData; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const n = scene.steps.length;
  const cardH = n <= 3 ? 220 : 175;
  const gap = n <= 3 ? 70 : 42;
  const top0 = 500;
  const W = 760;
  const xOf = (i: number) => (i % 2 === 0 ? 70 : 1080 - 70 - W);
  return (
    <AbsoluteFill>
      <Headline text={scene.headline} highlight size={72} />
      <Stage>
        {scene.steps.slice(0, -1).map((_, i) => {
          const start = atFrame(scene.steps[i + 1].at, frames) - 8;
          const t = ease(frame, start, 14);
          const y1 = top0 + i * (cardH + gap) + cardH;
          const y2 = y1 + gap;
          const fromRight = i % 2 === 0; // thẻ chẵn lệch trái → mũi tên đi từ cạnh phải xuống
          const xa = fromRight ? xOf(i) + W - 90 : xOf(i) + 90;
          const xb = fromRight ? xOf(i + 1) + 90 : xOf(i + 1) + W - 90;
          return (
            <g key={i} filter="url(#boil)" opacity={t}>
              <path
                d={`M${xa} ${y1 + 6} C ${xa} ${y1 + gap * 0.9}, ${xb} ${y1 + gap * 0.1}, ${xb} ${y2 - 10}`}
                fill="none"
                stroke={ink}
                strokeWidth={7}
                strokeDasharray="4 16"
                strokeLinecap="round"
              />
              <path d={`M${xb - 16} ${y2 - 30} L${xb} ${y2 - 6} L${xb + 16} ${y2 - 30}`} fill="none" stroke={ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}
      </Stage>
      {scene.steps.map((s, i) => {
        const start = atFrame(s.at, frames);
        const p = pop(frame, start);
        const dir = i % 2 === 0 ? -1 : 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: xOf(i),
              top: top0 + i * (cardH + gap),
              width: W,
              height: cardH,
              ...box(i % 2 ? color.blue : color.yellow),
              padding: "18px 30px 18px 100px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              opacity: frame < start ? 0 : Math.min(1, p * 1.5),
              transform: `translateX(${(1 - p) * 220 * dir * -1}px) rotate(${(i % 2 ? 1.2 : -1.2) * p}deg)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: -34,
                top: cardH / 2 - 54,
                width: 108,
                height: 108,
                borderRadius: 54,
                background: i % 2 ? color.blue : color.yellow,
                border: `6px solid ${ink}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: font.display,
                fontWeight: 900,
                fontSize: 66,
                color: i % 2 ? color.white : ink,
              }}
            >
              {i + 1}
            </div>
            <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 50, lineHeight: 1.1, color: ink }}>{s.title}</div>
            {s.detail ? (
              <div style={{ fontFamily: font.body, fontWeight: 600, fontSize: 36, lineHeight: 1.2, color: color.inkSoft, marginTop: 6 }}>{s.detail}</div>
            ) : null}
          </div>
        );
      })}
      {scene.steps.map((s, i) => (
        <Sfx key={i} name="pop" at={atFrame(s.at, frames)} volume={0.45} />
      ))}
    </AbsoluteFill>
  );
};

/* ===================================================================== MYTH */

export const MythScene: React.FC<{ scene: MythData; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const starts = scene.pairs.map((p) => atFrame(p.at, frames));
  let k = 0;
  starts.forEach((s, i) => {
    if (frame >= s) k = i;
  });
  const pair = scene.pairs[k];
  const f = frame - starts[k];
  const myP = pop(f, 0);
  const strike = ease(f, 26, 8);
  const factP = pop(f, 40);
  const pose = f < 40 ? "think" : "thumbs";
  return (
    <AbsoluteFill>
      <Headline text={scene.headline} size={76} />
      <div style={{ position: "absolute", top: 470, left: 90, right: 90, height: 300, opacity: Math.min(1, myP * 1.5), transform: `translateX(${(1 - myP) * -300}px) rotate(${-2 * myP}deg)` }}>
        <div style={{ ...box(color.red), height: "100%", padding: "56px 34px 20px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "visible" }}>
          <div style={{ position: "absolute", top: -34, left: 28, background: color.red, color: color.white, border: `5px solid ${ink}`, borderRadius: 14, padding: "2px 22px", fontFamily: font.display, fontWeight: 900, fontSize: 36 }}>
            TƯỞNG LÀ
          </div>
          <div style={{ position: "relative", fontFamily: font.display, fontWeight: 800, fontSize: 56, lineHeight: 1.12, textAlign: "center", color: ink }}>
            {pair.myth}
            <div style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 9, background: color.red, borderRadius: 5, transformOrigin: "left", transform: `scaleX(${strike}) rotate(-2deg)` }} />
          </div>
          <div style={{ position: "absolute", right: -26, top: -30, transform: `scale(${strike})` }}>
            <CheckIcon good={false} size={96} />
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 830,
          left: 90,
          right: 90,
          height: 300,
          opacity: f < 40 ? 0 : Math.min(1, factP * 1.5),
          transform: `translateX(${(1 - factP) * 300}px) rotate(${2 * factP}deg)`,
        }}
      >
        <div style={{ ...box(color.green), height: "100%", padding: "56px 34px 20px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: -34, left: 28, background: color.green, color: color.white, border: `5px solid ${ink}`, borderRadius: 14, padding: "2px 22px", fontFamily: font.display, fontWeight: 900, fontSize: 36 }}>
            THỰC RA
          </div>
          <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 56, lineHeight: 1.12, textAlign: "center", color: ink }}>{pair.fact}</div>
          <div style={{ position: "absolute", right: -26, top: -30 }}>
            <CheckIcon good size={96} />
          </div>
        </div>
      </div>
      <Stage>
        <Mascot key={k} pose={pose} x={905} y={1355} scale={0.42} enter={0} changedAt={f >= 40 ? starts[k] + 40 : undefined} />
        {scene.pairs.map((_, i) => (
          <circle key={i} cx={540 + (i - (scene.pairs.length - 1) / 2) * 46} cy={1320} r={i === k ? 14 : 9} fill={i === k ? color.yellow : color.paperDark} stroke={ink} strokeWidth={4} />
        ))}
        <Burst x={540} y={980} at={starts[k] + 40} r={110} tint={color.green} seed={k} />
      </Stage>
      {starts.map((s, i) => (
        <React.Fragment key={i}>
          <Sfx name="pop" at={s} volume={0.45} />
          <Sfx name="stamp" at={s + 26} volume={0.4} />
          <Sfx name="ding" at={s + 40} volume={0.4} />
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

/* ===================================================================== CHAT */

const estLines = (text: string, perLine: number) => Math.max(1, Math.ceil(text.length / perLine));

export const ChatScene: React.FC<{ scene: ChatData; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const TEXT = 44;
  const lh = 56;
  const BW = 640;
  const perLine = 24;
  let y = 640;
  const laid = scene.messages.map((m) => {
    const h = estLines(m.text, perLine) * lh + 44;
    const top = y;
    y += h + 30;
    return { ...m, h, top };
  });
  const bottom = Math.max(...laid.map((m) => m.top + m.h), 900) + 40;
  const panelH = Math.min(900, Math.max(620, bottom - 450 + 40));
  const typing = (m: (typeof laid)[number]) => {
    const s = atFrame(m.at, frames);
    return m.from === "bot" && frame >= s - 16 && frame < s;
  };
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 420,
          height: panelH,
          ...box(color.blue),
          overflow: "hidden",
          opacity: ease(frame, 0, 8),
          transform: `translateY(${(1 - pop(frame, 0)) * 80}px)`,
        }}
      >
        <div style={{ height: 120, background: color.blue, borderBottom: `6px solid ${ink}`, display: "flex", alignItems: "center", gap: 22, padding: "0 30px" }}>
          <div style={{ width: 70, height: 70, borderRadius: 35, background: color.yellow, border: `5px solid ${ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.display, fontWeight: 900, fontSize: 40, color: ink }}>T</div>
          <div>
            <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 44, color: color.white, lineHeight: 1 }}>{scene.title ?? "Hỏi nhanh"}</div>
            <div style={{ fontFamily: font.body, fontWeight: 600, fontSize: 28, color: "#DCE9FF" }}>đang trực tuyến</div>
          </div>
        </div>
      </div>
      {laid.map((m, i) => {
        const s = atFrame(m.at, frames);
        const p = pop(frame, s);
        const user = m.from === "user";
        if (frame < s) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: m.top - 100,
              left: user ? 110 : undefined,
              right: user ? undefined : 110,
              maxWidth: BW + 60,
              padding: "20px 30px",
              fontFamily: font.display,
              fontWeight: 700,
              fontSize: TEXT,
              lineHeight: `${lh}px`,
              color: user ? ink : color.white,
              background: user ? "#ECE6D6" : color.blue,
              border: `5px solid ${ink}`,
              borderRadius: user ? "28px 28px 28px 6px" : "28px 28px 6px 28px",
              transformOrigin: user ? "left bottom" : "right bottom",
              transform: `scale(${0.7 + 0.3 * p})`,
              opacity: Math.min(1, p * 1.6),
            }}
          >
            {m.text}
          </div>
        );
      })}
      {laid.map((m, i) =>
        typing(m) ? (
          <div
            key={`t${i}`}
            style={{ position: "absolute", top: m.top - 100, right: 110, background: color.blue, border: `5px solid ${ink}`, borderRadius: "28px 28px 6px 28px", padding: "20px 34px", display: "flex", gap: 12 }}
          >
            {[0, 1, 2].map((d) => (
              <div key={d} style={{ width: 20, height: 20, borderRadius: 10, background: color.white, transform: `translateY(${Math.sin((frame + d * 4) / 3) * 6}px)` }} />
            ))}
          </div>
        ) : null,
      )}
      {laid.map((m, i) => (
        <Sfx key={i} name={m.from === "bot" ? "ding" : "pop"} at={atFrame(m.at, frames)} volume={0.4} />
      ))}
    </AbsoluteFill>
  );
};

/* ===================================================================== RECEIPT */

export const ReceiptScene: React.FC<{ scene: ReceiptData; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const rowH = 96;
  const n = scene.rows.length;
  const h = 170 + n * rowH + 190;
  const enter = pop(frame, 0);
  const totalStart = atFrame(scene.total.at, frames);
  const totalP = pop(frame, totalStart);
  return (
    <AbsoluteFill>
      <Headline text={scene.headline} size={84} />
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 480,
          width: 820,
          height: h,
          background: "#FFFDF6",
          border: `6px solid ${ink}`,
          borderRadius: 14,
          boxShadow: `10px 12px 0 ${color.paperDark}`,
          transform: `translateY(${(1 - enter) * 160}px) rotate(-1.6deg)`,
          opacity: Math.min(1, enter * 1.5),
          padding: "26px 44px",
        }}
      >
        <div style={{ textAlign: "center", fontFamily: font.display, fontWeight: 900, fontSize: 40, letterSpacing: 8, color: ink, borderBottom: `5px dashed ${ink}`, paddingBottom: 20 }}>
          ★ TÓM GỌN ★
        </div>
        {scene.rows.map((r, i) => {
          const s = atFrame(r.at, frames);
          const p = pop(frame, s);
          return (
            <div
              key={i}
              style={{
                height: rowH,
                display: "flex",
                alignItems: "center",
                gap: 14,
                opacity: frame < s ? 0 : Math.min(1, p * 1.6),
                transform: `translateX(${(1 - p) * 60}px)`,
              }}
            >
              <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 42, color: ink, whiteSpace: "nowrap" }}>{r.label}</div>
              <div style={{ flex: 1, borderBottom: `5px dotted ${color.inkSoft}`, transform: "translateY(10px)" }} />
              <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 46, color: ink, whiteSpace: "nowrap" }}>{r.value}</div>
            </div>
          );
        })}
        <div style={{ borderTop: `5px dashed ${ink}`, marginTop: 8, paddingTop: 22, display: "flex", alignItems: "center", gap: 16, opacity: frame < totalStart ? 0 : 1, transform: `scale(${0.8 + 0.2 * totalP})`, transformOrigin: "left center" }}>
          <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 52, color: ink }}>{scene.total.label}</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 64, color: ink, background: color.yellow, border: `5px solid ${ink}`, borderRadius: 14, padding: "0 20px", transform: "rotate(-2deg)" }}>
            {scene.total.value}
          </div>
        </div>
      </div>
      <Stage>
        <Mascot pose="clipboard" x={900} y={1360} scale={0.42} enter={totalStart} />
        <Burst x={780} y={480 + h - 70} at={totalStart + 2} r={80} tint={color.red} seed={3} />
      </Stage>
      {scene.rows.map((r, i) => (
        <Sfx key={i} name="tick" at={atFrame(r.at, frames)} volume={0.5} />
      ))}
      <Sfx name="stamp" at={totalStart} volume={0.5} />
    </AbsoluteFill>
  );
};

/* ===================================================================== LADDER */

const RUNG_COLORS = ["#BFE3C7", "#FFE08A", "#F7C07A", "#F1948A", "#E5483B"];

export const LadderScene: React.FC<{ scene: LadderData; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const n = scene.rungs.length;
  const colW = n <= 2 ? 300 : n === 3 ? 230 : n === 4 ? 190 : 160;
  const gapX = 16;
  const totalW = n * colW + (n - 1) * gapX;
  const x0 = 540 - totalW / 2;
  const base = 1190;
  const step = n <= 2 ? 330 : n === 3 ? 190 : n === 4 ? 140 : 100;
  const hOf = (i: number) => (n >= 4 ? 120 : 150) + i * step;
  const starts = scene.rungs.map((r) => atFrame(r.at, frames));
  let active = -1;
  starts.forEach((s, i) => {
    if (frame >= s) active = i;
  });
  const cx = (i: number) => x0 + i * (colW + gapX) + colW / 2;
  return (
    <AbsoluteFill>
      <Headline text={scene.headline} highlight size={84} />
      <Stage>
        <g filter="url(#boil)">
          <line x1={x0 - 30} x2={x0 + totalW + 30} y1={base} y2={base} stroke={ink} strokeWidth={8} strokeLinecap="round" />
        </g>
        {active >= 0 ? (
          <Mascot key={active} pose={active >= n - 1 ? "excited" : "stand"} x={cx(active)} y={base - hOf(active) * ease(frame, starts[active], 14)} scale={n <= 4 ? 0.4 : 0.34} enter={starts[active] + 8} />
        ) : null}
      </Stage>
      {scene.rungs.map((r, i) => {
        const s = starts[i];
        const g = ease(frame, s, 14);
        const hh = hOf(i) * g;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: x0 + i * (colW + gapX),
                top: base - hh,
                width: colW,
                height: hh,
                background: RUNG_COLORS[Math.min(RUNG_COLORS.length - 1, Math.round((i / Math.max(1, n - 1)) * (RUNG_COLORS.length - 1)))],
                border: `6px solid ${ink}`,
                borderBottom: "none",
                borderRadius: "16px 16px 0 0",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 14,
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: n <= 2 ? 56 : n === 3 ? 66 : 52, color: ink, opacity: ease(frame, s + 6, 8) }}>{r.value}</div>
            </div>
            <div
              style={{
                position: "absolute",
                left: x0 + i * (colW + gapX) - 6,
                width: colW + 12,
                top: base + 18,
                textAlign: "center",
                fontFamily: font.display,
                fontWeight: 800,
                fontSize: 32,
                lineHeight: 1.1,
                color: ink,
                opacity: frame < s ? 0 : 1,
              }}
            >
              {r.label}
            </div>
          </React.Fragment>
        );
      })}
      {starts.map((s, i) => (
        <Sfx key={i} name="pop" at={s} volume={0.45} />
      ))}
    </AbsoluteFill>
  );
};

/* ===================================================================== HOOK biến thể */

export const HookVariant: React.FC<{ scene: HookData; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const art = scene.art && scene.art !== "scooter" ? scene.art : "doc";
  const L = scene.layout ?? "poster";
  const stampP = pop(frame, 16, 150);
  const lines = scene.headline;

  if (L === "number") {
    return (
      <AbsoluteFill>
        <div style={{ position: "absolute", top: 300, left: 60, right: 60, textAlign: "center" }}>
          {lines.map((l, i) => {
            const p = pop(frame, 3 + i * 6, 200);
            return (
              <div key={i} style={{ fontFamily: font.display, fontWeight: 900, fontSize: 86, lineHeight: 1.08, color: ink, opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * -50}px)` }}>
                {l}
              </div>
            );
          })}
        </div>
        <Stage>
          <circle cx={558} cy={978} r={300 * Math.min(1.05, stampP)} fill={ink} />
          <circle cx={540} cy={960} r={300 * Math.min(1.05, stampP)} fill={color.white} stroke={ink} strokeWidth={10} filter="url(#boil)" />
          <Mascot pose="shocked" x={900} y={1360} scale={0.6} enter={10} />
        </Stage>
        <div
          style={{
            position: "absolute",
            left: 240,
            right: 240,
            top: 840,
            textAlign: "center",
            fontFamily: font.display,
            fontWeight: 900,
            fontSize: (scene.stamp ?? "").length > 8 ? 100 : (scene.stamp ?? "").length > 6 ? 118 : (scene.stamp ?? "").length > 4 ? 150 : 210,
            lineHeight: 1,
            color: color.red,
            whiteSpace: "nowrap",
            marginLeft: -60,
            marginRight: -60,
            transform: `scale(${0.4 + 0.6 * Math.min(1, stampP)}) rotate(${-4 * stampP}deg)`,
          }}
        >
          {scene.stamp}
        </div>
        <Sfx name="stamp" at={16} volume={0.55} />
      </AbsoluteFill>
    );
  }

  if (L === "news") {
    const blink = Math.floor(frame / 12) % 2 === 0;
    const bar = pop(frame, 0);
    return (
      <AbsoluteFill>
        <div style={{ position: "absolute", top: 310, left: 60, right: 60, height: 92, background: color.red, border: `6px solid ${ink}`, borderRadius: 16, display: "flex", alignItems: "center", gap: 20, padding: "0 28px", transform: `translateX(${(1 - bar) * -400}px)` }}>
          <div style={{ width: 30, height: 30, borderRadius: 15, background: blink ? color.white : "#F6B0A9", border: `4px solid ${ink}` }} />
          <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 54, color: color.white, letterSpacing: 4 }}>TIN NÓNG</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 34, color: color.white }}>{scene.stamp ?? ""}</div>
        </div>
        <div style={{ position: "absolute", top: 430, left: 60, right: 60, ...box(color.yellow), padding: "30px 36px", opacity: ease(frame, 4, 8) }}>
          {lines.map((l, i) => {
            const p = pop(frame, 8 + i * 6, 200);
            return (
              <div key={i} style={{ fontFamily: font.display, fontWeight: 900, fontSize: 96, lineHeight: 1.08, color: ink, textAlign: "left", opacity: Math.min(1, p * 1.4), transform: `translateX(${(1 - p) * 120}px)` }}>
                {l}
              </div>
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            top: 440 + 60 + lines.length * 104 + 60,
            left: 60,
            right: 60,
            height: 1320 - (440 + 60 + lines.length * 104 + 60),
            border: `6px solid ${ink}`,
            borderRadius: 22,
            background: color.sky,
            overflow: "hidden",
            opacity: ease(frame, 26, 10),
            transform: `scale(${0.9 + 0.1 * ease(frame, 26, 12)})`,
          }}
        >
          <svg width="100%" height="100%" viewBox="-400 -250 800 500" preserveAspectRatio="xMidYMid slice">
            <BigArt name={art} x={0} y={0} scale={0.9} />
          </svg>
        </div>
        <Sfx name="swoosh" at={0} volume={0.4} />
      </AbsoluteFill>
    );
  }

  // question
  const wob = Math.sin(frame / 8) * 3;
  return (
    <AbsoluteFill>
      <Stage>
        <text x={540} y={1250} textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize={1000} fill={color.yellow} stroke={ink} strokeWidth={14} opacity={0.95} transform={`rotate(${wob} 540 900)`} filter="url(#boil)">
          ?
        </text>
        <g transform="translate(250 1130)">
          <g opacity={Math.min(1, pop(frame, 8))} transform={`scale(${0.5 + 0.5 * pop(frame, 8)})`}>
            <BigArt name={art} x={0} y={0} scale={0.62} />
          </g>
        </g>
        <Mascot pose="confused" x={700} y={1365} scale={1.0} enter={4} />
      </Stage>
      <div style={{ position: "absolute", top: 300, left: 60, right: 60, ...box(color.red), padding: "26px 30px", textAlign: "center", opacity: ease(frame, 0, 6), transform: `scale(${0.85 + 0.15 * pop(frame, 0)})` }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: font.display, fontWeight: 900, fontSize: 92, lineHeight: 1.08, color: ink }}>
            {i === lines.length - 1 ? <span style={{ background: color.yellow, padding: "0 16px", borderRadius: 12 }}>{l}</span> : l}
          </div>
        ))}
      </div>
      <Sfx name="pop" at={2} volume={0.5} />
    </AbsoluteFill>
  );
};

/* ===================================================================== LIST biến thể */

export const ListVariant: React.FC<{ scene: ListData; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const good = scene.tone === "good";
  const n = scene.items.length;
  const at = scene.at ?? scene.items.map((_, i) => 0.08 + (i * 0.8) / n);
  const L = scene.layout ?? "tiles";
  const sfx = at.map((a, i) => <Sfx key={i} name="pop" at={atFrame(a, frames)} volume={0.45} />);

  if (L === "tiles") {
    const cols = 2;
    const W = 420;
    const H = 340;
    return (
      <AbsoluteFill>
        <Headline text={scene.headline} highlight={good} size={90} />
        {scene.items.map((item, i) => {
          const start = atFrame(at[i], frames);
          const p = pop(frame, start);
          const col = i % cols;
          const row = Math.floor(i / cols);
          const last = i === n - 1 && n % 2 === 1;
          const left = last ? 540 - W / 2 : 100 + col * (W + 40);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left,
                top: 500 + row * (H + 30),
                width: W,
                height: H,
                ...box(good ? color.green : color.red),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                padding: 20,
                opacity: frame < start ? 0 : Math.min(1, p * 1.5),
                transform: `scale(${0.5 + 0.5 * p}) rotate(${(i % 2 ? 2 : -2) * p}deg)`,
              }}
            >
              <div style={{ width: 110, height: 110, borderRadius: 55, background: good ? "#CDEFD9" : "#F9D2CD", border: `5px solid ${ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={iconFor(item)} size={66} />
              </div>
              <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 44, lineHeight: 1.1, textAlign: "center", color: ink }}>{item}</div>
              <div style={{ position: "absolute", top: -22, right: -18 }}>
                <CheckIcon good={good} size={64} />
              </div>
            </div>
          );
        })}
        <Stage>
          <Mascot pose={scene.pose ?? (good ? "ok" : "confused")} x={n > 2 ? 190 : 880} y={1350} scale={0.45} enter={4} />
        </Stage>
        {sfx}
      </AbsoluteFill>
    );
  }

  if (L === "notes") {
    const palette = [color.yellow, "#F9B8C8", color.sky, "#C9EBC4", "#FFD0A6"];
    const pos = [
      { x: 90, y: 500, r: -4 },
      { x: 360, y: 760, r: 3 },
      { x: 120, y: 1010, r: -2 },
      { x: 400, y: 1220, r: 4 },
    ];
    return (
      <AbsoluteFill>
        <Headline text={scene.headline} highlight={good} size={90} />
        {scene.items.map((item, i) => {
          const start = atFrame(at[i], frames);
          const p = pop(frame, start, 140);
          const ps = pos[i % pos.length];
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: ps.x,
                top: ps.y,
                width: 600,
                minHeight: 200,
                background: palette[i % palette.length],
                border: `5px solid ${ink}`,
                boxShadow: `12px 14px 0 rgba(29,27,25,0.22)`,
                padding: "46px 34px 28px",
                opacity: frame < start ? 0 : Math.min(1, p * 1.6),
                transform: `translateY(${(1 - p) * -200}px) rotate(${ps.r * p}deg) scale(${0.7 + 0.3 * p})`,
              }}
            >
              <div style={{ position: "absolute", top: -22, left: 270, width: 44, height: 44, borderRadius: 22, background: good ? color.green : color.red, border: `5px solid ${ink}` }} />
              <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 52, lineHeight: 1.12, color: ink }}>{item}</div>
              <div style={{ position: "absolute", right: 14, bottom: 8, fontFamily: font.display, fontWeight: 900, fontSize: 46, color: good ? color.green : color.red }}>{good ? "✓" : "✗"}</div>
            </div>
          );
        })}
        <Stage>
          <Mascot pose={scene.pose ?? (good ? "ok" : "confused")} x={925} y={1350} scale={0.5} enter={4} />
        </Stage>
        {sfx}
      </AbsoluteFill>
    );
  }

  // clipboard
  const rowH = n <= 3 ? 190 : 150;
  const p0 = pop(frame, 0);
  return (
    <AbsoluteFill>
      <Headline text={scene.headline} highlight={good} size={90} />
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 520,
          width: 860,
          height: 110 + n * rowH + 40,
          background: "#FFFDF6",
          border: `7px solid ${ink}`,
          borderRadius: 26,
          boxShadow: `12px 12px 0 ${good ? color.green : color.red}`,
          transform: `translateY(${(1 - p0) * 200}px) rotate(1.2deg)`,
          opacity: Math.min(1, p0 * 1.6),
        }}
      >
        <div style={{ position: "absolute", top: -40, left: 330, width: 200, height: 84, background: "#8A8F99", border: `6px solid ${ink}`, borderRadius: 18 }}>
          <div style={{ margin: "18px auto 0", width: 90, height: 22, borderRadius: 11, background: ink }} />
        </div>
        <div style={{ paddingTop: 70 }}>
          {scene.items.map((item, i) => {
            const start = atFrame(at[i], frames);
            const p = pop(frame, start);
            const draw = ease(frame, start + 4, 10);
            return (
              <div key={i} style={{ height: rowH, display: "flex", alignItems: "center", gap: 28, padding: "0 44px", borderBottom: i < n - 1 ? `4px solid ${color.paperDark}` : "none" }}>
                <div style={{ position: "relative", width: 84, height: 84, border: `6px solid ${ink}`, borderRadius: 14, background: color.white, flex: "none" }}>
                  <svg width="84" height="84" viewBox="0 0 84 84" style={{ position: "absolute", left: -6, top: -6, overflow: "visible" }}>
                    {good ? (
                      <path d="M16 44 L36 64 L84 6" fill="none" stroke={color.green} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={120} strokeDashoffset={120 * (1 - draw)} />
                    ) : (
                      <>
                        <path d="M14 14 L70 70" stroke={color.red} strokeWidth={14} strokeLinecap="round" strokeDasharray={80} strokeDashoffset={80 * (1 - Math.min(1, draw * 2))} />
                        <path d="M70 14 L14 70" stroke={color.red} strokeWidth={14} strokeLinecap="round" strokeDasharray={80} strokeDashoffset={80 * (1 - Math.max(0, draw * 2 - 1))} />
                      </>
                    )}
                  </svg>
                </div>
                <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: n <= 3 ? 54 : 46, lineHeight: 1.1, color: ink, opacity: frame < start ? 0 : Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 60}px)` }}>{item}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Stage>
        <Mascot pose={scene.pose ?? (good ? "thumbs" : "sad")} x={940} y={1390} scale={0.34} enter={4} />
      </Stage>
      {sfx}
    </AbsoluteFill>
  );
};

/* ===================================================================== COMPARE biến thể */

const tintOf = (c: CompareCard) => (c.kind === "generic" ? TINTS[c.tint ?? "blue"] : c.kind === "electric" ? color.green : color.red);

export const CompareVariant: React.FC<{ scene: CompareData; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const [a, b] = scene.cards;
  const sa = atFrame(a.at, frames);
  const sb = atFrame(b.at, frames);
  const L = scene.layout ?? "slider";

  if (L === "duel") {
    const row = (c: CompareCard, s: number, top: number, flip: boolean) => {
      const p = pop(frame, s);
      const t = tintOf(c);
      return (
        <div
          style={{
            position: "absolute",
            left: 60,
            right: 60,
            top,
            height: 330,
            ...box(t),
            display: "flex",
            flexDirection: flip ? "row-reverse" : "row",
            alignItems: "center",
            gap: 16,
            padding: "0 26px",
            opacity: frame < s ? 0 : Math.min(1, p * 1.5),
            transform: `translateX(${(1 - p) * (flip ? 500 : -500)}px)`,
          }}
        >
          <div style={{ width: 280, flex: "none", textAlign: "center" }}>
            <CardArt card={c} size={200} tint={t} />
          </div>
          <div style={{ flex: 1, textAlign: flip ? "right" : "left" }}>
            <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 40, color: color.white, background: t, display: "inline-block", borderRadius: 12, padding: "2px 18px", border: `4px solid ${ink}` }}>{c.label}</div>
            <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: ink, marginTop: 8, whiteSpace: "nowrap" }}>{countText(c.amountText ?? "", ease(frame, s + 4, 26))}</div>
            <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 34, color: color.inkSoft }}>{c.unit}</div>
            {c.note ? <div style={{ fontFamily: font.body, fontWeight: 600, fontSize: 28, color: color.inkSoft }}>{c.note}</div> : null}
          </div>
        </div>
      );
    };
    const vs = pop(frame, sb);
    return (
      <AbsoluteFill>
        <Headline text={scene.headline} highlight size={74} />
        {row(a, sa, 480, false)}
        {row(b, sb, 900, true)}
        <div style={{ position: "absolute", left: 540 - 60, top: 810, width: 120, height: 120, borderRadius: 60, background: color.yellow, border: `6px solid ${ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.display, fontWeight: 900, fontSize: 52, color: ink, transform: `scale(${vs}) rotate(${-8 * vs}deg)`, zIndex: 5 }}>VS</div>
        {scene.footnote ? (
          <div style={{ position: "absolute", left: 60, right: 60, top: 1260, textAlign: "center", fontFamily: font.body, fontWeight: 600, fontSize: 26, color: color.inkSoft, opacity: ease(frame, sb + 20, 10) }}>{scene.footnote}</div>
        ) : null}
        <Sfx name="pop" at={sa} volume={0.45} />
        <Sfx name="pop" at={sb} volume={0.45} />
      </AbsoluteFill>
    );
  }

  // slider: một khung chia đôi theo đường chéo, vạch chia quét từ trái sang phải
  const sweep = ease(frame, sb - 6, 18);
  const split = 50 + 12 * (sweep - 0.5); // %
  const half = (c: CompareCard, side: "l" | "r") => {
    const t = tintOf(c);
    const s = side === "l" ? sa : sb;
    const p = pop(frame, s);
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: side === "l" ? color.white : "#FFF6D9",
          clipPath: side === "l" ? `polygon(0 0, ${split + 8}% 0, ${split - 8}% 100%, 0 100%)` : `polygon(${split + 8}% 0, 100% 0, 100% 100%, ${split - 8}% 100%)`,
          opacity: frame < s - 2 ? 0 : 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 60,
            [side === "l" ? "left" : "right"]: side === "l" ? 40 : 28,
            width: 340,
            textAlign: "center",
            opacity: Math.min(1, p * 1.5),
            transform: `scale(${0.7 + 0.3 * p})`,
          }}
        >
          <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 44, color: color.white, background: t, display: "inline-block", borderRadius: 14, padding: "2px 22px", border: `5px solid ${ink}` }}>{c.label}</div>
          <div style={{ marginTop: 6 }}><CardArt card={c} size={250} tint={t} /></div>
          <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: (c.amountText ?? "").length > 9 ? 54 : (c.amountText ?? "").length > 6 ? 68 : 82, lineHeight: 1, color: ink, whiteSpace: "nowrap" }}>{countText(c.amountText ?? "", ease(frame, s + 4, 26))}</div>
          <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 32, color: color.inkSoft }}>{c.unit}</div>
          {c.note ? <div style={{ fontFamily: font.body, fontWeight: 600, fontSize: 27, color: color.inkSoft, marginTop: 6 }}>{c.note}</div> : null}
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <Headline text={scene.headline} highlight size={74} />
      <div style={{ position: "absolute", left: 50, right: 50, top: 470, height: 760, border: `7px solid ${ink}`, borderRadius: 30, overflow: "hidden", boxShadow: `12px 12px 0 ${ink}`, background: color.white }}>
        {half(a, "l")}
        {half(b, "r")}
        <svg width="100%" height="100%" viewBox="0 0 980 760" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <line x1={(split + 8) * 9.8} y1={0} x2={(split - 8) * 9.8} y2={760} stroke={ink} strokeWidth={10} />
        </svg>
      </div>
      {scene.footnote ? (
        <div style={{ position: "absolute", left: 60, right: 60, top: 1260, textAlign: "center", fontFamily: font.body, fontWeight: 600, fontSize: 26, color: color.inkSoft, opacity: ease(frame, sb + 20, 10) }}>{scene.footnote}</div>
      ) : null}
      <Sfx name="pop" at={sa} volume={0.45} />
      <Sfx name="swoosh" at={sb - 6} volume={0.4} />
    </AbsoluteFill>
  );
};

/* ===================================================================== VERDICT biến thể (cái cân) */

export const ScaleVerdict: React.FC<{ scene: VerdictData; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const rightAt = atFrame(scene.rightAt ?? 0.55, frames);
  const heavier = scene.heavier ?? "left";
  const target = heavier === "left" ? -9 : heavier === "right" ? 9 : 0;
  // cân dao động rồi dừng nghiêng khi cả hai bên đã hiện
  const settle = ease(frame, rightAt + 6, 24);
  const wobble = Math.sin(frame / 5) * 5 * (1 - settle);
  const angle = target * settle + wobble * (frame < rightAt + 6 ? 0.6 : 1);
  const L = 280;
  const rad = (angle * Math.PI) / 180;
  const lx = 540 - Math.cos(rad) * L;
  const ly = 640 - Math.sin(rad) * L;
  const rx = 540 + Math.cos(rad) * L;
  const ry = 640 + Math.sin(rad) * L;
  const pan = (x: number, y: number, title: string, tint: string, shown: boolean) => (
    <g opacity={shown ? 1 : 0.25}>
      <line x1={x} y1={y} x2={x - 130} y2={y + 170} stroke={ink} strokeWidth={6} />
      <line x1={x} y1={y} x2={x + 130} y2={y + 170} stroke={ink} strokeWidth={6} />
      <path d={`M${x - 170} ${y + 170} H${x + 170} Q${x + 160} ${y + 260} ${x} ${y + 260} Q${x - 160} ${y + 260} ${x - 170} ${y + 170} Z`} fill={tint} stroke={ink} strokeWidth={8} />
      <text x={x} y={y + 232} textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize={46} fill={ink}>{title}</text>
    </g>
  );
  const col = (side: "left" | "right", x: number, tint: string, start: number) => {
    const d = side === "left" ? scene.left : scene.right;
    return (
      <div style={{ position: "absolute", left: x, top: 1040, width: 440, display: "flex", flexDirection: "column", gap: 12 }}>
        {d.items.map((it, i) => {
          const s = start + i * 6;
          const p = pop(frame, s);
          return (
            <div key={i} style={{ fontFamily: font.display, fontWeight: 800, fontSize: 38, lineHeight: 1.1, color: ink, background: color.white, border: `5px solid ${ink}`, borderRadius: 16, padding: "10px 18px", boxShadow: `6px 6px 0 ${tint}`, opacity: frame < s ? 0 : Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px)` }}>
              {it}
            </div>
          );
        })}
      </div>
    );
  };
  const p0 = pop(frame, 0);
  return (
    <AbsoluteFill>
      <Headline text={scene.headline} size={84} />
      <Stage>
        <g filter="url(#boil)" opacity={p0}>
          <path d="M470 1010 L540 700 L610 1010 Z" fill="#CFC6B2" stroke={ink} strokeWidth={8} />
          <rect x={420} y={1000} width={240} height={30} rx={10} fill="#CFC6B2" stroke={ink} strokeWidth={8} />
          <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={ink} strokeWidth={18} strokeLinecap="round" />
          <circle cx={540} cy={640} r={26} fill={color.yellow} stroke={ink} strokeWidth={8} />
          {pan(lx, ly, scene.left.title, "#CDEFD9", true)}
          {pan(rx, ry, scene.right.title, "#FFE08A", frame >= rightAt)}
        </g>
      </Stage>
      {col("left", 60, color.green, atFrame(0.25, frames))}
      {col("right", 580, color.yellow, rightAt + 8)}
      <Sfx name="ding" at={rightAt + 6} volume={0.45} />
    </AbsoluteFill>
  );
};
