import React from 'react';
import { AbsoluteFill } from 'remotion';
import { KitDefs, SetDefs, FONT } from './engine';
import {
  AlleyExteriorScene,
  OngLocShop,
  OngLocCounter,
  Hero,
  LOOKS,
  standPose,
  sitPose,
  SunsetRiceField,
  MotherThaoHouse,
  DiningTableSet,
} from './engine';

/**
 * ColorScriptSheet:
 * Bảng tổng phổ Ngôn ngữ Màu sắc & Ánh sáng (Cinematic Color Script & Lighting Progression)
 * cho tập 01 "Tin Nhắn Chưa Gửi" (The Crack in Reality / Hẻm Có Chuyện).
 * 
 * 5 Hồi màu sắc tâm lý theo diễn biến kịch bản:
 * 1. Act I (Cảnh 0): Đêm Ngõ Cụt & Bầu Trời — Xanh chàm lạnh lẽo, cô lập, chiaroscuro quầng đèn đường.
 * 2. Act II (Cảnh 1–3): Tiệm Đồ Cũ Ông Lộc — Vàng vonfram ấm cũ kỹ, bụi thời gian, u tịch bí ẩn.
 * 3. Act III (Cảnh 4–5): Giao Kèo & Gánh Nỗi Buồn — Tương phản gắt, xanh xám lạnh, desaturated khi mất mát.
 * 4. Act IV (Cảnh 6–7): Cánh Đồng Nắng Chiều Gặp Mẹ — Vàng óng mật ong, chuồn chuồn ớt đỏ, ấm áp tình mẫu tử.
 * 5. Act V (Cảnh 8): Ngưỡng Cửa Nhà & Bàn Thờ Mẹ — Nâu mật ấm cúng đời thường, dải băng tang & đèn đỏ thiêng liêng.
 */

interface ColorAct {
  act: string;
  scene: string;
  title: string;
  sub: string;
  mood: string;
  lighting: string;
  palette: { hex: string; name: string }[];
  renderPreview: (w: number, h: number) => React.ReactNode;
}

