import React from 'react';
import { OffthreadVideo, staticFile } from 'remotion';

/**
 * Character3DOverlay — Component tiêu chuẩn cho Phương Án 2:
 * Lồng ghép nhân vật 3D render từ Blender (nền trong suốt Alpha Channel) lên bối cảnh Remotion.
 *
 * Tính năng chính:
 * 1. Hỗ trợ phát video Alpha (.webm VP9 hoặc ProRes 4444) đồng bộ frame.
 * 2. Tự động sinh bóng tiếp xúc mềm mại (Soft Contact Shadow) dưới chân nhân vật.
 * 3. Hỗ trợ lật hướng nhìn (flipX), căn chỉnh tọa độ [x, y], phóng to thu nhỏ (scale).
 * 4. Fallback thông minh: Nếu chưa có file render 3D, tự động hiển thị component 2.5D SVG dự phòng.
 */

export interface ContactShadowProps {
  rx?: number;
  ry?: number;
  blur?: number;
  opacity?: number;
  offsetY?: number;
  offsetX?: number;
}

export interface Character3DOverlayProps {
  /** Đường dẫn file video alpha trong thư mục public, ví dụ: 'characters-3d-alpha/nam_shot4.webm' */
  src?: string;
  /** Tọa độ trung tâm nhân vật trên canvas (mặc định gốc 1920x1080) */
  x: number;
  y: number;
  /** Tỉ lệ phóng to/thu nhỏ (1.0 = kích thước gốc) */
  scale?: number;
  /** Chiều rộng khung chứa video (mặc định 600px) */
  width?: number;
  /** Chiều cao khung chứa video (mặc định 800px) */
  height?: number;
  /** Lật ngang nhân vật (facing trái/phải) */
  flipX?: boolean;
  /** Độ mờ đục 0 đến 1 */
  opacity?: number;
  /** Cấu hình bóng đổ tiếp xúc mặt sàn */
  shadow?: boolean | ContactShadowProps;
  /** Component 2.5D SVG dự phòng khi chưa có file 3D */
  fallback?: React.ReactNode;
  /** Style tùy biến thêm */
  style?: React.CSSProperties;
}

export const Character3DOverlay: React.FC<Character3DOverlayProps> = ({
  src,
  x,
  y,
  scale = 1.0,
  width = 600,
  height = 800,
  flipX = false,
  opacity = 1.0,
  shadow = true,
  fallback,
  style,
}) => {
  // Cấu hình bóng tiếp xúc
  const shadowConfig: ContactShadowProps = typeof shadow === 'object' ? shadow : {};
  const shadowRx = (shadowConfig.rx ?? 95) * scale;
  const shadowRy = (shadowConfig.ry ?? 26) * scale;
  const shadowBlur = (shadowConfig.blur ?? 10) * scale;
  const shadowOpacity = shadowConfig.opacity ?? 0.65;
  const shadowOffsetY = (shadowConfig.offsetY ?? (height * 0.46)) * scale;
  const shadowOffsetX = (shadowConfig.offsetX ?? 0) * scale;

  const w = width * scale;
  const h = height * scale;
  const left = x - w / 2;
  const top = y - h / 2;

  return (
    <>
      {/* 1. LỚP BÓNG TIẾP XÚC MẶT SÀN (CONTACT SHADOW) */}
      {shadow && (
        <svg
          width={1920}
          height={1080}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity,
          }}
        >
          {/* Lớp bóng loang mờ (Soft Penumbra) */}
          <ellipse
            cx={x + shadowOffsetX}
            cy={y + shadowOffsetY}
            rx={shadowRx}
            ry={shadowRy}
            fill="rgba(0, 0, 0, 0.7)"
            style={{ filter: `blur(${shadowBlur}px)` }}
          />
          {/* Lớp bóng tiếp xúc đậm tâm (Hard Umbra Core) */}
          <ellipse
            cx={x + shadowOffsetX}
            cy={y + shadowOffsetY}
            rx={shadowRx * 0.45}
            ry={shadowRy * 0.45}
            fill="rgba(0, 0, 0, 0.9)"
            style={{ filter: `blur(${shadowBlur * 0.3}px)` }}
          />
        </svg>
      )}

      {/* 2. LỚP VIDEO NHÂN VẬT 3D ALPHA HOẶC FALLBACK */}
      <div
        style={{
          position: 'absolute',
          left,
          top,
          width: w,
          height: h,
          transform: flipX ? 'scaleX(-1)' : undefined,
          transformOrigin: 'center center',
          opacity,
          pointerEvents: 'none',
          ...style,
        }}
      >
        {src ? (
          <OffthreadVideo
            src={staticFile(src)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          fallback ?? (
            <div
              style={{
                width: '100%',
                height: '100%',
                border: '2px dashed rgba(52, 211, 153, 0.5)',
                borderRadius: 16,
                backgroundColor: 'rgba(6, 78, 59, 0.15)',
                color: '#34d399',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                padding: 16,
                textAlign: 'center',
                fontFamily: 'sans-serif',
              }}
            >
              <span>[ 3D Alpha Overlay Slot ]</span>
              <span style={{ fontSize: 11, opacity: 0.75, marginTop: 4 }}>
                Chưa nạp video: {src || 'Cần truyền đường dẫn file .webm'}
              </span>
            </div>
          )
        )}
      </div>
    </>
  );
};
