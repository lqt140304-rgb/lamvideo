import React from "react";
import { random, useCurrentFrame } from "remotion";
import { color, font } from "../brand";
import { staticFile } from "remotion";
import PROPS from "../props.json";

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

type PropPhoto = { file: string; w: number; h: number };
const photoOf = (kind: "petrol" | "electric"): PropPhoto | undefined =>
  (PROPS as Record<string, PropPhoto | undefined>)[kind === "electric" ? "xeDien" : "xeXang"];
/** Đã có ảnh xe tạo sẵn (public/props/xe-xang.png, xe-dien.png) chưa. */
export const HAS_VEHICLE_PHOTOS = !!photoOf("petrol") && !!photoOf("electric");

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
  const photo = photoOf(kind);
  if (photo && !rider) {
    // ảnh xe thật (tạo bằng AI, đã tách nền): đứng trên cùng đường mặt đất với hình vẽ
    const W = 372;
    const H = (W * photo.h) / photo.w;
    const bob = moving ? Math.sin(frame * 1.7) * 1.6 : 0;
    const tilt = moving ? Math.sin(frame * 0.9) * 0.5 : 0;
    return (
      <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
        <ellipse cx="0" cy="88" rx="170" ry="10" fill="rgba(29,27,25,0.16)" />
        {kind === "petrol" ? <Smoke x={-176} y={48} active={moving} /> : null}
        <path d="M150 -30 L290 -70 L290 40 Z" fill={color.yellow} opacity={beam * 0.8} />
        <g transform={`translate(0 ${bob}) rotate(${tilt} 0 88)`}>
          <image href={staticFile(photo.file)} x={-W / 2} y={90 - H} width={W} height={H} />
        </g>
      </g>
    );
  }
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
            rider={!HAS_VEHICLE_PHOTOS}
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

/* ------------------------------------------------------------------ Hình lớn dùng chung cho nhiều đề tài */

export type ArtName =
  | "phone" | "house" | "money" | "doc" | "gold" | "shield" | "bank"
  | "idcard" | "lockphone" | "rentsign" | "piggy" | "ring" | "taxform" | "ship" | "medcard" | "chart";

