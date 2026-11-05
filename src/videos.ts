import type { VideoScript } from "./types";
import xeDienHaNoi from "../videos/xe-dien-ha-noi/script.json";
import xeDienChungCu from "../videos/xe-dien-chung-cu/script.json";
import xeDien5Nam from "../videos/xe-dien-5-nam/script.json";
import simDoiDienThoai from "../videos/sim-doi-dien-thoai/script.json";
import hoKhauGiay from "../videos/ho-khau-giay/script.json";
import thueChoThueNha from "../videos/thue-cho-thue-nha/script.json";
import guiTietKiem from "../videos/gui-tiet-kiem/script.json";
import vangNhanVangMieng from "../videos/vang-nhan-vang-mieng/script.json";
import thueTncnMoi from "../videos/thue-tncn-moi/script.json";
import myThue125 from "../videos/my-thue-12-5/script.json";
import bhytTraiTuyen from "../videos/bhyt-trai-tuyen/script.json";
import cauLongVietNam from "../videos/cau-long-viet-nam/script.json";
import lonRoiHenDuHoi from "../videos/lon-roi-hen-du-hoi/script.json";
import ngayXuaMaiNaoCungGap from "../videos/ngay-xua-mai-nao-cung-gap/script.json";

// Thêm video mới: tạo videos/<slug>/script.json rồi import và thêm vào danh sách này.
export const videos: VideoScript[] = [xeDienHaNoi as VideoScript, xeDienChungCu as VideoScript, xeDien5Nam as VideoScript, simDoiDienThoai as VideoScript, hoKhauGiay as VideoScript, thueChoThueNha as VideoScript, guiTietKiem as VideoScript, vangNhanVangMieng as VideoScript, thueTncnMoi as VideoScript, myThue125 as VideoScript, bhytTraiTuyen as VideoScript, cauLongVietNam as VideoScript, lonRoiHenDuHoi as VideoScript, ngayXuaMaiNaoCungGap as VideoScript];
