import React from 'react';
import { Build, JointPose, NAM_OUTFITS, NamMood, Outfit, PALETTE, Rigged, solveRig, STAND_POSE, StudentTwinBody, StudentTwinHead, TWIN_OUTFIT, TWIN_POSES } from '../../nhan-vat';
import { Mirror } from '../../bo-sung-15p/dao-cu';
import { LIGHT_SOURCES, lightFor, RoomScene, RoomView } from '../../boi-canh/boi-canh';

/**
 * THỬ NGHIỆM 11/11/2026 (vòng 2, theo ảnh tham chiếu 2,5D trong ./tham-khao/) — Nam 2D → 2.5D, giữ nguyên tạo hình.
 *
 * Nam gốc (`StudentTwinBody`/`StudentTwinHead`) được vẽ y nguyên; phía trên là lớp ánh sáng theo CẢNH:
 *  - tông cảnh: một lớp multiply phủ cả hình bao (đêm xanh, đèn vàng…);
 *  - mảng tối sắc cạnh ở phía xa nguồn sáng, cắt riêng cho từng khối: da đầu, da tay/chân, tóc, áo, quần;
 *  - bóng đổ giữa lớp: tóc lên trán, vạt áo lên quần;
 *  - mảng sáng tóc, viền sáng / ánh hắt (đêm, ngược sáng, màn hình) — mảng sắc, không blur.
 *
 * Cách cắt: mỗi khối = phần ĐANG LỘ của nó (dựng lại nhân vật trong mask, khối đó trắng, mọi thứ vẽ sau nó đen),
 * trừ đi chính khối đó dịch về phía nguồn sáng → còn lại một dải bám đường bao ở phía tối. Vì tính theo thứ tự vẽ
 * thật của rig, tay đưa ra trước thân, chân ngồi, đồ cầm… không bị mảng của khối phía sau lem lên.
 * Không filter, không gradient, không blur. Hướng/độ dày/màu từng kiểu sáng chọn tay trong LIGHTS_25D.
 * Màu nhận diện khối: da #dbad82 (+ #bd8968), tóc #292a29 trong `data-part="head"`, màu áo/quần lấy từ props.
 */

export type Light25 = 'ngay' | 'am-u' | 'den-vang' | 'man-hinh' | 'dem-xanh' | 'nguoc-sang';
type Part = 'all' | 'skinHead' | 'skinLimb' | 'hair' | 'shirt' | 'pants' | 'headAll' | 'far';
type LightSpec = {
  name: string;
  /** hướng TỚI nguồn sáng trên màn hình (y dương = xuống) */
  dir: [number, number];
  tint?: string; // multiply cả hình bao
  shade: { skin: string; cloth: string; hair?: string }; // multiply mảng tối
  k: { head: number; limb: number; shirt: number; pants: number }; // bề rộng mảng tối (đơn vị rig)
  hairLight?: { color: string; k: number; opacity: number };
  cast?: number; // độ lệch bóng đổ tóc/vạt áo
  rim?: { color: string; k: number; opacity: number }; // viền sáng phía nguồn sáng
  /** ánh hắt mạnh (màn hình): dải sáng rộng phía nguồn sáng trên mặt, áo, tay; phòng càng tối (tint càng tối) hắt càng mạnh */
  glow?: { color: string; k: number; opacity: number };
  bg: string;
};

