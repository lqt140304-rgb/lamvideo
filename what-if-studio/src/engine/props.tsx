import React from 'react';
import { C } from './rig';
import { FONT } from './fonts';

// ---------- the cat ----------
export const Cat: React.FC<{ x: number; y: number; mood: 'sleep' | 'alert' | 'peek'; f: number; coat?: string }> = ({
  x,
  y,
  mood,
  f,
  coat = '#16141D',
}) => {
  const puff = mood === 'alert' ? 1.15 : 1;
  const body = coat;
  const breathe = mood === 'sleep' ? Math.sin(f / 8) * 2 : 0;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={6} rx={72} ry={10} fill="#000" opacity={0.45} />
      {(() => {
        // the tail never quite stops: a lazy flick asleep, a twitchy one when startled
        const fl = Math.sin(f / 7) * (mood === 'alert' ? 14 : 7);
        return (
          <g>
            <path
              d={`M 52 -8 Q ${92 + fl} ${-40 - (mood === 'alert' ? 30 : 0)} ${70 + fl * 1.6} ${mood === 'alert' ? -90 : -18 + fl * 0.6}`}
              stroke="#0C0A12"
              strokeWidth={16}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={`M 52 -8 Q ${92 + fl} ${-40 - (mood === 'alert' ? 30 : 0)} ${70 + fl * 1.6} ${mood === 'alert' ? -90 : -18 + fl * 0.6}`}
              stroke={body}
              strokeWidth={12}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        );
      })()}
      <ellipse cx={0} cy={-26 - breathe} rx={58 * puff} ry={(32 + breathe) * puff} fill={body} stroke="#0C0A12" strokeWidth={3} />
      {/* Subtle night-sheen highlight on spine & deep belly shadow */}
      <path
        d={`M ${-42 * puff} ${-42 - breathe} Q 0 ${-64 - breathe * 1.5} ${44 * puff} ${-40 - breathe}`}
        stroke="#424558"
        strokeWidth={2.4}
        fill="none"
        opacity={0.32}
        strokeLinecap="round"
      />
      <ellipse cx={10} cy={-12} rx={38 * puff} ry={12 * puff} fill="#000" opacity={0.38} />
      {/* Front paws */}
      <ellipse cx={-34} cy={-2} rx={12} ry={6} fill={body} stroke="#0C0A12" strokeWidth={2.5} />
      <ellipse cx={-12} cy={0} rx={12} ry={6} fill={body} stroke="#0C0A12" strokeWidth={2.5} />
      <g transform={`translate(-44 ${-46 - (mood === 'alert' ? 14 : 0)})`}>
        <path d="M -24 -12 L -18 -46 L -2 -22 Z M 22 -12 L 16 -46 L 0 -22 Z" fill={body} stroke="#0C0A12" strokeWidth={3} strokeLinejoin="round" />
        {/* Dark nocturnal inner ear tone */}
        <path d="M -20 -16 L -16 -38 L -6 -22 Z M 18 -16 L 14 -38 L 4 -22 Z" fill="#2E222A" opacity={0.8} />
        <circle cx={0} cy={0} r={30} fill={body} stroke="#0C0A12" strokeWidth={3} />
        {/* Faint moonlit whiskers */}
        <path
          d="M -22 6 L -38 4 M -22 10 L -36 12 M 22 6 L 38 4 M 22 10 L 36 12"
          stroke="#52556C"
          strokeWidth={1.8}
          strokeLinecap="round"
          opacity={0.65}
        />
        {/* Tiny dark nose */}
        <polygon points="-3,6 3,6 0,10" fill="#3A2832" />
        {mood === 'sleep' ? (
          <path d="M -16 2 q 6 5 12 0 M 4 2 q 6 5 12 0" stroke="#52556C" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        ) : mood === 'peek' ? (
          <g>
            {/* Both nocturnal amber cat eyes balanced and symmetrical in size */}
            <circle cx={-11} cy={0} r={12} fill="#FF9E00" opacity={0.32} style={{ mixBlendMode: 'screen' }} />
            <circle cx={11} cy={0} r={12} fill="#FF9E00" opacity={0.32} style={{ mixBlendMode: 'screen' }} />
            <circle cx={-11} cy={0} r={9} fill="#FFAA00" stroke="#8A5A00" strokeWidth={1.4} />
            <circle cx={11} cy={0} r={9} fill="#FFAA00" stroke="#8A5A00" strokeWidth={1.4} />
            <circle cx={-11} cy={0} r={7.2} fill="#FFC837" />
            <circle cx={11} cy={0} r={7.2} fill="#FFC837" />
            <ellipse cx={-11} cy={0} rx={1.8} ry={7} fill="#06050A" />
            <ellipse cx={11} cy={0} rx={1.8} ry={7} fill="#06050A" />
            {/* Specular highlights */}
            <circle cx={-12.5} cy={-2.2} r={2.2} fill="#FFFFFF" />
            <circle cx={9.5} cy={-2.2} r={2.2} fill="#FFFFFF" />
            <circle cx={-9.5} cy={2} r={1.2} fill="#FFEAA7" opacity={0.9} />
            <circle cx={12.5} cy={2} r={1.2} fill="#FFEAA7" opacity={0.9} />
          </g>
        ) : (
          <g>
            {/* Luminous nocturnal amber cat eyes with vertical slit pupils & tapetum reflection */}
            <circle cx={-10} cy={-2} r={14} fill="#FF9E00" opacity={0.35} style={{ mixBlendMode: 'screen' }} />
            <circle cx={10} cy={-2} r={14} fill="#FF9E00" opacity={0.35} style={{ mixBlendMode: 'screen' }} />
            <circle cx={-10} cy={-2} r={10} fill="#FFAA00" stroke="#8A5A00" strokeWidth={1.5} />
            <circle cx={10} cy={-2} r={10} fill="#FFAA00" stroke="#8A5A00" strokeWidth={1.5} />
            <circle cx={-10} cy={-2} r={8} fill="#FFC837" />
            <circle cx={10} cy={-2} r={8} fill="#FFC837" />
            <ellipse cx={-10} cy={-2} rx={2} ry={7.5} fill="#06050A" />
            <ellipse cx={10} cy={-2} rx={2} ry={7.5} fill="#06050A" />
            <circle cx={-11.5} cy={-4.5} r={2.4} fill="#FFFFFF" />
            <circle cx={8.5} cy={-4.5} r={2.4} fill="#FFFFFF" />
            <circle cx={-8.5} cy={0.5} r={1.2} fill="#FFEAA7" opacity={0.85} />
            <circle cx={11.5} cy={0.5} r={1.2} fill="#FFEAA7" opacity={0.85} />
            <path d="M -6 14 L 0 10 L 6 14" stroke="#52556C" strokeWidth={2.8} fill="none" strokeLinecap="round" />
          </g>
        )}
      </g>
      {mood === 'sleep' ? (
        <text
          x={-20}
          y={-96 - (f % 40)}
          fontFamily={FONT.title}
          fontWeight={800}
          fontSize={28}
          fill="#C9CCE0"
          opacity={1 - (f % 40) / 40}
        >
          z
        </text>
      ) : null}
    </g>
  );
};

