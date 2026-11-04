import React from "react";
import { useCurrentFrame } from "remotion";
import { color, font } from "../brand";

const ink = color.ink;

export { Scooter, Smoke } from "./Art";

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
      {/* mạng đường phố mờ */}
      <g stroke={ink} strokeOpacity="0.16" strokeWidth="6" fill="none" strokeLinecap="round">
        <path d="M-250 60 Q-100 40 20 70 T270 30" />
        <path d="M-200 -120 Q-60 -80 40 -20 T120 240" />
        <path d="M-60 -250 Q-20 -100 -50 40 T-90 250" />
        <path d="M110 -260 Q90 -100 130 20 T210 200" />
        <path d="M-260 -10 Q-100 -30 50 -40 T270 -90" />
      </g>
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
      {/* Tháp Rùa trên đảo nhỏ */}
      <g transform="translate(44 -6)">
        <rect x="-6" y="-22" width="12" height="22" fill="#E9DFC8" stroke={ink} strokeWidth="3" />
        <path d="M-9 -22 L0 -34 L9 -22 Z" fill={color.red} stroke={ink} strokeWidth="3" />
      </g>
      {/* cây quanh hồ */}
      {[[8, -44], [86, -40], [80, 36], [4, 40], [126, 4]].map(([cx, cy], k) => (
        <circle key={k} cx={cx} cy={cy} r="9" fill="#4FA66B" stroke={ink} strokeWidth="3" />
      ))}
      {/* vòng sóng lan ra từ vùng đang áp dụng */}
      {(() => {
        const t = (frame % 40) / 40;
        const r = level === 1 ? 100 : level === 2 ? 190 : 300;
        return <ellipse cx="45" cy="0" rx={r * (0.7 + 0.5 * t)} ry={r * (0.6 + 0.5 * t)} fill="none" stroke={color.red} strokeWidth="6" opacity={(1 - t) * 0.5 * reveal} />;
      })()}
      {/* biển cấm */}
      <g transform={`translate(${level === 1 ? 140 : level === 2 ? 190 : 285} ${level === 1 ? -100 : level === 2 ? -150 : -250}) scale(${0.6 + 0.4 * reveal})`}>
        <circle r="34" fill={color.white} stroke={color.red} strokeWidth="9" />
        <path d="M-14 8 L-4 8 L2 -8 L10 -8 M-10 14 a3 3 0 1 0 .1 0 M14 14 a3 3 0 1 0 .1 0" fill="none" stroke={ink} strokeWidth="4" />
        <path d="M-24 24 L24 -24" stroke={color.red} strokeWidth="9" strokeLinecap="round" />
      </g>
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
