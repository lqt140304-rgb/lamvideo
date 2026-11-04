import React from "react";
import { useCurrentFrame } from "remotion";
import { color, font } from "../brand";

const ink = color.ink;

/** Xe tay ga vẽ tay. Xe xăng có ống xả nhả khói, xe điện có tia sét. */
export const Scooter: React.FC<{
  kind: "petrol" | "electric";
  x: number;
  y: number;
  scale?: number;
  moving?: boolean;
}> = ({ kind, x, y, scale = 1, moving = false }) => {
  const frame = useCurrentFrame();
  const body = kind === "electric" ? color.green : color.red;
  const shake = moving ? Math.sin(frame * 1.7) * 1.5 : 0;
  const spin = moving ? frame * 18 : 0;
  return (
    <g transform={`translate(${x} ${y + shake}) scale(${scale})`} filter="url(#boil)" strokeLinejoin="round" strokeLinecap="round">
      {kind === "petrol" ? <Smoke x={-150} y={20} active={moving} /> : null}
      {/* thân xe */}
      <path
        d="M-130 10 Q-140 -40 -90 -50 L10 -50 Q30 -50 40 -30 L70 20 L-130 20 Z"
        fill={body}
        stroke={ink}
        strokeWidth="8"
      />
      {/* yên */}
      <path d="M-110 -52 Q-100 -78 -40 -76 Q-10 -76 -6 -52 Z" fill={ink} />
      {/* cổ xe + tay lái */}
      <path d="M60 10 L100 -110" stroke={ink} strokeWidth="10" />
      <path d="M80 -112 L130 -118" stroke={ink} strokeWidth="10" />
      <path d="M70 -20 Q120 -40 120 20 L80 24 Z" fill={body} stroke={ink} strokeWidth="8" />
      {kind === "petrol" ? <path d="M-150 18 L-110 18" stroke={ink} strokeWidth="10" /> : null}
      {kind === "electric" ? (
        <path d="M-58 -40 L-80 -6 L-60 -6 L-74 18 L-36 -18 L-56 -18 L-40 -40 Z" fill={color.yellow} stroke={ink} strokeWidth="5" />
      ) : null}
      {/* bánh xe */}
      {[-96, 96].map((cx) => (
        <g key={cx} transform={`translate(${cx} 40) rotate(${spin})`}>
          <circle r="38" fill={ink} />
          <circle r="16" fill={color.paper} />
          <line x1="-16" x2="16" y1="0" y2="0" stroke={ink} strokeWidth="5" />
        </g>
      ))}
    </g>
  );
};

