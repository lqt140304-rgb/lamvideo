import React from 'react';
import { HairSway, JointPose, Limb, StudentTwinBody, TungSoccer, STAND_POSE, TUNG_POSE, type Talk } from './nhan-vat';
import { SupportingActor, type Role } from './bo-sung-15p/nhan-vat-va-tu-the';
import { expr25For, Nam25D } from './thiet-ke/thu-2-5d/nam-2-5d';
import { exprFrom, liveExpr } from './cam-xuc-2-5d';
import { Tung25D, TungVatLy } from './thiet-ke/thu-2-5d/tung-2-5d';
import { NamVatLy, simulate, type Impact, type PhysParams, DEFAULT_PHYS } from './thiet-ke/thu-2-5d/vat-ly';

/**
 * LỚP "DÁNG SỐNG" cho nhân vật Hồ sơ 02 (11/11/2026).
 * Cộng chuyển động nhỏ lên tư thế đã dựng để người không đứng im như hình dán: thở, chớp mắt không đều, dịch trọng tâm,
 * đầu lắc nhẹ, tay không tuyệt đối đứng yên. Có thêm chuyển dáng có đà (chuẩn bị ngược chiều, quá đà, từng bộ phận trễ khác nhau),
 * khẩu hình tạm có nhịp và vòng lặp nhẹ cho vai phụ.
 *
 * Mọi thứ TẤT ĐỊNH theo số khung (hàm của `frame` và `seed`), nên Remotion render lại khung bất kỳ cho cùng kết quả.
 * Không đổi tạo hình đã chốt: chỉ cộng độ lệch nhỏ vào khớp rig; `amount` 0 trả lại đúng tư thế gốc.
 */

const TAU = Math.PI * 2;
/** Số giả ngẫu nhiên ổn định trong [0, 1). */
export const rnd = (n: number) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Nhịp thở −1…1, chu kỳ khoảng 3–4 s ở 30 fps; mỗi `seed` một nhịp và một pha riêng. */
export const breath = (frame: number, seed = 0) => Math.sin(TAU * (frame / (96 + 24 * rnd(seed + 1)) + rnd(seed + 2)));

/**
 * Chớp mắt không đều: chia thời gian thành các khối 84 khung, mỗi khối thường có một lần chớp (kéo dài 5 khung)
 * ở vị trí ngẫu nhiên, thỉnh thoảng chớp đôi, thỉnh thoảng bỏ qua cả khối.
 */
export const blinkAt = (frame: number, seed = 0) => {
  const k = Math.floor(frame / 84), at = k * 84 + Math.floor(rnd(k * 7 + seed) * 70), dur = 5;
  const has = rnd(k * 13 + seed * 3 + 1) > 0.2, dbl = rnd(k * 17 + seed + 5) > 0.82;
  if (!has) return false;
  const f = frame - at;
  return (f >= 0 && f < dur) || (dbl && f >= dur + 4 && f < dur * 2 + 4);
};

/** Trôi chậm −1…1 (cộng nhiều sóng không đồng pha): dùng cho đầu và trọng tâm. */
export const drift = (frame: number, seed = 0, period = 150) =>
  (Math.sin(TAU * (frame / period + rnd(seed + 3))) * 0.6 + Math.sin(TAU * (frame / (period * 0.37) + rnd(seed + 4))) * 0.4);

export type LifeOpts = {
  seed?: number;
  /** 0 = đúng tư thế gốc, 1 = mức mặc định, >1 = rõ hơn (cảnh cần nhân vật thở gấp, hồi hộp). */
  amount?: number;
  /** tắt riêng từng phần */
  breathe?: boolean;
  sway?: boolean;
};

const addLimb = (l: Limb, da: number, db: number): Limb => ({ ...l, a: l.a + da, b: Math.max(0, l.b + db) });

/**
 * Tư thế sống: cộng thở (thân gật nhẹ theo nhịp, tay phập phồng theo vai), đầu trôi, dịch trọng tâm khi đứng.
 * Dáng nằm (`support: 'bed'`) chỉ nhận thở. Dáng ngồi chỉ nhận thở và đầu.
 */
