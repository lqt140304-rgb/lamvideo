import React from 'react';
import { limbContour } from '../../../../what-if-studio/src/engine/anatomy';
import { clamp } from '../../../../what-if-studio/src/engine/anim';
import { ArticulatedMouth, MouthShape } from '../../../../what-if-studio/src/engine/mouth';
import { FaceKey as BaseFaceKey, FACES as BASE_FACES } from '../../../../what-if-studio/library/expressions/cartoon-soft/net-mat';
import { StoryFaceKey, STORY_FACES } from '../../../../what-if-studio/library/expressions/cartoon-soft/bo-sung-cot-truyen/net-mat';
type FaceKey = BaseFaceKey | StoryFaceKey;
const FACES = {...BASE_FACES, ...STORY_FACES};

// ============================================================================
// THE CRACK IN REALITY — HỒ SƠ 02: NGƯỜI TRONG GƯƠNG — BỘ ASSET NHÂN VẬT CHUẨN MẪU B (SVG HỮU CƠ)
// ============================================================================
// 1. NAM: Sinh viên chính, áo thun xanh rêu (#5c7a70), quần xám (#515451),
//    dép lê (#425850), nốt ruồi sát đuôi mày trái, vai mềm tự nhiên.
// 2. NGƯỜI KIA: giống Nam về mặt/vóc dáng, nốt ruồi phản chiếu sang bên đối diện:
//    Cùng khuôn mặt, nốt ruồi ở bên đối diện, cùng tóc (có lọn xoăn trên đỉnh theo Mẫu B),
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

  // Nam & Người Kia dùng chung bảng màu; áo ngủ Nam thay theo cảnh.
  nam: {
    hair: '#292a29',
    shirt: '#5c7a70',
    pants: '#515451',
    slippers: '#425850',
    sleepShirt: '#8a8783', // áo ngủ của Nam ở cảnh Người Kia mặc áo xanh
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
export type NamMood = 'sleepy' | 'annoyed' | 'hesitant' | 'scared' | 'agitated' | 'shocked' | 'suspicious' | 'calm' | 'neutral_smile' | 'eerie_smirk' | 'stare_grin';

/** Nét theo biến CSS --lw (mặc định 1), để chỉnh độ dày nét khớp nền mà không đổi hình. */
export const lw = (n: number) => `calc(${n}px * var(--lw, 1))`;
/** Kiểu viền bao: 'ink' = nét mực như mẫu; 'tint' = viền là tông tối của chính mảng màu; 'none' = bỏ viền bao (giữ nét mắt, mày, miệng). */
export type Outline = 'ink' | 'tint' | 'none';
const OutlineCtx = React.createContext<Outline>('none');
// Tách lớp không viền: tô sẵn màu tối hơn (lớp sau, >0) hoặc sáng hơn (lớp trước, <0) cho mảng màu. Rẻ hơn nhiều so với CSS filter khi render.
const ToneCtx = React.createContext(0);
const toned = (hex: string, t: number) => {
  if (!t) return hex;
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16), c = (v: number) => Math.round(t > 0 ? v * (1 - t) : v + (255 - v) * -t).toString(16).padStart(2, '0');
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};
const darken = (hex: string, k = 0.42) => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return PALETTE.ink;
  const n = parseInt(m[1], 16), c = (v: number) => Math.round(v * (1 - k)).toString(16).padStart(2, '0');
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};
/** Màu và độ dày viền bao của đầu theo kiểu viền đang dùng. */
// Gắn vào các mảng bao (cổ, sọ, tai, tóc); nét mắt, mày, miệng không dùng nên luôn giữ mực.
const useHeadLine = (w = 3.5) => {
  const mode = React.useContext(OutlineCtx);
  return (fill: string) => ({ stroke: mode === 'tint' ? darken(fill, 0.45) : PALETTE.ink, style: { strokeWidth: mode === 'none' ? '0px' : lw(w) } });
};

// Nhiều nhân vật trong cùng một SVG phải có clipPath khác mã, nếu không mắt người này bị cắt theo mắt người kia.
const useClipId = (id: string) => `${id}-${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;

// Góc nghiêng, 1/4 (nhìn chéo từ sau) và sau lưng vẽ riêng, dùng chung cho mọi nhân vật; mỗi người chỉ khác mảng tóc.
// Chính diện dùng chung nét mặt với 3/4 trong từng hàm đầu.
export type Talk = { shape: Exclude<MouthShape, 'auto'>; open?: number };
/** Tóc đung đưa (vật lý thứ cấp): xoay (độ) và dịch (đơn vị rig) quanh da đầu; bỏ trống = tóc đứng yên như mẫu đã chốt. */
export type HairSway = { rot: number; dx: number; dy: number };
const SCALP = { x: 0, y: 60 };
const hairSway = (h?: HairSway) => (h && (h.rot || h.dx || h.dy) ? `translate(${h.dx.toFixed(2)} ${h.dy.toFixed(2)}) rotate(${h.rot.toFixed(2)} ${SCALP.x} ${SCALP.y})` : undefined);
type HairKit = { color: string; side: string; back: string; quarter: string };
const NAM_HAIR: HairKit = {
  color: PALETTE.nam.hair,
  side: 'M 54 60 L 64 44 Q 48 16 22 15 Q 7 15 8 15 Q 7 0 24 4 Q 22 -4 15 -5 Q -10 -5 -7 14 Q -44 16 -60 52 L -72 58 L -62 76 Q -68 112 -44 142 Q -32 128 -28 104 Q -22 84 -14 74 L 12 76 L 16 58 L 32 68 L 42 52 Z',
  back: 'M -60 104 Q -66 72 -60 52 L -74 44 Q -58 26 -42 26 L -44 14 Q -22 18 -7 12 Q -10 -6 15 -6 Q 24 -5 25 4 Q 8 1 9 15 Q 40 12 54 30 L 72 40 L 60 54 Q 66 76 60 106 Q 62 142 38 158 Q 18 170 0 169 Q -18 170 -38 158 Q -62 142 -60 104 Z',
  quarter: 'M -58 104 Q -66 72 -60 52 L -74 44 Q -58 26 -42 26 L -44 14 Q -22 18 -7 12 Q -10 -6 15 -6 Q 24 -5 25 4 Q 8 1 9 15 Q 36 12 52 30 L 66 38 L 56 50 Q 38 62 30 86 L 26 126 Q 18 150 -4 164 Q -30 166 -50 136 Q -56 120 -58 104 Z',
};
const TUNG_HAIR: HairKit = {
  color: PALETTE.tung.hair,
  side: 'M 52 58 L 60 44 Q 48 20 30 14 L 34 4 Q 14 -2 -4 6 L -2 12 Q -40 14 -54 46 L -64 50 L -56 66 Q -60 90 -48 112 Q -36 110 -30 96 Q -24 84 -14 74 L 10 72 L 16 56 L 30 64 L 40 50 Z',
  back: 'M -56 96 Q -64 70 -58 50 L -70 44 Q -58 24 -40 22 L -46 12 Q -26 12 -12 8 L -14 0 Q 2 -6 16 2 L 14 8 Q 30 4 42 16 L 40 22 Q 54 24 60 44 L 66 50 L 58 58 Q 62 78 56 98 Q 50 128 30 138 Q 0 148 -30 138 Q -50 128 -56 96 Z',
  quarter: 'M -56 96 Q -64 70 -58 50 L -70 44 Q -58 24 -40 22 L -46 12 Q -26 12 -12 8 L -14 0 Q 2 -6 16 2 L 14 8 Q 28 6 40 18 L 46 28 L 52 38 L 44 52 Q 34 66 28 88 L 26 120 Q 18 136 -4 146 Q -30 146 -50 128 Q -54 112 -56 96 Z',
};

// Miệng nghiêng: hàm hạ xuống `drop` px, viền mặt mở khe giữa hai môi; lòng miệng tối vẽ SAU da nên chỉ lộ đúng khe. Nét miệng khép nằm trong má (x ≤ 64), không vượt viền môi.
const SIDE_FACE: Record<NamMood, { ry: number; lid?: string; brow: string; mouth?: string; drop?: number }> = {
  sleepy: { ry: 14, lid: 'M 18 66 H 56 V 92 H 18 Z', brow: 'M 20 76 Q 34 72 50 74', drop: 4 },
  annoyed: { ry: 14, lid: 'M 18 66 H 56 V 90 L 18 82 Z', brow: 'M 20 74 Q 36 76 50 84', mouth: 'M 64 136 Q 58 136 53 140' },
  hesitant: { ry: 14, lid: 'M 18 66 H 56 V 83 H 18 Z', brow: 'M 20 78 Q 36 72 50 66', mouth: 'M 64 136 Q 60 135 57 136.5 Q 54 138 51 137' },
  scared: { ry: 19, brow: 'M 20 72 Q 36 64 50 58', drop: 8 },
  agitated: { ry: 16, brow: 'M 20 68 L 50 82', drop: 11 },
  shocked: { ry: 22, brow: 'M 20 64 Q 36 54 50 60', drop: 16 },
  suspicious: { ry: 14, lid: 'M 18 66 H 56 V 88 L 18 78 Z', brow: 'M 20 72 L 50 86', mouth: 'M 64 136 Q 58 136 53 138' },
  calm: { ry: 14, lid: 'M 18 66 H 56 V 84 H 18 Z', brow: 'M 20 76 Q 36 73 50 75', mouth: 'M 64 136 Q 59 136.5 55 136' },
  neutral_smile: { ry: 14, lid: 'M 18 66 H 56 V 84 H 18 Z', brow: 'M 20 76 Q 36 73 50 75', mouth: 'M 64 136 Q 58 137.5 53 133' },
  eerie_smirk: { ry: 14, lid: 'M 18 66 H 56 V 84 H 18 Z', brow: 'M 20 74 Q 36 69 50 72', mouth: 'M 64 136 Q 57 137 52 131' },
  stare_grin: { ry: 20, brow: 'M 20 76 L 50 76', drop: 12 },
};
// Viền mặt nghiêng theo mẫu tham khảo: khe miệng mở tại điểm giao hai môi (65,136); hàm hạ `d` thì môi dưới và cằm vừa xuống vừa lùi về sau.
const profilePath = (d: number) => {
  const top = 'M -50 78 Q -48 24 4 22 Q 50 22 58 62 L 60 92 Q 62 102 74 112 Q 77 118 66 121 Q 63 125 66 130 Q 67 134 65 136';
  if (d <= 0) return top + ' Q 68 142 63 147 Q 52 166 16 166 Q -22 166 -36 142 Z';
  const back = 0.3 * d;
  return top + ` Q 58 ${137 + d * 0.3} 51 ${137 + d * 0.45} Q 57 ${137 + d * 0.8} ${64 - back} ${137 + d} Q ${67 - back} ${142 + d} ${62 - back} ${147 + d} Q ${52 - back} ${166 + d * 0.7} 16 ${166 + d * 0.5} Q -22 166 -36 142 Z`;
};
const talkDrop = (t: Talk) => (t.shape === 'closed' || t.shape === 'pressed' || t.shape === 'smile' ? 0 : 3 + 11 * clamp(t.open ?? 0.4));

// Ghép nét mặt thư viện: bỏ lớp mũi (giữ mũi nhân vật), tuỳ chọn bỏ mắt (đang chớp) và miệng (đang nói).
// Mắt thư viện nhỏ hơn mắt gốc của Nam: tách đôi lớp mắt theo đường giữa (x = 7, hệ trước translate của nhóm features)
// rồi phóng từng mắt quanh tâm của nó (-16,73) / (30,70), để mắt to ra mà không dãn khoảng cách hai mắt.
const EYE_GROW = 1.28;
const faceMarkup = (key: FaceKey, o: { eyes: boolean; mouth: boolean; uid: string }) => {
  const f = FACES[key];
  const eyeLayer = f.layers.eyes.replace(/\sid="[^"]*"/g, ''); // hai bản mắt dùng chung defs, không nhân đôi ID nhóm
  const one = (side: 'l' | 'r', cx: number, cy: number) =>
    `<g clip-path="url(#${o.uid}-${side})"><g transform="translate(${cx} ${cy}) scale(${EYE_GROW}) translate(${-cx} ${-cy})">${eyeLayer}</g></g>`;
  const eyes = o.eyes
    ? `<defs><clipPath id="${o.uid}-l"><rect x="-80" y="0" width="87" height="160"/></clipPath><clipPath id="${o.uid}-r"><rect x="7" y="0" width="87" height="160"/></clipPath></defs>` + one('l', -16, 73) + one('r', 30, 70)
    : '';
  const markup = f.defs + f.wrap + f.layers.color + eyes + f.layers.brows + f.layers.details + (o.mouth ? f.layers.mouth : '') + '</g>';
  return markup.replace(/\bid="([^"]+)"/g, (_, id) => `id="${o.uid}-${id}"`).replace(/url\(#([^)]*)\)/g, (_, id) => `url(#${o.uid}-${id})`);
};

const headFrame = (x: number, y: number, scale: number) => ({ transform: `translate(${x} ${y}) scale(${scale})`, stroke: PALETTE.ink, style: { strokeWidth: lw(3.5) }, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });

const ProfileHead: React.FC<{ hair: HairKit; mood: NamMood; clip: string; mole: boolean; talk?: Talk; blink?: boolean; x: number; y: number; scale: number; sway?: HairSway }> = ({ hair, mood, clip, mole, talk, blink, x, y, scale, sway }) => {
  const f = SIDE_FACE[mood];
  const drop = talk ? talkDrop(talk) : f.drop ?? 0;
  const face = profilePath(drop);
  const line = talk ? (drop ? undefined : 'M 64 136 Q 59 136.5 55 136') : drop ? undefined : f.mouth;
  const o = useHeadLine();
  return (
    <g {...headFrame(x, y, scale)}>
      <path d="M -20 146 L -22 184 Q 0 196 22 182 L 24 152" fill={PALETTE.skin} {...o(PALETTE.skin)} />
      <path d="M -21 158 Q 0 174 23 160 L 22 176 Q 0 188 -22 176 Z" fill={PALETTE.skinShadow} stroke="none" />
      {drop > 0 && (
        <g stroke="none">
          <path d={`M 67 134 L 49 ${137 + drop * 0.45} L ${65 - 0.3 * drop} ${139 + drop} Z`} fill={PALETTE.mouthDark} />
          {drop > 6 && <path d={`M 65.5 135.5 L 57 ${136.5 + drop * 0.2} L 57 ${138.5 + drop * 0.2} L 65 138 Z`} fill={PALETTE.teeth} />}
        </g>
      )}
      <path d={face} fill={PALETTE.skin} {...o(PALETTE.skin)} />
      <path d="M -8 84 Q -28 76 -26 100 Q -26 120 -8 118" fill={PALETTE.skin} {...o(PALETTE.skin)} />
      <path d="M -19 98 Q -12 93 -9 105" fill="none" style={{ strokeWidth: lw(2.4) }} />
      <path d={hair.side} fill={hair.color} {...o(hair.color)} visibility="visible" transform={hairSway(sway)} />
      <defs>
        <clipPath id={`${clip}-eyes`}><ellipse cx={36} cy={98} rx={11} ry={f.ry} /></clipPath>
      </defs>
      <ellipse cx={36} cy={98} rx={11} ry={f.ry} fill={PALETTE.eyeWhite} style={{ strokeWidth: lw(2.5) }} />
      <g clipPath={`url(#${clip}-eyes)`}>
        <ellipse cx={41} cy={100} rx={3.6} ry={5.2} fill={PALETTE.ink} stroke="none" />
        {blink ? <rect x={18} y={70} width={40} height={60} fill={PALETTE.skin} stroke="none" /> : f.lid && <path d={f.lid} fill={PALETTE.skin} style={{ strokeWidth: lw(2.5) }} />}
      </g>
      {blink && <path d="M 26 100 Q 36 106 47 100" fill="none" style={{ strokeWidth: lw(3) }} />}
      <path d={f.brow} fill="none" style={{ strokeWidth: lw(5.5) }} />
      {mole && <circle cx={12} cy={85} r={2.2} fill={PALETTE.ink} stroke="none" />}
      {line && <path d={line} fill="none" style={{ strokeWidth: lw(2.6) }} />}
    </g>
  );
};

const BackHead: React.FC<{ hair: HairKit; x: number; y: number; scale: number; sway?: HairSway }> = ({ hair, x, y, scale, sway }) => {
  const o = useHeadLine();
  return (
    <g {...headFrame(x, y, scale)}>
      <path d="M -22 150 L -22 184 Q 0 196 22 184 L 22 150" fill={PALETTE.skin} {...o(PALETTE.skin)} />
      <path d="M -56 87 Q -84 72 -86 99 Q -87 121 -59 125 M 56 87 Q 84 72 86 99 Q 87 121 59 125" fill={PALETTE.skin} {...o(PALETTE.skin)} />
      <path d="M -58 60 Q -52 25 0 25 Q 52 25 58 60 L 60 108 Q 60 140 38 156 Q 18 168 0 167 Q -18 168 -38 156 Q -60 140 -60 108 Z" fill={PALETTE.skin} {...o(PALETTE.skin)} />
      <path d={hair.back} fill={hair.color} {...o(hair.color)} visibility="visible" transform={hairSway(sway)} />
    </g>
  );
};

