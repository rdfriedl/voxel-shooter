import { System, Not } from "ecsy";
import { Movement } from "../components/movement";
import { LocalPlayerTag } from "../components/tags";

export class MovementSystem extends System {
  execute(delta: number) {
    this.queries.movable.results.forEach((entity) => {
      const movement = entity.getMutableComponent(Movement);
      if (!movement) return;

      movement.position.addScaledVector(movement.velocity, delta);
    });
  }
}
MovementSystem.queries = {
  movable: {
    components: [Movement, Not(LocalPlayerTag)],
  },
};
