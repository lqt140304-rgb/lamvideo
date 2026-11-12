import React from 'react';
import { Build, HairSway, JointPose, Light, NamMood, Outfit, PALETTE, Rigged, STAND_POSE, StudentTwinBody, TungHead, TungMood, TungSoccer, TUNG_OUTFIT } from '../../nhan-vat';
import { HemSway, Light25, LIGHTS_25D, Nam25D, Pal25, swayHem, Volume25 } from './nam-2-5d';
import { LIGHT_SOURCES, lightFor, RoomScene, RoomView } from '../../boi-canh/boi-canh';
import { exprFrom } from '../../cam-xuc-2-5d';

/**
 * 2.5D cho các nhân vật chính còn lại của Hồ sơ 02 (11/11/2026): NGƯỜI KIA và TÙNG. Cùng lớp ánh sáng/tách lớp/bóng mềm/vật lý như Nam
 * (xem README); mỗi người chỉ khai bảng màu nhận diện khối và dáng theo ảnh tham chiếu. Mặt, tóc, màu, đồ giữ nguyên bản đã chốt.
 */

/** Người Kia dùng chung rig, đầu và bảng màu với Nam (khác nốt ruồi, nét mặt, áo rêu): chỉ đổi danh tính. */
export const NguoiKia25D: React.FC<React.ComponentProps<typeof Nam25D>> = (p) => <Nam25D mood="calm" {...p} identity="nguoi-kia" />;

// ---------------------------------------------------------------------------
// TÙNG
// ---------------------------------------------------------------------------
/** Đo trên ảnh tham chiếu (cùng cách ghép cùng chiều cao như Nam): chân ngắn ~6%, bàn tay lớn hơn một chút, vai hơi hẹp lại. */
export const TUNG_DANG: Partial<Build> = { thigh: 99, shin: 98, shoulderX: 0.96, arm: [20, 17, 14.5], hand: 1.22, sleeve: [26, 28, 28], shortsSide: [42, 43, 44] }; // quần đùi nghiêng rộng gần bằng vạt áo như mẫu
const TUNG_PAL: Pal25 = {
  // áo + tất cùng một màu navy; viền cổ/tay áo, số 7, sọc và giày trắng cùng màu kem; quần đùi + cổ áo trong cùng navy sẫm
  shirt: [PALETTE.tung.jersey, PALETTE.tung.jerseyTrim],
  pants: [PALETTE.tung.shorts],
  hair: PALETTE.tung.hair,
};
export const tungOutfitDang = (sway?: HemSway): Outfit => ({
  ...TUNG_OUTFIT, build: TUNG_DANG, hem: swayHem(TUNG_OUTFIT.hem, sway),
  views: Object.fromEntries(Object.entries(TUNG_OUTFIT.views ?? {}).map(([k, v]) => [k, { ...v!, hem: swayHem(v!.hem, sway) }])) as Outfit['views'],
});

type TungProps = React.ComponentProps<typeof TungSoccer>;
/** Tùng dáng theo ảnh tham chiếu (2D, chưa có lớp sáng). */
export const TungDangMoi: React.FC<TungProps & { hemSway?: HemSway }> = ({ mood = 'annoyed', x = 0, y = 0, scale = 1, pose, talk, blink, light, hair, hemSway, expr, exprLight }) => (
  <Rigged pose={pose ?? STAND_POSE} outfit={tungOutfitDang(hemSway)} x={x} y={y} scale={scale} light={light as Light | undefined}
    head={<TungHead mood={mood as TungMood} id="tung-dang-moi" view={pose?.view} facing={pose?.facing} talk={talk} blink={blink} hair={hair} expr={expr} exprLight={exprLight} splitNeck />} />
);
/** Tùng 2.5D: cùng props `TungSoccer`, thêm `lighting`, `lightDir`, `dang` ('moi' mặc định | 'chot'), `hemSway`. `volume={false}` = 2D. */
export const Tung25D: React.FC<TungProps & { volume?: boolean; lighting?: Light25; lightDir?: [number, number]; dang?: 'moi' | 'chot'; hemSway?: HemSway; matCu?: boolean }> = ({ volume = true, lighting = 'ngay', lightDir, dang = 'moi', hemSway, matCu, ...props0 }) => {
  // mặt 2.5D tham số mặc định (mood cũ đổi sang bộ cảm xúc mới); `matCu` giữ mặt cũ
  const props = { ...props0, expr: props0.expr ?? (matCu ? undefined : exprFrom(undefined, props0.mood ?? 'annoyed')), exprLight: props0.exprLight ?? lightDir ?? LIGHTS_25D[lighting].dir };
  const Body: React.FC<TungProps> = dang === 'moi' ? (q) => <TungDangMoi {...q} hemSway={hemSway} /> : TungSoccer;
  if (!volume) return <Body {...props} />;
  const { x = 0, y = 0, scale = 1, pose = STAND_POSE } = props;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Volume25 subject={<Body {...props} x={0} y={0} scale={1} />} light={lighting} pal={TUNG_PAL} dir={lightDir}
        armsFront={!!(pose.frontR || pose.frontL)} depth={pose.view === 'three' || pose.view === 'side' || pose.view === 'quarter' || pose.view === undefined} />
    </g>
  );
};

