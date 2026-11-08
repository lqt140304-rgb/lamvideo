# Asset — Tin nhắn chưa gửi, bản 9

Lộ trình và trạng thái: [kế hoạch sản xuất tối ưu](KE-HOACH-SAN-XUAT.md).

**Định dạng đã chốt, 07/11/2026: giữ người dẫn chuyện kết hợp thoại nhân vật.** Lời dẫn giúp làm rõ thông tin, cảm giác khó quan sát và hệ quả cần hiểu; hình/âm đảm nhiệm hành động và diễn xuất. Cân đối để tránh kể lặp điều hình đã cho thấy. Chưa chuyển sang phim chỉ có thoại nhân vật; giữ lời dẫn theo bản nguồn hiện hành và đồng bộ LOI-DOC/ELEVENLABS sau biên tập.

**Asset đã cập nhật:** đã nhận bộ nâng cấp SVG của Antigravity tại commit `cd7243c`: rig, biểu cảm/tay, bối cảnh, đạo cụ, ảnh preview và 10 still. Mục tiêu của đợt này là cải tiến thư viện asset; mã/timeline tập được dùng thử hình. Timeline thử có 24 đoạn, 4.260 frame ở 30 fps = 142 giây; không phải bản dựng đủ kịch bản 35 cue hoặc thời lượng phim cuối. Chưa duyệt storyboard/animatic toàn tập hoặc tạo giọng/mix cuối.

Nguồn lời [KICH-BAN.md](KICH-BAN.md); mục tiêu dựng [DUNG-CANH.md](DUNG-CANH.md). Phân biệt có mã/file, đã xem một số still và đã duyệt diễn xuất theo cảnh. Bộ mới tiếp tục được đánh giá để dùng lại; chưa mặc định mọi tạo hình SVG thay thế concept đã chốt.

## File đã có trong hồ sơ tập (`assets/`)

