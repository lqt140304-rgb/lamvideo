import React from 'react';

/**
 * The studio's standard close-up hands for insert and macro shots where a hand fills the frame.
 * Drawn at wrist (0, 0), fingers pointing down the +y axis, about 160 wide and 300 long at s = 1; place them with x, y, rot, s.
 * Includes knuckle creases, subtle nail highlights, and palm shading for depth.
 */

const LINE = '#16141C';

/** Fingers side by side: outlines first, then the fills, plus subtle knuckle creases and nail highlights. */
export const Digits: React.FC<{ d: string[]; w: number; skin: string; nails?: boolean }> = ({ d, w, skin, nails = false }) => (
  <g fill="none" strokeLinecap="round">
    {d.map((p) => (
      <path key={`o-${p}`} d={p} stroke={LINE} strokeWidth={w + 11} />
    ))}
    {d.map((p) => (
      <path key={`f-${p}`} d={p} stroke={skin} strokeWidth={w} />
    ))}
    {d.map((p) => (
      <path key={`s-${p}`} d={p} stroke="#000" strokeWidth={w * 0.25} opacity={0.07} />
    ))}
    {nails
      ? d.map((p, idx) => {
          const parts = p.trim().split(/\s+/);
          const ex = parseFloat(parts[parts.length - 2]);
          const ey = parseFloat(parts[parts.length - 1]);
          if (Number.isNaN(ex) || Number.isNaN(ey)) return null;
          return <ellipse key={`n-${idx}`} cx={ex} cy={ey - 4} rx={w * 0.28} ry={w * 0.34} fill="#FFF7F0" opacity={0.45} />;
        })
      : null}
  </g>
);