export const LIGHTS_25D: Record<Light25, LightSpec> = {
  ngay: {
    name: 'BAN NGÀY', dir: [-0.55, -0.83], bg: '#efe4d4',
    shade: { skin: '#dcc9cc', cloth: '#cfd2d3' }, k: { head: 18, limb: 8, shirt: 30, pants: 15 },
    hairLight: { color: '#5a5b57', k: 7, opacity: 0.75 }, cast: 7,
  },
  'am-u': {
    name: 'TRỜI ÂM U', dir: [0, -1], bg: '#9aa3b0', tint: '#d8dbe1',
    shade: { skin: '#e6dbdd', cloth: '#dfe1e3' }, k: { head: 16, limb: 6, shirt: 20, pants: 10 },
    hairLight: { color: '#4b4d4f', k: 5, opacity: 0.5 }, cast: 5,
  },
  'den-vang': {
    name: 'ĐÈN VÀNG', dir: [0.85, -0.5], bg: '#6e5446', tint: '#f2cfa2',
    shade: { skin: '#c7a69c', cloth: '#bdb5ad' }, k: { head: 26, limb: 8, shirt: 24, pants: 14 },
    hairLight: { color: '#6a5a46', k: 6, opacity: 0.7 }, cast: 9,
    rim: { color: '#ffcf8a', k: 3, opacity: 0.55 },
  },
  'man-hinh': {
    name: 'ÁNH MÀN HÌNH', dir: [0.35, 0.94], bg: '#1e2533', tint: '#5d6784',
    shade: { skin: '#b9bccb', cloth: '#b9bccb' }, k: { head: 14, limb: 6, shirt: 18, pants: 12 },
    cast: 0,
    glow: { color: '#5cc6f2', k: 16, opacity: 0.62 },
    rim: { color: '#a6e8ff', k: 3, opacity: 0.9 },
  },
  'dem-xanh': {
    name: 'ĐÊM XANH', dir: [-0.6, -0.8], bg: '#1f2c4a', tint: '#7a8bb6',
    shade: { skin: '#c2c7da', cloth: '#c2c7da' }, k: { head: 24, limb: 9, shirt: 32, pants: 16 },
    hairLight: { color: '#2d3a55', k: 6, opacity: 0.8 }, cast: 7,
    rim: { color: '#a9d2ff', k: 4.5, opacity: 0.9 },
  },
  'nguoc-sang': {
    name: 'NGƯỢC SÁNG', dir: [0.95, -0.3], bg: '#5a4650', tint: '#a88f97',
    shade: { skin: '#d6cbd2', cloth: '#d6cbd2' }, k: { head: 14, limb: 6, shirt: 18, pants: 10 },
    cast: 0,
    rim: { color: '#ffae66', k: 6, opacity: 0.95 },
  },
};

const SKIN = PALETTE.skin, SKIN_SH = PALETTE.skinShadow, HAIR = PALETTE.nam.hair;
const MUL: React.CSSProperties = { mixBlendMode: 'multiply' };
const SCREEN: React.CSSProperties = { mixBlendMode: 'screen' };
const RIM_BOTTOM = 350; // y hông trong hệ rig; viền sáng dừng ở đây
const BOX = { x: -500, y: -400, width: 1000, height: 1300 };
const useUid = (p: string) => `${p}-${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;

/** Bộ chọn CSS cho phần tử của một khối (chính nó và con cháu). */
const sel = (c: string, part: Part, cols: { shirt: string; pants: string }) => {
  const own = (q: string) => `.${c} ${q}, .${c} ${q} *`;
  switch (part) {
    case 'all': return `.${c} *`;
    case 'skinHead': return `.${c} [data-part~="head"] *`;
    case 'hair': return `.${c} [data-part~="head"] [fill="${HAIR}"]`;
    case 'skinLimb': return `.${c} [fill="${SKIN}"], .${c} [fill="${SKIN_SH}"]`;
    case 'shirt': return own(`[fill="${cols.shirt}"]`);
    case 'pants': return own(`[fill="${cols.pants}"]`);
    case 'headAll': return `.${c} [data-part~="head"] *`;
    case 'far': return `.${c} [data-limb~="L"] *`;
  }
};
/** Quy tắc bổ sung để loại phần không thuộc khối (tóc khỏi da đầu, da đầu khỏi da tay). Đặt SAU quy tắc chính. */
const exclude = (c: string, part: Part) =>
  part === 'skinHead' ? `.${c} [data-part~="head"] [fill="${HAIR}"]` : part === 'skinLimb' ? `.${c} [data-part~="head"] *` : '';

type Layer = { mode: 'vis' | 'onlyW' | 'onlyB'; part: Part; shift?: [number, number] };
const lum = (h: string) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
/**
 * Mask dựng từ chính nhân vật. `vis`: khối trắng, mọi phần khác đen (đen của phần vẽ sau che đúng chỗ bị che).
 * `onlyW`/`onlyB`: chỉ khối đó trắng/đen, phần khác trong suốt. `shift`: dịch bản dựng.
 */
const SubjectMask: React.FC<{ id: string; subject: React.ReactNode; cols: { shirt: string; pants: string }; layers: Layer[] }> = ({ id, subject, cols, layers }) => (
  <mask id={id} maskUnits="userSpaceOnUse" {...BOX}>
    {layers.map((l, i) => {
      const c = `${id}-${i}`;
      const on = l.mode === 'onlyB' ? '#000' : '#fff';
      const off = l.mode === 'vis' ? '#000' : 'transparent';
      const ex = exclude(c, l.part);
      const css = `.${c} *{fill:${off}!important;stroke:none!important;opacity:1!important}.${c} [data-shadow]{display:none!important}`
        + `${sel(c, l.part, cols)}{fill:${on}!important}` + (ex ? `${ex}{fill:${off}!important}` : '');
      return (
        <g key={i} transform={l.shift ? `translate(${l.shift[0].toFixed(2)} ${l.shift[1].toFixed(2)})` : undefined}>
          <style>{css}</style>
          <g className={c}>{subject}</g>
        </g>
      );
    })}
  </mask>
);

const Fill: React.FC<{ mask: string; color: string; opacity?: number }> = ({ mask, color, opacity }) => (
  <g mask={`url(#${mask})`}><rect {...BOX} fill={color} opacity={opacity} /></g>
);

