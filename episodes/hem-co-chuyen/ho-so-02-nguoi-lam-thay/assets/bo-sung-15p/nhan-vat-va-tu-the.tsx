import React from 'react';
import { Rigged, StudentTwinBody, StudentTwinHead, STAND_POSE, TWIN_POSES, TWIN_OUTFIT, solveRig, type JointPose, type Outfit, type NamMood } from '../nhan-vat';
import { C } from './common';
import { FruitBag, Hammer } from './dao-cu';

const Foot: Outfit['Foot'] = ({ side }) => <g transform={`scale(${side==='R'?-1:1} 1)`}><path d="M-18-9Q-9-23 8-13L34 0Q40 12 25 14H-17Q-25 8-18-9Z" fill="#4d554e"/><path d="M-21 7Q1 16 35 7L35 14Q4 24-21 15Z" fill="#343f39"/><path d="M-9-9Q6-6 12 1" stroke="#959b89" strokeWidth={3} fill="none"/></g>;
const torso='M-26 177Q-60 181-86 212L-60 262Q-66 312-62 352Q-23 370 12 356Q38 364 62 346Q56 304 54 262L80 212Q66 192 16 178Q-7 196-26 177Z';
export const formalOutfit = (shirt='#ede9d8',pants='#515451'): Outfit => ({shirt,pants,torso,sleeveEnd:.58,pantsLen:'long',hem:[[-52,322],[50,322],[63,348],[38,366],[12,358],[-23,372],[-64,354]],Foot,detail:<g fill="none" stroke="#4f6057" strokeOpacity={.4} strokeWidth={2.2}><path d="M-26 180L-7 205 2 191 19 203 23 181M-4 204L-3 347M-55 224L-52 254M55 224L57 253M-42 327Q-19 337-6 329"/><path d="M-26 180L-7 205 2 191 19 203 23 181" fill="#dedac9" stroke="none"/>{[222,252,282,313].map(y=><circle key={y} cx={4} cy={y} r={2} fill="#8b9586" stroke="none"/>)}</g>});

export type Role='giang-vien'|'me'|'ba'|'bac-hai'|'sinh-vien-nam'|'sinh-vien-nu';
const roleLook: Record<Role,{hair:string;shirt:string;pants:string;female?:boolean;glasses?:boolean;age?:boolean}> = {
 'giang-vien':{hair:'#3e413a',shirt:'#a1aa89',pants:'#4e5c51',glasses:true,age:true},
 me:{hair:'#393e36',shirt:'#ad7e64',pants:'#535f52',female:true,age:true},
 ba:{hair:'#55554a',shirt:'#7d94a0',pants:'#4d5859',age:true},
 'bac-hai':{hair:'#8c8d7b',shirt:'#b6a681',pants:'#5d6254',age:true},
 'sinh-vien-nam':{hair:'#4e4237',shirt:'#9a927a',pants:'#56665d'},
 'sinh-vien-nu':{hair:'#3c3d34',shirt:'#a58276',pants:'#677367',female:true},
};
export const SupportingHead=({role,smile=true}:{role:Role;smile?:boolean})=>{const l=roleLook[role];return <g data-layer="head"><path d="M-26 135L-26 181Q-5 198 21 178L22 139Z" fill={C.skin}/><path d="M-26 145Q-5 168 21 146V168Q-2 184-26 167Z" fill={C.shade}/>{l.female&&<><ellipse cx={-42} cy={role==='me'?69:91} rx={role==='me'?24:18} ry={role==='me'?48:67} fill={l.hair}/>{role==='me'&&<ellipse cx={-9} cy={9} rx={26} ry={23} fill={l.hair}/>}</>}<ellipse cx={-43} cy={104} rx={15} ry={22} fill={C.skin}/><path d={role==='bac-hai'?'M-43 41Q-30 14 12 27Q57 27 60 69L62 122Q54 160 11 164Q-26 164-39 131Z':'M-43 69Q-42 28 7 28Q55 28 61 71L62 122Q54 160 11 164Q-26 164-39 131Z'} fill={C.skin}/><path d={l.female?'M-44 110Q-58 81-47 49Q-32 17 7 22Q47 19 59 54L59 80Q33 70 11 47Q-2 78-31 87L-34 111Z':role==='bac-hai'?'M-43 109Q-63 79-40 48L-18 43Q-38 65-30 108ZM36 42Q64 51 64 82L55 96 48 62Z':'M-44 110Q-58 83-47 50Q-33 18 7 22Q46 19 59 52L59 73Q35 66 15 45Q1 76-29 80L-34 111Z'} fill={l.hair}/>{role==='ba'&&<path d="M-22 49L32 32" stroke="#c4b99b" opacity={.4} strokeWidth={3}/>}<g stroke={C.ink} strokeLinecap="round" fill="none"><path d="M-26 85Q-12 80-1 85M18 83Q32 77 45 82" strokeWidth={4}/><ellipse cx={-12} cy={101} rx={12} ry={9} fill={C.white} strokeWidth={1.5}/><ellipse cx={32} cy={99} rx={12} ry={9} fill={C.white} strokeWidth={1.5}/><ellipse cx={-9} cy={102} rx={3.5} ry={4.5} fill={C.ink} stroke="none"/><ellipse cx={34} cy={100} rx={3.5} ry={4.5} fill={C.ink} stroke="none"/><path d="M9 104Q23 119 12 122" strokeWidth={2}/><path d={smile?'M-4 137Q12 149 29 135':'M-4 141Q12 138 29 139'} strokeWidth={2.5}/>{l.age&&<path d="M-30 115L-25 118M47 111L50 113M-16 63Q6 58 24 62" strokeWidth={1.5} opacity={.45}/>}<path d="M-47 101Q-38 101-40 110" strokeWidth={1.7}/>{l.glasses&&<g stroke="#485850" strokeWidth={3}><rect x={-30} y={88} width={36} height={26} rx={7}/><rect x={15} y={86} width={36} height={26} rx={7}/><path d="M6 97L15 96M-30 96L-43 91"/></g>}</g></g>;};