// ---------------------------------------------------------------------------
// BẢNG DUYỆT
// ---------------------------------------------------------------------------
const INK = PALETTE.ink;
const T: React.FC<{ x: number; y: number; t: string; s?: number; w?: number; c?: string }> = ({ x, y, t, s = 20, w = 700, c = INK }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={s} fontWeight={w} fill={c} stroke="none">{t}</text>
);
const SLEEP = PALETTE.nam.sleepShirt;
type Who = 'nam' | 'kia' | 'tung';
const Actor: React.FC<{ who: Who; v25: boolean; pose: JointPose; x: number; y: number; scale: number; lighting?: Light25; lightDir?: [number, number]; mood?: NamMood }> = ({ who, v25, pose, x, y, scale, lighting, lightDir }) => {
  if (who === 'tung') return <Tung25D volume={v25} dang={v25 ? 'moi' : 'chot'} mood="normal" pose={pose} x={x} y={y} scale={scale} lighting={lighting} lightDir={lightDir} />;
  const base = { pose, x, y, scale, lighting, lightDir, volume: v25, dang: (v25 ? 'moi' : 'chot') as 'moi' | 'chot' };
  return who === 'nam' ? <Nam25D {...base} shirt={SLEEP} mood="sleepy" /> : <NguoiKia25D {...base} />;
};

/** 3 nhân vật × 3 góc: hàng trên 2D đã chốt, hàng dưới 2.5D (dáng mới + ánh sáng ban ngày). */
export const Cast25DBoard: React.FC = () => {
  const cast: [Who, string][] = [['nam', 'NAM'], ['kia', 'NGƯỜI KIA'], ['tung', 'TÙNG']];
  const views: ['front' | 'three' | 'side', string][] = [['front', 'CHÍNH DIỆN'], ['three', 'GÓC 3/4'], ['side', 'NGHIÊNG']];
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
      <rect width="1920" height="1080" fill="#f6f1e8" />
      <T x={960} y={44} s={28} w={800} t="DÀN NHÂN VẬT CHÍNH — 2D ĐÃ CHỐT ↔ 2.5D" />
      <T x={960} y={72} s={15} w={400} c="#69706c" t="Mỗi nhân vật: trái 2D đã chốt, phải 2.5D (dáng theo ảnh tham chiếu, tách lớp, bóng mềm) · cùng mặt, tóc, màu, nốt ruồi, đồ" />
      {cast.map(([who, name], r) => (
        <g key={who} transform={`translate(0 ${84 + r * 322})`}>
          <T x={78} y={150} s={20} t={name} />
          {views.map(([v, vn], c) => {
            const pose: JointPose = { ...STAND_POSE, view: v };
            const cx = 360 + c * 520;
            return (
              <g key={v}>
                <T x={cx + 90} y={20} s={14} w={600} c="#707875" t={vn} />
                <Actor who={who} v25={false} pose={pose} x={cx} y={30} scale={0.47} />
                <Actor who={who} v25 pose={pose} x={cx + 190} y={30} scale={0.47} />
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
};

/** Ba người trong phòng 3D: 2D ↔ 2.5D, ban ngày (cửa sổ) và đêm (ánh laptop xanh). */
export const Cast25DRoomBoard: React.FC = () => {
  type Shot = { night: boolean; src: [number, number, number]; light: Light25; label: string; at: Record<Who, [number, number]> };
  const view: RoomView = 'wide';
  const shots: Shot[] = [
    { night: false, src: LIGHT_SOURCES.window, light: 'ngay', label: 'BAN NGÀY · NẮNG CỬA SỔ', at: { nam: [150, 330], kia: [235, 300], tung: [320, 345] } },
    { night: true, src: LIGHT_SOURCES.lamp, light: 'man-hinh', label: 'BAN ĐÊM · ÁNH LAPTOP', at: { nam: [260, 270], kia: [330, 240], tung: [215, 345] } },
  ];
  const pose: JointPose = { ...STAND_POSE, view: 'three' };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1180" viewBox="0 0 1920 1180">
      <rect width="1920" height="1180" fill="#f6f1e8" />
      <T x={960} y={44} s={28} w={800} t="BA NHÂN VẬT TRONG PHÒNG 3D — 2D ↔ 2.5D" />
      <T x={960} y={72} s={15} w={400} c="#69706c" t="Cùng camera, điểm đứng, nguồn sáng của bối cảnh · 2.5D lấy hướng sáng từ lightFor · ánh laptop màu xanh" />
      {shots.map((sh, row) => [false, true].map((v25, col) => (
        <g key={`${row}-${col}`} transform={`translate(${16 + col * 952} ${96 + row * 540}) scale(0.49)`}>
          <RoomScene view={view} night={sh.night} rays={sh.night ? 0 : 0.9} falloff={0.9} door="ajar" chair="bed" phone="hidden" kitchen="clean"
            actors={(['nam', 'kia', 'tung'] as Who[]).map((w) => ({
              at: sh.at[w],
              render: (p: { x: number; y: number; scale: number }) => {
                const d = lightFor(view, sh.at[w], sh.src);
                return <Actor who={w} v25={v25} pose={pose} x={p.x} y={p.y} scale={p.scale} lighting={sh.light} lightDir={[d.x, d.y]} />;
              },
            }))} />
          <rect x={24} y={24} width={820} height={64} rx={10} fill="#000" opacity={0.55} />
          <text x={44} y={68} fontFamily="Arial, sans-serif" fontSize={34} fontWeight={800} fill="#fff">{v25 ? '2.5D' : '2D HIỆN TẠI'} · {sh.label}</text>
        </g>
      )))}
    </svg>
  );
};
