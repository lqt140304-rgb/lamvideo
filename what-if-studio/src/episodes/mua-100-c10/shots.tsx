import React from 'react';
import {
  Hero, kf, rnd, camT, LOOKS, stand, LivingRoom, LIVING, makeRoom, RoomShell, Box, FloorShadow, Alley, alleyP, Dog, CloudBank, Glow, LightVeil, Wheelbarrow, ShotProps,
} from '../../engine';
import { Plant, NoticeBoard, ShoeRack } from '../../engine/sets/school';
import { ArmHand } from '../../engine/hands';
import { LEG_LEN } from '../../engine/rig';
import { P, talkAt, ShopFront } from '../mua-100-c01/shots';
import { sit, Duffel, Bundle } from '../mua-100-c03/shots';
import { Photo, SH } from '../mua-100-c05/shots';
import { Corridor, Tanks, Jerry, Bowl, HELPER, Room } from '../mua-100-c06/shots';
import { Notebook, Bird } from '../mua-100-c07/shots';
import { S31 as RollCall8, S41 as Blanket8 } from '../mua-100-c08/shots';
import { Sky, Outside, Steps } from '../mua-100-c09/shots';

// Cảnh 10 — Sau khi mưa tạnh: cơn mưa kết thúc, công việc còn lại. The move to the community hall on the checked high
// route while the low path is closed; An's crew gives up the big tank to keep the group on time; Linh in the yellow
// raincoat waits on the bench by the door until he walks in with the bowl from the storm night. That night the water
// takes the low road by the old school. Then the first sun on her open palm, the damage it shows, the alley being dug
// out, the mud line at 0,80 m in the living room, the warped photo frame. They do not move back yet: test beds behind
// the hall, a new line in the notebook, the frame repaired slowly at the end table, the shelter team's list of what to
// change. The closing thoughts reuse the moments that carried them (the dry blanket, the roll call) and end on the
// frame still crooked, Linh holding the ruler, a bird under the eave.

const AN = LOOKS.an;
const HANH = LOOKS.hanh;
const LINH = LOOKS.linh;
const SAU = LOOKS.baSau;
const NAM = LOOKS.nam;
const TAN = (l: typeof LOOKS.an, c: string) => ({ ...l, skin: c, skinShade: c, hand: c });
const EXTRA = [TAN(LOOKS.mom, '#E2B48C'), LOOKS.mo, TAN(LOOKS.student, '#D9A880'), TAN(LOOKS.tech, '#E6B98F')];
const RAINCOAT = { ...LINH, jacket: '#F2C230', jacketShade: '#D4A020' };
const L = '#16141C';
const FONT = 'Comic Sans MS, Comic Sans, cursive';
const MUD = '#8A6E4A';
const onFloor = (floor: number, scale: number) => floor - LEG_LEN * scale;
/** Emotional close: start wide on the person, end tight on the face. */
const push = (t: number, len: number, x: number, z1 = 2.7) => camT(x, kf(t, [[0, 560], [len, 470]]), kf(t, [[0, 1.9], [len, z1]]));
const squat = (floor: number, sc: number) => ({ y: floor - 58 * sc, legL: { a: 88, b: -130 }, legR: { a: 76, b: -130 } });
const walk = (t: number, ph = 0, a = 20) => ({ legL: { a: a * Math.sin(t * 0.45 + ph), b: -14 }, legR: { a: -a * Math.sin(t * 0.45 + ph), b: -14 } });
const swing = (t: number, ph = 0) => ({ armL: { a: 14 * Math.sin(t * 0.45 + ph + Math.PI), b: 14 }, armR: { a: 14 * Math.sin(t * 0.45 + ph), b: 14 } });

// ================================================================ the community hall
/** The hall: wooden walls, a wide door on the left wall, the bench beside it, mats round the middle, the end table at the back right. */
const HALL = makeRoom({ x: 960, y: 470 }, { x0: 380, x1: 1540, y0: 230, y1: 720 }, 3.0);
const benchTop = (w: number) => HALL.P(0.06, 0.8, w).y;
/** Someone sitting on the bench by the door at depth w, facing into the room. */
const onBench = (w: number, k = 1) => {
  const s = stand(HALL, 0.05, w);
  const sc = s.scale * k;
  return { x: HALL.P(0.05, 1, w).x, y: benchTop(w) - 12 * sc, scale: sc };
};
const Hall: React.FC<{ t: number; id: string; night?: number; sun?: number; mats?: boolean }> = ({ t, id, night = 0, sun = 0, mats = true }) => {
  const r = HALL;
  const { P, Q } = r;
  const k = r.s(0.5) / r.s(0) * 0.42;
  const day = night < 0.5;
  const mat = (u0: number, u1: number, w0: number, w1: number, c: string) => <polygon points={Q([[u0, 1, w0], [u1, 1, w0], [u1, 1, w1], [u0, 1, w1]])} fill={c} stroke="#5A4A2E" strokeWidth={3} />;
  const lamp = P(0.5, 0.12, 0.45);
  return (
    <g>
      <RoomShell r={r} id={id} floor="boards" wall="#D8C49A" side="#C2AC82" floorC="#9A7A54" ceiling="#5A4A3A" lines="#5A4630" />
      {/* the window on the back wall and the banner */}
      <rect x={P(0.62, 0, 0).x} y={P(0, 0.24, 0).y} width={P(0.92, 0, 0).x - P(0.62, 0, 0).x} height={P(0, 0.56, 0).y - P(0, 0.24, 0).y} fill={day ? '#B8D0DC' : '#1E2A3A'} stroke="#6A4A2E" strokeWidth={10} />
      <path d={`M ${P(0.77, 0, 0).x} ${P(0, 0.24, 0).y} L ${P(0.77, 0, 0).x} ${P(0, 0.56, 0).y}`} stroke="#6A4A2E" strokeWidth={8} />
      <rect x={P(0.12, 0, 0).x} y={P(0, 0.08, 0).y} width={P(0.52, 0, 0).x - P(0.12, 0, 0).x} height={44} fill="#B5604F" />
      <text x={(P(0.12, 0, 0).x + P(0.52, 0, 0).x) / 2} y={P(0, 0.08, 0).y + 32} fontFamily={FONT} fontSize={28} textAnchor="middle" fill="#F4ECD8">NHÀ SINH HOẠT CỘNG ĐỒNG</text>
      <NoticeBoard x={P(0.3, 0, 0).x} y={P(0, 0.4, 0).y} s={0.6} />
      {/* the wide door on the left wall: daylight, or the night */}
      <polygon points={Q([[0, 0.28, 0.52], [0, 1, 0.52], [0, 1, 0.8], [0, 0.28, 0.8]])} fill={day ? '#F4EAD0' : '#141A26'} stroke="#6A4A2E" strokeWidth={10} />
      {sun > 0 ? <polygon points={Q([[0, 1, 0.52], [0, 1, 0.8], [0.06 + 0.4 * sun, 1, 0.92], [0.06 + 0.4 * sun, 1, 0.6]])} fill="#FFE6A0" opacity={0.55} style={{ mixBlendMode: 'screen' }} /> : null}
      {/* the bench beside the door */}
      <FloorShadow r={r} u={[0, 0.07]} w={[0.22, 0.5]} />
      <Box r={r} u={[0, 0.06]} v={[0.8, 0.84]} w={[0.22, 0.5]} front="#8A6440" top="#A07A50" side="#6E4C30" rim />
      {[0.24, 0.48].map((w) => <Box key={w} r={r} u={[0.005, 0.05]} v={[0.84, 1]} w={[w, w + 0.02]} front="#6E4C30" side="#5A3E26" />)}
      {/* a second bench on the near side of the door */}
      <Box r={r} u={[0, 0.06]} v={[0.8, 0.84]} w={[0.84, 0.99]} front="#8A6440" top="#A07A50" side="#6E4C30" rim />
      {/* the end table at the back right, with two chairs */}
      <FloorShadow r={r} u={[0.62, 0.92]} w={[0.06, 0.2]} />
      <Box r={r} u={[0.62, 0.92]} v={[0.72, 0.76]} w={[0.06, 0.2]} front="#7E5A3A" top="#94704E" side="#6A4A2E" rim />
      {[0.63, 0.9].map((u) => <Box key={u} r={r} u={[u, u + 0.015]} v={[0.76, 1]} w={[0.07, 0.09]} front="#5A3E26" />)}
      {mats ? (
        <g>
          {mat(0.22, 0.48, 0.3, 0.62, '#C8A860')}
          {mat(0.52, 0.8, 0.3, 0.62, '#B89A58')}
          {mat(0.3, 0.7, 0.68, 0.95, '#A88E50')}
          <Duffel x={P(0.5, 1, 0.45).x} y={P(0.5, 1, 0.45).y} s={k} />
          <Bundle x={P(0.82, 1, 0.5).x} y={P(0.82, 1, 0.5).y} s={k} c="#4F7486" />
        </g>
      ) : null}
      <ShoeRack x={P(0.12, 1, 0.03).x} y={P(0.12, 1, 0.03).y} s={r.s(0.03) / r.s(0) * 0.42} />
      <Plant x={P(0.55, 1, 0.03).x} y={P(0.55, 1, 0.03).y} s={r.s(0.03) / r.s(0) * 0.42} t={t} tall />
      <Plant x={P(0.97, 1, 0.7).x} y={P(0.97, 1, 0.7).y} s={r.s(0.7) / r.s(0) * 0.36} t={t} seed={8} />
      {day ? <Glow x={P(0.5, 0.2, 0.4).x} y={P(0.5, 0.2, 0.4).y} r={800} o={0.35} /> : null}
      {!day ? (
        <g>
          <circle cx={lamp.x} cy={lamp.y} r={14} fill="#FFF4D0" />
          <LightVeil id={`${id}v`} lights={[[lamp.x, lamp.y + 120, 620], [P(0.04, 0.6, 0.66).x, P(0.04, 0.6, 0.66).y, 260]]} o={0.78 * night} />
        </g>
      ) : null}
    </g>
  );
};

// ================================================================ outside pieces
/** The checked high route: a ridge road between green slopes; the low branch down to the street, closed and under water. */
const HighRoad: React.FC<{ t: number; bar?: number }> = ({ t, bar = 1 }) => (
  <g>
    <Sky t={t} clear={0.45} />
    <path d="M -400 520 Q 400 430 1100 500 Q 1700 460 2320 520 L 2320 1500 L -400 1500 Z" fill="#6E8A5A" />
    <path d="M -400 760 Q 900 700 2320 720 L 2320 840 Q 900 820 -400 880 Z" fill="#C8B890" stroke="#8A7A58" strokeWidth={5} />
    {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={-300 + i * 300} y={700 - i * 2} width={14} height={70} fill="#E8E0CC" stroke="#6A6A6A" strokeWidth={3} />)}
    {/* the low branch, going down to the brown water, closed */}
    <path d="M 1500 840 L 1700 840 L 2100 1300 L 1700 1300 Z" fill="#B8A880" />
    <rect x={1500} y={1060} width={900} height={500} fill={MUD} opacity={0.92} />
    <path d={`M 1500 1060 Q 1800 ${1054 + 5 * Math.sin(t * 0.1)} 2320 1060`} stroke="#B49A70" strokeWidth={6} fill="none" />
    <g opacity={bar}>
      <rect x={1520} y={880} width={260} height={22} fill="#E8E0CC" stroke={L} strokeWidth={3} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={1530 + i * 64} y={880} width={32} height={22} fill="#C8322A" />)}
      {[1530, 1760].map((x) => <rect key={x} x={x} y={880} width={10} height={80} fill="#4A4A4A" />)}
    </g>
  </g>
);

/** A flat two-wheeled cart with a crate; `jolt` rocks it against the step it is stuck on. */
const Cart: React.FC<{ x: number; y: number; s?: number; jolt?: number }> = ({ x, y, s = 1, jolt = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${-4 * jolt})`}>
    <rect x={-170} y={-70} width={340} height={26} rx={4} fill="#6E7A86" stroke={L} strokeWidth={5} />
    <rect x={-140} y={-170} width={200} height={100} fill="#B8905A" stroke={L} strokeWidth={5} />
    <path d="M -140 -120 L 60 -120" stroke="#8A6A40" strokeWidth={5} />
    <rect x={80} y={-150} width={70} height={80} fill="#3F6E9A" stroke={L} strokeWidth={4} />
    <path d="M 170 -60 L 260 -150" stroke="#4A4A4A" strokeWidth={12} strokeLinecap="round" />
    {[-110, 110].map((dx) => <g key={dx}><circle cx={dx} cy={-14} r={34} fill="#2A2A2E" stroke={L} strokeWidth={4} /><circle cx={dx} cy={-14} r={10} fill="#8A8A8A" /></g>)}
  </g>
);

/** The yard behind the old school: sky, wall, ground. */
const Yard: React.FC<{ t: number; clear?: number }> = ({ t, clear = 0.4 }) => (
  <g>
    <Sky t={t} clear={clear} />
    <rect x={-400} y={420} width={2720} height={360} fill="#E2D6A8" stroke="#6A5E3E" strokeWidth={6} />
    {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={-200 + i * 420} y={480} width={180} height={140} fill="#8E9AA4" stroke="#6A5E3E" strokeWidth={5} />)}
    <rect x={-400} y={780} width={2720} height={700} fill="#B8AC88" />
    {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M ${-400 + i * 300} 780 L ${-600 + i * 360} 1480`} stroke="#9A8E6E" strokeWidth={3} />)}
  </g>
);

