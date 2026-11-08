import React from 'react';
import { rnd } from '../anim';
import { FONT } from '../fonts';
import { Glow, Cone, Dust, LightVeil, RoomCorners } from '../light';
import { AncestralAltar, SewingTable, CalendarBlock } from '../furnish';
import { Cat } from '../props';

// ============================================================================
// TẬP 01: "TIN NHẮN CHƯA GỬI" (BẢN 3) — 2.5D ENVIRONMENTS, LAYERS & STORY PROPS
// ============================================================================
// Built to match episodes/hem-co-chuyen/tap-01-tin-nhan-chua-gui/{KICH-BAN,DUNG-CANH,ASSET}.md (v3):
// 1. SET-TIEM (`OngLocShop`, `OngLocCounter`, `OngLocForeground`, `OngLocCounterInsert`):
//    Mysterious, cluttered late-night repair shop at the end of a Southern Vietnamese alley.
//    Dozens of stopped vintage clocks, amber desk-lamp pools, darkened unlit corners (`LightVeil`),
//    oscillating wall fan on the left, and cold alley light filtering through the iron folding gate on the right.
// 2. SET-NHA (`MotherThaoHouse`, `DiningTableSet`, `MotherHouseForeground`, `FatherSilhouette`):
//    Warm, cozy Vietnamese home of Duy (16) & Thảo (8) where light reaches (`tạo cảm giác ấm cúng`),
//    contrasted with darkened unlit corners (`ánh sáng trong phòng hơi tối lại những chỗ không có ánh sáng chiếu đến`),
//    and the Father appearing only as a subtle shadow/silhouette + muted rolling bottle sound in the back room.
// 3. Story Props (`MotherPhone`, `FamilyPhoto`, `MemoryReceipt`, `MoneyEnvelope`, `PhoneClothPouch`,
//    `ScrewdriverProp`, `SignPen`, `LeatherWallet`, `CeramicBowl`, `ThaoToteBag`, `HouseKeys`, `WallSwitch`).

const INK = '#16121A';
const WARM_RIM = '#FFB46A';
const COOL_RIM = '#9EC5FF';

// ----------------------------------------------------------------------------
// STORY PROPS (PROP-DIENTHOAI, PROP-ANH, PROP-BIENNHAN, PROP-TIEN, PROP-BAT, PROP-TUI-KHOA, PROP-CONGTAC)
// ----------------------------------------------------------------------------

/**
 * `MotherPhone` (`PROP-DIENTHOAI`):
 * Mother's smartphone in either tabletop perspective (`flat = true`) or macro insert view (`flat = false`).
 * - `cracked`: 0..1 (spiderweb glass cracks before Ông Lộc repairs it in Scene 6)
 * - `screenOn`: 0..1 (off in C1–C5, lit with voice-memo player in C6–C7)
 * - `playing`: 0..1 (voice memo waveform animation in C6-C)
 * - `onCloth`: draws the woven repair cloth (`tấm khăn trải mặt quầy`) underneath
 */
export const MotherPhone: React.FC<{
  x: number;
  y: number;
  w?: number;
  rot?: number;
  flat?: boolean;
  cracked?: number;
  screenOn?: number;
  playing?: number;
  onCloth?: boolean;
  f?: number;
}> = ({
  x,
  y,
  w = 130,
  rot = 0,
  flat = true,
  cracked = 1,
  screenOn = 0,
  playing = 0,
  onCloth = false,
  f = 0,
}) => {
  const s = w / 130;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {onCloth ? (
        <g>
          <polygon
            points="-135,16 125,22 152,-22 -108,-28"
            fill="#5E4638"
            stroke={INK}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <polygon
            points="-126,11 116,17 140,-18 -100,-24"
            fill="#725646"
            stroke="#8C6C58"
            strokeWidth={1.2}
            strokeDasharray="5 3"
          />
        </g>
      ) : null}
      <g transform={`rotate(${rot})`}>
        {flat ? (
          // Tabletop perspective phone (lying flat on counter or dining table)
          <g>
            <polygon points="-54,12 58,16 74,-8 -38,-12" fill="#000" opacity={0.42} />
            {/* Phone chassis thickness */}
            <polygon
              points="-56,4 54,8 70,-14 -40,-18"
              fill="#2A2836"
              stroke={INK}
              strokeWidth={2.6}
              strokeLinejoin="round"
            />
            <polygon points="-56,4 54,8 54,13 -56,9" fill="#181622" stroke={INK} strokeWidth={2} />
            <polygon points="54,8 70,-14 70,-9 54,13" fill="#12101A" stroke={INK} strokeWidth={2} />
            {/* Screen surface */}
            <polygon
              points="-49,2 47,6 61,-12 -35,-16"
              fill={screenOn > 0 ? '#D8ECFF' : '#141622'}
              stroke="#3E3C4E"
              strokeWidth={1.5}
            />
            {screenOn > 0 ? (
              <g opacity={screenOn}>
                <ellipse cx={6} cy={-4} rx={58} ry={22} fill="#78B8FF" opacity={0.32} />
                {/* Mini waveform bar on lit tabletop screen */}
                <line x1={-28} y1={-3} x2={34} y2={-1} stroke="#2B5B9E" strokeWidth={2.5} strokeLinecap="round" />
                <circle cx={-18 + playing * 28} cy={-2} r={3.2} fill="#E05246" />
              </g>
            ) : (
              <polygon points="-42,0 -10,1 14,-13 -16,-14" fill="#FFFFFF" opacity={0.08} />
            )}
            {/* Spiderweb cracks when `cracked > 0` */}
            {cracked > 0 ? (
              <g opacity={cracked} stroke="#DCE6F2" strokeWidth={1.5} strokeLinecap="round" fill="none">
                <path d="M -12 -8 L 18 4 M -12 -8 L -38 -2 M -12 -8 L -24 3 M -12 -8 L 8 -13 M -12 -8 L 32 -4" />
                <path d="M -26 -5 L -16 1 L 4 -2 L 14 -10" strokeWidth={1} opacity={0.8} />
              </g>
            ) : null}
          </g>
        ) : (
          // Macro / Insert 35° angled close-up view (C1-B, C4-A, C6-C)
          <g>
            <rect x={-92} y={-54} width={190} height={114} rx={16} fill="#000" opacity={0.45} />
            <rect x={-96} y={-62} width={190} height={112} rx={16} fill="#262432" stroke={INK} strokeWidth={4} />
            <rect x={-96} y={38} width={190} height={14} rx={6} fill="#171520" stroke={INK} strokeWidth={3} />
            {/* Screen */}
            <rect
              x={-82}
              y={-52}
              width={162}
              height={90}
              rx={8}
              fill={screenOn > 0 ? '#F2F6FC' : '#12131C'}
              stroke="#3A3848"
              strokeWidth={2}
            />
            {/* Earpiece & front camera (the camera Mother accidentally covered in the memory!) */}
            <circle cx={-88} cy={-16} r={3.2} fill="#0B0A10" stroke="#4A485A" strokeWidth={1} />
            <line x1={-88} y1={-4} x2={-88} y2={10} stroke="#3A3848" strokeWidth={2.5} strokeLinecap="round" />

            {screenOn > 0 ? (
              <g opacity={screenOn}>
                <Glow x={0} y={-8} r={140} kind="cool" o={0.45 * screenOn} />
                <rect x={-82} y={-52} width={162} height={22} rx={6} fill="#2E4A72" />
                <text x={-72} y={-37} fontFamily={FONT.ui} fontWeight={700} fontSize={9.5} fill="#FFFFFF">
                  Ghi_am_me_18h30.amr
                </text>
                <text x={68} y={-37} textAnchor="end" fontFamily={FONT.ui} fontSize={9} fill="#BFD8FF">
                  00:14
                </text>
                {/* Play button & waveform */}
                <circle cx={-54} cy={-4} r={14} fill="#E05246" stroke={INK} strokeWidth={2} />
                {playing > 0 ? (
                  <g fill="#FFFFFF">
                    <rect x={-58} y={-9} width={3} height={10} rx={1} />
                    <rect x={-53} y={-9} width={3} height={10} rx={1} />
                  </g>
                ) : (
                  <polygon points="-57,-10 -57,2 -47,-4" fill="#FFFFFF" />
                )}
                {Array.from({ length: 18 }).map((_, i) => {
                  const active = i / 18 <= playing;
                  const bh = 6 + Math.abs(Math.sin(i * 1.3 + (playing > 0 ? f * 0.2 : 0))) * 18;
                  return (
                    <rect
                      key={i}
                      x={-30 + i * 5.6}
                      y={-4 - bh / 2}
                      width={3.2}
                      height={bh}
                      rx={1.5}
                      fill={active ? '#E05246' : '#94A3B8'}
                    />
                  );
                })}
                <text x={-28} y={24} fontFamily={FONT.ui} fontSize={8.2} fill="#475569">
                  Chưa gửi · Ghi âm trước khi vào viện
                </text>
              </g>
            ) : (
              <path d="M -74 -48 L -12 -48 L -52 34 L -74 34 Z" fill="#FFFFFF" opacity={0.06} />
            )}

            {/* Detailed spiderweb cracks across the glass before repair */}
            {cracked > 0 ? (
              <g opacity={cracked}>
                <path
                  d="M -24 -18 L -78 -44 M -24 -18 L -80 12 M -24 -18 L -48 36 M -24 -18 L 18 36 M -24 -18 L 74 18 M -24 -18 L 68 -38 M -24 -18 L -6 -50"
                  stroke="#E2EBF6"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                />
                <path
                  d="M -48 -30 L -52 -4 L -36 14 L -4 18 L 28 -2 L 16 -32 L -12 -38 Z M -64 -36 L -68 4 L -24 28 L 44 10 L 42 -28"
                  stroke="#CBD5E1"
                  strokeWidth={1.3}
                  fill="none"
                  opacity={0.85}
                />
              </g>
            ) : null}
          </g>
        )}
      </g>
    </g>
  );
};

/**
 * `FamilyPhoto` (`PROP-ANH` — Ảnh giấy ba mẹ con lấy từ ngăn ví trong suốt của Duy):
 * Shows Mother in the center with Thảo (left, 8yo) and Duy (right, 16yo).
 */
export const FamilyPhoto: React.FC<{
  x: number;
  y: number;
  w?: number;
  rot?: number;
  flat?: boolean;
}> = ({ x, y, w = 96, rot = -6, flat = false }) => {
  const s = w / 96;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s} ${flat ? s * 0.62 : s})`}>
      <rect x={-46} y={-34} width={96} height={72} rx={3} fill="#000" opacity={0.38} />
      <rect x={-48} y={-38} width={96} height={72} rx={3} fill="#F5EFE2" stroke={INK} strokeWidth={2.6} />
      <rect x={-41} y={-31} width={82} height={54} fill="#D8C5AE" stroke="#8C7A68" strokeWidth={1.2} />
      {/* Background warm home wall in photo */}
      <rect x={-41} y={-31} width={82} height={32} fill="#C8B299" />
      {/* Thảo (left, smaller child with topknot), Mother (center), Duy (right, teen brother) */}
      {[
        { cx: -22, cy: -4, r: 7.2, coat: '#DFC17B', hair: '#231D24', bun: false, topknot: true },
        { cx: 0, cy: -11, r: 9.5, coat: '#6E5A7F', hair: '#3B343C', bun: true, topknot: false },
        { cx: 22, cy: -8, r: 8.5, coat: '#566A7A', hair: '#1E2030', bun: false, topknot: false },
      ].map((p, i) => (
        <g key={i}>
          <path
            d={`M ${p.cx - 13} 23 Q ${p.cx - 12} ${p.cy + 8} ${p.cx} ${p.cy + 8} Q ${p.cx + 12} ${p.cy + 8} ${p.cx + 13} 23 Z`}
            fill={p.coat}
            stroke={INK}
            strokeWidth={1.6}
          />
          {p.bun ? <circle cx={p.cx} cy={p.cy - 9} r={5} fill={p.hair} /> : null}
          {p.topknot ? (
            <g>
              <circle cx={p.cx} cy={p.cy - 8.5} r={3.6} fill={p.hair} />
              <ellipse cx={p.cx} cy={p.cy - 6} rx={3.2} ry={1.3} fill="#C84038" />
            </g>
          ) : null}
          <circle cx={p.cx} cy={p.cy} r={p.r} fill="#EBC8A4" stroke={INK} strokeWidth={1.6} />
          <path
            d={`M ${p.cx - p.r} ${p.cy - 1} A ${p.r} ${p.r} 0 0 1 ${p.cx + p.r} ${p.cy - 1} Q ${p.cx} ${p.cy - 6} ${p.cx - p.r} ${p.cy - 1} Z`}
            fill={p.hair}
          />
        </g>
      ))}
      {/* Vintage photo crease line */}
      <path d="M -48 -12 L 48 18" stroke="#E2D6C1" strokeWidth={1.2} opacity={0.65} />
    </g>
  );
};

/**
  * `MemoryReceipt` (`PROP-G1-G2-G3` — Biên nhận giấy tự in hai liên tiệm Ông Lộc):
  * Includes the backing board (`bìa kê`), perforated tear line (`đường răng cưa`), and pink carbon copy slip peeking underneath.
  * Supports `deal`:
  * - `'G1'`: Sửa điện thoại — đổi ký ức tối sinh nhật 16 tuổi được mẹ ôm & chụp ảnh (Người trả: Duy)
  * - `'G2'`: Đổi bằng lời — thoáng yên ấm như ngày mẹ còn, nhận phần trống vắng của em (Người trả: Duy)
  * - `'G3'`: Đổi bằng lời — cuộc gặp mẹ nói lời còn thiếu, từ nay không còn mơ thấy mẹ (Người trả: Thảo)
  * Supports `stage`:
  * - `'blank'`: pushed out by Ông Lộc before writing/signing
  * - `'written'`: event written before signature
  * - `'signed'`: completed slip with payer name / signature
  * - `'folded'`: customer copy folded for Duy's wallet
  */
export const MemoryReceipt: React.FC<{
  x: number;
  y: number;
  w?: number;
  rot?: number;
  stage?: 'blank' | 'written' | 'signed' | 'folded';
  deal?: 'G1' | 'G2' | 'G3';
  flat?: boolean;
}> = ({ x, y, w = 135, rot = 4, stage = 'signed', deal = 'G1', flat = false }) => {
  const s = w / 135;
  const h = stage === 'folded' ? 48 : 92;
  const headerText =
    deal === 'G1'
      ? 'PHIẾU G1 · SỬA ĐIỆN THOẠI (2 LIÊN)'
      : deal === 'G2'
        ? 'PHIẾU G2 · ĐỔI BẰNG LỜI'
        : 'PHIẾU G3 · ĐỔI BẰNG LỜI';
  const line1 =
    deal === 'G1'
      ? 'Tranh xe đồ chơi, làm em ngã;'
      : deal === 'G2'
        ? 'Thoáng yên ấm như ngày mẹ còn;'
        : 'Gặp mẹ một lần, nói lời chưa kịp;';
  const line2 =
    deal === 'G1'
      ? 'mẹ dỗ cả hai rồi làm hòa.'
      : deal === 'G2'
        ? 'nhận thêm nỗi buồn của em.'
        : 'từ nay không còn mơ thấy mẹ.';
  const payerLabel =
    deal === 'G3'
      ? 'Người trả: THẢO (8t) · Bằng lời'
      : deal === 'G2'
        ? 'Người trả: DUY (16t) · Bằng lời'
        : 'Người trả: DUY (16t) · Đã ký';
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s} ${flat ? s * 0.62 : s})`}>
      <rect x={-64} y={-h / 2 + 5} width={132} height={h} rx={2} fill="#000" opacity={0.36} />
      {stage !== 'folded' ? (
        <g>
          {/* Cardboard backing pad (`tấm bìa kê`) & pink carbonless bottom copy (`liên hồng tự in`) */}
          <rect x={-70} y={-h / 2 - 4} width={140} height={h + 8} rx={3} fill="#6E4E3A" stroke={INK} strokeWidth={2.2} />
          <rect x={-63} y={-h / 2 + 3} width={132} height={h} rx={2} fill="#E8C8C4" stroke={INK} strokeWidth={1.8} />
        </g>
      ) : null}
      <rect x={-66} y={-h / 2} width={132} height={h} rx={2} fill="#EFE6D2" stroke={INK} strokeWidth={2.5} />
      {stage === 'folded' ? (
        <g>
          <line x1={-66} y1={0} x2={66} y2={0} stroke="#C8B99E" strokeWidth={1.8} />
          <text x={0} y={-6} textAnchor="middle" fontFamily={FONT.title} fontWeight={700} fontSize={8.5} fill="#5C3A2C">
            BIÊN NHẬN {deal} · LIÊN KHÁCH
          </text>
        </g>
      ) : (
        <g>
          {/* Perforated tear line at top (`đường răng cưa xé liên`) */}
          <line x1={-64} y1={-41} x2={64} y2={-41} stroke="#8C7A68" strokeWidth={1.5} strokeDasharray="3 3" />
          <rect x={-58} y={-38} width={116} height={14} fill={deal === 'G3' ? '#E8CDB8' : '#DFD2B8'} />
          <text x={0} y={-28} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={7.8} fill="#4A2E20" letterSpacing={0.4}>
            {headerText}
          </text>
          <line x1={-56} y1={-16} x2={56} y2={-16} stroke="#B8A88E" strokeWidth={1.2} />
          <line x1={-56} y1={-2} x2={56} y2={-2} stroke="#B8A88E" strokeWidth={1.2} />
          <line x1={-56} y1={12} x2={56} y2={12} stroke="#B8A88E" strokeWidth={1.2} />
          {stage === 'written' || stage === 'signed' ? (
            <g>
              <text x={-54} y={-19} fontFamily={FONT.hand} fontSize={7.5} fill="#1E2F52">
                {line1}
              </text>
              <text x={-54} y={-5} fontFamily={FONT.hand} fontSize={7.5} fill="#1E2F52">
                {line2}
              </text>
              <text
                x={-54}
                y={9}
                fontFamily={FONT.ui}
                fontWeight={700}
                fontSize={7.2}
                fill={deal === 'G3' ? '#A82E26' : '#3E271E'}
              >
                {payerLabel}
              </text>
            </g>
          ) : null}
          {stage === 'signed' ? (
            <g>
              {deal === 'G1' ? (
                <path
                  d="M 12 30 q 8 -14 14 -2 q 6 -10 12 2 q 8 -4 14 -6"
                  stroke="#1E2F52"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                />
              ) : (
                <text x={22} y={30} textAnchor="middle" fontFamily={FONT.hand} fontWeight={700} fontSize={8.2} fill="#7A2822">
                  (Đã nhận lời)
                </text>
              )}
              {/* Red shop seal stamp: TIỆM ĐỒ CŨ & ĐỒNG HỒ ÔNG LỘC */}
              <g transform="translate(-32 26)">
                <rect x={-15} y={-10} width={30} height={20} fill="#B83A32" opacity={0.12} stroke="#B83A32" strokeWidth={1.4} />
                <rect x={-13} y={-8} width={26} height={16} fill="none" stroke="#B83A32" strokeWidth={0.8} />
                <text x={0} y={-2} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={4.2} fill="#B83A32">
                  ÔNG LỘC
                </text>
                <text x={0} y={4} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={3.6} fill="#B83A32">
                  HẺM 14/9
                </text>
              </g>
            </g>
          ) : null}
        </g>
      )}
    </g>
  );
};

/**
 * `ThreeReceiptsSet` (`PROP-G1-G2-G3` — Bộ 3 phiếu giao kèo ở C8-B):
 * Renders G1 (Duy), G2 (Duy), and G3 (Thảo) side-by-side on the counter so the viewer clearly sees
 * the 3 distinct exchanges and that the 3rd slip bears Thảo's name.
 */
