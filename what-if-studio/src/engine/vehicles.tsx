import React from 'react';
import { FONT } from './fonts';
import { Glow, Cone } from './light';

/**
 * Studio Vehicle, Street & Vietnamese House Architecture Kit (`vehicles.tsx`).
 * Every vehicle is anchored at `(x, y)` = ground contact center under the wheels,
 * faces right by default (`flip = true` faces left), scales by `s`, and rotates wheels by `t * speed`.
 */

const INK = '#16141C';
const RIM = '#FFB46A';

/** Shared spoked/alloy wheel with tire tread, brake disc, and spinning spokes. */
const Wheel: React.FC<{
  cx: number;
  cy: number;
  r: number;
  rot?: number;
  spokes?: number;
  hub?: string;
  tire?: string;
}> = ({ cx, cy, r, rot = 0, spokes = 6, hub = '#B8C2CC', tire = '#1E1D26' }) => (
  <g transform={`translate(${cx} ${cy})`}>
    <circle r={r} fill={tire} stroke={INK} strokeWidth={4} />
    <circle r={r * 0.72} fill="#2A2934" stroke={hub} strokeWidth={3.5} />
    <g transform={`rotate(${rot})`}>
      {Array.from({ length: spokes }).map((_, i) => {
        const a = (i / spokes) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={0}
            y1={0}
            x2={Math.cos(a) * r * 0.68}
            y2={Math.sin(a) * r * 0.68}
            stroke={hub}
            strokeWidth={3}
          />
        );
      })}
    </g>
    <circle r={r * 0.22} fill={hub} stroke={INK} strokeWidth={2.5} />
  </g>
);

/**
 * Returns the hip position `{ x, y }` for a character sitting on a `Motorbike` or `Scooter`
 * drawn at `(bx, by)` with scale `s` and `flip`. Pair with `sitPose(bx, by, yaw)` or custom leg angles.
 */
export const motorbikeSeat = (bx: number, by: number, s = 1, flip = false, passenger = false) => {
  const dir = flip ? -1 : 1;
  const dx = passenger ? -92 : -28;
  return { x: bx + dir * dx * s, y: by - 138 * s };
};

/**
 * Classic Vietnamese underbone motorbike (`Motorbike` / Xe máy số kiểu Honda Wave / Dream / Cub):
 * Includes front basket option, exhaust pipe, rear shock absorber, kickstand, mirror, and headlight beam.
 */
