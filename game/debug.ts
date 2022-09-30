import { Entity } from "ecsy";
import { RemotePlayerTag } from "./components/tags";
import { getCurrentState } from "./connection";
import { SceneSystem } from "./systems/scene";
import { VoxelWorldSystem } from "./systems/voxel-world";
import { ExtendedWorld } from "./utils/extended-world";

export function setup(world: ExtendedWorld) {
  const getScene = () => world.getSystem(SceneSystem).scene;
  const getCamera = () => world.getSystem(SceneSystem).camera;

  // @ts-ignore
  window.debug = {
    world,
    get scene() {
      return getScene();
    },
    get camera() {
      return getCamera();
    },
    get player() {
      return world.getEntityByName("Player");
    },
    get schema() {
      return getCurrentState();
    },
    get voxelWorld() {
      return world.getSystem(VoxelWorldSystem).voxelWorld;
    },
    get remotePlayers() {
      return world.getEntities().filter((e: Entity) => e.hasComponent(RemotePlayerTag));
    },
  };
}