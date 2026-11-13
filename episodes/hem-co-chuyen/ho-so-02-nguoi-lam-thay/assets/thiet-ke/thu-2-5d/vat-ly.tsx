import React from 'react';
import { HairSway, JointPose, Limb, PALETTE, STAND_POSE, sampleWalk, TWIN_POSES } from '../../nhan-vat';
import { Light25, Nam25D } from './nam-2-5d';
import { NguoiKia25D, Tung25D } from './nhan-vat-khac-2-5d';

/**
 * VẬT LÝ THỨ CẤP CHO NAM (thử 11/11/2026).
 *
 * Tư thế gốc (`base`) là diễn xuất đã dựng; lớp này thêm phần do quán tính và va chạm: người ngả/trễ khi tăng–giảm tốc,
 * đầu trễ rồi vượt, tay vung theo (cẳng tay trễ hơn bắp tay), tóc và vạt áo bay theo gia tốc rồi tắt dần,
 * nhún khi tiếp đất (gập gối, dẹt–vươn giữ thể tích), giật mình. Mọi thứ là TẤT ĐỊNH theo số khung: mô phỏng từ khung 0
 * bằng lò xo–giảm chấn bước cố định, nên Remotion render lại một khung bất kỳ cũng ra đúng kết quả.
 *
 * Nguyên tắc chọn hệ số: dao động tắt dần dưới mức tới hạn (ζ ≈ 0,35–0,5 → vượt 1–2 nhịp rồi lặng), chu kỳ 0,3–0,7 s
 * (30 fps), biên độ nhỏ để vẫn đọc là cùng một người; vật càng nhẹ/càng xa gốc (tóc, vạt áo, cẳng tay) càng nhanh và càng trễ.
 * Không phải mô phỏng cơ thể rắn đầy đủ: là các lò xo gắn vào khớp rig đã chốt, không đổi hình mặc định.
 */

export type ImpactKind =
  | 'va' // bị va ngang vào vai: dir = hướng đẩy (+1 sang phải màn hình)
  | 'tiep-dat' // tiếp đất sau nhảy/rơi: mag theo độ cao rơi
  | 'giat-minh' // giật mình: người bật lên, đầu giật ra sau, tay vung
  | 'khung' // khựng lại (đập đầu gối vào góc bàn, vấp): người gập về trước
export type Impact = { f: number; kind: ImpactKind; mag?: number; dir?: 1 | -1 };

/** Một lò xo bậc hai: x'' = −k·x − c·x' + lực vào. */
type Spring = { x: number; v: number };
const spring = (): Spring => ({ x: 0, v: 0 });

export type PhysParams = {
  fps: number;
  sub: number; // số bước con mỗi khung (ổn định số học)
  // [k, c]: độ cứng, giảm chấn (đơn vị trên khung²/khung)
  tilt: [number, number];
  neck: [number, number];
  arm: [number, number];
  forearm: [number, number];
  sq: [number, number];
  hair: [number, number];
  hem: [number, number];
  /** hệ số đưa gia tốc thân vào từng phần */
  g: { tilt: number; neck: number; arm: number; forearm: number; hair: number; hairY: number; hem: number; hemY: number; sq: number };
  breath: number; // biên độ thở (độ nghiêng thân)
};
export const DEFAULT_PHYS: PhysParams = {
  fps: 30, sub: 3,
  tilt: [0.11, 0.26],
  neck: [0.2, 0.32],
  arm: [0.15, 0.24],
  forearm: [0.26, 0.34],
  sq: [0.2, 0.34],
  hair: [0.32, 0.4], // ζ ≈ 0,35: nhẹ, vượt 1–2 nhịp rồi lặng nhanh
  hem: [0.28, 0.36],
  g: { tilt: 0.4, neck: 0.6, arm: 0.9, forearm: 1.4, hair: 0.55, hairY: 0.6, hem: 0.8, hemY: 0.9, sq: 0.55 },
  breath: 0.35,
};

