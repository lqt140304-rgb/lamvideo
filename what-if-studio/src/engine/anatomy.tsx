import React from 'react';
import { clamp, lerp } from './anim';

type Point = { x: number; y: number };
type Chain = { root: Point; mid: Point; end: Point };
const at = (a: Point, b: Point, t: number): Point => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
const normal = (a: Point, b: Point) => {
  const len = Math.max(0.001, Math.hypot(b.x - a.x, b.y - a.y));
  return { x: -(b.y - a.y) / len, y: (b.x - a.x) / len };
};

/** A tapered, curved tube around the same bone anchors used by hands and attached props. */
export const limbContour = (chain: Chain, widths: [number, number, number]) => {
  const { root: a, mid: b, end: c } = chain;
  const n0 = normal(a, b), n1 = normal(b, c);
  const sum = Math.hypot(n0.x + n1.x, n0.y + n1.y);
  const nm = sum < 0.2 ? n0 : { x: (n0.x + n1.x) / sum, y: (n0.y + n1.y) / sum };
  const offset = (p: Point, n: Point, w: number, s: number) => ({ x: p.x + n.x * w * s, y: p.y + n.y * w * s });
  const edge = (s: number) => [offset(a, n0, widths[0], s), offset(b, nm, widths[1], s), offset(c, n1, widths[2], s)];
  const [a0, b0, c0] = edge(1), [a1, b1, c1] = edge(-1);
  const p = (v: Point) => `${v.x} ${v.y}`;
  const control = (u: Point, v: Point, k: number) => p(at(u, v, k));
  return `M ${p(a0)} C ${control(a0, b0, 0.55)} ${control(a0, b0, 0.85)} ${p(b0)} S ${control(b0, c0, 0.65)} ${p(c0)} Q ${p(c)} ${p(c1)} C ${control(c1, b1, 0.55)} ${control(c1, b1, 0.85)} ${p(b1)} S ${control(b1, a1, 0.65)} ${p(a1)} Q ${p(a)} ${p(a0)} Z`;
};

/** A colour 18% darker: the tonal edge a lineless shape uses instead of an ink outline. */
export const toneOf = (hex: string, k = 0.82) => {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  if (Number.isNaN(n)) return hex;
  const c = (v: number) => Math.round(v * k).toString(16).padStart(2, '0');
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};

/** The two sides of a limb as open strokes, starting a little below the root so the limb grows out of the body without a ring round it. */
const limbSides = (chain: Chain, widths: [number, number, number], from = 0.2) => {
  const { root: a, mid: b, end: c } = chain;
  const n0 = normal(a, b), n1 = normal(b, c);
  const sum = Math.hypot(n0.x + n1.x, n0.y + n1.y);
  const nm = sum < 0.2 ? n0 : { x: (n0.x + n1.x) / sum, y: (n0.y + n1.y) / sum };
  const side = (s: number) => {
    const p0 = { x: a.x + n0.x * widths[0] * s, y: a.y + n0.y * widths[0] * s };
    const p1 = { x: b.x + nm.x * widths[1] * s, y: b.y + nm.y * widths[1] * s };
    const p2 = { x: c.x + n1.x * widths[2] * s, y: c.y + n1.y * widths[2] * s };
    const st = at(p0, p1, from);
    return `M ${st.x} ${st.y} Q ${at(st, p1, 0.75).x} ${at(st, p1, 0.75).y} ${p1.x} ${p1.y} Q ${at(p1, p2, 0.3).x} ${at(p1, p2, 0.3).y} ${p2.x} ${p2.y}`;
  };
  return `${side(1)} ${side(-1)}`;
};

