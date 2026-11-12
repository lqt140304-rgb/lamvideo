"""ĐẦU + TÓC NAM 3D — dựng modular (Box Modeling + Subsurf), Blender 5.x bpy (12/11/2026).

Khác bản metaball (`dung_nam.py`): mỗi bộ phận là một đối tượng riêng, topology quad sạch, để chỉnh từng phần như dựng tay.
Đối chiếu ảnh mẫu `../thiet-ke/thu-3d/mau-3d-dau.webp` (NAM — 3D TURNAROUND).

Chạy:
  python dung_dau_nam.py --render <thư mục>      # ảnh trực giao chính diện (Numpad 1) + nghiêng phải (Numpad 3)
  python dung_dau_nam.py --blend Nam_Dau.blend   # lưu file
Trong Blender: blender -b -P dung_dau_nam.py -- --render ...

Collection `Nam_Dau` →
  03_Head_And_Face: Head_Base (lưới loft liền đầu–cổ theo hình bóng khuôn; mắt, miệng, gò tai tạo thẳng trên lưới; tròng trắng là mặt nạ thủ tục trong vật liệu da),
                    Pupil.L/R, Eyeline.L/R (một viền mảnh quanh mắt), Eyebrow.L/R, Mole, Mouth_line (một nét dọc đáy rãnh miệng), Ear.L/R (Shrinkwrap gốc tai vào đầu)
  04_Hair: Hair_Cap (mũ tóc nhân bản từ nửa trên sọ, nở 1,02×, Solidify), Hair_Lobe.* (giọt nước dẹt), Hair_Wing.L/R, Hair_Tuft (Bézier + Bevel) + Hair_Tuft_Tip
Đơn vị mét, nhân vật quay mặt −Y, bên trái nhân vật là +X (.L). Tâm đầu C, cằm ~1,04 m.
"""
import sys, os, math, argparse
import bpy, bmesh
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

