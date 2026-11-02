export function createCharacterHead(THREE, options = {}) {
  const { hairColor = 0x2858ad, eyeColor = 0x438fe8, skinColor = 0xffd1ad } = options;
  const head = new THREE.Group();
  const mat = (color, roughness = .62, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const skin = mat(skinColor);
  const hair = mat(hairColor, .42);
  const hairDark = mat(0x193875, .5);
  const hairLight = mat(0x477bd0, .38);
  const sclera = mat(0xfff8f2, .3);
  const iris = mat(eyeColor, .24);
  const pupil = mat(0x10182d, .2);
  const highlight = mat(0xffffff, .18);
  const brow = mat(0x18346e, .5);
  const blush = mat(0xe99b91, .7);
  const mouthMat = mat(0x99565c, .7);

  const add = (geometry, material, p, scale = null) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...p);
    if (scale) mesh.scale.set(...scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    head.add(mesh);
    return mesh;
  };
  const ball = (material, p, scale) =>
    add(new THREE.SphereGeometry(1, 32, 24), material, p, scale);

  // Neck and soft, slightly tapered anime face.
  add(new THREE.CylinderGeometry(.105, .12, .22, 20), skin, [0, 1.285, 0]);
  ball(skin, [0, 1.66, 0], [.385, .435, .335]);
  for (const side of [-1, 1]) {
    ball(skin, [side * .365, 1.625, -.005], [.075, .105, .065]);
  }
  // Small nose and subtle mouth, kept intentionally understated.
  ball(mat(0xe9ad91), [0, 1.555, .331], [.025, .022, .018]);
  const mouth = add(new THREE.TorusGeometry(.035, .0055, 6, 18, Math.PI), mouthMat, [0, 1.455, .328]);
  mouth.rotation.z = Math.PI;
  for (const side of [-1, 1]) {
    ball(blush, [side * .235, 1.50, .286], [.052, .021, .012]);
  }

  // Eyes shaped like anime eyes, not protruding spheres.
  for (const side of [-1, 1]) {
    const x = side * .145;
    ball(sclera, [x, 1.655, .286], [.098, .122, .047]);
    ball(iris, [x, 1.645, .324], [.065, .087, .025]);
    ball(pupil, [x, 1.64, .344], [.033, .065, .014]);
    ball(highlight, [x - .022, 1.681, .359], [.021, .027, .009]);
    ball(highlight, [x + .023, 1.625, .359], [.010, .013, .007]);
    const browMesh = add(new THREE.BoxGeometry(.105, .016, .018), brow, [x, 1.80, .292]);
    browMesh.rotation.z = side * -.12;
  }

  // Rear hair mass and crown. The cap sits behind the forehead, not over the eyes.
  ball(hairDark, [0, 1.91, -.085], [.405, .285, .335]);
  ball(hair, [0, 1.965, -.055], [.392, .245, .335]);
  // Side layers frame the cheeks and taper into pointed locks.
  const sideLock = (side, y, z, width, height, angle, material = hair) => {
    const shape = new THREE.Shape();
    shape.moveTo(-width * .55, height * .48);
    shape.quadraticCurveTo(-width * .75, height * .05, -width * .08, -height * .48);
    shape.quadraticCurveTo(width * .05, -height * .18, width * .55, height * .48);
    shape.quadraticCurveTo(0, height * .30, -width * .55, height * .48);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: .085, bevelEnabled: true, bevelSegments: 3,
      steps: 1, bevelSize: .025, bevelThickness: .025
    });
    const lock = add(geometry, material, [side * .31, y, z]);
    lock.rotation.z = angle * side;
    lock.rotation.y = side * -.08;
    return lock;
  };
  sideLock(-1, 1.69, -.015, .28, .48, -.20, hairDark);
  sideLock(1, 1.69, -.015, .28, .48, -.20, hairDark);
  sideLock(-1, 1.73, .075, .25, .42, -.25, hair);
  sideLock(1, 1.73, .075, .25, .42, -.25, hair);

  // Five broad, overlapping fringe locks swept diagonally across the forehead.
  const makeFringe = (x, y, z, w, h, lean, material = hair) => {
    const s = new THREE.Shape();
    s.moveTo(-w * .52, h * .48);
    s.bezierCurveTo(-w * .15, h * .62, w * .52, h * .50, w * .48, h * .16);
    s.bezierCurveTo(w * .38, -h * .05, w * .12, -h * .40, -w * .02, -h * .50);
    s.bezierCurveTo(-w * .12, -h * .30, -w * .32, h * .02, -w * .52, h * .48);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: .105, bevelEnabled: true, bevelSegments: 3,
      steps: 1, bevelSize: .022, bevelThickness: .022
    });
    const lock = add(g, material, [x, y, z]);
    lock.rotation.z = lean;
    return lock;
  };
  makeFringe(-.245, 1.84, .235, .23, .42, -.48, hairDark);
  makeFringe(-.13, 1.875, .275, .22, .46, -.25, hair);
  makeFringe(.005, 1.875, .285, .22, .43, .04, hairLight);
  makeFringe(.145, 1.85, .27, .23, .45, .28, hair);
  makeFringe(.27, 1.81, .225, .22, .40, .48, hairDark);

  // Distinct swept crown spikes, including the signature curved forelock.
  const spike = (x, y, z, width, height, angle, material = hair) => {
    const s = new THREE.Shape();
    s.moveTo(-width * .55, -height * .30);
    s.quadraticCurveTo(-width * .25, height * .32, 0, height * .5);
    s.quadraticCurveTo(width * .12, height * .05, width * .55, -height * .30);
    s.quadraticCurveTo(0, -height * .08, -width * .55, -height * .30);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: .10, bevelEnabled: true, bevelSegments: 3,
      steps: 1, bevelSize: .02, bevelThickness: .02
    });
    const m = add(g, material, [x, y, z]);
    m.rotation.z = angle;
  };
  spike(-.13, 2.04, -.10, .22, .38, -.48, hairLight);
  spike(.06, 2.07, -.10, .18, .34, .32, hair);
  spike(.20, 2.015, -.10, .16, .28, .72, hairDark);

  // Subtle painted-looking strand accents on the crown.
  for (const side of [-1, 1]) {
    const streak = add(new THREE.TorusGeometry(.16, .008, 5, 28, Math.PI * .72), hairLight,
      [side * .105, 1.99, .19]);
    streak.rotation.set(.12, side * .18, side * -.35);
  }

  head.userData.mouth = mouth;
  return head;
}