export const lifePose = (pose: JointPose, frame: number, o: LifeOpts = {}): JointPose => {
  const seed = o.seed ?? 0, amt = o.amount ?? 1;
  if (amt <= 0) return pose;
  const br = o.breathe === false ? 0 : breath(frame, seed), dr = drift(frame, seed);
  const lying = pose.support === 'bed', sitting = !lying && pose.legR.a > 60;
  const standing = !lying && !sitting;
  const sway = o.sway === false || !standing ? 0 : drift(frame, seed + 9, 210);
  const out: JointPose = { ...pose };
  out.tilt = pose.tilt + amt * (br * 0.8 + sway * 1.5);
  out.neck = pose.neck + amt * (lying ? br * 0.5 : dr * 2 - br * 0.4);
  const shoulder = br * 1.5 * amt;
  out.armR = addLimb(pose.armR, shoulder + sway * 1.3 * amt, br * 0.8 * amt);
  out.armL = addLimb(pose.armL, shoulder - sway * 1.3 * amt, br * 0.8 * amt);
  if (standing) {
    // trọng tâm dồn dần sang một chân rồi sang chân kia
    const w = sway * 2.6 * amt;
    out.legR = { ...pose.legR, a: pose.legR.a + w };
    out.legL = { ...pose.legL, a: pose.legL.a - w };
  }
  return out;
};

/** Độ lắc tóc theo nhịp thở và đầu trôi (đơn vị của `HairSway`). */
export const hairLife = (frame: number, seed = 0, amount = 1): HairSway => {
  const br = breath(frame, seed), dr = drift(frame, seed);
  return { rot: (dr * 0.9 + br * 0.3) * amount, dx: dr * 0.8 * amount, dy: br * 0.5 * amount };
};

/**
 * Khẩu hình tạm có nhịp: mỗi âm tiết khoảng 4 khung đổi độ mở và hình miệng, nghỉ ngắt giữa các cụm.
 * Chưa khớp lời (chưa có giọng đọc); chỉ để miệng không mở–đóng đều như máy.
 */
export const speak = (frame: number, from: number, to: number, seed = 0): Talk | undefined => {
  if (frame < from || frame >= to) return undefined;
  const t = frame - from, phrase = Math.floor(t / 34), inPhrase = t % 34;
  if (inPhrase > 26 && rnd(phrase + seed) > 0.35) return { shape: 'closed', open: 0.1 }; // ngắt hơi giữa cụm
  const syl = Math.floor(inPhrase / 4), r = rnd(syl * 3 + phrase * 11 + seed);
  const shapes = ['a', 'e', 'o', 'closed'] as const;
  return { shape: shapes[Math.floor(r * 4)], open: 0.25 + 0.6 * rnd(syl + phrase * 5 + seed + 1) };
};

/** Chuyển nét mặt có thời gian: trả về prop cho StudentTwinBody (`face`, `faceFrom`, `faceMix`). */
export const faceBlend = <F extends string>(frame: number, at: number, from: F, to: F, len = 7) => {
  const m = clamp((frame - at) / len);
  return m <= 0 ? { face: from } : m >= 1 ? { face: to } : { face: to, faceFrom: from, faceMix: m };
};

// --- Chuyển dáng có đà ---------------------------------------------------------------------------------------------
const outBack = (t: number, s = 1.35) => { const u = t - 1; return 1 + (s + 1) * u * u * u + s * u * u; }; // quá đà nhẹ rồi về
const smooth = (t: number) => t * t * (3 - 2 * t);

export type EaseOpts = {
  /** độ chuẩn bị ngược chiều (độ), áp lên thân trong 25% đầu */
  anticipate?: number;
  /** độ quá đà 0–1 (mặc định 0,5) */
  overshoot?: number;
};
/** Chậm bao nhiêu (tỉ lệ thời gian) so với thân: thân đi trước, đầu rồi tay trên, tay dưới, bàn tay trễ nhất. */
const LAG = { tilt: 0, neck: 0.08, arm: 0.12, fore: 0.18, hand: 0.24, leg: 0.05, foot: 0.12 };