| File | Phân loại | Mục đích & Chi tiết |
|---|---|---|
| [user-sketch-thao-duy-loc.png](assets/nhan-vat/user-sketch-thao-duy-loc.png) | Phác thảo gốc | Ảnh phác thảo gốc của chủ repo đính kèm ngày 07/11/2026 làm chuẩn tạo hình 3 nhân vật |
| [duy-thao-loc-concept-v4.png](assets/nhan-vat/duy-thao-loc-concept-v4.png) | Concept 2D | Concept màu toàn thân Lộc, Duy, Thảo |
| [preview_new_cast.png](assets/nhan-vat/preview_new_cast.png) | Render Vector | Bảng 18 nhân vật mở rộng dùng chung; không phải bảng riêng ba nhân vật chính. Duy/Thảo/Lộc có thể xem trong preview_cast_postures và still tập |
| [preview_cast_postures.png](assets/nhan-vat/preview_cast_postures.png) | Render Vector | Bảng tư thế dáng đứng, ngồi, bước đi, ngoái nhìn tự nhiên theo tỷ lệ giải phẫu |
| [preview_expressions_hands.png](assets/nhan-vat/preview_expressions_hands.png) | Render Vector | 21 Biểu cảm sắc thái khuôn mặt & cử chỉ bàn tay cầm nắm vật thể |
| [preview_opening_c0.png](assets/boi-canh/preview_opening_c0.png) | Render Vector | Bảng tổng hợp Cảnh 0 Mở đầu: Trời sao, cú đêm, ngõ cụt, mèo bờ tường, quầng sáng đèn đường |
| [preview_ong_loc_shop.png](assets/boi-canh/preview_ong_loc_shop.png) | Render Vector | Không gian bên trong tiệm sửa đồng hồ & điện thoại cũ ông Lộc |
| [preview_mother_house.png](assets/boi-canh/preview_mother_house.png) | Render Vector | Căn nhà ấm cúng 2 anh em: bàn ăn mộc, đèn mây, bàn thờ mẹ & hình bóng người bố sau vách |
| [preview_meadow_g3.png](assets/boi-canh/preview_meadow_g3.png) | Render Vector | Cánh đồng lúa vàng óng nắng chiều và bờ cỏ khô gặp mẹ |
| [preview_furniture_props.png](assets/dao-cu/preview_furniture_props.png) | Render Vector | Đồ đạc nội thất, ấm trà, phin cà phê, hộp đồ nghề cơ khí, quạt Senko, lịch lốc |
| [preview_vehicles_houses.png](assets/dao-cu/preview_vehicles_houses.png) | Render Vector | Xe Wave, Vespa, xe đạp phượng hoàng, taxi, mặt tiền nhà ống hẻm |
| [stills/film_c0a_title.png](assets/stills/film_c0a_title.png) | Still HD | C0-A: Bầu trời sao thành phố & tựa phim "Tin Nhắn Chưa Gửi" |
| [stills/film_c0c_owl.png](assets/stills/film_c0c_owl.png) | Still HD | Mã thử C0-C: cận mắt cú phản chiếu đèn; 85mm là ý đồ bố cục |
| [stills/film_c0d_alley_wide.png](assets/stills/film_c0d_alley_wide.png) | Still HD | C0-D: Toàn cảnh ngõ cụt ban đêm, cú trên mái hiên, mèo trên bờ tường rêu |
| [stills/film_c0e_alley.png](assets/stills/film_c0e_alley.png) | Still HD | C0-E: Duy & Thảo trước tiệm ông Lộc; ngõ/ánh sáng theo bản cập nhật mới |
| [stills/film_c1a_shop.png](assets/stills/film_c1a_shop.png) | Still HD | C1-A: Duy & Thảo bước vào tiệm sửa đồng hồ của ông Lộc |
| [stills/film_c4a_phone.png](assets/stills/film_c4a_phone.png) | Still HD | C4-A: Chiếc điện thoại nứt màn hình & biên nhận ký ức |
| [stills/film_c5b_exhausted.png](assets/stills/film_c5b_exhausted.png) | Still HD | Mã thử C5-B: Duy kiệt sức sau G2; tên cue của mã thử khác nguồn DUNG-CANH |
| [stills/film_c6b_walking.png](assets/stills/film_c6b_walking.png) | Still HD | C6-B: Đi dạo cùng mẹ trên cánh đồng lúa chiều vàng |
| [stills/film_c7b_dissolve.png](assets/stills/film_c7b_dissolve.png) | Still HD | C7-B: Khoảnh khắc chia tay xúc động |
| [stills/film_c8b_home.png](assets/stills/film_c8b_home.png) | Still HD | Mã thử C8-B: ngưỡng nhà có bóng bố; không đổi kết truyện hai trẻ gọi dì/rời nhà |

## Mã và khung thử đã có — chưa thay duyệt theo cảnh