/** Khói xám bay ra sau ống xả. */
export const Smoke: React.FC<{ x: number; y: number; active?: boolean }> = ({ x, y, active = true }) => {
  const frame = useCurrentFrame();
  if (!active) return null;
  return (
    <g>
      {[0, 1, 2, 3].map((i) => {
        const t = ((frame + i * 9) % 36) / 36;
        return (
          <circle
            key={i}
            cx={x - t * 120}
            cy={y - t * 50 + Math.sin(t * 6 + i) * 6}
            r={14 + t * 30}
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

/** Sơ đồ Vành đai 1 vẽ tay: vùng lõi Hoàn Kiếm, thêm Cửa Nam, rồi cả Vành đai 1. */
export const ZoneMap: React.FC<{
  x: number;
  y: number;
  size: number;
  level: 1 | 2 | 3;
  /** 0..1, độ hiện của vùng đang được nhấn mạnh */
  reveal?: number;
}> = ({ x, y, size, level, reveal = 1 }) => {
  const frame = useCurrentFrame();
  const s = size / 600;
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  const on = (l: number) => level >= l;
  const fillFor = (l: number) =>
    on(l) ? (l === level ? color.red : "#F2A79F") : "transparent";
  const op = (l: number) => (l === level ? 0.25 + 0.45 * reveal : on(l) ? 0.55 : 0);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#boil)">
      {/* Vành đai 1 */}
      <path
        d="M-270 -40 Q-250 -250 -20 -270 Q230 -270 270 -60 Q290 170 60 260 Q-180 290 -260 120 Z"
        fill={fillFor(3)}
        fillOpacity={op(3)}
        stroke={ink}
        strokeWidth="8"
        strokeDasharray="22 14"
      />
      {/* Hoàn Kiếm + Cửa Nam */}
      <path
        d="M-120 0 Q-120 -150 20 -150 Q170 -140 170 10 Q160 150 20 160 Q-110 160 -120 0 Z"
        fill={fillFor(2)}
        fillOpacity={op(2)}
        stroke={ink}
        strokeWidth="6"
        strokeDasharray={on(2) ? "0" : "14 12"}
      />
      {/* lõi Hoàn Kiếm */}
      <g transform={level === 1 ? `scale(${pulse})` : undefined}>
        <path
          d="M-30 -10 Q-30 -90 50 -90 Q130 -80 120 0 Q110 80 40 80 Q-30 80 -30 -10 Z"
          fill={fillFor(1)}
          fillOpacity={op(1)}
          stroke={ink}
          strokeWidth="6"
        />
      </g>
      {/* Hồ Gươm */}
      <ellipse cx="44" cy="-6" rx="18" ry="34" fill={color.sky} stroke={ink} strokeWidth="5" transform="rotate(-8 44 -6)" />
      {/* nhãn */}
      <g fontFamily={font.display} fontWeight={800} fill={ink} textAnchor="middle">
        <text x="0" y="-292" fontSize="38">VÀNH ĐAI 1</text>
        <text x="-30" y="215" fontSize="30" fill={color.inkSoft}>Hoàn Kiếm + Cửa Nam</text>
        <text x="44" y="56" fontSize="26">Hồ Gươm</text>
      </g>
    </g>
  );
};

/** Con dấu đỏ đóng "rầm" xuống. */
export const Stamp: React.FC<{ text: string; x: number; y: number; progress: number }> = ({ text, x, y, progress }) => {
  if (progress <= 0) return null;
  const sc = 2.2 - 1.2 * Math.min(progress, 1);
  return (
    <g transform={`translate(${x} ${y}) rotate(-12) scale(${sc})`} opacity={Math.min(1, progress * 2)}>
      <rect x="-205" y="-78" width="410" height="156" rx="20" fill={color.paper} fillOpacity="0.92" stroke={color.red} strokeWidth="14" />
      <text
        x="0"
        y="34"
        textAnchor="middle"
        fontFamily={font.display}
        fontWeight={900}
        fontSize="104"
        fill={color.red}
      >
        {text}
      </text>
    </g>
  );
};

export const CheckIcon: React.FC<{ good: boolean; size?: number }> = ({ good, size = 76 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" style={{ flex: "none" }}>
    <g filter="url(#boil)">
      <circle cx="40" cy="40" r="34" fill={good ? color.green : color.red} stroke={ink} strokeWidth="6" />
      {good ? (
        <path d="M22 42 L35 55 L59 27" fill="none" stroke={color.white} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M26 26 L54 54 M54 26 L26 54" stroke={color.white} strokeWidth="9" strokeLinecap="round" />
      )}
    </g>
  </svg>
);

/** Nét gạch chân vẽ tay, chạy từ trái sang theo `progress`. */
export const Scribble: React.FC<{ width: number; progress: number; stroke?: string }> = ({
  width,
  progress,
  stroke = color.yellow,
}) => {
  const len = width * 1.15;
  return (
    <svg width={width} height="40" viewBox={`0 0 ${width} 40`} style={{ display: "block" }}>
      <path
        d={`M6 26 Q${width * 0.3} 12 ${width * 0.55} 22 T${width - 6} 18`}
        fill="none"
        stroke={stroke}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - Math.min(1, Math.max(0, progress)))}
        filter="url(#boil)"
      />
    </svg>
  );
};
