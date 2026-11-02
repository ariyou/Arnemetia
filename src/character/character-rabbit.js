import { createFemaleCharacter } from './character-female.js';

// Arnemetia's first playable beastfolk: an anime-styled rabbit adventurer.
// The humanoid base keeps the existing rig points and weapon pivot compatible.
export function createRabbitCharacter(THREE) {
  const root = createFemaleCharacter(THREE);

  const fur = new THREE.MeshStandardMaterial({ color: 0xf0e9e3, roughness: .78 });
  const innerEar = new THREE.MeshStandardMaterial({
    color: 0xd98f9c, roughness: .82, side: THREE.DoubleSide
  });
  const tailFur = new THREE.MeshStandardMaterial({ color: 0xf8f2ed, roughness: .9 });

  // Sculpted leaf-shaped ears with a softly rounded bevel, not primitive rods.
  function makeEar(side) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(-.13, .23, -.16, .62, -.075, .91);
    shape.bezierCurveTo(-.035, 1.04, .055, 1.04, .095, .91);
    shape.bezierCurveTo(.20, .62, .15, .23, 0, 0);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: .075, bevelEnabled: true, bevelSegments: 4,
      steps: 1, bevelSize: .025, bevelThickness: .025, curveSegments: 16
    });
    geometry.translate(0, 0, -.0375);
    const ear = new THREE.Group();
    const outer = new THREE.Mesh(geometry, fur);
    outer.castShadow = true;
    ear.add(outer);

    const innerShape = new THREE.Shape();
    innerShape.moveTo(0, .12);
    innerShape.bezierCurveTo(-.075, .34, -.09, .66, -.045, .84);
    innerShape.bezierCurveTo(-.015, .91, .025, .91, .05, .83);
    innerShape.bezierCurveTo(.11, .62, .075, .34, 0, .12);
    const innerGeo = new THREE.ShapeGeometry(innerShape, 20);
    const inner = new THREE.Mesh(innerGeo, innerEar);
    inner.position.z = .041;
    ear.add(inner);

    ear.position.set(side * .19, 2.02, -.055);
    ear.rotation.z = side * -.19 + (side < 0 ? -.08 : .04);
    ear.rotation.x = -.10;
    root.add(ear);
    return ear;
  }

  const leftEar = makeEar(-1);
  const rightEar = makeEar(1);

  // Soft round tail placed behind the skirt, visible in the game camera.
  const tail = new THREE.Mesh(new THREE.SphereGeometry(.145, 24, 20), tailFur);
  tail.position.set(0, .60, -.355);
  tail.scale.set(1, 1.05, .82);
  tail.castShadow = true;
  root.add(tail);

  // Small fur cuffs make the hands read as rabbit paws without hiding fingers.
  const pawMaterial = new THREE.MeshStandardMaterial({ color: 0xf0e9e3, roughness: .8 });
  for (const side of [-1, 1]) {
    const cuff = new THREE.Mesh(new THREE.SphereGeometry(.073, 18, 14), pawMaterial);
    cuff.position.set(side * .36, .60, .035);
    cuff.scale.set(1, .72, .82);
    cuff.castShadow = true;
    root.add(cuff);
  }

  root.userData.race = 'rabbit';
  root.userData.animParts = { ...(root.userData.animParts || {}), ears: [leftEar, rightEar], tail };
  return root;
}
