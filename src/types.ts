// Kịch bản video: một file JSON trong videos/<slug>/script.json.
// Mỗi cảnh có `voice` (câu để máy đọc, số viết bằng chữ) và `sub` (phụ đề hiện trên màn hình, số viết bằng số).

import type { MascotPose } from "./mascot";
export type { MascotPose };

/** Ảnh thật chèn vào cảnh. Tải bằng `npm run images -- <slug>` hoặc tự đặt file vào public/<slug>/img/. */
export type Broll = {
  /** Tên file trong public/<slug>/img/, ví dụ "giao-thong.jpg". */
  file: string;
  /** Link trực tiếp tới file ảnh (.jpg/.png) do bạn hoặc ChatGPT tìm; kèm `credit`. Có `url` thì công cụ không tự tìm nữa. */
  url?: string;
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

/** Kiểu máy quay của cảnh: in = zoom vào chậm, out = zoom ra chậm, drift = trôi nhẹ, punch = giật zoom lúc chốt ý, none = đứng yên. Bỏ trống = tự chọn xen kẽ. */
export type CamMove = "in" | "out" | "drift" | "punch" | "none";

type SceneBase = {
  voice: string;
  /** Kiểu máy quay (zoom) của cảnh. */
  cam?: CamMove;
  /** Kiểu chuyển cảnh ĐI VÀO cảnh này. Bỏ trống = tự chọn xen kẽ. */
  transition?: "wipe" | "iris" | "bar" | "flash" | "none";
  /** Cụm từ trong lời đọc làm "điểm chốt": dấu đóng/giật zoom xảy ra đúng lúc đọc tới cụm này. */
  cue?: string;
  broll?: Broll | Broll[];
  /** Nhãn nguồn nhỏ nằm dưới phụ đề, không bị camera zoom cắt. */
  source?: string;
  sub?: string;
  /** Giây đệm thêm sau giọng đọc (mặc định 0.35). */
  pad?: number;
};

export type ArtName =
  | "phone" | "house" | "money" | "doc" | "gold" | "shield" | "bank"
  | "idcard" | "lockphone" | "rentsign" | "piggy" | "ring" | "taxform" | "ship" | "medcard" | "chart" | "racket" | "shuttle" | "rally";

export type HookScene = SceneBase & {
  type: "hook";
  headline: string[];
  stamp?: string;
  /** Hình lớn ở cảnh mở đầu. Bỏ trống = xe máy chạy trên phố (video xe cộ). */
  art?: ArtName | "scooter";
  /** Bố cục: poster (mặc định) | number (con số khổng lồ) | news (khung tin nóng) | question (dấu hỏi lớn). */
  layout?: "poster" | "number" | "news" | "question";
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
  /** Chỉ dùng khi cảnh vẽ bản đồ Vành đai 1 (art = "zone"). */
  level?: 1 | 2 | 3;
};

export type TimelineScene = SceneBase & {
  type: "timeline";
  headline: string;
  steps: TimelineStep[];
  /** Hình bên trên các bước. Bỏ trống = bản đồ Vành đai 1 (video Hà Nội). */
  art?: ArtName | "zone" | "none" | "commute";
};

export type CompareCard = {
  label: string;
  kind: "petrol" | "electric" | "generic";
  /** Hình trong thẻ khi kind = "generic". */
  art?: ArtName;
  /** Màu nhấn của thẻ generic: "red" | "green" | "blue" | "yellow". */
  tint?: "red" | "green" | "blue" | "yellow";
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
  /** Nhãn trên biểu đồ cột, ví dụ "Tiết kiệm ~85%". Bỏ trống thì tự tính cho xe xăng/xe điện. */
  badge?: string;
  /** false = không vẽ biểu đồ cột dưới các thẻ. */
  bars?: boolean;
  /** Bố cục: cards (mặc định) | slider (một khung chia đôi) | duel (hai thanh ngang xếp chồng). */
  layout?: "cards" | "slider" | "duel";
};

export type ListScene = SceneBase & {
  type: "list";
  tone: "good" | "bad";
  headline: string;
  items: string[];
  /** Lúc từng dòng hiện ra (0..1). Bỏ trống thì chia đều. */
  at?: number[];
  pose?: MascotPose;
  /** Bố cục: rows (mặc định) | tiles (ô vuông) | notes (giấy nhớ) | clipboard (bảng kẹp giấy). */
  layout?: "rows" | "tiles" | "notes" | "clipboard";
  /** Riêng "tiles": hình BigArt thay cho biểu tượng nhỏ ở từng ô. */
  arts?: ArtName[];
};

export type VerdictScene = SceneBase & {
  type: "verdict";
  headline: string;
  left: { title: string; items: string[] };
  right: { title: string; items: string[] };
  /** Lúc cột phải hiện ra (0..1). */
  rightAt?: number;
  /** Bố cục: columns (mặc định) | scale (cái cân). */
  layout?: "columns" | "scale";
  /** Riêng "scale": bên nào nặng hơn. */
  heavier?: "left" | "right" | "even";
};

/** Một con số lớn chạy đếm trong vòng tròn, kèm vài thẻ nhỏ. */
export type StatScene = SceneBase & {
  type: "stat";
  headline: string;
  /** Giá trị hiển thị, ví dụ "350" hoặc "15,5". Số trong đó sẽ chạy đếm. */
  value: string;
  unit?: string;
  /** Độ đầy của vòng tròn (0..1). */
  ring?: number;
  chips?: { text: string; at: number }[];
  pose?: MascotPose;
};

/** Các bước làm xếp so le, nối bằng mũi tên. */
export type StepsScene = SceneBase & {
  type: "steps";
  headline: string;
  steps: { title: string; detail?: string; at: number }[];
};

/** Hiểu lầm → sự thật, từng cặp một. */
export type MythScene = SceneBase & {
  type: "myth";
  headline: string;
  pairs: { myth: string; fact: string; at: number }[];
};

/** Khung chat hỏi đáp. */
export type ChatScene = SceneBase & {
  type: "chat";
  title?: string;
  /** Có thì hiện mascot lớn dưới khung chat (khung chat gọn lại). */
  pose?: MascotPose;
  messages: { from: "user" | "bot"; text: string; at: number }[];
};

/** Hóa đơn / phép tính từng dòng. */
export type ReceiptScene = SceneBase & {
  type: "receipt";
  headline: string;
  rows: { label: string; value: string; at: number }[];
  total: { label: string; value: string; at: number };
};

/** Bậc thang tăng dần (biểu thuế, mức phí...). */
export type LadderScene = SceneBase & {
  type: "ladder";
  headline: string;
  rungs: { label: string; value: string; at: number }[];
  pose?: MascotPose;
};

export type OutroScene = SceneBase & {
  type: "outro";
  kicker: string;
  message: string[];
  cta: string;
};

/** Cảnh kể chuyện: nền theo tâm trạng, nhân vật, bóng thoại, điện thoại, dòng chữ lớn. */
export type StoryScene = SceneBase & {
  type: "story";
  /** Nền: warm (nắng chiều ấm) | dusk (hoàng hôn) | night (đêm) | net (quán net, ánh neon) | dawn (sáng, hy vọng). */
  mood: "warm" | "dusk" | "night" | "net" | "dawn";
  cast?: {
    pose?: MascotPose;
    /** Vị trí ngang 0..1 (0.5 = giữa khung). */
    x: number;
    /** Đi từ x đến `toX` trong cảnh (từ `at` đến `to`, mặc định cả cảnh). */
    toX?: number;
    scale?: number;
    flip?: boolean;
    /** Xoay màu áo (độ), để phân biệt các bạn. */
    hue?: number;
    /** Bật lên lúc nào (0..1). */
    at?: number;
    /** Đứng trong khung cửa sổ riêng (cảnh mỗi đứa một máy). */
    box?: boolean;
  }[];
  /** Bóng thoại trên đầu nhân vật `who` (chỉ số trong cast). */
  bubbles?: { who: number; text: string; at: number; tone?: "say" | "think" }[];
  /** Điện thoại lớn có tin nhắn. */
  phone?: { name?: string; msgs: { from: "me" | "them"; text: string; at: number }[] };
  /** Dòng chữ lớn hiện lần lượt, không khung. */
  lines?: { text: string; at: number }[];
};

/** Nhân vật trong truyện nhiều giọng. */
export type Speaker = "MINH" | "BOM" | "NA" | "TEO";
export type ActorPose = "stand" | "wave" | "point" | "think" | "surprised" | "cheer" | "sad" | "angry" | "walk" | "run" | "sit" | "phone" | "happy";

/** Một lượt thoại: mỗi lượt đọc bằng giọng riêng của nhân vật và xuất thành file riêng theo `id`. */
export type DialogLine = {
  id: string;
  /** Nhân vật (MINH/BOM/NA/TEO) hoặc vai trong ký ức: NARR (người kể), BE, BA, ONG. */
  who: Speaker | "NARR" | "BE" | "BA" | "ONG";
  /** Bắt đầu đúng giây này (tính từ đầu cảnh) thay vì nối tiếp lượt trước. Dùng cho cảnh ký ức. */
  at?: number;
  /** Lời thoại sáng tác minh họa (không phải lời thật của ai). */
  invented?: boolean;
  /** Lời được đọc (số viết bằng chữ). */
  text: string;
  /** Phụ đề (số viết bằng số); bỏ trống thì dùng `text`. */
  sub?: string;
  /** Tư thế của người nói từ lượt này. */
  pose?: ActorPose;
  /** Phản ứng của người khác từ lượt này, ví dụ { BOM: "surprised" }. */
  react?: Partial<Record<Speaker, ActorPose>>;
  /** Khoảng lặng (giây) trước lượt này; mặc định 0,3. */
  gap?: number;
  /** Lời nhắc lại từ cảnh trước (lóe ấm một nhịp). */
  flash?: boolean;
};

/** Cảnh hội thoại nhiều nhân vật trên nền ảnh thật. */
export type DialogScene = SceneBase & {
  type: "dialog";
  /** Mã cảnh, ví dụ S03. */
  id: string;
  bg: { file: string; focus?: string; zoom?: number; pan?: number; grade?: "past" | "present" | "warm" | "night" };
  /** Dòng mặt đất (px từ trên) nơi nhân vật đứng. */
  floor?: number;
  /** Chữ nhỏ đầu cảnh, ví dụ "Hồi còn đi học". */
  label?: string;
  cast: { who: Speaker; x: number; scale?: number; pose?: ActorPose; flip?: boolean; fromLine?: number; toLine?: number; path?: [number, number][]; tile?: number; tileY?: number }[];
  props?: { name: string; x: number; y: number; scale?: number; front?: boolean; flip?: boolean; fromLine?: number; toLine?: number }[];
  lines: DialogLine[];
  /** Ảnh tư liệu chèn từ lượt `fromLine` đến hết lượt `toLine`. */
  inserts?: { file: string; fromLine: number; toLine: number; caption?: string; y?: number }[];
  /** Thẻ cuối, không đọc. */
  endCard?: { text: string; small?: string };
  /** Chữ nhỏ cho điện thoại / nhóm chat hiện ở góc, ví dụ tên nhóm. */
  chip?: string;
};

/** Cảnh ký ức làng quê: nền ảnh thật + nhân vật/đồ vật hoạt hình chuyển động. */
export type MemoryScene = SceneBase & {
  type: "memory";
  id: string;
  kind: "grass" | "road" | "kite" | "yard" | "quiet";
  bg: { file: string; focus?: string; zoom?: number; zoomTo?: number; panFrom?: number; panTo?: number; grade?: "past" | "present" | "warm" | "night" };
  /** Độ dài tối thiểu của cảnh (giây) kể cả khi lời kể ngắn hơn. */
  minSeconds: number;
  label?: string;
  lines: DialogLine[];
  endCard?: { text: string; small?: string };
};

export type Scene =
  | MemoryScene
  | DialogScene
  | StoryScene
  | HookScene
  | ZonesScene
  | TimelineScene
  | CompareScene
  | ListScene
  | VerdictScene
  | OutroScene
  | StatScene
  | StepsScene
  | MythScene
  | ChatScene
  | ReceiptScene
  | LadderScene;

export type VideoScript = {
  /** Trùng tên thư mục trong videos/ và public/, chỉ dùng a-z, 0-9, dấu gạch ngang. */
  id: string;
  title: string;
  /** Nhãn chủ đề ở đầu khung hình. */
  topic: string;
  voice: { engine: "vieneu"; speaker: string };
  /** Tên kênh hiện ở góc trên (mặc định theo brand). */
  channel?: string;
  /** Ẩn nhãn kênh, chủ đề và thanh tiến độ ở đầu khung. */
  hideHeader?: boolean;
  /** Truyện nhiều giọng: mã nhân vật → tên giọng VieNeu. */
  voices?: Record<string, string>;
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
  scenes: { file: string; seconds: number; hash: string; lines?: { id: string; start: number; seconds: number }[] }[];
};

export type SceneTiming = {
  from: number;
  frames: number;
  audio: string | null;
  /** Cảnh hội thoại: mốc bắt đầu và độ dài (khung hình, tính từ đầu cảnh) của từng lượt thoại. */
  lines?: { from: number; frames: number }[];
};
