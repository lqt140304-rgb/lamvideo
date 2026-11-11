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
  cloth: '#c3c7c9', // vải mặt tối ≈ 77% sáng
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
    hairLight: 'M -60 52 Q -50 34 -30 30 Q -14 27 -2 20 Q 4 8 14 2 Q 6 12 6 22 Q -10 32 -28 36 Q -46 40 -60 52 Z M 14 18 Q 34 14 46 30 Q 32 22 14 22 Z',
    temple: 'M 40 40 Q 54 52 56 76 L 57 110 Q 62 118 64 126 Q 52 120 49 104 Q 46 80 44 62 Z',
    ear: ['M -71 92 Q -64 86 -58 96 Q -55 112 -64 118 Q -60 104 -71 92 Z'],
    nose: 'M 12 124 Q 22 127 26 119 Q 27 128 15 130 Z',
  },
  front: {
    hairLight: 'M -66 52 Q -56 34 -36 30 Q -18 26 -4 18 Q 4 6 15 0 Q 8 12 8 22 Q -12 32 -32 36 Q -52 40 -66 52 Z M 16 18 Q 40 16 52 32 Q 36 24 16 22 Z',
    temple: 'M 44 44 Q 58 56 60 80 L 61 112 Q 58 130 50 142 Q 52 120 52 104 Q 50 80 46 60 Z',
    ear: ['M -80 94 Q -72 88 -66 98 Q -63 112 -72 118 Q -68 106 -80 94 Z'],
    earFar: 'M 62 88 Q 84 74 86 99 Q 87 121 62 125 Q 72 112 70 100 Q 68 92 62 88 Z',
    nose: 'M 2 114 Q 10 121 18 113 Q 16 122 6 121 Z',
  },
};

const useUid = (p: string) => `${p}-${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;

/** Mask trắng theo silhouette: render lại chính nhân vật, ép mọi phần thành trắng. */
const Silhouette: React.FC<{ id: string; cut?: string[]; children: React.ReactNode }> = ({ id, cut, children }) => (
  <mask id={id} maskUnits="userSpaceOnUse" x={-400} y={-200} width={800} height={1000}>
    <style>{`.${id} *{fill:#fff!important;stroke:#fff!important;opacity:1!important}.${id} [data-shadow]{display:none}`}</style>
    <g className={id}>{children}</g>
    {cut?.map((d) => <path key={d} d={d} fill="#000" />)}
  </mask>
);

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
      <path d={m.hairLight} fill={VOL.hairLight} clipPath={`url(#${hair})`} />
      <g mask={`url(#${skin})`} style={MUL}>
        {/* bóng tóc đổ xuống trán: chính mảng tóc, lệch theo hướng sáng */}
        <path d={HAIR[view]} transform="translate(4 7)" fill={VOL.skin} />
        {/* mặt bên phía xa (thái dương), dừng trên gò má để không thành dải râu */}
        <path d={m.temple} fill={VOL.skin} />
        <path d={m.nose} fill={VOL.skin} />
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
    dark: 'M 22 186 Q 36 212 36 248 Q 32 300 34 380 L 140 380 L 140 170 Z',
    light: 'M -110 230 Q -96 196 -66 184 Q -46 177 -26 177 Q -50 186 -64 200 Q -78 214 -84 236 Q -90 262 -92 290 L -110 290 Z',
    sleeveDark: 'M 74 205 L 120 205 L 120 292 L 80 292 Z',
    hemCast: 'M -64 350 Q -23 372 12 358 Q 38 366 64 344 L 64 354 Q 40 375 12 366 Q -24 382 -64 360 Z',
  },
  front: {
    dark: 'M 30 186 Q 42 214 40 250 Q 36 300 38 380 L 140 380 L 140 170 Z',
    light: 'M -110 230 Q -96 196 -66 184 Q -46 178 -24 178 Q -48 187 -62 201 Q -76 216 -82 238 Q -88 262 -90 290 L -110 290 Z',
    sleeveDark: 'M 80 205 L 120 205 L 120 292 L 84 292 Z',
    hemCast: 'M -64 348 Q -30 368 0 360 Q 30 368 64 348 L 64 357 Q 30 377 0 368 Q -30 377 -64 357 Z',
  },
};