// 1/4: thấy gáy, tai phía gần và một dải má; mũi, miệng đã khuất.
const QuarterHead: React.FC<{ hair: HairKit; mole: boolean; x: number; y: number; scale: number; sway?: HairSway }> = ({ hair, mole, x, y, scale, sway }) => {
  const o = useHeadLine();
  return (
  <g {...headFrame(x, y, scale)}>
    <path d="M -24 150 L -24 184 Q 0 196 24 184 L 26 150" fill={PALETTE.skin} {...o(PALETTE.skin)} />
    <path d="M -56 70 Q -50 24 4 24 Q 56 24 62 70 L 64 112 Q 64 140 44 156 Q 20 170 -8 166 Q -46 158 -56 120 Z" fill={PALETTE.skin} {...o(PALETTE.skin)} />
    <path d={hair.quarter} fill={hair.color} {...o(hair.color)} visibility="visible" transform={hairSway(sway)} />
    <path d="M 24 88 Q 50 76 50 100 Q 50 122 26 124 Q 14 106 24 88 Z" fill={PALETTE.skin} {...o(PALETTE.skin)} />
    <path d="M 44 98 Q 36 92 32 106" fill="none" style={{ strokeWidth: lw(2.4) }} />
    <path d="M 50 80 L 58 77" fill="none" style={{ strokeWidth: lw(5.5) }} />
    {mole && <circle cx={57} cy={92} r={2.2} fill={PALETTE.ink} stroke="none" />}
  </g>
  );
};

