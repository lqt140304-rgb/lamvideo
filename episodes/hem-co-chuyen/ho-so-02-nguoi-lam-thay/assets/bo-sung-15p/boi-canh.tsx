import React from 'react';
import { uid } from './common';
import { Blackboard, BunCha, RiceBox, XoiGac, Football, Scissors, Mirror } from './dao-cu';
import { SupportingActor, FormalTwin } from './nhan-vat-va-tu-the';
import { RoomScene, type RoomProps } from '../boi-canh/boi-canh';
import { TWIN_POSES } from '../nhan-vat';
import { camera, CamSpec, Finish, Light, makeScene, Scope, V3 } from './kit3d';

/**
 * Bối cảnh bổ sung Hồ sơ 02 — đại tu 11/11/2026: dựng bằng mô hình 3D theo cm (kit3d), camera phối cảnh thật,
 * sáng–tối theo hướng nắng, bóng đổ và vệt nắng tính bằng tia, mờ theo khoảng cách. Kích thước đồ đạc theo đồ thật.
 * Đạo cụ và vai phụ dùng nguyên component cũ, chỉ đặt lại theo phối cảnh. Toàn bộ là bản đề xuất chờ duyệt.
 */

/** Bốn góc đặt sẵn cho mỗi bối cảnh: chính (góc gốc), ngược, chéo, cao. */
export type SetView = 'chinh' | 'nguoc' | 'cheo' | 'cao';
export const SET_VIEWS: SetView[] = ['chinh', 'nguoc', 'cheo', 'cao'];

const K = {
  wall: '#e8dec6', wallCool: '#dfe2d3', lower: '#bfcab6', floor: '#cfc5ad', tile: '#b3aa93', ceil: '#efe9da',
  wood: '#c39a68', woodDark: '#86684a', metal: '#a9b2ae', steel: '#7f8b88', dark: '#3c4542', board: '#3d5d52',
  white: '#f3f1e8', sky: '#bcdcdc', leaf: '#6f9a6e', leafDark: '#557e5b',
};

/** Vỏ phòng hình hộp: sàn, trần, tường nhìn từ trong. Tường phía camera (z0) bỏ qua. */
const shellRoom = (S: ReturnType<typeof makeScene>, x: [number, number], z: [number, number], h: number, c: { wall?: string; left?: string; right?: string; front?: string; back?: string; floor?: string; ceil?: string; lower?: string; lowerH?: number } = {}) => {
  const [x0, x1] = x, [z0, z1] = z;
  // Mặt lớn chia thành các dải/ô để mức sáng đổi theo từng dải (sáng dần về phía nguồn sáng, xa thì dịu), không còn một màu phẳng.
  const sq = (p: V3[], col: string, nu: number, nv: number, n: V3) => {
    const lerp = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
      const at = (u: number, v: number) => lerp(lerp(p[0], p[1], u), lerp(p[3], p[2], u), v);
      S.quad([at(i / nu, j / nv), at((i + 1) / nu, j / nv), at((i + 1) / nu, (j + 1) / nv), at(i / nu, (j + 1) / nv)], col, { n, layer: 0, edge: false, seam: true });
    }
  };
  sq([[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]], c.floor ?? K.floor, 6, 6, [0, 1, 0]);
  sq([[x0, h, z1], [x1, h, z1], [x1, h, z0], [x0, h, z0]], c.ceil ?? K.ceil, 5, 4, [0, -1, 0]);
  const lh = c.lowerH ?? 0;
  const wallPair = (pts: (y0: number, y1: number) => V3[], n: V3, col: string) => {
    if (lh > 0) { sq(pts(0, lh), c.lower ?? K.lower, 6, 1, n); sq(pts(lh, h), col, 6, 2, n); }
    else sq(pts(0, h), col, 6, 2, n);
  };
  wallPair((a, b) => [[x0, a, z0], [x0, a, z1], [x0, b, z1], [x0, b, z0]], [1, 0, 0], c.left ?? c.wall ?? K.wall);
  wallPair((a, b) => [[x1, a, z1], [x1, a, z0], [x1, b, z0], [x1, b, z1]], [-1, 0, 0], c.right ?? c.wall ?? K.wall);
  wallPair((a, b) => [[x0, a, z1], [x1, a, z1], [x1, b, z1], [x0, b, z1]], [0, 0, -1], c.front ?? c.wall ?? K.wall);
  wallPair((a, b) => [[x1, a, z0], [x0, a, z0], [x0, b, z0], [x1, b, z0]], [0, 0, 1], c.back ?? c.wall ?? K.wall);
  // tối tiếp xúc ở chân tường và góc trần
  for (const [a, b] of [[[x0, 0, z0], [x0, 0, z1]], [[x1, 0, z0], [x1, 0, z1]], [[x0, 0, z1], [x1, 0, z1]], [[x0, 0, z0], [x1, 0, z0]]] as [V3, V3][]) S.line(a, b, '#2a312d', 14, { op: 0.16, layer: 0.6, cm: true });
  for (const [a, b] of [[[x0, h, z0], [x0, h, z1]], [[x1, h, z0], [x1, h, z1]], [[x0, h, z1], [x1, h, z1]]] as [V3, V3][]) S.line(a, b, '#2a312d', 10, { op: 0.1, layer: 0.6, cm: true });
};
/** Cửa đi trên tường vuông góc trục z: khung, cánh, tay nắm. `dir` = 1 nếu tường nhìn về +z (tường sau). */
const zDoor = (S: ReturnType<typeof makeScene>, wz: number, x: [number, number], dir: 1 | -1, col = '#8fa497', h = 215, glass = false, y0 = 0) => {
  const t = dir > 0 ? [wz, wz + 4] as [number, number] : [wz - 4, wz] as [number, number];
  S.box({ x: [x[0] - 6, x[1] + 6], y: [y0, y0 + h + 6], z: t, c: K.white });
  S.box({ x: [x[0], x[1]], y: [y0, y0 + h], z: dir > 0 ? [wz + 4, wz + 6] : [wz - 6, wz - 4], c: col });
  if (glass) S.quad(dir > 0 ? [[x[1] - 10, y0 + 20, wz + 6.5], [x[0] + 10, y0 + 20, wz + 6.5], [x[0] + 10, y0 + h - 10, wz + 6.5], [x[1] - 10, y0 + h - 10, wz + 6.5]] : [[x[0] + 10, y0 + 20, wz - 6.5], [x[1] - 10, y0 + 20, wz - 6.5], [x[1] - 10, y0 + h - 10, wz - 6.5], [x[0] + 10, y0 + h - 10, wz - 6.5]], '#b9d3d0', { n: [0, 0, dir], edge: false });
  const hx = x[1] - 12;
  S.box({ x: [hx - 8, hx], y: [y0 + 98, y0 + 102], z: dir > 0 ? [wz + 6, wz + 10] : [wz - 10, wz - 6], c: '#c9b47c' });
};
const tiles = (S: ReturnType<typeof makeScene>, x: [number, number], z: [number, number], step: number, col = K.tile, op = 0.55, y = 0.2) => {
  for (let xx = x[0]; xx <= x[1]; xx += step) S.line([xx, y, z[0]], [xx, y, z[1]], col, 1.2, { op });
  for (let zz = z[0]; zz <= z[1]; zz += step) S.line([x[0], y, zz], [x[1], y, zz], col, 1.2, { op });
};
/** Đèn tuýp trần: hộp sáng và quầng sáng. */
const tubeLight = (S: ReturnType<typeof makeScene>, x: number, z: number, h: number, len = 120, col = '#fbf6e4', glowCol = '#fff6d6') => {
  S.box({ x: [x - len / 2, x + len / 2], y: [h - 8, h - 2], z: [z - 6, z + 6], c: col, emit: true, edge: false });
  S.glow([x, h - 14, z], 22, glowCol, 0.16);
};
/** Cửa sổ trên tường dọc trục z (tường trái hoặc phải): khung, kính trời, song, và vệt nắng xuống sàn. */
const sideWindow = (S: ReturnType<typeof makeScene>, wx: number, z: [number, number], y: [number, number], inward: 1 | -1, sky = K.sky, patch = true) => {
  const e = wx + inward * 0.6;
  S.quad([[e, y[0], z[0]], [e, y[0], z[1]], [e, y[1], z[1]], [e, y[1], z[0]]], sky, { n: [inward, 0, 0], raw: true, layer: 0.4 });
  S.box({ x: inward > 0 ? [wx, wx + 6] : [wx - 6, wx], y: [y[0] - 6, y[0]], z: [z[0] - 6, z[1] + 6], c: K.white });
  S.box({ x: inward > 0 ? [wx, wx + 4] : [wx - 4, wx], y: [y[1], y[1] + 5], z: [z[0] - 6, z[1] + 6], c: K.white });
  const mz = (z[0] + z[1]) / 2;
  S.line([e + inward, y[0], mz], [e + inward, y[1], mz], K.white, 5, { layer: 1.5, cm: true });
  S.line([e + inward, (y[0] + y[1]) / 2, z[0]], [e + inward, (y[0] + y[1]) / 2, z[1]], K.white, 4, { layer: 1.5, cm: true });
  if (patch) S.sunPatch([[wx, y[0], z[0]], [wx, y[0], z[1]], [wx, y[1], z[1]], [wx, y[1], z[0]]], 0.34);
};
const wrap = (id: string, name: string, body: React.ReactNode, warm?: string, vig = 0.35) => (
  <g data-scene={name}>
    {body}
    <Finish id={id} vignette={vig} warm={warm} />
  </g>
);
const sky = (top: string, bottom: string, id: string) => (
  <>
    <defs><linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient></defs>
    <rect width={1920} height={1080} fill={`url(#${id}-sky)`} />
  </>
);

/** Chỗ đặt rig đứng tại điểm `at` (cm) khi bối cảnh dùng camera tự do `cam` (máy bay trong cảnh 3D). Bối cảnh nhận cùng `cam` qua prop. */
export const rigIn = (cam: CamSpec, at: V3, heightCm = 168) => makeScene(camera(cam), { sun: [0, -1, 0] }).rigAt(at, heightCm);
/** Camera có nhìn thấy điểm `at` ở phía trước không (tránh đặt người khi điểm nằm sau máy). */
export const inFront = (cam: CamSpec, at: V3) => camera(cam).depth(at) > 30;
/** Lưng sinh viên ngồi (hình 2D cũ), đặt theo chiều sâu. */
const BackStudent = ({ x, y, s, shirt, hair = '#41483e' }: { x: number; y: number; s: number; shirt: string; hair?: string }) => <g transform={`translate(${x} ${y}) scale(${s})`} data-layer="background-student"><path d="M-67 140Q-72 48-31 30H29Q74 54 68 140Z" fill={shirt} /><ellipse cy={7} rx={35} ry={42} fill={hair} /><path d="M-34 4Q0 36 34 3V37Q0 58-32 32Z" fill={hair} /></g>;

