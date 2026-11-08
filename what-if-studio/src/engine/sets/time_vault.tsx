import React, { useId } from 'react';

const INK = '#1B1412';

// ============================================================================
// 1. MEMORY JARS (BA LỌ KÝ ỨC VÀ GIAO KÈO ĐẶC TẢ THEO CONCEPT)
// ============================================================================

export type MemoryJarKind =
  | 'g1'
  | 'g2'
  | 'g3'
  | 'dormant'
  | 'cradle'
  | 'kite'
  | 'violin'
  | 'letter'
  | 'umbrella'
  | 'ship';

/**
 * MemoryJar: Glass preservation canister with ornate stopper, tied twine ribbon,
 * and glowing ethereal internal essence matching the concept artwork and script:
 * - G1: Duy's childhood toy car with mother's soothing hand reconciling the children.
 * - G2: Dual-helix vortex of Thảo's violet sorrow being absorbed into Duy's amber warmth.
 * - G3: Thảo's sealed bell jar of dreams with crescent moon, locked door, and paper cranes.
 * - Other souls: cradle (lullaby), kite (innocence), violin (music), letter (vow), umbrella (rain), ship (voyage).
 */
export const MemoryJar: React.FC<{
  x: number;
  y: number;
  s?: number;
  kind?: MemoryJarKind;
  glow?: number;
  t?: number;
  showAura?: boolean;
}> = ({ x, y, s = 1, kind = 'g1', glow = 1, t = 0, showAura = true }) => {
  const pulse = Math.sin(t * 0.07) * 0.12;
  const jarGlow = Math.max(0.3, glow + pulse);

  const mainColor =
    kind === 'g1'
      ? '#F59E0B'
      : kind === 'g2'
      ? '#A855F7'
      : kind === 'g3'
      ? '#FDE047'
      : kind === 'cradle'
      ? '#38BDF8'
      : kind === 'kite'
      ? '#F87171'
      : kind === 'violin'
      ? '#C084FC'
      : kind === 'letter'
      ? '#FBBF24'
      : kind === 'umbrella'
      ? '#34D399'
      : kind === 'ship'
      ? '#22D3EE'
      : '#38BDF8';

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* Ground contact shadow */}
      <ellipse cx={0} cy={66} rx={34} ry={10} fill="#0F0906" opacity={0.65} />

      {/* Golden swirling light aura ribbons around jar */}
      {showAura ? (
        <g opacity={0.78 * jarGlow} style={{ mixBlendMode: 'screen' }}>
          <ellipse cx={0} cy={12} rx={54} ry={68} fill={mainColor} opacity={0.18} />
          <path
            d={`M -44 46 Q ${-58 + Math.sin(t * 0.1) * 8} 0 0 -58 Q ${48 + Math.cos(t * 0.1) * 8} -32 44 36`}
            stroke="#FDE68A"
            strokeWidth={2}
            fill="none"
            opacity={0.85}
          />
          <path
            d={`M -32 -32 Q ${38 + Math.cos(t * 0.08) * 8} -52 48 10 Q 32 68 -28 58`}
            stroke="#F59E0B"
            strokeWidth={1.4}
            strokeDasharray="6 4"
            fill="none"
            opacity={0.75}
          />
        </g>
      ) : null}

      {/* Internal Essence Glow Halo */}
      <ellipse cx={0} cy={14} rx={36} ry={48} fill={mainColor} opacity={0.28 * jarGlow} />

      {/* =================================================================== */}
      {/* INTERNAL CONTENT PER CONTRACT (NỘI DUNG HUYỀN ẢO BÊN TRONG LỌ)       */}
      {/* =================================================================== */}
      {kind === 'g1' ? (
        // G1: KÝ ỨC TUỔI THƠ DUY — XE ĐỒ CHƠI & BÀN TAY MẸ DỖ DÀNH LÀM HÒA
        <g transform="translate(0 14)">
          {/* Sunset country road horizon */}
          <path d="M -26 18 Q -10 8 0 13 Q 15 18 26 10 L 26 40 L -26 40 Z" fill="#78350F" opacity={0.4} />
          <path d="M -24 40 Q -6 22 20 16" stroke="#D97706" strokeWidth={3.5} fill="none" opacity={0.75} />
          <line x1={-18} y1={30} x2={-18} y2={4} stroke="#B45309" strokeWidth={1.2} />
          <line x1={-21} y1={8} x2={-15} y2={8} stroke="#B45309" strokeWidth={1.2} />

          {/* Golden toy sedan car */}
          <g transform={`translate(${Math.sin(t * 0.04) * 2} 18)`}>
            <path
              d="M -16 6 L -15 2 L -10 -4 L 8 -4 L 14 2 L 17 6 Z"
              fill="#F59E0B"
              stroke="#FEF08A"
              strokeWidth={1.4}
            />
            <polygon points="-9,-3 7,-3 5,1 -8,1" fill="#FEF9C3" opacity={0.92} />
            <circle cx={-10} cy={7} r={3.2} fill="#1E140A" stroke="#FDE68A" strokeWidth={0.9} />
            <circle cx={11} cy={7} r={3.2} fill="#1E140A" stroke="#FDE68A" strokeWidth={0.9} />
            {/* Headlight beam */}
            <polygon points="17,3 28,0 28,8 17,6" fill="#FEF08A" opacity={0.55} />
          </g>

          {/* Two small children's hands reaching toward the toy */}
          <g transform="translate(0 20)">
            {/* Child hand left */}
            <path d="M -22 8 Q -16 2 -12 6" stroke="#FEF08A" strokeWidth={2} fill="none" strokeLinecap="round" />
            {/* Child hand right */}
            <path d="M 22 8 Q 16 2 12 6" stroke="#FEF08A" strokeWidth={2} fill="none" strokeLinecap="round" />
          </g>

          {/* Mother's loving hand descending gently from above, reconciling both */}
          <g transform={`translate(0 ${-8 + Math.sin(t * 0.06) * 2})`}>
            {/* Warm protective motherly palm halo */}
            <ellipse cx={0} cy={0} rx={16} ry={10} fill="#FEF08A" opacity={0.35} />
            {/* Gentle curved wrist and palm */}
            <path d="M -6 -18 Q -4 -6 0 -2 Q 4 -6 6 -18" fill="#FDE68A" stroke="#B45309" strokeWidth={1.2} />
            {/* 4 Gentle soothing fingers curving downward */}
            <path d="M -5 -2 Q -6 6 -4 10" stroke="#FDE68A" strokeWidth={1.8} fill="none" strokeLinecap="round" />
            <path d="M -1 -1 Q -1 7 1 12" stroke="#FDE68A" strokeWidth={1.8} fill="none" strokeLinecap="round" />
            <path d="M 3 -1 Q 4 7 5 11" stroke="#FDE68A" strokeWidth={1.8} fill="none" strokeLinecap="round" />
            <path d="M 7 -3 Q 8 4 9 8" stroke="#FDE68A" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          </g>

          {/* Golden memories dust motes */}
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={-15 + ((i * 9) % 30)}
              cy={-20 + Math.sin(t * 0.08 + i * 1.5) * 8}
              r={1.2}
              fill="#FEF08A"
              opacity={0.85}
            />
          ))}
        </g>
      ) : kind === 'g2' ? (
        // G2: DẤU GIAO KÈO CHUYỂN BUỒN — VÒNG XOẮN KÉP TÍM & HỔ PHÁCH VỚI TIA SÉT CẢM XÚC
        <g transform="translate(0 14)">
          {/* Violet wisp: Thảo's sorrow, loneliness and tears */}
          <path
            d={`M -16 26 C -24 8 -6 -6 ${Math.sin(t * 0.1) * 6} -24`}
            stroke="#C084FC"
            strokeWidth={3.8}
            fill="none"
            strokeLinecap="round"
            opacity={0.9}
          />
          <path
            d={`M -14 24 C -20 10 -4 0 ${Math.sin(t * 0.1) * 4} -20`}
            stroke="#E9D5FF"
            strokeWidth={1.8}
            fill="none"
            strokeLinecap="round"
          />

          {/* Warm Amber wisp: Duy's protective love and sacrifice */}
          <path
            d={`M 16 26 C 24 8 6 -6 ${-Math.sin(t * 0.1) * 6} -24`}
            stroke="#F59E0B"
            strokeWidth={3.8}
            fill="none"
            strokeLinecap="round"
            opacity={0.9}
          />
          <path
            d={`M 14 24 C 20 10 4 0 ${-Math.sin(t * 0.1) * 4} -20`}
            stroke="#FEF08A"
            strokeWidth={1.8}
            fill="none"
            strokeLinecap="round"
          />

          {/* Central emotional transference spark / helix intersection */}
          <circle cx={0} cy={0} r={6} fill="#FAF5FF" stroke="#FDE047" strokeWidth={1.8} />
          {/* Micro emotional lightning bolts */}
          <path d="M -8 4 L -2 0 L 2 2 L 8 -2" stroke="#FEF08A" strokeWidth={1.2} fill="none" />
          <path d="M -6 -8 L 0 -2 L -2 6 L 4 10" stroke="#E9D5FF" strokeWidth={1} fill="none" />

          {/* United spiral apex glowing bright */}
          <circle cx={0} cy={-24} r={5} fill="#FAF5FF" stroke="#FDE047" strokeWidth={1.6} />

          {/* Sparkles around intertwining wisps */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const ang = i * 1.05 + t * 0.09;
            return (
              <circle
                key={i}
                cx={Math.cos(ang) * 14}
                cy={Math.sin(ang) * 18}
                r={1.3}
                fill={i % 2 ? '#FEF08A' : '#E9D5FF'}
                opacity={0.88}
              />
            );
          })}
        </g>
      ) : kind === 'g3' ? (
        // G3: LỌ NIÊM PHONG GIẤC MƠ THẢO — TRĂNG LƯỠI LIỀM, CỬA KHÉP VÀ HẠC GIẤY TAN
        <g transform="translate(0 14)">
          {/* Soft dream clouds */}
          <ellipse cx={-12} cy={18} rx={18} ry={10} fill="#E0E7FF" opacity={0.4} />
          <ellipse cx={14} cy={20} rx={18} ry={10} fill="#E0E7FF" opacity={0.35} />
          <ellipse cx={0} cy={24} rx={24} ry={11} fill="#C7D2FE" opacity={0.45} />

          {/* Golden Crescent Moon */}
          <path
            d="M -14 -12 C -8 -30 10 -24 14 -10 C 6 -14 0 -12 -4 -4 C -8 4 -6 10 -2 14 C -12 10 -18 2 -14 -12 Z"
            fill="#FDE047"
            stroke="#CA8A04"
            strokeWidth={1.2}
            opacity={0.95}
          />

          {/* Miniature Sealed Double Door */}
          <g transform="translate(8 2)">
            <rect x={-9} y={-18} width={18} height={30} rx={2} fill="#5C2D16" stroke="#FACC15" strokeWidth={1.4} />
            <line x1={0} y1={-18} x2={0} y2={12} stroke="#FACC15" strokeWidth={1.2} />
            {/* Two tiny glowing handles & keyholes */}
            <circle cx={-3.5} cy={-2} r={1.4} fill="#FEF08A" />
            <circle cx={3.5} cy={-2} r={1.4} fill="#FEF08A" />
            {/* Arched transom header */}
            <path d="M -9 -18 Q 0 -25 9 -18" stroke="#FACC15" strokeWidth={1.4} fill="none" />
            {/* Warm silhouette of mother waving farewell through the door slit */}
            <line x1={0} y1={-12} x2={0} y2={8} stroke="#FEF08A" strokeWidth={1.2} opacity={0.8} />
          </g>

          {/* Miniature paper crane dissolving into stardust */}
          <g transform={`translate(${-10 + Math.sin(t * 0.08) * 3} ${-6 + Math.cos(t * 0.08) * 2}) scale(0.65)`}>
            <polygon points="0,-8 10,2 0,6 -10,2" fill="#FFFFFF" opacity={0.9} />
            <polygon points="0,-8 14,-2 0,2" fill="#FEF9C3" opacity={0.8} />
          </g>

          {/* Night starlight sparkles */}
          <circle cx={-18} cy={-20} r={1.3} fill="#FFFFFF" />
          <circle cx={-2} cy={-26} r={1.2} fill="#FEF08A" />
          <circle cx={18} cy={-20} r={1.3} fill="#FFFFFF" />
        </g>
      ) : kind === 'cradle' ? (
        // CRADLE: KÝ ỨC NGƯỜI MẸ — CHIẾC NÔI ĐUNG ĐƯA & BÀI HÁT RU BỊ ĐỔI
        <g transform="translate(0 14)">
          <ellipse cx={0} cy={16} rx={22} ry={12} fill="#38BDF8" opacity={0.3} />
          {/* Rocking wooden cradle */}
          <g transform={`translate(0 14) rotate(${Math.sin(t * 0.08) * 7})`}>
            <path d="M -18 10 Q 0 18 18 10" stroke="#78350F" strokeWidth={2.5} fill="none" strokeLinecap="round" />
            <path d="M -16 8 L -14 -6 L 14 -6 L 16 8 Z" fill="#92400E" stroke={INK} strokeWidth={1.5} />
            <line x1={-9} y1={-5} x2={-10} y2={7} stroke="#B45309" strokeWidth={1.2} />
            <line x1={-3} y1={-5} x2={-3} y2={8} stroke="#B45309" strokeWidth={1.2} />
            <line x1={3} y1={-5} x2={3} y2={8} stroke="#B45309" strokeWidth={1.2} />
            <line x1={9} y1={-5} x2={10} y2={7} stroke="#B45309" strokeWidth={1.2} />
            <path d="M -13 -2 Q 0 4 13 -2 L 13 4 Q 0 9 -13 4 Z" fill="#E0F2FE" />
          </g>
          {/* Floating musical wave & starlight */}
          <path
            d={`M -8 ${-8 + Math.sin(t * 0.1) * 3} C -14 -18 6 -20 0 -26`}
            stroke="#BAE6FD"
            strokeWidth={1.2}
            strokeDasharray="2 2"
            fill="none"
            opacity={0.8}
          />
          <circle cx={-8} cy={-8} r={2.2} fill="#FDE047" />
          <line x1={-6} y1={-8} x2={-6} y2={-16} stroke="#FDE047" strokeWidth={1} />
          <circle cx={8} cy={-14} r={1.8} fill="#FEF08A" />
          <line x1={10} y1={-14} x2={10} y2={-20} stroke="#FEF08A" strokeWidth={1} />
        </g>
      ) : kind === 'kite' ? (
        // KITE: KÝ ỨC TUỔI THƠ — CÁNH DIỀU ĐỎ ĐỨT DÂY BAY TRONG MÂY CHIỀU
        <g transform="translate(0 14)">
          <ellipse cx={-12} cy={20} rx={16} ry={8} fill="#FDA4AF" opacity={0.35} />
          <ellipse cx={10} cy={22} rx={18} ry={9} fill="#FECDD3" opacity={0.3} />
          {/* Soaring diamond kite */}
          <g transform={`translate(${Math.sin(t * 0.06) * 3} ${-6 + Math.cos(t * 0.06) * 2}) rotate(${Math.sin(t * 0.05) * 12})`}>
            <polygon points="0,-16 12,0 0,16 -12,0" fill="#EF4444" stroke="#B91C1C" strokeWidth={1.2} />
            <polygon points="0,-16 12,0 0,0" fill="#F87171" />
            <polygon points="0,0 0,16 -12,0" fill="#DC2626" />
            <line x1={0} y1={-16} x2={0} y2={16} stroke="#FEF08A" strokeWidth={1} />
            <line x1={-12} y1={0} x2={12} y2={0} stroke="#FEF08A" strokeWidth={1} />
            {/* Swirling kite tail with bows */}
            <path
              d={`M 0 16 Q ${-12 + Math.sin(t * 0.1) * 6} 26 ${4 + Math.cos(t * 0.1) * 4} 34 Q -4 40 2 46`}
              stroke="#FDE047"
              strokeWidth={1.2}
              fill="none"
            />
            <polygon points="-8,24 -4,26 -8,28 -12,26" fill="#F59E0B" />
            <polygon points="6,32 10,34 6,36 2,34" fill="#F59E0B" />
          </g>
          <path d="M 0 6 Q -8 18 -14 32" stroke="#FFFFFF" strokeWidth={0.8} strokeDasharray="3 3" opacity={0.6} fill="none" />
        </g>
      ) : kind === 'violin' ? (
        // VIOLIN: KÝ ỨC NHẠC CÔNG — CÂY VĨ CẦM GÃY PHÍM VÀ BÀI NHẠC DANG DỞ
        <g transform="translate(0 14)">
          <ellipse cx={0} cy={12} rx={22} ry={30} fill="#C084FC" opacity={0.25} />
          <g transform={`translate(0 8) rotate(${-15 + Math.sin(t * 0.04) * 3})`}>
            <path
              d="M -11 -16 C -14 -10 -9 -4 -13 8 C -14 16 -4 20 0 20 C 4 20 14 16 13 8 C 9 -4 14 -10 11 -16 Z"
              fill="#78350F"
              stroke="#451A03"
              strokeWidth={1.4}
            />
            <path
              d="M -9 -14 C -11 -8 -7 -4 -10 7 C -11 13 -3 17 0 17 C 3 17 11 13 10 7 C 7 -4 11 -8 9 -14 Z"
              fill="#9A3412"
              opacity={0.85}
            />
            <rect x={-2.5} y={-30} width={5} height={14} fill="#451A03" />
            <circle cx={0} cy={-32} r={3} fill="#78350F" stroke="#451A03" strokeWidth={1} />
            <path d="M -5 2 Q -3 6 -5 10" stroke="#FDE047" strokeWidth={1} fill="none" />
            <path d="M 5 2 Q 3 6 5 10" stroke="#FDE047" strokeWidth={1} fill="none" />
            <polygon points="-2,12 2,12 1,18 -1,18" fill="#1C1917" />
            <line x1={-20} y1={2} x2={18} y2={-10} stroke="#E2E8F0" strokeWidth={1.2} />
            <line x1={-20} y1={3} x2={18} y2={-9} stroke="#F8FAFC" strokeWidth={0.8} />
          </g>
          {[0, 1, 2, 3].map((i) => {
            const ny = -4 - i * 8 + Math.sin(t * 0.08 + i) * 3;
            const nx = Math.cos(t * 0.08 + i * 1.5) * 14;
            return (
              <g key={i} transform={`translate(${nx} ${ny}) scale(0.85)`}>
                <circle cx={0} cy={0} r={1.6} fill="#FDE047" />
                <line x1={1.4} y1={0} x2={1.4} y2={-6} stroke="#FDE047" strokeWidth={0.9} />
              </g>
            );
          })}
        </g>
      ) : kind === 'letter' ? (
        // LETTER: KÝ ỨC NGƯỜI LÍNH — PHONG THƯ TÌNH NIÊM PHONG SÁP ĐỎ & NGỌN NẾN
        <g transform="translate(0 14)">
          <ellipse cx={8} cy={-4} rx={22} ry={22} fill="#F59E0B" opacity={0.25} />
          <g transform="translate(-4 12) rotate(-8)">
            <rect x={-14} y={-10} width={28} height={20} rx={1.5} fill="#FEF3C7" stroke="#92400E" strokeWidth={1.2} />
            <polygon points="-14,-10 0,2 14,-10" fill="#FDE68A" stroke="#B45309" strokeWidth={1} />
            <circle cx={0} cy={2} r={3.6} fill="#DC2626" stroke="#7F1D1D" strokeWidth={0.8} />
            <line x1={-10} y1={6} x2={10} y2={6} stroke="#B45309" strokeWidth={0.8} opacity={0.6} />
          </g>
          <g transform="translate(12 8)">
            <ellipse cx={0} cy={14} rx={10} ry={3.5} fill="#78350F" stroke={INK} strokeWidth={1} />
            <rect x={-3} y={0} width={6} height={14} fill="#FEF9C3" stroke="#B45309" strokeWidth={1} />
            <line x1={0} y1={0} x2={0} y2={-3} stroke="#1C1917" strokeWidth={1} />
            <path
              d={`M 0 -3 Q ${-4 + Math.sin(t * 0.15) * 1.5} -9 0 -15 Q ${4 - Math.sin(t * 0.15) * 1.5} -9 0 -3 Z`}
              fill="#F59E0B"
            />
            <path d="M 0 -3 Q -2 -8 0 -12 Q 2 -8 0 -3 Z" fill="#FEF08A" />
          </g>
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              cx={-8 + i * 8 + Math.sin(t * 0.1 + i) * 3}
              cy={-14 - i * 5}
              r={1}
              fill="#FDE047"
              opacity={0.8}
            />
          ))}
        </g>
      ) : kind === 'umbrella' ? (
        // UMBRELLA: KÝ ỨC MỐI TÌNH ĐẦU — CHIẾC Ô VÀNG DƯỚI ĐÈN ĐƯỜNG ĐÊM MƯA
        <g transform="translate(0 14)">
          <ellipse cx={0} cy={14} rx={24} ry={16} fill="#059669" opacity={0.2} />
          <g transform="translate(-14 4)">
            <line x1={0} y1={24} x2={0} y2={-16} stroke="#334155" strokeWidth={2} />
            <polygon points="-5,-16 5,-16 4,-26 -4,-26" fill="#FEF08A" stroke="#1E293B" strokeWidth={1} />
            <polygon points="0,-20 -18,24 18,24" fill="#FEF08A" opacity={0.16} />
          </g>
          <g transform="translate(6 6) rotate(6)">
            <path d="M -16 6 Q 0 -12 16 6 C 10 3 6 4 0 3 C -6 4 -10 3 -16 6 Z" fill="#EAB308" stroke="#854D0E" strokeWidth={1.2} />
            <path d="M 0 -12 Q -8 -2 -10 3 M 0 -12 Q 8 -2 10 3" stroke="#CA8A04" strokeWidth={0.8} fill="none" />
            <line x1={0} y1={-12} x2={0} y2={18} stroke="#475569" strokeWidth={1.4} />
            <path d="M 0 18 Q 0 24 -4 24 Q -8 24 -8 20" stroke="#475569" strokeWidth={1.4} fill="none" />
          </g>
          {[0, 1, 2, 3, 4].map((i) => {
            const rx = -18 + ((i * 11) % 36);
            const ry = 22 - (((t * 0.8 + i * 12) % 36));
            return (
              <line
                key={i}
                x1={rx}
                y1={ry}
                x2={rx}
                y2={ry - 4}
                stroke="#67E8F9"
                strokeWidth={1.2}
                strokeLinecap="round"
                opacity={0.7}
              />
            );
          })}
        </g>
      ) : kind === 'ship' ? (
        // SHIP: KÝ ỨC KHÁT VỌNG — CON THUYỀN VIỄN DƯƠNG VÀ NGỌN HẢI ĐĂNG
        <g transform="translate(0 14)">
          <ellipse cx={0} cy={16} rx={24} ry={14} fill="#06B6D4" opacity={0.25} />
          <path
            d="M -26 24 Q -16 18 -6 22 Q 4 26 14 20 Q 22 24 26 22 L 26 34 L -26 34 Z"
            fill="#0E7490"
            opacity={0.8}
          />
          <path
            d="M -26 26 Q -14 22 -2 25 Q 10 28 26 23"
            stroke="#67E8F9"
            strokeWidth={1.4}
            fill="none"
          />
          <g transform={`translate(${Math.sin(t * 0.05) * 2} ${12 + Math.cos(t * 0.06) * 2}) rotate(${Math.sin(t * 0.06) * 8})`}>
            <path d="M -14 4 L 14 4 Q 16 -1 18 -3 L -16 -3 Z" fill="#78350F" stroke="#451A03" strokeWidth={1} />
            <line x1={-7} y1={-3} x2={-7} y2={-18} stroke="#451A03" strokeWidth={1.2} />
            <line x1={1} y1={-3} x2={1} y2={-22} stroke="#451A03" strokeWidth={1.4} />
            <line x1={9} y1={-3} x2={9} y2={-17} stroke="#451A03" strokeWidth={1.2} />
            <path d="M -7 -16 Q -2 -14 -7 -6 Z" fill="#F8FAFC" opacity={0.9} />
            <path d="M 1 -20 Q 7 -17 1 -8 Z" fill="#F8FAFC" opacity={0.95} />
            <path d="M 9 -15 Q 13 -13 9 -7 Z" fill="#F8FAFC" opacity={0.9} />
            <polygon points="1,-22 5,-21 1,-20" fill="#EF4444" />
          </g>
          <polygon points="-24,-10 24,-20 24,0" fill="#FEF08A" opacity={0.12} />
        </g>
      ) : (
        // Dormant jar: soft drifting luminescent dust
        <g transform="translate(0 14)">
          {[0, 1, 2, 3].map((i) => (
            <circle
              key={i}
              cx={-12 + ((i * 13) % 24)}
              cy={-14 + Math.sin(t * 0.08 + i * 2) * 14}
              r={1.8}
              fill="#67E8F9"
              opacity={0.65}
            />
          ))}
        </g>
      )}

      {/* =================================================================== */}
      {/* GLASS CANISTER BODY & SPECULAR HIGHLIGHTS                           */}
      {/* =================================================================== */}
      {/* Transparent glass cylinder */}
      <rect
        x={-30}
        y={-34}
        width={60}
        height={95}
        rx={12}
        fill="#E0F2FE"
        opacity={0.16}
        stroke={INK}
        strokeWidth={2.6}
      />
      {/* Side specular curved glass streaks */}
      <path
        d="M -23 -28 Q -26 14 -22 52"
        stroke="#FFFFFF"
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.6}
        fill="none"
      />
      <path
        d="M -16 -28 Q -19 14 -16 48"
        stroke="#FFFFFF"
        strokeWidth={1.2}
        strokeLinecap="round"
        opacity={0.35}
        fill="none"
      />
      <path
        d="M 23 -26 Q 26 14 23 52"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.45}
        fill="none"
      />

      {/* Heavy glass bottom plate */}
      <rect x={-27} y={55} width={54} height={6} rx={3} fill="#BAE6FD" opacity={0.3} />

      {/* =================================================================== */}
      {/* BRASS / WOODEN LID WITH TWINE RIBBON AND WAX SEAL                   */}
      {/* =================================================================== */}
      {/* Jar neck lip */}
      <rect x={-24} y={-38} width={48} height={6} rx={2} fill="#D97706" stroke={INK} strokeWidth={2.2} />
      {/* Jar stopper dome */}
      <path d="M -21 -38 Q 0 -50 21 -38 Z" fill="#92400E" stroke={INK} strokeWidth={2.4} />
      <ellipse cx={0} cy={-42} rx={6} ry={3} fill="#FDE68A" />

      {/* Tied red/brown twine ribbon around neck */}
      <rect x={-23} y={-36} width={46} height={3} fill="#B91C1C" />
      {/* Hanging ribbon tails */}
      <path
        d="M 16 -35 Q 26 -28 28 -12 M 16 -35 Q 22 -22 22 -6"
        stroke="#B91C1C"
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      {/* Metallic seal medallion */}
      <circle cx={16} cy={-34} r={3.8} fill="#CA8A04" stroke="#451A03" strokeWidth={1} />
    </g>
  );
};

