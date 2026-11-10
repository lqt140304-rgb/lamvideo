import React from 'react';
import { uid } from './common';
import { Blackboard, BunCha, RiceBox, XoiGac, Football, Scissors, Mirror } from './dao-cu';
import { SupportingActor, FormalTwin } from './nhan-vat-va-tu-the';
import { RoomScene } from '../boi-canh/boi-canh';
import { TWIN_POSES } from '../nhan-vat';
import { camera, CamSpec, Finish, Light, makeScene, V3 } from './kit3d';

/**
 * Bối cảnh bổ sung Hồ sơ 02 — đại tu 11/11/2026: dựng bằng mô hình 3D theo cm (kit3d), camera phối cảnh thật,
 * sáng–tối theo hướng nắng, bóng đổ và vệt nắng tính bằng tia, mờ theo khoảng cách. Kích thước đồ đạc theo đồ thật.
 * Đạo cụ và vai phụ dùng nguyên component cũ, chỉ đặt lại theo phối cảnh. Toàn bộ là bản đề xuất chờ duyệt.
 */

const K = {
  wall: '#e8dec6', wallCool: '#dfe2d3', lower: '#bfcab6', floor: '#cfc5ad', tile: '#b3aa93', ceil: '#efe9da',
  wood: '#c39a68', woodDark: '#86684a', metal: '#a9b2ae', steel: '#7f8b88', dark: '#3c4542', board: '#3d5d52',
  white: '#f3f1e8', sky: '#bcdcdc', leaf: '#6f9a6e', leafDark: '#557e5b',
};

