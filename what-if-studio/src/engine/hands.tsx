import React from 'react';

/**
 * The studio's standard close-up hands (approved on cảnh 3, S16 and S25). Use these for any shot where a hand fills the frame.
 * Drawn at wrist (0, 0), fingers pointing down the +y axis, about 160 wide and 300 long at s = 1; place them with x, y, rot, s.
 */

const LINE = '#16141C';

/** Fingers side by side: outlines first, then the fills, so one silhouette with thin dark lines between the fingers. */
export const Digits: React.FC<{ d: string[]; w: number; skin: string }> = ({ d, w, skin }) => (
  <g fill="none" strokeLinecap="round">
    {d.map((p) => <path key={p} d={p} stroke={LINE} strokeWidth={w + 11} />)}
    {d.map((p) => <path key={p} d={p} stroke={skin} strokeWidth={w} />)}
  </g>
);

/** A relaxed open hand. The wrist end should go inside a cuff or sleeve drawn after it, so no gap shows. */
export const OpenHand: React.FC<{ x?: number; y?: number; rot?: number; s?: number; skin: string }> = ({ x = 0, y = 0, rot = 0, s = 1, skin }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <Digits d={['M -64 180 Q -70 230 -66 276', 'M -24 188 Q -26 250 -24 308', 'M 16 188 Q 18 246 18 300', 'M 54 178 Q 56 224 54 262']} w={32} skin={skin} />
    <Digits d={['M -66 90 Q -122 140 -108 216']} w={36} skin={skin} />
    <rect x={-80} y={0} width={152} height={190} fill={skin} />
    <path d="M -80 0 L -80 74 M -80 146 L -80 190 M 72 0 L 72 190" stroke={LINE} strokeWidth={5.5} fill="none" strokeLinecap="round" />
  </g>
);

/**
 * A hand closed over an edge, seen from the back: four fingers lie over the thing it holds. Draw GripThumb before that thing and GripHand after it.
 * The fingers point +x from the knuckles at about (20, -40); the wrist is at (-260, 220).
 */
export const GripThumb: React.FC<{ skin: string }> = ({ skin }) => <Digits d={['M -110 120 Q -60 140 10 100']} w={38} skin={skin} />;
const GRIP_FINGERS = ['M -78 -58 Q -10 -90 56 -84', 'M -52 -20 Q 24 -48 92 -38', 'M -28 18 Q 46 -6 110 8', 'M -8 56 Q 50 42 98 54'];
export const GripHand: React.FC<{ skin: string }> = ({ skin }) => (
  <g>
    <Digits d={GRIP_FINGERS} w={35} skin={skin} />
    <path d="M -96 -74 L 10 70 L -130 190 L -200 280 L -300 220 L -230 110 Z" fill={skin} stroke={LINE} strokeWidth={5.5} strokeLinejoin="round" />
    <g fill="none" strokeLinecap="round" stroke={skin} strokeWidth={35}>
      {GRIP_FINGERS.map((p) => <path key={p} d={p} />)}
    </g>
  </g>
);
