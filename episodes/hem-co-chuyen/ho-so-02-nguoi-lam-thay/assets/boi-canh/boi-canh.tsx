import React, { useId } from 'react';

/**
 * Phòng trọ Hồ sơ 2 dựng từ một mô hình 3D (đơn vị cm) rồi chiếu ra SVG.
 * Mọi góc máy là camera thật trên cùng căn phòng, nên đồ đạc không thể lệch chỗ giữa các shot.
 * Trục: x từ tường cửa (0) sang tường cửa sổ (460), y lên trên, z từ tường sau (0) ra phía máy.
 */
type V3 = [number, number, number];
type P2 = [number, number];
type Cam = { pos: V3; target: [number, number]; mm: number; horizon: number };

export const ROOM = { w: 460, h: 265, d: 780 };
const { w: W, h: H, d: D } = ROOM;
const DOOR = { z0: 170, z1: 260, top: 205 };
const WIN = { z0: 90, z1: 220, y0: 95, y1: 205 };
/** Tâm ghế theo trạng thái; người ngồi đặt `at` vào đây. `bed`: ghế để gần lối đi cạnh nệm, chỗ Nam va đầu gối. */
export const SEATS = { desk: { x: 396, z: 112, a: 0 }, door: { x: 195, z: 215, a: Math.PI / 2 }, bed: { x: 222, z: 196, a: 0.5 } };

export const VIEWS = {
  wide: { pos: [228, 152, 800], target: [228, 0], mm: 34, horizon: 395 },
  kitchen: { pos: [240, 122, 300], target: [85, 20], mm: 38, horizon: 470 },
  desk: { pos: [215, 122, 310], target: [385, 30], mm: 36, horizon: 470 },
  door: { pos: [335, 120, 240], target: [0, 215], mm: 27, horizon: 470 },
  hallway: { pos: [-520, 118, 195], target: [0, 195], mm: 26, horizon: 480 },
  bed: { pos: [300, 150, 640], target: [350, 290], mm: 34, horizon: 300 },
} satisfies Record<string, Cam>;
export type RoomView = keyof typeof VIEWS;

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: V3): V3 => mul(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const f1 = (n: number) => n.toFixed(1);

const camera = (c: Cam) => {
  const F = (c.mm / 36) * 1920;
  const fw = norm([c.target[0] - c.pos[0], 0, c.target[1] - c.pos[2]]);
  const right: V3 = [-fw[2], 0, fw[0]];
  const toCam = (p: V3): V3 => { const d = sub(p, c.pos); return [dot(d, right), d[1], dot(d, fw)]; };
  const screen = (q: V3): P2 => [960 + (F * q[0]) / q[2], c.horizon - (F * q[1]) / q[2]];
  return { F, toCam, screen, pos: c.pos, project: (p: V3) => screen(toCam(p)), pxcm: (p: V3) => F / Math.max(toCam(p)[2], 12) };
};

/** Dịch máy theo cm: truck sang ngang, push tiến tới. Dùng cho các cú máy nhỏ, vật gần sẽ trôi nhiều hơn vật xa. */
export type CameraMove = { truck?: number; push?: number };
const moved = (c: Cam, m?: CameraMove): Cam => {
  if (!m) return c;
  const fw = norm([c.target[0] - c.pos[0], 0, c.target[1] - c.pos[2]]);
  const d = add(mul([-fw[2], 0, fw[0]], m.truck ?? 0), mul(fw, m.push ?? 0));
  return { ...c, pos: add(c.pos, d), target: [c.target[0] + d[0], c.target[1] + d[2]] };
};

/** Điểm đứng của nhân vật trên sàn: trả về x, y, scale để truyền thẳng vào rig (rig cao 590 đơn vị, người cao 168 cm). */
export const placeOn = (view: RoomView, at: [number, number], heightCm = 168, move?: CameraMove) => {
  const c = camera(moved(VIEWS[view], move));
  const scale = (heightCm / 590) * c.pxcm([at[0], 0, at[1]]);
  const [x, y] = c.project([at[0], 0, at[1]]);
  return { x, y: y - 590 * scale, scale };
};

/** Nguồn sáng trong phòng (cm): tâm cửa sổ tường phải cho ban ngày, bóng đèn bàn cho ban đêm. */
export const LIGHT_SOURCES = { window: [W, 150, 155] as V3, lamp: [418, 100, 37] as V3 };
/**
 * Hướng sáng cho nhân vật đứng tại `at`, tính bằng chính camera của shot: x, y là hướng trên màn hình từ ngực
 * tới nguồn sáng (mảng tối nằm phía ngược lại); gx, gy là độ lệch bóng tiếp đất theo đơn vị rig, đổ trên sàn
 * theo hướng rời xa nguồn sáng.
 */
export const lightFor = (view: RoomView, at: [number, number], source: V3 = LIGHT_SOURCES.window, move?: CameraMove) => {
  // Tính trong hệ camera (phải, lên, tới), không qua phép chiếu: nguồn sáng ngang tầm máy sẽ không làm đảo dấu.
  const cam = camera(moved(VIEWS[view], move));
  const a = cam.toCam([at[0], 120, at[1]]), b = cam.toCam(source);
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], dn = Math.hypot(dx, dy, dz) || 1;
  const n = Math.hypot(dx, dy) || 1, sx = dx, sy = -dy;
  const back = clamp(dz / dn, 0, 1); // 1: nguồn sáng ở sau lưng người so với máy (ngược sáng), 0: ngang hoặc phía máy
  const ax = at[0] - source[0], az = at[1] - source[2], an = Math.hypot(ax, az) || 1;
  const foot = placeOn(view, at, 168, move), cast = placeOn(view, [at[0] + (ax / an) * 30, at[1] + (az / an) * 30], 168, move);
  const floorY = (p: { y: number; scale: number }) => p.y + 590 * p.scale; // placeOn trả đỉnh đầu; cộng lại ra điểm sàn
  return { x: sx / n, y: sy / n, back, gx: (cast.x - foot.x) / foot.scale, gy: (floorY(cast) - floorY(foot)) / foot.scale }; // px → đơn vị rig
};