export type PhysFrame = {
  pose: JointPose;
  hair: HairSway;
  hem: { dx: number; dy: number };
  /** dẹt–vươn quanh bàn chân, giữ thể tích: sx·sy = 1 */
  squash: { sx: number; sy: number };
  /** độ nhún gập gối 0..1 (đã đưa vào pose) */
  knee: number;
};

const clampN = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const addLimb = (l: Limb, a: number, b: number): Limb => ({ ...l, a: l.a + a, b: Math.max(0, l.b + b) });

/**
 * Mô phỏng `total` khung. `base(f)` trả tư thế gốc ở khung f (số, có thể là hàm của thời gian);
 * gia tốc thân lấy từ chính chuyển động của `base` (pose.x, pose.y, tilt) nên đi–dừng, nhảy–đáp… tự sinh phản ứng.
 */
export const simulate = (base: (f: number) => JointPose, impacts: Impact[], total: number, P: PhysParams = DEFAULT_PHYS): PhysFrame[] => {
  const dt = 1 / P.sub;
  const S = { tilt: spring(), neck: spring(), aR: spring(), aL: spring(), bR: spring(), bL: spring(), sq: spring(), hr: spring(), hy: spring(), hx: spring(), mx: spring(), my: spring() };
  const out: PhysFrame[] = [];
  const baseAt = (f: number) => base(clampN(f, 0, total - 1));
  const at = (impact: Impact) => impact;
  for (let f = 0; f < total; f++) {
    const b0 = baseAt(f), bm = baseAt(f - 1), bp = baseAt(f + 1);
    // gia tốc thân (đơn vị rig / khung²) từ chuyển động của tư thế gốc
    const ax = bp.x - 2 * b0.x + bm.x, ay = bp.y - 2 * b0.y + bm.y;
    const atilt = bp.tilt - 2 * b0.tilt + bm.tilt;
    // xung va chạm tại khung này: cộng thẳng vào vận tốc các lò xo
    for (const im of impacts.filter((i) => i.f === f).map(at)) {
      const m = im.mag ?? 1, d = im.dir ?? 1;
      if (im.kind === 'va') {
        S.tilt.v += d * 3.4 * m; S.neck.v += -d * 3.2 * m; S.aR.v += -d * 3.2 * m; S.aL.v += -d * 3.2 * m;
        S.bR.v += 2.4 * m; S.bL.v += 2.4 * m; S.hr.v += -d * 7 * m; S.hx.v += -d * 1.2 * m; S.mx.v += -d * 2.4 * m; S.sq.v += 0.1 * m;
      } else if (im.kind === 'tiep-dat') {
        S.sq.v += 0.55 * m; S.aR.v += 3.2 * m; S.aL.v += 3.2 * m; S.bR.v += -2.6 * m; S.bL.v += -2.6 * m;
        S.neck.v += 2 * m; S.tilt.v += 1.4 * m; S.hy.v += -2.4 * m; S.my.v += -2.2 * m; S.hr.v += 2 * m;
      } else if (im.kind === 'giat-minh') {
        S.sq.v += -0.5 * m; S.neck.v += -d * 3 * m; S.tilt.v += -d * 1.6 * m; S.aR.v += 4.4 * m; S.aL.v += 4.4 * m; S.bR.v += 2 * m; S.bL.v += 2 * m;
        S.hy.v += 2.6 * m; S.hr.v += -d * 4 * m; S.my.v += 2.4 * m;
      } else if (im.kind === 'khung') {
        S.tilt.v += d * 3.2 * m; S.neck.v += d * 1.6 * m; S.sq.v += 0.25 * m; S.aR.v += d * 2.2 * m; S.aL.v += d * 2.2 * m;
        S.hr.v += d * 4 * m; S.mx.v += d * 1.6 * m;
      }
    }
    for (let s = 0; s < P.sub; s++) {
      // thân: ngả ngược chiều gia tốc (quán tính), kéo sàn về 0
      S.tilt.v += dt * (-P.tilt[0] * S.tilt.x - P.tilt[1] * S.tilt.v - P.g.tilt * ax * P.sub - 0.3 * atilt * P.sub);
      // đầu trễ: chống lại thân ngả rồi vượt
      S.neck.v += dt * (-P.neck[0] * S.neck.x - P.neck[1] * S.neck.v - P.g.neck * (S.tilt.v - 0.4 * ax * P.sub) * 0.5);
      // tay vung ngược gia tốc thân; cẳng tay trễ hơn bắp tay (gập khi bắp tay tăng tốc)
      const aAcc = -P.g.arm * ax * P.sub - 0.25 * (S.tilt.v - 0);
      S.aR.v += dt * (-P.arm[0] * S.aR.x - P.arm[1] * S.aR.v + aAcc);
      S.aL.v += dt * (-P.arm[0] * S.aL.x - P.arm[1] * S.aL.v + aAcc * 0.9);
      S.bR.v += dt * (-P.forearm[0] * S.bR.x - P.forearm[1] * S.bR.v + P.g.forearm * (S.aR.v - S.bR.v * 0) * 0.35);
      S.bL.v += dt * (-P.forearm[0] * S.bL.x - P.forearm[1] * S.bL.v + P.g.forearm * (S.aL.v) * 0.35);
      // nhún: nén khi thân tăng tốc xuống/đáp (ay > 0 là xuống), vươn khi bật lên
      S.sq.v += dt * (-P.sq[0] * S.sq.x - P.sq[1] * S.sq.v + P.g.sq * ay * P.sub * 0.03);
      // tóc: xoay ngược gia tốc ngang của đầu, nảy theo gia tốc dọc; nhẹ nên nhanh và trễ hơn thân
      const headAx = ax + 0.9 * S.tilt.v + 0.4 * S.neck.v, headAy = ay + 0.4 * S.sq.v * 20;
      S.hr.v += dt * (-P.hair[0] * S.hr.x - P.hair[1] * S.hr.v - P.g.hair * headAx * P.sub);
      S.hx.v += dt * (-P.hair[0] * S.hx.x - P.hair[1] * S.hx.v - 0.35 * headAx * P.sub);
      S.hy.v += dt * (-P.hair[0] * S.hy.x - P.hair[1] * S.hy.v - P.g.hairY * headAy * P.sub * 0.08);
      // vạt áo: lệch ngược gia tốc thân, rơi trễ khi thân đi lên
      S.mx.v += dt * (-P.hem[0] * S.mx.x - P.hem[1] * S.mx.v - P.g.hem * (ax + 1.2 * S.tilt.v) * P.sub * 0.6);
      S.my.v += dt * (-P.hem[0] * S.my.x - P.hem[1] * S.my.v - P.g.hemY * ay * P.sub * 0.3);
      for (const k of Object.values(S)) k.x += dt * k.v;
    }
    // đầu ra: cộng độ lệch vào tư thế gốc
    const knee = clampN(S.sq.x * 1.6, -0.15, 1);
    const breathe = Math.sin((f / P.fps) * Math.PI * 2 * 0.28) * P.breath;
    const sy = 1 - clampN(S.sq.x, -0.25, 0.4) * 0.12, sx = 1 / sy;
    const kn = Math.max(0, knee);
    const pose: JointPose = {
      ...b0,
      tilt: b0.tilt + clampN(S.tilt.x, -14, 14) + breathe,
      neck: b0.neck + clampN(S.neck.x, -16, 16) - 0.5 * breathe,
      armR: addLimb(b0.armR, clampN(S.aR.x, -35, 35), clampN(S.bR.x, -30, 30)),
      armL: addLimb(b0.armL, clampN(S.aL.x, -35, 35), clampN(S.bL.x, -30, 30)),
      // gập gối khi nén: hông tự hạ nhờ planted; chỉ cộng khi chân đang đứng dưới hông (không phá tư thế đi/ngồi)
      legR: kn > 0.001 ? addLimb(b0.legR, 26 * kn, 52 * kn) : b0.legR,
      legL: kn > 0.001 ? addLimb(b0.legL, 26 * kn, 52 * kn) : b0.legL,
    };
    out.push({
      pose,
      hair: { rot: clampN(S.hr.x, -9, 9), dx: clampN(S.hx.x, -4, 4), dy: clampN(S.hy.x, -5, 5) },
      hem: { dx: clampN(S.mx.x, -9, 9), dy: clampN(S.my.x, -6, 6) },
      squash: { sx, sy },
      knee: kn,
    });
  }
  return out;
};