export const StudentTwinHead: React.FC<{
  gazeY?: number;
  mood?: NamMood;
  identity?: 'nam' | 'nguoi-kia';
  id?: string;
  view?: View;
  facing?: 1 | -1;
  talk?: Talk;
  blink?: boolean;
  /** Nét mặt phân mức từ thư viện cartoon-soft (vd 'so-hai-02'); chỉ áp ở chính diện và 3/4, thay mắt–mày–miệng của `mood`. */
  face?: FaceKey;
  /** Chuyển dần từ nét mặt trước: vẽ chồng `faceFrom` mờ dần trong khi `face` hiện dần theo `faceMix` 0–1. */
  faceFrom?: FaceKey;
  faceMix?: number;
  x?: number;
  y?: number;
  scale?: number;
  /** Tóc đung đưa theo vật lý; bỏ trống = tóc đứng yên. */
  hair?: HairSway;
  /** Đầu nghiêng mới theo ảnh tham chiếu (dáng 2.5D); mặc định tắt = đầu nghiêng đã chốt. */
  sideNew?: boolean;
}> = ({ gazeY = 0, mood = 'sleepy', identity = 'nam', id = 'twin-head', x = 0, y = 0, scale = 1, view = 'three', facing = 1, talk, blink, face, faceFrom, faceMix = 1, hair: sway, sideNew = false }) => {
  const markNear = identity === 'nam' ? facing === 1 : facing === -1;
  const isShocked = mood === 'shocked';
  const isSuspicious = mood === 'suspicious';
  const isCalm = mood === 'calm';
  const isSmiling = mood === 'neutral_smile';
  const isEerie = mood === 'eerie_smirk';
  const isAngry = mood === 'annoyed';
  const isHesitant = mood === 'hesitant';
  const isScared = mood === 'scared';
  const isAgitated = mood === 'agitated';
  const isStare = mood === 'stare_grin'; // chỉ cho bản sao ở cảnh hù: trừng mắt, cười toét
  const isWide = isShocked || isScared || isStare; // mắt mở to, con ngươi nhỏ
  const eyeRy = isShocked ? 23 : isStare ? 21 : isScared ? 20 : isAgitated ? 17 : 15;
  const eyeRyL = isShocked ? 22 : isStare ? 20 : isScared ? 19 : isAgitated ? 16 : 14;
  const clip = useClipId(id);
  const o = useHeadLine();
  if (view === 'back') return <BackHead hair={NAM_HAIR} x={x} y={y} scale={scale} sway={sway} />;
  if (view === 'quarter') return <QuarterHead hair={NAM_HAIR} mole={markNear} x={x} y={y} scale={scale} sway={sway} />;
  if (view === 'side' && sideNew) return <NamSoftProfileHead mood={mood} clip={clip} mole={markNear} talk={talk} blink={blink} x={x} y={y} scale={scale} sway={sway} />;
  if (view === 'side') return <ProfileHead hair={NAM_HAIR} mood={mood} clip={clip} mole={markNear} talk={talk} blink={blink} x={x} y={y} scale={scale} sway={sway} />; // nửa mặt thấy dấu phụ thuộc Nam/Người Kia, không chỉ hướng nhìn
  const front = view === 'front';
  const rxR = front ? 15 : 17;
  const rxL = front ? 15 : 15;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={PALETTE.ink} style={{ strokeWidth: lw(3.5) }} strokeLinejoin="round" strokeLinecap="round">
      {/* Cổ & Khối bóng đổ cằm */}
      <path d={front ? 'M -22 141 L -22 182 Q 0 197 22 182 L 22 141' : 'M -28 141 L -28 182 Q -8 201 16 181 L 19 138'} fill={PALETTE.skin} {...o(PALETTE.skin)} />
      <path d={front ? 'M -21 155 Q 0 171 21 155 L 21 175 Q 0 188 -21 175 Z' : 'M -26 155 Q -8 171 17 153 L 16 175 Q -7 187 -27 174 Z'} fill={PALETTE.skinShadow} stroke="none" />

      {/* Hộp sọ & Đường cằm bo tròn hữu cơ (chuẩn mẫu B) */}
      <path d={front ? 'M -58 60 Q -52 25 0 25 Q 52 25 58 60 L 60 108 Q 62 138 38 156 Q 18 168 0 167 Q -18 168 -38 156 Q -62 138 -60 108 Z' : 'M -55 60 Q -50 25 -9 25 Q 42 24 53 66 L 55 111 Q 72 130 54 146 Q 38 166 6 165 Q -30 163 -45 138 L -58 100 Z'} fill={PALETTE.skin} {...o(PALETTE.skin)} />

      {/* Tai trái */}
      <path d={front ? 'M -56 87 Q -84 72 -86 99 Q -87 121 -59 125 M 60 86 Q 84 72 86 99 Q 87 121 60 125' : 'M -47 87 Q -75 72 -77 99 Q -78 121 -50 125'} fill={PALETTE.skin} {...o(PALETTE.skin)} />
      <path d={front ? 'M -74 99 Q -66 93 -62 106 M 74 99 Q 66 93 62 106' : 'M -65 99 Q -57 93 -53 106'} fill="none" style={{ strokeWidth: lw(2.4) }} />

      {/* TÓC NAM & BẢN SAO: Bo tròn hữu cơ theo hộp sọ, có lọn tóc xoăn trên đỉnh theo Mẫu B */}
      <path
        d={front ? 'M -60 92 Q -72 70 -66 50 L -76 46 Q -62 24 -42 24 L -44 14 Q -22 18 -7 12 Q -10 -6 15 -6 Q 24 -5 25 4 Q 8 1 9 15 Q 44 12 56 34 L 70 38 L 60 58 L 60 88 Q 48 62 28 52 Q 18 66 -2 66 L 0 54 Q -24 74 -46 70 L -48 92 Z' : 'M -51 92 Q -65 79 -61 52 L -71 51 Q -58 27 -38 28 L -43 18 Q -20 21 -7 14 Q -10 -5 15 -5 Q 22 -4 24 4 Q 7 0 8 16 Q 40 13 51 37 L 62 43 L 48 59 Q 34 54 22 43 Q 15 63 -4 67 L -1 52 Q -20 75 -41 74 L -43 95 Z'}
        fill={PALETTE.nam.hair}
        visibility="visible"
        transform={hairSway(sway)}
        {...o(PALETTE.nam.hair)}
      />

      <g transform={front ? 'translate(-10 0)' : undefined}>
      {face ? (
        <>
          {/* Gốc thư viện (giữa hai mắt) đặt vào giữa hai mắt Nam; giữ cỡ mắt gần mắt gốc, kéo dọc để miệng rơi đúng cằm. Giữ mũi và nốt ruồi của nhân vật. */}
          {[...(faceFrom && faceFrom !== face && faceMix < 1 ? [[faceFrom, 1 - faceMix] as const] : []), [face, faceFrom && faceFrom !== face ? faceMix : 1] as const].map(([k, op], i) => (
            <g key={i} opacity={op} transform={`translate(9.5 ${front ? 99 : 97.5}) scale(1 1.08)`} dangerouslySetInnerHTML={{ __html: faceMarkup(k, { eyes: !blink, mouth: !talk, uid: `${clip}-f${i}` }) }} />
          ))}
          {blink && <path d="M -27 102 Q -11 108 5 101 M 16 99 Q 30 104 45 98" fill="none" style={{ strokeWidth: lw(3) }} />}
          <circle cx={front ? (identity === 'nam' ? -32 : 52) : (markNear ? -32 : 47)} data-identity-mark={identity} cy={78} r={2.2} fill={PALETTE.ink} stroke="none" />
          <path d={front ? 'M 4 110 Q 10 118 16 110' : 'M 13 113 Q 25 115 22 123 L 13 125'} fill="none" style={{ strokeWidth: lw(2.5) }} />
          {talk && <g transform={front ? 'translate(-6 0)' : undefined}><g transform="translate(13 142) scale(1.25)"><ArticulatedMouth shape={talk.shape} open={talk.open} ink={PALETTE.mouthDark} /></g></g>}
        </>
      ) : (<>
      {/* Vùng mắt */}
      <defs>
        <clipPath id={`${clip}-eyes`}>
          <ellipse cx={-11} cy={99} rx={rxR} ry={eyeRy} />
          <ellipse cx={30} cy={front ? 99 : 96} rx={rxL} ry={eyeRyL} />
        </clipPath>
      </defs>

      {/* Tròng trắng mắt */}
      <ellipse cx={-11} cy={99} rx={rxR} ry={eyeRy} fill={PALETTE.eyeWhite} style={{ strokeWidth: lw(2.5) }} />
      <ellipse cx={30} cy={front ? 99 : 96} rx={rxL} ry={eyeRyL} fill={PALETTE.eyeWhite} style={{ strokeWidth: lw(2.5) }} />

      {/* Con ngươi & Nếp mí */}
      <g clipPath={`url(#${clip}-eyes)`}>
        <ellipse
          cx={isSuspicious ? -4 : isEerie ? -6 : isHesitant ? -14 : -8}
          cy={(isWide ? 100 : 102) + Math.max(-5, Math.min(5, gazeY))}
          rx={isStare ? 2.2 : isWide ? 3.3 : 4}
          ry={isStare ? 2.8 : isWide ? 4.8 : 5.5}
          fill={PALETTE.ink}
          stroke="none"
        />
        <ellipse
          cx={isSuspicious ? 36 : isEerie ? 34 : isHesitant ? 26 : 32}
          cy={(isWide ? 97 : 99) + Math.max(-5, Math.min(5, gazeY))}
          rx={isStare ? 2.2 : isWide ? 3.3 : 4}
          ry={isStare ? 2.8 : isWide ? 4.8 : 5.5}
          fill={PALETTE.ink}
          stroke="none"
        />
        {/* Điểm sáng bắt sáng */}
        {!isStare && <circle cx={isSuspicious ? -3 : isHesitant ? -13 : -7} cy={isWide ? 98 : 100} r={1.2} fill="#ffffff" stroke="none" />}
        {!isStare && <circle cx={isSuspicious ? 37 : isHesitant ? 27 : 33} cy={isWide ? 95 : 97} r={1.2} fill="#ffffff" stroke="none" />}

        {blink && <rect x={-40} y={70} width={100} height={60} fill={PALETTE.skin} stroke="none" />}
        {/* Nếp mí */}
        {!blink && !isWide && !isAgitated && (
          <path
            d={
              isSuspicious
                ? 'M -33 77 L 9 100 L 49 76 L 49 61 L -33 61 Z'
                : isAngry
                ? 'M -33 80 L 7 91 L 51 79 L 51 61 L -33 61 Z'
                : isHesitant
                ? 'M -33 84 L 8 80 L 51 83 L 51 61 L -33 61 Z'
                : isCalm || isSmiling || isEerie
                ? 'M -33 73 L 51 73 L 51 86 L -33 87 Z'
                : 'M -33 70 L 51 70 L 51 91 L -33 99 Z'
            }
            fill={PALETTE.skin}
            style={{ strokeWidth: lw(2.5) }}
          />
        )}
      </g>

      {blink && <path d="M -27 102 Q -11 108 5 101 M 16 99 Q 30 104 45 98" fill="none" style={{ strokeWidth: lw(3) }} />}
      {/* Lông mày mực đậm chuẩn mẫu B (5.5px) */}
      <path
        d={
          isShocked
            ? 'M -29 69 Q -16 58 -2 64 M 17 62 Q 32 54 43 64'
            : isAngry
            ? 'M -28 77 Q -12 78 2 85 M 19 83 Q 33 74 44 74'
            : isHesitant
            ? 'M -28 80 Q -14 73 2 70 M 19 69 Q 32 71 44 79'
            : isScared
            ? 'M -29 72 Q -14 64 1 59 M 18 58 Q 32 62 43 70'
            : isAgitated
            ? 'M -28 72 L 2 83 M 19 80 L 44 64'
            : isSuspicious
            ? 'M -28 78 L 2 87 M 19 79 L 44 68'
            : isEerie
            ? 'M -28 75 Q -12 70 2 73 M 19 72 Q 33 65 44 68'
            : isStare
            ? 'M -28 76 L 2 78 M 19 77 L 44 75'
            : isCalm || isSmiling
            ? 'M -28 76 Q -12 74 2 76 M 19 74 Q 33 71 44 73'
            : 'M -28 78 Q -12 74 2 75 M 19 72 Q 33 69 44 70'
        }
        fill="none"
        style={{ strokeWidth: lw(5.5) }}
      />

      {/* Dấu nhỏ cố định theo danh tính; Người Kia đảo bên, không đổi hướng nhìn. */}
      <circle cx={front ? (identity === 'nam' ? -32 : 52) : (markNear ? -32 : 47)} data-identity-mark={identity} cy={isWide ? 74 : 82} r={2.2} fill={PALETTE.ink} stroke="none" />

      {/* Mũi tròn tối giản */}
      <path d={front ? 'M 4 110 Q 10 118 16 110' : 'M 13 113 Q 25 115 22 123 L 13 125'} fill="none" style={{ strokeWidth: lw(2.5) }} />

      <g transform={front ? 'translate(-6 0)' : undefined}>
      {/* Miệng */}
      {talk ? <g transform="translate(13 142) scale(1.25)"><ArticulatedMouth shape={talk.shape} open={talk.open} ink={PALETTE.mouthDark} /></g> : isShocked ? (
        <g>
          <path d="M -3 139 Q 1 121 16 126 Q 31 129 30 148 Q 11 139 -3 148 Z" fill={PALETTE.mouthDark} />
          <path d="M 4 129 Q 13 125 22 132 L 22 137 L 4 135 Z" fill={PALETTE.teeth} stroke="none" />
          <path d="M 4 145 Q 12 138 23 146" stroke={PALETTE.tongue} style={{ strokeWidth: lw(3) }} />
        </g>
      ) : isAngry ? (
        <path d="M -4 144 Q 10 134 26 143" fill="none" style={{ strokeWidth: lw(3) }} />
      ) : isHesitant ? (
        <path d="M -4 143 Q 4 138 11 143 Q 18 148 26 142" fill="none" style={{ strokeWidth: lw(2.8) }} />
      ) : isScared ? (
        <g>
          <path d="M -3 141 Q 12 131 29 140 Q 14 152 -3 141 Z" fill={PALETTE.mouthDark} />
          <path d="M 3 139 Q 12 134 23 139 L 22 143 Q 12 140 4 143 Z" fill={PALETTE.teeth} stroke="none" />
        </g>
      ) : isAgitated ? (
        <g>
          <path d="M -4 137 Q 12 129 31 138 Q 31 154 13 154 Q -3 153 -4 137 Z" fill={PALETTE.mouthDark} />
          <path d="M 2 136 Q 13 131 26 137 L 25 142 Q 13 138 3 142 Z" fill={PALETTE.teeth} stroke="none" />
        </g>
      ) : isSuspicious ? (
        <path d="M -6 141 Q 9 136 22 140" fill="none" style={{ strokeWidth: lw(2.8) }} />
      ) : isStare ? (
        <g>
          <path d="M -24 132 Q 13 166 50 130 Q 13 146 -24 132 Z" fill={PALETTE.mouthDark} />
          <path d="M -18 135 Q 13 148 44 133 L 42 139 Q 13 152 -16 140 Z" fill={PALETTE.teeth} stroke="none" />
        </g>
      ) : isEerie ? (
        <path d="M -2 143 Q 12 135 28 138" fill="none" style={{ strokeWidth: lw(3) }} />
      ) : isSmiling ? (
        <path d="M 0 142 Q 13 147 26 142" fill="none" style={{ strokeWidth: lw(2.8) }} />
      ) : isCalm ? (
        <path d="M 2 143 Q 13 144 24 143" fill="none" style={{ strokeWidth: lw(2.6) }} />
      ) : (
        <path d="M 8 139 Q 20 131 25 144 Q 15 149 8 145 Z" fill={PALETTE.mouthDark} style={{ strokeWidth: lw(2.5) }} />
      )}
      </g>
      </>)}
      </g>
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
export type HandKind = 'rest' | 'open' | 'fist' | 'hold' | 'type' | 'phone' | 'none';
export type View = 'three' | 'front' | 'side' | 'quarter' | 'back';
export type JointPose = {
  view?: View; // mặc định 3/4
  facing?: 1 | -1; // -1: quay sang trái (3/4, nghiêng, 1/4). R/L luôn theo giải phẫu ở mọi góc
  tilt: number; neck: number;
  armR: Limb; armL: Limb; legR: Limb; legL: Limb;
  wristR: number; wristL: number; handR: HandKind; handL: HandKind;
  footR: number; footL: number; // độ nghiêng bàn chân so với mặt sàn
  frontR: boolean; frontL: boolean; // tay vẽ đè lên thân
  palmUp?: 'R' | 'L'; // lật ngửa bàn tay này, ngón cái đổi phía
  prop?: 'phone' | 'bowl' | 'phoneLandscape'; // đi theo bàn tay: điện thoại ở tay phải, bát giữa hai tay
  support?: 'bed'; // nằm có điểm đỡ, không vẽ bóng đứng dưới chân
  x: number; y: number; planted: boolean; // planted: tự hạ/nâng hông để bàn chân thấp nhất chạm sàn
};

export const BONE = { upperArm: 80, foreArm: 74, thigh: 105, shin: 105 };
/**
 * Vóc dáng: độ dài xương, bề ngang vai, độ dày tay/ống quần, cỡ bàn tay, tay áo, dép.
 * Mặc định = Nam Style B đã chốt (giữ nguyên mọi bản dựng cũ). Biến thể truyền qua `Outfit.build`.
 */
export type Build = {
  upperArm: number; foreArm: number; thigh: number; shin: number;
  shoulderX: number; // hệ số bề ngang điểm vai
  arm: [number, number, number]; // nửa bề rộng tay: vai, khuỷu, cổ tay (tay thả)
  hand: number; // hệ số cỡ bàn tay
  sleeve: [number, number, number]; // nửa bề rộng tay áo: gốc, giữa, mép
  pants: [number, number, number]; // nửa bề rộng ống quần dài: hông, gối, gấu
  pantsEnd: number; // gấu quần dài tại tỉ lệ gối → mắt cá (1 = chấm mắt cá)
  foot: number; // hệ số cỡ dép
  shortsSide?: [number, number, number]; // nửa bề rộng ống quần ĐÙI khi nhìn nghiêng (bỏ trống = 31/31/32 như đã chốt)
};
export const DEFAULT_BUILD: Build = { ...BONE, shoulderX: 1, arm: [19, 16, 13.5], hand: 1.12, sleeve: [25, 27, 27], pants: [31, 26, 28], pantsEnd: 0.93, foot: 1 };
export const LIMIT: Record<'tilt' | 'neck' | 'shoulder' | 'elbow' | 'wrist' | 'hip' | 'knee' | 'ankle', [number, number]> = {
  tilt: [-30, 40], neck: [-35, 35],
  shoulder: [-130, 180], // gộp cả dang ngang và đưa trước/sau vì rig vẽ trên một mặt phẳng
  elbow: [0, 150], wrist: [-70, 70],
  hip: [-35, 125], knee: [0, 150], ankle: [-35, 35],
};
const PELVIS = { x: 0, y: 345 };
const NECK = { x: -6, y: 180 };
const ANKLE_Y = 555;
const pair = (rx: number, lx: number, y: number) => ({ R: { x: rx, y }, L: { x: lx, y } });
// Điểm neo vai/hông theo góc nhìn; rest: tay buông hơi rời thân. Độ dài xương không đổi giữa các góc.
const ANCHOR: Record<View, { shoulder: { R: P; L: P }; hip: { R: P; L: P }; rest: { R: number; L: number } }> = {
  three: { shoulder: pair(-68, 62, 232), hip: pair(-29, 31, 345), rest: { R: 3, L: -9 } },
  front: { shoulder: pair(-66, 66, 232), hip: pair(-30, 30, 345), rest: { R: 6, L: -6 } },
  back: { shoulder: pair(66, -66, 232), hip: pair(30, -30, 345), rest: { R: -6, L: 6 } }, // nhìn từ sau: tay phải ở bên phải màn hình
  quarter: { shoulder: pair(64, -62, 232), hip: pair(26, -30, 345), rest: { R: -7, L: 7 } },
  side: { shoulder: pair(0, 2, 232), hip: pair(-2, 6, 345), rest: { R: 0, L: 0 } },
};

const lim = (v: number, k: keyof typeof LIMIT) => clamp(v, LIMIT[k][0], LIMIT[k][1]);
const step = (p: P, deg: number, len: number): P => ({ x: p.x - Math.sin((deg * Math.PI) / 180) * len, y: p.y + Math.cos((deg * Math.PI) / 180) * len });
const mix = (a: P, b: P, t: number): P => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

/** Tính vị trí khớp. Tay nằm trong hệ thân (xoay theo tilt quanh chậu), chân trong hệ gốc; mọi góc đều bị chặn theo LIMIT. */
export const solveRig = (pose: JointPose, build: Build = DEFAULT_BUILD) => {
  const v = pose.view ?? 'three';
  const A = ANCHOR[v];
  const frontal = v === 'front' || v === 'back'; // đưa trước–sau nhìn từ trước/sau không được thành xoè ngang
  const depth = (deg: number) => (frontal ? Math.max(0.35, Math.abs(Math.cos((deg * Math.PI) / 180))) : 1);
  const arm = (root: P, l: Limb, rest: number, isL: boolean, front: boolean) => {
    const sw = lim(l.a, 'shoulder');
    // Vung tay: nhìn từ trước/sau chỉ hơi rời thân; 3/4 và 1/4 khi tay đi vào giữa người thì hơi mở ra ngoài, để bàn tay nằm ngoài đùi và không bị áo, quần che. Tay chủ động đưa trước ngực (front) giữ nguyên.
    const towardCenter = (v === 'three' || v === 'quarter') && !front && (root.x < 0) === (sw > 0);
    const a1 = frontal ? rest + (root.x < 0 ? 1 : -1) * Math.abs(sw) * 0.25 : towardCenter ? rest + (root.x < 0 ? 5 : -5) : rest - sw;
    const flexToCenter = (v === 'three' || v === 'quarter') && !front && root.x < 0; // cẳng tay bên trái màn hình gập vào giữa người
    const flex = lim(l.b, 'elbow') * ((frontal && !front) || flexToCenter ? 0.35 : 1);
    const a2 = a1 + ((v === 'front' ? isL : v === 'back' ? !isL : l.rot === -1 && v === 'three') ? 1 : -1) * flex;
    const mid = step(root, a1, build.upperArm);
    return { root, mid, end: step(mid, a2, build.foreArm), deg: a2 };
  };
  const leg = (root: P, l: Limb) => {
    const a = lim(l.a, 'hip'), b = lim(l.b, 'knee');
    const a1 = frontal ? (root.x < 0 ? 2 : -2) : -a;
    const a2 = frontal ? a1 : a1 + b;
    const mid = step(root, a1, build.thigh * depth(a));
    return { root, mid, end: step(mid, a2, build.shin * depth(b - a)), deg: a2 };
  };
  const legR = leg(A.hip.R, pose.legR);
  const legL = leg(A.hip.L, pose.legL);
  const foot = (pitch: number, shin: number) => clamp(pitch, shin + LIMIT.ankle[0], shin + LIMIT.ankle[1]);
  return {
    armR: arm(build.shoulderX === 1 ? A.shoulder.R : { x: A.shoulder.R.x * build.shoulderX, y: A.shoulder.R.y }, pose.armR, A.rest.R, false, pose.frontR),
    armL: arm(build.shoulderX === 1 ? A.shoulder.L : { x: A.shoulder.L.x * build.shoulderX, y: A.shoulder.L.y }, pose.armL, A.rest.L, true, pose.frontL),
    legR, legL,
    footR: foot(pose.footR, legR.deg), footL: foot(pose.footL, legL.deg),
    dy: pose.y + (pose.planted ? ANKLE_Y - Math.max(legR.end.y, legL.end.y) : 0),
    tilt: lim(pose.tilt, 'tilt'), neck: lim(pose.neck, 'neck'),
  };
};

/** Quay trái bằng cách lật hình nên phải đổi vế để R/L vẫn đúng giải phẫu; rot thuộc về phía màn hình nên giữ nguyên chỗ. */
export const mirrorPose = (p: JointPose): JointPose => ({
  ...p,
  armR: { ...p.armL, rot: p.armR.rot }, armL: { ...p.armR, rot: p.armL.rot }, legR: p.legL, legL: p.legR,
  wristR: p.wristL, wristL: p.wristR, handR: p.handL, handL: p.handR, footR: p.footL, footL: p.footR,
  frontR: p.frontL, frontL: p.frontR, palmUp: p.palmUp === 'R' ? 'L' : p.palmUp === 'L' ? 'R' : undefined,
});

// Vòng quay theo thứ tự góc thật, đi đường ngắn nhất.
const TURN_RING: { view: View; facing: 1 | -1 }[] = [
  { view: 'front', facing: 1 }, { view: 'three', facing: 1 }, { view: 'side', facing: 1 }, { view: 'quarter', facing: 1 },
  { view: 'back', facing: 1 }, { view: 'quarter', facing: -1 }, { view: 'side', facing: -1 }, { view: 'three', facing: -1 },
];
const ringIndex = (v: View, f: 1 | -1) => TURN_RING.findIndex((a) => a.view === v && (a.facing === f || v === 'front' || v === 'back'));
/** Xoay người theo kiểu hoạt hình: mỗi góc giữ vài frame rồi nhảy sang góc kế bên. t từ 0 đến 1. */
export const turnAt = (from: { view: View; facing?: 1 | -1 }, to: { view: View; facing?: 1 | -1 }, t: number) => {
  const a = ringIndex(from.view, from.facing ?? 1), b = ringIndex(to.view, to.facing ?? 1);
  const d = ((b - a + 12) % 8) - 4; // -4..3
  return TURN_RING[(a + Math.round(clamp(t) * d) + 8) % 8];
};

export const STAND_POSE: JointPose = {
  tilt: 0, neck: 0,
  armR: { a: 2, b: 8 }, armL: { a: 2, b: 8, rot: -1 },
  legR: { a: -2, b: 0 }, legL: { a: 2, b: 0 },
  wristR: 0, wristL: 0, handR: 'rest', handL: 'rest',
  footR: 0, footL: 0, frontR: false, frontL: false,
  x: 0, y: 0, planted: true,
};
// Ngồi ghế: chân gần thu về sau, chân xa đưa tới trước, để thấy rõ đùi và hai bàn chân không chồng nhau.
const SIT_LEGS = { legR: { a: 72, b: 84 }, legL: { a: 82, b: 68 } };
// Tư thế mẫu cho các nhịp cần diễn ở The Crack in Reality — Hồ sơ 02: Người trong gương; chỉnh tiếp bằng cách trộn đè { ...STAND_POSE, ... }.
export const TWIN_POSES: Record<'stand' | 'sit' | 'stride' | 'crouch' | 'reach' | 'holdBowl' | 'stop' | 'wary' | 'phone' | 'offer' | 'type' | 'sitLow' | 'lie', JointPose> = {
  stand: STAND_POSE,
  sit: { ...STAND_POSE, tilt: 14, neck: -6, armR: { a: 25, b: 58 }, armL: { a: 5, b: 90, rot: -1 }, handR: 'hold', handL: 'hold', frontR: true, frontL: true, ...SIT_LEGS }, // đổ người tới, hai tay đan lại
  stride: { ...STAND_POSE, tilt: 4, armR: { a: -20, b: 16 }, armL: { a: 24, b: 28 }, legR: { a: 26, b: 6 }, legL: { a: -20, b: 24 } },
  crouch: { ...STAND_POSE, tilt: 24, neck: -14, armR: { a: 30, b: 40 }, armL: { a: 30, b: 40, rot: -1 }, legR: { a: 112, b: 130 }, legL: { a: 96, b: 124 }, frontR: true },
  reach: { ...STAND_POSE, tilt: 20, neck: -8, armR: { a: 66, b: 14 }, handR: 'open', frontR: true, legR: { a: 26, b: 30 }, legL: { a: 8, b: 12 } },
  holdBowl: { ...STAND_POSE, armR: { a: 20, b: 75 }, armL: { a: 14, b: 100, rot: -1 }, handR: 'hold', handL: 'hold', frontR: true, frontL: true, prop: 'bowl' },
  stop: { ...STAND_POSE, tilt: -5, neck: 6, armR: { a: -78, b: 8 }, armL: { a: 72, b: 34 }, handR: 'open', handL: 'open', frontL: true, legR: { a: 8, b: 16 }, legL: { a: -12, b: 8 } },
  // Bốn dáng dưới dựng cho góc 3/4.
  wary: { ...STAND_POSE, tilt: -5, neck: 5, armR: { a: -37, b: 105, rot: -1 }, armL: { a: 31, b: 105, rot: 1 }, handR: 'open', handL: 'open', frontR: true, frontL: true, legR: { a: 10, b: 14 }, legL: { a: -10, b: 6 } },
  phone: { ...STAND_POSE, neck: -4, armR: { a: -114, b: 121, rot: -1 }, wristR: -48, handR: 'phone', frontR: true, prop: 'phone' },
  offer: { ...STAND_POSE, tilt: 3, neck: -3, armL: { a: 26, b: 50, rot: 1 }, handL: 'open', frontL: true, palmUp: 'L' },
  type: { ...STAND_POSE, tilt: 9, neck: 6, armR: { a: 33, b: 65 }, armL: { a: -24, b: 115, rot: 1 }, handR: 'type', handL: 'type', frontR: true, frontL: true, ...SIT_LEGS },
  // Ngồi bệ thấp (~24 cm, mép nệm): đùi dốc lên nhẹ, bàn chân đặt ra trước gối; tay gần máy đặt dọc đùi, bàn tay trên gối, tay xa buông bên hông. Khác `sit` (ghế ~45 cm).
  sitLow: { ...STAND_POSE, tilt: 6, neck: -2, armR: { a: 20, b: 58 }, armL: { a: 18, b: 40, rot: -1 }, handR: 'rest', handL: 'rest', frontR: true, frontL: false, legR: { a: 104, b: 72 }, legL: { a: 98, b: 66 } },
  // Nằm nghiêng, gối hơi co (co nhiều thì gối thò ra mép nệm vì phối cảnh), hai tay xuôi theo thân, nằm trong chăn. Vẽ xoay 90° quanh đỉnh đầu (đầu phải, chân trái), dùng góc 3/4 quay ra máy.
  lie: { ...STAND_POSE, tilt: -4, neck: -6, armR: { a: 18, b: 24 }, armL: { a: 10, b: 20, rot: -1 }, legR: { a: 36, b: 40 }, legL: { a: 30, b: 30 } },
};

const mixLimb = (a: Limb, b: Limb, t: number): Limb => ({ a: a.a + (b.a - a.a) * t, b: a.b + (b.b - a.b) * t, rot: b.rot ?? a.rot });
/** Trộn hai dáng theo góc khớp; trạng thái rời (kiểu tay, đạo cụ, lớp vẽ) lấy theo dáng đích. */
export const mixPose = (a: JointPose, b: JointPose, t: number): JointPose => ({
  ...b,
  tilt: a.tilt + (b.tilt - a.tilt) * t, neck: a.neck + (b.neck - a.neck) * t,
  armR: mixLimb(a.armR, b.armR, t), armL: mixLimb(a.armL, b.armL, t), legR: mixLimb(a.legR, b.legR, t), legL: mixLimb(a.legL, b.legL, t),
  wristR: a.wristR + (b.wristR - a.wristR) * t, wristL: a.wristL + (b.wristL - a.wristL) * t,
});
const WALK_PASS: JointPose = { ...STAND_POSE, tilt: 4, legR: { a: 2, b: 2 }, legL: { a: 14, b: 48 } };
const WALK_KEYS = [TWIN_POSES.stride, WALK_PASS, mirrorPose(TWIN_POSES.stride), mirrorPose(WALK_PASS)];
/** Vòng bước tại chỗ, phase 0–1. Chưa dịch người trên sàn; đi qua phòng phải tự cộng x theo chân trụ để khỏi trượt. */
export const sampleWalk = (phase: number): JointPose => {
  const t = (((phase % 1) + 1) % 1) * 4, i = Math.floor(t), u = t - i;
  return mixPose(WALK_KEYS[i], WALK_KEYS[(i + 1) % 4], u * u * (3 - 2 * u));
};

const circle = (p: P, r: number) => `M ${p.x - r} ${p.y} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
/** Một khối liền: vẽ nền mực rồi tô màu đè lên, nên khớp gập bao nhiêu cũng không có đường cắt ngang bên trong. */
const Blob: React.FC<{ d: string[]; fill: string; w?: number }> = ({ d, fill, w = 4 }) => {
  const mode = React.useContext(OutlineCtx);
  const tone = React.useContext(ToneCtx);
  // Da giữ cùng màu nền với mặt; không đổi cả cánh tay thành một màu da khác để tách lớp.
  fill = fill === PALETTE.skin ? fill : toned(fill, tone);
  const ink = mode === 'tint' ? darken(fill) : PALETTE.ink;
  return (
    <g>
      {mode !== 'none' && d.map((s, i) => <path key={i} d={s} fill={ink} stroke={ink} style={{ strokeWidth: lw(w * 2) }} strokeLinejoin="round" />)}
      {d.map((s, i) => <path key={`f${i}`} d={s} fill={fill} stroke="none" />)}
    </g>
  );
};
/** Nếp gấp ở mặt trong khớp; thẳng thì không có nếp. */
const crease = (c: { root: P; mid: P; end: P }, r: number) => {
  const u = { x: c.root.x - c.mid.x, y: c.root.y - c.mid.y };
  const v = { x: c.end.x - c.mid.x, y: c.end.y - c.mid.y };
  const lu = Math.hypot(u.x, u.y), lv = Math.hypot(v.x, v.y);
  const b = { x: u.x / lu + v.x / lv, y: u.y / lu + v.y / lv };
  const lb = Math.hypot(b.x, b.y);
  if (lb < 1) return null; // chỉ hiện khi gập trên ~60°
  const n = { x: b.x / lb, y: b.y / lb };
  return <path d={`M ${c.mid.x + n.x * r} ${c.mid.y + n.y * r} L ${c.mid.x + n.x * r * 0.25} ${c.mid.y + n.y * r * 0.25}`} fill="none" style={{ strokeWidth: lw(2.5), stroke: 'var(--inner-ink, #2b2b2b)' }} strokeLinecap="round" />;
};

// Bàn tay cartoon một đường bao liên tục: không ghép các đốt bằng capsule gây gai/cục ở đầu ngón.
// Hệ bàn tay: cổ tay (0,0), đầu ngón theo +y, ngón cái theo +x trước khi lật bên.
const HAND_OUTLINE: Record<Exclude<HandKind, 'none'>, string> = {
  rest: 'M -13 -9 Q -14 1 -16 10 Q -18 22 -14 32 Q -12 38 -8 35 Q -5 40 -1 36 Q 3 39 7 34 Q 12 33 13 27 L 14 20 Q 21 24 24 18 Q 25 15 20 11 L 14 5 Q 13 -2 13 -9 Z',
  open: 'M -13 -9 Q -15 2 -16 12 L -17 33 Q -17 38 -13 38 Q -9 38 -9 32 L -9 23 L -8 41 Q -8 46 -4 46 Q 0 46 0 40 L 0 24 L 1 43 Q 1 48 5 47 Q 9 47 9 41 L 9 24 L 11 36 Q 12 41 16 40 Q 20 39 19 33 L 17 17 L 23 22 Q 28 25 30 21 Q 32 17 28 14 L 18 5 Q 14 1 13 -9 Z',
  hold: 'M -13 -9 Q -16 1 -17 12 Q -18 24 -11 29 Q -3 34 7 30 Q 16 28 17 20 L 17 16 Q 23 17 24 12 Q 25 7 20 6 Q 15 5 11 9 Q 10 1 13 -9 Z',
  fist: 'M -13 -9 Q -16 2 -16 14 Q -17 25 -9 29 Q 0 33 10 29 Q 18 26 18 18 Q 23 16 21 11 Q 18 6 12 8 Q 11 0 13 -9 Z',
  type: 'M -13 -9 Q -15 0 -16 12 Q -16 25 -11 31 Q -8 34 -5 31 L -5 24 L -1 36 Q 1 40 5 38 Q 8 36 6 31 L 5 23 L 10 34 Q 13 38 16 35 Q 18 33 16 29 L 12 19 L 20 24 Q 24 26 26 22 Q 28 18 24 15 L 16 8 Q 13 3 13 -9 Z',
  phone: 'M -13 -9 Q -16 2 -16 15 Q -16 29 -10 34 Q -6 37 -2 34 Q 2 37 6 34 Q 12 33 14 26 L 15 20 Q 22 20 23 15 Q 24 10 19 8 L 12 6 Q 11 0 13 -9 Z',
};
const handShapes = (at: P, deg: number, s: 1 | -1, kind: HandKind, size = 1.12): string[] => {
  if (kind === 'none') return [];
  const c = Math.cos(deg * Math.PI / 180), n = Math.sin(deg * Math.PI / 180);
  return [HAND_OUTLINE[kind].replace(/(-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)/g, (_, x, y) => {
    const px = Number(x) * s, py = Number(y);
    return `${at.x + (px * c - py * n) * size} ${at.y + (px * n + py * c) * size}`;
  })];
};

// detail nhận facing để chữ/số trên áo không bị lật ngược khi quay trái
type Detail = React.ReactNode | ((facing: 1 | -1) => React.ReactNode);
export type Outfit = {
  shirt: string; torso: string; hem: [number, number][]; sleeveEnd: number; cuff?: string;
  pants: string; pantsLen: 'long' | 'short'; stripe?: string;
  socks?: { color: string; stripe: string };
  Foot: React.FC<{ side: 'R' | 'L'; view: View }>;
  detail: Detail;
  views?: Partial<Record<View, { torso: string; hem: [number, number][]; detail: Detail }>>;
  /** Vóc dáng riêng; bỏ trống = DEFAULT_BUILD. */
  build?: Partial<Build>;
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

// Mảng bóng tự vẽ (quy tắc 11/11): bóng tay áo đổ lên bắp tay, ngay dưới mép tay áo — một dải hẹp, mép dưới cong.
const sleeveShadow = (c: { root: P; mid: P }, se: number) => {
  const a = mix(c.root, c.mid, se), b = mix(c.root, c.mid, Math.min(0.95, se + 0.17)), n = normalOf(c.root, c.mid);
  const t = { x: (b.x - a.x), y: (b.y - a.y) }, l = Math.hypot(t.x, t.y) || 1;
  const tip = { x: b.x + (t.x / l) * 5, y: b.y + (t.y / l) * 5 };
  return `M ${a.x + n.x * 16} ${a.y + n.y * 16} L ${a.x - n.x * 16} ${a.y - n.y * 16} L ${b.x - n.x * 13} ${b.y - n.y * 13} Q ${tip.x} ${tip.y} ${b.x + n.x * 13} ${b.y + n.y * 13} Z`;
};
// Vệt bóng nhỏ ở mặt trong gối khi chân gập (vải dồn lại), chỉ hiện khi gập trên ~35°.
const kneeShadow = (c: { root: P; mid: P; end: P }) => {
  const u = { x: c.root.x - c.mid.x, y: c.root.y - c.mid.y }, v = { x: c.end.x - c.mid.x, y: c.end.y - c.mid.y };
  const lu = Math.hypot(u.x, u.y), lv = Math.hypot(v.x, v.y), bx = u.x / lu + v.x / lv, by = u.y / lu + v.y / lv, lb = Math.hypot(bx, by);
  if (lb < 0.6) return null;
  const nx = bx / lb, ny = by / lb, cx = c.mid.x + nx * 10, cy = c.mid.y + ny * 10, ang = (Math.atan2(ny, nx) * 180) / Math.PI + 90;
  return <ellipse cx={cx} cy={cy} rx={15} ry={6} transform={`rotate(${ang} ${cx} ${cy})`} fill="#1f2a26" opacity={0.18} stroke="none" />;
};

const Leg: React.FC<{ c: ReturnType<typeof solveRig>['legR']; side: 'R' | 'L'; foot: number; o: Outfit; view: View }> = ({ c, side, foot, o, view }) => {
  const { root: hip, mid: knee, end: ankle } = c;
  const long = o.pantsLen === 'long';
  const B = o.build ? { ...DEFAULT_BUILD, ...o.build } : DEFAULT_BUILD;
  const cloth = long ? { root: hip, mid: knee, end: mix(knee, ankle, B.pantsEnd) } : { root: hip, mid: mix(hip, knee, 0.4), end: mix(hip, knee, 0.75) };
  const widths: [number, number, number] = long ? B.pants : view === 'side' && B.shortsSide ? B.shortsSide : [31, 31, 32];
  // Đùi đưa hẳn ra trước (ngồi, ngồi xổm): bàn chân cũng quay về trước, không xoè ngược lại như lúc đứng.
  const shoe = <g transform={`translate(${ankle.x} ${ankle.y}) rotate(${foot})${B.foot !== 1 ? ` scale(${B.foot})` : ''}`}><o.Foot side={view === 'three' && knee.x - hip.x > 60 ? 'L' : side} view={view} /></g>;
  return (
    <g>
      {!o.socks && shoe}
      <Blob fill={PALETTE.skin} d={[limbContour({ root: hip, mid: knee, end: ankle }, [24, 19, 15]), circle(knee, 19), circle(ankle, 15)]} />
      {o.socks && (
        <g>
          <Blob fill={o.socks.color} d={[limbContour({ root: mix(knee, ankle, 0.25), mid: mix(knee, ankle, 0.6), end: ankle }, [17, 15.5, 15]), circle(ankle, 15)]} />
          <path d={`${across(knee, ankle, 0.34, 15)} ${across(knee, ankle, 0.42, 15)}`} fill="none" stroke={o.socks.stripe} style={{ strokeWidth: lw(2.6) }} />
        </g>
      )}
      {o.socks && shoe}
      <Blob fill={o.pants} d={[limbContour(cloth, widths), circle(hip, 30), softEnd(cloth.mid, cloth.end, widths[2], 3), ...(long ? [circle(knee, widths[1])] : [])]} />
      {long && kneeShadow(c)}
      {long && crease(c, 22)}
      {long && !(view === 'side' && side === 'L') && <path d={foldPath(knee, ankle, side)} fill="none" style={{ strokeWidth: lw(2.5), stroke: 'var(--inner-ink, #2b2b2b)' }} strokeLinecap="round" />}
      {o.stripe && <path d={alongSide(hip, knee, side === 'R' ? 30 : -30)} fill="none" stroke={o.stripe} style={{ strokeWidth: lw(3.5) }} />}
    </g>
  );
};

// Tay gập nhiều nhìn gầy đi so với tay buông, nên khối tay đầy dần theo độ gập.
const armBend = (c: ReturnType<typeof solveRig>['armR']) => {
  const u = Math.atan2(c.mid.y - c.root.y, c.mid.x - c.root.x), f = Math.atan2(c.end.y - c.mid.y, c.end.x - c.mid.x);
  return Math.abs(((((f - u) * 180) / Math.PI + 540) % 360) - 180);
};
const armWidths = (c: ReturnType<typeof solveRig>['armR'], w0: [number, number, number] = DEFAULT_BUILD.arm): [number, number, number] => {
  const k = clamp((armBend(c) - 30) / 60);
  return [w0[0] + 1.5 * k, w0[1] + 4 * k, w0[2] + 3.5 * k];
};
const armShapes = (c: ReturnType<typeof solveRig>['armR'], w0?: [number, number, number]) => {
  const w = armWidths(c, w0);
  return [limbContour(c, w), circle(c.mid, w[1]), circle(c.root, w[0])];
};
// Tay gập mạnh (cẳng tay quặt ngược lên ngực): tách bắp tay (nằm dưới tay áo) và cẳng tay (đè lên tay áo),
// nếu vẽ chung một khối rồi phủ tay áo lên thì mép áo cắt ngang cẳng tay thành răng cưa.
const FOLD_BEND = 95;
const upperArmShapes = (c: ReturnType<typeof solveRig>['armR'], w0?: [number, number, number]) => {
  const w = armWidths(c, w0);
  return [limbContour({ root: c.root, mid: mix(c.root, c.mid, 0.5), end: c.mid }, [w[0], (w[0] + w[1]) / 2, w[1]]), circle(c.root, w[0]), circle(c.mid, w[1])];
};
const foreArmShapes = (c: ReturnType<typeof solveRig>['armR'], w0?: [number, number, number]) => {
  const w = armWidths(c, w0);
  return [limbContour({ root: c.mid, mid: mix(c.mid, c.end, 0.5), end: c.end }, [w[1], (w[1] + w[2]) / 2, w[2]]), circle(c.mid, w[1])];
};
const sleeveShapes = (c: ReturnType<typeof solveRig>['armR'], o: Outfit) => {
  const end = mix(c.root, c.mid, o.sleeveEnd);
  const mid = mix(c.root, end, 0.55);
  const sw = o.build?.sleeve ?? DEFAULT_BUILD.sleeve;
  return [limbContour({ root: c.root, mid, end }, sw), circle(c.root, sw[0]), softEnd(mid, end, sw[2], 3)];
};
/** Tay đưa trước ngực: xoá cung vai phía trong để tay áo liền với thân áo. */
// Miếng vá che đường nối tay áo–thân; cắt theo thân áo và đầu vai để đầu mút không đè mất viền ngoài ở dốc vai.
const ShoulderPatch: React.FC<{ c: ReturnType<typeof solveRig>['armR']; fill: string; torso: string; up?: boolean }> = ({ c, fill, torso, up }) => {
  const clip = useClipId('shoulder');
  return (
    <g>
      <clipPath id={clip}><path d={torso} /><path d={circle(c.root, 29)} /></clipPath>
      <g clipPath={`url(#${clip})`}>
        {up ? <path d={`M ${c.root.x - 30} ${c.root.y} A 30 30 0 0 1 ${c.root.x + 30} ${c.root.y} Z`} fill={fill} stroke="none" />
          : <path d={`M ${c.root.x - (c.root.x < 0 ? 14.4 : -14.4)} ${c.root.y - 30.8} A 34 34 0 0 ${c.root.x < 0 ? 1 : 0} ${c.root.x + (c.root.x < 0 ? 14.4 : -14.4)} ${c.root.y + 30.8} Z`} fill={fill} stroke="none" />}
      </g>
    </g>
  );
};
const Cuff: React.FC<{ c: ReturnType<typeof solveRig>['armR']; o: Outfit }> = ({ c, o }) => (o.cuff ? <path d={across(c.root, c.mid, o.sleeveEnd * 0.9, 26)} fill="none" stroke={o.cuff} style={{ strokeWidth: lw(3.5) }} /> : null);