export const ColorScriptSheet: React.FC = () => {
  const acts: ColorAct[] = [
    {
      act: 'ACT I',
      scene: 'CẢNH 0 (00:00 – 00:24)',
      title: 'ĐÊM NGÕ CỤT & BẦU TRỜI',
      sub: 'Bầu trời đêm thành phố hạ dần xuống con ngõ cụt vắng lặng',
      mood: 'Cô lập · Lạnh lẽo · Bế tắc · Đô thị đêm',
      lighting: 'Đèn đường sodium vàng nhạt tạo quầng cô lập giữa bóng tối xanh chàm sâu',
      palette: [
        { hex: '#070B16', name: 'Đêm đen sâu' },
        { hex: '#141F36', name: 'Chàm đô thị' },
        { hex: '#2A3B56', name: 'Bóng râm ngõ' },
        { hex: '#E5B842', name: 'Đèn đường' },
        { hex: '#D9D2C5', name: 'Ánh trăng mờ' },
      ],
      renderPreview: (w, h) => (
        <svg width={w} height={h} viewBox="0 0 1920 1080">
          <AlleyExteriorScene t={24} showOwl showPassersby={false} />
          <Hero
            look={LOOKS.duy}
            rimId="rimShopWarm"
            shadow={0.35}
            pose={standPose(1255, 925, 0.88, { t: 24, seed: 1, yaw: 0.48, expr: 'worried', look: 0.55 })}
          />
        </svg>
      ),
    },
    {
      act: 'ACT II',
      scene: 'CẢNH 1–3 · THEO NHỊP LỜI',
      title: 'TIỆM ĐỒ CŨ ÔNG LỘC',
      sub: 'Không gian tiệm sửa đồng hồ & điện thoại u tịch ngập tràn đồ cũ',
      mood: 'U tịch · Bụi bặm thời gian · Huyền bí · Hoài niệm',
      lighting: 'Đèn bàn thợ sửa 40W vàng hổ phách, soi rõ mặt bàn, góc phòng chìm trong bóng tối',
      palette: [
        { hex: '#16110E', name: 'Góc tối tiệm' },
        { hex: '#3E271E', name: 'Gỗ nâu cũ' },
        { hex: '#7E5438', name: 'Bàn thợ sửa' },
        { hex: '#D4A24C', name: 'Đèn bàn vàng' },
        { hex: '#F0DFBE', name: 'Biên nhận cũ' },
      ],
      renderPreview: (w, h) => (
        <svg width={w} height={h} viewBox="0 0 1920 1080">
          <OngLocShop t={24} id="csShop" veil={0.4} />
          <Hero look={LOOKS.ongLoc} pose={standPose(1355, 715, 0.95, { t: 24, seed: 3, yaw: -0.35, expr: 'glanceOverGlasses', look: -0.3 })} />
          <OngLocCounter x={890} y={855} w={880} t={24} phoneState="cracked" showPhoto={false} receiptStage="none" />
          <Hero look={LOOKS.duy} pose={standPose(640, 915, 0.94, { t: 24, seed: 1, yaw: 0.35, expr: 'worried', look: 0.3 })} />
        </svg>
      ),
    },
    {
      act: 'ACT III',
      scene: 'CẢNH 4–5 · THEO NHỊP LỜI',
      title: 'GIAO KÈO & GÁNH NỖI BUỒN',
      sub: 'Quên buổi tranh đồ chơi rồi làm hòa; gánh nỗi buồn em; Thảo nhận G3',
      mood: 'Căng thẳng · Lạnh lẽo · Hy sinh · Kiệt sức ngột ngạt',
      lighting: 'Tương phản gắt (Chiaroscuro tension), rút bớt sắc ấm, ám xanh xám mệt mỏi',
      palette: [
        { hex: '#0E1520', name: 'Bóng tối lạnh' },
        { hex: '#263346', name: 'Xanh xám slate' },
        { hex: '#6E7C90', name: 'Ánh đèn tái' },
        { hex: '#B83226', name: 'Dấu triện đỏ' },
        { hex: '#FFFDF8', name: 'Trắng chuyển cõi' },
      ],
      renderPreview: (w, h) => (
        <svg width={w} height={h} viewBox="0 0 1920 1080">
          <OngLocShop t={24} id="csTension" veil={0.48} />
          <OngLocCounter x={890} y={855} w={880} t={24} phoneState="repaired" showPhoto receiptStage="signed" />
          <Hero look={LOOKS.duy} pose={sitPose(630, 830, 0.95, 1, { t: 24, seed: 1, yaw: 0.28, expr: 'exhaustedClinch', look: 0.2, headTilt: 6 })} />
          <Hero look={LOOKS.thao} pose={sitPose(480, 835, 0.72, 1, { t: 24, seed: 2, yaw: 0.42, expr: 'worried', look: 0.35, gesture: 'handOnChest' })} />
        </svg>
      ),
    },
    {
      act: 'ACT IV',
      scene: 'CẢNH 6–7 · THEO NHỊP LỜI',
      title: 'CÁNH ĐỒNG CHIỀU GẶP MẸ',
      sub: 'Miền ký ức hư cấu ven làng: lúa chín vàng, chuồn chuồn ớt, mẹ ôm hai con',
      mood: 'Ấm áp · Rực rỡ · Mật ngọt tình mẹ · Xúc động nghẹn ngào',
      lighting: 'Hoàng hôn mật ong (Golden Hour amber bloom), nắng chiều ấm từ góc trái',
      palette: [
        { hex: '#77799D', name: 'Trời cam tím' },
        { hex: '#FCE09C', name: 'Nắng mật ong' },
        { hex: '#EBB46B', name: 'Lúa chín vàng' },
        { hex: '#E62817', name: 'Chuồn chuồn ớt' },
        { hex: '#8C7046', name: 'Bờ đất bằng' },
      ],
      renderPreview: (w, h) => (
        <svg width={w} height={h} viewBox="0 0 1920 1080">
          <SunsetRiceField t={24} whiteout={0} />
          <Hero look={LOOKS.thao} pose={sitPose(790, 775, 0.72, 1, { t: 24, seed: 2, yaw: 0.42, expr: 'cry', look: 0.35, headTilt: 6, gesture: 'handOnChest' })} />
          <Hero look={LOOKS.meDuyThao} pose={sitPose(945, 765, 0.92, -1, { t: 24, seed: 5, yaw: -0.18, expr: 'smile', look: -0.2, headTilt: 4, gesture: 'explain' })} />
          <Hero look={LOOKS.duy} pose={sitPose(1115, 775, 0.9, -1, { t: 24, seed: 1, yaw: -0.42, expr: 'sad', look: -0.35, headTilt: 5 })} />
        </svg>
      ),
    },
    {
      act: 'ACT V',
      scene: 'CẢNH 8 · THEO NHỊP LỜI',
      title: 'NGƯỠNG CỬA NHÀ & BÀN THỜ MẸ',
      sub: 'Trở về thực tại ấm cúng: bàn ăn gỗ, di ảnh mẹ băng tang đỏ ấm, hai anh em bên nhau',
      mood: 'Tĩnh lặng · Ấm cúng đời thường · Vững vàng bước tiếp',
      lighting: 'Đèn mây vàng dịu chiếu sáng mâm cơm, bàn thờ đỏ linh thiêng, vách sau tối mờ',
      palette: [
        { hex: '#18110D', name: 'Bóng vách sau' },
        { hex: '#4A2E1E', name: 'Bàn ăn gỗ mộc' },
        { hex: '#F5BA58', name: 'Đèn mây ấm' },
        { hex: '#B83A32', name: 'Đèn thờ quả nhót' },
        { hex: '#8DA4C4', name: 'Áo xanh Duy' },
      ],
      renderPreview: (w, h) => (
        <svg width={w} height={h} viewBox="0 0 1920 1080">
          <MotherThaoHouse t={24} id="csHome" showFatherShadow veil={0.62} />
          <DiningTableSet x={980} y={915} w={450} showPhone showReceipt />
          <Hero look={LOOKS.duy} pose={standPose(720, 875, 0.92, { t: 24, seed: 1, yaw: 0.35, expr: 'determined', look: 0.3, gesture: 'holdProp' })} />
          <Hero look={LOOKS.thao} pose={standPose(570, 895, 0.7, { t: 24, seed: 2, yaw: 0.32, expr: 'worried', look: 0.25, gesture: 'handOnChest' })} />
        </svg>
      ),
    },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#0B0813' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <KitDefs />
        <SetDefs />

        {/* Background gradient */}
        <defs>
          <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0E0A1A" />
            <stop offset="50%" stopColor="#140E24" />
            <stop offset="100%" stopColor="#0B0714" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#bgGrad)" />

        {/* Top Header Banner */}
        <g transform="translate(60 30)">
          <rect x={0} y={0} width={1800} height={80} rx={14} fill="#181224" stroke="#E8B86D" strokeWidth={2} opacity={0.95} />
          <text x={32} y={35} fontFamily={FONT.title} fontWeight={800} fontSize={26} fill="#FFE8A8" letterSpacing={1.2}>
            THE CRACK IN REALITY · HỒ SƠ 01: TIN NHẮN CHƯA GỬI · COLOR SCRIPT
          </text>
          <text x={32} y={62} fontFamily={FONT.ui} fontSize={14.5} fill="#D6C7E8" letterSpacing={0.8}>
            Hành trình thị giác 5 hồi tâm lý: Từ bóng tối ngõ hẻm cô lập → Tiệm đồng hồ cổ kính → Đỉnh điểm hy sinh → Cánh đồng hoàng hôn rực rỡ → Ngưỡng cửa ấm áp bên nhau
          </text>
          <rect x={1580} y={18} width={188} height={44} rx={8} fill="#261A3A" stroke="#B894E2" strokeWidth={1.2} />
          <text x={1674} y={45} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={13} fill="#EADAF8">
            5 ACT PROGRESSION
          </text>
        </g>

        {/* 5 Chronological Color Columns */}
        {acts.map((act, index) => {
          const colW = 344;
          const colGap = 20;
          const leftX = 60 + index * (colW + colGap);
          const topY = 135;
          const colH = 905;

          return (
            <g key={act.act} transform={`translate(${leftX} ${topY})`}>
              {/* Outer Card Background */}
              <rect
                x={0}
                y={0}
                width={colW}
                height={colH}
                rx={14}
                fill="#161022"
                stroke={index === 3 ? '#E89B2B' : '#3E2F52'}
                strokeWidth={index === 3 ? 2.5 : 1.5}
                opacity={0.96}
              />

              {/* Top Act Header Tag */}
              <rect x={14} y={14} width={316} height={32} rx={6} fill={index === 3 ? '#3D2510' : '#231835'} />
              <text x={26} y={35} fontFamily={FONT.title} fontWeight={800} fontSize={13} fill={index === 3 ? '#FFD47A' : '#E0D0F5'}>
                {act.act} · {act.scene}
              </text>

              {/* Title & Sub */}
              <text x={16} y={72} fontFamily={FONT.title} fontWeight={800} fontSize={17} fill="#FFF6EA">
                {act.title}
              </text>
              <text x={16} y={94} fontFamily={FONT.ui} fontSize={11.5} fill="#B8A8D0">
                {act.sub}
              </text>

              {/* Stills Frame Preview Box (16:9 ratio) */}
              <g transform="translate(14 112)">
                <rect x={0} y={0} width={316} height={178} rx={8} fill="#09060E" stroke="#544268" strokeWidth={1.2} />
                <defs>
                  <clipPath id={`clipAct${index}`}>
                    <rect x={0} y={0} width={316} height={178} rx={8} />
                  </clipPath>
                </defs>
                <g clipPath={`url(#clipAct${index})`}>
                  {act.renderPreview(316, 178)}
                </g>
              </g>

              {/* Mood Badge */}
              <rect x={14} y={304} width={316} height={34} rx={6} fill="#201532" stroke="#483362" strokeWidth={1} />
              <text x={172} y={325} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={11.5} fill="#FFE2A8">
                {act.mood}
              </text>

              {/* 5-Color Palette Bar */}
              <g transform="translate(14 350)">
                <text x={0} y={15} fontFamily={FONT.ui} fontWeight={700} fontSize={11} fill="#D6C5EC" letterSpacing={0.5}>
                  BẢNG MÀU CHỦ ĐẠO (PALETTE)
                </text>
                <g transform="translate(0 24)">
                  {act.palette.map((color, ci) => {
                    const sw = 63.2;
                    return (
                      <g key={color.hex} transform={`translate(${ci * sw} 0)`}>
                        <rect x={0} y={0} width={sw} height={42} fill={color.hex} stroke="#281A3C" strokeWidth={1} />
                        <text x={sw / 2} y={56} textAnchor="middle" fontFamily={FONT.hand} fontWeight={700} fontSize={10} fill="#FFE8A8">
                          {color.hex}
                        </text>
                        <text x={sw / 2} y={70} textAnchor="middle" fontFamily={FONT.ui} fontSize={8.5} fill="#C0B0D8">
                          {color.name}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </g>

              {/* Lighting & Cinematic Subtext */}
              <g transform="translate(14 455)">
                <rect x={0} y={0} width={316} height={205} rx={8} fill="#1D152C" stroke="#38284E" strokeWidth={1} />
                <text x={14} y={22} fontFamily={FONT.ui} fontWeight={700} fontSize={11.5} fill="#FFEAA7">
                  THIẾT KẾ ÁNH SÁNG & ĐIỆN ẢNH:
                </text>
                {(() => {
                  const words = act.lighting.split(' ');
                  const lines: string[] = [];
                  let cur = '';
                  for (const w of words) {
                    if ((cur + ' ' + w).length > 36) {
                      lines.push(cur.trim());
                      cur = w;
                    } else {
                      cur += ' ' + w;
                    }
                  }
                  if (cur) lines.push(cur.trim());
                  return lines.map((l, li) => (
                    <text key={li} x={14} y={44 + li * 18} fontFamily={FONT.ui} fontSize={11} fill="#E2D4F0">
                      • {l}
                    </text>
                  ));
                })()}

                {/* Emotional Value */}
                <path d="M 14 122 L 302 122" stroke="#3A2850" strokeWidth={1} />
                <text x={14} y={142} fontFamily={FONT.ui} fontWeight={700} fontSize={11.5} fill="#FFEAA7">
                  Ý NGHĨA TÂM LÝ NHÂN VẬT:
                </text>
                <text x={14} y={164} fontFamily={FONT.ui} fontSize={10.8} fill="#C6B5DC">
                  {index === 0
                    ? 'Bóng tối cô lập phản ánh sự bất lực của Duy trước căn bệnh của mẹ và hoàn cảnh cơ cực.'
                    : index === 1
                    ? 'Ánh vàng hổ phách u hoài của tiệm như một bảo tàng ký ức, nơi thời gian ngưng lại.'
                    : index === 2
                    ? 'Sắc lạnh desaturated nhấn mạnh sự đánh đổi nghiệt ngã: mất ký ức và chịu đựng gánh nặng.'
                    : index === 3
                    ? 'Màu vàng rực rỡ ôm trọn 3 mẹ con, hiện thực hóa ước mơ nhưng vẫn đượm buồn chia ly.'
                    : 'Ánh sáng bàn ăn và bàn thờ khẳng định tình anh em là điểm tựa duy nhất để vượt qua giông bão.'}
                </text>
              </g>

              {/* Camera Look Def Key */}
              <g transform="translate(14 675)">
                <rect x={0} y={0} width={316} height={70} rx={8} fill="#241838" stroke="#463260" strokeWidth={1} />
                <text x={14} y={24} fontFamily={FONT.ui} fontWeight={700} fontSize={11} fill="#E5D6F8">
                  LOOK DEF ENGINE FILTER:
                </text>
                <text x={14} y={48} fontFamily={FONT.hand} fontWeight={700} fontSize={13.5} fill={index === 3 ? '#FFD47A' : '#73E2A7'}>
                  {index === 0
                    ? 'nightAtmosphere (Indigo vignette)'
                    : index === 1
                    ? 'shopMystery (Amber sepia patina)'
                    : index === 2
                    ? 'tension (Slate desat contrast)'
                    : index === 3
                    ? 'warmMemory (Golden pollen bloom)'
                    : 'cozyHome (Warm domestic chiaroscuro)'}
                </text>
              </g>

              {/* Bottom Decorative Indicator */}
              <circle cx={colW / 2} cy={880} r={5} fill={index === 3 ? '#E89B2B' : '#5C4478'} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
