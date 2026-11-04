import { Config } from "@remotion/cli/config";

// Ảnh trung gian JPEG cho render nhanh, MP4 H.264 hợp với TikTok / Reels / Shorts.
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setCodec("h264");
Config.setCrf(18);
// yuv420p chuẩn (không phải yuvj420p "full range") để mọi nền tảng hiển thị đúng màu
Config.setPixelFormat("yuv420p");
Config.setOverwriteOutput(true);
