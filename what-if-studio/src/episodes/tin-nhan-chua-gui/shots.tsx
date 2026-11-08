import React from 'react';
import {MeadowFamily} from './meadow_family';
import {
  Hero,
  LOOKS,
  standPose,
  sitPose,
  gesturePose,
  camT,
  kf,
  clamp,
  lerp,
  easeOut,
  easeIn,
  ShotProps,
  FONT,
  Glow,
  Dust,
  EpisodeTitleBanner,
  PerchingOwl,
  OwlEyeMacro,
  StarryCitySkyline,
  AlleyExteriorScene,
  SunsetRiceField,
  SunsetMeadowForeground,
  ThreeReceiptsSet,
  OngLocShop,
  OngLocCounter,
  CustomerStool,
  OngLocForeground,
  OngLocCounterInsert,
  MotherThaoHouse,
  DiningTableSet,
  MotherHouseForeground,
  MotherPhone,
  FamilyPhoto,
  MemoryReceipt,
  MoneyEnvelope,
  SignPen,
  ThaoToteBag,
} from '../../engine';

// ============================================================================
// CẢNH 0: PHẦN MỞ ĐẦU (00:00 – 00:24 · 720 frames @ 30fps)
// ============================================================================

/** ShC0_A: Toàn thành phố đêm, trời sao rộng, tiêu đề "TIN NHẮN CHƯA GỬI" */
export const ShC0_A: React.FC<ShotProps> = ({ t }) => {
  const zoom = kf(t, [[0, 1.0], [120, 1.04]]);
  return (
    <g transform={camT(960, 420, zoom)}>
      <StarryCitySkyline t={t} tiltY={0.04} showTitle titleOpacity={1} showOwl={false} />
    </g>
  );
};

/** ShC0_B: Máy tilt hạ dần qua các tầng mái nhà tới con cú đậu trên thanh sắt */
export const ShC0_B: React.FC<ShotProps> = ({ t }) => {
  const p = clamp(t / 120, 0, 1);
  const tilt = easeOut(p) * 0.76;
  const titleO = clamp(1 - p * 2.2, 0, 1);
  return (
    <g transform={camT(960, 540 + tilt * 140, 1.0 + tilt * 0.12)}>
      <StarryCitySkyline t={t} tiltY={tilt} showTitle={titleO > 0.02} titleOpacity={titleO} showOwl />
    </g>
  );
};

/** ShC0_C: Cận đặc tả 85mm đầu & mắt cú phản chiếu ánh đèn đường vàng ấm */
export const ShC0_C: React.FC<ShotProps> = ({ t }) => {
  const blink = t > 44 && t < 54 ? Math.sin(((t - 44) / 10) * Math.PI) : 0;
  const microLook = Math.sin(t / 22) * 0.08;
  return (
    <g transform={camT(960, 540, 1.02)}>
      <OwlEyeMacro w={1920} h={1080} blink={blink} lookX={0.22 + microLook} lookY={0.26} />
    </g>
  );
};

/** ShC0_D: Lùi máy mở rộng con hẻm đêm, bóng người qua đường xám trầm */
export const ShC0_D: React.FC<ShotProps> = ({ t }) => {
  const zoom = kf(t, [[0, 1.28], [180, 1.0]]);
  const panX = kf(t, [[0, 720], [180, 960]]);
  return (
    <g transform={camT(panX, 540, zoom)}>
      <AlleyExteriorScene t={t} showOwl showPassersby />
    </g>
  );
};

