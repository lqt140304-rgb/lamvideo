import React from 'react';
import { JointPose, STAND_POSE, StudentTwinBody, TWIN_POSES, turnAt } from './nhan-vat';
import { armTo, EXTRA_POSES } from './bo-sung-15p/nhan-vat-va-tu-the';
import { Sheet, Label } from './bo-sung-15p/common';
import { easePose } from './song-dong';
import type { StoryFaceKey } from '../../../../what-if-studio/library/expressions/cartoon-soft/bo-sung-cot-truyen/net-mat';

/**
 * CỬ CHỈ ĐI KÈM CẢM XÚC VÀ DÁNG CHUYỂN TRẠNG THÁI (11/11/2026).
 * - `GESTURES`: với mỗi nhóm cảm xúc mới (lo lắng, bối rối, ghê sợ, quyết tâm, tủi thân, khinh thường), ba tư thế ứng với ba mức nét mặt.
 *   Dùng cùng key nét mặt: `face="lo-lang-02"` đi với `GESTURES['lo-lang'][1]`.
 * - `TRANSITIONS`: các chuỗi dáng chuyển trạng thái (đứng → ngồi, giật lùi, quay lưng, gục xuống…), lấy dáng ở thời điểm t (0–1) bằng
 *   `transitionPose(id, t)`; giữa các khoá dùng `easePose` (thân đi trước, tay trễ, quá đà nhẹ).
 * Tư thế dựng trên rig gốc (`nhan-vat.tsx`), dùng được cho bản 2D và 2.5D (`Nam25D`, `LivingNam25D`, `NamSongVatLy`).
 */
const B: JointPose = { ...STAND_POSE, view: 'three', facing: 1, frontR: true, frontL: true };
const both = (p: JointPose, r: [number, number], l: [number, number]) => armTo(armTo(p, 'R', r), 'L', l);

export type GestureGroup = 'lo-lang' | 'boi-roi' | 'ghe-so' | 'quyet-tam' | 'tui-than' | 'khinh-thuong';
export const GESTURES: Record<GestureGroup, [JointPose, JointPose, JointPose]> = {
  // bồn chồn xoắn tay → cắn móng tay → ôm đầu
  'lo-lang': [
    both({ ...B, tilt: 2, neck: 3, handR: 'hold', handL: 'hold' }, [20, 300], [44, 304]),
    armTo({ ...B, tilt: 4, neck: 4, handR: 'fist', handL: 'rest', frontL: false }, 'R', [44, 150]),
    both({ ...B, tilt: -3, neck: 6, handR: 'open', handL: 'open' }, [-16, 112], [48, 126]),
  ],
  // nghiêng đầu → gãi đầu → nhún vai, ngửa hai bàn tay
  'boi-roi': [
    { ...B, neck: 9, tilt: 1, frontR: false, frontL: false },
    armTo({ ...B, neck: 9, handR: 'fist', frontL: false }, 'R', [-34, 66]),
    { ...both({ ...B, neck: 6, handR: 'open', handL: 'open' }, [-56, 304], [104, 300]), palmUp: 'L' },
  ],
  // ngả nhẹ ra sau → giơ một tay chắn → lùi chân, hai tay che
  'ghe-so': [
    { ...B, tilt: -4, neck: 5, frontR: false, frontL: false },
    armTo({ ...B, tilt: -7, neck: 7, handR: 'open', frontL: false }, 'R', [16, 176]),
    both({ ...B, tilt: -11, neck: 9, handR: 'open', handL: 'open', legR: { a: -7, b: 8 }, legL: { a: 3, b: 6 } }, [6, 168], [82, 174]),
  ],
  // đứng thẳng nắm tay → nắm tay trước ngực → hạ thấp người, hai nắm tay siết
  'quyet-tam': [
    { ...B, tilt: -2, neck: -2, handR: 'fist', handL: 'fist', frontR: false, frontL: false },
    armTo({ ...B, tilt: 0, neck: -3, handR: 'fist', handL: 'fist', frontL: false }, 'R', [46, 246]),
    both({ ...B, tilt: 7, neck: -7, handR: 'fist', handL: 'fist' }, [24, 300], [70, 298]),
  ],
  // cúi đầu, tay buông → ôm lấy cánh tay mình → đưa tay quệt mắt
  'tui-than': [
    { ...B, neck: 9, tilt: 2, armR: { a: 6, b: 10 }, armL: { a: 4, b: 10, rot: -1 }, frontR: false, frontL: false },
    both({ ...B, neck: 10, tilt: 3, handR: 'hold', handL: 'hold' }, [66, 262], [-6, 246]),
    armTo({ ...B, neck: 11, tilt: 5, handR: 'fist', frontL: false }, 'R', [12, 96]),
  ],
  // hếch cằm → khoanh tay → khoanh tay, ngả người, dồn trọng tâm một chân
  'khinh-thuong': [
    { ...B, neck: -6, tilt: -1, frontR: false, frontL: false },
    both({ ...B, neck: -8, handR: 'rest', handL: 'rest' }, [62, 280], [-26, 286]),
    both({ ...B, neck: -11, tilt: -5, handR: 'rest', handL: 'rest' }, [62, 280], [-26, 286]),
  ],
};

