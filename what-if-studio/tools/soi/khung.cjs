// Chụp frame tĩnh (mặc định 1/2 cỡ, SCALE=1 để cận nét). argv: studio, thư mục ra, "f1,f2", compositionId, tiền tố
const path=require('node:path');
const studio=process.argv[2], out=process.argv[3], frames=process.argv[4].split(',').map(Number);
const {createRequire}=require('node:module');const req=createRequire(path.join(studio,'package.json'));
const {bundle}=req('@remotion/bundler');const {selectComposition,renderStill}=req('@remotion/renderer');
(async()=>{
 const serveUrl=await bundle({entryPoint:path.join(studio,'src/index.ts')});
 const composition=await selectComposition({serveUrl,id:process.argv[5]||'HoSo02Canh01Demo'});
 for(const frame of frames){await renderStill({serveUrl,composition,frame,output:path.join(out,`${process.argv[6]||'f'}${frame}.png`),scale:Number(process.env.SCALE||0.5)});console.log('ok',frame);}
})().catch(e=>{console.error(e);process.exit(1)});
