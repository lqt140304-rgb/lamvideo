// Tạo tự động từ ảnh mascot (tools/mascot_cutout.py). Kích thước ảnh và điểm giữa hai chân, đơn vị px.
export const MASCOT = {
  stand: { w: 404, h: 1045, footX: 208, footY: 1047 },
  arms: { w: 404, h: 1043, footX: 214, footY: 1047 },
  ok: { w: 410, h: 1034, footX: 213, footY: 1046 },
  thumbs: { w: 436, h: 1034, footX: 224, footY: 1048 },
  neutral: { w: 403, h: 1043, footX: 212, footY: 1050 },
  smile: { w: 419, h: 1058, footX: 223, footY: 1050 },
  happy: { w: 386, h: 1054, footX: 202, footY: 1053 },
  excited: { w: 416, h: 1029, footX: 213, footY: 1037 },
  think: { w: 496, h: 1047, footX: 268, footY: 1051 },
  confused: { w: 536, h: 1051, footX: 255, footY: 1052 },
  surprised: { w: 540, h: 1053, footX: 249, footY: 1053 },
  shocked: { w: 536, h: 1057, footX: 253, footY: 1048 },
  sad: { w: 463, h: 1040, footX: 221, footY: 1040 },
  angry: { w: 591, h: 1040, footX: 293, footY: 1040 },
  tired: { w: 508, h: 1040, footX: 224, footY: 1040 },
  shy: { w: 519, h: 1050, footX: 264, footY: 1047 },
  cry: { w: 582, h: 1047, footX: 322, footY: 1047 },
  walk: { w: 578, h: 817, footX: 321, footY: 845 },
  run: { w: 795, h: 817, footX: 395, footY: 820 },
  jump: { w: 701, h: 841, footX: 310, footY: 851 },
  bow: { w: 541, h: 949, footX: 181, footY: 943 },
  lift: { w: 663, h: 763, footX: 271, footY: 756 },
  clipboard: { w: 592, h: 834, footX: 270, footY: 831 },
} as const;

export type MascotPose = keyof typeof MASCOT;
