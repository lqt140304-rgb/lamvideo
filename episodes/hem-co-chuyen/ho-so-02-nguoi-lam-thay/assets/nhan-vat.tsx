import React from 'react';

// ============================================================================
// HỒ SƠ 02: NGƯỜI LÀM THAY — BỘ ASSET NHÂN VẬT THEO MẪU SVG MỚI (STYLE B)
// ============================================================================
// 1. NAM: Sinh viên lười nhác, vai mềm gù, uể oải, nốt ruồi đuôi mày trái.
// 2. NGƯỜI KIA (BẢN SAO): Ngoại hình giống Nam, mặc áo xanh của Nam, dáng thẳng thớm, điềm tĩnh rợn người.
// 3. TÙNG: Bạn cùng phòng, sinh viên chăm chỉ, áo polo gọn gàng, đeo balo, nghe điện thoại trên trường.
// ============================================================================

export const PALETTE = {
  ink: '#282b2b',
  inkSoft: '#474d4d',
  skin: '#dbad82',
  skinShadow: '#bd8968',
  skinHighlight: '#e8c49e',
  eyeWhite: '#f8f3e7',
  mouthDark: '#513331',
  teeth: '#faf3e5',
  tongue: '#bf7b73',
  nam: {
    hair: '#292a29',
    shirt: '#8e9694',        // Áo ngủ xám nhạt lúc thức giấc
    shirtShadow: '#6e7573',
    pants: '#3e4347',        // Quần thun lửng ngủ
    pantsShadow: '#2c3033',
    slippers: '#425850',
  },
  nguoiKia: {
    hair: '#292a29',
    shirt: '#5c7a70',        // Chiếc áo thun xanh rêu Nam bỏ trên ghế tối qua
    shirtShadow: '#456358',
    pants: '#515451',        // Quần dài vải tối màu
    pantsShadow: '#393c39',
    slippers: '#2f3b37',
  },
  tung: {
    hair: '#1d2124',
    polo: '#2b3f54',         // Áo polo sinh viên xanh navy
    poloCollar: '#3d556e',
    poloShadow: '#1c2b3b',
    khaki: '#8c8474',        // Quần kaki be
    khakiShadow: '#6e6759',
    backpack: '#3d3430',
    sneakers: '#ded6c8',
  },
  phone: '#1a1c1e',
  phoneScreen: '#6bb6ff',
  bowl: '#e3dcce',
  bowlRim: '#4a8296',
};

// ----------------------------------------------------------------------------
// 1. NAM — ĐẦU VÀ BIỂU CẢM
// ----------------------------------------------------------------------------
export type NamMood = 'sleepy' | 'shocked' | 'suspicious' | 'hesitant';

