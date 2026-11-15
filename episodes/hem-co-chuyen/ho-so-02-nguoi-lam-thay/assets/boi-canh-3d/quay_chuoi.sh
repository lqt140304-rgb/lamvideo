#!/usr/bin/env bash
# Quay một shot Hồi 3 thành MP4 nháp, tối ưu thời gian (15/11/2026).
#   ./quay_chuoi.sh <giang_duong|san_truong|bo_ke> <CAMERA> <đầu> <cuối> [bước=2] [mức=nhap] [tham số thêm…]
# Ví dụ: ./quay_chuoi.sh san_truong ST_STEADICAM 1 144 2 nhap
#        ./quay_chuoi.sh bo_ke BK_EWS 1 480 4 nhap --chuyen
# - Render mọi khung trong MỘT tiến trình Blender: cảnh dựng 1 lần, persistent data giữ BVH/texture giữa các khung.
# - bước > 1: chỉ render mỗi N khung rồi nội suy lên 24 fps bằng ffmpeg minterpolate (nháp duyệt nhịp, không thay bản cuối).
# - Shot máy tĩnh và cảnh không có gì chuyển động (vd GD_BUC giữ 6 s): đặt đầu = cuối để render 1 khung, ffmpeg tự giữ khung thành clip.
set -euo pipefail
S=$1; CAM=$2; F0=$3; F1=$4; STEP=${5:-2}; MUC=${6:-nhap}; shift $(( $# < 6 ? $# : 6 ))
PY=${PY:-/tmp/bpyenv/bin/python}; W=${WIDTH:-960}
DIR=$(cd "$(dirname "$0")" && pwd); OUT=${OUT:-/tmp/quay/$S-$CAM}; mkdir -p "$OUT"
START=$(date +%s)
"$PY" "$DIR/$S.py" --cam "$CAM" --muc "$MUC" --width "$W" --anim "$F0,$F1,$STEP" --out "$OUT/k" "$@" 2>&1 | grep -E "Saved|rror|toi_uu" || true
N=$(( (F1 - F0) / STEP + 1 )); FPS_IN=$(echo "scale=3; 24/$STEP" | bc)
if [ "$F0" = "$F1" ]; then
  SO_GIAY=${GIU:-6}
  ffmpeg -loglevel error -y -loop 1 -i "$OUT/k_$(printf %04d "$F0").png" -t "$SO_GIAY" -r 24 -pix_fmt yuv420p "$OUT/$CAM.mp4"
else
  ffmpeg -loglevel error -y -framerate "$FPS_IN" -pattern_type glob -i "$OUT/k_*.png" -vf "minterpolate=fps=24:mi_mode=blend" -pix_fmt yuv420p "$OUT/$CAM.mp4"
fi
echo "Xong $N khung trong $(( $(date +%s) - START )) s → $OUT/$CAM.mp4"
