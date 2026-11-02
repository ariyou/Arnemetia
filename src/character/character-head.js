export function createCharacterHead(THREE, options = {}) {
  const { hairColor = 0x2858ad, eyeColor = 0x438fe8, skinColor = 0xffd1ad } = options;
  const head = new THREE.Group();
  const mat = (color, roughness = .62, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const skin = mat(skinColor), hair = mat(hairColor, .42);
  const hairDark = mat(0x193875, .5), hairLight = mat(0x5689dc, .4);
  const sclera = mat(0xfff8f2, .3), iris = mat(eyeColor, .24);
  const pupil = mat(0x10182d, .2), highlight = mat(0xffffff, .18);
  const brow = mat(0x18346e, .5), blush = mat(0xe99b91, .7);
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

  // Smooth tapered tube following a 3D curve; used for sculpted hair strands.
  const lock = (points, radius, material, taper = .08) => {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    const segments = 20, sides = 10;
    const frames = curve.computeFrenetFrames(segments, false);
    const vertices = [], indices = [], uvs = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const center = curve.getPointAt(t);
      const r = radius * (1 - (1 - taper) * Math.pow(t, 1.35));
      for (let j = 0; j <= sides; j++) {
        const a = j / sides * Math.PI * 2;
        const normal = frames.normals[i].clone().multiplyScalar(Math.cos(a))
          .add(frames.binormals[i].clone().multiplyScalar(Math.sin(a)));
        const v = center.clone().addScaledVector(normal, r);
        vertices.push(v.x, v.y, v.z);
        uvs.push(j / sides, t);
        if (i < segments && j < sides) {
          const n = i * (sides + 1) + j;
          indices.push(n, n + sides + 1, n + 1, n + 1, n + sides + 1, n + sides + 2);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return add(geometry, material, [0, 0, 0]);
  };

  // Neck and face: soft jaw, broad cheeks and compact chin.
  add(new THREE.CylinderGeometry(.105, .12, .22, 24), skin, [0, 1.285, 0]);
  ball(skin, [0, 1.66, 0], [.385, .435, .335]);
  for (const side of [-1, 1]) {
    ball(skin, [side * .365, 1.625, -.005], [.075, .105, .065]);
    ball(blush, [side * .225, 1.505, .286], [.047, .018, .009]);
  }

  // Large, inset anime eyes with upper eyelid line and layered blue irises.
  for (const side of [-1, 1]) {
    const x = side * .145;
    ball(sclera, [x, 1.655, .286], [.096, .119, .046]);
    ball(iris, [x, 1.645, .324], [.064, .084, .024]);
    ball(pupil, [x, 1.64, .344], [.032, .061, .013]);
    ball(highlight, [x - .021, 1.681, .358], [.021, .026, .009]);
    ball(highlight, [x + .022, 1.625, .358], [.010, .013, .006]);
    const upperLid = add(new THREE.TorusGeometry(.086, .009, 6, 24, Math.PI), hairDark, [x, 1.66, .305]);
    upperLid.rotation.z = Math.PI;
    const browMesh = add(new THREE.CapsuleGeometry(.009, .085, 3, 8), brow, [x, 1.80, .29]);
    browMesh.rotation.z = side * -.10;
  }
  // Tiny nose and restrained smile.
  ball(mat(0xe8ad91), [0, 1.555, .331], [.018, .019, .014]);
  const mouth = add(new THREE.TorusGeometry(.032, .005, 6, 18, Math.PI), mouthMat, [0, 1.465, .329]);
  mouth.rotation.z = Math.PI;

  // Rear hair cap follows the skull; no hard polygon helmet silhouette.
  ball(hairDark, [0, 1.91, -.075], [.405, .285, .335]);
  ball(hair, [0, 1.955, -.045], [.397, .245, .337]);

  // Layered side locks hug the temples, then taper beside the cheeks.
  lock([[-.31,1.99,-.015],[-.39,1.83,.015],[-.405,1.62,.055],[-.34,1.43,.105]], .105, hairDark, .035);
  lock([[.31,1.99,-.015],[.39,1.83,.015],[.405,1.62,.055],[.34,1.43,.105]], .105, hairDark, .035);
  lock([[-.30,1.94,.09],[-.36,1.79,.14],[-.36,1.60,.17],[-.29,1.48,.19]], .085, hair, .025);
  lock([[.30,1.94,.09],[.36,1.79,.14],[.36,1.60,.17],[.29,1.48,.19]], .085, hair, .025);

  // Swept fringe: curved solid strands, not flat extruded plates.
  lock([[-.30,2.00,.16],[-.32,1.91,.25],[-.34,1.78,.29],[-.39,1.68,.27]], .105, hairDark, .025);
  lock([[-.20,2.06,.20],[-.22,1.94,.29],[-.23,1.80,.335],[-.27,1.65,.32]], .112, hair, .025);
  lock([[-.07,2.075,.22],[-.08,1.95,.315],[-.10,1.82,.35],[-.12,1.70,.335]], .105, hairLight, .025);
  lock([[.08,2.065,.21],[.10,1.95,.31],[.12,1.82,.345],[.15,1.69,.325]], .11, hair, .025);
  lock([[.22,2.015,.16],[.25,1.91,.25],[.29,1.78,.29],[.34,1.68,.26]], .105, hairDark, .025);

  // Distinct swept crown tufts, curved backward then up.
  lock([[-.12,2.04,-.04],[-.19,2.15,-.12],[-.17,2.27,-.17],[-.07,2.30,-.20]], .075, hairLight, .015);
  lock([[.02,2.04,-.10],[.12,2.14,-.16],[.23,2.20,-.19],[.30,2.16,-.20]], .07, hair, .015);
  lock([[.23,1.99,-.10],[.32,2.06,-.15],[.39,2.04,-.18]], .055, hairDark, .01);

  // A few subtle curved highlight strands add volume without clutter.
  lock([[-.25,2.02,.08],[-.12,2.12,.12],[.02,2.13,.13]], .012, hairLight, .3);
  lock([[.02,2.12,.13],[.17,2.10,.12],[.27,2.02,.08]], .010, hairLight, .3);

  head.userData.mouth = mouth;
  return head;
}
