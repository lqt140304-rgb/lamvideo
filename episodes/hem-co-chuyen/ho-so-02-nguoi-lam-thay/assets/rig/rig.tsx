import React, {useId} from 'react';
import {PALETTE as P, StudentTwinHead, TungHead, StudentTwinBody, TungSoccer, type NamMood, type TungMood} from '../nhan-vat';

export type Vec = {x: number; y: number};
export type Cast = 'nam' | 'nguoi-kia' | 'tung';
export type HandShape = 'relaxed' | 'open' | 'grip';
// left/right are screen sides in this three-quarter design, not anatomical sides.
export type Pose = {
  root: Vec; lean: number; head: number;
  leftHand: Vec; rightHand: Vec; leftFoot: Vec; rightFoot: Vec;
  leftBend: 1 | -1; rightBend: 1 | -1;
  leftKnee: 1 | -1; rightKnee: 1 | -1;
  leftPalm: number; rightPalm: number;
  leftShape: HandShape; rightShape: HandShape;
  prop: 'none' | 'phone' | 'bowl';
  support: 'floor' | 'seat';
};
const v = (x: number, y: number): Vec => ({x,y});
const base: Pose = {
  root:v(0,0), lean:0, head:0,
  leftHand:v(-73,372), rightHand:v(73,372),
  leftFoot:v(-35,560), rightFoot:v(35,560),
  leftBend:1, rightBend:-1, leftKnee:1, rightKnee:-1,
  leftPalm:0, rightPalm:0, leftShape:'relaxed', rightShape:'relaxed',
  prop:'none',support:'floor',
};
export const POSES: Record<string, Pose> = {
  stand:{...base},
  wary:{...base,lean:-5,head:5,leftHand:v(-111,250),rightHand:v(111,244),leftBend:-1,rightBend:1,leftShape:'open',rightShape:'open',leftPalm:0,rightPalm:0,leftFoot:v(-56,560),rightFoot:v(50,560)},
  recoil:{...base,root:v(-9,13),lean:-9,head:8,leftHand:v(-127,244),rightHand:v(123,230),leftBend:-1,rightBend:1,leftShape:'open',rightShape:'open',leftPalm:-8,rightPalm:8,leftFoot:v(-65,560),rightFoot:v(67,560)},
  phone:{...base,head:-4,rightHand:v(68,154),rightBend:1,rightPalm:0,rightShape:'grip',prop:'phone'},
  offer:{...base,lean:3,head:-3,rightHand:v(166,294),rightBend:1,rightPalm:0,rightShape:'open'},
  reach:{...base,lean:7,head:-3,rightHand:v(177,227),rightBend:1,rightShape:'grip',rightPalm:0},
  sit:{...base,root:v(0,-38),lean:3,leftHand:v(-78,348),rightHand:v(80,350),leftFoot:v(-110,474),rightFoot:v(110,474),leftKnee:1,rightKnee:-1,support:'seat'},
  type:{...base,root:v(0,-38),lean:9,head:6,leftHand:v(9,290),rightHand:v(110,291),leftPalm:0,rightPalm:0,leftShape:'grip',rightShape:'grip',leftFoot:v(-110,474),rightFoot:v(110,474),leftKnee:1,rightKnee:-1,support:'seat'},
  bend:{...base,root:v(0,30),lean:17,head:12,leftHand:v(54,397),rightHand:v(145,406),leftShape:'grip',rightShape:'grip',leftFoot:v(-55,560),rightFoot:v(63,560)},
  wash:{...base,lean:7,head:9,leftHand:v(30,307),rightHand:v(107,298),leftPalm:0,rightPalm:0,leftShape:'grip',rightShape:'grip',prop:'bowl'},
  stepLeft:{...base,root:v(0,3),lean:2,leftHand:v(-110,344),rightHand:v(108,369),leftFoot:v(-73,557),rightFoot:v(65,534)},
  stepRight:{...base,root:v(0,3),lean:2,leftHand:v(-108,369),rightHand:v(110,344),leftFoot:v(-65,534),rightFoot:v(73,557)},
};
export type PoseName = keyof typeof POSES;
export const POSE_LABELS: Record<string,string> = {
  stand:'Đứng thả lỏng',wary:'Dè chừng',recoil:'Lùi hoảng sợ',phone:'Nghe điện thoại',
  offer:'Mời giúp đỡ',reach:'Với tay',sit:'Ngồi trên ghế',type:'Ngồi làm bài',
  bend:'Cúi nhặt đồ',wash:'Giữ bát / rửa',stepLeft:'Bước trái',stepRight:'Bước phải',
};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export function blendPose(a:Pose,b:Pose,t:number):Pose {
  const q=Math.max(0,Math.min(1,t));
  const point=(x:Vec,y:Vec)=>v(mix(x.x,y.x,q),mix(x.y,y.y,q));
  // Discrete topology/prop states must not switch mid-tween. Use separate action beats.
  return {...a,root:point(a.root,b.root),lean:mix(a.lean,b.lean,q),head:mix(a.head,b.head,q),
    leftHand:point(a.leftHand,b.leftHand),rightHand:point(a.rightHand,b.rightHand),
    leftFoot:point(a.leftFoot,b.leftFoot),rightFoot:point(a.rightFoot,b.rightFoot),
    leftPalm:mix(a.leftPalm,b.leftPalm,q),rightPalm:mix(a.rightPalm,b.rightPalm,q)};
}
export function sampleWalk(phase:number):Pose {
  const t=((phase%1)+1)%1;
  const keys=[POSES.stepLeft,{...base,root:v(0,-3),leftFoot:v(-35,560),rightFoot:v(36,525)},
    POSES.stepRight,{...base,root:v(0,-3),leftFoot:v(-36,525),rightFoot:v(35,560)},POSES.stepLeft];
  const k=t*4,i=Math.floor(k),u=k-i;
  return blendPose(keys[i],keys[i+1],u*u*(3-2*u));
}
const add=(a:Vec,b:Vec)=>v(a.x+b.x,a.y+b.y);
const sub=(a:Vec,b:Vec)=>v(a.x-b.x,a.y-b.y);
const len=(a:Vec)=>Math.hypot(a.x,a.y);
const scale=(a:Vec,n:number)=>v(a.x*n,a.y*n);
const normal=(a:Vec)=>{const d=len(a)||1;return v(-a.y/d,a.x/d);};
const rotate=(p:Vec,origin:Vec,degrees:number)=>{
  const r=degrees*Math.PI/180,c=Math.cos(r),s=Math.sin(r),d=sub(p,origin);
  return add(origin,v(d.x*c-d.y*s,d.x*s+d.y*c));
};
export function solveLimb(start:Vec,target:Vec,upper:number,lower:number,bend:number) {
  const delta=sub(target,start),raw=len(delta),d=Math.max(Math.abs(upper-lower)+0.01,Math.min(upper+lower-0.01,raw));
  const axis=raw>1e-8?scale(delta,1/raw):v(0,1),n=normal(axis);
  const along=(upper*upper-lower*lower+d*d)/(2*d),height=Math.sqrt(Math.max(0,upper*upper-along*along));
  return {start,mid:add(start,add(scale(axis,along),scale(n,height*bend))),end:add(start,scale(axis,d)),clamped:Math.abs(raw-d)>0.1};
}
// One continuous tapered outline through each hinge: no disks pasted over elbows/knees.
export function limbOutline(a:Vec,b:Vec,c:Vec,wa:number,wb:number,wc:number):string {
  const n1=normal(sub(b,a)),n2=normal(sub(c,b));
  let nm=add(n1,n2);nm=len(nm)>0.1?scale(nm,1/len(nm)):n1;
  const pt=(p:Vec,n:Vec,w:number)=>add(p,scale(n,w));
  const a1=pt(a,n1,wa),b1=pt(b,nm,wb),c1=pt(c,n2,wc),a2=pt(a,n1,-wa),b2=pt(b,nm,-wb),c2=pt(c,n2,-wc);
  const fmt=(p:Vec)=>`${p.x.toFixed(3)} ${p.y.toFixed(3)}`;
  const ab=sub(b,a),bc=sub(c,b),tangent=scale(sub(c,a),.16);
  const capA=sub(a,scale(sub(b,a),wa/(len(ab)||1))),capC=add(c,scale(sub(c,b),wc/(len(bc)||1)));
  return `M ${fmt(a1)} C ${fmt(add(a1,scale(ab,.38)))} ${fmt(sub(b1,tangent))} ${fmt(b1)} C ${fmt(add(b1,tangent))} ${fmt(sub(c1,scale(bc,.38)))} ${fmt(c1)} Q ${fmt(capC)} ${fmt(c2)} C ${fmt(sub(c2,scale(bc,.38)))} ${fmt(add(b2,tangent))} ${fmt(b2)} C ${fmt(sub(b2,tangent))} ${fmt(add(a2,scale(ab,.38)))} ${fmt(a2)} Q ${fmt(capA)} ${fmt(a1)} Z`;
}
export function handAngle(elbow:Vec,wrist:Vec,flex=0):number {
  return Math.atan2(wrist.y-elbow.y,wrist.x-elbow.x)*180/Math.PI-90+flex;
}
export function skeleton(p:Pose) {
  const pelvis=v(p.root.x,337+p.root.y);
  const torso=(x:number,y:number)=>rotate(add(v(x,y),p.root),pelvis,p.lean);
  const ls=torso(-63,216),rs=torso(60,216),lh=add(pelvis,v(-34,8)),rh=add(pelvis,v(34,8));
  return {pelvis,neck:torso(-4,180),ls,rs,lh,rh,
    la:solveLimb(ls,p.leftHand,79,78,p.leftBend),ra:solveLimb(rs,p.rightHand,79,78,p.rightBend),
    ll:solveLimb(lh,p.leftFoot,p.support==='seat'?100:110,p.support==='seat'?100:109,p.leftKnee),rl:solveLimb(rh,p.rightFoot,p.support==='seat'?100:110,p.support==='seat'?100:109,p.rightKnee)};
}

