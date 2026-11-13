"""NAM — THÂN NHẴN v2 (02_Body_Base), cartoon hơi chibi, nối vào đầu của `dung_dau_nam.py` (đầu/tóc/mặt giữ nguyên, KHÔNG scale, KHÔNG sửa nguồn).

Chạy:  python dung_than_nam.py [--render <thư mục>] [--blend file.blend] [--samples N]
Đơn vị mét, sàn Z = 0, nhân vật quay mặt −Y, trái nhân vật = +X. Chiều cao toàn thân giữ ≈ 1,6004 m (gồm lọn đỉnh).

Cấu trúc
  Nam_Dau_Than (collection 02_Body_Base): MỘT mesh lắp ráp = bản SAO của Head_Base (cắt hở ở vòng cổ z = 0,9771, không đổi gì phía trên) + dải nối + thân.
      Thân dựng từ các vòng cắt/ống rồi voxel remesh để nối khối (vai–nách–háng liền), sau đó cắt phẳng ở cổ và NỐI BẰNG dải bridge vào vòng cổ của bản sao đầu —
      không còn hai bề mặt gần trùng nhau. Head_Base gốc, tóc, tai, mặt giữ nguyên (Head_Base chỉ bị ẩn khỏi render vì bản sao đã thay vào).
  Nam_Than_v1 (ẩn): thân bản f557769 để đối chiếu (dung_than_nam_v1.py).
Chưa quần áo, chưa rig: chỉ đạt hình khối; CHƯA kiểm chứng biến dạng.
"""
import sys, os, math, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector
import dung_dau_nam as D

M_CT = 32
RING_Z0 = min((r[0] for r in D.LOFT_TAB), key=lambda z: abs(z - 1.0))   # vòng cắt cổ của bản sao đầu ở ~1,00 m (ngay dưới hàm); phần cổ dài của nguồn đầu bỏ, cổ do thân đảm nhiệm
HEAD_K = 1.13                                  # cụm đầu–mặt–tai–tóc phóng ĐỀU 1,15× (mẫu: đầu to hơn đầu gốc ~13% chiều cao, ~21% bề ngang); đỉnh tóc vẫn 1,6003 m
CHIN0, TOP0 = 1.032, 1.6003
ZCH = TOP0 - (TOP0 - CHIN0) * HEAD_K            # cằm mới ≈ 0,947 m
KZ = None                                      # thân nén theo chiều cao (mẫu: cổ ở ~0,93 m, vai ~0,88 m); bề ngang giữ nguyên theo bảng đo
def hz(z): return ZCH + (z - CHIN0) * HEAD_K   # z đầu gốc → z sau phóng
NECK_AXIS_Y, NECK_SCALE = -0.007, 0.80   # cổ bản sao đầu thu nhỏ đều 18% quanh trục cổ (a 0,090 → 0,074) cho khớp tỉ lệ thân; nguồn Head_Base không đổi
NECK_BLEND_TOP = 1.048
RING_Z = hz(RING_Z0)                   # vòng cổ của đầu SAU khi phóng
KZ = RING_Z / RING_Z0                  # hệ số nén thân: cổ thân gặp đúng vòng cổ đầu
CUT_Z = RING_Z - 0.0055 * HEAD_K       # mặt cắt thân (dải nối cao ~6 mm)


def sg(v): return 1.0 if v >= 0 else -1.0


def ring(c, a, bf, bb, n, X=Vector((1, 0, 0)), Y=Vector((0, 1, 0)), m=M_CT):
    """Vòng siêu elip quanh c theo quy ước điểm của Head_Base: θ = 0 ở phía TRƯỚC (−Y), x = a·sin; bf/bb = nửa sâu trước/sau."""
    pts = []; e = 2.0 / n
    for k in range(m):
        th = 2 * math.pi * k / m; cs, sn = math.cos(th), math.sin(th)
        py = -bf * abs(cs) ** e if cs >= 0 else bb * abs(cs) ** e
        pts.append(c + X * (a * sg(sn) * abs(sn) ** e) + Y * py)
    return pts