export const Motorbike: React.FC<{
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  t?: number;
  speed?: number;
  color?: string;
  headlight?: number;
  standDown?: boolean;
  basket?: boolean;
}> = ({
  x,
  y,
  s = 1,
  flip = false,
  t = 0,
  speed = 0,
  color = '#2E5A88',
  headlight = 1,
  standDown = true,
  basket = true,
}) => {
  const rot = t * 14 * speed;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {/* Contact shadow */}
      <ellipse cx={0} cy={6} rx={195} ry={16} fill="#000" opacity={0.42} />
      {/* Headlight cone */}
      {headlight > 0 ? (
        <g>
          <Cone d="M 142 -156 L 152 -140 L 480 -20 L 480 -210 Z" o={0.28 * headlight} />
          <Glow x={152} y={-148} r={90} o={0.55 * headlight} />
        </g>
      ) : null}
      {/* Rear & front wheels */}
      <Wheel cx={-114} cy={-56} r={54} rot={rot} spokes={8} />
      <Wheel cx={118} cy={-56} r={54} rot={rot} spokes={8} />
      {/* Chrome exhaust pipe & engine block */}
      <path d="M -20 -46 L -142 -58 L -146 -46 L -18 -34 Z" fill="#C8D2DC" stroke={INK} strokeWidth={3.5} />
      <rect x={-32} y={-76} width={58} height={38} rx={8} fill="#7A8490" stroke={INK} strokeWidth={3.5} />
      {/* Rear suspension spring */}
      <path d="M -92 -118 L -110 -58" stroke="#D9534F" strokeWidth={9} strokeDasharray="5 4" />
      <path d="M -92 -118 L -110 -58" stroke={INK} strokeWidth={3} />
      {/* Front fork & mudguard */}
      <path d="M 82 -168 L 118 -56" stroke="#9AA4B0" strokeWidth={12} strokeLinecap="round" />
      <path d="M 82 -168 L 118 -56" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <path d="M 78 -92 Q 124 -108 156 -82 L 116 -74 Z" fill={color} stroke={INK} strokeWidth={3.5} />
      {/* Underbone frame & leg shield (yếm xe) */}
      <path
        d="M -146 -116 L -48 -122 L 16 -68 L 68 -148 L 96 -142 L 42 -48 L -34 -48 L -118 -94 Z"
        fill={color}
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      {/* White leg shield fairing */}
      <path d="M 38 -62 L 76 -144 L 94 -136 L 58 -54 Z" fill="#F0EDE6" stroke={INK} strokeWidth={3} />
      {/* Side body rim highlight */}
      <path d="M -140 -114 L -48 -120" stroke={RIM} strokeWidth={3} fill="none" opacity={0.6} />
      {/* Two-seat black saddle */}
      <path
        d="M -134 -120 Q -138 -144 -96 -144 L -6 -136 Q 8 -134 4 -118 L -134 -116 Z"
        fill="#22202A"
        stroke={INK}
        strokeWidth={3.5}
      />
      {/* Rear grab rail / cargo rack */}
      <path d="M -132 -132 L -166 -136 L -152 -116" stroke="#B8C2CC" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Taillight */}
      <rect x={-154} y={-118} width={12} height={14} rx={3} fill="#E4544A" stroke={INK} strokeWidth={2.5} />
      {/* Front basket (giỏ xe) */}
      {basket ? (
        <g transform="translate(106 -146)">
          <polygon points="0,0 38,-4 32,38 4,38" fill="#2A2834" opacity={0.85} stroke={INK} strokeWidth={3} />
          <line x1={12} y1={0} x2={12} y2={38} stroke="#6A7080" strokeWidth={2} />
          <line x1={24} y1={-2} x2={22} y2={38} stroke="#6A7080" strokeWidth={2} />
        </g>
      ) : null}
      {/* Handlebar, headlight unit & rear-view mirror */}
      <path d="M 68 -168 L 98 -168 L 106 -148 L 76 -148 Z" fill={color} stroke={INK} strokeWidth={3.5} />
      <ellipse cx={106} cy={-158} rx={8} ry={11} fill={headlight > 0 ? '#FFF2B8' : '#C8D2DC'} stroke={INK} strokeWidth={2.5} />
      <path d="M 76 -168 L 54 -174" stroke="#1E1C26" strokeWidth={7} strokeLinecap="round" />
      <path d="M 80 -168 L 74 -204 L 62 -208" stroke="#9AA4B0" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <ellipse cx={58} cy={-208} rx={10} ry={7} fill="#3A3846" stroke={INK} strokeWidth={2.5} />
      {/* Kickstand */}
      {standDown && speed === 0 ? (
        <path d="M -18 -44 L -38 2" stroke="#2A2834" strokeWidth={6} strokeLinecap="round" />
      ) : null}
    </g>
  );
};

/**
 * Modern Vietnamese city step-through scooter (`Scooter` / Xe tay ga kiểu Vision / Lead):
 * Curved rear body, flat floorboard, wide seat, and bright LED headlight.
 */
