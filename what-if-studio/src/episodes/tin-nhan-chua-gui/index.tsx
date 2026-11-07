import React from 'react';
import { defineEpisode, Timeline, LookDef, TapeLines, HudChip, FONT } from '../../engine';
import timeline from './timeline.json';
import {
  ShC0_A,
  ShC0_B,
  ShC0_C,
  ShC0_D,
  ShC0_E,
  ShC0_F,
  ShC1_A,
  ShC1_B,
  ShC1_C,
  ShC2_A,
  ShC2_B,
  ShC3_A,
  ShC4_A,
  ShC4_B,
  ShC5_A,
  ShC5_B,
  ShC5_C,
  ShC6_A,
  ShC6_B,
  ShC7_A,
  ShC7_B,
  ShC8_A,
  ShC8_B,
  ShC8_C,
} from './shots';

/**
 * Named visual looks & cinematic color grades for Episode 01 ("Tin Nhắn Chưa Gửi"):
 * - `nightAtmosphere`: Deep cool alley night with subtle star glow.
 * - `shopMystery`: Aged warm tungsten lamp grade with darkened unlit corners.
 * - `tension`: Heightened contrast and cool vignette when deals are struck.
 * - `whiteout`: Blinding flash & frequency transition into the memory realm.
 * - `warmMemory`: Dreamy golden-hour rice field warmth with soft pollen glow.
 * - `cozyHome`: Intimate amber-honey domestic warmth.
 */
const nightAtmosphere: LookDef = {
  grade: (lv) => `saturate(${1 - 0.05 * lv}) contrast(${1 + 0.08 * lv}) brightness(${1 - 0.04 * lv})`,
};

const shopMystery: LookDef = {
  grade: (lv) => `contrast(${1 + 0.1 * lv}) sepia(${0.08 * lv}) brightness(${1 - 0.02 * lv})`,
};

const tension: LookDef = {
  grade: (lv) => `saturate(${1 - 0.18 * lv}) contrast(${1 + 0.22 * lv}) hue-rotate(${-10 * lv}deg)`,
};

const whiteout: LookDef = {
  grade: (lv) => `brightness(${1 + 0.65 * lv}) contrast(${1 - 0.2 * lv})`,
  Overlay: ({ lv, p }) => (
    <rect width={1920} height={1080} fill="#FFFDF8" opacity={Math.min(1, lv * p * 1.4)} />
  ),
};

const warmMemory: LookDef = {
  grade: (lv) => `saturate(${1 + 0.18 * lv}) contrast(${1 + 0.06 * lv}) brightness(${1 + 0.04 * lv}) sepia(${0.1 * lv})`,
  Overlay: ({ f }) => {
    const pulse = 0.04 * Math.sin(f / 12);
    return (
      <rect width={1920} height={1080} fill="#FFE2A8" opacity={0.06 + pulse} style={{ mixBlendMode: 'screen' }} />
    );
  },
};

const cozyHome: LookDef = {
  grade: (lv) => `saturate(${1 + 0.08 * lv}) contrast(${1 + 0.04 * lv}) sepia(${0.06 * lv})`,
};

export const tinNhanChuaGui = defineEpisode('TinNhanChuaGui', {
  timeline: timeline as Timeline,
  shots: {
    ShC0_A,
    ShC0_B,
    ShC0_C,
    ShC0_D,
    ShC0_E,
    ShC0_F,
    ShC1_A,
    ShC1_B,
    ShC1_C,
    ShC2_A,
    ShC2_B,
    ShC3_A,
    ShC4_A,
    ShC4_B,
    ShC5_A,
    ShC5_B,
    ShC5_C,
    ShC6_A,
    ShC6_B,
    ShC7_A,
    ShC7_B,
    ShC8_A,
    ShC8_B,
    ShC8_C,
  },
  looks: {
    nightAtmosphere,
    shopMystery,
    tension,
    whiteout,
    warmMemory,
    cozyHome,
  },
});