def loft_obj(name, rings, coll):
    bm = bmesh.new(); rv = [[bm.verts.new(p) for p in r] for r in rings]; m = len(rv[0])
    for a, b in zip(rv, rv[1:]):
        for j in range(m): bm.faces.new((a[j], a[(j + 1) % m], b[(j + 1) % m], b[j]))
    for r, rev in ((rv[0], True), (rv[-1], False)):
        cv = bm.verts.new(sum((v.co for v in r), Vector()) / m)
        for j in range(m): bm.faces.new((cv, r[(j + 1) % m], r[j]) if rev else (cv, r[j], r[(j + 1) % m]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return D.new_obj(name, bm, coll, None)


def _cr(P, t):
    n = len(P) - 1; i = min(int(t), n - 1); f = t - i; p0, p1, p2, p3 = P[max(i - 1, 0)], P[i], P[i + 1], P[min(i + 2, n)]
    return [0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * f + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * f * f + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * f ** 3) for k in range(len(p1))]


def tube(name, knots, coll, step=0.006, n=2.0, along='z'):
    """Ống theo các nút (x,y,z,rx,ry). along='z': vòng nằm ngang. along='y': vòng thẳng đứng theo y (rx = nửa ngang, ry = nửa cao)."""
    ax = 2 if along == 'z' else 1
    N = max(8, int(abs(knots[-1][ax] - knots[0][ax]) / step)); rings = []
    for i in range(N + 1):
        v = _cr(knots, i / N * (len(knots) - 1)); c = Vector(v[:3])
        rings.append(ring(c, v[3], v[4], v[4], n, m=28) if along == 'z' else ring(c, v[3], v[4], v[4], n, X=Vector((1, 0, 0)), Y=Vector((0, 0, 1)), m=28))
    return loft_obj(name, rings, coll)


def torso(name, table, coll, step=0.006, extra=()):
    zs = [t[0] for t in table]; N = int((zs[-1] - zs[0]) / step); rings = []
    for i in range(N + 1):
        v = _cr(table, i / N * (len(table) - 1)); rings.append(ring(Vector((0, v[4], v[0])), v[1], v[2], v[3], v[5], m=96))
    rings += list(extra)
    return loft_obj(name, rings, coll)


def neck_target():
    """Vòng cổ của đầu (sau thu cổ NECK_SCALE và phóng HEAD_K) tính đúng công thức Head_Base: (nửa rộng, nửa sâu trước, nửa sâu sau, tâm y, n trước, n sau)."""
    t = D.LOFT_TAB[::-1]; z = RING_Z0
    for (z0, f0, b0, w0), (z1, f1, b1, w1) in zip(t, t[1:]):
        if z0 <= z <= z1:
            u = (z - z0) / (z1 - z0); yf, yb, w = f0 + (f1 - f0) * u, b0 + (b1 - b0) * u, w0 + (w1 - w0) * u; break
    mm, nf, nb = D.section_params(z, D.SECTION_MODE); ym = yf + mm * (yb - yf)
    k = NECK_SCALE * HEAD_K; yc = (NECK_AXIS_Y + (ym - NECK_AXIS_Y) * NECK_SCALE) * HEAD_K
    return w * k, (ym - yf) * k, (yb - ym) * k, yc, nf, nb


def neck_rings(last_row, m=96, shrink=0.0004):
    """Các vòng nối từ hàng vai cuối của bảng thân tới ĐÚNG vòng cổ của đầu (z sau nén KZ), chuyển dần bằng smoothstep → không nếp, không gờ ở chỗ nối."""
    A, BF, BB, YC, nf, nb = neck_target(); A -= shrink; BF -= shrink; BB -= shrink; out = []
    z_last = last_row[0]
    zs = [RING_Z - 0.030, RING_Z - 0.019, RING_Z - 0.010, RING_Z - 0.003, RING_Z + 0.006]
    for zc in zs:
        t = D.smooth01(zs[0] - 0.012, RING_Z - 0.003, zc); z = zc / KZ
        a_ = last_row[1] + (A - last_row[1]) * t; bf_ = last_row[2] + (BF - last_row[2]) * t; bb_ = last_row[3] + (BB - last_row[3]) * t; yc_ = last_row[4] + (YC - last_row[4]) * t
        pts = []; e_f, e_b = 2.0 / nf, 2.0 / nb
        for j in range(m):
            th = 2 * math.pi * j / m; cs, sn = math.cos(th), math.sin(th); e = e_f if cs >= 0 else e_b
            py = -bf_ * abs(cs) ** e if cs >= 0 else bb_ * abs(cs) ** e
            pts.append(Vector((a_ * sg(sn) * abs(sn) ** e, yc_ + py, z)))
        out.append(pts)
    return out


def join(objs, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]; bpy.ops.object.join(); o = bpy.context.view_layer.objects.active; o.name = name; o.data.name = name; return o


def apply_mod(ob, mod):
    bpy.context.view_layer.objects.active = ob; bpy.ops.object.modifier_apply(modifier=mod.name)


def remesh(ob, voxel, smooth, factor=0.5):
    r = ob.modifiers.new('Remesh', 'REMESH'); r.mode = 'VOXEL'; r.voxel_size = voxel; apply_mod(ob, r)
    s = ob.modifiers.new('Smooth', 'SMOOTH'); s.factor = factor; s.iterations = smooth; apply_mod(ob, s); ob.data.shade_smooth()


# ================================================================== SỐ ĐO v2 (m) — lấy từ đo ảnh mẫu NAM — 3D TURNAROUND (chuẩn hoá theo cằm: z_ta = z_mẫu × 1,13; bề ngang × 0,88)
#     z      a      bf     bb     yc     n     (vòng ngang: nửa rộng, nửa sâu trước/sau)
TORSO = [(0.44, 0.052, 0.058, 0.068, 0.000, 2.0), (0.47, 0.105, 0.088, 0.098, 0.000, 2.2), (0.50, 0.166, 0.108, 0.118, 0.000, 2.3), (0.565, 0.166, 0.146, 0.132, 0.000, 2.3),
         (0.63, 0.154, 0.158, 0.118, 0.000, 2.3), (0.70, 0.131, 0.146, 0.104, 0.000, 2.2), (0.79, 0.118, 0.138, 0.106, 0.000, 2.2), (0.85, 0.152, 0.130, 0.104, -0.001, 2.1), (0.90, 0.158, 0.126, 0.102, -0.001, 2.1),
         (0.93, 0.158, 0.122, 0.100, -0.002, 2.1), (0.95, 0.148, 0.114, 0.095, -0.003, 2.1)]
#      x      y       z     rx     ry   (tay TRÁI nhân vật = +X; tay phải lấy đối xứng) — thả xuôi hơi toè ra như mẫu
ARM = [(0.126, 0.002, 0.962, 0.040, 0.044), (0.140, 0.002, 0.940, 0.052, 0.054), (0.154, 0.001, 0.895, 0.054, 0.054), (0.170, 0.000, 0.840, 0.050, 0.050), (0.182, 0.000, 0.800, 0.050, 0.050),
       (0.189, 0.002, 0.760, 0.050, 0.050), (0.196, 0.004, 0.720, 0.049, 0.049), (0.203, 0.002, 0.680, 0.048, 0.048), (0.210, -0.002, 0.640, 0.046, 0.046), (0.220, -0.005, 0.600, 0.043, 0.043),
       (0.230, -0.008, 0.560, 0.038, 0.038), (0.236, -0.008, 0.540, 0.034, 0.034)]
# bàn tay to, mềm: lòng bàn tay dẹt theo x, 4 ngón ngắn đầy cong nhẹ về trước, ngón cái có khối gốc
PALM = [(0.230, -0.008, 0.570, 0.038, 0.038), (0.239, -0.009, 0.545, 0.036, 0.056), (0.250, -0.012, 0.500, 0.036, 0.086), (0.256, -0.013, 0.462, 0.032, 0.070), (0.249, -0.013, 0.447, 0.022, 0.062), (0.249, -0.013, 0.436, 0.010, 0.030)]
FINGERS = [(-0.0645, 0.062, 0.0165), (-0.0215, 0.070, 0.0170), (0.0215, 0.064, 0.0165), (0.0645, 0.056, 0.0158)]   # (dy so với tâm bàn, độ dài, bán kính): ngón mập, khe ~10 mm
THUMB = [(0.244, -0.038, 0.548, 0.033, 0.033), (0.241, -0.064, 0.508, 0.030, 0.030), (0.241, -0.079, 0.470, 0.025, 0.025), (0.242, -0.084, 0.446, 0.021, 0.021)]
LEG = [(0.086, 0.000, 0.660, 0.0434, 0.0542), (0.090, 0.000, 0.600, 0.0589, 0.0666), (0.0925, 0.000, 0.500, 0.0619, 0.0681), (0.0925, -0.002, 0.400, 0.0600, 0.0697), (0.0925, -0.003, 0.290, 0.0623, 0.0682),
       (0.0925, 0.000, 0.200, 0.0616, 0.0611), (0.0925, 0.002, 0.140, 0.0677, 0.0663), (0.0925, 0.004, 0.105, 0.0668, 0.0663)]
#      x       y      z     rx(ngang)  ry(cao): bàn chân dày, rộng, dài ≈ 0,27 m (đo ảnh mẫu), vòng đứng dọc theo y
FOOT = [(0.098, 0.098, 0.025, 0.030, 0.026), (0.098, 0.090, 0.040, 0.048, 0.040), (0.098, 0.078, 0.055, 0.062, 0.055), (0.098, 0.050, 0.065, 0.072, 0.065), (0.098, 0.010, 0.064, 0.0745, 0.064),
        (0.098, -0.035, 0.054, 0.078, 0.054), (0.098, -0.072, 0.044, 0.086, 0.044), (0.098, -0.098, 0.036, 0.092, 0.036), (0.098, -0.116, 0.029, 0.094, 0.029)]
TOES = [(-0.0745, 0.056, 0.0235, 0.0240), (-0.0300, 0.048, 0.0200, 0.0205), (0.0075, 0.044, 0.0185, 0.0190), (0.0420, 0.040, 0.0170, 0.0175), (0.0740, 0.036, 0.0155, 0.0160)]   # (dx so với tâm chân, dài, bán kính, z): ngón tròn, khe ~6 mm


def mir(knots): return [(-k[0],) + tuple(k[1:]) for k in knots]


def smooth_zone(ob, test, iters, factor=0.5):
    """Làm mượt thêm CỤC BỘ ở những đỉnh thoả test(v) (chỗ nối khối: vai–nách, hông–háng, cổ chân) — không đụng ngón tay/ngón chân."""
    bm = bmesh.new(); bm.from_mesh(ob.data); vs = [v for v in bm.verts if test(v.co)]
    for _ in range(iters): bmesh.ops.smooth_vert(bm, verts=vs, factor=factor, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    bm.to_mesh(ob.data); bm.free(); ob.data.update()


FINGER_Z0 = 0.460
FINGER_Y0 = -0.013


def _g(x, sig): return math.exp(-(x / sig) ** 2)


def carve_details(ob):
    """Khắc chỉ lên mặt thân (dịch đỉnh vào trong theo pháp tuyến, rãnh Gauss nông): rãnh giữa các ngón tay / ngón chân, nếp khớp ngón (2 nếp mỗi ngón tay, 1 nếp mỗi ngón chân), nếp gốc ngón."""
    bm = bmesh.new(); bm.from_mesh(ob.data); bm.normal_update(); n_hit = 0
    for v in bm.verts:
        c = v.co; ax = abs(c.x); d = 0.0
        if False: pass
        elif c.z < 0.075 and c.y < -0.062 and 0.015 < ax < 0.21:                                # bàn chân: ngón
            s_ = 1.0 if c.x > 0 else -1.0
            for i in range(4):                                                                  # rãnh giữa hai ngón liền kề
                xg = s_ * (0.098 + 0.5 * (TOES[i][0] + TOES[i + 1][0]))
                d += 0.0020 * _g(c.x - xg, 0.0032) * D.smooth01(-0.090, -0.108, c.y) * (1 - D.smooth01(-0.150, -0.185, c.y))
        if d > 1e-6: v.co -= v.normal * min(d, 0.0022); n_hit += 1
    bm.to_mesh(ob.data); bm.free(); ob.data.update(); print(f'    khắc chỉ ngón/khớp: {n_hit} đỉnh')


def build_body(coll, mat, voxel=0.003, smooth=4):
    parts = [torso('t', TORSO, coll, extra=neck_rings(TORSO[-1]))]
    for s in (1, -1):
        sx = lambda kn: kn if s > 0 else mir(kn)
        parts += [tube('arm', sx(ARM), coll), tube('palm', sx(PALM), coll, step=0.004), tube('thumb', sx(THUMB), coll, step=0.004),
                  tube('leg', sx(LEG), coll), tube('foot', sx(FOOT), coll, along='y', step=0.006)]
        x0, y0 = s * 0.256, -0.013
        for dy, L, r in FINGERS:
            z0 = 0.460; kn = [(x0, y0 + dy, z0, r, r), (x0 - s * 0.004, y0 + dy - 0.003, z0 - L * 0.5, r * 0.99, r * 0.99), (x0 - s * 0.014, y0 + dy - 0.006, z0 - L * 0.88, r * 0.9, r * 0.9), (x0 - s * 0.022, y0 + dy - 0.008, z0 - L * 0.98 + 0.004, r * 0.85, r * 0.85), (x0 - s * 0.024, y0 + dy - 0.009, z0 - L * 0.98 - 0.002, r * 0.80, r * 0.80), (x0 - s * 0.025, y0 + dy - 0.009, z0 - L * 0.98 - 0.0075, r * 0.56, r * 0.56), (x0 - s * 0.0255, y0 + dy - 0.009, z0 - L * 0.98 - 0.0115, r * 0.28, r * 0.28)]   # ngón cong vào phía lòng bàn tay (như mẫu), đầu bo tròn
            parts.append(tube('ngon', kn, coll, step=0.003))
        for dx, L, r, zc in TOES:
            xc = (0.098 + dx) * s
            rz = r * 1.38; zc = rz * 0.97   # tiết diện elip đứng: ngón cao hơn rộng, đáy chạm sàn
            kn = [(xc, -0.104, zc, r, rz), (xc, -0.104 - L * 0.55, zc, r, rz), (xc, -0.104 - L * 0.9, zc, r * 0.97, rz * 0.97), (xc, -0.104 - L - 0.004, zc, r * 0.82, rz * 0.82), (xc, -0.104 - L - 0.010, zc, r * 0.55, rz * 0.55), (xc, -0.104 - L - 0.015, zc, r * 0.25, rz * 0.25)]
            parts.append(tube('ngon_chan', kn, coll, along='y', step=0.003))
    body = join(parts, 'Nam_Than_goc'); body.data.materials.append(mat); remesh(body, voxel, smooth)
    smooth_zone(body, lambda c: 0.78 < c.z < 1.0 and abs(c.x) > 0.06, 70)                     # vai–nách
    smooth_zone(body, lambda c: 0.55 < c.z < 0.86 and 0.08 < abs(c.x) < 0.21 and abs(c.y) < 0.07, 14, 0.45)  # chỗ tay chạm thân (bỏ răng cưa voxel)
    smooth_zone(body, lambda c: 0.93 < c.z < 1.0, 8)                                           # chân cổ–vai
    smooth_zone(body, lambda c: 0.34 < c.z < 0.70 and abs(c.x) < 0.17, 40, 0.5)   # hông–háng–mông (bỏ mép bụng dưới)
    smooth_zone(body, lambda c: 0.06 < c.z < 0.20 and abs(c.x) < 0.2 and c.y > -0.10, 16, 0.45)   # cổ chân (không đụng ngón chân)
    smooth_zone(body, lambda c: 0.50 < c.z < 0.66 and abs(c.x) > 0.19, 70, 0.5)                    # cổ tay–lòng bàn tay (bỏ góc vuông)
    smooth_zone(body, lambda c: 0.40 < c.z < 0.50 and abs(c.x) > 0.20, 2, 0.3)               # gốc ngón tay + ngón (đầu ngón tròn, nối mượt)
    smooth_zone(body, lambda c: 0.10 < c.z < 0.66 and 0.04 < abs(c.x) < 0.20 and c.y > -0.07, 12, 0.4)   # đùi–gối–bắp chân–cổ chân liền mượt
    smooth_zone(body, lambda c: c.z < 0.14 and c.y > -0.07 and abs(c.x) < 0.2, 10, 0.45)    # gót–mu bàn chân
    smooth_zone(body, lambda c: c.z < 0.075 and -0.125 < c.y < -0.07 and abs(c.x) < 0.2, 8, 0.45)     # gốc ngón chân + đầu ngón
    carve_details(body)
    for v in body.data.vertices: v.co.z *= KZ                                               # nén thân theo tỉ lệ mẫu (KZ)
    body.data.update(); body.data.shade_smooth(); return body


# ================================================================== lắp ráp đầu–cổ–thân bằng dải bridge
def cut_open_head_copy(head):
    """Bản sao Head_Base: bỏ phần dưới vòng cổ RING_Z (nón đáy cổ) → vòng cổ trở thành biên hở; phía trên giữ nguyên từng đỉnh."""
    me = head.data.copy(); ob = bpy.data.objects.new('Nam_Dau_Than', me); head.users_collection[0].objects.link(ob)
    bm = bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table()
    kill = [f for f in bm.faces if max(v.co.z for v in f.verts) <= RING_Z0 + 1e-6]
    bmesh.ops.delete(bm, geom=kill, context='FACES')
    # thu nhỏ cổ (chỉ trên bản sao): hệ số chuyển mượt từ 1 ở NECK_BLEND_TOP (dưới hàm) đến NECK_SCALE ở vòng cắt; chỉ các đỉnh gần trục cổ (không đụng cằm/mặt)
    for v in bm.verts:
        r = math.hypot(v.co.x, v.co.y - NECK_AXIS_Y)
        if v.co.z < NECK_BLEND_TOP and r < 0.13:
            w = D.smooth01(NECK_BLEND_TOP, RING_Z0, v.co.z) * D.smooth01(0.13, 0.105, r)
            k = 1.0 - (1.0 - NECK_SCALE) * w; v.co.x *= k; v.co.y = NECK_AXIS_Y + (v.co.y - NECK_AXIS_Y) * k
    for v in bm.verts: v.co = Vector((v.co.x * HEAD_K, v.co.y * HEAD_K, hz(v.co.z)))   # phóng đều cả bản sao đầu
    bm.to_mesh(me); bm.free(); return ob


def cut_body_top(body, z):
    """Cắt phẳng thân ở z, bỏ phần trên (không đổ đầy) → biên hở là vòng cổ thân."""
    bm = bmesh.new(); bm.from_mesh(body.data)
    res = bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=Vector((0, 0, z)), plane_no=Vector((0, 0, 1)), clear_outer=True, clear_inner=False)
    bm.to_mesh(body.data); bm.free()


def assemble(head, body, skin):
    """Gộp bản sao đầu + thân thành MỘT mesh; nối hai vòng biên bằng bridge_loops; chuẩn lại pháp tuyến."""
    ob = cut_open_head_copy(head); cut_body_top(body, CUT_Z)
    bm = bmesh.new(); bm.from_mesh(ob.data); nh = len(bm.verts)
    bm.from_mesh(body.data)   # thêm đỉnh/mặt thân
    bm.verts.ensure_lookup_table(); bm.edges.ensure_lookup_table(); bm.faces.ensure_lookup_table()
    mats = list(ob.data.materials)
    skin_idx = len(mats); ob.data.materials.append(skin)
    nf_head = sum(1 for f in bm.faces if all(v.index < nh for v in f.verts))
    for f in bm.faces:
        if all(v.index >= nh for v in f.verts): f.material_index = skin_idx
    bnd = [e for e in bm.edges if len(e.link_faces) == 1]
    A = [e for e in bnd if all(v.index < nh for v in e.verts)]; B = [e for e in bnd if all(v.index >= nh for v in e.verts)]
    print(f'    biên hở: vòng cổ đầu {len(A)} cạnh, vòng cổ thân {len(B)} cạnh')
    res = bmesh.ops.bridge_loops(bm, edges=A + B, use_pairs=False, use_cyclic=True, use_merge=False)
    for f in res['faces']: f.material_index = skin_idx; f.smooth = True
    # làm mượt cục bộ quanh dải nối: phía thân + cổ của bản sao đầu (cao ≤ 3 cm trên vòng cắt, cách trục < 10,5 cm); mặt, cằm, tóc không bị đụng
    zone = [v for v in bm.verts if v.index >= nh and v.co.z > CUT_Z - 0.006 and v.co.z < RING_Z - 1e-6] + [v for v in res['faces'] for v in v.verts if v.index >= nh and v.co.z < RING_Z - 1e-6]
    zone += [v for v in bm.verts if v.index < nh and RING_Z - 1e-6 <= v.co.z < RING_Z + 0.040 * HEAD_K and math.hypot(v.co.x, v.co.y - NECK_AXIS_Y * HEAD_K) < 0.105 * HEAD_K]   # cổ của bản sao đầu phía trên vòng cắt (được phép chỉnh theo yêu cầu thu cổ)
    zone = list({v.index: v for v in zone}.values())
    for _ in range(40): bmesh.ops.smooth_vert(bm, verts=zone, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    for f in bm.faces: f.smooth = True
    bm.to_mesh(ob.data); bm.free(); ob.data.update()
    return ob


# ================================================================== scene, đo, render
def scale_head_cluster(sc):
    """Đầu–mặt–tai–tóc phóng ĐỀU HEAD_K quanh cằm gốc rồi hạ cằm về ZCH: Empty `Cum_Dau` làm cha (Head_Base ẩn cũng theo để Shrinkwrap tai đúng). Nguồn dung_dau_nam.py không đổi."""
    from mathutils import Matrix
    em = bpy.data.objects.new('Cum_Dau', None); sc.collection.objects.link(em); em.location = (0, 0, ZCH); em.scale = (HEAD_K, HEAD_K, HEAD_K)
    for cn in ('03_Head_And_Face', '04_Hair', '04_Hair_v3', '04_Hair_v2', '04_Hair_cu'):
        c = bpy.data.collections.get(cn)
        if c:
            for o in c.objects: o.parent = em; o.matrix_parent_inverse = Matrix.Translation((0, 0, -CHIN0))
    # mặt nạ tròng trắng trong vật liệu da dùng toạ độ vật thể gốc → thêm Mapping đưa toạ độ của mesh đã phóng về toạ độ gốc: q = p/HEAD_K + (0,0,CHIN0 − ZCH/HEAD_K)
    nt = bpy.data.materials['Da'].node_tree; tc = next(n for n in nt.nodes if n.bl_idname == 'ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping'); mp.vector_type = 'POINT'; mp.inputs['Scale'].default_value = (1 / HEAD_K,) * 3; mp.inputs['Location'].default_value = (0, 0, CHIN0 - ZCH / HEAD_K)
    for l in list(tc.outputs['Object'].links): nt.links.new(mp.outputs['Vector'], l.to_socket)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])


