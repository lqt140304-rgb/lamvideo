import React from 'react';
import { C, Label, clamp, uid } from './common';

/*
 * Đạo cụ bổ sung — đại tu 11/11/2026 theo quy tắc "bóng là mảng tự vẽ" (PHONG-CACH-MY-THUAT.md):
 * khối 3D đọc bằng mặt phẳng tô sắc độ khác nhau (mặt trên sáng, mặt trước vừa, mặt hông/mép dày tối),
 * 1–3 mảng bóng vẽ tay ở chỗ khuất/chỗ chồng, một điểm sáng nhỏ và bóng tiếp xúc phẳng. Nguồn sáng chung: trên–trái.
 * Không dùng filter, gradient hay mask để tạo bóng. Kích thước, điểm neo và props giữ như bản trước.
 */
const SH = '#2c362f'; // màu bóng tiếp xúc/bóng đổ, dùng với opacity phẳng
const Contact = ({ cx = 0, cy = 0, rx, ry, dx = 10, op = 0.2 }: { cx?: number; cy?: number; rx: number; ry: number; dx?: number; op?: number }) => (
  <g data-layer="contact-shadow">
    <ellipse cx={cx + dx} cy={cy} rx={rx} ry={ry} fill={SH} opacity={op * 0.55} />
    <ellipse cx={cx + dx * 0.4} cy={cy - ry * 0.15} rx={rx * 0.82} ry={ry * 0.62} fill={SH} opacity={op} />
  </g>
);

/** Local origin is the palm grip, not the head of the hammer. */
export const Hammer = () => (
  <g data-layer="hammer" data-anchor="grip:0,0">
    {/* cán gỗ: thân + mảng tối bên phải + vệt sáng bên trái */}
    <path d="M-10-99Q0-107 10-99L8 70Q0 79-8 70Z" fill="#a88255" />
    <path d="M3-96Q8-96 10-99L8 70Q4 76 1 74Z" fill="#7a5a3e" />
    <path d="M-6-94L-4-94-3 62-5 63Z" fill="#c9a47a" />
    <path d="M-5 18L4 22M-5 33L4 37" stroke="#6b4f39" strokeWidth={1.5} fill="none" />
    {/* bóng đầu búa đổ xuống cán */}
    <path d="M-10-99Q0-104 10-99L9-86Q0-90-9-86Z" fill="#5f4632" />
    {/* đầu búa: mặt trước, mặt trên sáng, mặt đáy tối, đầu nện */}
    <path d="M-50-119Q-53-129-43-131L20-127 48-136 45-121 31-107 12-106-42-109Q-50-109-50-119Z" fill="#778184" />
    <path d="M-44-131L19-127 47-136 42-131 18-123-44-126Z" fill="#b7bdb9" />
    <path d="M-42-109L12-106 31-107 34-112 11-111-43-114Z" fill="#525d60" />
    <path d="M-47-132Q-56-129-53-111L-46-108-40-112-40-128Z" fill="#59666a" />
    <path d="M-52-127Q-51-130-48-131L-47-115-51-114Z" fill="#8d979a" />
    <ellipse cx={-30} cy={-126} rx={9} ry={1.6} fill="#e3e8e3" />
  </g>
);

