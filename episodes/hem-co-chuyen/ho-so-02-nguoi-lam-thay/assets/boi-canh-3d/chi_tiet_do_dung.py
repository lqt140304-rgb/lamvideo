"""Refine existing room props; metres, design coordinates, no character/layout changes.

Call refine() after xay_phong_tro.build(). Only named placeholder objects are replaced.
Each refinement collection has a grouping root and contact anchors; not a complete animation rig.
"""
import math
import bpy
from mathutils import Vector
import xay_phong_tro as B
import vat_lieu as M


def remove(*names):
    for name in names:
        ob = bpy.data.objects.get(name)
        if ob is not None:
            bpy.data.objects.remove(ob, do_unlink=True)


def mesh(name, verts, faces, material, coll, smooth=True):
    data = bpy.data.meshes.new(name)
    data.from_pydata([(B.mx(x), y, z) for x, y, z in verts], [], [tuple(reversed(f)) for f in faces])
    data.update()
    ob = bpy.data.objects.new(name, data)
    coll.objects.link(ob)
    data.materials.append(material)
    if smooth:
        for p in data.polygons:
            p.use_smooth = True
    return ob


def curve(name, pts, radius, material, coll, closed=False):
    data = bpy.data.curves.new(name, 'CURVE'); data.dimensions = '3D'
    data.bevel_depth = radius; data.bevel_resolution = 2; data.resolution_u = 8
    spline = data.splines.new('BEZIER'); spline.bezier_points.add(len(pts) - 1)
    for p, xyz in zip(spline.bezier_points, pts):
        p.co = (B.mx(xyz[0]), xyz[1], xyz[2]); p.handle_left_type = p.handle_right_type = 'AUTO'
    spline.use_cyclic_u = closed
    ob = bpy.data.objects.new(name, data); coll.objects.link(ob); data.materials.append(material)
    return ob


def vessel(name, x, y, profile, material, coll, segments=40):
    """Closed radial cross-section: real inner wall, rim and bottom, no black mouth decal."""
    verts, rings, faces = [], [], []
    for radius, z in profile:
        if radius == 0:
            rings.append([len(verts)]); verts.append((x, y, z))
        else:
            rings.append(list(range(len(verts), len(verts) + segments)))
            verts.extend((x + radius * math.cos(t * math.tau / segments), y + radius * math.sin(t * math.tau / segments), z) for t in range(segments))
    for a, b in zip(rings, rings[1:] + rings[:1]):
        for i in range(segments):
            j = (i + 1) % segments
            if len(a) == 1 and len(b) > 1: faces.append((a[0], b[j], b[i]))
            elif len(b) == 1 and len(a) > 1: faces.append((a[i], a[j], b[0]))
            elif len(a) > 1 and len(b) > 1: faces.append((a[i], a[j], b[j], b[i]))
    return mesh(name, verts, faces, material, coll)


def subtle_wood(name, color):
    mat = M.solid(name, color, rough=.83)
    nt = mat.node_tree; bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    tex = nt.nodes.new('ShaderNodeTexCoord'); mapping = nt.nodes.new('ShaderNodeVectorMath'); mapping.operation = 'MULTIPLY'; mapping.inputs[1].default_value = (1.3, 18, 2)
    noise = nt.nodes.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 3; noise.inputs['Detail'].default_value = 2
    ramp = nt.nodes.new('ShaderNodeValToRGB'); base = M._hex(color)
    ramp.color_ramp.elements[0].color = tuple(v*.93 for v in base[:3]) + (1,)
    ramp.color_ramp.elements[1].color = base
    nt.links.new(tex.outputs['Object'], mapping.inputs[0]); nt.links.new(mapping.outputs[0], noise.inputs['Vector']); nt.links.new(noise.outputs['Fac'], ramp.inputs[0]); nt.links.new(ramp.outputs[0], bsdf.inputs['Base Color'])
    return mat


