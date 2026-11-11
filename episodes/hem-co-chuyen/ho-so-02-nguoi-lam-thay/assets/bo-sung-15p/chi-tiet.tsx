import React from 'react';
import { makeScene, V3 } from './kit3d';

/**
 * Chi tiết đời sống cho các bối cảnh 3D (11/11/2026): quạt trần, đồng hồ, người đi lại, chim, mèo, bướm đêm, khói hương, cột hiệu cắt tóc,
 * quần áo phơi, gợn nước. Mỗi món nhận `frame`: có số khung thì chuyển động (tất định, cùng khung cùng hình), `null` thì đứng yên
 * nhưng vẫn có mặt để bối cảnh bớt trống. Hình 2D vẽ bằng đơn vị cm, đặt vào cảnh qua `S.sprite`/`S.plane` nên được sắp xếp theo chiều sâu.
 */
type Sc = ReturnType<typeof makeScene>;
const TAU = Math.PI * 2;
const rnd = (n: number) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Quạt trần: cần, hộp, ba cánh quay (có vệt mờ phía sau cánh khi quay). `c` = [x, z]; `H` = độ cao trần. */
export const ceilingFan = (S: Sc, c: [number, number], H: number, frame: number | null, radius = 55) => {
  const y = H - 30, a0 = frame === null ? 0.6 : frame * 0.24;
  S.line([c[0], H, c[1]], [c[0], y + 8, c[1]], '#6c6f6a', 1.8, { cm: true, layer: 2 });
  S.cyl([c[0], y, c[1]], 8, 7, '#7c8079', { n: 12 });
  for (let i = 0; i < 3; i++) {
    const ang = a0 + (i * TAU) / 3;
    if (frame !== null) S.line([c[0], y + 4, c[1]], [c[0] + Math.cos(ang - 0.35) * radius, y + 4, c[1] + Math.sin(ang - 0.35) * radius], '#b9bdb2', 8, { cm: true, layer: 2.05, op: 0.28 });
    S.line([c[0], y + 4, c[1]], [c[0] + Math.cos(ang) * radius, y + 4, c[1] + Math.sin(ang) * radius], '#bfc3b8', 8, { cm: true, layer: 2.1 });
  }
};

/** Mặt đồng hồ 80 × 80 đơn vị: kim giờ, kim phút trôi chậm, kim giây chạy từng nhịp. */
const ClockFace: React.FC<{ frame: number | null }> = ({ frame }) => {
  const sec = frame === null ? 20 : Math.floor(frame / 30) * 6, min = 48 + (frame === null ? 0 : frame / 300), hr = 305 + min / 12;
  const hand = (deg: number, len: number, w: number, col: string) => <line x1={40} y1={40} x2={40 + Math.sin((deg * Math.PI) / 180) * len} y2={40 - Math.cos((deg * Math.PI) / 180) * len} stroke={col} strokeWidth={w} strokeLinecap="round" />;
  return (
    <g>
      <circle cx={40} cy={40} r={39} fill="#f4efe0" stroke="#59605a" strokeWidth={5} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={40 + Math.sin((i * TAU) / 12) * 32} y1={40 - Math.cos((i * TAU) / 12) * 32} x2={40 + Math.sin((i * TAU) / 12) * 36} y2={40 - Math.cos((i * TAU) / 12) * 36} stroke="#59605a" strokeWidth={i % 3 ? 2 : 3.4} />)}
      {hand(hr, 19, 4.2, '#2f3532')}{hand(min, 28, 3, '#2f3532')}{hand(sec, 31, 1.5, '#b8483a')}
      <circle cx={40} cy={40} r={3} fill="#2f3532" />
    </g>
  );
};
/** Đồng hồ treo tường đường kính `size` cm, tâm tại `centre`; `right` là hướng sang phải trên tường nhìn từ trong (vd [1,0,0] cho tường trước). */
export const wallClock = (S: Sc, centre: V3, right: V3, size: number, frame: number | null) => {
  const k = size / 80, o: V3 = [centre[0] - right[0] * size / 2, centre[1] + size / 2, centre[2] - right[2] * size / 2];
  S.plane(o, [right[0] * k, 0, right[2] * k], [0, -k, 0], <ClockFace frame={frame} />, 2, 3);
};

