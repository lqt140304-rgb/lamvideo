require('./meadow-poses.cjs');
const assert=require('node:assert/strict');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const {motherDissolveAt,motherMotesAt,MotherDissolveAir}=require('../src/episodes/tin-nhan-chua-gui/mother_dissolve');
const {meadowFamilyPoses,MeadowFamily,palmWorld}=require('../src/episodes/tin-nhan-chua-gui/meadow_family');
let count=0,previous=1,total=0;
const check=(ok,message)=>{count++;assert.ok(ok,message);};
const {mother}=meadowFamilyPoses(0);
for(let t=-30;t<=360;t+=.5){
  const state=motherDissolveAt(t),motes=motherMotesAt(t,mother);
  check(state.opacity>=0&&state.opacity<=previous,'Mother fades monotonically without flashing back');
  previous=state.opacity;
  check(state.softness>=0&&state.softness<=.85,'Softness remains subtle');
  if(t<=6)check(state.opacity===1&&motes.length===0,'Opening holds the face and embrace intact');
  if(t>=120)check(state.opacity===0&&motes.length===0,'Body, palms, shadow and emitted particles end before the sibling comfort action');
  check(JSON.stringify(motes)===JSON.stringify(motherMotesAt(t,mother)),'Scrubbing produces identical motes');
  for(const m of motes){
    total++;
    check(m.origin.y<590||m.origin.y>780,'Motes originate at the exposed crown or hem, never the face/hands');
    check(m.x>m.origin.x&&m.y<m.origin.y,'Motes follow the rightward breeze and gently lift');
    check(m.opacity>0&&m.opacity<=.72&&m.radius>0&&m.radius<=2,'Sparse small motes without a bright explosion');
  }
}
check(total>0,'The farewell really emits particles');
for(const t of [0,24,54,78,108,120,239]){
  const svg=renderToStaticMarkup(React.createElement('svg',null,React.createElement(MeadowFamily,{t,dissolveT:t,grieving:true})));
  check(!/NaN|Infinity|undefined/.test(svg),'Finite layered farewell geometry');
  const air=renderToStaticMarkup(React.createElement('svg',null,React.createElement(MotherDissolveAir,{t,pose:mother,id:'test'})));
  if(t===0||t>=120)check(air==='<svg></svg>','No residual outline or particles after the mother is gone');
}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const hug=meadowFamilyPoses(0,true,1);
check(distance(palmWorld(hug.duy,'R'),hug.hugs.duy)<.1&&distance(palmWorld(hug.thao,'L'),hug.hugs.thao)<.1,'Both inside palms visibly touch the mother shirt');
for(const t of [184,194,204]){
  const p=meadowFamilyPoses(t,true,0,t);
  check(distance(palmWorld(p.duy,'R'),p.cheek)<.15,'Wiping palm reaches the actual cheek without stretching');
}
for(const t of [262,280,310,330]){
  const p=meadowFamilyPoses(t,true,0,t);
  check(p.grip&&distance(palmWorld(p.duy,'R'),palmWorld(p.thao,'L'))<5,'Both real hands meet at the clasp');
  check(p.duy.handR==='none'&&p.thao.handL==='none','No duplicate palms beneath the shared clasp');
  const svg=renderToStaticMarkup(React.createElement('svg',null,React.createElement(MeadowFamily,{t,dissolveT:t,grieving:true})));
  check(svg.includes('data-sibling-clasp="two-hands"')&&!/NaN|Infinity/.test(svg),'Clasp renders at the contact point');
}
const tl=require('../src/episodes/tin-nhan-chua-gui/timeline.json');
// Cue C7-C (ShC7_C): the last segment plays the whole approved farewell clock — dissolve, 8 s wordless clasp, fade.
const farewell=tl.segments.filter(s=>s.shot==='ShC7_C').pop();
check(farewell&&farewell.t0<=0&&farewell.t1>=360,'The farewell segment covers dissolve, wipe, clasp, push and fade');
const silent=tl.marks.find(m=>m.shot==='ShC7_C'&&m.kind==='pause');
check(silent&&silent.len===240&&Math.abs(silent.at-120)<=6,'The 8 s wordless stretch starts when the mother is fully gone');
for(let i=1;i<tl.segments.length;i++)check(tl.segments[i-1].b===tl.segments[i].a,'Timeline remains contiguous');
check(!tl.fx.some(f=>f.kind==='flash'),'No extra flash over the gentle return transition');
console.log('Mother farewell checks passed:',count);