/** A relaxed open hand. The wrist end should go inside a cuff or sleeve drawn after it, so no gap shows. */
export const OpenHand: React.FC<{ x?: number; y?: number; rot?: number; s?: number; skin: string; flip?: boolean }> = ({
  x = 0,
  y = 0,
  rot = 0,
  s = 1,
  skin,
  flip = false,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
    <Digits
      d={[
        'M -64 180 Q -70 230 -66 276',
        'M -24 188 Q -26 250 -24 308',
        'M 16 188 Q 18 246 18 300',
        'M 54 178 Q 56 224 54 262',
      ]}
      w={32}
      skin={skin}
      nails
    />
    <Digits d={['M -66 90 Q -122 140 -108 216']} w={36} skin={skin} nails />
    <rect x={-80} y={0} width={152} height={190} rx={26} fill={skin} />
    {/* Dorsal / palm shading & knuckle creases */}
    <path d="M 24 0 L 72 0 L 72 182 Q 44 186 24 170 Z" fill="#000" opacity={0.1} />
    <path d="M -56 172 Q -24 180 48 168" stroke="#000" strokeWidth={3.5} fill="none" opacity={0.18} strokeLinecap="round" />
    <path d="M -42 96 Q -4 114 38 92" stroke="#000" strokeWidth={3} fill="none" opacity={0.14} strokeLinecap="round" />
    {/* Knuckle dimples */}
    {[-58, -22, 16, 50].map((kx) => (
      <ellipse key={kx} cx={kx} cy={172} rx={6} ry={3.5} fill="#000" opacity={0.12} />
    ))}
    <path d="M -80 0 L -80 74 M -80 146 L -80 190 M 72 0 L 72 190" stroke={LINE} strokeWidth={5.5} fill="none" strokeLinecap="round" />
  </g>
);

/** An open hand that comes in from outside the frame: the hand plus its forearm and a sleeve, so it is never a hand floating alone. */
export const ArmHand: React.FC<{
  x?: number;
  y?: number;
  rot?: number;
  s?: number;
  skin: string;
  sleeve?: string;
  len?: number;
  flip?: boolean;
}> = ({ x = 0, y = 0, rot = 0, s = 1, skin, sleeve = '#4A5A6A', len = 1500, flip = false }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
    <polygon points="-80,0 -70,-260 62,-260 72,0" fill={skin} />
    <polygon points="18,0 14,-260 62,-260 72,0" fill="#000" opacity={0.12} />
    <path d="M -80 0 L -70 -260 M 72 0 L 62 -260" stroke={LINE} strokeWidth={5.5} fill="none" />
    <rect x={-92} y={-len} width={176} height={len - 230} rx={22} fill={sleeve} stroke={LINE} strokeWidth={6} />
    <rect x={24} y={-len} width={60} height={len - 230} rx={18} fill="#000" opacity={0.18} />
    <rect x={-92} y={-254} width={176} height={28} rx={9} fill="#000" opacity={0.2} />
    <path d="M -86 -232 L 78 -232" stroke="#FFF" strokeWidth={2.5} opacity={0.22} />
    <OpenHand skin={skin} />
  </g>
);

/**
 * A hand closed over an edge, seen from the back: four fingers lie over the thing it holds.
 * Draw GripThumb before that thing and GripHand after it.
 * The fingers point +x from the knuckles at about (20, -40); the wrist is at (-260, 220).
 */
export const GripThumb: React.FC<{ skin: string }> = ({ skin }) => (
  <g>
    <Digits d={['M -130 140 Q -70 148 18 104']} w={40} skin={skin} nails />
    <ellipse cx={-56} cy={144} rx={6} ry={3.5} fill="#FFF" opacity={0.2} />
  </g>
);
const GRIP_FINGERS = [
  'M -78 -58 Q -10 -90 56 -84',
  'M -52 -20 Q 24 -48 92 -38',
  'M -28 18 Q 46 -6 110 8',
  'M -8 56 Q 50 42 98 54',
];
export const GripHand: React.FC<{ skin: string }> = ({ skin }) => (
  <g>
    {/* 1. Palm & wrist body drawn first so it sits BEHIND the wrapping fingers */}
    <path
      d="M -96 -74 L 10 70 L -130 190 L -200 280 L -300 220 L -230 110 Z"
      fill={skin}
      stroke={LINE}
      strokeWidth={5.5}
      strokeLinejoin="round"
    />
    <path d="M -40 10 L 10 70 L -130 190 L -165 150 Z" fill="#000" opacity={0.12} />
    {/* Knuckle crease line along the palm edge */}
    <path d="M -80 -60 L -6 58" stroke="#000" strokeWidth={3} opacity={0.18} strokeLinecap="round" />
    {/* 2. Four articulated fingers wrapping over the front of the held object */}
    <Digits d={GRIP_FINGERS} w={35} skin={skin} nails />
    {/* 3. Knuckle highlights & crease ticks on top of fingers */}
    {[
      [-74, -54],
      [-48, -18],
      [-24, 20],
      [-4, 56],
    ].map(([kx, ky], i) => (
      <circle key={i} cx={kx} cy={ky} r={5.5} fill="#FFF" opacity={0.25} />
    ))}
    {[
      [-70, -56, -76, -50],
      [-44, -20, -50, -14],
      [-20, 18, -26, 24],
      [0, 54, -6, 60],
    ].map(([x1, y1, x2, y2], i) => (
      <line key={`k${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" strokeWidth={2.2} opacity={0.28} strokeLinecap="round" />
    ))}
  </g>
);

/** Close-up pointing hand (index finger extended, other three curled) for pressing buttons, pointing at a line, or tapping a phone screen. */
export const PointHand: React.FC<{
  x?: number;
  y?: number;
  rot?: number;
  s?: number;
  skin: string;
  sleeve?: string;
  flip?: boolean;
}> = ({ x = 0, y = 0, rot = 0, s = 1, skin, sleeve, flip = false }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
    {sleeve ? (
      <g>
        <polygon points="-76,0 -66,-220 58,-220 68,0" fill={skin} stroke={LINE} strokeWidth={5.5} />
        <rect x={-88} y={-900} width={168} height={700} rx={20} fill={sleeve} stroke={LINE} strokeWidth={6} />
        <rect x={-88} y={-224} width={168} height={26} rx={8} fill="#000" opacity={0.2} />
      </g>
    ) : null}
    {/* Curled middle, ring, pinky fingers */}
    <Digits
      d={[
        'M -20 176 Q -18 220 -8 226',
        'M 18 174 Q 20 214 28 220',
        'M 52 166 Q 54 202 60 208',
      ]}
      w={32}
      skin={skin}
    />
    {/* Extended index finger */}
    <Digits d={['M -60 174 Q -64 252 -60 326']} w={33} skin={skin} nails />
    {/* Thumb tucked on side */}
    <Digits d={['M -66 92 Q -114 134 -94 196']} w={35} skin={skin} />
    <rect x={-78} y={0} width={148} height={182} rx={26} fill={skin} />
    <path d="M 22 0 L 70 0 L 70 176 L 22 176 Z" fill="#000" opacity={0.11} />
    <path d="M -78 0 L -78 76 M -78 142 L -78 182 M 70 0 L 70 182" stroke={LINE} strokeWidth={5.5} fill="none" strokeLinecap="round" />
    <path d="M -54 166 Q 0 176 52 162" stroke="#000" strokeWidth={3.5} fill="none" opacity={0.18} strokeLinecap="round" />
  </g>
);

/** Close-up pinching/writing hand holding a small object (coin, photo corner, pen, thread needle). Pinches at (0, 260). */
export const PinchHand: React.FC<{
  x?: number;
  y?: number;
  rot?: number;
  s?: number;
  skin: string;
  flip?: boolean;
}> = ({ x = 0, y = 0, rot = 0, s = 1, skin, flip = false }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
    <Digits
      d={[
        'M 10 172 Q 36 226 18 256',
        'M 42 164 Q 64 212 46 240',
      ]}
      w={30}
      skin={skin}
    />
    {/* Index and thumb meeting at (-16, 262) */}
    <Digits d={['M -46 168 Q -48 228 -16 262']} w={32} skin={skin} nails />
    <Digits d={['M -64 96 Q -96 188 -20 260']} w={35} skin={skin} nails />
    <rect x={-74} y={0} width={140} height={176} rx={26} fill={skin} />
    <path d="M -74 0 L -74 86 M 66 0 L 66 172" stroke={LINE} strokeWidth={5.5} fill="none" strokeLinecap="round" />
    <path d="M -42 160 Q 8 170 48 156" stroke="#000" strokeWidth={3.5} fill="none" opacity={0.18} strokeLinecap="round" />
  </g>
);
