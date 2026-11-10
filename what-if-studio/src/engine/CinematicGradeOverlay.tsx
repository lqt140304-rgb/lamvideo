import React from 'react';
import { useCurrentFrame } from 'remotion';

export type CinematicMood =
  | 'morning'        // Sáng sớm: Xanh lơ lạnh pha vàng nhạt
  | 'noon_harsh'     // Trưa gắt: Vàng mù tạt nhạt, ngột ngạt
  | 'sunset_golden'  // Chiều tà: Cam thẫm Golden Hour
  | 'fincher_night'   // Đêm phòng trọ: Xanh rêu đen Chiaroscuro David Fincher
  | 'lecture_cold'   // Đại giảng đường: Trắng bệch Cold Neon công nghiệp
  | 'mirror_realm';  // Cõi gương: Deep Teal Abyss huyền bí vô thực

export interface CinematicGradeOverlayProps {
  mood?: CinematicMood;
  vignetteStrength?: number; // 0 to 1, default 0.45
  grainOpacity?: number;     // 0 to 1, default 0.08
  showLetterbox?: boolean;   // 2.39:1 Anamorphic Bars
}

const MOOD_CONFIG: Record<
  CinematicMood,
  { color: string; opacity: number; blend: React.CSSProperties['mixBlendMode'] }
> = {
  morning: { color: '#1a2b3c', opacity: 0.08, blend: 'soft-light' },
  noon_harsh: { color: '#2e2518', opacity: 0.09, blend: 'soft-light' },
  sunset_golden: { color: '#3d200a', opacity: 0.12, blend: 'soft-light' },
  fincher_night: { color: '#0d1f18', opacity: 0.12, blend: 'soft-light' },
  lecture_cold: { color: '#16252b', opacity: 0.10, blend: 'soft-light' },
  mirror_realm: { color: '#051824', opacity: 0.18, blend: 'color' },
};

/**
 * Lớp phủ hòa sắc điện ảnh (Cinematic Grade Overlay)
 * - Tối ưu hiệu năng: Dùng mix-blend-mode CSS siêu nhẹ thay cho SVG filter nặng nề.
 * - Bảo vệ màu da: Không làm xỉn da nhân vật, chỉ ép vùng tối & trung tính vào cùng một bầu không khí.
 * - Tích hợp Vignette quang học và Letterbox 2.39:1 anamorphic.
 */
export const CinematicGradeOverlay: React.FC<CinematicGradeOverlayProps> = ({
  mood = 'fincher_night',
  vignetteStrength = 0.45,
  grainOpacity = 0.08,
  showLetterbox = false,
}) => {
  const frame = useCurrentFrame();
  const config = MOOD_CONFIG[mood];

  // Pseudo-grain seed biến thiên theo frame (chu kỳ 30fps)
  const grainSeed = (frame % 10) * 10;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 900,
        overflow: 'hidden',
      }}
    >
      {/* 1. Lớp hòa sắc điện ảnh (Atmospheric Color Tone) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: config.color,
          opacity: config.opacity,
          mixBlendMode: config.blend,
        }}
      />

      {/* 2. Lớp Vignette quang học ống kính anamorphic (Tối 4 góc nhẹ) */}
      {vignetteStrength > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at center, transparent 60%, rgba(5, 10, 8, ${vignetteStrength}) 100%)`,
            mixBlendMode: 'multiply',
          }}
        />
      )}

      {/* 3. Lớp hạt phim nhựa hữu cơ 35mm siêu nhẹ (Micro Grain Overlay) */}
      {grainOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: '-10px',
            opacity: grainOpacity,
            mixBlendMode: 'overlay',
            backgroundImage: `radial-gradient(circle at ${grainSeed}% ${grainSeed}%, #fff 1px, transparent 1px)`,
            backgroundSize: '4px 4px',
          }}
        />
      )}

      {/* 4. Khung viền Letterbox 2.39:1 Cinema (Tùy chọn) */}
      {showLetterbox && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '12.5%',
              backgroundColor: '#050505',
              zIndex: 999,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '12.5%',
              backgroundColor: '#050505',
              zIndex: 999,
            }}
          />
        </>
      )}
    </div>
  );
};
