"""Kiểm file rig đã lưu. Chạy trong thư mục rig:
D:/blender/blender.exe -b nhan-vat-nu-rig.blend --python kiem_rig_nu.py
In PASS/FAIL từng mục; thoát mã 1 nếu có FAIL.
"""
import math
import sys
import traceback
from pathlib import Path

import bpy
import numpy as np

RIG = bpy.data.objects.get('Nu_Rig')
BODY = bpy.data.objects.get('Nu_Than')
# trạng thái lúc vừa mở file (trước mọi dat_lai): file giao phải ở dáng nghỉ
LUC_MO = {kb.name: kb.value for kb in BODY.data.shape_keys.key_blocks[1:]} if BODY and BODY.data.shape_keys else {}


def eval_co(ob=None):
    ob = ob or BODY
    RIG.update_tag()  # thuộc tính tùy biến (fist, ik_fk…) không tự gắn cờ cập nhật driver
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    e = ob.evaluated_get(dg)
    m = e.to_mesh()
    co = np.array([e.matrix_world @ v.co for v in m.vertices])
    e.to_mesh_clear()
    return co


def dat_lai():
    """Đưa mọi xương về dáng nghỉ và thuộc tính về mặc định. Tắt Subdivision ở viewport để chỉ số đỉnh ổn định."""
    for ob in bpy.data.objects:
        for md in ob.modifiers:
            if md.type == 'SUBSURF':
                md.show_viewport = False
    for p in RIG.pose.bones:
        p.location = (0, 0, 0)
        p.rotation_mode = 'XYZ'
        p.rotation_euler = (0, 0, 0)
        p.scale = (1, 1, 1)
        for k in list(p.keys()):
            if k in ('fist', 'blink_L', 'blink_R', 'squint_L', 'squint_R'):
                p[k] = 0.0
            if k == 'ik_fk':
                p[k] = 1.0 if p.name.startswith('foot') else 0.0
    if BODY.data.shape_keys:
        for kb in BODY.data.shape_keys.key_blocks[1:]:
            kb.value = 0
    bpy.context.view_layer.update()


def kiem_vat_lieu_da():
    mat = BODY.data.materials[0]
    imgs = [n.image for n in mat.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image]
    assert len(imgs) == 4, f'Vật liệu có {len(imgs)} ảnh'
    for im in imgs:
        p = Path(bpy.path.abspath(im.filepath)).resolve()
        assert p.parent.name == 'texture' and p.name.endswith('_da.png'), f'{im.name} trỏ {p}'
        assert im.size[0] == 2048, f'{im.name} không nạp được'


NGON = ('thumb', 'index', 'middle', 'ring', 'pinky')


def dinh_dau_ngon(k='L'):
    """Chỉ số đỉnh gần đuôi đốt 3 của mỗi ngón (đo ở dáng nghỉ)."""
    co = eval_co()
    out = {}
    for n in NGON:
        t = np.array(RIG.matrix_world @ RIG.data.bones[f'{n}3.{k}'].tail_local)
        out[n] = int(np.argmin(np.linalg.norm(co - t, axis=1)))
    return out


def kiem_ngon_rieng():
    tip = dinh_dau_ngon()
    base = eval_co()
    for n in NGON:
        for j in (1, 2, 3):
            RIG.pose.bones[f'{n}{j}.L'].rotation_euler.x = 1.0
        d = np.linalg.norm(eval_co() - base, axis=1)
        for j in (1, 2, 3):
            RIG.pose.bones[f'{n}{j}.L'].rotation_euler.x = 0
        assert d[tip[n]] > 0.02, f'{n} cong mà đầu ngón chỉ dời {d[tip[n]]:.3f}'
        khac = {m: round(float(d[tip[m]]), 4) for m in NGON if m != n and d[tip[m]] >= 0.004}
        assert not khac, f'{n} cong kéo theo ngón khác {khac}'


def kiem_fist():
    tip = dinh_dau_ngon()
    base = eval_co()
    RIG.pose.bones['hand.L']['fist'] = 1.0
    d = np.linalg.norm(eval_co() - base, axis=1)
    it = {n: round(float(d[tip[n]]), 3) for n in NGON if d[tip[n]] <= 0.03}
    assert not it, f'fist=1 mà các ngón dời ít {it}'


def dau_xuong(n):
    RIG.update_tag()
    bpy.context.view_layer.update()
    return np.array(RIG.matrix_world @ RIG.pose.bones[n].head)


def doi_the_gioi(n, delta):
    """Dời xương n một đoạn delta theo trục thế giới (ghi vào pose)."""
    from mathutils import Matrix, Vector
    p = RIG.pose.bones[n]
    p.matrix = Matrix.Translation(Vector(delta)) @ p.matrix
    bpy.context.view_layer.update()


def kiem_ik_tay_bam():
    RIG.pose.bones['hand.L']['ik_fk'] = 1.0
    doi_the_gioi('ik_hand.L', (0, -0.15, 0.15))
    d = np.linalg.norm(dau_xuong('hand.L') - dau_xuong('ik_hand.L'))
    assert d < 0.01, f'Cổ tay cách ik_hand {d:.3f} m'