C = Vector((0.0, 0.0, 1.25))                       # tâm hộp sọ
HEAD = (0.200, 0.198, 0.228)                       # nửa rộng (x), nửa sâu (y), nửa cao (z): sọ tròn đều, mặt không dẹt bè
# Hộp sọ + cổ dựng thành MỘT lưới liền theo hình bóng 3 hướng của khuôn đầu trần có đường lưới (chủ repo, 12/11):
#   `../thiet-ke/thu-3d/mau-dau-luoi-profile.webp` (nghiêng) và `mau-dau-luoi-4goc.webp` (chính diện, sau lưng, 3/4).
# Mỗi hàng: [z, y_trước, y_sau, nửa_rộng] (mét, 330 mức cách ~1,5 mm) từ đỉnh sọ xuống cổ; lấy ở MÉP NGOÀI nét viền của khuôn (trùng viền đỏ khi chồng ảnh); tiết diện mỗi mức là siêu elip (SECTION_N) nên cả 3 hình bóng khớp; tai đã nội suy bỏ.
LOFT_TAB = [[1.465, -0.0214, 0.0404, 0.0], [1.4635, -0.025, 0.044, 0.032], [1.4619, -0.029, 0.0479, 0.0361], [1.4604, -0.0333, 0.0522, 0.0405], [1.4589, -0.0377, 0.0566, 0.045], [1.4573, -0.0424, 0.0612, 0.0495], [1.4558, -0.047, 0.0657, 0.054], [1.4543, -0.0516, 0.0702, 0.0585], [1.4527, -0.0562, 0.0746, 0.0627], [1.4512, -0.0605, 0.0788, 0.0668], [1.4497, -0.0647, 0.0828, 0.0706], [1.4481, -0.0687, 0.0866, 0.0743], [1.4466, -0.0724, 0.0902, 0.0778], [1.4451, -0.076, 0.0936, 0.081], [1.4435, -0.0794, 0.0969, 0.0842], [1.442, -0.0827, 0.0999, 0.0871], [1.4405, -0.0858, 0.1029, 0.0899], [1.4389, -0.0887, 0.1056, 0.0926], [1.4374, -0.0916, 0.1083, 0.0952], [1.4358, -0.0943, 0.1109, 0.0977], [1.4343, -0.0969, 0.1133, 0.1001], [1.4328, -0.0994, 0.1157, 0.1024], [1.4312, -0.1018, 0.118, 0.1046], [1.4297, -0.1042, 0.1202, 0.1067], [1.4282, -0.1065, 0.1224, 0.1088], [1.4266, -0.1087, 0.1245, 0.1108], [1.4251, -0.1109, 0.1266, 0.1128], [1.4236, -0.113, 0.1285, 0.1147], [1.422, -0.1151, 0.1305, 0.1166], [1.4205, -0.1171, 0.1324, 0.1184], [1.419, -0.119, 0.1342, 0.1202], [1.4174, -0.121, 0.136, 0.1219], [1.4159, -0.1229, 0.1378, 0.1236], [1.4144, -0.1247, 0.1395, 0.1252], [1.4128, -0.1265, 0.1412, 0.1268], [1.4113, -0.1283, 0.1428, 0.1284], [1.4098, -0.13, 0.1444, 0.1299], [1.4082, -0.1317, 0.146, 0.1314], [1.4067, -0.1333, 0.1476, 0.1328], [1.4052, -0.135, 0.1491, 0.1343], [1.4036, -0.1365, 0.1506, 0.1357], [1.4021, -0.1381, 0.152, 0.137], [1.4006, -0.1396, 0.1535, 0.1384], [1.399, -0.1411, 0.1549, 0.1397], [1.3975, -0.1426, 0.1562, 0.1409], [1.396, -0.144, 0.1576, 0.1422], [1.3944, -0.1454, 0.1589, 0.1434], [1.3929, -0.1468, 0.1602, 0.1446], [1.3914, -0.1481, 0.1615, 0.1458], [1.3898, -0.1494, 0.1627, 0.1469], [1.3883, -0.1507, 0.1639, 0.148], [1.3868, -0.152, 0.1651, 0.1491], [1.3852, -0.1533, 0.1663, 0.1502], [1.3837, -0.1545, 0.1674, 0.1513], [1.3822, -0.1557, 0.1686, 0.1523], [1.3806, -0.1569, 0.1697, 0.1533], [1.3791, -0.158, 0.1708, 0.1543], [1.3775, -0.1591, 0.1718, 0.1553], [1.376, -0.1603, 0.1729, 0.1562], [1.3745, -0.1613, 0.1739, 0.1571], [1.3729, -0.1624, 0.1749, 0.158], [1.3714, -0.1634, 0.1759, 0.1589], [1.3699, -0.1645, 0.1769, 0.1598], [1.3683, -0.1655, 0.1779, 0.1606], [1.3668, -0.1664, 0.1788, 0.1615], [1.3653, -0.1674, 0.1797, 0.1623], [1.3637, -0.1684, 0.1806, 0.1631], [1.3622, -0.1693, 0.1815, 0.1639], [1.3607, -0.1702, 0.1824, 0.1646], [1.3591, -0.1711, 0.1832, 0.1653], [1.3576, -0.172, 0.184, 0.1661], [1.3561, -0.1728, 0.1849, 0.1668], [1.3545, -0.1737, 0.1857, 0.1675], [1.353, -0.1745, 0.1864, 0.1681], [1.3515, -0.1753, 0.1872, 0.1688], [1.3499, -0.1761, 0.188, 0.1694], [1.3484, -0.1768, 0.1887, 0.17], [1.3469, -0.1776, 0.1894, 0.1706], [1.3453, -0.1783, 0.1901, 0.1712], [1.3438, -0.179, 0.1908, 0.1718], [1.3423, -0.1797, 0.1914, 0.1723], [1.3407, -0.1804, 0.1921, 0.1729], [1.3392, -0.181, 0.1927, 0.1734], [1.3377, -0.1817, 0.1934, 0.1739], [1.3361, -0.1823, 0.194, 0.1744], [1.3346, -0.1829, 0.1946, 0.1749], [1.3331, -0.1835, 0.1952, 0.1754], [1.3315, -0.1841, 0.1957, 0.1758], [1.33, -0.1847, 0.1963, 0.1763], [1.3285, -0.1852, 0.1968, 0.1767], [1.3269, -0.1858, 0.1974, 0.1771], [1.3254, -0.1863, 0.1979, 0.1775], [1.3239, -0.1869, 0.1984, 0.1779], [1.3223, -0.1874, 0.1989, 0.1782], [1.3208, -0.1879, 0.1994, 0.1786], [1.3192, -0.1884, 0.1999, 0.1789], [1.3177, -0.1888, 0.2004, 0.1792], [1.3162, -0.1893, 0.2008, 0.1795], [1.3146, -0.1898, 0.2012, 0.1798], [1.3131, -0.1902, 0.2017, 0.1801], [1.3116, -0.1906, 0.2021, 0.1803], [1.31, -0.191, 0.2025, 0.1806], [1.3085, -0.1914, 0.2028, 0.1808], [1.307, -0.1917, 0.2032, 0.1811], [1.3054, -0.1921, 0.2036, 0.1813], [1.3039, -0.1924, 0.2039, 0.1815], [1.3024, -0.1927, 0.2043, 0.1816], [1.3008, -0.1931, 0.2046, 0.1818], [1.2993, -0.1933, 0.2049, 0.182], [1.2978, -0.1936, 0.2052, 0.1821], [1.2962, -0.1939, 0.2055, 0.1822], [1.2947, -0.1941, 0.2058, 0.1823], [1.2932, -0.1943, 0.2061, 0.1824], [1.2916, -0.1946, 0.2063, 0.1825], [1.2901, -0.1948, 0.2066, 0.1826], [1.2886, -0.1949, 0.2068, 0.1827], [1.287, -0.1951, 0.207, 0.1827], [1.2855, -0.1952, 0.2072, 0.1827], [1.284, -0.1954, 0.2074, 0.1827], [1.2824, -0.1955, 0.2076, 0.1827], [1.2809, -0.1956, 0.2077, 0.1827], [1.2794, -0.1957, 0.2079, 0.1827], [1.2778, -0.1958, 0.208, 0.1827], [1.2763, -0.1958, 0.2082, 0.1826], [1.2748, -0.1959, 0.2083, 0.1825], [1.2732, -0.1959, 0.2084, 0.1825], [1.2717, -0.1959, 0.2085, 0.1824], [1.2702, -0.196, 0.2086, 0.1822], [1.2686, -0.196, 0.2086, 0.1821], [1.2671, -0.196, 0.2087, 0.182], [1.2656, -0.1959, 0.2087, 0.1819], [1.264, -0.1959, 0.2088, 0.1817], [1.2625, -0.1959, 0.2088, 0.1815], [1.2609, -0.1958, 0.2088, 0.1814], [1.2594, -0.1958, 0.2088, 0.1812], [1.2579, -0.1957, 0.2087, 0.181], [1.2563, -0.1956, 0.2087, 0.1808], [1.2548, -0.1955, 0.2086, 0.1806], [1.2533, -0.1954, 0.2086, 0.1805], [1.2517, -0.1953, 0.2085, 0.1803], [1.2502, -0.1952, 0.2084, 0.1801], [1.2487, -0.1951, 0.2083, 0.1799], [1.2471, -0.195, 0.2082, 0.1797], [1.2456, -0.1948, 0.208, 0.1795], [1.2441, -0.1947, 0.2079, 0.1793], [1.2425, -0.1945, 0.2077, 0.1791], [1.241, -0.1944, 0.2076, 0.1789], [1.2395, -0.1942, 0.2074, 0.1787], [1.2379, -0.1941, 0.2072, 0.1785], [1.2364, -0.194, 0.207, 0.1783], [1.2349, -0.1938, 0.2068, 0.1781], [1.2333, -0.1937, 0.2066, 0.1779], [1.2318, -0.1936, 0.2063, 0.1777], [1.2303, -0.1934, 0.2061, 0.1775], [1.2287, -0.1933, 0.2058, 0.1773], [1.2272, -0.1932, 0.2055, 0.1771], [1.2257, -0.1931, 0.2053, 0.1769], [1.2241, -0.1931, 0.205, 0.1767], [1.2226, -0.193, 0.2047, 0.1765], [1.2211, -0.193, 0.2043, 0.1763], [1.2195, -0.193, 0.204, 0.1761], [1.218, -0.193, 0.2037, 0.1759], [1.2165, -0.1931, 0.2033, 0.1757], [1.2149, -0.1932, 0.2029, 0.1755], [1.2134, -0.1933, 0.2026, 0.1753], [1.2119, -0.1934, 0.2022, 0.1751], [1.2103, -0.1936, 0.2018, 0.1749], [1.2088, -0.1938, 0.2014, 0.1747], [1.2073, -0.194, 0.201, 0.1745], [1.2057, -0.1943, 0.2005, 0.1743], [1.2042, -0.1946, 0.2001, 0.1741], [1.2026, -0.1949, 0.1996, 0.1739], [1.2011, -0.1953, 0.1992, 0.1737], [1.1996, -0.1957, 0.1987, 0.1735], [1.198, -0.1961, 0.1982, 0.1734], [1.1965, -0.1966, 0.1977, 0.1732], [1.195, -0.1971, 0.1972, 0.173], [1.1934, -0.1977, 0.1966, 0.1728], [1.1919, -0.1982, 0.1961, 0.1726], [1.1904, -0.1988, 0.1955, 0.1724], [1.1888, -0.1995, 0.1949, 0.1722], [1.1873, -0.2001, 0.1944, 0.172], [1.1858, -0.2008, 0.1938, 0.1718], [1.1842, -0.2014, 0.1932, 0.1716], [1.1827, -0.2021, 0.1925, 0.1714], [1.1812, -0.2028, 0.1919, 0.1712], [1.1796, -0.2036, 0.1912, 0.171], [1.1781, -0.2043, 0.1906, 0.1708], [1.1766, -0.205, 0.1899, 0.1706], [1.175, -0.2057, 0.1892, 0.1704], [1.1735, -0.2064, 0.1885, 0.1702], [1.172, -0.207, 0.1877, 0.17], [1.1704, -0.2077, 0.187, 0.1698], [1.1689, -0.2083, 0.1862, 0.1696], [1.1674, -0.209, 0.1854, 0.1694], [1.1658, -0.2096, 0.1846, 0.1692], [1.1643, -0.2101, 0.1838, 0.169], [1.1628, -0.2107, 0.183, 0.1688], [1.1612, -0.2112, 0.1821, 0.1686], [1.1597, -0.2117, 0.1813, 0.1684], [1.1582, -0.2122, 0.1804, 0.1682], [1.1566, -0.2126, 0.1794, 0.168], [1.1551, -0.2131, 0.1785, 0.1678], [1.1536, -0.2135, 0.1775, 0.1676], [1.152, -0.2139, 0.1766, 0.1674], [1.1505, -0.2142, 0.1756, 0.1672], [1.149, -0.2146, 0.1745, 0.167], [1.1474, -0.2149, 0.1735, 0.1668], [1.1459, -0.2152, 0.1724, 0.1666], [1.1443, -0.2154, 0.1714, 0.1664], [1.1428, -0.2157, 0.1703, 0.1662], [1.1413, -0.2159, 0.1691, 0.166], [1.1397, -0.2161, 0.168, 0.1658], [1.1382, -0.2163, 0.1669, 0.1656], [1.1367, -0.2165, 0.1657, 0.1654], [1.1351, -0.2166, 0.1645, 0.1652], [1.1336, -0.2168, 0.1632, 0.165], [1.1321, -0.2169, 0.162, 0.1647], [1.1305, -0.217, 0.1607, 0.1645], [1.129, -0.2171, 0.1594, 0.1642], [1.1275, -0.2171, 0.1581, 0.164], [1.1259, -0.2172, 0.1568, 0.1637], [1.1244, -0.2172, 0.1554, 0.1634], [1.1229, -0.2172, 0.154, 0.163], [1.1213, -0.2172, 0.1525, 0.1627], [1.1198, -0.2171, 0.1511, 0.1623], [1.1183, -0.2171, 0.1496, 0.1619], [1.1167, -0.217, 0.1481, 0.1615], [1.1152, -0.2169, 0.1465, 0.161], [1.1137, -0.2168, 0.1449, 0.1606], [1.1121, -0.2167, 0.1433, 0.1601], [1.1106, -0.2165, 0.1416, 0.1596], [1.1091, -0.2163, 0.1399, 0.159], [1.1075, -0.2161, 0.1381, 0.1585], [1.106, -0.2159, 0.1364, 0.1579], [1.1045, -0.2157, 0.1345, 0.1573], [1.1029, -0.2154, 0.1327, 0.1566], [1.1014, -0.2151, 0.1308, 0.156], [1.0999, -0.2148, 0.1289, 0.1553], [1.0983, -0.2145, 0.1269, 0.1545], [1.0968, -0.2141, 0.1248, 0.1537], [1.0953, -0.2137, 0.1227, 0.1529], [1.0937, -0.2133, 0.1206, 0.1521], [1.0922, -0.2129, 0.1184, 0.1512], [1.0907, -0.2124, 0.1162, 0.1503], [1.0891, -0.2119, 0.1139, 0.1494], [1.0876, -0.2114, 0.1116, 0.1484], [1.086, -0.2108, 0.1093, 0.1474], [1.0845, -0.2103, 0.1069, 0.1464], [1.083, -0.2097, 0.1045, 0.1453], [1.0814, -0.209, 0.1021, 0.1441], [1.0799, -0.2084, 0.0996, 0.1429], [1.0784, -0.2077, 0.0972, 0.1417], [1.0768, -0.2069, 0.0947, 0.1404], [1.0753, -0.2062, 0.0923, 0.1391], [1.0738, -0.2054, 0.09, 0.1377], [1.0722, -0.2045, 0.0877, 0.1363], [1.0707, -0.2036, 0.0856, 0.1348], [1.0692, -0.2027, 0.0836, 0.1333], [1.0676, -0.2016, 0.0818, 0.1317], [1.0661, -0.2006, 0.0802, 0.13], [1.0646, -0.1994, 0.0788, 0.1283], [1.063, -0.1982, 0.0776, 0.1265], [1.0615, -0.197, 0.0765, 0.1246], [1.06, -0.1957, 0.0756, 0.1226], [1.0584, -0.1943, 0.0747, 0.1206], [1.0569, -0.1928, 0.074, 0.1185], [1.0554, -0.1913, 0.0733, 0.1162], [1.0538, -0.1896, 0.0727, 0.1139], [1.0523, -0.1879, 0.0722, 0.1114], [1.0508, -0.186, 0.0717, 0.1089], [1.0492, -0.184, 0.0713, 0.1062], [1.0477, -0.1819, 0.0709, 0.1035], [1.0462, -0.1796, 0.0705, 0.1007], [1.0446, -0.1771, 0.0702, 0.0982], [1.0431, -0.1743, 0.07, 0.096], [1.0416, -0.1713, 0.0697, 0.0942], [1.04, -0.1676, 0.0696, 0.0929], [1.0385, -0.1631, 0.0694, 0.092], [1.037, -0.1571, 0.0692, 0.0913], [1.0354, -0.149, 0.0691, 0.0907], [1.0339, -0.1385, 0.0691, 0.0903], [1.0324, -0.1265, 0.069, 0.0899], [1.0308, -0.1144, 0.069, 0.0896], [1.0293, -0.1041, 0.069, 0.0893], [1.0277, -0.0967, 0.069, 0.089], [1.0262, -0.0922, 0.069, 0.0888], [1.0247, -0.0898, 0.069, 0.0886], [1.0231, -0.0886, 0.069, 0.0884], [1.0216, -0.088, 0.0691, 0.0883], [1.0201, -0.0876, 0.0692, 0.0882], [1.0185, -0.0873, 0.0693, 0.0882], [1.017, -0.0871, 0.0695, 0.0882], [1.0155, -0.0868, 0.0697, 0.0882], [1.0139, -0.0866, 0.0699, 0.0882], [1.0124, -0.0865, 0.0701, 0.0883], [1.0109, -0.0864, 0.0703, 0.0884], [1.0093, -0.0863, 0.0705, 0.0885], [1.0078, -0.0862, 0.0708, 0.0886], [1.0063, -0.0861, 0.0711, 0.0887], [1.0047, -0.0861, 0.0713, 0.0889], [1.0032, -0.0861, 0.0717, 0.0891], [1.0017, -0.0861, 0.072, 0.0894], [1.0001, -0.0862, 0.0724, 0.0896], [0.9986, -0.0863, 0.0728, 0.0899], [0.9971, -0.0864, 0.0732, 0.0902], [0.9955, -0.0866, 0.0736, 0.0906], [0.994, -0.0868, 0.0741, 0.091], [0.9925, -0.087, 0.0745, 0.0913], [0.9909, -0.0873, 0.075, 0.0917], [0.9894, -0.0875, 0.0755, 0.0922], [0.9879, -0.0878, 0.0759, 0.0926], [0.9863, -0.0881, 0.0764, 0.0931], [0.9848, -0.0887, 0.0771, 0.0935], [0.9833, -0.0893, 0.0776, 0.0939], [0.9817, -0.0899, 0.0779, 0.0942], [0.9802, -0.0903, 0.0779, 0.0942], [0.9787, -0.0906, 0.0774, 0.0939], [0.9771, -0.0905, 0.0765, 0.0933], [0.9756, -0.0901, 0.0751, 0.0923], [0.9741, -0.0894, 0.0733, 0.0909], [0.9725, -0.0881, 0.0707, 0.0891], [0.971, -0.086, 0.067, 0.0868], [0.9694, -0.0832, 0.0628, 0.0842], [0.9679, -0.0795, 0.0581, 0.0811], [0.9664, -0.0747, 0.0523, 0.0774], [0.9648, -0.069, 0.0457, 0.0731], [0.9633, -0.0614, 0.0376, 0.0683], [0.9618, -0.0517, 0.0274, 0.0631], [0.9602, -0.0435, 0.0186, 0.0588]]
SECTION_N = 2.2
SECTION_MODE = 'A_trung'                                # tiết diện ngang mỗi mức: 'goc' (elip đối xứng), 'A_trung' (rộng nhất lùi ra sau, mặt trước thon tròn), 'B_ma' (rộng nhất đẩy ra trước ở má–môi, má đầy)
def section_params(z, mode):
    """(m, n_trước, n_sau): m = vị trí chỗ rộng nhất tính từ y_trước (0 = trước, 1 = sau; 0,5 = giữa); n = độ vuông của nửa tiết diện (2 = elip)."""
    t = smooth01(1.00, 1.06, z) * (1 - smooth01(1.22, 1.30, z))     # vùng hàm–má–thái dương
    if mode == 'A_trung': return 0.5 + 0.10 * t, 2.0, 2.4
    if mode == 'B_ma': return 0.5 - 0.08 * t, 2.0, 2.2
    return 0.5, SECTION_N, SECTION_N
