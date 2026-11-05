import React from 'react';
import { makeRoom, Box, S3, Pt } from '../room';
import { RoomShell, BackWindow, Pendant, pendantLight, WallLight, FloorShadow, FloorPlant, WallFrame, WallClock } from '../furnish';
import { Glow, LightVeil, Dust, Cone } from '../light';
import { DuskSky, Sun, Skyline, Haze, Rays } from '../kit';
import { rnd } from '../anim';
import { Hero, LOOKS, Pose, basePose } from '../rig';
import { FONT } from '../fonts';

// Places for "Nếu ngày đó bạn không bỏ học?": a building site at dusk, the small family home, the school and its gate,
// the street where the truck waits, the electrical workshop, an unfinished building behind glass, a bus at dusk.

const INK = '#1A1410';

// ============================================================================================ the building site
/**
 * The site at dusk (ground at y 830). `bricks` 0..1 is how much of the pile has been laid into the wall, `barrow` the
 * wheelbarrow's x, `crane` swings the boom, `workers` are far figures standing on the ground line.
 */
export const Site: React.FC<{ t: number; id?: string; bricks?: number; barrow?: number; crane?: number; workers?: { x: number; y?: number; s?: number; look?: keyof typeof LOOKS; yaw?: number }[]; lamp?: boolean; veil?: number }> = ({
  t, id = 'site', bricks = 0, barrow = 520, crane = 0, workers = [], lamp = true, veil = 0.4,
}) => {
  const G = 830;
  const cols = [640, 860, 1080, 1300];
  const floors = [G - 250, G - 480];
  const swing = Math.sin(crane * 0.05) * 90;
  return (
    <g>
      <DuskSky id={`${id}sky`} horizonY={640} />
      <Sun x={1520} y={640} r={78} t={t} />
      <Skyline y={700} seed={14} color="#3A2358" h={170} />
      <Skyline y={740} seed={9} color="#2A1B45" h={110} />
      <Haze y={720} h={300} o={0.4} />
      {/* the tower crane: a mast, a jib that swings, a hook and a load of rebar */}
      <g transform="translate(1690 0)">
        <rect x={-14} y={150} width={28} height={G - 150} fill="#2A1B3E" />
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={i} d={`M -14 ${170 + i * 55} L 14 ${225 + i * 55} M 14 ${170 + i * 55} L -14 ${225 + i * 55}`} stroke="#3A2A52" strokeWidth={4} />
        ))}
        <g transform={`translate(0 150) scale(${1 + swing / 700} 1)`}>
          <rect x={-560} y={-18} width={720} height={26} fill="#3A2A52" />
          <rect x={120} y={-18} width={60} height={50} fill="#2A1B3E" />
          <path d="M -560 8 L -300 -80 L 20 8 M -300 -80 L 20 -90" stroke="#3A2A52" strokeWidth={5} fill="none" />
          <path d={`M -430 8 L -430 ${230 + Math.sin(crane * 0.04) * 20}`} stroke="#1A1226" strokeWidth={3} />
          <rect x={-470} y={238 + Math.sin(crane * 0.04) * 20} width={80} height={14} fill="#B8654A" />
        </g>
        <circle cx={0} cy={152} r={7} fill="#E04A3A" opacity={0.5 + 0.5 * Math.sin(t / 8)} />
      </g>
      {/* ground: packed dirt, tyre tracks, a puddle that holds the sky */}
      <rect x={-400} y={G - 30} width={2720} height={400} fill="#4A3A38" />
      <rect x={-400} y={G - 30} width={2720} height={60} fill="#6A5048" opacity={0.7} />
      <rect x={-400} y={G + 30} width={2720} height={340} fill="url(#g3fadeDown)" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M -300 ${G + 40 + i * 60} Q 900 ${G + 10 + i * 70} 2200 ${G + 50 + i * 54}`} stroke="#3A2A2C" strokeWidth={10} fill="none" opacity={0.5} />
      ))}
      <ellipse cx={1160} cy={G + 62} rx={180} ry={16} fill="#C98A64" opacity={0.55} />
      {/* scaffolding on the left: poles, cross braces, planks */}
      <g>
        {[340, 480, 620].map((x) => (
          <rect key={x} x={x - 7} y={G - 520} width={14} height={520} fill="#2E2438" />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={320} y={G - 40 - i * 130} width={320} height={10} fill="#8A6A44" />
            <path d={`M 340 ${G - 30 - i * 130} L 480 ${G - 160 - i * 130} M 480 ${G - 30 - i * 130} L 620 ${G - 160 - i * 130}`} stroke="#3E3248" strokeWidth={5} />
          </g>
        ))}
      </g>
      {/* the concrete frame: columns, two slabs, rebar sticking up, a half-laid brick wall */}
      <g>
        {cols.map((x) => (
          <g key={x}>
            <rect x={x - 22} y={G - 500} width={44} height={500} fill="#6F6A72" />
            <rect x={x + 6} y={G - 500} width={16} height={500} fill="#4E4A56" opacity={0.7} />
            <rect x={x - 22} y={G - 500} width={6} height={500} fill="#FFB46A" opacity={0.28} />
          </g>
        ))}
        {floors.map((y, i) => (
          <g key={i}>
            <rect x={600} y={y} width={740} height={26} fill="#7C777F" />
            <rect x={600} y={y + 18} width={740} height={8} fill="#4E4A56" />
            <rect x={600} y={y} width={740} height={4} fill="#FFB46A" opacity={0.35} />
          </g>
        ))}
        {cols.map((x) => (
          <g key={`rb${x}`} stroke="#2E2A34" strokeWidth={4} strokeLinecap="round">
            {[-12, -4, 4, 12].map((dx) => (
              <path key={dx} d={`M ${x + dx} ${G - 500} L ${x + dx} ${G - 560 - (dx % 3) * 6}`} />
            ))}
          </g>
        ))}
        {/* the brick wall between columns 1 and 2: rows appear as `bricks` rises */}
        {Array.from({ length: 8 }).map((_, r) =>
          Array.from({ length: 6 }).map((__, c) => {
            const show = bricks * 8 * 6 > r * 6 + c;
            return show ? <rect key={`${r}-${c}`} x={668 + c * 32 + (r % 2 ? 16 : 0)} y={G - 30 - (r + 1) * 17} width={31} height={16} fill={(r + c) % 3 === 0 ? '#B8654A' : '#C97A58'} stroke="#7A4A3A" strokeWidth={1.5} /> : null;
          }),
        )}
        {/* a bare bulb and a hanging work light in the lower floor */}
        <path d={`M 970 ${floors[1] + 26} L 970 ${floors[1] + 70}`} stroke="#1A1226" strokeWidth={3} />
        <circle cx={970} cy={floors[1] + 78} r={9} fill="#FFE2B0" />
        <Glow x={970} y={floors[1] + 84} r={220} o={0.5} />
      </g>
      {/* piles and stacks: bricks, sand, cement, planks */}
      <g>
        <ellipse cx={1500} cy={G + 20} rx={150} ry={22} fill="#000" opacity={0.3} />
        <path d={`M 1360 ${G + 14} Q 1500 ${G - 120} 1640 ${G + 14} Z`} fill="#B99A72" />
        <path d={`M 1500 ${G - 116} Q 1580 ${G - 60} 1640 ${G + 14} L 1560 ${G + 14} Z`} fill="#8E7452" opacity={0.7} />
      </g>
      {/* a fence of corrugated sheets and a warning-tape line */}
      <g>
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={-120 + i * 70} y={G - 170} width={70} height={160} fill={i % 2 ? '#3A5A66' : '#456A76'} stroke="#2A4450" strokeWidth={2} />
        ))}
        <rect x={-120} y={G - 176} width={630} height={8} fill="#2A4450" />
      </g>
      {workers.map((w, i) => {
        const pose: Pose = { ...basePose, x: w.x, y: (w.y ?? G) - (w.s ?? 0.5) * 140, scale: w.s ?? 0.5, yaw: w.yaw ?? 0.5, facing: 1, armR: { a: 20 + Math.sin(t / 9 + i) * 14, b: 10 }, armL: { a: -12, b: -8 } };
        return <Hero key={i} look={LOOKS[w.look ?? 'chu']} pose={pose} rimId="rimR" shadow={0.6} />;
      })}
      {lamp ? (
        <g>
          <rect x={1790} y={G - 420} width={10} height={420} fill="#1E1824" />
          <rect x={1760} y={G - 430} width={72} height={22} rx={6} fill="#1E1824" />
          <Cone d={`M 1768 ${G - 408} L 1824 ${G - 408} L 1990 ${G + 40} L 1600 ${G + 40} Z`} o={0.45} />
          <Glow x={1796} y={G - 400} r={240} o={0.6} />
        </g>
      ) : null}
      <LightVeil id={`${id}veil`} lights={[[1520, 640, 800], [970, floors[1] + 84, 340], [1796, G - 400, 360]]} o={veil} />
      <Dust t={t} seed={44} x0={300} y0={420} w={1300} h={420} n={46} o={0.5} />
    </g>
  );
};

// ================================================================================================ the home
export const HOME = makeRoom({ x: 960, y: 500 }, { x0: 560, x1: 1400, y0: 340, y1: 740 }, 3.3);
export const HOME_TABLE_V = 0.74;
/** A point on the dining table's top: u across 0..1 of the table, d 0 back edge .. 1 front edge. */
export const tableTop = (u: number, d: number) => HOME.P(0.36 + 0.36 * u, HOME_TABLE_V, 0.3 + 0.28 * d);
const H = { wall: '#5E4A44', side: '#4A3A38', floor: '#3A2A2A', blanket: '#4F6F78', blanketD: '#3C5760', wood: '#7A5240', woodD: '#5A3A30' };

/** The dining table with its stools: draw it after anyone standing behind it, so it hides their legs. */
export const HomeTable: React.FC = () => {
  const R = HOME;
  const { P } = R;
  const tv = HOME_TABLE_V;
  const legs = [[0.38, 0.32], [0.7, 0.32], [0.38, 0.56], [0.7, 0.56]];
  return (
    <g>
        {/* the dining table, bare, with two stools behind it and one in front */}
        <FloorShadow r={R} u={[0.36, 0.74]} w={[0.3, 0.6]} o={0.4} />
        {legs.map(([u, w], i) => (
          <Box key={i} r={R} u={[u - 0.012, u + 0.012]} v={[tv, 1]} w={[w - 0.01, w + 0.01]} front={H.woodD} side={H.woodD} />
        ))}
        <Box r={R} u={[0.36, 0.72]} v={[tv - 0.012, tv + 0.02]} w={[0.3, 0.58]} front={H.woodD} top="#8A6048" side={H.woodD} rim />
        {[0.44, 0.66].map((u, i) => {
          const s = P(u, 0.86, 0.2);
          const k = R.s(0.2) / R.s(0.4);
          return (
            <g key={i}>
              <ellipse cx={s.x + 4} cy={P(u, 1, 0.2).y + 2} rx={44 * k} ry={9 * k} fill="#000" opacity={0.35} />
              <path d={`M ${s.x - 28 * k} ${s.y} L ${s.x - 34 * k} ${P(u, 1, 0.2).y} M ${s.x + 28 * k} ${s.y} L ${s.x + 34 * k} ${P(u, 1, 0.2).y}`} stroke="#3A2A24" strokeWidth={8 * k} strokeLinecap="round" />
              <ellipse cx={s.x} cy={s.y} rx={40 * k} ry={11 * k} fill="#B58A5A" stroke={INK} strokeWidth={3} />
            </g>
          );
        })}
    </g>
  );
};

/** The small family home: one room that is bedroom and dining room. `door` 0..1 is how much light comes in from the doorway. */
export const Home: React.FC<{ t: number; id?: string; veil?: number; door?: number; morning?: boolean; bag?: boolean; table?: boolean }> = ({ t, id = 'home', veil = 0.46, door = 1, morning = false, bag = true, table = true }) => {
  const R = HOME;
  const { P, Q } = R;
  const tv = HOME_TABLE_V;
  const legs = [[0.38, 0.32], [0.7, 0.32], [0.38, 0.56], [0.7, 0.56]];
  return (
    <g>
      <RoomShell r={R} id={id} floor="boards" wall={H.wall} side={H.side} floorC={H.floor} lines="#2A1C1C" />
      {/* the window, with a thin curtain and the evening (or morning) in it */}
      <BackWindow r={R} id={`${id}w`} t={t} x0={690} x1={880} y0={392} y1={560} sun={{ x: 820, y: 552 }} cols={2} curtains={false} />
      <path d="M 680 384 L 890 384 L 890 440 Q 860 452 830 440 Q 790 452 760 440 Q 720 452 680 440 Z" fill="#B58A72" opacity={0.85} />
      {/* the open door on the right of the back wall: a lit rectangle with the yard outside */}
      <rect x={1190} y={398} width={118} height={P(0, 1, 0).y - 398} fill={morning ? '#CFE3E8' : '#FFC27A'} opacity={0.95} />
      <rect x={1180} y={392} width={12} height={P(0, 1, 0).y - 392} fill="#2A1C1A" />
      <rect x={1308} y={392} width={12} height={P(0, 1, 0).y - 392} fill="#2A1C1A" />
      <rect x={1180} y={386} width={140} height={12} fill="#2A1C1A" />
      <path d="M 1196 420 L 1300 420 L 1300 500 L 1196 500 Z" fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0} />
      <polygon points={Q([[0.82, 1, 0], [0.96, 1, 0], [1.02, 1, 0.5], [0.76, 1, 0.5]])} fill="#FFC27A" opacity={0.2 * door} style={{ mixBlendMode: 'screen' }} />
      <rect x={1150} y={P(0, 0.2, 0).y - 10} width={30} height={10} fill="#000" opacity={0} />
      {/* wall clock, a calendar from the shop, two certificates of merit over the bed */}
      <WallClock x={P(0.5, 0.18, 0).x} y={P(0.5, 0.18, 0).y} r={26} t={t} />
      <g>
        <rect x={P(0.62, 0.12, 0).x} y={P(0.62, 0.12, 0).y} width={70} height={92} fill="#E8DCC0" stroke={INK} strokeWidth={3} />
        <rect x={P(0.62, 0.12, 0).x} y={P(0.62, 0.12, 0).y} width={70} height={24} fill="#C2453E" />
        {Array.from({ length: 12 }).map((_, i) => (
          <circle key={i} cx={P(0.62, 0.12, 0).x + 12 + (i % 4) * 16} cy={P(0.62, 0.12, 0).y + 40 + Math.floor(i / 4) * 16} r={3} fill="#5A4A3A" />
        ))}
      </g>
      <WallFrame x={P(0.06, 0.2, 0).x + 26} y={P(0.06, 0.2, 0).y} w={86} h={62} art={1} />
      <WallFrame x={P(0.06, 0.2, 0).x + 126} y={P(0.06, 0.2, 0).y + 6} w={86} h={62} art={2} />
      {/* the bed in the left corner: a frame on legs (the school bag is under it), a mattress, a pillow, a blanket */}
      <FloorShadow r={R} u={[0, 0.34]} w={[0, 0.5]} o={0.4} />
      <Box r={R} u={[0.0, 0.34]} v={[0.8, 0.84]} w={[0, 0.5]} front={H.woodD} top={H.wood} side={H.woodD} />
      <Box r={R} u={[0.0, 0.03]} v={[0.84, 1]} w={[0.46, 0.5]} front={H.woodD} side={H.woodD} />
      <Box r={R} u={[0.31, 0.34]} v={[0.84, 1]} w={[0.46, 0.5]} front={H.woodD} side={H.woodD} />
      <Box r={R} u={[0.0, 0.34]} v={[0.66, 0.8]} w={[0, 0.5]} front={H.blanket} top="#6B8F98" side={H.blanketD} rim />
      <polygon points={Q([[0.0, 0.66, 0.02], [0.12, 0.66, 0.02], [0.12, 0.66, 0.16], [0.0, 0.66, 0.16]])} fill="#E8DCC0" />
      <polygon points={Q([[0.02, 0.655, 0.03], [0.1, 0.655, 0.03], [0.1, 0.655, 0.14], [0.02, 0.655, 0.14]])} fill="#F6EFE3" />
      <path d={`M ${P(0.04, 0.7, 0.5).x} ${P(0.04, 0.7, 0.5).y} L ${P(0.3, 0.7, 0.5).x} ${P(0.3, 0.7, 0.5).y}`} stroke="#8FB4BC" strokeWidth={3} opacity={0.7} />
      {bag ? (
        // lying on its back under the front rail of the bed (the gap under the rail is only ~70 px high at w 0.44)
        <g transform={`translate(${P(0.16, 1, 0.44).x + 43} ${P(0.16, 1, 0.44).y - 32}) scale(0.32) rotate(-90)`}>
          <ellipse cx={-120} cy={0} rx={100} ry={14} fill="#000" opacity={0.0} />
          <path d="M -100 0 Q -112 -120 -80 -230 Q -50 -270 0 -270 Q 50 -270 80 -230 Q 112 -120 100 0 Z" fill="#3C5E8C" stroke={INK} strokeWidth={6} />
          <rect x={-60} y={-176} width={120} height={80} rx={14} fill="#3C5E8C" stroke={INK} strokeWidth={5} />
          <path d="M -50 -150 L 50 -150" stroke="#C9B48A" strokeWidth={6} />
        </g>
      ) : null}
      {/* a rattan stool, a plant, a fan on a stand and school shoes by the bed */}
      <FloorPlant r={R} u={0.97} w={0.1} size={1.1} />
      {(() => {
        const f = P(0.9, 1, 0.22);
        const sw = Math.sin(t / 30) * 6;
        return (
          <g>
            <ellipse cx={f.x + 6} cy={f.y + 2} rx={50} ry={9} fill="#000" opacity={0.4} />
            <rect x={f.x - 5} y={f.y - 180} width={10} height={180} fill="#4A4A54" />
            <ellipse cx={f.x} cy={f.y} rx={40} ry={8} fill="#3A3A44" />
            <g transform={`rotate(${sw} ${f.x} ${f.y - 200})`}>
              <circle cx={f.x} cy={f.y - 210} r={52} fill="#5A5A64" opacity={0.85} stroke={INK} strokeWidth={4} />
              <circle cx={f.x} cy={f.y - 210} r={40} fill="none" stroke="#3A3A44" strokeWidth={2} />
              {[0, 1, 2].map((i) => (
                <path key={i} d={`M ${f.x} ${f.y - 210} L ${f.x + Math.cos(t / 3 + i * 2.1) * 36} ${f.y - 210 + Math.sin(t / 3 + i * 2.1) * 36}`} stroke="#C9C2B4" strokeWidth={9} strokeLinecap="round" opacity={0.55} />
              ))}
              <circle cx={f.x} cy={f.y - 210} r={6} fill="#8A8A94" />
            </g>
          </g>
        );
      })()}
      {/* the shelf on the back wall with a rice cooker, a thermos, jars; a hook with Bố's jacket */}
      <polygon points={Q([[0.4, 0.34, 0], [0.68, 0.34, 0], [0.68, 0.34, 0.04], [0.4, 0.34, 0.04]])} fill={H.wood} />
      {(() => {
        const a = P(0.45, 0.34, 0.01);
        const b = P(0.62, 0.34, 0.01);
        return (
          <g>
            <rect x={a.x - 30} y={a.y - 56} width={60} height={56} rx={10} fill="#D9D0BE" stroke={INK} strokeWidth={3} />
            <rect x={a.x - 30} y={a.y - 56} width={60} height={14} rx={6} fill="#C2453E" />
            <rect x={b.x - 14} y={b.y - 64} width={28} height={64} rx={8} fill="#5E9A8A" stroke={INK} strokeWidth={3} />
            <rect x={b.x - 16} y={b.y - 70} width={32} height={10} rx={4} fill="#2A4A44" />
          </g>
        );
      })()}
      <path d={`M ${P(0.88, 0.18, 0).x} ${P(0.88, 0.18, 0).y} l 0 14`} stroke="#2A1C1A" strokeWidth={5} />
      <path d={`M ${P(0.88, 0.18, 0).x - 24} ${P(0.88, 0.18, 0).y + 12} L ${P(0.88, 0.18, 0).x + 24} ${P(0.88, 0.18, 0).y + 12} L ${P(0.88, 0.18, 0).x + 34} ${P(0.88, 0.18, 0).y + 92} L ${P(0.88, 0.18, 0).x - 34} ${P(0.88, 0.18, 0).y + 92} Z`} fill="#4A5A66" opacity={0.9} />
      {table ? <HomeTable /> : null}
      {/* the bare bulb over the table: the light of the room */}
      <Pendant r={R} u={0.54} w={0.44} v={0.2} t={t} cone={0.26} glow={0.5} />
      <LightVeil id={`${id}veil`} lights={[pendantLight(R, 0.54, 0.44, 0.2), [790, 500, 300], [1250, 560, 330 * door + 1]]} o={veil} />
      <Glow x={790} y={500} r={260} o={0.28} />
      {door > 0 ? <Glow x={1250} y={560} r={300} o={0.34 * door} /> : null}
      <Dust t={t} seed={61} x0={620} y0={440} w={560} h={360} n={30} />
    </g>
  );
};

// ============================================================================================ school, the street
/** The school's front and yard at dusk, ground at y 830. `grad` hangs the graduation banner and balloons. */
export const Schoolyard: React.FC<{ t: number; id?: string; grad?: boolean; morning?: boolean; veil?: number }> = ({ t, id = 'sy', grad = false, morning = false, veil = 0.34 }) => {
  const G = 830;
  return (
    <g>
      <DuskSky id={`${id}sky`} horizonY={620} />
      {morning ? <rect x={-400} y={-400} width={2720} height={1480} fill="#8FC8E0" opacity={0.3} style={{ mixBlendMode: 'screen' }} /> : null}
      <Sun x={420} y={600} r={70} t={t} rays />
      <Skyline y={640} seed={21} color="#3A2358" h={150} />
      <Haze y={650} h={260} o={0.35} />
      {/* the school building: two floors, a row of windows each, a red tile band, doors, a balcony rail */}
      <g>
        <rect x={560} y={330} width={1160} height={G - 330} fill="#8A7A74" />
        <rect x={560} y={330} width={1160} height={60} fill="#B8503E" />
        <rect x={560} y={384} width={1160} height={10} fill="#6A3A30" />
        <rect x={1650} y={330} width={70} height={G - 330} fill="#000" opacity={0.18} />
        {[0, 1].map((fl) =>
          Array.from({ length: 8 }).map((_, i) => {
            const x = 600 + i * 140;
            const y = 430 + fl * 190;
            const lit = (i * 3 + fl * 5) % 4 !== 0;
            return (
              <g key={`${fl}-${i}`}>
                <rect x={x} y={y} width={92} height={110} fill="#2A2634" />
                <rect x={x + 4} y={y + 4} width={84} height={102} fill={lit ? '#FFC27A' : '#4A4A68'} opacity={lit ? 0.85 : 0.9} />
                <rect x={x + 44} y={y + 4} width={4} height={102} fill="#2A2634" />
                <rect x={x} y={y + 52} width={92} height={4} fill="#2A2634" />
              </g>
            );
          }),
        )}
        <rect x={560} y={600} width={1160} height={10} fill="#5A4A46" />
        {Array.from({ length: 60 }).map((_, i) => (
          <rect key={i} x={566 + i * 19} y={590} width={3} height={12} fill="#5A4A46" />
        ))}
        <rect x={1050} y={650} width={150} height={180} fill="#3A2C30" />
        <rect x={1062} y={662} width={60} height={168} fill="#FFC27A" opacity={0.8} />
        <rect x={1128} y={662} width={60} height={168} fill="#FFC27A" opacity={0.6} />
        <text x={1125} y={355} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={34} fill="#F6EFE3" opacity={0.9}>TRƯỜNG THPT</text>
      </g>
      {/* ground: paved yard with a painted line, a bench, a bike rack */}
      <rect x={-400} y={G - 4} width={2720} height={400} fill="#6A5A60" />
      <rect x={-400} y={G - 4} width={2720} height={40} fill="#8A7A7A" opacity={0.6} />
      <rect x={-400} y={G + 40} width={2720} height={340} fill="url(#g3fadeDown)" />
      <path d="M -300 900 L 2300 900" stroke="#E8DCC0" strokeWidth={6} opacity={0.5} />
      {/* the flame tree (phượng): a trunk, a wide dark crown, red blossoms, petals falling */}
      <g>
        <path d="M 330 830 Q 320 640 360 520 Q 380 470 410 430" stroke="#2A1C1A" strokeWidth={34} fill="none" strokeLinecap="round" />
        <path d="M 360 560 Q 280 500 190 520" stroke="#2A1C1A" strokeWidth={18} fill="none" strokeLinecap="round" />
        <ellipse cx={380} cy={400} rx={320} ry={150} fill="#2E4A3A" />
        <ellipse cx={240} cy={450} rx={200} ry={100} fill="#3A5A44" />
        <ellipse cx={520} cy={430} rx={210} ry={100} fill="#3A5A44" />
        {Array.from({ length: 70 }).map((_, i) => (
          <circle key={i} cx={100 + rnd(8, i) * 560} cy={290 + rnd(9, i) * 220} r={6 + rnd(10, i) * 10} fill={i % 4 ? '#D9453A' : '#F06A4A'} opacity={0.9} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <circle key={`p${i}`} cx={160 + rnd(5, i) * 420 + Math.sin(t / 20 + i) * 16} cy={470 + (((rnd(6, i) * 360 + t * (1 + rnd(7, i))) % 360))} r={4} fill="#E04A3A" opacity={0.75} />
        ))}
      </g>
      {/* the flagpole */}
      <g>
        <rect x={1790} y={330} width={8} height={500} fill="#CFC8BA" />
        <path d={`M 1798 340 Q ${1850 + Math.sin(t / 12) * 10} ${352} 1900 ${340 + Math.sin(t / 10) * 6} L 1900 ${400 + Math.sin(t / 10) * 6} Q ${1850 + Math.sin(t / 12) * 10} 408 1798 400 Z`} fill="#C2323A" />
        <path d="M 1850 354 l 8 22 l -22 -14 l 28 0 l -22 14 Z" fill="#F2D24A" transform="translate(0 6) scale(0.9)" />
      </g>
      {grad ? (
        <g>
          <rect x={620} y={216} width={1040} height={86} rx={6} fill="#C2323A" stroke="#6A1A22" strokeWidth={5} />
          <text x={1140} y={276} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={58} fill="#F6EFE3">LỄ TỐT NGHIỆP</text>
          <path d="M 620 302 L 620 560 M 1660 302 L 1660 560" stroke="#6A1A22" strokeWidth={5} />
          {Array.from({ length: 9 }).map((_, i) => {
            const bx = 700 + i * 105;
            const by = 560 - Math.sin(t / 22 + i) * 14 - (i % 3) * 36;
            return (
              <g key={i}>
                <path d={`M ${bx} ${by + 40} Q ${bx + 10} ${by + 120} ${bx} 640`} stroke="#CFC8BA" strokeWidth={2} fill="none" />
                <ellipse cx={bx} cy={by} rx={26} ry={32} fill={['#F2B33D', '#D9534F', '#4A86C8', '#5AA05A'][i % 4]} stroke={INK} strokeWidth={3} />
                <path d={`M ${bx - 12} ${by - 14} Q ${bx - 8} ${by - 24} ${bx - 2} ${by - 24}`} stroke="#FFFFFF" strokeWidth={4} fill="none" opacity={0.6} strokeLinecap="round" />
              </g>
            );
          })}
        </g>
      ) : null}
      <LightVeil id={`${id}veil`} lights={[[420, 600, 700], [1125, 740, 420]]} o={veil} />
      <Dust t={t} seed={73} x0={300} y0={420} w={1300} h={400} n={30} o={0.45} />
    </g>
  );
};

/** The lane outside the house in the morning: a lit doorway on the left, an old flatbed truck on the right, the road. */
export const Street: React.FC<{ t: number; id?: string; veil?: number }> = ({ t, id = 'st', veil = 0.3 }) => {
  const G = 800;
  return (
    <g>
      <DuskSky id={`${id}sky`} horizonY={560} />
      <rect x={-400} y={-400} width={2720} height={1480} fill="#9FD0E8" opacity={0.32} style={{ mixBlendMode: 'screen' }} />
      <Sun x={1500} y={540} r={64} t={t} />
      <Skyline y={600} seed={33} color="#3E2A5E" h={140} />
      <Haze y={620} h={240} o={0.4} />
      {/* terraced houses along the back */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={560 + i * 280} y={360 + (i % 2) * 40} width={270} height={G - 360 - (i % 2) * 40} fill={['#7A5A58', '#6A6A72', '#8A6A58', '#5E6A66', '#7A6070'][i]} />
          <rect x={560 + i * 280} y={350 + (i % 2) * 40} width={270} height={20} fill="#3A2A30" />
          <rect x={600 + i * 280} y={430 + (i % 2) * 40} width={70} height={100} fill="#2A2634" />
          <rect x={604 + i * 280} y={434 + (i % 2) * 40} width={62} height={92} fill={i % 2 ? '#FFC27A' : '#4A4A68'} opacity={0.8} />
          <rect x={700 + i * 280} y={560} width={110} height={G - 560} fill="#2E2226" />
        </g>
      ))}
      {/* the family's door on the left: a step, a warm doorway */}
      <rect x={100} y={380} width={380} height={G - 380} fill="#8A6A58" />
      <rect x={100} y={370} width={380} height={24} fill="#3A2A30" />
      <rect x={190} y={470} width={200} height={G - 470} fill="#2A1C1A" />
      <rect x={200} y={480} width={180} height={G - 480} fill="#FFC27A" opacity={0.9} />
      <rect x={170} y={G - 14} width={240} height={14} fill="#B0A090" />
      <Glow x={290} y={640} r={360} o={0.4} />
      {/* the road */}
      <rect x={-400} y={G} width={2720} height={400} fill="#4A4250" />
      <rect x={-400} y={G} width={2720} height={26} fill="#7A6E78" opacity={0.7} />
      <rect x={-400} y={G + 40} width={2720} height={340} fill="url(#g3fadeDown)" />
      <path d="M -300 930 L 2300 930" stroke="#E8DCC0" strokeWidth={8} strokeDasharray="90 70" opacity={0.5} />
      {/* the old truck, nose to the left: cab, flatbed with a tarp and a stack of poles */}
      <g transform="translate(980 0)">
        <ellipse cx={330} cy={G + 28} rx={420} ry={22} fill="#000" opacity={0.4} />
        <rect x={-10} y={G - 280} width={230} height={240} rx={22} fill="#C2553E" stroke={INK} strokeWidth={6} />
        <rect x={20} y={G - 250} width={150} height={110} rx={10} fill="#8FB4C8" stroke={INK} strokeWidth={5} />
        <rect x={-10} y={G - 130} width={230} height={90} fill="#A8452F" />
        <rect x={-30} y={G - 70} width={40} height={36} rx={8} fill="#FFE2B0" />
        <Glow x={-30} y={G - 52} r={200} o={0.4} />
        <rect x={210} y={G - 190} width={480} height={150} fill="#6A4A3A" stroke={INK} strokeWidth={6} />
        <path d={`M 230 ${G - 190} Q 330 ${G - 280} 440 ${G - 230} Q 560 ${G - 290} 670 ${G - 190} Z`} fill="#3E6A7A" stroke={INK} strokeWidth={5} />
        <circle cx={90} cy={G - 10} r={54} fill="#1E1B24" stroke={INK} strokeWidth={6} />
        <circle cx={90} cy={G - 10} r={22} fill="#8E8A98" />
        <circle cx={500} cy={G - 10} r={54} fill="#1E1B24" stroke={INK} strokeWidth={6} />
        <circle cx={500} cy={G - 10} r={22} fill="#8E8A98" />
        <text x={450} y={G - 96} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={34} fill="#F2D58A">XÂY DỰNG</text>
      </g>
      <LightVeil id={`${id}veil`} lights={[[1500, 540, 700], [290, 640, 300]]} o={veil} />
      <Dust t={t} seed={81} x0={200} y0={400} w={1500} h={420} n={30} o={0.4} />
    </g>
  );
};

// ================================================================================================ the workshop
export const WORK = makeRoom({ x: 960, y: 500 }, { x0: 540, x1: 1420, y0: 330, y1: 740 }, 3.4);
/** The electrical training workshop: benches, a wiring board on the wall, spools, tools, a cool tube light and a warm window. */
export const Workshop: React.FC<{ t: number; id?: string; veil?: number; board?: React.ReactNode }> = ({ t, id = 'wk', veil = 0.44, board }) => {
  const R = WORK;
  const { P, Q } = R;
  return (
    <g>
      <RoomShell r={R} id={id} floor="tiles" wall="#46525A" side="#38424A" floorC="#33363C" lines="#24262C" ceiling="#222830" />
      <BackWindow r={R} id={`${id}w`} t={t} x0={1090} x1={1320} y0={380} y1={560} sun={{ x: 1230, y: 552 }} cols={3} curtains={false} />
      {/* the wall board for practice: a plywood panel with a title strip */}
      <g>
        <rect x={680} y={392} width={330} height={196} fill="#2A2E34" stroke={INK} strokeWidth={4} />
        <rect x={684} y={396} width={322} height={30} fill="#C9A23A" />
        <text x={845} y={418} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={20} fill="#2A2420">THỰC HÀNH ĐIỆN</text>
        {board}
      </g>
      {/* pegboard of tools on the left wall: pliers, screwdrivers, a hammer */}
      <polygon points={Q([[0, 0.12, 0.2], [0, 0.12, 0.62], [0, 0.6, 0.62], [0, 0.6, 0.2]])} fill="#5A4A3A" />
      {Array.from({ length: 7 }).map((_, i) => {
        const a = P(0, 0.2 + (i % 4) * 0.1, 0.26 + Math.floor(i / 4) * 0.16);
        return <rect key={i} x={a.x - 4} y={a.y} width={8} height={60 + (i % 3) * 14} rx={3} fill={['#D9534F', '#F2B33D', '#4A86C8', '#CFC8BA'][i % 4]} stroke={INK} strokeWidth={2} />;
      })}
      {/* shelves with cable spools on the right wall */}
      {[0.28, 0.5].map((v, i) => (
        <g key={i}>
          <polygon points={Q([[1, v, 0.1], [1, v, 0.6], [0.95, v, 0.6], [0.95, v, 0.1]])} fill="#6A5240" />
          {Array.from({ length: 4 }).map((_, k) => {
            const sp = P(1, v, 0.16 + k * 0.12);
            return (
              <g key={k}>
                <ellipse cx={sp.x - 18} cy={sp.y - 22} rx={14} ry={22} fill={['#E2753A', '#4A86C8', '#5AA05A', '#D9534F'][(k + i) % 4]} stroke={INK} strokeWidth={2.5} />
              </g>
            );
          })}
        </g>
      ))}
      {/* two workbenches in the middle with stools, a vice and a coil of wire */}
      {[0.12, 0.62].map((u, i) => (
        <g key={i}>
          <FloorShadow r={R} u={[u, u + 0.26]} w={[0.34, 0.54]} o={0.4} />
          <Box r={R} u={[u + 0.01, u + 0.03]} v={[0.76, 1]} w={[0.36, 0.38]} front="#2A2228" />
          <Box r={R} u={[u + 0.23, u + 0.25]} v={[0.76, 1]} w={[0.36, 0.38]} front="#2A2228" />
          <Box r={R} u={[u + 0.01, u + 0.03]} v={[0.76, 1]} w={[0.5, 0.52]} front="#2A2228" />
          <Box r={R} u={[u + 0.23, u + 0.25]} v={[0.76, 1]} w={[0.5, 0.52]} front="#2A2228" />
          <Box r={R} u={[u, u + 0.26]} v={[0.73, 0.76]} w={[0.33, 0.55]} front="#6A4A3A" top="#8A6A4A" side="#4A3226" rim />
          {(() => {
            const c = P(u + 0.05, 0.73, 0.4);
            const v = P(u + 0.2, 0.73, 0.45);
            return (
              <g>
                <ellipse cx={c.x} cy={c.y - 10} rx={26} ry={12} fill="#E2753A" stroke={INK} strokeWidth={3} />
                <ellipse cx={c.x} cy={c.y - 18} rx={26} ry={12} fill="#F09A5A" stroke={INK} strokeWidth={3} />
                <rect x={v.x - 14} y={v.y - 30} width={28} height={30} fill="#5A5A64" stroke={INK} strokeWidth={3} />
                <rect x={v.x - 22} y={v.y - 40} width={44} height={12} fill="#3A3A44" stroke={INK} strokeWidth={3} />
              </g>
            );
          })()}
        </g>
      ))}
      <FloorPlant r={R} u={0.02} w={0.12} size={0.9} />
      <WallLight r={R} u={0} v={0.3} w={0.5} o={0.4} />
      {/* a fire extinguisher by the board and a notice about safety */}
      <rect x={1020} y={500} width={34} height={100} rx={10} fill="#D9453A" stroke={INK} strokeWidth={3} />
      <rect x={1030} y={486} width={14} height={18} fill="#2A2420" />
      {/* the cool strip light on the ceiling */}
      <rect x={720} y={P(0, 0, 0.26).y - 6} width={300} height={10} rx={5} fill="#E8F4FF" />
      <polygon points={Q([[0.2, 0, 0.3], [0.8, 0, 0.3], [0.9, 1, 0.8], [0.1, 1, 0.8]])} fill="#BFD8F2" opacity={0.07} style={{ mixBlendMode: 'screen' }} />
      <Glow x={870} y={P(0, 0, 0.26).y + 20} r={360} o={0.28} kind="cool" />
      <LightVeil id={`${id}veil`} lights={[[870, 420, 560], [1230, 540, 360]]} o={veil} />
      <Glow x={1230} y={540} r={300} o={0.3} />
      <Dust t={t} seed={91} x0={620} y0={420} w={700} h={340} n={26} />
    </g>
  );
};

// ================================================================================ the unfinished building, behind glass
export const BLD = makeRoom({ x: 940, y: 500 }, { x0: 540, x1: 1360, y0: 300, y1: 740 }, 3.2);
/**
 * A floor of a building that is nearly finished: raw concrete, ceiling cable trays, work lights, a stepladder, and on
 * the right-hand back wall a glass wall onto the site (`glass` 0..1 draws the reflections). Beyond the glass the site is
 * drawn from the Site set at half size, with `workers` standing on it.
 */
export const Building: React.FC<{ t: number; id?: string; veil?: number; glass?: number; workers?: { x: number; y?: number; s?: number; look?: keyof typeof LOOKS; yaw?: number }[] }> = ({ t, id = 'bld', veil = 0.46, glass = 1, workers = [] }) => {
  const R = BLD;
  const { P, Q, back: B } = R;
  const gx0 = B.x0 + 40;
  const gx1 = B.x1 - 40;
  const gy0 = B.y0 + 40;
  const gy1 = B.y1 - 20;
  return (
    <g>
      <RoomShell r={R} id={id} floor="tiles" wall="#6A6670" side="#54505A" floorC="#4A464E" lines="#3A363E" ceiling="#3A3640" />
      {/* the glass wall: the site, scaled to fit, clipped to the opening */}
      <defs>
        <clipPath id={`${id}clip`}>
          <rect x={gx0} y={gy0} width={gx1 - gx0} height={gy1 - gy0} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}clip)`}>
        <g transform={`translate(${gx0} ${gy0 - 80}) scale(0.5)`}>
          <Site t={t} id={`${id}s`} bricks={1} workers={workers} veil={0.2} />
        </g>
      </g>
      {/* mullions and the reflection of the room on the glass */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={gx0 + ((gx1 - gx0) * i) / 4 - 5} y={gy0} width={10} height={gy1 - gy0} fill="#2A2830" />
      ))}
      <rect x={gx0 - 6} y={gy0 - 8} width={gx1 - gx0 + 12} height={14} fill="#2A2830" />
      <rect x={gx0 - 6} y={gy1 - 4} width={gx1 - gx0 + 12} height={12} fill="#2A2830" />
      <polygon points={`${gx0},${gy0} ${gx0 + 220},${gy0} ${gx0 + 80},${gy1} ${gx0},${gy1}`} fill="#FFFFFF" opacity={0.07 * glass} />
      <polygon points={`${gx0 + 300},${gy0} ${gx0 + 360},${gy0} ${gx0 + 200},${gy1} ${gx0 + 140},${gy1}`} fill="#FFFFFF" opacity={0.05 * glass} />
      {/* conduit and cable trays along the left wall and the ceiling, bundles hanging down */}
      {[0.14, 0.2, 0.26].map((v, i) => (
        <polygon key={i} points={Q([[0, v, 0], [0, v, 1], [0, v + 0.02, 1], [0, v + 0.02, 0]])} fill={['#8A8E96', '#C9A23A', '#5A8AA8'][i]} />
      ))}
      <polygon points={Q([[0.35, 0.02, 0], [0.4, 0.02, 0], [0.4, 0.02, 1], [0.35, 0.02, 1]])} fill="#8A8E96" />
      {[0.3, 0.55, 0.8].map((w, i) => {
        const a = P(0.375, 0.02, w);
        return (
          <g key={i}>
            <path d={`M ${a.x} ${a.y} Q ${a.x + 10} ${a.y + 60} ${a.x - 6} ${a.y + 110 + i * 14}`} stroke="#1E1B24" strokeWidth={10} fill="none" strokeLinecap="round" />
            <path d={`M ${a.x + 6} ${a.y} Q ${a.x + 22} ${a.y + 50} ${a.x + 12} ${a.y + 96}`} stroke="#C2453E" strokeWidth={4} fill="none" strokeLinecap="round" />
          </g>
        );
      })}
      {/* the stepladder, a toolbox, paint tins, a bundle of conduit on the floor */}
      {(() => {
        const l = P(0.82, 1, 0.5);
        const k = R.s(0.5) / R.s(0.4);
        return (
          <g>
            <ellipse cx={l.x} cy={l.y + 2} rx={90 * k} ry={12 * k} fill="#000" opacity={0.4} />
            <path d={`M ${l.x - 70 * k} ${l.y} L ${l.x - 26 * k} ${l.y - 250 * k} M ${l.x + 70 * k} ${l.y} L ${l.x + 26 * k} ${l.y - 250 * k}`} stroke="#E8B93A" strokeWidth={12 * k} strokeLinecap="round" />
            {[0.2, 0.45, 0.7].map((q, i) => (
              <path key={i} d={`M ${l.x - (70 - 44 * q) * k} ${l.y - 250 * q * k} L ${l.x + (70 - 44 * q) * k} ${l.y - 250 * q * k}`} stroke="#E8B93A" strokeWidth={9 * k} />
            ))}
          </g>
        );
      })()}
      {(() => {
        const b = P(0.2, 1, 0.6);
        const k = R.s(0.6) / R.s(0.4);
        return (
          <g>
            <ellipse cx={b.x + 6} cy={b.y + 2} rx={70 * k} ry={10 * k} fill="#000" opacity={0.4} />
            <rect x={b.x - 56 * k} y={b.y - 56 * k} width={112 * k} height={56 * k} rx={6 * k} fill="#C2453E" stroke={INK} strokeWidth={4} />
            <rect x={b.x - 56 * k} y={b.y - 58 * k} width={112 * k} height={14 * k} rx={6 * k} fill="#8A2A24" />
            <path d={`M ${b.x - 20 * k} ${b.y - 58 * k} Q ${b.x} ${b.y - 82 * k} ${b.x + 20 * k} ${b.y - 58 * k}`} stroke={INK} strokeWidth={6} fill="none" />
          </g>
        );
      })()}
      {/* work lights: bare bulbs in cages, one hanging from the ceiling, one on a tripod */}
      <Pendant r={R} u={0.5} w={0.4} v={0.2} t={t} cone={0.3} glow={0.5} />
      <Pendant r={R} u={0.22} w={0.75} v={0.2} t={t + 12} cone={0.2} glow={0.4} />
      <LightVeil id={`${id}veil`} lights={[pendantLight(R, 0.5, 0.4, 0.2), pendantLight(R, 0.22, 0.75, 0.2), [P(0.5, 0.4, 0).x, P(0.5, 0.4, 0).y, 520]]} o={veil} />
      <Dust t={t} seed={13} x0={640} y0={380} w={640} h={340} n={26} />
    </g>
  );
};

