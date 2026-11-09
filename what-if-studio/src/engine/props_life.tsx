import React from 'react';
import { FONT } from './fonts';
import { Look } from './rig';

// Everyday props of a worker's, student's, and family's life, drawn in the studio's layered style
// (darker shade away from the light, warm rim on the lit edge, grounded contact shadow).

const INK = '#1A1410';
const RIM = '#FFB46A';

/** A big arm coming in from the edge of frame ending in a hand: for macro shots. (x, y) is the wrist, `ang` the way it points (deg, 0 = down). */
export const ArmIn: React.FC<{
  x: number;
  y: number;
  ang?: number;
  look: Look;
  len?: number;
  k?: number;
  fist?: number;
  bend?: number;
}> = ({ x, y, ang = 0, look, len = 700, k = 4.2, fist = 0, bend = 70 }) => {
  const d = `M 0 ${-len} L ${bend} ${-len * 0.42} L 0 -34`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${-ang})`} filter="url(#rimR)">
      <path d={d} stroke={look.line} strokeWidth={80} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={look.jacket} strokeWidth={66} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={`M ${-14} ${-len} L ${bend - 14} ${-len * 0.42} L -14 -34`}
        stroke={look.jacketShade}
        strokeWidth={22}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.5}
      />
      <rect x={-37} y={-48} width={74} height={24} rx={8} fill={look.jacketShade} stroke={look.line} strokeWidth={4} />
      <g transform={`scale(${k * 0.9})`}>
        <ellipse cx={11} cy={3} rx={5.5} ry={9} transform="rotate(-28 11 3)" fill={look.hand} stroke={look.line} strokeWidth={2.6} />
        <ellipse cx={0} cy={10} rx={11} ry={15 - fist * 3} fill={look.hand} stroke={look.line} strokeWidth={2.6} />
        <path d="M -4 17 L -4 23 M 3 18 L 3 24" stroke={look.line} strokeWidth={1.4} opacity={0.45} strokeLinecap="round" />
      </g>
    </g>
  );
};

/** A work boot in side view, caked in dust; `scuff` 0..1 adds cracks and cement splashes. x, y the middle of the sole. */
export const Boot: React.FC<{ x: number; y: number; s?: number; flip?: boolean; scuff?: number; lace?: number }> = ({
  x,
  y,
  s = 1,
  flip = false,
  scuff = 1,
  lace = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    {/* Multi-tier contact shadow: tight core contact + ambient falloff */}
    <ellipse cx={20} cy={38} rx={220} ry={24} fill="#000" opacity={0.14} />
    <ellipse cx={18} cy={35} rx={195} ry={14} fill="#000" opacity={0.32} />
    <ellipse cx={15} cy={33} rx={170} ry={6} fill="#000" opacity={0.65} />
    <path
      d="M -150 0 L -150 -70 Q -150 -110 -110 -118 L -60 -122 L -50 -240 Q -50 -262 -28 -262 L 60 -262 Q 82 -262 84 -240 L 90 -130 Q 150 -110 176 -56 Q 190 -30 184 0 Z"
      fill="#6E5A46"
      stroke="#3A2C22"
      strokeWidth={2.8}
      strokeLinejoin="round"
    />
    <path d="M 90 -130 Q 150 -110 176 -56 Q 190 -30 184 0 L 40 0 Q 70 -60 90 -130 Z" fill="#54443A" opacity={0.7} />
    <path d="M -150 -20 L 184 -20" stroke="#3A2C22" strokeWidth={2.5} opacity={0.5} />
    <path d="M -156 0 L 190 0 L 190 24 Q 190 34 178 34 L -142 34 Q -156 34 -156 22 Z" fill="#221C18" stroke="#14100E" strokeWidth={2.5} />
    <path d="M -150 14 L 184 14" stroke="#4A3F36" strokeWidth={2.5} />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <path d={`M -40 ${-232 + i * 38} L 60 ${-226 + i * 38}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <circle cx={-34} cy={-232 + i * 38} r={7} fill="#CFC4AE" stroke={INK} strokeWidth={3} />
        <circle cx={54} cy={-226 + i * 38} r={7} fill="#CFC4AE" stroke={INK} strokeWidth={3} />
      </g>
    ))}
    <path
      d={`M 20 -250 Q ${60 + lace * 30} -300 ${100 + lace * 40} -280`}
      stroke="#D9D0BE"
      strokeWidth={6}
      fill="none"
      strokeLinecap="round"
      opacity={lace > 0 ? 1 : 0}
    />
    <path d="M 100 -96 Q 150 -90 176 -56 Q 190 -30 184 -2 L 110 -2 Q 120 -50 100 -96 Z" fill="#B9AA92" opacity={0.55 * scuff} />
    <path d="M -150 -40 Q -120 -60 -60 -50 L -60 -2 L -150 -2 Z" fill="#B9AA92" opacity={0.5 * scuff} />
    {[
      [-90, -30, 14],
      [-30, -70, 10],
      [120, -50, 12],
      [150, -20, 8],
      [10, -110, 9],
    ].map(([cx, cy, r], i) => (
      <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 0.6} fill="#CFCAC0" opacity={0.85 * scuff} />
    ))}
    <path d="M 30 -120 Q 60 -100 100 -108" stroke={INK} strokeWidth={4} fill="none" opacity={0.55 * scuff} />
    <path d="M -148 -66 Q -110 -112 -56 -120" stroke={RIM} strokeWidth={3} fill="none" opacity={0.5} />
  </g>
);

