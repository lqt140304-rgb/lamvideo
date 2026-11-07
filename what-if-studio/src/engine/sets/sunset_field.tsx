import React, { useId } from 'react';
import { rnd } from '../anim';
import { Dust } from '../light';
import { CloudBank, SmokePlume, WaterRipple, windAt } from '../vfx';

const Rice: React.FC<{x:number;y:number;s:number;t:number;seed:number;near?:boolean}> = ({x,y,s,t,seed,near=false}) => {
  const a = windAt(t,seed,near ? 5 : 3);
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g transform={`rotate(${a})`} strokeLinecap="round">
      <path d="M 0 0 Q -2 -25 9 -56 Q 18 -71 32 -57" fill="none" stroke={near ? '#8b753e' : '#c3a04b'} strokeWidth={near ? 2.7 : 1.6} />
      <path d="M 1 -10 Q -20 -39 -25 -31 Q -13 -14 1 -10 M 3 -20 Q 23 -43 30 -38 Q 22 -24 3 -20" fill={near ? '#706133' : '#9d8b43'} />
      <path d="M 10 -55 Q 20 -64 32 -57" stroke="#e4b15b" strokeWidth="2" fill="none" />
      {Array.from({length:8},(_,i)=><g key={i} transform={`translate(${11+i*2.7} ${-57-Math.sin(i/7*Math.PI)*5}) rotate(${i*5-12})`}>
        <ellipse rx="1.8" ry="3.2" fill={near ? '#d4a452' : '#dfb45b'} /><path d="M 0 -3 L 0 -5" stroke="#f4d78b" strokeWidth="0.6" />
      </g>)}
      <path d="M -9 -3 Q -10 -20 -19 -27" stroke={near ? '#66542e' : '#b7a054'} strokeWidth="1.4" fill="none" />
    </g>
  </g>;
};

/** Rural sunset set; keep the bank/foot planes compatible with the existing C6–C7 shots. */
export const SunsetRiceField: React.FC<{t?:number;whiteout?:number}> = ({t=0,whiteout=0}) => {
  const id = `field-${useId().replace(/[^a-zA-Z0-9]/g,'')}`;
  return <g>
    <defs>
      <linearGradient id={`${id}-sky`} x2="0" y2="1"><stop stopColor="#77799d" /><stop offset="0.36" stopColor="#b68d99" /><stop offset="0.68" stopColor="#e6a880" /><stop offset="1" stopColor="#f3cd8b" /></linearGradient>
      <radialGradient id={`${id}-sun`}><stop stopColor="#ffe6ae" stopOpacity="0.55" /><stop offset="1" stopColor="#f4bb7b" stopOpacity="0" /></radialGradient>
      <linearGradient id={`${id}-rice`} x2="0" y2="1"><stop stopColor="#c0a15c" /><stop offset="1" stopColor="#77763d" /></linearGradient>
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
    {/* Perspective bunds divide paddies, without covering the actors' level walking bank. */}
    <path d="M -30 602 Q 900 588 1950 604 M -30 660 Q 930 639 1950 667 M 1160 556 L 1860 720 M 480 555 L 95 720" stroke="#7d7043" strokeWidth="4" opacity="0.65" fill="none" />
    {[0,1,2].map(row=><g key={row}>
      {Array.from({length:row===0?95:62},(_,i)=><Rice key={i} x={i*(row===0?21:33)-15+rnd(row+42,i)*9} y={583+row*57+rnd(19,i)*17} s={0.25+row*0.25} t={t} seed={i*.73+row*2} />)}
    </g>)}
    <path d="M -30 717 Q 550 706 1000 723 Q 1510 734 1950 710 L 1950 758 Q 1480 774 1000 752 Q 460 740 -30 766 Z" fill={`url(#${id}-water)`} />
    <g clipPath={`url(#${id}-ditch)`}>
      {Array.from({length:20},(_,i)=><path key={i} d={`M ${40+i*100+windAt(t,i,5)} ${723+i%4*9} h ${25+i%5*9}`} stroke={i%3 ? '#d9be8a' : '#6f8068'} strokeWidth="1.5" opacity="0.45" />)}
      <WaterRipple t={(t+22)%135} life={135} x={1325} y={736} radius={52} color="#e4c691" />
    </g>
    <path d="M -60 765 Q 520 735 1040 748 Q 1520 760 1980 742 V 1090 H -60 Z" fill={`url(#${id}-bank)`} />
    <path d="M -60 765 Q 520 735 1040 748 Q 1520 760 1980 742 L 1980 835 Q 1480 852 980 838 Q 480 825 -60 850 Z" fill="#9a8b50" />
    <path d="M -60 807 Q 480 790 980 802 Q 1480 814 1980 799 L 1980 845 Q 1450 858 980 838 Q 450 826 -60 850 Z" fill="#847045" />
    <path d="M -60 807 Q 480 790 980 802 Q 1480 814 1980 799" fill="none" stroke="#b7a264" strokeWidth="4" />
    <path d="M -60 850 Q 480 825 980 838 Q 1480 852 1980 835 L 1980 955 Q 1460 975 960 958 Q 460 942 -60 965 Z" fill="#a17b56" />
    <path d="M -40 765 Q 520 735 1040 748 Q 1520 760 1960 743" fill="none" stroke="#e0b971" strokeWidth="3" opacity="0.75" />
    {Array.from({length:90},(_,i)=>{
      const x=rnd(10,i)*1920,y=856+rnd(11,i)*166;
      return <g key={i} opacity={0.2+rnd(12,i)*.23}><path d={`M ${x} ${y} q ${5+rnd(13,i)*12} -3 ${11+rnd(14,i)*14} 0`} stroke="#614b34" strokeWidth={1+rnd(15,i)*2} fill="none" />
        {i%3===0?<ellipse cx={x+5} cy={y+4} rx={3+rnd(9,i)*4} ry="1.8" fill="#cfb18a" />:null}</g>;
    })}
    {Array.from({length:53},(_,i)=>{
      const x=i*38-20,y=763+Math.sin(i*.32)*8, a=windAt(t,i*.7,5);
      return <g key={i} transform={`translate(${x} ${y}) rotate(${a})`} stroke={i%3?'#c3aa65':'#6d713a'} strokeWidth="1.5" fill="none" strokeLinecap="round"><path d="M 0 3 Q -4 -6 -10 -13 M 1 4 Q 3 -9 10 -17 M 3 4 L 8 -6" /></g>;
    })}
    <Dust t={t} seed={43} x0={120} y0={390} w={1680} h={430} n={18} o={0.27} wind={0.18} />
    {whiteout>0.01?<rect width="1920" height="1080" fill="#fffdf7" opacity={Math.min(1,whiteout)} />:null}
  </g>;
};

export const SunsetMeadowForeground: React.FC<{t?:number;shiftX?:number}> = ({t=0,shiftX=0}) => <g transform={`translate(${shiftX} 0)`}>
  {[[22,1090,2.7],[94,1092,3.2],[181,1095,2.4],[265,1100,1.7],[1650,1100,1.9],[1730,1095,2.6],[1828,1092,3.2],[1912,1090,2.8]].map(([x,y,s],i)=><Rice key={i} x={x} y={y} s={s} t={t} seed={i*.8} near />)}
</g>;
