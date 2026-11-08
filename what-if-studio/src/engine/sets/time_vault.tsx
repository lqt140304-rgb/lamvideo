import React, { useId } from 'react';

const INK = '#1B1412';

// ============================================================================
// 1. MEMORY JARS (BA LỌ KÝ ỨC VÀ GIAO KÈO ĐẶC TẢ THEO CONCEPT)
// ============================================================================

export type MemoryJarKind = 'g1' | 'g2' | 'g3' | 'dormant';

/**
 * MemoryJar: Glass preservation canister with ornate stopper, tied twine ribbon,
 * and glowing ethereal internal essence matching the concept artwork:
 * - G1: Glowing golden sedan car driving on a sunset country road.
 * - G2: Two intertwining wisps of light (purple/violet & golden-amber) merging into one.
 * - G3: Golden crescent moon in soft clouds beside a sealed miniature double door.
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
      : '#38BDF8';

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* Ground contact shadow */}
      <ellipse cx={0} cy={66} rx={32} ry={9} fill="#140B08" opacity={0.55} />

      {/* Golden swirling light aura ribbons around jar */}
      {showAura ? (
        <g opacity={0.75 * jarGlow} style={{ mixBlendMode: 'screen' }}>
          <ellipse cx={0} cy={12} rx={52} ry={66} fill={mainColor} opacity={0.16} />
          <path
            d={`M -42 45 Q ${-55 + Math.sin(t * 0.1) * 8} 0 0 -55 Q ${45 + Math.cos(t * 0.1) * 8} -30 42 35`}
            stroke="#FDE68A"
            strokeWidth={1.8}
            fill="none"
            opacity={0.8}
          />
          <path
            d={`M -30 -30 Q ${35 + Math.cos(t * 0.08) * 8} -50 45 10 Q 30 65 -25 55`}
            stroke="#F59E0B"
            strokeWidth={1.2}
            strokeDasharray="6 4"
            fill="none"
            opacity={0.7}
          />
        </g>
      ) : null}

      {/* Internal Essence Glow Halo */}
      <ellipse cx={0} cy={14} rx={34} ry={46} fill={mainColor} opacity={0.25 * jarGlow} />

      {/* =================================================================== */}
      {/* INTERNAL CONTENT PER CONTRACT (NỘI DUNG HUYỀN ẢO BÊN TRONG LỌ)       */}
      {/* =================================================================== */}
      {kind === 'g1' ? (
        // G1: Glowing golden sedan car driving on sunset road with telegraph poles & trees
        <g transform="translate(0 14)">
          {/* Distant sunset horizon silhouette */}
          <path d="M -26 15 Q -10 5 0 10 Q 15 15 26 8 L 26 38 L -26 38 Z" fill="#78350F" opacity={0.35} />
          {/* Curved road */}
          <path d="M -24 38 Q -6 20 18 14" stroke="#D97706" strokeWidth={3} fill="none" opacity={0.7} />
          {/* Miniature telegraph pole */}
          <line x1={-18} y1={28} x2={-18} y2={2} stroke="#B45309" strokeWidth={1} />
          <line x1={-21} y1={6} x2={-15} y2={6} stroke="#B45309" strokeWidth={1} />
          {/* Glowing Golden Sedan Car (Chiếc xe ô tô sedan phát sáng) */}
          <g transform={`translate(${Math.sin(t * 0.04) * 2} 18)`}>
            {/* Car body */}
            <path
              d="M -16 6 L -15 2 L -10 -4 L 8 -4 L 14 2 L 17 6 Z"
              fill="#F59E0B"
              stroke="#FEF08A"
              strokeWidth={1.2}
            />
            {/* Windows */}
            <polygon points="-9,-3 7,-3 5,1 -8,1" fill="#FEF9C3" opacity={0.9} />
            {/* Wheels */}
            <circle cx={-10} cy={7} r={3} fill="#1E140A" stroke="#FDE68A" strokeWidth={0.8} />
            <circle cx={11} cy={7} r={3} fill="#1E140A" stroke="#FDE68A" strokeWidth={0.8} />
            {/* Headlight beam */}
            <polygon points="17,3 27,0 27,8 17,6" fill="#FEF08A" opacity={0.5} />
          </g>
          {/* Floating light motes */}
          {[0, 1, 2, 3].map((i) => (
            <circle
              key={i}
              cx={-14 + ((i * 11) % 28)}
              cy={-18 + Math.sin(t * 0.1 + i) * 6}
              r={1.2}
              fill="#FEF08A"
              opacity={0.8}
            />
          ))}
        </g>
      ) : kind === 'g2' ? (
        // G2: Two intertwining wisps (violet sorrow & amber warmth) merging spiraling upward
        <g transform="translate(0 14)">
          {/* Violet wisp (Thảo's sorrow) */}
          <path
            d={`M -14 24 C -22 6 -6 -4 ${Math.sin(t * 0.1) * 4} -22`}
            stroke="#C084FC"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            opacity={0.85}
          />
          <path
            d={`M -12 22 C -18 8 -4 0 ${Math.sin(t * 0.1) * 3} -18`}
            stroke="#E9D5FF"
            strokeWidth={1.4}
            fill="none"
            strokeLinecap="round"
          />
          {/* Warm Amber wisp (Duy's enduring warmth) */}
          <path
            d={`M 14 24 C 22 6 6 -4 ${-Math.sin(t * 0.1) * 4} -22`}
            stroke="#F59E0B"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            opacity={0.85}
          />
          <path
            d={`M 12 22 C 18 8 4 0 ${-Math.sin(t * 0.1) * 3} -18`}
            stroke="#FEF08A"
            strokeWidth={1.4}
            fill="none"
            strokeLinecap="round"
          />
          {/* United spiral apex glowing bright */}
          <circle cx={0} cy={-22} r={4.5} fill="#FAF5FF" stroke="#FDE047" strokeWidth={1.5} />
          {/* Sparkles around intertwining wisps */}
          {[0, 1, 2, 3, 4].map((i) => {
            const ang = i * 1.3 + t * 0.08;
            return (
              <circle
                key={i}
                cx={Math.cos(ang) * 12}
                cy={Math.sin(ang) * 16}
                r={1.2}
                fill={i % 2 ? '#FEF08A' : '#E9D5FF'}
                opacity={0.85}
              />
            );
          })}
        </g>
      ) : kind === 'g3' ? (
        // G3: Luminous crescent moon floating in dream clouds beside a sealed miniature double door
        <g transform="translate(0 14)">
          {/* Soft dream clouds */}
          <ellipse cx={-10} cy={16} rx={16} ry={9} fill="#E0E7FF" opacity={0.4} />
          <ellipse cx={12} cy={18} rx={18} ry={10} fill="#E0E7FF" opacity={0.35} />
          <ellipse cx={0} cy={22} rx={22} ry={10} fill="#C7D2FE" opacity={0.45} />
          {/* Golden Crescent Moon */}
          <path
            d="M -12 -12 C -6 -28 10 -22 14 -10 C 6 -14 0 -12 -4 -4 C -8 4 -6 10 -2 14 C -12 10 -16 2 -12 -12 Z"
            fill="#FDE047"
            stroke="#CA8A04"
            strokeWidth={1}
            opacity={0.92}
          />
          {/* Miniature Sealed Double Door */}
          <g transform="translate(8 0)">
            <rect x={-8} y={-16} width={16} height={28} rx={2} fill="#7C2D12" stroke="#FACC15" strokeWidth={1.2} />
            <line x1={0} y1={-16} x2={0} y2={12} stroke="#FACC15" strokeWidth={1} />
            {/* Two tiny glowing keyholes/handles */}
            <circle cx={-3} cy={-2} r={1.2} fill="#FEF08A" />
            <circle cx={3} cy={-2} r={1.2} fill="#FEF08A" />
            {/* Arched transom header */}
            <path d="M -8 -16 Q 0 -22 8 -16" stroke="#FACC15" strokeWidth={1.2} fill="none" />
          </g>
          {/* Night stars */}
          <circle cx={-18} cy={-18} r={1.2} fill="#FFFFFF" />
          <circle cx={-2} cy={-24} r={1} fill="#FEF08A" />
          <circle cx={18} cy={-18} r={1.2} fill="#FFFFFF" />
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
  const floatY = hover ? Math.sin(t * 0.05) * 11 : 0;
  const floatRot = hover ? Math.sin(t * 0.04) * 2 : 0;
  const fingerTwitch = Math.sin(t * 0.09) * 2;
  const gearSpin = t * 1.5;

  return (
    <g transform={`translate(${x} ${y + floatY}) rotate(${floatRot}) scale(${s})`}>
      {/* =================================================================== */}
      {/* GROUND CAST SHADOW (BÓNG ĐỔ RỜI PHÍA DƯỚI THỂ HIỆN DÁNG LƠ LỬNG)     */}
      {/* =================================================================== */}
      <ellipse
        cx={-20}
        cy={290 - floatY * 0.4}
        rx={125 + floatY * 0.6}
        ry={26 - floatY * 0.2}
        fill="#120B09"
        opacity={0.65}
      />

      {/* =================================================================== */}
      {/* 1. REAR CYLINDRICAL HOUSING & DEPTH (THÂN TRÒN DÀY & CHIỀU SÂU 3/4) */}
      {/* =================================================================== */}
      {/* Rear casing cylinder extending up-left */}
      <g>
        {/* Rear cylindrical barrel shell */}
        <path
          d="M -135 -135 C -230 -60 -250 80 -160 165 L -100 135 C -170 60 -150 -60 -80 -120 Z"
          fill="#4A3423"
          stroke={INK}
          strokeWidth={4}
        />
        <path
          d="M -145 -125 C -235 -50 -255 75 -170 155 C -205 85 -200 -25 -120 -95 Z"
          fill="#334B3B"
          opacity={0.85}
        />
        {/* Verdigris patina scrollwork on rear casing */}
        <path
          d="M -175 -85 C -210 -40 -205 30 -165 95 Q -145 40 -150 -10 Q -155 -60 -175 -85 Z"
          fill="#5B8266"
          stroke="#2D4A3E"
          strokeWidth={1.5}
        />
        {/* Open mechanical casing showing exposed brass gear teeth inside */}
        <g transform="translate(-165 20) rotate(-25)">
          <circle cx={0} cy={0} r={32} fill="#633917" stroke={INK} strokeWidth={2} />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={i}
              x={-4}
              y={-34}
              width={8}
              height={6}
              fill="#C28833"
              stroke={INK}
              strokeWidth={1}
              transform={`rotate(${i * 30 + gearSpin})`}
            />
          ))}
          <circle cx={0} cy={0} r={14} fill="#8A5A20" stroke={INK} strokeWidth={1.5} />
        </g>
        {/* Upper rear cloud-like decorative crests (Vân mây đồng cổ) */}
        <path
          d="M -160 -140 C -185 -165 -155 -195 -125 -175 C -105 -205 -65 -195 -60 -170 C -40 -185 -15 -165 -30 -140 Z"
          fill="#C28833"
          stroke={INK}
          strokeWidth={3}
        />
        <path
          d="M -145 -145 C -165 -160 -145 -180 -125 -165 C -110 -185 -80 -180 -75 -160"
          stroke="#7A4E1B"
          strokeWidth={2}
          fill="none"
        />
      </g>

      {/* =================================================================== */}
      {/* 2. TOP POCKET WATCH WINDER CROWN & CARRYING RING (NÚM VẶN & VÒNG)   */}
      {/* =================================================================== */}
      <g transform="translate(-40 -165) rotate(-14)">
        {/* Heavy brass carrying loop ring */}
        <path
          d="M -30 -25 C -45 -55 45 -55 30 -25"
          fill="none"
          stroke="#C28833"
          strokeWidth={11}
          strokeLinecap="round"
        />
        <path
          d="M -30 -25 C -45 -55 45 -55 30 -25"
          fill="none"
          stroke="#F3D17A"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <path
          d="M -30 -25 C -45 -55 45 -55 30 -25"
          fill="none"
          stroke={INK}
          strokeWidth={2}
        />
        {/* Fluted winder crown knob */}
        <rect x={-14} y={-24} width={28} height={18} rx={4} fill="#946323" stroke={INK} strokeWidth={3} />
        <line x1={-8} y1={-24} x2={-8} y2={-6} stroke="#F3D17A" strokeWidth={1.5} />
        <line x1={0} y1={-24} x2={0} y2={-6} stroke="#F3D17A" strokeWidth={1.5} />
        <line x1={8} y1={-24} x2={8} y2={-6} stroke="#F3D17A" strokeWidth={1.5} />
        {/* Crown base neck */}
        <rect x={-9} y={-8} width={18} height={10} fill="#5C3B14" stroke={INK} strokeWidth={2.5} />
      </g>

      {/* =================================================================== */}
      {/* 3. MAIN CLOCK BODY BEZEL (VIỀN ĐỒNG MẶT TRƯỚC BẤT ĐỐI XỨNG)         */}
      {/* =================================================================== */}
      <g>
        {/* Outer thick brass bezel with sharp wing-like ornate flanges on sides */}
        <path
          d="M 0 -160 C 95 -160 165 -90 165 0 C 165 95 90 165 0 165 C -95 165 -165 90 -165 0 C -165 -90 -95 -160 0 -160 Z"
          fill="#8A5A20"
          stroke={INK}
          strokeWidth={5}
        />
        {/* Verdigris patina inlay on outer bezel */}
        <path
          d="M -60 -150 C -130 -120 -155 -50 -150 20 C -145 80 -110 135 -40 155 C -60 120 -70 80 -65 20 C -60 -40 -35 -110 -60 -150 Z"
          fill="#4D7058"
          stroke={INK}
          strokeWidth={2}
        />
        {/* Gold stepped inner bezel ring */}
        <circle cx={0} cy={0} r={148} fill="#C28833" stroke={INK} strokeWidth={3.5} />
        <circle cx={0} cy={0} r={136} fill="#5C3B14" stroke={INK} strokeWidth={2} />
        <circle cx={0} cy={0} r={130} fill="#E5B962" stroke="#7A4E1B" strokeWidth={2} />
      </g>

      {/* =================================================================== */}
      {/* 4. THE AGED FACE ON THE CLOCK DIAL (GƯƠNG MẶT ÔNG LỘC TRÊN MẶT SỐ)  */}
      {/* =================================================================== */}
      <g>
        {/* Ivory porcelain dial plate with weathered aged patina */}
        <circle cx={0} cy={0} r={126} fill="#F3E9D2" stroke={INK} strokeWidth={3} />

        {/* Dial radial crackle lines (Đường men rạn) */}
        <path d="M 85 -75 L 70 -50 L 80 -30 L 60 -10 M 70 -50 L 50 -60" stroke="#B8A484" strokeWidth={1.2} fill="none" opacity={0.65} />
        <path d="M -90 -40 L -70 -30 L -75 -10 L -55 10" stroke="#B8A484" strokeWidth={1.2} fill="none" opacity={0.65} />
        <path d="M -30 95 L -20 75 L -35 55 M -20 75 L 0 70" stroke="#B8A484" strokeWidth={1.2} fill="none" opacity={0.6} />

        {/* Minute/Hour tick marks around dial perimeter */}
        {Array.from({ length: 12 }).map((_, i) => {
          const ang = ((i * 30 - 90) * Math.PI) / 180;
          const x1 = Math.cos(ang) * 114;
          const y1 = Math.sin(ang) * 114;
          const x2 = Math.cos(ang) * 123;
          const y2 = Math.sin(ang) * 123;
          return (
            <line
              key={`tick${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#543D28"
              strokeWidth={i % 3 === 0 ? 3.5 : 2}
              strokeLinecap="round"
            />
          );
        })}

        {/* Small exposed gears embedded at bottom-left of dial */}
        <g transform="translate(-76 74)">
          <circle cx={0} cy={0} r={16} fill="#8A5A20" stroke={INK} strokeWidth={1.8} />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect
              key={i}
              x={-2.5}
              y={-18}
              width={5}
              height={4}
              fill="#C28833"
              stroke={INK}
              strokeWidth={0.8}
              transform={`rotate(${i * 45 - gearSpin})`}
            />
          ))}
          <circle cx={0} cy={0} r={5} fill="#4A2E12" />
        </g>

        {/* --- FACIAL SKIN CREASES & WRINKLES (NẾP GẤP DA MẶT NGƯỜI GIÀ) --- */}
        {/* Forehead wrinkles above upper eye */}
        <path d="M -42 -90 Q 0 -98 42 -90" stroke="#9E8262" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <path d="M -50 -80 Q 0 -88 50 -80" stroke="#9E8262" strokeWidth={2.6} fill="none" strokeLinecap="round" />
        <path d="M -35 -70 Q 0 -76 35 -70" stroke="#9E8262" strokeWidth={2} fill="none" strokeLinecap="round" />

        {/* Wrinkles and bags under lower eyes */}
        <path d="M -80 0 Q -52 18 -26 2" stroke="#9E8262" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        <path d="M -75 10 Q -50 28 -24 14" stroke="#B09677" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <path d="M 26 2 Q 52 18 80 0" stroke="#9E8262" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        <path d="M 24 14 Q 50 28 75 10" stroke="#B09677" strokeWidth={1.8} fill="none" strokeLinecap="round" />

        {/* Nasolabial folds (Rãnh cười & khóe miệng người già) */}
        <path d="M -40 28 Q -50 50 -28 66" stroke="#8A6E50" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <path d="M 40 28 Q 50 50 28 66" stroke="#8A6E50" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        {/* Chin creases */}
        <path d="M -16 78 Q 0 84 16 78" stroke="#A88E72" strokeWidth={1.8} fill="none" strokeLinecap="round" />

        {/* --- THREE CALCULATING AMBER EYES IN A TRIANGLE (BA MẮT HỔ PHÁCH) --- */}

        {/* 1. TOP APEX EYE (Mắt trên trán) */}
        <g transform="translate(0 -54)">
          {/* Sparse wiry white eyebrow */}
          <path
            d="M -38 -16 Q 0 -26 38 -16"
            stroke="#EFE8D8"
            strokeWidth={4.5}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M -36 -17 Q 0 -27 36 -17"
            stroke="#9C8974"
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
          />
          {/* Eye socket with heavy drooping upper eyelid */}
          <ellipse cx={0} cy={0} rx={32} ry={15} fill="#4A3423" stroke={INK} strokeWidth={2.5} />
          {/* Amber-gold iris */}
          <ellipse cx={eyeGazeX * 4} cy={eyeGazeY * 2} rx={22} ry={13} fill="#D97706" />
          <ellipse cx={eyeGazeX * 4} cy={eyeGazeY * 2} rx={17} ry={10} fill="#F59E0B" />
          <ellipse cx={eyeGazeX * 4} cy={eyeGazeY * 2} rx={12} ry={7} fill="#FEF08A" />
          {/* Horizontal sharp slit cat pupil */}
          <ellipse cx={eyeGazeX * 4} cy={eyeGazeY * 2} rx={10} ry={2.5} fill="#180C06" />
          {/* Specular highlight */}
          <circle cx={-4 + eyeGazeX * 3} cy={-3 + eyeGazeY} r={2.5} fill="#FFFFFF" />
          {/* Heavy drooping upper lid fold covering top of eye (Nheo mắt đánh giá) */}
          <path
            d="M -34 0 C -25 -16 25 -16 34 0 C 22 -7 -22 -7 -34 0 Z"
            fill="#DCCBB0"
            stroke={INK}
            strokeWidth={2}
          />
          <path d="M -32 -6 Q 0 -18 32 -6" stroke="#7A5D40" strokeWidth={2} fill="none" />
        </g>

        {/* 2. LOWER-LEFT EYE (Mắt dưới trái) */}
        <g transform="translate(-48 -8) rotate(4)">
          {/* Wispy eyebrow */}
          <path d="M -28 -14 Q 0 -22 26 -14" stroke="#EFE8D8" strokeWidth={4} fill="none" strokeLinecap="round" />
          <ellipse cx={0} cy={0} rx={27} ry={13} fill="#4A3423" stroke={INK} strokeWidth={2.2} />
          {/* Amber iris */}
          <ellipse cx={eyeGazeX * 3} cy={eyeGazeY * 2} rx={18} ry={11} fill="#D97706" />
          <ellipse cx={eyeGazeX * 3} cy={eyeGazeY * 2} rx={13} ry={8} fill="#F59E0B" />
          <ellipse cx={eyeGazeX * 3} cy={eyeGazeY * 2} rx={8} ry={5} fill="#FEF08A" />
          {/* Sharp slit pupil looking intently at viewer */}
          <ellipse cx={eyeGazeX * 3} cy={eyeGazeY * 2} rx={8} ry={2.2} fill="#180C06" />
          <circle cx={-3 + eyeGazeX * 2} cy={-2} r={2} fill="#FFFFFF" />
          {/* Squinting drooping lid fold */}
          <path
            d="M -28 0 C -20 -14 20 -14 28 0 C 18 -6 -18 -6 -28 0 Z"
            fill="#DCCBB0"
            stroke={INK}
            strokeWidth={1.8}
          />
          <path d="M -26 -5 Q 0 -14 26 -5" stroke="#7A5D40" strokeWidth={1.8} fill="none" />
        </g>

        {/* 3. LOWER-RIGHT EYE (Mắt dưới phải) */}
        <g transform="translate(48 -8) rotate(-4)">
          {/* Wispy eyebrow */}
          <path d="M -26 -14 Q 0 -22 28 -14" stroke="#EFE8D8" strokeWidth={4} fill="none" strokeLinecap="round" />
          <ellipse cx={0} cy={0} rx={27} ry={13} fill="#4A3423" stroke={INK} strokeWidth={2.2} />
          {/* Amber iris */}
          <ellipse cx={eyeGazeX * 3} cy={eyeGazeY * 2} rx={18} ry={11} fill="#D97706" />
          <ellipse cx={eyeGazeX * 3} cy={eyeGazeY * 2} rx={13} ry={8} fill="#F59E0B" />
          <ellipse cx={eyeGazeX * 3} cy={eyeGazeY * 2} rx={8} ry={5} fill="#FEF08A" />
          {/* Sharp slit pupil looking intently */}
          <ellipse cx={eyeGazeX * 3} cy={eyeGazeY * 2} rx={8} ry={2.2} fill="#180C06" />
          <circle cx={-3 + eyeGazeX * 2} cy={-2} r={2} fill="#FFFFFF" />
          {/* Squinting drooping lid fold */}
          <path
            d="M -28 0 C -20 -14 20 -14 28 0 C 18 -6 -18 -6 -28 0 Z"
            fill="#DCCBB0"
            stroke={INK}
            strokeWidth={1.8}
          />
          <path d="M -26 -5 Q 0 -14 26 -5" stroke="#7A5D40" strokeWidth={1.8} fill="none" />
        </g>

        {/* --- NOSE RIDGE & BRIDGE (SỐNG MŨI THỢ LÀM ĐỒNG HỒ) --- */}
        <path d="M -2 -14 L 3 14 L -4 24 L 4 25" stroke="#9C8264" strokeWidth={2} fill="none" strokeLinecap="round" />

        {/* --- THIN KNOWING SMIRK (MIỆNG MỎNG NỤ CƯỜI CONG BÍ HIỂM) --- */}
        <g transform={`translate(0 54) scale(${smirk})`}>
          {/* Thin curved smirk line */}
          <path
            d="M -34 4 Q -12 16 0 14 Q 22 10 36 -2"
            stroke="#5C3B24"
            strokeWidth={3.5}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M -34 4 Q -12 16 0 14 Q 22 10 36 -2"
            stroke="#8A4A28"
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
          />
          {/* Upturned right mouth corner */}
          <path d="M 32 -3 Q 37 -7 36 -2" stroke="#5C3B24" strokeWidth={3} fill="none" />
          {/* Lower lip shadow line */}
          <path d="M -12 21 Q 6 24 18 18" stroke="#B09677" strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>

        {/* --- ORNATE CLOCK HANDS INTERWEAVING THE FACE (CÁC KIM ĐỒNG MẢNH) --- */}
        {/* Central clock pivot between lower eyes */}
        <circle cx={0} cy={12} r={7} fill="#C28833" stroke={INK} strokeWidth={2} />
        <circle cx={0} cy={12} r={3} fill="#5C3B14" />

        {/* Hour Hand: pointing toward upper-left */}
        <g transform="translate(0 12) rotate(-55)">
          <path d="M 0 6 L -3 0 L -1 -55 L 0 -68 L 1 -55 L 3 0 Z" fill="#4A3018" stroke={INK} strokeWidth={1.6} />
          <circle cx={0} cy={-42} r={5} fill="#C28833" stroke={INK} strokeWidth={1.2} />
        </g>
        {/* Minute Hand: pointing toward upper-right */}
        <g transform="translate(0 12) rotate(65)">
          <path d="M 0 8 L -2.5 0 L -1 -75 L 0 -92 L 1 -75 L 2.5 0 Z" fill="#4A3018" stroke={INK} strokeWidth={1.6} />
          <circle cx={0} cy={-58} r={6} fill="#E5B962" stroke={INK} strokeWidth={1.2} />
        </g>
        {/* Second Hand with counterweight arrow: pointing down-right */}
        <g transform="translate(0 12) rotate(145)">
          <line x1={0} y1={-18} x2={0} y2={55} stroke="#991B1B" strokeWidth={1.5} />
          <polygon points="-3,50 3,50 0,58" fill="#991B1B" />
        </g>
      </g>

      {/* =================================================================== */}
      {/* 5. SLENDER ARTICULATED BRASS LEGS (HAI CHÂN CƠ KHÍ MẢNH LƠ LỬNG)     */}
      {/* =================================================================== */}
      {/* Attached directly beneath bottom rim of clock */}
      <g>
        {/* Left Leg: Double-jointed, bent backwards at knee */}
        <g transform="translate(-50 148)">
          {/* Hip socket */}
          <circle cx={0} cy={0} r={10} fill="#8A5A20" stroke={INK} strokeWidth={2.4} />
          <circle cx={0} cy={0} r={4} fill="#F3D17A" />
          {/* Thigh rod */}
          <path d="M 0 0 L -25 45" stroke="#C28833" strokeWidth={6} strokeLinecap="round" />
          <path d="M 0 0 L -25 45" stroke={INK} strokeWidth={1.5} fill="none" />
          {/* Knee joint */}
          <circle cx={-25} cy={45} r={8} fill="#8A5A20" stroke={INK} strokeWidth={2.2} />
          <circle cx={-25} cy={45} r={3} fill="#5C3B14" />
          {/* Shin rod angling forward */}
          <path d="M -25 45 L 6 95" stroke="#C28833" strokeWidth={5} strokeLinecap="round" />
          {/* Ankle and pointed metal claw foot */}
          <path d="M 6 95 Q 16 115 14 125 Q 4 120 0 105 Z" fill="#946323" stroke={INK} strokeWidth={2} />
        </g>

        {/* Right Leg: Sharp knee angle, pointed foot trailing */}
        <g transform="translate(30 156)">
          {/* Hip socket */}
          <circle cx={0} cy={0} r={9} fill="#8A5A20" stroke={INK} strokeWidth={2.4} />
          <circle cx={0} cy={0} r={3.5} fill="#F3D17A" />
          {/* Thigh rod */}
          <path d="M 0 0 L 25 42" stroke="#C28833" strokeWidth={6} strokeLinecap="round" />
          {/* Knee joint */}
          <circle cx={25} cy={42} r={7.5} fill="#8A5A20" stroke={INK} strokeWidth={2} />
          {/* Shin rod angling down-left */}
          <path d="M 25 42 L 8 92" stroke="#C28833" strokeWidth={4.8} strokeLinecap="round" />
          {/* Pointed claw foot */}
          <path d="M 8 92 Q 2 112 0 120 Q -8 114 -2 100 Z" fill="#946323" stroke={INK} strokeWidth={2} />
        </g>
      </g>

      {/* =================================================================== */}
      {/* 6. LEFT ARM: OPEN CLAW INVITING / APPRAISING (TAY TRÁI MỞ NGỬA)     */}
      {/* =================================================================== */}
      <g transform="translate(-160 5)">
        {/* Shoulder brass ball socket */}
        <circle cx={0} cy={0} r={15} fill="#8A5A20" stroke={INK} strokeWidth={3} />
        <circle cx={0} cy={0} r={6} fill="#F3D17A" />

        {/* Upper arm extending outward-down */}
        <path d="M 0 0 L -65 52" stroke="#C28833" strokeWidth={9} strokeLinecap="round" />
        <path d="M -4 0 L -65 52" stroke="#5C3B14" strokeWidth={2.5} fill="none" />

        {/* Elbow gear joint */}
        <g transform="translate(-65 52) rotate(35)">
          <circle cx={0} cy={0} r={14} fill="#8A5A20" stroke={INK} strokeWidth={2.5} />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect
              key={i}
              x={-2.5}
              y={-16}
              width={5}
              height={4}
              fill="#F3D17A"
              transform={`rotate(${i * 60})`}
            />
          ))}
          <circle cx={0} cy={0} r={5} fill="#4A2E12" />
        </g>

        {/* Forearm bending forward-inward */}
        <path d="M -65 52 L -35 110" stroke="#C28833" strokeWidth={8} strokeLinecap="round" />

        {/* Wrist socket */}
        <circle cx={-35} cy={110} r={9} fill="#8A5A20" stroke={INK} strokeWidth={2} />

        {/* Expressive Open Claw Hand with multi-jointed crooked fingers */}
        <g transform={`translate(-35 110) rotate(${fingerTwitch * 2})`}>
          {/* Palm base */}
          <path d="M -6 0 L 10 4 L 8 16 L -6 12 Z" fill="#946323" stroke={INK} strokeWidth={2} />
          {/* Thumb */}
          <path d="M -6 4 Q -18 8 -16 22" stroke="#C28833" strokeWidth={4} fill="none" strokeLinecap="round" />
          {/* Index finger curved upward */}
          <path d="M 0 14 Q 4 28 14 34 Q 22 36 28 28" stroke="#C28833" strokeWidth={3.8} fill="none" strokeLinecap="round" />
          {/* Middle finger */}
          <path d="M 4 14 Q 14 26 26 28 Q 36 26 38 18" stroke="#C28833" strokeWidth={3.8} fill="none" strokeLinecap="round" />
          {/* Ring finger */}
          <path d="M 8 12 Q 18 22 28 20" stroke="#C28833" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          {/* Little finger */}
          <path d="M 8 6 Q 16 12 22 10" stroke="#C28833" strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>
      </g>

      {/* =================================================================== */}
      {/* 7. RIGHT ARM: EXTENDED DOWN, GRASPING THE G1 JAR (TAY PHẢI ĐẶT LÊN LỌ) */}
      {/* =================================================================== */}
      <g transform="translate(156 12)">
        {/* Shoulder socket */}
        <circle cx={0} cy={0} r={15} fill="#8A5A20" stroke={INK} strokeWidth={3} />
        <circle cx={0} cy={0} r={6} fill="#F3D17A" />

        {/* Long upper arm reaching down-right */}
        <path d="M 0 0 L 72 38" stroke="#C28833" strokeWidth={9} strokeLinecap="round" />

        {/* Elbow joint with gear cogs */}
        <g transform="translate(72 38) rotate(-40)">
          <circle cx={0} cy={0} r={14} fill="#8A5A20" stroke={INK} strokeWidth={2.5} />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect
              key={i}
              x={-2.5}
              y={-16}
              width={5}
              height={4}
              fill="#F3D17A"
              transform={`rotate(${i * 60})`}
            />
          ))}
          <circle cx={0} cy={0} r={5} fill="#4A2E12" />
        </g>

        {/* Forearm extending down to the jar lid */}
        <path d="M 72 38 L 44 116" stroke="#C28833" strokeWidth={8} strokeLinecap="round" />
        {/* Wrist */}
        <circle cx={44} cy={116} r={9} fill="#8A5A20" stroke={INK} strokeWidth={2} />

        {/* Hand grasping the jar stopper lid */}
        <g transform={`translate(44 116) rotate(${fingerTwitch})`}>
          {/* Skeletal brass knuckles and fingers curling over lid */}
          <path d="M -12 8 L 8 4 L 14 14 L -6 18 Z" fill="#946323" stroke={INK} strokeWidth={2} />
          {/* Four jointed fingers gripping downwards onto the jar neck */}
          <path d="M -10 16 Q -14 26 -12 36" stroke="#C28833" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M -4 17 Q -4 28 0 38" stroke="#C28833" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M 4 16 Q 8 26 12 37" stroke="#C28833" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M 10 14 Q 18 24 22 34" stroke="#C28833" strokeWidth={3.5} fill="none" strokeLinecap="round" />
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

          {/* JAR 1: G1 (Car on Country Road) — Firmly held under Right Hand at x=195, y=175 */}
          <MemoryJar x={198} y={175} s={1.12} kind="g1" glow={1.3} t={t} showAura />

          {/* JAR 2: G2 (Two Intertwining Wisps) — Floating in center at x=340, y=190 */}
          {(() => {
            const bob2 = Math.sin(t * 0.08 + 1.5) * 8;
            return <MemoryJar x={340} y={190 + bob2} s={1.05} kind="g2" glow={1.2} t={t} showAura />;
          })()}

          {/* JAR 3: G3 (Crescent Moon & Sealed Door) — Floating at right at x=475, y=140 */}
          {(() => {
            const bob3 = Math.cos(t * 0.07 + 3.0) * 8;
            return <MemoryJar x={475} y={140 + bob3} s={0.98} kind="g3" glow={1.2} t={t} showAura />;
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
// 4. TIME VAULT SCENE (CẢNH 9: TOÀN BỘ KHÔNG GIAN KHO LƯU TRỮ THỜI GIAN)
// ============================================================================

/**
 * TimeVaultScene: The grand rotunda / vault archive from the reference artwork:
 * - Amphitheater curved multi-tiered shelves receding into the deep background.
 * - Hundreds of glowing jars stored on the shelves.
 * - Central glowing Reverse Hourglass pedestal with flame.
 * - Grand Gothic arched window in background.
 * - Center Clock Creature hovering with G1, G2, G3 jars.
 */
export const TimeVaultScene: React.FC<{
  t?: number;
  showJars?: boolean;
}> = ({ t = 0, showJars = true }) => {
  const id = `vault-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <g>
      <defs>
        {/* Warm parchment & mystical sepia vault atmosphere */}
        <linearGradient id={`${id}Bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E1C16" />
          <stop offset="50%" stopColor="#452B20" />
          <stop offset="100%" stopColor="#24140F" />
        </linearGradient>

        <radialGradient id={`${id}WindowGlow`} cx="50%" cy="30%" r="55%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity={0.35} />
          <stop offset="50%" stopColor="#D97706" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#1A0D08" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Background fill */}
      <rect x={-400} y={-300} width={2720} height={1680} fill={`url(#${id}Bg)`} />

      {/* =================================================================== */}
      {/* 1. GRAND GOTHIC ARCHED WINDOW IN BACKGROUND (CỬA SỔ VÒM ÁNH SÁNG)   */}
      {/* =================================================================== */}
      <g transform="translate(1080 180) scale(1.1)">
        {/* Soft atmospheric window light bloom */}
        <ellipse cx={0} cy={0} rx={220} ry={220} fill={`url(#${id}WindowGlow)`} pointerEvents="none" />
        {/* Stone tracery window frame */}
        <path
          d="M -140 180 L -140 -20 C -140 -120 140 -120 140 -20 L 140 180 Z"
          fill="#1C100B"
          stroke="#5C3B14"
          strokeWidth={6}
          opacity={0.7}
        />
        {/* Wheel / Rose window spokes */}
        <circle cx={0} cy={-20} r={80} stroke="#452B20" strokeWidth={3} fill="none" />
        {Array.from({ length: 8 }).map((_, i) => {
          const ang = (i * 45 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={0}
              y1={-20}
              x2={Math.cos(ang) * 80}
              y2={-20 + Math.sin(ang) * 80}
              stroke="#452B20"
              strokeWidth={2.5}
            />
          );
        })}
      </g>

      {/* =================================================================== */}
      {/* 2. AMPHITHEATER CURVED MULTI-TIERED APOTHECARY SHELVES              */}
      {/* (HÀNG KỆ CONG VÒM NHIỀU TẦNG TRẢI DÀI VỀ HẬU CẢNH)                  */}
      {/* =================================================================== */}
      <g>
        {/* Tier 1 (Highest, furthest back curve): y ≈ 220 */}
        <path
          d="M 880 260 Q 1400 170 1920 140"
          stroke="#382216"
          strokeWidth={24}
          fill="none"
        />
        <path
          d="M 880 252 Q 1400 162 1920 132"
          stroke="#6E4424"
          strokeWidth={4}
          fill="none"
        />
        {/* Jars on Tier 1 */}
        {[960, 1060, 1160, 1260, 1360, 1580, 1680, 1780, 1880].map((jx, i) => (
          <g key={`t1_${i}`} transform={`translate(${jx} ${220 - (i > 4 ? (i - 4) * 14 : 0)}) scale(0.48)`}>
            <MemoryJar
              x={0}
              y={0}
              kind="dormant"
              glow={0.7}
              t={t + i * 7}
              showAura={false}
            />
          </g>
        ))}

        {/* Tier 2 (Middle curve): y ≈ 360 */}
        <path
          d="M 760 380 Q 1340 270 1920 230"
          stroke="#42291B"
          strokeWidth={30}
          fill="none"
        />
        <path
          d="M 760 370 Q 1340 260 1920 220"
          stroke="#8A5A28"
          strokeWidth={5}
          fill="none"
        />
        {/* Jars on Tier 2 */}
        {[820, 920, 1020, 1120, 1220, 1560, 1660, 1760, 1860].map((jx, i) => (
          <g key={`t2_${i}`} transform={`translate(${jx} ${340 - (i > 4 ? (i - 4) * 16 : 0)}) scale(0.62)`}>
            <MemoryJar
              x={0}
              y={0}
              kind="dormant"
              glow={0.8}
              t={t + i * 5}
              showAura={false}
            />
          </g>
        ))}

        {/* Tier 3 (Foreground shelf with Hourglass altar): y ≈ 520 */}
        <path
          d="M 680 540 Q 1300 420 1920 370"
          stroke="#4A2E1E"
          strokeWidth={36}
          fill="none"
        />
        <path
          d="M 680 526 Q 1300 406 1920 356"
          stroke="#A66E32"
          strokeWidth={6}
          fill="none"
        />
        {/* Jars on Tier 3 */}
        {[720, 810, 900, 1000, 1100, 1620, 1720, 1820].map((jx, i) => (
          <g key={`t3_${i}`} transform={`translate(${jx} ${485 - (i > 4 ? (i - 4) * 20 : 0)}) scale(0.78)`}>
            <MemoryJar
              x={0}
              y={0}
              kind="dormant"
              glow={0.9}
              t={t + i * 4}
              showAura={false}
            />
          </g>
        ))}
      </g>

      {/* =================================================================== */}
      {/* 3. REVERSE HOURGLASS ALTAR TOWER (BỆ ĐỒNG HỒ CÁT NGƯỢC CÓ LỬA MA)   */}
      {/* =================================================================== */}
      <g transform="translate(1380 410)">
        {/* Stone carved architectural pedestal */}
        <rect x={-45} y={0} width={90} height={120} fill="#3E2718" stroke={INK} strokeWidth={3} />
        <polygon points="-52,0 52,0 45,-12 -45,-12" fill="#5C3B14" stroke={INK} strokeWidth={2.4} />
        {/* Hourglass */}
        <ReverseHourglass x={0} y={-12} s={1.3} t={t} />
      </g>

      {/* =================================================================== */}
      {/* 4. GROUND HATCHING & FLOOR TEXTURE                                  */}
      {/* =================================================================== */}
      <g opacity={0.35}>
        {Array.from({ length: 15 }).map((_, i) => (
          <line
            key={`hatch${i}`}
            x1={100 + i * 110}
            y1={920}
            x2={60 + i * 110}
            y2={990}
            stroke="#1C1008"
            strokeWidth={1.5}
          />
        ))}
      </g>

      {/* =================================================================== */}
      {/* 5. CENTER: CLOCK CREATURE HOVERING WITH 3 ACTIVE JARS               */}
      {/* (QUÁI VẬT ĐỒNG HỒ BA MẮT VÀ CỤM 3 LỌ KÝ ỨC G1, G2, G3)              */}
      {/* =================================================================== */}
      <ClockCreature
        x={680}
        y={490}
        s={1.22}
        t={t}
        hover
        eyeGazeX={0.2}
        eyeGazeY={0.1}
        smirk={1}
        showJars={showJars}
      />

      {/* =================================================================== */}
      {/* 6. GRAVITY-DEFYING CHRONO PARTICLES (HẠT THỜI GIAN BAY NGƯỢC)       */}
      {/* =================================================================== */}
      {Array.from({ length: 32 }).map((_, i) => {
        const speed = 0.04 + (i % 4) * 0.015;
        const py = 1050 - (((t * speed * 60 + i * 35) % 950));
        const px = 200 + ((i * 59) % 1520) + Math.sin(t * 0.04 + i) * 18;
        return (
          <circle
            key={`cp${i}`}
            cx={px}
            cy={py}
            r={1.1 + (i % 3) * 0.7}
            fill={i % 3 === 0 ? '#FDE68A' : i % 3 === 1 ? '#F59E0B' : '#E9D5FF'}
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
      <rect x={-300} y={-200} width={2600} height={1700} fill="#050812" />
      <polygon points="460,700 1180,700 2200,1400 -120,1400" fill="#0C101A" stroke={INK} strokeWidth={4} />
      <polygon points="-80,-40 460,600 460,860 -80,1080" fill="#131A26" stroke={INK} strokeWidth={4} />

      {/* Right Wall: WHERE THE SHOP FORMERLY WAS — NOW A BLANK DEAD-END WALL! */}
      <polygon points="1280,600 2000,-40 2000,1080 1280,860" fill="#151D2A" stroke={INK} strokeWidth={4} />
      <rect x={1340} y={480} width={380} height={240} fill="#1B2433" stroke="#0E141F" strokeWidth={2} />
      <path d="M 1360 520 Q 1480 500 1560 560 M 1420 620 Q 1520 600 1620 660" stroke="#253245" strokeWidth={2} fill="none" opacity={0.6} />

      <ellipse cx={1380} cy={910} rx={140} ry={28} fill="#111B2C" opacity={0.65} />
      <polygon points="1000,185 640,940 1360,940" fill="#3B82F6" opacity={0.06} />

      {/* Overhead wires */}
      <path d="M 120 145 Q 520 275 1140 210 Q 1480 190 1920 150" stroke="#05070C" strokeWidth={4} fill="none" />
      <path d="M 160 180 Q 680 330 1260 240 Q 1600 220 1920 190" stroke="#04060A" strokeWidth={3} fill="none" />

      {/* Eave & Owl watching */}
      <polygon points="-50,-20 440,80 400,142 -50,60" fill="#141B26" stroke={INK} strokeWidth={4} />
      {showOwl ? <circle cx={315} cy={205} r={18} fill="#1E2838" stroke={INK} strokeWidth={2} /> : null}
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
