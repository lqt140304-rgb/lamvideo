import type { VideoScript } from "./types";
import xeDienHaNoi from "../videos/xe-dien-ha-noi/script.json";
import xeDienChungCu from "../videos/xe-dien-chung-cu/script.json";
import xeDien5Nam from "../videos/xe-dien-5-nam/script.json";

// Thêm video mới: tạo videos/<slug>/script.json rồi import và thêm vào danh sách này.
export const videos: VideoScript[] = [xeDienHaNoi as VideoScript, xeDienChungCu as VideoScript, xeDien5Nam as VideoScript];