/** Hook bọc `simulate`: mô phỏng rẻ (vài nghìn bước số học), tính lại mỗi lần render cũng được; giữ memo cho studio. */
export const usePhysics = (base: (f: number) => JointPose, impacts: Impact[], total: number, P: PhysParams = DEFAULT_PHYS) =>
  React.useMemo(() => simulate(base, impacts, total, P), [total]); // eslint-disable-line react-hooks/exhaustive-deps

/** Gió từ môi trường (xem `tuong-tac.tsx` `windSway`): cộng thẳng vào tóc và vạt áo của bản mô phỏng. Bỏ trống = không gió. */
export type WindSway = { hair: HairSway; hem: { dx: number; dy: number } };
export const addWindHair = (h: HairSway, w?: WindSway): HairSway => (w ? { rot: h.rot + w.hair.rot, dx: h.dx + w.hair.dx, dy: h.dy + w.hair.dy } : h);
export const addWindHem = (h: { dx: number; dy: number }, w?: WindSway) => (w ? { dx: h.dx + w.hem.dx, dy: h.dy + w.hem.dy } : h);
type NamProps = React.ComponentProps<typeof Nam25D>;
/**
 * Nam 2.5D có vật lý: nhận `frame` (số khung hiện tại) và bản mô phỏng; dẹt–vươn quanh bàn chân, tóc, vạt áo, khớp lấy từ `PhysFrame`.
 * `physics={false}` hiển thị đúng tư thế gốc để so sánh.
 */