export const Scooter: React.FC<{
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  t?: number;
  speed?: number;
  color?: string;
  headlight?: number;
}> = ({ x, y, s = 1, flip = false, t = 0, speed = 0, color = '#D8CFC2', headlight = 1 }) => {
  const rot = t * 15 * speed;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={6} rx={190} ry={16} fill="#000" opacity={0.42} />
      {headlight > 0 ? (
        <g>
          <Cone d="M 134 -154 L 144 -136 L 460 -20 L 460 -200 Z" o={0.26 * headlight} />
          <Glow x={142} y={-146} r={85} o={0.5 * headlight} />
        </g>
      ) : null}
      <Wheel cx={-108} cy={-48} r={46} rot={rot} spokes={5} />
      <Wheel cx={112} cy={-48} r={46} rot={rot} spokes={5} />
      {/* CVT transmission box */}
      <rect x={-118} y={-62} width={76} height={26} rx={12} fill="#34323E" stroke={INK} strokeWidth={3.5} />
      {/* Curved step-through scooter body */}
      <path
        d="M -148 -98 Q -138 -134 -74 -132 L -16 -124 L 6 -58 L 58 -58 L 82 -156 L 122 -144 Q 134 -96 96 -46 L -126 -46 Z"
        fill={color}
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <path d="M -140 -106 Q -118 -130 -68 -128" stroke={RIM} strokeWidth={3} fill="none" opacity={0.65} />
      {/* Saddle */}
      <path
        d="M -132 -128 Q -134 -150 -86 -150 L -8 -140 Q 4 -136 0 -122 L -132 -124 Z"
        fill="#3A2824"
        stroke={INK}
        strokeWidth={3.5}
      />
      {/* Front mudguard */}
      <path d="M 82 -84 Q 124 -96 148 -72 L 104 -66 Z" fill={color} stroke={INK} strokeWidth={3} />
      {/* Handlebar cowl & mirror */}
      <path d="M 72 -172 L 106 -170 L 114 -152 L 76 -152 Z" fill={color} stroke={INK} strokeWidth={3.5} />
      <ellipse cx={114} cy={-160} rx={7} ry={10} fill="#FFF4C2" stroke={INK} strokeWidth={2.5} />
      <path d="M 82 -172 L 76 -206 L 64 -210" stroke="#9AA4B0" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <circle cx={60} cy={-210} r={8} fill="#2A2834" stroke={INK} strokeWidth={2.5} />
    </g>
  );
};

/**
 * Classic Vietnamese student/alley bicycle (`Bicycle` / Xe đạp có giỏ trước và yên sau):
 */
export const Bicycle: React.FC<{
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  t?: number;
  speed?: number;
  color?: string;
}> = ({ x, y, s = 1, flip = false, t = 0, speed = 0, color = '#4A7A96' }) => {
  const rot = t * 10 * speed;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={5} rx={180} ry={12} fill="#000" opacity={0.38} />
      <Wheel cx={-106} cy={-60} r={58} rot={rot} spokes={10} tire="#22202A" />
      <Wheel cx={108} cy={-60} r={58} rot={rot} spokes={10} tire="#22202A" />
      {/* Diamond/step-through frame */}
      <g stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M -106 -60 L -24 -60 L -52 -136 L -106 -60" />
        <path d="M -24 -60 L 72 -132 L -44 -116" />
        <path d="M 66 -156 L 108 -60" />
      </g>
      {/* Rear passenger rack (gác-ba-ga) */}
      <path d="M -56 -124 L -132 -124 L -106 -60 M -84 -124 L -106 -60" stroke="#9AA4B0" strokeWidth={4.5} fill="none" strokeLinejoin="round" />
      {/* Saddle & handlebars */}
      <path d="M -72 -144 L -32 -144 Q -28 -134 -42 -134 L -68 -134 Z" fill="#2A2220" stroke={INK} strokeWidth={3} />
      <path d="M 66 -156 L 58 -176 L 38 -172" stroke="#9AA4B0" strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* Chainring & pedal */}
      <circle cx={-24} cy={-60} r={16} fill="#B8C2CC" stroke={INK} strokeWidth={3} />
      {/* Front wire basket */}
      <polygon points="82,-154 118,-158 112,-116 86,-116" fill="#D8D2C5" opacity={0.75} stroke={INK} strokeWidth={2.5} />
    </g>
  );
};