def kiem_ik_tay_nghi():
    m0 = np.array(RIG.pose.bones['forearm.L'].matrix)
    RIG.pose.bones['hand.L']['ik_fk'] = 1.0
    eval_co()
    lech = np.abs(np.array(RIG.pose.bones['forearm.L'].matrix) - m0).sum()
    assert lech < 0.02, f'Bật IK làm lệch dáng nghỉ {lech:.3f}'


def kiem_ik_fk_tat():
    h0 = dau_xuong('hand.L')
    doi_the_gioi('ik_hand.L', (0, -0.15, 0.15))
    d = np.linalg.norm(dau_xuong('hand.L') - h0)
    assert d < 1e-4, f'ik_fk=0 mà tay vẫn theo ik_hand ({d:.3f} m)'
    RIG.pose.bones['forearm.L'].rotation_euler.x = 0.5
    eval_co()
    d = np.linalg.norm(np.array(RIG.matrix_world @ RIG.pose.bones['hand.L'].tail) - np.array(RIG.matrix_world @ RIG.data.bones['hand.L'].tail_local))
    assert d > 0.05, f'FK xoay khuỷu mà bàn tay chỉ dời {d:.3f} m'


def kiem_fist_khi_ik():
    tip = dinh_dau_ngon()  # đo ở dáng nghỉ, trước khi dời tay
    RIG.pose.bones['hand.L']['ik_fk'] = 1.0
    doi_the_gioi('ik_hand.L', (0, -0.1, 0.1))
    base = eval_co()
    RIG.pose.bones['hand.L']['fist'] = 1.0
    d = np.linalg.norm(eval_co() - base, axis=1)
    it = {n: round(float(d[tip[n]]), 3) for n in NGON if d[tip[n]] <= 0.03}
    assert not it, f'IK + fist=1 mà ngón dời ít {it}'


def huong_mat(k):
    RIG.update_tag()
    bpy.context.view_layer.update()
    p = RIG.pose.bones[f'eye.{k}']
    return np.array((RIG.matrix_world @ p.tail) - (RIG.matrix_world @ p.head))


def kiem_nhin_theo_look():
    d0 = {k: huong_mat(k) for k in 'LR'}
    doi_the_gioi('look', (0.2, 0, 0))
    for k in 'LR':
        d1 = huong_mat(k)
        goc = math.degrees(math.atan2(d1[0], -d1[1]) - math.atan2(d0[k][0], -d0[k][1]))
        assert goc > 8, f'Mắt {k} chỉ xoay {goc:.1f}° khi look dời 0.2 m sang +X'


def dem_long_trang(k='L'):
    """Render Workbench màu phẳng trước mắt k; đếm điểm ảnh của lòng trắng còn lộ."""
    from mathutils import Vector
    sc = bpy.context.scene
    cam = bpy.data.objects.get('_kiem_cam') or bpy.data.objects.new('_kiem_cam', bpy.data.cameras.new('_kiem_cam'))
    if cam.name not in sc.collection.objects:
        sc.collection.objects.link(cam)
    p = RIG.matrix_world @ RIG.pose.bones[f'eye.{k}'].head
    cam.location = p + Vector((0, -0.35, 0))
    cam.rotation_euler = (p - cam.location).to_track_quat('-Z', 'Y').to_euler()
    cam.data.lens = 120
    sc.camera = cam
    sc.render.engine = 'BLENDER_WORKBENCH'
    sh = sc.display.shading
    sh.light, sh.color_type = 'FLAT', 'OBJECT'
    sc.render.resolution_x = sc.render.resolution_y = 256
    for o in sc.objects:
        o.color = (0, 0, 0, 1)
    bpy.data.objects[f'Nu_LongTrang.{k}'].color = (1, 0, 0, 1)
    out = str(Path(bpy.app.tempdir) / 'kiem_mat.png')
    sc.render.filepath = out
    bpy.ops.render.render(write_still=True)
    im = bpy.data.images.load(out, check_existing=False)
    a = np.array(im.pixels[:]).reshape(-1, 4)
    bpy.data.images.remove(im)
    return int(((a[:, 0] > 0.8) & (a[:, 1] < 0.2)).sum())


def kiem_chop():
    mo = dem_long_trang('L')
    assert mo > 80, f'Mắt mở mà chỉ thấy {mo} điểm lòng trắng'
    RIG.pose.bones['head']['blink_L'] = 1.0
    RIG.update_tag()
    nham = dem_long_trang('L')
    assert nham == 0, f'blink_L=1 vẫn lộ {nham} điểm lòng trắng'


def kiem_chop_khi_nhin_len():
    doi_the_gioi('look', (0, 0, 0.25))
    RIG.pose.bones['head']['blink_L'] = 1.0
    RIG.update_tag()
    n = dem_long_trang('L')
    assert n == 0, f'Nhìn lên rồi chớp vẫn lộ {n} điểm lòng trắng'