// ============================================================================
// 2. CLOCK CREATURE (QUÁI VẬT ĐỒNG HỒ BA MẮT — NGUYÊN HÌNH ÔNG LỘC THEO BẢN VẼ)
// ============================================================================

/**
 * ClockCreature: Faithful reproduction of the user's reference concept art:
 * - Large cylindrical antique pocket watch body tilted in 3/4 perspective with verdigris patina.
 * - Top winder crown and carrying ring loop.
 * - Aged ivory dial with fine hairline cracks, hour ticks, Roman numerals, and ornate clock hands.
 * - Aged craftsman face seamlessly blended into the dial:
 *   * Three calculating amber eyes in a triangle: 1 upper forehead eye, 2 lower eyes.
 *   * Heavy drooping upper eyelids, wrinkles, crow's feet, bags under eyes, sparse white brows.
 *   * Low thin smirking mouth tilted in a knowing curved smile.
 * - Slender articulated brass limbs:
 *   * Left arm raised in an open claw inviting/appraising gesture.
 *   * Right arm reaching down with skeletal fingers gripping the lid of the G1 jar.
 * - Double-jointed spindly legs bent backwards, floating above ground with cast shadow.
 */
export const ClockCreature: React.FC<{
  x: number;
  y: number;
  s?: number;
  t?: number;
  hover?: boolean;
  eyeGazeX?: number;
  eyeGazeY?: number;
  smirk?: number;
  showJars?: boolean;
}> = ({
  x,
  y,
  s = 1,
  t = 0,
  hover = true,
  eyeGazeX = 0,
  eyeGazeY = 0,
  smirk = 1,
  showJars = true,
}) => {
  // Gentle hovering vertical bob and subtle forward-backward rocking
  const floatY = hover ? Math.sin(t * 0.05) * 12 : 0;
  const floatRot = hover ? Math.sin(t * 0.04) * 2.2 : 0;
  const fingerTwitch = Math.sin(t * 0.09) * 2;
  const gearSpin = t * 1.5;
  const haloSpin = t * 0.35;
  const corePulse = Math.sin(t * 0.12) * 0.18;

  return (
    <g transform={`translate(${x} ${y + floatY}) rotate(${floatRot}) scale(${s})`}>
      {/* =================================================================== */}
      {/* GROUND CAST SHADOW & ABYSSAL VOID MIST                              */}
      {/* =================================================================== */}
      <ellipse
        cx={-20}
        cy={300 - floatY * 0.4}
        rx={135 + floatY * 0.6}
        ry={28 - floatY * 0.2}
        fill="#09050F"
        opacity={0.75}
      />
      {/* Dark shadowy chronal mist billowing beneath the monster */}
      <ellipse
        cx={-15}
        cy={270}
        rx={80 + Math.sin(t * 0.07) * 12}
        ry={18}
        fill="#3B0764"
        opacity={0.3}
        style={{ mixBlendMode: 'screen', filter: 'blur(8px)' }}
      />

      {/* =================================================================== */}
      {/* 0. ROTATING MECHANICAL GEAR HALO & SPIKED CROWN RAYS               */}
      {/* =================================================================== */}
      <g transform={`rotate(${haloSpin})`}>
        {/* Outer spiked halo ring */}
        <circle cx={0} cy={0} r={175} fill="none" stroke="#6D491C" strokeWidth={2} strokeDasharray="12 12" opacity={0.6} />
        {/* Radiating spiked brass teeth */}
        {Array.from({ length: 16 }).map((_, i) => {
          const ang = (i * 22.5 * Math.PI) / 180;
          const x1 = Math.cos(ang) * 162;
          const y1 = Math.sin(ang) * 162;
          const x2 = Math.cos(ang) * 186;
          const y2 = Math.sin(ang) * 186;
          return (
            <line
              key={`spk_${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#D4A24C"
              strokeWidth={i % 2 === 0 ? 3.5 : 1.8}
              strokeLinecap="round"
              opacity={0.7}
            />
          );
        })}
      </g>

      {/* =================================================================== */}
      {/* 1. REAR CYLINDRICAL HOUSING & EXPOSED INTERNAL GEARS                */}
      {/* =================================================================== */}
      <g>
        {/* Rear cylindrical barrel shell */}
        <path
          d="M -140 -140 C -240 -65 -260 85 -168 172 L -105 140 C -178 65 -158 -65 -85 -125 Z"
          fill="#3E2718"
          stroke={INK}
          strokeWidth={4.5}
        />
        <path
          d="M -150 -130 C -245 -55 -265 80 -178 162 C -215 90 -210 -25 -125 -100 Z"
          fill="#233529"
          opacity={0.88}
        />
        {/* Verdigris patina scrollwork on rear casing */}
        <path
          d="M -185 -90 C -220 -45 -215 35 -172 102 Q -150 45 -155 -10 Q -160 -65 -185 -90 Z"
          fill="#4D7058"
          stroke="#1E3327"
          strokeWidth={1.8}
        />
        {/* Open mechanical casing showing large brass gear teeth inside */}
        <g transform="translate(-175 22) rotate(-25)">
          <circle cx={0} cy={0} r={36} fill="#4A2810" stroke={INK} strokeWidth={2.4} />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={i}
              x={-4.5}
              y={-38}
              width={9}
              height={7}
              fill="#D4A24C"
              stroke={INK}
              strokeWidth={1.2}
              transform={`rotate(${i * 30 + gearSpin})`}
            />
          ))}
          <circle cx={0} cy={0} r={16} fill="#8A5A20" stroke={INK} strokeWidth={1.8} />
          <circle cx={0} cy={0} r={6} fill="#FEF08A" />
        </g>

        {/* Pulsing coiled mainspring barrel behind side vent */}
        <g transform="translate(-135 -60)">
          <circle cx={0} cy={0} r={22} fill="#24140B" stroke="#8A5A20" strokeWidth={1.5} />
          {/* Glowing coiled spring */}
          <path
            d="M 0 0 C 8 -4 14 6 10 12 C 4 18 -8 14 -12 6 C -16 -4 -6 -16 6 -16 C 18 -16 22 -2 18 10"
            stroke="#F59E0B"
            strokeWidth={2}
            fill="none"
            opacity={0.85 + corePulse}
          />
        </g>
      </g>

      {/* =================================================================== */}
      {/* 2. TOP POCKET WATCH WINDER CROWN & GOTHIC FINIAL HORNS              */}
      {/* =================================================================== */}
      <g transform="translate(-40 -168) rotate(-14)">
        {/* Gothic brass finial horns curving outward */}
        <path d="M -14 -12 Q -38 -45 -62 -35 Q -44 -18 -22 -6" fill="#8A5A20" stroke={INK} strokeWidth={2} />
        <path d="M 14 -12 Q 38 -45 62 -35 Q 44 -18 22 -6" fill="#8A5A20" stroke={INK} strokeWidth={2} />

        {/* Heavy brass carrying loop ring */}
        <path
          d="M -32 -26 C -48 -58 48 -58 32 -26"
          fill="none"
          stroke="#C28833"
          strokeWidth={12}
          strokeLinecap="round"
        />
        <path
          d="M -32 -26 C -48 -58 48 -58 32 -26"
          fill="none"
          stroke="#FDE047"
          strokeWidth={4.5}
          strokeLinecap="round"
        />
        <path
          d="M -32 -26 C -48 -58 48 -58 32 -26"
          fill="none"
          stroke={INK}
          strokeWidth={2.4}
        />
        {/* Fluted winder crown knob */}
        <rect x={-15} y={-26} width={30} height={20} rx={4} fill="#946323" stroke={INK} strokeWidth={3} />
        <line x1={-9} y1={-26} x2={-9} y2={-6} stroke="#FDE047" strokeWidth={1.8} />
        <line x1={0} y1={-26} x2={0} y2={-6} stroke="#FDE047" strokeWidth={1.8} />
        <line x1={9} y1={-26} x2={9} y2={-6} stroke="#FDE047" strokeWidth={1.8} />
        {/* Crown base neck */}
        <rect x={-10} y={-8} width={20} height={11} fill="#5C3B14" stroke={INK} strokeWidth={2.6} />
      </g>

      {/* =================================================================== */}
      {/* 3. MAIN CLOCK BODY BEZEL (VIỀN ĐỒNG MẶT TRƯỚC BẤT ĐỐI XỨNG)         */}
      {/* =================================================================== */}
      <g>
        {/* Outer thick brass bezel with sharp ornate flanges */}
        <path
          d="M 0 -165 C 100 -165 172 -92 172 0 C 172 100 95 172 0 172 C -100 172 -172 95 -172 0 C -172 -95 -100 -165 0 -165 Z"
          fill="#784E1B"
          stroke={INK}
          strokeWidth={5.5}
        />
        {/* Verdigris patina inlay on outer bezel */}
        <path
          d="M -65 -155 C -135 -125 -162 -55 -156 22 C -150 85 -115 142 -42 162 C -62 125 -72 85 -68 22 C -62 -42 -38 -115 -65 -155 Z"
          fill="#3E5C46"
          stroke={INK}
          strokeWidth={2}
        />
        {/* Gold stepped inner bezel ring */}
        <circle cx={0} cy={0} r={152} fill="#B4822A" stroke={INK} strokeWidth={3.8} />
        <circle cx={0} cy={0} r={140} fill="#5C3B14" stroke={INK} strokeWidth={2.2} />
        <circle cx={0} cy={0} r={132} fill="#E5B962" stroke="#7A4E1B" strokeWidth={2} />
      </g>

      {/* =================================================================== */}
      {/* 4. THE AGED FACE ON THE CLOCK DIAL (GƯƠNG MẶT ÔNG LỘC TRÊN MẶT SỐ)  */}
      {/* =================================================================== */}
      <g>
        {/* Ivory porcelain dial plate with weathered aged patina */}
        <circle cx={0} cy={0} r={128} fill="#F4EAD4" stroke={INK} strokeWidth={3.2} />

        {/* Dial radial crackle lines (Đường men rạn) */}
        <path d="M 88 -78 L 72 -52 L 82 -32 L 62 -12 M 72 -52 L 52 -62" stroke="#B8A484" strokeWidth={1.3} fill="none" opacity={0.7} />
        <path d="M -92 -42 L -72 -32 L -78 -12 L -58 12" stroke="#B8A484" strokeWidth={1.3} fill="none" opacity={0.7} />
        <path d="M -32 98 L -22 78 L -38 58 M -22 78 L 0 72" stroke="#B8A484" strokeWidth={1.3} fill="none" opacity={0.65} />

        {/* 12 Roman numerals & tick marks around dial perimeter */}
        {['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].map((num, i) => {
          const ang = ((i * 30 - 90) * Math.PI) / 180;
          const x1 = Math.cos(ang) * 115;
          const y1 = Math.sin(ang) * 115;
          const x2 = Math.cos(ang) * 125;
          const y2 = Math.sin(ang) * 125;
          const tx = Math.cos(ang) * 104;
          const ty = Math.sin(ang) * 104;
          return (
            <g key={`num_face_${i}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#543D28" strokeWidth={i % 3 === 0 ? 3.5 : 2} strokeLinecap="round" />
              <text x={tx} y={ty + 3} fill="#78522E" fontSize={8.5} fontFamily="Cinzel, Georgia, serif" fontWeight="bold" textAnchor="middle" opacity={0.75}>
                {num}
              </text>
            </g>
          );
        })}

        {/* Small exposed gears embedded at bottom-left of dial */}
        <g transform="translate(-78 76)">
          <circle cx={0} cy={0} r={17} fill="#8A5A20" stroke={INK} strokeWidth={2} />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect
              key={i}
              x={-2.5}
              y={-19}
              width={5}
              height={4.5}
              fill="#D4A24C"
              stroke={INK}
              strokeWidth={0.9}
              transform={`rotate(${i * 45 - gearSpin})`}
            />
          ))}
          <circle cx={0} cy={0} r={5.5} fill="#4A2E12" />
        </g>

        {/* --- FACIAL SKIN CREASES & WRINKLES (NẾP GẤP DA MẶT NGƯỜI GIÀ) --- */}
        {/* Forehead wrinkles above upper eye */}
        <path d="M -44 -94 Q 0 -102 44 -94" stroke="#9E8262" strokeWidth={2.6} fill="none" strokeLinecap="round" />
        <path d="M -52 -84 Q 0 -92 52 -84" stroke="#9E8262" strokeWidth={2.8} fill="none" strokeLinecap="round" />
        <path d="M -36 -74 Q 0 -80 36 -74" stroke="#9E8262" strokeWidth={2.2} fill="none" strokeLinecap="round" />

        {/* Wrinkles and bags under lower eyes */}
        <path d="M -82 0 Q -54 20 -28 3" stroke="#9E8262" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <path d="M -76 12 Q -52 30 -26 15" stroke="#B09677" strokeWidth={2} fill="none" strokeLinecap="round" />
        <path d="M 28 3 Q 54 20 82 0" stroke="#9E8262" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <path d="M 26 15 Q 52 30 76 12" stroke="#B09677" strokeWidth={2} fill="none" strokeLinecap="round" />

        {/* Nasolabial folds (Rãnh cười & khóe miệng người già) */}
        <path d="M -42 30 Q -52 52 -30 68" stroke="#8A6E50" strokeWidth={2.6} fill="none" strokeLinecap="round" />
        <path d="M 42 30 Q 52 52 30 68" stroke="#8A6E50" strokeWidth={2.6} fill="none" strokeLinecap="round" />
        {/* Chin creases */}
        <path d="M -18 80 Q 0 86 18 80" stroke="#A88E72" strokeWidth={2} fill="none" strokeLinecap="round" />

        {/* Coiled wire mustache at mouth corners */}
        <path d="M -36 50 Q -52 46 -48 64 Q -44 74 -36 70" stroke="#8A5A20" strokeWidth={1.4} fill="none" />
        <path d="M 36 50 Q 52 46 48 64 Q 44 74 36 70" stroke="#8A5A20" strokeWidth={1.4} fill="none" />

        {/* --- THREE ELDRITCH LENS EYES IN A TRIANGLE (BA MẮT QUỶ QUYỆT) --- */}

        {/* 1. TOP APEX EYE (Mắt trên trán: Thấu kính quang học đa tầng) */}
        <g transform="translate(0 -55)">
          {/* Sparse wiry white eyebrow */}
          <path d="M -40 -17 Q 0 -28 40 -17" stroke="#EFE8D8" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M -38 -18 Q 0 -29 38 -18" stroke="#9C8974" strokeWidth={1.8} fill="none" strokeLinecap="round" />

          {/* Steampunk Brass Aperture Rim */}
          <ellipse cx={0} cy={0} rx={34} ry={16} fill="#3E2718" stroke={INK} strokeWidth={2.8} />

          {/* Amber-gold glowing iris */}
          <ellipse cx={eyeGazeX * 4} cy={eyeGazeY * 2} rx={24} ry={14} fill="#D97706" />
          <ellipse cx={eyeGazeX * 4} cy={eyeGazeY * 2} rx={18} ry={10} fill="#F59E0B" />
          <ellipse cx={eyeGazeX * 4} cy={eyeGazeY * 2} rx={13} ry={7} fill="#FEF08A" />

          {/* Optical aperture blades */}
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`ap_${i}`}
              x1={Math.cos((i * 60 * Math.PI) / 180) * 16}
              y1={Math.sin((i * 60 * Math.PI) / 180) * 8}
              x2={Math.cos(((i * 60 + 35) * Math.PI) / 180) * 8}
              y2={Math.sin(((i * 60 + 35) * Math.PI) / 180) * 4}
              stroke="#B45309"
              strokeWidth={1}
            />
          ))}

          {/* Dual sharp slit pupil (Đồng tử kép sắc lạnh) */}
          <ellipse cx={eyeGazeX * 4 - 2} cy={eyeGazeY * 2} rx={7} ry={2.2} fill="#120603" />
          <ellipse cx={eyeGazeX * 4 + 2} cy={eyeGazeY * 2} rx={7} ry={2.2} fill="#120603" />
          {/* Specular highlight */}
          <circle cx={-4 + eyeGazeX * 3} cy={-3 + eyeGazeY} r={2.8} fill="#FFFFFF" />

          {/* Drooping mechanical upper lid fold */}
          <path
            d="M -36 0 C -26 -18 26 -18 36 0 C 24 -8 -24 -8 -36 0 Z"
            fill="#DCCBB0"
            stroke={INK}
            strokeWidth={2.2}
          />
          <path d="M -34 -7 Q 0 -20 34 -7" stroke="#7A5D40" strokeWidth={2.2} fill="none" />
        </g>

        {/* 2. LOWER-LEFT EYE (Mắt dưới trái) */}
        <g transform="translate(-50 -8) rotate(4)">
          <path d="M -30 -15 Q 0 -24 28 -15" stroke="#EFE8D8" strokeWidth={4.2} fill="none" strokeLinecap="round" />
          <ellipse cx={0} cy={0} rx={28} ry={14} fill="#4A3423" stroke={INK} strokeWidth={2.4} />
          {/* Amber iris */}
          <ellipse cx={eyeGazeX * 3} cy={eyeGazeY * 2} rx={19} ry={12} fill="#D97706" />
          <ellipse cx={eyeGazeX * 3} cy={eyeGazeY * 2} rx={14} ry={8.5} fill="#F59E0B" />
          <ellipse cx={eyeGazeX * 3} cy={eyeGazeY * 2} rx={9} ry={5.5} fill="#FEF08A" />
          <ellipse cx={eyeGazeX * 3} cy={eyeGazeY * 2} rx={8.5} ry={2.4} fill="#180C06" />
          <circle cx={-3 + eyeGazeX * 2} cy={-2} r={2.2} fill="#FFFFFF" />
          {/* Squinting drooping lid fold */}
          <path
            d="M -30 0 C -22 -15 22 -15 30 0 C 20 -7 -20 -7 -30 0 Z"
            fill="#DCCBB0"
            stroke={INK}
            strokeWidth={2}
          />
          <path d="M -28 -6 Q 0 -15 28 -6" stroke="#7A5D40" strokeWidth={2} fill="none" />
        </g>

        {/* 3. LOWER-RIGHT EYE (Mắt dưới phải) */}
        <g transform="translate(50 -8) rotate(-4)">
          <path d="M -28 -15 Q 0 -24 30 -15" stroke="#EFE8D8" strokeWidth={4.2} fill="none" strokeLinecap="round" />
          <ellipse cx={0} cy={0} rx={28} ry={14} fill="#4A3423" stroke={INK} strokeWidth={2.4} />
          {/* Amber iris */}
          <ellipse cx={eyeGazeX * 3} cy={eyeGazeY * 2} rx={19} ry={12} fill="#D97706" />
          <ellipse cx={eyeGazeX * 3} cy={eyeGazeY * 2} rx={14} ry={8.5} fill="#F59E0B" />
          <ellipse cx={eyeGazeX * 3} cy={eyeGazeY * 2} rx={9} ry={5.5} fill="#FEF08A" />
          <ellipse cx={eyeGazeX * 3} cy={eyeGazeY * 2} rx={8.5} ry={2.4} fill="#180C06" />
          <circle cx={-3 + eyeGazeX * 2} cy={-2} r={2.2} fill="#FFFFFF" />
          {/* Squinting drooping lid fold */}
          <path
            d="M -30 0 C -22 -15 22 -15 30 0 C 20 -7 -20 -7 -30 0 Z"
            fill="#DCCBB0"
            stroke={INK}
            strokeWidth={2}
          />
          <path d="M -28 -6 Q 0 -15 28 -6" stroke="#7A5D40" strokeWidth={2} fill="none" />
        </g>

        {/* --- NOSE RIDGE & BRIDGE --- */}
        <path d="M -2 -14 L 3 14 L -4 24 L 4 25" stroke="#9C8264" strokeWidth={2.2} fill="none" strokeLinecap="round" />

        {/* --- THIN KNOWING SMIRK WITH TINY COG TEETH --- */}
        <g transform={`translate(0 56) scale(${smirk})`}>
          {/* Mouth cavity */}
          <path d="M -34 4 Q -10 16 0 15 Q 22 11 36 -2 Q 22 6 0 10 Q -12 11 -34 4 Z" fill="#2E1208" />
          {/* Tiny gear-teeth studs */}
          {[-16, -8, 0, 8, 16, 24].map((px, i) => (
            <rect key={i} x={px} y={8} width={2.5} height={3} fill="#FEF08A" opacity={0.8} />
          ))}
          {/* Thin curved smirk line */}
          <path
            d="M -35 4 Q -12 17 0 15 Q 24 10 38 -2"
            stroke="#5C3B24"
            strokeWidth={3.8}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M -35 4 Q -12 17 0 15 Q 24 10 38 -2"
            stroke="#9A4522"
            strokeWidth={1.6}
            fill="none"
            strokeLinecap="round"
          />
          {/* Upturned right mouth corner */}
          <path d="M 34 -3 Q 39 -7 38 -2" stroke="#5C3B24" strokeWidth={3.2} fill="none" />
          <path d="M -12 23 Q 6 26 19 20" stroke="#B09677" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        </g>

        {/* --- STILETTO CLOCK HANDS INTERWEAVING THE FACE --- */}
        <circle cx={0} cy={12} r={8} fill="#D4A24C" stroke={INK} strokeWidth={2.4} />
        <circle cx={0} cy={12} r={3.5} fill="#451A03" />

        {/* Hour Stiletto Hand: pointing toward upper-left */}
        <g transform="translate(0 12) rotate(-55)">
          <path d="M 0 7 L -4 0 L -1 -58 L 0 -72 L 1 -58 L 4 0 Z" fill="#4A3018" stroke={INK} strokeWidth={1.8} />
          <circle cx={0} cy={-45} r={5.5} fill="#C28833" stroke={INK} strokeWidth={1.4} />
        </g>
        {/* Minute Stiletto Hand: pointing toward upper-right */}
        <g transform="translate(0 12) rotate(65)">
          <path d="M 0 9 L -3 0 L -1 -78 L 0 -96 L 1 -78 L 3 0 Z" fill="#4A3018" stroke={INK} strokeWidth={1.8} />
          <circle cx={0} cy={-62} r={6.5} fill="#FDE047" stroke={INK} strokeWidth={1.4} />
        </g>
        {/* Second Needle Hand with counterweight */}
        <g transform="translate(0 12) rotate(145)">
          <line x1={0} y1={-20} x2={0} y2={60} stroke="#B91C1C" strokeWidth={1.6} />
          <polygon points="-3.5,54 3.5,54 0,63" fill="#DC2626" />
        </g>
      </g>

      {/* =================================================================== */}
      {/* 5. SLENDER ARTICULATED RAPTOR LEGS (CHÂN CƠ KHÍ GẬP NGƯỢC)         */}
      {/* =================================================================== */}
      <g>
        {/* Left Leg: Double-jointed, bent backwards at knee */}
        <g transform="translate(-52 152)">
          <circle cx={0} cy={0} r={11} fill="#8A5A20" stroke={INK} strokeWidth={2.6} />
          <circle cx={0} cy={0} r={4.5} fill="#FDE047" />
          {/* Thigh rod & piston cylinder */}
          <path d="M 0 0 L -28 48" stroke="#C28833" strokeWidth={7} strokeLinecap="round" />
          <line x1={-4} y1={2} x2={-26} y2={42} stroke="#FEF08A" strokeWidth={1.8} />
          {/* Knee gear socket */}
          <circle cx={-28} cy={48} r={9} fill="#8A5A20" stroke={INK} strokeWidth={2.4} />
          <circle cx={-28} cy={48} r={3.5} fill="#5C3B14" />
          {/* Shin rod angling forward */}
          <path d="M -28 48 L 8 100" stroke="#C28833" strokeWidth={5.5} strokeLinecap="round" />
          {/* Ankle and pointed metal claw foot */}
          <path d="M 8 100 Q 18 122 16 132 Q 4 126 0 110 Z" fill="#946323" stroke={INK} strokeWidth={2.2} />
        </g>

        {/* Right Leg */}
        <g transform="translate(32 160)">
          <circle cx={0} cy={0} r={10} fill="#8A5A20" stroke={INK} strokeWidth={2.6} />
          <circle cx={0} cy={0} r={4} fill="#FDE047" />
          <path d="M 0 0 L 28 45" stroke="#C28833" strokeWidth={7} strokeLinecap="round" />
          <circle cx={28} cy={45} r={8.5} fill="#8A5A20" stroke={INK} strokeWidth={2.2} />
          <path d="M 28 45 L 9 98" stroke="#C28833" strokeWidth={5.2} strokeLinecap="round" />
          <path d="M 9 98 Q 2 118 0 126 Q -9 120 -3 105 Z" fill="#946323" stroke={INK} strokeWidth={2.2} />
        </g>
      </g>

      {/* =================================================================== */}
      {/* 6. LEFT ARM: OPEN CLAW WITH CHRONAL SPARKS                          */}
      {/* =================================================================== */}
      <g transform="translate(-165 5)">
        <circle cx={0} cy={0} r={16} fill="#8A5A20" stroke={INK} strokeWidth={3.2} />
        <circle cx={0} cy={0} r={6.5} fill="#FDE047" />

        <path d="M 0 0 L -68 54" stroke="#C28833" strokeWidth={9.5} strokeLinecap="round" />
        <path d="M -4 0 L -68 54" stroke="#5C3B14" strokeWidth={2.8} fill="none" />

        {/* Elbow gear joint */}
        <g transform="translate(-68 54) rotate(35)">
          <circle cx={0} cy={0} r={15} fill="#8A5A20" stroke={INK} strokeWidth={2.6} />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect
              key={i}
              x={-2.5}
              y={-17}
              width={5}
              height={4.5}
              fill="#FDE047"
              transform={`rotate(${i * 60})`}
            />
          ))}
          <circle cx={0} cy={0} r={5.5} fill="#4A2E12" />
        </g>

        <path d="M -68 54 L -36 114" stroke="#C28833" strokeWidth={8.5} strokeLinecap="round" />
        <circle cx={-36} cy={114} r={9.5} fill="#8A5A20" stroke={INK} strokeWidth={2.2} />

        {/* Expressive Open Claw Hand with chronal spark motes */}
        <g transform={`translate(-36 114) rotate(${fingerTwitch * 2})`}>
          <path d="M -7 0 L 11 4 L 9 17 L -7 13 Z" fill="#946323" stroke={INK} strokeWidth={2.2} />
          <path d="M -7 4 Q -20 8 -18 24" stroke="#C28833" strokeWidth={4.2} fill="none" strokeLinecap="round" />
          <path d="M 0 14 Q 4 30 15 36 Q 24 38 30 30" stroke="#C28833" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M 4 14 Q 15 28 28 30 Q 38 28 40 20" stroke="#C28833" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M 9 12 Q 20 23 30 21" stroke="#C28833" strokeWidth={3.8} fill="none" strokeLinecap="round" />
          <path d="M 9 6 Q 18 13 24 11" stroke="#C28833" strokeWidth={3.2} fill="none" strokeLinecap="round" />

          {/* Floating chronal sparks above the open claw */}
          {[0, 1, 2].map((i) => (
            <circle
              key={`spk_claw_${i}`}
              cx={24 + Math.sin(t * 0.1 + i * 2) * 8}
              cy={12 - i * 10}
              r={1.4}
              fill="#FDE047"
              opacity={0.85}
            />
          ))}
        </g>
      </g>

      {/* =================================================================== */}
      {/* 7. RIGHT ARM: GRIPPING G1 JAR WITH SKELETAL TALONS                  */}
      {/* =================================================================== */}
      <g transform="translate(160 12)">
        <circle cx={0} cy={0} r={16} fill="#8A5A20" stroke={INK} strokeWidth={3.2} />
        <circle cx={0} cy={0} r={6.5} fill="#FDE047" />

        <path d="M 0 0 L 75 40" stroke="#C28833" strokeWidth={9.5} strokeLinecap="round" />

        <g transform="translate(75 40) rotate(-40)">
          <circle cx={0} cy={0} r={15} fill="#8A5A20" stroke={INK} strokeWidth={2.6} />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect
              key={i}
              x={-2.5}
              y={-17}
              width={5}
              height={4.5}
              fill="#FDE047"
              transform={`rotate(${i * 60})`}
            />
          ))}
          <circle cx={0} cy={0} r={5.5} fill="#4A2E12" />
        </g>

        <path d="M 75 40 L 46 120" stroke="#C28833" strokeWidth={8.5} strokeLinecap="round" />
        <circle cx={46} cy={120} r={9.5} fill="#8A5A20" stroke={INK} strokeWidth={2.2} />

        {/* Hand grasping the jar stopper lid firmly */}
        <g transform={`translate(46 120) rotate(${fingerTwitch})`}>
          <path d="M -13 8 L 9 4 L 15 15 L -7 19 Z" fill="#946323" stroke={INK} strokeWidth={2.2} />
          <path d="M -11 17 Q -15 28 -13 38" stroke="#C28833" strokeWidth={4.2} fill="none" strokeLinecap="round" />
          <path d="M -4 18 Q -4 30 0 40" stroke="#C28833" strokeWidth={4.2} fill="none" strokeLinecap="round" />
          <path d="M 4 17 Q 9 28 13 39" stroke="#C28833" strokeWidth={4.2} fill="none" strokeLinecap="round" />
          <path d="M 11 15 Q 19 25 24 36" stroke="#C28833" strokeWidth={3.8} fill="none" strokeLinecap="round" />
        </g>
      </g>

      {/* =================================================================== */}
      {/* 8. THREE JARS IN A SWIRLING GOLDEN LUMINOUS STREAM (CỤM BA LỌ KÝ ỨC) */}
      {/* =================================================================== */}
      {showJars ? (
        <g>
          {/* Swirling luminous golden energy ribbon connecting the 3 jars */}
          <path
            d="M 180 160 Q 280 180 340 190 Q 420 180 470 120"
            stroke="#FDE68A"
            strokeWidth={3}
            fill="none"
            opacity={0.8}
            style={{ mixBlendMode: 'screen' }}
          />
          <path
            d="M 160 170 Q 260 210 330 200 Q 410 200 480 130"
            stroke="#F59E0B"
            strokeWidth={1.8}
            strokeDasharray="8 5"
            fill="none"
            opacity={0.7}
          />

          {/* JAR 1: G1 (Car on Country Road) — Firmly held under Right Hand at x=198, y=175 */}
          <MemoryJar x={198} y={175} s={1.15} kind="g1" glow={1.35} t={t} showAura />

          {/* JAR 2: G2 (Two Intertwining Wisps) — Floating in center at x=340, y=190 */}
          {(() => {
            const bob2 = Math.sin(t * 0.08 + 1.5) * 8;
            return <MemoryJar x={340} y={190 + bob2} s={1.08} kind="g2" glow={1.25} t={t} showAura />;
          })()}

          {/* JAR 3: G3 (Crescent Moon & Sealed Door) — Floating at right at x=475, y=140 */}
          {(() => {
            const bob3 = Math.cos(t * 0.07 + 3.0) * 8;
            return <MemoryJar x={475} y={140 + bob3} s={1.0} kind="g3" glow={1.25} t={t} showAura />;
          })()}
        </g>
      ) : null}
    </g>
  );
};

