import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FONT } from '../../engine/fonts';
import { JointPose, PALETTE, sampleWalk, STAND_POSE, TWIN_POSES, turnAt } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { LIGHT_SOURCES, lightFor, RoomScene, SEATS } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';
import { easePose, LivingNam25D, LivingNguoiKia25D, LivingTung25D, NamSongVatLy, speak, TungSongVatLy } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/song-dong';
import { exprTrack } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/cam-xuc-2-5d';
import { cameraShake, Dust, DustEvent, footFalls, pushedObject, windSway } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/tuong-tac';

/**
 * CẢNH THỬ TỔNG HỢP Hồ sơ 02 (câm, 22 s, 5 cảnh): ghép mọi lớp đã làm — dáng 2.5D mới, mặt cảm xúc tham số, dáng sống (thở, chớp, trôi),
 * vật lý thứ cấp (quán tính, tóc, vạt áo), tương tác bối cảnh (ghế bị xô, bụi, gió quạt, rung máy), ánh sáng theo nguồn (cửa sổ ngày, laptop xanh đêm).
 *  1  NGÀY · toàn phòng      Nam đi vào trước quạt, vấp ghế (giật mình), ghế trượt, rung máy
 *  2  NGÀY · góc bếp         Người Kia đứng quay lưng ở bồn rửa, quay lại, cười giấu
 *  3  ĐÊM · góc bàn học      Nam ngồi gõ laptop (ánh xanh), suy luận → lo lắng → kiệt sức
 *  4  ĐÊM · toàn phòng       Tùng đi vào, hai người nói chuyện, tức giận → nghi ngờ / tội lỗi → ngại ngùng
 *  5  NGÀY · toàn phòng      Cả ba đứng cạnh nhau, mỗi người một nhịp thở và nét mặt
 * Mọi chuyển động tất định theo số khung. Không giọng, không nhạc.
 */
export const TONG_HOP_TOTAL = 660;
const S = [0, 150, 270, 420, 570, 660] as const;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (f: number, a: number, b: number) => clamp((f - a) / (b - a));
const RIG_PER_CM = 590 / 168;
type At = [number, number];

// ------------------------------------------------------------------ CẢNH 1: va ghế
const Z1 = 430, X0 = 58, X_STOP = 150, W1 = [20, 70] as const, HIT = 70;
const CHAIR1 = { dx: 203 - SEATS.door.x, dz: Z1 - 10 - SEATS.door.z };
const walkX = (g: number) => { const t = ramp(g, W1[0], W1[1]); return X0 + (X_STOP - X0) * ((t < 0.2 ? (t * t) / 0.4 : t - 0.1) / 0.9); };
const phase1 = (g: number) => Math.max(0, (walkX(g) - X0) / 52);
const base1 = (g: number): JointPose => ({ ...(g > W1[0] && g < W1[1] ? sampleWalk(phase1(g)) : STAND_POSE), ...(g > HIT + 30 ? { neck: -10 } : {}), view: 'side', facing: 1, x: (walkX(g) - X0) * RIG_PER_CM });
const SHOVES = [{ f: HIT, vx: 4.6, vz: -0.6, spin: 0.085 }];
const STEPS1 = footFalls(W1[0], W1[1], phase1);
const Shot1: React.FC<{ g: number }> = ({ g }) => {
  const chair = pushedObject(g, SHOVES), shake = cameraShake(g, [{ f: HIT, amp: 1.6 }]);
  const move = { truck: -60 + (shake.truck ?? 0), push: -190 + (shake.push ?? 0) };
  const x = walkX(g), wind = windSway(g, [x, Z1], 1);
  const dust: DustEvent[] = [
    ...STEPS1.map((s) => ({ f: s, at: [walkX(s) + 6, Z1] as At, amount: 0.7, dir: Math.PI })),
    ...Array.from({ length: 14 }, (_, i) => HIT + i * 3).filter((k) => pushedObject(k, SHOVES).speed > 0.3).map((k) => { const c = pushedObject(k, SHOVES); return { f: k, at: [203 + c.dx + 14, Z1 - 10 + c.dz + 8] as At, amount: 1.1, dir: 0 }; }),
  ];
  const d = lightFor('wide', [x, Z1], LIGHT_SOURCES.window, move);
  return (
    <RoomScene view="wide" frame={S[0] + g} rays={0.9} falloff={0.9} door="ajar" chair="door" phone="hidden" kitchen="clean" move={move}
      chairPush={{ dx: CHAIR1.dx + chair.dx, dz: CHAIR1.dz + chair.dz, rot: chair.rot }}
      actors={[{ at: [X0, Z1], lit: false, render: (p) => (
        <NamSongVatLy frame={g} total={S[1] - S[0]} seed={2} base={base1} impacts={[{ f: HIT, kind: 'khung', mag: 1.3, dir: 1 }]} wind={wind}
          lighting="ngay" lightDir={[d.x, d.y]} shirt={PALETTE.nam.sleepShirt}
          expr={exprTrack(g, [[0, 'buon-ngu-1'], [HIT, 'so-hai-3'], [HIT + 26, 'tuc-gian-2'], [HIT + 62, 'binh-than-1']])} x={p.x} y={p.y} scale={p.scale} />
      ) }]}>
      <Dust frame={g} events={dust} view="wide" move={move} color="#cdbfa6" />
    </RoomScene>
  );
};

