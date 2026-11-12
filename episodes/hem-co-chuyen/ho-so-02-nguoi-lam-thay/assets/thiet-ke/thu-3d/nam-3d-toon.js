// NAM 3D — bản thử (Hồ sơ 02, 12/11/2026). Dựng thủ tục bằng three.js, đơn vị cm, trục y lên, mặt nhìn +z.
// Giữ nhận diện của bản 2D/2.5D đã chốt: đầu to tròn, tóc đen dựng có lọn xoắn trên đỉnh, kính tròn, mắt lờ đờ,
// nốt ruồi trên mày, tai to, áo thun, quần dài ống suông, dép xỏ ngón. Không viền ngoài; khối tách bằng sáng–tối
// (toon nhiều bậc, chuyển mềm), nét mặt (mày, mí, gọng kính) là khối mảnh tối màu.
// Tỉ lệ đo trên bảng `thu-2-5d/cac-goc.png` (cao 168 cm): đầu ~38 cm, vai ~51 cm, chân từ đáy quần ~63 cm.

export const NAM_COLORS = {
  skin: '#dbad82', skinShadow: '#bd8968', hair: '#292a29', shirt: '#8a8783', shirtDay: '#5c7a70',
  pants: '#515451', slippers: '#425850', sole: '#393e3c', ink: '#2a2524', mouth: '#5b3a32', eyeWhite: '#fbf7ee',
};

/** Dải toon mềm: 4 bậc, lọc tuyến tính để ranh giới sáng–tối chuyển dần (bóng mềm theo quy chuẩn 4.0). */
export function toonRamp(THREE, steps = [0.42, 0.62, 0.86, 1.0]) {
  const n = 64, data = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), k = Math.min(steps.length - 1, Math.floor(t * steps.length));
    // chuyển mềm trong 18% đầu mỗi bậc
    const t0 = k / steps.length, blend = Math.min(1, (t - t0) / (0.18 / steps.length));
    const prev = steps[Math.max(0, k - 1)], v = k === 0 ? steps[0] : prev + (steps[k] - prev) * blend;
    data.set([v * 255, v * 255, v * 255, 255], i * 4);
  }
  const tex = new THREE.DataTexture(data, n, 1, THREE.RGBAFormat);
  tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;
  return tex;
}