export const NamHead: React.FC<{
  mood?: NamMood;
  id?: string;
  x?: number;
  y?: number;
  scale?: number;
}> = ({ mood = 'sleepy', id = 'nam-head', x = 0, y = 0, scale = 1 }) => {
  const isShocked = mood === 'shocked';
  const isSuspicious = mood === 'suspicious';
  const isHesitant = mood === 'hesitant';

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={PALETTE.ink} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round">
      {/* Cổ và bóng đổ dưới cằm */}
      <path d="M -28 141 L -28 182 Q -8 201 16 181 L 19 138" fill={PALETTE.skin} />
      <path d="M -26 155 Q -8 171 17 153 L 16 175 Q -7 187 -27 174 Z" fill={PALETTE.skinShadow} stroke="none" />

      {/* Khối hộp sọ và cằm tròn mềm mại */}
      <path d="M -55 60 Q -50 25 -9 25 Q 42 24 53 66 L 55 111 Q 72 130 54 146 Q 38 166 6 165 Q -30 163 -45 138 L -58 100 Z" fill={PALETTE.skin} />

      {/* Tai trái */}
      <path d="M -47 87 Q -75 72 -77 99 Q -78 121 -50 125" fill={PALETTE.skin} />
      <path d="M -65 99 Q -57 93 -53 106" fill="none" strokeWidth={2.4} />

      {/* Tóc rối bù xù đặc trưng của sinh viên lười thức dậy */}
      <path
        d="M -51 92 Q -65 79 -61 52 L -71 51 Q -58 27 -38 28 L -43 18 Q -20 21 -7 14 Q -10 -5 15 -5 Q 22 -4 24 4 Q 7 0 8 16 Q 40 13 51 37 L 62 43 L 48 59 Q 34 54 22 43 Q 15 63 -4 67 L -1 52 Q -20 75 -41 74 L -43 95 Z"
        fill={PALETTE.nam.hair}
      />
      {/* Vài sợi tóc rối ngái ngủ nhô ra */}
      <path d="M 12 -5 Q 16 -18 9 -22 Q 4 -12 6 -4" fill={PALETTE.nam.hair} strokeWidth={2.6} />

      {/* Mắt & Mí mắt theo Mood */}
      <defs>
        <clipPath id={`${id}-eyes`}>
          <ellipse cx={-11} cy={99} rx={17} ry={isShocked ? 23 : 15} />
          <ellipse cx={30} cy={96} rx={15} ry={isShocked ? 22 : 14} />
        </clipPath>
      </defs>

      {/* Tròng trắng */}
      <ellipse cx={-11} cy={99} rx={17} ry={isShocked ? 23 : 15} fill={PALETTE.eyeWhite} strokeWidth={2.5} />
      <ellipse cx={30} cy={96} rx={15} ry={isShocked ? 22 : 14} fill={PALETTE.eyeWhite} strokeWidth={2.5} />

      {/* Con ngươi & Mí mắt lười/nghi ngờ */}
      <g clipPath={`url(#${id}-eyes)`}>
        {/* Con ngươi */}
        <ellipse
          cx={isSuspicious ? -4 : isHesitant ? -10 : -8}
          cy={isShocked ? 100 : 102}
          rx={isShocked ? 3.3 : 4.2}
          ry={isShocked ? 4.8 : 5.5}
          fill={PALETTE.ink}
          stroke="none"
        />
        <ellipse
          cx={isSuspicious ? 36 : isHesitant ? 30 : 32}
          cy={isShocked ? 97 : 99}
          rx={isShocked ? 3.3 : 4.2}
          ry={isShocked ? 4.8 : 5.5}
          fill={PALETTE.ink}
          stroke="none"
        />
        {/* Điểm sáng bắt sáng nhỏ */}
        <circle cx={isSuspicious ? -3 : -7} cy={isShocked ? 98 : 100} r={1.2} fill="#ffffff" stroke="none" />
        <circle cx={isSuspicious ? 37 : 33} cy={isShocked ? 95 : 97} r={1.2} fill="#ffffff" stroke="none" />

        {/* Mí mắt sụp uể oải hoặc nghi ngờ */}
        {!isShocked && (
          <path
            d={
              isSuspicious
                ? 'M -33 77 L 9 100 L 49 76 L 49 61 L -33 61 Z'
                : isHesitant
                ? 'M -33 74 L 51 72 L 51 86 L -33 88 Z'
                : 'M -33 70 L 51 70 L 51 92 L -33 99 Z'
            }
            fill={PALETTE.skin}
            strokeWidth={2.5}
          />
        )}
      </g>

      {/* Lông mày biểu cảm dày và nét */}
      <path
        d={
          isShocked
            ? 'M -29 69 Q -16 58 -2 64 M 17 62 Q 32 54 43 64'
            : isSuspicious
            ? 'M -28 78 L 2 87 M 19 79 L 44 68'
            : isHesitant
            ? 'M -28 73 Q -14 78 -2 74 M 19 74 Q 31 71 44 75'
            : 'M -28 78 Q -12 74 2 75 M 19 72 Q 33 69 44 70'
        }
        fill="none"
        strokeWidth={5.2}
      />

      {/* ĐẶC ĐIỂM CỐT LÕI TỪ KỊCH BẢN: Nốt ruồi sát đuôi mày trái! */}
      <circle cx={-32} cy={isShocked ? 74 : 82} r={2.2} fill={PALETTE.ink} stroke="none" />

      {/* Mũi tròn tối giản */}
      <path d="M 18 106 Q 30 108 26 117 L 17 119" fill="none" strokeWidth={2.5} />

      {/* Miệng theo Mood */}
      {isShocked ? (
        <g>
          {/* Miệng há to kinh hãi thấy hàm răng trên */}
          <path d="M -3 139 Q 1 121 16 126 Q 31 129 30 148 Q 11 139 -3 148 Z" fill={PALETTE.mouthDark} />
          <path d="M 4 129 Q 13 125 22 132 L 22 137 L 4 135 Z" fill={PALETTE.teeth} stroke="none" />
          <path d="M 4 145 Q 12 138 23 146" stroke={PALETTE.tongue} strokeWidth={3} />
        </g>
      ) : isSuspicious ? (
        <path d="M -6 141 Q 9 136 22 140" fill="none" strokeWidth={2.8} />
      ) : isHesitant ? (
        <path d="M 2 142 Q 14 145 26 141" fill="none" strokeWidth={3} />
      ) : (
        /* Sleepy / ngái ngủ: miệng hơi hé thở dài */
        <path d="M 8 139 Q 20 131 25 144 Q 15 149 8 145 Z" fill={PALETTE.mouthDark} strokeWidth={2.5} />
      )}
    </g>
  );
};

// ----------------------------------------------------------------------------
// 1B. NAM — TOÀN THÂN
// ----------------------------------------------------------------------------
export type NamPose = 'slumped' | 'scared_retreat' | 'holding_phone';

