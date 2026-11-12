#!/bin/sh
# Xuất bộ ảnh xem thử (không commit ảnh nặng ngoài bộ nhỏ trong xem-thu/). Cần: python3.11 -m venv v && v/bin/pip install bpy ; apt libegl1 nếu thiếu.
PY=${PY:-python3}
D=$(dirname "$0")/xem-thu; mkdir -p "$D"
for spec in "day WIDE" "night WIDE" "day DESK" "night DESK" "day KITCHEN" "day DOOR" "day BED" "day HALL" "night HALL_DOOR" "day HALL_FACE" "night HALL_FACE" "night HALL_END" "day HALL_END" "day HALL_LONG" "day HALL_STAIR" "day TOP"; do
  set -- $spec
  $PY "$(dirname "$0")/xay_phong_tro.py" --mode $1 --cam $2 --out "$D/$2_$1.png" --samples ${SAMPLES:-64} --width ${WIDTH:-1280}
done