export const SupportingActor=({role,x=0,y=0,scale=1,pose=STAND_POSE,smile=true}:{role:Role;x?:number;y?:number;scale?:number;pose?:JointPose;smile?:boolean})=>{const l=roleLook[role];return <Rigged x={x} y={y} scale={scale} pose={{...pose,view:'three',facing:1}} outfit={formalOutfit(l.shirt,l.pants)} head={<SupportingHead role={role} smile={smile}/>} outline="none"/>;};

// Search the existing rig's actual angle convention; attachment uses its solved endpoint.
const armTo=(p:JointPose,side:'R'|'L',target:[number,number]):JointPose=>{let best={score:Infinity,a:0,b:0,rot:1 as 1|-1};for(let a=-130;a<=180;a+=2)for(let b=0;b<=150;b+=2)for(const rot of [1,-1] as const){const q={...p,[side==='R'?'armR':'armL']:{a,b,rot}};const end=solveRig(q)[side==='R'?'armR':'armL'].end;const mid=solveRig(q)[side==='R'?'armR':'armL'].mid;const score=Math.hypot(end.x-target[0],end.y-target[1])+Math.max(0,205-mid.y)*1.5;if(score<best.score)best={score,a,b,rot};}return {...p,[side==='R'?'armR':'armL']:{a:best.a,b:best.b,rot:best.rot}};};
export const gripAt=(p:JointPose,side:'R'|'L')=>{const r=solveRig(p),v=r[side==='R'?'armR':'armL'].end,a=r.tilt*Math.PI/180;return {x:p.x+v.x*Math.cos(a)-(v.y-345)*Math.sin(a),y:r.dy+345+v.x*Math.sin(a)+(v.y-345)*Math.cos(a)};};
const base={...STAND_POSE,frontR:true,frontL:true,view:'three' as const};
const raised=armTo(armTo({...base,handR:'hold',handL:'hold'},'R',[65,200]),'L',[32,255]);
// Mỗi bàn tay ôm một đầu máy ngang; giải cổ tay theo hướng cẳng tay thật.
const gamingPose=(p:JointPose)=>{let q=armTo(armTo({...p,prop:'phoneLandscape',handR:'hold',handL:'hold',frontR:true,frontL:true},'R',[-47,306]),'L',[47,306]);const r=solveRig(q);return {...q,wristR:Math.max(-70,Math.min(70,-90-r.armR.deg)),wristL:Math.max(-70,Math.min(70,90-r.armL.deg))};};
const seatedGame=gamingPose({...TWIN_POSES.sit,tilt:8,neck:5});
const lyingBase:JointPose={...STAND_POSE,view:'front',support:'bed',planted:false,frontR:true,frontL:true,legR:{a:0,b:0},legL:{a:0,b:0},tilt:0,neck:0};
const collapsed=armTo(armTo({...TWIN_POSES.sit,tilt:12,neck:5,handR:'rest',handL:'rest'},'R',[-44,373]),'L',[71,376]);
export const EXTRA_POSES:Record<string,JointPose>={
 'thi-uy':{...base,armR:{a:-30,b:120,rot:-1},armL:{...STAND_POSE.armL},wristR:-12,handR:'fist',handL:'rest',frontR:true,frontL:false,tilt:-2,neck:2},
 'thuyet-trinh':{...base,armR:{...STAND_POSE.armR},armL:{a:28,b:54,rot:1},wristL:-25,handR:'rest',handL:'open',frontR:false,frontL:true,palmUp:'L',neck:-3},
 'choi-game':seatedGame,
 'cam-tui':{...base,armL:{a:-7,b:4,rot:-1},handL:'hold'},
 'giu-bua':raised,
 'suy-sup':collapsed,
 'nam-choi-game':gamingPose(lyingBase),
 'nam-nhin-tran':{...lyingBase,armR:{a:8,b:4},armL:{a:8,b:4,rot:-1},frontR:false,frontL:false},
 'ap-kinh':armTo({...base,tilt:4,handL:'open',handR:'rest',wristL:-65,frontR:false},'L',[209,263]),
 'nhan-do-tay-trai':armTo({...base,handL:'hold',handR:'rest',frontR:false},'L',[174,300]),
};
export const FormalTwin=({pose=base,identity='nguoi-kia',mood='calm',x=0,y=0,scale=1}:{pose?:JointPose;identity?:'nam'|'nguoi-kia';mood?:NamMood;x?:number;y?:number;scale?:number})=><Rigged x={x} y={y} scale={scale} pose={pose} outfit={formalOutfit()} head={<StudentTwinHead identity={identity} mood={mood} view={pose.view} id="formal-twin"/>} outline="none"/>;
const BareFoot:Outfit['Foot']=({side})=><g transform={`scale(${side==='R'?-1:1} 1)`}><path d="M-16-10Q0-17 17-8L23 14Q26 25 16 28Q-2 32-21 26Q-26 22-22 11Z" fill={C.skin}/></g>;
export const PoseActor=({name,x=0,y=0,scale=1}:{name:keyof typeof EXTRA_POSES;x?:number;y?:number;scale?:number})=>{
 const p=EXTRA_POSES[name],hand=gripAt(p,name==='giu-bua'?'R':'L'),bed=p.support==='bed',seated=name==='choi-game'||name==='suy-sup',seatY=solveRig(p).dy+382;
 return <g transform={`translate(${x} ${y}) scale(${scale})`} data-pose={name}>
  {bed&&<g data-layer="support"><rect x={-152} y={-15} width={304} height={663} rx={37} fill="#a6b1a0"/><rect x={-140} y={-9} width={280} height={644} rx={31} fill="#d4d7bd"/><path d="M-135 200Q-123 397-138 606M138 200Q123 393 138 606" stroke="#bec5ad" strokeWidth={3} fill="none"/><rect x={-107} y={2} width={214} height={149} rx={33} fill="#e8e3ce"/><path d="M-92 20Q-101 73-90 129M93 20Q103 72 91 130" stroke="#d5d1ba" strokeWidth={3} fill="none"/></g>}
  {seated&&<g data-layer="support"><rect x={-86} y={seatY-153} width={166} height={159} rx={22} fill="#9ba595"/><rect x={-83} y={seatY} width={199} height={22} rx={10} fill="#7e8f7f"/><path d={`M-65 ${seatY+18}V589M96 ${seatY+18}V589`} stroke="#64796b" strokeWidth={12}/></g>}
  {name==='giu-bua'&&<g transform={`translate(${hand.x} ${hand.y}) rotate(31)`}><Hammer/></g>}
  {name==='cam-tui'&&<g transform={`translate(${hand.x} ${hand.y}) scale(.7)`}><FruitBag/></g>}
  {bed?<Rigged x={0} y={0} scale={1} pose={p} outfit={{...TWIN_OUTFIT,shirt:'#8a8783',Foot:BareFoot}} head={<StudentTwinHead gazeY={name==='nam-choi-game'?5:0} view="front" mood={name==='nam-nhin-tran'?'hesitant':'calm'}/>} outline="none"/>:<StudentTwinBody face={name==='suy-sup'?'buon-02':undefined} pose={p} shirt={C.jade} mood={name==='suy-sup'?'hesitant':name==='thi-uy'?'annoyed':'calm'}/>}
 </g>;
};
