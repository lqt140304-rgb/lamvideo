import { STORY_GROUPS, type StoryFaceKey } from '../../../../../what-if-studio/library/expressions/cartoon-soft/bo-sung-cot-truyen/net-mat';
import { CamXucAnhSangBoard, CamXucBoard, CamXucSongBoard } from '../cam-xuc-2-5d-bang';
import React from 'react';
import { Sheet, Label, C, Contact } from './common';
import { Mirror, Hammer, MoneyEnvelope, IdentityCard, RiceBox, BunCha, XoiGac, FruitBag, Computer, LaundryBasin, Football, Scissors, Chalk } from './dao-cu';
import { LectureHall, ComputerLab, UniversityCorridor, FamilyGathering, MirrorRealm, DonationCorner, DormHallNight, RoomSunset, MiniPitch, BarberCorner, lectureSpot, corridorSpot, SET_VIEWS, type SetView } from './boi-canh';
import { SupportingActor, FormalTwin, PoseActor, EXTRA_POSES, POSE_INFO, gripAt, type Role } from './nhan-vat-va-tu-the';
import { PhonePanel, FaceComparison, LaptopScreen, type ScreenKind } from './giao-dien';
import { StudentTwinBody, StudentTwinHead } from '../nhan-vat';
import { GestureBoard, TransitionBoard } from '../cu-chi';

