#!/usr/bin/env bash
# Script tiện ích: Chuyển đổi chuỗi ảnh PNG render từ Blender sang video WebM Alpha (VP9)
# Sử dụng: ./convert-blender-to-alpha.sh <thư_mục_chứa_png> <tên_file_ra.webm> [fps]

set -e

INPUT_DIR="${1:-.}"
OUTPUT_FILE="${2:-output_alpha.webm}"
FPS="${3:-30}"

if [ ! -d "$INPUT_DIR" ]; then
  echo "Lỗi: Không tìm thấy thư mục $INPUT_DIR"
  exit 1
fi

echo "Đang xử lý chuỗi ảnh PNG tại '$INPUT_DIR' với tốc độ ${FPS}fps..."

# Tìm file PNG đầu tiên để xác định pattern
FIRST_FILE=$(find "$INPUT_DIR" -maxdepth 1 -name "*.png" | sort | head -n 1)

if [ -z "$FIRST_FILE" ]; then
  echo "Lỗi: Không tìm thấy file .png nào trong $INPUT_DIR"
  exit 1
fi

echo "File bắt đầu: $FIRST_FILE"

# Xuất sang WebM VP9 với Alpha Channel yuva420p
ffmpeg -y -framerate "$FPS" \
  -pattern_type glob -i "$INPUT_DIR/*.png" \
  -c:v libvpx-vp9 \
  -pix_fmt yuva420p \
  -b:v 2.5M \
  -auto-alt-ref 0 \
  "$OUTPUT_FILE"

echo "Hoàn thành! Đã tạo file video Alpha: $OUTPUT_FILE"