export const ThreeReceiptsSet: React.FC<{
  x: number;
  y: number;
  s?: number;
  flat?: boolean;
}> = ({ x, y, s = 1, flat = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <MemoryReceipt x={-135} y={4} w={122} rot={-5} deal="G1" stage="signed" flat={flat} />
    <MemoryReceipt x={0} y={-2} w={122} rot={1} deal="G2" stage="signed" flat={flat} />
    <MemoryReceipt x={135} y={6} w={122} rot={6} deal="G3" stage="signed" flat={flat} />
  </g>
);

/**
 * `MoneyEnvelope` (`PROP-TIEN` — Phong bì tiền sửa máy 186.000đ của Duy + 2 tờ 20.000đ gấp tư của Thảo):
 * Used in Scene 1 & Scene 2 when Duy counts out his crumpled bills and 8yo Thảo pushes her 2 folded 20k bills forward.
 */
export const MoneyEnvelope: React.FC<{
  x: number;
  y: number;
  s?: number;
  rot?: number;
  withThaoBills?: boolean;
  flat?: boolean;
}> = ({ x, y, s = 1, rot = -6, withThaoBills = true, flat = false }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s} ${flat ? s * 0.65 : s})`}>
    {/* Kraft envelope (`phong bì giấy xi măng`) */}
    <rect x={-46} y={-22} width={86} height={46} rx={3} fill="#000" opacity={0.35} />
    <rect x={-48} y={-26} width={86} height={46} rx={3} fill="#C89D6C" stroke={INK} strokeWidth={2.4} />
    <path d="M -48 -26 L -5 -4 L 38 -26" fill="none" stroke="#8C643B" strokeWidth={1.8} />
    {/* Stack of flattened small-denomination Vietnamese bills (186.000đ) peeking out */}
    <rect x={-18} y={-34} width={68} height={32} rx={2} fill="#7A9E7E" stroke={INK} strokeWidth={2} transform="rotate(6 16 -18)" />
    <rect x={-14} y={-30} width={68} height={32} rx={2} fill="#B88468" stroke={INK} strokeWidth={2} transform="rotate(11 20 -14)" />
    <rect x={-2} y={-22} width={44} height={18} rx={2} fill="#E6DCC8" opacity={0.65} transform="rotate(11 20 -14)" />
    {/* Thảo's 2 quarter-folded 20.000đ blue bills (`2 tờ 20.000đ gấp tư đặt cạnh phong bì`) */}
    {withThaoBills ? (
      <g transform="translate(46 8)">
        <rect x={-18} y={-14} width={34} height={24} rx={2} fill="#3E6B9C" stroke={INK} strokeWidth={2} transform="rotate(-14)" />
        <rect x={-10} y={-10} width={34} height={24} rx={2} fill="#4D7EB3" stroke={INK} strokeWidth={2} transform="rotate(8)" />
        <line x1={-6} y1={2} x2={20} y2={4} stroke="#BFD8FF" strokeWidth={1.5} opacity={0.7} />
      </g>
    ) : null}
  </g>
);

/** `PhoneClothPouch` (`túi vải nhỏ đựng điện thoại mẹ` — Thảo ôm hoặc đặt ở góc quầy) */
export const PhoneClothPouch: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({
  x,
  y,
  s = 1,
  rot = -10,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={2} cy={4} rx={36} ry={14} fill="#000" opacity={0.35} />
    <path
      d="M -32 -10 Q -36 12 -18 16 L 22 16 Q 36 12 30 -10 L 24 -22 L -24 -22 Z"
      fill="#8C6D58"
      stroke={INK}
      strokeWidth={2.4}
      strokeLinejoin="round"
    />
    <path d="M -26 -14 L 26 -14" stroke="#D4A24C" strokeWidth={2.2} />
    <path d="M 24 -14 Q 36 -18 32 -6" stroke="#D4A24C" strokeWidth={2} fill="none" />
  </g>
);

/** `ScrewdriverProp` (`tua vít nhỏ của Ông Lộc` đặt cạnh khay ốc hoặc cầm tay) */
export const ScrewdriverProp: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({
  x,
  y,
  s = 1,
  rot = 18,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-38} y={2} width={76} height={5} rx={2.5} fill="#000" opacity={0.32} />
    <rect x={-40} y={-4.5} width={38} height={9} rx={4} fill="#B84238" stroke={INK} strokeWidth={2} />
    <rect x={-12} y={-4.5} width={6} height={9} fill="#D4A24C" stroke={INK} strokeWidth={1.5} />
    <line x1={-2} y1={0} x2={36} y2={0} stroke="#CBD5E1" strokeWidth={3} strokeLinecap="round" />
    <polygon points="34,-2 40,0 34,2" fill="#94A3B8" />
  </g>
);

/** `SignPen` (`PROP-BUT-VI` — Cây bút ký giao kèo trên mặt quầy) */
export const SignPen: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = -25 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-42} y={2} width={84} height={6} rx={3} fill="#000" opacity={0.35} />
    <rect x={-44} y={-3.5} width={76} height={7} rx={3.5} fill="#2B3A55" stroke={INK} strokeWidth={2} />
    <rect x={-10} y={-3.5} width={6} height={7} fill="#D4A24C" />
    <polygon points="32,-3.5 44,0 32,3.5" fill="#D4A24C" stroke={INK} strokeWidth={1.6} />
    <circle cx={44} cy={0} r={1.3} fill="#1E2F52" />
    <path d="M -36 -3.5 L -16 -6.5 L -16 -3.5" stroke="#D4A24C" strokeWidth={1.8} fill="none" />
  </g>
);

/** `LeatherWallet` (`PROP-BUT-VI` — Ví da sờn của Duy, mở hoặc đóng) */
export const LeatherWallet: React.FC<{
  x: number;
  y: number;
  s?: number;
  rot?: number;
  open?: boolean;
  hasPhoto?: boolean;
}> = ({ x, y, s = 1, rot = 12, open = false, hasPhoto = false }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={open ? -58 : -34} y={-22} width={open ? 116 : 68} height={52} rx={5} fill="#000" opacity={0.38} />
    <rect
      x={open ? -60 : -36}
      y={-26}
      width={open ? 116 : 68}
      height={52}
      rx={5}
      fill="#4E2F21"
      stroke={INK}
      strokeWidth={2.8}
    />
    <rect
      x={open ? -54 : -31}
      y={-21}
      width={open ? 104 : 58}
      height={42}
      rx={3}
      fill="none"
      stroke="#8A5A42"
      strokeWidth={1.4}
      strokeDasharray="4 3"
    />
    {open ? (
      <g>
        <line x1={-2} y1={-26} x2={-2} y2={26} stroke="#2A1810" strokeWidth={3} />
        <rect x={-48} y={-14} width={38} height={28} rx={2} fill="#3A2218" />
        <rect x={8} y={-14} width={38} height={28} rx={2} fill="#3A2218" />
        {hasPhoto ? <rect x={12} y={-10} width={30} height={20} fill="#F2EAD8" stroke={INK} strokeWidth={1.5} /> : null}
      </g>
    ) : null}
  </g>
);

/** `CeramicBowl` (`PROP-BAT` — Bát sứ trắng sạch úp trong tủ hoặc đặt trên mặt bếp ở Cảnh 7) */
export const CeramicBowl: React.FC<{
  x: number;
  y: number;
  s?: number;
  upsideDown?: boolean;
}> = ({ x, y, s = 1, upsideDown = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={2} cy={3} rx={28} ry={6} fill="#000" opacity={0.35} />
    <g transform={upsideDown ? 'translate(0 -24) scale(1 -1)' : undefined}>
      <path d="M -26 -22 Q -24 0 -10 2 L 10 2 Q 24 0 26 -22 Z" fill="#F4F1EA" stroke={INK} strokeWidth={2.5} />
      <path d="M 8 -22 Q 24 -20 26 -22 Q 24 0 10 2 L 4 2 Z" fill="#D8D2C5" opacity={0.65} />
      <path d="M -24 -15 L 24 -15" stroke="#3B6E9C" strokeWidth={2.2} opacity={0.75} />
      <rect x={-11} y={2} width={22} height={4.5} rx={1.5} fill="#E2DDD2" stroke={INK} strokeWidth={2} />
      <ellipse cx={0} cy={-22} rx={26} ry={5} fill="#FFFFFF" stroke={INK} strokeWidth={2.2} />
    </g>
  </g>
);

/** `ThaoToteBag` (`PROP-TUI-KHOA` — Túi vải của Thảo đặt trên đùi ở tiệm hoặc treo cạnh cửa ở nhà) */
export const ThaoToteBag: React.FC<{
  x: number;
  y: number;
  s?: number;
  hanging?: boolean;
  rot?: number;
}> = ({ x, y, s = 1, hanging = false, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {hanging ? (
      <g>
        <path d="M 0 0 L -22 58 L 22 58 Z" fill="none" stroke="#6E523E" strokeWidth={5} strokeLinecap="round" />
        <path
          d="M -28 54 L 28 54 L 34 126 Q 0 132 -34 126 Z"
          fill="#C8B496"
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path d="M 8 54 L 28 54 L 34 126 L 12 126 Z" fill="#000" opacity={0.18} />
        <path d="M -18 76 L 18 76" stroke="#8C7458" strokeWidth={2} strokeDasharray="4 3" />
      </g>
    ) : (
      <g>
        <ellipse cx={0} cy={4} rx={42} ry={8} fill="#000" opacity={0.35} />
        <path
          d="M -36 0 Q -40 -36 -28 -48 L 28 -48 Q 40 -36 36 0 Z"
          fill="#C8B496"
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path d="M -20 -48 Q 0 -76 20 -48" stroke="#6E523E" strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    )}
  </g>
);

/** `HouseKeys` (`PROP-TUI-KHOA` — Chùm chìa khóa nhà treo cạnh cửa) */
export const HouseKeys: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={8} r={7} fill="none" stroke="#D4A24C" strokeWidth={2.5} />
    <rect x={-9} y={14} width={8} height={18} rx={3} fill="#C2453E" stroke={INK} strokeWidth={1.8} />
    <path d="M 2 14 L 6 34 L 10 34 L 10 30 L 6 30 L 6 26 L 10 26" stroke="#C8D0D8" strokeWidth={2.5} fill="none" strokeLinecap="round" />
    <path d="M 0 15 L 0 36 L 4 36" stroke="#D4A24C" strokeWidth={2.5} fill="none" strokeLinecap="round" />
  </g>
);

/** `WallSwitch` (`PROP-CONGTAC` — Công tắc đèn bếp ở mép trái lối vào bếp) */
export const WallSwitch: React.FC<{ x: number; y: number; s?: number; on?: boolean }> = ({
  x,
  y,
  s = 1,
  on = true,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-11} y={-17} width={24} height={36} rx={3} fill="#000" opacity={0.3} />
    <rect x={-12} y={-18} width={24} height={36} rx={3} fill="#EAE4D7" stroke={INK} strokeWidth={2.2} />
    <rect x={-5} y={on ? -9 : -2} width={10} height={11} rx={2} fill={on ? '#F6F2E8' : '#C8C2B6'} stroke={INK} strokeWidth={1.8} />
    <circle cx={0} cy={-13} r={1.8} fill={on ? '#4CC774' : '#64748B'} />
  </g>
);

// ----------------------------------------------------------------------------
// ENVIRONMENT 1: TIỆM SỬA ĐỒ ÔNG LỘC (`SET-TIEM` — Huyền bí, cổ kính & bừa bộn)
// ----------------------------------------------------------------------------

/** Helper: Stopped clock variations (pendulum, octagonal, twin-bell, brass pocket watch, mantle clock) */
const StoppedClockItem: React.FC<{
  x: number;
  y: number;
  kind: 'pendulum' | 'octagon' | 'alarm' | 'mantle' | 'gear';
  s?: number;
  hAng?: number;
  mAng?: number;
  t?: number;
}> = ({ x, y, kind, s = 1, hAng = 60, mAng = 230, t = 0 }) => {
  const hr = (hAng * Math.PI) / 180;
  const mr = (mAng * Math.PI) / 180;
  const bobX = t > 0 ? Math.sin(t * 0.1 + x * 0.05) * 6 : 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {kind === 'pendulum' ? (
        <g>
          <polygon points="-30,-118 0,-138 30,-118 26,0 -26,0" fill="#3E241C" stroke={INK} strokeWidth={3} />
          <rect x={-20} y={-58} width={40} height={48} rx={2} fill="#1E1414" stroke="#6E4432" strokeWidth={1.8} />
          {/* Brass pendulum bob with gentle rhythmic sway */}
          <line x1={0} y1={-58} x2={bobX} y2={-24} stroke="#C89B4B" strokeWidth={2} />
          <circle cx={bobX} cy={-20} r={8} fill="#D4A24C" stroke={INK} strokeWidth={2} />
          <circle cx={0} cy={-90} r={19} fill="#EFE2CC" stroke={INK} strokeWidth={2.5} />
          <line x1={0} y1={-90} x2={Math.sin(hr) * 10} y2={-90 - Math.cos(hr) * 10} stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
          <line x1={0} y1={-90} x2={Math.sin(mr) * 14} y2={-90 - Math.cos(mr) * 14} stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
        </g>
      ) : kind === 'octagon' ? (
        <g>
          <polygon
            points="-14,-56 14,-56 28,-42 28,-14 14,0 -14,0 -28,-14 -28,-42"
            fill="#583426"
            stroke={INK}
            strokeWidth={3}
          />
          <circle cx={0} cy={-28} r={19} fill="#EADBC2" stroke={INK} strokeWidth={2.2} />
          <line x1={0} y1={-28} x2={Math.sin(hr) * 10} y2={-28 - Math.cos(hr) * 10} stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
          <line x1={0} y1={-28} x2={Math.sin(mr) * 14} y2={-28 - Math.cos(mr) * 14} stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
        </g>
      ) : kind === 'alarm' ? (
        <g>
          <circle cx={0} cy={-22} r={20} fill="#35586C" stroke={INK} strokeWidth={2.8} />
          <circle cx={0} cy={-22} r={15} fill="#F4EAD5" />
          <path d="M -16 -40 A 8 8 0 0 1 -4 -44" stroke="#D4A24C" strokeWidth={4} fill="none" />
          <path d="M 16 -40 A 8 8 0 0 0 4 -44" stroke="#D4A24C" strokeWidth={4} fill="none" />
          <line x1={0} y1={-22} x2={Math.sin(hr) * 8} y2={-22 - Math.cos(hr) * 8} stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
          <line x1={0} y1={-22} x2={Math.sin(mr) * 11} y2={-22 - Math.cos(mr) * 11} stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
        </g>
      ) : kind === 'mantle' ? (
        <g>
          <path d="M -32 0 L -28 -36 Q 0 -58 28 -36 L 32 0 Z" fill="#4B2E24" stroke={INK} strokeWidth={2.8} />
          <circle cx={0} cy={-22} r={14} fill="#EFE2CC" stroke="#C89B4B" strokeWidth={2} />
          <line x1={0} y1={-22} x2={Math.sin(hr) * 7} y2={-22 - Math.cos(hr) * 7} stroke={INK} strokeWidth={2} strokeLinecap="round" />
          <line x1={0} y1={-22} x2={Math.sin(mr) * 10} y2={-22 - Math.cos(mr) * 10} stroke={INK} strokeWidth={1.5} strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <circle cx={0} cy={-14} r={14} fill="none" stroke="#C89B4B" strokeWidth={3.5} strokeDasharray="5 3" />
          <circle cx={0} cy={-14} r={6} fill="none" stroke="#C89B4B" strokeWidth={2} />
        </g>
      )}
    </g>
  );
};

/**
 * Background & Midground Shell of Ông Lộc's Repair Shop (`SET-TIEM` / `OngLocShop`):
 * - Left: Wall-mounted oscillating fan (`quạt tường chạy nhẹ`), cluttered west shelves (`kệ tây`) with radio, screw boxes, cassettes, jars of gears.
 * - Center-Back: Towering shelves of stopped clocks (`những hàng đồng hồ đã ngừng chạy`), apothecary/memory drawers, and Ông Lộc's rear repair bench (`bàn sửa + đèn vàng`) at `y ≈ 725`.
 * - Right: Folding iron gate (`cửa sắt kéo`) opening to the night alley (`CỬA RA HẺM`) with cold blue-white alley light pouring onto the patterned cement tile floor.
 * Place Ông Lộc behind `<OngLocCounter />`, and Duy + Thảo on `<CustomerStool />` in front of `<OngLocCounter />`.
 */
export const OngLocShop: React.FC<{
  t?: number;
  id?: string;
  veil?: number;
}> = ({ t = 0, id = 'tiem', veil = 0.36 }) => {
  const fanRot = t * 14;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}Wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B1622" />
          <stop offset="55%" stopColor="#2B222C" />
          <stop offset="100%" stopColor="#1E1720" />
        </linearGradient>
        <linearGradient id={`${id}Floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#261E24" />
          <stop offset="100%" stopColor="#171218" />
        </linearGradient>
        <linearGradient id={`${id}AlleyCold`} x1="1" y1="0" x2="0" y2="0.4">
          <stop offset="0%" stopColor="#9EC5FF" stopOpacity={0.32} />
          <stop offset="100%" stopColor="#9EC5FF" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Ceiling & room walls */}
      <rect x={-400} y={-300} width={2720} height={1680} fill="#120E17" />
      {/* Back wall (weathered dark ochre-plum plaster) */}
      <rect x={220} y={130} width={1440} height={585} fill={`url(#${id}Wall)`} stroke={INK} strokeWidth={4} />
      {/* Left wall perspective plane */}
      <polygon points="-120,-40 220,130 220,715 -120,980" fill="#221B26" stroke={INK} strokeWidth={4} />
      {/* Right wall perspective plane (with alley doorway) */}
      <polygon points="1660,130 2040,-40 2040,980 1660,715" fill="#1F1924" stroke={INK} strokeWidth={4} />
      {/* Ceiling beams (`xà gồ gỗ cũ`) */}
      <polygon points="-120,-40 2040,-40 1660,130 220,130" fill="#16111B" />
      {[0.25, 0.55, 0.85].map((k, i) => {
        const y = -40 + k * 170;
        return <line key={i} x1={-120} y1={y} x2={2040} y2={y} stroke="#281E24" strokeWidth={12 - i * 2} />;
      })}

      {/* Floor with patterned Vietnamese cement tile grid (`nền gạch bông cũ`) */}
      <polygon points="-120,980 220,715 1660,715 2040,980" fill={`url(#${id}Floor)`} stroke={INK} strokeWidth={4} />
      {Array.from({ length: 13 }).map((_, i) => {
        const u = i / 12;
        const xTop = 220 + u * 1440;
        const xBot = -220 + u * 2360;
        return <line key={`fg${i}`} x1={xTop} y1={715} x2={xBot} y2={1080} stroke="#140F16" strokeWidth={2} opacity={0.65} />;
      })}
      {[755, 805, 865, 940, 1025].map((fy, i) => (
        <line key={`fh${i}`} x1={-200} y1={fy} x2={2120} y2={fy} stroke="#140F16" strokeWidth={2} opacity={0.65} />
      ))}

      {/* Peeling plaster patches, water stains & cobwebs on back wall for mysterious aged atmosphere */}
      <path d="M 250 135 Q 340 210 225 260 M 225 180 Q 290 175 310 135" stroke="#4A4252" strokeWidth={1.5} fill="none" opacity={0.35} />
      <path d="M 1640 135 Q 1560 195 1655 245" stroke="#4A4252" strokeWidth={1.5} fill="none" opacity={0.35} />
      <ellipse cx={680} cy={210} rx={95} ry={42} fill="#16111A" opacity={0.45} />
      <ellipse cx={1280} cy={250} rx={110} ry={48} fill="#16111A" opacity={0.4} />

      {/* ===================================================================== */}
      {/* BACK WALL LEFT & CENTER: TOWERING SHELVES OF STOPPED CLOCKS & DRAWERS */}
      {/* ===================================================================== */}
      <g>
        {/* Tall wooden cabinet backing (x = 270..1030, y = 175..715) */}
        <rect x={270} y={175} width={760} height={540} fill="#2A1A17" stroke={INK} strokeWidth={4} />
        <rect x={284} y={188} width={732} height={514} fill="#1E1311" />
        {/* Vertical dividers */}
        <rect x={525} y={185} width={14} height={520} fill="#3A241E" stroke={INK} strokeWidth={2.5} />
        <rect x={780} y={185} width={14} height={520} fill="#3A241E" stroke={INK} strokeWidth={2.5} />
        {/* Horizontal shelf planks */}
        {[295, 410, 525, 625].map((sy, i) => (
          <rect key={i} x={270} y={sy} width={760} height={14} rx={2} fill="#4E3024" stroke={INK} strokeWidth={2.8} />
        ))}

        {/* Row 1 (y = 295): Pendulum clocks, octagonal clocks, mantle clocks — ALL STOPPED */}
        <StoppedClockItem x={345} y={295} kind="pendulum" s={0.82} hAng={40} mAng={190} />
        <StoppedClockItem x={425} y={295} kind="octagon" s={0.95} hAng={305} mAng={70} />
        <StoppedClockItem x={490} y={295} kind="alarm" s={0.88} hAng={140} mAng={20} />
        <StoppedClockItem x={585} y={295} kind="mantle" s={1.05} hAng={250} mAng={160} />
        <StoppedClockItem x={665} y={295} kind="pendulum" s={0.78} hAng={95} mAng={310} />
        <StoppedClockItem x={735} y={295} kind="alarm" s={0.92} hAng={210} mAng={115} />
        <StoppedClockItem x={845} y={295} kind="octagon" s={1.0} hAng={15} mAng={245} />
        <StoppedClockItem x={925} y={295} kind="mantle" s={0.95} hAng={185} mAng={45} />
        <StoppedClockItem x={985} y={295} kind="gear" s={1.1} />

        {/* Row 2 (y = 410): Stopped clocks, glass jars of watch gears, vintage radios, hanging pocket watches */}
        <StoppedClockItem x={330} y={410} kind="mantle" s={1.0} hAng={120} mAng={280} />
        <StoppedClockItem x={410} y={410} kind="alarm" s={0.95} hAng={75} mAng={195} />
        {/* Glass jars of glowing brass watch gears */}
        {[465, 498, 825, 862].map((jx, i) => (
          <g key={`jar${i}`} transform={`translate(${jx} 410)`}>
            <rect x={-13} y={-44} width={26} height={44} rx={5} fill="#8AB4C8" opacity={0.28} stroke={INK} strokeWidth={2} />
            <circle cx={-3} cy={-14} r={6} fill="#D4A24C" />
            <circle cx={5} cy={-22} r={5} fill="#C89B4B" />
            <circle cx={-2} cy={-28} r={4} fill="#E2B857" />
            <rect x={-14} y={-50} width={28} height={7} rx={2} fill="#4A2E22" stroke={INK} strokeWidth={2} />
          </g>
        ))}
        <StoppedClockItem x={585} y={410} kind="octagon" s={1.05} hAng={330} mAng={140} />
        <StoppedClockItem x={665} y={410} kind="alarm" s={0.9} hAng={260} mAng={85} />
        <StoppedClockItem x={735} y={410} kind="mantle" s={0.95} hAng={45} mAng={220} />
        <StoppedClockItem x={925} y={410} kind="pendulum" s={0.8} hAng={160} mAng={340} />
        {/* Hanging brass pocket watches from shelf underside */}
        {[360, 620, 890].map((px, i) => (
          <g key={`pw${i}`} transform={`translate(${px} 295)`}>
            <line x1={0} y1={14} x2={0} y2={38} stroke="#C89B4B" strokeWidth={1.8} />
            <circle cx={0} cy={47} r={9} fill="#E6D8B8" stroke="#C89B4B" strokeWidth={2.5} />
            <line x1={0} y1={47} x2={4} y2={43} stroke={INK} strokeWidth={1.5} />
          </g>
        ))}

        {/* Row 3 (y = 525): Mysterious numbered wooden apothecary/parts drawers + cassette stacks + oil cans */}
        {Array.from({ length: 6 }).map((_, i) => {
          const dx = 294 + i * 76;
          return (
            <g key={`drw${i}`} transform={`translate(${dx} 432)`}>
              <rect x={0} y={0} width={70} height={42} rx={3} fill="#3E251D" stroke={INK} strokeWidth={2.2} />
              <rect x={20} y={8} width={30} height={11} rx={1.5} fill="#DFD2B8" />
              <circle cx={35} cy={29} r={3.5} fill="#C89B4B" />
              <rect x={0} y={46} width={70} height={42} rx={3} fill="#382018" stroke={INK} strokeWidth={2.2} />
              <rect x={20} y={54} width={30} height={11} rx={1.5} fill="#DFD2B8" />
              <circle cx={35} cy={75} r={3.5} fill="#C89B4B" />
            </g>
          );
        })}
        {/* Cassette tapes & soldering spool on right of Row 3 */}
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={`cas${i}`}
            x={805 + (i % 2) * 58}
            y={505 - Math.floor(i / 2) * 16}
            width={50}
            height={14}
            rx={2}
            fill={i % 2 ? '#3A4A5E' : '#6E4238'}
            stroke={INK}
            strokeWidth={2}
          />
        ))}
        <StoppedClockItem x={955} y={525} kind="alarm" s={1.0} hAng={85} mAng={275} />
      </g>

      {/* Large stopped octagonal wall clock & vintage block calendar between shelf and rear workbench */}
      <g transform="translate(1105 255)">
        <polygon
          points="-26,-56 26,-56 54,-28 54,24 26,52 -26,52 -54,24 -54,-28"
          fill="#4E2D20"
          stroke={INK}
          strokeWidth={4}
        />
        <circle cx={0} cy={-2} r={38} fill="#EFE2CC" stroke="#C89B4B" strokeWidth={3} />
        <line x1={0} y1={-2} x2={-18} y2={-16} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <line x1={0} y1={-2} x2={22} y2={14} stroke={INK} strokeWidth={3} strokeLinecap="round" />
        <circle cx={0} cy={-2} r={4} fill="#B83A32" />
      </g>
      <CalendarBlock x={1105} y={415} w={74} day="14" month="THÁNG 10" />

      {/* ===================================================================== */}
      {/* REAR RIGHT: ÔNG LỘC'S REPAIR WORKBENCH (`bàn sửa + đèn vàng`, y=725) */}
      {/* ===================================================================== */}
      <g transform="translate(1355 715)">
        <ellipse cx={0} cy={8} rx={230} ry={16} fill="#000" opacity={0.45} />
        {/* Pegboard & tool rack on wall above workbench */}
        <rect x={-195} y={-445} width={390} height={210} rx={4} fill="#281E22" stroke={INK} strokeWidth={3.5} />
        {/* Hanging screwdrivers, pliers, keys & watch straps on pegboard */}
        {[-155, -120, -85, -45, 10, 55, 95, 140].map((tx, i) => (
          <g key={`tl${i}`} transform={`translate(${tx} -415)`}>
            <rect x={-5} y={0} width={10} height={24} rx={3} fill={i % 2 ? '#C2453E' : '#D4A24C'} stroke={INK} strokeWidth={2} />
            <line x1={0} y1={24} x2={0} y2={58 + (i % 3) * 14} stroke="#94A3B8" strokeWidth={3} strokeLinecap="round" />
          </g>
        ))}
        {/* Upper shelf on pegboard with oscilloscope / multimeter & parts bins */}
        <rect x={-190} y={-310} width={380} height={10} fill="#4E3024" stroke={INK} strokeWidth={2.5} />
        <rect x={-165} y={-368} width={88} height={58} rx={4} fill="#36454F" stroke={INK} strokeWidth={2.5} />
        <rect x={-155} y={-358} width={52} height={36} rx={2} fill="#1B2E28" />
        <path d="M -150 -340 L -135 -340 L -128 -350 L -120 -330 L -112 -340 L -106 -340" stroke="#5CE6B8" strokeWidth={1.8} fill="none" />
        <StoppedClockItem x={-20} y={-310} kind="mantle" s={0.95} hAng={290} mAng={110} />
        <StoppedClockItem x={65} y={-310} kind="alarm" s={0.9} hAng={15} mAng={180} />
        <rect x={115} y={-352} width={62} height={42} rx={3} fill="#6E4230" stroke={INK} strokeWidth={2.5} />

        {/* Workbench legs & cluttered lower shelf */}
        <rect x={-205} y={-195} width={22} height={195} fill="#38221A" stroke={INK} strokeWidth={3} />
        <rect x={183} y={-195} width={22} height={195} fill="#38221A" stroke={INK} strokeWidth={3} />
        <rect x={-195} y={-75} width={390} height={12} fill="#462A20" stroke={INK} strokeWidth={2.5} />
        {/* Cardboard boxes & old radio chassis under bench */}
        <rect x={-160} y={-135} width={95} height={60} rx={3} fill="#7A5C44" stroke={INK} strokeWidth={2.5} />
        <rect x={45} y={-125} width={110} height={50} rx={3} fill="#4A5568" stroke={INK} strokeWidth={2.5} />
        {/* Workbench tabletop */}
        <rect x={-218} y={-212} width={436} height={20} rx={4} fill="#6E4432" stroke={INK} strokeWidth={3.5} />
        <line x1={-212} y1={-210} x2={212} y2={-210} stroke={WARM_RIM} strokeWidth={2.5} opacity={0.7} />

        {/* Clutter on workbench: soldering station, magnifying loupe, tray of screws */}
        <rect x={-65} y={-232} width={52} height={20} rx={3} fill="#2D3748" stroke={INK} strokeWidth={2} />
        <path d="M -35 -232 L -15 -262" stroke="#CBD5E1" strokeWidth={3} strokeLinecap="round" />
        <rect x={15} y={-224} width={78} height={12} rx={2} fill="#94A3B8" stroke={INK} strokeWidth={2} />

        {/* Warm amber articulated banker's lamp on rear workbench (`đèn bàn vàng`) */}
        <g transform="translate(-145 -212)">
          <rect x={-24} y={-10} width={48} height={10} rx={4} fill="#C89B4B" stroke={INK} strokeWidth={2.5} />
          <path d="M 0 -10 L -24 -82 L 38 -132" stroke="#C89B4B" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 22 -140 L 64 -140 L 82 -106 L 8 -106 Z" fill="#2E6B56" stroke={INK} strokeWidth={3} />
          <ellipse cx={45} cy={-106} rx={36} ry={6} fill="#FFE8A8" />
          <Cone d="M 15 -106 L 75 -106 L 240 10 L -95 10 Z" o={0.38} />
          <Glow x={55} y={-70} r={260} o={0.65} />
        </g>

        {/* Technician stool (`ghế thợ`) tucked behind workbench */}
        <g transform="translate(10 -15)">
          <rect x={-28} y={-88} width={56} height={10} rx={3} fill="#5C3A2C" stroke={INK} strokeWidth={2.5} />
          <rect x={-22} y={-78} width={8} height={78} fill="#38221A" stroke={INK} strokeWidth={2} />
          <rect x={14} y={-78} width={8} height={78} fill="#38221A" stroke={INK} strokeWidth={2} />
        </g>
      </g>

      {/* ===================================================================== */}
      {/* LEFT WALL (`kệ tây` + `quạt gắn tường phía trái chạy nhẹ`)            */}
      {/* ===================================================================== */}
      <g>
        {/* Left wall shelf with old radio, screw boxes & disassembled phones */}
        <polygon points="-40,480 205,410 205,426 -40,498" fill="#583628" stroke={INK} strokeWidth={3} />
        <polygon points="-40,630 205,540 205,556 -40,648" fill="#583628" stroke={INK} strokeWidth={3} />
        {/* Vintage radio on left shelf */}
        <g transform="translate(85 438) rotate(-14)">
          <rect x={-46} y={-54} width={92} height={54} rx={6} fill="#7A4C38" stroke={INK} strokeWidth={3} />
          <rect x={-36} y={-42} width={46} height={30} rx={3} fill="#D8C8A8" />
          <circle cx={24} cy={-32} r={7} fill="#241E1C" />
          <circle cx={24} cy={-16} r={5} fill="#C89B4B" />
        </g>
        {/* Screw boxes (`hộp vít`) & coiled wire on lower left shelf */}
        <rect x={25} y={548} width={58} height={34} rx={3} fill="#3B5B78" stroke={INK} strokeWidth={2.5} transform="rotate(-18 54 565)" />
        <rect x={95} y={525} width={52} height={30} rx={3} fill="#8C4A3E" stroke={INK} strokeWidth={2.5} transform="rotate(-18 121 540)" />

        {/* Wall-mounted oscillating fan (`quạt gắn tường phía trái chạy nhẹ`) */}
        <g transform="translate(115 265)">
          <rect x={-14} y={0} width={28} height={42} rx={5} fill="#94A3B8" stroke={INK} strokeWidth={3} />
          <path d="M 0 18 L 38 -8" stroke="#64748B" strokeWidth={8} strokeLinecap="round" />
          <g transform="translate(46 -16)">
            <circle cx={0} cy={0} r={54} fill="#CBD5E1" opacity={0.14} stroke="#475569" strokeWidth={3.5} />
            <g transform={`rotate(${fanRot})`}>
              {[0, 120, 240].map((ang) => (
                <path
                  key={ang}
                  transform={`rotate(${ang})`}
                  d="M 0 0 Q -18 -28 -6 -46 Q 14 -48 18 -28 Q 12 -10 0 0 Z"
                  fill="#4A7A8C"
                  opacity={0.82}
                  stroke={INK}
                  strokeWidth={2}
                />
              ))}
            </g>
            <circle cx={0} cy={0} r={14} fill="#D8D2C5" stroke={INK} strokeWidth={2.5} />
          </g>
        </g>
      </g>

      {/* ===================================================================== */}
      {/* RIGHT WALL: ALLEY DOORWAY (`CỬA RA HẺM`, cold blue-white night light) */}
      {/* ===================================================================== */}
      <g>
        {/* Alley opening on right wall */}
        <polygon points="1690,185 1965,85 1965,910 1690,745" fill="#0E1726" stroke={INK} strokeWidth={4} />
        {/* Night alley details outside: brick wall, electric wires, distant cold streetlamp */}
        <polygon points="1695,380 1960,310 1960,895 1695,742" fill="#162236" />
        <circle cx={1835} cy={225} r={18} fill="#D8ECFF" />
        <Glow x={1835} y={225} r={220} kind="cool" o={0.65} />
        <path d="M 1695 250 Q 1820 285 1960 240 M 1695 268 Q 1820 305 1960 258" stroke="#090D16" strokeWidth={2.5} fill="none" />
        {/* Traditional Vietnamese folding iron accordion gate (`cửa sắt kéo`) pulled partially to the side */}
        {Array.from({ length: 5 }).map((_, i) => {
          const gx = 1692 + i * 16;
          return (
            <g key={`gate${i}`}>
              <line x1={gx} y1={182 - i * 5} x2={gx} y2={748 + i * 8} stroke="#2B3648" strokeWidth={3.5} />
              {Array.from({ length: 7 }).map((__, j) => {
                const gy = 220 + j * 72;
                return (
                  <path
                    key={j}
                    d={`M ${gx} ${gy} L ${gx + 16} ${gy + 36} L ${gx} ${gy + 72}`}
                    stroke="#3B4A62"
                    strokeWidth={2}
                    fill="none"
                  />
                );
              })}
            </g>
          );
        })}
        {/* Cold alley light spill across the right floor */}
        <polygon points="1690,745 1965,910 1420,1040 1240,785" fill={`url(#${id}AlleyCold)`} style={{ mixBlendMode: 'screen' }} />
      </g>

      {/* Soft overhead ceiling bulb in the center of the shop (`một bóng trần dịu đủ đọc mặt hai khách`) */}
      <g transform="translate(940 40)">
        <line x1={0} y1={0} x2={0} y2={105} stroke={INK} strokeWidth={3.5} />
        <path d="M -38 105 L 38 105 L 56 128 L -56 128 Z" fill="#2A2430" stroke={INK} strokeWidth={3} />
        <ellipse cx={0} cy={128} rx={54} ry={7} fill="#FFE2A8" />
        <Glow x={0} y={145} r={420} o={0.38} />
      </g>

      {/* Ambient occlusion at wall/ceiling/floor joints + LightVeil darkening unlit corners of the shop */}
      <RoomCorners x0={220} x1={1660} y0={130} y1={715} />
      {veil > 0 ? (
        <LightVeil
          id={`${id}Veil`}
          lights={[
            [1265, 535, 360], // Rear workbench warm lamp
            [940, 215, 330],  // Soft overhead bulb
            [565, 635, 340],  // Counter lamp area
            [1815, 485, 330], // Cold alley gate opening
          ]}
          o={veil}
        />
      ) : null}

      {/* Ambient dust motes floating in the warm lamp beams */}
      <Dust t={t} seed={19} x0={420} y0={280} w={1050} h={520} n={34} o={0.42} />
    </g>
  );
};