/** Nam 2.5D: Nam gốc + lớp mảng thể tích tự vẽ. Chỉ hỗ trợ tư thế đứng (3/4, chính diện) trong bản thử. */
export const Nam25D: React.FC<{ mood?: NamMood; shirt?: string; view?: View25; x?: number; y?: number; scale?: number; volume?: boolean }> = ({ mood = 'sleepy', shirt = PALETTE.nam.shirt, view = 'three', x = 0, y = 0, scale = 1, volume = true }) => {
  const pose: JointPose = { ...STAND_POSE, view };
  const body = <StudentTwinBody mood={mood} shirt={shirt} pose={pose} />;
  const sil = useUid('v25sil'), limbs = useUid('v25limb'), torso = useUid('v25torso');
  const r = solveRig(pose);
  const dy = r.dy;
  const T = TORSO_MASS[view];
  const shirt2 = torsoOf(view);
  // Tay: tối từ cửa tay áo tới bàn tay. Tay gần (R) chỉ một dải hẹp mép trong; tay xa (L) rộng hơn.
  const arm = (c: typeof r.armR, inner: [number, number, number]) =>
    limbShade([lerpP(c.root, c.mid, 0.58), c.mid, lerpP(c.mid, c.end, 1.42)].map((p) => down(p, dy)) as [P, P, P], [17, 16, 15], inner, 1.6);
  // Ống quần: hông → gối → cổ chân; mép trong thu hẹp ở gối như nếp vải. Ống xa gần như cả mặt bên.
  const leg = (c: typeof r.legR, inner: [number, number, number]) =>
    limbShade([down(c.root, dy + 8), down(c.mid, dy), down(c.end, dy - 8)], [31, 26, 28], inner, 1.08); // dừng trên gấu quần, không phủ bàn chân
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {body}
      {volume && (
        <g stroke="none" data-volume="body">
          <defs>
            <Silhouette id={sil}>{body}</Silhouette>
            <Silhouette id={limbs} cut={shirt2}>{body}</Silhouette>
            <clipPath id={torso}>{shirt2.map((d) => <path key={d} d={d} />)}</clipPath>
          </defs>
          {/* thân áo: mặt tối phía xa (multiply) + mảng sáng vai gần, cắt trong áo */}
          <g clipPath={`url(#${torso})`} style={MUL}><path d={T.dark} fill={VOL.cloth} /></g>
          {/* mảng sáng: một vành cong theo vai gần, chạy liền từ thân sang tay áo */}
          <g mask={`url(#${sil})`}><path d={T.light} fill={VOL.light} opacity={VOL.lightOp} /></g>
          <g mask={`url(#${limbs})`} style={MUL}>
            <path d={T.sleeveDark} fill={VOL.cloth} />
            <path d={[arm(r.armR, [0.45, 0.5, 0.4]), arm(r.armL, [-0.1, 0.05, 0])].join(' ')} fill={VOL.skin} />
            <path d={[leg(r.legR, [0.35, 0.62, 0.4]), leg(r.legL, [-0.25, 0.05, -0.15])].join(' ')} fill={VOL.cloth} />
            {/* vạt áo đổ bóng xuống quần: một dải tự vẽ bám mép vạt */}
            <path d={T.hemCast} fill={VOL.cloth} />
          </g>
          <g transform={`translate(0 ${dy})`}><HeadVolume view={view} /></g>
        </g>
      )}
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
        <Nam25D view={v} shirt={PALETTE.nam.sleepShirt} volume={false} x={250} y={180} scale={0.92} />
        <Nam25D view={v} shirt={PALETTE.nam.sleepShirt} x={710} y={180} scale={0.92} />
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
