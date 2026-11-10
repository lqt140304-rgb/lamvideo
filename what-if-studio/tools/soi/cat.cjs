// Cắt + phóng một vùng ảnh. argv: studio, ảnh vào, ảnh ra, x, y, rộng, cao, hệ số phóng (tích rộng×hệ số phải là số nguyên)
const path=require('node:path'),fs=require('node:fs'),{pathToFileURL}=require('node:url');
const [studio,img,out,x,y,w,h,z]=process.argv.slice(2);
const req=require('node:module').createRequire(path.join(studio,'package.json'));
(async()=>{const html=out.replace('.png','.html');
fs.writeFileSync(html,`<!doctype html><body style="margin:0;overflow:hidden;width:${w*z}px;height:${h*z}px"><img src="${pathToFileURL(img).href}" style="transform-origin:0 0;transform:scale(${z}) translate(${-x}px,${-y}px);image-rendering:auto">`);
process.chdir(studio);const br=await req('@remotion/renderer').openBrowser('chrome',{logLevel:'error'});
try{const pg=await br.newPage({context:()=>Promise.resolve(null),logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});
await pg.setViewport({width:w*z,height:h*z,deviceScaleFactor:1});await pg.goto({url:pathToFileURL(html).href,timeout:30000});
const {value}=await pg._client().send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out,Buffer.from(value.data,'base64'));}finally{await br.close({silent:true});}console.log('ok')})();
