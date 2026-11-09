import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {POSES,POSE_LABELS,StudentRig,blendPose,sampleWalk,type Cast} from './rig';

function Preview(){
  const [cast,setCast]=useState<Cast>('nam'),[pose,setPose]=useState('stand');
  const [amount,setAmount]=useState(1),[phase,setPhase]=useState(0),[debug,setDebug]=useState(false);
  const p=pose==='walk'?sampleWalk(phase):blendPose(POSES[pose],POSES[pose],1);
  // A separate slider tests a safe same-topology standing → wary transition.
  const shown=pose==='wary'?blendPose(POSES.stand,POSES.wary,amount):p;
  return <main><header><h1>Tư thế & khớp V3 — Hồ sơ 02</h1><p>Nam · Người Kia · Tùng — dùng lại đầu và bảng màu từ bộ nhân vật trong repo.</p></header>
    <section className="controls"><label>Nhân vật <select value={cast} onChange={e=>setCast(e.target.value as Cast)}><option value="nam">Nam</option><option value="nguoi-kia">Người Kia</option><option value="tung">Tùng</option></select></label>
      <label>Tư thế <select value={pose} onChange={e=>setPose(e.target.value)}>{Object.keys(POSES).map(k=><option key={k} value={k}>{POSE_LABELS[k]}</option>)}<option value="walk">Chu kỳ bước tại chỗ</option></select></label>
      <label><input type="checkbox" checked={debug} onChange={e=>setDebug(e.target.checked)}/> Hiện khớp</label>
      {pose==='wary'&&<label>Đứng → dè chừng <input aria-label="Mức chuyển tư thế" type="range" min="0" max="1" step="0.01" value={amount} onChange={e=>setAmount(+e.target.value)}/></label>}
      {pose==='walk'&&<label>Pha bước <input aria-label="Pha bước" type="range" min="0" max="1" step="0.01" value={phase} onChange={e=>setPhase(+e.target.value)}/></label>}
    </section>
    <svg viewBox="-260 -35 520 660" role="img" aria-label="Nhân vật với tư thế đã chọn"><rect x="-260" y="-35" width="520" height="660" fill="#f6f1e8"/><StudentRig cast={cast} pose={shown} debug={debug} showSupport/></svg>
    <p className="note">Mẫu rig và tư thế để duyệt. Kéo thanh pha để soi chuyển động; không tự chạy phim. Chưa gắn lời thoại, khẩu hình, mặt bàn/bồn rửa hoặc đường đi trong cảnh.</p>
    <p><a href="ban-tay-ro-net.svg">Soi từng dáng bàn tay</a> · <a href="can-doi-chan.svg">Kiểm tra độ cân hai chân</a> · <a href="chi-tiet-khop.svg">Soi vai, cổ tay và chiều bàn tay</a> · <a href="doi-chieu-mau-goc.svg">Đối chiếu mẫu gốc / bản sửa</a> · <a href="tu-the-khop.svg">Xem bảng 12 tư thế</a> · <a href="RIG-NHAN-VAT.md">Hướng dẫn bàn giao Claude</a></p>
  </main>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
