import React from 'react';
import { JointPose, NamMood, PALETTE, STAND_POSE, StudentTwinBody, StudentTwinHead, TWIN_OUTFIT, solveRig } from '../../nhan-vat';

/**
 * THỬ NGHIỆM 11/11/2026 — Nam từ 2D sang 2.5D, giữ nguyên tạo hình đã chốt.
 *
 * Không vẽ lại Nam: nhân vật gốc (`StudentTwinBody`/`StudentTwinHead`) render y nguyên, phía trên là
 * một lớp "thể tích" gồm các mảng sáng–tối TỰ VẼ, cắt bằng mask silhouette của chính nhân vật và theo
 * đúng khối (tóc, da mặt, thân áo, tay, ống quần). Không filter, không gradient, không blur, không rim.
 * Hướng sáng thiết kế cố định: trái–trên (cùng phía với mảng `drawn-side` có sẵn ở hông phải áo).
 *
 * Chiều sâu 2.5D tạo bởi:
 *  1. Mặt sáng/mặt tối rõ trên từng khối tròn (thân, tay, ống quần) → khối trụ thay vì mảng phẳng.
 *  2. Bóng đổ tóc lên trán, áo lên quần (bóng của lớp trên rơi xuống lớp dưới) → đọc được thứ tự lớp.
 *  3. Mảng sáng nhỏ trên tóc, má gần, vai gần → đọc được mặt hướng về nguồn sáng.
 * Phạm vi thử: tư thế đứng, góc 3/4 và chính diện. Các góc/pose khác chưa vẽ mảng riêng.
 */

type View25 = 'three' | 'front';
/**
 * Mảng tối phủ bằng multiply (phép hoà màu, không phải filter): nét mắt/mày/nếp áo nằm dưới vẫn giữ mực,
 * và một mảng dùng được cho mọi màu áo. `skin` được chọn để da nền #dbad82 × skin = đúng PALETTE.skinShadow.
 */
export const VOL = {
  skin: '#dcc9cc', // → #bd8968 trên da
  cloth: '#cdd1d2', // vải mặt tối ≈ 81% sáng
  clothSoft: '#dadddd', // bóng nhẹ (vạt áo đổ xuống quần)
  light: '#fff6e4', lightOp: 0.13, // mảng sáng phủ thường, rất nhẹ
  hairLight: '#4a4c49',
};
// Đặt multiply ở NHÓM có mask/clip: nhóm bị mask là nhóm cô lập, blend của phần tử con không chạm được nền phía dưới.
const MUL: React.CSSProperties = { mixBlendMode: 'multiply' };

// Bản sao hình học đầu/tóc/thân từ nhan-vat.tsx — CHỈ dùng làm vùng cắt, không vẽ ra.
const SKULL: Record<View25, string> = {
  three: 'M -55 60 Q -50 25 -9 25 Q 42 24 53 66 L 55 111 Q 72 130 54 146 Q 38 166 6 165 Q -30 163 -45 138 L -58 100 Z',
  front: 'M -58 60 Q -52 25 0 25 Q 52 25 58 60 L 60 108 Q 62 138 38 156 Q 18 168 0 167 Q -18 168 -38 156 Q -62 138 -60 108 Z',
};
const HAIR: Record<View25, string> = {
  three: 'M -51 92 Q -65 79 -61 52 L -71 51 Q -58 27 -38 28 L -43 18 Q -20 21 -7 14 Q -10 -5 15 -5 Q 22 -4 24 4 Q 7 0 8 16 Q 40 13 51 37 L 62 43 L 48 59 Q 34 54 22 43 Q 15 63 -4 67 L -1 52 Q -20 75 -41 74 L -43 95 Z',
  front: 'M -60 92 Q -72 70 -66 50 L -76 46 Q -62 24 -42 24 L -44 14 Q -22 18 -7 12 Q -10 -6 15 -6 Q 24 -5 25 4 Q 8 1 9 15 Q 44 12 56 34 L 70 38 L 60 58 L 60 88 Q 48 62 28 52 Q 18 66 -2 66 L 0 54 Q -24 74 -46 70 L -48 92 Z',
};
/** Thân áo và vạt áo là hai mảng riêng (như Blob gốc); gộp vào một path sẽ triệt tiêu chỗ chồng nhau. */
const torsoOf = (v: View25): string[] => {
  const o = v === 'front' ? TWIN_OUTFIT.views!.front! : TWIN_OUTFIT;
  const [a, b, d, e, g, h, i] = o.hem!.map(([x, y]) => `${x} ${y}`);
  return [o.torso!, `M ${a} L ${b} L ${d} Q ${e} ${g} Q ${h} ${i} Z`];
};

