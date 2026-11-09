import React from 'react';
import { limbContour } from '../../../../what-if-studio/src/engine/anatomy';
import { clamp } from '../../../../what-if-studio/src/engine/anim';
import { ArticulatedMouth, MouthShape } from '../../../../what-if-studio/src/engine/mouth';

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
export type NamMood = 'sleepy' | 'annoyed' | 'hesitant' | 'scared' | 'agitated' | 'shocked' | 'suspicious' | 'calm' | 'neutral_smile' | 'eerie_smirk';

// Nhiều nhân vật trong cùng một SVG phải có clipPath khác mã, nếu không mắt người này bị cắt theo mắt người kia.
const useClipId = (id: string) => `${id}-${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;

// Góc nghiêng, 1/4 (nhìn chéo từ sau) và sau lưng vẽ riêng, dùng chung cho mọi nhân vật; mỗi người chỉ khác mảng tóc.
// Chính diện dùng chung nét mặt với 3/4 trong từng hàm đầu.
export type Talk = { shape: Exclude<MouthShape, 'auto'>; open?: number };
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

// Miệng nghiêng vẽ tràn ra ngoài rồi cắt theo đường mặt, nên luôn khớp với môi. Khoé miệng ở x≈46, mép môi x≈67.
const SIDE_FACE: Record<NamMood, { ry: number; lid?: string; brow: string; mouth: string; open?: boolean }> = {
  sleepy: { ry: 14, lid: 'M 18 66 H 56 V 92 H 18 Z', brow: 'M 20 76 Q 34 72 50 74', mouth: 'M 74 132 Q 60 130 56 134 Q 60 140 74 138 Z', open: true },
  annoyed: { ry: 14, lid: 'M 18 66 H 56 V 90 L 18 82 Z', brow: 'M 20 74 Q 36 76 50 84', mouth: 'M 68 135 Q 56 132 46 139' },
  hesitant: { ry: 14, lid: 'M 18 66 H 56 V 83 H 18 Z', brow: 'M 20 78 Q 36 72 50 66', mouth: 'M 68 135 Q 62 132 57 136 Q 52 139 46 136' },
  scared: { ry: 19, brow: 'M 20 72 Q 36 64 50 58', mouth: 'M 74 131 Q 58 129 52 135 Q 58 142 74 140 Z', open: true },
  agitated: { ry: 16, brow: 'M 20 68 L 50 82', mouth: 'M 74 130 Q 56 128 50 136 Q 53 148 74 147 Z', open: true },
  shocked: { ry: 22, brow: 'M 20 64 Q 36 54 50 60', mouth: 'M 74 128 Q 54 124 48 137 Q 51 153 74 152 Z', open: true },
  suspicious: { ry: 14, lid: 'M 18 66 H 56 V 88 L 18 78 Z', brow: 'M 20 72 L 50 86', mouth: 'M 68 135 Q 56 133 47 137' },
  calm: { ry: 14, lid: 'M 18 66 H 56 V 84 H 18 Z', brow: 'M 20 76 Q 36 73 50 75', mouth: 'M 68 135 Q 56 136 47 135' },
  neutral_smile: { ry: 14, lid: 'M 18 66 H 56 V 84 H 18 Z', brow: 'M 20 76 Q 36 73 50 75', mouth: 'M 68 135 Q 56 139 46 132' },
  eerie_smirk: { ry: 14, lid: 'M 18 66 H 56 V 84 H 18 Z', brow: 'M 20 74 Q 36 69 50 72', mouth: 'M 68 135 Q 56 136 45 129' },
};
const PROFILE = 'M -50 78 Q -48 24 4 22 Q 50 22 58 62 L 60 92 Q 62 102 74 112 Q 77 118 66 121 Q 63 125 66 130 Q 67 134 65 136 Q 68 142 63 147 Q 52 166 16 166 Q -22 166 -36 142 Z';
const LIPS = 'M 66 121 Q 63 125 66 130 Q 67 134 65 136 Q 68 142 63 147'; // vẽ lại đè lên miệng, chỉ đoạn môi để không hằn lên tóc
const talkSide = (t: Talk) => {
  if (t.shape === 'closed' || t.shape === 'pressed' || t.shape === 'smile' || (t.open ?? 0.4) < 0.04) return { mouth: 'M 68 135 Q 56 135 47 137', open: false };
  const h = 2 + 12 * clamp(t.open ?? 0.4);
  return { mouth: `M 74 ${134 - h / 2} Q 60 ${133 - h / 2} 53 135 Q 60 ${136 + h / 2} 74 ${134 + h / 2} Z`, open: true };
};

const headFrame = (x: number, y: number, scale: number) => ({ transform: `translate(${x} ${y}) scale(${scale})`, stroke: PALETTE.ink, strokeWidth: 3.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });

const ProfileHead: React.FC<{ hair: HairKit; mood: NamMood; clip: string; mole: boolean; talk?: Talk; blink?: boolean; x: number; y: number; scale: number }> = ({ hair, mood, clip, mole, talk, blink, x, y, scale }) => {
  const f = SIDE_FACE[mood];
  const m = talk ? talkSide(talk) : f;
  return (
    <g {...headFrame(x, y, scale)}>
      <path d="M -20 146 L -22 184 Q 0 196 22 182 L 24 152" fill={PALETTE.skin} />
      <path d="M -21 158 Q 0 174 23 160 L 22 176 Q 0 188 -22 176 Z" fill={PALETTE.skinShadow} stroke="none" />
      <path d={PROFILE} fill={PALETTE.skin} />
      <path d="M -8 84 Q -28 76 -26 100 Q -26 120 -8 118" fill={PALETTE.skin} />
      <path d="M -19 98 Q -12 93 -9 105" fill="none" strokeWidth={2.4} />
      <path d={hair.side} fill={hair.color} />
      <defs>
        <clipPath id={`${clip}-eyes`}><ellipse cx={36} cy={98} rx={11} ry={f.ry} /></clipPath>
        <clipPath id={`${clip}-face`}><path d={PROFILE} /></clipPath>
      </defs>
      <ellipse cx={36} cy={98} rx={11} ry={f.ry} fill={PALETTE.eyeWhite} strokeWidth={2.5} />
      <g clipPath={`url(#${clip}-eyes)`}>
        <ellipse cx={41} cy={100} rx={3.6} ry={5.2} fill={PALETTE.ink} stroke="none" />
        {blink ? <rect x={18} y={70} width={40} height={60} fill={PALETTE.skin} stroke="none" /> : f.lid && <path d={f.lid} fill={PALETTE.skin} strokeWidth={2.5} />}
      </g>
      {blink && <path d="M 26 100 Q 36 106 47 100" fill="none" strokeWidth={3} />}
      <path d={f.brow} fill="none" strokeWidth={5.5} />
      {mole && <circle cx={12} cy={85} r={2.2} fill={PALETTE.ink} stroke="none" />}
      <g clipPath={`url(#${clip}-face)`}><path d={m.mouth} fill={m.open ? PALETTE.mouthDark : 'none'} strokeWidth={2.6} /></g>
      <path d={LIPS} fill="none" />
    </g>
  );
};

