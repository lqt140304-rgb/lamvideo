import React, {useId} from 'react';
import {motherDissolveAt,MotherDissolveAir} from './mother_dissolve';
import { clamp, lerp } from '../../engine/anim';
import { LOOKS, sitPose, joints, type Pose, type Limb, type Expr } from '../../engine/rig';
import { Hero } from './actor';
import { mouthCueAt } from '../../engine/mouth';

type Point = {x:number;y:number};
const degrees = (a:number) => a*180/Math.PI;

/** Two-bone reach in the mother's local space; same 52/46 anchors as the shared rig. */
const wrapArm = (pose:Pose, side:'L'|'R', target:Point,reverse=false):Limb => {
  const root = joints({...pose,tilt:0})[side==='L'?'armL':'armR'].root;
  const a0=-pose.tilt*Math.PI/180,tx=(target.x-pose.x)/pose.scale,ty=(target.y-pose.y)/pose.scale;
  const x=tx*Math.cos(a0)-ty*Math.sin(a0)-root.x,y=tx*Math.sin(a0)+ty*Math.cos(a0)-root.y;
  const distance=clamp(Math.hypot(x,y),6.001,97.999);
  const bend=Math.acos(clamp((distance*distance-52*52-46*46)/(2*52*46),-1,1));
  const sign=side==='L'?-1:1;
  const b=(reverse?1:-1)*sign*bend;
  const a=Math.atan2(x,y)-Math.atan2(46*Math.sin(b),52+46*Math.cos(b));
  return {a:degrees(a)/sign,b:degrees(b)/sign};
};

const shoulder = (pose:Pose, side:'L'|'R'):Point => {
  const root=joints(pose)[side==='L'?'armL':'armR'].root;
  return {x:pose.x+root.x*pose.scale,y:pose.y+root.y*pose.scale};
};

/** Three-quarter seated thighs extend over the ledge; the visible knee bend leads to vertical calves. */
const bankSit = (x:number,s:number,t:number,seed:number,lean:number):Pose => sitPose(x,802,s,lean>0?1:-1,{
  t,seed,yaw:lean>0?.08:-.08,lean:Math.abs(lean),headTilt:lean*.55,look:lean>0?.2:-.2,
  thighDepth:.9,footFacing:1,
  legL:{a:lean>0?65:-65,b:lean>0?-65:65},legR:{a:lean>0?60:-60,b:lean>0?-60:60},
  armL:{a:12,b:-50},armR:{a:12,b:-50},handL:'rest',handR:'rest',
});

const smooth=(v:number)=>{const p=clamp(v);return p*p*(3-2*p);};
const blendArm=(a:Limb,b:Limb,p:number):Limb=>({a:lerp(a.a,b.a,p),b:lerp(a.b,b.b,p)});
export const palmWorld=(pose:Pose,side:'L'|'R'):Point=>{
  const arm=joints(pose)[side==='L'?'armL':'armR'],len=Math.hypot(arm.end.x-arm.mid.x,arm.end.y-arm.mid.y);
  return {x:pose.x+(arm.end.x+(arm.end.x-arm.mid.x)/len*10)*pose.scale,y:pose.y+(arm.end.y+(arm.end.y-arm.mid.y)/len*10)*pose.scale};
};
export const reachPalm=(pose:Pose,side:'L'|'R',target:Point,reverse=false):Limb=>{
  let wrist={...target},limb=pose[side==='L'?'armL':'armR'];
  for(let i=0;i<10;i++){
    limb=wrapArm(pose,side,wrist,reverse);
    const arm=joints({...pose,[side==='L'?'armL':'armR']:limb})[side==='L'?'armL':'armR'];
    const len=Math.hypot(arm.end.x-arm.mid.x,arm.end.y-arm.mid.y);
    wrist={x:target.x-(arm.end.x-arm.mid.x)/len*10*pose.scale,y:target.y-(arm.end.y-arm.mid.y)/len*10*pose.scale};
  }
  return limb;
};