// Deform the actual reference clothing paths, preserving their cut and volume.
// Coordinates are authored in nhan-vat.tsx; this maps their rest legs to the posed bones.
function garmentPoint(point:Vec,l:ReturnType<typeof solveLimb>,side:-1|1):Vec {
  const reference=skeleton(base),rest=side===-1?reference.ll:reference.rl;
  const hip=rest.start,knee=rest.mid,ankle=rest.end;
  const map=(a:Vec,b:Vec,c:Vec,d:Vec)=>{
    const axis=sub(b,a),u=scale(axis,1/len(axis)),q=sub(point,a),t=(q.x*u.x+q.y*u.y)/len(axis);
    const n=normal(u),width=q.x*n.x+q.y*n.y;
    const target=sub(d,c),direction=scale(target,1/len(target));
    return add(add(c,scale(target,t)),scale(normal(direction),width));
  };
  const upper=map(hip,knee,l.start,l.mid),lower=map(knee,ankle,l.mid,l.end);
  const t=Math.max(0,Math.min(1,(point.y-knee.y+21)/42)),q=t*t*(3-2*t);
  return v(mix(upper.x,lower.x,q),mix(upper.y,lower.y,q));
}
function clothPath(source:string,s:ReturnType<typeof skeleton>):string {
  return source.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g,(_,xs,ys)=>{
    const pt=v(+xs,+ys),left=garmentPoint(pt,s.ll,-1),right=garmentPoint(pt,s.rl,1);
    const sideWeight=Math.max(0,Math.min(1,(pt.x+12)/24));
    const moved=v(mix(left.x,right.x,sideWeight),mix(left.y,right.y,sideWeight));
    const hipOffset=sub(s.pelvis,v(0,337)),fixed=add(pt,hipOffset);
    const t=Math.max(0,Math.min(1,(pt.y-365)/48)),q=t*t*(3-2*t);
    return `${mix(fixed.x,moved.x,q).toFixed(3)} ${mix(fixed.y,moved.y,q).toFixed(3)}`;
  });
}
const REFERENCE_PANTS='M -63 329 Q -80 364 -71 403 L -67 454 Q -78 491 -65 548 Q -42 560 -12 548 L -10 471 Q -10 443 -4 411 Q 0 402 4 411 Q 10 443 10 471 L 12 548 Q 42 560 65 548 Q 78 491 67 454 L 71 403 Q 80 364 63 329 Z';
const REFERENCE_SHORTS='M -58 322 Q -72 355 -66 388 L -61 422 Q -40 432 -14 424 L -3 388 L 3 388 L 14 424 Q 40 432 61 422 L 66 388 Q 72 355 58 322 Z';

