import React from 'react';
import {Hero, LOOKS, basePose} from '../../../../../what-if-studio/src/engine/rig';

// Preview only: separate drawn SVG parts, not yet a replacement for the animation rig.
const ink = '#282b2b', skin = '#dbad82', hair = '#292a29', shirt = '#5c7a70';
type Mood = 'tired' | 'scared' | 'thinking';
export function StudentHead({mood='tired', id='head'}: {mood?:Mood; id?:string}) {
  const afraid=mood==='scared', suspicious=mood==='thinking';
  return <g stroke={ink} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round">
    <path d="M-28 141 L-28 182 Q-8 201 16 181 L19 138" fill={skin}/>
    <path d="M-26 155 Q-8 171 17 153 L16 175 Q-7 187-27 174Z" fill="#bd8968" stroke="none"/>
    <path d="M-55 60 Q-50 25-9 25 Q42 24 53 66 L55 111 Q72 130 54 146 Q38 166 6 165 Q-30 163-45 138 L-58 100Z" fill={skin}/>
    <path d="M-47 87 Q-75 72-77 99 Q-78 121-50 125" fill={skin}/>
    <path d="M-65 99 Q-57 93-53 106" fill="none" strokeWidth={2.4}/>
    <path d="M-51 92 Q-65 79-61 52 L-71 51 Q-58 27-38 28 L-43 18 Q-20 21-7 14 Q-10-5 15-5 Q22-4 24 4 Q7 0 8 16 Q40 13 51 37 L62 43 L48 59 Q34 54 22 43 Q15 63-4 67 L-1 52 Q-20 75-41 74 L-43 95Z" fill={hair}/>
    <defs><clipPath id={id}><ellipse cx={-11} cy={99} rx={17} ry={afraid?23:15}/><ellipse cx={30} cy={96} rx={15} ry={afraid?22:14}/></clipPath></defs>
    <ellipse cx={-11} cy={99} rx={17} ry={afraid?23:15} fill="#f8f3e7" strokeWidth={2.5}/>
    <ellipse cx={30} cy={96} rx={15} ry={afraid?22:14} fill="#f8f3e7" strokeWidth={2.5}/>
    <g clipPath={`url(#${id})`}>
      <ellipse cx={suspicious?-4:-8} cy={afraid?100:102} rx={afraid?3.3:4} ry={afraid?5:5.5} fill={ink} stroke="none"/>
      <ellipse cx={suspicious?36:32} cy={afraid?97:99} rx={afraid?3.3:4} ry={afraid?5:5.5} fill={ink} stroke="none"/>
      {!afraid&&<path d={suspicious?'M-33 77 L9 100 L49 76 L49 61 L-33 61Z':'M-33 70 L51 70 L51 91 L-33 99Z'} fill={skin} strokeWidth={2.5}/>}
    </g>
    <path d={afraid?'M-29 69 Q-16 58-2 64 M17 62 Q32 54 43 64':suspicious?'M-28 78 L2 87 M19 79 L44 68':'M-28 78 Q-12 74 2 75 M19 72 Q33 69 44 70'} fill="none" strokeWidth={5.5}/>
    <path d="M18 106 Q30 108 26 117 L17 119" fill="none" strokeWidth={2.5}/>
    {afraid?<><path d="M-3 139 Q1 121 16 126 Q31 129 30 148 Q11 139-3 148Z" fill="#513331"/><path d="M4 129 Q13 125 22 132 L22 137 L4 135Z" fill="#faf3e5" stroke="none"/><path d="M4 145 Q12 138 23 146" stroke="#bf7b73" strokeWidth={3}/></>:suspicious?<path d="M-6 141 Q9 136 22 140" fill="none" strokeWidth={2.8}/>:<path d="M8 139 Q20 131 25 144 Q15 149 8 145Z" fill="#513331" strokeWidth={2.5}/>}
  </g>;
}
export function Student(){return <g stroke={ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
  <ellipse cx={0} cy={589} rx={103} ry={13} fill="#d6c9b6" stroke="none"/>
  <path d="M-53 537 L-54 568 L-14 567 L-13 533 M18 537 L22 570 L61 566 L56 531" fill={skin}/>
  <path d="M-54 561 Q-80 568-78 585 Q-53 597-5 586 L-7 575 Q-20 560-54 561Z" fill={skin}/>
  <path d="M23 561 Q44 559 67 568 Q91 571 89 584 Q57 596 15 585 L13 573Z" fill={skin}/>
  <path d="M-78 583 Q-45 593-6 583 L-6 590 Q-43 601-79 590Z M15 583 Q56 591 89 581 L90 588 Q54 600 15 591Z" fill="#393e3c" strokeWidth={2.5}/>
  <path d="M-64 565 Q-38 553-17 567 L-12 579 Q-39 564-70 580Z M26 563 Q52 559 71 573 L75 583 Q49 568 20 578Z" fill="#425850" strokeWidth={2.5}/>
  <path d="M-63 329 Q-80 364-71 403 L-67 454 Q-78 491-65 548 Q-42 560-10 548 L-3 466 L10 411 Q17 446 16 471 L13 548 Q35 559 66 545 L67 445 Q83 388 61 330Z" fill="#515451"/>
  <path d="M-6 368 Q-3 388 10 411 M-62 437 Q-40 447-35 466 M24 512 Q37 503 51 506 M-53 538 L-20 539" fill="none" strokeWidth={2.5}/>
  <path d="M-73 235 Q-89 274-84 312 L-91 367 Q-91 383-81 387 L-76 378 Q-74 394-66 389 L-64 378 Q-58 389-52 381 L-49 368 Q-46 351-57 349 L-57 310 L-43 256Z" fill={skin}/>
  <path d="M53 235 Q74 268 71 299 L77 353 Q91 370 82 382 Q77 387 73 378 Q74 393 67 392 Q60 391 60 379 Q58 390 52 385 L48 367 Q47 358 51 351 L45 309 L32 258Z" fill={skin}/>
  <path d="M-26 177 Q-58 179-77 201 Q-94 221-96 245 Q-77 263-52 262 L-58 298 Q-66 329-61 351 Q-23 370 12 355 Q38 363 63 345 L55 281 L58 257 Q78 256 87 244 Q84 207 60 192 L16 178 Q-7 194-26 177Z" fill={shirt}/>
  <path d="M-26 179 Q-23 203-1 203 Q14 201 21 183 M-55 218 Q-53 241-52 262 M56 219 L58 257 M-45 316 Q-19 333 15 320 M15 340 Q36 343 48 334" fill="none" strokeWidth={2.5}/>
  <StudentHead/>
</g>}
export function Board(){const moods: Mood[]=['tired','scared','thinking'];return <svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1200" viewBox="0 0 1800 1200">
  <rect width="1800" height="1200" fill="#f5efE3"/>
  <path d="M900 45V1150" stroke="#d7cebf" strokeWidth={2}/>
  <g fontFamily="Arial, sans-serif" fill={ink} textAnchor="middle">
    <text x={450} y={65} fontSize={27} fontWeight="700">RIG HIỆN CÓ</text>
    <text x={1350} y={65} fontSize={27} fontWeight="700">MẪU THỬ B · VẼ BẰNG SVG</text>
    <text x={450} y={100} fontSize={18} fill="#72766c">Cùng màu áo và ba trạng thái để đối chiếu</text>
    <text x={1350} y={100} fontSize={18} fill="#72766c">Mảng tóc gọn · vai mềm · quần có khối</text>
  </g>
  <Hero pose={{...basePose,x:440,y:510,scale:1.32,expr:'tired',headTilt:5,shoulderLift:-.5,handL:'rest',handR:'rest'}} look={{...LOOKS.nam,skin,hand:skin,forearm:skin,jacket:shirt,jacketShade:'#456358',limb:'#515451',extra:'spiky',shin:undefined,lineless:false}} shadow={.2}/>
  <g transform="translate(1350 155) scale(1.05)"><Student/></g>
  <path d="M75 830 H825 M975 830 H1725" stroke="#d7cebf" strokeWidth={2}/>
  {moods.map((m,i)=><g key={m}>
    <defs><clipPath id={`old-${i}`}><rect x={200+i*245-85} y={866} width={170} height={220}/></clipPath></defs>
    <g clipPath={`url(#old-${i})`}><Hero pose={{...basePose,x:200+i*245,y:1130,scale:.8,expr:m}} look={{...LOOKS.nam,skin,hand:skin,forearm:skin,jacket:shirt,extra:'spiky',lineless:false}} shadow={0}/></g>
    <g transform={`translate(${1105+i*245} 870) scale(1.05)`}><StudentHead mood={m} id={`new-${i}`}/></g>
    <g fontFamily="Arial, sans-serif" fontSize={19} textAnchor="middle" fill="#555e56"><text x={200+i*245} y={1115}>{['UỂ OẢI','HOẢNG SỢ','NGHI NGỜ'][i]}</text><text x={1105+i*245} y={1115}>{['UỂ OẢI','HOẢNG SỢ','NGHI NGỜ'][i]}</text></g>
  </g>)}
  <text x={900} y={1170} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={17} fill="#74796f">Ảnh thử thiết kế · Chưa thay rig chung · Chưa kiểm tra chuyển động</text>
</svg>}