EAR_Z, EAR_Y = 1.199, 0.016                          # tâm tai (ảnh nghiêng): tai to ~0,128 × 0,133 m, ngay dưới đường giữa đầu
# Vị trí các chi tiết mặt theo bảng 'NAM — FACIAL PLACEMENT' (đỉnh sọ 1,465 → cằm 1,032; bảng 'BLENDER MODELING DETAIL SHEET' cho hình khối):
FACE = dict(brow_z=1.301, eye_z=1.227, nose_base_z=1.157, nose_z=1.177, mouth_z=1.099, chin_z=1.032, mole_z=1.317,
            eye_x=0.0746, mole_x=0.148, brow_x=(0.022, 0.083, 0.140))
MOLE_SIDE = -1   # nốt ruồi theo ảnh mẫu: đuôi mày PHẢI nhân vật (−X, bên TRÁI ảnh chính diện). Đổi thành +1 nếu muốn đuôi mày trái.

COL = {'da': '#d57d4a', 'toc': '#121110', 'trang': '#f3efe7', 'muc': '#1c1a19', 'khoang_mieng': '#4a1c1a', 'luoi': '#c2675f', 'rang': '#f4efe6'}


def hexc(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c) + (1.0,)


def mat(name, col, rough, sss=0.0, spec=None, sss_radius=(0.9, 0.35, 0.2)):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = hexc(col); b.inputs['Roughness'].default_value = rough
    if spec is not None: b.inputs['Specular IOR Level'].default_value = spec
    if sss:
        b.inputs['Subsurface Weight'].default_value = sss; b.inputs['Subsurface Radius'].default_value = sss_radius; b.inputs['Subsurface Scale'].default_value = 0.01   # Blender 5: màu tán xạ = Base Color (không còn Subsurface Color)
    return m