function Palm({point,angle,shape,side=1,phone=false}:{point:Vec;angle:number;shape:HandShape;side?:-1|1;phone?:boolean}) {
  // Mirrored thumb and rounded finger loops, with a wrist wider than the fingertips.
  const relaxed='M -10 -6 Q -12 2 -12 10 L -13 22 Q -12 28 -9 24 L -7 17 L -7 27 Q -5 32 -2 27 L 0 18 L 1 27 Q 4 31 7 25 L 8 15 Q 11 26 14 21 Q 16 17 12 9 L 11 4 Q 18 14 20 8 Q 21 3 14 -3 L 9 -6 Z';
  const open='M -10 30 Q -20 17 -27 9 Q -31 5 -28 1 Q -24 -3 -16 6 L -16 -14 Q -16 -20 -12 -20 Q -8 -20 -8 -14 L -7 3 L -8 -25 Q -7 -32 -3 -32 Q 1 -32 1 -25 L 2 2 L 3 -26 Q 4 -33 8 -31 Q 12 -30 12 -24 L 12 3 L 15 -16 Q 16 -22 20 -20 Q 24 -18 22 -12 L 19 17 Q 15 28 10 30 Z';
  const grip='M -10 -7 Q -15 -3 -14 5 L -15 13 Q -15 21 -9 23 Q -7 28 -1 25 Q 4 29 9 23 Q 15 22 15 13 L 14 5 Q 17 -1 11 -5 L 5 -8 Z';
  return <g transform={`translate(${point.x} ${point.y}) rotate(${angle})`}>
    <g visibility={phone?'hidden':undefined} transform={`scale(${-side} 1)`}><g transform={shape==='open'?'rotate(180) translate(0 -25.5) scale(.85)':undefined}>
      <path d={shape==='open'?open:shape==='grip'?grip:relaxed} fill={P.skin} stroke="none"/><path d={(shape==='open'?open:shape==='grip'?grip:relaxed).replace(/Z$/,'')} fill="none"/>
      <path d={shape==='open'?'M -10 10 Q -5 14 -6 23 M -1 17 Q 4 13 10 15':shape==='grip'?'M -9 15 Q -4 10 0 15 M -2 21 Q 3 15 8 18':'M -6 9 Q -1 12 4 9'} fill="none" strokeWidth={1.7}/>
      {shape==='grip'&&<path d="M -11 5 Q -3 -2 5 3 L 9 10 Q 7 15 3 12 L -3 8 Q -8 12 -11 5 Z" fill={P.skin} strokeWidth={1.5}/>}
      {shape==='open'&&<path d="M -14 22 Q -6 29 6 24" fill="none" stroke={P.skinShadow} strokeWidth={2.2}/>}
    </g></g>
    {phone&&<>
      <path d="M -10 3 Q -18 -5 -16 -18 L -12 -34 Q -8 -43 -3 -35 L 1 -21 Q 11 -33 16 -22 Q 22 -7 13 4" fill={P.skin}/>
      <rect x={-14} y={-57} width={31} height={60} rx={5} fill="#343e41"/>
      <rect x={-10} y={-49} width={23} height={40} rx={2} fill="#9cb4ae" stroke="none"/>
      <path d="M -6 -53 L 7 -53 M 0 -2 L 5 -2" stroke="#89968e" strokeWidth={1.5}/>
      <path d="M -14 -22 Q -2 -31 9 -26 Q 16 -23 9 -17 L -3 -16 Q -8 -12 -13 -11" fill={P.skin}/>
      <path d="M -3 -23 L 5 -23" stroke={P.skinShadow} strokeWidth={1.3}/>
    </>}
  </g>;
}
function Shoe({point,sport,side}:{point:Vec;sport:boolean;side:-1|1}) {
  return <g transform={`translate(${point.x} ${point.y}) scale(${side} 1)`}>
    {sport?<>
      <path d="M -18 -1 Q 6 -3 32 5 Q 54 9 51 21 Q 20 33 -22 23 L -24 12 Z" fill={P.tung.cleats}/>
      <path d="M -22 19 Q 18 27 51 18 L 52 25 Q 16 36 -22 27 Z" fill={P.tung.cleatsSole} strokeWidth={2.5}/>
      <path d="M -10 4 Q 10 -1 30 11 M -6 8 Q 14 3 34 15" stroke={P.tung.jersey} strokeWidth={2.5} fill="none"/>
      <path d="M -10 4 Q 10 -1 30 11" stroke={P.tung.cleatsAccent} strokeWidth={3} fill="none"/>
      <path d="M -5 5 L 0 13 M 3 5 L 8 13 M 11 7 L 16 15" stroke="#fbf5e9" strokeWidth={2} fill="none"/>
      <path d="M -17 28 L -17 31 M -1 30 L -1 33 M 32 27 L 32 30" stroke={P.tung.cleatsSole} strokeWidth={3}/>
    </>:<>
      <path d="M -14 -23 L -13 7 Q 3 13 19 5 L 18 -24 Z" fill={P.skin}/>
      <path d="M -13 -1 Q 8 -3 31 6 Q 55 9 53 22 Q 21 34 -21 23 L -23 11 Z" fill={P.skin}/>
      <path d="M -21 21 Q 20 29 53 19 L 54 26 Q 18 38 -21 29 Z" fill={P.nam.sole} strokeWidth={2.5}/>
      <path d="M -10 1 Q 16 -3 35 11 L 39 21 Q 13 6 -16 16 Z" fill={P.nam.slippers} strokeWidth={2.5}/>
      <path d="M 32 17 Q 36 15 40 18 M 42 20 L 45 21" fill="none" stroke={P.skinShadow} strokeWidth={1.8}/>
    </>}
  </g>;
}