export const Nam: React.FC<{
  mood?: NamMood;
  pose?: NamPose;
  x?: number;
  y?: number;
  scale?: number;
}> = ({ mood = 'sleepy', pose = 'slumped', x = 0, y = 0, scale = 1 }) => {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={PALETTE.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
      {/* Bóng đổ tiếp xúc chân */}
      <ellipse cx={0} cy={589} rx={100} ry={13} fill="#d6c9b6" stroke="none" />

      {/* Hai chân & Dép lê kẹp ngón */}
      <path d="M -53 537 L -54 568 L -14 567 L -13 533 M 18 537 L 22 570 L 61 566 L 56 531" fill={PALETTE.skin} />
      <path d="M -54 561 Q -80 568 -78 585 Q -53 597 -5 586 L -7 575 Q -20 560 -54 561 Z" fill={PALETTE.skin} />
      <path d="M 23 561 Q 44 559 67 568 Q 91 571 89 584 Q 57 596 15 585 L 13 573 Z" fill={PALETTE.skin} />
      {/* Đế dép */}
      <path d="M -78 583 Q -45 593 -6 583 L -6 590 Q -43 601 -79 590 Z M 15 583 Q 56 591 89 581 L 90 588 Q 54 600 15 591 Z" fill="#393e3c" strokeWidth={2.5} />
      {/* Quai dép lê */}
      <path d="M -64 565 Q -38 553 -17 567 L -12 579 Q -39 564 -70 580 Z M 26 563 Q 52 559 71 573 L 75 583 Q 49 568 20 578 Z" fill={PALETTE.nam.slippers} strokeWidth={2.5} />

      {/* Quần thun lửng ngủ rộng thùng thình */}
      <path
        d="M -63 329 Q -80 364 -71 403 L -67 454 Q -78 491 -65 548 Q -42 560 -10 548 L -3 466 L 10 411 Q 17 446 16 471 L 13 548 Q 35 559 66 545 L 67 445 Q 83 388 61 330 Z"
        fill={PALETTE.nam.pants}
      />
      <path d="M -6 368 Q -3 388 10 411 M -62 437 Q -40 447 -35 466 M 24 512 Q 37 503 51 506 M -53 538 L -20 539" fill="none" strokeWidth={2.5} />

      {/* Hai tay */}
      {pose === 'holding_phone' ? (
        <>
          {/* Tay trái buông lơi */}
          <path d="M -73 235 Q -89 274 -84 312 L -91 367 Q -91 383 -81 387 L -76 378 Q -74 394 -66 389 L -64 378 Q -58 389 -52 381 L -49 368 Q -46 351 -57 349 L -57 310 L -43 256 Z" fill={PALETTE.skin} />
          {/* Tay phải co lên giữ điện thoại */}
          <path d="M 53 235 Q 74 260 68 290 L 52 320 L 30 310 L 22 280 L 32 258 Z" fill={PALETTE.skin} />
          {/* Điện thoại trong tay phải */}
          <rect x={18} y={260} width={28} height={52} rx={4} fill={PALETTE.phone} transform="rotate(-15 32 286)" strokeWidth={2.5} />
          <rect x={21} y={265} width={22} height={40} rx={2} fill={PALETTE.phoneScreen} opacity={0.85} transform="rotate(-15 32 286)" stroke="none" />
          {/* Bàn tay ôm mép điện thoại */}
          <path d="M 36 295 Q 46 290 44 312 Q 30 316 26 304 Z" fill={PALETTE.skin} strokeWidth={2.2} />
        </>
      ) : pose === 'scared_retreat' ? (
        <>
          {/* Hai tay co rúm thủ thế trước ngực */}
          <path d="M -68 235 Q -85 260 -70 295 L -45 300 Q -38 280 -45 260 Z" fill={PALETTE.skin} />
          <path d="M 48 235 Q 65 260 50 295 L 25 300 Q 18 280 25 260 Z" fill={PALETTE.skin} />
          {/* Hai bàn tay co quắp hoảng sợ */}
          <ellipse cx={-40} cy={302} rx={12} ry={10} fill={PALETTE.skin} strokeWidth={2.5} />
          <ellipse cx={20} cy={302} rx={12} ry={10} fill={PALETTE.skin} strokeWidth={2.5} />
        </>
      ) : (
        /* Dáng vai mềm buông lỏng hai tay tự nhiên */
        <>
          <path d="M -73 235 Q -89 274 -84 312 L -91 367 Q -91 383 -81 387 L -76 378 Q -74 394 -66 389 L -64 378 Q -58 389 -52 381 L -49 368 Q -46 351 -57 349 L -57 310 L -43 256 Z" fill={PALETTE.skin} />
          <path d="M 53 235 Q 74 268 71 299 L 77 353 Q 91 370 82 382 Q 77 387 73 378 Q 74 393 67 392 Q 60 391 60 379 Q 58 390 52 385 L 48 367 Q 47 358 51 351 L 45 309 L 32 258 Z" fill={PALETTE.skin} />
        </>
      )}

      {/* Áo thun ngủ xám nhạt (rộng thùng thình, nếp gấp mềm mại) */}
      <path
        d="M -26 177 Q -58 179 -77 201 Q -94 221 -96 245 Q -77 263 -52 262 L -58 298 Q -66 329 -61 351 Q -23 370 12 355 Q 38 363 63 345 L 55 281 L 58 257 Q 78 256 87 244 Q 84 207 60 192 L 16 178 Q -7 194 -26 177 Z"
        fill={PALETTE.nam.shirt}
      />
      <path d="M -26 179 Q -23 203 -1 203 Q 14 201 21 183 M -55 218 Q -53 241 -52 262 M 56 219 L 58 257 M -45 316 Q -19 333 15 320 M 15 340 Q 36 343 48 334" fill="none" strokeWidth={2.5} />

      {/* Đầu Nam */}
      <NamHead mood={mood} id="nam-body-head" />
    </g>
  );
};

