import React, {useId} from 'react';
import {PALETTE as P, StudentTwinHead, TungHead, type NamMood, type TungMood} from '../nhan-vat';

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
  leftHand:v(-92,367), rightHand:v(90,367),
  leftFoot:v(-35,560), rightFoot:v(35,560),
  leftBend:1, rightBend:-1, leftKnee:1, rightKnee:-1,
  leftPalm:0, rightPalm:0, leftShape:'relaxed', rightShape:'relaxed',
  prop:'none',support:'floor',
};
export const POSES: Record<string, Pose> = {
  stand:{...base},
  wary:{...base,lean:-5,head:5,leftHand:v(-121,330),rightHand:v(121,319),leftShape:'open',rightShape:'open',leftPalm:30,rightPalm:-35,leftFoot:v(-56,560),rightFoot:v(50,560)},
  recoil:{...base,root:v(-9,13),lean:-9,head:8,leftHand:v(-127,282),rightHand:v(103,274),leftShape:'open',rightShape:'open',leftPalm:65,rightPalm:-70,leftFoot:v(-65,560),rightFoot:v(67,560)},
  phone:{...base,head:-4,rightHand:v(68,154),rightBend:1,rightPalm:0,rightShape:'grip',prop:'phone'},
  offer:{...base,lean:3,head:-3,rightHand:v(166,294),rightPalm:-85,rightShape:'open'},
  reach:{...base,lean:7,head:-3,rightHand:v(177,227),rightBend:1,rightShape:'grip',rightPalm:-85},
  sit:{...base,root:v(0,-38),lean:3,leftHand:v(-78,348),rightHand:v(80,350),leftFoot:v(-108,474),rightFoot:v(112,474),leftKnee:1,rightKnee:-1,support:'seat'},
  type:{...base,root:v(0,-38),lean:9,head:6,leftHand:v(9,290),rightHand:v(110,291),leftPalm:-72,rightPalm:-85,leftShape:'grip',rightShape:'grip',leftFoot:v(-108,474),rightFoot:v(112,474),leftKnee:1,rightKnee:-1,support:'seat'},
  bend:{...base,root:v(0,30),lean:17,head:12,leftHand:v(54,397),rightHand:v(145,406),leftShape:'grip',rightShape:'grip',leftFoot:v(-55,560),rightFoot:v(63,560)},
  wash:{...base,lean:7,head:9,leftHand:v(30,307),rightHand:v(107,298),leftPalm:-65,rightPalm:-80,leftShape:'grip',rightShape:'grip',prop:'bowl'},
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
export function skeleton(p:Pose) {
  const pelvis=v(p.root.x,337+p.root.y);
  const torso=(x:number,y:number)=>rotate(add(v(x,y),p.root),pelvis,p.lean);
  const ls=torso(-63,216),rs=torso(60,216),lh=add(pelvis,v(-34,8)),rh=add(pelvis,v(34,8));
  return {pelvis,neck:torso(-4,180),ls,rs,lh,rh,
    la:solveLimb(ls,p.leftHand,79,84,p.leftBend),ra:solveLimb(rs,p.rightHand,79,84,p.rightBend),
    ll:solveLimb(lh,p.leftFoot,p.support==='seat'?100:110,p.support==='seat'?100:109,p.leftKnee),rl:solveLimb(rh,p.rightFoot,p.support==='seat'?100:110,p.support==='seat'?100:109,p.rightKnee)};
}

function Palm({point,angle,shape,phone=false}:{point:Vec;angle:number;shape:HandShape;phone?:boolean}) {
  return <g transform={`translate(${point.x} ${point.y}) rotate(${angle})`}>
    <path d={shape==='open'?'M -10 -7 Q -22 -18 -23 -9 L -16 5 Q -27 0 -25 9 L -12 25 Q -6 31 6 25 L 14 10 L 18 -13 Q 15 -21 11 -12 L 8 0 L 8 -22 Q 4 -29 1 -20 L 0 -1 L -4 -23 Q -10 -28 -10 -18 L -8 0 Z':shape==='grip'?'M -10 -7 Q -17 2 -11 15 Q -3 26 9 17 L 15 4 Q 17 -6 7 -7 Z':'M -10 -7 Q -14 6 -9 20 Q -6 27 -2 20 Q 1 29 5 22 Q 10 26 12 18 L 14 5 Q 16 -6 8 -8 Z'} fill={P.skin}/>
    {phone&&<><rect x={-13} y={-30} width={29} height={55} rx={5} fill="#343e41"/><rect x={-9} y={-23} width={21} height={37} rx={2} fill="#9cb4ae" stroke="none"/><path d="M -12 3 Q 4 -4 11 3 L 9 12 Q -4 8 -12 14" fill={P.skin}/></>}
    {shape==='grip'&&!phone&&<path d="M -8 6 Q 0 0 9 6 M -5 12 L 7 12" fill="none" strokeWidth={1.6}/>}
  </g>;
}
function Shoe({point,sport,side}:{point:Vec;sport:boolean;side:-1|1}) {
  return <g transform={`translate(${point.x} ${point.y}) scale(${side} 1)`}>
    <path d="M -17 -6 Q 0 -12 18 -3 Q 39 1 43 13 Q 35 24 -17 17 Q -23 10 -17 -6 Z" fill={sport?P.tung.cleats:P.skin}/>
    <path d="M -19 13 Q 12 19 43 11 L 44 19 Q 10 28 -19 20 Z" fill={sport?P.tung.cleatsSole:P.nam.sole} strokeWidth={2.5}/>
    <path d="M -7 -5 Q 12 -9 27 6 L 29 14 Q 11 3 -10 7 Z" fill={sport?P.tung.jersey:P.nam.slippers} strokeWidth={2.5}/>
    {sport&&<path d="M 1 0 L 10 7 M 10 -1 L 19 7" stroke={P.tung.cleatsAccent} strokeWidth={2}/>}
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
  const limb=(l:ReturnType<typeof solveLimb>,w:number,color:string)=> <path d={limbOutline(l.start,l.mid,l.end,w,w*.83,w*.60)} fill={color}/>;
  const leg=(l:ReturnType<typeof solveLimb>,side:-1|1)=>{
    const split=add(l.start,scale(sub(l.mid,l.start),.60));
    return <g>
      {limb(l,sport?19:24,sport?P.skin:pants)}
      {sport&&<><path d={limbOutline(l.start,add(l.start,scale(sub(split,l.start),.5)),split,29,28,25)} fill={pants}/><path d={limbOutline(l.mid,add(l.mid,scale(sub(l.end,l.mid),.60)),l.end,16,15,12)} fill={P.tung.socks}/><path d={`M ${l.mid.x-9} ${l.mid.y+14} l 18 0 m -18 7 l 18 0`} stroke={P.tung.socksStripe} strokeWidth={2}/></>}
      {!sport&&<path d={`M ${l.mid.x-12} ${l.mid.y-4} q 10 6 20 0`} fill="none" strokeWidth={2}/>}<Shoe point={l.end} side={side} sport={sport}/>
    </g>;
  };
  const arm=(l:ReturnType<typeof solveLimb>)=>limb(l,18,P.skin);
  const sleeve=(l:ReturnType<typeof solveLimb>)=>{
    const end=add(l.start,scale(sub(l.mid,l.start),.45)),mid=add(l.start,scale(sub(end,l.start),.5));
    return <><path d={limbOutline(l.start,mid,end,24,25,23)} fill={shirt} stroke="none"/><path d={`M ${end.x-16} ${end.y} Q ${end.x} ${end.y+7} ${end.x+16} ${end.y}`} fill="none" stroke={sport?P.tung.jerseyTrim:P.ink} strokeWidth={2.4}/></>;
  };
  return <g transform={`translate(${x} ${y}) scale(${zoom})`} stroke={P.ink} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" data-cast={cast}>
    {showSupport&&<g stroke="#b7ae9f" fill="#ded4c4">
      {p.support==='seat'?<><path d={`M -110 ${s.pelvis.y+40} Q 0 ${s.pelvis.y+30} 115 ${s.pelvis.y+40} L 115 ${s.pelvis.y+56} L -110 ${s.pelvis.y+56} Z`}/><path d={`M -90 ${s.pelvis.y+56} L -90 540 M 95 ${s.pelvis.y+56} L 95 540`} fill="none" strokeWidth={11}/></>:<ellipse cx={0} cy={590} rx={116} ry={12} fill={P.shadowFloor} stroke="none"/>}
    </g>}
    {leg(s.ll,-1)}{leg(s.rl,1)}
    <path d={`M ${s.pelvis.x-56} ${s.pelvis.y-19} Q ${s.pelvis.x-72} ${s.pelvis.y+12} ${s.lh.x-22} ${s.lh.y+35} Q ${s.pelvis.x} ${s.pelvis.y+55} ${s.rh.x+22} ${s.rh.y+35} Q ${s.pelvis.x+74} ${s.pelvis.y+9} ${s.pelvis.x+55} ${s.pelvis.y-19} Z`} fill={pants}/>
    <path d={`M ${s.pelvis.x-3} ${s.pelvis.y+15} q 2 18 10 24`} fill="none" strokeWidth={2}/>
    {/* This pose family uses foreground arms. Separate rear-arm staging is required for back views. */}
    <g transform={`translate(${p.root.x} ${p.root.y}) rotate(${p.lean} 0 337)`}>
      <path d="M -26 178 Q -55 180 -70 202 Q -67 243 -57 271 Q -63 314 -57 348 Q -18 366 15 354 Q 41 360 59 345 L 53 271 Q 67 236 66 203 Q 46 184 17 178 Q -6 191 -26 178 Z" fill={shirt}/>
      <path d={sport?'M -24 179 L -7 204 L 0 192 L 9 204 L 18 179':'M -26 179 Q -17 209 0 201 Q 17 200 20 182'} fill="none" stroke={sport?P.tung.jerseyTrim:P.ink} strokeWidth={3}/>
      <path d="M -41 315 Q -15 328 12 318 M 20 341 Q 36 344 47 335" fill="none" strokeWidth={2}/>
      {sport&&<text x={0} y={275} textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="900" fontSize={36} fill={P.tung.number} stroke="none">7</text>}
      <g transform={`rotate(${p.head} -4 178)`}>
        {sport?<TungHead mood={(mood||'normal') as TungMood} id={`${id}-head`}/>:<StudentTwinHead mood={(mood||(cast==='nguoi-kia'?'calm':'sleepy')) as NamMood} id={`${id}-head`}/>}
      </g>
    </g>
    {arm(s.la)}{arm(s.ra)}{sleeve(s.la)}{sleeve(s.ra)}
    {p.prop==='bowl'&&<g transform={`translate(${s.ra.end.x-21} ${s.ra.end.y+12})`}><path d="M -56 -1 Q -39 43 0 35 Q 28 28 35 -1 Z" fill="#f2e6cf"/><ellipse cx={-10} cy={-1} rx={45} ry={10} fill="#d4e0d9"/></g>}
    <Palm point={s.la.end} angle={p.leftPalm} shape={p.leftShape}/>
    <Palm point={s.ra.end} angle={p.rightPalm} shape={p.rightShape} phone={p.prop==='phone'}/>
    {debug&&<g fill="#dc6045" stroke="#fff" strokeWidth={1.6}>
      {[s.pelvis,s.neck,s.ls,s.rs,s.la.mid,s.ra.mid,s.la.end,s.ra.end,s.lh,s.rh,s.ll.mid,s.rl.mid,s.ll.end,s.rl.end].map((pt,i)=><circle key={i} cx={pt.x} cy={pt.y} r={5}/>)}
      <g fill="none" stroke="#c44d37" strokeDasharray="5 5" strokeWidth={1.5}>{[s.la,s.ra,s.ll,s.rl].map((l,i)=><path key={i} d={`M ${l.start.x} ${l.start.y} L ${l.mid.x} ${l.mid.y} L ${l.end.x} ${l.end.y}`}/>)}</g>
    </g>}
  </g>;
};

export const PoseBoard:React.FC=()=> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1220" width="1800" height="1220">
  <rect width={1800} height={1220} rx={24} fill="#f6f1e8"/>
  <g fontFamily="Arial,sans-serif" fill={P.ink} textAnchor="middle"><text x={900} y={42} fontSize={27} fontWeight={700}>HỒ SƠ 02 — TƯ THẾ & KHỚP STYLE B</text><text x={900} y={69} fontSize={16}>Giữ đầu, tóc, trang phục hiện có · Mẫu khớp để duyệt trước khi Claude dựng cảnh</text></g>
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