const BackHead: React.FC<{ hair: HairKit; x: number; y: number; scale: number }> = ({ hair, x, y, scale }) => (
  <g {...headFrame(x, y, scale)}>
    <path d="M -22 150 L -22 184 Q 0 196 22 184 L 22 150" fill={PALETTE.skin} />
    <path d="M -56 87 Q -84 72 -86 99 Q -87 121 -59 125 M 56 87 Q 84 72 86 99 Q 87 121 59 125" fill={PALETTE.skin} />
    <path d="M -58 60 Q -52 25 0 25 Q 52 25 58 60 L 60 108 Q 60 140 38 156 Q 18 168 0 167 Q -18 168 -38 156 Q -60 140 -60 108 Z" fill={PALETTE.skin} />
    <path d={hair.back} fill={hair.color} />
  </g>
);

// 1/4: thấy gáy, tai phía gần và một dải má; mũi, miệng đã khuất.
const QuarterHead: React.FC<{ hair: HairKit; mole: boolean; x: number; y: number; scale: number }> = ({ hair, mole, x, y, scale }) => (
  <g {...headFrame(x, y, scale)}>
    <path d="M -24 150 L -24 184 Q 0 196 24 184 L 26 150" fill={PALETTE.skin} />
    <path d="M -56 70 Q -50 24 4 24 Q 56 24 62 70 L 64 112 Q 64 140 44 156 Q 20 170 -8 166 Q -46 158 -56 120 Z" fill={PALETTE.skin} />
    <path d={hair.quarter} fill={hair.color} />
    <path d="M 24 88 Q 50 76 50 100 Q 50 122 26 124 Q 14 106 24 88 Z" fill={PALETTE.skin} />
    <path d="M 44 98 Q 36 92 32 106" fill="none" strokeWidth={2.4} />
    <path d="M 50 80 L 58 77" fill="none" strokeWidth={5.5} />
    {mole && <circle cx={57} cy={92} r={2.2} fill={PALETTE.ink} stroke="none" />}
  </g>
);

