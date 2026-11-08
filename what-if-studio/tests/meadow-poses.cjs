require('./shared-assets.cjs'); // Reuse the local TypeScript loader and baseline checks.
const assert=require('node:assert/strict');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const {meadowFamilyPoses,MeadowFamily}=require('../src/episodes/tin-nhan-chua-gui/meadow_family');
const {joints,handWorld,Hero,LOOKS}=require('../src/engine/rig');
let count=0;
const check=(ok,message)=>{count++;assert.ok(ok,message);};
for(const t of [0,27,63,93,128,210,359])for(const support of [0,.5,1]){
  const {mother,thao,duy,targets,contacts}=meadowFamilyPoses(t,false,support);
  check(duy.tilt>0&&thao.tilt<0,'Both children lean toward the mother, never outward');
  for(const side of ['L','R']){
    const hand=handWorld(mother,side);
    check(Math.hypot(hand.x-targets[side].x,hand.y-targets[side].y)<.001,'Reach stays within arm length');
    const arm=joints(mother)[side==='L'?'armL':'armR'];
    const len=Math.hypot(arm.end.x-arm.mid.x,arm.end.y-arm.mid.y);
    const palm={x:hand.x+(arm.end.x-arm.mid.x)/len*10*mother.scale,y:hand.y+(arm.end.y-arm.mid.y)/len*10*mother.scale};
    check(Math.hypot(palm.x-contacts[side].x,palm.y-contacts[side].y)<.1,'Palm centre lands on top of the child shoulder');
  }
  for(const pose of [mother,thao,duy]){
    const j=joints(pose);
    for(const leg of [j.legL,j.legR]){
      check(Math.abs(leg.end.x-leg.mid.x)<.001,'Calves drop vertically');
      check(Math.abs(leg.mid.x-leg.root.x)>Math.abs(leg.mid.y-leg.root.y),'Thigh extends across the seat before the knee bends down');
      check(pose.y+(leg.end.y+16)*pose.scale<930,'Feet remain above the front ditch water');
    }
  }
  const svg=renderToStaticMarkup(React.createElement('svg',null,React.createElement(MeadowFamily,{t,motherOpacity:support})));
  check(!/NaN|Infinity/.test(svg),'Finite geometry in embrace and fade');
}
const {mother}=meadowFamilyPoses(93);
const hands=renderToStaticMarkup(React.createElement(Hero,{pose:mother,look:LOOKS.meDuyThao,handLayer:'only',opacity:.25}));
check(hands.includes('opacity="0.25"'),'Front palms fade with the mother');
check(!hands.includes('M -41 -8'),'Hands-only pass does not redraw pelvis/body');
console.log('Meadow embrace checks passed:',count);
