// Arnemetia: seamless biomechanical alien sword-user.
// No human face, eyes, mouth, ears, cloth, or tail.
export function createAlienCharacter(THREE, gender = 'male') {
  const root = new THREE.Group();
  const makeMat = (color, roughness=.42, metalness=.35, emissive=0, intensity=0) =>
    new THREE.MeshStandardMaterial({color,roughness,metalness,emissive,emissiveIntensity:intensity});
  const dark=makeMat(0x171522,.58,.2);
  const shell=makeMat(0xc9c7df,.3,.58);
  const light=makeMat(0xeeeaff,.26,.5);
  const shade=makeMat(0x77738e,.38,.5);
  const glow=makeMat(0x9d55ff,.22,.4,0x8c35ff,2.0);
  const bladeMat=makeMat(0xd9e4ff,.2,.72);
  const v=(x,y,z)=>new THREE.Vector3(x,y,z);
  function mesh(geo,mat,pos,scale,parent=root){
    const m=new THREE.Mesh(geo,mat);m.position.set(...pos);
    if(scale)m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }
  function ellipsoid(mat,pos,scale){return mesh(new THREE.SphereGeometry(1,32,24),mat,pos,scale);}
  function link(mat,a,b,r1,r2=r1){
    const A=v(...a),B=v(...b),d=B.clone().sub(A);
    const m=mesh(new THREE.CylinderGeometry(r2,r1,d.length(),20,1),mat,A.clone().add(B).multiplyScalar(.5).toArray());
    m.quaternion.setFromUnitVectors(v(0,1,0),d.normalize());
    ellipsoid(mat,a,[r1,r1,r1]);ellipsoid(mat,b,[r2,r2,r2]);return m;
  }
  function plate(points,mat,z,depth=.045){
    const s=new THREE.Shape();s.moveTo(points[0][0],points[0][1]);
    for(let i=1;i<points.length;i++)s.lineTo(points[i][0],points[i][1]);
    s.closePath();
    return mesh(new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.035,bevelThickness:.025,curveSegments:12}),mat,[0,0,z]);
  }

  // One continuous dark biomechanical body under close-fitting shell plates.
  ellipsoid(dark,[0,1.13,0],[.205,.31,.145]);
  ellipsoid(dark,[0,.83,0],[.19,.22,.135]);
  ellipsoid(dark,[0,.62,0],[.205,.16,.14]);
  link(dark,[0,1.27,0],[0,1.43,0],.085,.105);

  // Compact sealed helmet, tapered into the neck; absolutely featureless front.
  ellipsoid(dark,[0,1.51,0],[.17,.205,.155]);
  ellipsoid(shell,[0,1.53,.005],[.178,.205,.16]);
  const brow=plate([[-.16,1.55],[-.13,1.68],[-.055,1.73],[.02,1.70],[.14,1.64],[.16,1.52],[.08,1.39],[-.09,1.39]],light,.105,.035);
  // Single short horn on the character's left. No central crest or second horn.
  const horn=new THREE.CatmullRomCurve3([v(-.115,1.66,.025),v(-.18,1.70,.015),v(-.205,1.745,-.005)]);
  mesh(new THREE.TubeGeometry(horn,16,.034,12,false),light,[0,0,0]);
  // Opposite-side sensor is a dim seam, not an eye or facial feature.
  const sensor=mesh(new THREE.BoxGeometry(.009,.052,.009),glow,[.145,1.51,.151]);
  sensor.rotation.z=-.2;

  // Chest and abdomen follow the body's volume; no floating shoulder balls.
  ellipsoid(shell,[0,1.19,.035],[.205,.205,.15]);
  plate([[-.17,1.32],[-.12,1.40],[0,1.44],[.12,1.40],[.17,1.32],[.105,1.18],[0,1.10],[-.105,1.18]],light,.135,.035);
  plate([[-.105,1.15],[-.08,1.01],[0,.96],[.08,1.01],[.105,1.15],[0,1.22]],shade,.145,.025);
  for(const side of [-1,1]){
    const channel=mesh(new THREE.BoxGeometry(.012,.20,.009),glow,[side*.045,1.20,.185]);
    channel.rotation.z=side*-.16;
  }
  ellipsoid(glow,[0,1.035,.17],[.018,.045,.009]);

  // Shoulder transitions are tapered into upper arms and covered by curved shells.
  for(const s of [-1,1]){
    ellipsoid(dark,[s*.205,1.29,0],[.12,.125,.12]);
    ellipsoid(shell,[s*.22,1.31,.015],[.125,.12,.125]);
    ellipsoid(light,[s*.245,1.34,.065],[.105,.085,.09]);
    link(dark,[s*.27,1.27,0],[s*.36,1.02,.015],.078,.067);
    link(dark,[s*.36,1.02,.015],[s*.405,.77,.045],.066,.052);
    link(shell,[s*.37,.99,.04],[s*.415,.77,.07],.073,.055);
    ellipsoid(light,[s*.415,.86,.085],[.065,.14,.075]);
    ellipsoid(dark,[s*.41,.70,.045],[.055,.065,.05]);
    for(let i=0;i<4;i++){
      const x=s*(.385+(i-1.5)*.027);
      link(shade,[x,.69,.065],[x+s*.008,.585,.095],.014,.009);
    }
    link(shade,[s*.39,.70,.08],[s*.32,.625,.105],.018,.01);
    ellipsoid(glow,[s*.415,.86,.153],[.009,.045,.008]);
  }

  // Slim waist and integrated hip shell.
  ellipsoid(dark,[0,.79,0],[.17,.17,.13]);
  ellipsoid(shell,[0,.68,.015],[.205,.13,.145]);
  plate([[-.18,.78],[-.13,.89],[0,.93],[.13,.89],[.18,.78],[.10,.64],[0,.61],[-.10,.64]],light,.11,.03);

  // Athletic digitigrade legs, with continuous thigh-to-shin flow and three forward claws.
  for(const s of [-1,1]){
    link(dark,[s*.105,.65,0],[s*.145,.38,-.005],.095,.068);
    ellipsoid(shell,[s*.125,.51,.035],[.102,.16,.105]);
    plate([[s*.045,.65],[s*.16,.68],[s*.22,.52],[s*.17,.39],[s*.09,.43]],light,.105,.025);
    ellipsoid(dark,[s*.145,.35,-.005],[.068,.075,.07]);
    link(dark,[s*.145,.34,-.005],[s*.17,.16,-.09],.058,.042);
    link(shell,[s*.16,.31,.025],[s*.18,.16,-.075],.067,.043);
    plate([[s*.105,.36],[s*.20,.39],[s*.225,.23],[s*.18,.13],[s*.13,.19]],light,.085,.02);
    ellipsoid(dark,[s*.18,.13,-.085],[.045,.055,.06]);
    link(shade,[s*.18,.13,-.07],[s*.18,.085,.12],.04,.05);
    ellipsoid(shell,[s*.18,.085,.14],[.082,.055,.14]);
    for(let t=-1;t<=1;t++)link(light,[s*.18+t*.035,.075,.20],[s*.18+t*.043,.045,.275],.027,.012);
    ellipsoid(glow,[s*.18,.25,.12],[.009,.045,.009]);
  }

  // Back reactor/spine: visible only from behind, integrated flush to the shell.
  ellipsoid(dark,[0,1.17,-.135],[.075,.27,.035]);
  mesh(new THREE.BoxGeometry(.018,.34,.012),glow,[0,1.17,-.168]);
  for(let y=.99;y<1.37;y+=.095)ellipsoid(shade,[0,y,-.17],[.055,.025,.016]);

  // Hand-held sword, attached to the established combat pivot.
  const weapon=new THREE.Group();weapon.position.set(.43,.69,.035);root.add(weapon);
  mesh(new THREE.CylinderGeometry(.022,.026,.29,12),dark,[0,-.08,0],null,weapon);
  mesh(new THREE.BoxGeometry(.19,.028,.055),shade,[0,.075,0],null,weapon);
  const bladeShape=new THREE.Shape();bladeShape.moveTo(-.04,.09);bladeShape.lineTo(.04,.09);
  bladeShape.lineTo(.05,.66);bladeShape.lineTo(0,.82);bladeShape.lineTo(-.05,.66);bladeShape.closePath();
  mesh(new THREE.ExtrudeGeometry(bladeShape,{depth:.022,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.008,bevelThickness:.008}),bladeMat,[0,0,-.012],null,weapon);
  mesh(new THREE.BoxGeometry(.009,.56,.009),glow,[0,.39,.015],null,weapon);

  root.userData.weaponPivot=weapon;
  root.userData.gender=gender;
  root.userData.race='arnemetian';
  root.userData.animParts={};
  return root;
}