/**
 * 4-door city sedan / taxi (`SedanCar` / Ô tô 4 chỗ hoặc Taxi):
 * Includes windows with interior silhouettes, headlights, taillights, and optional `taxi` roof sign.
 */
export const SedanCar: React.FC<{
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  t?: number;
  speed?: number;
  color?: string;
  headlight?: number;
  taxi?: boolean;
}> = ({ x, y, s = 1, flip = false, t = 0, speed = 0, color = '#3B526E', headlight = 1, taxi = false }) => {
  const rot = t * 12 * speed;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={8} rx={340} ry={22} fill="#000" opacity={0.45} />
      {headlight > 0 ? (
        <g>
          <Cone d="M 312 -96 L 318 -76 L 740 10 L 740 -160 Z" o={0.3 * headlight} />
          <Glow x={316} y={-88} r={110} o={0.55 * headlight} />
        </g>
      ) : null}
      {/* Car body */}
      <path
        d="M -310 -54 L -316 -118 Q -312 -138 -276 -142 L -196 -148 L -120 -226 Q -102 -242 -70 -242 L 88 -242 Q 124 -242 152 -214 L 222 -144 L 296 -130 Q 322 -122 324 -94 L 320 -52 Z"
        fill={color}
        stroke={INK}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* Lower body shade */}
      <path d="M -310 -54 L 320 -54 L 322 -88 L -314 -88 Z" fill="#000" opacity={0.2} />
      {/* Warm roof highlight */}
      <path d="M -112 -230 Q 0 -244 134 -226" stroke={RIM} strokeWidth={3.5} fill="none" opacity={0.65} />
      {/* Windows */}
      <path d="M -172 -148 L -110 -218 L -8 -218 L -8 -148 Z" fill="#222C3C" stroke={INK} strokeWidth={3.5} />
      <path d="M 8 -148 L 8 -218 L 96 -218 Q 122 -218 142 -196 L 196 -148 Z" fill="#222C3C" stroke={INK} strokeWidth={3.5} />
      <path d="M 24 -212 L 84 -212 L 42 -152 L 12 -152 Z" fill="#9FC0FF" opacity={0.18} />
      {/* Door seam & handles */}
      <line x1={0} y1={-222} x2={0} y2={-62} stroke={INK} strokeWidth={3} opacity={0.65} />
      <rect x={-52} y={-132} width={26} height={7} rx={3.5} fill="#D8E0E8" stroke={INK} strokeWidth={2} />
      <rect x={24} y={-132} width={26} height={7} rx={3.5} fill="#D8E0E8" stroke={INK} strokeWidth={2} />
      {/* Headlight & taillight */}
      <path d="M 294 -120 L 322 -112 L 322 -92 L 290 -96 Z" fill="#FFF2B8" stroke={INK} strokeWidth={3} />
      <path d="M -314 -126 L -292 -122 L -292 -96 L -314 -98 Z" fill="#E4544A" stroke={INK} strokeWidth={3} />
      <Glow x={-314} y={-110} r={54} kind="red" o={0.38} />
      {/* Optional Taxi sign */}
      {taxi ? (
        <g transform="translate(0 -244)">
          <path d="M -44 0 L -34 -26 L 34 -26 L 44 0 Z" fill="#FFE28A" stroke={INK} strokeWidth={3} />
          <text x={0} y={-7} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={16} fill="#1E1820">
            TAXI
          </text>
        </g>
      ) : null}
      {/* Wheels */}
      <Wheel cx={-194} cy={-56} r={56} rot={rot} spokes={5} />
      <Wheel cx={198} cy={-56} r={56} rot={rot} spokes={5} />
    </g>
  );
};

/**
 * Small Vietnamese flatbed/cargo truck (`SmallTruck` / Xe tải nhỏ chở hàng & vật liệu):
 */