// ============================================================================
// 3. REVERSE HOURGLASS (ĐỒNG HỒ CÁT NGƯỢC VỚI NGỌN LỬA MA THUẬT)
// ============================================================================

/**
 * ReverseHourglass: Grand antique hourglass from the reference artwork:
 * - Glowing sand particles defying gravity from bottom bulb to top bulb.
 * - Magical flame / ethereal wisp smoke emerging from the top finial.
 */
export const ReverseHourglass: React.FC<{
  x: number;
  y: number;
  s?: number;
  t?: number;
}> = ({ x, y, s = 1, t = 0 }) => {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* Base shadow */}
      <ellipse cx={0} cy={4} rx={28} ry={8} fill="#140B08" opacity={0.65} />

      {/* Ornate bottom wooden/stone base */}
      <rect x={-26} y={-6} width={52} height={8} rx={2} fill="#5C3B14" stroke={INK} strokeWidth={2.4} />
      <rect x={-22} y={-5} width={44} height={3} fill="#D97706" opacity={0.5} />

      {/* Brass turned support pillars */}
      <rect x={-24} y={-84} width={5} height={78} fill="#C28833" stroke={INK} strokeWidth={2} />
      <rect x={19} y={-84} width={5} height={78} fill="#C28833" stroke={INK} strokeWidth={2} />

      {/* Glass hourglass bulbs (Figure-8) */}
      <path
        d="M -18 -82 C -18 -56 -3 -45 0 -45 C 3 -45 18 -56 18 -82 Z M -18 -8 C -18 -34 -3 -45 0 -45 C 3 -45 18 -34 18 -8 Z"
        fill="#CFFAFE"
        opacity={0.28}
        stroke={INK}
        strokeWidth={2.4}
      />
      {/* Curved glass specular reflections */}
      <path d="M -14 -78 Q -16 -62 -4 -48" stroke="#FFFFFF" strokeWidth={1.8} fill="none" opacity={0.65} />
      <path d="M -14 -12 Q -16 -28 -4 -42" stroke="#FFFFFF" strokeWidth={1.8} fill="none" opacity={0.65} />

      {/* Top bulb: Accumulating glowing sand at top! */}
      <path d="M -16 -78 Q 0 -64 16 -78 Z" fill="#F59E0B" />
      <ellipse cx={0} cy={-76} rx={15} ry={4} fill="#FDE68A" />

      {/* Bottom bulb: Sand pool draining upwards */}
      <path d="M -16 -8 Q 0 -16 16 -8 Z" fill="#D97706" />

      {/* UPWARD GRAVITY-DEFYING SAND PARTICLES STREAM */}
      {Array.from({ length: 11 }).map((_, i) => {
        const cycle = ((t * 0.08 + i * 0.09) % 1);
        const sy = -14 - cycle * 58; // Streaming upwards from y=-14 to y=-72
        const sx = Math.sin(cycle * Math.PI * 4 + i) * (cycle > 0.4 && cycle < 0.6 ? 1 : 3);
        return <circle key={i} cx={sx} cy={sy} r={1.2} fill="#FEF08A" opacity={0.88} />;
      })}

      {/* Top Pedestal */}
      <rect x={-26} y={-92} width={52} height={8} rx={2} fill="#5C3B14" stroke={INK} strokeWidth={2.4} />
      <rect x={-22} y={-91} width={44} height={3} fill="#D97706" opacity={0.5} />

      {/* Magical Flame / Wisp rising from top finial (Ngọn lửa ma thuật bốc lên từ đỉnh) */}
      <g transform="translate(0 -92)">
        <ellipse cx={0} cy={-12} rx={14} ry={20} fill="#F59E0B" opacity={0.3} style={{ mixBlendMode: 'screen' }} />
        <path
          d={`M -6 0 Q ${-12 + Math.sin(t * 0.1) * 4} -16 0 -32 Q ${12 - Math.sin(t * 0.1) * 4} -16 6 0 Z`}
          fill="#FEF08A"
          opacity={0.85}
        />
        <path
          d={`M -3 0 Q ${-6 + Math.cos(t * 0.1) * 3} -12 0 -24 Q ${6 - Math.cos(t * 0.1) * 3} -12 3 0 Z`}
          fill="#FFFFFF"
          opacity={0.9}
        />
      </g>
    </g>
  );
};