export type StudentRigProps={
  cast?:Cast; pose?:PoseName|Pose; mood?:NamMood|TungMood;
  x?:number;y?:number;scale?:number;debug?:boolean;showSupport?:boolean;
};
export const StudentRig:React.FC<StudentRigProps>=({cast='nam',pose='stand',mood,x=0,y=0,scale:zoom=1,debug=false,showSupport=false})=>{
  const id=useId().replace(/:/g,'');
  const p=typeof pose==='string'?POSES[pose]:pose,s=skeleton(p),sport=cast==='tung';
  const shirt=sport?P.tung.jersey:P.nam.shirt,pants=sport?P.tung.shorts:P.nam.pants;
  const leg=(l:ReturnType<typeof solveLimb>,side:-1|1)=> <g>
    {sport&&<>
      <path d={clothPath(side===-1?'M -50 412 Q -55 444 -48 476 L -52 562 L -16 562 L -20 476 Q -17 444 -18 412 Z':'M 18 412 Q 17 444 20 476 L 16 562 L 52 562 L 48 476 Q 55 444 50 412 Z',s)} fill={P.skin}/>
      <path d={clothPath(side===-1?'M -48 476 Q -55 515 -52 562 L -16 562 Q -15 515 -20 476 Z':'M 20 476 Q 15 515 16 562 L 52 562 Q 55 515 48 476 Z',s)} fill={P.tung.socks}/>
      <path d={clothPath(side===-1?'M -48 488 Q -34 492 -20 488 M -49 496 Q -34 500 -19 496':'M 20 488 Q 34 492 48 488 M 19 496 Q 34 500 49 496',s)} stroke={P.tung.socksStripe} strokeWidth={2.6} fill="none"/>
      <path d={clothPath(side===-1?'M -38 470 Q -34 474 -30 470':'M 30 470 Q 34 474 38 470',s)} fill="none" strokeWidth={2}/>
    </>}
    <Shoe point={l.end} side={side} sport={sport}/>
  </g>;
  const arm=(l:ReturnType<typeof solveLimb>)=>{
    // Suppress the elastic hose curve: retain a mild biceps/calf change in volume.
    const elbow=sub(l.mid,scale(sub(l.end,l.start),.025));
    const axis=sub(l.end,l.mid),n=normal(axis);
    return <g>
      <path d={limbOutline(add(l.start,scale(sub(l.mid,l.start),.49)),elbow,l.end,17,16,11)} fill={P.skin}/>
      <path d={`M ${l.mid.x+n.x*9} ${l.mid.y+n.y*9} q ${axis.x*.09} ${axis.y*.09} ${axis.x*.15} ${axis.y*.15}`} stroke={P.skinShadow} strokeWidth={2.2} fill="none"/>
    </g>;
  };
  const bodyPoint=(x:number,y:number)=>rotate(add(v(x,y),p.root),s.pelvis,p.lean);
  const f=(p:Vec)=>`${p.x.toFixed(3)} ${p.y.toFixed(3)}`;
  const sleevePoints=(l:ReturnType<typeof solveLimb>,side:-1|1)=>{
    const axis=sub(l.mid,l.start),u=scale(axis,1/len(axis)),n=normal(u);
    const at=(along:number,across:number)=>add(l.start,add(scale(u,along),scale(n,across)));
    const outward=-side;
    return {at,outer:at(43,outward*23),inner:at(43,-outward*22),tip:at(49,0),cap:at(9,outward*30)};
  };
  const left=sleevePoints(s.la,-1),right=sleevePoints(s.ra,1);
  // ONE garment silhouette: no outlined sleeve patches on top of an outlined torso.
  const shirtOutline=`M ${f(bodyPoint(-26,177))} C ${f(bodyPoint(-54,178))} ${f(left.cap)} ${f(left.outer)} Q ${f(left.tip)} ${f(left.inner)} Q ${f(bodyPoint(-53,264))} ${f(bodyPoint(-58,298))} Q ${f(bodyPoint(-66,329))} ${f(bodyPoint(-61,351))} Q ${f(bodyPoint(-23,370))} ${f(bodyPoint(12,355))} Q ${f(bodyPoint(38,363))} ${f(bodyPoint(60,345))} L ${f(bodyPoint(54,281))} Q ${f(bodyPoint(56,263))} ${f(right.inner)} Q ${f(right.tip)} ${f(right.outer)} C ${f(right.cap)} ${f(bodyPoint(42,181))} ${f(bodyPoint(16,178))} Q ${f(bodyPoint(-7,194))} ${f(bodyPoint(-26,177))} Z`;
  const cuffs=()=> <g strokeWidth={sport?2.1:1.4} fill="none">
    {sport&&[left,right].map((sleeve,i)=><path key={i} d={`M ${f(sleeve.at(39,21))} Q ${f(sleeve.at(43,0))} ${f(sleeve.at(39,-21))}`} stroke={P.tung.jerseyTrim}/>)}
  </g>;
  const sleeveMask=(sleeve:ReturnType<typeof sleevePoints>)=>`M ${f(sleeve.at(-30,30))} Q ${f(sleeve.at(12,34))} ${f(sleeve.at(43,23))} Q ${f(sleeve.tip)} ${f(sleeve.at(43,-22))} Q ${f(sleeve.at(12,-32))} ${f(sleeve.at(-30,-30))} Z`;
  // Hand flex is relative to the forearm, not a fixed world-space angle.
  const wristAngle=(l:ReturnType<typeof solveLimb>,flex:number)=>handAngle(l.mid,l.end,flex);
  return <g transform={`translate(${x} ${y}) scale(${zoom})`} stroke={P.ink} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" data-cast={cast}>
    {showSupport&&<g stroke="#b7ae9f" fill="#ded4c4">
      {p.support==='seat'?<><path d={`M -110 ${s.pelvis.y+40} Q 0 ${s.pelvis.y+30} 115 ${s.pelvis.y+40} L 115 ${s.pelvis.y+56} L -110 ${s.pelvis.y+56} Z`}/><path d={`M -90 ${s.pelvis.y+56} L -90 540 M 95 ${s.pelvis.y+56} L 95 540`} fill="none" strokeWidth={11}/></>:<ellipse cx={0} cy={590} rx={116} ry={12} fill={P.shadowFloor} stroke="none"/>}
    </g>}
    {leg(s.ll,-1)}{leg(s.rl,1)}
    <path d={clothPath(sport?REFERENCE_SHORTS:REFERENCE_PANTS,s)} fill={pants} data-part="pants"/>
    <g clipPath={`url(#${id}-pants-details)`}>
    <path d={clothPath(sport?'M -3 355 Q 0 375 3 388 M 44 336 Q 54 348 58 366':'M 0 368 Q -2 390 0 407 M -62 437 Q -45 445 -35 466 M 24 512 Q 37 503 51 506 M -53 538 L -20 539',s)} fill="none" strokeWidth={2.5}/>
    {sport&&<path d={clothPath('M -64 340 Q -68 375 -61 414 M 64 340 Q 68 375 61 414',s)} fill="none" stroke={P.tung.shortsStripe} strokeWidth={3.5}/>}
    </g>
    <defs>
      <clipPath id={`${id}-pants-details`}><path d={clothPath(sport?REFERENCE_SHORTS:REFERENCE_PANTS,s)}/></clipPath>
      <mask id={`${id}-skin-outside-sleeves`} maskUnits="userSpaceOnUse" x={-1000} y={-1000} width={2000} height={2000}>
        <rect x={-1000} y={-1000} width={2000} height={2000} fill="white" stroke="none"/>
        <path d={sleeveMask(left)} fill="black" stroke="black" strokeWidth={2.6}/>
        <path d={sleeveMask(right)} fill="black" stroke="black" strokeWidth={2.6}/>
      </mask>
    </defs>
    <path d={shirtOutline} fill={shirt} data-part="continuous-shirt"/>
    {cuffs()}
    {/* Neckline and fabric details have no separate filled torso layer. */}
    <g transform={`translate(${p.root.x} ${p.root.y}) rotate(${p.lean} 0 337)`}>
      <path d={sport?'M -24 179 L -7 204 L 0 192 L 9 204 L 18 179':'M -26 179 Q -17 209 0 201 Q 17 200 20 182'} fill="none" stroke={sport?P.tung.jerseyTrim:P.ink} strokeWidth={2.2}/>
      <path d="M -45 316 Q -19 333 15 320 M 15 340 Q 36 343 48 334" fill="none" strokeWidth={2}/>
      {sport&&<><path d="M -36 238 L -28 238 L -28 245 Q -32 250 -36 245 Z" fill={P.tung.jerseyTrim} stroke="none"/><text x={-4} y={274} textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="900" fontSize={36} fill={P.tung.number} stroke="none">7</text></>}
      <g transform={`rotate(${p.head} -4 178)`}>
        {sport?<TungHead mood={(mood||'normal') as TungMood} id={`${id}-head`}/>:<StudentTwinHead mood={(mood||(cast==='nguoi-kia'?'calm':'sleepy')) as NamMood} id={`${id}-head`}/>}
      </g>
    </g>
    <g mask={`url(#${id}-skin-outside-sleeves)`}>{arm(s.la)}{arm(s.ra)}</g>
    {p.prop==='bowl'&&<g transform={`translate(${s.ra.end.x-21} ${s.ra.end.y+12})`}><path d="M -56 -1 Q -39 43 0 35 Q 28 28 35 -1 Z" fill="#f2e6cf"/><ellipse cx={-10} cy={-1} rx={45} ry={10} fill="#d4e0d9"/></g>}
    <Palm point={s.la.end} angle={wristAngle(s.la,p.leftPalm)} shape={p.leftShape} side={-1}/>
    <Palm point={s.ra.end} angle={p.prop==='phone'?0:wristAngle(s.ra,p.rightPalm)} shape={p.rightShape} phone={p.prop==='phone'}/>
    {debug&&<g fill="#dc6045" stroke="#fff" strokeWidth={1.6}>
      {[s.pelvis,s.neck,s.ls,s.rs,s.la.mid,s.ra.mid,s.la.end,s.ra.end,s.lh,s.rh,s.ll.mid,s.rl.mid,s.ll.end,s.rl.end].map((pt,i)=><circle key={i} cx={pt.x} cy={pt.y} r={5}/>)}
      <g fill="none" stroke="#c44d37" strokeDasharray="5 5" strokeWidth={1.5}>{[s.la,s.ra,s.ll,s.rl].map((l,i)=><path key={i} d={`M ${l.start.x} ${l.start.y} L ${l.mid.x} ${l.mid.y} L ${l.end.x} ${l.end.y}`}/>)}</g>
    </g>}
  </g>;
};

