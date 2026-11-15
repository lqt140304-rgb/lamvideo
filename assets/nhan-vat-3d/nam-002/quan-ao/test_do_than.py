"""Kiểm do_than.measure trên NAM-002. Chạy: <bpy python> test_do_than.py"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import do_than as DT


def test_torso_vua_than(sd):
    for L in sd['torso']:
        assert 0.10 <= L['w'] <= 0.22, L
        lo = 0.16 if L['z'] <= DT.J['shoulder'][2] else 0.10     # trên khớp vai là dốc vai–cổ, mỏng hơn
        assert lo <= L['f'] + L['b'] <= 0.34, L


def test_arm_ngang(sd):
    A = sd['arm']
    for R in A: assert abs(R['c'][2] - 1.25) <= 0.03, R
    assert A[0]['r'] > A[-1]['r'], (A[0], A[-1])


def test_leg(sd):
    G = sd['leg']; assert len(G) >= 30, len(G)
    goi = min(G, key=lambda L: abs(L['z'] - DT.J['knee'][2])); dui = max(G, key=lambda L: L['z'])
    assert goi['rx'] < dui['rx'], (goi, dui)


if __name__ == '__main__':
    sc, arm, body = DT.load_rig(); sd = DT.measure(body); bad = 0
    for t in (test_torso_vua_than, test_arm_ngang, test_leg):
        try: t(sd); print('PASS', t.__name__)
        except AssertionError as e: bad += 1; print('FAIL', t.__name__, str(e)[:200])
    print('KẾT QUẢ:', 'PASS' if not bad else f'FAIL {bad}'); sys.exit(1 if bad else 0)
