"""NAM — THÂN DỰNG BẰNG CONTROL CAGE (thiết kế: THIET-KE-THAN-CAGE.md, kế hoạch: KE-HOACH-THAN-CAGE.md).

Chạy:  D:/blender/blender.exe -b --factory-startup --python dung_than_cage_nam.py -- [--check] [--render DIR] [--blend FILE] [--samples N] [--mau ẢNH] [--phong-dir DIR]
Đơn vị m, sàn Z = 0, mặt −Y, trái nhân vật = +X. Đầu/tóc/mặt từ dung_dau_nam.py (không sửa), phóng đều HEAD_K như v2.11.

Cấu trúc
  00_Than_Cu_v211 (ẩn render): Nam_Dau_Than_v211 + Nam_Than_goc — bản cũ dựng lại bằng dung_than_nam.py để đối chiếu.
  02_Body_Base: Nam_Than_Cage (nửa cage, Mirror + Subdivision 1, sửa được), Nam_Dau_Than (bản lắp ráp; cẳng tay đóng nắp ở cổ tay, chờ bàn tay mới), Nam_BanChan.L/.R (bàn chân cũ, nối tạm).
Chỉ đạt hình khối tĩnh; chưa rig, chưa kiểm biến dạng.
"""
import sys, os, math, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree
import dung_dau_nam as D
import dung_than_nam as T

KZ = T.KZ
H_TARGET, H_TOL = 1.6004, 0.001
GAP_MIN = 0.004                                   # khe nách / khe háng tối thiểu (m)
OLD_COLL, NEW_COLL = '00_Than_Cu_v211', '02_Body_Base'


# ================================================================== bản cũ
def build_old():
    sc = T.build_scene(voxel=0.0025)
    c = bpy.data.collections[NEW_COLL]; c.name = OLD_COLL; c.hide_render = True
    bpy.data.objects['Nam_Dau_Than'].name = 'Nam_Dau_Than_v211'
    sc.collection.children.link(bpy.data.collections.new(NEW_COLL))
    return sc


# ================================================================== CAGE (toạ độ thế giới, m; nửa x ≥ 0)
# Mỗi mức thân: z, w nửa ngang, f nhô trước, b nhô sau (tính từ trục yc), n độ vuông tiết diện (2 = elip). Nửa vòng 7 đỉnh: 0 giữa trước … 3 bên … 6 giữa sau.
# Mức 'co' lấy đúng vòng cổ của đầu (neck_target) để dải nối ngắn và thẳng. Số đo mẫu: ảnh NAM — 3D TURNAROUND, 1 px = 2,326 mm, sàn ở hàng 730.
CAGE_LEVELS = [
    dict(ten='co',        z=None,  w=None,  f=None,  b=None,  n=2.0, yc=None),
    dict(ten='chan_co',   z=0.880, w=0.174, f=0.095, b=0.100, n=2.0),
    dict(ten='vai',       z=0.835, w=0.201, f=0.123, b=0.100, n=2.2),
    dict(ten='nguc',      z=0.775, w=0.160, f=0.140, b=0.098, n=2.2),
    dict(ten='duoi_nguc', z=0.690, w=0.146, f=0.163, b=0.092, n=2.2),
    dict(ten='bung',      z=0.630, w=0.155, f=0.176, b=0.104, n=2.2),
    dict(ten='eo',        z=0.580, w=0.163, f=0.170, b=0.128, n=2.2),
    dict(ten='chau',      z=0.525, w=0.170, f=0.153, b=0.133, n=2.3),
    dict(ten='day_chau',  z=0.475, w=0.172, f=0.121, b=0.117, n=2.3),
]
CO_K = 1.08                                     # vòng 'co' của cage rộng hơn vòng cổ đầu: biên Subdivision co lại ~8%
LIMB_K = 1.06                                    # vòng cổ tay/mắt cá của cage = tiết diện cũ; Subdivision làm ống nhỏ hơn mép cũ chút ít → mép cũ chui vào ống, không thành gờ
CAP_LEN = 0.015                                  # ống tay/chân đi tiếp vào trong bàn tay/chân rồi đóng nắp (giấu trong khối)
STUB = 0.012                                     # đoạn cổ của bàn tay/chân cũ lồng vào trong ống
Z_HANG = 0.025                                   # đỉnh háng thấp hơn mức day_chau
# Giữ hõm nách cao, miệng khe hẹp gần vai và chuyển mềm xuống bắp tay.
# Giữ vị trí khuỷu/cổ tay; chuyển tiếp độ cong phía trên, không đổi tay/chân rời.
CAGE_OVERRIDE = {                                # (tên mức, chỉ số đỉnh 0..6) → (dx, dy, dz), mét
    ('nguc', 2): (-0.006, 0.012, 0.004),
    ('nguc', 4): (-0.006, -0.008, 0.004),
    ('duoi_nguc', 2): (-0.006, 0.012, 0.046),
    ('duoi_nguc', 3): (-0.010, 0.0, 0.065),
    ('duoi_nguc', 4): (-0.006, -0.010, 0.046),
}
AXILLA_CREASE = 0.12                             # nếp mềm; hõm do hình khối, không tạo mép sắc như tay áo
ARM_RINGS = [   # tâm (x, y, z), rx nửa ngang, ry nửa sâu; 'ax' chỉnh riêng trục vòng gốc để hõm nách không bị kéo thấp
    # Thu phần ngoài của gốc tay và hạ nhẹ: vai không bị đội lên; mép trong
    # vẫn gặp đáy nách cao. Bắp tay giữa về gần thân, giữ khuỷu/cổ tay đã khớp.
    dict(ten='dau_bap_tay',   c=(0.183, 0.000, 0.758), rx=0.052, ry=0.052, ax=(0.3000, 0.0, -0.953939)),
    dict(ten='giua_bap_tay',  c=(0.194, 0.000, 0.660), rx=0.056, ry=0.054, inner_relief=0.004),
    # Trục nghỉ cũ = c(giua_cang_tay) - c(giua_bap_tay cũ): giữ vòng khuỷu
    # để thay đổi gốc tay không truyền qua Subdivision tới cổ tay đã gắn.
    dict(ten='khuyu',         c=(0.214, -0.003, 0.605), rx=0.053, ry=0.051, ax=(0.029, -0.005, -0.110)),
    dict(ten='giua_cang_tay', c=(0.225, -0.005, 0.550), rx=0.050, ry=0.048),
    dict(ten='co_tay',        c=(0.236, -0.008, 0.540 * KZ), rx=0.047, ry=0.045),   # cổ tay cũ; ống đóng nắp tròn — chờ bàn tay mới (chủ repo đang dựng, chưa ghép)
]
LEG_RINGS = [
    dict(ten='dau_dui',  c=(0.097, 0.000, 0.405), rx=0.072, ry=0.076),
    dict(ten='giua_dui', c=(0.099, 0.000, 0.320), rx=0.070, ry=0.072),
    dict(ten='goi',      c=(0.099, -0.002, 0.240), rx=0.066, ry=0.066),
    dict(ten='bap_chan', c=(0.097, 0.002, 0.180), rx=0.065, ry=0.066),
    dict(ten='mat_ca',   c=(0.0925, 0.002, 0.140 * KZ), rx=0.065, ry=0.066),  # đặt lại theo mặt cắt bàn chân cũ
]


