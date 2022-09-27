import {
  Clock,
  DirectionalLight,
  FileLoader,
  HemisphereLight,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

import { readVoxChunksIntoWorld, readVoxModelChunks } from "../common/utils/vox-loader";
import { VoxelWorld } from "../common/voxel";
import { VoxelWorldMesh } from "./objects/voxel-world-mesh";
import { keyStates, mouseButtonStates } from "./utils/key-states";
import { BulletManager } from "../common/bullets/core";
import { BulletTrails } from "./objects/bullet-trails";
import { sendPlayerPosition } from "./connection";

const stats = Stats();
document.body.appendChild(stats.dom);

const clock = new Clock();
const voxelWorld = new VoxelWorld(16, new Vector3(32, 32, 32));

const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0.175, 0.075, 0.175);

const scene = new Scene();

// light
const hemiLight = new HemisphereLight(0x888888, 0x444444, 1);
scene.add(hemiLight);

const dirLight = new DirectionalLight(0xffffff, 0.75);
dirLight.position.set(1.5, 3, 2.5);
scene.add(dirLight);

const dirLight2 = new DirectionalLight(0xffffff, 0.5);
dirLight2.position.set(-1.5, -3, -2.5);
scene.add(dirLight2);

// renderer
const renderer = new WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// controls
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());
document.body.addEventListener("click", () => {
  controls.lock();
});

const bulletManager = new BulletManager(voxelWorld);
const bulletTrails = new BulletTrails(bulletManager);
scene.add(bulletTrails);

// // player object
// const playerBody = new Body({
//   mass: 50,
//   shape: new Sphere(4),
//   fixedRotation: true,
// });
// playerBody.position.set(10, 100, 10);
// physicsWorld.addBody(playerBody);

// // Create a plane
// var groundBody = new Body({
//   mass: 0, // mass == 0 makes the body static
//   shape: new Box(new Vec3(40, 1, 40)),
//   position: new Vec3(20, 0, 20),
// });
// physicsWorld.addBody(groundBody);

// const voxelWorldPhysics = new VoxelWorldPhysics(physicsWorld, voxelWorld);

function onWindowResize() {
  const width = window.innerWidth || 1;
  const height = window.innerHeight || 1;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}
window.addEventListener("resize", onWindowResize);

// loader
const voxelWorldMesh: VoxelWorldMesh = new VoxelWorldMesh(voxelWorld);
scene.add(voxelWorldMesh);

const loader = new FileLoader();
loader.setResponseType("arraybuffer");
loader.load("/models/level.vox", (buffer) => {
  if (buffer instanceof ArrayBuffer) {
    const chunks = readVoxModelChunks(buffer);
    readVoxChunksIntoWorld(chunks, voxelWorld);
    voxelWorldMesh.update();
    // voxelWorldPhysics.addChunkBoxes(new Vector3(0, 0, 0));
  }
});

let canShoot = true;

const raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 10);
const velocity = new Vector3();
const direction = new Vector3();
let canJump = true;
// let _vector: Vector3 = new Vector3();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // physicsWorld.step(FIXED_TIME_STEP, delta, 1);

  // controls.getObject().position.set(playerBody.position.x, playerBody.position.y, playerBody.position.z);

  // move player
  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.getObject().position);
    const intersections = raycaster.intersectObjects(voxelWorldMesh.children, true);
    const standingOn = intersections[0];

    velocity.x -= velocity.x * 10 * delta;
    velocity.z -= velocity.z * 10 * delta;

    velocity.y -= 9.8 * 20 * delta;

    const moveForward = keyStates["KeyW"] ?? false;
    const moveBackward = keyStates["KeyS"] ?? false;
    const moveLeft = keyStates["KeyA"] ?? false;
    const moveRight = keyStates["KeyD"] ?? false;
    const jump = keyStates["Space"] ?? false;

    // const move = new Vector3();
    // if (moveForward || moveBackward) {
    //   _vector.setFromMatrixColumn(camera.matrix, 0);
    //   _vector.crossVectors(camera.up, _vector);
    //   move.addScaledVector(_vector, Number(moveForward) - Number(moveBackward));
    // }
    // if (moveRight || moveLeft) {
    //   _vector.setFromMatrixColumn(camera.matrix, 0);
    //   move.addScaledVector(_vector, Number(moveRight) - Number(moveLeft));
    // }
    // move.normalize().multiplyScalar(20);
    // playerBody.velocity.x = move.x;
    // playerBody.velocity.z = move.z;
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

    if (controls.getObject().position.y < -100) {
      velocity.y = 0;
      controls.getObject().position.y = 100;
    }

    if (mouseButtonStates[0] && canShoot) {
      const v = controls.getDirection(new Vector3());
      v.x += (Math.random() - 0.5) / 20;
      v.y += (Math.random() - 0.5) / 20;
      v.z += (Math.random() - 0.5) / 20;
      v.normalize().multiplyScalar(400);
      bulletManager.createBullet(camera.position, v);
      canShoot = false;
      setTimeout(() => {
        canShoot = true;
      }, 100);
    }
  }

  bulletManager.update(delta);
  bulletTrails.update();
  voxelWorldMesh.update();
  stats.update();
  renderer.render(scene, camera);
}

animate();

// TMP: send updates to server
setInterval(() => {
  sendPlayerPosition(controls.getObject().position, velocity);
}, 1000);

if (import.meta.env.DEV) {
  // @ts-ignore
  window.controls = controls;
}