def make_mats():
    return {'da': mat('Da', COL['da'], 0.65, 0.08, sss_radius=(0.1, 0.05, 0.03)), 'toc': mat('Toc', COL['toc'], 0.90, spec=0.15), 'trang': mat('Mat_Trang', COL['trang'], 0.3),
            'muc': mat('Muc', COL['muc'], 0.5), 'khoang': mat('Khoang_Mieng', COL['khoang_mieng'], 0.8), 'luoi': mat('Luoi', COL['luoi'], 0.55),
            'rang': mat('Rang', COL['rang'], 0.3)}


def new_obj(name, bm_or_me, coll, m=None, smooth=True):
    if isinstance(bm_or_me, bmesh.types.BMesh):
        me = bpy.data.meshes.new(name); bm_or_me.to_mesh(me); bm_or_me.free()
    else:
        me = bm_or_me
    if smooth: me.shade_smooth()
    if m:
        for x in (m if isinstance(m, (list, tuple)) else [m]): me.materials.append(x)
    ob = bpy.data.objects.new(name, me); coll.objects.link(ob); return ob


def subsurf(ob, v=1, r=2):
    s = ob.modifiers.new('Subdivision', 'SUBSURF'); s.levels = v; s.render_levels = r; return s


def smooth01(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a))); return t * t * (3 - 2 * t)


# ------------------------------------------------------------------ Head_Base: hộp bo tròn
def half_width_at(z):
    """Nửa rộng sọ tại độ cao z (nội suy bảng loft)."""
    t = LOFT_TAB
    if z >= t[0][0]: return t[0][3]
    for i in range(len(t) - 1):
        if t[i][0] >= z >= t[i + 1][0]:
            u = (t[i][0] - z) / (t[i][0] - t[i + 1][0]); return t[i][3] + (t[i + 1][3] - t[i][3]) * u
    return t[-1][3]


def head_loft(M=144, mode=None):
    """Một lưới liền (đỉnh sọ → cằm → cổ): từ trên xuống, mỗi mức là một tiết diện với y_trước/y_sau lấy từ ảnh nghiêng, nửa rộng từ ảnh chính diện/sau.
    Không Boolean/Remesh nào nên không có chỗ lồi ở nối đầu–cổ; chỗ lõm hàm–cổ là đường cong liên tục của khuôn. `mode` đổi hình tiết diện ngang
    (không đổi hình bóng 3 hướng của khuôn)."""
    mode = mode or SECTION_MODE
    bm = bmesh.new(); t = LOFT_TAB
    apex = bm.verts.new(Vector((0.0, (t[0][1] + t[0][2]) / 2, t[0][0])))
    rings = []
    for z, yf, yb, w in t[1:]:
        m, nf, nb = section_params(z, mode); ym = yf + m * (yb - yf); af, ab = ym - yf, yb - ym; ring = []
        for j in range(M):
            th = 2 * math.pi * j / M; c, s_ = math.cos(th), math.sin(th)       # θ = 0: trước (−Y)
            n = nf if c >= 0 else nb; e = 2.0 / n
            y = ym - af * abs(c) ** e if c >= 0 else ym + ab * abs(c) ** e
            ring.append(bm.verts.new(Vector((w * math.copysign(abs(s_) ** e, s_), y, z))))
        rings.append(ring)
    for j in range(M): bm.faces.new((apex, rings[0][(j + 1) % M], rings[0][j]))
    for r0, r1 in zip(rings, rings[1:]):
        for j in range(M): bm.faces.new((r0[j], r0[(j + 1) % M], r1[(j + 1) % M], r1[j]))
    z0, yf0, yb0, _ = t[-1]; base = bm.verts.new(Vector((0.0, (yf0 + yb0) / 2, z0)))   # đáy phẳng đúng mức vòng cuối (không nhô mũi)
    for j in range(M): bm.faces.new((base, rings[-1][j], rings[-1][(j + 1) % M]))
    shape_face(bm)
    nose_bump(bm)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return bm


