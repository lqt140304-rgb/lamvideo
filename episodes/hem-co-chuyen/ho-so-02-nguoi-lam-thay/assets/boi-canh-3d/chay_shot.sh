#!/bin/sh
# Bảng khung hình theo danh sách shot (ảnh tĩnh, chưa nhân vật): xuất vào xem-thu/shot/ rồi ghép bảng.
PY=${PY:-python3}
D=$(dirname "$0")/xem-thu/shot; mkdir -p "$D"
for c in ${CAMS:-A01 A02 A02B A03 A04 A04B A05 C05 C06 P203 P201VENT ORBIT_A ORBIT_B ORBIT_C GUONG_XIEN GUONG_POV}; do
  g=real; case $c in GUONG_POV) g=pov;; esac
  $PY "$(dirname "$0")/xay_phong_tro.py" --mode ${MODE:-day} --cam $c --guong $g --out "$D/$c.png" --samples ${SAMPLES:-32} --width ${WIDTH:-720} || echo "lỗi $c"
done