def laptop(m, c):
    before=set(bpy.data.objects)
    remove('laptop_day', 'laptop_manhinh', 'laptop_mat', *[f'giay{i}' for i in range(3)])
    metal=M.solid('CT_laptop_satin', '#515b5e', .7, .35); keys=M.solid('CT_phim', '#303a3c', .88); rubber=M.solid('CT_cao_su', '#283331', .95)
    x,y=2.79,.33
    B.box('CT_laptop_vo_day',x-.17,x+.17,y-.115,y+.115,.75,.766,metal,.005,c)
    for xx in [-.125,.125]: B.box('CT_chan_cao_su',x+xx-.018,x+xx+.018,y+.075,y+.095,.748,.751,rubber,.001,c)
    B.cyl('CT_ban_le',x,y-.11,.771,.008,.292,metal,axis='X',coll=c)
    for row in range(4):
        for col in range(12):
            xx=x-.145+col*.024; yy=y-.072+row*.022
            B.box(f'CT_key_{row}_{col}',xx,xx+.019,yy,yy+.015,.766,.769,keys,.002,c)
    B.box('CT_space',x-.061,x+.061,y+.02,y+.034,.766,.769,keys,.002,c)
    B.box('CT_touchpad',x-.052,x+.052,y+.052,y+.101,.7663,.767,metal,.003,c)
    for i in range(2): B.cyl(f'CT_led{i}',x+.14+i*.008,y+.107,.7667,.0012,.001,m['man_hinh'],coll=c,verts=8)
    rot=(math.radians(14),0,0); pivot=(x,y-.11,.765)
    B.box('CT_laptop_cadre',x-.17,x+.17,y-.12,y-.105,.766,.995,metal,.005,c,rot,pivot)
    B.box('CT_laptop_ecran',x-.158,x+.158,y-.1048,y-.101,.781,.979,m['man_hinh'],.001,c,rot,pivot)
    # Screen UI is deliberately separate; no baked dates or dialogue.
    B.box('CT_webcam',x-.003,x+.003,y-.1009,y-.1003,.984,.990,keys,.001,c,rot,pivot)
    paper=M.solid('CT_giay', '#e9e1ce', .96)
    for i in range(3): B.box(f'CT_giay_{i}',2.36+i*.002,2.51+i*.002,.37,.54,.75+i*.001,.751+i*.001,paper,.0007,c)
    # Rubber feet, rather than the casing, support the laptop on the desktop.
    for ob in set(bpy.data.objects)-before:
        if not ob.name.startswith('CT_giay_'):ob.location.z+=.002
    return {'screen':(x,.18,.882),'keyboard':(x,.32,.771),'grip':(x,.445,.760)}


def books(m,c):
    pages=M.solid('CT_ruot_sach','#e4d9c2',.97); seam=M.solid('CT_gay_sach','#a48e6b',.9)
    for group,count,z in [('sach',9,.77),('sach_t',6,1.02)]:
        for i in range(count):
            remove(f'{group}{i}')
            if group=='sach': w=.025+.01*(i%3); x=2.14+sum(.03+.008*(j%3) for j in range(i)); h=.17+.03*(i%2)
            else: w=.04; x=2.14+i*.05; h=.18
            col=m['bia'][(i+(2 if group=='sach_t' else 0))%5]
            B.box(f'CT_pages_{group}{i}',x+.002,x+w-.002,.044,.169,z+.003,z+h-.003,pages,.001,c)
            for xx in [x,x+w-.002]: B.box('CT_bia',xx,xx+.002,.03,.174,z,z+h,col,.0008,c)
            B.box('CT_gay',x,x+w,.17,.177,z,z+h,col,.0015,c)
            for zz in [z+.025,z+h-.028]: B.box('CT_gay_nep',x+.002,x+w-.002,.177,.178,zz,zz+.0015,seam,.0004,c)
    return {'shelf':(2.34,.17,.77)}