// ============================================================================
// 4. TEMPORAL FISSURE (VẾT RÁCH THỜI GIAN TUA NGƯỢC)
// ============================================================================

/**
 * TemporalFissure: A terrifying, jagged spacetime tear cutting through reality:
 * - Jagged dark void rift crackling with reverse chronological energy.
 * - Reverse chronal lightning branching outward (#38BDF8, #FDE047, #C084FC).
 * - Floating fragmented clock dial shards reassembling into the rift.
 * - Inward-flowing luminous reverse dust and chronal wisps.
 */
export const TemporalFissure: React.FC<{
  x: number;
  y: number;
  s?: number;
  t?: number;
}> = ({ x, y, s = 1, t = 0 }) => {
  const crackWobble = Math.sin(t * 0.1) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <radialGradient id="fissureAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.65} />
          <stop offset="30%" stopColor="#818CF8" stopOpacity={0.38} />
          <stop offset="65%" stopColor="#4C1D95" stopOpacity={0.16} />
          <stop offset="100%" stopColor="#0B0314" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Atmospheric temporal distortion aura */}
      <ellipse cx={0} cy={0} rx={180} ry={420} fill="url(#fissureAura)" style={{ mixBlendMode: 'screen' }} />

      {/* Main jagged fissure void */}
      <path
        d={`M -8 -380 
           Q ${16 + crackWobble} -290 6 -220 
           Q ${-30 - crackWobble} -140 -8 -70 
           Q ${34 + crackWobble} 10 14 90 
           Q ${-36 - crackWobble} 180 -6 260 
           Q ${20 + crackWobble} 320 2 390 
           Q ${-14 - crackWobble} 340 -18 270 
           Q ${-44 + crackWobble} 190 -26 100 
           Q ${2 - crackWobble} 15 -34 -65 
           Q ${-52 + crackWobble} -150 -20 -230 
           Q 2 -300 -8 -380 Z`}
        fill="#05010B"
        stroke="#1E1B4B"
        strokeWidth={3.5}
      />

      {/* Interior cosmic rewind energy vortex */}
      <path
        d="M -2 -360 Q 18 -220 2 -60 Q -16 80 14 250 Q -4 310 0 370"
        stroke="#60A5FA"
        strokeWidth={4}
        fill="none"
        opacity={0.88}
        style={{ filter: 'drop-shadow(0 0 10px #38BDF8)' }}
      />
      <path
        d="M -4 -330 Q -24 -190 8 -40 Q 24 100 -8 270"
        stroke="#FDE047"
        strokeWidth={2.4}
        fill="none"
        opacity={0.92}
        style={{ filter: 'drop-shadow(0 0 7px #F59E0B)' }}
      />
      <path
        d="M 2 -310 Q 14 -145 -12 20 Q -22 170 8 320"
        stroke="#FFFFFF"
        strokeWidth={1.4}
        fill="none"
        opacity={0.96}
      />

      {/* Reverse temporal lightning bolts branching out */}
      {Array.from({ length: 7 }).map((_, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        const boltY = -260 + i * 85 + Math.sin(t * 0.15 + i) * 15;
        const boltX = side * (18 + Math.cos(t * 0.2 + i) * 10);
        const bx2 = side * (75 + (i * 13) % 45);
        const by2 = boltY + ((i * 23) % 40) - 20;
        const bx3 = side * (120 + (i * 17) % 35);
        const by3 = by2 + (side > 0 ? 25 : -25);
        return (
          <path
            key={`bolt_${i}`}
            d={`M ${boltX} ${boltY} L ${bx2} ${by2} L ${bx3} ${by3}`}
            stroke={i % 3 === 0 ? '#FEF08A' : i % 3 === 1 ? '#38BDF8' : '#C084FC'}
            strokeWidth={1.8}
            fill="none"
            opacity={0.75 + Math.sin(t * 0.25 + i * 2) * 0.25}
            strokeLinecap="round"
          />
        );
      })}

      {/* Floating fractured clock gears and shards reassembling into the rift */}
      {[-210, -110, 0, 110, 210].map((baseY, i) => {
        const shardT = ((t * 0.05 + i * 0.2) % 1);
        const sx = (i % 2 === 0 ? 1 : -1) * (150 - shardT * 120);
        const sy = baseY + Math.sin(t * 0.08 + i) * 22;
        const rot = t * (i % 2 === 0 ? 2 : -2) + i * 45;
        return (
          <g key={`shard_${i}`} transform={`translate(${sx} ${sy}) rotate(${rot}) scale(${0.55 + (i % 3) * 0.2})`}>
            <path d="M -16 -12 L 18 -8 L 10 16 L -14 12 Z" fill="#D4A24C" stroke="#78350F" strokeWidth={1.5} opacity={0.88} />
            <line x1={-8} y1={-4} x2={4} y2={6} stroke="#3E2718" strokeWidth={2} />
            <circle cx={0} cy={0} r={2} fill="#FEF08A" />
          </g>
        );
      })}

      {/* Inward flowing reverse chronal motes */}
      {Array.from({ length: 16 }).map((_, i) => {
        const moteProg = ((t * 0.04 + i * 0.065) % 1);
        const mx = (Math.cos(i * 1.3) * 135) * (1 - moteProg);
        const my = -340 + i * 45 + Math.sin(t * 0.06 + i) * 15;
        return (
          <circle
            key={`mote_${i}`}
            cx={mx}
            cy={my}
            r={1.2 + (i % 3) * 0.7}
            fill={i % 2 === 0 ? '#38BDF8' : '#FDE047'}
            opacity={0.9 - moteProg * 0.5}
          />
        );
      })}
    </g>
  );
};

