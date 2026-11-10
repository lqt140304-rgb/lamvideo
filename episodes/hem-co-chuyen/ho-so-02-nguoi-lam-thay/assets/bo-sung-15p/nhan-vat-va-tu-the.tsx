import React from 'react';
import { Rigged, StudentTwinBody, StudentTwinHead, TungSoccer, STAND_POSE, TWIN_POSES, TWIN_OUTFIT, solveRig, type JointPose, type Outfit, type NamMood } from '../nhan-vat';
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
// suy sụp: đổ người tới, cẳng tay tì lên đùi, hai bàn tay buông thõng giữa hai gối, đầu cúi
const collapsed=armTo(armTo({...TWIN_POSES.sit,tilt:17,neck:9,handR:'rest',handL:'rest'},'R',[66,404]),'L',[96,410]);
export const EXTRA_POSES:Record<string,JointPose>={
 // thị uy: nắm tay giơ trước ngực–vai (khuỷu thả xuống, cẳng tay dựng), tay kia buông; ngực ưỡn nhẹ
 'thi-uy':{...base,armR:{a:-58,b:132,rot:-1},armL:{...STAND_POSE.armL},wristR:-18,handR:'fist',handL:'rest',frontR:true,frontL:false,tilt:-3,neck:3},
 // thuyết trình: khuỷu gập ~70°, cẳng tay đưa ra trước, lòng bàn tay ngửa
 'thuyet-trinh':{...base,armR:{...STAND_POSE.armR},armL:{a:30,b:72,rot:1},wristL:-12,handR:'rest',handL:'open',frontR:false,frontL:true,palmUp:'L',neck:-3},
 'choi-game':seatedGame,
 'cam-tui':{...base,armL:{a:-7,b:4,rot:-1},handL:'hold'},
 'giu-bua':raised,
 'suy-sup':collapsed,
 'nam-choi-game':gamingPose(lyingBase),
 'nam-nhin-tran':{...lyingBase,armR:{a:8,b:4},armL:{a:8,b:4,rot:-1},frontR:false,frontL:false},
 // áp kính: bàn tay áp mặt kính, khuỷu hơi chùng (không duỗi căng hết cỡ)
 'ap-kinh':armTo({...base,tilt:4,handL:'open',handR:'rest',wristL:-65,frontR:false},'L',[186,258]),
 // nhận đồ: khuỷu gập ~90° sát hông, cẳng tay đưa ra trước, lòng bàn tay ngửa để đón
 'nhan-do-tay-trai':armTo({...base,handL:'open',palmUp:'L',wristL:-8,handR:'rest',frontR:false},'L',[150,332]),
 // ---- Dáng theo CHECKLIST-TIEN-KY-ASSET mục 3 (mã pose ghi trong POSE_INFO) ----
 // NAM_P02 bật dậy: ngồi mép nệm thấp, lưng gập tới, hai nắm tay ghì mép chăn trước gối
 'bat-day':armTo(armTo({...TWIN_POSES.sitLow,view:'three',tilt:12,neck:-6,handR:'fist',handL:'fist',frontR:true,frontL:true},'R',[42,300]),'L',[84,302]),
 // NAM_P03 lùi va ghế: thân ngả ra sau, gối gần khuỵu vì va cạnh ghế, tay phải vơ điện thoại, tay kia hất ra giữ thăng bằng
 'lui-va-ghe':{...base,tilt:-9,neck:7,armR:{a:-62,b:96,rot:-1},wristR:-30,handR:'phone',prop:'phone',armL:{a:-38,b:24,rot:-1},handL:'open',frontL:false,legR:{a:22,b:34},legL:{a:-10,b:4}},
 // NAM_P04 gài then: tay trái đẩy then ngang vai, tay phải ghì điện thoại trước ngực, nghiêng đầu áp tai về phía cửa
 'gai-then':armTo({...TWIN_POSES.phone,view:'three',tilt:5,neck:7,handL:'fist',frontL:true},'L',[150,236]),
 // NAM_P07 tập nói trước gương: hai tay ôm sách mở trước ngực, vai rụt, đầu cúi
 'tap-noi':{...base,neck:-5,armR:{a:6,b:84,rot:1},armL:{a:-18,b:96,rot:1},wristR:-10,wristL:-10,handR:'hold',handL:'hold'},
 // NAM_P08 bục giảng: hai tay buông, tay phải cầm mẩu phấn, đầu cúi gằm
 'buc-giang':{...base,tilt:3,neck:11,armR:{a:4,b:16},handR:'hold',armL:{a:3,b:10,rot:-1},handL:'rest',frontL:false},
 // NAM_P10 quỳ gục: hai gối chạm sàn, thân đổ tới, hai bàn tay chống sàn trước gối
 'quy-guc':armTo(armTo({...base,tilt:22,neck:14,handR:'open',handL:'open',legR:{a:24,b:112},legL:{a:14,b:106}},'R',[96,520]),'L',[130,524]),
 // GUE_P04 chờ đợi: ngồi thẳng, hai bàn tay úp trên đùi, đầu hơi cúi
 'nk-cho-doi':armTo(armTo({...TWIN_POSES.sit,tilt:2,neck:5,handR:'rest',handL:'rest'},'R',[52,368]),'L',[92,372]),
 // GUE_P05 đỡ búa: bàn tay trái mở ngang ngực đón đầu búa, tay phải buông
 'nk-do-bua':armTo({...base,tilt:-2,handL:'open',palmUp:'L',wristL:-8,handR:'rest',frontR:false},'L',[148,300]),
 // GUE_P06 gài then: tay trái vươn ra gài then, tay phải buông
 'nk-gai-then':armTo({...base,tilt:4,handL:'fist',handR:'rest',frontR:false},'L',[164,240]),
 // TUNG_P01 xách cơm đá cửa: tay trái xách túi, chân phải đá ra sau
 'tung-xach-com':{...base,tilt:4,armL:{a:-8,b:6,rot:-1},handL:'hold',armR:{a:-24,b:30},handR:'rest',frontR:false,legR:{a:-34,b:46},legL:{a:6,b:4}},
 // TUNG_P02 khoanh tay: hai cẳng tay bắt chéo trước ngực, đầu nghiêng
 'tung-khoanh-tay':armTo(armTo({...base,neck:-6,handR:'rest',handL:'rest'},'R',[62,280]),'L',[-26,286]),
 // TUNG_P03 khựng đũa: ngồi, tay phải giơ đôi đũa dừng giữa chừng
 'tung-cam-dua':armTo(armTo({...TWIN_POSES.sit,tilt:6,neck:-4,handR:'hold',handL:'rest',frontL:true},'R',[118,286]),'L',[84,372]),
};
/** Ai diễn và đạo cụ/ghế đi kèm cho mỗi dáng trong bảng. */
const WHO:Record<string,'nguoi-kia'|'tung'>={'nk-cho-doi':'nguoi-kia','nk-do-bua':'nguoi-kia','nk-gai-then':'nguoi-kia','tung-xach-com':'tung','tung-khoanh-tay':'tung','tung-cam-dua':'tung'};
const SEATED=['choi-game','suy-sup','nk-cho-doi','tung-cam-dua'];
const MOOD:Record<string,NamMood>={'suy-sup':'hesitant','thi-uy':'annoyed','bat-day':'shocked','lui-va-ghe':'shocked','gai-then':'scared','tap-noi':'hesitant','buc-giang':'scared','quy-guc':'hesitant','nk-do-bua':'neutral_smile','nk-gai-then':'eerie_smirk'};
/** Mã pose trong CHECKLIST-TIEN-KY-ASSET.md cho các dáng làm theo checklist. */
export const POSE_INFO:Record<string,string>={'bat-day':'NAM_P02','lui-va-ghe':'NAM_P03','gai-then':'NAM_P04','tap-noi':'NAM_P07','buc-giang':'NAM_P08','quy-guc':'NAM_P10','nk-cho-doi':'GUE_P04','nk-do-bua':'GUE_P05','nk-gai-then':'GUE_P06','tung-xach-com':'TUNG_P01','tung-khoanh-tay':'TUNG_P02','tung-cam-dua':'TUNG_P03'};
export const FormalTwin=({pose=base,identity='nguoi-kia',mood='calm',x=0,y=0,scale=1}:{pose?:JointPose;identity?:'nam'|'nguoi-kia';mood?:NamMood;x?:number;y?:number;scale?:number})=><Rigged x={x} y={y} scale={scale} pose={pose} outfit={formalOutfit()} head={<StudentTwinHead identity={identity} mood={mood} view={pose.view} id="formal-twin"/>} outline="none"/>;
const BareFoot:Outfit['Foot']=({side})=><g transform={`scale(${side==='R'?-1:1} 1)`}><path d="M-16-10Q0-17 17-8L23 14Q26 25 16 28Q-2 32-21 26Q-26 22-22 11Z" fill={C.skin}/></g>;
export const PoseActor=({name,x=0,y=0,scale=1}:{name:keyof typeof EXTRA_POSES;x?:number;y?:number;scale?:number})=>{
 const p=EXTRA_POSES[name],hand=gripAt(p,name==='giu-bua'?'R':'L'),handR=gripAt(p,'R'),bed=p.support==='bed',seated=SEATED.includes(name),low=name==='bat-day',seatY=solveRig(p).dy+382,who=WHO[name],mood=MOOD[name]??'calm';
 return <g transform={`translate(${x} ${y}) scale(${scale})`} data-pose={name}>
  {bed&&<g data-layer="support"><rect x={-152} y={-15} width={304} height={663} rx={37} fill="#a6b1a0"/><rect x={-140} y={-9} width={280} height={644} rx={31} fill="#d4d7bd"/><path d="M-135 200Q-123 397-138 606M138 200Q123 393 138 606" stroke="#bec5ad" strokeWidth={3} fill="none"/><rect x={-107} y={2} width={214} height={149} rx={33} fill="#e8e3ce"/><path d="M-92 20Q-101 73-90 129M93 20Q103 72 91 130" stroke="#d5d1ba" strokeWidth={3} fill="none"/></g>}
  {seated&&<g data-layer="support"><rect x={-86} y={seatY-153} width={166} height={159} rx={22} fill="#9ba595"/><rect x={-83} y={seatY} width={199} height={22} rx={10} fill="#7e8f7f"/><path d={`M-65 ${seatY+18}V589M96 ${seatY+18}V589`} stroke="#64796b" strokeWidth={12}/></g>}
  {name==='giu-bua'&&<g transform={`translate(${hand.x} ${hand.y}) rotate(31)`}><Hammer/></g>}
  {name==='cam-tui'&&<g transform={`translate(${hand.x} ${hand.y}) scale(.7)`}><FruitBag/></g>}
  {low&&<g data-layer="support"><rect x={-150} y={seatY-6} width={300} height={595-seatY} rx={18} fill="#a6b1a0"/><rect x={-150} y={seatY-14} width={300} height={30} rx={14} fill="#d4d7bd"/><path d={`M-150 ${seatY+8}Q-60 ${seatY-6} 40 ${seatY+10}Q70 ${seatY+40} 30 ${seatY+70}L-150 ${seatY+66}Z`} fill="#e8e3ce"/></g>}
  {bed?<Rigged x={0} y={0} scale={1} pose={p} outfit={{...TWIN_OUTFIT,shirt:'#8a8783',Foot:BareFoot}} head={<StudentTwinHead gazeY={name==='nam-choi-game'?5:0} view="front" mood={name==='nam-nhin-tran'?'hesitant':'calm'}/>} outline="none"/>:who==='tung'?<TungSoccer pose={p} mood={name==='tung-xach-com'?'normal':name==='tung-cam-dua'?'focused':'annoyed'}/>:<StudentTwinBody identity={who??'nam'} face={name==='suy-sup'||name==='quy-guc'?'buon-02':undefined} pose={p} shirt={who?'#5f6b78':C.jade} mood={mood}/>}
  {name==='nk-do-bua'&&<g transform={`translate(${hand.x+4} ${hand.y-20}) rotate(-80) translate(0 118)`}><Hammer/></g>}
  {name==='tung-xach-com'&&<g transform={`translate(${hand.x} ${hand.y})`}><path d="M-8 0Q-22 22-30 40H30Q22 22 8 0" fill="none" stroke="#e9e6dc" strokeWidth={3}/><rect x={-42} y={38} width={84} height={46} rx={9} fill="#d8cfb6"/><rect x={-42} y={38} width={84} height={12} rx={6} fill="#b9ad8f"/></g>}
  {name==='tung-cam-dua'&&<path d={`M${handR.x-6} ${handR.y-4}L${handR.x+70} ${handR.y-26}M${handR.x-4} ${handR.y+4}L${handR.x+72} ${handR.y-14}`} stroke="#b88b52" strokeWidth={4} strokeLinecap="round"/>}
  {name==='tap-noi'&&<g transform={`translate(${(hand.x+handR.x)/2} ${(hand.y+handR.y)/2-4}) scale(1.25)`}><path d="M-46-30L0-22 46-30V24L0 32-46 24Z" fill="#efe8d4"/><path d="M0-22V32" stroke="#b9ad90" strokeWidth={2}/><path d="M-38-14H-8M-38-2H-8M8-14H38M8-2H38" stroke="#b9ad90" strokeWidth={2}/></g>}
  {name==='buc-giang'&&<rect x={handR.x-5} y={handR.y+4} width={10} height={26} rx={4} fill="#f4f1e6" transform={`rotate(-25 ${handR.x} ${handR.y})`}/>}
 </g>;
};
