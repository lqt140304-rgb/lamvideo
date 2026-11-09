import React from 'react';
import { limbContour } from '../../../../what-if-studio/src/engine/anatomy';
import { clamp } from '../../../../what-if-studio/src/engine/anim';

// ============================================================================
// HỒ SƠ 02: NGƯỜI LÀM THAY — BỘ ASSET NHÂN VẬT CHUẨN MẪU B (SVG HỮU CƠ)
// ============================================================================
// 1. NAM: Sinh viên chính, áo thun xanh rêu (#5c7a70), quần xám (#515451),
//    dép lê (#425850), nốt ruồi sát đuôi mày trái, vai mềm tự nhiên.
// 2. NGƯỜI KIA (BẢN SAO): 100% GIỐNG HOÀN TOÀN NAM:
//    Cùng khuôn mặt, nốt ruồi đuôi mày, cùng tóc (có lọn xoăn trên đỉnh theo Mẫu B),
//    cùng áo xanh rêu, quần xám và dáng tay rõ ràng, không bị chìm hay ẩn sau áo.
// 3. TÙNG: Bạn cùng phòng năng động, tóc ngắn tỉa mảng khối sắc nét Style B,
//    mặc đồ thể thao bóng đá (áo jersey xanh navy số 7, quần đùi sọc trắng, vớ cao, giày turf).
// ============================================================================

export const PALETTE = {
  ink: '#282b2b',
  skin: '#dbad82',
  skinShadow: '#bd8968',
  eyeWhite: '#f8f3e7',
  mouthDark: '#513331',
  teeth: '#faf3e5',
  tongue: '#bf7b73',
  shadowFloor: '#d6c9b6',

  // Nam & Bản sao (100% dùng chung hệ màu và trang phục)
  nam: {
    hair: '#292a29',
    shirt: '#5c7a70',
    pants: '#515451',
    slippers: '#425850',
    sole: '#393e3c',
  },

  // Tùng (Đồ thể thao đá bóng)
  tung: {
    hair: '#252728',
    jersey: '#1d4e89',
    jerseyTrim: '#f8f3e7',
    jerseyInner: '#142842',
    number: '#f8f3e7',
    shorts: '#142842',
    shortsStripe: '#f8f3e7',
    socks: '#1d4e89',
    socksStripe: '#f8f3e7',
    cleats: '#f8f3e7',
    cleatsAccent: '#d94a38',
    cleatsSole: '#1a1c1e',
  },
};

// ----------------------------------------------------------------------------
// 1. HEAD CỦA NAM & BẢN SAO (DÙNG CHUNG 100%, CÓ LỌN XOĂN TRÊN ĐỈNH THEO MẪU B)
// ----------------------------------------------------------------------------
export type NamMood = 'sleepy' | 'shocked' | 'suspicious' | 'calm' | 'neutral_smile' | 'eerie_smirk';

