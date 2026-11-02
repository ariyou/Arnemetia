// Arnemetia alien sword-user. Entire silhouette is integrated biomechanical
// anatomy: no cloth, face, ears, tail, or human facial features.
export function createAlienCharacter(THREE, gender = 'male') {
  const root = new THREE.Group();
  const mat = (color, roughness = .48, metalness = .28, emissive = 0x000000, intensity = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity: intensity });
  const core = mat(0x171725, .62, .18);
  const armor = mat(0xd9d8ed, .32, .55);
  const armorLight = mat(0xf1efff, .26, .48);
  const armorShade = mat(0x77758f, .38, .52);
  const violet = mat(0x9b55ff, .24, .4, 0x8b35ff, 2.1);
  const slitMat = mat(0xb78cff, .22, .25, 0x9c55ff, 1.25);
  const bladeMat = mat(0xc9d7f7, .2, .72);
  const darkBlade = mat(0x29233e, .3, .65);

  const add = (geo, material, p, s = null, parent = root) => {
    const m = new THREE.Mesh(geo, material);
    m.position.set(...p);
    if (s) m.scale.set(...s);
    m.castShadow = true; m.receiveShadow = true; parent.add(m);
    return m;
  };
  const orb = (material, p, s) => add(new THREE.SphereGeometry(1, 28, 20), material, p, s);
  const capsule = (material, a, b, radius, radius2 = radius) => {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    const delta = new THREE.Vector3().subVectors(end, start);
    const mesh = add(new THREE.CylinderGeometry(radius2, radius, delta.length(), 12, 1), material,
      start.clone().add(end).multiplyScalar(.5).toArray());
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), delta.normalize());
    orb(material, a, [radius,radius,radius]);
    orb(material, b, [radius2,radius2,radius2]);
    return mesh;
  };
  const plate = (points, material, depth = .055, bevel = .025) => {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i=1;i<points.length;i++) shape.lineTo(points[i][0],points[i][1]);
    shape.closePath();
    return add(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:8}),material,[0,0,0]);
  };

  // Core anatomy, with slightly broader male shoulder span but same species silhouette.
  const shoulder = gender === 'male' ? .43 : .385;
  orb(core,[0,1.02,0],[.235,.39,.155]);
  orb(core,[0,.68,0],[.22,.19,.15]);
  orb(core,[0,1.31,0],[.105,.16,.105]);
  orb(core,[0,1.42,0],[.205,.235,.19]); // sealed, featureless head shell
  // Helmet shell: swept crown and cheek guards, no eyes, mouth, ears or face.
  orb(armor,[0,1.49,-.015],[.205,.20,.19]);
  const crown = plate([[-.18,1.49],[-.13,1.68],[-.04,1.76],[.035,1.70],[.15,1.66],[.18,1.51],[.10,1.39],[-.10,1.38]],armorLight,.10,.035);
  crown.position.z=.105;
  // One short horn on character's left (viewer sees it on the right in front view).
  const hornCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.14,1.59,.02), new THREE.Vector3(-.23,1.67,.015),
    new THREE.Vector3(-.29,1.72,-.005), new THREE.Vector3(-.30,1.77,-.025)
  ]);
  add(new THREE.TubeGeometry(hornCurve,20,.047,10,false),armorLight,[0,0,0]);
  // Opposite-side subtle sensor seam: a narrow recessed glow, not an eye.
  const seam = add(new THREE.BoxGeometry(.012,.075,.012),slitMat,[.145,1.48,.174]);
  seam.rotation.z=-.24;
  // Neck and torso armor, layered as integrated exoskeleton plates.
  orb(armor,[0,1.20,.012],[.205,.205,.17]);
  plate([[-.18,1.31],[-.12,1.43],[0,1.48],[.12,1.43],[.18,1.31],[.10,1.17],[0,1.11],[-.10,1.17]],armorLight,.075,.025).position.z=.145;
  plate([[-.13,1.23],[-.08,1.08],[0,.98],[.08,1.08],[.13,1.23],[0,1.29]],armorShade,.045,.018).position.z=.19;
  // Chest energy channels.
  for (const side of [-1,1]) {
    const line=add(new THREE.BoxGeometry(.018,.25,.012),violet,[side*.045,1.22,.222]);
    line.rotation.z=side*-.16;
    orb(violet,[side*.075,1.36,.20],[.025,.025,.018]);
  }
  orb(violet,[0,1.04,.17],[.025,.075,.012]);

  // Shoulder shells, arms, forearm blades and articulated claw fingers.
  for (const side of [-1,1]) {
    orb(core,[side*shoulder,1.29,0],[.16,.17,.15]);
    orb(armor,[side*shoulder,1.31,.015],[.17,.15,.16]);
    orb(armorLight,[side*(shoulder+.035),1.34,.105],[.115,.10,.07]);
    capsule(core,[side*.46,1.25,0],[side*.55,.98,.015],.085,.073);
    capsule(core,[side*.55,.98,.015],[side*.60,.75,.04],.07,.055);
    capsule(armor,[side*.60,.91,.04],[side*.65,.73,.07],.09,.065);
    const fore=plate([[side*.57,.99],[side*.68,.94],[side*.70,.77],[side*.62,.69],[side*.57,.82]],armorLight,.07,.018);
    fore.position.z=.075;
    orb(violet,[side*.635,.84,.15],[.018,.065,.012]);
    orb(core,[side*.65,.68,.045],[.065,.075,.06]);
    for(let f=0;f<4;f++){
      const x=side*(.61+(f-1.5)*.035);
      capsule(armorShade,[x,.67,.07],[x+side*.012,.57,.10],.018,.012);
    }
    capsule(armorShade,[side*.60,.68,.09],[side*.53,.61,.12],.022,.012);
  }

  // Waist and pelvis are narrow, sculpted armor anatomy rather than clothing.
  orb(core,[0,.78,0],[.19,.18,.14]);
  plate([[-.19,.83],[-.13,.94],[0,.98],[.13,.94],[.19,.83],[.11,.69],[0,.65],[-.11,.69]],armor,.07,.025).position.z=.09;
  orb(armorShade,[0,.73,.12],[.12,.09,.055]);

  // Digitigrade legs: long upper thighs, raised hocks, backward heel and three-toe feet.
  for(const side of [-1,1]){
    orb(core,[side*.13,.59,0],[.115,.19,.12]);
    capsule(core,[side*.14,.62,0],[side*.17,.34,-.015],.105,.072);
    orb(armor,[side*.15,.48,.035],[.115,.18,.12]);
    const thigh=plate([[side*.06,.66],[side*.20,.69],[side*.25,.53],[side*.19,.40],[side*.10,.43]],armorLight,.055,.02);
    thigh.position.z=.09;
    orb(core,[side*.17,.32,-.005],[.075,.085,.08]);
    capsule(core,[side*.17,.32,-.005],[side*.19,.16,-.10],.062,.045);
    capsule(armor,[side*.19,.30,.035],[side*.20,.15,-.075],.075,.045);
    const shin=plate([[side*.12,.34],[side*.23,.37],[side*.25,.22],[side*.20,.12],[side*.15,.18]],armorLight,.055,.018);
    shin.position.z=.065;
    // Heel rises; toes point forward (+Z), giving a nimble sword-fighter stance.
    orb(core,[side*.20,.13,-.09],[.055,.06,.075]);
    capsule(armorShade,[side*.20,.14,-.08],[side*.20,.09,.12],.045,.055);
    orb(armor,[side*.20,.085,.14],[.095,.065,.17]);
    for(let toe=-1;toe<=1;toe++){
      capsule(armorLight,[side*.20+toe*.045,.075,.19],[side*.20+toe*.055,.045,.29],.035,.018);
    }
    orb(violet,[side*.20,.25,.12],[.012,.055,.012]);
  }

  // Spine reactor visible from behind; all lighting details are embedded in the body.
  orb(core,[0,1.18,-.145],[.09,.29,.045]);
  const spine=add(new THREE.BoxGeometry(.025,.39,.018),violet,[0,1.18,-.19]);
  spine.rotation.z=.02;
  for(let y=.95;y<1.39;y+=.11) orb(armorShade,[0,y,-.19],[.075,.035,.025]);

  // Sword and grip are attached to a real hand pivot so existing combat code can animate it.
  const weaponPivot = new THREE.Group();
  weaponPivot.position.set(.64,.69,.02);
  weaponPivot.rotation.x=-.10;
  root.add(weaponPivot);
  const grip=add(new THREE.CylinderGeometry(.025,.03,.34,10),darkBlade,[0,-.08,0],null,weaponPivot);
  const guard=add(new THREE.BoxGeometry(.22,.035,.07),armorShade,[0,.10,0],null,weaponPivot);
  const bladeShape=new THREE.Shape();
  bladeShape.moveTo(-.045,.12); bladeShape.lineTo(.045,.12);
  bladeShape.lineTo(.055,.72); bladeShape.lineTo(0,.91); bladeShape.lineTo(-.055,.72); bladeShape.closePath();
  add(new THREE.ExtrudeGeometry(bladeShape,{depth:.025,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.008,bevelThickness:.008}),bladeMat,[0,0,-.012],null,weaponPivot);
  add(new THREE.BoxGeometry(.012,.64,.012),violet,[0,.47,.018],null,weaponPivot);

  root.userData.weaponPivot=weaponPivot;
  root.userData.gender=gender;
  root.userData.race='arnemetian';
  root.userData.animParts={};
  return root;
}