type Item={id:string;name:string;scenes:string[];w:number;h:number;node:()=>React.ReactNode;kind:'prop'|'set'|'cast'|'pose'|'ui'|'mirror'};
const prop=(id:string,name:string,scenes:string[],node:()=>React.ReactNode,w=440,h=330):Item=>({id,name,scenes,w,h,kind:'prop',node});
const studentPortrait=<g transform="translate(-102 -58) scale(.57)"><StudentTwinHead mood="calm" id="student-card-portrait"/></g>;
export const ASSETS:Item[]=[
 prop('bua-dong-dinh','Búa · neo tại lòng tay',['P3.03','P3.04'],()=> <g transform="translate(220 160)"><Contact y={77} rx={110}/><Hammer/></g>),
 prop('phong-bi-tien-an','Phong bì tiền ăn',['P2.03'],()=> <g transform="translate(220 165)"><Contact y={73} rx={145}/><MoneyEnvelope/></g>),
 prop('the-sinh-vien','Thẻ sinh viên hư cấu',['P2.04'],()=> <g transform="translate(220 155)"><IdentityCard portrait={studentPortrait}/></g>),
 prop('the-doi-chieu','Thẻ đối chiếu hư cấu',['P1.04','P3.03'],()=> <g transform="translate(220 155)"><IdentityCard student={false} portrait={studentPortrait}/></g>),
 prop('com-suon-trung','Cơm sườn trứng',['P2.02'],()=> <g transform="translate(220 145)"><Contact y={76} rx={165}/><RiceBox/></g>),
 prop('bun-cha-nem','Bún chả và nem',['P3.06'],()=> <g transform="translate(220 148)"><Contact y={91} rx={165}/><BunCha/></g>),
 prop('xoi-gac','Xôi gấc',['P2.07'],()=> <g transform="translate(220 152)"><Contact y={64} rx={150}/><XoiGac/></g>),
 prop('tui-hoa-qua','Túi hoa quả · neo tại quai',['P2.07','P3.06'],()=> <g transform="translate(220 46)"><Contact y={209} rx={106}/><FruitBag/></g>),
 prop('may-tinh-ban','PC · màn hình thay được',['P2.03','P2.05'],()=> <g transform="translate(220 174) scale(.72)"><Computer/></g>),
 prop('thau-quan-ao','Thau quần áo bẩn',['P2.05'],()=> <g transform="translate(220 150)"><Contact y={112} rx={145}/><LaundryBasin/></g>),
 prop('bong-da','Bóng đá mini',['P2.05'],()=> <g transform="translate(220 135)"><Contact y={86} rx={87}/><Football/></g>),
 prop('vien-phan','Viên phấn · nguyên và gãy đôi',['P3.01'],()=> <g transform="translate(220 165)"><Contact y={30} rx={120}/><Chalk/></g>),
 prop('keo-cat-toc','Kéo · góc montage',['P2.05'],()=> <g transform="translate(220 170)"><Scissors/></g>),
 {id:'giang-duong',name:'Giảng đường bậc thang · đèn trắng lạnh',scenes:['P3.01'],w:1920,h:1080,kind:'set',node:()=> <LectureHall failed><FormalTwin identity="nam" mood="scared" {...lectureSpot()}/></LectureHall>},
 {id:'lab-402',name:'Lab 402 · màn hình hạn nộp',scenes:['P2.04','P2.05'],w:1920,h:1080,kind:'set',node:()=> <ComputerLab/>},
 {id:'hanh-lang-dai-hoc',name:'Hành lang đại học',scenes:['P3.02'],w:1920,h:1080,kind:'set',node:()=> <UniversityCorridor><FormalTwin identity="nam" mood="scared" {...corridorSpot()}/></UniversityCorridor>},
 {id:'bua-com-gia-dinh',name:'Mâm cơm gia đình ở quê · clip Zalo',scenes:['P2.06'],w:1920,h:1080,kind:'set',node:()=> <FamilyGathering/>},
 {id:'san-bong-mini',name:'Sân bóng mini · montage',scenes:['P2.05'],w:1920,h:1080,kind:'set',node:()=> <MiniPitch/>},
 {id:'goc-cat-toc',name:'Góc cắt tóc · montage',scenes:['P2.05'],w:1920,h:1080,kind:'set',node:()=> <BarberCorner/>},
 {id:'the-gioi-guong',name:'Thế giới trong gương · phòng lật, mặt nước',scenes:['P3.05','P3.06'],w:1920,h:1080,kind:'set',node:()=> <MirrorRealm><FormalTwin identity="nam" mood="scared" x={1060} y={260} scale={1.08}/></MirrorRealm>},
 {id:'goc-do-cho-tang',name:'Góc đồ cho tặng · chân cầu thang sau mưa',scenes:['P1.00'],w:1920,h:1080,kind:'set',node:()=> <DonationCorner/>},
 {id:'hanh-lang-tro-dem',name:'Hành lang dãy trọ · đêm đèn tuýp',scenes:['P1.03','P1.06','P2.01'],w:1920,h:1080,kind:'set',node:()=> <DormHallNight/>},
 {id:'phong-tro-chieu-ta',name:'Phòng trọ chiều tà · lớp nắng cam',scenes:['P1.07'],w:1920,h:1080,kind:'set',node:()=> <RoomSunset t={0.35}/>},
 ...(['giang-vien','me','ba','bac-hai','sinh-vien-nam','sinh-vien-nu'] as Role[]).map(role=>({id:role,name:({'giang-vien':'Giảng viên',me:'Mẹ Nam',ba:'Bố Nam','bac-hai':'Bác Hai','sinh-vien-nam':'Bạn học nam','sinh-vien-nu':'Bạn học nữ'} as const)[role],scenes:role==='giang-vien'?['P3.01']:role.startsWith('sinh-vien')?['P3.01']:['P2.05','P2.06'],w:420,h:720,kind:'cast' as const,node:()=> <SupportingActor role={role} x={210} y={50}/> })),
 ...Object.keys(EXTRA_POSES).map(name=>({id:`tu-the-${name}`,name:name.replaceAll('-',' '),scenes:POSE_INFO[name]?[POSE_INFO[name]]:name==='giu-bua'?['P3.03','P3.04']:name==='ap-kinh'?['P3.05']:['P2.03','P2.05','P2.07'],w:480,h:720,kind:'pose' as const,node:()=> <PoseActor name={name} x={name==='ap-kinh'?190:240} y={50}/> })),
 ...(['han-bai','diem-95','me-goi','clip-gia-dinh','bao-thuc','tien-ve','khong-lam-phien'] as ScreenKind[]).map(kind=>({id:`ui-${kind}`,name:`UI · ${kind.replaceAll('-',' ')}`,scenes:kind==='diem-95'?['P2.05']:kind==='clip-gia-dinh'?['P2.06']:['P2.04','P2.05'],w:400,h:690,kind:'ui' as const,node:()=> <g transform="translate(20 25)"><PhonePanel kind={kind}/></g>})),
 {id:'doi-chieu-not-ruoi',name:'Đối chiếu dấu bên trái / phải',scenes:['P3.03'],w:940,h:380,kind:'ui',node:()=> <FaceComparison/>},
 ...[0,.25,.6,1].map((p,i)=>({id:`guong-trang-thai-${i}`,name:['Gương tĩnh','Gợn khi chạm','Mặt kính hóa nước','Phía bên trong'][i],scenes:i===0?['P1.00','P2.04']:['P3.05','P3.06'],w:400,h:720,kind:'mirror' as const,node:()=> <g transform="translate(200 674)"><Contact rx={157}/><Mirror progress={p} phase={i}><g transform="translate(140 80) scale(.74)"><StudentTwinBody identity={i===3?'nam':'nguoi-kia'} mood={i===3?'scared':'calm'} shirt={i===3?'#8a8783':'#eee9d9'}/></g>{i===3&&<rect width={280} height={640} fill="#24434a" opacity={.38}/>}</Mirror></g>})),
];