/**
 * `OngLocCounter`: The main wooden shop counter (`QUẦY y ≈ 3,3`) drawn in front of Ông Lộc and behind Duy & Thảo.
 * Includes the tray of small parts on the left (`[khay đồ]`), the counter lamp on the far left,
 * the woven repair cloth (`tấm khăn`) in the center, and optional tabletop props
 * (`MotherPhone`, `FamilyPhoto`, `MemoryReceipt`, `SignPen`, `MoneyEnvelope`, `PhoneClothPouch`, `ScrewdriverProp`).
 */
export const OngLocCounter: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  t?: number;
  phoneState?: 'cracked' | 'repaired' | 'none';
  showPhoto?: boolean;
  receiptStage?: 'none' | 'blank' | 'written' | 'signed';
  penOnPaper?: boolean;
  showMoney?: boolean;
  showPouch?: boolean;
}> = ({
  x = 890,
  y = 855,
  w = 880,
  t = 0,
  phoneState = 'cracked',
  showPhoto = true,
  receiptStage = 'blank',
  penOnPaper = true,
  showMoney = true,
  showPouch = true,
}) => {
  const s = w / 880;
  const topY = -205 * s;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* Floor contact shadow */}
      <ellipse cx={0} cy={10 * s} rx={465 * s} ry={22 * s} fill="#000" opacity={0.5} />
      {/* Counter body (`cao khoảng 0.78 m`) */}
      <rect x={-430 * s} y={topY} width={860 * s} height={205 * s} rx={4 * s} fill="#4E2E22" stroke={INK} strokeWidth={4 * s} />
      {/* Right side shadow (away from counter lamp, lit slightly on right edge by cold alley light) */}
      <rect x={120 * s} y={topY} width={310 * s} height={205 * s} fill="#000" opacity={0.22} />
      <line x1={428 * s} y1={topY} x2={428 * s} y2={0} stroke={COOL_RIM} strokeWidth={2.5 * s} opacity={0.45} />
      {/* Recessed weathered wood panels & brass corner brackets */}
      {[-280, 0, 280].map((px, i) => (
        <g key={i} transform={`translate(${px * s} 0)`}>
          <rect
            x={-118 * s}
            y={topY + 26 * s}
            width={236 * s}
            height={152 * s}
            rx={4 * s}
            fill="#3B2118"
            stroke="#6A4232"
            strokeWidth={2.5 * s}
          />
          <rect x={-98 * s} y={topY + 42 * s} width={196 * s} height={120 * s} fill="none" stroke="#28150F" strokeWidth={1.5 * s} />
        </g>
      ))}
      {/* Countertop plank with perspective depth */}
      <polygon
        points={`${-448 * s},${topY} ${448 * s},${topY} ${426 * s},${topY - 34 * s} ${-426 * s},${topY - 34 * s}`}
        fill="#6A4130"
        stroke={INK}
        strokeWidth={3.5 * s}
        strokeLinejoin="round"
      />
      <rect x={-448 * s} y={topY} width={896 * s} height={18 * s} rx={3 * s} fill="#7E4F3B" stroke={INK} strokeWidth={3.5 * s} />
      <line x1={-442 * s} y1={topY + 2 * s} x2={442 * s} y2={topY + 2 * s} stroke={WARM_RIM} strokeWidth={2.5 * s} opacity={0.75} />

      {/* Left of counter: `[khay đồ]` (compartment tray of watch parts, screwdriver & counter lamp) */}
      <g transform={`translate(${-335 * s} ${topY - 14 * s})`}>
        <polygon
          points={`${-75 * s},${8 * s} ${65 * s},${8 * s} ${78 * s},${-14 * s} ${-62 * s},${-14 * s}`}
          fill="#3E2723"
          stroke={INK}
          strokeWidth={2.5 * s}
        />
        <line x1={-25 * s} y1={8 * s} x2={-12 * s} y2={-14 * s} stroke={INK} strokeWidth={2 * s} />
        <line x1={22 * s} y1={8 * s} x2={35 * s} y2={-14 * s} stroke={INK} strokeWidth={2 * s} />
        <circle cx={-42 * s} cy={-3 * s} r={5 * s} fill="#D4A24C" />
        <circle cx={4 * s} cy={-4 * s} r={4 * s} fill="#CBD5E1" />
        <circle cx={46 * s} cy={-3 * s} r={5 * s} fill="#C89B4B" />
      </g>
      <ScrewdriverProp x={-235 * s} y={topY - 12 * s} s={0.78 * s} rot={14} />

      {/* Articulated brass counter lamp on far-left corner */}
      <g transform={`translate(${-395 * s} ${topY - 10 * s})`}>
        <ellipse cx={0} cy={0} rx={26 * s} ry={7 * s} fill="#2A2430" stroke={INK} strokeWidth={2.5 * s} />
        <path
          d={`M 0 ${-4 * s} L ${-22 * s} ${-86 * s} L ${38 * s} ${-134 * s}`}
          stroke="#4A3E36"
          strokeWidth={6.5 * s}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={-22 * s} cy={-86 * s} r={6 * s} fill="#D4A24C" />
        <path
          d={`M ${22 * s} ${-142 * s} L ${58 * s} ${-142 * s} L ${76 * s} ${-110 * s} L ${8 * s} ${-110 * s} Z`}
          fill="#385E54"
          stroke={INK}
          strokeWidth={3 * s}
        />
        <ellipse cx={42 * s} cy={-110 * s} rx={32 * s} ry={6 * s} fill="#FFE8A8" />
        <Cone
          d={`M ${16 * s} ${-110 * s} L ${68 * s} ${-110 * s} L ${340 * s} ${10 * s} L ${-30 * s} ${10 * s} Z`}
          o={0.28 * (0.96 + 0.04 * Math.sin(t / 10))}
        />
        <Glow x={60 * s} y={-60 * s} r={220 * s} o={0.5} />
      </g>

      {/* Center of counter: woven cloth (`tấm khăn`), `MotherPhone`, `FamilyPhoto` (left of phone), `MemoryReceipt` (right of phone) */}
      {showPhoto ? <FamilyPhoto x={-165 * s} y={topY - 14 * s} w={68 * s} rot={-8} flat /> : null}
      {phoneState !== 'none' ? (
        <MotherPhone
          x={-45 * s}
          y={topY - 14 * s}
          w={92 * s}
          rot={4}
          flat
          onCloth
          cracked={phoneState === 'cracked' ? 1 : 0}
          screenOn={phoneState === 'repaired' ? 1 : 0}
          f={t}
        />
      ) : null}
      {receiptStage !== 'none' ? (
        <g>
          <MemoryReceipt x={95 * s} y={topY - 14 * s} w={92 * s} rot={3} stage={receiptStage} flat />
          {penOnPaper ? (
            <SignPen x={102 * s} y={topY - 16 * s} s={0.72 * s} rot={-22} />
          ) : (
            <SignPen x={42 * s} y={topY - 8 * s} s={0.72 * s} rot={8} />
          )}
        </g>
      ) : null}
      {/* Duy's money envelope (186.000đ) + Thảo's 2 folded 20.000đ bills & cloth pouch on right of counter */}
      {showMoney ? <MoneyEnvelope x={225 * s} y={topY - 12 * s} s={0.76 * s} rot={-8} withThaoBills flat /> : null}
      {showPouch ? <PhoneClothPouch x={335 * s} y={topY - 10 * s} s={0.82 * s} rot={12} /> : null}
    </g>
  );
};

/**
 * `CustomerStool` (`ghế gỗ thấp cho khách trước quầy`):
 * - Standard stool (`withFootrest = false`): for 16yo Duy so his feet touch the floor.
 * - Stool with upper footrest (`withFootrest = true`): for 8yo Thảo (`ghế Thảo có bậc để chân cao hơn để chân bé không lửng lơ`).
 */
export const CustomerStool: React.FC<{ x: number; y: number; s?: number; withFootrest?: boolean }> = ({
  x,
  y,
  s = 1,
  withFootrest = false,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={52} ry={10} fill="#000" opacity={0.42} />
    <rect x={-34} y={-84} width={10} height={84} fill="#3E251B" stroke={INK} strokeWidth={2.5} />
    <rect x={24} y={-84} width={10} height={84} fill="#3E251B" stroke={INK} strokeWidth={2.5} />
    <rect x={-26} y={-76} width={8} height={72} fill="#2A1812" stroke={INK} strokeWidth={2} />
    <rect x={18} y={-76} width={8} height={72} fill="#2A1812" stroke={INK} strokeWidth={2} />
    <rect x={-30} y={-32} width={60} height={7} fill="#4E2E22" stroke={INK} strokeWidth={2} />
    {withFootrest ? (
      <g>
        {/* Elevated wooden footrest bar (`bậc gác chân cho bé Thảo 8 tuổi`) */}
        <rect x={-38} y={-54} width={76} height={9} rx={2.5} fill="#6A4130" stroke={INK} strokeWidth={2.4} />
        <line x1={-34} y1={-52} x2={34} y2={-52} stroke={WARM_RIM} strokeWidth={1.6} opacity={0.55} />
      </g>
    ) : null}
    <rect x={-44} y={-96} width={88} height={14} rx={4} fill="#6E4432" stroke={INK} strokeWidth={3} />
    <line x1={-40} y1={-94} x2={40} y2={-94} stroke={WARM_RIM} strokeWidth={2} opacity={0.6} />
  </g>
);

/**
 * `OngLocForeground`: 2.5D near foreground layer (`kệ gỗ tiền cảnh` on left + `mép cửa sắt` on right)
 * for true parallax when the camera slides horizontally in `C1-C` and `C4-B`.
 */
export const OngLocForeground: React.FC<{ shiftX?: number }> = ({ shiftX = 0 }) => (
  <g transform={`translate(${shiftX} 0)`}>
    {/* Left foreground wooden shelf silhouette (`kệ gỗ tiền cảnh`) */}
    <g opacity={0.94}>
      <rect x={-90} y={80} width={220} height={1020} fill="#0F0B13" stroke="#261C28" strokeWidth={4} />
      <rect x={-70} y={320} width={235} height={22} rx={3} fill="#1B131C" stroke="#362620" strokeWidth={2.5} />
      <rect x={-70} y={640} width={235} height={22} rx={3} fill="#1B131C" stroke="#362620" strokeWidth={2.5} />
      {/* Silhouetted antique clock & oil can on foreground shelf */}
      <path d="M 10 320 L 18 235 Q 58 205 98 235 L 106 320 Z" fill="#17111A" stroke="#322320" strokeWidth={2.5} />
      <circle cx={58} cy={272} r={22} fill="#261E24" stroke="#4A342A" strokeWidth={2} />
      {/* Hanging pocket watch from foreground shelf */}
      <line x1={125} y1={342} x2={125} y2={405} stroke="#6E5238" strokeWidth={2.5} />
      <circle cx={125} cy={422} r={18} fill="#1B141E" stroke="#7A5A3C" strokeWidth={3} />
    </g>
    {/* Right foreground doorway edge (`mép khung cửa ra hẻm`) */}
    <rect x={1835} y={-40} width={140} height={1160} fill="#0D0B12" />
    <line x1={1835} y1={-40} x2={1835} y2={1120} stroke={COOL_RIM} strokeWidth={2.5} opacity={0.35} />
  </g>
);

/**
 * `OngLocCounterInsert`: 35°–40° angled close-up / insert tabletop surface (`C1-B`, `C2-B`, `C3-C`, `C4-A`, `C5-B`, `C5-C`, `C6-C`).
 * Renders the rich wood-grain counter surface, the woven repair cloth (`tấm khăn`), warm lamp pool,
 * and configurable positions for `MotherPhone`, `FamilyPhoto`, `MemoryReceipt`, `SignPen`, `LeatherWallet`, `MoneyEnvelope`, and `PhoneClothPouch`.
 */
export const OngLocCounterInsert: React.FC<{
  t?: number;
  phoneRot?: number;
  cracked?: number;
  screenOn?: number;
  playing?: number;
  showPhoto?: boolean;
  photoX?: number;
  receiptStage?: 'none' | 'blank' | 'written' | 'signed';
  receiptX?: number;
  penOnPaper?: boolean;
  showWallet?: boolean;
  showMoney?: boolean;
  showPouch?: boolean;
}> = ({
  t = 0,
  phoneRot = -8,
  cracked = 1,
  screenOn = 0,
  playing = 0,
  showPhoto = true,
  photoX = 520,
  receiptStage = 'signed',
  receiptX = 1360,
  penOnPaper = false,
  showWallet = false,
  showMoney = true,
  showPouch = true,
}) => (
  <g>
    {/* Deep dark shop background above the counter back edge */}
    <rect x={0} y={0} width={1920} height={1080} fill="#151019" />
    {/* Countertop surface in 38° downward perspective */}
    <polygon points="-200,210 2120,210 2300,1080 -380,1080" fill="#5A3628" stroke={INK} strokeWidth={5} />
    {/* Wood plank lines & grain */}
    {[340, 510, 710, 930].map((py, i) => (
      <line key={i} x1={-300} y1={py} x2={2220} y2={py} stroke="#3E2318" strokeWidth={3} opacity={0.65} />
    ))}
    <line x1={-200} y1={214} x2={2120} y2={214} stroke={WARM_RIM} strokeWidth={3} opacity={0.6} />

    {/* Tray of tiny watch gears & screws peeking at top-left edge + Ông Lộc's screwdriver */}
    <g transform="translate(240 265) rotate(-6)">
      <rect x={-140} y={-55} width={260} height={110} rx={6} fill="#38221A" stroke={INK} strokeWidth={4} />
      <rect x={-128} y={-44} width={112} height={88} fill="#281712" />
      <rect x={-6} y={-44} width={114} height={88} fill="#281712" />
      {[-85, -55, -35, 25, 65, 82].map((gx, i) => (
        <circle key={i} cx={gx} cy={(i % 2 ? -12 : 16)} r={8 + (i % 3) * 3} fill="#D4A24C" stroke={INK} strokeWidth={2} />
      ))}
    </g>
    <ScrewdriverProp x={460} y={295} s={1.85} rot={16} />

    {/* Woven repair cloth (`tấm khăn trải giữa quầy`) under the phone */}
    <g transform="translate(940 585) rotate(-2)">
      <polygon
        points="-260,-155 270,-145 310,165 -290,155"
        fill="#6E5242"
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <polygon
        points="-238,-135 248,-125 282,142 -264,132"
        fill="#826452"
        stroke="#A48470"
        strokeWidth={2}
        strokeDasharray="8 5"
      />
    </g>

    {/* Optional wallet on far left (`C2-B` / `C5-B`) */}
    {showWallet ? <LeatherWallet x={275} y={770} s={2.0} rot={16} open /> : null}

    {/* Money envelope (186.000đ) + Thảo's 2 folded 20.000đ bills */}
    {showMoney ? <MoneyEnvelope x={555} y={855} s={1.95} rot={-8} withThaoBills /> : null}

    {/* Cloth pouch for Mother's phone */}
    {showPouch ? <PhoneClothPouch x={1650} y={335} s={1.9} rot={14} /> : null}

    {/* Family Photo (`ảnh ở trái điện thoại theo góc nhìn của khách`) */}
    {showPhoto ? <FamilyPhoto x={photoX} y={565} w={230} rot={-7} /> : null}

    {/* Mother's Phone on the cloth in center */}
    <MotherPhone
      x={945}
      y={575}
      w={210}
      rot={phoneRot}
      flat={false}
      cracked={cracked}
      screenOn={screenOn}
      playing={playing}
      f={t}
    />

    {/* Memory Receipt (`biên nhận 2 liên ở phải, trước mặt Duy`) */}
    {receiptStage !== 'none' ? (
      <g>
        <MemoryReceipt x={receiptX} y={590} w={270} rot={4} stage={receiptStage} />
        {penOnPaper ? (
          <SignPen x={receiptX + 20} y={570} s={2.1} rot={-28} />
        ) : (
          <SignPen x={receiptX - 185} y={665} s={2.1} rot={6} />
        )}
      </g>
    ) : null}

    {/* Darkened edges around the warm desk-lamp pool */}
    <LightVeil id="insertVeil" lights={[[920, 560, 740]]} o={0.48} />
    <Glow x={880} y={540} r={680} o={0.42} />
  </g>
);

// ----------------------------------------------------------------------------
// ENVIRONMENT 2: NHÀ CỦA 2 ANH EM DUY & THẢO (`SET-NHA` — Ấm cúng vùng sáng, tối vùng khuất + Bóng người bố phòng sau)
// ----------------------------------------------------------------------------

/**
 * `FatherSilhouette` (`CHAR-BO-SHADOW` — Nhân vật người bố chỉ xuất hiện kiểu hình bóng và âm thanh không quá nổi bật):
 * Renders the recessed, unlit back-room doorway (`lối thông phòng sau khuất vách`) where the Father is only
 * a muted, low-contrast shadow/silhouette behind a semi-drawn curtain, accompanied by a dark glass bottle
 * lying on the floor and a subtle muffled sound wave indicator (`tiếng chai lăn nhẹ, giọng càm ràm khàn đục phòng sau`).
 */
export const FatherSilhouette: React.FC<{
  x?: number;
  y?: number;
  s?: number;
  t?: number;
  soundCue?: boolean;
}> = ({ x = 285, y = 710, s = 1, t = 0, soundCue = true }) => {
  const sway = Math.sin(t / 18) * 2.5;
  const roll = Math.sin(t / 12) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* Recessed dark back-room doorway (`lối phòng sau không bật đèn`) */}
      <rect x={-72} y={-345} width={144} height={345} rx={3} fill="#1E1410" stroke={INK} strokeWidth={3.5} />
      {/* Dim moonlit/corridor-backlit wall inside back room so the dark shadow silhouette reads through LightVeil */}
      <rect x={-66} y={-338} width={132} height={332} fill="#5C4738" opacity={0.85} />
      <rect x={-66} y={-78} width={132} height={72} fill="#36271E" opacity={0.9} />
      {/* Faint louver slats deep inside the back room */}
      {[-285, -267, -249, -231].map((ly, i) => (
        <line key={i} x1={-46} y1={ly} x2={48} y2={ly} stroke="#8A6E58" strokeWidth={2.5} opacity={0.55} />
      ))}

      {/* Subtle, low-contrast silhouette/shadow of the Father (`hình bóng người bố khuất nửa sau vách, không sắc nét`) */}
      <g transform={`translate(${10 + sway} -62)`} opacity={0.92}>
        {/* Soft cast wall shadow behind him */}
        <path
          d="M -38 62 L -32 -98 Q -28 -146 6 -152 Q 40 -146 46 -94 L 50 62 Z"
          fill="#1F1510"
          opacity={0.75}
        />
        {/* Slumped shoulders, slightly bowed head & arm resting near a low table in the dark back room */}
        <path
          d="M -28 62 L -22 -68 Q -20 -104 4 -108 Q 28 -104 34 -64 L 30 62 Z"
          fill="#070504"
        />
        {/* Bowed head & tousled hair silhouette */}
        <ellipse cx={8} cy={-126} rx={18} ry={21} fill="#070504" transform="rotate(12 8 -126)" />
        {/* Bent arm silhouette resting near bottle/table */}
        <path d="M 20 -82 Q 46 -58 36 -26" stroke="#070504" strokeWidth={13} strokeLinecap="round" fill="none" />
      </g>

      {/* Semi-drawn fabric doorway curtain (`rèm vải buông nửa lối phòng sau`) partially veiling the left side */}
      <line x1={-76} y1={-348} x2={76} y2={-348} stroke="#4A2E20" strokeWidth={5} />
      <path
        d="M -70 -345 L -6 -345 Q -18 -210 -32 -125 Q -44 -55 -58 0 L -70 0 Z"
        fill="#2C1D16"
        stroke={INK}
        strokeWidth={2.2}
        opacity={0.95}
      />
      <path d="M -52 -345 Q -36 -200 -48 0" stroke="#140C09" strokeWidth={1.8} fill="none" opacity={0.75} />

      {/* Wooden doorway frame molding */}
      <path d="M -72 0 L -72 -345 L 72 -345 L 72 0" fill="none" stroke="#5A3828" strokeWidth={7} />

      {/* Empty bottle lying on its side near the back-room threshold (`tiếng chai lăn nhẹ trên nền gạch`) */}
      <g transform={`translate(${16 + roll} 14) rotate(12)`}>
        <ellipse cx={0} cy={3} rx={22} ry={5} fill="#000" opacity={0.5} />
        <rect x={-18} y={-5} width={26} height={10} rx={3} fill="#355E4B" stroke={INK} strokeWidth={1.8} />
        <path d="M 8 -4 L 18 -2 L 18 2 L 8 4 Z" fill="#355E4B" stroke={INK} strokeWidth={1.6} />
        <rect x={-10} y={-4} width={9} height={8} fill="#C2AB8C" opacity={0.8} />
      </g>

      {/* Subtle, non-intrusive acoustic wave arcs (`âm thanh khàn đục / tiếng chai lăn không quá nổi bật`) */}
      {soundCue ? (
        <g opacity={0.65} fill="none" stroke="#E5CCA8" strokeLinecap="round">
          <path d="M 40 -118 Q 52 -108 40 -98" strokeWidth={2.2} />
          <path d="M 48 -124 Q 64 -108 48 -92" strokeWidth={1.6} strokeDasharray="3 3" />
          <path d="M 42 6 Q 52 14 42 22" strokeWidth={2} />
        </g>
      ) : null}
    </g>
  );
};

/**
 * `MotherThaoHouse` (`SET-NHA` — Nhà hai anh em Duy & Thảo ở Cảnh 7):
 * - Warm & cozy in the lit areas (`tạo cảm giác ấm cúng`): warm golden-amber pendant lamp over the dining table & rug,
 *   Mother's ancestral altar with warm lamps on the right wall, warm kitchen doorway (`BẾP`).
 * - Noticeably darkened in areas where light does not reach (`ánh sáng trong phòng hơi tối lại những chỗ không có ánh sáng chiếu đến`):
 *   controlled by `veil` (`LightVeil`) + `RoomCorners` + directional shadow falloff over the unlit sewing corner, upper walls, and back room.
 * - Father character (`showFatherShadow = true`): appears only as a subtle shadow/silhouette + rolling bottle in the unlit back-left room (`FatherSilhouette`).
 */