export const StudentTwinHead: React.FC<{
  mood?: NamMood;
  id?: string;
  x?: number;
  y?: number;
  scale?: number;
}> = ({ mood = 'sleepy', id = 'twin-head', x = 0, y = 0, scale = 1 }) => {
  const isShocked = mood === 'shocked';
  const isSuspicious = mood === 'suspicious';
  const isCalm = mood === 'calm';
  const isSmiling = mood === 'neutral_smile';
  const isEerie = mood === 'eerie_smirk';

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={PALETTE.ink} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round">
      {/* Cổ & Khối bóng đổ cằm */}
      <path d="M -28 141 L -28 182 Q -8 201 16 181 L 19 138" fill={PALETTE.skin} />
      <path d="M -26 155 Q -8 171 17 153 L 16 175 Q -7 187 -27 174 Z" fill={PALETTE.skinShadow} stroke="none" />

      {/* Hộp sọ & Đường cằm bo tròn hữu cơ (chuẩn mẫu B) */}
      <path d="M -55 60 Q -50 25 -9 25 Q 42 24 53 66 L 55 111 Q 72 130 54 146 Q 38 166 6 165 Q -30 163 -45 138 L -58 100 Z" fill={PALETTE.skin} />

      {/* Tai trái */}
      <path d="M -47 87 Q -75 72 -77 99 Q -78 121 -50 125" fill={PALETTE.skin} />
      <path d="M -65 99 Q -57 93 -53 106" fill="none" strokeWidth={2.4} />

      {/* TÓC NAM & BẢN SAO: Bo tròn hữu cơ theo hộp sọ, có lọn tóc xoăn trên đỉnh theo Mẫu B */}
      <path
        d="M -51 92 Q -65 79 -61 52 L -71 51 Q -58 27 -38 28 L -43 18 Q -20 21 -7 14 Q -10 -5 15 -5 Q 22 -4 24 4 Q 7 0 8 16 Q 40 13 51 37 L 62 43 L 48 59 Q 34 54 22 43 Q 15 63 -4 67 L -1 52 Q -20 75 -41 74 L -43 95 Z"
        fill={PALETTE.nam.hair}
      />

      {/* Vùng mắt */}
      <defs>
        <clipPath id={`${id}-eyes`}>
          <ellipse cx={-11} cy={99} rx={17} ry={isShocked ? 23 : 15} />
          <ellipse cx={30} cy={96} rx={15} ry={isShocked ? 22 : 14} />
        </clipPath>
      </defs>

      {/* Tròng trắng mắt */}
      <ellipse cx={-11} cy={99} rx={17} ry={isShocked ? 23 : 15} fill={PALETTE.eyeWhite} strokeWidth={2.5} />
      <ellipse cx={30} cy={96} rx={15} ry={isShocked ? 22 : 14} fill={PALETTE.eyeWhite} strokeWidth={2.5} />

      {/* Con ngươi & Nếp mí */}
      <g clipPath={`url(#${id}-eyes)`}>
        <ellipse
          cx={isSuspicious ? -4 : isEerie ? -6 : -8}
          cy={isShocked ? 100 : 102}
          rx={isShocked ? 3.3 : 4}
          ry={isShocked ? 4.8 : 5.5}
          fill={PALETTE.ink}
          stroke="none"
        />
        <ellipse
          cx={isSuspicious ? 36 : isEerie ? 34 : 32}
          cy={isShocked ? 97 : 99}
          rx={isShocked ? 3.3 : 4}
          ry={isShocked ? 4.8 : 5.5}
          fill={PALETTE.ink}
          stroke="none"
        />
        {/* Điểm sáng bắt sáng */}
        <circle cx={isSuspicious ? -3 : -7} cy={isShocked ? 98 : 100} r={1.2} fill="#ffffff" stroke="none" />
        <circle cx={isSuspicious ? 37 : 33} cy={isShocked ? 95 : 97} r={1.2} fill="#ffffff" stroke="none" />

        {/* Nếp mí */}
        {!isShocked && (
          <path
            d={
              isSuspicious
                ? 'M -33 77 L 9 100 L 49 76 L 49 61 L -33 61 Z'
                : isCalm || isSmiling || isEerie
                ? 'M -33 73 L 51 73 L 51 86 L -33 87 Z'
                : 'M -33 70 L 51 70 L 51 91 L -33 99 Z'
            }
            fill={PALETTE.skin}
            strokeWidth={2.5}
          />
        )}
      </g>

      {/* Lông mày mực đậm chuẩn mẫu B (5.5px) */}
      <path
        d={
          isShocked
            ? 'M -29 69 Q -16 58 -2 64 M 17 62 Q 32 54 43 64'
            : isSuspicious
            ? 'M -28 78 L 2 87 M 19 79 L 44 68'
            : isEerie
            ? 'M -28 75 Q -12 70 2 73 M 19 72 Q 33 65 44 68'
            : isCalm || isSmiling
            ? 'M -28 76 Q -12 74 2 76 M 19 74 Q 33 71 44 73'
            : 'M -28 78 Q -12 74 2 75 M 19 72 Q 33 69 44 70'
        }
        fill="none"
        strokeWidth={5.5}
      />

      {/* NỐT RUỒI SÁT ĐUÔI MÀY TRÁI (CHI TIẾT THEN CHỐT CỦA KỊCH BẢN) */}
      <circle cx={-32} cy={isShocked ? 74 : 82} r={2.2} fill={PALETTE.ink} stroke="none" />

      {/* Mũi tròn tối giản */}
      <path d="M 18 106 Q 30 108 26 117 L 17 119" fill="none" strokeWidth={2.5} />

      {/* Miệng */}
      {isShocked ? (
        <g>
          <path d="M -3 139 Q 1 121 16 126 Q 31 129 30 148 Q 11 139 -3 148 Z" fill={PALETTE.mouthDark} />
          <path d="M 4 129 Q 13 125 22 132 L 22 137 L 4 135 Z" fill={PALETTE.teeth} stroke="none" />
          <path d="M 4 145 Q 12 138 23 146" stroke={PALETTE.tongue} strokeWidth={3} />
        </g>
      ) : isSuspicious ? (
        <path d="M -6 141 Q 9 136 22 140" fill="none" strokeWidth={2.8} />
      ) : isEerie ? (
        <path d="M -2 143 Q 12 135 28 138" fill="none" strokeWidth={3} />
      ) : isSmiling ? (
        <path d="M 0 142 Q 13 147 26 142" fill="none" strokeWidth={2.8} />
      ) : isCalm ? (
        <path d="M 2 143 Q 13 144 24 143" fill="none" strokeWidth={2.6} />
      ) : (
        <path d="M 8 139 Q 20 131 25 144 Q 15 149 8 145 Z" fill={PALETTE.mouthDark} strokeWidth={2.5} />
      )}
    </g>
  );
};

// ----------------------------------------------------------------------------
// 1B. RIG KHỚP DÙNG CHUNG (NAM, BẢN SAO, TÙNG)
// Tay/chân đặt tên theo giải phẫu: R = phía TRÁI màn hình (bên gần máy khi nhân vật quay 3/4 sang phải), L = phía phải màn hình.
// ----------------------------------------------------------------------------
type P = { x: number; y: number };
// a: góc đoạn trên (dương = đưa ra trước, về bên phải màn hình), b: độ gập khớp giữa (luôn ≥ 0).
// rot = -1: xoay trong cánh tay để cẳng tay gập vào thân (chỉ dùng cho tay L, ví dụ đút túi, ôm chén).
export type Limb = { a: number; b: number; rot?: 1 | -1 };
export type HandKind = 'rest' | 'open' | 'fist' | 'hold' | 'none';
export type JointPose = {
  tilt: number; neck: number;
  armR: Limb; armL: Limb; legR: Limb; legL: Limb;
  wristR: number; wristL: number; handR: HandKind; handL: HandKind;
  footR: number; footL: number; // độ nghiêng bàn chân so với mặt sàn
  frontR: boolean; frontL: boolean; // tay vẽ đè lên thân
  x: number; y: number; planted: boolean; // planted: tự hạ/nâng hông để bàn chân thấp nhất chạm sàn
};

export const BONE = { upperArm: 80, foreArm: 68, thigh: 105, shin: 105 };
export const LIMIT: Record<'tilt' | 'neck' | 'shoulder' | 'elbow' | 'wrist' | 'hip' | 'knee' | 'ankle', [number, number]> = {
  tilt: [-30, 40], neck: [-35, 35],
  shoulder: [-130, 180], // gộp cả dang ngang và đưa trước/sau vì rig vẽ trên một mặt phẳng
  elbow: [0, 150], wrist: [-70, 70],
  hip: [-35, 125], knee: [0, 150], ankle: [-35, 35],
};
const SHOULDER = { R: { x: -68, y: 232 }, L: { x: 62, y: 232 } };
const HIP = { R: { x: -29, y: 345 }, L: { x: 31, y: 345 } };
const PELVIS = { x: 0, y: 345 };
const NECK = { x: -6, y: 180 };
const ANKLE_Y = 555;
const ARM_REST = { R: 3, L: -9 }; // tay buông hơi rời thân

