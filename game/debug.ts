import * as THREE from "three";
import { Entity } from "ecsy";
import { RemotePlayerTag } from "./components/tags";
import { getRoom } from "./connection";
import { SceneSystem } from "./systems/scene";
import { VoxelWorldSystem } from "./systems/voxel-world";
import { ExtendedWorld } from "./utils/extended-world";

export function setup(world: ExtendedWorld) {
  window.THREE = THREE;

  const getScene = () => world.getSystem(SceneSystem).scene;
  const getCamera = () => world.getSystem(SceneSystem).camera;

  // @ts-ignore
  window.dev = {
    world,
    get scene() {
      return getScene();
    },
    get state() {
      return getRoom()?.state;
    },
    get camera() {
      return getCamera();
    },
    get player() {
      return world.getEntityByName("Player");
    },
    get schema() {
      return getRoom()?.state;
    },
    get entities() {
      return world.getEntities();
    },
    get nonChunkEntities() {
      return world.getEntities().filter((e) => !e.name.includes("chunk"));
    },
    get voxelWorld() {
      return world.getSystem(VoxelWorldSystem).voxelWorld;
    },
    get remotePlayers() {
      return world.getEntities().filter((e: Entity) => e.hasComponent(RemotePlayerTag));
    },
  };
}
