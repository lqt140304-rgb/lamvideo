const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {createRequire} = require('node:module');
const {pathToFileURL} = require('node:url');
// Installed in the episode assets folder; all outputs stay inside that folder.
const studio = path.resolve(__dirname, '../../../../what-if-studio');
const req = createRequire(path.join(studio, 'package.json'));
process.env.NODE_PATH = path.join(studio, 'node_modules');
require('node:module').Module._initPaths();
const ts = req('typescript');
for (const ext of ['.ts','.tsx']) require.extensions[ext] = (m, filename) => {
  const result=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,target:ts.ScriptTarget.ES2020}});
  m._compile(result.outputText,filename);
};
const React=req('react');
const {renderToStaticMarkup}=req('react-dom/server');
const {HoSo02CharacterMasterBoard}=require(path.join(__dirname,'nhan-vat.tsx'));
const {MirrorMarkBoard}=require(path.join(__dirname,'thiet-ke/doi-chieu-not-ruoi.tsx'));
async function main(){
  const items=[['nhan-vat',HoSo02CharacterMasterBoard,1920,1080],['thiet-ke/doi-chieu-not-ruoi',MirrorMarkBoard,1600,1040]];
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'lamvideo-cast-'));
  const browser=await req('@remotion/renderer').openBrowser('chrome',{logLevel:'error'});
  try {
    const page=await browser.newPage({context:()=>Promise.resolve(null),logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});
    for(const [name,Component,width,height] of items){
      const svg=renderToStaticMarkup(React.createElement(Component));
      fs.writeFileSync(path.join(__dirname,name+'.svg'),svg);
      const html=path.join(temp,path.basename(name)+'.html');
      fs.writeFileSync(html,`<!doctype html><meta charset="utf-8"><style>body{margin:0}svg{display:block;width:${width}px;height:${height}px}</style>${svg}`);
      await page.setViewport({width,height,deviceScaleFactor:1});
      await page.goto({url:pathToFileURL(html).href,timeout:30000});
      await page.evaluate(()=>document.fonts.ready);
      const {value}=await page._client().send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      fs.writeFileSync(path.join(__dirname,name+'.png'),Buffer.from(value.data,'base64'));
      if(name==='nhan-vat') {
        const viewer=path.join(__dirname,'xem-truc-tiep.html');
        const old=fs.readFileSync(viewer,'utf8');
        const a=old.indexOf('<svg'),b=old.lastIndexOf('</svg>');
        if(a<0||b<0)throw new Error('Character viewer SVG missing');
        fs.writeFileSync(viewer,old.slice(0,a)+svg+old.slice(b+6));
      }
    }
  }finally{await browser.close({silent:true});}
  console.log('Updated cast SVG/PNG/viewer and mirror mark comparison. No film/audio created.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