/** Ống thuôn theo đường cong (lọn tóc, mày, mí, gọng kính, quai dép). r(u) với u 0→1. */
export function taperTube(THREE, pts, r, { seg = 24, rad = 12, flat = 1 } = {}) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const fr = curve.computeFrenetFrames(seg, false);
  const pos = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const u = i / seg, c = curve.getPointAt(u), N = fr.normals[i], B = fr.binormals[i], rr = typeof r === 'function' ? r(u) : r;
    for (let j = 0; j <= rad; j++) {
      const a = (j / rad) * Math.PI * 2, cx = Math.cos(a) * rr, cy = Math.sin(a) * rr * flat;
      pos.push(c.x + N.x * cx + B.x * cy, c.y + N.y * cx + B.y * cy, c.z + N.z * cx + B.z * cy);
    }
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) {
    const a = i * (rad + 1) + j, b = a + rad + 1;
    idx.push(a, a + 1, b, b, a + 1, b + 1); // pháp tuyến hướng ra ngoài (T × hướng vòng)
  }
  // nắp hai đầu
  const capAt = (i, flip) => {
    const c = curve.getPointAt(i / seg), ci = pos.length / 3; pos.push(c.x, c.y, c.z);
    for (let j = 0; j < rad; j++) { const a = i * (rad + 1) + j; flip ? idx.push(ci, a, a + 1) : idx.push(ci, a + 1, a); }
  };
  capAt(0, false); capAt(seg, true);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export function buildNam(THREE, { shirt = NAM_COLORS.shirt, ramp } = {}) {
  const C = NAM_COLORS, grad = ramp || toonRamp(THREE);
  const mats = {};
  const M = (hex, opts = {}) => (mats[hex + JSON.stringify(opts)] ||= new THREE.MeshToonMaterial({ color: hex, gradientMap: grad, ...opts }));
  const flatM = (hex) => (mats['f' + hex] ||= new THREE.MeshBasicMaterial({ color: hex }));
  const mesh = (geo, mat, parent, at = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1]) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(...at); m.rotation.set(...rot); m.scale.set(...scl);
    m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  };
  const joint = (parent, at, name) => { const g = new THREE.Group(); g.position.set(...at); g.name = name; parent.add(g); return g; };
  const sph = (r = 1, w = 40, h = 28) => new THREE.SphereGeometry(r, w, h);
  const cap = (r, len) => new THREE.CapsuleGeometry(r, len, 10, 24);

  const root = new THREE.Group(); root.name = 'nam';
  const J = {};
  // ---------- khung xương ----------
  J.hips = joint(root, [0, 62, 0], 'hips');
  J.spine = joint(J.hips, [0, 4, 0], 'spine');
  J.chest = joint(J.spine, [0, 26, 0], 'chest');           // y≈92
  J.neck = joint(J.chest, [0, 22, -1], 'neck');             // y≈114
  J.head = joint(J.neck, [0, 0.8, 2.2], 'head');            // gốc đầu y≈116 (cằm sát cổ áo như bản 2D)
  for (const s of [1, -1]) {
    const k = s > 0 ? 'L' : 'R';
    J['shoulder' + k] = joint(J.chest, [s * 16.0, 13.5, -1], 'shoulder' + k);
    J['elbow' + k] = joint(J['shoulder' + k], [0, -25, 0], 'elbow' + k);
    J['wrist' + k] = joint(J['elbow' + k], [0, -23, 0], 'wrist' + k);
    J['hip' + k] = joint(J.hips, [s * 9.0, -2, 0], 'hip' + k);
    J['knee' + k] = joint(J['hip' + k], [0, -26, 0], 'knee' + k);
    J['ankle' + k] = joint(J['knee' + k], [0, -26.5, 0], 'ankle' + k);
  }

  // ---------- thân: áo thun (tiết diện bầu dục) ----------
  const shirtM = M(shirt), pantsM = M(C.pants), skinM = M(C.skin), hairM = M(C.hair);
  const torsoProfile = [[0, 0], [17.6, 0], [18.6, 1.2], [18.8, 8], [18.4, 18], [18.6, 30], [19.0, 40], [19.0, 43], [17.6, 47.0], [13.5, 50.4], [7.4, 52.0], [0, 52.3]];
  const torsoGeo = new THREE.LatheGeometry(torsoProfile.map(([r, y]) => new THREE.Vector2(r, y)), 64);
  mesh(torsoGeo, shirtM, J.spine, [0, -8, 0], [0, 0, 0], [1, 1, 0.64]);
  // cổ áo: vòng mảnh tối hơn một chút
  mesh(new THREE.TorusGeometry(6.6, 0.75, 12, 48), M(shade(shirt, 0.86)), J.chest, [0, 18.6, -1], [Math.PI / 2 - 0.12, 0, 0], [1, 0.78, 1]);
  // nếp bụng áo: hai nét cong mảnh (nếp chính như bản 2D)
  const onTorso = (th, y, out = 0.35) => { // điểm trên mặt áo: góc th (0 = trước), độ cao y (từ gốc lathe)
    let r = 18.6; for (let i = 1; i < torsoProfile.length; i++) if (y <= torsoProfile[i][1]) { const [r0, y0] = torsoProfile[i - 1], [r1, y1] = torsoProfile[i]; r = r0 + (r1 - r0) * (y - y0) / (y1 - y0); break; }
    r += out; return [Math.sin(th) * r, y - 8, Math.cos(th) * r * 0.64];
  };
  const fold = (pts) => mesh(taperTube(THREE, pts.map(([t, y]) => onTorso(t, y)), (u) => 0.32 * Math.sin(Math.PI * u) + 0.05, { seg: 20, rad: 6 }), flatM(shade(shirt, 0.62)), J.spine);
  fold([[-0.55, 11], [-0.2, 9.4], [0.25, 10.2]]);
  fold([[0.1, 6.2], [0.45, 5.4], [0.75, 6.6]]);

  // ---------- quần: hông + hai ống suông ----------
  const hipGeo = new THREE.LatheGeometry([[0, -6], [15, -6], [17.4, -3], [17.6, 1], [16.6, 4], [0, 4]].map(([r, y]) => new THREE.Vector2(r, y)), 48);
  mesh(hipGeo, pantsM, J.hips, [0, 0, 0], [0, 0, 0], [1, 1, 0.6]);
  for (const k of ['L', 'R']) {
    mesh(new THREE.CylinderGeometry(8.0, 8.4, 26, 32, 1, true), pantsM, J['hip' + k], [0, -13, 0]); // đùi
    mesh(sph(8.4), pantsM, J['hip' + k], [0, 0, 0]);
    mesh(sph(8.0), pantsM, J['knee' + k], [0, 0, 0]);                          // gối
    mesh(new THREE.CylinderGeometry(8.0, 8.3, 21.5, 32, 1, true), pantsM, J['knee' + k], [0, -10.6, 0]); // ống quần loe nhẹ
    mesh(new THREE.TorusGeometry(8.0, 0.55, 10, 40), M(shade(C.pants, 0.8)), J['knee' + k], [0, -21.2, 0], [Math.PI / 2, 0, 0]); // gấu
    mesh(new THREE.CylinderGeometry(7.7, 7.7, 0.6, 32), M(shade(C.pants, 0.55)), J['knee' + k], [0, -21.2, 0]); // lòng ống tối
    // cổ chân + bàn chân + dép
    mesh(cap(3.3, 6), skinM, J['ankle' + k], [0, 4.2, 0]);
    mesh(sph(1), skinM, J['ankle' + k], [0, -3.8, 4.4], [0.05, 0, 0], [4.6, 2.6, 10.2]);
    for (let t = 0; t < 4; t++) mesh(sph(1), skinM, J['ankle' + k], [-3.0 + t * 1.9 + (k === 'L' ? 0 : 0), -4.6, 13.6 - Math.abs(t - 1) * 0.6], [0, 0, 0], [1.05, 0.95, 1.1]);
    const sole = new THREE.Mesh(roundedSlab(THREE, 11.6, 27.5, 1.6, 4.6), M(C.sole));
    sole.position.set(0, -7.2, 4.6); sole.castShadow = sole.receiveShadow = true; J['ankle' + k].add(sole);
    const top = new THREE.Mesh(roundedSlab(THREE, 11.2, 27.0, 0.7, 4.4), M(C.slippers));
    top.position.set(0, -6.1, 4.6); top.receiveShadow = true; J['ankle' + k].add(top);
    // quai chữ V
    const s = k === 'L' ? 1 : -1;
    mesh(taperTube(THREE, [[0.2 * s, -5.2, 12.2], [3.6, -3.4, 7.4], [5.3, -5.4, 3.0]], 0.75, { seg: 14, rad: 8 }), M(C.slippers), J['ankle' + k]);
    mesh(taperTube(THREE, [[0.2 * s, -5.2, 12.2], [-3.4, -3.4, 7.4], [-5.2, -5.4, 3.0]], 0.75, { seg: 14, rad: 8 }), M(C.slippers), J['ankle' + k]);
  }

  // ---------- tay: tay áo ngắn + cánh tay da ----------
  for (const k of ['L', 'R']) {
    const s = k === 'L' ? 1 : -1;
    mesh(sph(7.3), shirtM, J['shoulder' + k], [-0.6 * s, -4.4, 0], [0, 0, 0], [1, 0.85, 0.9]);              // bả vai tròn, chìm vào thân
    mesh(new THREE.CylinderGeometry(7.4, 7.9, 13, 32, 1, false), shirtM, J['shoulder' + k], [0, -7.5, 0]); // tay áo
    mesh(new THREE.TorusGeometry(7.85, 0.5, 10, 40), M(shade(shirt, 0.8)), J['shoulder' + k], [0, -14, 0], [Math.PI / 2, 0, 0]);
    mesh(cap(4.7, 19), skinM, J['shoulder' + k], [0, -14.5, 0]);                                   // cánh tay
    mesh(cap(4.4, 17), skinM, J['elbow' + k], [0, -11.5, 0]);                                      // cẳng tay
    J['wrist' + k].scale.setScalar(1.3);
    // bàn tay hơi nắm: lòng bàn tay + ngón gộp + ngón cái
    mesh(sph(1), skinM, J['wrist' + k], [0, -4.6, 0.2], [0, 0, 0], [3.5, 5.0, 2.6]);
    mesh(sph(1), skinM, J['wrist' + k], [-0.6 * s * -1, -8.6, 0.9], [0.5, 0, 0], [3.2, 2.6, 2.4]);
    mesh(cap(1.3, 3.4), skinM, J['wrist' + k], [-3.0 * s * -1 * -1, -6.0, 1.8], [0.45, 0, 0.35 * s]);
  }

  // ---------- cổ + đầu ----------
  mesh(cap(6.9, 4), skinM, J.neck, [0, 2.2, 0.6]);
  const HEAD_SCALE = 1.2; // đầu to như mẫu (rộng ~ bằng thân áo)
  const head = new THREE.Group(); head.name = 'headShape'; head.position.set(0, 18.5 * HEAD_SCALE - 1.5, 0); head.scale.setScalar(HEAD_SCALE); J.head.add(head); // tâm hộp sọ
  const RX = 18.2, RY = 19.0, RZ = 17.4;
  const skullGeo = sph(1, 72, 54);
  { // biến dạng: hàm thu nhẹ, má đầy, sau gáy tròn
    const p = skullGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const low = smooth(0.0, -0.95, y);           // 0 ở giữa → 1 ở cằm
      x *= 1 - 0.09 * low * low; z *= 1 - 0.06 * low;
      const cheek = Math.exp(-((y + 0.35) ** 2) / 0.05) * smooth(0.1, 0.8, z) * smooth(0.3, 0.8, Math.abs(x));
      x *= 1 + 0.10 * cheek; z *= 1 + 0.05 * cheek;
      const mid = Math.exp(-((y + 0.15) ** 2) / 0.12) * smooth(0.2, 0.95, z) * Math.exp(-(x * x) / 0.25);
      z *= 1 + 0.07 * mid;                          // mặt giữa nhô ra trước (dáng nghiêng như mẫu)
      if (y < -0.6) y = -0.6 + (y + 0.6) * 0.7; // cằm bớt nhọn
      p.setXYZ(i, x * RX, y * RY, z * RZ);
    }
    skullGeo.computeVertexNormals();
  }
  mesh(skullGeo, skinM, head).receiveShadow = false;
  const faceZ = (x, y) => RZ * Math.sqrt(Math.max(0, 1 - (x / RX) ** 2 - (y / RY) ** 2));

  // tai to: bầu dục dẹt + vành trong tối
  for (const s of [1, -1]) {
    const ear = new THREE.Group(); ear.position.set(s * (RX - 1.6), -1.0, -0.6); ear.rotation.set(0, s * 0.45, s * -0.12); head.add(ear);
    mesh(sph(1), skinM, ear, [s * 2.2, 0, 0], [0, 0, 0], [3.0, 6.6, 4.9]);
    mesh(new THREE.TorusGeometry(2.4, 0.42, 8, 24, Math.PI * 1.3), M(C.skinShadow), ear, [s * 4.9, 0.3, 0.4], [0, s * Math.PI / 2, Math.PI * 0.35]);
  }

  // mắt lờ đờ + kính tròn
  const EYE_Y = 1.6, EYE_X = 6.0;
  for (const s of [1, -1]) {
    const ex = s * EYE_X, ez = faceZ(ex, EYE_Y);
    const eye = new THREE.Group(); eye.position.set(ex, EYE_Y, ez - 0.9); eye.rotation.set(-0.08, Math.asin(ex / RX) * 0.9, 0); head.add(eye);
    const er = [3.3, 3.5, 1.7];
    mesh(sph(1), M(C.eyeWhite), eye, [0, 0, 0], [0, 0, 0], er);
    mesh(sph(1), flatM('#171515'), eye, [s * -0.35, -0.75, 1.45], [0, 0, 0], [1.25, 1.35, 0.5]);    // con ngươi nhìn hơi xuống
    mesh(sph(1), flatM('#ffffff'), eye, [s * -0.0 + 0.35, -0.2, 1.75], [0, 0, 0], [0.33, 0.33, 0.12]); // chấm sáng
    // mí trên sụp ~45%: chỏm cầu màu da, nghiêng nhẹ; viền mí đen dày
    const lid = new THREE.Group(); lid.scale.set(er[0] * 1.07, er[1] * 1.07, er[2] * 1.12); lid.rotation.set(0.32, 0, s * -0.08); eye.add(lid);
    const TH = Math.PI * 0.43;
    mesh(new THREE.SphereGeometry(1, 40, 16, 0, Math.PI * 2, 0, TH), skinM, lid);
    mesh(new THREE.TorusGeometry(Math.sin(TH), 0.085, 8, 48, Math.PI), flatM(C.ink), lid, [0, Math.cos(TH), 0], [Math.PI / 2, 0, 0]);
    // mày: nét thuôn, đuôi hơi rủ
    const by = EYE_Y + 6.6;
    mesh(taperTube(THREE, [[s * 3.0, by - 0.2, faceZ(s * 3.0, by) + 0.15], [s * 6.4, by + 0.5, faceZ(s * 6.4, by + 0.5) + 0.15], [s * 9.6, by - 0.4, faceZ(s * 9.6, by - 0.4) + 0.1]],
      (u) => 0.95 - 0.3 * u, { seg: 18, rad: 10, flat: 0.7 }), flatM(C.hair), head);
    // gọng kính tròn
    const gz = faceZ(ex, EYE_Y) + 1.7;
    mesh(new THREE.TorusGeometry(4.9, 0.32, 10, 64), flatM('#1d1b1b'), head, [ex, EYE_Y - 0.2, gz], [0, Math.asin(ex / RX) * 0.55, 0]);
    // càng kính về tai
    mesh(taperTube(THREE, [[s * (EYE_X + 4.7), EYE_Y, gz - 1.0], [s * (RX - 0.4), EYE_Y + 0.4, 2.0], [s * (RX + 0.2), EYE_Y - 0.6, -5.5]], 0.26, { seg: 16, rad: 6 }), flatM('#1d1b1b'), head);
  }
  // cầu kính
  mesh(taperTube(THREE, [[-1.3, EYE_Y + 0.3, faceZ(1.3, EYE_Y) + 1.8], [0, EYE_Y + 0.8, RZ + 1.95], [1.3, EYE_Y + 0.3, faceZ(1.3, EYE_Y) + 1.8]], 0.28, { seg: 12, rad: 6 }), flatM('#1d1b1b'), head);
  // mũi nhỏ tròn + nét "c"
  mesh(sph(1), skinM, head, [0.4, -3.6, faceZ(0, -3.6) - 0.2], [0, 0, 0], [1.6, 1.4, 1.3]);
  mesh(new THREE.TorusGeometry(1.15, 0.17, 6, 24, Math.PI * 1.15), flatM(shade(C.skinShadow, 0.7)), head, [-0.4, -3.8, faceZ(0, -3.8) + 0.85], [0, 0, Math.PI * 0.45]);
  // miệng hé tròn
  mesh(sph(1), flatM(C.mouth), head, [0.3, -8.6, faceZ(0, -8.6) - 0.35], [0.15, 0, 0], [1.5, 1.05, 0.6]);
  // nốt ruồi trên mày trái (bên phải màn hình khi nhìn chính diện)
  mesh(sph(0.55, 12, 10), flatM('#3a2a24'), head, [-9.4, EYE_Y + 8.2, faceZ(9.4, EYE_Y + 8.2) + 0.1]);

  // ---------- tóc: một khối lớn gọn (như mẫu), mép mái gần ngang trên mày, đỉnh nhô cao, sau hất thành đuôi nhọn ----------
  const FRINGE = 0.47;                       // độ cao mép mái (tỉ lệ RY) — trên mày (mày ở ~0.4)
  const hairCap = sph(1, 96, 72);
  {
    const p = hairCap.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), ax = Math.abs(x);
      // chân tóc: giữa trán ngang ở FRINGE, sang thái dương thì xuống thành tóc mai trước tai
      const line = FRINGE - 0.34 * smooth(0.62, 0.93, ax);   // tóc mai ngắn: lộ má giữa tai và mắt
      const front = smooth(-0.3, 0.2, z);
      const nape = -0.5 - 0.16 * (1 - ax);                        // gáy phủ sát cổ, mép cong (giữa thấp)
      const minY = line * front + nape * (1 - front);
      const vis = smooth(minY - 0.05, minY + 0.03, y);           // 0 = chìm vào sọ, 1 = tóc
      // khối: đỉnh nhô cao và hơi phẳng, hai bên phồng trên tai, sau gáy đầy
      const up = smooth(0.15, 0.95, y);
      const hi = Math.exp(-((y - 0.55) ** 2) / 0.08);
      let kx = 1.10 + 0.10 * hi, ky = 1.08 + 0.16 * up - 0.06 * smooth(0.85, 1, y), kz = 1.09 + 0.05 * up + 0.16 * smooth(0, -0.9, z) * Math.exp(-((y - 0.45) ** 2) / 0.12);
      // vành mái dày lên một chút để mái nổi khỏi trán
      const rim = Math.exp(-((y - line) ** 2) / 0.004) * front;
      kz += 0.05 * rim; ky -= 0.02 * rim;
      // chừa tai
      const ear = smooth(0.82, 0.95, ax) * smooth(0.2, 0.05, y) * smooth(-0.62, -0.45, y) * smooth(-0.55, -0.3, z);
      const sink = 0.9;
      const f = (k) => sink + (k - sink) * vis * (1 - 0.85 * ear);
      p.setXYZ(i, x * RX * f(kx), y * RY * f(ky) + 0.4, z * RZ * f(kz) - 0.3);
    }
    hairCap.computeVertexNormals();
  }
  mesh(hairCap, hairM, head);
  // mũi tóc: vài mảng nhọn ở viền khối (không cắt qua mặt)
  const onHair = (az, el, out = 0) => {
    const k = 1.1 + out; return [Math.sin(az) * Math.cos(el) * RX * k, Math.sin(el) * RY * (k + 0.12) + 0.4, Math.cos(az) * Math.cos(el) * RZ * k - 0.3];
  };
  const lock = (az, el, d, len, r0, bend = [0, 0, 0], flat = 0.55) => {
    const b = onHair(az, el, -0.1), n = new THREE.Vector3(...d).normalize();
    const p1 = [b[0] + n.x * len * 0.5 + bend[0] * 0.4, b[1] + n.y * len * 0.5 + bend[1] * 0.4, b[2] + n.z * len * 0.5 + bend[2] * 0.4];
    const p2 = [b[0] + n.x * len + bend[0], b[1] + n.y * len + bend[1], b[2] + n.z * len + bend[2]];
    mesh(taperTube(THREE, [b, p1, p2], (u) => r0 * (1 - u) ** 1.3 + 0.05, { seg: 24, rad: 16, flat }), hairM, head);
  };
  // góc trên: hai mũi chĩa ra ngoài (dáng chính diện của mẫu: trái lên–ngoài, phải ngang–ra)
  lock(-0.95, 0.66, [-1, 0.35, 0.1], 8.0, 7.0, [0, 0.9, 0], 0.75);
  lock(1.0, 0.58, [1, -0.1, 0.15], 7.0, 6.4, [0, -0.6, 0], 0.75);
  // đuôi tóc sau đỉnh hất ra sau, mũi nhọn cong (dáng nghiêng của mẫu)
  lock(2.95, 0.5, [0, 0.1, -1], 11.0, 9.5, [0, -2.2, -0.6], 0.6);
  lock(-2.7, 0.4, [-0.25, -0.1, -1], 8.0, 8.0, [0, -2.0, 0], 0.6);
  // lọn xoắn trên đỉnh (dấu hiệu nhận diện)
  const cw = onHair(0.25, 1.2, -0.06);
  mesh(taperTube(THREE, [cw, [cw[0] + 0.4, cw[1] + 4.2, cw[2] + 0.2], [cw[0] + 2.8, cw[1] + 6.8, cw[2] - 0.2], [cw[0] + 4.9, cw[1] + 5.4, cw[2] - 0.5], [cw[0] + 4.0, cw[1] + 3.6, cw[2] - 0.5]],
    (u) => 2.1 * (1 - u) ** 0.7 + 0.25, { seg: 30, rad: 12 }), hairM, head);

  // ---------- dáng ----------
  const rest = Object.fromEntries(Object.entries(J).map(([k, g]) => [k, g.rotation.clone()]));
  /** Đặt dáng: góc (rad) cho từng khớp; thiếu khớp = dáng nghỉ. Dáng nghỉ: tay buông hơi mở như bản 2D. */
  const pose = (P = {}) => {
    for (const [k, g] of Object.entries(J)) g.rotation.copy(rest[k]);
    const base = {
      shoulderL: [0.04, 0, 0.1], shoulderR: [0.04, 0, -0.1], elbowL: [-0.12, 0, -0.02], elbowR: [-0.12, 0, 0.02],
      hipL: [0, 0, 0.02], hipR: [0, 0, -0.02], kneeL: [0, 0, -0.02], kneeR: [0, 0, 0.02], ankleL: [0, 0.12, 0], ankleR: [0, -0.12, 0],
      spine: [0.03, 0, 0], neck: [0.16, 0, 0], head: [-0.1, 0, 0],
    };
    for (const [k, r] of Object.entries({ ...base, ...P })) if (J[k]) J[k].rotation.set(...r);
  };
  pose();
  return { root, joints: J, pose, materials: mats };
}

/** Tấm bo góc (đế dép): rộng w, dài d, dày h, bo r. */
function roundedSlab(THREE, w, d, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d); s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 3, curveSegments: 12 });
  g.rotateX(-Math.PI / 2); g.translate(0, 0, 0); g.computeVertexNormals();
  return g;
}

export function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(Math.min(255, v * k)));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}