export const PoseBoard:React.FC=()=> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1220" width="1800" height="1220">
  <rect width={1800} height={1220} rx={24} fill="#f6f1e8"/>
  <g fontFamily="Arial,sans-serif" fill={P.ink} textAnchor="middle"><text x={900} y={42} fontSize={27} fontWeight={700}>HỒ SƠ 02 — TƯ THẾ & KHỚP STYLE B</text><text x={900} y={69} fontSize={16}>Giữ đầu, tóc, trang phục hiện có · V3: áo một đường bao · tay nghỉ buông thẳng · bàn tay theo cẳng tay</text></g>
  {Object.keys(POSES).map((name,i)=>{
    const x=(i%6)*300,y=Math.floor(i/6)*525+95;
    const cast:Cast=i===4||i===9?'nguoi-kia':i===10||i===11?'tung':'nam';
    return <g key={name}><rect x={x+10} y={y} width={280} height={510} rx={18} fill="#fffbf4" stroke="#ded5c6"/>
      <StudentRig cast={cast} pose={name} mood={name==='recoil'?'shocked':cast==='tung'?'normal':cast==='nguoi-kia'?'calm':'suspicious'} x={x+145} y={y+30} scale={.69} showSupport/>
      <text x={x+150} y={y+470} textAnchor="middle" fontFamily="Arial,sans-serif" fontSize={19} fill={P.ink}>{POSE_LABELS[name]}</text>
    </g>;
  })}
  <text x={900} y={1192} textAnchor="middle" fontFamily="Arial,sans-serif" fontSize={16} fill="#59645e">Khớp đỏ trong trình xem: vai · khuỷu · cổ tay · hông · gối · cổ chân. Bước đi là mẫu tại chỗ, chưa phải diễn hoạt phim.</text>