// ------------------------------------------------------------------ CẢNH 2: bếp, Người Kia quay lại
const KIA2: At = [104, 86];
const Shot2: React.FC<{ g: number }> = ({ g }) => {
  const base = (k: number): JointPose => { const tt = turnAt({ view: 'back' }, { view: 'three', facing: 1 }, ramp(k, 38, 78)); return { ...STAND_POSE, view: tt.view, facing: tt.facing, neck: k > 78 ? 4 : 0 }; };
  const move = { truck: 0, push: -125 + 40 * ramp(g, 0, 120) }; // lùi ra cho thấy trọn người, rồi đẩy chậm vào
  const d = lightFor('kitchen', KIA2, LIGHT_SOURCES.window, move);
  return (
    <RoomScene view="kitchen" frame={S[1] + g} rays={0.9} falloff={0.9} door="ajar" chair="bed" phone="hidden" kitchen="messy" move={move}
      actors={[{ at: KIA2, lit: false, render: (p) => (
        <NamSongVatLy identity="nguoi-kia" frame={g} total={S[2] - S[1]} seed={5} base={base} lighting="ngay" lightDir={[d.x, d.y]}
          expr={exprTrack(g, [[0, 'binh-than-1'], [64, 'bat-ngo-1'], [86, 'cuoi-che-giau-2']], 14)} x={p.x} y={p.y} scale={p.scale} />
      ) }]} />
  );
};

// ------------------------------------------------------------------ CẢNH 3: bàn học đêm, ánh laptop
const TYPE = { ...TWIN_POSES.type, view: 'three' as const, facing: 1 as const };
const LEAN = { ...TWIN_POSES.sit, view: 'three' as const, facing: 1 as const, tilt: 8, neck: -6 };
const Shot3: React.FC<{ g: number }> = ({ g }) => {
  const move = { truck: 14 * ramp(g, 0, 150), push: 0 };
  const at: At = [396, 112], d = lightFor('desk', at, LIGHT_SOURCES.lamp, move);
  const base = (k: number) => easePose(TYPE, LEAN, ramp(k, 70, 100), { anticipate: 3 });
  return (
    <RoomScene view="desk" night phone="desk" kitchen="clean" chair="desk" frame={S[2] + g} move={move}
      actors={[{ at, lit: false, render: (p) => (
        <NamSongVatLy frame={g} total={S[3] - S[2]} seed={2} base={base} lighting="man-hinh" lightDir={[d.x, d.y]} shirt={PALETTE.nam.sleepShirt}
          talk={speak(g, 108, 146, 2)} expr={exprTrack(g, [[0, 'suy-luan-2'], [58, 'lo-lang-2'], [104, 'kiet-suc-3']], 16)} x={p.x} y={p.y} scale={p.scale} />
      ) }]} />
  );
};

