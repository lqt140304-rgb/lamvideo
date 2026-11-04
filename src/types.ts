// Kịch bản video: một file JSON trong videos/<slug>/script.json.
// Mỗi cảnh có `voice` (câu để máy đọc, số viết bằng chữ) và `sub` (phụ đề hiện trên màn hình, số viết bằng số).

import type { MascotPose } from "./mascot";
export type { MascotPose };

/** Ảnh thật chèn vào cảnh. Tải bằng `npm run images -- <slug>` hoặc tự đặt file vào public/<slug>/img/. */
export type Broll = {
  /** Tên file trong public/<slug>/img/, ví dụ "giao-thong.jpg". */
  file: string;
  /** Từ khóa (tiếng Anh cho kết quả tốt hơn) để công cụ tự tìm ảnh giấy phép mở trên Openverse. */
  query?: string;
  /** Chọn kết quả thứ mấy trong danh sách tìm được (0 = đầu tiên). */
  pick?: number;
  /** Ghi nguồn tự viết (khi tự đặt ảnh), mặc định lấy từ credits.json. */
  credit?: string;
  /** Nhãn vàng trên ảnh. */
  caption?: string;
  /** Hiện đúng lúc giọng đọc tới cụm từ này (chép nguyên văn từ "voice"). Ưu tiên hơn from/to. */
  say?: string;
  /** Giữ ảnh bao nhiêu giây khi dùng `say` (mặc định 2.2). */
  hold?: number;
  /** Lấy đích danh một file trên Wikimedia Commons, ví dụ "File:Hoan Kiem Lake.jpg". */
  commons?: string;
  /** Chỉ lấy ảnh chụp từ ngày này, ví dụ "2024-01-01" (null = không giới hạn). Ghi đè cài đặt chung. */
  since?: string | null;
  /** "newest" = ưu tiên ảnh mới, "relevant" = ưu tiên ảnh khớp từ khóa. */
  prefer?: "newest" | "relevant";
  /** Ảnh phải chứa ít nhất một từ này trong tên/mô tả (lọc kết quả tìm kiếm). */
  must?: string[];
  /** Hiện từ … đến … (phần của cảnh, 0..1). */
  from?: number;
  to?: number;
  /** "full" tràn màn hình (mặc định) hoặc "card" khung polaroid. */
  style?: "full" | "card";
  /** Điểm giữ khi cắt ảnh, kiểu CSS object-position, ví dụ "30% 50%". */
  focus?: string;
  /** Hướng lia ảnh: 1 sang phải, -1 sang trái, 0 đứng yên. */
  pan?: number;
  /** Riêng "card": vị trí đỉnh khung (px) và độ nghiêng. */
  y?: number;
  tilt?: number;
};

/** Thông tin ảnh đã tải, đọc từ public/<slug>/img/credits.json. */
export type ImageCredits = Record<string, { short: string; full?: string; license?: string; landing?: string }>;

type SceneBase = {
  voice: string;
  broll?: Broll | Broll[];
  sub?: string;
  /** Giây đệm thêm sau giọng đọc (mặc định 0.35). */
  pad?: number;
};

export type HookScene = SceneBase & {
  type: "hook";
  headline: string[];
  stamp?: string;
};

export type ZonesScene = SceneBase & {
  type: "zones";
  headline: string;
  /** 1 = lõi Hoàn Kiếm, 2 = + Cửa Nam, 3 = cả Vành đai 1 */
  level: 1 | 2 | 3;
  pose?: MascotPose;
};

export type TimelineStep = {
  when: string;
  what: string;
  /** Lúc bước này hiện ra, tính theo phần của cảnh (0..1). */
  at: number;
  level: 1 | 2 | 3;
};

export type TimelineScene = SceneBase & {
  type: "timeline";
  headline: string;
  steps: TimelineStep[];
};

export type CompareCard = {
  label: string;
  kind: "petrol" | "electric";
  /** Số để chạy đếm, ví dụ 46000 */
  amount?: number;
  /** Chữ hiển thị thay cho số (nếu có), ví dụ "6–7.000đ" */
  amountText?: string;
  unit: string;
  note?: string;
  at: number;
};

export type CompareScene = SceneBase & {
  type: "compare";
  headline: string;
  cards: [CompareCard, CompareCard];
  footnote?: string;
};

export type ListScene = SceneBase & {
  type: "list";
  tone: "good" | "bad";
  headline: string;
  items: string[];
  /** Lúc từng dòng hiện ra (0..1). Bỏ trống thì chia đều. */
  at?: number[];
  pose?: MascotPose;
};

export type VerdictScene = SceneBase & {
  type: "verdict";
  headline: string;
  left: { title: string; items: string[] };
  right: { title: string; items: string[] };
  /** Lúc cột phải hiện ra (0..1). */
  rightAt?: number;
};

export type OutroScene = SceneBase & {
  type: "outro";
  kicker: string;
  message: string[];
  cta: string;
};

export type Scene =
  | HookScene
  | ZonesScene
  | TimelineScene
  | CompareScene
  | ListScene
  | VerdictScene
  | OutroScene;

export type VideoScript = {
  /** Trùng tên thư mục trong videos/ và public/, chỉ dùng a-z, 0-9, dấu gạch ngang. */
  id: string;
  title: string;
  /** Nhãn chủ đề ở đầu khung hình. */
  topic: string;
  voice: { engine: "vieneu"; speaker: string };
  /** Đường dẫn nhạc nền trong public/, ví dụ "music/nhac-nen.mp3". */
  music?: string | null;
  /** Cài đặt tìm ảnh chung cho cả video, ví dụ { "since": "2024-01-01", "prefer": "newest" } cho video tin tức. */
  images?: { since?: string | null; prefer?: "newest" | "relevant" };
  musicVolume?: number;
  scenes: Scene[];
};

/** File public/<slug>/voice/voice.json do tools/voice.py ghi ra. */
export type VoiceManifest = {
  speaker: string;
  scenes: { file: string; seconds: number; hash: string }[];
};

export type SceneTiming = {
  from: number;
  frames: number;
  audio: string | null;
};
