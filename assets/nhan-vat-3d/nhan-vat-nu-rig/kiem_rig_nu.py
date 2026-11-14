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
    """Đưa mọi xương về dáng nghỉ và thuộc tính về mặc định."""
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


KIEM = {
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
