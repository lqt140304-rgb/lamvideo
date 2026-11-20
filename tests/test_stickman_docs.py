import os
import unittest

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

class TestStickmanDocs(unittest.TestCase):
    def test_quy_chuan_stickman_has_kieu_b_specs(self):
        doc_path = os.path.join(REPO_ROOT, "docs", "QUY-CHUAN-STICKMAN.md")
        self.assertTrue(os.path.exists(doc_path), f"File {doc_path} must exist")
        with open(doc_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        self.assertIn("Kiểu B", content)
        self.assertIn("1,60 m", content)
        self.assertIn("viên nang", content)
        self.assertIn("Nam", content)
        self.assertIn("Người Kia", content)
        self.assertIn("Tùng", content)
        self.assertIn("Giảng viên", content)
        self.assertIn("Người Truy Vết", content)

    def test_thiet_ke_nhan_vat_has_stickman_cast(self):
        doc_path = os.path.join(REPO_ROOT, "episodes", "hem-co-chuyen", "THIET-KE-NHAN-VAT.md")
        self.assertTrue(os.path.exists(doc_path), f"File {doc_path} must exist")
        with open(doc_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("Kiểu B", content)
        self.assertIn("1,60 m", content)
        self.assertIn("Nam (Bản thể thật)", content)
        self.assertIn("Người Kia", content)
        self.assertIn("Tùng", content)
        self.assertIn("Giảng viên", content)
        self.assertIn("Người Truy Vết", content)
        self.assertIn("thuận tay trái", content)

    def test_asset_status_superseded(self):
        asset_path = os.path.join(REPO_ROOT, "episodes", "hem-co-chuyen", "ho-so-02-nguoi-lam-thay", "ASSET.md")
        with open(asset_path, "r", encoding="utf-8") as f:
            asset_content = f.read()
        self.assertIn("Stickman", asset_content)
        self.assertIn("dung_stickman_cast.py", asset_content)

        nhanvat_readme = os.path.join(REPO_ROOT, "episodes", "hem-co-chuyen", "ho-so-02-nguoi-lam-thay", "assets", "nhan-vat-3d", "README.md")
        with open(nhanvat_readme, "r", encoding="utf-8") as f:
            nv_content = f.read()
        self.assertIn("Stickman", nv_content)

        loi_path = os.path.join(REPO_ROOT, "episodes", "hem-co-chuyen", "ho-so-02-nguoi-lam-thay", "LOI-TON-DONG.md")
        with open(loi_path, "r", encoding="utf-8") as f:
            loi_content = f.read()
        self.assertIn("Stickman", loi_content)

if __name__ == "__main__":

    unittest.main()