// --- Dáng chuyển trạng thái ---------------------------------------------------------------------------------------
type Key = { t: number; pose: JointPose };
export type Transition = { id: string; name: string; note: string; keys: Key[]; turn?: [JointPose['view'], JointPose['view']] };
const T3 = (p: JointPose): JointPose => ({ ...p, view: 'three', facing: 1 });
export const TRANSITIONS: Transition[] = [
  { id: 'dung-xuong-ngoi', name: 'Đứng → ngồi', note: 'Khuỵu gối, đổ người tới để giữ thăng bằng rồi hạ hông xuống ghế', keys: [{ t: 0, pose: T3(STAND_POSE) }, { t: 0.45, pose: T3({ ...STAND_POSE, tilt: 20, neck: -6, legR: { a: 44, b: 70 }, legL: { a: 50, b: 64 }, armR: { a: 30, b: 30 }, armL: { a: 24, b: 30, rot: -1 } }) }, { t: 1, pose: T3(TWIN_POSES.sit) }] },
  { id: 'ngoi-dung-day', name: 'Ngồi → đứng dậy', note: 'Chống tay lên đùi, đổ người tới, đẩy hông lên rồi thẳng lưng', keys: [{ t: 0, pose: T3(TWIN_POSES.sit) }, { t: 0.4, pose: T3({ ...TWIN_POSES.sit, tilt: 26, neck: -10, armR: { a: 40, b: 40 }, armL: { a: 36, b: 44, rot: -1 } }) }, { t: 0.7, pose: T3({ ...STAND_POSE, tilt: 14, legR: { a: 30, b: 40 }, legL: { a: 34, b: 36 } }) }, { t: 1, pose: T3(STAND_POSE) }] },
  { id: 'giat-lui', name: 'Giật mình, lùi lại', note: 'Người bật ra sau, tay vung lên che, chân lùi một bước, rồi thủ thế dè chừng', keys: [{ t: 0, pose: T3(STAND_POSE) }, { t: 0.3, pose: { ...both({ ...B, tilt: -14, neck: 10, handR: 'open', handL: 'open', legR: { a: -18, b: 12 }, legL: { a: 8, b: 8 } }, [0, 150], [80, 160]) } }, { t: 1, pose: T3(TWIN_POSES.wary) }] },
  { id: 'quay-lung', name: 'Quay lưng bỏ đi', note: 'Đầu quay trước, rồi vai, rồi chân; góc nhìn đổi dần ba phần tư → nghiêng → sau lưng', keys: [{ t: 0, pose: T3({ ...STAND_POSE, neck: 0 }) }, { t: 0.5, pose: T3({ ...STAND_POSE, tilt: 3, neck: -4 }) }, { t: 1, pose: T3(TWIN_POSES.stride) }], turn: ['three', 'back'] },
  { id: 'guc-xuong', name: 'Gục xuống', note: 'Vai sụp, đầu cúi, gối khuỵu rồi quỳ hẳn, hai tay chống sàn', keys: [{ t: 0, pose: T3(STAND_POSE) }, { t: 0.35, pose: T3({ ...STAND_POSE, tilt: 10, neck: 14, armR: { a: 4, b: 6 }, armL: { a: 2, b: 6, rot: -1 } }) }, { t: 1, pose: T3(EXTRA_POSES['quy-guc']) }] },
  { id: 'lao-toi', name: 'Lao tới, với tay', note: 'Lùi trọng tâm chuẩn bị, rồi phóng người tới, tay vươn dài', keys: [{ t: 0, pose: T3(STAND_POSE) }, { t: 0.25, pose: T3({ ...STAND_POSE, tilt: -6, neck: 2, legR: { a: 12, b: 24 }, legL: { a: -6, b: 18 }, armR: { a: -20, b: 30 } }) }, { t: 1, pose: T3({ ...STAND_POSE, tilt: 22, neck: -10, armR: { a: 84, b: 6 }, armL: { a: -34, b: 24, rot: -1 }, handR: 'open', frontR: true, legR: { a: 32, b: 12 }, legL: { a: -26, b: 22 } }) }] },
];
/** Dáng tại thời điểm t (0–1) của một chuỗi chuyển trạng thái. */
export const transitionPose = (id: string, t: number): JointPose => {
  const tr = TRANSITIONS.find((x) => x.id === id) ?? TRANSITIONS[0];
  const k = tr.keys, u = Math.min(1, Math.max(0, t));
  let i = 0; while (i < k.length - 2 && u > k[i + 1].t) i++;
  const a = k[i], b = k[i + 1], lt = (u - a.t) / (b.t - a.t || 1);
  const pose = easePose(a.pose, b.pose, lt, { anticipate: i === 0 ? 2 : 0 });
  if (!tr.turn) return pose;
  const v = turnAt({ view: tr.turn[0] ?? 'three', facing: 1 }, { view: tr.turn[1] ?? 'back', facing: 1 }, u);
  return { ...pose, view: v.view, facing: v.facing };
};