/**
 * Chuyển từ dáng `a` sang `b` với `t` 0–1: thân đi trước, đầu trễ chút, tay trễ hơn, bàn tay trễ nhất; có chuẩn bị ngược chiều
 * và quá đà nhẹ. Các giá trị rời (kiểu bàn tay, góc nhìn, tay vẽ đè) đổi ở giữa chặng. Góc khớp được kẹp lại theo giới hạn rig khi vẽ.
 */
export const easePose = (a: JointPose, b: JointPose, t: number, o: EaseOpts = {}): JointPose => {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const ov = o.overshoot ?? 0.5, s = 1.35 * ov * 2;
  const at = (lag: number) => { const u = clamp((t - lag) / (1 - lag)); return s > 0 ? outBack(u, s) : smooth(u); };
  const num = (x: number, y: number, lag: number) => lerp(x, y, at(lag));
  const soft = (x: number, y: number, lag: number) => { const u = clamp((t - lag) / (1 - lag)), full = lerp(x, y, outBack(u, s * 0.45)); const d = Math.max(-9, Math.min(9, full - lerp(x, y, smooth(u)))); return lerp(x, y, smooth(u)) + d; };
  const limb = (x: Limb, y: Limb, lagA: number, lagB: number): Limb => {
    // khác chiều gập: duỗi thẳng rồi gập sang chiều mới, không lật cẳng tay qua bên kia ở giữa chặng
    if ((x.rot ?? 1) !== (y.rot ?? 1)) {
      const k = clamp((t - lagB) / (1 - lagB)), a = soft(x.a, y.a, lagA);
      return k < 0.5 ? { ...x, a, b: x.b * (1 - smooth(Math.min(1, k * 2))) } : { ...y, a, b: y.b * smooth((k - 0.5) * 2) };
    }
    return { ...(t < 0.5 ? x : y), a: soft(x.a, y.a, lagA), b: Math.max(0, soft(x.b, y.b, lagB)) };
  };
  const tiltAnt = o.anticipate ? -Math.sign(b.tilt - a.tilt || 1) * o.anticipate * Math.sin(Math.PI * clamp(t / 0.25)) * (t < 0.25 ? 1 : 0) : 0;
  const late = t >= 0.5 ? b : a;
  return {
    ...late,
    tilt: num(a.tilt, b.tilt, LAG.tilt) + tiltAnt,
    neck: num(a.neck, b.neck, LAG.neck),
    armR: limb(a.armR, b.armR, LAG.arm, LAG.fore), armL: limb(a.armL, b.armL, LAG.arm, LAG.fore),
    legR: limb(a.legR, b.legR, LAG.leg, LAG.leg), legL: limb(a.legL, b.legL, LAG.leg, LAG.leg),
    wristR: num(a.wristR, b.wristR, LAG.hand), wristL: num(a.wristL, b.wristL, LAG.hand),
    footR: num(a.footR, b.footR, LAG.foot), footL: num(a.footL, b.footL, LAG.foot),
    x: num(a.x, b.x, LAG.tilt), y: num(a.y, b.y, LAG.tilt),
  };
};

// --- Thành phần dùng ngay -----------------------------------------------------------------------------------------
type BodyProps = React.ComponentProps<typeof StudentTwinBody>;
/** Nam / Người Kia sống: bọc StudentTwinBody, tự thở, chớp, lắc tóc. `frame` bắt buộc; `seed` khác nhau cho từng người. */
export const LivingTwin: React.FC<BodyProps & { frame: number; seed?: number; life?: LifeOpts }> = ({ frame, seed = 0, life, pose, blink, hair, ...rest }) => (
  <StudentTwinBody {...rest} pose={lifePose(pose ?? STAND_POSE, frame, { seed, ...life })} blink={blink ?? blinkAt(frame, seed)} hair={hair ?? ((life?.amount ?? 1) > 0 ? hairLife(frame, seed, life?.amount ?? 1) : undefined)} />
);
/** Tùng sống. */
export const LivingTung: React.FC<React.ComponentProps<typeof TungSoccer> & { frame: number; seed?: number; life?: LifeOpts }> = ({ frame, seed = 11, life, pose, blink, ...rest }) => (
  <TungSoccer {...rest} pose={lifePose(pose ?? TUNG_POSE, frame, { seed, ...life })} blink={blink ?? blinkAt(frame, seed)} />
);