/** Vạt áo giữ phương thẳng đứng trong khi thân áo nghiêng, nên cúi người không làm lộ mông ra ngoài áo. */
const hemDrape = (o: Pick<Outfit, 'hem'>, tilt: number) => {
  const c = Math.cos((-tilt * Math.PI) / 180), n = Math.sin((-tilt * Math.PI) / 180);
  const [a, b, d, e, g, h, i] = o.hem.map(([x, y]) => { const u = x - PELVIS.x, v = y - PELVIS.y; return `${PELVIS.x + u * c - v * n} ${PELVIS.y + u * n + v * c}`; });
  return `M ${a} L ${b} L ${d} Q ${e} ${g} Q ${h} ${i} Z`;
};

const Phone: React.FC<{ at: P; deg: number }> = ({ at, deg }) => (
  <g transform={`translate(${at.x} ${at.y}) rotate(${deg})`} stroke={PALETTE.ink} style={{ strokeWidth: lw(3.5) }}>
    <rect x={-13} y={6} width={26} height={62} rx={6} fill="#7f8f94" />
  </g>
);
const Bowl: React.FC<{ at: P }> = ({ at }) => (
  <g transform={`translate(${at.x} ${at.y - 26})`} stroke={PALETTE.ink} style={{ strokeWidth: lw(3.5) }}>
    <path d="M -46 -12 Q -42 30 0 32 Q 42 30 46 -12 Z" fill="#f4efe3" />
    <ellipse cx={0} cy={-12} rx={46} ry={9} fill="#d9d2c0" />
  </g>
);

