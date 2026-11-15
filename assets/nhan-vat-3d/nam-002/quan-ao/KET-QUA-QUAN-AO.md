# Quần áo trên NAM-002 — kết quả kiểm (bản giữa chừng, 15/11/2026)

Chưa đạt. Đây là số đo sau vòng sửa thứ nhất để chủ repo nắm tình trạng; chưa phải bàn giao cuối.

- Dựng: `may_quan_ao.py` (lát cắt NAM-002, dựng quanh da ở dáng tay xiên 75°, tính ngược về chữ T). Gắn rig: `gan_rig.py`. Đo: `kiem_tra.py --bo all --nhanh` (11 dáng + khung đi bộ 1/9/17/25). Ảnh: `anh/<bộ>.webp`.
- Mỗi ô: số đỉnh da xuyên vải / cặp mặt vướng / cạnh vải giãn>1,6× hoặc co<0,5× / mặt lật. `ĐẠT` = cả 4 bằng 0 và không lộ da.

| Bộ | tay_buong | khuyu_gap | xoay_than | khung_1 | khung_9 | khung_17 | khung_25 | buoc_chan | tay_truoc_80 | gio_tay_cao | ngoi_xom | nghi_T |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| xanh | 61/0/0/9 | 0/0/49/0 | 0/0/256/55 | 0/208/162/64 | 0/178/412/101 | 0/164/162/65 | 0/135/413/104 | 33/234/398/40 | 28/131/748/211 | 0/5/1771/875 | 126/1032/2446/1348 | 0/0/563/53 |
| ngu | 61/0/0/9 | 0/0/49/0 | 0/0/256/55 | 0/209/160/64 | 0/128/38/7 | 0/161/160/65 | 0/81/39/7 | 33/232/105/20 | 28/131/748/211 | 0/5/1771/875 | 12/656/1796/265 | 0/0/563/53 |
| xam-tui | 61/0/0/9 | 0/0/49/0 | 0/0/256/55 | 0/208/162/64 | 0/178/412/101 | 0/164/162/65 | 0/135/413/104 | 33/234/398/40 | 28/131/748/211 | 0/5/1771/875 | 126/1032/2446/1348 | 0/0/563/53 |
| dong-phuc | 61/0/0/9 | 0/0/49/0 | 0/1/256/55 | 0/213/162/64 | 0/179/412/101 | 0/170/162/65 | 0/135/413/104 | 33/235/398/40 | 28/131/748/211 | 0/5/1771/875 | 126/1032/2446/1348 | 0/0/563/53 |
| the-thao | 61/0/0/9 | 0/0/54/0 | 0/16/272/64 | 0/214/174/72 | 0/135/44/7 | 0/161/173/65 | 0/88/45/7 | 33/232/105/20 | 29/147/784/225 | 0/7/1816/926 | 12/687/1821/274 | 0/4/603/53 |
| hoodie | 61/194/70/125 | 3/394/1269/1152 | 0/48/1045/273 | 0/299/681/214 | 0/308/572/197 | 0/237/661/228 | 0/260/575/200 | 33/429/406/149 | 28/624/2039/751 | 0/35/3284/1947 | 127/1103/3274/1661 | 0/24/1950/116 |
| khoac-gio | 61/231/129/175 | 4/680/1673/1234 | 0/212/1335/361 | 0/563/998/296 | 0/560/817/281 | 0/531/972/325 | 0/517/818/284 | 33/596/527/206 | 40/1145/2864/935 | 0/112/5118/2833 | 126/1489/3906/1761 | 0/68/2608/197 |
| so-mi-khoac | 61/0/4/9 | 0/0/94/0 | 0/74/501/116 | 0/357/321/112 | 0/325/436/98 | 0/325/318/125 | 0/282/437/101 | 33/365/402/40 | 30/612/1599/420 | 0/4/3718/1677 | 126/1334/2873/1439 | 0/0/1271/110 |
| sweatshirt | 61/194/70/125 | 3/394/1269/1152 | 0/48/1045/273 | 0/298/682/214 | 0/311/670/224 | 0/243/661/228 | 0/268/671/227 | 33/428/468/156 | 28/624/2039/751 | 0/35/3284/1947 | 126/1095/3454/1646 | 0/24/1950/116 |
| tung-bong-da | 61/0/0/9 | 0/0/54/0 | 0/16/272/64 | 0/214/192/72 | 0/135/92/23 | 0/161/194/65 | 0/88/91/21 | 33/232/105/20 | 29/147/784/225 | 0/7/1816/926 | 13/1003/1883/288 | 0/4/603/53 |

## Đọc kết quả

- **Dáng thường (buông tay, gập khuỷu, đi bộ) gần đạt ở bộ một lớp** (`xanh`, `ngu`, `the-thao`, `tung-bong-da`, `xam-tui`, `dong-phuc`): áo gần sạch; còn lại chủ yếu ở quần khi bước (mặt trong đùi ống rộng chạm nhau, nếp gập sau đùi) và bàn tay buông áp vào hông quần (~9 mm).
- **Giơ tay cao, đưa tay trước 80°, chữ T, ngồi xổm lỗi nặng**: vải dựng ở dáng tay xiên 75° nên nách/vai áo bị kéo hoặc gập khi tay đi xa dáng đó; ngồi xổm quần gập ở háng. Cần shape key sửa lái theo góc tay/hông (như sửa nếp nách rig cũ).
- **Bộ hai lớp (`khoac-gio`, `so-mi-khoac`) và tay dài (`hoodie`, `sweatshirt`) lỗi nhiều hơn**: áo trong và áo ngoài vướng nhau; `khoac-gio` có cạnh suy biến (giãn hàng triệu lần) ở vạt mở — lỗi dựng hình cần sửa trước.
- Lộ da đã loại da tay (nách lộ khi giơ tay là thiết kế áo cộc). Dáng chữ T không dùng khi diễn, chỉ để tham khảo.

## Bước tiếp

1. Sửa cạnh suy biến vạt áo khoác mở; giãn khoảng áo trong–áo ngoài.
2. Quần: thu mặt trong ống ở đùi, pha weights đùi sau mông; đo lại khi bước.
3. Shape key sửa áo cho giơ tay cao / đưa tay trước và quần cho ngồi xổm, lái theo góc xương.
4. Chạy đủ 32 khung đi bộ cho bộ đạt.

Mô hình NAM-002: giấy phép nguồn chưa xác minh (README NAM-002).