export const SmallTruck: React.FC<{
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  t?: number;
  speed?: number;
  color?: string;
  headlight?: number;
}> = ({ x, y, s = 1, flip = false, t = 0, speed = 0, color = '#2E6288', headlight = 1 }) => {
  const rot = t * 11 * speed;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={8} rx={360} ry={22} fill="#000" opacity={0.45} />
      {headlight > 0 ? <Cone d="M 326 -104 L 332 -82 L 720 10 L 720 -170 Z" o={0.28 * headlight} /> : null}
      {/* Cargo box / canvas tarp at back */}
      <rect x={-330} y={-290} width={380} height={210} rx={8} fill="#5C6B78" stroke={INK} strokeWidth={5} />
      {[-250, -160, -70].map((bx, i) => (
        <line key={i} x1={bx} y1={-286} x2={bx} y2={-130} stroke="#3E4954" strokeWidth={4} />
      ))}
      <rect x={-334} y={-134} width={388} height={56} rx={4} fill={color} stroke={INK} strokeWidth={4.5} />
      {/* Cab at front */}
      <path
        d="M 56 -266 L 204 -266 Q 238 -266 258 -228 L 304 -144 L 328 -132 L 328 -68 L 56 -68 Z"
        fill={color}
        stroke={INK}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d="M 82 -242 L 200 -242 Q 222 -242 238 -212 L 274 -148 L 82 -148 Z" fill="#222C3C" stroke={INK} strokeWidth={3.5} />
      <rect x={306} y={-122} width={22} height={26} rx={4} fill="#FFF2B8" stroke={INK} strokeWidth={3} />
      <Wheel cx={-210} cy={-60} r={60} rot={rot} spokes={6} />
      <Wheel cx={210} cy={-60} r={60} rot={rot} spokes={6} />
    </g>
  );
};

/**
 * Vietnamese street vendor pushcart (`StreetCart` / Xe đẩy hàng rong - bánh mì, hủ tiếu, cà phê đầu hẻm):
 * Glass display cabinet, warm hanging bulb, red-white awning, spoked wheels, and rising steam.
 */
