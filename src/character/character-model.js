export function createCharacterModel(THREE, gender = 'male') {
  const root = new THREE.Group();
  const female = gender === 'female';
  const palette = female
    ? { coat: 0x7650a8, light: 0xe9d7ff, hair: 0xb9a0e8, shadowHair: 0x8060b8, eye: 0x8b55d8 }
    : { coat: 0x254f91, light: 0xeaf3ff, hair: 0x2453a4, shadowHair: 0x172e65, eye: 0x3c8fe8 };
  const mat = (color, metalness = 0, roughness = .72) =>
    new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const skin = mat(0xffd2b2), coat = mat(palette.coat), light = mat(palette.light, .12, .5);
  const hair = mat(palette.hair, .04, .48), hairShade = mat(palette.shadowHair);
  const gold = mat(0xf0c66e, .68, .28), leather = mat(0x49364a), bootMat = mat(0x252a43);
  const eyeWhite = mat(0xfffbf5), iris = mat(palette.eye, .12, .25), pupil = mat(0x11172c);
  const blush = mat(0xe99b91), mouthMat = mat(0x874b58);
  const add = (geometry, material, p, s = null, parent = root) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...p);
    if (s) mesh.scale.set(...s);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh);
    return mesh;
  };
  const ball = (material, p, s) => add(new THREE.SphereGeometry(1, 24, 18), material, p, s);
  const capsule = (material, p, radius, length, rot = [0,0,0]) => {
    const m = add(new THREE.CapsuleGeometry(radius, length, 6, 12), material, p);
    m.rotation.set(...rot); return m;
  };
  const taperedLock = (p, radius, length, rot, material = hair) => {
    const m = add(new THREE.ConeGeometry(radius, length, 8), material, p);
    m.rotation.set(...rot); return m;
  };

  // Boots and fitted trousers
  for (const x of [-.18, .18]) {
    capsule(leather, [x, .36, 0], .105, .34);
    ball(bootMat, [x, .13, .09], [.145, .105, .23]);
    ball(gold, [x, .23, .19], [.075, .035, .025]);
  }
  // Short adventurer jacket, front panels and hem
  capsule(coat, [0, .83, 0], .285, .42);
  ball(light, [0, .86, .19], [.205, .25, .105]);
  const leftPanel = add(new THREE.BoxGeometry(.12, .39, .045), coat, [-.105, .79, .267]);
  leftPanel.rotation.z = -.12;
  const rightPanel = add(new THREE.BoxGeometry(.12, .39, .045), coat, [.105, .79, .267]);
  rightPanel.rotation.z = .12;
  capsule(gold, [0, .62, .015], .027, .51, [0,0,Math.PI/2]);
  ball(gold, [0, .65, .285], [.075,.075,.035]);
  for (const y of [.78,.9,1.02]) ball(gold, [.13,y,.286], [.018,.018,.012]);

  // Neck, scarf and shoulder armor
  capsule(skin, [0, 1.19, 0], .105, .12);
  capsule(light, [0, 1.17, .025], .13, .09);
  const scarfTail = add(new THREE.BoxGeometry(.13,.34,.055), coat, [-.17,.98,.19]);
  scarfTail.rotation.z = -.24;
  for (const x of [-.29,.29]) {
    ball(light, [x,1.08,0], [.17,.13,.17]);
    ball(gold, [x,1.09,.13], [.105,.09,.075]);
    capsule(coat, [x*1.12,.86,0], .085,.29,[0,0,x>0?-.28:.28]);
    ball(leather,[x*1.12,.68,.035],[.095,.09,.1]);
    ball(skin,[x*1.12,.61,.04],[.085,.085,.085]);
  }

  // Large soft chibi head
  ball(skin,[0,1.53,0],[.405,.43,.345]);
  // Hair silhouette: rounded crown, back layer, sideburns and separated pointed fringe
  ball(hairShade,[0,1.69,-.105],[.405,.315,.34]);
  ball(hair,[0,1.76,-.055],[.405,.265,.355]);
  for (const x of [-.34,.34]) {
    capsule(hairShade,[x,1.49,-.16],.075,.30,[0,0,x>0?-.12:.12]);
    taperedLock([x*.88,1.66,.005],.115,.30,[0,0,x>0?-.32:.32],hair);
  }
  // Distinct swept bangs, ending above the eyes instead of covering them
  const bangs = [
    [-.27,1.70,.245,.13,.30,-.24],
    [-.14,1.75,.285,.12,.28,-.10],
    [0,1.76,.30,.115,.27,.08],
    [.14,1.73,.285,.12,.29,.23],
    [.27,1.68,.24,.13,.27,.34]
  ];
  for (const [x,y,z,r,h,angle] of bangs) {
    taperedLock([x,y,z],r,h,[0,0,Math.PI+angle],hair);
  }
  // Two small swept crown tufts
  taperedLock([-.11,1.98,-.015],.105,.29,[0,0,.55],hair);
  taperedLock([.08,1.99,-.02],.09,.25,[0,0,.25],hairShade);

  // Anime eyes: white sclera, colored iris, dark pupil and two catchlights
  for (const x of [-.155,.155]) {
    ball(eyeWhite,[x,1.535,.306],[.112,.132,.052]);
    ball(iris,[x,1.525,.35],[.073,.095,.028]);
    ball(pupil,[x,1.52,.372],[.038,.067,.016]);
    ball(eyeWhite,[x-.025,1.565,.386],[.023,.029,.012]);
    ball(eyeWhite,[x+.027,1.49,.385],[.012,.014,.008]);
    const brow = add(new THREE.BoxGeometry(.105,.018,.025),hairShade,[x,1.685,.31]);
    brow.rotation.z = x<0?.12:-.12;
  }
  for (const x of [-.245,.245]) ball(blush,[x,1.405,.285],[.052,.022,.012]);
  const mouth = add(new THREE.TorusGeometry(.035,.006,5,16,Math.PI),mouthMat,[0,1.36,.339]);
  mouth.rotation.z = Math.PI;
  // Back cape with gold clasp and split tails
  const cape = add(new THREE.ConeGeometry(.43,.78,5),coat,[0,.83,-.29]);
  cape.rotation.x = -.16;
  ball(gold,[0,1.12,-.05],[.075,.075,.045]);
  for (const x of [-.19,.19]) {
    const tail = add(new THREE.BoxGeometry(.19,.42,.045),coat,[x,.43,-.23]);
    tail.rotation.z = x<0?-.12:.12;
    ball(gold,[x,.23,-.20],[.035,.035,.025]);
  }
  // Belt pouches and shoulder insignia
  for (const x of [-.31,.31]) {
    ball(leather,[x,.69,.06],[.085,.105,.10]);
    ball(gold,[x,.69,.15],[.045,.05,.025]);
  }
  const insignia = add(new THREE.OctahedronGeometry(.075),gold,[-.29,1.08,.19]);
  insignia.rotation.z = Math.PI/4;

  // Sword held at the right side
  const weaponPivot = new THREE.Group();
  weaponPivot.position.set(.43,.79,.12); root.add(weaponPivot);
  add(new THREE.CylinderGeometry(.025,.032,.22,8),leather,[0,.08,0],null,weaponPivot);
  add(new THREE.BoxGeometry(.24,.045,.065),gold,[0,.2,0],null,weaponPivot);
  add(new THREE.BoxGeometry(.075,.49,.035),light,[0,.49,0],null,weaponPivot);
  add(new THREE.ConeGeometry(.055,.16,4),light,[0,.81,0],null,weaponPivot);
  ball(gold,[0,.25,.01],[.055,.055,.055]);

  root.userData.weaponPivot = weaponPivot;
  root.userData.gender = gender;
  root.userData.animParts = { cape, mouth, scarfTail };
  return root;
}