def lamp(m,c):
    remove('den_de','den_than','den_chup')
    paint=M.solid('CT_den_son','#b97f69',.82); inside=M.solid('CT_den_long','#eee5cf',.9)
    B.cyl('CT_den_de',2.66,.12,.762,.063,.024,paint,coll=c,bevel=.006)
    curve('CT_den_co',[(2.66,.12,.774),(2.66,.12,.97),(2.66,.15,1.09)],.008,paint,c)
    vessel('CT_den_chup',2.66,.16,[(.081,1.09),(.079,1.098),(.033,1.17),(.014,1.173),(.012,1.16),(.028,1.158),(.071,1.095)],paint,c)
    B.sphere('CT_den_bong_tat',2.66,.16,1.123,.021,inside,coll=c)
    B.cyl('CT_den_cong_tac',2.695,.12,.778,.007,.004,m['den'],coll=c)
    return {'switch':(2.695,.12,.782)}


def rounded_rect(x0,x1,y0,y1,z,r=.025):
    pts=[]
    for x,y,a in [(x1-r,y1-r,0),(x0+r,y1-r,90),(x0+r,y0+r,180),(x1-r,y0+r,270)]:
        pts.extend((x+r*math.cos(math.radians(a+t)),y+r*math.sin(math.radians(a+t)),z) for t in range(0,90,15))
    return pts


def kitchen(m,c):
    remove('tu_bep','mat_bep','chau_rua','long_chau','voi_dung','voi_ngang','voi_dau','gia_bat',*[f'dia{i}' for i in range(5)],*[f'coc{i}' for i in range(4)])
    steel=M.solid('CT_inox_mo','#bdc4be',.4,.85)
    # Hollow cabinet and four counter slabs leave a real opening above the bowl.
    for x0,x1 in [(.02,.045),(1.025,1.05)]: B.box('CT_tu_bep_vach',x0,x1,.02,.57,.07,.84,m['tu_bep'],.005,c)
    B.box('CT_tu_bep_lung',.02,1.05,.02,.04,.07,.84,m['tu_bep'],.004,c)
    B.box('CT_tu_bep_day',.02,1.05,.02,.57,.07,.095,m['tu_bep'],.004,c)
    for x0,x1,y0,y1 in [(.02,.17,.02,.60),(.63,1.06,.02,.60),(.17,.63,.02,.075),(.17,.63,.505,.60)]: B.box('CT_mat_bep',x0,x1,y0,y1,.84,.875,m['mat_bep'],.004,c)
    loops=[rounded_rect(.17,.63,.075,.505,.878),rounded_rect(.19,.61,.095,.485,.873),rounded_rect(.22,.58,.12,.46,.735),rounded_rect(.214,.586,.114,.466,.728),rounded_rect(.164,.636,.069,.511,.873)]
    verts=[p for ring in loops for p in ring]; n=len(loops[0]); faces=[]
    for a,b in [(0,1),(1,2),(3,4),(4,0)]:
        for i in range(n): faces.append((a*n+i,a*n+(i+1)%n,b*n+(i+1)%n,b*n+i))
    faces.extend([tuple(range(2*n,3*n)),tuple(reversed(range(3*n,4*n)))])
    mesh('CT_chau_rua_rong',verts,faces,steel,c)
    B.cyl('CT_lo_thoat',.40,.30,.737,.026,.002,m['den'],coll=c)
    B.torus('CT_vien_thoat',.40,.30,.739,.023,.0025,steel,coll=c)
    for i in range(6):
        a=i*math.tau/6;B.cyl('CT_lo_luoi',.4+.013*math.cos(a),.30+.013*math.sin(a),.740,.002,.001,steel,coll=c,verts=8)
    curve('CT_voi_co_cong',[(.4,.067,.88),(.4,.067,1.05),(.4,.10,1.13),(.4,.20,1.13),(.4,.25,1.08),(.4,.25,1.04)],.011,steel,c)
    B.cyl('CT_dau_voi',.4,.25,1.037,.015,.025,steel,coll=c)
    B.cyl('CT_mieng_voi',.4,.25,1.023,.010,.001,m['den'],coll=c)
    B.cyl('CT_khoa_nuoc',.46,.067,.91,.017,.06,steel,coll=c)
    curve('CT_tay_gat',[(.46,.067,.935),(.47,.09,.954),(.49,.13,.954)],.005,steel,c)
    for x in [.668,.993]: curve('CT_gia_bat_bien',[(x,.08,.881),(x,.08,.902),(x,.32,.902),(x,.32,.881)],.003,steel,c)
    for y in [.10,.29]: curve('CT_gia_bat_doc',[(.668,y,.893),(.993,y,.893)],.003,steel,c)
    for i in range(6):
        x=.687+i*.052;curve('CT_gia_bat_khe',[(x,.1,.895),(x,.14,.93),(x,.24,.93),(x,.29,.895)],.0025,steel,c)
    for i in range(5):
        # Shallow dish with real concave face, then turn it upright in the drying rack.
        x=.704+i*.056; ob=vessel('CT_dia_su',0,0,[(0,0),(.03,0),(.083,.012),(.088,.018),(.085,.022),(.065,.014),(.025,.006),(0,.006)],m['nhua_trang'],c)
        # Geometry is authored around world origin in design X; undo mirrored origin before placement.
        for v in ob.data.vertices:
            dx=v.co.x-B.W; yy=v.co.y; zz=v.co.z
            v.co=(B.mx(x)+zz, .20+yy, .965-dx)
    colors=['#d5b46a','#ad6259','#eee5d2','#7fa68a']
    for i,col in enumerate(colors):
        x=.20+i*.10; mat=M.solid(f'CT_coc_su_{i}',col,.68)
        vessel('CT_coc_rong',x,.085,[(0,1.525),(.024,1.525),(.032,1.533),(.034,1.607),(.029,1.609),(.027,1.536),(0,1.536)],mat,c)
        curve('CT_quai_coc',[(x+.030,.085,1.59),(x+.052,.085,1.594),(x+.055,.085,1.555),(x+.030,.085,1.55)],.004,mat,c)
    # Soap and sponge give a reason for the washing action; both rest on the counter.
    soap=M.solid('CT_nuoc_rua_chen','#9baa78',.76); sponge=M.solid('CT_mieng_rua','#d8b768',.97)
    B.box('CT_chai_rua',.08,.125,.405,.458,.875,.976,soap,.009,c)
    B.cyl('CT_nap_chai_rua',.1025,.431,.986,.014,.019,m['den'],coll=c)
    B.box('CT_mut_rua',.645,.710,.36,.41,.875,.893,sponge,.004,c)
    return {'water_outlet':(.4,.25,1.023),'drain':(.4,.30,.740),'dish_grip':(.816,.20,1.03)}