// ============================================================================
// 5. ASTROLOGICAL FLOOR (SÀN ĐÁ ĐỒ HÌNH THIÊN VĂN MA MỊ)
// ============================================================================

/**
 * AstrologicalFloor: Massive circular stone pavement with 12 Roman numerals,
 * concentric compass rings, subterranean cracked fissures leaking ethereal light,
 * and creeping ground mist creating an oppressive, cavernous scale.
 */
export const AstrologicalFloor: React.FC<{
  x: number;
  y: number;
  s?: number;
  t?: number;
}> = ({ x, y, s = 1, t = 0 }) => {
  const ringRot = t * 0.15;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* Deep stone ground ellipse */}
      <ellipse cx={0} cy={0} rx={950} ry={260} fill="#120A1C" stroke="#2E1C44" strokeWidth={3} />
      <ellipse cx={0} cy={0} rx={840} ry={230} fill="#180F26" stroke="#4C1D95" strokeWidth={2} strokeDasharray="16 10" />

      {/* Subterranean glowing cracks leaking cyan & amber light */}
      <path
        d="M -720 20 Q -480 90 -220 40 Q 0 80 180 30 Q 520 90 760 -10"
        stroke="#06B6D4"
        strokeWidth={3.2}
        fill="none"
        opacity={0.7}
        style={{ filter: 'drop-shadow(0 0 7px #22D3EE)' }}
      />
      <path
        d="M -420 -80 Q -260 20 -110 -30 Q 80 -60 310 -20 Q 560 -70 690 -50"
        stroke="#F59E0B"
        strokeWidth={2.6}
        fill="none"
        opacity={0.65}
        style={{ filter: 'drop-shadow(0 0 6px #FBBF24)' }}
      />
      <path
        d="M -140 140 Q 0 160 140 140 M -60 -150 Q 0 -170 60 -150"
        stroke="#818CF8"
        strokeWidth={2}
        fill="none"
        opacity={0.5}
      />

      {/* Radial stone joints radiating from center */}
      {Array.from({ length: 16 }).map((_, i) => {
        const ang = (i * 22.5 * Math.PI) / 180;
        const x1 = Math.cos(ang) * 260;
        const y1 = Math.sin(ang) * 75;
        const x2 = Math.cos(ang) * 820;
        const y2 = Math.sin(ang) * 225;
        return (
          <line
            key={`flag_${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#2B1A3F"
            strokeWidth={2}
            opacity={0.7}
          />
        );
      })}

      {/* Outer concentric astrological stone ring */}
      <ellipse cx={0} cy={0} rx={680} ry={185} fill="none" stroke="#D4A24C" strokeWidth={3} opacity={0.65} />
      <ellipse cx={0} cy={0} rx={640} ry={174} fill="none" stroke="#92400E" strokeWidth={1.5} strokeDasharray="8 6" opacity={0.75} />

      {/* 12 Carved Roman numerals along the astrological stone oval */}
      {['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].map((num, i) => {
        const ang = ((i * 30 - 90) * Math.PI) / 180;
        const nx = Math.cos(ang) * 660;
        const ny = Math.sin(ang) * 180;
        return (
          <text
            key={`floor_num_${i}`}
            x={nx}
            y={ny + 5}
            fill="#FEF08A"
            fontFamily="Cinzel, Georgia, serif"
            fontWeight="bold"
            fontSize={17}
            textAnchor="middle"
            opacity={0.85}
            style={{ filter: 'drop-shadow(0 0 5px #D97706)' }}
          >
            {num}
          </text>
        );
      })}

      {/* Inner Rotating Astrological Compass & Runes */}
      <g transform={`rotate(${ringRot}) scale(1 0.28)`}>
        <circle cx={0} cy={0} r={460} fill="none" stroke="#6D28D9" strokeWidth={2.5} strokeDasharray="14 10" />
        <circle cx={0} cy={0} r={360} fill="none" stroke="#F59E0B" strokeWidth={2} opacity={0.7} />
        {/* 8-pointed star compass */}
        {Array.from({ length: 8 }).map((_, i) => {
          const sang = (i * 45 * Math.PI) / 180;
          return (
            <line
              key={`star_${i}`}
              x1={0}
              y1={0}
              x2={Math.cos(sang) * 360}
              y2={Math.sin(sang) * 360}
              stroke="#D4A24C"
              strokeWidth={i % 2 === 0 ? 2.5 : 1.2}
              opacity={0.6}
            />
          );
        })}
      </g>

      {/* Creeping ground fog & ominous purple-black mist */}
      <ellipse cx={-180} cy={70} rx={340} ry={35} fill="#4C1D95" opacity={0.25} style={{ filter: 'blur(12px)' }} />
      <ellipse cx={220} cy={90} rx={380} ry={40} fill="#312E81" opacity={0.22} style={{ filter: 'blur(14px)' }} />
      <ellipse cx={0} cy={120} rx={500} ry={45} fill="#0F051D" opacity={0.45} />
    </g>
  );
};

// ============================================================================
// 6. TIME CHAINS (XÍCH SẮT TREO KHỔNG LỒ)
// ============================================================================

/**
 * TimeChains: Colossal iron chains hanging from the unseen vaulted cathedral ceiling,
 * supporting massive pendulum bobs and gear counterweights.
 */
export const TimeChains: React.FC<{
  x: number;
  y: number;
  length?: number;
  t?: number;
  swayAmp?: number;
  showBob?: boolean;
}> = ({ x, y, length = 560, t = 0, swayAmp = 2, showBob = true }) => {
  const sway = Math.sin(t * 0.04 + x * 0.01) * swayAmp;
  const numLinks = Math.floor(length / 26);
  return (
    <g transform={`translate(${x} ${y}) rotate(${sway})`}>
      {Array.from({ length: numLinks }).map((_, i) => {
        const ly = i * 24;
        const isAlternate = i % 2 === 1;
        return isAlternate ? (
          <ellipse
            key={`link_${i}`}
            cx={0}
            cy={ly}
            rx={8}
            ry={15}
            fill="#1E1428"
            stroke="#64748B"
            strokeWidth={3}
          />
        ) : (
          <rect
            key={`link_${i}`}
            x={-5}
            y={ly - 10}
            width={10}
            height={20}
            rx={4}
            fill="#0F0A17"
            stroke="#475569"
            strokeWidth={2.5}
          />
        );
      })}

      {showBob ? (
        <g transform={`translate(0 ${length})`}>
          <circle cx={0} cy={22} r={32} fill="#3E2718" stroke={INK} strokeWidth={4} />
          <circle cx={0} cy={22} r={24} fill="#8A5A20" stroke="#D4A24C" strokeWidth={2.4} />
          <circle cx={0} cy={22} r={10} fill="#FEF08A" opacity={0.7} />
          <polygon points="-8,52 8,52 0,74" fill="#5C3B14" stroke={INK} strokeWidth={2.2} />
        </g>
      ) : null}
    </g>
  );
};

// ============================================================================
// 7. TIME VAULT SCENE (CẢNH 9: ĐIỆN THỜ THỜI GIAN BỊ ĐÁNH CẮP — CATHEDRAL OF STOLEN TIME)
// ============================================================================

/**
 * TimeVaultScene: The grand oppressive cathedral of stolen time:
 * - Gothic vaulted space with deep perspective converging toward infinity.
 * - Central massive TemporalFissure (vết rách thời gian) crackling with reverse energy.
 * - Reverse wall clockwork etched in stone.
 * - Dual Colonnades of Apothecary Shelves (hàng cột kệ hai bên):
 *   * Left Colonnade: Other people's memories (cradle, kite, violin, + dormant jars).
 *   * Right Colonnade: Other people's memories (ship, umbrella, letter, + dormant jars).
 * - Suspended colossal iron TimeChains dangling from ceiling darkness.
 * - Detailed AstrologicalFloor with 12 Roman numerals, subterranean glowing cracks, and mist.
 * - Central plinth holding the ReverseHourglass with defying-gravity sand & ethereal flame.
 * - Central stage: The hovering ClockCreature commanding the space with G1, G2, G3 jars.
 */
export const TimeVaultScene: React.FC<{
  t?: number;
  showJars?: boolean;
}> = ({ t = 0, showJars = true }) => {
  const id = `vault-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <g>
      <defs>
        {/* Oppressive cathedral sepia-violet gradient */}
        <linearGradient id={`${id}Bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#13091F" />
          <stop offset="45%" stopColor="#251433" />
          <stop offset="75%" stopColor="#1C0E28" />
          <stop offset="100%" stopColor="#0B0514" />
        </linearGradient>

        <radialGradient id={`${id}CenterGlow`} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.25} />
          <stop offset="45%" stopColor="#818CF8" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#0B0514" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Atmospheric background */}
      <rect x={-400} y={-300} width={2720} height={1680} fill={`url(#${id}Bg)`} />
      <ellipse cx={960} cy={420} rx={850} ry={520} fill={`url(#${id}CenterGlow)`} pointerEvents="none" />

      {/* =================================================================== */}
      {/* 1. REAR ARCHITECTURE: REVERSE CLOCKWORK & TEMPORAL FISSURE         */}
      {/* =================================================================== */}
      {/* Reverse Clockwork on rear wall */}
      <ReverseClockwork x={960} y={320} s={1.35} t={t} opacity={0.45} />

      {/* Colossal Central Temporal Fissure (Vết rách thời gian tua ngược) */}
      <TemporalFissure x={960} y={340} s={1.12} t={t} />

      {/* Gothic stone pointed arch frame in deep background */}
      <path
        d="M 680 620 L 680 280 C 680 120 960 40 960 40 C 960 40 1240 120 1240 280 L 1240 620 Z"
        fill="none"
        stroke="#3B2252"
        strokeWidth={14}
        opacity={0.65}
      />
      <path
        d="M 700 620 L 700 290 C 700 140 960 70 960 70 C 960 70 1220 140 1220 290 L 1220 620 Z"
        fill="none"
        stroke="#5B3878"
        strokeWidth={4}
        opacity={0.7}
      />

      {/* =================================================================== */}
      {/* 2. DUAL COLONNADES OF MEMORY JARS (HÀNG KỆ HAI BÊN CỦA NHIỀU NGƯỜI) */}
      {/* =================================================================== */}

      {/* --- LEFT COLONNADE --- */}
      <g>
        {/* Tier 1 (High, background): y ≈ 250 */}
        <polygon points="120,280 620,290 600,320 100,310" fill="#241433" stroke="#4C1D95" strokeWidth={2} />
        {[180, 270, 360, 450, 540].map((jx, i) => (
          <g key={`l_t1_${i}`} transform={`translate(${jx} 260) scale(0.46)`}>
            <MemoryJar x={0} y={0} kind="dormant" glow={0.6} t={t + i * 5} showAura={false} />
          </g>
        ))}

        {/* Tier 2 (Middle - Key other memories): y ≈ 420 */}
        <polygon points="40,430 640,450 620,490 20,470" fill="#2E1B40" stroke="#6D28D9" strokeWidth={3} />
        {/* Memory: Cradle (Nôi em bé) */}
        <g transform="translate(140 405) scale(0.85)">
          <MemoryJar x={0} y={0} kind="cradle" glow={1.15} t={t} showAura />
        </g>
        {/* Memory: Kite (Cánh diều đỏ) */}
        <g transform="translate(320 420) scale(0.88)">
          <MemoryJar x={0} y={0} kind="kite" glow={1.2} t={t + 4} showAura />
        </g>
        {/* Memory: Violin (Vĩ cầm dang dở) */}
        <g transform="translate(500 435) scale(0.92)">
          <MemoryJar x={0} y={0} kind="violin" glow={1.18} t={t + 8} showAura />
        </g>

        {/* Tier 3 (Foreground shelf): y ≈ 620 */}
        <polygon points="-40,620 660,650 640,710 -60,680" fill="#3B2252" stroke="#8B5CF6" strokeWidth={4} />
        {[60, 200, 360, 520].map((jx, i) => (
          <g key={`l_t3_${i}`} transform={`translate(${jx} 580) scale(0.82)`}>
            <MemoryJar x={0} y={0} kind="dormant" glow={0.8} t={t + i * 7} showAura={false} />
          </g>
        ))}

        {/* Carved stone pillars on left */}
        <rect x={60} y={120} width={28} height={600} fill="#1E102B" stroke="#4C1D95" strokeWidth={2.4} />
        <rect x={440} y={160} width={24} height={520} fill="#1E102B" stroke="#4C1D95" strokeWidth={2} />
      </g>

      {/* --- RIGHT COLONNADE --- */}
      <g>
        {/* Tier 1 (High, background): y ≈ 250 */}
        <polygon points="1300,290 1800,280 1820,310 1320,320" fill="#241433" stroke="#4C1D95" strokeWidth={2} />
        {[1380, 1470, 1560, 1650, 1740].map((jx, i) => (
          <g key={`r_t1_${i}`} transform={`translate(${jx} 260) scale(0.46)`}>
            <MemoryJar x={0} y={0} kind="dormant" glow={0.6} t={t + i * 5} showAura={false} />
          </g>
        ))}

        {/* Tier 2 (Middle - Key other memories): y ≈ 420 */}
        <polygon points="1280,450 1880,430 1900,470 1300,490" fill="#2E1B40" stroke="#6D28D9" strokeWidth={3} />
        {/* Memory: Ship (Thuyền viễn dương) */}
        <g transform="translate(1420 435) scale(0.92)">
          <MemoryJar x={0} y={0} kind="ship" glow={1.22} t={t + 2} showAura />
        </g>
        {/* Memory: Umbrella (Chiếc ô trong mưa) */}
        <g transform="translate(1600 420) scale(0.88)">
          <MemoryJar x={0} y={0} kind="umbrella" glow={1.15} t={t + 6} showAura />
        </g>
        {/* Memory: Letter (Bức thư tình niêm sáp) */}
        <g transform="translate(1780 405) scale(0.85)">
          <MemoryJar x={0} y={0} kind="letter" glow={1.2} t={t + 10} showAura />
        </g>

        {/* Tier 3 (Foreground shelf): y ≈ 620 */}
        <polygon points="1260,650 1960,620 1980,680 1280,710" fill="#3B2252" stroke="#8B5CF6" strokeWidth={4} />
        {[1400, 1560, 1720, 1860].map((jx, i) => (
          <g key={`r_t3_${i}`} transform={`translate(${jx} 580) scale(0.82)`}>
            <MemoryJar x={0} y={0} kind="dormant" glow={0.8} t={t + i * 7} showAura={false} />
          </g>
        ))}

        {/* Carved stone pillars on right */}
        <rect x={1456} y={160} width={24} height={520} fill="#1E102B" stroke="#4C1D95" strokeWidth={2} />
        <rect x={1832} y={120} width={28} height={600} fill="#1E102B" stroke="#4C1D95" strokeWidth={2.4} />
      </g>

      {/* =================================================================== */}
      {/* 3. SUSPENDED COLOSSAL TIME CHAINS FROM CEILING                     */}
      {/* =================================================================== */}
      <TimeChains x={280} y={-40} length={540} t={t} swayAmp={1.8} showBob />
      <TimeChains x={640} y={-60} length={460} t={t + 5} swayAmp={1.4} showBob />
      <TimeChains x={1280} y={-60} length={460} t={t + 10} swayAmp={1.4} showBob />
      <TimeChains x={1640} y={-40} length={540} t={t + 15} swayAmp={1.8} showBob />

      {/* =================================================================== */}
      {/* 4. THE ASTROLOGICAL FLOOR (SÀN ĐÁ THIÊN VĂN MA MỊ)                  */}
      {/* =================================================================== */}
      <AstrologicalFloor x={960} y={880} s={1.08} t={t} />

      {/* =================================================================== */}
      {/* 5. CENTER PLINTH WITH REVERSE HOURGLASS                            */}
      {/* =================================================================== */}
      <g transform="translate(960 760)">
        {/* Ornate hexagonal altar plinth */}
        <polygon points="-75,40 75,40 95,120 -95,120" fill="#241433" stroke="#D4A24C" strokeWidth={2.5} />
        <rect x={-65} y={-10} width={130} height={50} rx={4} fill="#190D24" stroke="#8A5A20" strokeWidth={2.2} />
        <ReverseHourglass x={0} y={-10} s={1.25} t={t} />
      </g>

      {/* =================================================================== */}
      {/* 6. CENTER OVERLORD: CLOCK CREATURE HOVERING WITH 3 ACTIVE JARS     */}
      {/* =================================================================== */}
      <ClockCreature
        x={910}
        y={460}
        s={1.14}
        t={t}
        hover
        eyeGazeX={0.2}
        eyeGazeY={0.1}
        smirk={1}
        showJars={showJars}
      />

      {/* =================================================================== */}
      {/* 7. REVERSE CHRONAL MOTE PARTICLES FLOATING UPWARD                  */}
      {/* =================================================================== */}
      {Array.from({ length: 36 }).map((_, i) => {
        const speed = 0.04 + (i % 4) * 0.015;
        const py = 1050 - (((t * speed * 60 + i * 32) % 980));
        const px = 180 + ((i * 57) % 1560) + Math.sin(t * 0.04 + i) * 18;
        return (
          <circle
            key={`cp_${i}`}
            cx={px}
            cy={py}
            r={1.1 + (i % 3) * 0.8}
            fill={i % 3 === 0 ? '#FDE68A' : i % 3 === 1 ? '#38BDF8' : '#E9D5FF'}
            opacity={0.6 + Math.sin(t * 0.1 + i) * 0.3}
          />
        );
      })}
    </g>
  );
};

// ============================================================================
// 5. C8-E: NGÕ CỤT KHI TIỆM ÔNG LỘC BIẾN MẤT (ALLEY WITHOUT SHOP)
// ============================================================================

export const AlleyWithoutShop: React.FC<{
  t?: number;
  showOwl?: boolean;
}> = ({ t = 0, showOwl = true }) => {
  return (
    <g>
      {/* Nocturnal deep blue sky */}
      <rect x={-300} y={-200} width={2600} height={1700} fill="#080E1C" />

      {/* Streetlight cone casting eerie cold illumination */}
      <polygon points="1060,180 340,1050 1520,1050" fill="#38BDF8" opacity={0.12} />
      <polygon points="1060,180 580,1020 1280,1020" fill="#E0F2FE" opacity={0.08} />

      {/* Alley wet stone ground with perspective */}
      <polygon points="480,680 1140,680 2150,1400 -120,1400" fill="#111827" stroke={INK} strokeWidth={4} />
      {/* Wet pavement specular puddle reflections */}
      <ellipse cx={880} cy={820} rx={160} ry={22} fill="#1E293B" opacity={0.7} />
      <ellipse cx={880} cy={820} rx={110} ry={12} fill="#38BDF8" opacity={0.15} />
      <ellipse cx={680} cy={890} rx={210} ry={28} fill="#1E293B" opacity={0.65} />
      <ellipse cx={680} cy={890} rx={140} ry={15} fill="#38BDF8" opacity={0.12} />

      {/* Left Wall: Old tall colonial townhouse wall */}
      <polygon points="-80,-40 480,580 480,880 -80,1100" fill="#1E293B" stroke={INK} strokeWidth={4} />
      {/* Brick texture lines on left wall */}
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={`l_brick_${i}`}
          x1={20 + i * 45}
          y1={320 + i * 35}
          x2={80 + i * 45}
          y2={390 + i * 35}
          stroke="#0F172A"
          strokeWidth={2}
          opacity={0.6}
        />
      ))}
      {/* Left wall shuttered window with sliver of cold light */}
      <rect x={180} y={420} width={70} height={110} rx={2} fill="#0F172A" stroke="#334155" strokeWidth={2.4} />
      <rect x={190} y={430} width={50} height={90} fill="#1E293B" />
      <line x1={215} y1={430} x2={215} y2={520} stroke="#334155" strokeWidth={2} />

      {/* Right Wall: WHERE THE SHOP FORMERLY WAS — NOW A BLANK DEAD-END WALL! */}
      <polygon points="1140,580 2000,-40 2000,1100 1140,880" fill="#1A2234" stroke={INK} strokeWidth={4} />
      {/* Mossy damp blank wall patch where the shop door was */}
      <rect x={1220} y={440} width={420} height={320} rx={4} fill="#151D2A" stroke="#253245" strokeWidth={2.5} />
      {/* Peeling plaster and dark rectangular stain where the shop sign used to hang */}
      <rect x={1280} y={460} width={280} height={70} fill="#0E141F" stroke="#1E293B" strokeWidth={1.5} opacity={0.8} />
      <text x={1420} y={502} fill="#334155" fontFamily="sans-serif" fontSize={11} letterSpacing={2} textAnchor="middle" opacity={0.5}>
        (VẾT TÍCH BIỂN TIỆM BIẾN MẤT)
      </text>
      {/* Green moss patches climbing up the dead-end wall */}
      <path d="M 1220 740 Q 1260 690 1280 730 Q 1310 680 1350 740" fill="#143026" stroke="#064E3B" strokeWidth={2} />
      <path d="M 1480 740 Q 1520 670 1560 720 Q 1600 660 1640 740" fill="#143026" stroke="#064E3B" strokeWidth={2} />

      {/* Dead-end alley iron lamp bracket */}
      <path d="M 1040 180 L 1080 180 L 1080 220" stroke="#0F172A" strokeWidth={6} fill="none" />
      <circle cx={1060} cy={185} r={14} fill="#FDE047" opacity={0.9} style={{ filter: 'drop-shadow(0 0 16px #38BDF8)' }} />
      <polygon points="1040,170 1080,170 1060,150" fill="#1E293B" stroke={INK} strokeWidth={2} />

      {/* Overhead tangled electrical wires crossing the alley */}
      <path d="M -60 120 Q 520 280 1060 210 Q 1540 180 2000 130" stroke="#090D16" strokeWidth={4.5} fill="none" />
      <path d="M -60 170 Q 640 340 1180 240 Q 1620 220 2000 180" stroke="#060911" strokeWidth={3.2} fill="none" />
      <path d="M 220 180 Q 720 380 1340 260" stroke="#060911" strokeWidth={2.4} fill="none" />

      {/* Eave on top left & Perched Owl silently watching */}
      <polygon points="-80,-20 460,80 420,150 -80,60" fill="#182232" stroke={INK} strokeWidth={4} />
      {showOwl ? (
        <g transform="translate(340 170)">
          {/* Owl cast shadow */}
          <ellipse cx={0} cy={38} rx={18} ry={6} fill="#090D16" opacity={0.7} />
          {/* Owl body & folded wings */}
          <ellipse cx={0} cy={12} rx={16} ry={24} fill="#1E293B" stroke={INK} strokeWidth={2.5} />
          <path d="M -15 6 Q -18 24 -10 32" stroke="#334155" strokeWidth={2.5} fill="none" />
          <path d="M 15 6 Q 18 24 10 32" stroke="#334155" strokeWidth={2.5} fill="none" />
          {/* Head & Ear tufts */}
          <circle cx={0} cy={-12} r={16} fill="#1E293B" stroke={INK} strokeWidth={2.5} />
          <polygon points="-12,-22 -8,-32 -2,-24" fill="#1E293B" stroke={INK} strokeWidth={1.8} />
          <polygon points="12,-22 8,-32 2,-24" fill="#1E293B" stroke={INK} strokeWidth={1.8} />
          {/* Glowing yellow owl eyes */}
          <circle cx={-6} cy={-12} r={5} fill="#FEF08A" stroke="#713F12" strokeWidth={1.2} />
          <circle cx={-6} cy={-12} r={2.5} fill="#0F172A" />
          <circle cx={6} cy={-12} r={5} fill="#FEF08A" stroke="#713F12" strokeWidth={1.2} />
          <circle cx={6} cy={-12} r={2.5} fill="#0F172A" />
          {/* Hooked beak */}
          <polygon points="-2,-8 2,-8 0,-2" fill="#D97706" />
        </g>
      ) : null}
    </g>
  );
};

// ============================================================================
// 6. CAMEO ASSETS GIEO TRONG TIỆM
// ============================================================================

export const AntiquePortraitCameo: React.FC<{
  x: number;
  y: number;
  s?: number;
}> = ({ x, y, s = 1 }) => {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-36} y={-48} width={72} height={96} rx={3} fill="#543A24" stroke={INK} strokeWidth={3} />
      <rect x={-31} y={-43} width={62} height={86} fill="#2A1B13" stroke="#854D0E" strokeWidth={1.5} />
      <rect x={-27} y={-39} width={54} height={78} fill="#211714" />
      <circle cx={0} cy={-2} r={22} fill="#35241C" stroke="#4A3427" strokeWidth={1.2} />
      {/* 3 faint eyes */}
      <ellipse cx={0} cy={-9} rx={4.5} ry={2.5} fill="#D97706" opacity={0.35} />
      <ellipse cx={-8} cy={4} rx={3.8} ry={2.2} fill="#D97706" opacity={0.35} />
      <ellipse cx={8} cy={4} rx={3.8} ry={2.2} fill="#D97706" opacity={0.35} />
      <line x1={0} y1={-2} x2={0} y2={-16} stroke="#6B4B38" strokeWidth={1.2} />
      <line x1={0} y1={-2} x2={9} y2={2} stroke="#6B4B38" strokeWidth={1.2} />
      <path d="M -27 25 L 12 -39 L 27 -39 L -27 35 Z" fill="#FFFFFF" opacity={0.06} />
    </g>
  );
};

