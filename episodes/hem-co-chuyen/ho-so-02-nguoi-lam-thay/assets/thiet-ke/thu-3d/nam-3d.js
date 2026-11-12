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
  hair: { HS: { kx: 1.05, ky: 0.92, kz: 1.06, dy: 2.5 }, base: 1.17, back: 0.12, nape: -0.75, napeFrom: 1.6, napeTo: 2.35 },
};
const mergeSpec = (base, over = {}) => Object.fromEntries(Object.keys({ ...base, ...over }).map((k) => [k, (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) ? mergeSpec(base[k], over[k]) : (over[k] ?? base[k])]));

/** Chiều dài chân (cm) cho động tác: hông → gối → cổ chân. */
export const LEG = { thigh: 15, shin: 14.5 };

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Mảng dẹt bám mặt cong (lọn tóc đất sét, mày): bề rộng w(u) nằm trên mặt, bề dày t(u) theo pháp tuyến ra khỏi `center`. */
export function lobe(THREE, pts, w, t, center, { seg = 28, rad = 20 } = {}) {
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
  const skinM = M(C.skin, 0.88), hairM = M(C.hair, 0.92), shirtM = M(C.shirt, 0.95), pantsM = M(C.pants, 0.95), inkM = M(C.ink, 0.5);

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
    J['shoulder' + k] = joint(J.chest, [s * 19.0, 13.5, -0.5], 'shoulder' + k);
    J['elbow' + k] = joint(J['shoulder' + k], [0, -18, 0], 'elbow' + k);
    J['wrist' + k] = joint(J['elbow' + k], [0, -15, 0], 'wrist' + k);
    J['hip' + k] = joint(J.hips, [s * 9.6, -4, 0], 'hip' + k);
    J['knee' + k] = joint(J['hip' + k], [0, -LEG.thigh, 0], 'knee' + k);
    J['ankle' + k] = joint(J['knee' + k], [0, -LEG.shin, 0], 'ankle' + k);
  }

  // ---------- áo thun ----------
  const prof = [[0, -2.6], [18.7, -2.6], [19.4, -1.3], [19.8, 0.6], [19.9, 8], [19.8, 20], [19.6, 30], [18.8, 37], [16.2, 41.2], [11.5, 44], [8.6, 45], [0, 45.3]];
  mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 72), shirtM, J.spine, [0, 0, 0], [0, 0, 0], [1, 1, 0.8]);
  mesh(new THREE.TorusGeometry(8.6, 1.05, 14, 56), M('#646160', 0.95), J.chest, [0, 21.6, -0.4], [Math.PI / 2 - 0.1, 0, 0], [1, 0.86, 1]); // cổ áo bo
  mesh(new THREE.TorusGeometry(19.3, 0.6, 10, 72), M('#676462', 0.95), J.spine, [0, -2.1, 0], [Math.PI / 2, 0, 0], [1, 0.8, 1]);          // gấu áo (hạ 2.6 cm: trùm qua mép nối đùi)
  for (const k of ['L', 'R']) {
    const s = k === 'L' ? 1 : -1;
    mesh(sph(8.2), shirtM, J['shoulder' + k], [-1.8 * s, -2.2, 0], [0, 0, 0], [0.92, 0.85, 0.9]);             // vai tròn
    const SL = sp.arm.sleeve, L2 = SL.len / 2;
    // ống tay áo: Lathe liền một mảnh. Đỉnh nhỏ hơn cầu vai (cắm sâu vào cầu, không hở), nở dần ra gấu rồi bo vào trong ~1.5 cm
    const slProf = [[SL.top - 1.3, L2 + 2.6], [SL.top - 1.0, L2 + 0.4], [SL.top + (SL.bottom - SL.top) * 0.45, 0], [SL.bottom - 0.12, -L2 + 1.2], [SL.bottom, -L2 + 0.3], [SL.bottom - 0.35, -L2 - 0.15], [SL.bottom - SL.curl * 0.7, -L2 - 0.1], [SL.bottom - SL.curl, -L2 + 0.35]];
    mesh(new THREE.LatheGeometry(slProf.slice().reverse().map(([r, y]) => new THREE.Vector2(r, y)), 56), shirtM, J['shoulder' + k], [0.5 * s, -(1.75 + L2), 0], [0, 0, SL.flare * s]);
    mesh(new THREE.CylinderGeometry(SL.bottom - SL.curl, SL.bottom - SL.curl, 0.4, 32), M('#3f3d3c', 0.95), J['shoulder' + k], [(0.5 + L2 * Math.sin(SL.flare)) * s, -(1.75 + SL.len) + 0.9, 0], [0, 0, SL.flare * s]); // lòng tay áo tối
    // tay: bắp tay, cẳng tay mập
    // tay liền mạch: thân ống cùng bán kính tại khuỷu + một khối cầu chung đúng tâm khớp, không đổi bán kính ở chỗ nối (hết ngấn thắt)
    const AR = sp.arm;
    mesh(new THREE.CylinderGeometry(AR.upper[0], AR.upper[1], AR.upperLen, 40, 1, true), skinM, J['shoulder' + k], [0, -AR.upperLen / 2, 0]); // bắp tay: vai → khuỷu
    mesh(sph(AR.elbow, 40, 28), skinM, J['elbow' + k], [0, 0, 0]);                                                                          // khớp khuỷu (bằng bán kính đáy bắp tay và đỉnh cẳng tay)
    mesh(new THREE.CylinderGeometry(AR.fore[0], AR.fore[1], AR.foreLen, 40, 1, true), skinM, J['elbow' + k], [0, -AR.foreLen / 2, 0]);        // cẳng tay thon dần về cổ tay
    mesh(sph(AR.fore[1] / 1.25, 32, 24), skinM, J['wrist' + k], [0, 0, 0]); // đúng tâm cổ tay; nhóm cổ tay phóng 1.25 nên chia lại để bán kính thật = đầu dưới cẳng tay
    // bàn tay tròn: lòng bàn tay + 4 ngón cong + ngón cái
    const H = J['wrist' + k]; H.scale.setScalar(1.25);
    mesh(sph(1), skinM, H, [0, -3.8, 0.3], [0, 0, 0], [3.4, 5.0, 4.6]); // gốc bàn tay cắm sâu vào cầu cổ tay
    for (let f = 0; f < 4; f++) {
      const z = 3.1 - f * 2.05;
      mesh(cap(1.25, 2.6), skinM, H, [-0.9 * s, -9.6 + Math.abs(f - 1.5) * 0.45, z], [0.12, 0, 0.32 * s]);
    }
    mesh(cap(1.35, 2.6), skinM, H, [-2.6 * s, -5.6, 3.8], [0.6, 0, 0.5 * s]);
  }

  // ---------- quần ----------
  mesh(new THREE.LatheGeometry([[0, -3], [16.8, -3], [17.2, 0], [17.0, 3], [15.6, 6], [0, 6]].map(([r, y]) => new THREE.Vector2(r, y)), 56), pantsM, J.hips, [0, -1, 0], [0, 0, 0], [1, 1, 0.78]);
  for (const k of ['L', 'R']) {
    const s = k === 'L' ? 1 : -1;
    mesh(sph(9.3), pantsM, J['hip' + k], [0, 0, 0]);
    mesh(new THREE.CylinderGeometry(9.3, 9.3, LEG.thigh, 40, 1, true), pantsM, J['hip' + k], [0, -LEG.thigh / 2, 0]);
    mesh(sph(9.2), pantsM, J['knee' + k], [0, 0, 0]);
    mesh(new THREE.CylinderGeometry(9.2, 9.6, 12.6, 40, 1, true), pantsM, J['knee' + k], [0, -6.3, 0]);
    mesh(new THREE.TorusGeometry(9.5, 0.55, 10, 48), M(C.pantsHem, 0.95), J['knee' + k], [0, -12.6, 0], [Math.PI / 2, 0, 0]);
    mesh(new THREE.CylinderGeometry(9.2, 9.2, 0.4, 36), M('#151515', 0.95), J['knee' + k], [0, -12.55, 0]);
    // cổ chân, bàn chân mập, ngón
    const A = J['ankle' + k];
    mesh(cap(4.2, 4), skinM, A, [0, 2.6, 0]);
    const FT = new THREE.Group(); FT.position.z = 0.8; A.add(FT);   // bàn chân + dép tiến nhẹ về +z cho mũi và gót bè vững
    mesh(sph(1), skinM, FT, [0.2 * s, -6.2, 4.8], [0.04, 0, 0], [6.1, 3.7, 12.4]);
    for (let t = 0; t < 5; t++) {
      const r = t === 0 ? 1.75 : 1.35 - t * 0.08;
      mesh(sph(r, 20, 14), skinM, FT, [s * (-2.9 + t * 1.75) * -1 * -1 * (s > 0 ? 1 : 1) + (s > 0 ? 0 : 0), -7.4, 14.4 - Math.abs(t - 0.6) * 0.75], [0, 0, 0], [1, 0.85, 1.1]);
    }
    const sole = mesh(slab(THREE, 14.5, 32.5, 1.5, 6.0), M(C.sole, 0.9), FT, [0.2 * s, -10.5, 4.8]);
    mesh(slab(THREE, 14.0, 32.0, 0.6, 5.8), M(C.slippers, 0.85), FT, [0.2 * s, -9.35, 4.8]);
    for (const side of [1, -1]) mesh(tube(THREE, [[0, -7.8, 13.6], [side * 3.4, -5.4, 9.0], [side * 6.0, -8.6, 4.4]], () => 0.9, { seg: 18, rad: 10 }), M(C.slippers, 0.85), FT);
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
      if (y < -0.68) y = -0.68 + (y + 0.68) * 0.65;                                               // đáy cằm bầu, rộng
      const chinPush = z > 0 ? 0.20 * smooth(-0.18, -0.72, y) * smooth(0.95, 0.2, Math.abs(x)) : 0; // tịnh tiến +z ở hàm–cằm: cằm nhô ra trước khi nhìn nghiêng
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
  const lock = (path, W, T, tipW = 0.3, fade = false) => {
    const pts = path.map(([az, el, k]) => shell(az, el, k ?? 1.17));
    const wf = (u) => W * (u < 0.35 ? 0.8 + 0.2 * u / 0.35 : Math.max(tipW, Math.sqrt(Math.max(0, 1 - ((u - 0.35) / 0.65) ** 2.2))));
    const tf = (u) => T * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, u * 0.9 + 0.1))) * (fade ? (u < 0.5 ? 1 : Math.pow(1 - (u - 0.5) / 0.5, 1.5)) : 1); // fade: vuốt dày về 0 êm ở đoạn cuối (mất vạch bóng ngang)
    mesh(lobe(THREE, pts, wf, tf, [0, HS.dy, 0], { seg: 36, rad: 28 }), hairM, head);
  };
  // 4 lọn mái hất chéo sang phải màn hình (từ trái–đỉnh xuống phải–trán)
  lock([[-0.95, 1.18], [-0.5, 1.02], [-0.02, 0.84], [0.32, 0.7]], 6.6, 3.6, 0.5);
  lock([[-0.45, 1.34], [0.0, 1.12], [0.45, 0.92], [0.78, 0.76]], 6.2, 3.6, 0.5);
  lock([[0.2, 1.38], [0.62, 1.16], [0.98, 0.94], [1.22, 0.78]], 5.8, 3.4, 0.5);
  lock([[-1.35, 1.0], [-1.1, 0.88], [-0.82, 0.76]], 5.4, 3.2, 0.5);
  // hai cánh tóc nhô nhẹ ở thái dương
  for (const s of [1, -1]) lock([[s * 1.0, 0.86], [s * 1.28, 0.6], [s * 1.42, 0.38], [s * 1.46, 0.24]], 5.0, 3.0, 0.4);
  // cánh tóc thái dương: gốc cắm sâu vào khối tóc, ôm dọc sọ (nhô ~55%), đầu tù tròn, nhích cao lên trên tai
  for (const s of [1, -1]) lock([[s * 0.85, 0.62, 1.08], [s * 1.08, 0.5, 1.15], [s * 1.24, 0.4, 1.21]], 7.6, 2.4, 0.7); // bản rộng, nhô nhẹ ra ngoài, gốc cắm sâu vào vỏ tóc
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
    const base = { shoulderL: [0.03, 0, 0.12], shoulderR: [0.03, 0, -0.12], elbowL: [-0.1, 0, -0.04], elbowR: [-0.1, 0, 0.04], neck: [0.06, 0, 0], head: [-0.02, 0, 0], ankleL: [0, 0.1, 0], ankleR: [0, -0.1, 0] };
    for (const [k, r] of Object.entries({ ...base, ...P })) if (J[k]) J[k].rotation.set(...r);
  };
  pose();
  return { root, joints: J, pose, materials: mats };
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