</svg>;

export const ReferenceBoard:React.FC=()=> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1560 1080" width="1560" height="1080">
  <rect width={1560} height={1080} fill="#f6f1e8"/>
  <g fill={P.ink} textAnchor="middle" fontFamily="Arial,sans-serif"><text x={780} y={42} fontSize={27} fontWeight={700}>ĐỐI CHIẾU MẪU GỐC → RIG V3</text><text x={780} y={73} fontSize={16}>Cùng đầu, màu, dáng áo/quần; giữ chi tiết bàn tay, dép và đồ bóng đá</text></g>
  {[0,1,2,3].map((i)=><g key={i} transform={`translate(${195+i*390} 120)`}>
    <text y={0} textAnchor="middle" fontFamily="Arial,sans-serif" fontSize={20} fill={P.ink}>{['Nam — mẫu gốc','Nam — rig V3','Tùng — mẫu gốc','Tùng — rig V3'][i]}</text>
    <g transform="translate(0 25) scale(.94)">{i===0?<StudentTwinBody mood="sleepy"/>:i===2?<TungSoccer mood="normal"/>:<StudentRig cast={i===1?'nam':'tung'} pose="stand" mood={i===1?'sleepy':'normal'} showSupport/>}</g>
  </g>)}
  <path d="M 35 735 H 1525" stroke="#d4c8b7"/>
  <g fill={P.ink} textAnchor="middle" fontFamily="Arial,sans-serif" fontSize={18}><text x={250} y={782}>Bàn tay buông — ngón tròn, cổ tay liền</text><text x={780} y={782}>Bàn tay mở — lòng tay & ngón cái</text><text x={1290} y={782}>Cầm điện thoại — ngón ôm vật</text></g>
  <g stroke={P.ink} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round">
    <g transform="translate(250 875) scale(3.5)"><Palm point={v(0,0)} angle={0} shape="relaxed"/></g>
    <g transform="translate(780 990) scale(3.0)"><Palm point={v(0,0)} angle={180} shape="open"/></g>
    <g transform="translate(1290 890) scale(3.0)"><Palm point={v(0,0)} angle={0} shape="grip" phone/></g>
  </g>