def _levels():
    """CAGE_LEVELS đã điền mức 'co' theo vòng cổ của đầu (sau phóng HEAD_K và thu cổ)."""
    A, BF, BB, YC, nf, nb = T.neck_target(); out = []
    for L in CAGE_LEVELS:
        L = dict(L)
        if L['ten'] == 'co': L.update(z=T.RING_Z - 0.006, w=A * CO_K, f=BF * CO_K, b=BB * CO_K, yc=YC)
        L.setdefault('yc', 0.0); out.append(L)
    return out


def level_ring(L):
    """Nửa vòng 7 đỉnh của một mức (siêu elip; nửa trước dùng f, nửa sau dùng b), đã cộng CAGE_OVERRIDE."""
    e = 2.0 / L['n']; pts = []
    for k in range(7):
        th = math.pi * k / 6; s, c = math.sin(th), math.cos(th)
        x = 0.0 if k in (0, 6) else L['w'] * abs(s) ** e
        y = L['yc'] - L['f'] * abs(c) ** e if c >= 0 else L['yc'] + L['b'] * abs(c) ** e
        d = CAGE_OVERRIDE.get((L['ten'], k), (0, 0, 0)); pts.append(Vector((x + d[0], y + d[1], L['z'] + d[2])))
    return pts


def limb_ring(c, prev_c, next_c, rx, ry, ax=None):
    """Vòng 8 đỉnh vuông góc trục chi (trục = next − prev, hoặc `ax` nếu cho): 0 ngoài, 2 trước (−Y), 4 trong, 6 sau."""
    ax = Vector(ax).normalized() if ax else (Vector(next_c) - Vector(prev_c)).normalized(); X = ax.cross(Vector((0, 1, 0))).normalized(); Y = X.cross(ax).normalized()
    if Y.y < 0: Y = -Y
    return [Vector(c) + X * (rx * math.cos(math.pi * j / 4)) - Y * (ry * math.sin(math.pi * j / 4)) for j in range(8)]


def build_cage(coll):
    lv = _levels(); names = [L['ten'] for L in lv]; iv, ing, idn, idc = names.index('vai'), names.index('nguc'), names.index('duoi_nguc'), names.index('day_chau')
    bm = bmesh.new(); mid = bm.verts.layers.float.new('duong_giua'); tay = bm.verts.layers.float.new('tay'); chan = bm.verts.layers.float.new('chan')
    V = []
    for i, L in enumerate(lv):
        row = []
        for k, p in enumerate(level_ring(L)):
            if i == ing and k == 3: row.append(None); continue          # đỉnh bên của mức ngực nằm trong lỗ nách
            v = bm.verts.new(p); v[mid] = 1.0 if k in (0, 6) else 0.0; row.append(v)
        V.append(row)
    def quad(a, b, c, d): bm.faces.new((a, d, c, b))                    # a,b trên; d,c dưới → pháp tuyến ra ngoài
    for i in range(len(lv) - 1):
        for k in range(6):
            if i in (iv, ing) and k in (2, 3): continue                    # 4 mặt lỗ nách
            quad(V[i][k], V[i][k + 1], V[i + 1][k + 1], V[i + 1][k])
    def limb(loop, rings, layer, start):
        cs = [start] + [Vector(r['c']) for r in rings]; prev = loop
        for n_, r in enumerate(rings):
            nxt = cs[n_ + 2] if n_ + 2 < len(cs) else cs[n_ + 1] + (cs[n_ + 1] - cs[n_])
            points = limb_ring(r['c'], cs[n_], nxt, r['rx'], r['ry'], r.get('ax'))
            # Chỉ thu mặt trong tay (nửa cage +X), không đẩy đường bao ngoài ra:
            # khe mở dần xuống dưới trong khi bắp tay vẫn thả gần thân.
            for j, p in enumerate(points):
                p.x += r.get('inner_relief', 0.0) * max(0.0, -math.cos(math.pi * j / 4)) ** 2
            ring = [bm.verts.new(p) for p in points]
            for v in ring: v[layer] = 1.0
            for j in range(8): bm.faces.new((prev[j], ring[j], ring[(j + 1) % 8], prev[(j + 1) % 8]))
            prev = ring
        ax = (cs[-1] - cs[-2]).normalized(); c_end = sum((v.co for v in prev), Vector()) / 8          # nắp: một vòng nhỏ + quạt về tâm, nằm trong bàn tay/chân
        cap = [bm.verts.new(c_end + ax * CAP_LEN + (v.co - c_end) * 0.55) for v in prev]; tip = bm.verts.new(c_end + ax * (CAP_LEN + 0.006))
        for v in cap + [tip]: v[layer] = 1.0
        for j in range(8):
            bm.faces.new((prev[j], cap[j], cap[(j + 1) % 8], prev[(j + 1) % 8])); bm.faces.new((cap[j], tip, cap[(j + 1) % 8]))
    hole = [V[iv][3], V[iv][2], V[ing][2], V[idn][2], V[idn][3], V[idn][4], V[ing][4], V[iv][4]]
    limb(hole, ARM_RINGS, tay, sum((v.co for v in hole), Vector()) / 8)
    crease = bm.edges.layers.float.new('crease_edge')
    for a, b in ((hole[3], hole[4]), (hole[4], hole[5])):
        bm.edges.get((a, b))[crease] = AXILLA_CREASE
    L = lv[idc]; hang = bm.verts.new((0.0, (L['b'] - L['f']) / 2 + L['yc'], L['z'] - Z_HANG)); hang[mid] = 1.0
    loop = [V[idc][3], V[idc][2], V[idc][1], V[idc][0], hang, V[idc][6], V[idc][5], V[idc][4]]
    limb(loop, LEG_RINGS, chan, sum((v.co for v in loop), Vector()) / 8)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    z_nach = V[idn][3].co.z                      # giữ số trước khi new_obj giải phóng BMesh
    ob = D.new_obj('Nam_Than_Cage', bm, coll, None)
    m = ob.modifiers.new('Mirror', 'MIRROR'); m.use_axis = (True, False, False); m.use_clip = True; m.use_mirror_merge = True; m.merge_threshold = 1e-4
    s = ob.modifiers.new('Subsurf', 'SUBSURF'); s.levels = 1; s.render_levels = 1
    ob['z_nach'] = z_nach; ob['z_hang'] = L['z'] - Z_HANG
    for p in ob.data.polygons: p.use_smooth = True
    return ob