EYE_R = (0.052, 0.052)                           # nửa rộng, nửa cao vùng mắt (vòng mắt ~10,4 cm)
EYE_BUMP, LID_THICK, WHITE_R2, LID_FRAC = 0.0075, 0.0025, 0.84, 0.37   # gò da quanh mắt cao 7,5 mm; mí dày thêm 2,5 mm; tròng trắng r² < 0,8; mí sụp che 37% chiều cao
W_LID0 = EYE_R[1] * (1 - 2 * LID_FRAC)              # độ cao đường mí so với tâm mắt (trên tâm một chút)
EYE_FRAMES = {}                                     # s → (điểm mặt p0, hướng ra f, trục X, trục Z): điền bởi shape_face, dùng ở build_face
MOUTH_FRAME = {}


def lid_line(u): return W_LID0 + 0.004 * (u / EYE_R[0]) ** 2


def shape_face(bm):
    """Tạo mắt, miệng, tai NGAY TRÊN lưới Head_Base (không còn vật rời đặt lên mặt):
      • MẮT: da quanh mắt nhô thành gò thoải cao 7,5 mm theo đúng độ cong của mặt; phần da phía trên đường mí dày thêm 2,5 mm (mí). Tròng trắng là vùng da dưới đường mí (gán vật liệu ở build_face).
      • MIỆNG: rãnh lõm theo độ cong mặt — lõi hẹp sâu 2,6 mm + vai rộng sâu 1,3 mm nên da xung quanh lõm dần vào một nét duy nhất; hai đầu rãnh tắt dần.
      • TAI: gốc tai có gò da thoải để chân tai liền vào đầu."""
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:]); bm.normal_update()   # pháp tuyến mặt cần có trước khi dò BVH
    bvh = BVHTree.FromBMesh(bm); Rx, Rz = EYE_R
    for s_ in (1, -1):
        hit = bvh.ray_cast(Vector((s_ * FACE['eye_x'], -1.5, FACE['eye_z'])), Vector((0, 1, 0)))
        p0, f = hit[0], hit[1].normalized()
        if f.y > 0: f = -f
        f = (f * 0.85 + Vector((0, -1, 0)) * 0.15).normalized()
        Z = (Vector((0, 0, 1)) - f * f.z).normalized(); X = (-f).cross(Z); EYE_FRAMES[s_] = (p0, f, X, Z)
    hit = bvh.ray_cast(Vector((0, -1.5, FACE['mouth_z'])), Vector((0, 1, 0))); fm = hit[1].normalized()
    if fm.y > 0: fm = -fm
    MOUTH_FRAME['p'], MOUTH_FRAME['f'] = hit[0], fm
    for v in bm.verts:
        if v.co.y < 0.03:
            for s_ in (1, -1):
                p0, f, X, Z = EYE_FRAMES[s_]; d = v.co - p0; u, w, h = d.dot(X), d.dot(Z), d.dot(f)
                if h < -0.05: continue
                r2 = (u / Rx) ** 2 + (w / Rz) ** 2
                if r2 >= 1.0: continue
                cover = smooth01(lid_line(u) - 0.0016, lid_line(u) + 0.0016, w)
                dz = EYE_BUMP * (1 - r2) ** 0.8 + LID_THICK * cover * (1 - smooth01(0.5, 0.95, r2))
                v.co += f * dz
            if abs(v.co.x) < 0.05:   # rãnh miệng
                zl = FACE['mouth_z'] - 0.003 * (v.co.x / 0.030) ** 2; dist = v.co.z - zl
                if abs(dist) < 0.02:
                    lf = 1 - smooth01(0.022, 0.032, abs(v.co.x))
                    depth = lf * (0.0026 * math.exp(-(dist / 0.0016) ** 2) + 0.0013 * math.exp(-(dist / 0.0065) ** 2))
                    v.co -= fm * depth
        if abs(v.co.x) > 0.08:   # gò da gốc tai
            sg = 1.0 if v.co.x > 0 else -1.0
            m = 0.014 * math.exp(-(((v.co.y - EAR_Y) / 0.070) ** 2 + ((v.co.z - EAR_Z) / 0.072) ** 2))
            v.co.x += sg * m


def nose_bump(bm):
    """Mũi bầu tròn liền với mặt (bảng chi tiết: mũi nhô khỏi mặt ~3,4 cm, sống mũi thoải lên giữa hai mắt, chân mũi vào gấp): dời đỉnh phía trước theo −Y
    bằng một chỗ nhô Gauss bất đối xứng — phía trên (sống mũi) thoải hơn phía dưới (chân mũi)."""
    zn, A, sx = FACE['nose_z'], 0.034, 0.0215
    for v in bm.verts:
        if v.co.y > 0 or abs(v.co.x) > 0.07: continue
        dz = v.co.z - zn; sz = 0.034 if dz > 0 else 0.0185
        d = A * math.exp(-((v.co.x / sx) ** 2 + (dz / sz) ** 2))
        if d > 1e-5: v.co.y -= d


def build_head(coll, M):
    bm = head_loft(); cage_copy = bm.copy()
    ob = new_obj('Head_Base', bm, coll, M['da'])
    return ob, cage_copy   # không Subsurf: lưới đã dày (330 mức × 96 điểm) nên giữ nguyên góc dưới cằm/hàm–cổ đúng viền


class Surf:
    """Dò mặt da đầu đã Mirror + Subsurf (tia bắn từ ngoài vào tâm)."""
    def __init__(self, ob):
        self.bvh = BVHTree.FromObject(ob, bpy.context.evaluated_depsgraph_get())

    def at(self, az, el, off=0.0):
        a, e = math.radians(az), math.radians(el)
        d = Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))
        hit = self.bvh.ray_cast(C + d * 1.5, -d)
        n = hit[1].normalized() if hit[1].dot(d) > 0 else -hit[1].normalized()
        return hit[0] + n * off, n

    def front(self, x, z, off=0.0):
        hit = self.bvh.ray_cast(Vector((x, -1.5, z)), Vector((0, 1, 0)))
        n = hit[1].normalized(); n = n if n.y < 0 else -n
        return hit[0] + n * off, n


def frame(n, blend_front=0.5):
    """Hệ trục cục bộ: −Y cục bộ = hướng nhìn ra (pha giữa pháp tuyến và −Y thế giới), Z = lên."""
    f = (n * (1 - blend_front) + Vector((0, -1, 0)) * blend_front).normalized(); Y = -f
    Z = (Vector((0, 0, 1)) - Y * Y.z).normalized(); X = Y.cross(Z)
    return Matrix((X, Y, Z)).transposed()


