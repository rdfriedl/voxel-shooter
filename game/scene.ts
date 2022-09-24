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
import { Body, Cylinder, Box, Vec3 } from "cannon-es";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

import { readVoxChunksIntoWorld, readVoxModelChunks } from "../common/utils/vox-loader";
import { VoxelWorld } from "../common/voxel";
import { VoxelWorldMesh } from "./objects/voxel-world-mesh";
import { keyStates } from "./utils/key-states";
import { FIXED_TIME_STEP, physicsWorld } from "./physics";
import { VoxelWorldPhysics } from "./objects/voxel-world-physics";

const stats = Stats();
document.body.appendChild(stats.dom);

const clock = new Clock();
const voxelWorld = new VoxelWorld(16, new Vector3(16, 16, 16));

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

// player object
const playerBody = new Body({
  mass: 50,
  shape: new Cylinder(4, 4, 8),
  fixedRotation: true,
});
playerBody.position.set(10, 100, 10);
physicsWorld.addBody(playerBody);

// Create a plane
var groundBody = new Body({
  mass: 0, // mass == 0 makes the body static
  shape: new Box(new Vec3(20, 1, 20)),
});
physicsWorld.addBody(groundBody);

const voxelWorldPhysics = new VoxelWorldPhysics(physicsWorld, voxelWorld);

function onWindowResize() {
  const width = window.innerWidth || 1;
  const height = window.innerHeight || 1;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}
window.addEventListener("resize", onWindowResize);

animate();

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
    voxelWorldPhysics.addChunkBoxes(new Vector3(0, 0, 0));
  }
});

const raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 8);
const velocity = new Vector3();
const direction = new Vector3();
let canJump = true;
let _vector: Vector3 = new Vector3();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  physicsWorld.step(FIXED_TIME_STEP, delta, 1);

  controls.getObject().position.set(playerBody.position.x, playerBody.position.y, playerBody.position.z);

  if (controls.isLocked === true) {
    //   raycaster.ray.origin.copy(controls.getObject().position);
    //   const intersections = raycaster.intersectObjects(voxelWorldMesh.children, false);
    //   const standingOn = intersections[0];

    //   velocity.x -= velocity.x * 10 * delta;
    //   velocity.z -= velocity.z * 10 * delta;

    //   velocity.y -= 9.8 * 20 * delta;

    const moveForward = keyStates["KeyW"] ?? false;
    const moveBackward = keyStates["KeyS"] ?? false;
    const moveLeft = keyStates["KeyA"] ?? false;
    const moveRight = keyStates["KeyD"] ?? false;
    const jump = keyStates["Space"] ?? false;

    // moveForward = function ( distance ) {
    //   // move forward parallel to the xz-plane
    //   // assumes camera.up is y-up
    //   _vector.setFromMatrixColumn( camera.matrix, 0 );
    //   _vector.crossVectors( camera.up, _vector );
    //   camera.position.addScaledVector( _vector, distance );
    // };

    // this.moveRight = function ( distance ) {

    //   _vector.setFromMatrixColumn( camera.matrix, 0 );

    //   camera.position.addScaledVector( _vector, distance );

    // };

    if (moveForward) playerBody.applyLocalForce(new Vec3(100, 0, 0), new Vec3(0, 0, 0));
    // direction.z = Number(moveBackward) - Number(moveForward);
    // direction.x = Number(moveLeft) - Number(moveRight);
    //   direction.normalize();

    //   if (moveForward || moveBackward) velocity.z += direction.z * 3;
    //   if (moveLeft || moveRight) velocity.x += direction.x * 2;

    //   if (canJump && jump) {
    //     velocity.y = 50;
    //     canJump = false;
    //   } else if (standingOn && velocity.y < 0) {
    //     velocity.y = Math.max(0, velocity.y);
    //     controls.getObject().position.y = standingOn.point.y + raycaster.far;
    //     canJump = true;
    //   }

    //   controls.moveRight(-velocity.x * delta);
    //   controls.moveForward(-velocity.z * delta);

    //   controls.getObject().position.y += velocity.y * delta;

    //   if (controls.getObject().position.y < -1) {
    //     velocity.y = 0;
    //     controls.getObject().position.y = 100;
    //   }
  }

  stats.update();
  renderer.render(scene, camera);
}

if (import.meta.env.DEV) {
  // @ts-ignore
  window.controls = controls;
}