const lim = (v: number, k: keyof typeof LIMIT) => clamp(v, LIMIT[k][0], LIMIT[k][1]);
const step = (p: P, deg: number, len: number): P => ({ x: p.x - Math.sin((deg * Math.PI) / 180) * len, y: p.y + Math.cos((deg * Math.PI) / 180) * len });
const mix = (a: P, b: P, t: number): P => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

/** Tính vị trí khớp. Tay nằm trong hệ thân (xoay theo tilt quanh chậu), chân trong hệ gốc; mọi góc đều bị chặn theo LIMIT. */
export const solveRig = (pose: JointPose) => {
  const arm = (root: P, l: Limb, rest: number) => {
    const a1 = rest - lim(l.a, 'shoulder');
    const a2 = a1 + (l.rot === -1 ? 1 : -1) * lim(l.b, 'elbow');
    const mid = step(root, a1, BONE.upperArm);
    return { root, mid, end: step(mid, a2, BONE.foreArm), deg: a2 };
  };
  const leg = (root: P, l: Limb) => {
    const a1 = -lim(l.a, 'hip');
    const a2 = a1 + lim(l.b, 'knee');
    const mid = step(root, a1, BONE.thigh);
    return { root, mid, end: step(mid, a2, BONE.shin), deg: a2 };
  };
  const legR = leg(HIP.R, pose.legR);
  const legL = leg(HIP.L, pose.legL);
  const foot = (pitch: number, shin: number) => clamp(pitch, shin + LIMIT.ankle[0], shin + LIMIT.ankle[1]);
  return {
    armR: arm(SHOULDER.R, pose.armR, ARM_REST.R),
    armL: arm(SHOULDER.L, pose.armL, ARM_REST.L),
    legR, legL,
    footR: foot(pose.footR, legR.deg), footL: foot(pose.footL, legL.deg),
    dy: pose.y + (pose.planted ? ANKLE_Y - Math.max(legR.end.y, legL.end.y) : 0),
    tilt: lim(pose.tilt, 'tilt'), neck: lim(pose.neck, 'neck'),
  };
};

export const STAND_POSE: JointPose = {
  tilt: 0, neck: 0,
  armR: { a: 2, b: 8 }, armL: { a: 2, b: 8, rot: -1 },
  legR: { a: -2, b: 0 }, legL: { a: 2, b: 0 },
  wristR: 0, wristL: 0, handR: 'rest', handL: 'rest',
  footR: 0, footL: 0, frontR: false, frontL: false,
  x: 0, y: 0, planted: true,
};
// Tư thế mẫu cho các nhịp cần diễn ở Hồ sơ 2; chỉnh tiếp bằng cách trộn đè { ...STAND_POSE, ... }.
export const TWIN_POSES: Record<'stand' | 'sit' | 'stride' | 'crouch' | 'reach' | 'holdBowl' | 'stop', JointPose> = {
  stand: STAND_POSE,
  sit: { ...STAND_POSE, tilt: 6, armR: { a: -28, b: 8 }, armL: { a: 34, b: 42, rot: -1 }, legR: { a: 92, b: 100 }, legL: { a: 66, b: 112 }, handR: 'open', wristR: -40 },
  stride: { ...STAND_POSE, tilt: 4, armR: { a: -20, b: 16 }, armL: { a: 24, b: 28 }, legR: { a: 26, b: 6 }, legL: { a: -20, b: 24 } },
  crouch: { ...STAND_POSE, tilt: 24, neck: -14, armR: { a: 30, b: 40 }, armL: { a: 30, b: 40, rot: -1 }, legR: { a: 112, b: 130 }, legL: { a: 96, b: 124 }, frontR: true },
  reach: { ...STAND_POSE, tilt: 20, neck: -8, armR: { a: 66, b: 14 }, handR: 'open', frontR: true, legR: { a: 26, b: 30 }, legL: { a: 8, b: 12 } },
  holdBowl: { ...STAND_POSE, armR: { a: 20, b: 75 }, armL: { a: 14, b: 100, rot: -1 }, handR: 'hold', handL: 'hold', frontR: true, frontL: true },
  stop: { ...STAND_POSE, tilt: -5, neck: 6, armR: { a: -78, b: 8 }, armL: { a: 72, b: 34 }, handR: 'open', handL: 'open', frontL: true, legR: { a: 8, b: 16 }, legL: { a: -12, b: 8 } },
};

