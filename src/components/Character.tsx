import React from "react";
import { useCurrentFrame } from "remotion";
import { color } from "../brand";
import type { Mood, Pose } from "../types";

// "Tèo" — nhân vật người que đội mũ bảo hiểm vàng, dẫn chuyện cho kênh.

type Props = {
  mood?: Mood;
  pose?: Pose;
  talking?: boolean;
  x: number;
  y: number;
  /** 1 = cao khoảng 520px */
  scale?: number;
  flip?: boolean;
  /** Khung hình bắt đầu xuất hiện (để chạy hiệu ứng bật lên). */
  enter?: number;
};

const UPPER = 72;
const FORE = 66;
const SHOULDER = { x: 0, y: -100 };

type ArmAngles = { a: number; b: number };

const rad = (d: number) => (d * Math.PI) / 180;

/** a: góc cánh tay so với phương thẳng đứng (hướng ra ngoài là dương), b: góc khuỷu. */
const arm = (side: -1 | 1, { a, b }: ArmAngles) => {
  const ex = SHOULDER.x + side * 14 + UPPER * Math.sin(rad(a)) * side;
  const ey = SHOULDER.y + UPPER * Math.cos(rad(a));
  const hx = ex + FORE * Math.sin(rad(a + b)) * side;
  const hy = ey + FORE * Math.cos(rad(a + b));
  return { ex, ey, hx, hy, sx: SHOULDER.x + side * 14 };
};

const poseAngles = (pose: Pose, frame: number): { left: ArmAngles; right: ArmAngles } => {
  const sway = Math.sin(frame / 9) * 4;
  switch (pose) {
    case "point":
      return { left: { a: 14, b: 8 }, right: { a: 118 + sway, b: -8 } };
    case "shrug":
      return { left: { a: 48, b: 92 + sway }, right: { a: 48, b: 92 - sway } };
    case "calm":
      return { left: { a: 64 + sway, b: 26 }, right: { a: 64 - sway, b: 26 } };
    case "cheer":
      return { left: { a: 150 + sway * 2, b: 12 }, right: { a: 150 - sway * 2, b: 12 } };
    case "wave":
      return { left: { a: 14, b: 8 }, right: { a: 140, b: 18 + Math.sin(frame / 3.2) * 30 } };
    default:
      return { left: { a: 16 + sway / 2, b: 10 }, right: { a: 16 - sway / 2, b: 10 } };
  }
};

const Eyes: React.FC<{ mood: Mood; blink: boolean }> = ({ mood, blink }) => {
  const ink = color.ink;
  if (blink && mood !== "happy") {
    return (
      <g stroke={ink} strokeWidth="6" strokeLinecap="round">
        <line x1="-36" x2="-16" y1="-205" y2="-205" />
        <line x1="16" x2="36" y1="-205" y2="-205" />
      </g>
    );
  }
  switch (mood) {
    case "happy":
      return (
        <g stroke={ink} strokeWidth="6" strokeLinecap="round" fill="none">
          <path d="M-38 -200 Q-26 -216 -14 -200" />
          <path d="M14 -200 Q26 -216 38 -200" />
        </g>
      );
    case "shocked":
      return (
        <g>
          <circle cx="-26" cy="-206" r="15" fill={color.white} stroke={ink} strokeWidth="5" />
          <circle cx="26" cy="-206" r="15" fill={color.white} stroke={ink} strokeWidth="5" />
          <circle cx="-26" cy="-206" r="5" fill={ink} />
          <circle cx="26" cy="-206" r="5" fill={ink} />
        </g>
      );
    case "calm":
      return (
        <g stroke={ink} strokeWidth="6" strokeLinecap="round" fill="none">
          <path d="M-38 -204 Q-26 -196 -14 -204" />
          <path d="M14 -204 Q26 -196 38 -204" />
        </g>
      );
    default:
      return (
        <g fill={ink}>
          <circle cx="-26" cy="-205" r="7.5" />
          <circle cx="26" cy="-205" r="7.5" />
        </g>
      );
  }
};