def clothing(m,c):
    remove(*[f'ao_treo{i}' for i in range(5)],'thanh_ao','ke_tu3')
    B.cyl('CT_thanh_ao',1.675,.29,1.82,.009,.69,m['inox'],axis='X',coll=c)
    for i,x in enumerate([1.51,1.84]):
        y=.31+i*.035
        curve('CT_moc_ao',[(x-.016,y,1.795),(x-.012,y,1.842),(x+.014,y,1.842),(x+.012,y,1.803),(x,y,1.77)],.003,m['inox'],c)
        curve('CT_vai_moc',[(x,y,1.775),(x-.12,y,1.705),(x,y,1.695),(x+.12,y,1.705)],.0035,m['inox'],c,True)
        # Rounded shirt silhouette; collar and two folds, not a rectangular hanging block.
        contour=[(-.035,1.745),(-.095,1.73),(-.164,1.66),(-.127,1.622),(-.105,1.65),(-.11,1.31),(-.04,1.298),(.035,1.305),(.11,1.31),(.105,1.65),(.127,1.622),(.164,1.66),(.095,1.73),(.035,1.745),(0,1.72)]
        n=len(contour);verts=[(x+xx,y+depth,z) for depth in [-.008,.008] for xx,z in contour];faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(j,(j+1)%n,(j+1)%n+n,j+n) for j in range(n)]
        ob=mesh('CT_ao_treo_mem',verts,faces,m['ao'][i],c,False);be=ob.modifiers.new('Mep_vai_mem','BEVEL');be.width=.008;be.segments=3
        curve('CT_co_ao',[(x-.035,y+.012,1.745),(x,y+.018,1.72),(x+.035,y+.012,1.745)],.003,m['ao'][(i+1)%4],c)
        for dx in [-.04,.042]: curve('CT_nep_vai',[(x+dx,y+.010,1.66),(x+dx*.8,y+.013,1.45),(x+dx*1.05,y+.010,1.33)],.0013,m['ao'][i],c)
    # Folded clothes keep their base mass; front lips make the fold readable without tiny wrinkles.
    for k,(z,count) in enumerate([(.525,3),(1.025,4),(.025,2)]):
        for i in range(count):
            x=1.36+i*.20
            curve('CT_nep_ao_gap',[(x,.461,z+.025),(x+.08,.465,z+.019),(x+.17,.461,z+.025)],.002,m['ao'][(i+k+1)%4],c)
    return {'rail':(1.675,.29,1.82)}


