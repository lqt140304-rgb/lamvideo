import React from 'react';
import { lerp, easeInOut, clamp } from './anim';
import { ArticulatedMouth, type MouthShape } from './mouth';
import { SoftLimb, SoftTorso } from './anatomy';
export type { MouthShape } from './mouth';

// The cast, drawn entirely in code: one rig, and a costume (a Look) per character. Every character is built
// once here, so they look identical in every shot: that's the "drawn, not guessed" point. Original
// characters only: never a channel's own hero or anything that resembles a famous cartoon character.

export const C = {
  skin: '#F6EFE3',
  skinShade: '#E2D3BE',
  ink: '#1D2033',
  jacket: '#F2B33D',
  jacketShade: '#D4922A',
  shoe: '#2FB7A6',
  orange: '#FF8A3D',
  limb: '#EFE2CC',
};

/** A costume for the rig: the same body and animation, different colours and optional extra pieces for depth. */
export type Look = {
  skin: string;
  skinShade: string;
  hand: string;
  jacket: string;
  jacketShade: string;
  accent: string;
  limb: string;
  line: string;
  shoe: string;
  face: string;
  hair: string;
  extra?:
    | 'hood'
    | 'curls'
    | 'bunches'
    | 'bob'
    | 'suit'
    | 'hardhat'
    | 'crop'
    | 'bun'
    | 'parted'
    | 'greyBun'
    | 'long'
    | 'longHair'
    | 'longWave'
    | 'baldRing'
    | 'highPonytail'
    | 'braids'
    | 'aoDaiBun'
    | 'cCurlLob'
    | 'officeWave'
    | 'undercut'
    | 'slickBack'
    | 'bowlCut'
    | 'spiky'
    | 'sidePart'
    | 'sportyCrew'
    | 'mulletBlonde'
    | 'commaHair'
    | 'policeCap'
    | 'guardCap'
    | 'babyHood'
    | 'thaoHair'
    | 'locHair'
    | 'lowTie';
  hat?: string; // hard-hat or cap colour
  limbW?: number;
  forearm?: string;
  shin?: string;
  fingers?: boolean;
  collar?: 'round' | 'vneck' | 'shirt' | 'cardigan' | 'apron' | 'aoDai' | 'polo' | 'tankTop';
  accessory?: 'none' | 'redScarf' | 'lanyard' | 'whistle' | 'epauletsPolice' | 'epauletsGuard' | 'chain' | 'slingBag' | 'thaoTote';
  bottom?: 'pants' | 'skirt' | 'pencilSkirt' | 'aoDai' | 'shorts';
  body?: 'normal' | 'chubby' | 'swaddle';
  tattoo?: boolean;
  pocket?: boolean;
  pocketPens?: boolean;
  mendedHem?: boolean;
  ageLines?: boolean;
  moustache?: boolean;
  glassesDefault?: boolean;
  feminine?: boolean;
  browSlit?: boolean;
};

export type CastName =
  | 'pip'
  | 'pipHood'
  | 'pipInk'
  | 'mo'
  | 'sis'
  | 'mom'
  | 'suit'
  | 'worker'
  | 'workerHat'
  | 'student'
  | 'tech'
  | 'chu'
  | 'bac'
  | 'moi'
  | 'an'
  | 'hanh'
  | 'linh'
  | 'baSau'
  | 'nam'
  | 'duy'
  | 'thao'
  | 'ongLoc'
  | 'meDuyThao'
  | 'girlDress'
  | 'tattooGuy'
  | 'fatUncle'
  | 'baby'
  | 'studentBoy1'
  | 'studentBoy2'
  | 'studentBoy3'
  | 'studentGirl1'
  | 'studentGirl2'
  | 'studentGirl3'
  | 'teacherAoDai'
  | 'peTeacher'
  | 'officeLady1'
  | 'officeLady2'
  | 'guard'
  | 'police'
  | 'youngPunk'
  | 'seriousGuy';

export const LOOKS: Record<CastName, Look> = {
  // A: Pip as built
  pip: {
    skin: C.skin, skinShade: C.skinShade, hand: C.skin,
    jacket: C.jacket, jacketShade: C.jacketShade, accent: C.jacketShade,
    limb: C.limb, line: C.ink, shoe: C.shoe, face: C.ink, hair: C.ink,
    limbW: 16, fingers: true, collar: 'round',
  },
  // B: Pip in a dark hoodie with mustard drawstrings: the body goes dark and catches the rim light, the head stays the brightest thing
  pipHood: {
    skin: C.skin, skinShade: C.skinShade, hand: C.skin,
    jacket: '#2E2B3D', jacketShade: '#201D2B', accent: C.jacket,
    limb: '#2E2B3D', line: '#121019', shoe: C.shoe, face: C.ink, hair: C.ink,
    extra: 'hood', limbW: 16, fingers: true, pocket: true,
  },
  // C: a dark head with light features, the genre's high-contrast convention, in Pip's mustard
  pipInk: {
    skin: '#26232F', skinShade: '#1C1A24', hand: '#26232F',
    jacket: C.jacket, jacketShade: C.jacketShade, accent: C.jacketShade,
    limb: '#26232F', line: '#121019', shoe: C.shoe, face: '#F6EFE3', hair: '#26232F',
    limbW: 16, fingers: true,
  },
  // Mo, Pip's friend: curly hair, headphones round his neck
  mo: {
    skin: '#C98E68', skinShade: '#B07A58', hand: '#C98E68',
    jacket: '#5E6E46', jacketShade: '#485535', accent: '#E9C46A',
    limb: '#3A3446', line: '#1A1622', shoe: '#D9534F', face: C.ink, hair: '#2A1C18',
    extra: 'curls', limbW: 17, fingers: true, collar: 'round',
  },
  // Pip's little sister (draw her at about 0.7 of Pip's scale), his mum, and the man in a suit
  sis: {
    skin: C.skin, skinShade: C.skinShade, hand: C.skin,
    jacket: '#3E8C86', jacketShade: '#2D6B66', accent: '#F28C6A',
    limb: '#3A3446', line: '#14121C', shoe: '#F28C6A', face: C.ink, hair: '#3A2620',
    extra: 'bunches', limbW: 16, fingers: true, collar: 'round',
  },
  mom: {
    skin: C.skin, skinShade: C.skinShade, hand: C.skin,
    jacket: '#8A5A6A', jacketShade: '#6D4452', accent: '#E9C46A',
    limb: '#3A3446', line: '#14121C', shoe: '#5A4A6A', face: C.ink, hair: '#5A3226',
    extra: 'bob', limbW: 17, fingers: true, collar: 'cardigan',
  },
  suit: {
    skin: '#D9C6AE', skinShade: '#C2AE96', hand: '#D9C6AE',
    jacket: '#2B2F3A', jacketShade: '#1E212A', accent: '#A8323E',
    limb: '#2B2F3A', line: '#0E0F14', shoe: '#14151A', face: C.ink, hair: '#17141A',
    extra: 'suit', limbW: 18, fingers: true,
  },
  // Everyday Vietnamese characters: worker, student, technician, elders, family
  worker: {
    skin: '#E6C29F', skinShade: '#CCA480', hand: '#E6C29F',
    jacket: '#B8742E', jacketShade: '#8E5620', accent: '#F0D58A',
    limb: '#5C5042', line: '#1A1410', shoe: '#5A4A3A', face: C.ink, hair: '#1D181A',
    extra: 'crop', limbW: 19, forearm: '#E6C29F', fingers: true, collar: 'shirt', pocket: true,
  },
  workerHat: {
    skin: '#E6C29F', skinShade: '#CCA480', hand: '#E6C29F',
    jacket: '#B8742E', jacketShade: '#8E5620', accent: '#F0D58A',
    limb: '#5C5042', line: '#1A1410', shoe: '#5A4A3A', face: C.ink, hair: '#1D181A',
    extra: 'hardhat', hat: '#F2B33D', limbW: 19, forearm: '#E6C29F', fingers: true, collar: 'shirt', pocket: true,
  },
  student: {
    skin: '#F2D4B6', skinShade: '#D9B898', hand: '#F2D4B6',
    jacket: '#F2EDE2', jacketShade: '#D4CCB8', accent: '#3E5C8A',
    limb: '#344262', line: '#14121C', shoe: '#E6E1D6', face: C.ink, hair: '#1D181A',
    extra: 'crop', limbW: 17, forearm: '#F2D4B6', fingers: true, collar: 'shirt', pocket: true,
  },
  tech: {
    skin: '#EBCAB0', skinShade: '#D1AE92', hand: '#EBCAB0',
    jacket: '#3F7090', jacketShade: '#2E5570', accent: '#F2B33D',
    limb: '#33465A', line: '#10141C', shoe: '#2B2B30', face: C.ink, hair: '#1D181A',
    extra: 'crop', limbW: 19, forearm: '#EBCAB0', fingers: true, collar: 'shirt', pocket: true,
  },
  chu: {
    skin: '#C99B74', skinShade: '#AE8260', hand: '#C99B74',
    jacket: '#5C6B4A', jacketShade: '#475438', accent: '#F0D58A',
    limb: '#424752', line: '#14110E', shoe: '#4A3A30', face: C.ink, hair: '#2A1C18',
    extra: 'hardhat', hat: '#F2B33D', limbW: 20, forearm: '#C99B74', fingers: true, collar: 'shirt',
  },
  bac: {
    skin: '#BE8C68', skinShade: '#A27452', hand: '#BE8C68',
    jacket: '#5E6F80', jacketShade: '#485765', accent: '#F0D58A',
    limb: '#424752', line: '#14110E', shoe: '#4A3A30', face: C.ink, hair: '#9A9AA0',
    extra: 'hardhat', hat: '#F4F1E8', limbW: 20, forearm: '#BE8C68', fingers: true, collar: 'shirt', ageLines: true,
  },
  moi: {
    skin: '#E8C9A8', skinShade: '#CFAE8C', hand: '#E8C9A8',
    jacket: '#9A4A3A', jacketShade: '#7A382C', accent: '#F0D58A',
    limb: '#524E5E', line: '#14110E', shoe: '#7A6A5A', face: C.ink, hair: '#2A1C18',
    extra: 'hardhat', hat: '#E8763A', limbW: 18, forearm: '#E8C9A8', fingers: true, collar: 'round',
  },
  // "Mưa liên tục 100 ngày" cast
  an: {
    skin: '#E6B98F', skinShade: '#CF9F76', hand: '#E6B98F',
    jacket: '#4F7486', jacketShade: '#3C5A6A', accent: '#2E4654',
    limb: '#3B3F4C', line: '#16141C', shoe: '#5A4636', face: C.ink, hair: '#1B1718',
    extra: 'crop', limbW: 21, forearm: '#E6B98F', fingers: true, collar: 'shirt', pocket: true,
  },
  hanh: {
    skin: '#EBC4A0', skinShade: '#D4A981', hand: '#EBC4A0',
    jacket: '#B5604F', jacketShade: '#934A3D', accent: '#E8C9A0',
    limb: '#3D3A4A', line: '#16141C', shoe: '#6B4A3A', face: C.ink, hair: '#1E1718',
    extra: 'bun', limbW: 18, forearm: '#EBC4A0', fingers: true, collar: 'cardigan', feminine: true,
  },
  linh: {
    skin: '#F0CCA8', skinShade: '#DAB08C', hand: '#F0CCA8',
    jacket: '#E9D8B0', jacketShade: '#CDB98C', accent: '#D96C4F',
    limb: '#55718A', line: '#16141C', shoe: '#D96C4F', face: C.ink, hair: '#1C1516',
    extra: 'bunches', limbW: 18, forearm: '#F0CCA8', shin: '#F0CCA8', fingers: true, collar: 'round', feminine: true,
  },
  baSau: {
    skin: '#DDB08A', skinShade: '#C49670', hand: '#DDB08A',
    jacket: '#6E5B7E', jacketShade: '#574764', accent: '#CDB98C',
    limb: '#2F2B38', line: '#16141C', shoe: '#4A3E36', face: C.ink, hair: '#B9B4AE',
    extra: 'greyBun', limbW: 18, forearm: '#DDB08A', fingers: true, collar: 'cardigan', ageLines: true,
  },
  nam: {
    skin: '#E0B48C', skinShade: '#C89A72', hand: '#E0B48C',
    jacket: '#3F8A7C', jacketShade: '#2F6C60', accent: '#F2C14E',
    limb: '#44506A', line: '#16141C', shoe: '#E9E0CC', face: C.ink, hair: '#1A1516',
    extra: 'crop', limbW: 19, forearm: '#E0B48C', shin: '#E0B48C', fingers: true, collar: 'round',
  },
  // "Hẻm Có Chuyện — Tập 01: Tin nhắn chưa gửi" (Bản 3 / Concept v4: Duy 16t, Thảo 8t, Ông Lộc ~60t)
  duy: {
    skin: '#E8BC96', skinShade: '#CC9C74', hand: '#E8BC96',
    jacket: '#566A7A', jacketShade: '#3F505E', accent: '#485A68',
    limb: '#273042', line: '#15141C', shoe: '#D2C9B8', face: C.ink, hair: '#1E1A1D',
    extra: 'spiky', limbW: 17, forearm: '#E8BC96', fingers: true, collar: 'round', mendedHem: true,
  },
  thao: {
    skin: '#F0CCA8', skinShade: '#D6B08C', hand: '#F0CCA8',
    jacket: '#DFC17B', jacketShade: '#C2A35E', accent: '#D6453A',
    limb: '#6D7F6B', line: '#18161C', shoe: '#4A5D4E', face: C.ink, hair: '#231B1D',
    extra: 'thaoHair', limbW: 14, forearm: '#F0CCA8', shin: '#F0CCA8', fingers: true, collar: 'round', bottom: 'shorts', feminine: true, mendedHem: true, accessory: 'thaoTote',
  },
  ongLoc: {
    skin: '#D29F74', skinShade: '#B38058', hand: '#D29F74',
    jacket: '#4E463F', jacketShade: '#38312C', accent: '#8C7A6B',
    limb: '#543A28', line: '#141110', shoe: '#4A3322', face: '#141110', hair: '#3E3C3B',
    extra: 'locHair', limbW: 17, forearm: '#D29F74', fingers: true, collar: 'shirt', pocketPens: true, ageLines: true, glassesDefault: true,
  },
  // CHAR-ME (Mẹ của Duy & Thảo, ~38–42 tuổi ở C6–C7: áo vải màu đất sáng, quần tối, tóc buộc thấp giản dị)
  meDuyThao: {
    skin: '#ECC4A0', skinShade: '#D2A680', hand: '#ECC4A0',
    jacket: '#D4B692', jacketShade: '#B59572', accent: '#EAE0CE',
    limb: '#2D2A34', line: '#16141C', shoe: '#584132', face: C.ink, hair: '#20181A',
    extra: 'lowTie', limbW: 16, forearm: '#ECC4A0', fingers: true, collar: 'shirt', feminine: true,
  },
  // --- 18 New User-Requested Characters ---
  // 1. Cô gái tóc dài mặc váy (Tóc xoăn sóng dài bồng bềnh, mái bay, kẹp ngọc trai)
  girlDress: {
    skin: '#F9E8DC', skinShade: '#E8C8B6', hand: '#F9E8DC',
    jacket: '#E87A82', jacketShade: '#C95D66', accent: '#FDF6ED',
    limb: '#F9E8DC', line: '#1C1820', shoe: '#FFFFFF', face: '#1C1820', hair: '#24181E',
    extra: 'longWave', collar: 'round', bottom: 'skirt', limbW: 15, fingers: true, forearm: '#F9E8DC', shin: '#F9E8DC', feminine: true,
  },
  // 2. Anh chàng xăm hình (Tóc slick-back fade kẻ vạch, sẹo chân mày, hình xăm kín tay)
  tattooGuy: {
    skin: '#DCA478', skinShade: '#C08860', hand: '#DCA478',
    jacket: '#232128', jacketShade: '#16141A', accent: '#E2A03F',
    limb: '#323846', line: '#141218', shoe: '#E84A3B', face: '#141218', hair: '#18161E',
    extra: 'slickBack', collar: 'tankTop', forearm: '#DCA478', tattoo: true, accessory: 'chain', limbW: 20, fingers: true, browSlit: true,
  },
  // 3. Ông chú béo đầu hói bụng bia
  fatUncle: {
    skin: '#E2B38A', skinShade: '#C69368', hand: '#E2B38A',
    jacket: '#F4F0E8', jacketShade: '#D6CEBE', accent: '#48607A',
    limb: '#4A5868', line: '#161418', shoe: '#3E3A36', face: '#161418', hair: '#423A3E',
    extra: 'baldRing', collar: 'tankTop', body: 'chubby', bottom: 'shorts', forearm: '#E2B38A', shin: '#E2B38A', limbW: 22, fingers: true, moustache: true, ageLines: true,
  },
  // 4. Em bé sơ sinh quấn tã
  baby: {
    skin: '#FFECE0', skinShade: '#F5D2C2', hand: '#FFECE0',
    jacket: '#A8DADC', jacketShade: '#85BFC2', accent: '#FFB5A7',
    limb: '#A8DADC', line: '#262330', shoe: '#FFECE0', face: '#262330', hair: '#3A2A20',
    extra: 'babyHood', collar: 'round', body: 'swaddle', limbW: 14, fingers: false,
  },
  // 5. Học sinh nam 1 (Khăn quàng đỏ, tóc nấm học sinh cấp 2)
  studentBoy1: {
    skin: '#F2D2B4', skinShade: '#D8B290', hand: '#F2D2B4',
    jacket: '#FFFFFF', jacketShade: '#DDD8CD', accent: '#D62828',
    limb: '#243354', line: '#14131C', shoe: '#3A4048', face: '#14131C', hair: '#1E1A22',
    extra: 'bowlCut', collar: 'shirt', accessory: 'redScarf', forearm: '#F2D2B4', limbW: 16, fingers: true,
  },
  // 6. Học sinh nam 2 (Cấp 3 năng động, tóc tỉa layer nhọn, túi quai chéo)
  studentBoy2: {
    skin: '#E8BE9A', skinShade: '#CDA07A', hand: '#E8BE9A',
    jacket: '#F8F6F0', jacketShade: '#D9D4C7', accent: '#3D5A80',
    limb: '#2C3647', line: '#14131C', shoe: '#E05A47', face: '#14131C', hair: '#201A18',
    extra: 'spiky', collar: 'shirt', accessory: 'slingBag', forearm: '#E8BE9A', limbW: 17, fingers: true,
  },
  // 7. Học sinh nam 3 (Mọt sách kính cận tròn, tóc rẽ ngôi 7/3 có chỏm)
  studentBoy3: {
    skin: '#F4D6BC', skinShade: '#DAB698', hand: '#F4D6BC',
    jacket: '#F0EEE9', jacketShade: '#D2CFC5', accent: '#2A4B7C',
    limb: '#323D4E', line: '#14131C', shoe: '#2C2B30', face: '#14131C', hair: '#1A1820',
    extra: 'sidePart', collar: 'shirt', glassesDefault: true, forearm: '#F4D6BC', limbW: 16, fingers: true,
  },
  // 8. Học sinh nữ 1 (Khăn quàng đỏ, tóc đuôi ngựa cao S-curve, mái thưa, chân váy xếp ly)
  studentGirl1: {
    skin: '#FBE9DC', skinShade: '#E8C9B8', hand: '#FBE9DC',
    jacket: '#FFFFFF', jacketShade: '#DCD6CB', accent: '#D62828',
    limb: '#253556', line: '#161420', shoe: '#FFFFFF', face: '#161420', hair: '#1C1620',
    extra: 'highPonytail', collar: 'shirt', accessory: 'redScarf', bottom: 'skirt', forearm: '#FBE9DC', shin: '#FBE9DC', limbW: 15, fingers: true, feminine: true,
  },
  // 9. Học sinh nữ 2 (Nữ sinh cấp 3 duyên dáng, tóc thẳng dài suôn mượt cài kẹp tăm)
  studentGirl2: {
    skin: '#F9E4D4', skinShade: '#E6C3B0', hand: '#F9E4D4',
    jacket: '#FDFDFD', jacketShade: '#D9D6D0', accent: '#457B9D',
    limb: '#283850', line: '#161420', shoe: '#3A3642', face: '#161420', hair: '#16131C',
    extra: 'longHair', collar: 'shirt', bottom: 'skirt', forearm: '#F9E4D4', shin: '#F9E4D4', limbW: 15, fingers: true, feminine: true,
  },
  // 10. Học sinh nữ 3 (Tóc tết hai bên thắt nơ, kính cận tròn dễ thương, áo gile đồng phục)
  studentGirl3: {
    skin: '#FAE5D6', skinShade: '#E6C4B2', hand: '#FAE5D6',
    jacket: '#4A607A', jacketShade: '#36485E', accent: '#E63946',
    limb: '#384860', line: '#161420', shoe: '#8C5A48', face: '#161420', hair: '#24181E',
    extra: 'braids', collar: 'shirt', glassesDefault: true, bottom: 'skirt', forearm: '#FAE5D6', shin: '#FAE5D6', limbW: 15, fingers: true, feminine: true,
  },
  // 11. Cô giáo mặc Áo Dài truyền thống (Búi tóc thấp cài trâm ngọc trai, mái lệch dịu dàng)
  teacherAoDai: {
    skin: '#F9E6D8', skinShade: '#E6C6B4', hand: '#F9E6D8',
    jacket: '#E76F51', jacketShade: '#C8553D', accent: '#F4A261',
    limb: '#FAF7F2', line: '#18141D', shoe: '#EAE4DC', face: '#18141D', hair: '#1A141C',
    extra: 'aoDaiBun', collar: 'aoDai', bottom: 'aoDai', forearm: '#F9E6D8', limbW: 15, fingers: true, feminine: true,
  },
  // 12. Thầy giáo thể dục (Tóc cua thể thao + băng đô trán, áo polo, còi đeo cổ)
  peTeacher: {
    skin: '#DCA880', skinShade: '#BF8860', hand: '#DCA880',
    jacket: '#2A6F97', jacketShade: '#1D5273', accent: '#F4A261',
    limb: '#1D2D44', line: '#14121A', shoe: '#E63946', face: '#14121A', hair: '#1C181C',
    extra: 'sportyCrew', collar: 'polo', accessory: 'whistle', forearm: '#DCA880', limbW: 20, fingers: true,
  },
  // 13. Cô nhân viên văn phòng 1 (Tóc ngang vai uốn cụp chữ C, bông tai ngọc trai, sơ mi lụa, váy bút chì)
  officeLady1: {
    skin: '#F8E5D7', skinShade: '#E5C5B3', hand: '#F8E5D7',
    jacket: '#EDECE8', jacketShade: '#D0CDC3', accent: '#1E3A8A',
    limb: '#1E1F29', line: '#16141E', shoe: '#22222E', face: '#16141E', hair: '#261A20',
    extra: 'cCurlLob', collar: 'shirt', accessory: 'lanyard', bottom: 'pencilSkirt', forearm: '#F8E5D7', shin: '#F8E5D7', limbW: 15, fingers: true, feminine: true,
  },
  // 14. Cô nhân viên văn phòng 2 (Tóc xoăn sóng lơi công sở, kính cận tròn, blazer lịch thiệp)
  officeLady2: {
    skin: '#FAE7DA', skinShade: '#E6C6B5', hand: '#FAE7DA',
    jacket: '#475569', jacketShade: '#334155', accent: '#F8FAFC',
    limb: '#334155', line: '#14151E', shoe: '#1E293B', face: '#14151E', hair: '#38241E',
    extra: 'officeWave', collar: 'shirt', accessory: 'lanyard', forearm: '#FAE7DA', limbW: 15, fingers: true, glassesDefault: true, feminine: true,
  },
  // 15. Bác bảo vệ (Đồng phục xanh dương, cầu vai, mũ kepi, tóc mai điểm bạc)
  guard: {
    skin: '#D6A680', skinShade: '#B88660', hand: '#D6A680',
    jacket: '#3B82F6', jacketShade: '#2563EB', accent: '#FBBF24',
    limb: '#1E293B', line: '#121620', shoe: '#0F172A', face: '#121620', hair: '#64748B',
    extra: 'guardCap', hat: '#1E293B', collar: 'shirt', accessory: 'epauletsGuard', forearm: '#D6A680', limbW: 19, fingers: true, ageLines: true, moustache: true,
  },
  // 16. Chú công an (Sắc phục xanh rêu CAND, ve áo quân hàm đỏ sao vàng)
  police: {
    skin: '#E2B894', skinShade: '#C69A74', hand: '#E2B894',
    jacket: '#4D6A42', jacketShade: '#3A5231', accent: '#DC2626',
    limb: '#3A5231', line: '#121812', shoe: '#1C1917', face: '#121812', hair: '#1A1A1C',
    extra: 'policeCap', hat: '#4D6A42', collar: 'shirt', accessory: 'epauletsPolice', forearm: '#E2B894', limbW: 19, fingers: true,
  },
  // 17. Thanh niên trẻ trâu (Tóc mullet nhuộm vàng cháy, sẹo mày, áo phông rộng streetwear, túi chéo)
  youngPunk: {
    skin: '#E4BA95', skinShade: '#C89C76', hand: '#E4BA95',
    jacket: '#E76F51', jacketShade: '#CB5538', accent: '#F4A261',
    limb: '#374151', line: '#15141C', shoe: '#E11D48', face: '#15141C', hair: '#F59E0B',
    extra: 'mulletBlonde', collar: 'round', accessory: 'slingBag', forearm: '#E4BA95', shin: '#E4BA95', limbW: 18, fingers: true, browSlit: true,
  },
  // 18. Thanh niên nghiêm túc (Tóc dấu phẩy Hàn Quốc, kính cận tròn, sơ mi đóng thùng chỉn chu)
  seriousGuy: {
    skin: '#F2D5BC', skinShade: '#D8B598', hand: '#F2D5BC',
    jacket: '#E2E8F0', jacketShade: '#CBD5E1', accent: '#1E293B',
    limb: '#1E293B', line: '#0F172A', shoe: '#020617', face: '#0F172A', hair: '#0F172A',
    extra: 'commaHair', collar: 'shirt', glassesDefault: true, forearm: '#F2D5BC', limbW: 17, fingers: true, pocket: true,
  },
};