/**
 * Ánh sáng theo cảnh, để nhân vật có khối và ăn với nền 3D. x, y: hướng tới nguồn sáng trên màn hình
 * (cửa sổ phải-trên ≈ { x: 0.8, y: -0.6 }). Không truyền thì vẽ phẳng như bảng mẫu.
 */
export type Light = {
  x: number; y: number;
  shade?: string; amount?: number; // legacy: không còn dùng tạo bóng tự động từ 11/11/2026
  depth?: number; soft?: number; // bề rộng mảng tối và độ mềm đường chuyển, đơn vị rig
  rim?: number; rimColor?: string; // viền sáng phía nguồn sáng (screen)
  back?: number; // 0–1: nguồn sáng ở sau người so với máy (ngược sáng) → mặt hướng máy tối hơn, viền sáng rõ hơn
  ground?: number; // độ đậm bóng tiếp đất
  gx?: number; gy?: number; // lệch bóng tiếp đất trên màn hình (đơn vị rig), lấy từ lightFor của bối cảnh
  line?: number; // hệ số độ dày nét, 1 = như mẫu
};
/** 11/11: chỉ bóng vẽ sẵn. Giữ wrapper/API cho các shot cũ, không tạo mask/blur/rim theo đèn. */
const Shade: React.FC<{ l?: Light; facing: 1 | -1; behind?: React.ReactNode; size?: number; children: React.ReactNode }> = ({ children }) => <>{children}</>;