// ---------------------------------------------------------------------------------------------
// 1. Giảng đường (P3.01, S08): giảng đường lớn có bậc thang, đèn tuýp trắng lạnh.
//    Bục giảng ở đầu thấp; năm dãy bàn lên dần về cuối phòng. Bục đứng của Nam và bàn giảng viên có micro cổ ngỗng.
//    chinh: cuối giảng đường nhìn xuống bục · nguoc: từ bục nhìn lên các bậc · cheo: ngang bục giảng · cao: góc cao.
// ---------------------------------------------------------------------------------------------
export const LECTURE_VIEWS: Record<SetView, CamSpec> = { chinh: { pos: [140, 300, 30], look: [-40, 95, 1500], mm: 22 }, nguoc: { pos: [170, 178, 1450], look: [-40, 190, 0], mm: 19 }, cheo: { pos: [500, 178, 1160], look: [-300, 115, 1420], mm: 21 }, cao: { pos: [-470, 430, 1480], look: [200, 60, 420], mm: 19 } };
const LECTURE_LIGHT: Light = { sun: [0.78, -0.52, 0.2], amb: 0.72, diff: 0.34, fog: { color: '#e1e8ea', dist: 2600, max: 0.35 } };
const TIER = 34;
const LECTURE_ROWS = [1100, 890, 680, 470, 260];
/** Chỗ đứng trên bục giảng, cạnh bục đứng (dùng cho người đứng thuyết trình). */
export const lectureSpot = (heightCm = 168, view: SetView = 'chinh') => makeScene(camera(LECTURE_VIEWS[view]), LECTURE_LIGHT).rigAt([-70, 22, 1360], heightCm);
/** Micro cổ ngỗng: đế tròn, cổ cong về phía người nói (`toward` là hướng [dx, dz]), đầu micro đen. */
const goosenecMic = (S: ReturnType<typeof makeScene>, b: V3, toward: [number, number]) => {
  S.cyl(b, 5, 2.5, '#2f3634', { top: '#454d4a', n: 12 });
  const pts: V3[] = [0, 0.25, 0.5, 0.75, 1].map((t) => [b[0] + toward[0] * 22 * t * t, b[1] + 2.5 + 34 * Math.sin((t * Math.PI) / 2), b[2] + toward[1] * 22 * t * t]);
  for (let i = 0; i < pts.length - 1; i++) S.line(pts[i], pts[i + 1], '#3a4240', 1.4, { cm: true, layer: 2.4 });
  const h = pts[pts.length - 1];
  S.line(h, [h[0] + toward[0] * 6, h[1] - 2, h[2] + toward[1] * 6], '#1f2524', 3.2, { cm: true, layer: 2.45 });
};
export const LectureHall = ({ children, failed = false, students = true, view = 'chinh', cam, frame = null, layers = false, scope = false }: { children?: React.ReactNode; failed?: boolean; students?: boolean; view?: SetView; cam?: CamSpec; frame?: number | null; layers?: boolean; scope?: boolean }) => {
  const id = uid(), S = makeScene(camera(cam ?? LECTURE_VIEWS[view]), LECTURE_LIGHT, frame, layers);
  const X: [number, number] = [-520, 520], Z: [number, number] = [-200, 1500], H = 430;
  shellRoom(S, X, Z, H, { lowerH: 110, lower: '#c3ccc4', wall: '#e3e4da', front: '#e7e7dd', floor: '#c9c4b2', ceil: '#eef0ea' });
  tiles(S, X, [995, 1250], 60, '#aeb0a2');
  [[200, 520], [640, 960]].forEach(([a, b]) => sideWindow(S, X[0], [a, b], [170, 340], 1, '#c8dfe2', false));
  // Bậc thang: mỗi dãy bàn đứng trên một bậc cao hơn dãy trước 34 cm; bậc cuối kéo tới tường sau.
  LECTURE_ROWS.forEach((z, k) => {
    if (!k) return;
    const zz: [number, number] = [k === 4 ? Z[0] : z - 105, z + 105];
    S.box({ x: X, y: [0, k * TIER], z: zz, c: '#c9c4b2', top: '#d3cdbb', back: '#b4ae9b' });
  });
  // Bục giảng nâng 22 cm, bảng, màn chiếu slide, bàn giảng viên, bục đứng, đồng hồ, cửa phải
  S.box({ x: [-520, 520], y: [0, 22], z: [1250, 1500], c: '#bfb39a', top: '#cdbfa3' });
  S.box({ x: [-250, 130], y: [100, 245], z: [1494, 1500], c: '#6f7f74' });
  S.plane([-240, 238, 1493], [380 / 480 - 0.02, 0, 0], [0, -130 / 240, 0], <Blackboard failed={failed} />, 2, 80);
  S.box({ x: [-230, 110], y: [96, 100], z: [1480, 1500], c: '#b5ad98' });
  S.box({ x: [160, 430], y: [140, 330], z: [1493, 1500], c: '#f7f8f5', front: '#f7f8f5' });
  S.plane([175, 320, 1492], [0.5, 0, 0], [0, -0.5, 0], <g><rect width={480} height={340} fill="#f7f8f5" /><rect width={480} height={46} fill="#3d5b70" /><text x={18} y={33} fontFamily="Arial, sans-serif" fontWeight={700} fontSize={26} fill="#f2f5f6">CHƯƠNG 4 · ĐỘ PHỨC TẠP THUẬT TOÁN</text>{['T(n) = 2T(n/2) + Θ(n log n)', 'Σ i·2ⁱ = (n−1)·2ⁿ⁺¹ + 2', 'O(n²) ⊂ O(n² log n) ⊂ O(n³)', 'f(n) = Ω(g(n)) ⇔ ∃c, n₀ > 0', 'Cache hit = 1 − (miss / access)', 'CPI = Σ CPIᵢ · Fᵢ'].map((t, i) => <text key={i} x={22} y={88 + i * 42} fontFamily="Georgia, serif" fontSize={24} fill="#28323a">{t}</text>)}</g>, 2, 60);
  S.cyl([-380, 300, 1497], 26, 3, '#f4f2ea', { top: '#f4f2ea', n: 20 });
  S.line([-380, 300, 1494], [-380, 316, 1494], '#3e4643', 3);
  S.line([-380, 300, 1494], [-368, 294, 1494], '#3e4643', 3);
  S.box({ x: [440, 515], y: [22, 237], z: [1500 - 2, 1500], c: '#8fa497' });
  S.plane([432, 280, 1497], [0.36, 0, 0], [0, -0.36, 0], <g><rect width={240} height={70} rx={8} fill="#3f6a63" /><text x={120} y={47} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={34} fill="#f4efe0">GIẢNG ĐƯỜNG A2</text></g>);
  S.box({ x: [190, 340], y: [22, 100], z: [1300, 1370], c: K.wood, top: '#d3b282', front: '#a8875f' });
  S.castShadow([190, 340], [1300, 1370], 100, 0.2, 22);
  goosenecMic(S, [235, 100, 1340], [-0.3, 0.9]);
  S.box({ x: [0, 64], y: [22, 122], z: [1300, 1338], c: '#9f7c55', top: '#b48f63', front: '#8c6b48' });
  S.box({ x: [-6, 70], y: [122, 128], z: [1296, 1344], c: '#b48f63', top: '#c29e70' });
  goosenecMic(S, [12, 128, 1330], [-0.55, 0.6]);
  S.castShadow([0, 64], [1300, 1338], 128, 0.18, 22);
  // Tường cuối: cửa ra vào và bảng tin ở cao độ bậc cuối
  const top = 4 * TIER;
  zDoor(S, -200, [300, 400], 1, '#8fa497', 215, false, top);
  S.box({ x: [-320, -60], y: [130 + top, 240 + top], z: [-200, -196], c: '#a98b62' });
  S.box({ x: [-312, -68], y: [138 + top, 232 + top], z: [-196, -195], c: '#d9c9a2' });
  for (const [x, y, c] of [[-290, 210, '#f2efe2'], [-230, 190, '#e9d79b'], [-160, 215, '#cfe0d5'], [-120, 170, '#f2efe2']] as const) S.box({ x: [x, x + 40], y: [y - 40 + top, y + top], z: [-195, -194], c });
  // Dàn đèn tuýp trắng lạnh phủ kín trần
  for (let z = 0; z <= 1400; z += 280) for (const x of [-330, 0, 330]) tubeLight(S, x, z, H, 130, '#f6fbff', '#eef7ff');
  // Dãy bàn ghế dài trên từng bậc. Sinh viên có hai mặt: lưng (nhìn từ cuối phòng) và mặt (nhìn từ bục); camera chỉ thấy một mặt.
  const shirts = ['#83968d', '#ad9e87', '#8497a0', '#a58d7e', '#9aa58a', '#8d8aa0'];
  LECTURE_ROWS.forEach((z, r) => [[-470, -70], [70, 470]].forEach(([a, b], side) => {
    const y = r * TIER;
    S.box({ x: [a, b], y: [y + 72, y + 76], z: [z, z + 50], c: K.wood, top: '#d8b98b' });
    S.box({ x: [a + 4, b - 4], y: [y + 20, y + 72], z: [z + 44, z + 48], c: '#a8875f' });
    for (const lx of [a + 8, b - 12]) S.box({ x: [lx, lx + 4], y: [y, y + 72], z: [z + 4, z + 46], c: K.steel });
    S.box({ x: [a, b], y: [y + 42, y + 46], z: [z - 52, z - 18], c: '#9c8261', top: '#b59a74' });
    for (const lx of [a + 10, b - 14]) S.box({ x: [lx, lx + 4], y: [y, y + 42], z: [z - 48, z - 22], c: K.steel });
    S.contact([a, b], [z - 52, z + 50], 0.14, y);
    if (students) for (let i = 0; i < 4; i++) {
      if ((r + side + i) % 3 === 2) continue;
      const sx = a + 50 + i * ((b - a - 100) / 3), at: V3 = [sx, y + 60, z - 36];
      const topP = S.cam.project([sx, y + 128, z - 35]), pc = S.cam.pxcm([sx, y, z - 35]), s = (130 * pc) / 258;
      const bob = frame === null ? 0 : (Math.sin(frame / 38 + i * 2.1 + r * 1.3) * 1.2 + Math.max(0, Math.sin(frame / 97 + i * 5 + r)) ** 6 * 4) * s * 2;
      S.sprite(at, <BackStudent x={topP[0]} y={topP[1] + 35 * s + bob} s={s} shirt={S.shade(shirts[(r * 3 + i + side) % shirts.length], [0, 0, -1], [sx, y + 100, z - 35])} />, 2, [0, 0, -1]);
      const p = S.rigAt([sx, y, z - 35], 165);
      S.sprite(at, <SupportingActor role={(r + i + side) % 2 ? 'sinh-vien-nu' : 'sinh-vien-nam'} pose={TWIN_POSES.sit} smile={!failed} {...p} y={p.y + bob * 0.8} />, 2, [0, 0, 1]);
    }
  }));
  const t = S.rigAt([265, 22, 1420], 165);
  S.sprite([265, 22, 1420], <SupportingActor role="giang-vien" x={t.x} y={t.y} scale={t.scale} smile={!failed} />, 2, [0, 0, -1]);
  S.sprite([-70, 22, 1360], S.litActors(id, [-70, 22, 1360], <g data-layer="actors">{children}</g>));
  const out = wrap(id, 'giang-duong', S.render(id, <rect width={1920} height={1080} fill="#dfe3df" />), '#cfe3ff');
  return scope ? <g>{out}<Scope /></g> : out;
};
// ---------------------------------------------------------------------------------------------
// 2. Lab 402 (P2.04, P2.05): dãy máy tính, màn hình hướng về camera, rèm lá bên phải.
// ---------------------------------------------------------------------------------------------
export const LAB_VIEWS: Record<SetView, CamSpec> = { chinh: { pos: [-330, 175, -40], look: [60, 95, 1150], mm: 22 }, nguoc: { pos: [120, 172, 1210], look: [-100, 95, -200], mm: 22 }, cheo: { pos: [440, 190, 100], look: [-300, 80, 900], mm: 22 }, cao: { pos: [-460, 300, 1220], look: [200, 30, 200], mm: 20 } };
const LAB_LIGHT: Light = { sun: [-0.72, -0.55, 0.25], amb: 0.64, diff: 0.42, lamps: [], fog: { color: '#dfe6dc', dist: 2400, max: 0.3 } };
export const labSpot = (heightCm = 168, view: SetView = 'chinh') => makeScene(camera(LAB_VIEWS[view]), LAB_LIGHT).rigAt([-40, 0, 1120], heightCm);
/** Màn hình hạn nộp (khung 200 × 120 đơn vị = mặt kính 50 × 30 cm). */
const hms = (t: number) => `${String(Math.floor(t / 3600)).padStart(2, '0')}:${String(Math.floor((t % 3600) / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
const DeadlineScreen = ({ variant = 0, frame = null }: { variant?: number; frame?: number | null }) => (
  <g>
    <rect width={200} height={120} fill="#f4f2ec" />
    <rect width={200} height={24} fill="#c4493b" />
    <text x={8} y={17} fontFamily="Arial, sans-serif" fontWeight={700} fontSize={13} fill="#fff">HẠN NỘP BÀI TẬP LỚN</text>
    <text x={100} y={70} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={38} fill="#c4493b">{variant % 4 ? '23:59' : hms(8048 - Math.floor((frame ?? 0) / 30))}</text>
    <text x={100} y={94} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={12} fill="#55605b">{variant % 4 ? 'Hôm nay · Kiến trúc máy tính' : 'Còn lại · Nhóm 5 chưa nộp'}</text>
    <rect x={10} y={104} width={180} height={7} rx={3.5} fill="#d9d5c9" />
    <rect x={10} y={104} width={variant % 4 ? 160 : 172} height={7} rx={3.5} fill="#c4493b" />
  </g>
);
const monitor = (S: ReturnType<typeof makeScene>, x: number, y: number, z: number, i: number, frame: number | null = null) => {
  S.box({ x: [x - 4, x + 4], y: [y, y + 14], z: [z + 6, z + 10], c: '#40494a' });
  S.box({ x: [x - 12, x + 12], y: [y, y + 1.5], z: [z + 2, z + 16], c: '#40494a' });
  S.box({ x: [x - 27, x + 27], y: [y + 12, y + 46], z: [z, z + 4], c: '#2f3738', front: '#2f3738' });
  S.quad([[x - 25, y + 14, z - 0.4], [x + 25, y + 14, z - 0.4], [x + 25, y + 44, z - 0.4], [x - 25, y + 44, z - 0.4]], i % 3 ? '#cfe1e3' : '#bcd6cc', { n: [0, 0, -1], emit: true, edge: false });
  // Màn hình chẵn hiện hạn nộp bài tập lớn (P2.04: áp lực thời gian); màn lẻ là giao diện làm việc chung.
  if (i % 2 === 0 && S.cam.pos[2] < z) S.plane([x - 25, y + 44, z - 0.8], [0.25, 0, 0], [0, -0.25, 0], <DeadlineScreen variant={i} frame={frame} />, 2, 3);
  else for (let k = 0; k < 3; k++) S.quad([[x - 20, y + 38 - k * 8, z - 0.6], [x + 6 - k * 4, y + 38 - k * 8, z - 0.6], [x + 6 - k * 4, y + 35 - k * 8, z - 0.6], [x - 20, y + 35 - k * 8, z - 0.6]], '#8ea9a2', { n: [0, 0, -1], emit: true, edge: false });
  S.glow([x, y + 29, z - 4], 26, '#d9f1ee', 0.14);
  S.box({ x: [x - 21, x + 21], y: [y, y + 2], z: [z - 30, z - 16], c: '#5c6766', top: '#7c8786' });
};
export const ComputerLab = ({ children, view = 'chinh', frame = null, layers = false, scope = false }: { children?: React.ReactNode; view?: SetView; frame?: number | null; layers?: boolean; scope?: boolean }) => {
  const id = uid(), S = makeScene(camera(LAB_VIEWS[view]), LAB_LIGHT, frame, layers);
  const X: [number, number] = [-480, 480], Z: [number, number] = [-200, 1250], H = 320;
  shellRoom(S, X, Z, H, { lowerH: 100, lower: '#b8c6b8', wall: '#e1e6d8', front: '#e6e8db', floor: '#c4ccbd' });
  tiles(S, X, Z, 60, '#a8b4a6', 0.6);
  [[150, 430], [560, 840], [970, 1210]].forEach(([a, b]) => {
    sideWindow(S, X[1], [a, b], [110, 280], -1, '#c9e2e0');
    for (let y = 120; y < 280; y += 12) S.line([X[1] - 3, y, a], [X[1] - 3, y, b], '#e9ece1', 1.6, { layer: 1.6, op: 0.9 });
  });
  // Màn chiếu và biển LAB 402 trên tường trước
  S.box({ x: [-230, 170], y: [120, 290], z: [1246, 1250], c: '#f6f5ee', front: '#f6f5ee' });
  S.box({ x: [-240, 180], y: [290, 300], z: [1240, 1250], c: '#59605d' });
  S.plane([-210, 268, 1245], [0.62, 0, 0], [0, -0.62, 0], <g><text x={0} y={70} fontFamily="Arial, sans-serif" fontWeight={700} fontSize={70} fill="#3f5f57">LAB 402</text><text x={2} y={120} fontFamily="Arial, sans-serif" fontSize={32} fill="#6b8073">Trình bày · Làm việc nhóm</text></g>, 2, 80);
  S.box({ x: [-470, -400], y: [0, 215], z: [1248, 1250], c: '#7e978a' });
  // Tường sau: cửa, tủ hồ sơ, bảng lịch phòng
  zDoor(S, -200, [-450, -360], 1, '#7e978a');
  S.box({ x: [80, 400], y: [0, 190], z: [-200, -150], c: '#b3bdb0', top: '#c4cdc0', back: '#a7b2a4' });
  for (const x of [80, 240]) S.box({ x: [x + 4, x + 156], y: [8, 182], z: [-150, -149], c: '#c2cbbd' });
  S.castShadow([80, 400], [-200, -150], 190, 0.14);
  S.plane([-180, 250, -199], [-0.4, 0, 0], [0, -0.4, 0], <g><rect width={260} height={140} rx={8} fill="#f2eedf" /><text x={20} y={46} fontFamily="Arial, sans-serif" fontWeight={700} fontSize={32} fill="#3f5f57">LỊCH PHÒNG</text>{[0, 1, 2].map((k) => <rect key={k} x={20} y={66 + k * 22} width={200 - k * 30} height={8} rx={4} fill="#a9b8a8" />)}</g>);
  for (let z = 150; z <= 1150; z += 330) for (const x of [-250, 250]) tubeLight(S, x, z, H);
  // Ba dãy bàn máy, mỗi dãy hai cụm, ghế phía camera
  [330, 620, 910].forEach((z) => [[-430, -50], [50, 430]].forEach(([a, b], side) => {
    S.box({ x: [a, b], y: [72, 76], z: [z, z + 70], c: '#d4d6c9', top: '#e2e3d8' });
    S.box({ x: [a + 3, b - 3], y: [10, 72], z: [z + 64, z + 68], c: '#9fac9f' });
    for (const lx of [a + 6, b - 10]) S.box({ x: [lx, lx + 4], y: [0, 72], z: [z + 4, z + 66], c: K.steel });
    S.castShadow([a, b], [z, z + 70], 76, 0.15);
    for (let i = 0; i < 4; i++) {
      const mx = a + 48 + i * ((b - a - 96) / 3);
      monitor(S, mx, 76, z + 42, i + side, frame);
      S.box({ x: [mx - 20, mx + 20], y: [44, 49], z: [z - 50, z - 12], c: '#5d6f6a', top: '#6f837d' });
      S.box({ x: [mx - 19, mx + 19], y: [49, 92], z: [z - 54, z - 49], c: '#5d6f6a' });
      S.cyl([mx, 0, z - 31], 3, 44, K.steel, { n: 8 });
      S.contact([mx - 22, mx + 22], [z - 54, z - 10], 0.12);
    }
  }));
  S.sprite([-40, 0, 1120], S.litActors(id, [-40, 0, 1120], <g data-layer="actors">{children}</g>));
  const out = wrap(id, 'lab-402', S.render(id, <rect width={1920} height={1080} fill="#dde3d8" />));
  return scope ? <g>{out}<Scope /></g> : out;
};

// ---------------------------------------------------------------------------------------------
// 3. Hành lang đại học (P3.02): một bên dãy cửa lớp, một bên lan can mở ra sân; bóng cột trên sàn.
// ---------------------------------------------------------------------------------------------
export const CORR_VIEWS: Record<SetView, CamSpec> = { chinh: { pos: [40, 165, -60], look: [-20, 135, 3000], mm: 22 }, nguoc: { pos: [-30, 165, 3400], look: [40, 135, -200], mm: 22 }, cheo: { pos: [140, 170, 2000], look: [-160, 115, 1350], mm: 24 }, cao: { pos: [40, 310, 120], look: [-60, 0, 1500], mm: 20 } };
const CORR_LIGHT: Light = { sun: [-0.62, -0.62, 0.32], amb: 0.66, diff: 0.42, fog: { color: '#e4ead9', dist: 2600, max: 0.45 } };
export const corridorSpot = (heightCm = 168, view: SetView = 'chinh') => makeScene(camera(CORR_VIEWS[view]), CORR_LIGHT).rigAt([10, 0, 620], heightCm);
export const UniversityCorridor = ({ children, view = 'chinh', frame = null, layers = false, scope = false }: { children?: React.ReactNode; view?: SetView; frame?: number | null; layers?: boolean; scope?: boolean }) => {
  const id = uid(), S = makeScene(camera(CORR_VIEWS[view]), CORR_LIGHT, frame, layers);
  const W0 = -160, W1 = 160, H = 330, D = 3600;
  // Ngoài lan can: sân, dãy nhà đối diện, cây
  S.quad([[W1, -340, -200], [3000, -340, -200], [3000, -340, 6000], [W1, -340, 6000]], '#c9c2ad', { n: [0, 1, 0], layer: 0, edge: false });
  S.box({ x: [1500, 1800], y: [-340, 700], z: [-400, 5200], c: '#e3d6b6', layer: 0 });
  for (let z = 0; z < 5000; z += 420) for (let y = -260; y < 650; y += 230) S.quad([[1499, y, z], [1499, y, z + 200], [1499, y + 120, z + 200], [1499, y + 120, z]], '#8fa7a6', { n: [-1, 0, 0], layer: 0.3, edge: false });
  for (const [z, r] of [[700, 260], [1900, 300], [3200, 280]] as const) {
    S.cyl([700, -340, z], 18, 260, '#7b6247', { n: 8, layer: 0.8 });
    for (const [dx, dy, dz, rr] of [[0, 330, 0, 1], [-120, 250, 40, 0.75], [110, 260, -30, 0.8], [30, 420, 20, 0.7]] as const) S.sphere([700 + dx, -340 + dy, z + dz], r * rr * 0.6, dy > 300 ? K.leaf : K.leafDark, { sy: 0.85, layer: 0.9, n: 20, bands: 10 });
  }
  // Sàn, trần, tường lớp bên trái
  S.quad([[W0, 0, -200], [W1, 0, -200], [W1, 0, D], [W0, 0, D]], '#d2c9b2', { n: [0, 1, 0], layer: 0, edge: false });
  tiles(S, [W0, W1], [-200, D], 80, '#bdb39c', 0.6);
  S.quad([[W0, H, D], [W1, H, D], [W1, H, -200], [W0, H, -200]], K.ceil, { n: [0, -1, 0], layer: 0, edge: false });
  S.quad([[W0, 0, -200], [W0, 0, D], [W0, 110, D], [W0, 110, -200]], '#b9cbbd', { n: [1, 0, 0], layer: 0, edge: false });
  S.quad([[W0, 110, -200], [W0, 110, D], [W0, H, D], [W0, H, -200]], '#e8e2cb', { n: [1, 0, 0], layer: 0, edge: false });
  S.quad([[W0, 0, D], [W1, 0, D], [W1, H, D], [W0, H, D]], '#dcd6c0', { n: [0, 0, -1], layer: 0, edge: false });
  S.line([W0, 0, -200], [W0, 0, D], '#2a312d', 14, { op: 0.16, layer: 0.6, cm: true });
  // Đầu hành lang phía camera gốc: tường có cửa cầu thang
  S.quad([[W1, 0, -200], [W0, 0, -200], [W0, H, -200], [W1, H, -200]], '#dcd6c0', { n: [0, 0, 1], layer: 0, edge: false });
  zDoor(S, -200, [-120, 0], 1, '#8b9c90', 220, true);
  S.plane([-115, 262, -199], [0.3, 0, 0], [0, -0.3, 0], <g><rect width={300} height={70} rx={8} fill="#3f6a63" /><text x={150} y={48} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={36} fill="#f4efe0">CẦU THANG</text></g>);
  [300, 900, 1500, 2100, 2700].forEach((z, i) => {
    S.box({ x: [W0 - 2, W0 + 4], y: [0, 222], z: [z - 6, z + 106], c: '#e9e4d2' });
    S.box({ x: [W0, W0 + 3], y: [0, 215], z: [z, z + 100], c: '#7f9c8f' });
    S.quad([[W0 + 3.4, 120, z + 18], [W0 + 3.4, 120, z + 82], [W0 + 3.4, 195, z + 82], [W0 + 3.4, 195, z + 18]], '#9fb9b4', { n: [1, 0, 0], edge: false });
    S.box({ x: [W0 + 3, W0 + 9], y: [100, 104], z: [z + 82, z + 92], c: '#c9b47c' });
    S.plane([W0 + 4.5, 262, z + 10], [0, 0, 0.3], [0, -0.3, 0], <g><rect width={240} height={80} rx={8} fill="#f3efe1" stroke="#9aaa9b" strokeWidth={4} /><text x={120} y={58} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={50} fill="#3d5a52">{402 + i}</text></g>);
    S.quad([[W0 + 0.6, 240, z + 260], [W0 + 0.6, 240, z + 520], [W0 + 0.6, 300, z + 520], [W0 + 0.6, 300, z + 260]], '#aec6c3', { n: [1, 0, 0], edge: false, layer: 0.4 });
  });
  // Lan can, cột, dầm; bóng cột đổ ngang sàn
  S.box({ x: [W1, W1 + 18], y: [0, 95], z: [-200, D], c: '#d9d2bd', top: '#e6dfca' });
  for (let z = -100; z < D; z += 500) {
    S.box({ x: [W1, W1 + 40], y: [0, H], z: [z, z + 40], c: '#ece6d2' });
    S.castShadow([W1, W1 + 40], [z, z + 40], H, 0.2);
    tubeLight(S, 0, z + 250, H, 90);
  }
  S.sunPatch([[W1, 95, -200], [W1, 95, D], [W1, H, D], [W1, H, -200]], 0.18);
  S.box({ x: [W1 - 10, W1 + 40], y: [H - 30, H], z: [-200, D], c: '#e3dcc6' });
  // Chậu cây gần máy
  S.cyl([115, 0, 260], 22, 38, '#a3765a', { r2: 26, n: 14 });
  for (const [dx, dy, dz, r] of [[0, 62, 0, 30], [-18, 88, 8, 24], [16, 86, -6, 22], [2, 112, 4, 18]] as const) S.sphere([115 + dx, dy, 260 + dz], r, dy > 80 ? K.leaf : K.leafDark, { sy: 0.9, n: 20, bands: 10 });
  S.castShadow([95, 135], [240, 280], 120, 0.18);
  S.sprite([10, 0, 620], S.litActors(id, [10, 0, 620], <g data-layer="actors">{children}</g>));
  const out = wrap(id, 'hanh-lang-dai-hoc', S.render(id, sky('#b9d8d6', '#e7efe0', id)));
  return scope ? <g>{out}<Scope /></g> : out;
};

// ---------------------------------------------------------------------------------------------
// 4. Mâm cơm gia đình ở quê (P2.06, S11, clip Zalo): ngồi bệt trên chiếu hoa, mâm nhôm tròn,
//    canh cua, nem rán; tường gạch quét vôi bong lộ gạch, bàn thờ, cửa mở ra sân nắng.
//    chinh: máy điện thoại cầm tay chĩa xuống mâm.
// ---------------------------------------------------------------------------------------------
export const FAM_VIEWS: Record<SetView, CamSpec> = { chinh: { pos: [30, 128, 40], look: [0, 40, 470], mm: 23 }, nguoc: { pos: [-40, 135, 720], look: [30, 30, 260], mm: 23 }, cheo: { pos: [340, 150, 170], look: [-120, 40, 460], mm: 22 }, cao: { pos: [-380, 300, -120], look: [60, 0, 430], mm: 19 } };
const FAM_LIGHT: Light = { sun: [-0.62, -0.45, 0.32], amb: 0.62, diff: 0.42, fog: { color: '#efe2c6', dist: 2600, max: 0.2 } };
const TRAY: V3 = [0, 0.6, 410];
/** Mảng tường vôi bong lộ gạch (vẽ trong khung 280 × 150 đơn vị). */
const BrickPatch = ({ cid, seed = 0 }: { cid: string; seed?: number }) => (
  <g>
    <clipPath id={cid}><path d={seed ? 'M14 60Q40 8 120 18T262 44Q276 104 214 134T70 132Q4 112 14 60Z' : 'M8 42Q70 2 150 22T270 30Q262 96 230 124T96 128Q20 110 8 42Z'} /></clipPath>
    <g clipPath={`url(#${cid})`}>
      <rect width={280} height={150} fill="#c48468" />
      {Array.from({ length: 10 }, (_, r) => <g key={r}><path d={`M0 ${r * 15 + 15}H280`} stroke="#e5d6bc" strokeWidth={2.4} />{Array.from({ length: 8 }, (_, c) => <path key={c} d={`M${c * 40 + (r % 2) * 20} ${r * 15}v15`} stroke="#e5d6bc" strokeWidth={2.4} />)}</g>)}
      <rect width={280} height={150} fill="#efe6d2" opacity={0.18} />
    </g>
  </g>
);
/** Bông hoa trên chiếu (khung 100 × 100 đơn vị, tâm 50,50). */
const MatFlower = () => (
  <g transform="translate(50 50)">
    {[45, 135, 225, 315].map((a) => <ellipse key={a} cx={0} cy={-36} rx={7} ry={14} fill="#4e8a5e" transform={`rotate(${a})`} />)}
    {[0, 1, 2, 3, 4, 5].map((k) => <ellipse key={k} cx={0} cy={-17} rx={9} ry={17} fill={k % 2 ? '#c4553f' : '#d8743c'} transform={`rotate(${k * 60})`} />)}
    <circle r={8} fill="#f1cf5f" />
  </g>
);
/** Chiếu hoa cói dựng bằng mặt phẳng thật trên sàn (đơn vị cm): nền cói, sợi ngang, viền đỏ – xanh, hoa. */
const flowerMat = (S: ReturnType<typeof makeScene>, x: [number, number], z: [number, number]) => {
  const y = 0.3, q = (a: [number, number], b: [number, number], yy: number, col: string, layer = 0.51) => S.quad([[a[0], yy, a[1]], [b[0], yy, a[1]], [b[0], yy, b[1]], [a[0], yy, b[1]]], col, { n: [0, 1, 0], layer, edge: false });
  q([x[0], z[0]], [x[1], z[1]], y, '#dcc488', 0.5);
  for (let zz = z[0] + 6; zz < z[1]; zz += 8) S.line([x[0], y + 0.1, zz], [x[1], y + 0.1, zz], '#c6ad70', 0.5, { cm: true, layer: 0.52, op: 0.6 });
  const ring = (d: number, w: number, col: string) => {
    const a: [number, number] = [x[0] + d, z[0] + d], b: [number, number] = [x[1] - d, z[1] - d], yy = y + 0.2;
    q([a[0], a[1]], [b[0], a[1] + w], yy, col); q([a[0], b[1] - w], [b[0], b[1]], yy, col);
    q([a[0], a[1]], [a[0] + w, b[1]], yy, col); q([b[0] - w, a[1]], [b[0], b[1]], yy, col);
  };
  ring(8, 9, '#b5463a'); ring(24, 5, '#3f7d5c');
  const cx = (x[0] + x[1]) / 2, cz = (z[0] + z[1]) / 2;
  for (const [fx, fz, sz] of [[cx, cz, 60], [x[0] + 70, z[0] + 70, 40], [x[1] - 70, z[0] + 70, 40], [x[0] + 70, z[1] - 70, 40], [x[1] - 70, z[1] - 70, 40]]) S.plane([fx - sz / 2, y + 0.4, fz + sz / 2], [sz / 100, 0, 0], [0, 0, -sz / 100], <MatFlower />, 0.55);
};
export const FamilyGathering = ({ children, cast = true, view = 'chinh', frame = null, layers = false, scope = false }: { children?: React.ReactNode; cast?: boolean; view?: SetView; frame?: number | null; layers?: boolean; scope?: boolean }) => {
  const id = uid(), S = makeScene(camera(FAM_VIEWS[view]), FAM_LIGHT, frame, layers);
  const X: [number, number] = [-450, 450], Z: [number, number] = [-250, 800], H = 330;
  shellRoom(S, X, Z, H, { wall: '#ece4cc', lower: '#d6c9a6', lowerH: 85, floor: '#b8775b', ceil: '#d9cdb2' });
  tiles(S, X, Z, 30, '#9a5c44', 0.6);
  // Vôi bong lộ gạch trên tường sau và tường trái; vệt ẩm chân tường
  S.plane([-420, 210, 799], [0.62, 0, 0], [0, -0.62, 0], <BrickPatch cid={`${id}-b1`} />, 0.55);
  S.plane([200, 140, 799], [0.5, 0, 0], [0, -0.5, 0], <BrickPatch cid={`${id}-b2`} seed={1} />, 0.55);
  S.plane([-449, 240, 600], [0, 0, 0.5], [0, -0.5, 0], <BrickPatch cid={`${id}-b3`} seed={1} />, 0.55);
  // Bàn thờ gỗ, ảnh, bát hương; lịch và đồng hồ treo
  S.box({ x: [-170, 110], y: [0, 95], z: [735, 795], c: '#7a4f36', top: '#8c5d40', front: '#6e4630' });
  S.box({ x: [-130, 70], y: [95, 101], z: [740, 790], c: '#a3412f', top: '#b44d38' });
  S.cyl([-30, 101, 765], 10, 9, '#c9a65c', { n: 12 });
  for (const dx of [-6, 0, 6]) S.line([-30 + dx, 110, 765], [-30 + dx * 1.4, 131, 765], '#6b4b35', 0.7, { cm: true, layer: 2.4 });
  S.box({ x: [-95, 35], y: [150, 240], z: [795, 799], c: '#6e5238' });
  S.quad([[-87, 158, 794.6], [27, 158, 794.6], [27, 232, 794.6], [-87, 232, 794.6]], '#c9c2a8', { n: [0, 0, -1], edge: false });
  S.plane([150, 250, 799], [0.5, 0, 0], [0, -0.5, 0], <g><rect width={130} height={180} rx={6} fill="#f1e7d0" /><rect width={130} height={40} rx={6} fill="#b34a3a" /><text x={65} y={30} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={24} fill="#fff4e4">LỊCH</text><text x={65} y={140} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={84} fill="#4f3a2d">11</text></g>);
  S.cyl([-300, 250, 799], 20, 3, '#f1ead8', { n: 18 });
  // Cửa gỗ mở ra sân (tường phải): khung, sân nắng, tàu chuối
  const e = X[1] - 0.6;
  S.quad([[e, 0, 200], [e, 0, 330], [e, 230, 330], [e, 230, 200]], '#f3ecd0', { n: [-1, 0, 0], raw: true, layer: 0.4 });
  S.quad([[e - 0.2, 0, 200], [e - 0.2, 0, 330], [e - 0.2, 60, 330], [e - 0.2, 60, 200]], '#d9c9a0', { n: [-1, 0, 0], raw: true, layer: 0.45 });
  S.box({ x: [X[1] - 8, X[1]], y: [0, 236], z: [194, 200], c: '#7e5a3e' });
  S.box({ x: [X[1] - 8, X[1]], y: [0, 236], z: [330, 336], c: '#7e5a3e' });
  S.box({ x: [X[1] - 8, X[1]], y: [230, 238], z: [194, 336], c: '#7e5a3e' });
  S.box({ x: [X[1] - 70, X[1] - 4], y: [0, 230], z: [330, 336], c: '#8c6446', yaw: -60, pivot: [X[1] - 4, 333] });
  S.sunPatch([[X[1], 0, 200], [X[1], 0, 330], [X[1], 230, 330], [X[1], 230, 200]], 0.3, '#ffe6b0');
  // Cửa sổ chớp gỗ tường trái
  sideWindow(S, X[0], [350, 560], [100, 230], 1, '#d7e3c3', false);
  S.box({ x: [X[0], X[0] + 4], y: [100, 230], z: [300, 350], c: '#6f7f5a' });
  // Chiếu hoa trải giữa nhà, mâm nhôm tròn trên chiếu
  flowerMat(S, [-180, 180], [245, 575]);
  S.contact([-55, 55], [355, 465], 0.22, 0.6, 2);
  S.cyl(TRAY, 56, 3, '#b9bec2', { top: '#d9dee1', n: 40 });
  for (let k = 0; k < 10; k++) { const a0 = 3.6 + k * 0.1, a1 = a0 + 0.08; S.line([Math.cos(a0) * 50, 3.8, TRAY[2] + Math.sin(a0) * 50], [Math.cos(a1) * 50, 3.8, TRAY[2] + Math.sin(a1) * 50], '#f8fbfc', 1.6, { cm: true, layer: 2.05, op: 0.8 }); }
  const y0 = 3.8, tz = TRAY[2];
  // Bát canh cua: nước rau xanh – nâu riêu
  S.cyl([-20, y0, tz + 8], 12, 9, '#eef0ea', { r2: 15, top: '#8f8a4e', n: 16 });
  for (const [dx, dz] of [[-4, 2], [3, -3], [5, 5]]) S.cyl([-20 + dx, y0 + 9.2, tz + 8 + dz], 3, 0.4, '#c79c64', { n: 8 });
  // Hơi nóng bốc lên từ bát canh: vài đốm trắng mờ trôi lên, nở rộng và tan dần.
  if (frame !== null) for (let k = 0; k < 6; k++) { const ph = (frame / 75 + k / 6) % 1; S.glow([-20 + Math.sin(frame / 14 + k * 2) * 4 * ph, y0 + 11 + ph * 34, tz + 8], 5 + ph * 9, '#ffffff', 0.34 * (1 - ph)); }
  // Đĩa nem rán
  S.cyl([24, y0, tz - 8], 15, 1.5, '#f3f1e9', { r2: 18, n: 18 });
  [[-8, -4, 20], [-2, 4, -15], [6, -2, 35], [10, 6, 5], [0, -9, -30]].forEach(([dx, dz, yaw]) => S.box({ x: [24 + dx - 6, 24 + dx + 6], y: [y0 + 1.5, y0 + 4.5], z: [tz - 8 + dz - 1.6, tz - 8 + dz + 1.6], c: '#c4803c', top: '#da9b4c', yaw }));
  // Đĩa rau luộc, bát nước chấm, bát cơm, đũa
  S.cyl([-6, y0, tz - 34], 13, 1.5, '#f3f1e9', { r2: 15, n: 16 });
  S.sphere([-6, y0 + 3, tz - 34], 10, '#6f9a4e', { sy: 0.35, n: 10, bands: 4 });
  S.cyl([16, y0, tz + 30], 5, 4, '#f1eee4', { r2: 6.5, top: '#b8742f', n: 12 });
  for (const a of [0.3, 1.5, 2.6, 4.0, 5.2]) { const bx = Math.cos(a) * 42, bz = tz + Math.sin(a) * 42; S.cyl([bx, y0, bz], 4.5, 5, '#eef1ea', { r2: 6.5, top: '#f8f6ee', n: 12 }); S.line([bx + 6, y0 + 0.6, bz - 3], [bx + 6 + Math.cos(a) * 20, y0 + 0.6, bz - 3 + Math.sin(a) * 20], '#c9a46a', 0.6, { cm: true, layer: 2.2 }); }
  S.cyl([-95, 0.4, 360], 15, 22, '#d8d2c4', { top: '#c9c2b2', n: 18 });
  S.cyl([-95, 22.4, 360], 6, 3, '#8b8578', { n: 10 });
  // Người thân ngồi bệt quanh mâm (dáng ngồi thấp hạ xuống chiếu, phần chân dưới chiếu bị cắt)
  if (cast) {
    const seats: [number, number][] = [[-115, 500], [-40, 540], [40, 540], [115, 500]];
    seats.forEach(([x, z], i) => {
      const p = S.rigAt([x, -20, z], 168), cut = S.cam.project([x, 0, z - 48])[1];
      const pose = TWIN_POSES.sitLow;
      const node = i === 0 ? <SupportingActor role="me" pose={pose} {...p} /> : i === 1 ? <SupportingActor role="bac-hai" pose={pose} {...p} /> : i === 2 ? <FormalTwin pose={pose} mood="neutral_smile" {...p} /> : <SupportingActor role="ba" pose={pose} {...p} />;
      S.sprite([x, 30, z], <g><clipPath id={`${id}-sit${i}`}><rect x={-4000} y={-4000} width={8000} height={cut + 4000} /></clipPath><g clipPath={`url(#${id}-sit${i})`}>{S.litActors(`${id}-f${i}`, [x, 40, z], node)}</g></g>, 2, [0, 0, -1]);
    });
  }
  S.sprite([0, 0, 520], S.litActors(id, [0, 0, 520], <g data-layer="actors">{children}</g>));
  const out = wrap(id, 'mam-com-gia-dinh', S.render(id, <rect width={1920} height={1080} fill="#d8c7aa" />), '#ffcf8a', 0.38);
  return scope ? <g>{out}<Scope /></g> : out;
};

