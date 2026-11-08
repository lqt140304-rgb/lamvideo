import React from 'react';
import {rnd} from '../anim';
import {windAt} from '../vfx';

/** Clustered kernels share paths; only nearer stalks carry fine husks and leaf veins. */
const Grain:React.FC<{x:number;y:number;s:number;t:number;seed:number;near?:boolean}> =
  ({x,y,s,t,seed,near=false}) => {
    const bend=windAt(t*.65,seed,2.6),detailed=near||s>.55;
    const lean=-19+rnd(seed,2)*34+windAt(t*.85,seed+12,.9);
    const curve=-4+rnd(seed,9)*10,rows=8+Math.floor(rnd(seed,3)*3);
    let light='',shade='',seams='',glints='',awns='';
    for(let i=0;i<rows;i++){
      const p=i/rows,cx=curve*p*p,y=-i*6.3;
      const width=(9.5-p*5.3)*(.88+rnd(seed,i+20)*.25);
      for(const side of [-1,1]){
        const yy=y+(side<0?1.8:0),tipX=cx+side*(width+1.7),tipY=yy-10.5;
        const kernel=`M ${cx+side*.7} ${yy+2} Q ${cx+side*(width+3)} ${yy+1} ${tipX} ${tipY} Q ${cx+side*2.3} ${yy-12} ${cx+side*.7} ${yy+2} Z `;
        if(side<0)shade+=kernel;else light+=kernel;
        seams+=`M ${cx+side*1.7} ${yy} Q ${cx+side*width*.65} ${yy-3} ${tipX-side*1.3} ${tipY+1.5} `;
        glints+=`M ${cx+side*3} ${yy-2} Q ${cx+side*(width+1)} ${yy-2.5} ${tipX-side*.6} ${tipY+1} `;
        awns+=`M ${tipX} ${tipY+1} Q ${tipX+side*1.8} ${tipY-4} ${tipX+side*(2+rnd(seed,i+40)*2)} ${tipY-9-rnd(seed,i+60)*5} `;
      }
    }
    const tipY=-rows*6.3;
    return <g transform={`translate(${x} ${y}) scale(${s}) rotate(${bend})`}>
      <path d="M 0 2 C -4 -38 -7 -75 5 -116" fill="none" stroke={near?'#8a6b35':'#b59a51'} strokeWidth={near?2.5:1.7} />
      <path d="M 1 0 C -2 -40 -5 -77 6 -116" fill="none" stroke="#eed391" strokeWidth=".7" opacity=".65" />
      <path d="M -2 -34 C -13 -58 -29 -72 -46 -70 C -26 -78 -8 -55 0 -38 Z M 1 -67 C 17 -101 33 -112 50 -105 C 32 -108 16 -89 1 -70 Z M -3 -85 Q -19 -109 -33 -110 Q -14 -116 -3 -88 Z" fill={near?'#8a7a40':'#b39d52'} />
      {detailed?<>
        <path d="M -2 -36 Q -20 -68 -45 -70 M 2 -69 Q 24 -108 49 -105 M -3 -86 Q -15 -110 -32 -110" stroke="#dec781" strokeWidth=".65" fill="none" opacity=".65" />
        <path d="M -4 -27 l 5 -1 M -5 -61 l 5 -1 M -3 -91 l 5 1" stroke="#746333" strokeWidth="1.7" opacity=".7" />
      </>:null}
      <g transform={`translate(5 -114) rotate(${lean})`}>
        <path d={`M 0 4 Q -1 -30 ${curve} ${tipY-8}`} fill="none" stroke={near?'#9c773c':'#bc9750'} strokeWidth="1.6" />
        <path d={shade} fill={near?'#c5a05a':'#cbaa61'} stroke="#a48849" strokeWidth=".35" />
        <path d={light} fill={near?'#edce86':'#e6c67e'} stroke="#c1a159" strokeWidth=".3" />
        {detailed?<>
          <path d={seams} fill="none" stroke="#9c793b" strokeWidth=".55" opacity=".7" />
          <path d={glints} fill="none" stroke="#fff0bf" strokeWidth=".85" opacity=".8" />
          <path d={awns} fill="none" stroke="#dfbf76" strokeWidth=".5" opacity={near?.8:.5} />
        </>:null}
        <path d={`M ${curve} ${tipY+7} Q ${curve-4} ${tipY-4} ${curve+1} ${tipY-10} Q ${curve+5} ${tipY-1} ${curve} ${tipY+7} Z`} fill="#e8cc8b" />
      </g>
    </g>;
  };

export const GoldenField:React.FC<{t:number}> = ({t}) => <g data-grain="ripe">
  {[108,92,80,68,58,50].map((count,row)=><g key={row}>
    {Array.from({length:count},(_,i)=><Grain key={i}
      x={-35+i*1990/(count-1)+(rnd(row+72,i)-.5)*24}
      y={568+row*35+rnd(row+2,i)*23}
      s={(.13+row*.16)*(.64+rnd(row+6,i)*.57)} t={t} seed={row*31+i*.73} />)}
  </g>)}
</g>;

export const BankGrain:React.FC<{t:number}> = ({t}) => <g>
  {[0,1].flatMap(side=>Array.from({length:14},(_,i)=><Grain key={`${side}-${i}`} x={side===0?i*45-30:1340+i*45} y={789+rnd(side+8,i)*9} s={.48+rnd(side+13,i)*.3} t={t} seed={side*40+i} />))}
</g>;

export const GoldenForeground:React.FC<{t:number}> = ({t}) => <g>
  {[0,1].flatMap(side=>Array.from({length:15},(_,i)=><Grain key={`${side}-${i}`} x={side===0?-55+i*36:1500+i*36} y={1100+rnd(4,i)*20} s={1.4+rnd(12+side,i)*.8} t={t} seed={side*47+i} near />))}
</g>;
