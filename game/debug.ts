import { getCurrentState } from "./connection";
import { SceneSystem } from "./systems/scene";
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
  };
}