export const MotherThaoHouse: React.FC<{
  t?: number;
  id?: string;
  kitchenLightOn?: number;
  toteHung?: boolean;
  keysHung?: boolean;
  bowlsLocation?: 'cabinet' | 'counter';
  showFatherShadow?: boolean;
  veil?: number;
}> = ({
  t = 0,
  id = 'nha',
  kitchenLightOn = 1,
  toteHung = true,
  keysHung = true,
  bowlsLocation = 'cabinet',
  showFatherShadow = true,
  veil = 0.62,
}) => {
  const lights: [number, number, number][] = [
    [980, 170, 260],  // Warm rattan pendant lamp shade
    [980, 680, 440],  // Warm cozy pool over dining table & rug
    [1545, 535, 360], // Mother's ancestral altar warm glow
    [1545, 765, 250], // Altar lower warm pool
  ];
  if (kitchenLightOn > 0.05) {
    lights.push([1020, 395, 340 * kitchenLightOn]); // Warm kitchen interior light
  }

  return (
    <g>
      <defs>
        {/* Warm cream-amber Vietnamese plaster walls */}
        <linearGradient id={`${id}Wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A362B" />
          <stop offset="55%" stopColor="#3F2D24" />
          <stop offset="100%" stopColor="#31221B" />
        </linearGradient>
        {/* Warm terracotta-honey ceramic floor tiles */}
        <linearGradient id={`${id}Floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4E3529" />
          <stop offset="100%" stopColor="#322119" />
        </linearGradient>
        {/* Warm honey wood wainscot / lower wall trim */}
        <linearGradient id={`${id}Wainscot`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#422B20" />
          <stop offset="100%" stopColor="#2F1E16" />
        </linearGradient>
        {/* Directional shadow gradient for unlit left corner & ceiling */}
        <linearGradient id={`${id}UnlitLeft`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#070408" stopOpacity={0.76} />
          <stop offset="55%" stopColor="#070408" stopOpacity={0.38} />
          <stop offset="100%" stopColor="#070408" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Room shell */}
      <rect x={-300} y={-200} width={2520} height={1480} fill="#18110E" />
      {/* Back wall (warm golden-ochre plaster) */}
      <rect x={240} y={135} width={1440} height={575} fill={`url(#${id}Wall)`} stroke={INK} strokeWidth={4} />
      {/* Warm wooden dado rail & lower wall wainscot for cozy lived-in Vietnamese home feel */}
      <rect x={240} y={555} width={512} height={145} fill={`url(#${id}Wainscot)`} stroke={INK} strokeWidth={2.5} />
      <rect x={1288} y={555} width={392} height={145} fill={`url(#${id}Wainscot)`} stroke={INK} strokeWidth={2.5} />
      <line x1={240} y1={555} x2={752} y2={555} stroke="#7A523B" strokeWidth={4} />
      <line x1={1288} y1={555} x2={1680} y2={555} stroke="#7A523B" strokeWidth={4} />

      {/* Left wall (by front entrance & unlit sewing corner) */}
      <polygon points="-100,-30 240,135 240,710 -100,980" fill="#33231B" stroke={INK} strokeWidth={4} />
      {/* Right wall (where Mother's ancestral altar stands) */}
      <polygon points="1680,135 2020,-30 2020,980 1680,710" fill="#38271E" stroke={INK} strokeWidth={4} />
      {/* Ceiling with warm timber beams */}
      <polygon points="-100,-30 2020,-30 1680,135 240,135" fill="#221712" stroke={INK} strokeWidth={3} />
      {[0.3, 0.65].map((k, i) => {
        const cy = -30 + k * 165;
        return <line key={i} x1={-100} y1={cy} x2={2020} y2={cy} stroke="#352219" strokeWidth={10 - i * 2} />;
      })}

      {/* Warm ceramic floor tiles (`nền gạch bông / gạch đỏ ấm cúng nhà Việt Nam`) */}
      <polygon points="-100,980 240,710 1680,710 2020,980" fill={`url(#${id}Floor)`} stroke={INK} strokeWidth={4} />
      {Array.from({ length: 11 }).map((_, i) => {
        const u = i / 10;
        return (
          <line
            key={`nf${i}`}
            x1={240 + u * 1440}
            y1={710}
            x2={-160 + u * 2240}
            y2={1080}
            stroke="#2B1B14"
            strokeWidth={2}
            opacity={0.65}
          />
        );
      })}
      {[760, 820, 890, 975].map((fy, i) => (
        <line key={`nh${i}`} x1={-160} y1={fy} x2={2080} y2={fy} stroke="#2B1B14" strokeWidth={2} opacity={0.65} />
      ))}

      {/* Wooden skirting boards (`len tường gỗ`) */}
      <rect x={240} y={694} width={1440} height={16} fill="#3A2218" stroke={INK} strokeWidth={2.5} />

      {/* ===================================================================== */}
      {/* BACK WALL FAR-LEFT: UNLIT BACK-ROOM DOORWAY & FATHER'S SILHOUETTE     */}
      {/* ===================================================================== */}
      {showFatherShadow ? <FatherSilhouette x={285} y={710} s={0.96} t={t} soundCue /> : null}

      {/* ===================================================================== */}
      {/* BACK WALL MID-LEFT: COZY WINDOW WITH CURTAINS, PLANT & FAMILY PHOTOS  */}
      {/* ===================================================================== */}
      <g transform="translate(555 340)">
        {/* Window frame (`cửa sổ gỗ + bông sắt truyền thống`) */}
        <rect x={-110} y={-115} width={220} height={205} rx={4} fill="#182232" stroke="#5C3A28" strokeWidth={8} />
        {/* Warm moonlight & neighbor window glow outside */}
        <circle cx={-45} cy={-52} r={18} fill="#FFE2A8" opacity={0.22} />
        <rect x={25} y={-38} width={34} height={24} rx={2} fill="#FFB969" opacity={0.28} />
        {/* Wrought-iron diamond security grille (`bông sắt cửa sổ`) */}
        {[-62, 0, 62].map((bx, i) => (
          <g key={i}>
            <line x1={bx} y1={-110} x2={bx} y2={85} stroke="#495668" strokeWidth={3} />
            <polygon points={`${bx},-22 ${bx + 15},0 ${bx},22 ${bx - 15},0`} fill="none" stroke="#495668" strokeWidth={2.5} />
          </g>
        ))}
        <line x1={-105} y1={0} x2={105} y2={0} stroke="#495668" strokeWidth={3} />

        {/* Soft tied-back cream linen curtains (`rèm vải kem ấm áp`) */}
        <line x1={-124} y1={-122} x2={124} y2={-122} stroke="#4A2E20" strokeWidth={5} strokeLinecap="round" />
        <path
          d="M -118 -120 Q -78 -58 -96 15 Q -110 56 -112 96 L -122 96 Z"
          fill="#E8D8C0"
          stroke={INK}
          strokeWidth={2.5}
        />
        <path
          d="M 118 -120 Q 78 -58 96 15 Q 110 56 112 96 L 122 96 Z"
          fill="#E8D8C0"
          stroke={INK}
          strokeWidth={2.5}
        />
        {/* Curtain tiebacks */}
        <line x1={-120} y1={20} x2={-94} y2={24} stroke="#C26D53" strokeWidth={4} strokeLinecap="round" />
        <line x1={120} y1={20} x2={94} y2={24} stroke="#C26D53" strokeWidth={4} strokeLinecap="round" />

        {/* Wooden windowsill with a small potted pothos plant (`chậu cây trầu bà nhỏ`) */}
        <rect x={-122} y={86} width={244} height={14} rx={3} fill="#6E4432" stroke={INK} strokeWidth={3} />
        <g transform="translate(56 86)">
          <polygon points="-15,0 -18,-24 18,-24 15,0" fill="#B85D43" stroke={INK} strokeWidth={2.2} />
          <path d="M 0 -22 Q -20 -40 -26 -26 Q -12 -16 0 -22 Z" fill="#4E8C57" stroke={INK} strokeWidth={1.8} />
          <path d="M 0 -24 Q 6 -48 20 -38 Q 14 -22 0 -24 Z" fill="#5CA065" stroke={INK} strokeWidth={1.8} />
          <path d="M 4 -20 Q 24 -24 28 -8 Q 14 -10 4 -20 Z" fill="#447A4C" stroke={INK} strokeWidth={1.8} />
        </g>
      </g>

      {/* Framed childhood/family photos & Vietnamese block calendar on back wall */}
      <g transform="translate(708 275)">
        <rect x={-26} y={-22} width={52} height={44} rx={3} fill="#5C3A28" stroke={INK} strokeWidth={2.5} />
        <rect x={-20} y={-16} width={40} height={32} fill="#EADBC4" />
        <circle cx={-6} cy={-3} r={5} fill="#8C5840" />
        <circle cx={7} cy={-1} r={4} fill="#6E4E3E" />
        <path d="M -14 13 Q -6 3 2 13 M -2 13 Q 7 5 14 13" stroke="#4A6B82" strokeWidth={2.5} fill="none" />
      </g>
      <g transform="translate(708 342)">
        <rect x={-22} y={-18} width={44} height={36} rx={3} fill="#6E4432" stroke={INK} strokeWidth={2.5} />
        <rect x={-16} y={-12} width={32} height={24} fill="#EFE2CC" />
        <circle cx={0} cy={-2} r={5} fill="#7A4C38" />
        <path d="M -10 10 Q 0 2 10 10" stroke="#C26D53" strokeWidth={2.5} fill="none" />
      </g>
      <CalendarBlock x={1355} y={295} w={74} day="14" month="THÁNG 10" />

      {/* ===================================================================== */}
      {/* BACK WALL CENTER: COZY VIETNAMESE KITCHEN (`BẾP, y≈4–5`)              */}
      {/* ===================================================================== */}
      <g>
        {/* Kitchen room interior behind archway (x = 760..1280, y = 185..710) */}
        <rect
          x={760}
          y={185}
          width={520}
          height={525}
          fill={kitchenLightOn > 0 ? '#4A362A' : '#181312'}
          stroke={INK}
          strokeWidth={4}
        />
        {/* Warm ceramic tiled kitchen splashback */}
        <rect x={775} y={395} width={490} height={115} fill={kitchenLightOn > 0 ? '#6E5340' : '#241C18'} />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`kt${i}`} x1={775 + i * 42} y1={395} x2={775 + i * 42} y2={510} stroke="#3D2B20" strokeWidth={1.5} />
        ))}
        <line x1={775} y1={452} x2={1265} y2={452} stroke="#3D2B20" strokeWidth={1.5} />

        {/* Upper dish cabinet (`tủ bát gỗ ấm áp`) */}
        <rect x={805} y={235} width={245} height={135} rx={4} fill="#6A4330" stroke={INK} strokeWidth={3} />
        <rect x={818} y={247} width={104} height={111} fill="#36241B" stroke="#4A2E20" strokeWidth={2} />
        <rect x={934} y={247} width={104} height={111} fill="#36241B" stroke="#4A2E20" strokeWidth={2} />
        {/* Dish rack bars */}
        <line x1={820} y1={315} x2={1036} y2={315} stroke="#C89B4B" strokeWidth={2.5} />
        {/* Two clean white ceramic bowls (`PROP-BAT`: upturned in cabinet, or moved to counter in C7-C) */}
        {bowlsLocation === 'cabinet' ? (
          <g>
            <CeramicBowl x={860} y={313} s={0.78} upsideDown />
            <CeramicBowl x={902} y={313} s={0.78} upsideDown />
          </g>
        ) : null}
        {/* Stack of plates in right half of cabinet */}
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={985} cy={344 - i * 6} rx={28} ry={4.5} fill="#F2E8D5" stroke={INK} strokeWidth={1.5} />
        ))}

        {/* Small spice shelf & hanging ladles on right side of kitchen wall */}
        <rect x={1085} y={315} width={155} height={10} rx={2} fill="#5C3A28" stroke={INK} strokeWidth={2} />
        {[1105, 1138, 1172, 1205].map((sx, i) => (
          <g key={`sp${i}`} transform={`translate(${sx} 315)`}>
            <rect x={-10} y={-28} width={20} height={28} rx={3} fill={i % 2 ? '#D99B52' : '#C86D51'} stroke={INK} strokeWidth={1.8} />
            <rect x={-11} y={-33} width={22} height={6} rx={1.5} fill="#4A2E20" stroke={INK} strokeWidth={1.5} />
          </g>
        ))}

        {/* Kitchen worktop & lower wooden cupboards (`mặt bếp`) */}
        <rect x={775} y={510} width={490} height={200} fill="#543626" stroke={INK} strokeWidth={3} />
        {[-150, 0, 150].map((cx, i) => (
          <rect
            key={`cb${i}`}
            x={985 + cx - 62}
            y={530}
            width={124}
            height={155}
            rx={3}
            fill="#432A1E"
            stroke="#2E1C14"
            strokeWidth={2}
          />
        ))}
        <rect x={770} y={498} width={500} height={16} rx={3} fill="#A68B71" stroke={INK} strokeWidth={3} />
        {/* Warm rice cooker & iconic red Rạng Đông thermos flask (`phích nước đỏ`) on kitchen counter */}
        <rect x={1150} y={452} width={56} height={46} rx={8} fill="#EFE6D8" stroke={INK} strokeWidth={2.5} />
        <rect x={1158} y={444} width={40} height={10} rx={4} fill="#8C5840" stroke={INK} strokeWidth={2} />
        <circle cx={1178} cy={475} r={4} fill="#E67E22" />
        <rect x={1220} y={430} width={30} height={68} rx={6} fill="#C84638" stroke={INK} strokeWidth={2.5} />
        <rect x={1224} y={420} width={22} height={12} rx={3} fill="#EFE6D8" stroke={INK} strokeWidth={2} />

        {/* Two bowls placed on the kitchen counter during `C7-C` */}
        {bowlsLocation === 'counter' ? (
          <g>
            <CeramicBowl x={910} y={496} s={0.88} />
            <CeramicBowl x={975} y={496} s={0.88} />
          </g>
        ) : null}

        {/* Warm golden kitchen ceiling lamp */}
        <line x1={1020} y1={185} x2={1020} y2={212} stroke={INK} strokeWidth={3} />
        <path d="M 992 212 L 1048 212 L 1060 226 L 980 226 Z" fill="#C88A4B" stroke={INK} strokeWidth={2.2} />
        <ellipse cx={1020} cy={226} rx={28} ry={6} fill={kitchenLightOn > 0 ? '#FFE8A8' : '#475569'} stroke={INK} strokeWidth={2} />
        {kitchenLightOn > 0 ? (
          <>
            <Cone d="M 992 226 L 1048 226 L 1260 700 L 780 700 Z" o={0.28 * kitchenLightOn} />
            <Glow x={1020} y={320} r={390} o={0.65 * kitchenLightOn} />
          </>
        ) : null}
        {kitchenLightOn < 1 ? (
          <rect x={760} y={185} width={520} height={525} fill="#0D0908" opacity={(1 - kitchenLightOn) * 0.78} />
        ) : null}

        {/* Warm wooden archway frame */}
        <path
          d="M 752 710 L 752 178 L 1288 178 L 1288 710"
          fill="none"
          stroke="#5C3A28"
          strokeWidth={16}
          strokeLinejoin="round"
        />

        {/* Wall switch (`PROP-CONGTAC`: `công tắc ở mép trái` of kitchen doorway) */}
        <WallSwitch x={718} y={455} s={1} on={kitchenLightOn > 0.5} />
      </g>

      {/* ===================================================================== */}
      {/* LEFT SIDE: WALL HOOKS (`móc túi/khóa cạnh cửa`) & MOTHER'S SEWING TABLE */}
      {/* ===================================================================== */}
      <g>
        {/* Wall rack near front entrance for tote bag & house keys */}
        <rect x={85} y={335} width={96} height={14} rx={3} fill="#6A4230" stroke={INK} strokeWidth={2.5} transform="rotate(-12 133 342)" />
        <circle cx={108} cy={347} r={4} fill="#D4A24C" />
        <circle cx={156} cy={336} r={4} fill="#D4A24C" />
        {toteHung ? <ThaoToteBag x={108} y={348} s={0.95} hanging /> : null}
        {keysHung ? <HouseKeys x={156} y={338} s={1.05} /> : null}

        {/* Mother's Sewing Table (`bàn may cũ của mẹ, mảnh vải đang ghim dở, đèn đã tắt`) placed beneath window */}
        <SewingTable x={535} y={820} w={265} t={0} clothColor="#D4846A" />
        <g transform="translate(535 820)">
          {/* Soft yellow measuring tape draped over right side of sewing table */}
          <path
            d="M 50 -145 Q 78 -120 72 -90 Q 68 -74 78 -66"
            stroke="#F2C94C"
            strokeWidth={6.5}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 50 -145 Q 78 -120 72 -90 Q 68 -74 78 -66"
            stroke={INK}
            strokeWidth={6.5}
            fill="none"
            strokeDasharray="2 5"
          />
          {/* Switched-off sewing lamp (`đèn bàn may đã tắt, nằm trong vùng tối nhẹ`) */}
          <path d="M -105 -145 L -118 -200 L -84 -222" stroke="#4A3E38" strokeWidth={5} fill="none" strokeLinecap="round" />
          <polygon points="-90,-228 -68,-216 -76,-200 -100,-212" fill="#6E5A4F" stroke={INK} strokeWidth={2.5} />
          {/* Wicker basket of folded clothes (`vải gấp`) beside sewing table */}
          <g transform="translate(-165 14)">
            <ellipse cx={0} cy={4} rx={48} ry={8} fill="#000" opacity={0.38} />
            <polygon points="-42,0 -50,-42 50,-42 42,0" fill="#B68656" stroke={INK} strokeWidth={3} />
            <rect x={-38} y={-55} width={76} height={15} rx={4} fill="#6E8A9C" stroke={INK} strokeWidth={2.5} />
            <rect x={-34} y={-68} width={68} height={14} rx={4} fill="#E0A088" stroke={INK} strokeWidth={2.5} />
          </g>
        </g>

        {/* Directional shadow over the unlit left wall, back-room partition & switched-off sewing corner */}
        <rect x={-120} y={-40} width={760} height={1060} fill={`url(#${id}UnlitLeft)`} />
      </g>

      {/* ===================================================================== */}
      {/* RIGHT WALL: MOTHER'S ANCESTRAL ALTAR (`bàn thờ mẹ, đèn riêng luôn sáng`) */}
      {/* ===================================================================== */}
      <AncestralAltar x={1545} y={765} w={255} t={t} cabinet glow={1} />

      {/* ===================================================================== */}
      {/* ROOM SHADOW FALLOFF (`ánh sáng trong phòng hơi tối lại những chỗ không có ánh sáng chiếu đến`) */}
      {/* ===================================================================== */}
      <RoomCorners x0={240} x1={1680} y0={135} y1={710} />
      {veil > 0 ? <LightVeil id={`${id}Veil`} lights={lights} o={veil} /> : null}

      {/* ===================================================================== */}
      {/* WARM COZY LIGHT POOLS (ALTAR GLOW & MAIN RATTAN PENDANT LAMP)         */}
      {/* ===================================================================== */}
      <Glow x={1545} y={510} r={420} o={0.65} />
      <Glow x={1545} y={760} r={280} o={0.42} />

      <g transform="translate(980 35)">
        <line x1={0} y1={0} x2={0} y2={95} stroke={INK} strokeWidth={3.5} />
        {/* Warm woven bamboo/rattan lampshade (`chao đèn mây đan ấm cúng`) */}
        <path d="M -42 95 Q 0 78 42 95 L 64 132 L -64 132 Z" fill="#C88B4B" stroke={INK} strokeWidth={3} />
        <line x1={-48} y1={110} x2={48} y2={110} stroke="#8C5A2B" strokeWidth={2} />
        <line x1={-56} y1={122} x2={56} y2={122} stroke="#8C5A2B" strokeWidth={2} />
        <ellipse cx={0} cy={132} rx={60} ry={8} fill="#FFE6A3" />
        <Cone d="M -45 132 L 45 132 L 440 920 L -440 920 Z" o={0.28} />
        <Glow x={0} y={380} r={580} o={0.54} />
        <Glow x={0} y={720} r={420} o={0.38} />
      </g>

      {/* Warm floating dust motes in the lit center & altar beams */}
      <Dust t={t} seed={31} x0={620} y0={240} w={980} h={540} n={24} o={0.34} />
    </g>
  );
};

/**
 * `DiningTableSet` (`bàn ăn nhỏ ở phòng trước` + `ghế Duy/Thảo`):
 * Includes a cozy woven floor mat (`thảm cói ấm áp`) under the table, a small ceramic tea tray (`khay trà nhỏ`),
 * and open space on the left for `MotherPhone` (screen up) and `MemoryReceipt`.
 */
export const DiningTableSet: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  showPhone?: boolean;
  showReceipt?: boolean;
}> = ({ x = 980, y = 885, w = 440, showPhone = true, showReceipt = true }) => {
  const s = w / 440;
  const topY = -168 * s;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* Cozy woven sedge/fabric rug (`thảm dệt ấm cúng`) under the family dining table */}
      <ellipse cx={0} cy={6 * s} rx={310 * s} ry={34 * s} fill="#8C523A" stroke={INK} strokeWidth={2.5 * s} />
      <ellipse cx={0} cy={5 * s} rx={275 * s} ry={26 * s} fill="#B87B56" stroke="#6E3B26" strokeWidth={2 * s} strokeDasharray="8 5" />
      <ellipse cx={0} cy={8 * s} rx={250 * s} ry={16 * s} fill="#000" opacity={0.35} />

      {/* Left chair (Duy's chair) */}
      <g transform={`translate(${-215 * s} ${-6 * s})`}>
        <rect x={-32 * s} y={-195 * s} width={10 * s} height={195 * s} fill="#5C3828" stroke={INK} strokeWidth={2.5 * s} />
        <rect x={24 * s} y={-92 * s} width={10 * s} height={92 * s} fill="#5C3828" stroke={INK} strokeWidth={2.5 * s} />
        <rect x={-32 * s} y={-182 * s} width={18 * s} height={42 * s} rx={2 * s} fill="#724632" stroke={INK} strokeWidth={2 * s} />
        <rect x={-36 * s} y={-98 * s} width={76 * s} height={12 * s} rx={3 * s} fill="#84523B" stroke={INK} strokeWidth={2.8 * s} />
      </g>

      {/* Right chair (Thảo's chair, with higher footrest bar for 8yo Thảo) */}
      <g transform={`translate(${215 * s} ${-6 * s})`}>
        <rect x={22 * s} y={-195 * s} width={10 * s} height={195 * s} fill="#5C3828" stroke={INK} strokeWidth={2.5 * s} />
        <rect x={-34 * s} y={-92 * s} width={10 * s} height={92 * s} fill="#5C3828" stroke={INK} strokeWidth={2.5 * s} />
        <rect x={-32 * s} y={-48 * s} width={62 * s} height={8 * s} rx={2 * s} fill="#6E4432" stroke={INK} strokeWidth={2 * s} />
        <rect x={14 * s} y={-182 * s} width={18 * s} height={42 * s} rx={2 * s} fill="#724632" stroke={INK} strokeWidth={2 * s} />
        <rect x={-40 * s} y={-98 * s} width={76 * s} height={12 * s} rx={3 * s} fill="#84523B" stroke={INK} strokeWidth={2.8 * s} />
      </g>

      {/* Dining table legs & frame */}
      <rect x={-168 * s} y={topY} width={16 * s} height={168 * s} fill="#5C3828" stroke={INK} strokeWidth={3 * s} />
      <rect x={152 * s} y={topY} width={16 * s} height={168 * s} fill="#5C3828" stroke={INK} strokeWidth={3 * s} />
      <rect x={-146 * s} y={topY + 12 * s} width={12 * s} height={148 * s} fill="#462A1E" stroke={INK} strokeWidth={2.5 * s} />
      <rect x={134 * s} y={topY + 12 * s} width={12 * s} height={148 * s} fill="#462A1E" stroke={INK} strokeWidth={2.5 * s} />
      <rect x={-165 * s} y={topY + 14 * s} width={330 * s} height={18 * s} fill="#6E4430" stroke={INK} strokeWidth={2.5 * s} />

      {/* Tabletop */}
      <polygon
        points={`${-195 * s},${topY} ${195 * s},${topY} ${175 * s},${topY - 26 * s} ${-175 * s},${topY - 26 * s}`}
        fill="#82523C"
        stroke={INK}
        strokeWidth={3 * s}
        strokeLinejoin="round"
      />
      {/* Warm cream table runner (`khăn trải bàn nhỏ giữa bàn`) */}
      <polygon
        points={`${-75 * s},${topY} ${95 * s},${topY} ${85 * s},${topY - 26 * s} ${-65 * s},${topY - 26 * s}`}
        fill="#E5D2B8"
        stroke={INK}
        strokeWidth={1.8 * s}
      />
      <rect x={-195 * s} y={topY} width={390 * s} height={16 * s} rx={3 * s} fill="#945E46" stroke={INK} strokeWidth={3 * s} />
      <line x1={-190 * s} y1={topY + 2 * s} x2={190 * s} y2={topY + 2 * s} stroke={WARM_RIM} strokeWidth={2.2 * s} opacity={0.75} />

      {/* Small tea tray (`khay trà nhỏ`) on right of table */}
      <g transform={`translate(${75 * s} ${topY - 10 * s})`}>
        <polygon
          points={`${-46 * s},${4 * s} ${46 * s},${4 * s} ${54 * s},${-8 * s} ${-38 * s},${-8 * s}`}
          fill="#5C3828"
          stroke={INK}
          strokeWidth={2 * s}
        />
        <rect x={-18 * s} y={-25 * s} width={24 * s} height={23 * s} rx={5 * s} fill="#EFE6D5" stroke={INK} strokeWidth={2 * s} />
        <rect x={-14 * s} y={-29 * s} width={16 * s} height={5 * s} rx={2 * s} fill="#C87A51" stroke={INK} strokeWidth={1.5 * s} />
        <rect x={12 * s} y={-16 * s} width={14 * s} height={14 * s} rx={3 * s} fill="#EFE6D5" stroke={INK} strokeWidth={1.8 * s} />
        <rect x={29 * s} y={-16 * s} width={14 * s} height={14 * s} rx={3 * s} fill="#EFE6D5" stroke={INK} strokeWidth={1.8 * s} />
      </g>

      {/* Mother's repaired phone (face-up) & signed receipt on left of table in Scene 7 */}
      {showPhone ? (
        <MotherPhone x={-45 * s} y={topY - 10 * s} w={76 * s} rot={-5} flat cracked={0} screenOn={1} />
      ) : null}
      {showReceipt ? (
        <MemoryReceipt x={-125 * s} y={topY - 10 * s} w={72 * s} rot={6} stage="signed" flat />
      ) : null}
    </g>
  );
};

/** `MotherHouseForeground`: Warm wooden 2.5D front doorway frame & threshold step (`bậc cửa nhà tiền cảnh`) for C7/C8. */
export const MotherHouseForeground: React.FC<{ shiftX?: number }> = ({ shiftX = 0 }) => (
  <g transform={`translate(${shiftX} 0)`}>
    <rect x={-80} y={-40} width={125} height={1160} fill="#140C09" stroke="#3E271E" strokeWidth={4} />
    <rect x={1875} y={-40} width={125} height={1160} fill="#140C09" stroke="#3E271E" strokeWidth={4} />
    <rect x={-80} y={-40} width={2080} height={62} fill="#140C09" />
    {/* Wooden front doorway threshold (`bậc cửa gỗ tiền cảnh`) */}
    <rect x={45} y={1046} width={1830} height={38} fill="#1B110D" stroke="#3E271E" strokeWidth={3} />
  </g>
);

// ----------------------------------------------------------------------------
// ENVIRONMENT 3: CẢNH 0 — PHẦN MỞ ĐẦU (`SET-CITY-SKY`, `TITLE-TAP`, `ANIMAL-CU`, `SET-HEM-EXT`, `EXTRA-BONG`)
// ----------------------------------------------------------------------------

/**
 * `EpisodeTitleBanner` (`TITLE-TAP` — Chữ "TIN NHẮN CHƯA GỬI" ở C0-A, mờ dần ở C0-B):
 * Designed as an independent layer placed in the clear upper starry sky (`vùng nền ít sao để không cắt nét chữ`).
 */
export const EpisodeTitleBanner: React.FC<{
  x?: number;
  y?: number;
  s?: number;
  opacity?: number;
  subtitle?: string;
}> = ({ x = 960, y = 210, s = 1, opacity = 1, subtitle = 'HẺM CÓ CHUYỆN  •  TẬP 01' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    {/* Soft dark sky cushion behind title so stars never slice through letter strokes (`vùng ít sao quanh chữ`) */}
    <ellipse cx={0} cy={8} rx={480} ry={105} fill="#080D1A" opacity={0.78} />
    <ellipse cx={0} cy={8} rx={380} ry={74} fill="#0B1326" opacity={0.55} />
    {/* Series overline */}
    <text
      x={0}
      y={-42}
      textAnchor="middle"
      fontSize={16}
      fontWeight={700}
      letterSpacing={7}
      fill="#C8D6EA"
      opacity={0.78}
      fontFamily="'Noto Serif', Georgia, serif"
    >
      {subtitle}
    </text>
    {/* Thin ornamental divider */}
    <line x1={-160} y1={-24} x2={-32} y2={-24} stroke="#D4A857" strokeWidth={1.4} opacity={0.65} />
    <polygon points="0,-29 6,-24 0,-19 -6,-24" fill="#D4A857" opacity={0.8} />
    <line x1={32} y1={-24} x2={160} y2={-24} stroke="#D4A857" strokeWidth={1.4} opacity={0.65} />
    {/* Main episode title (`TIN NHẮN CHƯA GỬI`) */}
    <text
      x={0}
      y={32}
      textAnchor="middle"
      fontSize={58}
      fontWeight={800}
      letterSpacing={6}
      fill="#101829"
      stroke="#101829"
      strokeWidth={10}
      strokeLinejoin="round"
      opacity={0.65}
      fontFamily="'Noto Serif', Georgia, serif"
    >
      TIN NHẮN CHƯA GỬI
    </text>
    <text
      x={0}
      y={30}
      textAnchor="middle"
      fontSize={58}
      fontWeight={800}
      letterSpacing={6}
      fill="#F6ECD9"
      fontFamily="'Noto Serif', Georgia, serif"
    >
      TIN NHẮN CHƯA GỬI
    </text>
    {/* Subtle warm underline accent */}
    <line x1={-235} y1={52} x2={235} y2={52} stroke="#E8B86D" strokeWidth={1.6} opacity={0.48} />
  </g>
);

/**
 * `PerchingOwl` (`ANIMAL-CU` — Cú đậu trên thanh sắt đỡ mái hiên ở C0-B, C0-D, C0-E):
 * Includes claws gripping the horizontal iron bar, contact shadow on the bar, layered wing/chest plumage,
 * ear tufts, and head rotation/blink support. Eyes reflect warm streetlamp light naturally (NOT glowing supernatural eyes).
 */
export const PerchingOwl: React.FC<{
  x?: number;
  y?: number;
  s?: number;
  headTurn?: number; // -1 (look left/up) .. 0 (front) .. +1 (look down into alley toward Duy & Thảo)
  blink?: number;    // 0 (open) .. 1 (closed)
  showBracket?: boolean;
}> = ({ x = 0, y = 0, s = 1, headTurn = 0.35, blink = 0, showBracket = true }) => {
  const hx = headTurn * 8;
  const hy = Math.abs(headTurn) * 3;
  const eyeScaleY = Math.max(0.08, 1 - blink * 0.92);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* Optional iron roof-eave bracket (`thanh sắt đỡ mái hiên nhà đầu hẻm`) */}
      {showBracket ? (
        <g>
          {/* Wall mount plate & diagonal brace on left */}
          <rect x={-145} y={-24} width={16} height={78} rx={3} fill="#1E2530" stroke={INK} strokeWidth={3} />
          <line x1={-132} y1={42} x2={-35} y2={6} stroke="#252E3C" strokeWidth={9} strokeLinecap="round" />
          <line x1={-132} y1={42} x2={-35} y2={6} stroke={INK} strokeWidth={3} />
          {/* Horizontal iron bar where the owl perches */}
          <rect x={-140} y={-4} width={250} height={12} rx={3} fill="#2B3545" stroke={INK} strokeWidth={3} />
          <line x1={-136} y1={-1} x2={106} y2={-1} stroke="#7A94B8" strokeWidth={2} opacity={0.55} />
        </g>
      ) : null}

      {/* Contact shadow of owl claws on the iron bar (`bóng tiếp xúc chân cú trên thanh sắt`) */}
      <ellipse cx={0} cy={1} rx={34} ry={6} fill="#05070C" opacity={0.72} />

      {/* Tail feathers hanging slightly below the iron bar */}
      <path
        d="M -22 2 L -32 46 L -8 38 L 6 44 L 12 4 Z"
        fill="#2B211B"
        stroke={INK}
        strokeWidth={2.8}
        strokeLinejoin="round"
      />

      {/* Owl body (`thân cú u tối lông xám than đêm`) */}
      <path
        d="M -42 -68 C -52 -32 -44 -2 -26 2 L 24 2 C 44 -4 48 -36 36 -72 C 22 -96 -24 -96 -42 -68 Z"
        fill="#1F181D"
        stroke={INK}
        strokeWidth={3.2}
      />
      {/* Dark mottled chest plumage */}
      <path
        d="M -22 -64 C -28 -36 -22 -8 -8 0 L 14 0 C 26 -8 28 -36 20 -64 Z"
        fill="#2C2228"
        opacity={0.92}
      />
      {/* Chest feather chevrons */}
      {[-48, -34, -20].map((cy, i) => (
        <g key={i} stroke="#140E13" strokeWidth={2.2} fill="none" strokeLinecap="round">
          <path d={`M -14 ${cy} L -7 ${cy + 5} L 0 ${cy}`} />
          <path d={`M 2 ${cy + 3} L 9 ${cy + 8} L 16 ${cy + 3}`} />
        </g>
      ))}
      {/* Folded wing on the left/back side with warm streetlamp rim highlight */}
      <path
        d="M -38 -68 C -52 -40 -46 -12 -28 0 C -20 -18 -20 -46 -26 -68 Z"
        fill="#181216"
        stroke={INK}
        strokeWidth={2.8}
      />
      <path
        d="M 28 -68 C 44 -42 40 -12 22 0 C 16 -18 16 -46 20 -68 Z"
        fill="#1C151B"
        stroke={INK}
        strokeWidth={2.8}
      />
      {/* Warm alley light rim on right wing edge */}
      <path d="M 34 -62 C 42 -40 38 -16 24 -2" stroke={WARM_RIM} strokeWidth={2.2} fill="none" opacity={0.7} />

      {/* Talons gripping the iron bar (`móng chân bám thanh sắt`) */}
      {[-14, 12].map((cx, i) => (
        <g key={i} transform={`translate(${cx} -2)`}>
          <path d="M -7 0 Q -9 8 -6 13" stroke="#B88A36" strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M 0 -1 Q 0 8 1 14" stroke="#B88A36" strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M 7 0 Q 9 8 6 13" stroke="#B88A36" strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M -6 13 L -7 17 M 1 14 L 1 18 M 6 13 L 7 17" stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
        </g>
      ))}

      {/* Owl head (`xoay nhẹ theo hai đứa trẻ dưới hẻm`) */}
      <g transform={`translate(${hx} ${-86 + hy})`}>
        {/* Ear tufts (`tai lông cú`) */}
        <path
          d="M -34 -22 L -46 -46 L -18 -30 Z"
          fill="#181216"
          stroke={INK}
          strokeWidth={2.8}
          strokeLinejoin="round"
        />
        <path
          d="M 34 -22 L 46 -46 L 18 -30 Z"
          fill="#181216"
          stroke={INK}
          strokeWidth={2.8}
          strokeLinejoin="round"
        />
        {/* Main rounded head dome */}
        <ellipse cx={0} cy={-4} rx={38} ry={32} fill="#1F181D" stroke={INK} strokeWidth={3.2} />
        {/* Facial disc (`đĩa mặt cú xám than u tối`) */}
        <ellipse cx={-13} cy={-2} rx={16} ry={16} fill="#2B2028" stroke="#120D12" strokeWidth={2.4} />
        <ellipse cx={15} cy={-2} rx={16} ry={16} fill="#2B2028" stroke="#120D12" strokeWidth={2.4} />
        {/* Brow feather V-ridge */}
        <path d="M -26 -14 L 1 -4 L 28 -14" stroke="#120D12" strokeWidth={3.2} fill="none" strokeLinecap="round" />

        {/* Eyes (`mắt cú hổ phách sáng bí ẩn trong bóng đêm — phản chiếu tapetum lucidum sáng rõ khi có đèn`) */}
        {[-13, 15].map((ex, i) => (
          <g key={i} transform={`translate(${ex} -2) scale(1 ${eyeScaleY})`}>
            {/* Luminous tapetum aura bloom */}
            <circle cx={0} cy={0} r={14} fill="#FF9A00" opacity={0.4} style={{ mixBlendMode: 'screen' }} />
            {/* Vivid golden amber iris */}
            <circle cx={0} cy={0} r={10} fill="#FFAA00" stroke="#8A5A00" strokeWidth={1.8} />
            <circle cx={0} cy={0} r={8.5} fill="#FFCF33" />
            <circle cx={headTurn * 1.6} cy={1} r={5.2} fill="#06050A" />
            {/* Brilliant streetlamp specular reflections caught from the alley below */}
            <circle cx={2.8} cy={-2.2} r={2.6} fill="#FFFFFF" />
            <circle cx={3.4} cy={-1.4} r={1.5} fill="#FFF6B8" opacity={0.95} />
            <circle cx={-2.4} cy={2.2} r={1.2} fill="#B8D4F2" opacity={0.7} />
          </g>
        ))}

        {/* Hooked beak */}
        <polygon points="-5,2 6,2 1,14" fill="#181416" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      </g>
    </g>
  );
};

