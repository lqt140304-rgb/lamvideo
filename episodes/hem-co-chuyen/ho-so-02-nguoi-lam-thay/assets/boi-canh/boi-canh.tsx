import React from 'react';

/**
 * HỒ SƠ 02: NGƯỜI LÀM THAY — BỘ REACT COMPONENT BỐI CẢNH MÔI TRƯỜNG (STYLE B)
 * Chuẩn bị cho timeline diễn hoạt hoạt hình Remotion / SVG composition.
 */

// Bảng màu môi trường Style B
export const ENV_PALETTE = {
  ink: '#282b2b',
  wallMorning: '#ebe3d3',
  floorMorning: '#c8baa1',
  wallNight: '#18202c',
  floorNight: '#0f141c',
  lampGlow: '#fde047',
  screenBlue: '#e0f2fe',
  doorWood: '#54696e',
  sinkInox: '#a1afb5',
  deskWood: '#8a5833',
};

// 1. Toàn cảnh phòng trọ sáng sớm (7:00 AM)
export function RoomMorning({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1920 1080" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ts-wall" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ebe3d3" />
          <stop offset="100%" stopColor="#dfd2bd" />
        </linearGradient>
        <linearGradient id="ts-floor" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c8baa1" />
          <stop offset="100%" stopColor="#b3a286" />
        </linearGradient>
        <linearGradient id="ts-sunbeam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffde6" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#fff9cf" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1920" height="660" fill="url(#ts-wall)" />
      <rect y="660" width="1920" height="420" fill="url(#ts-floor)" />
      <line x1="0" y1="660" x2="1920" y2="660" stroke="#87765f" strokeWidth="8" strokeLinecap="round" />
      
      {/* Cửa chính hé mở & ánh nắng */}
      <g stroke="#282b2b" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <rect x="1100" y="110" width="320" height="550" fill="#362f26" strokeWidth="6" />
        <rect x="1120" y="130" width="280" height="530" fill="#eae4d8" stroke="none" />
        <path d="M1120 130 L1270 170 L1270 690 L1120 660 Z" fill="#54696e" strokeWidth="5" />
        <polygon points="1270,170 1400,130 1880,1080 1200,1080" fill="url(#ts-sunbeam)" stroke="none" />
      </g>
      
      {/* Bếp sâu bên phải */}
      <g transform="translate(1480 300)" stroke="#282b2b" strokeWidth="3.5" strokeLinejoin="round">
        <rect x="0" y="0" width="400" height="360" fill="#f5efe6" strokeWidth="4" />
        <rect x="20" y="250" width="380" height="220" fill="#7a878c" strokeWidth="4" />
        <rect x="40" y="260" width="230" height="55" rx="8" fill="#536267" strokeWidth="3" />
        <path d="M155 260 V185 Q155 155 135 155 Q115 155 115 180" fill="none" stroke="#cdd5d8" strokeWidth="7" />
      </g>
      
      {/* Nệm Nam xộc xệch */}
      <g transform="translate(340 680)" stroke="#282b2b" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M0 50 L380 0 L720 90 L300 230 Z" fill="#828c86" strokeWidth="4.5" />
        <path d="M150 60 Q280 35 420 70 Q560 100 600 180 Q420 230 210 200 Q130 160 150 60 Z" fill="#40584f" strokeWidth="4.2" />
      </g>
    </svg>
  );
}

// 2. Góc bồn rửa chén & Nơi chạm trán (50mm)
export function KitchenSink({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1920 1080" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="1920" height="720" fill="#ece4d5" />
      <rect y="720" width="1920" height="360" fill="#c9baa3" />
      <g transform="translate(560 480)" stroke="#282b2b" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <rect x="0" y="160" width="1020" height="350" fill="#59676d" strokeWidth="5" />
        <rect x="-30" y="130" width="1080" height="55" rx="6" fill="#394245" strokeWidth="5" />
        <rect x="40" y="20" width="620" height="130" rx="16" fill="#9aa8ad" strokeWidth="4.5" />
        <path d="M350 5 V-140 Q350 -195 305 -195 Q260 -195 260 -140 V-125" fill="none" stroke="#cbd5e1" strokeWidth="12" />
      </g>
    </svg>
  );
}

// 3. Cửa phòng gài chốt & Hành lang (35mm)
export function HallwayDoor({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1920 1080" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="1920" height="780" fill="#c9beaa" />
      <rect y="780" width="1920" height="300" fill="#b8aa92" />
      <g transform="translate(520 220)" stroke="#282b2b" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <rect x="0" y="0" width="560" height="620" fill="#2b241e" strokeWidth="6" />
        <rect x="20" y="15" width="520" height="605" fill="#42565c" strokeWidth="5" />
        {/* Then cài kim loại */}
        <g transform="translate(380 280)">
          <rect x="0" y="-25" width="120" height="50" rx="6" fill="#94a3b8" strokeWidth="3" />
          <rect x="20" y="-12" width="135" height="24" rx="4" fill="#e2e8f0" strokeWidth="3.5" />
        </g>
      </g>
    </svg>
  );
}

// 4. Bàn học ban đêm (50mm)
export function StudyDeskNight({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1920 1080" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="1920" height="1080" fill="#12161f" />
      <ellipse cx="1160" cy="520" rx="680" ry="440" fill="#fde047" opacity="0.4" />
      <g transform="translate(740 480)" stroke="#282b2b" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <rect x="0" y="60" width="920" height="380" fill="#382b21" strokeWidth="5" />
        <rect x="-40" y="20" width="1000" height="55" rx="8" fill="#8a5833" strokeWidth="5" />
        {/* Laptop phát sáng */}
        <polygon points="140,20 420,20 410,-170 130,-170" fill="#0f172a" strokeWidth="4" />
        <polygon points="150,10 410,10 402,-160 138,-160" fill="#e0f2fe" stroke="none" />
      </g>
    </svg>
  );
}

// 5. Bảng tổng hợp Master Board 4 bối cảnh
export function HoSo02EnvironmentMasterBoard() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-[#181a1d] text-white">
      <div className="rounded-xl overflow-hidden border border-slate-700">
        <RoomMorning className="w-full h-auto" />
      </div>
      <div className="rounded-xl overflow-hidden border border-slate-700">
        <KitchenSink className="w-full h-auto" />
      </div>
      <div className="rounded-xl overflow-hidden border border-slate-700">
        <HallwayDoor className="w-full h-auto" />
      </div>
      <div className="rounded-xl overflow-hidden border border-slate-700">
        <StudyDeskNight className="w-full h-auto" />
      </div>
    </div>
  );
}
