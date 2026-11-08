import React from 'react';

// Two night street fronts for C8, drawn in the 1920×1080 world in the alley's ink-and-flat style:
// the children's own house (C8-C, seen around its open door) and Aunt Hạnh's eatery at the alley head (C8-D).
const INK = '#0E0B0A';

/** The wall, awning and everyday things around the open door of house 14/6 (the door opening itself is 560–1360). */
export const HomeFront: React.FC = () => (
  <g>
    <rect x={-200} y={-200} width={2400} height={1500} fill="#0C1019" />
    {/* plaster wall, damp at the foot, a band of old paint */}
    <rect x={-200} y={40} width={2400} height={930} fill="#2B303B" stroke={INK} strokeWidth={4} />
    <rect x={-200} y={760} width={2400} height={210} fill="#232833" />
    <line x1={-200} y1={760} x2={2200} y2={760} stroke="#191D27" strokeWidth={4} />
    {[[120, 200, 90], [330, 470, 140], [1560, 240, 120], [1770, 520, 90]].map(([x, y, h], i) => (
      <path key={i} d={`M ${x} ${y} q -8 ${h / 2} 3 ${h}`} stroke="#1D212B" strokeWidth={7} fill="none" strokeLinecap="round" />
    ))}
    <path d="M -200 970 Q 40 890 180 950 Q 260 900 420 970 Z M 1500 970 Q 1640 900 1760 950 Q 1880 900 2200 970 Z" fill="#20382F" stroke="#16261F" strokeWidth={2} />
    {/* rusty tin awning over the door */}
    <polygon points="440,40 1480,40 1540,118 380,118" fill="#4A3B33" stroke={INK} strokeWidth={4} />
    {Array.from({ length: 19 }).map((_, i) => (
      <line key={i} x1={470 + i * 54} y1={42} x2={420 + i * 60} y2={116} stroke="#352A25" strokeWidth={3} />
    ))}
    <rect x={380} y={116} width={1160} height={12} fill="#2B221E" stroke={INK} strokeWidth={3} />
    {/* electric meter and its conduit, drain pipe */}
    <path d="M 240 -200 L 240 300" stroke="#141822" strokeWidth={7} />
    <rect x={196} y={300} width={88} height={112} rx={6} fill="#3A404C" stroke={INK} strokeWidth={3.5} />
    <circle cx={240} cy={345} r={25} fill="#C9CCC4" stroke={INK} strokeWidth={3} />
    <line x1={240} y1={345} x2={254} y2={334} stroke={INK} strokeWidth={3} />
    <rect x={1642} y={-200} width={26} height={1170} fill="#3C4350" stroke={INK} strokeWidth={3} />
    {/* house number at eye level on the pillar */}
    <rect x={410} y={420} width={84} height={50} rx={5} fill="#1E3A8A" stroke="#E2E8F0" strokeWidth={3} />
    <text x={452} y={455} textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontWeight={800} fontSize={26}>14/6</text>
    {/* a child's chalk house and sun on the wall, low enough for an eight-year-old */}
    <g stroke="#C9CDD6" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.55}>
      <path d="M 90 800 L 90 720 L 160 672 L 230 720 L 230 800 Z" />
      <rect x={140} y={745} width={40} height={55} />
      <circle cx={296} cy={680} r={24} />
      <path d="M 296 640 v -16 M 336 680 h 16 M 268 652 l -12 -12 M 324 652 l 12 -12" />
    </g>
    {/* shoe shelf: the family's sandals, one small pair */}
    <g>
      <rect x={1440} y={806} width={210} height={12} fill="#4F4034" stroke={INK} strokeWidth={3} />
      <rect x={1440} y={880} width={210} height={12} fill="#4F4034" stroke={INK} strokeWidth={3} />
      <rect x={1448} y={806} width={12} height={160} fill="#3C3027" stroke={INK} strokeWidth={3} />
      <rect x={1630} y={806} width={12} height={160} fill="#3C3027" stroke={INK} strokeWidth={3} />
      <ellipse cx={1500} cy={798} rx={30} ry={9} fill="#8D5B3E" stroke={INK} strokeWidth={3} />
      <ellipse cx={1574} cy={798} rx={30} ry={9} fill="#8D5B3E" stroke={INK} strokeWidth={3} />
      <ellipse cx={1500} cy={872} rx={19} ry={7} fill="#E37F8A" stroke={INK} strokeWidth={3} />
      <ellipse cx={1550} cy={872} rx={19} ry={7} fill="#E37F8A" stroke={INK} strokeWidth={3} />
    </g>
    {/* aloe in a paint tin, a broom against the wall */}
    <g>
      <path d="M 372 890 q -36 -70 -46 -96 q 34 30 56 92 q -6 -84 6 -122 q 22 50 12 126 q 20 -54 54 -82 q -8 42 -44 90 Z" fill="#3F6B55" stroke={INK} strokeWidth={3} />
      <rect x={348} y={884} width={82} height={82} rx={5} fill="#7A8391" stroke={INK} strokeWidth={3.5} />
      <line x1={1760} y1={560} x2={1712} y2={910} stroke="#8A6A45" strokeWidth={10} strokeLinecap="round" />
      <path d="M 1690 900 L 1738 906 L 1750 966 L 1668 960 Z" fill="#B5985F" stroke={INK} strokeWidth={3.5} />
    </g>
  </g>
);