def build_scene(voxel=0.003, smooth=4):
    sc = D.build()
    cb = bpy.data.collections.new('02_Body_Base'); sc.collection.children.link(cb)
    skin = D.mat('Da_Than', D.COL['da'], 0.65, 0.08, sss_radius=(0.1, 0.05, 0.03))
    head = bpy.data.objects['Head_Base']
    body = build_body(cb, skin, voxel, smooth)
    scale_head_cluster(sc)
    # đưa Nam_Than_goc (đã có vật liệu da) vào collection 02_Body_Base, lắp ráp
    for c in list(body.users_collection): c.objects.unlink(body)
    cb.objects.link(body)
    asm = assemble(head, body, skin)
    for c in list(asm.users_collection): c.objects.unlink(asm)
    cb.objects.link(asm)
    head.hide_render = True; head.hide_viewport = True; body.hide_render = True; body.hide_viewport = True
    return sc


def visible(o): return not o.hide_render and not any(c.hide_render for c in o.users_collection)


def bbox(objs, dg):
    lo, hi = Vector((9, 9, 9)), Vector((-9, -9, -9))
    for o in objs:
        if o.type not in ('MESH', 'CURVE'): continue
        ev = o.evaluated_get(dg); me = ev.to_mesh()
        for v in me.vertices:
            w = ev.matrix_world @ v.co
            for i in range(3): lo[i] = min(lo[i], w[i]); hi[i] = max(hi[i], w[i])
        ev.to_mesh_clear()
    return lo, hi


