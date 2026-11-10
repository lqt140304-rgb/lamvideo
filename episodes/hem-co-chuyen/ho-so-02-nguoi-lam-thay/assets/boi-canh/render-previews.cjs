const fs=require('node:fs');
const path=require('node:path');
const {createRequire}=require('node:module');
const {pathToFileURL}=require('node:url');
const studio=path.resolve(__dirname,'../../../../../what-if-studio');
const req=createRequire(path.join(studio,'package.json'));
const root=path.join(require('node:os').tmpdir(),'lamvideo-room-preview');
fs.mkdirSync(path.join(root,'work/ho-so-02'),{recursive:true});
const out=__dirname;
async function main(){
 const bundle=path.join(root,'work/ho-so-02/room-overhaul.bundle.cjs');
 await req('esbuild').build({entryPoints:[path.join(out,'boi-canh.tsx')],bundle:true,platform:'node',format:'cjs',external:['react'],outfile:bundle,logLevel:'warning'});
 // Resolve the external React from studio without changing the source or installing packages.
 const Module=require('node:module');
 process.env.NODE_PATH=path.join(studio,'node_modules');Module._initPaths();
 const React=req('react');const {renderToStaticMarkup}=req('react-dom/server');const room=require(bundle);
 const views=[['phong-tro-sang-som','RoomMorning','01 / PHÒNG NAM — SÁNG SỚM'],['goc-bep-bon-rua','KitchenSink','02 / GÓC BẾP — CHỖ NGƯỜI KIA ĐỨNG'],['goc-ban-hoc-sang','StudyCornerMorning','03 / GÓC HỌC — BAN NGÀY'],['ban-hoc-laptop-dem','StudyDeskNight','04 / CÙNG GÓC HỌC — BAN ĐÊM']];
 const svgs=views.map(([name,component])=>{
  const svg=renderToStaticMarkup(React.createElement(room[component],{}));
  fs.writeFileSync(path.join(out,name+'.svg'),svg);return svg;
 });
 fs.writeFileSync(path.join(out,'hanh-lang-cua-phong.svg'),svgs[2]);
 const rigBundle=path.join(root,'work/ho-so-02/room-rig-check.bundle.cjs');
 await req('esbuild').build({entryPoints:[path.resolve(studio,'../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/rig/rig.tsx')],bundle:true,platform:'node',format:'cjs',external:['react'],outfile:rigBundle,logLevel:'warning'});
 const {StudentRig}=require(rigBundle);
 const scaleCheck=renderToStaticMarkup(React.createElement(room.RoomMorning,{},React.createElement('g',{},React.createElement('ellipse',{cx:850,cy:749,rx:55,ry:11,fill:'#718873',opacity:.22}),React.createElement(StudentRig,{cast:'nam',pose:'stand',x:850,y:367,scale:.64}))));
 fs.writeFileSync(path.join(out,'kiem-tra-ti-le.svg'),scaleCheck);
 const panels=svgs.map((svg,i)=>`<svg x="${i%2*1920}" y="${110+Math.floor(i/2)*1130}" width="1920" height="1080" viewBox="0 0 1920 1080">${svg.replaceAll('roomR0','roomBoard'+i)}</svg><text x="${i%2*1920+40}" y="${110+Math.floor(i/2)*1130+1115}" font-family="Arial" font-size="28" fill="#dedccc">${views[i][2]}</text>`).join('');
 const board=`<svg xmlns="http://www.w3.org/2000/svg" width="3840" height="2370" viewBox="0 0 3840 2370"><rect width="3840" height="2370" fill="#273b34"/><text x="45" y="65" font-family="Arial" font-size="38" fill="#f0e5cd" font-weight="bold">HỒ SƠ 2 · NGƯỜI LÀM THAY — PHÒNG TRỌ / STYLE B</text><text x="3780" y="65" text-anchor="end" font-family="Arial" font-size="25" fill="#c0d1bd">BẢN ĐẠI TU ĐỂ DUYỆT · SVG VẼ BẰNG MÃ</text>${panels}</svg>`;
 fs.writeFileSync(path.join(out,'boi-canh.svg'),board);
 const viewer=`<!doctype html><html lang="vi"><meta charset="utf-8"><title>Phòng Nam — bản đại tu</title><style>body{margin:0;background:#243730;color:#ede4d0;font:16px Arial}header{padding:20px;display:flex;gap:20px;align-items:center;flex-wrap:wrap}button,select{padding:10px;font:inherit}main{overflow:auto;height:85vh}img{display:block;width:100%;height:auto;margin:auto}small{color:#b9c9b9}</style><header><b>PHÒNG NAM / STYLE B</b><select id="view">${[['boi-canh','Bảng tổng hợp'],...views.map(x=>[x[0],x[2]])].map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select><button id="minus">−</button><button id="plus">+</button><button id="reset">Vừa khung</button><small>Bản đề xuất · chưa duyệt chuyển động</small></header><main><img id="art" src="boi-canh.svg" alt="Bản vẽ phòng Nam"></main><script>let z=100;const a=document.getElementById('art');document.getElementById('view').onchange=e=>{a.src=e.target.value+'.svg';z=100;a.style.width=z+'%'};function zoom(d){z=Math.min(300,Math.max(60,z+d));a.style.width=z+'%'}document.getElementById('plus').onclick=()=>zoom(25);document.getElementById('minus').onclick=()=>zoom(-25);document.getElementById('reset').onclick=()=>{z=100;a.style.width='100%'};</script></html>`;
 fs.writeFileSync(path.join(out,'xem-truc-tiep-boi-canh.html'),viewer);
 process.chdir(studio);
 const browser=await req('@remotion/renderer').openBrowser('chrome',{logLevel:'error'});
 try{
  const page=await browser.newPage({context:()=>Promise.resolve(null),logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});
  for(const [name,svg,w,h] of [['boi-canh',board,1920,1185],...svgs.map((s,i)=>[views[i][0],s,1920,1080]),['kiem-tra-ti-le',scaleCheck,1920,1080]]){
   const html=path.join(root,'work/ho-so-02/overhaul-'+name+'.html');
   fs.writeFileSync(html,`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#273b34}body>svg{display:block;width:${w}px;height:${h}px}</style>${svg}`);
   await page.setViewport({width:w,height:h,deviceScaleFactor:1});
   await page.goto({url:pathToFileURL(html).href,timeout:30000});
   await page.evaluate(()=>document.fonts.ready);
   const {value}=await page._client().send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
   fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(value.data,'base64'));
  }
 }finally{await browser.close({silent:true});}
 console.log('Generated editable SVG, PNG and viewer: '+out);
}
main().catch(e=>{console.error(e);process.exitCode=1});