// ---------- the hero ----------
/** Articulated hand poses: open, pointing, clenched fist, holding a prop, waving, palm up (explaining/asking), pinching (pen/card), or relaxed at rest. */
export type HandKind = 'open' | 'point' | 'fist' | 'hold' | 'wave' | 'palmUp' | 'pinch' | 'rest';

export type Expr =
  | 'neutral'
  | 'happy'
  | 'smug'
  | 'shock'
  | 'worried'
  | 'oops'
  | 'cool'
  | 'dizzy'
  | 'tired'
  | 'sad'
  | 'cry'
  | 'smile'
  | 'relieved'
  | 'scared'
  | 'determined'
  | 'angry'
  | 'guilty'
  | 'sigh'
  | 'thinking'
  | 'surprised'
  | 'pain';

export type Limb = { a: number; b: number }; // a: upper segment angle, b: bend of the lower segment (degrees)
export type Pose = {
  x: number;
  y: number; // hip point
  scale: number;
  facing: 1 | -1;
  tilt: number; // torso lean around the hips, degrees, + leans screen-right
  spin: number; // whole-body rotation around the chest (tumbles)
  headTilt: number;
  armL: Limb;
  armR: Limb;
  legL: Limb;
  legR: Limb;
  expr: Expr;
  blink: number; // 0 open, 1 shut
  look: number; // -1..1 eye offset
  glasses: number; // 0..1
  yaw: number; // -1 profile facing screen-left, 0 front, 1 profile facing screen-right
  squash: number; // + squashes (landing), - stretches (jump), about the feet
  handL: HandKind;
  handR: HandKind;
  sway: number; // secondary motion: how far loose things (the hood's drawstrings) swing, degrees-ish
  glint?: number; // 0..1 the eyes light up in the power's colour (set it after poseAt: it isn't interpolated)
  glintColor?: string;
  talk?: number; // 0..1 the mouth open while speaking
  mouthShape?: MouthShape;
  lipTremble?: number; // signed face-local motion; drive from the shot clock
  cloth?: number; // small secondary hem/fold movement, -1..1
  shoulderLift?: number; // -1..1 shrug (>0) or slump (<0)
};

export const basePose: Pose = {
  x: 960,
  y: 700,
  scale: 1,
  facing: 1,
  tilt: 0,
  spin: 0,
  headTilt: 0,
  armL: { a: 10, b: -8 },
  armR: { a: 10, b: -8 },
  legL: { a: -5, b: 0 },
  legR: { a: 5, b: 0 },
  expr: 'neutral',
  blink: 0,
  look: 0,
  glasses: 0,
  yaw: 0,
  squash: 0,
  handL: 'open',
  handR: 'open',
  sway: 0,
  shoulderLift: 0,
};

type Key = { f: number; p: Partial<Pose>; ease?: (t: number) => number };

/** Deterministic close–hold–open blink; different seeds keep faces out of sync. */
export const blinkAt = (t: number, seed = 0) => {
  const period = 75 + ((seed * 37) % 45 + 45) % 45;
  const phase = ((t + seed * 17) % period + period) % period;
  if (phase >= 7) return 0;
  if (phase < 2) return Math.sin(phase * Math.PI / 4);
  if (phase < 3) return 1;
  return Math.cos((phase - 3) * Math.PI / 8) ** 2;
};

/** Subtle breathing motion for holds so standing/sitting characters feel alive without distracting from dialogue. */
export const breatheAt = (t: number, seed = 0): Partial<Pose> => {
  const ph = t * 0.045 + seed * 1.7;
  return {
    shoulderLift: Math.sin(ph) * 0.12,
    headTilt: Math.sin(ph - 0.5) * 0.55,
    cloth: Math.sin(ph - 0.3) * 0.35,
    blink: blinkAt(t, seed),
  };
};

const mixLimb = (a: Limb, b: Limb, t: number): Limb => ({ a: lerp(a.a, b.a, t), b: lerp(a.b, b.b, t) });

/** Interpolates every numeric part of a pose between keys; the face swaps (never morphs) at its key. */
export const poseAt = (f: number, keys: Key[], from: Pose = basePose): Pose => {
  const full: { f: number; p: Pose; ease?: (t: number) => number }[] = [];
  let cur = from;
  for (const k of keys) {
    cur = { ...cur, ...k.p };
    full.push({ f: k.f, p: cur, ease: k.ease });
  }
  if (f <= full[0].f) return full[0].p;
  for (let i = 0; i < full.length - 1; i++) {
    const A = full[i];
    const B = full[i + 1];
    if (f <= B.f) {
      const t = (B.ease ?? easeInOut)((f - A.f) / Math.max(1e-6, B.f - A.f));
      return {
        x: lerp(A.p.x, B.p.x, t),
        y: lerp(A.p.y, B.p.y, t),
        scale: lerp(A.p.scale, B.p.scale, t),
        facing: t < 0.5 ? A.p.facing : B.p.facing,
        tilt: lerp(A.p.tilt, B.p.tilt, t),
        spin: lerp(A.p.spin, B.p.spin, t),
        headTilt: lerp(A.p.headTilt, B.p.headTilt, t),
        armL: mixLimb(A.p.armL, B.p.armL, t),
        armR: mixLimb(A.p.armR, B.p.armR, t),
        legL: mixLimb(A.p.legL, B.p.legL, t),
        legR: mixLimb(A.p.legR, B.p.legR, t),
        expr: A.p.expr,
        handL: A.p.handL,
        handR: A.p.handR,
        blink: lerp(A.p.blink, B.p.blink, t),
        look: lerp(A.p.look, B.p.look, t),
        glasses: lerp(A.p.glasses, B.p.glasses, t),
        yaw: lerp(A.p.yaw, B.p.yaw, t),
        squash: lerp(A.p.squash, B.p.squash, t),
        sway: lerp(A.p.sway, B.p.sway, t),
        shoulderLift: lerp(A.p.shoulderLift ?? 0, B.p.shoulderLift ?? 0, t),
        talk: A.p.talk !== undefined || B.p.talk !== undefined ? lerp(A.p.talk ?? 0, B.p.talk ?? 0, t) : undefined,
        mouthShape: f >= B.f ? B.p.mouthShape : A.p.mouthShape,
        lipTremble: lerp(A.p.lipTremble ?? 0, B.p.lipTremble ?? 0, t),
        cloth: lerp(A.p.cloth ?? 0, B.p.cloth ?? 0, t),
        glint: A.p.glint !== undefined || B.p.glint !== undefined ? lerp(A.p.glint ?? 0, B.p.glint ?? 0, t) : undefined,
        glintColor: B.p.glintColor ?? A.p.glintColor,
      };
    }
  }
  return full[full.length - 1].p;
};

// body measurements (local space: hips at 0,0, y down)
const UPPER_ARM = 52;
const FORE_ARM = 46;
const THIGH = 72;
const SHIN = 68;
const SHOULDER = { x: 42, y: -108 };
const HIP = { x: 24, y: 0 };
export const HEAD = { x: 0, y: -176, r: 62 };
export const LEG_LEN = THIGH + SHIN;

const rad = (d: number) => (d * Math.PI) / 180;
type P = { x: number; y: number };
const rot = (p: P, deg: number, c: P = { x: 0, y: 0 }): P => {
  const r = rad(deg);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return { x: c.x + dx * Math.cos(r) - dy * Math.sin(r), y: c.y + dx * Math.sin(r) + dy * Math.cos(r) };
};

/** How wide the body reads as it turns: full width face-on, about 60% in profile. */
export const turnWidth = (yaw: number) => 1 - 0.4 * Math.min(1, Math.abs(yaw));
/** Shoulders and hips close up as he turns, so in profile the limbs overlap the body. */
export const limbSpread = (yaw: number) => 1 - 0.85 * Math.min(1, Math.abs(yaw));

/** Joint positions in local space (before the hip translate/scale), so scenes can attach props to hands. */
export const joints = (pose: Pose) => {
  const ay = Math.min(1, Math.abs(pose.yaw));
  const faceDir: 1 | -1 = pose.yaw < 0 ? -1 : pose.yaw > 0 ? 1 : pose.facing;
  const side = (s: 1 | -1, rawLimb: Limb, root: P, l1: number, l2: number, isLeg: boolean) => {
    const dir = isLeg ? pose.facing : s;
    let limb = rawLimb;
    // Ensure default/rest standing arms always bend their elbows BACKWARD (forearm forward in faceDir)
    if (!isLeg && rawLimb.a === 10 && rawLimb.b === -8) {
      limb = s === faceDir ? { a: 12, b: -4 } : { a: 16, b: -8 };
    }
    const d1 = { x: dir * Math.sin(rad(limb.a)), y: Math.cos(rad(limb.a)) };
    const mid = { x: root.x + d1.x * l1, y: root.y + d1.y * l1 };
    const a2 = limb.a + limb.b;
    const d2 = { x: dir * Math.sin(rad(a2)), y: Math.cos(rad(a2)) };
    return { root, mid, end: { x: mid.x + d2.x * l2, y: mid.y + d2.y * l2 } };
  };
  const torsoRot = (p: P) => rot(p, pose.tilt);
  const sp = limbSpread(pose.yaw);
  const lift = (pose.shoulderLift ?? 0) * -8;
  // Pull near shoulder slightly back toward the shoulder socket when turned in 3/4 or profile
  const nearPull = Math.max(0, ay - 0.25) * 18;
  const shL = { x: -SHOULDER.x * sp + pose.yaw * 6 + (faceDir === -1 ? nearPull : 0), y: SHOULDER.y + lift };
  const shR = { x: SHOULDER.x * sp + pose.yaw * 6 - (faceDir === 1 ? nearPull : 0), y: SHOULDER.y + lift };
  const armL = side(-1, pose.armL, shL, UPPER_ARM, FORE_ARM, false);
  const armR = side(1, pose.armR, shR, UPPER_ARM, FORE_ARM, false);
  const legL = side(-1, pose.legL, { x: -HIP.x * sp, y: 0 }, THIGH, SHIN, true);
  const legR = side(1, pose.legR, { x: HIP.x * sp, y: 0 }, THIGH, SHIN, true);
  const r = (o: { root: P; mid: P; end: P }) => ({ root: torsoRot(o.root), mid: torsoRot(o.mid), end: torsoRot(o.end) });
  return { armL: r(armL), armR: r(armR), legL, legR, head: torsoRot(HEAD) };
};

/** Face swaps happen through a blink: two frames shut either side of each change, as in the genre. */
export const faceAt = (f: number, keys: [number, Expr][]): { expr: Expr; blink: number } => {
  let expr = keys[0][1];
  let blink = 0;
  for (let i = 0; i < keys.length; i++) {
    const [k, e] = keys[i];
    if (f >= k) expr = e;
    if (i > 0 && f >= k - 2 && f < k + 1) blink = 1;
  }
  return { expr, blink };
};

/** A local point to world space, for attaching props (the mug in Pip's hand). */
export const toWorld = (pose: Pose, p: P): P => {
  const spun = rot(p, pose.spin, { x: 0, y: -90 });
  return { x: pose.x + spun.x * pose.scale, y: pose.y + spun.y * pose.scale };
};

/** World-space position and angle of a character's left or right hand, ready to attach any held prop without drift. */
export const handWorld = (pose: Pose, side: 'L' | 'R' = 'R') => {
  const j = joints(pose);
  const arm = side === 'L' ? j.armL : j.armR;
  const pt = toWorld(pose, arm.end);
  const mid = toWorld(pose, arm.mid);
  const angle = (Math.atan2(pt.x - mid.x, pt.y - mid.y) * 180) / Math.PI;
  return { x: pt.x, y: pt.y, angle };
};

/** Straight-arm reach: the right arm angle (local) that points the hand at a world target. */
export const reachAngle = (pose: Pose, target: P) => {
  const sh = toWorld(pose, rot({ x: SHOULDER.x * limbSpread(pose.yaw) + pose.yaw * 6, y: SHOULDER.y }, pose.tilt));
  const world = (Math.atan2(target.x - sh.x, target.y - sh.y) * 180) / Math.PI; // 0 = straight down
  return world - pose.tilt;
};