/** Warm eatery at the alley head: rolled-up shutter, cooking corner, stools, the only welcoming light left in the alley. */
export const AuntEatery: React.FC<{ t: number; wave?: number }> = ({ t, wave = 0 }) => {
  const sway = Math.sin(t * 0.05);
  const flick = 1 + Math.sin(t * 0.31) * 0.02;
  return (
    <g>
      <defs>
        <radialGradient id="auntSpill">
          <stop offset="0%" stopColor="#FFD79A" stopOpacity={0.62} />
          <stop offset="55%" stopColor="#F2A23E" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#F2A23E" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="auntBulb">
          <stop offset="0%" stopColor="#FFF0C4" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#FFB25A" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="auntRoom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E2A45C" />
          <stop offset="100%" stopColor="#A9692F" />
        </linearGradient>
        <clipPath id="auntOpening"><rect x={330} y={470} width={700} height={400} /></clipPath>
      </defs>

      {/* night sky strip, street wall to the right, pavement */}
      <rect x={-200} y={-200} width={2400} height={1500} fill="#070B14" />
      <rect x={1180} y={60} width={1000} height={830} fill="#1B212D" stroke={INK} strokeWidth={4} />
      <rect x={1380} y={230} width={170} height={210} fill="#10151F" stroke={INK} strokeWidth={4} />
      {[1420, 1465, 1510].map((x) => <line key={x} x1={x} y1={230} x2={x} y2={440} stroke="#2B3442" strokeWidth={5} />)}
      <polygon points="-200,870 2200,870 2200,1300 -200,1300" fill="#141A25" />
      <line x1={-200} y1={872} x2={2200} y2={872} stroke="#2A3240" strokeWidth={6} />
      {[[1320, 960, 120], [1640, 1010, 90], [240, 1030, 140]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.12} fill="#222C3B" />)}

      {/* the house: two floors of warm old plaster */}
      <rect x={180} y={70} width={1000} height={800} fill="#4A382B" stroke={INK} strokeWidth={4} />
      <line x1={180} y1={282} x2={1180} y2={282} stroke="#33261D" strokeWidth={8} />
      {[260, 690, 1110].map((x) => <path key={x} d={`M ${x} 80 q 8 90 -2 190`} stroke="#3A2B20" strokeWidth={6} fill="none" />)}
      {/* lit upstairs window: curtain, iron bars, herbs on the sill */}
      <rect x={560} y={110} width={260} height={140} fill="#F2C071" stroke={INK} strokeWidth={4} />
      <path d="M 560 110 Q 630 180 600 250 L 560 250 Z M 820 110 Q 750 180 780 250 L 820 250 Z" fill="#B65C49" stroke={INK} strokeWidth={3} />
      {[600, 640, 680, 720, 760].map((x) => <line key={x} x1={x} y1={110} x2={x} y2={250} stroke="#2A211C" strokeWidth={4} />)}
      <rect x={546} y={250} width={288} height={14} fill="#2F241C" stroke={INK} strokeWidth={3} />
      {[590, 690, 790].map((x, i) => (
        <g key={x}>
          <path d={`M ${x} 238 q -18 -30 -22 -40 q 16 8 24 34 q 2 -32 8 -44 q 12 22 2 44 q 10 -24 26 -32 q -6 20 -24 38 Z`} fill="#5C8A4E" stroke={INK} strokeWidth={2.2} />
          <rect x={x - 16} y={234} width={36} height={18} rx={3} fill={i === 1 ? '#C65B3F' : '#9A6A4A'} stroke={INK} strokeWidth={2.5} />
        </g>
      ))}

      {/* painted signboard */}
      <rect x={300} y={296} width={760} height={92} rx={6} fill="#B23A2E" stroke={INK} strokeWidth={4} />
      <rect x={312} y={307} width={736} height={70} rx={4} fill="none" stroke="#F4D08A" strokeWidth={3} />
      <text x={680} y={362} textAnchor="middle" fill="#FBE7BC" fontFamily="'Noto Serif', Georgia, serif" fontWeight={800} fontSize={50} letterSpacing={4}>QUÁN DÌ HẠNH</text>

      {/* the open front and what is inside */}
      <rect x={316} y={456} width={728} height={414} fill="#22170F" stroke={INK} strokeWidth={4} />
      <g clipPath="url(#auntOpening)">
        <rect x={330} y={470} width={700} height={400} fill="url(#auntRoom)" />
        <polygon points="330,790 1030,790 1030,870 330,870" fill="#7E5A3C" />
        {Array.from({ length: 8 }).map((_, i) => <line key={i} x1={330 + i * 100} y1={790} x2={300 + i * 110} y2={870} stroke="#67482F" strokeWidth={3} />)}
        <line x1={330} y1={790} x2={1030} y2={790} stroke="#5C4029" strokeWidth={5} />
        {/* the shadow of someone still working at the stove */}
        <g transform={`translate(${sway * 5} 0)`} opacity={0.32}>
          <circle cx={560} cy={566} r={34} fill="#3A2211" />
          <path d="M 512 790 Q 514 620 560 604 Q 612 620 616 790 Z" fill="#3A2211" />
          <path d={`M 604 650 Q ${650 - wave * 10} ${640 + sway * 8 - wave * 90} ${676 - wave * 20} ${662 + sway * 6 - wave * 150}`} stroke="#3A2211" strokeWidth={20} fill="none" strokeLinecap="round" />
        </g>
        {/* cooking corner */}
        <rect x={640} y={690} width={250} height={100} fill="#8E8F8B" stroke={INK} strokeWidth={3.5} />
        <rect x={640} y={680} width={250} height={14} fill="#C8CAC4" stroke={INK} strokeWidth={3} />
        <ellipse cx={712} cy={664} rx={46} ry={22} fill="#50575F" stroke={INK} strokeWidth={3} />
        <rect x={668} y={664} width={88} height={18} fill="#50575F" stroke={INK} strokeWidth={3} />
        <rect x={792} y={628} width={68} height={54} rx={12} fill="#EDE6D4" stroke={INK} strokeWidth={3} />
        <ellipse cx={826} cy={628} rx={34} ry={9} fill="#D9D2BF" stroke={INK} strokeWidth={3} />
        <path d={`M 700 640 q ${sway * 8} -20 -4 -40 M 724 642 q ${-sway * 8} -24 6 -46`} stroke="#FFF3DC" strokeWidth={4} fill="none" opacity={0.6} strokeLinecap="round" />
        {/* shelf of bowls and sauces, a chalk menu, the kitchen calendar */}
        <rect x={650} y={546} width={240} height={10} fill="#5C3D25" stroke={INK} strokeWidth={3} />
        {[676, 712, 748].map((x) => <path key={x} d={`M ${x - 16} 530 q 16 20 32 0 Z`} fill="#F5F0E2" stroke={INK} strokeWidth={2.5} />)}
        {[800, 826, 852].map((x, i) => <rect key={x} x={x - 8} y={510} width={16} height={36} rx={4} fill={['#B5472F', '#D9A441', '#6B4A2F'][i]} stroke={INK} strokeWidth={2.5} />)}
        <rect x={380} y={500} width={108} height={150} rx={4} fill="#2F3B35" stroke="#7A5734" strokeWidth={6} />
        {[526, 552, 578, 604, 628].map((y, i) => <line key={y} x1={396} y1={y} x2={i % 2 ? 462 : 474} y2={y} stroke="#E9E4D2" strokeWidth={4} strokeLinecap="round" opacity={0.75} />)}
        <rect x={920} y={500} width={74} height={104} fill="#F3EDE0" stroke={INK} strokeWidth={3} />
        <rect x={920} y={500} width={74} height={30} fill="#C23B2E" stroke={INK} strokeWidth={3} />
        <text x={957} y={578} textAnchor="middle" fill="#2A1C14" fontFamily="sans-serif" fontWeight={800} fontSize={38}>14</text>
        {/* the small floor altar with its red lamp, as in most Southern shops */}
        <rect x={940} y={716} width={78} height={74} fill="#8E2A22" stroke={INK} strokeWidth={3} />
        <circle cx={979} cy={752} r={9} fill="#FF7A5C" />
        {/* hanging bulbs */}
        {[500, 850].map((x) => (
          <g key={x}>
            <line x1={x} y1={470} x2={x} y2={500} stroke={INK} strokeWidth={3} />
            <circle cx={x} cy={508} r={70 * flick} fill="url(#auntBulb)" />
            <circle cx={x} cy={508} r={11} fill="#FFF3CF" stroke={INK} strokeWidth={2} />
          </g>
        ))}
      </g>
      {/* shutter rolled up, and the striped awning over it */}
      <rect x={316} y={456} width={728} height={18} fill="#3D4148" stroke={INK} strokeWidth={3} />
      <polygon points="290,388 1070,388 1110,470 250,470" fill="#D8D2C2" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 11 }).map((_, i) => (
        i % 2 === 0 ? <polygon key={i} points={`${290 + i * 70.9},388 ${361 + i * 70.9},388 ${328 + i * 78.2},470 ${250 + i * 78.2},470`} fill="#3E7C78" stroke={INK} strokeWidth={2} /> : null
      ))}

      {/* out front: a table with stools, stacked stools, a water jar, a plant */}
      <g>
        <ellipse cx={270} cy={868} rx={52} ry={9} fill="#090B10" opacity={0.6} />
        <path d="M 226 760 Q 270 744 314 760 L 304 862 Q 270 876 236 862 Z" fill="#6E4B32" stroke={INK} strokeWidth={4} />
        <ellipse cx={270} cy={756} rx={46} ry={14} fill="#2B3A48" stroke={INK} strokeWidth={3.5} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(1100 ${830 - i * 26})`}>
            <path d="M -38 0 L -28 40 M 38 0 L 28 40" stroke="#C5392E" strokeWidth={9} strokeLinecap="round" />
            <rect x={-44} y={-10} width={88} height={16} rx={6} fill="#D9473A" stroke={INK} strokeWidth={3} />
          </g>
        ))}
        <rect x={500} y={846} width={0} height={0} />
      </g>
      <ellipse cx={680} cy={890} rx={520} ry={210} fill="url(#auntSpill)" style={{ mixBlendMode: 'screen' }} />
      <rect x={330} y={470} width={700} height={400} fill="#FFC67A" opacity={0.06} style={{ mixBlendMode: 'screen' }} />

      {/* street number and overhead wires */}
      <rect x={1076} y={520} width={76} height={44} rx={4} fill="#1E3A8A" stroke="#E2E8F0" strokeWidth={2.5} />
      <text x={1114} y={551} textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontWeight={800} fontSize={24}>2/1</text>
      <path d="M -200 90 Q 700 200 2200 60 M -200 140 Q 900 260 2200 120" stroke="#04060B" strokeWidth={5} fill="none" />
    </g>
  );
};
