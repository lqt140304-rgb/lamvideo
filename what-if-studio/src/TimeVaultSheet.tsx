import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import {
  ClockCreature,
  MemoryJar,
  ReverseHourglass,
  ReverseClockwork,
  TemporalFissure,
  AstrologicalFloor,
  TimeChains,
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
            THE CRACK IN REALITY · THỰC THỂ 01: QUÁI VẬT ĐỒNG HỒ VÀ ĐIỆN THỜ THỜI GIAN (CATHEDRAL OF TIME)
          </text>
          <text
            x={28}
            y={54}
            fill="#C0B0D8"
            fontFamily={FONT.ui}
            fontSize={13}
            letterSpacing={0.3}
          >
            Nguyên hình ông Lộc cải tiến · Ba mắt thấu kính và Hào quang bánh răng · 2 Hàng kệ ký ức nhiều người · Vết rách không gian tua ngược · Sàn đồ hình thiên văn và Xích treo khổng lồ
          </text>
          <rect x={1630} y={16} width={185} height={36} rx={5} fill="#14B8A6" opacity={0.18} stroke="#2DD4BF" strokeWidth={1.2} />
          <text x={1722} y={39} fill="#5EEAD4" fontFamily={FONT.ui} fontWeight="bold" fontSize={12} textAnchor="middle">
            VŨ TRỤ THE CRACK IN REALITY (HẺM CÓ CHUYỆN)
          </text>
        </g>

        {/* =================================================================== */}
        {/* MAIN PANEL: TOÀN BỘ ĐIỆN THỜ THỜI GIAN CẢNH 9 (1160 x 630)          */}
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
          <rect x={18} y={14} width={520} height={28} rx={4} fill="#1E1433" stroke="#D4A24C" strokeWidth={1} />
          <text x={30} y={33} fill="#FDE68A" fontFamily={FONT.title} fontWeight="bold" fontSize={12} letterSpacing={0.6}>
            CẢNH 9: TOÀN BỘ ĐIỆN THỜ THỜI GIAN BỊ ĐÁNH CẮP (CATHEDRAL OF STOLEN TIME) · 28S KHÔNG LỜI
          </text>

          {/* Embedded Scaled Scene with nested SVG */}
          <svg x={10} y={48} width={1140} height={532} viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet">
            <TimeVaultScene t={t} showJars />
          </svg>

          {/* Bottom Scene Legend */}
          <rect x={10} y={586} width={1140} height={34} rx={4} fill="#140B22" />
          <text x={20} y={607} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10}>
            Bố cục 2.5D: Vết rách thời gian tua ngược trung tâm · Hai hàng cột kệ đá chứa ký ức người khác (nôi, diều, vĩ cầm, thuyền, ô, thư) · Xích sắt treo · Sàn 12 số La Mã rạn nứt
          </text>
        </g>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: MACRO CALLOUTS & DETAIL ASSETS                        */}
        {/* =================================================================== */}

        {/* 1. CALLOUT: NGUYÊN HÌNH QUÁI VẬT ĐỒNG HỒ (x=1220, y=102)             */}
        <g transform="translate(1220 102)">
          <rect width={660} height={310} rx={8} fill="url(#tvCardBg)" stroke="#38BDF8" strokeWidth={1.5} />
          {/* Label */}
          <rect x={18} y={14} width={450} height={26} rx={4} fill="#0F172A" stroke="#38BDF8" strokeWidth={1} />
          <text x={28} y={31} fill="#7DD3FC" fontFamily={FONT.title} fontWeight="bold" fontSize={11.5} letterSpacing={0.5}>
            NGUYÊN HÌNH THỰC THỂ 01 (CLOCK CREATURE) · CHI TIẾT CẢI TIẾN
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
              • Hào quang bánh răng gai quay chậm (halo escapement).
            </text>
            <text x={16} y={63} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10.2}>
              • Lõi dây cót đập nhịp cơ học bên hông vỏ đồng rêu.
            </text>
            <text x={16} y={81} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10.2}>
              • 3 mắt thấu kính aperture mở khẩu, đồng tử kép lạnh.
            </text>
            <text x={16} y={99} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10.2}>
              • Nếp nhăn da người già đan vào 12 vạch số La Mã.
            </text>
            <text x={16} y={117} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10.2}>
              • Miệng mỏng đính răng cưa nhỏ và ria mép lò xo bí hiểm.
            </text>
            <text x={16} y={135} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10.2}>
              • Tay cơ khí: Khớp xoay; vuốt ngửa có tia lửa thời gian.
            </text>
            <text x={16} y={153} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10.2}>
              • Chân raptor gập ngược, sừng đầu hồi Gothic phía trên.
            </text>
            <text x={16} y={171} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={10.2}>
              • Sương mù hư vô tím đen cuộn trôi dưới chân lơ lửng.
            </text>
            <rect x={14} y={188} width={287} height={44} rx={4} fill="#1E1B4B" />
            <text x={24} y={205} fill="#C7D2FE" fontFamily={FONT.ui} fontSize={9.5}>
              Phong cách: Nét phác mực và chì kết hợp màu nước kim
            </text>
            <text x={24} y={220} fill="#A5B4FC" fontFamily={FONT.ui} fontSize={9.5}>
              loại có chiều sâu, tách khớp chuyển động có chủ ý.
            </text>
          </g>
        </g>

        {/* 2. CALLOUT: BA CHIẾC LỌ GIAO KÈO CỦA 2 ANH EM (x=1220, y=424)         */}
        <g transform="translate(1220 424)">
          <rect width={660} height={308} rx={8} fill="url(#tvCardBg)" stroke="#F59E0B" strokeWidth={1.5} />
          <rect x={18} y={14} width={470} height={26} rx={4} fill="#1C1008" stroke="#D97706" strokeWidth={1} />
          <text x={28} y={31} fill="#FDE68A" fontFamily={FONT.title} fontWeight="bold" fontSize={11.5} letterSpacing={0.5}>
            CHI TIẾT 3 VẬT CHỨA KÝ ỨC CỦA 2 ANH EM (JARS G1, G2, G3)
          </text>

          {/* Jar G1 */}
          <g transform="translate(110 145)">
            <rect x={-85} y={-95} width={170} height={240} rx={6} fill="#0F0C16" stroke="#78350F" strokeWidth={1} />
            <MemoryJar x={0} y={-2} s={1.3} kind="g1" glow={1.3} t={t} showAura />
            <rect x={-75} y={64} width={150} height={22} rx={3} fill="#451A03" />
            <text x={0} y={79} fill="#FEF08A" fontFamily={FONT.title} fontWeight="bold" fontSize={10.5} textAnchor="middle">
              LỌ G1 · XE VÀ TAY MẸ
            </text>
            <text x={0} y={103} fill="#CBD5E1" fontFamily={FONT.ui} fontSize={9.2} textAnchor="middle">
              Tranh xe gỗ và tay mẹ làm hòa
            </text>
            <text x={0} y={118} fill="#94A3B8" fontFamily={FONT.ui} fontSize={9} textAnchor="middle">
              Bụi ký ức tan rã lên nắp lọ
            </text>
            <text x={0} y={133} fill="#F97316" fontFamily={FONT.ui} fontWeight="bold" fontSize={9.2} textAnchor="middle">
              Duy đã trả (quên sạch về mẹ)
            </text>
          </g>

          {/* Jar G2 */}
          <g transform="translate(330 145)">
            <rect x={-85} y={-95} width={170} height={240} rx={6} fill="#0F0C16" stroke="#0369A1" strokeWidth={1} />
            <MemoryJar x={0} y={-2} s={1.3} kind="g2" glow={1.4} t={t} showAura />
            <rect x={-75} y={64} width={150} height={22} rx={3} fill="#0C4A6E" />
            <text x={0} y={79} fill="#BAE6FD" fontFamily={FONT.title} fontWeight="bold" fontSize={10.5} textAnchor="middle">
              LỌ G2 · XOẮN KÉP CHUYỂN BUỒN
            </text>
            <text x={0} y={103} fill="#CBD5E1" fontFamily={FONT.ui} fontSize={9.2} textAnchor="middle">
              Xoắn kép tím biếc và hổ phách
            </text>
            <text x={0} y={118} fill="#94A3B8" fontFamily={FONT.ui} fontSize={9} textAnchor="middle">
              Tim pha lê hàn gắn ở đỉnh xoáy
            </text>
            <text x={0} y={133} fill="#38BDF8" fontFamily={FONT.ui} fontWeight="bold" fontSize={9.2} textAnchor="middle">
              Duy gánh trọn nỗi buồn Thảo
            </text>
          </g>

          {/* Jar G3 */}
          <g transform="translate(550 145)">
            <rect x={-85} y={-95} width={170} height={240} rx={6} fill="#0F0C16" stroke="#854D0E" strokeWidth={1} />
            <MemoryJar x={0} y={-2} s={1.3} kind="g3" glow={1.3} t={t} showAura />
            <rect x={-75} y={64} width={150} height={22} rx={3} fill="#581C87" />
            <text x={0} y={79} fill="#FDE047" fontFamily={FONT.title} fontWeight="bold" fontSize={10.5} textAnchor="middle">
              LỌ G3 · CHUÔNG NIÊM PHONG
            </text>
            <text x={0} y={103} fill="#CBD5E1" fontFamily={FONT.ui} fontSize={9.2} textAnchor="middle">
              Xích sắt, khóa đồng và băng giá
            </text>
            <text x={0} y={118} fill="#94A3B8" fontFamily={FONT.ui} fontSize={9} textAnchor="middle">
              Cửa hé in bóng mẹ và hạc giấy
            </text>
            <text x={0} y={133} fill="#EAB308" fontFamily={FONT.ui} fontWeight="bold" fontSize={9.2} textAnchor="middle">
              Thảo đổi mọi giấc mơ về mẹ
            </text>
          </g>
        </g>

        {/* =================================================================== */}
        {/* BOTTOM ROW: REVERSE PHENOMENA & CAMEO ASSETS (4 BOXES)             */}
        {/* =================================================================== */}

        {/* 1. OTHER SOULS' MEMORIES (x=40, y=748, w=440, h=312)                */}
        <g transform="translate(40 748)">
          <rect width={440} height={312} rx={8} fill="url(#tvCardBg)" stroke="#A855F7" strokeWidth={1.4} />
          <rect x={16} y={12} width={380} height={24} rx={3} fill="#2E1065" />
          <text x={26} y={28} fill="#E9D5FF" fontFamily={FONT.title} fontWeight="bold" fontSize={11}>
            KÝ ỨC NGƯỜI KHÁC TRÊN HAI HÀNG KỆ (OTHER SOULS)
          </text>

          {/* 4 Memory jars displayed in a neat grid */}
          <g transform="translate(56 112)">
            <MemoryJar x={0} y={0} s={0.72} kind="cradle" glow={1.1} t={t} showAura />
            <text x={0} y={54} fill="#FEF08A" fontFamily={FONT.ui} fontSize={8.5} textAnchor="middle">Nôi em bé</text>
            <text x={0} y={67} fill="#94A3B8" fontFamily={FONT.ui} fontSize={7.5} textAnchor="middle">Câu ru ngủ</text>
          </g>
          <g transform="translate(156 112)">
            <MemoryJar x={0} y={0} s={0.72} kind="kite" glow={1.15} t={t + 3} showAura />
            <text x={0} y={54} fill="#FEF08A" fontFamily={FONT.ui} fontSize={8.5} textAnchor="middle">Diều đỏ</text>
            <text x={0} y={67} fill="#94A3B8" fontFamily={FONT.ui} fontSize={7.5} textAnchor="middle">Tuổi thơ nắng</text>
          </g>
          <g transform="translate(256 112)">
            <MemoryJar x={0} y={0} s={0.72} kind="violin" glow={1.15} t={t + 6} showAura />
            <text x={0} y={54} fill="#FEF08A" fontFamily={FONT.ui} fontSize={8.5} textAnchor="middle">Vĩ cầm gãy</text>
            <text x={0} y={67} fill="#94A3B8" fontFamily={FONT.ui} fontSize={7.5} textAnchor="middle">Khúc nhạc dở</text>
          </g>
          <g transform="translate(356 112)">
            <MemoryJar x={0} y={0} s={0.72} kind="letter" glow={1.15} t={t + 9} showAura />
            <text x={0} y={54} fill="#FEF08A" fontFamily={FONT.ui} fontSize={8.5} textAnchor="middle">Thư sáp đỏ</text>
            <text x={0} y={67} fill="#94A3B8" fontFamily={FONT.ui} fontSize={7.5} textAnchor="middle">Lời hẹn xưa</text>
          </g>

          {/* Explanatory notes */}
          <g transform="translate(16 200)">
            <rect width={408} height={96} rx={4} fill="#140E1F" stroke="#2E1B40" strokeWidth={1} />
            <text x={12} y={22} fill="#FDE047" fontFamily={FONT.title} fontWeight="bold" fontSize={10}>
              KHO TÀNG LƯU TRỮ HÀNG TRĂM GIAO KÈO:
            </text>
            <text x={12} y={42} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={9.5}>
              • Trên 2 hàng cột kệ đá kéo dài vô tận: thuyền viễn dương, chiếc ô mưa...
            </text>
            <text x={12} y={60} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={9.5}>
              • Mỗi chiếc lọ là một mảnh hồn hoặc tiếc nuối bị tước đoạt qua nhiều thế kỷ.
            </text>
            <text x={12} y={78} fill="#C084FC" fontFamily={FONT.ui} fontSize={9.2}>
              • Khắc họa cảm giác áp bức, ma mị và cái giá khắc nghiệt của thời gian.
            </text>
          </g>
        </g>

        {/* 2. TEMPORAL FISSURE (x=500, y=748, w=440, h=312)                      */}
        <g transform="translate(500 748)">
          <rect width={440} height={312} rx={8} fill="url(#tvCardBg)" stroke="#38BDF8" strokeWidth={1.4} />
          <rect x={16} y={12} width={380} height={24} rx={3} fill="#0C4A6E" />
          <text x={26} y={28} fill="#BAE6FD" fontFamily={FONT.title} fontWeight="bold" fontSize={11}>
            VẾT RÁCH THỜI GIAN TUA NGƯỢC (TEMPORAL FISSURE)
          </text>

          {/* Macro Fissure Preview inside nested SVG */}
          <svg x={16} y={46} width={190} height={252} viewBox="-160 -360 320 720" preserveAspectRatio="xMidYMid meet">
            <TemporalFissure x={0} y={0} s={0.88} t={t} />
          </svg>

          {/* Notes */}
          <g transform="translate(216 48)">
            <rect width={210} height={250} rx={4} fill="#082F49" opacity={0.35} />
            <text x={10} y={24} fill="#FDE047" fontFamily={FONT.title} fontWeight="bold" fontSize={11}>
              VẾT RÁCH KHÔNG GIAN:
            </text>
            <text x={10} y={48} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={9.8}>
              • Vết rách toác trung tâm
            </text>
            <text x={10} y={66} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={9.8}>
              cắt ngang thực tại.
            </text>
            <text x={10} y={90} fill="#38BDF8" fontFamily={FONT.ui} fontWeight="bold" fontSize={9.8}>
              • Sét thời gian giật ngược
            </text>
            <text x={10} y={108} fill="#CBD5E1" fontFamily={FONT.ui} fontSize={9.5}>
              phân nhánh xanh - vàng - tím.
            </text>
            <text x={10} y={132} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={9.8}>
              • Mảnh vỡ mặt đồng hồ
            </text>
            <text x={10} y={150} fill="#CBD5E1" fontFamily={FONT.ui} fontSize={9.5}>
              tự xoay và hợp nhất vào rift.
            </text>
            <text x={10} y={174} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={9.8}>
              • Luồng bụi sáng bị hút
            </text>
            <text x={10} y={192} fill="#CBD5E1" fontFamily={FONT.ui} fontSize={9.5}>
              ngược vào tâm hố sâu.
            </text>
          </g>
        </g>

        {/* 3. ASTROLOGICAL FLOOR & CHAINS (x=960, y=748, w=440, h=312)          */}
        <g transform="translate(960 748)">
          <rect width={440} height={312} rx={8} fill="url(#tvCardBg)" stroke="#D4A24C" strokeWidth={1.4} />
          <rect x={16} y={12} width={380} height={24} rx={3} fill="#3E2718" />
          <text x={26} y={28} fill="#FDE68A" fontFamily={FONT.title} fontWeight="bold" fontSize={11}>
            SÀN ĐỒ HÌNH THIÊN VĂN VÀ XÍCH TREO (FLOOR & CHAINS)
          </text>

          {/* Floor & Chain Graphic inside nested SVG */}
          <svg x={16} y={46} width={200} height={252} viewBox="-360 -140 720 340" preserveAspectRatio="xMidYMid meet">
            <AstrologicalFloor x={0} y={20} s={0.52} t={t} />
            <TimeChains x={-140} y={-140} length={190} t={t} swayAmp={2} showBob />
            <TimeChains x={140} y={-140} length={190} t={t + 6} swayAmp={2} showBob />
          </svg>

          {/* Notes */}
          <g transform="translate(225 48)">
            <rect width={200} height={250} rx={4} fill="#1C1008" opacity={0.45} />
            <text x={10} y={24} fill="#FDE047" fontFamily={FONT.title} fontWeight="bold" fontSize={11}>
              CHI TIẾT KIẾN TRÚC:
            </text>
            <text x={10} y={48} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={9.8}>
              • 12 số La Mã cổ chạm khắc
            </text>
            <text x={10} y={66} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={9.8}>
              trên vành đá đồng tâm.
            </text>
            <text x={10} y={90} fill="#06B6D4" fontFamily={FONT.ui} fontWeight="bold" fontSize={9.8}>
              • Vết rạn ngầm rò rỉ ánh sáng
            </text>
            <text x={10} y={108} fill="#CBD5E1" fontFamily={FONT.ui} fontSize={9.5}>
              xanh ngọc và hổ phách rực rỡ.
            </text>
            <text x={10} y={132} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={9.8}>
              • La bàn 8 cánh xoay chậm
            </text>
            <text x={10} y={150} fill="#CBD5E1" fontFamily={FONT.ui} fontSize={9.5}>
              tạo luồng khí huyền bí.
            </text>
            <text x={10} y={174} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={9.8}>
              • Xích sắt và quả lắc khổng lồ
            </text>
            <text x={10} y={192} fill="#CBD5E1" fontFamily={FONT.ui} fontSize={9.5}>
              đong đưa tạo nhịp điệu thời gian.
            </text>
          </g>
        </g>

        {/* 4. C8-E: NGÕ CỤT MẤT TIỆM VÀ ĐỒNG HỒ CÁT (x=1420, y=748, w=460, h=312) */}
        <g transform="translate(1420 748)">
          <rect width={460} height={312} rx={8} fill="url(#tvCardBg)" stroke="#64748B" strokeWidth={1.4} />
          <rect x={16} y={12} width={420} height={24} rx={3} fill="#0F172A" />
          <text x={26} y={28} fill="#94A3B8" fontFamily={FONT.title} fontWeight="bold" fontSize={11}>
            CẢNH 8-E: NGÕ CỤT MẤT TIỆM VÀ ĐỒNG HỒ CÁT NGƯỢC
          </text>

          {/* Scaled Alley clipped inside nested SVG */}
          <svg x={16} y={44} width={428} height={140} viewBox="50 140 1830 600" preserveAspectRatio="xMidYMid slice">
            <AlleyWithoutShop t={t} showOwl caption />
          </svg>

          {/* Bottom sub-panel: Reverse hourglass preview + explanation */}
          <g transform="translate(16 190)">
            <rect width={428} height={108} rx={4} fill="#0F172A" />
            <svg x={8} y={4} width={80} height={100} viewBox="-35 -115 70 135" preserveAspectRatio="xMidYMid meet">
              <ReverseHourglass x={0} y={0} s={0.8} t={t} />
            </svg>
            <g transform="translate(100 18)">
              <text x={0} y={0} fill="#FDE047" fontFamily={FONT.title} fontWeight="bold" fontSize={10}>
                KHI GIAO KÈO HOÀN TẤT:
              </text>
              <text x={0} y={18} fill="#E2E8F0" fontFamily={FONT.ui} fontSize={9.5}>
                • Cửa tiệm biến mất hoàn toàn, chỉ còn bức tường rêu ngõ cụt vắng lặng.
              </text>
              <text x={0} y={34} fill="#5EEAD4" fontFamily={FONT.ui} fontSize={9.5}>
                • Bệ đồng hồ cát: Hạt sáng chảy ngược từ đáy lên đỉnh chống trọng lực.
              </text>
              <text x={0} y={50} fill="#94A3B8" fontFamily={FONT.ui} fontSize={9}>
                • Cameo chân dung 3 mắt và lọ sáng gieo sẵn từ C1-B và C2-A trong tiệm.
              </text>
            </g>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