/** Ghép nhân vật từ khung xương: bàn chân → chân → tay sau → áo → đầu → tay trước. */
export const Rigged: React.FC<{ pose: JointPose; outfit: Outfit; head: React.ReactNode; x: number; y: number; scale: number; light?: Light; outline?: Outline; headOutline?: Outline }> = ({ pose: raw, outfit: outfit, head, x, y, scale, light: l, outline = 'none', headOutline }) => {
  const awayClip = useClipId('away');
  const hemClip = useClipId('drawn-hem');
  // Quy tắc 11/11: không tô tối/sáng nguyên chi để tách lớp; tách bằng che khuất và mảng bóng tự vẽ. Giữ hàm để không đổi cấu trúc.
  const back = (n: React.ReactNode) => n;
  const front = (n: React.ReactNode) => n;
  const view: View = outfit.views ? raw.view ?? 'three' : 'three'; // nhân vật chưa vẽ đủ góc thì giữ 3/4
  const o = { ...outfit, ...outfit.views?.[view] };
  // chính diện và sau lưng không lật được: hai bên phải giữ đúng chỗ
  const facing = outfit.views && view !== 'front' && view !== 'back' ? raw.facing ?? 1 : 1;
  const pose = facing === -1 ? mirrorPose(raw) : raw;
  const B = o.build ? { ...DEFAULT_BUILD, ...o.build } : DEFAULT_BUILD;
  const r = solveRig({ ...pose, view }, B);
  const side = view === 'side';
  const away = view === 'back' || view === 'quarter'; // nhìn từ sau: tay đưa ra trước bị thân che
  const frontR = side || (!away && pose.frontR); // nghiêng: tay gần luôn trước thân, tay xa luôn sau thân
  const frontL = !side && !away && pose.frontL;
  const crotch = 414 - 110 * clamp(Math.max(Math.abs(pose.legR.a), Math.abs(pose.legL.a)) / 70); // đáy quần kéo lên khi đùi đưa ra
  // under: vẽ dưới tay áo; over: vẽ đè lên tay áo (chỉ có khi tay gập mạnh).
  const arm = (c: typeof r.armR, s: 1 | -1, wrist: number, kind: HandKind, held?: React.ReactNode) => {
    const hand = handShapes(c.end, c.deg + lim(wrist, 'wrist'), s, kind, B.hand);
    const sleeveSh = <path d={sleeveShadow(c, o.sleeveEnd)} fill={PALETTE.skinShadow} opacity={0.55} stroke="none" />;
    const one = <g>{held}<Blob fill={PALETTE.skin} d={[...armShapes(c, B.arm), ...hand]} />{sleeveSh}</g>;
    if (armBend(c) < FOLD_BEND) return { one, under: one, over: null };
    return { one, under: <g><Blob fill={PALETTE.skin} d={upperArmShapes(c, B.arm)} />{sleeveSh}</g>, over: <g>{held}<Blob fill={PALETTE.skin} d={[...foreArmShapes(c, B.arm), ...hand]} /></g> };
  };
  const whole = (a: { one: React.ReactNode }) => a.one; // tay sau thân/không có tay áo đè: một khối liền, không tách
  // Đạo cụ vẽ ngay trước cánh tay cầm nó, nên luôn nằm dưới ngón tay và cùng lớp với tay. Quay trái thì tay phải giải phẫu ở vế L.
  const phoneOnL = facing === -1;
  const frontSleeve = (c: typeof r.armR) => [...sleeveShapes(c, o), ...(side ? [] : [circle(c.root, B.sleeve[0] + 4)])]; // bọc góc vai của thân áo, khỏi lòi một mẩu khi giơ tay
  const held = pose.prop === 'bowl' ? <Bowl at={mix(r.armR.end, r.armL.end, 0.5)} />
    : pose.prop === 'phone' ? <Phone at={(phoneOnL ? r.armL : r.armR).end} deg={(phoneOnL ? r.armL : r.armR).deg + lim(phoneOnL ? pose.wristL : pose.wristR, 'wrist')} /> : null;
  const armR = arm(r.armR, ((view === 'back' ? -1 : 1) * (pose.palmUp === 'R' ? -1 : 1)) as 1 | -1, pose.wristR, pose.handR, pose.prop === 'phone' && !phoneOnL ? held : null);
  const armL = arm(r.armL, ((side || away ? 1 : -1) * (pose.palmUp === 'L' ? -1 : 1)) as 1 | -1, pose.wristL, pose.handL, pose.prop === 'bowl' || phoneOnL ? held : null);
  return (
    <OutlineCtx.Provider value={outline}>
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`} strokeLinecap="round" strokeLinejoin="round" style={{ ['--lw' as string]: l?.line ?? 1, ...(outline !== 'ink' ? { ['--inner-ink' as string]: 'rgba(32,24,18,.36)' } : {}) } as React.CSSProperties}>
      {/* Một nét bóng tiếp xúc vẽ sẵn, bám mặt sàn; không kéo bóng theo nguồn sáng. */}
      {pose.support !== 'bed' && <ellipse data-shadow="drawn-contact" cx={(r.legR.end.x + r.legL.end.x) / 2 + pose.x} cy={589 + pose.y} rx={103} ry={10} fill="#232a26" opacity={0.26} stroke="none" />}
      <g transform={`translate(${pose.x} ${r.dy})`}>
        {side && <g data-limb="L" transform={`rotate(${r.tilt} ${PELVIS.x} ${PELVIS.y})`}>{back(<Shade l={l} facing={facing} size={0.6}>{whole(armL)}</Shade>)}</g>/* nghiêng: tay xa ở phía bên kia người, nằm sau cả hai chân */}
        <Shade l={l} facing={facing} size={0.85}>
          {/* Đáy quần là vòm cong (∩) phủ lên khe hai ống, để đỉnh khe tròn, không chọc mũi nhọn xuống giữa háng. */}
          {!side && <Blob fill={o.pants} d={[`M -30 335 H 32 L 30 ${crotch - 4} Q 1 ${crotch - 30} -28 ${crotch - 4} Z`]} />}
          {/* data-limb: nhãn tay/chân vế L (phía xa máy ở 3/4, nghiêng) cho lớp 2.5D; không ảnh hưởng hình vẽ */}
          <g data-limb="L">{back(<Leg c={r.legL} side="L" foot={r.footL} o={o} view={view} />)}</g>
        </Shade>
        <Shade l={l} facing={facing} size={0.85}>
          <Leg c={r.legR} side="R" foot={r.footR} o={o} view={view} />
          <path d={side ? 'M -30 318 H 36 V 352 H -30 Z' : `M -46 318 H 48 V 350 H 28 Q 1 ${Math.min(crotch - 34, 372)} -26 350 H -46 Z`} fill={o.pants} stroke="none" />
        </Shade>
        <g transform={`rotate(${r.tilt} ${PELVIS.x} ${PELVIS.y})`}>
          {/* Nhìn từ sau: khuỷu, cẳng tay hai bên nằm ngoài hông nên đè lên quần; phần tay vào giữa thân (bàn tay đưa ra trước) bị thân che nên cắt bỏ dải giữa. */}
          {away && <g clipPath={`url(#${awayClip})`}><clipPath id={awayClip}><rect x={-400} y={-200} width={358} height={900} /><rect x={42} y={-200} width={358} height={900} /></clipPath>{back(<Shade l={l} facing={facing} size={0.6}>{whole(armL)}{whole(armR)}</Shade>)}</g>}
          {!frontL && !side && !away && <g data-limb="L">{back(<Shade l={l} facing={facing} size={0.6}>{whole(armL)}</Shade>)}</g>}
          {!frontR && !away && back(<Shade l={l} facing={facing} size={0.6}>{whole(armR)}</Shade>)}
          <Shade l={l} facing={facing} size={1.3}>
            <Blob fill={o.shirt} d={[o.torso, hemDrape(o, r.tilt), ...(frontR ? [] : sleeveShapes(r.armR, o)), ...(frontL ? [] : sleeveShapes(r.armL, o))]} />
            {!frontR && <Cuff c={r.armR} o={o} />}
            {!frontL && !side && <Cuff c={r.armL} o={o} />}
            {(view === 'three' || view === 'front') && <g><defs><clipPath id={hemClip}><path d={[o.torso, hemDrape(o, r.tilt)].join(' ')} /></clipPath></defs><path data-shadow="drawn-hem" clipPath={`url(#${hemClip})`} d="M-49 337Q-19 350 12 341Q36 348 56 337L56 348Q35 360 13 355Q-20 365-58 351Z" fill="#253f37" opacity={0.2} stroke="none" />{/* mặt hông phía xa của thân áo (quay khỏi máy): một mảng tự vẽ để thân có khối, không theo đèn */}<path data-shadow="drawn-side" clipPath={`url(#${hemClip})`} d={view === 'front' ? 'M78 268Q56 276 52 300Q48 340 54 366H110V268Z' : 'M70 268Q48 276 42 300Q38 340 42 366H110V268Z'} fill="#253f37" opacity={0.12} stroke="none" /></g>}
            <g style={{ stroke: 'var(--inner-ink, #2b2b2b)' }}>{typeof o.detail === 'function' ? o.detail(facing) : o.detail}</g>
          </Shade>
          {/* data-part="head": nhãn để lớp 2.5D tách da đầu khỏi da tay khi cắt mảng; không ảnh hưởng hình vẽ */}
          <g data-part="head" transform={`rotate(${r.neck} ${NECK.x} ${NECK.y})`}><Shade l={l} facing={facing} size={2.2}><OutlineCtx.Provider value={headOutline ?? outline}>{head}</OutlineCtx.Provider></Shade></g>
          {pose.prop === 'phoneLandscape' && <g data-prop="phone-landscape" transform={`translate(${(r.armR.end.x+r.armL.end.x)/2} ${(r.armR.end.y+r.armL.end.y)/2})`}>
            <rect x={-49} y={-16} width={98} height={51} rx={8} fill="#34434a" />
            <rect x={-40} y={-10} width={80} height={38} rx={4} fill="#80978d" />
            <path d="M-29 17L-10 0 3 13 18-3 32 14" stroke="#c7d5bc" strokeWidth={3} fill="none" />
          </g>}
          {frontL && <g data-limb="L"><Shade l={l} facing={facing} size={0.6} behind={<path d={o.torso} />}>{armL.under}<Blob fill={o.shirt} d={frontSleeve(r.armL)} /><ShoulderPatch c={r.armL} fill={o.shirt} torso={o.torso} /><Cuff c={r.armL} o={o} />{front(armL.over)}</Shade></g>}
          {frontR && <Shade l={l} facing={facing} size={0.6} behind={<path d={o.torso} />}>{armR.under}<Blob fill={o.shirt} d={frontSleeve(r.armR)} /><ShoulderPatch c={r.armR} fill={o.shirt} torso={o.torso} up={side} /><Cuff c={r.armR} o={o} />{front(armR.over)}</Shade>}
        </g>
      </g>
    </g>
    </OutlineCtx.Provider>
  );
};

// Bàn chân các góc mới, gốc tại mắt cá; 3/4 giữ nét cũ của mẫu B.
const FLAT_FOOT: Record<Exclude<View, 'three'>, { body: string; band?: string; sole: string }> = {
  front: { body: 'M -24 6 Q -34 26 -32 34 Q 0 42 32 34 Q 34 26 24 6 Z', band: 'M -30 18 Q 0 6 30 18 L 33 30 Q 0 20 -33 30 Z', sole: 'M -34 32 Q 0 40 34 32 L 34 38 Q 0 46 -34 38 Z' },
  back: { body: 'M -24 6 Q -34 26 -32 34 Q 0 42 32 34 Q 34 26 24 6 Z', sole: 'M -34 32 Q 0 40 34 32 L 34 38 Q 0 46 -34 38 Z' },
  side: { body: 'M -20 4 Q -30 22 -26 32 Q 20 40 68 32 Q 66 20 40 16 Q 18 12 16 4 Z', band: 'M 4 14 Q 30 6 48 20 L 50 30 Q 28 20 4 28 Z', sole: 'M -28 30 Q 20 38 70 30 L 70 36 Q 20 46 -29 38 Z' },
  quarter: { body: 'M -24 6 Q -34 26 -30 34 Q 6 42 44 33 Q 44 24 26 18 L 24 6 Z', band: 'M 16 18 Q 34 16 42 26 L 44 32 Q 30 28 14 30 Z', sole: 'M -32 32 Q 6 40 46 31 L 46 37 Q 6 46 -32 38 Z' },
};
const FlatFoot: React.FC<{ view: Exclude<View, 'three'>; upper: string; sole: string; band: string }> = ({ view, upper, sole, band }) => {
  const f = FLAT_FOOT[view];
  return (
    <g style={{ strokeWidth: lw(4), stroke: 'var(--inner-ink, #2b2b2b)' }}>
      <path d={f.body} fill={upper} />
      {f.band && <path d={f.band} fill={band} style={{ strokeWidth: lw(2.5) }} />}
      <path d={f.sole} fill={sole} style={{ strokeWidth: lw(2.5) }} />
    </g>
  );
};

// Bàn chân gốc tại mắt cá. 3/4 vẽ theo nét cũ của mẫu B.
const Slipper: React.FC<{ side: 'R' | 'L'; view: View }> = ({ side, view }) => {
  if (view !== 'three') return <FlatFoot view={view} upper={PALETTE.skin} sole={PALETTE.nam.sole} band={PALETTE.nam.slippers} />;
  return (
    <g transform={side === 'R' ? 'translate(33 -555)' : 'translate(-35 -555)'} style={{ strokeWidth: lw(4), stroke: 'var(--inner-ink, #2b2b2b)' }}>
      {side === 'R' ? (
        <>
          <path d="M -54 561 Q -80 568 -78 585 Q -53 597 -5 586 L -7 575 Q -20 560 -54 561 Z" fill={PALETTE.skin} />
          <path d="M -78 583 Q -45 593 -6 583 L -6 590 Q -43 601 -79 590 Z" fill={PALETTE.nam.sole} style={{ strokeWidth: lw(2.5) }} />
          <path d="M -64 565 Q -38 553 -17 567 L -12 579 Q -39 564 -70 580 Z" fill={PALETTE.nam.slippers} style={{ strokeWidth: lw(2.5) }} />
        </>
      ) : (
        <>
          <path d="M 23 561 Q 44 559 67 568 Q 91 571 89 584 Q 57 596 15 585 L 13 573 Z" fill={PALETTE.skin} />
          <path d="M 15 583 Q 56 591 89 581 L 90 588 Q 54 600 15 591 Z" fill={PALETTE.nam.sole} style={{ strokeWidth: lw(2.5) }} />
          <path d="M 26 563 Q 52 559 71 573 L 75 583 Q 49 568 20 578 Z" fill={PALETTE.nam.slippers} style={{ strokeWidth: lw(2.5) }} />
        </>
      )}
    </g>
  );
};

const TWIN_FOLD = { fill: 'none', style: { strokeWidth: lw(2.5) } };
const TWIN_VIEWS: Outfit['views'] = {
  front: {
    torso: 'M -24 178 Q -60 182 -86 212 L -60 262 Q -64 312 -62 352 Q -30 366 0 360 Q 30 366 62 352 Q 64 312 60 262 L 86 212 Q 60 182 24 178 Q 0 198 -24 178 Z',
    hem: [[-50, 322], [50, 322], [62, 350], [30, 366], [0, 360], [-30, 366], [-62, 350]],
    detail: <path d="M -24 179 Q -14 200 0 200 Q 14 200 24 179 M -56 218 Q -54 241 -53 262 M 56 218 Q 54 241 53 262 M -34 330 Q 0 344 34 330" {...TWIN_FOLD} />,
  },
  back: {
    torso: 'M -24 180 Q 0 190 24 180 Q 60 182 86 212 L 60 262 Q 64 312 62 352 Q 30 366 0 360 Q -30 366 -62 352 Q -64 312 -60 262 L -86 212 Q -60 182 -24 180 Z',
    hem: [[-50, 322], [50, 322], [62, 350], [30, 366], [0, 360], [-30, 366], [-62, 350]],
    detail: <path d="M -36 340 Q 5 356 46 330" {...TWIN_FOLD} />,
  },
  quarter: {
    torso: 'M -18 180 Q 6 190 26 180 Q 58 182 80 212 L 56 262 Q 60 312 60 350 Q 30 366 4 358 Q -28 366 -60 352 Q -64 312 -58 262 L -84 212 Q -54 182 -18 180 Z',
    hem: [[-48, 322], [46, 322], [60, 350], [30, 366], [4, 358], [-28, 366], [-60, 352]],
    detail: <path d="M -40 342 Q 0 356 42 332" {...TWIN_FOLD} />,
  },
  side: {
    torso: 'M -14 180 Q -42 188 -48 226 Q -52 290 -56 352 Q -8 364 46 350 Q 50 296 42 236 Q 36 196 12 180 Q 0 190 -14 180 Z',
    hem: [[-44, 322], [38, 322], [46, 350], [20, 362], [-8, 364], [-30, 362], [-56, 352]],
    detail: <path d="M -14 181 Q 0 194 12 181 M 14 340 Q 26 342 36 332" {...TWIN_FOLD} />,
  },
};

export const TWIN_OUTFIT: Outfit = {
  shirt: PALETTE.nam.shirt, sleeveEnd: 0.5, hem: [[-52, 322], [50, 322], [63, 348], [38, 366], [12, 358], [-23, 372], [-64, 354]],
  torso: 'M -26 177 Q -60 181 -86 212 L -60 262 Q -66 312 -62 352 Q -23 370 12 356 Q 38 364 62 346 Q 56 304 54 262 L 80 212 Q 66 192 16 178 Q -7 196 -26 177 Z',
  pants: PALETTE.nam.pants, pantsLen: 'long', Foot: Slipper, views: TWIN_VIEWS,
  detail: <path d="M -26 179 Q -23 203 -1 203 Q 14 201 21 183 M -55 218 Q -53 241 -52 262 M 56 219 L 58 257 M -45 316 Q -19 333 15 320 M 15 340 Q 36 343 48 334" fill="none" style={{ strokeWidth: lw(2.5) }} />,
};

// Các bộ đồ của Nam: cùng thân áo/khung xương, chỉ đổi màu, cổ áo và chi tiết vẽ trên áo (góc chính diện và 3/4).
export type NamOutfitId = 'xanh' | 'ngu' | 'xam-tui' | 'dong-phuc' | 'the-thao';
export const NAM_COLORS = {
  ngu: PALETTE.nam.sleepShirt,
  xamTui: '#a7a8a0',
  uniform: '#f3f0e6', uniformPants: '#2f3b53', badge: '#3f6aa1',
  sport: '#d4673f', sportTrim: '#f6efe0', sportShorts: '#2c3138', sportSocks: '#f2ede2',
};
const withDetail = (front: React.ReactNode, base: Outfit['views'] = TWIN_VIEWS): Outfit['views'] => ({ ...base, front: { ...base!.front!, detail: front } });
const FRONT_FOLDS = 'M -56 218 Q -54 241 -53 262 M 56 218 Q 54 241 53 262 M -34 330 Q 0 344 34 330';
const UNIFORM_FRONT = (
  <>
    <path d={FRONT_FOLDS} {...TWIN_FOLD} />
    <path d="M 0 200 L 0 352" fill="none" style={{ strokeWidth: lw(2.5) }} />
    {[226, 262, 298, 334].map((y) => <circle key={y} cx={7} cy={y} r={3.6} fill="#e6e1d2" style={{ strokeWidth: lw(2) }} />)}
    <path d="M -30 250 H -8 V 278 Q -19 284 -30 278 Z" fill="none" style={{ strokeWidth: lw(2.4) }} />
    <path d="M -26 241 L -12 241 L -12 247 L -19 251 L -26 247 Z" fill={NAM_COLORS.badge} style={{ strokeWidth: lw(1.8) }} />
    <path d="M -26 178 L -4 206 L 0 196 L -8 180 Z" fill={NAM_COLORS.uniform} style={{ strokeWidth: lw(2.6) }} />
    <path d="M 26 178 L 4 206 L 0 196 L 8 180 Z" fill={NAM_COLORS.uniform} style={{ strokeWidth: lw(2.6) }} />
  </>
);
const UNIFORM_THREE = (
  <>
    <path d="M -45 316 Q -19 333 15 320 M 15 340 Q 36 343 48 334 M 1 203 L 3 352" fill="none" style={{ strokeWidth: lw(2.5) }} />
    <path d="M -26 179 L -6 210 L 0 201 L -10 181 Z M 21 182 L 3 210 L 0 201 L 8 185 Z" fill={NAM_COLORS.uniform} style={{ strokeWidth: lw(2.6) }} />
    <path d="M -36 252 H -14 V 278 Q -25 284 -36 278 Z" fill="none" style={{ strokeWidth: lw(2.4) }} />
  </>
);
const SPORT_FRONT = (
  <>
    <path d={FRONT_FOLDS} {...TWIN_FOLD} />
    <path d="M -24 179 L 0 210 L 24 179" fill="none" stroke={NAM_COLORS.sportTrim} style={{ strokeWidth: lw(6) }} />
    <path d="M -24 179 L 0 210 L 24 179" fill="none" style={{ strokeWidth: lw(2) }} />
    <path d="M -60 270 L -62 350 M 60 270 L 62 350" fill="none" stroke={NAM_COLORS.sportTrim} style={{ strokeWidth: lw(5) }} />
  </>
);
const POCKET_FRONT = (
  <>
    <path d="M -24 179 Q -14 200 0 200 Q 14 200 24 179" {...TWIN_FOLD} />
    <path d={FRONT_FOLDS} {...TWIN_FOLD} />
    <path d="M -36 236 H -10 V 266 Q -23 272 -36 266 Z" fill="#9a9b93" style={{ strokeWidth: lw(2.4) }} />
    <path d="M -36 242 H -10" fill="none" style={{ strokeWidth: lw(2) }} />
  </>
);
export const NAM_OUTFITS: Record<NamOutfitId, Outfit> = {
  xanh: TWIN_OUTFIT,
  ngu: { ...TWIN_OUTFIT, shirt: NAM_COLORS.ngu },
  /** Áo thường xám nhạt có túi ngực, dùng từ ngày 2 (P3 cần túi giữ điện thoại). */
  'xam-tui': { ...TWIN_OUTFIT, shirt: NAM_COLORS.xamTui, views: withDetail(POCKET_FRONT) },
  /** Đồng phục: sơ mi trắng cộc tay có cổ, nẹp cúc, túi ngực có phù hiệu; quần âu xanh than. */
  'dong-phuc': { ...TWIN_OUTFIT, shirt: NAM_COLORS.uniform, pants: NAM_COLORS.uniformPants, detail: UNIFORM_THREE, views: withDetail(UNIFORM_FRONT) },
  /** Đồ thể thao: áo cổ tim viền trắng, quần đùi sọc, tất trắng; giày chưa vẽ riêng, tạm dùng dép. */
  'the-thao': {
    ...TWIN_OUTFIT, shirt: NAM_COLORS.sport, cuff: NAM_COLORS.sportTrim, pants: NAM_COLORS.sportShorts, pantsLen: 'short', stripe: NAM_COLORS.sportTrim,
    socks: { color: NAM_COLORS.sportSocks, stripe: NAM_COLORS.sport }, views: withDetail(SPORT_FRONT),
  },
};

export const StudentTwinBody: React.FC<{
  mood?: NamMood;
  identity?: 'nam' | 'nguoi-kia';
  x?: number;
  y?: number;
  scale?: number;
  pose?: JointPose;
  shirt?: string;
  talk?: Talk;
  blink?: boolean;
  light?: Light;
  face?: FaceKey;
  faceFrom?: FaceKey;
  faceMix?: number;
  outline?: Outline;
  headOutline?: Outline;
  /** Bộ đồ của Nam; bỏ trống thì dùng áo thun theo `shirt` như trước. */
  outfit?: NamOutfitId;
  /** Tóc đung đưa (vật lý thứ cấp). */
  hair?: HairSway;
}> = ({ mood = 'sleepy', identity = 'nam', x = 0, y = 0, scale = 1, pose = STAND_POSE, shirt = PALETTE.nam.shirt, talk, blink, light, face, faceFrom, faceMix, outline, headOutline, outfit, hair }) => (
  <Rigged pose={pose} outfit={outfit ? NAM_OUTFITS[outfit] : { ...TWIN_OUTFIT, shirt }} x={x} y={y} scale={scale} light={light} outline={outline} headOutline={headOutline} head={<StudentTwinHead identity={identity} mood={mood} id="twin-full-body" view={pose.view} facing={pose.facing} talk={talk} blink={blink} face={face} faceFrom={faceFrom} faceMix={faceMix} hair={hair} />} />
);

/** Use this entry point for the mirror-born double; pose/held hands remain explicit. */
export const NguoiKia: React.FC<React.ComponentProps<typeof StudentTwinBody>> = (props) => <StudentTwinBody {...props} identity="nguoi-kia" />;

// ----------------------------------------------------------------------------
// 2. TÙNG — ĐỒ THỂ THAO ĐÁ BÓNG & TÓC NGẮN TỈA MẢNG KHỐI STYLE B
// ----------------------------------------------------------------------------
export type TungMood = 'annoyed' | 'focused' | 'normal';


/**
 * Đầu NGHIÊNG của Tùng, dựng lại theo ảnh tham chiếu (đo điểm mốc trên ảnh, quy ra đơn vị đầu): sọ thon, hơi cúi (cằm lùi so với trán),
 * hàm nhỏ cằm tròn, cổ nhỏ; tóc ÔM SÁT sọ — phủ cả gáy xuống tới chân tóc nhọn sau tai, mũi tóc nhọn trên trán, tai chữ C nằm ở mép tóc.
 * Chỉ dùng cho Tùng; đầu nghiêng của Nam và các góc khác giữ nguyên. Nét mặt dùng lại `SIDE_FACE`, mày/miệng đặt lại theo khuôn mặt mới.
 */
const TUNG_SIDE = {
  hair: 'M 48.6 68.4 C 52.2 64.8 56.1 52.1 56.1 52.1 C 56.1 52.1 51.6 44.5 48.6 41.2 C 45.6 37.9 40.8 35.4 38.4 32.4 C 36.0 29.4 34.3 23.5 34.3 23.5 C 34.3 23.5 28.3 27.5 25.5 26.9 C 22.7 26.3 17.3 20.1 17.3 20.1 C 17.3 20.1 11.0 24.1 7.8 23.5 C 4.6 22.9 -1.7 16.7 -1.7 16.7 C -1.7 16.7 -9.2 22.2 -9.2 22.2 C -9.2 22.2 -17.0 24.6 -20.8 26.3 C -24.6 28.0 -32.3 32.4 -32.3 32.4 C -32.3 32.4 -34.4 37.1 -34.4 37.1 C -34.4 37.1 -40.7 40.0 -43.9 41.9 C -47.1 43.8 -51.4 46.8 -53.4 48.7 C -55.4 50.6 -56.1 53.5 -56.1 53.5 C -56.1 53.5 -59.8 59.2 -60.9 63.7 C -62.0 68.2 -63.7 74.8 -62.9 80.7 C -62.1 86.6 -60.0 92.9 -56.1 99.0 C -52.2 105.1 -44.9 111.5 -39.8 117.4 C -34.7 123.3 -25.5 134.4 -25.5 134.4 C -25.5 134.4 -27.4 122.2 -27.6 116.7 C -27.8 111.2 -28.4 106.1 -26.9 101.7 C -25.4 97.3 -22.2 93.6 -18.7 90.2 C -15.2 86.8 -10.7 84.2 -5.8 81.3 C -0.9 78.3 10.5 72.5 10.5 72.5 C 10.5 72.5 18.0 69.1 18.0 69.1 C 18.0 69.1 29.2 74.0 34.3 73.9 C 39.4 73.8 45.0 72.0 48.6 68.4 Z',
  ear: 'M -27.6 92.2 C -25.9 87.4 -20.4 85.0 -16.7 84.7 C -12.9 84.4 -6.9 85.4 -5.1 90.2 C -3.3 95.0 -4.0 108.5 -5.8 113.3 C -7.6 118.0 -12.5 118.7 -16.0 118.7 C -19.5 118.7 -25.0 117.7 -26.9 113.3 C -28.8 108.9 -29.3 97.0 -27.6 92.2 Z',
  earLine: 'M -18.7 98.3 Q -9.9 97.7 -7.2 107.9',
  // sọ phía sau (ẩn dưới tóc) rồi trán–mũi–môi; hàm/cằm sinh theo độ mở miệng
  back: [[-25.5, 134.4], [-35, 119], [-47, 101], [-53, 81], [-49, 58], [-27, 41], [-6, 28], [22, 30], [40, 40], [48.6, 55.5]] as [number, number][], // nằm trong đường bao tóc, không lòi da ra mép tóc
  front: [[47.9, 67.7], [49.9, 77.9], [51.3, 90.2], [52.0, 101.7], [54.4, 114.0], [49.9, 120.8], [48.6, 127.2]] as [number, number][],
};
const catmull = (pts: [number, number][], closed: boolean) => {
  const n = pts.length, at = (i: number) => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2), t = 0.5 / 3;
    d += ` C ${(p1[0] + (p2[0] - p0[0]) * t).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) * t).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) * t).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) * t).toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d + (closed ? ' Z' : '');
};
const tungSkinPath = (d: number) => {
  const b = 0.3 * d;
  const lower: [number, number][] = d > 0
    ? [[48.6, 127.2], [41, 131.5 + 0.3 * d], [46.5 - b, 132 + d], [42.5 - b, 142 + d], [34.3 - 0.2 * d, 149.3 + 0.8 * d], [18, 151 + 0.4 * d], [6, 148]]
    : [[48.6, 127.2], [46.5, 131.7], [42.5, 141.9], [34.3, 149.3], [18, 151], [6, 148]];
  const pts = [...TUNG_SIDE.back, ...TUNG_SIDE.front.slice(0, -1), ...lower, [-12, 142] as [number, number]];
  return catmull(pts, true);
};
const NECK_D = 'M -22 112 L -23 172 Q -24 181 -29 186 Q -8 196 16 191 Q 8 180 4 160 L 3 112 Z';
const NECK_T = 'translate(0 184) skewX(-8) translate(0 -184)';
const TungProfileHead: React.FC<{ mood: 'annoyed' | 'calm'; clip: string; talk?: Talk; blink?: boolean; x: number; y: number; scale: number; sway?: HairSway }> = ({ mood, clip, talk, blink, x, y, scale, sway }) => {
  const f = SIDE_FACE[mood];
  const drop = talk ? talkDrop(talk) : f.drop ?? 0;
  const o = useHeadLine();
  const ang = mood === 'annoyed';
  const brow = ang ? 'M 25 80.5 Q 37 82.5 45 88.5' : 'M 24 78 Q 36 74.5 47.5 77';
  const mouth = drop > 0 ? undefined : ang ? 'M 47 131.6 Q 42.5 130.6 38 133' : 'M 47 131.6 Q 42.5 132 38 132.6';
  return (
    <g {...headFrame(x, y, scale)}>
      {/* Cổ dày, chếch ra trước, LOE ở gốc: sau gáy thoải xuống vai, trước dốc ra cổ áo thấp hơn → da ngực/vai đỡ chân cổ. Cổ áo vẽ ĐÈ lên chân cổ. */}
      <defs>
        <filter id={`${clip}-soft`} filterUnits="userSpaceOnUse" x={-150} y={-60} width={300} height={320}><feGaussianBlur stdDeviation={2.6} /></filter>
        <filter id={`${clip}-soft2`} filterUnits="userSpaceOnUse" x={-150} y={-60} width={300} height={320}><feGaussianBlur stdDeviation={1.8} /></filter>
        <clipPath id={`${clip}-neck`}><path d={NECK_D} transform={NECK_T} /></clipPath>
        <clipPath id={`${clip}-face`}><path d={tungSkinPath(drop)} /></clipPath>
      </defs>
      <path d={NECK_D} transform={NECK_T} fill={PALETTE.skin} {...o(PALETTE.skin)} />
      {/* bóng vẽ tay, MỀM: làm mờ riêng bản dịch (mép trong chuyển dần), mép ngoài vẫn cắt theo hình bao nhờ clip; data-shadow để lớp 2.5D bỏ qua */}
      <g clipPath={`url(#${clip}-neck)`} stroke="none" data-shadow="drawn-neck">
        <g filter={`url(#${clip}-soft2)`}>
          <rect x={-150} y={-60} width={300} height={320} fill={PALETTE.skinShadow} opacity={0.3} />
          <path d={NECK_D} transform={`translate(-6.5 0) ${NECK_T}`} fill={PALETTE.skin} />
        </g>
        <g filter={`url(#${clip}-soft)`}><g transform="translate(5 8) rotate(5 -8 150) scale(1.1)"><path d={tungSkinPath(drop)} transform="translate(0 16)" fill={PALETTE.skinShadow} opacity={0.55} /></g></g>
      </g>
      <path d="M -31 183 Q -10 199 17 190" fill="none" stroke={PALETTE.tung.jerseyTrim} style={{ strokeWidth: lw(6.5) }} strokeLinecap="butt" />
      <g transform="translate(5 8) rotate(5 -8 150) scale(1.1)">
      {drop > 0 && <path d={`M 48 130 L 38 ${131 + 0.4 * drop} L ${44 - 0.3 * drop} ${133 + drop} Z`} fill={PALETTE.mouthDark} stroke="none" />}
      <path d={tungSkinPath(drop)} fill={PALETTE.skin} {...o(PALETTE.skin)} />
      <g clipPath={`url(#${clip}-face)`} stroke="none" data-shadow="drawn-face">
        {/* quầng dưới hàm/má tách mặt khỏi cổ; tóc đổ bóng lên trán–thái dương */}
        <g filter={`url(#${clip}-soft)`}>
          <rect x={-150} y={-60} width={300} height={320} fill={PALETTE.skinShadow} opacity={0.4} />
          <path d={tungSkinPath(drop)} transform="translate(0 -6)" fill={PALETTE.skin} />
        </g>
        <g filter={`url(#${clip}-soft2)`}><path d={TUNG_SIDE.hair} transform="translate(3.5 7)" fill={PALETTE.skinShadow} opacity={0.5} /></g>
      </g>
      <path d={TUNG_SIDE.hair} fill={PALETTE.tung.hair} {...o(PALETTE.tung.hair)} visibility="visible" transform={hairSway(sway)} />
      <path d={TUNG_SIDE.ear} fill={PALETTE.skin} {...o(PALETTE.skin)} />
      <path d={TUNG_SIDE.earLine} fill="none" style={{ strokeWidth: lw(2.4) }} />
      <defs><clipPath id={`${clip}-eyes`}><ellipse cx={36} cy={98.5} rx={11} ry={Math.min(f.ry, 14) - 2.5} /></clipPath></defs>
      <ellipse cx={36} cy={98.5} rx={11} ry={Math.min(f.ry, 14) - 2.5} fill={PALETTE.eyeWhite} style={{ strokeWidth: lw(2.5) }} />
      <g clipPath={`url(#${clip}-eyes)`}>
        <ellipse cx={41} cy={99} rx={3.8} ry={4.6} fill={PALETTE.ink} stroke="none" />
        {blink ? <rect x={18} y={70} width={40} height={60} fill={PALETTE.skin} stroke="none" /> : f.lid && <path d={f.lid} fill={PALETTE.skin} style={{ strokeWidth: lw(2.5) }} />}
      </g>
      {blink && <path d="M 26 100 Q 36 106 47 100" fill="none" style={{ strokeWidth: lw(3) }} />}
      <path d={brow} fill="none" style={{ strokeWidth: lw(5.5) }} />
      {mouth && <path d={mouth} fill="none" style={{ strokeWidth: lw(2.6) }} />}
      </g>
    </g>
  );
};