/** The lineless limb: filled shape, open tonal sides, and a soft fold where it bends instead of an ink tick. */
const OpenLimb: React.FC<{ chain: Chain; width: number; color: string; shade: string; bare?: string; arm: boolean }> = ({ chain, width, color, shade, bare, arm }) => {
  const { root, mid, end } = chain;
  const radius = width * (arm ? 0.64 : 1.12);
  const widths: [number, number, number] = [radius, width * (arm ? 0.53 : 0.82), width * (arm ? 0.35 : 0.7)];
  const d = limbContour(chain, widths);
  const n = normal(mid, end);
  const cuff = at(root, mid, arm ? 0.56 : 0.64);
  const clothChain = { root: at(root, mid, -0.02), mid: at(root, cuff, 0.52), end: cuff };
  const bend = clamp(1 - ((mid.x - root.x) * (end.x - mid.x) + (mid.y - root.y) * (end.y - mid.y)) / Math.max(1, Math.hypot(mid.x - root.x, mid.y - root.y) * Math.hypot(end.x - mid.x, end.y - mid.y)));
  const skin = bare ?? color;
  const edge = toneOf(skin);
  const clothEdge = toneOf(color);
  return <g>
    <path d={d} fill={skin} />
    <path d={limbSides(bare ? { root: cuff, mid, end } : chain, bare ? [width * 0.5, widths[1], widths[2]] : widths, bare ? 0 : 0.2)} fill="none" stroke={edge} strokeWidth={1.7} strokeLinecap="round" />
    {bare ? <g>
      <path d={limbContour(clothChain, [radius * 0.95, radius * 1.13, width * (arm ? 0.55 : 0.9)])} fill={color} />
      <path d={limbSides(clothChain, [radius * 0.95, radius * 1.13, width * (arm ? 0.55 : 0.9)], 0.28)} fill="none" stroke={clothEdge} strokeWidth={1.7} strokeLinecap="round" />
      <ellipse cx={cuff.x} cy={cuff.y} rx={width * 0.62} ry={width * 0.2} transform={`rotate(${Math.atan2(n.y, n.x) * 57.3 + 90} ${cuff.x} ${cuff.y})`} fill={shade} opacity={0.4} />
    </g> : null}
    {bend > 0.06 ? <g>
      <ellipse cx={mid.x} cy={mid.y} rx={width * 0.72} ry={width * 0.4} fill={bare ? toneOf(skin, 0.7) : shade} opacity={0.14 + bend * 0.2} />
      <path d={`M ${mid.x - n.x * width * 0.34} ${mid.y - n.y * width * 0.34} Q ${mid.x + 1} ${mid.y + 1} ${mid.x + n.x * width * 0.26} ${mid.y + n.y * width * 0.26} Q ${mid.x + 1} ${mid.y + 3} ${mid.x - n.x * width * 0.34} ${mid.y - n.y * width * 0.34} Z`} fill={toneOf(skin, 0.72)} opacity={0.5 * Math.min(1, bend * 2)} />
    </g> : null}
  </g>;
};

