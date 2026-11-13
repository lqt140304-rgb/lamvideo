"""Kiểm tra va chạm/xuyên vật thể trong sân: xe/người chạy (46 vật chuyển động, lấy mẫu 58 khung) vs đồ tĩnh, xe vs xe, đồ tĩnh vs đồ tĩnh, đồ gắn tường nhúng sâu vào khối nhà. Chạy: /tmp/bpyenv/bin/python kiem_xuyen.py (in ra danh sách cặp va chạm; các cặp cùng một nhân vật/xe là bình thường)."""
import sys, math, collections
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.argv = ['x', '--mode', 'day', '--no-render']
import numpy as np, bpy
import xay_phong_tro as X
sc = X.build('day', 10.0, 0.0, 0.0, 'SAN_XE', (200, 84))
objs = [o for o in bpy.data.objects if o.type == 'MESH']
def aabb(o):
    m = np.array(o.matrix_world); bb = np.array([list(v) + [1] for v in o.bound_box]) @ m.T
    return bb[:, :3].min(0), bb[:, :3].max(0)
roots = [o for o in bpy.data.objects if o.type == 'EMPTY' and o.name.startswith(('env_cd_xm', 'env_cd_oto', 'env_cd_nguoi', 'env_ktt_ganh', 'env_ktt_xedap'))]
mover_kids = collections.defaultdict(list)
for o in objs:
    p = o
    while p.parent is not None: p = p.parent
    if p in roots: mover_kids[p.name].append(o)
kid_set = {k.name for v in mover_kids.values() for k in v}
def sub(n): return n.startswith('env_') and (n.startswith(('env_ktt', 'env_cd')) or any(t in n for t in ('banh_xm', 'xm_', 'than_cay', 'tan_chinh', 'cum_la', 'cot_dien', 'bon_cay', 'dat_bon', 'thung_rac', 'ghe_nhua', 'cot_t1', 'canh', 'goc_cay', 'bien_so', 'ktt_')))
SKIP = ('san_tang1', 'long_duong', 'via_he', 'vach', 'khoi_', 'tuong', 'nha_doi', 'dd_san', 'mai_', 'luoi', 'vet', 'reu', 'gach', 'o1_', 'khuon', 'dd_', 'cua_', 'cuon', 'khoi', 'hem', 'xa_')
stat = []
for o in objs:
    n = o.name
    if n in kid_set or not n.startswith('env_') or any(s in n for s in SKIP): continue
    lo, hi = aabb(o)
    if hi[0] < -7.8 or lo[0] > -1.0 or lo[1] > 70 or hi[1] < -13 or lo[2] > -1.0 + 0 or hi[2] < -2.95: pass
    # design x = W - world x ; sân design x in [-7.6,-1.45] -> world x in [4.45,10.6]
    if not (hi[0] > 4.3 and lo[0] < 10.8 and hi[1] > -13 and lo[1] < 62 and hi[2] > -2.95 and lo[2] < 1.0): continue
    if (hi - lo).max() > 6: continue
    stat.append((n, lo, hi))
print('static objs in sân:', len(stat), 'movers:', len(roots))
res = collections.Counter(); ex = {}
def base(n):
    import re
    return re.sub(r'[\d_\.\-]+$', '', re.sub(r'\d+(\.\d+)?', '#', n))[:28]
slo = np.array([s[1] for s in stat]); shi = np.array([s[2] for s in stat])
for fr in range(1, 700, 12):
    sc.frame_set(fr); bpy.context.view_layer.update()
    for r in roots:
        kl = mover_kids[r.name]
        if not kl: continue
        ab = [aabb(k) for k in kl]; lo = np.min([a[0] for a in ab], 0); hi = np.max([a[1] for a in ab], 0)
        # bỏ qua khi đang thu nhỏ ở hai đầu vòng
        if (hi - lo).max() < 0.5: continue
        ov = (shi > lo + 0.03) & (slo < hi - 0.03)
        hit = np.where(ov.all(1))[0]
        for h in hit:
            nm = stat[h][0]
            if nm.startswith(r.name): continue
            key = (base(r.name), base(nm)); res[key] += 1; ex.setdefault(key, (fr, r.name, nm))
for k, v in res.most_common(40): print(v, k, ex[k])
# --- mover vs mover
print('--- mover vs mover')
rr = collections.Counter(); ex2 = {}
for fr in range(1, 700, 6):
    sc.frame_set(fr); bpy.context.view_layer.update()
    bb = {}
    for r in roots:
        kl = mover_kids[r.name]
        if not kl: continue
        ab = [aabb(k) for k in kl]; bb[r.name] = (np.min([a[0] for a in ab], 0), np.max([a[1] for a in ab], 0))
    names = list(bb)
    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            a, b = bb[names[i]], bb[names[j]]
            if (a[1] - a[0]).max() < 0.5 or (b[1] - b[0]).max() < 0.5: continue
            if (a[0] < b[1] - 0.05).all() and (b[0] < a[1] - 0.05).all():
                key = (base(names[i]), base(names[j])); rr[key] += 1; ex2.setdefault(key, (fr, names[i], names[j]))
for k, v in rr.most_common(20): print(v, k, ex2[k])
print('--- static vs static (ktt/cd vs khác)')
S2 = [s for s in stat if s[0].startswith('env_ktt') or 'xm_' in s[0] or 'banh_xm' in s[0] or 'than_cay' in s[0] or 'bon_cay' in s[0] or 'cot_dien' in s[0] or 'thung_rac' in s[0] or 'ghe_nhua' in s[0]]
c3 = collections.Counter(); ex3 = {}
import re
def grp(n): return re.sub(r'[\d\.\-_]+', '', n.replace('env_', '').replace('ktt_', ''))[:14]
for i in range(len(S2)):
    for j in range(i + 1, len(S2)):
        a, b = S2[i], S2[j]
        if (a[1] < b[2] - 0.04).all() and (b[1] < a[2] - 0.04).all():
            ga, gb = grp(a[0]), grp(b[0])
            if ga == gb: continue
            k = tuple(sorted((ga, gb))); c3[k] += 1; ex3.setdefault(k, (a[0], b[0], a[1].round(2), a[2].round(2)))
for k, v in c3.most_common(40): print(v, k, ex3[k])
print('--- nhúng sâu vào tường/khối nhà')
big = [(o.name, *aabb(o)) for o in objs if o.name.startswith('env_') and any(t in o.name for t in ('nha_doi_dien_than', 'tuong_t1', 'tuong_t3', 'khoi_cuoi', 'khoi_sau', 'khoi_mai', 'dd_tuong', 'nha_hx', 'hx_'))]
big = [b for b in big if (b[2] - b[1]).min() > 0.1]
print('khối lớn:', [(b[0], ) for b in big][:10])
cnt = collections.Counter(); exs = {}
for o in objs:
    n = o.name
    if not n.startswith(('env_ktt', 'env_hc_', 'env_cd')) or n in kid_set: continue
    lo, hi = aabb(o)
    for b in big:
        pen = np.minimum(hi, b[2]) - np.maximum(lo, b[1])
        if (pen > 0.07).all() and (hi - lo).min() > 0.0:
            k = (base(n), b[0][:22]); cnt[k] += 1; exs.setdefault(k, (n, pen.round(2)))
for k, v in cnt.most_common(25): print(v, k, exs[k])