# ================================================================== bàn tay/chân cũ, nối cổ, lắp ráp
def _part(src, center, normal, near, stub=0.02):
    """Phần lưới `src` phía trước mặt phẳng (center − normal·stub, normal), chỉ giữ thành phần liền gần điểm `near`."""
    bm = bmesh.new(); bm.from_mesh(src.data); bm.transform(src.matrix_world)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=center - normal * stub, plane_no=normal, clear_inner=True)
    bm.verts.ensure_lookup_table(); seed = min(bm.verts, key=lambda v: (v.co - near).length); keep, stack = set(), [seed]
    while stack:
        v = stack.pop()
        if v in keep: continue
        keep.add(v); stack += [e.other_vert(v) for e in v.link_edges if e.other_vert(v) not in keep]
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v not in keep], context='VERTS')
    # đoạn cổ (sau mặt cắt, luôn nằm trong ống cage) thu dần về 85% quanh trục để chắc chắn được ống bọc kín
    pts = [v.co for v in bm.verts if abs((v.co - center).dot(normal)) < 0.003]; c0 = sum(pts, Vector()) / len(pts)
    for v in bm.verts:
        d = (v.co - center).dot(normal)
        if d < 0:
            k = 1.0 - 0.15 * min(1.0, -d / stub); r_ = v.co - c0 - normal * (v.co - c0).dot(normal); v.co -= r_ * (1.0 - k)
    return bm


def _section(bm, center, normal, X, Y):
    """Tâm và nửa kích thước tiết diện tại mặt phẳng (center, normal) theo hai trục X, Y."""
    pts = [v.co for v in bm.verts if abs((v.co - center).dot(normal)) < 0.003]
    c = sum(pts, Vector()) / len(pts); c = c - normal * (c - center).dot(normal)
    return c, max(abs((p - c).dot(X)) for p in pts), max(abs((p - c).dot(Y)) for p in pts)


def split_hands_feet(old_body, coll):
    """Cắt bàn chân cũ (giữ nguyên hình, kèm đoạn cổ STUB) thành vật riêng; đặt lại vòng mat_ca của cage theo mặt cắt. Trả dict vật + 'mat_cat'."""
    # Chỉ bàn chân: bàn tay mới do chủ repo dựng riêng, chưa ghép (14/11/2026). Chân cắt ở z 0,10 — trên đó ống chân cũ đều r ≈ 6,7 cm, dưới là mu/gót loe ra.
    ln = T.LEG[-1]
    cuts = {'Nam_BanChan': (Vector((ln[0], ln[1], 0.100)), Vector((0, 0, -1)), Vector((0.106, -0.05, 0.03)))}
    out, sec = {}, {}
    for name, (c, nrm, near) in cuts.items():
        for sfx, sg_ in (('.L', 1), ('.R', -1)):
            cc, nn, ne = c.copy(), nrm.copy(), near.copy(); cc.x *= sg_; nn.x *= sg_; ne.x *= sg_
            bm = _part(old_body, cc, nn, ne, STUB)
            if sg_ == 1:
                X = nn.cross(Vector((0, 1, 0))).normalized(); Y = X.cross(nn).normalized(); Y = Y if Y.y > 0 else -Y
                sec[name] = (cc, nn) + _section(bm, cc, nn, X, Y)
            me = bpy.data.meshes.new(name + sfx); bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new(name + sfx, me); coll.objects.link(ob)
            me.materials.append(old_body.data.materials[0]); me.shade_smooth(); out[name + sfx] = ob
    for rings, key, nm in ((LEG_RINGS, 'mat_ca', 'Nam_BanChan'),):
        _, _, c0, rx, ry = sec[nm]; r = next(r for r in rings if r['ten'] == key); r.update(c=tuple(c0), rx=rx * LIMB_K, ry=rx * LIMB_K)   # ry = rx: gốc ngón cái/gót không làm phình ống
    out['mat_cat'] = {k: (tuple(round(x, 4) for x in v[2]), round(v[3], 4), round(v[4], 4)) for k, v in sec.items()}
    return out


