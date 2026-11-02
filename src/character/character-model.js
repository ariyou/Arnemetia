export function createCharacterModel(THREE, gender = 'male') {
  const root = new THREE.Group();
  const female = gender === 'female';
  const colors = female
    ? { cape: 0x7650a8, hair: 0xb9a0e8, eye: 0x9a6bdc }
    : { cape: 0x315da8, hair: 0x2858ad, eye: 0x438fe8 };
  const mat = (color, roughness = .76, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const skin = mat(0xffd1ad), tunic = mat(0xf0eee8), tunicShade = mat(0xd5dce8);
  const cape = mat(colors.cape), capeDark = mat(female ? 0x503779 : 0x203d76);
  const hair = mat(colors.hair, .48), hairShade = mat(female ? 0x8060b8 : 0x193875, .55);
  const leather = mat(0x65452f), leatherDark = mat(0x392d2b);
  const trousers = mat(0x29334b), boot = mat(0x443b3a), gold = mat(0xd9b568, .38, .48);
  const eyeWhite = mat(0xfffaf5, .3), iris = mat(colors.eye, .28), pupil = mat(0x10172a, .25);
  const mouthMat = mat(0x9d5960);
  const add = (geometry, material, p, s = null, parent = root) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...p);
    if (s) mesh.scale.set(...s);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh);
    return mesh;
  };
  const ball = (material, p, s) => add(new THREE.SphereGeometry(1, 24, 18), material, p, s);
  const capsule = (material, p, radius, length, rot = [0, 0, 0]) => {
    const mesh = add(new THREE.CapsuleGeometry(radius, length, 5, 12), material, p);
    mesh.rotation.set(...rot); return mesh;
  };
  const box = (material, p, s, rot = [0, 0, 0]) => {
    const mesh = add(new THREE.BoxGeometry(...s), material, p);
    mesh.rotation.set(...rot); return mesh;
  };

  // Compact semi-chibi silhouette: short sturdy legs and a large expressive head.
  for (const x of [-.17, .17]) {
    capsule(trousers, [x, .43, 0], .105, .48);
    capsule(boot, [x, .16, .035], .115, .16);
    ball(boot, [x, .105, .105], [.14, .085, .22]);
    box(leather, [x, .25, .035], [.24, .055, .22]);
    box(gold, [x, .25, .15], [.055, .035, .025]);
  }

  // Simple cream tunic with a modest front opening.
  capsule(tunic, [0, .91, 0], .285, .48);
  ball(tunic, [0, .69, .015], [.29, .18, .23]);
  box(tunicShade, [0, 1.02, .235], [.105, .39, .025]);
  for (let i = 0; i < 3; i++) {
    const y = 1.12 - i * .095;
    box(leatherDark, [0, y, .255], [.12, .018, .018], [0, 0, .45]);
  }

  // Short sleeves, bare forearms and simple dark wrist guards.
  for (const side of [-1, 1]) {
    capsule(tunic, [side * .32, .96, 0], .12, .25, [0, 0, side * -.28]);
    capsule(skin, [side * .39, .70, .035], .085, .22, [0, 0, side * -.12]);
    capsule(leatherDark, [side * .405, .57, .04], .09, .09);
    ball(skin, [side * .41, .49, .055], [.09, .09, .085]);
  }

  // Blue shoulder capelet and short back cape.
  const capelet = add(new THREE.CylinderGeometry(.30, .43, .31, 8, 1, true), cape, [0, 1.20, -.015]);
  capelet.rotation.y = Math.PI / 8;
  const capeBack = add(new THREE.ConeGeometry(.34, .54, 5), capeDark, [0, .91, -.20]);
  capeBack.rotation.x = -.12;
  for (const side of [-1, 1]) {
    const edge = box(gold, [side * .23, 1.15, .015], [.34, .035, .31]);
    edge.rotation.z = side * -.10;
  }
  ball(gold, [0, 1.18, .255], [.075, .075, .035]);

  // Leather belt, square buckle and one side pouch.
  capsule(leather, [0, .72, .015], .045, .52, [0, 0, Math.PI / 2]);
  box(gold, [0, .72, .255], [.13, .12, .035]);
  box(leather, [0, .72, .277], [.075, .065, .02]);
  box(leather, [.29, .72, .015], [.18, .22, .18], [0, 0, -.08]);
  box(leatherDark, [.29, .72, .115], [.15, .16, .025]);
  box(gold, [.29, .82, .13], [.08, .025, .025]);

  // Head and neck.
  capsule(skin, [0, 1.31, 0], .10, .12);
  ball(skin, [0, 1.66, 0], [.405, .435, .35]);
  for (const side of [-1, 1]) ball(skin, [side * .39, 1.63, -.005], [.075, .105, .07]);

  // Blue layered hair, with separated swept bangs that stay above the eyes.
  ball(hairShade, [0, 1.91, -.055], [.415, .27, .36]);
  ball(hair, [0, 1.96, -.015], [.405, .245, .355]);
  for (const side of [-1, 1]) {
    capsule(hairShade, [side * .34, 1.70, -.12], .075, .30, [0, 0, side * -.12]);
    ball(hair, [side * .34, 1.86, .005], [.13, .18, .13]);
  }
  const fringe = [
    [-.27, 1.83, .245, .095, .19, -.34],
    [-.14, 1.88, .292, .085, .18, -.18],
    [0, 1.89, .31, .085, .17, .04],
    [.14, 1.87, .292, .09, .18, .20],
    [.27, 1.82, .245, .10, .20, .36]
  ];
  for (const [x, y, z, width, height, angle] of fringe) {
    const lock = add(new THREE.ConeGeometry(width, height, 7), hair, [x, y, z]);
    lock.rotation.z = Math.PI + angle;
  }
  const tuft = add(new THREE.ConeGeometry(.105, .30, 8), hair, [-.12, 2.12, -.015]);
  tuft.rotation.z = .48;

  // Anime eyes with iris, pupil and highlights.
  for (const side of [-1, 1]) {
    ball(eyeWhite, [side * .15, 1.66, .306], [.105, .13, .052]);
    ball(iris, [side * .15, 1.65, .35], [.071, .096, .027]);
    ball(pupil, [side * .15, 1.645, .372], [.036, .067, .015]);
    ball(eyeWhite, [side * .15 - .023, 1.69, .386], [.022, .027, .01]);
    const brow = box(hairShade, [side * .15, 1.82, .30], [.105, .018, .02]);
    brow.rotation.z = side * -.10;
  }
  const mouth = add(new THREE.TorusGeometry(.032, .006, 5, 16, Math.PI), mouthMat, [0, 1.49, .345]);
  mouth.rotation.z = Math.PI;

  // Simple sword carried diagonally on the back.
  const sword = new THREE.Group();
  sword.position.set(.22, 1.27, -.245);
  sword.rotation.z = -.34; sword.rotation.x = -.10;
  root.add(sword);
  add(new THREE.BoxGeometry(.09, .44, .07), leatherDark, [0, .18, 0], null, sword);
  add(new THREE.BoxGeometry(.045, .23, .045), leather, [0, -.13, .01], null, sword);
  add(new THREE.BoxGeometry(.27, .045, .09), gold, [0, .02, .015], null, sword);
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(-.075, 0); bladeShape.lineTo(.075, 0);
  bladeShape.lineTo(.052, .66); bladeShape.lineTo(0, .82);
  bladeShape.lineTo(-.052, .66); bladeShape.closePath();
  const blade = new THREE.ExtrudeGeometry(bladeShape, {
    depth: .025, bevelEnabled: true, bevelSegments: 1, steps: 1,
    bevelSize: .008, bevelThickness: .008
  });
  add(blade, mat(0xb9d8ee, .25, .55), [0, .39, -.02], null, sword);

  root.userData.weaponPivot = sword;
  root.userData.gender = gender;
  root.userData.animParts = { cape: capeBack, mouth };
  return root;
}