const circle = (p: P, r: number) => `M ${p.x - r} ${p.y} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
/** Một khối liền: vẽ nền mực rồi tô màu đè lên, nên khớp gập bao nhiêu cũng không có đường cắt ngang bên trong. */
const Blob: React.FC<{ d: string[]; fill: string; w?: number }> = ({ d, fill, w = 4 }) => (
  <g>
    {d.map((s, i) => <path key={i} d={s} fill={PALETTE.ink} stroke={PALETTE.ink} strokeWidth={w * 2} strokeLinejoin="round" />)}
    {d.map((s, i) => <path key={`f${i}`} d={s} fill={fill} stroke="none" />)}
  </g>
);
/** Nếp gấp ở mặt trong khớp; thẳng thì không có nếp. */
const crease = (c: { root: P; mid: P; end: P }, r: number) => {
  const u = { x: c.root.x - c.mid.x, y: c.root.y - c.mid.y };
  const v = { x: c.end.x - c.mid.x, y: c.end.y - c.mid.y };
  const lu = Math.hypot(u.x, u.y), lv = Math.hypot(v.x, v.y);
  const b = { x: u.x / lu + v.x / lv, y: u.y / lu + v.y / lv };
  const lb = Math.hypot(b.x, b.y);
  if (lb < 1) return null; // chỉ hiện khi gập trên ~60°
  const n = { x: b.x / lb, y: b.y / lb };
  return <path d={`M ${c.mid.x + n.x * r} ${c.mid.y + n.y * r} L ${c.mid.x + n.x * r * 0.25} ${c.mid.y + n.y * r * 0.25}`} fill="none" stroke={PALETTE.ink} strokeWidth={2.5} strokeLinecap="round" />;
};

// Bàn tay kiểu Mẫu B: ngón gộp thành một khối, chỉ lộ gợn đầu ngón. Thứ tự từ phía ngón cái.
const HAND_SHAPE: Record<Exclude<HandKind, 'none'>, { base: number[]; len: [number, number][]; r: [number, number, number]; fan: number; curl: number; thumb: [P, P] }> = {
  open: { base: [9.6, 3.2, -3.2, -9.6], len: [[11, 10], [12, 10], [11, 9], [9, 8]], r: [5, 4.7, 4.2], fan: 12, curl: 8, thumb: [{ x: 20, y: 10 }, { x: 29, y: 20 }] },
  rest: { base: [8, 0, -8], len: [[10, 9], [12, 10], [10, 8]], r: [6.4, 6, 5.6], fan: 4, curl: 12, thumb: [{ x: 15, y: 12 }, { x: 15, y: 22 }] },
  hold: { base: [8, 0, -8], len: [[8, 7], [9, 7], [8, 6]], r: [6.4, 6, 5.6], fan: 3, curl: 52, thumb: [{ x: 17, y: 11 }, { x: 10, y: 22 }] },
  fist: { base: [8, 0, -8], len: [[6, 4], [6, 4], [6, 4]], r: [6.4, 6, 5.6], fan: 0, curl: 75, thumb: [{ x: 13, y: 14 }, { x: 3, y: 20 }] },
};
/** Hình bàn tay tính sẵn trong hệ cánh tay để gộp chung một khối với cẳng tay, không có đường cắt ở cổ tay. s = phía ngón cái. */
const handShapes = (at: P, deg: number, s: 1 | -1, kind: HandKind): string[] => {
  if (kind === 'none') return [];
  const { base, len, r, fan, curl, thumb } = HAND_SHAPE[kind];
  const c = Math.cos((deg * Math.PI) / 180), n = Math.sin((deg * Math.PI) / 180);
  const S = 1.12;
  const T = (p: P): P => ({ x: at.x + (p.x * c - p.y * n) * S, y: at.y + (p.x * n + p.y * c) * S });
  const fr: [number, number, number] = [r[0] * S, r[1] * S, r[2] * S];
  const k = Math.cos((curl * Math.PI) / 180), k1 = Math.cos((curl * 0.6 * Math.PI) / 180);
  const fingers = base.flatMap((x, i) => {
    const a = s * fan * ((base.length - 1) / 2 - i) * 0.66;
    const root = { x: s * x, y: 20 };
    const mid = step(root, -a, len[i][0] * k1);
    const end = step(mid, -a, Math.max(2, len[i][1] * k));
    return [limbContour({ root: T(root), mid: T(mid), end: T(end) }, fr), circle(T(end), fr[2]), circle(T(mid), fr[1])];
  });
  const thumbEnd = T({ x: s * thumb[1].x, y: thumb[1].y });
  const thumbMid = T({ x: s * thumb[0].x, y: thumb[0].y });
  return [
    limbContour({ root: T({ x: 0, y: -3 }), mid: T({ x: 0, y: 10 }), end: T({ x: 0, y: 22 }) }, [13.5, 17, 17]),
    ...fingers,
    limbContour({ root: T({ x: s * 8, y: 4 }), mid: thumbMid, end: thumbEnd }, [8, 6.8, 5.6]), circle(thumbEnd, 5.6), circle(thumbMid, 6.5),
  ];
};

export type Outfit = {
  shirt: string; torso: string; hem: [number, number][]; sleeveEnd: number; cuff?: string;
  pants: string; pantsLen: 'long' | 'short'; stripe?: string;
  socks?: { color: string; stripe: string };
  Foot: React.FC<{ side: 'R' | 'L' }>;
  detail: React.ReactNode;
};
const normalOf = (a: P, b: P): P => { const l = Math.max(0.001, Math.hypot(b.x - a.x, b.y - a.y)); return { x: -(b.y - a.y) / l, y: (b.x - a.x) / l }; };
const across = (a: P, b: P, t: number, r: number, off = 0) => { const p = mix(a, b, t), n = normalOf(a, b); return `M ${p.x + n.x * (off - r)} ${p.y + n.y * (off - r)} L ${p.x + n.x * (off + r)} ${p.y + n.y * (off + r)}`; };

/** Mép gấu hơi cong để gấu quần, tay áo không bị cắt thẳng. */
const softEnd = (prev: P, end: P, w: number, bulge: number) => {
  const n = normalOf(prev, end);
  const l = Math.max(0.001, Math.hypot(end.x - prev.x, end.y - prev.y));
  const t = { x: (end.x - prev.x) / l, y: (end.y - prev.y) / l };
  return `M ${end.x + n.x * w} ${end.y + n.y * w} Q ${end.x + t.x * bulge * 2} ${end.y + t.y * bulge * 2} ${end.x - n.x * w} ${end.y - n.y * w} Z`;
};
const alongSide = (a: P, b: P, off: number) => { const n = normalOf(a, b), p = mix(a, b, 0.1), q = mix(a, b, 0.7); return `M ${p.x + n.x * off} ${p.y + n.y * off} L ${q.x + n.x * off} ${q.y + n.y * off}`; };
/** Nếp vải trôi theo ống quần: toạ độ (t dọc gối → mắt cá, v lệch ngang). */
const FOLD = { R: [[-0.12, 22], [-0.03, 0], [0.15, -5]], L: [[0.55, 18], [0.47, 5], [0.5, -9]] };
const foldPath = (knee: P, ankle: P, side: 'R' | 'L') => {
  const n = normalOf(knee, ankle);
  const [a, b, c] = FOLD[side].map(([t, v]) => { const p = mix(knee, ankle, t); return `${p.x + n.x * v} ${p.y + n.y * v}`; });
  return `M ${a} Q ${b} ${c}`;
};

const Leg: React.FC<{ c: ReturnType<typeof solveRig>['legR']; side: 'R' | 'L'; foot: number; o: Outfit }> = ({ c, side, foot, o }) => {
  const { root: hip, mid: knee, end: ankle } = c;
  const long = o.pantsLen === 'long';
  const cloth = long ? { root: hip, mid: knee, end: mix(knee, ankle, 0.93) } : { root: hip, mid: mix(hip, knee, 0.4), end: mix(hip, knee, 0.75) };
  const widths: [number, number, number] = long ? [31, 26, 28] : [31, 31, 32];
  return (
    <g>
      <g transform={`translate(${ankle.x} ${ankle.y}) rotate(${foot})`}><o.Foot side={side} /></g>
      <Blob fill={PALETTE.skin} d={[limbContour({ root: hip, mid: knee, end: ankle }, [24, 19, 15]), circle(knee, 19), circle(ankle, 15)]} />
      {o.socks && (
        <g>
          <Blob fill={o.socks.color} d={[limbContour({ root: mix(knee, ankle, 0.25), mid: mix(knee, ankle, 0.6), end: ankle }, [17, 15.5, 15]), circle(ankle, 15)]} />
          <path d={`${across(knee, ankle, 0.34, 15)} ${across(knee, ankle, 0.42, 15)}`} fill="none" stroke={o.socks.stripe} strokeWidth={2.6} />
        </g>
      )}
      <Blob fill={o.pants} d={[limbContour(cloth, widths), circle(hip, 30), softEnd(cloth.mid, cloth.end, widths[2], 3), ...(long ? [circle(knee, 26)] : [])]} />
      {long && crease(c, 22)}
      {long && <path d={foldPath(knee, ankle, side)} fill="none" stroke={PALETTE.ink} strokeWidth={2.5} strokeLinecap="round" />}
      {o.stripe && <path d={alongSide(hip, knee, side === 'R' ? 30 : -30)} fill="none" stroke={o.stripe} strokeWidth={3.5} />}
    </g>
  );
};

const armShapes = (c: ReturnType<typeof solveRig>['armR']) => [limbContour(c, [19, 16, 13.5]), circle(c.mid, 16), circle(c.root, 19)];
const sleeveShapes = (c: ReturnType<typeof solveRig>['armR'], o: Outfit) => {
  const end = mix(c.root, c.mid, o.sleeveEnd);
  const mid = mix(c.root, end, 0.55);
  return [limbContour({ root: c.root, mid, end }, [25, 27, 27]), circle(c.root, 25), softEnd(mid, end, 27, 3)];
};
/** Tay đưa trước ngực: xoá cung vai phía trong để tay áo liền với thân áo. */
const ShoulderPatch: React.FC<{ c: ReturnType<typeof solveRig>['armR']; fill: string }> = ({ c, fill }) => (
  <circle cx={c.root.x + (c.root.x < 0 ? 15 : -15)} cy={c.root.y + 5} r={25} fill={fill} stroke="none" />
);
const Cuff: React.FC<{ c: ReturnType<typeof solveRig>['armR']; o: Outfit }> = ({ c, o }) => (o.cuff ? <path d={across(c.root, c.mid, o.sleeveEnd * 0.9, 26)} fill="none" stroke={o.cuff} strokeWidth={3.5} /> : null);

/** Vạt áo giữ phương thẳng đứng trong khi thân áo nghiêng, nên cúi người không làm lộ mông ra ngoài áo. */
const hemDrape = (o: Outfit, tilt: number) => {
  const c = Math.cos((-tilt * Math.PI) / 180), n = Math.sin((-tilt * Math.PI) / 180);
  const [a, b, d, e, g, h, i] = o.hem.map(([x, y]) => { const u = x - PELVIS.x, v = y - PELVIS.y; return `${PELVIS.x + u * c - v * n} ${PELVIS.y + u * n + v * c}`; });
  return `M ${a} L ${b} L ${d} Q ${e} ${g} Q ${h} ${i} Z`;
};

/** Ghép nhân vật từ khung xương: bàn chân → chân → tay sau → áo → đầu → tay trước. */
export const Rigged: React.FC<{ pose: JointPose; outfit: Outfit; head: React.ReactNode; x: number; y: number; scale: number }> = ({ pose, outfit: o, head, x, y, scale }) => {
  const r = solveRig(pose);
  const crotch = 414 - 60 * clamp(Math.max(Math.abs(pose.legR.a), Math.abs(pose.legL.a)) / 70); // đáy quần kéo lên khi đùi đưa ra
  const arm = (c: typeof r.armR, s: 1 | -1, wrist: number, kind: HandKind) => (
    <g>
      <Blob fill={PALETTE.skin} d={[...armShapes(c), ...handShapes(c.end, c.deg + lim(wrist, 'wrist'), s, kind)]} />
    </g>
  );
  const armR = arm(r.armR, 1, pose.wristR, pose.handR);
  const armL = arm(r.armL, -1, pose.wristL, pose.handL);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx={(r.legR.end.x + r.legL.end.x) / 2 + pose.x} cy={589 + pose.y} rx={103} ry={13} fill={PALETTE.shadowFloor} stroke="none" />
      <g transform={`translate(${pose.x} ${r.dy})`}>
        <Blob fill={o.pants} d={[`M -30 335 H 32 L 1 ${crotch} Z`]} />
        <Leg c={r.legL} side="L" foot={r.footL} o={o} />
        <Leg c={r.legR} side="R" foot={r.footR} o={o} />
        <path d={`M -46 318 H 48 V 350 H 28 L 1 ${crotch - 7} L -26 350 H -46 Z`} fill={o.pants} stroke="none" />
        <g transform={`rotate(${r.tilt} ${PELVIS.x} ${PELVIS.y})`}>
          {!pose.frontL && armL}
          {!pose.frontR && armR}
          <Blob fill={o.shirt} d={[o.torso, hemDrape(o, r.tilt), ...(pose.frontR ? [] : sleeveShapes(r.armR, o)), ...(pose.frontL ? [] : sleeveShapes(r.armL, o))]} />
          {!pose.frontR && <Cuff c={r.armR} o={o} />}
          {!pose.frontL && <Cuff c={r.armL} o={o} />}
          <g stroke={PALETTE.ink}>{o.detail}</g>
          <g transform={`rotate(${r.neck} ${NECK.x} ${NECK.y})`}>{head}</g>
          {pose.frontL && <g>{armL}<Blob fill={o.shirt} d={sleeveShapes(r.armL, o)} /><ShoulderPatch c={r.armL} fill={o.shirt} /><Cuff c={r.armL} o={o} /></g>}
          {pose.frontR && <g>{armR}<Blob fill={o.shirt} d={sleeveShapes(r.armR, o)} /><ShoulderPatch c={r.armR} fill={o.shirt} /><Cuff c={r.armR} o={o} /></g>}
        </g>
      </g>
    </g>
  );
};

// Bàn chân vẽ theo nét cũ của mẫu B, gốc đặt tại mắt cá.
const Slipper: React.FC<{ side: 'R' | 'L' }> = ({ side }) => (
  <g transform={side === 'R' ? 'translate(33 -555)' : 'translate(-35 -555)'} stroke={PALETTE.ink} strokeWidth={4}>
    {side === 'R' ? (
      <>
        <path d="M -54 561 Q -80 568 -78 585 Q -53 597 -5 586 L -7 575 Q -20 560 -54 561 Z" fill={PALETTE.skin} />
        <path d="M -78 583 Q -45 593 -6 583 L -6 590 Q -43 601 -79 590 Z" fill={PALETTE.nam.sole} strokeWidth={2.5} />
        <path d="M -64 565 Q -38 553 -17 567 L -12 579 Q -39 564 -70 580 Z" fill={PALETTE.nam.slippers} strokeWidth={2.5} />
      </>
    ) : (
      <>
        <path d="M 23 561 Q 44 559 67 568 Q 91 571 89 584 Q 57 596 15 585 L 13 573 Z" fill={PALETTE.skin} />
        <path d="M 15 583 Q 56 591 89 581 L 90 588 Q 54 600 15 591 Z" fill={PALETTE.nam.sole} strokeWidth={2.5} />
        <path d="M 26 563 Q 52 559 71 573 L 75 583 Q 49 568 20 578 Z" fill={PALETTE.nam.slippers} strokeWidth={2.5} />
      </>
    )}
  </g>
);

const TWIN_OUTFIT: Outfit = {
  shirt: PALETTE.nam.shirt, sleeveEnd: 0.5, hem: [[-52, 322], [50, 322], [63, 348], [38, 366], [12, 358], [-23, 372], [-64, 354]],
  torso: 'M -26 177 Q -60 181 -86 212 L -60 262 Q -66 312 -62 352 Q -23 370 12 356 Q 38 364 62 346 Q 56 304 54 262 L 80 212 Q 66 192 16 178 Q -7 196 -26 177 Z',
  pants: PALETTE.nam.pants, pantsLen: 'long', Foot: Slipper,
  detail: <path d="M -26 179 Q -23 203 -1 203 Q 14 201 21 183 M -55 218 Q -53 241 -52 262 M 56 219 L 58 257 M -45 316 Q -19 333 15 320 M 15 340 Q 36 343 48 334" fill="none" strokeWidth={2.5} />,
};

export const StudentTwinBody: React.FC<{
  mood?: NamMood;
  x?: number;
  y?: number;
  scale?: number;
  pose?: JointPose;
  id?: string;
}> = ({ mood = 'sleepy', x = 0, y = 0, scale = 1, pose = STAND_POSE, id = 'twin-full-body' }) => (
  <Rigged pose={pose} outfit={TWIN_OUTFIT} x={x} y={y} scale={scale} head={<StudentTwinHead mood={mood} id={id} />} />
);

// ----------------------------------------------------------------------------
// 2. TÙNG — ĐỒ THỂ THAO ĐÁ BÓNG & TÓC NGẮN TỈA MẢNG KHỐI STYLE B
// ----------------------------------------------------------------------------
export type TungMood = 'annoyed' | 'focused' | 'normal';

export const TungHead: React.FC<{
  mood?: TungMood;
  id?: string;
  x?: number;
  y?: number;
  scale?: number;
}> = ({ mood = 'annoyed', id = 'tung-head', x = 0, y = 0, scale = 1 }) => {
  const isAnnoyed = mood === 'annoyed';
  const isFocused = mood === 'focused';

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={PALETTE.ink} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round">
      {/* Cổ khỏe khoắn */}
      <path d="M -26 142 L -26 182 Q -6 200 18 181 L 20 138" fill={PALETTE.skin} />
      <path d="M -24 156 Q -6 172 19 154 L 18 174 Q -6 186 -25 174 Z" fill={PALETTE.skinShadow} stroke="none" />

      {/* Đầu & Cằm thể thao sáng sủa, gọn gàng */}
      <path d="M -54 62 Q -50 25 -9 24 Q 40 24 51 64 L 53 108 Q 62 126 48 144 Q 34 162 4 163 Q -28 162 -42 138 L -55 100 Z" fill={PALETTE.skin} />

      {/* Tai trái */}
      <path d="M -46 88 Q -74 74 -76 99 Q -77 120 -49 124" fill={PALETTE.skin} />
      <path d="M -64 99 Q -56 93 -52 106" fill="none" strokeWidth={2.4} />

      {/* TÓC NGẮN THỂ THAO TỈA LAYER TỰ NHIÊN STYLE B (Không cộm, không thừa) */}
      <path
        d="M -48 90 Q -60 76 -57 52 L -66 48 Q -58 26 -38 24 L -44 14 Q -26 14 -12 10 L -14 2 Q 2 -4 16 4 L 14 10 Q 28 6 40 18 L 38 24 Q 50 24 56 36 L 52 46 Q 44 48 40 56 L 32 52 Q 24 66 8 68 L 12 54 Q -6 72 -24 70 L -18 56 Q -34 68 -42 78 Z"
        fill={PALETTE.tung.hair}
      />
      {/* Nếp rãnh lọn tóc nhẹ */}
      <path d="M -16 18 Q -4 12 6 16 M 16 14 Q 26 16 34 26 M -8 38 Q 4 38 12 48" fill="none" stroke={PALETTE.tung.hair} strokeWidth={2.2} />

      {/* Mắt thể thao tỉnh táo */}
      <defs>
        <clipPath id={`${id}-eyes`}>
          <ellipse cx={-11} cy={99} rx={16} ry={14} />
          <ellipse cx={29} cy={96} rx={14.5} ry={13} />
        </clipPath>
      </defs>

      <ellipse cx={-11} cy={99} rx={16} ry={14} fill={PALETTE.eyeWhite} strokeWidth={2.5} />
      <ellipse cx={29} cy={96} rx={14.5} ry={13} fill={PALETTE.eyeWhite} strokeWidth={2.5} />

      <g clipPath={`url(#${id}-eyes)`}>
        <ellipse cx={-8} cy={99} rx={4.5} ry={5.5} fill={PALETTE.ink} stroke="none" />
        <ellipse cx={31} cy={96} rx={4.5} ry={5.5} fill={PALETTE.ink} stroke="none" />
        <circle cx={-6.5} cy={97} r={1.4} fill="#ffffff" stroke="none" />
        <circle cx={32.5} cy={94} r={1.4} fill="#ffffff" stroke="none" />
        <path d="M -32 76 L 48 74 L 48 86 L -32 87 Z" fill={PALETTE.skin} strokeWidth={2.4} />
      </g>

      {/* Lông mày */}
      <path
        d={
          isAnnoyed
            ? 'M -26 82 L 2 87 M 18 85 L 42 75'
            : isFocused
            ? 'M -26 80 Q -10 74 3 77 M 17 76 Q 30 72 42 75'
            : 'M -26 80 Q -10 74 3 77 M 17 76 Q 30 72 42 75'
        }
        fill="none"
        strokeWidth={5.5}
      />

      {/* Mũi gọn */}
      <path d="M 17 106 Q 28 108 24 117 L 15 119" fill="none" strokeWidth={2.5} />

      {/* Miệng */}
      {isAnnoyed ? (
        <path d="M -2 141 Q 12 133 26 140 Q 12 147 -2 141 Z" fill={PALETTE.mouthDark} strokeWidth={2.4} />
      ) : isFocused ? (
        <path d="M 0 142 Q 13 145 24 142" fill="none" strokeWidth={2.6} />
      ) : (
        <path d="M 0 141 Q 12 146 25 141" fill="none" strokeWidth={2.6} />
      )}
    </g>
  );
};