/**
 * Đầu NGHIÊNG mới của Nam và Người Kia (dùng khi `sideNew`, tức dáng 2.5D mới), dựng theo ảnh tham chiếu như đầu Tùng:
 * sọ thon, mặt nhỏ cằm thon, tai chữ C ở mép tóc, cổ ngắn dày; tóc ÔM SÁT sọ xuống gáy (chân tóc nhọn sau tai), lọn cuộn trên đỉnh và
 * mái hất ra trước theo mẫu. Bóng vẽ tay làm mềm bằng blur (mép ngoài cắt theo hình bao). Đầu nghiêng đã chốt (`ProfileHead`) giữ nguyên cho dáng cũ.
 */
const NAM_SIDE = {
  hair: 'M 59.1 51.1 C 59.1 51.1 58.2 44.1 56.4 40.9 C 54.6 37.7 51.4 34.4 48.2 32.0 C 45.0 29.6 41.0 27.9 37.0 26.6 C 33.0 25.3 28.2 24.6 24.4 24.2 C 20.6 23.8 18.6 24.2 14.2 24.2 C 9.8 24.2 3.4 23.9 -2.1 24.2 C -7.6 24.5 -13.4 25.2 -19.1 25.9 C -24.8 26.6 -31.5 27.2 -36.1 28.6 C -40.8 30.0 -42.9 34.1 -47.0 34.1 C -51.1 34.1 -60.6 28.6 -60.6 28.6 C -60.6 28.6 -48.9 40.6 -49.0 45.0 C -49.1 49.4 -57.9 51.2 -61.2 55.2 C -64.5 59.2 -67.1 63.7 -68.7 69.1 C -70.3 74.5 -71.1 81.6 -70.8 87.8 C -70.5 94.0 -69.3 100.4 -66.7 106.5 C -64.1 112.6 -61.5 118.8 -55.1 124.5 C -48.8 130.2 -28.6 140.8 -28.6 140.8 C -28.6 140.8 -26.0 131.1 -25.9 125.2 C -25.8 119.3 -27.2 111.5 -27.9 105.5 C -28.6 99.5 -30.7 93.0 -30.0 89.2 C -29.3 85.5 -27.3 84.3 -23.8 83.0 C -20.3 81.7 -13.0 81.2 -8.9 81.3 C -4.8 81.4 -2.2 84.8 0.6 83.7 C 3.4 82.6 5.0 77.9 8.1 74.9 C 11.2 72.0 14.7 68.5 19.0 66.0 C 23.3 63.5 29.1 61.5 34.0 59.9 C 38.9 58.3 44.0 58.0 48.2 56.5 C 52.4 55.0 59.1 51.1 59.1 51.1 Z',
  curl: 'M -11.6 23.9 C -11.6 23.9 -16.3 17.0 -15.0 13.7 C -13.7 10.4 -8.2 5.9 -3.8 4.2 C 0.6 2.5 7.4 3.2 11.5 3.5 C 15.6 3.8 18.6 4.7 21.0 6.2 C 23.4 7.7 25.8 12.3 25.8 12.3 C 25.8 12.3 21.5 9.7 19.0 9.3 C 16.5 8.9 13.4 9.5 10.8 9.9 C 8.2 10.3 5.4 10.9 3.4 12.0 C 1.4 13.1 -0.5 14.4 -1.4 16.4 C -2.3 18.4 -0.4 22.9 -2.1 24.2 C -3.8 25.4 -11.6 23.9 -11.6 23.9 Z',
  ear: 'M -30.6 98.7 C -30.8 95.0 -30.3 90.5 -28.6 87.8 C -26.9 85.1 -23.6 83.2 -20.4 82.4 C -17.2 81.6 -12.3 81.5 -9.6 83.0 C -6.9 84.5 -4.9 88.0 -4.1 91.2 C -3.3 94.4 -3.8 98.8 -4.8 102.1 C -5.8 105.4 -7.8 108.9 -10.2 110.9 C -12.6 112.9 -16.3 114.4 -19.1 114.3 C -21.9 114.2 -25.3 112.8 -27.2 110.2 C -29.1 107.6 -30.4 102.4 -30.6 98.7 Z',
  earLine: 'M -13.6 92.6 Q -6.2 94.6 -6.8 103.4',
  back: [[-24.5, 135.4], [-34.7, 119.8], [-41.5, 95.3], [-38.8, 74.9], [-25.9, 55.8], [-2.1, 46.3], [25.1, 42.2], [45.5, 49.0], [51.6, 59.2]] as [number, number][],
  front: [[51.6, 57.2], [49.9, 66.0], [48.6, 77.6], [49.3, 89.5], [51.3, 102.1], [53.3, 110.9], [51.0, 114.7], [48.6, 116.7], [48.9, 123.8]] as [number, number][],
  lower: [[48.9, 123.8], [47.6, 127.5], [43.6, 135.0], [34.3, 140.0], [18.8, 140.5], [3.3, 137.0], [-11.6, 133.5]] as [number, number][], // cằm nâng ~14 đơn vị so với bản đầu (xệ, nặng hàm)
};
const namSkinPath = (d: number) => {
  const k = [0, 0.35, 0.7, 1, 1, 0.55, 0.2];
  const lower = NAM_SIDE.lower.map(([x, y], i) => [x - 0.3 * d * k[i], y + d * k[i]] as [number, number]);
  return catmull([...NAM_SIDE.back, ...NAM_SIDE.front.slice(0, -1), ...lower], true);
};
// đáy cổ trùng mép trên thân áo nghiêng (TWIN/NAM side torso: -26 184 → 22 198) để không hở trắng, không lòi da lên vai
const NAM_NECK_D = 'M -26 120 L -27 172 Q -27 180 -26 184 Q -18 192 -8 196 Q 8 195 22 198 Q 11 180 7 160 L 6 120 Z';
const NAM_HEAD_T = 'translate(4 33.5) rotate(4 -8 150) translate(-8 150) scale(1.07) translate(8 -150)';
const NamSoftProfileHead: React.FC<{ mood: NamMood; clip: string; mole: boolean; talk?: Talk; blink?: boolean; x: number; y: number; scale: number; sway?: HairSway }> = ({ mood, clip, mole, talk, blink, x, y, scale, sway }) => {
  const f = SIDE_FACE[mood];
  const drop = talk ? talkDrop(talk) : f.drop ?? 0;
  const o = useHeadLine();
  const sour = mood === 'annoyed' || mood === 'suspicious' || mood === 'agitated';
  const smile = mood === 'neutral_smile' || mood === 'eerie_smirk' || mood === 'stare_grin';
  // Miệng đặt theo đường viền môi (môi trên nhô ở y≈124): nét đóng nằm trong mặt, đầu nét chạm mép môi; miệng mở là một nêm tối vẽ ĐÈ lên da
  const mouth = drop > 0 ? undefined : sour ? 'M 47.8 127 Q 44.5 125.6 41 127.4' : smile ? 'M 47.8 125.4 Q 44.5 128.4 41 125.6' : mood === 'hesitant' ? 'M 47.8 126.6 Q 45 128.4 43 126.4 Q 41.6 125.6 40.4 127' : 'M 47.8 126.4 Q 44.5 127.4 41 126.6';
  const ry = Math.min(f.ry - 3, 16);
  const skin = namSkinPath(drop);
  return (
    <g {...headFrame(x, y, scale)}>
      <defs>
        <filter id={`${clip}-soft`} filterUnits="userSpaceOnUse" x={-150} y={-60} width={300} height={320}><feGaussianBlur stdDeviation={2.6} /></filter>
        <filter id={`${clip}-soft2`} filterUnits="userSpaceOnUse" x={-150} y={-60} width={300} height={320}><feGaussianBlur stdDeviation={1.8} /></filter>
        <clipPath id={`${clip}-neck`}><path d={NAM_NECK_D} transform={NECK_T} /></clipPath>
        <clipPath id={`${clip}-face`}><path d={skin} /></clipPath>
      </defs>
      {/* Cổ ngắn dày, loe ở gốc; cổ áo tròn vẽ đè lên chân cổ */}
      <path d={NAM_NECK_D} transform={NECK_T} fill={PALETTE.skin} {...o(PALETTE.skin)} />
      <g clipPath={`url(#${clip}-neck)`} stroke="none" data-shadow="drawn-neck">
        <g filter={`url(#${clip}-soft2)`}>
          <rect x={-150} y={-60} width={300} height={320} fill={PALETTE.skinShadow} opacity={0.3} />
          <path d={NAM_NECK_D} transform={`translate(-7 0) ${NECK_T}`} fill={PALETTE.skin} />
        </g>
        <g filter={`url(#${clip}-soft)`}><g transform={NAM_HEAD_T}><path d={skin} transform="translate(0 16)" fill={PALETTE.skinShadow} opacity={0.55} /></g></g>
      </g>
      <path d="M -26 184 Q -18 192 -8 196 Q 8 195 22 198" fill="none" style={{ strokeWidth: lw(2.2), stroke: 'var(--inner-ink, #2b2b2b)' }} />
      <g transform={NAM_HEAD_T}>
        <path d={skin} fill={PALETTE.skin} {...o(PALETTE.skin)} />
        <g clipPath={`url(#${clip}-face)`} stroke="none" data-shadow="drawn-face">
          <g filter={`url(#${clip}-soft)`}>
            <rect x={-150} y={-60} width={300} height={320} fill={PALETTE.skinShadow} opacity={0.4} />
            <path d={skin} transform="translate(0 -6)" fill={PALETTE.skin} />
          </g>
          <g filter={`url(#${clip}-soft2)`}><path d={NAM_SIDE.hair} transform="translate(3.5 7)" fill={PALETTE.skinShadow} opacity={0.5} /></g>
        </g>
        <g transform={hairSway(sway)}>
          <path d={NAM_SIDE.hair} fill={PALETTE.nam.hair} {...o(PALETTE.nam.hair)} visibility="visible" />
          <path d={NAM_SIDE.curl} transform="translate(0 5)" fill={PALETTE.nam.hair} {...o(PALETTE.nam.hair)} visibility="visible" />
        </g>
        <path d={NAM_SIDE.ear} fill={PALETTE.skin} {...o(PALETTE.skin)} />
        <path d={NAM_SIDE.earLine} fill="none" style={{ strokeWidth: lw(2.4) }} />
        <defs><clipPath id={`${clip}-eyes`}><ellipse cx={36} cy={98.5} rx={11} ry={ry} /></clipPath></defs>
        <ellipse cx={36} cy={98.5} rx={11} ry={ry} fill={PALETTE.eyeWhite} style={{ strokeWidth: lw(2.5) }} />
        <g clipPath={`url(#${clip}-eyes)`}>
          <ellipse cx={41} cy={99.5} rx={3.8} ry={Math.min(5.2, ry - 2)} fill={PALETTE.ink} stroke="none" />
          {blink ? <rect x={18} y={70} width={40} height={60} fill={PALETTE.skin} stroke="none" /> : f.lid && <path d={f.lid} fill={PALETTE.skin} style={{ strokeWidth: lw(2.5) }} />}
        </g>
        {blink && <path d="M 26 100 Q 36 106 47 100" fill="none" style={{ strokeWidth: lw(3) }} />}
        <g clipPath={`url(#${clip}-face)`}><path d={f.brow} transform="translate(6 0) translate(20 0) scale(0.8 1) translate(-20 0)" fill="none" style={{ strokeWidth: lw(5.5) }} /></g>
        {mole && <circle cx={16.6} cy={76.9} r={2.2} fill={PALETTE.ink} stroke="none" />}
        {mouth && <path d={mouth} fill="none" style={{ strokeWidth: lw(2.6) }} />}
        {drop > 0 && <path d={`M 48.7 124.2 Q 44.5 124.6 41.5 125.8 Q 43.5 ${126.4 + 0.45 * drop} ${46.6 - 0.3 * drop} ${128.2 + 0.8 * drop} Q 47.6 ${126.5 + 0.5 * drop} 48.7 124.2 Z`} fill={PALETTE.mouthDark} stroke="none" />}
      </g>
    </g>
  );
};