export const StudentTwinHead: React.FC<{
  mood?: NamMood;
  id?: string;
  view?: View;
  facing?: 1 | -1;
  talk?: Talk;
  blink?: boolean;
  x?: number;
  y?: number;
  scale?: number;
}> = ({ mood = 'sleepy', id = 'twin-head', x = 0, y = 0, scale = 1, view = 'three', facing = 1, talk, blink }) => {
  const isShocked = mood === 'shocked';
  const isSuspicious = mood === 'suspicious';
  const isCalm = mood === 'calm';
  const isSmiling = mood === 'neutral_smile';
  const isEerie = mood === 'eerie_smirk';
  const isAngry = mood === 'annoyed';
  const isHesitant = mood === 'hesitant';
  const isScared = mood === 'scared';
  const isAgitated = mood === 'agitated';
  const isWide = isShocked || isScared; // mắt mở to, con ngươi nhỏ
  const eyeRy = isShocked ? 23 : isScared ? 20 : isAgitated ? 17 : 15;
  const eyeRyL = isShocked ? 22 : isScared ? 19 : isAgitated ? 16 : 14;
  const clip = useClipId(id);
  if (view === 'back') return <BackHead hair={NAM_HAIR} x={x} y={y} scale={scale} />;
  if (view === 'quarter') return <QuarterHead hair={NAM_HAIR} mole={facing === 1} x={x} y={y} scale={scale} />;
  if (view === 'side') return <ProfileHead hair={NAM_HAIR} mood={mood} clip={clip} mole={facing === 1} talk={talk} blink={blink} x={x} y={y} scale={scale} />; // quay trái thấy nửa mặt bên kia, không có nốt ruồi
  const front = view === 'front';
  const rxR = front ? 15 : 17;
  const rxL = front ? 15 : 15;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={PALETTE.ink} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round">
      {/* Cổ & Khối bóng đổ cằm */}
      <path d={front ? 'M -22 141 L -22 182 Q 0 197 22 182 L 22 141' : 'M -28 141 L -28 182 Q -8 201 16 181 L 19 138'} fill={PALETTE.skin} />
      <path d={front ? 'M -21 155 Q 0 171 21 155 L 21 175 Q 0 188 -21 175 Z' : 'M -26 155 Q -8 171 17 153 L 16 175 Q -7 187 -27 174 Z'} fill={PALETTE.skinShadow} stroke="none" />

      {/* Hộp sọ & Đường cằm bo tròn hữu cơ (chuẩn mẫu B) */}
      <path d={front ? 'M -58 60 Q -52 25 0 25 Q 52 25 58 60 L 60 108 Q 62 138 38 156 Q 18 168 0 167 Q -18 168 -38 156 Q -62 138 -60 108 Z' : 'M -55 60 Q -50 25 -9 25 Q 42 24 53 66 L 55 111 Q 72 130 54 146 Q 38 166 6 165 Q -30 163 -45 138 L -58 100 Z'} fill={PALETTE.skin} />

      {/* Tai trái */}
      <path d={front ? 'M -56 87 Q -84 72 -86 99 Q -87 121 -59 125 M 60 86 Q 84 72 86 99 Q 87 121 60 125' : 'M -47 87 Q -75 72 -77 99 Q -78 121 -50 125'} fill={PALETTE.skin} />
      <path d={front ? 'M -74 99 Q -66 93 -62 106 M 74 99 Q 66 93 62 106' : 'M -65 99 Q -57 93 -53 106'} fill="none" strokeWidth={2.4} />

      {/* TÓC NAM & BẢN SAO: Bo tròn hữu cơ theo hộp sọ, có lọn tóc xoăn trên đỉnh theo Mẫu B */}
      <path
        d={front ? 'M -60 92 Q -72 70 -66 50 L -76 46 Q -62 24 -42 24 L -44 14 Q -22 18 -7 12 Q -10 -6 15 -6 Q 24 -5 25 4 Q 8 1 9 15 Q 44 12 56 34 L 70 38 L 60 58 L 60 88 Q 48 62 28 52 Q 18 66 -2 66 L 0 54 Q -24 74 -46 70 L -48 92 Z' : 'M -51 92 Q -65 79 -61 52 L -71 51 Q -58 27 -38 28 L -43 18 Q -20 21 -7 14 Q -10 -5 15 -5 Q 22 -4 24 4 Q 7 0 8 16 Q 40 13 51 37 L 62 43 L 48 59 Q 34 54 22 43 Q 15 63 -4 67 L -1 52 Q -20 75 -41 74 L -43 95 Z'}
        fill={PALETTE.nam.hair}
      />

      <g transform={front ? 'translate(-10 0)' : undefined}>
      {/* Vùng mắt */}
      <defs>
        <clipPath id={`${clip}-eyes`}>
          <ellipse cx={-11} cy={99} rx={rxR} ry={eyeRy} />
          <ellipse cx={30} cy={front ? 99 : 96} rx={rxL} ry={eyeRyL} />
        </clipPath>
      </defs>

      {/* Tròng trắng mắt */}
      <ellipse cx={-11} cy={99} rx={rxR} ry={eyeRy} fill={PALETTE.eyeWhite} strokeWidth={2.5} />
      <ellipse cx={30} cy={front ? 99 : 96} rx={rxL} ry={eyeRyL} fill={PALETTE.eyeWhite} strokeWidth={2.5} />

      {/* Con ngươi & Nếp mí */}
      <g clipPath={`url(#${clip}-eyes)`}>
        <ellipse
          cx={isSuspicious ? -4 : isEerie ? -6 : isHesitant ? -14 : -8}
          cy={isWide ? 100 : 102}
          rx={isWide ? 3.3 : 4}
          ry={isWide ? 4.8 : 5.5}
          fill={PALETTE.ink}
          stroke="none"
        />
        <ellipse
          cx={isSuspicious ? 36 : isEerie ? 34 : isHesitant ? 26 : 32}
          cy={isWide ? 97 : 99}
          rx={isWide ? 3.3 : 4}
          ry={isWide ? 4.8 : 5.5}
          fill={PALETTE.ink}
          stroke="none"
        />
        {/* Điểm sáng bắt sáng */}
        <circle cx={isSuspicious ? -3 : isHesitant ? -13 : -7} cy={isWide ? 98 : 100} r={1.2} fill="#ffffff" stroke="none" />
        <circle cx={isSuspicious ? 37 : isHesitant ? 27 : 33} cy={isWide ? 95 : 97} r={1.2} fill="#ffffff" stroke="none" />

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
            strokeWidth={2.5}
          />
        )}
      </g>

      {blink && <path d="M -27 102 Q -11 108 5 101 M 16 99 Q 30 104 45 98" fill="none" strokeWidth={3} />}
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
            : isCalm || isSmiling
            ? 'M -28 76 Q -12 74 2 76 M 19 74 Q 33 71 44 73'
            : 'M -28 78 Q -12 74 2 75 M 19 72 Q 33 69 44 70'
        }
        fill="none"
        strokeWidth={5.5}
      />

      {/* NỐT RUỒI SÁT ĐUÔI MÀY TRÁI (CHI TIẾT THEN CHỐT CỦA KỊCH BẢN) */}
      <circle cx={facing === -1 ? 47 : -32} cy={isWide ? 74 : 82} r={2.2} fill={PALETTE.ink} stroke="none" />

      {/* Mũi tròn tối giản */}
      <path d={front ? 'M 4 110 Q 10 118 16 110' : 'M 13 113 Q 25 115 22 123 L 13 125'} fill="none" strokeWidth={2.5} />

      <g transform={front ? 'translate(-6 0)' : undefined}>
      {/* Miệng */}
      {talk ? <g transform="translate(13 142) scale(1.25)"><ArticulatedMouth shape={talk.shape} open={talk.open} ink={PALETTE.mouthDark} /></g> : isShocked ? (
        <g>
          <path d="M -3 139 Q 1 121 16 126 Q 31 129 30 148 Q 11 139 -3 148 Z" fill={PALETTE.mouthDark} />
          <path d="M 4 129 Q 13 125 22 132 L 22 137 L 4 135 Z" fill={PALETTE.teeth} stroke="none" />
          <path d="M 4 145 Q 12 138 23 146" stroke={PALETTE.tongue} strokeWidth={3} />
        </g>
      ) : isAngry ? (
        <path d="M -4 144 Q 10 134 26 143" fill="none" strokeWidth={3} />
      ) : isHesitant ? (
        <path d="M -4 143 Q 4 138 11 143 Q 18 148 26 142" fill="none" strokeWidth={2.8} />
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
  prop?: 'phone' | 'bowl'; // đi theo bàn tay: điện thoại ở tay phải, bát giữa hai tay
  x: number; y: number; planted: boolean; // planted: tự hạ/nâng hông để bàn chân thấp nhất chạm sàn
};

export const BONE = { upperArm: 80, foreArm: 74, thigh: 105, shin: 105 };
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
export const solveRig = (pose: JointPose) => {
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
    const mid = step(root, a1, BONE.upperArm);
    return { root, mid, end: step(mid, a2, BONE.foreArm), deg: a2 };
  };
  const leg = (root: P, l: Limb) => {
    const a = lim(l.a, 'hip'), b = lim(l.b, 'knee');
    const a1 = frontal ? (root.x < 0 ? 2 : -2) : -a;
    const a2 = frontal ? a1 : a1 + b;
    const mid = step(root, a1, BONE.thigh * depth(a));
    return { root, mid, end: step(mid, a2, BONE.shin * depth(b - a)), deg: a2 };
  };
  const legR = leg(A.hip.R, pose.legR);
  const legL = leg(A.hip.L, pose.legL);
  const foot = (pitch: number, shin: number) => clamp(pitch, shin + LIMIT.ankle[0], shin + LIMIT.ankle[1]);
  return {
    armR: arm(A.shoulder.R, pose.armR, A.rest.R, false, pose.frontR),
    armL: arm(A.shoulder.L, pose.armL, A.rest.L, true, pose.frontL),
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
// Tư thế mẫu cho các nhịp cần diễn ở Hồ sơ 2; chỉnh tiếp bằng cách trộn đè { ...STAND_POSE, ... }.
export const TWIN_POSES: Record<'stand' | 'sit' | 'stride' | 'crouch' | 'reach' | 'holdBowl' | 'stop' | 'wary' | 'phone' | 'offer' | 'type', JointPose> = {
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
  type: { base: [9.6, 3.2, -3.2, -9.6], len: [[10, 9], [11, 9], [10, 8], [9, 7]], r: [5, 4.7, 4.2], fan: 5, curl: 38, thumb: [{ x: 18, y: 10 }, { x: 24, y: 19 }] },
  phone: { base: [9.6, 3.2, -3.2, -9.6], len: [[9, 7], [10, 7], [9, 7], [8, 6]], r: [5, 4.7, 4.2], fan: 2, curl: 30, thumb: [{ x: 16, y: 12 }, { x: 11, y: 26 }] },
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

// detail nhận facing để chữ/số trên áo không bị lật ngược khi quay trái
type Detail = React.ReactNode | ((facing: 1 | -1) => React.ReactNode);
export type Outfit = {
  shirt: string; torso: string; hem: [number, number][]; sleeveEnd: number; cuff?: string;
  pants: string; pantsLen: 'long' | 'short'; stripe?: string;
  socks?: { color: string; stripe: string };
  Foot: React.FC<{ side: 'R' | 'L'; view: View }>;
  detail: Detail;
  views?: Partial<Record<View, { torso: string; hem: [number, number][]; detail: Detail }>>;
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

const Leg: React.FC<{ c: ReturnType<typeof solveRig>['legR']; side: 'R' | 'L'; foot: number; o: Outfit; view: View }> = ({ c, side, foot, o, view }) => {
  const { root: hip, mid: knee, end: ankle } = c;
  const long = o.pantsLen === 'long';
  const cloth = long ? { root: hip, mid: knee, end: mix(knee, ankle, 0.93) } : { root: hip, mid: mix(hip, knee, 0.4), end: mix(hip, knee, 0.75) };
  const widths: [number, number, number] = long ? [31, 26, 28] : [31, 31, 32];
  // Đùi đưa hẳn ra trước (ngồi, ngồi xổm): bàn chân cũng quay về trước, không xoè ngược lại như lúc đứng.
  const shoe = <g transform={`translate(${ankle.x} ${ankle.y}) rotate(${foot})`}><o.Foot side={view === 'three' && knee.x - hip.x > 60 ? 'L' : side} view={view} /></g>;
  return (
    <g>
      {!o.socks && shoe}
      <Blob fill={PALETTE.skin} d={[limbContour({ root: hip, mid: knee, end: ankle }, [24, 19, 15]), circle(knee, 19), circle(ankle, 15)]} />
      {o.socks && (
        <g>
          <Blob fill={o.socks.color} d={[limbContour({ root: mix(knee, ankle, 0.25), mid: mix(knee, ankle, 0.6), end: ankle }, [17, 15.5, 15]), circle(ankle, 15)]} />
          <path d={`${across(knee, ankle, 0.34, 15)} ${across(knee, ankle, 0.42, 15)}`} fill="none" stroke={o.socks.stripe} strokeWidth={2.6} />
        </g>
      )}
      {o.socks && shoe}
      <Blob fill={o.pants} d={[limbContour(cloth, widths), circle(hip, 30), softEnd(cloth.mid, cloth.end, widths[2], 3), ...(long ? [circle(knee, 26)] : [])]} />
      {long && crease(c, 22)}
      {long && !(view === 'side' && side === 'L') && <path d={foldPath(knee, ankle, side)} fill="none" stroke={PALETTE.ink} strokeWidth={2.5} strokeLinecap="round" />}
      {o.stripe && <path d={alongSide(hip, knee, side === 'R' ? 30 : -30)} fill="none" stroke={o.stripe} strokeWidth={3.5} />}
    </g>
  );
};

// Tay gập nhiều nhìn gầy đi so với tay buông, nên khối tay đầy dần theo độ gập.
const armShapes = (c: ReturnType<typeof solveRig>['armR']) => {
  const u = Math.atan2(c.mid.y - c.root.y, c.mid.x - c.root.x), f = Math.atan2(c.end.y - c.mid.y, c.end.x - c.mid.x);
  const bend = Math.abs(((((f - u) * 180) / Math.PI + 540) % 360) - 180);
  const k = clamp((bend - 30) / 60);
  const w: [number, number, number] = [19 + 1.5 * k, 16 + 4 * k, 13.5 + 3.5 * k];
  return [limbContour(c, w), circle(c.mid, w[1]), circle(c.root, w[0])];
};
const sleeveShapes = (c: ReturnType<typeof solveRig>['armR'], o: Outfit) => {
  const end = mix(c.root, c.mid, o.sleeveEnd);
  const mid = mix(c.root, end, 0.55);
  return [limbContour({ root: c.root, mid, end }, [25, 27, 27]), circle(c.root, 25), softEnd(mid, end, 27, 3)];
};
/** Tay đưa trước ngực: xoá cung vai phía trong để tay áo liền với thân áo. */
const ShoulderPatch: React.FC<{ c: ReturnType<typeof solveRig>['armR']; fill: string; up?: boolean }> = ({ c, fill, up }) => (up ? <path d={`M ${c.root.x - 30} ${c.root.y} A 30 30 0 0 1 ${c.root.x + 30} ${c.root.y} Z`} fill={fill} stroke="none" /> :
  <path d={`M ${c.root.x - (c.root.x < 0 ? 14.4 : -14.4)} ${c.root.y - 30.8} A 34 34 0 0 ${c.root.x < 0 ? 1 : 0} ${c.root.x + (c.root.x < 0 ? 14.4 : -14.4)} ${c.root.y + 30.8} Z`} fill={fill} stroke="none" />
);
const Cuff: React.FC<{ c: ReturnType<typeof solveRig>['armR']; o: Outfit }> = ({ c, o }) => (o.cuff ? <path d={across(c.root, c.mid, o.sleeveEnd * 0.9, 26)} fill="none" stroke={o.cuff} strokeWidth={3.5} /> : null);

/** Vạt áo giữ phương thẳng đứng trong khi thân áo nghiêng, nên cúi người không làm lộ mông ra ngoài áo. */
const hemDrape = (o: Pick<Outfit, 'hem'>, tilt: number) => {
  const c = Math.cos((-tilt * Math.PI) / 180), n = Math.sin((-tilt * Math.PI) / 180);
  const [a, b, d, e, g, h, i] = o.hem.map(([x, y]) => { const u = x - PELVIS.x, v = y - PELVIS.y; return `${PELVIS.x + u * c - v * n} ${PELVIS.y + u * n + v * c}`; });
  return `M ${a} L ${b} L ${d} Q ${e} ${g} Q ${h} ${i} Z`;
};

const Phone: React.FC<{ at: P; deg: number }> = ({ at, deg }) => (
  <g transform={`translate(${at.x} ${at.y}) rotate(${deg})`} stroke={PALETTE.ink} strokeWidth={3.5}>
    <rect x={-13} y={6} width={26} height={62} rx={6} fill="#7f8f94" />
  </g>
);
const Bowl: React.FC<{ at: P }> = ({ at }) => (
  <g transform={`translate(${at.x} ${at.y - 26})`} stroke={PALETTE.ink} strokeWidth={3.5}>
    <path d="M -46 -12 Q -42 30 0 32 Q 42 30 46 -12 Z" fill="#f4efe3" />
    <ellipse cx={0} cy={-12} rx={46} ry={9} fill="#d9d2c0" />
  </g>
);

/** Ghép nhân vật từ khung xương: bàn chân → chân → tay sau → áo → đầu → tay trước. */
export const Rigged: React.FC<{ pose: JointPose; outfit: Outfit; head: React.ReactNode; x: number; y: number; scale: number }> = ({ pose: raw, outfit: outfit, head, x, y, scale }) => {
  const view: View = outfit.views ? raw.view ?? 'three' : 'three'; // nhân vật chưa vẽ đủ góc thì giữ 3/4
  const o = { ...outfit, ...outfit.views?.[view] };
  // chính diện và sau lưng không lật được: hai bên phải giữ đúng chỗ
  const facing = outfit.views && view !== 'front' && view !== 'back' ? raw.facing ?? 1 : 1;
  const pose = facing === -1 ? mirrorPose(raw) : raw;
  const r = solveRig({ ...pose, view });
  const side = view === 'side';
  const away = view === 'back' || view === 'quarter'; // nhìn từ sau: tay đưa ra trước bị thân che
  const frontR = side || (!away && pose.frontR); // nghiêng: tay gần luôn trước thân, tay xa luôn sau thân
  const frontL = !side && !away && pose.frontL;
  const crotch = 414 - 110 * clamp(Math.max(Math.abs(pose.legR.a), Math.abs(pose.legL.a)) / 70); // đáy quần kéo lên khi đùi đưa ra
  const arm = (c: typeof r.armR, s: 1 | -1, wrist: number, kind: HandKind, held?: React.ReactNode) => (
    <g>
      {held}
      <Blob fill={PALETTE.skin} d={[...armShapes(c), ...handShapes(c.end, c.deg + lim(wrist, 'wrist'), s, kind)]} />
    </g>
  );
  // Đạo cụ vẽ ngay trước cánh tay cầm nó, nên luôn nằm dưới ngón tay và cùng lớp với tay. Quay trái thì tay phải giải phẫu ở vế L.
  const phoneOnL = facing === -1;
  const frontSleeve = (c: typeof r.armR) => [...sleeveShapes(c, o), ...(side ? [] : [circle(c.root, 29)])]; // bọc góc vai của thân áo, khỏi lòi một mẩu khi giơ tay
  const held = pose.prop === 'bowl' ? <Bowl at={mix(r.armR.end, r.armL.end, 0.5)} />
    : pose.prop === 'phone' ? <Phone at={(phoneOnL ? r.armL : r.armR).end} deg={(phoneOnL ? r.armL : r.armR).deg + lim(phoneOnL ? pose.wristL : pose.wristR, 'wrist')} /> : null;
  const armR = arm(r.armR, ((view === 'back' ? -1 : 1) * (pose.palmUp === 'R' ? -1 : 1)) as 1 | -1, pose.wristR, pose.handR, pose.prop === 'phone' && !phoneOnL ? held : null);
  const armL = arm(r.armL, ((side || away ? 1 : -1) * (pose.palmUp === 'L' ? -1 : 1)) as 1 | -1, pose.wristL, pose.handL, pose.prop === 'bowl' || phoneOnL ? held : null);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx={(r.legR.end.x + r.legL.end.x) / 2 + pose.x} cy={589 + pose.y} rx={103} ry={13} fill={PALETTE.shadowFloor} stroke="none" />
      <g transform={`translate(${pose.x} ${r.dy})`}>
        {side && <g transform={`rotate(${r.tilt} ${PELVIS.x} ${PELVIS.y})`}>{armL}</g>/* nghiêng: tay xa ở phía bên kia người, nằm sau cả hai chân */}
        {!side && <Blob fill={o.pants} d={[`M -30 335 H 32 L 1 ${crotch} Z`]} />}
        <Leg c={r.legL} side="L" foot={r.footL} o={o} view={view} />
        <Leg c={r.legR} side="R" foot={r.footR} o={o} view={view} />
        <path d={side ? 'M -30 318 H 36 V 352 H -30 Z' : `M -46 318 H 48 V 350 H 28 L 1 ${crotch - 7} L -26 350 H -46 Z`} fill={o.pants} stroke="none" />
        <g transform={`rotate(${r.tilt} ${PELVIS.x} ${PELVIS.y})`}>
          {!frontL && !side && armL}
          {!frontR && armR}
          <Blob fill={o.shirt} d={[o.torso, hemDrape(o, r.tilt), ...(frontR ? [] : sleeveShapes(r.armR, o)), ...(frontL ? [] : sleeveShapes(r.armL, o))]} />
          {!frontR && <Cuff c={r.armR} o={o} />}
          {!frontL && !side && <Cuff c={r.armL} o={o} />}
          <g stroke={PALETTE.ink}>{typeof o.detail === 'function' ? o.detail(facing) : o.detail}</g>
          <g transform={`rotate(${r.neck} ${NECK.x} ${NECK.y})`}>{head}</g>
          {frontL && <g>{armL}<Blob fill={o.shirt} d={frontSleeve(r.armL)} /><ShoulderPatch c={r.armL} fill={o.shirt} /><Cuff c={r.armL} o={o} /></g>}
          {frontR && <g>{armR}<Blob fill={o.shirt} d={frontSleeve(r.armR)} /><ShoulderPatch c={r.armR} fill={o.shirt} up={side} /><Cuff c={r.armR} o={o} /></g>}
        </g>
      </g>
    </g>
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
    <g stroke={PALETTE.ink} strokeWidth={4}>
      <path d={f.body} fill={upper} />
      {f.band && <path d={f.band} fill={band} strokeWidth={2.5} />}
      <path d={f.sole} fill={sole} strokeWidth={2.5} />
    </g>
  );
};

// Bàn chân gốc tại mắt cá. 3/4 vẽ theo nét cũ của mẫu B.
const Slipper: React.FC<{ side: 'R' | 'L'; view: View }> = ({ side, view }) => {
  if (view !== 'three') return <FlatFoot view={view} upper={PALETTE.skin} sole={PALETTE.nam.sole} band={PALETTE.nam.slippers} />;
  return (
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
};

const TWIN_FOLD = { fill: 'none', strokeWidth: 2.5 };
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

const TWIN_OUTFIT: Outfit = {
  shirt: PALETTE.nam.shirt, sleeveEnd: 0.5, hem: [[-52, 322], [50, 322], [63, 348], [38, 366], [12, 358], [-23, 372], [-64, 354]],
  torso: 'M -26 177 Q -60 181 -86 212 L -60 262 Q -66 312 -62 352 Q -23 370 12 356 Q 38 364 62 346 Q 56 304 54 262 L 80 212 Q 66 192 16 178 Q -7 196 -26 177 Z',
  pants: PALETTE.nam.pants, pantsLen: 'long', Foot: Slipper, views: TWIN_VIEWS,
  detail: <path d="M -26 179 Q -23 203 -1 203 Q 14 201 21 183 M -55 218 Q -53 241 -52 262 M 56 219 L 58 257 M -45 316 Q -19 333 15 320 M 15 340 Q 36 343 48 334" fill="none" strokeWidth={2.5} />,
};

export const StudentTwinBody: React.FC<{
  mood?: NamMood;
  x?: number;
  y?: number;
  scale?: number;
  pose?: JointPose;
  shirt?: string;
  talk?: Talk;
  blink?: boolean;
}> = ({ mood = 'sleepy', x = 0, y = 0, scale = 1, pose = STAND_POSE, shirt = PALETTE.nam.shirt, talk, blink }) => (
  <Rigged pose={pose} outfit={{ ...TWIN_OUTFIT, shirt }} x={x} y={y} scale={scale} head={<StudentTwinHead mood={mood} id="twin-full-body" view={pose.view} facing={pose.facing} talk={talk} blink={blink} />} />
);

// ----------------------------------------------------------------------------
// 2. TÙNG — ĐỒ THỂ THAO ĐÁ BÓNG & TÓC NGẮN TỈA MẢNG KHỐI STYLE B
// ----------------------------------------------------------------------------
export type TungMood = 'annoyed' | 'focused' | 'normal';

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
}> = ({ mood = 'annoyed', id = 'tung-head', view = 'three', talk, blink, x = 0, y = 0, scale = 1 }) => {
  const clip = useClipId(id);
  const isAnnoyed = mood === 'annoyed';
  const isFocused = mood === 'focused';
  if (view === 'back') return <BackHead hair={TUNG_HAIR} x={x} y={y} scale={scale} />;
  if (view === 'quarter') return <QuarterHead hair={TUNG_HAIR} mole={false} x={x} y={y} scale={scale} />;
  if (view === 'side') return <ProfileHead hair={TUNG_HAIR} mood={isAnnoyed ? 'annoyed' : 'calm'} clip={clip} mole={false} talk={talk} blink={blink} x={x} y={y} scale={scale} />;
  const front = view === 'front';
  const rxR = front ? 15 : 16;
  const rxL = front ? 15 : 14.5;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={PALETTE.ink} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round">
      {/* Cổ khỏe khoắn */}
      <path d={front ? 'M -22 141 L -22 182 Q 0 197 22 182 L 22 141' : 'M -26 142 L -26 182 Q -6 200 18 181 L 20 138'} fill={PALETTE.skin} />
      <path d={front ? 'M -21 155 Q 0 171 21 155 L 21 175 Q 0 188 -21 175 Z' : 'M -24 156 Q -6 172 19 154 L 18 174 Q -6 186 -25 174 Z'} fill={PALETTE.skinShadow} stroke="none" />

      {/* Đầu & Cằm thể thao sáng sủa, gọn gàng */}
      <path d={front ? 'M -56 62 Q -50 25 0 25 Q 50 25 56 62 L 58 104 Q 58 132 38 152 Q 18 165 0 164 Q -18 165 -38 152 Q -58 132 -58 104 Z' : 'M -54 62 Q -50 25 -9 24 Q 40 24 51 64 L 53 108 Q 62 126 48 144 Q 34 162 4 163 Q -28 162 -42 138 L -55 100 Z'} fill={PALETTE.skin} />

      {/* Tai trái */}
      <path d={front ? 'M -54 88 Q -82 74 -84 99 Q -85 120 -57 124 M 58 87 Q 82 74 84 99 Q 85 120 58 124' : 'M -46 88 Q -74 74 -76 99 Q -77 120 -49 124'} fill={PALETTE.skin} />
      <path d={front ? 'M -72 99 Q -64 93 -60 106 M 72 99 Q 64 93 60 106' : 'M -64 99 Q -56 93 -52 106'} fill="none" strokeWidth={2.4} />

      {/* TÓC NGẮN THỂ THAO TỈA LAYER TỰ NHIÊN STYLE B (Không cộm, không thừa) */}
      <path
        d={front ? 'M -58 86 Q -66 68 -62 50 L -70 44 Q -60 24 -40 22 L -46 12 Q -26 12 -12 8 L -14 0 Q 2 -6 16 2 L 14 8 Q 30 4 42 16 L 40 22 Q 54 24 62 40 L 66 46 L 58 56 L 58 86 Q 50 62 34 52 Q 22 64 6 62 L 8 50 Q -14 70 -42 66 L -46 86 Z' : 'M -48 90 Q -60 76 -57 52 L -66 48 Q -58 26 -38 24 L -44 14 Q -26 14 -12 10 L -14 2 Q 2 -4 16 4 L 14 10 Q 28 6 40 18 L 38 24 Q 50 24 56 36 L 52 46 Q 44 48 40 56 L 32 52 Q 24 66 8 68 L 12 54 Q -6 72 -24 70 L -18 56 Q -34 68 -42 78 Z'}
        fill={PALETTE.tung.hair}
      />
      {/* Nếp rãnh lọn tóc nhẹ */}
      <path d="M -16 18 Q -4 12 6 16 M 16 14 Q 26 16 34 26 M -8 38 Q 4 38 12 48" fill="none" stroke={PALETTE.tung.hair} strokeWidth={2.2} />

      <g transform={front ? 'translate(-10 0)' : undefined}>
      {/* Mắt thể thao tỉnh táo */}
      <defs>
        <clipPath id={`${clip}-eyes`}>
          <ellipse cx={-11} cy={99} rx={rxR} ry={14} />
          <ellipse cx={29} cy={front ? 99 : 96} rx={rxL} ry={13} />
        </clipPath>
      </defs>

      <ellipse cx={-11} cy={99} rx={rxR} ry={14} fill={PALETTE.eyeWhite} strokeWidth={2.5} />
      <ellipse cx={29} cy={front ? 99 : 96} rx={rxL} ry={13} fill={PALETTE.eyeWhite} strokeWidth={2.5} />

      <g clipPath={`url(#${clip}-eyes)`}>
        <ellipse cx={-8} cy={99} rx={4.5} ry={5.5} fill={PALETTE.ink} stroke="none" />
        <ellipse cx={31} cy={96} rx={4.5} ry={5.5} fill={PALETTE.ink} stroke="none" />
        <circle cx={-6.5} cy={97} r={1.4} fill="#ffffff" stroke="none" />
        <circle cx={32.5} cy={94} r={1.4} fill="#ffffff" stroke="none" />
        {blink ? <rect x={-40} y={70} width={100} height={60} fill={PALETTE.skin} stroke="none" /> : <path d="M -32 76 L 48 74 L 48 86 L -32 87 Z" fill={PALETTE.skin} strokeWidth={2.4} />}
      </g>

      {blink && <path d="M -27 102 Q -11 108 5 101 M 15 99 Q 29 104 43 98" fill="none" strokeWidth={3} />}
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
      <path d={front ? 'M 4 110 Q 10 118 16 110' : 'M 12 113 Q 23 115 20 123 L 12 125'} fill="none" strokeWidth={2.5} />

      <g transform={front ? 'translate(-3 0)' : undefined}>
      {/* Miệng */}
      {talk ? <g transform="translate(12 142) scale(1.25)"><ArticulatedMouth shape={talk.shape} open={talk.open} ink={PALETTE.mouthDark} /></g> : isAnnoyed ? (
        <path d="M -2 141 Q 12 133 26 140 Q 12 147 -2 141 Z" fill={PALETTE.mouthDark} strokeWidth={2.4} />
      ) : isFocused ? (
        <path d="M 0 142 Q 13 145 24 142" fill="none" strokeWidth={2.6} />
      ) : (
        <path d="M 0 141 Q 12 146 25 141" fill="none" strokeWidth={2.6} />
      )}
      </g>
      </g>
    </g>
  );
};

const Turf: React.FC<{ side: 'R' | 'L'; view: View }> = ({ side, view }) => view !== 'three' ? <FlatFoot view={view} upper={PALETTE.tung.cleats} sole={PALETTE.tung.cleatsSole} band={PALETTE.tung.cleatsAccent} /> : (
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

const Number7: React.FC<{ x: number; y: number; size: number; facing: 1 | -1 }> = ({ x, y, size, facing }) => (
  <g transform={`translate(${x} 0) scale(${facing} 1)`}>
    <text x={0} y={y} textAnchor="middle" fontFamily="'Arial Black', Impact, sans-serif" fontWeight="900" fontSize={size} fill={PALETTE.tung.number} stroke="none">7</text>
  </g>
);
const JERSEY_FOLD = { fill: 'none', strokeWidth: 2.4 };
const TUNG_VIEWS: Outfit['views'] = {
  front: {
    ...TWIN_VIEWS!.front!,
    detail: (
      <>
        <path d="M -20 177 L -8 204 L 0 192 L 8 204 L 20 177 Z" fill={PALETTE.tung.jerseyTrim} strokeWidth={2.6} />
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
  side: {
    ...TWIN_VIEWS!.side!,
    detail: <path d="M -14 181 L 0 196 L 12 181 M 14 340 Q 26 342 36 332" {...JERSEY_FOLD} />,
  },
};

const TUNG_OUTFIT: Outfit = {
  shirt: PALETTE.tung.jersey, sleeveEnd: 0.5, hem: [[-46, 318], [46, 318], [60, 340], [36, 354], [12, 347], [-20, 360], [-58, 344]], cuff: PALETTE.tung.jerseyTrim,
  torso: 'M -24 176 Q -56 178 -84 210 L -56 256 Q -60 306 -56 342 Q -20 358 12 345 Q 36 352 58 338 Q 52 300 50 256 L 76 210 Q 62 190 16 177 Q -6 192 -24 176 Z',
  pants: PALETTE.tung.shorts, pantsLen: 'short', stripe: PALETTE.tung.shortsStripe,
  socks: { color: PALETTE.tung.socks, stripe: PALETTE.tung.socksStripe }, Foot: Turf, views: TUNG_VIEWS,
  detail: (facing) => (
    <>
      <path d="M -24 177 L -10 204 L 0 192 L 10 204 L 16 177 Z" fill={PALETTE.tung.jerseyTrim} strokeWidth={2.6} />
      <path d="M -8 184 L 0 196 L 8 184 Z" fill={PALETTE.tung.jerseyInner} stroke="none" />
      <path d="M -48 214 Q -46 236 -45 255 M 52 216 L 54 252 M -40 310 Q -16 326 14 314 M 14 332 Q 32 336 44 326" fill="none" strokeWidth={2.4} />
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
}> = ({ mood = 'annoyed', x = 0, y = 0, scale = 1, pose = TUNG_POSE, talk, blink }) => (
  <Rigged pose={pose} outfit={TUNG_OUTFIT} x={x} y={y} scale={scale} head={<TungHead mood={mood} id="tung-soccer-head" view={pose.view} facing={pose.facing} talk={talk} blink={blink} />} />
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