/**
 * Lớp ánh sáng 2.5D phủ lên một nhân vật bất kỳ dùng bảng màu Nam (cùng hệ toạ độ với `subject`).
 * `dir`: hướng tới nguồn sáng trên màn hình, ưu tiên lấy từ bối cảnh (`lightFor` của phòng 3D) để nhân vật cùng nguồn sáng với nền.
 * `armsFront`: có tay đưa ra trước thân (đổi chiều bóng đổ tay ↔ áo). `depth`: tách tay/chân phía xa (góc 3/4, nghiêng).
 */
export const Volume25: React.FC<{ subject: React.ReactElement; light?: Light25; shirt: string; pants: string; head?: boolean; dir?: [number, number]; armsFront?: boolean; depth?: boolean }> = ({ subject, light = 'ngay', shirt, pants, head = true, dir, armsFront = false, depth = false }) => {
  const L = LIGHTS_25D[light];
  const uid = useUid('v25');
  const cols = { shirt: shirt.toLowerCase(), pants: pants.toLowerCase() };
  const [lx, ly] = dir ?? L.dir;
  const n = Math.hypot(lx, ly) || 1;
  const toward = (k: number): [number, number] => [(lx / n) * k, (ly / n) * k];
  const away = (k: number): [number, number] => [(-lx / n) * k, (-ly / n) * k];
  const id = (s: string) => `${uid}-${s}`;
  // Da đầu chỉ lệch NGANG: lệch dọc sẽ để lại dải tối dưới cằm, trông như râu (quy chuẩn cấm).
  const band = (part: Part, k: number) => ({ id: id(`b-${part}`), layers: [{ mode: 'vis', part }, { mode: 'onlyB', part, shift: part === 'skinHead' ? [toward(k)[0], 0] as [number, number] : toward(k) }] as Layer[] });
  const lit = (part: Part, k: number, tag: string) => ({ id: id(`l-${tag}-${part}`), layers: [{ mode: 'vis', part }, { mode: 'onlyB', part, shift: away(k) }] as Layer[] });
  const shadows: { m: { id: string; layers: Layer[] }; color: string }[] = [
    ...(head ? [{ m: band('skinHead', L.k.head), color: L.shade.skin }, { m: band('hair', L.k.head * 0.55), color: '#a3a3a3' }] : []),
    { m: band('skinLimb', L.k.limb), color: L.shade.skin },
    { m: band('shirt', L.k.shirt), color: L.shade.cloth },
    { m: band('pants', L.k.pants), color: L.shade.cloth },
  ];
  // Bóng đổ GIỮA CÁC LỚP (lớp trước đổ lên lớp sau): khối che = phần đang lộ của nó, dịch ra xa nguồn sáng và xuống;
  // trừ chính nó, cắt trong phần lộ của khối nhận. Không có bóng đổ theo hướng (ngược sáng, màn hình) thì vẫn giữ
  // một bóng tiếp xúc ngắn thẳng xuống để các lớp tóc–mặt–cổ áo–áo–quần–tay vẫn tách nhau.
  const k0 = L.cast || 5;
  const castShift = (k: number): [number, number] => (L.cast ? [away(k)[0], away(k)[1] + k * 0.6] : [0, k]);
  const pair = (target: Part, caster: Part, k: number, color: string) => ({ target, caster, k, color });
  const casts = [
    ...(head ? [pair('skinHead', 'hair', k0, L.shade.skin), pair('shirt', 'headAll', k0 * 1.3, L.shade.cloth)] : []),
    pair('pants', 'shirt', k0 * 1.6, L.shade.cloth),
    pair('pants', 'skinLimb', k0, L.shade.cloth),
    armsFront ? pair('shirt', 'skinLimb', k0, L.shade.cloth) : pair('skinLimb', 'shirt', k0 * 0.8, L.shade.skin),
  ];
  const hairHL = L.hairLight && head ? lit('hair', L.hairLight.k, 'hl') : null;
  const rim = L.rim ? lit('all', L.rim.k, 'rim') : null;
  const glowOp = L.glow ? Math.min(1, L.glow.opacity * (0.5 + (1 - lum(L.tint ?? '#ffffff')))) : 0; // phòng tối → hắt mạnh
  const glows = L.glow ? ([['skinHead', 1], ['shirt', 1.6], ['skinLimb', 0.6]] as [Part, number][]).filter(([p]) => head || p !== 'skinHead').map(([p, f]) => lit(p, L.glow!.k * f, 'glow')) : [];
  const far = depth ? { id: id('far'), layers: [{ mode: 'vis', part: 'far' }] as Layer[] } : null;
  const sil = { id: id('sil'), layers: [{ mode: 'vis', part: 'all' }] as Layer[] };
  const masks = [sil, ...shadows.map((s) => s.m), ...(hairHL ? [hairHL] : []), ...(rim ? [rim] : []), ...glows, ...(far ? [far] : [])];
  return (
    <g data-volume={light} stroke="none">
      {subject}
      <defs>
        <clipPath id={id('rimclip')}><rect x={-500} y={-400} width={1000} height={RIM_BOTTOM + 400} /></clipPath>
        {masks.map((m) => <SubjectMask key={m.id} id={m.id} subject={subject} cols={cols} layers={m.layers} />)}
        {casts.map((c, i) => (
          <React.Fragment key={i}>
            <SubjectMask id={id(`ct${i}`)} subject={subject} cols={cols} layers={[{ mode: 'vis', part: c.target }]} />
            <SubjectMask id={id(`cc${i}`)} subject={subject} cols={cols} layers={[{ mode: 'vis', part: c.caster, shift: castShift(c.k) }, { mode: 'onlyB', part: c.caster }]} />
          </React.Fragment>
        ))}
      </defs>
      {/* tông cảnh */}
      {L.tint && <g style={MUL}><Fill mask={sil.id} color={L.tint} /></g>}
      {/* lớp xa (tay/chân vế sau) lùi vào trong: tối và lạnh hơn một chút */}
      {far && <g style={MUL}><Fill mask={far.id} color="#d9dbe3" /></g>}
      {/* mảng tối theo khối */}
      <g style={MUL}>{shadows.map((s) => <Fill key={s.m.id} mask={s.m.id} color={s.color} />)}</g>
      {/* bóng đổ giữa lớp: nhóm riêng để chồng lên mảng tối (chỗ vừa quay khỏi sáng vừa bị che thì tối hơn) */}
      <g style={MUL}>
        {casts.map((c, i) => (
          <g key={i} mask={`url(#${id(`ct${i}`)})`}><Fill mask={id(`cc${i}`)} color={c.color} /></g>
        ))}
      </g>
      {hairHL && <Fill mask={hairHL.id} color={L.hairLight!.color} opacity={L.hairLight!.opacity} />}
      {glows.length > 0 && <g style={SCREEN}>{glows.map((g) => <Fill key={g.id} mask={g.id} color={L.glow!.color} opacity={glowOp} />)}</g>}
      {/* viền sáng chỉ phần thân trên (đầu, vai, tay): ở chân nó chạy vào khe giữa hai ống và quanh dép, rối hình */}
      {rim && <g clipPath={`url(#${id('rimclip')})`} style={SCREEN}><Fill mask={rim.id} color={L.rim!.color} opacity={L.rim!.opacity} /></g>}
    </g>
  );
};