def cloth(m,c):
    remove('goi0','goi1','chan_nem','chan_cuon')
    for k,x in enumerate([2.0,2.52]):
        # Two gridded surfaces, joined at the seam: fabric bulges instead of a hard cuboid.
        nx,ny=16,12;verts=[];faces=[]
        for side in [1,-1]:
            for j in range(ny+1):
                v=-1+2*j/ny
                for i in range(nx+1):
                    u=-1+2*i/nx;bulge=(max(0,1-u*u)*max(0,1-v*v))**.65
                    verts.append((x+.25*u,3.71+.18*v,.300+side*(.010+.038*bulge)))
        stride=nx+1;layer=stride*(ny+1)
        for offset in [0,layer]:
            for j in range(ny):
                for i in range(nx):
                    a=offset+j*stride+i;f=(a,a+1,a+1+stride,a+stride);faces.append(f if offset==0 else tuple(reversed(f)))
        edge=list(range(stride))+[j*stride+nx for j in range(1,ny+1)]+[ny*stride+i for i in range(nx-1,-1,-1)]+[j*stride for j in range(ny-1,0,-1)]
        for a,b in zip(edge,edge[1:]+edge[:1]):faces.append((a,b,b+layer,a+layer))
        mesh('CT_goi_phong',verts,faces,m['goi'],c)
        curve('CT_duong_may_goi',[(x+.25*math.cos(t),3.71+.18*math.sin(t),.300) for t in [i*math.tau/32 for i in range(32)]],.0013,m['nem'],c,True)
    # Explicit wrap: top stays above the sheet; the skirt stays outside the mattress.
    left=[(1.572,.105),(1.574,.15),(1.575,.20),(1.576,.244)]
    left += [(1.59-.014*math.cos(t),.244+.014*math.sin(t)) for t in [i*math.pi/16 for i in range(1,9)]]
    top=[(1.59+i*1.38/32,.258) for i in range(1,32)]
    section=left+top+[(4.56-x,z) for x,z in reversed(left)]
    nx=len(section)-1;ny=22;verts=[];faces=[]
    for j in range(ny+1):
        y=2.10+j*.84/ny
        for i,(x,z) in enumerate(section):
            # Fade folds out near the bend, keeping every surface clear of the bed.
            on_top=1.59<x<2.97
            edge=min(x-1.59,2.97-x) if on_top else 0
            weight=min(1,max(0,edge/.08))
            z+=weight*(-.002+.0015*math.sin(i*.74+j*.21)+.0005*math.sin(j*.67))
            verts.append((x,y,z))
    for j in range(ny):
        for i in range(nx):
            a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
    ob=mesh('CT_chan_ru',verts,faces,m['chan'],c)
    solid=ob.modifiers.new('Day_vai','SOLIDIFY');solid.thickness=.0035;solid.offset=0
    for j in [0,ny]:
        hem=curve('CT_mep_chan',[verts[j*(nx+1)+i] for i in range(nx+1)],.0013,m['nem'],c)
        for point in hem.data.splines[0].bezier_points:
            point.handle_left_type=point.handle_right_type='VECTOR'
    # Mattress piping sits on the edge, rather than a black outline around the object.
    curve('CT_vien_nem',rounded_rect(1.585,2.975,2.055,3.945,.215,.045),.0024,m['goi'],c,True)
    return {'pillow_left':(2.,3.71,.34),'pillow_right':(2.52,3.71,.34),'mattress_top':(2.28,3.0,.25)}