</svg>;

export const JointDetailBoard:React.FC=()=> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width={1600} height={1000}>
  <rect width={1600} height={1000} fill="#f6f1e8"/>
  <text x={800} y={40} textAnchor="middle" fontFamily="Arial,sans-serif" fontSize={26} fill={P.ink}>V3 — KIỂM TRA NỐI ÁO, CỔ TAY VÀ CHIỀU BÀN TAY</text>
  {[
    {pose:'stand',label:'Vai / tay áo liền',box:'-125 168 250 180',cast:'nam'},
    {pose:'stand',label:'Tay nghỉ buông thẳng',box:'-110 300 220 130',cast:'nam'},
    {pose:'wary',label:'Hai bàn tay mở',box:'-160 180 320 180',cast:'nam'},
    {pose:'phone',label:'Cổ tay / ngón giữ điện thoại',box:'25 85 140 180',cast:'nam'},
    {pose:'offer',label:'Bàn tay mời giúp',box:'45 210 180 170',cast:'nguoi-kia'},
    {pose:'wash',label:'Hai tay giữ bát',box:'-30 220 200 150',cast:'nguoi-kia'},
    {pose:'type',label:'Tay gập trước thân',box:'-100 180 270 220',cast:'nam'},
    {pose:'stepLeft',label:'Quần / sọc được cắt trong viền',box:'-100 315 200 180',cast:'tung'},
  ].map((item,i)=>{
    const x=(i%4)*400,y=70+Math.floor(i/4)*460;
    return <g key={item.label}><rect x={x+10} y={y} width={380} height={440} rx={18} fill="#fffbf4" stroke="#d9cebf"/>
      <text x={x+200} y={y+32} textAnchor="middle" fontFamily="Arial,sans-serif" fontSize={18} fill={P.ink}>{item.label}</text>
      <svg x={x+20} y={y+52} width={360} height={365} viewBox={item.box}><StudentRig cast={item.cast as Cast} pose={item.pose} mood={item.cast==='tung'?'normal':'calm'}/></svg>
    </g>;
  })}