// ---------- the mug ----------
export const Mug: React.FC<{ x: number; y: number; rot: number; steam?: number; f: number; color?: string }> = ({
  x,
  y,
  rot: r,
  steam = 1,
  f,
  color = C.orange,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    {/* x,y = bottom centre */}
    <ellipse cx={2} cy={2} rx={26} ry={5} fill="#000" opacity={0.3} />
    <path d="M 22 -40 q 22 2 18 18 q -4 12 -18 10" stroke="#1E1824" strokeWidth={11} fill="none" />
    <path d="M 22 -40 q 22 2 18 18 q -4 12 -18 10" stroke="#F4F1EA" strokeWidth={7.5} fill="none" />
    <rect x={-24} y={-52} width={48} height={52} rx={8} fill="#F4F1EA" stroke="#1E1824" strokeWidth={2.5} />
    {/* Right-side shadow for cylindrical volume */}
    <rect x={6} y={-51} width={17} height={50} rx={6} fill="#000" opacity={0.12} />
    <rect x={-23} y={-36} width={46} height={11} fill={color} />
    <rect x={-18} y={-48} width={5} height={42} rx={2.5} fill="#FFF" opacity={0.45} />
    <ellipse cx={0} cy={-50} rx={21} ry={4.5} fill="#D8D2C5" />
    <ellipse cx={0} cy={-50} rx={18} ry={3.5} fill="#5B3A26" />
    <ellipse cx={-5} cy={-50.5} rx={6} ry={1.2} fill="#8C6244" opacity={0.6} />
    {steam > 0
      ? [0, 1].map((i) => (
          <path
            key={i}
            d={`M ${-8 + i * 14} -60 q ${-8 + Math.sin(f / 6 + i) * 5} -12 ${Math.sin(f / 9 + i) * 3} -22 q ${8 + Math.sin(f / 5 + i * 2) * 5} -10 ${Math.sin(f / 8 + i) * 5} -22`}
            stroke="#ffffff"
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
            opacity={steam * (0.35 + 0.25 * Math.sin(f / 6 + i * 2))}
          />
        ))
      : null}
  </g>
);

// ---------- food and paper ----------
/** A cookie seen from the side and a little above: x, y is the middle of its base; `s` scales it, `bite` takes a bite out. */
export const Cookie: React.FC<{ x: number; y: number; s?: number; rot?: number; bite?: number; seed?: number }> = ({
  x,
  y,
  s = 1,
  rot = 0,
  bite = 0,
  seed = 1,
}) => {
  const chips = [
    [-14, -16],
    [10, -20],
    [-2, -8],
    [18, -10],
    [-20, -6],
    [4, -26],
  ];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {bite > 0 ? (
        <defs>
          <mask id={`bite${seed}`}>
            <rect x={-60} y={-60} width={120} height={80} fill="#fff" />
            <circle cx={30} cy={-24} r={14 * bite} fill="#000" />
            <circle cx={22} cy={-34} r={11 * bite} fill="#000" />
          </mask>
        </defs>
      ) : null}
      <g mask={bite > 0 ? `url(#bite${seed})` : undefined}>
        <ellipse cx={0} cy={-6} rx={36} ry={12} fill="#9A6234" />
        <ellipse cx={0} cy={-14} rx={36} ry={13} fill="#D9A15C" />
        <ellipse cx={-6} cy={-17} rx={22} ry={6} fill="#E8B872" opacity={0.7} />
        {chips.map(([cx, cy], i) => (
          <g key={i}>
            <ellipse cx={cx * 0.9} cy={cy * 0.45 - 6} rx={4.5} ry={3} fill="#4A2A1A" />
            <ellipse cx={cx * 0.9 - 1} cy={cy * 0.45 - 7} rx={1.8} ry={1} fill="#7A4C34" opacity={0.65} />
          </g>
        ))}
        <path d="M -36 -14 Q 0 -30 36 -14" stroke="#FFD9A0" strokeWidth={2} fill="none" opacity={0.6} />
      </g>
    </g>
  );
};

/** A cookie seen from straight above (inserts and top-down shots). */
export const CookieTop: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 60, rot = 0 }) => {
  const edge =
    Array.from({ length: 14 })
      .map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const rr = r * (0.94 + 0.06 * Math.sin(i * 2.7));
        return `${i ? 'L' : 'M'} ${Math.cos(a) * rr} ${Math.sin(a) * rr}`;
      })
      .join(' ') + ' Z';
  const chips = [
    [-0.4, -0.3],
    [0.25, -0.45],
    [0.45, 0.1],
    [-0.1, 0.35],
    [-0.5, 0.25],
    [0.15, 0.05],
    [0.05, -0.15],
  ];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <circle cx={4} cy={6} r={r} fill="#000" opacity={0.28} />
      <path d={edge} fill="#D29A55" stroke="#8C5828" strokeWidth={2.5} />
      <circle cx={-r * 0.15} cy={-r * 0.18} r={r * 0.62} fill="#E2AE68" opacity={0.6} />
      {chips.map(([a, b], i) => (
        <path
          key={i}
          d={`M ${a * r - 7} ${b * r} l 7 -6 l 7 6 l -3 6 l -8 0 Z`}
          fill="#4A2A1A"
          transform={`rotate(${i * 47} ${a * r} ${b * r})`}
        />
      ))}
    </g>
  );
};

/** A plate, side view: x, y is the middle of its base. */
export const Plate: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={2} rx={84} ry={14} fill="#000" opacity={0.32} />
    <ellipse cx={0} cy={-4} rx={80} ry={16} fill="#CFC8BC" stroke="#221C24" strokeWidth={2} />
    <ellipse cx={0} cy={-8} rx={80} ry={15} fill="#F4F1EA" />
    <ellipse cx={0} cy={-8} rx={56} ry={9} fill="#E6E0D4" />
    <path d="M -68 -10 Q 0 -22 68 -10" stroke="#FFF" strokeWidth={2.5} fill="none" opacity={0.7} />
  </g>
);

/** A plate from straight above. */
export const PlateTop: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 170 }) => (
  <g>
    <circle cx={x + 10} cy={y + 14} r={r} fill="#000" opacity={0.3} />
    <circle cx={x} cy={y} r={r} fill="#F4F1EA" stroke="#D2CABC" strokeWidth={3} />
    <circle cx={x} cy={y} r={r * 0.72} fill="#E6E0D4" />
    <path
      d={`M ${x - r * 0.8} ${y - r * 0.4} A ${r * 0.9} ${r * 0.9} 0 0 1 ${x - r * 0.2} ${y - r * 0.85}`}
      stroke="#FFFFFF"
      strokeWidth={8}
      fill="none"
      opacity={0.6}
      strokeLinecap="round"
    />
  </g>
);