def fan(m,c):
    remove(*[f'quat_long{i}' for i in range(4)],*[f'quat_canh{i}' for i in range(3)],'quat_tam')
    x,y,z=.42,3.72,1.12;metal=M.solid('CT_long_quat','#586b62',.72,.3)
    for depth in [-.015,.10]:
        B.torus('CT_vanh_long',x+depth,y,z,.20,.004,metal,rot=(0,math.pi/2,0),coll=c)
    for rim,center in [(-.015,-.065),(.10,.15)]:
        for i in range(32):
            a=i*math.tau/32
            curve('CT_nan_long',[(x+rim,y+.20*math.cos(a),z+.20*math.sin(a)),(x+(rim+center)/2,y+.14*math.cos(a),z+.14*math.sin(a)),(x+center,y+.030*math.cos(a),z+.030*math.sin(a))],.0018,metal,c)
    for i in range(12):
        a=i*math.tau/12
        curve('CT_kep_long',[(x-.015,y+.20*math.cos(a),z+.20*math.sin(a)),(x+.10,y+.20*math.cos(a),z+.20*math.sin(a))],.0018,metal,c)
    blade=M.solid('CT_canh_quat','#87a89b',.8)
    for i in range(3):
        a=i*math.tau/3;outline=[(.02,-.012),(.075,-.034),(.153,-.035),(.18,-.005),(.153,.036),(.08,.038),(.025,.017)]
        verts=[]
        for depth in [.052,.060]:
            for u,v in outline:verts.append((x+depth,y+u*math.cos(a)-v*math.sin(a),z+u*math.sin(a)+v*math.cos(a)))
        n=len(outline);faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(j,(j+1)%n,(j+1)%n+n,j+n) for j in range(n)]
        ob=mesh('CT_canh_quat',verts,faces,blade,c,False);be=ob.modifiers.new('Canh_bo_mem','BEVEL');be.width=.004;be.segments=3
    B.sphere('CT_nap_quat',x+.153,y,z,.033,m['nhua_trang'],scale=(.30,1,1),coll=c)
    B.cyl('CT_nut_quat',x,y-.07,.035,.018,.016,m['nhua_trang'],coll=c)
    return {'rotor':(x+.055,y,z),'switch':(x,y-.07,.043)}


def small_props(m,c):
    remove('to_mi','binh_nuoc','binh_co','thung','chai_nuoc')
    vessel('CT_to_mi_rong',1.35,3.25,[(0,.003),(.044,.003),(.09,.018),(.105,.10),(.099,.104),(.089,.032),(.035,.015),(0,.015)],m['nhua_trang'],c)
    for i in range(2):curve('CT_dua_go',[(1.24+i*.015,3.16,.108),(1.43+i*.015,3.34,.108)],.0025,m['go_toi'],c)
    vessel('CT_binh_20l',1.17,.20,[(0,.002),(.109,.002),(.125,.023),(.125,.34),(.108,.40),(.047,.425),(.047,.465),(.039,.465),(.04,.425),(.10,.395),(.114,.335),(.114,.03),(0,.02)],m['nhua_xanh'],c)
    for z in [.07,.12,.28,.33]:B.torus('CT_gan_binh',1.17,.20,z,.125,.003,m['nhua_xanh'],coll=c)
    B.cyl('CT_nap_binh',1.17,.20,.473,.052,.022,m['den'],coll=c,bevel=.003)
    vessel('CT_thung_rong',1.5,.75,[(0,.002),(.122,.002),(.14,.30),(.133,.305),(.115,.014),(0,.014)],m['nhua_trang'],c)
    B.torus('CT_mep_thung',1.5,.75,.302,.137,.004,m['nhua_trang'],coll=c)
    curve('CT_quai_thung',[(1.36,.75,.25),(1.40,.75,.40),(1.60,.75,.40),(1.64,.75,.25)],.004,m['khung_ghe'],c)
    for i,r in enumerate([.034,.030,.026]):
        x=[.56,.66,.76][i];B.cyl('CT_nap_gia_vi',x,.07,1.675,r+.002,.019,m['nhua_trang'],coll=c,bevel=.002)
    vessel('CT_chai_tren_ke',.90,.09,[(0,1.525),(.045,1.525),(.047,1.70),(.023,1.73),(.018,1.77),(.012,1.77),(.018,1.725),(.04,1.69),(.04,1.537),(0,1.537)],m['nhua_xanh'],c)
    B.cyl('CT_nap_chai',.90,.09,1.776,.023,.017,m['nhua_trang'],coll=c,bevel=.002)
    # A few visible folds and tape, no fine-grain clutter that disappears in a wide shot.
    tape=M.solid('CT_bang_keo','#bda17b',.86)
    B.box('CT_bang_keo_carton',.294,.318,.75,1.,.200,.202,tape,.0004,c,rot=(0,0,math.radians(14)),pivot=(.31,.875,.1))
    return {'bowl_grip':(1.35,3.25,.095),'bucket_grip':(1.5,.75,.4)}


