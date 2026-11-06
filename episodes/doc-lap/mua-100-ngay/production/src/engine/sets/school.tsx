import React from 'react';
import { rnd } from '../anim';

// Furniture for the school used as a shelter (phim mưa 100 ngày, cảnh 5–7 trở đi): a bookcase, a shoe rack, potted
// plants, a notice board. Each is drawn flat-on at (x, y = the floor under it), scaled by `s`.

const L = '#16141C';
const BOOK = ['#C8503C', '#E0B040', '#3F8A7C', '#E8E0CC', '#5F7E96', '#B5604F', '#6E5B7E', '#7E8C74'];

/** A tall wooden bookcase with four shelves of books, some leaning. */
export const Bookcase: React.FC<{ x: number; y: number; s?: number; seed?: number }> = ({ x, y, s = 1, seed = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={150} ry={12} fill="#000" opacity={0.3} />
    <rect x={-130} y={-520} width={260} height={520} fill="#7A5636" stroke={L} strokeWidth={5} />
    <rect x={-116} y={-506} width={232} height={492} fill="#4E3622" />
    {[0, 1, 2, 3].map((r) => (
      <g key={r}>
        <rect x={-120} y={-386 + r * 122} width={240} height={12} fill="#8E6A48" stroke={L} strokeWidth={2} />
        {Array.from({ length: 9 }).map((_, i) => {
          const h = 64 + rnd(seed + r, i) * 40;
          const w = 18 + rnd(seed + 9, r * 9 + i) * 8;
          const lean = rnd(seed + 4, r * 9 + i) > 0.85 ? 12 : 0;
          return <rect key={i} x={-110 + i * 25} y={-386 + r * 122 - h} width={w} height={h} rx={2} fill={BOOK[Math.floor(rnd(seed + 7, r * 9 + i) * BOOK.length)]} stroke={L} strokeWidth={1.5} transform={lean ? `rotate(${lean} ${-110 + i * 25} ${-386 + r * 122})` : undefined} />;
        })}
      </g>
    ))}
  </g>
);

/** A low two-shelf shoe rack with sandals and small shoes. */
export const ShoeRack: React.FC<{ x: number; y: number; s?: number; seed?: number }> = ({ x, y, s = 1, seed = 2 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={140} ry={10} fill="#000" opacity={0.3} />
    <rect x={-120} y={-150} width={240} height={150} fill="none" stroke="#6E4C30" strokeWidth={10} />
    <rect x={-120} y={-80} width={240} height={10} fill="#6E4C30" />
    {[-1, 0].map((r) =>
      Array.from({ length: 4 }).map((_, i) => (
        <ellipse key={`${r}-${i}`} cx={-90 + i * 60} cy={(r === -1 ? -88 : -14)} rx={24} ry={10} fill={['#2E5E9A', '#D96C4F', '#E9E0CC', '#4A3E36', '#3E8E5E'][Math.floor(rnd(seed, r * 4 + i + 8) * 5)]} stroke={L} strokeWidth={2} />
      )),
    )}
  </g>
);

/** A healthy potted plant (not the drowned ones of cảnh 4): a clay pot and a fan of green leaves. */
export const Plant: React.FC<{ x: number; y: number; s?: number; t?: number; seed?: number; tall?: boolean }> = ({ x, y, s = 1, t = 0, seed = 3, tall = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={70} ry={10} fill="#000" opacity={0.3} />
    {Array.from({ length: tall ? 9 : 7 }).map((_, i) => {
      const a = -70 + i * (140 / ((tall ? 9 : 7) - 1)) + 4 * Math.sin(t * 0.05 + i + seed);
      const len = (tall ? 200 : 130) * (0.7 + 0.3 * rnd(seed, i));
      return (
        <g key={i} transform={`translate(0 -70) rotate(${a})`}>
          <path d={`M 0 0 Q ${14} ${-len * 0.5} 0 ${-len} Q ${-14} ${-len * 0.5} 0 0 Z`} fill={i % 2 ? '#5E8E3A' : '#4E7E30'} stroke="#2E4A1E" strokeWidth={3} />
        </g>
      );
    })}
    <path d="M -56 -74 L 56 -74 L 44 0 L -44 0 Z" fill="#B4643C" stroke={L} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-62} y={-88} width={124} height={18} rx={5} fill="#C8744A" stroke={L} strokeWidth={4} />
  </g>
);

/** A cork notice board with pinned papers: the shelter rota, a map, the route to the community hall. */
export const NoticeBoard: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-100} width={300} height={200} fill="#B8905A" stroke="#6E4C30" strokeWidth={8} />
    {[[-110, -76, 90, 110, '#F4F0E4'], [-6, -80, 70, 60, '#F2E2A0'], [76, -70, 60, 80, '#E8F0F4'], [-8, -6, 100, 84, '#F4F0E4']].map(([px, py, w, h, c], i) => (
      <g key={i}>
        <rect x={px as number} y={py as number} width={w as number} height={h as number} fill={c as string} stroke="#8A7A58" strokeWidth={2} />
        {[0, 1, 2].map((k) => <path key={k} d={`M ${(px as number) + 8} ${(py as number) + 20 + k * 18} l ${(w as number) - 16} 0`} stroke="#8A8A8A" strokeWidth={3} />)}
        <circle cx={(px as number) + (w as number) / 2} cy={(py as number) + 6} r={5} fill="#C8322A" />
      </g>
    ))}
  </g>
);