/** Người đi lại phía xa (bóng người phẳng đơn giản, không viền): đi từ `from` tới `to` rồi lặp lại, tay chân đung đưa theo bước. */
export const walker = (S: Sc, o: { from: V3; to: V3; speed: number; phase: number; shirt: string; pants: string; hair?: string; frame: number | null; run?: boolean }) => {
  const len = Math.hypot(o.to[0] - o.from[0], o.to[2] - o.from[2]) || 1;
  const t = o.frame === null ? (o.phase * 0.97) % 1 : (o.phase + (o.frame * o.speed) / len) % 1;
  const p = lerp3(o.from, o.to, t), toward = o.to[2] < o.from[2];
  const f = o.frame ?? o.phase * 40, sw = Math.sin(f * (o.run ? 0.42 : 0.27) + o.phase * 9) * (o.run ? 34 : 22);
  const pos = S.cam.project(p), s = S.cam.pxcm(p);
  if (S.cam.depth(p) < 30) return;
  const fade = Math.min(1, t * 12, (1 - t) * 12);
  const limb = (x: number, y: number, len2: number, ang: number, w: number, col: string) => <line x1={x} y1={y} x2={x + Math.sin((ang * Math.PI) / 180) * len2} y2={y + Math.cos((ang * Math.PI) / 180) * len2} stroke={col} strokeWidth={w} strokeLinecap="round" />;
  const bob = Math.abs(Math.sin(f * (o.run ? 0.42 : 0.27) + o.phase * 9)) * (o.run ? 3 : 1.6);
  S.sprite(p, (
    <g transform={`translate(${pos[0].toFixed(1)} ${pos[1].toFixed(1)}) scale(${s.toFixed(3)})`} opacity={fade}>
      <ellipse cx={0} cy={0} rx={22} ry={5} fill="#000" opacity={0.14} />
      <g transform={`translate(0 ${-bob})`}>
        {limb(-6, -88, 84, sw, 11, o.pants)}{limb(6, -88, 84, -sw, 11, o.pants)}
        {limb(-20, -140, 54, -sw * 0.8, 9, o.shirt)}{limb(20, -140, 54, sw * 0.8, 9, o.shirt)}
        <rect x={-21} y={-150} width={42} height={68} rx={15} fill={o.shirt} />
        <circle cx={0} cy={-163} r={12} fill={toward ? '#d9ad84' : o.hair ?? '#2a2b29'} />
        {toward ? <path d="M-12 -166Q0 -182 12 -166Q4 -172 -12 -166Z" fill={o.hair ?? '#2a2b29'} /> : <path d="M-12 -163Q0 -178 12 -163Q10 -151 0 -150Q-10 -151 -12 -163Z" fill={o.hair ?? '#2a2b29'} />}
      </g>
    </g>
  ), 2);
};

/** Đàn chim bay ngang bầu trời (toạ độ màn hình 1920 × 1080), vỗ cánh theo khung. */
export const Birds: React.FC<{ frame: number | null; y?: number; n?: number; col?: string }> = ({ frame, y = 220, n = 5, col = '#4e5a58' }) => (
  <g data-layer="chim" fill="none" stroke={col} strokeWidth={2.6} strokeLinecap="round">
    {Array.from({ length: n }, (_, i) => {
      const t = frame === null ? i * 0.17 : (frame * (0.0024 + (i % 3) * 0.0003) + i * 0.17) % 1, x = -120 + t * 2160, yy = y + i * 34 + Math.sin(t * 9 + i) * 18 + (i % 2) * 20;
      const flap = frame === null ? 0.6 : Math.sin(frame * 0.35 + i * 1.7), w = 12 + (i % 3) * 3;
      return <path key={i} d={`M${x - w} ${yy + 3 * flap}Q${x - w / 2} ${yy - 9 * flap - 3} ${x} ${yy}Q${x + w / 2} ${yy - 9 * flap - 3} ${x + w} ${yy + 3 * flap}`} />;
    })}
  </g>
);
/** Mây trôi chậm trên nền trời. */
export const Clouds: React.FC<{ frame: number | null; y?: number }> = ({ frame, y = 130 }) => (
  <g data-layer="may" fill="#ffffff" opacity={0.5}>
    {[0, 1, 2].map((i) => { const x = (((frame ?? 0) * (0.18 + i * 0.07) + i * 700) % 2600) - 340, yy = y + i * 70; return <g key={i} transform={`translate(${x} ${yy})`}><ellipse rx={170} ry={26} /><ellipse cx={-70} cy={-16} rx={90} ry={30} /><ellipse cx={60} cy={-22} rx={80} ry={26} /></g>; })}
  </g>
);