/** What the light shows: a leaning, broken fence; a torn awning caught in a tree; a mud yard; a bicycle on its side. */
const Aftermath: React.FC<{ t: number; clear?: number }> = ({ t, clear = 0.8 }) => (
  <g>
    <Sky t={t} clear={clear} />
    <path d="M -400 560 Q 500 500 1200 540 Q 1800 520 2320 560 L 2320 1500 L -400 1500 Z" fill="#7E8A64" />
    <rect x={-400} y={680} width={2720} height={820} fill={MUD} />
    {[[300, 900, 160], [1100, 1000, 220], [1700, 860, 120]].map(([x, y, w], i) => <ellipse key={i} cx={x} cy={y} rx={w} ry={w * 0.18} fill="#9AA8B2" opacity={0.6} />)}
    {/* the fence, leaning then down */}
    {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={-260 + i * 110} y={520} width={22} height={200} fill="#8A6A44" stroke={L} strokeWidth={3} transform={`rotate(${i < 4 ? 18 + i * 4 : 74} ${-250 + i * 110} 720)`} />)}
    <path d="M -280 600 L 200 640" stroke="#7A5A38" strokeWidth={16} transform="rotate(16 -280 700)" />
    {/* the tree, the torn awning on its branch */}
    <path d="M 1560 720 L 1580 220 M 1574 360 Q 1380 300 1220 330 M 1578 300 Q 1700 220 1820 240" stroke="#5A4128" strokeWidth={34} fill="none" strokeLinecap="round" />
    {Array.from({ length: 7 }).map((_, i) => <circle key={i} cx={1460 + i * 70} cy={210 + 30 * Math.sin(i)} r={70} fill="#5E7E3E" opacity={0.9} />)}
    <path d={`M 1240 330 L 1420 316 L 1400 ${470 + 10 * Math.sin(t * 0.12)} L 1330 430 L 1300 ${520 + 12 * Math.sin(t * 0.1 + 1)} L 1250 450 Z`} fill="#3A7482" stroke="#245A64" strokeWidth={4} />
    {/* the bicycle on its side, one wheel up out of the mud */}
    <g transform="translate(900 820)">
      <circle cx={-90} cy={20} r={70} fill="none" stroke="#2A2A2E" strokeWidth={9} opacity={0.5} />
      <circle cx={110} cy={-30} r={70} fill="none" stroke="#2A2A2E" strokeWidth={9} />
      {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M 110 -30 l ${70 * Math.cos(i + t * 0.01)} ${70 * Math.sin(i + t * 0.01)}`} stroke="#6A6A6A" strokeWidth={3} />)}
      <path d="M -90 20 L 10 -40 L 110 -30 M 10 -40 L -30 -90 M -50 -90 L 0 -92" stroke="#C8322A" strokeWidth={10} fill="none" strokeLinecap="round" />
      <rect x={-240} y={20} width={480} height={80} fill={MUD} />
    </g>
  </g>
);

/** Mud left on the wall: the stained band below the line at `line` (y), with its dark tide mark. */
const MudWall: React.FC<{ line: number; children?: React.ReactNode }> = ({ line, children }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#D8C8A0" />
    {children}
    <path d={`M -400 ${line} ${Array.from({ length: 30 }).map((_, i) => `L ${-400 + i * 100} ${line + 8 * Math.sin(i * 1.7)}`).join(' ')} L 2320 ${line} L 2320 1500 L -400 1500 Z`} fill="#8A7458" opacity={0.55} />
    <path d={`M -400 ${line} ${Array.from({ length: 30 }).map((_, i) => `L ${-400 + i * 100} ${line + 8 * Math.sin(i * 1.7)}`).join(' ')}`} stroke="#5E4A30" strokeWidth={10} fill="none" />
  </g>
);

/** A wooden chair seen from the front, its back across the frame. */
const ChairBack: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-200} y={-300} width={40} height={600} fill="#B8905A" stroke={L} strokeWidth={5} />
    <rect x={160} y={-300} width={40} height={600} fill="#B8905A" stroke={L} strokeWidth={5} />
    {[0, 1, 2].map((i) => <rect key={i} x={-170} y={-260 + i * 90} width={340} height={40} fill="#C8A06A" stroke={L} strokeWidth={4} />)}
    <rect x={-230} y={300} width={460} height={40} fill="#A88050" stroke={L} strokeWidth={5} />
  </g>
);

/** The photo frame: wood, the photo in it, one corner warped (`bend` 0..1), mud on it (`mud` 0..1). */
const Frame: React.FC<{ x: number; y: number; s?: number; r?: number; bend?: number; mud?: number; photo?: boolean }> = ({ x, y, s = 1, r = 0, bend = 1, mud = 0, photo = true }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <polygon points={`-190,-150 190,-150 ${190 + 26 * bend},${150 - 30 * bend} -190,150`} fill="#8A5A36" stroke={L} strokeWidth={6} />
    <polygon points={`-160,-120 160,-120 ${162 + 20 * bend},${120 - 26 * bend} -160,120`} fill="#3A2A20" />
    {photo ? <Photo x={0} y={0} s={1.0} r={0} /> : null}
    {mud > 0 ? <path d="M -190 60 Q -60 30 60 70 Q 140 90 190 70 L 190 150 L -190 150 Z" fill={MUD} opacity={0.75 * mud} /> : null}
  </g>
);

/** The community hall from its yard: the building on its higher ground, the drying line, the test beds behind. */
const HallOutside: React.FC<{ t: number; sprouts?: number; laundry?: boolean }> = ({ t, sprouts = 0, laundry = true }) => (
  <g>
    <Sky t={t} clear={0.9} />
    <path d="M -400 520 Q 400 460 1100 500 Q 1700 470 2320 520 L 2320 1500 L -400 1500 Z" fill="#6E8A5A" />
    <rect x={120} y={300} width={980} height={380} fill="#E2CFA0" stroke="#6A5E3E" strokeWidth={6} />
    <polygon points="80,310 610,170 1140,310" fill="#3E6E8A" stroke="#2A4A5E" strokeWidth={6} />
    <rect x={500} y={460} width={220} height={220} fill="#6A4A2E" />
    {[200, 850].map((x) => <rect key={x} x={x} y={380} width={160} height={120} fill="#B8D0DC" stroke="#6A5E3E" strokeWidth={5} />)}
    <rect x={-400} y={680} width={2720} height={800} fill="#C8BC94" />
    {laundry ? (
      <g>
        <path d="M 1160 520 Q 1500 560 1900 520" stroke="#4A4A4A" strokeWidth={4} fill="none" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(${1220 + i * 130} ${540 + 6 * Math.sin(i)}) rotate(${6 * Math.sin(t * 0.08 + i)})`}>
            <rect x={-40} y={0} width={80} height={90 + (i % 2) * 20} fill={['#5F7E96', '#E8E0CC', '#C8503C', '#E0B040', '#3F8A7C'][i]} stroke={L} strokeWidth={3} />
          </g>
        ))}
        {[1160, 1900].map((x) => <rect key={x} x={x - 8} y={510} width={16} height={180} fill="#5A4128" />)}
      </g>
    ) : null}
    <Beds x={1500} y={900} s={0.7} sprouts={sprouts} t={t} />
  </g>
);

/** Raised test beds of dark soil; `sprouts` 0..1 how many of the sown seeds have come up (never all). */
const Beds: React.FC<{ x: number; y: number; s?: number; sprouts?: number; t: number }> = ({ x, y, s = 1, sprouts = 0, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2].map((r) => (
      <g key={r}>
        <rect x={-560} y={-260 + r * 170} width={1120} height={110} rx={14} fill="#4E3A26" stroke="#2E2216" strokeWidth={5} />
        {Array.from({ length: 12 }).map((_, i) => {
          const up = rnd(r + 3, i) < 0.62 && rnd(r + 7, i) < sprouts * 1.4;
          const h = 30 * Math.min(1, sprouts * 1.6) * (0.6 + 0.4 * rnd(r, i));
          const cx = -500 + i * 90;
          const cy = -220 + r * 170;
          return up ? (
            <g key={i} transform={`translate(${cx} ${cy}) rotate(${3 * Math.sin(t * 0.06 + i)})`}>
              <path d={`M 0 0 L 0 ${-h}`} stroke="#6E9A3A" strokeWidth={4} />
              <ellipse cx={-9} cy={-h} rx={10} ry={5} fill="#7EB04A" transform={`rotate(-25 -9 ${-h})`} />
              <ellipse cx={9} cy={-h} rx={10} ry={5} fill="#7EB04A" transform={`rotate(25 9 ${-h})`} />
            </g>
          ) : <circle key={i} cx={cx} cy={cy} r={5} fill="#3A2A1A" />;
        })}
      </g>
    ))}
  </g>
);

/** The shelter team's sheet of what to change, lines appearing with `k` (0..5). */
const ChangeList: React.FC<{ k: number }> = ({ k }) => {
  const rows: [string, string][] = [
    ['Đồ dự phòng: cất cao hơn', '#2A2A2A'],
    ['Người khó đi lại: hỗ trợ sớm', '#2A2A2A'],
    ['Tin chuyển chỗ: tới từng người', '#2A2A2A'],
    ['Đã làm tốt: điểm danh, nước sạch ✓', '#3E8A4E'],
    ['Lần sau làm khác: dụng cụ chuyển sớm', '#C8322A'],
  ];
  return (
    <g>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#7A5A3A" />
      <rect x={300} y={110} width={1320} height={860} rx={8} fill="#F4F0E4" stroke="#8A7A58" strokeWidth={8} />
      <text x={380} y={220} fontFamily={FONT} fontSize={56} fill="#2E5E9A">Cần thay đổi</text>
      {rows.map(([s, c], i) => (
        <text key={i} x={380} y={340 + i * 120} fontFamily={FONT} fontSize={46} fill={c} opacity={Math.max(0, Math.min(1, k - i))}>{s}</text>
      ))}
      <Glow x={960} y={300} r={900} o={0.3} />
    </g>
  );
};

/** A plain wooden ruler, with marks. */
const Ruler: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-400} y={-30} width={800} height={60} fill="#E8C878" stroke={L} strokeWidth={4} />
    {Array.from({ length: 41 }).map((_, i) => <path key={i} d={`M ${-390 + i * 19.5} -30 l 0 ${i % 5 ? 14 : 26}`} stroke="#3A2A1A" strokeWidth={3} />)}
  </g>
);

