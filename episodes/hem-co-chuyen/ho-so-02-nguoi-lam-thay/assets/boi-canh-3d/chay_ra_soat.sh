#!/bin/sh
# Rà soát mọi camera tĩnh: ảnh nhỏ vào /tmp/ra-soat (ghép bảng bằng ra_soat_bang.py)
PY=${PY:-python3}; OUT=${OUT:-/tmp/ra-soat}; mkdir -p $OUT
for c in ${CAMS:-WIDE DESK BED DOOR KITCHEN HALL HALL_DOOR HALL_FACE HALL_STAIR HALL_END HALL_LONG GUONG GUONG_XIEN GUONG_VAI GUONG_POV A01 A02 A02B A03 A04 A04B A05 C05 C06 P203 P201VENT ORBIT_A ORBIT_B ORBIT_C TT_GIUONG TT_BEP TT_GUONG TT_CUA TT_BAN TOAN_CANH CUA_SO SAN_THUONG LOW TOP}; do
  g=real; d=10; case $c in GUONG_POV) g=pov;; P201VENT) d=0;; esac
  $PY "$(dirname "$0")/xay_phong_tro.py" --mode ${MODE:-day} --cam $c --guong $g --door $d --out "$OUT/$c.png" --samples ${SAMPLES:-12} --width ${WIDTH:-480} >/dev/null 2>&1 || echo "lỗi $c"
done
echo RSDONE