const preview=(item:Item,x:number,y:number,w:number,h:number)=><svg key={`${item.id}-${x}-${y}`} x={x} y={y} width={w} height={h} viewBox={`0 0 ${item.w} ${item.h}`} overflow="hidden">{item.node()}</svg>;
export const PropsBoard=()=> <Sheet w={1600} h={1380} title="HỒ SƠ 02 / ĐẠO CỤ BỔ SUNG" subtitle="Cartoon mềm · màu gọn · neo cầm/đặt rõ · tất cả hình mới là bản để duyệt">{ASSETS.filter(i=>i.kind==='prop').map((a,i)=>{const x=35+i%3*520,y=110+Math.floor(i/3)*250;return <g key={a.id}><rect x={x} y={y} width={497} height={231} rx={22} fill="#faf6ec"/>{preview(a,x+12,y+8,473,183)}<Label x={x+248} y={y+216} anchor="middle" size={19}>{a.name}</Label></g>;})}</Sheet>;
const SETS=()=>ASSETS.filter(i=>i.kind==='set');
export const SetsBoard=()=> <Sheet w={1600} h={110+Math.ceil(SETS().length/2)*477+10} title="HỒ SƠ 02 / BỐI CẢNH MỚI" subtitle="Mô hình 3D theo cm · góc chính của từng bối cảnh · S03 là lớp nắng đặt lên phòng gốc">{SETS().map((a,i)=>{const x=30+i%2*790,y=110+Math.floor(i/2)*477;return <g key={a.id}>{preview(a,x,y,760,427.5)}<Label x={x+14} y={y+457} size={22}>{a.name}</Label></g>;})}</Sheet>;
export const CastBoard=()=> <Sheet w={1800} h={1120} title="HỒ SƠ 02 / VAI PHỤ VÀ DÁNG DIỄN" subtitle="Dùng khớp rig gốc; tạo đầu/trang phục riêng cho vai phụ. Dáng mới mới kiểm tra tĩnh.">{ASSETS.filter(i=>i.kind==='cast').map((a,i)=><g key={a.id}>{preview(a,25+i*295,102,270,448)}<Label x={160+i*295} y={579} anchor="middle" size={20}>{a.name}</Label></g>)}<path d="M40 612H1760" stroke="#ccd1bd" strokeWidth={2}/>{ASSETS.filter(i=>i.kind==='pose'&&!i.id.startsWith('tu-the-nam-')&&!POSE_INFO[i.id.slice(7)]).map((a,i)=><g key={a.id}>{preview(a,5+i*224,655,222,373)}<Label x={116+i*224} y={1067} anchor="middle" size={16}>{a.name}</Label></g>)}</Sheet>;
export const UIBoard=()=> <Sheet w={2110} h={1060} title="HỒ SƠ 02 / MÀN HÌNH VÀ NHẬN DIỆN" subtitle="UI hư cấu · chữ là lớp riêng · chỉ clip quay trực tiếp giữ nốt ruồi như cơ thể, không lật cả màn hình">{ASSETS.filter(i=>i.kind==='ui'&&i.id!=='doi-chieu-not-ruoi').map((a,i)=><g key={a.id}>{preview(a,10+i*298,105,292,504)}<Label x={156+i*298} y={640} anchor="middle" size={19}>{a.name}</Label></g>)}<g transform="translate(80 696) scale(.9)"><FaceComparison/></g><g transform="translate(1260 676) scale(.34)"><LaptopScreen/></g><Label x={1586} y={1046} anchor="middle" size={19}>UI · laptop bài tập lớn (1920×1080)</Label></Sheet>;
export const MirrorBoard=()=> <Sheet w={1600} h={1000} title="HỒ SƠ 02 / KÍNH VÀ THẾ GIỚI PHẢN CHIẾU" subtitle="Khung gỗ đứng yên · biến dạng chỉ nằm trong kính · bốn trạng thái tĩnh, chưa chứng nhận chuyển động">{ASSETS.filter(i=>i.kind==='mirror').map((a,i)=><g key={a.id}>{preview(a,12+i*395,110,380,684)}<Label x={202+i*395} y={831} anchor="middle" size={22}>{a.name}</Label></g>)}<Label x={45} y={900} size={20} color="#697b70">Ánh xanh là lớp cảnh cuối; gương ở phần đầu phải phản chiếu bình thường.</Label><Label x={45} y={937} size={18} color="#697b70">Actor/reflection truyền riêng qua children; không phản chiếu cả SVG làm chữ và đồ thật bị đảo.</Label></Sheet>;
export const InteractionBoard=()=>{const p=EXTRA_POSES['ap-kinh'],a=gripAt(p,'L'),s=.72,x=146,y=190,floor=y+589*s;const center=x+a.x*s+100-27;return <Sheet w={1200} h={800} title="HỒ SƠ 02 / KIỂM TRA TIẾP XÚC" subtitle="Cùng một dáng · điểm neo lấy từ solveRig, không đặt đồ bằng mắt"><g transform={`translate(${center} ${floor})`}><Mirror w={200} h={480} progress={.32}/></g><PoseActor name="ap-kinh" x={x} y={y} scale={s}/><Label x={40} y={720} size={18}>Bàn tay chạm mép kính; bóng/khung có điểm đỡ trên cùng mặt sàn.</Label><g transform="translate(775 192) scale(.72)"><PoseActor name="giu-bua"/></g><Label x={680} y={720} size={18}>Búa đi theo tay; tay còn lại giữ cán ở nhịp chuẩn bị.</Label></Sheet>;};
export const ChecklistPosesBoard=()=> <Sheet w={1800} h={1150} title="HỒ SƠ 02 / DÁNG THEO CHECKLIST TIỀN KỲ" subtitle="Mã pose theo CHECKLIST-TIEN-KY-ASSET mục 3 · Nam áo xanh · Người Kia áo xám · Tùng đồ đá bóng · mới duyệt tĩnh">{ASSETS.filter(i=>i.kind==='pose'&&POSE_INFO[i.id.slice(7)]).map((a,i)=>{const x=20+i%6*295,y=110+Math.floor(i/6)*510;return <g key={a.id}>{preview(a,x,y,285,428)}<Label x={x+142} y={y+462} anchor="middle" size={18}>{a.scenes[0]} · {a.name}</Label></g>;})}</Sheet>;
export const RestPosesBoard=()=> <Sheet w={2000} h={1030} title="NAM / DÁNG CHƠI GAME VÀ NGHỈ" subtitle="Hai tay giữ máy ngang · ngồi có ghế đỡ · nằm có nệm/gối, máy từ trần nhìn xuống · giữ tóc Nam cũ">
 {['choi-game','nam-choi-game','suy-sup','nam-nhin-tran'].map((id,i)=>{const a=ASSETS.find(a=>a.id===`tu-the-${id}`)!;return <g key={id}><rect x={18+i*495} y={118} width={480} height={805} rx={22} fill="#faf6ed"/>{preview(a,18+i*495,139,480,720)}<Label x={258+i*495} y={890} anchor="middle" size={23}>{({'choi-game':'Ngồi chơi game','nam-choi-game':'Nằm chơi game','suy-sup':'Suy sụp','nam-nhin-tran':'Nằm nhìn lên trần'} as Record<string,string>)[id]}</Label></g>;})}
 <Label x={35} y={986} size={20}>Key pose tĩnh để duyệt; chưa phải diễn hoạt. Không xoay ngang rig đứng để thay cho dáng nằm.</Label>
 </Sheet>;