// ------------------------------------------------------------------ CẢNH 4: đêm, Tùng vào, hai người nói chuyện
const Z4 = 306, NAM4: At = [205, 290], TUNG_X0 = 30, TUNG_X1 = 135; // sàn trống bên trái giường (đệm từ x=252, đồ vứt sàn ở 215,355): không dẫm lên vật thể
const tungX = (g: number) => { const t = ramp(g, 8, 78); return TUNG_X0 + (TUNG_X1 - TUNG_X0) * ((t < 0.2 ? (t * t) / 0.4 : t - 0.1) / 0.9); };
const tungPhase = (g: number) => Math.max(0, (tungX(g) - TUNG_X0) / 52);
const TUNG_STAND = { ...STAND_POSE, view: 'three' as const, facing: 1 as const };
const tungBase = (g: number): JointPose => ({ ...(g > 8 && g < 78 ? sampleWalk(tungPhase(g)) : TUNG_STAND), view: 'three', facing: 1, x: (tungX(g) - TUNG_X0) * RIG_PER_CM });
const STEPS4 = footFalls(8, 78, tungPhase);
const Shot4: React.FC<{ g: number }> = ({ g }) => {
  const move = { truck: -40 + 20 * ramp(g, 0, 150), push: -170 + 25 * ramp(g, 60, 150) };
  const wind = windSway(S[3] + g, [tungX(g), Z4], 1);
  const dT = lightFor('wide', [tungX(g), Z4], LIGHT_SOURCES.lamp, move), dN = lightFor('wide', NAM4, LIGHT_SOURCES.lamp, move);
  const namBase = (): JointPose => ({ ...STAND_POSE, view: 'three', facing: -1 });
  const dust: DustEvent[] = STEPS4.map((s) => ({ f: s, at: [tungX(s) + 6, Z4] as At, amount: 0.6, dir: Math.PI }));
  return (
    <RoomScene view="wide" night phone="desk" kitchen="clean" door="ajar" chair="desk" frame={S[3] + g} move={move}
      actors={[
        { at: NAM4, lit: false, render: (p) => (
          <NamSongVatLy frame={g} total={S[4] - S[3]} seed={2} base={namBase} lighting="man-hinh" lightDir={[dN.x, dN.y]} shirt={PALETTE.nam.sleepShirt}
            talk={speak(g, 116, 146, 2)} expr={exprTrack(g, [[0, 'buon-ngu-1'], [88, 'toi-loi-2'], [118, 'ngai-ngu-2']], 16)} x={p.x} y={p.y} scale={p.scale} />
        ) },
        { at: [TUNG_X0, Z4], lit: false, render: (p) => (
          <TungSongVatLy frame={g} total={S[4] - S[3]} seed={11} base={tungBase} wind={wind} lighting="man-hinh" lightDir={[dT.x, dT.y]}
            talk={speak(g, 84, 112, 11)} expr={exprTrack(g, [[0, 'binh-than-1'], [80, 'tuc-gian-2'], [116, 'nghi-ngo-2']], 14)} x={p.x} y={p.y} scale={p.scale} />
        ) },
      ]}>
      <Dust frame={g} events={dust} view="wide" move={move} color="#7b8aa8" />
    </RoomScene>
  );
};

// ------------------------------------------------------------------ CẢNH 5: ban ngày, cả ba đứng cạnh nhau
const Shot5: React.FC<{ g: number }> = ({ g }) => {
  const move = { truck: -40, push: -170 - 30 * ramp(g, 0, 90) }; // lùi máy chậm
  const P: Record<'nam' | 'kia' | 'tung', At> = { nam: [95, 275], kia: [150, 268], tung: [205, 276] };
  const L = (a: At) => lightFor('wide', a, LIGHT_SOURCES.window, move);
  const dn = L(P.nam), dk = L(P.kia), dt = L(P.tung);
  return (
    <RoomScene view="wide" frame={S[4] + g} rays={0.9} falloff={0.9} door="ajar" chair="door" phone="hidden" kitchen="clean" move={move}
      actors={[
        { at: P.nam, lit: false, render: (p) => <LivingNam25D frame={g} seed={2} lighting="ngay" lightDir={[dn.x, dn.y]} shirt={PALETTE.nam.sleepShirt} pose={{ ...STAND_POSE, view: 'three', facing: 1 }} expr={exprTrack(g, [[0, 'buon-1'], [50, 'binh-than-1']])} x={p.x} y={p.y} scale={p.scale} /> },
        { at: P.kia, lit: false, render: (p) => <LivingNguoiKia25D frame={g} seed={5} lighting="ngay" lightDir={[dk.x, dk.y]} pose={{ ...STAND_POSE, view: 'three', facing: -1 }} expr={exprTrack(g, [[0, 'cuoi-che-giau-1'], [50, 'tu-man-2']])} x={p.x} y={p.y} scale={p.scale} /> },
        { at: P.tung, lit: false, render: (p) => <LivingTung25D frame={g} seed={11} lighting="ngay" lightDir={[dt.x, dt.y]} pose={{ ...STAND_POSE, view: 'three', facing: -1 }} expr={exprTrack(g, [[0, 'nghi-ngo-1'], [50, 'vui-1']])} x={p.x} y={p.y} scale={p.scale} /> },
      ]} />
  );
};

const LABEL = ['1 · NGÀY · toàn phòng — vấp ghế (vật lý, bụi, gió quạt, rung máy)', '2 · NGÀY · góc bếp — Người Kia quay lại', '3 · ĐÊM · bàn học — ánh laptop xanh', '4 · ĐÊM · toàn phòng — Tùng vào, hai người nói chuyện', '5 · NGÀY · cả ba cạnh nhau'];
export const HoSo02TongHop: React.FC = () => {
  const f = useCurrentFrame();
  const i = S.findIndex((s, k) => f >= s && f < S[k + 1]);
  const g = f - S[i];
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {i === 0 && <Shot1 g={g} />}
      {i === 1 && <Shot2 g={g} />}
      {i === 2 && <Shot3 g={g} />}
      {i === 3 && <Shot4 g={g} />}
      {i === 4 && <Shot5 g={g} />}
      <div style={{ position: 'absolute', left: 28, bottom: 22, fontFamily: FONT.title, fontSize: 24, color: '#f1ead9', textShadow: '0 2px 6px #000', letterSpacing: 1.5, opacity: 0.85 }}>{LABEL[i]}</div>
    </AbsoluteFill>
  );
};
