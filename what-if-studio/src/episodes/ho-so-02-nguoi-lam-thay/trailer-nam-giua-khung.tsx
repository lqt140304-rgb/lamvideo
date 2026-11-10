import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { JointPose, mixPose, NamMood, NamOutfitId, STAND_POSE, StudentTwinBody, TWIN_POSES } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat';
import { BedCorner, DoorInside, GiveawayCorner, HallwayStairs, KitchenSink, MirrorCorner, RoomMorning, RoomProps, StudyCornerMorning, StudyDeskNight } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/boi-canh';
import { FootballPitch, LectureRoom, SchoolCorridor, SchoolYard } from '../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/truong-va-san';

/**
 * Hồ sơ 2 — clip riêng "Nam giữa khung" (không nằm trong trailer P1.00; xem TRAILER-NAM-GIUA-KHUNG.md của hồ sơ).
 * Nam đứng yên giữa khung, trung cảnh từ thắt lưng; bối cảnh đổi liên tục theo dòng thời gian truyện,
 * nét mặt và dáng tay đổi theo từng nhịp. Bản sao không xuất hiện. Nền là các góc máy có sẵn của mô hình phòng.
 * Đây là bản nháp dựng để duyệt nhịp, chưa có giọng, nhạc hay âm.
 */


export type Beat = {
  id: string;
  chip: string; // mốc thời gian truyện; chỉ ghi chú, không hiện trên hình (bỏ nhãn theo yêu cầu 10/11/2026)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bg: React.FC<any>;
  bgProps?: RoomProps & { dusk?: boolean };
  mood: NamMood;
  pose: JointPose;
  outfit: NamOutfitId;
  night?: boolean;
  /** Ghi chú cho người dựng, không hiện trên hình. */
  note: string;
};

const P = TWIN_POSES;
const lean = (p: JointPose, d: Partial<JointPose>): JointPose => ({ ...p, ...d });

/** Phần 1 của đoạn: giới thiệu, theo thứ tự trước tuyến chính. */
export const BEATS_INTRO: Beat[] = [
  { id: 'I1', chip: 'Một tuần trước', bg: GiveawayCorner, bgProps: { move: { truck: -95 } }, mood: 'neutral_smile', pose: P.offer, outfit: 'dong-phuc', note: 'Đi học về, mặc đồng phục; nhặt được gương ở góc đồ cho tặng, hớn hở.' },
  { id: 'I1b', chip: 'Ngày thường · giảng đường', bg: LectureRoom, mood: 'sleepy', pose: lean(STAND_POSE, { neck: -6, tilt: 3 }), outfit: 'dong-phuc', note: 'Trên giảng đường, mắt díp, đầu gật gù.' },
  { id: 'I1c', chip: 'Ngày thường · trễ học', bg: SchoolCorridor, mood: 'hesitant', pose: P.phone, outfit: 'dong-phuc', note: 'Hành lang lớp: vào trễ, vẫn cầm máy.' },
  { id: 'I1d', chip: 'Ngày thường · sân bóng', bg: FootballPitch, bgProps: { dusk: true }, mood: 'annoyed', pose: lean(STAND_POSE, { tilt: 6, neck: -4 }), outfit: 'the-thao', note: 'Ra sân với Tùng nhưng chỉ đứng thở, chưa đá đã muốn về.' },
  { id: 'I2', chip: 'Ngày thường', bg: BedCorner, mood: 'sleepy', pose: P.phone, outfit: 'the-thao', note: '“Tí nữa.” Về phòng vẫn đồ thể thao, nằm bấm máy.' },
  { id: 'I3', chip: 'Ngày thường', bg: BedCorner, bgProps: { night: true }, mood: 'sleepy', pose: lean(P.phone, { neck: -8 }), outfit: 'xanh', night: true, note: '“…Tí nữa.” Đêm, áo xanh rêu: chiếc áo sau này vắt trên ghế.' },
  { id: 'I4', chip: 'Ngày thường', bg: BedCorner, bgProps: { door: 'open' }, mood: 'hesitant', pose: lean(P.phone, { tilt: -3 }), outfit: 'ngu', note: '“Ừ, tí.” Sáng, còn áo ngủ; cửa mở vì Tùng vừa đi học một mình.' },
];

