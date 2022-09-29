import { Clock, DirectionalLight, FileLoader, HemisphereLight, Vector3 } from "three";

// import { readVoxChunksIntoWorld, readVoxModelChunks } from "../common/utils/vox-loader";
import { SceneSystem } from "./systems/scene";
import { Movement } from "./components/movement";
import { BulletTag, InSceneTag, LocalPlayerTag, PlayerCollisionTag, RemotePlayerTag } from "./components/tags";
import { RenderSystem } from "./systems/render";
import { ControlsSystem } from "./systems/controls";
import { StatsSystem } from "./systems/stats";
import { VoxelWorldSystem } from "./systems/voxel-world";
import { Object3DComponent } from "./components/object3D";
import { PositionSyncSystem } from "./systems/position-sync";
import { PlayerMovementSystem } from "./systems/player-movement";
import { ExtendedWorld } from "./utils/extended-world";
import { VoxelWorldSyncSystem } from "./systems/voxel-world-sync";

const world = new ExtendedWorld();

// components
world.registerComponent(Object3DComponent).registerComponent(Movement);

// tags
world
  .registerComponent(BulletTag)
  .registerComponent(LocalPlayerTag)
  .registerComponent(RemotePlayerTag)
  .registerComponent(InSceneTag)
  .registerComponent(PlayerCollisionTag);

// systems
world
  .registerSystem(SceneSystem)
  .registerSystem(ControlsSystem)
  .registerSystem(PlayerMovementSystem)
  .registerSystem(PositionSyncSystem)
  .registerSystem(VoxelWorldSystem)
  .registerSystem(VoxelWorldSyncSystem)
  .registerSystem(RenderSystem, { priority: 999 })
  .registerSystem(StatsSystem, { priority: 1000 });

const player = world
  .createEntity("Player")
  .addComponent(Movement, { position: new Vector3(200, 20, 200) })
  .addComponent(Object3DComponent, { object: world.getSystem(ControlsSystem).controls.getObject() })
  .addComponent(LocalPlayerTag);

const clock = new Clock();

// NOTE: move this out to another system
const scene = world.getSystem(SceneSystem).scene;

// light
const hemiLight = new HemisphereLight(0x888888, 0x444444, 1);
scene.add(hemiLight);

const dirLight = new DirectionalLight(0xffffff, 0.75);
dirLight.position.set(1.5, 3, 2.5);
scene.add(dirLight);

const dirLight2 = new DirectionalLight(0xffffff, 0.5);
dirLight2.position.set(-1.5, -3, -2.5);
scene.add(dirLight2);

// load the map
// const loader = new FileLoader();
// loader.setResponseType("arraybuffer");
// loader.load("/models/level.vox", (buffer) => {
//   if (buffer instanceof ArrayBuffer) {
//     const voxelWorldSystem = world.getSystem(VoxelWorldSystem);
//     const chunks = readVoxModelChunks(buffer);
//     readVoxChunksIntoWorld(chunks, voxelWorldSystem.voxelWorld);
//   }
// });

function animate() {
  const now = new Date().valueOf();
  const delta = clock.getDelta();
  world.execute(delta, now);
  requestAnimationFrame(animate);
}

animate();

if (import.meta.env.DEV) {
  import("./debug").then((m) => m.setup(world));
}
