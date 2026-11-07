import React, { useId } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CloudBank, ImpactBurst, RainSheet, SmokePlume, WaterRipple, WindSway, lightFlickerAt } from './engine/vfx';
import { Dust } from './engine/light';
import { KitDefs } from './engine/kit';
import { Hero, LOOKS, basePose, blinkAt, gestureAt, standPose, type MouthShape } from './engine/rig';
import { mouthCueAt } from './engine/mouth';
import { FONT } from './engine/fonts';

export const VFX_SAMPLES = [
  { id: 'Wind', title: 'Gió lay vật nhẹ', note: 'Gốc cố định · ngọn chuyển động lệch nhịp' },
  { id: 'Clouds', title: 'Mây trôi', note: 'Nhiều lớp · tốc độ khác nhau' },
  { id: 'Dust', title: 'Bụi trong ánh sáng', note: 'Gần–xa · nhẹ dần ở mép khung' },
  { id: 'Smoke', title: 'Khói & hơi nước', note: 'Bốc từ nguồn · loãng và tản dần' },
  { id: 'Face', title: 'Mắt & cử chỉ miệng', note: 'Khép–mở · nói · mím môi · cười nhẹ' },
  { id: 'Light', title: 'Ánh đèn chập chờn nhẹ', note: 'Cường độ có nhịp · nguồn đèn cố định' },
  { id: 'Rain', title: 'Mưa có gió', note: 'Lớp gần–xa · hạt dài ngắn khác nhau' },
  { id: 'Ripple', title: 'Gợn nước', note: 'Lan từ điểm chạm · rộng và nhạt dần' },
  { id: 'Impact', title: 'Bụi khi chạm đất', note: 'Bật lên đúng điểm chạm · rồi tan' },
] as const;
type VfxId = typeof VFX_SAMPLES[number]['id'];