/** A sheet of paper from above: lines of writing, ticks and a grade when `done` (fill 0..1 writes it in), blank when not. */
export const Paper: React.FC<{
  x: number;
  y: number;
  w?: number;
  rot?: number;
  done?: boolean;
  grade?: string;
  fill?: number;
}> = ({ x, y, w = 300, rot = 0, done = true, grade = 'A+', fill = 1 }) => {
  const h = w * 1.3;
  const lines = 9;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + 8} y={-h / 2 + 10} width={w} height={h} fill="#000" opacity={0.32} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#F4EEE0" stroke="#D4C8B0" strokeWidth={2} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.09} fill="#E6DCC6" />
      {/* Margin line */}
      <path d={`M ${-w / 2 + 22} ${-h / 2} L ${-w / 2 + 22} ${h / 2}`} stroke="#E2A6A2" strokeWidth={1.8} opacity={0.7} />
      {Array.from({ length: lines }).map((_, i) => {
        const yy = -h / 2 + h * 0.17 + i * h * 0.085;
        const len = (0.55 + 0.35 * Math.abs(Math.sin(i * 1.9))) * (w - 90);
        const shown = done ? Math.min(1, Math.max(0, fill * lines - i)) : 0;
        return (
          <g key={i}>
            <path d={`M ${-w / 2 + 24} ${yy + 10} L ${w / 2 - 24} ${yy + 10}`} stroke="#B9C4D6" strokeWidth={2} />
            {shown > 0 ? (
              <path
                d={`M ${-w / 2 + 30} ${yy} L ${-w / 2 + 30 + len * shown} ${yy}`}
                stroke="#3A4A6A"
                strokeWidth={5}
                strokeLinecap="round"
              />
            ) : null}
            {done && shown >= 1 && i % 2 === 0 ? (
              <path
                d={`M ${w / 2 - 44} ${yy} l 8 8 l 14 -16`}
                stroke="#3BA05A"
                strokeWidth={5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </g>
        );
      })}
      {done && grade && fill >= 1 ? (
        <g transform={`translate(${w / 2 - 58} ${-h / 2 + 46}) rotate(-12)`}>
          <circle r={34} fill="none" stroke="#D9534F" strokeWidth={5} />
          <text y={13} textAnchor="middle" fontFamily={FONT.hand} fontWeight={700} fontSize={36} fill="#D9534F">
            {grade}
          </text>
        </g>
      ) : null}
    </g>
  );
};

/** A neat stack of papers seen from the side and a little above: x, y the middle of its base, n sheets. */
export const PaperStack: React.FC<{ x: number; y: number; n: number; w?: number }> = ({ x, y, n, w = 220 }) => (
  <g>
    <ellipse cx={x + 8} cy={y + 2} rx={w * 0.6} ry={10} fill="#000" opacity={0.3} />
    {Array.from({ length: n }).map((_, i) => (
      <g key={i} transform={`translate(${x + Math.sin(i * 2.3) * 5} ${y - i * 7})`}>
        <polygon points={`${-w / 2},0 ${w / 2},0 ${w / 2 - 20},-14 ${-w / 2 + 20},-14`} fill={i === n - 1 ? '#F4EEE0' : '#E6DCC6'} />
        <path d={`M ${-w / 2} 0 L ${w / 2} 0`} stroke="#B8AC94" strokeWidth={2} />
      </g>
    ))}
  </g>
);

/** A tower of cookies, side view: x, y the middle of its base. */
export const CookieStack: React.FC<{ x: number; y: number; n: number; s?: number }> = ({ x, y, n, s = 1 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => (
      <Cookie
        key={i}
        x={x + Math.sin(i * 1.7) * 4 * s}
        y={y - i * 14 * s}
        s={s}
        rot={Math.sin(i * 2.1) * 3}
        seed={i + 20}
      />
    ))}
  </g>
);