/** A school/work backpack, side view, standing: x, y the middle of its base. `zip` 0..1 closes the flap, `books` shows spines. */
export const Backpack: React.FC<{
  x: number;
  y: number;
  s?: number;
  rot?: number;
  zip?: number;
  color?: string;
  books?: boolean;
}> = ({ x, y, s = 1, rot = 0, zip = 1, color = '#3C5E8C', books = true }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={6} cy={4} rx={120} ry={16} fill="#000" opacity={0.4} />
    <path
      d="M -100 0 Q -112 -120 -80 -230 Q -50 -270 0 -270 Q 50 -270 80 -230 Q 112 -120 100 0 Z"
      fill={color}
      stroke={INK}
      strokeWidth={6}
      strokeLinejoin="round"
    />
    <path d="M 40 -262 Q 80 -240 90 -200 Q 112 -110 100 0 L 52 0 Q 70 -120 40 -262 Z" fill="#000" opacity={0.28} />
    {books ? (
      <g opacity={1 - zip * 0.85}>
        {['#D9534F', '#E9C46A', '#8FB4D9'].map((c, i) => (
          <rect key={i} x={-56 + i * 38} y={-285 - i * 4} width={30} height={40} rx={4} fill={c} stroke={INK} strokeWidth={3} />
        ))}
      </g>
    ) : null}
    <path d="M -70 -216 Q -40 -250 0 -250 Q 40 -250 70 -216" stroke={INK} strokeWidth={4} fill="none" />
    <path d="M -64 -196 L 64 -196" stroke="#C9B48A" strokeWidth={5} strokeDasharray="6 6" opacity={0.9} />
    <rect x={-60} y={-176} width={120} height={80} rx={14} fill={color} stroke={INK} strokeWidth={5} />
    <rect x={-60} y={-176} width={120} height={80} rx={14} fill="#FFFFFF" opacity={0.08} />
    <path d="M -50 -150 L 50 -150" stroke="#C9B48A" strokeWidth={6} strokeLinecap="round" />
    <circle cx={50} cy={-150} r={7} fill="#C9B48A" stroke={INK} strokeWidth={3} />
    <path d="M -96 -216 Q -140 -150 -120 -50" stroke={INK} strokeWidth={26} fill="none" strokeLinecap="round" />
    <path d="M -96 -216 Q -140 -150 -120 -50" stroke="#2E4768" strokeWidth={18} fill="none" strokeLinecap="round" />
    <path d="M -80 -240 Q -40 -270 0 -270" stroke={RIM} strokeWidth={3} fill="none" opacity={0.6} />
  </g>
);

/** A bag of cement in side-on three-quarter view. */
export const CementBag: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={8} cy={4} rx={110} ry={13} fill="#000" opacity={0.4} />
    <path
      d="M -96 0 Q -104 -60 -92 -120 Q -88 -150 -60 -154 L 60 -154 Q 88 -150 92 -120 Q 104 -60 96 0 Z"
      fill="#B7B0A3"
      stroke={INK}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    <path d="M 40 -152 Q 88 -148 92 -120 Q 104 -60 96 0 L 50 0 Q 62 -70 40 -152 Z" fill="#8F897D" opacity={0.7} />
    <path d="M -80 -148 Q 0 -166 80 -148" stroke={INK} strokeWidth={4} fill="none" />
    <rect x={-60} y={-112} width={120} height={50} rx={6} fill="#D9534F" />
    <text x={0} y={-76} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={32} fill="#F6EFE3">
      XI MĂNG
    </text>
    <path d="M -90 -10 Q -40 -26 20 -12 Q 60 -4 94 -14" stroke="#CFC8BA" strokeWidth={8} fill="none" opacity={0.6} strokeLinecap="round" />
    <path d="M -88 -118 Q -60 -148 -20 -152" stroke={RIM} strokeWidth={3} fill="none" opacity={0.5} />
  </g>
);