// ----------------------------------------------------------------------------
// 2. NGƯỜI KIA (BẢN SAO / THE DOPPELGÄNGER)
// ----------------------------------------------------------------------------
export type DoppelMood = 'calm' | 'neutral_smile' | 'eerie_smirk';
export type DoppelPose = 'standing_clean' | 'holding_bowl' | 'washing_back';

export const NguoiKiaHead: React.FC<{
  mood?: DoppelMood;
  id?: string;
  x?: number;
  y?: number;
  scale?: number;
}> = ({ mood = 'calm', id = 'doppel-head', x = 0, y = 0, scale = 1 }) => {
  const isEerie = mood === 'eerie_smirk';
  const isSmiling = mood === 'neutral_smile';

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={PALETTE.ink} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round">
      {/* Cổ thẳng thớm */}
      <path d="M -28 141 L -28 182 Q -8 198 16 181 L 19 138" fill={PALETTE.skin} />
      <path d="M -26 155 Q -8 171 17 153 L 16 175 Q -7 187 -27 174 Z" fill={PALETTE.skinShadow} stroke="none" />

      {/* Mặt giống hệt Nam */}
      <path d="M -55 60 Q -50 25 -9 25 Q 42 24 53 66 L 55 111 Q 72 130 54 146 Q 38 166 6 165 Q -30 163 -45 138 L -58 100 Z" fill={PALETTE.skin} />
      {/* Tai trái */}
      <path d="M -47 87 Q -75 72 -77 99 Q -78 121 -50 125" fill={PALETTE.skin} />
      <path d="M -65 99 Q -57 93 -53 106" fill="none" strokeWidth={2.4} />

      {/* Tóc giống Nam nhưng vào nếp gọn gàng hơn */}
      <path
        d="M -51 92 Q -65 79 -61 52 L -71 51 Q -58 27 -38 28 L -43 18 Q -20 21 -7 14 Q -10 -5 15 -5 Q 22 -4 24 4 Q 7 0 8 16 Q 40 13 51 37 L 62 43 L 48 59 Q 34 54 22 43 Q 15 63 -4 67 L -1 52 Q -20 75 -41 74 L -43 95 Z"
        fill={PALETTE.nguoiKia.hair}
      />

      {/* Mắt điềm tĩnh, mở đều đặn, không chớp hoảng hốt */}
      <defs>
        <clipPath id={`${id}-eyes`}>
          <ellipse cx={-11} cy={99} rx={16.5} ry={14} />
          <ellipse cx={30} cy={96} rx={14.5} ry={13.5} />
        </clipPath>
      </defs>

      <ellipse cx={-11} cy={99} rx={16.5} ry={14} fill={PALETTE.eyeWhite} strokeWidth={2.5} />
      <ellipse cx={30} cy={96} rx={14.5} ry={13.5} fill={PALETTE.eyeWhite} strokeWidth={2.5} />

      <g clipPath={`url(#${id}-eyes)`}>
        {/* Ánh mắt nhìn thẳng kiên định hoặc hơi liếc kín đáo */}
        <ellipse cx={isEerie ? -6 : -9} cy={99} rx={4.5} ry={5.8} fill={PALETTE.ink} stroke="none" />
        <ellipse cx={isEerie ? 34 : 31} cy={96} rx={4.5} ry={5.8} fill={PALETTE.ink} stroke="none" />
        <circle cx={isEerie ? -5 : -8} cy={97} r={1.3} fill="#ffffff" stroke="none" />
        <circle cx={isEerie ? 35 : 32} cy={94} r={1.3} fill="#ffffff" stroke="none" />

        {/* Nếp mí mắt điềm đạm */}
        <path d="M -33 73 L 51 73 L 51 86 L -33 87 Z" fill={PALETTE.skin} strokeWidth={2.5} />
      </g>

      {/* Lông mày: điềm tĩnh, hơi xếch nhẹ tự tin */}
      <path
        d={
          isEerie
            ? 'M -28 75 Q -12 70 2 73 M 19 72 Q 33 65 44 68'
            : isSmiling
            ? 'M -28 75 Q -12 73 2 76 M 19 74 Q 33 71 44 73'
            : 'M -28 76 Q -12 74 2 76 M 19 74 Q 33 71 44 73'
        }
        fill="none"
        strokeWidth={4.8}
      />

      {/* ĐẶC ĐIỂM GIỐNG HỆT NAM: Nốt ruồi sát đuôi mày trái! */}
      <circle cx={-32} cy={80} r={2.2} fill={PALETTE.ink} stroke="none" />

      {/* Mũi */}
      <path d="M 18 106 Q 30 108 26 117 L 17 119" fill="none" strokeWidth={2.5} />

      {/* Miệng: Điềm tĩnh, nhếch nhẹ lịch sự hoặc nụ cười rợn người */}
      {isEerie ? (
        <path d="M -2 143 Q 12 135 28 138" fill="none" strokeWidth={3} />
      ) : isSmiling ? (
        <path d="M 0 142 Q 13 147 26 142" fill="none" strokeWidth={2.8} />
      ) : (
        <path d="M 2 143 Q 13 144 24 143" fill="none" strokeWidth={2.6} />
      )}
    </g>
  );
};

