import React from 'react';
import { PALETTE } from './nhan-vat';
import { Light25, LIGHTS_25D, Nam25DHead } from './thiet-ke/thu-2-5d/nam-2-5d';
import { Tung25D } from './thiet-ke/thu-2-5d/tung-2-5d';
import { ExprFamily, exprFrom, exprOf, FAMILIES, FAMILY_IDS, liveExpr, shiftExpr, talkExpr } from './cam-xuc-2-5d';
import { STAND_POSE, TUNG_POSE } from './nhan-vat';

/** Bảng duyệt bộ cảm xúc 2.5D (ảnh tĩnh; chuyển động xem bằng dải khung `CamXucSongBoard` hoặc video). */
const INK = PALETTE.ink;
const T: React.FC<{ x: number; y: number; t: string; s?: number; w?: number; c?: string; a?: 'middle' | 'start' }> = ({ x, y, t, s = 18, w = 700, c = INK, a = 'middle' }) => (
  <text x={x} y={y} textAnchor={a} fontFamily="Arial, sans-serif" fontSize={s} fontWeight={w} fill={c} stroke="none">{t}</text>
);
const Card: React.FC<{ x: number; y: number; w: number; h: number; fill?: string }> = ({ x, y, w, h, fill = '#faf6ef' }) => <rect x={x} y={y} width={w} height={h} rx={18} fill={fill} />;