export const meadowFamilyPoses = (t:number, grieving=false, support=1,farewellT?:number) => {
  const thao={...bankSit(1080,.72,t,3,-2-12*clamp(support)),expr:(grieving?'cry':'relieved') as Expr};
  const duy={...bankSit(850,.84,t,1,2+8*clamp(support)),expr:(grieving?'sad':'relieved') as Expr};
  // A small fixed lean keeps the shoulder contacts stable while the eyes/cloth breathe.
  const mother={...bankSit(960,1.02,t,9,0),yaw:0,facing:1 as const,legL:{a:65,b:-65},legR:{a:60,b:-60},tilt:0,headTilt:-2,shoulderLift:0,expr:'smile' as Expr};
  // The inside arms stay in view: each hand curls round the mother's waist at her side.
  const hugs={duy:{x:925,y:750},thao:{x:997,y:756}};
  duy.armR=blendArm(duy.armR,reachPalm(duy,'R',hugs.duy),clamp(support));
  thao.armL=blendArm(thao.armL,reachPalm(thao,'L',hugs.thao),clamp(support));
  // The outside arms stand clear of the body (they draw behind the torso), palm on the stone beside the hip (short cartoon arms: elbows never jut out).
  const duyOut=shoulder(duy,'L'),thaoOut=shoulder(thao,'R');
  duy.armL=reachPalm(duy,'L',{x:duyOut.x-26,y:796});
  thao.armR=reachPalm(thao,'R',{x:thaoOut.x+24,y:796});
  let grip:Point|null=null,cheek:Point|null=null;
  if(farewellT!==undefined&&farewellT>=120){
    const q=farewellT,move=smooth((q-126)/38);
    duy.x=lerp(850,970,move);duy.y=802-Math.sin(move*Math.PI)*6;
    duy.tilt=lerp(2,0,move);duy.yaw=lerp(.08,.22,move);duy.headTilt=lerp(1,4,move);
    duy.legL={a:65-Math.sin(move*Math.PI)*10,b:-65+Math.sin(move*Math.PI)*5};
    duy.legR={a:60-Math.sin(move*Math.PI)*8,b:-60+Math.sin(move*Math.PI)*4};
    const head=joints(thao).head,stroke=smooth((q-183)/22);
    cheek={x:thao.x+(head.x-30)*thao.scale-5*stroke,y:thao.y+(head.y+11)*thao.scale+6*stroke};
    const wipe=smooth((q-164)/19)*(1-smooth((q-211)/22));
    duy.armR=blendArm(duy.armR,reachPalm(duy,'R',cheek),wipe);
    if(q>183&&q<211)thao.blink=Math.max(thao.blink,.65*Math.sin(Math.PI*clamp((q-183)/28)));
    if(q>=211)thao.expr='worried';
    if(q>=220)duy.expr='tearsHeldBack';
    const hold=smooth((q-233)/29);
    if(hold>0){
      thao.x=lerp(thao.x,1076,hold); // she shuffles in beside him: close enough to lean on, hands meeting low in their laps
      grip={x:(duy.x+thao.x)/2+12,y:795};
      duy.armR=blendArm(duy.armR,reachPalm(duy,'R',{x:grip.x-2,y:grip.y-1}),hold);
      thao.armL=blendArm(thao.armL,reachPalm(thao,'L',{x:grip.x+2,y:grip.y+1}),hold);
      if(hold>=1){duy.handR='none';thao.handL='none';}
      else grip=null;
    }
  }
  const left=shoulder(duy,'L'),right=shoulder(thao,'R');
  const contacts={L:{x:left.x+1,y:left.y+2},R:{x:right.x-1,y:right.y+2}};
  const targets={L:{...contacts.L},R:{...contacts.R}};
  for(const side of ['L','R'] as const){
    let wrist={...contacts[side]};
    // Position the palm centre on the shoulder, rather than aiming the wrist at it.
    for(let i=0;i<8;i++){
      const limb=wrapArm(mother,side,wrist);
      const test={...mother,[side==='L'?'armL':'armR']:limb};
      const arm=joints(test)[side==='L'?'armL':'armR'];
      const len=Math.hypot(arm.end.x-arm.mid.x,arm.end.y-arm.mid.y);
      wrist={x:contacts[side].x-(arm.end.x-arm.mid.x)/len*10*mother.scale,y:contacts[side].y-(arm.end.y-arm.mid.y)/len*10*mother.scale};
    }
    targets[side]=wrist;
    if(side==='L')mother.armL=wrapArm(mother,side,wrist);
    else mother.armR=wrapArm(mother,side,wrist);
  }
  return {mother,thao,duy,targets,contacts,hugs,grip,cheek};
};