/** Phần 2: hé cả truyện, dừng trước kết; không lộ bản sao hay thế giới gương. */
export const BEATS_STORY: Beat[] = [
  { id: 'S1', chip: 'Ngày 1 · 7:00', bg: KitchenSink, bgProps: { kitchen: 'clean' }, mood: 'shocked', pose: P.stop, outfit: 'ngu', note: 'Bồn đã sạch, có người vừa rửa hộ. Nam sững.' },
  { id: 'S2', chip: 'Ngày 1', bg: DoorInside, mood: 'suspicious', pose: P.wary, outfit: 'ngu', note: 'Cửa gài chốt. Nam đề phòng.' },
  { id: 'S3', chip: 'Ngày 1 · chiều', bg: StudyCornerMorning, bgProps: { sun: 1 }, mood: 'agitated', pose: lean(P.wary, { neck: -6 }), outfit: 'ngu', note: 'Bài làm mãi không được.' },
  { id: 'S4', chip: 'Ngày 1 · tối', bg: StudyDeskNight, mood: 'neutral_smile', pose: P.phone, outfit: 'ngu', night: true, note: 'Bài đã có người làm xong. Nhẹ nhõm.' },
  { id: 'S5', chip: 'Ngày 2', bg: RoomMorning, bgProps: { kitchen: 'clean' }, mood: 'neutral_smile', pose: P.offer, outfit: 'xam-tui', note: 'Cho mượn cả tên mình: trao máy, đắc ý.' },
  { id: 'S6', chip: 'Ngày 2 · tối', bg: StudyDeskNight, bgProps: { phone: 'hidden' }, mood: 'hesitant', pose: lean(STAND_POSE, { neck: -10, tilt: 4 }), outfit: 'xam-tui', night: true, note: 'Câu hỏi mình không trả lời nổi.' },
  { id: 'S7', chip: 'Ngày 2 · khuya', bg: BedCorner, bgProps: { night: true, door: 'latched' }, mood: 'calm', pose: lean(STAND_POSE, { neck: 4, tilt: -3 }), outfit: 'xam-tui', night: true, note: '“Lần này tao tự làm.” Quyết tâm.' },
  { id: 'S7b', chip: 'Ngày 3 · sáng', bg: SchoolYard, mood: 'calm', pose: lean(STAND_POSE, { neck: 4 }), outfit: 'dong-phuc', note: 'Tự đến trường đúng giờ, lần đầu không nhờ ai.' },
  { id: 'S8', chip: 'Ngày 3', bg: HallwayStairs, bgProps: { move: { truck: 110 } }, mood: 'scared', pose: P.stride, outfit: 'dong-phuc', note: 'Mặc đồng phục định ra chỗ đông người, tìm đường xuống cầu thang.' },
  { id: 'S9', chip: 'Ngày 3', bg: MirrorCorner, bgProps: { night: true, move: { truck: -110 } }, mood: 'shocked', pose: P.wary, outfit: 'dong-phuc', night: true, note: 'Trước gương. Nhạc cắt cụt ngay sau nhịp này.' },
];

export const BEAT_FRAMES = 15; // 0,5 giây mỗi nhịp ở 30 fps: mỗi bối cảnh chỉ thoáng qua (yêu cầu 10/11/2026)
export const BLEND = 4; // số frame hòa nền và nối dáng giữa hai nhịp
export const LAST_HOLD = 12; // nhịp cuối giữ thêm trước khi cắt đen
export const introTotal = BEATS_INTRO.length * BEAT_FRAMES;
export const storyTotal = BEATS_STORY.length * BEAT_FRAMES + LAST_HOLD;

const NAM = { x: 960, y: 150, scale: 2.35 };