export const MoneyEnvelope = ({ open = true }: { open?: boolean }) => (
  <g data-layer="money-envelope">
    <Contact cy={74} rx={128} ry={11} />
    {/* lòng phong bì phía sau (tối) */}
    <path d="M-122-54Q-128-70-115-75L0-119 115-75Q128-70 122-54Z" fill="#b89f78" />
    <path d="M-110-62L0-104 110-62Z" fill="#a38a65" />
    {open && (
      <g>
        <rect x={-98} y={-88} width={190} height={90} rx={8} fill="#9bbaae" />
        <rect x={-90} y={-76} width={172} height={64} rx={5} fill="#c4d7c4" />
        <path d="M-98-88H92V-80H-98Z" fill="#b6cfc0" />
        <circle cx={51} cy={-45} r={18} fill="#a8c5b2" />
        <Label x={-77} y={-41} size={19} color="#496d5d">TIỀN ĂN</Label>
        <path d="M-83-25H15" stroke="#7f9d85" strokeWidth={3} />
        {/* bóng mép phong bì phủ lên tờ tiền */}
        <path d="M-98-10H92V2H-98Z" fill="#6f8f80" opacity={0.55} />
      </g>
    )}
    {/* mặt trước */}
    <path d="M-125-55Q-124-65-112-64H113Q125-64 125-53L121 69Q0 82-121 69Z" fill="#e1c9a4" />
    {/* nếp gấp tam giác dưới và hai bên: mỗi mặt một sắc độ */}
    <path d="M-121 69L-36 4 0 24 36 4 121 69Q0 82-121 69Z" fill="#d4b98f" />
    <path d="M122-52L36 4 121 69Z" fill="#c9ad82" />
    <path d="M-122-52L-36 4-121 67Z" fill="#e8d3b1" />
    <path d="M-122-52L0 24 122-52M-120 67L-36 4M120 67L36 4" fill="none" stroke="#b39368" strokeWidth={2} />
    <path d="M-112-62H110" stroke="#f3e2c4" strokeWidth={3} />
    <Label x={0} y={58} size={17} anchor="middle">3.000.000 đ · minh họa</Label>
  </g>
);

export const IdentityCard = ({ student = true, portrait }: { student?: boolean; portrait?: React.ReactNode }) => {
  const id = uid();
  const band = student ? C.jadeDark : C.blueDark;
  return (
    <g data-layer="identity-card">
      <defs><clipPath id={id}><rect x={-137} y={-42} width={75} height={91} rx={5} /></clipPath></defs>
      <Contact cx={6} cy={112} rx={165} ry={9} op={0.16} />
      {/* bề dày thẻ: mép dưới/phải lệch xuống */}
      <rect x={-163} y={-95} width={334} height={207} rx={15} fill="#b9b9ac" />
      <rect x={-167} y={-100} width={334} height={207} rx={15} fill={C.white} />
      <rect x={-167} y={-100} width={334} height={41} rx={15} fill={band} />
      <path d="M-167-77H167V-59H-167Z" fill={band} />
      <Label x={0} y={-74} size={18} anchor="middle" color={C.white}>{student ? 'THẺ SINH VIÊN' : 'THẺ NHÂN VẬT · HƯ CẤU'}</Label>
      <rect x={-137} y={-42} width={75} height={91} rx={5} fill="#c5d2cb" />
      <g clipPath={`url(#${id})`}>{portrait}</g>
      {/* ảnh dán hơi lõm: mép trên tối */}
      <path d="M-137-42H-62V-37H-137Z" fill="#8fa49a" opacity={0.6} />
      <Label x={-42} y={-21} size={22}>NAM</Label>
      <Label x={-42} y={7} size={15}>{student ? 'Sinh viên năm 2' : 'Dùng đối chiếu khuôn mặt'}</Label>
      <Label x={-42} y={33} size={13} color="#73837c">HS02 · DỮ LIỆU HƯ CẤU</Label>
      {Array.from({ length: 24 }, (_, i) => <rect key={i} x={-136 + i * 9} y={67} width={i % 3 === 0 ? 4 : 2} height={16} fill="#5e7167" />)}
      <path d="M123-39q22 19 0 38m-8-31q14 12 0 25" stroke="#96aea1" fill="none" strokeWidth={3} />
      {/* vệt sáng phẳng vắt chéo mặt nhựa */}
      <path d="M40-56L84-56 30 104H-14Z" fill="#ffffff" opacity={0.12} />
    </g>
  );
};

