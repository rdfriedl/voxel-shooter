import { System } from "ecsy";
import { WebGLRenderer } from "three";
import { SceneSystem } from "./scene";

export class RenderSystem extends System {
  renderer = new WebGLRenderer();
  init() {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener("resize", this.onWindowResize);
  }
  onWindowResize = () => {
    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;

    this.renderer.setSize(width, height);
  };
  execute() {
    const sceneSystem = this.world.getSystem(SceneSystem);
    this.renderer.render(sceneSystem.scene, sceneSystem.camera);
  }
}