export const StreetCart: React.FC<{
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  t?: number;
  title?: string;
  sub?: string;
  lightOn?: number;
}> = ({ x, y, s = 1, flip = false, t = 0, title = 'HỦ TIẾU GÕ', sub = 'Nóng giòn • Đêm khuya', lightOn = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <ellipse cx={0} cy={6} rx={165} ry={15} fill="#000" opacity={0.42} />
    {lightOn > 0 ? <Glow x={0} y={-225} r={240} o={0.55 * lightOn} /> : null}
    {/* Corner posts */}
    <line x1={-122} y1={-130} x2={-122} y2={-292} stroke="#8E99A4" strokeWidth={6} />
    <line x1={122} y1={-130} x2={122} y2={-292} stroke="#8E99A4" strokeWidth={6} />
    {/* Glass food cabinet */}
    <rect x={-118} y={-246} width={236} height={116} fill="#CFE6F5" opacity={0.22} stroke="#B8C2CC" strokeWidth={3} />
    {/* Hanging warm bulb */}
    <line x1={0} y1={-290} x2={0} y2={-256} stroke={INK} strokeWidth={3} />
    <circle cx={0} cy={-248} r={11} fill={lightOn > 0 ? '#FFE8A0' : '#B8C2CC'} stroke={INK} strokeWidth={2.5} />
    {/* Bowls & broth pot inside */}
    <rect x={-96} y={-186} width={68} height={54} rx={4} fill="#B8C2CC" stroke={INK} strokeWidth={3} />
    <ellipse cx={-62} cy={-186} rx={36} ry={6} fill="#D8E0E8" stroke={INK} strokeWidth={2.5} />
    {[18, 56, 86].map((bx, i) => (
      <path key={i} d={`M ${bx - 16} -146 Q ${bx} -130 ${bx + 16} -146 Z`} fill="#F4EEE0" stroke={INK} strokeWidth={2.5} />
    ))}
    {/* Steam rising from broth pot */}
    {[0, 1].map((i) => (
      <path
        key={i}
        d={`M ${-74 + i * 24} -196 q ${Math.sin((t + i * 9) / 7) * 8} -22 0 -44`}
        stroke="#FFF"
        strokeWidth={3.5}
        fill="none"
        strokeLinecap="round"
        opacity={0.35}
      />
    ))}
    {/* Lower cart body & sign */}
    <rect x={-130} y={-134} width={260} height={86} rx={4} fill="#E9C46A" stroke={INK} strokeWidth={4} />
    <rect x={-118} y={-122} width={236} height={62} rx={3} fill="#B8342A" />
    <text x={0} y={-88} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={28} fill="#FFE8A8">
      {title}
    </text>
    <text x={0} y={-68} textAnchor="middle" fontFamily={FONT.ui} fontSize={13} fill="#F6EFE3">
      {sub}
    </text>
    {/* Push handle on left */}
    <path d="M -130 -126 L -168 -134 L -168 -118" stroke="#5A4234" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {/* Striped awning roof */}
    <polygon points="-146,-286 146,-286 132,-324 -132,-324" fill="#D94A3D" stroke={INK} strokeWidth={3.5} />
    {[-96, -32, 32, 96].map((sx, i) => (
      <polygon key={i} points={`${sx - 16},-286 ${sx + 16},-286 ${sx + 14},-324 ${sx - 14},-324`} fill="#F6EFE3" />
    ))}
    {/* Wheels & front support leg */}
    <Wheel cx={-66} cy={-42} r={42} spokes={8} />
    <path d="M 88 -48 L 96 0 M 78 0 L 112 0" stroke={INK} strokeWidth={6} strokeLinecap="round" />
  </g>
);

/**
 * Vietnamese tube-house facade (`VnHouseFacade` / Mặt tiền nhà ống & tiệm mặt hẻm):
 * Ground-floor shopfront or folding iron door, awning, second-floor balcony with plants and shuttered window,
 * tiled roof eave, and house number plate.
 * Place at (x, y) = ground contact center.
 */
export const VnHouseFacade: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  wall?: string;
  signText?: string;
  houseNo?: string;
  lit?: number;
}> = ({
  x,
  y,
  w = 420,
  h = 640,
  wall = '#C8A878',
  signText = 'TIỆM SỬA ĐỒ CŨ',
  houseNo = '14/3',
  lit = 1,
}) => {
  const s = w / 420;
  const hh = h;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* Main building wall */}
      <rect x={-w / 2} y={-hh} width={w} height={hh} fill={wall} stroke={INK} strokeWidth={4} />
      <rect x={w * 0.22} y={-hh} width={w * 0.28} height={hh} fill="#000" opacity={0.16} />
      {/* Roof eave tiles */}
      <polygon points={`${-w / 2 - 16},${-hh + 18} ${w / 2 + 16},${-hh + 18} ${w / 2},${-hh - 14} ${-w / 2},${-hh - 14}`} fill="#8A3E32" stroke={INK} strokeWidth={3.5} />
      {/* Upper floor shuttered window & balcony */}
      <rect x={-76 * s} y={-hh + 78 * s} width={152 * s} height={170 * s} rx={4 * s} fill={lit > 0 ? '#FFE2A0' : '#263040'} stroke="#3E2A22" strokeWidth={5 * s} />
      <line x1={0} y1={-hh + 78 * s} x2={0} y2={-hh + 248 * s} stroke="#3E2A22" strokeWidth={4 * s} />
      {/* Green wooden shutters on sides */}
      <rect x={-124 * s} y={-hh + 78 * s} width={44 * s} height={170 * s} fill="#3E6B5C" stroke={INK} strokeWidth={3 * s} />
      <rect x={80 * s} y={-hh + 78 * s} width={44 * s} height={170 * s} fill="#3E6B5C" stroke={INK} strokeWidth={3 * s} />
      {/* Balcony railing */}
      <rect x={-168 * s} y={-hh + 210 * s} width={336 * s} height={46 * s} fill="none" stroke="#2A2834" strokeWidth={4 * s} />
      {Array.from({ length: 11 }).map((_, i) => (
        <line
          key={i}
          x1={(-148 + i * 29.6) * s}
          y1={-hh + 210 * s}
          x2={(-148 + i * 29.6) * s}
          y2={-hh + 256 * s}
          stroke="#2A2834"
          strokeWidth={2.5 * s}
        />
      ))}
      <rect x={-176 * s} y={-hh + 254 * s} width={352 * s} height={16 * s} fill="#7A6858" stroke={INK} strokeWidth={3 * s} />
      {/* Ground floor shopfront & warm interior */}
      <rect x={-148 * s} y={-270 * s} width={296 * s} height={270 * s} fill={lit > 0 ? '#4A3224' : '#181620'} stroke={INK} strokeWidth={4 * s} />
      {lit > 0 ? <Glow x={0} y={-140 * s} r={220 * s} o={0.5 * lit} /> : null}
      {/* Shop signboard & house number plate */}
      <rect x={-166 * s} y={-338 * s} width={332 * s} height={58 * s} rx={4 * s} fill="#F2DFB6" stroke="#8A342B" strokeWidth={4 * s} />
      <text x={0} y={-300 * s} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={26 * s} fill="#8A2A22">
        {signText}
      </text>
      <rect x={-188 * s} y={-262 * s} width={34 * s} height={22 * s} rx={3 * s} fill="#244E82" stroke="#FFF" strokeWidth={1.5 * s} />
      <text x={-171 * s} y={-246 * s} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={11 * s} fill="#FFF">
        {houseNo}
      </text>
    </g>
  );
};

