import React from 'react';

/**
 * Bối cảnh trường học và sân thể thao cho Hồ sơ 2 (đề xuất 10/11/2026, chờ duyệt).
 * Mỗi cảnh dựng bằng một camera phối cảnh thật (đơn vị cm, máy nhìn theo trục z), rồi vẽ SVG khối mềm theo quy chuẩn chung.
 * Kích thước 1920×1080. Nhân vật đặt bằng `placeAt` để chân chạm đúng mặt sân.
 */
type V = [number, number, number];
type Cam = { h: number; F: number; hz: number; x?: number };
const INK = '#40443f';
const f1 = (n: number) => n.toFixed(1);

const mk = (c: Cam) => {
  const P = (p: V): [number, number] => [960 + (c.F * (p[0] - (c.x ?? 0))) / p[2], c.hz - (c.F * (p[1] - c.h)) / p[2]];
  const d = (ps: V[]) => 'M' + ps.map((p) => P(p).map(f1).join(' ')).join('L') + 'Z';
  return { P, d };
};
type Draw = ReturnType<typeof mk>;
const Poly: React.FC<{ g: Draw; ps: V[]; fill: string; ink?: boolean; w?: number; op?: number }> = ({ g, ps, fill, ink = true, w = 3, op }) => (
  <path d={g.d(ps)} fill={fill} stroke={ink ? INK : 'none'} strokeWidth={w} strokeLinejoin="round" opacity={op} />
);
const Line: React.FC<{ g: Draw; a: V; b: V; c?: string; w?: number; op?: number }> = ({ g, a, b, c = INK, w = 3, op }) => {
  const [x1, y1] = g.P(a), [x2, y2] = g.P(b);
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} strokeLinecap="round" opacity={op} />;
};
/** Hộp có 3 mặt thấy được (trước, trên, cạnh hướng về máy). */
const Box: React.FC<{ g: Draw; x: [number, number]; y: [number, number]; z: [number, number]; c: string; top?: string; side?: string; camX?: number }> = ({ g, x, y, z, c, top, side, camX = 0 }) => {
  const [x0, x1] = x, [y0, y1] = y, [z0, z1] = z;
  const sx = camX < x0 ? x0 : x1;
  return (
    <g>
      {(camX < x0 || camX > x1) && <Poly g={g} ps={[[sx, y0, z0], [sx, y0, z1], [sx, y1, z1], [sx, y1, z0]]} fill={side ?? c} />}
      <Poly g={g} ps={[[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]} fill={top ?? c} />
      <Poly g={g} ps={[[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]]} fill={c} />
    </g>
  );
};
/** Tán cây mềm: cụm tròn chồng nhau, không viền rời từng hình. */
const Tree: React.FC<{ g: Draw; at: V; r: number; dark?: boolean }> = ({ g, at, r, dark }) => {
  const [x, y] = g.P([at[0], at[1], at[2]]), k = g.P([at[0] + r, at[1], at[2]])[0] - x;
  const trunkTop = g.P([at[0], at[1] + r * 1.3, at[2]])[1];
  const leaf = dark ? '#21352d' : '#6f9a6e', leaf2 = dark ? '#1a2b24' : '#5b8460';
  const blobs: [number, number, number][] = [[0, -2.1, 1], [-0.85, -1.6, 0.75], [0.9, -1.55, 0.8], [-0.3, -2.75, 0.7], [0.45, -2.6, 0.72]];
  return (
    <g>
      <path d={`M${f1(x - k * 0.12)} ${f1(y)} Q${f1(x - k * 0.05)} ${f1((y + trunkTop) / 2)} ${f1(x - k * 0.1)} ${f1(trunkTop)} L${f1(x + k * 0.1)} ${f1(trunkTop)} Q${f1(x + k * 0.05)} ${f1((y + trunkTop) / 2)} ${f1(x + k * 0.12)} ${f1(y)} Z`} fill={dark ? '#2e2a24' : '#8a6a4b'} stroke={INK} strokeWidth={3} />
      <g stroke={INK} strokeWidth={3}>{blobs.map(([dx, dy, s], i) => <circle key={i} cx={x + dx * k} cy={y + dy * k} r={s * k} fill={leaf} />)}</g>
      {blobs.map(([dx, dy, s], i) => <circle key={`i${i}`} cx={x + dx * k} cy={y + dy * k} r={s * k - 1.6} fill={i % 2 ? leaf2 : leaf} />)}
    </g>
  );
};
const Sky: React.FC<{ night?: boolean; dusk?: boolean }> = ({ night, dusk }) => (
  <>
    <defs>
      <linearGradient id="tvs-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={night ? '#0f1830' : dusk ? '#e9b58a' : '#a9d3d3'} />
        <stop offset="1" stopColor={night ? '#1f2c46' : dusk ? '#f3dcb0' : '#e6f0de'} />
      </linearGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#tvs-sky)" />
  </>
);
const Vignette: React.FC<{ night?: boolean }> = ({ night }) => (
  <>
    <defs>
      <radialGradient id="tvs-vig" cx=".5" cy=".46" r=".75"><stop offset=".6" stopColor="#1c2420" stopOpacity="0" /><stop offset="1" stopColor="#1c2420" stopOpacity={night ? 0.5 : 0.2} /></radialGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#tvs-vig)" />
  </>
);

export type SceneProps = { night?: boolean; dusk?: boolean; children?: React.ReactNode };
/** Điểm đặt nhân vật trên mặt đất của cảnh: x, z theo cm; trả về toạ độ cho rig (cao 590 đơn vị = 168 cm). */
export const placeAt = (scene: keyof typeof CAMS, x: number, z: number) => {
  const c = CAMS[scene], g = mk(c);
  const [sx, sy] = g.P([x, 0, z]);
  const scale = (168 / 590) * (c.F / z);
  return { x: sx, y: sy - 590 * scale, scale };
};
const CAMS = {
  gate: { h: 160, F: 1100, hz: 470 },
  corridor: { h: 155, F: 1000, hz: 470 },
  lecture: { h: 150, F: 950, hz: 430 },
  pitch: { h: 170, F: 1150, hz: 430 },
} satisfies Record<string, Cam>;

/** Sân trường nhìn về dãy nhà học ba tầng: hành lang lan can, cột cờ, cây bàng, ghế đá. */
export const SchoolYard: React.FC<SceneProps> = ({ night, dusk, children }) => {
  const g = mk(CAMS.gate);
  const wall = night ? '#4a4f5c' : '#ecdcb6', wallLow = night ? '#3d4250' : '#d9c39a', trim = night ? '#5c6170' : '#f6ecd4', win = night ? '#f0cf86' : '#8fb3b6';
  const floors = [0, 340, 680];
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={1920} height={1080} viewBox="0 0 1920 1080" data-scene="san-truong">
      <Sky night={night} dusk={dusk} />
      <Poly g={g} ps={[[-6000, 0, 110], [6000, 0, 110], [6000, 0, 4200], [-6000, 0, 4200]]} fill={night ? '#3a3e46' : '#cfc6b2'} ink={false} />
      {Array.from({ length: 13 }, (_, i) => <Line key={`gx${i}`} g={g} a={[-3600 + i * 600, 0, 130]} b={[-3600 + i * 600, 0, 3800]} c={night ? '#33373e' : '#bdb39d'} w={2} />)}
      {Array.from({ length: 12 }, (_, i) => <Line key={`gz${i}`} g={g} a={[-6000, 0, 200 + i * 320]} b={[6000, 0, 200 + i * 320]} c={night ? '#33373e' : '#bdb39d'} w={2} />)}
      {/* Dãy nhà học */}
      <Poly g={g} ps={[[-2600, 0, 3800], [2600, 0, 3800], [2600, 1060, 3800], [-2600, 1060, 3800]]} fill={wall} />
      <Poly g={g} ps={[[-2750, 1060, 3740], [2750, 1060, 3740], [2650, 1130, 3800], [-2650, 1130, 3800]]} fill={night ? '#5a3c34' : '#b5654c'} />
      {floors.map((fy, k) => (
        <g key={fy}>
          <Poly g={g} ps={[[-2600, fy, 3600], [2600, fy, 3600], [2600, fy + 18, 3600], [-2600, fy + 18, 3600]]} fill={trim} />
          {Array.from({ length: 9 }, (_, i) => {
            const x0 = -2400 + i * 540;
            return (
              <g key={i}>
                <Poly g={g} ps={[[x0, fy + 60, 3800], [x0 + 140, fy + 60, 3800], [x0 + 140, fy + 290, 3800], [x0, fy + 290, 3800]]} fill={night ? '#2b3140' : '#7f9c90'} />
                <Poly g={g} ps={[[x0 + 220, fy + 140, 3800], [x0 + 440, fy + 140, 3800], [x0 + 440, fy + 280, 3800], [x0 + 220, fy + 280, 3800]]} fill={night && (i + k) % 3 === 0 ? win : night ? '#232836' : win} />
              </g>
            );
          })}
          {k > 0 && <Poly g={g} ps={[[-2600, fy + 18, 3600], [2600, fy + 18, 3600], [2600, fy + 110, 3600], [-2600, fy + 110, 3600]]} fill={wallLow} />}
          {k > 0 && Array.from({ length: 27 }, (_, i) => <Line key={`r${i}`} g={g} a={[-2600 + i * 200, fy + 20, 3600]} b={[-2600 + i * 200, fy + 108, 3600]} c={night ? '#2d313b' : '#b39d78'} w={2} />)}
        </g>
      ))}
      {[-2600, -1300, 0, 1300, 2600].map((x) => <Box key={x} g={g} x={[x - 30, x + 30]} y={[0, 1060]} z={[3560, 3620]} c={trim} camX={0} />)}
      {/* Biển trường: chữ trung tính, không tên trường thật */}
      <Poly g={g} ps={[[-520, 960, 3780], [520, 960, 3780], [520, 1040, 3780], [-520, 1040, 3780]]} fill={night ? '#3c4c66' : '#3f6aa1'} />
      <text x={g.P([0, 985, 3780])[0]} y={g.P([0, 985, 3780])[1]} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={22} fill="#f6efe0">TRƯỜNG ĐẠI HỌC</text>
      {/* Cột cờ */}
      <Line g={g} a={[-900, 0, 2200]} b={[-900, 820, 2200]} c={night ? '#6b7280' : '#9aa3a4'} w={5} />
      <path d={(() => { const a = g.P([-900, 810, 2200]), b = g.P([-690, 770, 2200]), c = g.P([-900, 710, 2200]); return `M${a.join(' ')} Q${(a[0] + b[0]) / 2} ${a[1] - 6} ${b.join(' ')} Q${(b[0] + c[0]) / 2} ${b[1] + 14} ${c.join(' ')} Z`; })()} fill={night ? '#7a2d2a' : '#d04a3a'} stroke={INK} strokeWidth={2.5} />
      <Box g={g} x={[-980, -820]} y={[0, 40]} z={[2120, 2280]} c={night ? '#565c66' : '#d9d2bf'} />
      {/* Cây bàng và ghế đá */}
      <Tree g={g} at={[-2200, 0, 2400]} r={260} dark={night} />
      <Tree g={g} at={[1900, 0, 2000]} r={300} dark={night} />
      <Box g={g} x={[700, 1100]} y={[30, 45]} z={[900, 1000]} c={night ? '#5b616b' : '#c8c2b2'} />
      <Box g={g} x={[730, 770]} y={[0, 30]} z={[920, 980]} c={night ? '#4b5058' : '#aaa391'} />
      <Box g={g} x={[1030, 1070]} y={[0, 30]} z={[920, 980]} c={night ? '#4b5058' : '#aaa391'} />
      <Vignette night={night} />
      {children}
    </svg>
  );
};