export const NguoiKia: React.FC<{
  mood?: DoppelMood;
  pose?: DoppelPose;
  x?: number;
  y?: number;
  scale?: number;
}> = ({ mood = 'calm', pose = 'standing_clean', x = 0, y = 0, scale = 1 }) => {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={PALETTE.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
      {/* Bóng đổ tiếp xúc */}
      <ellipse cx={0} cy={589} rx={98} ry={13} fill="#d6c9b6" stroke="none" />

      {/* Chân & Dép: Đứng thẳng thớm vững vàng */}
      <path d="M -50 537 L -50 568 L -12 567 L -12 533 M 15 537 L 18 570 L 56 566 L 52 531" fill={PALETTE.skin} />
      <path d="M -50 561 Q -75 568 -74 585 Q -50 597 -6 586 L -8 575 Q -19 560 -50 561 Z" fill={PALETTE.skin} />
      <path d="M 19 561 Q 40 559 62 568 Q 85 571 83 584 Q 52 596 12 585 L 11 573 Z" fill={PALETTE.skin} />
      <path d="M -74 583 Q -42 593 -5 583 L -5 590 Q -40 601 -75 590 Z M 12 583 Q 51 591 83 581 L 84 588 Q 50 600 12 591 Z" fill="#2d3330" strokeWidth={2.5} />
      <path d="M -60 565 Q -35 553 -15 567 L -10 579 Q -36 564 -66 580 Z M 22 563 Q 47 559 66 573 L 70 583 Q 45 568 18 578 Z" fill={PALETTE.nguoiKia.slippers} strokeWidth={2.5} />

      {/* Quần dài vải tối màu, đứng thẳng không nhàu nát */}
      <path
        d="M -58 329 Q -70 364 -65 403 L -62 454 Q -70 491 -58 548 Q -38 558 -10 548 L -4 466 L 8 411 Q 14 446 14 471 L 12 548 Q 32 558 60 545 L 61 445 Q 74 388 56 330 Z"
        fill={PALETTE.nguoiKia.pants}
      />
      <path d="M -4 368 Q -2 388 8 411 M -55 437 Q -36 447 -32 466 M 20 512 Q 32 503 46 506" fill="none" strokeWidth={2.5} />

      {/* Hai tay theo Pose */}
      {pose === 'holding_bowl' ? (
        <>
          {/* Hai tay bưng chén vừa rửa xong, nước nhỏ giọt */}
          <path d="M -68 235 Q -80 268 -65 295 L -35 305 L -20 285 L -45 256 Z" fill={PALETTE.skin} />
          <path d="M 48 235 Q 60 268 45 295 L 15 305 L 0 285 L 25 258 Z" fill={PALETTE.skin} />
          {/* Cái chén sứ trắng sạch */}
          <ellipse cx={-10} cy={298} rx={22} ry={11} fill={PALETTE.bowl} strokeWidth={2.6} />
          <path d="M -32 298 Q -30 322 -10 324 Q 10 322 12 298 Z" fill={PALETTE.bowl} strokeWidth={2.6} />
          <ellipse cx={-10} cy={298} rx={20} ry={8} fill={PALETTE.bowlRim} opacity={0.3} stroke="none" />
          {/* Giọt nước nhỏ xuống sàn theo kịch bản: "Nước từ bàn tay nhỏ xuống nền" */}
          <path d="M -12 334 Q -10 342 -10 344 Q -10 346 -12 346 Q -14 346 -14 344 Q -14 342 -12 334 Z" fill="#6bb6ff" opacity={0.8} stroke="none" />
          {/* Hai bàn tay đỡ chén */}
          <ellipse cx={-28} cy={308} rx={8} ry={7} fill={PALETTE.skin} strokeWidth={2.2} />
          <ellipse cx={8} cy={308} rx={8} ry={7} fill={PALETTE.skin} strokeWidth={2.2} />
        </>
      ) : (
        /* standing_clean: "Người kia dừng. Đặt cái chén xuống, để hai bàn tay trống trước người." */
        <>
          {/* Hai cánh tay đưa về trước, lòng bàn tay mở rỗng tự nhiên chứng minh không đe dọa */}
          <path d="M -68 235 Q -80 268 -72 305 L -48 318 L -38 298 L -48 256 Z" fill={PALETTE.skin} />
          <path d="M 48 235 Q 60 268 52 305 L 28 318 L 18 298 L 28 258 Z" fill={PALETTE.skin} />
          {/* Hai lòng bàn tay mở trống */}
          <path d="M -48 318 Q -56 332 -48 344 Q -38 344 -36 330 L -38 300 Z" fill={PALETTE.skin} strokeWidth={2.5} />
          <path d="M 28 318 Q 36 332 28 344 Q 18 344 16 330 L 18 300 Z" fill={PALETTE.skin} strokeWidth={2.5} />
        </>
      )}

      {/* ÁO THUN XANH RÊU CỦA NAM (Chiếc áo Nam bỏ trên ghế tối qua!) */}
      <path
        d="M -26 177 Q -54 179 -72 199 Q -88 219 -90 243 Q -72 260 -48 259 L -54 295 Q -61 326 -56 348 Q -20 366 12 352 Q 35 360 58 342 L 51 278 L 54 254 Q 73 253 82 241 Q 79 205 56 190 L 16 178 Q -7 194 -26 177 Z"
        fill={PALETTE.nguoiKia.shirt}
      />
      <path d="M -26 179 Q -23 203 -1 203 Q 14 201 21 183 M -52 218 Q -50 241 -49 262 M 53 219 L 55 257 M -42 316 Q -18 333 13 320 M 13 340 Q 33 343 45 334" fill="none" strokeWidth={2.5} />

      {/* Đầu Người Kia */}
      <NguoiKiaHead mood={mood} id="doppel-body-head" />
    </g>
  );
};

