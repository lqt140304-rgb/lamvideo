import React from 'react';
import { clamp } from '../../engine/anim';
import { Hero, LOOKS, sitPose, joints, type Pose, type Limb, type Expr } from '../../engine/rig';
import { mouthCueAt } from '../../engine/mouth';

type Point = {x:number;y:number};
const degrees = (a:number) => a*180/Math.PI;

/** Two-bone reach in the mother's local space; same 52/46 anchors as the shared rig. */
const wrapArm = (pose:Pose, side:'L'|'R', target:Point):Limb => {
  const root = joints(pose)[side==='L'?'armL':'armR'].root;
  const x=(target.x-pose.x)/pose.scale-root.x, y=(target.y-pose.y)/pose.scale-root.y;
  const distance=clamp(Math.hypot(x,y),6.001,97.999);
  const bend=Math.acos(clamp((distance*distance-52*52-46*46)/(2*52*46),-1,1));
  const sign=side==='L'?-1:1;
  const b=-sign*bend;
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

export const meadowFamilyPoses = (t:number, grieving=false, support=1) => {
  const thao={...bankSit(1080,.72,t,3,-2-12*clamp(support)),expr:(grieving?'cry':'relieved') as Expr};
  const duy={...bankSit(850,.84,t,1,2+8*clamp(support)),expr:(grieving?'sad':'relieved') as Expr};
  // A small fixed lean keeps the shoulder contacts stable while the eyes/cloth breathe.
  const mother={...bankSit(960,1.02,t,9,0),yaw:0,facing:1 as const,legL:{a:65,b:-65},legR:{a:60,b:-60},tilt:0,headTilt:-2,shoulderLift:0,expr:'smile' as Expr};
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
  return {mother,thao,duy,targets,contacts};
};

/** Arms behind the children, palms on their upper arms, and no floor shadows beneath dangling feet. */
export const MeadowFamily:React.FC<{t:number;motherOpacity?:number;grieving?:boolean;demoTalk?:boolean}> =
  ({t,motherOpacity=1,grieving=false,demoTalk=false}) => {
    const {mother,thao,duy}=meadowFamilyPoses(t,grieving,motherOpacity);
    const p=t%360;
    const mom={...mother,...(demoTalk?mouthCueAt(p,[{from:55,to:72,shape:'a',open:.3},{from:78,to:92,shape:'e',open:.25},{from:105,to:121,shape:'o',open:.25}]):{})};
    return <g data-meadow-family="embrace">
      {[thao,duy].map((a,i)=><ellipse key={i} cx={a.x} cy="802" rx={31*a.scale} ry="3.5" fill="#3d3a26" opacity="0.22" />)}
      <ellipse cx={mom.x} cy="802" rx="39" ry="3.5" fill="#3d3a26" opacity={motherOpacity*.22} />
      <Hero pose={mom} look={LOOKS.meDuyThao} opacity={motherOpacity} shadow={0} rimId="rimStreetlamp" handLayer="defer" />
      <Hero pose={thao} look={LOOKS.thao} shadow={0} rimId="rimStreetlamp" />
      <Hero pose={duy} look={LOOKS.duy} shadow={0} rimId="rimStreetlamp" />
      <Hero pose={mom} look={LOOKS.meDuyThao} opacity={motherOpacity} shadow={0} rimId="rimStreetlamp" handLayer="only" />
    </g>;
  };