/** The end table, close: the warped frame lying flat, a small wedge of wood, a ruler, hands at work. */
const TableTop: React.FC<{ t: number; wedge?: number; children?: React.ReactNode }> = ({ t, wedge = 0, children }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#7E5A3A" />
    {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M -400 ${-200 + i * 180} L 2320 ${-180 + i * 180}`} stroke="#6A4A2E" strokeWidth={5} />)}
    <Glow x={960} y={300} r={900} o={0.4} />
    <Frame x={960} y={540} s={1.6} bend={1 - 0.6 * wedge} photo={false} />
    {wedge > 0 ? <polygon points={`${1250 - 40 * (1 - wedge)},700 1330,690 1330,720`} fill="#E0C08A" stroke={L} strokeWidth={4} /> : null}
    {children}
  </g>
);

/** A savanna: warm sky, low sun, far hills, an acacia, grass tufts, bare ground. */
const Savanna: React.FC<{ t: number; children?: React.ReactNode }> = ({ t, children }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1700} fill="#F2D9A0" />
    <rect x={-400} y={-400} width={2720} height={700} fill="#E8B87A" opacity={0.55} />
    <circle cx={1500} cy={330} r={120} fill="#FFF0C0" opacity={0.9} />
    <circle cx={1500} cy={330} r={210} fill="#FFE2A0" opacity={0.3} />
    <path d="M -400 640 Q 200 500 700 600 Q 1200 480 1800 600 Q 2100 560 2320 620 L 2320 800 L -400 800 Z" fill="#B8935E" opacity={0.7} />
    <path d="M -400 700 Q 400 640 1000 690 Q 1700 640 2320 700 L 2320 900 L -400 900 Z" fill="#C8A86A" />
    {/* an acacia */}
    <g transform="translate(300 700)">
      <path d="M 0 0 L 10 -190 M 10 -190 Q -60 -230 -150 -210 M 10 -190 Q 90 -250 190 -220" stroke="#4A3320" strokeWidth={16} fill="none" strokeLinecap="round" />
      <ellipse cx={20} cy={-250} rx={210} ry={44} fill="#6E8A3A" stroke="#44582A" strokeWidth={4} />
      <ellipse cx={-90} cy={-225} rx={110} ry={26} fill="#7E9A44" />
    </g>
    <rect x={-400} y={880} width={2720} height={500} fill="#C09A5C" />
    {Array.from({ length: 26 }).map((_, i) => {
      const x = -300 + i * 100 + 40 * Math.sin(i * 2.3);
      const y = 900 + 90 * Math.abs(Math.sin(i * 1.7));
      return <path key={i} d={`M ${x} ${y} l -10 -34 M ${x} ${y} l 2 -44 M ${x} ${y} l 12 -32`} stroke="#8E8A42" strokeWidth={4} strokeLinecap="round" transform={`rotate(${3 * Math.sin(t * 0.05 + i)} ${x} ${y})`} />;
    })}
    {children}
  </g>
);
/** An elephant, side-on, facing right, feet on y = 0 at (x, y). */
const Elephant: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  const step = (ph: number) => 14 * Math.sin(t * 0.09 + ph);
  const GR = '#8F8B90';
  const GD = '#767278';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={20} cy={8} rx={330} ry={26} fill="#000" opacity={0.22} />
      {/* far legs */}
      {[-150, 120].map((dx, i) => <g key={`f${i}`} transform={`translate(${dx - 20} 0) rotate(${step(i * 3.1 + 1.5) * 0.4} ${dx} -150)`}><rect x={-34} y={-170} width={70} height={170} rx={24} fill={GD} stroke="#3A3640" strokeWidth={5} /><path d="M -28 -12 h 56" stroke="#E8E0D0" strokeWidth={8} strokeLinecap="round" /></g>)}
      <g transform="translate(0 -70)">
      {/* tail */}
      <path d="M -270 -250 Q -330 -200 -318 -120" stroke={GR} strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d="M -318 -124 q -14 26 4 40 q 12 -16 6 -40 Z" fill="#4A4650" />
      {/* body */}
      <ellipse cx={-10} cy={-240} rx={290} ry={178} fill={GR} stroke="#3A3640" strokeWidth={6} />
      <path d="M -180 -330 Q -60 -400 90 -350 M -230 -250 Q -120 -300 -40 -270" stroke={GD} strokeWidth={5} fill="none" opacity={0.55} />
      {/* near legs */}
      {[-90, 180].map((dx, i) => <g key={`n${i}`} transform={`translate(${dx - 20} 0) rotate(${step(i * 3.1) * 0.4} ${dx} -150)`}><rect x={-38} y={-180} width={78} height={180} rx={26} fill={GR} stroke="#3A3640" strokeWidth={5} /><path d="M -32 -14 h 64" stroke="#E8E0D0" strokeWidth={9} strokeLinecap="round" /><path d="M -20 -60 q 20 8 40 0 M -20 -100 q 20 8 40 0" stroke={GD} strokeWidth={4} fill="none" /></g>)}
      {/* head, ear, trunk, tusk */}
      <g transform={`translate(0 ${3 * Math.sin(t * 0.09)})`}>
        <ellipse cx={170} cy={-300} rx={96} ry={134} fill={GD} stroke="#3A3640" strokeWidth={5} transform={`rotate(${6 * Math.sin(t * 0.12)} 190 -360)`} />
        <ellipse cx={176} cy={-300} rx={64} ry={104} fill="#B88E9A" opacity={0.7} transform={`rotate(${6 * Math.sin(t * 0.12)} 190 -360)`} />
        <ellipse cx={290} cy={-290} rx={118} ry={122} fill={GR} stroke="#3A3640" strokeWidth={6} />
        <path d={`M 360 -250 Q 430 -230 424 -130 Q 420 -50 ${380 + 16 * Math.sin(t * 0.1)} -20 q -30 -4 -22 -26 q 14 -10 6 -50 Q 360 -170 340 -210`} fill={GR} stroke="#3A3640" strokeWidth={6} />
        {[-190, -150, -110, -70].map((ty) => <path key={ty} d={`M ${356 + (ty + 190) * 0.12} ${ty} q 36 10 70 0`} stroke={GD} strokeWidth={4} fill="none" />)}
        <path d="M 340 -218 Q 430 -190 470 -110 Q 446 -150 396 -176 Z" fill="#F4EEDC" stroke="#8A8070" strokeWidth={4} />
        <circle cx={318} cy={-322} r={11} fill="#16141C" />
        <circle cx={321} cy={-326} r={3.5} fill="#fff" />
        <path d="M 296 -352 q 22 -14 42 -4" stroke="#3A3640" strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
      </g>
    </g>
  );
};
/** A brown bear on its hind legs, facing the viewer, forepaws up with their claws. */
const Bear: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  const BR = '#6A4A30';
  const BD = '#4E3522';
  const sw = 6 * Math.sin(t * 0.1);
  const paw = (side: number) => (
    <g transform={`translate(${side * 250} ${-470 + sw * side}) rotate(${side * 26})`}>
      <path d={`M ${-side * 70} 150 Q ${-side * 40} 30 0 0`} stroke={BR} strokeWidth={96} strokeLinecap="round" fill="none" />
      <ellipse cx={0} cy={-20} rx={70} ry={62} fill={BR} stroke="#2E2014" strokeWidth={5} />
      {[-42, -14, 14, 42].map((dx, i) => <g key={dx}><ellipse cx={dx} cy={-70 + (i % 3 ? 0 : -8)} rx={17} ry={22} fill={BR} stroke="#2E2014" strokeWidth={4} /><path d={`M ${dx - 8} ${-86 + (i % 3 ? 0 : -8)} Q ${dx + 2} ${-130 + (i % 3 ? 0 : -8)} ${dx + 12} ${-100 + (i % 3 ? 0 : -8)} L ${dx + 6} ${-86 + (i % 3 ? 0 : -8)} Z`} fill="#F4EEDC" stroke="#8A8070" strokeWidth={2.5} /></g>)}
      <ellipse cx={0} cy={0} rx={36} ry={30} fill={BD} opacity={0.7} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={260} ry={24} fill="#000" opacity={0.28} />
      <ellipse cx={-90} cy={-50} rx={70} ry={50} fill={BR} stroke="#2E2014" strokeWidth={5} />
      <ellipse cx={90} cy={-50} rx={70} ry={50} fill={BR} stroke="#2E2014" strokeWidth={5} />
      <ellipse cx={0} cy={-280} rx={190} ry={260} fill={BR} stroke="#2E2014" strokeWidth={6} />
      <ellipse cx={0} cy={-230} rx={110} ry={160} fill="#7E5E40" opacity={0.7} />
      {paw(-1)}
      {paw(1)}
      <g transform={`translate(0 ${-600 + 3 * Math.sin(t * 0.1)})`}>
        <circle cx={-110} cy={-90} r={48} fill={BR} stroke="#2E2014" strokeWidth={5} />
        <circle cx={110} cy={-90} r={48} fill={BR} stroke="#2E2014" strokeWidth={5} />
        <circle cx={-110} cy={-90} r={24} fill="#B88E7A" />
        <circle cx={110} cy={-90} r={24} fill="#B88E7A" />
        <ellipse cx={0} cy={0} rx={140} ry={120} fill={BR} stroke="#2E2014" strokeWidth={6} />
        <ellipse cx={0} cy={44} rx={62} ry={46} fill="#B8997A" stroke="#2E2014" strokeWidth={4} />
        <ellipse cx={0} cy={26} rx={24} ry={16} fill="#16141C" />
        <path d="M 0 40 L 0 68 M -26 76 Q 0 96 26 76" stroke="#16141C" strokeWidth={5} fill="none" strokeLinecap="round" />
        <circle cx={-52} cy={-22} r={11} fill="#16141C" />
        <circle cx={52} cy={-22} r={11} fill="#16141C" />
        <path d="M -78 -52 L -30 -42 M 78 -52 L 30 -42" stroke="#2E2014" strokeWidth={7} strokeLinecap="round" />
      </g>
    </g>
  );
};
/** A forest edge: dark trunks, soft green light, ferns, ground. */
const ForestBg: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1700} fill="#3E5A3A" />
    <rect x={-400} y={-400} width={2720} height={600} fill="#5C7E4A" opacity={0.6} />
    {[100, 420, 760, 1160, 1520, 1840].map((x, i) => <g key={i}><rect x={x} y={-100} width={70 + 30 * (i % 2)} height={1100} fill={i % 2 ? '#3A2A1C' : '#4A3622'} /><path d={`M ${x + 20} 100 v 700 M ${x + 50} 200 v 600`} stroke="#2A1C12" strokeWidth={4} opacity={0.5} /></g>)}
    <Glow x={1000} y={120} r={900} o={0.35} />
    <rect x={-400} y={860} width={2720} height={500} fill="#4A3A24" />
    {Array.from({ length: 22 }).map((_, i) => {
      const x = -300 + i * 120 + 30 * Math.sin(i);
      const y = 880 + 60 * Math.abs(Math.sin(i * 1.3));
      return <path key={i} d={`M ${x} ${y} q -20 -60 -60 -80 M ${x} ${y} q 6 -80 -6 -110 M ${x} ${y} q 24 -60 62 -76`} stroke="#6E9A4A" strokeWidth={6} fill="none" strokeLinecap="round" transform={`rotate(${2 * Math.sin(t * 0.04 + i)} ${x} ${y})`} />;
    })}
  </g>
);
/** One bee: a striped body and two beating wings; `r` its heading in degrees. */
const Bee: React.FC<{ x: number; y: number; s?: number; r?: number; t?: number }> = ({ x, y, s = 1, r = 0, t = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <ellipse cx={-6} cy={-22} rx={20} ry={10 + 5 * Math.sin(t * 1.6)} fill="#EEF4FA" stroke="#9AB0C0" strokeWidth={2} opacity={0.85} transform="rotate(-20 -6 -22)" />
    <ellipse cx={8} cy={-22} rx={20} ry={10 + 5 * Math.sin(t * 1.6 + 1)} fill="#EEF4FA" stroke="#9AB0C0" strokeWidth={2} opacity={0.85} transform="rotate(20 8 -22)" />
    <ellipse cx={0} cy={0} rx={32} ry={21} fill="#F2C230" stroke={L} strokeWidth={3} />
    <path d="M -10 -20 L -10 20 M 6 -21 L 6 21 M 20 -15 L 20 15" stroke={L} strokeWidth={6} />
    <circle cx={30} cy={-2} r={13} fill="#3A2A1A" stroke={L} strokeWidth={3} />
    <circle cx={35} cy={-5} r={3} fill="#fff" />
    <path d="M 36 -12 q 8 -12 18 -8 M 30 -14 q 2 -14 12 -16" stroke={L} strokeWidth={3} fill="none" strokeLinecap="round" />
    <path d="M -32 0 l -12 3" stroke={L} strokeWidth={4} strokeLinecap="round" />
  </g>
);
/** A hive of honeycomb hanging from a branch among flowers, bees going and coming. */
const Bees: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1700} fill="#BFDCEA" />
    <rect x={-400} y={300} width={2720} height={1100} fill="#9AC06A" />
    <path d="M -400 520 Q 300 430 900 500 Q 1500 440 2320 520 L 2320 640 L -400 640 Z" fill="#6E9A4E" />
    {[160, 560, 1380, 1780].map((x, i) => <g key={i}><rect x={x} y={180} width={46} height={420} fill="#5A4128" /><circle cx={x + 23} cy={160} r={140} fill={i % 2 ? '#6E9A4E' : '#5E8A40'} /><circle cx={x - 60} cy={230} r={100} fill="#5E8A40" /><circle cx={x + 100} cy={240} r={100} fill="#7EA858" /></g>)}
    {/* the branch and the hive */}
    <path d="M 640 40 Q 960 90 1340 30" stroke="#5A4128" strokeWidth={36} fill="none" strokeLinecap="round" />
    <path d="M 1000 80 L 1000 110" stroke="#5A4128" strokeWidth={10} />
    <g transform="translate(1000 110)">
      <path d="M -150 0 Q -190 150 -140 300 Q -90 400 0 420 Q 90 400 140 300 Q 190 150 150 0 Z" fill="#E0A838" stroke="#8A5A20" strokeWidth={6} />
      {Array.from({ length: 5 }).map((_, r) => Array.from({ length: 5 - Math.abs(r - 2) }).map((__, c) => {
        const n = 5 - Math.abs(r - 2);
        const cx = (c - (n - 1) / 2) * 62;
        const cy = 60 + r * 64;
        return <polygon key={`${r}${c}`} points={`${cx},${cy - 34} ${cx + 30},${cy - 17} ${cx + 30},${cy + 17} ${cx},${cy + 34} ${cx - 30},${cy + 17} ${cx - 30},${cy - 17}`} fill="#F2C860" stroke="#B87E24" strokeWidth={3} />;
      }))}
      <ellipse cx={0} cy={330} rx={44} ry={26} fill="#4A3220" />
      <path d="M -40 372 Q -42 420 -38 450 M 30 380 Q 34 430 28 470" stroke="#E8A828" strokeWidth={10} strokeLinecap="round" fill="none" />
    </g>
    {/* flowers and bees working them */}
    {Array.from({ length: 16 }).map((_, i) => {
      const x = -200 + i * 150 + 30 * Math.sin(i * 2.1);
      const y = 940 + 90 * Math.abs(Math.sin(i * 1.4));
      const c = ['#F0A0B8', '#F6E060', '#FFFFFF', '#C8A0E0'][i % 4];
      return (
        <g key={i} transform={`rotate(${3 * Math.sin(t * 0.05 + i)} ${x} ${y})`}>
          <path d={`M ${x} ${y} L ${x} ${y - 150 - 30 * (i % 3)}`} stroke="#4E7A34" strokeWidth={8} />
          {[0, 1, 2, 3, 4].map((k) => <ellipse key={k} cx={x} cy={y - 150 - 30 * (i % 3) - 26} rx={13} ry={27} fill={c} stroke="#8A6A40" strokeWidth={2} transform={`rotate(${k * 72} ${x} ${y - 150 - 30 * (i % 3)})`} />)}
          <circle cx={x} cy={y - 150 - 30 * (i % 3)} r={13} fill="#E8A828" />
        </g>
      );
    })}
    <Bee x={560} y={760} s={1.0} r={-10} t={t} />
    <Bee x={1360} y={800} s={1.0} r={8} t={t + 2} />
    {Array.from({ length: 9 }).map((_, i) => {
      const a = t * 0.05 + i * 0.8;
      const bx = 1000 + (230 + 70 * (i % 3)) * Math.cos(a);
      const by = 330 + (200 + 40 * (i % 2)) * Math.sin(a * 1.2);
      return <Bee key={i} x={bx} y={by} s={0.55 + 0.1 * (i % 3)} r={(Math.cos(a) > 0 ? 1 : -1) * 10} t={t + i} />;
    })}
    {[[640, 760, 1380, 620], [1500, 840, 1100, 520]].map(([x0, y0, x1, y1], i) => <path key={i} d={`M ${x0} ${y0} Q ${(x0 + x1) / 2} ${y0 - 160} ${x1} ${y1}`} stroke="#6A5A3A" strokeWidth={4} strokeDasharray="4 16" fill="none" strokeLinecap="round" opacity={0.6} />)}
  </g>
);

// ---------- close-up factory: a person framed against a background, start wide, end on the face ----------
type CloseOpt = { look: typeof AN; child?: boolean; yaw: number; eye: number; expr: Parameters<typeof P>[0]['expr']; tilt?: number; talk?: boolean; z?: number; arms?: Partial<Parameters<typeof P>[0]> };
const closeOf = (bg: (t: number, id: string) => React.ReactNode, id: string, o: CloseOpt): React.FC<ShotProps> => ({ t, len }) => (
  <g transform={push(t, len, 960, o.z ?? (o.child ? 2.9 : 2.6))}>
    {bg(t, id)}
    <Hero look={o.look} pose={P({ x: 960, y: 700, scale: o.child ? 1.2 : 1.1, yaw: o.yaw, look: o.eye, headTilt: o.tilt ?? 0, expr: o.expr, talk: o.talk ? talkAt(t, 2, len - 2) : 0, armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 }, ...(o.arms ?? {}) }, t, o.child ? 4 : 1)} rimId="filmR" shadow={0} />
  </g>
);
const hallBg = (night = 0) => (t: number, id: string) => <g transform="translate(0 -60)"><Hall t={t} id={id} night={night} /></g>;
const corridorBg = (t: number, id: string) => <Corridor t={t} id={id} dry />;
const MUD_V = 0.7;
const MUD_FACES: [number, number, number][][] = [
  [[0, MUD_V, 0], [1, MUD_V, 0], [1, 1, 0], [0, 1, 0]],
  [[0, MUD_V, 0], [0, MUD_V, 1], [0, 1, 1], [0, 1, 0]],
  [[1, MUD_V, 0], [1, MUD_V, 1], [1, 1, 1], [1, 1, 0]],
];
const livingBg = (t: number, id: string) => (
  <g>
    <LivingRoom id={id} t={t + 500} lamp={0} veil={0.15} rainWindow={false} dog={false} day="—" />
    {MUD_FACES.map((q, i) => <polygon key={i} points={LIVING.Q(q)} fill="#8A7458" opacity={0.45} stroke="#5E4A30" strokeWidth={5} />)}
    <polygon points={LIVING.Q([[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]])} fill="#7A6040" opacity={0.35} />
  </g>
);
const yardBg = (t: number) => <Yard t={t} />;

// ================================================================ A: leaving the school
// ---------- S1: the corridor: the loudspeaker on the column calls the move; heads turn ----------
export const S1: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 980]]), 640, 1.3)}>
    <Corridor t={t} id="c10s1" dry>
      {[[620, 0.9, EXTRA[0]], [780, 0.8, EXTRA[2]], [1180, 0.85, HELPER]].map(([x, s, lk], i) => (
        <Hero key={i} look={lk as typeof AN} pose={P({ x: x as number, y: onFloor(1000, s as number), scale: s as number, yaw: kf(t, [[0, -0.5], [14 + i * 4, 0.5]]), look: 0.5, headTilt: -8, expr: 'worried', armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, i + 2)} rimId="filmR" shadow={0} />
      ))}
    </Corridor>
    <g transform="translate(1290 330)">
      <path d="M 0 0 L 70 -40 L 70 40 Z" fill="#E8E0CC" stroke={L} strokeWidth={5} />
      <rect x={-20} y={-14} width={24} height={28} fill="#8A8A8A" stroke={L} strokeWidth={4} />
      {[0, 1, 2].map((i) => { const ph = (t * 0.06 + i / 3) % 1; return <path key={i} d={`M ${90 + ph * 90} ${-40 - ph * 20} q 30 ${40 + ph * 20} 0 ${80 + ph * 40}`} stroke="#F4E8C0" strokeWidth={6} fill="none" opacity={1 - ph} />; })}
    </g>
  </g>
);

// ---------- S2: macro: a bag that had just been opened is zipped shut again ----------
export const S2: React.FC<ShotProps> = ({ t, len }) => {
  const z = kf(t, [[4, 0], [len - 6, 1]]);
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.1]]))}>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#C8A860" />
      <path d="M 200 900 Q 200 300 960 280 Q 1720 300 1720 900 Z" fill="#6E5B7E" stroke={L} strokeWidth={8} />
      <path d="M 300 420 Q 960 300 1620 420" stroke="#4A3E58" strokeWidth={40} fill="none" />
      <path d={`M 300 420 Q 960 300 1620 420`} stroke="#C8C0B0" strokeWidth={10} strokeDasharray="18 10" fill="none" pathLength={1} strokeDashoffset={0} opacity={0.8} />
      <rect x={300 + 1320 * z - 30} y={360 - 60 * Math.sin(Math.PI * z) * 0.6} width={60} height={70} rx={10} fill="#B8B0A0" stroke={L} strokeWidth={4} />
      <ArmHand x={300 + 1320 * z + 40} y={300 - 60 * Math.sin(Math.PI * z) * 0.6} rot={-100} s={0.7} skin={HANH.skin} sleeve={HANH.jacket} />
    </g>
  );
};

// ---------- S3: the coordinator, clipboard up, splits the room into groups for the high route ----------
export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 860], [len, 800]]), 640, 1.35)}>
    <Corridor t={t} id="c10s3" dry>
      <Hero look={HELPER} pose={P({ x: 760, y: onFloor(1000, 1.0), scale: 1.0, yaw: 0.5, look: 0.5, expr: 'determined', talk: talkAt(t, 4, len - 4), armL: { a: 60, b: 70 }, armR: { a: kf(t, [[0, 20], [20, 110], [len, 100]]), b: 10 } }, t, 2)} rimId="filmR" shadow={0} />
      {[[1000, 0.82, HANH], [1110, 0.62, LINH], [1240, 0.78, SAU], [1340, 0.6, NAM], [1460, 0.76, EXTRA[0]]].map(([x, s, lk], i) => (
        <Hero key={i} look={lk as typeof AN} pose={P({ x: x as number, y: onFloor(930, s as number), scale: s as number, yaw: -0.5, look: -0.5, expr: 'worried', armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, i + 3)} rimId="filmR" shadow={0} />
      ))}
    </Corridor>
  </g>
);

// ---------- S4: the low path down to the street: a barrier goes across; the water below, no one tries it ----------
export const S4: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[6, 0], [30, 1]]);
  return (
    <g transform={camT(kf(t, [[0, 900], [len, 1000]]), 620, 1.15)}>
      <Steps level={kf(t, [[0, 770], [len, 760]])} t={t} />
      <g transform={`translate(${400 + 260 * (1 - k)} 290)`} opacity={k}>
        <rect x={0} y={-20} width={520} height={28} fill="#E8E0CC" stroke={L} strokeWidth={4} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={10 + i * 104} y={-20} width={52} height={28} fill="#C8322A" />)}
        <rect x={0} y={-20} width={14} height={110} fill="#4A4A4A" />
        <rect x={506} y={-20} width={14} height={110} fill="#4A4A4A" />
        <rect x={200} y={-110} width={140} height={80} fill="#F4F0E4" stroke={L} strokeWidth={4} />
        <text x={270} y={-60} fontFamily={FONT} fontSize={30} textAnchor="middle" fill="#C8322A">ĐÓNG</text>
      </g>
    </g>
  );
};

// ---------- S5: Hạnh, the bag on her chest, the dog's lead in hand; Linh close at her side ----------
export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const x = kf(t, [[0, 520], [len, 1080]]);
  return (
    <g transform={camT(x + 120, 660, 1.45)}>
      <Corridor t={t} id="c10s5" dry />
      <Hero look={HANH} pose={P({ x, y: onFloor(1000, 1.0), scale: 1.0, yaw: 0.6, look: 0.5, expr: 'determined', ...walk(t), armL: { a: 40, b: 80 }, armR: { a: 40, b: 10 } }, t, 3)} rimId="filmR" shadow={0} />
      <Duffel x={x + 40} y={onFloor(1000, 1.0) - 40} s={0.45} />
      <path d={`M ${x + 60} ${onFloor(1000, 1.0) - 30} Q ${x + 160} ${960} ${x + 240} 970`} stroke="#C8322A" strokeWidth={5} fill="none" />
      <Dog x={x + 260} y={1000} s={0.5} t={t} />
      <Hero look={RAINCOAT} pose={P({ x: x - 150, y: onFloor(1000, 0.72), scale: 0.72, yaw: 0.6, look: 0.6, expr: 'worried', ...walk(t, 1.2), armR: { a: 60, b: 10 }, armL: { a: 12, b: 16 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S6: wide: the line walks the ridge road; bà Sáu and Nam behind the helper; the closed low branch below ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => {
  const d = kf(t, [[0, 0], [len, 260]]);
  const ppl: [typeof AN, number, number][] = [[HELPER, 0.62, 0], [SAU, 0.56, -120], [NAM, 0.44, -200], [HANH, 0.58, -360], [RAINCOAT, 0.42, -440], [EXTRA[0], 0.58, -600], [EXTRA[2], 0.56, -740]];
  return (
    <g transform={camT(kf(t, [[0, 820], [len, 980]]), 640, 1.0)}>
      <HighRoad t={t} />
      {ppl.map(([lk, s, dx], i) => (
        <Hero key={i} look={lk} pose={P({ x: 700 + dx + d, y: onFloor(800, s), scale: s, yaw: 0.6, look: 0.4, expr: 'determined', ...walk(t, i), ...swing(t, i) }, t, i + 1)} rimId="filmR" shadow={0} />
      ))}
    </g>
  );
};

// ---------- S7: behind, the yard: An and the crew take down the stopped water unit ----------
export const S7: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 1000], [len, 940]]), 600, 1.15)}>
    <Yard t={t} />
    <g transform="translate(0 40)"><Tanks t={t} label={0} level={0.1} /></g>
    <Hero look={AN} pose={P({ x: 640, y: onFloor(960, 1.0), scale: 1.0, yaw: 0.5, look: 0.5, tilt: 6, expr: 'determined', armR: { a: 80 + 8 * Math.sin(t * 0.5), b: 40 }, armL: { a: 60, b: 50 } }, t, 1)} rimId="filmR" shadow={0} />
    <Hero look={HELPER} pose={P({ x: 1500, y: onFloor(960, 1.0), scale: 1.0, yaw: -0.5, look: -0.5, tilt: -6, expr: 'neutral', armR: { a: 60, b: 50 }, armL: { a: 80 + 8 * Math.sin(t * 0.5 + 1), b: 40 } }, t, 2)} rimId="filmR" shadow={0} />
    <Jerry x={900} y={960} s={0.6} />
    <Jerry x={1000} y={960} s={0.6} c="#3F6E9A" />
  </g>
);

// ---------- S8: close at the step: the cart wheel jammed in the gap ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 640, kf(t, [[0, 1.6], [len, 1.8]]))}>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#9A9488" />
    <rect x={-400} y={700} width={1300} height={800} fill="#B8B09C" stroke="#7A7260" strokeWidth={6} />
    <rect x={900} y={780} width={1500} height={800} fill="#A8A08C" stroke="#7A7260" strokeWidth={6} />
    <rect x={892} y={700} width={20} height={120} fill="#3A3428" />
    <Cart x={980} y={740} s={1.4} jolt={0.4 * Math.max(0, Math.sin(t * 0.4))} />
  </g>
);

// ---------- S9: two of them pull once; it does not move ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => {
  const pull = Math.max(0, Math.sin(Math.min(1, t / 26) * Math.PI));
  return (
    <g transform={camT(960, 600, 1.2)}>
      <Yard t={t} />
      <rect x={300} y={830} width={1400} height={40} fill="#A8A08C" stroke="#7A7260" strokeWidth={5} />
      <Cart x={760} y={860} s={1.0} jolt={0.5 * pull} />
      {[[1100, AN], [1240, HELPER]].map(([x, lk], i) => (
        <Hero key={i} look={lk as typeof AN} pose={P({ x: (x as number) + 30 * pull, y: onFloor(960, 1.0), scale: 1.0, yaw: 0.6, look: 0.5, tilt: 18 * pull, expr: pull > 0.4 ? 'determined' : 'worried', armL: { a: 70, b: 10 }, armR: { a: 60, b: 10 }, legL: { a: 20 * pull, b: -10 }, legR: { a: -24 * pull, b: -10 } }, t, i + 1)} rimId="filmR" shadow={0} />
      ))}
    </g>
  );
};

// ---------- S10: macro: the radio: "last group, get ready to leave; report your count" ----------
export const S10: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.1], [len, 1.4]]))}>
    <rect x={-400} y={-400} width={2720} height={1900} fill={AN.jacket} />
    <rect x={-400} y={760} width={2720} height={700} fill={AN.limb} />
    <rect x={-400} y={740} width={2720} height={40} fill="#3A2A1A" />
    <rect x={880} y={380} width={170} height={340} rx={22} fill="#22202A" stroke={L} strokeWidth={6} />
    <rect x={1000} y={240} width={24} height={160} rx={8} fill="#22202A" />
    <rect x={905} y={420} width={120} height={70} rx={6} fill="#1E3A2E" />
    <circle cx={965} cy={560} r={18} fill={Math.sin(t * 1.1) > 0 ? '#E04A3E' : '#6E1E1E'} />
    {[0, 1, 2].map((i) => { const ph = (t * 0.07 + i / 3) % 1; return <path key={i} d={`M ${1070 + ph * 120} ${480 - ph * 30} q 40 70 0 140`} stroke="#F4E8C0" strokeWidth={7} fill="none" opacity={1 - ph} />; })}
  </g>
);

// ---------- S11: An looks at the big tank left standing ----------
export const S11 = closeOf(yardBg, 'c10s11', { look: AN, yaw: 0.4, eye: 0.7, expr: 'worried', tilt: -6 });

// ---------- S12: the big tank; at the gate the supervisor signals: packing is over ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 1000]]), 600, 1.1)}>
    <Yard t={t} />
    <rect x={620} y={360} width={420} height={560} rx={60} fill="#3F6E9A" stroke={L} strokeWidth={8} />
    <rect x={620} y={360} width={420} height={60} rx={30} fill="#2E5E8A" />
    <rect x={580} y={900} width={500} height={40} fill="#6E6A60" stroke={L} strokeWidth={5} />
    <Hero look={HELPER} pose={P({ x: 1520, y: onFloor(980, 0.8), scale: 0.8, yaw: -0.5, look: -0.5, expr: 'determined', armR: { a: 150 + 20 * Math.sin(t * 0.5), b: 20 }, armL: { a: 12, b: 16 } }, t, 2)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S13: An, decided: "leave the tank; take the parts and the spares first" ----------
export const S13 = closeOf(yardBg, 'c10s13', { look: AN, yaw: -0.3, eye: -0.4, expr: 'determined', talk: true, z: 2.8 });

// ---------- S14: two colleagues lift the small crate off the cart ----------
export const S14: React.FC<ShotProps> = ({ t, len }) => {
  const up = kf(t, [[6, 0], [36, 1]]);
  return (
    <g transform={camT(960, 640, 1.3)}>
      <Yard t={t} />
      <Cart x={960} y={900} s={1.0} />
      <rect x={830 + 0 * up} y={760 - 160 * up} width={200} height={100} fill="#B8905A" stroke={L} strokeWidth={5} opacity={up > 0.02 ? 1 : 0} />
      {[[700, HELPER, 0.6], [1220, EXTRA[3], -0.6]].map(([x, lk, y], i) => (
        <Hero key={i} look={lk as typeof AN} pose={P({ x: x as number, y: onFloor(980, 1.0), scale: 1.0, yaw: y as number, look: y as number, tilt: 14 * (1 - up) * (i ? -1 : 1), expr: 'determined', armL: { a: (i ? -1 : 1) * (60 + 40 * up), b: 30 }, armR: { a: (i ? -1 : 1) * (60 + 40 * up), b: 30 } }, t, i + 2)} rimId="filmR" shadow={0} />
      ))}
    </g>
  );
};

// ---------- S15: An checks the emptied classroom with the duty officer ----------
export const S15: React.FC<ShotProps> = ({ t, len }) => {
  const a = stand(SH, 0.42, 0.55);
  const h = stand(SH, 0.62, 0.5);
  return (
    <g transform={camT(kf(t, [[0, 900], [len, 1020]]), 520, 1.15)}>
      <Room t={t} id="c10s15" />
      <Hero look={AN} pose={P({ x: a.x + 60 * kf(t, [[0, 0], [len, 1]]), y: a.y, scale: a.scale, yaw: 0.5, look: kf(t, [[0, 0.5], [len, -0.4]]), expr: 'determined', ...walk(t, 0, 12), armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={HELPER} pose={P({ x: h.x, y: h.y, scale: h.scale, yaw: -0.4, look: -0.3, expr: 'neutral', armL: { a: 60, b: 70 }, armR: { a: 12, b: 16 } }, t, 2)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S16: floor level: his hand takes the bowl from under the chair as he passes ----------
export const S16: React.FC<ShotProps> = ({ t, len }) => {
  const lift = kf(t, [[30, 0], [len, 1]]);
  return (
    <g transform={camT(960, 640, 1.1)}>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#B8AC88" />
      <rect x={-400} y={-400} width={2720} height={900} fill="#C8BC94" />
      <rect x={500} y={300} width={60} height={500} fill="#6E4C30" stroke={L} strokeWidth={4} />
      <rect x={1300} y={300} width={60} height={500} fill="#6E4C30" stroke={L} strokeWidth={4} />
      <rect x={460} y={260} width={940} height={60} fill="#8A6440" stroke={L} strokeWidth={5} />
      <g transform={`translate(0 ${-260 * lift})`}><Bowl x={960} y={780} s={1.6} /></g>
      <ArmHand x={kf(t, [[0, 1700], [8, 1300], [30, 1040]])} y={kf(t, [[0, 200], [30, 640]]) - 260 * lift} rot={70} s={1.3} skin={AN.skin} sleeve={AN.jacket} />
    </g>
  );
};

// ---------- S17: An on the radio: the crew is on its way; the spare water there will have to last ----------
export const S17 = closeOf(corridorBg, 'c10s17', { look: AN, yaw: 0.3, eye: 0.2, expr: 'neutral', talk: true, arms: { armR: { a: 150, b: 120 } } });

// ---------- S18: the new place: a short row of full jerrycans, and the gap where the rest should be ----------
export const S18: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 1000]]), 640, 1.2)}>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#C8BC94" />
    <rect x={-400} y={-400} width={2720} height={1150} fill="#D8C49A" />
    <rect x={-400} y={740} width={2720} height={20} fill="#8A7A58" />
    {[0, 1, 2].map((i) => <Jerry key={i} x={500 + i * 220} y={900} s={1.0} mark={1} />)}
    {[3, 4, 5].map((i) => <rect key={i} x={500 + i * 220 - 80} y={900 - 4} width={160} height={8} fill="#8A7A58" opacity={0.6} />)}
    <Glow x={960} y={300} r={900} o={0.3} />
  </g>
);

// ---------- S19: wide: the big tank left alone in the empty yard ----------
export const S19: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 600, kf(t, [[0, 1.2], [len, 0.95]]))}>
    <Yard t={t} />
    <rect x={820} y={560} width={240} height={320} rx={36} fill="#3F6E9A" stroke={L} strokeWidth={6} />
    <rect x={800} y={870} width={280} height={24} fill="#6E6A60" stroke={L} strokeWidth={4} />
    <ellipse cx={940} cy={900} rx={180} ry={20} fill="#000" opacity={0.25} />
  </g>
);

// ---------- S20: Linh zips her own bag ----------
export const S20: React.FC<ShotProps> = ({ t, len }) => {
  const z = kf(t, [[4, 0], [len - 4, 1]]);
  return (
    <g transform={camT(960, 560, 1.05)}>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#A88E50" />
      <path d="M 300 900 Q 300 360 960 340 Q 1620 360 1620 900 Z" fill="#C8503C" stroke={L} strokeWidth={8} />
      <path d="M 380 460 Q 960 360 1540 460" stroke="#8A3428" strokeWidth={36} fill="none" />
      <rect x={380 + 1160 * z - 26} y={400 - 25 * Math.sin(Math.PI * z)} width={52} height={60} rx={8} fill="#B8B0A0" stroke={L} strokeWidth={4} />
      <ArmHand x={380 + 1160 * z + 30} y={350 - 25 * Math.sin(Math.PI * z)} rot={-100} s={0.8} skin={LINH.skin} sleeve={RAINCOAT.jacket} />
    </g>
  );
};

// ---------- S21: inside, the best shirt, folded on top ----------
export const S21: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.15]]))}>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#8A3428" />
    <rect x={460} y={260} width={1000} height={560} rx={30} fill="#F0E6C8" stroke={L} strokeWidth={6} />
    <path d="M 860 260 L 960 380 L 1060 260" fill="none" stroke="#C8B888" strokeWidth={8} />
    <rect x={460} y={700} width={1000} height={20} fill="#D8C8A0" />
    <Glow x={960} y={400} r={700} o={0.3} />
  </g>
);

// ---------- S22: Linh in the yellow raincoat, ready ----------
export const S22: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, kf(t, [[0, 720], [len, 620]]), kf(t, [[0, 1.4], [len, 1.9]]))}>
    <Corridor t={t} id="c10s22" dry />
    <Hero look={RAINCOAT} pose={P({ x: 960, y: 720, scale: 1.1, yaw: 0.3, look: 0.5, headTilt: -6, expr: 'determined', armL: { a: 20, b: 30 }, armR: { a: 20, b: 30 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
);

// ================================================================ B: the hall
const hs = onBench(0.3);
const ls = onBench(0.42, 0.72);
type FaceE = 'neutral' | 'smile' | 'worried' | 'relieved' | 'tired';
const HanhOnBench: React.FC<{ t: number; expr?: FaceE }> = ({ t, expr = 'neutral' }) => (
  <g>
    <Hero look={HANH} pose={P({ ...hs, yaw: 0.5, look: 0.4, expr, ...sit(1), armL: { a: 14, b: 32 }, armR: { a: 40, b: 40 } }, t, 3)} rimId="filmR" shadow={0} />
    <Dog x={hs.x + 160 * hs.scale} y={HALL.P(0.12, 1, 0.34).y} s={0.38} t={t} />
    <path d={`M ${hs.x + 50 * hs.scale} ${hs.y + 20 * hs.scale} Q ${hs.x + 110 * hs.scale} ${hs.y + 100 * hs.scale} ${hs.x + 150 * hs.scale} ${HALL.P(0.12, 1, 0.34).y - 40}`} stroke="#C8322A" strokeWidth={4} fill="none" />
  </g>
);
// ---------- S23: wide: the hall; Linh beside her mother on the bench by the door ----------
export const S23: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 760]]), 520, kf(t, [[0, 1.0], [len, 1.25]]))}>
    <Hall t={t} id="c10s23" />
    <HanhOnBench t={t} />
    <Hero look={RAINCOAT} pose={P({ ...ls, yaw: 0.5, look: kf(t, [[0, 0.3], [40, -0.6], [70, 0.3]]), headTilt: -8, expr: 'worried', ...sit(1), armL: { a: 14, b: 32 }, armR: { a: 14, b: 32 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
);

// ---------- S24: close: every footstep, she looks up at the door ----------
export const S24 = closeOf(hallBg(), 'c10s24', { look: RAINCOAT, child: true, yaw: -0.5, eye: -0.7, expr: 'worried', tilt: -10 });

// ---------- S25: Hạnh holds the lead and her daughter's bag ----------
export const S25: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(hs.x + 60, hs.y - 40, kf(t, [[0, 2.2], [len, 2.5]]))}>
    <Hall t={t} id="c10s25" />
    <HanhOnBench t={t} expr="neutral" />
    <Duffel x={hs.x + 40 * hs.scale} y={hs.y + 10 * hs.scale} s={hs.scale * 0.5} c="#C8503C" />
  </g>
);

// ---------- S26: in the bright door: An steps in, the bowl from the storm night in his hand ----------
export const S26: React.FC<ShotProps> = ({ t, len }) => {
  const a = stand(HALL, 0.06, 0.64);
  const k = kf(t, [[0, 0], [len, 1]]);
  return (
    <g transform={camT(a.x + 160, a.y - 40, 1.9)}>
      <Hall t={t} id="c10s26" />
      <Hero look={AN} pose={P({ x: a.x + 140 * k, y: a.y, scale: a.scale, yaw: 0.6, look: 0.6, expr: 'smile', ...walk(t, 0, 16), armR: { a: 50, b: 60 }, armL: { a: 12, b: 16 } }, t, 1)} rimId="filmR" shadow={0} />
      <Bowl x={a.x + 140 * k + 40 * a.scale} y={a.y - 30 * a.scale} s={a.scale * 0.6} />
    </g>
  );
};

// ---------- S27: Linh springs up from the bench ----------
export const S27: React.FC<ShotProps> = ({ t, len }) => {
  const up = kf(t, [[2, 0], [12, 1]]);
  const st = stand(HALL, 0.12, 0.42);
  const fy = onFloor(HALL.P(0.12, 1, 0.42).y, ls.scale);
  return (
    <g transform={camT(st.x + 80, st.y - 60, 2.0)}>
      <Hall t={t} id="c10s27" />
      <HanhOnBench t={t} expr="smile" />
      <Hero look={RAINCOAT} pose={P({ x: ls.x + (st.x - ls.x) * up, y: ls.y + (fy - ls.y) * up, scale: ls.scale, yaw: 0.5, look: 0.6, expr: 'happy', ...(up < 0.5 ? sit(1) : {}), armL: { a: 40 * up, b: 30 }, armR: { a: 40 * up, b: 30 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};

// ---------- S28: close: "Bố đây rồi! ..." ----------
export const S28 = closeOf(hallBg(), 'c10s28', { look: RAINCOAT, child: true, yaw: 0.3, eye: 0.5, expr: 'relieved', talk: true, tilt: -10 });
// ---------- S29: close: An: he asked at the door; later than she hoped ----------
export const S29 = closeOf(hallBg(), 'c10s29', { look: AN, yaw: -0.3, eye: -0.5, expr: 'smile', talk: true, tilt: 8 });
// ---------- S30: close: "Bố xin lỗi nhé." ----------
export const S30 = closeOf(hallBg(), 'c10s30', { look: AN, yaw: -0.25, eye: -0.5, expr: 'sad', talk: true, tilt: 10, z: 3.0 });

// ---------- the hug, two-shot ----------
const Hug: React.FC<{ t: number; len: number; id: string; z0: number; z1: number; bowl?: number; nod?: boolean }> = ({ t, len, id, z0, z1, bowl = 1, nod = false }) => {
  const a = stand(HALL, 0.2, 0.55);
  const cs = a.scale * 0.72;
  return (
    <g transform={camT(a.x, a.y - 80 * a.scale, kf(t, [[0, z0], [len, z1]]))}>
      <Hall t={t} id={id} />
      <Hero look={AN} pose={P({ x: a.x, y: a.y, scale: a.scale, yaw: 0.2, look: 0.3, headTilt: 14, expr: bowl ? 'sad' : 'smile', armL: { a: bowl ? 12 : -30, b: bowl ? 16 : -70 }, armR: { a: bowl ? -20 : -30, b: bowl ? -60 : -70 } }, t, 1)} rimId="filmR" shadow={0} />
      {bowl ? <Bowl x={a.x + 60 * a.scale} y={a.y - 40 * a.scale} s={a.scale * 0.5} /> : null}
      <Hero look={RAINCOAT} pose={P({ x: a.x + 40 * a.scale, y: onFloor(HALL.P(0.2, 1, 0.6).y, cs), scale: cs, yaw: -0.4, look: -0.4, headTilt: nod ? -14 + 8 * Math.sin(t * 0.3) : -12, expr: 'cry', armL: { a: -30, b: -60 }, armR: { a: -30, b: -60 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};
// ---------- S31: she hugs him round the middle ----------
export const S31: React.FC<ShotProps> = ({ t, len }) => <Hug t={t} len={len} id="c10s31" z0={1.6} z1={2.0} />;
// ---------- S32: close inside the hug: "Lần sau bố nhờ báo sớm hơn nhé. Con chờ mãi." ----------
export const S32 = closeOf(hallBg(), 'c10s32', { look: RAINCOAT, child: true, yaw: 0.2, eye: 0.4, expr: 'sad', talk: true, tilt: -14, z: 3.1 });
// ---------- S33: he puts the bowl down and holds her ----------
export const S33: React.FC<ShotProps> = ({ t, len }) => <Hug t={t} len={len} id="c10s33" z0={2.0} z1={2.3} bowl={0} />;
// ---------- S34: close: "Ừ, bố nhớ..." ----------
export const S34 = closeOf(hallBg(), 'c10s34', { look: AN, yaw: -0.2, eye: -0.5, expr: 'smile', talk: true, tilt: 12, z: 2.9 });
// ---------- S35: she nods into his shirt ----------
export const S35: React.FC<ShotProps> = ({ t, len }) => <Hug t={t} len={len} id="c10s35" z0={2.6} z1={2.9} bowl={0} nod />;

// ---------- S36: wide: An sits by the two of them; Hạnh gives the girl her hand (the held pause) ----------
export const S36: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 700], [len, 640]]), 560, kf(t, [[0, 1.5], [len, 1.3]]))}>
    <Hall t={t} id="c10s36" />
    <HanhOnBench t={t} expr="smile" />
    <Hero look={RAINCOAT} pose={P({ ...onBench(0.38, 0.72), yaw: 0.5, look: 0.5, headTilt: -6, expr: 'relieved', ...sit(1), armL: { a: -20, b: -20 }, armR: { a: 14, b: 32 } }, t, 4)} rimId="filmR" shadow={0} />
    <Hero look={AN} pose={P({ ...onBench(0.46), yaw: -0.3, look: -0.4, headTilt: 8, expr: 'smile', ...sit(1), armL: { a: 14, b: 32 }, armR: { a: 14, b: 32 } }, t, 1)} rimId="filmR" shadow={0} />
  </g>
);

// ================================================================ C: that night
// ---------- S37: night: the water over the low road by the old school, the painted marks at the gate gone under ----------
export const S37: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 980]]), 620, 1.15)}>
    <Steps level={kf(t, [[0, 560], [len, 520]])} t={t} />
    <LightVeil id="c10s37v" lights={[[1500, 120, 260]]} o={0.62} />
  </g>
);
// ---------- S38: night wide: the classroom block still above the water; no way through the low road ----------
export const S38: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 640, kf(t, [[0, 1.0], [len, 1.08]]))}>
    <Outside t={t} water={kf(t, [[0, 0.75], [len, 0.85]])} clear={0} />
    <LightVeil id="c10s38v" lights={[[1500, 120, 220]]} o={0.64} />
  </g>
);
// ---------- S39: the hall at night: families' mats round the middle ----------
export const S39: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 520, kf(t, [[0, 1.0], [len, 1.1]]))}>
    <Hall t={t} id="c10s39" night={1} />
  </g>
);
// ---------- S40: Linh asleep against Hạnh ----------
export const S40: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(hs.x + 60, hs.y - 60, kf(t, [[0, 2.2], [len, 2.6]]))}>
    <Hall t={t} id="c10s40" night={1} />
    <Hero look={HANH} pose={P({ ...hs, yaw: 0.5, look: 0.3, headTilt: 10, expr: 'tired', ...sit(1), armL: { a: 14, b: 32 }, armR: { a: 40, b: 40 } }, t, 3)} rimId="filmR" shadow={0} />
    <Hero look={LINH} pose={P({ ...onBench(0.38, 0.72), yaw: 0.3, look: 0, headTilt: -26, tilt: -14, blink: 1, expr: 'relieved', ...sit(1), armL: { a: 14, b: 32 }, armR: { a: 14, b: 32 } }, t, 4)} rimId="filmR" shadow={0} />
  </g>
);
// ---------- S41: An by the door with bà Sáu, the radio between them, until the count is confirmed ----------
export const S41: React.FC<ShotProps> = ({ t, len }) => {
  const a = onBench(0.87);
  const b = onBench(0.95);
  return (
    <g transform={camT(a.x + 260, a.y - 120, kf(t, [[0, 1.15], [len, 1.25]]))}>
      <Hall t={t} id="c10s41" night={1} />
      <Hero look={AN} pose={P({ ...a, yaw: 0.5, look: 0.3, headTilt: 8, expr: 'tired', ...sit(1), armL: { a: 14, b: 32 }, armR: { a: 60, b: 60 } }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={SAU} pose={P({ ...b, yaw: -0.4, look: -0.3, expr: 'neutral', ...sit(1), armL: { a: 14, b: 32 }, armR: { a: 14, b: 32 } }, t, 2)} rimId="filmR" shadow={0} />
      <circle cx={a.x + 70 * a.scale} cy={a.y - 20 * a.scale} r={8} fill={Math.sin(t * 0.9) > 0 ? '#3EE07E' : '#1E6E3E'} />
    </g>
  );
};

// ================================================================ D: the first sun
// ---------- S42: the cloud opens on a patch of light ----------
export const S42: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 520, kf(t, [[0, 1.0], [len, 1.1]]))}>
    <Sky t={t} clear={kf(t, [[0, 0.3], [len, 1]])} />
    <circle cx={1400} cy={240} r={kf(t, [[0, 30], [len, 130]])} fill="#FFF4C8" opacity={kf(t, [[0, 0.2], [len, 0.95]])} />
    <path d="M -400 760 Q 500 700 1200 740 Q 1800 720 2320 760 L 2320 1500 L -400 1500 Z" fill="#6E8A5A" />
  </g>
);
// ---------- S43: floor level: the strip of sun crawls over the doorsill into the hall ----------
export const S43: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[0, 0], [len, 1]]);
  return (
    <g transform={camT(960, 600, 1.05)}>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#7A5E40" />
      {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M -400 ${620 + i * 90} L 2320 ${600 + i * 90}`} stroke="#5E4630" strokeWidth={4} />)}
      <rect x={-400} y={-400} width={2720} height={980} fill="#C2AC82" />
      <rect x={-400} y={560} width={2720} height={40} fill="#6A4A2E" />
      <polygon points={`-400,600 ${200 + 1300 * k},600 ${400 + 1500 * k},1500 -400,1500`} fill="#FFD070" opacity={0.75} />
    </g>
  );
};
// ---------- S44/S45: Linh's hand on her knee; the sun reaches it; she turns the palm up ----------
const SunHand: React.FC<{ t: number; len: number; turn: number; reach: number }> = ({ t, turn, reach }) => {
  const fx = Math.cos(Math.PI * turn);
  return (
    <g transform={camT(960, 560, 1.0)}>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#8A6440" />
      <path d="M -400 520 Q 600 380 1200 470 Q 1700 560 2320 600 L 2320 1500 L -400 1500 Z" fill={LINH.limb} stroke={L} strokeWidth={6} />
      <polygon points={`-400,-400 ${-400 + 1800 * reach},-400 ${-200 + 2000 * reach},1500 -400,1500`} fill="#FFE6A0" opacity={0.45} style={{ mixBlendMode: 'screen' }} />
      <g transform={`translate(1000 300) scale(${Math.abs(fx) < 0.08 ? 0.08 : Math.abs(fx)} 1)`}>
        <ArmHand x={0} y={0} rot={-20} s={1.5} skin={LINH.skin} sleeve={LINH.jacket} />
        {fx < 0 ? <path d="M -40 120 Q 10 160 60 130 M -30 200 Q 20 230 50 210" stroke="#B88A68" strokeWidth={5} fill="none" transform="rotate(-20)" /> : null}
      </g>
    </g>
  );
};
export const S44: React.FC<ShotProps> = ({ t, len }) => <SunHand t={t} len={len} turn={0} reach={kf(t, [[0, 0.2], [len, 0.75]])} />;
export const S45: React.FC<ShotProps> = ({ t, len }) => <SunHand t={t} len={len} turn={kf(t, [[10, 0], [40, 1]])} reach={0.8} />;
// ---------- S46: her face in the warm light, saying nothing (the held pause) ----------
export const S46: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={push(t, len, 960, 2.8)}>
      <g transform="translate(0 -60)"><Hall t={t} id="c10s46" sun={1} /></g>
      <Hero look={LINH} pose={P({ x: 960, y: 700, scale: 1.2, yaw: -0.4, look: -0.6, headTilt: -8, expr: 'relieved', armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, 4)} rimId="filmR" shadow={0} />
    </g>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#FFD890" opacity={0.18} style={{ mixBlendMode: 'screen' }} />
  </g>
);