// ----------------------------------------------------------------------------
// 3. TÙNG — BẠN CÙNG PHÒNG CHĂM CHỈ
// ----------------------------------------------------------------------------
export type TungMood = 'annoyed' | 'focused' | 'normal';

export const TungHead: React.FC<{
  mood?: TungMood;
  id?: string;
  x?: number;
  y?: number;
  scale?: number;
}> = ({ mood = 'annoyed', id = 'tung-head', x = 0, y = 0, scale = 1 }) => {
  const isAnnoyed = mood === 'annoyed';

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={PALETTE.ink} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round">
      {/* Cổ thẳng thắn, khỏe khoắn */}
      <path d="M -26 141 L -26 182 Q -6 199 18 181 L 20 138" fill={PALETTE.skin} />
      <path d="M -24 155 Q -6 171 19 153 L 18 175 Q -5 187 -25 174 Z" fill={PALETTE.skinShadow} stroke="none" />

      {/* Mặt góc cạnh hơn Nam một chút, cằm sắc nét */}
      <path d="M -52 60 Q -48 24 -6 24 Q 40 24 50 64 L 52 109 Q 68 128 50 144 Q 35 164 4 163 Q -32 161 -44 136 L -55 98 Z" fill={PALETTE.skin} />
      {/* Tai trái */}
      <path d="M -45 87 Q -72 72 -74 98 Q -75 120 -48 124" fill={PALETTE.skin} />
      <path d="M -62 98 Q -55 92 -51 105" fill="none" strokeWidth={2.4} />

      {/* Tóc sinh viên gọn gàng, chải side-part hiện đại */}
      <path
        d="M -48 90 Q -62 76 -58 48 Q -52 18 -15 14 Q 22 10 44 26 Q 58 38 58 64 L 58 74 Q 44 58 26 56 Q -2 55 -32 76 L -40 92 Z"
        fill={PALETTE.tung.hair}
      />
      {/* Mái tóc vuốt nhẹ sang bên */}
      <path d="M -15 14 Q 8 2 28 8 Q 48 16 52 38" fill="none" strokeWidth={3.8} />

      {/* Kính cận gọng mảnh thanh lịch của sinh viên chăm học */}
      <rect x={-32} y={84} width={28} height={24} rx={6} fill="none" stroke={PALETTE.inkSoft} strokeWidth={2.8} />
      <rect x={6} y={82} width={28} height={24} rx={6} fill="none" stroke={PALETTE.inkSoft} strokeWidth={2.8} />
      {/* Cầu kính & Gọng kính nối tai */}
      <path d="M -4 94 Q 1 91 6 94" fill="none" stroke={PALETTE.inkSoft} strokeWidth={2.8} />
      <path d="M -32 94 L -46 91" fill="none" stroke={PALETTE.inkSoft} strokeWidth={2.6} />

      {/* Mắt Tùng qua kính */}
      <ellipse cx={-18} cy={96} rx={4.2} ry={5.2} fill={PALETTE.ink} stroke="none" />
      <ellipse cx={20} cy={94} rx={4.2} ry={5.2} fill={PALETTE.ink} stroke="none" />
      <circle cx={-17} cy={94} r={1.2} fill="#ffffff" stroke="none" />
      <circle cx={21} cy={92} r={1.2} fill="#ffffff" stroke="none" />

      {/* Lông mày: Nhíu lại bực mình vì Nam gọi làm phiền giờ học */}
      <path
        d={
          isAnnoyed
            ? 'M -30 80 L -6 86 M 8 85 L 32 78'
            : 'M -30 81 Q -15 78 -6 81 M 8 81 Q 20 78 32 81'
        }
        fill="none"
        strokeWidth={4.8}
      />

      {/* Mũi */}
      <path d="M 16 104 Q 26 106 22 115 L 14 117" fill="none" strokeWidth={2.5} />

      {/* Miệng nói qua điện thoại: "Mày xàm hả? Ngủ chưa tỉnh à? Thôi tao đang học." */}
      {isAnnoyed ? (
        <path d="M -4 140 Q 8 134 22 139 Q 12 147 -4 140 Z" fill={PALETTE.mouthDark} strokeWidth={2.2} />
      ) : (
        <path d="M 0 141 Q 12 143 24 140" fill="none" strokeWidth={2.6} />
      )}
    </g>
  );
};

