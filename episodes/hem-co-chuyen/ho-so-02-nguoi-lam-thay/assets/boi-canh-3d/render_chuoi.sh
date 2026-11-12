#!/bin/sh
# Render chuỗi shot cuối (SEQUENCE trong camera_dong.py) thành video MP4.
#   PY=/tmp/bpyenv/bin/python STEP=2 WIDTH=640 SAMPLES=14 OUT=/tmp/chuoi ./render_chuoi.sh
# STEP=2 → render mỗi 2 khung, video phát 12 fps (nhanh gấp đôi, chuyển động thô hơn). STEP=1 → 24 fps đầy đủ.
# Mỗi shot dựng cảnh 1 lần (≈5 s) rồi render các khung; log thời gian ở $OUT/thoi-gian.log. Không commit khung/video nặng.
PY=${PY:-python3}; STEP=${STEP:-2}; WIDTH=${WIDTH:-640}; SAMPLES=${SAMPLES:-14}; OUT=${OUT:-/tmp/chuoi}
HERE=$(dirname "$0"); mkdir -p "$OUT"; : > "$OUT/thoi-gian.log"; : > "$OUT/ds.txt"
SHOTS=${SHOTS:-"ESTABLISH_SAN TOAN_CANH_DEM HL_DOLLY STEADI_RA_HL TT_CUA_PUSH A03_ARC PAN_BEP_CUA TT_BEP_PUSH RACK_FOCUS_BAN HANDHELD_A04 SAN_VAP TT_GIUONG_PUSH TOP_XOAY ORBIT_GUONG VERTIGO_GUONG KINH_NUOC KINH_NUOC_POV"}
FPS=$((24 / STEP))
for s in $SHOTS; do
  t0=$(date +%s)
  $PY "$HERE/camera_dong.py" --shot $s --all --step $STEP --out "$OUT/$s" --samples $SAMPLES --width $WIDTH >"$OUT/$s.log" 2>&1 || echo "LỖI $s" >> "$OUT/thoi-gian.log"
  n=$(ls "$OUT/$s" 2>/dev/null | wc -l); t1=$(date +%s)
  echo "$s: $n khung, $((t1 - t0)) s" >> "$OUT/thoi-gian.log"
  [ "$n" -gt 0 ] && ffmpeg -y -loglevel error -framerate $FPS -pattern_type glob -i "$OUT/$s/${s}_*.png" -c:v libx264 -pix_fmt yuv420p -crf 20 "$OUT/$s.mp4" && echo "file '$OUT/$s.mp4'" >> "$OUT/ds.txt"
done
ffmpeg -y -loglevel error -f concat -safe 0 -i "$OUT/ds.txt" -c copy "$OUT/chuoi-shot.mp4" && echo "XONG $OUT/chuoi-shot.mp4" >> "$OUT/thoi-gian.log"