/** Hình vẽ lớn (khoảng 400×400, gốc ở giữa). `t` là thời gian hoạt họa theo khung hình. */
export const BigArt: React.FC<{ name: ArtName; x: number; y: number; scale?: number; tint?: string }> = ({
  name,
  x,
  y,
  scale = 1,
  tint,
}) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 9) * 4;
  const A = tint ?? color.yellow;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${scale})`} filter="url(#boil)" {...SW}>
      <ellipse cx="0" cy="206" rx="150" ry="14" fill="rgba(29,27,25,0.14)" />
      {name === "phone" && (
        <g>
          <rect x="-96" y="-190" width="192" height="388" rx="30" fill="#2B2724" stroke={ink} strokeWidth="9" />
          <rect x="-80" y="-168" width="160" height="344" rx="16" fill="#DCEFFB" />
          <rect x="-24" y="-182" width="48" height="10" rx="5" fill="#4A453F" />
          {/* thẻ SIM */}
          <g transform="translate(0 -88)">
            <path d="M-46 -34 L22 -34 L46 -10 L46 42 L-46 42 Z" fill={A} stroke={ink} strokeWidth="6" />
            <rect x="-24" y="-8" width="48" height="36" rx="5" fill="#E8B923" stroke={ink} strokeWidth="4" />
            <path d="M-24 6 H24 M-24 14 H24 M0 -8 V28" stroke={ink} strokeWidth="3" />
          </g>
          {/* khung quét khuôn mặt */}
          <g transform="translate(0 52)">
            <circle r="48" fill={color.white} stroke={ink} strokeWidth="6" />
            <circle cx="-16" cy="-8" r="5" fill={ink} />
            <circle cx="16" cy="-8" r="5" fill={ink} />
            <path d="M-16 16 Q0 30 16 16" fill="none" stroke={ink} strokeWidth="5" />
            {[[-62, -62, 1, 1], [62, -62, -1, 1], [-62, 62, 1, -1], [62, 62, -1, -1]].map(([cx, cy, sx, sy], k) => (
              <path key={k} d={`M${cx} ${cy + sy * -18} V${cy} H${cx + sx * 18}`} fill="none" stroke={color.green} strokeWidth="7" transform={`translate(${-sx * 0} 0)`} />
            ))}
            <rect x="-60" y={-52 + ((frame * 3) % 104)} width="120" height="6" rx="3" fill={color.green} opacity="0.8" />
          </g>
        </g>
      )}
      {name === "house" && (
        <g>
          <path d="M-170 -10 L0 -170 L170 -10 Z" fill={color.red} stroke={ink} strokeWidth="9" />
          <rect x="-132" y="-10" width="264" height="206" fill="#F2D6A2" stroke={ink} strokeWidth="9" />
          <rect x="-104" y="50" width="76" height="146" rx="6" fill="#7A5B3A" stroke={ink} strokeWidth="7" />
          <circle cx="-44" cy="124" r="7" fill={A} stroke={ink} strokeWidth="3" />
          <rect x="22" y="22" width="86" height="76" rx="6" fill="#CFE6F2" stroke={ink} strokeWidth="7" />
          <path d="M65 22 V98 M22 60 H108" stroke={ink} strokeWidth="5" />
          <rect x="-46" y="-96" width="48" height="48" rx="6" fill="#CFE6F2" stroke={ink} strokeWidth="6" />
          <rect x="70" y="-130" width="30" height="60" fill="#E9B9A6" stroke={ink} strokeWidth="6" />
          {/* chìa khóa */}
          <g transform="translate(120 150) rotate(-20)">
            <circle r="22" fill={A} stroke={ink} strokeWidth="6" />
            <circle r="8" fill="#F2D6A2" stroke={ink} strokeWidth="4" />
            <path d="M20 0 H78 M60 0 V18 M74 0 V14" stroke={ink} strokeWidth="9" />
          </g>
        </g>
      )}
      {name === "money" && (
        <g>
          {[0, 1, 2].map((k) => (
            <g key={k} transform={`translate(${-20 + k * 12} ${-90 + k * 62}) rotate(${-6 + k * 5})`}>
              <rect x="-150" y="-46" width="300" height="104" rx="12" fill={k === 1 ? "#BFE3C7" : "#A7D8B5"} stroke={ink} strokeWidth="7" />
              <circle r="30" fill="#E8F5EA" stroke={ink} strokeWidth="5" />
              <text x="0" y="12" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="34" fill={ink}>đ</text>
              <circle cx="-114" cy="0" r="10" fill="none" stroke={ink} strokeWidth="4" />
              <circle cx="114" cy="0" r="10" fill="none" stroke={ink} strokeWidth="4" />
            </g>
          ))}
          <g transform="translate(120 140)">
            <ellipse cx="0" cy="22" rx="52" ry="16" fill="#D9A21B" stroke={ink} strokeWidth="6" />
            <ellipse cx="0" cy="4" rx="52" ry="16" fill={A} stroke={ink} strokeWidth="6" />
            <ellipse cx="0" cy="-14" rx="52" ry="16" fill="#FFD76A" stroke={ink} strokeWidth="6" />
          </g>
        </g>
      )}
      {name === "doc" && (
        <g>
          <path d="M-120 -190 H60 L130 -120 V196 H-120 Z" fill={color.white} stroke={ink} strokeWidth="9" />
          <path d="M60 -190 V-120 H130" fill="#E9DFC8" stroke={ink} strokeWidth="8" />
          {[-96, -52, -8, 36].map((yy, k) => (
            <path key={k} d={`M-84 ${yy} H${k % 2 ? 70 : 96}`} stroke="#8E8A84" strokeWidth="9" />
          ))}
          <g transform="translate(40 120) rotate(-14)">
            <circle r="58" fill="none" stroke={color.red} strokeWidth="10" />
            <text x="0" y="14" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="40" fill={color.red}>
              ĐÃ DUYỆT
            </text>
          </g>
        </g>
      )}
      {name === "gold" && (
        <g>
          {[[-80, 90], [80, 90], [0, 0]].map(([gx, gy], k) => (
            <g key={k} transform={`translate(${gx} ${gy})`}>
              <path d="M-84 40 L-60 -40 H60 L84 40 Z" fill={k === 2 ? "#FFE08A" : A} stroke={ink} strokeWidth="8" />
              <path d="M-52 -30 H52" stroke={color.white} strokeWidth="7" opacity="0.7" />
              <rect x="-84" y="40" width="168" height="20" rx="4" fill="#C98F0F" stroke={ink} strokeWidth="7" />
            </g>
          ))}
          <path d="M-150 -150 L-130 -120 M150 -140 L128 -112 M0 -190 V-156" stroke={A} strokeWidth="9" />
        </g>
      )}
      {name === "shield" && (
        <g>
          <path d="M0 -190 L140 -140 V10 Q140 120 0 196 Q-140 120 -140 10 V-140 Z" fill={color.blue} stroke={ink} strokeWidth="10" />
          <path d="M0 -150 L108 -112 V10 Q108 98 0 158 Z" fill="#6FA3F0" />
          <path d="M-62 4 L-14 54 L66 -42" fill="none" stroke={color.white} strokeWidth="24" />
        </g>
      )}
      {name === "bank" && (
        <g>
          <path d="M-170 -60 L0 -170 L170 -60 Z" fill="#E9DFC8" stroke={ink} strokeWidth="9" />
          <circle cx="0" cy="-92" r="22" fill={A} stroke={ink} strokeWidth="6" />
          <text x="0" y="-83" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="26" fill={ink}>%</text>
          {[-110, -36, 36, 110].map((cx) => (
            <rect key={cx} x={cx - 18} y="-46" width="36" height="170" fill="#F4ECD6" stroke={ink} strokeWidth="7" />
          ))}
          <rect x="-170" y="124" width="340" height="30" fill="#E9DFC8" stroke={ink} strokeWidth="8" />
          <rect x="-188" y="154" width="376" height="34" fill="#CFC6B2" stroke={ink} strokeWidth="8" />
        </g>
      )}

      {name === "idcard" && (
        <g transform="rotate(-6)">
          <rect x="-180" y="-118" width="360" height="236" rx="22" fill="#E3EEF9" stroke={ink} strokeWidth="9" />
          <rect x="-180" y="-118" width="360" height="46" rx="22" fill={color.red} stroke={ink} strokeWidth="9" />
          <circle cx="-150" cy="-95" r="11" fill={A} stroke={ink} strokeWidth="4" />
          <path d="M-120 -95 H60" stroke={color.white} strokeWidth="9" />
          {/* ảnh chân dung */}
          <rect x="-156" y="-50" width="96" height="120" rx="10" fill="#CFE0F0" stroke={ink} strokeWidth="6" />
          <circle cx="-108" cy="-12" r="22" fill="#F1C9A5" stroke={ink} strokeWidth="5" />
          <path d="M-140 60 Q-108 18 -76 60" fill={color.blue} stroke={ink} strokeWidth="5" />
          {/* chip */}
          <rect x="-40" y="-40" width="64" height="50" rx="8" fill="#E8B923" stroke={ink} strokeWidth="5" />
          <path d="M-40 -15 H24 M-8 -40 V10 M-40 -28 H-20 M4 -28 H24 M-40 -2 H-20 M4 -2 H24" stroke={ink} strokeWidth="3" />
          {[24, 48, 72].map((yy, k) => (
            <path key={k} d={`M-40 ${yy} H${k === 2 ? 40 : 70}`} stroke="#8E8A84" strokeWidth="8" />
          ))}
          {/* mã QR */}
          <g transform="translate(118 10)">
            <rect x="-46" y="-46" width="92" height="92" rx="6" fill={color.white} stroke={ink} strokeWidth="5" />
            {[0, 1, 2, 3, 4, 5].flatMap((i) => [0, 1, 2, 3, 4, 5].map((j) => ((i * 7 + j * 5 + i * j) % 3 === 0 ? (
              <rect key={`${i}-${j}`} x={-36 + i * 12} y={-36 + j * 12} width="11" height="11" fill={ink} />
            ) : null)))}
            <rect x="-56" y={-50 + ((frame * 2.5) % 100)} width="112" height="5" rx="2" fill={color.green} opacity="0.85" />
          </g>
        </g>
      )}
      {name === "lockphone" && (
        <g>
          <rect x="-96" y="-190" width="192" height="388" rx="30" fill="#2B2724" stroke={ink} strokeWidth="9" />
          <rect x="-80" y="-168" width="160" height="344" rx="16" fill="#FBE3DE" />
          <text x="0" y="-128" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="28" fill={color.red}>KHÔNG</text>
          <text x="0" y="-98" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="28" fill={color.red}>GỌI ĐƯỢC</text>
          {/* tay nghe gạch chéo */}
          <g transform="translate(0 -40) rotate(-30)">
            <path d="M-46 -10 Q-46 -30 -26 -30 L-14 -30 L-6 -6 L-20 4 Q-8 26 14 34 L26 22 L46 30 L46 44 Q46 60 26 60 Q-46 50 -46 -10 Z" fill="#9C958C" stroke={ink} strokeWidth="5" />
          </g>
          <path d="M-56 -90 L56 10" stroke={color.red} strokeWidth="12" />
          {/* ổ khóa */}
          <g transform={`translate(0 ${96 + Math.sin(frame / 5) * 3}) rotate(${Math.sin(frame / 4) * 5})`}>
            <path d="M-34 -10 V-40 Q-34 -76 0 -76 Q34 -76 34 -40 V-10" fill="none" stroke={ink} strokeWidth="14" />
            <path d="M-34 -10 V-40 Q-34 -76 0 -76 Q34 -76 34 -40 V-10" fill="none" stroke="#B9B2A8" strokeWidth="6" />
            <rect x="-56" y="-14" width="112" height="86" rx="14" fill={A} stroke={ink} strokeWidth="7" />
            <circle cy="18" r="11" fill={ink} />
            <rect x="-4" y="22" width="8" height="26" fill={ink} />
          </g>
        </g>
      )}
      {name === "rentsign" && (
        <g>
          {/* cửa sổ dãy trọ */}
          <rect x="-170" y="-150" width="340" height="300" rx="10" fill="#F2D6A2" stroke={ink} strokeWidth="9" />
          {[-110, 0, 110].map((cx) => (
            <g key={cx}>
              <rect x={cx - 38} y="-120" width="76" height="90" rx="6" fill="#CFE6F2" stroke={ink} strokeWidth="6" />
              <path d={`M${cx} -120 V-30`} stroke={ink} strokeWidth="4" />
            </g>
          ))}
          <rect x="-40" y="40" width="80" height="110" rx="6" fill="#7A5B3A" stroke={ink} strokeWidth="7" />
          {/* biển treo đung đưa */}
          <g transform={`translate(0 -10) rotate(${Math.sin(frame / 10) * 6})`}>
            <path d="M-60 -4 L0 -50 L60 -4" fill="none" stroke={ink} strokeWidth="5" />
            <circle cy="-50" r="7" fill={ink} />
            <rect x="-120" y="-4" width="240" height="80" rx="10" fill={color.white} stroke={ink} strokeWidth="8" />
            <text x="0" y="50" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="46" fill={color.red}>CHO THUÊ</text>
          </g>
          {/* tiền thuê bay lên */}
          {[0, 1].map((k) => {
            const tt = ((frame + k * 30) % 60) / 60;
            return (
              <g key={k} transform={`translate(${130 + k * 30} ${150 - tt * 120}) rotate(${-10 + k * 20})`} opacity={1 - tt}>
                <rect x="-34" y="-18" width="68" height="36" rx="6" fill="#A7D8B5" stroke={ink} strokeWidth="4" />
                <text x="0" y="9" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="22" fill={ink}>đ</text>
              </g>
            );
          })}
        </g>
      )}
      {name === "piggy" && (
        <g>
          {/* đồng xu rơi vào khe */}
          {(() => {
            const tt = (frame % 45) / 45;
            return (
              <g transform={`translate(10 ${-200 + tt * 110})`} opacity={tt < 0.85 ? 1 : 0}>
                <ellipse rx="30" ry="30" fill={A} stroke={ink} strokeWidth="6" />
                <text x="0" y="11" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="30" fill={ink}>đ</text>
              </g>
            );
          })()}
          <ellipse cx="0" cy="40" rx="170" ry="130" fill="#F7A8B8" stroke={ink} strokeWidth="9" />
          <path d="M-20 -86 H40" stroke={ink} strokeWidth="10" />
          <ellipse cx="-168" cy="40" rx="34" ry="40" fill="#F48CA2" stroke={ink} strokeWidth="7" />
          <circle cx="-176" cy="30" r="6" fill={ink} />
          <circle cx="-176" cy="52" r="6" fill={ink} />
          <circle cx="-100" cy="-10" r="10" fill={ink} />
          <path d="M-90 -86 L-60 -130 L-40 -80" fill="#F48CA2" stroke={ink} strokeWidth="7" />
          <path d="M60 -88 L90 -128 L110 -78" fill="#F48CA2" stroke={ink} strokeWidth="7" />
          {[-90, -20, 60, 120].map((lx) => (
            <rect key={lx} x={lx - 18} y="150" width="36" height="50" rx="8" fill="#F48CA2" stroke={ink} strokeWidth="7" />
          ))}
          <path d="M168 30 Q200 10 190 50 Q182 80 210 70" fill="none" stroke={ink} strokeWidth="7" />
          <text x="40" y="80" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="56" fill={color.white} stroke={ink} strokeWidth="2">%</text>
        </g>
      )}
      {name === "ring" && (
        <g>
          <g transform={`rotate(${Math.sin(frame / 14) * 8})`}>
            <ellipse cx="0" cy="40" rx="150" ry="120" fill="none" stroke={ink} strokeWidth="58" />
            <ellipse cx="0" cy="40" rx="150" ry="120" fill="none" stroke={A} strokeWidth="44" />
            <ellipse cx="0" cy="40" rx="150" ry="120" fill="none" stroke="#FFE9A8" strokeWidth="10" strokeDasharray="60 380" strokeDashoffset={-frame * 6} />
            <text x="0" y="-60" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="34" fill={ink}>9999</text>
          </g>
          {[[-150, -130], [160, -110], [130, 180]].map(([sx, sy], k) => {
            const sc = 0.6 + 0.4 * Math.abs(Math.sin((frame + k * 12) / 10));
            return <path key={k} transform={`translate(${sx} ${sy}) scale(${sc})`} d="M0 -26 L7 -7 L26 0 L7 7 L0 26 L-7 7 L-26 0 L-7 -7 Z" fill={color.white} stroke={ink} strokeWidth="4" />;
          })}
        </g>
      )}
      {name === "taxform" && (
        <g>
          <g transform="rotate(-4)">
            <rect x="-150" y="-190" width="260" height="360" rx="10" fill={color.white} stroke={ink} strokeWidth="9" />
            <text x="-20" y="-140" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="36" fill={ink}>TỜ KHAI</text>
            {[-96, -52, -8, 36, 80].map((yy, k) => (
              <g key={k}>
                <rect x="-124" y={yy - 14} width="26" height="26" rx="4" fill={k < Math.min(5, Math.floor(frame / 12) % 7) ? "#BFE3C7" : color.white} stroke={ink} strokeWidth="4" />
                {k < Math.min(5, Math.floor(frame / 12) % 7) && <path d={`M-120 ${yy} l8 8 l14 -16`} fill="none" stroke={color.green} strokeWidth="5" />}
                <path d={`M-84 ${yy} H${k % 2 ? 50 : 80}`} stroke="#8E8A84" strokeWidth="8" />
              </g>
            ))}
          </g>
          {/* máy tính */}
          <g transform="translate(110 90) rotate(8)">
            <rect x="-70" y="-100" width="140" height="190" rx="16" fill="#3E4A5C" stroke={ink} strokeWidth="8" />
            <rect x="-52" y="-82" width="104" height="40" rx="6" fill="#CFE8C9" stroke={ink} strokeWidth="4" />
            <text x="44" y="-52" textAnchor="end" fontFamily={font.display} fontWeight={900} fontSize="26" fill={ink}>{Math.floor(frame / 4) % 2 ? "5%" : "10%"}</text>
            {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => (
              <rect key={`${r}${c}`} x={-50 + c * 36} y={-26 + r * 36} width="28" height="28" rx="5" fill={r === 2 && c === 2 ? A : "#E9DFC8"} stroke={ink} strokeWidth="3" />
            )))}
          </g>
        </g>
      )}
      {name === "ship" && (
        <g>
          {/* sóng */}
          <path d={`M-220 ${150} ${Array.from({ length: 9 }, (_, k) => `q 25 ${k % 2 ? 16 : -16} 50 0`).join(" ")}`} transform={`translate(${-(frame * 2) % 100} 0)`} fill="none" stroke={color.blue} strokeWidth="9" />
          <g transform={`rotate(${Math.sin(frame / 12) * 2})`}>
            <path d="M-200 60 H200 L160 140 H-170 Z" fill="#3E4A5C" stroke={ink} strokeWidth="9" />
            <path d="M-190 80 H190" stroke={color.red} strokeWidth="9" />
            {[[-150, 0, color.red], [-80, 0, color.blue], [-10, 0, A], [60, 0, color.green], [-115, -60, A], [-45, -60, color.red], [25, -60, color.blue]].map(([cx, cy, c], k) => (
              <g key={k}>
                <rect x={cx as number} y={(cy as number) - 0} width="68" height="58" fill={c as string} stroke={ink} strokeWidth="6" />
                <path d={`M${(cx as number) + 17} ${cy} V${(cy as number) + 58} M${(cx as number) + 34} ${cy} V${(cy as number) + 58} M${(cx as number) + 51} ${cy} V${(cy as number) + 58}`} stroke={ink} strokeWidth="3" opacity="0.5" />
              </g>
            ))}
            <rect x="130" y="-70" width="56" height="130" fill={color.white} stroke={ink} strokeWidth="7" />
            <rect x="140" y="-56" width="36" height="18" fill="#CFE6F2" stroke={ink} strokeWidth="4" />
          </g>
          {/* nhãn thuế */}
          <g transform={`translate(-60 -170) rotate(${-8 + Math.sin(frame / 8) * 4})`}>
            <rect x="-100" y="-40" width="200" height="80" rx="14" fill={color.white} stroke={ink} strokeWidth="8" />
            <text x="0" y="16" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="46" fill={color.red}>THUẾ</text>
            <circle cx="100" cy="0" r="10" fill={ink} />
          </g>
        </g>
      )}
      {name === "medcard" && (
        <g>
          <g transform="rotate(5)">
            <rect x="-180" y="-110" width="360" height="230" rx="22" fill="#E5F4EC" stroke={ink} strokeWidth="9" />
            <rect x="-180" y="-110" width="360" height="54" rx="22" fill={color.green} stroke={ink} strokeWidth="9" />
            <text x="0" y="-70" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="30" fill={color.white}>BẢO HIỂM</text>
            {[-20, 20, 60].map((yy, k) => (
              <path key={k} d={`M-150 ${yy} H${k === 1 ? 10 : 50}`} stroke="#8E8A84" strokeWidth="9" />
            ))}
          </g>
          {/* dấu cộng y tế đập nhịp */}
          {(() => {
            const sc = 1 + 0.08 * Math.max(0, Math.sin(frame / 5));
            return (
              <g transform={`translate(110 30) scale(${sc})`}>
                <circle r="62" fill={color.white} stroke={ink} strokeWidth="7" />
                <path d="M-16 -44 H16 V-16 H44 V16 H16 V44 H-16 V16 H-44 V-16 H-16 Z" fill={color.red} stroke={ink} strokeWidth="5" />
              </g>
            );
          })()}
          {/* đường nhịp tim */}
          <path d="M-200 170 H-80 L-60 130 L-40 200 L-20 150 L0 170 H200" fill="none" stroke={color.red} strokeWidth="7" strokeDasharray="600" strokeDashoffset={600 - ((frame * 12) % 600)} />
        </g>
      )}
      {name === "chart" && (
        <g>
          <path d="M-180 180 H190 M-180 180 V-180" stroke={ink} strokeWidth="9" />
          {[60, 100, 150, 120, 190].map((h, k) => {
            const grow = Math.min(1, Math.max(0, (frame - k * 6) / 20));
            return <rect key={k} x={-150 + k * 66} y={180 - h * grow * 1.6} width="46" height={h * grow * 1.6} rx="6" fill={k === 4 ? A : "#BFD7F5"} stroke={ink} strokeWidth="6" />;
          })}
          <path d="M-130 70 L-60 20 L10 -40 L80 -10 L150 -130" fill="none" stroke={color.green} strokeWidth="10" strokeDasharray="420" strokeDashoffset={Math.max(0, 420 - frame * 10)} />
          <path d="M150 -130 l-34 4 m34 -4 l-6 34" stroke={color.green} strokeWidth="10" />
          <g transform="translate(-100 -130)">
            <circle r="44" fill={A} stroke={ink} strokeWidth="7" />
            <text x="0" y="16" textAnchor="middle" fontFamily={font.display} fontWeight={900} fontSize="44" fill={ink}>%</text>
          </g>
        </g>
      )}
    </g>
  );
};