const Brows: React.FC<{ mood: Mood }> = ({ mood }) => {
  const ink = color.ink;
  const p =
    mood === "shocked"
      ? ["M-42 -236 L-12 -242", "M12 -242 L42 -236"]
      : mood === "smug"
        ? ["M-40 -226 L-12 -226", "M12 -236 L40 -230"]
        : mood === "sad"
          ? ["M-40 -224 L-14 -232", "M14 -232 L40 -224"]
          : ["M-40 -228 L-14 -231", "M14 -231 L40 -228"];
  return (
    <g stroke={ink} strokeWidth="6" strokeLinecap="round">
      {p.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
  );
};

const Mouth: React.FC<{ mood: Mood; open: boolean }> = ({ mood, open }) => {
  const ink = color.ink;
  if (mood === "shocked") {
    return <ellipse cx="0" cy="-168" rx={open ? 13 : 10} ry={open ? 18 : 13} fill={ink} />;
  }
  if (open) {
    return <path d="M-20 -174 Q0 -146 20 -174 Z" fill={ink} stroke={ink} strokeWidth="5" strokeLinejoin="round" />;
  }
  switch (mood) {
    case "happy":
      return <path d="M-24 -176 Q0 -150 24 -176" fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round" />;
    case "sad":
      return <path d="M-18 -160 Q0 -176 18 -160" fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round" />;
    case "smug":
      return <path d="M-16 -168 Q6 -158 22 -176" fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round" />;
    default:
      return <path d="M-16 -170 Q0 -160 16 -170" fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round" />;
  }
};

export const Character: React.FC<Props> = ({
  mood = "neutral",
  pose = "idle",
  talking = false,
  x,
  y,
  scale = 1,
  flip = false,
  enter = 0,
}) => {
  const frame = useCurrentFrame();
  const local = frame - enter;
  const appear = Math.min(1, Math.max(0, local / 8));
  const bob = Math.sin(frame / 7) * 4;
  const blink = frame % 84 < 4;
  const mouthOpen = talking && Math.floor(frame / 3) % 3 !== 0;
  const { left, right } = poseAngles(pose, frame);
  const L = arm(-1, left);
  const R = arm(1, right);
  const ink = color.ink;

  return (
    <g
      transform={`translate(${x} ${y + (1 - appear) * 60}) scale(${(flip ? -1 : 1) * scale * (0.8 + 0.2 * appear)} ${scale * (0.8 + 0.2 * appear)})`}
      opacity={appear}
      filter="url(#boil)"
    >
      {/* bóng dưới chân */}
      <ellipse cx="0" cy="168" rx="80" ry="12" fill={ink} opacity="0.12" />
      <g transform={`translate(0 ${bob})`} strokeLinecap="round" strokeLinejoin="round">
        {/* chân */}
        <path d="M0 40 L-40 162 M0 40 L40 162" stroke={ink} strokeWidth="11" fill="none" />
        <path d="M-40 162 L-62 162 M40 162 L62 162" stroke={ink} strokeWidth="11" />
        {/* thân */}
        <path d="M0 -132 L0 42" stroke={ink} strokeWidth="11" />
        {/* tay */}
        <path d={`M${L.sx} ${SHOULDER.y} L${L.ex} ${L.ey} L${L.hx} ${L.hy}`} stroke={ink} strokeWidth="10" fill="none" />
        <path d={`M${R.sx} ${SHOULDER.y} L${R.ex} ${R.ey} L${R.hx} ${R.hy}`} stroke={ink} strokeWidth="10" fill="none" />
        <circle cx={L.hx} cy={L.hy} r="10" fill={ink} />
        <circle cx={R.hx} cy={R.hy} r="10" fill={ink} />
        {/* đầu */}
        <circle cx="0" cy="-196" r="72" fill={color.white} stroke={ink} strokeWidth="8" />
        {/* má hồng */}
        {mood === "happy" || mood === "smug" ? (
          <g fill={color.red} opacity="0.25">
            <circle cx="-44" cy="-178" r="11" />
            <circle cx="44" cy="-178" r="11" />
          </g>
        ) : null}
        <Brows mood={mood} />
        <Eyes mood={mood} blink={blink} />
        <Mouth mood={mood} open={mouthOpen} />
        {/* mũ bảo hiểm nửa đầu */}
        <path
          d="M-80 -214 Q-78 -296 0 -300 Q78 -296 80 -214 Z"
          fill={color.yellow}
          stroke={ink}
          strokeWidth="8"
        />
        <path d="M-88 -214 L92 -214" stroke={ink} strokeWidth="9" />
        <path d="M-20 -296 Q-6 -250 -4 -216" stroke={ink} strokeWidth="5" fill="none" opacity="0.5" />
        {mood === "shocked" ? (
          <g stroke={ink} strokeWidth="6" strokeLinecap="round">
            <path d="M-118 -250 L-100 -236 M-122 -210 L-100 -210 M118 -250 L100 -236 M122 -210 L100 -210" />
          </g>
        ) : null}
      </g>
    </g>
  );
};
