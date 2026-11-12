import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { RoomScene } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';

/** Nền phòng (toàn phòng, ban ngày, không nhân vật) để ghép lớp Nam 3D thử (`assets/thiet-ke/thu-3d/phong.html`). 14 s. */
export const THU_3D_NEN_TOTAL = 420;
export const HoSo02Thu3DNen: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <RoomScene view="wide" frame={f} rays={0.9} falloff={0.9} door="ajar" chair="door" phone="hidden" kitchen="clean" actors={[]} />
    </AbsoluteFill>
  );
};
