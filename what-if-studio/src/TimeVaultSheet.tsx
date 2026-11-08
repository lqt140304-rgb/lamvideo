import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import {
  ClockCreature,
  MemoryJar,
  ReverseHourglass,
  ReverseClockwork,
  TimeVaultScene,
  AntiquePortraitCameo,
  CameoJars,
  AlleyWithoutShop,
  FONT,
} from './engine';

export const TimeVaultSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0612', overflow: 'hidden' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="tvCardBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1C132E" />
            <stop offset="100%" stopColor="#110A1E" />
          </linearGradient>
          <linearGradient id="tvHeaderBg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1F1535" />
            <stop offset="50%" stopColor="#2E1D50" />
            <stop offset="100%" stopColor="#1A102C" />
          </linearGradient>
        </defs>

        {/* =================================================================== */}
        {/* HEADER BANNER                                                       */}
        {/* =================================================================== */}
        <g transform="translate(40 20)">
          <rect
            width={1840}
            height={68}
            rx={8}
            fill="url(#tvHeaderBg)"
            stroke="#D4A24C"
            strokeWidth={1.5}
          />
          <text
            x={28}
            y={32}
            fill="#FEF08A"
            fontFamily={FONT.title}
            fontWeight="bold"
            fontSize={20}
            letterSpacing={0.8}
          >
            HẺM CÓ CHUYỆN · THỰC THỂ 01: QUÁI VẬT ĐỒNG HỒ VÀ KHO THỜI GIAN (CHRONO VAULT)
          </text>
          <text
            x={28}
            y={54}
            fill="#C0B0D8"
            fontFamily={FONT.ui}
            fontSize={13}
            letterSpacing={0.3}
          >
            Nguyên hình ông Lộc · Ba mắt tam giác lơ lửng · Kho lưu trữ lọ giao kèo Cảnh 9 · Thời gian đảo chiều · Cameo chân dung và Ngõ mất tiệm (C8-E)
          </text>
          <rect x={1630} y={16} width={185} height={36} rx={5} fill="#14B8A6" opacity={0.18} stroke="#2DD4BF" strokeWidth={1.2} />
          <text x={1722} y={39} fill="#5EEAD4" fontFamily={FONT.ui} fontWeight="bold" fontSize={12} textAnchor="middle">
            VŨ TRỤ HẺM CÓ CHUYỆN
          </text>
        </g>

        {/* =================================================================== */}
        {/* MAIN PANEL: TOÀN CẢNH KHO THỜI GIAN CẢNH 9 (1160 x 630)             */}
        {/* =================================================================== */}
        <g transform="translate(40 102)">
          <rect
            width={1160}
            height={630}
            rx={8}
            fill="#0C0716"
            stroke="#4C1D95"
            strokeWidth={1.8}
          />
          {/* Header Tag */}
          <rect x={18} y={14} width={460} height={28} rx={4} fill="#1E1433" stroke="#D4A24C" strokeWidth={1} />
          <text x={30} y={33} fill="#FDE68A" fontFamily={FONT.title} fontWeight="bold" fontSize={12} letterSpacing={0.6}>
            CẢNH 9: TOÀN CẢNH KHO THỜI GIAN (TIME VAULT SCENE) · 28 GIÂY KHÔNG LỜI
          </text>

          {/* Embedded Scaled Scene with nested SVG */}
          <svg x={10} y={48} width={1140} height={532} viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet">
            <TimeVaultScene t={t} showJars />
          </svg>

          {/* Bottom Scene Legend */}
          <rect x={10} y={586} width={1140} height={34} rx={4} fill="#140B22" />
          <text x={20} y={607} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={11}>
            Bố cục 2.5D: Kệ đá vòm lùi sâu hậu cảnh · Vòng thiên văn quay lùi trên tường · Quái vật đồng hồ ba mắt lơ lửng điều khiển 3 lọ mới · Bệ cát chảy ngược
          </text>
        </g>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: MACRO CALLOUTS & DETAIL ASSETS                        */}
        {/* =================================================================== */}

        {/* 1. CALLOUT: NGUYÊN HÌNH QUÁI VẬT ĐỒNG HỒ BA MẮT (x=1220, y=102)   */}
        <g transform="translate(1220 102)">
          <rect width={660} height={310} rx={8} fill="url(#tvCardBg)" stroke="#38BDF8" strokeWidth={1.5} />
          {/* Label */}
          <rect x={18} y={14} width={430} height={26} rx={4} fill="#0F172A" stroke="#38BDF8" strokeWidth={1} />
          <text x={28} y={31} fill="#7DD3FC" fontFamily={FONT.title} fontWeight="bold" fontSize={11.5} letterSpacing={0.5}>
            NGUYÊN HÌNH THỰC THỂ 01 (CLOCK CREATURE) · MẶT ĐỒNG HỒ BA MẮT
          </text>

          {/* Large Macro Clock Creature Preview inside nested SVG to clip cleanly */}
          <svg x={16} y={48} width={295} height={250} viewBox="-240 -200 480 500" preserveAspectRatio="xMidYMid meet">
            <ClockCreature x={0} y={-10} s={0.92} t={t} hover showJars={false} />
          </svg>

          {/* Technical Specs Callout Notes */}
          <g transform="translate(325 50)">
            <rect width={315} height={246} rx={6} fill="#0E121E" stroke="#1E293B" strokeWidth={1} />
            <text x={16} y={24} fill="#FDE047" fontFamily={FONT.title} fontWeight="bold" fontSize={12}>
              ĐẶC ĐIỂM NGUYÊN HÌNH QUÁI VẬT:
            </text>
            <text x={16} y={45} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10.2}>
              • Thân đồng cổ: Dày 3/4, núm vặn và vòng treo quả quýt.
            </text>
            <text x={16} y={63} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10.2}>
              • Mặt số: Nền ngà rạn nứt, nếp nhăn da người già.
            </text>
            <text x={16} y={81} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10.2}>
              • Ba mắt: Hình tam giác, tròng hổ phách, mí sụp nheo.
            </text>
            <text x={16} y={99} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10.2}>
              • Nét già: Lông mày bạc xơ, bọng mắt, rãnh má sâu.
            </text>
            <text x={16} y={117} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10.2}>
              • Miệng mỏng: Nụ cười cong nhếch mép bí hiểm, mắt lạnh.
            </text>
            <text x={16} y={135} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10.2}>
              • Tay cơ khí: Khớp tròn; tay trái ngửa, tay phải giữ lọ.
            </text>
            <text x={16} y={153} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10.2}>
              • Chân mảnh: Gập góc, co lơ lửng, bóng đổ rời sàn.
            </text>
            <text x={16} y={171} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10.2}>
              • Ánh sáng: Dải sáng vàng uốn quanh thân và 3 lọ.
            </text>
            <rect x={14} y={188} width={287} height={44} rx={4} fill="#1E1B4B" />
            <text x={24} y={205} fill="#C7D2FE" fontFamily={FONT.ui} fontSize={9.5}>
              Phong cách: Nét phác mực và chì, màu nước kim
            </text>
            <text x={24} y={220} fill="#A5B4FC" fontFamily={FONT.ui} fontSize={9.5}>
              loại có chiều sâu, lớp trước-sau và bóng đổ rõ.
            </text>
          </g>
        </g>

        {/* 2. CALLOUT: BA CHIẾC LỌ GIAO KÈO MỚI (x=1220, y=424)                 */}
        <g transform="translate(1220 424)">
          <rect width={660} height={308} rx={8} fill="url(#tvCardBg)" stroke="#F59E0B" strokeWidth={1.5} />
          <rect x={18} y={14} width={430} height={26} rx={4} fill="#1C1008" stroke="#D97706" strokeWidth={1} />
          <text x={28} y={31} fill="#FDE68A" fontFamily={FONT.title} fontWeight="bold" fontSize={11.5} letterSpacing={0.5}>
            BA LỌ KÝ ỨC VÀ DẤU ẤN GIAO KÈO TẬP 01 (MEMORY JARS G1, G2, G3)
          </text>

          {/* Jar G1 */}
          <g transform="translate(110 145)">
            <rect x={-85} y={-95} width={170} height={240} rx={6} fill="#0F0C16" stroke="#78350F" strokeWidth={1} />
            <MemoryJar x={0} y={-2} s={1.3} kind="g1" glow={1.3} t={t} showAura />
            <rect x={-75} y={64} width={150} height={22} rx={3} fill="#451A03" />
            <text x={0} y={79} fill="#FEF08A" fontFamily={FONT.title} fontWeight="bold" fontSize={10.5} textAnchor="middle">
              LỌ G1 · XE ĐỒ CHƠI
            </text>
            <text x={0} y={104} fill="#CBD5E1" fontFamily={FONT.ui} fontSize={9.5} textAnchor="middle">
              Ký ức buổi tranh xe
            </text>
            <text x={0} y={119} fill="#94A3B8" fontFamily={FONT.ui} fontSize={9} textAnchor="middle">
              và mẹ dỗ làm hòa
            </text>
            <text x={0} y={134} fill="#F97316" fontFamily={FONT.ui} fontSize={9} textAnchor="middle">
              Duy trả (đã quên)
            </text>
          </g>

          {/* Jar G2 */}
          <g transform="translate(330 145)">
            <rect x={-85} y={-95} width={170} height={240} rx={6} fill="#0F0C16" stroke="#0369A1" strokeWidth={1} />
            <MemoryJar x={0} y={-2} s={1.3} kind="g2" glow={1.4} t={t} showAura />
            <rect x={-75} y={64} width={150} height={22} rx={3} fill="#0C4A6E" />
            <text x={0} y={79} fill="#BAE6FD" fontFamily={FONT.title} fontWeight="bold" fontSize={10.5} textAnchor="middle">
              LỌ G2 · CHUYỂN BUỒN
            </text>
            <text x={0} y={104} fill="#CBD5E1" fontFamily={FONT.ui} fontSize={9.5} textAnchor="middle">
              Dấu giao kèo chuyển
            </text>
            <text x={0} y={119} fill="#94A3B8" fontFamily={FONT.ui} fontSize={9} textAnchor="middle">
              trống vắng sang Duy
            </text>
            <text x={0} y={134} fill="#38BDF8" fontFamily={FONT.ui} fontSize={9} textAnchor="middle">
              Hai dòng sáng nhập 1
            </text>
          </g>

          {/* Jar G3 */}
          <g transform="translate(550 145)">
            <rect x={-85} y={-95} width={170} height={240} rx={6} fill="#0F0C16" stroke="#854D0E" strokeWidth={1} />
            <MemoryJar x={0} y={-2} s={1.3} kind="g3" glow={1.3} t={t} showAura />
            <rect x={-75} y={64} width={150} height={22} rx={3} fill="#581C87" />
            <text x={0} y={79} fill="#FDE047" fontFamily={FONT.title} fontWeight="bold" fontSize={10.5} textAnchor="middle">
              LỌ G3 · NIÊM PHONG
            </text>
            <text x={0} y={104} fill="#CBD5E1" fontFamily={FONT.ui} fontSize={9.5} textAnchor="middle">
              Nét trăng và cửa khép:
            </text>
            <text x={0} y={119} fill="#94A3B8" fontFamily={FONT.ui} fontSize={9} textAnchor="middle">
              mất những giấc mơ mẹ
            </text>
            <text x={0} y={134} fill="#EAB308" fontFamily={FONT.ui} fontSize={9} textAnchor="middle">
              Thảo trả đổi 1 lần gặp
            </text>
          </g>
        </g>

        {/* =================================================================== */}
        {/* BOTTOM ROW: REVERSE PHENOMENA & CAMEO ASSETS (4 BOXES)             */}
        {/* =================================================================== */}

        {/* 1. REVERSE HOURGLASS (x=40, y=748, w=440, h=312)                   */}
        <g transform="translate(40 748)">
          <rect width={440} height={312} rx={8} fill="url(#tvCardBg)" stroke="#A855F7" strokeWidth={1.4} />
          <rect x={16} y={12} width={340} height={24} rx={3} fill="#2E1065" />
          <text x={26} y={28} fill="#E9D5FF" fontFamily={FONT.title} fontWeight="bold" fontSize={11}>
            ĐỒNG HỒ CÁT NGƯỢC (REVERSE HOURGLASS)
          </text>
          {/* Hourglass display inside nested SVG */}
          <svg x={16} y={48} width={190} height={250} viewBox="-50 -145 100 165" preserveAspectRatio="xMidYMid meet">
            <ReverseHourglass x={0} y={0} s={1} t={t} />
          </svg>
          {/* Description */}
          <g transform="translate(225 50)">
            <text x={0} y={20} fill="#FDE047" fontFamily={FONT.title} fontWeight="bold" fontSize={11}>
              DẤU HIỆU THỜI GIAN NGƯỢC:
            </text>
            <text x={0} y={42} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10}>
              • Cát phát sáng màu vàng ngọc bích
            </text>
            <text x={0} y={58} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10}>
              • Chống lại trọng lực: chảy từ
            </text>
            <text x={0} y={74} fill="#5EEAD4" fontFamily={FONT.ui} fontWeight="bold" fontSize={10}>
              đáy dưới bay ngược lên bầu trên!
            </text>
            <text x={0} y={96} fill="#94A3B8" fontFamily={FONT.ui} fontSize={9.5}>
              • Biểu thị quy luật thời gian
            </text>
            <text x={0} y={112} fill="#94A3B8" fontFamily={FONT.ui} fontSize={9.5}>
              bị bẻ cong bên trong kho riêng.
            </text>
            <rect x={0} y={130} width={200} height={34} rx={4} fill="#1E1433" />
            <text x={10} y={151} fill="#D8B4FE" fontFamily={FONT.ui} fontSize={9.5}>
              Chỉ xảy ra cục bộ trong kho.
            </text>
          </g>
        </g>

        {/* 2. REVERSE WALL CLOCKWORK (x=500, y=748, w=440, h=312)             */}
        <g transform="translate(500 748)">
          <rect width={440} height={312} rx={8} fill="url(#tvCardBg)" stroke="#A855F7" strokeWidth={1.4} />
          <rect x={16} y={12} width={340} height={24} rx={3} fill="#2E1065" />
          <text x={26} y={28} fill="#E9D5FF" fontFamily={FONT.title} fontWeight="bold" fontSize={11}>
            VÒNG THỜI GIAN THIÊN VĂN (REVERSE CLOCKWORK)
          </text>
          {/* Clockwork graphic inside nested SVG */}
          <svg x={16} y={48} width={215} height={250} viewBox="-300 -300 600 600" preserveAspectRatio="xMidYMid meet">
            <ReverseClockwork x={0} y={0} s={1} t={t} opacity={0.88} />
          </svg>
          {/* Notes */}
          <g transform="translate(245 50)">
            <text x={0} y={20} fill="#FDE047" fontFamily={FONT.title} fontWeight="bold" fontSize={11}>
              VÒNG KIM TƯỜNG QUAY LÙI:
            </text>
            <text x={0} y={42} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10}>
              • Khắc trên vách đá hậu cảnh
            </text>
            <text x={0} y={58} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10}>
              • Bánh răng cưa đồng quay chậm
            </text>
            <text x={0} y={74} fill="#FBBF24" fontFamily={FONT.ui} fontWeight="bold" fontSize={10}>
              • Kim giờ và phút quét ngược chiều!
            </text>
            <text x={0} y={96} fill="#94A3B8" fontFamily={FONT.ui} fontSize={9.5}>
              • 12 vạch số La Mã phát sáng
            </text>
            <text x={0} y={112} fill="#94A3B8" fontFamily={FONT.ui} fontSize={9.5}>
              • Tạo nhịp ngân kim loại huyền bí.
            </text>
          </g>
        </g>

        {/* 3. CAMEO GIEO TRONG TIỆM (x=960, y=748, w=440, h=312)               */}
        <g transform="translate(960 748)">
          <rect width={440} height={312} rx={8} fill="url(#tvCardBg)" stroke="#D4A24C" strokeWidth={1.4} />
          <rect x={16} y={12} width={360} height={24} rx={3} fill="#3E2718" />
          <text x={26} y={28} fill="#FDE68A" fontFamily={FONT.title} fontWeight="bold" fontSize={11}>
            CAMEO GIEO TRONG TIỆM (SHOP CAMEOS)
          </text>

          {/* Portrait Cameo */}
          <g transform="translate(80 156) scale(1.15)">
            <AntiquePortraitCameo x={0} y={0} s={1} />
            <text x={0} y={64} fill="#FEF08A" fontFamily={FONT.ui} fontSize={9} textAnchor="middle">
              Chân dung khung đồng
            </text>
            <text x={0} y={78} fill="#94A3B8" fontFamily={FONT.ui} fontSize={8.5} textAnchor="middle">
              Gieo tại C1-B và C4-D
            </text>
          </g>

          {/* Jars on Shelf Cameo */}
          <g transform="translate(245 145) scale(1.05)">
            <CameoJars x={0} y={0} s={1} t={t} />
            <text x={0} y={54} fill="#FEF08A" fontFamily={FONT.ui} fontSize={9} textAnchor="middle">
              Lọ sáng góc kệ tiệm
            </text>
            <text x={0} y={68} fill="#94A3B8" fontFamily={FONT.ui} fontSize={8.5} textAnchor="middle">
              Gieo tại C2-A và C2-C
            </text>
          </g>

          {/* Explanation */}
          <g transform="translate(315 50)">
            <rect width={112} height={240} rx={4} fill="#140E1B" stroke="#2D1A38" strokeWidth={1} />
            <text x={10} y={22} fill="#E2E8F0" fontFamily={FONT.title} fontWeight="bold" fontSize={9.5}>
              Ý NGHĨA:
            </text>
            <text x={10} y={42} fill="#94A3B8" fontFamily={FONT.ui} fontSize={8.5}>
              Người xem khi xem
            </text>
            <text x={10} y={56} fill="#94A3B8" fontFamily={FONT.ui} fontSize={8.5}>
              lại sẽ nhận ra vết
            </text>
            <text x={10} y={70} fill="#94A3B8" fontFamily={FONT.ui} fontSize={8.5}>
              tích ba mắt và các
            </text>
            <text x={10} y={84} fill="#94A3B8" fontFamily={FONT.ui} fontSize={8.5}>
              lọ đã có từ trước,
            </text>
            <text x={10} y={98} fill="#94A3B8" fontFamily={FONT.ui} fontSize={8.5}>
              không phải tự sinh
            </text>
            <text x={10} y={112} fill="#94A3B8" fontFamily={FONT.ui} fontSize={8.5}>
              đột ngột.
            </text>
          </g>
        </g>

        {/* 4. C8-E: NGÕ CỤT KHI TIỆM BIẾN MẤT (x=1420, y=748, w=460, h=312)   */}
        <g transform="translate(1420 748)">
          <rect width={460} height={312} rx={8} fill="url(#tvCardBg)" stroke="#64748B" strokeWidth={1.4} />
          <rect x={16} y={12} width={380} height={24} rx={3} fill="#0F172A" />
          <text x={26} y={28} fill="#94A3B8" fontFamily={FONT.title} fontWeight="bold" fontSize={11}>
            CẢNH 8-E: TIỆM ÔNG LỘC BIẾN MẤT (ALLEY WITHOUT SHOP)
          </text>

          {/* Scaled Scene with blue nocturnal lighting clipped inside nested SVG */}
          <svg x={16} y={44} width={428} height={185} viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
            <AlleyWithoutShop t={t} showOwl />
          </svg>

          {/* Explanatory text */}
          <g transform="translate(16 235)">
            <rect width={428} height={60} rx={4} fill="#0F172A" />
            <text x={12} y={22} fill="#CBD5E1" fontFamily={FONT.ui} fontSize={10.2}>
              • Sau khi hai đứa trẻ rời đi, cửa tiệm và ánh đèn vàng biến mất hoàn toàn.
            </text>
            <text x={12} y={42} fill="#94A3B8" fontFamily={FONT.ui} fontSize={9.8}>
              • Chỉ còn lại bức tường rêu phong ngõ cụt vắng lặng · Cú đêm vẫn đậu quan sát.
            </text>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