def mesh_checks(ob):
    """Kiểm tra topology: cạnh biên, cạnh >2 mặt, tự giao (đếm gần đúng bằng BVH), pháp tuyến lật."""
    bm = bmesh.new(); bm.from_mesh(ob.data); bm.edges.ensure_lookup_table()
    open_e = sum(1 for e in bm.edges if len(e.link_faces) == 1); nm = sum(1 for e in bm.edges if len(e.link_faces) > 2)
    # thể tích dương ⇒ pháp tuyến hướng ra ngoài (phần thân kín)
    vol = sum(f.calc_area() * f.normal.dot(f.calc_center_median()) / 3.0 for f in bm.faces)
    from mathutils.bvhtree import BVHTree
    bm.faces.ensure_lookup_table(); bm.verts.ensure_lookup_table(); bvh = BVHTree.FromBMesh(bm); ov = bvh.overlap(bvh); selfi = sum(1 for a, b in ov if a != b and not set(v.index for v in bm.faces[a].verts) & set(v.index for v in bm.faces[b].verts))
    bm.free(); return open_e, nm, vol, selfi


def measure(sc):
    dg = bpy.context.evaluated_depsgraph_get(); objs = [o for o in sc.objects if o.type in ('MESH', 'CURVE') and visible(o) and o.name != 'San']
    lo, hi = bbox(objs, dg); print(f'--- Chiều cao thực đo (bounding box thế giới, đã đánh giá modifier): đáy {lo.z:.4f} → đỉnh {hi.z:.4f} m = {hi.z - lo.z:.4f} m')
    asm = bpy.data.objects['Nam_Dau_Than']; ev = asm.evaluated_get(dg); me = ev.to_mesh(); vs = [v.co.copy() for v in me.vertices]
    def wid(z, tol=0.004, xmin=-1, xmax=1):
        xs = [v.x for v in vs if abs(v.z - z) < tol and xmin < v.x < xmax]; return (round(min(xs), 3), round(max(xs), 3)) if xs else None
    def dep(z, tol=0.004):
        ys = [v.y for v in vs if abs(v.z - z) < tol]; return (round(min(ys), 3), round(max(ys), 3)) if ys else None
    print('    bề ngang (gồm tay) theo z:', {z: wid(z) for z in (0.90, 0.80, 0.70, 0.60, 0.50, 0.40, 0.30, 0.10)})
    print('    độ sâu thân theo z:', {z: dep(z) for z in (0.90, 0.80, 0.70, 0.63, 0.56, 0.50, 0.30, 0.10)})
    print('    bề rộng vai (gồm cánh tay) z0.92:', wid(0.92), '| hông (thân, không tay) z0.52:', wid(0.52, xmin=-0.165, xmax=0.165), '| chân (mỗi bên) z0.30: bên trái x', wid(0.30, xmin=0.0, xmax=1), '| bàn chân: dài y', dep(0.03))
    ev.to_mesh_clear()
    o_e, nm, vol, selfi = mesh_checks(asm)
    print(f'    kiểm tra mesh lắp ráp: cạnh hở {o_e}, cạnh >2 mặt {nm}, thể tích có dấu {vol:.4f} m³ ({"pháp tuyến ra ngoài" if vol > 0 else "PHÁP TUYẾN LẬT"}), cặp mặt tự giao (gần đúng) {selfi}, đỉnh {len(asm.data.vertices)}')