// ================================================================ E: what the light shows
export const S47: React.FC<ShotProps> = ({ t, len }) => <g transform={camT(kf(t, [[0, 900], [len, 1000]]), 560, kf(t, [[0, 1.0], [len, 1.06]]))}><Aftermath t={t} /></g>;
export const S48: React.FC<ShotProps> = ({ t, len }) => <g transform={camT(kf(t, [[0, 140], [len, 220]]), 640, 1.9)}><Aftermath t={t} /></g>;
export const S49: React.FC<ShotProps> = ({ t, len }) => <g transform={camT(1330, kf(t, [[0, 460], [len, 400]]), 2.0)}><Aftermath t={t} /></g>;
export const S50: React.FC<ShotProps> = ({ t, len }) => <g transform={camT(kf(t, [[0, 860], [len, 920]]), 780, kf(t, [[0, 1.8], [len, 2.1]]))}><Aftermath t={t} /></g>;
export const S51: React.FC<ShotProps> = ({ t, len }) => <g transform={camT(960, 560, kf(t, [[0, 1.12], [len, 0.95]]))}><Aftermath t={t} clear={1} /></g>;

// ================================================================ F: the alley, weeks later
const MudAlley: React.FC<{ t: number; id: string; children?: React.ReactNode }> = ({ t, id, children }) => (
  <g>
    <Alley id={id} t={t} w={0} shop />
    <polygon points={`${alleyP(-1, 0).x},${alleyP(-1, 0).y} ${alleyP(1, 0).x},${alleyP(1, 0).y} ${alleyP(1, 0.85).x},${alleyP(1, 0.85).y} ${alleyP(-1, 0.85).x},${alleyP(-1, 0.85).y}`} fill={MUD} opacity={0.55} />
    {Array.from({ length: 10 }).map((_, i) => { const p = alleyP(-0.6 + 0.13 * i, 0.1 + 0.07 * (i % 5)); return <ellipse key={i} cx={p.x} cy={p.y} rx={60} ry={10} fill="#6E5638" opacity={0.6} />; })}
    {children}
  </g>
);
const inAlley = (side: number, d: number, k = 1.2) => { const p = alleyP(side, d, 0); const s = Math.pow(1 - d, 1.25) * k; return { x: p.x, y: onFloor(p.y, s), scale: s }; };
const Shoveller: React.FC<{ t: number; at: { x: number; y: number; scale: number }; look: typeof AN; seed: number; yaw?: number }> = ({ t, at, look, seed, yaw = 0.5 }) => {
  const dig = Math.sin(t * 0.18 + seed);
  return (
    <g>
      <Hero look={look} pose={P({ ...at, yaw, look: yaw, tilt: 20 + 10 * dig, expr: 'tired', armL: { a: 60 + 20 * dig, b: 40 }, armR: { a: 50 + 20 * dig, b: 30 } }, t, seed)} rimId="filmR" shadow={0} />
      <path d={`M ${at.x + 60 * at.scale * Math.sign(yaw)} ${at.y - 20 * at.scale} l ${80 * at.scale * Math.sign(yaw)} ${140 * at.scale}`} stroke="#6A4A2E" strokeWidth={8 * at.scale} />
      <rect x={at.x + 120 * at.scale * Math.sign(yaw) - 25 * at.scale} y={at.y + 110 * at.scale} width={50 * at.scale} height={40 * at.scale} fill="#8A8A8A" stroke={L} strokeWidth={3} />
    </g>
  );
};
// ---------- S52: An, Hạnh and Linh walk back into the alley ----------
export const S52: React.FC<ShotProps> = ({ t, len }) => {
  const d = kf(t, [[0, 0.05], [len, 0.3]]);
  return (
    <g transform={camT(960, 600, 1.05)}>
      <MudAlley t={t} id="c10s52">
        {[[AN, -0.1, 0], [HANH, 0.12, 0.03], [LINH, 0.02, 0.06]].map(([lk, sd, dd], i) => (
          <Hero key={i} look={lk as typeof AN} pose={P({ ...inAlley(sd as number, d + (dd as number), i === 2 ? 0.85 : 1.2), yaw: 0, look: 0, expr: 'sad', ...walk(t, i, 12), ...swing(t, i) }, t, i + 1)} rimId="filmR" shadow={0} />
        ))}
      </MudAlley>
    </g>
  );
};
// ---------- S53: bà Sáu's shop: the shutter still down, the tarp gone ----------
export const S53: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 980], [len, 940]]), 520, 1.2)}>
    <ShopFront id="c10s53" t={t} tarp={0} />
    <rect x={300} y={300} width={1300} height={500} fill="#7A7E84" opacity={0.85} />
    {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M 300 ${330 + i * 40} L 1600 ${330 + i * 40}`} stroke="#5E6268" strokeWidth={5} />)}
    <rect x={-400} y={800} width={2720} height={700} fill={MUD} opacity={0.6} />
  </g>
);
// ---------- S54: neighbours shovel mud on the stretch that has been checked ----------
export const S54: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 1000]]), 620, 1.1)}>
    <MudAlley t={t} id="c10s54">
      <Shoveller t={t} at={inAlley(-0.5, 0.3)} look={EXTRA[0]} seed={2} yaw={0.6} />
      <Shoveller t={t} at={inAlley(0.45, 0.2)} look={EXTRA[3]} seed={5} yaw={-0.6} />
      <Shoveller t={t} at={inAlley(0.1, 0.5)} look={EXTRA[2]} seed={7} yaw={0.6} />
      <Wheelbarrow x={alleyP(0.6, 0.4).x} y={alleyP(0.6, 0.4).y} s={0.6} />
    </MudAlley>
  </g>
);
// ---------- S55: where the tarp hung: empty hooks ----------
export const S55: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 700], [len, 820]]), 160, 2.6)}>
    <ShopFront id="c10s55" t={t} tarp={0} />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${260 + i * 300} 124 q 0 30 -16 30`} stroke="#4A4A4A" strokeWidth={6} fill="none" />)}
  </g>
);
// ---------- S56: bà Sáu looks at her shop a while, then takes the shovel offered ----------
export const S56: React.FC<ShotProps> = ({ t, len }) => {
  const take = kf(t, [[40, 0], [70, 1]]);
  return (
    <g transform={camT(1000, 520, 1.4)}>
      <ShopFront id="c10s56" t={t} tarp={0} />
      <rect x={-400} y={800} width={2720} height={700} fill={MUD} opacity={0.6} />
      <Hero look={SAU} pose={P({ x: 900, y: 640, scale: 1.0, yaw: kf(t, [[0, -0.6], [40, -0.6], [56, 0.5]]), look: kf(t, [[0, -0.6], [40, -0.6], [56, 0.5]]), headTilt: -6, expr: take > 0.5 ? 'determined' : 'sad', armL: { a: 12, b: 16 }, armR: { a: 12 + 60 * take, b: 30 } }, t, 2)} rimId="filmR" shadow={0} />
      <Hero look={EXTRA[3]} pose={P({ x: 1240, y: 650, scale: 0.98, yaw: -0.5, look: -0.5, expr: 'smile', armL: { a: -60 * (1 - take * 0.5), b: -20 }, armR: { a: 12, b: 16 } }, t, 5)} rimId="filmR" shadow={0} />
      <path d={`M ${1100 - 80 * take} 560 L ${1080 - 80 * take} 800`} stroke="#6A4A2E" strokeWidth={10} />
      <rect x={1050 - 80 * take} y={790} width={60} height={50} fill="#8A8A8A" stroke={L} strokeWidth={3} />
    </g>
  );
};
// ---------- S57: wide: they clear the front together; inside still has to wait ----------
export const S57: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.05], [len, 0.98]]))}>
    <ShopFront id="c10s57" t={t} tarp={0} />
    <rect x={-400} y={800} width={2720} height={700} fill={MUD} opacity={0.55} />
    <Shoveller t={t} at={{ x: 700, y: 650, scale: 0.9 }} look={SAU} seed={2} yaw={0.5} />
    <Shoveller t={t} at={{ x: 1150, y: 660, scale: 0.92 }} look={EXTRA[3]} seed={4} yaw={-0.5} />
    <Shoveller t={t} at={{ x: 1450, y: 670, scale: 0.94 }} look={AN} seed={6} yaw={-0.5} />
  </g>
);

