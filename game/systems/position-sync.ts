import { System } from "ecsy";
import { Movement } from "../components/movement";
import { Object3DComponent } from "../components/object3D";

export class PositionSyncSystem extends System {
  execute(delta: number, time: number): void {
    this.queries.objects.results.forEach((entity) => {
      const pos = entity.getComponent(Movement)?.position;
      const object = entity.getComponent(Object3DComponent)?.object;
      if (!pos || !object) return;
      object.position.copy(pos);
    });
  }
}

PositionSyncSystem.queries = {
  objects: {
    components: [Object3DComponent, Movement],
  },
};
