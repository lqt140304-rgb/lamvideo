import React from 'react';
import {rnd} from '../anim';
import {windAt} from '../vfx';

/** Slender mature grain with paired kernels: merged paths keep dense fields inexpensive to draw. */
const Grain:React.FC<{x:number;y:number;s:number;t:number;seed:number;near?:boolean}> =
  ({x,y,s,t,seed,near=false}) => {
    const bend=windAt(t*.65,seed,2.6),lean=-12+rnd(seed,2)*28;
    let light='',shade='',veins='';
    for(let i=0;i<8;i++){
      const y=-i*6,w=11-i*.65;
      light+=`M 1 ${y+2} Q ${w} ${y} ${w+1} ${y-8} Q 3 ${y-8} 1 ${y+2} Z `;
      shade+=`M -1 ${y+2} Q ${-w} ${y} ${-w-1} ${y-8} Q -3 ${y-8} -1 ${y+2} Z `;
      veins+=`M 2 ${y} L ${w-2} ${y-6} M -2 ${y} L ${-w+2} ${y-6} `;
    }
    return <g transform={`translate(${x} ${y}) scale(${s}) rotate(${bend})`}>
      <path d="M 0 2 C -4 -38 -7 -75 5 -116" fill="none" stroke={near?'#8b6d36':'#c0a159'} strokeWidth={near?2.4:1.5} />
      <path d="M -2 -35 C -18 -55 -36 -67 -45 -63 C -25 -67 -10 -43 -2 -35 Z M 1 -70 C 17 -104 38 -113 48 -101 C 31 -110 14 -87 1 -70 Z" fill={near?'#8e7c43':'#b2a05a'} />
      <g transform={`translate(5 -114) rotate(${lean})`}>
        <path d="M 0 3 L 0 -55" stroke={near?'#a88b4c':'#c5a360'} strokeWidth="1.5" />
        <path d={shade} fill={near?'#bf9c5f':'#c6a25c'} />
        <path d={light} fill={near?'#f0d49b':'#e6ca86'} />
        <path d={veins} fill="none" stroke="#fff0c2" strokeWidth="0.55" opacity="0.45" />
        <path d="M 0 -44 Q -5 -55 0 -62 Q 5 -55 0 -44 Z" fill="#e6c98a" />
      </g>
    </g>;
  };

export const GoldenField:React.FC<{t:number}> = ({t}) => <g data-grain="ripe">
  {[0,1,2,3,4].map(row=>{
    const count=[100,82,66,54,46][row];
    return <g key={row}>
      {Array.from({length:count},(_,i)=><Grain key={i} x={-35+i*1990/(count-1)+(rnd(row+72,i)-.5)*19} y={568+row*36+rnd(row+2,i)*8} s={(.13+row*.2)*(.8+rnd(row+6,i)*.35)} t={t} seed={row*31+i*.73} />)}
    </g>;
  })}
</g>;

export const BankGrain:React.FC<{t:number}> = ({t}) => <g>
  {[0,1].flatMap(side=>Array.from({length:14},(_,i)=><Grain key={`${side}-${i}`} x={side===0?i*45-30:1340+i*45} y={789+rnd(side+8,i)*9} s={.48+rnd(side+13,i)*.3} t={t} seed={side*40+i} />))}
</g>;

export const GoldenForeground:React.FC<{t:number}> = ({t}) => <g>
  {[0,1].flatMap(side=>Array.from({length:15},(_,i)=><Grain key={`${side}-${i}`} x={side===0?-55+i*36:1500+i*36} y={1100+rnd(4,i)*20} s={1.4+rnd(12+side,i)*.8} t={t} seed={side*47+i} near />))}
</g>;
