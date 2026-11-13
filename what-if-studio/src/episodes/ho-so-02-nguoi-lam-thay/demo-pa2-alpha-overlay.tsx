import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { RoomScene } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';

/**
 * PHƯƠNG ÁN 2 (PA 2): RENDER NHÂN VẬT 3D OFFLINE TRONG BLENDER -> XUẤT LỚP PHỦ VIDEO ALPHA VÀO REMOTION
 * 
 * Ưu điểm:
 * - Chất lượng đồ họa đỉnh cao (ray-tracing, soft shadow, subsurface scattering da mặt, nếp nhăn vải).
 * - Tốc độ render video Remotion cực nhanh (60-120 fps vì chỉ giải mã video/ảnh trong suốt).
 * - Hoàn toàn không cần cài thêm thư viện 3D vào repository, an toàn tuyệt đối với React 19.
 * 
 * Quy trình:
 * 1. Diễn hoạt nhân vật trong Blender theo đúng kịch bản góc máy của phòng trọ.
 * 2. Render ra video nền trong suốt:
 *    - Định dạng: WebM với VP9 Alpha (hoặc Apple ProRes 4444 with Alpha, hoặc chuỗi ảnh PNG sequence).
 * 3. Đặt vào thư mục `public/rendered-characters/nam_shot4_alpha.webm`.
 * 4. Remotion chỉ cần dùng `<OffthreadVideo>` xếp lớp lên bối cảnh `RoomScene`.
 */

export const DemoPA2Composition: React.FC = () => {
  const frame = useCurrentFrame();

  // Tọa độ vị trí bước đi của Nam trên sàn
  const walkProgress = interpolate(frame, [0, 120], [0, 1], { extrapolateRight: 'clamp' });
  const posX = 960 + (walkProgress * 200);
  const posY = 540 + (walkProgress * 80);
  const scale = 1.0 + (walkProgress * 0.25);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* LỚP 1: Bối cảnh phòng trọ 2.5D SVG đã được duyệt */}
      <RoomScene view="wide" door="ajar" chair="bed" />

      {/* LỚP 2: Bóng tiếp xúc mặt sàn (Contact Shadow) */}
      <svg
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <ellipse
          cx={posX}
          cy={posY + 320 * scale}
          rx={90 * scale}
          ry={24 * scale}
          fill="rgba(0, 0, 0, 0.65)"
          style={{ filter: 'blur(8px)' }}
        />
      </svg>

      {/* LỚP 3: Video Alpha nhân vật 3D render từ Blender */}
      <div
        style={{
          position: 'absolute',
          left: posX - 250 * scale,
          top: posY - 300 * scale,
          width: 500 * scale,
          height: 700 * scale,
          pointerEvents: 'none',
        }}
      >
        {/* 
          Khi đã có file render từ Blender:
          <OffthreadVideo
            src={staticFile("rendered-characters/nam_shot4_alpha.webm")}
            style={{ width: '100%', height: '100%' }}
          />
        */}
        <div
          style={{
            width: '100%',
            height: '100%',
            border: '2px dashed rgba(52, 211, 153, 0.4)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34d399',
            fontSize: 16,
            backgroundColor: 'rgba(5, 150, 105, 0.08)',
          }}
        >
          [ Khung Video 3D Alpha Render từ Blender ]
        </div>
      </div>

      {/* LỚP 4: Hiệu ứng ánh sáng & Khí quyển (VFX) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(80, 220, 240, 0.08), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* LỚP 5: Letterbox 2.39:1 Anamorphic */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 138, background: '#000' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 138, background: '#000' }} />
    </AbsoluteFill>
  );
};
