"""Xuất các cặp đường nối UV của base nữ (mỗi cạnh lưới có hai đoạn UV khác nhau; mỗi đoạn kèm đỉnh thứ ba của mặt để biết phía trong đảo) ra duong-noi-uv.json.

D:/blender/blender.exe -b ../nhan-vat-nu-goc/nhan-vat-nu-goc.blend --python xuat_duong_noi_uv.py
da_lien_mau.py dùng file này để chuyển màu mềm cả hai phía đường nối giáp bộ đồ cũ.
"""
import json
from pathlib import Path

import bpy

me = bpy.data.objects['Base_Nu_LOD0'].data
uv = me.uv_layers[0].data
canh = {}
for p in me.polygons:
    n = len(p.loop_indices)
    for i in range(n):
        la, lb = p.loop_indices[i], p.loop_indices[(i + 1) % n]
        lc = p.loop_indices[(i + 2) % n]  # đỉnh còn lại: chỉ hướng vào trong đảo UV
        va, vb = me.loops[la].vertex_index, me.loops[lb].vertex_index
        key = (min(va, vb), max(va, vb))
        seg = (tuple(uv[la].uv), tuple(uv[lb].uv)) if va < vb else (tuple(uv[lb].uv), tuple(uv[la].uv))
        seg = seg + (tuple(uv[lc].uv),)
        canh.setdefault(key, []).append(seg)
cap = []
for segs in canh.values():
    if len(segs) == 2:
        a, b = segs
        if max(abs(x - y) for p, q in zip(a[:2], b[:2]) for x, y in zip(p, q)) > 1e-5:
            cap.append([[list(t) for t in a], [list(t) for t in b]])
out = Path(__file__).resolve().parent / 'duong-noi-uv.json'
out.write_text(json.dumps(cap), encoding='utf-8')
print('PASS: xuất', len(cap), 'cặp đường nối UV')
