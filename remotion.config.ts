import { Config } from "@remotion/cli/config";

// Ảnh trung gian JPEG cho render nhanh, MP4 H.264 hợp với TikTok / Reels / Shorts.
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setCodec("h264");
Config.setCrf(18);
Config.setOverwriteOutput(true);
