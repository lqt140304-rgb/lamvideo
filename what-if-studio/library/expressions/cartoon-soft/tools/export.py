"""Extract editable facial features from the approved character expression assets."""
from pathlib import Path
from copy import deepcopy
import json,re
import xml.etree.ElementTree as E

NS='http://www.w3.org/2000/svg';E.register_namespace('',NS)
def tag(n):return '{'+NS+'}'+n
def el(n,**attrs):return E.Element(tag(n),{k.replace('_','-'):str(v) for k,v in attrs.items()})
def refs(nodes):
 result=set()
 for root in nodes:
  for n in root.iter():
   for value in n.attrib.values():result.update(re.findall(r'url\(#([^)]*)\)',value))
   if n.get('href','').startswith('#'):result.add(n.get('href')[1:])
 return result
def clean_write(root,path):
 xml=E.tostring(root,encoding='unicode')
 path.write_text("<?xml version='1.0' encoding='utf-8'?>\n"+'\n'.join(line.rstrip() for line in xml.splitlines())+'\n',encoding='utf-8')
def extract(source,stem):
 original=E.parse(source).getroot();olddefs=original.find(tag('defs'))
 lookup={n.get('id'):n for n in olddefs.iter() if n.get('id')}
 visible=next(n for n in original if n.tag!=tag('defs'))
 if visible.tag==tag('use'):visible=lookup[visible.get('href')[1:]]
 tilt=visible[0].get('transform','') if len(visible)==1 and visible[0].tag==tag('g') else ''
 parent=visible[0] if tilt else visible
 layers={key:el('g',id=f'{stem}-{key}',data_layer=key) for key in ['color','eyes','brows','nose','mouth','details']}
 for node in parent:
  n=deepcopy(node);d=n.get('d','');nid=n.get('id','');fill=n.get('fill','');clip=n.get('clip-path','')
  if nid.startswith('color-'):
   n.attrib.pop('clip-path',None)
   for c in list(n):
    if c.tag==tag('rect'):
     c.tag=tag('ellipse');c.attrib.pop('x',None);c.attrib.pop('y',None);c.attrib.pop('width',None);c.attrib.pop('height',None)
     c.set('cx','0');c.set('cy','55');c.set('rx','48');c.set('ry','20')
     c.set('fill','url(#emotion-anger)');c.set('opacity','.25')
   key='color'
  elif nid.startswith('cues-'):
   for c in list(n):
    if c.get('d','').startswith(('M-15 137','M-39 103','M-38 106','M-37 107','M-39 107')):n.remove(c)
   key='details'
  elif fill=='#f4ecdf' or n.tag in (tag('ellipse'),tag('circle')) or (clip and 'mouth' not in clip) or (d.startswith(('M-30 ','M18 ')) and n.get('stroke-width')=='1.8'):key='eyes'
  elif n.get('stroke-width') in ('3.1','3.3'):key='brows'
  elif d.startswith('M16 79'):key='nose'
  elif n.get('stroke-width')=='1.7' or fill in ('#673b3b','#f2e9dc','#b76e70') or 'mouth' in clip or d.startswith('M1 112'):key='mouth'
  else:continue # Neck, skin silhouette, ear and hair are deliberately excluded.
  layers[key].append(n)
 assert all(len(layers[k]) for k in ['eyes','brows','nose','mouth']),source
 root=el('svg',width=390,height=360,viewBox='-65 -50 130 120')
 defs=el('defs');root.append(defs)
 group=el('g',id=f'{stem}-features',transform='translate(-7 -71)',stroke='#272728',stroke_width='2.8',stroke_linejoin='round',stroke_linecap='round')
 for n in layers.values():group.append(n)
 root.append(group)
 pending=refs([group]);needed=set()
 while pending:
  key=pending.pop()
  if key in needed:continue
  assert key in lookup,(source,key)
  needed.add(key);pending.update(refs([lookup[key]])-needed)
 for key in sorted(needed):defs.append(deepcopy(lookup[key]))
 # Every file can be inlined beside another without colliding gradient or clip IDs.
 idmap={n.get('id'):f'{stem}--{n.get("id")}' for n in defs.iter() if n.get('id')}
 for n in root.iter():
  if n.get('id') in idmap:n.set('id',idmap[n.get('id')])
  for attr,value in list(n.attrib.items()):
   for old,new in idmap.items():value=value.replace(f'url(#{old})',f'url(#{new})')
   n.set(attr,value)
 serialized=E.tostring(root,encoding='unicode')
 assert not any(marker in serialized for marker in ['skin-volume','hair-volume','face-boundary','M-51 47','M-49 73']),source
 assert {n.get('data-layer') for n in root.iter() if n.get('data-layer')}==set(layers),source
 return root,tilt

