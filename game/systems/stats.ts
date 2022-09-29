import { System } from "ecsy";
import Stats from "three/examples/jsm/libs/stats.module";

export class StatsSystem extends System {
  stats = Stats();
  init() {
    document.body.appendChild(this.stats.dom);
  }
  execute() {
    this.stats.update();
  }
}
