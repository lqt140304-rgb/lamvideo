import React, { useId } from 'react';
import { GoldenField, GoldenForeground, BankGrain } from './golden_grain';
import { rnd } from '../anim';
import { BanyanTree } from './banyan_tree';
import { Dust } from '../light';
import { CloudBank, SmokePlume, WaterRipple, windAt } from '../vfx';

/**
 * Detailed Vietnamese Red Dragonfly (`chuồn chuồn ớt` — Crocothemis servilia):
 * Prominent scarlet-red segmented abdomen, large round compound eyes,
 * and 4 transparent crystalline wings with amber basal patches and dark pterostigma.
 */
export const RedDragonfly: React.FC<{
  x: number;
  y: number;
  s?: number;
  rot?: number;
  t?: number;
  phase?: number;
}> = ({ x, y, s = 1, rot = 0, t = 0, phase = 0 }) => {
  const flap1 = Math.sin(t * 0.48 + phase) * 16;
  const flap2 = Math.sin(t * 0.48 + phase + 0.6) * 14;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {/* Soft warm sun glow halo behind wings */}
      <ellipse cx={0} cy={2} rx={22} ry={14} fill="#FFEAA7" opacity={0.3} />

      {/* Hindwings (Cánh sau) */}
      <g transform={`rotate(${flap2})`}>
        {/* Left hindwing */}
        <g transform="translate(-2 -3) rotate(-34)">
          <path d="M 0 0 C -8 -16 -24 -24 -36 -18 C -42 -14 -38 -4 -22 -1 C -12 1 -4 0 0 0 Z" fill="rgba(255, 248, 222, 0.78)" stroke="#4A2616" strokeWidth={1} />
          <path d="M 0 0 C -4 -6 -10 -8 -14 -6 C -12 -2 -5 0 0 0 Z" fill="#E89B2B" opacity={0.7} />
          <path d="M 0 0 Q -18 -12 -34 -17" stroke="#3D1E10" strokeWidth={0.8} fill="none" />
          <rect x={-32} y={-17} width={5} height={2} rx={0.5} fill="#94180E" stroke="#4A0C06" strokeWidth={0.5} transform="rotate(-15 -32 -17)" />
        </g>
        {/* Right hindwing */}
        <g transform="translate(2 -3) rotate(34)">
          <path d="M 0 0 C 8 -16 24 -24 36 -18 C 42 -14 38 -4 22 -1 C 12 1 4 0 0 0 Z" fill="rgba(255, 248, 222, 0.78)" stroke="#4A2616" strokeWidth={1} />
          <path d="M 0 0 C 4 -6 10 -8 14 -6 C 12 -2 5 0 0 0 Z" fill="#E89B2B" opacity={0.7} />
          <path d="M 0 0 Q 18 -12 34 -17" stroke="#3D1E10" strokeWidth={0.8} fill="none" />
          <rect x={27} y={-18} width={5} height={2} rx={0.5} fill="#94180E" stroke="#4A0C06" strokeWidth={0.5} transform="rotate(15 27 -18)" />
        </g>
      </g>

      {/* Forewings (Cánh trước) */}
      <g transform={`rotate(${flap1})`}>
        {/* Left forewing */}
        <g transform="translate(-1 -7) rotate(-16)">
          <path d="M 0 0 C -10 -12 -28 -18 -42 -10 C -46 -6 -38 1 -24 3 C -12 4 -4 1 0 0 Z" fill="rgba(255, 250, 230, 0.84)" stroke="#4A2616" strokeWidth={1} />
          <path d="M 0 0 C -4 -4 -9 -5 -12 -3 C -10 -1 -4 0 0 0 Z" fill="#E89B2B" opacity={0.6} />
          <path d="M 0 0 Q -20 -8 -40 -10" stroke="#3D1E10" strokeWidth={0.8} fill="none" />
          <rect x={-38} y={-11} width={5.5} height={1.8} rx={0.5} fill="#94180E" stroke="#4A0C06" strokeWidth={0.5} transform="rotate(-8 -38 -11)" />
        </g>
        {/* Right forewing */}
        <g transform="translate(1 -7) rotate(16)">
          <path d="M 0 0 C 10 -12 28 -18 42 -10 C 46 -6 38 1 24 3 C 12 4 4 1 0 0 Z" fill="rgba(255, 250, 230, 0.84)" stroke="#4A2616" strokeWidth={1} />
          <path d="M 0 0 C 4 -4 9 -5 12 -3 C 10 -1 4 0 0 0 Z" fill="#E89B2B" opacity={0.6} />
          <path d="M 0 0 Q 20 -8 40 -10" stroke="#3D1E10" strokeWidth={0.8} fill="none" />
          <rect x={32.5} y={-11} width={5.5} height={1.8} rx={0.5} fill="#94180E" stroke="#4A0C06" strokeWidth={0.5} transform="rotate(8 32.5 -11)" />
        </g>
      </g>

      {/* Slender scarlet abdomen (Thân đốt đỏ ớt) */}
      <g>
        <path d="M 0 2 L 0 38" stroke="#E62817" strokeWidth={4} strokeLinecap="round" />
        <path d="M -0.6 4 L -0.6 36" stroke="#FFA394" strokeWidth={1.2} strokeLinecap="round" />
        {[7, 12, 17, 22, 27, 32].map((sy) => (
          <line key={sy} x1={-1.8} y1={sy} x2={1.8} y2={sy} stroke="#540905" strokeWidth={0.9} />
        ))}
        <path d="M -1.2 38 Q -2.5 42 -1 44 M 1.2 38 Q 2.5 42 1 44" stroke="#7A0C05" strokeWidth={0.9} fill="none" />
      </g>

      {/* Thorax (Ngực chuồn chuồn) */}
      <ellipse cx={0} cy={-2} rx={3.5} ry={5.5} fill="#C41E10" stroke="#540905" strokeWidth={1} />
      <ellipse cx={-0.8} cy={-2} rx={1.2} ry={3.5} fill="#FF7566" opacity={0.85} />

      {/* Head with bulging compound eyes (Đầu và mắt kép) */}
      <g transform="translate(0 -9)">
        <circle cx={-3.2} cy={0} r={3.2} fill="#94160C" stroke="#4A0804" strokeWidth={0.8} />
        <circle cx={-3.6} cy={-0.6} r={1.1} fill="#FFD2C8" />
        <circle cx={3.2} cy={0} r={3.2} fill="#94160C" stroke="#4A0804" strokeWidth={0.8} />
        <circle cx={2.8} cy={-0.6} r={1.1} fill="#FFD2C8" />
        <ellipse cx={0} cy={0.2} rx={2} ry={1.8} fill="#B81E12" />
      </g>
    </g>
  );
};
/** Rural sunset set; keep the bank/foot planes compatible with the existing C6–C7 shots. */
export const SunsetRiceField: React.FC<{t?:number;whiteout?:number;seatedBank?:boolean}> = ({t=0,whiteout=0,seatedBank=false}) => {
  const id = `field-${useId().replace(/[^a-zA-Z0-9]/g,'')}`;
  return <g>
    <defs>
      <linearGradient id={`${id}-sky`} x2="0" y2="1"><stop stopColor="#77799d" /><stop offset="0.36" stopColor="#b68d99" /><stop offset="0.68" stopColor="#e6a880" /><stop offset="1" stopColor="#f3cd8b" /></linearGradient>
      <radialGradient id={`${id}-sun`}><stop stopColor="#ffe6ae" stopOpacity="0.55" /><stop offset="1" stopColor="#f4bb7b" stopOpacity="0" /></radialGradient>
      <linearGradient id={`${id}-rice`} x2="0" y2="1"><stop stopColor="#d6b569" /><stop offset="1" stopColor="#9f884b" /></linearGradient>
      <linearGradient id={`${id}-water`} x2="0" y2="1"><stop stopColor="#cbad7c" /><stop offset="0.5" stopColor="#9b997a" /><stop offset="1" stopColor="#596e63" /></linearGradient>
      <linearGradient id={`${id}-bank`} x2="0.2" y2="1"><stop stopColor="#a48b53" /><stop offset="0.44" stopColor="#96704b" /><stop offset="1" stopColor="#584331" /></linearGradient>
      <clipPath id={`${id}-ditch`}><path d="M -30 717 Q 550 706 1000 723 Q 1510 734 1950 710 L 1950 758 Q 1480 774 1000 752 Q 460 740 -30 766 Z" /></clipPath>
    </defs>
    <rect width="1920" height="1080" fill={`url(#${id}-sky)`} />
    <ellipse cx="305" cy="480" rx="590" ry="430" fill={`url(#${id}-sun)`} />
    <circle cx="294" cy="477" r="48" fill="#ffe4ac" opacity="0.82" />
    <CloudBank t={t} x={-20} y={65} w={1960} h={340} seed={18} speed={0.07} color="#edd0c2" opacity={0.36} />
    <CloudBank t={t} x={-20} y={280} w={1960} h={180} seed={27} speed={0.12} color="#c58d85" opacity={0.3} />
    {/* Atmospheric depth: far tree line is lighter and less detailed than the village. */}
    <path d="M -30 554 Q 80 516 195 542 Q 300 505 430 537 Q 560 512 710 539 Q 920 495 1100 541 Q 1290 511 1460 537 Q 1690 498 1950 547 V 582 H -30 Z" fill="#95857c" opacity="0.72" />
    <g fill="#716b61" opacity="0.86">
      <path d="M 15 550 Q 30 507 54 523 Q 68 486 90 523 Q 120 508 137 549 Z M 1130 548 Q 1140 502 1168 516 Q 1185 483 1212 524 Q 1240 503 1258 550 Z" />
      <path d="M 1430 551 Q 1442 488 1472 512 Q 1500 472 1524 514 Q 1565 492 1578 551 Z" />
      <path d="M 1390 548 L 1396 483 M 1394 493 Q 1355 463 1348 480 Q 1374 486 1394 499 M 1395 489 Q 1430 458 1442 475 Q 1414 482 1395 496" fill="none" stroke="#736c5a" strokeWidth="5" />
    </g>
    <g opacity="0.88">
      <path d="M 1530 548 V 506 H 1624 V 548 Z" fill="#b69b7f" /><path d="M 1516 508 L 1571 478 L 1638 507 Z" fill="#8c6c63" />
      <path d="M 1552 521 H 1572 V 546 H 1552 Z M 1591 518 H 1610 V 530 H 1591 Z" fill="#786e5b" />
      <path d="M 1695 548 V 513 H 1790 V 548 Z" fill="#a89077" /><path d="M 1684 515 L 1735 491 L 1802 514 Z" fill="#886d64" />
      <path d="M 1712 526 H 1729 V 538 H 1712 Z" fill="#6d6a59" /><path d="M 1770 499 V 483 H 1777 V 503" stroke="#7f7163" strokeWidth="4" fill="none" />
      <SmokePlume t={t} x={1773} y={482} height={112} wind={0.26} seed={21} color="#d8c5b5" opacity={0.38} />
      <path d="M 1820 548 Q 1834 499 1857 522 Q 1874 487 1892 530 L 1909 548 Z" fill="#8d7b53" />
      <path d="M 1300 550 L 1300 465 M 1291 474 H 1309 M 1455 549 V 486 M 1448 493 H 1462" stroke="#877662" strokeWidth="2.5" fill="none" />
      <path d="M 1300 472 Q 1380 510 1455 491" fill="none" stroke="#95816d" strokeWidth="1.1" />
    </g>
    {[0,1,2,3].map(i=><path key={i} d={`M ${730+i*48+t*0.08} ${310+i%2*24} q 7 ${-3-Math.sin(t*.09+i)*3} 14 0 q 7 ${-3-Math.sin(t*.09+i)*3} 14 0`} stroke="#82726f" strokeWidth="1.7" fill="none" opacity="0.65" />)}
    <path d="M -30 556 Q 920 539 1950 558 V 774 H -30 Z" fill={`url(#${id}-rice)`} />
    <path d="M -30 589 Q 420 564 835 586 Q 1360 603 1950 575 L 1950 649 Q 1180 613 740 654 Q 290 632 -30 671 Z" fill="#c6aa61" opacity="0.7" />
    <path d="M 460 556 Q 440 617 128 717 M 1180 556 Q 1330 634 1830 717" stroke="#a18a4d" strokeWidth="3" fill="none" opacity="0.45" />
    <GoldenField t={t} />

    <path d="M -30 717 Q 550 706 1000 723 Q 1510 734 1950 710 L 1950 758 Q 1480 774 1000 752 Q 460 740 -30 766 Z" fill={`url(#${id}-water)`} />
    <g clipPath={`url(#${id}-ditch)`}>
      {Array.from({length:20},(_,i)=><path key={i} d={`M ${40+i*100+windAt(t,i,5)} ${723+i%4*9} h ${25+i%5*9}`} stroke={i%3 ? '#d9be8a' : '#6f8068'} strokeWidth="1.5" opacity="0.45" />)}
      <WaterRipple t={(t+22)%135} life={135} x={1325} y={736} radius={52} color="#e4c691" />
    </g>
    <path d="M -60 765 Q 520 735 1040 748 Q 1520 760 1980 742 V 1090 H -60 Z" fill={`url(#${id}-bank)`} />
    <path d="M -60 765 Q 520 735 1040 748 Q 1520 760 1980 742 L 1980 835 Q 1480 852 980 838 Q 480 825 -60 850 Z" fill="#9a8b50" />
    {seatedBank ? <>
      {/* A capped stone irrigation wall: the hips sit on its top, calves hang in front. */}
      <path d="M -60 790 Q 480 779 980 790 Q 1480 800 1980 784 L 1980 817 Q 1480 828 980 814 Q 480 802 -60 816 Z" fill="#b6a47e" />
      <path d="M -60 807 Q 480 794 980 805 Q 1480 818 1980 801 V 943 H -60 Z" fill="#82775f" />
      {[0,1,2].map(row=><g key={row}>
        {Array.from({length:12},(_,i)=>{
          const x=i*181-125+(row%2)*88,y=817+row*39;
          return <path key={i} d={`M ${x+3} ${y+3} Q ${x+65} ${y-2} ${x+174} ${y+2} L ${x+176} ${y+35} Q ${x+77} ${y+41} ${x} ${y+35} Z`} fill={['#93856b','#a09275','#8b8068','#ac9b79'][(i+row)%4]} stroke="#6d6855" strokeWidth="2" />;
        })}
      </g>)}
      <path d="M -60 803 Q 480 791 980 802 Q 1480 814 1980 798" fill="none" stroke="#d1bd92" strokeWidth="5" />
      {/* Blue-green water, wall shadow, broken sunset glints and a visible near bank. */}
      <path d="M -60 931 Q 520 916 1020 928 Q 1510 939 1980 919 V 1090 H -60 Z" fill="#839b8e" />
      <path d="M -60 932 Q 520 917 1020 929 Q 1510 940 1980 920 L 1980 949 Q 1510 969 1020 956 Q 520 945 -60 960 Z" fill="#4a675f" opacity="0.55" />
      {Array.from({length:12},(_,i)=><path key={`sun-${i}`} d={`M ${224+Math.sin(i*3)*45+windAt(t,i,5)} ${953+i*9} h ${75+(i%3)*31}`} stroke="#ead49d" strokeWidth={i%2?2:3.5} fill="none" opacity={.25+(i%4)*.1} />)}
      {Array.from({length:20},(_,i)=><path key={i} d={`M ${i*103+windAt(t,i,6)} ${956+i%5*23} q 24 -2 ${39+i%4*14} 0`} stroke={i%2?'#cbd0b0':'#597c70'} strokeWidth="1.5" opacity="0.5" fill="none" />)}
      <WaterRipple t={(t+40)%170} life={170} x={1250} y={1010} radius={70} color="#c0d1bc" />
      <path d="M -60 1060 Q 600 1045 1030 1069 Q 1540 1083 1980 1052 V 1090 H -60 Z" fill="#7d7151" />
      <path d="M -60 1060 Q 600 1045 1030 1069 Q 1540 1083 1980 1052" stroke="#c4b17d" strokeWidth="3" fill="none" />
    </> : <>
      <path d="M -60 807 Q 480 790 980 802 Q 1480 814 1980 799 L 1980 845 Q 1450 858 980 838 Q 450 826 -60 850 Z" fill="#847045" />
      <path d="M -60 807 Q 480 790 980 802 Q 1480 814 1980 799" fill="none" stroke="#b7a264" strokeWidth="4" />
      <path d="M -60 850 Q 480 825 980 838 Q 1480 852 1980 835 L 1980 955 Q 1460 975 960 958 Q 460 942 -60 965 Z" fill="#a17b56" />
    </>}
    <path d="M -40 765 Q 520 735 1040 748 Q 1520 760 1960 743" fill="none" stroke="#e0b971" strokeWidth="3" opacity="0.75" />
    {!seatedBank ? Array.from({length:90},(_,i)=>{
      const x=rnd(10,i)*1920,y=856+rnd(11,i)*166;
      return <g key={i} opacity={0.2+rnd(12,i)*.23}><path d={`M ${x} ${y} q ${5+rnd(13,i)*12} -3 ${11+rnd(14,i)*14} 0`} stroke="#614b34" strokeWidth={1+rnd(15,i)*2} fill="none" />
        {i%3===0?<ellipse cx={x+5} cy={y+4} rx={3+rnd(9,i)*4} ry="1.8" fill="#cfb18a" />:null}</g>;
    }) : null}
    {Array.from({length:53},(_,i)=>{
      const x=i*38-20,y=763+Math.sin(i*.32)*8, a=windAt(t,i*.7,5);
      return <g key={i} transform={`translate(${x} ${y}) rotate(${a})`} stroke={i%3?'#c3aa65':'#6d713a'} strokeWidth="1.5" fill="none" strokeLinecap="round"><path d="M 0 3 Q -4 -6 -10 -13 M 1 4 Q 3 -9 10 -17 M 3 4 L 8 -6" /></g>;
    })}
    <BankGrain t={t} />
    <BanyanTree t={t} s={1.12} />

    {/* Clustered red dragonflies hovering near ditch bank (`bờ mương nước`) */}
    {(() => {
      const swarmX = Math.sin(t * 0.04) * 20;
      const swarmY = Math.cos(t * 0.05) * 9;
      const cluster = [
        { dx: 0, dy: 0, s: 1.35, rot: -14, phase: 0 },
        { dx: 32, dy: -20, s: 1.12, rot: 12, phase: 1.8 },
        { dx: -22, dy: 14, s: 0.95, rot: -6, phase: 3.4 },
      ];
      return (
        <g id="dragonflyCluster" transform={`translate(${485 + swarmX} ${728 + swarmY})`}>
          {cluster.map((df, i) => {
            const hx = Math.sin(t * 0.12 + df.phase) * 6;
            const hy = Math.cos(t * 0.15 + df.phase) * 5;
            return (
              <RedDragonfly
                key={`dfClust${i}`}
                x={df.dx + hx}
                y={df.dy + hy}
                s={df.s}
                rot={df.rot + Math.sin(t * 0.08 + df.phase) * 4}
                t={t}
                phase={df.phase}
              />
            );
          })}
        </g>
      );
    })()}

    <Dust t={t} seed={43} x0={120} y0={390} w={1680} h={430} n={18} o={0.27} wind={0.18} />
    {whiteout>0.01?<rect width="1920" height="1080" fill="#fffdf7" opacity={Math.min(1,whiteout)} />:null}
  </g>;
};

export const SunsetMeadowForeground: React.FC<{t?:number;shiftX?:number}> = ({t=0,shiftX=0}) => <g transform={`translate(${shiftX} 0)`}>
  <GoldenForeground t={t} />
</g>;
