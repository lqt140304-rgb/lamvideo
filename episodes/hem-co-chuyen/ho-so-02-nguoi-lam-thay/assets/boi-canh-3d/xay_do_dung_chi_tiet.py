"""Build the approved room plus refined furniture. Static Blender lookdev only."""
import argparse,json,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
import bpy
import xay_phong_tro as base
from chi_tiet_do_dung import refine
base.CAMERAS.update({
    'PROP_FAN': ((1.45,2.65,1.25),(.42,3.72,1.05),48),
    'PROP_WARDROBE': ((1.18,1.75,1.43),(1.68,.29,1.42),40),
    'PROP_CHAIR': ((1.45,2.20,.98),(2.48,.98,.48),42),
    'PROP_BED_EDGE': ((1.0,2.40,.56),(1.62,2.65,.22),48),
    'PROP_CHAIR_FRONT': ((1.83,.70,1.15),(2.48,1.13,.72),38),
    'PROP_SINK': ((.74,.96,1.40),(.40,.27,.85),48),
})

def main():
    args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else sys.argv[1:]
    p=argparse.ArgumentParser();p.add_argument('--cam',default='DESK');p.add_argument('--mode',default='day',choices=['day','night']);p.add_argument('--width',type=int,default=960);p.add_argument('--samples',type=int,default=24);p.add_argument('--out',required=True);p.add_argument('--blend');p.add_argument('--no-render',action='store_true');p.add_argument('--device',default='auto',choices=['auto','cpu']);p.add_argument('--door',type=float,default=10)
    a=p.parse_args(args);out=Path(a.out).resolve();out.parent.mkdir(parents=True,exist_ok=True)
    sc=base.build(mode=a.mode,door_open=a.door,cam=a.cam,res=(a.width,round(a.width/2.39)))
    report=refine();sc.cycles.samples=a.samples
    if a.device=='auto':
        try:
            prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices();gpu=[d for d in prefs.devices if d.type=='OPTIX']
            if gpu:
                for d in prefs.devices:d.use=d.type=='OPTIX'
                sc.cycles.device='GPU'
        except (TypeError,RuntimeError):pass
    sc.render.filepath=str(out)
    metadata={'source':'xay_do_dung_chi_tiet.py','camera':a.cam,'mode':a.mode,'resolution':[sc.render.resolution_x,sc.render.resolution_y],'samples':a.samples,'device':sc.cycles.device,'groups':report,'contact_checks':['blanket vs mattress/sheet/piping: no mesh intersection','backrest concavity faces sitter','both laptop feet rest at desktop z=0.75m'],'limits':['Static preview only','Mirror portal and cloth/prop animation not verified','Original room/characters kept; no production film rendered']}
    out.with_suffix('.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
    if a.blend:
        target=Path(a.blend).resolve();target.parent.mkdir(parents=True,exist_ok=True);bpy.ops.wm.save_as_mainfile(filepath=str(target))
    print('DETAIL_ASSETS_OK',json.dumps(metadata,ensure_ascii=True),flush=True)
    if not a.no_render:bpy.ops.render.render(write_still=True)

if __name__=='__main__':main()
