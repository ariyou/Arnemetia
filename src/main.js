import { initAuthScreen } from './ui/auth-screen.js';
initAuthScreen();

import * as THREE from 'three';
import { createCharacterModel } from './character/character-model.js';

const canvas = document.querySelector('#world');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fc9a1);
scene.fog = new THREE.Fog(0x8fc9a1, 18, 48);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, .1, 100);
camera.position.set(8, 11, 13);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

scene.add(new THREE.HemisphereLight(0xe7fff0, 0x526b42, 2));
const sun = new THREE.DirectionalLight(0xfff0cf, 2.1);
sun.position.set(-7, 12, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

const mat = (color, roughness = 1) => new THREE.MeshStandardMaterial({ color, roughness });
const groundMat = mat(0x789d55);
const pathMat = mat(0xb99a68);
const trunkMat = mat(0x76513a);
const leafMats = [mat(0x397b4b), mat(0x4f9455), mat(0x6aa65a)];
const stoneMat = mat(0x77877a);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), groundMat);
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const path = new THREE.Mesh(new THREE.PlaneGeometry(5, 65), pathMat);
path.rotation.x = -Math.PI / 2; path.position.set(0, .012, -2); scene.add(path);

function addTree(x, z, scale = 1) {
  const group = new THREE.Group(); group.position.set(x, 0, z); group.scale.setScalar(scale);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.13, .2, 1.3, 7), trunkMat);
  trunk.position.y = .65; trunk.castShadow = true; group.add(trunk);
  for (let i = 0; i < 3; i++) {
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(.68 - i * .08, 1), leafMats[(i + Math.floor(x + z + 10)) % 3]);
    crown.position.set((i % 2 ? .2 : -.15), 1.35 + i * .38, (i - 1) * .12);
    crown.castShadow = true; group.add(crown);
  }
  scene.add(group);
}
for (let i = 0; i < 48; i++) {
  const side = i % 2 ? 1 : -1;
  addTree(side * (4.5 + Math.random() * 9), (Math.random() - .5) * 38, .65 + Math.random() * .8);
}
for (let i = 0; i < 22; i++) {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.25 + Math.random() * .35, 0), stoneMat);
  rock.position.set((Math.random() - .5) * 18, .18, (Math.random() - .5) * 28);
  rock.rotation.set(Math.random(), Math.random(), Math.random()); rock.castShadow = true; scene.add(rock);
}

function makeHero(gender = 'male') {
  return createCharacterModel(THREE, gender);
}
let hero = makeHero('male'); hero.position.set(0, 0, 3); scene.add(hero);
window.addEventListener('arnemetia:profile-ready', (event) => {
  const gender = event.detail?.gender;
  if (!['female', 'male'].includes(gender)) return;
  const position = hero.position.clone();
  const rotation = hero.rotation.clone();
  scene.remove(hero);
  hero = makeHero(gender);
  hero.position.copy(position);
  hero.rotation.copy(rotation);
  scene.add(hero);
  toast(gender === 'female' ? 'Karakter cewek dipilih' : 'Karakter cowok dipilih');
});

function makeSlime(x, z, color = 0x35b9a2) {
  const group = new THREE.Group(); group.position.set(x, 0, z);
  const body = new THREE.Mesh(new THREE.SphereGeometry(.48, 14, 10), mat(color, .45));
  body.scale.y = .72; body.position.y = .37; body.castShadow = true; group.add(body);
  const eyeMat = mat(0x173b43);
  for (const ex of [-.16, .16]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.055, 8, 8), eyeMat);
    eye.position.set(ex, .47, .405); group.add(eye);
  }
  group.userData.body = body; group.userData.hp = 35; group.userData.maxHp = 35;
  group.userData.alive = true; group.userData.phase = Math.random() * 6;
  scene.add(group); return group;
}
const monsters = [makeSlime(-2, -2), makeSlime(2.2, -5, 0x54a9db), makeSlime(-1.5, -9, 0x70bd69)];