type BodyProps = React.ComponentProps<typeof StudentTwinBody>;

// ---------------------------------------------------------------------------
// DÁNG NGƯỜI THEO ẢNH THAM CHIẾU (vòng 3) — mặt, tóc, màu, nốt ruồi giữ nguyên
// ---------------------------------------------------------------------------
/** Đo trên ảnh tham chiếu (tham-khao/tao-hinh-2-5d.jpg), so với Nam đã chốt cùng chiều cao. */
export const DANG_THAM_CHIEU: Partial<Build> = {
  upperArm: 78, foreArm: 72, thigh: 99, shin: 99, // tay hơi dài hơn, chân ngắn lại ~6%
  shoulderX: 0.9, // vai vừa phải (bản trước 0,98 trông "đô")
  arm: [17.5, 15.5, 13.5], // tay thon như bản đã chốt, không to bắp
  hand: 1.18, // nắm tay vừa
  sleeve: [24, 26, 26],
  pants: [28, 26, 26], // ống thẳng, rộng đều, không loe
  pantsEnd: 0.84, // quần lửng, lộ cổ chân
  foot: 1,
};
const SHIRT_X = 0.94; // áo đầy ngang theo vai, nở dần xuống gấu
const scaleX = (d: string, k: number) => d.replace(/(-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${+(Number(x) * k).toFixed(2)} ${y}`);
const narrow = <T extends { torso: string; hem: [number, number][]; detail: Outfit['detail'] }>(v: T): T => ({
  ...v, torso: scaleX(v.torso, SHIRT_X), hem: v.hem.map(([x, y]) => [x * SHIRT_X, y] as [number, number]),
  detail: typeof v.detail === 'function' ? v.detail : <g transform={`scale(${SHIRT_X} 1)`}>{v.detail}</g>,
});
/** Bộ đồ Nam với dáng tham chiếu; `shirt` đổi màu áo như StudentTwinBody. */
export const namOutfitDang = (shirt: string = PALETTE.nam.shirt): Outfit => {
  const base = { ...TWIN_OUTFIT, shirt, sleeveEnd: 0.56, build: DANG_THAM_CHIEU };
  const views = Object.fromEntries(Object.entries(TWIN_OUTFIT.views ?? {}).map(([k, v]) => [k, narrow(v!)])) as Outfit['views'];
  return { ...narrow(base), views };
};
/** Đầu thon lại (ngang ×0,9) và hạ thấp (cổ ngắn, cằm sát vai) như ảnh tham chiếu; tâm phóng ở chân cổ. */
const HEAD_FIT = 'translate(-6 180) scale(0.9 0.99) translate(6 -172)';

/** Nam 2D với dáng tham chiếu (cùng props StudentTwinBody; `outfit` khác áo thun chưa hỗ trợ ở bản thử). */
export const NamDangMoi: React.FC<BodyProps> = ({ mood = 'sleepy', identity = 'nam', x = 0, y = 0, scale = 1, pose = STAND_POSE, shirt = PALETTE.nam.shirt, talk, blink, light, face, faceFrom, faceMix, outline, headOutline }) => (
  <Rigged pose={pose} outfit={namOutfitDang(shirt)} x={x} y={y} scale={scale} light={light} outline={outline} headOutline={headOutline}
    head={<g transform={HEAD_FIT}><StudentTwinHead identity={identity} mood={mood} id="nam-dang-moi" view={pose.view} facing={pose.facing} talk={talk} blink={blink} face={face} faceFrom={faceFrom} faceMix={faceMix} /></g>} />
);

const colorsOf = (p: Pick<BodyProps, 'outfit' | 'shirt'>) => {
  const o = p.outfit ? NAM_OUTFITS[p.outfit] : undefined;
  return { shirt: o?.shirt ?? p.shirt ?? PALETTE.nam.shirt, pants: o?.pants ?? PALETTE.nam.pants };
};
/** Mọi góc/tư thế đều có lớp 2.5D (giữ để tương thích lời gọi cũ). */
export const supports25D = (_: Pick<BodyProps, 'pose' | 'outfit'>) => true;

/**
 * Nam 2.5D: cùng props với `StudentTwinBody`, thêm `lighting` (kiểu sáng cảnh) và `dang`:
 * 'moi' (mặc định, dáng theo ảnh tham chiếu) hoặc 'chot' (dáng Style B đã chốt). `volume={false}` = bản 2D.
 * Bộ đồ `outfit` khác áo thun tự dùng dáng đã chốt.
 */
export const Nam25D: React.FC<BodyProps & { volume?: boolean; lighting?: Light25; dang?: 'moi' | 'chot'; lightDir?: [number, number] }> = ({ volume = true, lighting = 'ngay', dang = 'moi', lightDir, ...props }) => {
  const Body = dang === 'moi' && !props.outfit ? NamDangMoi : StudentTwinBody;
  if (!volume) return <Body {...props} />;
  const { x = 0, y = 0, scale = 1, pose = STAND_POSE } = props;
  const c = colorsOf(props);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Volume25 subject={<Body {...props} x={0} y={0} scale={1} />} light={lighting} shirt={c.shirt} pants={c.pants} dir={lightDir}
        armsFront={!!(pose.frontR || pose.frontL)} depth={pose.view === 'three' || pose.view === 'side' || pose.view === 'quarter' || pose.view === undefined} />
    </g>
  );
};

/** Đầu Nam 2.5D (bảng biểu cảm). */
export const Nam25DHead: React.FC<React.ComponentProps<typeof StudentTwinHead> & { lighting?: Light25 }> = ({ lighting = 'ngay', ...p }) => (
  <g transform={`translate(${p.x ?? 0} ${p.y ?? 0}) scale(${p.scale ?? 1})`}>
    <Volume25 subject={<g data-part="head"><StudentTwinHead {...p} x={0} y={0} scale={1} /></g>} light={lighting} shirt="#000001" pants="#000002" />
  </g>
);

// ---------------------------------------------------------------------------
// BẢNG DUYỆT
// ---------------------------------------------------------------------------
const INK = PALETTE.ink;
const Label: React.FC<{ x: number; y: number; t: string; s?: number; w?: number; c?: string }> = ({ x, y, t, s = 20, w = 700, c = INK }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={s} fontWeight={w} fill={c} stroke="none">{t}</text>
);
const Board: React.FC<{ title: string; sub: string; children: React.ReactNode }> = ({ title, sub, children }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
    <rect width="1920" height="1080" fill="#f6f1e8" />
    <Label x={960} y={52} s={30} w={800} t={title} />
    <Label x={960} y={82} s={16} w={400} c="#69706c" t={sub} />
    {children}
  </svg>
);
const SLEEP = PALETTE.nam.sleepShirt;

/** Đạo cụ nền vẽ phẳng cho từng kiểu sáng (chỉ để đọc nguồn sáng trong bảng). */
const LightProp: React.FC<{ k: Light25; w: number; h: number }> = ({ k, w, h }) => {
  switch (k) {
    case 'ngay': return <path d={`M ${w * 0.05} 0 L ${w * 0.32} 0 L ${w * 0.12} ${h} L ${-w * 0.1} ${h} Z`} fill="#fbf3e6" opacity={0.6} />;
    case 'den-vang': return <g><path d={`M ${w - 70} 0 V 38`} stroke="#2a2220" strokeWidth={3} /><path d={`M ${w - 110} 80 Q ${w - 70} 24 ${w - 30} 80 Z`} fill="#2f2723" /><ellipse cx={w - 70} cy={82} rx={34} ry={8} fill="#ffd28a" /></g>;
    case 'man-hinh': return <g><path d={`M ${w - 120} ${h} L ${w - 96} ${h - 120} L ${w + 10} ${h - 120} L ${w + 10} ${h} Z`} fill="#1b222c" /><path d={`M ${w - 110} ${h} L ${w - 90} ${h - 108} L ${w + 10} ${h - 108} L ${w + 10} ${h} Z`} fill="#6fc8ee" opacity={0.85} /></g>;
    case 'dem-xanh': return <g><circle cx={90} cy={70} r={30} fill="#dfe9ff" /><path d="M 40 96 Q 70 80 110 92 Q 140 84 160 98 Q 110 108 40 96 Z" fill="#2e3c5e" /></g>;
    case 'nguoc-sang': return <g><rect x={w - 170} y={50} width={150} height={h - 100} fill="#e9926a" /><path d={`M ${w - 170} ${h * 0.62} Q ${w - 120} ${h * 0.5} ${w - 80} ${h * 0.6} Q ${w - 40} ${h * 0.52} ${w - 20} ${h * 0.6} V ${h - 50} H ${w - 170} Z`} fill="#c56a4f" /><path d={`M ${w - 95} 50 V ${h - 50} M ${w - 170} ${h * 0.45} H ${w - 20}`} stroke="#5a4650" strokeWidth={8} /></g>;
    default: return <g><ellipse cx={w * 0.3} cy={90} rx={120} ry={34} fill="#aeb6c2" opacity={0.6} /><ellipse cx={w * 0.75} cy={140} rx={150} ry={40} fill="#aeb6c2" opacity={0.5} /></g>;
  }
};

export const Nam25DLightBoard: React.FC = () => {
  const W = 600, H = 430;
  return (
    <Board title="NAM — ÁNH SÁNG 2,5D" sub="Cùng một Nam đã chốt · đổi tông cảnh, hướng mảng tối, viền sáng/ánh hắt theo nguồn sáng · mảng sắc cạnh, không blur/gradient">
      {(Object.keys(LIGHTS_25D) as Light25[]).map((k, i) => {
        const cx = 30 + (i % 3) * (W + 30), cy = 110 + Math.floor(i / 3) * (H + 50);
        return (
          <g key={k} transform={`translate(${cx} ${cy})`}>
            <defs><clipPath id={`cell-${k}`}><rect width={W} height={H} rx={6} /></clipPath></defs>
            <g clipPath={`url(#cell-${k})`}>
              <rect width={W} height={H} fill={LIGHTS_25D[k].bg} />
              <LightProp k={k} w={W} h={H} />
              <Nam25D lighting={k} shirt={SLEEP} mood="sleepy" pose={{ ...STAND_POSE, view: 'three' }} x={W / 2} y={30} scale={1.12} />
            </g>
            <Label x={W / 2} y={H + 34} s={22} w={800} t={LIGHTS_25D[k].name} />
          </g>
        );
      })}
    </Board>
  );
};

