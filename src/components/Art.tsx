import React from "react";
import { random, useCurrentFrame } from "remotion";
import { color, font } from "../brand";

// Hình vẽ chi tiết dùng chung: xe tay ga có người lái, phố Hà Nội, trụ xăng, trụ sạc, biểu tượng.
const ink = color.ink;
const SW = { strokeLinejoin: "round", strokeLinecap: "round" } as const;

const shade = (hex: string, k: number) => {
  // k > 0 sáng hơn, k < 0 tối hơn
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(k > 0 ? c + (255 - c) * k : c * (1 + k))));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
};

/* ------------------------------------------------------------------ Xe tay ga + người lái */

export const Rider: React.FC<{ helmet?: string; shirt?: string }> = ({ helmet = color.yellow, shirt = color.blue }) => (
  <g {...SW}>
    {/* chân */}
    <path d="M-52 -64 L-8 -10 L34 22" fill="none" stroke={ink} strokeWidth="26" />
    <path d="M-52 -64 L-8 -10 L34 22" fill="none" stroke="#3B4A6B" strokeWidth="16" />
    <path d="M24 26 L58 26 L58 40 L22 40 Z" fill={ink} />
    {/* thân */}
    <path d="M-86 -66 Q-76 -150 -36 -160 Q-4 -160 6 -128 L-6 -76 Z" fill={shirt} stroke={ink} strokeWidth="7" />
    <path d="M-60 -92 Q-40 -120 -22 -138" fill="none" stroke={shade(shirt, 0.35)} strokeWidth="6" />
    {/* tay */}
    <path d="M-6 -126 L56 -116 L104 -104" fill="none" stroke={ink} strokeWidth="22" />
    <path d="M-6 -126 L56 -116 L104 -104" fill="none" stroke={shirt} strokeWidth="12" />
    <circle cx="108" cy="-103" r="10" fill="#F2C29B" stroke={ink} strokeWidth="5" />
    {/* đầu + mũ bảo hiểm */}
    <circle cx="-10" cy="-190" r="27" fill="#F2C29B" stroke={ink} strokeWidth="7" />
    <path d="M-40 -194 Q-38 -228 -8 -226 Q22 -224 20 -192 L-2 -190 Q-14 -198 -40 -194 Z" fill={helmet} stroke={ink} strokeWidth="7" />
    <path d="M-30 -208 Q-18 -218 -4 -216" fill="none" stroke={color.white} strokeWidth="5" opacity="0.7" />
    <circle cx="8" cy="-186" r="3" fill={ink} />
  </g>
);