/**
 * `OwlEyeMacro` (`ANIMAL-CU` — Cận / Đặc tả 85mm đầu & mắt cú ở C0-C):
 * High-detail close-up of the horned owl's facial feather discs, raptor beak,
 * V-shaped brow plumage, layered ear tufts, iris depth, pupil dilation,
 * and warm golden reflection of the alley shop doorway below.
 */
export const OwlEyeMacro: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  blink?: number;
  lookX?: number;
  lookY?: number;
}> = ({ x = 0, y = 0, w = 1920, h = 1080, blink = 0, lookX = 0.2, lookY = 0.25 }) => {
  const s = w / 1920;
  const eyeScaleY = Math.max(0.04, 1 - blink * 0.96);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        {/* Deep cinematic background night gradient */}
        <radialGradient id="owlMacroBg" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#0B1224" />
          <stop offset="60%" stopColor="#060A16" />
          <stop offset="100%" stopColor="#020409" />
        </radialGradient>
        {/* Rich multi-layered amber-gold iris gradient */}
        <radialGradient id="owlIrisGrad" cx="45%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="92%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#1E0B02" />
        </radialGradient>
        {/* Soft shadow under brow over top half of eye */}
        <linearGradient id="owlEyeShadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#050308" stopOpacity={0.88} />
          <stop offset="55%" stopColor="#050308" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#050308" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Atmospheric out-of-focus background with soft street bokeh */}
      <rect x={0} y={0} width={1920} height={h / s} fill="url(#owlMacroBg)" />
      {/* Soft nocturnal bokeh discs */}
      <circle cx={260} cy={220} r={140} fill="#1E3A8A" opacity={0.12} filter="url(#softShadowBlur)" />
      <circle cx={1660} cy={340} r={180} fill="#F59E0B" opacity={0.08} filter="url(#softShadowBlur)" />
      <circle cx={1740} cy={720} r={220} fill="#D97706" opacity={0.14} filter="url(#softShadowBlur)" />

      {/* Out-of-focus iron eave & roof bracket beneath owl perch */}
      <polygon points="-80,920 2000,900 2000,1180 -80,1180" fill="#0C111D" stroke="#05080F" strokeWidth={5} />
      <line x1={-80} y1={910} x2={2000} y2={890} stroke="#28354A" strokeWidth={4} opacity={0.6} />

      {/* =================================================================== */}
      {/* OWL HEAD ANATOMY (Cận cảnh đầu cú sắc nét, chỉn chu, liền khối)       */}
      {/* =================================================================== */}
      <g transform="translate(960 540)">
        {/* Layer 1: Downward neck & breast plumage contour grounding the head */}
        <path
          d="M -540 380 Q -380 480 0 510 Q 380 480 540 380 L 590 580 L -590 580 Z"
          fill="#110D14"
          stroke={INK}
          strokeWidth={4.5}
        />
        {/* Arrowhead breast feather streaks */}
        {[-320, -220, -110, 0, 110, 220, 320].map((bx, i) => (
          <g key={i} transform={`translate(${bx} ${420 + (i % 2) * 25}) scale(0.85)`}>
            <path d="M 0 0 L 14 26 L 0 20 L -14 26 Z" fill="#2E2328" />
            <path d="M 0 10 L 10 32 L 0 28 L -10 32 Z" fill="#4A383F" opacity={0.7} />
          </g>
        ))}

        {/* Layer 2: Main horned skull & ear tufts plumage silhouette */}
        <path
          d="M -540 380
             C -610 160 -580 -120 -440 -340
             L -540 -530
             C -490 -510 -400 -430 -330 -390
             C -170 -470 170 -470 330 -390
             C 400 -430 490 -510 540 -530
             L 440 -340
             C 580 -120 610 160 540 380
             Z"
          fill="#16121B"
          stroke={INK}
          strokeWidth={6}
          strokeLinejoin="round"
        />

        {/* Layer 3: Ear tufts inner feather details (Búi lông sừng có lớp lang) */}
        {/* Left ear tuft inner layers */}
        <path d="M -430 -340 L -520 -505 C -475 -480 -400 -420 -345 -385 Z" fill="#2A1E27" />
        <path d="M -415 -350 L -490 -480 C -450 -460 -395 -415 -355 -385 Z" fill="#3D2D37" />
        <line x1={-425} y1={-345} x2={-505} y2={-495} stroke="#54404C" strokeWidth={2.5} strokeLinecap="round" />

        {/* Right ear tuft inner layers */}
        <path d="M 430 -340 L 520 -505 C 475 -480 400 -420 345 -385 Z" fill="#2A1E27" />
        <path d="M 415 -350 L 490 -480 C 450 -460 395 -415 355 -385 Z" fill="#3D2D37" />
        <line x1={425} y1={-345} x2={505} y2={-495} stroke="#54404C" strokeWidth={2.5} strokeLinecap="round" />

        {/* Crown feather striations between ear tufts */}
        {[-220, -160, -100, -40, 20, 80, 140, 200].map((cx, i) => (
          <path
            key={i}
            d={`M ${cx} -410 Q ${cx + 10} -450 ${cx} -475`}
            stroke="#2F242C"
            strokeWidth={3.5}
            strokeLinecap="round"
            fill="none"
          />
        ))}

        {/* Layer 4: Facial Discs Outer Ruff Border (Viền đĩa mặt trái tim) */}
        <path
          d="M 0 -110
             C -90 -220 -280 -255 -380 -185
             C -490 -105 -490 120 -380 235
             C -280 340 -110 330 0 240
             C 110 340 280 340 380 235
             C 490 120 490 -105 380 -185
             C 280 -255 90 -220 0 -110 Z"
          fill="#1C1622"
          stroke="#0E0A12"
          strokeWidth={4.5}
        />

        {/* Layer 5: Left & Right Facial Discs with radiating plumage striations */}
        {[-210, 210].map((dx, side) => (
          <g key={side} transform={`translate(${dx} 25)`}>
            {/* Base disc ring */}
            <ellipse cx={0} cy={0} rx={195} ry={190} fill="#231A26" stroke="#140E18" strokeWidth={3} />
            <ellipse cx={0} cy={0} rx={165} ry={160} fill="#2B212E" stroke="#3D2E3D" strokeWidth={2} strokeDasharray="8 5" />
            <ellipse cx={0} cy={0} rx={135} ry={130} fill="#332736" opacity={0.6} />

            {/* Fine radiating disc feather lines */}
            {Array.from({ length: 32 }).map((_, k) => {
              const a = (k / 32) * Math.PI * 2;
              const r1 = 110;
              const r2 = 185;
              return (
                <line
                  key={k}
                  x1={Math.cos(a) * r1}
                  y1={Math.sin(a) * r1 * 0.96}
                  x2={Math.cos(a) * r2}
                  y2={Math.sin(a) * r2 * 0.96}
                  stroke={k % 2 ? '#443343' : '#5C4458'}
                  strokeWidth={2}
                  opacity={0.7}
                />
              );
            })}

            {/* EYELID & IRIS ASSEMBLY (Blinking supported) */}
            <g transform={`scale(1 ${eyeScaleY})`}>
              {/* Outer black sclerotic eye ring */}
              <circle cx={0} cy={0} r={105} fill="#0A070D" stroke={INK} strokeWidth={4.5} />
              {/* Limbal ring */}
              <circle cx={0} cy={0} r={98} fill="#1E0E04" />
              {/* Deep amber iris */}
              <circle cx={0} cy={0} r={94} fill="url(#owlIrisGrad)" />

              {/* Radial iris muscle fibers */}
              {Array.from({ length: 36 }).map((_, f) => {
                const fa = (f / 36) * Math.PI * 2;
                return (
                  <line
                    key={f}
                    x1={Math.cos(fa) * 48}
                    y1={Math.sin(fa) * 48}
                    x2={Math.cos(fa) * 92}
                    y2={Math.sin(fa) * 92}
                    stroke={f % 3 === 0 ? '#78350F' : '#B45309'}
                    strokeWidth={f % 2 === 0 ? 2.2 : 1.4}
                    opacity={0.75}
                  />
                );
              })}

              {/* Inner golden ring around pupil */}
              <circle cx={0} cy={0} r={52} fill="none" stroke="#FDE68A" strokeWidth={2.5} opacity={0.8} />

              {/* Dilated nocturnal raptor pupil shifted toward alley below */}
              <circle cx={lookX * 24} cy={lookY * 24} r={46} fill="#05060A" stroke="#120A03" strokeWidth={2} />

              {/* Soft shadow cast by upper brow over top third of eye */}
              <path
                d="M -94 0 C -94 -52 94 -52 94 0 C 94 36 -94 36 -94 0 Z"
                fill="url(#owlEyeShadow)"
                transform="translate(0 -22)"
              />

              {/* Specular reflections: Warm golden glow from shop doorway below */}
              <ellipse
                cx={32 + lookX * 8}
                cy={24 + lookY * 6}
                rx={18}
                ry={10}
                fill="#FDE68A"
                opacity={0.45}
                filter="url(#neonGlow)"
              />
              <ellipse
                cx={32 + lookX * 8}
                cy={24 + lookY * 6}
                rx={12}
                ry={6}
                fill="#FFFBEB"
                opacity={0.85}
              />
              {/* Crisp pinpoint starlight specular highlight on pupil rim */}
              <circle cx={-18 + lookX * 6} cy={-22 + lookY * 6} r={5.5} fill="#FFFFFF" />
              <circle cx={-13 + lookX * 6} cy={-16 + lookY * 6} r={2.5} fill="#E0F2FE" />
            </g>
          </g>
        ))}

        {/* Layer 6: V-Shaped Forehead Brow & Feather Crest (Gờ mày vút nhọn uy nghiêm) */}
        <g>
          {/* Broad V-brow plumage bridge */}
          <path
            d="M -390 -120
               C -240 -80 -90 10 0 65
               C 90 10 240 -80 390 -120
               C 320 -180 160 -150 0 -95
               C -160 -150 -320 -180 -390 -120 Z"
            fill="#2A1E29"
            stroke={INK}
            strokeWidth={4.5}
            strokeLinejoin="round"
          />
          {/* Layered feathered tufts along the brow line */}
          {[-310, -220, -130, -50, 50, 130, 220, 310].map((bx, i) => (
            <path
              key={i}
              d={`M ${bx} ${-100 + Math.abs(bx) * 0.15} L ${bx + (bx > 0 ? -18 : 18)} ${-130 + Math.abs(bx) * 0.15} L ${bx} ${-115 + Math.abs(bx) * 0.15} Z`}
              fill="#42313F"
              opacity={0.85}
            />
          ))}
          {/* Central forehead chevron lines */}
          <path d="M -80 -130 L 0 -85 L 80 -130" stroke="#544051" strokeWidth={3} fill="none" />
          <path d="M -50 -160 L 0 -115 L 50 -160" stroke="#544051" strokeWidth={2.5} fill="none" />
        </g>

        {/* Layer 7: Hooked Raptor Beak & Nasal Cere (Mỏ khoằm sắc nét, có sống mỏ) */}
        <g transform="translate(0 75)">
          {/* Beak base / cere nestled in facial feathers */}
          <polygon points="-28,-18 28,-18 34,10 -34,10" fill="#241B20" stroke={INK} strokeWidth={2.5} />
          {/* Main hooked beak body */}
          <path
            d="M -26 8
               C -28 65 -16 135 0 165
               C 16 135 28 65 26 8
               Q 0 -6 -26 8 Z"
            fill="#3B3533"
            stroke={INK}
            strokeWidth={4.5}
            strokeLinejoin="round"
          />
          {/* Left shadow plane of beak */}
          <path d="M -26 8 C -28 65 -16 135 0 165 L 0 0 Z" fill="#231F1E" opacity={0.65} />
          {/* Sharp dorsal ridge highlight along center of beak */}
          <path d="M 0 0 L 0 162" stroke="#78706B" strokeWidth={3.5} strokeLinecap="round" />
          <path d="M 2 12 L 2 145" stroke="#A8A29E" strokeWidth={1.5} opacity={0.7} />
          {/* Nostril slit on left & right */}
          <ellipse cx={-12} cy={22} rx={3.5} ry={1.8} fill="#141110" transform="rotate(-15 -12 22)" />
          <ellipse cx={12} cy={22} rx={3.5} ry={1.8} fill="#141110" transform="rotate(15 12 22)" />

          {/* Rictal bristles (lông cứng xòe quanh khóe mỏ) */}
          <line x1={-26} y1={12} x2={-52} y2={4} stroke="#1A141A" strokeWidth={2.2} strokeLinecap="round" />
          <line x1={-26} y1={25} x2={-48} y2={28} stroke="#1A141A" strokeWidth={2} strokeLinecap="round" />
          <line x1={26} y1={12} x2={52} y2={4} stroke="#1A141A" strokeWidth={2.2} strokeLinecap="round" />
          <line x1={26} y1={25} x2={48} y2={28} stroke="#1A141A" strokeWidth={2} strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};

/**
 * `StarryCitySkyline` (`SET-CITY-SKY` — Bầu trời sao & đường chân trời thành phố đêm ở C0-A, C0-B):
 * Reworked with deep nocturnal cosmic gradient, delicate crescent moon, drifting night clouds,
 * rich multi-tiered starfield with twinkle & color, and authentic Vietnamese tube-house cityscape:
 * terracotta tile roofs, rooftop terraces, stainless steel water tanks, fishbone TV antennas,
 * AC compressor units, lit curtained windows, communication tower with blinking aviation beacon,
 * and sagging utility power lines.
 */
