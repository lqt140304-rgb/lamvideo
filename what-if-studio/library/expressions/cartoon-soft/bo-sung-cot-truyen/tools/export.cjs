// Authoring source for six reusable story-emotion families. Uses installed studio dependencies only.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createRequire}=require('node:module'),{pathToFileURL}=require('node:url');
const dest=path.resolve(__dirname,'..'),svgDir=path.join(dest,'svg');fs.mkdirSync(svgDir,{recursive:true});
const GROUPS=[
 {id:'ngai-ngu',name:'Ngái ngủ',levels:['Lơ đãng, mí hơi nặng','Mắt lim dim, phản ứng chậm','Sắp ngủ, miệng hé ngáp'],use:'Nam trì hoãn, chơi game muộn và ngủ quên'},
 {id:'tu-man',name:'Tự mãn',levels:['Hài lòng với lợi ích nhỏ','Tin mình may mắn, hơi vênh','Đắc ý, né nhìn vào công sức thật'],use:'Nam nhận bài làm hộ rồi tự hợp lý hóa'},
 {id:'toi-loi',name:'Áy náy',levels:['Ngượng, bắt đầu tránh mắt','Xấu hổ khi bị đối chiếu','Nghẹn lời, biết mình đã làm sai'],use:'Nam đối diện trưởng nhóm, Tùng và tình cảm gia đình'},
 {id:'kiet-suc',name:'Kiệt sức',levels:['Mỏi mệt, khó tập trung','Mí nặng, nét mặt rệu rã','Cạn sức, không còn phản ứng mạnh'],use:'Nam cố tự làm lại nhưng liên tục thất bại'},
 {id:'buong-xuoi',name:'Buông xuôi',levels:['Còn muốn phản bác','Sức chống cự yếu dần','Chấp nhận trong trống rỗng'],use:'Chỉ dùng giai đoạn cuối trước khi Nam chạm gương'},
 {id:'cuoi-che-giau',name:'Cười che giấu',levels:['Lịch sự, dễ tạo thiện cảm','Cười có kiểm soát, dè chừng','Nụ cười lệch lạnh, lớp mặt nạ rơi'],use:'Người Kia: thân thiện ban đầu; mức 3 chỉ khi bản chất đã lộ'},
];
const ink='#303331',white='#f7f1e3';
function design(g,n){
 let open=13,low=8,px=0,py=0,bL='M-29 56Q-16 52-3 55',bR='M18 53Q30 50 42 53',mouth='',color='',details='';
 const shadow=(alpha)=>`<path d="M-31 82Q-17 90-1 81Q-6 95-27 91ZM18 79Q31 86 45 78Q42 91 22 88Z" fill="#797b91" opacity="${alpha}" stroke="none"/>`;
 if(g==='ngai-ngu'){open=[6,3,1.5][n-1];low=[6,5,3][n-1];px=2;py=2;bL='M-29 60Q-16 57-3 60';bR='M18 57Q30 54 42 57';mouth=n===3?'<ellipse cx="12" cy="113" rx="7" ry="9" fill="#76554a" stroke-width="1.5"/>':`<path d="M1 113Q13 ${114+n} 26 112" fill="none" stroke-width="1.8"/>`;color=shadow(.035*n);}
 if(g==='tu-man'){open=[12,9,7][n-1];px=2+n;py=0;bL=`M-29 ${56-n}Q-16 ${49-n} -3 ${54-n}`;bR=`M18 ${54-n*2}Q30 ${47-n*2} 42 ${52-n*2}`;mouth=`<path d="M0 112Q13 ${125+n} 27 ${110-n*2}" fill="none" stroke-width="2.1"/>`;if(n===3)details='<path d="M27 105Q32 107 31 112" stroke-width="1.2" fill="none" opacity=".45"/>';}
 if(g==='toi-loi'){open=[12,9,7][n-1];py=2+n;bL=`M-29 60Q-16 ${53-n*2} -3 ${53-n*2}`;bR=`M18 ${51-n*2}Q30 ${51-n*2} 42 58`;mouth=`<path d="M0 ${114+n}Q13 ${107-n} 26 ${114+n}" fill="none" stroke-width="1.9"/>`;color=`<ellipse cx="-28" cy="91" rx="12" ry="5" fill="#c18d80" opacity="${.05*n}" stroke="none"/><ellipse cx="39" cy="88" rx="10" ry="4" fill="#c18d80" opacity="${.05*n}" stroke="none"/>`;if(n===3)details='<path d="M-29 80Q-17 85-3 79M19 77Q31 82 44 76" stroke="#e6e8df" stroke-width="1.2" fill="none"/>';}
 if(g==='kiet-suc'){open=[7,4,2][n-1];low=[7,5,4][n-1];py=3;bL='M-29 60Q-15 53-3 56';bR='M18 53Q31 51 42 58';mouth=n===3?'<path d="M1 113Q13 109 25 113L24 118Q12 115 2 118Z" fill="#826557" stroke-width="1.2"/>':'<path d="M0 114Q12 111 25 115" fill="none" stroke-width="1.7"/>';color=shadow(.06+.04*n);details='<path d="M-28 87Q-16 91-4 86M20 84Q31 88 43 83" fill="none" stroke="#8c8477" stroke-width="1" opacity=".4"/>';}
 if(g==='buong-xuoi'){open=[13,10,8][n-1];py=2;px=-1;bL=`M-29 ${57+n}Q-16 ${48+n*3} -3 ${52+n*2}`;bR=`M18 ${50+n*2}Q30 ${47+n*3} 42 ${55+n}`;mouth=n===1?'<path d="M0 115L8 111 15 114 25 112" fill="none" stroke-width="1.7"/>':n===2?'<path d="M1 115Q13 109 25 115" fill="none" stroke-width="1.7"/>':'<path d="M2 114Q13 115 24 114" fill="none" stroke-width="1.6"/>';color=shadow(.04*n);if(n===3)details='<path d="M-29 82Q-32 91-30 101" stroke="#a9beb8" stroke-width="1.6" fill="none" opacity=".65"/>';}
 if(g==='cuoi-che-giau'){open=[13,10,7][n-1];px=n===3?3:0;bL=n===3?'M-29 55Q-16 53-3 57':'M-29 55Q-16 51-3 55';bR=n===3?'M18 55Q30 48 42 48':'M18 52Q30 49 42 52';mouth=n===1?'<path d="M0 110Q13 123 26 108" fill="none" stroke-width="1.9"/>':n===2?'<path d="M0 111Q13 120 26 108" fill="none" stroke-width="1.8"/>':'<path d="M1 113Q14 117 27 105" fill="none" stroke-width="1.9"/>';}
 const eye=(cx,cy,right)=>{const top=open*(g==='cuoi-che-giau'&&n===3&&right ? .78 : 1);return `M${cx-14} ${cy}Q${cx} ${cy-top} ${cx+14} ${cy}Q${cx} ${cy+low} ${cx-14} ${cy}Z`;};
 const eL=eye(-16,73,false),eR=eye(30,70,true),key=`${g}-0${n}`;
 const defs=`<defs><clipPath id="${key}-eye-l"><path d="${eL}"/></clipPath><clipPath id="${key}-eye-r"><path d="${eR}"/></clipPath></defs>`;
 const pupil=(cx,cy,side)=>`<path d="${side==='l'?eL:eR}" fill="${white}" stroke-width="1.6"/><g clip-path="url(#${key}-eye-${side})" stroke="none"><ellipse cx="${cx+px}" cy="${cy+py}" rx="${g==='buong-xuoi'?3.8-n*.25:4}" ry="5.3" fill="${ink}"/><circle cx="${cx+px+1}" cy="${cy+py-1.5}" r=".8" fill="${white}"/></g>`;
 const layers={color,eyes:pupil(-16,73,'l')+pupil(30,70,'r'),brows:`<path d="${bL} ${bR}" stroke-width="3" fill="none"/>`,nose:'<path d="M16 80Q20 87 24 90L16 94" fill="none" stroke-width="1.6"/>',mouth,details};
 const wrap=`<g id="${key}-features" transform="translate(-7 -71)" stroke="${ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">`;
 return {key,defs,wrap,layers:Object.fromEntries(Object.entries(layers).map(([name,shape])=>[name,`<g id="${key}-${name}" data-layer="${name}">${shape}</g>`]))};
}
const faces={},entries=[];
for(const g of GROUPS)for(let n=1;n<=3;n++){
 const f=design(g.id,n);faces[f.key]={defs:f.defs,wrap:f.wrap,layers:f.layers};
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="390" height="360" viewBox="-65 -50 130 120" role="img" aria-label="${g.name} mức ${n}">${f.defs}${f.wrap}${Object.values(f.layers).join('')}</g></svg>`;
 assert(!/NaN|undefined|Infinity/.test(svg));const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
 fs.writeFileSync(path.join(svgDir,f.key+'.svg'),svg+'\n');entries.push({key:f.key,group:g.id,name:g.name,level:n,description:g.levels[n-1],use:g.use,file:'svg/'+f.key+'.svg'});
}
fs.writeFileSync(path.join(dest,'danh-muc.json'),JSON.stringify({version:1,date:'2026-11-11',viewBox:[-65,-50,130,120],layers:['color','eyes','brows','nose','mouth','details'],groups:GROUPS,expressions:entries,limits:['Static overlays; front/three-quarter only','No hair, head, skin fill or neck','No lip-sync or motion acceptance']},null,2)+'\n');
fs.writeFileSync(path.join(dest,'net-mat.ts'),`// Generated by tools/export.cjs; edit source generator, not this file.\nexport type StoryFaceKey = ${Object.keys(faces).map(k=>`'${k}'`).join(' | ')};\nexport const STORY_FACES = ${JSON.stringify(faces,null,1)};\nexport const STORY_GROUPS = ${JSON.stringify(GROUPS,null,1)};\n`);
const text=(s,x,y,size=18)=>`<text x="${x}" y="${y}" font-size="${size}" fill="#38483f" font-family="Arial,sans-serif">${s}</text>`;
for(let page=0;page<2;page++){
 let rows='';for(let row=0;row<3;row++){const g=GROUPS[page*3+row];for(let n=1;n<=3;n++){const f=design(g.id,n),x=20+(n-1)*455,y=110+row*300;rows+=`<rect x="${x}" y="${y}" width="440" height="282" rx="20" fill="#faf6ed"/>${f.defs}<g transform="translate(${x+220} ${y+91}) scale(2.3)">${f.wrap}${Object.values(f.layers).join('')}</g></g>${text(g.name+' · mức '+n,x+20,y+230,21)}${text(g.levels[n-1],x+20,y+262,16)}`;}}
 const s=`<svg xmlns="http://www.w3.org/2000/svg" width="1380" height="1050" viewBox="0 0 1380 1050"><rect width="1380" height="1050" fill="#f0eadf"/>${text('NÉT MẶT BỔ SUNG / DIỄN BIẾN TÂM LÝ',30,42,25)}${[1,2,3].map((n,i)=>text('Mức '+n+[' · nhẹ',' · rõ',' · cao trào'][i],40+i*455,82,18)).join('')}${rows}${text('Chỉ nét mặt · không tóc/sọ/da nền · màu cảm xúc tiết chế · chưa kiểm tra diễn hoạt',30,1030,16)}</svg>`;
 fs.writeFileSync(path.join(dest,`bang-${page+1}.svg`),s);
}
async function png(){const studio=path.resolve(dest,'../../../..'),req=createRequire(path.join(studio,'package.json'));const browser=await req('@remotion/renderer').openBrowser('chrome',{logLevel:'error'});try{const pg=await browser.newPage({context:()=>Promise.resolve(null),logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});for(let i=1;i<=2;i++){await pg.setViewport({width:1380,height:1050,deviceScaleFactor:1});await pg.goto({url:pathToFileURL(path.join(dest,`bang-${i}.svg`)).href,timeout:30000});await pg.evaluate(()=>document.fonts.ready);const {value}=await pg._client().send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(dest,`bang-${i}.png`),Buffer.from(typeof value==='string'?value:value.data,'base64'));}}finally{await browser.close({silent:true});}console.log('PASS: 18 transparent overlays, 6 families x 3 levels, 2 boards, typed module and metadata');}
png().catch(e=>{console.error(e);process.exitCode=1});
