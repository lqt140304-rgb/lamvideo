"""Chạy mọi hàm test_* trong kiem_thu/test_*.py. In PASS/FAIL từng test, thoát khác 0 nếu có FAIL.
  /tmp/bpyenv/bin/python assets/nhan-vat-3d/rig_mat_nam.kiem_thu.chay.py [lọc theo tên file/test]"""
import sys, os, importlib, traceback, glob
import bpy  # phải nạp trước để có mathutils
AQ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if AQ not in sys.path: sys.path.insert(0, AQ)

def main(loc):
    d = os.path.dirname(os.path.abspath(__file__)); fail = 0; chay = 0
    for f in sorted(glob.glob(os.path.join(d, 'test_*.py'))):
        mod = os.path.splitext(os.path.basename(f))[0]
        if loc and not any(k in mod for k in loc): pass
        m = importlib.import_module('rig_mat_nam.kiem_thu.' + mod)
        for ten in sorted(n for n in dir(m) if n.startswith('test_')):
            if loc and not any(k in mod or k in ten for k in loc): continue
            chay += 1
            try: getattr(m, ten)(); print('PASS', ten, flush=True)
            except Exception as e:
                fail += 1; print('FAIL', ten + ':', repr(e)); traceback.print_exc(limit=3)
    print(f'{chay - fail}/{chay} PASS'); return 1 if fail or not chay else 0

if __name__ == '__main__':
    args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    sys.exit(main(args))
