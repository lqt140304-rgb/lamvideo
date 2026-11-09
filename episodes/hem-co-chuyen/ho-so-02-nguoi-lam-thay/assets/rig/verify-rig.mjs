import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import assert from 'node:assert/strict';
const here=path.dirname(fileURLToPath(import.meta.url));
const studio=path.resolve(here,'../../../../../what-if-studio');
const require=createRequire(path.join(studio,'package.json'));
const {build}=require('esbuild');
const result=await build({entryPoints:[path.join(here,'rig.tsx')],bundle:true,platform:'node',format:'cjs',jsx:'automatic',nodePaths:[path.join(studio,'node_modules')],write:false,logLevel:'silent'});
const tmp=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'rig-check-')),'rig.cjs');fs.writeFileSync(tmp,result.outputFiles[0].contents);
const rig=require(tmp);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
let cases=0;
function check(p){
  const s=rig.skeleton(p);
  for(const name of ['la','ra','ll','rl']){
    const l=s[name],upper=name.endsWith('a')?79:p.support==='seat'?100:110,lower=name.endsWith('a')?78:p.support==='seat'?100:109;
    assert(Math.abs(distance(l.start,l.mid)-upper)<1e-6, name+' upper bone drift');
    assert(Math.abs(distance(l.mid,l.end)-lower)<1e-6, name+' lower bone drift');
    assert(!/NaN|Infinity/.test(rig.limbOutline(l.start,l.mid,l.end,24,20,12)));
  }
  cases++;
}
for(const p of Object.values(rig.POSES))check(p);
for(let i=0;i<=120;i++){check(rig.sampleWalk(i/120));check(rig.blendPose(rig.POSES.stand,rig.POSES.wary,i/120));}
assert.deepEqual(rig.sampleWalk(0),rig.sampleWalk(1));
assert(rig.skeleton(rig.POSES.sit).ll.mid.x<0,'Left knee crossed center');
assert(rig.skeleton(rig.POSES.sit).rl.mid.x>0,'Right knee crossed center');
for(const [a,b] of [[{x:0,y:0},{x:0,y:0}],[{x:0,y:0},{x:900,y:900}]]){
 const l=rig.solveLimb(a,b,79,84,1);assert(Number.isFinite(l.mid.x)&&Number.isFinite(l.end.y));
}
console.log(`PASS ${cases} poses/phases: stable bone lengths, finite outlines, walk loop, seated knee direction, singular/out-of-reach targets.`);