def _ordered_loop(edges):
    """Xếp các cạnh biên của một vòng thành dãy đỉnh liên tiếp, ngược chiều kim đồng hồ nhìn từ trên, bắt đầu ở đỉnh phía trước nhất (−Y)."""
    adj = {}
    for e in edges:
        a, b = e.verts; adj.setdefault(a, []).append(b); adj.setdefault(b, []).append(a)
    bad = [v for v, nb in adj.items() if len(nb) != 2]
    if bad: raise ValueError(f'biên không phải một vòng đơn: {len(edges)} cạnh, {len(bad)} đỉnh bậc ≠ 2, ví dụ {[tuple(round(c, 3) for c in v.co) for v in bad[:4]]}')
    start = next(iter(adj)); loop, prev = [start], None
    while True:
        nxt = [v for v in adj[loop[-1]] if v is not prev][0]
        if nxt is start: break
        prev = loop[-1]; loop.append(nxt)
    c = sum((v.co for v in loop), Vector()) / len(loop)
    area = sum((a.co.x - c.x) * (b.co.y - c.y) - (b.co.x - c.x) * (a.co.y - c.y) for a, b in zip(loop, loop[1:] + loop[:1]))
    if area < 0: loop.reverse()
    i0 = min(range(len(loop)), key=lambda i: abs(math.atan2(loop[i].co.y - c.y, loop[i].co.x - c.x) + math.pi / 2))
    return loop[i0:] + loop[:i0]


def neck_strip(bm, body_loop, head_loop):
    """Nối vòng thân (n đỉnh) với vòng đầu (m = r·n, r ∈ {1,2,3}); hai vòng cùng chiều, cùng gốc ở giữa trước. Không thêm đỉnh."""
    n, m = len(body_loop), len(head_loop)
    if m % n or m // n not in (1, 2, 3): raise ValueError(f'vòng cổ đầu {m} không chia hết cho vòng thân {n}')
    r = m // n; k = r // 2; faces = []
    for i in range(n):
        a, b = body_loop[i], body_loop[(i + 1) % n]; h = [head_loop[(r * i + t) % m] for t in range(r + 1)]
        if r == 1: faces.append(bm.faces.new((a, b, h[1], h[0]))); continue
        for t in range(k): faces.append(bm.faces.new((a, h[t + 1], h[t])))
        for t in range(k, r): faces.append(bm.faces.new((b, h[t + 1], h[t])))
        faces.append(bm.faces.new((a, b, h[k])))
    return faces


def assemble_cage(head, cage, skin):
    """Bản sao đầu (cắt ở vòng cổ) + cage đã áp Mirror + Subdivision 2, nối bằng neck_strip; trước khi nối chỉ làm mượt theo phương ngang các đỉnh thân trong 16 mm dưới vòng cắt (không đụng đầu)."""
    body = cage.copy(); body.data = cage.data.copy(); bpy.context.scene.collection.objects.link(body)
    body.modifiers['Subsurf'].levels = 2
    for md in list(body.modifiers): T.apply_mod(body, md)
    ob = T.cut_open_head_copy(head)
    bm = bmesh.new(); bm.from_mesh(ob.data); nh = len(bm.verts); bm.from_mesh(body.data); bpy.data.objects.remove(body, do_unlink=True)
    bm.verts.index_update(); bm.verts.ensure_lookup_table(); bm.edges.ensure_lookup_table()   # chỉ số đỉnh thân phải ≥ nh
    mats = list(ob.data.materials); skin_idx = len(mats); ob.data.materials.append(skin)
    for f in bm.faces:
        if all(v.index >= nh for v in f.verts): f.material_index = skin_idx
    bnd = [e for e in bm.edges if len(e.link_faces) == 1]
    HL = _ordered_loop([e for e in bnd if all(v.index < nh for v in e.verts)]); BL = _ordered_loop([e for e in bnd if all(v.index >= nh for v in e.verts)])
    m, n = len(HL), len(BL); r = m // n if n else 0; print(f'    vòng cổ đầu {m}, vòng thân {n}, r = {r}')
    for i, v in enumerate(BL):                                          # đỉnh biên thân về đúng vị trí ngang của đỉnh đầu tương ứng, giữ cao độ
        h = HL[(r * i) % m].co; v.co.x, v.co.y = h.x, h.y
    bl = set(BL); zone = [v for v in bm.verts if v.index >= nh and v.co.z > T.RING_Z - 0.016 and v not in bl]
    for _ in range(12): bmesh.ops.smooth_vert(bm, verts=zone, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=False)
    for f in neck_strip(bm, BL, HL): f.material_index = skin_idx
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    for f in bm.faces: f.smooth = True
    bm.to_mesh(ob.data); bm.free(); ob.data.update()
    ob['co_m'], ob['co_n'], ob['co_nh'], ob['co_z'] = m, n, nh, T.RING_Z; ob['z_nach'], ob['z_hang'] = cage['z_nach'], cage['z_hang']
    for c in list(ob.users_collection): c.objects.unlink(ob)
    cage.users_collection[0].objects.link(ob); T.bake_eye_mask(ob, setup_shader=False); return ob


# ================================================================== đo
def _mesh_world(ob, dg=None):
    dg = dg or bpy.context.evaluated_depsgraph_get(); ev = ob.evaluated_get(dg); me = ev.to_mesh()
    vs = [ev.matrix_world @ v.co for v in me.vertices]; return ev, me, vs


def _attr(me, name):
    a = me.attributes.get(name)
    if not a: return None
    out = [0.0] * len(me.vertices); a.data.foreach_get('value', out); return out


def body_levels():
    """Các mức đo thân (tên, z thế giới) theo CAGE_LEVELS."""
    return [(L['ten'], L['z']) for L in _levels()]