/** ShC0_E: Chuyển sang hai anh em Duy & Thảo dừng lại trước cửa tiệm ông Lộc */
export const ShC0_E: React.FC<ShotProps> = ({ t }) => {
  const panX = kf(t, [[0, 1020], [150, 1260]]);
  const zoom = kf(t, [[0, 1.0], [150, 1.08]]);
  return (
    <g transform={camT(panX, 740, zoom)}>
      <AlleyExteriorScene t={t} showOwl={false} showPassersby />
      {/* Soft diffused ground contact shadows anchoring Duy and Thảo onto the damp asphalt */}
      <ellipse cx={1245} cy={932} rx={52} ry={13} fill="#05070E" opacity={0.72} filter="url(#softShadowBlur)" />
      <ellipse cx={1110} cy={952} rx={42} ry={11} fill="#05070E" opacity={0.68} filter="url(#softShadowBlur)" />
      <Hero
        look={LOOKS.duy}
        rimId="rimShopWarm"
        shadow={0.35}
        pose={standPose(1245, 930, 0.9, {
          t,
          seed: 1,
          yaw: 0.45,
          expr: 'worried',
          look: 0.5,
          headTilt: -3,
        })}
      />
      <Hero
        look={LOOKS.thao}
        rimId="rimStreetlamp"
        shadow={0.3}
        pose={standPose(1110, 950, 0.7, {
          t,
          seed: 2,
          yaw: 0.38,
          expr: 'scared',
          look: 0.4,
          headTilt: -2,
          gesture: 'handOnChest',
        })}
      />
      {/* Foreground atmospheric dust motes passing gently in front of the characters */}
      <Dust t={t} seed={88} x0={1040} y0={710} w={290} h={250} n={14} o={0.42} />
    </g>
  );
};

/** ShC0_F: Duy nắm tay em gái bước qua ngưỡng cửa tiệm */
export const ShC0_F: React.FC<ShotProps> = ({ t }) => {
  const p = clamp(t / 90, 0, 1);
  const stepX = p * 120;
  const duyX = 1260 + stepX;
  const thaoX = 1120 + stepX * 0.92;
  return (
    <g transform={camT(1360 + stepX * 0.4, 760, 1.12)}>
      <AlleyExteriorScene t={t} showOwl={false} showPassersby={false} />
      {/* Dynamic contact shadows moving with the characters across the shop threshold */}
      <ellipse cx={duyX} cy={932} rx={52} ry={13} fill="#05070E" opacity={0.74} filter="url(#softShadowBlur)" />
      <ellipse cx={thaoX} cy={952} rx={42} ry={11} fill="#05070E" opacity={0.7} filter="url(#softShadowBlur)" />
      <Hero
        look={LOOKS.duy}
        rimId="rimShopWarm"
        shadow={0.35}
        pose={standPose(duyX, 930, 0.9, {
          t,
          seed: 1,
          yaw: 0.65,
          expr: 'determined',
          look: 0.7,
        })}
      />
      <Hero
        look={LOOKS.thao}
        rimId="rimStreetlamp"
        shadow={0.3}
        pose={standPose(thaoX, 950, 0.7, {
          t,
          seed: 2,
          yaw: 0.6,
          expr: 'worried',
          look: 0.6,
          gesture: 'handOnChest',
        })}
      />
      {/* Foreground warm floating particles at the shop entrance */}
      <Dust t={t} seed={93} x0={1140} y0={710} w={320} h={250} n={16} o={0.45} />
    </g>
  );
};

// ============================================================================
// CẢNH 1: THIẾU TIỀN (00:24 – 01:14 · quầy tiệm ông Lộc, tiền lẻ & máy vỡ)
// ============================================================================

/** ShC1_A: Toàn cảnh tiệm: "Để xuống." Thảo giật tay khỏi đồng hồ, Duy kéo em sau vai */
export const ShC1_A: React.FC<ShotProps> = ({ t }) => {
  const recoil = t < 30 ? Math.sin((t / 30) * Math.PI) * 12 : 0;
  return (
    <g transform={camT(960, 540, 0.96)}>
      <OngLocShop t={t} id="c1a" veil={0.38} />
      {/* Ông Lộc đứng sau bàn sửa / quầy */}
      <Hero
        look={LOOKS.ongLoc}
        pose={standPose(1355, 715, 0.95, {
          t,
          seed: 3,
          yaw: -0.35,
          expr: 'neutral',
          look: -0.3,
        })}
      />
      <OngLocCounter x={890} y={855} w={880} t={t} phoneState="cracked" showPhoto={false} receiptStage="none" />
      <Hero
        look={LOOKS.duy}
        pose={standPose(640, 915, 0.94, {
          t,
          seed: 1,
          yaw: 0.35,
          expr: 'worried',
          look: 0.3,
          headTilt: -4,
        })}
      />
      <Hero
        look={LOOKS.thao}
        pose={standPose(510 - recoil, 935, 0.72, {
          t,
          seed: 2,
          yaw: 0.28,
          expr: 'scared',
          look: 0.25,
          headTilt: 4,
          gesture: 'handOnChest',
        })}
      />
      <OngLocForeground shiftX={0} />
    </g>
  );
};