export const Nam25DTurnBoard: React.FC = () => {
  const views: [JointPose['view'], string][] = [['front', 'CHÍNH DIỆN'], ['three', 'GÓC 3/4'], ['side', 'NGHIÊNG'], ['quarter', '1/4 SAU'], ['back', 'SAU LƯNG']];
  return (
    <Board title="NAM — CÁC GÓC 2,5D" sub="Trên: 2D đã chốt · Dưới: 2.5D ban ngày, dáng theo ảnh tham chiếu · cùng rig, mặt, tóc, nốt ruồi, màu">
      {views.map(([v, t], i) => (
        <g key={v} transform={`translate(${200 + i * 380} 0)`}>
          <Label x={0} y={128} s={20} t={t} />
          <Nam25D dang="chot" volume={false} shirt={SLEEP} mood="sleepy" pose={{ ...STAND_POSE, view: v }} x={0} y={145} scale={0.6} />
          <Nam25D shirt={SLEEP} mood="sleepy" pose={{ ...STAND_POSE, view: v }} x={0} y={540} scale={0.85} />
        </g>
      ))}
      <Label x={60} y={330} s={15} w={700} c="#707875" t="2D" />
      <Label x={60} y={800} s={15} w={700} c="#2f5d50" t="2.5D" />
    </Board>
  );
};

