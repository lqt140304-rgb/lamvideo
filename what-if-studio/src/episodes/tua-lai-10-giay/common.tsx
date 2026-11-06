import React from 'react';
import { Pose, basePose, LEG_LEN, HEAD, LOOKS, camT, FONT, Glow, Hero, toWorld, joints } from '../../engine';

// Helpers shared by the shots of "Nếu ngày đó bạn không bỏ học?".

export const P = (o: Partial<Pose>): Pose => ({ ...basePose, ...o });
export const SITE_G = 830; // the ground line of the Site, Schoolyard
export const hipAt = (scale: number, ground = SITE_G) => ground - LEG_LEN * scale;

export const WK = LOOKS.workerHat; // the hero on site, hard hat on
export const WN = LOOKS.worker; // the hero, hat off
export const ST = LOOKS.student;
export const TE = LOOKS.tech;
export const MOM = LOOKS.mom;
export const MO = LOOKS.mo;
export const CHU = LOOKS.chu;
export const BAC = LOOKS.bac;
export const MOI = LOOKS.moi;
export const GLOVE = { ...LOOKS.worker, hand: '#D9A441' };

/** A blurred layer: a set behind a macro shot, a foreground shape. */
export const Blur: React.FC<{ b?: 3 | 6 | 10 | 16; children: React.ReactNode }> = ({ b = 16, children }) => <g filter={`url(#blur${b})`}>{children}</g>;

/** Camera centred on a character's face. */
export const faceCam = (p: Pose, z: number, dy = 14, dx = 0) => camT(p.x + dx, p.y + HEAD.y * p.scale + dy, z);

/** A phone held in the hand, screen towards the face: a lit rectangle with thumbnails. */
export const HeldPhone: React.FC<{ x: number; y: number; w?: number; rot?: number; light?: number }> = ({ x, y, w = 56, rot = 0, light = 1 }) => {
  const h = w * 1.9;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.14} fill="#16151C" stroke="#3A3846" strokeWidth={3} />
      <rect x={-w / 2 + 4} y={-h / 2 + 5} width={w - 8} height={h - 10} rx={w * 0.1} fill="#B8D4F2" opacity={0.95} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={-w / 2 + 8 + (i % 2) * (w / 2 - 6)} y={-h / 2 + 12 + Math.floor(i / 2) * (h / 3.3)} width={w / 2 - 12} height={h / 3.8} rx={3} fill={['#E9A84A', '#7A9AC4', '#C98E68', '#8FB48A', '#D9A0A0', '#F4EEE0'][i]} opacity={0.9} />
      ))}
      <circle cx={0} cy={0} r={w * 2.6} fill="url(#g3cool)" opacity={0.35 * light} style={{ mixBlendMode: 'screen' }} />
    </g>
  );
};

/** Where a character's near hand is in the world (the near arm is armR when yaw >= 0, armL when yaw < 0). */
export const handOf = (pose: Pose) => toWorld(pose, (pose.yaw < 0 ? joints(pose).armL : joints(pose).armR).end);

/** A mortarboard cap on a head. */
export const Cap: React.FC<{ pose: Pose; color?: string }> = ({ pose, color = '#1E2230' }) => {
  const c = toWorld(pose, { x: 0, y: HEAD.y - 52 });
  const k = pose.scale;
  return (
    <g transform={`translate(${c.x} ${c.y}) scale(${k})`}>
      <path d="M -78 0 L 0 -26 L 78 0 L 0 26 Z" fill={color} stroke="#0A0A10" strokeWidth={4} strokeLinejoin="round" />
      <path d="M -40 14 L -40 36 Q 0 48 40 36 L 40 14 Q 0 28 -40 14 Z" fill={color} stroke="#0A0A10" strokeWidth={4} />
      <path d="M 0 0 L 70 8 L 70 50" stroke="#F2B33D" strokeWidth={5} fill="none" strokeLinecap="round" />
      <circle cx={70} cy={54} r={7} fill="#F2B33D" />
    </g>
  );
};

/** The bank / wallet page of the phone: rent, bills and what is left, in Vietnamese đồng. */
export const LedgerScreen: React.FC<{ x: number; y: number; w?: number; reveal?: number }> = ({ x, y, w = 620, reveal = 1 }) => {
  const h = w * 2.05;
  const rows: [string, string, string][] = [
    ['Tiền phòng', '−2.200.000', '#D9534F'],
    ['Điện nước', '−380.000', '#D9534F'],
    ['Gửi mẹ', '−1.500.000', '#D9534F'],
    ['Ăn uống', '−1.450.000', '#D9534F'],
    ['Lương tháng này', '+5.600.000', '#3BA05A'],
  ];
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 + 14} y={-h / 2 + 20} width={w} height={h} rx={w * 0.12} fill="#000" opacity={0.4} />
      <circle cx={0} cy={0} r={w * 1.3} fill="url(#g3cool)" opacity={0.45} style={{ mixBlendMode: 'screen' }} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.12} fill="#16151C" stroke="#3A3846" strokeWidth={6} />
      <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={h - 28} rx={w * 0.09} fill="#F1F2F6" />
      <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={w * 0.26} rx={w * 0.09} fill="#3E5C8A" />
      <rect x={-w / 2 + 14} y={-h / 2 + 14 + w * 0.13} width={w - 28} height={w * 0.13} fill="#3E5C8A" />
      <text x={-w / 2 + 44} y={-h / 2 + 14 + w * 0.17} fontFamily={FONT.title} fontWeight={800} fontSize={w * 0.075} fill="#F6EFE3">Chi tiêu tháng này</text>
      {rows.map(([k, v, c], i) => {
        const ry = -h / 2 + 14 + w * 0.36 + i * w * 0.2;
        const o = Math.min(1, Math.max(0, reveal * rows.length - i));
        return (
          <g key={k} opacity={o}>
            <text x={-w / 2 + 44} y={ry + w * 0.07} fontFamily={FONT.ui} fontSize={w * 0.05} fill="#2A2C3A">{k}</text>
            <text x={w / 2 - 44} y={ry + w * 0.07} textAnchor="end" fontFamily={FONT.ui} fontWeight={700} fontSize={w * 0.052} fill={c}>{v}</text>
            <path d={`M ${-w / 2 + 40} ${ry + w * 0.12} L ${w / 2 - 40} ${ry + w * 0.12}`} stroke="#D5D8DE" strokeWidth={2} />
          </g>
        );
      })}
      <g opacity={Math.min(1, Math.max(0, reveal * 6 - 5))}>
        <text x={-w / 2 + 44} y={h / 2 - 150} fontFamily={FONT.ui} fontSize={w * 0.05} fill="#5A5A6A">Còn lại</text>
        <text x={w / 2 - 44} y={h / 2 - 140} textAnchor="end" fontFamily={FONT.title} fontWeight={800} fontSize={w * 0.1} fill="#D9534F">420.000</text>
      </g>
    </g>
  );
};

/** A slow warm glow, for light moving across a table. */
export const Sweep: React.FC<{ x: number; y: number; r?: number; o?: number }> = ({ x, y, r = 700, o = 0.4 }) => <Glow x={x} y={y} r={r} o={o} />;

export { Hero };