// Mảng tự vẽ của đầu, hệ toạ độ đầu (như StudentTwinHead).
const HEAD_MASS: Record<View25, { hairLight: string; temple: string; ear: string[]; earFar?: string; nose: string }> = {
  three: {
    hairLight: 'M -60 52 Q -50 34 -30 30 Q -14 27 -2 20 Q 4 8 14 2 Q 6 12 6 22 Q -10 32 -28 36 Q -46 40 -60 52 Z',
    temple: 'M 42 42 Q 54 54 55 76 L 56 98 Q 51 94 49 84 Q 47 66 44 56 Z',
    ear: ['M -71 92 Q -64 86 -58 96 Q -55 112 -64 118 Q -60 104 -71 92 Z'],
    nose: 'M 12 124 Q 22 127 26 119 Q 27 128 15 130 Z',
  },
  front: {
    hairLight: 'M -66 52 Q -56 34 -36 30 Q -18 26 -4 18 Q 4 6 15 0 Q 8 12 8 22 Q -12 32 -32 36 Q -52 40 -66 52 Z',
    temple: 'M 46 46 Q 58 58 59 80 L 60 100 Q 55 96 53 86 Q 51 68 48 58 Z',
    ear: ['M -80 94 Q -72 88 -66 98 Q -63 112 -72 118 Q -68 106 -80 94 Z'],
    earFar: 'M 62 88 Q 84 74 86 99 Q 87 121 62 125 Q 72 112 70 100 Q 68 92 62 88 Z',
    nose: 'M 2 114 Q 10 121 18 113 Q 16 122 6 121 Z',
  },
};

const useUid = (p: string) => `${p}-${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;

/** Lớp thể tích của đầu — đặt chồng lên StudentTwinHead cùng hệ toạ độ. */
const HeadVolume: React.FC<{ view: View25 }> = ({ view }) => {
  const m = HEAD_MASS[view];
  const skin = useUid('v25skin'), hair = useUid('v25hair');
  return (
    <g stroke="none" data-volume="head">
      <defs>
        <clipPath id={hair}><path d={HAIR[view]} /></clipPath>
        <mask id={skin} maskUnits="userSpaceOnUse" x={-200} y={-100} width={400} height={400}>
          <path d={SKULL[view]} fill="#fff" />
          <path d={HAIR[view]} fill="#000" />
        </mask>
      </defs>
      {/* tóc: một mảng sáng theo vòm sọ phía nguồn sáng */}
      <path d={m.hairLight} fill={VOL.hairLight} opacity={0.6} clipPath={`url(#${hair})`} />
      <g mask={`url(#${skin})`} style={MUL}>
        {/* bóng tóc đổ xuống trán: chính mảng tóc, lệch theo hướng sáng */}
        <path d={HAIR[view]} transform="translate(4 7)" fill={VOL.skin} />
        {/* mặt bên phía xa (thái dương), dừng trên gò má để không thành dải râu */}
        <path d={m.temple} fill={VOL.skin} />
      </g>
      {m.ear.map((d, i) => <path key={i} d={d} fill={VOL.skin} style={MUL} />)}
      {m.earFar && <path d={m.earFar} fill={VOL.skin} style={MUL} />}
    </g>
  );
};

export const Nam25DHead: React.FC<React.ComponentProps<typeof StudentTwinHead>> = (p) => {
  const view: View25 = p.view === 'front' ? 'front' : 'three';
  return (
    <g transform={`translate(${p.x ?? 0} ${p.y ?? 0}) scale(${p.scale ?? 1})`}>
      <StudentTwinHead {...p} x={0} y={0} scale={1} />
      <HeadVolume view={view} />
    </g>
  );
};