export const StoryEmotionBoard=({page}:{page:number})=><Sheet w={1800} h={1280} title="NAM / NGƯỜI KIA · BIỂU CẢM THEO CỐT TRUYỆN" subtitle="Mức 1: thoáng · mức 2: rõ · mức 3: cao trào. Giữ tóc, màu da, mũi và nốt ruồi của nhân vật.">
 {STORY_GROUPS.slice(page*3,page*3+3).map((group,row)=>[1,2,3].map(n=>{const x=25+(n-1)*590,y=120+row*365,key=`${group.id}-0${n}` as StoryFaceKey;return <g key={key}><rect x={x} y={y} width={570} height={345} rx={22} fill="#faf6ed"/><StudentTwinHead x={x+278} y={y+22} scale={1.25} face={key} identity={group.id==='cuoi-che-giau'||group.id==='khinh-thuong'?'nguoi-kia':'nam'} mood="calm"/><Label x={x+24} y={y+286} size={23}>{group.name} · mức {n}</Label><Label x={x+24} y={y+319} size={17}>{group.levels[n-1]}</Label></g>;}))}
 <Label x={30} y={1260} size={17}>Ghép tĩnh để kiểm tra, chưa duyệt motion. Không dùng nét lạnh/cười lệch của Người Kia sớm trong truyện.</Label>
 </Sheet>;
