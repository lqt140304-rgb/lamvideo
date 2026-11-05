import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Hero, basePose, Pose, LOOKS, CastName, Expr, KitDefs, SetDefs, FONT } from './engine';

// Bảng mẫu nhân vật (model sheet): mỗi nhân vật một bảng (bảng màu, 5 góc nhìn, 9 biểu cảm) và một bảng biểu cảm chung.
//   npx remotion still src/index.ts Model-worker out/models/worker.png
//   npx remotion still src/index.ts Expressions out/models/bieu-cam.png

export const EXPRS: [Expr, string][] = [
  ['neutral', 'BÌNH THƯỜNG'], ['happy', 'VUI'], ['smug', 'TỰ ĐẮC'], ['shock', 'SỐC'], ['worried', 'LO LẮNG'],
  ['oops', 'TOANG'], ['cool', 'NGẦU'], ['dizzy', 'CHOÁNG'], ['tired', 'MỆT'],
];
export const MODEL_CAST: { id: CastName; name: string; note: string; short: string }[] = [
  { id: 'worker', name: 'BẠN · BẢN CÔNG TRƯỜNG', short: 'BẠN · CÔNG TRƯỜNG', note: 'Áo lao động màu gạch, quần kaki, giày bảo hộ phủ bụi. Cùng một khuôn mặt ở mọi bản.' },
  { id: 'workerHat', name: 'BẠN · MŨ BẢO HỘ', short: 'BẠN · MŨ BẢO HỘ', note: 'Như bản công trường, đội mũ bảo hộ vàng khi làm việc.' },
  { id: 'student', name: 'BẠN · BẢN ĐI HỌC', short: 'BẠN · ĐI HỌC', note: 'Sơ mi trắng, quần xanh than, giày trắng. Cùng khuôn mặt.' },
  { id: 'tech', name: 'BẠN · BẢN KỸ THUẬT', short: 'BẠN · KỸ THUẬT', note: 'Áo kỹ thuật xanh thép viền vàng, giày đen. Cùng khuôn mặt.' },
  { id: 'mom', name: 'MẸ', short: 'MẸ', note: 'Tóc bob ngang cằm, áo mận.' },
  { id: 'mo', name: 'MO · BẠN HỌC', short: 'MO · BẠN HỌC', note: 'Tóc xoăn, tai nghe đỏ đeo cổ, áo xanh rêu.' },
  { id: 'chu', name: 'CHÚ ĐỘI MŨ BẢO HỘ', short: 'CHÚ (MŨ VÀNG)', note: 'Da rám, áo xanh rêu, mũ bảo hộ vàng. Người chờ cạnh xe.' },
  { id: 'bac', name: 'BÁC THỢ CẢ', short: 'BÁC THỢ CẢ', note: 'Tóc bạc, mũ bảo hộ trắng, áo xám xanh. Người chỉ việc.' },
  { id: 'moi', name: 'NGƯỜI MỚI', short: 'NGƯỜI MỚI', note: 'Mũ bảo hộ cam, áo đỏ gạch. Dây mũ hay quên cài.' },
];

const BG = '#1A1828';
const PANEL = '#232338';
const EDGE = '#34344E';
const P = (o: Partial<Pose>): Pose => ({ ...basePose, ...o });
const MONO = { fontFamily: FONT.ui, letterSpacing: 2 } as const;

/** Đầu và ngực của một nhân vật, cắt vào khung (x, y, w, h). */
const Bust: React.FC<{ id: CastName; expr: Expr; x: number; y: number; w: number; h: number }> = ({ id, expr, x, y, w, h }) => (
  <svg x={x} y={y} width={w} height={h} viewBox="-95 -290 190 224" overflow="hidden">
    <Hero look={LOOKS[id]} pose={P({ x: 0, y: 0, expr, glasses: expr === 'cool' ? 1 : 0, yaw: 0 })} shadow={0} />
  </svg>
);