def build(repo,dest):
 source=repo/'episodes/hem-co-chuyen/assets/nguoi-truy-vet/bieu-cam'
 dest.mkdir(parents=True,exist_ok=True);assets=dest/'svg';assets.mkdir(exist_ok=True)
 catalog=json.loads((source/'danh-muc.json').read_text(encoding='utf-8'))
 entries=[{'cam_xuc':'Trung tính','muc_do':0,'ten':'Bình thản','file':catalog['trung_tinh']}]+catalog['bieu_cam']
 roots={}
 for entry in entries:
  stem=Path(entry['file']).stem;root,tilt=extract(source/entry['file'],stem);clean_write(root,assets/entry['file']);roots[stem]=root
  entry['file']='svg/'+entry['file'];entry['goi_y_goc_dau_nguon']=tilt or 'Không nghiêng'
 metadata={'phien_ban':1,'loai':'net-mat-tach-lop-2d','nguon':'episodes/hem-co-chuyen/assets/nguoi-truy-vet/bieu-cam',
 'viewBox':[-65,-50,130,120],'moc_can_chinh':{'tam_hai_mat':[0,0],'mat_trai_tren_hinh':[-23,2],'mat_phai_tren_hinh':[23,-1],'goc_mieng_trung_tinh':[6,41]},
 'layers':['color','eyes','brows','nose','mouth','details'],'nen':'trong-suot','trang_thai':'Da tach lop va kiem tra tinh; chua tu gan vao rig hay moi nhan vat','bieu_cam':entries}
 (dest/'danh-muc.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 for page in range(3):
  root=el('svg',width=1380,height=1050,viewBox='0 0 1380 1050');defs=el('defs');root.append(defs)
  root.append(el('rect',width=1380,height=1050,fill='#f3ede2'))
  def text(s,x,y,size=18,weight='400',color='#303139'):
   n=el('text',x=x,y=y,font_family='Segoe UI,Arial,sans-serif',font_size=size,font_weight=weight,fill=color);n.text=s;root.append(n)
  text('BỘ NÉT MẶT DÙNG CHUNG — '+['QUAN SÁT','CĂNG THẲNG','GIẢI TỎA'][page],36,43,24,'700')
  for i,title in enumerate(['Mức 1 · nhẹ','Mức 2 · rõ','Mức 3 · cao trào']):text(title,50+i*450,76,16,color='#787174')
  for i,entry in enumerate(entries[1+page*9:1+(page+1)*9]):
   x=30+(i%3)*450;y=100+(i//3)*305
   root.append(el('rect',x=x,y=y,width=430,height=285,rx=18,fill='#faf6ee',stroke='#ddd4c8'))
   asset=roots[Path(entry['file']).stem];defs.extend(deepcopy(list(asset.find(tag('defs')))))
   feature=deepcopy(next(n for n in asset if n.tag==tag('g')));defs.append(feature)
   root.append(el('use',href='#'+feature.get('id'),transform=f'translate({x+212} {y+95}) scale(2.2)'))
   text(f'{entry["cam_xuc"]} · {entry["muc_do"]}',x+20,y+239,20,'600');text(entry['ten'],x+20,y+267,16,color='#787174')
  text('Chỉ có nét mặt và lớp cảm xúc · không tóc, da, tai, cổ hoặc đường bao đầu · file riêng có nền trong suốt',36,1040,14,color='#787174')
  clean_write(root,dest/f'bang-{page+1:02d}.svg')
 # Structural checks include the exported files and boards, not only the originals.
 for path in list(assets.glob('*.svg'))+list(dest.glob('bang-*.svg')):
  root=E.parse(path).getroot();ids=[n.get('id') for n in root.iter() if n.get('id')]
  assert len(ids)==len(set(ids)),path
  assert refs([root]).issubset(set(ids)),path
  assert not any(n.tag==tag('image') for n in root.iter()),path
 assert len(list(assets.glob('*.svg')))==28
 print('PASS: 28 transparent expression overlays, 6 named layers each, 3 preview boards; no head/hair/skin resources; unique IDs and valid references.')

if __name__=='__main__':
 # Installed under what-if-studio/library/expressions/cartoon-soft/tools/.
 script=Path(__file__).resolve()
 build(script.parents[5],script.parents[1])