/** Ghế đẩu gỗ vẽ phẳng, mặt ghế tại (0,0). */
const Stool: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -70 22 L -82 150 M 70 22 L 82 150 M -40 24 L -46 150 M 40 24 L 46 150" stroke="#7a5236" strokeWidth={14} strokeLinecap="round" />
    <path d="M -76 96 H 76" stroke="#6a4630" strokeWidth={9} strokeLinecap="round" />
    <rect x={-92} y={0} width={184} height={26} rx={10} fill="#8d6040" />
    <rect x={-92} y={0} width={184} height={8} rx={4} fill="#a67653" />
  </g>
);

export const Nam25DPoseBoard: React.FC = () => {
  const S = 0.95, TOP = 230, FLOOR = TOP + 589 * S;
  const sit: JointPose = { ...TWIN_POSES.sit, view: 'three', tilt: 6, neck: -2, armR: { a: 40, b: 36 }, armL: { a: 30, b: 40, rot: -1 }, handR: 'rest', handL: 'rest', frontR: true, frontL: false };
  const r = solveRig(sit);
  const hipY = TOP + (345 + r.dy) * S, seat = hipY + 26 * S; // mặt ghế ngay dưới mông
  // Góc sau lưng: rig chỉ cho tay vung nhẹ (chiều sâu bị nén), chưa giơ tay chạm gương được.
  const mirrorPose: JointPose = { ...STAND_POSE, view: 'back', neck: 3 };
  const cells: { t: string; pose: JointPose; x?: number; behind?: React.ReactNode }[] = [
    { t: 'ĐI', pose: { ...TWIN_POSES.stride, view: 'three' } },
    { t: 'NGỒI GHẾ ĐẨU', pose: sit, x: -20, behind: <Stool x={-20 + sit.x * S} y={seat} s={(FLOOR - seat) / 150} /> },
    { t: 'CẦM ĐIỆN THOẠI', pose: { ...TWIN_POSES.phone, view: 'three' } },
    { t: 'ĐỨNG TRƯỚC GƯƠNG (SAU LƯNG)', pose: mirrorPose, x: -50, behind: <g transform={`translate(120 ${FLOOR})`}><Mirror w={170} h={470} /></g> },
  ];
  return (
    <Board title="NAM — TƯ THẾ 2,5D" sub="Rig khớp đã chốt, dáng theo ảnh tham chiếu · mảng tối tính theo phần đang lộ nên tay trước thân, chân ngồi, đồ cầm không bị lem · ban ngày">
      {cells.map((c, i) => (
        <g key={c.t} transform={`translate(${240 + i * 480} 0)`}>
          <Label x={0} y={150} s={20} t={c.t} />
          {c.behind}
          <Nam25D shirt={SLEEP} mood="sleepy" pose={c.pose} x={c.x ?? 0} y={TOP} scale={S} />
        </g>
      ))}
    </Board>
  );
};

