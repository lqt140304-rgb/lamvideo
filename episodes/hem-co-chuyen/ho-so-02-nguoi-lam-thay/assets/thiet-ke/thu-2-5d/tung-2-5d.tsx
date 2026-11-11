import React from 'react';
import { JointPose, Outfit, PALETTE, TungSoccer, TUNG_OUTFIT, TUNG_POSE } from '../../nhan-vat';
import { HemSway, Light25, swayHem, Volume25 } from './nam-2-5d';
import type { PhysFrame } from './vat-ly';

/**
 * Tùng 2.5D (11/11/2026): cùng lớp ánh sáng 2.5D của Nam (`Volume25`: tông cảnh, mảng tối theo khối, bóng đổ giữa lớp, viền sáng, ánh màn hình)
 * phủ lên `TungSoccer`. Dùng màu áo đấu, quần đùi và tóc của Tùng để tách khối. Dáng người giữ nguyên bản đã chốt của Tùng
 * (không áp `DANG_THAM_CHIEU` của Nam). `volume={false}` trả về bản 2D. Hướng sáng lấy từ `lightFor` của phòng 3D qua `lightDir`.
 */
type TungProps = React.ComponentProps<typeof TungSoccer>;
/** Bộ đồ Tùng với vạt áo đấu lệch theo vật lý (cùng cách của `namOutfitDang`: chỉ các điểm gấu dịch, hai điểm trên eo giữ nguyên). */
export const tungOutfitSway = (sway?: HemSway): Outfit => {
  if (!sway || (!sway.dx && !sway.dy)) return TUNG_OUTFIT;
  const views = Object.fromEntries(Object.entries(TUNG_OUTFIT.views ?? {}).map(([k, v]) => [k, { ...v!, hem: swayHem(v!.hem, sway) }])) as Outfit['views'];
  return { ...TUNG_OUTFIT, hem: swayHem(TUNG_OUTFIT.hem, sway), views };
};
export const Tung25D: React.FC<TungProps & { volume?: boolean; lighting?: Light25; lightDir?: [number, number]; hemSway?: HemSway }> = ({ volume = true, lighting = 'ngay', lightDir, hemSway, ...props0 }) => {
  const props = hemSway ? { ...props0, outfit: tungOutfitSway(hemSway) } : props0;
  if (!volume) return <TungSoccer {...props} />;
  const { x = 0, y = 0, scale = 1, pose = TUNG_POSE } = props;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Volume25 subject={<TungSoccer {...props} x={0} y={0} scale={1} />} light={lighting} shirt={PALETTE.tung.jersey} pants={PALETTE.tung.shorts} hair={PALETTE.tung.hair} dir={lightDir}
        armsFront={!!(pose.frontR || pose.frontL)} depth={pose.view === 'three' || pose.view === 'side' || pose.view === 'quarter' || pose.view === undefined} />
    </g>
  );
};

const clampN = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/**
 * Tùng 2.5D có vật lý thứ cấp (cùng bản mô phỏng `simulate` của Nam): quán tính, nhún, dẹt–vươn quanh bàn chân, vạt áo đấu lệch.
 * Tóc Tùng chưa có tham số lắc nên không nhận `hair` của mô phỏng. `physics={false}` hiển thị đúng dáng gốc để so sánh.
 */
export const TungVatLy: React.FC<Omit<React.ComponentProps<typeof Tung25D>, 'pose'> & { track: PhysFrame[]; frame: number; base: (f: number) => JointPose; physics?: boolean; groundY?: number }> = ({ track, frame, base, physics = true, x = 0, y = 0, scale = 1, groundY = 589, ...rest }) => {
  const fr = track[clampN(Math.round(frame), 0, track.length - 1)];
  if (!physics) return <Tung25D {...rest} x={x} y={y} scale={scale} pose={base(frame)} />;
  const { sx, sy } = fr.squash;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g transform={`translate(0 ${groundY}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(0 ${-groundY})`}>
        <Tung25D {...rest} x={0} y={0} scale={1} pose={fr.pose} hemSway={fr.hem} />
      </g>
    </g>
  );
};