def chair(m,c):
    remove('ghe_mat','ghe_lung',*[f'ghe_chan{i}' for i in range(4)],*[f'ghe_lung_cot{i}' for i in range(2)])
    x,y=B.SEAT['x'],B.SEAT['y'];paint=bpy.data.materials['ghe_xanh']
    B.box('CT_mat_ghe',x-.21,x+.21,y-.21,y+.21,.42,.46,paint,.022,c)
    for dx in [-.18,.18]:
        for dy in [-.18,.18]:
            curve('CT_chan_ghe',[(x+dx*1.08,y+dy*1.08,.016),(x+dx,y+dy,.22),(x+dx,y+dy,.43)],.016,m['khung_ghe'],c)
            B.sphere('CT_dem_chan_ghe',x+dx*1.08,y+dy*1.08,.012,.019,m['den'],scale=(1,1,.63),coll=c)
        curve('CT_cot_lung',[(x+dx,y+.18,.43),(x+dx,y+.285,.67),(x+dx,y+.285,.91)],.014,m['khung_ghe'],c)
        curve('CT_giang_ghe',[(x+dx,y-.185,.18),(x+dx,y+.185,.18)],.009,m['khung_ghe'],c)
    # Sitter faces -Y: the middle of the backrest bows toward +Y; posts mount behind its ends.
    verts=[];n=16
    for z in [.66,.91]:
        for depth in [0,.025]:
            for i in range(n+1):
                u=-1+2*i/n;verts.append((x+.20*u,y+.245+.035*(1-u*u)+depth,z-.012*abs(u)**6))
    stride=n+1;faces=[]
    for i in range(n):
        faces.extend([(i,i+1,2*stride+i+1,2*stride+i),(stride+i,3*stride+i,3*stride+i+1,stride+i+1),(i,stride+i,stride+i+1,i+1),(2*stride+i,2*stride+i+1,3*stride+i+1,3*stride+i)])
    faces.extend([(0,2*stride,3*stride,stride),(n,stride+n,3*stride+n,2*stride+n)])
    ob=mesh('CT_lung_ghe_cong',verts,faces,paint,c);be=ob.modifiers.new('Goc_mem','BEVEL');be.width=.009;be.segments=3
    return {'seat':(x,y,.46),'back':(x,y+.28,.79)}