/** Bảng so sánh 2D (đã chốt) ↔ 2.5D, giữ tên cũ. */
export const Nam25DBoard: React.FC = () => (
  <Board title="NAM — THỬ CHUYỂN 2D → 2.5D (GIỮ NGUYÊN TẠO HÌNH STYLE B)" sub="Giữ mặt, tóc, màu, nốt ruồi · dáng theo ảnh tham chiếu (vai hẹp, tay ngắn mảnh, quần ống thẳng lửng, đầu to hơn) · ánh sáng ban ngày">
    {(['three', 'front'] as const).map((v, i) => (
      <g key={v} transform={`translate(${i * 960} 0)`}>
        <Label x={480} y={130} s={22} t={v === 'three' ? 'GÓC 3/4' : 'CHÍNH DIỆN'} />
        <Label x={250} y={160} s={15} w={600} c="#707875" t="2D hiện tại (đã chốt)" />
        <Label x={710} y={160} s={15} w={600} c="#2f5d50" t="2.5D thử · dáng tham chiếu" />
        <Nam25D dang="chot" volume={false} pose={{ ...STAND_POSE, view: v }} shirt={SLEEP} mood="sleepy" x={250} y={180} scale={0.92} />
        <Nam25D pose={{ ...STAND_POSE, view: v }} shirt={SLEEP} mood="sleepy" x={710} y={180} scale={0.92} />
      </g>
    ))}
    <path d="M 960 110 V 760 M 60 790 H 1860" stroke="#ded5c6" strokeWidth={1.8} strokeDasharray="6 6" />
    {(['sleepy', 'shocked', 'suspicious'] as NamMood[]).map((m, i) => (
      <g key={m} transform={`translate(${330 + i * 630} 810)`}>
        <StudentTwinHead mood={m} x={-90} y={0} scale={0.82} id={`h2d-${m}`} />
        <Nam25DHead mood={m} x={110} y={0} scale={0.82} id={`h25-${m}`} />
        <Label x={-90} y={176} s={13} w={600} c="#707875" t="2D" />
        <Label x={110} y={176} s={13} w={600} c="#2f5d50" t="2.5D" />
        <Label x={10} y={204} s={16} t={({ sleepy: 'UỂ OẢI', shocked: 'HOẢNG SỢ', suspicious: 'DÈ CHỪNG' } as Record<string, string>)[m]} />
      </g>
    ))}
  </Board>
);