export const Scooter: React.FC<{
  kind: "petrol" | "electric";
  x: number;
  y: number;
  scale?: number;
  moving?: boolean;
  rider?: boolean;
  flip?: boolean;
  tint?: string;
  helmet?: string;
}> = ({ kind, x, y, scale = 1, moving = false, rider = false, flip = false, tint, helmet }) => {
  const frame = useCurrentFrame();
  const body = tint ?? (kind === "electric" ? color.green : color.red);
  const dark = shade(body, -0.22);
  const light = shade(body, 0.4);
  const shake = moving ? Math.sin(frame * 1.7) * 1.4 : 0;
  const spin = moving ? frame * 22 : 0;
  const beam = 0.28 + (moving ? Math.sin(frame / 3) * 0.06 : 0);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`} filter="url(#boil)" {...SW}>
      <ellipse cx="0" cy="88" rx="158" ry="10" fill="rgba(29,27,25,0.16)" />
      {kind === "petrol" ? <Smoke x={-158} y={42} active={moving} /> : null}
      <g transform={`translate(0 ${shake})`}>
        {/* chùm sáng đèn pha */}
        <path d="M130 -78 L270 -120 L270 -12 Z" fill={color.yellow} opacity={beam} />
        {/* ống xả / bình ắc quy */}
        {kind === "petrol" ? (
          <g>
            <path d="M-150 38 L-96 44 L-96 62 L-150 56 Z" fill="#A5A097" stroke={ink} strokeWidth="6" />
            <path d="M-140 42 L-100 47" stroke={color.white} strokeWidth="4" opacity="0.7" />
          </g>
        ) : (
          <g>
            <rect x="-86" y="-28" width="74" height="54" rx="10" fill="#2E8F66" stroke={ink} strokeWidth="6" />
            <path d="M-44 -22 L-62 6 L-48 6 L-56 22 L-30 -8 L-44 -8 Z" fill={color.yellow} stroke={ink} strokeWidth="4" />
          </g>
        )}
        {/* thân sau */}
        <path d="M-142 34 Q-158 -22 -116 -46 L-44 -54 L-8 -22 L30 20 L40 44 L-124 46 Z" fill={body} stroke={ink} strokeWidth="7" />
        <path d="M-130 -8 Q-124 -30 -100 -38" fill="none" stroke={light} strokeWidth="7" opacity="0.8" />
        <path d="M-120 36 L34 36" stroke={dark} strokeWidth="6" opacity="0.6" />
        {/* đèn hậu + biển số */}
        <rect x="-150" y="-12" width="14" height="20" rx="4" fill={color.red} stroke={ink} strokeWidth="5" />
        <rect x="-136" y="14" width="46" height="22" rx="4" fill={color.white} stroke={ink} strokeWidth="4" />
        <text x="-113" y="31" textAnchor="middle" fontFamily={font.display} fontWeight={800} fontSize="15" fill={ink}>
          {kind === "electric" ? "29-MĐ1" : "29-B1"}
        </text>
        {/* yên */}
        <path d="M-124 -50 Q-116 -82 -56 -80 L-18 -72 Q-6 -68 -10 -54 Z" fill="#2B2724" stroke={ink} strokeWidth="6" />
        <path d="M-108 -64 Q-80 -74 -40 -70" fill="none" stroke="#6B645B" strokeWidth="5" />
        {/* sàn để chân */}
        <path d="M-12 30 L74 30 L78 46 L-8 46 Z" fill={dark} stroke={ink} strokeWidth="6" />
        {/* chắn gió + yếm */}
        <path d="M54 34 Q58 -26 78 -84 L106 -92 L102 -44 Q100 4 108 44 L66 46 Z" fill={body} stroke={ink} strokeWidth="7" />
        <path d="M66 -4 Q72 -44 84 -76" fill="none" stroke={light} strokeWidth="7" opacity="0.8" />
        {/* phuộc trước */}
        <path d="M102 -62 L116 56" stroke={ink} strokeWidth="11" />
        <path d="M102 -62 L116 56" stroke="#B9B3A8" strokeWidth="4" />
        {/* tay lái + gương */}
        <path d="M92 -96 L136 -104" stroke={ink} strokeWidth="11" />
        <path d="M134 -104 L146 -106" stroke={ink} strokeWidth="14" />
        <path d="M100 -100 L92 -144" stroke={ink} strokeWidth="5" />
        <ellipse cx="90" cy="-152" rx="15" ry="10" fill="#D8EEF8" stroke={ink} strokeWidth="5" />
        {/* đèn pha */}
        <path d="M104 -92 Q142 -98 148 -70 Q142 -52 110 -56 Z" fill={color.yellow} stroke={ink} strokeWidth="6" />
        <path d="M120 -86 Q134 -84 138 -72" fill="none" stroke={color.white} strokeWidth="5" opacity="0.8" />
        {/* chắn bùn trước */}
        <path d="M70 44 Q114 -4 156 44" fill="none" stroke={ink} strokeWidth="13" />
        <path d="M70 44 Q114 -4 156 44" fill="none" stroke={dark} strokeWidth="6" />
        {/* bánh xe */}
        {[-100, 112].map((cx) => (
          <g key={cx} transform={`translate(${cx} 46) rotate(${spin})`}>
            <circle r="42" fill={ink} />
            <circle r="31" fill="#4A453F" />
            <circle r="24" fill="#D8D2C6" stroke={ink} strokeWidth="4" />
            {[0, 60, 120].map((a) => (
              <line key={a} x1="-24" x2="24" y1="0" y2="0" stroke={ink} strokeWidth="4" transform={`rotate(${a})`} />
            ))}
            <circle r="7" fill={ink} />
          </g>
        ))}
        {rider ? <Rider helmet={helmet} /> : null}
      </g>
    </g>
  );
};

/** Khói xám bay ra sau ống xả. */
export const Smoke: React.FC<{ x: number; y: number; active?: boolean }> = ({ x, y, active = true }) => {
  const frame = useCurrentFrame();
  if (!active) return null;
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => {
        const t = ((frame + i * 8) % 40) / 40;
        return (
          <circle
            key={i}
            cx={x - t * 140}
            cy={y - t * 60 + Math.sin(t * 6 + i) * 6}
            r={12 + t * 34}
            fill="#8E8A84"
            opacity={(1 - t) * 0.55}
            stroke={ink}
            strokeWidth={2}
            strokeOpacity={(1 - t) * 0.6}
          />
        );
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ Phố Hà Nội */

const HOUSE = ["#F2D6A2", "#E9B9A6", "#BFD8C8", "#C9D3EE", "#F0E2A8", "#E8C7D6"];

const Tree: React.FC<{ x: number; y: number; s?: number; sway?: number }> = ({ x, y, s = 1, sway = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-7" y="-60" width="14" height="60" fill="#7A5B3A" stroke={ink} strokeWidth="4" />
    <g transform={`rotate(${sway} 0 -60)`}>
      <circle cx="0" cy="-92" r="46" fill="#4FA66B" stroke={ink} strokeWidth="5" />
      <circle cx="-30" cy="-72" r="30" fill="#5FB77A" stroke={ink} strokeWidth="5" />
      <circle cx="30" cy="-74" r="30" fill="#3F9A5E" stroke={ink} strokeWidth="5" />
    </g>
  </g>
);

/** Dãy nhà ống, dây điện, cây xanh và mặt đường chạy vạch. `baseY` là mép trên mặt đường. */
export const Street: React.FC<{ baseY: number; roadH?: number; seed?: number; speed?: number }> = ({
  baseY,
  roadH = 210,
  seed = 3,
  speed = 14,
}) => {
  const frame = useCurrentFrame();
  const houses: React.ReactNode[] = [];
  let x = -30;
  let i = 0;
  while (x < 1100) {
    const w = 96 + Math.floor(random(`w${seed}-${i}`) * 50);
    const h = 230 + Math.floor(random(`h${seed}-${i}`) * 170);
    const c = HOUSE[Math.floor(random(`c${seed}-${i}`) * HOUSE.length)];
    const floors = Math.floor((h - 50) / 70);
    houses.push(
      <g key={i} transform={`translate(${x} ${baseY - h})`}>
        <path d={`M0 ${h} L0 14 L${w / 2} 0 L${w} 14 L${w} ${h} Z`} fill={c} stroke={ink} strokeWidth="5" />
        {Array.from({ length: floors }, (_, f) => (
          <g key={f} transform={`translate(0 ${30 + f * 70})`}>
            <rect x={w * 0.18} y="0" width={w * 0.64} height="40" rx="4" fill="#CFE6F2" stroke={ink} strokeWidth="4" />
            <line x1={w / 2} x2={w / 2} y1="0" y2="40" stroke={ink} strokeWidth="3" />
            <line x1={w * 0.12} x2={w * 0.88} y1="48" y2="48" stroke={ink} strokeWidth="4" />
          </g>
        ))}
        {i % 3 === 0 ? (
          <g transform={`translate(${w * 0.12} ${h - 78})`}>
            <rect width={w * 0.76} height="26" rx="4" fill={color.red} stroke={ink} strokeWidth="4" />
          </g>
        ) : null}
        <rect x={w * 0.2} y={h - 46} width={w * 0.6} height="46" fill="#5B554C" stroke={ink} strokeWidth="4" />
      </g>,
    );
    x += w + 6;
    i++;
  }
  const sway = Math.sin(frame / 22) * 1.6;
  const dash = (frame * speed) % 120;
  return (
    <g>
      {houses}
      <Tree x={70} y={baseY} s={0.9} sway={sway} />
      <Tree x={960} y={baseY} s={1.05} sway={-sway} />
      {/* cột điện + dây */}
      <g stroke={ink} strokeWidth="5" fill="none" {...SW}>
        <path d={`M300 ${baseY} L300 ${baseY - 330}`} strokeWidth="10" />
        <path d={`M262 ${baseY - 316} L338 ${baseY - 316}`} strokeWidth="7" />
        <path d={`M-20 ${baseY - 290} Q140 ${baseY - 250} 262 ${baseY - 314}`} />
        <path d={`M338 ${baseY - 314} Q560 ${baseY - 240} 780 ${baseY - 300}`} />
        <path d={`M338 ${baseY - 306} Q560 ${baseY - 232} 780 ${baseY - 292}`} />
        <path d={`M780 ${baseY - 300} Q930 ${baseY - 270} 1100 ${baseY - 310}`} />
      </g>
      {/* vỉa hè + đường */}
      <rect x="-20" y={baseY - 8} width="1120" height="26" fill="#CFC6B2" stroke={ink} strokeWidth="5" />
      <rect x="-20" y={baseY + 18} width="1120" height={roadH} fill="#6A645B" stroke={ink} strokeWidth="5" />
      {Array.from({ length: 12 }, (_, k) => (
        <rect key={k} x={-120 + k * 120 + dash} y={baseY + 18 + roadH * 0.52} width="64" height="10" rx="4" fill="#F4ECD6" />
      ))}
    </g>
  );
};

/** Dòng xe nền chạy ngang đường (phông phía sau nhân vật chính). */
export const Traffic: React.FC<{ y: number; count?: number; speed?: number; scale?: number; fromRight?: boolean }> = ({
  y,
  count = 3,
  speed = 7,
  scale = 0.42,
  fromRight = false,
}) => {
  const frame = useCurrentFrame();
  const tints = [color.blue, color.yellow, "#8E6BBF", color.red, "#3AA6A0"];
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const span = 1500;
        const off = (i * (span / count) + frame * speed * (0.8 + random(`tr${i}`) * 0.5)) % span;
        const px = fromRight ? 1250 - off : -170 + off;
        return (
          <Scooter
            key={i}
            kind="petrol"
            x={px}
            y={y}
            scale={scale}
            moving
            rider
            flip={fromRight}
            tint={tints[i % tints.length]}
            helmet={tints[(i + 2) % tints.length]}
          />
        );
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ Trụ xăng, trụ sạc */

export const GasPump: React.FC<{ x: number; y: number; scale?: number; price?: string; active?: boolean }> = ({
  x,
  y,
  scale = 1,
  price = "23.231",
  active = true,
}) => {
  const frame = useCurrentFrame();
  const flick = active && Math.floor(frame / 8) % 2 === 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} filter="url(#boil)" {...SW}>
      <rect x="-52" y="-210" width="104" height="210" rx="14" fill={color.red} stroke={ink} strokeWidth="7" />
      <rect x="-64" y="-8" width="128" height="18" rx="6" fill="#5B554C" stroke={ink} strokeWidth="6" />
      <rect x="-38" y="-190" width="76" height="52" rx="8" fill="#1F3A2E" stroke={ink} strokeWidth="5" />
      <text x="0" y="-152" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="30" fill={flick ? "#7CFFB0" : "#4FD88B"}>
        {price}
      </text>
      <rect x="-38" y="-126" width="76" height="14" rx="6" fill={color.yellow} stroke={ink} strokeWidth="4" />
      <circle cx="0" cy="-70" r="22" fill={color.white} stroke={ink} strokeWidth="5" />
      <path d="M0 -86 Q-12 -66 0 -56 Q12 -66 0 -86 Z" fill={color.red} stroke={ink} strokeWidth="3" />
      {/* vòi bơm + dây */}
      <path d="M52 -80 Q96 -60 84 -10 L84 20" fill="none" stroke={ink} strokeWidth="9" />
      <path d="M78 18 L108 18 L108 34 L90 34 Z" fill="#5B554C" stroke={ink} strokeWidth="5" />
    </g>
  );
};

export const Charger: React.FC<{ x: number; y: number; scale?: number; level?: number }> = ({ x, y, scale = 1, level = 0.7 }) => {
  const frame = useCurrentFrame();
  const glow = 0.5 + Math.sin(frame / 5) * 0.2;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} filter="url(#boil)" {...SW}>
      <rect x="-48" y="-210" width="96" height="210" rx="16" fill={color.green} stroke={ink} strokeWidth="7" />
      <rect x="-60" y="-8" width="120" height="18" rx="6" fill="#5B554C" stroke={ink} strokeWidth="6" />
      <rect x="-34" y="-190" width="68" height="64" rx="8" fill="#13312A" stroke={ink} strokeWidth="5" />
      {/* pin đang sạc */}
      <rect x="-24" y="-172" width="44" height="26" rx="5" fill="none" stroke="#7CFFB0" strokeWidth="4" />
      <rect x="20" y="-165" width="5" height="12" fill="#7CFFB0" />
      <rect x="-20" y="-168" width={36 * level} height="18" rx="3" fill="#7CFFB0" opacity={glow + 0.3} />
      <path d="M6 -118 L-12 -90 L0 -90 L-6 -62 L16 -98 L4 -98 Z" fill={color.yellow} stroke={ink} strokeWidth="4" />
      <circle cx="0" cy="-30" r="12" fill={color.white} stroke={ink} strokeWidth="4" />
      {/* dây sạc + đầu cắm */}
      <path d="M48 -90 Q104 -70 90 -10 L90 22" fill="none" stroke={ink} strokeWidth="9" />
      <rect x="76" y="18" width="28" height="22" rx="6" fill={color.yellow} stroke={ink} strokeWidth="5" />
    </g>
  );
};

/* ------------------------------------------------------------------ Biểu tượng nhỏ */

export type IconName = "coin" | "leaf" | "bolt" | "house" | "scooter" | "pin" | "calendar" | "clock" | "star" | "ban";

/** Chọn biểu tượng theo nội dung câu chữ. */
export const iconFor = (text: string): IconName => {
  const t = text.toLowerCase();
  if (/sạc|pin|điện năng/.test(t)) return "bolt";
  if (/chung cư|nhà trọ|nhà /.test(t)) return "house";
  if (/giờ|nửa đêm|\d+h/.test(t)) return "clock";
  if (/rẻ|tiền|triệu|giá|đ\b|ép giá|bán/.test(t)) return "coin";
  if (/êm|khói|sạch|xanh|phát thải/.test(t)) return "leaf";
  if (/vành đai|hoàn kiếm|phường|nội thành/.test(t)) return "pin";
  if (/xe/.test(t)) return "scooter";
  return "star";
};

export const Icon: React.FC<{ name: IconName; size?: number; fg?: string }> = ({ name, size = 48, fg = ink }) => {
  const p = { fill: "none", stroke: fg, strokeWidth: 5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ flex: "none" }}>
      {name === "coin" && (
        <g>
          <circle cx="24" cy="24" r="17" {...p} fill={color.yellow} />
          <path d="M24 13 V35 M18 19 Q24 14 30 19 Q24 24 18 28 Q24 34 30 29" {...p} strokeWidth={4} />
        </g>
      )}
      {name === "leaf" && (
        <g>
          <path d="M10 36 Q8 12 36 10 Q38 34 14 38 Z" {...p} fill="#7ED6A0" />
          <path d="M12 36 L28 20" {...p} strokeWidth={4} />
        </g>
      )}
      {name === "bolt" && <path d="M27 5 L11 27 H22 L19 43 L37 19 H26 Z" {...p} fill={color.yellow} />}
      {name === "house" && (
        <g>
          <path d="M7 24 L24 8 L41 24 V40 H7 Z" {...p} fill="#F2D6A2" />
          <rect x="19" y="26" width="10" height="14" {...p} strokeWidth={4} />
        </g>
      )}
      {name === "scooter" && (
        <g>
          <circle cx="12" cy="34" r="6" {...p} />
          <circle cx="37" cy="34" r="6" {...p} />
          <path d="M12 34 H24 L30 20 H36 L37 34 M30 20 L28 12 H34" {...p} />
        </g>
      )}
      {name === "pin" && (
        <g>
          <path d="M24 43 Q10 28 10 20 A14 14 0 0 1 38 20 Q38 28 24 43 Z" {...p} fill={color.red} />
          <circle cx="24" cy="20" r="5" {...p} fill={color.white} strokeWidth={4} />
        </g>
      )}
      {name === "calendar" && (
        <g>
          <rect x="7" y="11" width="34" height="30" rx="5" {...p} fill={color.white} />
          <path d="M7 21 H41 M16 6 V14 M32 6 V14" {...p} />
        </g>
      )}
      {name === "clock" && (
        <g>
          <circle cx="24" cy="24" r="17" {...p} fill={color.white} />
          <path d="M24 13 V25 L32 30" {...p} />
        </g>
      )}
      {name === "star" && <path d="M24 6 L29 18 L42 19 L32 28 L35 41 L24 34 L13 41 L16 28 L6 19 L19 18 Z" {...p} fill={color.yellow} />}
      {name === "ban" && (
        <g>
          <circle cx="24" cy="24" r="17" {...p} stroke={color.red} strokeWidth={6} />
          <path d="M12 36 L36 12" {...p} stroke={color.red} strokeWidth={6} />
        </g>
      )}
    </svg>
  );
};
