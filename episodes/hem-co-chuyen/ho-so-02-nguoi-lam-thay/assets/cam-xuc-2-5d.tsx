import React from 'react';

/**
 * CẢM XÚC 2.5D — HỒ SƠ 02 (dựng mới 11/11/2026, thay bộ nét mặt cartoon-soft cũ cho nhân vật 2.5D).
 *
 * Không ghép SVG có sẵn: mặt vẽ bằng THAM SỐ (`Expr`) nên mọi cảm xúc trộn liên tục với nhau, chuyển có thời gian từng bộ phận
 * (mày đi trước, mắt, rồi miệng, sắc mặt sau cùng), chớp mắt là độ sụp mí liên tục chứ không bật/tắt, mắt liếc nhỏ, môi run.
 * Kiểu vẽ (chốt 11/11 theo góp ý chủ repo): cartoon gọn — mắt tròn có viền, con ngươi đen, mí là mảng da cắt ngang, KHÔNG mi
 * (mi làm mặt nam thành nữ tính), không nếp nhăn/bóng hốc mắt; khối 2.5D do lớp sáng `Volume25` của thân đảm nhận. Sống động nằm ở
 * chuyển động (chớp, liếc, trễ từng bộ phận), không ở độ chi tiết. Đốm sáng mắt theo hướng sáng cảnh. Lớp màu mềm gắn `data-shadow`.
 *
 * Toạ độ: hệ đầu của `StudentTwinHead`/`TungHead` (mắt gần (-11, 99), mắt xa (30, 96), miệng ≈ (13, 142)); góc chính diện
 * dịch cả nhóm −10 như mặt cũ. File này KHÔNG import `nhan-vat.tsx` (nhan-vat import ngược lại), nên màu khai báo lại ở đây.
 */

// ---------------------------------------------------------------------------
// THAM SỐ
// ---------------------------------------------------------------------------
export type Expr = {
  /** nâng/hạ cả mày, −1…1 */ brow: number;
  /** đầu mày trong: + nâng (buồn, sợ), − hạ (giận, quyết) */ browIn: number;
  /** chau mày 0…1 */ browKnit: number;
  /** nhướng một bên: + mày phía xa, − mày phía gần */ browAsym: number;
  /** độ mở mắt (1 = thường, 1,4 = trợn) */ open: number;
  /** mí trên sụp 0…1 (1 = nhắm) */ lid: number;
  /** mí dưới nâng / nheo 0…1 */ squint: number;
  /** cỡ con ngươi 0,4…1,3 */ pupil: number;
  /** hướng nhìn −1…1 (x dương = phía nhân vật đang quay mặt) */ gazeX: number; gazeY: number;
  /** khoé miệng −1 (mếu) … 1 (cười) */ smile: number;
  /** độ há 0…1 */ mouthOpen: number;
  /** bề ngang miệng 0,5…1,4 */ mouthW: number;
  /** lệch khoé: + khoé phía xa nhếch lên, − khoé phía gần */ smirk: number;
  /** mím môi 0…1 */ press: number;
  /** lộ răng 0…1 */ teeth: number;
  /** run môi 0…1 */ tremble: number;
  /** đỏ mặt, nước mắt, mồ hôi, tái mặt, u ám 0…1 */ blush: number; tear: number; sweat: number; pale: number; gloom: number;
  /** pha dao động (số khung) cho run môi, mồ hôi; do `liveExpr` đặt */ phase?: number;
};
const NUM_KEYS = ['brow', 'browIn', 'browKnit', 'browAsym', 'open', 'lid', 'squint', 'pupil', 'gazeX', 'gazeY', 'smile', 'mouthOpen', 'mouthW', 'smirk', 'press', 'teeth', 'tremble', 'blush', 'tear', 'sweat', 'pale', 'gloom'] as const;
type NumKey = (typeof NUM_KEYS)[number];