/** A one-wheel barrow with a load of bricks (`load` 0..1). x, y the middle of its ground contact. `tilt` lifts the handles. */
export const Wheelbarrow: React.FC<{
  x: number;
  y: number;
  s?: number;
  load?: number;
  flip?: boolean;
  tilt?: number;
}> = ({ x, y, s = 1, load = 1, flip = false, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <ellipse cx={0} cy={4} rx={150} ry={12} fill="#000" opacity={0.4} />
    <g transform={`rotate(${tilt} 90 -30)`}>
      <path d="M -150 -90 L -110 -40 L 100 -40 L 130 -96 Z" fill="#C2553E" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 40 -92 L 100 -42 L 128 -94 Z" fill="#8E3B2C" opacity={0.7} />
      {Array.from({ length: Math.round(6 * load) }).map((_, i) => (
        <rect
          key={i}
          x={-120 + (i % 3) * 56}
          y={-130 - Math.floor(i / 3) * 28}
          width={52}
          height={26}
          rx={3}
          fill={i % 2 ? '#B8654A' : '#C97A58'}
          stroke={INK}
          strokeWidth={3}
        />
      ))}
      <path d="M -150 -90 L -230 -150 M -110 -40 L -230 -126" stroke="#6A4A3A" strokeWidth={12} strokeLinecap="round" />
    </g>
    <path d="M 100 -40 L 140 -2" stroke={INK} strokeWidth={9} strokeLinecap="round" />
    <circle cx={150} cy={-28} r={34} fill="#1E1B24" stroke={INK} strokeWidth={5} />
    <circle cx={150} cy={-28} r={14} fill="#8E8A98" />
    <path d="M -90 -40 L -110 -2 M -60 -40 L -40 -2" stroke={INK} strokeWidth={8} strokeLinecap="round" />
  </g>
);

/** A stack of red bricks, n rows of cols. */
export const BrickStack: React.FC<{ x: number; y: number; rows?: number; s?: number; cols?: number }> = ({
  x,
  y,
  rows = 4,
  s = 1,
  cols = 4,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={cols * 34} ry={10} fill="#000" opacity={0.4} />
    {Array.from({ length: rows }).map((_, r) =>
      Array.from({ length: cols }).map((__, c) => (
        <rect
          key={`${r}-${c}`}
          x={-cols * 30 + c * 60 + (r % 2 ? 30 : 0)}
          y={-(r + 1) * 28}
          width={58}
          height={26}
          rx={2}
          fill={(r + c) % 3 === 0 ? '#B8654A' : '#C97A58'}
          stroke={INK}
          strokeWidth={3}
        />
      )),
    )}
  </g>
);

/** A hard hat prop; `rot` tilts it. */
export const HardHat: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string }> = ({
  x,
  y,
  s = 1,
  rot = 0,
  color = '#F2B33D',
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={4} cy={6} rx={120} ry={14} fill="#000" opacity={0.4} />
    <path d="M -100 0 Q -108 -110 0 -118 Q 108 -110 100 0 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 30 -114 Q 100 -100 100 0 L 52 0 Q 70 -70 30 -114 Z" fill="#000" opacity={0.2} />
    <path d="M -22 -118 L -22 0 M 22 -118 L 22 0" stroke={INK} strokeWidth={4} opacity={0.35} />
    <rect x={-124} y={-6} width={248} height={18} rx={9} fill={color} stroke={INK} strokeWidth={5} />
    <path d="M -76 -80 Q -60 -104 -30 -110" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.5} />
  </g>
);

/** Banknote stacks from above (Vietnamese-feel notes: green, blue, pink): n stacks of height h. */
export const Notes: React.FC<{ x: number; y: number; w?: number; rot?: number; h?: number; c?: number }> = ({
  x,
  y,
  w = 190,
  rot = 0,
  h = 3,
  c = 0,
}) => {
  const cols = [
    ['#8FB48A', '#6E9468'],
    ['#7FA3C4', '#5E86A8'],
    ['#D9A0A0', '#B88080'],
  ][c % 3];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + 8} y={-w * 0.25 + 10 + h} width={w} height={w * 0.5} fill="#000" opacity={0.35} />
      {Array.from({ length: h }).map((_, i) => (
        <rect key={i} x={-w / 2} y={-w * 0.25 - i * 3} width={w} height={w * 0.5} rx={3} fill={cols[i % 2]} stroke="#3A4A38" strokeWidth={2} />
      ))}
      <g transform={`translate(0 ${-(h - 1) * 3})`}>
        <rect x={-w / 2 + 10} y={-w * 0.25 + 10} width={w - 20} height={w * 0.5 - 20} rx={2} fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.5} />
        <circle cx={0} cy={0} r={w * 0.14} fill="none" stroke="#FFFFFF" strokeWidth={2.5} opacity={0.55} />
        <text x={-w / 2 + 22} y={-w * 0.25 + 34} fontFamily={FONT.ui} fontSize={w * 0.1} fill="#FFFFFF" opacity={0.6}>
          {c === 1 ? '20.000' : c === 2 ? '50.000' : '10.000'}
        </text>
      </g>
      <rect x={-w * 0.06} y={-w * 0.25 - h * 3} width={w * 0.12} height={w * 0.5 + 6} fill="#D9C9A0" opacity={0.9} />
    </g>
  );
};

/** The school's notice about fees, from above. `fold` 0..1 folds it in half, then in half again (a quarter). */
export const NoticeSheet: React.FC<{ x: number; y: number; w?: number; rot?: number; fold?: number }> = ({
  x,
  y,
  w = 340,
  rot = 0,
  fold = 0,
}) => {
  const h = w * 1.3;
  const f1 = Math.min(1, fold * 2);
  const f2 = Math.max(0, fold * 2 - 1);
  const hh = h * (1 - 0.5 * f1);
  const ww = w * (1 - 0.5 * f2);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-ww / 2 + 8} y={-hh / 2 + 10} width={ww} height={hh} fill="#000" opacity={0.35} />
      <rect x={-ww / 2} y={-hh / 2} width={ww} height={hh} fill="#F1EADA" />
      <rect x={-ww / 2} y={-hh / 2} width={ww} height={hh * 0.1} fill="#D9CFB8" opacity={fold < 0.5 ? 1 : 0} />
      {fold < 0.9 ? (
        <g opacity={1 - fold}>
          <text x={0} y={-hh / 2 + hh * 0.2} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={w * 0.075} fill="#8A2A2A">
            THÔNG BÁO
          </text>
          <text x={0} y={-hh / 2 + hh * 0.27} textAnchor="middle" fontFamily={FONT.ui} fontSize={w * 0.045} fill="#4A3A3A">
            nộp học phí học kỳ II
          </text>
          {Array.from({ length: 6 }).map((_, i) => (
            <path
              key={i}
              d={`M ${-ww / 2 + 28} ${-hh / 2 + hh * (0.36 + i * 0.07)} L ${ww / 2 - 28 - (i % 3) * 30} ${-hh / 2 + hh * (0.36 + i * 0.07)}`}
              stroke="#6A6A7A"
              strokeWidth={4}
              strokeLinecap="round"
            />
          ))}
          <circle cx={ww / 2 - 70} cy={hh / 2 - 70} r={34} fill="none" stroke="#C2453E" strokeWidth={5} opacity={0.85} />
        </g>
      ) : (
        <text x={0} y={6} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={w * 0.05} fill="#8A2A2A" opacity={0.7}>
          THÔNG BÁO
        </text>
      )}
      {fold > 0 ? <path d={`M ${-ww / 2} ${hh / 2 - 1} L ${ww / 2} ${hh / 2 - 1}`} stroke="#BFB49C" strokeWidth={3} /> : null}
    </g>
  );
};

