import type { VideoScript } from "./types";
import xeDienHaNoi from "../videos/xe-dien-ha-noi/script.json";

// Thêm video mới: tạo videos/<slug>/script.json rồi import và thêm vào danh sách này.
export const videos: VideoScript[] = [xeDienHaNoi as VideoScript];