type P = { x: number; y: number };
/**
 * Mảng tối dọc một chi (gốc → khớp giữa → ngọn), ở phía xa nguồn sáng (+x màn hình).
 * Mép trong là đường cong tự vẽ qua ba khớp (`inner` × nửa bề rộng tại mỗi khớp); mép ngoài vượt đường bao
 * một chút để mask silhouette cắt đúng mép. Bám theo khớp nên đi theo dáng, không tính theo đèn.
 */
const limbShade = (pts: [P, P, P], w: [number, number, number], inner: [number, number, number], outer = 1.15) => {
  const nrm = (a: P, b: P) => { const l = Math.hypot(b.x - a.x, b.y - a.y) || 1; const n = { x: -(b.y - a.y) / l, y: (b.x - a.x) / l }; return n.x < 0 ? { x: -n.x, y: -n.y } : n; };
  const n0 = nrm(pts[0], pts[1]), n2 = nrm(pts[1], pts[2]);
  const n1 = { x: (n0.x + n2.x) / 2, y: (n0.y + n2.y) / 2 };
  const ns = [n0, n1, n2];
  const at = (i: number, k: number) => `${(pts[i].x + ns[i].x * w[i] * k).toFixed(1)} ${(pts[i].y + ns[i].y * w[i] * k).toFixed(1)}`;
  return `M ${at(0, inner[0])} Q ${at(1, inner[1])} ${at(2, inner[2])} L ${at(2, outer)} L ${at(1, outer)} L ${at(0, outer)} Z`;
};
const lerpP = (a: P, b: P, t: number): P => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const down = (p: P, dy: number): P => ({ x: p.x, y: p.y + dy });

// Mảng thân áo (hệ toạ độ thân, tư thế đứng).
const TORSO_MASS: Record<View25, { dark: string; light: string; sleeveDark: string; hemCast: string }> = {
  three: {
    dark: 'M 40 184 Q 22 214 24 256 Q 26 306 40 352 Q 46 372 52 384 L 140 384 L 140 170 Z',
    light: 'M -110 230 Q -96 196 -66 184 Q -46 177 -26 177 Q -50 186 -64 200 Q -78 214 -84 236 Q -90 262 -92 290 L -110 290 Z',
    sleeveDark: 'M 74 205 L 120 205 L 120 292 L 80 292 Z',
    hemCast: 'M -62 352 Q -23 374 12 360 Q 38 368 62 346 L 62 351 Q 40 373 12 365 Q -24 379 -62 357 Z',
  },
  front: {
    dark: 'M 44 184 Q 28 214 30 256 Q 32 306 44 352 Q 50 372 56 384 L 140 384 L 140 170 Z',
    light: 'M -110 230 Q -96 196 -66 184 Q -46 178 -24 178 Q -48 187 -62 201 Q -76 216 -82 238 Q -88 262 -90 290 L -110 290 Z',
    sleeveDark: 'M 80 205 L 120 205 L 120 292 L 84 292 Z',
    hemCast: 'M -62 350 Q -30 370 0 362 Q 30 370 62 350 L 62 355 Q 30 375 0 367 Q -30 375 -62 355 Z',
  },
};

type BodyProps = React.ComponentProps<typeof StudentTwinBody>;
/** Chỉ vẽ mảng cho góc 3/4 và chính diện, nhân vật quay phải, đứng/ngồi trên sàn; còn lại rơi về Nam 2D. */
export const supports25D = (p: Pick<BodyProps, 'pose' | 'outfit'>) => {
  const q = p.pose ?? STAND_POSE;
  const v = q.view ?? 'three';
  return (v === 'three' || v === 'front') && (q.facing ?? 1) === 1 && q.support !== 'bed' && (!p.outfit || p.outfit === 'xanh' || p.outfit === 'ngu' || p.outfit === 'xam-tui' || p.outfit === 'dong-phuc');
};

/**
 * Nam 2.5D: cùng props với `StudentTwinBody`. Lớp thể tích đi theo đúng các phép biến đổi của rig
 * (dịch hông → nghiêng thân quanh chậu → xoay cổ), nên theo được dáng đứng/ngồi/đi.
 * `volume={false}` hoặc góc chưa hỗ trợ → trả về Nam 2D gốc.
 */