// ---------- night things: the bedside clock, the calendar, books, the laptop ----------
/** A digital alarm clock, side-on: x, y the middle of its base, `text` on the display (00:00), glowing when `on`. */
export const AlarmClock: React.FC<{ x: number; y: number; s?: number; text: string; on?: number }> = ({
  x,
  y,
  s = 1,
  text,
  on = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={8} cy={2} rx={128} ry={14} fill="#000" opacity={0.35} />
    <rect x={-120} y={-118} width={240} height={112} rx={22} fill="#24202C" stroke="#14111A" strokeWidth={3} />
    <rect x={-120} y={-118} width={240} height={10} rx={5} fill="#3A3444" />
    {/* Snooze button on top */}
    <rect x={-34} y={-126} width={68} height={8} rx={4} fill="#3A3444" />
    <rect x={-104} y={-102} width={208} height={80} rx={12} fill="#120A0C" stroke="#2E2636" strokeWidth={2} />
    <circle cx={0} cy={-62} r={120} fill="url(#g3red)" opacity={0.35 * on} style={{ mixBlendMode: 'screen' }} />
    <text
      x={0}
      y={-40}
      textAnchor="middle"
      fontFamily={FONT.ui}
      fontSize={64}
      fill="#FF5A3A"
      opacity={0.25 + 0.75 * on}
      style={{ filter: on > 0.5 ? 'drop-shadow(0 0 10px #FF3A2A)' : undefined }}
    >
      {text}
    </text>
    <rect x={-96} y={-6} width={22} height={8} rx={3} fill="#1A1620" />
    <rect x={74} y={-6} width={22} height={8} rx={3} fill="#1A1620" />
  </g>
);

/**
 * A month on the wall, front-on: a picture on top (hills under a moon), the days below. Days up to `crossed` have a red
 * cross; the next day's cross draws on as `drawing` goes 0 to 1. x, y is the top centre, w the width.
 */
export const WallCalendar: React.FC<{
  x: number;
  y: number;
  w?: number;
  crossed?: number;
  drawing?: number;
  rot?: number;
}> = ({ x, y, w = 300, crossed = 0, drawing = 0, rot = 0 }) => {
  const h = w * 1.32;
  const top = h * 0.36;
  const cw = (w - w * 0.1) / 7;
  const ch = (h - top - w * 0.14) / 5;
  const first = 3; // the 1st falls on the fourth column
  const cross = (cx: number, cy: number, p: number, k: number) => {
    const r = Math.min(cw, ch) * 0.36;
    const a = Math.min(1, p * 2);
    const b = Math.max(0, p * 2 - 1);
    return (
      <g key={`x${k}`} stroke="#D93A3A" strokeWidth={w * 0.016} strokeLinecap="round">
        {a > 0 ? <path d={`M ${cx - r} ${cy - r} L ${cx - r + 2 * r * a} ${cy - r + 2 * r * a}`} /> : null}
        {b > 0 ? <path d={`M ${cx + r} ${cy - r} L ${cx + r - 2 * r * b} ${cy - r + 2 * r * b}`} /> : null}
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + w * 0.03} y={w * 0.03} width={w} height={h} fill="#000" opacity={0.35} />
      <rect x={-w / 2} y={0} width={w} height={h} fill="#EFE8DA" stroke="#B8AC94" strokeWidth={2} />
      <rect x={-w / 2 + w * 0.05} y={w * 0.05} width={w * 0.9} height={top - w * 0.05} fill="#22264A" />
      <circle cx={w * 0.2} cy={top * 0.38} r={w * 0.06} fill="#F1F3FF" />
      <path
        d={`M ${-w * 0.45} ${top} L ${-w * 0.2} ${top * 0.55} L ${0} ${top * 0.8} L ${w * 0.18} ${top * 0.48} L ${w * 0.45} ${top} Z`}
        fill="#3E4A7A"
      />
      <rect x={-w / 2} y={top + w * 0.01} width={w} height={w * 0.06} fill="#D9534F" />
      {Array.from({ length: 35 }).map((_, i) => {
        const day = i - first + 1;
        const cx = -w / 2 + w * 0.05 + (i % 7) * cw + cw / 2;
        const cy = top + w * 0.1 + Math.floor(i / 7) * ch + ch / 2;
        if (day < 1 || day > 31) return null;
        return (
          <g key={i}>
            <text x={cx} y={cy + w * 0.022} textAnchor="middle" fontFamily={FONT.ui} fontSize={w * 0.06} fill="#3A3444">
              {day}
            </text>
            {day <= crossed ? cross(cx, cy, 1, i) : day === crossed + 1 && drawing > 0 ? cross(cx, cy, drawing, i) : null}
          </g>
        );
      })}
      <circle cx={0} cy={-w * 0.02} r={w * 0.025} fill="#1A1620" />
    </g>
  );
};
/** Where day `day` sits on a WallCalendar drawn at (x, y, w) with no rotation: for a hand holding the marker there. */
export const calendarDay = (x: number, y: number, w: number, day: number) => {
  const h = w * 1.32;
  const top = h * 0.36;
  const cw = (w - w * 0.1) / 7;
  const ch = (h - top - w * 0.14) / 5;
  const i = day + 3 - 1;
  return {
    x: x - w / 2 + w * 0.05 + (i % 7) * cw + cw / 2,
    y: y + top + w * 0.1 + Math.floor(i / 7) * ch + ch / 2,
    r: Math.min(cw, ch) * 0.36,
  };
};

/** An open book from in front and a little above: x, y the middle of the spine's foot. `turn` (0..1) lifts a page over. */
export const OpenBook: React.FC<{
  x: number;
  y: number;
  w?: number;
  rot?: number;
  turn?: number;
  cover?: string;
}> = ({ x, y, w = 200, rot = 0, turn = 0, cover = '#7A4A4A' }) => {
  const h = w * 0.42;
  const page = (side: 1 | -1) =>
    `M 0 0 Q ${side * w * 0.22} ${-h * 0.18} ${side * w * 0.48} ${-h * 0.06} L ${side * w * 0.44} ${-h} Q ${side * w * 0.22} ${-h * 1.12} 0 ${-h * 0.94} Z`;
  const tx = Math.cos(turn * Math.PI);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse cx={0} cy={4} rx={w * 0.55} ry={w * 0.06} fill="#000" opacity={0.35} />
      <path d={`M ${-w * 0.52} ${-h * 0.02} L ${w * 0.52} ${-h * 0.02} L ${w * 0.48} ${-h * 1.02} L ${-w * 0.48} ${-h * 1.02} Z`} fill={cover} />
      <path d={page(-1)} fill="#EFE6D2" />
      <path d={page(1)} fill="#F7F0E0" />
      {[0.25, 0.4, 0.55, 0.7].map((k, i) => (
        <g key={i} stroke="#9A907E" strokeWidth={w * 0.012} strokeLinecap="round">
          <path d={`M ${-w * 0.4} ${-h * k - h * 0.05} L ${-w * 0.08} ${-h * k}`} />
          <path d={`M ${w * 0.08} ${-h * k} L ${w * 0.4} ${-h * k - h * 0.05}`} />
        </g>
      ))}
      {turn > 0 && turn < 1 ? (
        <path
          d={`M 0 ${-h * 0.94} Q ${tx * w * 0.22} ${-h * 1.4} ${tx * w * 0.42} ${-h * 1.1} L ${tx * w * 0.46} ${-h * 0.1} Q ${tx * w * 0.22} ${-h * 0.5} 0 0 Z`}
          fill="#FFF8EA"
          stroke="#C9BCA2"
          strokeWidth={2}
        />
      ) : null}
      <path d={`M 0 0 L 0 ${-h * 0.94}`} stroke="#B9AC92" strokeWidth={3} />
    </g>
  );
};

const BOOK_COLS = ['#7A4A4A', '#4A5A7A', '#8A7A4A', '#4A6A5A', '#6A4A6A', '#9A6A4A', '#3E4A62', '#7A6252'];
/** A closed book lying flat, side-on: x, y the middle of its base. */
export const BookFlat: React.FC<{ x: number; y: number; w?: number; th?: number; i?: number; rot?: number }> = ({
  x,
  y,
  w = 150,
  th = 22,
  i = 0,
  rot = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={-th} width={w} height={th} rx={3} fill={BOOK_COLS[i % BOOK_COLS.length]} stroke="#1E1824" strokeWidth={1.5} />
    <rect x={-w / 2 + 6} y={-th + 4} width={w - 10} height={th - 8} fill="#EFE6D2" />
    <rect x={-w / 2} y={-th} width={8} height={th} rx={3} fill={BOOK_COLS[(i + 3) % BOOK_COLS.length]} />
  </g>
);
/** A tower of finished books, each a little askew: x, y the middle of its base, n books. */
export const BookTower: React.FC<{ x: number; y: number; n: number; s?: number }> = ({ x, y, n, s = 1 }) => (
  <g>
    <ellipse cx={x + 8 * s} cy={y + 2} rx={90 * s} ry={10 * s} fill="#000" opacity={0.3} />
    {Array.from({ length: n }).map((_, i) => (
      <BookFlat
        key={i}
        x={x + Math.sin(i * 2.3) * 7 * s}
        y={y - i * 20 * s}
        w={(130 + Math.sin(i * 1.7) * 20) * s}
        th={18 * s}
        i={i}
        rot={Math.sin(i * 1.3) * 3}
      />
    ))}
  </g>
);

/** A laptop lid from behind, open toward someone: x, y the middle of the hinge; the screen's light spills round it. */
export const LaptopBack: React.FC<{ x: number; y: number; w?: number; glow?: number; tilt?: number }> = ({
  x,
  y,
  w = 180,
  glow = 1,
  tilt = 0,
}) => {
  const h = w * 0.66;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <ellipse cx={0} cy={4} rx={w * 0.56} ry={8} fill="#000" opacity={0.32} />
      <circle cx={0} cy={-h * 0.6} r={w * 1.3} fill="url(#g3cool)" opacity={0.45 * glow} style={{ mixBlendMode: 'screen' }} />
      <path d={`M ${-w / 2} 0 L ${w / 2} 0 L ${w / 2 - 6} ${-h} L ${-w / 2 + 6} ${-h} Z`} fill="#3A3C4C" stroke="#1E1F2A" strokeWidth={2.5} />
      <path d={`M ${-w / 2 + 6} ${-h} L ${w / 2 - 6} ${-h}`} stroke="#BFD6FF" strokeWidth={4} opacity={0.9 * glow} />
      <path d={`M ${-w / 2} 0 L ${-w / 2 + 6} ${-h}`} stroke="#BFD6FF" strokeWidth={3} opacity={0.6 * glow} />
      <path d={`M ${w / 2} 0 L ${w / 2 - 6} ${-h}`} stroke="#BFD6FF" strokeWidth={3} opacity={0.6 * glow} />
      {/* stickers: a moon and a star */}
      <circle cx={-w * 0.18} cy={-h * 0.6} r={w * 0.07} fill="#E9C46A" />
      <circle cx={-w * 0.15} cy={-h * 0.63} r={w * 0.06} fill="#3A3C4C" />
      <path
        transform={`translate(${w * 0.16} ${-h * 0.38}) scale(${w / 400})`}
        d="M 0 -40 L 10 -12 L 40 -12 L 16 6 L 25 36 L 0 18 L -25 36 L -16 6 L -40 -12 L -10 -12 Z"
        fill="#F28C6A"
      />
      <rect x={-w / 2 - 8} y={-4} width={w + 16} height={10} rx={4} fill="#4A4C5C" />
    </g>
  );
};