/** ShC1_B: Cận vừa Ông Lộc sau quầy, ánh đèn bàn vàng soi nửa mặt */
export const ShC1_B: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(1355, 540, 1.35)}>
    <OngLocShop t={t} id="c1b" veil={0.44} />
    <Hero
      look={LOOKS.ongLoc}
      pose={standPose(1355, 680, 1.15, {
        t,
        seed: 3,
        yaw: -0.22,
        expr: 'neutral',
        look: -0.2,
      })}
    />
  </g>
);

/** ShC1_C: Insert mặt quầy 38°: điện thoại vỡ màn hình trên khăn, cọc tiền lẻ 186k của Duy */
export const ShC1_C: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(960, 540, 1.0)}>
    <OngLocCounterInsert
      t={t}
      cracked={1}
      screenOn={0}
      playing={0}
      showPhoto={false}
      receiptStage="none"
      showMoney
      showPouch
      showWallet
    />
  </g>
);

// ============================================================================
// CẢNH 2: CHUYỆN ANH MUỐN QUÊN (01:14 – 02:08 · ghế có bậc chân & ảnh mẹ)
// ============================================================================

/** ShC2_A: Thảo góp 2 tờ 20k gấp tư; Ông Lộc ra giá: "Một ký ức quan trọng gắn với máy" */
export const ShC2_A: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(960, 540, 0.98)}>
    <OngLocShop t={t} id="c2a" veil={0.38} />
    <Hero
      look={LOOKS.ongLoc}
      pose={standPose(940, 680, 0.98, {
        t,
        seed: 3,
        yaw: -0.15,
        expr: 'neutral',
        look: -0.1,
      })}
    />
    <OngLocCounter x={890} y={855} w={880} t={t} phoneState="cracked" showPhoto showMoney showPouch />
    <Hero
      look={LOOKS.duy}
      pose={standPose(640, 915, 0.94, {
        t,
        seed: 1,
        yaw: 0.35,
        expr: 'sad',
        look: 0.3,
      })}
    />
    <Hero
      look={LOOKS.thao}
      pose={standPose(510, 935, 0.72, {
        t,
        seed: 2,
        yaw: 0.32,
        expr: 'worried',
        look: 0.3,
        gesture: 'handOnChest',
      })}
    />
    <OngLocForeground shiftX={0} />
  </g>
);

/** ShC2_B: Duy kéo ghế có bậc chân cho Thảo ngồi, đặt ảnh mẹ lên mặt quầy */
export const ShC2_B: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(880, 620, 1.05)}>
    <OngLocShop t={t} id="c2b" veil={0.36} />
    <Hero
      look={LOOKS.ongLoc}
      pose={standPose(940, 680, 0.98, {
        t,
        seed: 3,
        yaw: -0.12,
        expr: 'neutral',
      })}
    />
    <OngLocCounter x={890} y={855} w={880} t={t} phoneState="cracked" showPhoto showMoney showPouch />
    <CustomerStool x={630} y={920} s={0.92} />
    <CustomerStool x={490} y={920} s={0.88} withFootrest />
    <Hero
      look={LOOKS.duy}
      pose={sitPose(630, 830, 0.92, 1, {
        t,
        seed: 1,
        yaw: 0.35,
        expr: 'sad',
        look: 0.25,
      })}
    />
    <Hero
      look={LOOKS.thao}
      pose={sitPose(490, 835, 0.7, 1, {
        t,
        seed: 2,
        yaw: 0.35,
        expr: 'relieved',
        look: 0.3,
        gesture: 'handOnChest',
      })}
    />
    <OngLocForeground shiftX={0} />
  </g>
);