// ================================================================================================ the bus at dusk
/** Inside a bus: seat backs in the foreground, a window onto the dusk city sliding by, a handrail, warm interior light. */
export const Bus: React.FC<{ t: number; id?: string; veil?: number }> = ({ t, id = 'bus', veil = 0.4 }) => {
  const sc = t * 5;
  return (
    <g>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#241C2E" />
      {/* the long window with the evening going past */}
      <defs>
        <clipPath id={`${id}clip`}>
          <rect x={300} y={180} width={1320} height={470} rx={20} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}clip)`}>
        <DuskSky id={`${id}sky`} horizonY={560} />
        <g transform={`translate(${-(sc % 1800)} 0)`}>
          {[0, 1].map((k) => (
            <g key={k} transform={`translate(${k * 1800} 0)`}>
              <Skyline y={650} seed={50} color="#3A2358" h={220} />
            </g>
          ))}
        </g>
        <g transform={`translate(${-((sc * 2.2) % 1800)} 0)`}>
          {[0, 1].map((k) => (
            <g key={k} transform={`translate(${k * 1800} 0)`}>
              <Skyline y={700} seed={57} color="#22163A" h={160} />
              {Array.from({ length: 6 }).map((_, i) => (
                <g key={i}>
                  <rect x={120 + i * 290} y={480} width={6} height={220} fill="#1A1226" />
                  <circle cx={123 + i * 290} cy={480} r={9} fill="#FFE2B0" />
                  <Glow x={123 + i * 290} y={484} r={80} o={0.5} />
                </g>
              ))}
            </g>
          ))}
        </g>
        <Sun x={1380} y={600} r={52} t={t} />
        <Haze y={640} h={200} o={0.35} />
      </g>
      <rect x={290} y={170} width={1340} height={20} rx={8} fill="#120E18" />
      <rect x={290} y={640} width={1340} height={26} rx={8} fill="#120E18" />
      {[300, 740, 1180, 1610].map((x) => (
        <rect key={x} x={x - 8} y={170} width={16} height={496} fill="#120E18" />
      ))}
      <path d="M 280 666 L 1640 666" stroke={'#FFB46A'} strokeWidth={3} opacity={0.4} />
      {/* handrail and hanging straps */}
      <path d="M 200 120 L 1720 120" stroke="#9AA3AB" strokeWidth={14} strokeLinecap="round" />
      <path d="M 200 120 L 1720 120" stroke="#FFFFFF" strokeWidth={3} opacity={0.5} />
      {[420, 700, 1260, 1500].map((x, i) => (
        <g key={x} transform={`rotate(${Math.sin(t / 14 + i) * 4} ${x} 120)`}>
          <path d={`M ${x} 120 L ${x} 250`} stroke="#3A3846" strokeWidth={8} />
          <circle cx={x} cy={276} r={26} fill="none" stroke="#E8DCC0" strokeWidth={9} />
        </g>
      ))}
      {/* the floor and a seat row at the bottom: bench seat in dark red leatherette */}
      <rect x={-400} y={850} width={2720} height={400} fill="#18121C" />
      <rect x={200} y={700} width={1500} height={150} rx={30} fill="#7A3A44" stroke={INK} strokeWidth={5} />
      <rect x={200} y={700} width={1500} height={34} rx={20} fill="#A04A56" />
      <rect x={200} y={826} width={1500} height={24} fill="#4A222A" />
      <Glow x={960} y={170} r={700} o={0.3} />
      <LightVeil id={`${id}veil`} lights={[[960, 400, 900]]} o={veil} />
    </g>
  );
};
