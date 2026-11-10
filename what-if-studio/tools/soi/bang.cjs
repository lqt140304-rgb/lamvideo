// Ghép ảnh thành bảng PNG bằng Chrome của Remotion. argv: studio, out.png, cols, title, ...imgs
const path=require('node:path'),fs=require('node:fs'),{pathToFileURL}=require('node:url');
const [studio,out,cols,title,...imgs]=process.argv.slice(2);
const req=require('node:module').createRequire(path.join(studio,'package.json'));
(async()=>{
 const W=960*cols+10*(+cols+1),rows=Math.ceil(imgs.length/cols),H=70+rows*550;
 const html=out.replace('.png','.html');
 fs.writeFileSync(html,`<!doctype html><meta charset=utf-8><body style="margin:0;background:#273b34;width:${W}px;height:${H}px;font:bold 26px Arial;color:#f0e5cd"><div style="padding:20px 14px">${title}</div><div style="display:grid;grid-template-columns:repeat(${cols},960px);gap:10px;padding:0 10px">${imgs.map(i=>`<img src="${pathToFileURL(i).href}" width=960 height=540>`).join('')}</div></body>`);
 process.chdir(studio);const br=await req('@remotion/renderer').openBrowser('chrome',{logLevel:'error'});
 try{const pg=await br.newPage({context:()=>Promise.resolve(null),logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});
  await pg.setViewport({width:W,height:H,deviceScaleFactor:1});await pg.goto({url:pathToFileURL(html).href,timeout:30000});
  const {value}=await pg._client().send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out,Buffer.from(value.data,'base64'));}
 finally{await br.close({silent:true});}console.log('ok');
})().catch(e=>{console.error(e);process.exit(1)});