// ---------- pizza, a phone, a paper ball ----------
const PEPPERONI: [number, number, number][] = [
  [0.42, -0.1, 0.11],
  [0.66, 0.12, 0.12],
  [0.7, -0.16, 0.1],
  [0.26, 0.05, 0.08],
];
/**
 * A slice of pizza from above: x, y the tip, pointing along `rot` (0 = tip at the left, crust to the right), `len` from
 * tip to crust. `bite` (0..1) eats back from the tip; `drip` hangs a string of cheese off the bitten edge.
 */
export const PizzaSlice: React.FC<{
  x: number;
  y: number;
  len?: number;
  rot?: number;
  bite?: number;
  drip?: number;
  shadow?: number;
}> = ({ x, y, len = 200, rot = 0, bite = 0, drip = 0, shadow = 1 }) => {
  const L = len;
  const half = L * 0.36; // half the crust's width
  const b = bite * L * 0.42;
  const wAt = (d: number) => (half * d) / L;
  // the bitten edge: tooth-sized scallops across the wedge at distance b from the tip
  const scallops = (() => {
    const w = wAt(b);
    let d = `M ${b} ${-w}`;
    for (let i = 0; i < 3; i++) {
      const y0 = -w + (2 * w * i) / 3;
      const y1 = -w + (2 * w * (i + 1)) / 3;
      d += ` Q ${b - L * 0.07} ${(y0 + y1) / 2} ${b} ${y1}`;
    }
    return d;
  })();
  const body = b > 0 ? `${scallops} L ${L} ${half} L ${L} ${-half} Z` : `M 0 0 L ${L} ${half} L ${L} ${-half} Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {shadow > 0 ? <path d={body} transform="translate(10 14)" fill="#000" opacity={0.3 * shadow} /> : null}
      <path d={body} fill="#F2C14E" stroke="#C9862E" strokeWidth={L * 0.012} strokeLinejoin="round" />
      {/* melted lighter pools, and the sauce showing at the edge */}
      <ellipse cx={L * 0.55} cy={-L * 0.02} rx={L * 0.14} ry={L * 0.05} fill="#FBDA7A" opacity={0.8} />
      <ellipse cx={L * 0.78} cy={L * 0.1} rx={L * 0.08} ry={L * 0.035} fill="#FBDA7A" opacity={0.8} />
      <path
        d={`M ${L * 0.86} ${-half * 0.84} Q ${L * 0.9} ${-half * 0.5} ${L * 0.87} ${-half * 0.2}`}
        stroke="#D2552E"
        strokeWidth={L * 0.03}
        fill="none"
        strokeLinecap="round"
        opacity={0.7}
      />
      {PEPPERONI.map(([d, o, r], i) =>
        d * L > b + r * L ? (
          <g key={i}>
            <circle cx={d * L} cy={o * L} r={r * L} fill="#B5452E" />
            <circle cx={d * L - r * L * 0.2} cy={o * L - r * L * 0.25} r={r * L * 0.55} fill="#C9583A" />
            <circle cx={d * L + r * L * 0.35} cy={o * L + r * L * 0.2} r={r * L * 0.12} fill="#8A2E20" />
          </g>
        ) : null,
      )}
      {/* the crust: a puffed band along the wide end, lit on top */}
      <path
        d={`M ${L - L * 0.02} ${-half - L * 0.03} Q ${L + L * 0.1} 0 ${L - L * 0.02} ${half + L * 0.03} L ${L - L * 0.12} ${half * 0.92} Q ${L - L * 0.04} 0 ${L - L * 0.12} ${-half * 0.92} Z`}
        fill="#D9954A"
        stroke="#A86A2E"
        strokeWidth={L * 0.012}
        strokeLinejoin="round"
      />
      <path
        d={`M ${L - L * 0.04} ${-half * 0.8} Q ${L + L * 0.05} 0 ${L - L * 0.04} ${half * 0.8}`}
        stroke="#F0B870"
        strokeWidth={L * 0.025}
        fill="none"
        strokeLinecap="round"
        opacity={0.8}
      />
      {drip > 0 && b > 0 ? (
        <path
          d={`M ${b - L * 0.03} ${wAt(b) * 0.2} q ${-L * 0.04} ${L * 0.25 * drip} ${-L * 0.01} ${L * 0.45 * drip}`}
          stroke="#F7CF62"
          strokeWidth={L * 0.028}
          fill="none"
          strokeLinecap="round"
        />
      ) : null}
    </g>
  );
};

/**
 * An open, empty pizza box on a counter, from the front and a little above: x, y the middle of its front edge. `lid`
 * stands the lid up behind it; without it the lid is folded back out of sight.
 */
export const PizzaBox: React.FC<{ x: number; y: number; w?: number; lid?: boolean }> = ({ x, y, w = 260, lid: withLid = true }) => {
  const d = w * 0.34; // the base's depth on screen
  const lid = w * 0.62;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={4} rx={w * 0.56} ry={w * 0.05} fill="#000" opacity={0.3} />
      {/* the lid, up against the back */}
      {withLid ? (
        <path d={`M ${-w / 2 + 10} ${-d} L ${w / 2 - 10} ${-d} L ${w / 2 - 26} ${-d - lid} L ${-w / 2 + 26} ${-d - lid} Z`} fill="#A88A62" />
      ) : null}
      {/* the base: grease rings and crumbs where the pizza was */}
      <path d={`M ${-w / 2} 0 L ${w / 2} 0 L ${w / 2 - 10} ${-d} L ${-w / 2 + 10} ${-d} Z`} fill="#C9AD82" />
      <ellipse cx={0} cy={-d * 0.5} rx={w * 0.36} ry={d * 0.36} fill="#B98E52" opacity={0.35} />
      <ellipse cx={-w * 0.12} cy={-d * 0.55} rx={w * 0.08} ry={d * 0.12} fill="#A87A40" opacity={0.4} />
      {[
        [-0.2, -0.4],
        [0.1, -0.6],
        [0.25, -0.35],
        [-0.05, -0.25],
        [0.18, -0.7],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx * w} cy={cy * d} r={3 + (i % 2) * 2} fill="#C98A3E" />
      ))}
      <rect x={-w / 2} y={-6} width={w} height={12} fill="#A8885E" />
      <rect x={-w / 2} y={-6} width={w} height={2.5} fill="#FFE2B0" opacity={0.5} />
    </g>
  );
};

/**
 * A phone, from above or held: x, y its centre, w its width, `rot` its turn. Dark and glossy when `on` is 0; lit when
 * `on` > 0, showing an incoming call (`caller`, an avatar, a red and a green button) or a voice memo player (`voiceMemo` > 0).
 * `cracked` (0..1) overlays a spiderweb screen crack (for The Crack in Reality / dramatic props); `buzz` draws vibration marks.
 */
export const Phone: React.FC<{
  x: number;
  y: number;
  w?: number;
  rot?: number;
  on?: number;
  caller?: string;
  buzz?: number;
  f?: number;
  cracked?: number;
  voiceMemo?: number;
  memoTime?: string;
}> = ({
  x,
  y,
  w = 200,
  rot = 0,
  on = 0,
  caller = 'MUM',
  buzz = 0,
  f = 0,
  cracked = 0,
  voiceMemo = 0,
  memoTime = '00:47',
}) => {
  const h = w * 2.05;
  const jx = buzz > 0 ? Math.sin(f * 9.1) * w * 0.012 * buzz : 0;
  const s = w / 200;
  return (
    <g transform={`translate(${x + jx} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + 8 * s} y={-h / 2 + 12 * s} width={w} height={h} rx={w * 0.16} fill="#000" opacity={0.35} />
      {on > 0 ? <circle cx={0} cy={0} r={w * 1.5} fill="url(#g3cool)" opacity={0.55 * on} style={{ mixBlendMode: 'screen' }} /> : null}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.16} fill="#16151C" stroke="#3A3846" strokeWidth={4 * s} />
      <rect x={-w / 2 + w * 0.06} y={-h / 2 + w * 0.06} width={w * 0.88} height={h - w * 0.12} rx={w * 0.11} fill="#0B0A10" />
      {on > 0 ? (
        voiceMemo > 0 ? (
          <g opacity={on}>
            <rect x={-w / 2 + w * 0.06} y={-h / 2 + w * 0.06} width={w * 0.88} height={h - w * 0.12} rx={w * 0.11} fill="#1C2438" />
            <text x={0} y={-h * 0.26} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={w * 0.11} fill="#F6EFE3">
              {caller}
            </text>
            <text x={0} y={-h * 0.16} textAnchor="middle" fontFamily={FONT.ui} fontSize={w * 0.08} fill="#9FB6D8">
              Tin nhắn thoại • {memoTime}
            </text>
            {/* Animated waveform bars */}
            {Array.from({ length: 15 }).map((_, i) => {
              const bx = -w * 0.34 + i * (w * 0.048);
              const amp = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.3 + f * 0.18 * voiceMemo));
              const bh = w * 0.36 * amp;
              const played = i / 15 <= voiceMemo;
              return (
                <rect
                  key={i}
                  x={bx - w * 0.014}
                  y={-bh / 2}
                  width={w * 0.028}
                  height={bh}
                  rx={w * 0.014}
                  fill={played ? '#6AD2FF' : '#4A5D7E'}
                />
              );
            })}
            <circle cx={0} cy={h * 0.26} r={w * 0.12} fill="#3E8C86" />
            <polygon points={`${-w * 0.035},${h * 0.22} ${-w * 0.035},${h * 0.3} ${w * 0.055},${h * 0.26}`} fill="#F6EFE3" />
          </g>
        ) : (
          <g opacity={on}>
            <rect x={-w / 2 + w * 0.06} y={-h / 2 + w * 0.06} width={w * 0.88} height={h - w * 0.12} rx={w * 0.11} fill="#2C3A5E" />
            <rect
              x={-w / 2 + w * 0.06}
              y={-h / 2 + w * 0.06}
              width={w * 0.88}
              height={(h - w * 0.12) * 0.55}
              rx={w * 0.11}
              fill="#4A6A9E"
              opacity={0.6}
            />
            {/* the caller: a round avatar with a bob of hair */}
            <circle cx={0} cy={-h * 0.18} r={w * 0.2} fill="#F6EFE3" />
            <path
              d={`M ${-w * 0.22} ${-h * 0.12} Q ${-w * 0.26} ${-h * 0.33} 0 ${-h * 0.33} Q ${w * 0.26} ${-h * 0.33} ${w * 0.22} ${-h * 0.12} L ${w * 0.15} ${-h * 0.12} Q ${w * 0.14} ${-h * 0.24} ${w * 0.04} ${-h * 0.26} Q ${-w * 0.1} ${-h * 0.22} ${-w * 0.15} ${-h * 0.12} Z`}
              fill="#5A3226"
            />
            <text x={0} y={0} textAnchor="middle" fontFamily={FONT.ui} fontSize={w * 0.17} fill="#F6EFE3" letterSpacing={w * 0.02}>
              {caller}
            </text>
            <circle cx={-w * 0.22} cy={h * 0.32} r={w * 0.1} fill="#E4544A" />
            <circle cx={w * 0.22} cy={h * 0.32} r={w * 0.1} fill="#4CC774" />
            <path
              d={`M ${w * 0.17} ${h * 0.3} q ${w * 0.05} ${w * 0.08} ${w * 0.1} ${w * 0.04}`}
              stroke="#F6EFE3"
              strokeWidth={w * 0.025}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )
      ) : (
        <path d={`M ${-w * 0.3} ${-h * 0.42} L ${w * 0.05} ${-h * 0.42} L ${-w * 0.3} ${-h * 0.1} Z`} fill="#FFFFFF" opacity={0.06} />
      )}
      {/* Cracked glass spiderweb overlay */}
      {cracked > 0 ? (
        <g stroke="#DCE8F8" strokeWidth={1.8 * s} fill="none" opacity={0.75 * cracked} strokeLinecap="round">
          <path d={`M ${w * 0.24} ${-h * 0.18} L ${-w * 0.36} ${-h * 0.38}`} />
          <path d={`M ${w * 0.24} ${-h * 0.18} L ${-w * 0.38} ${h * 0.08}`} />
          <path d={`M ${w * 0.24} ${-h * 0.18} L ${w * 0.06} ${h * 0.38}`} />
          <path d={`M ${w * 0.24} ${-h * 0.18} L ${w * 0.42} ${h * 0.12}`} />
          <path d={`M ${w * 0.04} ${-h * 0.24} L ${-w * 0.04} ${-h * 0.09} L ${w * 0.16} ${0.02 * h}`} />
          <path d={`M ${-w * 0.12} ${-h * 0.3} L ${-w * 0.22} ${-h * 0.02} L ${w * 0.1} ${h * 0.18}`} />
        </g>
      ) : null}
      <rect x={-w * 0.12} y={-h / 2 + w * 0.1} width={w * 0.24} height={w * 0.05} rx={w * 0.025} fill="#000" />
      {buzz > 0
        ? [-1, 1].map((sd) => (
            <g key={sd} stroke="#CFE6FF" strokeWidth={6 * s} strokeLinecap="round" fill="none" opacity={0.75 * buzz}>
              <path d={`M ${sd * (w / 2 + w * 0.12)} ${-h * 0.18} q ${sd * w * 0.06} ${h * 0.06} 0 ${h * 0.12}`} />
              <path d={`M ${sd * (w / 2 + w * 0.24)} ${-h * 0.24} q ${sd * w * 0.09} ${h * 0.12} 0 ${h * 0.24}`} />
            </g>
          ))
        : null}
    </g>
  );
};