def kiem_nhin_thang_giong_mau():
    sc = bpy.context.scene
    for k in 'LR':
        RIG.update_tag()
        bpy.context.view_layer.update()
        dg = bpy.context.evaluated_depsgraph_get()
        o = bpy.data.objects[f'Nu_ConNguoi.{k}'].evaluated_get(dg)
        m = o.to_mesh()
        c = np.array([o.matrix_world @ v.co for v in m.vertices]).mean(0)
        o.to_mesh_clear()
        hoc = np.array(sc[f'tam_hoc_mat_{k}'])
        lech = np.linalg.norm((c - hoc)[[0, 2]])
        assert lech < 0.004, f'Dáng nghỉ: con ngươi {k} lệch tâm hốc {lech * 1000:.1f} mm (XZ)'


def hop_may(k):
    co = eval_co(bpy.data.objects[f'Nu_May.{k}'])
    return co.min(0), co.max(0), co


def kiem_may_tach():
    from mathutils.bvhtree import BVHTree
    from mathutils import Vector
    bvh = BVHTree.FromObject(BODY, bpy.context.evaluated_depsgraph_get())
    for k in 'LR':
        lo, hi, co = hop_may(k)
        # đáy mày tách: dưới mỗi đỉnh mày, da trán liền (không còn vạt mày nổi trên thân)
        for x in np.linspace(lo[0] + 0.004, hi[0] - 0.004, 6):
            z = co[np.abs(co[:, 0] - x) <= np.sort(np.abs(co[:, 0] - x))[3], 2].mean()  # mày cong: lấy cao độ mày tại cột
            hit = bvh.ray_cast(Vector((x, -1.0, z)), Vector((0, 1, 0)), 2.0)
            assert hit[0] is not None, f'Mày {k}: tia ở x={x:.3f} lọt qua thân'
            cot = np.abs(co[:, 0] - x) <= np.sort(np.abs(co[:, 0] - x))[3]  # 4 đỉnh gần cột nhất (lưới thưa)
            may_y = co[cot, 1].min()  # mặt trước của mày ở cột này (đỉnh chân mày nằm trên da)
            assert hit[0].y > may_y + 0.0002, f'Mày {k}: thân còn nổi ngang mày ở x={x:.3f}'


def kiem_may_nang():
    _, _, l0 = hop_may('L')
    _, _, r0 = hop_may('R')
    doi_the_gioi('brow_mid.L', (0, 0, 0.01))
    _, _, l1 = hop_may('L')
    _, _, r1 = hop_may('R')
    dl, dr = np.linalg.norm(l1 - l0, axis=1), np.linalg.norm(r1 - r0, axis=1)
    giua = np.argmin(np.abs(l0[:, 0] - (l0[:, 0].min() + l0[:, 0].max()) / 2))
    assert dl[giua] > 0.007, f'Giữa mày trái chỉ dời {dl[giua]:.4f}'
    assert dr.max() < 0.001, f'Mày phải dời theo {dr.max():.4f}'


def kiem_tran_lien():
    from mathutils.bvhtree import BVHTree
    from mathutils import Vector
    bvh = BVHTree.FromObject(BODY, bpy.context.evaluated_depsgraph_get())
    for k in 'LR':
        lo, hi, _ = hop_may(k)
        for x in np.linspace(lo[0], hi[0], 10):
            for z in np.linspace(lo[2] - 0.004, hi[2] + 0.004, 4):
                hit = bvh.ray_cast(Vector((x, -1.0, z)), Vector((0, 1, 0)), 2.0)
                assert hit[0] is not None and hit[0].y < -0.1, f'Trán {k} hở ở ({x:.3f}, {z:.3f})'


def nhom_dinh(ten):
    g = BODY.vertex_groups.get(ten)
    assert g is not None, f'Thiếu nhóm đỉnh {ten}'
    return np.array([v.index for v in BODY.data.vertices if any(x.group == g.index and x.weight > 0.5 for x in v.groups)])


def kiem_vung_mieng_day():
    sc = bpy.context.scene
    vung = nhom_dinh('MIENG_VUNG')
    assert len(vung) >= 4 * sc['so_dinh_mieng_goc'], f'Vùng miệng {len(vung)} đỉnh < 4 × {sc["so_dinh_mieng_goc"]}'
    assert len(vung) >= 6 * 32, f'Vùng miệng chỉ {len(vung)} đỉnh (< 6 vòng × 32)'


def kiem_vien_lien():
    import bmesh
    lo_ = set(nhom_dinh('MIENG_LO').tolist())
    khe = np.array([BODY.data.vertices[i].co[:] for i in np.r_[nhom_dinh('MIENG_MOI_TREN'), nhom_dinh('MIENG_MOI_DUOI')]])
    lo_ |= {v.index for v in BODY.data.vertices if np.linalg.norm(khe - np.array(v.co), axis=1).min() < 0.004}  # khóe khe môi
    vung = set(nhom_dinh('MIENG_VUNG').tolist())
    bm = bmesh.new()
    bm.from_mesh(BODY.data)
    m = np.array([BODY.data.vertices[i].co[:] for i in vung])
    lo, hi = m.min(0) - 0.01, m.max(0) + 0.01
    ho = [v.index for v in bm.verts if v.is_boundary and all(lo[a] <= v.co[a] <= hi[a] for a in range(3)) and v.index not in lo_]
    bm.free()
    assert not ho, f'{len(ho)} đỉnh hở quanh miệng ngoài khe môi'