export const Tung: React.FC<{
  mood?: TungMood;
  x?: number;
  y?: number;
  scale?: number;
}> = ({ mood = 'annoyed', x = 0, y = 0, scale = 1 }) => {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={PALETTE.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
      {/* Bóng đổ tiếp xúc */}
      <ellipse cx={0} cy={589} rx={95} ry={13} fill="#d6c9b6" stroke="none" />

      {/* Quai balo học sinh đeo sau lưng */}
      <path d="M -55 210 Q -85 270 -68 340 L -55 335" fill="none" stroke={PALETTE.tung.backpack} strokeWidth={11} strokeLinecap="round" />

      {/* Chân & Giày sneaker sinh viên năng động */}
      <path d="M -48 537 L -48 565 L -12 564 L -12 533 M 15 537 L 18 566 L 54 563 L 50 531" fill={PALETTE.skin} />
      {/* Giày thể thao trắng ngà */}
      <path d="M -54 564 Q -78 567 -76 584 Q -48 594 -8 585 L -10 572 Q -22 562 -54 564 Z" fill={PALETTE.tung.sneakers} strokeWidth={3} />
      <path d="M 16 564 Q 40 562 62 567 Q 84 570 82 584 Q 50 594 10 585 L 9 572 Z" fill={PALETTE.tung.sneakers} strokeWidth={3} />
      {/* Đế giày thể thao */}
      <path d="M -76 582 Q -42 592 -7 583 L -7 589 Q -42 599 -77 589 Z M 10 582 Q 48 591 82 581 L 82 587 Q 48 597 10 587 Z" fill="#b0a899" strokeWidth={2} />

      {/* Quần Kaki sinh viên dáng đứng thẳng thớm */}
      <path
        d="M -56 324 Q -68 360 -62 400 L -58 450 Q -64 490 -54 544 Q -36 554 -10 544 L -4 466 L 8 411 Q 14 446 14 471 L 12 544 Q 30 554 56 542 L 58 442 Q 70 384 54 326 Z"
        fill={PALETTE.tung.khaki}
      />
      <path d="M -4 364 Q -2 384 8 408 M -52 434 Q -34 444 -30 462 M 18 508 Q 30 500 44 502" fill="none" strokeWidth={2.4} />

      {/* Tay trái ôm tập giáo trình / tài liệu học tập */}
      <path d="M -66 225 Q -80 260 -70 295 L -40 310 L -32 285 L -45 250 Z" fill={PALETTE.skin} />
      {/* Tập tài liệu sinh viên */}
      <rect x={-62} y={270} width={34} height={48} rx={2} fill="#e3dcce" strokeWidth={2.6} transform="rotate(12 -45 294)" />
      <path d="M -55 285 L -35 288 M -54 295 L -34 298 M -53 305 L -38 307" stroke="#999183" strokeWidth={1.8} />
      {/* Bàn tay ôm mép tập tài liệu */}
      <path d="M -40 295 Q -32 300 -36 314 Q -48 316 -46 304 Z" fill={PALETTE.skin} strokeWidth={2.2} />

      {/* Tay phải cầm điện thoại áp vào tai: "Gì vậy? Tao đang học..." */}
      <path d="M 48 225 Q 68 250 64 285 L 56 220 L 46 160 L 32 170 L 38 215 L 28 250 Z" fill={PALETTE.skin} />
      {/* Chiếc điện thoại Tùng áp vào tai */}
      <rect x={38} y={120} width={20} height={38} rx={3} fill={PALETTE.phone} strokeWidth={2.4} transform="rotate(15 48 139)" />
      {/* Bàn tay gập giữ điện thoại */}
      <ellipse cx={46} cy={145} rx={8} ry={10} fill={PALETTE.skin} strokeWidth={2.2} transform="rotate(15 46 145)" />

      {/* Áo Polo sinh viên xanh navy gọn gàng */}
      <path
        d="M -24 175 Q -50 177 -68 195 Q -82 215 -84 238 Q -68 254 -46 253 L -50 288 Q -56 318 -52 340 Q -18 358 10 344 Q 32 352 54 335 L 48 274 L 50 250 Q 68 249 76 237 Q 73 203 52 188 L 14 176 Q -6 192 -24 175 Z"
        fill={PALETTE.tung.polo}
      />
      {/* Cổ áo Polo */}
      <path d="M -24 175 L -10 205 L 0 188 L 10 205 L 14 176 Z" fill={PALETTE.tung.poloCollar} strokeWidth={2.6} />
      <path d="M 0 188 L 0 226" stroke={PALETTE.ink} strokeWidth={2.4} />
      <circle cx={0} cy={200} r={1.5} fill="#ffffff" stroke="none" />
      <circle cx={0} cy={214} r={1.5} fill="#ffffff" stroke="none" />

      {/* Đầu Tùng */}
      <TungHead mood={mood} id="tung-body-head" />
    </g>
  );
};

