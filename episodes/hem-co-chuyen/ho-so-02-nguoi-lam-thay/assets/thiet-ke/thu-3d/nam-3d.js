// NAM 3D — bản theo ảnh mẫu 3D (`mau-3d-xoay.webp`, `mau-3d-dau.webp`), 12/11/2026.
// Dựng thủ tục bằng three.js, đơn vị cm, y lên, mặt nhìn +z. Cao ~165 cm, tỉ lệ chibi: đầu ~1/3 chiều cao.
// Nhận diện theo mẫu: không kính; mắt to tròng trắng viền đậm, mí trên sụp dày, con ngươi nhỏ sát mí; mày dày bo tròn;
// mũi cục tròn nhô; miệng hé tròn; tai to; nốt ruồi trên đuôi mày phải (bên trái màn hình); tóc mảng dày mềm như đất sét,
// mái rủ chéo, cánh tóc ở thái dương, lọn xoắn to trên đỉnh cong về trước; áo thun xám cổ tròn, quần đen xám ống suông
// trên mắt cá, dép xỏ ngón xanh đậm. Vật liệu mờ (đất sét/vải), sáng studio dịu.
// (Bản toon đầu tiên giữ ở `nam-3d-toon.js` để so sánh.)

export const NAM_COLORS = {
  skin: '#e9a87b', skinDeep: '#c98762', lip: '#c47a62', hair: '#2a2928', shirt: '#6f6c6a', pants: '#4a4948', pantsHem: '#403f3e',
  slippers: '#2d4a3b', sole: '#22302a', ink: '#1c1a19', eyeWhite: '#f3efe7', mouthIn: '#5e2724', tongue: '#c2675f', teeth: '#f4efe6',
};

/** Tham số khung mẫu: mọi số chỉnh được đặt ở đây; nhân vật mới chỉ cần ghi đè nhóm cần đổi (khung xương và tên khớp giữ nguyên). */
export const NAM_SPEC = {
  colors: NAM_COLORS,
  head: { RX: 20.5, RY: 24.0, RZ: 21.0, HC: 22.0 },                       // bán kính sọ; tâm sọ cao HC trên cằm
  eye: { x: 8.6, y: -1.4, w: 6.0, h: 5.8, lidTH: 0.35 },                   // lidTH: góc phủ mí trên (× π)
  mouth: { inner: [2.5, 2.4, 1.2], lip: null, teeth: [1.9, 0.6, 0.45], tongue: [1.6, 0.9, 0.5] }, // miệng chữ o nhỏ
  arm: { upper: [5.5, 5.2], fore: [5.2, 4.3], elbow: 5.2, wrist: 4.2, upperLen: 18, foreLen: 15,
         sleeve: { top: 7.1, bottom: 8.2, len: 11, flare: 0.045, hem: 8.2, curl: 1.5 } }, // bán kính liên tục 5.5 → 5.2 → 4.3, không ngấn khuỷu
  hair: { HS: { kx: 1.05, ky: 0.92, kz: 1.06, dy: 2.5 }, base: 1.21, back: 0.12, nape: -0.75, napeFrom: 1.6, napeTo: 2.35 },
};
const mergeSpec = (base, over = {}) => Object.fromEntries(Object.keys({ ...base, ...over }).map((k) => [k, (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) ? mergeSpec(base[k], over[k]) : (over[k] ?? base[k])]));