const Turf: React.FC<{ side: 'R' | 'L' }> = ({ side }) => (
  <g transform={side === 'R' ? 'translate(33 -555)' : 'translate(-35 -555)'} stroke={PALETTE.ink} strokeWidth={3.8}>
    {side === 'R' ? (
      <>
        <path d="M -52 560 Q -78 566 -74 582 Q -50 594 -8 584 L -10 573 Q -22 558 -52 560 Z" fill={PALETTE.tung.cleats} />
        <path d="M -74 580 Q -45 590 -8 580 L -8 588 Q -44 598 -75 588 Z" fill={PALETTE.tung.cleatsSole} strokeWidth={2.5} />
        <path d="M -58 565 Q -40 560 -24 572" stroke={PALETTE.tung.cleatsAccent} strokeWidth={3} fill="none" />
        <path d="M -62 569 Q -44 564 -28 576" stroke={PALETTE.tung.jersey} strokeWidth={2.5} fill="none" />
      </>
    ) : (
      <>
        <path d="M 16 560 Q 40 558 66 566 Q 88 570 85 582 Q 54 594 12 584 L 10 573 Z" fill={PALETTE.tung.cleats} />
        <path d="M 12 580 Q 52 588 85 579 L 86 586 Q 50 597 12 588 Z" fill={PALETTE.tung.cleatsSole} strokeWidth={2.5} />
        <path d="M 24 565 Q 44 560 64 572" stroke={PALETTE.tung.cleatsAccent} strokeWidth={3} fill="none" />
        <path d="M 28 569 Q 48 564 68 576" stroke={PALETTE.tung.jersey} strokeWidth={2.5} fill="none" />
      </>
    )}
  </g>
);

