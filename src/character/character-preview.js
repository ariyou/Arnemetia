import * as THREE from 'three';
import { createCharacterModel } from '../character/character-model.js';

export function initCharacterPreview(container, initialGender = 'male') {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x22284b);
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 30);
  camera.position.set(0, 2.05, 5.7);
  camera.lookAt(0, 1.05, 0);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.setClearColor(0x25284b, 1);
  container.replaceChildren(renderer.domElement);
  const ambient = new THREE.HemisphereLight(0xdde7ff, 0x403453, 2.2);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffe5c0, 3);
  key.position.set(-3, 6, 4);
  key.castShadow = true;
  scene.add(key);
  const rim = new THREE.PointLight(0x8e74ff, 16, 10);
  rim.position.set(3, 2, -2);
  scene.add(rim);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(1.15, 48), new THREE.MeshStandardMaterial({ color: 0x34375c, roughness: .85 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -.025;
  scene.add(floor);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(.78, .018, 8, 64), new THREE.MeshBasicMaterial({ color: 0xd8bd75 }));
  halo.rotation.x = Math.PI / 2;
  halo.position.y = .015;
  scene.add(halo);

  let character = null;
  let gender = initialGender;
  let rotation = 0;
  let dragging = false;
  let lastX = 0;
  let frame = 0;
  const clock = new THREE.Clock();

  function setGender(nextGender) {
    if (!['male', 'female'].includes(nextGender)) return;
    gender = nextGender;
    if (character) scene.remove(character);
    character = createCharacterModel(THREE, gender);
    character.position.y = .02;
    scene.add(character);
  }
  function resize() {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  function pointerDown(event) {
    dragging = true;
    lastX = event.clientX;
    renderer.domElement.setPointerCapture(event.pointerId);
  }
  function pointerMove(event) {
    if (!dragging) return;
    rotation += (event.clientX - lastX) * .012;
    lastX = event.clientX;
  }
  function pointerUp() { dragging = false; }
  renderer.domElement.addEventListener('pointerdown', pointerDown);
  renderer.domElement.addEventListener('pointermove', pointerMove);
  renderer.domElement.addEventListener('pointerup', pointerUp);
  renderer.domElement.addEventListener('pointercancel', pointerUp);
  setGender(initialGender);
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(container);

  function animate() {
    frame = requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const time = clock.elapsedTime;
    if (character) {
      character.userData.mixer?.update(dt);
      character.rotation.y = rotation + (dragging ? 0 : Math.sin(time * .35) * .08);
      character.position.y = .02 + Math.sin(time * 2) * .025;
      character.userData.weaponPivot.rotation.z = Math.sin(time * 1.5) * .035;
      const cape = character.userData.animParts?.cape;
      if (cape) cape.rotation.z = Math.sin(time * 1.7) * .035;
    }
    renderer.render(scene, camera);
  }
  animate();

  return {
    setGender,
    destroy() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.dispose();
      renderer.domElement.remove();
    }
  };
}
