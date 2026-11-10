import React from 'react';
import {StudentTwinHead} from '../nhan-vat';
const views = [
  {view:'front',facing:1,label:'CHÍNH DIỆN'},
  {view:'three',facing:1,label:'GÓC 3/4'},
  {view:'side',facing:1,label:'NGHIÊNG PHẢI'},
  {view:'side',facing:-1,label:'NGHIÊNG TRÁI'},
] as const;
/** Design comparison only; not a shot revealing the clue in the story. */
export function MirrorMarkBoard(){return <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1040" viewBox="0 0 1600 1040">
  <rect width="1600" height="1040" fill="#f6f1e8"/>
  <g fontFamily="Arial,sans-serif" fill="#282b2b" textAnchor="middle">
    <text x={800} y={48} fontSize={28} fontWeight={700}>HỒ SƠ 2 · DẤU NHẬN DẠNG PHẢN CHIẾU</text>
    <text x={800} y={82} fontSize={18}>So ở cùng góc nhìn · Nam giữ dấu trái, Người Kia đổi sang phải</text>
    {(['nam','nguoi-kia'] as const).map((identity,row)=><g key={identity}>
      <text x={800} y={130+row*440} fontSize={22} fontWeight={700}>{row===0?'NAM — dấu gốc':'NGƯỜI KIA — dấu đối bên'}</text>
      {views.map(({view,facing,label},i)=><g key={label}>
        <g transform={`translate(${200+i*400} ${160+row*440}) scale(${facing*1.65} 1.65)`}>
          <StudentTwinHead identity={identity} view={view} facing={facing} mood="calm" id={`${identity}-${view}-${facing}`}/>
        </g>
        <text x={200+i*400} y={490+row*440} fontSize={18}>{label}</text>
      </g>)}
    </g>)}
    <text x={800} y={995} fontSize={17} fill="#69776c">Ảnh soi thiết kế: khi lên phim không phóng to nốt ruồi hoặc gắn nhãn thật/giả ở cảnh đầu.</text>
  </g>
</svg>}