def diem_moi(tren):
    """Đỉnh giữa môi trên/dưới ở khe (nhóm MIENG_MOI_TREN/DUOI), gần x=0 nhất."""
    idx = nhom_dinh('MIENG_MOI_TREN' if tren else 'MIENG_MOI_DUOI')
    co = np.array([BODY.data.vertices[i].co[:] for i in idx])
    return int(idx[np.argmin(np.abs(co[:, 0]))])


def mo_ham(do=20):
    RIG.pose.bones['jaw'].rotation_euler.x = math.radians(do)


def kiem_ham_mo():
    t, d = diem_moi(True), diem_moi(False)
    base = eval_co()
    r0 = eval_co(bpy.data.objects['Nu_RangDuoi']).mean(0)
    l0 = eval_co(bpy.data.objects['Nu_Luoi']).mean(0)
    mo_ham()
    co = eval_co()
    assert np.linalg.norm(co[d] - base[d]) > 0.012 and co[d][2] < base[d][2], f'Môi dưới dời {np.linalg.norm(co[d] - base[d]):.4f}'
    assert base[t][2] - co[t][2] < 0.001, f'Môi trên bị hàm kéo xuống {base[t][2] - co[t][2]:.4f}'  # được cong lên (mo_ham_khoe)
    for ten, c0 in (('Nu_RangDuoi', r0), ('Nu_Luoi', l0)):
        dd = np.linalg.norm(eval_co(bpy.data.objects[ten]).mean(0) - c0)
        assert dd > 0.01, f'{ten} chỉ dời {dd:.4f} khi mở hàm'


TRONG_MIENG = ('Nu_KhoangMieng', 'Nu_RangTren', 'Nu_RangDuoi', 'Nu_Luoi', 'Nu_LoiTren', 'Nu_LoiDuoi')


def kiem_mieng_khong_xuyen(tu=None):
    """Hàm mở 20° + cười, Subdivision bật: 15 × 9 tia quanh miệng. Tia chạm răng/khoang/lưỡi mà ngay sau
    đó là da mặt hướng ra máy (trong 3 cm) = đồ trong miệng xuyên ra ngoài da."""
    from mathutils import Vector
    mo_ham()
    if BODY.data.shape_keys and 'cuoi' in BODY.data.shape_keys.key_blocks:
        BODY.data.shape_keys.key_blocks['cuoi'].value = 1.0
    sd = [m for m in BODY.modifiers if m.type == 'SUBSURF']
    for m in sd:
        m.show_viewport = True
    if tu:
        tu()
    sc = bpy.context.scene
    m0 = Vector(sc['tam_mieng'])
    huong = Vector((0, 1, 0))
    loi = []
    try:
        for x in np.linspace(-0.07, 0.07, 15):
            for z in np.linspace(-0.05, 0.03, 9):
                RIG.update_tag()
                bpy.context.view_layer.update()
                dg = bpy.context.evaluated_depsgraph_get()
                ok, p, _, _, ob, _ = sc.ray_cast(dg, m0 + Vector((x, -0.4, z)), huong)
                if not ok or ob.name not in TRONG_MIENG:
                    continue
                for t in TRONG_MIENG:
                    bpy.data.objects[t].hide_viewport = True
                bpy.context.view_layer.update()
                dg = bpy.context.evaluated_depsgraph_get()
                ok2, p2, n2, _, ob2, _ = sc.ray_cast(dg, p, huong)
                for t in TRONG_MIENG:
                    bpy.data.objects[t].hide_viewport = False
                if ok2 and ob2.name == 'Nu_Than' and n2.dot(huong) < 0 and (p2 - p).length < 0.03:
                    loi.append((round(float(x), 3), round(float(z), 3), ob.name))
    finally:
        for m in sd:
            m.show_viewport = False
    assert not loi, f'{len(loi)} tia thấy đồ trong miệng xuyên da, ví dụ {loi[:3]}'


SK_NEN = ['cuoi', 'meu', 'chu_moi', 'mim_moi', 'keo_khoe.L', 'keo_khoe.R', 'ha_khoe.L', 'ha_khoe.R', 'nhech.L', 'nhech.R']
SK_VS = ['vs_A', 'vs_E', 'vs_I', 'vs_O', 'vs_U', 'vs_MBP', 'vs_PHV', 'vs_NT', 'vs_CH', 'vs_KG', 'vs_nghi']
AM = {'A': 'a ă â', 'E': 'e ê', 'I': 'i y', 'O': 'o ô ơ', 'U': 'u ư', 'MBP': 'm b p', 'PHV': 'ph v',
      'NT': 'n t đ d l', 'CH': 'ch tr s x gi', 'KG': 'c k g ng nh kh'}


def lech_sk(ten):
    kb = BODY.data.shape_keys.key_blocks
    co0 = np.array([v.co for v in kb['Basis'].data])
    return np.array([v.co for v in kb[ten].data]) - co0


def kiem_du_shape_key():
    kb = BODY.data.shape_keys.key_blocks if BODY.data.shape_keys else {}
    thieu = [t for t in SK_NEN + SK_VS if t not in kb]
    assert not thieu, f'Thiếu shape key {thieu}'