/**
 * Vai phụ: vòng lặp nhẹ (khoảng 20 s) trên tư thế gốc: thở, thỉnh thoảng gật hoặc nhìn quanh, giảng viên ra hiệu tay.
 * Vai phụ chỉ có góc ba phần tư phía trước nên chỉ cộng độ lệch nhỏ, không xoay.
 */
export const castIdle = (role: Role, pose: JointPose, frame: number, seed = 0): JointPose => {
  const base = lifePose(pose, frame, { seed, amount: 1 });
  const period = 600, f = frame % period;
  const bump = (at: number, len: number) => (f >= at && f < at + len ? Math.sin((Math.PI * (f - at)) / len) : 0);
  const nod = bump(90 + 40 * rnd(seed), 22) - 0.6 * bump(330 + 50 * rnd(seed + 1), 18);
  const look = bump(200 + 60 * rnd(seed + 2), 70);
  const out: JointPose = { ...base, neck: base.neck + nod * 5 + look * (rnd(seed + 3) > 0.5 ? 4 : -4) };
  if (role === 'giang-vien') out.armL = addLimb(base.armL, bump(260, 60) * 16, bump(260, 60) * 10);
  if (role === 'sinh-vien-nam' || role === 'sinh-vien-nu') out.tilt = base.tilt + bump(430 + 30 * rnd(seed + 4), 40) * 2.5; // ngả nhẹ ra sau ghế
  return out;
};
export const LivingCast: React.FC<React.ComponentProps<typeof SupportingActor> & { frame: number; seed?: number }> = ({ frame, seed = 0, role, pose, ...rest }) => (
  <SupportingActor {...rest} role={role} pose={castIdle(role, pose ?? STAND_POSE, frame, seed)} />
);

/**
 * Nam 2.5D sống: cùng lớp thở/chớp/trôi/lắc tóc của `LivingTwin` nhưng vẽ bằng `Nam25D` (kiểu sáng theo cảnh, tách lớp, bóng mềm).
 * Nhận mọi prop của `Nam25D` (`lighting`, `lightDir` từ `lightFor`, `dang`, `hemSway`…). Muốn thêm quán tính/va chạm, dùng `NamVatLy` với
 * `base={(f) => lifePose(dáng(f), f, { seed })}` thay cho dáng gốc; đã kiểm tra hai lớp chồng không NaN trong tests/ho-so-02-song-dong.cjs.
 */
export const LivingNam25D: React.FC<React.ComponentProps<typeof Nam25D> & { frame: number; seed?: number; life?: LifeOpts }> = ({ frame, seed = 0, life, pose, blink, hair, ...rest }) => {
  // mặt 2.5D sống: chớp là độ sụp mí liên tục, liếc nhỏ, mày/khoé môi nhích (cam-xuc-2-5d.tsx); mặt cũ (`matCu`) vẫn chớp bật/tắt
  const base = expr25For(rest, rest.matCu);
  const expr = base && !rest.matCu ? liveExpr(base, frame, { seed, amount: life?.amount ?? 1 }) : base;
  return <Nam25D {...rest} expr={expr} pose={lifePose(pose ?? STAND_POSE, frame, { seed, ...life })} blink={blink ?? (expr && !rest.matCu ? undefined : blinkAt(frame, seed))} hair={hair ?? ((life?.amount ?? 1) > 0 ? hairLife(frame, seed, life?.amount ?? 1) : undefined)} />;
};

/** Người Kia 2.5D: `Nam25D` với `identity="nguoi-kia"` (cùng dáng, bộ đồ và lớp sáng của Nam; khác mặt, nốt ruồi và nét mặt). */
export const NguoiKia25D: React.FC<Omit<React.ComponentProps<typeof Nam25D>, 'identity'>> = (props) => <Nam25D {...props} identity="nguoi-kia" />;
export const LivingNguoiKia25D: React.FC<Omit<React.ComponentProps<typeof LivingNam25D>, 'identity'>> = (props) => <LivingNam25D {...props} identity="nguoi-kia" />;