/** A small paper envelope with a pay slip peeking out. */
export const Envelope: React.FC<{ x: number; y: number; w?: number; rot?: number; creased?: number }> = ({
  x,
  y,
  w = 280,
  rot = 0,
  creased = 1,
}) => {
  const h = w * 0.62;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + 8} y={-h / 2 + 10} width={w} height={h} fill="#000" opacity={0.35} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill="#E8DCBF" stroke="#B3A57F" strokeWidth={3} />
      <path d={`M ${-w / 2} ${-h / 2} L 0 ${h * 0.08} L ${w / 2} ${-h / 2}`} fill="#DACDA8" stroke="#B3A57F" strokeWidth={3} strokeLinejoin="round" />
      <path d={`M ${-w / 2} ${h / 2} L ${-w * 0.12} ${h * 0.02} M ${w / 2} ${h / 2} L ${w * 0.12} ${h * 0.02}`} stroke="#B3A57F" strokeWidth={3} />
      {creased > 0 ? (
        <path
          d={`M ${-w * 0.3} ${-h * 0.1} L ${-w * 0.1} ${h * 0.3} M ${w * 0.25} ${-h * 0.05} L ${w * 0.32} ${h * 0.3}`}
          stroke="#B3A57F"
          strokeWidth={2.5}
          opacity={0.8 * creased}
        />
      ) : null}
      <text x={0} y={h * 0.32} textAnchor="middle" fontFamily={FONT.hand} fontSize={w * 0.1} fill="#6A5A3A">
        Lương tháng 1
      </text>
    </g>
  );
};

/** A metal lunch box (cơm hộp), from a three-quarter top view: lid up or off. */
export const Lunchbox: React.FC<{ x: number; y: number; s?: number; open?: number; steam?: number; f?: number }> = ({
  x,
  y,
  s = 1,
  open = 1,
  steam = 1,
  f = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={10} cy={36} rx={230} ry={30} fill="#000" opacity={0.4} />
    <path d="M -210 0 L 210 0 L 190 70 L -190 70 Z" fill="#9AA3AB" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 60 0 L 210 0 L 190 70 L 40 70 Z" fill="#7A838B" opacity={0.7} />
    <ellipse cx={0} cy={-6} rx={206} ry={52} fill="#C8CFD6" stroke={INK} strokeWidth={5} />
    <ellipse cx={0} cy={-2} rx={184} ry={42} fill="#E8E2D4" />
    {open > 0 ? (
      <g opacity={open}>
        <ellipse cx={-60} cy={-4} rx={104} ry={30} fill="#F6F2E8" />
        {Array.from({ length: 14 }).map((_, i) => (
          <ellipse key={i} cx={-130 + i * 14} cy={-16 + Math.sin(i * 1.7) * 10} rx={5} ry={2.4} fill="#E2DCCB" />
        ))}
        <ellipse cx={92} cy={-6} rx={58} ry={22} fill="#F8F6F0" />
        <circle cx={96} cy={-8} r={14} fill="#F0B43A" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M ${40 + i * 12} 10 q 18 -6 34 0`} stroke="#5E9A4E" strokeWidth={5} fill="none" strokeLinecap="round" />
        ))}
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M ${-100 + i * 70} ${-40} q ${10 + Math.sin((f + i * 11) / 9) * 8} -40 0 -80`}
            stroke="#FFFFFF"
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
            opacity={0.28 * steam}
          />
        ))}
      </g>
    ) : null}
    <path d="M -206 -6 Q 0 -66 206 -6" stroke={RIM} strokeWidth={3} fill="none" opacity={0.5} />
  </g>
);