// --- Bảng duyệt -----------------------------------------------------------------------------------------------------
const LOOK = { outline: 'none', headOutline: 'none' } as const;
const NAMES: Record<GestureGroup, string> = { 'lo-lang': 'Lo lắng', 'boi-roi': 'Bối rối', 'ghe-so': 'Ghê sợ', 'quyet-tam': 'Quyết tâm', 'tui-than': 'Tủi thân', 'khinh-thuong': 'Khinh thường' };
/** Mỗi hàng một nhóm cảm xúc, ba mức: nét mặt và cử chỉ đi kèm trên cùng một người. Khinh thường dựng trên Người Kia. */
export const GestureBoard: React.FC = () => (
  <Sheet w={1500} h={2140} title="HỒ SƠ 02 / CẢM XÚC MỚI · BA MỨC VÀ CỬ CHỈ" subtitle="Nét mặt key -01/-02/-03 đi với GESTURES[nhóm][0/1/2] · dáng tĩnh để duyệt, chưa kiểm chứng chuyển động">
    {(Object.keys(GESTURES) as GestureGroup[]).map((g, r) => [0, 1, 2].map((n) => {
      const x = 30 + n * 485, y = 100 + r * 338;
      return (
        <g key={`${g}-${n}`}>
          <rect x={x} y={y} width={465} height={322} rx={20} fill="#faf6ed" />
          <StudentTwinBody {...LOOK} identity={g === 'khinh-thuong' ? 'nguoi-kia' : 'nam'} x={x + 232} y={y + 12} scale={0.47} mood="calm" face={`${g}-0${n + 1}` as StoryFaceKey} pose={GESTURES[g][n]} />
          <Label x={x + 18} y={y + 300} size={19}>{NAMES[g]} · mức {n + 1}</Label>
        </g>
      );
    }))}
  </Sheet>
);
/** Mỗi hàng một chuỗi chuyển trạng thái, sáu khung đều nhau từ đầu tới cuối. */
export const TransitionBoard: React.FC = () => (
  <Sheet w={1560} h={2050} title="HỒ SƠ 02 / DÁNG CHUYỂN TRẠNG THÁI" subtitle="Sáu khung đều t = 0 → 1 · thân đi trước, tay trễ, quá đà nhẹ (easePose) · khung tĩnh, chưa xem chuyển động">
    {TRANSITIONS.map((tr, r) => {
      const y = 100 + r * 320, seat = tr.id === 'dung-xuong-ngoi' || tr.id === 'ngoi-dung-day';
      return (
        <g key={tr.id}>
          <rect x={20} y={y} width={1520} height={304} rx={20} fill="#faf6ed" />
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t, i) => {
            const x = 120 + i * 240;
            return (
              <g key={t}>
                {seat && <rect x={x + 6} y={y + 182} width={64} height={56} rx={6} fill="#c9b08a" />}
                <StudentTwinBody {...LOOK} x={x} y={y + 6} scale={0.4} mood="calm" pose={transitionPose(tr.id, t)} />
              </g>
            );
          })}
          <Label x={36} y={y + 268} size={20}>{tr.name}</Label>
          <Label x={36} y={y + 292} size={15}>{tr.note}</Label>
        </g>
      );
    })}
  </Sheet>
);