/**
 * Ghép Nam vào phòng 3D đang dùng: cùng điểm đứng, cùng camera; bản 2.5D lấy hướng sáng từ `lightFor`
 * (cửa sổ ban ngày, đèn bàn ban đêm) để mảng tối/viền sáng khớp nguồn sáng của bối cảnh.
 */
export const Nam25DRoomBoard: React.FC = () => {
  type Shot = { view: RoomView; night: boolean; at: [number, number]; src: [number, number, number]; light: Light25; label: string };
  const shots: Shot[] = [
    { view: 'wide', night: false, at: [190, 330], src: LIGHT_SOURCES.window, light: 'ngay', label: 'BAN NGÀY · NẮNG CỬA SỔ' },
    { view: 'wide', night: true, at: [330, 300], src: LIGHT_SOURCES.lamp, light: 'den-vang', label: 'BAN ĐÊM · ĐÈN BÀN' },
    // laptop trên bàn học (bàn tại SEATS.desk, mặt bàn ~75 cm): nguồn sáng là màn hình
    { view: 'wide', night: true, at: [318, 205], src: [404, 92, 80], light: 'man-hinh', label: 'ĐÊM · ÁNH LAPTOP' },
  ];
  const pose: JointPose = { ...STAND_POSE, view: 'three' };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1720" viewBox="0 0 1920 1720">
      <rect width="1920" height="1720" fill="#f6f1e8" />
      <Label x={960} y={44} s={28} w={800} t="NAM TRONG PHÒNG 3D — 2D ↔ 2.5D" />
      <Label x={960} y={72} s={15} w={400} c="#69706c" t="Cùng camera, điểm đứng, nguồn sáng của bối cảnh · 2.5D lấy hướng sáng từ lightFor (cửa sổ / đèn bàn) · tách lớp tóc–mặt–cổ áo–áo–quần–tay, tay/chân phía xa lùi vào" />
      {shots.map((sh, row) => {
        const d = lightFor(sh.view, sh.at, sh.src);
        return [false, true].map((v25, col) => (
          <g key={`${row}-${col}`} transform={`translate(${16 + col * 952} ${96 + row * 540}) scale(0.49)`}>
            <RoomScene view={sh.view} night={sh.night} rays={sh.night ? 0 : 0.9} falloff={0.9} door="ajar" chair="bed" phone="hidden" kitchen="clean"
              actors={[{ at: sh.at, render: (p) => v25
                ? <Nam25D lighting={sh.light} lightDir={[d.x, d.y]} shirt={SLEEP} mood="sleepy" pose={pose} x={p.x} y={p.y} scale={p.scale} />
                : <StudentTwinBody shirt={SLEEP} mood="sleepy" pose={pose} x={p.x} y={p.y} scale={p.scale} outline="none" headOutline="none" /> }]} />
            <rect x={24} y={24} width={760} height={64} rx={10} fill="#000" opacity={0.55} />
            <text x={44} y={68} fontFamily="Arial, sans-serif" fontSize={34} fontWeight={800} fill="#fff">{v25 ? '2.5D' : '2D HIỆN TẠI'} · {sh.label}</text>
          </g>
        ));
      })}
    </svg>
  );
};