// ================================================================ G: the house
// ---------- S58: through the veranda: the living-room set, no longer bright ----------
export const S58: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.12]]))}>
    {livingBg(t, 'c10s58')}
    <rect x={-400} y={-400} width={2720} height={1900} fill="#6E6450" opacity={0.18} />
  </g>
);
// ---------- S59: close: the mud line across the chair back, nearly 0,80 m off the floor ----------
export const S59: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, kf(t, [[0, 640], [len, 560]]), kf(t, [[0, 1.0], [len, 1.15]]))}>
    <MudWall line={560}>
      <ChairBack x={960} y={640} s={1.1} />
    </MudWall>
    <g opacity={kf(t, [[20, 0], [40, 1]])}>
      <path d="M 1500 560 L 1500 1000" stroke="#F4F0E4" strokeWidth={5} strokeDasharray="14 10" />
      <rect x={1530} y={740} width={170} height={64} rx={8} fill="#F4F0E4" stroke={L} strokeWidth={3} />
      <text x={1615} y={784} fontFamily={FONT} fontSize={36} textAnchor="middle" fill="#2A2A2A">0,80 m</text>
    </g>
  </g>
);
// ---------- S60: his hand on the line ----------
export const S60: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.2], [len, 1.35]]))}>
    <MudWall line={560} />
    <ArmHand x={kf(t, [[0, 1500], [20, 1040]])} y={kf(t, [[0, 900], [20, 600]])} rot={150} s={1.4} skin={AN.skin} sleeve={AN.jacket} />
  </g>
);
// ---------- S61: the low cabinet, drowned over its top ----------
export const S61: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 620, kf(t, [[0, 1.1], [len, 1.2]]))}>
    <MudWall line={460}>
      <rect x={560} y={560} width={800} height={460} fill="#8A6440" stroke={L} strokeWidth={6} />
      {[0, 1].map((i) => <rect key={i} x={600 + i * 380} y={620} width={340} height={360} fill="#7A5634" stroke={L} strokeWidth={4} />)}
      <rect x={540} y={540} width={840} height={30} fill="#A07A50" stroke={L} strokeWidth={5} />
    </MudWall>
  </g>
);
// ---------- S62: the bowls pushed into a corner of the kitchen ----------
export const S62: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 640, kf(t, [[0, 1.2], [len, 1.3]]))}>
    <MudWall line={520}>
      <rect x={-400} y={820} width={2720} height={700} fill="#7A6A50" />
      {[[800, 880, 1.2, 10], [960, 900, 1.1, -14], [1100, 870, 1.0, 30], [900, 820, 0.9, 80]].map(([x, y, s, r], i) => <Bowl key={i} x={x} y={y} s={s} rot={r} />)}
    </MudWall>
  </g>
);
// ---------- S63: Linh's desk where it always was; the drawer swollen with water ----------
export const S63: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 620, kf(t, [[0, 1.1], [len, 1.22]]))}>
    <MudWall line={560}>
      <rect x={560} y={420} width={800} height={40} fill="#C8A06A" stroke={L} strokeWidth={5} />
      <rect x={600} y={460} width={40} height={560} fill="#A88050" stroke={L} strokeWidth={4} />
      <rect x={1280} y={460} width={40} height={560} fill="#A88050" stroke={L} strokeWidth={4} />
      <path d="M 700 470 Q 860 500 1000 474 Q 1120 492 1220 470 L 1230 600 Q 1100 630 960 610 Q 820 630 690 600 Z" fill="#8A6A44" stroke={L} strokeWidth={5} />
      <rect x={930} y={530} width={60} height={14} rx={6} fill="#4A3A2A" />
    </MudWall>
  </g>
);
// ---------- S64: the photo frame on the cabinet top, held there by the mud; one corner warped ----------
export const S64: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.15]]))}>
    <MudWall line={400}>
      <rect x={-400} y={700} width={2720} height={60} fill="#8A6440" stroke={L} strokeWidth={5} />
      <Frame x={960} y={560} s={1.1} bend={1} mud={1} />
    </MudWall>
  </g>
);
// ---------- S65: Linh lifts it and tries the dry photo next to it ----------
export const S65: React.FC<ShotProps> = ({ t, len }) => {
  const up = kf(t, [[4, 0], [30, 1]]);
  return (
    <g transform={camT(960, 560, 1.1)}>
      <MudWall line={400}>
        <rect x={-400} y={760} width={2720} height={60} fill="#8A6440" stroke={L} strokeWidth={5} />
        <Frame x={760} y={620 - 120 * up} s={0.9} bend={1} mud={1} photo={false} r={-6 * up} />
        <Photo x={kf(t, [[20, 1500], [len, 1060]])} y={kf(t, [[20, 700], [len, 520]])} s={0.8} r={6} />
        <ArmHand x={560} y={1200 - 120 * up} rot={170} s={1.0} skin={LINH.skin} sleeve={LINH.jacket} />
        <ArmHand x={kf(t, [[20, 1600], [len, 1160]])} y={kf(t, [[20, 1200], [len, 1000]])} rot={190} s={1.0} skin={LINH.skin} sleeve={LINH.jacket} />
      </MudWall>
    </g>
  );
};
const homeBg = (t: number, id: string) => livingBg(t, id);
// ---------- S66: close: "It's bent, Bố. Can we still fix it?" ----------
export const S66 = closeOf(homeBg, 'c10s66', { look: LINH, child: true, yaw: 0.3, eye: 0.5, expr: 'sad', talk: true, tilt: -10, arms: { armL: { a: 40, b: 80 }, armR: { a: -40, b: -80 } } });
// ---------- S67: two-shot: he takes the frame from her hands ----------
export const S67: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[6, 0], [30, 1]]);
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.5], [len, 1.6]]))}>
      {livingBg(t, 'c10s67')}
      {(() => { const sq = squat(940, 1.0); return <Hero look={AN} pose={P({ x: 820, y: sq.y, scale: 1.0, yaw: 0.6, look: 0.4, headTilt: 8, tilt: 10, expr: 'neutral', legL: sq.legL, legR: sq.legR, armL: { a: 50 + 20 * k, b: 60 }, armR: { a: 40 + 30 * k, b: 50 } }, t, 1)} rimId="filmR" shadow={0} />; })()}
      <Hero look={LINH} pose={P({ x: 1100, y: onFloor(940, 0.78), scale: 0.78, yaw: -0.5, look: -0.5, headTilt: -6, expr: 'sad', armL: { a: -50 * (1 - k), b: -60 }, armR: { a: -40 * (1 - k), b: -60 } }, t, 4)} rimId="filmR" shadow={0} />
      <Frame x={1010 - 80 * k} y={720 - 20 * k} s={0.35} bend={1} mud={1} r={-8} />
    </g>
  );
};
// ---------- S68: An, thoughtful: see how the wood dries; mend it, or make another together ----------
export const S68 = closeOf(homeBg, 'c10s68', { look: AN, yaw: -0.25, eye: -0.4, expr: 'neutral', talk: true, tilt: 8 });
// ---------- S69: the photo, still dry in its clear bag ----------
export const S69: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.2], [len, 1.4]]))}>
    <rect x={-400} y={-400} width={2720} height={1900} fill={LINH.jacket} />
    <rect x={700} y={330} width={520} height={420} rx={16} fill="#E8F2F6" opacity={0.5} stroke="#9AB4C0" strokeWidth={6} />
    <Photo x={960} y={540} s={1.2} />
    <path d="M 720 360 L 1200 360" stroke="#5E8AA0" strokeWidth={8} />
  </g>
);
// ---------- S70: close: "I want to keep this one, because I helped you then." ----------
export const S70 = closeOf(homeBg, 'c10s70', { look: LINH, child: true, yaw: 0.25, eye: 0.4, expr: 'sad', talk: true, tilt: -8, z: 3.0 });
// ---------- S71: close: An: "you held the ruler. We'll take it back, clean it, try" ----------
export const S71 = closeOf(homeBg, 'c10s71', { look: AN, yaw: -0.3, eye: -0.4, expr: 'smile', talk: true, tilt: 10 });
// ---------- S72: close: "Dạ. But this time let me measure." ----------
export const S72 = closeOf(homeBg, 'c10s72', { look: LINH, child: true, yaw: 0.3, eye: 0.5, expr: 'smile', talk: true, tilt: -8 });
// ---------- S73: close: An smiles: "We'll go slowly." ----------
export const S73 = closeOf(homeBg, 'c10s73', { look: AN, yaw: -0.25, eye: -0.4, expr: 'smile', talk: true, tilt: 8, z: 2.9 });
// ---------- S74: her hand on the frame beside her father's (the held pause) ----------
export const S74: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.1]]))}>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#8A7458" />
    <Frame x={960} y={600} s={1.4} bend={1} mud={0.4} photo={false} />
    <ArmHand x={600} y={kf(t, [[0, 1500], [20, 1100]])} rot={170} s={1.3} skin={AN.skin} sleeve={AN.jacket} />
    <ArmHand x={kf(t, [[10, 1500], [40, 1180]])} y={kf(t, [[10, 1500], [40, 1150]])} rot={195} s={0.95} skin={LINH.skin} sleeve={LINH.jacket} />
  </g>
);
// ---------- S75: outside the house: not yet: water, power and the damage still to be dealt with ----------
export const S75: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 1000]]), 560, kf(t, [[0, 1.05], [len, 1.0]]))}>
    <MudAlley t={t} id="c10s75" />
    <g transform={`translate(${alleyP(-0.85, 0.3, 0.35).x} ${alleyP(-0.85, 0.3, 0.35).y}) scale(0.6)`}>
      <rect x={-110} y={-70} width={220} height={140} fill="#F4F0E4" stroke={L} strokeWidth={4} />
      <text x={0} y={-20} fontFamily={FONT} fontSize={30} textAnchor="middle" fill="#C8322A">CHƯA Ở</text>
      <text x={0} y={30} fontFamily={FONT} fontSize={26} textAnchor="middle" fill="#2A2A2A">điện, nước</text>
    </g>
  </g>
);