def kiem_shape_key_chi_o_mieng():
    vung = set(np.r_[nhom_dinh('MIENG_VUNG'), nhom_dinh('MIENG_LO')].tolist())
    ngoai = np.array([i for i in range(len(BODY.data.vertices)) if i not in vung])
    for t in SK_NEN + SK_VS:
        d = np.linalg.norm(lech_sk(t)[ngoai], axis=1).max()
        assert d < 0.0005, f'{t} dời đỉnh ngoài miệng {d:.4f}'


def kiem_khau_hinh_khac_nhau():
    L = {t: lech_sk(t) for t in SK_VS}
    for i, a in enumerate(SK_VS):
        for b in SK_VS[i + 1:]:
            dong = (np.linalg.norm(L[a], axis=1) > 1e-5) | (np.linalg.norm(L[b], axis=1) > 1e-5)
            d = np.linalg.norm(L[a][dong] - L[b][dong], axis=1).mean() if dong.any() else 0
            assert d > 0.001, f'{a} và {b} gần như trùng ({d:.4f})'


def kiem_doi_xung():
    co = np.array([v.co for v in BODY.data.shape_keys.key_blocks['Basis'].data])
    for g in ('keo_khoe', 'ha_khoe', 'nhech'):
        dl, dr = lech_sk(f'{g}.L'), lech_sk(f'{g}.R')
        for vung in (nhom_dinh('MIENG_VUNG'), nhom_dinh('MIENG_LO')):  # ghép cặp theo x, z cùng loại; mặt gốc lệch nhẹ theo y
          xz = co[vung][:, [0, 2]]
          for i, p in zip(vung, xz * np.array([-1, 1])):
            j = vung[np.argmin(np.linalg.norm(xz - p, axis=1))]
            sai = np.abs(dl[i] * np.array([-1, 1, 1]) - dr[j]).max()
            assert sai < 0.0005, f'{g}.L/R không đối xứng ({sai:.4f})'


def kiem_bang_khau_hinh():
    import json
    b = json.loads((Path(bpy.data.filepath).parent / 'khau-hinh.json').read_text(encoding='utf-8'))
    assert len(b) == 11, f'Bảng có {len(b)} mục'
    kb = BODY.data.shape_keys.key_blocks
    am_bang = [x for v in b.values() for x in v['am']]
    for k, v in b.items():
        assert v['shape_key'] in kb, f'{k}: thiếu {v["shape_key"]}'
    for k, s in AM.items():
        for x in s.split():
            assert am_bang.count(x) == 1, f'Âm "{x}" xuất hiện {am_bang.count(x)} lần'


def kiem_muot():
    mods = [m.type for m in BODY.modifiers]
    assert 'SUBSURF' in mods, f'Nu_Than chưa có Subdivision: {mods}'
    assert mods.index('SUBSURF') > mods.index('ARMATURE'), f'Subdivision phải sau Armature: {mods}'
    assert 'CORRECTIVE_SMOOTH' in mods and mods.index('ARMATURE') < mods.index('CORRECTIVE_SMOOTH') < mods.index('SUBSURF'),         f'Thứ tự phải Armature → CorrectiveSmooth → Subdivision: {mods}'
    md = next(m for m in BODY.modifiers if m.type == 'SUBSURF')
    assert md.levels >= 1 and md.render_levels >= 2, f'Mức chia {md.levels}/{md.render_levels}'


def kiem_ngon_doi_xung():
    """Cùng độ gập, đầu từng ngón tay trái và phải phải dời như nhau (lệch < 15 %)."""
    tip = {k: dinh_dau_ngon(k) for k in 'LR'}
    base = eval_co()
    for n in NGON:
        d = {}
        for k in 'LR':
            for j in (1, 2, 3):
                RIG.pose.bones[f'{n}{j}.{k}'].rotation_euler.x = 1.0
            d[k] = np.linalg.norm(eval_co()[tip[k][n]] - base[tip[k][n]])
            for j in (1, 2, 3):
                RIG.pose.bones[f'{n}{j}.{k}'].rotation_euler.x = 0
        assert abs(d['L'] - d['R']) < 0.15 * max(d.values()), f'{n}: tay trái dời {d["L"]:.3f}, phải {d["R"]:.3f}'


def kiem_mat_doi_xung():
    """Hai mắt cùng hình: tâm hốc đối xứng (< 3 mm), lòng trắng lộ lúc nghỉ chênh < 20 %, chớp kín cả mắt phải."""
    sc = bpy.context.scene
    l, r = np.array(sc['tam_hoc_mat_L']), np.array(sc['tam_hoc_mat_R'])
    lech = np.linalg.norm(l * np.array([-1, 1, 1]) - r)
    assert lech < 0.003, f'Tâm hốc mắt lệch gương {lech * 1000:.1f} mm'
    n = {k: dem_long_trang(k) for k in 'LR'}
    assert abs(n['L'] - n['R']) < 0.2 * max(n.values()), f'Lòng trắng lộ: trái {n["L"]}, phải {n["R"]} điểm ảnh'
    RIG.pose.bones['head']['blink_R'] = 1.0
    RIG.update_tag()
    assert dem_long_trang('R') == 0, 'blink_R=1 vẫn lộ lòng trắng mắt phải'