// ============================================================================
// CẢNH 3: GIAO KÈO 1 — TỐI SINH NHẬT 16T MẸ ÔM (02:08 – 03:00)
// ============================================================================

/** ShC3_A: Duy cầm bút ký Giao kèo 1 trên biên nhận 2 liên */
export const ShC3_A: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(960, 540, 1.0)}>
    <OngLocCounterInsert
      t={t}
      cracked={1}
      screenOn={0}
      playing={0}
      showPhoto
      receiptStage={t > 90 ? 'signed' : 'written'}
      penOnPaper={t <= 90}
      showMoney={false}
      showPouch
      showWallet
    />
  </g>
);

// ============================================================================
// CẢNH 4: MÁY SÁNG, CÂU HỎI KHÁC (03:00 – 03:52)
// ============================================================================

/** ShC4_A: Điện thoại sáng lên trên quầy, phát giọng ghi âm của mẹ */
export const ShC4_A: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(960, 540, 1.0)}>
    <OngLocCounterInsert
      t={t}
      cracked={0}
      screenOn={1}
      playing={1}
      showPhoto
      receiptStage="signed"
      penOnPaper={false}
      showMoney={false}
      showPouch
    />
  </g>
);

/** ShC4_B: Duy khựng lại nhận ra đã mất ký ức; Ông Lộc nhếch miệng cười lạnh */
export const ShC4_B: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(900, 580, 1.08)}>
    <OngLocShop t={t} id="c4b" veil={0.4} />
    <Hero
      look={LOOKS.ongLoc}
      pose={standPose(940, 680, 0.98, {
        t,
        seed: 3,
        yaw: -0.22,
        expr: 'smug',
        look: -0.2,
      })}
    />
    <OngLocCounter x={890} y={855} w={880} t={t} phoneState="repaired" showPhoto receiptStage="signed" />
    <Hero
      look={LOOKS.duy}
      pose={sitPose(630, 830, 0.92, 1, {
        t,
        seed: 1,
        yaw: 0.35,
        expr: 'shock',
        look: 0.2,
      })}
    />
    <Hero
      look={LOOKS.thao}
      pose={sitPose(490, 835, 0.7, 1, {
        t,
        seed: 2,
        yaw: 0.35,
        expr: 'happy',
        look: 0.3,
        gesture: 'handOnChest',
      })}
    />
    <OngLocForeground shiftX={0} />
  </g>
);

// ============================================================================
// CẢNH 5: GIAO KÈO 2 & 3 (03:52 – 04:54)
// ============================================================================

/** ShC5_A: Giao kèo 2: Duy nhận gánh thêm phần trống vắng nhớ mẹ của em */
export const ShC5_A: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(880, 620, 1.05)}>
    <OngLocShop t={t} id="c5a" veil={0.42} />
    <Hero
      look={LOOKS.ongLoc}
      pose={standPose(940, 680, 0.98, {
        t,
        seed: 3,
        yaw: -0.18,
        expr: 'neutral',
      })}
    />
    <OngLocCounter x={890} y={855} w={880} t={t} phoneState="repaired" showPhoto receiptStage="signed" />
    <Hero
      look={LOOKS.duy}
      pose={sitPose(630, 830, 0.92, 1, {
        t,
        seed: 1,
        yaw: 0.32,
        expr: 'determined',
        look: 0.25,
      })}
    />
    <Hero
      look={LOOKS.thao}
      pose={sitPose(490, 835, 0.7, 1, {
        t,
        seed: 2,
        yaw: 0.35,
        expr: 'relieved',
        look: 0.3,
        gesture: 'handOnChest',
      })}
    />
    <OngLocForeground shiftX={0} />
  </g>
);

/** ShC5_B: Duy kiệt sức, thái dương rịn mồ hôi sau khi gánh trống vắng; Ông Lộc ra giá G3 */
export const ShC5_B: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(630, 680, 1.25)}>
    <OngLocShop t={t} id="c5b" veil={0.48} />
    <Hero
      look={LOOKS.duy}
      pose={sitPose(630, 830, 0.95, 1, {
        t,
        seed: 1,
        yaw: 0.28,
        expr: 'tired',
        look: 0.2,
        headTilt: 6,
      })}
    />
    <Hero
      look={LOOKS.thao}
      pose={sitPose(480, 835, 0.72, 1, {
        t,
        seed: 2,
        yaw: 0.42,
        expr: 'worried',
        look: 0.35,
        gesture: 'handOnChest',
      })}
    />
  </g>
);

