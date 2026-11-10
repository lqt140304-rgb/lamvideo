const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {createRequire}=require('node:module'),{pathToFileURL}=require('node:url');
const studio=path.resolve(__dirname,'../../../../../what-if-studio'),req=createRequire(path.join(studio,'package.json'));
process.env.NODE_PATH=path.join(studio,'node_modules');require('node:module').Module._initPaths();
const ts=req('typescript');
for(const ext of ['.ts','.tsx']) require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText,f);
const React=req('react'),{renderToStaticMarkup}=req('react-dom/server');
const {ASSETS,BOARDS}=require('./catalog.tsx'),{EXTRA_POSES,gripAt}=require('./nhan-vat-va-tu-the.tsx');
const assert=require('node:assert/strict');
const ids=new Set();for(const a of ASSETS){assert(!ids.has(a.id),a.id);ids.add(a.id);assert(a.w>0&&a.h>0);}
for(const [side,target] of [['R',[65,200]],['L',[32,255]]]){const g=gripAt(EXTRA_POSES['giu-bua'],side);assert(Math.hypot(g.x-target[0],g.y-target[1])<4,'Hammer grip misses palm');}
for(const name of ['choi-game','nam-choi-game']){const p=EXTRA_POSES[name],rig=require('../nhan-vat.tsx').solveRig(p);for(const [side,x] of [['R',-47],['L',47]]){const end=rig[side==='R'?'armR':'armL'].end;assert(Math.hypot(end.x-x,end.y-306)<8,`${name}: hand misses landscape phone`);}assert.equal(p.prop,'phoneLandscape');}
const out=path.join(__dirname,'svg');fs.mkdirSync(out,{recursive:true});
const svg=(a)=>renderToStaticMarkup(React.createElement('svg',{xmlns:'http://www.w3.org/2000/svg',width:a.w,height:a.h,viewBox:`0 0 ${a.w} ${a.h}`,role:'img','aria-label':a.name,strokeLinecap:'round',strokeLinejoin:'round'},a.node()));
function check(markup,name){const found=[...markup.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(found.length,new Set(found).size,`Duplicate SVG id: ${name}`);const declared=new Set(found);for(const m of markup.matchAll(/url\(#([^\)]+)\)/g))assert(declared.has(m[1]),`Missing clip/filter ${name}: ${m[1]}`);assert(!/NaN|Infinity|undefined/.test(markup),`Invalid number in ${name}`);}
async function main(){
 const shots=[];
 for(const a of ASSETS){const markup=svg(a);check(markup,a.id);fs.writeFileSync(path.join(out,a.id+'.svg'),markup);if(a.kind==='set')shots.push({id:'svg/'+a.id,w:a.w,h:a.h,markup});}
 for(const b of BOARDS){const markup=renderToStaticMarkup(React.createElement(b.node));check(markup,b.id);fs.writeFileSync(path.join(__dirname,b.id+'.svg'),markup);shots.push({...b,markup});}
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'hs02-assets-'));
 const browser=await req('@remotion/renderer').openBrowser('chrome',{logLevel:'error'});
 try{const pg=await browser.newPage({context:()=>Promise.resolve(null),logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});
  for(const b of shots){const html=path.join(temp,path.basename(b.id)+'.html');fs.writeFileSync(html,`<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#f3eee2}svg{display:block}</style>${b.markup}`);await pg.setViewport({width:b.w,height:b.h,deviceScaleFactor:1});await pg.goto({url:pathToFileURL(html).href,timeout:30000});await pg.evaluate(()=>document.fonts.ready);const {value}=await pg._client().send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(__dirname,b.id+'.png'),Buffer.from(value.data,'base64'));}
 }finally{await browser.close({silent:true});}
 const manifest={episode:'ho-so-02-nguoi-lam-thay',date:'2026-11-11',status:'new static assets for visual review; no motion or audio validation',style:'Style B: soft forms, flat colors, sparse hand-drawn shadow shapes',provenance:'SVG/TSX authored in this repository; existing episode rig/room reused; no external image or paid generation',boards:BOARDS.map(({id,w,h})=>({id,w,h,svg:id+'.svg',png:id+'.png'})),assets:ASSETS.map(({id,name,scenes,w,h,kind})=>({id,name,scenes,w,h,kind,svg:'svg/'+id+'.svg',...(kind==='set'?{png:'svg/'+id+'.png'}:{})})),reuse:['../nhan-vat.tsx','../boi-canh/boi-canh.tsx'],limitations:['2D projected plates; no automatic 3D camera re-projection','Extra poses tested as still keys only','Supporting characters currently three-quarter front; other views need drawing when a shot requires them','No audio files or complete film timeline']};
 fs.writeFileSync(path.join(__dirname,'MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(path.join(__dirname,'xem-asset.html'),`<!doctype html><html lang="vi"><meta charset="utf-8"><title>Hồ sơ 02 · Asset bổ sung</title><style>body{margin:0;padding:24px;background:#eee8db;color:#334b40;font:17px Arial}main{max-width:1500px;margin:auto}img{display:block;width:100%;height:auto;background:#f3eee2;border-radius:12px}section{margin:28px 0}a{color:#496d59}nav{display:flex;gap:18px;flex-wrap:wrap}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}.grid img{height:230px;object-fit:contain}</style><main><h1>Hồ sơ 02 · Bộ asset bổ sung</h1><p>Bản hình để duyệt · SVG/TSX chỉnh từng lớp · bóng vẽ tay tiết chế · chưa dựng phim.</p><nav>${BOARDS.map(b=>`<a href="#${b.id}">${b.id.replaceAll('-',' ')}</a>`).join('')}</nav>${BOARDS.map(b=>`<section id="${b.id}"><a href="${b.id}.svg">SVG gốc</a><img src="${b.id}.png" loading="lazy" alt="${b.id}"></section>`).join('')}<h2>Asset rời (${ASSETS.length})</h2><div class="grid">${ASSETS.map(a=>`<section><a href="svg/${a.id}.svg"><img src="svg/${a.id}.svg" loading="lazy" alt="${a.name}">${a.name}</a><p>${a.scenes.join(' · ')}</p></section>`).join('')}</div></main></html>`);
 console.log(`PASS: ${ASSETS.length} standalone SVG, ${BOARDS.length} boards, ${shots.length} PNG; unique IDs/references, finite geometry, hammer grips checked. No video/audio created.`);
}
main().catch(e=>{console.error(e);process.exit(1)});