// ================================================================ H: the test beds, the notebook
export const S76: React.FC<ShotProps> = ({ t, len }) => <g transform={camT(kf(t, [[0, 700], [len, 820]]), 520, kf(t, [[0, 1.05], [len, 1.1]]))}><HallOutside t={t} /></g>;
export const S77: React.FC<ShotProps> = ({ t, len }) => <g transform={camT(kf(t, [[0, 1400], [len, 1500]]), 820, kf(t, [[0, 1.6], [len, 1.8]]))}><HallOutside t={t} /></g>;
// ---------- S78: Linh and Nam sow with the grown-ups ----------
export const S78: React.FC<ShotProps> = ({ t, len }) => {
  const sq = squat(1000, 0.8);
  return (
    <g transform={camT(960, 680, 1.4)}>
      <Sky t={t} clear={0.9} />
      <rect x={-400} y={620} width={2720} height={900} fill="#C8BC94" />
      <Beds x={960} y={1060} s={1.1} sprouts={0} t={t} />
      <Hero look={LINH} pose={P({ x: 760, y: sq.y, scale: 0.8, yaw: 0.6, look: 0.6, headTilt: 14, tilt: 14, expr: 'smile', legL: sq.legL, legR: sq.legR, armR: { a: 70 + 10 * Math.sin(t * 0.3), b: 20 }, armL: { a: 30, b: 40 } }, t, 4)} rimId="filmR" shadow={0} />
      <Hero look={NAM} pose={P({ x: 1160, y: sq.y, scale: 0.8, yaw: -0.6, look: -0.6, headTilt: 14, tilt: -14, expr: 'smile', legL: sq.legL, legR: sq.legR, armL: { a: -70 - 10 * Math.sin(t * 0.3 + 1), b: -20 }, armR: { a: -30, b: -40 } }, t, 5)} rimId="filmR" shadow={0} />
      <Hero look={HELPER} pose={P({ x: 1500, y: onFloor(980, 1.0), scale: 1.0, yaw: -0.5, look: -0.6, headTilt: 10, expr: 'smile', armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, 2)} rimId="filmR" shadow={0} />
    </g>
  );
};
// ---------- S79: the rest of the dry seeds, put away for later ----------
export const S79: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.1], [len, 1.25]]))}>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#7E5A3A" />
    <rect x={640} y={360} width={640} height={400} rx={20} fill="#C8B488" stroke={L} strokeWidth={6} />
    <rect x={620} y={kf(t, [[0, 200], [30, 330]])} width={680} height={60} rx={14} fill="#B8A478" stroke={L} strokeWidth={6} />
    <rect x={720} y={480} width={480} height={80} rx={8} fill="#F4F0E4" />
    <text x={960} y={534} fontFamily={FONT} fontSize={40} textAnchor="middle" fill="#2A2A2A">HẠT DỰ PHÒNG</text>
  </g>
);
// ---------- S80: close on the beds: some seeds have come up, some have not ----------
export const S80: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 820, kf(t, [[0, 1.6], [len, 1.8]]))}>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#C8BC94" />
    <Beds x={960} y={1060} s={1.1} sprouts={1} t={t} />
  </g>
);
// ---------- S81/S82: the notebook: past the rain pages, a new line ----------
export const S81: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 700], [len, 960]]), 540, 1.1)}>
    <Notebook lines={3} tally={70} />
  </g>
);
export const S82: React.FC<ShotProps> = ({ t, len }) => {
  const w = kf(t, [[4, 0], [len - 6, 1]]);
  return (
    <g transform={camT(1300, 640, kf(t, [[0, 1.4], [len, 1.6]]))}>
      <Notebook lines={3} tally={70} />
      <clipPath id="c10s82c"><rect x={1000} y={600} width={700 * w} height={80} /></clipPath>
      <text x={1000} y={650} fontFamily={FONT} fontSize={42} fill="#2E5E9A" clipPath="url(#c10s82c)">Hôm nay bắt đầu sửa lại.</text>
      <ArmHand x={1040 + 560 * w} y={700} rot={160} s={0.55} skin={LINH.skin} sleeve={LINH.jacket} />
    </g>
  );
};