const weapons = {
  sword: { name: 'WOODEN SWORD', style: 'Balanced melee', damage: 14, range: 2.1, speed: 420, skill: 'Crescent Slash', icon: '⚔' },
  bow: { name: 'HUNTER BOW', style: 'Ranged attack', damage: 10, range: 8, speed: 650, skill: 'Piercing Shot', icon: '➶' },
  staff: { name: 'NOVICE STAFF', style: 'Arcane magic', damage: 12, range: 6, speed: 560, skill: 'Arcane Burst', icon: '✦' },
  daggers: { name: 'TWIN DAGGERS', style: 'Fast melee', damage: 8, range: 1.7, speed: 240, skill: 'Flurry', icon: '⚔' }
};
let activeWeapon = 'sword', level = 1, xp = 0, hp = 100, kills = 0, target = monsters[0], lastAttack = 0;
let moveTarget = null, attackAnim = 0, skillCooldown = 0;
const heroSpeed = 4.2;
const $ = id => document.getElementById(id);
function toast(message) { const el = $('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 1450); }
function updateHud() {
  const w = weapons[activeWeapon];
  $('level').textContent = 'Lv. ' + level;
  $('xp-text').textContent = xp + ' / ' + (level * 100) + ' EXP';
  $('xp-fill').style.width = (xp / (level * 100) * 100) + '%';
  $('hp-text').textContent = hp + ' / 100'; $('hp-fill').style.width = hp + '%';
  $('weapon-name').textContent = w.name; $('weapon-style').textContent = w.style;
  $('weapon-icon').textContent = w.icon; $('skill-hint').textContent = w.skill;
  $('quest-progress').textContent = 'Defeat a slime (' + kills + '/3)';
}
function nearestMonster() {
  const living = monsters.filter(m => m.userData.alive);
  if (!living.length) return null;
  return living.reduce((a, b) => hero.position.distanceTo(a.position) < hero.position.distanceTo(b.position) ? a : b);
}
function damageMonster(monster, damage) {
  if (!monster || !monster.userData.alive) return;
  monster.userData.hp -= damage;
  const body = monster.userData.body; body.material.emissive.setHex(0x7a3322);
  setTimeout(() => body.material.emissive.setHex(0x000000), 100);
  toast('-' + damage + ' damage');
  if (monster.userData.hp <= 0) {
    monster.userData.alive = false; kills++; scene.remove(monster);
    xp += 35;
    while (xp >= level * 100) { xp -= level * 100; level++; toast('LEVEL UP! Lv. ' + level); }
    updateHud();
    if (kills >= 3) toast('TASK COMPLETE · First Hunt');
    setTimeout(() => {
      const replacement = makeSlime((Math.random() - .5) * 5, -4 - Math.random() * 7, [0x35b9a2,0x54a9db,0x70bd69][Math.floor(Math.random()*3)]);
      monsters.push(replacement); updateHud();
    }, 5000);
  }
}
function attack(isSkill = false) {
  const now = performance.now(), w = weapons[activeWeapon];
  if (now - lastAttack < (isSkill ? 900 : w.speed)) return;
  if (isSkill && now < skillCooldown) { toast('Skill is recharging'); return; }
  target = target?.userData.alive ? target : nearestMonster();
  if (!target) { toast('No monster nearby'); return; }
  const distance = hero.position.distanceTo(target.position);
  if (distance > w.range) { moveTarget = target.position.clone(); toast('Moving into range…'); return; }
  lastAttack = now; attackAnim = .28;
  hero.rotation.y = Math.atan2(target.position.x - hero.position.x, target.position.z - hero.position.z);
  const damage = Math.round(w.damage * (isSkill ? 2.3 : 1));
  damageMonster(target, damage);
  if (isSkill) skillCooldown = now + 3500;
}
$('attack').addEventListener('pointerdown', e => { e.preventDefault(); attack(false); });
$('skill').addEventListener('pointerdown', e => { e.preventDefault(); attack(true); });
document.querySelectorAll('.weapon-button').forEach(button => button.addEventListener('click', () => {
  activeWeapon = button.dataset.weapon;
  document.querySelectorAll('.weapon-button').forEach(b => b.classList.toggle('active', b === button));
  const w = weapons[activeWeapon]; hero.userData.weaponPivot.children[0].scale.set(activeWeapon === 'bow' ? .55 : 1, activeWeapon === 'daggers' ? .55 : 1, 1);
  toast('Equipped ' + w.name); updateHud();
}));

const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
let dragging = false, down = null;
function pick(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  for (const hit of hits) {
    let obj = hit.object;
    while (obj && !obj.userData.alive) obj = obj.parent;
    if (obj?.userData.alive) { target = obj; toast('Target selected'); return; }
  }
  const groundHit = raycaster.intersectObject(ground)[0];
  if (groundHit) moveTarget = groundHit.point;
}
canvas.addEventListener('pointerdown', e => { down = {x:e.clientX,y:e.clientY}; dragging = true; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointerup', e => {
  if (!down) return;
  const moved = Math.hypot(e.clientX-down.x,e.clientY-down.y);
  if (moved < 12) pick(e);
  down = null; dragging = false;
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .04), time = clock.elapsedTime;
  if (moveTarget) {
    const direction = new THREE.Vector3().subVectors(moveTarget, hero.position); direction.y = 0;
    if (direction.length() < .18) moveTarget = null;
    else { direction.normalize(); hero.position.addScaledVector(direction, heroSpeed * dt); hero.rotation.y = Math.atan2(direction.x, direction.z); }
  }
  if (attackAnim > 0) { attackAnim -= dt; hero.userData.weaponPivot.rotation.x = -Math.sin((attackAnim / .28) * Math.PI) * 1.5; }
  else hero.userData.weaponPivot.rotation.x = 0;
  hero.userData.mixer?.update(dt);
  monsters.forEach(m => { if (m.userData.alive) { m.userData.body.position.y = .37 + Math.sin(time * 3 + m.userData.phase) * .07; m.rotation.y += Math.sin(time + m.userData.phase) * dt * .25; } });
  const desired = new THREE.Vector3(hero.position.x + 7.5, 10, hero.position.z + 10);
  camera.position.lerp(desired, 1 - Math.exp(-4 * dt)); camera.lookAt(hero.position.x, .5, hero.position.z - 1);
  renderer.render(scene, camera);
}
function resize() { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7)); }
addEventListener('resize', resize);
updateHud(); animate();
toast('Tap the ground to move · Hunt the slimes');
