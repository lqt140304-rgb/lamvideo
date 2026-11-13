import React from 'react';
import { JointPose } from '../../nhan-vat';
import { HemSway } from './nam-2-5d';
import { Tung25D, tungOutfitDang } from './nhan-vat-khac-2-5d';
import { addWindHair, addWindHem } from './vat-ly';
import type { PhysFrame, WindSway } from './vat-ly';

/**
 * Tùng 2.5D có vật lý thứ cấp. `Tung25D` (dáng theo ảnh tham chiếu, ánh sáng 2.5D, mặt cảm xúc 2.5D) nằm ở `nhan-vat-khac-2-5d.tsx`
 * và được export lại ở đây để mã cũ vẫn import được từ `tung-2-5d`.
 */
export { Tung25D };
type TungProps = React.ComponentProps<typeof Tung25D>;
/** Bộ đồ Tùng với vạt áo đấu lệch theo vật lý (giữ tên cũ). */
export const tungOutfitSway = (sway?: HemSway) => tungOutfitDang(sway);

const clampN = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/**
 * Tùng 2.5D có vật lý thứ cấp (cùng bản mô phỏng `simulate` của Nam): quán tính, nhún, dẹt–vươn quanh bàn chân, vạt áo đấu lệch.
 * Tóc lắc theo mô phỏng (`hair`). `physics={false}` hiển thị đúng dáng gốc để so sánh.
 */
export const TungVatLy: React.FC<Omit<TungProps, 'pose'> & { track: PhysFrame[]; frame: number; base: (f: number) => JointPose; physics?: boolean; groundY?: number; wind?: WindSway }> = ({ track, frame, base, physics = true, wind, x = 0, y = 0, scale = 1, groundY = 589, ...rest }) => {
  const fr = track[clampN(Math.round(frame), 0, track.length - 1)];
  if (!physics) return <Tung25D {...rest} x={x} y={y} scale={scale} pose={base(frame)} />;
  const { sx, sy } = fr.squash;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g transform={`translate(0 ${groundY}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(0 ${-groundY})`}>
        <Tung25D {...rest} x={0} y={0} scale={1} pose={fr.pose} hair={addWindHair(fr.hair, wind)} hemSway={addWindHem(fr.hem, wind)} />
      </g>
    </g>
  );
};