const TUNG_OUTFIT: Outfit = {
  shirt: PALETTE.tung.jersey, sleeveEnd: 0.5, hem: [[-46, 318], [46, 318], [60, 340], [36, 354], [12, 347], [-20, 360], [-58, 344]], cuff: PALETTE.tung.jerseyTrim,
  torso: 'M -24 176 Q -56 178 -84 210 L -56 256 Q -60 306 -56 342 Q -20 358 12 345 Q 36 352 58 338 Q 52 300 50 256 L 76 210 Q 62 190 16 177 Q -6 192 -24 176 Z',
  pants: PALETTE.tung.shorts, pantsLen: 'short', stripe: PALETTE.tung.shortsStripe,
  socks: { color: PALETTE.tung.socks, stripe: PALETTE.tung.socksStripe }, Foot: Turf,
  detail: (
    <>
      <path d="M -24 177 L -10 204 L 0 192 L 10 204 L 16 177 Z" fill={PALETTE.tung.jerseyTrim} strokeWidth={2.6} />
      <path d="M -8 184 L 0 196 L 8 184 Z" fill={PALETTE.tung.jerseyInner} stroke="none" />
      <path d="M -48 214 Q -46 236 -45 255 M 52 216 L 54 252 M -40 310 Q -16 326 14 314 M 14 332 Q 32 336 44 326" fill="none" strokeWidth={2.4} />
      <text x="-4" y="274" textAnchor="middle" fontFamily="'Arial Black', Impact, sans-serif" fontWeight="900" fontSize="34" fill={PALETTE.tung.number} stroke="none">7</text>
      <path d="M -36 238 L -28 238 L -28 245 Q -32 250 -32 250 Q -36 245 -36 245 Z" fill={PALETTE.tung.jerseyTrim} stroke="none" />
    </>
  ),
};
// Dáng mặc định của Tùng: tay L đút túi quần (khuỷu mở ra ngoài, cẳng tay gập vào hông).
export const TUNG_POSE: JointPose = { ...STAND_POSE, armL: { a: 14, b: 76, rot: -1 }, handL: 'none' };