def place(ob, loc, R3, scale=(1, 1, 1)):
    ob.matrix_world = Matrix.Translation(loc) @ R3.to_4x4() @ Matrix.Diagonal((*scale, 1.0))


def uv_sphere(name, coll, m, seg=(40, 24)):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg[0], v_segments=seg[1], radius=1.0)
    return new_obj(name, bm, coll, m)


# ------------------------------------------------------------------ dải quét (mày, lọn tóc giọt nước)
def sweep(name, coll, pts, wfun, tfun, nref, m, nseg=36, nring=20):
    """Quét tiết diện elip dọc đường Catmull–Rom qua `pts`; bề rộng w(t), bề dày t(t) theo pháp tuyến nref(c) (mảng dẹt ôm mặt)."""
    P = [Vector(p) for p in pts]; curve = []
    for k in range(nseg + 1):
        t = k / nseg * (len(P) - 1); i = min(int(t), len(P) - 2); f = t - i
        p0, p1, p2, p3 = P[max(i - 1, 0)], P[i], P[i + 1], P[min(i + 2, len(P) - 1)]
        curve.append(0.5 * ((2 * p1) + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f ** 3))
    bm = bmesh.new(); rings = []
    for k, c in enumerate(curve):
        T = (curve[min(k + 1, nseg)] - curve[max(k - 1, 0)]).normalized(); N = nref(c); N = (N - T * N.dot(T)).normalized(); B = T.cross(N)
        u = k / nseg; W, Th = wfun(u), tfun(u)
        rings.append([bm.verts.new(c + B * math.cos(2 * math.pi * j / nring) * W + N * math.sin(2 * math.pi * j / nring) * Th) for j in range(nring)])
    for a, b in zip(rings, rings[1:]):
        for j in range(nring): bm.faces.new((a[j], a[(j + 1) % nring], b[(j + 1) % nring], b[j]))
    for ring, rev in ((rings[0], True), (rings[-1], False)):
        cv = bm.verts.new(sum((v.co for v in ring), Vector()) / nring)
        for j in range(nring):
            q = (cv, ring[(j + 1) % nring], ring[j]) if rev else (cv, ring[j], ring[(j + 1) % nring]); bm.faces.new(q)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return new_obj(name, bm, coll, m)


def drop_w(wmax, tip=0.18, root=0.55):
    """Giọt nước: gốc vừa, thân đầy, ngọn bo tròn (không nhọn hoắt)."""
    return lambda u: wmax * (root + (1 - root) * math.sin(math.pi * min(1.0, u * 1.25)) ** 0.6 if u < 0.4 else 1.0) * (1 if u < 0.62 else max(tip, math.sqrt(max(0.0, 1 - ((u - 0.62) / 0.38) ** 2))))


