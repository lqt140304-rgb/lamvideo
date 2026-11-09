import React from 'react';

/**
 * ClockEntity: Nguyên hình Thực thể Đồng hồ Ba Mắt của Ông Lộc (Hẻm Có Chuyện)
 * Được thiết kế theo phong cách KHÔNG VIỀN (Lineless / Planar Shading):
 * - Thân mặt đồng hồ đồng cổ khổng lồ định hình bằng mảng màu kim loại & highlight (không viền đen).
 * - Ba mắt xếp hình tam giác phát sáng xuyên thấu huyền ảo.
 * - Các bánh răng cơ khí lồng ghép và kim đồng hồ quay chậm ngược chiều thời gian.
 * - Ba lọ ký ức (G1, G2, G3) lơ lửng với quầng lực xanh ngọc / hổ phách.
 */

export interface ClockEntityProps {
  t?: number;
  x?: number;
  y?: number;
  scale?: number;
  showJars?: boolean;
}

export const ClockEntity: React.FC<ClockEntityProps> = ({
  t = 0,
  x = 0,
  y = 0,
  scale = 1,
  showJars = true,
}) => {
  // Lơ lửng nhịp nhàng (breathe & float)
  const floatY = Math.sin(t * 0.04) * 12;
  const pulse = 1 + Math.sin(t * 0.06) * 0.03;
  
  // Kim đồng hồ quay ngược chiều chậm rãi (thời gian đảo chiều cục bộ)
  const hourAngle = -(t * 0.15) % 360;
  const minuteAngle = -(t * 0.6) % 360;
  const gearAngle1 = (t * 0.4) % 360;
  const gearAngle2 = -(t * 0.4) % 360;

  return (
    <g transform={`translate(${x} ${y + floatY}) scale(${scale})`}>
      <defs>
        {/* Hào quang lơ lửng xanh ngọc / tím huyền ảo */}
        <radialGradient id="entity-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4AE3B5" stopOpacity="0.45" />
          <stop offset="45%" stopColor="#8A5CF6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1E1B2E" stopOpacity="0" />
        </radialGradient>

        {/* Khối kim loại đồng cổ (Antique Bronze) phân mảng sáng tối */}
        <linearGradient id="bronze-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="25%" stopColor="#AA7A28" />
          <stop offset="55%" stopColor="#6E4D1B" />
          <stop offset="85%" stopColor="#3F2B0E" />
          <stop offset="100%" stopColor="#241708" />
        </linearGradient>

        <linearGradient id="bronze-face" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#2A2218" />
          <stop offset="50%" stopColor="#1B1610" />
          <stop offset="100%" stopColor="#100C09" />
        </linearGradient>

        <radialGradient id="eye-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0FFFF" stopOpacity="1" />
          <stop offset="35%" stopColor="#4AE3B5" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#1D8A6F" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0D3B2F" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="jar-amber-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF3B0" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.6" />
          <stop offset="85%" stopColor="#B45309" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#78350F" stopOpacity="0" />
        </radialGradient>

        <filter id="soft-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. VÙNG HÀO QUANG KHÔNG GIAN RIÊNG (AURA) */}
      <circle cx="0" cy="0" r="230" fill="url(#entity-aura)" />

      {/* 2. CÁC BÁNH RĂNG CƠ KHÍ NỀN (BACKGROUND COGS) - LINLESS METALLIC */}
      <g opacity="0.75">
        {/* Bánh răng lớn góc trái trên */}
        <g transform={`translate(-85, -85) rotate(${gearAngle1})`}>
          <circle cx="0" cy="0" r="54" fill="#523B17" />
          {Array.from({ length: 12 }, (_, i) => {
            const rad = (i * 30 * Math.PI) / 180;
            const tx = Math.cos(rad) * 58;
            const ty = Math.sin(rad) * 58;
            return <rect key={i} x={tx - 7} y={ty - 7} width="14" height="14" fill="#785623" transform={`rotate(${i * 30} ${tx} ${ty})`} />;
          })}
          <circle cx="0" cy="0" r="32" fill="#20170A" />
        </g>

        {/* Bánh răng góc phải dưới */}
        <g transform={`translate(95, 80) rotate(${gearAngle2})`}>
          <circle cx="0" cy="0" r="46" fill="#453112" />
          {Array.from({ length: 10 }, (_, i) => {
            const rad = (i * 36 * Math.PI) / 180;
            const tx = Math.cos(rad) * 50;
            const ty = Math.sin(rad) * 50;
            return <rect key={i} x={tx - 6} y={ty - 6} width="12" height="12" fill="#694B1B" transform={`rotate(${i * 36} ${tx} ${ty})`} />;
          })}
          <circle cx="0" cy="0" r="24" fill="#1C1408" />
        </g>
      </g>

      {/* 3. THÂN CHÍNH MẶT ĐỒNG HỒ ĐỒNG KHỔNG LỒ (MAIN CLOCK BODY) */}
      <g>
        {/* Vành ngoài đồng cổ (Outer Rim) - Tạo khối bằng mảng Gradient và Highlight, không viền stroke */}
        <circle cx="0" cy="0" r="148" fill="url(#bronze-rim)" />
        {/* Lớp rãnh kim loại bên trong (Bevel step) */}
        <circle cx="0" cy="0" r="138" fill="#1E1710" />
        <circle cx="0" cy="0" r="132" fill="url(#bronze-rim)" />
        {/* Mặt số tối huyền bí (Face dial) */}
        <circle cx="0" cy="0" r="124" fill="url(#bronze-face)" />

        {/* Vệt phản chiếu ánh sáng vòng cung (Rim specular reflection) */}
        <path
          d="M -90 -90 A 128 128 0 0 1 90 -90 A 120 120 0 0 0 -90 -90 Z"
          fill="#FFF2B2"
          opacity="0.38"
        />
        <path
          d="M -100 80 A 128 128 0 0 0 80 100 A 122 122 0 0 1 -100 80 Z"
          fill="#3F2B0E"
          opacity="0.75"
        />

        {/* Các vạch số cổ và ký hiệu đồng hồ */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const x1 = Math.cos(a) * 104;
          const y1 = Math.sin(a) * 104;
          const isQuarter = i % 3 === 0;
          return (
            <circle
              key={i}
              cx={x1}
              cy={y1}
              r={isQuarter ? 4.5 : 2.5}
              fill={isQuarter ? '#E2C26D' : '#8A6D37'}
            />
          );
        })}
      </g>

      {/* 4. BA CON MẮT MA MỊ XẾP TAM GIÁC (THREE LUMINOUS MYSTICAL EYES) */}
      <g>
        {/* Con mắt trên đỉnh (Top Eye - Trí tuệ & Thời gian) */}
        <g transform="translate(0, -50)">
          {/* Mảng hốc mắt đồng sẫm */}
          <path d="M -34 0 Q 0 -22 34 0 Q 0 22 -34 0 Z" fill="#0C0A09" />
          <path d="M -32 0 Q 0 -19 32 0 Q 0 19 -32 0 Z" fill="#1C1815" />
          {/* Quầng sáng mắt ngọc bích */}
          <circle cx="0" cy="0" r="18" fill="url(#eye-glow)" filter="url(#soft-glow)" />
          {/* Đồng tử con lắc thời gian */}
          <ellipse cx="0" cy="0" rx="3.5" ry="11" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="2.2" fill="#0D3B2F" />
        </g>

        {/* Con mắt bên trái (Left Eye) */}
        <g transform="translate(-46, 26)">
          <path d="M -28 0 Q 0 -18 28 0 Q 0 18 -28 0 Z" fill="#0C0A09" />
          <path d="M -26 0 Q 0 -15 26 0 Q 0 15 -26 0 Z" fill="#1C1815" />
          <circle cx="0" cy="0" r="15" fill="url(#eye-glow)" filter="url(#soft-glow)" />
          <ellipse cx="0" cy="0" rx="3" ry="9" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="1.8" fill="#0D3B2F" />
        </g>

        {/* Con mắt bên phải (Right Eye) */}
        <g transform="translate(46, 26)">
          <path d="M -28 0 Q 0 -18 28 0 Q 0 18 -28 0 Z" fill="#0C0A09" />
          <path d="M -26 0 Q 0 -15 26 0 Q 0 15 -26 0 Z" fill="#1C1815" />
          <circle cx="0" cy="0" r="15" fill="url(#eye-glow)" filter="url(#soft-glow)" />
          <ellipse cx="0" cy="0" rx="3" ry="9" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="1.8" fill="#0D3B2F" />
        </g>
      </g>

      {/* 5. TRỤC KIM ĐỒNG HỒ & KIM THỜI GIAN LÙI (REVERSING CLOCK HANDS) */}
      <g transform="translate(0, 5)">
        {/* Ổ trục đồng tâm */}
        <circle cx="0" cy="0" r="14" fill="#C59B37" />
        <circle cx="0" cy="0" r="8" fill="#3D290F" />
        <circle cx="0" cy="0" r="3.5" fill="#FFE59E" />

        {/* Kim giờ (chạy ngược) */}
        <g transform={`rotate(${hourAngle})`}>
          <polygon points="-5,8 5,8 3,-52 0,-62 -3,-52" fill="#DDB247" />
          <polygon points="0,8 5,8 3,-52 0,-62" fill="#9C7725" opacity="0.65" />
        </g>

        {/* Kim phút (chạy ngược nhanh hơn) */}
        <g transform={`rotate(${minuteAngle})`}>
          <polygon points="-3.5,10 3.5,10 2,-82 0,-94 -2,-82" fill="#FCE185" />
          <polygon points="0,10 3.5,10 2,-82 0,-94" fill="#B38927" opacity="0.65" />
        </g>
      </g>

      {/* 6. BA LỌ KÝ ỨC LƠ LỬNG (G1, G2, G3 JARS) */}
      {showJars && (
        <g>
          {/* Lọ G1 (Ký ức xe đồ chơi & 3 mẹ con làm hòa) - Bên trái */}
          <g transform={`translate(-185, ${-30 + Math.sin(t * 0.05 + 1) * 10}) scale(0.85)`}>
            {/* Quầng sáng hổ phách */}
            <circle cx="0" cy="0" r="45" fill="url(#jar-amber-glow)" />
            {/* Thân lọ thủy tinh trong suốt */}
            <path
              d="M -22 -32 L 22 -32 L 22 -24 L 26 -18 L 26 28 Q 26 38 16 38 L -16 38 Q -26 38 -26 28 L -26 -18 L -22 -24 Z"
              fill="#F59E0B"
              fillOpacity="0.18"
            />
            {/* Vệt phản xạ thủy tinh */}
            <path d="M -20 -15 L -20 28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
            {/* Mảnh ký ức G1 bên trong: Chiếc xe đồ chơi màu đỏ */}
            <polygon points="-8,8 8,8 6,14 -8,14" fill="#EF4444" />
            <circle cx="-5" cy="15" r="2.5" fill="#1E293B" />
            <circle cx="5" cy="15" r="2.5" fill="#1E293B" />
            {/* Nắp lọ gỗ niêm phong */}
            <rect x="-18" y="-38" width="36" height="8" rx="2" fill="#78350F" />
          </g>

          {/* Lọ G2 (Dấu chuyển nỗi buồn sang Duy) - Bên phải */}
          <g transform={`translate(185, ${-20 + Math.sin(t * 0.05 + 2) * 10}) scale(0.85)`}>
            <circle cx="0" cy="0" r="45" fill="url(#jar-amber-glow)" />
            <path
              d="M -22 -32 L 22 -32 L 22 -24 L 26 -18 L 26 28 Q 26 38 16 38 L -16 38 Q -26 38 -26 28 L -26 -18 L -22 -24 Z"
              fill="#F59E0B"
              fillOpacity="0.18"
            />
            <path d="M 20 -15 L 20 28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
            {/* Dấu chuyển giao 2 dòng sáng xanh - tím quy tụ */}
            <path d="M -12 18 Q 0 4 10 -4" stroke="#60A5FA" strokeWidth="3" fill="none" opacity="0.8" />
            <path d="M 12 18 Q 0 4 -10 -4" stroke="#A78BFA" strokeWidth="3" fill="none" opacity="0.8" />
            <rect x="-18" y="-38" width="36" height="8" rx="2" fill="#78350F" />
          </g>

          {/* Lọ G3 (Quyền mơ thấy mẹ bị niêm phong) - Phía dưới trung tâm */}
          <g transform={`translate(0, ${170 + Math.sin(t * 0.05 + 3) * 8}) scale(0.9)`}>
            <circle cx="0" cy="0" r="50" fill="url(#jar-amber-glow)" />
            <path
              d="M -24 -36 L 24 -36 L 24 -28 L 28 -20 L 28 32 Q 28 42 18 42 L -18 42 Q -28 42 -28 32 L -28 -20 L -24 -28 Z"
              fill="#F59E0B"
              fillOpacity="0.22"
            />
            <path d="M -22 -18 L -22 32" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" opacity="0.55" />
            {/* Cánh cửa khép và nét trăng non vàng dịu */}
            <path d="M -4 -8 Q 6 -2 6 12 Q -2 4 -4 -8 Z" fill="#FDE047" opacity="0.9" />
            <rect x="-20" y="-42" width="40" height="9" rx="2" fill="#78350F" />
          </g>
        </g>
      )}
    </g>
  );
};
