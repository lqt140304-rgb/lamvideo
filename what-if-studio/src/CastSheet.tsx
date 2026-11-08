import React from 'react';
import {MeadowFamily} from './episodes/tin-nhan-chua-gui/meadow_family';
import { AbsoluteFill } from 'remotion';
import {
  Hero,
  basePose,
  Pose,
  LOOKS,
  CastName,
  Expr,
  KitDefs,
  SetDefs,
  Study,
  FONT,
  standPose,
  sitPose,
  crouchPose,
  gesturePose,
  AncestralAltar,
  WoodenSofa,
  SewingTable,
  RepairBench,
  StandingFan,
  TVStand,
  CalendarBlock,
  Motorbike,
  Scooter,
  Bicycle,
  SedanCar,
  StreetCart,
  VnHouseFacade,
  TeaSet,
  PhinCoffee,
  PhotoPrint,
  ReceiptSlip,
  Phone,
  Helmet,
  ToolBox,
  OngLocShop,
  OngLocCounter,
  CustomerStool,
  OngLocForeground,
  OngLocCounterInsert,
  MotherThaoHouse,
  DiningTableSet,
  MotherHouseForeground,
  MotherPhone,
  FamilyPhoto,
  MemoryReceipt,
  ThreeReceiptsSet,
  MoneyEnvelope,
  PhoneClothPouch,
  ScrewdriverProp,
  SignPen,
  LeatherWallet,
  CeramicBowl,
  ThaoToteBag,
  HouseKeys,
  WallSwitch,
  FatherSilhouette,
  EpisodeTitleBanner,
  PerchingOwl,
  OwlEyeMacro,
  StarryCitySkyline,
  PasserbyShadow,
  AlleyExteriorScene,
  SunsetRiceField,
  SunsetMeadowForeground,
} from './engine';

// Render sheets for inspecting cast, expressions, postures, interior furniture, and vehicles:
//   npx remotion still src/index.ts Cast out/cast.png
//   npx remotion still src/index.ts NewCast out/new_cast.png
//   npx remotion still src/index.ts FurnitureSheet out/furniture.png
//   npx remotion still src/index.ts VehicleSheet out/vehicles.png

const Label: React.FC<{ x: number; y: number; text: string; sub?: string }> = ({ x, y, text, sub }) => (
  <g>
    <text x={x} y={y} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={20} fill="#F6EFE3" letterSpacing={1.5}>
      {text}
    </text>
    {sub ? (
      <text x={x} y={y + 22} textAnchor="middle" fontFamily={FONT.ui} fontSize={14} fill="#9A92C4" letterSpacing={1}>
        {sub}
      </text>
    ) : null}
  </g>
);

const P = (o: Partial<Pose>): Pose => ({ ...basePose, ...o });

export const NAMES: Record<CastName, string> = {
  pip: 'PIP A',
  pipHood: 'PIP B (HERO)',
  pipInk: 'PIP C',
  mo: 'MO · FRIEND',
  sis: 'SISTER',
  mom: 'MUM',
  suit: 'THE SUIT',
  worker: 'WORKER',
  workerHat: 'WORKER HAT',
  student: 'STUDENT',
  tech: 'TECH',
  chu: 'CHÚ MŨ VÀNG',
  bac: 'BÁC THỢ CẢ',
  moi: 'NGƯỜI MỚI',
  an: 'AN · BỐ',
  hanh: 'HẠNH · MẸ',
  linh: 'LINH · BÉ',
  baSau: 'BÀ SÁU',
  nam: 'NAM',
  duy: 'DUY (16T)',
  thao: 'THẢO (8T)',
  ongLoc: 'ÔNG LỘC',
  meDuyThao: 'MẸ DUY & THẢO',
  girlDress: 'CÔ GÁI MẶC VÁY',
  tattooGuy: 'CHÀNG TRAI XĂM',
  fatUncle: 'ÔNG CHÚ BỤNG BIA',
  baby: 'BÉ SƠ SINH',
  studentBoy1: 'NAM SINH KHĂN ĐỎ',
  studentBoy2: 'NAM SINH CẤP 3',
  studentBoy3: 'NAM SINH MỌT SÁCH',
  studentGirl1: 'NỮ SINH KHĂN ĐỎ',
  studentGirl2: 'NỮ SINH TÓC DÀI',
  studentGirl3: 'NỮ SINH TÓC TẾT',
  teacherAoDai: 'CÔ GIÁO ÁO DÀI',
  peTeacher: 'THẦY THỂ DỤC',
  officeLady1: 'NỮ CÔNG SỞ VÁY BÚT CHÌ',
  officeLady2: 'NỮ CÔNG SỞ BLAZER',
  guard: 'BÁC BẢO VỆ',
  police: 'CHÚ CÔNG AN',
  youngPunk: 'THANH NIÊN TRẺ TRÂU',
  seriousGuy: 'THANH NIÊN NGHIÊM TÚC',
};

const FEATURED_CAST: CastName[] = ['pipHood', 'duy', 'thao', 'baSau', 'ongLoc', 'an', 'hanh', 'linh', 'workerHat'];