export const RiceBox = () => (
  <g data-layer="rice-box">
    <Contact cy={74} rx={160} ry={14} />
    {/* thành hộp giấy: mặt ngoài trước tối hơn, mép trên sáng */}
    <path d="M-143-25Q-159-30-159-9L-145 64Q-5 93 143 64L157-9Q158-28 142-25Z" fill="#cfc9b3" />
    <path d="M-150 20L-145 64Q-5 93 143 64L148 20Q0 50-150 20Z" fill="#b9b39c" />
    <path d="M-144-26Q0-61 144-26L143 40Q0 73-143 40Z" fill="#f7f2df" />
    {/* thành trong phía xa đổ bóng lên cơm */}
    <path d="M-144-26Q0-61 144-26L138-14Q0-44-139-14Z" fill="#ddd6bf" />
    <path d="M-137-20Q-71-42-8-29L-9 38Q-72 57-135 31Z" fill="#fff8e4" />
    {Array.from({ length: 32 }, (_, i) => <ellipse key={i} cx={-121 + (i * 23) % 106} cy={-13 + (i * 17) % 48} rx={4} ry={1.8} transform={`rotate(${i % 2 ? 25 : -18})`} fill="#ddd6bc" />)}
    {/* sườn: mặt trên + mảng tối dưới, bóng đổ lên cơm */}
    <path d="M14 18Q40 30 120 0L127 4Q105 30 51 32L10 22Z" fill="#c8bf9f" opacity={0.7} />
    <path d="M8-8Q35-42 100-30L127-8Q105 22 51 26L9 16Z" fill="#a86b44" />
    <path d="M9 6Q50 18 127-8Q105 22 51 26L9 16Z" fill="#7d4c30" />
    <path d="M20-4Q63-22 112-11M23 9Q65-7 109 1" stroke="#774b32" strokeWidth={6} fill="none" />
    <path d="M30-16Q60-30 96-24" stroke="#c98a5a" strokeWidth={3} fill="none" />
    {/* trứng: lòng trắng có mép dày, lòng đỏ có điểm sáng */}
    <ellipse cx={88} cy={30} rx={44} ry={22} fill="#e2d9bf" />
    <ellipse cx={86} cy={27} rx={44} ry={22} fill="#fcf5df" />
    <ellipse cx={88} cy={25} rx={20} ry={16} fill="#dda63f" />
    <path d="M88 41Q105 38 107 25Q104 36 88 38Z" fill="#b9802a" />
    <ellipse cx={81} cy={19} rx={5} ry={3} fill="#f6d68a" />
    <path d="M-3 38Q0 15 23 25L33 44Z" fill="#70976b" />
    <path d="M10 40L33 44 23 30Z" fill="#557a52" />
    <path d="M-150 52Q0 84 150 52" stroke="#a9ab97" strokeWidth={2} fill="none" />
  </g>
);

