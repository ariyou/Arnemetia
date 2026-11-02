import { createCharacterHead } from './character-head.js';

export function createFemaleCharacter(THREE) {
  const root = new THREE.Group();
  const mat = (color, roughness = .72, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const skin = mat(0xffdfd1), white = mat(0xe8edf2), navy = mat(0x202d46),
    navy2 = mat(0x34435e), dark = mat(0x182033), silver = mat(0xb9c2d0, .42),
    silverLight = mat(0xe0e5ed, .38), blue = mat(0x7295bb, .42),
    red = mat(0x9d4350), gold = mat(0xd8b879, .4, .25), boot = mat(0x252b38);
  const add = (geo, material, pos, scale = null, parent = root) => {
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(...pos);
    if (scale) mesh.scale.set(...scale);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh);
    return mesh;
  };
  const ball = (m,p,s,parent=root) => add(new THREE.SphereGeometry(1,32,24),m,p,s,parent);
  const capsule = (m,p,r,l,rot=[0,0,0]) => {
    const o=add(new THREE.CapsuleGeometry(r,l,6,16),m,p); o.rotation.set(...rot); return o;
  };
  const lock = (points, radius, material) => {
    const curve = new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const mesh = add(new THREE.TubeGeometry(curve,32,radius,10,false),material,[0,0,0]);
    return mesh;
  };

  // Body proportions: compact anime-game silhouette with a large head and slim limbs.
  capsule(skin,[0,1.12,0],.105,.25);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.235,.43,8,20),white);
  torso.position.set(0,.91,0); torso.scale.set(.88,1,.72); torso.castShadow=true; root.add(torso);
  // Dark fitted jacket panels and high collar.
  const jacket = add(new THREE.CylinderGeometry(.245,.27,.47,24,1,true),navy,[0,.91,0]);
  jacket.scale.set(1,.98,.82);
  add(new THREE.BoxGeometry(.075,.43,.025),navy2,[0,.91,.207]);
  add(new THREE.BoxGeometry(.07,.23,.035),red,[0,1.115,.205]);
  add(new THREE.BoxGeometry(.16,.045,.035),white,[0,1.22,.19]);
  for (const side of [-1,1]) {
    const lapel=add(new THREE.BoxGeometry(.105,.25,.035),navy2,[side*.105,1.09,.20]);
    lapel.rotation.z=side*-.22;
    capsule(navy,[side*.29,1.02,0],.105,.20,[0,0,side*-.25]);
    capsule(skin,[side*.355,.77,.015],.066,.27,[0,0,side*-.08]);
    ball(skin,[side*.36,.60,.03],[.07,.075,.07]);
    capsule(navy2,[side*.145,.42,0],.085,.30);
    capsule(skin,[side*.145,.19,.01],.065,.16);
    capsule(boot,[side*.145,.105,.045],.082,.13);
    ball(boot,[side*.145,.055,.11],[.105,.055,.17]);
    // jacket sleeve cuff and small shoulder tab
    capsule(navy2,[side*.35,.80,.015],.072,.075,[0,0,side*-.08]);
    ball(gold,[side*.29,1.105,.09],[.035,.035,.02]);
  }
  // Short pleated dark skirt, with individually shaped panels.
  const waist=add(new THREE.CylinderGeometry(.205,.22,.12,32),navy,[0,.57,0]);
  const skirt=add(new THREE.CylinderGeometry(.205,.34,.34,32,1,true),navy2,[0,.39,0]);
  skirt.scale.z=.82;
  add(new THREE.TorusGeometry(.212,.018,8,32),gold,[0,.535,0]).rotation.x=Math.PI/2;
  for(let i=0;i<10;i++){
    const a=i*Math.PI*2/10;
    const pleat=add(new THREE.BoxGeometry(.018,.28,.235),navy,[Math.sin(a)*.255,.39,Math.cos(a)*.19]);
    pleat.rotation.y=a;
  }
  // Long silver hair, built from rounded flowing locks rather than spikes.
  const head=createCharacterHead(THREE,{hairColor:0xb9c2d0,eyeColor:0x6c91bf,skinColor:0xffdfd1});
  root.add(head);
  // Back hair curtain and long side locks frame the torso.
  ball(silver,[0,1.91,-.16],[.39,.34,.31]);
  for(const side of [-1,1]){
    lock([[side*.30,1.98,-.08],[side*.39,1.78,-.16],[side*.40,1.48,-.22],[side*.34,1.15,-.24],[side*.28,.91,-.18]],.105,silver);
    lock([[side*.27,1.93,-.20],[side*.32,1.65,-.29],[side*.30,1.35,-.31],[side*.22,1.05,-.27]],.075,silverLight);
  }
  // Hair ribbon and side ornaments.
  for(const side of [-1,1]){
    const ribbon=add(new THREE.BoxGeometry(.12,.035,.035),blue,[side*.37,1.91,-.03]);
    ribbon.rotation.z=side*.22;
    ball(white,[side*.37,1.91,.005],[.035,.045,.025]);
  }
  // Simple tactical shoulder capelet and straps.
  const strap=add(new THREE.BoxGeometry(.055,.48,.035),navy2,[.16,.89,.18]);
  strap.rotation.z=-.18;
  add(new THREE.BoxGeometry(.09,.07,.04),gold,[.16,.72,.20]);
  // Compact side pouch.
  add(new THREE.BoxGeometry(.13,.15,.12),dark,[.28,.61,.015]);
  add(new THREE.BoxGeometry(.09,.025,.025),gold,[.28,.66,.085]);
  // Small utility rifle silhouette on the back, kept decorative and out of hand pivots.
  const rifle=new THREE.Group(); rifle.position.set(-.23,1.10,-.25); rifle.rotation.z=-.22; root.add(rifle);
  add(new THREE.BoxGeometry(.09,.55,.075),dark,[0,.12,0],null,rifle);
  add(new THREE.CylinderGeometry(.018,.018,.38,10),silver,[0,.56,0],null,rifle);
  add(new THREE.BoxGeometry(.13,.08,.10),navy2,[0,-.17,0],null,rifle);
  const weaponPivot=new THREE.Group(); weaponPivot.position.set(.38,1.05,-.18); weaponPivot.rotation.z=-.28; root.add(weaponPivot);
  // A visible back-mounted rifle assembly; child[0] is scaled by the weapon selector.
  add(new THREE.BoxGeometry(.095,.72,.09),dark,[0,.12,0],null,weaponPivot);
  add(new THREE.CylinderGeometry(.018,.018,.42,10),silver,[0,.60,.015],null,weaponPivot);
  add(new THREE.BoxGeometry(.17,.10,.12),navy2,[0,-.22,0],null,weaponPivot);
  add(new THREE.BoxGeometry(.13,.045,.11),gold,[0,.22,.055],null,weaponPivot);
  root.userData.weaponPivot=weaponPivot;
  root.userData.gender='female';
  root.userData.animParts={hair:head};
  return root;
}