# ------------------------------------------------------------------ mặt
def eye_white_mask(m, white):
    """Thêm vào vật liệu da một mặt nạ theo toạ độ vật thể: trong elip mắt (hệ trục EYE_FRAMES), dưới đường mí, phía trước đầu → màu trắng."""
    nt = m.node_tree; N, L = nt.nodes, nt.links; bsdf = N['Principled BSDF']
    skin = bsdf.inputs['Base Color'].default_value[:]
    def node(t, **kw):
        n = N.new(t)
        for k_, v_ in kw.items(): setattr(n, k_, v_)
        return n
    def out(n):
        if n.bl_idname == 'ShaderNodeTexCoord': return n.outputs['Object']
        if n.bl_idname == 'ShaderNodeVectorMath' and n.operation == 'DOT_PRODUCT': return n.outputs['Value']
        return n.outputs[0]
    def math(op, a_, b_=None, clamp=False):
        n = node('ShaderNodeMath', operation=op, use_clamp=clamp)
        for i, v_ in enumerate((a_, b_)):
            if v_ is None: continue
            if isinstance(v_, (int, float)): n.inputs[i].default_value = v_
            else: L.new(out(v_), n.inputs[i])
        return n
    def vec(op, a_, b_):
        n = node('ShaderNodeVectorMath', operation=op)
        L.new(out(a_), n.inputs[0])
        if isinstance(b_, Vector): n.inputs[1].default_value = b_[:]
        else: L.new(out(b_), n.inputs[1])
        return n
    tc = node('ShaderNodeTexCoord'); total = None; Rx, Rz = EYE_R
    for s_ in (1, -1):
        p0, f, X, Z = EYE_FRAMES[s_]; d = vec('SUBTRACT', tc, p0)
        u = vec('DOT_PRODUCT', d, X); w = vec('DOT_PRODUCT', d, Z)
        r2 = math('ADD', math('POWER', math('MULTIPLY', u, 1 / Rx), 2), math('POWER', math('MULTIPLY', w, 1 / Rz), 2))
        in_r = math('MULTIPLY', math('SUBTRACT', WHITE_R2, r2), 40, True)                      # trong elip (mép mịn)
        lid = math('ADD', W_LID0 - 0.0006, math('MULTIPLY', math('POWER', math('MULTIPLY', u, 1 / Rx), 2), 0.004))
        below = math('MULTIPLY', math('SUBTRACT', lid, w), 1500, True)                         # dưới đường mí
        sep = node('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sep.inputs[0])
        fr = node('ShaderNodeMath', operation='LESS_THAN'); L.new(sep.outputs['Y'], fr.inputs[0]); fr.inputs[1].default_value = 0.0
        e = math('MULTIPLY', math('MULTIPLY', in_r, below), fr)
        total = e if total is None else math('ADD', total, e, True)
    mix = node('ShaderNodeMix', data_type='RGBA'); mix.inputs[6].default_value = skin; mix.inputs[7].default_value = white
    L.new(total.outputs[0], mix.inputs[0]); L.new(mix.outputs[2], bsdf.inputs['Base Color'])


def build_face(coll, M, head):
    S = Surf(head); parts = {}
    Rx, Rz = EYE_R; rw = math.sqrt(WHITE_R2) * Rx + 0.0036   # viền nằm ngoài mép tròng trắng ~3 mm để che răng cưa của các mặt
    def skin_hit(q, f):
        hit = S.bvh.ray_cast(q + f * 0.06, -f)
        return (hit[0], hit[1].normalized()) if hit[0] else (q, f)
    # tròng trắng = vùng da dưới đường mí trong vòng mắt: tô bằng mặt nạ thủ tục trong vật liệu da (mép mịn, không răng cưa theo lưới)
    eye_white_mask(M['da'], M['trang'].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value[:])
    for s, k in ((1, 'L'), (-1, 'R')):
        p0, f, X, Z = EYE_FRAMES[s]
        # con ngươi: đĩa mỏng nằm trên mặt da, ngay dưới đường mí, hơi lệch về phía mũi
        q, n = skin_hit(p0 + X * (-s * 0.004) + Z * (W_LID0 - 0.0165), f)
        pu = uv_sphere(f'Pupil.{k}', coll, M['muc'], (24, 14)); place(pu, q + n * 0.0003, frame(n, 0.0), (0.0150, 0.0016, 0.0160))
        # viền mắt: một vòng đen mảnh bao quanh tròng trắng, cạnh trên là nét đậm mép mí
        pa = math.acos(lid_line(rw * math.sin(1.2)) / rw)
        path = [p0 + X * (rw * math.sin(a)) + Z * (rw * math.cos(a)) for a in [pa + (2 * math.pi - 2 * pa) * i / 36 for i in range(37)]]
        path += [p0 + X * u + Z * lid_line(u) for u in [-rw * math.sin(pa) + 2 * rw * math.sin(pa) * i / 12 for i in range(13)]]
        path.append(path[0])
        ring = [skin_hit(q_, f)[0] + f * 0.0004 for q_ in path]
        sweep(f'Eyeline.{k}', coll, ring, lambda u: 0.0026, lambda u: 0.0022, lambda c: f, M["muc"], 100, 10)
        # mày: giọt nước dẹt cong ôm trán, dày, đầu trong to, hai đầu bo tròn
        pts = [S.front(s * x, z, 0.004)[0] for x, z in zip(FACE['brow_x'], (FACE['brow_z'] - 0.004, FACE['brow_z'] + 0.005, FACE['brow_z'] - 0.006))]
        sweep(f'Eyebrow.{k}', coll, pts, lambda u: 0.0145 * (1 - 0.35 * u) * math.sin(math.pi * (0.03 + 0.94 * u)) ** 0.35,
              lambda u: 0.0080 * (1 - 0.3 * u) * math.sin(math.pi * (0.03 + 0.94 * u)) ** 0.35, lambda c: (c - C).normalized(), M['toc'], 32, 16)
    # nốt ruồi
    p, n = S.front(MOLE_SIDE * FACE['mole_x'], FACE['mole_z'], 0.001); mo = uv_sphere('Mole', coll, M['muc'], (16, 10)); place(mo, p, frame(n, 0), (0.0068, 0.0028, 0.0068))
    # mũi: khối bầu tròn nhỏ nhô nhẹ
    # mũi: đã nằm trong Head_Base (nose_bump)
    # miệng mím: rãnh đã nằm trong Head_Base (shape_face); thêm MỘT nét tối mảnh dọc đáy rãnh, cong theo mặt
    fm = MOUTH_FRAME['f']; pts = []
    for x in [-0.032 + 0.064 * i / 20 for i in range(21)]:
        zl = FACE['mouth_z'] - 0.003 * (x / 0.030) ** 2; hit = S.bvh.ray_cast(Vector((x, -1.5, zl)), Vector((0, 1, 0)))
        pts.append((hit[0] if hit[0] else Vector((x, MOUTH_FRAME['p'].y, zl))) + fm * 0.0002)
    sweep('Mouth_line', coll, pts, lambda u: 0.0020 * math.sin(math.pi * (0.03 + 0.94 * u)) ** 0.35, lambda u: 0.0016, lambda c: fm, M['khoang'], 40, 8)
    # tai to theo bảng chi tiết: vành cuốn (helix) nổi quanh mép, hốc tai (concha) lõm, gờ trong (antihelix) và gờ nhỏ trước tai (tragus)
    for s, k in ((1, 'L'), (-1, 'R')):
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=36, radius=1.0)
        for v in bm.verts:
            if v.co.x <= 0: continue
            rho = math.hypot(v.co.y, v.co.z)                       # 0 ở tâm mặt ngoài, 1 ở mép
            dish = 1.05 * max(0.0, 1 - (rho / 0.62) ** 2)           # hốc lõm
            helix = 0.20 * math.exp(-((rho - 0.78) / 0.10) ** 2)    # vành cuốn nổi quanh mép
            anti = 0.45 * math.exp(-(((v.co.y + 0.05) / 0.26) ** 2 + ((v.co.z - 0.12) / 0.34) ** 2))   # gờ trong
            trag = 0.18 * math.exp(-(((v.co.y - 0.34) / 0.12) ** 2 + ((v.co.z + 0.10) / 0.14) ** 2))   # gờ nhỏ phía trước tai (y > 0 là phía sau trong hệ tai; tai quay mặt về trước)
            v.co.x = v.co.x * (1 - dish) + helix + anti * (1 - dish * 0.0) + trag
        ear = new_obj(f'Ear.{k}', bm, coll, M['da'])
        vg = ear.vertex_groups.new(name='goc')
        for v_ in ear.data.vertices: vg.add([v_.index], smooth01(0.45, -0.05, v_.co.x), 'REPLACE')   # trọng số = 1 ở gốc (mặt trong), 0 ở vành
        R3 = Matrix.Rotation(s * math.radians(-22), 3, 'Z') @ Matrix(((s, 0, 0), (0, 1, 0), (0, 0, 1))) @ Matrix.Rotation(math.radians(6), 3, 'Y')
        place(ear, Vector((s * (half_width_at(EAR_Z) + 0.020), EAR_Y, EAR_Z)), R3, (0.032, 0.064, 0.066))
        sw = ear.modifiers.new('Dan_vao_dau', 'SHRINKWRAP'); sw.target = head; sw.vertex_group = 'goc'; sw.wrap_method = 'NEAREST_SURFACEPOINT'; sw.offset = -0.002   # gốc tai dán sát mặt đầu
        subsurf(ear, 1, 2)
    return S


# ------------------------------------------------------------------ tóc
HAIRLINE = [(0, 34), (36, 33), (56, 22), (68, 4), (74, -4), (80, 6), (90, 13), (108, 13), (118, 4), (128, -10), (142, -26), (158, -36), (180, -38)]   # (phương vị°, độ cao chân tóc°): trán · thái dương · sát tai trước · vòng trên tai · sau tai · gáy


def hairline_el(az):
    """Chân tóc theo phương vị (0 = trước, đối xứng hai bên): trán cao → mai tóc đi xuống trước tai (thái dương) → vòng trên vành tai → ôm sau tai → xuống phủ gáy."""
    a = min(abs(az), 180.0)
    for (a0, e0), (a1, e1) in zip(HAIRLINE, HAIRLINE[1:]):
        if a <= a1:
            t = smooth01(a0, a1, a); return e0 + (e1 - e0) * t
    return HAIRLINE[-1][1]


def hair_base(coll, M, S, N=288, K=44):
    """H00 – khối nền: lưới phủ từ chân tóc tới đỉnh, dựng theo (phương vị, độ cao) chiếu lên da đầu nên mép tóc cắt đúng đường chân tóc (không bậc thang), ôm gáy và vòng qua tai tạo mai tóc."""
    bm = bmesh.new(); rows = []
    for i in range(N):
        az = -180 + 360 * i / N; e0 = hairline_el(az); col = []
        for j in range(K + 1):
            el = e0 + (90.0 - e0) * (j / K) ** 0.9
            p, n = S.at(az, el, 0.004); d = p - C
            up = max(0.0, d.z / HEAD[2]); fr = max(0.0, -d.y / HEAD[1]); nape = max(0.0, d.y / HEAD[1]) * (1 - smooth01(0.0, 0.22, d.z + 0.05))   # d.z>0 trên đỉnh
            sc = Vector((1.02 + 0.06 * up, 1.02 + 0.03 * up + 0.02 * fr * up, 1.02 + 0.10 * up))
            q = C + Vector((d.x * sc.x, d.y * sc.y, d.z * sc.z))
            q += (p - C).normalized() * (0.010 * nape)               # khối gáy dày hơn, bo tròn
            col.append(bm.verts.new(q))
        rows.append(col)
    for i in range(N):
        a, b = rows[i], rows[(i + 1) % N]
        for j in range(K): bm.faces.new((a[j], b[j], b[j + 1], a[j + 1]))
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-5); bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    cap = new_obj('Hair_H00_KhoiNen', bm, coll, M['toc'])
    so = cap.modifiers.new('Solidify', 'SOLIDIFY'); so.thickness = 0.024; so.offset = 1.0; so.use_rim = True
    subsurf(cap, 2, 2)
    return cap