/** Hành lang tầng hai: lan can bên trái nhìn ra sân, cửa lớp và cửa sổ bên phải, cột đều nhịp. */
export const SchoolCorridor: React.FC<SceneProps> = ({ night, children }) => {
  const g = mk(CAMS.corridor);
  const wall = night ? '#474c58' : '#efe2c2', low = night ? '#3a3f4b' : '#cfd9c3', floor = night ? '#3b3d43' : '#d8cdb5';
  const W = 260, D = 3600;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={1920} height={1080} viewBox="0 0 1920 1080" data-scene="hanh-lang-truong">
      <Sky night={night} />
      {/* Sân và cây phía dưới, nhìn qua lan can */}
      <Poly g={g} ps={[[-4000, -340, 200], [-W, -340, 200], [-W, -340, 6000], [-4000, -340, 6000]]} fill={night ? '#2f333a' : '#cfc6b2'} ink={false} />
      <Tree g={g} at={[-900, -340, 1500]} r={240} dark={night} />
      <Tree g={g} at={[-1500, -340, 3200]} r={300} dark={night} />
      {/* Sàn, trần, tường lớp */}
      <Poly g={g} ps={[[-W, 0, 120], [W, 0, 120], [W, 0, D], [-W, 0, D]]} fill={floor} />
      {Array.from({ length: 16 }, (_, i) => <Line key={i} g={g} a={[-W, 0, 200 + i * 220]} b={[W, 0, 200 + i * 220]} c={night ? '#34363c' : '#c3b89f'} w={2} />)}
      <Poly g={g} ps={[[-W, 330, 120], [W, 330, 120], [W, 330, D], [-W, 330, D]]} fill={night ? '#3a3e48' : '#f4ecda'} />
      <Poly g={g} ps={[[W, 0, 120], [W, 0, D], [W, 330, D], [W, 330, 120]]} fill={wall} />
      <Poly g={g} ps={[[W, 0, 120], [W, 0, D], [W, 100, D], [W, 100, 120]]} fill={low} />
      {Array.from({ length: 5 }, (_, i) => {
        const z0 = 420 + i * 640;
        return (
          <g key={i}>
            <Poly g={g} ps={[[W - 1, 0, z0], [W - 1, 0, z0 + 110], [W - 1, 230, z0 + 110], [W - 1, 230, z0]]} fill={night ? '#3f5a52' : '#7f9c90'} />
            <Poly g={g} ps={[[W - 1, 120, z0 + 200], [W - 1, 120, z0 + 470], [W - 1, 220, z0 + 470], [W - 1, 220, z0 + 200]]} fill={night && i % 2 ? '#f0cf86' : night ? '#262c38' : '#9fc1c0'} />
            <Line g={g} a={[W - 2, 170, z0 + 200]} b={[W - 2, 170, z0 + 470]} c={night ? '#565b66' : '#d8d1bd'} w={3} />
            <Poly g={g} ps={[[W - 2, 245, z0 + 20], [W - 2, 245, z0 + 90], [W - 2, 275, z0 + 90], [W - 2, 275, z0 + 20]]} fill={night ? '#5a6474' : '#3f6aa1'} />
          </g>
        );
      })}
      {/* Lan can và cột */}
      <Poly g={g} ps={[[-W, 0, 120], [-W, 0, D], [-W, 30, D], [-W, 30, 120]]} fill={low} />
      {Array.from({ length: 30 }, (_, i) => <Line key={`b${i}`} g={g} a={[-W, 30, 140 + i * 115]} b={[-W, 100, 140 + i * 115]} c={night ? '#6c7380' : '#8d9a91'} w={4} />)}
      <Poly g={g} ps={[[-W - 8, 100, 120], [-W + 8, 100, 120], [-W + 8, 108, D], [-W - 8, 108, D]]} fill={night ? '#6c7380' : '#8d9a91'} />
      {Array.from({ length: 6 }, (_, i) => <Box key={`c${i}`} g={g} x={[-W - 20, -W + 20]} y={[0, 330]} z={[300 + i * 640, 340 + i * 640]} c={night ? '#555b67' : '#f6ecd4'} camX={0} />)}
      {Array.from({ length: 5 }, (_, i) => { const [x, y] = g.P([0, 326, 600 + i * 640]); const k = 1000 / (600 + i * 640); return <rect key={`l${i}`} x={x - 60 * k} y={y} width={120 * k} height={8 * k} rx={4 * k} fill={night ? '#fff0c9' : '#f7f3e4'} stroke={INK} strokeWidth={2} />; })}
      <Vignette night={night} />
      {children}
    </svg>
  );
};