// ================================================================ I: the end table
const at = (u: number, w: number) => stand(HALL, u, w);
/** The work table at the end of the hall, seen across it: the family behind it, the frame lying on it, hands down at the work. */
const TableScene: React.FC<{ t: number; id: string; linh?: number; chair?: number; z?: number; cx?: number; cy?: number; turn?: number }> = ({ t, id, linh = 1, chair = 0, z = 1.6, cx = 960, cy = 620, turn = 0 }) => {
  const work = (ph: number) => ({ a: -14 - 4 * Math.sin(t * 0.2 + ph), b: -40 });
  const workR = (ph: number) => ({ a: -14 - 4 * Math.sin(t * 0.2 + ph + 1), b: -40 });
  return (
    <g transform={camT(cx, cy, z)}>
      <g transform="translate(-420 120)"><Hall t={t} id={id} /></g>
      <Hero look={AN} pose={P({ x: 700, y: 700, scale: 1.0, yaw: 0.3 - 0.6 * turn, look: 0.3 - 0.5 * turn, headTilt: 16 - 10 * turn, expr: 'smile', armL: work(0), armR: workR(0) }, t, 1)} rimId="filmR" shadow={0} />
      <Hero look={HANH} pose={P({ x: 1240, y: 700, scale: 1.0, yaw: -0.3, look: -0.4, headTilt: 14, expr: 'smile', armL: work(1), armR: workR(1) }, t, 3)} rimId="filmR" shadow={0} />
      {linh > 0 ? <Hero look={LINH} pose={P({ x: 960 - 30 * chair, y: 780 + (1 - linh) * 300, scale: 0.75, yaw: 0, look: 0, headTilt: -14, expr: 'smile', armL: work(2), armR: workR(2) }, t, 4)} rimId="filmR" shadow={0} /> : null}
      {chair > 0 ? (
        <g transform={`translate(${1500 - 300 * chair} 760)`}>
          <rect x={-60} y={0} width={120} height={20} fill="#8A6440" stroke={L} strokeWidth={4} />
          <rect x={-60} y={-120} width={18} height={140} fill="#6E4C30" />
          <rect x={-50} y={20} width={14} height={120} fill="#6E4C30" />
          <rect x={36} y={20} width={14} height={120} fill="#6E4C30" />
        </g>
      ) : null}
      {/* the work table in front of them, the frame lying on it */}
      <rect x={200} y={800} width={1520} height={40} fill="#94704E" stroke={L} strokeWidth={6} />
      <rect x={220} y={840} width={1480} height={400} fill="#7E5A3A" stroke={L} strokeWidth={6} />
      <g transform={`translate(960 816) rotate(${-4 + 180 * turn}) scale(0.42 0.12)`}>
        <polygon points="-190,-150 190,-150 216,120 -190,150" fill="#8A5A36" stroke={L} strokeWidth={14} />
        <polygon points="-160,-120 160,-120 180,94 -160,120" fill="#3A2A20" />
      </g>
      <rect x={1080} y={810} width={240} height={14} fill="#E8C878" stroke={L} strokeWidth={3} transform="rotate(-3 1200 816)" />
    </g>
  );
};
// ---------- S83: wide: at the end table An calls her over; Hạnh holds a corner of the frame ----------
export const S83: React.FC<ShotProps> = ({ t, len }) => <TableScene t={t} id="c10s83" linh={0} z={kf(t, [[0, 1.0], [len, 1.25]])} />;
// ---------- S84: the small wedge of wood tried under the warped corner ----------
export const S84: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(1200, 640, kf(t, [[0, 1.4], [len, 1.6]]))}>
    <TableTop t={t} wedge={kf(t, [[6, 0], [len, 1]])}>
      <ArmHand x={1500} y={900} rot={120} s={1.0} skin={AN.skin} sleeve={AN.jacket} />
      <ArmHand x={420} y={300} rot={-60} s={1.0} skin={HANH.skin} sleeve={HANH.jacket} />
    </TableTop>
  </g>
);
// ---------- S85: Linh shuts the notebook and runs over ----------
export const S85: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[0, 0], [len, 1]]);
  const p = at(0.3 + 0.4 * k, 0.6 - 0.25 * k);
  return (
    <g transform={camT(960 + 200 * k, 520, 1.15)}>
      <Hall t={t} id="c10s85" />
      <Hero look={LINH} pose={P({ x: p.x, y: p.y, scale: p.scale * 0.72, yaw: 0.6, look: 0.6, tilt: 8, expr: 'smile', ...walk(t * 1.6, 0, 30), ...swing(t * 1.6) }, t, 4)} rimId="filmR" shadow={0} />
    </g>
  );
};
// ---------- S86-S91: the repair, close by close ----------
const tableBg = (t: number, id: string) => <g transform="translate(-420 120)"><Hall t={t} id={id} /></g>;
export const S86 = closeOf(tableBg, 'c10s86', { look: LINH, child: true, yaw: 0.3, eye: 0.4, expr: 'smile', talk: true, tilt: -6 });
export const S87 = closeOf(tableBg, 'c10s87', { look: AN, yaw: -0.3, eye: -0.4, expr: 'smile', talk: true, tilt: 10 });
// ---------- S88: the ruler's marks, her finger on them ----------
export const S88: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.3], [len, 1.5]]))}>
    <TableTop t={t} wedge={0.6}>
      <Ruler x={960} y={720} s={1.2} r={-4} />
      <ArmHand x={kf(t, [[0, 900], [len, 980]])} y={1010} rot={185} s={0.8} skin={LINH.skin} sleeve={LINH.jacket} />
    </TableTop>
  </g>
);
export const S89 = closeOf(tableBg, 'c10s89', { look: LINH, child: true, yaw: 0.25, eye: 0.2, expr: 'determined', talk: true, tilt: -16 });
// ---------- S90: An stops and turns the frame round for her ----------
export const S90: React.FC<ShotProps> = ({ t, len }) => <TableScene t={t} id="c10s90" z={2.2} turn={kf(t, [[6, 0], [36, 1]])} />;
export const S91 = closeOf(tableBg, 'c10s91', { look: AN, yaw: -0.3, eye: -0.5, expr: 'smile', talk: true, tilt: 12, z: 2.9 });
// ---------- S92: Hạnh pulls a chair closer for her ----------
export const S92: React.FC<ShotProps> = ({ t, len }) => <TableScene t={t} id="c10s92" z={1.8} chair={kf(t, [[0, 0], [30, 1]])} />;
// ---------- S93: outside: the neighbours' washing swings in the sun ----------
export const S93: React.FC<ShotProps> = ({ t, len }) => <g transform={camT(kf(t, [[0, 1440], [len, 1560]]), 560, 1.9)}><HallOutside t={t} /></g>;

