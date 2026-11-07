// Run from what-if-studio: node tests/shared-assets.cjs. Uses the project's existing TypeScript compiler.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, filename) => {
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,target:ts.ScriptTarget.ES2020},
    fileName:filename,
  });
  module._compile(compiled.outputText,filename);
};
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const vfx = require('../src/engine/vfx');
const rig = require('../src/engine/rig');
const {mouthCueAt,ArticulatedMouth} = require('../src/engine/mouth');
const {limbContour} = require('../src/engine/anatomy');
const {SunsetRiceField,SunsetMeadowForeground} = require('../src/engine/sets/sunset_field');
const {Dust} = require('../src/engine/light');
let checks=0;
const check=(ok,message)=>{checks++;assert.ok(ok,message);};
const markup=(C,props)=>renderToStaticMarkup(React.createElement('svg',null,React.createElement(C,props)));
const clean=s=>check(!/NaN|Infinity|undefined/.test(s),'finite render geometry');
const near=(a,b)=>Math.abs(a-b)<1e-8;

for(let t=-120;t<=360;t+=0.5){
  for(const seed of [0,1,3,9]){
    check(rig.blinkAt(t,seed)>=0&&rig.blinkAt(t,seed)<=1,'blink range');
    check(Math.abs(vfx.windAt(t,seed,3))<=3.00001,'bounded wind');
    const light=vfx.lightFlickerAt(t,seed,.3);
    check(light>=.7&&light<=1,'bounded flicker');
  }
}
check(Array.from({length:100},(_,t)=>rig.blinkAt(t,1)).some(v=>v>0&&v<1),'partial eyelid frames');
check(Array.from({length:100},(_,t)=>rig.blinkAt(t,1)!==rig.blinkAt(t,3)).some(Boolean),'independent blink phases');
for(const C of [vfx.ImpactBurst,vfx.WaterRipple]){
  for(const t of [-1,60])check(markup(C,{t,x:20,y:30,life:60})==='<svg></svg>','contact effects end, no perpetual burst');
  check(markup(C,{t:12,x:20,y:30,life:60})!=='<svg></svg>','contact effect visible during life');
}
for(const t of [-10,0,3,17,72,93,177,359]){
  for(const [C,props] of [[vfx.CloudBank,{w:560,h:190}],[vfx.SmokePlume,{x:30,y:100}],[vfx.RainSheet,{w:560,h:190}],[Dust,{seed:4,x0:0,y0:0,w:300,h:190}],[SunsetRiceField,{}],[SunsetMeadowForeground,{}]]){
    const a=markup(C,{t,...props});clean(a);check(a===markup(C,{t,...props}),'deterministic frame/seed');
  }
}
check(markup(vfx.CloudBank,{t:0,w:560,h:190})!==markup(vfx.CloudBank,{t:93,w:560,h:190}),'clouds actually move');
const cues=[{from:20,to:35,shape:'a',open:.4}];
check(mouthCueAt(19,cues).talk===0&&mouthCueAt(35,cues).talk===0,'silent gaps');
check(mouthCueAt(20,cues).talk===0&&mouthCueAt(25,cues).talk>.3,'soft mouth attack');
check(!markup(ArticulatedMouth,{shape:'a',open:.4,ink:'#123'}).includes('#f0e1cd'),'teeth absent in ordinary open vowel');
for(const chain of [
  {root:{x:0,y:0},mid:{x:0,y:50},end:{x:0,y:98}},
  {root:{x:0,y:0},mid:{x:0,y:50},end:{x:0,y:0}},
  {root:{x:0,y:0},mid:{x:0,y:0},end:{x:0,y:0}},
])clean(limbContour(chain,[12,10,8]));

const base=rig.standPose(100,600,1,{yaw:.25});
for(const gesture of ['explain','point','think','shrug','crossArms','handOnChest','slump','recoil','determined','wave','holdProp','write']){
  const end=rig.gesturePose(base,gesture);
  const start=rig.gestureAt(base,gesture,0,10,30), finish=rig.gestureAt(base,gesture,40,10,30);
  check(near(start.armR.a,base.armR.a)&&near(finish.armR.a,end.armR.a),'gesture exact endpoints');
  for(let t=0;t<=40;t+=4){
    const p=rig.gestureAt(base,gesture,t,10,30), j=rig.joints(p);
    for(const arm of [j.armL,j.armR]){
      check(near(Math.hypot(arm.mid.x-arm.root.x,arm.mid.y-arm.root.y),52),'upper-arm length remains fixed');
      check(near(Math.hypot(arm.end.x-arm.mid.x,arm.end.y-arm.mid.y),46),'forearm length remains fixed');
    }
    clean(JSON.stringify(rig.handWorld(p)));
  }
}
for(const look of Object.values(rig.LOOKS)){
  for(const yaw of [-.75,0,.75]){
    for(const p of [rig.standPose(200,700,1,{yaw}),rig.sitPose(200,600,1,yaw<0?-1:1,{yaw})])clean(markup(rig.Hero,{pose:p,look}));
  }
}
const held=markup(rig.Hero,{pose:{...base,handR:'hold'},look:rig.LOOKS.duy,heldProps:{R:React.createElement('rect',{'data-held':'phone'})}});
check(held.includes('data-held="phone"'),'prop attached to grip');
const report={checks,cartoonBones:{upperArm:52,forearm:46,leg:rig.LEG_LEN},looks:Object.keys(rig.LOOKS).length};
console.log('Shared asset checks passed:',JSON.stringify(report));
