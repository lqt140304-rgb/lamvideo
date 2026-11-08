import React from 'react';
import {clamp,rnd} from '../../engine/anim';
import {windAt} from '../../engine/vfx';
import {type Pose} from '../../engine/rig';

const smooth=(p:number)=>{const v=clamp(p);return v*v*v*(v*(v*6-15)+10);};

/** One 3.8-second farewell, before the siblings comfort each other. */
export const motherDissolveAt=(t:number)=>{
  const p=clamp((t-6)/114);
  return {progress:p,opacity:1-smooth((p-.12)/.8),softness:smooth((p-.6)/.4)*.85};
};

// Exposed crown and hem only; no particles are born in the face, hands or a rectangular volume.
const hair=[[-39,-235],[-25,-242],[-9,-246],[8,-245],[26,-239],[41,-228],[53,-211]];
const hem=[[-35,-10],[-22,-6],[-9,-4],[8,-4],[23,-7],[36,-12]];
export const motherMotesAt=(t:number,pose:Pose)=>{
  const p=motherDissolveAt(t).progress;
  if(p<=0||p>=1)return [];
  return Array.from({length:34},(_,i)=>{
    const onHair=i%3!==0,points=onHair?hair:hem;
    const local=points[Math.floor(rnd(46,i)*points.length)];
    const angle=(onHair?pose.headTilt:0)*Math.PI/180,pivot=onHair?-136:0;
    const lx=local[0]*Math.cos(angle)-(local[1]-pivot)*Math.sin(angle);
    const ly=pivot+local[0]*Math.sin(angle)+(local[1]-pivot)*Math.cos(angle);
    const origin={x:pose.x+lx*pose.scale,y:pose.y+ly*pose.scale};
    const birth=.07+rnd(11,i)*.53,life=.18+rnd(32,i)*.19,age=(p-birth)/life;
    if(age<=0||age>=1)return null;
    const drift=(onHair?42:17)+rnd(27,i)*(onHair?43:13);
    const lift=12+rnd(62,i)*27;
    const x=origin.x+drift*age+windAt(t*.55,i+84,2)*age;
    const y=origin.y-lift*age+Math.sin(age*3+i)*age*3;
    return {id:i,origin,x,y,trailX:x-3-age*5,trailY:y+1+age*2,
      radius:(.85+rnd(71,i)*1.15)*(1-age*.3),opacity:Math.pow(Math.sin(Math.PI*age),1.5)*.72};
  }).filter((m):m is NonNullable<typeof m>=>m!==null);
};

export const MotherDissolveAir:React.FC<{t:number;pose:Pose;id:string}>=({t,pose,id})=>{
  const {progress:p,opacity}=motherDissolveAt(t);
  if(p<=0||p>=1)return null;
  const motes=motherMotesAt(t,pose);
  const edge=Math.sin(Math.PI*smooth(p))*.38*opacity;
  return <g data-mother-dissolve="edge-and-motes" pointerEvents="none">
    <defs><radialGradient id={`${id}-mote`}><stop stopColor="#fff0bd" stopOpacity=".52" /><stop offset=".3" stopColor="#edc575" stopOpacity=".2" /><stop offset="1" stopColor="#edc575" stopOpacity="0" /></radialGradient></defs>
    <g transform={`translate(${pose.x} ${pose.y}) scale(${pose.scale})`} fill="none" stroke="#f4d599" strokeWidth="1.25" strokeLinecap="round" opacity={edge}>
      <path transform={`rotate(${pose.headTilt} 0 -136)`} d="M -64 -172 Q -68 -242 0 -246 Q 68 -242 64 -172" strokeDasharray="9 31 4 47" strokeDashoffset={-p*42} />
      <path d="M -41 -16 Q -20 -2 0 -4 Q 20 -2 41 -16" strokeDasharray="6 19 3 23" strokeDashoffset={-p*21} />
    </g>
    {motes.map(m=><g key={m.id} opacity={m.opacity}>
      <circle cx={m.x} cy={m.y} r={m.radius*5} fill={`url(#${id}-mote)`} />
      {m.id%4===0?<path d={`M ${m.trailX} ${m.trailY} Q ${m.x-2} ${m.y} ${m.x} ${m.y}`} fill="none" stroke="#eaca87" strokeWidth=".65" opacity=".45" />:null}
      <ellipse cx={m.x} cy={m.y} rx={m.radius} ry={m.radius*.65} fill={m.id%3?'#ffe6ac':'#e9c16d'} transform={`rotate(-25 ${m.x} ${m.y})`} />
    </g>)}
  </g>;
};