/** Giảng đường: bảng trắng, bàn dài nhiều dãy, cửa sổ bên trái có nắng, quạt trần. */
export const LectureRoom: React.FC<SceneProps> = ({ night, children }) => {
  const g = mk(CAMS.lecture);
  const W = 520, D = 1500;
  const wall = night ? '#454a56' : '#efe4c8', floor = night ? '#3c3d42' : '#d1c5ab', desk = night ? '#6a5640' : '#c99e68', deskTop = night ? '#7d6649' : '#d9b483';
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={1920} height={1080} viewBox="0 0 1920 1080" data-scene="giang-duong">
      <rect width={1920} height={1080} fill={wall} />
      <Poly g={g} ps={[[-W, 0, 120], [W, 0, 120], [W, 0, D], [-W, 0, D]]} fill={floor} />
      <Poly g={g} ps={[[-W, 320, 120], [W, 320, 120], [W, 320, D], [-W, 320, D]]} fill={night ? '#3b3f49' : '#f5eedf'} />
      <Poly g={g} ps={[[-W, 0, D], [W, 0, D], [W, 320, D], [-W, 320, D]]} fill={wall} />
      <Poly g={g} ps={[[-W, 0, 120], [-W, 0, D], [-W, 320, D], [-W, 320, 120]]} fill={night ? '#3f4450' : '#e8dcbc'} />
      <Poly g={g} ps={[[W, 0, 120], [W, 0, D], [W, 320, D], [W, 320, 120]]} fill={night ? '#3f4450' : '#e8dcbc'} />
      <Poly g={g} ps={[[-W, 0, 120], [-W, 0, D], [-W, 90, D], [-W, 90, 120]]} fill={night ? '#363b45' : '#c9d4be'} />
      <Poly g={g} ps={[[W, 0, 120], [W, 0, D], [W, 90, D], [W, 90, 120]]} fill={night ? '#363b45' : '#c9d4be'} />
      {/* Cửa sổ trái */}
      {[300, 700, 1100].map((z) => <Poly key={z} g={g} ps={[[-W + 1, 120, z], [-W + 1, 120, z + 260], [-W + 1, 270, z + 260], [-W + 1, 270, z]]} fill={night ? '#1f2a40' : '#bfe0dc'} />)}
      {!night && [300, 700, 1100].map((z) => <Poly key={`s${z}`} g={g} ps={[[-W, 0.5, z + 150], [-W, 0.5, z + 410], [-W + 260, 0.5, z + 350], [-W + 260, 0.5, z + 90]]} fill="#fff4cf" ink={false} op={0.45} />)}
      {/* Bảng trắng và bục */}
      <Poly g={g} ps={[[-300, 110, D - 1], [300, 110, D - 1], [300, 250, D - 1], [-300, 250, D - 1]]} fill={night ? '#c9cdd0' : '#f8f8f2'} w={4} />
      <Line g={g} a={[-250, 210, D - 2]} b={[-60, 205, D - 2]} c="#3f6aa1" w={3} />
      <Line g={g} a={[-250, 180, D - 2]} b={[40, 176, D - 2]} c="#3f6aa1" w={3} />
      <Line g={g} a={[-250, 150, D - 2]} b={[-120, 148, D - 2]} c="#bb6a52" w={3} />
      <Box g={g} x={[-120, 120]} y={[0, 95]} z={[D - 260, D - 180]} c={desk} top={deskTop} camX={0} />
      {/* Bàn ghế dãy, xa trước gần sau để che đúng */}
      {[1150, 940, 730, 520].map((z) => [[-470, -60], [60, 470]].map(([a, b]) => (
        <g key={`${z}${a}`}>
          <Box g={g} x={[a, b]} y={[0, 42]} z={[z - 75, z - 35]} c={night ? '#4d5560' : '#8ca188'} camX={0} />
          <Box g={g} x={[a, b]} y={[68, 74]} z={[z, z + 45]} c={desk} top={deskTop} camX={0} />
          <Box g={g} x={[a, a + 6]} y={[0, 68]} z={[z + 5, z + 40]} c={desk} camX={0} />
          <Box g={g} x={[b - 6, b]} y={[0, 68]} z={[z + 5, z + 40]} c={desk} camX={0} />
        </g>
      )))}
      {/* Quạt trần */}
      {[600, 1100].map((z) => { const [x, y] = g.P([0, 300, z]), k = 950 / z; return (
        <g key={z} stroke={INK} strokeWidth={2.5}>
          <line x1={x} y1={g.P([0, 320, z])[1]} x2={x} y2={y} />
          <ellipse cx={x} cy={y} rx={110 * k} ry={10 * k} fill={night ? '#6c7380' : '#d8e2d4'} />
          <circle cx={x} cy={y} r={9 * k} fill={night ? '#555b67' : '#94b0a0'} />
        </g>
      ); })}
      {night && <rect width={1920} height={1080} fill="#0b1222" opacity={0.25} />}
      <Vignette night={night} />
      {children}
    </svg>
  );
};