// ----------------------------------------------------------------------------
// 4. BẢNG TRÌNH DIỄN ASSET TỔNG HỢP CÁC NHÂN VẬT HỒ SƠ 02
// ----------------------------------------------------------------------------
export const HoSo02CharacterBoard: React.FC = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
      {/* Nền giấy ấm thanh lịch */}
      <rect width="1920" height="1080" fill="#f6f1e8" />

      {/* Tiêu đề & Thông tin */}
      <g fontFamily="Arial, sans-serif" fill={PALETTE.ink} textAnchor="middle">
        <text x={960} y={55} fontSize={30} fontWeight="800" letterSpacing="1.5">
          HỒ SƠ 02: NGƯỜI LÀM THAY — DÀN NHÂN VẬT THEO PHONG CÁCH SVG MỚI (STYLE B)
        </text>
        <text x={960} y={90} fontSize={17} fill="#69706c">
          Nét vẽ hữu cơ mềm mại · Mảng tóc gọn · Vai và quần áo có khối tự nhiên · Bám sát chi tiết kịch bản
        </text>
      </g>

      {/* Đường phân chia 3 cột */}
      <path d="M 640 120 V 1040 M 1280 120 V 1040" stroke="#dfd7ca" strokeWidth={2} strokeDasharray="6 6" />

      {/* CỘT 1: NAM (NHÂN VẬT CHÍNH) */}
      <g transform="translate(320 0)">
        <text x={0} y={150} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={24} fontWeight="700" fill={PALETTE.ink}>
          1. NAM (SINH VIÊN)
        </text>
        <text x={0} y={178} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={15} fill="#707875">
          Lười nhác, vai mềm gù, nốt ruồi đuôi mày trái, áo ngủ xám
        </text>
        {/* Nhân vật toàn thân */}
        <g transform="translate(0 15) scale(0.95)">
          <Nam mood="sleepy" pose="holding_phone" />
        </g>
        {/* 3 biểu cảm cận cảnh */}
        <g transform="translate(-190 710) scale(0.68)">
          <NamHead mood="sleepy" id="board-nam-sleepy" />
          <text x={0} y={230} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fill="#515956" stroke="none">UỂ OẢI</text>
        </g>
        <g transform="translate(0 710) scale(0.68)">
          <NamHead mood="shocked" id="board-nam-shocked" />
          <text x={0} y={230} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fill="#515956" stroke="none">HOẢNG SỢ</text>
        </g>
        <g transform="translate(190 710) scale(0.68)">
          <NamHead mood="suspicious" id="board-nam-suspicious" />
          <text x={0} y={230} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fill="#515956" stroke="none">DÈ CHỪNG</text>
        </g>
      </g>

      {/* CỘT 2: NGƯỜI KIA (BẢN SAO / DOPPELGÄNGER) */}
      <g transform="translate(960 0)">
        <text x={0} y={150} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={24} fontWeight="700" fill={PALETTE.ink}>
          2. NGƯỜI KIA (BẢN SAO)
        </text>
        <text x={0} y={178} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={15} fill="#707875">
          Giống hệt Nam, nốt ruồi mày trái, mặc áo xanh của Nam, dáng thẳng thớm
        </text>
        {/* Nhân vật toàn thân */}
        <g transform="translate(0 15) scale(0.95)">
          <NguoiKia mood="calm" pose="standing_clean" />
        </g>
        {/* 3 biểu cảm cận cảnh */}
        <g transform="translate(-190 710) scale(0.68)">
          <NguoiKiaHead mood="calm" id="board-doppel-calm" />
          <text x={0} y={230} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fill="#515956" stroke="none">ĐIỀM TĨNH</text>
        </g>
        <g transform="translate(0 710) scale(0.68)">
          <NguoiKiaHead mood="neutral_smile" id="board-doppel-smile" />
          <text x={0} y={230} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fill="#515956" stroke="none">THÂN THIỆN</text>
        </g>
        <g transform="translate(190 710) scale(0.68)">
          <NguoiKiaHead mood="eerie_smirk" id="board-doppel-eerie" />
          <text x={0} y={230} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fill="#515956" stroke="none">BÍ HIỂM</text>
        </g>
      </g>

      {/* CỘT 3: TÙNG (BẠN CÙNG PHÒNG) */}
      <g transform="translate(1600 0)">
        <text x={0} y={150} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={24} fontWeight="700" fill={PALETTE.ink}>
          3. TÙNG (BẠN CÙNG PHÒNG)
        </text>
        <text x={0} y={178} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={15} fill="#707875">
          Chăm chỉ, áo polo navy, đeo balo, nghe máy gắt: "Mày xàm hả?"
        </text>
        {/* Nhân vật toàn thân */}
        <g transform="translate(0 15) scale(0.95)">
          <Tung mood="annoyed" />
        </g>
        {/* 3 biểu cảm cận cảnh */}
        <g transform="translate(-190 710) scale(0.68)">
          <TungHead mood="annoyed" id="board-tung-annoyed" />
          <text x={0} y={230} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fill="#515956" stroke="none">BỰC BỘI</text>
        </g>
        <g transform="translate(0 710) scale(0.68)">
          <TungHead mood="focused" id="board-tung-focused" />
          <text x={0} y={230} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fill="#515956" stroke="none">TẬP TRUNG</text>
        </g>
        <g transform="translate(190 710) scale(0.68)">
          <TungHead mood="normal" id="board-tung-normal" />
          <text x={0} y={230} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={20} fill="#515956" stroke="none">BÌNH THƯỜNG</text>
        </g>
      </g>

      {/* Ghi chú chân trang */}
      <text x={960} y={1055} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={16} fill="#828a86">
        Thiết kế tuân thủ tiêu chí: Đường nét hữu cơ liền mạch, vai áo mềm, đùi quần có bề dày, biểu cảm bám sát kịch bản Hồ sơ 2.
      </text>
    </svg>
  );
};