export const SoftLimb: React.FC<{ chain: Chain; width: number; color: string; shade: string; ink: string; bare?: string; arm?: boolean; tattoo?: boolean; open?: boolean }> =
  ({ chain, width, color, shade, ink, bare, arm = false, tattoo = false, open = false }) => {
    if (open) return <OpenLimb chain={chain} width={width} color={color} shade={shade} bare={bare} arm={arm} />;
    const { root, mid, end } = chain;
    const radius = width * (arm ? 0.64 : 1.12);
    const d = limbContour(chain, [radius, width * (arm ? 0.53 : 0.82), width * (arm ? 0.35 : 0.7)]);
    const n = normal(mid, end);
    const cuff = at(root, mid, arm ? 0.56 : 0.64);
    const clothChain = { root: at(root, mid, -0.02), mid: at(root, cuff, 0.52), end: cuff };
    const bend = clamp(1 - ((mid.x - root.x) * (end.x - mid.x) + (mid.y - root.y) * (end.y - mid.y)) / Math.max(1, Math.hypot(mid.x - root.x, mid.y - root.y) * Math.hypot(end.x - mid.x, end.y - mid.y)));
    return <g>
      <path d={d} fill={bare ?? color} />
      <path d={bare ? limbContour({root:cuff,mid,end}, [width * (arm ? 0.5 : 0.9),width * (arm ? 0.53 : 0.76),width * (arm ? 0.35 : 0.59)]) : d}
        fill="none" stroke={ink} strokeWidth="2.8" strokeLinejoin="round" />
      {bare ? (() => {
        const sleeve = limbContour(clothChain, [radius * 0.95, radius * 1.13, width * (arm ? 0.55 : 0.9)]);
        const u = normal(root,mid), outward = root.x < 0 ? 1 : -1;
        const q = (p:Point,w:number) => `${p.x+u.x*w*outward} ${p.y+u.y*w*outward}`;
        return <g>
          <path d={sleeve} fill={color} />
          <path d={`M ${q(clothChain.root,radius * 0.95)} Q ${q(clothChain.mid,radius * 1.23)} ${q(cuff,width * 0.55)} Q ${cuff.x} ${cuff.y+2} ${q(cuff,-width * 0.55)}`} fill="none" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          <path d={`M ${q(at(root,cuff,0.6),radius * 0.55)} Q ${q(at(root,cuff,0.8),radius * 0.45)} ${q(cuff,width * 0.2)}`} fill="none" stroke={shade} strokeWidth="1.6" opacity="0.35" />
        </g>;
      })() : null}
      <path d={`M ${root.x + n.x * radius * 0.3} ${root.y + n.y * radius * 0.3} Q ${mid.x + n.x * radius * 0.35} ${mid.y + n.y * radius * 0.35} ${end.x + n.x * width * 0.12} ${end.y + n.y * width * 0.12}`}
        fill="none" stroke={bare ? ink : shade} strokeWidth={bare ? width * 0.2 : 2.2} opacity={bare ? 0.08 : 0.32} strokeLinecap="round" />
      {bend > 0.08 ? <path d={`M ${mid.x - n.x * width * 0.35} ${mid.y - n.y * width * 0.35} Q ${mid.x + 1} ${mid.y + 1} ${mid.x + n.x * width * 0.28} ${mid.y + n.y * width * 0.28}`} fill="none" stroke={ink} strokeWidth="1.3" opacity={0.12 + bend * 0.16} strokeLinecap="round" /> : null}
      {tattoo && bare ? <path d={`M ${mid.x} ${mid.y} Q ${mid.x + n.x * 7} ${mid.y + n.y * 7} ${end.x} ${end.y}`} fill="none" stroke="#243c43" strokeWidth="2" opacity="0.65" /> : null}
    </g>;
  };

export const SoftTorso: React.FC<{ color: string; shade: string; ink: string; cloth?: number; bend?: number; seam?: boolean }> =
  ({ color, shade, ink, cloth = 0, bend = 0, seam = false }) => {
    const hem = clamp(cloth, -1, 1) * 2;
    const tension = clamp(bend, -1, 1) * 3;
    return <g>
      <path d={`M -38 -111 Q -28 -117 -14 -117 Q 0 -112 14 -117 Q 28 -117 38 -111 Q 45 -106 45 -98 C 44 -76 38 -54 40 -31 Q 43 -12 41 ${2 + hem} Q 20 ${10 + hem} 0 7 Q -22 ${10 - hem} -41 ${2 - hem} Q -44 -16 -40 -36 C -39 -56 -44 -79 -47 -98 Q -45 -106 -38 -111 Z`} fill={color} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      <path d={`M 28 -113 Q 39 -110 44 -99 C 41 -71 35 -50 37 -29 Q 39 -12 37 ${2 + hem} Q 30 5 22 5 Q 32 -34 27 -62 Q 34 -87 28 -113 Z`} fill={shade} opacity="0.38" />
      <path d="M -32 -102 Q -15 -111 -4 -108" stroke="#fff" strokeWidth="3" opacity="0.07" strokeLinecap="round" fill="none" />
      <path d={`M -38 ${-86 + tension} Q -28 -78 -22 -79 M 37 ${-82 - tension} Q 28 -73 21 -73 M -33 -20 Q -21 ${-14 + hem} -8 -17 M 15 -28 Q 25 ${-22 - hem} 36 -25 M -29 ${2 - hem} Q -4 ${5 + hem} 12 2`} stroke={shade} strokeWidth="2.1" strokeLinecap="round" opacity="0.52" fill="none" />
      {seam ? <path d="M 0 -110 Q -1 -66 0 4" stroke={shade} strokeWidth="2.5" fill="none" opacity="0.7" /> : null}
    </g>;
  };