/** Arms behind the children, palms on their upper arms, and no floor shadows beneath dangling feet. */
export const MeadowFamily:React.FC<{t:number;motherOpacity?:number;dissolveT?:number;grieving?:boolean;demoTalk?:boolean}> =
  ({t,motherOpacity=1,dissolveT,grieving=false,demoTalk=false}) => {
    const id=`mother-${useId().replace(/[^a-zA-Z0-9]/g,'')}`;
    const dissolve=dissolveT===undefined?null:motherDissolveAt(dissolveT);
    const opacity=clamp(motherOpacity)*(dissolve?.opacity??1);
    const {mother,thao,duy,grip}=meadowFamilyPoses(t,grieving,opacity,dissolveT);
    const filter=dissolve?`url(#${id}-soft)`:undefined;
    const p=t%360;
    const mom={...mother,...(demoTalk?mouthCueAt(p,[{from:55,to:72,shape:'a',open:.3},{from:78,to:92,shape:'e',open:.25},{from:105,to:121,shape:'o',open:.25}]):{})};
    return <g data-meadow-family="embrace">
      {dissolve?<defs><filter id={`${id}-soft`} x="-12%" y="-12%" width="124%" height="124%"><feGaussianBlur stdDeviation={dissolve.softness} /></filter></defs>:null}
      {[thao,duy].map((a,i)=><ellipse key={i} cx={a.x} cy="802" rx={31*a.scale} ry="3.5" fill="#3d3a26" opacity="0.22" />)}
      <ellipse cx={mom.x} cy="802" rx="39" ry="3.5" fill="#3d3a26" opacity={opacity*.22} />
      <g filter={filter}><Hero pose={mom} look={LOOKS.meDuyThao} opacity={opacity} shadow={0} rimId="rimStreetlamp" handLayer="defer" /></g>
      {dissolveT!==undefined?<MotherDissolveAir t={dissolveT} pose={mom} id={id} />:null}
      <Hero pose={thao} look={LOOKS.thao} shadow={0} rimId="rimStreetlamp" handLayer="defer" />
      <Hero pose={duy} look={LOOKS.duy} shadow={0} rimId="rimStreetlamp" handLayer="defer" />
      <Hero pose={thao} look={LOOKS.thao} shadow={0} rimId="rimStreetlamp" handLayer="only" />
      <Hero pose={duy} look={LOOKS.duy} shadow={0} rimId="rimStreetlamp" handLayer="only" />
      {grip?<SiblingClasp duy={duy} thao={thao} grip={grip} />:null}
      <g filter={filter}><Hero pose={mom} look={LOOKS.meDuyThao} opacity={opacity} shadow={0} rimId="rimStreetlamp" handLayer="only" /></g>
    </g>;
  };

/** Hand in hand with straight wrists: each hand continues its own forearm to the meeting point; his fingers close over hers, her thumb over his. */
const SiblingClasp:React.FC<{duy:Pose;thao:Pose;grip:Point}>=({duy,thao,grip:c})=>{
  const ad=joints(duy).armR,at=joints(thao).armL;
  const world=(p:Pose,q:Point)=>({x:p.x+q.x*p.scale,y:p.y+q.y*p.scale});
  const d=world(duy,ad.end),e=world(thao,at.end);
  const angD=Math.atan2(ad.end.y-ad.mid.y,ad.end.x-ad.mid.x)*180/Math.PI;
  const angT=Math.atan2(at.end.y-at.mid.y,at.end.x-at.mid.x)*180/Math.PI;
  const ink='#46302b';
  const hand=(w:Point,ang:number,width:number,skin:string)=>{
    const len=Math.max(14,Math.hypot(c.x-w.x,c.y-w.y)+6);
    return <rect transform={`translate(${w.x} ${w.y}) rotate(${ang})`} x={-3} y={-width/2} width={len+3} height={width} rx={width/2} fill={skin} stroke={ink} strokeWidth={1.2} />;
  };
  const stroke=(x1:number,y1:number,x2:number,y2:number,skin:string,w:number)=><g key={`${x1}${y1}`}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={w+1.8} strokeLinecap="round" /><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={skin} strokeWidth={w} strokeLinecap="round" /></g>;
  return <g data-sibling-clasp="two-hands">
    {hand(e,angT,9.6,LOOKS.thao.hand)}
    {hand(d,angD,11.5,LOOKS.duy.hand)}
    {/* his four fingers wrap across the back of her hand */}
    <g transform={`translate(${c.x} ${c.y}) rotate(${angT})`}>
      {[-8.5,-4.2,0,4.2].map((u)=>stroke(u,-6.6,u,6.6,LOOKS.duy.hand,2.9))}
    </g>
    {/* her thumb folds over his */}
    <g transform={`translate(${c.x} ${c.y}) rotate(${angD})`}>{stroke(-1,-7,-9,-7.5,LOOKS.thao.hand,2.8)}</g>
  </g>;
};
