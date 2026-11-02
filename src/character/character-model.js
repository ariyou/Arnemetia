import { createCharacterHead } from './character-head.js';
import { createRabbitCharacter } from './character-rabbit.js';

export function createCharacterModel(THREE, gender = 'male') {
  if (gender === 'female') return createRabbitCharacter(THREE);
  const root = new THREE.Group();
  const female = false;
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
  add(new THREE.CylinderGeometry(.205, .285, .62, 10, 1), tunic, [0, .88, 0]);
  ball(tunic, [0, 1.16, 0], [.245, .12, .235]);
  add(new THREE.CylinderGeometry(.28, .29, .09, 10), tunicShade, [0, .565, 0]);
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
  const capeBack = add(new THREE.ConeGeometry(.39, .66, 5), cape, [0, .88, -.25]);
  capeBack.rotation.x = -.12;
  for (const side of [-1, 1]) {
    const shoulderCape = add(new THREE.BoxGeometry(.39, .10, .43), cape, [side * .22, 1.18, -.015]);
    shoulderCape.rotation.z = side * -.13;
    const goldEdge = add(new THREE.BoxGeometry(.39, .025, .44), gold, [side * .22, 1.125, -.005]);
    goldEdge.rotation.z = side * -.13;
  }
  ball(gold, [0, 1.17, .205], [.065, .065, .035]);

  // Leather belt, square buckle and one side pouch.
  capsule(leather, [0, .72, .015], .045, .52, [0, 0, Math.PI / 2]);
  box(gold, [0, .72, .255], [.13, .12, .035]);
  box(leather, [0, .72, .277], [.075, .065, .02]);
  box(leather, [.29, .72, .015], [.18, .22, .18], [0, 0, -.08]);
  box(leatherDark, [.29, .72, .115], [.15, .16, .025]);
  box(gold, [.29, .82, .13], [.08, .025, .025]);

  // Detailed standalone anime head module.
  const characterHead = createCharacterHead(THREE, {
    hairColor: colors.hair,
    eyeColor: colors.eye
  });
  root.add(characterHead);

  // Simple sword carried diagonally on the back.
  const sword = new THREE.Group();
  sword.position.set(.30, 1.25, -.30);
  sword.rotation.z = -.62; sword.rotation.x = -.08;
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
  return root;
}