const Surface: React.FC<{ t: number; effect: VfxId }> = ({ t, effect }) => {
  const id = `sample-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const m = t % 360;
  const mouth = mouthCueAt(m, [
    {from:45,to:57,shape:'a',open:0.45}, {from:59,to:69,shape:'e',open:0.35},
    {from:70,to:80,shape:'closed'}, {from:81,to:95,shape:'o',open:0.48},
    {from:104,to:115,shape:'fv',open:0.2}, {from:116,to:130,shape:'a',open:0.4},
    {from:133,to:149,shape:'u',open:0.35}, {from:180,to:228,shape:'pressed',tremble:0.18},
    {from:245,to:298,shape:'smile'}, {from:310,to:335,shape:'o',open:0.2},
  ]);
  const talking = m >= 45 && m < 150;
  return <g>
    <defs>
      <linearGradient id={id} x2="0" y2="1"><stop stopColor="#132d42" /><stop offset="1" stopColor="#547777" /></linearGradient>
      <radialGradient id={`${id}-lamp`}><stop stopColor="#f5c66d" stopOpacity="0.46" /><stop offset="1" stopColor="#f5c66d" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="560" height="190" fill={effect === 'Smoke' || effect === 'Dust' || effect === 'Light' ? '#152127' : `url(#${id})`} />
    {effect === 'Wind' ? <>
      <path d="M 0 161 Q 180 146 560 163 L 560 190 L 0 190 Z" fill="#273e35" />
      {Array.from({ length: 17 }, (_, i) => <WindSway key={i} t={t} x={32 + i * 30} y={173 + Math.sin(i) * 4} seed={i * 0.5} strength={8}>
        <path d={`M 0 0 Q ${-5 + i % 4} -35 ${-13 + i % 9} ${-55 - i % 5 * 7}`} fill="none" stroke={i % 2 ? '#adc88f' : '#6a9b79'} strokeWidth={i % 3 === 0 ? 3 : 2} strokeLinecap="round" />
        <path d="M -3 -20 Q -27 -36 -14 -38 Q 0 -35 -3 -20" fill="#719c6c" />
      </WindSway>)}
    </> : effect === 'Clouds' ? <>
      <CloudBank t={t} w={560} h={155} speed={0.22} opacity={0.32} />
      <CloudBank t={t} y={65} w={560} h={100} seed={9} speed={0.55} opacity={0.47} />
      <path d="M 0 174 L 65 130 L 130 174 L 177 151 L 215 179 L 346 165 L 437 140 L 511 177 L 560 160 V 190 H 0 Z" fill="#253c45" />
    </> : effect === 'Dust' ? <>
      <path d="M 72 0 L 170 0 L 427 190 L 144 190 Z" fill="#d4b779" opacity="0.11" />
      <Dust t={t} seed={5} x0={85} y0={0} w={360} h={188} n={65} o={0.8} wind={0.55} />
    </> : effect === 'Smoke' ? <>
      <SmokePlume t={t} x={275} y={166} height={155} wind={0.4} opacity={0.65} />
      <path d="M 247 154 L 307 154 L 300 188 L 255 188 Z" fill="#9a7758" />
      <ellipse cx={277} cy={155} rx={30} ry={5} fill="#44372d" />
      <path d="M 306 162 Q 336 159 326 177 Q 318 184 303 176" fill="none" stroke="#b89d7e" strokeWidth="5" />
    </> : effect === 'Face' ? <>
      <Hero pose={{ ...basePose, x: 280, y: 245, scale: 0.89, yaw: 0.12, blink: blinkAt(t, 3), ...mouth, expr: m < 232 ? 'thinking' : 'relieved' }} look={LOOKS.duy} shadow={0} rimId="rimShopWarm" />
      <text x="18" y="174" fill="#b9d9dc" fontFamily={FONT.ui} fontSize="17">{talking ? 'Khẩu hình minh họa' : m < 232 ? 'Mím môi / rung môi nhẹ' : m < 298 ? 'Cười nhẹ' : 'Hé miệng / thở ra'}</text>
    </> : effect === 'Light' ? <>
      <ellipse cx={280} cy={75} rx={170} ry={150} fill={`url(#${id}-lamp)`} opacity={lightFlickerAt(t, 3, 0.55)} />
      <path d="M 280 0 V 54 M 250 70 L 310 70 L 299 54 L 261 54 Z" stroke="#484d49" fill="#52615c" strokeWidth="4" />
      <ellipse cx={280} cy={72} rx={25} ry={4} fill="#ffd68a" opacity={lightFlickerAt(t, 3, 0.45)} />
      <Dust t={t} seed={3} x0={130} y0={80} w={300} h={105} n={16} o={lightFlickerAt(t, 3) * 0.4} />
    </> : effect === 'Rain' ? <>
      <path d="M 0 168 L 60 124 L 120 168 L 180 135 L 245 168 L 370 168 L 440 119 L 520 168 V 190 H 0" fill="#243941" />
      <RainSheet t={t} w={560} h={190} wind={-0.3} count={66} />
      <RainSheet t={t} w={560} h={190} wind={-0.3} count={14} seed={12} opacity={0.3} />
    </> : effect === 'Ripple' ? <>
      <ellipse cx={280} cy={142} rx={210} ry={45} fill="#264c5b" />
      {[0, 1, 2].map(i => <WaterRipple key={i} t={(t + i * 23) % 70} life={70} x={220 + i * 40} y={133 + i * 9} radius={110} />)}
    </> : <>
      <path d="M 0 162 H 560 V 190 H 0 Z" fill="#62584d" />
      <g transform={`translate(280 ${m % 120 < 35 ? 75 + 87 * Math.pow((m % 120) / 35, 2) : 162})`}>
        <path d="M -22 -22 H 22 V 0 H -22 Z" fill="#ba9d70" stroke="#3e352d" strokeWidth="2" />
      </g>
      <ImpactBurst t={m % 120 - 35} x={280} y={162} size={1.3} />
    </>}
  </g>;
};

export const VfxSheet: React.FC<{ effect?: VfxId }> = ({ effect }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame * 30 / fps;
  const items = effect ? VFX_SAMPLES.filter(s => s.id === effect) : VFX_SAMPLES;
  return <AbsoluteFill style={{ background: '#0b151c' }}>
    <svg width="100%" height="100%" viewBox="0 0 1920 1080">
      <KitDefs />
      <text x="64" y="67" fill="#eef0dc" fontSize="42" fontFamily={FONT.title} fontWeight="700">{effect ? items[0].title : 'Chuyển động nhỏ, không gian sống động'}</text>
      <text x="66" y="109" fill="#a3b7bd" fontSize="22" fontFamily={FONT.ui}>VFX dùng chung · gió, không khí, vật liệu và biểu cảm</text>
      {items.map((s, i) => {
        const x = effect ? 64 : 64 + i % 3 * 600, y = effect ? 170 : 158 + Math.floor(i / 3) * 286;
        const scale = effect ? 3.2 : 1;
        return <g key={s.id} transform={`translate(${x} ${y}) scale(${scale})`}>
          <rect width="560" height="258" rx="16" fill="#162630" stroke="#31444b" />
          <svg x="0" y="0" width="560" height="190" viewBox="0 0 560 190" overflow="hidden"><Surface t={t} effect={s.id} /></svg>
          <text x="18" y="219" fill="#edf0dc" fontSize="23" fontFamily={FONT.title} fontWeight="600">{s.title}</text>
          <text x="18" y="243" fill="#a2b9bb" fontSize="14" fontFamily={FONT.ui}>{s.note}</text>
        </g>;
      })}
      <text x="66" y="1050" fill="#87a0a8" fontSize="20" fontFamily={FONT.ui}>Mẫu chuyển động không có giọng · khẩu hình chưa đồng bộ lời thoại</text>
    </svg>
  </AbsoluteFill>;
};

export const RigMotionSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame * 30 / fps;
  const p = t % 240;
  const make = (x: number, scale: number, seed: number) => {
    const base = standPose(x, 900 - 16.2 * scale, scale, { t, seed, yaw: 0.25 });
    const a = gestureAt(base, 'explain', p < 120 ? p : 240 - p, 16, 55);
    return { ...a, blink: blinkAt(t, seed), ...mouthCueAt(p, seed === 3 ? [{from:120,to:140,shape:'a',open:0.25},{from:146,to:170,shape:'o',open:0.2}] : [{from:205,to:218,shape:'a',open:0.25},{from:221,to:232,shape:'e',open:0.2}]) };
  };
  const actors = [{ x: 350, scale: 1.65, look: LOOKS.duy, name: 'Áo thun · vai, khuỷu tay', seed: 1 }, { x: 960, scale: 1.25, look: LOOKS.thao, name: 'Áo rộng · quần ngắn · túi bám thân', seed: 3 }, { x: 1550, scale: 1.6, look: LOOKS.ongLoc, name: 'Sơ mi · tay áo · gấu vải', seed: 5 }];
  const hold = gestureAt(standPose(350, 900 - 16.2 * 1.65, 1.65, { t, seed: 1, yaw: 0.25, handR: 'hold' }), 'holdProp', p < 120 ? p : 240 - p, 16, 55);

  return <AbsoluteFill style={{ background: '#18282f' }}><svg width="100%" height="100%" viewBox="0 0 1920 1080">
    <KitDefs />
    <text x="72" y="84" fill="#f3efd9" fontSize="44" fontFamily={FONT.title} fontWeight="700">Thử khớp, dáng áo và chuyển động</text>
    <text x="74" y="129" fill="#adc2c4" fontSize="22" fontFamily={FONT.ui}>Giữ nhận diện nhân vật · khối mềm · bàn chân và đạo cụ có điểm tựa</text>
    <path d="M 70 900 H 1850" stroke="#53615f" strokeWidth="3" />
    {actors.map((actor, i) => <g key={actor.seed}>
      <Hero pose={i === 0 ? { ...hold, blink: blinkAt(t, 1), ...mouthCueAt(p,[{from:35,to:53,shape:'a',open:0.35},{from:57,to:72,shape:'e',open:0.28},{from:79,to:96,shape:'o',open:0.3}]) } : make(actor.x, actor.scale, actor.seed)} look={actor.look} rimId="rimShopWarm" heldProps={i === 0 ? { R: <g><rect x="-10" y="7" width="19" height="31" rx="3" fill="#252e3a" stroke="#abb5b4" strokeWidth="1.8" /><rect x="-7" y="10" width="13" height="23" rx="1.5" fill="#6b8796" /></g> } : undefined} />
      <text x={actor.x} y="961" textAnchor="middle" fill="#d2e1da" fontSize="22" fontFamily={FONT.title}>{actor.name}</text>
    </g>)}
    <text x="74" y="1032" fill="#8ca7aa" fontSize="20" fontFamily={FONT.ui}>Bài thử dùng chung · cần duyệt lại tiếp xúc trong từng shot của phim</text>
  </svg></AbsoluteFill>;
};
