import React, { useRef } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
// Lưu ý: Cần chạy 'npm install three @remotion/three @types/three' trong what-if-studio trước khi dùng
// import { ThreeCanvas } from '@remotion/three';
// import { useGLTF } from '@react-three/drei';

/**
 * PHƯƠNG ÁN 1 (PA 1): RENDER NHÂN VẬT 3D TRỰC TIẾP TRONG REMOTION BẰNG THREE.JS / WEBGL
 * 
 * Ưu điểm:
 * - Thay đổi góc máy camera tự do trong code TypeScript.
 * - Toàn bộ timeline điều khiển bằng biến `frame` (useCurrentFrame).
 * - Dung lượng file asset (.glb) rất nhẹ (~3-5MB).
 * 
 * Quy trình:
 * 1. Model nhân vật 3D trong Blender -> Export sang định dạng standard `.glb`.
 * 2. Đặt file vào `public/models/nam.glb`.
 * 3. Load và diễn hoạt xương trong ThreeCanvas bằng code bên dưới.
 */

interface NamModelProps {
  frame: number;
}

// Giả lập component 3D Mesh nạp từ file .glb
export const Nam3DCharacterMock: React.FC<NamModelProps> = ({ frame }) => {
  // const { scene, nodes, materials, animations } = useGLTF(staticFile('models/nam.glb'));
  
  // Tính toán góc xoay đầu và bước đi theo timeline Remotion
  const headYaw = interpolate(frame, [0, 30, 60], [0, 0.35, 0], { extrapolateRight: 'clamp' });
  const walkCycle = Math.sin((frame / 30) * Math.PI * 4);

  return (
    <group position={[0, -1, 0]}>
      {/* 
        Trong Three.js thực tế:
        <primitive object={scene} />
        nodes.Head.rotation.y = headYaw;
        nodes.LegLeft.rotation.x = walkCycle * 0.4;
      */}
      <mesh position={[0, 1.6, 0]} rotation={[0, headYaw, 0]}>
        <boxGeometry args={[0.3, 0.35, 0.3]} />
        <meshToonMaterial color="#fcd34d" />
      </mesh>
      
      {/* Thân áo xanh của Nam */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.25, 0.22, 0.65, 16]} />
        <meshToonMaterial color="#0284c7" />
      </mesh>

      {/* Chân trái bước đi */}
      <mesh position={[-0.15, 0.4, 0]} rotation={[walkCycle * 0.4, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.07, 0.65, 12]} />
        <meshToonMaterial color="#1e293b" />
      </mesh>

      {/* Chân phải bước đi */}
      <mesh position={[0.15, 0.4, 0]} rotation={[-walkCycle * 0.4, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.07, 0.65, 12]} />
        <meshToonMaterial color="#1e293b" />
      </mesh>
    </group>
  );
};

export const DemoPA1Composition: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Góc lia camera 3D trong Remotion
  const camX = interpolate(frame, [0, 120], [0, 1.5]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#090d16' }}>
      {/* Khung Canvas 3D WebGL (Remotion Three) */}
      <div style={{ width: '100%', height: '100%' }}>
        {/*
          <ThreeCanvas
            width={width}
            height={height}
            camera={{ position: [camX, 1.2, 3.5], fov: 45 }}
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} />
            <Nam3DCharacterMock frame={frame} />
          </ThreeCanvas>
        */}
        <div style={{ color: '#fff', padding: 40, fontFamily: 'sans-serif' }}>
          <h2>Phương Án 1: Remotion + Three.js Canvas</h2>
          <p>Frame hiện tại: {frame}</p>
          <p>Camera X: {camX.toFixed(2)}</p>
          <p style={{ color: '#38bdf8' }}>Xem bản tương tác trực tiếp 3D tại artifact: xem_thu_nhan_vat_3d_pa1_pa2.html</p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
