import { System } from "ecsy";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { RenderSystem } from "./render";
import { SceneSystem } from "./scene";

export class ControlsSystem extends System {
  controls: PointerLockControls;
  constructor(world, attrs) {
    super(world, attrs);

    const renderer = this.world.getSystem(RenderSystem).renderer;
    const camera = this.world.getSystem(SceneSystem).camera;
    this.controls = new PointerLockControls(camera, document.body);

    renderer.domElement.addEventListener("click", () => {
      this.controls.lock();
    });
  }
  execute(delta: number, time: number): void {}
}