const hull = (pts: P2[]) => {
  const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: P2[]) => { const h: P2[] = []; for (const p of list) { while (h.length > 1 && cr(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop(); h.push(p); } h.pop(); return h; };
  return [...half(s), ...half([...s].reverse())];
};
const roundPath = (p: P2[], r: number) => {
  const n = p.length;
  return p.map((c, i) => {
    const a = p[(i + n - 1) % n], b = p[(i + 1) % n];
    const la = Math.hypot(a[0] - c[0], a[1] - c[1]) || 1, lb = Math.hypot(b[0] - c[0], b[1] - c[1]) || 1;
    const ka = Math.min(r, la / 2) / la, kb = Math.min(r, lb / 2) / lb;
    const s = [c[0] + (a[0] - c[0]) * ka, c[1] + (a[1] - c[1]) * ka], e = [c[0] + (b[0] - c[0]) * kb, c[1] + (b[1] - c[1]) * kb];
    return `${i ? 'L' : 'M'}${f1(s[0])} ${f1(s[1])}Q${f1(c[0])} ${f1(c[1])} ${f1(e[0])} ${f1(e[1])}`;
  }).join('') + 'Z';
};
const smoothPath = (p: P2[], closed: boolean) => {
  const n = p.length, at = (i: number) => (closed ? p[(i + n) % n] : p[clamp(i, 0, n - 1)]);
  let d = `M${f1(p[0][0])} ${f1(p[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const a = at(i - 1), b = at(i), c = at(i + 1), e = at(i + 2);
    d += `C${f1(b[0] + (c[0] - a[0]) / 6)} ${f1(b[1] + (c[1] - a[1]) / 6)} ${f1(c[0] - (e[0] - b[0]) / 6)} ${f1(c[1] - (e[1] - b[1]) / 6)} ${f1(c[0])} ${f1(c[1])}`;
  }
  return d + (closed ? 'Z' : '');
};

const INK = '#40443f';
const C = {
  wall: '#ece1cb', lower: '#c9d0ba', trim: '#f3ead6', floor: '#d6ccb6', tile: '#bdb39c', ceiling: '#e6decb',
  door: '#7f9c90', doorIn: '#94ae9f', metal: '#b4bdba', steel: '#8f9c9a', wood: '#c99e68', woodDark: '#94714c', woodDeep: '#6d5540',
  cabinet: '#a5b8a4', counter: '#e6e2d2', red: '#bb6a52', cream: '#f2e8d2', mat: '#b4c6b4', matSide: '#8fa796', blanket: '#68877f', teal: '#7ba5a2', chair: '#8ca188',
};

export type RoomProps = {
  className?: string;
  view?: RoomView;
  night?: boolean;
  /** 0: nắng sớm, 1: nắng đã rút gần hết (chiều). */
  sun?: number;
  /** 0–1: vệt nắng xiên từ cửa sổ xuống sàn (khối sáng mờ đè lên cả người), làm rõ hướng nguồn sáng. Chỉ ban ngày. */
  rays?: number;
  door?: 'ajar' | 'open' | 'closed' | 'latched';
  chair?: keyof typeof SEATS;
  phone?: 'mat' | 'desk' | 'hidden';
  /** messy: chén chất trong bồn, vụn mì cạnh bếp; clean: chén úp trên giá, sàn sạch. */
  kitchen?: 'messy' | 'clean';
  drawerOpen?: boolean;
  move?: CameraMove;
  /** Vẽ dưới chăn, trên gối của Nam (đầu người đang ngủ). */
  sleeper?: (p: { x: number; y: number; scale: number; plug?: [number, number] }) => React.ReactNode; // plug: ổ cắm cạnh nệm trên màn hình, cho cáp sạc
  wallet?: boolean;
  clockMinutes?: number | null;
  /** Nhân vật/đạo cụ đứng trên sàn; được xếp lớp theo độ sâu cùng đồ đạc. */
  actors?: { at: [number, number]; render: (p: { x: number; y: number; scale: number }) => React.ReactNode }[];
  children?: React.ReactNode;
};

type FaceOpt = { n?: V3; cull?: boolean; stroke?: string; w?: number; op?: number; raw?: boolean };

const SHOT_LABEL: Record<RoomView, string> = { wide: 'Toàn phòng', kitchen: 'Góc bếp', desk: 'Góc bàn học', door: 'Cửa phòng và chốt', hallway: 'Hành lang trước cửa', bed: 'Góc nệm' };

export function RoomScene({ className = '', view = 'wide', night = false, sun = 0, rays = 0, door = 'closed', chair = 'desk', phone = 'mat', kitchen = 'messy', drawerOpen = false, wallet = true, clockMinutes = null, actors = [], move, sleeper, children }: RoomProps) {
  const uid = 'room' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const cam = camera(moved(VIEWS[view], move));
  const inHall = view === 'hallway';
  let sink: React.ReactNode[] = [];
  let key = 0;
  const NEAR = 14;
  // Bàn, ghế, bếp hạ thấp theo tỉ lệ chân ngắn của rig; phần dưới co lại, đồ phía trên giữ nguyên hình.
  let yMap = (y: number) => y;
  const mapY = (p: V3): V3 => [p[0], yMap(p[1]), p[2]];
  const Q = (p: V3) => cam.toCam(mapY(p));
  const P = (p: V3) => cam.screen(Q(p));
  const fitY = (top: number, to: number, fn: () => void) => () => { yMap = (y) => (y <= top ? (y * to) / top : y - (top - to)); fn(); yMap = (y) => y; };

  const lights: { p: V3; col: [number, number, number]; r: number; k: number }[] = [
    { p: [420, 100, 36], col: [1, 0.8, 0.52], r: 150, k: 1.5 },
    { p: [392, 84, 44], col: [0.62, 0.86, 0.95], r: 80, k: 0.7 },
  ];
  const L = norm([0.55, 0.6, 0.58]);
  let lampsOff = false; // tường, sàn là mặt lớn: ánh đèn trên đó vẽ bằng vùng sáng, không tính theo tâm mặt
  const shade = (hex: string, n: V3, at: V3) => {
    const c = rgb(hex);
    if (!night) { const k = 0.74 + 0.34 * Math.max(0, dot(n, L)); return `rgb(${c.map((v) => Math.round(Math.min(255, v * k))).join(',')})`; }
    const out = [c[0] * 0.2 + 6, c[1] * 0.24 + 10, c[2] * 0.36 + 22];
    for (const l of lampsOff ? [] : lights) {
      const to = sub(l.p, at), d = Math.hypot(to[0], to[1], to[2]);
      const I = (Math.max(0, dot(n, norm(to)) + 0.25) * l.k) / (1 + (d / l.r) ** 2);
      const J = Math.min(I, 0.5);
      out[0] += c[0] * J * l.col[0]; out[1] += c[1] * J * l.col[1]; out[2] += c[2] * J * l.col[2];
    }
    return `rgb(${out.map((v) => Math.round(Math.min(255, v))).join(',')})`;
  };
  const nightOf = (hex: string) => (night ? shade(hex, [0, 0, 0], [9999, 0, 9999]) : hex);

  const clip = (ps: V3[]) => {
    const q = ps.map(Q), out: V3[] = [];
    q.forEach((a, i) => {
      const b = q[(i + 1) % q.length];
      if (a[2] >= NEAR) out.push(a);
      if (a[2] >= NEAR !== b[2] >= NEAR) { const t = (NEAR - a[2]) / (b[2] - a[2]); out.push(add(a, mul(sub(b, a), t))); }
    });
    return out.map(cam.screen);
  };
  const behind = (ps: V3[]) => ps.some((p) => Q(p)[2] < NEAR * 2);
  const lineW = (p: V3) => clamp(0.5 * cam.pxcm(p) + 0.7, 1.6, 4.4);
  const center = (ps: V3[]) => mul(ps.reduce((a, b) => add(a, b), [0, 0, 0] as V3), 1 / ps.length);

  const poly = (ps: V3[], fill: string, o: FaceOpt = {}) => {
    const c = center(ps), n = o.n ?? ([0, 1, 0] as V3);
    if (o.cull !== false && o.n && dot(n, sub(cam.pos, c)) <= 0) return;
    const pts = clip(ps);
    if (pts.length < 3) return;
    sink.push(<path key={key++} d={`M${pts.map((p) => `${f1(p[0])} ${f1(p[1])}`).join('L')}Z`} fill={o.raw ? fill : shade(fill, n, c)} stroke={o.stroke ?? 'none'} strokeWidth={o.w ?? 1} strokeLinejoin="round" opacity={o.op} />);
  };
  /** Chỉ cho phần vẽ trong fn lộ qua một ô mở (lòng bồn, khe cửa, cửa sổ). */
  const inClip = (hole: V3[], fn: () => void) => {
    if (behind(hole)) { fn(); return; }
    const id = `${uid}-c${key++}`, p = hole.map(P);
    sink.push(<clipPath key={key++} id={id}><path d={`M${p.map((q) => `${f1(q[0])} ${f1(q[1])}`).join('L')}Z`} /></clipPath>);
    const before = sink; sink = [];
    fn();
    before.push(<g key={key++} clipPath={`url(#${id})`}>{sink}</g>);
    sink = before;
  };
  const line = (a: V3, b: V3, stroke: string, w: number) => {
    const pts = clip([a, b, b]);
    if (pts.length < 2) return;
    sink.push(<path key={key++} d={`M${f1(pts[0][0])} ${f1(pts[0][1])}L${f1(pts[1][0])} ${f1(pts[1][1])}`} stroke={night ? nightOf(stroke) : stroke} strokeWidth={w} strokeLinecap="round" fill="none" />);
  };
  type BoxOpt = { x: [number, number]; y: [number, number]; z: [number, number]; c: string; top?: string; front?: string; side?: string; xf?: (p: V3) => V3; ink?: boolean };
  const box = (o: BoxOpt) => {
    const T = o.xf ?? ((p: V3) => p);
    const R = (n: V3) => sub(T(n), T([0, 0, 0]));
    const [x0, x1] = o.x, [y0, y1] = o.y, [z0, z1] = o.z;
    const faces: [V3, V3[], string][] = [
      [[0, 0, 1], [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], o.front ?? o.c],
      [[0, 0, -1], [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], o.c],
      [[1, 0, 0], [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], o.side ?? o.c],
      [[-1, 0, 0], [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], o.side ?? o.c],
      [[0, 1, 0], [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], o.top ?? o.c],
      [[0, -1, 0], [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], o.c],
    ];
    const vis: P2[] = [];
    let ref: V3 = [0, 0, 0];
    for (const [n, ps, col] of faces) {
      const W3 = ps.map(T), N = R(n);
      if (dot(N, sub(cam.pos, center(W3))) <= 0) continue;
      if (W3.some((p) => Q(p)[2] < NEAR)) { poly(W3, col, { n: N, cull: false }); continue; }
      poly(W3, col, { n: N, cull: false, stroke: 'rgba(50,55,50,.28)', w: 1 });
      vis.push(...W3.map(P)); ref = W3[0];
    }
    if (vis.length > 2 && o.ink !== false) { const w = lineW(ref); sink.push(<path key={key++} d={roundPath(hull(vis), w * 1.6)} fill="none" stroke={nightOf(INK)} strokeWidth={w} strokeLinejoin="round" />); }
  };
  const soft = (ps: V3[], col: string, o: { n?: V3; w?: number; raw?: boolean; op?: number; noInk?: boolean } = {}) => {
    const p2 = clip(ps), n = o.n ?? ([0, 1, 0] as V3);
    if (p2.length < 3) return;
    sink.push(<path key={key++} d={smoothPath(p2, true)} fill={o.raw ? col : shade(col, n, center(ps))} stroke={o.noInk ? 'none' : nightOf(INK)} strokeWidth={o.w ?? lineW(ps[0])} strokeLinejoin="round" opacity={o.op} />);
  };
  const curve = (ps: V3[], stroke: string, w: number, op?: number) => {
    if (behind(ps)) return;
    sink.push(<path key={key++} d={smoothPath(ps.map(P), false)} fill="none" stroke={nightOf(stroke)} strokeWidth={w} strokeLinecap="round" opacity={op} />);
  };
  const tube = (ps: V3[], cm: number, col: string) => {
    if (behind(ps)) return;
    const w = cm * cam.pxcm(ps[Math.floor(ps.length / 2)]), iw = lineW(ps[0]), d = ps.length > 2 ? smoothPath(ps.map(P), false) : `M${ps.map(P).map((p) => `${f1(p[0])} ${f1(p[1])}`).join('L')}`;
    sink.push(<g key={key++} fill="none" strokeLinecap="round"><path d={d} stroke={nightOf(INK)} strokeWidth={w + iw * 1.5} /><path d={d} stroke={night ? nightOf(col) : col} strokeWidth={w} /></g>);
  };
  const ring = (c: V3, r: number, y: number) => Array.from({ length: 22 }, (_, i) => { const t = (i / 22) * Math.PI * 2; return [c[0] + Math.cos(t) * r, y, c[2] + Math.sin(t) * r] as V3; });
  const cyl = (c: V3, r: number, h: number, col: string, o: { top?: string; r2?: number } = {}) => {
    if (behind([c, add(c, [0, h, 0])])) return;
    const top = ring(c, o.r2 ?? r, c[1] + h), bot = ring(c, r, c[1]);
    const outline = hull([...top, ...bot].map(P)), w = lineW(c), d = roundPath(outline, w);
    const body = shade(col, [0.4, 0, 0.9], c);
    sink.push(<g key={key++} strokeLinejoin="round"><path d={d} fill={body} /><path d={d} fill={`url(#${uid}-cyl)`} /><path d={d} fill="none" stroke={nightOf(INK)} strokeWidth={w} /></g>);
    if (c[1] + h < cam.pos[1]) poly(top, o.top ?? col, { n: [0, 1, 0], cull: false, stroke: nightOf(INK), w: w * 0.7 });
  };
  const bowl = (c: V3, r: number, col: string) => cyl(c, r * 0.55, r * 0.75, col, { r2: r, top: '#a79a7f' });

  /** Bóng đổ mềm trên sàn: footprint kéo theo hướng sáng từ cửa sổ. */
  const groundShadow = (x: [number, number], z: [number, number], h: number, op = 0.17) => {
    if (night) op *= 1.7;
    const foot: V3[] = [[x[0], 0, z[0]], [x[1], 0, z[0]], [x[1], 0, z[1]], [x[0], 0, z[1]]];
    if (behind(foot)) return;
    const cast = foot.map((p) => [p[0] - h * 0.42, 0, p[2] + h * 0.3] as V3);
    const pts = hull([...foot, ...cast].map(P));
    sink.push(<path key={key++} d={roundPath(pts, 10)} fill="#3e4a3e" opacity={op} filter={`url(#${uid}-blur)`} />);
    const ao = hull(foot.map(P));
    sink.push(<path key={key++} d={roundPath(ao, 6)} fill="#2f382f" opacity={op * 1.5} filter={`url(#${uid}-blur-sm)`} />);
  };
  const aoLine = (a: V3, b: V3, wide: number, op: number) => {
    const p = clip([a, b, b]);
    if (p.length < 2) return;
    sink.push(<path key={key++} d={`M${f1(p[0][0])} ${f1(p[0][1])}L${f1(p[1][0])} ${f1(p[1][1])}`} stroke="#39443a" strokeWidth={wide} opacity={night ? op * 1.3 : op} filter={`url(#${uid}-blur)`} fill="none" />);
  };

  /** Phố nhìn qua cửa sổ/cửa ra vào: một tấm cảnh xa, có thị sai thật khi đổi góc máy. */
  const city = (X: number) => {
    const n: V3 = X > 0 ? [-1, 0, 0] : [1, 0, 0];
    const sky = night ? '#1b2a44' : '#bfe0dc';
    poly([[X, -600, -4200], [X, -600, 2600], [X, 2200, 2600], [X, 2200, -4200]], sky, { raw: true });
    const hues = ['#d9c7a6', '#c7b79a', '#e0d3b5', '#b9b49a', '#d4bea0'];
    for (let i = 0; i < 26; i++) {
      const z0 = -4100 + i * 260, seed = (i * 37) % 11, top = 260 + seed * 62, w = 190 + (seed % 3) * 30;
      const col = night ? '#22304a' : hues[i % 5];
      poly([[X, -600, z0], [X, -600, z0 + w], [X, top, z0 + w], [X, top, z0]], col, { raw: true, n, stroke: night ? '#121b2c' : '#a5977c', w: 1.4, cull: false });
      poly([[X, top, z0 - 12], [X, top, z0 + w + 12], [X, top + 70, z0 + w / 2]], night ? '#1a2439' : i % 2 ? '#b57a5e' : '#8b9a85', { raw: true, n, cull: false });
      for (let r = 0; r < 3; r++) for (let q = 0; q < 2; q++) {
        const wy = top - 80 - r * 110, wz = z0 + 36 + q * 90, lit = night && (i + r + q) % 3 === 0;
        poly([[X, wy, wz], [X, wy, wz + 44], [X, wy + 64, wz + 44], [X, wy + 64, wz]], lit ? '#f1cf85' : night ? '#141d30' : '#8fa6a3', { raw: true, n, cull: false });
      }
    }
    for (let i = 0; i < 12; i++) {
      const z = -3900 + i * 540, y = -60 + ((i * 53) % 70);
      soft([[X, -400, z - 260], [X, y, z - 300], [X, y + 170, z - 90], [X, y + 110, z + 110], [X, y + 190, z + 280], [X, -400, z + 330]], night ? '#16251f' : '#7fa27c', { raw: true, noInk: true });
    }
  };

  const shirt = (x: number, y: number, z: number, s: number, col: string) => {
    const P = (a: number, b: number): V3 => [x + a * s, y + b * s, z];
    soft([P(-8, 0), P(-22, -8), P(-30, -24), P(-18, -30), P(-14, -24), P(-14, -68), P(14, -68), P(14, -24), P(18, -30), P(30, -24), P(22, -8), P(8, 0), P(0, -6)], col, { n: [0, 0, 1], w: 1.8 });
  };
  const pillow = (x: [number, number], z: [number, number], y: number, col: string) => {
    const [a, b] = x, [c, e] = z, h = y + 9;
    soft([[a, y, c + 6], [(a + b) / 2, y + 3, c - 1], [b, y, c + 6], [b + 2, y + 4, (c + e) / 2], [b, y, e - 6], [(a + b) / 2, y + 3, e + 1], [a, y, e - 6], [a - 2, y + 4, (c + e) / 2]], '#6f8778', { noInk: true, op: 0.45 });
    soft([[a + 2, h, c + 7], [(a + b) / 2, h + 3, c + 1], [b - 2, h, c + 7], [b, h + 3, (c + e) / 2], [b - 2, h, e - 7], [(a + b) / 2, h + 3, e - 1], [a + 2, h, e - 7], [a, h + 3, (c + e) / 2]], col);
    curve([[a + 12, h + 6, c + 12], [(a + b) / 2, h + 9, (c + e) / 2 - 4], [b - 14, h + 6, e - 14]], '#a59f86', 1.6, 0.8);
  };

  const shell = () => {
    if (inHall) {
      poly([[0, 0, 330], [460, 0, 330], [460, 0, 110], [0, 0, 110]], C.floor, { n: [0, 1, 0], cull: false });
      poly([[459, 0, 110], [459, 0, 330], [459, 105, 330], [459, 105, 110]], C.lower, { n: [-1, 0, 0], cull: false });
      poly([[459, 105, 110], [459, 105, 330], [459, H, 330], [459, H, 110]], C.wall, { n: [-1, 0, 0], cull: false });
      bedUnit();
      const seg = (z0: number, z1: number, y0: number, y1: number, col: string) => poly([[-14, y0, z1], [-14, y0, z0], [-14, y1, z0], [-14, y1, z1]], col, { n: [0.5, 0.5, 0.7], cull: false });
      const STAIR = [-112, -22], N2 = [430, 520];
      const wallBand = (z0: number, z1: number) => { seg(z0, z1, 0, 110, '#b2bfac'); seg(z0, z1, 110, H, '#e4d9c1'); };
      wallBand(-900, STAIR[0]); wallBand(STAIR[1], DOOR.z0); wallBand(DOOR.z1, 1200);
      seg(DOOR.z0, DOOR.z1, DOOR.top, H, '#e4d9c1');
      poly([[120, 0, STAIR[0]], [120, 0, STAIR[1]], [120, 260, STAIR[1]], [120, 260, STAIR[0]]], '#b9b49c', { n: [0.5, 0.5, 0.7], cull: false });
      for (let i = 7; i >= 0; i--) box({ x: [-14 + i * 18, 4 + i * 18], y: [0, 15 * (i + 1)], z: [STAIR[0], STAIR[1]], c: '#b5ab94', top: '#d9cfb8', side: '#c9bea6' });
      for (let i = 0; i < 8; i += 2) { const x = -5 + i * 18; line([x, 15 * (i + 1), STAIR[1] - 5], [x, 15 * (i + 1) + 92, STAIR[1] - 5], '#6e7d76', 3); }
      tube([[-16, 96, STAIR[1] - 5], [112, 212, STAIR[1] - 5]], 3, '#6e7d76');
      seg(STAIR[0], STAIR[1], 215, H, '#e4d9c1');
      poly([[-320, 0, -900], [-14, 0, -900], [-14, 0, 1200], [-320, 0, 1200]], '#cbc0a8', { n: [0, 1, 0], cull: false });
      for (let z = -900; z <= 1200; z += 40) line([-320, 0, z], [-14, 0, z], '#b4aa93', 1.2);
      for (let x = -320; x <= -14; x += 40) line([x, 0, -900], [x, 0, 1200], '#b4aa93', 1.2);
      poly([[-320, H, -900], [-14, H, -900], [-14, H, 1200], [-320, H, 1200]], '#efe7d4', { n: [0, -1, 0], cull: false });
      aoLine([-14, 0, -900], [-14, 0, 1200], 22, 0.3);
      aoLine([-14, H, -900], [-14, H, 1200], 26, 0.22);
      for (const [a, b] of [[N2[0], N2[1]]]) {
        box({ x: [-17, -14], y: [0, 212], z: [a - 8, b + 8], c: C.trim, ink: false });
        box({ x: [-19, -14], y: [1, 205], z: [a, b], c: '#a48a68' });
        poly([[-19.5, 30, b - 14], [-19.5, 30, a + 14], [-19.5, 190, a + 14], [-19.5, 190, b - 14]], '#b49a78', { n: [-1, 0, 0], cull: false, stroke: 'rgba(60,50,40,.4)', w: 1 });
      }
      box({ x: [-22, -14], y: [168, 196], z: [130, 150], c: '#9aa79e' });
      tube([[-15, 196, 140], [-15, 262, 140]], 2.2, '#8f968b');
      curve([[-15, 250, -900], [-15, 252, 400], [-15, 250, 1200]], '#8b8f83', 2.2);
      box({ x: [-90, -82], y: [258, 263], z: [150, 280], c: night ? '#fff0c9' : '#f7f3e4', ink: true });
      box({ x: [-60, -18], y: [0, 1.5], z: [186, 244], c: '#7f8f7c', top: '#8a9a86' });
      cyl([-32, 0, 395], 9, 18, C.red, { top: '#5d4a3d', r2: 12 });
      soft([[-32, 18, 378], [-32, 50, 382], [-32, 66, 395], [-32, 50, 410], [-32, 18, 412]], '#6e9678', { n: [0.5, 0.5, 0.7] });
      return;
    }
    city(1000);
    city(-800);
    poly([[-160, 0, -700], [-14, 0, -700], [-14, 0, 1200], [-160, 0, 1200]], night ? '#2a3039' : '#dcd2bb', { raw: true });
    poly([[-160, H, -700], [-14, H, -700], [-14, H, 1200], [-160, H, 1200]], night ? '#20262f' : '#f2ecdd', { raw: true });
    box({ x: [-156, -148], y: [100, 106], z: [-700, 1200], c: C.door });
    for (let z = -700; z < 1200; z += 16) line([-152, 0, z], [-152, 100, z], '#6d857a', 2);

    const col = (y0: number, y1: number) => (y1 <= 105 ? C.lower : C.wall);
    const bands: [number, number][] = [[0, 105], [105, H]];
    for (const [y0, y1] of bands) {
      poly([[0, y0, 0], [W, y0, 0], [W, y1, 0], [0, y1, 0]], col(y0, y1), { n: [0, 0, 1], cull: false });
      for (const [a, b] of [[0, DOOR.z0], [DOOR.z1, D]]) poly([[0, y0, b], [0, y0, a], [0, y1, a], [0, y1, b]], col(y0, y1), { n: [1, 0, 0], cull: false });
      for (const [a, b] of [[0, WIN.z0], [WIN.z1, D]]) poly([[W, y0, a], [W, y0, b], [W, y1, b], [W, y1, a]], col(y0, y1), { n: [-1, 0, 0], cull: false });
    }
    poly([[0, DOOR.top, DOOR.z1], [0, DOOR.top, DOOR.z0], [0, H, DOOR.z0], [0, H, DOOR.z1]], C.wall, { n: [1, 0, 0], cull: false });
    poly([[W, 0, WIN.z0], [W, 0, WIN.z1], [W, Math.min(105, WIN.y0), WIN.z1], [W, Math.min(105, WIN.y0), WIN.z0]], C.lower, { n: [-1, 0, 0], cull: false });
    poly([[W, WIN.y1, WIN.z0], [W, WIN.y1, WIN.z1], [W, H, WIN.z1], [W, H, WIN.z0]], C.wall, { n: [-1, 0, 0], cull: false });
    poly([[0, H, D], [W, H, D], [W, H, 0], [0, H, 0]], C.ceiling, { n: [0.4, 0.5, 0.7], cull: false });
    poly([[0, 0, D], [W, 0, D], [W, 0, 0], [0, 0, 0]], C.floor, { n: [0, 1, 0], cull: false });
    for (let x = 0; x <= W; x += 46) line([x, 0, 0], [x, 0, D], C.tile, 1.5);
    for (let z = 0; z <= D; z += 46) line([0, 0, z], [W, 0, z], C.tile, 1.5);

    line([0, 105, 0], [W, 105, 0], C.trim, 3);
    for (const [a, b] of [[0, DOOR.z0], [DOOR.z1, D]]) line([0, 105, a], [0, 105, b], C.trim, 3);
    for (const [a, b] of [[0, WIN.z0], [WIN.z1, D]]) line([W, 105, a], [W, 105, b], C.trim, 3);
    box({ x: [0, W], y: [0, 8], z: [0, 1.5], c: '#b5b7a2', ink: false });
    box({ x: [0, 1.5], y: [0, 8], z: [0, DOOR.z0], c: '#b5b7a2', ink: false });
    box({ x: [0, 1.5], y: [0, 8], z: [DOOR.z1, D], c: '#b5b7a2', ink: false });
    box({ x: [W - 1.5, W], y: [0, 8], z: [0, D], c: '#b5b7a2', ink: false });

    aoLine([0, 0, 0], [W, 0, 0], 24, 0.3); aoLine([0, 0, 0], [0, 0, D], 24, 0.28); aoLine([W, 0, 0], [W, 0, D], 24, 0.28);
    aoLine([0, H, 0], [W, H, 0], 26, 0.2); aoLine([0, 0, 0], [0, H, 0], 22, 0.24); aoLine([W, 0, 0], [W, H, 0], 22, 0.24);
    aoLine([0, H, 0], [0, H, D], 26, 0.18); aoLine([W, H, 0], [W, H, D], 26, 0.18);

    // Vết đời sống trên tường: ống điện, vết ẩm, vết nứt.
    line([120, H, 1], [120, 196, 1], '#a7a491', 3);
    box({ x: [115, 125], y: [184, 196], z: [0.5, 2], c: '#e8e2cf', ink: false });
    soft([[440, 265, 1], [370, 262, 1], [330, 240, 1], [352, 228, 1], [392, 234, 1], [430, 214, 1], [460, 222, 1]], '#c9bfa3', { n: [0, 0, 1], noInk: true, op: 0.28 });
    curve([[203, H, 1], [205, 238, 1], [214, 222, 1], [208, 208, 1], [221, 194, 1]], '#a79d86', 1.8);
    box({ x: [188, 252], y: [258, 263], z: [320, 328], c: night ? '#49505a' : '#f6f2e4' });
    box({ x: [388, 412], y: [150, 182], z: [0.5, 1.5], c: '#e9c77e', ink: false });
    box({ x: [352, 382], y: [172, 212], z: [0.5, 1.5], c: '#e6dbc2' });
    for (const y of [204, 196, 188, 180]) line([356, y, 1.8], [378, y, 1.8], '#a9ad93', 1.8);
    box({ x: [12, 26], y: [112, 124], z: [0.5, 1.5], c: '#f1ecdb' });
    if (clockMinutes !== null) {
      const c: V3 = [300, 228, 2];
      cyl(c, 0, 0, C.cream);
      soft(Array.from({ length: 12 }, (_, i) => [c[0] + Math.cos((i / 12) * 6.283) * 15, c[1] + Math.sin((i / 12) * 6.283) * 15, 2] as V3), C.cream, { n: [0, 0, 1] });
      const hand = (deg: number, len: number) => line(c, [c[0] + Math.sin((deg * Math.PI) / 180) * len, c[1] + Math.cos((deg * Math.PI) / 180) * len, 2], INK, 2.4);
      hand((clockMinutes % 720) * 0.5, 8); hand((clockMinutes % 60) * 6, 12);
    }

    // Nắng qua cửa sổ, tính bằng tia sáng thật nên rơi đúng chỗ ở mọi góc máy.
    if (!night) sunPatch(0, null);
    groundShadow([12, 176], [4, 68], 84);
    groundShadow([225, 315], [4, 58], 192);
    groundShadow([340, 452], [6, 66], 75, 0.14);
    groundShadow([252, 452], [215, 375], 24, 0.22);
  };

  const sunDir = norm([-1, -(0.62 + sun * 1.5), 0.45 - sun * 0.8]);
  const sunPanes = () => {
    const zM = (WIN.z0 + WIN.z1) / 2, yM = (WIN.y0 + WIN.y1) / 2, g = 3;
    return [[WIN.z0 + 5, zM - g, WIN.y0 + 5, yM - g], [zM + g, WIN.z1 - 5, WIN.y0 + 5, yM - g], [WIN.z0 + 5, zM - g, yM + g, WIN.y1 - 5], [zM + g, WIN.z1 - 5, yM + g, WIN.y1 - 5]];
  };
  const sunPatch = (planeY: number, clipId: string | null) => {
    const strength = 0.62 * (1 - sun * 0.7);
    const cast = (p: V3) => add(p, mul(sunDir, (p[1] - planeY) / -sunDir[1]));
    const g: React.ReactNode[] = sunPanes().map(([a, b, c, e], i) => {
      const pts = [[W, c, a], [W, c, b], [W, e, b], [W, e, a]].map((p) => cast(p as V3)).filter((p) => p[0] >= (clipId ? 252 : 0));
      if (pts.length < 3 || behind(pts)) return null;
      return <path key={i} d={roundPath(pts.map(P), 5)} fill={sun > 0.5 ? '#f3c98e' : '#fff0c2'} />;
    });
    sink.push(<g key={key++} opacity={strength} clipPath={clipId ? `url(#${clipId})` : undefined} style={{ mixBlendMode: 'soft-light' }}>{g}</g>);
    sink.push(<g key={key++} opacity={strength * 0.55} clipPath={clipId ? `url(#${clipId})` : undefined}>{g}</g>);
  };

  const windowUnit = () => {
    const x0 = W, x1 = W + 14;
    inClip([[W, WIN.y0, WIN.z0], [W, WIN.y0, WIN.z1], [W, WIN.y1, WIN.z1], [W, WIN.y1, WIN.z0]], () => {
    poly([[x0, WIN.y0, WIN.z0], [x1, WIN.y0, WIN.z0], [x1, WIN.y1, WIN.z0], [x0, WIN.y1, WIN.z0]], C.trim, { n: [0, 0, 1] });
    poly([[x1, WIN.y0, WIN.z1], [x0, WIN.y0, WIN.z1], [x0, WIN.y1, WIN.z1], [x1, WIN.y1, WIN.z1]], C.wall, { n: [0, 0, -1] });
    poly([[x0, WIN.y1, WIN.z0], [x1, WIN.y1, WIN.z0], [x1, WIN.y1, WIN.z1], [x0, WIN.y1, WIN.z1]], C.wall, { n: [0, -1, 0], cull: false });
    poly([[x0, WIN.y0, WIN.z1], [x1, WIN.y0, WIN.z1], [x1, WIN.y0, WIN.z0], [x0, WIN.y0, WIN.z0]], C.cream, { n: [0, 1, 0], cull: false });
    const bar = '#6c8579';
    const zM = (WIN.z0 + WIN.z1) / 2, yM = (WIN.y0 + WIN.y1) / 2, X = x1 - 5;
    for (let z = WIN.z0 + 13; z < WIN.z1; z += 13) line([x1 - 1, WIN.y0, z], [x1 - 1, WIN.y1, z], '#59695f', 2.4);
    box({ x: [X, X + 3], y: [WIN.y0, WIN.y0 + 5], z: [WIN.z0, WIN.z1], c: bar, ink: false });
    box({ x: [X, X + 3], y: [WIN.y1 - 5, WIN.y1], z: [WIN.z0, WIN.z1], c: bar, ink: false });
    box({ x: [X, X + 3], y: [WIN.y0, WIN.y1], z: [WIN.z0, WIN.z0 + 5], c: bar, ink: false });
    box({ x: [X, X + 3], y: [WIN.y0, WIN.y1], z: [WIN.z1 - 5, WIN.z1], c: bar, ink: false });
    box({ x: [X, X + 3], y: [WIN.y0, WIN.y1], z: [zM - 2.5, zM + 2.5], c: bar, ink: false });
    box({ x: [X, X + 3], y: [yM - 2.5, yM + 2.5], z: [WIN.z0, WIN.z1], c: bar, ink: false });
    });
    box({ x: [W - 7, W + 2], y: [WIN.y0 - 5, WIN.y0], z: [WIN.z0 - 8, WIN.z1 + 8], c: C.cream });
    tube([[W - 5, WIN.y1 + 13, WIN.z0 - 28], [W - 5, WIN.y1 + 13, WIN.z1 + 28]], 2, '#8b7a5e');
    const curtain = (a: number, b: number) => {
      const dir = b > a ? 1 : -1, x = W - 5, top = WIN.y1 + 12, bot = WIN.y0 - 16;
      soft([[x, top, a], [x, top, b], [x + 3, (top + bot) / 2, b - dir * 6], [x, bot, b + dir * 3], [x - 2, bot - 3, (a + b) / 2], [x + 2, bot, a]], '#efe3c2', { n: [-1, 0, 0], w: 2 });
      for (let i = 1; i < 4; i++) { const z = a + ((b - a) * i) / 4; curve([[x - 1, top, z], [x - 1, (top + bot) / 2, z + dir * 3], [x - 1, bot + 3, z - dir * 2]], '#c8b990', 1.7); }
    };
    curtain(WIN.z0 - 26, WIN.z0 + 20); curtain(WIN.z1 + 26, WIN.z1 - 20);
  };

  const doorUnit = () => {
    const a = (door === 'open' ? 78 : door === 'ajar' ? 13 : 0) * (Math.PI / 180);
    const T = (p: V3): V3 => [p[2] * Math.sin(a) + p[0] * Math.cos(a), p[1], DOOR.z0 + p[2] * Math.cos(a) - p[0] * Math.sin(a)];
    const dW = DOOR.z1 - DOOR.z0;
    if (!inHall) {
      inClip([[0, 0, DOOR.z0], [0, 0, DOOR.z1], [0, DOOR.top, DOOR.z1], [0, DOOR.top, DOOR.z0]], () => {
      poly([[-14, 0, DOOR.z1], [0, 0, DOOR.z1], [0, 0, DOOR.z0], [-14, 0, DOOR.z0]], '#b4ac96', { n: [0, 1, 0], cull: false });
      poly([[-14, 0, DOOR.z0], [0, 0, DOOR.z0], [0, DOOR.top, DOOR.z0], [-14, DOOR.top, DOOR.z0]], C.trim, { n: [0, 0, 1] });
      poly([[0, 0, DOOR.z1], [-14, 0, DOOR.z1], [-14, DOOR.top, DOOR.z1], [0, DOOR.top, DOOR.z1]], C.trim, { n: [0, 0, -1] });
      poly([[-14, DOOR.top, DOOR.z0], [0, DOOR.top, DOOR.z0], [0, DOOR.top, DOOR.z1], [-14, DOOR.top, DOOR.z1]], C.trim, { n: [0, -1, 0], cull: false });
      });
      box({ x: [0, 3], y: [0, DOOR.top + 8], z: [DOOR.z0 - 8, DOOR.z0], c: C.trim });
      box({ x: [0, 3], y: [0, DOOR.top + 8], z: [DOOR.z1, DOOR.z1 + 8], c: C.trim });
      box({ x: [0, 3], y: [DOOR.top, DOOR.top + 8], z: [DOOR.z0, DOOR.z1], c: C.trim });
    } else {
      box({ x: [-18, -14], y: [0, DOOR.top + 8], z: [DOOR.z0 - 8, DOOR.z0], c: C.trim });
      box({ x: [-18, -14], y: [0, DOOR.top + 8], z: [DOOR.z1, DOOR.z1 + 8], c: C.trim });
      box({ x: [-18, -14], y: [DOOR.top, DOOR.top + 8], z: [DOOR.z0, DOOR.z1], c: C.trim });
    }
    box({ x: [0, 4], y: [1, DOOR.top - 1], z: [0, dW], c: C.door, xf: T, front: C.door, side: C.doorIn });
    const insetX = inHall ? -0.4 : 4.3, nFace = sub(T([inHall ? -1 : 1, 0, 0]), T([0, 0, 0]));
    for (const [y0, y1] of [[22, 92], [112, 190]]) poly([[insetX, y0, 14], [insetX, y0, dW - 14], [insetX, y1, dW - 14], [insetX, y1, 14]].map((p) => T(p as V3)), C.door, { n: nFace, cull: false, stroke: 'rgba(45,62,54,.55)', w: 1.6 });
    if (!inHall) {
      box({ x: [4, 6], y: [104, 118], z: [56, 80], c: C.steel, xf: T });
      const shoot = door === 'latched';
      box({ x: [6, 7.4], y: [109, 113], z: shoot ? [60, dW + 8] : [52, 74], c: '#dfe4df', xf: T });
      box({ x: [4, 8.4], y: [107, 115], z: shoot ? [62, 67] : [55, 60], c: '#c5a65f', xf: T });
      if (a === 0) box({ x: [3, 7.5], y: [105, 117], z: [DOOR.z1 + 1, DOOR.z1 + 7], c: C.steel });
      box({ x: [4, 9], y: [92, 96], z: [72, 84], c: '#c9b070', xf: T });
    } else box({ x: [-4, 0], y: [92, 96], z: [72, 84], c: '#c9b070', xf: T });
  };

  const kitchenUnit = () => {
    const messy = kitchen === 'messy';
    box({ x: [12, 176], y: [150, 153], z: [2, 24], c: C.woodDark });
    poly([[12, 88, 0.6], [176, 88, 0.6], [176, 148, 0.6], [12, 148, 0.6]], '#e7e6d6', { n: [0, 0, 1], cull: false });
    for (let x = 12; x <= 176; x += 20.5) line([x, 88, 0.8], [x, 148, 0.8], '#c6c7b5', 1.2);
    for (let y = 88; y <= 148; y += 20) line([12, y, 0.8], [176, y, 0.8], '#c6c7b5', 1.2);
    cyl([36, 153, 13], 5, 18, '#c8a24f', { top: '#8d6d32', r2: 3 });
    cyl([54, 153, 13], 4.5, 22, '#8e4f3e', { top: '#4e3028', r2: 2.5 });
    cyl([74, 153, 13], 6, 13, C.cream, { top: '#d3c7ad' });
    cyl([94, 153, 13], 6, 15, '#7e9a78', { top: '#59725b' });
    box({ x: [12, 176], y: [0, 9], z: [8, 60], c: '#59645a', ink: false });
    box({ x: [12, 176], y: [9, 84], z: [4, 66], c: C.cabinet });
    for (const [a, b] of [[17, 66], [70, 119], [123, 172]]) {
      poly([[a, 15, 66.4], [b, 15, 66.4], [b, 79, 66.4], [a, 79, 66.4]], C.cabinet, { n: [0, 0, 1], cull: false, stroke: 'rgba(48,66,54,.55)', w: 1.6 });
      box({ x: [b - 9, b - 5], y: [56, 72], z: [66.4, 68], c: C.steel, ink: false });
    }
    box({ x: [8, 180], y: [84, 89], z: [2, 70], c: C.counter, top: '#ebe7d7' });
    const S = { x0: 48, x1: 124, z0: 18, z1: 58 }, y = 89, dp = 17;
    poly([[S.x0, y, S.z1], [S.x1, y, S.z1], [S.x1, y, S.z0], [S.x0, y, S.z0]], '#7f8f8e', { n: [0, 1, 0], cull: false });
    const basin: V3[] = [[S.x0, y, S.z1], [S.x1, y, S.z1], [S.x1, y, S.z0], [S.x0, y, S.z0]];
    inClip(basin, () => {
    poly([[S.x0 + 5, y - dp, S.z0 + 4], [S.x1 - 5, y - dp, S.z0 + 4], [S.x1, y, S.z0], [S.x0, y, S.z0]], '#a7b5b3', { n: [0, 0, 1], cull: false });
    poly([[S.x1 - 5, y - dp, S.z0 + 4], [S.x1 - 5, y - dp, S.z1 - 4], [S.x1, y, S.z1], [S.x1, y, S.z0]], '#8a9998', { n: [-1, 0, 0], cull: false });
    poly([[S.x0 + 5, y - dp, S.z1 - 4], [S.x0 + 5, y - dp, S.z0 + 4], [S.x0, y, S.z0], [S.x0, y, S.z1]], '#c1cdca', { n: [1, 0, 0], cull: false });
    poly([[S.x0 + 5, y - dp, S.z1 - 4], [S.x1 - 5, y - dp, S.z1 - 4], [S.x1 - 5, y - dp, S.z0 + 4], [S.x0 + 5, y - dp, S.z0 + 4]], '#92a3a1', { n: [0, 1, 0], cull: false });
    });
    poly(basin, 'none', { raw: true, stroke: nightOf(INK), w: 2.4 });
    tube([[86, 89, 12], [86, 118, 12], [86, 130, 22], [86, 122, 34], [86, 116, 34]], 2.4, '#c5d0cd');
    if (messy) {
      for (const [x, z, h, col] of [[66, 36, 72, '#e4dac3'], [66, 36, 78, '#efe5cf'], [66, 37, 84, '#e4dac3'], [92, 42, 72, '#d9c8a6'], [104, 32, 73, '#efe5cf']] as [number, number, number, string][]) bowl([x, h, z], 13, col);
      tube([[60, 96, 36], [78, 112, 28]], 1, C.woodDark);
      for (const [x, h, col] of [[146, 89, '#efe5cf'], [146, 95, '#e4dac3'], [150, 101, '#efe5cf']] as [number, number, string][]) bowl([x, h, 46], 13, col);
    } else {
      box({ x: [132, 172], y: [89, 92], z: [18, 58], c: '#b9c8bf' });
      for (const x of [141, 153, 165]) soft(Array.from({ length: 10 }, (_, i) => { const t = (i / 10) * 6.283; return [x + Math.cos(t) * 13, 105 + Math.sin(t) * 13, 30 + (x - 141) * 0.8] as V3; }), '#efe5cf', { n: [0, 0, 1] });
    }
    cyl([34, 89, 42], 4.6, 17, '#e0bc55', { top: '#6f8f6e', r2: 3.4 });
    box({ x: [20, 32], y: [89, 93], z: [28, 38], c: '#7ea37d' });
  };

  const wardrobeUnit = () => {
    const x0 = 225, x1 = 315, z0 = 4, z1 = 58, h = 192, t = 4;
    box({ x: [x0, x1], y: [0, h], z: [z0, z1], c: C.wood, top: '#d7b483', front: C.woodDark });
    const inner = '#6f6452';
    poly([[x0 + t, 6, z1], [x1 - t, 6, z1], [x1 - t, h - t, z1], [x0 + t, h - t, z1]], inner, { n: [0, 0, 1], cull: false });
    const insetBack = (cx: number): V3[] => [[cx, 6, z0 + 6], [cx, 6, z1], [cx, h - t, z1], [cx, h - t, z0 + 6]];
    poly(insetBack(x0 + t), '#8d7c60', { n: [1, 0, 0], cull: false, op: cam.pos[0] > x0 + t ? 1 : 0 });
    poly(insetBack(x1 - t), '#7c6d55', { n: [-1, 0, 0], cull: false, op: cam.pos[0] < x1 - t ? 1 : 0 });
    poly([[x0 + t, 6, z0 + 6], [x1 - t, 6, z0 + 6], [x1 - t, h - t, z0 + 6], [x0 + t, h - t, z0 + 6]], '#5b5244', { n: [0, 0, 1], cull: false });
    tube([[x0 + 6, 176, 30], [x1 - 6, 176, 30]], 1.4, '#c9bfa5');
    shirt(x0 + 26, 172, 30, 0.82, '#c9b98e');
    shirt(x0 + 62, 172, 30, 0.82, '#7f9e98');
    for (const [a, b] of [[108, 113], [58, 63]]) box({ x: [x0 + t, x1 - t], y: [a, b], z: [z0 + 6, z1 - 1], c: C.wood, top: '#d7b483', ink: false });
    box({ x: [x0 + 12, x1 - 12], y: [113, 125], z: [18, 52], c: '#a9bcae' });
    box({ x: [x0 + 14, x1 - 14], y: [125, 136], z: [20, 50], c: C.cream });
    box({ x: [x0 + 12, x1 - 12], y: [63, 74], z: [18, 52], c: '#d7b58c' });
    box({ x: [x0 + 4, x1 - 4], y: [6, 58], z: [z1 - 3, z1], c: '#7a8f88' });
    box({ x: [x0, x0 + t], y: [0, h], z: [z1 - 1, z1], c: C.wood, ink: false });
    box({ x: [x1 - t, x1], y: [0, h], z: [z1 - 1, z1], c: C.wood, ink: false });
    box({ x: [x0, x1], y: [h - t, h], z: [z1 - 1, z1], c: C.wood, ink: false });
    box({ x: [x0 + 12, x1 - 22], y: [h, h + 20], z: [12, 48], c: '#c3a475', top: '#d3b78b' });
    box({ x: [322, 338], y: [150, 153], z: [0.5, 3], c: C.woodDark, ink: false });
    soft([[323, 150, 4], [319, 132, 12], [330, 112, 14], [342, 130, 12], [339, 150, 4]], '#6b8579', { n: [0, 0, 1] });
    soft([[322, 128, 15], [338, 128, 15], [340, 116, 15], [320, 116, 15]], '#8ea594', { n: [0, 0, 1], w: 1.7 });
  };

  const helmet = () => {
    box({ x: [334, 338], y: [204, 208], z: [0.5, 4], c: C.woodDark, ink: false });
    soft([[322, 184, 10], [324, 198, 10], [336, 205, 10], [348, 198, 10], [350, 184, 10]], '#5d7a70', { n: [0, 0, 1] });
    soft([[322, 186, 11], [336, 183, 11], [350, 186, 11], [348, 178, 11], [336, 175, 11], [324, 178, 11]], '#a9c0c0', { n: [0, 0, 1], w: 1.7 });
    curve([[326, 176, 11], [331, 164, 11], [342, 164, 11], [347, 176, 11]], '#47584f', 2);
  };

  const deskUnit = () => {
    const open = drawerOpen ? 26 : 0;
    box({ x: [342, 446], y: [32, 72], z: [8, 11], c: '#715c45', ink: false });
    box({ x: [342, 347], y: [0, 73], z: [8, 62], c: C.woodDark });
    box({ x: [404, 449], y: [0, 73], z: [10, 62], c: C.woodDark, front: '#a07d58' });
    box({ x: [408, 445], y: [38, 68], z: [62, 64], c: C.wood });
    box({ x: [408, 445], y: [6, 34], z: [62 + open, 64 + open], c: C.wood });
    if (open) { box({ x: [410, 443], y: [10, 30], z: [40, 62 + open], c: '#b48f63' }); poly([[414, 30.5, 84], [440, 30.5, 84], [440, 30.5, 54], [414, 30.5, 54]], '#ece3cf', { n: [0, 1, 0], cull: false, stroke: nightOf(INK), w: 1.4 }); }
    cyl([426, 53, 65], 2.4, 0.1, '#d4b463', { top: '#d4b463' });
    cyl([426, 20, 65 + open], 2.4, 0.1, '#d4b463', { top: '#d4b463' });
    box({ x: [338, 452], y: [73, 77], z: [4, 68], c: C.wood, top: '#d9b482' });

    box({ x: [346, 384], y: [77, 124], z: [6, 26], c: C.woodDark });
    poly([[349, 80, 26.3], [381, 80, 26.3], [381, 121, 26.3], [349, 121, 26.3]], '#4f4639', { n: [0, 0, 1], cull: false });
    box({ x: [346, 384], y: [99, 102], z: [6, 26.5], c: C.wood, ink: false });
    [['#a8695a', 351, 6], ['#6f9186', 358, 5], ['#d0ad6c', 364, 7], ['#7b8ba3', 372, 6]].forEach(([col, x, wd]) => box({ x: [x as number, (x as number) + (wd as number)], y: [80, 97], z: [16, 26], c: col as string, ink: false }));
    [['#c98f58', 351, 7], ['#8aa294', 359, 6], ['#b56f62', 366, 7]].forEach(([col, x, wd]) => box({ x: [x as number, (x as number) + (wd as number)], y: [102, 119], z: [16, 26], c: col as string, ink: false }));

    box({ x: [374, 412], y: [77, 79], z: [32, 60], c: '#7c8c86', top: '#94a39b' });
    poly([[378, 79.2, 37], [408, 79.2, 37], [408, 79.2, 52], [378, 79.2, 52]], '#61716b', { n: [0, 1, 0], cull: false });
    const scr: V3[] = [[374, 79, 32], [412, 79, 32], [412, 106, 26], [374, 106, 26]];
    poly(scr, '#47574f', { n: [0, 0.2, 1], cull: false, stroke: nightOf(INK), w: lineW(scr[0]) });
    const inset = scr.map((p, i) => [p[0] + (i === 0 || i === 3 ? 2 : -2), p[1] + (i < 2 ? 2 : -2), p[2] + 0.1] as V3);
    poly(inset, night ? '#dff1ee' : '#dbe5d9', { n: [0, 0.2, 1], cull: false, raw: true });
    for (let i = 0; i < 4; i++) { const y = 100 - i * 4.6, zz = 27.3 + i * 1, w0 = 379 + (i % 2) * 1; line([w0, y, zz], [w0 + (i % 2 ? 18 : 25), y, zz], '#90a79b', 1.5); }
    curve([[410, 77, 34], [436, 75, 26], [452, 42, 10], [456, 22, 3]], '#55655d', 2);
    box({ x: [450, 459], y: [18, 28], z: [0.5, 2], c: '#f1ecdb', ink: false });

    cyl([433, 77, 38], 8, 2, C.red);
    tube([[433, 79, 38], [441, 104, 34], [432, 122, 34], [421, 118, 36]], 1.3, '#5d7067');
    soft([[425, 124, 36], [414, 124, 36], [408, 108, 37], [427, 106, 37]], night ? '#c9805f' : C.red, { n: [0, 0, 1] });
    cyl([442, 77, 56], 4, 9, '#d3c198', { top: '#6e5a42' });
    cyl([351, 77, 44], 4, 12, '#6e8f96', { top: '#3c4d4f' });
    line([350, 89, 44], [347, 104, 44], '#b56f62', 2);
    line([353, 89, 44], [355, 103, 44], '#d0ad6c', 2);
    if (wallet) box({ x: [354, 370], y: [77, 79], z: [54, 64], c: '#6f5a46' });
    if (phone === 'desk') box({ x: [416, 424], y: [77, 78], z: [50, 65], c: '#3a4a47' });
  };

  const seat = SEATS[chair];
  const chairT = (p: V3): V3 => [seat.x + p[0] * Math.cos(seat.a) + p[2] * Math.sin(seat.a), p[1], seat.z - p[0] * Math.sin(seat.a) + p[2] * Math.cos(seat.a)];
  const chairSeat = () => {
    const T = chairT;
    groundShadow([seat.x - 22, seat.x + 22], [seat.z - 22, seat.z + 22], 40, 0.16);
    const legs: [number, number][] = [[-18, -18], [18, -18], [-18, 18], [18, 18]];
    const order = [...legs].sort((a, b) => Q(T([b[0], 0, b[1]]))[2] - Q(T([a[0], 0, a[1]]))[2]);
    for (const [x, z] of order) box({ x: [x - 1.6, x + 1.6], y: [0, 45], z: [z - 1.6, z + 1.6], c: '#5f7468', xf: T, ink: false });
    box({ x: [-21, 21], y: [45, 49], z: [-21, 21], c: C.chair, top: '#a5b8a0', xf: T });
  };
  // Lưng ghế tách riêng để nằm đúng lớp so với người ngồi.
  const chairBack = () => {
    const T = chairT;
    for (const x of [-17, 17]) box({ x: [x - 1.6, x + 1.6], y: [49, 92], z: [18, 21], c: '#5f7468', xf: T, ink: false });
    box({ x: [-20, 20], y: [68, 92], z: [18, 21], c: C.chair, xf: T });
  };

  const bedUnit = () => {
    const [x0, x1, z0, z1, h] = [252, 452, 215, 375, 24];
    box({ x: [x0, x1], y: [0, h], z: [z0, z1], c: C.matSide, top: C.mat });
    const top: V3[] = [[x0, h, z1], [x1, h, z1], [x1, h, z0], [x0, h, z0]];
    for (let x = x0 + 40; x < x1; x += 40) line([x, h, z0], [x, h, z1], '#9db3a2', 1.3);
    line([x0 + 2, h - 8, z1], [x1 - 2, h - 8, z1], '#c3d1c2', 1.8);
    if (!night) {
      const p = top.map(P);
      sink.push(<clipPath key={key++} id={`${uid}-mat`}><path d={`M${p.map((q) => `${f1(q[0])} ${f1(q[1])}`).join('L')}Z`} /></clipPath>);
      sunPatch(h, `${uid}-mat`);
    }
    pillow([402, 446], [228, 288], h, '#d6dec8');
    pillow([402, 446], [302, 362], h, C.cream);
    box({ x: [276, 330], y: [h, h + 11], z: [232, 288], c: '#a4b5a4', top: '#b3c2b0' });
    line([276, h + 6, 288.2], [330, h + 6, 288.2], '#8c9e8c', 1.6);
    // Có người ngủ thì người tự mang tấm chăn của mình (đắp theo dáng nằm); phòng chỉ vẽ chăn rời khi giường trống.
    if (sleeper) { const at: V3 = [424, h + 9, 332], s = P(at); sink.push(<g key={key++}>{sleeper({ x: s[0], y: s[1], scale: (168 / 590) * cam.pxcm(at), plug: [P([459, 31, 378])[0], P([459, 31, 378])[1]] })}</g>); }
    else {
      const b = h + 5;
      soft([[258, b, 318], [272, b + 12, 302], [305, b + 16, 298], [338, b + 12, 305], [372, b + 18, 300], [392, b + 8, 312], [396, b + 12, 338], [386, b + 8, 366], [352, b + 2, 374], [312, b, 374], [276, b, 372], [256, b + 3, 352]], C.blanket);
      curve([[274, b + 12, 310], [298, b + 18, 330], [322, b + 13, 318], [346, b + 16, 340]], '#4e6c64', 2.4);
      curve([[294, b + 8, 360], [322, b + 14, 346], [360, b + 10, 354]], '#4e6c64', 2.4);
      curve([[350, b + 14, 312], [372, b + 12, 330], [380, b + 6, 352]], '#8aa69f', 2.4);
    }
    if (phone !== 'mat' && sleeper) box({ x: [458.5, 460], y: [26, 36], z: [372, 384], c: '#f1ecdb', ink: false });
    if (phone === 'mat') {
      box({ x: [388, 397], y: [h, h + 1], z: [362, 373], c: '#3a4a47' });
      curve([[397, h + 1, 368], [432, h, 373], [452, 22, 378], [459, 30, 378]], '#55655d', 2);
      box({ x: [458.5, 460], y: [26, 36], z: [372, 384], c: '#f1ecdb', ink: false });
    }
  };

  const fanUnit = () => {
    const c: V3 = [32, 0, 388];
    groundShadow([c[0] - 16, c[0] + 16], [c[2] - 16, c[2] + 16], 40, 0.14);
    cyl(c, 16, 3, '#7c9586', { top: '#8fa698' });
    tube([[c[0], 3, c[2]], [c[0], 92, c[2]]], 3, '#9fb1a5');
    const head: V3 = [c[0], 108, c[2]];
    const yaw = 0.62, r: V3 = [Math.cos(yaw), 0, -Math.sin(yaw)], n: V3 = [Math.sin(yaw), 0, Math.cos(yaw)], up: V3 = [0, 1, 0];
    const at = (u: number, v: number, off = 0) => add(add(add(head, mul(r, u)), mul(up, v)), mul(n, off));
    const circ = (R: number, off = 0) => Array.from({ length: 18 }, (_, i) => at(Math.cos((i / 18) * 6.283) * R, Math.sin((i / 18) * 6.283) * R, off));
    soft(circ(24, -6), '#d8e2d4', { n, op: 0.75, w: 2 });
    for (let i = 0; i < 3; i++) { const t = (i / 3) * 6.283 + 0.5, u = (a: number, R: number) => at(Math.cos(t + a) * R, Math.sin(t + a) * R); soft([u(0.1, 3), u(0.62, 15), u(0.42, 22), u(-0.3, 20), u(-0.3, 8)], '#94b0a0', { n, w: 1.5 }); }
    soft(circ(5, 2), '#6a8676', { n, w: 1.5 });
    soft(circ(24, 4), 'rgba(0,0,0,0)', { n, raw: true, w: 3 });
    for (let i = 0; i < 8; i++) { const t = (i / 8) * 6.283; line(at(Math.cos(t) * 5, Math.sin(t) * 5, 4), at(Math.cos(t) * 24, Math.sin(t) * 24, 4), '#7f9788', 1.1); }
    soft(circ(14, 4), 'rgba(0,0,0,0)', { n, raw: true, w: 1 });
    curve([[c[0], 1, c[2] + 4], [12, 0, 398], [2, 26, 398]], '#5d6e62', 2);
    box({ x: [0.5, 2], y: [22, 32], z: [392, 404], c: '#f1ecdb', ink: false });
  };

  const broom = () => {
    tube([[9, 2, 78], [17, 126, 70]], 2.2, C.woodDark);
    soft([[3, 0, 82], [17, 0, 72], [22, 2, 74], [18, 30, 78], [10, 30, 80]], '#c9a35f', { n: [1, 0, 0.3] });
    for (const dz of [-2, 2, 6]) line([11 + dz, 28, 79 - dz], [8 + dz * 1.8, 2, 79 - dz], '#9f7e45', 1.3);
  };
  const clutter = () => {
    cyl([232, 0, 332], 6, 9, C.cream, { top: '#c7a57a', r2: 8 });
    tube([[230, 9, 332], [246, 16, 322]], 0.8, C.woodDark);
    soft([[198, 0, 348], [216, 1, 340], [222, 1, 352], [212, 2, 358], [200, 1, 358]], '#c7b98f');
    soft([[198, 1, 366], [216, 2, 360], [222, 2, 372], [212, 2, 378], [200, 2, 378]], '#c7b98f');
    curve([[202, 3, 352], [212, 4, 348], [218, 3, 353]], '#6a8676', 3);
    curve([[202, 3, 372], [212, 4, 367], [218, 3, 372]], '#6a8676', 3);
    soft([[232, 0, 356], [242, 2, 352], [246, 1, 362], [236, 2, 366]], '#d9d3c0', { w: 1.8 });
  };
  const crumbs = () => { for (let i = 0; i < 16; i++) { const x = 112 + ((i * 47) % 70), z = 76 + ((i * 29) % 34); box({ x: [x, x + 2.2], y: [0, 0.8], z: [z, z + 1.6], c: '#c9a161', ink: false }); } };
  const supplies = () => {
    cyl([200, 0, 30], 14, 34, C.teal, { top: C.teal });
    cyl([200, 34, 30], 14, 9, C.teal, { top: '#a5c5c2', r2: 6 });
    cyl([200, 43, 30], 4.5, 5, '#5c8c89', { top: '#9fbfbb' });
    for (const y of [12, 24]) line([187, y, 43], [213, y, 43], '#a5c5c2', 1.6);
    box({ x: [6, 52], y: [0, 28], z: [84, 126], c: '#c49a70', top: '#d1ab82', ink: true });
    line([6, 28.2, 105], [52, 28.2, 105], '#8c6a47', 1.6);
    cyl([324, 0, 28], 12, 28, '#a5a487', { top: '#6e6c56', r2: 15 });
    soft([[314, 28, 28], [320, 40, 32], [330, 36, 30], [336, 28, 30]], C.cream, { n: [0, 0, 1], w: 1.8 });
  };

  // Quầng đèn vẽ ngay sau bàn, nên ghế và người ở phía trước không bị phủ trắng.
  const lampGlow = () => {
    const lamp = P([418, 100, 37]), pool = P([418, 65, 36]), px = cam.pxcm([418, 65, 36]);
    sink.push(<g key={key++} style={{ mixBlendMode: 'screen' }}><ellipse cx={pool[0]} cy={pool[1]} rx={px * 150} ry={px * 70} fill={`url(#${uid}-lamp)`} /><ellipse cx={lamp[0]} cy={lamp[1] + px * 16} rx={px * 90} ry={px * 90} fill={`url(#${uid}-lamp)`} /></g>);
  };

  type Obj = { at: V3; draw: () => void };
  const objs: Obj[] = inHall ? [{ at: [-6, 0, 215], draw: doorUnit }] : [
    { at: [0, 0, 215], draw: doorUnit }, { at: [W, 150, 155], draw: windowUnit },
    { at: [94, 0, 34], draw: fitY(89, 76, kitchenUnit) }, { at: [270, 0, 30], draw: wardrobeUnit }, { at: [340, 190, 8], draw: helmet }, { at: [395, 0, 34], draw: fitY(77, 65, deskUnit) },
    { at: [seat.x, 0, seat.z], draw: fitY(49, 40, chairSeat) }, { at: chairT([0, 0, 19.5]), draw: fitY(49, 40, chairBack) }, { at: [352, 0, 300], draw: bedUnit }, { at: [32, 0, 388], draw: fanUnit },
    { at: [12, 0, 76], draw: broom }, { at: [215, 0, 355], draw: clutter }, { at: [28, 0, 105], draw: supplies },
    ...(kitchen === 'messy' ? [{ at: [145, 0, 92] as V3, draw: crumbs }] : []),
    ...(night ? [{ at: [396, 0, 75] as V3, draw: lampGlow }] : []),
  ];
  for (const a of actors) objs.push({ at: [a.at[0], 0, a.at[1]], draw: () => { sink.push(<g key={key++}>{a.render(placeOn(view, a.at, 168, move))}</g>); } });
  lampsOff = true;
  shell();
  lampsOff = false;
  const rayAt = sink.length; // vệt nắng chính chèn ngay sau tường–sàn, trước đồ đạc và người
  const dist = (o: Obj) => { const q = Q(o.at); return Math.hypot(q[0], q[2]); };
  // Vệt nắng: mỗi ô kính nối với mảng nắng của nó trên sàn thành một khối sáng; vẽ bao lồi trên màn hình rồi làm mờ.
  const rayHull = (pts: [number, number][]) => {
    const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo: [number, number][] = [], up: [number, number][] = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (const q of [...p].reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return [...lo.slice(0, -1), ...up.slice(0, -1)];
  };
  const rayShapes = !night && !inHall && rays > 0 ? sunPanes().map(([a, b, c, e]) => {
    const wall: V3[] = [[W, c, a], [W, c, b], [W, e, b], [W, e, a]];
    const floor = wall.map((p) => add(p, mul(sunDir, p[1] / -sunDir[1])));
    const all = [...wall, ...floor];
    if (behind(all)) return null;
    return rayHull(all.map((p) => { const q = P(p); return [q[0], q[1]] as [number, number]; }));
  }).filter(Boolean) as [number, number][][] : [];
  const rayPaths = (op: number) => rayShapes.map((h, i) => <path key={i} d={`M${h.map((q) => `${f1(q[0])} ${f1(q[1])}`).join('L')}Z`} fill="#fff1cf" opacity={op} />);
  if (rayShapes.length) sink.splice(rayAt, 0, <g key="rays-back" filter={`url(#${uid}-blur)`} style={{ mixBlendMode: 'screen' }} opacity={rays}>{rayPaths(0.3)}</g>);
  [...objs].sort((a, b) => dist(b) - dist(a)).forEach((o) => {
    const before = sink; sink = [];
    o.draw();
    before.push(<g key={key++}>{sink}</g>);
    sink = before;
  });

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" className={className} role="img" aria-label={`${SHOT_LABEL[view]}, ${night ? 'ban đêm' : 'ban ngày'}`} data-view={view}>
      <defs>
        <filter id={`${uid}-blur`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="11" /></filter>
        <filter id={`${uid}-blur-sm`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" /></filter>
        <linearGradient id={`${uid}-cyl`} x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#23302b" stopOpacity=".32" /><stop offset=".55" stopColor="#23302b" stopOpacity="0" /><stop offset=".8" stopColor="#fff" stopOpacity=".22" /><stop offset="1" stopColor="#23302b" stopOpacity=".12" /></linearGradient>
        <radialGradient id={`${uid}-vig`} cx=".5" cy=".46" r=".75"><stop offset=".62" stopColor="#1c2420" stopOpacity="0" /><stop offset="1" stopColor="#1c2420" stopOpacity={night ? 0.5 : 0.2} /></radialGradient>
        <radialGradient id={`${uid}-lamp`}><stop offset="0" stopColor="#ffd894" stopOpacity=".55" /><stop offset=".5" stopColor="#f2b56a" stopOpacity=".18" /><stop offset="1" stopColor="#f2b56a" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${uid}-win`} x1="1" x2="0" y1="0" y2=".5"><stop offset="0" stopColor="#fff6d8" stopOpacity=".28" /><stop offset=".6" stopColor="#fff6d8" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width="1920" height="1080" fill={night ? '#111722' : '#d9cfb9'} />
      <g data-layer={`room-${view}`}>{sink}</g>
      {rayShapes.length > 0 && (
        <g filter={`url(#${uid}-blur)`} style={{ mixBlendMode: 'screen' }} opacity={rays}>
          {rayPaths(0.06)}
        </g>
      )}
      {!night && !inHall && <rect width="1920" height="1080" fill={`url(#${uid}-win)`} />}
      <rect width="1920" height="1080" fill={`url(#${uid}-vig)`} />
      {children}
    </svg>
  );
}

export const RoomMorning = (p: RoomProps) => <RoomScene door="ajar" chair="bed" {...p} />;
export const RoomNight = (p: RoomProps) => <RoomScene phone="desk" kitchen="clean" {...p} night />;
export const KitchenSink = (p: RoomProps) => <RoomScene door="ajar" chair="bed" {...p} view="kitchen" />;
export const BedCorner = (p: RoomProps) => <RoomScene door="ajar" chair="bed" {...p} view="bed" />;
export const StudyCornerMorning = (p: RoomProps) => <RoomScene phone="hidden" kitchen="clean" {...p} view="desk" />;
export const StudyDeskNight = (p: RoomProps) => <RoomScene phone="desk" kitchen="clean" {...p} night view="desk" />;
export const DoorInside = (p: RoomProps) => <RoomScene door="latched" phone="hidden" {...p} view="door" />;
export const HallwayDoor = (p: RoomProps) => <RoomScene {...p} view="hallway" />;
export function HoSo02EnvironmentMasterBoard() { return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}><RoomMorning /><RoomNight /><KitchenSink /><BedCorner /><DoorInside /><StudyCornerMorning /><StudyDeskNight /><HallwayDoor /></div>; }