def lights(sc):
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = D.hexc('#f4ece6'); bg.inputs['Strength'].default_value = 0.7
    def area(name, loc, size, energy, col):
        d = bpy.data.lights.new(name, 'AREA'); d.size = size; d.energy = energy; d.color = D.hexc(col)[:3]
        o = bpy.data.objects.new(name, d); sc.collection.objects.link(o); o.location = loc; o.rotation_euler = (Vector((0, 0, 0.8)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    area('Key', (-2.2, -3.4, 3.2), 3.0, 330, '#fff3e4'); area('Fill', (3.2, -2.6, 1.8), 3.5, 130, '#eef2ff'); area('Rim', (0.8, 3.4, 3.0), 2.0, 260, '#ffffff'); area('Top', (0.0, -0.6, 4.2), 2.5, 140, '#fff8f0')
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=2, y_segments=2, size=1.2); D.new_obj('San', bm, sc.collection, D.mat('San', '#a9a39d', 0.95))
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 24; sc.cycles.use_denoising = True; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = -0.3; sc.cycles.device = 'CPU'


def cam(sc, name, loc, target, scale):
    cd = bpy.data.cameras.new(name); cd.type = 'ORTHO'; cd.ortho_scale = scale; cd.clip_end = 30; o = bpy.data.objects.new(name, cd); sc.collection.objects.link(o)
    o.location = loc; o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); return o