def build_hair(coll, M, cage, S):
    cage.free()
    hair_base(coll, M, S)
    nref = lambda c: (c - C).normalized()
    def lobe(name, path, W, off=None):
        off = off or ((0.010, 0.024, 0.020, 0.012) if len(path) == 4 else (0.012, 0.042, 0.030))   # bám sát độ cong trán, không dựng như răng lược
        pts = [S.at(az, el, o)[0] for (az, el), o in zip(path, off)]
        return sweep(name, coll, pts, drop_w(W), lambda u, W=W: drop_w(W)(u) * 0.5, nref, M['toc'], 40, 24)
    # mái: lọn giọt nước dẹt, gốc chìm vào mũ tóc, thân đầy, ngọn bo tròn, uốn chéo sang phải màn hình (+X)
    lobe('Hair_Lobe.1', [(-36, 70), (-16, 56), (4, 44), (20, 34)], 0.072)
    lobe('Hair_Lobe.2', [(-10, 72), (10, 58), (28, 46), (42, 36)], 0.070)
    lobe('Hair_Lobe.3', [(16, 70), (36, 58), (52, 46), (64, 37)], 0.064)
    lobe('Hair_Lobe.4', [(-64, 66), (-58, 55), (-50, 47), (-44, 42)], 0.056)   # chừa khoảng trán lộ nốt ruồi
    lobe('Hair_Lobe.5', [(44, 68), (62, 56), (76, 46), (86, 38)], 0.058)
    for s, k in ((1, 'L'), (-1, 'R')):   # cánh tóc thái dương vểnh nhẹ ra ngoài
        lobe(f'Hair_Wing.{k}', [(s * 72, 48), (s * 90, 32), (s * 100, 22)], 0.052, (0.014, 0.042, 0.050))
    # chỏm xoắn: Bézier + Bevel, giữa phình to, uốn cong vòng về trước, ngọn tròn dày
    top, _ = S.at(0, 88, 0.0)
    pts = [top + Vector(v) for v in ((0, 0.012, -0.01), (0.004, 0.008, 0.045), (0.020, -0.012, 0.080), (0.050, -0.036, 0.086), (0.070, -0.054, 0.064))]
    rad = [1.0, 1.25, 1.15, 0.95, 0.80]
    cu = bpy.data.curves.new('Hair_Tuft', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.031; cu.bevel_resolution = 6; cu.use_fill_caps = True; cu.resolution_u = 16
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1)
    for bp, p, r in zip(sp.bezier_points, pts, rad): bp.co = p; bp.radius = r; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    tuft = bpy.data.objects.new('Hair_Tuft', cu); coll.objects.link(tuft); cu.materials.append(M['toc'])
    tip = uv_sphere('Hair_Tuft_Tip', coll, M['toc'], (24, 16)); place(tip, pts[-1], Matrix.Identity(3), (0.025, 0.025, 0.025))   # ngọn tròn dày, không nhọn


# ------------------------------------------------------------------ ánh sáng + camera trực giao
def studio(sc):
    w = bpy.data.worlds.new('studio'); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = hexc('#f4ece6'); bg.inputs['Strength'].default_value = 0.6
    def area(name, loc, size, energy, col):
        d = bpy.data.lights.new(name, 'AREA'); d.size = size; d.energy = energy; d.color = hexc(col)[:3]
        o = bpy.data.objects.new(name, d); sc.collection.objects.link(o); o.location = loc
        o.rotation_euler = (C - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    area('Key', (-1.0, -1.6, 2.2), 1.4, 120, '#fff3e4')
    area('Fill', (1.4, -1.2, 1.4), 1.8, 45, '#eef2ff')
    area('Rim', (0.4, 1.6, 2.0), 1.0, 70, '#ffffff')
    cams = {}
    for name, loc, rot in (('Cam_Front', (0, -3, C.z + 0.04), (math.radians(90), 0, 0)), ('Cam_Right', (3, 0, C.z + 0.04), (math.radians(90), 0, math.radians(90))),
                           ('Cam_34', (2.12, -2.12, C.z + 0.04), (math.radians(90), 0, math.radians(45))),
                           ('Cam_Back', (0, 3, C.z + 0.04), (math.radians(90), 0, math.radians(180))),
                           ('Cam_14sau', (2.12, 2.12, C.z + 0.04), (math.radians(90), 0, math.radians(135)))):
        cd = bpy.data.cameras.new(name); cd.type = 'ORTHO'; cd.ortho_scale = 0.86
        o = bpy.data.objects.new(name, cd); sc.collection.objects.link(o); o.location = loc; o.rotation_euler = rot; cams[name] = o
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 32; sc.cycles.use_denoising = True; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = -0.5
    try:
        pr = bpy.context.preferences.addons['cycles'].preferences; pr.compute_device_type = 'OPTIX'; pr.refresh_devices()
        sc.cycles.device = 'GPU' if any(d.type == 'OPTIX' for d in pr.devices) else 'CPU'
    except Exception:
        sc.cycles.device = 'CPU'
    sc.render.resolution_x = sc.render.resolution_y = 900
    return cams


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene; top = bpy.data.collections.new('Nam_Dau'); sc.collection.children.link(top)
    cf = bpy.data.collections.new('03_Head_And_Face'); ch = bpy.data.collections.new('04_Hair'); top.children.link(cf); top.children.link(ch)
    M = make_mats()
    head, cage = build_head(cf, M)
    S = build_face(cf, M, head)
    build_hair(ch, M, cage, S)
    return sc


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--section', default='A_trung', choices=['goc', 'A_trung', 'B_ma']); ap.add_argument('--render', default=''); ap.add_argument('--blend', default=''); ap.add_argument('--no-hair', action='store_true', help='ẩn collection 04_Hair để soi riêng hộp sọ')
    a = ap.parse_args(argv)
    SECTION_MODE = a.section
    sc = build(); cams = studio(sc)
    if a.no_hair:
        for c in bpy.data.collections['04_Hair'].objects: c.hide_render = True; c.hide_viewport = True
    if a.blend: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
    if a.render:
        os.makedirs(a.render, exist_ok=True)
        for name, o in cams.items():
            sc.camera = o; sc.render.filepath = os.path.join(a.render, f'{name}.png'); bpy.ops.render.render(write_still=True)