/** Chiều dài chân (cm) cho động tác: hông → gối → cổ chân. */
export const LEG = { thigh: 15, shin: 14.5 };

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Mảng dẹt bám mặt cong (lọn tóc đất sét, mày): bề rộng w(u) nằm trên mặt, bề dày t(u) theo pháp tuyến ra khỏi `center`. */
export function lobe(THREE, pts, w, t, center, { seg = 48, rad = 28 } = {}) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const C = new THREE.Vector3(...center), pos = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const u = i / seg, p = curve.getPointAt(u), T = curve.getTangentAt(u);
    const n0 = p.clone().sub(C).normalize();
    const B = new THREE.Vector3().crossVectors(T, n0).normalize(), N = new THREE.Vector3().crossVectors(B, T).normalize();
    const ww = w(u), tt = t(u);
    for (let j = 0; j <= rad; j++) {
      const a = (j / rad) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      // mặt dưới (sát đầu) phẳng hơn mặt trên: lọn nằm áp vào đầu
      const nOff = c >= 0 ? c * tt : c * tt * 0.35;
      pos.push(p.x + N.x * nOff + B.x * s * ww, p.y + N.y * nOff + B.y * s * ww, p.z + N.z * nOff + B.z * s * ww);
    }
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) { const a = i * (rad + 1) + j, b = a + rad + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const cap = (i, flip) => { const c = curve.getPointAt(i / seg), ci = pos.length / 3; pos.push(c.x, c.y, c.z); for (let j = 0; j < rad; j++) { const a = i * (rad + 1) + j; flip ? idx.push(ci, a, a + 1) : idx.push(ci, a + 1, a); } };
  cap(0, false); cap(seg, true);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

/** Ống thuôn (lọn xoắn, quai dép). */
export function tube(THREE, pts, r, { seg = 32, rad = 16 } = {}) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const fr = curve.computeFrenetFrames(seg, false), pos = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const u = i / seg, c = curve.getPointAt(u), N = fr.normals[i], B = fr.binormals[i], rr = r(u);
    for (let j = 0; j <= rad; j++) { const a = (j / rad) * Math.PI * 2; pos.push(c.x + (N.x * Math.cos(a) + B.x * Math.sin(a)) * rr, c.y + (N.y * Math.cos(a) + B.y * Math.sin(a)) * rr, c.z + (N.z * Math.cos(a) + B.z * Math.sin(a)) * rr); }
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) { const a = i * (rad + 1) + j, b = a + rad + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const cap = (i, flip) => { const c = curve.getPointAt(i / seg), ci = pos.length / 3; pos.push(c.x, c.y, c.z); for (let j = 0; j < rad; j++) { const a = i * (rad + 1) + j; flip ? idx.push(ci, a, a + 1) : idx.push(ci, a + 1, a); } };
  cap(0, false); cap(seg, true);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

/** Khung nhân vật dùng chung. Tên khớp cố định: hips, spine, chest, neck, head, shoulder/elbow/wrist L|R, hip/knee/ankle L|R. */
export function createBaseCharacter(THREE, spec = {}) {
  const sp = mergeSpec(NAM_SPEC, spec), C = sp.colors, mats = {};
  const M = (hex, rough = 0.78, extra = {}) => (mats[hex + rough] ||= new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: 0, ...extra }));
  const mesh = (geo, mat, parent, at = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1]) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(...at); m.rotation.set(...rot); m.scale.set(...scl);
    m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  };
  const joint = (parent, at, name) => { const g = new THREE.Group(); g.position.set(...at); g.name = name; parent.add(g); return g; };
  const sph = (r = 1, w = 48, h = 32) => new THREE.SphereGeometry(r, w, h);
  const cap = (r, len) => new THREE.CapsuleGeometry(r, len, 12, 28);
  // hạt dệt vải: DataTexture lặp (bumpMap) mô phỏng sợi ngang–dọc, nhẹ
  const wv = new Uint8Array(32 * 32 * 4);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const warp = (x % 4 < 2) ? 1 : 0, weft = (y % 4 < 2) ? 1 : 0, v = 150 + 70 * ((warp + weft) % 2) + 20 * Math.sin((x * 12.9898 + y * 78.233) * 43758.5453 % 6.28); wv.set([v, v, v, 255], (y * 32 + x) * 4); }
  const weave = new THREE.DataTexture(wv, 32, 32, THREE.RGBAFormat); weave.wrapS = weave.wrapT = THREE.RepeatWrapping; weave.repeat.set(40, 28); weave.magFilter = THREE.LinearFilter; weave.minFilter = THREE.LinearMipmapLinearFilter; weave.generateMipmaps = true; weave.needsUpdate = true;
  const cloth = (hex, sheen) => new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.92, metalness: 0, sheen: 0.45, sheenRoughness: 0.8, sheenColor: new THREE.Color(sheen), bumpMap: weave, bumpScale: 0.15 });
  /** Gợn sóng mép vải: dịch hướng kính ±amp (cm) với n gợn quanh vòng, trong dải `band` quanh cao độ yEdge (hình trụ/lathe trục y). */
  const ripple = (geo, yEdge, band, amp, n, phase = 0) => { const q = geo.attributes.position; for (let i = 0; i < q.count; i++) { const x = q.getX(i), y = q.getY(i), z = q.getZ(i), w = Math.max(0, 1 - Math.abs(y - yEdge) / band), r = Math.hypot(x, z) || 1, a = Math.atan2(x, z), d = amp * w * Math.sin(n * a + phase); q.setXYZ(i, x * (1 + d / r), y, z * (1 + d / r)); } geo.computeVertexNormals(); return geo; };
  const skinM = M(C.skin, 0.88), hairM = M(C.hair, 0.92), shirtM = cloth(C.shirt, '#9e9a97'), pantsM = cloth(C.pants, '#686665'), inkM = M(C.ink, 0.5);

  // ---------- khung xương ----------
  const root = new THREE.Group(); root.name = 'nam';
  const J = {};
  J.hips = joint(root, [0, 44, 0], 'hips');
  J.spine = joint(J.hips, [0, 3, 0], 'spine');               // y 47 = gấu áo
  J.chest = joint(J.spine, [0, 23, 0], 'chest');             // y 70
  J.neck = joint(J.chest, [0, 21, -0.5], 'neck');            // y 91
  J.head = joint(J.neck, [0, 3, 1.2], 'head');               // y ~94 = cằm
  for (const s of [1, -1]) {
    const k = s > 0 ? 'L' : 'R';
    J['shoulder' + k] = joint(J.chest, [s * 19.2, 12.2, -0.3], 'shoulder' + k);
    J['elbow' + k] = joint(J['shoulder' + k], [0, -18, 0], 'elbow' + k);
    J['wrist' + k] = joint(J['elbow' + k], [0, -15, 0], 'wrist' + k);
    J['hip' + k] = joint(J.hips, [s * 9.6, -4, 0], 'hip' + k);
    J['knee' + k] = joint(J['hip' + k], [0, -LEG.thigh, 0], 'knee' + k);
    J['ankle' + k] = joint(J['knee' + k], [0, -LEG.shin, 0], 'ankle' + k);
  }

  // ---------- áo thun ----------
  const prof = [[0, -2.6], [19.6, -2.6], [20.2, -1.3], [20.3, 0.6], [20.2, 8], [19.9, 18], [19.5, 27], [18.6, 32.5], [16.4, 37.0], [13.0, 40.4], [10.0, 42.6], [0, 43.4]]; // vai xuôi dần từ cổ, gấu rộng
  const torsoGeo = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 72);
  { // thân áo không đối xứng trước–sau: ngực phồng nhẹ về +z, ngực–vai (y 30..40) gọn lại, gấu rủ xòe mềm
    const tp = torsoGeo.attributes.position;
    for (let i = 0; i < tp.count; i++) {
      const x = tp.getX(i), y = tp.getY(i), z = tp.getZ(i);
      const chest = smooth(8, 20, y) * (1 - smooth(28, 38, y));             // ngực chùng xuống: độ đầy dồn thấp (vải rủ), không căng ở trên
      const belly = Math.exp(-(((y - 7) / 7) ** 2));                          // bụng hơi trễ
      const shoulder = smooth(26, 34, y) * (1 - smooth(42, 45.3, y));         // ngực–vai (y 28..42)
      const front = z > 0 ? 1 : 0.4;
      tp.setXYZ(i, x * (1 - 0.05 * shoulder), y, z * (1 + 0.07 * chest * front) + (0.8 * chest + 0.9 * belly) * (z > 0 ? 1 : 0.25));
    }
    torsoGeo.computeVertexNormals();
    // LatheGeometry nhân đôi đỉnh ở đường nối (phi = 0 và 2π): trộn pháp tuyến hai bên để không còn vạch dọc giữa ngực
    const nn = torsoGeo.attributes.normal, NP = prof.length, SEG = 72;
    for (let j = 0; j < NP; j++) {
      const i0 = j, i1 = SEG * NP + j;
      const nx = nn.getX(i0) + nn.getX(i1), ny = nn.getY(i0) + nn.getY(i1), nz = nn.getZ(i0) + nn.getZ(i1), L = Math.hypot(nx, ny, nz) || 1;
      nn.setXYZ(i0, nx / L, ny / L, nz / L); nn.setXYZ(i1, nx / L, ny / L, nz / L);
    }
  }
  { const tq = torsoGeo.attributes.position; for (let i = 0; i < tq.count; i++) { const x = tq.getX(i), y = tq.getY(i), z = tq.getZ(i), w = Math.max(0, 1 - Math.abs(y + 2.6) / 3.2), r = Math.hypot(x, z) || 1, d = 0.3 * w * Math.sin(11 * Math.atan2(x, z)); tq.setXYZ(i, x * (1 + d / r), y, z * (1 + d / r)); } } // gấu áo gợn ±0.3 cm (pháp tuyến giữ như đã trộn)
  mesh(torsoGeo, shirtM, J.spine, [0, 0, 0], [0, 0, 0], [1, 1, 0.76]);
  mesh(new THREE.TorusGeometry(9.9, 0.95, 16, 72), M('#646160', 0.95), J.chest, [0, 19.7, 0], [Math.PI / 2 + 0.04, 0, 0], [1, 0.76, 1]); // cổ áo: cùng độ dẹt z với thân áo (0.76), nằm sát mép trên thân áo // cổ áo bo
  mesh(new THREE.TorusGeometry(19.3, 0.6, 10, 72), M('#676462', 0.95), J.spine, [0, -2.1, 0], [Math.PI / 2, 0, 0], [1, 0.8, 1]);          // gấu áo (hạ 2.6 cm: trùm qua mép nối đùi)
  for (const k of ['L', 'R']) {
    const s = k === 'L' ? 1 : -1;
    // vai + tay áo: MỘT bề mặt Lathe liền khối (chỏm vai vồng tròn khép kín từ đỉnh khớp → ống tay áo → gấu bo vào), ép z 0.85
    const SL = sp.arm.sleeve, HEM = -(1.75 + SL.len);                                   // cao độ gấu tay áo (-12.75)
    const slTop = [[0, 2.0], [4.6, 1.75], [6.7, 0.9], [7.6, -0.8], [8.0, -3.2], [SL.bottom - 0.3, HEM + 5.2], [SL.bottom - 0.12, HEM + 1.2], [SL.bottom, HEM + 0.3], [SL.bottom - 0.35, HEM - 0.15], [SL.bottom - SL.curl * 0.7, HEM - 0.1], [SL.bottom - SL.curl, HEM + 0.35]];
    mesh(new THREE.LatheGeometry(slTop.slice().reverse().map(([r, y]) => new THREE.Vector2(r, y)), 64), shirtM, J['shoulder' + k], [-0.4 * s, 0, 0], [0, 0, SL.flare * s], [1, 1, 0.85]); // chỏm thấp, dời vào trong: ôm theo đường vai xuôi
    mesh(new THREE.CylinderGeometry(SL.bottom - SL.curl, SL.bottom - SL.curl, 0.4, 32), M('#3f3d3c', 0.95), J['shoulder' + k], [(-0.4 + Math.abs(HEM) * Math.sin(SL.flare)) * s, HEM + 0.9, 0], [0, 0, SL.flare * s], [1, 1, 0.85]); // lòng tay áo tối
    // tay: bắp tay, cẳng tay mập
    // tay liền mạch: thân ống cùng bán kính tại khuỷu + một khối cầu chung đúng tâm khớp, không đổi bán kính ở chỗ nối (hết ngấn thắt)
    const AR = sp.arm;
    mesh(new THREE.CylinderGeometry(AR.upper[0], AR.upper[1], AR.upperLen, 40, 1, true), skinM, J['shoulder' + k], [0, -AR.upperLen / 2, 0]); // bắp tay: vai → khuỷu
    mesh(sph(AR.elbow, 40, 28), skinM, J['elbow' + k], [0, 0, 0]);                                                                          // khớp khuỷu (bằng bán kính đáy bắp tay và đỉnh cẳng tay)
    mesh(new THREE.CylinderGeometry(AR.fore[0], AR.fore[1], AR.foreLen, 40, 1, true), skinM, J['elbow' + k], [0, -AR.foreLen / 2, 0]);        // cẳng tay thon dần về cổ tay
    mesh(sph(AR.fore[1] / 1.25, 32, 24), skinM, J['wrist' + k], [0, 0, 0]); // đúng tâm cổ tay; nhóm cổ tay phóng 1.25 nên chia lại để bán kính thật = đầu dưới cẳng tay
    // bàn tay tròn: lòng bàn tay + 4 ngón cong + ngón cái
    const H = J['wrist' + k]; H.scale.setScalar(1.25);
    // lòng bàn tay: hộp dẹt bo góc (rộng 6.5 cm theo trục z, dày 3.2 cm theo trục x, dài 7.8 cm theo trục y; chia 1.25 vì nhóm cổ tay phóng 1.25), nối thẳng từ tâm cổ tay
    const PW = 8.4 / 1.25, PL = 8.4 / 1.25, PD = 5.8 / 1.25;   // lòng bàn tay nới to (mẫu tay mập): rộng 8.4, dài 8.4, dày 5.8 cm
    mesh(sph(1, 40, 28), skinM, H, [0, 0.5 - PL / 2, 0], [0, 0, 0], [PD / 2 * 1.1, PL / 2 * 1.05, PW / 2]); // lòng bàn tay tròn đầy (ellipsoid), không vuông cạnh
    const FLEN = [2.8, 3.6, 3.3, 2.6];  // phân bậc độ dài ngón
    for (let f = 0; f < 4; f++) {
      const z = 2.4 - f * 1.6, cyl = FLEN[f];
      mesh(cap(1.3, cyl), skinM, H, [-0.9 * s, 0.5 - PL - cyl / 2 + 1.5, z], [0.1, 0, -0.55 * s]); // ngón co vào phía lòng bàn tay (hướng thân) thành nắm hờ, không xoè ra ngoài
    }
    mesh(cap(1.5, 2.8), skinM, H, [-1.9 * s, -3.8, 3.2], [-0.35, 0, 0.22 * s]); // ngón cái: gốc cạnh trước–trên, chúc xuống khép nhẹ về ngón trỏ
  }

  // ---------- quần ----------
  // khối chậu: rộng bằng mép ngoài hai đùi, dày bằng đùi, đáy háng thấp (y -9) nên đùi nối liền vào người; sau đầy tròn thành mông
  mesh(new THREE.SphereGeometry(1, 56, 40), pantsM, J.hips, [0, -2.0, -0.4], [0, 0, 0], [18.4, 9.0, 9.6]);
  for (const s of [1, -1]) mesh(new THREE.SphereGeometry(1, 40, 28), pantsM, J.hips, [s * 7.2, -5.0, -3.6], [0, 0, 0], [8.4, 7.6, 7.2]); // hai bầu mông
  for (const k of ['L', 'R']) {
    const s = k === 'L' ? 1 : -1;
    mesh(sph(9.3), pantsM, J['hip' + k], [0, 0, 0]);
    mesh(new THREE.CylinderGeometry(9.3, 9.3, LEG.thigh, 40, 1, true), pantsM, J['hip' + k], [0, -LEG.thigh / 2, 0]);
    mesh(sph(9.2), pantsM, J['knee' + k], [0, 0, 0]);
    mesh(ripple(ripple(new THREE.CylinderGeometry(9.2, 9.6, 12.6, 72, 6, true), -6.3, 1.8, 0.3, 9, s), 6.3, 1.5, 0.25, 7, 1), pantsM, J['knee' + k], [0, -6.3, 0]); // gấu quần và đầu gối gợn nhẹ
    mesh(new THREE.TorusGeometry(9.5, 0.55, 10, 48), M(C.pantsHem, 0.95), J['knee' + k], [0, -12.6, 0], [Math.PI / 2, 0, 0]);
    mesh(new THREE.CylinderGeometry(9.2, 9.2, 0.4, 36), M('#151515', 0.95), J['knee' + k], [0, -12.55, 0]);
    // cổ chân, bàn chân mập, ngón
    const A = J['ankle' + k];
    mesh(new THREE.CylinderGeometry(4.3, 4.1, 9, 24), skinM, A, [0, 0.6, 0]);                  // trụ cổ chân từ trong ống quần xuống mu bàn chân
    mesh(sph(4.1, 28, 20), skinM, A, [0, -3.5, 0.2]);                                           // cầu nối cổ chân đúng chỗ giao ống cổ chân ↔ mu bàn chân (mất góc gãy)
    const FT = new THREE.Group(); FT.position.z = 0.8; A.add(FT);                              // bàn chân + dép tiến nhẹ về +z
    mesh(sph(1), skinM, FT, [0.2 * s, -6.2, 6.2], [0.1, 0, 0], [5.2, 3.0, 10.6]);
    mesh(sph(1), skinM, FT, [0.2 * s, -6.6, -1.0], [0, 0, 0], [4.4, 3.4, 4.4]);                // gót chân tròn đầy, ngay sau cổ chân              // mu bàn chân dẹt, thuôn thấp dần về mũi
    const TR = [1.45, 1.3, 1.2, 1.1, 1.0];                                                     // ngón cái nhỏ lại cân đối, 4 ngón còn lại ngắn dần
    for (let t = 0; t < 5; t++) {
      const tx = s * (-3.2 + t * 1.6);
      mesh(sph(TR[t], 20, 14), skinM, FT, [0.2 * s + tx, -7.0 - 0.05 * t, (t === 0 ? 15.9 : 16.3) - 0.3 * t], [0, 0, 0], [1, 0.9, 1.15]);
    }
    const sole = mesh(slab(THREE, 14.5, 29.5, 1.5, 6.0), M(C.sole, 0.9), FT, [0.2 * s, -10.5, 7.0]);
    mesh(slab(THREE, 14.0, 29.0, 0.6, 5.8), M(C.slippers, 0.85), FT, [0.2 * s, -9.35, 7.0]);
    // quai dép chữ Y: đỉnh ở kẽ ngón cái–ngón trỏ (y -4.2, z 11.5), hai nhánh vắt nổi trên mu bàn chân rồi cắm xuống hai bên đế dép (±5.8, -8.5, 4.0)
    for (const side of [1, -1]) mesh(tube(THREE, [[0.2 * s - 2.2 * s, -4.2, 12.9], [0.2 * s - 2.2 * s * 0.3 + side * 3.2, -2.9, 9.4], [0.2 * s + side * 5.8, -8.5, 5.4]], () => 1.0, { seg: 20, rad: 10 }), M(C.slippers, 0.85), FT);
    void sole;
  }

  // ---------- cổ + đầu ----------
  mesh(cap(7.4, 4), skinM, J.neck, [0, 2.5, 0.4]);
  const { RX, RY, RZ, HC } = sp.head;
  const head = new THREE.Group(); head.name = 'headShape'; head.position.set(0, HC, 0); J.head.add(head);
  const skullGeo = sph(1, 96, 72);
  {
    const p = skullGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const fx = 0.86 + 0.36 * Math.exp(-((y + 0.45) ** 2) / 0.12) - 0.06 * smooth(0.3, 1, y); // má–hàm đầy, đỉnh thu
      const fz = z > 0 ? 0.94 + 0.08 * Math.exp(-((y + 0.35) ** 2) / 0.2) + 0.12 * Math.exp(-((y + 0.38) ** 2) / 0.14) + 0.05 * Math.exp(-((y + 0.62) ** 2) / 0.05) : 1.04; // môi–cằm đẩy nhẹ ra trước               // mặt trước hơi phẳng, gáy tròn
      if (y < -0.68) y = -0.68 + (y + 0.68) * (z > 0 ? 0.72 : 0.65);                                               // đáy cằm bầu, rộng
      const chinPush = z > 0 ? 0.20 * smooth(-0.32, -0.88, y) * smooth(0.95, 0.2, Math.abs(x)) : 0; // tịnh tiến +z ở hàm–cằm: cằm nhô ra trước khi nhìn nghiêng
      p.setXYZ(i, x * RX * fx, y * RY, z * RZ * fz + chinPush * RZ);
    }
    skullGeo.computeVertexNormals();
  }
  const skull = mesh(skullGeo, skinM, head);
  skull.updateMatrixWorld(true);
  // bắn tia lên mặt sọ để đặt chi tiết đúng mặt cong
  const ray = new THREE.Raycaster(), skullOnly = new THREE.Mesh(skullGeo);
  const surf = (x, y, dir = [0, 0, -1]) => {
    const d = new THREE.Vector3(...dir).normalize();
    ray.set(new THREE.Vector3(x, y, 0).addScaledVector(d, -80), d);
    const hit = ray.intersectObject(skullOnly, false)[0];
    return { p: hit.point, n: hit.face.normal.clone().normalize() };
  };
  const onFace = (parent, x, y, out = 0) => {
    const { p, n } = surf(x, y), g = new THREE.Group();
    g.position.copy(p).addScaledVector(n, out); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); parent.add(g); return g;
  };

  // mắt: viền đậm (khối tối lớn hơn phía sau) + tròng trắng + mí trên sụp + con ngươi nhỏ sát mí
  const EYE = sp.eye;
  for (const s of [1, -1]) {
    const g = onFace(head, s * EYE.x, EYE.y, -1.4);
    g.rotateY(-s * 0.08);
    mesh(sph(1), inkM, g, [0, 0, -0.3], [0, 0, 0], [EYE.w + 0.3, EYE.h + 0.3, 2.6]); // viền sau tròng: mỏng, không lộ dày khi nghiêng
    mesh(sph(1), M(C.eyeWhite, 0.35), g, [0, 0, 0.2], [0, 0, 0], [EYE.w, EYE.h, 3.0]);
    // mí trên: chỏm cầu màu da phủ ~42% trên, mép mí là nét đậm
    const lid = new THREE.Group(); lid.position.set(0, 0, 0.32); lid.scale.set(EYE.w * 1.02, EYE.h * 1.02, 3.1); lid.rotation.set(0.18, 0, s * 0.05); g.add(lid);
    const TH = Math.PI * EYE.lidTH;
    mesh(new THREE.SphereGeometry(1, 48, 18, 0, Math.PI * 2, 0, TH), M(C.skin, 0.6), lid);
    mesh(new THREE.TorusGeometry(Math.sin(TH), 0.085, 10, 64, Math.PI), inkM, lid, [0, Math.cos(TH), 0], [Math.PI / 2, 0, 0]);
    // con ngươi: chấm đen nhỏ ngay dưới mép mí, lệch nhẹ vào trong
    mesh(sph(1, 24, 16), inkM, g, [-s * 0.6, 0.4, 3.0], [0, 0, 0], [1.55, 1.55, 0.5]);
    mesh(sph(1, 12, 8), M('#ffffff', 0.2), g, [-s * 0.6 + 0.55, 0.85, 3.4], [0, 0, 0], [0.38, 0.38, 0.15]);
  }
  // mày dày bo tròn
  for (const s of [1, -1]) {
    const pts = [[s * 3.4, 6.5], [s * 8.8, 7.3], [s * 14.0, 6.6]].map(([x, y]) => { const { p, n } = surf(x, y); return p.clone().addScaledVector(n, 0.6).toArray(); });
    mesh(tube(THREE, pts, (u) => 1.55 * Math.sqrt(Math.sin(Math.PI * Math.min(1, Math.max(0, (u * 0.9 + 0.05))))) + 0.2, { seg: 24, rad: 16 }), M(C.hair, 0.85), head, [0, 0, 0], [0, 0, 0], [1, 1, 1]);
  }
  // nốt ruồi trên đuôi mày phải (trái màn hình)
  { const g = onFace(head, -6.4, 9.6, 0.3); mesh(sph(1.1, 16, 12), inkM, g, [0, 0, 0], [0, 0, 0], [1, 1, 0.6]); }
  // mũi cục tròn nhô + nét cánh mũi
  { const g = onFace(head, 0.6, -7.0, 0.9);
    mesh(sph(3.5), skinM, g, [0, 0, 0.6], [0, 0, 0], [1, 0.95, 1.05]);
    mesh(new THREE.TorusGeometry(1.5, 0.2, 8, 32, Math.PI * 1.1), inkM, g, [2.0, -0.4, 2.3], [0, 0.85, -Math.PI * 0.55]); }
  // miệng hé tròn: lòng miệng tối, răng trên, lưỡi, môi bo
  { const g = onFace(head, 0, -14.2, -0.6);
    mesh(sph(1), M(C.mouthIn, 0.7), g, [0, 0, 0], [0, 0, 0], sp.mouth.inner);
    mesh(sph(1, 24, 12), M(C.teeth, 0.4), g, [0, 1.4, 0.55], [0, 0, 0], sp.mouth.teeth);
    mesh(sph(1, 24, 12), M(C.tongue, 0.6), g, [0, -1.1, 0.5], [0, 0, 0], sp.mouth.tongue);
    if (sp.mouth.lip) mesh(new THREE.TorusGeometry(1, 0.17, 12, 64), M(C.lip, 0.6), g, [0, 0, 0.65], [0, 0, 0], sp.mouth.lip); } // theo file thiết kế: bỏ vòng môi (đặt spec.mouth.lip = [rx, ry, 1] nếu cần lại)
  // tai to
  for (const s of [1, -1]) {
    const { p } = surf(s * 30, -5.2, [-s, 0, 0]);
    const ear = new THREE.Group(); ear.position.copy(p); ear.position.z = -1.5; ear.rotation.set(0, s * 0.35, s * 0.05); head.add(ear);
    mesh(sph(1), skinM, ear, [s * 2.2, 0, 0], [0, 0, 0], [3.0, 6.8, 5.4]);
    mesh(sph(1), M(C.skinDeep, 0.7), ear, [s * 3.9, -0.35, 0.7], [0, 0, 0], [1.2, 3.9, 2.9]);
    mesh(tube(THREE, [[s * 4.25, 3.9, -1.0], [s * 4.75, 4.6, 2.0], [s * 4.5, 0.85, 3.55], [s * 4.1, -2.0, 2.55]], () => 0.64, { seg: 20, rad: 10 }), skinM, ear);
  }

  // ---------- tóc ----------
  // Khối chính là một vỏ trơn đầy (như mẫu): mép mái lượn có mũi nhọn dừng trên mày, tóc mai xuống trước tai,
  // trên tai cắt gọn để lộ tai, sau gáy phủ thấp. Các mảng mỏng đắp lên tạo rãnh giữa các lọn.
  const HS = sp.hair.HS;
  const shell = (az, el, k = 1.18) => [Math.sin(az) * Math.cos(el) * RX * k * HS.kx, Math.sin(el) * RY * k * HS.ky + HS.dy, Math.cos(az) * Math.cos(el) * RZ * k * HS.kz];
  const TIPS = [[-0.8, 0.2], [-0.05, 0.2], [0.5, 0.12]];        // [phương vị, nửa bề rộng] các mũi mái: ngắn, bo tròn, chừa khoảng hở trái để lộ nốt ruồi
  const hairline = (az) => {                                     // độ cao chân tóc (tỉ lệ) theo phương vị quanh đầu
    const A = Math.abs(az);
    const fringe = 0.69 - TIPS.reduce((m, [t, w]) => Math.max(m, 0.10 * Math.sqrt(Math.max(0, 1 - ((az - t) / w) ** 2))), 0); // chân tóc cao hơn mày, mũi mái bo tròn (nửa elip)
    const side = -0.3, nape = sp.hair.nape;
    let v = fringe;
    v += (side - v) * smooth(0.92, 1.06, A);                     // tóc mai hẹp trước tai
    const overEar = 0.16 - 0.38 * smooth(1.25, 2.0, A);          // trên tai: cao ở trước tai rồi lượn mềm xuống sau tai (không cắt ngang)
    v += (overEar - v) * smooth(1.12, 1.26, A);
    v += (nape - v) * smooth(sp.hair.napeFrom, sp.hair.napeTo, A);                       // sau gáy phủ thấp
    return v;
  };
  // rãnh giữa các lọn: đường chéo trên mái (giữa các mũi) và vài rãnh toả từ đỉnh ra sau
  const GROOVES = [[-0.8, -0.5], [-0.05, -0.5], [0.5, -0.45], [1.05, -0.3], [-1.05, -0.35], [1.7, 0.15, 0.02], [-1.7, -0.15, 0.02], [2.4, 0.12, 0.02], [-2.4, -0.12, 0.02]]; // rãnh sau lưng chỉ còn 2 đường nông; phân cụm tóc sau do các lobe đảm nhiệm // [phương vị ở mép, độ chéo khi lên đỉnh]
  const capGeo = sph(1, 288, 216);
  {
    const p = capGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const az = Math.atan2(x, z), A = Math.abs(az), line = hairline(az);
      const up = smooth(-0.1, 0.9, y);
      const wing = Math.exp(-((y - 0.35) ** 2) / 0.04) * Math.exp(-((A - 1.1) ** 2) / 0.08);
      const back = smooth(1.6, 2.6, A) * Math.exp(-((y - 0.25) ** 2) / 0.25);
      let k = sp.hair.base + 0.07 * up + 0.08 * wing + sp.hair.back * back + 0.08 * Math.exp(-((y - 0.55) ** 2) / 0.05) - 0.07 * smooth(0.78, 1, y) - 0.06 * smooth(0.25, -0.15, y) * smooth(0.7, 1.2, A); // đỉnh rộng bằng, hai bên dưới thu vào
      for (const [g0, sw, dep = 0.04] of GROOVES) { const back = Math.abs(g0) > 1.7; const ag = g0 + sw * (y - hairline(g0)); k -= dep * Math.exp(-(((az - ag) / 0.035) ** 2)) * (back ? smooth(line + 0.25, line + 0.45, y) : smooth(line - 0.02, line + 0.12, y)) * smooth(1.0, 0.75, y); }
      // mép tóc: không ép đỉnh về một vòng (gây tam giác dài mảnh/răng cưa); dưới chân tóc cho co dần vào trong sọ, mép dày bo tròn
      if (y < line) k = 1.02 * Math.max(0.78, 1 - 4.0 * (line - y));
      else { const e = smooth(line, line + 0.14, y); k = 1.02 + (k - 1.02) * e; }
      p.setXYZ(i, x * RX * k * HS.kx, y * RY * k * HS.ky + HS.dy, z * RZ * k * HS.kz);
    }
    capGeo.computeVertexNormals();
  }
  mesh(capGeo, hairM, head);

  // lọn đất sét đắp lên vỏ (dùng lobe): mỗi lọn là một mảng dẹt phồng, dày giữa, ngọn bo tròn
  const lock = (path, W, T, tipW = 0.3, fade = false, taper = false) => {
    const pts = path.map(([az, el, k]) => shell(az, el, k ?? 1.17));
    const endE = (u) => Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, u))), 0.4);   // bo tròn mềm về 0 ở cả hai đầu u→0 và u→1
    const wf = taper ? (u) => W * endE(u) * (u < 0.3 ? 1 : Math.pow(Math.max(0, 1 - (u - 0.3) / 0.7), 0.5)) // thuôn mượt về 0 hai đầu
      : (u) => W * (u < 0.35 ? 0.8 + 0.2 * u / 0.35 : Math.max(tipW, Math.sqrt(Math.max(0, 1 - ((u - 0.35) / 0.65) ** 2.2))));
    const tf = (u) => T * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, u * 0.9 + 0.1))) * (fade ? (u < 0.5 ? 1 : Math.pow(1 - (u - 0.5) / 0.5, 1.5)) : 1) * (taper ? endE(u) : 1); // fade: vuốt dày về 0 êm ở đoạn cuối (mất vạch bóng ngang)
    mesh(lobe(THREE, pts, wf, tf, [0, HS.dy, 0], { seg: 48, rad: 28 }), hairM, head);
  };
  // 3 dải mái bản to hất chéo sang phải màn hình (ngọn vuốt thuôn mềm), thêm 1 dải bên trái ôm xuống thái dương
  lock([[-0.95, 1.2], [-0.5, 1.04], [-0.05, 0.86], [0.42, 0.7]], 9.0, 5.3, 0.3, false, true);
  lock([[-0.35, 1.36], [0.15, 1.14], [0.62, 0.94], [0.98, 0.78]], 8.4, 5.3, 0.3, false, true);
  lock([[0.4, 1.38], [0.8, 1.16], [1.1, 0.96], [1.28, 0.78]], 7.4, 4.8, 0.3, false, true);
  // hai cánh tóc nhô nhẹ ở thái dương
  for (const s of [1, -1]) lock([[s * 1.0, 0.86], [s * 1.28, 0.6], [s * 1.42, 0.38], [s * 1.46, 0.24]], 5.0, 3.0, 0.4);
  // cánh tóc thái dương: gốc cắm sâu vào khối tóc, ôm dọc sọ (nhô ~55%), đầu tù tròn, nhích cao lên trên tai
  for (const s of [1, -1]) lock([[s * 0.85, 0.62, 1.1], [s * 1.08, 0.5, 1.18], [s * 1.24, 0.4, 1.25]], 7.8, 3.4, 0.7); // bản rộng, nhô nhẹ ra ngoài, gốc cắm sâu vào vỏ tóc
  // nửa sau đầu & gáy: 3 mảng lớn từ đỉnh xuống gáy (đầu bo tròn, dừng cao hơn chân tóc gáy nên không sinh tua rua)
  lock([[3.14, 1.32, 1.2], [3.14, 0.95, 1.27], [3.14, 0.5, 1.28], [3.14, 0.12, 1.22]], 9.0, 3.6, 0.55, true);
  for (const s of [1, -1]) {
    lock([[s * 2.45, 1.3, 1.18], [s * 2.55, 0.95, 1.26], [s * 2.62, 0.55, 1.27], [s * 2.66, 0.2, 1.2]], 8.2, 3.4, 0.55, true);
    lock([[s * 1.75, 1.25, 1.16], [s * 1.85, 0.9, 1.24], [s * 1.95, 0.52, 1.25], [s * 2.0, 0.2, 1.18]], 7.4, 3.2, 0.55, true);
  }
  // lọn xoắn trên đỉnh: dày hơn, cong vòng sang bên
  const top = shell(0.05, 1.36, 1.06);
  mesh(tube(THREE, [top, [top[0] + 0.3, top[1] + 4.4, top[2] + 0.2], [top[0] + 1.6, top[1] + 8.0, top[2] + 2.0], [top[0] + 4.2, top[1] + 9.6, top[2] + 5.0], [top[0] + 8.2, top[1] + 8.4, top[2] + 7.6], [top[0] + 9.6, top[1] + 5.4, top[2] + 6.8]],
    (u) => 6.8 * Math.pow(1 - u, 0.8) + 0.9, { seg: 48, rad: 24 }), hairM, head);

  // ---------- dáng ----------
  const rest = Object.fromEntries(Object.entries(J).map(([k, g]) => [k, g.rotation.clone()]));
  const pose = (P = {}) => {
    for (const [k, g] of Object.entries(J)) g.rotation.copy(rest[k]);
    const base = { spine: [0.05, 0, 0], chest: [0.03, 0, 0], shoulderL: [0.08, 0, 0.17], shoulderR: [0.08, 0, -0.17], elbowL: [-0.22, 0, -0.03], elbowR: [-0.22, 0, 0.03], neck: [-0.02, 0, 0], head: [-0.03, 0, 0], ankleL: [0, 0.1, 0], ankleR: [0, -0.1, 0] };
    for (const [k, r] of Object.entries({ ...base, ...P })) if (J[k]) J[k].rotation.set(...r);
  };
  pose();
  return { root, joints: J, pose, materials: mats };
}