</svg>;

export const LegBalanceBoard:React.FC=()=> <svg xmlns="http://www.w3.org/2000/svg" width={1200} height={720} viewBox="0 0 1200 720">
  <rect width={1200} height={720} fill="#f6f1e8"/>
  <text x={600} y={43} textAnchor="middle" fontFamily="Arial,sans-serif" fontSize={26} fill={P.ink}>CÂN LẠI ĐÙI, ỐNG QUẦN VÀ BẮP CHÂN</text>
  {[
    {cast:'nam',pose:'stand',label:'Nam — hai ống quần cân nhau',box:'-140 300 280 320'},
    {cast:'tung',pose:'stand',label:'Tùng — đùi / vớ cân nhau',box:'-140 300 280 320'},
    {cast:'nam',pose:'sit',label:'Dáng ngồi — cùng độ đầy',box:'-170 260 340 320'},
  ].map((item,i)=><g key={item.label}>
    <rect x={i*400+12} y={75} width={376} height={600} rx={18} fill="#fffbf4" stroke="#d9cebf"/>
    <text x={i*400+200} y={112} textAnchor="middle" fontFamily="Arial,sans-serif" fontSize={18} fill={P.ink}>{item.label}</text>
    <svg x={i*400+22} y={140} width={356} height={500} viewBox={item.box}><StudentRig cast={item.cast as Cast} pose={item.pose} showSupport/></svg>
  </g>)}
  <text x={600} y={703} textAnchor="middle" fontFamily="Arial,sans-serif" fontSize={15} fill="#59645e">Giữ dáng quần rộng và nét cartoon; cân độ rộng chân, không ép các nếp vải phải giống hệt nhau.</text>
</svg>;