/** Bướm đêm bay vòng quanh một nguồn sáng, cánh vỗ nhanh. */
export const moths = (S: Sc, c: V3, frame: number | null, n = 3, r = 24) => {
  for (let i = 0; i < n; i++) {
    const f = frame ?? i * 40, a = f * (0.11 + i * 0.03) + i * 2.1, rr = r * (0.6 + 0.4 * Math.sin(f / 19 + i));
    const p: V3 = [c[0] + Math.cos(a) * rr * 0.7, c[1] + Math.sin(a * 1.7) * 9 + Math.sin(f / 11 + i) * 4, c[2] + Math.sin(a) * rr];
    if (S.cam.depth(p) < 30) continue;
    const q = S.cam.project(p), s = Math.max(0.7, S.cam.pxcm(p) * 0.22), wing = 3 + 5 * Math.abs(Math.sin(f * 1.1 + i));
    S.sprite(p, <g transform={`translate(${q[0].toFixed(1)} ${q[1].toFixed(1)}) scale(${s.toFixed(2)})`}><ellipse cx={-wing * 0.8} cy={-1} rx={wing} ry={3.6} fill="#f2e7c9" /><ellipse cx={wing * 0.8} cy={-1} rx={wing} ry={3.6} fill="#f2e7c9" /><ellipse rx={1.5} ry={5} fill="#5b4a36" /></g>, 2.5);
  }
};

/** Mèo ngồi (cao khoảng 30 cm): đuôi ve vẩy, chớp mắt, thỉnh thoảng giật tai. `facing` −1: quay mặt sang trái. */
export const cat = (S: Sc, at: V3, frame: number | null, col = '#c99a62', facing: 1 | -1 = 1) => {
  if (S.cam.depth(at) < 30) return;
  const f = frame ?? 0, pos = S.cam.project(at), s = S.cam.pxcm(at);
  const tail = Math.sin(f / 17) * 9 + Math.sin(f / 7) * 2.5, blink = f % 150 > 144, ear = f % 211 > 205 ? 4 : 0;
  S.sprite(at, (
    <g transform={`translate(${pos[0].toFixed(1)} ${pos[1].toFixed(1)}) scale(${(s * facing).toFixed(3)} ${s.toFixed(3)})`}>
      <ellipse cx={0} cy={0} rx={15} ry={3.4} fill="#000" opacity={0.18} />
      <path d={`M10 -3Q${24 + tail} -6 ${22 + tail * 1.3} -26`} fill="none" stroke={col} strokeWidth={4.6} strokeLinecap="round" />
      <ellipse cx={0} cy={-11} rx={12} ry={13} fill={col} />
      <circle cx={0} cy={-27} r={9} fill={col} />
      <path d={`M-8 -31L-9 ${-41 + ear}L-2 -35Z`} fill={col} /><path d="M8 -31L9 -41L2 -35Z" fill={col} />
      {blink ? <><path d="M-5 -28H-2M2 -28H5" stroke="#2a2d2b" strokeWidth={1.2} /></> : <><ellipse cx={-3.6} cy={-28} rx={1.5} ry={2.2} fill="#2a2d2b" /><ellipse cx={3.6} cy={-28} rx={1.5} ry={2.2} fill="#2a2d2b" /></>}
      <path d="M-1.6 -24.5Q0 -23 1.6 -24.5" fill="none" stroke="#7a4a3a" strokeWidth={1} />
      <path d="M-7 -5Q-5 -14 -3 -5M3 -5Q5 -14 7 -5" fill="none" stroke="#00000022" strokeWidth={1.5} />
    </g>
  ), 2);
};