const ANGLE_SETS:{name:string;node:(v:SetView)=>React.ReactNode}[]=[
 {name:'Giảng đường',node:v=> <LectureHall failed view={v}/>},
 {name:'Lab 402',node:v=> <ComputerLab view={v}/>},
 {name:'Hành lang đại học',node:v=> <UniversityCorridor view={v}/>},
 {name:'Mâm cơm gia đình',node:v=> <FamilyGathering view={v}/>},
 {name:'Sân bóng mini',node:v=> <MiniPitch view={v}/>},
 {name:'Góc cắt tóc',node:v=> <BarberCorner view={v}/>},
 {name:'Góc đồ cho tặng',node:v=> <DonationCorner view={v}/>},
 {name:'Hành lang trọ đêm',node:v=> <DormHallNight view={v} flicker={v==='cheo'?0.25:1}/>},
];
const VIEW_NAME:Record<SetView,string>={chinh:'Góc chính',nguoc:'Ngược góc',cheo:'Chéo bên',cao:'Góc cao'};
/** Bảng bối cảnh nhiều góc: mỗi hàng một cảnh, bốn góc máy đặt sẵn. Người phẳng chỉ vẽ một mặt tự ẩn ở góc nhìn thấy mặt sau. */
export const MultiAngleBoard=()=> <Sheet w={2000} h={110+ANGLE_SETS.length*310+20} title="HỒ SƠ 02 / BỐI CẢNH NHIỀU GÓC" subtitle="Cùng một mô hình 3D, bốn camera đặt sẵn (view: chinh · nguoc · cheo · cao). Người phẳng một mặt tự ẩn ở góc nhìn thấy mặt sau.">
 {ANGLE_SETS.map((set,r)=>SET_VIEWS.map((v,c)=>{const x=20+c*492,y=110+r*310;return <g key={set.name+v}><svg x={x} y={y} width={480} height={270} viewBox="0 0 1920 1080" overflow="hidden">{set.node(v)}</svg><Label x={x+4} y={y+294} size={18}>{set.name} · {VIEW_NAME[v]}</Label></g>;}))}
</Sheet>;
/** S03: bốn mốc của lớp nắng cam (t = 0 → 1) trên cùng góc toàn phòng. */
export const SunsetBoard=()=> <Sheet w={2000} h={1290} title="HỒ SƠ 02 / PHÒNG TRỌ CHIỀU TÀ (S03)" subtitle="LIGHT_LAYER tách riêng: vệt nắng cam trườn từ mép bàn qua nệm, leo lên tường rồi tắt · prop t của RoomSunset / SunsetLight">
 {[0,0.35,0.7,0.95].map((t,i)=>{const x=20+i%2*990,y=110+Math.floor(i/2)*585;return <g key={t}><svg x={x} y={y} width={960} height={540} viewBox="0 0 1920 1080" overflow="hidden"><RoomSunset t={t}/></svg><Label x={x+4} y={y+568} size={20}>t = {t}</Label></g>;})}
</Sheet>;
export const BOARDS=[{id:'bang-cam-xuc-01',node:()=> <CamXucBoard page={0}/>,w:1800,h:1950},{id:'bang-cam-xuc-02',node:()=> <CamXucBoard page={1}/>,w:1800,h:1950},{id:'bang-cam-xuc-03',node:CamXucAnhSangBoard,w:1720,h:1360},{id:'bang-cam-xuc-04',node:CamXucSongBoard,w:1840,h:990},{id:'bang-cu-chi',node:GestureBoard,w:1500,h:2140},{id:'bang-chuyen-trang-thai',node:TransitionBoard,w:1560,h:2050},{id:'bang-dang-nghi',node:RestPosesBoard,w:2000,h:1030},{id:'bang-dang-checklist',node:ChecklistPosesBoard,w:1800,h:1150},{id:'bang-dao-cu',node:PropsBoard,w:1600,h:1380},{id:'bang-boi-canh',node:SetsBoard,w:1600,h:110+Math.ceil(SETS().length/2)*477+10},{id:'bang-vai-phu-tu-the',node:CastBoard,w:1800,h:1120},{id:'bang-giao-dien',node:UIBoard,w:2110,h:1060},{id:'bang-guong',node:MirrorBoard,w:1600,h:1000},{id:'bang-tiep-xuc',node:InteractionBoard,w:1200,h:800},{id:'bang-boi-canh-nhieu-goc',node:MultiAngleBoard,w:2000,h:110+ANGLE_SETS.length*310+20},{id:'bang-nang-chieu-ta',node:SunsetBoard,w:2000,h:1290}];