export const TungSoccer: React.FC<{
  mood?: TungMood;
  x?: number;
  y?: number;
  scale?: number;
  pose?: JointPose;
}> = ({ mood = 'annoyed', x = 0, y = 0, scale = 1, pose = TUNG_POSE }) => (
  <Rigged pose={pose} outfit={TUNG_OUTFIT} x={x} y={y} scale={scale} head={<TungHead mood={mood} id="tung-soccer-head" />} />
);

// ----------------------------------------------------------------------------
// 3. BẢNG TRÌNH DIỄN SO SÁNH MASTER CHO TOÀN BỘ HỒ SƠ 02
// ----------------------------------------------------------------------------
export const HoSo02CharacterMasterBoard: React.FC = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
      <rect width="1920" height="1080" fill="#f6f1e8" />

      {/* Header */}
      <g fontFamily="Arial, sans-serif" fill={PALETTE.ink} textAnchor="middle">
        <text x={960} y={55} fontSize={28} fontWeight="800" letterSpacing="1">
          HỒ SƠ 02: NGƯỜI LÀM THAY — DÀN NHÂN VẬT THIẾT KẾ MẪU B
        </text>
        <text x={960} y={85} fontSize={16} fill="#69706c">
          Nam &amp; Bản sao giống nhau 100% (cùng mặt, áo xanh, nốt ruồi, tay) · Tùng tóc ngắn thể thao &amp; đồ bóng đá · Chuẩn Style B
        </text>
      </g>

      <path d="M 640 120 V 1010 M 1280 120 V 1010" stroke="#ded5c6" strokeWidth={1.8} strokeDasharray="6 6" />

      {/* CỘT 1: NAM */}
      <g transform="translate(320 0)">
        <text x={0} y={135} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={22} fontWeight="700" fill={PALETTE.ink}>
          1. NAM (SINH VIÊN CHÍNH)
        </text>
        <text x={0} y={160} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={14} fill="#707875">
          Áo xanh rêu, quần xám, vai mềm tự nhiên, nốt ruồi đuôi mày trái
        </text>
        <g transform="translate(0 190) scale(0.82)">
          <StudentTwinBody mood="sleepy" />
        </g>
        {/* 3 biểu cảm Nam */}
        <g transform="translate(-180 750) scale(0.68)">
          <StudentTwinHead mood="sleepy" id="b-nam-sleepy" />
          <text x={0} y={225} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fontWeight="700" fill="#515956" stroke="none">UỂ OẢI</text>
        </g>
        <g transform="translate(0 750) scale(0.68)">
          <StudentTwinHead mood="shocked" id="b-nam-shocked" />
          <text x={0} y={225} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fontWeight="700" fill="#515956" stroke="none">HOẢNG SỢ</text>
        </g>
        <g transform="translate(180 750) scale(0.68)">
          <StudentTwinHead mood="suspicious" id="b-nam-suspicious" />
          <text x={0} y={225} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fontWeight="700" fill="#515956" stroke="none">DÈ CHỪNG</text>
        </g>
      </g>

      {/* CỘT 2: NGƯỜI KIA (GIỐNG HOÀN TOÀN NAM 100%) */}
      <g transform="translate(960 0)">
        <text x={0} y={135} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={22} fontWeight="700" fill={PALETTE.ink}>
          2. NGƯỜI KIA (BẢN SAO 100% GIỐNG NAM)
        </text>
        <text x={0} y={160} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={14} fill="#707875">
          Cùng khuôn mặt, tóc, nốt ruồi đuôi mày, cùng áo xanh và dáng tay
        </text>
        <g transform="translate(0 190) scale(0.82)">
          <StudentTwinBody mood="calm" />
        </g>
        {/* 3 biểu cảm Bản sao */}
        <g transform="translate(-180 750) scale(0.68)">
          <StudentTwinHead mood="calm" id="b-doppel-calm" />
          <text x={0} y={225} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fontWeight="700" fill="#515956" stroke="none">ĐIỀM TĨNH</text>
        </g>
        <g transform="translate(0 750) scale(0.68)">
          <StudentTwinHead mood="neutral_smile" id="b-doppel-smile" />
          <text x={0} y={225} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fontWeight="700" fill="#515956" stroke="none">THÂN THIỆN</text>
        </g>
        <g transform="translate(180 750) scale(0.68)">
          <StudentTwinHead mood="eerie_smirk" id="b-doppel-eerie" />
          <text x={0} y={225} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fontWeight="700" fill="#515956" stroke="none">BÍ HIỂM</text>
        </g>
      </g>

      {/* CỘT 3: TÙNG (ĐỒ THỂ THAO ĐÁ BÓNG) */}
      <g transform="translate(1600 0)">
        <text x={0} y={135} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={22} fontWeight="700" fill={PALETTE.ink}>
          3. TÙNG (ĐỒ THỂ THAO ĐÁ BÓNG)
        </text>
        <text x={0} y={160} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={14} fill="#707875">
          Tóc ngắn tỉa mảng khối sắc nét Style B · Áo bóng đá navy #7 · Quần đùi &amp; giày turf
        </text>
        <g transform="translate(0 190) scale(0.82)">
          <TungSoccer mood="annoyed" />
        </g>
        {/* 3 biểu cảm Tùng */}
        <g transform="translate(-180 750) scale(0.68)">
          <TungHead mood="annoyed" id="b-tung-annoyed" />
          <text x={0} y={225} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fontWeight="700" fill="#515956" stroke="none">BỰC BỘI</text>
        </g>
        <g transform="translate(0 750) scale(0.68)">
          <TungHead mood="focused" id="b-tung-focused" />
          <text x={0} y={225} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fontWeight="700" fill="#515956" stroke="none">TẬP TRUNG</text>
        </g>
        <g transform="translate(180 750) scale(0.68)">
          <TungHead mood="normal" id="b-tung-normal" />
          <text x={0} y={225} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fontWeight="700" fill="#515956" stroke="none">BÌNH THƯỜNG</text>
        </g>
      </g>

      <text x={960} y={1055} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={16} fill="#828a86">
        Đường nét hữu cơ đồng bộ mẫu B · Không có nét thừa hay hở viền · Nam &amp; Người Kia là bản sao hoàn hảo 100%.
      </text>
    </svg>
  );
};