export const CameoJars: React.FC<{
  x: number;
  y: number;
  s?: number;
  t?: number;
}> = ({ x, y, s = 1, t = 0 }) => {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <MemoryJar x={-22} y={0} s={0.7} kind="dormant" glow={0.5} t={t} showAura={false} />
      <MemoryJar x={22} y={0} s={0.75} kind="dormant" glow={0.4} t={t + 4} showAura={false} />
    </g>
  );
};

export const ReverseClockwork: React.FC<{
  x: number;
  y: number;
  s?: number;
  t?: number;
  opacity?: number;
}> = ({ x, y, s = 1, t = 0, opacity = 0.35 }) => {
  const revAngle = -(t * 0.6);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <circle cx={0} cy={0} r={280} fill="none" stroke="#D4A24C" strokeWidth={3} strokeDasharray="14 8" />
      <circle cx={0} cy={0} r={265} fill="none" stroke="#B45309" strokeWidth={1.5} />
      <circle cx={0} cy={0} r={210} fill="none" stroke="#D4A24C" strokeWidth={2} />
      <g transform={`rotate(${revAngle * 2.4})`}>
        <path d="M 0 16 L -5 0 L 0 -220 L 5 0 Z" fill="#D97706" stroke="#451A03" strokeWidth={2} />
      </g>
      <circle cx={0} cy={0} r={18} fill="#D97706" stroke={INK} strokeWidth={3} />
    </g>
  );
};