def refine():
    assert abs(B.W-3)<1e-6 and abs(B.D-4)<1e-6, 'Do not silently rescale the approved room'
    parent=bpy.data.collections.new('Do_dung_chi_tiet_v1');bpy.context.scene.collection.children.link(parent)
    materials={key:bpy.data.materials.get(name) for key,name in {'tu_bep':'tu_bep','mat_bep':'mat_bep','den':'den','man_hinh':'man_hinh','inox':'inox','nhua_trang':'nhua_trang','nhua_xanh':'nhua_xanh','khung_ghe':'khung_ghe','goi':'goi','nem':'nem','chan':'chan'}.items()}
    materials['go_toi']=subtle_wood('CT_go_toi','#715c45')
    materials['bia']=[bpy.data.materials[f'bia{i}'] for i in range(5)];materials['ao']=[bpy.data.materials[f'ao{i}'] for i in range(4)]
    # Replace only the exaggerated striped wood look; retain the established base colours.
    for old,color in [('go_ban','#d9b482'),('go_ban_hong','#a07d58'),('go_tu','#c4965a'),('go_toi','#715c45')]:
        replacement=subtle_wood('CT_'+old,color)
        for ob in list(bpy.data.objects):
            if ob.type=='MESH':
                for slot in ob.material_slots:
                    if slot.material and slot.material.name==old:slot.material=replacement
    specs=[('ghe',chair,(2.48,.98,0)),('laptop',laptop,(2.79,.33,.75)),('sach',books,(2.34,.10,.77)),('den_ban',lamp,(2.66,.12,.75)),('bep',kitchen,(.54,.29,.84)),('quan_ao',clothing,(1.675,.29,1.45)),('chan_goi',cloth,(2.28,3.0,.24)),('quat',fan,(.42,3.72,0)),('sinh_hoat',small_props,(1.35,.75,0))]
    report=[]
    for name,fn,origin in specs:
        c=bpy.data.collections.new('PROP_'+name);parent.children.link(c);before=set(bpy.data.objects)
        anchors=fn(materials,c);created=set(bpy.data.objects)-before
        root=bpy.data.objects.new('PROP3D_'+name,None);c.objects.link(root);root.location=(B.mx(origin[0]),origin[1],origin[2]);root['asset_id']='HS02_PROP_'+name;root['units']='metres';root['status']='static lookdev; motion not verified'
        bpy.context.view_layer.update()
        for ob in created:
            world=ob.matrix_world.copy();ob.parent=root;ob.matrix_world=world;ob['asset_id']=root['asset_id']
        for key,point in anchors.items():
            anchor=bpy.data.objects.new('ANCHOR_'+name+'_'+key,None);c.objects.link(anchor);anchor.location=(B.mx(point[0]),point[1],point[2]);bpy.context.view_layer.update();world=anchor.matrix_world.copy();anchor.parent=root;anchor.matrix_world=world;anchor.empty_display_size=.025;anchor['role']=key
        report.append({'asset_id':root['asset_id'],'objects':len(created),'anchors':list(anchors)})
    bpy.context.view_layer.update()
    for ob in parent.all_objects:
        assert all(math.isfinite(v) for row in ob.matrix_world for v in row), ob.name
        if ob.type=='MESH':assert len(ob.data.polygons)>0,ob.name
    import bmesh
    checked=0
    for ob in parent.all_objects:
        if ob.name.startswith('ANCHOR_'):
            assert ob.parent and ob.parent.name.startswith('PROP3D_'), ob.name
        if ob.type=='MESH' and any(ob.name.startswith(prefix) for prefix in ['CT_chau_rua_rong','CT_coc_rong','CT_to_mi_rong','CT_thung_rong','CT_goi_phong','CT_lung_ghe_cong']):
            bm=bmesh.new();bm.from_mesh(ob.data)
            assert all(e.is_manifold for e in bm.edges), 'Open/overlapping mesh: '+ob.name
            bm.free();checked+=1
    assert checked==10, checked
    from mathutils.bvhtree import BVHTree
    dg=bpy.context.evaluated_depsgraph_get()
    def world_bvh(obj):
        ev=obj.evaluated_get(dg);data=ev.to_mesh()
        result=BVHTree.FromPolygons([ev.matrix_world @ v.co for v in data.vertices],[list(p.vertices) for p in data.polygons])
        ev.to_mesh_clear();return result
    blanket=world_bvh(bpy.data.objects['CT_chan_ru'])
    for name in ['nem','ga_giuong','CT_vien_nem']:
        assert not blanket.overlap(world_bvh(bpy.data.objects[name])), 'Blanket intersects '+name
    back=bpy.data.objects['CT_lung_ghe_cong'].data.vertices
    assert back[8].co.y > back[0].co.y, 'Backrest must cup the sitter facing -Y'
    feet=[o for o in bpy.data.objects if o.name.startswith('CT_chan_cao_su')]
    assert len(feet)==2
    for foot in feet:
        z=min((foot.matrix_world @ v.co).z for v in foot.data.vertices)
        assert abs(z-.75)<1e-6, 'Laptop foot is not resting on the desktop'
    return report