def widths_table(ob):
    """Bề ngang toàn phần (bỏ tay), nhô trước (−y) và sau (+y) của thân theo các mức; bỏ tay bằng thuộc tính `tay` nếu có,
    không thì giữ cụm đỉnh liền từ đường giữa ra (dừng ở khe |x| > 6 mm đầu tiên = khe nách)."""
    ev, me, vs = _mesh_world(ob); tay = _attr(me, 'tay'); ev.to_mesh_clear(); out = {}
    for name, z in body_levels():
        pts = [v for i, v in enumerate(vs) if abs(v.z - z) < 0.004 and (tay is None or tay[i] < 0.5)]
        if tay is None and pts:
            xs = sorted(abs(p.x) for p in pts); lim = xs[-1]
            for a_, b_ in zip(xs, xs[1:]):
                if b_ - a_ > 0.006: lim = a_; break
            pts = [p for p in pts if abs(p.x) <= lim]
        out[name] = (round(z, 3), round(2 * max(abs(p.x) for p in pts), 3), round(-min(p.y for p in pts), 3), round(max(p.y for p in pts), 3)) if pts else None
    return out


def _height(sc):
    objs = [o for o in sc.objects if o.type in ('MESH', 'CURVE') and T.visible(o) and o.name != 'San' and o.name != 'Nam_Than_Cage']
    lo, hi = T.bbox(objs, bpy.context.evaluated_depsgraph_get()); return lo.z, hi.z


def _boundary_loops(bm):
    edges = [e for e in bm.edges if len(e.link_faces) == 1]; seen, loops = set(), []
    for e in edges:
        if e.index in seen: continue
        stack, n = [e], 0
        while stack:
            x = stack.pop()
            if x.index in seen: continue
            seen.add(x.index); n += 1
            for v in x.verts:
                stack += [y for y in v.link_edges if len(y.link_faces) == 1 and y.index not in seen]
        loops.append(n)
    return loops


def _slice_gap(vs, a_idx, b_idx, z0, z1):
    """Khoảng cách nhỏ nhất giữa hai tập đỉnh trong dải z0..z1 (KD tree)."""
    A = [vs[i] for i in a_idx if z0 <= vs[i].z <= z1]; B = [vs[i] for i in b_idx if z0 <= vs[i].z <= z1]
    if not A or not B: return None
    kd = KDTree(len(B))
    for i, p in enumerate(B): kd.insert(p, i)
    kd.balance(); return min(kd.find(p)[2] for p in A)


