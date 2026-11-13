"""Hướng nhìn và con ngươi đi theo mặt. Con ngươi KHÔNG dùng Surface Deform (nó kéo đỉnh trên theo mí làm con ngươi dài ra): gan_nhin gỡ Bam_mat của con ngươi và thay bằng:
con ngươi di chuyển CỨNG theo vị trí object, do driver tính:
  vị trí = Σ giá_trị_key × độ_dời_da_tại_tâm_con_ngươi (shape key tuyến tính) + hướng nhìn (k_nhin_x, k_nhin_y),
  riêng z bị kẹp giữa hai mí: đỉnh con ngươi không vượt mí trên, đáy không xuống dưới mí dưới.
Sau đó modifier Dan_mat (Shrinkwrap chiếu theo Y) đặt lại độ cao theo da. Yêu cầu ma trận vật = đơn vị lúc nghỉ (chung.dung_nam đã đưa vào lưới)."""
import numpy as np
import bpy
from mathutils.kdtree import KDTree
from . import chung

NHIN_X = 0.020          # m, nhìn sang trái nhân vật (+X) ở k_nhin_x = 1
NHIN_Z_LEN = 0.006      # m, nhìn lên ở k_nhin_y = +1 (còn bị kẹp bởi mí trên)
NHIN_Z_XUONG = 0.018    # m, nhìn xuống ở k_nhin_y = −1 (còn bị kẹp bởi mí dưới)
OFFSET_MAT = 0.0003     # m, con ngươi nổi trên da
BAN_KINH_TAM = 0.006    # m, vùng da quanh tâm con ngươi dùng để lấy độ dời


def _bo_driver(ob, kieu, chi_so):
    if ob.animation_data:
        for fc in [f for f in ob.animation_data.drivers if f.data_path == kieu and f.array_index == chi_so]: ob.animation_data.drivers.remove(fc)


def _kd(co):
    kd = KDTree(len(co))
    for i, p in enumerate(co): kd.insert(p, i)
    kd.balance(); return kd


def gan_nhin(dau):
    """Con ngươi đi theo da cứng + hướng nhìn + dán lại lên da. Gọi lại không nhân đôi driver hay modifier; gọi lại sau khi đổi bộ key."""
    head = dau.head; sk = head.data.shape_keys
    cb = sk.reference_key; keys = [kb for kb in sk.key_blocks if kb != cb]
    co0 = np.array([tuple(v.co) for v in head.data.vertices]); kd = _kd(co0)
    dk = {kb.name: np.array([tuple(p.co) for p in kb.data]) - co0 for kb in keys}       # độ dời từng đỉnh theo từng key
    for k in 'LR':
        ob = dau.parts[f'Pupil.{k}']
        m_sd = ob.modifiers.get('Bam_mat')
        if m_sd: ob.modifiers.remove(m_sd)
        for ten in ('Nhin_X', 'Nhin_Z'):
            m = ob.modifiers.get(ten)
            if m: ob.modifiers.remove(m)
        ob.location = (0, 0, 0)
        vs = np.array([tuple(v.co) for v in ob.data.vertices]); tam = vs.mean(axis=0); zmax, zmin = vs[:, 2].max(), vs[:, 2].min()
        idx_p = [i for _, i, _ in kd.find_range(tam, BAN_KINH_TAM)] or [kd.find(tam)[1]]
        i_up = kd.find(tuple(dau.neo[f'lid_up.{k}']))[1]; i_lo = kd.find(tuple(dau.neo[f'lid_low.{k}']))[1]
        h0 = 0.0     # đỉnh con ngươi không tiến sát mí trên hơn lúc nghỉ (nhìn lên chỉ được khi mí mở thêm)
        g1 = zmin - dau.neo[f'lid_low.{k}'].z
        he = []   # (tên key, dx, dy, dz da tại tâm, Dz mí trên, Dz mí dưới)
        for kb in keys:
            d = dk[kb.name]; dp = d[idx_p].mean(axis=0)
            he.append((kb.name, dp[0], dp[1], dp[2], d[i_up][2], d[i_lo][2]))
        for ax in range(3):
            _bo_driver(ob, 'location', ax)
            drv = ob.driver_add('location', ax).driver; drv.type = 'SCRIPTED'
            for nm, kenh in (('kx', 'nhin_x'), ('ky', 'nhin_y')):
                v = drv.variables.new(); v.name = nm; v.type = 'SINGLE_PROP'
                v.targets[0].id_type = 'OBJECT'; v.targets[0].id = head; v.targets[0].data_path = f'["k_{kenh}"]'
            tong = {'d': [], 'D': [], 'L': []}
            for j, (ten, dx, dy, dz, Dz, Lz) in enumerate(he):
                vj = drv.variables.new(); vj.name = f'v{j}'; vj.type = 'SINGLE_PROP'
                vj.targets[0].id_type = 'KEY'; vj.targets[0].id = sk; vj.targets[0].data_path = f'key_blocks["{ten}"].value'
                c = (dx, dy, dz)[ax]
                if abs(c) > 1e-7: tong['d'].append(f'{c:.7f}*v{j}')
                if ax == 2:
                    if abs(Dz) > 1e-7: tong['D'].append(f'{Dz:.7f}*v{j}')
                    if abs(Lz) > 1e-7: tong['L'].append(f'{Lz:.7f}*v{j}')
            S = lambda l: '(' + ('+'.join(l) if l else '0') + ')'
            if ax == 0: drv.expression = f'{S(tong["d"])}+{NHIN_X}*kx'
            elif ax == 1: drv.expression = S(tong['d'])
            else: drv.expression = f'max(min({S(tong["d"])}+{NHIN_Z_LEN}*max(ky,0)+{NHIN_Z_XUONG}*min(ky,0),{S(tong["D"])}+{h0:.7f}),{S(tong["L"])}-{g1:.7f})'
        sw = ob.modifiers.get('Dan_mat') or ob.modifiers.new('Dan_mat', 'SHRINKWRAP')
        sw.target = head; sw.wrap_method = 'PROJECT'; sw.use_project_x = sw.use_project_z = False; sw.use_project_y = True
        sw.use_positive_direction = sw.use_negative_direction = True; sw.cull_face = 'OFF'; sw.project_limit = 0.05; sw.offset = 0.0
        # chiếu theo Y đặt đỉnh lên da nhưng ở chỗ da nghiêng (phía mũi) có thể chìm dưới da → bước hai đẩy ra ngoài theo pháp tuyến
        no = ob.modifiers.get('Noi_mat') or ob.modifiers.new('Noi_mat', 'SHRINKWRAP')
        no.target = head; no.wrap_method = 'NEAREST_SURFACEPOINT'; no.wrap_mode = 'OUTSIDE_SURFACE'; no.offset = OFFSET_MAT
    bpy.context.view_layer.update()