export const Nam25D: React.FC<BodyProps & { volume?: boolean }> = ({ volume = true, ...props }) => {
  const { x = 0, y = 0, scale = 1, pose = STAND_POSE } = props;
  const sil = useUid('v25sil'), limbs = useUid('v25limb'), torso = useUid('v25torso');
  const body = <StudentTwinBody {...props} x={0} y={0} scale={1} />;
  if (!volume || !supports25D(props)) return <StudentTwinBody {...props} />;
  const view: View25 = pose.view === 'front' ? 'front' : 'three';
  const r = solveRig({ ...pose, view });
  const T = TORSO_MASS[view];
  const shirt2 = torsoOf(view);
  // Chân gập (ngồi) và tay đưa lên thân che nhau; mảng cắt theo cả hình bao nên chỉ vẽ mảng chân khi chân gần thẳng, tránh lem lên tay/đồ cầm.
  const legsDown = Math.max(Math.abs(pose.legR.a), Math.abs(pose.legL.a)) < 40;
  const G1 = `translate(${pose.x} ${r.dy})`; // dịch hông / hạ hông khi gập gối
  const G2 = `rotate(${r.tilt} 0 345)`; // nghiêng thân quanh chậu (tay, áo, đầu nằm trong hệ này)
  const arm = (c: typeof r.armR, inner: [number, number, number]) =>
    limbShade([lerpP(c.root, c.mid, 0.58), c.mid, lerpP(c.mid, c.end, 1.42)] as [P, P, P], [17, 16, 15], inner, 1.6);
  const leg = (c: typeof r.legR, inner: [number, number, number]) =>
    limbShade([down(c.root, 8), c.mid, down(c.end, -8)], [31, 26, 28], inner, 1.08);
  // Mask phải ở hệ toạ độ của khung bọc (nơi Nam gốc được vẽ); vùng cắt áo thì theo hệ thân.
  const cut = shirt2.map((d) => <path key={d} d={d} transform={`${G1} ${G2}`} fill="#000" />);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {body}
      <g stroke="none" data-volume="body">
        <defs>
          <mask id={sil} maskUnits="userSpaceOnUse" x={-400} y={-300} width={800} height={1100}>
            <style>{`.${sil} *{fill:#fff!important;stroke:#fff!important;opacity:1!important}.${sil} [data-shadow]{display:none}`}</style>
            <g className={sil}>{body}</g>
          </mask>
          <mask id={limbs} maskUnits="userSpaceOnUse" x={-400} y={-300} width={800} height={1100}>
            <style>{`.${limbs} *{fill:#fff!important;stroke:#fff!important;opacity:1!important}.${limbs} [data-shadow]{display:none}`}</style>
            <g className={limbs}>{body}</g>
            {cut}
          </mask>
          {/* vùng tối thân áo = áo trừ các tay đang đưa ra trước thân (tay vẽ đè lên áo nên không được dính mảng tối) */}
          <mask id={torso} maskUnits="userSpaceOnUse" x={-400} y={-300} width={800} height={1100}>
            {shirt2.map((d) => <path key={d} d={d} fill="#fff" />)}
            {([[pose.frontR, r.armR], [pose.frontL, r.armL]] as const).map(([on, c], i) => on && <path key={i} d={`M ${c.root.x} ${c.root.y} L ${c.mid.x} ${c.mid.y} L ${c.end.x} ${c.end.y}`} fill="none" stroke="#000" strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" />)}
          </mask>
        </defs>
        {/* thân áo: mặt tối phía xa (multiply), cắt trong áo */}
        <g transform={`${G1} ${G2}`} mask={`url(#${torso})`} style={MUL}><path d={T.dark} fill={VOL.cloth} /></g>
        {/* mảng sáng: vành cong theo vai gần, liền từ thân sang tay áo */}
        {!pose.frontR && <g mask={`url(#${sil})`}><g transform={`${G1} ${G2}`}><path d={T.light} fill={VOL.light} opacity={VOL.lightOp} /></g></g>}
        <g mask={`url(#${limbs})`} style={MUL}>
          <g transform={G1}>
            {legsDown && <path d={[leg(r.legR, [0.55, 0.8, 0.6]), leg(r.legL, [0.1, 0.4, 0.2])].join(' ')} fill={VOL.cloth} />}
            {legsDown && <path d={T.hemCast} fill={VOL.clothSoft} />}
            <g transform={G2}>
              {!pose.frontL && pose.armL.b < 50 && <path d={T.sleeveDark} fill={VOL.cloth} />}
              {/* tay duỗi/thả mới có dải tối dọc tay; tay gập đưa lên thân (cầm máy, đan tay) dải dài sẽ lem lên tay và đồ cầm nên bỏ */}
              <path d={[!pose.frontR && pose.armR.b < 50 ? arm(r.armR, [0.62, 0.7, 0.6]) : '', !pose.frontL && pose.armL.b < 50 ? arm(r.armL, [0.25, 0.4, 0.3]) : ''].join(' ')} fill={VOL.skin} />
            </g>
          </g>
        </g>
        <g transform={`${G1} ${G2} rotate(${r.neck} -6 180)`}><HeadVolume view={view} /></g>
      </g>
    </g>
  );
};

const Label: React.FC<{ x: number; y: number; t: string; s?: number; w?: number; c?: string }> = ({ x, y, t, s = 20, w = 700, c = PALETTE.ink }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={s} fontWeight={w} fill={c} stroke="none">{t}</text>
);

/** Bảng so sánh 2D (đã chốt) ↔ 2.5D (thử). */
export const Nam25DBoard: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
    <rect width="1920" height="1080" fill="#f6f1e8" />
    <Label x={960} y={52} s={28} w={800} t="NAM — THỬ CHUYỂN 2D → 2.5D (GIỮ NGUYÊN TẠO HÌNH STYLE B)" />
    <Label x={960} y={82} s={16} w={400} c="#69706c" t="Cùng rig, cùng nét mặt/tóc/màu · chỉ thêm mảng sáng–tối tự vẽ theo khối, bóng tóc lên trán, bóng áo lên quần · không viền, không gradient/blur/rim" />
    <path d="M 960 110 V 760" stroke="#ded5c6" strokeWidth={1.8} strokeDasharray="6 6" />
    {([['three', 0, 'GÓC 3/4'], ['front', 960, 'CHÍNH DIỆN']] as const).map(([v, ox, name]) => (
      <g key={v} transform={`translate(${ox} 0)`}>
        <Label x={480} y={130} s={22} t={name} />
        <Label x={250} y={160} s={15} w={600} c="#707875" t="2D hiện tại (đã chốt)" />
        <Label x={710} y={160} s={15} w={600} c="#2f5d50" t="2.5D thử" />
        <Nam25D pose={{ ...STAND_POSE, view: v }} shirt={PALETTE.nam.sleepShirt} mood="sleepy" volume={false} x={250} y={180} scale={0.92} />
        <Nam25D pose={{ ...STAND_POSE, view: v }} shirt={PALETTE.nam.sleepShirt} mood="sleepy" x={710} y={180} scale={0.92} />
      </g>
    ))}
    <path d="M 60 790 H 1860" stroke="#ded5c6" strokeWidth={1.8} strokeDasharray="6 6" />
    {(['sleepy', 'shocked', 'suspicious'] as NamMood[]).map((m, i) => (
      <g key={m} transform={`translate(${330 + i * 630} 810)`}>
        <StudentTwinHead mood={m} x={-90} y={0} scale={0.82} id={`h2d-${m}`} />
        <Nam25DHead mood={m} x={110} y={0} scale={0.82} id={`h25-${m}`} />
        <Label x={-90} y={176} s={13} w={600} c="#707875" t="2D" />
        <Label x={110} y={176} s={13} w={600} c="#2f5d50" t="2.5D" />
        <Label x={10} y={204} s={16} t={({ sleepy: 'UỂ OẢI', shocked: 'HOẢNG SỢ', suspicious: 'DÈ CHỪNG' } as Record<string, string>)[m]} />
      </g>
    ))}
  </svg>
);
