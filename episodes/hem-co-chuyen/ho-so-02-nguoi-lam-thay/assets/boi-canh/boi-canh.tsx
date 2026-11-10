import React, {useId} from 'react';

/** Editable SVG room; all review views share this source. Crop = same camera,
 * NOT a simulated change in lens or a new perspective. No animation/network calls. */
const ink = '#3d4b43';
export function roomColor(hex: string, night: boolean) {
  if (!night) return hex;
  const n=parseInt(hex.slice(1),16), r=n>>16, g=(n>>8)&255, b=n&255;
  return `rgb(${Math.round(r*.26+8)},${Math.round(g*.30+12)},${Math.round(b*.36+20)})`;
}
function Book({x,y,w=22,h=65,color='#74877c',night=false}:{x:number;y:number;w?:number;h?:number;color?:string;night?:boolean}){
 return <g><rect x={x} y={y} width={w} height={h} rx={2} fill={roomColor(color,night)}/><path d={`M${x+4} ${y+8}h${w-8} M${x+4} ${y+h-9}h${w-8}`} stroke={roomColor('#e6ddc9',night)} strokeWidth={2}/></g>;
}
export type RoomProps = {
 className?: string; night?: boolean; viewBox?: string;
 door?: 'open'|'closed'|'latched'; chair?: 'desk'|'door';
 phone?: 'mat'|'desk'|'hidden'; clockMinutes?: number | null; children?: React.ReactNode;
};
export function RoomScene({className='',night=false,viewBox='0 60 1800 1012.5',door='open',chair='desk',phone='mat',clockMinutes=null,children}: RoomProps){
 const uid='room'+useId().replace(/[^a-zA-Z0-9_-]/g,'');
 const c=(hex:string)=>roomColor(hex,night);
 return <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox={viewBox} preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label={night ? 'Phòng Nam ban đêm' : 'Phòng Nam sáng sớm'}>
  <rect width="1800" height="1120" fill={c("#d9d6c4")}/>
  <defs>
    <linearGradient id={`${uid}-back-depth`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={c('#eee5d0')}/><stop offset=".75" stopColor={c('#dedcc6')}/><stop offset="1" stopColor={c('#c6cdb8')}/>
    </linearGradient>
    <linearGradient id={`${uid}-left-depth`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor={c('#b2c4b4')}/><stop offset="1" stopColor={c('#91a99a')}/>
    </linearGradient>
    <linearGradient id={`${uid}-right-depth`} x1="0" y1="0" x2="1" y2=".3">
      <stop offset="0" stopColor={c('#c2bfa8')}/><stop offset="1" stopColor={c('#ded4b9')}/>
    </linearGradient>
    <linearGradient id={`${uid}-floor-depth`} x1="0" y1="0" x2=".15" y2="1">
      <stop offset="0" stopColor={c('#a2b3a0')}/><stop offset=".5" stopColor={c('#c7ceba')}/><stop offset="1" stopColor={c('#abb9a3')}/>
    </linearGradient>
    <linearGradient id={`${uid}-object-shadow`} x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={c('#455f54')} stopOpacity={.30}/><stop offset="1" stopColor={c('#455f54')} stopOpacity={0}/>
    </linearGradient>
    <linearGradient id={`${uid}-mattress-volume`} x1="0" y1="0" x2=".2" y2="1">
      <stop offset="0" stopColor={c('#c9d6c1')}/><stop offset=".6" stopColor={c('#b3c7b6')}/><stop offset="1" stopColor={c('#92ad9d')}/>
    </linearGradient>
    <radialGradient id={`${uid}-wall-light`}>
      <stop offset="0" stopColor="#d5aa69" stopOpacity={.13}/>
      <stop offset="1" stopColor="#d5aa69" stopOpacity={0}/>
    </radialGradient>
    <linearGradient id={`${uid}-lamp`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffe3a6" stopOpacity={.62}/>
      <stop offset="1" stopColor="#e8bb71" stopOpacity={.08}/>
    </linearGradient>
    <clipPath id={`${uid}-room-floor`}><path d="M360 594H1370L1800 1100H0Z"/></clipPath>
    <clipPath id={`${uid}-window-view`}><path d="M1458 239L1664 161V473L1458 518Z"/></clipPath>
  </defs>
  <g data-layer="room-art" stroke={c(ink)} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
    <g id={`${uid}-walls`} data-layer="walls">
      <path d="M60 55L360 165H1370L1740 55V1030H60Z" fill={c("#e2d9c5")} stroke="none"/>
      <path d="M60 55L360 165V594L0 1100Z" fill={`url(#${uid}-left-depth)`}/>
      <path d="M360 165H1370V594H360Z" fill={`url(#${uid}-back-depth)`}/>
      <path d="M1370 165L1740 55L1800 1100L1370 594Z" fill={`url(#${uid}-right-depth)`}/>
      <path d="M60 76L360 187H1370L1740 76" fill="none" stroke={c("#aaa98f")} strokeWidth={8}/>
      <path d="M365 172V593 M1365 172V593" fill="none" stroke={c("#f7eedb")} strokeWidth={5}/>
      <path d="M361 402H1368V594H361Z" fill={c("#c0c9b5")} opacity={.38} stroke="none"/>
      <path d="M361 402H1368" stroke={c("#bdc4b3")} strokeWidth={2}/>
      <path d="M370 590H1365" stroke={c("#a8b19f")} strokeWidth={13}/>
      <path d="M1375 588L1795 1088" stroke={c("#adae9b")} strokeWidth={10}/>
    </g>
    <g id={`${uid}-floor`} data-layer="floor">
      <path d="M360 594H1370L1800 1100H0Z" fill={`url(#${uid}-floor-depth)`}/>
      <g clipPath={`url(#${uid}-room-floor)`} stroke={c("#a9b4a4")} strokeWidth={2}>
        {[320,540,760,980,1200,1420,1640].map((x,i)=><path key={i} d={`M${870+(x-870)*.40} 594L${x} 1100`}/>)}
        {[649,716,800,903].map(y=><path key={y} d={`M0 ${y}H1800`}/>)}
      </g>
      <path d="M361 594H1369L1397 628H336Z" fill={c('#4e6d5c')} opacity={.11} stroke="none"/>
      <g data-layer="cast-shadows" fill={`url(#${uid}-object-shadow)`} stroke="none">
        <path d="M771 589H945L846 693L701 649Z"/>
        <path d="M424 694H738L660 766L385 735Z"/>
        <path d="M1025 735H1358L1284 811L966 791Z"/>
      </g>
      <path d="M360 595H1370" fill="none" stroke={c("#738978")} strokeWidth={4}/>
      {!night && <g>      <path d="M1456 540L1560 656L1050 986L863 838Z" fill={c("#eee4bd")} opacity={.65} stroke="none"/>
      <path d="M1505 608L1515 620L957 925L943 911Z M1565 658L1574 672L1043 981L1025 968Z" fill={c("#b2b3a0")} opacity={.36} stroke="none"/></g>}
    </g>
    <g id={`${uid}-door-and-hall`} data-layer="door-and-hall">
      <path d="M139 291L307 352V689L139 912Z" fill={c("#526b67")} strokeWidth={8}/>
      <path d="M150 309L297 361V684L150 884Z" fill={c("#afc0b1")} stroke="none"/>
      <path d="M150 768L297 632V684L150 884Z" fill={c("#d6dbc5")} stroke="none"/>
      <path d="M150 670L297 574 M150 711L297 616 M177 694V620 M221 665V591 M266 636V561" fill="none" stroke={c("#748e80")} strokeWidth={4}/>
      <g data-layer="door-leaf">
      {door === 'open' ? <>
        <path d="M307 352L359 310V717L307 689Z" fill={c("#819b88")} strokeWidth={4}/>
        <path d="M319 366L347 343V684L319 670Z" fill={c("#90a892")} stroke={c("#647d6b")} strokeWidth={2}/>
        <path d="M340 518L354 510" stroke={c("#d6c5a0")} strokeWidth={5}/>
      </> : <>
        <path d="M147 306L302 359V686L147 895Z" fill={c("#819b88")} strokeWidth={4}/>
        <path d="M162 333L287 376V674L162 857Z" fill={c("#90a892")} stroke={c("#647d6b")} strokeWidth={2}/>
        <path d="M164 570L183 565" stroke={c("#d6c5a0")} strokeWidth={5}/>
        <path d="M147 543L179 533" stroke={c("#536b64")} strokeWidth={10}/>
        <path d={door === 'latched' ? 'M139 546L169 536' : 'M159 540L184 532'} stroke={c("#d0d4c5")} strokeWidth={5}/>
      </>}
      </g>
      <path d="M139 912L307 689L322 700L154 932Z" fill={c("#9aab98")}/>

      <path d="M104 376L121 366V414L104 427Z" fill={c("#f3efdc")} strokeWidth={2}/>
      <path d="M110 387L115 384V402L110 406Z" fill={c("#949e8d")} stroke="none"/>
      <path d="M205 289L205 252L258 220" fill="none" stroke={c("#9a9f8e")} strokeWidth={4}/>
    </g>
    <g id={`${uid}-window`} data-layer="window">
      <path d="M1426 219L1695 117V509L1426 563Z" fill={c('#606f61')} strokeWidth={4}/>
      <path d="M1426 219L1438 224V549L1426 563Z" fill={c('#9fa78d')} strokeWidth={2}/>
      <path d="M1426 563L1438 549L1684 493L1700 504L1451 572Z" fill={c('#d9d2b5')} strokeWidth={2}/>
      <path d="M1438 224L1684 130V493L1438 549Z" fill={c("#839382")} strokeWidth={5}/>
      <path d="M1458 239L1664 161V473L1458 518Z" fill={c("#bad8d2")}/>
      <g clipPath={`url(#${uid}-window-view)`} stroke="none">
        <path d="M1451 391L1538 357L1538 299L1625 273L1680 294V500L1448 534Z" fill={c("#a9b8a7")}/>
        <path d="M1467 335L1546 315V505L1467 525Z" fill={c("#c2c3a6")}/>
        <path d="M1536 302L1615 279V492L1536 512Z" fill={c("#d8cdb0")}/>
        <path d="M1526 301L1574 264L1629 280L1627 291Z" fill={c("#a48670")}/>
        <path d="M1450 354L1500 322L1551 331L1551 343Z" fill={c("#7c9381")}/>
        <path d="M1573 334L1595 328V367L1573 373Z" fill={c("#8b9a89")}/>
        <path d="M1450 420Q1502 361 1544 405Q1590 375 1627 414L1680 404V535H1440Z" fill={c("#779a7a")}/>
        <path d="M1490 451Q1510 415 1542 435 M1567 449Q1589 409 1621 429" fill="none" stroke={c("#97b58d")} strokeWidth={8}/>
      </g>
      <path d="M1560 201V496 M1459 380L1663 315" fill="none" stroke={c("#718675")} strokeWidth={7}/>
      <path d="M1491 226V510 M1620 177V483" fill="none" stroke={c("#506a61")} strokeWidth={4}/>
      <path d="M1436 220L1693 121" stroke={c("#6f8070")} strokeWidth={8}/>
      <path d="M1442 216Q1430 261 1448 302L1441 493Q1421 491 1399 503L1405 231Z" fill={c("#e9e0bc")} strokeWidth={2}/>
      <path d="M1460 216Q1464 254 1455 289 M1428 310L1421 462" fill="none" stroke={c("#c1bc9e")} strokeWidth={2}/>
      <path d="M1646 157Q1629 234 1644 291L1661 466L1687 482L1681 143Z" fill={c("#e9e0bc")} strokeWidth={2}/>
      <path d="M1660 164Q1652 224 1663 291L1673 443" fill="none" stroke={c("#c1bc9e")} strokeWidth={2}/>
    </g>
    {night && <ellipse cx={1250} cy={518} rx={210} ry={150} fill={`url(#${uid}-wall-light)`} stroke="none"/>}
    <g id={`${uid}-back-wall-details`} data-layer="back-wall-details">
      <path d="M387 250H448" stroke={c("#a89c82")} strokeWidth={7}/>
      <rect x={1100} y={229} width={116} height={83} rx={4} fill={c("#e1d3b8")} stroke={c("#aaa58d")} strokeWidth={2}/>
      <path d="M1113 247H1200 M1113 266H1164 M1113 284H1185" stroke={c("#a9ad93")} strokeWidth={3}/>
      <rect x={1138} y={297} width={62} height={46} rx={2} fill={c("#e7c47a")} stroke="none" transform="rotate(5 1169 320)"/>
      <path d="M1151 312L1187 314 M1151 323L1177 325" stroke={c("#998c68")} strokeWidth={2}/>
      {clockMinutes !== null && <g data-layer="clock"><circle cx={1291} cy={257} r={39} fill={c("#f4eddc")} stroke={c("#667d6d")} strokeWidth={6}/>
      <path d="M1291 230V235 M1318 257H1313 M1291 284V279 M1264 257H1269" stroke={c("#728475")} strokeWidth={2}/>
      {clockMinutes !== null && <g data-prop="clock-hands" transform="translate(1291 257)">
        <path d="M0 0V-17" transform={`rotate(${(clockMinutes % 720) * .5})`} strokeWidth={3}/>
        <path d="M0 0V-26" transform={`rotate(${(clockMinutes % 60) * 6})`} strokeWidth={2}/>
      </g>}
      </g>}<path d="M385 325L394 342L388 361 M1341 487L1334 505L1341 523" stroke={c("#bdbaa6")} strokeWidth={2} fill="none"/>
      <path d="M957 181V213L1026 228V261" fill="none" stroke={c("#a0a68e")} strokeWidth={3}/>
    </g>
    <g id={`${uid}-wardrobe-and-tung-bedding`} data-layer="wardrobe-and-tung-bedding">
      <ellipse cx={842} cy={623} rx={113} ry={19} fill={c("#7e9280")} opacity={.2} stroke="none"/>
      <path d="M944 254L963 272V611L944 600Z" fill={c('#6c7966')} strokeWidth={2}/>
      <path d="M771 254H944V600H771Z" fill={c("#9b8f75")} strokeWidth={4}/>
      <path d="M775 258H940" fill="none" stroke={c('#c0b492')} strokeWidth={3}/>
      <path d="M787 270H928V582H787Z" fill={c("#6d786a")}/>
      <path d="M789 391H926 M789 478H926" stroke={c("#b3a68a")} strokeWidth={9}/>
      <path d="M799 299H918" stroke={c("#c1b494")} strokeWidth={5}/>
      <path d="M824 302L800 323L814 340L820 334V377H864V334L872 340L886 324L862 303L844 314Z" fill={c("#c4b88f")} strokeWidth={2}/>
      <path d="M872 310L855 330L865 344L873 339V382H907V336L916 341L923 328L904 311L891 322Z" fill={c("#7d9992")} strokeWidth={2}/>
      <rect x={793} y={406} width={129} height={25} rx={7} fill={c("#a5b7ad")}/>
      <rect x={795} y={432} width={127} height={24} rx={5} fill={c("#e3dbc0")} strokeWidth={2}/>
      <path d="M793 493Q854 473 922 493V567Q854 582 793 565Z" fill={c("#728f88")}/>
      <path d="M807 502Q852 492 911 501 M808 516Q850 506 910 514" fill="none" stroke={c("#a6b8a8")} strokeWidth={4}/>
      <path d="M813 224H901V252H813Z" fill={c("#bdab83")}/>
      <path d="M822 235H892" stroke={c("#9a896b")} strokeWidth={2}/>
      <path d="M951 275V579" stroke={c("#af9f7e")} strokeWidth={5}/>
    </g>
    <g id={`${uid}-kitchen-backsplash`} data-layer="kitchen-backsplash" strokeWidth={1.4} stroke={c("#c2c6b1")}>
      <rect x={404} y={408} width={319} height={189} rx={4} fill={c("#e0dfc9")}/>
      {[452,496,540].map(y=><path key={y} d={`M406 ${y}H721`}/>)}
      {[450,496,542,588,634,680].map(x=><path key={x} d={`M${x} 410V591`}/>)}
    </g>
    <g data-layer="student-belongings" strokeWidth={2}>
      <path d="M966 304V432" stroke={c('#9d947b')} strokeWidth={6}/>
      <path d="M965 320Q972 321 975 315 M965 383Q973 383 975 377" fill="none" stroke={c('#526d61')} strokeWidth={3}/>
      <path d="M972 327Q972 308 993 308Q1013 310 1016 329Q996 343 975 338Z" fill={c('#5c716b')}/>
      <path d="M975 331Q992 324 1012 331 M979 341Q993 355 1003 337" fill="none" stroke={c('#a4b5a5')} strokeWidth={2}/>
      <path d="M977 390Q978 374 988 379L995 387" fill="none" stroke={c('#536f63')} strokeWidth={4}/>
      <path d="M975 390Q993 380 1004 394L1009 446Q990 457 972 447Z" fill={c('#788c7c')}/>
      <path d="M976 421Q992 414 1003 422L1003 440L978 441Z" fill={c('#99ac95')}/>
      <path d="M980 426H999" stroke={c('#516d60')}/>
    </g>
    <g id={`${uid}-sink-corner`} data-layer="sink-corner">
      <ellipse cx={568} cy={718} rx={172} ry={20} fill={c("#798d7a")} opacity={.2} stroke="none"/>
      <path d="M409 562H682L739 610H423Z" fill={c("#d8d9c8")}/>
      <path d="M423 610H739V699H423Z" fill={c("#9cae9b")}/>
      <path d="M682 562L739 610V699L682 658Z" fill={c("#8c9c8b")}/>
      <path d="M425 613H736" stroke={c('#d7dfc7')} strokeWidth={3}/>
      <path d="M432 616H571V684H432Z M582 616H725V684H582Z" fill={c("#aebca5")} stroke={c("#7a917f")} strokeWidth={2}/>
      <path d="M551 642V660 M600 642V660" stroke={c("#5e7567")} strokeWidth={4}/>
      <path d="M455 571H588L618 601H471Z" fill={c("#80988e")} strokeWidth={3}/>
      <path d="M469 577H581L602 595H481Z" fill={c("#b4c6bd")} strokeWidth={2}/>
      <path d="M529 574L544 598" stroke={c('#80988e')} strokeWidth={5}/>
      <ellipse cx={505} cy={587} rx={5} ry={2} fill={c('#5a7b73')} stroke="none"/>
      <ellipse cx={566} cy={587} rx={5} ry={2} fill={c('#5a7b73')} stroke="none"/>
      <path d="M510 568V526Q510 509 527 509Q545 509 545 525V532" fill="none" stroke={c("#596f67")} strokeWidth={11}/>
      <path d="M510 566V529Q510 513 527 513Q541 513 541 527V532" fill="none" stroke={c("#b9c7bc")} strokeWidth={5}/>
      <path d="M495 550H510" stroke={c("#536f65")} strokeWidth={5}/>
      <path d="M620 578Q645 585 672 576V586Q645 597 620 586Z" fill={c("#e6ddc5")} strokeWidth={2}/>
      <ellipse cx={646} cy={575} rx={27} ry={7} fill={c("#efe8d5")} strokeWidth={2}/>
      <path d="M650 552Q652 576 677 575Q697 572 701 549Z" fill={c("#d9c6a3")} strokeWidth={2}/>
      <ellipse cx={675} cy={550} rx={26} ry={7} fill={c("#e7dcc3")} strokeWidth={2}/>
      <path d="M677 546L692 520 M684 549L702 524" stroke={c("#9c7856")} strokeWidth={3}/>
      <rect x={590} y={544} width={15} height={24} rx={3} fill={c("#99b99a")} strokeWidth={2}/>
      <path d="M593 541H608" stroke={c("#d0d7bd")} strokeWidth={4}/>
      <path d="M420 459H690L708 472H420Z" fill={c("#9f9d81")} strokeWidth={2}/>
      <path d="M440 459V431Q458 419 478 432V459Z" fill={c("#c4b17f")} strokeWidth={2}/>
      <path d="M487 459V435H506V459 M520 459V432H540V459" fill={c("#f3e7cc")} strokeWidth={2}/>
      <path d="M570 440H661 M570 446H661 M570 452H661" stroke={c("#dcdbc2")} strokeWidth={4}/>
      <path d="M440 480V515 M453 480V509" stroke={c("#d5c091")} strokeWidth={7}/>
      <path d="M703 621Q709 638 711 657H684L678 615Z" fill={c("#8fa99f")} strokeWidth={2}/>
      <path d="M686 620L693 650" stroke={c("#b8c7b5")} strokeWidth={2}/>
      <path d="M379 607L373 692L398 707L403 627" fill={c("#b7b8a0")} strokeWidth={2}/>
      <path d="M389 569V650" stroke={c("#907b58")} strokeWidth={5}/>
      <path d="M379 646L393 648L406 696L365 696Z" fill={c("#bb9b62")} strokeWidth={2}/>
    </g>
    <g data-layer="kitchen-floor-supplies" strokeWidth={2}>
      <ellipse cx={753} cy={712} rx={30} ry={9} fill={c('#829685')} opacity={.22} stroke="none"/>
      <path d="M735 625Q730 635 730 649V700Q752 714 777 699V649Q777 635 767 628V614H740V625Z" fill={c('#7da9a6')}/>
      <path d="M734 657Q753 664 774 657 M734 674Q754 682 774 674 M736 692Q753 699 773 692" stroke={c('#a8c4bb')} strokeWidth={3} fill="none"/>
      <rect x={739} y={610} width={30} height={8} rx={3} fill={c('#587f78')}/>
      <path d="M646 690H699L713 709V735H656L646 714Z" fill={c('#b89673')}/>
      <path d="M646 690L656 711H713 M656 711V735" fill="none" stroke={c('#8f7d61')}/>
      <path d="M669 718H696 M673 725H691" stroke={c('#e1ca9f')} strokeWidth={2}/>
    </g>
    <g id={`${uid}-study-desk`} data-layer="study-desk">
      <ellipse cx={1203} cy={749} rx={186} ry={23} fill={c("#778d7d")} opacity={.23} stroke="none"/>
      <path d="M1030 620L1025 744Q1034 748 1044 744L1052 625Z" fill={c("#83755d")}/>
      <path d="M1247 627H1341V743Q1300 753 1250 745Z" fill={c("#9b896a")}/>
      <rect x={1258} y={646} width={72} height={43} rx={6} fill={c("#b09a76")} strokeWidth={2}/>
      <rect x={1258} y={698} width={72} height={36} rx={5} fill={c("#b09a76")} strokeWidth={2}/>
      <path d="M1286 662H1306 M1286 713H1306" stroke={c("#715e45")} strokeWidth={4}/>
      <path d="M1007 579Q1005 575 1015 575H1273Q1278 575 1285 580L1371 628Q1380 637 1369 644H1059Q1051 644 1047 640Z" fill={c("#c6ac7e")} strokeWidth={3.5}/>
      <path d="M1054 638H1373V649H1058Z" fill={c("#a18a65")} strokeWidth={2}/>
      <path d="M1048 594L1075 606 M1293 594L1342 624" stroke={c("#b79d71")} strokeWidth={1.5}/>
      <g data-prop="bookshelf">
        <rect x={1019} y={484} width={94} height={89} rx={4} fill={c("#887b61")}/>
        <rect x={1027} y={492} width={78} height={71} rx={2} fill={c("#58665a")} stroke="none"/>
        <Book night={night} x={1030} y={503} w={17} h={60} color="#7b9991"/>
        <Book night={night} x={1050} y={512} w={14} h={51} color="#bca175"/>
        <Book night={night} x={1067} y={499} w={19} h={64} color="#a47b69"/>
        <path d="M1091 563L1086 520L1097 519L1101 563" fill={c("#c7bf9c")} strokeWidth={1.5}/>
      </g>
      <g data-prop="laptop">
        <path d="M1130 581L1234 580L1233 494Q1181 488 1131 491Z" fill={c("#3f504d")} strokeWidth={3}/>
        <path d="M1140 502L1225 504V568H1140Z" fill={night ? '#b4d6cf' : '#d5e1d4'} stroke="none"/>
        <g stroke={night ? '#628e90' : '#8da99a'} strokeWidth={2}>
          <path d="M1148 514H1216 M1148 526H1198 M1148 537H1209 M1148 548H1189"/>
        </g>
        <path d="M1130 581H1234L1271 611Q1216 616 1156 611Z" fill={c("#8b9c91")} strokeWidth={2}/>
        <path d="M1143 588H1224L1236 599H1155Z M1180 606H1210" fill={c("#60776d")} strokeWidth={1.5}/>
      </g>
      <path d="M1238 608Q1244 660 1222 683L1208 712" fill="none" stroke={c("#62746b")} strokeWidth={2.5}/>
      <path d="M1191 702L1221 702L1235 716L1203 720Z" fill={c("#ebe4ce")} strokeWidth={2}/>
      <path d="M1207 710H1215 M1220 711H1226" stroke={c("#8c9788")} strokeWidth={2}/>
      <path d="M1080 590Q1097 581 1117 592L1145 617Q1117 610 1101 616Z" fill={c("#ece1c7")} strokeWidth={2}/>
      <path d="M1095 593L1125 611 M1102 592L1133 611" stroke={c("#b1b49d")} strokeWidth={1.5}/>
      <g data-prop="red-lamp">
        <ellipse cx={1310} cy={604} rx={20} ry={6} fill={c("#a86f59")} strokeWidth={2}/>
        <path d="M1311 600Q1346 539 1294 516" stroke={c("#566d64")} strokeWidth={5} fill="none"/>
        <path d="M1287 505Q1294 501 1304 514L1293 533Q1275 532 1265 524Z" fill={night ? "#855645" : "#b77761"} strokeWidth={2}/>
        <path d="M1265 524Q1278 520 1293 533" fill="none" stroke={c("#e0ba86")} strokeWidth={3}/>
      </g>
      {night && <g data-layer="practical-light" stroke="none">
        <path d="M1268 527L1291 532L1329 623Q1251 642 1197 620Z" fill={`url(#${uid}-lamp)`}/>
        <ellipse cx={1263} cy={621} rx={61} ry={10} fill="#e9c389" opacity={.20}/>
      </g>}
      <g data-prop="mug">
        <path d="M1287 580Q1300 576 1311 580V600Q1299 609 1287 600Z" fill={night ? "#ab9874" : "#cbb990"} strokeWidth={2}/>
        <path d="M1311 583Q1327 579 1323 592Q1319 600 1311 596" fill="none" strokeWidth={2.5}/>
        <ellipse cx={1299} cy={580} rx={12} ry={3.5} fill={c("#7d765b")} strokeWidth={1.5}/>
      </g>
      {phone === 'desk' && <path data-prop="phone" d="M1240 619L1262 616L1278 629L1256 634Z" fill={c("#344d49")} strokeWidth={2}/>}
    </g>
    <g id={`${uid}-work-chair`} data-layer="work-chair" transform={chair === 'door' ? 'translate(-760 65)' : undefined}>
      <ellipse cx={1135} cy={779} rx={66} ry={12} fill={c("#708677")} opacity={.24} stroke="none"/>
      <path d="M1093 689L1081 773 M1159 681L1179 775 M1136 713L1134 785 M1191 705L1202 767" stroke={c("#536b63")} strokeWidth={8} fill="none"/>
      <path d="M1086 681Q1121 669 1159 672L1193 699Q1199 709 1187 715L1127 723Q1117 724 1110 718L1086 695Q1079 688 1086 681Z" fill={c("#8a9e86")} strokeWidth={3}/>
      <path d="M1091 681L1091 596 M1157 674L1156 592" stroke={c("#637c6b")} strokeWidth={7}/>
      <path d="M1086 599Q1121 584 1162 595L1160 642Q1125 655 1089 646Z" fill={c("#99ad94")} strokeWidth={3}/>
      <path d="M1099 608Q1127 599 1149 605" fill="none" stroke={c("#b7c5aa")} strokeWidth={2}/>
    </g>
    <g id={`${uid}-sleeping-mat`} data-layer="sleeping-mat" data-design-size="160x200cm" transform="matrix(.85 0 0 .85 223 180)">
      {/* Double floor mattress: two adult sleeping places. No second mattress elsewhere. */}
      <path d="M1083 768L1401 676L1725 935L1312 1031Z" fill={c('#6e8275')} opacity={.25} stroke="none"/>
      <path d="M1090 751Q1081 754 1088 769L1300 1016Q1310 1028 1325 1024L1710 936Q1721 934 1716 917L1410 670Q1401 663 1390 667Z" fill={c('#879d90')} strokeWidth={3.5}/>
      <path d="M1095 748L1392 660Q1402 658 1412 668L1710 910Q1722 920 1708 925L1327 1011Q1314 1016 1304 1004L1089 767Q1080 754 1095 748Z" fill={`url(#${uid}-mattress-volume)`} strokeWidth={3}/>
      <path d="M1102 764L1319 1000L1701 914" fill="none" stroke={c('#d0d8c4')} strokeWidth={2}/>
      <path d="M1134 807L1450 715 M1178 859L1507 763 M1224 911L1570 814 M1275 967L1639 870" stroke={c('#a2b7a8')} strokeWidth={1.5} fill="none"/>
      {/* Two separate pillows read as two places, not two sleeping children. */}
      <path d="M1129 758Q1123 749 1139 743L1238 714Q1250 711 1261 722L1310 761Q1318 771 1304 775L1199 808Q1186 812 1176 802Z" fill={c('#ece1c3')} strokeWidth={2.5}/>
      <path d="M1144 753Q1178 752 1194 773 M1200 798Q1246 780 1292 773" stroke={c('#c4bea2')} strokeWidth={2} fill="none"/>
      <path d="M1273 717Q1267 705 1283 701L1377 679Q1389 676 1398 685L1443 723Q1455 734 1440 740L1340 769Q1327 772 1317 762Z" fill={c('#d5dbc3')} strokeWidth={2.5}/>
      <path d="M1290 715Q1318 709 1332 728 M1340 757Q1384 742 1425 736" stroke={c('#b2bea8')} strokeWidth={2} fill="none"/>
      {/* Nam's rumpled blanket and Tùng's folded blanket retain distinct silhouettes. */}
      <path d="M1197 861Q1195 836 1228 838L1267 822Q1297 791 1324 817L1377 828Q1410 822 1427 847L1471 869Q1501 882 1481 905L1522 957L1345 998Q1325 1000 1313 983L1294 951Q1254 950 1267 924L1222 909Q1195 909 1210 885Z" fill={c('#738f88')} strokeWidth={3}/>
      <path d="M1228 851Q1258 879 1290 860 M1314 830Q1303 857 1349 877 M1303 921Q1337 911 1366 938 M1395 864Q1407 892 1453 887 M1360 978L1469 953" fill="none" stroke={c('#526f67')} strokeWidth={2.5}/>
      <path d="M1410 793Q1407 786 1418 784L1504 760Q1512 758 1521 765L1613 842Q1620 852 1607 857L1515 884Q1505 889 1499 879Z" fill={c('#a1b1a0')} strokeWidth={2.5}/>
      <path d="M1418 801L1510 875L1608 849 M1430 798L1516 868" fill="none" stroke={c('#c1ccaf')} strokeWidth={3}/>
      {phone === 'mat' && <g data-prop="phone-off"><path d="M1178 820L1210 810L1230 831L1197 842Z" fill={c('#344d49')} strokeWidth={2}/>
      <path d="M1184 822L1208 815L1223 829L1199 836Z" fill={c('#253d39')} stroke="none"/></g>}
    </g>
    <g id={`${uid}-everyday-floor-props`} data-layer="everyday-floor-props" transform="translate(50 30)">
      <path d="M930 817Q938 796 955 808L975 816L987 844L975 852L964 840L974 871L935 874L930 848L922 857L908 842Z" fill={c("#9d9b88")} strokeWidth={3}/>
      <path d="M943 823L959 848 M938 859L963 862" stroke={c("#7d8476")} fill="none" strokeWidth={2}/>
      <path d="M816 931Q824 909 854 914L874 935Q862 957 826 951Z" fill={c("#c2b186")} strokeWidth={3}/>
      <path d="M826 929Q849 918 866 932L861 942Q848 930 826 941Z" fill={c("#728f80")} strokeWidth={2}/>
      <path d="M870 940Q890 926 912 935L935 955Q917 975 884 967Z" fill={c("#c2b186")} strokeWidth={3}/>
      <path d="M881 941Q901 936 923 950L920 960Q904 950 885 955Z" fill={c("#728f80")} strokeWidth={2}/>
      <path d="M991 655Q1015 651 1025 666L1019 698Q1002 705 989 693Z" fill={c("#a59e7f")} strokeWidth={2}/>
      <path d="M997 665L1002 690 M1008 664L1010 692 M1019 667L1017 689" stroke={c("#797e66")} strokeWidth={2}/>
      <path d="M994 655L1003 646L1013 653L1020 648L1024 658" fill={c("#e5dfc7")} strokeWidth={2}/>
      <g transform="translate(-340 80)"><path d="M1248 663Q1258 658 1266 666L1261 688Q1251 691 1247 683Z" fill={c("#a8bab0")} strokeWidth={2}/>
      <path d="M1252 660V651H1263V663" fill={c("#b6c9bb")} strokeWidth={2}/></g>
    </g>
    <g id={`${uid}-floor-fan`} data-layer="floor-fan">
      <rect x={385} y={537} width={17} height={25} rx={3} fill={c("#e3dfca")} strokeWidth={2}/>
      <ellipse cx={459} cy={826} rx={65} ry={15} fill={c("#7d917e")} opacity={.23} stroke="none"/>
      <ellipse cx={459} cy={812} rx={48} ry={12} fill={c("#647f72")}/>
      <path d="M451 808V754H468V808" fill={c("#8ba394")} strokeWidth={3}/>
      <circle cx={459} cy={711} r={57} fill={c("#cad6c7")} stroke={c("#688477")} strokeWidth={6}/>
      <g fill={c("#8ea99a")} stroke={c("#6f8d7d")} strokeWidth={2}>
        <path d="M458 708Q422 690 438 669Q459 654 461 698Z"/>
        <path d="M463 711Q484 673 506 695Q517 716 473 718Z"/>
        <path d="M457 716Q476 751 446 753Q422 746 450 719Z"/>
      </g>
      <g fill="none" stroke={c("#97ac9a")} strokeWidth={1.6}><circle cx={459} cy={711} r={45}/><circle cx={459} cy={711} r={32}/><path d="M405 711H513 M459 657V765 M421 673L497 749 M421 749L497 673"/></g>
      <circle cx={459} cy={711} r={10} fill={c("#5e7d6c")} strokeWidth={2}/>
      <path d="M414 812Q391 829 371 813L374 565L393 551" fill="none" stroke={c("#6e806f")} strokeWidth={2}/>
    </g>
  </g>
  {!night &&   <g fill={c("#f6eed6")} opacity={.8}>{[[1410,608],[1442,646],[1355,658],[1370,701],[1300,735],[1282,746]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%2?2:3}/>)}</g>}
{children}</svg>;}

export const RoomMorning = (p:RoomProps) => <RoomScene {...p}/>;
export const KitchenSink = (p:RoomProps) => <RoomScene {...p} viewBox="325 265 650 365.625"/>;
export const StudyCornerMorning = (p:RoomProps) => <RoomScene {...p} viewBox="715 260 1040 585"/>;
/** Legacy filename/export referred to a desk view, not an exterior hallway. */
export const HallwayDoor = StudyCornerMorning;
export const StudyDeskNight = (p:RoomProps) => <RoomScene door="closed" phone="desk" {...p} night viewBox="715 260 1040 585"/>;
export function HoSo02EnvironmentMasterBoard(){return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}><RoomMorning/><KitchenSink/><StudyCornerMorning/><StudyDeskNight/></div>;}
