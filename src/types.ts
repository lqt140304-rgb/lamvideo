// Kịch bản video: một file JSON trong videos/<slug>/script.json.
// Mỗi cảnh có `voice` (câu để máy đọc, số viết bằng chữ) và `sub` (phụ đề hiện trên màn hình, số viết bằng số).

export type Mood = "happy" | "shocked" | "calm" | "smug" | "sad" | "neutral";
export type Pose = "idle" | "point" | "shrug" | "calm" | "cheer" | "wave";

type SceneBase = {
  voice: string;
  sub?: string;
  /** Giây đệm thêm sau giọng đọc (mặc định 0.35). */
  pad?: number;
};

export type HookScene = SceneBase & {
  type: "hook";
  headline: string[];
  stamp?: string;
  mood?: Mood;
};

export type ZonesScene = SceneBase & {
  type: "zones";
  headline: string;
  /** 1 = lõi Hoàn Kiếm, 2 = + Cửa Nam, 3 = cả Vành đai 1 */
  level: 1 | 2 | 3;
  mood?: Mood;
  pose?: Pose;
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
  pose?: Pose;
  mood?: Mood;
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