/** A tape measure: a yellow case with a blade running out to the right by `ext`. */
export const TapeMeasure: React.FC<{ x: number; y: number; s?: number; ext?: number; rot?: number }> = ({
  x,
  y,
  s = 1,
  ext = 300,
  rot = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={8} cy={52} rx={90} ry={12} fill="#000" opacity={0.4} />
    {ext > 0 ? (
      <g>
        <rect x={60} y={14} width={ext} height={26} fill="#F2E7B8" stroke={INK} strokeWidth={4} />
        {Array.from({ length: Math.floor(ext / 14) }).map((_, i) => (
          <path
            key={i}
            d={`M ${70 + i * 14} 14 L ${70 + i * 14} ${i % 5 === 0 ? 34 : 24}`}
            stroke={INK}
            strokeWidth={i % 5 === 0 ? 3 : 2}
          />
        ))}
        <rect x={60 + ext} y={10} width={10} height={34} fill="#B8BEC4" stroke={INK} strokeWidth={3} />
      </g>
    ) : null}
    <rect x={-70} y={-52} width={140} height={110} rx={26} fill="#F2B33D" stroke={INK} strokeWidth={6} />
    <rect x={-70} y={-52} width={50} height={110} rx={26} fill="#FFFFFF" opacity={0.12} />
    <circle cx={-6} cy={-2} r={26} fill="#2A2420" opacity={0.85} />
    <rect x={40} y={-26} width={30} height={66} rx={8} fill="#2A2420" opacity={0.6} />
  </g>
);

/** The practical-training board of the electrical workshop: a switch, a lamp holder with a bulb (`on` 0..1), wires. */
export const BulbBoard: React.FC<{
  x: number;
  y: number;
  w?: number;
  on?: number;
  wired?: number;
  sw?: number;
  f?: number;
}> = ({ x, y, w = 520, on = 0, wired = 1, sw = 0, f = 0 }) => {
  const h = w * 0.72;
  const flick = on > 0 ? 0.88 + 0.12 * Math.sin(f * 1.7) : 0;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} fill="#000" opacity={0.35} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#8A6A44" stroke={INK} strokeWidth={6} />
      <rect x={-w / 2} y={-h / 2} width={w * 0.08} height={h} fill="#FFFFFF" opacity={0.08} />
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([a, b], i) => (
        <circle key={i} cx={a * (w / 2 - 22)} cy={b * (h / 2 - 22)} r={8} fill="#CFC8BA" stroke={INK} strokeWidth={3} />
      ))}
      <rect x={-w * 0.3 - 30} y={-h * 0.12} width={60} height={50} rx={8} fill="#D9D0BE" stroke={INK} strokeWidth={4} />
      <ellipse
        cx={-w * 0.3}
        cy={-h * 0.12 - 36}
        rx={50}
        ry={54}
        fill={on > 0 ? '#FFE9A8' : '#C9D4DC'}
        opacity={on > 0 ? 1 : 0.8}
        stroke={INK}
        strokeWidth={4}
      />
      {on > 0 ? (
        <circle cx={-w * 0.3} cy={-h * 0.12 - 36} r={w * 0.5} fill="url(#g3warm)" opacity={0.7 * on * flick} style={{ mixBlendMode: 'screen' }} />
      ) : null}
      <path
        d={`M ${-w * 0.3 - 16} ${-h * 0.12 - 18} L ${-w * 0.3 - 8} ${-h * 0.12 - 36} L ${-w * 0.3} ${-h * 0.12 - 18} L ${-w * 0.3 + 8} ${-h * 0.12 - 36} L ${-w * 0.3 + 16} ${-h * 0.12 - 18}`}
        stroke={on > 0 ? '#F2A33D' : '#5A5A66'}
        strokeWidth={4}
        fill="none"
        strokeLinejoin="round"
      />
      <rect x={w * 0.14} y={-h * 0.2} width={90} height={120} rx={10} fill="#E8E2D4" stroke={INK} strokeWidth={4} />
      <rect x={w * 0.14 + 28} y={-h * 0.2 + 20 + (1 - sw) * 34} width={34} height={46} rx={6} fill="#B8BEC4" stroke={INK} strokeWidth={3} />
      <path
        d={`M ${-w * 0.3} ${-h * 0.12 + 40} Q ${-w * 0.3} ${h * 0.2} ${-w * 0.05} ${h * 0.24} Q ${w * 0.1} ${h * 0.26} ${w * 0.18} ${-h * 0.1}`}
        stroke="#E2753A"
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${-w * 0.3 + 20} ${-h * 0.12 + 40} Q ${-w * 0.2} ${h * 0.34} ${w * 0.1} ${h * 0.36} Q ${w * 0.3} ${h * 0.36} ${w * 0.3} ${-h * 0.18}`}
        stroke="#4A86C8"
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={wired >= 1 ? '0' : '60 40'}
      />
      {wired < 1 ? <path d={`M ${w * 0.3} ${-h * 0.18} q 20 -40 54 -60`} stroke="#4A86C8" strokeWidth={9} fill="none" strokeLinecap="round" /> : null}
      <path d={`M ${w * 0.3} ${h * 0.3} L ${w * 0.3} ${h * 0.12}`} stroke="#5AA05A" strokeWidth={9} strokeLinecap="round" />
    </g>
  );
};

/** A graduation certificate, from above, with a red ribbon and a gold seal. */
export const Diploma: React.FC<{ x: number; y: number; w?: number; rot?: number }> = ({ x, y, w = 420, rot = 0 }) => {
  const h = w * 0.7;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} fill="#000" opacity={0.35} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#F4E9C9" />
      <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={h - 28} fill="none" stroke="#B88A3A" strokeWidth={4} />
      <text x={0} y={-h * 0.22} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={w * 0.08} fill="#8A2A2A">
        BẰNG TỐT NGHIỆP
      </text>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M ${-w * 0.3} ${-h * 0.04 + i * h * 0.1} L ${w * 0.3 - i * 30} ${-h * 0.04 + i * h * 0.1}`}
          stroke="#8A7A5A"
          strokeWidth={5}
          strokeLinecap="round"
        />
      ))}
      <circle cx={w * 0.3} cy={h * 0.26} r={w * 0.06} fill="#D9A93A" stroke="#8A6A1A" strokeWidth={3} />
      <path d={`M ${w * 0.28} ${h * 0.3} L ${w * 0.26} ${h * 0.44} L ${w * 0.3} ${h * 0.4} L ${w * 0.34} ${h * 0.44} L ${w * 0.32} ${h * 0.3}`} fill="#C2453E" />
    </g>
  );
};

