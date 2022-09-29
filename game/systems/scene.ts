import { System } from "ecsy";
import { PerspectiveCamera, Scene } from "three";
import { Object3DComponent } from "../components/object3D";

export class SceneSystem extends System {
  scene: Scene = new Scene();
  camera: PerspectiveCamera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
  init() {
    window.addEventListener("resize", this.onWindowResize);
  }
  onWindowResize = () => {
    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };
  execute() {
    this.queries.entities.added?.forEach((entity) => {
      const object = entity.getComponent(Object3DComponent)?.object;
      if (!object) return;
      console.log("adding", object);
      this.scene.add(object);
    });
    this.queries.entities.removed?.forEach((entity) => {
      const object = entity.getComponent(Object3DComponent)?.object;
      if (!object) return;
      console.log("removing", object);
      this.scene.remove(object);
    });
  }
}

SceneSystem.queries = {
  entities: {
    components: [Object3DComponent],
    listen: {
      added: true,
      removed: true,
      changed: [Object3DComponent],
    },
  },
};
