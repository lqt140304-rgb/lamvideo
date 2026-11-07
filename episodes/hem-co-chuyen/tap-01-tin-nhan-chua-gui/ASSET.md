# Asset — Tin nhắn chưa gửi, bản 6

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
| [stills/film_c0e_alley.png](assets/stills/film_c0e_alley.png) | Still HD | C0-E: Duy & Thảo trước tiệm ông Lộc dưới quầng sáng đèn đường |
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
| SET-HEM-EXT | Ngõ cụt bí bách, mảnh chai, rêu, cửa sắt khóa, đèn đường, quầng sáng thể tích | Có SVG và khung thử; chờ duyệt theo cảnh | [`AlleyExteriorScene`](../../../what-if-studio/src/engine/sets/tin_nhan_chua_gui.tsx#L2442), `film_c0e_alley.png` |
| ANIMAL-CU | Cú đậu mái hiên và cận cảnh mắt cú 85mm phản quang đèn đường | Có SVG và khung thử; chờ duyệt theo cảnh | [`PerchingOwl`](../../../what-if-studio/src/engine/sets/tin_nhan_chua_gui.tsx#L2035), [`OwlEyeMacro`](../../../what-if-studio/src/engine/sets/tin_nhan_chua_gui.tsx#L2140), `film_c0c_owl.png` |
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

## Lưu ý sau rà kịch bản bản 6

Giữ bộ asset đã nâng cấp; mã thử 142 giây vẫn theo lần thử trước, chưa cập nhật lời/diễn bản 6. Khi ráp nguồn mới, cần đồng hồ nhỏ ở kệ thấp gần cửa để nhấc/đặt, biểu cảm C4 nhớ cuộc nói chuyện nhưng mất trải nghiệm vòng tay mẹ, và động tác lấy G1 từ ví ra đối chiếu C8. Chưa render/duyệt lại các hành động này; không tạo thêm bối cảnh hoặc nhân vật.

## Phạm vi bộ thử và đường dẫn vận hành

Antigravity được nhờ cải tiến thư viện asset có sẵn; những cảnh tập này là môi trường thử. Không dùng độ dài bộ thử để đánh giá mức hoàn thành chuyển thể kịch bản. Bảng 18 nhân vật và các props/vehicles trong engine có thể dùng lại cho các tập khác; hình người/địa điểm cụ thể vẫn cần lựa chọn theo câu chuyện.

- [Mã thử](../../../what-if-studio/src/episodes/tin-nhan-chua-gui/) và [timeline](../../../what-if-studio/src/episodes/tin-nhan-chua-gui/timeline.json): 24 đoạn, 142 giây theo JSON, chưa phải số đo video đã xem.
- [Preview vận hành](../../../what-if-studio/public/tin-nhan-chua-gui/previews/) và [still vận hành](../../../what-if-studio/public/tin-nhan-chua-gui/stills/). Đây là alias kỹ thuật `tin-nhan-chua-gui` của hồ sơ `tap-01-tin-nhan-chua-gui`; không tạo thêm một tập trùng.
- Bộ thử dùng một số cue gộp/đổi mã: chẳng hạn kiệt sức là ShC5_B, mẹ tan ShC7_B, ngưỡng nhà ShC8_B; nguồn hiện hành lần lượt C5-C, C7-C, C8-C. Cần đối chiếu hành động khi tái dùng, không ghép chỉ theo tên file. Bộ thử không thay nguồn 35 cue.
- Chưa chọn/tạo giọng chính thức, nhạc/Foley/môi trường và mix cuối; nguồn/quyền dùng của từng audio cần ghi khi chọn. Không có chi phí mới được xác minh trong lượt cập nhật tài liệu này.
- Đã xem bảng nhân vật mở rộng, biểu cảm/tư thế và một số still; chưa xem/nghe animatic toàn tập. Trạng thái có file không tự chứng minh chuyển động, tiếp xúc, lời dẫn, âm thanh hoặc chất lượng cuối đã đạt.