def kiem_da_min():
    """Da mịn kiểu stylized: normal map yếu (vân lỗ chân lông gốc làm mặt sần)."""
    nm = [n for n in BODY.data.materials[0].node_tree.nodes if n.type == 'NORMAL_MAP']
    assert nm and all(n.inputs['Strength'].default_value <= 0.3 for n in nm),         f'Normal map mạnh {[round(n.inputs["Strength"].default_value, 2) for n in nm]}'


def khe_moi(x):
    """Độ hở dọc giữa môi trên và môi dưới ở hoành độ x (theo đỉnh khe gần x nhất)."""
    co = eval_co()
    t, d = nhom_dinh('MIENG_MOI_TREN'), nhom_dinh('MIENG_MOI_DUOI')
    it = t[np.argmin(np.abs(co[t, 0] - x))]
    id_ = d[np.argmin(np.abs(co[d, 0] - x))]
    return co[it, 2] - co[id_, 2]


def dinh_khoe():
    """Hai đỉnh khóe miệng: đỉnh vùng miệng ngoài cùng hai bên, cùng độ cao khe."""
    co = np.array([v.co for v in BODY.data.vertices])
    t = nhom_dinh('MIENG_MOI_TREN')
    z = co[t, 2].mean()
    v = nhom_dinh('MIENG_VUNG')
    gan = v[np.abs(co[v, 2] - z) < 0.006]
    ak = np.abs(co[t, 0]).max()
    return [int(gan[np.argmin(np.abs(co[gan, 0] - s * ak) + np.where(np.abs(co[gan, 0]) >= ak, 0, 1))]) for s in (1, -1)]


def kiem_mieng_mo_tron():
    """Mở hàm 18°: hai khóe miệng trễ xuống ≥ 4 mm và kéo vào ≥ 1.5 mm (miệng mở tròn, không như vết cắt)."""
    kh = dinh_khoe()
    c0 = eval_co()[kh]
    mo_ham(18)
    c1 = eval_co()[kh]
    for (x0, _, z0), (x1, _, z1) in zip(c0, c1):
        assert z0 - z1 >= 0.004, f'Khóe chỉ trễ {(z0 - z1) * 1000:.1f} mm'
        assert abs(x0) - abs(x1) >= 0.0015, f'Khóe chỉ kéo vào {(abs(x0) - abs(x1)) * 1000:.1f} mm'


def kiem_khong_moi():
    """Chủ repo bỏ phần môi: các vòng môi nằm sát da (nhô < 0.3 mm), không mặt nào dùng vật liệu Nu_Moi."""
    co = np.array([v.co for v in BODY.data.vertices])
    be, da = nhom_dinh('MIENG_MOI_BE'), nhom_dinh('MIENG_DA_TRONG')
    for khe_ten, tren in (('MIENG_MOI_TREN', True), ('MIENG_MOI_DUOI', False)):
        khe = nhom_dinh(khe_ten)
        chon = lambda ids: ids[np.argmin(np.abs(co[ids, 0]) + np.where((co[ids, 2] > co[khe, 2].mean()) == tren, 0, 1))]
        b, d, k = chon(be), chon(da), khe[np.argmin(np.abs(co[khe, 0]))]
        t = (co[b, 2] - co[k, 2]) / (co[d, 2] - co[k, 2])
        nho = co[k, 1] + t * (co[d, 1] - co[k, 1]) - co[b, 1]
        assert nho < 0.0003, f'Môi {"trên" if tren else "dưới"} còn nhô {nho * 1000:.2f} mm'
    mats = [m.name for m in BODY.data.materials]
    if 'Nu_Moi' in mats:
        i = mats.index('Nu_Moi')
        n = sum(1 for f in BODY.data.polygons if f.material_index == i)
        assert n == 0, f'{n} mặt còn dùng vật liệu môi'


def kiem_ngam_kin():
    co = eval_co()
    t, d = nhom_dinh('MIENG_MOI_TREN'), nhom_dinh('MIENG_MOI_DUOI')
    xa = max(np.linalg.norm(co[d] - co[i], axis=1).min() for i in t)
    assert xa < 0.0005, f'Ngậm miệng còn hở {xa * 1000:.2f} mm'


def kiem_mieng_can_giua():
    x = bpy.context.scene['tam_mieng'][0]
    assert abs(x) < 0.002, f'Tâm miệng lệch trục giữa {x * 1000:.1f} mm'


def _goc_canh_mieng(chon=None):
    """Góc (độ) giữa pháp tuyến hai mặt kề nhau ở vùng miệng (lưới đã chia mịn); chon = chỉ số cạnh cố định."""
    import bmesh
    RIG.update_tag()
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    e = BODY.evaluated_get(dg)
    bm = bmesh.new()
    bm.from_mesh(e.to_mesh())
    e.to_mesh_clear()
    m = np.array(bpy.context.scene['tam_mieng'])
    bm.edges.ensure_lookup_table()
    if chon is None:
        chon = []
        for ed in bm.edges:
            c = np.array((ed.verts[0].co + ed.verts[1].co) / 2)
            if len(ed.link_faces) == 2 and abs(c[0] - m[0]) < 0.08 and -0.06 < c[2] - m[2] < 0.035                     and c[1] < m[1] + 0.002:  # cạnh nhìn thấy từ phía trước
                chon.append(ed.index)
    out = [math.degrees(bm.edges[i].link_faces[0].normal.angle(bm.edges[i].link_faces[1].normal, 0.0)) for i in chon]
    bm.free()
    return np.array(out), chon