export const TungHead: React.FC<{
  mood?: TungMood;
  id?: string;
  view?: View;
  facing?: 1 | -1;
  talk?: Talk;
  blink?: boolean;
  x?: number;
  y?: number;
  scale?: number;
  /** Tóc đung đưa theo vật lý; bỏ trống = tóc đứng yên. */
  hair?: HairSway;
}> = ({ mood = 'annoyed', id = 'tung-head', view = 'three', talk, blink, x = 0, y = 0, scale = 1, hair: sway }) => {
  const clip = useClipId(id);
  const o = useHeadLine();
  const isAnnoyed = mood === 'annoyed';
  const isFocused = mood === 'focused';
  if (view === 'back') return <BackHead hair={TUNG_HAIR} x={x} y={y} scale={scale} sway={sway} />;
  if (view === 'quarter') return <QuarterHead hair={TUNG_HAIR} mole={false} x={x} y={y} scale={scale} sway={sway} />;
  if (view === 'side') return <TungProfileHead mood={isAnnoyed ? 'annoyed' : 'calm'} clip={clip} talk={talk} blink={blink} x={x} y={y} scale={scale} sway={sway} />;
  const front = view === 'front';
  const rxR = front ? 15 : 16;
  const rxL = front ? 15 : 14.5;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={PALETTE.ink} style={{ strokeWidth: lw(3.5) }} strokeLinejoin="round" strokeLinecap="round">
      {/* Cổ khỏe khoắn */}
      <path d={front ? 'M -22 141 L -22 182 Q 0 197 22 182 L 22 141' : 'M -26 142 L -26 182 Q -6 200 18 181 L 20 138'} fill={PALETTE.skin} {...o(PALETTE.skin)} />
      <path d={front ? 'M -21 155 Q 0 171 21 155 L 21 175 Q 0 188 -21 175 Z' : 'M -24 156 Q -6 172 19 154 L 18 174 Q -6 186 -25 174 Z'} fill={PALETTE.skinShadow} stroke="none" />

      {/* Đầu & Cằm thể thao sáng sủa, gọn gàng */}
      <path d={front ? 'M -56 62 Q -50 25 0 25 Q 50 25 56 62 L 58 104 Q 58 132 38 152 Q 18 165 0 164 Q -18 165 -38 152 Q -58 132 -58 104 Z' : 'M -54 62 Q -50 25 -9 24 Q 40 24 51 64 L 53 108 Q 62 126 48 144 Q 34 162 4 163 Q -28 162 -42 138 L -55 100 Z'} fill={PALETTE.skin} {...o(PALETTE.skin)} />

      {/* Tai trái */}
      <path d={front ? 'M -54 88 Q -82 74 -84 99 Q -85 120 -57 124 M 58 87 Q 82 74 84 99 Q 85 120 58 124' : 'M -46 88 Q -74 74 -76 99 Q -77 120 -49 124'} fill={PALETTE.skin} {...o(PALETTE.skin)} />
      <path d={front ? 'M -72 99 Q -64 93 -60 106 M 72 99 Q 64 93 60 106' : 'M -64 99 Q -56 93 -52 106'} fill="none" style={{ strokeWidth: lw(2.4) }} />

      {/* TÓC NGẮN THỂ THAO TỈA LAYER TỰ NHIÊN STYLE B (Không cộm, không thừa) */}
      <path
        d={front ? 'M -58 86 Q -66 68 -62 50 L -70 44 Q -60 24 -40 22 L -46 12 Q -26 12 -12 8 L -14 0 Q 2 -6 16 2 L 14 8 Q 30 4 42 16 L 40 22 Q 54 24 62 40 L 66 46 L 58 56 L 58 86 Q 50 62 34 52 Q 22 64 6 62 L 8 50 Q -14 70 -42 66 L -46 86 Z' : 'M -48 90 Q -60 76 -57 52 L -66 48 Q -58 26 -38 24 L -44 14 Q -26 14 -12 10 L -14 2 Q 2 -4 16 4 L 14 10 Q 28 6 40 18 L 38 24 Q 50 24 56 36 L 52 46 Q 44 48 40 56 L 32 52 Q 24 66 8 68 L 12 54 Q -6 72 -24 70 L -18 56 Q -34 68 -42 78 Z'}
        fill={PALETTE.tung.hair}
        visibility="visible"
        transform={hairSway(sway)}
        {...o(PALETTE.tung.hair)}
      />
      {/* Nếp rãnh lọn tóc nhẹ */}
      <path d="M -16 18 Q -4 12 6 16 M 16 14 Q 26 16 34 26 M -8 38 Q 4 38 12 48" fill="none" visibility="visible" stroke={PALETTE.tung.hair} transform={hairSway(sway)} style={{ strokeWidth: lw(2.2) }} />

      <g transform={front ? 'translate(-10 0)' : undefined}>
      {/* Mắt thể thao tỉnh táo */}
      <defs>
        <clipPath id={`${clip}-eyes`}>
          <ellipse cx={-11} cy={99} rx={rxR} ry={14} />
          <ellipse cx={29} cy={front ? 99 : 96} rx={rxL} ry={13} />
        </clipPath>
      </defs>

      <ellipse cx={-11} cy={99} rx={rxR} ry={14} fill={PALETTE.eyeWhite} style={{ strokeWidth: lw(2.5) }} />
      <ellipse cx={29} cy={front ? 99 : 96} rx={rxL} ry={13} fill={PALETTE.eyeWhite} style={{ strokeWidth: lw(2.5) }} />

      <g clipPath={`url(#${clip}-eyes)`}>
        <ellipse cx={-8} cy={99} rx={4.5} ry={5.5} fill={PALETTE.ink} stroke="none" />
        <ellipse cx={31} cy={96} rx={4.5} ry={5.5} fill={PALETTE.ink} stroke="none" />
        <circle cx={-6.5} cy={97} r={1.4} fill="#ffffff" stroke="none" />
        <circle cx={32.5} cy={94} r={1.4} fill="#ffffff" stroke="none" />
        {blink ? <rect x={-40} y={70} width={100} height={60} fill={PALETTE.skin} stroke="none" /> : <path d="M -32 76 L 48 74 L 48 86 L -32 87 Z" fill={PALETTE.skin} style={{ strokeWidth: lw(2.4) }} />}
      </g>

      {blink && <path d="M -27 102 Q -11 108 5 101 M 15 99 Q 29 104 43 98" fill="none" style={{ strokeWidth: lw(3) }} />}
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
        style={{ strokeWidth: lw(5.5) }}
      />

      {/* Mũi gọn */}
      <path d={front ? 'M 4 110 Q 10 118 16 110' : 'M 12 113 Q 23 115 20 123 L 12 125'} fill="none" style={{ strokeWidth: lw(2.5) }} />

      <g transform={front ? 'translate(-3 0)' : undefined}>
      {/* Miệng */}
      {talk ? <g transform="translate(12 142) scale(1.25)"><ArticulatedMouth shape={talk.shape} open={talk.open} ink={PALETTE.mouthDark} /></g> : isAnnoyed ? (
        <path d="M -2 141 Q 12 133 26 140 Q 12 147 -2 141 Z" fill={PALETTE.mouthDark} style={{ strokeWidth: lw(2.4) }} />
      ) : isFocused ? (
        <path d="M 0 142 Q 13 145 24 142" fill="none" style={{ strokeWidth: lw(2.6) }} />
      ) : (
        <path d="M 0 141 Q 12 146 25 141" fill="none" style={{ strokeWidth: lw(2.6) }} />
      )}
      </g>
      </g>
    </g>
  );
};

const Turf: React.FC<{ side: 'R' | 'L'; view: View }> = ({ side, view }) => view !== 'three' ? <FlatFoot view={view} upper={PALETTE.tung.cleats} sole={PALETTE.tung.cleatsSole} band={PALETTE.tung.cleatsAccent} /> : (
  <g transform={side === 'R' ? 'translate(33 -555)' : 'translate(-35 -555)'} style={{ strokeWidth: lw(3.8), stroke: 'var(--inner-ink, #2b2b2b)' }}>
    {side === 'R' ? (
      <>
        <path d="M -52 560 Q -78 566 -74 582 Q -50 594 -8 584 L -10 573 Q -22 558 -52 560 Z" fill={PALETTE.tung.cleats} />
        <path d="M -74 580 Q -45 590 -8 580 L -8 588 Q -44 598 -75 588 Z" fill={PALETTE.tung.cleatsSole} style={{ strokeWidth: lw(2.5) }} />
        <path d="M -58 565 Q -40 560 -24 572" stroke={PALETTE.tung.cleatsAccent} style={{ strokeWidth: lw(3) }} fill="none" />
        <path d="M -62 569 Q -44 564 -28 576" stroke={PALETTE.tung.jersey} style={{ strokeWidth: lw(2.5) }} fill="none" />
      </>
    ) : (
      <>
        <path d="M 16 560 Q 40 558 66 566 Q 88 570 85 582 Q 54 594 12 584 L 10 573 Z" fill={PALETTE.tung.cleats} />
        <path d="M 12 580 Q 52 588 85 579 L 86 586 Q 50 597 12 588 Z" fill={PALETTE.tung.cleatsSole} style={{ strokeWidth: lw(2.5) }} />
        <path d="M 24 565 Q 44 560 64 572" stroke={PALETTE.tung.cleatsAccent} style={{ strokeWidth: lw(3) }} fill="none" />
        <path d="M 28 569 Q 48 564 68 576" stroke={PALETTE.tung.jersey} style={{ strokeWidth: lw(2.5) }} fill="none" />
      </>
    )}
  </g>
);

const Number7: React.FC<{ x: number; y: number; size: number; facing: 1 | -1 }> = ({ x, y, size, facing }) => (
  <g transform={`translate(${x} 0) scale(${facing} 1)`}>
    <text x={0} y={y} textAnchor="middle" fontFamily="'Arial Black', Impact, sans-serif" fontWeight="900" fontSize={size} fill={PALETTE.tung.number} stroke="none">7</text>
  </g>
);
const JERSEY_FOLD = { fill: 'none', style: { strokeWidth: lw(2.4) } };
const TUNG_VIEWS: Outfit['views'] = {
  front: {
    ...TWIN_VIEWS!.front!,
    detail: (
      <>
        <path d="M -20 177 L -8 204 L 0 192 L 8 204 L 20 177 Z" fill={PALETTE.tung.jerseyTrim} style={{ strokeWidth: lw(2.6) }} />
        <path d="M -8 184 L 0 196 L 8 184 Z" fill={PALETTE.tung.jerseyInner} stroke="none" />
        <path d="M -56 218 Q -54 241 -53 262 M 56 218 Q 54 241 53 262 M -34 330 Q 0 344 34 330" {...JERSEY_FOLD} />
        <Number7 x={0} y={276} size={36} facing={1} />
      </>
    ),
  },
  back: {
    ...TWIN_VIEWS!.back!,
    detail: (
      <>
        <path d="M -36 340 Q 5 356 46 330" {...JERSEY_FOLD} />
        <Number7 x={0} y={306} size={84} facing={1} />
      </>
    ),
  },
  quarter: {
    ...TWIN_VIEWS!.quarter!,
    detail: (facing) => (
      <>
        <path d="M -40 342 Q 0 356 42 332" {...JERSEY_FOLD} />
        <Number7 x={-4} y={300} size={72} facing={facing} />
      </>
    ),
  },
  // Góc nghiêng dựng lại theo ảnh mẫu (bản cũ dùng chung khuôn thân áo của Nam: vạt loe ra phía lưng, gấu dốc xuống phía trước,
  // cổ áo chữ V phía trước). Mẫu: lưng thẳng, ngực–bụng phình tròn ra TRƯỚC, gấu ngang, cổ áo là dải trắng ôm quanh cổ.
  side: {
    // lưng gần thẳng từ gáy xuống; ngực dốc chéo ra trước từ cổ áo rồi mới phình tròn (không phải mái vòm đối xứng)
    torso: 'M -26 184 Q -38 185 -45 200 Q -50 214 -50 260 L -52 352 Q -8 360 46 352 Q 52 322 50 290 Q 49 258 44 238 Q 38 212 22 198 Q 8 194 -8 196 Q -18 192 -26 184 Z',
    hem: [[-46, 322], [44, 322], [48, 350], [20, 358], [-8, 358], [-30, 358], [-50, 352]],
    detail: <path d="M 33 262 Q 38 292 36 330" {...JERSEY_FOLD} />,
  },
};

export const TUNG_OUTFIT: Outfit = {
  shirt: PALETTE.tung.jersey, sleeveEnd: 0.5, hem: [[-46, 318], [46, 318], [60, 340], [36, 354], [12, 347], [-20, 360], [-58, 344]], cuff: PALETTE.tung.jerseyTrim,
  torso: 'M -24 176 Q -56 178 -84 210 L -56 256 Q -60 306 -56 342 Q -20 358 12 345 Q 36 352 58 338 Q 52 300 50 256 L 76 210 Q 62 190 16 177 Q -6 192 -24 176 Z',
  pants: PALETTE.tung.shorts, pantsLen: 'short', stripe: PALETTE.tung.shortsStripe,
  socks: { color: PALETTE.tung.socks, stripe: PALETTE.tung.socksStripe }, Foot: Turf, views: TUNG_VIEWS,
  detail: (facing) => (
    <>
      <path d="M -24 177 L -10 204 L 0 192 L 10 204 L 16 177 Z" fill={PALETTE.tung.jerseyTrim} style={{ strokeWidth: lw(2.6) }} />
      <path d="M -8 184 L 0 196 L 8 184 Z" fill={PALETTE.tung.jerseyInner} stroke="none" />
      <path d="M -48 214 Q -46 236 -45 255 M 52 216 L 54 252 M -40 310 Q -16 326 14 314 M 14 332 Q 32 336 44 326" fill="none" style={{ strokeWidth: lw(2.4) }} />
      <Number7 x={-4} y={274} size={34} facing={facing} />
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
  talk?: Talk;
  blink?: boolean;
  light?: Light;
  /** Tóc đung đưa (vật lý thứ cấp). */
  hair?: HairSway;
}> = ({ mood = 'annoyed', x = 0, y = 0, scale = 1, pose = TUNG_POSE, talk, blink, light, hair }) => (
  <Rigged pose={pose} outfit={TUNG_OUTFIT} x={x} y={y} scale={scale} light={light} head={<TungHead mood={mood} id="tung-soccer-head" view={pose.view} facing={pose.facing} talk={talk} blink={blink} hair={hair} />} />
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
          THE CRACK IN REALITY — HỒ SƠ 02: NGƯỜI TRONG GƯƠNG — DÀN NHÂN VẬT THIẾT KẾ MẪU B
        </text>
        <text x={960} y={85} fontSize={16} fill="#69706c">
          Nam &amp; Người Kia cùng gương mặt · Nốt ruồi đối bên theo quy tắc phản chiếu · Tùng tóc ngắn thể thao &amp; đồ bóng đá · Chuẩn Style B
        </text>
      </g>

      <path d="M 640 120 V 1010 M 1280 120 V 1010" stroke="#ded5c6" style={{ strokeWidth: lw(1.8) }} strokeDasharray="6 6" />

      {/* CỘT 1: NAM */}
      <g transform="translate(320 0)">
        <text x={0} y={135} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={22} fontWeight="700" fill={PALETTE.ink}>
          1. NAM (SINH VIÊN CHÍNH)
        </text>
        <text x={0} y={160} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={14} fill="#707875">
          Áo ngủ xám trong A–H · nốt ruồi bên trái theo mẫu
        </text>
        <g transform="translate(0 190) scale(0.82)">
          <StudentTwinBody mood="sleepy" shirt={PALETTE.nam.sleepShirt} />
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

      {/* CỘT 2: NGƯỜI KIA (DẤU NHẬN DẠNG PHẢN CHIẾU) */}
      <g transform="translate(960 0)">
        <text x={0} y={135} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={22} fontWeight="700" fill={PALETTE.ink}>
          2. NGƯỜI KIA (NỐT RUỒI BÊN PHẢI)
        </text>
        <text x={0} y={160} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={14} fill="#707875">
          Áo xanh của Nam · nốt ruồi đối bên · không lộ nguồn gốc sớm
        </text>
        <g transform="translate(0 190) scale(0.82)">
          <NguoiKia mood="calm" />
        </g>
        {/* 3 biểu cảm Bản sao */}
        <g transform="translate(-180 750) scale(0.68)">
          <StudentTwinHead mood="calm" id="b-doppel-calm" identity="nguoi-kia" />
          <text x={0} y={225} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fontWeight="700" fill="#515956" stroke="none">ĐIỀM TĨNH</text>
        </g>
        <g transform="translate(0 750) scale(0.68)">
          <StudentTwinHead mood="neutral_smile" id="b-doppel-smile" identity="nguoi-kia" />
          <text x={0} y={225} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fontWeight="700" fill="#515956" stroke="none">THÂN THIỆN</text>
        </g>
        <g transform="translate(180 750) scale(0.68)">
          <StudentTwinHead mood="eerie_smirk" id="b-doppel-eerie" identity="nguoi-kia" />
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
        Đường nét hữu cơ đồng bộ mẫu B · Không có nét thừa hay hở viền · Nam &amp; Người Kia: cùng gương mặt, khác bên nốt ruồi; r = 2.2 theo mẫu.
      </text>
    </svg>
  );
};