/** Hộp bo góc (lòng bàn tay): w theo z, h theo y, d theo x; tâm ở gốc. */
function roundedBox(THREE, w, h, d, r) {
  const sh = new THREE.Shape(), x = -w / 2, y = -h / 2;
  sh.moveTo(x + r, y); sh.lineTo(x + w - r, y); sh.quadraticCurveTo(x + w, y, x + w, y + r); sh.lineTo(x + w, y + h - r);
  sh.quadraticCurveTo(x + w, y + h, x + w - r, y + h); sh.lineTo(x + r, y + h); sh.quadraticCurveTo(x, y + h, x, y + h - r);
  sh.lineTo(x, y + r); sh.quadraticCurveTo(x, y, x + r, y);
  const bev = Math.min(d * 0.35, 0.45), g = new THREE.ExtrudeGeometry(sh, { depth: Math.max(0.05, d - 2 * bev), bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 5, curveSegments: 12 });
  g.translate(0, 0, -(Math.max(0.05, d - 2 * bev)) / 2); g.rotateY(Math.PI / 2); g.computeVertexNormals();
  return g;
}

/** Tấm bo góc (đế dép), đáy ở y = 0. */
function slab(THREE, w, d, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d); s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelThickness: 0.35, bevelSize: 0.35, bevelSegments: 3, curveSegments: 14 });
  g.rotateX(-Math.PI / 2); g.computeVertexNormals();
  return g;
}

/** Tương thích: Nam là khung mẫu với thông số mặc định `NAM_SPEC`. */
export const buildNam = (THREE, spec = {}) => createBaseCharacter(THREE, spec);