export const NEUTRAL: Expr = {
  brow: 0, browIn: 0, browKnit: 0, browAsym: 0, open: 1, lid: 0, squint: 0, pupil: 1, gazeX: 0.25, gazeY: 0,
  smile: 0.05, mouthOpen: 0, mouthW: 1, smirk: 0, press: 0, teeth: 0, tremble: 0, blush: 0, tear: 0, sweat: 0, pale: 0, gloom: 0,
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rnd = (n: number) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const smooth = (t: number) => t * t * (3 - 2 * t);
const outBack = (t: number, s = 1.2) => { const u = t - 1; return 1 + (s + 1) * u * u * u + s * u * u; };

/** Trộn tuyến tính hai nét mặt (mọi tham số). */
export const mixExpr = (a: Expr, b: Expr, t: number): Expr => {
  const o = { ...b } as Expr;
  for (const k of NUM_KEYS) o[k] = lerp(a[k], b[k], t);
  o.phase = b.phase ?? a.phase;
  return o;
};

// ---------------------------------------------------------------------------
// BỘ CẢM XÚC: 24 nhóm × 3 mức (mức 1 nhẹ, 2 rõ, 3 đỉnh). Mỗi nhóm có đỉnh; mức 1/2 trộn từ mặt thường
// về đỉnh (0,4 / 0,72) rồi cộng phần riêng của mức nếu cần (vd. nước mắt chỉ trào ở mức 3).
// ---------------------------------------------------------------------------
type Peak = Partial<Expr>;
type Family = { name: string; peak: Peak; lv?: [Peak?, Peak?, Peak?]; note: string };
export const FAMILIES = {
  'binh-than': { name: 'Bình thản', note: 'tỉnh → thư thái → lơ đãng', peak: {}, lv: [{}, { lid: 0.32, smile: 0.2 }, { lid: 0.42, gazeX: 0.6, gazeY: 0.35, mouthOpen: 0.06, smile: 0 }] },
  'buon-ngu': { name: 'Buồn ngủ', note: 'mí nặng, tới ngáp', peak: { lid: 0.86, browIn: 0.25, brow: -0.15, mouthOpen: 0.55, mouthW: 0.72, gazeY: 0.35, smile: -0.1 }, lv: [{ mouthOpen: 0 }, { mouthOpen: 0.05 }, {}] },
  vui: { name: 'Vui', note: 'mỉm → cười → cười híp mắt', peak: { smile: 1, squint: 0.95, lid: 0.35, brow: 0.3, mouthOpen: 0.6, teeth: 0.85, mouthW: 1.2, blush: 0.35 } },
  buon: { name: 'Buồn', note: 'chùng → mếu → khóc', peak: { browIn: 1, brow: 0.05, lid: 0.38, smile: -0.75, gazeY: 0.55, mouthOpen: 0.22, mouthW: 0.95, tear: 1, tremble: 0.7, blush: 0.25 }, lv: [{ tear: 0.15, mouthOpen: 0, tremble: 0 }, { tear: 0.45 }, {}] },
  'tuc-gian': { name: 'Tức giận', note: 'bực → gắt → quát nghiến răng', peak: { browIn: -1, browKnit: 1, brow: -0.35, lid: 0.18, squint: 0.4, smile: -0.45, mouthOpen: 0.5, teeth: 1, mouthW: 1.2, pupil: 0.8, blush: 0.45 }, lv: [{ mouthOpen: 0, teeth: 0, press: 0.6 }, {}, {}] },
  'so-hai': { name: 'Sợ hãi', note: 'chột dạ → sợ → hoảng', peak: { open: 1.38, brow: 0.8, browIn: 0.95, pupil: 0.55, lid: 0, smile: -0.5, mouthOpen: 0.55, mouthW: 0.9, teeth: 0.55, sweat: 1, pale: 0.85, tremble: 0.5, gazeX: 0 } },
  'bat-ngo': { name: 'Bất ngờ', note: 'ơ → ngạc nhiên → sững sờ', peak: { open: 1.42, brow: 1, pupil: 0.7, lid: 0, mouthOpen: 0.78, mouthW: 0.62, smile: 0, gazeX: 0.05 } },
  'nghi-ngo': { name: 'Nghi ngờ', note: 'liếc → nheo → soi mói', peak: { browAsym: 1, browIn: -0.35, browKnit: 0.45, squint: 0.6, lid: 0.38, gazeX: 0.75, smirk: -0.55, press: 0.45, mouthW: 0.82 } },
  'suy-luan': { name: 'Suy luận', note: 'ngẫm → tập trung → vỡ lẽ', peak: { browAsym: 0.6, browKnit: 0.55, gazeY: -0.65, gazeX: -0.1, lid: 0.18, press: 0.45, smirk: 0.3, mouthW: 0.85 }, lv: [{}, {}, { gazeY: 0, gazeX: 0.3, brow: 0.45, browKnit: 0, open: 1.15, smirk: 0.5, press: 0, smile: 0.3 }] },
  'kim-nen': { name: 'Kìm nén', note: 'nén → cắn môi → sắp vỡ', peak: { press: 1, browKnit: 0.75, browIn: -0.15, squint: 0.35, lid: 0.22, mouthW: 0.82, tremble: 0.45, tear: 0.35, blush: 0.35, smile: -0.2 } },
  'nhe-nhom': { name: 'Nhẹ nhõm', note: 'thở ra → giãn → cười mệt', peak: { brow: 0.3, browIn: 0.5, lid: 0.5, smile: 0.6, mouthOpen: 0.28, mouthW: 0.92, gazeY: -0.15, blush: 0.15 } },
  'boi-roi': { name: 'Bối rối', note: 'lúng túng → gãi đầu → rối trí', peak: { browAsym: 0.8, browIn: 0.6, smile: -0.1, smirk: 0.55, mouthOpen: 0.12, mouthW: 0.82, sweat: 0.8, gazeX: -0.45, gazeY: 0.1 } },
  'buong-xuoi': { name: 'Buông xuôi', note: 'chán → mặc kệ → trống rỗng', peak: { lid: 0.62, browIn: 0.45, brow: -0.15, smile: -0.25, gazeY: 0.55, gazeX: 0, mouthOpen: 0.08, mouthW: 0.9, pupil: 0.85, pale: 0.25 } },
  'cuoi-che-giau': { name: 'Cười che giấu', note: 'mỉm kín → nhếch → cười lạnh (Người Kia)', peak: { smirk: 1, smile: 0.4, lid: 0.36, squint: 0.3, gazeX: 0.45, brow: -0.15, browIn: -0.25, gloom: 0.45, pupil: 0.8 } },
  'ghe-so': { name: 'Ghê sợ', note: 'nhăn → rùng mình → kinh tởm', peak: { browKnit: 0.85, browIn: 0.3, squint: 0.75, lid: 0.2, smile: -0.6, smirk: -0.55, mouthOpen: 0.28, teeth: 0.7, mouthW: 0.95, pale: 0.5, gloom: 0.3, gazeX: -0.2 } },
  'khinh-thuong': { name: 'Khinh thường', note: 'hờ hững → nhếch mép → nhìn xuống', peak: { lid: 0.55, smirk: 0.9, smile: 0.08, brow: 0.25, browAsym: 0.65, gazeX: 0.7, gazeY: 0.3, press: 0.3, mouthW: 0.95 } },
  'kiet-suc': { name: 'Kiệt sức', note: 'mỏi → rã rời → lả đi', peak: { lid: 0.72, browIn: 0.5, brow: -0.2, mouthOpen: 0.35, mouthW: 0.85, sweat: 0.75, pale: 0.4, gazeY: 0.4, pupil: 0.9, smile: -0.15 } },
  'lo-lang': { name: 'Lo lắng', note: 'bồn chồn → cắn môi → hoảng hốt', peak: { browIn: 0.9, brow: 0.3, browKnit: 0.4, press: 0.6, smile: -0.3, mouthW: 0.8, gazeX: -0.5, sweat: 0.6, open: 1.12, tremble: 0.35, lid: 0.05 } },
  'ngai-ngu': { name: 'Ngại ngùng', note: 'e dè → đỏ mặt → lảng mắt', peak: { blush: 1, smile: 0.35, gazeX: -0.6, gazeY: 0.5, lid: 0.32, browIn: 0.4, press: 0.3, mouthW: 0.8 } },
  'quyet-tam': { name: 'Quyết tâm', note: 'chắc → siết → bùng lên', peak: { browIn: -0.6, browKnit: 0.5, brow: -0.2, squint: 0.35, lid: 0.08, press: 0.7, mouthW: 1.05, pupil: 1.1, smile: -0.1, gazeX: 0.35 }, lv: [{}, {}, { press: 0.2, teeth: 0.75, mouthOpen: 0.2 }] },
  'toi-loi': { name: 'Tội lỗi', note: 'chột → cúi mặt → day dứt', peak: { browIn: 0.8, lid: 0.5, gazeY: 0.7, gazeX: -0.5, press: 0.5, smile: -0.35, mouthW: 0.8, blush: 0.3, tear: 0.25 } },
  'tu-man': { name: 'Tự mãn', note: 'hài lòng → vênh → đắc ý', peak: { smirk: 0.8, smile: 0.55, lid: 0.45, brow: 0.3, browAsym: 0.4, gazeX: 0.35, mouthW: 1.05 } },
  'tui-than': { name: 'Tủi thân', note: 'hờn → rưng rưng → oà', peak: { browIn: 1, lid: 0.4, tremble: 1, smile: -0.85, press: 0.3, tear: 1, gazeY: 0.5, blush: 0.35, mouthW: 0.8, mouthOpen: 0.12 }, lv: [{ tear: 0.3, tremble: 0.2 }, { tear: 0.55 }, {}] },
  'ma-quai': { name: 'Trừng cười', note: 'bản sao ở cảnh hù: nhìn trân → nhe răng → trừng', peak: { open: 1.3, pupil: 0.42, smile: 1, mouthOpen: 0.38, teeth: 1, mouthW: 1.38, brow: -0.1, browIn: -0.25, gloom: 1, lid: 0, squint: 0, gazeX: 0.1 } },
} satisfies Record<string, Family>;
export type ExprFamily = keyof typeof FAMILIES;
export const FAMILY_IDS = Object.keys(FAMILIES) as ExprFamily[];
const LEVEL_T = [0.4, 0.72, 1];

/** Nét mặt của nhóm ở mức 1–3 (hoặc độ mạnh liên tục 0–1 nếu `level` là số thực ≤ 1 qua `exprAmount`). */
export const exprOf = (family: ExprFamily, level: 1 | 2 | 3): Expr => {
  const f: Family = FAMILIES[family];
  const base = mixExpr(NEUTRAL, { ...NEUTRAL, ...f.peak }, LEVEL_T[level - 1]);
  return { ...base, ...(f.lv?.[level - 1] ?? {}) };
};
/** Độ mạnh liên tục 0–1 (0 = mặt thường, 1 = mức 3): trộn qua các mức đã chốt. */
export const exprAmount = (family: ExprFamily, k: number): Expr => {
  const u = clamp(k);
  if (u <= LEVEL_T[0]) return mixExpr(NEUTRAL, exprOf(family, 1), u / LEVEL_T[0]);
  if (u <= LEVEL_T[1]) return mixExpr(exprOf(family, 1), exprOf(family, 2), (u - LEVEL_T[0]) / (LEVEL_T[1] - LEVEL_T[0]));
  return mixExpr(exprOf(family, 2), exprOf(family, 3), (u - LEVEL_T[1]) / (1 - LEVEL_T[1]));
};

/** Khoá cũ của nhân vật (mood) → nét mặt mới, để cảnh cũ gọi `mood` vẫn ra mặt 2.5D tương ứng. */
export const MOOD_EXPR: Record<string, [ExprFamily, 1 | 2 | 3]> = {
  sleepy: ['buon-ngu', 1], annoyed: ['tuc-gian', 1], hesitant: ['lo-lang', 1], scared: ['so-hai', 2], agitated: ['tuc-gian', 3],
  shocked: ['bat-ngo', 3], suspicious: ['nghi-ngo', 2], calm: ['binh-than', 1], neutral_smile: ['vui', 1], eerie_smirk: ['cuoi-che-giau', 2],
  stare_grin: ['ma-quai', 3], focused: ['quyet-tam', 1], normal: ['binh-than', 1],
};
/**
 * Nhận khoá dạng 'vui-02', 'binh-than-00', 'so-hai-3', tên nhóm ('vui' = mức 2) hoặc mood cũ ('scared').
 * Khoá cũ của thư viện cartoon-soft cùng tên nhóm nên cảnh đang gọi `face="so-hai-03"` tự sang mặt mới.
 */
export const exprFrom = (key?: string, fallbackMood?: string): Expr => {
  if (key) {
    const m = /^(.*?)-?0?([0-3])$/.exec(key);
    if (m && m[1] in FAMILIES) { const lv = Number(m[2]); return lv === 0 ? { ...NEUTRAL } : exprOf(m[1] as ExprFamily, lv as 1 | 2 | 3); }
    if (key in FAMILIES) return exprOf(key as ExprFamily, 2);
    if (key in MOOD_EXPR) return exprOf(...MOOD_EXPR[key]);
  }
  if (fallbackMood && fallbackMood in MOOD_EXPR) return exprOf(...MOOD_EXPR[fallbackMood]);
  return { ...NEUTRAL };
};
/** Mood gần nhất cho góc nghiêng (mặt nghiêng vẫn dùng bản vẽ tay cũ). */
export const moodOfExpr = (e: Expr): string =>
  e.gloom > 0.6 && e.smile > 0.5 ? 'stare_grin' : e.open > 1.25 && e.mouthOpen > 0.5 ? 'shocked' : e.open > 1.15 || e.pale > 0.4 ? 'scared'
    : e.browIn < -0.5 && e.mouthOpen > 0.3 ? 'agitated' : e.browIn < -0.3 ? 'annoyed' : Math.abs(e.smirk) > 0.6 && e.gloom > 0.2 ? 'eerie_smirk'
      : Math.abs(e.smirk) > 0.4 || e.squint > 0.5 ? 'suspicious' : e.lid > 0.6 ? 'sleepy' : e.browIn > 0.4 ? 'hesitant' : e.smile > 0.3 ? 'neutral_smile' : 'calm';

// ---------------------------------------------------------------------------
// SỐNG ĐỘNG: chớp liên tục, liếc nhỏ, vi động, chuyển cảm xúc từng bộ phận
// ---------------------------------------------------------------------------
const BLINK = [0.4, 0.85, 1, 1, 0.72, 0.38, 0.12]; // nhắm nhanh, mở chậm hơn
/** Độ nhắm do chớp 0…1 tại khung `frame` (khối 84 khung, đôi khi chớp đôi, thỉnh thoảng bỏ). */
export const blinkAmount = (frame: number, seed = 0) => {
  const k = Math.floor(frame / 84), at = k * 84 + Math.floor(rnd(k * 7 + seed) * 70);
  if (rnd(k * 13 + seed * 3 + 1) <= 0.18) return 0;
  const dbl = rnd(k * 17 + seed + 5) > 0.8, f = frame - at;
  const v = (g: number) => (g >= 0 && g < BLINK.length ? BLINK[g] : 0);
  return Math.max(v(f), dbl ? v(f - BLINK.length - 3) : 0);
};
/** Ánh mắt liếc: giữ một điểm 0,9–2,3 s rồi giật nhanh (2 khung) sang điểm mới gần đó. */
export const saccade = (frame: number, seed = 0, amount = 1): [number, number] => {
  let t = 0, i = 0;
  const dur = (j: number) => 28 + Math.floor(rnd(j * 3.1 + seed * 7) * 42);
  while (t + dur(i) <= frame && i < 10000) { t += dur(i); i++; }
  const pt = (j: number): [number, number] => (j < 0 ? [0, 0] : [(rnd(j * 5.7 + seed) - 0.5) * 0.36 * amount, (rnd(j * 9.3 + seed + 2) - 0.5) * 0.2 * amount]);
  const u = clamp((frame - t) / 2), a = pt(i - 1), b = pt(i);
  return [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
};
const wave = (frame: number, seed: number, p: number) => Math.sin(Math.PI * 2 * (frame / p + rnd(seed)));

export type LiveOpts = { seed?: number; amount?: number; blink?: boolean };
/**
 * Mặt sống: cộng chớp (độ sụp mí liên tục), liếc nhỏ, mày và khoé môi nhích theo nhịp chậm, mí hơi nặng dần theo nhịp thở.
 * Tất định theo `frame`; `amount` 0 trả lại đúng nét mặt gốc.
 */
export const liveExpr = (e: Expr, frame: number, o: LiveOpts = {}): Expr => {
  const seed = o.seed ?? 0, a = o.amount ?? 1;
  if (a <= 0) return e;
  const [gx, gy] = saccade(frame, seed, a);
  const bl = o.blink === false ? 0 : blinkAmount(frame, seed);
  const lidNow = e.lid + 0.03 * a * wave(frame, seed + 1, 101);
  return {
    ...e,
    gazeX: e.gazeX + gx, gazeY: e.gazeY + gy,
    lid: lerp(clamp(lidNow), 1, bl),
    brow: e.brow + 0.05 * a * wave(frame, seed + 2, 173),
    browIn: e.browIn + 0.04 * a * wave(frame, seed + 3, 131),
    smile: e.smile + 0.035 * a * wave(frame, seed + 4, 149),
    phase: frame,
  };
};

/** Trễ theo bộ phận khi đổi cảm xúc: mày đi trước, mắt, miệng, sắc mặt (đỏ, tái, nước mắt) chậm nhất. */
const PART_LAG: Record<NumKey, number> = {
  brow: 0, browIn: 0, browKnit: 0, browAsym: 0, open: 0.08, lid: 0.1, squint: 0.14, pupil: 0.2, gazeX: 0.04, gazeY: 0.04,
  smile: 0.2, mouthOpen: 0.18, mouthW: 0.2, smirk: 0.24, press: 0.2, teeth: 0.22, tremble: 0.3, blush: 0.38, tear: 0.42, sweat: 0.45, pale: 0.35, gloom: 0.3,
};
const OVERSHOOT = new Set<NumKey>(['brow', 'browIn', 'open', 'smile', 'mouthOpen']);
/**
 * Chuyển nét mặt `a` → `b` theo `t` 0–1: từng bộ phận trễ khác nhau, mày/mắt/khoé môi quá đà nhẹ rồi về;
 * đổi cảm xúc lớn thì chớp một cái ở đầu chặng (người thật hay chớp khi đổi trạng thái).
 */
export const shiftExpr = (a: Expr, b: Expr, t: number): Expr => {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const o = { ...b } as Expr;
  for (const k of NUM_KEYS) {
    const lag = PART_LAG[k], u = clamp((t - lag) / (1 - lag));
    o[k] = lerp(a[k], b[k], OVERSHOOT.has(k) ? outBack(u) : smooth(u));
  }
  const dist = NUM_KEYS.reduce((s, k) => s + Math.abs(a[k] - b[k]), 0);
  if (dist > 1.6) o.lid = lerp(o.lid, 1, 0.85 * Math.sin(Math.PI * clamp((t - 0.04) / 0.2)) * (t < 0.24 ? 1 : 0));
  o.phase = b.phase ?? a.phase;
  return o;
};

export type ExprCue = [frame: number, face: string | Expr];
/** Dòng diễn nét mặt theo mốc khung: `[[0, 'binh-than-1'], [40, 'so-hai-2'], [70, 'so-hai-3']]`, mỗi lần đổi mất `len` khung. */
export const exprTrack = (frame: number, cues: ExprCue[], len = 12): Expr => {
  const get = (c: ExprCue) => (typeof c[1] === 'string' ? exprFrom(c[1]) : c[1]);
  if (!cues.length) return { ...NEUTRAL };
  let i = 0; while (i < cues.length - 1 && frame >= cues[i + 1][0]) i++;
  if (i === 0 || frame >= cues[i][0] + len) return get(cues[i]);
  return shiftExpr(get(cues[i - 1]), get(cues[i]), (frame - cues[i][0]) / len);
};

/** Khẩu hình khi nói chồng lên nét mặt (giữ khoé môi của cảm xúc, chỉ đổi độ há/bề ngang/răng). */
export type TalkShape = 'closed' | 'a' | 'e' | 'o' | 'u' | 'fv' | 'pressed' | 'smile';
export const talkExpr = (e: Expr, talk?: { shape: TalkShape; open?: number }): Expr => {
  if (!talk) return e;
  const k = clamp(talk.open ?? 0.5);
  const S: Record<TalkShape, Partial<Expr>> = {
    closed: { mouthOpen: 0, press: Math.max(e.press, 0.2) }, pressed: { mouthOpen: 0, press: 0.85 },
    a: { mouthOpen: 0.3 + 0.55 * k, mouthW: e.mouthW * 0.98, teeth: Math.max(e.teeth, 0.35) }, e: { mouthOpen: 0.18 + 0.3 * k, mouthW: e.mouthW * 1.12, teeth: Math.max(e.teeth, 0.7) },
    o: { mouthOpen: 0.3 + 0.4 * k, mouthW: 0.62 }, u: { mouthOpen: 0.15 + 0.2 * k, mouthW: 0.52 }, fv: { mouthOpen: 0.12, teeth: 1, mouthW: e.mouthW * 0.95 },
    smile: { mouthOpen: 0.15 + 0.25 * k, smile: Math.max(e.smile, 0.6), teeth: 0.8 },
  };
  return { ...e, press: 0, ...S[talk.shape] };
};

// ---------------------------------------------------------------------------
// VẼ — kiểu cartoon gọn: mắt tròn có viền, con ngươi đen, mí là mảng da cắt ngang (không mi, không nếp mí),
// mày là một nét tròn đầu, miệng một nét hoặc một mảng tối. Không nếp nhăn, không bóng hốc mắt: khối 2.5D đã có
// lớp sáng `Volume25` lo; mặt chỉ giữ thứ đọc được cảm xúc. Tham số nào cũng chỉnh được bằng tay.
// ---------------------------------------------------------------------------
const C = {
  ink: '#282b2b', skin: '#dbad82', eyeWhite: '#f8f3e7', pupil: '#1d1b1a',
  mouth: '#513331', teeth: '#faf3e5', tongue: '#bf7b73',
  blush: '#e2735f', tear: '#bfe6f7', tearEdge: '#6aaecb', pale: '#8ea6cc', gloom: '#2e2a45', sweat: '#d6eef8',
};
const lwv = (n: number) => `calc(${n.toFixed(2)}px * var(--lw, 1))`;
type Pt = [number, number];
const f1 = (n: number) => +n.toFixed(2);
const P = (p: Pt) => `${f1(p[0])} ${f1(p[1])}`;
const SH = { 'data-shadow': '1' } as Record<string, string>; // lớp màu mềm: Volume25 bỏ qua khi dựng mask

type EyeSpec = { c: Pt; rx: number; ry: number; inner: 1 | -1; far: boolean };
type BrowSpec = { i: Pt; o: Pt; far: boolean };
type Layout = { eyes: [EyeSpec, EyeSpec]; brows: [BrowSpec, BrowSpec]; mouth: Pt; mouthHalf: [number, number]; cheeks: [Pt, Pt]; cheekR: [Pt, Pt]; temple: Pt };
/** Bố cục theo góc, cùng vị trí mắt/mày/miệng với mặt Style B đã chốt (3/4: mắt xa nhỏ và cao hơn chút). */
const LAYOUT: Record<'three' | 'front', Layout> = {
  three: {
    eyes: [{ c: [-11, 99], rx: 17, ry: 15, inner: 1, far: false }, { c: [30, 96], rx: 15, ry: 14, inner: -1, far: true }],
    brows: [{ i: [2, 76], o: [-28, 78], far: false }, { i: [19, 74], o: [44, 71], far: true }],
    mouth: [13, 142], mouthHalf: [15, 13], cheeks: [[-25, 124], [45, 120]], cheekR: [[11, 6], [7, 5.5]], temple: [55, 74],
  },
  front: {
    eyes: [{ c: [-11, 99], rx: 15, ry: 15, inner: 1, far: false }, { c: [30, 99], rx: 15, ry: 15, inner: -1, far: false }],
    brows: [{ i: [2, 77], o: [-28, 78], far: false }, { i: [17, 77], o: [47, 78], far: false }],
    mouth: [9.5, 142], mouthHalf: [14, 14], cheeks: [[-28, 124], [47, 124]], cheekR: [[10, 6], [10, 6]], temple: [60, 80],
  },
};

const Eye: React.FC<{ s: EyeSpec; e: Expr; uid: string; light: Pt; n: number }> = ({ s, e, uid, light, n }) => {
  const [cx, cy] = s.c;
  const ry = s.ry * clamp(e.open, 0.6, 1.5), rx = s.rx * (1 + Math.max(0, e.open - 1) * 0.12);
  const ox = cx - s.inner * (rx + 2), ix = cx + s.inner * (rx + 2);
  const close = clamp(e.lid);
  // mí trên: đường cắt ngang hạ dần theo `lid`; buồn = đuôi mắt sụp, giận = đầu mắt hạ
  const lidY = cy - ry + 2 * ry * close;
  const yo = lidY + Math.max(0, e.browIn) * ry * 0.5 * (1 - close);
  const yi = lidY + (Math.max(0, -e.browIn) * ry * 0.55 + e.browKnit * ry * 0.15) * (1 - close);
  // mí dưới: nheo/cười đẩy lên thành cung
  const lowY = cy + ry - 2 * ry * clamp(e.squint) * 0.55;
  const opening = Math.min(lowY - yo, lowY - yi);
  const happy = e.smile > 0.45 && e.squint > 0.6;
  if (close > 0.9 || opening < 3) {
    const y = clamp(lowY, cy - 4, cy + ry) - 1;
    const d = happy ? `M ${P([cx - rx * 0.9, y + 4])} Q ${P([cx, y - 9])} ${P([cx + rx * 0.9, y + 4])}` : `M ${P([cx - rx * 0.95, y - 1])} Q ${P([cx, y + 7])} ${P([cx + rx * 0.95, y - 1])}`;
    return <path d={d} fill="none" stroke={C.ink} style={{ strokeWidth: lwv(3) }} />;
  }
  const id = `${uid}-e${n}`;
  const sq = s.far ? 0.86 : 1;
  const gx = clamp(e.gazeX, -1, 1), gy = clamp(e.gazeY, -1, 1);
  const pcx = cx + gx * rx * 0.45 * sq, pcy = cy + 2 + gy * ry * 0.38;
  const prx = 4.8 * e.pupil * sq * (e.open > 1.15 ? 0.85 : 1), pry = 6.2 * e.pupil * (e.open > 1.15 ? 0.88 : 1);
  const [lx, ly] = light, ln = Math.hypot(lx, ly) || 1;
  const wet = clamp(e.tear * 1.6);
  // phần lộ của mắt: giữa mí trên và mí dưới; viền mắt chỉ vẽ ở phần lộ để mắt khép hờ không thành vòng tròn (kiểu kính)
  const loY = e.squint > 0.08 ? lowY - ry * 0.4 : cy + ry + 8;
  const lidEdge = `M ${P([ox, yo])} Q ${P([cx, (yo + yi) / 2 - 4])} ${P([ix, yi])}`;
  const lowEdge = `M ${P([ox, cy + ry * 0.85])} Q ${P([cx, loY])} ${P([ix, cy + ry * 0.85])}`;
  const open2 = `${lidEdge} L ${P([ix, cy + ry + 8])} L ${P([ox, cy + ry + 8])} Z`;
  const showLid = close > 0.04 || Math.abs(yo - yi) > 0.5;
  return (
    <g>
      <defs>
        <clipPath id={id}><ellipse cx={f1(cx)} cy={f1(cy)} rx={f1(rx)} ry={f1(ry)} /></clipPath>
        <clipPath id={`${id}-v`}><path d={showLid ? open2 : `M ${P([cx - rx - 6, cy - ry - 8])} H ${f1(cx + rx + 6)} V ${f1(cy + ry + 8)} H ${f1(cx - rx - 6)} Z`} /></clipPath>
        {e.squint > 0.08 && <clipPath id={`${id}-l`}><path d={`${lowEdge} L ${P([ix, cy - ry - 8])} L ${P([ox, cy - ry - 8])} Z`} /></clipPath>}
      </defs>
      <g clipPath={`url(#${id}-v)`}><g clipPath={e.squint > 0.08 ? `url(#${id}-l)` : undefined}>
        <ellipse cx={f1(cx)} cy={f1(cy)} rx={f1(rx)} ry={f1(ry)} fill={C.eyeWhite} stroke="none" />
        <g clipPath={`url(#${id})`}>
          <ellipse cx={f1(pcx)} cy={f1(pcy)} rx={f1(prx)} ry={f1(pry)} fill={C.pupil} stroke="none" />
          <circle cx={f1(pcx + (lx / ln) * prx * 0.45)} cy={f1(pcy + (ly / ln) * pry * 0.4)} r={f1(1.5 + wet * 0.9)} fill="#ffffff" stroke="none" />
          {wet > 0.2 && <circle cx={f1(pcx - (lx / ln) * prx * 0.5)} cy={f1(pcy - (ly / ln) * pry * 0.35)} r={0.9} fill="#ffffff" stroke="none" />}
          {wet > 0.05 && <path {...SH} d={`M ${P([cx - rx, lowY - 1])} Q ${P([cx, lowY - 5 * wet])} ${P([cx + rx, lowY - 1])} L ${P([cx + rx, lowY + 6])} L ${P([cx - rx, lowY + 6])} Z`} fill={C.tear} opacity={0.8 * wet} stroke="none" />}
        </g>
        <ellipse cx={f1(cx)} cy={f1(cy)} rx={f1(rx)} ry={f1(ry)} fill="none" stroke={C.ink} style={{ strokeWidth: lwv(2.5) }} />
      </g></g>
      {/* đường mí trên / mí dưới, cắt theo lòng mắt */}
      <g clipPath={`url(#${id})`}>
        {showLid && <path d={lidEdge} fill="none" stroke={C.ink} style={{ strokeWidth: lwv(2.8) }} />}
        {e.squint > 0.08 && <path d={lowEdge} fill="none" stroke={C.ink} style={{ strokeWidth: lwv(2.4) }} />}
      </g>
    </g>
  );
};

/** Mày: một nét đậm tròn đầu như mặt đã chốt (5,5), cong theo cảm xúc. */
const Brow: React.FC<{ s: BrowSpec; e: Expr }> = ({ s, e }) => {
  const asym = s.far ? e.browAsym : -e.browAsym * 0.5;
  const lift = e.brow * 8 + Math.max(0, e.open - 1) * 16 + asym * 6;
  const knitX = (s.far ? -1 : 1) * e.browKnit * 3;
  const I: Pt = [s.i[0] + knitX, s.i[1] - lift - e.browIn * 9 + e.browKnit * 2.5];
  const O: Pt = [s.o[0], s.o[1] - lift + e.browIn * 2 - Math.max(0, -e.browIn) * 2.5];
  const M: Pt = [(I[0] + O[0]) / 2, (I[1] + O[1]) / 2 - 3 - Math.max(0, asym) * 2 + Math.max(0, e.browIn) * 2];
  return <path d={`M ${P(I)} Q ${P(M)} ${P(O)}`} fill="none" stroke={C.ink} strokeLinecap="round" style={{ strokeWidth: lwv(5.5) }} />;
};

/** Miệng: khép = một nét; há = mảng tối có viền, răng trên, lưỡi. Khoé lên/xuống theo `smile`, lệch theo `smirk`. */
const Mouth: React.FC<{ L: Layout; e: Expr; uid: string }> = ({ L, e, uid }) => {
  const [mx, my] = L.mouth;
  const sm = clamp(e.smile, -1, 1);
  const w = clamp(e.mouthW, 0.4, 1.5) * (1 + 0.15 * Math.max(0, sm)) * (1 - 0.12 * e.press);
  const A: Pt = [mx - L.mouthHalf[0] * w, my - sm * 6 + e.smirk * 2], B: Pt = [mx + L.mouthHalf[1] * w, my - sm * 6 - e.smirk * 7];
  const cxm = (A[0] + B[0]) / 2;
  const gap = clamp(e.mouthOpen) * 22;
  const midTop = my + Math.max(0, sm) * 2 - Math.max(0, -sm) * 3;
  const upC: Pt = [cxm, 2 * midTop - (A[1] + B[1]) / 2];
  const botMid = midTop + gap * (1 + Math.max(0, sm) * 0.35);
  const trem = e.tremble * 1.2, ph = e.phase ?? 0;
  const lower = () => {
    const c: Pt = [cxm, 2 * botMid - (A[1] + B[1]) / 2];
    if (trem < 0.05) return `Q ${P(c)} ${P(A)}`;
    const pts: string[] = [];
    for (let k = 1; k <= 8; k++) {
      const t = k / 8, u = 1 - t;
      pts.push(`L ${P([u * u * B[0] + 2 * u * t * c[0] + t * t * A[0], u * u * B[1] + 2 * u * t * c[1] + t * t * A[1] + (k < 8 ? Math.sin(k * 2.3 + ph * 1.7) * trem : 0)])}`);
    }
    return pts.join(' ');
  };
  if (gap < 1.4) {
    const d = trem < 0.05 ? `M ${P(A)} Q ${P(upC)} ${P(B)}` : `M ${P(B)} ${lower()}`;
    return <path d={d} fill="none" stroke={C.ink} strokeLinecap="round" style={{ strokeWidth: lwv(2.8 + e.press * 0.8) }} />;
  }
  const shape = `M ${P(A)} Q ${P(upC)} ${P(B)} ${lower()} Z`;
  const id = `${uid}-m`;
  const th = Math.min(gap * (0.4 + 0.4 * Math.max(0, sm) * e.teeth), 2 + 6 * e.teeth);
  return (
    <g>
      <defs><clipPath id={id}><path d={shape} /></clipPath></defs>
      <path d={shape} fill={C.mouth} stroke="none" />
      <g clipPath={`url(#${id})`}>
        {e.teeth > 0.05 && <path d={`M ${P([A[0], A[1] - 4])} L ${P([B[0], B[1] - 4])} L ${P([B[0], B[1] + th])} Q ${P([cxm, (upC[1] + midTop) / 2 + th * 1.3])} ${P([A[0], A[1] + th])} Z`} fill={C.teeth} stroke="none" />}
        {gap > 7 && <ellipse cx={f1(cxm + 1)} cy={f1(botMid + 3)} rx={f1((B[0] - A[0]) * 0.32)} ry={f1(4 + gap * 0.18)} fill={C.tongue} stroke="none" />}
      </g>
      <path d={shape} fill="none" stroke={C.ink} style={{ strokeWidth: lwv(2.5) }} />
    </g>
  );
};

export type Face25DProps = {
  e: Expr;
  view: 'three' | 'front';
  /** hướng TỚI nguồn sáng trên màn hình (cùng quy ước `Volume25`): đặt đốm sáng mắt */
  light?: Pt;
  /** đường bao sọ (tô tái mặt / u ám chỉ trong mặt) */
  skull: string;
  /** nét mũi của nhân vật (giữ nhận diện) */
  nose: string;
  /** nốt ruồi nhận diện */
  mark?: Pt;
  uid: string;
};

/** Mặt cartoon tham số. Đặt TRONG nhóm đầu, sau tóc; tự dịch −10 ở chính diện như mặt cũ. */
export const Face25D: React.FC<Face25DProps> = ({ e, view, light = [-0.55, -0.83], skull, nose, mark, uid }) => {
  const L = LAYOUT[view];
  const front = view === 'front';
  return (
    <g data-face25d={view} stroke="none" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <clipPath id={`${uid}-skull`}><path d={skull} transform={front ? 'translate(10 0)' : undefined} /></clipPath>
        <linearGradient id={`${uid}-pale`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.pale} stopOpacity={0} /><stop offset="0.25" stopColor={C.pale} stopOpacity={0.85} /><stop offset="1" stopColor={C.pale} stopOpacity={0} /></linearGradient>
        <linearGradient id={`${uid}-gloom`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.gloom} stopOpacity={0} /><stop offset="0.2" stopColor={C.gloom} stopOpacity={0.95} /><stop offset="1" stopColor={C.gloom} stopOpacity={0} /></linearGradient>
      </defs>
      <g transform={front ? 'translate(-10 0)' : undefined}>
        {e.blush > 0.03 && L.cheeks.map((p, i) => (
          <g key={i} {...SH}>
            <ellipse cx={p[0]} cy={p[1]} rx={L.cheekR[i][0]} ry={L.cheekR[i][1]} fill={C.blush} opacity={clamp(e.blush) * 0.5} />
            {e.blush > 0.6 && [-1, 0, 1].map((k) => <path key={k} d={`M ${f1(p[0] + k * 4.5 - 2)} ${f1(p[1] + 2)} L ${f1(p[0] + k * 4.5 + 1.5)} ${f1(p[1] - 3)}`} fill="none" stroke={C.blush} strokeOpacity={(e.blush - 0.6) * 2} style={{ strokeWidth: lwv(1.6) }} />)}
          </g>
        ))}
        {L.eyes.map((s, i) => <Eye key={i} n={i} s={s} e={e} uid={uid} light={light} />)}
        {e.tear > 0.5 && L.eyes.map((s, i) => {
          // giọt nước mắt chảy từ dưới mắt xuống má
          const k = clamp((e.tear - 0.5) * 2), x0 = s.c[0] - s.inner * s.rx * 0.45, y0 = s.c[1] + s.ry * (1 - e.squint * 0.5);
          const len = 8 + 24 * k, wob = Math.sin((e.phase ?? 0) / 9) * 0.8;
          return <path {...SH} key={i} d={`M ${f1(x0 - 2.2)} ${f1(y0)} Q ${f1(x0 - 3.5 + wob)} ${f1(y0 + len * 0.6)} ${f1(x0 - 3 + wob)} ${f1(y0 + len)} Q ${f1(x0 + wob)} ${f1(y0 + len + 5)} ${f1(x0 + 3 + wob)} ${f1(y0 + len)} Q ${f1(x0 + 3.5 + wob)} ${f1(y0 + len * 0.6)} ${f1(x0 + 2.2)} ${f1(y0)} Z`} fill={C.tear} stroke={C.tearEdge} style={{ strokeWidth: lwv(1.1) }} />;
        })}
        {L.brows.map((s, i) => <Brow key={i} s={s} e={e} />)}
        {mark && <circle cx={mark[0]} cy={mark[1] - Math.max(0, e.open - 1) * 8} r={2.2} fill={C.ink} stroke="none" data-identity-mark="1" />}
        <path d={nose} fill="none" stroke={C.ink} style={{ strokeWidth: lwv(2.5) }} />
        <Mouth L={L} e={e} uid={uid} />
        {e.sweat > 0.05 && (() => {
          const [tx, ty] = L.temple, k = 0.6 + 0.6 * clamp(e.sweat), drip = (((e.phase ?? 0) % 90) / 90) * 6 * e.sweat;
          return (
            <g {...SH} transform={`translate(${f1(tx)} ${f1(ty + drip)}) scale(${f1(k)})`}>
              <path d="M 0 -9 Q 6 0 5 4 Q 4 9 0 9 Q -4 9 -5 4 Q -6 0 0 -9 Z" fill={C.sweat} stroke={C.tearEdge} style={{ strokeWidth: lwv(1.3) }} />
            </g>
          );
        })()}
      </g>
      {/* sắc mặt: tái (xanh), u ám (tối từ trán) — chỉ trong mặt */}
      {(e.pale > 0.03 || e.gloom > 0.03) && (
        <g {...SH} clipPath={`url(#${uid}-skull)`} transform={front ? 'translate(-10 0)' : undefined} style={{ mixBlendMode: 'multiply' }}>
          {e.pale > 0.03 && <rect x={-90} y={40} width={200} height={110} fill={`url(#${uid}-pale)`} opacity={clamp(e.pale * 0.7)} />}
          {e.gloom > 0.03 && <rect x={-90} y={30} width={200} height={100} fill={`url(#${uid}-gloom)`} opacity={clamp(e.gloom * 0.75)} />}
        </g>
      )}
    </g>
  );
};