/** Vỏ phòng hình hộp: sàn, trần, tường nhìn từ trong. Tường phía camera (z0) bỏ qua. */
const shellRoom = (S: ReturnType<typeof makeScene>, x: [number, number], z: [number, number], h: number, c: { wall?: string; left?: string; right?: string; front?: string; floor?: string; ceil?: string; lower?: string; lowerH?: number } = {}) => {
  const [x0, x1] = x, [z0, z1] = z;
  S.quad([[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]], c.floor ?? K.floor, { n: [0, 1, 0], layer: 0, edge: false });
  S.quad([[x0, h, z1], [x1, h, z1], [x1, h, z0], [x0, h, z0]], c.ceil ?? K.ceil, { n: [0, -1, 0], layer: 0, edge: false });
  const lh = c.lowerH ?? 0;
  const wallPair = (pts: (y0: number, y1: number) => V3[], n: V3, col: string) => {
    if (lh > 0) { S.quad(pts(0, lh), c.lower ?? K.lower, { n, layer: 0, edge: false }); S.quad(pts(lh, h), col, { n, layer: 0, edge: false }); }
    else S.quad(pts(0, h), col, { n, layer: 0, edge: false });
  };
  wallPair((a, b) => [[x0, a, z0], [x0, a, z1], [x0, b, z1], [x0, b, z0]], [1, 0, 0], c.left ?? c.wall ?? K.wall);
  wallPair((a, b) => [[x1, a, z1], [x1, a, z0], [x1, b, z0], [x1, b, z1]], [-1, 0, 0], c.right ?? c.wall ?? K.wall);
  wallPair((a, b) => [[x0, a, z1], [x1, a, z1], [x1, b, z1], [x0, b, z1]], [0, 0, -1], c.front ?? c.wall ?? K.wall);
  // tối tiếp xúc ở chân tường và góc trần
  for (const [a, b] of [[[x0, 0, z0], [x0, 0, z1]], [[x1, 0, z0], [x1, 0, z1]], [[x0, 0, z1], [x1, 0, z1]]] as [V3, V3][]) S.line(a, b, '#2a312d', 14, { op: 0.16, layer: 0.6, cm: true });
  for (const [a, b] of [[[x0, h, z0], [x0, h, z1]], [[x1, h, z0], [x1, h, z1]], [[x0, h, z1], [x1, h, z1]]] as [V3, V3][]) S.line(a, b, '#2a312d', 10, { op: 0.1, layer: 0.6, cm: true });
};
const tiles = (S: ReturnType<typeof makeScene>, x: [number, number], z: [number, number], step: number, col = K.tile, op = 0.55, y = 0.2) => {
  for (let xx = x[0]; xx <= x[1]; xx += step) S.line([xx, y, z[0]], [xx, y, z[1]], col, 1.2, { op });
  for (let zz = z[0]; zz <= z[1]; zz += step) S.line([x[0], y, zz], [x[1], y, zz], col, 1.2, { op });
};
/** Đèn tuýp trần: hộp sáng và quầng sáng. */
const tubeLight = (S: ReturnType<typeof makeScene>, x: number, z: number, h: number, len = 120) => {
  S.box({ x: [x - len / 2, x + len / 2], y: [h - 8, h - 2], z: [z - 6, z + 6], c: '#fbf6e4', emit: true, edge: false });
  S.glow([x, h - 14, z], 22, '#fff6d6', 0.16);
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

/** Lưng sinh viên ngồi (hình 2D cũ), đặt theo chiều sâu. */
const BackStudent = ({ x, y, s, shirt, hair = '#41483e' }: { x: number; y: number; s: number; shirt: string; hair?: string }) => <g transform={`translate(${x} ${y}) scale(${s})`} data-layer="background-student"><path d="M-67 140Q-72 48-31 30H29Q74 54 68 140Z" fill={shirt} /><ellipse cy={7} rx={35} ry={42} fill={hair} /><path d="M-34 4Q0 36 34 3V37Q0 58-32 32Z" fill={hair} /></g>;

// ---------------------------------------------------------------------------------------------
// 1. Giảng đường (P3.01): nhìn từ cuối phòng lên bục giảng; cửa sổ trái có nắng xiên.
// ---------------------------------------------------------------------------------------------
const LECTURE_CAM: CamSpec = { pos: [140, 168, 140], look: [-40, 125, 1500], mm: 24 };
const LECTURE_LIGHT: Light = { sun: [0.78, -0.52, 0.2], amb: 0.66, diff: 0.42, fog: { color: '#e9e3d0', dist: 2600, max: 0.35 } };
/** Chỗ đứng trên bục giảng, trước bảng (dùng cho người đứng thuyết trình). */
export const lectureSpot = (heightCm = 168) => makeScene(camera(LECTURE_CAM), LECTURE_LIGHT).rigAt([-70, 22, 1360], heightCm);
export const LectureHall = ({ children, failed = false, students = true }: { children?: React.ReactNode; failed?: boolean; students?: boolean }) => {
  const id = uid(), S = makeScene(camera(LECTURE_CAM), LECTURE_LIGHT);
  const X: [number, number] = [-520, 520], Z: [number, number] = [-200, 1500], H = 340;
  shellRoom(S, X, Z, H, { lowerH: 110, lower: '#c6cfbd', wall: '#e6e0cc', front: '#e9e3cf' });
  tiles(S, X, [Z[0], 1250], 60);
  [[200, 520], [640, 960], [1080, 1400]].forEach(([a, b]) => sideWindow(S, X[0], [a, b], [115, 295], 1));
  // Bục giảng nâng 22 cm, bảng, bàn giảng viên, đồng hồ, biển phòng, cửa phải
  S.box({ x: [-520, 520], y: [0, 22], z: [1250, 1500], c: '#c9bfa6', top: '#d8cfb6' });
  S.castShadow([-520, 520], [1250, 1500], 22, 0.12);
  S.box({ x: [-250, 130], y: [100, 245], z: [1494, 1500], c: '#6f7f74' });
  S.plane([-240, 238, 1493], [380 / 480 - 0.02, 0, 0], [0, -130 / 240, 0], <Blackboard failed={failed} />, 2, 80);
  S.box({ x: [-230, 110], y: [96, 100], z: [1480, 1500], c: '#b5ad98' });
  S.box({ x: [190, 340], y: [22, 100], z: [1300, 1370], c: K.wood, top: '#d3b282', front: '#a8875f' });
  S.castShadow([190, 340], [1300, 1370], 100, 0.2, 22);
  S.cyl([380, 268, 1497], 26, 3, '#f4f2ea', { top: '#f4f2ea', n: 20 });
  S.line([380, 268, 1494], [380, 284, 1494], '#3e4643', 3);
  S.line([380, 268, 1494], [392, 262, 1494], '#3e4643', 3);
  S.box({ x: [440, 515], y: [0, 215], z: [1500 - 2, 1500], c: '#8fa497' });
  S.plane([206, 300, 1497], [0.4, 0, 0], [0, -0.4, 0], <g><rect width={240} height={70} rx={8} fill="#3f6a63" /><text x={120} y={47} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={36} fill="#f4efe0">PHÒNG 402</text></g>);
  for (let z = 150; z <= 1350; z += 300) for (const x of [-260, 260]) tubeLight(S, x, z, H);
  // Dãy bàn ghế dài: mặt bàn 75 cm, ghế băng 45 cm, sinh viên ngồi phía sau bàn
  const shirts = ['#83968d', '#ad9e87', '#8497a0', '#a58d7e', '#9aa58a', '#8d8aa0'];
  [260, 470, 680, 890, 1100].forEach((z, r) => [[-470, -70], [70, 470]].forEach(([a, b], side) => {
    S.box({ x: [a, b], y: [72, 76], z: [z, z + 50], c: K.wood, top: '#d8b98b' });
    S.box({ x: [a + 4, b - 4], y: [20, 72], z: [z + 44, z + 48], c: '#a8875f' });
    for (const lx of [a + 8, b - 12]) S.box({ x: [lx, lx + 4], y: [0, 72], z: [z + 4, z + 46], c: K.steel });
    S.box({ x: [a, b], y: [42, 46], z: [z - 52, z - 18], c: '#9c8261', top: '#b59a74' });
    for (const lx of [a + 10, b - 14]) S.box({ x: [lx, lx + 4], y: [0, 42], z: [z - 48, z - 22], c: K.steel });
    S.castShadow([a, b], [z, z + 50], 76, 0.16);
    S.contact([a, b], [z - 52, z + 50], 0.14);
    if (students) for (let i = 0; i < 4; i++) {
      if ((r + side + i) % 3 === 2) continue;
      const sx = a + 50 + i * ((b - a - 100) / 3), at: V3 = [sx, 0, z - 35];
      const top = S.cam.project([sx, 128, z - 35]), pc = S.cam.pxcm(at), s = (130 * pc) / 258;
      S.sprite([sx, 60, z - 36], <BackStudent x={top[0]} y={top[1] + 35 * s} s={s} shirt={shirts[(r * 3 + i + side) % shirts.length]} />);
    }
  }));
  const t = S.rigAt([265, 22, 1420], 165);
  S.sprite([265, 22, 1420], <SupportingActor role="giang-vien" x={t.x} y={t.y} scale={t.scale} smile={!failed} />);
  S.sprite([-70, 22, 1360], <g data-layer="actors">{children}</g>);
  return wrap(id, 'giang-duong', S.render(id, <rect width={1920} height={1080} fill="#e2dccb" />), '#ffe2a8');
};

// ---------------------------------------------------------------------------------------------
// 2. Lab 402 (P2.04, P2.05): dãy máy tính, màn hình hướng về camera, rèm lá bên phải.
// ---------------------------------------------------------------------------------------------
const LAB_CAM: CamSpec = { pos: [-330, 175, -40], look: [60, 95, 1150], mm: 22 };
const LAB_LIGHT: Light = { sun: [-0.72, -0.55, 0.25], amb: 0.64, diff: 0.42, lamps: [], fog: { color: '#dfe6dc', dist: 2400, max: 0.3 } };
export const labSpot = (heightCm = 168) => makeScene(camera(LAB_CAM), LAB_LIGHT).rigAt([-40, 0, 1120], heightCm);
const monitor = (S: ReturnType<typeof makeScene>, x: number, y: number, z: number, i: number) => {
  S.box({ x: [x - 4, x + 4], y: [y, y + 14], z: [z + 6, z + 10], c: '#40494a' });
  S.box({ x: [x - 12, x + 12], y: [y, y + 1.5], z: [z + 2, z + 16], c: '#40494a' });
  S.box({ x: [x - 27, x + 27], y: [y + 12, y + 46], z: [z, z + 4], c: '#2f3738', front: '#2f3738' });
  S.quad([[x - 25, y + 14, z - 0.4], [x + 25, y + 14, z - 0.4], [x + 25, y + 44, z - 0.4], [x - 25, y + 44, z - 0.4]], i % 3 ? '#cfe1e3' : '#bcd6cc', { n: [0, 0, -1], emit: true, edge: false });
  for (let k = 0; k < 3; k++) S.quad([[x - 20, y + 38 - k * 8, z - 0.6], [x + 6 - k * 4, y + 38 - k * 8, z - 0.6], [x + 6 - k * 4, y + 35 - k * 8, z - 0.6], [x - 20, y + 35 - k * 8, z - 0.6]], '#8ea9a2', { n: [0, 0, -1], emit: true, edge: false });
  S.glow([x, y + 29, z - 4], 26, '#d9f1ee', 0.14);
  S.box({ x: [x - 21, x + 21], y: [y, y + 2], z: [z - 30, z - 16], c: '#5c6766', top: '#7c8786' });
};
export const ComputerLab = ({ children }: { children?: React.ReactNode }) => {
  const id = uid(), S = makeScene(camera(LAB_CAM), LAB_LIGHT);
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
  for (let z = 150; z <= 1150; z += 330) for (const x of [-250, 250]) tubeLight(S, x, z, H);
  // Ba dãy bàn máy, mỗi dãy hai cụm, ghế phía camera
  [330, 620, 910].forEach((z) => [[-430, -50], [50, 430]].forEach(([a, b], side) => {
    S.box({ x: [a, b], y: [72, 76], z: [z, z + 70], c: '#d4d6c9', top: '#e2e3d8' });
    S.box({ x: [a + 3, b - 3], y: [10, 72], z: [z + 64, z + 68], c: '#9fac9f' });
    for (const lx of [a + 6, b - 10]) S.box({ x: [lx, lx + 4], y: [0, 72], z: [z + 4, z + 66], c: K.steel });
    S.castShadow([a, b], [z, z + 70], 76, 0.15);
    for (let i = 0; i < 4; i++) {
      const mx = a + 48 + i * ((b - a - 96) / 3);
      monitor(S, mx, 76, z + 42, i + side);
      S.box({ x: [mx - 20, mx + 20], y: [44, 49], z: [z - 50, z - 12], c: '#5d6f6a', top: '#6f837d' });
      S.box({ x: [mx - 19, mx + 19], y: [49, 92], z: [z - 54, z - 49], c: '#5d6f6a' });
      S.cyl([mx, 0, z - 31], 3, 44, K.steel, { n: 8 });
      S.contact([mx - 22, mx + 22], [z - 54, z - 10], 0.12);
    }
  }));
  S.sprite([-40, 0, 1120], <g data-layer="actors">{children}</g>);
  return wrap(id, 'lab-402', S.render(id, <rect width={1920} height={1080} fill="#dde3d8" />));
};

// ---------------------------------------------------------------------------------------------
// 3. Hành lang đại học (P3.02): một bên dãy cửa lớp, một bên lan can mở ra sân; bóng cột trên sàn.
// ---------------------------------------------------------------------------------------------
const CORR_CAM: CamSpec = { pos: [40, 165, -60], look: [-20, 135, 3000], mm: 22 };
const CORR_LIGHT: Light = { sun: [-0.62, -0.62, 0.32], amb: 0.66, diff: 0.42, fog: { color: '#e4ead9', dist: 2600, max: 0.45 } };
export const corridorSpot = (heightCm = 168) => makeScene(camera(CORR_CAM), CORR_LIGHT).rigAt([10, 0, 620], heightCm);
export const UniversityCorridor = ({ children }: { children?: React.ReactNode }) => {
  const id = uid(), S = makeScene(camera(CORR_CAM), CORR_LIGHT);
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
  S.sprite([10, 0, 620], <g data-layer="actors">{children}</g>);
  return wrap(id, 'hanh-lang-dai-hoc', S.render(id, sky('#b9d8d6', '#e7efe0', id)));
};

// ---------------------------------------------------------------------------------------------
// 4. Bữa giỗ gia đình (P2.06, clip Zalo): phòng khách nhà quê, bàn tròn, bàn thờ và lịch tường.
// ---------------------------------------------------------------------------------------------
const FAM_CAM: CamSpec = { pos: [30, 145, 40], look: [0, 100, 900], mm: 27 };
const FAM_LIGHT: Light = { sun: [-0.55, -0.6, 0.55], amb: 0.6, diff: 0.42, lamps: [{ p: [0, 250, 430], col: [1, 0.85, 0.6], r: 260, k: 0.32 }] };
export const FamilyGathering = ({ children, cast = true }: { children?: React.ReactNode; cast?: boolean }) => {
  const id = uid(), S = makeScene(camera(FAM_CAM), FAM_LIGHT);
  const X: [number, number] = [-520, 520], Z: [number, number] = [-300, 900], H = 330;
  shellRoom(S, X, Z, H, { wall: '#e2d2b2', lower: '#c9b28c', lowerH: 95, floor: '#b88a68', ceil: '#e8dcc2' });
  tiles(S, X, Z, 50, '#9e7356', 0.55);
  // Bàn thờ, ảnh, lịch, cửa sổ phải
  S.box({ x: [-200, 110], y: [0, 92], z: [830, 895], c: '#7a4f36', top: '#8c5d40', front: '#6e4630' });
  S.box({ x: [-160, 70], y: [92, 98], z: [835, 890], c: '#a3412f', top: '#b44d38' });
  S.cyl([-45, 98, 862], 10, 9, '#c9a65c', { n: 12 });
  for (const dx of [-6, 0, 6]) S.line([-45 + dx, 107, 862], [-45 + dx * 1.4, 128, 862], '#6b4b35', 0.7, { cm: true, layer: 2.4 });
  S.box({ x: [-110, 20], y: [140, 230], z: [893, 897], c: '#6e5238' });
  S.quad([[-102, 148, 892.6], [12, 148, 892.6], [12, 222, 892.6], [-102, 222, 892.6]], '#c9c2a8', { n: [0, 0, -1], edge: false });
  S.plane([-300, 245, 897], [0.5, 0, 0], [0, -0.5, 0], <g><rect width={130} height={180} rx={6} fill="#f1e7d0" /><rect width={130} height={40} rx={6} fill="#b34a3a" /><text x={65} y={30} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={24} fill="#fff4e4">LỊCH</text><text x={65} y={140} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={84} fill="#4f3a2d">11</text></g>);
  sideWindow(S, X[1], [380, 700], [110, 280], -1, '#c7dcbc');
  // Đèn trần chụp và dây
  S.line([0, H, 430], [0, 262, 430], '#5a4a3a', 1, { cm: true, layer: 2 });
  S.cyl([0, 248, 430], 34, 16, '#c79d63', { r2: 10, n: 16 });
  S.glow([0, 238, 430], 45, '#ffe3a6', 0.22);
  // Bàn tròn, ghế đẩu
  const T: V3 = [0, 0, 430];
  S.cyl([T[0], 70, T[2]], 120, 6, '#b8946a', { top: '#cdaa7c', n: 36 });
  for (const [dx, dz] of [[-60, -50], [60, -50], [-60, 50], [60, 50]]) S.box({ x: [dx - 3, dx + 3], y: [0, 70], z: [T[2] + dz - 3, T[2] + dz + 3], c: '#7f6044' });
  S.castShadow([-110, 110], [330, 530], 76, 0.16);
  S.contact([-100, 100], [340, 520], 0.16);
  for (const a of [0.5, 2.0, 3.1, 4.3, 5.5]) { const sx = Math.cos(a) * 165, sz = 430 + Math.sin(a) * 150; S.cyl([sx, 0, sz], 16, 42, '#8f6b4c', { top: '#a67f5b', n: 12 }); }
  // Món ăn (đạo cụ cũ) đặt lên mặt bàn theo phối cảnh
  const onTable = (x: number, z: number, wCm: number, wUnits: number, node: React.ReactNode, dy = 0) => {
    const p = S.cam.project([x, 76, z]), s = (wCm * S.cam.pxcm([x, 76, z])) / wUnits;
    S.sprite([x, 76, z], <g transform={`translate(${p[0]} ${p[1] - dy * s}) scale(${s})`}>{node}</g>, 2);
  };
  if (cast) {
    const seats: [number, number, React.ReactNode][] = [[-140, 560, null], [-50, 590, null], [50, 590, null], [140, 560, null]];
    seats.forEach(([x, z], i) => {
      const p = S.rigAt([x, 0, z], 168), node = i === 0 ? <SupportingActor role="me" pose={TWIN_POSES.sit} {...p} /> : i === 1 ? <SupportingActor role="ba" pose={TWIN_POSES.sit} {...p} /> : i === 2 ? <FormalTwin pose={TWIN_POSES.sit} mood="neutral_smile" {...p} /> : <SupportingActor role="bac-hai" pose={TWIN_POSES.sit} {...p} />;
      S.sprite([x, 0, z], node);
    });
  }
  onTable(-55, 420, 30, 320, <RiceBox />);
  onTable(45, 445, 34, 300, <BunCha />);
  onTable(70, 380, 28, 280, <XoiGac />);
  for (const [x, z] of [[-90, 380], [100, 470], [-20, 340]]) S.cyl([x, 76, z], 7, 5, '#eee4ce', { r2: 9, n: 12 });
  S.sprite([0, 0, 470], <g data-layer="actors">{children}</g>);
  return wrap(id, 'an-gio-gia-dinh', S.render(id, <rect width={1920} height={1080} fill="#d8c7aa" />), '#ffcf8a', 0.38);
};

/** Thế giới gương: dùng lại đúng phòng trọ gốc, phủ một lớp màu riêng có thể chỉnh. */
export const MirrorRealm = ({ children }: { children?: React.ReactNode }) => <g data-scene="the-gioi-guong"><RoomScene view="wide" night door="ajar" phone="hidden" wallet={false} kitchen="clean" /><rect width={1920} height={1080} fill="#173f46" opacity={0.65} pointerEvents="none" />{children}<path d="M0 1030Q550 992 967 1026T1920 1022V1080H0Z" fill="#18383c" opacity={0.36} /></g>;

// ---------------------------------------------------------------------------------------------
// 5. Góc đồ cho tặng (P1.00): kệ cũ cạnh tường hành lang, gương dựng, giấy "Ai cần cứ lấy".
//    Dùng trong bảng đạo cụ: gốc (0,0) là tâm sàn của khung 720×560.
// ---------------------------------------------------------------------------------------------
export const GiftCorner = () => {
  const id = uid(), S = makeScene(camera({ pos: [-40, 140, -150], look: [-20, 75, 140], mm: 25, W: 720, cx: 4, cy: -223 }), { sun: [0.5, -0.6, 0.5], amb: 0.66, diff: 0.4 });
  S.quad([[-260, 0, -100], [260, 0, -100], [260, 0, 160], [-260, 0, 160]], '#cbc0a8', { n: [0, 1, 0], layer: 0, edge: false });
  S.quad([[-260, 0, 160], [260, 0, 160], [260, 90, 160], [-260, 90, 160]], '#b8c5b2', { n: [0, 0, -1], layer: 0, edge: false });
  S.quad([[-260, 90, 160], [260, 90, 160], [260, 300, 160], [-260, 300, 160]], '#e8ddc4', { n: [0, 0, -1], layer: 0, edge: false });
  S.line([-260, 0, 160], [260, 0, 160], '#2a312d', 12, { op: 0.16, layer: 0.6, cm: true });
  S.box({ x: [-200, -40], y: [0, 4], z: [100, 150], c: '#7a5d43' });
  for (const y of [40, 80]) S.box({ x: [-200, -40], y: [y, y + 3], z: [100, 150], c: '#b18c62', top: '#c6a274' });
  for (const x of [-200, -44]) S.box({ x: [x, x + 4], y: [0, 83], z: [100, 150], c: '#6b513b' });
  S.box({ x: [-185, -120], y: [4, 36], z: [108, 145], c: '#c49a70', top: '#d1ab82' });
  S.box({ x: [-110, -60], y: [83, 103], z: [110, 145], c: '#a9bcae' });
  S.castShadow([-200, -40], [100, 150], 83, 0.18);
  S.plane([-150, 180, 159], [0.42, 0, 0], [0, -0.42, 0], <g transform="rotate(-4)"><rect width={180} height={110} fill="#f6efda" /><text x={18} y={48} fontFamily="Arial, sans-serif" fontSize={34} fill="#4f5b8a">AI CẦN</text><text x={18} y={92} fontFamily="Arial, sans-serif" fontSize={34} fill="#4f5b8a">CỨ LẤY</text></g>);
  // Gương 2D cũ có gốc ở giữa đáy, cao 640 đơn vị → cao 124 cm, dựa tường cạnh kệ
  const g = S.cam.project([60, 0, 135]), gs = (124 * S.cam.pxcm([60, 0, 135])) / 640;
  S.contact([30, 92], [125, 145], 0.22);
  S.sprite([60, 0, 135], <g transform={`translate(${g[0]} ${g[1]}) scale(${gs})`}><Mirror /></g>);
  return <g data-scene="goc-do-tang">{S.render(id, null)}</g>;
};

// ---------------------------------------------------------------------------------------------
// 6. Sân bóng mini (P2.05): cỏ nhân tạo sọc, khung thành có lưới, rào lưới, cột đèn, nhà và cây phía xa.
// ---------------------------------------------------------------------------------------------
const PITCH_CAM: CamSpec = { pos: [180, 260, -260], look: [0, 40, 2400], mm: 26 };
const PITCH_LIGHT: Light = { sun: [0.45, -0.55, -0.7], amb: 0.66, diff: 0.4, fog: { color: '#dfe8dc', dist: 5200, max: 0.5 } };
export const pitchSpot = (heightCm = 168) => makeScene(camera(PITCH_CAM), PITCH_LIGHT).rigAt([-120, 0, 900], heightCm);
export const MiniPitch = ({ children }: { children?: React.ReactNode }) => {
  const id = uid(), S = makeScene(camera(PITCH_CAM), PITCH_LIGHT);
  const XW = 1000, Z0 = 200, Z1 = 4200;
  S.quad([[-6000, 0, -500], [6000, 0, -500], [6000, 0, 9000], [-6000, 0, 9000]], '#b8b39c', { n: [0, 1, 0], layer: 0, edge: false });
  [-3800, -2300, -600, 1200, 2900].forEach((x, i) => { S.box({ x: [x, x + 1300], y: [0, 900 + (i % 2) * 450], z: [7000, 7800], c: ['#d9c7a6', '#c7b79a', '#e0d3b5', '#b9b49a', '#d4bea0'][i], layer: 0.2 }); for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) S.quad([[x + 120 + q * 290, 160 + r * 200, 6998], [x + 260 + q * 290, 160 + r * 200, 6998], [x + 260 + q * 290, 260 + r * 200, 6998], [x + 120 + q * 290, 260 + r * 200, 6998]], '#8fa6a3', { n: [0, 0, -1], layer: 0.25, edge: false }); });
  for (const x of [-3200, -1600, 400, 2200, 3600]) { S.cyl([x, 0, 6100], 26, 380, '#7b6247', { n: 8, layer: 0.3 }); for (const [dx, dy, r] of [[0, 560, 300], [-200, 450, 230], [190, 470, 240]] as const) S.sphere([x + dx, dy, 6100], r, dy > 500 ? K.leaf : K.leafDark, { sy: 0.85, layer: 0.35, n: 18, bands: 9 }); }
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
  for (const x of [-XW - 260, XW + 260]) { S.line([x, 600, 0], [x, 600, 4600], '#7d8b8a', 3); S.quad([[x, 0, 0], [x, 0, 4600], [x, 600, 4600], [x, 600, 0]], '#9fb0ab', { n: [x < 0 ? 1 : -1, 0, 0], raw: true, op: 0.14, cull: false, edge: false, layer: 2.5 }); }
  for (const [x, z] of [[-XW - 320, 600], [XW + 320, 600], [-XW - 320, 3800], [XW + 320, 3800]]) { S.cyl([x, 0, z], 12, 1100, '#8c9796', { n: 8 }); S.box({ x: [x - 70, x + 70], y: [1090, 1150], z: [z - 15, z + 15], c: '#c9cfd0' }); }
  const ball = S.cam.project([-260, 0, 980]), bs = (22 * S.cam.pxcm([-260, 0, 980])) / 170;
  S.contact([-272, -248], [968, 992], 0.3);
  S.sprite([-260, 11, 980], <g transform={`translate(${ball[0]} ${ball[1] - 85 * bs}) scale(${bs})`}><Football /></g>);
  S.sprite([-120, 0, 900], <g data-layer="actors">{children}</g>);
  return wrap(id, 'san-bong-mini', S.render(id, sky('#a9d0d4', '#e9efdf', id)), '#ffe7b0');
};