/** A crumpled paper ball: x, y its centre, r its radius, `rot` turns its creases as it tumbles. */
export const PaperBall: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 40, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path
      d={`M ${-r} ${-r * 0.1} L ${-r * 0.7} ${-r * 0.75} L ${-r * 0.05} ${-r} L ${r * 0.65} ${-r * 0.78} L ${r} ${-r * 0.05} L ${r * 0.72} ${r * 0.7} L ${r * 0.05} ${r} L ${-r * 0.68} ${r * 0.74} Z`}
      fill="#EFE6D2"
      stroke="#9E927C"
      strokeWidth={r * 0.05}
      strokeLinejoin="round"
    />
    <path d={`M ${r * 0.1} ${r * 0.98} L ${r * 0.72} ${r * 0.7} L ${r} ${-r * 0.05} L ${r * 0.35} ${r * 0.2} Z`} fill="#CFC4AE" />
    <path
      d={`M ${-r * 0.6} ${-r * 0.5} L ${-r * 0.05} ${-r * 0.15} L ${r * 0.5} ${-r * 0.55} M ${-r * 0.05} ${-r * 0.15} L ${-r * 0.2} ${r * 0.55} M ${-r * 0.8} ${r * 0.15} L ${-r * 0.3} ${r * 0.1}`}
      stroke="#B3A78F"
      strokeWidth={r * 0.06}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d={`M ${-r * 0.85} ${-r * 0.2} L ${-r * 0.62} ${-r * 0.7}`} stroke="#FFE7B8" strokeWidth={r * 0.07} strokeLinecap="round" opacity={0.7} />
  </g>
);