export const StarryCitySkyline: React.FC<{
  t?: number;
  tiltY?: number; // 0 (C0-A sky & title) .. 1 (C0-B tilted down to rooftop eave & owl)
  showTitle?: boolean;
  titleOpacity?: number;
  showOwl?: boolean;
}> = ({ t = 0, tiltY = 0, showTitle = true, titleOpacity = 1, showOwl = true }) => {
  const shiftY = -tiltY * 220;

  // Rich multi-tiered starfield avoiding title safe zone (x: 480..1440, y: 110..290)
  const stars: [number, number, number, string, boolean][] = [
    // Left upper quadrant
    [75, 55, 1.8, '#FFFFFF', true],
    [140, 95, 1.2, '#E0F2FE', false],
    [210, 45, 2.4, '#FEF3C7', true],
    [285, 130, 1.4, '#FFFFFF', false],
    [95, 175, 1.6, '#E0F2FE', false],
    [175, 220, 2.0, '#FFFFFF', true],
    [320, 85, 1.3, '#CBD5E1', false],
    [380, 160, 2.2, '#FEF9C3', true],
    [430, 90, 1.5, '#E0F2FE', false],
    [120, 280, 1.2, '#FFFFFF', false],
    [240, 310, 1.8, '#E0F2FE', false],
    [345, 270, 2.0, '#FEF3C7', true],
    [415, 335, 1.4, '#FFFFFF', false],
    [465, 360, 1.3, '#CBD5E1', false],

    // Top center edge (above title)
    [580, 48, 1.5, '#FFFFFF', false],
    [720, 38, 2.2, '#FEF3C7', true],
    [880, 42, 1.6, '#E0F2FE', false],
    [1040, 35, 2.0, '#FFFFFF', true],
    [1180, 46, 1.4, '#E0F2FE', false],
    [1320, 52, 1.8, '#FEF3C7', false],

    // Right upper quadrant
    [1460, 85, 1.6, '#FFFFFF', false],
    [1535, 45, 2.2, '#FEF3C7', true],
    [1610, 110, 1.4, '#E0F2FE', false],
    [1760, 60, 2.4, '#FFFFFF', true],
    [1830, 125, 1.5, '#E0F2FE', false],
    [1510, 180, 1.8, '#FFFFFF', false],
    [1590, 240, 2.0, '#FEF9C3', true],
    [1745, 215, 1.6, '#E0F2FE', false],
    [1860, 250, 1.9, '#FFFFFF', false],
    [1485, 320, 1.4, '#CBD5E1', false],
    [1580, 350, 1.7, '#FEF3C7', false],
    [1690, 310, 2.1, '#FFFFFF', true],
    [1810, 345, 1.5, '#E0F2FE', false],
    [1875, 365, 1.3, '#FFFFFF', false],

    // Below title band (horizon transition)
    [520, 385, 1.2, '#E0F2FE', false],
    [640, 375, 1.5, '#FFFFFF', false],
    [780, 390, 1.3, '#FEF3C7', false],
    [930, 380, 1.6, '#FFFFFF', false],
    [1090, 370, 1.4, '#E0F2FE', false],
    [1240, 385, 1.5, '#FEF3C7', false],
    [1370, 375, 1.3, '#FFFFFF', false],
  ];

  const cloudDrift1 = ((t * 0.4) % 1920) - 200;
  const cloudDrift2 = ((t * 0.25) % 1920) - 300;

  return (
    <g>
      <defs>
        {/* Deep cosmic midnight gradient */}
        <linearGradient id="c0SkyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#02040A" />
          <stop offset="38%" stopColor="#081024" />
          <stop offset="70%" stopColor="#111D36" />
          <stop offset="88%" stopColor="#1E2338" />
          <stop offset="100%" stopColor="#2E2838" />
        </linearGradient>

        {/* Warm urban sodium vapor horizon glow */}
        <linearGradient id="c0CityHaze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E2923C" stopOpacity={0} />
          <stop offset="65%" stopColor="#E2923C" stopOpacity={0.16} />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.28} />
        </linearGradient>

        {/* Soft nocturnal cloud gradient */}
        <linearGradient id="c0CloudGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0F1A30" stopOpacity={0} />
          <stop offset="30%" stopColor="#1E2B48" stopOpacity={0.35} />
          <stop offset="70%" stopColor="#1E2B48" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#0F1A30" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Sky backdrop */}
      <rect x={0} y={0} width={1920} height={1080} fill="url(#c0SkyGrad)" />

      <g transform={`translate(0 ${shiftY})`}>
        {/* ================================================================= */}
        {/* 1. SOFT NOCTURNAL DRIFTING CLOUDS (`mây đêm bồng bềnh lững lờ`)     */}
        {/* ================================================================= */}
        <g opacity={0.75}>
          {/* Cloud wisp 1 */}
          <path
            d={`M ${cloudDrift1 - 300} 210 Q ${cloudDrift1} 175 ${cloudDrift1 + 350} 205 Q ${cloudDrift1 + 650} 225 ${cloudDrift1 + 950} 210 L ${cloudDrift1 + 950} 245 Q ${cloudDrift1 + 450} 265 ${cloudDrift1 - 300} 245 Z`}
            fill="url(#c0CloudGrad)"
            filter="url(#softShadowBlur)"
          />
          {/* Cloud wisp 2 */}
          <path
            d={`M ${cloudDrift2 + 600} 320 Q ${cloudDrift2 + 900} 290 ${cloudDrift2 + 1250} 315 Q ${cloudDrift2 + 1550} 335 ${cloudDrift2 + 1850} 320 L ${cloudDrift2 + 1850} 355 Q ${cloudDrift2 + 1350} 370 ${cloudDrift2 + 600} 355 Z`}
            fill="url(#c0CloudGrad)"
            filter="url(#softShadowBlur)"
          />
        </g>

        {/* ================================================================= */}
        {/* 2. CRESCENT MOON & LUNAR HALO (`vầng trăng khuyết & ánh trăng`)   */}
        {/* ================================================================= */}
        <g transform="translate(1690 135)">
          {/* Lunar ambient halo */}
          <circle cx={0} cy={0} r={65} fill="#FEF3C7" opacity={0.07} filter="url(#softShadowBlur)" />
          {/* Earthshine faint lunar body disc */}
          <circle cx={0} cy={0} r={24} fill="#131B2D" opacity={0.35} />
          {/* Luminous crescent moon */}
          <path
            d="M 0 -24 A 24 24 0 0 1 24 0 A 24 24 0 0 1 0 24 A 18 18 0 0 0 0 -24 Z"
            fill="#FFFBEB"
          />
          <path
            d="M 0 -24 A 24 24 0 0 1 24 0 A 24 24 0 0 1 0 24 A 18 18 0 0 0 0 -24 Z"
            fill="#FEF08A"
            opacity={0.4}
            filter="url(#neonGlow)"
          />
        </g>

        {/* ================================================================= */}
        {/* 3. MULTI-MAGNITUDE TWINKLING STARFIELD (`bầu trời sao đa tầng`)  */}
        {/* ================================================================= */}
        {stars.map(([sx, sy, sr, scol, hasSpikes], i) => {
          const twinkle = 0.78 + 0.22 * Math.sin(t * 0.12 + i * 1.7);
          return (
            <g key={i}>
              <circle cx={sx} cy={sy} r={sr} fill={scol} opacity={twinkle} />
              {/* Subtle 4-point cross diffraction spikes on bright focal stars */}
              {hasSpikes ? (
                <g opacity={twinkle * 0.55}>
                  <line x1={sx - sr * 2.8} y1={sy} x2={sx + sr * 2.8} y2={sy} stroke={scol} strokeWidth={0.8} />
                  <line x1={sx} y1={sy - sr * 2.8} x2={sx} y2={sy + sr * 2.8} stroke={scol} strokeWidth={0.8} />
                </g>
              ) : null}
            </g>
          );
        })}

        {/* Episode title banner (`TITLE-TAP`) in C0-A / C0-B */}
        {showTitle && titleOpacity > 0.01 ? (
          <EpisodeTitleBanner x={960} y={200} opacity={titleOpacity} />
        ) : null}

        {/* Warm urban sodium-vapor horizon haze */}
        <rect x={0} y={400} width={1920} height={380} fill="url(#c0CityHaze)" />

        {/* ================================================================= */}
        {/* 4. LAYER 1: DISTANT HIGH-RISE SKYLINE & TELECOM TOWER (THÀNH PHỐ XA)*/}
        {/* ================================================================= */}
        <g fill="#0B1324" stroke="#050914" strokeWidth={2}>
          {/* Distant skyline silhouettes */}
          {[
            [30, 515, 120, 335],
            [175, 460, 110, 390],
            [310, 525, 140, 325],
            [480, 475, 120, 375],
            [630, 440, 135, 410],
            [795, 505, 150, 345],
            [975, 465, 125, 385],
            [1130, 495, 145, 355],
            [1305, 435, 140, 415],
            [1475, 490, 130, 360],
            [1635, 455, 140, 395],
            [1805, 520, 115, 330],
          ].map(([bx, by, bw, bh], i) => (
            <g key={i}>
              <rect x={bx} y={by} width={bw} height={bh} />
              {/* Scattered high-rise illuminated windows */}
              {Array.from({ length: 8 }).map((_, wIdx) => {
                const wx = bx + 16 + (wIdx % 3) * 32;
                const wy = by + 22 + Math.floor(wIdx / 3) * 44;
                const isWarm = (i + wIdx) % 2 === 0;
                return (
                  <rect
                    key={wIdx}
                    x={wx}
                    y={wy}
                    width={15}
                    height={10}
                    rx={1}
                    fill={isWarm ? '#FDE68A' : '#7DD3FC'}
                    opacity={0.52}
                  />
                );
              })}
            </g>
          ))}

          {/* Tall telecommunication antenna tower with blinking aviation red beacon */}
          <g transform="translate(1375 355)">
            {/* Tapering steel truss mast */}
            <line x1={0} y1={80} x2={0} y2={0} stroke="#1A2840" strokeWidth={3.5} />
            <line x1={-12} y1={80} x2={0} y2={15} stroke="#1A2840" strokeWidth={2} />
            <line x1={12} y1={80} x2={0} y2={15} stroke="#1A2840" strokeWidth={2} />
            <line x1={-8} y1={55} x2={8} y2={55} stroke="#1A2840" strokeWidth={1.8} />
            <line x1={-5} y1={35} x2={5} y2={35} stroke="#1A2840" strokeWidth={1.8} />
            {/* Blinking red aviation hazard light at summit */}
            <circle
              cx={0}
              cy={0}
              r={4}
              fill="#EF4444"
              opacity={0.7 + 0.3 * Math.sin(t * 0.2)}
              filter="url(#neonGlow)"
            />
            <circle cx={0} cy={0} r={2} fill="#FECACA" opacity={0.9} />
          </g>
        </g>

        {/* ================================================================= */}
        {/* 5. LAYER 2: MIDGROUND VIETNAMESE TUBE HOUSES (NHÀ ỐNG VIỆT NAM)    */}
        {/* Mái ngói dốc, sân thượng, bồn nước inox Sơn Hà, ăng-ten xương cá   */}
        {/* ================================================================= */}
        <g>
          {/* House 1 (x: 0..250): Terracotta tile gable roof house (`nhà mái ngói dốc`) */}
          <g>
            <polygon points="-20,620 120,560 250,620 250,1050 -20,1050" fill="#141E32" stroke={INK} strokeWidth={3.5} />
            {/* Slanted terracotta tile roof profile */}
            <polygon points="-25,622 120,556 255,622 250,634 120,568 -20,634" fill="#3D201A" stroke={INK} strokeWidth={2.5} />
            {/* Fishbone TV antenna (`ăng-ten xương cá`) */}
            <g transform="translate(120 520)">
              <line x1={0} y1={40} x2={0} y2={0} stroke="#4B5E78" strokeWidth={2.8} />
              <line x1={-26} y1={8} x2={26} y2={8} stroke="#4B5E78" strokeWidth={2.2} />
              <line x1={-20} y1={18} x2={20} y2={18} stroke="#4B5E78" strokeWidth={2} />
              <line x1={-15} y1={28} x2={15} y2={28} stroke="#4B5E78" strokeWidth={1.8} />
            </g>
            {/* Cozy lit double window */}
            <rect x={45} y={660} width={55} height={68} rx={3} fill="#FDE68A" opacity={0.7} stroke={INK} strokeWidth={2.5} />
            <line x1={72} y1={660} x2={72} y2={728} stroke="#2D1E16" strokeWidth={2} />
            <line x1={45} y1={694} x2={100} y2={694} stroke="#2D1E16" strokeWidth={2} />
            {/* Window curtain silhouette */}
            <path d="M 45 660 Q 62 680 45 710 L 45 660 Z" fill="#24140D" opacity={0.65} />
            <path d="M 100 660 Q 83 680 100 710 L 100 660 Z" fill="#24140D" opacity={0.65} />
          </g>

          {/* House 2 (x: 230..490): Roof terrace with stainless steel water tank (`bồn inox Sơn Hà`) */}
          <g>
            <rect x={235} y={595} width={250} height={455} fill="#18243A" stroke={INK} strokeWidth={3.5} />
            {/* Terrace parapet & balustrade */}
            <rect x={230} y={588} width={260} height={12} rx={2} fill="#243350" stroke={INK} strokeWidth={2} />
            {/* Staircase penthouse (`chuồng cu tum thang`) */}
            <rect x={245} y={545} width={68} height={45} rx={3} fill="#141E32" stroke={INK} strokeWidth={2.5} />
            <polygon points="240,545 280,530 318,545" fill="#2D1B17" stroke={INK} strokeWidth={2} />

            {/* STAINLESS STEEL HORIZONTAL WATER TANK (`bồn nước inox Sơn Hà`) */}
            <g transform="translate(370 548)">
              {/* Steel angle stand (`chân đỡ thép V`) */}
              <line x1={10} y1={36} x2={6} y2={44} stroke="#4B5E78" strokeWidth={2.8} />
              <line x1={65} y1={36} x2={69} y2={44} stroke="#4B5E78" strokeWidth={2.8} />
              <line x1={6} y1={44} x2={69} y2={44} stroke="#4B5E78" strokeWidth={2.2} />
              {/* Cylindrical tank body */}
              <rect x={6} y={6} width={64} height={32} rx={14} fill="#4B6082" stroke={INK} strokeWidth={2.5} />
              {/* Chrome specular highlights on stainless steel */}
              <line x1={12} y1={12} x2={64} y2={12} stroke="#CBD5E1" strokeWidth={2.5} opacity={0.85} />
              <line x1={14} y1={16} x2={62} y2={16} stroke="#E2E8F0" strokeWidth={1.5} opacity={0.65} />
              {/* Circumferential rib rings */}
              <line x1={26} y1={6} x2={26} y2={38} stroke="#2D3B52" strokeWidth={2} />
              <line x1={50} y1={6} x2={50} y2={38} stroke="#2D3B52" strokeWidth={2} />
            </g>

            {/* Lit bedroom window (cool fluorescent blue) */}
            <rect x={275} y={640} width={62} height={62} rx={3} fill="#7DD3FC" opacity={0.65} stroke={INK} strokeWidth={2.5} />
            <line x1={306} y1={640} x2={306} y2={702} stroke="#102538" strokeWidth={2} />
            {/* Outdoor AC unit below window */}
            <rect x={360} y={655} width={42} height={26} rx={2} fill="#243348" stroke={INK} strokeWidth={2} />
            <circle cx={374} cy={668} r={8} fill="#141E2C" />
          </g>

          {/* House 3 (x: 470..710): Balcony with iron security cage ("chuồng cọp") */}
          <g>
            <rect x={475} y={635} width={230} height={415} fill="#131C30" stroke={INK} strokeWidth={3.5} />
            <rect x={470} y={628} width={240} height={10} rx={2} fill="#202D46" stroke={INK} strokeWidth={2} />
            {/* Balcony iron cage (`chuồng cọp`) */}
            <g transform="translate(500 660)">
              <rect x={0} y={0} width={120} height={70} fill="#0E1626" stroke={INK} strokeWidth={2.5} />
              {Array.from({ length: 7 }).map((_, i) => (
                <line key={i} x1={15 + i * 16} y1={0} x2={15 + i * 16} y2={70} stroke="#32445E" strokeWidth={2} />
              ))}
              <line x1={0} y1={25} x2={120} y2={25} stroke="#32445E" strokeWidth={2} />
              <line x1={0} y1={48} x2={120} y2={48} stroke="#32445E" strokeWidth={2} />
              {/* Laundry hanging inside */}
              <line x1={10} y1={12} x2={110} y2={12} stroke="#5C4535" strokeWidth={2} />
              <rect x={25} y={14} width={26} height={32} rx={1} fill="#1E3048" opacity={0.7} />
              <rect x={65} y={14} width={28} height={38} rx={1} fill="#422C38" opacity={0.65} />
            </g>
          </g>

          {/* House 4 (x: 690..970): Shophouse rooftop with green window & satellite dish */}
          <g>
            <rect x={695} y={605} width={265} height={445} fill="#172238" stroke={INK} strokeWidth={3.5} />
            <rect x={690} y={598} width={275} height={12} rx={2} fill="#263654" stroke={INK} strokeWidth={2} />

            {/* Satellite dish bowl (`chảo thu vệ tinh`) */}
            <g transform="translate(735 565)">
              <line x1={0} y1={36} x2={0} y2={18} stroke="#5A6D88" strokeWidth={3} />
              <path d="M -18 4 Q 0 24 18 20" fill="none" stroke="#7A90AD" strokeWidth={3.5} strokeLinecap="round" />
              <line x1={0} y1={14} x2={-10} y2={6} stroke="#CBD5E1" strokeWidth={1.8} />
              <circle cx={-10} cy={6} r={2.5} fill="#EF4444" />
            </g>

            {/* French-colonial green louvered window */}
            <g transform="translate(800 635)">
              <rect x={0} y={0} width={68} height={82} rx={4} fill="#1A2D23" stroke={INK} strokeWidth={2.5} />
              <rect x={6} y={6} width={56} height={70} rx={2} fill="#0E1C15" />
              {[-12, 6, 24, 42, 60].map((ly, i) => (
                <line key={i} x1={10} y1={ly + 14} x2={58} y2={ly + 14} stroke="#274635" strokeWidth={2} />
              ))}
            </g>
            {/* Adjacent warm lit window */}
            <rect x={890} y={640} width={48} height={60} rx={2} fill="#FBBF24" opacity={0.7} stroke={INK} strokeWidth={2.2} />
          </g>

          {/* House 5 (x: 950..1200): Apartment block with lit warm windows */}
          <g>
            <rect x={950} y={630} width={240} height={420} fill="#141D31" stroke={INK} strokeWidth={3.5} />
            <rect x={945} y={622} width={250} height={10} rx={2} fill="#22304C" stroke={INK} strokeWidth={2} />
            {/* Potted plants on terrace parapet */}
            <g transform="translate(980 610) scale(0.65)">
              <polygon points="-12,0 12,0 8,18 -8,18" fill="#3D2017" stroke={INK} strokeWidth={2} />
              <path d="M -6 -2 Q -12 -18 -4 -28 Q 0 -14 -2 -2" fill="#183622" />
              <path d="M 4 -2 Q 10 -22 2 -32 Q -2 -16 2 -2" fill="#224A2E" />
            </g>
            <g transform="translate(1015 610) scale(0.65)">
              <polygon points="-12,0 12,0 8,18 -8,18" fill="#3D2017" stroke={INK} strokeWidth={2} />
              <path d="M -4 -2 Q 4 -22 -2 -30" fill="none" stroke="#224A2E" strokeWidth={3} />
            </g>

            {/* Lit living room windows */}
            <rect x={985} y={660} width={60} height={68} rx={3} fill="#FDE68A" opacity={0.72} stroke={INK} strokeWidth={2.5} />
            <line x1={1015} y1={660} x2={1015} y2={728} stroke="#322216" strokeWidth={2} />
            <rect x={1080} y={665} width={55} height={62} rx={3} fill="#7DD3FC" opacity={0.58} stroke={INK} strokeWidth={2.5} />
          </g>

          {/* House 6 (x: 1180..1440): Angled roof terrace & rooftop water tank */}
          <g>
            <rect x={1180} y={590} width={255} height={460} fill="#18243B" stroke={INK} strokeWidth={3.5} />
            <rect x={1175} y={582} width={265} height={12} rx={2} fill="#283A5A" stroke={INK} strokeWidth={2} />

            {/* Stainless steel water tank */}
            <g transform="translate(1225 540)">
              <line x1={8} y1={36} x2={5} y2={44} stroke="#4B5E78" strokeWidth={2.8} />
              <line x1={62} y1={36} x2={65} y2={44} stroke="#4B5E78" strokeWidth={2.8} />
              <rect x={5} y={6} width={60} height={32} rx={14} fill="#4B6082" stroke={INK} strokeWidth={2.5} />
              <line x1={10} y1={12} x2={60} y2={12} stroke="#CBD5E1" strokeWidth={2.5} opacity={0.85} />
            </g>

            {/* TV antenna */}
            <g transform="translate(1360 520)">
              <line x1={0} y1={65} x2={0} y2={0} stroke="#4B5E78" strokeWidth={2.5} />
              <line x1={-20} y1={12} x2={20} y2={12} stroke="#4B5E78" strokeWidth={2} />
              <line x1={-14} y1={24} x2={14} y2={24} stroke="#4B5E78" strokeWidth={1.8} />
            </g>

            {/* Warm windows */}
            <rect x={1230} y={640} width={56} height={64} rx={3} fill="#FBBF24" opacity={0.68} stroke={INK} strokeWidth={2.5} />
            <rect x={1320} y={645} width={58} height={58} rx={3} fill="#FDE68A" opacity={0.7} stroke={INK} strokeWidth={2.5} />
          </g>

          {/* House 7 & 8 (x: 1420..1920): High tube houses & rooftop antennas */}
          <g>
            <rect x={1430} y={625} width={240} height={425} fill="#141E33" stroke={INK} strokeWidth={3.5} />
            <rect x={1660} y={600} width={270} height={450} fill="#162036" stroke={INK} strokeWidth={3.5} />
            <rect x={1655} y={592} width={280} height={12} rx={2} fill="#253552" stroke={INK} strokeWidth={2} />

            {/* Windows */}
            <rect x={1480} y={665} width={52} height={60} rx={2} fill="#FDE68A" opacity={0.7} stroke={INK} strokeWidth={2.5} />
            <rect x={1710} y={635} width={58} height={66} rx={3} fill="#7DD3FC" opacity={0.65} stroke={INK} strokeWidth={2.5} />
            <rect x={1805} y={640} width={55} height={60} rx={3} fill="#FBBF24" opacity={0.68} stroke={INK} strokeWidth={2.5} />
          </g>
        </g>

        {/* Overhead utility pole & sagging black power cables across rooftops */}
        <g>
          <rect x={1520} y={545} width={18} height={535} fill="#1B2230" stroke={INK} strokeWidth={3} />
          <rect x={1480} y={570} width={96} height={10} rx={2} fill="#283246" stroke={INK} strokeWidth={2.5} />
          {/* Porcelain insulator bells */}
          {[-38, -12, 14, 38].map((ix, i) => (
            <ellipse key={i} cx={1528 + ix} cy={567} rx={4.5} ry={6} fill="#CBD5E1" stroke="#0F172A" strokeWidth={1.5} />
          ))}
          <path d="M 0 685 Q 760 765 1528 575 Q 1740 635 1920 615" stroke="#090D16" strokeWidth={3.2} fill="none" />
          <path d="M 0 710 Q 760 790 1528 592 Q 1740 652 1920 635" stroke="#090D16" strokeWidth={2.4} fill="none" />
        </g>

        {/* ================================================================= */}
        {/* 6. LAYER 3: FOREGROUND NEAR-LEFT ROOFTOP AWNING & PERCHED OWL (C0-B)*/}
        {/* ================================================================= */}
        <g transform="translate(0 130)">
          {/* Corrugated tin roof eave of near-left house (`mái tôn đầu hẻm`) */}
          <polygon points="-40,590 540,685 500,745 -40,665" fill="#232B3A" stroke={INK} strokeWidth={4} />
          <polygon points="-40,665 310,715 310,1180 -40,1180" fill="#131824" stroke={INK} strokeWidth={4} />
          {/* Corrugated roof ribs with edge highlights */}
          {[40, 120, 200, 280, 360, 440].map((lx, i) => (
            <line key={i} x1={lx} y1={604 + i * 13} x2={lx - 26} y2={658 + i * 13} stroke="#3B4963" strokeWidth={2.8} />
          ))}
          {/* Perched Owl on the iron roof bracket (`ANIMAL-CU` at C0-B) */}
          {showOwl ? <PerchingOwl x={435} y={765} s={1.08} headTurn={0.4} showBracket /> : null}
        </g>
      </g>
    </g>
  );
};


/**
 * `PasserbyShadow` (`EXTRA-BONG` — 2–3 bóng người qua đường ít chi tiết ở C0-D, C0-E):
 * Dark grey-brown muted silhouettes walking past the outer alley mouth or far alley background.
 * Grounded with contact shadow on the road (`chân chạm mặt đường, không làm trong suốt như ma`).
 */
export const PasserbyShadow: React.FC<{
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  stride?: number;
  variant?: 'bag' | 'cap' | 'coat';
}> = ({ x, y, s = 1, flip = false, stride = 0.3, variant = 'bag' }) => {
  const legSwing = Math.sin(stride * Math.PI * 2) * 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {/* Ground contact shadow (`chân chạm đất có bóng tiếp xúc`) */}
      <ellipse cx={0} cy={4} rx={36} ry={8} fill="#05070D" opacity={0.68} />
      {/* Back leg */}
      <path
        d={`M -6 -76 L ${-10 - legSwing} -34 L ${-14 - legSwing * 1.1} 0`}
        stroke="#1C2230"
        strokeWidth={14}
        strokeLinecap="round"
        fill="none"
      />
      {/* Front leg */}
      <path
        d={`M 6 -76 L ${10 + legSwing} -34 L ${14 + legSwing * 1.1} 0`}
        stroke="#232A3A"
        strokeWidth={14}
        strokeLinecap="round"
        fill="none"
      />
      {/* Torso / jacket silhouette (muted dark grey-slate, no facial features) */}
      <path
        d="M -22 -156 C -28 -126 -24 -88 -18 -72 L 20 -72 C 26 -88 28 -126 20 -156 Z"
        fill={variant === 'coat' ? '#252B38' : '#1F2533'}
        stroke="#10141D"
        strokeWidth={2.5}
      />
      {/* Swinging arm */}
      <path
        d={`M 4 -148 L ${12 - legSwing * 0.7} -108 L ${16 - legSwing * 0.5} -78`}
        stroke="#283040"
        strokeWidth={11}
        strokeLinecap="round"
        fill="none"
      />
      {/* Optional shoulder bag (`túi đeo vai`) */}
      {variant === 'bag' ? (
        <rect x={-26} y={-112} width={22} height={28} rx={4} fill="#171C26" stroke="#0E121A" strokeWidth={2} />
      ) : null}
      {/* Head silhouette */}
      <circle cx={2} cy={-176} r={16} fill="#1F2533" stroke="#10141D" strokeWidth={2.2} />
      {variant === 'cap' ? (
        <path d="M -14 -182 Q 2 -196 18 -182 L 26 -178 L -14 -178 Z" fill="#171C26" />
      ) : null}
    </g>
  );
};

/**
 * `AlleyExteriorScene` (`SET-HEM-EXT` — Con hẻm ban đêm nhìn từ mái hiên chỗ con cú xuống cửa tiệm ông Lộc ở C0-D, C0-E, C0-F):
 * - Left foreground (`x ≈ 0..380`): High house eave & iron bracket where the owl (`PerchingOwl`) perches looking down into the alley.
 * - Left midground (`x ≈ 220..680`): Alley houses & cold fluorescent grocery/convenience store spill (`ánh đèn tạp hóa trắng lạnh`).
 * - Center alley road (`Lòng hẻm`): Wet-sheen asphalt/concrete alley floor with streetlamp pools and 2–3 muted `PasserbyShadow` figures (`EXTRA-BONG`).
 * - Right side (`x ≈ 1180..1760`): Ông Lộc's shop exterior (`TIỆM ÔNG LỘC`) with half-pulled folding iron gate (`cửa sắt kéo mở hé`),
 *   weathered sign `"SỬA ĐỒNG HỒ - ĐIỆN THOẠI CŨ"`, and warm amber light spilling onto the alley threshold where Duy & Thảo stop (`C0-E`) and enter (`C0-F`).
 */