export const ModelSheet: React.FC<{ id: CastName }> = ({ id }) => {
  const info = MODEL_CAST.find((c) => c.id === id)!;
  const L = LOOKS[id];
  const swatches: [string, string][] = [['DA', L.skin], ['ÁO', L.jacket], ['ĐIỂM NHẤN', L.hat ?? L.accent], ['TAY CHÂN', L.limb], ['TÓC', L.hair], ['GIÀY', L.shoe], ['NÉT', L.line]];
  const views: [number, string][] = [[-1, 'NGHIÊNG TRÁI'], [-0.5, '3/4 TRÁI'], [0, 'CHÍNH DIỆN'], [0.5, '3/4 PHẢI'], [1, 'NGHIÊNG PHẢI']];
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <KitDefs />
        <SetDefs />
        <text x={70} y={78} fontFamily={FONT.title} fontWeight={800} fontSize={48} fill="#F6EFE3">{info.name}</text>
        <text x={70} y={118} {...MONO} fontSize={21} fill="#9A92C4">{info.note}</text>
        {swatches.map(([lab, c], i) => (
          <g key={lab} transform={`translate(${1178 + i * 96} 44)`}>
            <rect width={76} height={44} rx={8} fill={c} stroke={EDGE} strokeWidth={2} />
            <text x={38} y={68} textAnchor="middle" {...MONO} letterSpacing={1} fontSize={12} fill="#8A83B4">{lab}</text>
          </g>
        ))}
        <path d="M 70 140 L 1850 140" stroke={EDGE} strokeWidth={2} />
        <path d="M 70 308 L 1850 308 M 70 412 L 1850 412" stroke={EDGE} strokeWidth={1.5} strokeDasharray="8 8" opacity={0.7} />
        <path d="M 70 656 L 1850 656" stroke={EDGE} strokeWidth={2} />
        {views.map(([yaw, lab], i) => (
          <g key={lab}>
            <Hero look={L} pose={P({ x: 240 + i * 360, y: 516, yaw, facing: yaw < 0 ? -1 : 1 })} shadow={0.6} />
            <text x={240 + i * 360} y={695} textAnchor="middle" {...MONO} fontSize={19} fill="#9A92C4">{lab}</text>
          </g>
        ))}
        <text x={70} y={740} {...MONO} fontSize={19} fill="#8A83B4">BIỂU CẢM</text>
        {EXPRS.map(([ex, lab], i) => (
          <g key={ex}>
            <rect x={70 + i * 199} y={760} width={186} height={220} rx={16} fill={PANEL} stroke={EDGE} strokeWidth={2} />
            <Bust id={id} expr={ex} x={70 + i * 199} y={760} w={186} h={220} />
            <text x={163 + i * 199} y={1012} textAnchor="middle" {...MONO} fontSize={19} fill="#B8B0DC">{lab}</text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export const SHEET_H = 130 + MODEL_CAST.length * 205 + 30;

export const Expressions: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <svg width={1920} height={SHEET_H} viewBox={`0 0 1920 ${SHEET_H}`}>
      <KitDefs />
      <SetDefs />
      <text x={40} y={70} fontFamily={FONT.title} fontWeight={800} fontSize={44} fill="#F6EFE3">BẢNG BIỂU CẢM</text>
      {EXPRS.map(([, lab], i) => (
        <text key={lab} x={386 + i * 176} y={108} textAnchor="middle" {...MONO} fontSize={17} fill="#8A83B4">{lab}</text>
      ))}
      {MODEL_CAST.map((c, r) => (
        <g key={c.id}>
          <text x={40} y={130 + r * 205 + 100} {...MONO} fontSize={19} fill="#B8B0DC">{c.short}</text>
          {EXPRS.map(([ex], i) => (
            <g key={ex}>
              <rect x={300 + i * 176} y={130 + r * 205} width={172} height={188} rx={14} fill={PANEL} stroke={EDGE} strokeWidth={2} />
              <Bust id={c.id} expr={ex} x={300 + i * 176} y={130 + r * 205} w={172} h={188} />
            </g>
          ))}
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);
