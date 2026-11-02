export function createCharacterModel(THREE, gender = 'male') {
  const root = new THREE.Group();
  const female = gender === 'female';
  const colors = female
    ? { cloth: 0x7650a8, trim: 0xe9d7ff, hair: 0xb9a0e8, darkHair: 0x8060b8, eye: 0x8b55d8 }
    : { cloth: 0x315d9d, trim: 0xe8f1ff, hair: 0x3158a8, darkHair: 0x20386f, eye: 0x4b91e8 };
  const material = (color, metalness = 0, roughness = .72) =>
    new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const skin = material(0xffd2b2);
  const cloth = material(colors.cloth);
  const trim = material(colors.trim, .35, .4);
  const hair = material(colors.hair);
  const hairDark = material(colors.darkHair);
  const gold = material(0xe7bd62, .65, .3);
  const boots = material(0x302b45);
  const eyes = material(colors.eye, .1, .25);
  const white = material(0xffffff);
  const add = (geometry, mat, position, scale, parent = root) => {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(...position);
    if (scale) mesh.scale.set(...scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const sphere = (mat, p, s) => add(new THREE.SphereGeometry(1, 18, 14), mat, p, s);
  const capsule = (mat, p, radius, length, rotation = [0, 0, 0]) => {
    const mesh = add(new THREE.CapsuleGeometry(radius, length, 5, 10), mat, p);
    mesh.rotation.set(...rotation);
    return mesh;
  };

  // Boots, legs and layered torso
  for (const x of [-.19, .19]) {
    capsule(boots, [x, .27, 0], .105, .34);
    sphere(boots, [x, .12, .08], [.14, .09, .22]);
  }
  capsule(cloth, [0, .82, 0], .29, .43);
  sphere(trim, [0, .84, .17], [.23, .27, .07]);
  capsule(trim, [0, .62, 0], .3, .12);
  // Shoulder mantle and scarf
  for (const x of [-.29, .29]) {
    sphere(trim, [x, 1.08, 0], [.18, .15, .18]);
    capsule(cloth, [x * 1.16, .87, 0], .085, .32, [0, 0, x > 0 ? -.35 : .35]);
    sphere(skin, [x * 1.16, .66, .02], [.105, .105, .105]);
    capsule(gold, [x, .99, .02], .035, .16, [0, 0, x > 0 ? -.35 : .35]);
  }
  // Oversized anime head
  sphere(skin, [0, 1.48, 0], [.39, .43, .34]);
  // Hair cap and side locks
  sphere(hair, [0, 1.72, -.045], [.405, .28, .37]);
  for (const x of [-.34, .34]) {
    capsule(hairDark, [x, 1.48, -.12], .105, .42, [0, 0, x > 0 ? -.18 : .18]);
    sphere(hair, [x * .82, 1.76, .02], [.13, .19, .14]);
  }
  // Fringe pieces across forehead
  for (let i = -2; i <= 2; i++) {
    const lock = sphere(hair, [i * .115, 1.66 - Math.abs(i) * .025, .27], [.095, .19, .105]);
    lock.rotation.z = i * -.13;
  }
  if (female) {
    for (const x of [-.3, .3]) {
      capsule(hair, [x, 1.16, -.13], .12, .62, [0, 0, x > 0 ? -.08 : .08]);
      sphere(hair, [x, .83, -.13], [.13, .16, .13]);
    }
    // Hair ribbon
    sphere(gold, [.28, 1.82, -.02], [.09, .055, .07]);
    sphere(trim, [.37, 1.79, -.02], [.11, .045, .035]);
    sphere(trim, [.2, 1.79, -.02], [.11, .045, .035]);
  } else {
    const ahoge = capsule(hair, [.04, 1.98, .03], .045, .2, [0, 0, -.35]);
    ahoge.rotation.x = -.3;
  }
  // Large anime eyes, highlights and mouth
  for (const x of [-.15, .15]) {
    sphere(white, [x, 1.49, .302], [.09, .115, .045]);
    sphere(eyes, [x, 1.49, .342], [.055, .082, .025]);
    sphere(material(0x171b31), [x, 1.49, .363], [.027, .055, .012]);
    sphere(white, [x - .018, 1.525, .375], [.018, .022, .01]);
  }
  const mouth = add(new THREE.BoxGeometry(.075, .012, .012), material(0x9d5965), [0, 1.34, .337]);
  // Belt, buckle, pouches and gold accents
  capsule(gold, [0, .68, .02], .035, .48, [0, 0, Math.PI / 2]);
  sphere(gold, [0, .68, .22], [.09, .09, .035]);
  for (const x of [-.32, .32]) {
    sphere(boots, [x, .73, .02], [.09, .12, .1]);
    sphere(gold, [x, .73, .11], [.045, .05, .025]);
  }
  // Cape behind the body
  const cape = add(new THREE.ConeGeometry(.39, .78, 5), cloth, [0, .83, -.29]);
  cape.rotation.x = -.12;
  const capeEdge = add(new THREE.TorusGeometry(.31, .025, 6, 18, Math.PI), gold, [0, .45, -.29]);
  capeEdge.rotation.x = Math.PI;
  // Weapon and shoulder emblem
  const weaponPivot = new THREE.Group();
  weaponPivot.position.set(.42, .83, .12);
  root.add(weaponPivot);
  add(new THREE.BoxGeometry(.055, .52, .045), trim, [0, .29, 0], null, weaponPivot);
  add(new THREE.BoxGeometry(.25, .045, .07), gold, [0, .06, 0], null, weaponPivot);
  sphere(gold, [-.29, 1.08, .16], [.07, .07, .04]);
  root.userData.weaponPivot = weaponPivot;
  root.userData.gender = gender;
  root.userData.animParts = { cape, mouth };
  return root;
}