def kiem_khong_gap(cac_dang=None):
    """Mở hàm (và khẩu hình): mọi cạnh nhìn thấy quanh miệng (gồm môi) không gấp thêm quá 30° so với lúc nghỉ."""
    import json
    sd = [m for m in BODY.modifiers if m.type == 'SUBSURF']
    muc = [m.levels for m in sd]
    for m in sd:
        m.levels = 1  # ngưỡng 30° hiệu chỉnh ở mức 1; mức cao chia nhỏ khe có crease nên góc tăng giả
        m.show_viewport = True
    try:
        g0, chon = _goc_canh_mieng()
        dang = [(None, 20)]
        if cac_dang:
            dang += cac_dang
        for sk, do in dang:
            for kb in (BODY.data.shape_keys.key_blocks[1:] if BODY.data.shape_keys else []):
                if kb.name != 'mo_ham_khoe':
                    kb.value = 0
            if sk:
                BODY.data.shape_keys.key_blocks[sk].value = 1
            mo_ham(do)
            g1, _ = _goc_canh_mieng(chon)
            tang = (g1 - g0).max()
            assert tang <= 30, f'{sk or "hàm"} {do}°: nếp gấp tăng {tang:.0f}°'
    finally:
        for m in sd:
            m.show_viewport = False
        for m, l in zip(sd, muc):
            m.levels = l


def kiem_cs_chi_mieng():
    cs = [m for m in BODY.modifiers if m.type == 'CORRECTIVE_SMOOTH']
    assert cs, 'Chưa có Corrective Smooth'
    pb = RIG.pose.bones
    pb['upper_arm.L'].rotation_euler.x = math.radians(80)
    pb['forearm.L'].rotation_euler.x = math.radians(60)
    doi_the_gioi('ik_foot.L', (0, 0, 0.15))
    mo_ham(20)
    co1 = eval_co()
    for m in cs:
        m.show_viewport = False
    co0 = eval_co()
    for m in cs:
        m.show_viewport = True
    ngoai = np.setdiff1d(np.arange(len(co0)), nhom_dinh('MIENG_MUOT'))
    d = np.linalg.norm(co1[ngoai] - co0[ngoai], axis=1).max()
    assert d < 0.0001, f'Corrective Smooth dời đỉnh ngoài vùng miệng {d * 1000:.2f} mm'


def kiem_khau_hinh_muot():
    """Mỗi shape key: chênh độ dời giữa hai đỉnh kề nhau ≤ 40 % độ dời lớn nhất của key (không gãy)."""
    E = np.array([e.vertices[:] for e in BODY.data.edges])
    xau = {}
    for t in SK_NEN + SK_VS + ['mo_ham_khoe']:
        d = lech_sk(t)
        lon = np.linalg.norm(d, axis=1).max()
        if lon < 1e-5:
            continue
        chenh = np.linalg.norm(d[E[:, 0]] - d[E[:, 1]], axis=1).max() / lon
        if chenh > 0.4:
            xau[t] = round(float(chenh), 2)
    assert not xau, f'Shape key gãy (chênh/lớn nhất): {xau}'


def kiem_khau_hinh_khong_gap():
    import json
    b = json.loads((Path(bpy.data.filepath).parent / 'khau-hinh.json').read_text(encoding='utf-8'))
    kiem_khong_gap([(v['shape_key'], v['jaw_do']) for v in b.values()])


def kiem_rang_cong():
    """Răng trên/dưới là dải cong chữ U: hai đầu lùi sau giữa ≥ 6 mm. Có lợi trên/dưới."""
    m = np.array(bpy.context.scene['tam_mieng'])
    for ten in ('Nu_RangTren', 'Nu_RangDuoi', 'Nu_LoiTren', 'Nu_LoiDuoi'):
        assert ten in bpy.data.objects, f'Thiếu {ten}'
    for ten in ('Nu_RangTren', 'Nu_RangDuoi'):
        co = eval_co(bpy.data.objects[ten])
        x = co[:, 0] - m[0]
        giua = co[np.abs(x) < 0.003, 1].min()
        dau = co[np.abs(x) > 0.85 * np.abs(x).max(), 1].min()
        assert dau - giua >= 0.006, f'{ten}: hai đầu chỉ lùi {(dau - giua) * 1000:.1f} mm'