/** ShC5_C: Thảo thốt lên "Cháu đồng ý!" trước khi Duy ngăn; Chuyển trắng và ù! */
export const ShC5_C: React.FC<ShotProps> = ({ t }) => {
  const p = clamp((t - 110) / 70, 0, 1);
  const whiteout = easeIn(p);
  return (
    <g transform={camT(540, 680, 1.28)}>
      <OngLocShop t={t} id="c5c" veil={0.46} />
      <Hero
        look={LOOKS.thao}
        pose={sitPose(480, 835, 0.76, 1, {
          t,
          seed: 2,
          yaw: 0.45,
          expr: 'determined',
          look: 0.4,
          gesture: 'explain',
        })}
      />
      <Hero
        look={LOOKS.duy}
        pose={sitPose(630, 830, 0.94, 1, {
          t,
          seed: 1,
          yaw: 0.15,
          expr: 'shock',
          look: 0.1,
          headTilt: 5,
        })}
      />
      {whiteout > 0.01 ? <rect x={-400} y={-300} width={2800} height={1700} fill="#FFFDF8" opacity={whiteout} /> : null}
    </g>
  );
};

// ============================================================================
// CẢNH 6: CÁNH ĐỒNG LÚA NẮNG CHIỀU (04:54 – 05:36)
// ============================================================================

/** ShC6_A: Cánh đồng lúa vàng óng nắng chiều, tiếng mẹ gọi hai con từ phía trước */
export const ShC6_A: React.FC<ShotProps> = ({ t }) => {
  const whiteRecede = clamp(1 - t / 40, 0, 1);
  return (
    <g transform={camT(960, 540, 0.96)}>
      <SunsetRiceField t={t} whiteout={whiteRecede} />
      <Hero
        look={LOOKS.meDuyThao}
        pose={gesturePose(
          standPose(960, 810, 0.86, {
            t,
            seed: 9,
            yaw: -0.15,
            expr: 'smile',
            look: -0.1,
          }),
          'wave',
          1,
        )}
      />
      <SunsetMeadowForeground t={t} shiftX={0} />
    </g>
  );
};

/** ShC6_B: Mẹ nắm tay hai anh em đi trên lối đất ven ruộng lúa chín vàng */
export const ShC6_B: React.FC<ShotProps> = ({ t }) => {
  const walkSway = Math.sin(t / 14) * 8;
  return (
    <g transform={camT(960, 580, 1.02)}>
      <SunsetRiceField t={t} whiteout={0} />
      <Hero
        look={LOOKS.duy}
        pose={standPose(720, 825 + walkSway * 0.4, 0.88, {
          t,
          seed: 1,
          yaw: 0.35,
          expr: 'smile',
          look: 0.3,
        })}
      />
      <Hero
        look={LOOKS.meDuyThao}
        pose={standPose(960, 815 - walkSway * 0.4, 0.88, {
          t,
          seed: 5,
          yaw: 0.05,
          expr: 'smile',
          look: 0.05,
        })}
      />
      <Hero
        look={LOOKS.thao}
        pose={standPose(1160, 840 + walkSway * 0.5, 0.68, {
          t,
          seed: 2,
          yaw: -0.32,
          expr: 'happy',
          look: -0.3,
          gesture: 'handOnChest',
        })}
      />
      <SunsetMeadowForeground t={t} shiftX={0} />
    </g>
  );
};

// ============================================================================
// CẢNH 7: NHỮNG LỜI ĐỂ LẠI & MẸ TAN DẦN (05:36 – 06:12)
// ============================================================================

/** ShC7_A: Two children lean into their mother's embrace above the irrigation ditch. */
export const ShC7_A:React.FC<ShotProps> = ({t}) => <g transform={camT(960,580,1.05)}>
  <SunsetRiceField t={t} seatedBank />
  <MeadowFamily t={t} grieving />
  <SunsetMeadowForeground t={t} />