export const CastSheet: React.FC = () => {
  const row1 = 380;
  const row2 = 910;
  const poses: { name: string; sub: string; p: Pose }[] = [
    { name: 'THINKING', sub: 'gesture: think', p: standPose(210, row2, 0.68, { yaw: 0.3, expr: 'thinking', gesture: 'think' }) },
    { name: 'EXPLAIN', sub: 'gesture: explain', p: standPose(520, row2, 0.68, { yaw: -0.3, expr: 'smile', gesture: 'explain' }) },
    { name: 'HOLD PROP', sub: 'gesture: holdProp', p: standPose(830, row2, 0.68, { yaw: 0.35, expr: 'smile', gesture: 'holdProp' }) },
    { name: 'HEARTFELT', sub: 'gesture: handOnChest', p: standPose(1140, row2, 0.68, { yaw: -0.3, expr: 'worried', gesture: 'handOnChest' }) },
    { name: 'SIT (NATURAL)', sub: 'torso lean + hands on lap', p: sitPose(1430, row2 - 80, 0.68, 1, { expr: 'smile' }) },
    { name: 'CROUCH', sub: 'crouchPose helper', p: crouchPose(1710, row2, 0.68, -1, { expr: 'determined' }) },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: '#14101C' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <KitDefs />
        <SetDefs />
        <g filter="url(#blur10)">
          <Study t={0} id="cast" />
        </g>
        <rect width={1920} height={1080} fill="#0B0816" opacity={0.42} />
        {FEATURED_CAST.map((c, i) => {
          const x = 135 + i * 206;
          const small = c === 'linh' || c === 'sis' || c === 'thao' ? 0.57 : c === 'duy' ? 0.72 : 0.74;
          const expr: Expr =
            c === 'ongLoc'
              ? 'neutral'
              : c === 'baSau'
                ? 'smile'
                : c === 'thao'
                  ? 'worried'
                  : c === 'hanh'
                    ? 'smile'
                    : c === 'linh'
                      ? 'happy'
                      : c === 'duy'
                        ? 'determined'
                        : c === 'an'
                          ? 'thinking'
                          : 'smile';
          return (
            <g key={c}>
              <Hero
                look={LOOKS[c]}
                pose={P({
                  x,
                  y: row1 + (0.74 - small) * 340,
                  scale: small,
                  yaw: i % 2 ? -0.35 : 0.35,
                  look: i % 2 ? -0.4 : 0.4,
                  expr,
                })}
                shadow={0.6}
              />
              <Label x={x} y={row1 + 158} text={NAMES[c]} />
            </g>
          );
        })}
        {poses.map((q) => (
          <g key={q.name}>
            {q.name === 'SIT (NATURAL)' ? (
              <g transform={`translate(${q.p.x} ${row2 - 74})`}>
                <rect x={-38} y={0} width={76} height={10} rx={3} fill="#6E4432" stroke="#16141C" strokeWidth={2.8} />
                <rect x={-30} y={10} width={10} height={68} fill="#4E2F21" stroke="#16141C" strokeWidth={2.5} />
                <rect x={20} y={10} width={10} height={68} fill="#4E2F21" stroke="#16141C" strokeWidth={2.5} />
                <rect x={-26} y={42} width={52} height={7} fill="#5C3828" stroke="#16141C" strokeWidth={2} />
              </g>
            ) : null}
            <Hero look={LOOKS.duy} pose={{ ...q.p, scale: 0.68 }} shadow={0.6} />
            <Label x={q.p.x} y={row2 + 45} text={q.name} sub={q.sub} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export const NEW_CAST_ROW1: CastName[] = [
  'girlDress',
  'tattooGuy',
  'fatUncle',
  'baby',
  'studentBoy1',
  'studentBoy2',
  'studentBoy3',
  'studentGirl1',
  'studentGirl2',
];

export const NEW_CAST_ROW2: CastName[] = [
  'studentGirl3',
  'teacherAoDai',
  'peTeacher',
  'officeLady1',
  'officeLady2',
  'guard',
  'police',
  'youngPunk',
  'seriousGuy',
];

export const NEW_CAST_META: Record<CastName, { title: string; sub: string }> = {
  pip: { title: 'PIP A', sub: 'Original' },
  pipHood: { title: 'PIP B', sub: 'Hero' },
  pipInk: { title: 'PIP C', sub: 'Ink' },
  mo: { title: 'MO', sub: 'Friend' },
  sis: { title: 'EM GÁI', sub: 'Sister' },
  mom: { title: 'MẸ', sub: 'Mum' },
  suit: { title: 'DOANH NHÂN', sub: 'The Suit' },
  worker: { title: 'CÔNG NHÂN', sub: 'Worker' },
  workerHat: { title: 'KỸ SƯ', sub: 'Worker Hat' },
  student: { title: 'HỌC SINH', sub: 'Student' },
  tech: { title: 'KỸ THUẬT', sub: 'Tech' },
  chu: { title: 'CHÚ MŨ VÀNG', sub: 'Hardhat' },
  bac: { title: 'BÁC THỢ CẢ', sub: 'Master' },
  moi: { title: 'NGƯỜI MỚI', sub: 'Newbie' },
  an: { title: 'AN · BỐ', sub: 'Father' },
  hanh: { title: 'HẠNH · MẸ', sub: 'Mother' },
  linh: { title: 'LINH · BÉ', sub: 'Child' },
  baSau: { title: 'BÀ SÁU', sub: 'Grandmother' },
  nam: { title: 'NAM', sub: 'Youth' },
  duy: { title: 'DUY', sub: 'Designer' },
  thao: { title: 'THẢO', sub: 'Architect' },
  ongLoc: { title: 'ÔNG LỘC', sub: 'Elder' },
  meDuyThao: { title: 'MẸ DUY & THẢO', sub: 'Tóc buộc thấp · Áo vải sáng' },
  girlDress: { title: 'CÔ GÁI MẶC VÁY', sub: 'Tóc uốn sóng · Mái bay' },
  tattooGuy: { title: 'CHÀNG TRAI XĂM', sub: 'Undercut · Xăm full tay' },
  fatUncle: { title: 'CHÚ BỤNG BIA', sub: 'Đầu hói · Áo ba lỗ' },
  baby: { title: 'BÉ SƠ SINH', sub: 'Mũ tai gấu · Ủ ấm' },
  studentBoy1: { title: 'NAM SINH 1', sub: 'Đầu nấm · Khăn quàng đỏ' },
  studentBoy2: { title: 'NAM SINH 2', sub: 'Tóc layer gai năng động' },
  studentBoy3: { title: 'NAM SINH 3', sub: 'Rẽ ngôi · Kính cận tròn' },
  studentGirl1: { title: 'NỮ SINH 1', sub: 'Tóc đuôi ngựa · Khăn đỏ' },
  studentGirl2: { title: 'NỮ SINH 2', sub: 'Tóc suôn dài · Kẹp tóc' },
  studentGirl3: { title: 'NỮ SINH 3', sub: 'Tóc tết bính · Kính tròn' },
  teacherAoDai: { title: 'CÔ GIÁO ÁO DÀI', sub: 'Búi thấp · Trâm ngọc trai' },
  peTeacher: { title: 'THẦY THỂ DỤC', sub: 'Húi cua thể thao · Còi' },
  officeLady1: { title: 'NỮ CÔNG SỞ 1', sub: 'Tóc cụp chữ C · Sơ mi lụa' },
  officeLady2: { title: 'NỮ CÔNG SỞ 2', sub: 'Tóc xoăn lơi · Blazer' },
  guard: { title: 'BÁC BẢO VỆ', sub: 'Đồng phục xanh · Kepi' },
  police: { title: 'CHÚ CÔNG AN', sub: 'Sắc phục CAND · Ve đỏ' },
  youngPunk: { title: 'TRẺ TRÂU', sub: 'Mullet vàng · Kính râm' },
  seriousGuy: { title: 'NGHIÊM TÚC', sub: 'Tóc dấu phẩy · Kính cận' },
};

const NEW_CAST_ACTING: Partial<
  Record<CastName, { expr: Expr; gesture?: 'idle' | 'explain' | 'point' | 'think' | 'handOnChest' | 'determined' | 'wave' | 'holdProp'; amount?: number }>
> = {
  girlDress: { expr: 'smile', gesture: 'handOnChest', amount: 1 },
  tattooGuy: { expr: 'smug', gesture: 'idle' },
  fatUncle: { expr: 'happy', gesture: 'explain', amount: 0.7 },
  baby: { expr: 'happy', gesture: 'idle' },
  studentBoy1: { expr: 'smile', gesture: 'wave', amount: 1 },
  studentBoy2: { expr: 'smug', gesture: 'determined', amount: 0.75 },
  studentBoy3: { expr: 'thinking', gesture: 'think', amount: 1 },
  studentGirl1: { expr: 'smile', gesture: 'wave', amount: 1 },
  studentGirl2: { expr: 'smile', gesture: 'holdProp', amount: 0.75 },
  studentGirl3: { expr: 'smile', gesture: 'explain', amount: 0.7 },
  teacherAoDai: { expr: 'smile', gesture: 'explain', amount: 0.75 },
  peTeacher: { expr: 'determined', gesture: 'point', amount: 0.85 },
  officeLady1: { expr: 'smile', gesture: 'holdProp', amount: 0.75 },
  officeLady2: { expr: 'smug', gesture: 'explain', amount: 0.7 },
  guard: { expr: 'smile', gesture: 'idle' },
  police: { expr: 'determined', gesture: 'idle' },
  youngPunk: { expr: 'smug', gesture: 'point', amount: 0.85 },
  seriousGuy: { expr: 'neutral', gesture: 'think', amount: 1 },
};

const ShortLabel: React.FC<{ x: number; y: number; title: string; sub: string }> = ({ x, y, title, sub }) => (
  <g>
    <text x={x} y={y} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={14} fill="#F6EFE3" letterSpacing={0.5}>
      {title}
    </text>
    <text x={x} y={y + 17} textAnchor="middle" fontFamily={FONT.ui} fontSize={12} fill="#9A92C4">
      {sub}
    </text>
  </g>
);

export const NewCastSheet: React.FC = () => {
  const row1 = 360;
  const row2 = 870;
  return (
    <AbsoluteFill style={{ backgroundColor: '#13111C' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <KitDefs />
        <SetDefs />
        <rect width={1920} height={1080} fill="#13111C" />
        <text x={960} y={55} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={32} fill="#F6EFE3" letterSpacing={1.2}>
          18 NHÂN VẬT MỚI — DÀN DIỄN VIÊN ĐẶC TRƯNG VIỆT NAM
        </text>
        <text x={960} y={85} textAnchor="middle" fontFamily={FONT.ui} fontSize={16} fill="#A69EC8" letterSpacing={1}>
          Được thiết kế tỉ mỉ: kiểu tóc đa dạng có chiều sâu, kính cận tròn trong suốt, khuỷu tay cong tự nhiên & thần thái riêng
        </text>

        {/* Row 1 */}
        {NEW_CAST_ROW1.map((c, i) => {
          const x = 145 + i * 204;
          const isBaby = c === 'baby';
          const scale = isBaby ? 0.58 : 0.68;
          const meta = NEW_CAST_META[c];
          const act = NEW_CAST_ACTING[c] ?? { expr: 'smile', gesture: 'idle' };
          const dir = i % 2 ? -1 : 1;
          const base = standPose(x, row1 + 88.4, scale, {
            facing: dir,
            yaw: dir * 0.28,
            look: dir * 0.3,
            expr: act.expr,
          });
          const pose = isBaby
            ? P({ x, y: row1 + 65, scale, yaw: 0.18, look: 0.2, expr: 'happy' })
            : act.gesture && act.gesture !== 'idle'
              ? gesturePose(base, act.gesture, act.amount ?? 1)
              : base;
          return (
            <g key={c}>
              <Hero look={LOOKS[c]} pose={pose} shadow={0.65} />
              <ShortLabel x={x} y={row1 + 148} title={meta.title} sub={meta.sub} />
            </g>
          );
        })}

        {/* Row 2 */}
        {NEW_CAST_ROW2.map((c, i) => {
          const x = 145 + i * 204;
          const scale = 0.68;
          const meta = NEW_CAST_META[c];
          const act = NEW_CAST_ACTING[c] ?? { expr: 'smile', gesture: 'idle' };
          const dir = i % 2 ? -1 : 1;
          const base = standPose(x, row2 + 88.4, scale, {
            facing: dir,
            yaw: dir * 0.28,
            look: dir * 0.3,
            expr: act.expr,
          });
          const pose = act.gesture && act.gesture !== 'idle' ? gesturePose(base, act.gesture, act.amount ?? 1) : base;
          return (
            <g key={c}>
              <Hero look={LOOKS[c]} pose={pose} shadow={0.65} />
              <ShortLabel x={x} y={row2 + 148} title={meta.title} sub={meta.sub} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const FurnitureSheet: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#1B1622' }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <KitDefs />
      <SetDefs />
      <rect width={1920} height={1080} fill="#1B1622" />
      <text x={80} y={68} fontFamily={FONT.title} fontWeight={800} fontSize={40} fill="#F6EFE3">
        NỘI THẤT & ĐỒ TRANG TRÍ NHÀ VIỆT NAM
      </text>
      <AncestralAltar x={300} y={445} w={250} t={24} />
      <Label x={300} y={495} text="BÀN THỜ GIA ĐÌNH" sub="AncestralAltar" />

      <WoodenSofa x={860} y={425} w={420} withTable />
      <TeaSet x={860} y={398} s={0.82} f={24} />
      <Label x={860} y={495} text="BỘ BÀN GHẾ GỖ & ẤM TRÀ" sub="WoodenSofa + TeaSet" />

      <SewingTable x={1380} y={445} w={270} t={24} />
      <Label x={1380} y={495} text="BÀN MÁY MAY BÀ SÁU" sub="SewingTable" />

      <CalendarBlock x={1655} y={190} w={92} day="14" month="THÁNG 3" />
      <StandingFan x={1765} y={445} s={0.92} t={24} />
      <Label x={1715} y={495} text="LỊCH BLOC & QUẠT CÂY" sub="CalendarBlock + StandingFan" />

      <RepairBench x={420} y={965} w={400} t={24} withShelf />
      <Label x={420} y={1025} text="QUẦY TIỆM SỬA ĐỒ ÔNG LỘC" sub="RepairBench" />

      <TVStand x={1010} y={965} w={330} on={1} />
      <Label x={1010} y={1025} text="KỆ TIVI PHÒNG KHÁCH" sub="TVStand" />

      <PhotoPrint x={1410} y={760} w={205} rot={-5} />
      <ReceiptSlip x={1665} y={760} w={195} rot={4} />
      <PhinCoffee x={1360} y={955} s={1.08} f={24} />
      <Phone x={1520} y={915} w={90} on={1} voiceMemo={0.65} cracked={1} caller="BÀ SÁU" f={24} />
      <Helmet x={1690} y={955} s={0.92} />
      <ToolBox x={1820} y={955} s={0.74} open />
      <Label x={1590} y={1025} text="ĐẠO CỤ ĐỜI SỐNG & KỂ CHUYỆN" sub="PhotoPrint · ReceiptSlip · Phone · PhinCoffee · Helmet" />
    </svg>
  </AbsoluteFill>
);

export const VehicleSheet: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#161824' }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <KitDefs />
      <SetDefs />
      <rect width={1920} height={1080} fill="#161824" />
      <text x={80} y={68} fontFamily={FONT.title} fontWeight={800} fontSize={40} fill="#F6EFE3">
        XE CỘ & KIẾN TRÚC NHÀ PHỐ / HẺM VIỆT NAM
      </text>
      <Motorbike x={290} y={420} s={0.96} t={20} headlight={1} />
      <Label x={290} y={475} text="XE MÁY SỐ (WAVE / DREAM)" sub="Motorbike" />

      <Scooter x={740} y={420} s={0.96} t={20} headlight={1} />
      <Label x={740} y={475} text="XE TAY GA" sub="Scooter" />

      <Bicycle x={1180} y={420} s={0.96} t={20} />
      <Label x={1180} y={475} text="XE ĐẠP HỌC SINH" sub="Bicycle" />

      <StreetCart x={1620} y={420} s={0.92} t={20} />
      <Label x={1620} y={475} text="XE ĐẨY HÀNG RONG ĐẦU HẺM" sub="StreetCart" />

      <SedanCar x={480} y={940} s={0.95} taxi headlight={1} />
      <Label x={480} y={1005} text="Ô TÔ 4 CHỖ / TAXI" sub="SedanCar" />

      <VnHouseFacade x={1350} y={955} w={340} h={415} />
      <Label x={1350} y={1005} text="MẶT TIỀN NHÀ ỐNG / TIỆM HẺM" sub="VnHouseFacade" />
    </svg>
  </AbsoluteFill>
);

/**
 * Preview Sheet 1 for Episode 01 (`SET-TIEM` — Bản 3):
 * Shows Ông Lộc's mysterious cluttered repair shop (`OngLocShop` + `OngLocCounter` + `CustomerStool` + `OngLocForeground`)
 * with Ông Lộc (~60yo, stoic cold expression) behind the counter, Duy (16yo brother) on the left stool,
 * and Thảo (8yo sister) on the right stool with elevated footrest (`withFootrest`), plus a 38° tabletop insert preview (`OngLocCounterInsert`).
 */
export const OngLocShopSheet: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#120E17' }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <KitDefs />
      <SetDefs />
      {/* Background & Midground Shell of Ông Lộc's Shop (darkened unlit corners via veil=0.56) */}
      <OngLocShop t={24} veil={0.56} />

      {/* Ông Lộc (~60yo, mặt lạnh đã chốt) standing behind the counter */}
      <Hero
        look={LOOKS.ongLoc}
        pose={standPose(915, 804, 0.96, {
          t: 24,
          seed: 3,
          facing: 1,
          yaw: -0.15,
          expr: 'neutral',
          look: -0.15,
          headTilt: 2,
          armL: { a: -20, b: -36 },
          handL: 'open',
          armR: { a: -26, b: -52 },
          handR: 'pinch',
        })}
      />

      {/* Main Wooden Shop Counter (`QUẦY y ≈ 3,3`, top at y ≈ 650) */}
      <OngLocCounter
        x={890}
        y={855}
        w={880}
        t={24}
        phoneState="cracked"
        showPhoto
        receiptStage="written"
        penOnPaper
        showMoney
        showPouch
      />

      {/* Left Customer Stool + Duy (16 tuổi — anh trai, tạm dựng theo phác thảo v4) */}
      <CustomerStool x={685} y={935} s={1} />
      <Hero
        look={LOOKS.duy}
        pose={sitPose(685, 845, 0.92, 1, {
          t: 24,
          seed: 1,
          yaw: 0.45,
          expr: 'worried',
          look: 0.35,
          gesture: 'point',
        })}
      />

      {/* Right Customer Stool (with elevated footrest for 8yo child) + Thảo (8 tuổi — em gái, tạm dựng theo phác thảo v4) */}
      <CustomerStool x={1105} y={935} s={1} withFootrest />
      <Hero
        look={LOOKS.thao}
        pose={sitPose(1105, 842, 0.72, -1, {
          t: 24,
          seed: 2,
          yaw: -0.45,
          expr: 'sad',
          look: -0.35,
        })}
      />

      {/* 2.5D Foreground Rack & Doorway Edge (`OngLocForeground`) */}
      <OngLocForeground shiftX={0} />

      {/* Top Title Banner */}
      <g transform="translate(80 34)">
        <rect x={0} y={0} width={1160} height={74} rx={12} fill="#120E17" opacity={0.9} stroke="#C89B4B" strokeWidth={2} />
        <text x={24} y={34} fontFamily={FONT.title} fontWeight={800} fontSize={25} fill="#FFE8A8">
          SET-TIEM · TIỆM ÔNG LỘC (HUYỀN BÍ, BỪA BỘN · BẢN 3: ÔNG LỘC, DUY 16T & BÉ THẢO 8T)
        </text>
        <text x={24} y={58} fontFamily={FONT.ui} fontSize={14.5} fill="#CBD5E1">
          Vùng tối khuất bóng đèn dịu xuống · Ghế Thảo có bậc để chân · Quầy có phong bì 186k + 2 tờ 20k gấp tư, ảnh 3 mẹ con & biên nhận 2 liên
        </text>
      </g>

      {/* Bottom-Right Inset: `OngLocCounterInsert` (38° Tabletop Close-up & Story Props) */}
      <g transform="translate(1315 650)">
        <defs>
          <clipPath id="insertClip">
            <rect x={0} y={0} width={560} height={315} rx={14} />
          </clipPath>
        </defs>
        <rect x={-6} y={-6} width={572} height={365} rx={16} fill="#120E17" opacity={0.92} stroke="#D4A24C" strokeWidth={2.5} />
        <g clipPath="url(#insertClip)">
          <g transform="scale(0.2916)">
            <OngLocCounterInsert
              t={24}
              cracked={0}
              screenOn={1}
              playing={1}
              showPhoto
              receiptStage="signed"
              penOnPaper
              showWallet
              showMoney
              showPouch
            />
          </g>
        </g>
        <text x={280} y={338} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={14.5} fill="#FFE8A8">
          INSERT MẶT QUẦY 38° (Điện thoại · Phong bì 186k + 20k · Ảnh · Biên nhận 2 liên)
        </text>
      </g>
    </svg>
  </AbsoluteFill>
);

/**
 * Preview Sheet 2 for Episode 01 (`SET-NHA` — Bản 3):
 * Shows Duy (16yo) & Thảo (8yo)'s home (`MotherThaoHouse` + `DiningTableSet` + `MotherHouseForeground`):
 * - Warm and cozy where light reaches (`tạo cảm giác ấm cúng`: rattan pendant lamp over dining table, kitchen, Mother's altar).
 * - Darkened in areas where light does not reach (`ánh sáng trong phòng hơi tối lại những chỗ không có ánh sáng chiếu đến`).
 * - Father character (`FatherSilhouette`) appearing only as a subtle shadow/silhouette & rolling bottle sound cue in the unlit back room.
 */
export const MotherHouseSheet: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#18110E' }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <KitDefs />
      <SetDefs />
      {/* Warm & Cozy Lit Zones + Darkened Unlit Zones + Father's Back-Room Silhouette (`MotherThaoHouse`) */}
      <MotherThaoHouse
        t={24}
        kitchenLightOn={1}
        toteHung
        keysHung
        bowlsLocation="counter"
        showFatherShadow
        veil={0.62}
      />

      {/* Subtle annotation badge above the darkened back-room doorway (`FatherSilhouette`) */}
      <g transform="translate(285 332)">
        <rect x={-124} y={-24} width={248} height={38} rx={8} fill="#0E0908" opacity={0.86} stroke="#7A523B" strokeWidth={1.5} />
        <text x={0} y={-8} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={11.5} fill="#E5D2B8">
          PHÒNG SAU KHUẤT VÁCH (TỐI)
        </text>
        <text x={0} y={8} textAnchor="middle" fontFamily={FONT.ui} fontSize={10.5} fill="#BBA48E">
          Hình bóng người bố mờ + tiếng chai lăn nhẹ
        </text>
      </g>

      {/* Center Dining Table & Chairs (`DiningTableSet`, floor at y=915, chair seat at y=815) with Duy (16yo, left) & Thảo (8yo, right) */}
      <DiningTableSet x={980} y={915} w={450} showPhone showReceipt />

      <Hero
        look={LOOKS.duy}
        pose={sitPose(765, 822, 0.92, 1, {
          t: 24,
          seed: 1,
          yaw: 0.45,
          expr: 'sad',
          look: 0.35,
          headTilt: 5,
        })}
      />
      <Hero
        look={{ ...LOOKS.thao, accessory: 'none' }}
        pose={sitPose(1195, 818, 0.72, -1, {
          t: 24,
          seed: 2,
          yaw: -0.45,
          expr: 'relieved',
          look: -0.35,
          headTilt: 4,
          gesture: 'handOnChest',
        })}
      />

      {/* Warm Wooden 2.5D Foreground Doorframe & Threshold (`MotherHouseForeground`) */}
      <MotherHouseForeground shiftX={0} />

      {/* Top Title Banner */}
      <g transform="translate(80 34)">
        <rect x={0} y={0} width={1320} height={74} rx={12} fill="#140C09" opacity={0.92} stroke="#D4846A" strokeWidth={2} />
        <text x={24} y={34} fontFamily={FONT.title} fontWeight={800} fontSize={24.5} fill="#FFE6A3">
          SET-NHA · NHÀ HAI ANH EM DUY (16T) & THẢO (8T) — ẤM CÚNG VÙNG SÁNG, DỊU TỐI VÙNG KHUẤT
        </text>
        <text x={24} y={58} fontFamily={FONT.ui} fontSize={14.5} fill="#E5D2B8">
          Đèn mây bàn ăn & bàn thờ mẹ ấm áp · Góc bàn may tắt đèn & góc khuất tối dịu · Người bố chỉ xuất hiện dạng bóng mờ & âm thanh phòng sau
        </text>
      </g>

      {/* Bottom-Left Callout Strip of Episode 01 v3 Story Props */}
      <g transform="translate(75 845)">
        <rect x={0} y={0} width={635} height={185} rx={14} fill="#140C09" opacity={0.92} stroke="#C88B4B" strokeWidth={2.5} />
        <text x={317} y={28} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={12.5} fill="#FFE6A3">
          ĐẠO CỤ BẢN 3 (PROP-DIENTHOAI · PROP-TIEN · PROP-BIENNHAN · PROP-BAT · PROP-CONGTAC)
        </text>
        <MotherPhone x={88} y={114} w={86} rot={-3} flat={false} cracked={0} screenOn={1} playing={1} f={24} />
        <MoneyEnvelope x={215} y={118} s={0.92} rot={-6} withThaoBills />
        <CeramicBowl x={325} y={128} s={0.98} />
        <CeramicBowl x={390} y={128} s={0.98} upsideDown />
        <WallSwitch x={460} y={110} s={1.2} on />
        <ThaoToteBag x={528} y={82} s={0.68} hanging />
        <HouseKeys x={588} y={88} s={0.92} />
      </g>
    </svg>
  </AbsoluteFill>
);

export const EXPR_LIST: Expr[] = [
  'neutral',
  'happy',
  'smile',
  'relieved',
  'smug',
  'cool',
  'surprised',
  'shock',
  'scared',
  'worried',
  'guilty',
  'sad',
  'cry',
  'sigh',
  'tired',
  'pain',
  'angry',
  'determined',
  'thinking',
  'oops',
  'dizzy',
  'tearsHeldBack',
  'exhaustedClinch',
  'vacantSearch',
  'determinedChild',
  'glanceOverGlasses',
];

/**
 * Preview Sheet 3 for Episode 01 (`BẢN 5 — CẢNH 0 PHẦN MỞ ĐẦU 24 GIÂY`):
 * Showcases all assets required for `C0-A` → `C0-F`:
 * - Main view (`C0-D` / `C0-E` / `C0-F`): `AlleyExteriorScene` (`SET-HEM-EXT`) with `PerchingOwl` (`ANIMAL-CU`) on the upper-left eave bracket,
 *   2–3 grounded `PasserbyShadow` figures (`EXTRA-BONG`), cold grocery store spill on the left, warm amber shop light on the right,
 *   and Duy (16yo) holding Thảo's (8yo) hand outside Ông Lộc's shop doorway.
 * - Top-Left Inset (`C0-A` / `C0-B`): `StarryCitySkyline` (`SET-CITY-SKY`) + `EpisodeTitleBanner` (`TITLE-TAP` "TIN NHẮN CHƯA GỬI").
 * - Bottom-Left Inset (`C0-C`): `OwlEyeMacro` (`ANIMAL-CU` 85mm macro head & eye with warm streetlamp reflection in the iris).
 */
export const OpeningC0Sheet: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#070B16' }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <KitDefs />
      <SetDefs />

      {/* Main Background: `AlleyExteriorScene` (`SET-HEM-EXT` + `PerchingOwl` + `PasserbyShadow`) */}
      <AlleyExteriorScene t={24} showOwl showPassersby />

      {/* Soft diffused contact shadows on asphalt beneath Duy & Thảo */}
      <ellipse cx={1255} cy={927} rx={50} ry={13} fill="#05070E" opacity={0.72} filter="url(#softShadowBlur)" />
      <ellipse cx={1115} cy={947} rx={40} ry={11} fill="#05070E" opacity={0.68} filter="url(#softShadowBlur)" />

      {/* Duy (16yo) & Thảo (8yo) stopping before Ông Lộc's shop entrance (`C0-E` / `C0-F`) */}
      <Hero
        look={LOOKS.duy}
        rimId="rimShopWarm"
        shadow={0.35}
        pose={standPose(1255, 925, 0.88, {
          t: 24,
          seed: 1,
          yaw: 0.48,
          expr: 'worried',
          look: 0.55,
          headTilt: -4,
        })}
      />
      <Hero
        look={LOOKS.thao}
        rimId="rimStreetlamp"
        shadow={0.3}
        pose={standPose(1115, 945, 0.68, {
          t: 24,
          seed: 2,
          yaw: 0.42,
          expr: 'scared',
          look: 0.45,
          headTilt: -3,
          gesture: 'handOnChest',
        })}
      />

      {/* Top Banner */}
      <g transform="translate(520 26)">
        <rect x={0} y={0} width={1350} height={74} rx={12} fill="#090E1B" opacity={0.92} stroke="#E8B86D" strokeWidth={2} />
        <text x={24} y={33} fontFamily={FONT.title} fontWeight={800} fontSize={24} fill="#FFE8A8">
          CẢNH 0 — PHẦN MỞ ĐẦU (BẢN 5 · 24 GIÂY: TRỜI SAO — MẮT CÚ — CON HẺM — TRƯỚC CỬA TIỆM)
        </text>
        <text x={24} y={57} fontFamily={FONT.ui} fontSize={14} fill="#CBD5E1">
          SET-CITY-SKY · TITLE-TAP · ANIMAL-CU (Toàn thân & Cận 85mm) · SET-HEM-EXT · EXTRA-BONG · Duy & Thảo trước cửa tiệm ông Lộc
        </text>
      </g>

      {/* Inset 1 (Left Middle, `C0-A` / `C0-B`): `StarryCitySkyline` + `EpisodeTitleBanner` */}
      <g transform="translate(52 330)">
        <defs>
          <clipPath id="c0SkyClip">
            <rect x={0} y={0} width={520} height={292} rx={12} />
          </clipPath>
        </defs>
        <rect x={-6} y={-6} width={532} height={338} rx={14} fill="#080D1A" opacity={0.94} stroke="#D4A857" strokeWidth={2.5} />
        <g clipPath="url(#c0SkyClip)">
          <g transform="scale(0.2708)">
            <StarryCitySkyline t={24} tiltY={0.18} showTitle titleOpacity={1} showOwl />
          </g>
        </g>
        <text x={260} y={316} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={13.5} fill="#FFE8A8">
          C0-A / C0-B · SET-CITY-SKY + TITLE-TAP ("TIN NHẮN CHƯA GỬI")
        </text>
      </g>

      {/* Inset 2 (Bottom Left, `C0-C`): `OwlEyeMacro` (85mm Macro Owl Head & Eye Reflection) */}
      <g transform="translate(52 690)">
        <defs>
          <clipPath id="c0OwlClip">
            <rect x={0} y={0} width={520} height={292} rx={12} />
          </clipPath>
        </defs>
        <rect x={-6} y={-6} width={532} height={338} rx={14} fill="#080D1A" opacity={0.94} stroke="#D4A857" strokeWidth={2.5} />
        <g clipPath="url(#c0OwlClip)">
          <g transform="scale(0.2708)">
            <OwlEyeMacro w={1920} h={1080} blink={0} lookX={0.22} lookY={0.28} />
          </g>
        </g>
        <text x={260} y={316} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={13.5} fill="#FFE8A8">
          C0-C · ANIMAL-CU ĐẶC TẢ 85MM (Mắt cú sắc nét, phản chiếu ánh vàng tiệm ông Lộc)
        </text>
      </g>
    </svg>
  </AbsoluteFill>
);

/**
 * Preview Sheet 4 for Episode 01 (`BẢN 5 — CÁNH ĐỒNG NẮNG CHIỀU GẶP MẸ & 3 GIAO KÈO G1–G2–G3`):
 * Showcases all new assets required for Scenes 4–7 in Bản 5:
 * - Main view (`C6`–`C7`): `SunsetRiceField` (`SET-CANHDONG`) + `SunsetMeadowForeground` with `CHAR-ME` (`meDuyThao`),
 *   `duy` (16yo), and `thao` (8yo) sitting together on the dry grass bank in warm golden-hour sunlight.
 * - Bottom-Left Inset (`PROP-G1-G2-G3`): `ThreeReceiptsSet` showing the 3 carbonless receipts (G1: 16th birthday, G2: emptiness, G3: Thảo's dream of Mother).
 * - Bottom-Right Inset (`C7-C` & `C4-D`/`C5-C`): Mother (`meDuyThao`) dissolving smoothly (`opacity={0.42}` so body, clothes, and shadow fade together)
 *   + Ông Lộc's cold one-sided smirk (`expr: 'smug'`) & Duy's exhausted temple sweat (`expr: 'tired'`).
 */
export const MeadowAndDealsSheet: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#6E89B5' }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <KitDefs />
      <SetDefs />

      {/* Main Background: `SunsetRiceField` (`SET-CANHDONG`) */}
      <SunsetRiceField t={24} whiteout={0} seatedBank />

      {/* C6-B: Standing Mother (`CHAR-ME`) calling Duy & Thảo on the left dirt path */}
      <g opacity={0.95}>
        <Hero
          look={LOOKS.meDuyThao}
          pose={gesturePose(
            standPose(330, 785, 0.82, {
              t: 24,
              seed: 9,
              yaw: 0.35,
              expr: 'smile',
              look: 0.35,
              headTilt: 3,
            }),
            'wave',
            1,
          )}
        />
        <g transform="translate(330 455)">
          <rect x={-130} y={0} width={260} height={32} rx={8} fill="#1C140E" opacity={0.86} stroke="#E8B86D" strokeWidth={1.5} />
          <text x={0} y={21} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={12.5} fill="#FFE8A8">
            C6-A/B · CHAR-ME ĐỨNG GỌI CON
          </text>
        </g>
      </g>

      {/* Same left-to-right order and embraced seated pose as the source scene. */}
      <MeadowFamily t={24} />
      <g transform="translate(955 455)">
        <rect x={-175} y={0} width={350} height={32} rx={8} fill="#1C140E" opacity={0.86} stroke="#E8B86D" strokeWidth={1.5} />
        <text x={0} y={21} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={12.5} fill="#FFE8A8">
          C7-A/B · 3 MẸ CON NGỒI BỜ CỎ KHÔ NẮNG CHIỀU
        </text>
      </g>

      {/* C7-C Preview on Right of Bank: Mother dissolving smoothly (`opacity={0.42}` fading body + clothes + shadow together) */}
      <Hero
        look={LOOKS.meDuyThao}
        opacity={0.42}
        pose={sitPose(1510, 802, 0.88, -1, {
          t: 24,
          seed: 8,
          thighDepth: .9, legL: {a:-65,b:65}, legR: {a:-60,b:60},
          yaw: -0.32,
          expr: 'relieved',
          look: -0.3,
          headTilt: 4,
        })}
      />
      <g transform="translate(1510 455)">
        <rect x={-165} y={0} width={330} height={32} rx={8} fill="#1C140E" opacity={0.86} stroke="#E8B86D" strokeWidth={1.5} />
        <text x={0} y={21} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={12.5} fill="#FFE8A8">
          C7-C · MẸ TAN DẦN (opacity=0.42 · đồng nhất bóng)
        </text>
      </g>

      {/* 2.5D Foreground Grass Blades (`SunsetMeadowForeground`) */}
      <SunsetMeadowForeground t={24} shiftX={0} />

      {/* Top Title Banner */}
      <g transform="translate(70 28)">
        <rect x={0} y={0} width={1440} height={74} rx={12} fill="#1C140E" opacity={0.9} stroke="#E8B86D" strokeWidth={2} />
        <text x={24} y={33} fontFamily={FONT.title} fontWeight={800} fontSize={24} fill="#FFE8A8">
          CẢNH 6 & 7 — CÁNH ĐỒNG NẮNG CHIỀU GẶP MẸ (`SET-CANHDONG` · `CHAR-ME` · `PROP-G1-G2-G3`)
        </text>
        <text x={24} y={57} fontFamily={FONT.ui} fontSize={14} fill="#E5D2B8">
          Bản 5: Nắng chiều ấm từ trái khung (không làm hào quang thiên đường) · Bờ cỏ khô 3 mẹ con ngồi · 3 tờ biên nhận G1, G2, G3 (tờ 3 ghi tên Thảo)
        </text>
      </g>

      {/* Bottom-Left Callout: `ThreeReceiptsSet` (`PROP-G1-G2-G3`) */}
      <g transform="translate(65 825)">
        <rect x={0} y={0} width={960} height={220} rx={14} fill="#161118" opacity={0.94} stroke="#D4A857" strokeWidth={2.5} />
        <text x={480} y={26} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={13.5} fill="#FFE8A8">
          PROP-G1-G2-G3 · BA TỜ BIÊN NHẬN 2 LIÊN (G1: Tranh đồ chơi & làm hòa · G2: Nhận nỗi buồn em · G3: Giấc mơ của Thảo)
        </text>
        <ThreeReceiptsSet x={495} y={130} s={1.08} />
      </g>

      {/* Bottom-Right Callout: C4-D Ông Lộc nhếch mép lạnh (`smug`) & C5-C Duy kiệt sức đổ mồ hôi thái dương (`tired`) */}
      <g transform="translate(1065 825)">
        <rect x={0} y={0} width={785} height={220} rx={14} fill="#161118" opacity={0.94} stroke="#D4A857" strokeWidth={2.5} />
        <text x={392} y={26} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={13.5} fill="#FFE8A8">
          BIỂU CẢM MỚI BẢN 5: C4-D ÔNG LỘC NHẾCH MÉP LẠNH & C5-C DUY MỒ HÔI THÁI DƯƠNG
        </text>
        <defs>
          <clipPath id="b5Expr1">
            <rect x={28} y={36} width={345} height={152} rx={10} />
          </clipPath>
          <clipPath id="b5Expr2">
            <rect x={412} y={36} width={345} height={152} rx={10} />
          </clipPath>
        </defs>
        <rect x={28} y={36} width={345} height={152} rx={10} fill="#231B28" stroke="#5A4638" strokeWidth={1.5} />
        <g clipPath="url(#b5Expr1)">
          <Hero
            look={LOOKS.ongLoc}
            pose={standPose(200, 395, 0.85, {
              t: 24,
              yaw: -0.22,
              expr: 'smug',
              look: -0.2,
            })}
          />
        </g>
        <text x={200} y={206} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={12} fill="#FFE8A8">
          C4-D · Ông Lộc nhếch miệng, mắt vẫn lạnh
        </text>

        <rect x={412} y={36} width={345} height={152} rx={10} fill="#231B28" stroke="#5A4638" strokeWidth={1.5} />
        <g clipPath="url(#b5Expr2)">
          <Hero
            look={LOOKS.duy}
            pose={standPose(585, 390, 0.85, {
              t: 24,
              yaw: 0.25,
              expr: 'exhaustedClinch',
              look: 0.2,
              headTilt: 5,
            })}
          />
        </g>
        <text x={585} y={206} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={12} fill="#FFE8A8">
          C5-C / C8-A · Duy kiệt sức rịn mồ hôi (`exhaustedClinch`)
        </text>
      </g>
    </svg>
  </AbsoluteFill>
);