/** Tùng 2.5D sống: thở, chớp mắt, dịch trọng tâm trên `Tung25D`. Mặc định dáng của Tùng (`TUNG_POSE`). */
export const LivingTung25D: React.FC<React.ComponentProps<typeof Tung25D> & { frame: number; seed?: number; life?: LifeOpts }> = ({ frame, seed = 11, life, pose, blink, ...rest }) => {
  const expr = rest.matCu ? rest.expr : liveExpr(rest.expr ?? exprFrom(undefined, rest.mood ?? 'annoyed'), frame, { seed, amount: life?.amount ?? 1 });
  return <Tung25D {...rest} expr={expr} pose={lifePose(pose ?? TUNG_POSE, frame, { seed, ...life })} blink={blink ?? (rest.matCu ? blinkAt(frame, seed) : undefined)} />;
};

/**
 * Nam / Người Kia 2.5D có CẢ dáng sống LẪN vật lý thứ cấp: `lifePose` (thở, trôi, trọng tâm) đi vào dáng gốc, rồi mô phỏng quán tính,
 * nhún, tóc và vạt áo (`NamVatLy`) lên trên. `base(f)` là diễn xuất đã dựng; `impacts` là các cú va, tiếp đất, giật mình.
 * Bản mô phỏng chạy một lần từ khung 0 tới `total` (tất định) và được nhớ lại; đổi `base`/`impacts`/`seed`/`amount` thì tính lại.
 * `identity="nguoi-kia"` cho Người Kia. Chớp mắt tự thêm. `physics={false}` để so với dáng sống không vật lý.
 */
export const NamSongVatLy: React.FC<Omit<React.ComponentProps<typeof NamVatLy>, 'track' | 'base' | 'frame'> & {
  frame: number; total: number; base: (f: number) => JointPose; impacts?: Impact[]; seed?: number; life?: LifeOpts; phys?: PhysParams;
}> = ({ frame, total, base, impacts = [], seed = 0, life, phys = DEFAULT_PHYS, blink, ...rest }) => {
  const key = JSON.stringify([total, seed, life, impacts]);
  const living = React.useMemo(() => (f: number) => lifePose(base(f), f, { seed, ...life }), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const track = React.useMemo(() => simulate(living, impacts, total, phys), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const e0 = expr25For(rest, rest.matCu);
  const expr = e0 && !rest.matCu ? liveExpr(e0, frame, { seed, amount: life?.amount ?? 1 }) : e0;
  return <NamVatLy {...rest} expr={expr} blink={blink ?? (rest.matCu ? blinkAt(frame, seed) : undefined)} track={track} frame={frame} base={living} />;
};

/** Tùng 2.5D có dáng sống LẪN vật lý thứ cấp (xem `NamSongVatLy`). Dáng gốc mặc định `TUNG_POSE`. */
export const TungSongVatLy: React.FC<Omit<React.ComponentProps<typeof TungVatLy>, 'track' | 'base' | 'frame'> & {
  frame: number; total: number; base?: (f: number) => JointPose; impacts?: Impact[]; seed?: number; life?: LifeOpts; phys?: PhysParams;
}> = ({ frame, total, base, impacts = [], seed = 11, life, phys = DEFAULT_PHYS, blink, ...rest }) => {
  const key = JSON.stringify([total, seed, life, impacts]);
  const living = React.useMemo(() => (f: number) => lifePose(base ? base(f) : TUNG_POSE, f, { seed, ...life }), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const track = React.useMemo(() => simulate(living, impacts, total, phys), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const expr = rest.matCu ? rest.expr : liveExpr(rest.expr ?? exprFrom(undefined, rest.mood ?? 'annoyed'), frame, { seed, amount: life?.amount ?? 1 });
  return <TungVatLy {...rest} expr={expr} blink={blink ?? (rest.matCu ? blinkAt(frame, seed) : undefined)} track={track} frame={frame} base={living} />;
};