/** Một khung hình của đoạn, thuần theo tham số để vừa dùng trong Remotion vừa xuất bảng tĩnh. */
export const NamCenterFrame: React.FC<{ beat: Beat; prev?: Beat; t: number; k: number; blinkOn?: boolean; showChip?: boolean }> = ({ beat, prev, t, k, blinkOn = false, showChip = false }) => {
  // t: 0..1 tiến độ hòa từ nhịp trước sang nhịp này; k: 0..1 tiến độ trong nhịp (để nền trôi).
  const pose = prev && t < 1 ? mixPose(prev.pose, beat.pose, t) : beat.pose;
  const mood = prev && t < 0.5 ? prev.mood : beat.mood;
  const outfit = prev && t < 0.5 ? prev.outfit : beat.outfit;
  const night = prev && t < 0.5 ? !!prev.night : !!beat.night;
  const drift = (k - 0.5) * -46;
  const breathe = 1 + Math.sin(k * Math.PI * 2) * 0.004;
  const Bg = ({ b, op }: { b: Beat; op: number }) => (
    <div style={{ position: 'absolute', inset: 0, opacity: op, transform: `translateX(${drift}px) scale(1.1)`, filter: 'blur(2.2px) saturate(.9)' }}>
      <b.bg {...b.bgProps} />
    </div>
  );
  return (
    <AbsoluteFill style={{ background: '#111' }}>
      {prev && t < 1 && <Bg b={prev} op={1} />}
      <Bg b={beat} op={prev ? Math.min(1, t) : 1} />
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="nam-sep" cx=".5" cy=".55" r=".5"><stop offset="0" stopColor="#10140f" stopOpacity=".38" /><stop offset="1" stopColor="#10140f" stopOpacity="0" /></radialGradient>
          <filter id="nam-night"><feColorMatrix type="matrix" values=".52 0 0 0 .02  0 .56 0 0 .03  0 0 .7 0 .08  0 0 0 1 0" /></filter>
          <filter id="nam-day"><feColorMatrix type="matrix" values="1.02 0 0 0 0  0 1 0 0 0  0 0 .96 0 0  0 0 0 1 0" /></filter>
          <radialGradient id="nam-vig" cx=".5" cy=".5" r=".72"><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".45" /></radialGradient>
        </defs>
        <ellipse cx={960} cy={760} rx={520} ry={600} fill="url(#nam-sep)" />
        <g filter={night ? 'url(#nam-night)' : 'url(#nam-day)'} transform={`translate(960 1080) scale(${breathe}) translate(-960 -1080)`}>
          <StudentTwinBody mood={mood} pose={{ ...pose, view: 'front' }} outfit={outfit} x={NAM.x} y={NAM.y} scale={NAM.scale} blink={blinkOn} />
        </g>
        <rect width={1920} height={1080} fill="url(#nam-vig)" />
        {showChip && (
          <g opacity={interpolate(t, [0.3, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
            <text x={84} y={112} fontFamily="'JetBrains Mono', 'DejaVu Sans Mono', monospace" fontSize={34} letterSpacing={3} fill="#f3ead6" stroke="#1b211d" strokeWidth={6} paintOrder="stroke">{beat.chip.toUpperCase()}</text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

const useBeat = (beats: Beat[], frame: number) => {
  const i = Math.min(beats.length - 1, Math.floor(frame / BEAT_FRAMES));
  const local = frame - i * BEAT_FRAMES;
  const span = i === beats.length - 1 ? BEAT_FRAMES + LAST_HOLD : BEAT_FRAMES;
  const t = i === 0 ? 1 : Math.min(1, local / BLEND);
  return { beat: beats[i], prev: i > 0 ? beats[i - 1] : undefined, t, k: Math.min(1, local / span), blink: i > 0 && local >= 1 && local <= 3 };
};

/** Clip riêng: 13 nhịp liền, giới thiệu rồi hé cả truyện. */
export const BEATS_ALL: Beat[] = [...BEATS_INTRO, ...BEATS_STORY];
export const allTotal = BEATS_ALL.length * BEAT_FRAMES + LAST_HOLD;
export const HoSo02NamGiuaKhung: React.FC = () => {
  const s = useBeat(BEATS_ALL, useCurrentFrame());
  return <NamCenterFrame beat={s.beat} prev={s.prev} t={s.t} k={s.k} blinkOn={s.blink} />;
};

/** Phần 1 (giới thiệu): 4 nhịp. */
export const HoSo02TrailerIntro: React.FC = () => {
  const s = useBeat(BEATS_INTRO, useCurrentFrame());
  return <NamCenterFrame beat={s.beat} prev={s.prev} t={s.t} k={s.k} blinkOn={s.blink} />;
};

/** Phần 2 (hé cả truyện): 9 nhịp, nhịp cuối giữ thêm rồi để timeline cắt đen. */
export const HoSo02TrailerStory: React.FC = () => {
  const s = useBeat(BEATS_STORY, useCurrentFrame());
  return <NamCenterFrame beat={s.beat} prev={s.prev} t={s.t} k={s.k} blinkOn={s.blink} />;
};

/** Bảng tĩnh để duyệt: mỗi nhịp một ô, giữa nhịp. */
export const HoSo02TrailerBoard: React.FC = () => {
  const all = [...BEATS_INTRO, ...BEATS_STORY];
  const cols = 4, w = 960, h = 540, gap = 24, head = 90, cap = 64;
  const rows = Math.ceil(all.length / cols);
  const W = cols * w + (cols + 1) * gap, H = head + rows * (h + cap + gap) + gap;
  return (
    <div style={{ width: W, height: H, background: '#202a25', position: 'relative', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ position: 'absolute', left: gap, top: 26, color: '#f0e5cd', fontSize: 40, fontWeight: 700 }}>HỒ SƠ 2 · CLIP RIÊNG — NAM GIỮA KHUNG, BỐI CẢNH VÀ TRANG PHỤC ĐỔI THEO DÒNG THỜI GIAN</div>
      {all.map((b, i) => {
        const x = gap + (i % cols) * (w + gap), y = head + Math.floor(i / cols) * (h + cap + gap);
        return (
          <div key={b.id} style={{ position: 'absolute', left: x, top: y, width: w }}>
            <div style={{ width: w, height: h, overflow: 'hidden', position: 'relative' }}>
              <div style={{ width: 1920, height: 1080, transform: 'scale(.5)', transformOrigin: '0 0', position: 'relative' }}>
                <NamCenterFrame beat={b} t={1} k={0.5} />
              </div>
            </div>
            <div style={{ color: '#dfe6d8', fontSize: 24, marginTop: 8, lineHeight: 1.3 }}><b>{b.id}</b> · {b.chip} · <i>{b.mood}</i> · {b.outfit} — {b.note}</div>
          </div>
        );
      })}
    </div>
  );
};
export const BOARD_SIZE = (() => { const cols = 4, w = 960, h = 540, gap = 24, head = 90, cap = 64; const n = BEATS_INTRO.length + BEATS_STORY.length; const rows = Math.ceil(n / cols); return { width: cols * w + (cols + 1) * gap, height: head + rows * (h + cap + gap) + gap }; })();