/** Khói hương: vài sợi mảnh bốc lên uốn lượn, mờ dần. `at` là đầu cây hương. */
export const smoke = (S: Sc, at: V3, frame: number | null, h = 38) => {
  if (S.cam.depth(at) < 30) return;
  const f = frame ?? 0, pos = S.cam.project(at), s = S.cam.pxcm(at);
  S.sprite(at, (
    <g transform={`translate(${pos[0].toFixed(1)} ${pos[1].toFixed(1)}) scale(${s.toFixed(3)})`} fill="none" strokeLinecap="round">
      {[0, 1, 2].map((k) => {
        const pts = Array.from({ length: 12 }, (_, i) => { const y = (i / 11) * h, x = Math.sin(y / 7 + f / 13 + k * 2.1) * (1 + y * 0.11) + (k - 1) * 3; return `${i ? 'L' : 'M'}${x.toFixed(1)} ${(-y).toFixed(1)}`; }).join('');
        return <path key={k} d={pts} stroke="#e8eeee" strokeWidth={1.5 - k * 0.25} opacity={0.5 - k * 0.1} />;
      })}
    </g>
  ), 2.6);
};

/** Cột hiệu tiệm cắt tóc (dán tường): sọc đỏ–trắng–xanh chạy dọc, hai nắp. Gắn trên tường trái (x cố định), `o` là điểm trên cùng, `u` hướng +z. */
export const barberPole = (S: Sc, o: V3, frame: number | null, uid: string) => {
  const off = frame === null ? 8 : (frame * 0.7) % 36;
  const node = (
    <g>
      <clipPath id={`${uid}-pole`}><rect x={0} y={0} width={24} height={110} rx={10} /></clipPath>
      <rect x={-3} y={-8} width={30} height={14} rx={6} fill="#c9ccc6" /><rect x={-3} y={104} width={30} height={14} rx={6} fill="#c9ccc6" />
      <g clipPath={`url(#${uid}-pole)`}>
        <rect width={24} height={110} fill="#f4f1e6" />
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M-10 ${i * 36 - 40 + off}L40 ${i * 36 - 40 + off - 24}V${i * 36 - 40 + off - 6}L-10 ${i * 36 - 40 + off + 18}Z`} fill={i % 2 ? '#3a5fa8' : '#c4443a'} />)}
        <rect width={7} height={110} fill="#ffffff" opacity={0.28} />
      </g>
    </g>
  );
  S.plane(o, [0, 0, 0.42], [0, -0.42, 0], node, 2, 6);
};

/** Quần áo phơi trên dây, đung đưa theo gió. `a`/`b` là hai đầu dây; mỗi món là một mảnh vải rủ xuống `drop` cm. */
export const laundry = (S: Sc, a: V3, b: V3, frame: number | null, cols = ['#d9d2bd', '#5f87a8', '#c4776a', '#8fb08a', '#e6dfc9']) => {
  S.line(a, b, '#5b5547', 1.4, { cm: true, layer: 2.2 });
  const n = cols.length;
  cols.forEach((c, i) => {
    const t0 = (i + 0.2) / n, t1 = (i + 0.78) / n, drop = 52 + (i % 3) * 14;
    const sw = frame === null ? 2 : Math.sin(frame / 22 + i * 1.7) * 5 + Math.sin(frame / 9 + i) * 1.4;
    const p0 = lerp3(a, b, t0), p1 = lerp3(a, b, t1), sag = (t: number) => -4 * Math.sin(Math.PI * t);
    S.quad([[p0[0], p0[1] + sag(t0), p0[2]], [p1[0], p1[1] + sag(t1), p1[2]], [p1[0] + sw, p1[1] + sag(t1) - drop, p1[2]], [p0[0] + sw, p0[1] + sag(t0) - drop, p0[2]]], c, { raw: true, layer: 2.3, op: 0.95 });
  });
};

/** Gợn nước trên vũng: vài vòng tròn nở rộng rồi tan. */
export const ripples = (S: Sc, c: V3, frame: number | null, rMax = 36) => {
  const f = frame ?? 30;
  for (let k = 0; k < 2; k++) {
    const ph = ((f / 70 + k * 0.5) % 1), r = 4 + ph * rMax, N = 18;
    for (let i = 0; i < N; i++) { const a0 = (i / N) * TAU, a1 = ((i + 1) / N) * TAU; S.line([c[0] + Math.cos(a0) * r, c[1] + 0.6, c[2] + Math.sin(a0) * r * 0.8], [c[0] + Math.cos(a1) * r, c[1] + 0.6, c[2] + Math.sin(a1) * r * 0.8], '#f0f5f3', 0.7, { cm: true, layer: 0.8, op: 0.55 * (1 - ph) }); }
  }
};
