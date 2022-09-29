import { System } from "ecsy";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { SceneSystem } from "./scene";

export class ControlsSystem extends System {
  controls: PointerLockControls;
  constructor(world, attrs) {
    super(world, attrs);

    const camera = world.getSystem(SceneSystem).camera;
    this.controls = new PointerLockControls(camera, document.body);

    document.body.addEventListener("click", () => {
      this.controls.lock();
    });
  }
  execute(delta: number, time: number): void {}
}
