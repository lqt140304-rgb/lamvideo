import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { JointPose, PALETTE, sampleWalk, STAND_POSE } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { RoomScene, RoomView, SEATS } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';
import { lifePose, blinkAt } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/song-dong';
import { cameraShake, Dust, DustEvent, footFalls, pushedObject, windSway } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/tuong-tac';
import { NamVatLy, simulate } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/thiet-ke/thu-2-5d/vat-ly';

/**
 * Cảnh thử TƯƠNG TÁC NHÂN VẬT – BỐI CẢNH (câm, 8 s). Toàn phòng ban ngày, phòng tự chuyển động (`frame`).
 * Nam đứng trước quạt (gió thổi tóc, vạt áo), đi sang phải (bụi bước chân), vấp vào ghế: ghế trượt–xoay rồi dừng do ma sát,
 * chân ghế cào sàn tung bụi, Nam khựng người (vật lý `khung`), máy rung nhẹ; rồi đứng lại thở, liếc xuống ghế.
 * Không có giọng/nhạc. Mọi chuyển động tất định theo số khung.
 */
export const TUONG_TAC_TOTAL = 240;
const VIEW: RoomView = 'wide';
const Z = 430; // đường đi (cm), trước quạt, song song tường sau
const X0 = 58, X_STOP = 150; // điểm xuất phát, điểm va ghế
const WALK = [26, 96] as const; // khung bắt đầu/kết thúc đi
const HIT = WALK[1]; // khung va ghế
const RIG_PER_CM = 590 / 168;
const BASE_MOVE = { truck: -60, push: -190 };
// Ghế: lấy ghế cạnh cửa, đặt lên đường đi
const CHAIR_BASE = { chair: 'door' as const, dx: 203 - SEATS.door.x, dz: Z - 10 - SEATS.door.z };

const walkX = (f: number) => {
  const t = Math.min(1, Math.max(0, (f - WALK[0]) / (WALK[1] - WALK[0])));
  const e = (t < 0.2 ? (t * t) / 0.4 : t - 0.1) / 0.9; // tăng tốc lúc bắt đầu, đến ghế vẫn đang đi đều (va thật, không phanh trước)
  return X0 + (X_STOP - X0) * e;
};
const phaseAt = (f: number) => Math.max(0, (walkX(f) - X0) / 52); // một chu kỳ ~52 cm (2 bước)
const walking = (f: number) => f > WALK[0] && f < WALK[1];

/** Tư thế gốc: đứng – đi – đứng, cộng lớp sống động; pose.x mang chuyển dịch thật (vật lý lấy gia tốc từ đây). */
const basePose = (f: number): JointPose => {
  const p = walking(f) ? sampleWalk(phaseAt(f)) : STAND_POSE;
  const looked = f > HIT + 30 ? { neck: -10 } : {}; // liếc xuống ghế sau cú va
  return lifePose({ ...p, ...looked, view: 'side', facing: 1, x: (walkX(f) - X0) * RIG_PER_CM }, f, { seed: 3 });
};
const IMPACTS = [{ f: HIT, kind: 'khung' as const, mag: 1.3, dir: 1 as const }];
const TRACK = simulate(basePose, IMPACTS, TUONG_TAC_TOTAL);
const SHOVES = [{ f: HIT, vx: 4.6, vz: -0.6, spin: 0.085 }]; // ghế nhẹ, va lúc đang đi: trượt ~30 cm, xoay ~30°
const STEPS = footFalls(WALK[0], WALK[1], phaseAt);

export const HoSo02TuongTac: React.FC = () => {
  const f = useCurrentFrame();
  const chair = pushedObject(f, SHOVES);
  const shake = cameraShake(f, [{ f: HIT, amp: 1.6 }]);
  const move = { truck: BASE_MOVE.truck + (shake.truck ?? 0), push: BASE_MOVE.push + (shake.push ?? 0) }; // lùi máy cho thấy trọn người và sàn (bụi), cộng rung khi va
  const x = walkX(f);
  const wind = windSway(f, [x, Z], 1);
  // gió cộng vào tóc/vạt áo của bản vật lý
  const track = TRACK.map((fr, i) => (i === f ? { ...fr, hair: { rot: fr.hair.rot + wind.hair.rot, dx: fr.hair.dx + wind.hair.dx, dy: fr.hair.dy + wind.hair.dy }, hem: { dx: fr.hem.dx + wind.hem.dx, dy: fr.hem.dy + wind.hem.dy } } : fr));
  const dust: DustEvent[] = [
    ...STEPS.map((s) => ({ f: s, at: [walkX(s) + 6, Z] as [number, number], amount: 0.7, dir: Math.PI })),
    // chân ghế cào sàn khi đang trượt: mỗi 3 khung một cụm, dừng khi ghế đứng
    ...Array.from({ length: 14 }, (_, i) => HIT + i * 3).filter((g) => pushedObject(g, SHOVES).speed > 0.3).map((g) => {
      const c = pushedObject(g, SHOVES);
      return { f: g, at: [203 + c.dx + 14, Z - 10 + c.dz + 8] as [number, number], amount: 1.1, dir: 0 };
    }),
  ];
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <RoomScene view={VIEW} frame={f} rays={0.9} falloff={0.9} door="ajar" chair={CHAIR_BASE.chair} phone="hidden" kitchen="clean" move={move}
        chairPush={{ dx: CHAIR_BASE.dx + chair.dx, dz: CHAIR_BASE.dz + chair.dz, rot: chair.rot }}
        actors={[{ at: [X0, Z], render: (p) => (
          <NamVatLy track={track} frame={f} base={basePose} lighting="ngay" shirt={PALETTE.nam.sleepShirt}
            mood={f > HIT + 4 && f < HIT + 70 ? 'annoyed' : 'sleepy'} blink={blinkAt(f, 3)} x={p.x} y={p.y} scale={p.scale} />
        ) }]}>
        <Dust frame={f} events={dust} view={VIEW} move={move} color="#cdbfa6" />
      </RoomScene>
    </AbsoluteFill>
  );
};