// ---------------------------------------------------------------------------------------------
// 7. Góc cắt tóc (P2.05 montage): tiệm nhỏ, gương lớn, quầy, ghế cắt tóc, sàn ô cờ đen trắng.
// ---------------------------------------------------------------------------------------------
/** `turn`: góc xoay của ghế cắt tóc quanh trụ (độ, dương là xoay ngược chiều kim đồng hồ nhìn từ trên). */
export const BarberCorner = ({ turn = 0 }: { turn?: number }) => {
  const id = uid(), S = makeScene(camera({ pos: [-150, 158, -40], look: [40, 105, 420], mm: 26 }), { sun: [0.6, -0.65, 0.4], amb: 0.62, diff: 0.42, lamps: [{ p: [40, 250, 300], col: [1, 0.9, 0.7], r: 200, k: 0.25 }] });
  const X: [number, number] = [-260, 320], Z: [number, number] = [-100, 430], H = 300;
  shellRoom(S, X, Z, H, { wall: '#e3dcc6', lower: '#9fb7ad', lowerH: 120, floor: '#e8e4d8' });
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
  S.box({ x: [cx - 30, cx + 30], y: [58, 128], z: [cz + 24, cz + 34], c: '#3f5a52', ...sw });
  for (const dx of [-34, 30]) S.box({ x: [cx + dx, cx + dx + 6], y: [58, 74], z: [cz - 26, cz + 26], c: '#5d4e3c', ...sw });
  S.box({ x: [cx - 22, cx + 22], y: [12, 16], z: [cz - 62, cz - 40], c: '#8a9290', ...sw });
  S.contact([cx - 34, cx + 34], [cz - 34, cz + 34], 0.24);
  S.castShadow([cx - 32, cx + 32], [cz - 30, cz + 34], 128, 0.14);
  S.line([40, H, 300], [40, 262, 300], '#4a4a42', 0.8, { cm: true, layer: 2 });
  S.cyl([40, 250, 300], 22, 12, '#d8c18e', { r2: 8, n: 14 });
  S.glow([40, 244, 300], 30, '#ffe8b8', 0.22);
  return wrap(id, 'goc-cat-toc', S.render(id, <rect width={1920} height={1080} fill="#d9d5c2" />), '#ffe2b0');
};