// ---------- Vietnamese household & story props ----------

/** A printed family photograph on glossy paper with white border (e.g., mother and two children in The Crack in Reality). */
export const PhotoPrint: React.FC<{
  x: number;
  y: number;
  w?: number;
  rot?: number;
  sepia?: number;
  creased?: number;
}> = ({ x, y, w = 260, rot = 0, sepia = 0.35, creased = 0.5 }) => {
  const h = w * 0.76;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + 8} y={-h / 2 + 10} width={w} height={h} rx={4} fill="#000" opacity={0.35} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={3} fill="#F6EFE2" stroke="#BFB29A" strokeWidth={2.5} />
      <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={h - 36} fill={sepia > 0 ? '#786252' : '#586E84'} />
      {/* Warm sunlit background */}
      <circle cx={w * 0.22} cy={-h * 0.18} r={w * 0.08} fill="#FFE2B0" opacity={0.65} />
      {/* Mother in center, two children on left and right */}
      {[
        [-w * 0.2, 0.82, '#3C5E8C', '#24202C'],
        [0, 1, '#8C584C', '#2A2226'],
        [w * 0.2, 0.86, '#5A7A6E', '#1E1A22'],
      ].map(([px, sc, shirt, hair], i) => (
        <g key={i} transform={`translate(${px as number} ${h * 0.12}) scale(${sc as number})`}>
          <path d={`M -34 26 Q -32 -14 0 -14 Q 32 -14 34 26 Z`} fill={shirt as string} />
          <circle cx={0} cy={-34} r={20} fill="#E8C9A8" />
          <path d="M -20 -36 Q -18 -56 0 -56 Q 18 -56 20 -36 Z" fill={hair as string} />
          <path d="M -6 -28 Q 0 -23 6 -28" stroke="#4A342E" strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>
      ))}
      {creased > 0 ? (
        <path
          d={`M ${-w * 0.35} ${-h * 0.48} L ${w * 0.28} ${h * 0.48}`}
          stroke="#FFF8EA"
          strokeWidth={2}
          opacity={0.55 * creased}
        />
      ) : null}
    </g>
  );
};

/** A handwritten repair claim slip / receipt (tờ biên nhận tiệm sửa đồ). */
export const ReceiptSlip: React.FC<{
  x: number;
  y: number;
  w?: number;
  rot?: number;
  title?: string;
  note?: string;
}> = ({ x, y, w = 240, rot = 0, title = 'PHIẾU NHẬN ĐỒ', note = 'Nhờ chú Lộc đưa giúp' }) => {
  const h = w * 0.68;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + 6} y={-h / 2 + 8} width={w} height={h} fill="#000" opacity={0.32} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={3} fill="#F2E4C8" stroke="#B8A47E" strokeWidth={2} />
      <rect x={-w / 2 + 10} y={-h / 2 + 10} width={w - 20} height={h - 20} fill="none" stroke="#C49A6C" strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={0} y={-h * 0.22} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={w * 0.075} fill="#8A342B">
        {title}
      </text>
      <path d={`M ${-w * 0.36} ${-h * 0.06} L ${w * 0.36} ${-h * 0.06}`} stroke="#8A7658" strokeWidth={2} />
      <text x={0} y={h * 0.14} textAnchor="middle" fontFamily={FONT.hand} fontWeight={700} fontSize={w * 0.085} fill="#2A3654">
        {note}
      </text>
      <circle cx={w * 0.3} cy={h * 0.26} r={w * 0.07} fill="none" stroke="#C2453E" strokeWidth={2.5} opacity={0.75} />
    </g>
  );
};