export const BunCha = () => (
  <g data-layer="bun-cha">
    <Contact cx={-56} cy={56} rx={104} ry={12} />
    <Contact cx={101} cy={78} rx={62} ry={9} />
    {/* đĩa bún: vành dày + mặt đĩa */}
    <ellipse cx={-56} cy={19} rx={102} ry={43} fill="#c4c6b6" />
    <ellipse cx={-56} cy={8} rx={105} ry={39} fill="#f9f4df" />
    <ellipse cx={-56} cy={10} rx={84} ry={28} fill="#ede7d0" />
    {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${-133 + i * 9} 4q42-26 81 1q-36 25-75 13`} stroke={i % 2 ? '#e3dec9' : '#fffbee'} strokeWidth={5} fill="none" />)}
    <path d="M-120 22Q-70 38-20 22" stroke="#d6cfb6" strokeWidth={6} fill="none" opacity={0.8} />
    {/* bát nước chấm: thân bát hai mặt, lòng bát có vành bóng phía xa */}
    <path d="M42 12Q48 75 101 75Q151 75 160 12Z" fill="#c2d1c5" />
    <path d="M118 12Q140 60 101 75Q151 75 160 12Z" fill="#a3b6a8" />
    <ellipse cx={101} cy={12} rx={59} ry={26} fill="#e0b06b" />
    <ellipse cx={101} cy={10} rx={49} ry={19} fill="#a56d43" />
    <path d="M52 8Q101-14 150 8Q101-6 52 8Z" fill="#7a4b2c" />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <ellipse cx={75 + i * 22} cy={8 + (i % 2) * 9} rx={14} ry={8} fill="#5b3d29" opacity={0.6} />
        <ellipse cx={75 + i * 22} cy={5 + (i % 2) * 9} rx={14} ry={8} fill="#76533a" />
        <path d={`M${67 + i * 22} ${3 + (i % 2) * 9}l13 4`} stroke="#ca9c69" strokeWidth={2} />
      </g>
    ))}
    <ellipse cx={72} cy={4} rx={6} ry={2} fill="#f4d6a2" opacity={0.7} />
    <path d="M58-5q-4-18 14-8M116-3q14-16 22-6" stroke="#71916a" strokeWidth={7} fill="none" />
    {/* nem: mặt trên vàng + đáy cháy sẫm */}
    <g transform="translate(-5 52) rotate(-13)">
      <rect x={-38} y={-15} width={79} height={24} rx={10} fill="#bc8c48" />
      <path d="M-36 2Q0 12 39 2V3Q39 9 31 9H-28Q-38 9-37 1Z" fill="#8c6330" />
      <path d="M-28-9L29 4M-9-10L36-1" stroke="#e1bc77" strokeWidth={3} />
    </g>
    <path d="M-146-31Q-130-60-110-29Q-90-59-80-25L-132-14Z" fill="#73936b" />
    <path d="M-110-29Q-98-40-80-25L-104-20Z" fill="#587a52" />
  </g>
);

export const XoiGac = () => (
  <g data-layer="xoi-gac">
    <Contact cy={70} rx={140} ry={12} />
    <ellipse cx={0} cy={37} rx={139} ry={39} fill="#bfc9b9" />
    <ellipse cx={0} cy={26} rx={137} ry={35} fill="#f3ecdb" />
    <ellipse cx={0} cy={28} rx={116} ry={26} fill="#e6dfca" />
    {/* khối xôi: thân + mảng tối bên phải dưới + mặt trên sáng */}
    <path d="M-111 10Q-112-49-52-62Q0-89 58-60Q112-46 112 10Q0 57-111 10Z" fill="#bd653a" />
    <path d="M60-56Q112-42 112 10Q60 38 10 36Q70 10 60-56Z" fill="#9a4b28" />
    <path d="M-104-1Q-83-55-23-61Q40-73 97-18Q31 17-104-1Z" fill="#d7894d" />
    <path d="M-70-40Q-30-62 20-60Q-20-50-62-30Z" fill="#e7a66b" />
    {Array.from({ length: 51 }, (_, i) => <ellipse key={i} cx={-89 + (i * 41) % 173} cy={-42 + (i * 23) % 64} rx={3.3} ry={1.6} fill={i % 3 ? '#e3a261' : '#a95030'} />)}
    <path d="M-100 16Q0 46 104 14Q0 52-100 16Z" fill="#b8b09a" opacity={0.6} />
  </g>
);

/** Hand sits at (0,0); handles meet it and the weight hangs below. */
export const FruitBag = () => (
  <g data-layer="fruit-bag" data-anchor="grip:0,0">
    <path d="M-54 90Q-51 15 0 0Q53 13 55 90" stroke="#b7a98a" strokeWidth={8} fill="none" />
    <path d="M-50 88Q-48 22 -2 6" stroke="#cfc2a3" strokeWidth={2.5} fill="none" />
    {/* lòng túi phía sau tối */}
    <path d="M-79 78Q-96 111-72 190Q0 213 74 190Q96 111 78 78Z" fill="#c4b192" />
    <path d="M-76 82Q0 98 76 82L74 100Q0 116-74 100Z" fill="#a8946f" />
    {/* quả: thân + mảng tối nửa dưới phải + điểm sáng */}
    {([[-36, 91, 29, '#bb8950', '#946a39'], [17, 89, 31, '#c49a4e', '#9b7634'], [49, 111, 25, '#9b9a59', '#77763e']] as const).map(([x, y, r, c, d], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={r} fill={c} />
        <path d={`M${x + r} ${y}A${r} ${r} 0 0 1 ${x - r * 0.6} ${y + r * 0.8}Q${x + r * 0.5} ${y + r * 0.4} ${x + r} ${y}Z`} fill={d} />
        <ellipse cx={x - r * 0.35} cy={y - r * 0.4} rx={r * 0.22} ry={r * 0.14} fill="#fff4d8" opacity={0.75} />
      </g>
    ))}
    <path d="M9 60q20-26 33-15q-5 19-33 15" fill="#6c8759" />
    <path d="M24 56q12-6 18-11q-5 19-33 15z" fill="#526b44" />
    {/* mặt túi trước: nửa trái sáng, mép phải và đáy tối, nếp nhăn */}
    <path d="M-76 113Q0 154 77 113L73 190Q0 212-73 190Z" fill="#d9c7a7" />
    <path d="M30 140Q60 132 77 113L73 190Q55 198 34 201Q44 170 30 140Z" fill="#bfa982" />
    <path d="M-73 178Q0 200 73 178L73 190Q0 212-73 190Z" fill="#b39d78" />
    <path d="M-43 164Q0 176 40 164M-50 135Q-40 160-46 182" stroke="#b49972" strokeWidth={2} fill="none" />
  </g>
);

export const Computer = ({ screen }: { screen?: React.ReactNode }) => (
  <g data-layer="computer">
    <Contact cy={86} rx={82} ry={8} op={0.22} />
    <Contact cx={-20} cy={168} rx={175} ry={12} op={0.18} />
    <Contact cx={194} cy={176} rx={28} ry={6} op={0.22} />
    {/* chân đế: cổ hai mặt, đế có mặt trên */}
    <path d="M-15 0H15L22 71H-23Z" fill="#586566" />
    <path d="M5 0H15L22 71H9Z" fill="#414d4e" />
    <path d="M-66 71Q0 52 68 71L70 82H-68Z" fill="#475654" />
    <path d="M-62 71Q0 58 64 71Z" fill="#6c7b78" />
    {/* màn hình: bề dày lưng lệch phải-dưới, viền, mặt kính */}
    <rect x={-175} y={-204} width={362} height={229} rx={16} fill="#22312e" />
    <rect x={-181} y={-210} width={362} height={229} rx={16} fill="#334743" />
    <rect x={-168} y={-197} width={336} height={193} rx={8} fill="#b5c7bd" />
    {screen}
    <path d="M60-197H120L30-4H-30Z" fill="#ffffff" opacity={screen ? 0.06 : 0.14} />
    <path d="M-174-206H174" stroke="#4a605b" strokeWidth={3} />
    {/* bàn phím: mặt trên + mép trước tối */}
    <path d="M-160 117H113L143 164H-186Z" fill="#66756d" />
    <path d="M-186 164H143L141 172H-184Z" fill="#46534c" />
    {Array.from({ length: 4 }, (_, j) => <g key={j}>{Array.from({ length: 12 }, (_, i) => (
      <g key={i}>
        <rect x={-150 + i * 20 - j * 5} y={125 + j * 9} width={15} height={5} rx={1.8} fill="#8e9a8c" />
        <rect x={-150 + i * 20 - j * 5} y={123 + j * 9} width={15} height={5} rx={1.8} fill="#c0c9b8" />
      </g>
    ))}</g>)}
    {/* chuột: thân + nửa phải tối + điểm sáng */}
    <ellipse cx={194} cy={145} rx={24} ry={33} fill="#76847a" />
    <path d="M206 117Q218 140 210 168Q200 178 190 178Q214 150 206 117Z" fill="#59665c" />
    <ellipse cx={186} cy={128} rx={6} ry={9} fill="#a9b6aa" />
    <path d="M194 113V130" stroke="#455951" strokeWidth={2} />
  </g>
);

export const Blackboard = ({ failed = false }: { failed?: boolean }) => (
  <g>
    {/* khung gỗ có bề dày, bóng đổ xuống tường, máng phấn nổi */}
    <rect x={8} y={10} width={480} height={240} rx={12} fill={SH} opacity={0.18} />
    <rect width={480} height={240} rx={12} fill="#45655b" />
    <path d="M0 12Q0 0 12 0H468Q480 0 480 12V18H0Z" fill="#5c7d72" />
    <rect x={9} y={9} width={462} height={222} rx={7} fill="#3a574e" />
    <path d="M9 9H471V24H9Z" fill="#2f4941" />
    <Label x={28} y={45} size={23} color="#f1eedb">THẢO LUẬN · BÀI TẬP LỚN</Label>
    <path d="M35 74H440" stroke="#bacdc1" strokeWidth={2} />
    <Label x={31} y={113} size={19} color="#e3e8d8">Vấn đề → Phương án → Kiểm chứng</Label>
    <path d="M55 153h78m20 0h76m22 0h92m-219-8 12 8-12 8m98-16 12 8-12 8" stroke="#b5cabc" strokeWidth={3} fill="none" />
    <Label x={31} y={210} size={24} color={failed ? '#edb395' : '#e5e4ca'}>{failed ? 'Cần giải thích lập luận' : 'Nhóm 04 · Nam'}</Label>
    <path d="M20 236H460L468 248H12Z" fill="#a6896a" />
    <path d="M12 248H468V254H12Z" fill="#7e6750" />
    <rect x={380} y={238} width={26} height={6} rx={3} fill="#f1eedb" />
  </g>
);

export const LaundryBasin = () => (
  <g data-layer="laundry-basin">
    <Contact cy={104} rx={150} ry={14} />
    {/* thân thau: hai sắc độ theo độ cong (trái sáng, phải tối), vành dày */}
    <path d="M-143-7Q-142 84-100 96Q0 125 106 95Q143 75 146-7Z" fill="#739992" />
    <path d="M40-7H146Q143 75 106 95Q70 108 30 112Q70 60 40-7Z" fill="#5a7f78" />
    <path d="M-130 10Q-128 60-104 80" stroke="#97b9b0" strokeWidth={8} fill="none" />
    <ellipse cy={-8} rx={145} ry={45} fill="#a7c5b6" />
    <ellipse cy={-8} rx={130} ry={33} fill="#507a74" />
    <path d="M-130-8Q0-50 130-8Q0-34-130-8Z" fill="#3c625c" />
    {/* quần áo: mỗi khối có mảng tối nơi chồng lên nhau */}
    <path d="M-113-4Q-111-76-62-68L-32-47 6-69Q46-72 61-32L30 21-66 22Z" fill="#afa38d" />
    <path d="M-20 0Q10-20 30 21L-66 22Q-40 10-20 0Z" fill="#8f846f" />
    <path d="M-7 3Q-4-67 41-56L76-25 101-46Q128-31 115 12L71 28Z" fill="#72908a" />
    <path d="M60 10Q90 0 115 12L71 28Z" fill="#587670" />
    <path d="M-74-40Q-52-6-27-29M26-30L48-5M81-19L90 3" stroke="#576e65" strokeWidth={3} fill="none" />
    <path d="M-138-4Q0 62 141-4" stroke="#b6d2be" strokeWidth={8} fill="none" />
    <path d="M-120 2Q-60 30 -10 34" stroke="#d6e8dc" strokeWidth={3} fill="none" />
    <path d="M-116 42Q0 86 118 42" stroke="#587c74" strokeWidth={2} fill="none" />
  </g>
);

export const Football = () => (
  <g data-layer="football">
    <Contact cy={86} rx={70} ry={10} dx={14} op={0.24} />
    <circle r={85} fill="#e4e6d7" />
    <path d="M-13-29L25-35 46-2 20 24-17 12Z" fill="#5c7266" />
    <path d="M-73-45L-47-70-25-73-17-51-39-31Z M-72 21L-54 49-68 52-82 26Z M-8 73L25 68 43 45 60 52 35 78Z M69-41L81-19 76 8 59 0 51-26Z" fill="#65796c" />
    <path d="M-13-29L-25-73M25-35L51-26M46-2L59 0M20 24L43 45M-17 12L-54 49M-39-31L-17 12" stroke="#aebdad" strokeWidth={2.2} fill="none" />
    {/* mảng tối hình lưỡi liềm phía dưới–phải, đặt trên múi để quả bóng tròn khối */}
    <path d="M78-34A85 85 0 0 1-60 60Q30 70 78-34Z" fill="#2f3d35" opacity={0.28} />
    <ellipse cx={-34} cy={-46} rx={20} ry={11} transform="rotate(-35 -34 -46)" fill="#ffffff" opacity={0.55} />
  </g>
);

export const Scissors = () => (
  <g data-layer="scissors">
    {/* bóng đổ phẳng lệch phải–dưới */}
    <g transform="translate(9 8)" fill={SH} opacity={0.18}>
      <path d="M-10-16L-25-131Q-11-132-4-99L9-18Z M10-16L58-125Q68-120 54-91L22-10Z" />
      <ellipse cx={-11} cy={23} rx={25} ry={31} />
      <ellipse cx={35} cy={26} rx={25} ry={31} />
    </g>
    <path d="M-10-16L-25-131Q-11-132-4-99L9-18Z M10-16L58-125Q68-120 54-91L22-10Z" fill="#8e9e98" />
    {/* mỗi lưỡi hai mặt vát: nửa sáng, nửa tối */}
    <path d="M-25-131Q-17-131-13-117L1-18H9L-4-99Q-11-132-25-131Z" fill="#6c7c76" />
    <path d="M58-125Q68-120 54-91L22-10H16L52-104Q60-117 58-125Z" fill="#6c7c76" />
    <path d="M-7-16L-20-111M17-16L54-111" stroke="#d8e2d8" strokeWidth={2} />
    <circle cx={7} cy={-10} r={8} fill="#6b8074" />
    <circle cx={5} cy={-12} r={3} fill="#b9c9bd" />
    <ellipse cx={-11} cy={23} rx={21} ry={27} fill="none" stroke="#536e62" strokeWidth={9} />
    <ellipse cx={35} cy={26} rx={21} ry={27} fill="none" stroke="#536e62" strokeWidth={9} />
    <path d="M-30 30A21 27 0 0 0 4 42M16 33A21 27 0 0 0 50 45" stroke="#3c5449" strokeWidth={9} fill="none" />
    <path d="M-27 10A21 27 0 0 1-8-4M19 13A21 27 0 0 1 38-1" stroke="#7e998c" strokeWidth={3} fill="none" />
  </g>
);

/** Mirror frame remains still; only glass/content responds to progress and phase. */
export const Mirror = ({ w = 280, h = 640, progress = 0, phase = 0, children }: { w?: number; h?: number; progress?: number; phase?: number; children?: React.ReactNode }) => {
  const id = uid(), p = clamp(progress);
  return (
    <g data-layer="mirror" data-anchor="floor:0,0" transform={`translate(${-w / 2} ${-h})`}>
      <defs>
        <clipPath id={`${id}-glass`}><path d={`M27 70Q${w / 2} 4 ${w - 27} 70V${h - 32}H27Z`} /></clipPath>
        <filter id={`${id}-water`} x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency={`${0.014 + p * 0.004} .027`} numOctaves={1} seed={7} /><feDisplacementMap in="SourceGraphic" scale={p * 12} xChannelSelector="R" yChannelSelector="G" /></filter>
      </defs>
      {/* bóng tiếp xúc sàn và bóng khung lên tường (phẳng) */}
      <ellipse cx={w / 2 + 14} cy={h + 8} rx={w * 0.62} ry={12} fill={SH} opacity={0.2} />
      <path d={`M${w} 70Q${w + 14} 80 ${w + 16} 100V${h}H${w}Z`} fill={SH} opacity={0.14} />
      <path d={`M8 72Q${w / 2} -18 ${w + 7} 72V${h + 4}H8Z`} fill={C.woodDark} />
      <path d={`M0 65Q${w / 2} -25 ${w} 65V${h}H0Z`} fill={C.wood} />
      {/* mặt khung: cạnh trái/đỉnh bắt sáng, cạnh phải tối */}
      <path d={`M0 65Q${w / 2} -25 ${w} 65L${w - 10} 69Q${w / 2} -2 10 69V${h - 12}H0Z`} fill="#a78360" />
      <path d={`M${w} 65V${h}H${w - 10}V69Z`} fill="#7c5f45" />
      <path d={`M10 69Q${w / 2} -2 ${w - 11} 69V${h - 12}H10Z`} fill="#bd956a" />
      <path d={`M20 73Q${w / 2} 12 ${w - 20} 73V${h - 24}H20Z`} fill="#695645" />
      <g clipPath={`url(#${id}-glass)`}>
        <rect width={w} height={h} fill="#b2c8bd" />
        <g filter={p > 0 ? `url(#${id}-water)` : undefined} data-layer="reflection">{children}</g>
        <path d={`M-20 145L${w + 30} 17V92L-20 220Z`} fill="#eef4e9" opacity={0.14 * (1 - p)} />
        {/* mép kính trong cùng: dải tối mảnh phía trên–phải (gương lõm vào khung) */}
        <path d={`M27 70Q${w / 2} 4 ${w - 27} 70V78Q${w / 2} 14 27 78Z`} fill="#4c5d55" opacity={0.35} />
        {p > 0 && <g data-layer="surface-ripples" fill="none" stroke="#b6d6cf">{[0, 1, 2, 3].map((i) => <ellipse key={i} cx={w * 0.56} cy={h * 0.43} rx={20 + i * 24 + Math.sin(phase + i) * 4} ry={12 + i * 16} opacity={p * (0.55 - i * 0.1)} strokeWidth={1.8} />)}</g>}
      </g>
      <path d={`M9 ${h - 13}H${w - 10}M12 79V${h - 30}`} stroke="#d1ad7c" strokeWidth={2} opacity={0.6} />
      <path d={`M-5 ${h}H${w + 11}L${w + 16} ${h + 9}H-10Z`} fill="#67543f" />
      <path d={`M-5 ${h}H${w + 11}L${w + 12} ${h + 3}H-6Z`} fill="#8a7155" />
    </g>
  );
};

/** Viên phấn (P3.01): một viên nguyên và một viên gãy đôi kèm bụi phấn; neo cầm ở giữa viên nguyên (0, 0). */
export const Chalk = () => (
  <g data-prop="chalk">
    <g transform="translate(-70 0) rotate(-12)">
      <rect x={-34} y={-8} width={68} height={16} rx={7} fill="#f4f1e6" />
      <rect x={-34} y={2} width={68} height={6} rx={3} fill="#d9d4c3" />
      <ellipse cx={30} cy={0} rx={4} ry={7} fill="#e6e1d0" />
    </g>
    <g transform="translate(58 6) rotate(18)">
      <rect x={-30} y={-8} width={26} height={16} rx={6} fill="#f4f1e6" />
      <rect x={-30} y={2} width={26} height={6} rx={3} fill="#d9d4c3" />
      <path d="M-4 -8L1 -3-3 1 2 5-4 8Z" fill="#e6e1d0" />
    </g>
    <g transform="translate(98 14) rotate(-28)">
      <rect x={-13} y={-8} width={26} height={16} rx={6} fill="#f4f1e6" />
      <rect x={-13} y={2} width={26} height={6} rx={3} fill="#d9d4c3" />
    </g>
    {[[74, 24, 3], [84, 28, 2], [66, 27, 2], [92, 30, 1.6], [104, 27, 2.2]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#f4f1e6" opacity={0.8} />)}
  </g>
);
