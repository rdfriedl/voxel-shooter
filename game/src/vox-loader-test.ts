import * as THREE from "three";
import { Clock, FileLoader, Raycaster, Vector3 } from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

import { readVoxChunksIntoWorld, readVoxModelChunks } from "./utils/vox-loader";
import { VoxelWorld } from "./voxel-world";
import { VoxelWorldMesh } from "./voxel-world-mesh";
import { keyStates } from "./utils/key-states";

let camera: THREE.PerspectiveCamera,
  controls: PointerLockControls,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  world: VoxelWorld,
  raycaster: Raycaster,
  voxelWorldMesh: VoxelWorldMesh,
  clock: Clock;

init();
animate();

function init() {
  clock = new Clock();
  world = new VoxelWorld(16, new Vector3(16, 16, 16));

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0.175, 0.075, 0.175);

  scene = new THREE.Scene();

  // light
  const hemiLight = new THREE.HemisphereLight(0x888888, 0x444444, 1);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
  dirLight.position.set(1.5, 3, 2.5);
  scene.add(dirLight);

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight2.position.set(-1.5, -3, -2.5);
  scene.add(dirLight2);

  // loader
  const loader = new FileLoader();
  loader.setResponseType("arraybuffer");
  loader.load("/models/level.vox", (buffer) => {
    if (buffer instanceof ArrayBuffer) {
      const chunks = readVoxModelChunks(buffer);
      readVoxChunksIntoWorld(chunks, world);

      console.log(world);

      voxelWorldMesh = new VoxelWorldMesh(world);
      scene.add(voxelWorldMesh);

      console.log(scene);
    }
  });

  // renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // controls
  controls = new PointerLockControls(camera, document.body);
  scene.add(controls.getObject());
  document.body.addEventListener("click", () => {
    controls.lock();
  });

  raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 8);

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  const width = window.innerWidth || 1;
  const height = window.innerHeight || 1;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

const velocity = new Vector3();
const direction = new Vector3();
let canJump = true;
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.getObject().position);
    const intersections = raycaster.intersectObjects(voxelWorldMesh.children, false);
    const standingOn = intersections[0];

    velocity.x -= velocity.x * 10 * delta;
    velocity.z -= velocity.z * 10 * delta;

    velocity.y -= 9.8 * 20 * delta;

    const moveForward = keyStates["KeyW"] ?? false;
    const moveBackward = keyStates["KeyS"] ?? false;
    const moveLeft = keyStates["KeyA"] ?? false;
    const moveRight = keyStates["KeyD"] ?? false;
    const jump = keyStates["Space"] ?? false;
    direction.z = Number(moveBackward) - Number(moveForward);
    direction.x = Number(moveLeft) - Number(moveRight);
    direction.normalize();

    if (moveForward || moveBackward) velocity.z += direction.z * 3;
    if (moveLeft || moveRight) velocity.x += direction.x * 2;

    if (canJump && jump) {
      velocity.y = 50;
      canJump = false;
    } else if (standingOn && velocity.y < 0) {
      velocity.y = Math.max(0, velocity.y);
      controls.getObject().position.y = standingOn.point.y + raycaster.far;
      canJump = true;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    controls.getObject().position.y += velocity.y * delta;

    if (controls.getObject().position.y < -1) {
      velocity.y = 0;
      controls.getObject().position.y = 100;
    }
  }

  renderer.render(scene, camera);
}