const CW = 300, CH = 300, TOP = 120;
/** Trang `page` (0, 1): 12 nhóm, mỗi hàng 2 nhóm × 3 mức. */
export const CamXucBoard: React.FC<{ page: 0 | 1 }> = ({ page }) => {
  const fams = FAMILY_IDS.slice(page * 12, page * 12 + 12);
  const H = TOP + 6 * CH + 30;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={6 * CW} height={H} viewBox={`0 0 ${6 * CW} ${H}`}>
      <rect width={6 * CW} height={H} fill="#efe7da" />
      <T x={40} y={56} a="start" s={30} w={800} t={`HỒ SƠ 02 / CẢM XÚC 2.5D (${page + 1}/2) — dựng mới bằng tham số`} />
      <T x={40} y={88} a="start" s={16} w={400} c="#69706c" t="Mỗi nhóm 3 mức: nhẹ · rõ · đỉnh. Mặt trộn liên tục giữa các mức (exprAmount), ánh sáng ban ngày. Không dùng file nét mặt cũ." />
      {fams.map((fid, i) => {
        const r = Math.floor(i / 2), c0 = (i % 2) * 3;
        const fam = FAMILIES[fid as ExprFamily];
        return (
          <g key={fid}>
            <Card x={c0 * CW + 12} y={TOP + r * CH + 8} w={3 * CW - 24} h={CH - 16} />
            <T x={c0 * CW + 34} y={TOP + r * CH + 40} a="start" s={20} t={fam.name} />
            <T x={c0 * CW + 34} y={TOP + r * CH + 62} a="start" s={14} w={400} c="#69706c" t={fam.note} />
            {[1, 2, 3].map((lv) => (
              <g key={lv}>
                <Nam25DHead identity={fid === 'cuoi-che-giau' || fid === 'ma-quai' ? 'nguoi-kia' : 'nam'} expr={exprOf(fid as ExprFamily, lv as 1 | 2 | 3)} id={`cx-${fid}-${lv}`}
                  x={(c0 + lv - 1) * CW + CW / 2 - 2} y={TOP + r * CH + 78} scale={1.02} />
                <T x={(c0 + lv - 1) * CW + CW / 2} y={TOP + r * CH + CH - 22} s={14} w={600} c="#4d5551" t={`mức ${lv}`} />
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
};

/** Cùng nét mặt dưới 6 kiểu sáng (đốm sáng mắt, bóng hốc mắt theo nguồn sáng), chính diện, Người Kia và Tùng. */
export const CamXucAnhSangBoard: React.FC = () => {
  const lights = Object.keys(LIGHTS_25D) as Light25[];
  const rows: { name: string; key: string }[] = [{ name: 'Sợ hãi 3', key: 'so-hai-03' }, { name: 'Vui 2', key: 'vui-02' }, { name: 'Tủi thân 3', key: 'tui-than-03' }];
  const W = 6 * 280 + 40, H = 130 + rows.length * 300 + 330;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect width={W} height={H} fill="#efe7da" />
      <T x={40} y={56} a="start" s={30} w={800} t="HỒ SƠ 02 / CẢM XÚC 2.5D — THEO ÁNH SÁNG, GÓC, NHÂN VẬT" />
      <T x={40} y={88} a="start" s={16} w={400} c="#69706c" t="Đốm sáng mắt và bóng đầu lấy từ hướng sáng của cảnh (LIGHTS_25D / lightFor). Hàng cuối: chính diện, Người Kia, Tùng." />
      {rows.map((row, r) => lights.map((l, i) => (
        <g key={`${r}-${l}`}>
          <rect x={20 + i * 280} y={120 + r * 300} width={268} height={288} rx={16} fill={LIGHTS_25D[l].bg} />
          <Nam25DHead lighting={l} expr={exprFrom(row.key)} id={`al-${r}-${l}`} x={154 + i * 280} y={150 + r * 300} scale={1} />
          <T x={154 + i * 280} y={120 + r * 300 + 276} s={14} c={['dem-xanh', 'man-hinh', 'nguoc-sang', 'den-vang'].includes(l) ? '#f2eee6' : INK} t={`${row.name} · ${LIGHTS_25D[l].name}`} />
        </g>
      )))}
      {(() => {
        const y0 = 120 + rows.length * 300;
        const items: { label: string; el: React.ReactNode }[] = [
          { label: 'Chính diện · Lo lắng 2', el: <Nam25DHead view="front" expr={exprOf('lo-lang', 2)} id="al-f1" x={154} y={y0 + 30} scale={1} /> },
          { label: 'Chính diện · Tức giận 3', el: <Nam25DHead view="front" expr={exprOf('tuc-gian', 3)} id="al-f2" x={434} y={y0 + 30} scale={1} /> },
          { label: 'Người Kia · Cười che giấu 3', el: <Nam25DHead identity="nguoi-kia" expr={exprOf('cuoi-che-giau', 3)} id="al-nk" lighting="dem-xanh" x={714} y={y0 + 30} scale={1} /> },
          { label: 'Đang nói "a" · Bất ngờ 2', el: <Nam25DHead expr={talkExpr(exprOf('bat-ngo', 2), { shape: 'a', open: 0.8 })} id="al-talk" x={994} y={y0 + 30} scale={1} /> },
          { label: 'Tùng · Quyết tâm 2', el: <g transform={`translate(1274 ${y0 + 34})`}><Tung25D pose={{ ...TUNG_POSE, view: 'three' }} expr={exprOf('quyet-tam', 2)} x={0} y={0} scale={0.42} /></g> },
          { label: 'Tùng · Vui 3 (chính diện)', el: <g transform={`translate(1554 ${y0 + 34})`}><Tung25D pose={{ ...STAND_POSE, view: 'front' }} expr={exprOf('vui', 3)} x={0} y={0} scale={0.42} /></g> },
        ];
        return items.map((it, i) => (
          <g key={i}>
            <rect x={20 + i * 280} y={y0} width={268} height={300} rx={16} fill="#faf6ef" />
            <g clipPath={undefined}>{it.el}</g>
            <T x={154 + i * 280} y={y0 + 288} s={14} t={it.label} />
          </g>
        ));
      })()}
    </svg>
  );
};

/** Dải khung: chuyển cảm xúc có trễ từng bộ phận (mày → mắt → miệng → sắc mặt), chớp liên tục, liếc và run môi. */
export const CamXucSongBoard: React.FC = () => {
  const seqs: { title: string; note: string; frames: number[]; at: (f: number) => ReturnType<typeof exprOf> }[] = [
    { title: 'Bình thản → Sợ hãi 3', note: 'mày bật trước, mắt trợn, chớp một cái khi đổi, miệng há sau, mặt tái và mồ hôi đến chậm nhất', frames: [0, 2, 4, 6, 8, 10, 13, 16, 22, 30],
      at: (f) => shiftExpr(exprOf('binh-than', 1), exprOf('so-hai', 3), f / 22) },
    { title: 'Bình thản → Vui 3', note: 'gò má nâng đẩy mí dưới, mắt híp dần, khoé môi quá đà nhẹ rồi về', frames: [0, 2, 4, 6, 8, 10, 13, 16, 22, 30],
      at: (f) => shiftExpr(exprOf('binh-than', 1), exprOf('vui', 3), f / 22) },
    { title: 'Tủi thân 3 đang sống (khung 0–90)', note: 'chớp là độ sụp mí liên tục, liếc nhỏ, môi run theo pha, giọt nước mắt lay', frames: [0, 9, 18, 27, 36, 45, 54, 63, 72, 81],
      at: (f) => liveExpr(exprOf('tui-than', 3), f + 40, { seed: 3 }) },
  ];
  const W = 10 * 180 + 40, H = 120 + seqs.length * 290;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect width={W} height={H} fill="#efe7da" />
      <T x={40} y={56} a="start" s={30} w={800} t="HỒ SƠ 02 / CẢM XÚC 2.5D — SỐNG ĐỘNG (dải khung, 30 fps)" />
      <T x={40} y={88} a="start" s={16} w={400} c="#69706c" t="shiftExpr: mỗi bộ phận trễ khác nhau; liveExpr: chớp, liếc, vi động. Ảnh tĩnh, chuyển động thật xem bằng video." />
      {seqs.map((s, r) => (
        <g key={r}>
          <rect x={20} y={110 + r * 290} width={W - 40} height={276} rx={16} fill="#faf6ef" />
          <T x={40} y={140 + r * 290} a="start" s={18} t={s.title} />
          <T x={40} y={162 + r * 290} a="start" s={13} w={400} c="#69706c" t={s.note} />
          {s.frames.map((f, i) => (
            <g key={i}>
              <Nam25DHead expr={s.at(f)} id={`song-${r}-${i}`} x={110 + i * 180} y={170 + r * 290} scale={0.84} />
              <T x={110 + i * 180} y={370 + r * 290} s={13} w={600} c="#4d5551" t={`khung ${f}`} />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
};