def render_all(sc, out):
    os.makedirs(out, exist_ok=True); zc = 0.80; R = 6.0
    full = {'truoc': (0, -R), 'goc34_phai': (R * 0.7071, -R * 0.7071), 'nghieng_phai': (R, 0), 'sau': (0, R), 'nghieng_trai': (-R, 0), 'goc34_trai': (-R * 0.7071, -R * 0.7071)}
    sc.render.resolution_x, sc.render.resolution_y = 560, 900
    for n, (x, y) in full.items():
        sc.camera = cam(sc, n, (x, y, zc), (0, 0, zc), 1.72); sc.render.filepath = os.path.join(out, f'{n}.png'); bpy.ops.render.render(write_still=True)
    sc.render.resolution_x = sc.render.resolution_y = 700
    for n, loc, tg, scl in (('can_co_vai_truoc', (0, -4, 0.97), (0, 0, 0.97), 0.62), ('can_co_vai_34', (2.8, -2.8, 0.97), (0, 0, 0.97), 0.62), ('can_co_vai_sau', (0, 4, 0.97), (0, 0, 0.97), 0.62),
                            ('can_ban_tay', (4, -2, 0.50), (0.19, 0, 0.50), 0.36), ('can_ban_tay_nghieng', (4, 0, 0.50), (0.19, 0, 0.50), 0.36), ('can_hong_hang', (0, -4, 0.52), (0, 0, 0.52), 0.55), ('can_hong_hang_sau', (0, 4, 0.52), (0, 0, 0.52), 0.55),
                            ('can_hong_hang_34', (2.8, -2.8, 0.52), (0, 0, 0.52), 0.55), ('can_ban_tay_sau', (0.6, 4, 0.47), (0.25, 0, 0.47), 0.30), ('can_ban_chan', (3, -3, 0.07), (0.084, -0.04, 0.06), 0.40), ('can_ban_chan_nghieng', (4, 0, 0.07), (0.084, -0.04, 0.06), 0.40), ('can_than_nghieng', (4, 0, 0.74), (0, 0, 0.74), 0.62)):
        sc.camera = cam(sc, n, loc, tg, scl); sc.render.filepath = os.path.join(out, f'{n}.png'); bpy.ops.render.render(write_still=True)