// ---------------------------------------------------------------------------------------------
// S12. Thế giới trong gương (P3.05, trailer): phòng trọ gốc lật ngang hoàn toàn, chìm trong vực xanh thẫm;
//      sàn hoá mặt nước phẳng phát sáng lân tinh, gợn sóng quanh chỗ Nam chìm, khung gương trôi lơ lửng.
//      `ripple` 0–1 là pha gợn sóng (chạy vòng); `at` là tâm gợn trên màn hình; children vẽ giữa hai lớp nước.
// ---------------------------------------------------------------------------------------------
const WATER_Y = 800;
export const MirrorRealm = ({ children, ripple: rp = 0, at = [1160, 880], floating = true, frame = null }: { children?: React.ReactNode; ripple?: number; at?: [number, number]; floating?: boolean; frame?: number | null }) => {
  const id = uid(), ripple = frame === null ? rp : rp + frame / 38, bob = frame === null ? 0 : 9 * Math.sin(frame / 31);
  const room = <RoomScene view="wide" night door="ajar" phone="hidden" wallet={false} kitchen="clean" frame={frame} />;
  const flipped = <g transform="translate(1920 0) scale(-1 1)">{room}</g>;
  const specks = Array.from({ length: 46 }, (_, i) => [((i * 397) % 1880) + 20, WATER_Y + 12 + ((i * 131) % 260), 1.2 + ((i * 7) % 5) * 0.5] as const);
  return (
    <g data-scene="the-gioi-guong">
      <defs>
        <linearGradient id={`${id}-abyss`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#01080a" stopOpacity={0.92} /><stop offset="0.5" stopColor="#05222a" stopOpacity={0.42} /><stop offset="0.74" stopColor="#0b3a42" stopOpacity={0.22} /></linearGradient>
        <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3fd6c8" stopOpacity={0.5} /><stop offset="0.18" stopColor="#0f5158" stopOpacity={0.86} /><stop offset="1" stopColor="#031417" stopOpacity={0.97} /></linearGradient>
        <linearGradient id={`${id}-veil`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a7f80" stopOpacity={0.35} /><stop offset="0.5" stopColor="#06292d" stopOpacity={0.72} /></linearGradient>
        <radialGradient id={`${id}-vig`} cx=".5" cy=".55" r=".72"><stop offset=".45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".75" /></radialGradient>
        <clipPath id={`${id}-wc`}><rect y={WATER_Y} width={1920} height={1080 - WATER_Y} /></clipPath>
      </defs>
      {flipped}
      <rect width={1920} height={1080} fill="#0e3a42" opacity={0.62} />
      <rect width={1920} height={1080} fill={`url(#${id}-abyss)`} />
      {/* Mặt nước: phản chiếu mờ căn phòng lật, nền nước, viền sáng lân tinh */}
      <g clipPath={`url(#${id}-wc)`} opacity={0.26}><g transform={`translate(0 ${2 * WATER_Y}) scale(1 -1)`}>{flipped}<rect width={1920} height={1080} fill="#0e3a42" opacity={0.6} /></g></g>
      <rect y={WATER_Y} width={1920} height={1080 - WATER_Y} fill={`url(#${id}-water)`} />
      <rect y={WATER_Y - 2} width={1920} height={4} fill="#8ff3e6" opacity={0.55} />
      {floating && (
        <g data-layer="guong-troi">
          <ellipse cx={560} cy={WATER_Y + 26} rx={150} ry={16} fill="#7ff0e2" opacity={0.18} />
          <g transform={`translate(560 ${WATER_Y - 40 + bob}) rotate(${-7 + bob * 0.25}) scale(0.62)`}><Mirror progress={0.6} phase={2} /></g>
        </g>
      )}
      <g data-layer="actors">{children}</g>
      <rect y={WATER_Y} width={1920} height={1080 - WATER_Y} fill={`url(#${id}-veil)`} />
      <g data-layer="gon-song" fill="none" stroke="#9af7ea">
        {[0, 1, 2, 3].map((k) => { const p = (k + (ripple % 1)) / 4, rx = 70 + p * 620; return <ellipse key={k} cx={at[0]} cy={at[1]} rx={rx} ry={rx * 0.11} strokeWidth={3 - p * 2} opacity={0.6 * (1 - p)} />; })}
      </g>
      {specks.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#b9fff4" opacity={(0.25 + ((i * 13) % 10) / 20) * (frame === null ? 1 : 0.55 + 0.45 * Math.sin(frame / 11 + i * 1.7))} />)}
      <rect width={1920} height={1080} fill={`url(#${id}-vig)`} />
    </g>
  );
};

// ---------------------------------------------------------------------------------------------
// 5. Góc đồ cho tặng (P1.00, S07): chân cầu thang dãy trọ tầng trệt, chiều muộn ẩm sau mưa.
//    Ghế gãy, chậu hoa vỡ, đống đồ phủ bạt nhựa, gương gỗ cũ bám bụi dựa tường, bìa các-tông viết tay.
// ---------------------------------------------------------------------------------------------
export const DONATION_VIEWS: Record<SetView, CamSpec> = { chinh: { pos: [110, 150, -300], look: [50, 95, 400], mm: 25 }, nguoc: { pos: [180, 155, 330], look: [-80, 100, -400], mm: 22 }, cheo: { pos: [430, 160, -60], look: [-120, 80, 380], mm: 22 }, cao: { pos: [-280, 262, -260], look: [120, 20, 340], mm: 19 } };
const DONATION_LIGHT: Light = { sun: [-0.82, -0.36, 0.3], amb: 0.6, diff: 0.3, fog: { color: '#c7cdc8', dist: 2200, max: 0.32 } };
export const donationSpot = (heightCm = 168, view: SetView = 'chinh') => makeScene(camera(DONATION_VIEWS[view]), DONATION_LIGHT).rigAt([-170, 0, 170], heightCm);
export const DonationCorner = ({ children, view = 'chinh', cam, frame = null, layers = false, scope = false }: { children?: React.ReactNode; view?: SetView; cam?: CamSpec; frame?: number | null; layers?: boolean; scope?: boolean }) => {
  const id = uid(), S = makeScene(camera(cam ?? DONATION_VIEWS[view]), DONATION_LIGHT, frame, layers);
  const BZ = 400, XR = 260;
  // Sân ngoài (bên phải) ướt mưa, tường nhà bên, cây
  S.quad([[XR, -0.2, -500], [1100, -0.2, -500], [1100, -0.2, 1500], [XR, -0.2, 1500]], '#8e958b', { n: [0, 1, 0], layer: 0, edge: false });
  S.box({ x: [XR, 1100], y: [0, 300], z: [1300, 1330], c: '#c9c1aa' });
  S.box({ x: [1080, 1100], y: [0, 300], z: [-500, 1300], c: '#bdb59e' });
  S.sphere([700, 260, 1150], 120, '#5f7f5c', { sy: 0.8 });
  S.cyl([700, 0, 1150], 10, 180, '#6b5a47', { n: 8 });
  // Tầng trệt: sàn gạch ướt, tường sau và tường trái, sàn tầng trên làm trần
  S.quad([[-400, 0, -400], [XR, 0, -400], [XR, 0, BZ], [-400, 0, BZ]], '#a9a48e', { n: [0, 1, 0], layer: 0, edge: false });
  tiles(S, [-400, XR], [-400, BZ], 40, '#8f8a75', 0.5);
  S.quad([[XR, 0, BZ], [-400, 0, BZ], [-400, 100, BZ], [XR, 100, BZ]], '#9eab99', { n: [0, 0, -1], layer: 0, edge: false });
  S.quad([[XR, 100, BZ], [-400, 100, BZ], [-400, 285, BZ], [XR, 285, BZ]], '#d8d2bd', { n: [0, 0, -1], layer: 0, edge: false });
  S.quad([[-400, 0, BZ], [-400, 0, -400], [-400, 285, -400], [-400, 285, BZ]], '#d3cdb8', { n: [1, 0, 0], layer: 0, edge: false });
  S.quad([[-400, 0, -400], [XR, 0, -400], [XR, 285, -400], [-400, 285, -400]], '#d3cdb8', { n: [0, 0, 1], layer: 0, edge: false });
  S.box({ x: [-400, 1100], y: [285, 305], z: [-400, BZ], c: '#c7c1ad', bottom: '#b9b39f' });
  S.box({ x: [XR - 24, XR], y: [0, 285], z: [BZ - 24, BZ], c: '#cfc8b2' });
  zDoor(S, -400, [-300, -210], 1, '#6f8d80');
  zDoor(S, -400, [20, 110], 1, '#6f8d80');
  // Vệt ẩm loang trên tường sau, chân tường sẫm nước
  [[-340, 0.26], [-60, 0.2], [150, 0.24]].forEach(([x, op], i) => S.plane([x, 285, BZ - 0.6], [1, 0, 0], [0, -1, 0], <path d={`M0 0H${60 + i * 20}Q${70 + i * 18} 90 ${50 + i * 10} 170Q${30 + i * 8} 230 ${20 + i * 6} 285H${4 + i * 3}Q-6 160 0 0Z`} fill="#8d9284" opacity={op} />, 0.55));
  // Cầu thang lên tầng: 12 bậc dựa tường sau, leo về bên trái; lan can sắt mép ngoài
  for (let i = 0; i < 12; i++) S.box({ x: [-40 - (i + 1) * 26, -40 - i * 26], y: [0, (i + 1) * 17], z: [300, BZ], c: '#b5af9a', top: '#cdc6b0', front: '#aca690' });
  S.box({ x: [-400, -352], y: [0, 204], z: [300, BZ], c: '#b5af9a', top: '#cdc6b0', front: '#aca690' });
  for (let i = 0; i <= 12; i += 2) { const x = -53 - i * 26, y = (i + 1) * 17; S.line([x, y, 302], [x, y + 92, 302], '#47504d', 1.6, { cm: true, layer: 2.3 }); }
  S.line([-53, 109, 302], [-365, 109 + 204, 302], '#3d4643', 3.2, { cm: true, layer: 2.35 });
  S.castShadow([-352, -40], [300, BZ], 120, 0.12);
  // Góc đồ: chậu hoa vỡ, ghế gãy, đống đồ phủ bạt, thùng giấy, gương bụi
  S.cyl([-10, 0, 350], 14, 24, '#b86b4a', { r2: 18, top: '#5a4636', n: 14 });
  S.line([-20, 24, 334], [-14, 8, 338], '#5e3626', 0.6, { cm: true, layer: 2.3 });
  S.box({ x: [12, 22], y: [0, 2], z: [318, 326], c: '#b86b4a', yaw: 30 });
  for (const [dx, h] of [[-4, 46], [3, 38], [-1, 52]]) S.line([-10 + dx, 24, 350], [-10 + dx * 3, 24 + h, 348], '#7d6a4a', 0.5, { cm: true, layer: 2.3 });
  S.box({ x: [32, 80], y: [42, 46], z: [326, 372], c: '#9d7650', top: '#b48a5f', yaw: 8 });
  for (const [lx, lz] of [[34, 368], [74, 368], [74, 330]]) S.box({ x: [lx, lx + 4], y: [0, 42], z: [lz, lz + 4], c: '#7a5a3d', yaw: 8, pivot: [56, 349] });
  S.box({ x: [34, 38], y: [0, 14], z: [330, 334], c: '#7a5a3d', yaw: 8, pivot: [56, 349] });
  S.box({ x: [32, 80], y: [46, 92], z: [368, 372], c: '#9d7650', yaw: 8 });
  S.box({ x: [20, 60], y: [0, 4], z: [282, 287], c: '#7a5a3d', yaw: -25 });
  S.line([40, 46.4, 340], [62, 46.4, 356], '#4e3825', 0.5, { cm: true, layer: 2.3 });
  S.box({ x: [96, 162], y: [0, 44], z: [328, 392], c: '#8a8574' });
  const tarp = '#3f7fa8';
  S.quad([[92, 47, 324], [166, 47, 324], [166, 47, 396], [92, 47, 396]], tarp, { n: [0, 1, 0] });
  S.quad([[92, 47, 324], [166, 47, 324], [170, 6, 316], [128, 12, 318], [88, 3, 318]], tarp, { n: [0, 0, -1], cull: false });
  S.quad([[166, 47, 324], [166, 47, 396], [172, 4, 398], [171, 10, 360], [170, 6, 316]], '#386f93', { n: [1, 0, 0], cull: false });
  for (const x of [110, 132, 152]) S.line([x, 47.5, 324], [x + 4, 10, 318], '#2f6488', 0.6, { cm: true, layer: 2.3 });
  S.box({ x: [205, 252], y: [0, 34], z: [306, 346], c: '#b9946a', top: '#c8a57b' });
  S.contact([90, 172], [316, 398], 0.22);
  S.contact([-28, 84], [282, 376], 0.18);
  // Bìa các-tông viết tay dán tường
  S.plane([-30, 178, BZ - 0.8], [0.52, 0, 0], [0, -0.52, 0], <g transform="rotate(-3)"><path d="M4 6L232 0L238 58L230 120L8 126L0 70Z" fill="#c2a174" /><path d="M14 14H222" stroke="#d8bd92" strokeWidth={3} /><rect x={92} y={-10} width={50} height={18} fill="#e7e2d0" opacity={0.85} transform="rotate(6 117 0)" /><text x={120} y={60} textAnchor="middle" fontFamily="'Comic Sans MS', 'Segoe Print', cursive" fontWeight={700} fontSize={32} fill="#2e3a4d">GÓC ĐỒ CHO TẶNG</text><text x={120} y={102} textAnchor="middle" fontFamily="'Comic Sans MS', 'Segoe Print', cursive" fontSize={27} fill="#2e3a4d">Ai cần thì lấy</text></g>, 2, 4);
  // Gương gỗ cũ dựa tường, phủ bụi (gương 2D gốc giữa đáy, 640 đơn vị = 124 cm)
  const g = S.cam.project([200, 0, 378]), gs = (124 * S.cam.pxcm([200, 0, 378])) / 640;
  S.contact([168, 232], [366, 392], 0.24);
  S.sprite([200, 40, 378], <g transform={`translate(${g[0]} ${g[1]}) scale(${gs}) rotate(-3)`}><Mirror /><rect x={-118} y={-600} width={236} height={548} fill="#d6ccb2" opacity={0.26} />{Array.from({ length: 18 }, (_, i) => <circle key={i} cx={-100 + ((i * 53) % 200)} cy={-560 + ((i * 97) % 480)} r={3 + (i % 4)} fill="#e6dcc3" opacity={0.5} />)}<path d="M-110 -80Q0 -110 110 -70" stroke="#e1d7be" strokeWidth={14} opacity={0.35} fill="none" /></g>, 2, [0, 0, -1]);
  // Vũng nước đọng phản chiếu trời xám, giọt mưa còn rỏ từ mép sàn tầng trên
  for (const [x, z, rx, rz] of [[120, 120, 90, 34], [-160, 40, 60, 22], [330, -60, 140, 50], [380, 260, 80, 28]]) S.plane([x - rx, 0.5, z + rz], [1, 0, 0], [0, 0, -1], <ellipse cx={rx} cy={rz} rx={rx} ry={rz} fill="#c4ccc8" opacity={0.22} />, 0.55);
  if (frame !== null) for (let k = 0; k < 9; k++) { const ph = (frame * 0.035 + k * 0.381) % 1, x = XR + 8 + (k % 3) * 3, z = -230 + k * 62, y = 284 - ph * 280; S.line([x, y, z], [x, y + 16, z], '#dfe8e6', 0.5, { cm: true, layer: 2.4, op: 0.75 * Math.min(1, (1 - ph) * 5) }); }
  else for (const [x, z] of [[XR + 10, -200], [XR + 14, 40], [XR + 8, 230]]) S.line([x, 280, z], [x, 262, z], '#dfe8e6', 0.5, { cm: true, layer: 2.4, op: 0.7 });
  S.sprite([-170, 0, 170], S.litActors(id, [-170, 0, 170], <g data-layer="actors">{children}</g>));
  const out = wrap(id, 'goc-do-cho-tang', S.render(id, sky('#aeb8b6', '#e1dccb', id)), '#e8c48f', 0.42);
  return scope ? <g>{out}<Scope /></g> : out;
};
// ---------------------------------------------------------------------------------------------
// 6. Sân bóng mini (P2.05): cỏ nhân tạo sọc, khung thành có lưới, rào lưới, cột đèn, nhà và cây phía xa.
// ---------------------------------------------------------------------------------------------
export const PITCH_VIEWS: Record<SetView, CamSpec> = { chinh: { pos: [180, 260, -260], look: [0, 40, 2400], mm: 26 }, nguoc: { pos: [-200, 260, 4500], look: [0, 40, 1000], mm: 26 }, cheo: { pos: [1180, 320, 2200], look: [-400, 0, 2200], mm: 24 }, cao: { pos: [-1150, 1300, -700], look: [0, 0, 2400], mm: 24 } };
const PITCH_LIGHT: Light = { sun: [0.45, -0.55, -0.7], amb: 0.66, diff: 0.4, fog: { color: '#dfe8dc', dist: 5200, max: 0.5 } };
export const pitchSpot = (heightCm = 168, view: SetView = 'chinh') => makeScene(camera(PITCH_VIEWS[view]), PITCH_LIGHT).rigAt([-120, 0, 900], heightCm);
export const MiniPitch = ({ children, view = 'chinh', cam, frame = null, layers = false, scope = false }: { children?: React.ReactNode; view?: SetView; cam?: CamSpec; frame?: number | null; layers?: boolean; scope?: boolean }) => {
  const id = uid(), S = makeScene(camera(cam ?? PITCH_VIEWS[view]), PITCH_LIGHT, frame, layers);
  const XW = 1000, Z0 = 200, Z1 = 4200;
  S.quad([[-6000, 0, -500], [6000, 0, -500], [6000, 0, 9000], [-6000, 0, 9000]], '#b8b39c', { n: [0, 1, 0], layer: 0, edge: false });
  [-3800, -2300, -600, 1200, 2900].forEach((x, i) => { S.box({ x: [x, x + 1300], y: [0, 900 + (i % 2) * 450], z: [7000, 7800], c: ['#d9c7a6', '#c7b79a', '#e0d3b5', '#b9b49a', '#d4bea0'][i], layer: 0.2 }); for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) S.quad([[x + 120 + q * 290, 160 + r * 200, 6998], [x + 260 + q * 290, 160 + r * 200, 6998], [x + 260 + q * 290, 260 + r * 200, 6998], [x + 120 + q * 290, 260 + r * 200, 6998]], '#8fa6a3', { n: [0, 0, -1], layer: 0.25, edge: false }); });
  for (const x of [-3200, -1600, 400, 2200, 3600]) { S.cyl([x, 0, 6100], 26, 380, '#7b6247', { n: 8, layer: 0.3 }); for (const [dx, dy, r] of [[0, 560, 300], [-200, 450, 230], [190, 470, 240]] as const) S.sphere([x + dx, dy, 6100], r, dy > 500 ? K.leaf : K.leafDark, { sy: 0.85, layer: 0.35, n: 18, bands: 9 }); }
  // Nhà và cây phía sau camera gốc và hai bên, để quay ngược hay quay ngang vẫn có cảnh
  [-3600, -1900, -200, 1500, 3200].forEach((x, i) => S.box({ x: [x, x + 1200], y: [0, 800 + (i % 2) * 500], z: [-3400, -2700], c: ['#d4bea0', '#c7b79a', '#e0d3b5', '#d9c7a6', '#b9b49a'][i], layer: 0.2 }));
  for (const sx of [-1, 1]) [0, 1800, 3600].forEach((z, i) => S.box({ x: sx < 0 ? [-5200, -4300] : [4300, 5200], y: [0, 900 + i * 250], z: [z - 400, z + 600], c: ['#d9c7a6', '#e0d3b5', '#c7b79a'][i], layer: 0.2 }));
  for (let i = 0; i < 10; i++) S.quad([[-XW - 200, 0.4, Z0 + i * 400], [XW + 200, 0.4, Z0 + i * 400], [XW + 200, 0.4, Z0 + (i + 1) * 400], [-XW - 200, 0.4, Z0 + (i + 1) * 400]], i % 2 ? '#5d9a59' : '#66a561', { n: [0, 1, 0], layer: 0.3, edge: false });
  const W = '#f3f3ea';
  for (const [a, b] of [[[-XW, Z0], [XW, Z0]], [[-XW, Z1], [XW, Z1]], [[-XW, Z0], [-XW, Z1]], [[XW, Z0], [XW, Z1]], [[-XW, 2200], [XW, 2200]], [[-400, Z1], [-400, Z1 - 600]], [[400, Z1], [400, Z1 - 600]], [[-400, Z1 - 600], [400, Z1 - 600]]] as [number, number][][]) S.line([a[0], 1, a[1]], [b[0], 1, b[1]], W, 8, { cm: true, layer: 0.5 });
  const circ = Array.from({ length: 33 }, (_, i) => { const t = (i / 32) * Math.PI * 2; return [Math.cos(t) * 300, 1, 2200 + Math.sin(t) * 300] as V3; });
  circ.slice(1).forEach((p, i) => S.line(circ[i], p, W, 8, { cm: true, layer: 0.5 }));
  // Khung thành 5 × 2 m, lưới
  const gz = Z1, gw = 250, gh = 200, gd = 120;
  for (const x of [-gw, gw]) { S.cyl([x, 0, gz], 6, gh, W, { n: 10 }); S.castShadow([x - 6, x + 6], [gz - 6, gz + 6], gh, 0.22); }
  S.box({ x: [-gw - 6, gw + 6], y: [gh - 6, gh + 6], z: [gz - 6, gz + 6], c: W, edge: false });
  for (let x = -gw; x <= gw; x += 25) S.line([x, 0, gz + gd], [x, gh, gz], '#e8ece4', 1.2, { layer: 1.9, op: 0.75 });
  for (let y = 0; y <= gh; y += 25) S.line([-gw, y, gz + gd * (1 - y / gh)], [gw, y, gz + gd * (1 - y / gh)], '#e8ece4', 1.2, { layer: 1.9, op: 0.75 });
  // Rào lưới và cột đèn
  for (let z = 0; z <= 4600; z += 460) for (const x of [-XW - 260, XW + 260]) S.cyl([x, 0, z], 5, 600, '#7d8b8a', { n: 8 });
  for (const z of [0, 4600]) { for (let x = -XW - 260; x <= XW + 260; x += 420) S.cyl([x, 0, z], 5, 600, '#7d8b8a', { n: 8 }); S.line([-XW - 260, 600, z], [XW + 260, 600, z], '#7d8b8a', 3); S.quad([[-XW - 260, 0, z], [XW + 260, 0, z], [XW + 260, 600, z], [-XW - 260, 600, z]], '#9fb0ab', { n: [0, 0, z ? -1 : 1], raw: true, op: 0.14, cull: false, edge: false, layer: 2.5 }); }
  for (const x of [-XW - 260, XW + 260]) { S.line([x, 600, 0], [x, 600, 4600], '#7d8b8a', 3); S.quad([[x, 0, 0], [x, 0, 4600], [x, 600, 4600], [x, 600, 0]], '#9fb0ab', { n: [x < 0 ? 1 : -1, 0, 0], raw: true, op: 0.14, cull: false, edge: false, layer: 2.5 }); }
  for (const [x, z] of [[-XW - 320, 600], [XW + 320, 600], [-XW - 320, 3800], [XW + 320, 3800]]) { S.cyl([x, 0, z], 12, 1100, '#8c9796', { n: 8 }); S.box({ x: [x - 70, x + 70], y: [1090, 1150], z: [z - 15, z + 15], c: '#c9cfd0' }); }
  const ball = S.cam.project([-260, 0, 980]), bs = (22 * S.cam.pxcm([-260, 0, 980])) / 170;
  S.contact([-272, -248], [968, 992], 0.3);
  S.sprite([-260, 11, 980], <g transform={`translate(${ball[0]} ${ball[1] - 85 * bs}) scale(${bs})`}><Football /></g>);
  S.sprite([-120, 0, 900], S.litActors(id, [-120, 0, 900], <g data-layer="actors">{children}</g>));
  const out = wrap(id, 'san-bong-mini', S.render(id, sky('#a9d0d4', '#e9efdf', id)), '#ffe7b0');
  return scope ? <g>{out}<Scope /></g> : out;
};

// ---------------------------------------------------------------------------------------------
// 7. Góc cắt tóc (P2.05 montage): tiệm nhỏ, gương lớn, quầy, ghế cắt tóc, sàn ô cờ đen trắng.
// ---------------------------------------------------------------------------------------------
/** `turn`: góc xoay của ghế cắt tóc quanh trụ (độ). 0 là khách ngồi nhìn vào gương; 180 là quay ra cửa. */
export const BARBER_VIEWS: Record<SetView, CamSpec> = { chinh: { pos: [-150, 158, -40], look: [40, 105, 420], mm: 26 }, nguoc: { pos: [180, 160, 380], look: [-100, 110, -100], mm: 24 }, cheo: { pos: [300, 170, 40], look: [-150, 90, 350], mm: 24 }, cao: { pos: [-240, 285, -90], look: [100, 10, 330], mm: 22 } };
export const BarberCorner = ({ turn = 0, view = 'chinh', frame = null, layers = false, scope = false }: { turn?: number; view?: SetView; frame?: number | null; layers?: boolean; scope?: boolean }) => {
  const id = uid(), S = makeScene(camera(BARBER_VIEWS[view]), { sun: [0.6, -0.65, 0.4], amb: 0.62, diff: 0.42, lamps: [{ p: [40, 250, 300], col: [1, 0.9, 0.7], r: 200, k: 0.25 }] }, frame, layers);
  const X: [number, number] = [-260, 320], Z: [number, number] = [-100, 430], H = 300;
  shellRoom(S, X, Z, H, { wall: '#e3dcc6', lower: '#9fb7ad', lowerH: 120, floor: '#e8e4d8' });
  // Mặt tiền: cửa kính ra phố, ô kính có biển hiệu nhìn ngược, ghế chờ
  zDoor(S, -100, [-230, -120], 1, '#8a9290', 220, true);
  S.quad([[230, 90, -99.4], [-60, 90, -99.4], [-60, 240, -99.4], [230, 240, -99.4]], '#c3d9d5', { n: [0, 0, 1], raw: true, layer: 0.4 });
  S.box({ x: [-66, 236], y: [84, 90], z: [-100, -94], c: K.white });
  S.box({ x: [-40, 200], y: [40, 46], z: [-90, -50], c: '#7d6a50', top: '#8e7a5c' });
  for (const x of [-30, 186]) S.box({ x: [x, x + 4], y: [0, 40], z: [-86, -54], c: K.steel });
  S.castShadow([-40, 200], [-90, -50], 46, 0.14);
  for (let x = X[0]; x < X[1]; x += 40) for (let z = Z[0]; z < Z[1]; z += 40) if (((x - X[0]) / 40 + (z - Z[0]) / 40) % 2 === 0) S.quad([[x, 0.3, z], [x + 40, 0.3, z], [x + 40, 0.3, z + 40], [x, 0.3, z + 40]], '#3f4744', { n: [0, 1, 0], layer: 0.3, edge: false });
  // Gương lớn trên quầy, ánh phản chiếu
  S.box({ x: [-120, 220], y: [110, 260], z: [424, 430], c: '#8e7a5c' });
  S.quad([[-110, 118, 423.4], [210, 118, 423.4], [210, 252, 423.4], [-110, 252, 423.4]], '#bfd2cb', { n: [0, 0, -1], edge: false });
  S.quad([[-60, 252, 423], [40, 252, 423], [-30, 118, 423], [-110, 118, 423], [-110, 160, 423]], '#ffffff', { n: [0, 0, -1], raw: true, op: 0.25, edge: false, layer: 2.6 });
  S.box({ x: [-150, 250], y: [0, 86], z: [370, 430], c: '#8a775a', top: '#b39a75', front: '#7d6a50' });
  for (const x of [-140, -10, 120]) S.box({ x: [x, x + 120], y: [30, 76], z: [369, 370.5], c: '#a28d6d', edge: true });
  S.castShadow([-150, 250], [370, 430], 86, 0.14);
  S.cyl([170, 86, 395], 7, 24, '#5f8d93', { n: 12, top: '#7aa7ac' });
  const sp = S.cam.project([60, 87, 395]), ss = (16 * S.cam.pxcm([60, 87, 395])) / 140;
  S.sprite([60, 87, 395], <g transform={`translate(${sp[0]} ${sp[1]}) scale(${ss}) rotate(38)`}><Scissors /></g>);
  S.plane([-60, 284, 429], [0.48, 0, 0], [0, -0.48, 0], <g><rect width={300} height={60} rx={10} fill="#3c5d55" /><text x={150} y={44} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={38} fill="#f4efe0">CẮT TÓC</text></g>);
  // Ghế cắt tóc: chân trụ, đệm, lưng, tay vịn, gác chân
  const cx = 50, cz = 250;
  S.cyl([cx, 0, cz], 30, 4, '#5f6664', { n: 18 });
  S.cyl([cx, 4, cz], 7, 38, '#8a9290', { n: 10 });
  // Phần xoay: đệm, lưng, tay vịn, gác chân cùng quay quanh trụ (pivot tại tâm trụ)
  const sw = { yaw: turn, pivot: [cx, cz] as [number, number] };
  S.box({ x: [cx - 32, cx + 32], y: [42, 58], z: [cz - 30, cz + 30], c: '#3f5a52', top: '#4f6d64', ...sw });
  S.box({ x: [cx - 30, cx + 30], y: [58, 128], z: [cz - 34, cz - 24], c: '#3f5a52', ...sw });
  for (const dx of [-34, 30]) S.box({ x: [cx + dx, cx + dx + 6], y: [58, 74], z: [cz - 26, cz + 26], c: '#5d4e3c', ...sw });
  S.box({ x: [cx - 22, cx + 22], y: [12, 16], z: [cz + 40, cz + 62], c: '#8a9290', ...sw });
  S.contact([cx - 34, cx + 34], [cz - 34, cz + 34], 0.24);
  S.castShadow([cx - 32, cx + 32], [cz - 34, cz + 30], 128, 0.14);
  S.line([40, H, 300], [40, 262, 300], '#4a4a42', 0.8, { cm: true, layer: 2 });
  S.cyl([40, 250, 300], 22, 12, '#d8c18e', { r2: 8, n: 14 });
  S.glow([40, 244, 300], 30, '#ffe8b8', 0.22);
  const out = wrap(id, 'goc-cat-toc', S.render(id, <rect width={1920} height={1080} fill="#d9d5c2" />), '#ffe2b0');
  return scope ? <g>{out}<Scope /></g> : out;
};

// ---------------------------------------------------------------------------------------------
// 8. Hành lang dãy trọ tầng 2 ban đêm (P1.03, P1.06, P2.01, S06): cửa các phòng bên trái, lan can sắt bên phải,
//    đèn tuýp vàng vọt (một bóng chập chờn theo `flicker` 0–1), sương ẩm, cuối dãy là bậc cầu thang chìm vào bóng tối.
//    chinh: từ khung cửa phòng Nam nhìn dọc hành lang.
// ---------------------------------------------------------------------------------------------
export const DORM_VIEWS: Record<SetView, CamSpec> = { chinh: { pos: [60, 160, -70], look: [85, 140, 2300], mm: 22 }, nguoc: { pos: [110, 165, 1880], look: [60, 130, -200], mm: 22 }, cheo: { pos: [165, 168, 420], look: [-20, 110, 1150], mm: 22 }, cao: { pos: [20, 265, -90], look: [120, 10, 1100], mm: 20 } };
const DORM_TUBES = [260, 920, 1580];
const dormLight = (flicker: number): Light => ({ sun: [0.3, -0.8, 0.2], amb: 0.2, diff: 0.05, lamps: DORM_TUBES.map((z, i) => ({ p: [24, 232, z] as V3, col: [1, 0.86, 0.52] as [number, number, number], r: 260, k: i === 1 ? 1.05 * flicker : 1.05 })), fog: { color: '#0b1012', dist: 1300, max: 0.8 } });
export const dormSpot = (heightCm = 168, view: SetView = 'chinh') => makeScene(camera(DORM_VIEWS[view]), dormLight(1)).rigAt([95, 0, 520], heightCm);
export const DormHallNight = ({ children, view = 'chinh', flicker, cam, frame = null, layers = false, scope = false }: { children?: React.ReactNode; view?: SetView; flicker?: number; cam?: CamSpec; frame?: number | null; layers?: boolean; scope?: boolean }) => {
  const fl = flicker ?? (frame === null ? 1 : frame % 197 < 3 ? 0.15 : frame % 113 < 2 ? 0.5 : frame % 331 > 322 ? 0.05 : 1);
  const id = uid(), S = makeScene(camera(cam ?? DORM_VIEWS[view]), dormLight(fl), frame, layers);
  const Z: [number, number] = [-100, 2300], H = 285, XW = 180;
  // Sân và dãy trọ đối diện chìm trong đêm, vài ô cửa còn sáng
  S.quad([[XW, -300, Z[0]], [900, -300, Z[0]], [900, -300, Z[1]], [XW, -300, Z[1]]], '#1d2526', { n: [0, 1, 0], layer: 0, edge: false, raw: true });
  S.box({ x: [720, 760], y: [-300, 420], z: [-300, 2500], c: '#262e33', side: '#262e33' });
  for (let f = 0; f < 3; f++) for (let k = 0; k < 9; k++) {
    if ((f * 5 + k * 3) % 4 === 1) continue;
    const z = -150 + k * 280, y = -230 + f * 230, lit = (f + k) % 3 === 0;
    S.quad([[719.4, y, z + 140], [719.4, y, z + 40], [719.4, y + 110, z + 40], [719.4, y + 110, z + 140]], lit ? '#ffd98a' : '#2f3a40', { n: [-1, 0, 0], emit: lit, edge: false });
  }
  // Sàn gạch men bạc màu, trần, tường trái
  S.quad([[0, 0, Z[0]], [XW + 10, 0, Z[0]], [XW + 10, 0, Z[1]], [0, 0, Z[1]]], '#b0ab98', { n: [0, 1, 0], layer: 0, edge: false });
  tiles(S, [0, XW], Z, 40, '#8d897a', 0.5);
  S.quad([[0, H, Z[1]], [XW + 20, H, Z[1]], [XW + 20, H, Z[0]], [0, H, Z[0]]], '#d3ccb8', { n: [0, -1, 0], layer: 0, edge: false });
  S.box({ x: [XW, XW + 20], y: [H - 20, H], z: Z, c: '#c8c1ac' });
  S.quad([[0, 0, Z[1]], [0, 0, Z[0]], [0, 100, Z[0]], [0, 100, Z[1]]], '#94a291', { n: [1, 0, 0], layer: 0, edge: false });
  S.quad([[0, 100, Z[1]], [0, 100, Z[0]], [0, H, Z[0]], [0, H, Z[1]]], '#d6cfb7', { n: [1, 0, 0], layer: 0, edge: false });
  S.quad([[0, 0, Z[1]], [XW + 20, 0, Z[1]], [XW + 20, H, Z[1]], [0, H, Z[1]]], '#cfc8b1', { n: [0, 0, -1], layer: 0, edge: false });
  S.line([0, 0, Z[0]], [0, 0, Z[1]], '#2a312d', 12, { op: 0.2, layer: 0.6, cm: true });
  // Cửa các phòng: khung, cánh gỗ sơn xanh, số phòng, ô cửa sổ song sắt (có phòng còn sáng)
  [40, 400, 760, 1120, 1480].forEach((z, i) => {
    S.box({ x: [0, 4], y: [0, 211], z: [z - 6, z + 96], c: '#e2dccb' });
    S.box({ x: [4, 7], y: [0, 205], z: [z, z + 90], c: i === 0 ? '#6c8b7d' : '#5f7f72' });
    S.box({ x: [7, 11], y: [96, 100], z: [z + 76, z + 84], c: '#c9b47c' });
    if (S.cam.depth([4.5, 180, z + 45]) > 160) S.plane([4.5, 192, z + 30], [0, 0, 0.12], [0, -0.12, 0], <g><rect width={240} height={90} rx={10} fill="#e9e2cf" /><text x={120} y={66} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={60} fill="#3f4a46">{`20${i + 1}`}</text></g>, 2, 2);
    const lit = i === 2 || i === 4;
    S.quad([[0.6, 120, z + 230], [0.6, 120, z + 140], [0.6, 195, z + 140], [0.6, 195, z + 230]], lit ? '#d8b56c' : '#28312f', { n: [1, 0, 0], emit: lit, edge: false });
    for (let k = 1; k < 6; k++) S.line([1.4, 120, z + 140 + k * 15], [1.4, 195, z + 140 + k * 15], '#59615e', 1.2, { cm: true, layer: 1.6 });
    if (i === 3) { S.cyl([22, 0, z + 120], 9, 14, '#a65d4a', { r2: 11, n: 10 }); S.sphere([22, 26, z + 120], 12, '#4f6e4f', { sy: 0.9, n: 8, bands: 4 }); }
    S.box({ x: [6, 46], y: [0, 1.5], z: [z + 10, z + 80], c: '#6b7468' });
  });
  // Lan can: tường lửng + song sắt + tay vịn
  S.box({ x: [XW - 12, XW + 4], y: [0, 62], z: Z, c: '#bdb8a4', top: '#c9c4b0' });
  for (let z = Z[0]; z <= 2000; z += 14) S.line([XW - 4, 62, z], [XW - 4, 104, z], '#3a4240', 0.9, { cm: true, layer: 1.7 });
  S.box({ x: [XW - 9, XW + 1], y: [102, 107], z: Z, c: '#4a5250' });
  // Đèn tuýp trên tường trái; bóng thứ hai chập chờn
  DORM_TUBES.forEach((z, i) => {
    const on = i === 1 ? fl : 1;
    S.box({ x: [2, 8], y: [229, 235], z: [z - 60, z + 60], c: on > 0.3 ? '#fbe9b0' : '#7d7766', emit: true, edge: false });
    S.box({ x: [0, 4], y: [227, 237], z: [z - 64, z + 64], c: '#cfc8b4' });
    if (on > 0.05) S.glow([20, 226, z], 46 * on, '#ffdb8a', 0.32 * on);
    if (on > 0.05) S.glow([60, 6, z + 40], 110, '#ffd27a', 0.1 * on);
  });
  // Cuối dãy: bậc cầu thang lên tầng, tay vịn
  for (let i = 0; i < 10; i++) S.box({ x: [30, XW - 14], y: [0, (i + 1) * 17], z: [1980 + i * 27, 1980 + (i + 1) * 27], c: '#aaa48f', top: '#c2bca6', front: '#9d977f' });
  S.line([XW - 18, 95, 1980], [XW - 18, 95 + 170, 2250], '#3a4240', 2.6, { cm: true, layer: 2.4 });
  // Dây điện, công tơ, sương ẩm
  S.line([2, 262, Z[0]], [2, 262, 1900], '#2e3432', 0.8, { cm: true, layer: 1.6 });
  S.box({ x: [0, 6], y: [150, 185], z: [205, 228], c: '#d7d3c4' });
  const mist = <g style={{ mixBlendMode: 'screen' }}><defs><linearGradient id={`${id}-mist`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fa3a6" stopOpacity="0" /><stop offset=".5" stopColor="#8fa3a6" stopOpacity=".14" /><stop offset="1" stopColor="#8fa3a6" stopOpacity="0" /></linearGradient></defs><rect y={260} width={1920} height={520} fill={`url(#${id}-mist)`} /></g>;
  S.sprite([95, 0, 520], S.litActors(id, [95, 0, 520], <g data-layer="actors">{children}</g>));
  const out = wrap(id, 'hanh-lang-tro-dem', <>{S.render(id, sky('#070b0d', '#1a2326', id))}{mist}</>, '#ffcf7a', 0.55);
  return scope ? <g>{out}<Scope /></g> : out;
};

// ---------------------------------------------------------------------------------------------
// S03. Phòng trọ chiều tà (P1.07): lớp ánh sáng tách riêng đặt lên RoomScene góc toàn phòng.
//      `t` 0 → 1: vệt nắng cam trườn từ mép bàn qua nệm, leo lên tường đối diện rồi tắt; phòng tối và xanh dần.
//      Camera trùng VIEWS.wide của phòng gốc (phòng gốc dùng trục x ngược với kit3d nên lật x khi chiếu).
// ---------------------------------------------------------------------------------------------
/** Mặt nhận nắng trong phòng gốc (toạ độ phòng gốc, cm; mặt bàn theo chiều cao đã hạ trên hình). */
const SUN_SURF = [
  { y: 62, x: [342, 449], z: [8, 62] },
  { y: 24, x: [252, 452], z: [215, 375] },
  { y: 0, x: [0, 460], z: [0, 780] },
] as const;
export const SunsetLight = ({ t = 0 }: { t?: number }) => {
  const cam = camera({ pos: [-228, 152, 800], look: [-228, 152, 0], mm: 34, cy: 395 });
  const P = (p: V3) => cam.project([-p[0], p[1], p[2]]);
  const e = ((58 - 55 * t) * Math.PI) / 180, swing = -1.3 + 1.8 * Math.min(1, t * 1.4);
  const d = norm3([-Math.cos(e), -Math.sin(e), swing * Math.cos(e)]);
  // Bắn tia qua lưới ô trên khung cửa sổ, mỗi ô rơi lên mặt gặp trước tiên (bàn, nệm, sàn, tường đối diện).
  const hit = (p: V3): { s: number; plane: 'y' | 'x'; v: number } | null => {
    let best: { s: number; plane: 'y' | 'x'; v: number } | null = null;
    for (const f of SUN_SURF) {
      const s = (p[1] - f.y) / -d[1], x = p[0] + d[0] * s, z = p[2] + d[2] * s;
      if (s > 0 && x >= f.x[0] && x <= f.x[1] && z >= f.z[0] && z <= f.z[1] && (!best || s < best.s)) best = { s, plane: 'y', v: f.y };
    }
    const s = p[0] / -d[0], y = p[1] + d[1] * s;
    if (y >= 0 && y <= 265 && (!best || s < best.s)) best = { s, plane: 'x', v: 0 };
    return best;
  };
  const onPlane = (p: V3, h: { plane: 'y' | 'x'; v: number }): V3 => { const s = h.plane === 'y' ? (p[1] - h.v) / -d[1] : (p[0] - h.v) / -d[0]; return [p[0] + d[0] * s, p[1] + d[1] * s, p[2] + d[2] * s]; };
  const NZ = 22, NY = 16, Z0 = 90, Z1 = 220, Y0 = 95, Y1 = 205, cz = (Z1 - Z0) / NZ, cy = (Y1 - Y0) / NY;
  const cells: string[] = [];
  for (let i = 0; i < NZ; i++) for (let k = 0; k < NY; k++) {
    const c: V3 = [460, Y0 + (k + 0.5) * cy, Z0 + (i + 0.5) * cz], h = hit(c);
    if (!h) continue;
    const q = [[-0.55, -0.55], [0.55, -0.55], [0.55, 0.55], [-0.55, 0.55]].map(([a, b]) => P(onPlane([460, c[1] + b * cy, c[2] + a * cz], h)));
    cells.push(`M${q.map((v) => `${v[0].toFixed(1)} ${v[1].toFixed(1)}`).join('L')}Z`);
  }
  const win = [[460, 95, 90], [460, 95, 220], [460, 205, 220], [460, 205, 90]].map((v) => P(v as V3));
  const fade = 1 - Math.min(1, Math.max(0, (t - 0.72) / 0.28));
  return (
    <g data-layer="LIGHT_LAYER" pointerEvents="none">
      <rect width={1920} height={1080} fill="#ff9a45" opacity={0.14 + 0.1 * fade} style={{ mixBlendMode: 'multiply' }} />
      <rect width={1920} height={1080} fill="#2c2a48" opacity={0.18 + 0.5 * t} style={{ mixBlendMode: 'multiply' }} />
      <g opacity={fade}>
        <path d={`M${win.map((v) => `${v[0].toFixed(1)} ${v[1].toFixed(1)}`).join('L')}Z`} fill="#ffb760" opacity={0.45} />
        <path d={cells.join('')} fill="#f5852e" opacity={0.38} />
        <path d={cells.join('')} fill="#ffc27a" opacity={0.28} style={{ mixBlendMode: 'screen' }} />
      </g>
    </g>
  );
};
const norm3 = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
/** Phòng trọ chiều tà hoàn chỉnh: phòng gốc góc toàn (nắng đã rút) + lớp ánh sáng cam. Người đặt qua `actors` của RoomScene. */
export const RoomSunset = ({ t = 0.35, ...p }: RoomProps & { t?: number }) => <g data-scene="phong-tro-chieu-ta"><RoomScene door="ajar" chair="bed" kitchen="clean" {...p} view="wide" sun={1} /><SunsetLight t={t} /></g>;