const Face: React.FC<{
  expr: Expr;
  blink: number;
  look: number;
  glasses: number;
  yaw?: number;
  ink?: string;
  skinShade?: string;
  glint?: number;
  glintColor?: string;
  talk?: number;
  mouthShape?: MouthShape;
  lipTremble?: number;
  ageLines?: boolean;
  moustache?: boolean;
  hairColor?: string;
  readingGlasses?: boolean;
  feminine?: boolean;
  browSlit?: boolean;
}> = ({
  expr,
  blink,
  look,
  glasses,
  yaw = 0,
  ink = C.ink,
  skinShade = C.skinShade,
  glint = 0,
  glintColor = '#8FF0FF',
  talk = 0,
  mouthShape = 'auto',
  lipTremble = 0,
  ageLines = false,
  moustache = false,
  hairColor = C.ink,
  readingGlasses = false,
  feminine = false,
  browSlit = false,
}) => {
  const ex = look * 7;
  const ay = Math.min(1, Math.abs(yaw));
  const farHidden = ay > 0.72;
  const farSide = yaw > 0 ? -1 : 1;
  const eyeY = HEAD.y - 4;
  // heavy lids: half shut when smug, cool, thinking or guilty; more when tired or sighing; also cold half-lowered lids for stoic elder (Ông Lộc)
  const coldElder = ageLines && !feminine && expr === 'neutral';
  const lid =
    expr === 'smug' || expr === 'cool' || expr === 'thinking'
      ? 0.42
      : coldElder
        ? 0.36
        : expr === 'guilty'
          ? 0.48
          : expr === 'tired' || expr === 'sigh'
            ? 0.58
            : 0;
  const open = Math.max(0.08, 1 - Math.max(blink, lid));

  const eye = (cx: number) => {
    if (farHidden && Math.sign(cx) === farSide) return null;
    const sg = cx < 0 ? 1 : -1; // + for the screen-left eye: its inner corner is on the right
    if (expr === 'happy') {
      return (
        <g>
          <path d={`M ${cx - 11} ${eyeY + 3} Q ${cx} ${eyeY - 10} ${cx + 11} ${eyeY + 3}`} stroke={ink} strokeWidth={5.8} fill="none" strokeLinecap="round" />
          {feminine ? (
            <path d={`M ${cx - sg * 10} ${eyeY + 1} L ${cx - sg * 15} ${eyeY - 3}`} stroke={ink} strokeWidth={2.6} strokeLinecap="round" />
          ) : null}
          <ellipse cx={cx + sg * -4} cy={eyeY + 14} rx={8} ry={4.2} fill="#E88A7A" opacity={0.32} />
        </g>
      );
    }
    if (expr === 'pain') {
      return (
        <path
          d={`M ${cx - 10} ${eyeY - 6} L ${cx + 4} ${eyeY + 1} L ${cx - 10} ${eyeY + 7}`}
          transform={cx > 0 ? `translate(${2 * cx},0) scale(-1,1)` : undefined}
          stroke={ink}
          strokeWidth={5.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    }
    if (expr === 'oops') {
      return (
        <path
          d={`M ${cx - 9} ${eyeY - 6} L ${cx + 4} ${eyeY} L ${cx - 9} ${eyeY + 6}`}
          transform={cx > 0 ? `translate(${2 * cx},0) scale(-1,1)` : undefined}
          stroke={ink}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    }
    if (expr === 'dizzy') {
      return (
        <g stroke={ink} strokeWidth={5} strokeLinecap="round">
          <path d={`M ${cx - 7} ${eyeY - 7} L ${cx + 7} ${eyeY + 7} M ${cx + 7} ${eyeY - 7} L ${cx - 7} ${eyeY + 7}`} />
        </g>
      );
    }
    if (expr === 'relieved' || expr === 'sigh') {
      return (
        <g>
          <path d={`M ${cx - 11} ${eyeY - 1} Q ${cx} ${eyeY + 9} ${cx + 11} ${eyeY - 1}`} stroke={ink} strokeWidth={5.2} fill="none" strokeLinecap="round" />
          {feminine ? (
            <path d={`M ${cx - sg * 10} ${eyeY} L ${cx - sg * 15} ${eyeY - 4}`} stroke={ink} strokeWidth={2.5} strokeLinecap="round" />
          ) : null}
          {expr === 'relieved' || feminine ? <ellipse cx={cx + sg * -4} cy={eyeY + 14} rx={7.5} ry={3.8} fill="#E88A7A" opacity={0.25} /> : null}
        </g>
      );
    }
    // shut (a blink's middle frame, or asleep): the closed lid's curve, with the tired rings kept
    if (blink >= 0.95) {
      return (
        <g>
          <path d={`M ${cx - 12} ${eyeY + 1} Q ${cx} ${eyeY + 8} ${cx + 12} ${eyeY + 1}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          {expr === 'tired' ? (
            <path d={`M ${cx - 12} ${eyeY + 15} Q ${cx} ${eyeY + 22} ${cx + 12} ${eyeY + 15}`} stroke="#8C7AA6" strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={0.85} />
          ) : null}
        </g>
      );
    }
    const big = expr === 'shock' || expr === 'scared' || expr === 'surprised';
    const sadEye = expr === 'sad' || expr === 'cry' || expr === 'guilty';
    const sharpEye = expr === 'determined' || expr === 'angry';
    const rx = expr === 'scared' || expr === 'surprised' ? 9.5 : big ? 11 : 7.5;
    const ry = (big ? 13 : sadEye || sharpEye ? 8.8 : expr === 'smile' ? 9.2 : 10.2) * open;
    return (
      <g>
        {/* subtle upper eyelid fold for depth */}
        {!big ? (
          <path d={`M ${cx - rx - 2} ${eyeY - ry - 3} Q ${cx} ${eyeY - ry - 7} ${cx + rx + 2} ${eyeY - ry - 3}`} stroke={skinShade} strokeWidth={2.2} fill="none" strokeLinecap="round" />
        ) : null}
        {/* Feminine curved eyelashes on outer upper corner */}
        {feminine ? (
          <g stroke={ink} strokeWidth={2.5} strokeLinecap="round" fill="none">
            <path d={`M ${cx + ex - sg * (rx - 1)} ${eyeY - ry * 0.45} Q ${cx + ex - sg * (rx + 5)} ${eyeY - ry - 1} ${cx + ex - sg * (rx + 7)} ${eyeY - ry - 4.5}`} />
            <path d={`M ${cx + ex - sg * (rx - 2)} ${eyeY - ry * 0.1} Q ${cx + ex - sg * (rx + 4)} ${eyeY - ry * 0.4} ${cx + ex - sg * (rx + 6)} ${eyeY - ry * 0.7}`} />
          </g>
        ) : null}
        <ellipse cx={cx + ex} cy={eyeY + (lid ? 3 : 0)} rx={rx} ry={ry} fill={ink} />
        {/* main catchlight and secondary micro-catchlight for lively eyes */}
        {open > 0.35 ? (
          <>
            <circle cx={cx + ex + (big ? 3.4 : 2.4)} cy={eyeY - (big ? 3.8 : 2.6) + (lid ? 2 : 0)} r={big ? 3.3 : 2.4} fill="#fff" opacity={0.95} />
            <circle cx={cx + ex - 2.2} cy={eyeY + 2.8 + (lid ? 1 : 0)} r={1.2} fill="#fff" opacity={0.65} />
          </>
        ) : null}
        {feminine && !sadEye && !sharpEye ? (
          <ellipse cx={cx + sg * -5} cy={eyeY + 15} rx={7.5} ry={3.5} fill="#F28B82" opacity={0.24} />
        ) : null}
        {sadEye ? <path d={`M ${cx - 12 * sg} ${eyeY + 1} Q ${cx} ${eyeY - 4} ${cx + 12 * sg} ${eyeY - 6}`} stroke={ink} strokeWidth={4} strokeLinecap="round" fill="none" /> : null}
        {sharpEye ? <path d={`M ${cx - 12 * sg} ${eyeY - 7} L ${cx + 12 * sg} ${eyeY - 1}`} stroke={ink} strokeWidth={4.2} strokeLinecap="round" fill="none" /> : null}
        {expr === 'smile' ? (
          <>
            <path d={`M ${cx - 10} ${eyeY + 13} Q ${cx} ${eyeY + 7} ${cx + 10} ${eyeY + 13}`} stroke={ink} strokeWidth={3.2} strokeLinecap="round" fill="none" opacity={0.65} />
            <ellipse cx={cx + sg * -4} cy={eyeY + 15} rx={7} ry={3.5} fill="#E88A7A" opacity={0.24} />
          </>
        ) : null}
        {expr === 'cry' ? (
          <>
            <path d={`M ${cx + 2 * sg} ${eyeY + 10} Q ${cx + 8 * sg} ${eyeY + 28} ${cx + 4 * sg} ${eyeY + 46}`} stroke="#8FD3FF" strokeWidth={6} strokeLinecap="round" fill="none" />
            <circle cx={cx - 3 * sg} cy={eyeY + 9} r={3.5} fill="#B8E4FF" opacity={0.9} />
          </>
        ) : null}
        {expr === 'sad' ? <path d={`M ${cx - 4 * sg} ${eyeY + 11} q 3 7 0 11 q -3 -4 0 -11 Z`} fill="#8FD3FF" opacity={0.9} /> : null}
        {lid ? (
          <path
            d={expr === 'tired' || expr === 'guilty' ? `M ${cx - 13} ${eyeY - 1} Q ${cx} ${eyeY - 5} ${cx + 13} ${eyeY - 1}` : `M ${cx - 12} ${eyeY - 4} L ${cx + 12} ${eyeY - 2}`}
            stroke={ink}
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
          />
        ) : null}
        {expr === 'tired' || expr === 'guilty' ? (
          <path
            d={`M ${cx - 11} ${eyeY + 14} Q ${cx} ${eyeY + 20} ${cx + 11} ${eyeY + 14}`}
            stroke="#8C7AA6"
            strokeWidth={expr === 'tired' ? 4.2 : 2.8}
            fill="none"
            strokeLinecap="round"
            opacity={expr === 'tired' ? 0.82 : 0.45}
          />
        ) : null}
      </g>
    );
  };

  const brows: Record<Expr, string> = {
    neutral: coldElder
      ? `M -34 ${eyeY - 22} L -10 ${eyeY - 18} M 10 ${eyeY - 18} L 34 ${eyeY - 22}`
      : `M -31 ${eyeY - 22} Q -21 ${eyeY - 25} -11 ${eyeY - 22} M 11 ${eyeY - 22} Q 21 ${eyeY - 25} 31 ${eyeY - 22}`,
    happy: `M -32 ${eyeY - 25} Q -21 ${eyeY - 31} -10 ${eyeY - 25} M 10 ${eyeY - 25} Q 21 ${eyeY - 31} 32 ${eyeY - 25}`,
    smug:
      ageLines && !feminine
        ? `M -34 ${eyeY - 21} L -10 ${eyeY - 18} M 10 ${eyeY - 19} L 34 ${eyeY - 24}`
        : `M -34 ${eyeY - 22} L -12 ${eyeY - 20} M 12 ${eyeY - 26} L 34 ${eyeY - 30}`,
    shock: `M -32 ${eyeY - 28} Q -21 ${eyeY - 36} -10 ${eyeY - 29} M 10 ${eyeY - 29} Q 21 ${eyeY - 36} 32 ${eyeY - 28}`,
    surprised: `M -32 ${eyeY - 29} Q -21 ${eyeY - 37} -10 ${eyeY - 29} M 10 ${eyeY - 29} Q 21 ${eyeY - 37} 32 ${eyeY - 29}`,
    worried: `M -32 ${eyeY - 18} L -12 ${eyeY - 26} M 12 ${eyeY - 26} L 32 ${eyeY - 18}`,
    oops: `M -32 ${eyeY - 20} L -12 ${eyeY - 16} M 12 ${eyeY - 16} L 32 ${eyeY - 20}`,
    cool: `M -32 ${eyeY - 22} L -11 ${eyeY - 21} M 11 ${eyeY - 21} L 32 ${eyeY - 22}`,
    dizzy: `M -32 ${eyeY - 22} Q -21 ${eyeY - 18} -11 ${eyeY - 24} M 11 ${eyeY - 20} Q 21 ${eyeY - 26} 32 ${eyeY - 20}`,
    tired: `M -33 ${eyeY - 17} Q -22 ${eyeY - 21} -11 ${eyeY - 19} M 11 ${eyeY - 19} Q 22 ${eyeY - 21} 33 ${eyeY - 17}`,
    sad: `M -33 ${eyeY - 14} Q -22 ${eyeY - 19} -11 ${eyeY - 27} M 11 ${eyeY - 27} Q 22 ${eyeY - 19} 33 ${eyeY - 14}`,
    cry: `M -34 ${eyeY - 12} Q -22 ${eyeY - 18} -10 ${eyeY - 29} M 10 ${eyeY - 29} Q 22 ${eyeY - 18} 34 ${eyeY - 12}`,
    smile: `M -32 ${eyeY - 23} Q -21 ${eyeY - 29} -10 ${eyeY - 25} M 10 ${eyeY - 25} Q 21 ${eyeY - 29} 32 ${eyeY - 23}`,
    relieved: `M -32 ${eyeY - 21} Q -21 ${eyeY - 26} -10 ${eyeY - 22} M 10 ${eyeY - 22} Q 21 ${eyeY - 26} 32 ${eyeY - 21}`,
    scared: `M -32 ${eyeY - 30} L -11 ${eyeY - 38} M 11 ${eyeY - 38} L 32 ${eyeY - 30}`,
    determined: `M -35 ${eyeY - 29} L -9 ${eyeY - 20} M 9 ${eyeY - 20} L 35 ${eyeY - 29}`,
    angry: `M -35 ${eyeY - 31} L -9 ${eyeY - 17} M 9 ${eyeY - 17} L 35 ${eyeY - 31}`,
    guilty: `M -33 ${eyeY - 15} Q -22 ${eyeY - 20} -10 ${eyeY - 26} M 10 ${eyeY - 24} Q 22 ${eyeY - 19} 33 ${eyeY - 16}`,
    sigh: `M -32 ${eyeY - 18} Q -21 ${eyeY - 22} -11 ${eyeY - 20} M 11 ${eyeY - 20} Q 21 ${eyeY - 22} 32 ${eyeY - 18}`,
    thinking: `M -33 ${eyeY - 20} L -11 ${eyeY - 19} M 11 ${eyeY - 26} Q 22 ${eyeY - 32} 33 ${eyeY - 26}`,
    pain: `M -33 ${eyeY - 25} L -10 ${eyeY - 16} M 10 ${eyeY - 16} L 33 ${eyeY - 25}`,
  };

  const mY = HEAD.y + 28;
  const mouth: Record<Expr, React.ReactNode> = {
    neutral: (
      <g>
        {feminine ? <ellipse cx={0} cy={mY + 2} rx={7.5} ry={3.2} fill="#E57373" opacity={0.45} /> : null}
        <path
          d={coldElder ? `M -12 ${mY + 4} Q 0 ${mY + 1} 12 ${mY + 4}` : `M -10 ${mY} Q 0 ${mY + 4} 10 ${mY}`}
          stroke={ink}
          strokeWidth={feminine ? 4.2 : 5}
          fill="none"
          strokeLinecap="round"
        />
      </g>
    ),
    happy: (
      <g>
        <path d={`M -18 ${mY - 4} Q 0 ${mY + 21} 18 ${mY - 4} Z`} fill={ink} stroke={ink} strokeWidth={2} strokeLinejoin="round" />
        <path d={`M -13 ${mY - 3} L 13 ${mY - 3}`} stroke="#FFFFFF" strokeWidth={3.5} strokeLinecap="round" />
        <ellipse cx={0} cy={mY + 7} rx={9} ry={4.5} fill="#D96B6B" />
      </g>
    ),
    smug:
      ageLines && !feminine ? (
        <path d={`M -12 ${mY + 4} Q 2 ${mY + 2} 14 ${mY - 2}`} stroke={ink} strokeWidth={4.8} fill="none" strokeLinecap="round" />
      ) : (
        <path d={`M -12 ${mY + 2} Q 4 ${mY + 8} 16 ${mY - 6}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />
      ),
    shock: (
      <g>
        <ellipse cx={0} cy={mY + 4} rx={10} ry={14} fill={ink} />
        <ellipse cx={0} cy={mY + 11} rx={6} ry={4} fill="#C95B5B" />
      </g>
    ),
    surprised: <ellipse cx={0} cy={mY + 3} rx={8} ry={10} fill={ink} />,
    worried: <path d={`M -16 ${mY + 4} Q -8 ${mY - 4} 0 ${mY + 4} Q 8 ${mY + 12} 16 ${mY + 4}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    oops: (
      <g>
        <rect x={-18} y={mY - 6} width={36} height={16} rx={6} fill={ink} />
        <path d={`M -14 ${mY + 2} L 14 ${mY + 2}`} stroke="#fff" strokeWidth={3} />
      </g>
    ),
    cool: <path d={`M -12 ${mY + 2} Q 4 ${mY + 8} 16 ${mY - 6}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    dizzy: <path d={`M -14 ${mY + 4} Q -7 ${mY - 4} 0 ${mY + 4} Q 7 ${mY + 12} 14 ${mY + 4}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    tired: <path d={`M -11 ${mY + 4} Q 0 ${mY} 11 ${mY + 4}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    sad: <path d={`M -13 ${mY + 7} Q 0 ${mY - 5} 13 ${mY + 7}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    cry: (
      <g>
        <path d={`M -15 ${mY + 11} Q 0 ${mY - 8} 15 ${mY + 11} Q 0 ${mY + 3} -15 ${mY + 11} Z`} fill={ink} stroke={ink} strokeWidth={3} strokeLinejoin="round" />
        <path d={`M -10 ${mY + 3} Q 0 ${mY - 1} 10 ${mY + 3}`} stroke="#FFFFFF" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </g>
    ),
    smile: (
      <g>
        {feminine ? <path d={`M -12 ${mY + 1} Q 0 ${mY + 12} 12 ${mY + 1} Q 0 ${mY + 5} -12 ${mY + 1} Z`} fill="#E57373" opacity={0.5} /> : null}
        <path d={`M -15 ${mY - 2} Q 0 ${mY + 13} 15 ${mY - 2}`} stroke={ink} strokeWidth={feminine ? 4.4 : 5} fill="none" strokeLinecap="round" />
      </g>
    ),
    relieved: <path d={`M -11 ${mY} Q 0 ${mY + 9} 11 ${mY}`} stroke={ink} strokeWidth={feminine ? 4.2 : 5} fill="none" strokeLinecap="round" />,
    scared: (
      <g>
        <ellipse cx={0} cy={mY + 5} rx={11} ry={9} fill={ink} />
        <path d={`M -8 ${mY - 1} L 8 ${mY - 1}`} stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
      </g>
    ),
    determined: <path d={`M -13 ${mY + 3} L 13 ${mY + 3}`} stroke={ink} strokeWidth={5.8} fill="none" strokeLinecap="round" />,
    angry: (
      <g>
        <path d={`M -15 ${mY + 7} Q 0 ${mY - 5} 15 ${mY + 7}`} stroke={ink} strokeWidth={5.5} fill="none" strokeLinecap="round" />
        <path d={`M -6 ${eyeY - 16} L -3 ${eyeY - 10} M 6 ${eyeY - 16} L 3 ${eyeY - 10}`} stroke={skinShade} strokeWidth={2.5} strokeLinecap="round" />
      </g>
    ),
    guilty: <path d={`M -12 ${mY + 5} Q -3 ${mY + 1} 10 ${mY + 6}`} stroke={ink} strokeWidth={4.8} fill="none" strokeLinecap="round" />,
    sigh: <ellipse cx={0} cy={mY + 4} rx={6.5} ry={4.5} fill={ink} />,
    thinking: <path d={`M -9 ${mY + 3} L 7 ${mY + 1}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    pain: (
      <g>
        <rect x={-16} y={mY - 4} width={32} height={13} rx={5} fill={ink} />
        <path d={`M -12 ${mY + 2.5} L 12 ${mY + 2.5}`} stroke="#fff" strokeWidth={2.8} />
      </g>
    ),
  };

  const noseX = yaw * 6;
  return (
    <g transform={`translate(${yaw * 30} 0) scale(${1 - 0.28 * ay} 1)`}>
      {/* subtle nose bridge & tip for 3D facial depth */}
      <path
        d={`M ${noseX} ${eyeY + 3} L ${noseX + (yaw >= 0 ? 4 : -4)} ${eyeY + 16} L ${noseX} ${eyeY + 18}`}
        stroke={skinShade}
        strokeWidth={3.2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {ageLines ? (
        <g stroke={skinShade} strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.8}>
          <path d={`M -26 ${eyeY + 16} Q -18 ${eyeY + 22} -14 ${eyeY + 20}`} />
          <path d={`M 26 ${eyeY + 16} Q 18 ${eyeY + 22} 14 ${eyeY + 20}`} />
          <path d={`M -18 ${mY - 8} Q -22 ${mY + 2} -18 ${mY + 10}`} />
          <path d={`M 18 ${mY - 8} Q 22 ${mY + 2} 18 ${mY + 10}`} />
        </g>
      ) : null}
      {eye(-21)}
      {eye(21)}
      {brows[expr] ? (
        <g>
          <path d={brows[expr]} stroke={ink} strokeWidth={feminine ? 3.8 : 4.8} fill="none" strokeLinecap="round" />
          {browSlit ? (
            <path d={`M 25 ${eyeY - 28} L 28 ${eyeY - 18}`} stroke={skinShade} strokeWidth={3.2} strokeLinecap="round" />
          ) : null}
        </g>
      ) : null}
      {moustache ? (
        <path d={`M -18 ${mY - 4} Q 0 ${mY - 11} 18 ${mY - 4} Q 9 ${mY - 2} 0 ${mY - 5} Q -9 ${mY - 2} -18 ${mY - 4} Z`} fill={hairColor} stroke={ink} strokeWidth={1.5} />
      ) : null}
      {mouthShape !== 'auto' || talk > 0.08 ? (
        <ArticulatedMouth shape={mouthShape === 'auto' ? 'a' : mouthShape} open={talk} y={mY} ink={ink} shade={skinShade} tremble={lipTremble} />
      ) : (
        <g transform={`translate(${clamp(lipTremble, -1, 1) * 1.2} 0)`}>{mouth[expr]}</g>
      )}
      {expr === 'shock' || expr === 'oops' || expr === 'scared' || expr === 'worried' || expr === 'tired' ? (
        <path d={`M 52 ${HEAD.y - 30} q 6 10 0 16 q -6 -6 0 -16 Z`} fill="#8FD3FF" opacity={expr === 'worried' || expr === 'tired' ? 0.78 : 1} />
      ) : null}
      {/* a power lighting the eyes: a soft halo, a bright iris, a white catchlight (none while the lids are shut) */}
      {glint > 0.01 && blink < 0.95
        ? [-21, 21].map((cx) =>
            farHidden && Math.sign(cx) === farSide ? null : (
              <g key={`gl${cx}`} opacity={Math.min(1, glint)}>
                <circle cx={cx + ex} cy={eyeY} r={17} fill={glintColor} opacity={0.2} />
                <circle cx={cx + ex} cy={eyeY} r={12} fill={glintColor} opacity={0.28} />
                <ellipse cx={cx + ex} cy={eyeY + (lid ? 3 : 0)} rx={8} ry={Math.max(2, 11 * open)} fill={glintColor} />
                <circle cx={cx + ex + 2.5} cy={eyeY - 3} r={2.6} fill="#FFFFFF" />
              </g>
            ),
          )
        : null}
      {/* Round clear prescription glasses (kính cận tròn trong suốt) */}
      {readingGlasses && glasses <= 0.01 ? (
        <g>
          <circle cx={-21} cy={eyeY} r={16} fill="rgba(210, 242, 255, 0.16)" stroke={ink} strokeWidth={3.1} />
          <circle cx={21} cy={eyeY} r={16} fill="rgba(210, 242, 255, 0.16)" stroke={ink} strokeWidth={3.1} />
          <path d={`M -5 ${eyeY - 2} Q 0 ${eyeY - 7} 5 ${eyeY - 2}`} stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d={`M -37 ${eyeY - 2} L -52 ${eyeY - 4} M 37 ${eyeY - 2} L 52 ${eyeY - 4}`} stroke={ink} strokeWidth={2.6} strokeLinecap="round" />
          <path d={`M -30 ${eyeY - 9} L -24 ${eyeY - 3} M 12 ${eyeY - 9} L 18 ${eyeY - 3}`} stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" opacity={0.75} />
        </g>
      ) : null}
      {glasses > 0.01 ? (
        <g opacity={glasses} transform={`translate(0 ${(1 - glasses) * -60})`}>
          <path d={`M -58 ${eyeY - 12} L 58 ${eyeY - 12}`} stroke={ink} strokeWidth={6} strokeLinecap="round" />
          <path d={`M -50 ${eyeY - 14} L -6 ${eyeY - 14} L -10 ${eyeY + 8} Q -28 ${eyeY + 18} -46 ${eyeY + 8} Z`} fill="#0D0F1C" stroke={ink} strokeWidth={3} />
          <path d={`M 6 ${eyeY - 14} L 50 ${eyeY - 14} L 46 ${eyeY + 8} Q 28 ${eyeY + 18} 10 ${eyeY + 8} Z`} fill="#0D0F1C" stroke={ink} strokeWidth={3} />
          <path d={`M -40 ${eyeY + 2} L -26 ${eyeY - 10} M 16 ${eyeY + 2} L 30 ${eyeY - 10}`} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
        </g>
      ) : null}
    </g>
  );
};

/** Where a bunch sits as the head turns: both high on the sides face-on; turned, both slide round to the back of the head. */
const bunchAt = (sd: number, yaw: number) => {
  const a = Math.min(1, Math.abs(yaw));
  const back = yaw === 0 ? 0 : -Math.sign(yaw);
  const far = sd !== back && a > 0;
  return { x: 58 * sd * (1 - a) + back * 58 * a, band: far ? Math.max(0, 1 - a * 3) : 1 };
};

/** Hair over the back/side of a turned head so turning never shows a bald skull. */
const SideHair: React.FC<{ yaw: number; hair: string; line: string; bottom?: number; flare?: number; extra?: number; stroke?: number }> = ({
  yaw,
  hair,
  line,
  bottom = 30,
  flare = 0,
  extra = 0,
  stroke = 3,
}) => {
  const a = Math.abs(yaw);
  if (a < 0.04) return null;
  const s = -Math.sign(yaw || 1);
  const th = (a <= 0.5 ? 52 * a : 26 + 62 * (a - 0.5)) + extra * Math.min(1, a * 1.4);
  const x0 = s * Math.min(58, 62 - th);
  const y = HEAD.y;
  const R = 62 + flare;
  const yT = y - Math.sqrt(Math.max(1, R * R - x0 * x0));
  const xb = s * Math.sqrt(Math.max(1, R * R - bottom * bottom));
  return (
    <path
      d={`M ${x0} ${yT} A ${R} ${R} 0 0 ${s > 0 ? 1 : 0} ${xb} ${y + bottom} Q ${(xb + x0) / 2} ${y + bottom + 6} ${x0} ${y + bottom - 12} Q ${x0 - s * 8} ${y - 10} ${x0} ${yT} Z`}
      fill={hair}
      stroke={line}
      strokeWidth={stroke}
      strokeLinejoin="round"
      opacity={1}
    />
  );
};

/**
 * Solid temple sideburns (`tóc mai`) for female & styled hairstyles.
 * Eliminates transparent gaps/patches between the bangs, ear, and cheek locks,
 * ensuring continuous rich hair volume regardless of head turn angle.
 */
const TempleLocks: React.FC<{
  yaw: number;
  hair: string;
  line: string;
  reach?: number; // how far down the jaw the lock reaches (default 26)
  flare?: number;
}> = ({ yaw, hair, line, reach = 28, flare = 0 }) => {
  return (
    <g>
      {/* Left temple / sideburn lock framing the ear */}
      <path
        d={`M -65 ${HEAD.y - 20} Q -68 ${HEAD.y - 2} -62 ${HEAD.y + reach} Q -50 ${HEAD.y + reach + 6} -46 ${HEAD.y + reach - 8} Q -52 ${HEAD.y + 4} -52 ${HEAD.y - 18} Z`}
        fill={hair}
        stroke={line}
        strokeWidth={2.6}
        strokeLinejoin="round"
      />
      {/* Right temple / sideburn lock framing the ear */}
      <path
        d={`M 65 ${HEAD.y - 20} Q 68 ${HEAD.y - 2} 62 ${HEAD.y + reach} Q 50 ${HEAD.y + reach + 6} 46 ${HEAD.y + reach - 8} Q 52 ${HEAD.y + 4} 52 ${HEAD.y - 18} Z`}
        fill={hair}
        stroke={line}
        strokeWidth={2.6}
        strokeLinejoin="round"
      />
    </g>
  );
};

export const Hero: React.FC<{ pose: Pose; shadow?: number; rimId?: string; look?: Look; opacity?: number; heldProps?: Partial<Record<'L' | 'R', React.ReactNode>> }> = ({
  pose,
  shadow = 1,
  rimId = 'rimR',
  look = LOOKS.pipHood,
  opacity = 1,
  heldProps,
}) => {
  const j = joints(pose);
  const L = look;

  const arm = (chain: { root: P; mid: P; end: P }) => <SoftLimb chain={chain} width={L.limbW ?? 11} color={L.jacket} shade={L.jacketShade} ink={L.line} bare={L.forearm} arm tattoo={L.tattoo} />;
  const leg = (chain: { root: P; mid: P; end: P }) => <SoftLimb chain={chain} width={L.limbW ?? 12} color={L.limb} shade={L.line} ink={L.line} bare={L.shin} />;

  // Detailed shoe with sole, upper, toe cap, and lace ticks
  const shoe = (o: { root: P; mid: P; end: P }) => {
    const sx = o.end.x + pose.facing * 9;
    const sy = o.end.y + 4;
    const f = pose.facing;
    return (
      <g transform={`translate(${sx} ${sy}) scale(${f} 1)`}>
        <path d="M -21 2 Q -22 -11 -4 -12 L 10 -10 Q 24 -7 24 4 L 22 9 L -20 9 Z" fill={L.shoe} stroke={L.line} strokeWidth={3.8} strokeLinejoin="round" />
        <path d="M 8 -10 Q 22 -7 23 4 L 8 4 Q 10 -4 8 -10 Z" fill="#FFFFFF" opacity={0.16} />
        <rect x={-22} y={5} width={45} height={6} rx={3} fill="#EAE3D2" stroke={L.line} strokeWidth={3} />
        <path d="M -2 -9 L 4 -6 M 3 -8 L 9 -5" stroke={L.line} strokeWidth={2.2} strokeLinecap="round" opacity={0.65} />
      </g>
    );
  };

  // Multi-pose hand renderer supporting all 8 HandKinds
  const hand = (o: { mid: P; end: P }, side: 1 | -1, kind: HandKind, attachment?: React.ReactNode) => {
    const ang = (Math.atan2(o.end.x - o.mid.x, o.end.y - o.mid.y) * 180) / Math.PI;
    return (
      <g transform={`translate(${o.end.x} ${o.end.y}) rotate(${-ang})`}>
        {kind === 'point' ? (
          <g>
            <rect x={-4} y={10} width={8.5} height={25} rx={4.2} fill={L.hand} stroke={L.line} strokeWidth={3.5} />
            <path d="M -11 -2 Q -14 14 -6 18 L 7 18 Q 14 14 11 -2 Z" fill={L.hand} stroke={L.line} strokeWidth={3.8} strokeLinejoin="round" />
            <path d="M -6 13 L 6 13 M -5 16 L 5 16" stroke={L.line} strokeWidth={1.8} opacity={0.4} strokeLinecap="round" />
            <ellipse cx={side * 10} cy={6} rx={4.5} ry={7} fill={L.hand} stroke={L.line} strokeWidth={3.5} />
          </g>
        ) : kind === 'fist' ? (
          <g>
            <path d="M -12 -1 Q -14 15 -7 19 L 7 19 Q 14 15 12 -1 Z" fill={L.hand} stroke={L.line} strokeWidth={3.8} strokeLinejoin="round" />
            <path d="M -7 12 L -7 18 M -2 13 L -2 19 M 3 13 L 3 19 M 8 12 L 8 18" stroke={L.line} strokeWidth={2.2} opacity={0.55} strokeLinecap="round" />
            <path d={`M ${side * 11} 4 Q 0 11 ${-side * 6} 9`} stroke={L.line} strokeWidth={6.5} strokeLinecap="round" fill="none" />
            <path d={`M ${side * 11} 4 Q 0 11 ${-side * 6} 9`} stroke={L.hand} strokeWidth={3.8} strokeLinecap="round" fill="none" />
          </g>
        ) : kind === 'hold' ? (
          <g>
            {/* 1. Palm base */}
            <ellipse cx={0} cy={7} rx={11.5} ry={11.5} fill={L.hand} stroke={L.line} strokeWidth={3.6} />
            {attachment}
            {/* 2. Opposing thumb gripping from the side */}
            <path d={`M ${side * 9} 2 Q ${side * 15} 10 ${side * 6} 17`} stroke={L.line} strokeWidth={7.5} strokeLinecap="round" fill="none" />
            <path d={`M ${side * 9} 2 Q ${side * 15} 10 ${side * 6} 17`} stroke={L.hand} strokeWidth={4.5} strokeLinecap="round" fill="none" />
            <circle cx={side * 6} cy={17} r={1.6} fill="#FFF" opacity={0.4} />
            {/* 3. Four fingers curling cleanly forward over the held object */}
            {[-7, -2.5, 2.5, 7].map((fx, k) => (
              <path key={k} d={`M ${fx} 8 Q ${fx * 1.1 + side * 3} 17 ${fx * 0.9 + side * 7} 19`} stroke={L.line} strokeWidth={6.5} strokeLinecap="round" fill="none" />
            ))}
            {[-7, -2.5, 2.5, 7].map((fx, k) => (
              <path key={`f${k}`} d={`M ${fx} 8 Q ${fx * 1.1 + side * 3} 17 ${fx * 0.9 + side * 7} 19`} stroke={L.hand} strokeWidth={3.8} strokeLinecap="round" fill="none" />
            ))}
            {/* Fingernail highlights */}
            {[-7, -2.5, 2.5, 7].map((fx, k) => (
              <ellipse key={`n${k}`} cx={fx * 0.9 + side * 7} cy={19} rx={1.6} ry={1.1} fill="#FFF" opacity={0.45} />
            ))}
          </g>
        ) : kind === 'pinch' ? (
          <g>
            <ellipse cx={0} cy={7} rx={11} ry={11} fill={L.hand} stroke={L.line} strokeWidth={3.5} />
            {attachment}
            {/* Opposing index and thumb meeting at the pinch point */}
            <path d={`M ${side * 9} 4 Q ${side * 12} 16 ${side * 2} 24`} stroke={L.line} strokeWidth={7} strokeLinecap="round" fill="none" />
            <path d={`M ${-side * 4} 10 Q ${side * 1} 19 ${side * 2} 24`} stroke={L.line} strokeWidth={7} strokeLinecap="round" fill="none" />
            <path d={`M ${side * 9} 4 Q ${side * 12} 16 ${side * 2} 24`} stroke={L.hand} strokeWidth={4.2} strokeLinecap="round" fill="none" />
            <path d={`M ${-side * 4} 10 Q ${side * 1} 19 ${side * 2} 24`} stroke={L.hand} strokeWidth={4.2} strokeLinecap="round" fill="none" />
            <ellipse cx={side * 2} cy={24} rx={2} ry={1.4} fill="#FFF" opacity={0.45} />
          </g>
        ) : kind === 'palmUp' ? (
          <g transform="rotate(-18)">
            <ellipse cx={0} cy={7} rx={12} ry={11} fill={L.hand} stroke={L.line} strokeWidth={3.5} />
            {[-8, -3, 3, 8].map((fx, k) => (
              <path key={k} d={`M ${fx} 13 Q ${fx * 1.3} 22 ${fx * 1.5 + side * 3} ${k === 0 || k === 3 ? 25 : 29}`} stroke={L.line} strokeWidth={7.5} strokeLinecap="round" fill="none" />
            ))}
            {[-8, -3, 3, 8].map((fx, k) => (
              <path key={`f${k}`} d={`M ${fx} 13 Q ${fx * 1.3} 22 ${fx * 1.5 + side * 3} ${k === 0 || k === 3 ? 25 : 29}`} stroke={L.hand} strokeWidth={4.5} strokeLinecap="round" fill="none" />
            ))}
            <path d={`M ${side * 10} 3 L ${side * 18} 11`} stroke={L.line} strokeWidth={8} strokeLinecap="round" />
            <path d={`M ${side * 10} 3 L ${side * 18} 11`} stroke={L.hand} strokeWidth={4.8} strokeLinecap="round" />
          </g>
        ) : kind === 'wave' ? (
          <g>
            {[-10, -3.5, 3.5, 10].map((fx, k) => (
              <path key={k} d={`M ${fx * 0.8} 11 L ${fx * 1.55} ${k === 0 ? 26 : k === 3 ? 27 : 31}`} stroke={L.line} strokeWidth={8} strokeLinecap="round" />
            ))}
            <path d={`M ${side * 10} 2 L ${side * 21} 11`} stroke={L.line} strokeWidth={8.5} strokeLinecap="round" />
            <ellipse cx={0} cy={6} rx={12.5} ry={11.5} fill={L.hand} stroke={L.line} strokeWidth={3.5} />
            {[-10, -3.5, 3.5, 10].map((fx, k) => (
              <path key={`f${k}`} d={`M ${fx * 0.8} 11 L ${fx * 1.55} ${k === 0 ? 26 : k === 3 ? 27 : 31}`} stroke={L.hand} strokeWidth={4.8} strokeLinecap="round" />
            ))}
            <path d={`M ${side * 10} 2 L ${side * 21} 11`} stroke={L.hand} strokeWidth={5.2} strokeLinecap="round" />
          </g>
        ) : L.fingers && (kind === 'open' || kind === 'rest') ? (
          <g>
            {[-9, -3, 3, 9].map((fx, k) => (
              <path key={k} d={`M ${fx} 12 L ${fx * (kind === 'rest' ? 1.05 : 1.25)} ${k === 0 ? 26 : k === 3 ? 27 : 31}`} stroke={L.line} strokeWidth={8.2} strokeLinecap="round" />
            ))}
            <path d={`M ${side * 11} 2 L ${side * 18} 14`} stroke={L.line} strokeWidth={8.8} strokeLinecap="round" />
            <ellipse cx={0} cy={6} rx={12.5} ry={11.5} fill={L.hand} stroke={L.line} strokeWidth={3.5} />
            {[-9, -3, 3, 9].map((fx, k) => (
              <path key={`f${k}`} d={`M ${fx} 12 L ${fx * (kind === 'rest' ? 1.05 : 1.25)} ${k === 0 ? 26 : k === 3 ? 27 : 31}`} stroke={L.hand} strokeWidth={4.8} strokeLinecap="round" />
            ))}
            <path d={`M ${side * 11} 2 L ${side * 18} 14`} stroke={L.hand} strokeWidth={5.2} strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <ellipse cx={side * 10} cy={3} rx={5.5} ry={9} transform={`rotate(${side * -28} ${side * 10} 3)`} fill={L.hand} stroke={L.line} strokeWidth={4} />
            <ellipse cx={0} cy={10} rx={11} ry={15} fill={L.hand} stroke={L.line} strokeWidth={4} />
            <path d="M -4 17 L -4 23 M 3 18 L 3 24" stroke={L.line} strokeWidth={2} opacity={0.45} strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  };

  const kw = turnWidth(pose.yaw);
  const liftY = (pose.shoulderLift ?? 0) * -8;


  const torso = (
    <g transform={`rotate(${pose.tilt}) translate(${pose.yaw * 6} ${liftY * 0.5}) scale(${kw} 1)`}>
      {/* Neck connecting torso to head with under-chin cast shadow */}
      <path d="M -12 -134 Q -12 -122 -17 -114 Q 0 -107 17 -114 Q 12 -122 12 -134 Z" fill={L.skin} stroke={L.line} strokeWidth={3} />
      <path d="M -12 -130 Q 0 -116 12 -130 Z" fill={L.skinShade} />

      {L.body === 'swaddle' ? (
        /* Swaddled newborn baby bundle */
        <g>
          <ellipse cx={0} cy={-56} rx={50} ry={72} fill={L.jacket} stroke={L.line} strokeWidth={4} />
          <path d="M -36 -96 Q 12 -56 42 -70 M 40 -66 Q -12 -18 -40 -8" stroke={L.jacketShade} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M -22 -42 Q 0 -28 22 -42" stroke={L.line} strokeWidth={2.5} fill="none" />
          <circle cx={0} cy={-42} r={6.5} fill={L.accent} stroke={L.line} strokeWidth={2} />
        </g>
      ) : L.body === 'chubby' ? (
        /* Round beer belly uncle silhouette */
        <g>
          <path d="M -48 -112 Q 0 -124 48 -112 L 58 -20 Q 64 10 46 18 Q 0 26 -46 18 Q -64 10 -58 -20 Z" fill={L.jacket} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 12 -114 Q 34 -112 48 -112 L 58 -20 Q 64 10 46 18 Q 24 24 12 18 Z" fill={L.jacketShade} opacity={0.55} />
          <path d="M -28 2 Q 0 16 28 2" stroke={L.jacketShade} strokeWidth={3.5} fill="none" opacity={0.65} strokeLinecap="round" />
          <path d="M -16 -40 Q 0 -32 16 -40" stroke={L.jacketShade} strokeWidth={2.5} fill="none" opacity={0.5} strokeLinecap="round" />
          <path d="M 0 -112 L 0 6" stroke={L.jacketShade} strokeWidth={4} />
        </g>
      ) : (
        <SoftTorso color={L.jacket} shade={L.jacketShade} ink={L.line} cloth={pose.cloth} bend={pose.tilt / 12} seam={L.collar === 'shirt' || L.extra === 'suit' || L.collar === 'cardigan'} />
      )}

      {/* Bottom garments: skirts, pencil skirts, or Áo Dài panels */}
      {L.bottom === 'skirt' ? (
        <g>
          <path d="M -42 2 Q 0 10 42 2 L 54 50 Q 0 58 -54 50 Z" fill={L.limb} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
          <path d="M -26 4 L -34 49 M -10 6 L -12 51 M 10 6 L 12 51 M 26 4 L 34 49" stroke={L.line} strokeWidth={2.2} opacity={0.35} strokeLinecap="round" />
        </g>
      ) : L.bottom === 'pencilSkirt' ? (
        <g>
          <path d="M -42 2 Q 0 10 42 2 L 36 60 Q 0 64 -36 60 Z" fill={L.limb} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
          <path d="M -38 2 Q 0 10 38 2" stroke={L.line} strokeWidth={2.5} fill="none" />
          <path d="M 0 4 L 0 60" stroke={L.line} strokeWidth={2} opacity={0.35} />
        </g>
      ) : L.bottom === 'aoDai' ? (
        <g>
          <path d="M -40 2 Q 0 10 40 2 L 34 116 Q 0 122 -34 116 Z" fill={L.jacket} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 0 6 L 0 118" stroke={L.jacketShade} strokeWidth={2.5} opacity={0.6} />
          <path d="M -36 8 L -34 114 M 36 8 L 34 114" stroke={L.jacketShade} strokeWidth={2} opacity={0.5} />
        </g>
      ) : null}

      {L.pocket ? (
        <path d="M -28 -36 L -14 -36 L -12 -8 L -30 -8 Z M 14 -36 L 28 -36 L 30 -8 L 12 -8 Z" fill={L.jacketShade} opacity={0.45} stroke={L.line} strokeWidth={2} />
      ) : null}

      {/* Collars & necklines */}
      {L.extra === 'suit' ? (
        <g>
          <path d="M -24 -116 L 0 -54 L 24 -116 Z" fill="#EDE8DE" />
          <path d="M -7 -112 L 7 -112 L 9 -100 L 5 -64 L 0 -56 L -5 -64 L -9 -100 Z" fill={L.accent} />
          <path d="M -26 -116 L 0 -54 M 26 -116 L 0 -54" stroke={L.line} strokeWidth={4} />
        </g>
      ) : L.collar === 'tankTop' ? (
        <g>
          <path d="M -24 -118 Q 0 -66 24 -118 Z" fill={L.skin} stroke={L.line} strokeWidth={3} />
          <path d="M -22 -116 Q 0 -68 22 -116" stroke={L.jacketShade} strokeWidth={2.5} fill="none" />
        </g>
      ) : L.collar === 'aoDai' ? (
        <g>
          <rect x={-15} y={-128} width={30} height={15} rx={3} fill={L.jacket} stroke={L.line} strokeWidth={3} />
          <path d="M 0 -114 Q 14 -102 24 -86" stroke={L.line} strokeWidth={2.8} fill="none" />
          <circle cx={7} cy={-107} r={2.5} fill="#FFFFFF" stroke={L.line} strokeWidth={1.5} />
          <circle cx={15} cy={-99} r={2.5} fill="#FFFFFF" stroke={L.line} strokeWidth={1.5} />
          <circle cx={22} cy={-90} r={2.5} fill="#FFFFFF" stroke={L.line} strokeWidth={1.5} />
        </g>
      ) : L.collar === 'polo' ? (
        <g>
          <path d="M -18 -118 L -6 -98 L -14 -94 Z M 18 -118 L 6 -98 L 14 -94 Z" fill={L.accent} stroke={L.line} strokeWidth={2.8} strokeLinejoin="round" />
          <rect x={-4} y={-112} width={8} height={28} rx={2} fill={L.accent} stroke={L.line} strokeWidth={2} />
          <circle cx={0} cy={-104} r={1.8} fill="#FFFFFF" />
          <circle cx={0} cy={-94} r={1.8} fill="#FFFFFF" />
        </g>
      ) : L.collar === 'shirt' ? (
        <g>
          <path d="M -16 -116 L 0 -96 L 16 -116 Z" fill={L.skin} />
          <path d="M -24 -118 L -6 -96 L -18 -90 Z M 24 -118 L 6 -96 L 18 -90 Z" fill={L.jacket} stroke={L.line} strokeWidth={3} strokeLinejoin="round" />
          {[-76, -52, -28].map((by) => (
            <circle key={by} cx={0} cy={by} r={2.6} fill={L.accent} />
          ))}
        </g>
      ) : L.collar === 'cardigan' ? (
        <g>
          <path d="M -18 -116 L 0 -82 L 18 -116 Z" fill={L.accent} stroke={L.line} strokeWidth={2.5} />
          <path d="M -20 -116 L 0 -80 L 20 -116" stroke={L.jacketShade} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      ) : L.collar === 'apron' ? (
        <g>
          <path d="M -28 -88 L 28 -88 L 32 4 L -32 4 Z" fill="#3E3630" stroke={L.line} strokeWidth={3} opacity={0.85} />
          <path d="M -22 -116 L -20 -88 M 22 -116 L 20 -88" stroke="#3E3630" strokeWidth={5} strokeLinecap="round" />
          <rect x={-18} y={-62} width={36} height={24} rx={4} fill="#2E2824" stroke={L.line} strokeWidth={2} />
        </g>
      ) : (
        <path d="M -22 -118 Q 0 -100 22 -118" stroke={L.accent} strokeWidth={6} fill="none" strokeLinecap="round" />
      )}

      {/* Accessories */}
      {L.accessory === 'redScarf' ? (
        <g>
          <path d="M -14 -96 L 0 -84 L 14 -96 L 6 -60 L 0 -54 L -6 -60 Z" fill="#D62828" stroke={L.line} strokeWidth={2.4} strokeLinejoin="round" />
          <path d="M 0 -84 L 4 -48 M 0 -84 L -5 -52" stroke="#B71C1C" strokeWidth={3} strokeLinecap="round" />
        </g>
      ) : L.accessory === 'lanyard' ? (
        <g>
          <path d="M -16 -112 L 0 -54 L 16 -112" stroke={L.accent} strokeWidth={2.8} fill="none" />
          <rect x={-8} y={-54} width={16} height={22} rx={2.5} fill="#FFFFFF" stroke={L.line} strokeWidth={2} />
          <rect x={-6} y={-51} width={12} height={6} rx={1} fill={L.accent} />
          <path d="M -6 -41 L 6 -41 M -6 -37 L 2 -37" stroke="#64748B" strokeWidth={1.5} />
        </g>
      ) : L.accessory === 'whistle' ? (
        <g>
          <path d="M -14 -112 L 0 -64 L 14 -112" stroke="#1D2D44" strokeWidth={2.4} fill="none" />
          <rect x={-5} y={-64} width={10} height={14} rx={2} fill="#CBD5E1" stroke={L.line} strokeWidth={2} />
          <circle cx={0} cy={-56} r={2} fill="#334155" />
        </g>
      ) : L.accessory === 'epauletsPolice' ? (
        <g>
          <polygon points="-16,-106 -6,-98 -12,-90" fill="#DC2626" stroke={L.line} strokeWidth={1.5} />
          <polygon points="16,-106 6,-98 12,-90" fill="#DC2626" stroke={L.line} strokeWidth={1.5} />
          <circle cx={-11} cy={-98} r={2} fill="#FBBF24" />
          <circle cx={11} cy={-98} r={2} fill="#FBBF24" />
        </g>
      ) : L.accessory === 'epauletsGuard' ? (
        <g>
          <rect x={-44} y={-114} width={14} height={6} rx={2} fill="#1E3A8A" stroke={L.line} strokeWidth={1.5} />
          <rect x={30} y={-114} width={14} height={6} rx={2} fill="#1E3A8A" stroke={L.line} strokeWidth={1.5} />
          <polygon points="18,-86 28,-86 26,-74 23,-70 20,-74" fill="#FBBF24" stroke={L.line} strokeWidth={1.5} />
        </g>
      ) : L.accessory === 'chain' ? (
        <path d="M -16 -110 Q 0 -80 16 -110" stroke="#C0C0C0" strokeWidth={2.8} fill="none" strokeDasharray="3 2" />
      ) : L.accessory === 'slingBag' ? (
        <g>
          <path d="M -38 -108 L 34 -8" stroke="#1E1E24" strokeWidth={6} strokeLinecap="round" />
          <rect x={18} y={-24} width={24} height={20} rx={6} fill="#0F172A" stroke={L.line} strokeWidth={2.6} />
          <path d="M 22 -14 L 38 -14" stroke="#E2A03F" strokeWidth={2} strokeLinecap="round" />
        </g>
      ) : L.accessory === 'thaoTote' ? (
        <g>
          {/* Diagonal brown fabric shoulder strap across chest from right shoulder to left hip */}
          <path d="M -26 -106 L 22 -16" stroke="#423126" strokeWidth={4.5} strokeLinecap="round" />
          <path d="M -26 -106 L 22 -16" stroke="#5C4435" strokeWidth={3} strokeLinecap="round" />
          {/* Canvas pouch resting snugly at her hip */}
          <rect x={10} y={-26} width={24} height={30} rx={5} fill="#D6C4A4" stroke={L.line} strokeWidth={2.4} />
          <rect x={10} y={-26} width={24} height={8} rx={2} fill="#C4AF8E" />
          <path d="M 12 -18 L 32 -18" stroke="#7A624A" strokeWidth={1.8} strokeDasharray="3 2" />
          <circle cx={22} cy={-12} r={2.5} fill="#D6453A" stroke={L.line} strokeWidth={1.2} />
        </g>
      ) : null}
    </g>
  );

  const ay = Math.abs(pose.yaw);
  const earSide = pose.yaw >= 0 ? -1 : 1; // visible ear on the side away from the turn

  const head = (
    <g transform={`rotate(${pose.tilt}) translate(0 ${liftY * 0.3}) rotate(${pose.headTilt} 0 ${HEAD.y + 40})`}>
      {L.extra === 'bunches'
        ? [-1, 1].map((sd) => {
            const b = bunchAt(sd, pose.yaw);
            return (
              <g key={sd} transform={`rotate(${pose.sway * 0.5} ${b.x} ${HEAD.y - 52})`}>
                <circle cx={b.x} cy={HEAD.y - 52} r={27} fill={L.hair} stroke={L.line} strokeWidth={4} />
              </g>
            );
          })
        : null}
      {/* Ears: both ears face-on, or the near ear when turned */}
      {ay < 0.25 ? (
        [-1, 1].map((sd) => (
          <g key={`ear${sd}`}>
            <ellipse cx={sd * 61} cy={HEAD.y + 4} rx={9} ry={13} fill={L.skin} stroke={L.line} strokeWidth={3.5} />
            <path d={`M ${sd * 59} ${HEAD.y - 2} Q ${sd * 64} ${HEAD.y + 4} ${sd * 59} ${HEAD.y + 9}`} stroke={L.skinShade} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          </g>
        ))
      ) : (
        <g>
          <ellipse cx={earSide * (58 - ay * 16)} cy={HEAD.y + 4} rx={10} ry={13.5} fill={L.skin} stroke={L.line} strokeWidth={3.5} />
          <path d={`M ${earSide * (56 - ay * 16)} ${HEAD.y - 2} Q ${earSide * (61 - ay * 16)} ${HEAD.y + 4} ${earSide * (56 - ay * 16)} ${HEAD.y + 9}`} stroke={L.skinShade} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </g>
      )}
      <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r} fill={L.skin} stroke={L.line} strokeWidth={4} />
      <path d={`M ${HEAD.x + 14} ${HEAD.y + 58} A ${HEAD.r} ${HEAD.r} 0 0 0 ${HEAD.x + 60} ${HEAD.y + 14} A 70 70 0 0 1 ${HEAD.x + 14} ${HEAD.y + 58} Z`} fill={L.skinShade} />

      {/* Default Pip tuft + SideHair so turning Pip never leaves the back of his head bare */}
      {!L.extra || L.extra === 'hood' ? (
        <g>
          {L.extra !== 'hood' ? <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={24} stroke={0} /> : null}
          <path transform={`translate(${-pose.yaw * 16} 0)`} d={`M -6 ${HEAD.y - 60} q 10 -26 30 -18 q -16 2 -14 16 q -8 -10 -16 2 Z`} fill={L.hair} />
        </g>
      ) : null}

      {/* Short crop, bun, greyBun, parted, hardhat */}
      {(L.extra === 'crop' || L.extra === 'bun' || L.extra === 'greyBun' || L.extra === 'parted' || L.extra === 'hardhat') &&
        (() => {
          const top = HEAD.y - 6;
          return (
            <g>
              {L.extra === 'crop' || L.extra === 'bun' || L.extra === 'greyBun' || L.extra === 'parted' ? (
                <g>
                  {L.extra === 'bun' || L.extra === 'greyBun' ? (
                    <g>
                      <circle cx={-pose.yaw * 46} cy={HEAD.y - 68} r={24} fill={L.hair} stroke={L.line} strokeWidth={3.5} />
                      <path d={`M ${-pose.yaw * 46 - 14} ${HEAD.y - 54} Q ${-pose.yaw * 46} ${HEAD.y - 46} ${-pose.yaw * 46 + 14} ${HEAD.y - 54}`} stroke={L.accent} strokeWidth={4} fill="none" strokeLinecap="round" />
                      <TempleLocks yaw={pose.yaw} hair={L.hair} line={L.line} reach={24} />
                    </g>
                  ) : null}
                  <path
                    d={
                      L.extra === 'parted'
                        ? `M -64 ${top} A 64 64 0 0 1 64 ${top} Q ${48 + pose.yaw * 10} ${HEAD.y - 28} ${20 + pose.yaw * 10} ${HEAD.y - 46} L ${12 + pose.yaw * 10} ${HEAD.y - 54} Q ${-18 + pose.yaw * 10} ${HEAD.y - 36} -64 ${top} Z`
                        : `M -64 ${top} A 64 64 0 0 1 64 ${top} Q ${44 + pose.yaw * 10} ${HEAD.y - 34} ${14 + pose.yaw * 10} ${HEAD.y - 46} Q ${-16 + pose.yaw * 10} ${HEAD.y - 40} -64 ${top} Z`
                    }
                    fill={L.hair}
                    stroke={L.line}
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                  />
                  <path d={`M -22 ${HEAD.y - 48} Q 2 ${HEAD.y - 58} 26 ${HEAD.y - 50}`} stroke="#FFFFFF" strokeWidth={2.8} fill="none" opacity={0.18} strokeLinecap="round" />
                </g>
              ) : null}
              <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={L.extra === 'hardhat' ? 34 : 30} stroke={0} />
              {L.extra === 'hardhat' ? (
                <g fill={L.hair} stroke={L.line} strokeWidth={2.5} opacity={1 - ay * 0.6}>
                  <path d={`M -60 ${HEAD.y - 34} Q -64 ${HEAD.y - 6} -52 ${HEAD.y + 4} Q -52 ${HEAD.y - 14} -44 ${HEAD.y - 32} Z`} />
                  <path d={`M 60 ${HEAD.y - 34} Q 64 ${HEAD.y - 6} 52 ${HEAD.y + 4} Q 52 ${HEAD.y - 14} 44 ${HEAD.y - 32} Z`} />
                </g>
              ) : null}
            </g>
          );
        })()}

      {L.extra === 'bunches' ? (
        <g>
          <path
            d={`M -64 ${HEAD.y - 6} A 64 64 0 0 1 64 ${HEAD.y - 6} Q ${46 + pose.yaw * 12} ${HEAD.y - 30} ${22 + pose.yaw * 12} ${HEAD.y - 38} Q ${pose.yaw * 12} ${HEAD.y - 32} ${-22 + pose.yaw * 12} ${HEAD.y - 38} Q ${-46 + pose.yaw * 12} ${HEAD.y - 30} -64 ${HEAD.y - 6} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={30} stroke={0} />
          <TempleLocks yaw={pose.yaw} hair={L.hair} line={L.line} reach={24} />
          {[-1, 1].map((sd) => {
            const b = bunchAt(sd, pose.yaw);
            return b.band > 0 ? (
              <ellipse
                key={sd}
                cx={b.x * 0.74}
                cy={HEAD.y - 40}
                rx={7}
                ry={11}
                transform={`rotate(${b.x * 0.74 * 0.9} ${b.x * 0.74} ${HEAD.y - 40})`}
                fill={L.accent}
                stroke={L.line}
                strokeWidth={2.5}
                opacity={b.band}
              />
            ) : null;
          })}
        </g>
      ) : null}

      {L.extra === 'bob' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={36} flare={8} extra={6} stroke={0} />
          <TempleLocks yaw={pose.yaw} hair={L.hair} line={L.line} reach={28} />
          <path
            transform={`translate(${-pose.yaw * 10} 0) scale(${1 - 0.16 * Math.abs(pose.yaw)} 1)`}
            d={`M -72 ${HEAD.y + 42} Q -84 ${HEAD.y - 70} 0 ${HEAD.y - 72} Q 84 ${HEAD.y - 70} 72 ${HEAD.y + 42} Q 58 ${HEAD.y + 54} 46 ${HEAD.y + 40} Q 58 ${HEAD.y - 14} 38 ${HEAD.y - 40} Q 10 ${HEAD.y - 32} -16 ${HEAD.y - 48} Q -54 ${HEAD.y - 26} -46 ${HEAD.y + 40} Q -58 ${HEAD.y + 54} -72 ${HEAD.y + 42} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3.6}
            strokeLinejoin="round"
          />
          <path d={`M -46 ${HEAD.y - 44} Q -16 ${HEAD.y - 62} 24 ${HEAD.y - 54}`} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.2} strokeLinecap="round" />
        </g>
      ) : null}

      {L.extra === 'suit' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={28} stroke={0} />
          <path
            transform={`translate(${-pose.yaw * 14} 0)`}
            d={`M -60 ${HEAD.y - 18} Q -64 ${HEAD.y - 70} 4 ${HEAD.y - 68} Q 64 ${HEAD.y - 64} 60 ${HEAD.y - 18} Q 52 ${HEAD.y - 44} 18 ${HEAD.y - 46} L 12 ${HEAD.y - 54} L 6 ${HEAD.y - 46} Q -44 ${HEAD.y - 46} -60 ${HEAD.y - 18} Z`}
            fill={L.hair}
          />
        </g>
      ) : null}

      {/* 1. longWave: Lush Korean S-wave long hair with curtain bangs (mái bay) and front shoulder locks */}
      {L.extra === 'longWave' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={38} flare={10} extra={8} stroke={0} />
          <TempleLocks yaw={pose.yaw} hair={L.hair} line={L.line} reach={34} />
          {/* Front cascading S-wave locks draping over collarbones */}
          <path
            d={`M -58 ${HEAD.y + 4} Q -74 ${HEAD.y + 38} -56 ${HEAD.y + 74} Q -70 ${HEAD.y + 104} -48 ${HEAD.y + 132} Q -34 ${HEAD.y + 126} -36 ${HEAD.y + 98} Q -48 ${HEAD.y + 68} -40 ${HEAD.y + 36} Q -46 ${HEAD.y + 12} -44 ${HEAD.y - 8} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <path
            d={`M 58 ${HEAD.y + 4} Q 74 ${HEAD.y + 38} 56 ${HEAD.y + 74} Q 70 ${HEAD.y + 104} 48 ${HEAD.y + 132} Q 34 ${HEAD.y + 126} 36 ${HEAD.y + 98} Q 48 ${HEAD.y + 68} 40 ${HEAD.y + 36} Q 46 ${HEAD.y + 12} 44 ${HEAD.y - 8} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          {/* Voluminous crown & feathered Korean curtain bangs (mái bay) */}
          <path
            d={`M -66 ${HEAD.y + 10} Q -72 ${HEAD.y - 68} -6 ${HEAD.y - 72} Q 6 ${HEAD.y - 76} 22 ${HEAD.y - 72} Q 72 ${HEAD.y - 64} 66 ${HEAD.y + 10} Q 54 ${HEAD.y - 16} 38 ${HEAD.y - 30} Q 16 ${HEAD.y - 42} ${4 + pose.yaw * 8} ${HEAD.y - 54} Q ${-10 + pose.yaw * 8} ${HEAD.y - 40} -38 ${HEAD.y - 28} Q -54 ${HEAD.y - 14} -66 ${HEAD.y + 10} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          {/* Glossy hair highlights & strand lines */}
          <path d={`M -38 ${HEAD.y - 48} Q -12 ${HEAD.y - 62} 8 ${HEAD.y - 56} M 14 ${HEAD.y - 56} Q 36 ${HEAD.y - 60} 50 ${HEAD.y - 42}`} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.22} strokeLinecap="round" />
          <path d={`M -52 ${HEAD.y + 28} Q -62 ${HEAD.y + 56} -48 ${HEAD.y + 88} M 52 ${HEAD.y + 28} Q 62 ${HEAD.y + 56} 48 ${HEAD.y + 88}`} stroke="#FFFFFF" strokeWidth={2.2} fill="none" opacity={0.16} strokeLinecap="round" />
        </g>
      ) : null}

      {/* 2. longHair: Silky straight long schoolgirl hair with wispy air-bangs (mái mưa) & pastel hairclips */}
      {L.extra === 'longHair' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={38} flare={8} extra={6} stroke={0} />
          <TempleLocks yaw={pose.yaw} hair={L.hair} line={L.line} reach={32} />
          {/* Front silky straight locks framing the shoulders */}
          <path
            d={`M -58 ${HEAD.y} Q -64 ${HEAD.y + 58} -52 ${HEAD.y + 122} Q -40 ${HEAD.y + 126} -36 ${HEAD.y + 108} Q -44 ${HEAD.y + 54} -44 ${HEAD.y - 4} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.8}
            strokeLinejoin="round"
          />
          <path
            d={`M 58 ${HEAD.y} Q 64 ${HEAD.y + 58} 52 ${HEAD.y + 122} Q 40 ${HEAD.y + 126} 36 ${HEAD.y + 108} Q 44 ${HEAD.y + 54} 44 ${HEAD.y - 4} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.8}
            strokeLinejoin="round"
          />
          {/* Rounded crown with wispy air-bangs (mái thưa) */}
          <path
            d={`M -64 ${HEAD.y + 4} Q -68 ${HEAD.y - 68} 0 ${HEAD.y - 70} Q 68 ${HEAD.y - 68} 64 ${HEAD.y + 4} Q 50 ${HEAD.y - 24} 34 ${HEAD.y - 30} L 26 ${HEAD.y - 22} L 18 ${HEAD.y - 34} L 6 ${HEAD.y - 20} L -4 ${HEAD.y - 34} L -16 ${HEAD.y - 22} L -26 ${HEAD.y - 32} Q -48 ${HEAD.y - 26} -64 ${HEAD.y + 4} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.8}
            strokeLinejoin="round"
          />
          {/* Cute twin hair clips on temple */}
          <rect x={34} y={HEAD.y - 26} width={14} height={4.5} rx={2} transform={`rotate(-18 41 ${HEAD.y - 24})`} fill="#F472B6" stroke={L.line} strokeWidth={1.5} />
          <rect x={36} y={HEAD.y - 19} width={13} height={4} rx={2} transform={`rotate(-14 42 ${HEAD.y - 17})`} fill="#FBBF24" stroke={L.line} strokeWidth={1.4} />
          <path d={`M -32 ${HEAD.y - 50} Q 0 ${HEAD.y - 62} 32 ${HEAD.y - 50}`} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.22} strokeLinecap="round" />
        </g>
      ) : null}

      {/* 3. cCurlLob: Chic shoulder-length inward C-curl bob (tóc ngang vai uốn cụp chữ C) */}
      {L.extra === 'cCurlLob' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={36} flare={9} extra={6} stroke={0} />
          <TempleLocks yaw={pose.yaw} hair={L.hair} line={L.line} reach={30} />
          {/* Inward C-curling front locks hugging the jawline and clavicle */}
          <path
            d={`M -62 ${HEAD.y - 4} Q -74 ${HEAD.y + 44} -52 ${HEAD.y + 78} Q -34 ${HEAD.y + 88} -24 ${HEAD.y + 72} Q -44 ${HEAD.y + 64} -46 ${HEAD.y + 18} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <path
            d={`M 62 ${HEAD.y - 4} Q 74 ${HEAD.y + 44} 52 ${HEAD.y + 78} Q 34 ${HEAD.y + 88} 24 ${HEAD.y + 72} Q 44 ${HEAD.y + 64} 46 ${HEAD.y + 18} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          {/* Deep 7/3 side-parted crown */}
          <path
            d={`M -65 ${HEAD.y + 6} Q -70 ${HEAD.y - 68} -12 ${HEAD.y - 72} Q 20 ${HEAD.y - 74} 65 ${HEAD.y + 6} Q 50 ${HEAD.y - 26} ${20 + pose.yaw * 8} ${HEAD.y - 48} L ${14 + pose.yaw * 8} ${HEAD.y - 58} Q ${-18 + pose.yaw * 8} ${HEAD.y - 34} -65 ${HEAD.y + 6} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <path d={`M -36 ${HEAD.y - 48} Q -6 ${HEAD.y - 62} 12 ${HEAD.y - 56}`} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.22} strokeLinecap="round" />
        </g>
      ) : null}

      {/* 4. officeWave: Modern layered waves tucked behind one ear with pearl earring */}
      {L.extra === 'officeWave' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={36} flare={8} extra={6} stroke={0} />
          <TempleLocks yaw={pose.yaw} hair={L.hair} line={L.line} reach={30} />
          {/* Pearl stud earring on the tucked side */}
          <circle cx={-56} cy={HEAD.y + 14} r={4.5} fill="#FFF8F0" stroke={L.line} strokeWidth={1.8} />
          {/* Voluminous wavy lock cascading over the right lapel */}
          <path
            d={`M 56 ${HEAD.y - 4} Q 74 ${HEAD.y + 30} 54 ${HEAD.y + 64} Q 68 ${HEAD.y + 88} 44 ${HEAD.y + 108} Q 30 ${HEAD.y + 100} 34 ${HEAD.y + 76} Q 46 ${HEAD.y + 48} 42 ${HEAD.y + 8} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          {/* Swept side-parted crown */}
          <path
            d={`M -62 ${HEAD.y - 2} Q -68 ${HEAD.y - 66} 4 ${HEAD.y - 72} Q 70 ${HEAD.y - 66} 64 ${HEAD.y + 8} Q 48 ${HEAD.y - 22} 16 ${HEAD.y - 40} Q -18 ${HEAD.y - 54} -26 ${HEAD.y - 44} Q -44 ${HEAD.y - 24} -62 ${HEAD.y - 2} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <path d={`M -16 ${HEAD.y - 54} Q 18 ${HEAD.y - 64} 46 ${HEAD.y - 44}`} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.22} strokeLinecap="round" />
        </g>
      ) : null}

      {/* 5. aoDaiBun: Graceful Vietnamese teacher side-swept hair with soft cheek tendrils */}
      {L.extra === 'aoDaiBun' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={34} flare={6} extra={4} stroke={0} />
          <TempleLocks yaw={pose.yaw} hair={L.hair} line={L.line} reach={28} />
          {/* Delicate S-curved cheek tendrils (tóc mai dịu dàng) */}
          <path d={`M -58 ${HEAD.y - 4} Q -68 ${HEAD.y + 20} -54 ${HEAD.y + 42} Q -48 ${HEAD.y + 26} -50 ${HEAD.y + 4} Z`} fill={L.hair} stroke={L.line} strokeWidth={2.4} />
          <path d={`M 58 ${HEAD.y - 4} Q 68 ${HEAD.y + 20} 54 ${HEAD.y + 42} Q 48 ${HEAD.y + 26} 50 ${HEAD.y + 4} Z`} fill={L.hair} stroke={L.line} strokeWidth={2.4} />
          {/* Elegant side-swept crown (mái lệch truyền thống) */}
          <path
            d={`M -64 ${HEAD.y} Q -68 ${HEAD.y - 68} 0 ${HEAD.y - 70} Q 68 ${HEAD.y - 68} 64 ${HEAD.y} Q 46 ${HEAD.y - 28} 8 ${HEAD.y - 40} Q -20 ${HEAD.y - 50} -28 ${HEAD.y - 56} Q -42 ${HEAD.y - 32} -64 ${HEAD.y} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.8}
            strokeLinejoin="round"
          />
          <path d={`M -20 ${HEAD.y - 52} Q 14 ${HEAD.y - 60} 44 ${HEAD.y - 44}`} stroke="#FFFFFF" strokeWidth={2.8} fill="none" opacity={0.2} strokeLinecap="round" />
        </g>
      ) : null}

      {L.extra === 'baldRing' ? (
        <g>
          {/* Bald shine highlight */}
          <ellipse cx={-14} cy={HEAD.y - 34} rx={20} ry={11} fill="#FFFFFF" opacity={0.26} transform={`rotate(-18 -14 ${HEAD.y - 34})`} />
          <ellipse cx={6} cy={HEAD.y - 46} rx={8} ry={4.5} fill="#FFFFFF" opacity={0.18} />
          {/* 2 cute stray wispy hairs on top of the bald crown */}
          <path d={`M -4 ${HEAD.y - 60} Q -12 ${HEAD.y - 78} 4 ${HEAD.y - 82} M 4 ${HEAD.y - 58} Q 14 ${HEAD.y - 74} 22 ${HEAD.y - 72}`} stroke={L.hair} strokeWidth={2.6} fill="none" strokeLinecap="round" />
          {/* Side hair fringe around ears */}
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={24} stroke={0} />
          <path d={`M -60 ${HEAD.y - 14} Q -70 ${HEAD.y + 12} -50 ${HEAD.y + 24} Q -44 ${HEAD.y + 8} -48 ${HEAD.y - 16} Z`} fill={L.hair} stroke={L.line} strokeWidth={2.6} />
          <path d={`M 60 ${HEAD.y - 14} Q 70 ${HEAD.y + 12} 50 ${HEAD.y + 24} Q 44 ${HEAD.y + 8} 48 ${HEAD.y - 16} Z`} fill={L.hair} stroke={L.line} strokeWidth={2.6} />
        </g>
      ) : null}

      {L.extra === 'highPonytail' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={32} stroke={0} />
          <TempleLocks yaw={pose.yaw} hair={L.hair} line={L.line} reach={28} />
          {/* Cute temple tendrils framing the face */}
          <path d={`M -58 ${HEAD.y - 4} Q -66 ${HEAD.y + 16} -54 ${HEAD.y + 32} Q -48 ${HEAD.y + 16} -50 ${HEAD.y - 2} Z`} fill={L.hair} stroke={L.line} strokeWidth={2.3} />
          <path d={`M 58 ${HEAD.y - 4} Q 66 ${HEAD.y + 16} 54 ${HEAD.y + 32} Q 48 ${HEAD.y + 16} 50 ${HEAD.y - 2} Z`} fill={L.hair} stroke={L.line} strokeWidth={2.3} />
          {/* Crown hair with lively wispy bangs */}
          <path
            d={`M -64 ${HEAD.y - 2} Q -68 ${HEAD.y - 68} 0 ${HEAD.y - 70} Q 68 ${HEAD.y - 68} 64 ${HEAD.y - 2} Q 46 ${HEAD.y - 26} 24 ${HEAD.y - 32} L 14 ${HEAD.y - 24} L 6 ${HEAD.y - 38} L -6 ${HEAD.y - 24} L -18 ${HEAD.y - 34} Q -44 ${HEAD.y - 28} -64 ${HEAD.y - 2} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.8}
            strokeLinejoin="round"
          />
          <path d={`M -28 ${HEAD.y - 50} Q 0 ${HEAD.y - 62} 28 ${HEAD.y - 50}`} stroke="#FFFFFF" strokeWidth={2.8} fill="none" opacity={0.22} strokeLinecap="round" />
        </g>
      ) : null}

      {L.extra === 'braids' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={34} stroke={0} />
          <TempleLocks yaw={pose.yaw} hair={L.hair} line={L.line} reach={28} />
          {/* Twin heart-plaited braids draping over the front of the shoulders */}
          <g transform={`rotate(${pose.sway * 0.35} -48 ${HEAD.y + 8})`}>
            <ellipse cx={-50} cy={HEAD.y + 20} rx={9.5} ry={11} fill={L.hair} stroke={L.line} strokeWidth={2.6} />
            <ellipse cx={-48} cy={HEAD.y + 36} rx={9} ry={10.5} fill={L.hair} stroke={L.line} strokeWidth={2.6} />
            <ellipse cx={-46} cy={HEAD.y + 52} rx={8} ry={9.5} fill={L.hair} stroke={L.line} strokeWidth={2.6} />
            <ellipse cx={-44} cy={HEAD.y + 66} rx={7} ry={8.5} fill={L.hair} stroke={L.line} strokeWidth={2.6} />
            <circle cx={-44} cy={HEAD.y + 75} r={5.5} fill={L.accent} stroke={L.line} strokeWidth={2.2} />
            <path d={`M -44 ${HEAD.y + 79} Q -52 ${HEAD.y + 94} -44 ${HEAD.y + 98} Q -36 ${HEAD.y + 94} -44 ${HEAD.y + 79} Z`} fill={L.hair} stroke={L.line} strokeWidth={2.4} />
          </g>
          <g transform={`rotate(${pose.sway * 0.35} 48 ${HEAD.y + 8})`}>
            <ellipse cx={50} cy={HEAD.y + 20} rx={9.5} ry={11} fill={L.hair} stroke={L.line} strokeWidth={2.6} />
            <ellipse cx={48} cy={HEAD.y + 36} rx={9} ry={10.5} fill={L.hair} stroke={L.line} strokeWidth={2.6} />
            <ellipse cx={46} cy={HEAD.y + 52} rx={8} ry={9.5} fill={L.hair} stroke={L.line} strokeWidth={2.6} />
            <ellipse cx={44} cy={HEAD.y + 66} rx={7} ry={8.5} fill={L.hair} stroke={L.line} strokeWidth={2.6} />
            <circle cx={44} cy={HEAD.y + 75} r={5.5} fill={L.accent} stroke={L.line} strokeWidth={2.2} />
            <path d={`M 44 ${HEAD.y + 79} Q 36 ${HEAD.y + 94} 44 ${HEAD.y + 98} Q 52 ${HEAD.y + 94} 44 ${HEAD.y + 79} Z`} fill={L.hair} stroke={L.line} strokeWidth={2.4} />
          </g>
          {/* Center-parted crown with soft arched bangs that stay clearly above round glasses */}
          <path
            d={`M -64 ${HEAD.y - 4} Q -68 ${HEAD.y - 68} 0 ${HEAD.y - 70} Q 68 ${HEAD.y - 68} 64 ${HEAD.y - 4} Q 46 ${HEAD.y - 30} 14 ${HEAD.y - 34} L 0 ${HEAD.y - 48} L -14 ${HEAD.y - 34} Q -46 ${HEAD.y - 30} -64 ${HEAD.y - 4} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.8}
            strokeLinejoin="round"
          />
          <path d={`M -30 ${HEAD.y - 50} Q -10 ${HEAD.y - 60} -2 ${HEAD.y - 54} M 4 ${HEAD.y - 54} Q 14 ${HEAD.y - 60} 30 ${HEAD.y - 50}`} stroke="#FFFFFF" strokeWidth={2.6} fill="none" opacity={0.2} strokeLinecap="round" />
        </g>
      ) : null}

      {/* Male hairstyles: slickBack, undercut, bowlCut, spiky, sidePart, sportyCrew, mulletBlonde, commaHair */}
      {L.extra === 'slickBack' || L.extra === 'undercut' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={26} stroke={0} />
          {/* Shaved fade sides with razor disconnected line */}
          <path d={`M -62 ${HEAD.y - 22} Q -64 ${HEAD.y + 2} -52 ${HEAD.y + 10} Q -48 ${HEAD.y - 10} -52 ${HEAD.y - 24} Z`} fill={L.hair} opacity={0.4} />
          <path d={`M 62 ${HEAD.y - 22} Q 64 ${HEAD.y + 2} 52 ${HEAD.y + 10} Q 48 ${HEAD.y - 10} 52 ${HEAD.y - 24} Z`} fill={L.hair} opacity={0.4} />
          <path d={`M -58 ${HEAD.y - 14} L -48 ${HEAD.y - 18}`} stroke={L.skin} strokeWidth={2.2} strokeLinecap="round" />
          {/* High swept-back pompadour crown */}
          <path
            d={`M -58 ${HEAD.y - 14} Q -66 ${HEAD.y - 74} -10 ${HEAD.y - 80} Q 46 ${HEAD.y - 82} 58 ${HEAD.y - 14} Q 40 ${HEAD.y - 42} 8 ${HEAD.y - 46} Q -32 ${HEAD.y - 44} -58 ${HEAD.y - 14} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <path d={`M -28 ${HEAD.y - 56} Q 2 ${HEAD.y - 68} 34 ${HEAD.y - 56}`} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.22} strokeLinecap="round" />
        </g>
      ) : null}

      {L.extra === 'bowlCut' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={26} stroke={0} />
          <path
            d={`M -64 ${HEAD.y - 8} Q -68 ${HEAD.y - 68} 0 ${HEAD.y - 70} Q 68 ${HEAD.y - 68} 64 ${HEAD.y - 8} L 36 ${HEAD.y - 18} L 30 ${HEAD.y - 10} L 8 ${HEAD.y - 14} L 2 ${HEAD.y - 24} L -4 ${HEAD.y - 14} L -32 ${HEAD.y - 12} L -38 ${HEAD.y - 20} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.8}
            strokeLinejoin="round"
          />
          <path d={`M -28 ${HEAD.y - 48} Q 0 ${HEAD.y - 58} 28 ${HEAD.y - 48}`} stroke="#FFFFFF" strokeWidth={2.8} fill="none" opacity={0.2} strokeLinecap="round" />
        </g>
      ) : null}

      {L.extra === 'spiky' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={26} stroke={0} />
          <path
            d={`M -62 ${HEAD.y - 6} Q -62 ${HEAD.y - 48} -42 ${HEAD.y - 66} L -28 ${HEAD.y - 82} L -16 ${HEAD.y - 66} L 4 ${HEAD.y - 86} L 16 ${HEAD.y - 64} L 34 ${HEAD.y - 78} L 40 ${HEAD.y - 60} L 58 ${HEAD.y - 66} Q 66 ${HEAD.y - 36} 62 ${HEAD.y - 6} L 40 ${HEAD.y - 28} L 24 ${HEAD.y - 18} L 12 ${HEAD.y - 34} L -4 ${HEAD.y - 18} L -18 ${HEAD.y - 34} L -34 ${HEAD.y - 22} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <path d={`M -22 ${HEAD.y - 54} Q 4 ${HEAD.y - 64} 26 ${HEAD.y - 52}`} stroke="#FFFFFF" strokeWidth={2.6} fill="none" opacity={0.2} strokeLinecap="round" />
        </g>
      ) : null}

      {L.extra === 'sidePart' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={28} stroke={0} />
          <path
            d={`M -64 ${HEAD.y - 8} A 64 64 0 0 1 64 ${HEAD.y - 8} Q ${48 + pose.yaw * 8} ${HEAD.y - 30} ${20 + pose.yaw * 8} ${HEAD.y - 48} L ${14 + pose.yaw * 8} ${HEAD.y - 58} Q ${-16 + pose.yaw * 8} ${HEAD.y - 36} -64 ${HEAD.y - 8} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.8}
            strokeLinejoin="round"
          />
          <path d={`M -24 ${HEAD.y - 50} Q 0 ${HEAD.y - 60} 22 ${HEAD.y - 52}`} stroke="#FFFFFF" strokeWidth={2.8} fill="none" opacity={0.2} strokeLinecap="round" />
        </g>
      ) : null}

      {L.extra === 'sportyCrew' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={22} stroke={0} />
          {/* High athletic fade */}
          <path d={`M -60 ${HEAD.y - 24} Q -62 ${HEAD.y} -52 ${HEAD.y + 8} Q -48 ${HEAD.y - 12} -52 ${HEAD.y - 26} Z`} fill={L.hair} opacity={0.35} />
          <path d={`M 60 ${HEAD.y - 24} Q 62 ${HEAD.y} 52 ${HEAD.y + 8} Q 48 ${HEAD.y - 12} 52 ${HEAD.y - 26} Z`} fill={L.hair} opacity={0.35} />
          {/* Crisp textured athletic crew top */}
          <path
            d={`M -56 ${HEAD.y - 22} Q -54 ${HEAD.y - 66} -16 ${HEAD.y - 72} L -6 ${HEAD.y - 78} L 4 ${HEAD.y - 72} L 18 ${HEAD.y - 78} L 28 ${HEAD.y - 70} Q 54 ${HEAD.y - 62} 56 ${HEAD.y - 22} Q 26 ${HEAD.y - 46} -56 ${HEAD.y - 22} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.8}
            strokeLinejoin="round"
          />
        </g>
      ) : null}

      {L.extra === 'mulletBlonde' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={30} stroke={0} />
          {/* Dark undercut roots at temples */}
          <path d={`M -62 ${HEAD.y - 18} Q -64 ${HEAD.y + 6} -52 ${HEAD.y + 12} Q -48 ${HEAD.y - 6} -52 ${HEAD.y - 20} Z`} fill="#1E1B18" />
          <path d={`M 62 ${HEAD.y - 18} Q 64 ${HEAD.y + 6} 52 ${HEAD.y + 12} Q 48 ${HEAD.y - 6} 52 ${HEAD.y - 20} Z`} fill="#1E1B18" />
          {/* Edgy wolf-cut / mullet bleached blonde top with jagged bangs */}
          <path
            d={`M -62 ${HEAD.y - 4} Q -66 ${HEAD.y - 54} -36 ${HEAD.y - 70} L -20 ${HEAD.y - 82} L -8 ${HEAD.y - 68} L 10 ${HEAD.y - 84} L 24 ${HEAD.y - 68} L 44 ${HEAD.y - 76} Q 68 ${HEAD.y - 48} 62 ${HEAD.y - 4} L 42 ${HEAD.y - 24} L 26 ${HEAD.y - 12} L 12 ${HEAD.y - 32} L -4 ${HEAD.y - 14} L -18 ${HEAD.y - 30} L -36 ${HEAD.y - 16} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <path d={`M -20 ${HEAD.y - 56} Q 6 ${HEAD.y - 66} 30 ${HEAD.y - 54}`} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.35} strokeLinecap="round" />
        </g>
      ) : null}

      {L.extra === 'commaHair' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={28} stroke={0} />
          {/* Korean Comma Hair (tóc dấu phẩy): sleek side part + inward C-curved front comma lock */}
          <path
            d={`M -64 ${HEAD.y - 6} Q -68 ${HEAD.y - 68} 0 ${HEAD.y - 72} Q 68 ${HEAD.y - 68} 64 ${HEAD.y - 6} Q 46 ${HEAD.y - 28} 18 ${HEAD.y - 48} Q 8 ${HEAD.y - 28} -6 ${HEAD.y - 18} Q 2 ${HEAD.y - 36} -8 ${HEAD.y - 48} Q -34 ${HEAD.y - 34} -64 ${HEAD.y - 6} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.8}
            strokeLinejoin="round"
          />
          <path d={`M -28 ${HEAD.y - 52} Q -4 ${HEAD.y - 62} 22 ${HEAD.y - 52}`} stroke="#FFFFFF" strokeWidth={2.8} fill="none" opacity={0.22} strokeLinecap="round" />
        </g>
      ) : null}

      {L.extra === 'policeCap' ? (
        <g transform={`translate(${-pose.yaw * 12} 0)`}>
          <path d={`M -62 ${HEAD.y - 32} Q -66 ${HEAD.y - 94} 0 ${HEAD.y - 96} Q 66 ${HEAD.y - 94} 62 ${HEAD.y - 32} Z`} fill={L.hat ?? '#4D6A42'} stroke={L.line} strokeWidth={3.8} strokeLinejoin="round" />
          <rect x={-62} y={HEAD.y - 42} width={124} height={12} fill="#DC2626" stroke={L.line} strokeWidth={2.5} />
          <polygon points={`0,${HEAD.y - 40} -4,${HEAD.y - 32} 5,${HEAD.y - 37} -5,${HEAD.y - 37} 4,${HEAD.y - 32}`} fill="#FBBF24" />
          <path d={`M -66 ${HEAD.y - 32} Q 0 ${HEAD.y - 20} 66 ${HEAD.y - 32} Q 0 ${HEAD.y - 14} -66 ${HEAD.y - 32} Z`} fill="#1C1917" stroke={L.line} strokeWidth={3} />
        </g>
      ) : null}

      {L.extra === 'guardCap' ? (
        <g transform={`translate(${-pose.yaw * 12} 0)`}>
          <path d={`M -62 ${HEAD.y - 32} Q -66 ${HEAD.y - 94} 0 ${HEAD.y - 96} Q 66 ${HEAD.y - 94} 62 ${HEAD.y - 32} Z`} fill={L.hat ?? '#1E293B'} stroke={L.line} strokeWidth={3.8} strokeLinejoin="round" />
          <rect x={-62} y={HEAD.y - 42} width={124} height={12} fill="#0F172A" stroke={L.line} strokeWidth={2.5} />
          <polygon points={`0,${HEAD.y - 41} 5,${HEAD.y - 36} 3,${HEAD.y - 31} 0,${HEAD.y - 30} -3,${HEAD.y - 31} -5,${HEAD.y - 36}`} fill="#CBD5E1" stroke={L.line} strokeWidth={1.5} />
          <path d={`M -66 ${HEAD.y - 32} Q 0 ${HEAD.y - 20} 66 ${HEAD.y - 32} Q 0 ${HEAD.y - 14} -66 ${HEAD.y - 32} Z`} fill="#0B0F19" stroke={L.line} strokeWidth={3} />
        </g>
      ) : null}

      {L.extra === 'babyHood' ? (
        <g>
          {/* Cute round bear ears on the baby bonnet */}
          <circle cx={-48} cy={HEAD.y - 64} r={14} fill={L.jacket} stroke={L.line} strokeWidth={3.2} />
          <circle cx={-48} cy={HEAD.y - 64} r={7} fill={L.accent} opacity={0.65} />
          <circle cx={48} cy={HEAD.y - 64} r={14} fill={L.jacket} stroke={L.line} strokeWidth={3.2} />
          <circle cx={48} cy={HEAD.y - 64} r={7} fill={L.accent} opacity={0.65} />
          <path d={`M -66 ${HEAD.y + 14} Q -76 ${HEAD.y - 84} 0 ${HEAD.y - 88} Q 76 ${HEAD.y - 84} 66 ${HEAD.y + 14} Q 50 ${HEAD.y - 36} 0 ${HEAD.y - 42} Q -50 ${HEAD.y - 36} -66 ${HEAD.y + 14} Z`} fill={L.jacket} stroke={L.line} strokeWidth={3.8} strokeLinejoin="round" />
          {/* Curled baby hair lock peeking out on the forehead */}
          <path d={`M -4 ${HEAD.y - 42} Q 8 ${HEAD.y - 28} -2 ${HEAD.y - 22} Q -10 ${HEAD.y - 24} -6 ${HEAD.y - 32}`} stroke={L.hair} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        </g>
      ) : null}

      <Face
        expr={pose.expr}
        blink={pose.blink}
        look={pose.look}
        glasses={pose.glasses}
        readingGlasses={L.glassesDefault}
        yaw={pose.yaw}
        ink={L.face}
        skinShade={L.skinShade}
        glint={pose.glint}
        glintColor={pose.glintColor}
        talk={pose.talk}
        mouthShape={pose.mouthShape}
        lipTremble={pose.lipTremble}
        ageLines={L.ageLines}
        moustache={L.moustache}
        hairColor={L.hair}
        feminine={L.feminine}
        browSlit={L.browSlit}
      />

      {L.extra === 'hardhat' ? (
        <g transform={`translate(${-pose.yaw * 12} 0)`}>
          <path d={`M -62 ${HEAD.y - 38} Q -66 ${HEAD.y - 96} 0 ${HEAD.y - 98} Q 66 ${HEAD.y - 96} 62 ${HEAD.y - 38} Z`} fill={L.hat ?? '#F2B33D'} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M -14 ${HEAD.y - 96} L -14 ${HEAD.y - 44} M 14 ${HEAD.y - 96} L 14 ${HEAD.y - 44}`} stroke={L.line} strokeWidth={3} opacity={0.35} />
          <path d={`M -46 ${HEAD.y - 60} Q -42 ${HEAD.y - 84} -18 ${HEAD.y - 90}`} stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.45} />
          <rect x={-78 - pose.yaw * 8} y={HEAD.y - 46} width={156} height={13} rx={6} fill={L.hat ?? '#F2B33D'} stroke={L.line} strokeWidth={4} />
        </g>
      ) : null}

      {L.extra === 'curls' ? <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={26} extra={4} stroke={0} /> : null}
      {L.extra === 'curls' ? (
        <g transform={`translate(${-pose.yaw * 12} 0)`}>
          {[-150, -125, -100, -78, -55, -30].map((deg, k) => {
            const a = (deg * Math.PI) / 180;
            return <circle key={k} cx={Math.cos(a) * 54} cy={HEAD.y + Math.sin(a) * 54} r={24} fill={L.hair} />;
          })}
          {Math.abs(pose.yaw) > 0.2
            ? [
                [-26, 50, 21],
                [-2, 58, 20],
                [22, 50, 17],
              ].map(([dy, dx, r], k) => (
                <circle key={`bk${k}`} cx={-Math.sign(pose.yaw) * dx * 0.9} cy={HEAD.y + dy} r={r} fill={L.hair} opacity={Math.min(1, (Math.abs(pose.yaw) - 0.2) * 4)} />
              ))
            : null}
        </g>
      ) : null}
      {L.extra === 'thaoHair' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={34} flare={7} extra={5} stroke={0} />
          <TempleLocks yaw={pose.yaw} hair={L.hair} line={L.line} reach={24} />
          {/* Cute half-up topknot on top of the head tied with a red elastic band (matching Thảo 8t concept v4) */}
          <g transform={`translate(${-pose.yaw * 22} 0)`}>
            <path
              d={`M -16 ${HEAD.y - 64} Q -28 ${HEAD.y - 98} -4 ${HEAD.y - 96} Q 18 ${HEAD.y - 98} 16 ${HEAD.y - 64} Z`}
              fill={L.hair}
              stroke={L.line}
              strokeWidth={3}
              strokeLinejoin="round"
            />
            <ellipse cx={0} cy={HEAD.y - 66} rx={12} ry={5} fill="#D6453A" stroke={L.line} strokeWidth={2.2} />
          </g>
          {/* Soft cheek-framing locks */}
          <path
            d={`M -58 ${HEAD.y - 4} Q -68 ${HEAD.y + 28} -52 ${HEAD.y + 52} Q -40 ${HEAD.y + 44} -44 ${HEAD.y + 12} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.8}
          />
          <path
            d={`M 58 ${HEAD.y - 4} Q 68 ${HEAD.y + 28} 52 ${HEAD.y + 52} Q 40 ${HEAD.y + 44} 44 ${HEAD.y + 12} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.8}
          />
          {/* Rounded child bangs parted gently over forehead */}
          <path
            d={`M -64 ${HEAD.y + 4} Q -68 ${HEAD.y - 68} 0 ${HEAD.y - 70} Q 68 ${HEAD.y - 68} 64 ${HEAD.y + 4} Q 48 ${HEAD.y - 24} 28 ${HEAD.y - 32} L 18 ${HEAD.y - 22} L 8 ${HEAD.y - 38} L -6 ${HEAD.y - 24} L -18 ${HEAD.y - 36} Q -44 ${HEAD.y - 26} -64 ${HEAD.y + 4} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.8}
            strokeLinejoin="round"
          />
        </g>
      ) : null}

      {L.extra === 'locHair' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={28} flare={5} extra={4} stroke={0} />
          {/* Messy grey-streaked dark hair with angular receding temples (matching Ông Lộc concept v4) */}
          <path
            d={`M -64 ${HEAD.y - 2} Q -74 ${HEAD.y - 48} -46 ${HEAD.y - 68} L -52 ${HEAD.y - 78} L -28 ${HEAD.y - 74} Q 0 ${HEAD.y - 86} 32 ${HEAD.y - 74} L 50 ${HEAD.y - 80} L 44 ${HEAD.y - 66} Q 72 ${HEAD.y - 46} 64 ${HEAD.y - 2} Q 52 ${HEAD.y - 30} 36 ${HEAD.y - 46} L 20 ${HEAD.y - 34} L 8 ${HEAD.y - 52} L -14 ${HEAD.y - 38} L -32 ${HEAD.y - 50} Q -50 ${HEAD.y - 32} -64 ${HEAD.y - 2} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.8}
            strokeLinejoin="round"
          />
          {/* Silver-grey hair streaks */}
          <path
            d={`M -44 ${HEAD.y - 48} Q -20 ${HEAD.y - 68} 4 ${HEAD.y - 62} M 14 ${HEAD.y - 58} Q 34 ${HEAD.y - 66} 48 ${HEAD.y - 44} M -52 ${HEAD.y - 26} Q -42 ${HEAD.y - 42} -26 ${HEAD.y - 44}`}
            stroke="#9E9B95"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            opacity={0.78}
          />
        </g>
      ) : null}

      {L.extra === 'lowTie' ? (
        <g>
          <SideHair yaw={pose.yaw} hair={L.hair} line={L.line} bottom={32} flare={6} extra={5} stroke={0} />
          <TempleLocks yaw={pose.yaw} hair={L.hair} line={L.line} reach={26} />
          {/* Soft everyday parted front bangs for Mother (`CHAR-ME`, ~38-42yo, tóc buộc thấp giản dị) */}
          <path
            d={`M -64 ${HEAD.y + 4} Q -68 ${HEAD.y - 66} 0 ${HEAD.y - 70} Q 68 ${HEAD.y - 66} 64 ${HEAD.y + 4} Q 50 ${HEAD.y - 22} 30 ${HEAD.y - 36} Q 8 ${HEAD.y - 48} -12 ${HEAD.y - 50} Q -34 ${HEAD.y - 38} -64 ${HEAD.y + 4} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.8}
            strokeLinejoin="round"
          />
          {/* Gentle loose side wisps framing the temples */}
          <path
            d={`M -58 ${HEAD.y - 2} Q -66 ${HEAD.y + 22} -54 ${HEAD.y + 38} Q -46 ${HEAD.y + 24} -48 ${HEAD.y + 4} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.4}
          />
          <path
            d={`M 58 ${HEAD.y - 2} Q 66 ${HEAD.y + 22} 54 ${HEAD.y + 38} Q 46 ${HEAD.y + 24} 48 ${HEAD.y + 4} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={2.4}
          />
        </g>
      ) : null}
    </g>
  );

  // Back hair layer rendered BEHIND torso & neck so female & long hairstyles have lush volume with zero neck gaps
  const backHair = (
    <g transform={`rotate(${pose.tilt}) translate(0 ${liftY * 0.3}) rotate(${pose.headTilt} 0 ${HEAD.y + 40})`}>
      {L.extra === 'lowTie' ? (
        (() => {
          const bDir = pose.yaw >= 0 ? -1 : 1;
          const bx = bDir * (42 + Math.abs(pose.yaw) * 24);
          const by = HEAD.y + 24;
          return (
            <g>
              <path
                d={`M -68 ${HEAD.y - 12} Q -76 ${HEAD.y + 34} -38 ${HEAD.y + 48} Q 0 ${HEAD.y + 56} 38 ${HEAD.y + 48} Q 76 ${HEAD.y + 34} 68 ${HEAD.y - 12} Z`}
                fill={L.hair}
                stroke={L.line}
                strokeWidth={3.2}
              />
              {/* Simple low-tied hair tail with a plain dark fabric tie (no ornate hairpin) */}
              <path
                d={`M ${bx - bDir * 6} ${by - 12} Q ${bx + bDir * 24} ${by - 10} ${bx + bDir * 28} ${by + 16} Q ${bx + bDir * 12} ${by + 28} ${bx - bDir * 8} ${by + 12} Z`}
                fill={L.hair}
                stroke={L.line}
                strokeWidth={3.2}
                strokeLinejoin="round"
              />
              <ellipse cx={bx - bDir * 4} cy={by} rx={5.5} ry={11} fill="#6E4B3A" stroke={L.line} strokeWidth={2.2} />
            </g>
          );
        })()
      ) : L.extra === 'thaoHair' ? (
        <g>
          <path
            d={`M -68 ${HEAD.y - 12} Q -80 ${HEAD.y + 34} -56 ${HEAD.y + 70} Q 0 ${HEAD.y + 78} 56 ${HEAD.y + 70} Q 80 ${HEAD.y + 34} 68 ${HEAD.y - 12} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3.2}
            strokeLinejoin="round"
          />
          <ellipse cx={0} cy={HEAD.y + 42} rx={34} ry={24} fill="#08060E" opacity={0.28} />
        </g>
      ) : L.extra === 'longWave' ? (
        <g>
          <path
            d={`M -66 ${HEAD.y - 12} Q -84 ${HEAD.y + 32} -68 ${HEAD.y + 78} Q -82 ${HEAD.y + 116} -58 ${HEAD.y + 150} Q -28 ${HEAD.y + 162} 0 ${HEAD.y + 154} Q 28 ${HEAD.y + 162} 58 ${HEAD.y + 150} Q 82 ${HEAD.y + 116} 68 ${HEAD.y + 78} Q 84 ${HEAD.y + 32} 66 ${HEAD.y - 12} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3.6}
            strokeLinejoin="round"
          />
          {/* Deep inner shadow behind neck for rich 3D depth */}
          <ellipse cx={0} cy={HEAD.y + 62} rx={42} ry={46} fill="#08060E" opacity={0.32} />
        </g>
      ) : L.extra === 'longHair' ? (
        <g>
          <path
            d={`M -64 ${HEAD.y - 10} Q -74 ${HEAD.y + 64} -60 ${HEAD.y + 142} Q 0 ${HEAD.y + 154} 60 ${HEAD.y + 142} Q 74 ${HEAD.y + 64} 64 ${HEAD.y - 10} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3.6}
            strokeLinejoin="round"
          />
          <ellipse cx={0} cy={HEAD.y + 60} rx={40} ry={44} fill="#08060E" opacity={0.3} />
        </g>
      ) : L.extra === 'cCurlLob' || L.extra === 'bob' ? (
        <g>
          <path
            d={`M -66 ${HEAD.y - 6} Q -78 ${HEAD.y + 42} -56 ${HEAD.y + 80} Q 0 ${HEAD.y + 92} 56 ${HEAD.y + 80} Q 78 ${HEAD.y + 42} 66 ${HEAD.y - 6} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3.4}
            strokeLinejoin="round"
          />
          <ellipse cx={0} cy={HEAD.y + 48} rx={36} ry={30} fill="#08060E" opacity={0.28} />
        </g>
      ) : L.extra === 'officeWave' ? (
        <g>
          <path
            d={`M -64 ${HEAD.y - 8} Q -78 ${HEAD.y + 36} -62 ${HEAD.y + 72} Q -74 ${HEAD.y + 102} -48 ${HEAD.y + 124} Q 0 ${HEAD.y + 134} 48 ${HEAD.y + 124} Q 74 ${HEAD.y + 102} 62 ${HEAD.y + 72} Q 78 ${HEAD.y + 36} 64 ${HEAD.y - 8} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3.4}
            strokeLinejoin="round"
          />
          <ellipse cx={0} cy={HEAD.y + 56} rx={38} ry={36} fill="#08060E" opacity={0.3} />
        </g>
      ) : L.extra === 'aoDaiBun' ? (
        (() => {
          const bDir = pose.yaw >= 0 ? -1 : 1;
          const bx = bDir * (44 + Math.abs(pose.yaw) * 26);
          const by = HEAD.y + 18;
          return (
            <g>
              {/* Soft nape hair curve connecting head to low chignon */}
              <path
                d={`M -58 ${HEAD.y - 6} Q -66 ${HEAD.y + 34} -36 ${HEAD.y + 44} Q 0 ${HEAD.y + 52} 36 ${HEAD.y + 44} Q 66 ${HEAD.y + 34} 58 ${HEAD.y - 6} Z`}
                fill={L.hair}
                stroke={L.line}
                strokeWidth={3.2}
              />
              {/* Traditional Vietnamese low chignon (búi tóc thấp sau gáy) + pearl hairpin */}
              <ellipse cx={bx} cy={by} rx={28} ry={22} fill={L.hair} stroke={L.line} strokeWidth={3.5} />
              <path d={`M ${bx - 16} ${by - 2} Q ${bx} ${by - 12} ${bx + 16} ${by - 2}`} stroke="#FFFFFF" strokeWidth={2.2} fill="none" opacity={0.22} strokeLinecap="round" />
              {/* Decorative ribbon wrap & golden pearl hairpin */}
              <path d={`M ${bx - bDir * 12} ${by - 16} Q ${bx - bDir * 4} ${by} ${bx - bDir * 12} ${by + 16}`} stroke={L.accent} strokeWidth={3.5} fill="none" strokeLinecap="round" />
              <line x1={bx - bDir * 18} y1={by + 8} x2={bx + bDir * 28} y2={by - 16} stroke="#FBBF24" strokeWidth={3} strokeLinecap="round" />
              <circle cx={bx + bDir * 30} cy={by - 18} r={5.5} fill="#FFF8F0" stroke={L.line} strokeWidth={2} />
            </g>
          );
        })()
      ) : L.extra === 'highPonytail' ? (
        (() => {
          const bDir = pose.yaw >= 0 ? -1 : 1;
          return (
            <g transform={`scale(${bDir} 1)`}>
              {/* Bouncy high S-curved ponytail + puffy scrunchie on the back of the crown */}
              <path
                d={`M 10 ${HEAD.y - 54} Q 54 ${HEAD.y - 102} 84 ${HEAD.y - 44} Q 96 ${HEAD.y + 8} 68 ${HEAD.y + 46} Q 54 ${HEAD.y + 12} 44 ${HEAD.y - 34} Z`}
                fill={L.hair}
                stroke={L.line}
                strokeWidth={3.5}
                strokeLinejoin="round"
              />
              <path d={`M 36 ${HEAD.y - 68} Q 68 ${HEAD.y - 72} 76 ${HEAD.y - 26}`} stroke="#FFFFFF" strokeWidth={2.6} fill="none" opacity={0.22} strokeLinecap="round" />
              <ellipse cx={22} cy={HEAD.y - 56} rx={11} ry={8} fill={L.accent} stroke={L.line} strokeWidth={2.6} />
            </g>
          );
        })()
      ) : L.extra === 'mulletBlonde' ? (
        <g>
          {/* Flared wolf-cut mullet tail behind neck */}
          <path
            d={`M -56 ${HEAD.y + 8} L -68 ${HEAD.y + 36} L -52 ${HEAD.y + 34} L -60 ${HEAD.y + 56} Q 0 ${HEAD.y + 64} 60 ${HEAD.y + 56} L 52 ${HEAD.y + 34} L 68 ${HEAD.y + 36} L 56 ${HEAD.y + 8} Z`}
            fill={L.hair}
            stroke={L.line}
            strokeWidth={3}
            strokeLinejoin="round"
          />
        </g>
      ) : null}
    </g>
  );

  // Track the lowest foot for accurate ground contact shadow even when sitting or crouching
  const footY = L.body === 'swaddle' ? 16 : Math.max(j.legL.end.y, j.legR.end.y);

  return (
    <g opacity={opacity}>
      {shadow > 0 ? (
        <g>
          <ellipse cx={pose.x} cy={pose.y + footY * pose.scale + 10} rx={72 * pose.scale} ry={13 * pose.scale} fill="#000" opacity={0.22 * shadow} />
          <ellipse cx={pose.x} cy={pose.y + footY * pose.scale + 9} rx={44 * pose.scale} ry={7 * pose.scale} fill="#000" opacity={0.2 * shadow} />
        </g>
      ) : null}
      <g transform={`translate(${pose.x} ${pose.y}) scale(${pose.scale}) rotate(${pose.spin} 0 -90)`} filter={`url(#${rimId})`}>
        <g transform={`translate(0 ${LEG_LEN}) scale(${1 + 0.6 * pose.squash} ${1 - pose.squash}) translate(0 ${-LEG_LEN})`}>
          {/* the far side is drawn first, so a turned body overlaps itself the right way */}
          {L.body === 'swaddle' ? null : pose.yaw < 0 ? (
            <>
              {leg(j.legR)}
              {shoe(j.legR)}
              {leg(j.legL)}
              {shoe(j.legL)}
            </>
          ) : (
            <>
              {leg(j.legL)}
              {shoe(j.legL)}
              {leg(j.legR)}
              {shoe(j.legR)}
            </>
          )}
          {L.body === 'swaddle' ? null : pose.yaw < 0 ? (
            <>
              {arm(j.armR)}
              {hand(j.armR, -1, pose.handR, heldProps?.R)}
            </>
          ) : (
            <>
              {arm(j.armL)}
              {hand(j.armL, 1, pose.handL, heldProps?.L)}
            </>
          )}
          {backHair}
          {/* The pelvis bridges both thigh roots; its crotch curve covers the leg attachment seams. */}
          {L.body !== 'swaddle' ? <g transform={`rotate(${pose.tilt * 0.25}) scale(${turnWidth(pose.yaw)} ${Math.max(0.15, Math.cos((pose.legL.a + pose.legR.a) * Math.PI / 360))})`}>
            <path d="M -41 -8 Q 0 -1 41 -8 Q 42 10 36 29 Q 27 37 18 32 Q 8 22 0 22 Q -8 22 -18 32 Q -27 37 -36 29 Q -42 10 -41 -8 Z" fill={L.limb} />
            <path d="M -40 -4 Q 0 4 40 -4 M 0 9 Q 2 15 0 20" stroke={L.line} strokeWidth="1.5" opacity="0.4" fill="none" />
          </g> : null}
          {torso}
          {L.body === 'swaddle' ? null : pose.yaw < 0 ? (
            <>
              {arm(j.armL)}
              {hand(j.armL, 1, pose.handL, heldProps?.L)}
            </>
          ) : (
            <>
              {arm(j.armR)}
              {hand(j.armR, -1, pose.handR, heldProps?.R)}
            </>
          )}
          {L.extra === 'hood' ? (
            <g transform={`rotate(${pose.tilt}) rotate(${pose.headTilt * 0.5} 0 ${HEAD.y + 40})`}>
              <path d={`M -70 ${HEAD.y + 14} Q -80 ${HEAD.y - 74} 0 ${HEAD.y - 80} Q 80 ${HEAD.y - 74} 70 ${HEAD.y + 14} Q 52 -100 0 -106 Q -52 -100 -70 ${HEAD.y + 14} Z`} fill={L.jacket} stroke={L.line} strokeWidth={4} />
              {(() => {
                const sw = pose.sway * 0.7 - pose.tilt * 0.6;
                return (
                  <g>
                    <path d={`M -12 -108 Q ${-14 + sw * 0.3} -88 ${-16 + sw} -66 M 12 -108 Q ${14 + sw * 0.3} -88 ${16 + sw} -66`} stroke={L.accent} strokeWidth={5} strokeLinecap="round" fill="none" />
                    <circle cx={-16 + sw} cy={-64} r={5} fill={L.accent} />
                    <circle cx={16 + sw} cy={-64} r={5} fill={L.accent} />
                  </g>
                );
              })()}
            </g>
          ) : null}
          {L.extra === 'curls' ? (
            <g transform={`rotate(${pose.tilt}) translate(${pose.yaw * 6} 0) scale(${kw} 1)`}>
              <path d="M -46 -110 Q 0 -86 46 -110" stroke="#E06A5A" strokeWidth={8} fill="none" strokeLinecap="round" />
              <rect x={-60} y={-126} width={20 / Math.max(0.6, kw)} height={32} rx={8} fill="#E06A5A" stroke={L.line} strokeWidth={4} />
              <rect x={40 - (20 / Math.max(0.6, kw) - 20)} y={-126} width={20 / Math.max(0.6, kw)} height={32} rx={8} fill="#E06A5A" stroke={L.line} strokeWidth={4} />
            </g>
          ) : null}
          {head}
        </g>
      </g>
    </g>
  );
};

/** A character is the rig in a costume: <Actor> is the same as <Hero>, named for scenes with more than one person. */
export const Actor = Hero;

/**
 * A walk in profile. `phase` advances about 0.6 a frame for a normal walk; `ground` is the floor height under the hips
 * (a number, or a function of x for stairs and slopes). Leans into the step, bobs the head, bends the elbows, swings
 * loose things (the drawstrings) a beat behind the body.
 */
export const walkPose = (
  x: number,
  phase: number,
  ground: number | ((x: number) => number),
  scale = 0.9,
  extra: Partial<Pose> = {},
  facing: 1 | -1 = 1,
): Pose => {
  const s = Math.sin(phase);
  const g = typeof ground === 'number' ? ground : ground(x);
  return {
    ...basePose,
    x,
    y: g - LEG_LEN * scale - Math.abs(Math.cos(phase)) * 7,
    scale,
    facing,
    yaw: facing,
    tilt: 5 * facing,
    headTilt: 2 * Math.sin(phase * 2),
    sway: 10 * Math.sin(phase + 0.8),
    legL: { a: 28 * s, b: -Math.max(0, 40 * Math.sin(phase + 1.2)) },
    legR: { a: -28 * s, b: -Math.max(0, 40 * Math.sin(phase + 1.2 + Math.PI)) },
    armL: { a: 24 * s, b: 12 + 14 * Math.abs(s) },
    armR: { a: 24 * s, b: 12 + 14 * Math.abs(s) },
    ...extra,
  };
};

/** Where the feet are for a pose standing at hip y: use it to put a character on a floor (y = floor - feetBelowHips). */
export const feetBelowHips = (scale: number) => LEG_LEN * scale;

// ---------- Posture & Emotional Gesture Presets (Error-free placement & acting) ----------

export type GestureKind =
  | 'idle'
  | 'explain'
  | 'point'
  | 'think'
  | 'shrug'
  | 'crossArms'
  | 'handOnChest'
  | 'slump'
  | 'recoil'
  | 'determined'
  | 'wave'
  | 'holdProp'
  | 'write';

/**
 * Apply an acting gesture to any pose while automatically selecting the NEAR arm (`yaw < 0` uses `armL`, `yaw >= 0` uses `armR`)
 * so the gesturing hand is never hidden behind the torso, and ensuring anatomical elbow flexion (elbows always bend backward/down, never hyperextending).
 */
export const gesturePose = (pose: Pose, gesture: GestureKind, amount = 1): Pose => {
  const nearLeft = pose.yaw < 0;
  const nearArm = nearLeft ? 'armL' : 'armR';
  const farArm = nearLeft ? 'armR' : 'armL';
  const nearHand = nearLeft ? 'handL' : 'handR';
  const farHand = nearLeft ? 'handR' : 'handL';
  const dir = nearLeft ? -1 : 1;
  const k = Math.max(0, Math.min(1, amount));

  switch (gesture) {
    case 'explain':
      return {
        ...pose,
        [nearArm]: { a: lerp(pose[nearArm].a, -6, k), b: lerp(pose[nearArm].b, 64, k) },
        [farArm]: { a: lerp(pose[farArm].a, 16, k), b: lerp(pose[farArm].b, -8, k) },
        [nearHand]: 'palmUp',
        [farHand]: 'rest',
        headTilt: lerp(pose.headTilt, 3 * dir, k),
      };
    case 'point':
      return {
        ...pose,
        [nearArm]: { a: lerp(pose[nearArm].a, 34, k), b: lerp(pose[nearArm].b, 48, k) },
        [farArm]: { a: lerp(pose[farArm].a, 16, k), b: lerp(pose[farArm].b, -8, k) },
        [nearHand]: 'point',
        [farHand]: 'rest',
      };
    case 'think':
      return {
        ...pose,
        [nearArm]: { a: lerp(pose[nearArm].a, 46, k), b: lerp(pose[nearArm].b, 146, k) },
        [farArm]: { a: lerp(pose[farArm].a, 6, k), b: lerp(pose[farArm].b, -22, k) },
        [nearHand]: 'pinch',
        [farHand]: 'rest',
        headTilt: lerp(pose.headTilt, 6 * dir, k),
      };
    case 'shrug':
      return {
        ...pose,
        [nearArm]: { a: lerp(pose[nearArm].a, 18, k), b: lerp(pose[nearArm].b, 78, k) },
        [farArm]: { a: lerp(pose[farArm].a, 24, k), b: lerp(pose[farArm].b, 72, k) },
        handL: 'palmUp',
        handR: 'palmUp',
        shoulderLift: lerp(pose.shoulderLift ?? 0, 0.85, k),
        headTilt: lerp(pose.headTilt, -8, k),
      };
    case 'crossArms':
      return {
        ...pose,
        [nearArm]: { a: lerp(pose[nearArm].a, -14, k), b: lerp(pose[nearArm].b, 102, k) },
        [farArm]: { a: lerp(pose[farArm].a, 18, k), b: lerp(pose[farArm].b, -96, k) },
        handL: 'fist',
        handR: 'fist',
        tilt: lerp(pose.tilt, -3 * dir, k),
      };
    case 'handOnChest':
      return {
        ...pose,
        [nearArm]: { a: lerp(pose[nearArm].a, -15, k), b: lerp(pose[nearArm].b, -130, k) },
        [farArm]: { a: lerp(pose[farArm].a, 16, k), b: lerp(pose[farArm].b, -8, k) },
        [nearHand]: 'open',
        [farHand]: 'rest',
        headTilt: lerp(pose.headTilt, -4 * dir, k),
      };
    case 'slump':
      return {
        ...pose,
        tilt: lerp(pose.tilt, 8 * dir, k),
        headTilt: lerp(pose.headTilt, 12 * dir, k),
        shoulderLift: lerp(pose.shoulderLift ?? 0, -0.8, k),
        [nearArm]: { a: lerp(pose[nearArm].a, -4, k), b: lerp(pose[nearArm].b, 16, k) },
        [farArm]: { a: lerp(pose[farArm].a, 16, k), b: lerp(pose[farArm].b, -8, k) },
        handL: 'rest',
        handR: 'rest',
      };
    case 'recoil':
      return {
        ...pose,
        tilt: lerp(pose.tilt, -9 * dir, k),
        headTilt: lerp(pose.headTilt, -6 * dir, k),
        [nearArm]: { a: lerp(pose[nearArm].a, 24, k), b: lerp(pose[nearArm].b, 82, k) },
        [farArm]: { a: lerp(pose[farArm].a, -18, k), b: lerp(pose[farArm].b, -76, k) },
        handL: 'wave',
        handR: 'wave',
        shoulderLift: lerp(pose.shoulderLift ?? 0, 0.6, k),
      };
    case 'determined':
      return {
        ...pose,
        tilt: lerp(pose.tilt, 4 * dir, k),
        [nearArm]: { a: lerp(pose[nearArm].a, -14, k), b: lerp(pose[nearArm].b, 78, k) },
        [farArm]: { a: lerp(pose[farArm].a, 14, k), b: lerp(pose[farArm].b, -68, k) },
        handL: 'fist',
        handR: 'fist',
      };
    case 'wave':
      return {
        ...pose,
        [nearArm]: { a: lerp(pose[nearArm].a, 34, k), b: lerp(pose[nearArm].b, 118, k) },
        [farArm]: { a: lerp(pose[farArm].a, 16, k), b: lerp(pose[farArm].b, -8, k) },
        [nearHand]: 'wave',
        [farHand]: 'rest',
      };
    case 'holdProp':
      return {
        ...pose,
        [nearArm]: { a: lerp(pose[nearArm].a, -8, k), b: lerp(pose[nearArm].b, 64, k) },
        [farArm]: { a: lerp(pose[farArm].a, 16, k), b: lerp(pose[farArm].b, -8, k) },
        [nearHand]: 'hold',
      };
    case 'write':
      return {
        ...pose,
        tilt: lerp(pose.tilt, 8 * dir, k),
        headTilt: lerp(pose.headTilt, 10 * dir, k),
        [nearArm]: { a: lerp(pose[nearArm].a, 12, k), b: lerp(pose[nearArm].b, 62, k) },
        [farArm]: { a: lerp(pose[farArm].a, -8, k), b: lerp(pose[farArm].b, -54, k) },
        [nearHand]: 'pinch',
        [farHand]: 'open',
      };
    case 'idle':
    default:
      return {
        ...pose,
        handL: 'rest',
        handR: 'rest',
      };
  }
};

/** Grounded standing posture with natural weight distribution, backward-pointing elbows, optional breathing clock `t`, and optional gesture. */
export const standPose = (
  x: number,
  groundY: number,
  scale = 1,
  opts: Partial<Pose> & { t?: number; seed?: number; gesture?: GestureKind } = {},
): Pose => {
  const { t, seed = 0, gesture = 'idle', ...rest } = opts;
  const br = t !== undefined ? breatheAt(t, seed) : {};
  const facing = rest.facing ?? (rest.yaw !== undefined && rest.yaw < 0 ? -1 : 1);
  // Open a little space between the relaxed arms and the shirt silhouette.
  const armL = facing === 1 ? { a: 16, b: -8 } : { a: 12, b: -4 };
  const armR = facing === 1 ? { a: 12, b: -4 } : { a: 16, b: -8 };
  const p: Pose = {
    ...basePose,
    x,
    y: groundY - LEG_LEN * scale,
    scale,
    facing,
    yaw: rest.yaw ?? 0.35 * facing,
    look: rest.look ?? 0.35 * facing,
    armL,
    armR,
    legL: { a: -5 * facing, b: 0 },
    legR: { a: 5 * facing, b: 0 },
    handL: 'rest',
    handR: 'rest',
    ...br,
    ...rest,
  };
  return gesture !== 'idle' ? gesturePose(p, gesture) : p;
};

/**
 * Seated posture in 3/4 or profile (as required by traps.md so legs read clearly on chairs/stools/benches).
 * `seatY` is the y of the chair/stool seat surface.
 * Torso leans naturally into the seated angle (`lean = 12`), elbows tuck backward at the waist, and forearms rest forward on the thighs.
 */
export const sitPose = (
  x: number,
  seatY: number,
  scale = 1,
  facing: 1 | -1 = 1,
  opts: Partial<Pose> & { t?: number; seed?: number; gesture?: GestureKind; lean?: number } = {},
): Pose => {
  const { t, seed = 0, gesture = 'idle', lean = 12, ...rest } = opts;
  const br = t !== undefined ? breatheAt(t, seed) : {};
  // Anatomical seated arms: upper arm angles slightly backward so the elbow points back, forearm bends forward onto the lap/thighs:
  const armL = facing === 1 ? { a: 14, b: -58 } : { a: -18, b: 64 };
  const armR = facing === 1 ? { a: -18, b: 64 } : { a: 14, b: -58 };
  const p: Pose = {
    ...basePose,
    x,
    y: seatY - 6 * scale,
    scale,
    facing,
    yaw: rest.yaw ?? 0.65 * facing,
    look: rest.look ?? 0.45 * facing,
    tilt: lean * facing,
    headTilt: rest.headTilt ?? -7 * facing,
    legL: { a: 78, b: -78 },
    legR: { a: 72, b: -74 },
    armL,
    armR,
    handL: 'rest',
    handR: 'rest',
    ...br,
    ...rest,
  };
  return gesture !== 'idle' ? gesturePose(p, gesture) : p;
};

/** Crouching / squatting posture on `groundY` with forward torso lean and backward-pointing elbows. */
export const crouchPose = (
  x: number,
  groundY: number,
  scale = 1,
  facing: 1 | -1 = 1,
  opts: Partial<Pose> & { gesture?: GestureKind } = {},
): Pose => {
  const { gesture = 'idle', ...rest } = opts;
  const armL = facing === 1 ? { a: -14, b: -48 } : { a: 8, b: 58 };
  const armR = facing === 1 ? { a: 8, b: 58 } : { a: -14, b: -48 };
  const p: Pose = {
    ...basePose,
    x,
    y: groundY - 72 * scale,
    scale,
    facing,
    yaw: rest.yaw ?? 0.7 * facing,
    tilt: 16 * facing,
    headTilt: -8 * facing,
    legL: { a: 68, b: -118 },
    legR: { a: 62, b: -112 },
    armL,
    armR,
    handL: facing === 1 ? 'open' : 'point',
    handR: facing === 1 ? 'point' : 'open',
    ...rest,
  };
  return gesture !== 'idle' ? gesturePose(p, gesture) : p;
};


/** Ease into a gesture, with a small head lag; exact endpoints and original bone anchors are preserved. */
export const gestureAt = (base: Pose, gesture: GestureKind, t: number, from = 0, duration = 24): Pose => {
  const end = gesturePose(base, gesture);
  const u = clamp((t - from) / Math.max(1, duration));
  const result = poseAt(u, [{ f: 0, p: base }, { f: 1, p: end }]);
  return { ...result, headTilt: lerp(base.headTilt, end.headTilt, easeInOut(clamp((u - 0.08) / 0.92))), cloth: (base.cloth ?? 0) + Math.sin(Math.PI * u) * 0.35 };
};
