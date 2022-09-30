import { System } from "ecsy";
import { Movement } from "../components/movement";
import { RemotePlayerTag } from "../components/tags";

export class RemotePlayerMovementSystem extends System {
  execute(delta: number) {
    this.queries.remotePlayers.results.forEach((entity) => {
      const movement = entity.getMutableComponent(Movement);
      if (!movement) return;

      movement.position.addScaledVector(movement.velocity, delta);
    });
  }
}
RemotePlayerMovementSystem.queries = {
  remotePlayers: {
    components: [RemotePlayerTag, Movement],
  },
};