/** A form for the vocational school (đơn học nghề) from above. */
export const FormSheet: React.FC<{ x: number; y: number; w?: number; rot?: number; filled?: number }> = ({
  x,
  y,
  w = 330,
  rot = 0,
  filled = 1,
}) => {
  const h = w * 1.35;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + 8} y={-h / 2 + 10} width={w} height={h} fill="#000" opacity={0.35} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#F4EEE0" />
      <text x={0} y={-h / 2 + h * 0.1} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={w * 0.066} fill="#2E4A6E">
        ĐƠN ĐĂNG KÝ HỌC NGHỀ
      </text>
      <text x={0} y={-h / 2 + h * 0.15} textAnchor="middle" fontFamily={FONT.ui} fontSize={w * 0.045} fill="#2E4A6E">
        Nghề: Điện dân dụng
      </text>
      {Array.from({ length: 7 }).map((_, i) => {
        const yy = -h / 2 + h * (0.24 + i * 0.09);
        return (
          <g key={i}>
            <path d={`M ${-w / 2 + 26} ${yy + 10} L ${w / 2 - 26} ${yy + 10}`} stroke="#B9C4D6" strokeWidth={2} />
            {filled * 7 > i ? (
              <path
                d={`M ${-w / 2 + 40} ${yy} q 40 -10 ${60 + (i % 3) * 40} 0 t 70 0`}
                stroke="#2E3F66"
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
              />
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

/** A notebook seen from above: closed with a title, or open with ruled pages. `pen` lays a pen across it. */
export const Notebook: React.FC<{
  x: number;
  y: number;
  w?: number;
  rot?: number;
  open?: boolean;
  cover?: string;
  title?: string;
  pen?: boolean;
  written?: number;
}> = ({ x, y, w = 300, rot = 0, open = false, cover = '#3C6E8C', title = 'VỞ', pen = false, written = 0 }) => {
  const h = w * 1.3;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-(open ? w : w / 2) + 10} y={-h / 2 + 12} width={open ? w * 2 : w} height={h} fill="#000" opacity={0.35} />
      {open ? (
        <g>
          <rect x={-w} y={-h / 2} width={w * 2} height={h} rx={6} fill={cover} />
          <rect x={-w + 12} y={-h / 2 + 10} width={w - 12} height={h - 20} fill="#F4EEE0" />
          <rect x={0} y={-h / 2 + 10} width={w - 12} height={h - 20} fill="#EDE5D2" />
          <path d={`M 0 ${-h / 2 + 10} L 0 ${h / 2 - 10}`} stroke="#BDB296" strokeWidth={4} />
          {Array.from({ length: 11 }).map((_, i) => (
            <g key={i}>
              <path d={`M ${-w + 30} ${-h / 2 + 60 + i * (h / 13)} L -20 ${-h / 2 + 60 + i * (h / 13)}`} stroke="#B9C4D6" strokeWidth={2.5} />
              <path d={`M 20 ${-h / 2 + 60 + i * (h / 13)} L ${w - 30} ${-h / 2 + 60 + i * (h / 13)}`} stroke="#B9C4D6" strokeWidth={2.5} />
              {written * 11 > i ? (
                <path
                  d={`M ${-w + 40} ${-h / 2 + 54 + i * (h / 13)} q 40 -10 ${80 + (i % 4) * 30} 0`}
                  stroke="#2E3F66"
                  strokeWidth={4}
                  fill="none"
                  strokeLinecap="round"
                />
              ) : null}
            </g>
          ))}
        </g>
      ) : (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill={cover} stroke={INK} strokeWidth={4} />
          <rect x={-w / 2} y={-h / 2} width={22} height={h} fill="#000" opacity={0.22} />
          <rect x={-w * 0.3} y={-h * 0.22} width={w * 0.6} height={h * 0.2} rx={6} fill="#F4EEE0" />
          <text x={0} y={-h * 0.22 + h * 0.14} textAnchor="middle" fontFamily={FONT.hand} fontWeight={700} fontSize={w * 0.14} fill="#2E3F66">
            {title}
          </text>
          <path d={`M ${-w / 2 + 4} ${-h / 2 + 4} L ${w / 2 - 4} ${-h / 2 + 4}`} stroke="#FFFFFF" strokeWidth={3} opacity={0.3} />
        </g>
      )}
      {pen ? (
        <g transform={`translate(${w * 0.2} ${h * 0.1}) rotate(-24)`}>
          <rect x={-120} y={-8} width={240} height={16} rx={8} fill="#F2B33D" stroke={INK} strokeWidth={3} />
          <path d="M 120 -8 L 150 0 L 120 8 Z" fill="#E8DCBF" stroke={INK} strokeWidth={2} />
          <rect x={-120} y={-8} width={40} height={16} rx={8} fill="#2E3F66" />
        </g>
      ) : null}
    </g>
  );
};

/** A small plastic bag of medicine (Bố's), side view: x, y the middle of the base. */
export const MedBag: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={8} cy={4} rx={100} ry={12} fill="#000" opacity={0.4} />
    <path
      d="M -80 0 Q -96 -80 -70 -150 L -40 -190 L 40 -190 L 70 -150 Q 96 -80 80 0 Z"
      fill="#E8EEF0"
      stroke="#7A8A92"
      strokeWidth={4}
      opacity={0.96}
      strokeLinejoin="round"
    />
    <path d="M -40 -190 Q -20 -230 0 -200 Q 20 -230 40 -190" stroke="#7A8A92" strokeWidth={8} fill="none" strokeLinecap="round" />
    <rect x={-48} y={-110} width={96} height={62} rx={6} fill="#FFFFFF" stroke="#C9D2D6" strokeWidth={2} />
    <rect x={-48} y={-110} width={96} height={16} fill="#3E8C86" />
    <path d="M -36 -78 L 36 -78 M -36 -62 L 20 -62" stroke="#8A9AA2" strokeWidth={3} />
    {[
      [-30, -30, '#D9534F'],
      [-4, -22, '#F2B33D'],
      [24, -30, '#FFFFFF'],
    ].map(([cx, cy, c], i) => (
      <ellipse key={i} cx={cx as number} cy={cy as number} rx={11} ry={7} fill={c as string} stroke="#8A9AA2" strokeWidth={2} />
    ))}
    <path d="M -74 -130 Q -84 -80 -72 -20" stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={0.6} strokeLinecap="round" />
  </g>
);

/** A canvas tote bag (Mẹ's) seen from the side, with its strap. */
export const Tote: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string }> = ({
  x,
  y,
  s = 1,
  rot = 0,
  color = '#B9A27A',
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={8} cy={4} rx={110} ry={13} fill="#000" opacity={0.4} />
    <path
      d="M -80 -170 Q -90 -180 -66 -240 Q -20 -330 0 -240 M 80 -170 Q 90 -180 66 -240 Q 20 -330 0 -240"
      stroke={INK}
      strokeWidth={22}
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M -80 -170 Q -90 -180 -66 -240 Q -20 -330 0 -240 M 80 -170 Q 90 -180 66 -240 Q 20 -330 0 -240"
      stroke="#8A6A44"
      strokeWidth={14}
      fill="none"
      strokeLinecap="round"
    />
    <path d="M -100 0 L -86 -170 L 86 -170 L 100 0 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 40 -170 L 86 -170 L 100 0 L 50 0 Z" fill="#000" opacity={0.2} />
    <text x={0} y={-80} textAnchor="middle" fontFamily={FONT.hand} fontWeight={700} fontSize={34} fill="#6A4A3A">
      Chợ Mới
    </text>
  </g>
);

/** A bowl of rice with chopsticks laid across it; `steam` curls up. */
export const Bowl: React.FC<{ x: number; y: number; s?: number; steam?: number; f?: number; full?: number }> = ({
  x,
  y,
  s = 1,
  steam = 1,
  f = 0,
  full = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={6} cy={6} rx={96} ry={14} fill="#000" opacity={0.4} />
    <path d="M -90 -70 Q -80 0 -30 4 L 30 4 Q 80 0 90 -70 Z" fill="#EDE6D6" stroke={INK} strokeWidth={4} />
    <path d="M 30 -70 Q 80 -64 90 -70 Q 80 0 30 4 Z" fill="#CFC6B2" opacity={0.7} />
    <path d="M -50 4 L -40 22 L 40 22 L 50 4" fill="#D8D0BC" stroke={INK} strokeWidth={4} />
    <ellipse cx={0} cy={-70} rx={90} ry={16} fill="#F6F2E8" stroke={INK} strokeWidth={4} />
    {full > 0 ? <path d={`M -80 -72 Q 0 ${-72 - 44 * full} 80 -72 Z`} fill="#FBF8F0" /> : null}
    {full > 0
      ? Array.from({ length: 10 }).map((_, i) => (
          <ellipse key={i} cx={-60 + i * 13} cy={-80 - Math.sin(i * 1.5) * 8 * full} rx={5} ry={2.4} fill="#E2DCCB" />
        ))
      : null}
    <path d="M -30 -30 Q 0 -50 30 -30" stroke="#C2553E" strokeWidth={4} fill="none" opacity={0.7} />
    <path d="M -70 -120 L 90 -62" stroke="#8A5A3A" strokeWidth={6} strokeLinecap="round" />
    <path d="M -56 -128 L 104 -70" stroke="#A06A44" strokeWidth={6} strokeLinecap="round" />
    {[0, 1].map((i) => (
      <path
        key={i}
        d={`M ${-26 + i * 44} ${-100} q ${12 + Math.sin((f + i * 13) / 8) * 8} -34 0 -70`}
        stroke="#FFFFFF"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        opacity={0.3 * steam}
      />
    ))}
  </g>
);

/** A class photo in a frame: rows of tiny students on a school step; `gap` leaves the empty place beside the window. */
export const ClassPhoto: React.FC<{ x: number; y: number; w?: number; rot?: number; gap?: number; glow?: number }> = ({
  x,
  y,
  w = 760,
  rot = 0,
  gap = 1,
  glow = 0,
}) => {
  const h = w * 0.62;
  const heads: React.ReactNode[] = [];
  const skins = ['#F0DCC2', '#E2BE98', '#D2A27C', '#F4E6D0'];
  const hairs = ['#1D2033', '#3A2620', '#2A1C18', '#5A3226'];
  [0, 1, 2].forEach((row) => {
    const n = 8 - row;
    for (let i = 0; i < n; i++) {
      const px = -w / 2 + w * 0.1 + (i + 0.5) * ((w * 0.8) / n) + (row === 1 ? 6 : 0);
      const py = -h / 2 + h * (0.34 + row * 0.22);
      const isGap = row === 1 && i === 0 && gap > 0;
      heads.push(
        <g key={`${row}-${i}`}>
          {isGap ? (
            <g>
              <ellipse cx={px} cy={py + 22} rx={22} ry={44} fill="#2A2C3A" opacity={0.35 * gap} />
              <circle cx={px} cy={py} r={20} fill="none" stroke="#FFE2B0" strokeWidth={3} strokeDasharray="5 5" opacity={0.9 * gap} />
            </g>
          ) : (
            <g>
              <path
                d={`M ${px - 22} ${py + 62} Q ${px - 22} ${py + 20} ${px} ${py + 18} Q ${px + 22} ${py + 20} ${px + 22} ${py + 62} Z`}
                fill={(i + row) % 3 === 0 ? '#E8E2D4' : '#F4F1EA'}
              />
              <circle cx={px} cy={py} r={19} fill={skins[(i + row * 2) % 4]} />
              <path
                d={`M ${px - 19} ${py - 2} Q ${px - 18} ${py - 22} ${px} ${py - 22} Q ${px + 18} ${py - 22} ${px + 19} ${py - 2} Q ${px + 6} ${py - 12} ${px - 19} ${py - 2} Z`}
                fill={hairs[(i * 3 + row) % 4]}
              />
            </g>
          )}
        </g>,
      );
    }
  });
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + 14} y={-h / 2 + 18} width={w} height={h} fill="#000" opacity={0.4} />
      <rect x={-w / 2 - 22} y={-h / 2 - 22} width={w + 44} height={h + 44} fill="#4A3A34" stroke={INK} strokeWidth={5} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#8FA8B8" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.45} fill="#B7C9D4" />
      <rect x={-w / 2} y={h * 0.18} width={w} height={h * 0.32} fill="#7A8A6A" />
      <rect x={-w / 2} y={-h / 2} width={w * 0.2} height={h} fill="#E9D6A8" opacity={0.28 + glow * 0.3} />
      {heads}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={0.12} />
    </g>
  );
};

/**
 * A phone seen full-frame (macro of the screen). `msgs` are chat bubbles, newest last; `typing` is the draft in the
 * input bar; `avatar` draws the uniform photo as the profile picture.
 */
export const ChatScreen: React.FC<{
  x: number;
  y: number;
  w?: number;
  rot?: number;
  msgs?: { who: 'a' | 'b' | 'me'; text: string }[];
  typing?: string;
  avatar?: boolean;
  title?: string;
  bright?: number;
  caret?: boolean;
  glow?: number;
}> = ({ x, y, w = 600, rot = 0, msgs = [], typing = '', avatar = true, title = 'Lớp 12A3 ❤', bright = 1, caret = true, glow = 1 }) => {
  const h = w * 2.05;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + 14} y={-h / 2 + 20} width={w} height={h} rx={w * 0.12} fill="#000" opacity={0.4} />
      {glow > 0 ? <circle cx={0} cy={0} r={w * 1.3} fill="url(#g3cool)" opacity={0.5 * glow} style={{ mixBlendMode: 'screen' }} /> : null}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.12} fill="#16151C" stroke="#3A3846" strokeWidth={6} />
      <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={h - 28} rx={w * 0.09} fill="#EDEFF3" opacity={bright} />
      <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={w * 0.2} rx={w * 0.09} fill="#3E5C8A" opacity={bright} />
      <rect x={-w / 2 + 14} y={-h / 2 + 14 + w * 0.1} width={w - 28} height={w * 0.1} fill="#3E5C8A" opacity={bright} />
      <circle cx={-w / 2 + 70} cy={-h / 2 + 14 + w * 0.1} r={w * 0.065} fill="#F4EEE0" />
      <text x={-w / 2 + 70 + w * 0.1} y={-h / 2 + 14 + w * 0.125} fontFamily={FONT.ui} fontWeight={700} fontSize={w * 0.058} fill="#F6EFE3">
        {title}
      </text>
      {(() => {
        const MAX = 22;
        let by = -h / 2 + 14 + w * 0.3;
        return msgs.map((m, i) => {
          const mine = m.who === 'me';
          let lines = [m.text];
          if (m.text.length > MAX) {
            const mid = m.text.length / 2;
            let cut = m.text.indexOf(' ');
            for (let k = 0; k < m.text.length; k++) if (m.text[k] === ' ' && Math.abs(k - mid) < Math.abs(cut - mid)) cut = k;
            lines = [m.text.slice(0, cut), m.text.slice(cut + 1)];
          }
          const longest = Math.max(...lines.map((l) => l.length));
          const bw = Math.min(w * 0.8, w * 0.07 + longest * w * 0.031);
          const bh = w * 0.08 + lines.length * w * 0.062;
          const bx = mine ? w / 2 - 30 - bw : -w / 2 + 30 + w * 0.12;
          const y0 = by;
          by += bh + w * 0.06;
          return (
            <g key={i}>
              {!mine ? <circle cx={-w / 2 + 52} cy={y0 + w * 0.07} r={w * 0.045} fill={m.who === 'a' ? '#D2A27C' : '#E2BE98'} /> : null}
              <rect
                x={bx}
                y={y0}
                width={bw}
                height={bh}
                rx={w * 0.05}
                fill={mine ? '#3E8C86' : '#FFFFFF'}
                stroke={mine ? 'none' : '#D5D8DE'}
                strokeWidth={2}
              />
              {lines.map((l, j) => (
                <text key={j} x={bx + w * 0.035} y={y0 + w * 0.088 + j * w * 0.062} fontFamily={FONT.ui} fontSize={w * 0.05} fill={mine ? '#F6EFE3' : '#2A2C3A'}>
                  {l}
                </text>
              ))}
            </g>
          );
        });
      })()}
      <rect x={-w / 2 + 28} y={h / 2 - 14 - w * 0.2} width={w - 56} height={w * 0.13} rx={w * 0.065} fill="#FFFFFF" stroke="#C9CDD6" strokeWidth={2} />
      <text x={-w / 2 + 28 + w * 0.04} y={h / 2 - 14 - w * 0.2 + w * 0.088} fontFamily={FONT.ui} fontSize={w * 0.056} fill="#2A2C3A">
        {typing}
        {caret ? '|' : ''}
      </text>
      {avatar ? (
        <g transform={`translate(${w * 0.28} ${-h / 2 + 14 + w * 0.1})`}>
          <circle r={w * 0.07} fill="#F4EEE0" />
          <circle cy={-w * 0.012} r={w * 0.03} fill="#F0DCC2" />
          <path d={`M ${-w * 0.05} ${w * 0.05} Q 0 0 ${w * 0.05} ${w * 0.05} Z`} fill="#FFFFFF" />
        </g>
      ) : null}
    </g>
  );
};

/** A canvas school bag strap running along the frame, for match cuts. */
export const Strap: React.FC<{ x0: number; y0: number; x1: number; y1: number; w?: number; color?: string }> = ({
  x0,
  y0,
  x1,
  y1,
  w = 90,
  color = '#2E4768',
}) => (
  <g>
    <path d={`M ${x0} ${y0} L ${x1} ${y1}`} stroke={INK} strokeWidth={w + 10} strokeLinecap="round" />
    <path d={`M ${x0} ${y0} L ${x1} ${y1}`} stroke={color} strokeWidth={w} strokeLinecap="round" />
    <path d={`M ${x0} ${y0 - w * 0.3} L ${x1} ${y1 - w * 0.3}`} stroke="#FFFFFF" strokeWidth={4} opacity={0.18} />
    <path d={`M ${x0} ${y0} L ${x1} ${y1}`} stroke="#000" strokeWidth={4} strokeDasharray="14 10" opacity={0.25} />
  </g>
);