def check_all(sc):
    res = {'neck_strip': test_neck_strip()}; obj = bpy.data.objects.get
    asm = obj('Nam_Dau_Than'); cage = obj('Nam_Than_Cage')
    asm_ok = asm is not None and NEW_COLL in [c.name for c in asm.users_collection]
    miss = lambda n: (False, f'thiếu {n}')
    # chiều cao
    if asm_ok:
        lo, hi = _height(sc); h = hi - lo; res['chieu_cao'] = (abs(h - H_TARGET) <= H_TOL and abs(lo) < 0.001, f'đáy {lo:.4f} đỉnh {hi:.4f} cao {h:.4f} m')
    else: res['chieu_cao'] = miss('Nam_Dau_Than')
    # cage
    if cage:
        ms = {m.type: m for m in cage.modifiers}; sub = ms.get('SUBSURF')
        res['cage_co'] = ('MIRROR' in ms and sub is not None and sub.levels == 1, f'modifier {list(ms)}')
        mid = _attr(cage.data, 'duong_giua'); xs = [v.co.x for v in cage.data.vertices]
        if mid is None: res['cage_duong_giua'] = (False, 'thiếu thuộc tính duong_giua')
        else:
            bad = [i for i, m in enumerate(mid) if m > 0.5 and abs(xs[i]) > 1e-6]; neg = [x for x in xs if x < -1e-6]
            res['cage_duong_giua'] = (sum(m > 0.5 for m in mid) > 0 and not bad and not neg, f'{int(sum(m > 0.5 for m in mid))} đỉnh giữa, lệch {len(bad)}, x âm {len(neg)}')
        if sub: sub.show_viewport = False
        ev, me, _ = _mesh_world(cage); bm = bmesh.new(); bm.from_mesh(me); ev.to_mesh_clear()
        if sub: sub.show_viewport = True
        loops = _boundary_loops(bm); nm = sum(1 for e in bm.edges if len(e.link_faces) > 2); bm.free()
        res['cage_bien'] = (loops == [12] and nm == 0, f'{len(loops)} vòng biên {sorted(loops)} (cần đúng 1 vòng cổ 12 cạnh; tay/chân đóng nắp trong bàn tay/chân), cạnh >2 mặt {nm}')
    else:
        for k in ('cage_co', 'cage_duong_giua', 'cage_bien'): res[k] = miss('Nam_Than_Cage')
    # bản lắp ráp
    if asm_ok:
        o_e, nm, vol, selfi = T.mesh_checks(asm)
        res['asm_co'] = (True, f'{len(asm.data.vertices)} đỉnh')
        res['asm_kin'] = (o_e == 0 and nm == 0, f'cạnh hở {o_e}, cạnh >2 mặt {nm}')
        res['asm_phap_tuyen'] = (vol > 0, f'thể tích có dấu {vol:.4f} m³')
        hits = self_hits(asm); res['asm_tu_giao'] = (not hits, f'cặp mặt tự giao {len(hits)}' + (f', ví dụ (mm) {hits[:8]}' if hits else ''))
        m, n, nh, zr = (asm.get(k) for k in ('co_m', 'co_n', 'co_nh', 'co_z'))
        if None in (m, n, nh, zr): res['co_khop_vong'] = (False, 'thiếu co_m/co_n/co_nh/co_z')
        else:
            above = sum(1 for v in asm.data.vertices[nh:] if v.co.z > zr + 0.0005)
            res['co_khop_vong'] = (m % n == 0 and m // n in (1, 2, 3) and above == 0, f'vòng đầu {m}, vòng thân {n}, đỉnh thân trên vòng cắt {above}')
        ev, me, vs = _mesh_world(asm); tay = _attr(me, 'tay'); chan = _attr(me, 'chan'); ev.to_mesh_clear()
        zn, zh = asm.get('z_nach'), asm.get('z_hang')
        if tay is None or chan is None or zn is None or zh is None:
            res['khe_nach'] = res['khe_hang'] = (False, 'thiếu thuộc tính tay/chan hoặc z_nach/z_hang')
        else:
            arm = [i for i, t in enumerate(tay) if t > 0.5 and vs[i].x > 0]; tor = [i for i, t in enumerate(tay) if t <= 0.5 and chan[i] <= 0.5 and vs[i].x > 0]
            g = _slice_gap(vs, arm, tor, zn - 0.12, zn - 0.02)
            res['khe_nach'] = (g is not None and g >= GAP_MIN, f'khe tay–thân nhỏ nhất {g if g is None else round(g * 1000, 1)} mm ở z {zn - 0.12:.3f}–{zn - 0.02:.3f}')
            L = [i for i, c in enumerate(chan) if c > 0.5 and vs[i].x > 0]; R = [i for i, c in enumerate(chan) if c > 0.5 and vs[i].x < 0]
            g = _slice_gap(vs, L, R, zh - 0.10, zh - 0.03)
            res['khe_hang'] = (g is not None and g >= GAP_MIN, f'khe hai đùi nhỏ nhất {g if g is None else round(g * 1000, 1)} mm ở z {zh - 0.10:.3f}–{zh - 0.03:.3f}')
        # bàn tay/chân: vòng mặt cắt nằm trong khối thân
        bvh = BVHTree.FromObject(asm, bpy.context.evaluated_depsgraph_get()); bad = []; total = 0
        for nmn in ('Nam_BanChan.L', 'Nam_BanChan.R'):
            o = obj(nmn)
            if not o: bad.append(f'thiếu {nmn}'); continue
            bm = bmesh.new(); bm.from_mesh(o.data)
            ring = {v for e in bm.edges if len(e.link_faces) == 1 for v in e.verts}
            for v in ring:
                p = o.matrix_world @ v.co; hit, nrm, _, d = bvh.find_nearest(p); total += 1
                if (p - hit).dot(nrm) > 0 and d > 0.0005: bad.append(f'{nmn} hở {d * 1000:.1f} mm'); break
            if not ring: bad.append(f'{nmn} không có vòng cắt')
            bm.free()
        res['tay_chan_trong_ong'] = (not bad, f'{total} đỉnh vòng cắt; ' + ('; '.join(bad) if bad else 'đều nằm trong ống'))
    else:
        for k in ('asm_co', 'asm_kin', 'asm_phap_tuyen', 'asm_tu_giao', 'co_khop_vong', 'khe_nach', 'khe_hang', 'tay_chan_trong_ong'): res[k] = miss('Nam_Dau_Than')
    return res


def test_neck_strip():
    """Test đơn vị neck_strip trên hai vòng tròn tổng hợp: (48,48) → 48 quad; (48,144) → phủ mọi đỉnh đầu, 192 mặt, không cạnh >2 mặt; (48,100) → ValueError."""
    def make(n, m):
        bm = bmesh.new()
        A = [bm.verts.new((0.05 * math.cos(2 * math.pi * i / n), 0.05 * math.sin(2 * math.pi * i / n), 0.0)) for i in range(n)]
        B = [bm.verts.new((0.05 * math.cos(2 * math.pi * i / m), 0.05 * math.sin(2 * math.pi * i / m), 0.01)) for i in range(m)]
        return bm, A, B
    try:
        bm, A, B = make(48, 48); f = neck_strip(bm, A, B); ok1 = len(f) == 48 and all(len(x.verts) == 4 for x in f); bm.free()
        bm, A, B = make(48, 144); f = neck_strip(bm, A, B)
        ok2 = len(f) == 192 and all(v.link_faces for v in B) and not any(len(e.link_faces) > 2 for e in bm.edges); bm.free()
        bm, A, B = make(48, 100)
        try: neck_strip(bm, A, B); ok3 = False
        except ValueError: ok3 = True
        bm.free()
        return ok1 and ok2 and ok3, f'48/48 {ok1}, 48/144 {ok2}, 48/100 ValueError {ok3}'
    except Exception as e:
        return False, f'{type(e).__name__}: {e}'


def self_hits(ob):
    """Các cặp mặt tự giao (BVH, bỏ cặp chung đỉnh): trả danh sách tâm (x, y, z) mm để biết vùng."""
    bm = bmesh.new(); bm.from_mesh(ob.data); bm.faces.ensure_lookup_table(); bvh = BVHTree.FromBMesh(bm); out = []
    for a, b in bvh.overlap(bvh):
        if a < b and not set(bm.faces[a].verts) & set(bm.faces[b].verts):
            c = (bm.faces[a].calc_center_median() + bm.faces[b].calc_center_median()) / 2; out.append(tuple(round(x * 1000) for x in c))
    bm.free(); return out


def report(res):
    for k, (ok, msg) in res.items(): print(f'{"PASS" if ok else "FAIL"} {k} — {msg}')
    return all(ok for ok, _ in res.values())


# ================================================================== đối chiếu ảnh mẫu
# Ảnh mẫu NAM — 3D TURNAROUND (1376×768): đỉnh tóc hàng 42, sàn hàng 730 → 1 px = 1,6004/688 m; trục: trước x 281,5, nghiêng (trục cổ chân) x 703, sau x 1096,5.
MAU = dict(top=42, floor=730, axes={'truoc': 281.5, 'nghieng': 703.0, 'sau': 1096.5})
MAU_S = H_TARGET / (MAU['floor'] - MAU['top'])
SIL_W, SIL_H, SIL_TOP = 400, 760, 41


def _img_np(path):
    import numpy as np
    im = bpy.data.images.load(path, check_existing=False); w, h = im.size; a = np.empty(w * h * 4, dtype=np.float32); im.pixels.foreach_get(a)
    bpy.data.images.remove(im); return a.reshape(h, w, 4)[::-1].copy()     # hàng 0 = trên


def _save_np(arr, path):
    import numpy as np
    h, w, _ = arr.shape; im = bpy.data.images.new('tmp_ov', w, h, alpha=True); im.pixels.foreach_set(np.ascontiguousarray(arr[::-1]).astype(np.float32).ravel())
    im.filepath_raw = path; im.file_format = 'PNG'; im.save(); bpy.data.images.remove(im)


def _mau_mask(ref):
    """Mặt nạ nhân vật trong ảnh mẫu: da cam (r − b lớn) hoặc tóc tối; bóng đổ xám bị loại."""
    r, g, b = ref[..., 0], ref[..., 1], ref[..., 2]; return ((r - b) > 45 / 255) | ((r + g + b) < 300 / 255)


def _run_at(mask_row, cx):
    """Đoạn liền chứa cột cx (hoặc gần cx nhất) của một hàng mặt nạ: (trái, phải)."""
    import numpy as np
    xs = np.flatnonzero(mask_row)
    if xs.size == 0: return None
    cx = int(round(cx)); c = cx if mask_row[cx] else int(xs[np.argmin(abs(xs - cx))]); l = r_ = c
    while l - 1 >= 0 and mask_row[l - 1]: l -= 1
    while r_ + 1 < mask_row.size and mask_row[r_ + 1]: r_ += 1
    return l, r_


def overlay_ref(sil_dir, mau_path, out):
    """Chồng silhouette bản mới (viền đỏ, nền xanh nhạt) lên ảnh mẫu mờ 50%, cùng tỉ lệ và mốc sàn; in bảng lệch (mm) ở các mức cage."""
    import numpy as np
    if not mau_path or not os.path.exists(mau_path): print('CHƯA ĐỐI CHIẾU MẪU: thiếu ảnh'); return {}
    ref = _img_np(os.path.abspath(mau_path)); mref = _mau_mask(ref); dy = MAU['top'] - SIL_TOP; table = {}
    for v in ('truoc', 'nghieng', 'sau'):
        sil = _img_np(os.path.join(sil_dir, f'sil_{v}.png')); ms = sil[..., 3] > 0.5; ax = MAU['axes'][v]; x0 = int(round(ax - SIL_W / 2))
        crop = ref[dy:dy + SIL_H, x0:x0 + SIL_W, :3]; mc = mref[dy:dy + SIL_H, x0:x0 + SIL_W]
        o = np.ones((SIL_H, SIL_W, 4), dtype=np.float32); o[..., :3] = 0.5 + 0.5 * crop
        o[ms, :3] = o[ms, :3] * 0.75 + np.array([0.55, 0.75, 1.0]) * 0.25
        er = ms.copy(); er[1:] &= ms[:-1]; er[:-1] &= ms[1:]; er[:, 1:] &= ms[:, :-1]; er[:, :-1] &= ms[:, 1:]; edge = ms & ~er
        o[edge, :3] = (0.85, 0.05, 0.05); _save_np(o, os.path.join(out, f'so_mau_{v}.png'))
        rows = {}
        for name, z in body_levels():
            row = int(round(SIL_TOP + (H_TARGET - z) / MAU_S)); a_ = _run_at(mc[row], SIL_W / 2); b_ = _run_at(ms[row], SIL_W / 2)
            if a_ and b_: rows[name] = (round(z, 3), round((SIL_W / 2 - a_[0]) * MAU_S * 1000), round((SIL_W / 2 - b_[0]) * MAU_S * 1000), round((a_[1] - SIL_W / 2) * MAU_S * 1000), round((b_[1] - SIL_W / 2) * MAU_S * 1000))
        if v == 'truoc':                                                       # cánh tay trái ảnh (tay phải nhân vật): mép ngoài/trong
            for z in (0.75, 0.70, 0.65, 0.60, 0.55, 0.50):
                row = int(round(SIL_TOP + (H_TARGET - z) / MAU_S)); arm = []
                for m_ in (mc, ms):
                    t_ = _run_at(m_[row], SIL_W / 2); a2 = _run_at(m_[row], (t_[0] - 3) if t_ else 0) if t_ and t_[0] > 3 else None
                    arm.append(a2 if a2 and a2 != t_ else None)
                if all(arm): rows[f'tay_{z:.2f}'] = (z, round((SIL_W / 2 - arm[0][0]) * MAU_S * 1000), round((SIL_W / 2 - arm[1][0]) * MAU_S * 1000), round((SIL_W / 2 - arm[0][1]) * MAU_S * 1000), round((SIL_W / 2 - arm[1][1]) * MAU_S * 1000))
        table[v] = rows
    print('--- đối chiếu mẫu (mm từ trục: trái mẫu/mới, phải mẫu/mới; nghiêng: trái = phía trước):')
    for v, rows in table.items():
        for n, (z, lm, ln, rm, rn) in rows.items(): print(f'    {v:8s} {n:10s} z {z:.3f}  trái {lm:4d}/{ln:4d} ({ln - lm:+d})  phải {rm:4d}/{rn:4d} ({rn - rm:+d})')
    return table


# ================================================================== render
CLAY = '#b8b0a8'


def render_cage(sc, out, samples=8):
    """Trực giao trước/nghiêng/sau: cage dây (chỉ Mirror) và bản Subdivision 1, đất sét trung tính; bản cũ ẩn."""
    os.makedirs(out, exist_ok=True); cage = bpy.data.objects['Nam_Than_Cage']; clay = D.mat('Dat_Set', CLAY, 0.7)
    others = [o for o in bpy.data.collections[NEW_COLL].objects if o is not cage and not o.hide_render]
    for o in others: o.hide_render = True
    cage.hide_render = False
    cage.data.materials.clear(); cage.data.materials.append(clay)
    wire = cage.copy(); wire.data = cage.data.copy(); wire.name = 'Cage_Day'; cage.users_collection[0].objects.link(wire)
    wire.modifiers.remove(wire.modifiers['Subsurf']); w = wire.modifiers.new('Day', 'WIREFRAME'); w.thickness = 0.0025; w.use_replace = True
    wire.data.materials.clear(); wire.data.materials.append(D.mat('Day_Den', '#202020', 0.8))
    sc.cycles.samples = samples; sc.render.resolution_x, sc.render.resolution_y = 560, 900; zc = 0.80; R = 6.0; files = []
    sub = cage.modifiers['Subsurf']
    for mode in ('day', 'min'):
        sub.show_render = (mode == 'min'); wire.hide_render = (mode == 'min')
        for n, (x, y) in {'truoc': (0, -R), 'nghieng': (R, 0), 'sau': (0, R)}.items():
            sc.camera = T.cam(sc, f'c_{mode}_{n}', (x, y, zc), (0, 0, zc), 1.72); f = os.path.join(out, f'cage_{mode}_{n}.png'); sc.render.filepath = f
            bpy.ops.render.render(write_still=True); files.append(f)
    sub.show_render = True; bpy.data.objects.remove(wire, do_unlink=True); cage.hide_render = True
    for o in others: o.hide_render = False
    return files


def render_old_new(sc, out, samples=24):
    """Bản cũ v2.11 và bản mới, cùng máy, cùng tỉ lệ, cùng sàn (đất sét): cu_<góc>.png / moi_<góc>.png."""
    old, new = bpy.data.collections[OLD_COLL], bpy.data.collections[NEW_COLL]; files = []
    for tag, show_old in (('cu_', True), ('moi_', False)):
        old.hide_render, new.hide_render = not show_old, show_old
        files += render_views(sc, out, ['truoc', 'nghieng', 'sau'], samples, prefix=tag)
    old.hide_render, new.hide_render = True, False; return files


VIEWS = {   # tên: (vị trí máy, điểm nhìn, ortho_scale, cỡ ảnh)
    'truoc': ((0, -6, 0.80), (0, 0, 0.80), 1.72, (560, 900)), 'nghieng': ((6, 0, 0.80), (0, 0, 0.80), 1.72, (560, 900)),
    'sau': ((0, 6, 0.80), (0, 0, 0.80), 1.72, (560, 900)), 'goc34': ((4.24, -4.24, 0.80), (0, 0, 0.80), 1.72, (560, 900)),
    'can_co_vai_truoc': ((0, -4, 0.88), (0, 0, 0.88), 0.50, (700, 700)), 'can_co_vai_nghieng': ((4, 0, 0.88), (0, 0, 0.88), 0.50, (700, 700)),
    'can_co_vai_sau': ((0, 4, 0.88), (0, 0, 0.88), 0.50, (700, 700)), 'can_co_vai_34': ((2.83, -2.83, 0.88), (0, 0, 0.88), 0.50, (700, 700)),
    'can_nach_truoc': ((0.6, -4, 0.70), (0.15, 0, 0.70), 0.36, (700, 700)), 'can_nach_34': ((3.5, -2.0, 0.66), (0.15, 0, 0.66), 0.36, (700, 700)),
    'can_bung_hong_truoc': ((0, -4, 0.50), (0, 0, 0.50), 0.50, (700, 700)), 'can_bung_hong_nghieng': ((4, 0, 0.50), (0, 0, 0.50), 0.50, (700, 700)),
    'can_bung_hong_sau': ((0, 4, 0.50), (0, 0, 0.50), 0.50, (700, 700)), 'can_bung_hong_34': ((2.83, -2.83, 0.50), (0, 0, 0.50), 0.50, (700, 700)),
}


def render_views(sc, out, names, samples=24, clay=True, prefix=''):
    """Render các góc trong VIEWS; clay=True phủ đất sét trung tính lên mọi vật (soi hình khối, không để vật liệu che gợn)."""
    os.makedirs(out, exist_ok=True); vl = sc.view_layers[0]; vl.material_override = D.mat('Dat_Set', CLAY, 0.7) if clay else None
    sc.cycles.samples = samples; files = []
    for n in names:
        loc, tg, scl, (w, h) = VIEWS[n]; sc.render.resolution_x, sc.render.resolution_y = w, h
        sc.camera = T.cam(sc, 'cam_' + n, loc, tg, scl); f = os.path.join(out, f'{prefix}{n}.png'); sc.render.filepath = f
        bpy.ops.render.render(write_still=True); files.append(f)
    vl.material_override = None; return files


# ================================================================== chạy
if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    ap = argparse.ArgumentParser(); ap.add_argument('--check', action='store_true'); ap.add_argument('--render', default=''); ap.add_argument('--blend', default='')
    ap.add_argument('--samples', type=int, default=24); ap.add_argument('--mau', default=''); ap.add_argument('--phong-dir', default='')
    a = ap.parse_args(argv); a.render = os.path.abspath(a.render) if a.render else ''
    sc = build_old()
    print('--- bản cũ v2.11:', widths_table(bpy.data.objects['Nam_Dau_Than_v211']))
    cb = bpy.data.collections[NEW_COLL]; parts = split_hands_feet(bpy.data.objects['Nam_Than_goc'], cb); print('--- mặt cắt cổ tay/mắt cá (tâm, nửa ngang, nửa sâu):', parts['mat_cat'])
    cage = build_cage(cb)
    asm = assemble_cage(bpy.data.objects['Head_Base'], cage, bpy.data.objects['Nam_Than_goc'].data.materials[0]); cage.hide_render = True
    print('--- bản mới:', widths_table(asm))
    print('--- cage (Mirror + Subdivision 1):', widths_table(cage))
    if a.render:
        T.lights(sc); print('ảnh cage:', render_cage(sc, os.path.join(a.render, 'cage'), a.samples))
        print('ảnh:', render_views(sc, a.render, list(VIEWS), a.samples))
        print('ảnh cũ/mới:', render_old_new(sc, a.render, a.samples))
        if a.mau:
            sc.cycles.samples = 4; sil = os.path.join(a.render, 'sil'); T.render_silhouettes(sc, sil, MAU_S); overlay_ref(sil, a.mau, a.render)
    if a.blend: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
    if a.check:
        ok = report(check_all(sc)); print('KẾT QUẢ:', 'TẤT CẢ PASS' if ok else 'CÒN FAIL'); sys.stdout.flush(); os._exit(0 if ok else 1)
