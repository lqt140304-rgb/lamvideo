import React from 'react';
import { PALETTE, TungSoccer, TUNG_POSE } from '../../nhan-vat';
import { Light25, Volume25 } from './nam-2-5d';

/**
 * Tùng 2.5D (11/11/2026): cùng lớp ánh sáng 2.5D của Nam (`Volume25`: tông cảnh, mảng tối theo khối, bóng đổ giữa lớp, viền sáng, ánh màn hình)
 * phủ lên `TungSoccer`. Dùng màu áo đấu, quần đùi và tóc của Tùng để tách khối. Dáng người giữ nguyên bản đã chốt của Tùng
 * (không áp `DANG_THAM_CHIEU` của Nam). `volume={false}` trả về bản 2D. Hướng sáng lấy từ `lightFor` của phòng 3D qua `lightDir`.
 */
type TungProps = React.ComponentProps<typeof TungSoccer>;
export const Tung25D: React.FC<TungProps & { volume?: boolean; lighting?: Light25; lightDir?: [number, number] }> = ({ volume = true, lighting = 'ngay', lightDir, ...props }) => {
  if (!volume) return <TungSoccer {...props} />;
  const { x = 0, y = 0, scale = 1, pose = TUNG_POSE } = props;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Volume25 subject={<TungSoccer {...props} x={0} y={0} scale={1} />} light={lighting} shirt={PALETTE.tung.jersey} pants={PALETTE.tung.shorts} hair={PALETTE.tung.hair} dir={lightDir}
        armsFront={!!(pose.frontR || pose.frontL)} depth={pose.view === 'three' || pose.view === 'side' || pose.view === 'quarter' || pose.view === undefined} />
    </g>
  );
};