</g>;

/** ShC7_B: The same embrace fades as one complete mother, including both front palms. */
export const ShC7_B:React.FC<ShotProps> = ({t}) => {
  const p=clamp((t-60)/140,0,1),motherOpacity=1-easeOut(p);
  return <g transform={camT(960,580,1.05)}>
    <SunsetRiceField t={t} seatedBank />
    <MeadowFamily t={t} motherOpacity={motherOpacity} grieving />
    <SunsetMeadowForeground t={t} />
  </g>;

};

// ============================================================================
// CẢNH 8: TRỞ VỀ CÙNG NHAU (06:12 – 07:00)
// ============================================================================

/** ShC8_A: Trở lại quầy tiệm: ba tờ biên nhận G1, G2, G3; Duy cất giấy và máy vào túi */
export const ShC8_A: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(880, 620, 1.05)}>
    <OngLocShop t={t} id="c8a" veil={0.38} />
    <Hero
      look={LOOKS.ongLoc}
      pose={standPose(940, 680, 0.98, {
        t,
        seed: 3,
        yaw: -0.15,
        expr: 'neutral',
      })}
    />
    <OngLocCounter x={890} y={855} w={880} t={t} phoneState="repaired" showPhoto receiptStage="signed" />
    <ThreeReceiptsSet x={980} y={850} s={0.72} flat />
    <Hero
      look={LOOKS.duy}
      pose={sitPose(630, 830, 0.92, 1, {
        t,
        seed: 1,
        yaw: 0.35,
        expr: 'tired',
        look: 0.25,
        headTilt: 5,
      })}
    />
    <Hero
      look={LOOKS.thao}
      pose={sitPose(490, 835, 0.7, 1, {
        t,
        seed: 2,
        yaw: 0.35,
        expr: 'sad',
        look: 0.3,
        gesture: 'handOnChest',
      })}
    />
    <OngLocForeground shiftX={0} />
  </g>
);

/** ShC8_B: Trước ngưỡng nhà ấm cúng: bóng người bố say phòng sau, Duy bấm điện thoại gọi dì */
export const ShC8_B: React.FC<ShotProps> = ({ t }) => (
  <g transform={camT(980, 540, 0.98)}>
    <MotherThaoHouse t={t} id="c8b" showFatherShadow veil={0.62} />
    <DiningTableSet x={980} y={915} w={450} showPhone showReceipt />
    <Hero
      look={LOOKS.duy}
      pose={standPose(720, 875, 0.92, {
        t,
        seed: 1,
        yaw: 0.35,
        expr: 'determined',
        look: 0.3,
        headTilt: -3,
        gesture: 'holdProp',
      })}
    />
    <Hero
      look={LOOKS.thao}
      pose={standPose(570, 895, 0.7, {
        t,
        seed: 2,
        yaw: 0.32,
        expr: 'worried',
        look: 0.25,
        gesture: 'handOnChest',
      })}
    />
    <MotherHouseForeground shiftX={0} />
  </g>
);

/** ShC8_C: Hai anh em nắm tay rời khỏi con hẻm, bước về phía ánh sáng */
export const ShC8_C: React.FC<ShotProps> = ({ t }) => {
  const p = clamp(t / 210, 0, 1);
  const walkX = p * 260;
  return (
    <g transform={camT(960 + walkX * 0.3, 720, 1.05)}>
      <AlleyExteriorScene t={t} showOwl={false} showPassersby={false} />
      <Hero
        look={LOOKS.duy}
        pose={standPose(760 + walkX, 920, 0.88, {
          t,
          seed: 1,
          yaw: 0.42,
          expr: 'determined',
          look: 0.45,
        })}
      />
      <Hero
        look={LOOKS.thao}
        pose={standPose(640 + walkX * 0.95, 935, 0.68, {
          t,
          seed: 2,
          yaw: 0.38,
          expr: 'relieved',
          look: 0.4,
          gesture: 'handOnChest',
        })}
      />
    </g>
  );
};
