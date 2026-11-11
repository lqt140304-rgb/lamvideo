import React from 'react';

/**
 * Bộ dựng bối cảnh 3D nhẹ cho Hồ sơ 02 (11/11/2026).
 * Mô hình theo cm, camera phối cảnh thật (có ngẩng/cúi), mặt khối sáng–tối theo một hướng nắng,
 * đèn điểm ấm, mờ theo khoảng cách, bóng đổ và vệt nắng chiếu qua cửa sổ tính bằng tia lên mặt sàn.
 * Vẽ theo thứ tự xa → gần (painter); khối lồi nên che đúng trong gần như mọi bố cục bối cảnh.
 */
export type V3 = [number, number, number];
type P2 = [number, number];
export type CamSpec = { pos: V3; look: V3; mm: number; W?: number; cx?: number; cy?: number };

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => mul(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const f1 = (n: number) => n.toFixed(1);
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const NEAR = 12;

export const camera = (c: CamSpec) => {
  const W = c.W ?? 1920, F = (c.mm / 36) * W;
  const cx = c.cx ?? W / 2, cy = c.cy ?? (W * 9) / 32;
  const fw = norm(sub(c.look, c.pos));
  const right = norm(cross([0, 1, 0], fw));
  const up = cross(fw, right);
  const toCam = (p: V3): V3 => { const d = sub(p, c.pos); return [dot(d, right), dot(d, up), dot(d, fw)]; };
  const screen = (q: V3): P2 => [cx + (F * q[0]) / q[2], cy - (F * q[1]) / q[2]];
  return { F, pos: c.pos, toCam, screen, project: (p: V3) => screen(toCam(p)), pxcm: (p: V3) => F / Math.max(toCam(p)[2], NEAR), depth: (p: V3) => toCam(p)[2] };
};
export type Cam = ReturnType<typeof camera>;

export type Light = { sun: V3; amb?: number; diff?: number; band?: boolean; lamps?: { p: V3; col: [number, number, number]; r: number; k: number }[]; fog?: { color: string; dist: number; max?: number } };
type Item = { layer: number; depth: number; node: React.ReactNode };
export type FaceOpt = { n?: V3; cull?: boolean; edge?: boolean; raw?: boolean; op?: number; layer?: number; blend?: string; emit?: boolean };

/** Một bối cảnh: gom các mặt, sắp xếp và vẽ. */
export const makeScene = (cam: Cam, light: Light) => {
  const items: Item[] = [];
  const shadows: React.ReactNode[] = [];
  const glows: React.ReactNode[] = [];
  let key = 0;
  const L = norm(mul(light.sun, -1));
  const amb = light.amb ?? 0.62, diff = light.diff ?? 0.48;

  const shade = (hex: string, n: V3 | undefined, at: V3, emit = false) => {
    let c = rgb(hex).map((v) => v / 255);
    if (!emit) {
      const band = light.band !== false;
      const dp = n ? Math.max(0, dot(n, L)) : 0.5;
      // Ba mức sáng vẽ sẵn thay cho chuyển dần: mặt hướng nắng ám ấm, mặt quay lưng ám lạnh, còn lại giữ nguyên.
      const q = band ? (dp > 0.55 ? 1 : dp > 0.15 ? 0.5 : 0) : dp;
      const k = amb + diff * q;
      const tint = band ? (q >= 1 ? [1.04, 1.01, 0.93] : q <= 0 ? [0.94, 0.97, 1.05] : [1, 1, 1]) : [1, 1, 1];
      const add3 = [0, 0, 0];
      for (const l of light.lamps ?? []) {
        const to = sub(l.p, at), d = Math.hypot(...to);
        let I = ((n ? Math.max(0, dot(n, norm(to))) : 0.6) * l.k) / (1 + (d / l.r) ** 2);
        if (band) I = I > 0.35 * l.k ? l.k * 0.9 : I > 0.12 * l.k ? l.k * 0.5 : I > 0.03 * l.k ? l.k * 0.2 : 0;
        add3[0] += I * l.col[0]; add3[1] += I * l.col[1]; add3[2] += I * l.col[2];
      }
      c = c.map((v, i) => v * k * tint[i] + v * add3[i]);
    }
    if (light.fog) {
      const d = cam.depth(at), f = (1 - Math.exp(-Math.max(0, d) / light.fog.dist)) * (light.fog.max ?? 0.55);
      const fc = rgb(light.fog.color).map((v) => v / 255);
      c = c.map((v, i) => v * (1 - f) + fc[i] * f);
    }
    return `rgb(${c.map((v) => Math.round(clamp(v) * 255)).join(',')})`;
  };
  const darker = (css: string, k = 0.72) => css.replace(/\d+/g, (m) => String(Math.round(+m * k)));

  /** Cắt đa giác theo mặt phẳng gần, trả về toạ độ màn hình. */
  const clip = (ps: V3[]) => {
    const q = ps.map(cam.toCam), out: V3[] = [];
    q.forEach((a, i) => {
      const b = q[(i + 1) % q.length];
      if (a[2] >= NEAR) out.push(a);
      if ((a[2] >= NEAR) !== (b[2] >= NEAR)) { const t = (NEAR - a[2]) / (b[2] - a[2]); out.push(add(a, mul(sub(b, a), t))); }
    });
    return out.map(cam.screen);
  };
  const center = (ps: V3[]) => mul(ps.reduce((a, b) => add(a, b), [0, 0, 0] as V3), 1 / ps.length);
  const path = (pts: P2[]) => `M${pts.map((p) => `${f1(p[0])} ${f1(p[1])}`).join('L')}Z`;

  const quad = (ps: V3[], fill: string, o: FaceOpt = {}) => {
    const c = center(ps);
    if (o.n && o.cull !== false && dot(o.n, sub(cam.pos, c)) <= 0) return;
    const pts = clip(ps);
    if (pts.length < 3) return;
    const col = o.raw ? fill : shade(fill, o.n, c, o.emit);
    items.push({
      layer: o.layer ?? 2, depth: Math.hypot(...sub(c, cam.pos)),
      node: <path key={key++} d={path(pts)} fill={col} stroke={o.edge === false ? 'none' : o.raw ? 'none' : darker(col)} strokeWidth={1.1} strokeLinejoin="round" opacity={o.op} style={o.blend ? { mixBlendMode: o.blend as React.CSSProperties['mixBlendMode'] } : undefined} />,
    });
  };

  type BoxO = { x: [number, number]; y: [number, number]; z: [number, number]; c: string; top?: string; front?: string; side?: string; back?: string; bottom?: string; edge?: boolean; layer?: number; emit?: boolean; yaw?: number; pivot?: [number, number] };
  /** Hộp; `yaw` (độ) xoay quanh trục đứng qua `pivot` [x, z] (mặc định tâm hộp), dùng cho đồ xoay được như ghế. */
  const box = (o: BoxO) => {
    const [x0, x1] = o.x, [y0, y1] = o.y, [z0, z1] = o.z;
    const faces: [V3, V3[], string][] = [
      [[0, 0, -1], [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], o.front ?? o.c],
      [[0, 0, 1], [[x1, y0, z1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1]], o.back ?? o.c],
      [[1, 0, 0], [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], o.side ?? o.c],
      [[-1, 0, 0], [[x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1]], o.side ?? o.c],
      [[0, 1, 0], [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], o.top ?? o.c],
      [[0, -1, 0], [[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0]], o.bottom ?? o.c],
    ];
    const a = ((o.yaw ?? 0) * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
    const pv = o.pivot ?? [(x0 + x1) / 2, (z0 + z1) / 2];
    const rot = (p: V3): V3 => { const dx = p[0] - pv[0], dz = p[2] - pv[1]; return [pv[0] + dx * ca - dz * sa, p[1], pv[1] + dx * sa + dz * ca]; };
    const rotN = (n: V3): V3 => [n[0] * ca - n[2] * sa, n[1], n[0] * sa + n[2] * ca];
    if (a) for (const f of faces) { f[0] = rotN(f[0]); f[1] = f[1].map(rot); }
    const c = rot(center([[x0, y0, z0], [x1, y1, z1]]));
    const d = Math.hypot(...sub(c, cam.pos));
    const nodes: React.ReactNode[] = [];
    for (const [n, ps, col] of faces) {
      if (dot(n, sub(cam.pos, center(ps))) <= 0) continue;
      const pts = clip(ps);
      if (pts.length < 3) continue;
      const fill = shade(col, n, center(ps), o.emit);
      nodes.push(<path key={nodes.length} d={path(pts)} fill={fill} stroke={o.edge === false ? 'none' : darker(fill)} strokeWidth={1.1} strokeLinejoin="round" />);
    }
    if (nodes.length) items.push({ layer: o.layer ?? 2, depth: d, node: <g key={key++}>{nodes}</g> });
  };

  /** Trụ đứng n mặt (chân bàn, cột đèn, chậu, cái ly). */
  const cyl = (c: V3, r: number, h: number, col: string, o: { n?: number; top?: string; r2?: number; layer?: number } = {}) => {
    const N = o.n ?? 14, r2 = o.r2 ?? r;
    const nodes: React.ReactNode[] = [];
    const ring = (y: number, rr: number) => Array.from({ length: N }, (_, i) => { const t = (i / N) * Math.PI * 2; return [c[0] + Math.cos(t) * rr, y, c[2] + Math.sin(t) * rr] as V3; });
    const b = ring(c[1], r), tp = ring(c[1] + h, r2);
    const sides: { d: number; node: React.ReactNode }[] = [];
    for (let i = 0; i < N; i++) {
      const ps = [b[i], b[(i + 1) % N], tp[(i + 1) % N], tp[i]];
      const mid = center(ps), n = norm([mid[0] - c[0], 0, mid[2] - c[2]]);
      if (dot(n, sub(cam.pos, mid)) <= 0) continue;
      const pts = clip(ps);
      if (pts.length < 3) continue;
      const fill = shade(col, n, mid);
      sides.push({ d: Math.hypot(...sub(mid, cam.pos)), node: <path key={`s${i}`} d={path(pts)} fill={fill} stroke={fill} strokeWidth={0.8} /> });
    }
    sides.sort((a, z) => z.d - a.d).forEach((s) => nodes.push(s.node));
    const capY = cam.pos[1] > c[1] + h ? c[1] + h : cam.pos[1] < c[1] ? c[1] : null;
    if (capY !== null) {
      const cap = capY === c[1] ? b : tp;
      const pts = clip(cap);
      if (pts.length > 2) { const fill = shade(o.top ?? col, [0, capY === c[1] ? -1 : 1, 0], add(c, [0, capY - c[1], 0])); nodes.push(<path key="cap" d={path(pts)} fill={fill} stroke={darker(fill)} strokeWidth={1} />); }
    }
    items.push({ layer: o.layer ?? 2, depth: Math.hypot(...sub(add(c, [0, h / 2, 0]), cam.pos)), node: <g key={key++}>{nodes}</g> });
  };

  /** Đoạn thẳng (ron gạch, vạch sân, song cửa). Độ dày w theo cm nếu cm = true, ngược lại theo px. */
  const line = (a: V3, b: V3, stroke: string, w: number, o: { layer?: number; op?: number; cm?: boolean } = {}) => {
    const pts = clip([a, b, b]);
    if (pts.length < 2) return;
    const mid = mul(add(a, b), 0.5), width = o.cm ? w * cam.pxcm(mid) : w;
    items.push({ layer: o.layer ?? 0.5, depth: Math.hypot(...sub(mid, cam.pos)), node: <path key={key++} d={`M${f1(pts[0][0])} ${f1(pts[0][1])}L${f1(pts[1][0])} ${f1(pts[1][1])}`} stroke={stroke} strokeWidth={width} strokeLinecap="round" opacity={o.op} fill="none" /> });
  };

  /** Khối cầu/elip (tán cây, bụi lá, chụp đèn tròn): các dải vĩ tuyến, sáng tối theo pháp tuyến thật. */
  const sphere = (c: V3, r: number, col: string, o: { sy?: number; n?: number; bands?: number; layer?: number } = {}) => {
    const N = o.n ?? 14, B = o.bands ?? 7, sy = o.sy ?? 1;
    const pt = (lat: number, lon: number): V3 => [c[0] + r * Math.cos(lat) * Math.cos(lon), c[1] + r * sy * Math.sin(lat), c[2] + r * Math.cos(lat) * Math.sin(lon)];
    const faces: { d: number; node: React.ReactNode }[] = [];
    for (let b = 0; b < B; b++) {
      const a0 = -Math.PI / 2 + (b / B) * Math.PI, a1 = -Math.PI / 2 + ((b + 1) / B) * Math.PI;
      for (let i = 0; i < N; i++) {
        const l0 = (i / N) * Math.PI * 2, l1 = ((i + 1) / N) * Math.PI * 2;
        const ps = [pt(a0, l0), pt(a0, l1), pt(a1, l1), pt(a1, l0)];
        const mid = center(ps), n = norm(sub(mid, c));
        if (dot(n, sub(cam.pos, mid)) <= 0) continue;
        const pts = clip(ps);
        if (pts.length < 3) continue;
        const fill = shade(col, n, mid);
        faces.push({ d: Math.hypot(...sub(mid, cam.pos)), node: <path key={`${b}-${i}`} d={path(pts)} fill={fill} stroke={fill} strokeWidth={0.9} strokeLinejoin="round" /> });
      }
    }
    faces.sort((a, z) => z.d - a.d);
    items.push({ layer: o.layer ?? 2, depth: Math.hypot(...sub(c, cam.pos)), node: <g key={key++}>{faces.map((f) => f.node)}</g> });
  };

  /** Hình 2D (người, đạo cụ có sẵn) đặt vào chiều sâu của cảnh. */
  /** `face`: hướng mặt đã vẽ của hình phẳng (vd lưng sinh viên nhìn về -z). Camera ở phía sau mặt đó thì ẩn hình, tránh lộ như tấm bìa. */
  let hiddenFlat = 0;
  const sprite = (at: V3, node: React.ReactNode, layer = 2, face?: V3) => {
    if (face && dot(face, sub(cam.pos, at)) < 0) { hiddenFlat++; return; }
    items.push({ layer, depth: Math.hypot(...sub(at, cam.pos)), node: <g key={key++}>{node}</g> });
  };

  /** Bóng đổ của một khối hộp xuống sàn theo hướng nắng. */
  const hull = (pts: P2[]) => {
    const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const half = (l: P2[]) => { const h: P2[] = []; for (const p of l) { while (h.length > 1 && cr(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop(); h.push(p); } h.pop(); return h; };
    return [...half(s), ...half([...s].reverse())];
  };
  const castShadow = (x: [number, number], z: [number, number], h: number, op = 0.24, floorY = 0) => {
    const sun = light.sun; if (sun[1] >= 0) return;
    const t = (h - floorY) / -sun[1];
    const base: P2[] = [[x[0], z[0]], [x[1], z[0]], [x[1], z[1]], [x[0], z[1]]];
    const top: P2[] = base.map(([a, b]) => [a + sun[0] * t, b + sun[2] * t]);
    const poly = hull([...base, ...top]).map(([a, b]) => [a, floorY + 0.3, b] as V3);
    const pts = clip(poly); if (pts.length > 2) shadows.push(<path key={key++} d={path(pts)} fill="#1d231f" opacity={op} />);
  };
  /** Vùng tối tiếp xúc dưới đồ vật (bóng mềm sát đáy). */
  const contact = (x: [number, number], z: [number, number], op = 0.3, floorY = 0, pad = 6) => {
    const pts = clip([[x[0] - pad, floorY + 0.3, z[0] - pad], [x[1] + pad, floorY + 0.3, z[0] - pad], [x[1] + pad, floorY + 0.3, z[1] + pad], [x[0] - pad, floorY + 0.3, z[1] + pad]]);
    if (pts.length > 2) shadows.push(<path key={key++} d={path(pts)} fill="#1d231f" opacity={op} />);
  };
  /** Vệt nắng: chiếu ô cửa (4 góc trên tường) dọc theo hướng nắng xuống mặt sàn y = floorY. */
  const sunPatch = (win: V3[], op = 0.32, col = '#fff2c4', floorY = 0) => {
    const sun = light.sun; if (sun[1] >= 0) return;
    const hit = win.map((p) => { const t = (p[1] - floorY) / -sun[1]; return add(p, mul(sun, t)); });
    const pts = clip(hit); if (pts.length > 2) glows.push(<path key={key++} d={path(pts)} fill={col} opacity={op} />);
  };
  /** Quầng sáng mềm quanh một điểm (bóng đèn, màn hình). */
  const glow = (p: V3, rCm: number, col: string, op = 0.35) => {
    if (cam.depth(p) < NEAR) return;
    const [x, y] = cam.project(p), r = rCm * cam.pxcm(p);
    glows.push(<circle key={key++} cx={x} cy={y} r={r} fill={col} opacity={op} />);
  };

  /** Nhóm 2D phẳng dán lên một mặt phẳng (biển chữ, bảng): toạ độ cục bộ x sang phải theo u, y xuống theo v (đơn vị cm/đơn vị). */
  const plane = (o: V3, u: V3, v: V3, node: React.ReactNode, layer = 2, bias = 0) => {
    if (cam.depth(o) < NEAR) return;
    const p0 = cam.project(o), pu = cam.project(add(o, u)), pv = cam.project(add(o, v));
    const m = [pu[0] - p0[0], pu[1] - p0[1], pv[0] - p0[0], pv[1] - p0[1], p0[0], p0[1]].map(f1).join(' ');
    items.push({ layer, depth: Math.hypot(...sub(o, cam.pos)) - 1 - bias, node: <g key={key++} transform={`matrix(${m})`}>{node}</g> });
  };

  /** Toạ độ đặt rig (cao 590 đơn vị) đứng tại điểm sàn `at` cao `heightCm`. */
  const rigAt = (at: V3, heightCm = 168) => {
    const s = (heightCm / 590) * cam.pxcm(at);
    const [x, y] = cam.project(at);
    return { x, y: y - 590 * s, scale: s };
  };

  /**
   * Người đặt qua `children` của một bối cảnh: một mảng ám ấm phía nguồn sáng và một mảng ám lạnh phía ngược lại,
   * cắt theo hình người (mask alpha). Nguồn sáng: đèn gần nhất nếu người đứng trong tầm đèn, còn lại là nắng.
   */
  const litActors = (uidStr: string, at: V3, children: React.ReactNode, o: { lit?: string; dark?: string } = {}) => {
    const lamp = (light.lamps ?? []).map((l) => ({ l, d: Math.hypot(...sub(l.p, at)) })).sort((a, b) => a.d - b.d)[0];
    const useLamp = !!lamp && lamp.d < lamp.l.r * 1.6;
    const near = useLamp ? clamp(1 - lamp.d / (lamp.l.r * 1.6)) : 0;
    const toward = useLamp ? norm(sub(lamp!.l.p, at)) : mul(L, 1);
    const c0 = cam.project(add(at, [0, 100, 0])), c1 = cam.project(add(add(at, [0, 100, 0]), mul(toward, 100)));
    const dx = c1[0] - c0[0], dy = c1[1] - c0[1], dn = Math.hypot(dx, dy) || 1, ux = dx / dn, uy = dy / dn;
    const s = cam.pxcm(at), cx = c0[0], cy = c0[1], h = 90 * s;
    const night = (light.amb ?? 0.62) < 0.4;
    const litA = useLamp ? 0.5 * near : night ? 0.1 : 0.22, shadeA = night ? 0.45 - 0.25 * near : 0.24;
    const lit = o.lit ?? (useLamp ? '#' + lamp!.l.col.map((v) => Math.round(clamp(v) * 255).toString(16).padStart(2, '0')).join('') : '#fff0c8'), dark = o.dark ?? (night ? '#101a36' : '#4a587a');
    const id = `${uidStr}-act`;
    return (
      <g>
        <defs>
          <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={-2000} y={-2000} width={6000} height={6000} style={{ maskType: 'alpha' }}>{children}</mask>
          <linearGradient id={`${id}-l`} gradientUnits="userSpaceOnUse" x1={cx + ux * h} y1={cy + uy * h} x2={cx - ux * h} y2={cy - uy * h}><stop offset="0" stopColor={lit} stopOpacity={litA} /><stop offset=".42" stopColor={lit} stopOpacity={litA} /><stop offset=".5" stopColor={lit} stopOpacity="0" /></linearGradient>
          <linearGradient id={`${id}-d`} gradientUnits="userSpaceOnUse" x1={cx + ux * h} y1={cy + uy * h} x2={cx - ux * h} y2={cy - uy * h}><stop offset=".5" stopColor={dark} stopOpacity="0" /><stop offset=".58" stopColor={dark} stopOpacity={shadeA} /><stop offset="1" stopColor={dark} stopOpacity={shadeA} /></linearGradient>
        </defs>
        {children}
        <g mask={`url(#${id}-m)`}>
          <rect x={-2000} y={-2000} width={6000} height={6000} fill={`url(#${id}-d)`} style={{ mixBlendMode: 'multiply' }} />
          <rect x={-2000} y={-2000} width={6000} height={6000} fill={`url(#${id}-l)`} style={{ mixBlendMode: 'screen' }} />
        </g>
      </g>
    );
  };

  const render = (uidStr: string, bg: React.ReactNode) => {
    const sorted = [...items].sort((a, b) => a.layer - b.layer || b.depth - a.depth);
    const shell = sorted.filter((i) => i.layer < 1);
    const rest = sorted.filter((i) => i.layer >= 1);
    return (
      <g>
        <defs>
          <filter id={`${uidStr}-soft`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7" /></filter>
          <filter id={`${uidStr}-glow`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="12" /></filter>
        </defs>
        {bg}
        {shell.map((i) => i.node)}
        <g filter={`url(#${uidStr}-soft)`}>{shadows}</g>
        <g filter={`url(#${uidStr}-glow)`} style={{ mixBlendMode: 'screen' }}>{glows}</g>
        {rest.map((i) => i.node)}
      </g>
    );
  };
  return { quad, box, cyl, sphere, line, sprite, hidden: () => hiddenFlat, castShadow, contact, sunPatch, glow, plane, rigAt, litActors, render, shade, cam };
};

/** Lớp hoàn thiện: tối bốn góc và hạt mịn, dùng chung cho mọi cảnh. */
export const Finish: React.FC<{ id: string; vignette?: number; warm?: string; warmOp?: number }> = ({ id, vignette = 0.35, warm, warmOp = 0.08 }) => (
  <g pointerEvents="none">
    <defs>
      <radialGradient id={`${id}-vig`} cx=".5" cy=".5" r=".75"><stop offset=".55" stopColor="#141a17" stopOpacity="0" /><stop offset="1" stopColor="#141a17" stopOpacity={vignette} /></radialGradient>
      <filter id={`${id}-grain`}><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="3" /><feColorMatrix type="saturate" values="0" /></filter>
    </defs>
    {warm && <rect width={1920} height={1080} fill={warm} opacity={warmOp} style={{ mixBlendMode: 'soft-light' }} />}
    <rect width={1920} height={1080} fill={`url(#${id}-vig)`} />
    <rect width={1920} height={1080} filter={`url(#${id}-grain)`} opacity={0.07} style={{ mixBlendMode: 'overlay' }} />
  </g>
);