/** Sân bóng đá mini cỏ nhân tạo: vạch trắng, khung thành, lưới rào, cột đèn; đêm bật đèn sân. */
export const FootballPitch: React.FC<SceneProps> = ({ night, dusk, children }) => {
  const g = mk(CAMS.pitch);
  const grass = night ? '#2f6b46' : dusk ? '#6f9a52' : '#5f9e5a', grass2 = night ? '#2a6040' : dusk ? '#668f4b' : '#579450';
  const L = 3800, Wd = 1300;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={1920} height={1080} viewBox="0 0 1920 1080" data-scene="san-bong">
      <Sky night={night} dusk={dusk} />
      {/* Dãy nhà xa và cây */}
      {[-3600, -2200, -700, 900, 2400].map((x, i) => <Poly key={x} g={g} ps={[[x, 0, 6000], [x + 1300, 0, 6000], [x + 1300, 900 + (i % 2) * 400, 6000], [x, 900 + (i % 2) * 400, 6000]]} fill={night ? '#22304a' : ['#d9c7a6', '#c7b79a', '#e0d3b5', '#b9b49a', '#d4bea0'][i]} />)}
      {[-3000, -1200, 1500, 3200].map((x) => <Tree key={x} g={g} at={[x, 0, 5200]} r={320} dark={night} />)}
      {/* Mặt sân sọc cỏ */}
      <Poly g={g} ps={[[-Wd - 300, 0, 250], [Wd + 300, 0, 250], [Wd + 300, 0, L + 300], [-Wd - 300, 0, L + 300]]} fill={night ? '#3d4440' : '#b8b09a'} />
      {Array.from({ length: 9 }, (_, i) => <Poly key={i} g={g} ps={[[-Wd, 0, 300 + i * 400], [Wd, 0, 300 + i * 400], [Wd, 0, 700 + i * 400], [-Wd, 0, 700 + i * 400]]} fill={i % 2 ? grass2 : grass} ink={false} />)}
      {(() => { const c = night ? '#e8f0e4' : '#f6f4ea'; const w = 4; return (
        <g>
          <Poly g={g} ps={[[-Wd, 0, 300], [Wd, 0, 300], [Wd, 0, L], [-Wd, 0, L]]} fill="none" ink={false} />
          <Line g={g} a={[-Wd, 0, 300]} b={[-Wd, 0, L]} c={c} w={w} /><Line g={g} a={[Wd, 0, 300]} b={[Wd, 0, L]} c={c} w={w} />
          <Line g={g} a={[-Wd, 0, L]} b={[Wd, 0, L]} c={c} w={w} /><Line g={g} a={[-Wd, 0, 2050]} b={[Wd, 0, 2050]} c={c} w={w} />
          <Line g={g} a={[-500, 0, L]} b={[-500, 0, L - 500]} c={c} w={w} /><Line g={g} a={[500, 0, L]} b={[500, 0, L - 500]} c={c} w={w} /><Line g={g} a={[-500, 0, L - 500]} b={[500, 0, L - 500]} c={c} w={w} />
          <path d={'M' + Array.from({ length: 25 }, (_, i) => { const t = (i / 24) * Math.PI * 2; return g.P([Math.cos(t) * 300, 0, 2050 + Math.sin(t) * 300]).map(f1).join(' '); }).join('L')} fill="none" stroke={c} strokeWidth={w} />
        </g>
      ); })()}
      {/* Khung thành và lưới */}
      {(() => { const z = L, c = night ? '#eef2ee' : '#f7f6ef'; return (
        <g>
          <Poly g={g} ps={[[-300, 0, z + 120], [300, 0, z + 120], [300, 200, z + 120], [-300, 200, z + 120]]} fill="#ffffff" ink={false} op={night ? 0.12 : 0.22} />
          {Array.from({ length: 13 }, (_, i) => <Line key={i} g={g} a={[-300 + i * 50, 0, z + 120]} b={[-300 + i * 50, 200, z + 120]} c={c} w={1.2} op={0.6} />)}
          {Array.from({ length: 5 }, (_, i) => <Line key={`h${i}`} g={g} a={[-300, i * 50, z + 120]} b={[300, i * 50, z + 120]} c={c} w={1.2} op={0.6} />)}
          <Line g={g} a={[-300, 0, z]} b={[-300, 200, z]} c={c} w={7} /><Line g={g} a={[300, 0, z]} b={[300, 200, z]} c={c} w={7} /><Line g={g} a={[-300, 200, z]} b={[300, 200, z]} c={c} w={7} />
        </g>
      ); })()}
      {/* Lưới rào hai bên và cột đèn */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <Poly g={g} ps={[[s * (Wd + 300), 0, 250], [s * (Wd + 300), 0, L + 300], [s * (Wd + 300), 500, L + 300], [s * (Wd + 300), 500, 250]]} fill={night ? '#9aa3a4' : '#7f8f8a'} ink={false} op={0.18} />
          {Array.from({ length: 12 }, (_, i) => <Line key={i} g={g} a={[s * (Wd + 300), 0, 300 + i * 330]} b={[s * (Wd + 300), 500, 300 + i * 330]} c={night ? '#8a939a' : '#6e7d76'} w={3} />)}
          <Line g={g} a={[s * (Wd + 300), 500, 250]} b={[s * (Wd + 300), 500, L + 300]} c={night ? '#8a939a' : '#6e7d76'} w={3} />
          {[900, 2700].map((z) => { const top = g.P([s * (Wd + 380), 1100, z]); return (
            <g key={z}>
              <Line g={g} a={[s * (Wd + 380), 0, z]} b={[s * (Wd + 380), 1100, z]} c={night ? '#7d858c' : '#9aa3a4'} w={5} />
              <rect x={top[0] - 34} y={top[1] - 20} width={68} height={26} rx={6} fill={night ? '#fff6d8' : '#c9cfd0'} stroke={INK} strokeWidth={2.5} />
              {night && <ellipse cx={top[0]} cy={top[1]} rx={140} ry={90} fill="#fff1c4" opacity={0.25} />}
            </g>
          ); })}
        </g>
      ))}
      {/* Ghế băng và quả bóng gần máy */}
      <Box g={g} x={[Wd + 80, Wd + 280]} y={[40, 50]} z={[700, 1300]} c={night ? '#4b6a8a' : '#3f6aa1'} camX={0} />
      {(() => { const [x, y] = g.P([-260, 0, 900]), r = (11 * 1150) / 900; return <g><ellipse cx={x} cy={y} rx={r * 1.1} ry={r * 0.3} fill="#1c2a1f" opacity={0.3} /><circle cx={x} cy={y - r} r={r} fill="#f6f4ea" stroke={INK} strokeWidth={2.5} /><path d={`M${x - r * 0.3} ${y - r * 1.2} l${r * 0.3} ${-r * 0.25} l${r * 0.3} ${r * 0.25} l${-r * 0.1} ${r * 0.35} h${-r * 0.4} Z`} fill={INK} /></g>; })()}
      {night && <rect width={1920} height={1080} fill="#0b1630" opacity={0.18} />}
      <Vignette night={night} />
      {children}
    </svg>
  );
};

export const SchoolYardNight = (p: SceneProps) => <SchoolYard {...p} night />;
export const PitchNight = (p: SceneProps) => <FootballPitch {...p} night />;
export const PitchDusk = (p: SceneProps) => <FootballPitch {...p} dusk />;