/** Traditional Vietnamese ceramic tea set on a wooden tray (bộ ấm chén trà). */
export const TeaSet: React.FC<{ x: number; y: number; s?: number; steam?: number; f?: number }> = ({
  x,
  y,
  s = 1,
  steam = 1,
  f = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={88} ry={10} fill="#000" opacity={0.35} />
    {/* Wooden tray */}
    <polygon points="-82,0 82,0 70,-14 -70,-14" fill="#5A3C2E" stroke="#1E1614" strokeWidth={2.5} />
    <rect x={-82} y={-4} width={164} height={6} rx={2} fill="#7A523E" />
    {/* Teapot */}
    <g transform="translate(-26 -8)">
      <path d="M -22 -24 Q -36 -26 -32 -12 Q -28 -2 -18 -6" stroke="#E8E2D4" strokeWidth={5} fill="none" />
      <path d="M 20 -16 Q 34 -22 38 -32" stroke="#E8E2D4" strokeWidth={5} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={-16} rx={24} ry={16} fill="#E8E2D4" stroke="#241E1C" strokeWidth={2.5} />
      <path d="M -18 -14 Q 0 -22 18 -14" stroke="#3C5E8C" strokeWidth={2.5} fill="none" />
      <ellipse cx={0} cy={-31} rx={12} ry={4} fill="#E8E2D4" stroke="#241E1C" strokeWidth={2} />
      <circle cx={0} cy={-35} r={3.5} fill="#3C5E8C" />
    </g>
    {/* Three small teacups */}
    {[18, 42, 62].map((cx, i) => (
      <g key={i} transform={`translate(${cx} ${-7 - (i % 2) * 3})`}>
        <path d="M -9 -14 L 9 -14 L 7 0 L -7 0 Z" fill="#E8E2D4" stroke="#241E1C" strokeWidth={2} />
        <path d="M -8 -9 L 8 -9" stroke="#3C5E8C" strokeWidth={2} />
        <ellipse cx={0} cy={-14} rx={9} ry={2.5} fill="#8C9E6E" />
      </g>
    ))}
    {steam > 0 ? (
      <path
        d={`M 12 -44 q ${Math.sin(f / 7) * 5} -12 0 -24`}
        stroke="#FFF"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        opacity={0.35 * steam}
      />
    ) : null}
  </g>
);

/** Vietnamese drip coffee (cà phê phin nhôm trên ly thủy tinh sữa đặc). */
export const PhinCoffee: React.FC<{ x: number; y: number; s?: number; drip?: number; f?: number }> = ({
  x,
  y,
  s = 1,
  drip = 1,
  f = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={3} rx={28} ry={6} fill="#000" opacity={0.32} />
    {/* Glass cup with condensed milk layer and dark coffee */}
    <path d="M -18 -46 L 18 -46 L 14 0 L -14 0 Z" fill="#D8E6EE" opacity={0.75} stroke="#242028" strokeWidth={2.5} />
    <path d="M -14.5 -10 L 14.5 -10 L 13.5 -1 L -13.5 -1 Z" fill="#F6EFE0" />
    <path d="M -16 -28 L 16 -28 L 14.5 -10 L -14.5 -10 Z" fill="#3A2218" />
    {/* Falling coffee drop */}
    {drip > 0 ? <circle cx={0} cy={-42 + ((f * 1.4) % 14)} r={2.2} fill="#3A2218" /> : null}
    {/* Aluminum phin filter */}
    <ellipse cx={0} cy={-47} rx={26} ry={4} fill="#B8C2CC" stroke="#242028" strokeWidth={2} />
    <rect x={-17} y={-78} width={34} height={31} rx={2} fill="#C8D2DC" stroke="#242028" strokeWidth={2.2} />
    <rect x={4} y={-77} width={12} height={29} fill="#8E99A4" opacity={0.5} />
    <ellipse cx={0} cy={-79} rx={19} ry={3.5} fill="#D8E0E8" stroke="#242028" strokeWidth={2} />
    <circle cx={0} cy={-83} r={3.5} fill="#B8C2CC" stroke="#242028" strokeWidth={2} />
  </g>
);

/** Vietnamese half-face motorbike helmet (mũ bảo hiểm nửa đầu có kính/lưỡi trai). */
export const Helmet: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string }> = ({
  x,
  y,
  s = 1,
  rot = 0,
  color = '#3C5E8C',
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={4} cy={5} rx={68} ry={10} fill="#000" opacity={0.35} />
    <path d="M -60 0 Q -64 -68 0 -72 Q 64 -68 60 0 Z" fill={color} stroke="#1A1620" strokeWidth={4} strokeLinejoin="round" />
    <path d="M 18 -68 Q 58 -58 60 0 L 28 0 Q 36 -44 18 -68 Z" fill="#000" opacity={0.22} />
    <rect x={-58} y={-22} width={116} height={10} fill="#E9C46A" opacity={0.85} />
    {/* Front visor brim */}
    <path d="M 38 -18 L 76 -8 L 62 2 L -62 2 L -62 -6 L 38 -6 Z" fill="#1E1C26" />
    {/* Chin strap hanging */}
    <path d="M -22 2 L -10 28 L 8 28 L 18 2" stroke="#2A2632" strokeWidth={5} fill="none" strokeLinejoin="round" />
    <rect x={-6} y={24} width={12} height={8} rx={2} fill="#C9583A" />
    <path d="M -44 -46 Q -28 -62 -6 -64" stroke="#FFF" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.45} />
  </g>
);

/** Metal repair toolbox (hộp đồ nghề cơ khí / sửa điện). */
export const ToolBox: React.FC<{ x: number; y: number; s?: number; open?: boolean; color?: string }> = ({
  x,
  y,
  s = 1,
  open = false,
  color = '#B84A3C',
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={6} cy={4} rx={96} ry={12} fill="#000" opacity={0.36} />
    <rect x={-86} y={-68} width={172} height={68} rx={6} fill={color} stroke="#1A1620" strokeWidth={4} />
    <rect x={34} y={-68} width={52} height={68} rx={4} fill="#000" opacity={0.22} />
    {open ? (
      <g>
        {/* Tools sticking out */}
        <path d="M -48 -68 L -64 -102" stroke="#8E99A4" strokeWidth={8} strokeLinecap="round" />
        <circle cx={-66} cy={-106} r={10} fill="none" stroke="#8E99A4" strokeWidth={5} />
        <path d="M 12 -68 L 28 -106" stroke="#E9C46A" strokeWidth={9} strokeLinecap="round" />
      </g>
    ) : null}
    <path d="M -88 -46 L 88 -46" stroke="#1A1620" strokeWidth={3.5} />
    <rect x={-14} y={-54} width={28} height={16} rx={3} fill="#D8D2C5" stroke="#1A1620" strokeWidth={2.5} />
    <path d="M -30 -68 L -24 -84 L 24 -84 L 30 -68" stroke="#1A1620" strokeWidth={6} fill="none" strokeLinejoin="round" />
  </g>
);