/**
 * Vietnamese alley utility pole (`ElectricPole` / Cột điện hẻm phố có đèn đường & bó cáp):
 */
export const ElectricPole: React.FC<{
  x: number;
  y: number;
  h?: number;
  lightOn?: number;
}> = ({ x, y, h = 720, lightOn = 1 }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={4} rx={42} ry={8} fill="#000" opacity={0.4} />
    <polygon points={`-22,0 22,0 14,${-h} -14,${-h}`} fill="#6E727C" stroke={INK} strokeWidth={3.5} />
    <polygon points={`4,0 22,0 14,${-h} 2,${-h}`} fill="#000" opacity={0.22} />
    {/* Crossbars & ceramic insulators */}
    <rect x={-56} y={-h + 56} width={112} height={10} rx={2} fill="#4A4E58" stroke={INK} strokeWidth={2.5} />
    {[-44, -18, 18, 44].map((ix) => (
      <rect key={ix} x={ix - 4} y={-h + 42} width={8} height={14} rx={2} fill="#DCE6EE" stroke={INK} strokeWidth={2} />
    ))}
    {/* Coiled telecom cable loops & meter boxes */}
    <ellipse cx={-16} cy={-h * 0.62} rx={18} ry={32} fill="none" stroke="#181720" strokeWidth={5} />
    <rect x={-18} y={-h * 0.36} width={36} height={52} rx={3} fill="#B8C2CC" stroke={INK} strokeWidth={2.5} />
    {/* Streetlight arm & warm sodium cone */}
    <path d={`M 12 ${-h + 96} Q 68 ${-h + 80} 118 ${-h + 92}`} stroke="#4A4E58" strokeWidth={7} fill="none" strokeLinecap="round" />
    <ellipse cx={124} cy={-h + 94} rx={24} ry={9} fill="#2A2C36" stroke={INK} strokeWidth={2.5} />
    <ellipse cx={124} cy={-h + 98} rx={18} ry={5} fill={lightOn > 0 ? '#FFE6A0' : '#9AA4B0'} />
    {lightOn > 0 ? (
      <g>
        <Cone d={`M 106 ${-h + 98} L 142 ${-h + 98} L 340 0 L -80 0 Z`} o={0.22 * lightOn} />
        <Glow x={124} y={-h + 110} r={190} o={0.55 * lightOn} />
      </g>
    ) : null}
  </g>
);