// ================================================================ J: the list, and the thoughts
export const S94: React.FC<ShotProps> = ({ t, len }) => {
  const a = at(0.42, 0.18);
  const b = at(0.52, 0.2);
  return (
    <g transform={camT(a.x + 80, a.y - 60, 1.7)}>
      <Hall t={t} id="c10s94" />
      <Hero look={HELPER} pose={P({ ...a, yaw: 0.3, look: 0.2, headTilt: 14, expr: 'neutral', armR: { a: 60 + 8 * Math.sin(t * 0.4), b: 60 }, armL: { a: 12, b: 16 } }, t, 2)} rimId="filmR" shadow={0} />
      <Hero look={EXTRA[0]} pose={P({ ...b, yaw: -0.3, look: -0.3, headTilt: 10, expr: 'determined', talk: talkAt(t, 4, len - 4), armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, 3)} rimId="filmR" shadow={0} />
    </g>
  );
};
export const S95: React.FC<ShotProps> = ({ t, len }) => <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.08]]))}><ChangeList k={kf(t, [[0, 0.4], [len, 3.2]])} /></g>;
export const S96: React.FC<ShotProps> = ({ t, len }) => <g transform={camT(960, 640, kf(t, [[0, 1.1], [len, 1.2]]))}><ChangeList k={kf(t, [[0, 3.2], [len, 5]])} /></g>;
// ---------- S97: not the strength of the elephant, nor the bear's claws ----------
export const S97: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[56, 0], [78, 1]]);
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.08]]))}>
      <g opacity={1 - k}>
        <Savanna t={t}>
          <Elephant x={kf(t, [[0, 560], [60, 700]])} y={1000} s={1.05} t={t} />
        </Savanna>
      </g>
      <g opacity={k}>
        <ForestBg t={t} />
        <Bear x={960} y={1060} s={1.0} t={t} />
      </g>
    </g>
  );
};
// ---------- S98: a hive at its work: bees on the flowers and round the comb ----------
export const S98: React.FC<ShotProps> = ({ t, len }) => <g transform={camT(1000, 520, kf(t, [[0, 1.0], [len, 1.12]]))}><Bees t={t} /></g>;
// ---------- S99: the hall at the end of the day, people at their small tasks: what keeps us going? ----------
export const S99: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 500, kf(t, [[0, 1.15], [len, 1.0]]))}>
    <Hall t={t} id="c10s99" sun={0.6} />
    {[[0.3, 0.5, EXTRA[0]], [0.5, 0.4, EXTRA[2]], [0.66, 0.6, SAU], [0.4, 0.75, NAM]].map(([u, w, lk], i) => {
      const s = at(u as number, w as number);
      return <Hero key={i} look={lk as typeof AN} pose={P({ x: s.x, y: s.y, scale: s.scale * (lk === NAM ? 0.72 : 1), yaw: i % 2 ? -0.4 : 0.4, look: 0, headTilt: 10, expr: 'neutral', talk: talkAt(t, 10 * i, len), armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, i + 2)} rimId="filmR" shadow={0} />;
    })}
    <rect x={-400} y={-400} width={2720} height={1900} fill="#FFC880" opacity={0.12} style={{ mixBlendMode: 'screen' }} />
  </g>
);
// ---------- S100: small things: hands at work on the frame ----------
export const S100: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.12]]))}>
    <TableTop t={t} wedge={0.8}>
      <ArmHand x={1500} y={900} rot={120} s={1.0} skin={AN.skin} sleeve={AN.jacket} />
      <ArmHand x={600} y={1250} rot={170} s={0.9} skin={LINH.skin} sleeve={LINH.jacket} />
    </TableTop>
  </g>
);
// ---------- S101: (cảnh 8) someone hands over a dry blanket ----------
export const S101: React.FC<ShotProps> = (p) => <g><Blanket8 {...p} /><rect x={-400} y={-400} width={2720} height={1900} fill="#F4E0B0" opacity={0.12} /></g>;
// ---------- S102: (cảnh 8) someone goes back to count every face ----------
export const S102: React.FC<ShotProps> = (p) => <g><RollCall8 {...p} /><rect x={-400} y={-400} width={2720} height={1900} fill="#F4E0B0" opacity={0.1} /></g>;
// ---------- S103: a family sits down to learn to mend what broke ----------
export const S103: React.FC<ShotProps> = ({ t, len }) => <TableScene t={t} id="c10s103" z={kf(t, [[0, 2.0], [len, 2.2]])} />;
// ---------- S104: the whole neighbourhood remembers: the list pinned up where everyone passes ----------
export const S104: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 1000]]), 600, 1.15)}>
    <MudAlley t={t} id="c10s104">
      <g transform={`translate(${alleyP(-0.85, 0.25, 0.4).x} ${alleyP(-0.85, 0.25, 0.4).y}) scale(0.16)`}><rect x={-660} y={-430} width={1320} height={860} fill="#F4F0E4" stroke="#8A7A58" strokeWidth={20} />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-560} y={-300 + i * 140} width={900 - 120 * (i % 2)} height={40} fill={i === 3 ? '#3E8A4E' : i === 4 ? '#C8322A' : '#4A4A4A'} />)}</g>
      {[[-0.4, 0.3, EXTRA[0]], [-0.2, 0.36, EXTRA[3]], [0.3, 0.28, SAU]].map(([sd, d, lk], i) => (
        <Hero key={i} look={lk as typeof AN} pose={P({ ...inAlley(sd as number, d as number), yaw: -0.6, look: -0.6, headTilt: -4, expr: 'neutral', armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, i + 2)} rimId="filmR" shadow={0} />
      ))}
    </MudAlley>
  </g>
);
// ---------- S105: not everyone is whole enough to start again: bà Sáu alone at the shutter ----------
export const S105: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(900, kf(t, [[0, 560], [len, 480]]), kf(t, [[0, 1.4], [len, 1.9]]))}>
    <ShopFront id="c10s105" t={t} tarp={0} />
    <rect x={300} y={300} width={1300} height={500} fill="#7A7E84" opacity={0.85} />
    <Hero look={SAU} pose={P({ x: 900, y: 640, scale: 1.0, yaw: -0.2, look: -0.4, headTilt: 12, expr: 'sad', armL: { a: 12, b: 16 }, armR: { a: 12, b: 16 } }, t, 2)} rimId="filmR" shadow={0} />
  </g>
);
// ---------- S106: losses no encouragement can make up: the empty drowned room ----------
export const S106: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.08]]))}>
    {livingBg(t, 'c10s106')}
    <rect x={-400} y={-400} width={2720} height={1900} fill="#3A3A40" opacity={0.25} />
  </g>
);
// ---------- S107: give your hand to be helped up ----------
export const S107: React.FC<ShotProps> = ({ t, len }) => {
  const k = kf(t, [[0, 0], [30, 1]]);
  return (
    <g transform={camT(960, 560, 0.8)}>
      <rect x={-800} y={-800} width={3600} height={2600} fill="#C8BC94" />
      <Glow x={960} y={300} r={900} o={0.4} />
      <ArmHand x={900} y={kf(t, [[0, -100], [30, 160]])} rot={6} s={2.0} skin={HANH.skin} sleeve={HANH.jacket} />
      <g transform={`translate(0 ${-80 * k})`}><ArmHand x={1010} y={1350} rot={186} s={1.8} skin={SAU.skin} sleeve={SAU.jacket} /></g>
    </g>
  );
};
// ---------- S108: and when strong enough, help the one beside you: Nam steadies bà Sáu, who hands a shovel on ----------
export const S108: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(1000, 560, kf(t, [[0, 1.3], [len, 1.45]]))}>
    <ShopFront id="c10s108" t={t} tarp={0} />
    <rect x={-400} y={800} width={2720} height={700} fill={MUD} opacity={0.55} />
    <Hero look={SAU} pose={P({ x: 860, y: 640, scale: 1.0, yaw: 0.5, look: 0.5, expr: 'smile', armL: { a: 12, b: 16 }, armR: { a: 70, b: 30 } }, t, 2)} rimId="filmR" shadow={0} />
    <Hero look={NAM} pose={P({ x: 700, y: onFloor(640 + LEG_LEN, 0.75), scale: 0.75, yaw: 0.5, look: 0.5, expr: 'smile', armR: { a: 70, b: 40 }, armL: { a: 12, b: 16 } }, t, 5)} rimId="filmR" shadow={0} />
    <Hero look={EXTRA[2]} pose={P({ x: 1240, y: 650, scale: 0.98, yaw: -0.5, look: -0.5, expr: 'smile', armL: { a: -70, b: -20 }, armR: { a: 12, b: 16 } }, t, 6)} rimId="filmR" shadow={0} />
  </g>
);
// ---------- S109: wide: the alley at work in the sun ----------
export const S109: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, kf(t, [[0, 640], [len, 560]]), kf(t, [[0, 1.15], [len, 1.0]]))}>
    <MudAlley t={t} id="c10s109">
      <Shoveller t={t} at={inAlley(-0.55, 0.35)} look={EXTRA[0]} seed={2} yaw={0.6} />
      <Shoveller t={t} at={inAlley(0.5, 0.25)} look={EXTRA[3]} seed={5} yaw={-0.6} />
      <Shoveller t={t} at={inAlley(0.15, 0.55)} look={EXTRA[2]} seed={7} yaw={0.6} />
      <Shoveller t={t} at={inAlley(-0.2, 0.15)} look={HELPER} seed={9} yaw={0.6} />
      <Wheelbarrow x={alleyP(0.62, 0.42).x} y={alleyP(0.62, 0.42).y} s={0.5} />
    </MudAlley>
  </g>
);

// ================================================================ K: the end
// ---------- S110: the frame still crooked at one corner; Linh holds the ruler and waits for her father ----------
export const S110: React.FC<ShotProps> = ({ t, len }) => <TableScene t={t} id="c10s110" z={kf(t, [[0, 2.4], [len, 2.0]])} />;
// ---------- S111: out under the eave of the hall, a bird calls ----------
export const S111: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 900], [len, 1000]]), 460, kf(t, [[0, 1.15], [len, 1.3]]))}>
    <Sky t={t} clear={1} />
    <path d="M -400 640 Q 500 560 1200 620 Q 1800 580 2320 640 L 2320 1500 L -400 1500 Z" fill="#6E8A5A" />
    {/* the hall's tin roof, seen from the yard, its edge (the eave) running across */}
    <polygon points="-400,-100 2320,-100 2320,330 -400,420" fill="#3E6E8A" stroke="#2A4A5E" strokeWidth={6} />
    {Array.from({ length: 22 }).map((_, i) => <path key={i} d={`M ${-380 + i * 130} -100 L ${-380 + i * 130} ${420 - i * 4.4}`} stroke="#2E5A74" strokeWidth={8} />)}
    <polygon points="-400,420 2320,330 2320,372 -400,462" fill="#2A4A5E" stroke="#1E3646" strokeWidth={4} />
    <rect x={-400} y={462} width={2720} height={20} fill="#D8C49A" opacity={0.0} />
    {/* the wall below the eave, a post, a branch with leaves coming in at the right */}
    <rect x={-400} y={440} width={2720} height={500} fill="#E2CFA0" />
    <rect x={210} y={430} width={34} height={500} fill="#8A6440" stroke={L} strokeWidth={4} />
    <path d="M 2320 320 Q 1900 300 1640 360" stroke="#5A4128" strokeWidth={24} fill="none" strokeLinecap="round" />
    {Array.from({ length: 9 }).map((_, i) => <ellipse key={i} cx={1700 + i * 70} cy={330 + 40 * Math.sin(i * 1.7) + 4 * Math.sin(t * 0.08 + i)} rx={46} ry={24} fill={i % 2 ? '#6E9A4E' : '#5E8A40'} transform={`rotate(${-20 + 10 * i} ${1700 + i * 70} 330)`} />)}
    {/* the bird on the very edge of the roof, calling: beak open, notes drifting up */}
    <g transform="translate(980 376)">
      <Bird x={0} y={0} s={1.9} flap={0} t={t} />
      {[0, 1, 2].map((i) => {
        const ph = (t * 0.03 + i / 3) % 1;
        return <text key={i} x={90 + 70 * ph + i * 14} y={-120 - 140 * ph} fontSize={64 + 14 * i} fill="#3A2A1A" opacity={1 - ph}>♪</text>;
      })}
    </g>
  </g>
);
// ---------- S112: wide: the bright sky over the hall ----------
export const S112: React.FC<ShotProps> = ({ t, len }) => <g transform={camT(kf(t, [[0, 800], [len, 700]]), kf(t, [[0, 500], [len, 400]]), kf(t, [[0, 1.0], [len, 0.92]]))}><HallOutside t={t} sprouts={0.6} /></g>;
// ---------- S113: the hands at work on the frame, held until the dark ----------
export const S113: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.1]]))}>
      <TableTop t={t} wedge={0.85}>
        <Ruler x={960} y={720} s={1.2} r={-4} />
        <ArmHand x={1500} y={900} rot={120} s={1.0} skin={AN.skin} sleeve={AN.jacket} />
        <ArmHand x={980} y={1180} rot={185} s={0.9} skin={LINH.skin} sleeve={LINH.jacket} />
      </TableTop>
    </g>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#000" opacity={kf(t, [[len - 90, 0], [len, 1]])} />
  </g>
);

export const SHOTS: Record<string, React.FC<ShotProps>> = {
  S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28, S29, S30,
  S31, S32, S33, S34, S35, S36, S37, S38, S39, S40, S41, S42, S43, S44, S45, S46, S47, S48, S49, S50, S51, S52, S53, S54, S55, S56, S57, S58, S59, S60,
  S61, S62, S63, S64, S65, S66, S67, S68, S69, S70, S71, S72, S73, S74, S75, S76, S77, S78, S79, S80, S81, S82, S83, S84, S85, S86, S87, S88, S89, S90,
  S91, S92, S93, S94, S95, S96, S97, S98, S99, S100, S101, S102, S103, S104, S105, S106, S107, S108, S109, S110, S111, S112, S113,
};