export const NamVatLy: React.FC<Omit<NamProps, 'pose' | 'hair'> & { track: PhysFrame[]; frame: number; base: (f: number) => JointPose; physics?: boolean; groundY?: number; Body?: React.ComponentType<any>; wind?: WindSway }> = ({ track, frame, base, physics = true, wind, x = 0, y = 0, scale = 1, groundY = 589, Body = Nam25D, ...rest }) => {
  const fr = track[clampN(Math.round(frame), 0, track.length - 1)];
  if (!physics) return <Body {...rest} x={x} y={y} scale={scale} pose={base(frame)} />;
  const { sx, sy } = fr.squash;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g transform={`translate(0 ${groundY}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(0 ${-groundY})`}>
        <Body {...rest} x={0} y={0} scale={1} pose={fr.pose} hair={addWindHair(fr.hair, wind)} hemSway={addWindHem(fr.hem, wind)} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------------------
// KỊCH BẢN THỬ + BẢNG DUYỆT
// ---------------------------------------------------------------------------
const P3 = (p: JointPose): JointPose => ({ ...p, view: 'three', facing: 1 });
const SCENES: { id: string; title: string; note: string; total: number; frames: number[]; base: (f: number) => JointPose; impacts: Impact[]; y0?: number }[] = [
  {
    id: 'va', title: 'BỊ VA VÀO VAI', note: 'Cú va từ trái ở khung 6: thân ngả, đầu trễ rồi vượt, tay vung ngược, tóc và vạt áo bay theo, nhún nhẹ rồi lặng',
    total: 60, frames: [5, 7, 9, 12, 16, 21, 28, 45], base: () => P3(STAND_POSE), impacts: [{ f: 6, kind: 'va', mag: 1.7, dir: 1 }],
  },
  {
    id: 'dat', title: 'NHẢY XUỐNG TIẾP ĐẤT', note: 'Nhảy lên rồi đáp ở khung 22: gập gối, dẹt–vươn giữ thể tích, tay vung lên, tóc/vạt áo rơi trễ',
    total: 70, frames: [8, 15, 21, 23, 26, 30, 38, 52],
    base: (f) => {
      const t = clampN(f / 22, 0, 1), h = 4 * t * (1 - t) * 95;
      const air = f > 0 && f < 22;
      return P3({ ...STAND_POSE, y: -h, planted: !air, legR: air ? { a: 8, b: 20 } : STAND_POSE.legR, legL: air ? { a: 4, b: 16 } : STAND_POSE.legL, armR: { a: air ? 40 : 2, b: 8 }, armL: { a: air ? 40 : 2, b: 8, rot: -1 } });
    },
    impacts: [{ f: 22, kind: 'tiep-dat', mag: 1.7 }],
  },
  {
    id: 'dung', title: 'ĐANG ĐI DỪNG KHỰNG', note: 'Đi nhanh rồi dừng ở khung 34: thân lao về trước theo quán tính, đầu và tay trễ, tóc bay về trước rồi dội lại',
    total: 80, frames: [10, 22, 33, 36, 39, 43, 50, 66],
    base: (f) => {
      const w = f < 34 ? 1 : 0, x = Math.min(f, 34) * 4.2;
      const p = w ? sampleWalk(f * 0.034) : STAND_POSE;
      return P3({ ...p, x });
    },
    impacts: [],
  },
  {
    id: 'giat', title: 'GIẬT MÌNH', note: 'Giật mình ở khung 6: người bật lên rồi nén lại, đầu giật ra sau, hai tay vung, tóc và vạt áo hất lên',
    total: 60, frames: [5, 7, 9, 12, 16, 22, 32, 46], base: () => P3(STAND_POSE), impacts: [{ f: 6, kind: 'giat-minh', mag: 1.6, dir: 1 }],
  },
];
export const PHYS_SCENES = SCENES;

export type Who25 = 'nam' | 'kia' | 'tung';
const WHO: Record<Who25, { Body: React.ComponentType<any>; props: Record<string, unknown>; name: string }> = {
  nam: { Body: Nam25D, props: { shirt: PALETTE.nam.sleepShirt, mood: 'sleepy' }, name: 'NAM' },
  kia: { Body: NguoiKia25D, props: { mood: 'calm' }, name: 'NGƯỜI KIA' },
  tung: { Body: Tung25D, props: { mood: 'annoyed' }, name: 'TÙNG' },
};
export const VatLyBoard: React.FC<{ scene?: string; who?: Who25 }> = ({ scene = 'va', who = 'nam' }) => {
  const W0 = WHO[who];
  const sc = SCENES.find((s) => s.id === scene) ?? SCENES[0];
  const track = simulate(sc.base, sc.impacts, sc.total);
  const W = 1920, cols = sc.frames.length, cw = W / cols;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={W} height={1080} viewBox={`0 0 ${W} 1080`}>
      <rect width={W} height={1080} fill="#f6f1e8" />
      <text x={W / 2} y={46} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={28} fontWeight={800} fill={PALETTE.ink}>{`VẬT LÝ THỨ CẤP — ${W0.name} — ${sc.title}`}</text>
      <text x={W / 2} y={74} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={15} fill="#69706c">{sc.note}</text>
      {['TƯ THẾ GỐC (không vật lý)', 'CÓ VẬT LÝ'].map((t, row) => (
        <g key={t}>
          <text x={14} y={118 + row * 480} fontFamily="Arial, sans-serif" fontSize={16} fontWeight={800} fill={row ? '#2f5d50' : '#707875'}>{t}</text>
          {sc.frames.map((f, i) => {
            const cx = cw * i + cw / 2, floor = 462 + row * 480, S = 0.62;
            return (
              <g key={f}>
                <path d={`M ${cw * i + 20} ${floor} H ${cw * (i + 1) - 20}`} stroke="#d7cdb9" strokeWidth={2} />
                <NamVatLy Body={W0.Body} {...(W0.props as object)} track={track} frame={f} base={sc.base} physics={!!row} lighting={'ngay' as Light25} x={cx - 5 - sc.base(f).x * S} y={floor - 589 * S} scale={S} />
                <text x={cx} y={floor + 30} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={15} fill="#69706c">{`khung ${f}`}</text>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
};