def kiem_mim_khong_cheo():
    """vs_MBP / vs_nghi: hai mép khe vẫn khép (≤ 0.8 mm) nhưng không vượt qua nhau (lộ thành trong thành vạch)."""
    t, d = nhom_dinh('MIENG_MOI_TREN'), nhom_dinh('MIENG_MOI_DUOI')
    for sk in ('vs_MBP', 'vs_nghi'):
        dat_lai()
        BODY.data.shape_keys.key_blocks[sk].value = 1
        co = eval_co()
        for i in t:
            j = d[np.argmin(np.abs(co[d, 0] - co[i, 0]))]
            assert co[i, 2] - co[j, 2] >= -0.0002, f'{sk}: môi dưới vượt môi trên {(co[j, 2] - co[i, 2]) * 1000:.2f} mm'
            assert np.linalg.norm(co[i] - co[j]) < 0.0008, f'{sk}: khe hở {np.linalg.norm(co[i] - co[j]) * 1000:.2f} mm'


def kiem_uv_khong_xe():
    """Vùng miệng: UV các đỉnh trong cùng một mặt không trải xa (> 0.03) — trải xa là mặt kéo texture qua
    nhiều đảo UV, hiện thành vệt nâu mảnh."""
    me = BODY.data
    uv = me.uv_layers[0].data
    g = BODY.vertex_groups['MIENG_MUOT'].index
    vung = {v.index for v in me.vertices if any(x.group == g for x in v.groups)}
    xe = 0
    for f in me.polygons:
        if all(i in vung for i in f.vertices):
            u = np.array([uv[l].uv[:] for l in f.loop_indices])
            if np.ptp(u, axis=0).max() > 0.03:
                xe += 1
    assert xe == 0, f'{xe} mặt vùng miệng kéo texture qua nhiều đảo UV'


def kiem_file_o_dang_nghi():
    bat = {k: round(v, 2) for k, v in LUC_MO.items() if abs(v) > 1e-6}
    assert not bat, f'File lưu còn bật shape key {list(bat)[:5]}… ({len(bat)})'


KIEM = {
    'kiem_uv_khong_xe': kiem_uv_khong_xe,
    'kiem_mim_khong_cheo': kiem_mim_khong_cheo,
    'kiem_rang_cong': kiem_rang_cong,
    'kiem_khau_hinh_muot': kiem_khau_hinh_muot,
    'kiem_khau_hinh_khong_gap': kiem_khau_hinh_khong_gap,
    'kiem_khong_gap': kiem_khong_gap,
    'kiem_cs_chi_mieng': kiem_cs_chi_mieng,
    'kiem_khong_moi': kiem_khong_moi,
    'kiem_ngam_kin': kiem_ngam_kin,
    'kiem_mieng_can_giua': kiem_mieng_can_giua,
    'kiem_da_min': kiem_da_min,
    'kiem_mieng_mo_tron': kiem_mieng_mo_tron,
    'kiem_mat_doi_xung': kiem_mat_doi_xung,
    'kiem_ngon_doi_xung': kiem_ngon_doi_xung,
    'kiem_file_o_dang_nghi': kiem_file_o_dang_nghi,
    'kiem_muot': kiem_muot,
    'kiem_du_shape_key': kiem_du_shape_key,
    'kiem_shape_key_chi_o_mieng': kiem_shape_key_chi_o_mieng,
    'kiem_khau_hinh_khac_nhau': kiem_khau_hinh_khac_nhau,
    'kiem_doi_xung': kiem_doi_xung,
    'kiem_bang_khau_hinh': kiem_bang_khau_hinh,
    'kiem_vung_mieng_day': kiem_vung_mieng_day,
    'kiem_vien_lien': kiem_vien_lien,
    'kiem_ham_mo': kiem_ham_mo,
    'kiem_mieng_khong_xuyen': kiem_mieng_khong_xuyen,
    'kiem_may_tach': kiem_may_tach,
    'kiem_may_nang': kiem_may_nang,
    'kiem_tran_lien': kiem_tran_lien,
    'kiem_nhin_theo_look': kiem_nhin_theo_look,
    'kiem_chop': kiem_chop,
    'kiem_chop_khi_nhin_len': kiem_chop_khi_nhin_len,
    'kiem_nhin_thang_giong_mau': kiem_nhin_thang_giong_mau,
    'kiem_ik_tay_bam': kiem_ik_tay_bam,
    'kiem_ik_tay_nghi': kiem_ik_tay_nghi,
    'kiem_ik_fk_tat': kiem_ik_fk_tat,
    'kiem_fist_khi_ik': kiem_fist_khi_ik,
    'kiem_vat_lieu_da': kiem_vat_lieu_da,
    'kiem_ngon_rieng': kiem_ngon_rieng,
    'kiem_fist': kiem_fist,
}


def chay(cac_kiem):
    loi = 0
    for ten, f in cac_kiem.items():
        dat_lai()
        try:
            f()
            print('PASS', ten)
        except Exception as e:  # in lý do, chạy tiếp các mục khác
            loi += 1
            print('FAIL', ten + ':', e)
            traceback.print_exc(limit=1)
    dat_lai()
    print(f'KET QUA: {len(cac_kiem) - loi}/{len(cac_kiem)} PASS')
    sys.stdout.flush()
    if loi:
        sys.exit(1)


if __name__ == '__main__':
    assert RIG and BODY, 'Thiếu Nu_Rig hoặc Nu_Than'
    chay(KIEM)
