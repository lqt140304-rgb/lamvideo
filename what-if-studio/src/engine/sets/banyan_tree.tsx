import React from 'react';
import {rnd} from '../anim';
import {windAt} from '../vfx';

/** A rooted trunk stays still; small leaf masses and aerial roots catch the same breeze as the field. */
export const BanyanTree:React.FC<{t?:number;x?:number;y?:number;s?:number}> = ({t=0,x=150,y=785,s=1}) => {
  const clusters=[
    [-210,-460,114,69],[-100,-516,125,81],[38,-537,134,84],[184,-509,127,85],
    [300,-459,118,76],[160,-422,137,68],[13,-433,140,76],[-137,-411,111,60],
  ];
  return <g data-asset="banyan-tree" transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="22" cy="-1" rx="113" ry="9" fill="#615938" opacity=".22" />
    {/* Buttress roots spread over dry earth behind the stone cap. */}
    <path d="M -26 -74 Q -31 -25 -69 -11 L -105 -2 Q -70 6 -39 -7 L -22 -3 Q -1 11 22 2 Q 50 14 93 2 L 120 -1 Q 73 -5 49 -26 L 29 -85 Z" fill="#70634b" />
    <path d="M -33 -5 Q -6 -30 -6 -69 M 9 0 Q 7 -32 15 -58 M 28 -5 Q 43 -18 82 -3 M -53 -8 L -83 -2" stroke="#4d5140" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M -20 -7 C -10 -83 -32 -131 -21 -209 Q -11 -269 -37 -312 L -105 -382 Q -120 -406 -102 -417 L -69 -394 L -12 -336 Q -7 -376 -30 -419 L -48 -468 L -18 -477 Q 11 -432 17 -391 L 36 -352 Q 65 -410 111 -436 L 154 -467 L 166 -451 Q 131 -410 93 -385 L 54 -319 C 33 -262 43 -204 30 -146 Q 22 -73 39 -10 Q 12 7 -20 -7 Z" fill="#786b54" />
    <path d="M 9 -11 C 3 -87 16 -126 15 -186 Q 23 -247 15 -291 Q 28 -351 45 -376 M 26 -207 Q 19 -275 40 -318 Q 61 -377 113 -416 M -9 -227 Q -3 -287 -28 -321 L -96 -396" stroke="#b29a6d" strokeWidth="7" fill="none" strokeLinecap="round" opacity=".8" />
    <path d="M -12 -17 C -1 -105 -20 -127 -12 -194 Q 6 -270 -15 -317 M 8 -145 Q 4 -187 11 -222 M 22 -46 L 20 -92 M 2 -342 Q 11 -371 -12 -422" stroke="#4e5343" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M -63 -8 Q -46 -99 -53 -176 Q -65 -281 -47 -396 L -34 -407 Q -51 -288 -39 -181 Q -32 -88 -47 -10 Z" fill="#655f49" />
    <path d="M -46 -26 Q -32 -115 -44 -200 Q -55 -281 -37 -389" stroke="#a58f65" strokeWidth="3" fill="none" />
    {[[-145,-414,201],[-74,-461,279],[81,-449,267],[175,-433,318],[260,-418,197]].map(([rx,ry,len],i)=><g key={i} transform={`translate(${rx} ${ry})`}>
      <path d={`M 0 0 Q ${5+windAt(t*.65,i+71,3)} ${len*.55} ${windAt(t*.65,i+71,5)} ${len}`} fill="none" stroke={i%2?'#8d7c57':'#716b4e'} strokeWidth={i===3?2.4:1.6} />
      <path d={`M 3 0 Q ${12+windAt(t*.65,i+71,3)} ${len*.4} ${6+windAt(t*.65,i+71,5)} ${len*.79}`} fill="none" stroke="#ab9565" strokeWidth=".8" opacity=".65" />
    </g>)}
    {/* Uneven lobes and gaps keep the crown from reading as a row of circles. */}
    {clusters.map(([cx,cy,rx,ry],i)=>{
      const a=windAt(t*.6,i+93,.55);
      let leaves='',lit='';
      for(let j=0;j<20;j++){
        const lx=(rnd(i+53,j)-.5)*rx*1.65,ly=(rnd(i+88,j)-.5)*ry*1.1;
        const w=4+rnd(i+21,j)*6;
        const d=`M ${lx-w} ${ly} Q ${lx-1} ${ly-6} ${lx+w} ${ly-2} Q ${lx+3} ${ly+6} ${lx-w} ${ly} Z `;
        if(j%3===0)lit+=d;else leaves+=d;
      }
      return <g key={i} transform={`translate(${cx} ${cy}) rotate(${a})`}>
        <path d={`M ${-rx} 4 Q ${-rx-12} ${-ry*.4} ${-rx*.63} ${-ry*.55} Q ${-rx*.5} ${-ry-12} ${-rx*.18} ${-ry*.78} Q ${rx*.22} ${-ry*1.15} ${rx*.43} ${-ry*.68} Q ${rx*.84} ${-ry*.78} ${rx*.89} ${-ry*.33} Q ${rx*1.15} ${ry*.05} ${rx*.83} ${ry*.43} Q ${rx*.75} ${ry*.87} ${rx*.28} ${ry*.7} Q ${-rx*.14} ${ry*.98} ${-rx*.4} ${ry*.6} Q ${-rx*.9} ${ry*.8} ${-rx} 4 Z`} fill={['#53634a','#5e6b4c','#64714f','#65724e','#6e7750','#4e6046','#506248','#4a5c43'][i]} />
        <path d={`M ${-rx*.9} 12 Q ${-rx*.5} ${ry*.32} ${-rx*.25} ${ry*.08} Q ${rx*.18} ${ry*.6} ${rx*.5} ${ry*.14} L ${rx*.77} ${ry*.4} Q ${rx*.3} ${ry*.95} ${-rx*.22} ${ry*.69} Q ${-rx*.8} ${ry*.82} ${-rx*.9} 12 Z`} fill="#364f40" opacity=".48" />
        <path d={leaves} fill="#2f4d3c" opacity=".33" />
        <path d={lit} fill={i===4?'#c2ac70':'#a6a16a'} opacity=".62" />
        <path d={`M ${rx*.47} ${-ry*.58} Q ${rx*.8} ${-ry*.69} ${rx*.85} ${-ry*.25}`} fill="none" stroke="#bbaa70" strokeWidth="4" opacity=".4" strokeLinecap="round" />
      </g>;
    })}
  </g>;
};