| ID | Tài nguyên / ràng buộc | Trạng thái | Mã nguồn & File liên kết |
|---|---|---|---|
| CHAR-DUY / CHAR-THAO | Duy 16 tuổi (áo bụi, quần vá), Thảo 8 tuổi (áo vàng, túi canvas chéo) | Có rig và khung thử; chờ duyệt theo cảnh | [`rig.tsx`](../../../what-if-studio/src/engine/rig.tsx), `assets/nhan-vat/preview_new_cast.png` |
| CHAR-LOC | Ông Lộc ~60 tuổi (sơ mi xám cài 2 bút/tua-vít, kính đồi mồi, quần nâu) | Có rig và khung thử; chờ duyệt theo cảnh | [`rig.tsx`](../../../what-if-studio/src/engine/rig.tsx), `assets/nhan-vat/preview_new_cast.png` |
| CHAR-ME | Khoảng 38–42, áo vải đất sáng, tóc buộc thấp, ấm áp đời thường | Có rig và khung thử; chờ duyệt theo cảnh | [`rig.tsx`](../../../what-if-studio/src/engine/rig.tsx), `assets/stills/film_c6b_walking.png` |
| CHAR-BO-SHADOW | Người bố chỉ xuất hiện dạng hình bóng sau vách + tiếng chai lăn | Có SVG và khung thử; chờ duyệt theo cảnh | [`FatherSilhouette`](../../../what-if-studio/src/engine/sets/tin_nhan_chua_gui.tsx#L1318), `preview_mother_house.png` |
| SET-CITY-SKY | Bầu trời đêm thành phố, skyline nhà ống bồn inox, chữ tựa phim C0-A | Có SVG và khung thử; chờ duyệt theo cảnh | [`StarryCitySkyline`](../../../what-if-studio/src/engine/sets/tin_nhan_chua_gui.tsx#L2210), `film_c0a_title.png` |
| SET-HEM-EXT | Ngõ cụt, mặt nhà Việt, cửa tiệm có chiều sâu; ánh sáng theo set mới, không đèn đường phía trên/người qua đường | Có SVG và khung thử; chờ duyệt theo cảnh | [`AlleyExteriorScene`](../../../what-if-studio/src/engine/sets/tin_nhan_chua_gui.tsx#L2442), `film_c0e_alley.png` |
| ANIMAL-CU | Cú đậu mái hiên và cận cảnh mắt cú 85mm phản chiếu ánh đèn | Có SVG và khung thử; chờ duyệt theo cảnh | [`PerchingOwl`](../../../what-if-studio/src/engine/sets/tin_nhan_chua_gui.tsx#L2035), [`OwlEyeMacro`](../../../what-if-studio/src/engine/sets/tin_nhan_chua_gui.tsx#L2140), `film_c0c_owl.png` |
| ANIMAL-MEO | Mèo đen than mun nằm trên bờ tường ngõ cụt, mắt hổ phách tapetum | Có SVG và khung thử; chờ duyệt theo cảnh | [`Cat`](../../../what-if-studio/src/engine/props.tsx#L6), `film_c0d_alley_wide.png` |
| SET-TIEM | Quầy gỗ, kệ đồng hồ, cửa sắt kéo, đèn bàn thợ sửa, ánh vàng hổ phách | Có SVG và khung thử; chờ duyệt theo cảnh | [`OngLocShop`](../../../what-if-studio/src/engine/sets/tin_nhan_chua_gui.tsx#L905), `preview_ong_loc_shop.png` |
| SET-CANHDONG | Bờ đất bằng, ruộng lúa chín vàng gió lay, cỏ khô ngồi ngắm hoàng hôn | Có SVG và khung thử; chờ duyệt theo cảnh | [`SunsetRiceField`](../../../what-if-studio/src/engine/sets/tin_nhan_chua_gui.tsx#L2820), `preview_meadow_g3.png` |
| SET-NHA | Căn nhà ấm cúng, bàn ăn gỗ, đèn mây, bàn thờ mẹ đèn luôn sáng, góc máy may | Có SVG và khung thử; chờ duyệt theo cảnh | [`MotherThaoHouse`](../../../what-if-studio/src/engine/sets/tin_nhan_chua_gui.tsx#L1410), `preview_mother_house.png` |
| PROP-MAY | Điện thoại nứt màn hình (C4) và điện thoại phục hồi phát voice memo | Có SVG và khung thử; chờ duyệt theo cảnh | [`MotherPhone`](../../../what-if-studio/src/engine/sets/tin_nhan_chua_gui.tsx#L1230), `film_c4a_phone.png` |
| PROP-G1-G2-G3 | Bộ 3 phiếu biên nhận ký ức hai liên, bút ký, phong bì tiền | Có SVG và khung thử; chờ duyệt theo cảnh | [`ThreeReceiptsSet`](../../../what-if-studio/src/engine/sets/tin_nhan_chua_gui.tsx#L2940), `film_c4a_phone.png` |

## Lịch sử concept trước đợt nâng cấp SVG

Dùng built-in imagegen, không CLI/API/Gemini. Pass sửa trẻ: giữ nguyên Lộc đã chốt; Duy 16 mặt trẻ, giấu buồn/căng vai, đứng chắn trước Thảo 8, em nép sau níu gấu áo; giữ nét 2D có khối và nền giấy. Pass nét khó khăn: chỉ bạc màu vải, cổ/gấu áo mòn, mũi khâu gọn ở áo và quần, vá nhỏ cùng tông quần em, giày/dép cũ vẫn dùng được; giữ mặt/tuổi/tư thế, không thêm bầm tím/dơ mặt/người gầy già hoặc sửa Lộc.

Hai lượt chỉnh trẻ này có trước đợt nâng cấp SVG; không có số credits/tiền trong kết quả công cụ. V4 là concept màu để đối chiếu; bộ rig/bối cảnh/preview mới được liệt kê ở trên. Giọng/mix cuối chưa tạo, không suy ra chi phí từ lượt gọi hoặc token.

## Hai phác thảo mở đầu của chủ repo

Nguồn: hai hình đính kèm trong chat ngày 07/11/2026, lần lượt là trời sao/nhà và cú–đường–tiệm–hai trẻ. Đã chuyển thành C0-A…C0-F trong KICH-BAN/DUNG-CANH. Chưa có đường dẫn file ảnh phác thảo trong repo; không tạo link hoặc nhận đã nhập file gốc. Đã có mã/SVG và still thử mở đầu; chưa có storyboard/animatic toàn tập đã duyệt. Đây là tài liệu bố cục riêng của tập, không đưa lên thư viện chung.

## Lưu ý sau rà kịch bản bản 7

Giữ bộ asset đã nâng cấp; mã thử 142 giây vẫn theo lần thử trước, chưa cập nhật lời/diễn bản 7. Khi ráp nguồn mới, cần đồng hồ nhỏ ở kệ thấp gần cửa để nhấc/đặt, diễn C1 gắt/mỉa mai → trẻ sợ/ứa nước mắt → Lộc quay đi làm tiếp rồi cười nham hiểm; tiền Thảo qua tay Duy rồi được đưa lại C2; biểu cảm C4 còn nhớ cuộc nói chuyện nhưng mất ký ức buổi mẹ dỗ làm hòa, và động tác lấy G1 từ ví ra đối chiếu C8. Chưa render/duyệt lại các hành động này; không tạo thêm bối cảnh hoặc nhân vật.

## Phạm vi bộ thử và đường dẫn vận hành

Antigravity được nhờ cải tiến thư viện asset có sẵn; những cảnh tập này là môi trường thử. Không dùng độ dài bộ thử để đánh giá mức hoàn thành chuyển thể kịch bản. Bảng 18 nhân vật và các props/vehicles trong engine có thể dùng lại cho các tập khác; hình người/địa điểm cụ thể vẫn cần lựa chọn theo câu chuyện.

- [Mã thử](../../../what-if-studio/src/episodes/tin-nhan-chua-gui/) và [timeline](../../../what-if-studio/src/episodes/tin-nhan-chua-gui/timeline.json): 24 đoạn, 142 giây theo JSON, chưa phải số đo video đã xem.
- [Preview vận hành](../../../what-if-studio/public/tin-nhan-chua-gui/previews/) và [still vận hành](../../../what-if-studio/public/tin-nhan-chua-gui/stills/). Đây là alias kỹ thuật `tin-nhan-chua-gui` của hồ sơ `tap-01-tin-nhan-chua-gui`; không tạo thêm một tập trùng.
- Bộ thử dùng một số cue gộp/đổi mã: chẳng hạn kiệt sức là ShC5_B, mẹ tan ShC7_B, ngưỡng nhà ShC8_B; nguồn hiện hành lần lượt C5-C, C7-C, C8-C. Cần đối chiếu hành động khi tái dùng, không ghép chỉ theo tên file. Bộ thử không thay nguồn 35 cue.
- Chưa chọn/tạo giọng chính thức, nhạc/Foley/môi trường và mix cuối; nguồn/quyền dùng của từng audio cần ghi khi chọn. Không có chi phí mới được xác minh trong lượt cập nhật tài liệu này.
- Đã xem bảng nhân vật mở rộng, biểu cảm/tư thế và một số still; chưa xem/nghe animatic toàn tập. Trạng thái có file không tự chứng minh chuyển động, tiếp xúc, lời dẫn, âm thanh hoặc chất lượng cuối đã đạt.

Bản 7 đổi chữ G1 sang buổi tranh xe đồ chơi rồi được mẹ dỗ làm hòa; nhãn G2/G3 và C8 là biên nhận từng lần đổi, không điều khoản mới. Cần cập nhật các lớp chữ khi dựng. Bố tiếp tục chỉ qua bóng/âm, không thêm asset cảnh đánh đập; ký ức được hai trẻ kể ở quầy, chưa yêu cầu bộ nhân vật nhỏ tuổi. Các thay đổi này mới ở tài liệu, chưa được đưa vào hoặc duyệt bằng mã thử/animatic.

## Bản nâng cấp ánh sáng nhận trong lượt đồng bộ bản 7

Đã nhận tiếp commit `8b95931` của Antigravity: sửa ánh sáng/độ chuyển tối/viền sáng/bụi trong mã thử; cập nhật hai still C0-D, C0-E và thêm [bảng mở đầu](assets/stills/preview_opening_c0.png), kèm bản sao public. Bộ thử vẫn có 10 file `film_*.png`; bảng preview mới là ảnh bổ sung. Việc nhận mã/ảnh không đồng nghĩa diễn xuất và lời thoại bản 7 đã được dựng hoặc duyệt. Lượt biên tập này chưa xem/nghe lại bản chuyển động ánh sáng mới.

## Khung/máy bản 8 và ngõ hiện hành — 08/11/2026

Đã nhận các cập nhật ngõ `0624c64`, `301c816` và `85c11af`: mặt nhà/tiệm và ánh sáng mới; bỏ đèn đường phía trên và bóng người qua đường; đổi cụm trang trí cuối ngõ sang chữ cảnh báo/túi rác. Giữ nguyên mã/ảnh các commit này. Bảng mở đầu hiện hành là `assets/stills/preview_opening_c0.png`; bản cùng tên ở `assets/boi-canh/` là preview cũ để đối chiếu, không lấy làm chuẩn ngõ mới.

Kịch bản bản 8 bổ sung 16:9 cho thực tại, 2:1 cho C6–C7 và đoạn rung/nghiêng ngắn C5-C; chưa triển khai các chỉ dẫn này vào mã thử. Cần bố cục lại trong vùng hình, chừa nền theo góc xoay cực hạn và kiểm tra tiếp xúc. Không cần tạo thêm nhân vật/bối cảnh chỉ để đổi tỉ lệ hoặc rung; không hoàn thiện lại ngõ, tạo giọng hay xuất phim trong lượt sửa tài liệu này.

Nhận tiếp `279dae2` trong lúc bàn giao tài liệu: thu hẹp ngõ, bổ sung thùng rác xanh, ruồi và xe đạp có lớp/khối; cập nhật ba ảnh mở đầu và bản sao public. Giữ bản ngõ này khi ráp C0, không kéo dãn chiều ngang ngõ để khớp tỉ lệ xuất. Việc nhận cập nhật không xác nhận cảnh đã chạy cùng camera/lời bản 8. Các sửa đổi mã/asset khác còn đang làm local thuộc công việc riêng, không nằm trong commit tài liệu này.

## Âm thanh bản 9 — nguồn sơ tuyển, chưa nhập media

Đã bổ sung thiết kế nền/nhạc không lời và âm chi tiết theo 35 cue trong KICH-BAN/DUNG-CANH. [NGUON-AM-THANH.md](NGUON-AM-THANH.md) lưu các ứng viên có tên/tác giả, URL và giấy phép đã đọc ngày 08/11/2026; chưa nghe/tải/đo/ráp hoặc chốt file. Ưu tiên Audio Library khi cần tránh Content ID trên YouTube; Mixkit cho ghép vào video theo giấy phép nhưng không bảo đảm không claim nhầm. Không đưa file rời Mixkit lên Git hoặc kèm source files. Quạt/phòng chưa có file phù hợp được chốt; tiếng môi/hơi thở lấy đúng vai và ghế/giấy/chai đúng động tác khi sản xuất. Không ticking cho kệ đồng hồ đứng kim. Mã/voice/timeline/mix chưa được cập nhật theo chỉ dẫn âm mới.

## Cập nhật rig/VFX và cánh đồng — 08/11/2026

- Theo phản hồi mới nhất: giữ tỉ lệ cartoon cũ. Rig dùng chung đã sửa đường vai/tay áo, các khớp cong, tư thế tay buông; hông nối đùi, chân và quần đầy hơn, khối hông co theo góc đùi khi ngồi. Xem [bộ thử rig và VFX](../../../docs/ASSET-VFX.md). Chưa coi mọi shot có tương tác đã đạt.
- `SET-CANHDONG` chuyển phần triển khai sang [sunset_field.tsx](../../../what-if-studio/src/engine/sets/sunset_field.tsx); API `SunsetRiceField(t, whiteout)` và `SunsetMeadowForeground(t, shiftX)` vẫn được export từ file set cũ. Giữ tọa độ bờ đất để tái dùng các shot. Hoàng hôn tím hồng–cam ấm, mặt trời thấp trái, lớp làng xa/mái nhà/cây/cột điện, khói bếp, lúa có bông–hạt, mương phản chiếu/gợn, bờ ngồi có mặt đỡ, đất/cỏ tiền cảnh rõ hơn; gió lệch nhịp từng cụm.
- [Ảnh preview cánh đồng mới](assets/boi-canh/preview_meadow_vfx.png) được tạo từ `MeadowMotionLab`, frame 128. Đây là bài thử set/rig, không phải một shot phim đã duyệt, không thay các still cũ cùng tên. Ảnh cũ giữ để đối chiếu lịch sử.
- Clip thử 12 giây, H.264 960×540/30 fps: `what-if-studio/out/tin-nhan-chua-gui/asset-preview/meadow-motion.mp4` (local). Đã xuất và soi khung, chờ duyệt chuyển động; chưa có giọng/mix và khẩu hình khớp lời. Mẫu miệng của mẹ chỉ minh họa kỹ thuật.
- Nguồn: SVG/React trong repo, sửa ngày 08/11/2026; giữ attribution engine gốc. Không thêm hình/nhạc stock hoặc gọi media trả phí. Tạo asset không đổi kịch bản, luật G1/G2/G3 hoặc định dạng có người dẫn chuyện.

## Bố cục đồng vàng và vòng tay mẹ — cập nhật theo ảnh chủ repo

- [BO-CUC-CANH-DONG.md](BO-CUC-CANH-DONG.md) là chỉ dẫn hình mới nhất cho đồng, bờ kè/mương và tư thế ngồi. Giữ phong cách cartoon cũ; ảnh xanh trước dùng cho độ dày, ảnh bông vàng mới quyết định hình hạt/màu, ảnh dáng ngồi mới quyết định góc đùi–gối.
- [Preview mới](assets/boi-canh/preview_meadow_embrace.png): `MeadowMotionLab` frame 93, bản đồng chín vàng, kè đá và hai con tựa vai mẹ. Không dùng `preview_meadow_vfx.png` cũ để đánh giá lần sửa này.
- Mã riêng của nhóm ôm: [meadow_family.tsx](../../../what-if-studio/src/episodes/tin-nhan-chua-gui/meadow_family.tsx); bông vàng: [golden_grain.tsx](../../../what-if-studio/src/engine/sets/golden_grain.tsx). C7 của mã thử và bảng asset cùng dùng tư thế mới. `seatedBank` hiện kè/mương phía trước; cảnh đi vẫn có lối khô.
- Đã kiểm tra hình học tay chạm vai, đùi nằm ngang hơn cẳng chân, đầu gối gập, cẳng chân thả thẳng và giày cao hơn mặt nước; đã xuất still và clip thử. Chờ chủ repo duyệt chuyển động, chưa căn giọng/nhạc cuối hoặc chuyển thể đủ 35 cue.