def render_silhouettes(sc, out, scale_m_px=0.00233):
    """Silhouette nền trong suốt cho ảnh đối chiếu với mẫu: cùng tỉ lệ (m/px) với ảnh mẫu, tâm tại trục thân; trục thân nghiêng = trục cổ chân (y = 0)."""
    os.makedirs(out, exist_ok=True); sc.render.film_transparent = True
    for o in list(sc.objects):
        if o.name == 'San': o.hide_render = True
    W, H = 400, 760; sc.render.resolution_x, sc.render.resolution_y = W, H
    top = 1.6004; px_top = 41; floor_px = px_top + top / scale_m_px
    # camera: pixel hàng px_top ↔ z = top; chiều cao ảnh H px = H*scale m. Tâm ảnh ở hàng H/2 ↔ z = top - (H/2 - px_top)*scale
    zc = top - (H / 2 - px_top) * scale_m_px
    for n, loc in (('truoc', (0, -6, zc)), ('nghieng', (6, 0, zc)), ('sau', (0, 6, zc))):
        c = cam(sc, 'sil_' + n, loc, (0, 0, zc), H * scale_m_px); sc.camera = c; sc.render.filepath = os.path.join(out, f'sil_{n}.png'); bpy.ops.render.render(write_still=True)
    sc.render.film_transparent = False


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--render', default=''); ap.add_argument('--blend', default=''); ap.add_argument('--samples', type=int, default=24); ap.add_argument('--sil', default=''); ap.add_argument('--voxel', type=float, default=0.0025); ap.add_argument('--headk', type=float, default=0)
    a = ap.parse_args(argv)
    if a.headk:
        HEAD_K = a.headk; ZCH = TOP0 - (TOP0 - CHIN0) * HEAD_K; RING_Z = hz(RING_Z0); CUT_Z = RING_Z - 0.0055 * HEAD_K; KZ = RING_Z / RING_Z0
    sc = build_scene(a.voxel)
    for c in list(sc.objects):
        if c.type in ('LIGHT', 'CAMERA'): bpy.data.objects.remove(c, do_unlink=True)
    if a.blend: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))   # file Blender của Nam (chưa đèn/sàn/camera) để đưa vào cảnh khác
    lights(sc); sc.cycles.samples = a.samples; measure(sc)
    if a.sil: render_silhouettes(sc, a.sil)
    if a.render: render_all(sc, a.render)
