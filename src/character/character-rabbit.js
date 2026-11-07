// Cute sticker-style bunny hero for Arnemetia.
// Built from simple rounded shapes: bold dark outlines, flat colors and expressive joints.
export function createRabbitCharacter(THREE, gender = 'female') {
  const root = new THREE.Group();
  const ink = 0x24202b;
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({
    color, roughness: 1, metalness: 0, ...extra
  });
  const outlineMat = new THREE.MeshBasicMaterial({ color: ink, side: THREE.BackSide });
  const white = mat(0xfff4e8), pink = mat(0xf29caf), blush = mat(0xffb5bd);
  const dark = mat(ink), eye = mat(0x211c29), outfit = mat(0x91c9a8);
  const gold = mat(0xffd36e), mouthMat = mat(0x8c5260);
  const addOutlined = (parent, geometry, material, position, scale = [1,1,1]) => {
    const group = new THREE.Group();
    group.position.set(...position);
    const back = new THREE.Mesh(geometry, outlineMat);
    back.scale.set(scale[0] * 1.075, scale[1] * 1.075, scale[2] * 1.075);
    group.add(back);
    const front = new THREE.Mesh(geometry, material);
    front.scale.set(...scale);
    front.position.z = .012;
    group.add(front);
    front.castShadow = true;
    parent.add(group);
    return group;
  };
  const sphere = new THREE.SphereGeometry(1, 20, 16);
  const capsule = (r, l) => new THREE.CapsuleGeometry(r, l, 4, 10);

  // Body and head pivots
  const body = new THREE.Group(); body.position.y = .78; root.add(body);
  addOutlined(body, capsule(.27,.28), outfit, [0,0,0], [1,.95,.78]);
  const belly = addOutlined(body, sphere, white, [0,-.04,.19], [.18,.22,.07]);

  const headPivot = new THREE.Group(); headPivot.position.set(0,1.28,.015); root.add(headPivot);
  addOutlined(headPivot, sphere, white, [0,0,0], [.48,.43,.39]);
  // Face: big shiny eyes, cheek stickers and tiny mouth
  for (const side of [-1,1]) {
    addOutlined(headPivot, sphere, eye, [side*.17,-.035,.344], [.052,.075,.035]);
    addOutlined(headPivot, sphere, mat(0xffffff), [side*.185,-.005,.376], [.016,.021,.012]);
    addOutlined(headPivot, sphere, blush, [side*.285,-.15,.31], [.075,.035,.018]);
  }
  addOutlined(headPivot, sphere, pink, [0,-.13,.371], [.035,.025,.018]);
  const mouth = new THREE.Group(); mouth.position.set(0,-.205,.36); headPivot.add(mouth);
  addOutlined(mouth, sphere, mouthMat, [0,0,0], [.035,.012,.009]);

  // Long floppy ears with independent pivots; inner pink panels sit on the front.
  const ears = [];
  for (const side of [-1,1]) {
    const ear = new THREE.Group();
    ear.position.set(side*.22,.31,-.015);
    ear.rotation.z = side * -.12;
    headPivot.add(ear);
    addOutlined(ear, capsule(.105,.43), white, [0,.28,0], [.82,1.15,.62]);
    addOutlined(ear, capsule(.052,.36), pink, [0,.29,.205], [.78,1.05,.22]);
    ears.push(ear);
  }

  // Arms pivot from shoulders; paws are rounded mitten shapes.
  const arms = [], legs = [];
  for (const side of [-1,1]) {
    const arm = new THREE.Group(); arm.position.set(side*.29,.94,.015); root.add(arm);
    addOutlined(arm, capsule(.075,.19), white, [0,-.13,.015], [.9,1,.9]);
    addOutlined(arm, sphere, white, [0,-.27,.055], [.09,.075,.085]);
    arms.push(arm);

    const leg = new THREE.Group(); leg.position.set(side*.14,.48,.015); root.add(leg);
    addOutlined(leg, capsule(.085,.19), white, [0,-.13,.015], [1,1,.9]);
    addOutlined(leg, sphere, pink, [0,-.25,.10], [.105,.055,.12]);
    legs.push(leg);
  }

  // Puffy tail and tiny hair tuft
  addOutlined(root, sphere, white, [0,.66,-.25], [.13,.13,.12]);
  addOutlined(headPivot, sphere, white, [-.08,.39,-.08], [.10,.10,.10]);
  addOutlined(root, sphere, gold, [0,.88,.255], [.09,.07,.025]);

  root.userData.gender = gender;
  root.userData.race = 'bunny';
  root.userData.weaponPivot = new THREE.Group();
  root.userData.weaponPivot.position.set(.38,1.02,0);
  root.add(root.userData.weaponPivot);
  root.userData.animParts = { body, head: headPivot, ears, arms, legs, tail: root.children[root.children.length-3] };
  root.userData.animate = (time, moving, attacking = false) => {
    const stride = moving ? time * 11 : time * 2.2;
    const swing = moving ? Math.sin(stride) : 0;
    body.position.y = .78 + (moving ? Math.abs(Math.sin(stride))*.055 : Math.sin(time*2.2)*.012);
    body.rotation.z = moving ? Math.sin(stride)*.035 : Math.sin(time*1.5)*.018;
    headPivot.rotation.z = moving ? -swing*.035 : Math.sin(time*1.7)*.025;
    headPivot.position.y = 1.28 + (moving ? Math.abs(Math.sin(stride))*.025 : 0);
    ears[0].rotation.z = -.12 - swing*.12;
    ears[1].rotation.z = .12 + swing*.12;
    arms[0].rotation.x = moving ? swing*.65 : (attacking ? -.8 : Math.sin(time*1.8)*.035);
    arms[1].rotation.x = moving ? -swing*.65 : (attacking ? .8 : -Math.sin(time*1.8)*.035);
    legs[0].rotation.x = moving ? swing*.78 : 0;
    legs[1].rotation.x = moving ? -swing*.78 : 0;
  };
  return root;
}