export const AlleyExteriorScene: React.FC<{
  t?: number;
  showOwl?: boolean;
  showPassersby?: boolean;
  showCat?: boolean;
  shopClose?: number; // 0 open .. 1 shutter down and the doorway light gone
  shopGone?: number; // 0 shop .. 1 only old wall where it stood
}> = ({ t = 0, showOwl = true, showPassersby = false, showCat = true, shopClose = 0, shopGone = 0 }) => (
  <g>
    <defs>
      {/* Deep midnight alley sky gradient */}
      <linearGradient id="hemSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#03050C" />
        <stop offset="60%" stopColor="#080E1A" />
        <stop offset="100%" stopColor="#0E1624" />
      </linearGradient>

      {/* Dark damp nocturnal asphalt pavement */}
      <linearGradient id="hemRoad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0D111A" />
        <stop offset="40%" stopColor="#111622" />
        <stop offset="100%" stopColor="#080B10" />
      </linearGradient>

      {/* Gentle, atmospheric warm amber radial falloff for shop doorway spill onto the dark pavement */}
      <radialGradient id="tiemWarmSpillRadial" cx="84%" cy="26%" r="92%">
        <stop offset="0%" stopColor="#FFE4A0" stopOpacity={0.65} />
        <stop offset="25%" stopColor="#F59E0B" stopOpacity={0.42} />
        <stop offset="55%" stopColor="#D97706" stopOpacity={0.2} />
        <stop offset="80%" stopColor="#8C3B12" stopOpacity={0.06} />
        <stop offset="100%" stopColor="#3E180C" stopOpacity={0} />
      </radialGradient>

      {/* Rich warm amber interior room lighting for Ông Lộc's workshop */}
      <radialGradient id="tiemInteriorGlow" cx="42%" cy="48%" r="65%">
        <stop offset="0%" stopColor="#FFEBB0" stopOpacity={0.82} />
        <stop offset="35%" stopColor="#E69528" stopOpacity={0.55} />
        <stop offset="70%" stopColor="#92400E" stopOpacity={0.3} />
        <stop offset="100%" stopColor="#3E1608" stopOpacity={0.12} />
      </radialGradient>

      {/* Focused warm cone from jeweler's workbench desk lamp */}
      <radialGradient id="tiemDeskLight" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#FFF4D0" stopOpacity={0.78} />
        <stop offset="45%" stopColor="#FBBF24" stopOpacity={0.38} />
        <stop offset="100%" stopColor="#B45309" stopOpacity={0} />
      </radialGradient>

      {/* Subtle damp green moss creeping up wall footings */}
      <linearGradient id="mossFade" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#0E1D13" stopOpacity={0.92} />
        <stop offset="60%" stopColor="#0E1D13" stopOpacity={0.38} />
        <stop offset="100%" stopColor="#0E1D13" stopOpacity={0} />
      </linearGradient>

      {/* Humid tropical night ground mist hugging the dark alley pavement */}
      <linearGradient id="hemGroundMist" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#151E2D" stopOpacity={0.35} />
        <stop offset="50%" stopColor="#0F1724" stopOpacity={0.15} />
        <stop offset="100%" stopColor="#090E18" stopOpacity={0} />
      </linearGradient>

      {/* Deep chiaroscuro peripheral vignettes for the dark nocturnal alley */}
      <radialGradient id="alleyVignetteFalloff" cx="54%" cy="64%" r="68%">
        <stop offset="0%" stopColor="#010205" stopOpacity={0} />
        <stop offset="40%" stopColor="#010205" stopOpacity={0} />
        <stop offset="68%" stopColor="#020409" stopOpacity={0.42} />
        <stop offset="86%" stopColor="#010206" stopOpacity={0.75} />
        <stop offset="100%" stopColor="#000103" stopOpacity={0.92} />
      </radialGradient>
      <linearGradient id="alleyDeepShadowTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#010205" stopOpacity={0.9} />
        <stop offset="30%" stopColor="#020308" stopOpacity={0.5} />
        <stop offset="70%" stopColor="#020308" stopOpacity={0.15} />
        <stop offset="100%" stopColor="#020308" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="alleyDeepShadowLeft" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#010205" stopOpacity={0.85} />
        <stop offset="35%" stopColor="#02040B" stopOpacity={0.52} />
        <stop offset="75%" stopColor="#02040B" stopOpacity={0.14} />
        <stop offset="100%" stopColor="#02040B" stopOpacity={0} />
      </linearGradient>

      {/* Atmospheric Soft-Focus Filters */}
      <filter id="hemLightFeather" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="24" />
      </filter>
      <filter id="hemSpillFeather" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="34" />
      </filter>
      <filter id="hemFloorFeather" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="30" />
      </filter>
      <filter id="hemSoftBloom" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="26" />
      </filter>
      <filter id="hemFloorWetSheen" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="16 5" />
      </filter>
      <filter id="hemAlleyMist" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="26 8" />
      </filter>
    </defs>

    {/* ===================================================================== */}
    {/* 1. NARROW NOCTURNAL SKY STRIP (Bầu trời đêm tĩnh mịch giữa hai mái nhà) */}
    {/* ===================================================================== */}
    <rect x={-300} y={-200} width={2600} height={1700} fill="url(#hemSky)" />
    {[
      [710, 42, 1.4], [820, 68, 1.2], [910, 32, 1.5], [1010, 76, 1.3], [870, 98, 1.1],
    ].map(([sx, sy, sr], i) => (
      <circle key={i} cx={sx} cy={sy} r={sr} fill="#CBD5E1" opacity={0.55} />
    ))}

    {/* ===================================================================== */}
    {/* 2. DEAD-END WALL AT THE BACK (Bức tường ngõ cụt chật hẹp, rêu phong)  */}
    {/* ===================================================================== */}
    <g>
      {/* Weathered concrete plaster wall closing off the alley termination */}
      <rect x={540} y={85} width={645} height={615} fill="#141B26" stroke={INK} strokeWidth={4} />
      {/* Heavy concrete coping with drip groove along top of dead-end wall */}
      <rect x={530} y={76} width={665} height={18} rx={2} fill="#1F2836" stroke={INK} strokeWidth={3} />
      {/* Broken glass bottle shards cemented into coping (`mảnh chai cắm trên tường chống trộm`) */}
      {[545, 590, 640, 690, 740, 790, 840, 890, 940, 990, 1040, 1090, 1140, 1175].map((gx, i) => (
        <polygon
          key={i}
          points={`${gx},76 ${gx + 5},${60 + (i % 3) * 6} ${gx + 9},76`}
          fill={i % 2 === 0 ? '#33583B' : '#455E72'}
          stroke="#090E16"
          strokeWidth={1.2}
          opacity={0.85}
        />
      ))}
      {/* Dark damp green moss rising from ground base */}
      <rect x={540} y={480} width={645} height={220} fill="url(#mossFade)" />

      {/* Weathered peeling plaster exposing aged red brick courses beneath */}
      <g transform="translate(760 260)">
        <polygon points="0,0 145,-10 152,72 118,92 -8,78" fill="#3E2017" stroke="#0D090D" strokeWidth={2} />
        {[18, 38, 58].map((by, i) => (
          <line key={i} x1={-6} y1={by} x2={148} y2={by - 2} stroke="#28140E" strokeWidth={2} />
        ))}
        {[
          [24, 0], [70, 0], [116, 0],
          [46, 18], [94, 18],
          [22, 38], [72, 38], [120, 38],
          [44, 58], [92, 58],
        ].map(([bx, by], i) => (
          <line key={i} x1={bx} y1={by} x2={bx} y2={by + 18} stroke="#28140E" strokeWidth={1.8} />
        ))}
      </g>

      {/* 3 Vietnamese concrete ventilation blocks (`gạch hoa thông gió`) */}
      {[675, 960, 1010].map((gx, i) => (
        <g key={i} transform={`translate(${gx} 160)`}>
          <rect x={0} y={0} width={40} height={40} rx={3} fill="#0F141D" stroke="#070A0F" strokeWidth={2.5} />
          <rect x={6} y={6} width={28} height={28} rx={2} fill="#06090D" />
          <path d="M 20 6 L 20 34 M 6 20 L 34 20" stroke="#161D27" strokeWidth={3} strokeLinecap="round" />
          <circle cx={20} cy={20} r={5} fill="#04060A" />
        </g>
      ))}

      {/* Locked rusty iron emergency alley gate (`cổng sắt khóa xích ngõ cụt`) */}
      <g transform="translate(605 325)">
        <rect x={0} y={0} width={128} height={375} fill="#100D12" stroke={INK} strokeWidth={3.5} />
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={i} x1={12 + i * 20} y1={12} x2={12 + i * 20} y2={363} stroke="#221A20" strokeWidth={3} />
        ))}
        <line x1={8} y1={80} x2={120} y2={225} stroke="#30222C" strokeWidth={4} />
        <line x1={8} y1={225} x2={120} y2={80} stroke="#30222C" strokeWidth={4} />
        <rect x={51} y={192} width={26} height={34} rx={4} fill="#422C1E" stroke="#0E0C0D" strokeWidth={2} />
        <circle cx={64} cy={205} r={3} fill="#0A090C" />
      </g>

      {/* =================================================================== */}
      {/* 1. Street Graffiti: CẤM ĐÁI BẬY with iconic red slashed silhouette */}
      {/* =================================================================== */}
      <g transform="translate(775 435)">
        {/* Red spray slashed circle icon */}
        <g transform="translate(-46 0)">
          <circle cx={0} cy={0} r={19} fill="none" stroke="#D32F2F" strokeWidth={3.5} opacity={0.82} />
          <line x1={-13} y1={-13} x2={13} y2={13} stroke="#D32F2F" strokeWidth={3.5} opacity={0.82} strokeLinecap="round" />
          {/* Urinating stick figure silhouette */}
          <circle cx={-3} cy={-8} r={2.8} fill="#8B1E1E" opacity={0.8} />
          <line x1={-3} y1={-5} x2={-3} y2={6} stroke="#8B1E1E" strokeWidth={2.2} opacity={0.8} strokeLinecap="round" />
          <line x1={-3} y1={6} x2={-7} y2={14} stroke="#8B1E1E" strokeWidth={2} opacity={0.8} strokeLinecap="round" />
          <line x1={-3} y1={6} x2={2} y2={14} stroke="#8B1E1E" strokeWidth={2} opacity={0.8} strokeLinecap="round" />
          <path d="M -1 5 Q 6 3 8 9" fill="none" stroke="#B8860B" strokeWidth={1.5} opacity={0.7} strokeDasharray="2 2" />
        </g>
        {/* Spray text: CẤM ĐÁI BẬY! */}
        <g transform="translate(20 0)">
          <text
            x={0}
            y={2}
            fill="#EF4444"
            opacity={0.35}
            fontFamily="'Impact', 'Arial Black', sans-serif"
            fontWeight={900}
            fontSize={20}
            letterSpacing={2}
            filter="url(#neonGlow)"
          >
            CẤM ĐÁI BẬY!
          </text>
          <text
            x={0}
            y={2}
            fill="#D32F2F"
            opacity={0.88}
            fontFamily="'Impact', 'Arial Black', sans-serif"
            fontWeight={900}
            fontSize={20}
            letterSpacing={2}
          >
            CẤM ĐÁI BẬY!
          </text>
          <path d="M 0 12 Q 65 14 135 10" fill="none" stroke="#D32F2F" strokeWidth={2.8} strokeLinecap="round" opacity={0.8} />
          <line x1={25} y1={12} x2={25} y2={26} stroke="#991B1B" strokeWidth={1.8} opacity={0.7} strokeLinecap="round" />
          <line x1={76} y1={13} x2={76} y2={22} stroke="#991B1B" strokeWidth={1.5} opacity={0.65} strokeLinecap="round" />
          <line x1={118} y1={11} x2={118} y2={29} stroke="#991B1B" strokeWidth={1.8} opacity={0.7} strokeLinecap="round" />
        </g>
      </g>

      {/* =================================================================== */}
      {/* 2. MUNICIPAL GREEN WHEELIE BIN, TRASH BAGS & BUZZING FLIES         */}
      {/* =================================================================== */}
      <g id="alleyWasteStation">
        {/* Dark damp ground stain / leachate seep under waste bin and bags */}
        <ellipse cx={795} cy={697} rx={74} ry={11} fill="#06090F" opacity={0.78} />

        {/* LARGE GREEN MUNICIPAL WHEELIE TRASH BIN (`thùng rác xanh to 120L`) */}
        <g id="greenWheelieBin" transform="translate(764 646)">
          {/* Bin contact shadow */}
          <ellipse cx={0} cy={53} rx={30} ry={7} fill="#05070C" opacity={0.82} />

          {/* Two heavy-duty black rubber wheels at rear bottom */}
          <circle cx={-22} cy={49} r={8.5} fill="#0A0E14" stroke="#05070A" strokeWidth={2} />
          <circle cx={-22} cy={49} r={3.5} fill="#3E4C5E" />
          <circle cx={22} cy={49} r={8.5} fill="#0A0E14" stroke="#05070A" strokeWidth={2} />
          <circle cx={22} cy={49} r={3.5} fill="#3E4C5E" />
          <line x1={-22} y1={49} x2={22} y2={49} stroke="#1E293B" strokeWidth={3} />

          {/* Trapezoidal Bin Body (tapered downward) */}
          <polygon
            points="-25,-38 25,-38 20,46 -20,46"
            fill="#1B5E32"
            stroke="#0A2614"
            strokeWidth={3}
          />
          {/* Edge highlight reflecting ambient street gloom */}
          <line x1={-23} y1={-36} x2={-18} y2={44} stroke="#2E7D42" strokeWidth={2} />
          {/* Vertical reinforcing ribs */}
          <line x1={-8} y1={-30} x2={-6} y2={40} stroke="#144826" strokeWidth={2.5} />
          <line x1={8} y1={-30} x2={6} y2={40} stroke="#144826" strokeWidth={2.5} />

          {/* Faded municipal stencil on bin front: 120L */}
          <g transform="translate(0 2)" opacity={0.65}>
            <rect x={-14} y={-10} width={28} height={18} rx={2} fill="none" stroke="#86EFAC" strokeWidth={1.2} strokeDasharray="3 2" />
            <text x={0} y={3} textAnchor="middle" fill="#86EFAC" fontFamily="sans-serif" fontWeight={800} fontSize={10} letterSpacing={1}>
              120L
            </text>
          </g>

          {/* Heavy Hinged Lid with front lift lip */}
          <polygon points="-28,-44 28,-44 26,-36 -26,-36" fill="#236B3B" stroke="#0A2614" strokeWidth={2.5} />
          <rect x={-10} y={-47} width={20} height={4} rx={1.5} fill="#2E7D42" stroke="#0A2614" strokeWidth={1.5} />
          {/* Rear push handle */}
          <path d="M -26 -40 L -33 -40 L -33 -15" fill="none" stroke="#0E331B" strokeWidth={3.5} strokeLinecap="round" />
          <path d="M 26 -40 L 33 -40 L 33 -15" fill="none" stroke="#0E331B" strokeWidth={3.5} strokeLinecap="round" />
        </g>

        {/* PILE OF DISCARDED TRASH BAGS LEANING BESIDE GREEN BIN */}
        {/* Bag 1: Big black heavy-duty trash bag (túi rác đen bóng phồng thắt tai thỏ) */}
        <g transform="translate(814 672)">
          <ellipse cx={0} cy={22} rx={26} ry={7} fill="#05070C" opacity={0.8} />
          <path
            d="M -24 14 C -34 4 -30 -14 -16 -22 C -6 -28 14 -26 24 -18 C 34 -8 34 8 24 18 C 14 26 -14 24 -24 14 Z"
            fill="#12161E"
            stroke="#07090E"
            strokeWidth={2.4}
          />
          <path d="M -16 -12 Q -4 -16 8 -10" fill="none" stroke="#263445" strokeWidth={2} strokeLinecap="round" />
          <path d="M -20 2 Q -4 -4 16 -1" fill="none" stroke="#263445" strokeWidth={2.2} strokeLinecap="round" />
          <path d="M -10 12 Q 6 14 18 8" fill="none" stroke="#1D2736" strokeWidth={1.8} strokeLinecap="round" />
          <path d="M -5 -22 C -10 -31 -3 -34 0 -26 C 3 -34 10 -31 5 -22 Z" fill="#0C1017" stroke="#05070C" strokeWidth={2} />
        </g>

        {/* Bag 2: Medium blue translucent plastic trash bag (túi xốp xanh cột miệng) */}
        <g transform="translate(848 678)">
          <ellipse cx={0} cy={16} rx={20} ry={6} fill="#05070C" opacity={0.7} />
          <path
            d="M -18 10 C -25 3 -22 -10 -12 -16 C -3 -20 12 -18 18 -11 C 24 -4 23 8 16 14 C 8 20 -10 18 -18 10 Z"
            fill="#1B334E"
            stroke="#091422"
            strokeWidth={2.2}
          />
          <path d="M -10 -8 Q 0 -12 10 -6" fill="none" stroke="#2D5076" strokeWidth={1.8} strokeLinecap="round" />
          <path d="M -12 2 Q 0 5 12 0" fill="none" stroke="#223E5C" strokeWidth={1.8} strokeLinecap="round" />
          <path d="M -4 -16 Q -6 -24 -2 -22 Q 2 -24 4 -16" fill="none" stroke="#102235" strokeWidth={3} strokeLinecap="round" />
        </g>

        {/* Bag 3: Small white plastic grocery bag in front */}
        <g transform="translate(792 686)">
          <path
            d="M -12 7 C -16 2 -14 -6 -8 -10 C -2 -13 8 -11 13 -6 C 17 -1 16 6 12 10 C 6 14 -6 13 -12 7 Z"
            fill="#384556"
            stroke="#131822"
            strokeWidth={1.8}
          />
          <path d="M -6 -4 Q 0 -6 7 -2" fill="none" stroke="#52647C" strokeWidth={1.5} strokeLinecap="round" />
          <circle cx={1} cy={-11} r={2.5} fill="#273240" />
        </g>

        {/* Discarded crumpled takeout box & crushed drink can */}
        <g transform="translate(872 690) rotate(18)">
          <rect x={-7} y={-9} width={14} height={18} rx={2} fill="#3A281E" stroke="#120D09" strokeWidth={1.6} />
          <line x1={-5} y1={-2} x2={5} y2={-2} stroke="#7D4E35" strokeWidth={1.4} />
        </g>

        {/* BUZZING FLIES HOVERING AROUND TRASH (`những con ruồi bay vo ve`) */}
        <g id="buzzingFlies">
          {[
            { bx: 752, by: 635, rx: 16, ry: 9, sx: 1.1, sy: 1.7, ph: 0 },
            { bx: 778, by: 615, rx: 14, ry: 11, sx: 1.4, sy: 0.9, ph: 1.5 },
            { bx: 808, by: 642, rx: 19, ry: 13, sx: 0.8, sy: 1.3, ph: 3.1 },
            { bx: 832, by: 628, rx: 15, ry: 8, sx: 1.6, sy: 1.5, ph: 4.2 },
            { bx: 788, by: 658, rx: 12, ry: 7, sx: 1.2, sy: 2.1, ph: 2.0 },
            { bx: 822, by: 668, rx: 13, ry: 10, sx: 0.9, sy: 1.6, ph: 5.0 },
          ].map((f, i) => {
            const fx = f.bx + Math.sin((t * 0.35 + f.ph) * f.sx) * f.rx;
            const fy = f.by + Math.cos((t * 0.42 + f.ph) * f.sy) * f.ry;
            return (
              <g key={i} transform={`translate(${fx} ${fy})`}>
                <ellipse cx={-1} cy={-1.5} rx={2} ry={1} fill="#CBD5E1" opacity={0.6} transform="rotate(-25)" />
                <ellipse cx={1} cy={-1.5} rx={2} ry={1} fill="#CBD5E1" opacity={0.6} transform="rotate(25)" />
                <ellipse cx={0} cy={0} rx={1.4} ry={1} fill="#0A0D14" />
              </g>
            );
          })}
          {/* Chaotic flight loop trails */}
          <path
            d="M 752 635 Q 768 618 778 632 T 808 622 T 832 640"
            fill="none"
            stroke="#64748B"
            strokeWidth={0.8}
            strokeDasharray="2 3"
            opacity={0.32}
          />
          <path
            d="M 778 658 Q 796 642 808 662 T 832 650"
            fill="none"
            stroke="#64748B"
            strokeWidth={0.8}
            strokeDasharray="2 3"
            opacity={0.28}
          />
        </g>
      </g>

      {/* Vertical PVC drain pipe running down the dead-end wall */}
      <line x1={1156} y1={88} x2={1156} y2={700} stroke="#1C2430" strokeWidth={8} />
      <line x1={1154} y1={88} x2={1154} y2={700} stroke="#283344" strokeWidth={3} />
      {[205, 385, 555].map((by, i) => (
        <rect key={i} x={1148} y={by} width={16} height={6} rx={1} fill="#0E121A" stroke="#070A0E" strokeWidth={1.5} />
      ))}

      {/* Faded red stencil on dead-end wall: CẤM ĐỔ RÁC (iconic Vietnamese alley feature) */}
      <g transform="translate(895 500)">
        <rect x={-75} y={-16} width={150} height={25} rx={2} fill="none" stroke="#882222" strokeWidth={1.5} opacity={0.45} strokeDasharray="6 3" />
        <text
          x={0}
          y={2}
          textAnchor="middle"
          fill="#882222"
          opacity={0.58}
          fontFamily="sans-serif"
          fontWeight={800}
          fontSize={15}
          letterSpacing={2.2}
        >
          CẤM ĐỔ RÁC
        </text>
      </g>
    </g>

    {/* ===================================================================== */}
    {/* 3. ALLEY ROAD PAVEMENT (Lòng ngõ hẻm chật hẹp, ẩm ướt trong bóng tối)  */}
    {/* ===================================================================== */}
    <g>
      {/* Tightly tapered alley perspective: narrow width at back wall to foreground */}
      <polygon points="570,700 1180,700 1960,1400 120,1400" fill="url(#hemRoad)" stroke={INK} strokeWidth={4} />
      {/* Pavement seam lines & asphalt joins */}
      <line x1={810} y1={700} x2={680} y2={1400} stroke="#070A0E" strokeWidth={3} strokeDasharray="16 12" opacity={0.6} />
      {[760, 840, 935, 1035, 1150, 1280].map((ry, i) => (
        <line key={i} x1={450 - i * 90} y1={ry} x2={1240 + i * 180} y2={ry} stroke="#0A0E15" strokeWidth={2.2} opacity={0.5} />
      ))}

      {/* Left drainage curb along alley wall (`gờ rãnh thoát nước bên trái`) */}
      <polygon points="570,700 595,700 170,1400 120,1400" fill="#070A0F" stroke={INK} strokeWidth={2} />
      <line x1={595} y1={700} x2={170} y2={1400} stroke="#141B26" strokeWidth={2.5} />

      {/* Right drainage curb along shop front wall (`gờ rãnh thoát nước bên phải`) */}
      <polygon points="1180,700 1205,700 2060,1400 2035,1400" fill="#070A0F" stroke={INK} strokeWidth={2} />
      <line x1={1205} y1={700} x2={2060} y2={1400} stroke="#141B26" strokeWidth={2.5} />

      {/* Authentic round cast-iron manhole cover with concentric ribs (`nắp cống gang tròn`) */}
      <g transform="translate(810 845)">
        <ellipse cx={0} cy={0} rx={52} ry={15} fill="#0D1118" stroke="#05070B" strokeWidth={2.5} />
        <ellipse cx={0} cy={0} rx={42} ry={12} fill="#131922" stroke="#080C11" strokeWidth={1.8} />
        <line x1={-38} y1={0} x2={38} y2={0} stroke="#0A0E13" strokeWidth={1.5} />
        <line x1={0} y1={-10} x2={0} y2={10} stroke="#0A0E13" strokeWidth={1.5} />
        <circle cx={-18} cy={-2} r={2} fill="#06090D" />
        <circle cx={18} cy={2} r={2} fill="#06090D" />
      </g>

      {/* Potted plants along alley curbs */}
      <g transform="translate(1225 725) scale(0.65)">
        <polygon points="-16,0 16,0 12,28 -12,28" fill="#46271A" stroke="#120A07" strokeWidth={2.5} />
        <rect x={-18} y={-4} width={36} height={6} rx={2} fill="#563020" stroke="#120A07" strokeWidth={2} />
        <path d="M -8 -4 Q -14 -32 -6 -48 Q 2 -28 -2 -4" fill="#183420" stroke="#08140B" strokeWidth={1.5} />
        <path d="M 4 -4 Q 12 -38 2 -52 Q -4 -30 2 -4" fill="#20422A" stroke="#08140B" strokeWidth={1.5} />
      </g>
      <g transform="translate(580 715) scale(0.6)">
        <polygon points="-15,0 15,0 11,26 -11,26" fill="#1E2C3D" stroke="#090E16" strokeWidth={2.5} />
        <rect x={-17} y={-4} width={34} height={6} rx={2} fill="#283A50" stroke="#090E16" strokeWidth={2} />
        <path d="M -6 -4 Q -12 -26 -4 -38 Q 0 -22 -2 -4" fill="#162E1D" stroke="#060F08" strokeWidth={1.5} />
        <path d="M 2 -4 Q 10 -30 2 -42 Q -2 -24 0 -4" fill="#1C3824" stroke="#060F08" strokeWidth={1.5} />
      </g>

      {/* Humid tropical night ground mist hugging the alley pavement */}
      <ellipse cx={960} cy={920} rx={740} ry={140} fill="url(#hemGroundMist)" filter="url(#hemAlleyMist)" />
    </g>

    {/* ===================================================================== */}
    {/* 3B. VINTAGE BICYCLE FOREGROUND LAYER (XE ĐẠP THỐNG NHẤT TỰA TƯỜNG)    */}
    {/* Tách riêng layer đứng trên mặt đường, rõ khối 3D, chân chống & bóng đổ */}
    {/* ===================================================================== */}
    <g id="vintageBicycle" transform="translate(1035 615)">
      {/* Soft ground contact shadows anchoring wheels and kickstand on pavement */}
      <ellipse cx={-56} cy={92} rx={36} ry={8} fill="#05070D" opacity={0.8} />
      <ellipse cx={56} cy={92} rx={36} ry={8} fill="#05070D" opacity={0.8} />
      <ellipse cx={-12} cy={95} rx={14} ry={5} fill="#05070D" opacity={0.75} />

      {/* Kickstand angled down to asphalt (`chân chống nghiêng`) */}
      <line x1={-18} y1={42} x2={-12} y2={95} stroke="#5A6D82" strokeWidth={4.5} strokeLinecap="round" />
      <line x1={-18} y1={42} x2={-12} y2={95} stroke="#8FA3B8" strokeWidth={1.8} strokeLinecap="round" />
      <rect x={-15} y={93} width={8} height={4} rx={1.5} fill="#1E293B" />

      {/* REAR WHEEL */}
      <g transform="translate(-56 46)">
        {/* Black rubber tire */}
        <circle cx={0} cy={0} r={46} fill="none" stroke="#121722" strokeWidth={8} />
        {/* Chrome steel rim */}
        <circle cx={0} cy={0} r={41} fill="none" stroke="#64748B" strokeWidth={3} />
        <circle cx={0} cy={0} r={40} fill="none" stroke="#94A3B8" strokeWidth={1} opacity={0.8} />
        {/* Spokes (tăm xe đạp) */}
        {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg, i) => (
          <line
            key={i}
            x1={0}
            y1={0}
            x2={39 * Math.cos((deg * Math.PI) / 180)}
            y2={39 * Math.sin((deg * Math.PI) / 180)}
            stroke="#8395A7"
            strokeWidth={0.9}
            opacity={0.65}
          />
        ))}
        {/* Chrome axle hub */}
        <circle cx={0} cy={0} r={7} fill="#475569" stroke="#94A3B8" strokeWidth={1.5} />
        {/* Chrome rear fender (dè chắn bùn sau) */}
        <path d="M -48 0 A 48 48 0 0 1 0 -48" fill="none" stroke="#334155" strokeWidth={5} />
        <path d="M -48 0 A 48 48 0 0 1 0 -48" fill="none" stroke="#94A3B8" strokeWidth={1.5} opacity={0.7} />
        {/* Red rear reflector (mắt mèo phản quang) */}
        <circle cx={-44} cy={-12} r={4} fill="#DC2626" stroke="#991B1B" strokeWidth={1} />
      </g>

      {/* FRONT WHEEL */}
      <g transform="translate(56 46)">
        <circle cx={0} cy={0} r={46} fill="none" stroke="#121722" strokeWidth={8} />
        <circle cx={0} cy={0} r={41} fill="none" stroke="#64748B" strokeWidth={3} />
        <circle cx={0} cy={0} r={40} fill="none" stroke="#94A3B8" strokeWidth={1} opacity={0.8} />
        {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg, i) => (
          <line
            key={i}
            x1={0}
            y1={0}
            x2={39 * Math.cos((deg * Math.PI) / 180)}
            y2={39 * Math.sin((deg * Math.PI) / 180)}
            stroke="#8395A7"
            strokeWidth={0.9}
            opacity={0.65}
          />
        ))}
        <circle cx={0} cy={0} r={7} fill="#475569" stroke="#94A3B8" strokeWidth={1.5} />
        {/* Front fender (dè chắn bùn trước) */}
        <path d="M -8 -47 A 48 48 0 0 1 45 -14" fill="none" stroke="#334155" strokeWidth={5} />
        <path d="M -8 -47 A 48 48 0 0 1 45 -14" fill="none" stroke="#94A3B8" strokeWidth={1.5} opacity={0.7} />
      </g>

      {/* VINTAGE DIAMOND FRAME (`khung xe đạp Thống Nhất sơn xanh rêu`) */}
      <line x1={-56} y1={46} x2={-10} y2={46} stroke="#1B382B" strokeWidth={5.5} strokeLinecap="round" />
      <line x1={-56} y1={46} x2={-18} y2={-5} stroke="#1B382B" strokeWidth={5.5} strokeLinecap="round" />
      <line x1={-10} y1={46} x2={-20} y2={-18} stroke="#1B382B" strokeWidth={6} strokeLinecap="round" />
      <line x1={-10} y1={46} x2={38} y2={-6} stroke="#1B382B" strokeWidth={6} strokeLinecap="round" />
      <line x1={-18} y1={-6} x2={36} y2={-8} stroke="#1B382B" strokeWidth={5.5} strokeLinecap="round" />
      <line x1={36} y1={-16} x2={40} y2={2} stroke="#1B382B" strokeWidth={6.5} strokeLinecap="round" />
      <line x1={39} y1={0} x2={56} y2={46} stroke="#1B382B" strokeWidth={5.5} strokeLinecap="round" />

      {/* Highlights along frame tubes */}
      <line x1={-18} y1={-7} x2={36} y2={-9} stroke="#487E62" strokeWidth={1.8} strokeLinecap="round" />
      <line x1={-9} y1={44} x2={37} y2={-7} stroke="#487E62" strokeWidth={1.8} strokeLinecap="round" />
      <line x1={38} y1={-1} x2={55} y2={44} stroke="#487E62" strokeWidth={1.8} strokeLinecap="round" />

      {/* Full enclosed metal chaincase (`hộp xích kim loại kín`) */}
      <polygon points="-56,46 -10,38 4,46 -10,54 -56,50" fill="#142B21" stroke="#0B1A14" strokeWidth={2} />
      <circle cx={-10} cy={46} r={14} fill="#142B21" stroke="#0B1A14" strokeWidth={2} />
      {/* Chrome pedal crank and pedal block */}
      <line x1={-10} y1={46} x2={-2} y2={62} stroke="#8FA3B8" strokeWidth={3.5} strokeLinecap="round" />
      <rect x={-8} y={60} width={12} height={6} rx={2} fill="#1E293B" stroke="#0F172A" strokeWidth={1.5} />

      {/* Rear luggage carrier rack (`gác-ba-ga kim loại`) */}
      <line x1={-64} y1={-8} x2={-16} y2={-8} stroke="#64748B" strokeWidth={4} strokeLinecap="round" />
      <line x1={-64} y1={-8} x2={-16} y2={-8} stroke="#CBD5E1" strokeWidth={1.4} strokeLinecap="round" />
      <line x1={-58} y1={-8} x2={-56} y2={44} stroke="#64748B" strokeWidth={2.5} />
      <line x1={-26} y1={-8} x2={-56} y2={44} stroke="#64748B" strokeWidth={2.5} />
      <path d="M -50 -12 Q -40 -12 -34 -8" fill="none" stroke="#94A3B8" strokeWidth={2} />

      {/* Vintage leather saddle on seatpost with chrome springs (`yên da có lò xo`) */}
      <line x1={-20} y1={-16} x2={-22} y2={-28} stroke="#94A3B8" strokeWidth={4.5} />
      <circle cx={-26} cy={-27} r={4.5} fill="none" stroke="#64748B" strokeWidth={2} />
      <circle cx={-18} cy={-27} r={4.5} fill="none" stroke="#64748B" strokeWidth={2} />
      <path d="M -36 -32 C -32 -38 -12 -38 -8 -33 C -4 -28 -14 -28 -24 -28 C -32 -28 -38 -28 -36 -32 Z" fill="#54331C" stroke="#261509" strokeWidth={2} />
      <path d="M -32 -35 Q -18 -36 -10 -32" fill="none" stroke="#7C4E2D" strokeWidth={1.5} />

      {/* Handlebars, stem, grips and brake levers */}
      <line x1={36} y1={-14} x2={34} y2={-32} stroke="#94A3B8" strokeWidth={4.5} strokeLinecap="round" />
      <path d="M 22 -30 Q 34 -38 46 -30" fill="none" stroke="#94A3B8" strokeWidth={4} strokeLinecap="round" />
      <path d="M 22 -30 Q 34 -38 46 -30" fill="none" stroke="#E2E8F0" strokeWidth={1.5} strokeLinecap="round" />
      <rect x={18} y={-32} width={8} height={5} rx={2} fill="#0F172A" />
      <rect x={44} y={-32} width={8} height={5} rx={2} fill="#0F172A" />
      <path d="M 30 -28 Q 24 -15 36 -2" fill="none" stroke="#1E293B" strokeWidth={1.8} />

      {/* Chrome bullet dynamo headlamp (`đèn dynamo tròn gắn cổ phuộc`) */}
      <g transform="translate(45 -8)">
        <ellipse cx={4} cy={0} rx={5} ry={7} fill="#FFF9D2" stroke="#94A3B8" strokeWidth={1.5} />
        <path d="M 4 -7 Q -6 -6 -8 0 Q -6 6 4 7 Z" fill="#475569" stroke="#1E293B" strokeWidth={1.5} />
        <line x1={-3} y1={0} x2={-8} y2={10} stroke="#94A3B8" strokeWidth={2} />
      </g>
    </g>

    {/* ===================================================================== */}
    {/* 4. LEFT SIDE: COMPLETE VIETNAMESE TUBE HOUSE (NHÀ 14/8 ĐẦY ĐỦ KIẾN TRÚC) */}
    {/* ===================================================================== */}
    <g>
      {/* Towering 3-story house facade looming over the left alley */}
      <polygon points="-60,-120 575,-40 575,700 -60,860" fill="#10151F" stroke={INK} strokeWidth={4} />

      {/* Floor concrete cantilever slabs */}
      <line x1={-60} y1={230} x2={575} y2={295} stroke="#070A10" strokeWidth={3} />
      <line x1={-60} y1={450} x2={575} y2={505} stroke="#070A10" strokeWidth={3} />

      {/* 3rd Floor: Weathered green wooden louvered shutters (`cửa sổ gỗ lá sách`) */}
      <g transform="translate(240 80)">
        <polygon points="0,0 120,15 120,110 0,95" fill="#151E1A" stroke={INK} strokeWidth={2.5} />
        {[20, 38, 56, 74].map((sy, i) => (
          <line key={i} x1={8} y1={sy} x2={112} y2={sy + 14} stroke="#1E2F26" strokeWidth={2} />
        ))}
      </g>

      {/* 2nd Floor: Protruding balcony with "chuồng cọp" iron security cage */}
      <g transform="translate(180 250)">
        <polygon points="-20,140 210,165 200,185 -25,160" fill="#19202C" stroke={INK} strokeWidth={2.8} />
        {/* "Chuồng cọp" iron security cage bars enclosing the balcony */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={-15 + i * 25} y1={10 + i * 3} x2={-15 + i * 25} y2={140 + i * 3} stroke="#222C3C" strokeWidth={2.2} />
        ))}
        <line x1={-20} y1={55} x2={195} y2={81} stroke="#222C3C" strokeWidth={2.2} />
        <line x1={-20} y1={100} x2={195} y2={126} stroke="#222C3C" strokeWidth={2.2} />
        {/* Laundry hanging on a bamboo pole inside the iron cage (`sào phơi quần áo đêm`) */}
        <line x1={0} y1={35} x2={180} y2={57} stroke="#42352B" strokeWidth={2.5} />
        <path d="M 30 40 L 25 80 L 60 83 L 55 43 Z" fill="#222D3C" opacity={0.7} />
        <path d="M 78 46 L 75 90 L 108 93 L 104 49 Z" fill="#3A2C34" opacity={0.65} />
        <path d="M 126 52 L 124 78 L 152 81 L 150 55 Z" fill="#2E3830" opacity={0.65} />
      </g>

      {/* Outdoor air conditioner compressor unit (`cục nóng máy lạnh rỉ sét`) */}
      <g transform="translate(420 370)">
        <polygon points="15,48 15,70 30,48" fill="#36241C" stroke="#100C0E" strokeWidth={2} />
        <polygon points="85,48 85,70 100,48" fill="#36241C" stroke="#100C0E" strokeWidth={2} />
        <rect x={0} y={0} width={115} height={52} rx={4} fill="#1E2734" stroke={INK} strokeWidth={3} />
        <circle cx={40} cy={26} r={18} fill="#10151E" stroke="#090C12" strokeWidth={2} />
        <circle cx={40} cy={26} r={7} fill="#1E2734" />
        <path d="M 98 48 L 98 120" stroke="#483324" strokeWidth={3} strokeLinecap="round" />
        <circle cx={98} cy={125} r={2} fill="#547298" opacity={0.65} />
      </g>

      {/* =================================================================== */}
      {/* GROUND FLOOR OF HOUSE 14/8: CLOSED ROLLING SHUTTER DOOR & ENTRANCE  */}
      {/* (TẦNG TRỆT NHÀ 14/8 CÓ CỬA CUỐN ĐÓNG KÍN VÀ BIỂN SỐ NHÀ ĐÚNG TẦM MẮT) */}
      {/* =================================================================== */}
      <g>
        {/* Slanted corrugated metal awning over ground entrance */}
        <polygon points="140,455 495,488 485,510 130,477" fill="#2E1E18" stroke={INK} strokeWidth={3} />
        <line x1={160} y1={475} x2={190} y2={515} stroke="#18100D" strokeWidth={4} />
        <line x1={470} y1={505} x2={480} y2={545} stroke="#18100D" strokeWidth={4} />

        {/* Entrance doorway masonry opening for House 14/8 */}
        <rect x={170} y={485} width={285} height={215} fill="#0A0E15" stroke={INK} strokeWidth={3.5} />

        {/* Closed metallic rolling door (`cửa cuốn đóng kín đêm`) */}
        <rect x={178} y={492} width={268} height={206} fill="#17202B" />
        {[510, 528, 546, 564, 582, 600, 618, 636, 654, 672, 690].map((ry, i) => (
          <line key={i} x1={178} y1={ry} x2={446} y2={ry} stroke="#0E141C" strokeWidth={2.2} />
        ))}
        {/* Bottom locking bar & floor pull handle */}
        <rect x={295} y={678} width={42} height={8} rx={2} fill="#303E50" stroke="#0B0E14" strokeWidth={1.5} />

        {/* Raised concrete entrance step in front of rolling door */}
        <polygon points="155,700 470,700 460,716 145,716" fill="#1C2432" stroke={INK} strokeWidth={2} />

        {/* Right entrance masonry pillar of House 14/8 */}
        <polygon points="450,485 495,485 495,700 450,700" fill="#171E2A" stroke={INK} strokeWidth={2.5} />

        {/* PROPERLY PLACED HOUSE ADDRESS PLATE "14/8" ON ENTRANCE PILLAR AT EYE LEVEL */}
        <g transform="translate(472 530)">
          <rect x={-20} y={-12} width={40} height={24} rx={3} fill="#1E3A8A" stroke="#E2E8F0" strokeWidth={1.6} />
          <text x={0} y={5} textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontWeight={800} fontSize={12} letterSpacing={0.5}>
            14/8
          </text>
        </g>
      </g>

      {/* Solid mossy brick boundary wall connecting house to dead-end wall */}
      <g>
        <polygon points="490,654 575,654 575,760 490,775" fill="#2E1C17" stroke={INK} strokeWidth={3} />
        {[675, 700, 725, 750].map((by, i) => (
          <line key={i} x1={490} y1={by} x2={575} y2={by} stroke="#1C100D" strokeWidth={2} />
        ))}
        {/* Sturdy flat concrete wall coping at y=640 where the cat sits */}
        <polygon points="480,640 580,640 575,654 475,654" fill="#202A38" stroke={INK} strokeWidth={3} />
        <path d="M 480 644 Q 530 640 580 645" stroke="#142419" strokeWidth={3} fill="none" opacity={0.85} />
        <rect x={480} y={654} width={98} height={8} fill="#000" opacity={0.45} />
      </g>
    </g>

    {/* ===================================================================== */}
    {/* 5. PERCHED CAT ON WALL COPING WITH SYMMETRICAL BALANCED EYES          */}
    {/* ===================================================================== */}
    {showCat ? (
      <g transform="translate(530 640) scale(0.68)">
        <ellipse cx={0} cy={2} rx={64} ry={8} fill="#05070D" opacity={0.72} />
        <Cat x={0} y={0} mood="peek" f={t} coat="#100E14" />
      </g>
    ) : null}

    {/* ===================================================================== */}
    {/* 6. RIGHT SIDE: ÔNG LỘC'S SHOPHOUSE (`TIỆM ÔNG LỘC` — NGUỒN SÁNG DUY NHẤT)*/}
    {/* ===================================================================== */}
    {shopGone > 0 ? (
      <g>
        {/* What is left once the shop has withdrawn: blank damp wall between the same neighbours */}
        <polygon points="1180,-60 2040,-120 2040,1060 1180,700" fill="#262126" stroke={INK} strokeWidth={4} />
        <polygon points="1360,375 1835,285 1835,950 1360,738" fill="#211C21" />
        <polygon points="1450,190 1780,150 1780,262 1450,296" fill="#1C181C" />
        <path d="M 1180 700 L 2040 1060 L 2040 1022 Q 1800 930 1640 884 Q 1420 760 1180 678 Z" fill="#1E3029" />
      </g>
    ) : null}
    <g opacity={1 - shopGone}>
      {/* 2-Story Vietnamese shophouse facade wall: weathered mustard-yellow ochre plaster */}
      <polygon points="1180,-60 2040,-120 2040,1060 1180,700" fill="#30241C" stroke={INK} strokeWidth={4} />

      {/* Vertical rainwater streaking & electrical conduit lines along shophouse wall */}
      <line x1={1270} y1={-50} x2={1270} y2={680} stroke="#18110E" strokeWidth={3.5} />
      <line x1={1920} y1={-100} x2={1920} y2={1020} stroke="#18110E" strokeWidth={4} />

      {/* PROPERLY PLACED HOUSE ADDRESS PLATE "14/9" ON SHOP ENTRANCE PILLAR AT EYE LEVEL */}
      <g transform="translate(1335 490)">
        <rect x={-20} y={-12} width={40} height={24} rx={3} fill="#1E3A8A" stroke="#E2E8F0" strokeWidth={1.6} />
        <text x={0} y={5} textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontWeight={800} fontSize={12} letterSpacing={0.5}>
          14/9
        </text>
      </g>

      {/* Small copper/blue municipal water meter at wall base (`đồng hồ nước chân tường`) */}
      <g transform="translate(1260 682)">
        <rect x={-12} y={-10} width={24} height={20} rx={3} fill="#152E42" stroke="#0A1824" strokeWidth={1.8} />
        <circle cx={0} cy={0} r={6} fill="#B0BDCE" stroke="#0A1824" strokeWidth={1.2} />
        <line x1={-18} y1={0} x2={-12} y2={0} stroke="#3E3024" strokeWidth={3} />
        <line x1={12} y1={0} x2={18} y2={0} stroke="#3E3024" strokeWidth={3} />
      </g>

      {/* Upper Floor (Floor 2): Classic French-colonial green louvered double window */}
      <g transform="translate(1560 60) rotate(-7)">
        <rect x={-80} y={-45} width={160} height={135} rx={6} fill="#1E1611" stroke={INK} strokeWidth={3} />
        <path d="M -65 80 L -65 15 Q -65 -35 0 -35 Q 65 -35 65 15 L 65 80 Z" fill="#0E0A08" stroke={INK} strokeWidth={2.5} />
        <g opacity={0.88}>
          <path d="M -62 76 L -62 16 Q -62 -28 -5 -30 L -5 76 Z" fill="#1E3027" stroke={INK} strokeWidth={2} />
          <path d="M 62 76 L 62 16 Q 62 -28 5 -30 L 5 76 Z" fill="#1E3027" stroke={INK} strokeWidth={2} />
          {[-12, 6, 24, 42, 60].map((ly, i) => (
            <line key={i} x1={-56} y1={ly} x2={-11} y2={ly} stroke="#121D17" strokeWidth={2} />
          ))}
          {[-12, 6, 24, 42, 60].map((ly, i) => (
            <line key={i} x1={11} y1={ly} x2={56} y2={ly} stroke="#121D17" strokeWidth={2} />
          ))}
        </g>
      </g>

      {/* Slanted corrugated metal awning over shop doorway (`mái tôn rỉ sét trước cửa tiệm`) */}
      <polygon points="1120,335 1980,185 2000,245 1090,395" fill="#402C20" stroke={INK} strokeWidth={3.5} />
      <line x1={1160} y1={380} x2={1220} y2={455} stroke="#201410" strokeWidth={5} />
      <line x1={1620} y1={290} x2={1660} y2={355} stroke="#201410" strokeWidth={5} />

      {/* Authentic hand-painted wooden signboard (`TIỆM ÔNG LỘC: SỬA ĐỒNG HỒ - ĐIỆN THOẠI CŨ`) */}
      <g transform="translate(1510 260) rotate(-10)">
        <rect x={-140} y={-52} width={10} height={15} fill="#18110D" />
        <rect x={130} y={-52} width={10} height={15} fill="#18110D" />
        <rect x={-185} y={-42} width={370} height={84} rx={4} fill="#E8DAC0" stroke="#3E2619" strokeWidth={5} />
        <rect x={-176} y={-34} width={352} height={68} fill="none" stroke="#6F231A" strokeWidth={2.5} />
        <text
          x={0}
          y={2}
          textAnchor="middle"
          fontSize={23}
          fontWeight={800}
          fill="#6A1E14"
          fontFamily="Georgia, serif"
        >
          TIỆM ÔNG LỘC
        </text>
        <text
          x={0}
          y={24}
          textAnchor="middle"
          fontSize={12.5}
          fontWeight={700}
          letterSpacing={1.6}
          fill="#251C16"
          fontFamily="sans-serif"
        >
          SỬA ĐỒNG HỒ  •  ĐIỆN THOẠI CŨ
        </text>
      </g>

      {/* =================================================================== */}
      {/* 3D RECESSED DOORWAY OPENING & ARCHITECTURAL DEPTH (KHUNG CỬA 3 CHIỀU) */}
      {/* =================================================================== */}

      {/* Raised concrete / terrazzo threshold step (`bậc thềm xi măng mài`) */}
      <polygon points="1328,756 1855,968 1855,982 1328,770" fill="#120D10" stroke={INK} strokeWidth={2} />
      <polygon points="1336,738 1860,950 1855,968 1328,756" fill="#36251D" stroke={INK} strokeWidth={2.5} />
      <polygon points="1348,740 1780,920 1775,934 1342,754" fill="#FFE59E" opacity={0.35} />

      {/* Outer masonry doorway frame cutout */}
      <polygon points="1360,375 1835,285 1835,950 1360,738" fill="#1A110F" stroke={INK} strokeWidth={4} />

      {/* Left door jamb reveal showing 25cm masonry wall thickness receding inwards */}
      <polygon points="1360,375 1405,382 1405,728 1360,738" fill="#24140F" stroke={INK} strokeWidth={2.5} />

      {/* Lintel soffit ceiling reveal */}
      <polygon points="1360,375 1835,285 1812,298 1405,382" fill="#180E0C" />

      {/* Overhead roller gate casing box */}
      <polygon points="1345,365 1845,274 1845,292 1345,383" fill="#2B1D16" stroke={INK} strokeWidth={2.5} />
      <line x1={1348} y1={374} x2={1842} y2={283} stroke="#483226" strokeWidth={2} />

      {/* =================================================================== */}
      {/* DETAILED WORKSHOP INTERIOR VISIBLE THROUGH THE OPENING              */}
      {/* (BÊN TRONG TIỆM: ĐỒNG HỒ, BÀN THỢ, ÔNG LỘC CẶM CỤI LÀM VIỆC)         */}
      {/* =================================================================== */}
      <g>
        <clipPath id="tiemDoorwayClip">
          <polygon points="1405,382 1812,298 1812,930 1405,728" />
        </clipPath>

        <g clipPath="url(#tiemDoorwayClip)">
          {/* Interior back wall with rich warm amber tungsten glow */}
          <rect x={1390} y={280} width={440} height={680} fill="#24130D" />
          <rect x={1390} y={280} width={440} height={680} fill="url(#tiemInteriorGlow)" />

          {/* Interior patterned cement tile floor perspective grid (`gạch bông cổ điển`) */}
          <polygon points="1405,620 1812,490 1812,930 1405,728" fill="#1E100C" />
          {[0.2, 0.4, 0.6, 0.8].map((u, i) => {
            const yLeft = 620 + u * 108;
            const yRight = 490 + u * 440;
            return <line key={i} x1={1405} y1={yLeft} x2={1812} y2={yRight} stroke="#361D14" strokeWidth={1.8} opacity={0.65} />;
          })}
          {[1460, 1530, 1610, 1700, 1780].map((xTile, i) => (
            <line key={i} x1={xTile} y1={520} x2={xTile - 30} y2={880} stroke="#361D14" strokeWidth={1.5} opacity={0.5} />
          ))}

          {/* Ceiling warm pendant light hanging from cord */}
          <line x1={1620} y1={290} x2={1620} y2={390} stroke="#160F0C" strokeWidth={2.5} />
          <polygon points="1600,390 1640,390 1650,402 1590,402" fill="#36241A" stroke="#0E0A08" strokeWidth={2} />
          <ellipse cx={1620} cy={402} rx={22} ry={4} fill="#FFEAA7" />
          <circle cx={1620} cy={406} r={7} fill="#FFFDF0" />

          {/* BACK WALL DISPLAY SHELVES & CLOCK COLLECTION */}
          {[460, 530, 600].map((sy, i) => (
            <g key={i}>
              <line x1={1420} y1={sy} x2={1790} y2={sy - 70} stroke="#522F20" strokeWidth={5} />
              <line x1={1420} y1={sy + 3} x2={1790} y2={sy - 67} stroke="#24140D" strokeWidth={2} />
            </g>
          ))}

          {/* 1. Tall Grandfather Clock in rear right corner (`đồng hồ tủ đứng`) */}
          <g transform="translate(1730 365) scale(0.7)">
            <rect x={-22} y={-20} width={44} height={160} rx={4} fill="#46261A" stroke="#140A06" strokeWidth={2.5} />
            <polygon points="-26,-20 26,-20 0,-42" fill="#542E1E" stroke="#140A06" strokeWidth={2} />
            <circle cx={0} cy={10} r={16} fill="#F5EFE0" stroke="#140A06" strokeWidth={2} />
            <circle cx={0} cy={10} r={2} fill="#140A06" />
            <line x1={0} y1={10} x2={0} y2={0} stroke="#140A06" strokeWidth={1.5} />
            <line x1={0} y1={10} x2={7} y2={10} stroke="#140A06" strokeWidth={1.5} />
            <rect x={-14} y={35} width={28} height={85} rx={3} fill="#180D09" stroke="#321A12" strokeWidth={1.5} />
            <line x1={0} y1={38} x2={0} y2={92} stroke="#E2A840" strokeWidth={2} />
            <circle cx={0} cy={95} r={8} fill="#F7CA55" stroke="#9A6516" strokeWidth={1.5} />
          </g>

          {/* 2. Wall-mounted pendulum regulator clock (`đồng hồ quả lắc Odo`) */}
          <g transform="translate(1485 415) scale(0.65)">
            <rect x={-20} y={-25} width={40} height={90} rx={3} fill="#4C2A1E" stroke="#140A06" strokeWidth={2} />
            <circle cx={0} cy={-2} r={15} fill="#F8F2E4" stroke="#140A06" strokeWidth={2} />
            <circle cx={0} cy={-2} r={2} fill="#140A06" />
            <line x1={0} y1={-2} x2={-4} y2={-9} stroke="#140A06" strokeWidth={1.5} />
            <line x1={0} y1={-2} x2={7} y2={2} stroke="#140A06" strokeWidth={1.5} />
            <rect x={-10} y={22} width={20} height={36} rx={2} fill="#1C0F0A" />
            <circle cx={0} cy={42} r={5} fill="#F7CA55" />
          </g>

          {/* 3. Octagonal wooden clock & mantle clocks on middle shelf */}
          <g transform="translate(1555 425) scale(0.6)">
            <polygon points="-16,-6 -6,-16 6,-16 16,-6 16,6 6,16 -6,16 -16,6" fill="#5E3522" stroke="#140A06" strokeWidth={2} />
            <circle cx={0} cy={0} r={10} fill="#FFF6DC" stroke="#140A06" strokeWidth={1.5} />
          </g>
          <g transform="translate(1645 405) scale(0.6)">
            <rect x={-18} y={-14} width={36} height={24} rx={3} fill="#3C2216" stroke="#140A06" strokeWidth={1.8} />
            <circle cx={0} cy={-2} r={9} fill="#EBD8B8" stroke="#140A06" strokeWidth={1.5} />
          </g>

          {/* Small multi-drawer organizer cabinets */}
          <g transform="translate(1435 505) scale(0.62)">
            <rect x={0} y={0} width={64} height={46} fill="#321D14" stroke="#100805" strokeWidth={2} />
            {[10, 22, 34].map((dy, i) => (
              <line key={i} x1={2} y1={dy} x2={62} y2={dy} stroke="#20110B" strokeWidth={1.5} />
            ))}
            {[16, 32, 48].map((dx, i) => (
              <line key={i} x1={dx} y1={2} x2={dx} y2={44} stroke="#20110B" strokeWidth={1.5} />
            ))}
          </g>

          {/* =============================================================== */}
          {/* WATCHMAKER'S WORKBENCH & ÔNG LỘC'S SEATED WORKING SILHOUETTE    */}
          {/* =============================================================== */}
          <g transform="translate(1520 635)">
            <polygon points="-90,-30 80,-62 76,-15 -90,15" fill="#4E2E20" stroke="#120A06" strokeWidth={3} />
            <polygon points="-90,15 76,-15 76,45 -90,75" fill="#361E14" stroke="#120A06" strokeWidth={3} />
            <line x1="-80" y1={35} x2="65" y2={5} stroke="#20110C" strokeWidth={2} />
            {[-50, 0].map((hx, i) => (
              <rect key={i} x={hx} y={20 - i * 6} width={18} height={4} rx={1} fill="#C89B4B" />
            ))}
            <rect x={-86} y={75} width={16} height={65} fill="#26150E" stroke="#120A06" strokeWidth={2.5} />
            <rect x={60} y={45} width={16} height={85} fill="#26150E" stroke="#120A06" strokeWidth={2.5} />

            {/* Green rubber repair cutting mat on workbench */}
            <polygon points="-65,-22 25,-40 28,-22 -62,-5" fill="#183225" stroke="#0E1C15" strokeWidth={1.5} />

            {/* Watchmaker's Jeweler Gooseneck Desk Lamp (`đèn bàn thợ kim hoàn`) */}
            <g transform="translate(-60 -18)">
              <ellipse cx={0} cy={0} rx={10} ry={4} fill="#223026" stroke="#0E1611" strokeWidth={1.5} />
              <path d="M 0 -2 Q 10 -40 28 -34" stroke="#7E612C" strokeWidth={3.5} fill="none" strokeLinecap="round" />
              <polygon points="26,-40 40,-30 32,-18 20,-28" fill="#1A3B2A" stroke="#0A1A12" strokeWidth={2} />
              <circle cx={31} cy={-22} r={5} fill="#FFF9DF" />
              <ellipse cx={32} cy={-8} rx={42} ry={16} fill="url(#tiemDeskLight)" />
            </g>

            {/* Disassembled watch movement parts & glass dust dome */}
            <circle cx={-10} cy={-16} r={5} fill="#D4A24C" />
            <circle cx={-2} cy={-18} r={3.5} fill="#C89B4B" />
            <path d="M 6 -15 A 8 8 0 0 1 22 -15 Z" fill="#88B8CE" opacity={0.4} stroke="#486878" strokeWidth={1.2} />

            {/* SILHOUETTE OF ÔNG LỘC: ELDERLY WATCHMAKER AT WORK */}
            <g transform="translate(10 -22)">
              <ellipse cx={8} cy={55} rx={18} ry={6} fill="#22130D" stroke="#100805" strokeWidth={2} />
              <line x1={0} y1={55} x2={-4} y2={100} stroke="#180D0A" strokeWidth={3} />
              <line x1={16} y1={55} x2={18} y2={98} stroke="#180D0A" strokeWidth={3} />

              <path
                d="M -6 45 L 8 48 L 22 20 L 16 -12 L -6 -8 Z"
                fill="#18100E"
                stroke="#0A0605"
                strokeWidth={2}
              />
              <path
                d="M 12 15 Q 26 -2 14 -22 Q -4 -25 -12 -12 L -14 38 Z"
                fill="#201714"
              />
              <path
                d="M -12 -12 Q -4 -25 14 -22"
                stroke="#FFE59E"
                strokeWidth={2}
                fill="none"
                opacity={0.65}
              />

              <ellipse cx={-18} cy={-28} rx={13} ry={11} fill="#1B1310" />
              <rect x={-31} y={-29} width={9} height={6} rx={2} fill="#946C30" stroke="#100B08" strokeWidth={1.2} />
              <circle cx={-30} cy={-26} r={2} fill="#FFF9DF" opacity={0.85} />

              <path
                d="M -4 -8 Q -18 -4 -26 -16"
                stroke="#201714"
                strokeWidth={5}
                strokeLinecap="round"
                fill="none"
              />
              <line x1="-26" y1="-16" x2="-22" y2="-12" stroke="#946C30" strokeWidth={2} />
            </g>
          </g>
        </g>
      </g>

      {/* =================================================================== */}
      {/* HALF-PULLED ACCORDION IRON GATE (`CỬA SẮT KÉO XẾP ĐÀI LOAN / VN`)   */}
      {/* =================================================================== */}
      <g>
        <polygon points="1355,370 1835,282 1835,292 1355,380" fill="#1C2430" stroke="#0B1018" strokeWidth={2} />
        <line x1={1348} y1={744} x2={1850} y2={954} stroke="#161C26" strokeWidth={3} />

        {/* Accordion steel gate bundled on the right side */}
        {Array.from({ length: 6 }).map((_, i) => {
          const gx = 1720 + i * 18;
          const topY = 300 - i * 3.5;
          const botY = 905 + i * 9.5;
          return (
            <g key={i}>
              <line x1={gx} y1={topY} x2={gx} y2={botY} stroke="#222D3E" strokeWidth={5} />
              <line x1={gx} y1={topY} x2={gx} y2={botY} stroke="#3E4E68" strokeWidth={2} />
              {Array.from({ length: 6 }).map((__, j) => {
                const gy = topY + 45 + j * 92;
                return (
                  <path
                    key={j}
                    d={`M ${gx} ${gy} L ${gx + 18} ${gy + 46} L ${gx} ${gy + 92}`}
                    stroke="#324056"
                    strokeWidth={2.4}
                    fill="none"
                  />
                );
              })}
            </g>
          );
        })}
        <g transform="translate(1725 640)">
          <rect x={-8} y={-4} width={16} height={20} rx={3} fill="#946C30" stroke="#0E0A06" strokeWidth={1.8} />
          <path d="M -5 -4 L -5 -11 Q 0 -16 5 -11 L 5 -4" stroke="#403220" strokeWidth={2.2} fill="none" />
        </g>
      </g>

      {/* =================================================================== */}
      {/* WARM GOLDEN LIGHT SPILL ONTO ALLEY THRESHOLD & PAVEMENT             */}
      {/* (Ánh sáng vàng ấm từ tiệm là nguồn sáng chính duy nhất của con ngõ) */}
      {/* =================================================================== */}
      <g opacity={1 - shopClose}>
      <polygon
        points="1340,735 1860,945 1180,1450 740,820"
        fill="url(#tiemWarmSpillRadial)"
        filter="url(#hemSpillFeather)"
        style={{ mixBlendMode: 'screen' }}
      />
      <polygon
        points="1370,745 1800,935 1360,1260 1100,820"
        fill="#F59E0B"
        opacity={0.24}
        filter="url(#hemLightFeather)"
        style={{ mixBlendMode: 'screen' }}
      />
      </g>
      {shopClose > 0 ? (
        <g>
          <polygon points={`1405,382 1812,298 1812,${298 + 632 * shopClose} 1405,${382 + 346 * shopClose}`} fill="#2E3138" stroke={INK} strokeWidth={3} />
          {Array.from({ length: Math.floor(shopClose * 24) }).map((_, i) => (
            <line key={i} x1={1405} y1={382 + i * 14.4} x2={1812} y2={298 + i * 26.3} stroke="#1D2027" strokeWidth={2.5} />
          ))}
        </g>
      ) : null}
      {/* Drifting warm dust motes floating near shop entrance */}
      <Dust t={t} seed={115} x0={1340} y0={420} w={450} h={540} n={24} o={0.45} />
    </g>

    {/* ===================================================================== */}
    {/* 7. OVERHEAD SPIDERWEB WIRES (MẠNG LƯỚI BÚI DÂY ĐIỆN BÍ BÁCH ĐẶC TRƯNG) */}
    {/* ===================================================================== */}
    <g>
      <path d="M 120 145 Q 520 275 1140 210 Q 1480 190 1920 150" stroke="#05070C" strokeWidth={4.5} fill="none" />
      <path d="M 160 180 Q 680 330 1260 240 Q 1600 220 1920 190" stroke="#04060A" strokeWidth={3.8} fill="none" />
      <path d="M 40 115 Q 580 230 1100 180 Q 1520 150 1920 110" stroke="#05080E" strokeWidth={3} fill="none" />
      <path d="M 260 205 Q 780 385 1360 265" stroke="#04060A" strokeWidth={2.8} fill="none" />
      <path d="M 720 260 Q 760 350 780 270" stroke="#05070C" strokeWidth={2.5} fill="none" />
      <path d="M 940 230 Q 980 320 1000 240" stroke="#05070C" strokeWidth={2.2} fill="none" />
      <rect x={760} y={290} width={28} height={18} rx={2} fill="#070A0F" stroke="#020306" strokeWidth={1.5} />
    </g>


    {/* ===================================================================== */}
    {/* 9. CHIAROSCURO FALLOFF LAYER (Tối dần những nơi không có đèn chiếu)   */}
    {/* ===================================================================== */}
    <g pointerEvents="none">
      <rect x={-300} y={-200} width={2600} height={1700} fill="url(#alleyVignetteFalloff)" />
      <rect x={-300} y={-200} width={2600} height={600} fill="url(#alleyDeepShadowTop)" />
      <rect x={-300} y={-200} width={1000} height={1700} fill="url(#alleyDeepShadowLeft)" />
    </g>

    {/* ===================================================================== */}
    {/* 10. FOREGROUND LEFT: ROOF EAVE & PERCHED OWL WATCHING FROM OVERHEAD   */}
    {/* ===================================================================== */}
    <g>
      <polygon points="-50,-20 440,80 400,142 -50,60" fill="#141B26" stroke={INK} strokeWidth={4} />
      {showOwl ? <PerchingOwl x={315} y={205} s={0.96} headTurn={0.65} showBracket /> : null}
    </g>
  </g>
);

// ----------------------------------------------------------------------------
// ENVIRONMENT 4: CẢNH 6 & 7 — CÁNH ĐỒNG LÚA NẮNG CHIỀU GẶP MẸ (`SET-CANHDONG`)
// ----------------------------------------------------------------------------

/**
 * `SunsetRiceField` (`SET-CANHDONG` — Cánh đồng lúa nắng chiều ở Cảnh 6 & Cảnh 7):
 * Built with 2.5D depth layers as required by `DUNG-CANH.md` (Bản 5):
 * 1. Low horizon sky (`bầu trời chiều vàng cam dịu, đường chân trời thấp, nắng chiều từ trái khung`).
 * 2. Distant southern Vietnamese tree line (`hàng cây tràm/dừa cuối đồng mờ xa`).
 * 3. Golden-green ripening rice paddy field (`ruộng lúa chiều vàng óng ngả nhẹ theo gió`).
 * 4. Flat dirt path (`lối đất bằng`) & dry low grass bank (`bờ đất bằng và thảm cỏ khô đủ ba người ngồi vững: Mẹ giữa, Thảo sát bên, Duy bên cạnh`).
 */
export { SunsetRiceField, SunsetMeadowForeground, RedDragonfly } from './sunset_field';

